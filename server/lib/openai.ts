import OpenAI from 'openai'
import { env } from '../config/env'
import type { OnboardingData, QuestionAnswer, Trajectory } from '../../src/types'

const client = new OpenAI({ apiKey: env.openaiApiKey })

const SYSTEM_PROMPT = `Tu es un expert senior en développement de carrière, psychologie des trajectoires professionnelles et coaching de reconversion.
Tu analyses en profondeur le profil d'une personne — ses compétences, passions, valeurs, style de vie souhaité, blocages et ambitions — et tu génères 3 trajectoires de vie alternatives réalistes, précises et inspirantes.
Tes trajectoires doivent être concrètes, non génériques, et tenir compte du profil émotionnel autant que du profil professionnel.
Tu réponds UNIQUEMENT avec du JSON valide, sans markdown ni texte autour.`

function fmt(a: QuestionAnswer | undefined): string {
  if (!a) return ''
  const parts: string[] = []
  if (a.selectedOptions.length) parts.push(a.selectedOptions.join(', '))
  if (a.freeText?.trim()) parts.push(`(précision : "${a.freeText.trim()}")`)
  return parts.join(' ')
}

function section(label: string, content: string): string {
  return content ? `- ${label} : ${content}` : ''
}

export async function generateTrajectories(data: OnboardingData): Promise<Trajectory[]> {
  const a = data.answers ?? {}

  const profileLines = [
    section('Prénom', data.firstName),
    section('Âge', data.age ? `${data.age} ans` : ''),
    section('Genre', data.gender ?? ''),
    section('Ville', data.city ?? ''),
    section('Situation actuelle', data.currentSituation),
    section('Métier actuel', data.currentJob ?? ''),
    section('Secteur', data.sector ?? ''),
    section("Années d'expérience", data.yearsExperience !== undefined ? String(data.yearsExperience) : ''),
    section('Formation', [data.educationLevel, data.educationField].filter(Boolean).join(' en ')),
    section('Langues', data.languages?.join(', ') ?? ''),
    data.cvText ? section('Extrait CV', data.cvText.slice(0, 1200)) : '',
  ].filter(Boolean).join('\n')

  const motivationLines = [
    section('Envies principales du moment', fmt(a['motivation'])),
    section('Type de vie professionnelle souhaitée', fmt(a['lifestyle'])),
    section('Sources naturelles d\'énergie', fmt(a['energy'])),
    section('Ce qui fatigue / démotive', fmt(a['drains'])),
    section("Domaines d'intérêt", fmt(a['interests'])),
    section('Activité à laquelle consacrer plus de temps', fmt(a['timeActivity'])),
  ].filter(Boolean).join('\n')

  const competenceLines = [
    section('Compétences auto-déclarées', fmt(a['skills'])),
    section('Talents reconnus par l\'entourage', fmt(a['askedFor'])),
    section('Phrase qui me ressemble', fmt(a['profile'])),
    section('Rôle naturel dans un projet', fmt(a['role'])),
    section('Relation aux autres souhaitée', fmt(a['relation'])),
  ].filter(Boolean).join('\n')

  const projectionLines = [
    section('Environnement de travail idéal', fmt(a['workEnv'])),
    section('Rapport à l\'argent', fmt(a['money'])),
    section('Tolérance au risque', fmt(a['risk'])),
    section('Vision à 5 ans', fmt(a['vision5y'])),
    section('Critères de réussite professionnelle', fmt(a['successCriteria'])),
    section('Ce à éviter dans la prochaine trajectoire', fmt(a['avoidNext'])),
    section('Première manière de tester une voie', fmt(a['transitionTest'])),
    section('Blocages actuels', fmt(a['blocks'])),
    section('Trajectoire perçue comme réaliste', fmt(a['realisticPath'])),
  ].filter(Boolean).join('\n')

  // Questions adaptatives
  const adaptiveEntries = Object.entries(a).filter(([k]) => k.startsWith('adap_'))
  const adaptiveLines = adaptiveEntries
    .map(([k, v]) => section(`Question adaptative (${k})`, fmt(v)))
    .join('\n')

  const userPrompt = `Analyse ce profil complet et génère exactement 3 trajectoires de vie alternatives.

══ IDENTITÉ ET PARCOURS ══
${profileLines}

══ MOTIVATIONS ET ENVIES ══
${motivationLines}

══ COMPÉTENCES ET PROFIL ══
${competenceLines}

══ PROJECTION ET STYLE DE VIE ══
${projectionLines}

${adaptiveLines ? `══ QUESTIONS ADAPTATIVES ══\n${adaptiveLines}\n` : ''}

INSTRUCTION IMPORTANTE :
- Le texte libre de l'utilisateur a plus de poids que les bulles sélectionnées.
- Si l'utilisateur a sélectionné "Sport" mais précisé "j'aime surtout organiser des événements sportifs", proposer des métiers liés à l'événementiel sportif, pas seulement coach.
- Si l'utilisateur veut "Gagner plus" mais précise "aider les jeunes à gérer leur argent simplement", proposer conseiller financier accessible / créateur de contenu finance — pas trader.
- Personnalise avec le prénom ${data.firstName} dans les descriptions.
- Respecte la tolérance au risque et le style de vie souhaité.
- Tiens compte des éléments à éviter pour filtrer les métiers incompatibles.

Génère ce JSON (sans markdown) :
{
  "trajectories": [
    {
      "id": 1,
      "title": "Titre accrocheur et personnalisé (5-7 mots)",
      "tagline": "Une phrase inspirante résumant cette vie alternative",
      "description": ["paragraphe 1 (3-4 lignes contextualisées)", "paragraphe 2 (3-4 lignes sur le quotidien)", "paragraphe 3 (3-4 lignes sur l'impact et l'épanouissement)"],
      "timeline": [
        {"year": "0-6 mois", "event": "Première action concrète et réaliste"},
        {"year": "6-12 mois", "event": "Étape 2 — montée en compétence"},
        {"year": "1-2 ans", "event": "Étape 3 — premiers résultats"},
        {"year": "2-3 ans", "event": "Étape 4 — consolidation"},
        {"year": "3-5 ans", "event": "Objectif à moyen terme"}
      ],
      "skillsToDevlop": ["compétence1", "compétence2", "compétence3", "compétence4"],
      "feasibilityScore": 78,
      "feasibilityNote": "Explication courte du score en lien avec le profil réel (1-2 lignes)"
    }
  ]
}

Règles :
- Trajectoire 1 : la plus réaliste et rapide (faisabilité ≥ 70%, cohérente avec les compétences existantes)
- Trajectoire 2 : pivot plus marqué mais accessible (faisabilité 50-70%)
- Trajectoire 3 : la plus audacieuse et inspirante (faisabilité 35-55%)
- Les 3 trajectoires doivent être clairement différentes
- Écris en français, ton bienveillant, motivant et concret
- Adapte chaque trajectoire au style de vie, à l'ambition financière et à la tolérance au risque déclarés`

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
  if (!parsed.trajectories || !Array.isArray(parsed.trajectories)) {
    throw new Error('Format de réponse IA invalide')
  }

  return parsed.trajectories
}
