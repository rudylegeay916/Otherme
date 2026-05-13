import type { IncomingMessage, ServerResponse } from 'http'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: true } }

async function readBody(req: IncomingMessage): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(data)) } catch { resolve({}) }
    })
    req.on('error', reject)
  })
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }))
    return
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    res.statusCode = 503
    res.end(JSON.stringify({ error: 'Stripe non configuré' }))
    return
  }

  try {
    const body = await readBody(req)
    const { reportId, email } = body

    if (!reportId || !email) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'reportId et email requis' }))
      return
    }

    // Vérifier que le rapport existe et n'est pas déjà payé
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && serviceKey) {
      const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
      const { data: report } = await sb.from('reports').select('status').eq('id', reportId).single()
      if (report?.status === 'paid' || report?.status === 'emailed') {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Ce rapport est déjà payé' }))
        return
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

    const coupon = await stripe.coupons.create({
      amount_off: 1000,
      currency: 'eur',
      duration: 'once',
      name: 'Offre de lancement — 1ère semaine',
    })

    const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173'
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      discounts: [{ coupon: coupon.id }],
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: 1499,
          recurring: { interval: 'week' },
          product_data: {
            name: 'OtherMe — Accès illimité',
            description: 'Tests illimités · 3 trajectoires par analyse · PDF personnalisé · Résiliable à tout moment',
          },
        },
        quantity: 1,
      }],
      metadata: { reportId },
      success_url: `${appUrl}/success?report_id=${reportId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/cancel?report_id=${reportId}`,
    })

    res.statusCode = 200
    res.end(JSON.stringify({ url: session.url }))
  } catch (err) {
    console.error('[stripe] create-checkout error:', err)
    res.statusCode = 500
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Erreur de paiement' }))
  }
}
