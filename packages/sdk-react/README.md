# @tuma/react

Official React & Next.js SDK for **[TUMA Cloud](https://tuma.eldnet.tech)** — The lightning-fast transactional email infrastructure.

Easily power your contact forms, transactional notifications, and server actions in React, Next.js (App Router & Pages Router), Vite, and Remix with sub-38ms ingestion and automated anti-spam protection.

---

## 📦 Installation

```bash
npm install @tuma/react
# or
yarn add @tuma/react
# or
pnpm add @tuma/react
```

---

## 🚀 Quickstart

### 1. Zero-Config Drop-in Component (`<TumaContactForm />`)

The fastest way to add a functional, spam-protected contact form to your site in under 60 seconds:

```tsx
import React from 'react';
import { TumaContactForm } from '@tuma/react';

export default function ContactSection() {
  return (
    <div className="max-w-xl mx-auto py-12">
      <TumaContactForm
        publicKey="pk_live_YOUR_PUBLIC_KEY"
        recipientEmail="contact@yourcompany.com"
        theme="dark" // 'dark' | 'light' | 'minimal'
        onSuccess={(data) => console.log('Email queued successfully!', data)}
      />
    </div>
  );
}
```

---

### 2. Custom Form with Hook (`useTumaForm`)

Bind TUMA directly to your custom HTML/JSX form with automated state handling and bot traps:

```tsx
import React from 'react';
import { useTumaForm } from '@tuma/react';

export function CustomContactForm() {
  const { formProps, honeypotProps, isSubmitting, isSuccess, isError, error } =
    useTumaForm({
      publicKey: 'pk_live_YOUR_PUBLIC_KEY',
      template: 'contact-form',
      recipientEmail: 'support@mybrand.com',
    });

  return (
    <form {...formProps} className="space-y-4">
      {/* Invisible Honeypot to block spam bots */}
      <input {...honeypotProps} />

      {isSuccess && (
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded">
          Message envoyé avec succès !
        </div>
      )}

      {isError && (
        <div className="p-3 bg-red-500/10 text-red-400 rounded">
          Erreur: {error?.message}
        </div>
      )}

      <div>
        <label>Nom :</label>
        <input name="clientName" required className="w-full border p-2 rounded" />
      </div>

      <div>
        <label>Email :</label>
        <input name="clientEmail" type="email" required className="w-full border p-2 rounded" />
      </div>

      <div>
        <label>Message :</label>
        <textarea name="clientMessage" rows={4} required className="w-full border p-2 rounded" />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-emerald-500 text-black font-semibold rounded"
      >
        {isSubmitting ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  );
}
```

---

### 3. Programmatic Trigger Hook (`useTuma`)

If you manage your own form state (e.g., React Hook Form, Formik, or state variables):

```tsx
import React, { useState } from 'react';
import { useTuma } from '@tuma/react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const { send, isSubmitting, isSuccess } = useTuma({
    publicKey: 'pk_live_YOUR_PUBLIC_KEY',
    template: 'welcome-newsletter',
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    await send({ subscriberEmail: email });
  };

  return (
    <form onSubmit={handleSubscribe}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Inscription...' : 'S’inscrire'}
      </button>
    </form>
  );
}
```

---

### 4. Global Provider (`<TumaProvider>`)

Avoid re-typing credentials across multiple forms:

```tsx
// In main.tsx or app/layout.tsx
import { TumaProvider } from '@tuma/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <TumaProvider
      publicKey="pk_live_YOUR_PUBLIC_KEY"
      defaultRecipient="contact@yourcompany.com"
      defaultTemplate="contact-form"
    >
      {children}
    </TumaProvider>
  );
}
```

---

## ⚡ Next.js App Router (Server-Side)

If you prefer processing form submissions on your Next.js server with your secret key (`tuma_live_...`):

### Option A: Server Actions (`app/actions.ts`)

```typescript
'use server';

import { createTumaServerClient } from '@tuma/react/server';

const tuma = createTumaServerClient({
  apiKey: process.env.TUMA_API_KEY!, // tuma_live_...
});

export async function submitContactAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  return tuma.sendEmail({
    to: 'support@mybrand.com',
    from: 'Contact <notifications@mybrand.com>',
    replyTo: email,
    subject: `Nouveau message de ${name}`,
    html: `
      <h2>Message de contact</h2>
      <p><strong>De :</strong> ${name} (${email})</p>
      <p>${message}</p>
    `,
  });
}
```

### Option B: Built-in Route Handler (`app/api/contact/route.ts`)

```typescript
import { tumaContactRouteHandler } from '@tuma/react/server';

export const POST = tumaContactRouteHandler({
  apiKey: process.env.TUMA_API_KEY!,
  recipientEmail: 'support@mybrand.com',
});
```

---

## 🛡️ Built-in Honeypot Anti-Spam

Bots automatically scan forms and fill all input fields. With `honeypotProps` (or `<TumaContactForm />`), TUMA adds an invisible, off-screen field named `_honeypot`. If filled, TUMA discards the request silently to protect your quota.

---

## 📄 License

MIT © [TUMA Cloud](https://tuma.eldnet.tech)
