import type { IncomingMessage, ServerResponse } from 'http'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'

export const config = { api: { bodyParser: false } }

// ── Token helpers (dupliqués depuis server/lib/accessToken.ts pour éviter les imports cross-codebase) ──

function hmac(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex')
}

function signAccessToken(reportId: string, sessionId: string): string {
  const payload = JSON.stringify({ reportId, sessionId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  const encoded = Buffer.from(payload).toString('base64url')
  const secret  = process.env.ACCESS_TOKEN_SECRET ?? ''
  return `${encoded}.${hmac(encoded, secret)}`
}

function buildAccessCookie(token: string): string {
  const isProd  = process.env.NODE_ENV === 'production'
  const secure  = isProd ? ' Secure;' : ''
  return `otherme_report_access=${encodeURIComponent(token)}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=604800`
}

// ─────────────────────────────────────────────────────────────────────────────

function readBody(req: IncomingMessage): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', chunk => { raw += String(chunk) })
    req.on('end', () => {
      try { resolve(JSON.parse(raw)) } catch { resolve({}) }
    })
    req.on('error', reject)
  })
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    res.statusCode = 503
    res.end(JSON.stringify({ verified: false, error: 'Service de paiement non configuré' }))
    return
  }

  try {
    const body = await readBody(req)
    const { session_id, reportId } = body

    if (!session_id || !reportId) {
      res.statusCode = 400
      res.end(JSON.stringify({ verified: false, error: 'session_id et reportId sont requis' }))
      return
    }

    // ── 1. Récupérer la session Stripe ──────────────────────────────
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.retrieve(session_id)
    } catch {
      res.statusCode = 404
      res.end(JSON.stringify({ verified: false, error: 'Session Stripe introuvable' }))
      return
    }

    // ── 2. Vérifier le paiement et la correspondance reportId ───────
    const paymentOk = session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
    const metaMatch = session.metadata?.reportId === reportId

    if (!paymentOk || !metaMatch) {
      res.statusCode = 200
      res.end(JSON.stringify({
        verified: false,
        error: "Le paiement n'a pas encore été confirmé. Veuillez finaliser votre accès pour consulter le rapport complet.",
      }))
      return
    }

    // ── 3. Fallback webhook : mettre à jour Supabase si nécessaire ───
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceKey && !reportId.startsWith('mock_')) {
      try {
        const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

        const { data: existing } = await sb
          .from('reports')
          .select('status')
          .eq('id', reportId)
          .single()

        if (existing && existing.status !== 'paid' && existing.status !== 'complete') {
          await sb.from('reports').update({ status: 'paid' }).eq('id', reportId)
          await sb.from('payments').insert({
            report_id:          reportId,
            stripe_session_id:  session.id,
            stripe_customer_id: session.customer as string | null,
            amount_total:       session.amount_total ?? 1499,
            currency:           session.currency ?? 'eur',
            payment_status:     session.payment_status,
            paid_at:            new Date().toISOString(),
          })
          console.log(`[verify-payment] ✅ Rapport ${reportId} marqué payé (fallback webhook)`)
        }
      } catch (dbErr) {
        console.warn('[verify-payment] Mise à jour Supabase ignorée:', dbErr)
      }
    }

    // ── 4. Émettre le cookie d'accès signé ───────────────────────────
    const token = signAccessToken(reportId, session_id)
    res.setHeader('Set-Cookie', buildAccessCookie(token))

    res.statusCode = 200
    res.end(JSON.stringify({ verified: true }))
  } catch (err) {
    console.error('[verify-payment]', err)
    res.statusCode = 500
    res.end(JSON.stringify({ verified: false, error: 'Erreur lors de la vérification du paiement' }))
  }
}
