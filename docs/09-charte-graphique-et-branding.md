# 🎨 09. Charte Graphique, Identité Visuelle & Système de Design : TUMA

Ce document formalise l'**identité visuelle complète, la charte graphique, la palette de couleurs, la typographie, les déclinaisons de logos et les jetons de design (*Design Tokens*)** de la plateforme **TUMA**.

---

## 1. Histoire & Symbolisme de la Marque

```
 ┌───────────────────────────────────────────────────────────────────────────────────────────┐
 │                                 SIGNIFICATION DU SYMBOLE                                  │
 ├───────────────────────────────────────────────────────────────────────────────────────────┤
 │ • LE NOM : "TUMA" signifie "Envoyer / Transmettre" en Swahili.                            │
 │ • LE MONOGRAMME 'T' : Fusion géométrique entre la lettre 'T', le pli d'une enveloppe    │
 │   postale et une flèche cinétique orientée vers l'avant (symbole de vélocité).            │
 │ • LE GRADIENT SOLAIRE & ÉMERAUDE : Alliance entre la chaleur du soleil africain           │
 │   (#FF6B00 / #F59E0B) et la certitude de la délivrabilité boîte de réception (#10B981).   │
 └───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Les 4 Concepts de Logos Proposés

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             COMPARATIF DES 4 CONCEPTS DE LOGOS                                  │
├──────────────┬─────────────────────────────┬───────────────────────────┬─────────────────────────┤
│ Concept      │ Direction Artistique        │ Palette Principale        │ Ambiance & Impact       │
├──────────────┼─────────────────────────────┼───────────────────────────┼─────────────────────────┤
│ **A. Origami**│ Flèche & Pli Géométrique    │ Cyan Cyber & Émeraude     │ Supersonique, Précis    │
│ **B. Ruban** │ Monoline Infini Fluide      │ Orange Solaire & Violet   │ Moderne, Fintech, Doux  │
│ **C. Faucon**│ Écusson Aérodynamique Ailé  │ Bleu Cobalt & Éclair Cyan │ Puissant, Entreprise    │
│ **D. Suisse**│ Minimalisme Plat & Audacieux│ Blanc Pur & Vert Néon     │ Intemporel, Pur Dev     │
└──────────────┴─────────────────────────────┴───────────────────────────┴─────────────────────────┘
```

### Concept A : "The Kinetic Origami / Sonic Arrow"
- **Description** : Pliage géométrique ultra-net d'une enveloppe se déployant en une flèche supersonique formant un **T** majuscule.
- **Palette** : Dégradé cyan néon (`#06B6D4`) et vert émeraude (`#10B981`) sur fond obsidienne (`#0B0F19`).
- **Forces** : Incarnation directe de la précision algorithmique et de la vélocité.

### Concept B : "The Solar Ribbon / Infinite Wave"
- **Description** : Ruban monoline fluide et continu formant un **t** minuscule entrelacé avec une boucle infinie de communication.
- **Palette** : Dégradé orange solaire chaud (`#FF6B00`) et violet ultraviolet (`#8B5CF6`).
- **Forces** : Évoque la continuité de service 24/7, la fluidité des webhooks et l'accessibilité développeur.

### Concept C : "The Falcon / Lightning Wing"
- **Description** : Écusson angulaire aérodynamique représentant des ailes stylisées et un éclair formant un **T**.
- **Palette** : Bleu cobalt électrique (`#3B82F6`) et cyan étincelant (`#06B6D4`).
- **Forces** : Idéal pour asseoir une autorité d'infrastructure d'entreprise solide et rassurante pour les banques.

### Concept D : "The Swiss Minimalist Geometric Mark"
- **Description** : Composition géométrique ultra-épurée de 3 polygones blancs plats avec une incision vert néon subtile formant un **T** moderne et une boîte de réception.
- **Palette** : Blanc pur (`#FFFFFF`), vert néon (`#10B981`) sur noir mat profond (`#080B10`).
- **Forces** : Style intemporel d'une pureté absolue, rappelant les icônes de Vercel, Linear ou Raycast.

---

## 3. Palette Chromatique Officielle (*Color Palette & Hex Tokens*)

La palette de **TUMA** adopte les codes visuels des meilleures plateformes développeurs mondiales (*Linear, Vercel, Stripe*) avec une identité solaire africaine affirmée :

```
┌───────────────────────────┬──────────────┬──────────────────┬───────────────────────────────────────────┐
│ Nom de la Couleur         │ Code HEX     │ Valeur RGB       │ Rôle & Utilisation dans l'Interface       │
├───────────────────────────┼──────────────┼──────────────────┼───────────────────────────────────────────┤
│ 🌌 **Obsidian Dark**      │ `#0B0F19`    │ `rgb(11, 15, 25)`│ Fond principal de l'application & SDK     │
│ 🖤 **Canvas Pure Black**  │ `#030712`    │ `rgb(3, 7, 18)`  │ Arrière-plan profond et contraste terminal│
│ 📦 **Surface Card Dark**  │ `#111827`    │ `rgb(17, 24, 39)`│ Cartes, panneaux, formulaires, barres nav │
│ 🔲 **Border Muted Dark**  │ `#1F2937`    │ `rgb(31, 41, 55)`│ Bordures subtiles des composants UI       │
├───────────────────────────┼──────────────┼──────────────────┼───────────────────────────────────────────┤
│ 🟢 **Electric Emerald**   │ `#10B981`    │ `rgb(16, 185, 129)`│ Statut "Delivered", succès, CTA principal │
│ 🟠 **Solar Orange**       │ `#FF6B00`    │ `rgb(255, 107, 0)`│ Accent d'énergie, boutons d'action, feu   │
│ 🟡 **Solar Amber**        │ `#F59E0B`    │ `rgb(245, 158, 11)`│ Statut "Queued", avertissements, crédits  │
│ 🔵 **Cyber Cyan**         │ `#06B6D4`    │ `rgb(6, 182, 212)`│ Métriques de clics, Webhooks, API tags    │
│ 🔴 **Crimson Error**      │ `#EF4444`    │ `rgb(239, 68, 68)`│ Statut "Bounced", erreurs, suppression list│
├───────────────────────────┼──────────────┼──────────────────┼───────────────────────────────────────────┤
│ ⚪ **Text Primary**       │ `#F9FAFB`    │ `rgb(249, 250, 251)` Titres principaux et textes contrastés│
│ 🔘 **Text Secondary**     │ `#9CA3AF`    │ `rgb(156, 163, 175)` Sous-titres, labels, descriptions     │
└───────────────────────────┴──────────────┴──────────────────┴───────────────────────────────────────────┘
```

---

## 4. Typographie & Règles Typographiques

```
┌───────────────────────────┬───────────────────────────────┬──────────────────────────────────────────┐
│ Usage Interface           │ Famille de Police Recommandée │ Poids & Caractéristiques                 │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ **Titres & Identité**     │ **Inter / Plus Jakarta Sans** │ `font-bold` (700) à `font-black` (900)    │
│ **Corps de Texte & UI**   │ **Inter**                     │ `font-normal` (400) & `font-medium` (500)│
│ **Code, Clés API & Logs** │ **JetBrains Mono / Fira Code**│ `font-mono` (400 / 500) avec ligatures   │
└───────────────────────────┴───────────────────────────────┴──────────────────────────────────────────┘
```

### Exemple de Hiérarchie Typographique :
- **H1 Display** : `text-4xl font-extrabold tracking-tight text-white` (*"L'API d'envoi d'emails moderne"*)
- **H2 Section** : `text-2xl font-bold tracking-tight text-slate-100` (*"Métriques de livraison en temps réel"*)
- **H3 Card** : `text-lg font-semibold text-slate-200` (*"Domaines d'expédition"*`
- **Body UI** : `text-sm font-normal text-slate-400 leading-relaxed`
- **Code Block** : `font-mono text-xs text-emerald-400 bg-slate-950 p-4 rounded-lg`

---

## 5. Jetons de Design Tailwind CSS (`tailwind.config.js`)

Pour une cohérence absolue entre le Dashboard React et le site Web, voici la configuration officielle des tokens Tailwind :

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tuma: {
          bg: '#0B0F19',
          canvas: '#030712',
          card: '#111827',
          border: '#1F2937',
          emerald: '#10B981',
          orange: '#FF6B00',
          amber: '#F59E0B',
          cyan: '#06B6D4',
          crimson: '#EF4444',
          text: '#F9FAFB',
          muted: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-orange': '0 0 25px -5px rgba(255, 107, 0, 0.3)',
        'card-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
```

---

## 6. Composants UI Clés & Règles de Design

1. **Bouton Principal (*Primary CTA*)** :
   - Fond dégradé subtil `bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg shadow-glow-emerald transition-all`.
2. **Badges de Statuts (*Pills*)** :
   - `Delivered` : `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-mono font-medium`.
   - `Queued` : `bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-1 rounded-full font-mono font-medium`.
   - `Bounced` : `bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-2.5 py-1 rounded-full font-mono font-medium`.
3. **Cartes de Données (*Metric Cards*)** :
   - Fond `bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all shadow-card-dark`.
