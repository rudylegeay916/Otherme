import { Router } from 'express'
import { getReport, getOnboardingResponseById } from '../lib/supabase'
import { verifyAccessToken, parseCookieHeader } from '../lib/accessToken'
import type { Report, Trajectory, PathData, ReportComparison, CvInfluence } from '../../src/types'

const router = Router()

// GET /api/report/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const row = await getReport(id)

    if (!row) {
      return res.status(404).json({ message: 'Rapport introuvable' })
    }

    // ── Détection du format full_report ──────────────────────────────
    // Nouveau format (Phase 1+) : objet { paths: PathData[], reportSummary, ... }
    // Legacy format              : Trajectory[] (anciens rapports)
    const rawFull = row.full_report as Record<string, unknown> | Trajectory[]

    let paths: PathData[] = []
    let trajectories: Trajectory[] = []
    let reportSummary: string | undefined
    let comparison: ReportComparison | undefined
    let bestFirstStep48h: string | undefined
    let cvInfluence: CvInfluence | undefined

    if (Array.isArray(rawFull)) {
      // Legacy
      trajectories = rawFull as Trajectory[]
    } else if (rawFull && typeof rawFull === 'object' && Array.isArray((rawFull as Record<string, unknown>).paths)) {
      const fr = rawFull as Record<string, unknown>
      paths            = fr.paths as PathData[]
      reportSummary    = typeof fr.reportSummary    === 'string' ? fr.reportSummary    : undefined
      bestFirstStep48h = typeof fr.bestFirstStep48h === 'string' ? fr.bestFirstStep48h : undefined
      comparison       = fr.comparison  ? (fr.comparison  as ReportComparison) : undefined
      cvInfluence      = fr.cvInfluence ? (fr.cvInfluence as CvInfluence)      : undefined
    }

    // ── Récupération de l'email et prénom via onboarding_responses ───
    let email     = ''
    let firstName = ''
    if (row.onboarding_response_id) {
      const ob = await getOnboardingResponseById(row.onboarding_response_id)
      if (ob?.raw_answers) {
        const raw = ob.raw_answers as Record<string, unknown>
        email     = typeof raw.email     === 'string' ? raw.email     : ''
        firstName = typeof raw.firstName === 'string' ? raw.firstName : ''
      }
    }
    // Fallback prénom depuis le titre du rapport
    if (!firstName) firstName = row.title?.split('pour ').pop()?.trim() ?? ''

    // ── Accès ────────────────────────────────────────────────────────
    const isPaid = row.status === 'paid' || row.status === 'emailed'

    const rawCookie = req.headers.cookie
    const token     = parseCookieHeader(rawCookie, 'otherme_report_access')
    const { valid, isAdmin } = token
      ? verifyAccessToken(token, id)
      : { valid: false, isAdmin: false }

    const hasFullAccess = (isPaid && valid) || (valid && isAdmin === true)

    // Rapport payé mais token absent/invalide → bloquer
    // (les admins ont un token isAdmin:true → ils passent)
    if (isPaid && !valid) {
      return res.status(403).json({
        message:       'Accès au rapport non autorisé.',
        requiresToken: true,
      })
    }

    // ── Statut frontend ──────────────────────────────────────────────
    const frontendStatus: Report['status'] = (() => {
      if (row.status === 'emailed')   return 'complete'
      if (row.status === 'paid')      return 'paid'
      if (row.status === 'generated') return 'ready'
      return 'generating'
    })()

    // ── Réponse ──────────────────────────────────────────────────────
    const report: Report = {
      id:              row.id,
      email,
      firstName,
      status:          frontendStatus,
      // Nouveau format (paths)
      paths:           hasFullAccess ? paths : buildTeaserPaths(paths),
      // Legacy format (trajectories)
      trajectories:    hasFullAccess ? trajectories : maskLockedTrajectories(trajectories),
      // Champs rapport complet — uniquement si accès complet
      reportSummary:   hasFullAccess ? reportSummary   : undefined,
      comparison:      hasFullAccess ? comparison      : undefined,
      bestFirstStep48h: hasFullAccess ? bestFirstStep48h : undefined,
      cvInfluence:     hasFullAccess ? cvInfluence     : undefined,
      createdAt:       row.created_at,
    }

    console.log(`[report] GET ${id} — format:${paths.length > 0 ? 'new' : trajectories.length > 0 ? 'legacy' : 'empty'} status:${row.status} hasFullAccess:${hasFullAccess} paths:${paths.length}`)

    return res.json(report)
  } catch (err) {
    console.error('[report] Error:', err)
    return res.status(500).json({ message: 'Erreur interne du serveur' })
  }
})

// Teaser : uniquement les champs nécessaires à l'aperçu paywall
function buildTeaserPaths(paths: PathData[]): Partial<PathData>[] {
  return paths.map((p) => ({
    pathType:                   p.pathType,
    title:                      p.title,
    sector:                     p.sector,
    revenueEstimate:            p.revenueEstimate,
    riskLevel:                  p.riskLevel,
    fitScore:                   p.fitScore,
    alignmentScore:             p.alignmentScore,
    personalCompatibilityScore: p.personalCompatibilityScore,
    feasibilityScore:           p.feasibilityScore,
    marketOpportunityScore:     p.marketOpportunityScore,
    transitionEffortScore:      p.transitionEffortScore,
    // Premier extrait de la description pour le dégradé masqué
    longDescription:            (p.longDescription ?? '').slice(0, 500),
  }))
}

// Legacy : masquer les trajectoires 2 et 3 pour les rapports non payés
function maskLockedTrajectories(trajectories: Trajectory[]): Trajectory[] {
  if (trajectories.length <= 1) return trajectories
  return [
    trajectories[0],
    ...trajectories.slice(1).map((t) => ({
      ...t,
      description:     ['Débloquez le rapport pour lire cette trajectoire.'],
      timeline:        [],
      skillsToDevlop:  [],
      feasibilityNote: '',
    })),
  ]
}

export default router
