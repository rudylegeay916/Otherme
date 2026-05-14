import type { IncomingMessage, ServerResponse } from 'http'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Vercel : raw body obligatoire pour que stripe.webhooks.constructEvent valide la signature
export const config = { api: { bodyParser: false } }

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end('Method not allowed')
    return
  }

  const stripeKey     = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    console.error('[webhook] STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET manquante')
    res.statusCode = 503
    res.end('Stripe non configuré')
    return
  }

  let rawBody: Buffer
  try {
    rawBody = await readRawBody(req)
  } catch (err) {
    console.error('[webhook] Erreur lecture body:', err)
    res.statusCode = 400
    res.end('Erreur lecture body')
    return
  }

  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] Signature invalide:', err)
    res.statusCode = 400
    res.end('Webhook Error: invalid signature')
    return
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break
    default:
      // Événement non géré — Stripe ne doit pas recevoir d'erreur pour ça
      break
  }

  // Toujours 200 après validation de signature pour éviter les retries Stripe inutiles
  res.statusCode = 200
  res.end(JSON.stringify({ received: true }))
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const reportId = session.metadata?.reportId

  if (!reportId) {
    console.warn(`[webhook] checkout.session.completed sans reportId — session: ${session.id}`)
    return
  }

  // Vérifier que le paiement est réellement validé
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    console.warn(
      `[webhook] Session ${session.id} non payée (payment_status: ${session.payment_status}) — ignorée`
    )
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('[webhook] VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante')
    return
  }

  try {
    const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    // Vérifier que le rapport existe — ne pas crasher si absent
    const { data: report, error: reportErr } = await sb
      .from('reports')
      .select('id, status')
      .eq('id', reportId)
      .single()

    if (reportErr || !report) {
      console.error(
        `[webhook] Rapport ${reportId} introuvable — session: ${session.id}`,
        reportErr?.message ?? 'null'
      )
      return
    }

    // Idempotence : si déjà payé, ne rien faire (webhook retry possible)
    if (report.status === 'paid' || report.status === 'complete') {
      console.log(`[webhook] Rapport ${reportId} déjà payé — session ${session.id} ignorée`)
      return
    }

    // Stocker le paiement avec tous les champs disponibles
    const { error: payErr } = await sb.from('payments').insert({
      report_id:              reportId,
      stripe_session_id:      session.id,
      stripe_customer_id:     (session.customer  as string | null) ?? null,
      stripe_subscription_id: (session.subscription as string | null) ?? null,
      amount_total:           session.amount_total ?? 1499,
      currency:               session.currency ?? 'eur',
      payment_status:         session.payment_status,
      paid_at:                new Date().toISOString(),
    })

    if (payErr) {
      // Doublon probable (retry Stripe) — logguer mais continuer pour mettre à jour le rapport
      console.warn(`[webhook] Insert payment ignoré pour session ${session.id}:`, payErr.message)
    }

    // Marquer le rapport comme payé
    const { error: updateErr } = await sb
      .from('reports')
      .update({ status: 'paid' })
      .eq('id', reportId)

    if (updateErr) {
      console.error(`[webhook] Erreur mise à jour rapport ${reportId}:`, updateErr.message)
    } else {
      console.log(`[webhook] ✅ Rapport ${reportId} marqué payé via webhook (session: ${session.id})`)
    }
  } catch (err) {
    console.error('[webhook] Erreur inattendue:', err)
  }
}
