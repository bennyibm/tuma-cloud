# 📋 01. Périmètre Fonctionnel du MVP, Cas d'Usage & Contrats d'API

---

## 1. Vision & Positionnement Stratégique

La plateforme est une infrastructure de communication cloud unifiée (**CPaaS**) combinant :
1. **L'excellence développeur backend (Style Resend)** : API REST haute performance, SDKs typés, gestion automatisée des enregistrements DNS (DKIM, SPF, DMARC), webhooks en temps réel et observabilité granulaire.
2. **L'agilité sans serveur frontend (Style EmailJS)** : SDK JavaScript/TypeScript pour navigateur et mobile permettant de router les formulaires web directement vers les destinataires sans infrastructure serveur intermédiaire, sécurisé par restriction d'origine CORS et Captcha.
3. **L'intégration financière locale (Afrique Centrale & RDC)** : Facturation bidevise (USD / Franc Congolais CDF) et recharges instantanées par **Mobile Money (M-Pesa, Orange Money, Airtel Money, Afrimoney)** et cartes bancaires.

---

## 2. Personas Cibles & Parcours d'Utilisation

```mermaid
flowchart TD
    subgraph BACKEND ["1. Développeur Backend (Style Resend)"]
        B1["Génération clé secrète sk_live_..."] --> B2["Ajout du domaine mail.acme.com"]
        B2 --> B3["Validation automatique DKIM / SPF"]
        B3 --> B4["Envoi via POST /v1/emails ou SDK"]
        B4 --> B5["Réception Webhooks (delivered, opened, bounced)"]
    end

    subgraph FRONTEND ["2. Développeur Frontend / No-Backend (Style EmailJS)"]
        F1["Génération clé publique pk_live_..."] --> F2["Déclaration Whitelist CORS (https://acme.com)"]
        F2 --> F3["Création Template dans le Dashboard"]
        F3 --> F4["Appel sendForm() depuis React / Vue / HTML"]
        F4 --> F5["Validation Honeypot / Captcha & Envoi"]
    end
```

---

## 3. Matrice Exhaustive des Fonctionnalités (MVP v1 vs Roadmap v2+)

| Domaine Fonctionnel | MVP (v1) - Périmètre Initial | Post-MVP (v2+) - Évolutions Futures |
| :--- | :--- | :--- |
| **Authentification & IAM** | • Clés Secrètes (`sk_live_...`) avec hash Argon2id<br/>• Clés Publiques (`pk_live_...`) avec Whitelist CORS<br/>• Multi-tenancy strict par organisation<br/>• Limitation de débit (*Token Bucket*) | • Rôles d'équipe fins (RBAC : Admin, Developer, Viewer)<br/>• Authentification SSO / SAML 2.0 & MFA obligatoire<br/>• Clés d'API restreintes par adresse IP source |
| **Gestion des Domaines** | • Ajout de domaine d'expédition<br/>• Génération paires de clés DKIM (RSA 2048)<br/>• Return-Path (SPF CNAME) & DMARC TXT<br/>• Vérificateur DNS automatique (*Polling background*) | • Réception d'emails entrants (*Inbound Webhooks*)<br/>• Attribution et réchauffement d'IPs dédiées (*Warmup*)<br/>• Rotation automatique périodique des clés DKIM |
| **API d'Envoi & Ingestion** | • `POST /v1/emails` (HTML, Plain-Text, Templates)<br/>• Support `to`, `cc`, `bcc`, `reply_to`, `from`, `subject`<br/>• Clé d'idempotence (`Idempotency-Key`) sur 24h<br/>• Support des pièces jointes (*Attachments*) jusqu'à 10 Mo<br/>• Réponse synchrone `HTTP 202 Accepted` en $\le 30\text{ms}$ | • Envoi en lot / Batch (`POST /v1/batch`)<br/>• Envois programmés dans le futur (`scheduled_at`)<br/>• A/B testing natif sur les sujets et gabarits |
| **Moteur de Templates** | • Templates Handlebars (`{{variable}}`, `{{#if}}`, `{{#each}}`)<br/>• Validation stricte des variables obligatoires<br/>• Inlining automatique du CSS et minification HTML<br/>• Génération automatique du fallback texte brut | • Support natif React Email / JSX server-side<br/>• Éditeur visuel Drag-and-Drop pour marketeurs<br/>• Prévisualisation multi-clients (Outlook, Gmail, Apple Mail) |
| **Tracking & Télémétrie** | • Pixel transparent $1\times 1$ GIF en $< 5\text{ms}$<br/>• Proxy de redirection de clics HTTP 302<br/>• Filtrage des robots et scanners antivirus<br/>• Compteurs d'ouvertures et clics atomiques | • Géolocalisation des ouvertures par pays/ville<br/>• Analyse des clients de messagerie utilisés<br/>• Heatmap interactive de clics |
| **Délivrabilité & Sécurité** | • Liste de suppression automatique (*Hard Bounces* & Spam)<br/>• Filtrage proactif $O(1)$ à l'ingestion<br/>• En-tête List-Unsubscribe (RFC 8058)<br/>• Protection Honeypot & Cloudflare Turnstile | • Analyse de score de spam prédictif avant envoi<br/>• Monitoring en direct de la réputation IP (SNDS / Google Postmaster Tools) |
| **Webhooks Sortants** | • Inscription d'URLs cibles par événements<br/>• Signature cryptographique HMAC SHA256 (`Resend-Signature`)<br/>• 5 tentatives de retry avec backoff exponentiel | • Console de rejeu manuel des webhooks en échec<br/>• Historique complet des corps de requêtes et réponses HTTP |

---

## 4. Contrats d'Interfaces & Spécification des APIs

### 4.1. Endpoint d'Envoi Backend : `POST /v1/emails`

#### Requête HTTP
```http
POST /v1/emails
Host: api.monplateforme.com
Authorization: Bearer sk_live_9a8b7c6d5e4f3a2b1c0d...
Idempotency-Key: 7b9f8e21-0a4b-4f92-9e8a-81a123bc45de
Content-Type: application/json

{
  "from": "Acme Notifications <notifications@mail.acme.com>",
  "to": ["alexandre@example.com"],
  "cc": ["manager@example.com"],
  "bcc": [],
  "reply_to": "support@acme.com",
  "subject": "Confirmation de commande #{{orderId}}",
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

#### Réponse de Succès Synchrone : `HTTP 202 Accepted`
```json
{
  "id": "email_66ce2b7f1a2b3c4d5e6f7a8b",
  "from": "notifications@mail.acme.com",
  "to": ["alexandre@example.com"],
  "status": "queued",
  "createdAt": "2026-08-27T10:30:00.000Z"
}
```

#### Réponses d'Erreurs Normalisées (RFC 7807 Problem Details)
- **Erreur 401 Unauthorized** : Clé secrète invalide ou révoquée.
- **Erreur 422 Unprocessable Entity** : Destinataire présent dans la liste de suppression ou variables manquantes.
- **Erreur 429 Too Many Requests** : Quota mensuel épuisé ou dépassement de la limite de débit.

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

### 4.2. Endpoint d'Envoi Frontend / Formulaire : `POST /v1/client/send`

```http
POST /v1/client/send
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

## 5. Exemples d'Intégration SDK

### SDK Node.js / TypeScript (Backend)
```typescript
import { MailEngine } from '@monplateforme/sdk-node';

const mailer = new MailEngine({ apiKey: process.env.MAIL_API_KEY });

const result = await mailer.emails.send({
  from: 'Acme <notifications@mail.acme.com>',
  to: ['client@example.com'],
  subject: 'Votre code de vérification',
  html: '<p>Votre code OTP est <strong>{{otp}}</strong>.</p>',
  variables: { otp: '482910' },
  tags: [{ name: 'type', value: 'auth-otp' }]
});

console.log(`Email en file avec l'ID : ${result.id}`);
```

### SDK Navigateur JavaScript (Frontend)
```html
<form id="contact-form">
  <input type="text" name="userName" placeholder="Votre nom" required />
  <input type="email" name="userEmail" placeholder="Votre email" required />
  <textarea name="userMessage" placeholder="Votre message"></textarea>
  <button type="submit">Envoyer</button>
</form>

<script type="module">
  import { sendForm } from '@monplateforme/sdk-browser';

  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await sendForm({
        publicKey: 'pk_live_...',
        templateId: 'contact-form',
        formElement: '#contact-form'
      });
      alert('Message envoyé avec succès !');
    } catch (err) {
      alert('Erreur lors de l\'envoi : ' + err.message);
    }
  });
</script>
```
