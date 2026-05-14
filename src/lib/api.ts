import type { OnboardingData, OnboardingResponse, PathData, Report, ReportComparison } from '../types'

const BASE     = '/api'
const MOCK_KEY = (id: string) => `otherme_mock_report_${id}`

function buildMockReport(
  reportId: string,
  firstName: string,
  email: string,
  paths: PathData[],
  reportSummary?: string,
  comparison?: ReportComparison,
  bestFirstStep48h?: string
): Report {
  return {
    id: reportId, firstName, email, status: 'ready',
    paths, reportSummary, comparison, bestFirstStep48h,
    createdAt: new Date().toISOString(),
  }
}

// ── submitOnboarding ──────────────────────────────────────────────

export async function submitOnboarding(
  data: OnboardingData,
  cvFile?: File | null,
  authToken?: string | null
): Promise<OnboardingResponse> {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'answers') formData.append('answers', JSON.stringify(value ?? {}))
    else if (Array.isArray(value)) formData.append(key, JSON.stringify(value))
    else if (value !== undefined && value !== null) formData.append(key, String(value))
  })
  if (cvFile) formData.append('cv', cvFile)

  const headers: HeadersInit = {}
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  let res: Response
  try {
    res = await fetch(`${BASE}/onboarding`, { method: 'POST', headers, body: formData })
  } catch (networkErr) {
    console.error('[api] Erreur réseau /api/onboarding:', networkErr)
    return generateLocalFallback(data)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    console.error('[api] Erreur HTTP /api/onboarding:', res.status, err)
    throw new Error(err.message || `Erreur ${res.status} lors de la génération du rapport`)
  }

  const result = await res.json() as OnboardingResponse

  if (result.isMock && result.mockPaths) {
    const mockReport = buildMockReport(
      result.reportId,
      result.firstName ?? data.firstName,
      result.email    ?? data.email,
      result.mockPaths,
      result.mockReportSummary,
      result.mockComparison,
      result.mockBestFirstStep
    )
    try { sessionStorage.setItem(MOCK_KEY(result.reportId), JSON.stringify(mockReport)) } catch {}
  }

  return result
}

// ── fetchReport ───────────────────────────────────────────────────

export async function fetchReport(reportId: string): Promise<Report> {
  try {
    const cached = sessionStorage.getItem(MOCK_KEY(reportId))
    if (cached) {
      const parsed = JSON.parse(cached) as Report
      if (parsed?.id && (parsed?.paths || parsed?.trajectories)) return parsed
    }
  } catch {}

  const res = await fetch(`${BASE}/report/${reportId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(err.error || 'Rapport introuvable')
  }
  return res.json() as Promise<Report>
}

// ── createCheckoutSession ─────────────────────────────────────────

export async function createCheckoutSession(
  reportId: string,
  email: string
): Promise<{ url: string }> {
  const res = await fetch(`${BASE}/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId, email }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; message?: string }
    throw new Error(err.error || err.message || 'Erreur lors de la création du paiement')
  }
  return res.json() as Promise<{ url: string }>
}

// ── verifyPayment ─────────────────────────────────────────────────

export async function verifyPayment(
  sessionId: string,
  reportId: string
): Promise<{ verified: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, reportId }),
    })
    const data = await res.json() as { verified: boolean; error?: string }
    return data
  } catch {
    return { verified: false, error: 'Impossible de vérifier le paiement. Vérifie ta connexion.' }
  }
}

// ── Local fallback (aucune connectivité) ──────────────────────────

function generateLocalFallback(data: OnboardingData): OnboardingResponse {
  const reportId  = `mock_local_${Date.now()}`
  const firstName = data.firstName || 'vous'
  const email     = data.email || ''
  const sector    = data.sector ? ` dans ${data.sector}` : ''

  const tl7 = (p1: string, p2: string, p3: string): PathData['fiveYearTimeline'] => [
    { period: '30 jours', objective: p1, actions: ['Action 1', 'Action 2', 'Action 3'], skills: ['Compétence 1'], proofsToBuild: ['Preuve 1'], expectedResult: 'Premier résultat' },
    { period: '3 mois', objective: p2, actions: ['Action 1', 'Action 2'], skills: ['Compétence 2'], proofsToBuild: ['Preuve 2'], expectedResult: 'Deuxième résultat' },
    { period: '6 mois', objective: 'Stabiliser l\'activité', actions: ['Développer le réseau'], skills: ['Gestion client'], proofsToBuild: ['Témoignages'], expectedResult: 'Revenus réguliers' },
    { period: '12 mois', objective: 'Rentabilité', actions: ['Hausser les tarifs'], skills: ['Pricing'], proofsToBuild: ['Portfolio'], expectedResult: '35-50 k€/an' },
    { period: '2 ans', objective: 'Spécialisation', actions: ['Niche forte'], skills: ['Expertise'], proofsToBuild: ['Méthodologie'], expectedResult: '50-70 k€/an' },
    { period: '3 ans', objective: 'Croissance', actions: ['Réseau associés'], skills: ['Management'], proofsToBuild: ['Structure agence'], expectedResult: '80-100 k€' },
    { period: '5 ans', objective: p3, actions: ['Offre scalable', 'Publication'], skills: ['Leadership'], proofsToBuild: ['Communauté'], expectedResult: 'Liberté totale' },
  ]

  const wk4 = (t1: string, t2: string, t3: string, t4: string): PathData['detailedActionPlan30Days'] => [
    { week: 1, title: t1, actions: ['Action 1', 'Action 2', 'Action 3'] },
    { week: 2, title: t2, actions: ['Action 1', 'Action 2', 'Action 3'] },
    { week: 3, title: t3, actions: ['Action 1', 'Action 2', 'Action 3'] },
    { week: 4, title: t4, actions: ['Action 1', 'Action 2', 'Action 3'] },
  ]

  const paths: PathData[] = [
    {
      pathType: 'current_aligned',
      title: `Consultant indépendant${sector || ' en transformation digitale'} pour PME`,
      sector: data.sector || 'Conseil',
      revenueEstimate: '45 000 – 70 000 €/an',
      happinessScore: 74, riskLevel: 'Modéré', difficultyLevel: 'Accessible',
      fitScore: 80, securityScore: 72, freedomScore: 76, incomePotentialScore: 70, alignmentScore: 78,
      longDescription: `${firstName}, cette trajectoire s'appuie directement sur ton expérience${sector}. Tu peux repositionner tes compétences existantes dans un cadre indépendant, sans reconversion longue. Les entreprises cherchent des profils hybrides capables de comprendre à la fois les contraintes opérationnelles et les solutions disponibles.\n\nEn tant que consultant indépendant, tu choisiras tes missions, tes secteurs et progressivement tes tarifs. Le marché est large et peu saturé sur le segment PME. Le démarrage demande 3 à 6 mois pour décrocher les premières missions, mais dès la deuxième année une niche bien définie peut générer 50 à 70 k€ de chiffre d'affaires annuel.\n\nLe principal atout : tu as déjà 80 % des compétences nécessaires. Ce qui manque principalement c'est la posture commerciale et la structuration juridique — deux éléments qui s'acquièrent rapidement.`,
      keyInsight: `Tu as déjà les compétences clés. Il manque principalement la posture commerciale et la structure juridique — deux éléments qui s'acquièrent en quelques semaines.`,
      whyItFits: ["Valorise directement ton expérience existante", "Permet une transition progressive", "Forte demande sur les profils hybrides", "Liberté de rythme dès la première année"],
      dailyLife: `Appels clients le matin, ateliers sur site, rédaction de recommandations. Pas de réunion imposée, choix des projets.`,
      alreadyAcquiredStrengths: ["Compréhension des organisations", "Communication professionnelle", "Analyse de problèmes"],
      missingSkills: ["Prospection commerciale", "Structuration d'une offre", "Gestion administrative freelance"],
      likelyObstacles: ["Les 3 premiers mois sans revenu stable", "Syndrome de l'imposteur"],
      mistakesToAvoid: ["Baisser ses tarifs par peur du refus", "Accepter des missions non alignées"],
      fiveYearTimeline: tl7('Valider la niche et préparer le lancement', 'Première mission signée', 'Leader reconnu sur sa niche'),
      detailedActionPlan30Days: wk4('Comprendre le marché', 'Positionner son offre', 'Créer sa première preuve', 'Activer son réseau'),
      firstWeekActions: ['Lire 5 offres sur Malt', 'Identifier 3 personnes qui ont fait ce saut', 'Reformuler son titre LinkedIn'],
      miniProjectToLaunch: 'Réaliser un mini-audit fictif pour une PME de son entourage et le présenter en 5 slides.',
      peopleToContact: ['Consultants indépendants sur LinkedIn', 'Anciens collègues devenus freelances'],
      proofsToBuild: ['Étude de cas fictive ou réelle', 'Profil LinkedIn avec recommandations', 'Page de présentation de l\'offre'],
      recommendedTrainingTypes: ['Formation prospection commerciale B2B (2 jours)', 'Atelier pricing freelance (4h)'],
      similarJobs: ['Chef de projet digital indépendant', 'Directeur digital à temps partagé'],
      risksAndLimits: ['Revenus irréguliers les 6 premiers mois', 'Isolement si travail 100% solo'],
      firstConcreteStep: `Aujourd'hui, reformule ton titre LinkedIn en "Consultant [ta niche] pour [ton public cible]". Puis liste 10 personnes dans ton réseau susceptibles d'avoir besoin de tes services.`,
    },
    {
      pathType: 'passion_based',
      title: 'Formateur en compétences professionnelles pour adultes en transition',
      sector: 'Formation & Pédagogie',
      revenueEstimate: '35 000 – 55 000 €/an',
      happinessScore: 82, riskLevel: 'Faible à modéré', difficultyLevel: 'Progressive',
      fitScore: 74, securityScore: 66, freedomScore: 80, incomePotentialScore: 58, alignmentScore: 86,
      longDescription: `${firstName}, cette trajectoire est pour quelqu'un qui trouve son énergie dans le fait de transmettre et de voir les autres progresser. La formation professionnelle est un secteur en forte croissance grâce au CPF — des adultes en reconversion cherchent en permanence des formateurs capables d'expliquer clairement des sujets complexes.\n\nTu n'as pas besoin d'une certification de formateur pour commencer. Tu as besoin de maîtriser ton sujet, de créer un programme structuré et de trouver tes premiers apprenants. La plupart des formateurs indépendants commencent en intervenant pour des organismes existants avant de créer leur propre offre.\n\nFinancièrement, le démarrage est plus lent qu'en consulting mais un formateur avec une niche claire peut facturer entre 1 000 et 2 000 € par jour. Et une formation en ligne peut générer des revenus passifs durables à partir de 18 mois.`,
      keyInsight: `Le marché CPF explose mais se régule. Une niche précise est la clé pour décrocher une certification Qualiopi rapidement et sortir du lot.`,
      whyItFits: ["Capacité à expliquer des choses complexes simplement", "Le marché CPF finance les apprenants", "Peut commencer le week-end sans tout quitter"],
      dailyLife: `Ateliers en visio le matin, préparation de modules l'après-midi. 2 à 3 jours de formation par semaine.`,
      alreadyAcquiredStrengths: ["Expertise métier solide", "Expérience de présentation", "Patience et pédagogie"],
      missingSkills: ["Ingénierie pédagogique", "Certification Qualiopi", "Outils e-learning"],
      likelyObstacles: ["Temps de build long avant les premiers revenus", "Saturation de certaines niches CPF"],
      mistakesToAvoid: ["Créer une formation avant de valider la demande", "Viser un public trop large"],
      fiveYearTimeline: tl7('Identifier sa niche et tester l\'intérêt', 'Première formation rémunérée', 'Référence sur sa niche'),
      detailedActionPlan30Days: wk4('Comprendre le marché', 'Valider le besoin terrain', 'Créer un contenu pilote', 'Contact professionnel'),
      firstWeekActions: ['Regarder 5 formations CPF dans ton domaine', 'Lister les 3 compétences enseignables maintenant', 'Identifier 3 organismes qui pourraient t\'accueillir'],
      miniProjectToLaunch: 'Animer une session de 45 minutes gratuite sur Zoom pour 5 personnes de ton réseau.',
      peopleToContact: ['Responsables pédagogiques d\'organismes', 'Formateurs indépendants sur LinkedIn'],
      proofsToBuild: ['Programme structuré (pdf)', 'Témoignages premiers participants'],
      recommendedTrainingTypes: ['Formation de formateurs (2 jours certifiante)', 'Ingénierie pédagogique e-learning'],
      similarJobs: ['Coach professionnel certifié', 'Facilitateur ateliers', 'Responsable formation'],
      risksAndLimits: ['Revenus instables les 12 premiers mois', 'Administrative lourde pour Qualiopi'],
      firstConcreteStep: `Ouvre Mon Compte Formation et cherche les 5 premières formations dans ton domaine. Analyse ce qui manque — c'est là ton ouverture.`,
    },
    {
      pathType: 'high_potential',
      title: "Cofondateur d'une micro-startup de service pour un secteur de niche",
      sector: 'Entrepreneuriat',
      revenueEstimate: '0 – 80 000 €/an selon traction',
      happinessScore: 68, riskLevel: 'Élevé', difficultyLevel: 'Exigeante',
      fitScore: 56, securityScore: 32, freedomScore: 92, incomePotentialScore: 94, alignmentScore: 70,
      longDescription: `${firstName}, cette trajectoire est la plus ambitieuse et la plus risquée — mais aussi celle avec le plus fort potentiel de liberté totale et d'impact. Elle convient à quelqu'un qui a identifié un problème réel que les solutions existantes ne résolvent pas bien, et qui est prêt à traverser 12 à 24 mois difficiles.\n\nCréer une micro-startup ne nécessite pas d'être développeur. Des outils no-code permettent de construire un MVP en quelques semaines. La clé est d'abord de valider que le problème existe et que des gens sont prêts à payer pour le résoudre — avant d'écrire une seule ligne de code.\n\nCette trajectoire est recommandée uniquement si tu as au moins 6 mois d'épargne de sécurité et une vraie conviction sur un problème précis. Le quotidien du fondateur : interviewer des clients potentiels, tester des hypothèses, itérer vite, vendre avant même que le produit soit parfait.`,
      keyInsight: `La plupart des startups échouent non par manque de technologie, mais par manque de clients. Ton premier travail : trouver 10 personnes prêtes à payer.`,
      whyItFits: ["Connaissance du terrain pour identifier des problèmes réels", "Outils no-code accessibles", "Marché de niche peu concurrentiel"],
      dailyLife: `Les 3 premiers mois : conversations et interviews. Après 6 mois : construction du MVP et onboarding. Après 18 mois : gestion de la croissance.`,
      alreadyAcquiredStrengths: ["Connaissance secteur profonde", "Réseau existant", "Compréhension des douleurs métier"],
      missingSkills: ["Développement no-code ou technique", "Growth marketing", "Sales early-stage"],
      likelyObstacles: ["Validation insuffisante du problème", "Épuisement lors de la phase sans revenus"],
      mistakesToAvoid: ["Construire un produit avant d'avoir 10 clients engagés", "Lever des fonds trop tôt"],
      fiveYearTimeline: tl7('Valider l\'existence du problème', 'MVP et 5 bêta-testeurs payants', 'Exit, scale ou lifestyle business'),
      detailedActionPlan30Days: wk4('Définir l\'hypothèse', 'Valider sur le terrain', 'Analyser la concurrence', 'Concevoir la solution minimale'),
      firstWeekActions: ['Identifier UN problème précis dans ton secteur', 'Contacter 5 personnes qui vivent ce problème', 'Lire un résumé de The Mom Test'],
      miniProjectToLaunch: 'Landing page en 48h sur Carrd.co avec formulaire d\'inscription bêta. Partager à 20 personnes et mesurer les inscriptions.',
      peopleToContact: ['Fondateurs de micro-SaaS sur IndieHackers', 'Développeurs no-code', 'Entrepreneurs dans ton secteur cible'],
      proofsToBuild: ['Landing page avec liste d\'attente', 'Documentation 20 premières interviews', 'Premiers clients bêta payants'],
      recommendedTrainingTypes: ['No-code : Bubble ou Glide Academy (gratuit)', 'YCombinator Startup School (gratuit en ligne)'],
      similarJobs: ['Product manager indépendant', 'Entrepreneur en résidence', 'Business developer tech'],
      risksAndLimits: ['Revenus nuls pendant 12 à 24 mois', 'Probabilité d\'échec ~70%', 'Besoin d\'épargne personnelle'],
      firstConcreteStep: `Dans les 48 prochaines heures, identifie UN problème précis dans ton secteur que les outils existants ne résolvent pas bien. Écris-le en une seule phrase. Partage-la à 3 personnes concernées.`,
    },
  ]

  const comparison: ReportComparison = {
    safestPath: paths[0].title,
    mostPassionAlignedPath: paths[1].title,
    highestPotentialPath: paths[2].title,
    recommendedFirstChoice: paths[0].title,
    reason: `La trajectoire consultant indépendant valorise le mieux les compétences existantes avec le moins de formation préalable. Elle peut s'enclencher dans les 30 prochains jours.`,
  }

  const mockReport = buildMockReport(
    reportId, firstName, email, paths,
    `${firstName}, ton profil révèle une personne en quête de sens, d'autonomie et d'impact réel. Les trois trajectoires ci-dessous partent de là où tu en es.`,
    comparison,
    `Ouvre LinkedIn et reformule ton titre en mode "Consultant [ton domaine] pour [ta cible]". Puis envoie un message à 5 personnes de ton réseau pour comprendre les besoins du marché.`
  )
  try { sessionStorage.setItem(MOCK_KEY(reportId), JSON.stringify(mockReport)) } catch {}

  return { reportId, status: 'ready', isMock: true }
}
