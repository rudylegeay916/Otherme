import { Router } from 'express'
import type { Request, Response } from 'express'
import Stripe from 'stripe'
import { env } from '../config/env'
import { getReport, updateReportStatus, createPayment } from '../lib/supabase'
import { signAccessToken, buildAccessCookie } from '../lib/accessToken'

const router = Router()

// ── POST /api/verify-payment ─────────────────────────────────────────────────
// Vérifie la session Stripe, met à jour la DB si nécessaire, émet le cookie d'accès.
router.post('/verify-payment', async (req: Request, res: Response) => {
  const { session_id: sessionId, reportId } = req.body as {
    session_id?: string
    reportId?:  string
  }

  if (!sessionId || !reportId) {
    return res.status(400).json({ verified: false, error: 'session_id et reportId requis' })
  }

  try {
    const stripe  = new Stripe(env.stripeSecretKey, { apiVersion: '2023-10-16' })
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return res.json({ verified: false, error: 'Session Stripe introuvable' })
    }

    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      return res.json({
        verified: false,
        error: "Le paiement n'a pas encore été confirmé. Veuillez finaliser votre accès pour consulter le rapport complet.",
      })
    }

    if (session.metadata?.reportId !== reportId) {
      return res.json({ verified: false, error: 'Ce rapport ne correspond pas à la session de paiement.' })
    }

    // Fallback webhook : mettre à jour la DB si le webhook est en retard
    try {
      const report = await getReport(reportId)
      if (report && report.status !== 'paid' && report.status !== 'emailed') {
        await updateReportStatus(reportId, 'paid')
        await createPayment({
          user_id:            report.user_id,
          report_id:          reportId,
          stripe_session_id:  session.id,
          stripe_customer_id: session.customer as string | null,
          amount_total:       session.amount_total ?? 1499,
          currency:           session.currency ?? 'eur',
          payment_status:     session.payment_status,
        }).catch(() => {
          // Doublon probable — continuer silencieusement
        })
      }
    } catch {
      // Supabase indisponible — on continue, le token reste valide
    }

    // Générer et poser le cookie HttpOnly signé
    const token = signAccessToken(reportId, sessionId)
    res.setHeader('Set-Cookie', buildAccessCookie(token, env.isProd))

    return res.json({ verified: true })
  } catch (err) {
    console.error('[verify-payment]', err)
    return res.status(500).json({
      verified: false,
      error: 'Impossible de vérifier le paiement. Vérifie ta connexion.',
    })
  }
})

export default router
