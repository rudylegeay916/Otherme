import type { IncomingMessage, ServerResponse } from 'http'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const urlParts = req.url?.split('/') ?? []
  const reportId = urlParts[urlParts.length - 1]?.split('?')[0]

  if (!reportId) {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'reportId manquant' }))
    return
  }

  // Les IDs mock sont gérés côté client via sessionStorage
  if (reportId.startsWith('mock_')) {
    res.statusCode = 404
    res.end(JSON.stringify({ error: 'Rapport mock — données disponibles côté client' }))
    return
  }

  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    res.statusCode = 503
    res.end(JSON.stringify({ error: 'Supabase non configuré' }))
    return
  }

  try {
    const sb = createClient(url, key, { auth: { persistSession: false } })

    const { data: report, error } = await sb
      .from('reports')
      .select('id, status, full_report, title, created_at, onboarding_responses(raw_answers)')
      .eq('id', reportId)
      .single()

    if (error || !report) {
      res.statusCode = 404
      res.end(JSON.stringify({ error: 'Rapport introuvable' }))
      return
    }

    const rawAnswers = (report as any).onboarding_responses?.raw_answers as Record<string, unknown> | undefined
    const firstName  = (rawAnswers?.firstName as string) ?? report.title?.split('pour ').pop() ?? ''
    const email      = (rawAnswers?.email as string) ?? ''
    const fullReport = report.full_report as unknown
    const isPaid     = report.status === 'paid' || report.status === 'complete'

    // Detect new format (ReportData object with .paths) vs legacy (Trajectory[])
    const isNewFormat = fullReport && typeof fullReport === 'object' && !Array.isArray(fullReport)
      && 'paths' in (fullReport as Record<string, unknown>)

    const responsePayload: Record<string, unknown> = {
      id:        report.id,
      status:    report.status,
      firstName,
      email,
      createdAt: report.created_at,
    }

    if (isNewFormat) {
      const rd    = fullReport as Record<string, unknown>
      const paths = Array.isArray(rd.paths) ? rd.paths as Array<Record<string, unknown>> : []

      if (isPaid) {
        // Rapport payé — contenu complet
        responsePayload.paths            = paths
        responsePayload.reportSummary    = rd.reportSummary
        responsePayload.comparison       = rd.comparison
        responsePayload.bestFirstStep48h = rd.bestFirstStep48h
      } else {
        // Rapport non payé — données partielles uniquement (teaser Paywall)
        responsePayload.paths = paths.map((p) => ({
          pathType:        p.pathType,
          title:           p.title,
          sector:          p.sector,
          revenueEstimate: p.revenueEstimate,
          longDescription: typeof p.longDescription === 'string'
            ? p.longDescription.slice(0, 140)
            : '',
        }))
      }
    } else {
      // Legacy : full_report est Trajectory[]
      responsePayload.trajectories = isPaid ? fullReport : []
    }

    res.statusCode = 200
    res.end(JSON.stringify(responsePayload))
  } catch (err) {
    console.error('[report] Erreur:', err)
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Erreur serveur' }))
  }
}
