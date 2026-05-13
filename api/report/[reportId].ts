import type { IncomingMessage, ServerResponse } from 'http'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  // Extraire reportId depuis l'URL (/api/report/xxx)
  const urlParts = req.url?.split('/') ?? []
  const reportId = urlParts[urlParts.length - 1]?.split('?')[0]

  if (!reportId) {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'reportId manquant' }))
    return
  }

  // Les IDs mock n'existent pas en base — le frontend les gère via sessionStorage
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
    const firstName = (rawAnswers?.firstName as string) ?? report.title?.split('pour ').pop() ?? ''
    const email     = (rawAnswers?.email as string) ?? ''

    res.statusCode = 200
    res.end(JSON.stringify({
      id:           report.id,
      status:       report.status,
      trajectories: report.full_report,
      firstName,
      email,
      createdAt:    report.created_at,
    }))
  } catch (err) {
    console.error('[report] Erreur:', err)
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Erreur serveur' }))
  }
}
