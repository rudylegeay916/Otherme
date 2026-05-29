import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'
import { signAdminAccessToken, buildAccessCookie } from '../lib/accessToken'

const router = Router()

/**
 * Vérifie si un email est dans la liste admin.
 * La liste est définie dans la variable d'environnement ADMIN_EMAILS
 * (emails séparés par virgule, côté serveur uniquement — jamais exposé au client).
 */
function isAdminEmail(email: string): boolean {
  if (!env.adminEmails) return false
  return env.adminEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .includes(email.trim().toLowerCase())
}

/**
 * POST /api/admin/bypass
 *
 * Permet à un admin de contourner le paiement pour accéder au rapport complet.
 *
 * Sécurité :
 * - Requiert un Bearer token Supabase valide (l'utilisateur doit être connecté)
 * - Vérifie l'email de l'utilisateur authentifié côté serveur via ADMIN_EMAILS
 * - Génère un access token signé HMAC-SHA256 avec isAdmin: true
 * - Pose le même cookie HttpOnly que le flux de paiement normal
 * - Un attaquant sans compte admin ne peut pas obtenir ce token
 */
router.post('/bypass', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const bearerToken = authHeader.slice(7)
    const { reportId } = req.body as { reportId?: string }

    if (!reportId) {
      return res.status(400).json({ error: 'reportId manquant' })
    }

    // Vérifier le token Supabase côté serveur (service role)
    const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
    const { data: { user }, error } = await supabase.auth.getUser(bearerToken)

    if (error || !user?.email) {
      return res.status(401).json({ error: 'Token invalide ou expiré' })
    }

    if (!isAdminEmail(user.email)) {
      // On retourne 403 sans révéler que le mode admin existe
      return res.status(403).json({ error: 'Accès refusé' })
    }

    // Générer le token admin et poser le cookie
    const token = signAdminAccessToken(reportId, user.email)
    const cookie = buildAccessCookie(token, env.isProd)
    res.setHeader('Set-Cookie', cookie)

    console.log(`[admin] Bypass accordé pour ${user.email} → rapport ${reportId}`)
    return res.json({ authorized: true })
  } catch (err) {
    console.error('[admin] Erreur bypass:', err)
    return res.status(500).json({ error: 'Erreur interne' })
  }
})

/**
 * GET /api/admin/status
 *
 * Retourne uniquement des booléens de configuration.
 * Ne révèle jamais les valeurs des secrets.
 */
router.get('/status', (_req, res) => {
  return res.json({
    adminEmailsConfigured:        !!env.adminEmails,
    accessTokenSecretConfigured:  !!env.accessTokenSecret,
    supabaseConfigured:           !!(env.supabaseUrl && env.supabaseServiceRoleKey),
  })
})

export default router
