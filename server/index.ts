import 'dotenv/config'
// La validation doit être la première opération après le chargement de dotenv.
import { validateEnv, env } from './config/env'
validateEnv()

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import onboardingRouter from './routes/onboarding'
import reportRouter from './routes/report'
import stripeRouter from './routes/stripe'
import accessRouter from './routes/access'
import adminRouter from './routes/admin'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Raw body pour les webhooks Stripe (avant le middleware JSON) ──
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))

// ── Middleware standard ────────────────────────────────────
app.use(cors({ origin: env.appUrl }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes API ─────────────────────────────────────────────
app.use('/api/onboarding', onboardingRouter)
app.use('/api/report', reportRouter)
app.use('/api/stripe', stripeRouter)
app.use('/api', accessRouter)
app.use('/api/admin', adminRouter)

// ── 404 pour les routes /api/* inconnues ──────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API route not found' })
})

// ── Serve le frontend en production ──────────────────────
if (env.isProd) {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(env.port, '0.0.0.0', () => {
  console.log(`✅ OtherMe server running on port ${env.port}`)
  console.log(`   Mode    : ${env.isProd ? 'production' : 'development'}`)
  console.log(`   App URL : ${env.appUrl}`)
})
