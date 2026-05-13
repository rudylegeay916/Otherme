import { Router } from 'express'
import { getReport } from '../lib/supabase'
import type { Report, Trajectory } from '../../src/types'

const router = Router()

// GET /api/report/:id
// Retourne le rapport avec les trajectoires masquées si non payé
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

    const report: Report = {
      id:           row.id,
      email:        '', // l'email n'est pas stocké directement dans reports
      firstName,
      status:       frontendStatus,
      trajectories: isPaid ? trajectories : maskLockedTrajectories(trajectories),
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
