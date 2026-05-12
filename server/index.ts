import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import onboardingRouter from './routes/onboarding'
import reportRouter from './routes/report'
import stripeRouter from './routes/stripe'

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Raw body for Stripe webhooks (must be before json middleware) ──
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))

// ── Standard middleware ────────────────────────────────────
app.use(cors({ origin: process.env.VITE_APP_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── API routes ─────────────────────────────────────────────
app.use('/api/onboarding', onboardingRouter)
app.use('/api/report', reportRouter)
app.use('/api/stripe', stripeRouter)

// ── Serve frontend in production ──────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ OtherMe server running on port ${PORT}`)
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`)
})
