import type { IncomingMessage, ServerResponse } from 'http'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Vercel : désactiver le body parser pour accéder au raw body (requis par Stripe)
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

  const stripeKey    = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    res.statusCode = 503
    res.end('Stripe non configuré')
    return
  }

  const rawBody = await readRawBody(req)
  const sig     = req.headers['stripe-signature'] as string

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

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object as Stripe.Checkout.Session
    const reportId = session.metadata?.reportId
    if (!reportId) {
      res.statusCode = 200
      res.end()
      return
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceKey) {
      try {
        const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

        await sb.from('payments').insert({
          report_id:          reportId,
          stripe_session_id:  session.id,
          stripe_customer_id: session.customer as string | null,
          amount_total:       session.amount_total ?? 1499,
          currency:           session.currency ?? 'eur',
          payment_status:     session.payment_status,
        })

        await sb.from('reports').update({ status: 'paid' }).eq('id', reportId)

        console.log(`[webhook] ✅ Rapport ${reportId} marqué payé`)
      } catch (err) {
        console.error('[webhook] Erreur Supabase:', err)
      }
    }
  }

  res.statusCode = 200
  res.end()
}
