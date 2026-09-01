# 🛠️ 04. Stack Technique, Architecture des Composants & Environnement

Ce document présente l'architecture fonctionnelle de la plateforme, l'architecture interne des composants logiciels (modules NestJS, workers, SDKs, dashboard), les choix technologiques et la configuration de l'infrastructure locale Docker.

---

## 1. Architecture Fonctionnelle

L'architecture fonctionnelle organise la plateforme en **8 blocs fonctionnels interconnectés**, garantissant la sécurité des accès, la délivrabilité DNS, la résilience de l'envoi et la télémétrie en temps réel.

> 🎨 **Fichier source Draw.io** : [`docs/diagrams/05-architecture-fonctionnelle.drawio`](./diagrams/05-architecture-fonctionnelle.drawio) *(Ouvrable directement dans [app.diagrams.net](https://app.diagrams.net) ou via l'extension VS Code Draw.io)*

```mermaid
flowchart TD
    subgraph S1 ["1. Sécurité & Accès"]
        A_KEYS["🔑 Gestion Clés API (sk_ / pk_)"]
        A_CORS["🛡️ Contrôle d'Origine CORS"]
        A_RATE["⏱️ Rate Limiting (Token Bucket)"]
        A_CAPTCHA["🤖 Anti-Abus & Captcha"]
    end

    subgraph S2 ["2. Domaines & DNS"]
        D_DKIM["🔐 Générateur DKIM (RSA 2048)"]
        D_SPF["📨 Return-Path & SPF CNAME"]
        D_POLL["🔍 Vérificateur DNS Automatique"]
        D_DMARC["📜 Validation Politique DMARC"]
    end

    subgraph S3 ["3. Templates & Rendu"]
        T_HBS["📑 Compilateur Handlebars"]
        T_SCHEMA["✅ Validation Schémas Variables"]
        T_TEXT["📝 Fallback Plain-Text Auto"]
        T_INLINE["🎨 Minification & Inlining CSS"]
    end

    subgraph S4 ["4. Suppression & Réputation"]
        SUP_GUARD["🚫 Filtrage Proactif O(1)"]
        SUP_BOUNCE["❌ Ingestion Hard Bounces (550)"]
        SUP_FBL["🚨 Plaintes Spam (Feedback Loops)"]
        SUP_UNSUB["🚪 Désinscription 1-Clic (RFC 8058)"]
    end

    subgraph S5 ["5. Ingestion & Pipeline d'Envoi"]
        ING_REST["⚡ Endpoint REST & SDKs (POST /v1/emails)"]
        ING_IDEMP["🔒 Moteur Idempotence Anti-Doublon"]
        ING_QUEUE["📦 Scheduler de Priorités (BullMQ)"]
        ING_TRANS["🔌 Adaptateurs Transports (Mailpit/SES/SMTP)"]
    end

    subgraph S6 ["6. Tracking & Télémétrie"]
        TRK_PIX["👁️ Serveur Pixel 1x1 (< 5ms)"]
        TRK_LINK["🔗 Proxy de Redirection Clics (HTTP 302)"]
        TRK_BOT["🤖 Filtre Anti-Scanners & Bots"]
        TRK_LOG["⏱️ Journal d'Audit Immuable"]
    end

    subgraph S7 ["7. Webhooks & Bus d'Événements"]
        WH_SUB["🔔 Souscriptions d'URLs par Événement"]
        WH_SIGN["🔐 Signature Cryptographique HMAC SHA256"]
        WH_RETRY["🔄 Retry Exponentiel (5 essais)"]
        WH_AUDIT["📊 Journal des Tentatives & Codes HTTP"]
    end

    subgraph S8 ["8. Dashboard Web (React + Tailwind)"]
        DASH_LOGS["📜 Visualiseur de Logs en Direct & Timelines"]
        DASH_DNS["🌐 Gestionnaire de Domaines & Statuts DNS"]
        DASH_TPL["📝 Éditeur de Templates & Prévisualisation"]
        DASH_KEYS["🔑 Console de Clés API & Webhooks"]
    end

    S1 --> S5
    S2 --> S5
    S3 --> S5
    S4 --> S5
    S5 --> S6
    S6 --> S7
    S8 -.->|Administration & Consultation| S1
    S8 -.->|Configuration| S2
    S8 -.->|Création| S3
    S8 -.->|Audit| S6
```

---

## 2. Architecture des Composants Logiciels

L'application repose sur une architecture modulaire **NestJS** découplée avec injection de dépendances, complétée par un pool de workers **BullMQ**, une interface **React (Vite + Tailwind)** et deux SDKs clients.

> 🎨 **Fichier source Draw.io** : [`docs/diagrams/06-architecture-composants.drawio`](./diagrams/06-architecture-composants.drawio) *(Ouvrable directement dans [app.diagrams.net](https://app.diagrams.net) ou via l'extension VS Code Draw.io)*

```mermaid
flowchart TD
    subgraph LAYER1 ["1. Couche Clients & Interface"]
        SDK_NODE["📦 @platform/sdk-node<br/>(Backend Node.js / TypeScript)"]
        SDK_WEB["📦 @platform/sdk-browser<br/>(Client JS / Formulaires)"]
        UI_DASH["💻 Dashboard Web SPA<br/>(React + Vite + Tailwind + TanStack Query)"]
        CLIENT_SRV["🌐 Serveurs Clients<br/>(Endpoints récepteurs de Webhooks)"]
    end

    subgraph LAYER2 ["2. Backend Modulaire (NestJS Framework)"]
        subgraph MODULES_API ["Modules Fonctionnels Core"]
            M_AUTH["🔑 AuthModule<br/>• ApiKeyGuard (sk/pk)<br/>• OriginCorsGuard<br/>• RateLimitInterceptor<br/>• Argon2Service"]
            M_DOM["🌐 DomainsModule<br/>• DomainsController<br/>• DnsResolverService<br/>• DkimGenerator (RSA)"]
            M_TPL["📑 TemplatesModule<br/>• TemplatesController<br/>• HandlebarsService<br/>• SchemaValidator"]
            M_SUP["🛡️ SuppressionsModule<br/>• SuppressionGuard<br/>• BounceHandlerService<br/>• FblComplaintListener"]
            M_EML["📨 EmailsModule<br/>• EmailsController<br/>• IdempotencyService<br/>• EmailQueueProducer"]
        end

        subgraph MODULES_EXEC ["Modules d'Exécution & Workers"]
            M_TRK["👁️ TrackingModule<br/>• PixelController (GET /open)<br/>• ClickProxy (GET /click)<br/>• BotDetectorService"]
            M_QUEUES["⚡ QueuesModule (BullMQ Processors)<br/>• EmailSendProcessor<br/>• TrackingProcessor<br/>• WebhookProcessor<br/>• DeadLetterService"]
            M_HOOKS["🔔 WebhooksModule<br/>• WebhookDispatcherService<br/>• HmacSignerService (SHA256)<br/>• HttpRetryClient"]
            M_TRANS["🔌 TransportersModule<br/>• MailpitMockAdapter (Dev)<br/>• AwsSesAdapter (Prod)<br/>• SmtpRelayAdapter"]
        end

        subgraph MODULES_DATA ["Accès aux Données & Drivers"]
            DRV_MONGO["🍃 Mongoose ODM Connection Pool<br/>(Org, ApiKey, Domain, Template, Email, Event, Suppression)"]
            DRV_REDIS["⚡ IORedis Connection Pool<br/>(BullMQ Queues, Idempotency Cache, Rate-Limiters)"]
        end
    end

    subgraph LAYER3 ["3. Infrastructure Runtime (Docker / Cloud)"]
        INFRA_MONGO["🍃 MongoDB 7.0<br/>Port 27017"]
        INFRA_REDIS["⚡ Redis 7.2<br/>Port 6379"]
        INFRA_MAILPIT["📬 Mailpit SMTP & UI<br/>Ports 1025 / 8025"]
        INFRA_SES["☁️ AWS SES / SMTP Externe<br/>(Production)"]
    end

    LAYER1 -->|Appels HTTP / REST| MODULES_API
    LAYER1 -->|Requêtes de Tracking| M_TRK
    M_EML -->|Job d'envoi| M_QUEUES
    M_QUEUES -->|Rendu & Envoi| M_TRANS
    M_QUEUES -->|Événements sortants| M_HOOKS
    M_HOOKS -->|Notification POST| CLIENT_SRV

    MODULES_API --> DRV_MONGO
    MODULES_API --> DRV_REDIS
    MODULES_EXEC --> DRV_MONGO
    MODULES_EXEC --> DRV_REDIS

    DRV_MONGO --> INFRA_MONGO
    DRV_REDIS --> INFRA_REDIS
    M_TRANS --> INFRA_MAILPIT
    M_TRANS --> INFRA_SES
```

---

## 3. Choix Technologiques & Justifications

| Composant | Technologie | Rôle & Justification |
| :--- | :--- | :--- |
| **Framework Backend** | **NestJS (TypeScript)** | Architecture d'entreprise modulaire, injection de dépendances, décorateurs et maintenabilité. |
| **Base de Données** | **MongoDB 7+ (Mongoose)** | Stockage flexible et évolutif pour les payloads d'emails, logs de tracking et modèles de données polymorphes. |
| **Files d'Attente & Cache** | **Redis 7+ & BullMQ** | Gestion haute performance des jobs asynchrones, priorités d'envoi, rate-limiting et re-tentatives. |
| **Moteur de Templates** | **Handlebars.js** | Rendu rapide et sécurisé côté serveur avec interpolation de variables (`{{nom}}`). |
| **Transport de Mail (Dev)** | **Mailpit** | Serveur SMTP local léger avec interface Web pour intercepter et inspecter les emails envoyés en développement sans coût. |
| **Transport de Mail (Prod)**| **AWS SES / SMTP Provider** | Adaptateurs interchangeables pour l'expédition réelle à grande échelle. |
| **Dashboard Frontend** | **React + Vite + Tailwind CSS** | Interface réactive, moderne et rapide pour visualiser les logs, gérer les domaines et configurer les clés d'API. |

---

## 4. Environnement de Développement Local (`docker-compose.yml`)

Pour développer sans friction, la stack locale complète s'exécute sous Docker :

```yaml
version: '3.8'

services:
  # Base de données MongoDB
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

  # Interface Web pour visualiser MongoDB
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

  # Cache & File d'attente Redis
  redis:
    image: redis:7.2-alpine
    container_name: email_platform_redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  # Serveur SMTP de test & Interface d'inspection des emails (Mailpit)
  mailpit:
    image: axllent/mailpit:latest
    container_name: email_platform_mailpit
    restart: always
    ports:
      - '1025:1025' # Port SMTP pour l'envoi
      - '8025:8025' # Interface Web de prévisualisation des emails reçus
    environment:
      MP_MAX_MESSAGES: 500

volumes:
  mongo_data:
  redis_data:
```

---

## 5. Arborescence du Projet Autonome

```
email-platform/
├── docker-compose.yml             # MongoDB + Redis + Mailpit
├── .env.example
├── README.md
│
├── apps/
│   ├── api/                       # API Core NestJS & Workers d'envoi
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/          # Clés API (sk_..., pk_...) & Guards CORS
│   │   │   │   ├── domains/       # Vérification DNS, DKIM, SPF
│   │   │   │   ├── emails/        # Ingestion API (POST /v1/emails)
│   │   │   │   ├── templates/     # Moteur Handlebars & CRUD Templates
│   │   │   │   ├── suppressions/  # Blacklist & Protection Réputation
│   │   │   │   ├── tracking/      # Pixel 1x1 & Redirection proxy de clics
│   │   │   │   ├── webhooks/      # Dispatcher d'événements sortants
│   │   │   │   └── queues/        # Workers BullMQ (EmailProcessor, WebhookProcessor)
│   │   │   ├── transporters/      # Adapters (SMTP, SES, Mailpit Mock)
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── dashboard/                 # Interface Web React / Tailwind
│       ├── src/
│       │   ├── pages/             # Emails Logs, Domaines, Clés API, Templates, Suppression List
│       │   ├── components/        # Layout, Tables, Charts, Modals
│       │   └── services/          # Client API
│       └── package.json
│
└── packages/
    ├── sdk-node/                  # SDK TypeScript / Node.js (resend-like)
    └── sdk-browser/               # SDK JavaScript Navigateur (emailjs-like)
```

---

## 6. Feuille de Route d'Implémentation (Phasage)

```mermaid
flowchart LR
    P1["Phase 1 : Socle & Infra<br/>• Docker (Mongo, Redis, Mailpit)<br/>• Setup NestJS & Mongoose"] --> P2["Phase 2 : Authentification & Clés<br/>• Gestion sk_live & pk_live<br/>• Rate limiting & Guards CORS"]
    P2 --> P3["Phase 3 : Queue & Moteur d'Envoi<br/>• BullMQ Workers<br/>• Transporter Mailpit/SMTP<br/>• Compilation Handlebars"]
    P3 --> P4["Phase 4 : Tracking & Suppression<br/>• Pixel 1x1 & Redirect Proxy<br/>• Auto-Suppression bounces"]
    P4 --> P5["Phase 5 : Dashboard Web<br/>• Visualisation des logs live<br/>• Gestion des clés & templates"]
```
