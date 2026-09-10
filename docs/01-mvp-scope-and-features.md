# 📋 01. Périmètre Fonctionnel du MVP, Cas d'Usage & Contrats d'API

---

## 1. Vision & Positionnement Stratégique

**TUMA Cloud** (*"Envoyer / Transmettre"* en Swahili) est une infrastructure de communication cloud unifiée (**CPaaS**) combinant :
1. **L'excellence développeur backend (Style Resend)** : API REST haute performance, SDKs typés (`@tuma/sdk`), gestion automatisée des enregistrements DNS (DKIM RSA 2048, SPF, DMARC), webhooks en temps réel et observabilité granulaire.
2. **L'agilité sans serveur frontend (Style EmailJS)** : Envoi direct depuis les navigateurs web et applications mobiles (`@tuma/browser`) sans aucun serveur intermédiaire, sécurisé par clé publique (`pk_live_...`), restriction d'origine CORS et honeypot anti-robot.
3. **L'intégration financière locale (Afrique Centrale & RDC)** : Facturation bidevise (USD / Franc Congolais CDF) et recharges instantanées par **Mobile Money (M-Pesa, Orange Money, Airtel Money, Afrimoney)** et cartes bancaires.
4. **Un palier d'entrée généreux et pérenne** : **1 000 emails/mois offerts à vie** pour chaque organisation dès l'activation du compte.

---

## 2. Personas Cibles & Parcours d'Utilisation

```mermaid
flowchart TD
    subgraph AUTH ["0. Onboarding & Sécurité Développeur"]
        A1["Inscription sur console.tuma.eldnet.tech"] --> A2["Réception Email avec OTP à 6 chiffres"]
        A2 --> A3["Activation 1-Clic ou saisie OTP sur /activate"]
        A3 --> A4["Accès Console & Quota 1 000 emails/mois débloqué"]
    end

    subgraph BACKEND ["1. Développeur Backend (Style Resend)"]
        B1["Génération clé secrète sk_live_..."] --> B2["Ajout du domaine mail.acme.com"]
        B2 --> B3["Publication DNS (DKIM RSA 2048, SPF, DMARC)"]
        B3 --> B4["Validation DNS automatique ('Certifié 100% Inbox')"]
        B4 --> B5["Envoi via POST /v1/emails ou @tuma/sdk"]
        B5 --> B6["Réception Webhooks (delivered, opened, bounced)"]
    end

    subgraph FRONTEND ["2. Développeur Frontend / No-Backend (Style EmailJS)"]
        F1["Copie clé publique pk_live_... (Paramètres)"] --> F2["Déclaration Whitelist CORS (https://acme.com)"]
        F2 --> F3["Choix du Template (ex: 'contact-form')"]
        F3 --> F4["Appel POST /v1/emails/client-send ou @tuma/browser"]
        F4 --> F5["Validation Honeypot & Expédition immédiate sans DNS requis"]
    end

    AUTH --> BACKEND
    AUTH --> FRONTEND
```

---

## 3. Matrice Exhaustive des Fonctionnalités (MVP v1 vs Roadmap v2+)

| Domaine Fonctionnel | MVP (v1) - Périmètre Initial Déployé | Post-MVP (v2+) - Évolutions Futures |
| :--- | :--- | :--- |
| **Authentification & Sessions** | • Inscription avec nom, email, entreprise et mot de passe<br/>• Code d'activation OTP à 6 chiffres expédié par mail<br/>• Lien magique d'activation directe 1-clic (`/activate?email=...&otp=...`)<br/>• Réinitialisation sécurisée par jeton chiffré 60 min (`/reset-password?token=...`)<br/>• Hachage des mots de passe avec **Argon2id**<br/>• Sessions sécurisées par JWT (Access Token) | • Rôles d'équipe fins (RBAC : Admin, Developer, Viewer)<br/>• Authentification SSO / SAML 2.0 & MFA par TOTP (Google Authenticator)<br/>• Connexion OAuth (GitHub, Google) |
| **Gestion des Clés d'API** | • Clés Secrètes (`sk_live_...`) avec hash Argon2id (Backend)<br/>• Clés Publiques (`pk_live_...`) avec Whitelist CORS (Frontend)<br/>• Scopes granulaires (`emails:send`, `templates:read`, etc.)<br/>• Filtrage par IP source optionnel | • Clés temporaires à durée de validité limitée<br/>• Rotation automatique de clés d'API |
| **Gestion des Domaines & Cryptographie** | • Ajout de domaine personnalisé<br/>• Génération de clés asymétriques DKIM (RSA 2048 bits)<br/>• Chiffrement de la clé privée au repos avec **AES-256-GCM**<br/>• Return-Path (SPF CNAME) & DMARC TXT générés<br/>• Vérificateur DNS natif Node.js (`dns.promises`)<br/>• Statut en temps réel ("Certifié 100% Inbox") | • Réception d'emails entrants (*Inbound Webhooks*)<br/>• Attribution et réchauffement d'IPs dédiées (*Warmup*)<br/>• Rotation automatique périodique des clés DKIM |
| **API d'Envoi & Ingestion** | • `POST /v1/emails` (Backend authentifié par `sk_live_`)<br/>• `POST /v1/emails/client-send` (Frontend authentifié par `pk_live_`)<br/>• Clé d'idempotence (`Idempotency-Key`) sur 24h<br/>• Support `to`, `cc`, `bcc`, `reply_to`, `from`, `subject`, `attachments`<br/>• Ingestion non-bloquante avec bascule de secours directe (< 30ms) | • Envoi en lot / Batch (`POST /v1/batch`)<br/>• Envois programmés dans le futur (`scheduled_at`)<br/>• A/B testing natif sur les sujets et templates |
| **Moteur de Templates** | • Templates Handlebars (`{{variable}}`, `{{#if}}`, `{{#each}}`)<br/>• Validation stricte des variables requises (`requiredVariables`)<br/>• Génération automatique du fallback texte brut<br/>• Template système par défaut `contact-form` auto-généré | • Support natif React Email / JSX server-side<br/>• Éditeur visuel Drag-and-Drop pour non-développeurs<br/>• Prévisualisation multi-clients (Outlook, Gmail, Apple Mail) |
| **Tracking & Télémétrie** | • Pixel transparent $1\times 1$ GIF en $< 5\text{ms}$ (`/v1/tracking/open/:token`)<br/>• Proxy de redirection de clics HTTP 302 (`/v1/tracking/click/:token`)<br/>• Compteurs atomiques d'ouvertures et de clics en base<br/>• Historique des événements (`EmailEvent`) dans la timeline | • Détection avancée des proxies Apple Mail Privacy & Google Image Cache<br/>• Géolocalisation des ouvertures par pays/ville<br/>• Heatmap interactive de clics |
| **Délivrabilité & Transport** | • Passerelle HTTPS LWS Bridge (`tuma-bridge.php`) via socket SMTP direct `mail.eldnet.tech` (ports 587/465) pour lever les blocages de ports et contourner le dossier Spam<br/>• Fallback multi-fournisseurs (Resend API & Brevo API sur port 443)<br/>• Liste de suppression automatique (*Hard Bounces* & Plaintes)<br/>• Filtrage proactif $O(1)$ à l'ingestion | • Analyse prédictive du score de spam avant expédition<br/>• Intégration Google Postmaster Tools & SNDS |
| **Webhooks Sortants** | • Inscription d'URLs cibles par événements (`email.sent`, `email.delivered`, `email.bounced`, etc.)<br/>• Signature cryptographique HMAC SHA256 (`Tuma-Signature`)<br/>• Retries automatiques avec backoff exponentiel | • Console de rejeu manuel des webhooks en échec<br/>• Historique complet des corps de requêtes et réponses HTTP |

---

## 4. Contrats d'Interfaces & Spécification des APIs

### 4.1. Endpoints d'Authentification & Gestion de Compte

#### Inscription : `POST /v1/auth/register`
```http
POST /v1/auth/register
Host: api.tuma.eldnet.tech
Content-Type: application/json

{
  "email": "developpeur@startup.cd",
  "password": "MotDePasseSecurise123!",
  "name": "Jean-Marc Kabeya",
  "company": "Kivu Tech Lab"
}
```
**Réponse `HTTP 201 Created`** :
```json
{
  "message": "Compte créé avec succès. Un email contenant votre code d'activation OTP vous a été envoyé.",
  "user": {
    "id": "66ce2b7f1a2b3c4d5e6f7a8b",
    "email": "developpeur@startup.cd",
    "name": "Jean-Marc Kabeya",
    "company": "Kivu Tech Lab",
    "isActivated": false
  },
  "organization": {
    "id": "66ce2b7f1a2b3c4d5e6f7a8c",
    "name": "Kivu Tech Lab",
    "monthlyQuota": 1000
  }
}
```

#### Activation par Code OTP : `POST /v1/auth/activate`
```http
POST /v1/auth/activate
Host: api.tuma.eldnet.tech
Content-Type: application/json

{
  "email": "developpeur@startup.cd",
  "otp": "482910"
}
```
**Réponse `HTTP 200 OK`** :
```json
{
  "message": "Votre compte a été activé avec succès ! Bienvenue sur Tuma.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66ce2b7f1a2b3c4d5e6f7a8b",
    "email": "developpeur@startup.cd",
    "name": "Jean-Marc Kabeya",
    "isActivated": true
  }
}
```

#### Demande de Réinitialisation de Mot de Passe : `POST /v1/auth/reset-password`
```http
POST /v1/auth/reset-password
Host: api.tuma.eldnet.tech
Content-Type: application/json

{
  "email": "developpeur@startup.cd"
}
```
*Génère un jeton cryptographique hexadécimal de 32 octets valide pendant 60 minutes et expédie un email contenant le bouton direct vers `https://console.tuma.eldnet.tech/reset-password?email=...&token=...`.*

#### Confirmation de Réinitialisation : `POST /v1/auth/confirm-reset-password`
```http
POST /v1/auth/confirm-reset-password
Host: api.tuma.eldnet.tech
Content-Type: application/json

{
  "email": "developpeur@startup.cd",
  "token": "7b8f9e210a4b4f929e8a81a123bc45de8f9e210a4b4f929e8a81a123bc45de",
  "newPassword": "NouveauMotDePasse2026!"
}
```
**Réponse `HTTP 200 OK`** :
```json
{
  "message": "Votre mot de passe a été réinitialisé avec succès. Vous êtes désormais connecté.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "email": "developpeur@startup.cd", "isActivated": true },
  "organization": { "id": "...", "name": "Kivu Tech Lab", "monthlyQuota": 1000 }
}
```

---

### 4.2. Endpoint d'Envoi Backend : `POST /v1/emails`

#### Requête HTTP
```http
POST /v1/emails
Host: api.tuma.eldnet.tech
Authorization: Bearer sk_live_9a8b7c6d5e4f3a2b1c0d...
Idempotency-Key: 7b9f8e21-0a4b-4f92-9e8a-81a123bc45de
Content-Type: application/json

{
  "from": "Kivu Tech <contact@kivutech.cd>",
  "to": ["client@example.com"],
  "cc": ["direction@kivutech.cd"],
  "bcc": [],
  "reply_to": "support@kivutech.cd",
  "subject": "Confirmation de votre commande #{{orderId}}",
  "html": "<h2>Merci {{clientName}} !</h2><p>Votre commande de {{totalAmount}} a bien été validée.</p>",
  "variables": {
    "orderId": "CMD-8832",
    "clientName": "Alexandre",
    "totalAmount": "150.00 $"
  },
  "tags": [
    { "name": "category", "value": "orders" },
    { "name": "environment", "value": "production" }
  ]
}
```

#### Réponse de Succès Synchrone : `HTTP 202 Accepted`
```json
{
  "id": "66ce2b7f1a2b3c4d5e6f7a8b",
  "from": "contact@kivutech.cd",
  "to": ["client@example.com"],
  "status": "queued",
  "createdAt": "2026-09-10T14:30:00.000Z"
}
```

---

### 4.3. Endpoint d'Envoi Frontend Sans Serveur : `POST /v1/emails/client-send`

```http
POST /v1/emails/client-send
Host: api.tuma.eldnet.tech
Origin: https://monsite.cd
Content-Type: application/json

{
  "publicKey": "pk_live_123456789abcdef012345678",
  "template": "contact-form",
  "recipientEmail": "contact@monsite.cd",
  "variables": {
    "clientName": "Grâce Mutombo",
    "clientEmail": "grace@gmail.com",
    "clientMessage": "Bonjour, je souhaite un devis pour votre offre Pro."
  },
  "_honeypot": ""
}
```

**Réponse `HTTP 200 OK`** :
```json
{
  "id": "66ce2b7f1a2b3c4d5e6f7a8c",
  "status": "queued",
  "template": "contact-form"
}
```

---

### 4.4. Réponses d'Erreurs Normalisées (RFC 7807 Problem Details)
- **Erreur 400 Bad Request** : Paramètres obligatoires manquants ou invalides.
- **Erreur 401 Unauthorized** : Clé API invalide, révoquée ou introuvable.
- **Erreur 403 Forbidden** : Origine CORS non autorisée pour la clé publique.
- **Erreur 404 Not Found** : Template ou ressource inexistante.
- **Erreur 422 Unprocessable Entity** : Destinataire présent dans la liste de suppression ou variables requises manquantes.
- **Erreur 429 Too Many Requests** : Quota mensuel (1 000 emails) épuisé.

```json
{
  "type": "https://tuma.dev/errors/suppressed-recipient",
  "title": "Recipient Suppressed",
  "status": 422,
  "detail": "The recipient 'bounce@example.com' is on the suppression list due to previous hard bounce or complaint.",
  "instance": "/v1/emails"
}
```

---

## 5. Exemples d'Intégration SDK Officiels

### SDK Node.js / TypeScript (Backend) : `@tuma/sdk`
```typescript
import { Tuma } from '@tuma/sdk';

const tuma = new Tuma({ apiKey: process.env.TUMA_API_KEY });

const result = await tuma.emails.send({
  from: 'Kivu Tech <contact@kivutech.cd>',
  to: ['client@example.com'],
  subject: 'Votre code de vérification',
  html: '<p>Votre code OTP est <strong>{{otp}}</strong>.</p>',
  variables: { otp: '482910' },
  tags: [{ name: 'type', value: 'auth-otp' }]
});

console.log(`Email expédié avec succès, ID : ${result.id}`);
```

### SDK Navigateur JavaScript (Frontend) : `@tuma/browser`
```html
<form id="contact-form">
  <input type="text" name="clientName" placeholder="Votre nom" required />
  <input type="email" name="clientEmail" placeholder="Votre email" required />
  <textarea name="clientMessage" placeholder="Votre message" required></textarea>
  <input type="text" name="_honeypot" style="display:none;" tabindex="-1" autocomplete="off" />
  <button type="submit">Envoyer</button>
</form>

<script type="module">
  import { initTuma, sendForm } from '@tuma/browser';

  initTuma({ publicKey: 'pk_live_votre_cle_ici' });

  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await sendForm('contact-form', '#contact-form');
      alert('Message transmis avec succès !');
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  });
</script>
```
