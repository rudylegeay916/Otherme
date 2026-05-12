import OpenAI from 'openai'
import { env } from '../config/env'
import type { OnboardingData, Trajectory } from '../../src/types'

const client = new OpenAI({ apiKey: env.openaiApiKey })

const SYSTEM_PROMPT = `Tu es un expert en développement de carrière, psychologie des trajectoires de vie et coaching professionnel.
Tu analyses le profil d'une personne et génères 3 trajectoires de vie alternatives réalistes et inspirantes.
Tu réponds UNIQUEMENT avec du JSON valide, sans markdown ni texte autour.`

export async function generateTrajectories(data: OnboardingData): Promise<Trajectory[]> {
  const userPrompt = `Analyse ce profil et génère exactement 3 trajectoires de vie alternatives.

PROFIL :
- Prénom : ${data.firstName}
- Âge : ${data.age} ans
- Ville : ${data.city}
- Métier actuel : ${data.currentJob}
- Secteur : ${data.sector}
- Années d'expérience : ${data.yearsExperience}
- Formation : ${data.educationLevel} en ${data.educationField}
- Rêve professionnel : ${data.dreamJob}
- Valeurs importantes : ${data.values.join(', ')}
- Points forts : ${data.strengths.join(', ')}
- Langues : ${data.languages.join(', ')}
${data.cvText ? `- Informations CV : ${data.cvText.slice(0, 1500)}` : ''}

Génère ce JSON (sans markdown) :
{
  "trajectories": [
    {
      "id": 1,
      "title": "Titre accrocheur (5-7 mots)",
      "tagline": "Une phrase inspirante résumant cette vie alternative",
      "description": ["paragraphe 1 (3-4 lignes)", "paragraphe 2 (3-4 lignes)", "paragraphe 3 (3-4 lignes)"],
      "timeline": [
        {"year": "0-6 mois", "event": "Première action concrète"},
        {"year": "6-12 mois", "event": "Étape 2"},
        {"year": "1-2 ans", "event": "Étape 3"},
        {"year": "2-3 ans", "event": "Étape 4"},
        {"year": "3-5 ans", "event": "Objectif à moyen terme"}
      ],
      "skillsToDevlop": ["compétence1", "compétence2", "compétence3", "compétence4"],
      "feasibilityScore": 78,
      "feasibilityNote": "Explication courte du score (1-2 lignes)"
    }
  ]
}

Règles importantes :
- Trajectoire 1 : la plus réaliste et rapide à atteindre (faisabilité ≥ 70%)
- Trajectoire 2 : un pivot plus marqué mais accessible (faisabilité 50-70%)
- Trajectoire 3 : la plus audacieuse et inspirante (faisabilité 35-55%)
- Chaque trajectoire DOIT être différente l'une de l'autre
- Personalise avec le prénom ${data.firstName} dans les descriptions
- Écris en français, ton bienveillant, motivant et concret
- Base-toi sur les compétences existantes pour proposer des transitions réalistes`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 3500,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Réponse vide de l\'IA')

  const parsed = JSON.parse(content) as { trajectories: Trajectory[] }
  if (!parsed.trajectories || !Array.isArray(parsed.trajectories)) {
    throw new Error('Format de réponse IA invalide')
  }

  return parsed.trajectories
}
