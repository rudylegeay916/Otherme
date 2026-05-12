/**
 * server/config/env.ts
 *
 * Point d'entrée unique pour toutes les variables d'environnement du serveur.
 * Appelé en premier dans server/index.ts pour bloquer le démarrage
 * si une variable critique est manquante.
 *
 * RÈGLE DE SÉCURITÉ : Ce fichier ne doit JAMAIS être importé depuis src/ (frontend).
 * Les variables secrètes (sans VITE_) sont invisibles à Vite par conception.
 */

// ── Variables obligatoires au démarrage ──────────────────────────────────────

const REQUIRED: ReadonlyArray<{ key: string; hint: string }> = [
  {
    key: 'VITE_SUPABASE_URL',
    hint: 'Dashboard Supabase → Settings → API → Project URL',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    hint: 'Dashboard Supabase → Settings → API → service_role (secret)',
  },
  {
    key: 'OPENAI_API_KEY',
    hint: 'https://platform.openai.com/api-keys',
  },
  {
    key: 'STRIPE_SECRET_KEY',
    hint: 'Dashboard Stripe → Developers → API keys → Secret key',
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    hint: 'Dashboard Stripe → Developers → Webhooks → Signing secret (ou `stripe listen` en dev)',
  },
  {
    key: 'RESEND_API_KEY',
    hint: 'https://resend.com/api-keys',
  },
  {
    key: 'FROM_EMAIL',
    hint: 'Ex: OtherMe <noreply@tondomaine.com> — domaine vérifié dans Resend',
  },
]

// ── Variables optionnelles (dégradation gracieuse) ───────────────────────────

const OPTIONAL: ReadonlyArray<{ key: string; fallback: string; hint: string }> = [
  {
    key: 'VITE_APP_URL',
    fallback: 'http://localhost:5173',
    hint: 'URL publique de l\'app (ex: https://otherme.replit.app)',
  },
  {
    key: 'PORT',
    fallback: '3001',
    hint: 'Port du serveur Express (défaut: 3001)',
  },
]

// ── Validation ───────────────────────────────────────────────────────────────

export function validateEnv(): void {
  const missing = REQUIRED.filter(({ key }) => !process.env[key])

  if (missing.length === 0) return

  const separator = '─'.repeat(60)
  console.error(`\n${separator}`)
  console.error('❌  OtherMe — Variables d\'environnement manquantes\n')
  missing.forEach(({ key, hint }) => {
    console.error(`   • ${key}`)
    console.error(`     → ${hint}`)
  })
  console.error(`\n   Copiez .env.example vers .env et remplissez les valeurs.`)
  console.error(`${separator}\n`)
  process.exit(1)
}

// ── Objet d'accès typé ───────────────────────────────────────────────────────
// Utiliser cet objet dans tout le code serveur plutôt que process.env directement.

function get(key: string, fallback?: string): string {
  return process.env[key] ?? fallback ?? ''
}

export const env = {
  // Supabase (le serveur utilise la service_role key — jamais l'anon key)
  supabaseUrl:            get('VITE_SUPABASE_URL'),
  supabaseServiceRoleKey: get('SUPABASE_SERVICE_ROLE_KEY'),

  // OpenAI
  openaiApiKey: get('OPENAI_API_KEY'),

  // Stripe
  stripeSecretKey:    get('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: get('STRIPE_WEBHOOK_SECRET'),

  // Resend
  resendApiKey: get('RESEND_API_KEY'),
  fromEmail:    get('FROM_EMAIL'),

  // App
  appUrl:  get('VITE_APP_URL', 'http://localhost:5173'),
  port:    parseInt(get('PORT', '3001'), 10),
  isProd:  process.env.NODE_ENV === 'production',
} as const
