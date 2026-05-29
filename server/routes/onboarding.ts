import { Router } from 'express'
import multer from 'multer'
import mammoth from 'mammoth'
import { supabase, createOnboardingResponse, createReport } from '../lib/supabase'
import { generateTrajectories } from '../lib/openai'
import type { OnboardingData, QuestionAnswer } from '../../src/types'
import type { GeneratedReport } from '../lib/openai'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf', 'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    cb(null, allowed.includes(file.mimetype))
  },
})

function cleanExtractedText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]{3,}/g, '  ')   // normalise les espaces/tabs excessifs
    .replace(/\n{4,}/g, '\n\n\n')  // limite les lignes vides consécutives
    .trim()
}

async function extractCvText(file: Express.Multer.File): Promise<string> {
  const { mimetype, size } = file
  try {
    if (mimetype === 'text/plain') {
      const text = cleanExtractedText(file.buffer.toString('utf-8')).slice(0, 8000)
      console.log(`[cv] TXT extrait — ${text.length} chars (fichier: ${size}b)`)
      return text
    }

    if (mimetype === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
      const result = await pdfParse(file.buffer)
      const text = cleanExtractedText(result.text).slice(0, 8000)
      console.log(`[cv] PDF extrait — ${text.length} chars (fichier: ${size}b)`)
      return text
    }

    if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer })
      if (result.messages.some(m => m.type === 'error')) {
        console.warn(`[cv] DOCX — ${result.messages.filter(m => m.type === 'error').length} erreur(s) de conversion`)
      }
      const text = cleanExtractedText(result.value).slice(0, 8000)
      if (!text.trim()) {
        console.warn('[cv] DOCX extrait vide — fichier peut-être protégé ou corrompu')
        return ''
      }
      console.log(`[cv] DOCX extrait — ${text.length} chars (fichier: ${size}b)`)
      return text
    }
  } catch (err) {
    console.warn(`[cv] Extraction échouée (${mimetype}, ${size}b): ${err instanceof Error ? err.message : String(err)}`)
  }
  return ''
}

async function getUserIdFromBearer(authHeader?: string): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const { data } = await supabase.auth.getUser(token)
  return data.user?.id ?? null
}

function parseAnswers(raw: string | undefined): Record<string, QuestionAnswer> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const result: Record<string, QuestionAnswer> = {}
    for (const [key, val] of Object.entries(parsed)) {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const v = val as Record<string, unknown>
        result[key] = {
          selectedOptions: Array.isArray(v.selectedOptions) ? (v.selectedOptions as string[]) : [],
          freeText: typeof v.freeText === 'string' ? v.freeText : '',
        }
      }
    }
    return result
  } catch { return {} }
}

router.post('/', upload.single('cv'), async (req, res) => {
  try {
    const body = req.body as Record<string, string>

    const answers = parseAnswers(body.answers)

    const data: OnboardingData = {
      firstName:       body.firstName?.trim() || '',
      email:           body.email?.trim().toLowerCase() || '',
      age:             parseInt(body.age) || 0,
      currentSituation: body.currentSituation?.trim() || '',
      gender:          body.gender?.trim() || undefined,
      city:            body.city?.trim() || undefined,
      currentJob:      body.currentJob?.trim() || undefined,
      sector:          body.sector?.trim() || undefined,
      yearsExperience: body.yearsExperience ? parseInt(body.yearsExperience) : undefined,
      educationLevel:  body.educationLevel?.trim() || undefined,
      educationField:  body.educationField?.trim() || undefined,
      languages:       body.languages ? (JSON.parse(body.languages) as string[]) : undefined,
      answers,
    }

    if (!data.firstName || !data.email) {
      return res.status(400).json({ message: 'Prénom et email sont obligatoires' })
    }

    if (req.file) {
      data.cvText = await extractCvText(req.file)
    }

    // ── Logs diagnostiques (sans données sensibles) ───────────────────
    const a = data.answers ?? {}
    const phase1Keys = ['drains', 'vision5y', 'role', 'relation', 'timeActivity', 'realisticPath', 'successCriteria', 'profile']
    const filledPhase1 = phase1Keys.filter(k => {
      const ans = a[k]
      return ans && (ans.selectedOptions.length > 0 || ans.freeText.trim().length > 0)
    })
    const totalAnswers  = Object.keys(a).length
    const adaptiveCount = Object.keys(a).filter(k => k.startsWith('adap_')).length
    console.log(`[onboarding] Profil: ${data.firstName} | réponses: ${totalAnswers} | Phase1: ${filledPhase1.length}/8 (${filledPhase1.join(',') || 'aucune'}) | adaptatives: ${adaptiveCount}`)
    if (data.cvText) console.log(`[onboarding] CV: ${data.cvText.length} chars extraits`)
    else console.log('[onboarding] Aucun CV fourni')

    const userId = await getUserIdFromBearer(req.headers.authorization)

    const onboardingRow = await createOnboardingResponse({
      user_id:            userId,
      current_situation:  buildCurrentSituation(data),
      regrets_or_desires: buildRegrets(data),
      goals:              buildGoals(data),
      raw_answers:        data as unknown as Record<string, unknown>,
    })

    const report: GeneratedReport = await generateTrajectories(data)
    console.log(`[onboarding] Rapport IA généré — ${report.paths.length} trajectoires : ${report.paths.map(p => `[${p.pathType}] "${p.title}" fit=${p.fitScore}`).join(' | ')}`)

    const reportRow = await createReport({
      user_id:                userId,
      onboarding_response_id: onboardingRow.id,
      title:                  `Trajectoires alternatives pour ${data.firstName}`,
      summary:                report.reportSummary?.slice(0, 200) ?? '',
      full_report:            { ...report, generationSource: 'ai' },
    })

    return res.json({ reportId: reportRow.id, status: reportRow.status })
  } catch (err) {
    console.error('[onboarding] Error:', err)
    return res.status(500).json({
      message: err instanceof Error ? err.message : 'Erreur interne du serveur',
    })
  }
})

function buildCurrentSituation(data: OnboardingData): string {
  const parts = [
    `Situation : ${data.currentSituation}`,
    data.currentJob ? `Métier : ${data.currentJob}` : '',
    data.sector ? `Secteur : ${data.sector}` : '',
    data.yearsExperience !== undefined ? `Expérience : ${data.yearsExperience} an(s)` : '',
    data.educationLevel ? `Formation : ${data.educationLevel}${data.educationField ? ` en ${data.educationField}` : ''}` : '',
    data.city ? `Ville : ${data.city}` : '',
  ].filter(Boolean)
  return parts.join(' · ')
}

function buildRegrets(data: OnboardingData): string {
  const a = data.answers ?? {}
  const motivation  = formatAnswer(a['motivation'])
  const drains      = formatAnswer(a['drains'])
  const avoidNext   = formatAnswer(a['avoidNext'])
  const vision      = formatAnswer(a['vision5y'])
  return [
    motivation  ? `Envies principales : ${motivation}` : '',
    drains      ? `Ce qui fatigue : ${drains}` : '',
    avoidNext   ? `À éviter : ${avoidNext}` : '',
    vision      ? `Dans 5 ans : ${vision}` : '',
  ].filter(Boolean).join(' · ')
}

function buildGoals(data: OnboardingData): string {
  const a = data.answers ?? {}
  const skills    = formatAnswer(a['skills'])
  const energy    = formatAnswer(a['energy'])
  const lifestyle = formatAnswer(a['lifestyle'])
  const risk      = formatAnswer(a['risk'])
  return [
    skills    ? `Compétences : ${skills}` : '',
    energy    ? `Énergie naturelle : ${energy}` : '',
    lifestyle ? `Style de vie voulu : ${lifestyle}` : '',
    risk      ? `Tolérance au risque : ${risk}` : '',
    data.languages?.length ? `Langues : ${data.languages.join(', ')}` : '',
  ].filter(Boolean).join(' · ')
}

function formatAnswer(a: QuestionAnswer | undefined): string {
  if (!a) return ''
  const parts: string[] = []
  if (a.selectedOptions.length) parts.push(a.selectedOptions.join(', '))
  if (a.freeText.trim()) parts.push(`"${a.freeText.trim()}"`)
  return parts.join(' — ')
}

export default router
