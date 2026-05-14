import { Router } from 'express'
import { getReport } from '../lib/supabase'
import { verifyAccessToken, parseCookieHeader } from '../lib/accessToken'
import type { Report, Trajectory } from '../../src/types'

const router = Router()

// GET /api/report/:id
// Retourne le rapport complet si le token d'accès est valide, masqué sinon.
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const row = await getReport(id)

    if (!row) {
      return res.status(404).json({ message: 'Rapport introuvable' })
    }

    // full_report est maintenant du JSONB (tableau natif), pas une string JSON
    const trajectories: Trajectory[] = Array.isArray(row.full_report)
      ? (row.full_report as Trajectory[])
      : []

    const isPaid = row.status === 'paid' || row.status === 'emailed'

    // Vérifier le token d'accès signé dans le cookie HttpOnly
    const rawCookie = req.headers.cookie
    const token     = parseCookieHeader(rawCookie, 'otherme_report_access')
    const { valid } = token ? verifyAccessToken(token, id) : { valid: false }

    // Rapport complet uniquement si paid EN BASE et token valide
    const hasFullAccess = isPaid && valid

    // Adapter le statut interne au format attendu par le frontend
    const frontendStatus: Report['status'] = (() => {
      if (row.status === 'emailed') return 'complete'
      if (row.status === 'paid')    return 'paid'
      if (row.status === 'generated') return 'ready'
      return 'generating'
    })()

    // Extraire l'email depuis onboarding_data via le titre (fallback)
    // Le vrai email est dans onboarding_responses.raw_answers
    // Pour l'instant on expose ce qui est nécessaire au frontend
    const firstName = row.title?.split('pour ').pop() ?? ''

    // Si le rapport est payé mais que le token est absent/invalide, signaler sans exposer le contenu
    if (isPaid && !valid) {
      return res.status(403).json({
        message: 'Accès au rapport non autorisé.',
        requiresToken: true,
      })
    }

    const report: Report = {
      id:           row.id,
      email:        '', // l'email n'est pas stocké directement dans reports
      firstName,
      status:       frontendStatus,
      trajectories: hasFullAccess ? trajectories : maskLockedTrajectories(trajectories),
      createdAt:    row.created_at,
    }

    return res.json(report)
  } catch (err) {
    console.error('[report] Error:', err)
    return res.status(500).json({ message: 'Erreur interne du serveur' })
  }
})

function maskLockedTrajectories(trajectories: Trajectory[]): Trajectory[] {
  if (trajectories.length <= 1) return trajectories
  return [
    trajectories[0],
    ...trajectories.slice(1).map((t) => ({
      ...t,
      description:    ['Débloquez le rapport pour lire cette trajectoire.'],
      timeline:       [],
      skillsToDevlop: [],
      feasibilityNote: '',
    })),
  ]
}

export default router
