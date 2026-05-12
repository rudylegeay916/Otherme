import type { OnboardingData, OnboardingResponse, Report } from '../types'

const BASE = '/api'

export async function submitOnboarding(
  data: OnboardingData,
  cvFile?: File | null
): Promise<OnboardingResponse> {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value))
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  if (cvFile) {
    formData.append('cv', cvFile)
  }

  const res = await fetch(`${BASE}/onboarding`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Erreur lors de la génération du rapport')
  }

  return res.json()
}

export async function fetchReport(reportId: string): Promise<Report> {
  const res = await fetch(`${BASE}/report/${reportId}`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Rapport introuvable')
  }

  return res.json()
}

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
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Erreur lors de la création du paiement')
  }

  return res.json()
}
