import type { IncomingMessage, ServerResponse } from 'http'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import crypto from 'crypto'

export const config = { api: { bodyParser: false } }

// ── Interfaces (inline — no cross-tsconfig imports) ───────────────

interface QuestionAnswer { selectedOptions: string[]; freeText: string }

interface RichTimelineStep {
  period: string; objective: string; actions: string[]
  skills: string[]; proofsToBuild: string[]; expectedResult: string
}

interface ActionPlanWeek {
  week: number; title: string; actions: string[]
  objective?: string; deliverable?: string; practicalTip?: string; mistakeToAvoid?: string
}

interface PathData {
  pathType: 'current_aligned' | 'passion_based' | 'high_potential'
  title: string; sector: string; revenueEstimate: string
  happinessScore: number; riskLevel: string; difficultyLevel: string
  fitScore: number; securityScore: number; freedomScore: number
  incomePotentialScore: number; alignmentScore: number
  personalCompatibilityScore: number; feasibilityScore: number
  marketOpportunityScore: number; transitionEffortScore: number
  longDescription: string; keyInsight: string
  whyItFits: string[]; dailyLife: string
  alreadyAcquiredStrengths: string[]; missingSkills: string[]
  likelyObstacles: string[]; mistakesToAvoid: string[]
  fiveYearTimeline: RichTimelineStep[]
  detailedActionPlan30Days: ActionPlanWeek[]
  firstWeekActions: string[]; miniProjectToLaunch: string
  peopleToContact: string[]; proofsToBuild: string[]
  recommendedTrainingTypes: string[]; similarJobs: string[]
  risksAndLimits: string[]; firstConcreteStep: string
  positioningStatement?: string; linkedinHeadline?: string
  interviewPitch?: string; cvKeywords?: string[]
  comparisonWithOtherPaths?: string
}

interface ReportComparison {
  safestPath: string; mostPassionAlignedPath: string
  highestPotentialPath: string; recommendedFirstChoice: string; reason: string
}

interface ReportData {
  reportSummary: string
  paths: PathData[]
  comparison: ReportComparison
  bestFirstStep48h: string
}

// ── Multer ────────────────────────────────────────────────────────

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

async function extractCvText(file: Express.Multer.File): Promise<string> {
  try {
    if (file.mimetype === 'text/plain') return file.buffer.toString('utf-8').slice(0, 8000)
    if (file.mimetype === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (b: Buffer) => Promise<{ text: string }>
      return (await pdfParse(file.buffer)).text.slice(0, 8000)
    }
  } catch { /* extraction optionnelle */ }
  return ''
}

// ── CV parser (même logique que server/lib/openai.ts) ────────────

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
  if (text.length <= 3000) return text

  const lines = text.split(/\r?\n/).map((l: string) => l.trim()).filter((l: string) => l.length > 0)
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

  return text.slice(0, 3000)
}

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

// ── Mock premium (fallback OpenAI indisponible) ───────────────────

function generateMockReport(firstName: string): ReportData {
  const name = firstName || 'vous'
  return {
    reportSummary: `${name}, votre profil révèle une personne en quête de sens, d'autonomie et d'impact réel. Vous avez accumulé des compétences solides, un réseau existant et une capacité d'adaptation rare. Les trois trajectoires ci-dessous ont été construites pour partir de là où vous en êtes, en respectant votre niveau de risque acceptable et votre vision du quotidien idéal. Chaque chemin est faisable — la différence tient à ce que vous êtes prêt(e) à prioriser dans les six prochains mois.`,
    paths: [
      {
        pathType: 'current_aligned',
        title: `Consultant indépendant en transformation digitale pour PME`,
        sector: 'Conseil & Digital',
        revenueEstimate: '45 000 – 75 000 €/an',
        happinessScore: 74,
        riskLevel: 'Modéré',
        difficultyLevel: 'Accessible',
        fitScore: 82,
        securityScore: 72,
        freedomScore: 78,
        incomePotentialScore: 70,
        alignmentScore: 76,
        personalCompatibilityScore: 84,
        feasibilityScore: 88,
        marketOpportunityScore: 72,
        transitionEffortScore: 20,
        longDescription: `Cette trajectoire s'appuie directement sur ce que vous savez déjà faire, en repositionnant votre expertise dans un cadre indépendant. Les PME françaises sont massivement en retard sur leur transformation digitale : elles cherchent des profils capables de comprendre à la fois leurs contraintes opérationnelles et les outils numériques disponibles. Vous n'avez pas besoin d'être un développeur pour occuper ce rôle — vous avez besoin de savoir poser le bon diagnostic, proposer des solutions concrètes, et accompagner la mise en place.\n\nEn tant que consultant indépendant, votre quotidien alternera entre phases d'analyse client, ateliers de travail, recommandations stratégiques et suivi de mise en œuvre. Vous choisirez vos missions, vos secteurs préférés, et progressivement vos tarifs. Le marché est large et peu saturé sur ce segment PME.\n\nFinancièrement, les premiers 6 à 12 mois seront en phase de lancement : 1 à 3 clients, un chiffre d'affaires encore modeste. Mais dès la deuxième année, avec une niche bien définie et des références clients, atteindre 50 à 70 k€ brut annuel est réaliste. La liberté de rythme et la variété des missions sont des bénéfices très concrets dès la première année.\n\nLe principal frein est psychologique : sortir du salariat, prospecter ses premiers clients, assumer l'incertitude des débuts. Ces obstacles sont réels mais surmontables avec une préparation sérieuse des 30 premiers jours.`,
        keyInsight: `Vous avez déjà 80 % des compétences nécessaires. Il manque principalement la posture commerciale et la structure juridique — deux éléments qui s'acquièrent en quelques semaines.`,
        whyItFits: [
          "Votre expérience actuelle est directement valorisable sans formation longue",
          "Ce marché cherche exactement des profils hybrides technique + business",
          "La transition peut se faire progressivement, sans tout quitter d'un coup",
          "Vous conservez une grande liberté de rythme et de sélection des missions",
        ],
        dailyLife: `Lundi matin : appel de découverte avec un prospect PME. Mardi : atelier diagnostic chez un client retail. Mercredi : rédaction d'une proposition commerciale et veille secteur. Jeudi : formation à distance sur un outil spécifique. Vendredi : facturation, prospection LinkedIn, suivi projet en cours. Pas de réunion imposée, pas de reporting quotidien.`,
        alreadyAcquiredStrengths: ["Compréhension des organisations", "Communication professionnelle", "Analyse de problèmes complexes", "Gestion de projets"],
        missingSkills: ["Prospection commerciale indépendante", "Structuration d'une offre consulting", "Gestion administrative freelance", "Négociation tarifaire"],
        likelyObstacles: ["Les 3 premiers mois sans revenu stable", "La légitimité à se positionner expert", "Le syndrome de l'imposteur lors des premières missions"],
        mistakesToAvoid: ["Baisser ses tarifs par peur du refus", "Travailler sans contrat clair", "Accepter trop de missions non alignées avec sa niche", "Négliger la prospection continue"],
        fiveYearTimeline: [
          {
            period: '30 jours',
            objective: "Valider la niche et préparer le lancement",
            actions: ["Identifier 3 secteurs PME cibles", "Lire 10 offres de mission sur Malt/LinkedIn", "Contacter 5 anciens collègues/clients", "Rédiger son profil LinkedIn repositionné"],
            skills: ["Définition d'offre", "Personal branding"],
            proofsToBuild: ["Profil LinkedIn optimisé consultant", "Une page de présentation de son offre"],
            expectedResult: "Niche définie, profil prêt, 2 à 3 contacts qualifiés identifiés"
          },
          {
            period: '3 mois',
            objective: "Lancer l'activité et décrocher la première mission",
            actions: ["Créer sa structure (micro-entreprise ou SASU)", "Publier 2 contenus LinkedIn par semaine", "Envoyer 20 propositions de valeur personnalisées", "Rencontrer 5 décideurs PME"],
            skills: ["Prospection", "Closing commercial", "Rédaction de proposition"],
            proofsToBuild: ["Première étude de cas ou témoignage client", "Un devis type"],
            expectedResult: "Première mission signée, 1 500 à 3 000 € de CA"
          },
          {
            period: '6 mois',
            objective: "Stabiliser 2 à 3 clients actifs",
            actions: ["Développer un réseau de prescripteurs", "Affiner son positionnement selon les retours terrain", "Mettre en place un système de suivi client"],
            skills: ["Gestion relation client", "Pilotage de mission", "Upsell"],
            proofsToBuild: ["2 à 3 études de cas", "Témoignages clients visibles en ligne"],
            expectedResult: "CA mensuel régulier de 3 000 à 5 000 €"
          },
          {
            period: '12 mois',
            objective: "Atteindre la rentabilité et la sérénité financière",
            actions: ["Hausser ses tarifs journaliers de 20 à 30 %", "Développer une offre packagée reproductible", "Nouer 2 partenariats prescripteurs"],
            skills: ["Pricing stratégique", "Productisation de service"],
            proofsToBuild: ["Portfolio de 5+ missions réussies", "Page de vente avec cas clients"],
            expectedResult: "35 à 50 k€ de CA annuel, missions choisies"
          },
          {
            period: '2 ans',
            objective: "Spécialisation et montée en gamme",
            actions: ["Choisir une verticale sectorielle forte", "Développer une méthodologie propriétaire", "Animer une newsletter ou un contenu régulier"],
            skills: ["Thought leadership", "Automatisation", "Structuration d'offre premium"],
            proofsToBuild: ["Méthodologie documentée", "Conférence ou intervention publique"],
            expectedResult: "50 à 70 k€, clients grands comptes possibles"
          },
          {
            period: '3 ans',
            objective: "Cabinet solo ou association",
            actions: ["Envisager un associé complémentaire", "Structurer un réseau de sous-traitants", "Développer une offre formation complémentaire"],
            skills: ["Management", "Délégation", "Développement commercial"],
            proofsToBuild: ["Proposition de valeur agence", "Site web professionnel complet"],
            expectedResult: "Structure à 80–100 k€ de CA, travail en réseau"
          },
          {
            period: '5 ans',
            objective: "Leader reconnu sur sa niche",
            actions: ["Publier un livre blanc ou guide de référence", "Intervenir en école de commerce ou événements", "Créer une offre digitale passif/scalable"],
            skills: ["Influence", "Création de contenu expert", "Scalabilité"],
            proofsToBuild: ["Publication reconnue", "Communauté engagée"],
            expectedResult: "Revenu mixte consulting + digital, liberté totale d'emploi du temps"
          },
        ],
        detailedActionPlan30Days: [
          { week: 1, title: "Comprendre le marché", actions: ["Lire 10 fiches de poste consultant PME digital", "Regarder 3 vidéos de témoignages consultants indépendants", "Lister ses 5 principales compétences transférables"] },
          { week: 2, title: "Positionner son offre", actions: ["Rédiger sa proposition de valeur en 2 phrases", "Choisir 2 secteurs cibles prioritaires", "Identifier 10 PME cibles dans son réseau proche"] },
          { week: 3, title: "Créer sa première preuve", actions: ["Rédiger une étude de cas fictive ou réelle de 1 page", "Optimiser son profil LinkedIn avec mots-clés consulting", "Créer un document de présentation simple de son offre"] },
          { week: 4, title: "Activer son réseau", actions: ["Envoyer 10 messages personnalisés à d'anciens contacts", "Demander 2 appels de découverte", "Rejoindre 2 groupes LinkedIn ou Slack de son secteur"] },
        ],
        firstWeekActions: [
          "Lire 5 offres de mission consultant sur Malt ou Codeur.com",
          "Identifier 3 personnes dans son réseau qui ont fait ce saut",
          "Créer un document Notion listant ses 10 compétences clés",
          "Reformuler son titre LinkedIn en mode consultant",
        ],
        miniProjectToLaunch: "Réaliser un mini-audit digital fictif pour une PME de son entourage et le présenter en 5 slides — cette preuve concrète servira de premier portfolio.",
        peopleToContact: ["Consultants indépendants sur LinkedIn (chercher 'consultant PME digital')", "Anciens collègues devenus freelances", "Responsables de structure d'accompagnement comme la CCI", "Membres de communautés comme Indépendants.io ou Malt Community"],
        proofsToBuild: ["Étude de cas d'une mission fictive ou réelle", "Profil LinkedIn avec recommandations", "Page de présentation de l'offre (Notion ou site simple)", "Témoignage d'un premier client"],
        recommendedTrainingTypes: ["Formation prospection commerciale B2B (2 jours)", "Atelier pricing freelance (en ligne, 4h)", "Certification en outil digital clé de sa niche (ex : HubSpot, Make, Notion)"],
        similarJobs: ["Chef de projet digital indépendant", "Directeur digital à temps partagé", "Business analyst freelance", "Coach en organisation digitale"],
        risksAndLimits: ["Revenus irréguliers les 6 premiers mois", "Isolement si travail 100 % solo", "Concurrence croissante sur les marchés non niché"],
        firstConcreteStep: "Aujourd'hui, ouvre LinkedIn et reformule ton titre en 'Consultant [ta niche] pour [ton public cible]'. Puis liste 10 personnes dans ton réseau qui pourraient te recommander ou avoir besoin de tes services.",
      },
      {
        pathType: 'passion_based',
        title: `Formateur en compétences numériques pour adultes en reconversion`,
        sector: 'Formation & EdTech',
        revenueEstimate: '35 000 – 55 000 €/an',
        happinessScore: 81,
        riskLevel: 'Faible à modéré',
        difficultyLevel: 'Progressive',
        fitScore: 75,
        securityScore: 68,
        freedomScore: 82,
        incomePotentialScore: 58,
        alignmentScore: 88,
        personalCompatibilityScore: 78,
        feasibilityScore: 62,
        marketOpportunityScore: 70,
        transitionEffortScore: 55,
        longDescription: `Cette trajectoire est pour ceux qui trouvent leur énergie dans le fait de transmettre, d'expliquer, de voir quelqu'un progresser. La formation professionnelle est un secteur en forte croissance grâce au CPF et aux financements Pôle Emploi — des adultes en reconversion cherchent en permanence des formateurs capables d'expliquer clairement des outils numériques souvent mal documentés.\n\nVous n'avez pas besoin d'une certification de formateur pour commencer. Vous avez besoin de maîtriser votre sujet, d'être capable de créer un programme structuré, et de trouver vos premiers apprenants. La plupart des formateurs indépendants commencent en intervenant pour des organismes de formation existants (OF) avant de créer leur propre offre.\n\nLe quotidien d'un formateur est varié : préparation de modules, animation d'ateliers en présentiel ou distanciel, suivi individuel, création de ressources pédagogiques. C'est un métier qui demande de la patience, de la clarté pédagogique, et une vraie capacité à adapter son discours à des publics très différents.\n\nFinancièrement, le démarrage est plus lent qu'en consulting : les premières formations sont souvent sous-payées ou gratuites pour construire une réputation. Mais à partir de 18 mois, un formateur avec une niche claire et des certifications Qualiopi peut facturer entre 1 000 et 2 000 € par jour de formation. Et une formation en ligne peut générer des revenus passifs durables.\n\nCette voie est particulièrement adaptée à quelqu'un qui valorise l'impact humain, la flexibilité de lieu, et la satisfaction de voir des gens évoluer grâce à soi.`,
        keyInsight: `Le marché de la formation CPF explose mais se régule. Se positionner sur une niche précise (ex : outils IA pour TPE, Excel pour PME, Notion pour équipes) est la clé pour sortir du lot et obtenir une certification Qualiopi rapidement.`,
        whyItFits: [
          "Votre capacité à expliquer des choses complexes simplement est votre plus grand atout",
          "Le marché CPF finance les apprenants, réduisant la barrière commerciale",
          "Vous pouvez commencer le week-end ou en soirée sans tout quitter",
          "Impact direct et mesurable sur les personnes formées",
        ],
        dailyLife: `Une journée type : le matin, animation d'un atelier en visio avec 8 participants sur l'utilisation des outils IA. L'après-midi, correction des exercices remis et préparation du module suivant. Le soir, mise à jour de la plateforme en ligne et réponse aux questions des apprenants asynchrones. Deux à trois jours de formation par semaine maximum.`,
        alreadyAcquiredStrengths: ["Expertise métier solide", "Expérience de présentation", "Patience et pédagogie naturelle", "Réseau professionnel à activer"],
        missingSkills: ["Ingénierie pédagogique", "Certification Qualiopi (pour accès CPF)", "Outils de création e-learning (Teachable, Thinkific, Notion)", "Marketing de formation"],
        likelyObstacles: ["Temps de build long avant les premiers revenus significatifs", "Processus de certification Qualiopi coûteux et administratif", "Difficulté à se démarquer face à la multiplication des offres de formation"],
        mistakesToAvoid: ["Créer une formation avant de valider la demande", "Viser un public trop large", "Négliger la partie pédagogie au profit du marketing", "Ignorer les organismes de formation existants comme premiers partenaires"],
        fiveYearTimeline: [
          {
            period: '30 jours',
            objective: "Identifier sa niche et tester l'intérêt",
            actions: ["Définir 3 thèmes de formation possibles", "Interroger 5 potentiels apprenants sur leurs besoins", "Étudier les formations CPF concurrentes sur Mon Compte Formation"],
            skills: ["Analyse de marché", "Écoute active"],
            proofsToBuild: ["Liste de 50 potentiels apprenants", "Fiche descriptive de sa première formation"],
            expectedResult: "Niche validée avec preuve d'intérêt terrain"
          },
          {
            period: '3 mois',
            objective: "Créer et tester sa première formation",
            actions: ["Contacter 2 organismes de formation pour intervenir", "Créer un module pilote de 3h", "Animer une session test gratuite pour 5 personnes"],
            skills: ["Ingénierie pédagogique", "Animation de groupe", "Création de supports"],
            proofsToBuild: ["Support de formation complet", "Témoignages des 5 premiers participants"],
            expectedResult: "Première session animée, retours concrets collectés"
          },
          {
            period: '6 mois',
            objective: "Premières formations rémunérées",
            actions: ["Signer avec 1 à 2 organismes de formation partenaires", "Mettre en ligne une version digitale courte de la formation", "Obtenir les premiers avis vérifiés"],
            skills: ["Vente de formation", "E-learning", "Gestion administrative OF"],
            proofsToBuild: ["Programme de formation documenté", "Page de vente simple", "Avis clients vérifiés"],
            expectedResult: "2 000 à 4 000 € de revenus formation"
          },
          {
            period: '12 mois',
            objective: "Lancer sa structure propre et viser le financement CPF",
            actions: ["Créer son organisme de formation", "Entamer le processus de certification Qualiopi", "Développer une offre en ligne complémentaire"],
            skills: ["Certification Qualiopi", "Juridique formation", "Marketing digital"],
            proofsToBuild: ["Dossier Qualiopi", "Site web professionnel", "Catalogue de formations"],
            expectedResult: "Structure créée, 10 000 à 20 000 € de CA annuel"
          },
          {
            period: '2 ans',
            objective: "Certification Qualiopi et accès au CPF",
            actions: ["Obtenir la certification Qualiopi", "Référencer ses formations sur Mon Compte Formation", "Recruter 1 formateur associé ou sous-traitant"],
            skills: ["Pilotage qualité", "Management formateurs"],
            proofsToBuild: ["Certification Qualiopi obtenue", "Catalogue référencé CPF"],
            expectedResult: "30 000 à 45 000 € de CA, automatisation partielle"
          },
          {
            period: '3 ans',
            objective: "Diversification et scalabilité",
            actions: ["Lancer une formation en ligne evergreen (accès permanent)", "Développer un programme de mentorat", "Créer un partenariat école ou entreprise"],
            skills: ["Scalabilité", "Community management", "Partenariats B2B"],
            proofsToBuild: ["Formation evergreen avec 50+ inscrits", "Communauté active en ligne"],
            expectedResult: "Revenu mixte présentiel + digital, 40 000 à 55 000 €"
          },
          {
            period: '5 ans',
            objective: "Référence reconnue sur sa niche",
            actions: ["Publier un livre ou guide gratuit de référence", "Intervenir dans des événements sectoriels", "Former d'autres formateurs (train the trainer)"],
            skills: ["Autorité de niche", "Publication", "Train the trainer"],
            proofsToBuild: ["Publication référence", "100+ témoignages", "Réseau formateurs associés"],
            expectedResult: "Revenu stable 50–60 k€, impact fort, pleine autonomie"
          },
        ],
        detailedActionPlan30Days: [
          { week: 1, title: "Comprendre le marché de la formation", actions: ["Regarder 3 formations sur Mon Compte Formation dans votre thème", "Identifier 5 formateurs indépendants sur LinkedIn et analyser leur profil", "Lister vos 3 sujets d'expertise que vous pourriez enseigner"] },
          { week: 2, title: "Valider le besoin terrain", actions: ["Interroger 5 personnes susceptibles d'être vos apprenants", "Poser une question ouverte dans un groupe LinkedIn de votre secteur", "Analyser les mots-clés de recherche de formation dans votre niche"] },
          { week: 3, title: "Créer un contenu pilote", actions: ["Rédiger le plan d'une formation de 3h sur votre sujet", "Créer 3 slides de présentation pour tester l'intérêt", "Proposer une session gratuite de découverte à 3 personnes"] },
          { week: 4, title: "Prise de contact professionnelle", actions: ["Contacter 3 organismes de formation pour proposer une intervention", "Créer un profil sur Malt ou LinkedIn en tant que formateur", "Demander un retour à 2 personnes qui ont vu votre contenu pilote"] },
        ],
        firstWeekActions: [
          "Regarder 5 formations sur Mon Compte Formation dans votre domaine d'expertise",
          "Lister les 3 compétences que vous êtes capable d'enseigner dès maintenant",
          "Identifier 3 organismes de formation qui pourraient vous accueillir",
          "Créer une ébauche de plan pour un module de 2h sur votre sujet principal",
        ],
        miniProjectToLaunch: "Animer une session de 45 minutes gratuite sur Zoom pour 5 à 8 personnes de votre réseau sur un sujet que vous maîtrisez. Recueillir leurs retours écrits. C'est votre première 'preuve de concept' formateur.",
        peopleToContact: ["Responsables pédagogiques d'organismes de formation (rechercher sur LinkedIn)", "Formateurs indépendants pour comprendre leur parcours", "Responsables RH d'entreprises pour identifier les besoins formation", "Conseillers CPF ou Pôle Emploi pour comprendre le parcours apprenant"],
        proofsToBuild: ["Programme de formation structuré (pdf)", "Témoignages de vos premiers participants", "Vidéo courte de présentation de votre approche pédagogique", "Profil formateur sur LinkedIn et Malt"],
        recommendedTrainingTypes: ["Formation de formateurs (2 jours, certifiante)", "Ingénierie pédagogique e-learning", "Initiation au processus de certification Qualiopi"],
        similarJobs: ["Coach professionnel certifié", "Facilitateur ateliers", "Responsable formation en entreprise", "Créateur de cours en ligne"],
        risksAndLimits: ["Marché de la formation CPF en saturation progressive sur certaines niches", "Revenus instables les 12 premiers mois", "Administrative lourde pour la certification Qualiopi"],
        firstConcreteStep: "Cette semaine, ouvre Mon Compte Formation et recherche les 5 premières formations dans votre domaine. Analysez leur description, leur prix, leurs avis. Identifiez CE QUI MANQUE. C'est là votre ouverture.",
      },
      {
        pathType: 'high_potential',
        title: `Cofondateur d'une micro-startup SaaS pour un secteur de niche`,
        sector: 'Tech & Entrepreneuriat',
        revenueEstimate: '0 – 80 000 €/an (variable selon traction)',
        happinessScore: 68,
        riskLevel: 'Élevé',
        difficultyLevel: 'Exigeante',
        fitScore: 58,
        securityScore: 35,
        freedomScore: 90,
        incomePotentialScore: 95,
        alignmentScore: 70,
        personalCompatibilityScore: 65,
        feasibilityScore: 40,
        marketOpportunityScore: 88,
        transitionEffortScore: 80,
        longDescription: `Cette trajectoire est la plus ambitieuse et la plus risquée — mais aussi celle avec le plus fort potentiel de liberté totale et d'impact. Elle convient à quelqu'un qui a identifié un problème réel que les outils existants ne résolvent pas bien, et qui est prêt à passer 12 à 24 mois difficiles avant de voir le fruit de son travail.\n\nCrter une micro-startup SaaS ne nécessite pas d'être développeur. Des outils no-code comme Bubble, Webflow, ou Glide permettent de construire un MVP en quelques semaines. La clé est d'abord de valider que le problème existe et que des gens sont prêts à payer pour le résoudre — avant d'écrire une seule ligne de code ou de dépenser un seul euro.\n\nLe quotidien du fondateur en phase early-stage : interviewer des clients potentiels, tester des hypothèses, itérer vite, vendre des abonnements avant même que le produit soit parfait. Il faut une très forte tolérance à l'ambiguïté, à l'échec partiel, et à la solitude des débuts.\n\nFinancièrement, cette trajectoire peut aller dans tous les sens : échouer complètement, générer quelques centaines d'euros par mois, ou exploser à 100 k€ d'ARR en 3 ans. L'issue dépend en grande partie de la qualité de la validation initiale et de la capacité à trouver des clients très tôt. Un cofondateur technique est un atout majeur — il permet de réduire les coûts et d'accélérer le développement.\n\nCette trajectoire est recommandée uniquement si vous avez au moins 6 mois d'épargne de sécurité, une vraie tolérance à l'incertitude, et une idée de problème précis sur lequel vous avez une conviction forte.`,
        keyInsight: `La plupart des startups échouent non par manque de technologie, mais par manque de clients. Votre premier travail n'est pas de construire un produit : c'est de trouver 10 personnes prêtes à payer pour résoudre le problème que vous avez identifié.`,
        whyItFits: [
          "Votre connaissance du terrain vous donne un avantage sur les problèmes réels non résolus",
          "L'écosystème no-code permet de valider sans coder",
          "Le marché SaaS de niche est peu concurrentiel sur des verticales spécifiques",
          "Potentiel de revenu passif et de valeur capitalistique unique",
        ],
        dailyLife: `Les 3 premiers mois : beaucoup de conversations, peu de construction. Vous parlez à 5 personnes par semaine pour comprendre leur problème. Vous testez des landing pages. Vous lisez des retours utilisateurs. Après 6 mois : vous construisez le MVP, vous onboardez les 10 premiers clients, vous corrigez des bugs à 23h. Après 18 mois si ça marche : votre SaaS tourne en arrière-plan, vous gérez la croissance, le support, les partenariats.`,
        alreadyAcquiredStrengths: ["Connaissance secteur profonde", "Réseau existant dans un domaine", "Expérience des processus opérationnels", "Compréhension des douleurs métier"],
        missingSkills: ["Développement no-code ou techniques", "Growth marketing", "Sales early-stage", "Gestion financière startup"],
        likelyObstacles: ["Validation insuffisante du problème avant de construire", "Difficulté à trouver un cofondateur technique", "Épuisement lors de la phase sans revenus", "Concurrence d'acteurs plus rapides ou mieux financés"],
        mistakesToAvoid: ["Construire un produit avant d'avoir 10 clients engagés", "Lever des fonds trop tôt et perdre le contrôle", "Ignorer le churn (taux de désabonnement)", "Vouloir servir tout le monde dès le début"],
        fiveYearTimeline: [
          {
            period: '30 jours',
            objective: "Valider l'existence et l'intensité du problème",
            actions: ["Réaliser 20 interviews de 30 min avec des cibles potentielles", "Identifier 3 solutions existantes et leurs limites", "Rédiger une fiche problème-solution en 1 page"],
            skills: ["Customer discovery", "Empathy mapping"],
            proofsToBuild: ["20 interviews documentées", "Fiche problème-solution validée"],
            expectedResult: "Confirmation ou infirmation de l'hypothèse initiale"
          },
          {
            period: '3 mois',
            objective: "Créer un MVP et trouver 5 bêta-testeurs payants",
            actions: ["Construire une landing page avec une liste d'attente", "Développer un MVP no-code ou en partenariat", "Onboarder 5 premiers utilisateurs willing to pay"],
            skills: ["No-code (Bubble, Glide)", "Landing page", "Onboarding utilisateur"],
            proofsToBuild: ["MVP fonctionnel minimal", "5 pré-inscriptions ou pré-paiements"],
            expectedResult: "Validation de la volonté de payer sur un problème réel"
          },
          {
            period: '6 mois',
            objective: "Atteindre 20 clients payants et 1 000 € MRR",
            actions: ["Lancer en beta fermée, itérer selon retours", "Développer un canal d'acquisition principal", "Mettre en place un support client réactif"],
            skills: ["Product iteration", "Growth", "Support client"],
            proofsToBuild: ["Témoignages 5 premiers clients", "Taux de rétention > 70 %"],
            expectedResult: "20 clients, 1 000 € MRR, product-market fit partiel"
          },
          {
            period: '12 mois',
            objective: "Atteindre 5 000 € MRR et rentabilité opérationnelle",
            actions: ["Scaler le canal d'acquisition qui fonctionne", "Développer un programme de referral", "Automatiser le support et l'onboarding"],
            skills: ["Marketing automation", "Analytics", "Funnel optimization"],
            proofsToBuild: ["Dashboard de métriques SaaS (MRR, churn, LTV)", "Témoignages clients vidéo"],
            expectedResult: "5 000 € MRR, seuil de rentabilité atteint"
          },
          {
            period: '2 ans',
            objective: "Croissance et équipe",
            actions: ["Recruter un premier employé ou associé", "Explorer un deuxième canal d'acquisition", "Envisager un positionnement premium ou enterprise"],
            skills: ["Management", "Recrutement", "Pricing stratégique"],
            proofsToBuild: ["ARR 60 000 €+", "Équipe de 2-3 personnes"],
            expectedResult: "Entreprise rentable, 60–80 k€ ARR"
          },
          {
            period: '3 ans',
            objective: "Leader sur sa niche ou pivot stratégique",
            actions: ["Consolider la position de leader sur le segment", "Envisager une levée de fonds ou une acquisition", "Développer des intégrations partenaires"],
            skills: ["Business development", "M&A basics", "Partenariats stratégiques"],
            proofsToBuild: ["100+ clients actifs", "NPS > 50"],
            expectedResult: "120–200 k€ ARR, valorisation significative"
          },
          {
            period: '5 ans',
            objective: "Exit, scale massif ou lifestyle business",
            actions: ["Décider entre scale agressif, cession ou lifestyle", "Structurer une équipe autonome", "Explorer de nouvelles verticales"],
            skills: ["Vision stratégique", "Leadership", "Finance d'entreprise"],
            proofsToBuild: ["ARR stable ou croissant", "Équipe autonome"],
            expectedResult: "Liberté financière ou valeur de cession importante"
          },
        ],
        detailedActionPlan30Days: [
          { week: 1, title: "Définir l'hypothèse de problème", actions: ["Choisir un secteur ou problème précis", "Lister 30 personnes qui pourraient être affectées par ce problème", "Rédiger une hypothèse en 3 phrases"] },
          { week: 2, title: "Valider le problème sur le terrain", actions: ["Conduire 10 interviews courtes (15 min)", "Utiliser le script 'Mom Test' pour éviter les biais", "Documenter les verbatims les plus révélateurs"] },
          { week: 3, title: "Analyser la concurrence", actions: ["Tester 3 solutions existantes sur ce problème", "Lister leurs limites perçues par les interviewés", "Identifier le 'gap' différenciateur"] },
          { week: 4, title: "Concevoir la solution minimale", actions: ["Dessiner les 3 écrans clés de la solution (papier ou Figma)", "Créer une landing page de pré-inscription (Carrd ou Webflow)", "Partager à 5 des interviewés et mesurer l'intérêt"] },
        ],
        firstWeekActions: [
          "Identifier un problème précis que vous voyez dans votre secteur actuel",
          "Contacter 5 personnes qui vivent ce problème et demander 15 minutes de leur temps",
          "Lire 'The Mom Test' de Rob Fitzpatrick (disponible gratuitement en résumé en ligne)",
          "Rechercher sur ProductHunt et AppSumo les outils existants sur votre thème",
        ],
        miniProjectToLaunch: "Créer une landing page en 48h avec Carrd.co décrivant la solution imaginée, un formulaire d'inscription à une bêta et un texte de pré-vente. Partager le lien à 20 personnes ciblées. Mesurer : combien s'inscrivent ? C'est votre premier signal de marché.",
        peopleToContact: ["Fondateurs de micro-SaaS sur Twitter/X ou IndieHackers", "Développeurs no-code sur des communautés Bubble ou Make", "Investisseurs angels spécialisés early-stage", "Autres entrepreneurs dans votre secteur cible"],
        proofsToBuild: ["Landing page avec liste d'attente", "Documentation des 20 premières interviews", "MVP fonctionnel (même très simple)", "Premiers clients bêta payants"],
        recommendedTrainingTypes: ["No-code : Bubble, Webflow ou Glide Academy (gratuit)", "Customer discovery : Ycombinator Startup School (gratuit en ligne)", "SaaS metrics : ProfitWell Academy"],
        similarJobs: ["Product manager indépendant", "Entrepreneur en résidence", "Intrapreneur en startup", "Business developer tech"],
        risksAndLimits: ["Revenus nuls ou très faibles pendant 12 à 24 mois", "Risque d'épuisement si seul", "Probabilité d'échec élevée (environ 70% des startups)", "Besoin de capital ou d'épargne personnelle"],
        firstConcreteStep: "Dans les 48 prochaines heures, identifiez UN problème précis que vous observez dans votre secteur actuel et que les outils existants ne résolvent pas bien. Écrivez-le en une seule phrase claire. Partagez-la à 3 personnes concernées et demandez si elles reconnaissent ce problème.",
      },
    ],
    comparison: {
      safestPath: 'Consultant indépendant en transformation digitale pour PME',
      mostPassionAlignedPath: 'Formateur en compétences numériques pour adultes en reconversion',
      highestPotentialPath: "Cofondateur d'une micro-startup SaaS pour un secteur de niche",
      recommendedFirstChoice: 'Consultant indépendant en transformation digitale pour PME',
      reason: "C'est la trajectoire qui valorise le mieux vos compétences existantes avec le moins de formation préalable. Elle offre un équilibre sécurité/liberté et peut s'enclencher dans les 30 prochains jours. Les deux autres trajectoires peuvent se construire en parallèle ou en séquence.",
    },
    bestFirstStep48h: "Ouvrez LinkedIn. Reformulez votre titre en mode 'Consultant [votre domaine] pour [votre cible]'. Puis envoyez un message à 5 personnes de votre réseau en leur disant que vous réfléchissez à lancer une activité de conseil dans votre domaine et que vous cherchez à comprendre les besoins du marché. Ces 5 conversations vous donneront plus d'informations que 10 heures de recherche seule.",
  }
}

// ── Validation du rapport IA ──────────────────────────────────────

const SCORE_FIELDS = [
  'fitScore', 'alignmentScore', 'personalCompatibilityScore',
  'feasibilityScore', 'marketOpportunityScore', 'transitionEffortScore',
] as const

type ValidationResult =
  | { ok: true;  data: ReportData }
  | { ok: false; error: string }

function validateAIReport(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'La réponse IA n\'est pas un objet' }
  }
  const r = raw as Record<string, unknown>

  if (!r.reportSummary || typeof r.reportSummary !== 'string' || !r.reportSummary.trim()) {
    return { ok: false, error: 'reportSummary manquant ou vide' }
  }
  if (!r.bestFirstStep48h || typeof r.bestFirstStep48h !== 'string' || !r.bestFirstStep48h.trim()) {
    return { ok: false, error: 'bestFirstStep48h manquant ou vide' }
  }
  if (!r.comparison || typeof r.comparison !== 'object' || Array.isArray(r.comparison)) {
    return { ok: false, error: 'comparison manquant ou invalide' }
  }
  if (!Array.isArray(r.paths)) {
    return { ok: false, error: 'paths doit être un tableau' }
  }
  if (r.paths.length !== 3) {
    return { ok: false, error: `paths doit contenir exactement 3 trajectoires, reçu : ${r.paths.length}` }
  }

  const VALID_TYPES = new Set(['current_aligned', 'passion_based', 'high_potential'])
  const foundTypes  = new Set<string>()

  for (let i = 0; i < r.paths.length; i++) {
    const p   = r.paths[i] as Record<string, unknown>
    const idx = `paths[${i}]`

    if (!p.title || typeof p.title !== 'string' || !p.title.trim()) {
      return { ok: false, error: `${idx}.title vide ou manquant` }
    }
    if (!p.pathType || !VALID_TYPES.has(p.pathType as string)) {
      return { ok: false, error: `${idx}.pathType invalide : "${p.pathType}"` }
    }
    if (!p.sector || typeof p.sector !== 'string') {
      return { ok: false, error: `${idx}.sector manquant` }
    }
    if (!p.revenueEstimate || typeof p.revenueEstimate !== 'string') {
      return { ok: false, error: `${idx}.revenueEstimate manquant` }
    }
    if (!p.riskLevel || typeof p.riskLevel !== 'string') {
      return { ok: false, error: `${idx}.riskLevel manquant` }
    }
    if (!p.firstConcreteStep || typeof p.firstConcreteStep !== 'string') {
      return { ok: false, error: `${idx}.firstConcreteStep manquant` }
    }

    for (const sf of SCORE_FIELDS) {
      const v = p[sf]
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 100) {
        return { ok: false, error: `${idx}.${sf} doit être un entier 0-100, reçu : ${JSON.stringify(v)}` }
      }
    }

    const arrays: Array<[string, number | null]> = [
      ['risksAndLimits', 1],
      ['alreadyAcquiredStrengths', 1],
      ['missingSkills', 1],
      ['firstWeekActions', 1],
      ['whyItFits', 1],
      ['detailedActionPlan30Days', 4],
      ['fiveYearTimeline', 7],
    ]
    for (const [field, expectedLen] of arrays) {
      if (!Array.isArray(p[field])) {
        return { ok: false, error: `${idx}.${field} doit être un tableau` }
      }
      if (expectedLen !== null && (p[field] as unknown[]).length !== expectedLen) {
        return { ok: false, error: `${idx}.${field} : longueur attendue ${expectedLen}, reçu ${(p[field] as unknown[]).length}` }
      }
      if (expectedLen === 1 && (p[field] as unknown[]).length === 0) {
        return { ok: false, error: `${idx}.${field} ne peut pas être vide` }
      }
    }

    foundTypes.add(p.pathType as string)
  }

  if (foundTypes.size !== 3) {
    const types = (r.paths as Array<Record<string, unknown>>).map(p => p.pathType)
    return { ok: false, error: `Les 3 pathTypes doivent être distincts. Reçu : [${types.join(', ')}]` }
  }

  return { ok: true, data: raw as ReportData }
}

// ── Prompt OpenAI amélioré ────────────────────────────────────────

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
- longDescription : MINIMUM 1800 caractères par trajectoire, avec au moins 5 références explicites au profil
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
  · mistakeToAvoid : erreur fréquente à éviter cette semaine`

async function generateAIReport(
  data: Record<string, unknown>,
  answers: Record<string, QuestionAnswer>
): Promise<ReportData> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY non configurée')

  const client = new OpenAI({ apiKey })
  const a = answers
  const firstName = data.firstName as string

  const cvSection = buildCvSection(data.cvText as string | undefined)
  if (cvSection) {
    console.log(`[cv] CV fourni — ${String(data.cvText ?? '').length} chars extraits → ${cvSection.length} chars envoyés à l'IA`)
  } else {
    console.log('[cv] Aucun CV fourni — analyse basée uniquement sur le questionnaire')
  }

  const userPrompt = `Analyse ce profil complet et génère un rapport OtherMe avec 3 trajectoires de vie alternatives très détaillées.

═══════════════════════════════════════
PROFIL DE ${firstName.toUpperCase()}
═══════════════════════════════════════
Prénom : ${firstName}
Âge : ${data.age || 'non renseigné'} ans
Situation actuelle : ${data.currentSituation || 'non renseigné'}
Métier actuel : ${data.currentJob || 'non renseigné'}
Secteur : ${data.sector || 'non renseigné'}
Années d'expérience : ${data.yearsExperience ?? 'non renseigné'}
Formation : ${[data.educationLevel, data.educationField].filter(Boolean).join(' en ') || 'non renseigné'}
Ville : ${data.city || 'non renseigné'}
${cvSection ? `
═══════════════════════════════════════════════════════
CONTENU DU CV (source de vérité — ${cvSection.length} caractères)
═══════════════════════════════════════════════════════
${cvSection}

⚠️ INSTRUCTION CV : Dans CHAQUE trajectoire, cite EXPLICITEMENT au moins 3 éléments concrets de ce CV (intitulés de postes, outils nommés, réalisations chiffrées, secteurs connus) dans les champs alreadyAcquiredStrengths, whyItFits et longDescription. Ne paraphrase pas — nomme.` : ''}

═══════════════════════════════════════
RÉPONSES AU QUESTIONNAIRE
═══════════════════════════════════════
Motivations principales : ${fmt(a['motivation']) || 'non renseigné'}
Ce qui donne de l'énergie : ${fmt(a['energy']) || 'non renseigné'}
Ce qui fatigue / vide : ${fmt(a['drains']) || 'non renseigné'}
Centres d'intérêt : ${fmt(a['interests']) || 'non renseigné'}
Compétences déclarées : ${fmt(a['skills']) || 'non renseigné'}
Profil naturel : ${fmt(a['profile']) || 'non renseigné'}
Rôle préféré : ${fmt(a['role']) || 'non renseigné'}
Style de vie souhaité : ${fmt(a['lifestyle']) || 'non renseigné'}
Tolérance au risque : ${fmt(a['risk']) || 'non renseigné'}
Ambition financière : ${fmt(a['money']) || 'non renseigné'}
Vision dans 5 ans : ${fmt(a['vision5y']) || 'non renseigné'}
Ce qu'il faut absolument éviter : ${fmt(a['avoidNext']) || 'non renseigné'}
Freins identifiés : ${fmt(a['blocks']) || 'non renseigné'}
Chemin réaliste selon lui/elle : ${fmt(a['realisticPath']) || 'non renseigné'}
Rapport à l'autonomie : ${fmt(a['relation']) || 'non renseigné'}
Test de transition envisagé : ${fmt(a['transitionTest']) || 'non renseigné'}
Critères de succès personnels : ${fmt(a['successCriteria']) || 'non renseigné'}
Ce qui est demandé aux autres : ${fmt(a['askedFor']) || 'non renseigné'}
Activité qui absorbe le temps : ${fmt(a['timeActivity']) || 'non renseigné'}

═══════════════════════════════════════════════════════
RÈGLES DE DIFFÉRENCIATION DES 3 TRAJECTOIRES
═══════════════════════════════════════════════════════

TRAJECTOIRE 1 — pathType: "current_aligned" — La plus proche, la plus rapide
• Même secteur ou secteur adjacent au parcours actuel
• Réutilise 70 à 90 % des compétences existantes (transfère, n'invente pas)
• Transition réalisable en moins de 6 mois sans formation longue
• fitScore cible : 75–92 | riskLevel : "Faible" ou "Modéré"
• Doit citer EXPLICITEMENT les compétences actuelles qui s'appliquent directement

TRAJECTOIRE 2 — pathType: "passion_based" — La plus alignée avec les envies déclarées
• Secteur différent des deux autres, ancré sur les motivations et centres d'intérêt déclarés
• Réutilise 40 à 65 % des compétences (les transférables), nécessite formation ou test
• Transition de 6 à 18 mois, avec une phase de validation possible en parallèle
• fitScore cible : 62–82 | riskLevel : "Modéré"
• Doit citer EXPLICITEMENT les réponses aux champs "énergie", "intérêts", "lifestyle"

TRAJECTOIRE 3 — pathType: "high_potential" — La plus ambitieuse, la plus risquée
• Secteur clairement différent des deux premières trajectoires
• Rupture plus grande, ancré sur des forces réelles, opportunité de marché identifiable
• Transition de 12 à 36 mois, effort élevé, risque assumé
• fitScore cible : 48–70 | riskLevel : "Élevé"
• Doit justifier EXPLICITEMENT pourquoi c'est ambitieux mais réaliste pour CE profil

INTERDITS ABSOLUS :
- Deux trajectoires dans le même secteur
- Deux trajectoires avec le même type d'activité (ex. deux consulting, deux formation)
- Compétences inventées non présentes dans le profil
- Promesses d'emploi ou de revenus garantis

═══════════════════════════════════════════════════════
EXEMPLES DE QUALITÉ ATTENDUE
═══════════════════════════════════════════════════════

whyItFits — CORRECT (cite le profil + lien direct) :
"Tes années d'expérience en [secteur] t'ont donné [compétence précise] — directement transférable ici car [raison liée au métier cible]."
"Tu as déclaré vouloir éviter [avoidNext] : la structure de ce métier l'exclut structurellement car [raison]."

whyItFits — INTERDIT :
"Votre expérience est valorisable dans ce domaine." ← trop vague, refusé
"Cette trajectoire correspond à votre profil." ← non citant, refusé

alreadyAcquiredStrengths — CORRECT :
"Gestion de projet complexe — Source : [poste X] où tu pilotais [Y] — Valorisation en [métier cible] : directement utilisable pour [action concrète]"

missingSkills — CORRECT :
"Prospection commerciale B2B — Pourquoi critique : ce métier exige de trouver ses propres clients — Acquisition : formation 'Vente consultative' sur LinkedIn Learning (8h) — Niveau cible : intermédiaire — Priorité : haute"

risksAndLimits — CORRECT :
"Revenus irréguliers les 6 premiers mois — Cause : absence de clients récurrents en phase de démarrage — Réduction : constituer 3 mois de trésorerie avant lancement — Erreur classique : partir sans filet, puis baisser ses tarifs par peur"

═══════════════════════════════════════════════════════
JSON ATTENDU (réponds UNIQUEMENT avec ce JSON)
═══════════════════════════════════════════════════════
{
  "reportSummary": "Synthèse de 5 à 8 lignes : (1) contexte actuel de ${firstName} avec ses forces identifiées, (2) fil conducteur logique entre les 3 trajectoires proposées, (3) ce qui rend chaque trajectoire cohérente avec CE profil précis. Jamais générique.",
  "paths": [
    {
      "pathType": "current_aligned",
      "title": "[Métier concret précis] pour [secteur/public cible spécifique]",
      "sector": "...",
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
      "longDescription": "MINIMUM 1800 caractères. Structurer en 5 blocs séparés par un saut de ligne : (1) Pourquoi CE métier pour CE profil — cite au moins 3 éléments du parcours de ${firstName}. (2) Réalité concrète du métier : ce qu'on fait vraiment, difficultés réelles, avantages tangibles. (3) État du marché : demande actuelle, secteurs qui recrutent, tendances à 3 ans. (4) Trajectoire financière réaliste : fourchettes années 1, 2-3, 5+. (5) Pourquoi c'est réaliste ou ambitieux pour ${firstName} spécifiquement.",
      "keyInsight": "Insight clé, surprenant ou contre-intuitif, spécifique à ${firstName} — jamais applicable à n'importe qui.",
      "whyItFits": [
        "Raison 1 — cite [compétence/expérience précise du profil] + explique son lien direct avec [aspect concret du métier cible]",
        "Raison 2 — cite [réponse questionnaire ou élément CV] + explique pourquoi ça aide dans [ce métier]",
        "Raison 3 — même format",
        "Raison 4 — même format"
      ],
      "dailyLife": "Journée type détaillée : matin (9h-12h tâches précises + outils), après-midi (14h-18h tâches précises), avec qui, dans quel environnement, rythme de semaine. MINIMUM 300 caractères.",
      "alreadyAcquiredStrengths": [
        "Force [X] — Source : [poste ou réalisation concrète du profil de ${firstName}] — Comment la valoriser dans [métier cible] : [action concrète]",
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
            "Créer un document listant les compétences transférables prioritaires (1h) → livrable : document avec items classés"
          ],
          "skills": ["compétence mobilisée 1", "compétence 2"],
          "proofsToBuild": ["preuve concrète 1 décrite précisément", "preuve 2"],
          "expectedResult": "Résultat observable. KPI : [indicateur mesurable]. Vigilance : [point d'attention spécifique à cette période]"
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
        "Action concrète 1 — outil nommé + durée estimée",
        "Action concrète 2",
        "Action concrète 3",
        "Action concrète 4"
      ],
      "miniProjectToLaunch": "Mini-projet précis faisable en 1 à 2 semaines : ce qu'on fait concrètement, quel outil, quel livrable, comment ça teste réellement la voie.",
      "peopleToContact": [
        "Profil 1 : [type de personne précis] — Où : [LinkedIn/Slack/événement nommé] — Pourquoi : [objectif précis]",
        "Profil 2 — Où : [...] — Pourquoi : [...]",
        "Profil 3 — Où : [...] — Pourquoi : [...]",
        "Profil 4 — Où : [...] — Pourquoi : [...]"
      ],
      "proofsToBuild": [
        "Preuve 1 : [description précise du livrable] — Format : [article/dépôt/étude de cas...] — Durée : [N jours]",
        "Preuve 2 : [...] — Format : [...] — Durée : [...]",
        "Preuve 3 : [...] — Format : [...] — Durée : [...]",
        "Preuve 4 : [...] — Format : [...] — Durée : [...]"
      ],
      "recommendedTrainingTypes": [
        "Formation 1 : [nom/type] — Plateforme : [nommée] — Durée : [estimée] — Objectif : [compétence visée]",
        "Formation 2 : [...] — Plateforme : [...] — Durée : [...] — Objectif : [...]",
        "Formation 3 : [...] — Plateforme : [...] — Durée : [...] — Objectif : [...]"
      ],
      "similarJobs": ["Métier proche 1 — pourquoi similaire", "Métier 2", "Métier 3", "Métier 4"],
      "risksAndLimits": [
        "Risque [X] — Cause : [pourquoi concrètement pour ${firstName}] — Réduction : [action concrète] — Erreur classique : [ce que font ceux qui échouent]",
        "Risque [Y] — Cause : [...] — Réduction : [...] — Erreur classique : [...]",
        "Risque [Z] — Cause : [...] — Réduction : [...] — Erreur classique : [...]",
        "Risque [W] — Cause : [...] — Réduction : [...] — Erreur classique : [...]"
      ],
      "firstConcreteStep": "Action ultra-précise que ${firstName} peut faire AUJOURD'HUI ou demain — outil exact, plateforme, action en 30 minutes ou moins, résultat attendu immédiat.",
      "positioningStatement": "Je me positionne comme [profil de ${firstName}] capable de [valeur ajoutée] pour [cible du métier cible].",
      "linkedinHeadline": "[Titre cible] | [Valeur différenciatrice] | [Signal de crédibilité]",
      "interviewPitch": "3 à 4 phrases pour expliquer cette reconversion en entretien.",
      "cvKeywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
      "comparisonWithOtherPaths": "Paragraphe de 4 à 6 lignes : pourquoi cette trajectoire current_aligned vs les deux autres. Cas où elle est recommandée. Cas où elle est déconseillée. Ce qu'elle apporte que les autres ne donnent pas."
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
      "longDescription": "MINIMUM 1800 caractères — même structure en 5 blocs, adaptée à passion_based : (1) Pourquoi CE métier pour CE profil — cite au moins 3 éléments du parcours de ${firstName}. (2) Réalité concrète du métier : ce qu'on fait vraiment, difficultés réelles, avantages tangibles. (3) État du marché : demande actuelle, secteurs qui recrutent, tendances à 3 ans. (4) Trajectoire financière réaliste : fourchettes années 1, 2-3, 5+. (5) Pourquoi c'est réaliste pour ${firstName} spécifiquement.",
      "keyInsight": "Insight spécifique à ${firstName} pour cette trajectoire passion",
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
        {"week": 1, "title": "Semaine 1 — [Thème] ([durée])", "objective": "Objectif précis de cette semaine.", "actions": ["[Verbe + objet + durée] → livrable : [résultat]", "...", "...", "..."], "deliverable": "Livrable tangible en fin de semaine.", "practicalTip": "Conseil pratique pour réussir cette semaine.", "mistakeToAvoid": "Erreur fréquente à éviter cette semaine."},
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
      "firstConcreteStep": "Action ultra-précise — outil exact, plateforme, 30 minutes max, résultat attendu immédiat.",
      "positioningStatement": "Je me positionne comme [profil de ${firstName}] capable de [valeur ajoutée] pour [cible du métier passion_based].",
      "linkedinHeadline": "[Titre cible] | [Valeur différenciatrice] | [Signal de crédibilité]",
      "interviewPitch": "3 à 4 phrases pour expliquer cette reconversion passion en entretien.",
      "cvKeywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
      "comparisonWithOtherPaths": "Paragraphe de 4 à 6 lignes : pourquoi cette trajectoire passion_based vs les deux autres. Cas où elle est recommandée. Cas où elle est déconseillée. Ce qu'elle apporte que les autres ne donnent pas."
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
      "longDescription": "MINIMUM 1800 caractères — même structure en 5 blocs, adaptée à high_potential : (1) Pourquoi CE métier ambitieux pour CE profil — cite au moins 3 éléments du parcours de ${firstName}. (2) Réalité concrète du métier : ce qu'on fait vraiment, difficultés réelles, avantages tangibles. (3) État du marché : demande actuelle, secteurs qui recrutent, tendances à 3 ans. (4) Trajectoire financière réaliste : fourchettes années 1, 2-3, 5+. (5) Justifier EXPLICITEMENT pourquoi c'est ambitieux mais réaliste pour ${firstName} spécifiquement.",
      "keyInsight": "Insight spécifique à ${firstName} pour cette trajectoire haute ambition",
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
        {"week": 1, "title": "Semaine 1 — [Thème] ([durée])", "objective": "Objectif précis de cette semaine.", "actions": ["[Verbe + objet + durée] → livrable : [résultat]", "...", "...", "..."], "deliverable": "Livrable tangible en fin de semaine.", "practicalTip": "Conseil pratique pour réussir cette semaine.", "mistakeToAvoid": "Erreur fréquente à éviter cette semaine."},
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
      "firstConcreteStep": "Action ultra-précise — outil exact, plateforme, 30 minutes max, résultat attendu immédiat.",
      "positioningStatement": "Je me positionne comme [profil de ${firstName}] capable de [valeur ajoutée ambitieuse] pour [cible du métier high_potential].",
      "linkedinHeadline": "[Titre cible ambitieux] | [Valeur différenciatrice] | [Signal de crédibilité]",
      "interviewPitch": "3 à 4 phrases pour expliquer cette reconversion ambitieuse en entretien.",
      "cvKeywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
      "comparisonWithOtherPaths": "Paragraphe de 4 à 6 lignes : pourquoi cette trajectoire high_potential vs les deux autres. Cas où elle est recommandée. Cas où elle est déconseillée. Ce qu'elle apporte que les autres ne donnent pas."
    }
  ],
  "comparison": {
    "safestPath": "Titre exact de la trajectoire la plus sûre",
    "mostPassionAlignedPath": "Titre exact de la trajectoire la plus alignée avec les passions",
    "highestPotentialPath": "Titre exact de la trajectoire au plus fort potentiel",
    "recommendedFirstChoice": "Titre exact de la trajectoire recommandée en priorité",
    "reason": "Explication personnalisée de 4 à 6 lignes : POURQUOI cette trajectoire est prioritaire pour ${firstName} — citant sa situation concrète, ses contraintes déclarées, ses forces réelles."
  },
  "bestFirstStep48h": "Action ultra-concrète que ${firstName} peut faire dans les 48 prochaines heures — outil exact, plateforme, action précise en 30 minutes ou moins, résultat attendu immédiat."
}

RAPPEL FINAL :
- Tutoyer ${firstName} dans tous les textes
- longDescription MINIMUM 1800 caractères avec au moins 5 citations du profil
- Les 3 pathTypes DOIVENT être dans des secteurs clairement distincts
- Aucune action vague, aucune phrase générique — chaque élément doit citer CE profil
- Ton honnête, professionnel, rassurant — aucune promesse d'emploi garantie
- Chaque trajectoire DOIT inclure : positioningStatement, linkedinHeadline, interviewPitch, cvKeywords, comparisonWithOtherPaths
- Chaque semaine du detailedActionPlan30Days DOIT inclure : objective, deliverable, practicalTip, mistakeToAvoid`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.72,
    max_tokens: 12000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('[openai] Réponse vide de l\'IA')

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('[openai] La réponse IA n\'est pas du JSON valide')
  }

  const validation = validateAIReport(parsed)
  if (!validation.ok) {
    console.error('[onboarding][validation] Rapport IA INVALIDE :', validation.error)
    console.error('[onboarding][validation] Extrait reçu :', JSON.stringify(parsed).slice(0, 500))
    throw new Error(`[openai] Rapport IA invalide — ${validation.error}`)
  }

  return validation.data
}

// ── Sauvegarde Supabase ───────────────────────────────────────────

async function saveToSupabase(
  data: Record<string, unknown>,
  report: ReportData,
  userId: string | null,
  generationSource: 'ai' | 'mock_fallback' = 'ai'
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
      summary:                report.reportSummary?.slice(0, 200) ?? '',
      full_report:            { ...report, generationSource },
      status:                 'ready',
    })
    .select('id, status, created_at')
    .single()
  if (repErr) throw repErr

  return repRow.id as string
}

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

export default async function handler(
  req: IncomingMessage & { body?: Record<string, string>; file?: Express.Multer.File },
  res: ServerResponse
) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }))
    return
  }

  try {
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
      age:              parseInt(body.age) || 0,
      currentSituation: body.currentSituation?.trim() || '',
      gender:           body.gender?.trim() || undefined,
      city:             body.city?.trim() || undefined,
      currentJob:       body.currentJob?.trim() || undefined,
      sector:           body.sector?.trim() || undefined,
      yearsExperience:  body.yearsExperience ? parseInt(body.yearsExperience) : undefined,
      educationLevel:   body.educationLevel?.trim() || undefined,
      educationField:   body.educationField?.trim() || undefined,
      languages:        body.languages ? JSON.parse(body.languages) : undefined,
      cvText:           cvText || undefined,
      answers,
    }

    const userId = await getUserId((req.headers as any).authorization)

    let report: ReportData
    let generationSource: 'ai' | 'mock_fallback' = 'ai'
    try {
      report = await generateAIReport(data, answers)
      console.log(`[onboarding] Rapport IA valide — source: ai — ${firstName}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('invalide')) {
        console.error('[onboarding] ⚠️  RAPPORT IA INVALIDE — fallback mock activé. Raison :', msg)
      } else {
        console.error('[onboarding] ⚠️  OpenAI indisponible — fallback mock activé :', msg)
      }
      report = generateMockReport(firstName)
      generationSource = 'mock_fallback'
    }

    let reportId: string
    let isMock = false

    try {
      console.log(`[onboarding] Sauvegarde Supabase — generationSource: ${generationSource}`)
      reportId = await saveToSupabase(data, report, userId, generationSource)
    } catch (err) {
      console.error('[onboarding] ⚠️  Supabase indisponible — rapport non sauvegardé, ID mock généré :', err)
      reportId = `mock_${crypto.randomUUID()}`
      isMock = true
    }

    const payload: Record<string, unknown> = { reportId, status: 'ready' }
    if (isMock) {
      payload.isMock = true
      payload.mockPaths = report.paths
      payload.mockReportSummary = report.reportSummary
      payload.mockComparison = report.comparison
      payload.mockBestFirstStep = report.bestFirstStep48h
      payload.firstName = firstName
      payload.email = email
    }

    res.statusCode = 200
    res.end(JSON.stringify(payload))
  } catch (err) {
    console.error('[onboarding] Erreur non gérée:', err)
    const mockId = `mock_${crypto.randomUUID()}`
    const fallback = generateMockReport('vous')
    res.statusCode = 200
    res.end(JSON.stringify({
      reportId: mockId,
      status: 'ready',
      isMock: true,
      mockPaths: fallback.paths,
      mockReportSummary: fallback.reportSummary,
      mockComparison: fallback.comparison,
      mockBestFirstStep: fallback.bestFirstStep48h,
      firstName: 'vous',
      email: '',
    }))
  }
}
