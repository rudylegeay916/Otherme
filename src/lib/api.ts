import type { OnboardingData, OnboardingResponse, Report, Trajectory } from '../types'

const BASE = '/api'

// ── Clé sessionStorage pour les rapports mock ─────────────────────
const MOCK_KEY = (id: string) => `otherme_mock_report_${id}`

function buildMockReport(
  reportId: string,
  firstName: string,
  email: string,
  trajectories: Trajectory[]
): Report {
  return {
    id:          reportId,
    firstName,
    email,
    status:      'ready',
    trajectories,
    createdAt:   new Date().toISOString(),
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
    if (key === 'answers') {
      formData.append('answers', JSON.stringify(value ?? {}))
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value))
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  if (cvFile) formData.append('cv', cvFile)

  const headers: HeadersInit = {}
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  let res: Response
  try {
    res = await fetch(`${BASE}/onboarding`, { method: 'POST', headers, body: formData })
  } catch (networkErr) {
    console.error('[api] Erreur réseau /api/onboarding:', networkErr)
    // Fallback réseau : générer un mock local
    return generateLocalFallback(data)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    console.error('[api] Erreur HTTP /api/onboarding:', res.status, err)
    throw new Error(err.message || `Erreur ${res.status} lors de la génération du rapport`)
  }

  const result = await res.json() as OnboardingResponse

  // Si le backend ne peut pas sauvegarder en base, il renvoie les trajectoires directement
  if (result.isMock && result.mockTrajectories) {
    const mockReport = buildMockReport(
      result.reportId,
      result.firstName ?? data.firstName,
      result.email    ?? data.email,
      result.mockTrajectories
    )
    try {
      sessionStorage.setItem(MOCK_KEY(result.reportId), JSON.stringify(mockReport))
    } catch { /* sessionStorage peut être indisponible (private browsing strict) */ }
  }

  return result
}

// ── fetchReport ───────────────────────────────────────────────────

export async function fetchReport(reportId: string): Promise<Report> {
  // 1. Essayer depuis le sessionStorage (rapports mock)
  try {
    const cached = sessionStorage.getItem(MOCK_KEY(reportId))
    if (cached) {
      const parsed = JSON.parse(cached) as Report
      if (parsed?.id && parsed?.trajectories) return parsed
    }
  } catch { /* sessionStorage indisponible */ }

  // 2. Essayer depuis l'API
  const res = await fetch(`${BASE}/report/${reportId}`)

  if (!res.ok) {
    // Dernière chance : le mock était peut-être en sessionStorage et a expiré
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
  const res = await fetch(`${BASE}/stripe/create-checkout`, {
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

// ── Fallback local (aucune connectivité) ──────────────────────────

function generateLocalFallback(data: OnboardingData): OnboardingResponse {
  const reportId = `mock_local_${Date.now()}`
  const firstName = data.firstName || 'vous'
  const email     = data.email || ''

  const trajectories: Trajectory[] = [
    {
      id: 1,
      title: `Consultant Indépendant pour ${firstName}`,
      tagline: "Mettre ton expertise au service d'entreprises qui en ont besoin",
      description: [
        `Fort de ton expérience, ${firstName}, tu peux pivoter vers le conseil en freelance.`,
        'Les entreprises cherchent des profils hybrides qui comprennent à la fois la technique et le business.',
        'En 18 mois, une clientèle solide et 60-80 k€/an d\'honoraires sont atteignables.',
      ],
      timeline: [
        { year: '0-6 mois',  event: 'Définir ta niche et ton offre de consulting' },
        { year: '6-12 mois', event: 'Premiers clients via réseau et LinkedIn' },
        { year: '1-2 ans',   event: 'Missions longue durée, 3-5 clients réguliers' },
        { year: '2-3 ans',   event: 'Spécialisation, hausse des tarifs journaliers' },
        { year: '3-5 ans',   event: 'Cabinet solo ou associé, revenus stabilisés' },
      ],
      skillsToDevlop: ['Prospection', 'Gestion de projet', 'Communication', 'Facturation'],
      feasibilityScore: 78,
      feasibilityNote: 'Trajectoire très réaliste avec 3+ ans d\'expérience.',
    },
    {
      id: 2,
      title: 'Formateur & Créateur de Contenu',
      tagline: 'Partager ton savoir et en vivre confortablement',
      description: [
        'Transformer tes connaissances en formations est accessible avec ton expérience.',
        'La création de contenu B2B sur LinkedIn ouvre des portes vers des partenariats.',
        'Le modèle hybride (contenus + formation + conseil) est le plus robuste.',
      ],
      timeline: [
        { year: '0-3 mois',  event: 'Choisir ton format : LinkedIn, YouTube, newsletter' },
        { year: '3-6 mois',  event: 'Publier régulièrement, construire une audience' },
        { year: '6-12 mois', event: 'Première formation payante' },
        { year: '1-2 ans',   event: 'Programme récurrent, communauté' },
        { year: '2-3 ans',   event: 'Business de contenus + speaking' },
      ],
      skillsToDevlop: ['Storytelling', 'Marketing digital', 'Production vidéo', 'SEO'],
      feasibilityScore: 62,
      feasibilityNote: 'Demande de la régularité et 6-12 mois avant les premiers revenus.',
    },
    {
      id: 3,
      title: 'Entrepreneur & Fondateur de Startup',
      tagline: 'Construire quelque chose qui t\'appartient vraiment',
      description: [
        `${firstName}, ton profil pointe vers l'envie de créer, pas seulement d'exécuter.`,
        'Lancer une micro-startup SaaS ou un service B2B peut se faire avec peu de capital.',
        'Le risque est réel, mais c\'est la trajectoire la plus alignée avec la liberté et l\'impact.',
      ],
      timeline: [
        { year: '0-3 mois',  event: '20 interviews clients, valider le problème' },
        { year: '3-6 mois',  event: 'MVP, premiers utilisateurs gratuits' },
        { year: '6-12 mois', event: 'Premières ventes, product-market fit' },
        { year: '1-2 ans',   event: 'Croissance organique, premiers partenaires' },
        { year: '2-3 ans',   event: 'Rentabilité ou levée de fonds' },
      ],
      skillsToDevlop: ['Développement produit', 'Sales B2B', 'Growth', 'Finance'],
      feasibilityScore: 45,
      feasibilityNote: 'Nécessite épargne de sécurité et tolérance à l\'incertitude.',
    },
  ]

  const mockReport = buildMockReport(reportId, firstName, email, trajectories)
  try {
    sessionStorage.setItem(MOCK_KEY(reportId), JSON.stringify(mockReport))
  } catch { /* sessionStorage indisponible */ }

  return { reportId, status: 'ready', isMock: true }
}
