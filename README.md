# OtherMe

> **Et si tu avais choisi une autre vie ?**
> OtherMe analyse ton parcours et génère 3 trajectoires de vie alternatives personnalisées grâce à l'IA.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Base de données | Supabase (PostgreSQL) |
| IA | OpenAI GPT-4o |
| Paiement | Stripe Checkout |
| Emails | Resend + pdfkit |
| Hébergement | Replit |
| Tracking | Microsoft Clarity + Google Analytics 4 |

---

## Démarrage rapide

```bash
# 1. Cloner et installer
git clone https://github.com/rudylegeay916/Otherme.git
cd Otherme
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# → Éditer .env avec vos vraies clés (voir section ci-dessous)

# 3. Créer la table Supabase
# → Copier/coller supabase/schema.sql dans le SQL Editor de votre projet

# 4. Lancer en développement
npm run dev
# Frontend : http://localhost:5173
# Backend  : http://localhost:3001

# 5. Écouter les webhooks Stripe en local
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

---

## Configuration des variables d'environnement

### Règle de sécurité fondamentale

```
Variables VITE_*      →  Frontend + Backend   (valeurs publiques, bundle JS)
Variables sans VITE_  →  Backend uniquement   (valeurs secrètes, jamais exposées)
```

Vite enforce cette séparation au niveau du compilateur : les variables sans préfixe `VITE_`
sont physiquement absentes du bundle JavaScript envoyé au navigateur.

### Tableau complet des variables

#### Frontend public (`VITE_*`)

| Variable | Obligatoire | Description | Où trouver |
|---|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | URL du projet Supabase | Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Clé anon Supabase (publique, protégée par RLS) | Dashboard → Settings → API → anon public |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ | Clé publiable Stripe | Dashboard → Developers → API keys |
| `VITE_APP_URL` | ✅ | URL publique de l'app | `http://localhost:5173` en dev, URL Replit en prod |
| `VITE_CLARITY_PROJECT_ID` | ☑️ | ID projet Microsoft Clarity | [clarity.microsoft.com](https://clarity.microsoft.com) — vide = désactivé |
| `VITE_GA_MEASUREMENT_ID` | ☑️ | ID mesure Google Analytics 4 | Format `G-XXXXXXXXXX` — vide = désactivé |

#### Backend secret (sans `VITE_`)

| Variable | Obligatoire | Description | Où trouver |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Clé service_role Supabase (accès complet) | Dashboard → Settings → API → service_role |
| `OPENAI_API_KEY` | ✅ | Clé API OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `STRIPE_SECRET_KEY` | ✅ | Clé secrète Stripe | Dashboard → Developers → API keys → Secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Secret de signature des webhooks | Dashboard → Developers → Webhooks → Signing secret |
| `RESEND_API_KEY` | ✅ | Clé API Resend | [resend.com/api-keys](https://resend.com/api-keys) |
| `FROM_EMAIL` | ✅ | Adresse expéditeur (domaine vérifié) | Ex: `OtherMe <noreply@tondomaine.com>` |
| `PORT` | ☑️ | Port du serveur Express | Défaut: `3001` |

### Comportement en cas de variable manquante

Le serveur **refuse de démarrer** si une variable obligatoire est absente.
Le message d'erreur indique précisément ce qui manque :

```
────────────────────────────────────────────────────────────
❌  OtherMe — Variables d'environnement manquantes

   • OPENAI_API_KEY
     → https://platform.openai.com/api-keys

   • FROM_EMAIL
     → Ex: OtherMe <noreply@tondomaine.com> — domaine vérifié dans Resend

   Copiez .env.example vers .env et remplissez les valeurs.
────────────────────────────────────────────────────────────
```

En développement frontend, les variables `VITE_*` manquantes génèrent un `console.warn`
dans la console du navigateur (sans bloquer l'app).

### Architecture des fichiers de configuration

```
server/config/env.ts   ← Validation + objet env typé (backend uniquement)
src/config/env.ts      ← Objet clientEnv typé (frontend, VITE_* seulement)
src/components/
  Analytics.tsx        ← Injection GA4 + Clarity via React (lit clientEnv)
```

---

## Déploiement sur Replit

```bash
# 1. Variables d'environnement
#    → Replit → Secrets → ajouter chaque variable de .env.example

# 2. Build
npm run build

# 3. Démarrage
npm start
# Le serveur Express sert à la fois l'API (/api/*) et le frontend (dist/)
```

**Webhook Stripe en production**

Dans le Dashboard Stripe → Developers → Webhooks, ajouter un endpoint :
```
https://votre-app.replit.app/api/stripe/webhook
```
Événement à écouter : `checkout.session.completed`

Copier le **Signing secret** dans la variable `STRIPE_WEBHOOK_SECRET`.

---

## Structure du projet

```
Otherme/
├── src/                        # Frontend React
│   ├── components/
│   │   └── Analytics.tsx       # Injection GA4 + Clarity
│   ├── config/
│   │   └── env.ts              # Variables VITE_* typées
│   ├── lib/
│   │   ├── api.ts              # Appels vers le serveur
│   │   └── supabase.ts         # Client Supabase frontend
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Onboarding.tsx      # Formulaire 6 étapes
│   │   ├── Paywall.tsx         # Preview + Stripe CTA
│   │   ├── Success.tsx
│   │   └── Cancel.tsx
│   └── types/index.ts          # Types TypeScript partagés
│
├── server/                     # Backend Express
│   ├── config/
│   │   └── env.ts              # Validation + objet env typé
│   ├── lib/
│   │   ├── openai.ts           # Génération des trajectoires
│   │   ├── pdf.ts              # Génération PDF (pdfkit)
│   │   ├── resend.ts           # Envoi email + PDF
│   │   └── supabase.ts         # Client Supabase service_role
│   ├── routes/
│   │   ├── onboarding.ts       # POST /api/onboarding
│   │   ├── report.ts           # GET /api/report/:id
│   │   └── stripe.ts           # POST /api/stripe/*
│   └── index.ts                # Point d'entrée serveur
│
├── supabase/
│   └── schema.sql              # Schéma SQL à exécuter dans Supabase
│
├── .env.example                # Template des variables (sans valeurs)
├── .gitignore                  # .env exclu du dépôt git
└── README.md
```

---

## Schéma Supabase

Exécuter `supabase/schema.sql` dans le **SQL Editor** du projet Supabase.

Table créée : `reports`

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant unique du rapport |
| `email` | TEXT | Email de l'utilisateur |
| `first_name` | TEXT | Prénom |
| `onboarding_data` | JSONB | Données du formulaire |
| `report_full` | TEXT | JSON des 3 trajectoires générées |
| `status` | TEXT | `generating` → `ready` → `paid` → `complete` |
| `stripe_session_id` | TEXT | ID session Stripe (unique) |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Mis à jour automatiquement par trigger |

---

## Licence

Propriétaire — © 2025 OtherMe. Tous droits réservés.
