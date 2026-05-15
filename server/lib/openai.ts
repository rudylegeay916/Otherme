import OpenAI from 'openai'
import { env } from '../config/env'
import type { OnboardingData, PathData, ReportComparison, QuestionAnswer } from '../../src/types'

const client = new OpenAI({ apiKey: env.openaiApiKey })

export interface GeneratedReport {
  paths:           PathData[]
  reportSummary:   string
  comparison:      ReportComparison
  bestFirstStep48h: string
}

// ── System prompt ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es un expert senior en développement de carrière et coaching de reconversion professionnelle.
Ta mission : analyser le profil complet d'une personne et produire un rapport OtherMe avec 3 trajectoires professionnelles alternatives — détaillées, personnalisées et actionnables.

PRINCIPES NON NÉGOCIABLES :
1. Tu n'es pas psychologue. Tu analyses des données professionnelles déclarées, pas un profil psychologique.
2. Tu ne garantis aucun emploi ni aucun revenu. Tu présentes des voies réalistes avec leurs opportunités ET leurs risques honnêtes.
3. Les 3 trajectoires DOIVENT être dans des secteurs ou types d'activité clairement différents. Zéro recouvrement sectoriel.
4. Chaque affirmation doit s'appuyer sur des données du profil fourni — jamais d'hypothèses inventées.
5. Le ton est bienveillant, direct, tutoyant, professionnel. Pas de sur-vente. Pas de vocabulaire de développement personnel creux.
6. Tu réponds UNIQUEMENT avec du JSON valide. Aucun markdown, aucun texte autour.

RÈGLES TECHNIQUES ABSOLUES :
- longDescription : MINIMUM 1000 caractères, doit citer explicitement des éléments du profil
- fiveYearTimeline : EXACTEMENT 7 périodes dans cet ordre strict : "30 jours", "3 mois", "6 mois", "12 mois", "2 ans", "3 ans", "5 ans"
- detailedActionPlan30Days : EXACTEMENT 4 entrées (week: 1, 2, 3, 4)
- Scores : entiers entre 0 et 100 uniquement
- personalCompatibilityScore : adéquation profil ↔ métier (compétences, valeurs, style de vie souhaité)
- feasibilityScore : faisabilité réelle de la transition (délai, ressources nécessaires, obstacles)
- marketOpportunityScore : opportunité de marché actuelle et tendance du secteur
- transitionEffortScore : effort nécessaire pour atteindre la trajectoire (0 = effort très faible, transition facile ; 100 = effort très élevé, rupture exigeante)
- Titres INTERDITS : "entrepreneur digital", "consultant premium", "créateur de contenu", "expert IA", "business builder", "prompt engineer", "product builder", tout titre vague ou sans public cible
- Titres OBLIGATOIRES : [Métier concret + fonction précise] pour [secteur ou public cible]. Ex : "Chargé de développement commercial pour PME industrielles", "Responsable formation digitale en cabinet RH", "Technicien de maintenance pour parc éolien offshore"
- firstConcreteStep : action faisable AUJOURD'HUI ou demain, avec un outil ou une plateforme nommée`

// ── Helpers ───────────────────────────────────────────────────────

function fmt(a: QuestionAnswer | undefined): string {
  if (!a) return ''
  const parts: string[] = []
  if (a.selectedOptions.length) parts.push(a.selectedOptions.join(', '))
  if (a.freeText?.trim()) parts.push(`(précision : "${a.freeText.trim()}")`)
  return parts.join(' ')
}

function orBlank(v: string | undefined | null): string {
  return v?.trim() || 'non renseigné'
}

// ── User prompt builder ───────────────────────────────────────────

function buildUserPrompt(data: OnboardingData): string {
  const a  = data.answers ?? {}
  const fn = data.firstName

  const adaptive = Object.entries(a)
    .filter(([k]) => k.startsWith('adap_'))
    .map(([k, v]) => `${k.replace('adap_', '')} : ${fmt(v)}`)
    .join('\n')

  return `Analyse ce profil et génère un rapport OtherMe avec 3 trajectoires professionnelles alternatives très détaillées.

═══════════════════════════════════════════════════════
PROFIL DE ${fn.toUpperCase()}
═══════════════════════════════════════════════════════
Prénom : ${fn}
Âge : ${data.age ? `${data.age} ans` : 'non renseigné'}
Genre : ${orBlank(data.gender)}
Ville : ${orBlank(data.city)}
Situation actuelle : ${orBlank(data.currentSituation)}
Métier actuel : ${orBlank(data.currentJob)}
Secteur : ${orBlank(data.sector)}
Années d'expérience : ${data.yearsExperience !== undefined ? String(data.yearsExperience) : 'non renseigné'}
Formation : ${[data.educationLevel, data.educationField].filter(Boolean).join(' en ') || 'non renseigné'}
Langues : ${data.languages?.join(', ') || 'non renseigné'}
${data.cvText ? `\nEXTRAIT CV (premiers 1200 caractères) :\n${data.cvText.slice(0, 1200)}` : ''}

═══════════════════════════════════════════════════════
RÉPONSES AU QUESTIONNAIRE (le texte libre prime sur les bulles)
═══════════════════════════════════════════════════════
Motivations principales : ${fmt(a['motivation']) || 'non renseigné'}
Ce qui donne de l'énergie : ${fmt(a['energy']) || 'non renseigné'}
Ce qui fatigue / vide : ${fmt(a['drains']) || 'non renseigné'}
Centres d'intérêt : ${fmt(a['interests']) || 'non renseigné'}
Activité qui absorbe le temps : ${fmt(a['timeActivity']) || 'non renseigné'}
Compétences déclarées : ${fmt(a['skills']) || 'non renseigné'}
Talents reconnus par l'entourage : ${fmt(a['askedFor']) || 'non renseigné'}
Profil naturel : ${fmt(a['profile']) || 'non renseigné'}
Rôle préféré dans un projet : ${fmt(a['role']) || 'non renseigné'}
Relation aux autres souhaitée : ${fmt(a['relation']) || 'non renseigné'}
Style de vie souhaité : ${fmt(a['lifestyle']) || 'non renseigné'}
Environnement de travail idéal : ${fmt(a['workEnv']) || 'non renseigné'}
Rapport à l'argent : ${fmt(a['money']) || 'non renseigné'}
Tolérance au risque : ${fmt(a['risk']) || 'non renseigné'}
Vision dans 5 ans : ${fmt(a['vision5y']) || 'non renseigné'}
Critères de succès personnels : ${fmt(a['successCriteria']) || 'non renseigné'}
Ce à éviter absolument : ${fmt(a['avoidNext']) || 'non renseigné'}
Freins identifiés : ${fmt(a['blocks']) || 'non renseigné'}
Chemin perçu comme réaliste : ${fmt(a['realisticPath']) || 'non renseigné'}
Premier test de transition envisagé : ${fmt(a['transitionTest']) || 'non renseigné'}
${adaptive ? `\nQuestions adaptatives :\n${adaptive}` : ''}

═══════════════════════════════════════════════════════
RÈGLES DE DIFFÉRENCIATION DES 3 TRAJECTOIRES
═══════════════════════════════════════════════════════

TRAJECTOIRE 1 — pathType: "current_aligned" — La plus proche, la plus rapide
• Même secteur ou secteur adjacent au parcours actuel de ${fn}
• Réutilise 70 à 90 % des compétences existantes (les transfère, ne les invente pas)
• Transition réalisable en moins de 6 mois sans formation longue
• fitScore cible : 75–92 | riskLevel : "Faible" ou "Modéré"
• Doit citer EXPLICITEMENT les compétences actuelles de ${fn} qui s'appliquent directement

TRAJECTOIRE 2 — pathType: "passion_based" — La plus alignée avec les envies déclarées
• Secteur différent des deux autres, ancré sur les motivations et centres d'intérêt déclarés
• Réutilise 40 à 65 % des compétences (les transférables), nécessite formation ou test
• Transition de 6 à 18 mois, avec une phase de validation possible en parallèle
• fitScore cible : 62–82 | riskLevel : "Modéré"
• Doit citer EXPLICITEMENT les réponses aux champs "énergie", "intérêts", "lifestyle" de ${fn}

TRAJECTOIRE 3 — pathType: "high_potential" — La plus ambitieuse, la plus risquée
• Secteur clairement différent des deux premières trajectoires
• Rupture plus grande, ancré sur des forces réelles (pas inventées), opportunité de marché identifiable
• Transition de 12 à 36 mois, effort élevé, risque assumé
• fitScore cible : 48–70 | riskLevel : "Élevé"
• Doit justifier EXPLICITEMENT pourquoi c'est ambitieux mais réaliste pour CE profil précis

INTERDITS ABSOLUS :
- Deux trajectoires dans le même secteur
- Deux trajectoires avec le même type d'activité (ex. deux consulting, deux formation, deux entrepreneuriat)
- Compétences inventées non présentes dans le profil
- Promises d'emploi ou de revenus garantis

═══════════════════════════════════════════════════════
EXEMPLES DE QUALITÉ ATTENDUE
═══════════════════════════════════════════════════════

whyItFits — CORRECT (cite le profil) :
"Tu as déclaré vouloir éviter [avoidNext] : ce métier l'exclut structurellement."
"Tes ${data.yearsExperience ?? 'X'} ans en [secteur] sont directement valorisables ici sans reconversion longue."

whyItFits — INTERDIT (trop générique) :
"Votre expérience est valorisable dans ce domaine." ← refusé
"Cette trajectoire correspond à votre profil." ← refusé

keyInsight — CORRECT :
"La plupart des gens dans ta situation cherchent à tout changer. Ici, le levier est [compétence précise de ${fn}] — souvent sous-estimée mais très recherchée sur ce marché."

═══════════════════════════════════════════════════════
JSON ATTENDU — RÉPONDS UNIQUEMENT AVEC CE JSON
═══════════════════════════════════════════════════════
{
  "reportSummary": "Synthèse de 4 à 6 lignes qui cite le contexte actuel de ${fn}, ses forces principales identifiées, et explique le fil conducteur entre les 3 trajectoires proposées. Personnalisé, pas générique.",

  "paths": [
    {
      "pathType": "current_aligned",
      "title": "[Métier concret précis] pour [secteur/public cible spécifique]",
      "sector": "Secteur de l'activité",
      "revenueEstimate": "XX 000 – YY 000 €/an",
      "happinessScore": 0-100,
      "riskLevel": "Faible|Modéré|Élevé",
      "difficultyLevel": "Accessible|Progressive|Exigeante",
      "fitScore": 0-100,
      "securityScore": 0-100,
      "freedomScore": 0-100,
      "incomePotentialScore": 0-100,
      "alignmentScore": 0-100,
      "personalCompatibilityScore": 0-100,
      "feasibilityScore": 0-100,
      "marketOpportunityScore": 0-100,
      "transitionEffortScore": 0-100,
      "longDescription": "MINIMUM 1000 caractères. Description qui cite explicitement les compétences et expériences de ${fn}. Couvre : le métier et ses réalités concrètes, une journée type, le niveau de risque honnête, le potentiel financier réaliste, l'opportunité de marché, et pourquoi cette voie est cohérente avec CE profil précis.",
      "keyInsight": "Insight clé, surprenant ou contre-intuitif, spécifique à ${fn} pour cette trajectoire.",
      "whyItFits": [
        "Raison 1 citant explicitement une compétence ou réponse du profil",
        "Raison 2 citant un élément du questionnaire",
        "Raison 3",
        "Raison 4"
      ],
      "dailyLife": "Description d'une journée type concrète dans ce métier — ce qu'on fait le matin, l'après-midi, avec qui, dans quel environnement.",
      "alreadyAcquiredStrengths": ["force transférable 1 tirée du profil", "force 2", "force 3", "force 4"],
      "missingSkills": ["compétence concrète à développer 1 (avec durée estimée)", "compétence 2", "compétence 3"],
      "likelyObstacles": ["obstacle probable réaliste 1", "obstacle 2", "obstacle 3"],
      "mistakesToAvoid": ["erreur classique à éviter 1", "erreur 2", "erreur 3"],
      "fiveYearTimeline": [
        {"period": "30 jours", "objective": "Objectif sprint initial clair", "actions": ["action concrète 1", "action 2", "action 3", "action 4"], "skills": ["compétence mobilisée 1", "compétence 2"], "proofsToBuild": ["preuve tangible 1", "preuve 2"], "expectedResult": "Résultat mesurable attendu"},
        {"period": "3 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "6 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "12 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "2 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "3 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "5 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."}
      ],
      "detailedActionPlan30Days": [
        {"week": 1, "title": "Titre de la semaine 1", "actions": ["action 1", "action 2", "action 3", "action 4"]},
        {"week": 2, "title": "Titre de la semaine 2", "actions": ["action 1", "action 2", "action 3", "action 4"]},
        {"week": 3, "title": "Titre de la semaine 3", "actions": ["action 1", "action 2", "action 3", "action 4"]},
        {"week": 4, "title": "Titre de la semaine 4", "actions": ["action 1", "action 2", "action 3", "action 4"]}
      ],
      "firstWeekActions": ["action concrète faisable cette semaine 1", "action 2", "action 3", "action 4"],
      "miniProjectToLaunch": "Mini-projet précis, faisable en 1 à 2 semaines, qui teste réellement cette voie sans risque majeur.",
      "peopleToContact": ["Type de personne + où la trouver (LinkedIn, Slack, événement)", "type 2", "type 3", "type 4"],
      "proofsToBuild": ["Preuve concrète et visible à construire 1", "preuve 2", "preuve 3", "preuve 4"],
      "recommendedTrainingTypes": ["Formation concrète 1 (format + durée estimée)", "formation 2", "formation 3"],
      "similarJobs": ["Métier proche 1", "métier 2", "métier 3", "métier 4"],
      "risksAndLimits": ["Risque réel et honnête 1", "risque 2", "risque 3"],
      "firstConcreteStep": "Action très précise que ${fn} peut faire AUJOURD'HUI ou demain — nommer l'outil, la plateforme, la personne à contacter et la durée estimée."
    },
    {
      "pathType": "passion_based",
      "title": "...",
      "sector": "...",
      "revenueEstimate": "...",
      "happinessScore": 0-100,
      "riskLevel": "...",
      "difficultyLevel": "...",
      "fitScore": 0-100,
      "securityScore": 0-100,
      "freedomScore": 0-100,
      "incomePotentialScore": 0-100,
      "alignmentScore": 0-100,
      "personalCompatibilityScore": 0-100,
      "feasibilityScore": 0-100,
      "marketOpportunityScore": 0-100,
      "transitionEffortScore": 0-100,
      "longDescription": "...",
      "keyInsight": "...",
      "whyItFits": ["...", "...", "...", "..."],
      "dailyLife": "...",
      "alreadyAcquiredStrengths": ["...", "...", "...", "..."],
      "missingSkills": ["...", "...", "..."],
      "likelyObstacles": ["...", "...", "..."],
      "mistakesToAvoid": ["...", "...", "..."],
      "fiveYearTimeline": [
        {"period": "30 jours", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "3 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "6 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "12 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "2 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "3 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "5 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."}
      ],
      "detailedActionPlan30Days": [
        {"week": 1, "title": "...", "actions": ["...", "...", "...", "..."]},
        {"week": 2, "title": "...", "actions": ["...", "...", "...", "..."]},
        {"week": 3, "title": "...", "actions": ["...", "...", "...", "..."]},
        {"week": 4, "title": "...", "actions": ["...", "...", "...", "..."]}
      ],
      "firstWeekActions": ["...", "...", "...", "..."],
      "miniProjectToLaunch": "...",
      "peopleToContact": ["...", "...", "...", "..."],
      "proofsToBuild": ["...", "...", "...", "..."],
      "recommendedTrainingTypes": ["...", "...", "..."],
      "similarJobs": ["...", "...", "...", "..."],
      "risksAndLimits": ["...", "...", "..."],
      "firstConcreteStep": "..."
    },
    {
      "pathType": "high_potential",
      "title": "...",
      "sector": "...",
      "revenueEstimate": "...",
      "happinessScore": 0-100,
      "riskLevel": "...",
      "difficultyLevel": "...",
      "fitScore": 0-100,
      "securityScore": 0-100,
      "freedomScore": 0-100,
      "incomePotentialScore": 0-100,
      "alignmentScore": 0-100,
      "personalCompatibilityScore": 0-100,
      "feasibilityScore": 0-100,
      "marketOpportunityScore": 0-100,
      "transitionEffortScore": 0-100,
      "longDescription": "...",
      "keyInsight": "...",
      "whyItFits": ["...", "...", "...", "..."],
      "dailyLife": "...",
      "alreadyAcquiredStrengths": ["...", "...", "...", "..."],
      "missingSkills": ["...", "...", "..."],
      "likelyObstacles": ["...", "...", "..."],
      "mistakesToAvoid": ["...", "...", "..."],
      "fiveYearTimeline": [
        {"period": "30 jours", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "3 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "6 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "12 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "2 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "3 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."},
        {"period": "5 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "..."}
      ],
      "detailedActionPlan30Days": [
        {"week": 1, "title": "...", "actions": ["...", "...", "...", "..."]},
        {"week": 2, "title": "...", "actions": ["...", "...", "...", "..."]},
        {"week": 3, "title": "...", "actions": ["...", "...", "...", "..."]},
        {"week": 4, "title": "...", "actions": ["...", "...", "...", "..."]}
      ],
      "firstWeekActions": ["...", "...", "...", "..."],
      "miniProjectToLaunch": "...",
      "peopleToContact": ["...", "...", "...", "..."],
      "proofsToBuild": ["...", "...", "...", "..."],
      "recommendedTrainingTypes": ["...", "...", "..."],
      "similarJobs": ["...", "...", "...", "..."],
      "risksAndLimits": ["...", "...", "..."],
      "firstConcreteStep": "..."
    }
  ],

  "comparison": {
    "safestPath": "Titre exact de la trajectoire la plus sûre",
    "mostPassionAlignedPath": "Titre exact de la trajectoire la plus alignée avec les envies déclarées",
    "highestPotentialPath": "Titre exact de la trajectoire au plus fort potentiel",
    "recommendedFirstChoice": "Titre exact de la trajectoire à prioriser en premier",
    "reason": "Explication personnalisée de 3 à 5 lignes expliquant POURQUOI cette trajectoire est prioritaire pour ${fn} — citant sa situation, ses contraintes déclarées et ses forces réelles."
  },

  "bestFirstStep48h": "Action ultra-concrète que ${fn} peut faire dans les 48 prochaines heures — nommer l'outil exact, la plateforme, la durée, et le résultat attendu. Pas de généralité."
}

RAPPEL FINAL :
- Tutoyer ${fn} dans tous les textes
- longDescription MINIMUM 1000 caractères avec citations explicites du profil
- Les 3 pathTypes DOIVENT être dans des secteurs clairement distincts
- Ton honnête, professionnel, rassurant — aucune promesse d'emploi garantie`
}

// ── Main export ───────────────────────────────────────────────────

export async function generateTrajectories(data: OnboardingData): Promise<GeneratedReport> {
  const response = await client.chat.completions.create({
    model:           'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: buildUserPrompt(data) },
    ],
    temperature:     0.72,
    max_tokens:      8000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error("Réponse vide de l'IA")

  const parsed = JSON.parse(content) as GeneratedReport

  if (!Array.isArray(parsed.paths) || parsed.paths.length === 0) {
    throw new Error('Format de réponse IA invalide : champ "paths" manquant ou vide')
  }

  return parsed
}
