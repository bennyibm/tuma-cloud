# 📋 07. Cahier des Charges Fonctionnel & Technique Maître (CdCF / CDCT)
## Spécification d'Ingénierie Logicielle, Modèle de Données & Architecture Système de Haute Disponibilité

---

## SOMMAIRE GÉNÉRAL DU DOCUMENT MAÎTRE

1. [**VISION STRATÉGIQUE, MISSION & OBJECTIFS DE PERFORMANCE (SLAS / SLOS)**](#1-vision-stratégique-mission--objectifs-de-performance-slas--slos)
2. [**MODÈLE D'ACCÈS, PERSONAS & SÉCURITÉ (RBAC & CORS)**](#2-modèle-daccès-personas--sécurité-rbac--cors)
3. [**SPÉCIFICATION DÉTAILLÉE DES 9 MODULES LOGICIELS & MÉCANISMES D'INGÉNIERIE**](#3-spécification-détaillée-des-9-modules-logiciels--mécanismes-dingénierie)
   - *3.1. Module 1 : Authentification, Clés API & Sécurité (`AuthModule`)*
   - *3.2. Module 2 : Multi-Tenancy & Gestionnaire Atomique de Quotas (`OrganizationsModule`)*
   - *3.3. Module 3 : Domaines & Délivrabilité DNS Cryptographique (`DomainsModule`)*
   - *3.4. Module 4 : Moteur de Templates, Rendu & Inlining CSS (`TemplatesModule`)*
   - *3.5. Module 5 : Ingestion Synchrone & Idempotence Absolue (`EmailsModule`)*
   - *3.6. Module 6 : Ordonnancement Distribué & Files BullMQ (`QueuesModule`)*
   - *3.7. Module 7 : Couche de Transport Pluggable & Protocoles RFC (`TransportersModule`)*
   - *3.8. Module 8 : Télémétrie, Tracking en Direct & Filtre Anti-Scanners (`TrackingModule`)*
   - *3.9. Module 9 : Dispatcher de Webhooks Sortants & Signatures HMAC (`WebhooksModule`)*
4. [**CATALOGUE EXHAUSTIF DES CONTRATS D'API REST & SCHÉMAS D'ERREURS RFC 7807**](#4-catalogue-exhaustif-des-contrats-dapi-rest--schémas-derreurs-rfc-7807)
5. [**MODÈLE DE DONNÉES MONGODB COMPLET & STRATÉGIE D'INDEXATION DE POINTE**](#5-modèle-de-données-mongodb-complet--stratégie-dindexation-de-pointe)
6. [**ORCHESTRATION DISTRIBUÉE DE BOUT EN BOUT (DIAGRAMMES DE SÉQUENCE & ÉTATS)**](#6-orchestration-distribuée-de-bout-en-bout-diagrammes-de-séquence--états)
7. [**INFRASTRUCTURE RUNTIME, CONFIGURATION DOCKER & ENVIRONNEMENT**](#7-infrastructure-runtime-configuration-docker--environnement)
8. [**MODÈLE DE MENACES DE SÉCURITÉ, PARADE OWASP & CONFORMITÉ**](#8-modèle-de-menaces-de-sécurité-parade-owasp--conformité)
9. [**PLAN DE RECETTE D'INGÉNIERIE, TESTS DE CHARGE K6 & CRITÈRES D'ACCEPTATION**](#9-plan-de-recette-dingénierie-tests-de-charge-k6--critères-dacceptation)

---

## 1. Vision Stratégique, Mission & Objectifs de Performance (SLAs / SLOs)

### 1.1. Énoncé de Mission
Concevoir et exploiter une infrastructure logicielle de communication cloud unifiée (**CPaaS**) hautement distribuée, capable d'ingérer et d'expédier de manière asynchrone des centaines de millions d'emails transactionnels avec une latence d'ingestion strictement inférieure à **30 millisecondes**, une garantie d'idempotence absolue (*Exactly-Once Processing*), une délivrabilité en boîte de réception certifiée par cryptographie (DKIM RSA 2048, SPF, DMARC), et une intégration native des moyens de paiement locaux africains (**Mobile Money & Cartes bancaires**).

### 1.2. Niveaux de Service d'Ingénierie Stricts (SLAs & SLOs)

```
┌─────────────────────────────────────────────────────────────┬──────────────────────────────────────────┐
│ Indicateur de Performance / Fiabilité                       │ Engagement d'Ingénierie Strict           │
├─────────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ Latence d'ingestion API (POST /v1/emails)                   │ P95 < 30 ms  |  P99 < 50 ms              │
│ Latence de réponse Pixel Tracking (1x1 transparent GIF)     │ P95 < 5 ms   |  P99 < 10 ms              │
│ Latence de redirection Proxy de Clics (HTTP 302)            │ P95 < 8 ms   |  P99 < 15 ms              │
│ Débit nominal d'ingestion initial (Cluster 4 nœuds)         │ >= 1 000 requêtes / seconde              │
│ Capacité de charge en pic (Burst Capacity)                  │ >= 3 500 requêtes / seconde              │
│ Taux de disponibilité mensuel garanti (Uptime SLA)          │ 99,95 % d'Uptime                         │
│ Taux de perte de message admissible                         │ 0 % (Persistance AOF Redis + MongoDB)    │
│ Taux de faux positifs sur Idempotence                       │ 0 % (Verrou distribué SHA-256)           │
└─────────────────────────────────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 2. Modèle d'Accès, Personas & Sécurité (RBAC & CORS)

```mermaid
flowchart TD
    subgraph IDENTITIES ["Gestion des Identités & Types d'Accès"]
        K_SEC["🔑 Clé Secrète (sk_live_...)<br/>• Usage : Serveurs Backend, Microservices, Edge Functions<br/>• Sécurité : Hachage Argon2id, IP Whitelisting optionnel<br/>• Droits : Envoi illimité, CRUD Domaines, Templates, Webhooks"]
        K_PUB["🌐 Clé Publique (pk_live_...)<br/>• Usage : Navigateurs Web (SPA), Mobile Apps, Formulaires<br/>• Sécurité : Whitelist CORS stricte, Honeypot, Turnstile Captcha<br/>• Droits : Envoi restreint sur Templates validés uniquement"]
        K_DASH["💻 Session Administrateur (JWT)<br/>• Usage : Dashboard React d'Administration<br/>• Droits : Gestion Organisation, Facturation, Membres, Audit Logs"]
    end
```

### 2.1. Explication Détaillée des Deux Modes d'Intégration
1. **Le Modèle Backend (Style Resend)** :
   - *Fonctionnement* : Le serveur de l'application cliente effectue un appel direct `POST /v1/emails` en fournissant une clé secrète `sk_live_...`.
   - *Contrôle de Sécurité* : La clé secrète n'est jamais exposée publiquement. Elle donne accès à l'envoi de contenu HTML arbitraire ou à l'utilisation de templates dynamiques, ainsi qu'à la configuration des webhooks et des domaines DNS.
2. **Le Modèle Frontend Sans Serveur (Style EmailJS)** :
   - *Fonctionnement* : Un formulaire web (React, Vue, HTML standard) ou une application mobile soumet directement les champs saisis vers `POST /v1/client/send` avec une clé publique `pk_live_...`.
   - *Contrôles de Sécurité Obligatoires* :
     - *Whitelist CORS* : Rejet immédiat si l'en-tête `Origin` ne correspond pas aux domaines enregistrés.
     - *Templates Verrouillés* : Le client ne peut pas choisir l'adresse d'expédition ni rédiger du HTML arbitraire ; il injecte uniquement des variables dans un template pré-validé.
     - *Anti-Abus* : Vérification d'un champ piège invisible (*Honeypot*) et d'un jeton Cloudflare Turnstile / reCAPTCHA.

---

## 3. Spécification Détaillée des 9 Modules Logiciels & Mécanismes d'Ingénierie

```mermaid
flowchart TD
    subgraph ARCHITECTURE_BACKEND ["Architecture Modulaire NestJS Découplée"]
        M1["1. AuthModule<br/>• Clés sk_ / pk_<br/>• Hash Argon2id<br/>• CORS Origin Guard<br/>• Rate Limit Token Bucket"]
        M2["2. OrganizationsModule<br/>• Multi-tenancy<br/>• Quotas atomiques Redis<br/>• Facturation & Soldes"]
        M3["3. DomainsModule<br/>• Clés DKIM RSA 2048<br/>• SPF Return-Path CNAME<br/>• Poller DNS Asynchrone"]
        M4["4. TemplatesModule<br/>• Handlebars AST Compiler<br/>• Inlining CSS & Minification<br/>• Plain-Text Fallback Auto"]
        M5["5. EmailsModule<br/>• Ingestion synchrone < 30ms<br/>• Idempotence 24h<br/>• Suppression Guard O(1)"]
        M6["6. QueuesModule<br/>• 3 Files BullMQ dédiées<br/>• Priorités 1..3<br/>• Retries exp & DLQ"]
        M7["7. TransportersModule<br/>• Mailpit (Local Dev)<br/>• AWS SES API v2 (Prod)<br/>• SmtpRelay (Fallback)"]
        M8["8. TrackingModule<br/>• Pixel 1x1 GIF (< 5ms)<br/>• Proxy Clics HTTP 302<br/>• Filtre Antivirus/Bots"]
        M9["9. WebhooksModule<br/>• Signature HMAC SHA256<br/>• 5 Retries exponentiels<br/>• Audit Logs HTTP"]
    end

    M1 --> M5
    M2 --> M5
    M3 --> M5
    M4 --> M5
    M5 --> M6
    M6 --> M7
    M6 --> M8
    M8 --> M9
```

---

### 3.1. Module 1 : Authentification, Clés API & Sécurité (`AuthModule`)

#### Énoncé du Fonctionnement
L'`AuthModule` est la première ligne de défense de la plateforme. Il intercepte chaque requête entrante avant d'atteindre les contrôleurs métier pour valider l'identité du client, vérifier ses autorisations, limiter son débit d'appels et filtrer les origines suspectes.

#### Mécanismes d'Ingénierie Détaillés
1. **Algorithme de Validation Cryptographique des Clés** :
   - Lorsqu'une clé est créée, le système génère un token aléatoire de 32 octets encodé en hexadécimal, préfixé par `sk_live_` ou `pk_live_`.
   - La clé brute est affichée **une seule fois** à l'utilisateur. En base de données, seule son empreinte cryptographique hachée avec **Argon2id** est persistée (paramètres : `memoryCost: 65536` [64 Mo], `timeCost: 3`, `parallelism: 4`).
   - Lors d'une requête, l'empreinte est validée en temps constant via la primitive `crypto.timingSafeEqual` afin de neutraliser toute tentative d'attaque par canal auxiliaire (*Timing Attacks*).
2. **Algorithme de Limitation de Débit (*Token Bucket avec Fenêtre Glissante*)** :
   - Implémenté sous Redis via un script Lua atomique pour éliminer les *race conditions*.
   - Clés secrètes : Capacité du seau = 200 jetons, taux de remplissage = 100 jetons/seconde.
   - Clés publiques : Capacité du seau = 10 jetons, taux de remplissage = 1 jeton toutes les 6 secondes par adresse IP.
   - En cas de dépassement, le serveur retourne un code `429 Too Many Requests` accompagné des en-têtes RFC 6585 : `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

---

### 3.2. Module 2 : Multi-Tenancy & Gestionnaire Atomique de Quotas (`OrganizationsModule`)

#### Énoncé du Fonctionnement
Ce module garantit l'étanchéité absolue des données entre clients et gère le décompte en temps réel des quotas d'emails consommés.

#### Mécanismes d'Ingénierie Détaillés
1. **Cloisonnement Logique Multi-Tenant** :
   - Aucun document n'est lu ou écrit sans la présence explicite du champ `organizationId`. Un plugin global Mongoose injecte automatiquement la condition `{ organizationId: request.organizationId }` sur l'ensemble des opérations CRUD.
2. **Gestionnaire de Solde et Quotas en Temps Réel** :
   - Le système maintient dans Redis une clé de compteur atomique : `org:{orgId}:quota:{YYYY-MM}`.
   - À chaque ingestion acceptée, la commande Redis `INCR` est exécutée en $O(1)$.
   - Si la valeur dépasse la somme `(quotaMensuelInclus + soldeCreditsPrepayes)`, la requête est immédiatement rejetée avec le message explicite : *"Monthly email quota exhausted. Please top up your prepaid credits via Mobile Money or upgrade your plan."*

---

### 3.3. Module 3 : Domaines & Délivrabilité DNS Cryptographique (`DomainsModule`)

#### Énoncé du Fonctionnement
Pour que les emails n'atterrissent jamais dans les dossiers spam de Gmail, Microsoft Outlook ou Yahoo, ce module gère l'authentification cryptographique complète du domaine émetteur.

#### Mécanismes d'Ingénierie Détaillés
1. **Génération de Paires de Clés DKIM (RFC 6376)** :
   - Le système génère une paire de clés asymétriques **RSA 2048 bits** (avec exposant public $e = 65537$).
   - La clé privée est chiffrée au repos dans MongoDB avec l'algorithme symétrique **AES-256-GCM** à l'aide d'une clé maîtresse de coffre-fort (*Master Key Vault*).
   - La clé publique est encodée en Base64 et formatée pour l'enregistrement DNS `TXT` :
     ```text
     Nom d'hôte : resend._domainkey.mail.mondomaine.com
     Type       : TXT
     Valeur     : v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
     ```
2. **Configuration Return-Path / SPF (RFC 7208)** :
   - Permet d'isoler l'adresse technique de rebond du domaine principal :
     ```text
     Nom d'hôte : bounces.mail.mondomaine.com
     Type       : CNAME
     Valeur     : feedback.monplateforme.com
     ```
3. **Politique DMARC (RFC 7489)** :
   - Configuration de la politique d'alignement du domaine :
     ```text
     Nom d'hôte : _dmarc.mail.mondomaine.com
     Type       : TXT
     Valeur     : v=DMARC1; p=none; rua=mailto:dmarc-reports@monplateforme.com
     ```
4. **Vérificateur DNS Asynchrone (*DNS Poller Worker*)** :
   - Un processus d'arrière-plan interroge récursivement les serveurs DNS de référence via la bibliothèque native `dns.promises.resolveTxt` et `resolveCname`.
   - Dès que l'ensemble des 3 enregistrements est validé, le statut du domaine bascule automatiquement de `pending` à `verified`.

---

### 3.4. Module 4 : Moteur de Templates, Rendu & Inlining CSS (`TemplatesModule`)

#### Énoncé du Fonctionnement
Ce module transforme des gabarits dynamiques réutilisables en code HTML ultra-optimisé, compatible avec tous les moteurs de rendu de messagerie archaïques (comme le moteur Word de Microsoft Outlook sur Windows).

#### Mécanismes d'Ingénierie Détaillés
1. **Compilation AST Handlebars.js** :
   - Les gabarits sont pré-compilés sous forme d'arbres de syntaxe abstraite (AST) en mémoire cache.
   - Support des balises d'interpolation sécurisée `{{nom}}`, des structures conditionnelles `{{#if remise}}` et des boucles `{{#each articles}}`.
2. **Validation Stricte des Schémas de Variables** :
   - Si le template déclare `requiredVariables: ["userName", "activationLink"]` et que la requête API omet `activationLink`, l'appel est rejeté en code `422 Unprocessable Entity` avec la liste exacte des champs manquants avant toute tentative de rendu.
3. **Inlining CSS Automatique & Minification** :
   - Analyse du DOM HTML et conversion systématique des règles CSS contenues dans `<style>` en attributs inline `style="..."` sur chaque balise HTML correspondante.
   - Minification du code HTML (suppression des sauts de ligne inutiles et des commentaires) pour réduire le poids du message sous la limite critique des 102 Ko de Gmail (au-delà de laquelle Gmail tronque le message avec la mention *"Message tronqué"*).
4. **Génération Automatique du Corps Texte Brut** :
   - Extraction automatique des textes du HTML pour constituer la version `text/plain` conforme à la norme MIME multipart/alternative (**RFC 2046**).

---

### 3.5. Module 5 : Ingestion Synchrone & Idempotence Absolue (`EmailsModule`)

#### Énoncé du Fonctionnement
C'est le point d'entrée principal de la plateforme. Il reçoit le message, garantit qu'il ne sera jamais expédié en double, vérifie que le destinataire n'est pas blacklisté, enregistre le message et répond en moins de **30 ms**.

#### Mécanismes d'Ingénierie Détaillés
1. **Protocole d'Idempotence Exactly-Once (Redis Lock)** :
   - Lorsque le client fournit l'en-tête `Idempotency-Key: 7b9f8e21-...`, le système calcule une empreinte SHA-256 combinant `(organizationId + idempotencyKey + sha256(payload))`.
   - Il exécute la commande atomique : `SET idemp:{keyHash} {emailId} NX EX 86400` (verrou d'une durée de 24h).
   - Si la clé existe déjà, le serveur charge immédiatement l'enregistrement existant et retourne la même réponse HTTP 202 d'origine sans recréer de tâche d'envoi.
2. **Garde de Suppression Préventif en $O(1)$** :
   - Le système interroge la table de hachage en mémoire des adresses rejetées (`suppressions`). Si le destinataire s'y trouve (suite à un hard bounce antérieur ou une plainte spam), la requête est immédiatement avortée avec le code `422 Recipient Suppressed`.
3. **Persistance Initiale & Réponse Synchrone** :
   - Le document est inséré dans MongoDB avec l'état `queued`.
   - Le job est déposé dans Redis (`email-send-queue`).
   - Le client reçoit immédiatement `HTTP 202 Accepted` avec le payload `{ id: "email_...", status: "queued" }`.

---

### 3.6. Module 6 : Ordonnancement Distribué & Files BullMQ (`QueuesModule`)

#### Énoncé du Fonctionnement
Ce module orchestre l'exécution asynchrone découplée à travers trois files d'attente spécialisées hébergées sur Redis, empêchant toute saturation de la plateforme lors des pics de trafic.

#### Mécanismes d'Ingénierie Détaillés
1. **Les 3 Files d'Attente Spécialisées** :
   - `email-send-queue` : Gère la compilation et l'expédition SMTP/SES. Concurrence : **20 workers**. Priorité 1 (OTPs/Mots de passe) $\rightarrow$ Priorité 2 (Transactionnel) $\rightarrow$ Priorité 3 (Marketing).
   - `email-track-queue` : Traite les événements bruts de tracking (ouvertures, clics). Concurrence : **50 workers**.
   - `webhook-dispatch-queue` : Expédie les notifications HTTP sortantes vers les serveurs des clients. Concurrence : **15 workers**.
2. **Formule Mathématique de Re-tentative avec Gigue (*Exponential Backoff with Jitter*)** :
   Pour éviter l'effet de troupeau (*Thundering Herd Effect*) sur les serveurs SMTP distants en cas de panne temporaire, le délai $D$ avant la tentative $n$ est calculé selon la formule :
   $$D(n) = \min\left(D_{\max},\; D_{\text{base}} \times 2^{n-1}\right) + \text{Random}(0, \text{Jitter})$$
   *(avec $D_{\text{base}} = 60\text{ s}$, $D_{\max} = 900\text{ s}$ et $\text{Jitter} = 10\text{ s}$)*.
3. **Gestion de la Dead Letter Queue (DLQ)** :
   - Tout job qui échoue après l'épuisement de ses 3 tentatives est déplacé dans la DLQ avec le motif d'erreur exact et une alerte est transmise au canal de surveillance.

---

### 3.7. Module 7 : Couche de Transport Pluggable & Protocoles RFC (`TransportersModule`)

#### Énoncé du Fonctionnement
Ce module abstrait le protocole d'expédition réel grâce au patron de conception **Adaptateur**, permettant de basculer en toute transparence entre l'environnement de test local, AWS SES et des relais SMTP d'entreprise.

#### Mécanismes d'Ingénierie Détaillés
1. **L'Interface Commune (`ITransporterAdapter`)** :
   ```typescript
   export interface SendEmailOptions {
     from: string;
     to: string[];
     cc?: string[];
     bcc?: string[];
     replyTo?: string;
     subject: string;
     html: string;
     text: string;
     headers: Record<string, string>;
     attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
   }

   export interface SendEmailResult {
     providerMessageId: string;
     provider: 'mailpit' | 'aws_ses' | 'smtp_relay';
     rawResponse: unknown;
   }

   export interface ITransporterAdapter {
     send(options: SendEmailOptions): Promise<SendEmailResult>;
     verifyConnection(): Promise<boolean>;
   }
   ```
2. **Les 3 Adaptateurs Implémentés** :
   - `MailpitAdapter` : Connecté sur `localhost:1025` pour le développement local sans coût.
   - `AwsSesAdapter` : Connecté à l'API AWS SES v2 via `@aws-sdk/client-ses` pour une livraison industrielle à grande échelle.
   - `SmtpRelayAdapter` : Connecteur universel Nodemailer avec pool de connexions persistantes, commande `STARTTLS` forcée et chiffrement TLS 1.3.

---

### 3.8. Module 8 : Télémétrie, Tracking en Direct & Filtre Anti-Scanners (`TrackingModule`)

#### Énoncé du Fonctionnement
Ce module enregistre en direct l'engagement des destinataires (ouvertures d'emails et clics sur les liens) tout en éliminant les faux signaux générés par les robots antivirus d'entreprises.

#### Mécanismes d'Ingénierie Détaillés
1. **Pixel d'Ouverture Transparent ($1\times 1$ GIF Binaire)** :
   - Injection de la balise `<img src="https://track.monplateforme.com/v1/track/open/:token" width="1" height="1" style="display:none !important;" />`.
   - Le token est un jeton signé HMAC contenant `{ emailId, organizationId }`.
   - Le serveur répond en moins de **5 ms** avec le flux d'octets binaire exact du standard GIF89a (43 octets) :
     ```text
     HEX : 47 49 46 38 39 61 01 00 01 00 80 00 00 ff ff ff 00 00 00 21 f9 04 01 00 00 00 00 2c 00 00 00 00 01 00 01 00 00 02 02 44 01 00 3b
     ```
   - En-têtes HTTP de non-mise en cache stricts :
     ```http
     Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
     Pragma: no-cache
     Expires: 0
     ```
2. **Proxy de Redirection Sécurisé des Clics** :
   - Tous les liens `<a href="https://acme.com/promo">` sont réécrits en :
     `https://track.monplateforme.com/v1/track/click/:signedToken?url=https%3A%2F%2Facme.com%2Fpromo`.
   - Lors du clic, le serveur valide la signature cryptographique du token, consigne l'événement `email.clicked` dans Redis et émet immédiatement une redirection **HTTP 302 Found** vers l'URL d'origine.
3. **Algorithme Heuristique de Détection des Scanners Antivirus** :
   - *Règle 1 (Seuil Temporel)* : Tout clic ou ouverture survenant moins de **150 millisecondes** après l'envoi SMTP est étiqueté comme `bot_scanner` et exclu des compteurs de conversion officiels.
   - *Règle 2 (Signatures d'Agents)* : Filtrage des User-Agents connus de passerelles de sécurité d'entreprises (Proofpoint, Barracuda, Microsoft ATP Link Scan).

---

### 3.9. Module 9 : Dispatcher de Webhooks Sortants & Signatures HMAC (`WebhooksModule`)

#### Énoncé du Fonctionnement
Dès qu'un événement survient (`email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`), ce module expédie une requête HTTP POST sécurisée vers les serveurs des clients.

#### Mécanismes d'Ingénierie Détaillés
1. **Signature Cryptographique HMAC SHA256 (`Resend-Signature`)** :
   - Pour empêcher l'usurpation d'événements par des attaquants tiers, chaque requête webhook est signée avec le secret partagé du webhook client (`whsec_...`).
   - Construction de la charge signée : `signedPayload = timestamp + "." + jsonRawBody`.
   - Calcul : `signature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex')`.
   - En-tête HTTP transmis : `Resend-Signature: t=1724750400,v1=9a8b7c6d5e4f3a2b1c0d...`.
2. **Protection Anti-Rejeu (*Replay Attack Prevention*)** :
   - Les clients comparent le timestamp `t` à l'heure courante : si $|t_{\text{actuel}} - t| > 300\text{ secondes}$ (5 minutes), la requête doit être rejetée.
3. **Plan de Re-tentatives Échelonné (*5-Step Retry Schedule*)** :
   - Si le serveur client retourne un code d'erreur HTTP `5xx` ou subit un timeout ($> 5\text{ s}$) :
     - Essai 1 : Immédiat.
     - Essai 2 : Après 1 minute.
     - Essai 3 : Après 5 minutes.
     - Essai 4 : Après 30 minutes.
     - Essai 5 : Après 2 heures.

---

## 4. Catalogue Exhaustif des Contrats d'API REST & Schémas d'Erreurs RFC 7807

### 4.1. Ingestion Backend : `POST /v1/emails`

#### Requête HTTP Complète
```http
POST /v1/emails HTTP/1.1
Host: api.monplateforme.com
Authorization: Bearer sk_live_EXAMPLE_KEY_FOR_DOCUMENTATION_ONLY
Idempotency-Key: 7b9f8e21-0a4b-4f92-9e8a-81a123bc45de
Content-Type: application/json

{
  "from": "Acme Notifications <notifications@mail.acme.com>",
  "to": ["alexandre@example.com"],
  "cc": ["manager@example.com"],
  "bcc": [],
  "reply_to": "support@acme.com",
  "subject": "Confirmation de votre commande #{{orderId}}",
  "template": "order-confirmation",
  "variables": {
    "orderId": "CMD-8832",
    "clientName": "Alexandre",
    "totalAmount": "150.00 $"
  },
  "attachments": [
    {
      "filename": "facture_CMD-8832.pdf",
      "content": "JVBERi0xLjQKJcfsj6IKMSAwIG9iago8PA...",
      "contentType": "application/pdf"
    }
  ],
  "tags": [
    { "name": "category", "value": "orders" },
    { "name": "environment", "value": "production" }
  ]
}
```

#### Réponse HTTP 202 Accepted (Succès)
```json
{
  "id": "email_66ce2b7f1a2b3c4d5e6f7a8b",
  "from": "notifications@mail.acme.com",
  "to": ["alexandre@example.com"],
  "status": "queued",
  "createdAt": "2026-08-27T10:30:00.000Z"
}
```

#### Réponse HTTP 422 Unprocessable Entity (Erreur RFC 7807)
```json
{
  "type": "https://api.monplateforme.com/errors/suppressed-recipient",
  "title": "Recipient Suppressed",
  "status": 422,
  "detail": "The recipient 'invalid@example.com' is on the suppression list due to a previous hard bounce.",
  "instance": "/v1/emails"
}
```

---

### 4.2. Ingestion Frontend Sans Serveur : `POST /v1/client/send`

```http
POST /v1/client/send HTTP/1.1
Host: api.monplateforme.com
Origin: https://monclient.com
Content-Type: application/json

{
  "publicKey": "pk_live_123456789abcdef012345678",
  "template": "contact-form",
  "variables": {
    "clientEmail": "visiteur@domaine.com",
    "clientName": "Jean Dupont",
    "clientMessage": "Bonjour, je souhaite un devis pour votre offre Pro."
  },
  "turnstileToken": "0.XXXXXX.YYYYYY..."
}
```

---

## 5. Modèle de Données MongoDB Complet & Stratégie d'Indexation de Pointe

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ API_KEYS : "possède"
    ORGANIZATIONS ||--o{ DOMAINS : "enregistre"
    ORGANIZATIONS ||--o{ TEMPLATES : "crée"
    ORGANIZATIONS ||--o{ EMAILS : "envoie"
    ORGANIZATIONS ||--o{ SUPPRESSIONS : "gère"
    ORGANIZATIONS ||--o{ WEBHOOKS : "configure"

    DOMAINS ||--o{ EMAILS : "authentifie l'expéditeur"
    TEMPLATES ||--o{ EMAILS : "fournit le gabarit"

    EMAILS ||--o{ EMAIL_EVENTS : "génère"
    EMAIL_EVENTS ||--o{ WEBHOOK_DELIVERIES : "déclenche"
    WEBHOOKS ||--o{ WEBHOOK_DELIVERIES : "reçoit"

    ORGANIZATIONS {
        ObjectId id PK
        String nom
        String slug
        String plan_tarifaire
        Number quota_mensuel
        Number emails_envoyes
        Date date_creation
    }

    API_KEYS {
        ObjectId id PK
        ObjectId organization_id FK
        String type_cle "secret | public"
        String prefixe "sk_live_... | pk_live_..."
        String hash_cle
        Array origines_autorisees "CORS Whitelist"
        Array permissions
        Boolean actif
    }

    DOMAINS {
        ObjectId id PK
        ObjectId organization_id FK
        String nom_domaine "ex: mail.acme.com"
        String statut "pending | verified | failed"
        Object cles_dkim
        Object enregistrement_spf
        Object return_path_cname
        Object dmarc
        Date verifie_le
    }

    TEMPLATES {
        ObjectId id PK
        ObjectId organization_id FK
        String nom
        String identifiant_slug "ex: reset-password"
        String sujet_par_defaut
        String corps_html
        Array variables_requises
    }

    EMAILS {
        ObjectId id PK
        ObjectId organization_id FK
        ObjectId domain_id FK
        ObjectId template_id FK
        String expediteur_from
        Array destinataires_to
        String sujet
        String statut "queued | sending | sent | delivered | bounced | failed"
        String id_idempotence "anti-doublon"
        String id_message_fournisseur
        Object compteurs_ouvertures_clics
        Date date_envoi
    }

    EMAIL_EVENTS {
        ObjectId id PK
        ObjectId email_id FK
        ObjectId organization_id FK
        String type_evenement "queued | sent | delivered | opened | clicked | bounced"
        String destinataire
        Object metadonnees "ip, user_agent, url_cliquee, raison_rebond"
        Date horodatage
    }

    SUPPRESSIONS {
        ObjectId id PK
        ObjectId organization_id FK
        String email_bloque
        String raison "hard_bounce | plainte_spam | desinscription"
        ObjectId source_email_id FK
        Date date_blocage
    }

    WEBHOOKS {
        ObjectId id PK
        ObjectId organization_id FK
        String url_destination
        String secret_signature
        Array evenements_abonnes
        Boolean actif
    }

    WEBHOOK_DELIVERIES {
        ObjectId id PK
        ObjectId webhook_id FK
        ObjectId event_id FK
        String statut "succes | echec | en_retentative"
        Number code_http
        Number tentatives
        Date prochaine_tentative
    }
```

### 5.1. Matrice des Index de Performance et Justifications d'Ingénierie

| Collection | Spécification Technique de l'Index | Type d'Index | Justification d'Ingénierie |
| :--- | :--- | :--- | :--- |
| `api_keys` | `{ keyHash: 1 }` | B-Tree Haché | Authentification de chaque requête en $< 1\text{ ms}$. |
| `emails` | `{ organizationId: 1, idempotencyKey: 1 }` | Unique / Sparse | Garantie absolue anti-doublon (*Exactly-Once*). |
| `emails` | `{ organizationId: 1, createdAt: -1 }` | Composé Décroissant | Pagination ultra-rapide des logs sur la console web. |
| `suppressions`| `{ organizationId: 1, email: 1 }` | Unique Composé | Vérification préventive en $O(1)$ à l'ingestion. |
| `domains` | `{ organizationId: 1, name: 1 }` | Unique Composé | Unicité du domaine d'expédition par organisation. |
| `email_events`| `{ emailId: 1, timestamp: 1 }` | Composé Chronologique | Reconstruction instantanée de la timeline d'un email. |
| `email_events`| `{ timestamp: 1 }` *(expireAfterSeconds: 7776000)* | TTL Index (90 jours) | Purge automatique des logs historiques sans charge batch. |

---

## 6. Orchestration Distribuée de Bout en Bout (Diagrammes de Séquence & États)

```mermaid
sequenceDiagram
    autonumber
    actor ClientApp as Application Cliente (Backend / Formulaire)
    participant API as Ingestion API (NestJS)
    participant Mongo as MongoDB
    participant Redis as Redis / BullMQ
    participant Worker as Worker d'Envoi
    participant Trans as Transporteur (SMTP/SES)
    participant Recipient as Destinataire (Boîte Mail)
    participant TrackSrv as Serveur Tracking
    participant WebhookSrv as Webhook Worker

    ClientApp->>API: POST /v1/emails (Auth, Idempotence, Payload)
    Note over API: 1. Valide Clé API + CORS + Quota<br/>2. Contrôle anti-doublon Idempotency-Key<br/>3. Rejet préventif O(1) si Email Blacklisté
    API->>Mongo: Insert Email (status: "queued")
    API->>Redis: Enqueue Job dans "email-send-queue"
    API-->>ClientApp: HTTP 202 Accepted { id: "email_...", status: "queued" } (En < 30ms !)

    Note over Worker,Redis: Découplage Asynchrone
    Worker->>Redis: Déqueue Job d'envoi
    Worker->>Worker: Compile Handlebars + Injecte Pixel 1x1 + Wrap Liens
    Worker->>Trans: Dispatch RFC 5322 (DKIM signé)
    Trans-->>Worker: Succès (Provider Message-ID)
    Worker->>Mongo: Update Email (status: "sent") & Event ("email.sent")
    Worker->>Redis: Enqueue Job dans "webhook-dispatch-queue"

    Trans->>Recipient: Remise en boîte de réception
    Recipient->>TrackSrv: GET /v1/track/open/:token (Pixel chargé)
    TrackSrv-->>Recipient: GIF transparent 1x1 (< 5ms)
    TrackSrv->>Redis: Enqueue Job dans "email-track-queue"
    
    Recipient->>TrackSrv: GET /v1/track/click/:token?dest=... (Clic)
    TrackSrv-->>Recipient: Redirection HTTP 302 vers l'URL d'origine
    TrackSrv->>Redis: Enqueue Job dans "email-track-queue"

    WebhookSrv->>Redis: Déqueue Webhook Job
    WebhookSrv->>ClientApp: POST https://client.com/webhook (Payload signé HMAC SHA256)
    WebhookSrv->>Mongo: Insert WebhookDelivery (Code HTTP & Latence)
```

---

## 7. Infrastructure Runtime, Configuration Docker & Environnement

### 7.1. Fichier `docker-compose.yml` (Environnement Local de Développement)

```yaml
version: '3.8'

services:
  # Base de données MongoDB 7
  mongodb:
    image: mongo:7.0
    container_name: email_platform_mongodb
    restart: always
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_DATABASE: email_platform
    volumes:
      - mongo_data:/data/db

  # Interface Web d'Exploration MongoDB
  mongo-express:
    image: mongo-express:latest
    container_name: email_platform_mongo_express
    restart: always
    ports:
      - '8081:8081'
    environment:
      ME_CONFIG_MONGODB_SERVER: mongodb
      ME_CONFIG_BASICAUTH: 'false'
    depends_on:
      - mongodb

  # Cache In-Memory & Files BullMQ
  redis:
    image: redis:7.2-alpine
    container_name: email_platform_redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  # Serveur SMTP Local & Visualiseur Web (Mailpit)
  mailpit:
    image: axllent/mailpit:latest
    container_name: email_platform_mailpit
    restart: always
    ports:
      - '1025:1025' # Port SMTP d'envoi
      - '8025:8025' # Interface Web de prévisualisation
    environment:
      MP_MAX_MESSAGES: 500

volumes:
  mongo_data:
  redis_data:
```

---

## 8. Modèle de Menaces de Sécurité, Parade OWASP & Conformité

```
┌─────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┐
│ Vecteur de Menace Identifié                                 │ Contre-Mesure d'Ingénierie Formelle                   │
├─────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 1. Injection d'En-têtes SMTP (CRLF Injection)               │ Épuration stricte des séquences \r et \n dans headers │
│ 2. Attaque par Canal Auxiliaire sur Clés API (Timing Attack)│ crypto.timingSafeEqual en temps constant              │
│ 3. Compromission de Clé Secrète en Base de Données          │ Hachage irréversible Argon2id (64 Mo de mémoire)      │
│ 4. Attaque par Rejeu sur Webhooks Sortants                  │ Horodatage signé HMAC SHA256 avec tolérance de 5 min │
│ 5. Vol de Données Personnelles dans les Corps d'Emails      │ Purge automatique des corps HTML après 7 jours        │
│ 6. Usurpation de Domaine Expéditeur                         │ Signature DKIM RSA 2048 + Validation SPF stricte      │
└─────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 9. Plan de Recette d'Ingénierie, Tests de Charge k6 & Critères d'Acceptation

| # | Scénario de Test | Procédure d'Ingénierie | Critère d'Acceptation Strict |
| :-: | :--- | :--- | :--- |
| **T1** | Ingestion Synchrone Haute Vitesse | Appel `POST /v1/emails` avec payload standard. | Réponse `202 Accepted` en $\le 30\text{ ms}$, statut `queued`, persistance MongoDB. |
| **T2** | Idempotence Exactly-Once | 2 requêtes simultanées avec la même `Idempotency-Key`. | Une seule insertion en base, un seul email envoyé, même réponse HTTP retournée. |
| **T3** | Garde de Suppression $O(1)$ | Envoi vers une adresse blacklistée dans `suppressions`. | Rejet immédiat en `422 Recipient Suppressed` sans solliciter le serveur SMTP. |
| **T4** | Rendu Handlebars & Inlining | Envoi d'un template avec variables et styles CSS `<style>`. | Variables interpolées, styles injectés en inline, fallback texte généré. |
| **T5** | Téléportation Pixel 1x1 | Requête `GET /v1/track/open/:token`. | Image GIF retournée en $\le 5\text{ ms}$, `openCount` incrémenté, événement logué. |
| **T6** | Redirection Proxy Clics | Requête `GET /v1/track/click/:token?url=https://acme.com`. | Redirection HTTP 302 instantanée vers l'URL cible, événement `email.clicked` créé. |
| **T7** | Webhook Sortant Signé | Déclenchement d'un événement `email.sent`. | Requête HTTP POST reçue par le serveur client avec en-tête `Resend-Signature` valide. |
| **T8** | Benchmark de Charge en Pic (k6) | Injection de 1 000 requêtes / seconde pendant 60s. | Taux d'erreur $< 0,01\%$, P95 $< 35\text{ ms}$, zéro job orphelin dans Redis. |
