import type { IncomingMessage, ServerResponse } from 'http'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// bodyParser: false — on lit le raw body manuellement (requis pour Vercel + cohérence webhook)
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
    console.error('[create-checkout-session] STRIPE_SECRET_KEY manquante')
    res.statusCode = 503
    res.end(JSON.stringify({ error: 'Le paiement n\'a pas pu être lancé. Réessaie dans quelques instants.' }))
    return
  }

  try {
    const body = await readBody(req)
    const { reportId, email } = body

    if (!reportId || !email) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'reportId et email sont requis' }))
      return
    }

    // Vérifier si le rapport est déjà payé (ignoré pour les rapports mock)
    if (!reportId.startsWith('mock_')) {
      const supabaseUrl = process.env.VITE_SUPABASE_URL
      const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && serviceKey) {
        try {
          const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
          const { data: report } = await sb.from('reports').select('status').eq('id', reportId).single()
          if (report?.status === 'paid' || report?.status === 'complete') {
            res.statusCode = 409
            res.end(JSON.stringify({ error: 'Ce rapport est déjà payé', alreadyPaid: true }))
            return
          }
        } catch (dbErr) {
          // Supabase indisponible — on laisse passer, le webhook rétablira l'état
          console.warn('[create-checkout-session] Vérification Supabase ignorée:', dbErr)
        }
      }
    }

    const stripe  = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
    const appUrl  = (process.env.VITE_APP_URL || 'http://localhost:5173').replace(/\/$/, '')
    const priceId = process.env.STRIPE_PRICE_ID

    // Si STRIPE_PRICE_ID est défini on l'utilise, sinon on crée le prix à la volée
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [{
          price_data: {
            currency: 'eur',
            unit_amount: 1499, // 14,99 €
            product_data: {
              name: 'OtherMe — Rapport complet',
              description: '3 trajectoires alternatives · Timeline 5 ans · Plan d\'action 30 jours',
            },
          },
          quantity: 1,
        }]

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: lineItems,
      metadata: { reportId, product: 'otherme_premium' },
      success_url: `${appUrl}/success?report_id=${reportId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/cancel?report_id=${reportId}`,
      locale: 'fr',
    })

    if (!session.url) throw new Error('Stripe n\'a pas retourné d\'URL de paiement')

    res.statusCode = 200
    res.end(JSON.stringify({ url: session.url }))
  } catch (err) {
    console.error('[create-checkout-session]', err)
    res.statusCode = 500
    res.end(JSON.stringify({
      error: 'Le paiement n\'a pas pu être lancé. Réessaie dans quelques instants.',
    }))
  }
}
