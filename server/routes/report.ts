import { Router } from 'express'
import { getReport } from '../lib/supabase'
import type { Report, Trajectory } from '../../src/types'

const router = Router()

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const row = await getReport(id)

    if (!row) {
      return res.status(404).json({ message: 'Rapport introuvable' })
    }

    let trajectories: Trajectory[] = []
    if (row.report_full) {
      try {
        trajectories = JSON.parse(row.report_full) as Trajectory[]
      } catch {
        trajectories = []
      }
    }

    const isPaid = row.status === 'paid' || row.status === 'complete'

    // Only reveal all trajectories if paid; otherwise send all for preview display
    // (the frontend controls visibility — server just provides the data)
    const report: Report = {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      status: row.status,
      trajectories,
      createdAt: row.created_at,
    }

    // For unpaid reports, blur 2nd and 3rd trajectories server-side as well
    if (!isPaid && trajectories.length > 1) {
      report.trajectories = [
        trajectories[0],
        ...trajectories.slice(1).map((t) => ({
          ...t,
          description: ['Débloquez le rapport pour lire cette trajectoire.'],
          timeline: [],
          skillsToDevlop: [],
          feasibilityNote: '',
        })),
      ]
    }

    return res.json(report)
  } catch (err) {
    console.error('[report] Error:', err)
    return res.status(500).json({ message: 'Erreur interne du serveur' })
  }
})

export default router
