import { Router } from 'express'
import Stripe from 'stripe'
import { env } from '../config/env'
import {
  getReport,
  updateReportStatus,
  createPayment,
  createEmailLog,
  updateEmailLog,
  isWebhookProcessed,
  insertWebhookEvent,
  markWebhookProcessed,
} from '../lib/supabase'
import { generatePDF } from '../lib/pdf'
import { sendReportEmail } from '../lib/resend'
import type { Trajectory } from '../../src/types'

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2023-10-16',
})

// 14,99 €/semaine — prix récurrent
const WEEKLY_PRICE_CENTS = 1499
// 4,99 € première semaine — remise de 10 € sur la 1ère période
const FIRST_WEEK_DISCOUNT_CENTS = 1000

const router = Router()

// ── POST /api/stripe/create-checkout ─────────────────────────────
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

    if (report.status === 'paid' || report.status === 'emailed') {
      return res.status(400).json({ message: 'Ce rapport est déjà payé' })
    }

    // Coupon dynamique : 10 € de remise sur la 1ère semaine → 4,99 € au lieu de 14,99 €
    const coupon = await stripe.coupons.create({
      amount_off: FIRST_WEEK_DISCOUNT_CENTS,
      currency: 'eur',
      duration: 'once',
      name: 'Offre de lancement — 1ère semaine',
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      discounts: [{ coupon: coupon.id }],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: WEEKLY_PRICE_CENTS,
            recurring: { interval: 'week' },
            product_data: {
              name: 'OtherMe — Accès illimité',
              description: 'Tests illimités · 3 trajectoires par analyse · PDF personnalisé · Résiliable à tout moment',
            },
          },
          quantity: 1,
        },
      ],
      metadata: { reportId },
      success_url: `${env.appUrl}/success?report_id=${reportId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${env.appUrl}/cancel?report_id=${reportId}`,
    })

    return res.json({ url: session.url })
  } catch (err) {
    console.error('[stripe] create-checkout error:', err)
    return res.status(500).json({
      message: err instanceof Error ? err.message : 'Erreur de paiement',
    })
  }
})

// ── POST /api/stripe/webhook ──────────────────────────────────────
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, env.stripeWebhookSecret)
  } catch (err) {
    console.error('[stripe] Signature invalide:', err)
    return res.status(400).send('Webhook Error: invalid signature')
  }

  // Idempotence : ignorer les événements déjà traités
  try {
    const alreadyProcessed = await isWebhookProcessed(event.id)
    if (alreadyProcessed) {
      console.log(`[stripe] Événement déjà traité, ignoré : ${event.id}`)
      return res.sendStatus(200)
    }
  } catch (err) {
    console.error('[stripe] Erreur vérification idempotence:', err)
  }

  // Enregistrer l'événement
  let webhookRow: Awaited<ReturnType<typeof insertWebhookEvent>> | null = null
  try {
    webhookRow = await insertWebhookEvent(
      'stripe',
      event.id,
      event.type,
      event as unknown as Record<string, unknown>
    )
  } catch (err) {
    console.error('[stripe] Erreur insertion webhook_events:', err)
  }

  // Traitement : checkout.session.completed (one-time et subscription)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const reportId = session.metadata?.reportId

    if (!reportId) {
      console.error('[stripe] Metadata reportId manquant dans session:', session.id)
      return res.sendStatus(200)
    }

    let emailLogId: string | null = null

    try {
      const report = await getReport(reportId)
      if (!report) {
        throw new Error(`Rapport introuvable : ${reportId}`)
      }

      const payment = await createPayment({
        user_id:            report.user_id,
        report_id:          reportId,
        stripe_session_id:  session.id,
        stripe_customer_id: session.customer as string | null,
        amount_total:       session.amount_total ?? WEEKLY_PRICE_CENTS,
        currency:           session.currency ?? 'eur',
        payment_status:     session.payment_status,
      })

      await updateReportStatus(reportId, 'paid')

      const emailLog = await createEmailLog({
        user_id:         report.user_id,
        report_id:       reportId,
        payment_id:      payment.id,
        recipient_email: session.customer_email ?? '',
        status:          'pending',
      })
      emailLogId = emailLog.id

      const trajectories = report.full_report as Trajectory[]
      const recipientEmail = session.customer_email ?? ''
      const firstName = report.title?.split('pour ').pop() ?? 'toi'

      const pdfBuffer = await generatePDF(firstName, recipientEmail, trajectories)
      await sendReportEmail(recipientEmail, firstName, pdfBuffer)

      await updateEmailLog(emailLogId, 'sent')
      await updateReportStatus(reportId, 'emailed')

      if (webhookRow) {
        await markWebhookProcessed(webhookRow.id)
      }

      console.log(`[stripe] ✅ Rapport ${reportId} livré à ${recipientEmail}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[stripe] ❌ Erreur post-paiement rapport ${reportId}:`, err)

      if (emailLogId) {
        await updateEmailLog(emailLogId, 'failed', undefined, msg).catch(() => {})
      }

      await updateReportStatus(reportId, 'failed').catch(() => {})
    }
  }

  return res.sendStatus(200)
})

export default router
