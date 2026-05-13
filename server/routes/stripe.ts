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

const PRICE_CENTS = 499 // 4,99 €

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

  // 1. Vérification de la signature Stripe
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, env.stripeWebhookSecret)
  } catch (err) {
    console.error('[stripe] Signature invalide:', err)
    return res.status(400).send('Webhook Error: invalid signature')
  }

  // 2. Idempotence : ignorer les événements déjà traités
  try {
    const alreadyProcessed = await isWebhookProcessed(event.id)
    if (alreadyProcessed) {
      console.log(`[stripe] Événement déjà traité, ignoré : ${event.id}`)
      return res.sendStatus(200)
    }
  } catch (err) {
    console.error('[stripe] Erreur vérification idempotence:', err)
    // On continue quand même pour ne pas bloquer Stripe
  }

  // 3. Enregistrer l'événement (idempotence)
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

  // 4. Traitement selon le type d'événement
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const reportId = session.metadata?.reportId

    if (!reportId) {
      console.error('[stripe] Metadata reportId manquant dans session:', session.id)
      return res.sendStatus(200)
    }

    let emailLogId: string | null = null

    try {
      // 4a. Récupérer le rapport
      const report = await getReport(reportId)
      if (!report) {
        throw new Error(`Rapport introuvable : ${reportId}`)
      }

      // 4b. Créer l'enregistrement de paiement
      const payment = await createPayment({
        user_id:            report.user_id,
        report_id:          reportId,
        stripe_session_id:  session.id,
        stripe_customer_id: session.customer as string | null,
        amount_total:       session.amount_total ?? PRICE_CENTS,
        currency:           session.currency ?? 'eur',
        payment_status:     session.payment_status,
      })

      // 4c. Marquer le rapport comme payé
      await updateReportStatus(reportId, 'paid')

      // 4d. Préparer le log email
      const emailLog = await createEmailLog({
        user_id:         report.user_id,
        report_id:       reportId,
        payment_id:      payment.id,
        recipient_email: session.customer_email ?? '',
        status:          'pending',
      })
      emailLogId = emailLog.id

      // 4e. Générer le PDF
      const trajectories = report.full_report as Trajectory[]
      const recipientEmail = session.customer_email ?? ''
      // Extraire le prénom depuis le titre du rapport (ex: "Trajectoires alternatives pour Marie")
      const firstName = report.title?.split('pour ').pop() ?? 'toi'

      const pdfBuffer = await generatePDF(firstName, recipientEmail, trajectories)

      // 4f. Envoyer l'email via Resend
      await sendReportEmail(recipientEmail, firstName, pdfBuffer)

      // 4g. Mettre à jour le log email et le statut du rapport
      await updateEmailLog(emailLogId, 'sent')
      await updateReportStatus(reportId, 'emailed')

      // 4h. Marquer l'événement comme traité
      if (webhookRow) {
        await markWebhookProcessed(webhookRow.id)
      }

      console.log(`[stripe] ✅ Rapport ${reportId} livré à ${recipientEmail}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[stripe] ❌ Erreur post-paiement rapport ${reportId}:`, err)

      // Enregistrer l'erreur dans le log email si créé
      if (emailLogId) {
        await updateEmailLog(emailLogId, 'failed', undefined, msg).catch(() => {})
      }

      // Marquer le rapport en échec pour investigation
      await updateReportStatus(reportId, 'failed').catch(() => {})

      // Ne pas retourner 500 — Stripe réessaierait et le paiement est déjà enregistré
    }
  }

  return res.sendStatus(200)
})

export default router
