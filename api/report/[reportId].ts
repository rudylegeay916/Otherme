import type { IncomingMessage, ServerResponse } from 'http'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'

// ── Token helpers (dupliqués depuis server/lib/accessToken.ts) ────────────────

function hmacHex(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex')
}

function parseCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined
  const entry = header.split(';').find(c => c.trim().startsWith(`${name}=`))
  return entry ? decodeURIComponent(entry.trim().slice(name.length + 1)) : undefined
}

function verifyAccessToken(token: string, expectedReportId: string): boolean {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return false
    const encoded = token.slice(0, dot)
    const sig     = token.slice(dot + 1)
    const secret  = process.env.ACCESS_TOKEN_SECRET ?? ''
    if (!secret) return false
    const expected = hmacHex(encoded, secret)
    const a = Buffer.from(sig,      'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as {
      reportId: string; sessionId: string; exp: number
    }
    if (Date.now() > payload.exp)              return false
    if (payload.reportId !== expectedReportId) return false
    return true
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────

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

    // Vérifier le token d'accès signé dans le cookie HttpOnly
    const cookieHeader = req.headers.cookie
    const rawToken     = parseCookie(cookieHeader, 'otherme_report_access')
    const tokenValid   = rawToken ? verifyAccessToken(rawToken, reportId) : false

    // Rapport payé mais token absent/invalide → 403
    if (isPaid && !tokenValid) {
      res.statusCode = 403
      res.end(JSON.stringify({ error: 'Accès au rapport non autorisé.', requiresToken: true }))
      return
    }

    const hasFullAccess = isPaid && tokenValid

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

      if (hasFullAccess) {
        // Rapport payé + token valide — contenu complet
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
      responsePayload.trajectories = hasFullAccess ? fullReport : []
    }

    res.statusCode = 200
    res.end(JSON.stringify(responsePayload))
  } catch (err) {
    console.error('[report] Erreur:', err)
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Erreur serveur' }))
  }
}
