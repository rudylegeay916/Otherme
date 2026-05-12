import { Router } from 'express'
import multer from 'multer'
import { createReport, updateReportContent } from '../lib/supabase'
import { generateTrajectories } from '../lib/openai'
import type { OnboardingData } from '../../src/types'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    cb(null, allowed.includes(file.mimetype))
  },
})

async function extractCvText(file: Express.Multer.File): Promise<string> {
  try {
    if (file.mimetype === 'text/plain') {
      return file.buffer.toString('utf-8').slice(0, 3000)
    }
    if (file.mimetype === 'application/pdf') {
      // Dynamic require to avoid ESM issues with pdf-parse
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
      const result = await pdfParse(file.buffer)
      return result.text.slice(0, 3000)
    }
  } catch {
    // CV text extraction is optional — silently ignore errors
  }
  return ''
}

router.post('/', upload.single('cv'), async (req, res) => {
  try {
    const body = req.body as Record<string, string>

    // Parse arrays sent as JSON strings
    const parseArr = (key: string): string[] => {
      try { return JSON.parse(body[key] || '[]') } catch { return [] }
    }

    const data: OnboardingData = {
      firstName:      body.firstName?.trim() || '',
      email:          body.email?.trim().toLowerCase() || '',
      age:            parseInt(body.age) || 0,
      city:           body.city?.trim() || '',
      currentJob:     body.currentJob?.trim() || '',
      sector:         body.sector?.trim() || '',
      yearsExperience: parseInt(body.yearsExperience) || 0,
      educationLevel: body.educationLevel?.trim() || '',
      educationField: body.educationField?.trim() || '',
      dreamJob:       body.dreamJob?.trim() || '',
      values:         parseArr('values'),
      strengths:      parseArr('strengths'),
      languages:      parseArr('languages'),
    }

    // Basic validation
    if (!data.firstName || !data.email || !data.currentJob) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' })
    }

    // Extract CV text if provided
    if (req.file) {
      data.cvText = await extractCvText(req.file)
    }

    // Create report row in DB (status: generating)
    const report = await createReport(data.email, data.firstName, data as unknown as Record<string, unknown>)

    // Generate trajectories via OpenAI
    const trajectories = await generateTrajectories(data)

    // Save full report content
    await updateReportContent(report.id, JSON.stringify(trajectories))

    return res.json({ reportId: report.id, status: 'ready' })
  } catch (err) {
    console.error('[onboarding] Error:', err)
    return res.status(500).json({
      message: err instanceof Error ? err.message : 'Erreur interne du serveur',
    })
  }
})

export default router
