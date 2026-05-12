/**
 * src/config/env.ts
 *
 * Point d'entrée unique pour les variables d'environnement côté frontend.
 * Seules les variables VITE_* sont accessibles ici — Vite interdit l'accès
 * aux variables sans préfixe VITE_ depuis le bundle client.
 *
 * RÈGLE DE SÉCURITÉ : N'importer JAMAIS depuis server/ dans ce fichier.
 * Les clés secrètes (OPENAI_API_KEY, STRIPE_SECRET_KEY, etc.)
 * ne sont pas disponibles dans import.meta.env et ne doivent pas l'être.
 */

function get(key: string, fallback = ''): string {
  const value = (import.meta.env[key] as string | undefined) ?? fallback
  if (!value && import.meta.env.DEV) {
    console.warn(`[env] Variable frontend manquante : ${key}`)
  }
  return value
}

export const clientEnv = {
  // Supabase — clé anon (publique, protégée par les RLS Supabase)
  supabaseUrl:     get('VITE_SUPABASE_URL'),
  supabaseAnonKey: get('VITE_SUPABASE_ANON_KEY'),

  // Stripe — clé publiable uniquement (safe côté client)
  stripePublishableKey: get('VITE_STRIPE_PUBLISHABLE_KEY'),

  // App
  appUrl: get('VITE_APP_URL', window?.location?.origin ?? 'http://localhost:5173'),

  // Tracking — optionnel, absence = tracking désactivé silencieusement
  clarityProjectId: get('VITE_CLARITY_PROJECT_ID'),
  gaMeasurementId:  get('VITE_GA_MEASUREMENT_ID'),
} as const
