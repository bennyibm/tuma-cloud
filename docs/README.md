# 📬 Plateforme d'Envoi d'Emails (Style Resend & EmailJS)
## Documentation d'Architecture, Spécifications & Stratégie Business

Bienvenue dans la documentation officielle de conception de la plateforme d'envoi d'emails. Ce dossier regroupe l'ensemble des analyses architecturales, modélisations de données, spécifications fonctionnelles, benchmark de marché, business plan et cahier des charges technique.

---

## 🎨 Diagrammes Éditables Draw.io (`docs/diagrams/`)

Tous les diagrammes sont modélisés au format natif **Draw.io (`.drawio`)**. Vous pouvez les ouvrir et les éditer directement avec :
- [app.diagrams.net](https://app.diagrams.net) *(Glisser-déposer le fichier `.drawio`)*
- L'extension VS Code **Draw.io Integration** (ou *Hediet Draw.io*)

| # | Diagramme Draw.io | Fichier Source | Description |
| :-: | :--- | :--- | :--- |
| **1** | **Architecture Globale** | [`01-architecture-globale.drawio`](./diagrams/01-architecture-globale.drawio) | Vue d'ensemble : Clients $\rightarrow$ API Gateway $\rightarrow$ Mongo/Redis $\rightarrow$ Workers $\rightarrow$ Transport & Tracking. |
| **2** | **Modèle de Données (ERD)** | [`02-database-model.drawio`](./diagrams/02-database-model.drawio) | Schéma Entité-Relation MongoDB des 8 collections avec PK/FK, types et cardinalités. |
| **3** | **Pipeline d'Envoi & Queues** | [`03-pipeline-envoi-queues.drawio`](./diagrams/03-pipeline-envoi-queues.drawio) | Architecture des 3 files BullMQ (`send`, `track`, `webhook`), DLQ et workers d'envoi. |
| **4** | **Cycle de Vie & Rebonds** | [`04-cycle-de-vie-tracking.drawio`](./diagrams/04-cycle-de-vie-tracking.drawio) | Machine à états du message, pixel, clics, soft/hard bounces et auto-suppression. |
| **5** | **Architecture Fonctionnelle** | [`05-architecture-fonctionnelle.drawio`](./diagrams/05-architecture-fonctionnelle.drawio) | Organisation en 8 domaines fonctionnels interconnectés (Sécurité, DNS, Templates, Ingestion, etc.). |
| **6** | **Architecture des Composants** | [`06-architecture-composants.drawio`](./diagrams/06-architecture-composants.drawio) | Découpage modulaire NestJS, couche d'accès aux données (Mongoose/Redis), Dashboard React et SDKs. |

---

## 📚 Sommaire de la Documentation Technique & Stratégique

| Document | Fichier | Description |
| :--- | :--- | :--- |
| **01. Périmètre MVP & Cas d'Usage** | [`01-mvp-scope-and-features.md`](./01-mvp-scope-and-features.md) | Personas cibles, fonctionnalités v1 vs v2+, contrats d'API développeurs, protection contre les abus. |
| **02. Modélisation Base de Données (MongoDB)** | [`02-database-design-and-data-model.md`](./02-database-design-and-data-model.md) | Spécification des 8 collections, index d'idempotence et optimisations de performance. |
| **03. Pipeline d'Envoi & Files d'Attente** | [`03-sending-pipeline-and-queue-architecture.md`](./03-sending-pipeline-and-queue-architecture.md) | Cycle de vie du message, architecture des files Redis/BullMQ, tracking temps réel, gestion des rebonds. |
| **04. Stack Technique & Composants** | [`04-technical-stack-and-infrastructure.md`](./04-technical-stack-and-infrastructure.md) | Architectures fonctionnelle et composants logiciels, Docker local (MongoDB, Redis, Mailpit) et roadmap. |
| **05. Benchmark Marché Congolais (RDC)** | [`05-benchmark-marche-congolais.md`](./05-benchmark-marche-congolais.md) | Analyse concurrentielle RDC/Afrique (Dream Digital, KoolSend, Resend, Brevo), freins paiements Mobile Money et opportunités. |
| **06. Business Plan & Modèle Économique** | [`06-business-plan.md`](./06-business-plan.md) | Tarification (Free, Starter, Pro, Scale), paiements Mobile Money CDF/USD, coûts unitaires, projections financières à 3 ans. |
| **07. Cahier des Charges (CdCF / CDCT)** | [`07-cahier-des-charges.md`](./07-cahier-des-charges.md) | Spécification exhaustive des 9 modules logiciels, orchestration complète de bout en bout, SLA, NFRs et plan de recette. |
| **08. Guide de Naming & Idées** | [`08-branding-et-naming.md`](./08-branding-et-naming.md) | Catalogue complet des noms créatifs, étymologies Lingala/Swahili, domaines et slogans. |
| **09. Charte Graphique & Design System** | [`09-charte-graphique-et-branding.md`](./09-charte-graphique-et-branding.md) | Identité visuelle officielle de TUMA, palette chromatique (Obsidian/Emerald/Solar), typographie et tokens Tailwind. |
| **10. Walkthrough & Preuves de Validation** | [`10-walkthrough-et-preuves-de-validation.md`](./10-walkthrough-et-preuves-de-validation.md) | Démonstration des fonctionnalités développées et preuves de concept validées. |
