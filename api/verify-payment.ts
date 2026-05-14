import type { IncomingMessage, ServerResponse } from 'http'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

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

    // ── 2. Vérifier le paiement ─────────────────────────────────────
    const paymentOk = session.payment_status === 'paid'

    // Vérifier que le reportId correspond aux metadata (si présent)
    const metaReportId = session.metadata?.reportId
    const reportMatch  = !metaReportId || metaReportId === reportId

    if (!paymentOk || !reportMatch) {
      res.statusCode = 200
      res.end(JSON.stringify({
        verified: false,
        error: 'Le paiement n\'a pas encore été confirmé. Veuillez finaliser votre accès pour consulter le rapport complet.',
      }))
      return
    }

    // ── 3. Mettre à jour Supabase (fallback si le webhook n'est pas arrivé) ──
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceKey && !reportId.startsWith('mock_')) {
      try {
        const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

        // Met à jour le statut uniquement si pas encore payé
        const { data: existing } = await sb
          .from('reports')
          .select('status')
          .eq('id', reportId)
          .single()

        if (existing && existing.status !== 'paid' && existing.status !== 'complete') {
          await sb.from('reports').update({ status: 'paid' }).eq('id', reportId)

          // Enregistre le paiement — ignore les doublons si le webhook est arrivé entre temps
          await sb.from('payments').insert({
            report_id:          reportId,
            stripe_session_id:  session.id,
            stripe_customer_id: session.customer as string | null,
            amount_total:       session.amount_total ?? 1499,
            currency:           session.currency ?? 'eur',
            payment_status:     session.payment_status,
          }).then(() => {}).catch(() => {})  // doublon webhook → silencieux

          console.log(`[verify-payment] ✅ Rapport ${reportId} marqué payé (fallback webhook)`)
        }
      } catch (dbErr) {
        // Supabase down — Stripe a confirmé, on retourne quand même verified:true
        console.warn('[verify-payment] Mise à jour Supabase ignorée:', dbErr)
      }
    }

    res.statusCode = 200
    res.end(JSON.stringify({ verified: true }))
  } catch (err) {
    console.error('[verify-payment]', err)
    res.statusCode = 500
    res.end(JSON.stringify({ verified: false, error: 'Erreur lors de la vérification du paiement' }))
  }
}
