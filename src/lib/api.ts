import type { OnboardingData, OnboardingResponse, Report } from '../types'

const BASE = '/api'

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
    throw new Error(
      'Impossible de joindre le serveur. Vérifie ta connexion et réessaie dans quelques instants.'
    )
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    console.error('[api] Erreur HTTP /api/onboarding:', res.status, err)
    throw new Error(err.message || `Erreur ${res.status} lors de la génération du rapport`)
  }

  return res.json() as Promise<OnboardingResponse>
}

// ── fetchReport ───────────────────────────────────────────────────

export async function fetchReport(reportId: string): Promise<Report> {
  const res = await fetch(`${BASE}/report/${reportId}`, { credentials: 'include' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; requiresToken?: boolean }
    if (res.status === 403 || err.requiresToken) {
      throw new Error('ACCESS_DENIED')
    }
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

// ── requestAdminBypass ────────────────────────────────────────────

export async function requestAdminBypass(
  reportId: string,
  authToken: string
): Promise<{ authorized: boolean }> {
  const res = await fetch(`${BASE}/admin/bypass`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    credentials: 'include',
    body: JSON.stringify({ reportId }),
  })
  if (!res.ok) return { authorized: false }
  return res.json() as Promise<{ authorized: boolean }>
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
      credentials: 'include',
      body: JSON.stringify({ session_id: sessionId, reportId }),
    })
    const data = await res.json() as { verified: boolean; error?: string }
    return data
  } catch {
    return { verified: false, error: 'Impossible de vérifier le paiement. Vérifie ta connexion.' }
  }
}
