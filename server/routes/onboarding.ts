import { Router } from 'express'
import multer from 'multer'
import { createOnboardingResponse, createReport } from '../lib/supabase'
import { generateTrajectories } from '../lib/openai'
import type { OnboardingData, Trajectory } from '../../src/types'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    cb(null, allowed.includes(file.mimetype))
  },
})

async function extractCvText(file: Express.Multer.File): Promise<string> {
  try {
    if (file.mimetype === 'text/plain') {
      return file.buffer.toString('utf-8').slice(0, 3000)
    }
    if (file.mimetype === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
      const result = await pdfParse(file.buffer)
      return result.text.slice(0, 3000)
    }
  } catch {
    // Extraction optionnelle — échec silencieux
  }
  return ''
}

// Construit les champs structurés à partir des réponses du formulaire
function buildStructuredFields(data: OnboardingData): {
  current_situation: string
  regrets_or_desires: string
  goals: string
} {
  return {
    current_situation: [
      `Métier actuel : ${data.currentJob}`,
      `Secteur : ${data.sector}`,
      `Expérience : ${data.yearsExperience} an(s)`,
      `Formation : ${data.educationLevel} en ${data.educationField}`,
    ].join(' · '),

    regrets_or_desires: [
      `Rêve professionnel : ${data.dreamJob}`,
      `Valeurs importantes : ${data.values.join(', ')}`,
    ].join(' · '),

    goals: [
      `Points forts : ${data.strengths.join(', ')}`,
      `Langues : ${data.languages.join(', ')}`,
    ].join(' · '),
  }
}

router.post('/', upload.single('cv'), async (req, res) => {
  try {
    const body = req.body as Record<string, string>

    const parseArr = (key: string): string[] => {
      try { return JSON.parse(body[key] || '[]') } catch { return [] }
    }

    const data: OnboardingData = {
      firstName:       body.firstName?.trim() || '',
      email:           body.email?.trim().toLowerCase() || '',
      age:             parseInt(body.age) || 0,
      city:            body.city?.trim() || '',
      currentJob:      body.currentJob?.trim() || '',
      sector:          body.sector?.trim() || '',
      yearsExperience: parseInt(body.yearsExperience) || 0,
      educationLevel:  body.educationLevel?.trim() || '',
      educationField:  body.educationField?.trim() || '',
      dreamJob:        body.dreamJob?.trim() || '',
      values:          parseArr('values'),
      strengths:       parseArr('strengths'),
      languages:       parseArr('languages'),
    }

    if (!data.firstName || !data.email || !data.currentJob) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' })
    }

    // Extraction texte CV (optionnel)
    if (req.file) {
      data.cvText = await extractCvText(req.file)
    }

    // 1. Enregistrer les réponses d'onboarding
    const { current_situation, regrets_or_desires, goals } = buildStructuredFields(data)

    const onboardingRow = await createOnboardingResponse({
      user_id:            null, // flux anonyme — pas d'auth à cette étape
      current_situation,
      regrets_or_desires,
      goals,
      raw_answers:        data as unknown as Record<string, unknown>,
    })

    // 2. Générer les trajectoires via OpenAI
    const trajectories: Trajectory[] = await generateTrajectories(data)

    // 3. Créer le rapport
    const reportRow = await createReport({
      user_id:                null,
      onboarding_response_id: onboardingRow.id,
      title:                  `Trajectoires alternatives pour ${data.firstName}`,
      summary:                trajectories[0]?.tagline ?? '',
      full_report:            trajectories,
    })

    return res.json({ reportId: reportRow.id, status: reportRow.status })
  } catch (err) {
    console.error('[onboarding] Error:', err)
    return res.status(500).json({
      message: err instanceof Error ? err.message : 'Erreur interne du serveur',
    })
  }
})

export default router
