import type { IncomingMessage, ServerResponse } from 'http'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import crypto from 'crypto'

// ── Config Vercel (désactive le body parser intégré) ─────────────
export const config = { api: { bodyParser: false } }

// ── Types inline (pour éviter les imports cross-tsconfig) ────────

interface QuestionAnswer { selectedOptions: string[]; freeText: string }

interface Trajectory {
  id: number; title: string; tagline: string; description: string[]
  timeline: Array<{ year: string; event: string }>
  skillsToDevlop: string[]; feasibilityScore: number; feasibilityNote: string
}

// ── Multer : parsing multipart/form-data ─────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    cb(null, ok.includes(file.mimetype))
  },
})

function runMulter(req: any, res: any): Promise<void> {
  return new Promise((resolve, reject) =>
    upload.single('cv')(req, res, (err: any) => err ? reject(err) : resolve()))
}

// ── Extraction texte CV ───────────────────────────────────────────

async function extractCvText(file: Express.Multer.File): Promise<string> {
  try {
    if (file.mimetype === 'text/plain') return file.buffer.toString('utf-8').slice(0, 3000)
    if (file.mimetype === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (b: Buffer) => Promise<{ text: string }>
      return (await pdfParse(file.buffer)).text.slice(0, 3000)
    }
  } catch { /* extraction optionnelle */ }
  return ''
}

// ── Parse answers JSON ────────────────────────────────────────────

function parseAnswers(raw?: string): Record<string, QuestionAnswer> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const result: Record<string, QuestionAnswer> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const x = v as Record<string, unknown>
        result[k] = {
          selectedOptions: Array.isArray(x.selectedOptions) ? (x.selectedOptions as string[]) : [],
          freeText: typeof x.freeText === 'string' ? x.freeText : '',
        }
      }
    }
    return result
  } catch { return {} }
}

function fmt(a?: QuestionAnswer): string {
  if (!a) return ''
  const parts: string[] = []
  if (a.selectedOptions.length) parts.push(a.selectedOptions.join(', '))
  if (a.freeText?.trim()) parts.push(`"${a.freeText.trim()}"`)
  return parts.join(' — ')
}

// ── Mock trajectoires (fallback quand OpenAI indisponible) ────────

function generateMockTrajectories(firstName: string): Trajectory[] {
  return [
    {
      id: 1,
      title: `Consultant Indépendant pour ${firstName}`,
      tagline: "Mettre ton expertise au service d'entreprises qui en ont besoin",
      description: [
        `Fort de ton expérience, ${firstName}, tu peux naturellement pivoter vers le conseil en freelance.`,
        'Les entreprises recherchent des profils hybrides qui comprennent à la fois la technique et le business.',
        'En 18 mois, tu pourrais construire une clientèle solide et viser 60-80 k€/an d\'honoraires.',
      ],
      timeline: [
        { year: '0-6 mois', event: 'Définir ta niche et ton offre de consulting' },
        { year: '6-12 mois', event: 'Premiers clients via réseau et LinkedIn' },
        { year: '1-2 ans', event: 'Missions longue durée, 3-5 clients réguliers' },
        { year: '2-3 ans', event: 'Spécialisation, hausse des tarifs journaliers' },
        { year: '3-5 ans', event: 'Cabinet solo ou associé, revenus stabilisés' },
      ],
      skillsToDevlop: ['Prospection commerciale', 'Gestion de projet', 'Communication', 'Facturation'],
      feasibilityScore: 78,
      feasibilityNote: 'Trajectoire très réaliste avec 3+ ans d\'expérience dans ton domaine.',
    },
    {
      id: 2,
      title: 'Formateur & Créateur de Contenu Expert',
      tagline: 'Partager ton savoir et en vivre confortablement',
      description: [
        'Transformer tes connaissances en formations, newsletters ou podcasts est accessible avec ton expérience.',
        'La création de contenu B2B sur LinkedIn ouvre des portes : partenariats, conférences, mandats.',
        'Le modèle hybride (contenus + formation + conseil) est le plus robuste financièrement.',
      ],
      timeline: [
        { year: '0-3 mois', event: 'Choisir ton format : LinkedIn, YouTube, newsletter' },
        { year: '3-6 mois', event: 'Publier régulièrement, construire une audience' },
        { year: '6-12 mois', event: 'Première formation ou masterclass payante' },
        { year: '1-2 ans', event: 'Programme de formation récurrent, communauté' },
        { year: '2-3 ans', event: 'Business de contenus + speaking' },
      ],
      skillsToDevlop: ['Storytelling', 'Marketing digital', 'Production vidéo/audio', 'SEO'],
      feasibilityScore: 63,
      feasibilityNote: 'Demande de la régularité et 6-12 mois avant les premiers revenus significatifs.',
    },
    {
      id: 3,
      title: 'Entrepreneur & Fondateur d\'une Micro-Startup',
      tagline: 'Construire quelque chose qui t\'appartient vraiment',
      description: [
        `${firstName}, ton profil pointe vers l'envie de créer, pas seulement d'exécuter.`,
        'Lancer une micro-startup SaaS ou un service B2B lean peut se faire avec peu de capital.',
        'Le risque est réel, mais c\'est souvent la trajectoire la plus alignée avec un besoin de liberté et d\'impact.',
      ],
      timeline: [
        { year: '0-3 mois', event: 'Identifier un problème précis, 20 interviews clients' },
        { year: '3-6 mois', event: 'MVP, premiers utilisateurs gratuits, feedback loop' },
        { year: '6-12 mois', event: 'Premières ventes, product-market fit' },
        { year: '1-2 ans', event: 'Croissance organique, premiers partenaires' },
        { year: '2-3 ans', event: 'Rentabilité ou levée de fonds' },
      ],
      skillsToDevlop: ['Développement produit', 'Sales B2B', 'Growth marketing', 'Finance'],
      feasibilityScore: 46,
      feasibilityNote: 'Trajectoire ambitieuse nécessitant épargne de sécurité et tolérance à l\'incertitude.',
    },
  ]
}

// ── Génération IA via OpenAI ──────────────────────────────────────

const SYSTEM_PROMPT = `Tu es un expert senior en développement de carrière et coaching de reconversion.
Tu analyses le profil d'une personne et génères 3 trajectoires de vie alternatives réalistes et personnalisées.
Tu réponds UNIQUEMENT avec du JSON valide, sans markdown ni texte autour.`

async function generateAITrajectories(
  data: Record<string, unknown>,
  answers: Record<string, QuestionAnswer>
): Promise<Trajectory[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY non configurée')

  const client = new OpenAI({ apiKey })

  const a = answers
  const firstName = data.firstName as string

  const userPrompt = `Analyse ce profil et génère exactement 3 trajectoires de vie alternatives.

PROFIL :
- Prénom : ${firstName}
- Âge : ${data.age || 'non renseigné'} ans
- Situation : ${data.currentSituation || ''}
- Métier : ${data.currentJob || ''}
- Secteur : ${data.sector || ''}
- Expérience : ${data.yearsExperience ?? ''} an(s)
- Formation : ${[data.educationLevel, data.educationField].filter(Boolean).join(' en ')}
- Ville : ${data.city || ''}
${data.cvText ? `- CV : ${String(data.cvText).slice(0, 800)}` : ''}

MOTIVATIONS :
${fmt(a['motivation']) ? `- Envies : ${fmt(a['motivation'])}` : ''}
${fmt(a['energy']) ? `- Énergie naturelle : ${fmt(a['energy'])}` : ''}
${fmt(a['drains']) ? `- Ce qui fatigue : ${fmt(a['drains'])}` : ''}
${fmt(a['interests']) ? `- Centres d'intérêt : ${fmt(a['interests'])}` : ''}

COMPÉTENCES :
${fmt(a['skills']) ? `- Compétences : ${fmt(a['skills'])}` : ''}
${fmt(a['profile']) ? `- Profil : ${fmt(a['profile'])}` : ''}
${fmt(a['role']) ? `- Rôle naturel : ${fmt(a['role'])}` : ''}

PROJECTION :
${fmt(a['lifestyle']) ? `- Style de vie souhaité : ${fmt(a['lifestyle'])}` : ''}
${fmt(a['risk']) ? `- Tolérance au risque : ${fmt(a['risk'])}` : ''}
${fmt(a['vision5y']) ? `- Vision 5 ans : ${fmt(a['vision5y'])}` : ''}
${fmt(a['avoidNext']) ? `- À éviter : ${fmt(a['avoidNext'])}` : ''}

Génère ce JSON (sans markdown) :
{
  "trajectories": [
    {
      "id": 1,
      "title": "Titre accrocheur (5-7 mots)",
      "tagline": "Phrase inspirante résumant cette vie alternative",
      "description": ["para 1 (3-4 lignes)", "para 2", "para 3"],
      "timeline": [
        {"year": "0-6 mois", "event": "Première action concrète"},
        {"year": "6-12 mois", "event": "Montée en compétence"},
        {"year": "1-2 ans", "event": "Premiers résultats"},
        {"year": "2-3 ans", "event": "Consolidation"},
        {"year": "3-5 ans", "event": "Objectif à moyen terme"}
      ],
      "skillsToDevlop": ["compétence1", "compétence2", "compétence3"],
      "feasibilityScore": 75,
      "feasibilityNote": "Explication du score (1-2 lignes)"
    }
  ]
}

Règles :
- Trajectoire 1 : réaliste et rapide (faisabilité ≥ 70%)
- Trajectoire 2 : pivot plus marqué (faisabilité 50-70%)
- Trajectoire 3 : audacieuse (faisabilité 35-55%)
- Écris en français, ton bienveillant, utilise le prénom ${firstName}`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error("Réponse vide de l'IA")

  const parsed = JSON.parse(content) as { trajectories: Trajectory[] }
  if (!Array.isArray(parsed.trajectories)) throw new Error('Format IA invalide')

  return parsed.trajectories
}

// ── Sauvegarde Supabase ───────────────────────────────────────────

async function saveToSupabase(
  data: Record<string, unknown>,
  trajectories: Trajectory[],
  userId: string | null
): Promise<string> {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase non configuré')

  const sb = createClient(url, key, { auth: { persistSession: false } })

  const { data: onbRow, error: onbErr } = await sb
    .from('onboarding_responses')
    .insert({
      user_id:            userId,
      current_situation:  `${data.currentSituation || ''} · ${data.currentJob || ''}`.trim().replace(/^·\s*/, ''),
      regrets_or_desires: '',
      goals:              '',
      raw_answers:        data,
    })
    .select('id')
    .single()
  if (onbErr) throw onbErr

  const { data: repRow, error: repErr } = await sb
    .from('reports')
    .insert({
      user_id:                userId,
      onboarding_response_id: onbRow.id,
      title:                  `Trajectoires alternatives pour ${data.firstName}`,
      summary:                trajectories[0]?.tagline ?? '',
      full_report:            trajectories,
      status:                 'ready',
    })
    .select('id, status, created_at')
    .single()
  if (repErr) throw repErr

  return repRow.id as string
}

// ── Récupérer userId depuis le token Supabase ─────────────────────

async function getUserId(authHeader?: string): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const url  = process.env.VITE_SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) return null
  try {
    const sb = createClient(url, anon, { auth: { persistSession: false } })
    const { data } = await sb.auth.getUser(authHeader.slice(7))
    return data.user?.id ?? null
  } catch { return null }
}

// ── Handler principal ─────────────────────────────────────────────

export default async function handler(req: IncomingMessage & { body?: Record<string, string>; file?: Express.Multer.File }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }))
    return
  }

  try {
    // 1. Parser multipart/form-data
    await runMulter(req, res)

    const body = (req as any).body as Record<string, string>
    const firstName = body.firstName?.trim() || 'Utilisateur'
    const email     = body.email?.trim().toLowerCase() || ''

    if (!firstName || !email) {
      res.statusCode = 400
      res.end(JSON.stringify({ success: false, error: 'Prénom et email sont obligatoires' }))
      return
    }

    const answers = parseAnswers(body.answers)
    const cvText  = (req as any).file ? await extractCvText((req as any).file) : ''

    const data: Record<string, unknown> = {
      firstName, email,
      age:             parseInt(body.age) || 0,
      currentSituation: body.currentSituation?.trim() || '',
      gender:          body.gender?.trim() || undefined,
      city:            body.city?.trim() || undefined,
      currentJob:      body.currentJob?.trim() || undefined,
      sector:          body.sector?.trim() || undefined,
      yearsExperience: body.yearsExperience ? parseInt(body.yearsExperience) : undefined,
      educationLevel:  body.educationLevel?.trim() || undefined,
      educationField:  body.educationField?.trim() || undefined,
      languages:       body.languages ? JSON.parse(body.languages) : undefined,
      cvText:          cvText || undefined,
      answers,
    }

    // 2. Récupérer userId (optionnel)
    const userId = await getUserId((req.headers as any).authorization)

    // 3. Générer les trajectoires (IA ou mock)
    let trajectories: Trajectory[]
    try {
      trajectories = await generateAITrajectories(data, answers)
    } catch (err) {
      console.error('[onboarding] OpenAI indisponible, utilisation du mock:', err)
      trajectories = generateMockTrajectories(firstName)
    }

    // 4. Sauvegarder dans Supabase (ou générer un ID mock)
    let reportId: string
    let isMock = false

    try {
      reportId = await saveToSupabase(data, trajectories, userId)
    } catch (err) {
      console.error('[onboarding] Supabase indisponible, utilisation d\'un ID mock:', err)
      reportId = `mock_${crypto.randomUUID()}`
      isMock = true
    }

    // 5. Retourner la réponse
    const payload: Record<string, unknown> = { reportId, status: 'ready' }
    if (isMock) {
      // Le frontend stockera les trajectoires dans sessionStorage
      payload.isMock = true
      payload.mockTrajectories = trajectories
      payload.firstName = firstName
      payload.email = email
    }

    res.statusCode = 200
    res.end(JSON.stringify(payload))
  } catch (err) {
    console.error('[onboarding] Erreur non gérée:', err)
    // Fallback ultime : toujours retourner quelque chose d'utilisable
    const mockId = `mock_${crypto.randomUUID()}`
    res.statusCode = 200
    res.end(JSON.stringify({
      reportId: mockId,
      status: 'ready',
      isMock: true,
      mockTrajectories: generateMockTrajectories('vous'),
      firstName: 'vous',
      email: '',
    }))
  }
}
