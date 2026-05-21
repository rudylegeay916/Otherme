import OpenAI from 'openai'
import { env } from '../config/env'
import type { OnboardingData, PathData, ReportComparison, QuestionAnswer } from '../../src/types'
import { validateGeneratedReport } from './reportSchema'

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
- longDescription : MINIMUM 1500 caractères par trajectoire, avec au moins 5 références explicites au profil
- fiveYearTimeline : EXACTEMENT 7 périodes dans cet ordre strict : "30 jours", "1 à 3 mois", "3 à 6 mois", "6 à 12 mois", "12 à 24 mois", "2 à 3 ans", "3 à 5 ans"
- detailedActionPlan30Days : EXACTEMENT 4 entrées (week: 1, 2, 3, 4), chaque semaine avec 3 à 5 actions incluant durée estimée et livrable attendu
- Scores : entiers entre 0 et 100 uniquement
- personalCompatibilityScore : adéquation profil ↔ métier (compétences, valeurs, style de vie souhaité)
- feasibilityScore : faisabilité réelle de la transition (délai, ressources nécessaires, obstacles)
- marketOpportunityScore : opportunité de marché actuelle et tendance du secteur
- transitionEffortScore : effort nécessaire pour atteindre la trajectoire (0 = effort très faible, transition facile ; 100 = effort très élevé, rupture exigeante)
- Titres INTERDITS : "entrepreneur digital", "consultant premium", "créateur de contenu", "expert IA", "business builder", "prompt engineer", "product builder", tout titre vague ou sans public cible
- Titres OBLIGATOIRES : [Métier concret + fonction précise] pour [secteur ou public cible]. Ex : "Chargé de développement commercial pour PME industrielles", "Responsable formation digitale en cabinet RH", "Technicien de maintenance pour parc éolien offshore"
- firstConcreteStep : action faisable AUJOURD'HUI ou demain, avec un outil ou une plateforme nommée
- Si un CV est fourni : ses postes, outils, réalisations et secteurs sont des FAITS vérifiés. Cite-les nommément (jamais de façon générique) dans alreadyAcquiredStrengths, whyItFits et longDescription de chaque trajectoire.

QUALITÉ DU CONTENU — FORMATS OBLIGATOIRES PAR CHAMP :
- alreadyAcquiredStrengths : chaque entrée = "Force [X] — Source : [poste ou réalisation concrète du profil] — Comment la valoriser dans [métier cible] : [action concrète avec exemple]"
- missingSkills : chaque entrée = "Compétence [X] — Pourquoi critique : [raison liée au métier cible] — Acquisition : [méthode précise + outil ou organisme nommé] — Niveau cible : [débutant/intermédiaire/avancé] — Priorité : [haute/moyenne/faible]"
- risksAndLimits : chaque entrée = "Risque [X] — Cause : [pourquoi ce risque existe concrètement] — Réduction : [action concrète pour l'atténuer] — Erreur classique : [ce que font ceux qui échouent]"
- fiveYearTimeline.actions : chaque action = "[Verbe d'action] [objet précis + outil nommé si applicable] ([durée estimée]) → livrable : [résultat tangible et mesurable]"
- fiveYearTimeline.expectedResult : "[Résultat chiffrable ou observable]. KPI : [indicateur mesurable]. Vigilance : [risque ou point critique à surveiller sur cette période]"
- detailedActionPlan30Days.title : "Semaine [N] — [Thème clair] ([durée totale estimée])"
- detailedActionPlan30Days.actions : chaque action = "[Verbe d'action] [objet précis] ([durée estimée]) → livrable : [résultat concret attendu]"
- whyItFits : chaque entrée cite EXPLICITEMENT un élément du profil (poste, réponse questionnaire, compétence déclarée) ET explique son lien direct avec le métier cible

INTERDITS ABSOLUS DE CONTENU — refus si présent :
- "il faut se former" → écrire : "suivre [formation précise] sur [plateforme nommée] en [N semaines]"
- "développer ses compétences" → écrire : "[compétence précise] via [méthode concrète + ressource nommée]"
- "travailler son réseau" → écrire : "contacter [type de profil précis] via [LinkedIn/Slack/événement nommé]"
- "se former en ligne" → écrire : "[cours/certification + plateforme + durée estimée]"
- "explorer les opportunités" → écrire : "[action précise dans [secteur cible]"
- Toute phrase applicable à n'importe quel profil sans modification → interdit
- Toute action sans outil nommé, durée estimée ou livrable attendu → interdit

CHAMPS DE POSITIONNEMENT — OBLIGATOIRES PAR TRAJECTOIRE :
- positioningStatement : phrase de positionnement (30–50 mots) — "Je me positionne comme [profil concret] capable de [valeur ajoutée précise] pour [cible spécifique]." Doit citer CE profil, pas un générique.
- linkedinHeadline : accroche LinkedIn max 120 caractères — format : "[Titre cible] | [Valeur différenciatrice] | [Signal de crédibilité]"
- interviewPitch : 3 à 4 phrases pour expliquer la reconversion en entretien — structure : d'où on vient → pourquoi on change → ce qu'on apporte → ce qui différencie
- cvKeywords : 5 à 7 mots-clés à utiliser dans le titre, l'accroche ou le résumé du CV cible
- comparisonWithOtherPaths : 4 à 6 lignes — pourquoi CETTE trajectoire vs les deux autres, dans quel cas elle est le meilleur choix, dans quel cas elle est déconseillée, ce qu'elle apporte que les autres n'offrent pas
- detailedActionPlan30Days : chaque semaine inclut 4 champs supplémentaires :
  · objective : objectif précis de la semaine (1 phrase)
  · deliverable : livrable tangible à produire en fin de semaine
  · practicalTip : conseil pratique pour réussir cette semaine
  · mistakeToAvoid : erreur fréquente à éviter cette semaine

NOUVEAUX CHAMPS OBLIGATOIRES PAR TRAJECTOIRE :
- companyTypesToTarget : 4 types d'entreprises où postuler en priorité — format : "[Type précis] — [Pourquoi c'est un terrain d'entrée adapté pour CE profil + critères à vérifier]". Adapter selon pathType (startup early-stage pour high_potential, grandes entreprises pour current_aligned, etc.)
- questionsToAskProfessionals : 5 questions clés à poser lors d'un échange réseau avec un professionnel du métier cible — format : "[Question directe et ouverte] — [Pourquoi cette question est utile pour valider la trajectoire]". Questions ciblées sur la réalité du quotidien, les erreurs fréquentes, les conditions d'entrée réelles.
- choosePath : 3 à 4 critères pour lesquels CHOISIR cette trajectoire — format : "Si [condition concrète liée au profil ou au mode de vie souhaité]". Chaque critère doit citer un élément du profil ou une contrainte déclarée.
- avoidPath : 3 à 4 critères pour lesquels ÉVITER cette trajectoire — format : "Si [incompatibilité concrète avec le métier ou les contraintes non déclarées]". Honnête, sans condescendance — aide à détecter les profils mal alignés.
- howToReachRole : feuille de route ultra-concrète pour passer de la situation actuelle au métier cible. OBLIGATOIRE par trajectoire. Contient 5 sous-champs :
  · startingPoint : 3 à 5 éléments que la personne possède déjà (expériences, compétences, contacts, crédibilité) utilisables directement dans cette transition
  · gapToFill : 3 à 5 manques précis à combler (compétences absentes, portfolio vide, réseau inexistant, certification manquante) — chacun avec une estimation de temps pour le combler
  · recommendedPath : 4 à 6 étapes ordonnées du chemin recommandé (formation → mini-projet → candidature → premier rôle → montée en compétences) — réaliste, sans sauts irréalistes
  · priorityActions : EXACTEMENT 5 actions prioritaires à faire en premier — format : "[Numéro]. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]"
  · mistakesToAvoid : 3 à 5 erreurs classiques faites par les personnes qui tentent cette transition — format : "Erreur [X] : [ce que les gens font] — Pourquoi ça bloque : [conséquence concrète] — Alternative : [ce qu'il faut faire à la place]"`

// ── CV parser ─────────────────────────────────────────────────────

const CV_SECTION_RX: RegExp[] = [
  /^(expériences?\s*(professionnelles?|de\s+travail)?|emplois?\s*(occupés?)?|parcours\s+professionnel|work\s+experience|professional\s+experience|career\s+history)/i,
  /^(compétences?\s*(techniques?|professionnelles?|clés?)?|skills?|savoir[s]?-faire|aptitudes?|hard\s+skills?|core\s+competencies)/i,
  /^(formations?\s*(académiques?|professionnelles?)?|éducation|diplômes?|études|scolarité|education|qualifications?)/i,
  /^(outils?|logiciels?|technologies?|stack\s+technique|langages?\s+(de\s+programmation)?|environnement\s+technique|tools?|software|tech\s+stack)/i,
  /^(réalisations?|accomplissements?|projets?\s*(professionnels?|réalisés?)?|achievements?|key\s+achievements?)/i,
  /^(responsabilités?|missions?\s*(principales?)?|principales?\s+(missions?|responsabilités?)|key\s+responsibilities?)/i,
  /^(certifications?|accréditations?|habilitations?)/i,
  /^(langues?|languages?|maîtrise\s+des\s+langues?)/i,
]

function buildCvSection(rawText: string | undefined): string {
  if (!rawText?.trim()) return ''
  const text = rawText.trim()

  // CV court : envoyer tel quel
  if (text.length <= 3000) return text

  // CV long : détecter les sections clés et reconstruire une synthèse structurée
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0)

  interface Sec { header: string; lines: string[] }
  const sections: Sec[] = []
  let cur: Sec | null = null

  for (const line of lines) {
    const isHeader = line.length < 80 && CV_SECTION_RX.some(rx => rx.test(line))
    if (isHeader) {
      if (cur) sections.push(cur)
      cur = { header: line, lines: [] }
    } else {
      if (cur) cur.lines.push(line)
      else {
        // Contenu avant la première section (nom, contact, résumé)
        if (!cur) cur = { header: '── Résumé / Informations générales', lines: [] }
        cur.lines.push(line)
      }
    }
  }
  if (cur) sections.push(cur)

  if (sections.length >= 2) {
    const parts: string[] = ['── Synthèse structurée du CV ──']
    let total = parts[0].length
    for (const s of sections) {
      const block = `\n${s.header}\n${s.lines.slice(0, 20).join('\n')}`
      if (total + block.length > 3000) break
      parts.push(block)
      total += block.length
    }
    if (parts.length >= 2) return parts.join('').trim()
  }

  // Fallback : premiers 3000 chars bruts
  return text.slice(0, 3000)
}

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

function buildUserPrompt(data: OnboardingData, cvSection: string): string {
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
${cvSection ? `
═══════════════════════════════════════════════════════
CONTENU DU CV (source de vérité — ${cvSection.length} caractères)
═══════════════════════════════════════════════════════
${cvSection}

⚠️ INSTRUCTION CV : Dans CHAQUE trajectoire, cite EXPLICITEMENT au moins 3 éléments concrets de ce CV (intitulés de postes, outils nommés, réalisations chiffrées, secteurs connus) dans les champs alreadyAcquiredStrengths, whyItFits et longDescription. Ne paraphrase pas — nomme.` : ''}

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

whyItFits — CORRECT (cite le profil + lien direct) :
"Tes ${data.yearsExperience ?? 'X'} ans de [métier actuel] t'ont donné [compétence précise] — directement transférable ici car [raison concrète liée au métier cible]."
"Tu as déclaré vouloir éviter [avoidNext] : la structure de ce métier l'exclut structurellement car [raison]."

whyItFits — INTERDIT :
"Votre expérience est valorisable dans ce domaine." ← trop vague, refusé
"Cette trajectoire correspond à votre profil." ← non citant, refusé

alreadyAcquiredStrengths — CORRECT :
"Gestion de projet complexe — Source : [poste X] où tu pilotais [Y] — Valorisation en [métier cible] : directement utilisable pour [action concrète]"

missingSkills — CORRECT :
"Prospection commerciale B2B — Pourquoi critique : ce métier exige de trouver ses propres clients — Acquisition : formation 'Vente consultative' sur LinkedIn Learning (8h) — Niveau cible : intermédiaire — Priorité : haute"

risksAndLimits — CORRECT :
"Revenus irréguliers les 6 premiers mois — Cause : absence de clients récurrents en phase de démarrage — Réduction : constituer 3 mois de trésorerie avant lancement, signer 1 mission avant de quitter le salariat — Erreur classique : partir sans filet, puis baisser ses tarifs par peur"

keyInsight — CORRECT :
"La plupart des gens dans ta situation cherchent à tout changer. Ici, le levier est [compétence précise de ${fn}] — souvent sous-estimée mais très recherchée sur ce marché."

═══════════════════════════════════════════════════════
JSON ATTENDU — RÉPONDS UNIQUEMENT AVEC CE JSON
═══════════════════════════════════════════════════════
{
  "reportSummary": "Synthèse de 5 à 8 lignes : (1) contexte actuel de ${fn} avec ses forces identifiées, (2) fil conducteur logique entre les 3 trajectoires proposées, (3) ce qui rend chaque trajectoire cohérente avec CE profil précis. Jamais générique.",

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
      "longDescription": "MINIMUM 1800 caractères. Structurer en 5 blocs séparés par un saut de ligne : (1) Pourquoi CE métier pour CE profil — cite au moins 3 éléments du parcours de ${fn}. (2) Réalité concrète du métier : ce qu'on fait vraiment, difficultés réelles, avantages tangibles. (3) État du marché : demande actuelle, secteurs qui recrutent, tendances à 3 ans. (4) Trajectoire financière réaliste : fourchettes années 1, 2-3, 5+ basées sur le marché réel. (5) Pourquoi c'est réaliste ou ambitieux pour ${fn} spécifiquement — pas pour n'importe qui.",
      "keyInsight": "Insight clé, surprenant ou contre-intuitif, spécifique à ${fn} pour cette trajectoire — jamais applicable à n'importe qui.",
      "whyItFits": [
        "Raison 1 — cite [compétence/expérience précise du profil] + explique son lien direct avec [aspect concret du métier cible]",
        "Raison 2 — cite [réponse questionnaire ou élément CV] + explique pourquoi ça aide dans [ce métier]",
        "Raison 3 — même format",
        "Raison 4 — même format"
      ],
      "dailyLife": "Journée type détaillée : matin (9h-12h : tâches précises, outils utilisés), après-midi (14h-18h : tâches précises), avec qui (types d'interlocuteurs), dans quel environnement (bureau/terrain/remote/déplacements), rythme de la semaine. MINIMUM 300 caractères.",
      "alreadyAcquiredStrengths": [
        "Force [X] — Source : [poste ou réalisation concrète du profil de ${fn}] — Comment la valoriser dans [métier cible] : [action concrète avec exemple précis]",
        "Force [Y] — Source : [...] — Comment la valoriser : [...]",
        "Force [Z] — Source : [...] — Comment la valoriser : [...]",
        "Force [W] — Source : [...] — Comment la valoriser : [...]"
      ],
      "missingSkills": [
        "Compétence [X] — Pourquoi critique : [raison liée au métier cible] — Acquisition : [méthode précise + outil ou organisme nommé] — Niveau cible : intermédiaire — Priorité : haute",
        "Compétence [Y] — Pourquoi critique : [...] — Acquisition : [...] — Niveau cible : [...] — Priorité : moyenne",
        "Compétence [Z] — Pourquoi critique : [...] — Acquisition : [...] — Niveau cible : [...] — Priorité : faible"
      ],
      "likelyObstacles": ["Obstacle concret 1 lié à CE profil et CE métier", "Obstacle 2", "Obstacle 3"],
      "mistakesToAvoid": ["Erreur classique 1 avec conséquence concrète", "Erreur 2", "Erreur 3"],
      "fiveYearTimeline": [
        {
          "period": "30 jours",
          "objective": "Objectif sprint initial précis et mesurable",
          "actions": [
            "Analyser 10 offres d'emploi [métier cible] sur LinkedIn/Indeed (2h) → livrable : liste des 5 compétences les plus demandées",
            "Contacter 3 professionnels du secteur sur LinkedIn avec message personnalisé (1h30) → livrable : 1 échange concret obtenu",
            "Lire 3 témoignages de reconversion vers [métier cible] (1h) → livrable : 5 insights notés",
            "Créer un document listant les compétences transférables prioritaires (1h) → livrable : document avec 10 items classés"
          ],
          "skills": ["compétence mobilisée 1", "compétence 2"],
          "proofsToBuild": ["preuve concrète 1 (décrite précisément)", "preuve 2"],
          "expectedResult": "Résultat observable. KPI : [indicateur mesurable]. Vigilance : [risque ou point d'attention spécifique à cette période]"
        },
        {"period": "1 à 3 mois", "objective": "...", "actions": ["[Verbe + objet + outil] ([durée]) → livrable : [résultat]", "..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "3 à 6 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "6 à 12 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "12 à 24 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "2 à 3 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "3 à 5 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"}
      ],
      "detailedActionPlan30Days": [
        {
          "week": 1,
          "title": "Semaine 1 — [Thème] ([durée totale estimée])",
          "objective": "Objectif précis de cette semaine en une phrase.",
          "actions": [
            "[Verbe d'action] [objet précis] ([durée estimée]) → livrable : [résultat concret et mesurable]",
            "[Verbe d'action] [objet précis] ([durée estimée]) → livrable : [résultat concret]",
            "[Verbe d'action] [objet précis] ([durée estimée]) → livrable : [résultat concret]",
            "[Verbe d'action] [objet précis] ([durée estimée]) → livrable : [résultat concret]"
          ],
          "deliverable": "Livrable tangible à avoir produit en fin de semaine.",
          "practicalTip": "Conseil pratique pour réussir cette semaine.",
          "mistakeToAvoid": "Erreur fréquente à éviter cette semaine."
        },
        {"week": 2, "title": "Semaine 2 — [Thème] ([durée])", "objective": "...", "actions": ["[Verbe + objet + durée] → livrable : [résultat]", "...", "...", "..."], "deliverable": "...", "practicalTip": "...", "mistakeToAvoid": "..."},
        {"week": 3, "title": "Semaine 3 — [Thème] ([durée])", "objective": "...", "actions": ["...", "...", "...", "..."], "deliverable": "...", "practicalTip": "...", "mistakeToAvoid": "..."},
        {"week": 4, "title": "Semaine 4 — [Thème] ([durée])", "objective": "...", "actions": ["...", "...", "...", "..."], "deliverable": "...", "practicalTip": "...", "mistakeToAvoid": "..."}
      ],
      "firstWeekActions": [
        "Action concrète 1 — faisable cette semaine, avec outil nommé et durée estimée",
        "Action concrète 2",
        "Action concrète 3",
        "Action concrète 4"
      ],
      "miniProjectToLaunch": "Mini-projet précis et faisable en 1 à 2 semaines : ce qu'on fait concrètement, quel outil on utilise, quel livrable on obtient, comment ça teste réellement la voie.",
      "peopleToContact": [
        "Profil 1 : [type de personne précis] — Où les trouver : [LinkedIn/Slack/événement nommé] — Pourquoi les contacter : [objectif précis]",
        "Profil 2 — Où : [...] — Pourquoi : [...]",
        "Profil 3 — Où : [...] — Pourquoi : [...]",
        "Profil 4 — Où : [...] — Pourquoi : [...]"
      ],
      "proofsToBuild": [
        "Preuve 1 : [description précise du livrable visible] — Format : [ex: article LinkedIn, dépôt GitHub, étude de cas PDF] — Durée : [N jours]",
        "Preuve 2 : [...] — Format : [...] — Durée : [...]",
        "Preuve 3 : [...] — Format : [...] — Durée : [...]",
        "Preuve 4 : [...] — Format : [...] — Durée : [...]"
      ],
      "recommendedTrainingTypes": [
        "Formation 1 : [nom précis ou type] — Plateforme : [nommée] — Durée : [estimée] — Objectif : [compétence visée]",
        "Formation 2 : [...] — Plateforme : [...] — Durée : [...] — Objectif : [...]",
        "Formation 3 : [...] — Plateforme : [...] — Durée : [...] — Objectif : [...]"
      ],
      "similarJobs": ["Métier proche 1 — pourquoi similaire", "Métier 2", "Métier 3", "Métier 4"],
      "risksAndLimits": [
        "Risque [X] — Cause : [pourquoi ce risque existe concrètement pour ${fn}] — Réduction : [action concrète pour l'atténuer] — Erreur classique : [ce que font ceux qui échouent]",
        "Risque [Y] — Cause : [...] — Réduction : [...] — Erreur classique : [...]",
        "Risque [Z] — Cause : [...] — Réduction : [...] — Erreur classique : [...] ",
        "Risque [W] — Cause : [...] — Réduction : [...] — Erreur classique : [...]"
      ],
      "firstConcreteStep": "Action ultra-précise que ${fn} peut faire AUJOURD'HUI ou demain — nommer l'outil exact, la plateforme, l'action en moins de 30 minutes, et le résultat attendu immédiat.",
      "positioningStatement": "Je me positionne comme [profil concret de ${fn}] capable de [valeur ajoutée précise] pour [cible spécifique du métier cible].",
      "linkedinHeadline": "[Titre du métier cible] | [Valeur différenciatrice liée au profil de ${fn}] | [Signal de crédibilité concret]",
      "interviewPitch": "3 à 4 phrases : d'où je viens (parcours de ${fn}) → pourquoi je change (motivation ancrée dans le profil) → ce que ça apporte au recruteur (valeur concrète) → ce qui me différencie (force spécifique de ${fn}).",
      "cvKeywords": ["mot-clé 1 lié au métier cible", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
      "comparisonWithOtherPaths": "Paragraphe de 4 à 6 lignes : pourquoi cette trajectoire current_aligned est le meilleur choix pour ${fn} vs les deux autres. Cas où elle est recommandée. Cas où elle est déconseillée. Ce qu'elle apporte (rapidité, sécurité, valorisation immédiate) que les autres trajectoires n'offrent pas.",
      "companyTypesToTarget": [
        "Type d'entreprise 1 — pourquoi c'est un terrain d'entrée adapté pour ${fn} + critères à vérifier",
        "Type d'entreprise 2 — culture adaptée et taille de structure recommandée",
        "Type d'entreprise 3 — contexte et réalisme pour ce profil current_aligned",
        "Type d'entreprise 4 — opportunité spécifique au secteur current_aligned"
      ],
      "questionsToAskProfessionals": [
        "Question 1 sur la réalité du quotidien — pourquoi cette question est utile pour valider la trajectoire",
        "Question 2 sur les conditions réelles d'entrée dans le métier",
        "Question 3 sur les erreurs fréquentes des nouveaux entrants",
        "Question 4 sur l'évolution salariale et les étapes de progression",
        "Question 5 sur ce qui différencie les profils qui réussissent dans ce métier"
      ],
      "choosePath": [
        "Si tu veux [aspect concret de ce métier current_aligned] — lien avec les réponses de ${fn}",
        "Si ta priorité est [valeur ou besoin déclaré par ${fn}]",
        "Si tu cherches [ce que ce métier offre concrètement]"
      ],
      "avoidPath": [
        "Si tu ne supportes pas [contrainte réelle de ce métier]",
        "Si tu cherches [ce que ce métier ne peut structurellement pas offrir]",
        "Si [incompatibilité concrète avec le profil ou mode de vie souhaité]"
      ],
      "howToReachRole": {
        "startingPoint": [
          "Élément déjà acquis 1 — [expérience ou compétence concrète de ${fn}] directement utilisable dans cette transition",
          "Élément déjà acquis 2 — [contact, crédibilité ou réalisation]",
          "Élément déjà acquis 3 — [outil ou secteur maîtrisé]"
        ],
        "gapToFill": [
          "Manque 1 — [compétence ou certification absente] — temps estimé pour combler : [N semaines/mois]",
          "Manque 2 — [portfolio vide ou réseau inexistant] — temps estimé : [N semaines/mois]",
          "Manque 3 — [connaissance spécifique au métier cible] — temps estimé : [N semaines/mois]"
        ],
        "recommendedPath": [
          "Étape 1 — [action initiale concrète] (semaine 1 à 2)",
          "Étape 2 — [formation ou mini-projet de validation] (semaine 2 à 6)",
          "Étape 3 — [construction de preuves concrètes] (mois 2 à 4)",
          "Étape 4 — [candidature ou premier client] (mois 3 à 6)",
          "Étape 5 — [consolidation et montée en compétences] (mois 6 à 12)"
        ],
        "priorityActions": [
          "1. [Verbe d'action] [objet précis lié au current_aligned] ([durée estimée]) → impact attendu : [résultat concret]",
          "2. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]",
          "3. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]",
          "4. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]",
          "5. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]"
        ],
        "mistakesToAvoid": [
          "Erreur 1 : [ce que les gens font classiquement] — Pourquoi ça bloque : [conséquence] — Alternative : [ce qu'il faut faire à la place]",
          "Erreur 2 : [erreur fréquente spécifique à cette transition current_aligned] — Pourquoi ça bloque : [...] — Alternative : [...]",
          "Erreur 3 : [autre erreur] — Pourquoi ça bloque : [...] — Alternative : [...]"
        ]
      }
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
      "longDescription": "MINIMUM 1800 caractères — même structure en 5 blocs que current_aligned, adaptée à passion_based",
      "keyInsight": "Insight spécifique à ${fn} pour cette trajectoire passion",
      "whyItFits": ["Raison 1 — cite [élément profil] + lien avec métier", "Raison 2", "Raison 3", "Raison 4"],
      "dailyLife": "Journée type détaillée (MINIMUM 300 caractères)",
      "alreadyAcquiredStrengths": ["Force [X] — Source : [...] — Comment valoriser : [...]", "Force [Y]...", "Force [Z]...", "Force [W]..."],
      "missingSkills": ["Compétence [X] — Pourquoi critique : [...] — Acquisition : [...] — Niveau : [...] — Priorité : [...]", "Compétence [Y]...", "Compétence [Z]..."],
      "likelyObstacles": ["Obstacle 1", "Obstacle 2", "Obstacle 3"],
      "mistakesToAvoid": ["Erreur 1 avec conséquence concrète", "Erreur 2", "Erreur 3"],
      "fiveYearTimeline": [
        {"period": "30 jours", "objective": "...", "actions": ["[Verbe + objet + outil] ([durée]) → livrable : [résultat]", "..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "1 à 3 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "3 à 6 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "6 à 12 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "12 à 24 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "2 à 3 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "3 à 5 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"}
      ],
      "detailedActionPlan30Days": [
        {"week": 1, "title": "Semaine 1 — [Thème] ([durée])", "objective": "...", "actions": ["[Verbe + objet + durée] → livrable : [résultat]", "...", "...", "..."], "deliverable": "...", "practicalTip": "...", "mistakeToAvoid": "..."},
        {"week": 2, "title": "Semaine 2 — [Thème] ([durée])", "objective": "...", "actions": ["...", "...", "...", "..."], "deliverable": "...", "practicalTip": "...", "mistakeToAvoid": "..."},
        {"week": 3, "title": "Semaine 3 — [Thème] ([durée])", "objective": "...", "actions": ["...", "...", "...", "..."], "deliverable": "...", "practicalTip": "...", "mistakeToAvoid": "..."},
        {"week": 4, "title": "Semaine 4 — [Thème] ([durée])", "objective": "...", "actions": ["...", "...", "...", "..."], "deliverable": "...", "practicalTip": "...", "mistakeToAvoid": "..."}
      ],
      "firstWeekActions": ["Action 1 — outil nommé + durée estimée", "Action 2", "Action 3", "Action 4"],
      "miniProjectToLaunch": "Mini-projet précis : ce qu'on fait, quel outil, quel livrable, comment ça teste la voie.",
      "peopleToContact": ["Profil 1 — Où : [...] — Pourquoi : [...]", "Profil 2...", "Profil 3...", "Profil 4..."],
      "proofsToBuild": ["Preuve 1 — Format : [...] — Durée : [...]", "Preuve 2...", "Preuve 3...", "Preuve 4..."],
      "recommendedTrainingTypes": ["Formation 1 — Plateforme : [...] — Durée : [...] — Objectif : [...]", "Formation 2...", "Formation 3..."],
      "similarJobs": ["Métier proche 1", "Métier 2", "Métier 3", "Métier 4"],
      "risksAndLimits": ["Risque [X] — Cause : [...] — Réduction : [...] — Erreur classique : [...]", "Risque [Y]...", "Risque [Z]...", "Risque [W]..."],
      "firstConcreteStep": "Action ultra-précise — outil exact, plateforme, moins de 30 minutes, résultat attendu immédiat.",
      "positioningStatement": "Je me positionne comme [profil de ${fn}] capable de [valeur ajoutée] pour [cible du métier passion].",
      "linkedinHeadline": "[Titre cible passion] | [Valeur différenciatrice] | [Signal de crédibilité]",
      "interviewPitch": "3 à 4 phrases pour expliquer cette reconversion passion en entretien.",
      "cvKeywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
      "comparisonWithOtherPaths": "Paragraphe de 4 à 6 lignes : pourquoi cette trajectoire passion_based vs les deux autres. Cas où elle est recommandée. Cas où elle est déconseillée. Ce qu'elle apporte (alignement avec les envies, sens, épanouissement) que les autres ne donnent pas.",
      "companyTypesToTarget": [
        "Type d'entreprise 1 — secteur passion avec culture adaptée aux reconversions",
        "Type d'entreprise 2 — structure qui valorise les parcours atypiques",
        "Type d'entreprise 3 — environnement favorable pour un premier rôle passion_based",
        "Type d'entreprise 4 — opportunité d'entrée réaliste pour ce profil"
      ],
      "questionsToAskProfessionals": [
        "Question 1 sur la réalité du métier passion au quotidien",
        "Question 2 sur les conditions d'entrée réelles pour un profil en reconversion",
        "Question 3 sur ce que personne ne dit vraiment sur ce secteur",
        "Question 4 sur la progression financière et les paliers réalistes",
        "Question 5 sur les profils qui réussissent vraiment cette transition"
      ],
      "choosePath": [
        "Si l'alignement avec tes valeurs et motivations primes sur la rapidité",
        "Si tu es prêt à accepter [contrainte spécifique de cette trajectoire passion]",
        "Si [élément déclaré par ${fn}] est un moteur de décision fort"
      ],
      "avoidPath": [
        "Si tu as besoin de revenus stables rapidement — la phase de transition passion est plus longue",
        "Si tu cherches [ce que ce métier passion ne peut pas offrir structurellement]",
        "Si [incompatibilité concrète avec les exigences réelles de ce secteur]"
      ],
      "howToReachRole": {
        "startingPoint": [
          "Élément déjà acquis 1 — [passion, compétence ou expérience de ${fn}] transférable dans cette voie",
          "Élément déjà acquis 2 — [réseau ou crédibilité existante dans le domaine passion]",
          "Élément déjà acquis 3 — [outil, secteur ou réalisation utilisable]"
        ],
        "gapToFill": [
          "Manque 1 — [compétence ou certification manquante pour la voie passion] — temps estimé : [N semaines/mois]",
          "Manque 2 — [portfolio ou preuve de légitimité absent] — temps estimé : [N semaines/mois]",
          "Manque 3 — [réseau spécifique au secteur passion] — temps estimé : [N semaines/mois]"
        ],
        "recommendedPath": [
          "Étape 1 — [validation de la passion via un test concret] (semaine 1 à 3)",
          "Étape 2 — [formation ou montée en compétences spécifique] (mois 1 à 4)",
          "Étape 3 — [construction de preuves dans le domaine passion] (mois 2 à 5)",
          "Étape 4 — [premier rôle ou première mission dans ce secteur] (mois 4 à 9)",
          "Étape 5 — [consolidation et spécialisation] (mois 9 à 18)"
        ],
        "priorityActions": [
          "1. [Verbe d'action] [objet précis lié au passion_based] ([durée estimée]) → impact attendu : [résultat concret]",
          "2. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]",
          "3. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]",
          "4. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]",
          "5. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]"
        ],
        "mistakesToAvoid": [
          "Erreur 1 : [erreur classique dans une reconversion passion] — Pourquoi ça bloque : [...] — Alternative : [...]",
          "Erreur 2 : [erreur fréquente spécifique à ce secteur passion] — Pourquoi ça bloque : [...] — Alternative : [...]",
          "Erreur 3 : [autre erreur] — Pourquoi ça bloque : [...] — Alternative : [...]"
        ]
      }
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
      "longDescription": "MINIMUM 1800 caractères — même structure en 5 blocs, adaptée à high_potential. Justifier EXPLICITEMENT pourquoi c'est ambitieux mais réaliste pour CE profil.",
      "keyInsight": "Insight spécifique à ${fn} pour cette trajectoire haute ambition",
      "whyItFits": ["Raison 1 — cite [élément profil] + lien avec métier", "Raison 2", "Raison 3", "Raison 4"],
      "dailyLife": "Journée type détaillée (MINIMUM 300 caractères)",
      "alreadyAcquiredStrengths": ["Force [X] — Source : [...] — Comment valoriser : [...]", "Force [Y]...", "Force [Z]...", "Force [W]..."],
      "missingSkills": ["Compétence [X] — Pourquoi critique : [...] — Acquisition : [...] — Niveau : [...] — Priorité : [...]", "Compétence [Y]...", "Compétence [Z]..."],
      "likelyObstacles": ["Obstacle 1", "Obstacle 2", "Obstacle 3"],
      "mistakesToAvoid": ["Erreur 1 avec conséquence concrète", "Erreur 2", "Erreur 3"],
      "fiveYearTimeline": [
        {"period": "30 jours", "objective": "...", "actions": ["[Verbe + objet + outil] ([durée]) → livrable : [résultat]", "..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "1 à 3 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "3 à 6 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "6 à 12 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "12 à 24 mois", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "2 à 3 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"},
        {"period": "3 à 5 ans", "objective": "...", "actions": ["..."], "skills": ["..."], "proofsToBuild": ["..."], "expectedResult": "[Résultat]. KPI : [...]. Vigilance : [...]"}
      ],
      "detailedActionPlan30Days": [
        {"week": 1, "title": "Semaine 1 — [Thème] ([durée])", "objective": "...", "actions": ["[Verbe + objet + durée] → livrable : [résultat]", "...", "...", "..."], "deliverable": "...", "practicalTip": "...", "mistakeToAvoid": "..."},
        {"week": 2, "title": "Semaine 2 — [Thème] ([durée])", "objective": "...", "actions": ["...", "...", "...", "..."], "deliverable": "...", "practicalTip": "...", "mistakeToAvoid": "..."},
        {"week": 3, "title": "Semaine 3 — [Thème] ([durée])", "objective": "...", "actions": ["...", "...", "...", "..."], "deliverable": "...", "practicalTip": "...", "mistakeToAvoid": "..."},
        {"week": 4, "title": "Semaine 4 — [Thème] ([durée])", "objective": "...", "actions": ["...", "...", "...", "..."], "deliverable": "...", "practicalTip": "...", "mistakeToAvoid": "..."}
      ],
      "firstWeekActions": ["Action 1 — outil nommé + durée estimée", "Action 2", "Action 3", "Action 4"],
      "miniProjectToLaunch": "Mini-projet précis : ce qu'on fait, quel outil, quel livrable, comment ça teste la voie.",
      "peopleToContact": ["Profil 1 — Où : [...] — Pourquoi : [...]", "Profil 2...", "Profil 3...", "Profil 4..."],
      "proofsToBuild": ["Preuve 1 — Format : [...] — Durée : [...]", "Preuve 2...", "Preuve 3...", "Preuve 4..."],
      "recommendedTrainingTypes": ["Formation 1 — Plateforme : [...] — Durée : [...] — Objectif : [...]", "Formation 2...", "Formation 3..."],
      "similarJobs": ["Métier proche 1", "Métier 2", "Métier 3", "Métier 4"],
      "risksAndLimits": ["Risque [X] — Cause : [...] — Réduction : [...] — Erreur classique : [...]", "Risque [Y]...", "Risque [Z]...", "Risque [W]..."],
      "firstConcreteStep": "Action ultra-précise — outil exact, plateforme, moins de 30 minutes, résultat attendu immédiat.",
      "positioningStatement": "Je me positionne comme [profil de ${fn}] capable de [valeur ajoutée ambitieuse] pour [cible du métier high_potential].",
      "linkedinHeadline": "[Titre cible ambitieux] | [Valeur différenciatrice haute ambition] | [Signal de crédibilité]",
      "interviewPitch": "3 à 4 phrases pour expliquer cette reconversion ambitieuse en entretien.",
      "cvKeywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
      "comparisonWithOtherPaths": "Paragraphe de 4 à 6 lignes : pourquoi cette trajectoire high_potential vs les deux autres. Cas où elle est recommandée. Cas où elle est déconseillée. Ce qu'elle apporte (potentiel, impact, différenciation) que les autres trajectoires ne permettent pas.",
      "companyTypesToTarget": [
        "Type d'entreprise 1 — structure haute ambition adaptée à ce profil high_potential",
        "Type d'entreprise 2 — environnement qui récompense l'initiative et l'impact",
        "Type d'entreprise 3 — terrain d'entrée réaliste avec forte courbe d'apprentissage",
        "Type d'entreprise 4 — structure avec potentiel de croissance et responsabilités rapides"
      ],
      "questionsToAskProfessionals": [
        "Question 1 sur ce qu'il faut vraiment pour réussir dans ce métier ambitieux",
        "Question 2 sur les conditions à réunir avant de se lancer dans cette voie",
        "Question 3 sur les signaux qui indiquent qu'on est sur la bonne trajectoire",
        "Question 4 sur la réalité de la rémunération les 2 premières années",
        "Question 5 sur ce qu'on ne peut pas apprendre seul et qui fait la différence"
      ],
      "choosePath": [
        "Si tu as une forte tolérance à l'ambiguïté et à l'incertitude",
        "Si tu cherches [impact ou potentiel que seule cette trajectoire high_potential offre]",
        "Si [force spécifique de ${fn}] est un avantage différenciateur dans ce secteur"
      ],
      "avoidPath": [
        "Si tu as besoin de résultats rapides et de sécurité financière à court terme",
        "Si tu ne supportes pas [contrainte exigeante propre à cette trajectoire ambitieuse]",
        "Si [incompatibilité de profil ou de style de vie avec les exigences réelles]"
      ],
      "howToReachRole": {
        "startingPoint": [
          "Élément déjà acquis 1 — [force ou avantage différenciateur de ${fn}] utilisable dans cette voie ambitieuse",
          "Élément déjà acquis 2 — [connaissance sectorielle ou réseau existant]",
          "Élément déjà acquis 3 — [compétence rare ou réalisation notable]"
        ],
        "gapToFill": [
          "Manque 1 — [compétence ou ressource critique pour cette voie high_potential] — temps estimé : [N mois]",
          "Manque 2 — [réseau spécifique ou investissement initial nécessaire] — temps estimé : [N mois]",
          "Manque 3 — [validation du concept ou traction initiale] — temps estimé : [N mois]"
        ],
        "recommendedPath": [
          "Étape 1 — [validation de l'hypothèse et test marché] (mois 1 à 2)",
          "Étape 2 — [acquisition des compétences critiques manquantes] (mois 2 à 6)",
          "Étape 3 — [construction de la crédibilité et des premières preuves] (mois 4 à 9)",
          "Étape 4 — [premier rôle ou lancement] (mois 6 à 18)",
          "Étape 5 — [développement et consolidation de la position] (mois 18 à 36)"
        ],
        "priorityActions": [
          "1. [Verbe d'action] [objet précis lié au high_potential] ([durée estimée]) → impact attendu : [résultat concret]",
          "2. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]",
          "3. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]",
          "4. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]",
          "5. [Verbe d'action] [objet précis] ([durée estimée]) → impact attendu : [résultat concret]"
        ],
        "mistakesToAvoid": [
          "Erreur 1 : [erreur classique dans une voie ambitieuse] — Pourquoi ça bloque : [...] — Alternative : [...]",
          "Erreur 2 : [erreur fréquente spécifique à cette transition high_potential] — Pourquoi ça bloque : [...] — Alternative : [...]",
          "Erreur 3 : [autre erreur] — Pourquoi ça bloque : [...] — Alternative : [...]"
        ]
      }
    }
  ],

  "comparison": {
    "safestPath": "Titre exact de la trajectoire la plus sûre",
    "mostPassionAlignedPath": "Titre exact de la trajectoire la plus alignée avec les envies déclarées",
    "highestPotentialPath": "Titre exact de la trajectoire au plus fort potentiel",
    "recommendedFirstChoice": "Titre exact de la trajectoire à prioriser en premier",
    "reason": "Explication personnalisée de 4 à 6 lignes : POURQUOI cette trajectoire est prioritaire pour ${fn} — citant sa situation concrète, ses contraintes déclarées, ses forces réelles et ce que ça implique comme premier pas."
  },

  "bestFirstStep48h": "Action ultra-concrète que ${fn} peut faire dans les 48 prochaines heures — nommer l'outil exact, la plateforme, l'action précise en 30 minutes ou moins, et le résultat attendu immédiat."
}

RAPPEL FINAL :
- Tutoyer ${fn} dans tous les textes
- longDescription MINIMUM 1800 caractères avec au moins 5 citations du profil
- Les 3 pathTypes DOIVENT être dans des secteurs clairement distincts
- Aucune action vague, aucune phrase générique — chaque élément doit citer CE profil
- Ton honnête, professionnel, rassurant — aucune promesse d'emploi garantie
- OBLIGATOIRES dans chaque trajectoire : positioningStatement, linkedinHeadline, interviewPitch, cvKeywords, comparisonWithOtherPaths, companyTypesToTarget, questionsToAskProfessionals, choosePath, avoidPath
- detailedActionPlan30Days : chaque semaine DOIT inclure objective, deliverable, practicalTip, mistakeToAvoid
- companyTypesToTarget : adapter au pathType (entreprises de taille PME/startup/grande entreprise selon risk_level)
- choosePath / avoidPath : honnêtes, concrets, personnalisés au profil — pas génériques
- howToReachRole : OBLIGATOIRE dans chaque trajectoire — priorityActions doit contenir EXACTEMENT 5 actions numérotées, chacune avec durée et impact attendu`
}

// ── Main export ───────────────────────────────────────────────────

export async function generateTrajectories(data: OnboardingData): Promise<GeneratedReport> {
  const cvSection = buildCvSection(data.cvText)
  if (cvSection) {
    console.log(`[cv] CV fourni — ${data.cvText?.length ?? 0} chars extraits → ${cvSection.length} chars envoyés à l'IA`)
  } else {
    console.log('[cv] Aucun CV fourni — analyse basée uniquement sur le questionnaire')
  }

  const response = await client.chat.completions.create({
    model:           'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: buildUserPrompt(data, cvSection) },
    ],
    temperature:     0.72,
    max_tokens:      12000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error("Réponse vide de l'IA")

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('[openai] La réponse IA n\'est pas du JSON valide')
  }

  const validation = validateGeneratedReport(parsed)
  if (!validation.success) {
    console.error('[openai] Rapport IA invalide :', validation.error)
    if (validation.details) console.error('[openai] Détails :', validation.details)
    throw new Error(`[openai] Rapport IA invalide — ${validation.error}`)
  }

  return validation.data as GeneratedReport
}
