# 💻 11. Guide d'Intégration Développeur (Frontend Sans Serveur & Backend API)

Ce guide officiel fournit l'ensemble des instructions, exemples de code et bonnes pratiques nécessaires pour intégrer **TUMA Cloud** dans n'importe quel site web, application SaaS ou backend d'entreprise.

---

## 1. Deux Parcours d'Intégration selon Vos Besoins

TUMA Cloud propose deux modes d'intégration radicalement différents selon votre cas d'usage :

| Critère | Parcours 1 : Frontend Sans Serveur | Parcours 2 : Backend API & Marque Propre |
| :--- | :--- | :--- |
| **Cas d'Usage** | Formulaire de contact web, demande de devis, feedback visiteur. | Emails transactionnels (OTP, factures, bienvenue, alertes). |
| **Philosophie** | Style *EmailJS* : envoi direct depuis le navigateur. | Style *Resend* / *SendGrid* : envoi depuis votre serveur. |
| **Clé d'API** | **Clé Publique** (`pk_live_...`) sans risque d'exposition. | **Clé Secrète** (`sk_live_...`) stockée dans `.env`. |
| **Configuration DNS / DKIM** | ❌ **Non requise** (expédié via l'infrastructure certifiée Tuma). |  **Requise** (pour authentifier votre propre domaine). |
| **Où s'exécute le code ?** | Navigateur web (React, Vue, HTML/JS, Mobile). | Serveur Backend (Node.js, Next.js, Python, PHP, Go). |
| **Quota Inclus** | 1 000 emails/mois offerts à vie (Plan Free). | 1 000 emails/mois offerts à vie (Plan Free). |

---

## 2. Parcours 1 : Formulaire de Contact Web (Frontend Sans Serveur)

### 💡 Pourquoi aucune configuration DNS n'est requise ?
Dans ce mode, l'email de notification est expédié depuis le domaine certifié de Tuma (`contact@eldnet.tech`) directement vers votre boîte de réception (`mon-adresse-pro@entreprise.cd`). Comme c'est le domaine validé de Tuma qui émet, la délivrabilité est garantie à 100% sans exiger de configuration de votre zone DNS.

---

### Étape 1 : Récupérer votre Clé Publique
1. Connectez-vous sur [console.tuma.eldnet.tech](https://console.tuma.eldnet.tech).
2. Rendez-vous dans **Paramètres $\rightarrow$ Clés API**.
3. Copiez votre **Clé Publique** (`pk_live_...`).
4. *(Optionnel mais recommandé)* : Renseignez vos origines autorisées (ex: `https://monsite.cd`) pour bloquer toute utilisation hors de votre domaine.

---

### Étape 2 : Implémentation dans votre Code

#### Option A : JavaScript Natif / HTML (Fetch API)
```html
<form id="contact-form">
  <input type="text" id="clientName" placeholder="Votre nom" required />
  <input type="email" id="clientEmail" placeholder="Votre email" required />
  <textarea id="clientMessage" placeholder="Votre message" required></textarea>
  
  <!-- Protection anti-spam invisible (Honeypot) -->
  <input type="text" id="_honeypot" style="display:none;" tabindex="-1" autocomplete="off" />

  <button type="submit" id="submit-btn">Envoyer mon message</button>
</form>

<script>
  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerText = 'Transmission en cours...';

    try {
      const response = await fetch('https://api.tuma.eldnet.tech/v1/emails/client-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: 'pk_live_votre_cle_publique_ici',
          template: 'contact-form',
          recipientEmail: 'contact@monsite.cd', // Où vous souhaitez recevoir la notification
          variables: {
            clientName: document.getElementById('clientName').value,
            clientEmail: document.getElementById('clientEmail').value,
            clientMessage: document.getElementById('clientMessage').value
          },
          _honeypot: document.getElementById('_honeypot').value
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur lors de l envoi');

      alert('Message transmis avec succès !');
      document.getElementById('contact-form').reset();
    } catch (err) {
      alert('Échec de l envoi : ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerText = 'Envoyer mon message';
    }
  });
</script>
```

---

#### Option B : Composant React / Next.js
```tsx
import React, { useState } from 'react';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', honeypot: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('https://api.tuma.eldnet.tech/v1/emails/client-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: process.env.NEXT_PUBLIC_TUMA_KEY || 'pk_live_...',
          template: 'contact-form',
          recipientEmail: 'support@monentreprise.cd',
          variables: {
            clientName: formData.name,
            clientEmail: formData.email,
            clientMessage: formData.message,
          },
          _honeypot: formData.honeypot,
        }),
      });

      if (!res.ok) throw new Error('Erreur réseau');
      setStatus('success');
      setFormData({ name: '', email: '', message: '', honeypot: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <input
        type="text"
        placeholder="Votre nom"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        placeholder="Votre email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        className="w-full p-2 border rounded"
      />
      <textarea
        placeholder="Votre message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
        className="w-full p-2 border rounded"
      />
      {/* Honeypot invisible */}
      <input
        type="text"
        value={formData.honeypot}
        onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-4 py-2 bg-emerald-600 text-white rounded font-bold"
      >
        {status === 'loading' ? 'Envoi...' : 'Envoyer'}
      </button>
      {status === 'success' && <p className="text-emerald-600 font-medium">Message envoyé avec succès !</p>}
      {status === 'error' && <p className="text-red-500 font-medium">Une erreur est survenue.</p>}
    </form>
  );
};
```

---

## 3. Parcours 2 : Envoi Transactionnel Backend (Marque Propre)

Dans ce mode, vous expédiez vos courriels avec **votre propre adresse d'expéditeur** (ex: `no-reply@votreapp.cd` ou `facturation@entreprise.cd`).

---

### Étape 1 : Déclarer & Certifier votre Domaine (DKIM / SPF / DMARC)
1. Rendez-vous dans l'onglet **Domaines** sur [console.tuma.eldnet.tech](https://console.tuma.eldnet.tech).
2. Cliquez sur **"Ajouter un Domaine"** et saisissez votre nom de domaine (ex: `votreapp.cd`).
3. Tuma génère instantanément la paire de clés RSA 2048 et affiche **3 enregistrements DNS** :

| Type | Nom d'Hôte / Sous-Domaine | Valeur Requise |
| :--- | :--- | :--- |
| **TXT** | `tuma._domainkey.votreapp.cd` | `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQE...` |
| **CNAME** | `bounces.votreapp.cd` | `feedback.tuma.dev` |
| **TXT** | `_dmarc.votreapp.cd` | `v=DMARC1; p=none; rua=mailto:dmarc-reports@tuma.dev` |

4. **Ajoutez ces 3 entrées** chez votre gestionnaire de zone DNS (Cloudflare, OVH, Hostinger, GoDaddy, LWS, etc.).
5. Cliquez sur **"Vérifier le DNS"** sur Tuma : dès que la propagation est confirmée, votre domaine affiche le badge vert **"Certifié 100% Inbox"**.

---

### Étape 2 : Récupérer votre Clé Secrète
Dans **Paramètres $\rightarrow$ Clés API**, copiez votre **Clé Secrète** (`sk_live_...`) et ajoutez-la dans votre fichier `.env` serveur :
```ini
TUMA_API_KEY=sk_live_9a8b7c6d5e4f3a2b1c0d...
```

---

### Étape 3 : Exemples de Code Backend

#### Node.js / TypeScript (Via le SDK `@tuma/sdk` ou Fetch)
```typescript
// Avec fetch natif (Node 18+)
async function sendWelcomeEmail(userEmail: string, userName: string) {
  const response = await fetch('https://api.tuma.eldnet.tech/v1/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TUMA_API_KEY}`,
      'Idempotency-Key': `welcome_${userEmail}_${Date.now()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Mon Application <bienvenue@votreapp.cd>',
      to: [userEmail],
      subject: `Bienvenue à bord, ${userName} ! 🚀`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; background: #0B0F19; color: white; border-radius: 12px;">
          <h1 style="color: #10B981;">Félicitations ${userName} !</h1>
          <p>Votre compte sur notre plateforme a été activé avec succès.</p>
          <a href="https://votreapp.cd/dashboard" style="background: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accéder à mon espace
          </a>
        </div>
      `,
      tags: [{ name: 'type', value: 'welcome' }]
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erreur d envoi Tuma');
  return data; // { id: "...", status: "queued" }
}
```

---

#### Next.js 14+ (App Router / Server Action)
```typescript
'use server';

export async function sendInvoiceAction(clientEmail: string, invoiceNumber: string, amount: string) {
  const res = await fetch('https://api.tuma.eldnet.tech/v1/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.TUMA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Facturation <factures@votreapp.cd>',
      to: [clientEmail],
      subject: `Votre facture #${invoiceNumber} est disponible`,
      html: `<p>Votre facture d'un montant de <strong>${amount}</strong> a été émise.</p>`,
    }),
  });

  return await res.json();
}
```

---

#### Python (Bibliothèque `requests`)
```python
import os
import requests

def send_transactional_email(to_email: str, code_otp: str):
    url = "https://api.tuma.eldnet.tech/v1/emails"
    headers = {
        "Authorization": f"Bearer {os.getenv('TUMA_API_KEY')}",
        "Content-Type": "application/json"
    }
    payload = {
        "from": "Sécurité <securite@votreapp.cd>",
        "to": [to_email],
        "subject": "Votre code de sécurité à usage unique",
        "html": f"<p>Votre code OTP est : <strong style='font-size: 20px;'>{code_otp}</strong></p>",
        "tags": [{"name": "category", "value": "security-otp"}]
    }

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()
```

---

#### PHP / Laravel
```php
use Illuminate\Support\Facades\Http;

function sendTumaEmail($recipient, $subject, $htmlContent) {
    $response = Http::withToken(env('TUMA_API_KEY'))
        ->withHeaders([
            'Idempotency-Key' => 'idemp_' . uniqid(),
        ])
        ->post('https://api.tuma.eldnet.tech/v1/emails', [
            'from'    => 'Support <contact@votreapp.cd>',
            'to'      => [$recipient],
            'subject' => $subject,
            'html'    => $htmlContent,
        ]);

    if ($response->failed()) {
        throw new \Exception($response->json('message') ?? 'Erreur Tuma');
    }

    return $response->json();
}
```

---

#### cURL (Ligne de Commande / Bash)
```bash
curl -X POST https://api.tuma.eldnet.tech/v1/emails \
  -H "Authorization: Bearer sk_live_votre_cle_secrete" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-12345" \
  -d '{
    "from": "Demo <contact@votreapp.cd>",
    "to": ["destinataire@gmail.com"],
    "subject": "Test en direct depuis le terminal",
    "html": "<h1>Bravo !</h1><p>Email expédié via l API REST de TUMA Cloud.</p>"
  }'
```

---

## 4. Webhooks Sortants : Réception des Événements

TUMA Cloud peut notifier automatiquement votre serveur dès qu'un email est remis, ouvert, cliqué ou subit un rebond.

### Événements Disponibles
- `email.sent` : Message accepté par le relais de transport.
- `email.delivered` : Message remis dans la boîte de réception du destinataire.
- `email.opened` : Le destinataire a chargé le pixel de tracking.
- `email.clicked` : Le destinataire a cliqué sur un lien présent dans le message.
- `email.bounced` : Rebond SMTP (adresse inexistante ou boîte pleine).
- `email.complained` : Le destinataire a signalé l'email en spam.

### Vérification de la Signature HMAC SHA-256
Chaque requête de webhook contient l'en-tête `Tuma-Signature` :
```http
POST /api/webhooks/tuma
Host: votreserveur.cd
Tuma-Signature: t=1725960000,v1=9a8b7c6d5e4f3a2b1c0d...
Content-Type: application/json
```

Exemple de vérification en Node.js :
```typescript
import crypto from 'crypto';

function verifyTumaWebhook(rawBody: string, signatureHeader: string, secret: string): boolean {
  const parts = signatureHeader.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
  const signature = parts.find(p => p.startsWith('v1='))?.slice(3);

  if (!timestamp || !signature) return false;

  const payload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
```

---

## 5. Répertoire des Codes d'Erreurs Fréquents

| Code HTTP | Cause Probable | Solution |
| :---: | :--- | :--- |
| **`400 Bad Request`** | Paramètres requis manquants (`to`, `subject`, etc.) ou JSON mal formé. | Vérifier la structure du corps JSON et les types des champs. |
| **`401 Unauthorized`** | Clé d'API absente, invalide ou révoquée. | Vérifier l'en-tête `Authorization: Bearer sk_...` ou `publicKey`. |
| **`403 Forbidden`** | L'origine de la requête n'est pas dans la liste CORS autorisée de la clé publique. | Renseigner l'URL de votre site dans les origines autorisées de la clé sur la console. |
| **`404 Not Found`** | Template introuvable dans l'organisation. | Vérifier le `slug` du template ou utiliser le template par défaut `contact-form`. |
| **`422 Unprocessable`** | L'adresse email destinataire est sur la liste de suppression (Hard Bounce ou Spam). | L'adresse a déjà rejeté un email. Supprimez-la de votre base ou de la liste de suppression. |
| **`429 Too Many Requests`** | Dépassement de la limite de débit ou quota mensuel (1 000 emails) atteint. | Passer au forfait supérieur ou attendre la réinitialisation du cycle mensuel. |
