# 🛠️ 04. Stack Technique, Architecture des Composants & Infrastructure de Production

Ce document présente l'architecture fonctionnelle de **TUMA Cloud**, l'architecture interne des composants logiciels (modules NestJS, workers BullMQ, SDKs, console React), les choix technologiques et la topologie de déploiement en production (Render, Vercel, MongoDB Atlas, LWS Bridge).

---

## 1. Topologie d'Infrastructure de Production

TUMA Cloud est déployé sur une architecture cloud hybride à haute disponibilité combinant puissance de calcul, résilience de transport et délivrabilité 100% Inbox :

```mermaid
flowchart TD
    subgraph CLIENTS ["1. Couche Clients"]
        WEB_APP["🌐 Utilisateurs & Développeurs<br/>(Navigateur Web)"]
        NODE_CLI["📦 Applications Backend Développeurs<br/>(@tuma/sdk / Node.js / Python / cURL)"]
        FRONT_CLI["💻 Sites Web & Formulaires Clients<br/>(@tuma/browser / HTML / React)"]
    end

    subgraph CLOUD_FRONT ["2. Edge & Frontend (Vercel Global Edge Network)"]
        VERCEL["⚡ Console Dashboard TUMA<br/>https://console.tuma.eldnet.tech<br/>(React 18 + Vite + Tailwind CSS + Lucide)"]
    end

    subgraph CLOUD_BACK ["3. API Gateway & Workers (Render Cloud Platform)"]
        RENDER_API["🚀 API Core & Moteur d'Ingestion<br/>https://api.tuma.eldnet.tech/v1<br/>(Node.js 20 LTS + NestJS 10 Framework)"]
        BULL_PROC["⚡ Processeur de Files Asynchrones<br/>(BullMQ Worker + Direct Fallback Dispatcher)"]
    end

    subgraph CLOUD_DATA ["4. Persistance & Cache (Multi-Région)"]
        ATLAS["🍃 MongoDB Atlas Replica Set<br/>(Base de données principale clusterisée)"]
        REDIS_CLOUD["⚡ Redis 7 In-Memory<br/>(Gestion des files BullMQ & Idempotence)"]
    end

    subgraph CLOUD_TRANSPORT ["5. Relais d'Expédition & Passerelle HTTPS"]
        LWS_BRIDGE["🛡️ LWS HTTPS Bridge (Port 443)<br/>https://bridges.eldnet.tech/tuma-bridge.php<br/>(Contournement du blocage de ports SMTP)"]
        LWS_SMTP["📬 Serveur SMTP Authentifié LWS<br/>mail.eldnet.tech (Ports 587 STARTTLS / 465 SSL)<br/>(SPF / DKIM / DMARC Valides)"]
        FALLBACK_API["☁️ APIs de Secours Externes<br/>Resend HTTPS API / Brevo HTTPS API"]
    end

    subgraph RECIPIENTS ["6. Récepteurs Finaux"]
        INBOX["📨 Boîtes de Réception (Gmail, Outlook, Yahoo)<br/>100% Inbox (Délivrabilité Certifiée)"]
    end

    WEB_APP --> VERCEL
    VERCEL --> RENDER_API
    NODE_CLI --> RENDER_API
    FRONT_CLI --> RENDER_API

    RENDER_API --> ATLAS
    RENDER_API --> REDIS_CLOUD
    RENDER_API --> BULL_PROC

    BULL_PROC --> LWS_BRIDGE
    BULL_PROC -.->|Fallback si bridge indisponible| FALLBACK_API
    LWS_BRIDGE --> LWS_SMTP
    LWS_SMTP --> INBOX
    FALLBACK_API --> INBOX
```

---

## 2. Architecture des Composants Logiciels

L'application repose sur une architecture modulaire **NestJS** découplée avec injection de dépendances, complétée par un pool de processeurs hybrides, la console web React et les packages SDK clients.

> 🎨 **Fichier source Draw.io** : [`docs/diagrams/06-architecture-composants.drawio`](./diagrams/06-architecture-composants.drawio)

```mermaid
flowchart TD
    subgraph LAYER1 ["1. Couche Clients & Interfaces"]
        SDK_NODE["📦 @tuma/sdk<br/>(Backend Node.js / TypeScript / ESM)"]
        SDK_WEB["📦 @tuma/browser<br/>(Client JS / Formulaires sans serveur)"]
        UI_DASH["💻 Console Web SPA (Vercel)<br/>(React + Vite + Tailwind + Contexts)"]
        CLIENT_SRV["🌐 Serveurs Webhook Clients<br/>(Endpoints HTTP récepteurs)"]
    end

    subgraph LAYER2 ["2. Backend Modulaire (NestJS Framework)"]
        subgraph MODULES_CORE ["Modules Métier Core"]
            M_AUTH["🔑 AuthModule<br/>• Register & Activation OTP<br/>• Tokenized Password Reset<br/>• ApiKeyGuard (sk/pk)<br/>• Argon2id Hashing"]
            M_DOM["🌐 DomainsModule<br/>• RSA 2048 Keypair Gen<br/>• AES-256-GCM Vault<br/>• DNS Native Resolver"]
            M_TPL["📑 TemplatesModule<br/>• Handlebars Compiler<br/>• Schema Validator<br/>• Auto-Plain-Text"]
            M_SUP["🛡️ SuppressionsModule<br/>• O(1) Guard<br/>• Bounce & Complaint Handler"]
            M_EML["📨 EmailsModule<br/>• POST /v1/emails (Backend)<br/>• POST /v1/emails/client-send<br/>• Idempotency Engine"]
        end

        subgraph MODULES_EXEC ["Modules d'Exécution & Workers"]
            M_TRK["👁️ TrackingModule<br/>• Pixel Controller (/v1/tracking/open)<br/>• Click Proxy (/v1/tracking/click)"]
            M_QUEUES["⚡ QueuesModule<br/>• EmailSendProcessor<br/>• Direct Fallback Dispatcher<br/>• Auto-Rescue Timeout (1s)"]
            M_HOOKS["🔔 WebhooksModule<br/>• HMAC-SHA256 Signer<br/>• Dispatcher HTTP sortant"]
            M_TRANS["🔌 TransportersModule<br/>• LWS HTTPS Bridge Adapter<br/>• Resend / Brevo API Adapters<br/>• Nodemailer Standard Relay"]
        end

        subgraph MODULES_DATA ["Accès aux Données & Drivers"]
            DRV_MONGO["🍃 Mongoose ODM Connection Pool<br/>(Users, Orgs, Keys, Domains, Emails, Events, Suppressions)"]
            DRV_REDIS["⚡ IORedis Connection Pool<br/>(BullMQ Queues, Idempotency Cache)"]
        end
    end

    LAYER1 -->|Appels REST HTTPS| MODULES_CORE
    LAYER1 -->|Tracking Pixel / Liens| M_TRK
    M_EML -->|Dispatch Job / Direct| M_QUEUES
    M_QUEUES -->|Rendu, DKIM & Expédition| M_TRANS
    M_QUEUES -->|Événements sortants| M_HOOKS
    M_HOOKS -->|Notification HTTP POST| CLIENT_SRV

    MODULES_CORE --> DRV_MONGO
    MODULES_CORE --> DRV_REDIS
    MODULES_EXEC --> DRV_MONGO
    MODULES_EXEC --> DRV_REDIS
```

---

## 3. Choix Technologiques & Justifications

| Composant | Technologie | Rôle & Rationale Technique |
| :--- | :--- | :--- |
| **Framework Backend** | **NestJS 10 (TypeScript)** | Architecture modulaire d'entreprise, injection de dépendances, décorateurs stricts et robustesse. |
| **Base de Données** | **MongoDB Atlas 7+ (Mongoose)** | Stockage flexible et évolutif pour les documents d'emails, logs de tracking et modèles polymorphes. |
| **Files d'Attente & Cache** | **Redis 7 & BullMQ** | Gestion haute performance des jobs asynchrones, priorités d'envoi et isolation des pics de trafic. |
| **Moteur de Templates** | **Handlebars.js** | Rendu rapide et sécurisé côté serveur avec interpolation de variables (`{{nom}}`). |
| **Cryptographie** | **Argon2id & AES-256-GCM** | Hachage résistant aux attaques GPU/ASIC pour les mots de passe et clés API, et chiffrement militaire pour les clés privées DKIM. |
| **Passerelle d'Envoi Cloud** | **LWS PHP Bridge (`tuma-bridge.php`)** | Contournement natif du blocage des ports SMTP 587/465 sur Render via HTTPS, garantissant la conformité SPF et DKIM. |
| **Console Développeur** | **React 18 + Vite + Tailwind CSS** | Interface ultra-rapide (déployée sur Vercel Edge), réactive, thème Obsidian/Emerald et commande palette (Cmd+K). |

---

## 4. Variables d'Environnement de Production (`.env`)

```ini
# ==============================================================================
# Configuration Générale de l'API
# ==============================================================================
PORT=3001
NODE_ENV=production
API_BASE_URL=https://api.tuma.eldnet.tech/v1
DASHBOARD_URL=https://console.tuma.eldnet.tech

# ==============================================================================
# Persistance MongoDB Atlas & Redis
# ==============================================================================
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/tuma_production?retryWrites=true&w=majority
REDIS_HOST=redis-12345.c1.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=votre_mot_de_passe_redis

# ==============================================================================
# Sécurité & Cryptographie
# ==============================================================================
JWT_SECRET=super_secret_jwt_key_pour_les_sessions_utilisateurs_production
MASTER_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# ==============================================================================
# Passerelle SMTP & LWS Bridge (Anti-Spam & Anti-Blocage Port)
# ==============================================================================
SMTP_HOST=mail.eldnet.tech
SMTP_PORT=587
SMTP_USER=contact@eldnet.tech
SMTP_PASS=VotreMotDePasseBoiteEmailLWS
DEFAULT_FROM_EMAIL="Tuma Notifications <contact@eldnet.tech>"

LWS_BRIDGE_URL=https://bridges.eldnet.tech/tuma-bridge.php
LWS_BRIDGE_SECRET=53252ddafb841d3defe44023c025d56cd308a6dca1776d3f

# Fallbacks optionnels
RESEND_API_KEY=
BREVO_API_KEY=
```

---

## 5. Arborescence du Monorepo TUMA

```text
tuma/
├── apps/
│   ├── api/                          # Backend Core NestJS & Moteur d'Ingestion
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # Inscription, OTP, Reset Password, Clés API (sk/pk), Guards
│   │   │   │   ├── domains/          # Génération DKIM RSA 2048, Chiffrement AES, Résolveur DNS
│   │   │   │   ├── emails/           # Endpoints POST /v1/emails et POST /v1/emails/client-send
│   │   │   │   ├── templates/        # Moteur Handlebars & CRUD Templates
│   │   │   │   ├── suppressions/     # Liste de suppression O(1) & Détection de rebonds
│   │   │   │   ├── tracking/         # Pixel 1x1 GIF transparent & Proxy de redirection de clics
│   │   │   │   ├── webhooks/         # Dispatcher d'événements sortants signés HMAC-SHA256
│   │   │   │   └── queues/           # Processeurs BullMQ et Dispatcher de secours direct
│   │   │   ├── transporters/         # LWS Bridge Adapter, Resend, Brevo, Nodemailer
│   │   │   ├── schemas/              # Schémas Mongoose (User, Org, ApiKey, Domain, Email...)
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── dashboard/                    # Console Développeur React SPA (Vercel)
│       ├── src/
│       │   ├── pages/                # Overview, EmailsLogs, Domaines, Clés, Templates, Playground
│       │   ├── pages/auth/           # LoginPage, RegisterPage, ResetPasswordPage
│       │   ├── context/              # AuthContext (Sessions JWT, Activation, Reset)
│       │   ├── components/           # Layout, Header, CommandPalette, Modals, Tables, Charts
│       │   └── services/             # Client API (api.ts)
│       └── package.json
│
├── packages/
│   ├── sdk/                          # SDK Officiel Node.js (@tuma/sdk)
│   └── browser/                      # SDK Officiel Navigateur (@tuma/browser)
│
├── scripts/
│   └── tuma-bridge.php               # Passerelle HTTPS LWS déployée sur public_html
│
└── docs/                             # Documentation d'Architecture, Spécifications & Guides
```
