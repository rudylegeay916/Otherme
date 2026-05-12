import { Router } from 'express'
import Stripe from 'stripe'
import { getReport, getReportBySessionId, markReportPaid, markReportComplete } from '../lib/supabase'
import { generatePDF } from '../lib/pdf'
import { sendReportEmail } from '../lib/resend'
import type { Trajectory } from '../../src/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const APP_URL = process.env.VITE_APP_URL || 'http://localhost:5173'
const PRICE_CENTS = 499 // 4,99 €

const router = Router()

// ── Create checkout session ────────────────────────────────
router.post('/create-checkout', async (req, res) => {
  try {
    const { reportId, email } = req.body as { reportId: string; email: string }

    if (!reportId || !email) {
      return res.status(400).json({ message: 'reportId et email requis' })
    }

    const report = await getReport(reportId)
    if (!report) {
      return res.status(404).json({ message: 'Rapport introuvable' })
    }

    if (report.status === 'paid' || report.status === 'complete') {
      return res.status(400).json({ message: 'Ce rapport est déjà payé' })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: PRICE_CENTS,
            product_data: {
              name: 'OtherMe — Rapport complet',
              description: '3 trajectoires de vie alternatives + PDF personnalisé',
              images: [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: { reportId },
      success_url: `${APP_URL}/success?report_id=${reportId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${APP_URL}/cancel?report_id=${reportId}`,
    })

    return res.json({ url: session.url })
  } catch (err) {
    console.error('[stripe] create-checkout error:', err)
    return res.status(500).json({
      message: err instanceof Error ? err.message : 'Erreur de paiement',
    })
  }
})

// ── Stripe webhook ─────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret)
  } catch (err) {
    console.error('[stripe] Webhook signature verification failed:', err)
    return res.status(400).send('Webhook Error')
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const reportId = session.metadata?.reportId

    if (!reportId) {
      console.error('[stripe] Missing reportId in session metadata')
      return res.sendStatus(200)
    }

    try {
      // Mark as paid
      await markReportPaid(reportId, session.id)

      // Fetch report from DB
      const report = await getReport(reportId)
      if (!report || !report.report_full) {
        console.error('[stripe] Report not found or no content:', reportId)
        return res.sendStatus(200)
      }

      const trajectories = JSON.parse(report.report_full) as Trajectory[]

      // Generate PDF
      const pdfBuffer = await generatePDF(report.first_name, report.email, trajectories)

      // Send email
      await sendReportEmail(report.email, report.first_name, pdfBuffer)

      // Mark as complete
      await markReportComplete(reportId)

      console.log(`[stripe] Report ${reportId} completed for ${report.email}`)
    } catch (err) {
      console.error('[stripe] Post-payment processing error:', err)
      // Don't return 500 — Stripe would retry. The report is marked as paid.
    }
  }

  return res.sendStatus(200)
})

export default router
