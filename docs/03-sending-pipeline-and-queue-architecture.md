# ⚙️ 03. Pipeline d'Envoi Asynchrone & Architecture des Files d'Attente

Ce document détaille l'architecture distribuée du moteur d'envoi, le traitement asynchrone orchestré par **Redis et BullMQ**, le protocole de tracking en temps réel, l'analyse des rebonds SMTP et la tolérance aux pannes.

---

## 1. Vue d'Ensemble & Cycle de Vie Asynchrone

Pour garantir une ingestion ultra-rapide ($< 30\text{ms}$), le système sépare strictement **l'acceptation de la requête** (synchrone) de **l'exécution lourde** (asynchrone : compilation, injection de tracking, transport SMTP/SES, webhooks).

> 🎨 **Fichiers sources Draw.io** :
> - **Pipeline & 3 Queues** : [`docs/diagrams/03-pipeline-envoi-queues.drawio`](./diagrams/03-pipeline-envoi-queues.drawio)
> - **Cycle de Vie & Rebonds** : [`docs/diagrams/04-cycle-de-vie-tracking.drawio`](./diagrams/04-cycle-de-vie-tracking.drawio)

```mermaid
sequenceDiagram
    autonumber
    actor Client as Développeur / Client SDK
    participant API as Ingestion API (NestJS)
    participant Mongo as MongoDB
    participant Redis as Redis / BullMQ
    participant Worker as Worker d'Envoi
    participant Transport as Adaptateur Transport (SMTP / SES)
    participant Dest as Destinataire (Boîte Mail)

    Client->>API: POST /v1/emails (Payload JSON + Bearer sk_live_...)
    Note over API: 1. Valide Clé API & Rate-limit<br/>2. Vérifie Idempotency-Key dans Redis<br/>3. Contrôle Suppression List O(1)
    API->>Mongo: Insert Email { status: "queued" }
    API->>Redis: Enqueue Job dans "email-send-queue" (Priorité 1..3)
    API-->>Client: HTTP 202 Accepted { id: "email_...", status: "queued" } (En < 30ms)

    Note over Worker,Redis: Traitement en tâche de fond
    Worker->>Redis: Dépile le job d'envoi
    Worker->>Worker: 1. Compile Template Handlebars<br/>2. Injecte Pixel 1x1 GIF<br/>3. Réécrit les liens pour le suivi de clic
    Worker->>Transport: Envoie le message RFC 5322 (STARTTLS + DKIM)
    Transport-->>Worker: Succès (Provider Message-ID)
    Worker->>Mongo: Update Email { status: "sent", providerMessageId }
    Worker->>Mongo: Insert Event { type: "email.sent" }
    Worker->>Redis: Enqueue Job dans "webhook-dispatch-queue"

    Transport->>Dest: Remise dans la boîte de réception
```

---

## 2. Architecture des 3 Files d'Attente Spécialisées (BullMQ)

```mermaid
flowchart TD
    subgraph INGESTION ["1. Ingestion Synchrone (< 30ms)"]
        API_IN["API Gateway (NestJS)"]
    end

    subgraph QUEUES ["2. Files d'Attente Redis (BullMQ)"]
        Q_SEND["📨 email-send-queue<br/>• Priorité 1: Auth & OTPs<br/>• Priorité 2: Transactionnel<br/>• Priorité 3: Marketing<br/>• Concurrence : 20 workers<br/>• Retries : 3 essais (Backoff exp)"]
        Q_TRACK["👁️ email-track-queue<br/>• Événements Pixel d'ouverture<br/>• Clics sur liens réécrits<br/>• Extraction IP & User-Agent<br/>• Incrément stats atomique"]
        Q_HOOK["🔔 webhook-dispatch-queue<br/>• Appels HTTP POST sortants<br/>• Signature HMAC SHA256<br/>• Retries : 5 essais avec backoff exp"]
        DLQ["☠️ Dead Letter Queue<br/>• Messages en échec irrécupérable<br/>• Audit & Alerte"]
    end

    subgraph WORKERS ["3. Pool de Workers Dédiés"]
        W_SEND["Workers d'Envoi<br/>(Rendu + Transport SMTP/SES)"]
        W_TRACK["Workers d'Analyse<br/>(Persistance Événements & Stats)"]
        W_HOOK["Workers Webhooks<br/>(Dispatch HTTP sortant)"]
    end

    API_IN -->|Job d'envoi| Q_SEND
    Q_SEND --> W_SEND
    W_SEND -->|Si échec permanent| DLQ
    W_SEND -->|Notification d'envoi| Q_HOOK

    TRACK_HTTP["Endpoint Public de Tracking<br/>(/v1/track/open & /v1/track/click)"] -->|Événement brut| Q_TRACK
    Q_TRACK --> W_TRACK
    W_TRACK -->|Déclenche Webhook| Q_HOOK
    Q_HOOK --> W_HOOK
```

### 2.1. Spécification des Files BullMQ

1. **`email-send-queue`** :
   - **Job Payload** : `{ emailId, organizationId, templateId, variables, priority }`.
   - **Concurrence** : 20 workers par instance Node.js.
   - **Stratégie de Retry** :
     - 1ère tentative : Immédiate.
     - 2ème tentative : Après 60 secondes (avec gigue aléatoire de 5s).
     - 3ème tentative : Après 5 minutes.
     - Échec final : Déplacement automatique dans la `Dead Letter Queue`.

2. **`email-track-queue`** :
   - **Job Payload** : `{ emailId, type: "open"|"click", ip, userAgent, url, timestamp }`.
   - **Concurrence** : 50 workers par instance (opérations ultra-légères en base).
   - **Rôle** : Incrémentation atomique MongoDB `$inc: { "stats.openCount": 1 }` et insertion de l'événement dans `email_events`.

3. **`webhook-dispatch-queue`** :
   - **Job Payload** : `{ webhookId, eventType, payload, secret, attempt: 1 }`.
   - **Concurrence** : 15 workers par instance.
   - **Timeout d'appel HTTP** : 5 000 ms.
   - **Retry Schedule** : 1m $\rightarrow$ 5m $\rightarrow$ 30m $\rightarrow$ 2h $\rightarrow$ 8h.

---

## 3. Mécanisme de Télémétrie en Direct (Tracking Engine)

### 3.1. Pixel d'Ouverture Transparent ($1\times 1$ GIF)
Le worker d'envoi injecte automatiquement en fin de balise `</body>` :
```html
<img src="https://track.monplateforme.com/v1/track/open/eyJlbWFpbElkIjoiZW1haWxfMTIzIn0" 
     width="1" height="1" border="0" style="display:none !important;" alt="" />
```

#### Réponse HTTP du Serveur de Tracking
- **Code HTTP** : `200 OK`.
- **Content-Type** : `image/gif`.
- **En-têtes anti-cache** :
  ```http
  Cache-Control: no-store, no-cache, must-revalidate, max-age=0
  Pragma: no-cache
  Expires: 0
  ```
- **Contenu Binaire (43 octets - GIF transparent)** :
  `47 49 46 38 39 61 01 00 01 00 80 00 00 ff ff ff 00 00 00 21 f9 04 01 00 00 00 00 2c 00 00 00 00 01 00 01 00 00 02 02 44 01 00 3b`

### 3.2. Proxy de Redirection des Clics
Tous les liens `href="..."` sont réécrits lors de la compilation :
- **Lien Original** : `<a href="https://acme.com/promo?id=42">Voir la promo</a>`
- **Lien Réécrit** : `<a href="https://track.monplateforme.com/v1/track/click/TOKEN_SIGNE?url=https%3A%2F%2Facme.com%2Fpromo%3Fid%3D42">Voir la promo</a>`

1. L'utilisateur clique sur le lien.
2. Le serveur de tracking reçoit la requête, valide la signature HMAC du token, et publie l'événement dans `email-track-queue`.
3. Le serveur retourne immédiatement un code **HTTP 302 Found** avec l'en-tête `Location: https://acme.com/promo?id=42`.

---

## 4. Gestion des Rebonds (Bounces) & Protection de Réputation

```mermaid
stateDiagram-v2
    [*] --> Queued : Réception API
    Queued --> Sending : Dépilage par le Worker
    Sending --> Sent : Accepté par le relais SMTP
    Sending --> Retry : Erreur temporaire 4xx (Réseau / 421)
    Retry --> Sending : Nouvelle tentative après backoff
    Sending --> Failed : Échec définitif après 3 essais

    Sent --> Delivered : Confirmation de remise au serveur distant
    Delivered --> Opened : Chargement du pixel 1x1
    Opened --> Clicked : Clic sur un lien de l'email

    Sent --> HardBounce : 550 User Unknown (Boîte inexistante)
    Delivered --> SpamComplaint : L'utilisateur signale l'email comme spam

    HardBounce --> AutoSuppression : Ajout immédiat en Liste Noire (SUPPRESSIONS)
    SpamComplaint --> AutoSuppression : Ajout immédiat en Liste Noire (SUPPRESSIONS)
```

### 4.1. Typologie des Erreurs SMTP
1. **Soft Bounces (Codes SMTP 4xx)** : Boîte aux lettres pleine (452), serveur distant temporairement saturé (421).
   - *Traitement* : Re-tentatives espacées sur 24 heures.
2. **Hard Bounces (Codes SMTP 5xx)** : Adresse inexistante (550), domaine invalide (512).
   - *Traitement* : Statut immédiat `bounced`, insertion instantanée dans `suppressions`, émission du webhook `email.bounced`.
3. **Plaintes Spam (Feedback Loops - FBL)** : L'utilisateur clique sur "Signaler comme spam" dans Gmail/Yahoo/Outlook.
   - *Traitement* : Statut immédiat `complained`, inscription irréversible dans `suppressions`, émission du webhook `email.complained`.
