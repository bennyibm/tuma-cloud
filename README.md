# 🚀 TUMA — Developer Email Cloud Platform

> **"TUMA"** (*Envoyer / Transmettre* en Swahili) est une infrastructure cloud unifiée d'envoi d'emails transactionnels à très haute vélocité, conçue pour les développeurs modernes et intégrant nativement les moyens de paiement locaux africains (**Mobile Money** & Cartes Bancaires).

---

## 📦 Architecture du Répertoire

```
tuma/
├── apps/
│   └── api/                  # Backend Core NestJS (API REST, Mongoose, BullMQ)
├── docs/                     # Documentation d'Architecture, CDCF, Business Plan & Charte
│   ├── brand/                # Assets graphiques, logos officiels & palettes
│   └── diagrams/             # 6 Diagrammes éditables Draw.io
├── scripts/                  # Scripts utilitaires & tests d'envoi
├── docker-compose.yml        # Stack locale (MongoDB 7 + Redis 7 + Mailpit + Mongo Express)
├── .env                      # Configuration locale
└── README.md
```

---

## ⚡ Démarrage Rapide

### 1. Démarrer l'Infrastructure Docker
```bash
docker compose up -d
```
- **MongoDB 7** : `localhost:27017`
- **Mongo Express** : `http://localhost:8081`
- **Redis 7** : `localhost:6379`
- **Mailpit (Web UI Inbox)** : `http://localhost:8025`
- **Mailpit (SMTP)** : `localhost:1025`

### 2. Démarrer le Backend API (NestJS)
```bash
cd apps/api
npm install
npm run start:dev
```
L'API démarre sur `http://localhost:3000`.

### 3. Tester un Envoi d'Email
```bash
./scripts/test-send.sh
```
Puis ouvrez votre navigateur sur **`http://localhost:8025`** pour observer l'email reçu en temps réel !
