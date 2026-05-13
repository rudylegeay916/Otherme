import type { OnboardingData } from '../types'

const KEYS = {
  hasStarted:   'otherme_has_started_test',
  currentStep:  'otherme_current_step',
  data:         'otherme_onboarding_data',
  cvMeta:       'otherme_cv_metadata',
  checkpoint:   'otherme_showing_checkpoint',
  lastUpdated:  'otherme_last_updated_at',
} as const

export interface CvMeta { name: string; size: number }

export interface SavedProgress {
  currentStep:       number
  data:              OnboardingData
  cvMeta:            CvMeta | null
  showingCheckpoint: number | null
  lastUpdated:       string
}

export function saveProgress(
  step:              number,
  data:              OnboardingData,
  cvFile:            File | null,
  showingCheckpoint: number | null,
): void {
  try {
    localStorage.setItem(KEYS.hasStarted,  'true')
    localStorage.setItem(KEYS.currentStep, String(step))
    localStorage.setItem(KEYS.data,        JSON.stringify(data))
    localStorage.setItem(KEYS.cvMeta,      cvFile ? JSON.stringify({ name: cvFile.name, size: cvFile.size }) : '')
    localStorage.setItem(KEYS.checkpoint,  showingCheckpoint !== null ? String(showingCheckpoint) : '')
    localStorage.setItem(KEYS.lastUpdated, new Date().toISOString())
  } catch {
    // localStorage peut être indisponible (mode privé strict, etc.)
  }
}

export function loadProgress(): SavedProgress | null {
  try {
    if (localStorage.getItem(KEYS.hasStarted) !== 'true') return null

    const rawData = localStorage.getItem(KEYS.data)
    if (!rawData) return null
    const data = JSON.parse(rawData) as OnboardingData

    const currentStep = parseInt(localStorage.getItem(KEYS.currentStep) ?? '0', 10) || 0

    const rawCvMeta    = localStorage.getItem(KEYS.cvMeta)
    const cvMeta       = rawCvMeta ? (JSON.parse(rawCvMeta) as CvMeta) : null

    const rawCheckpoint    = localStorage.getItem(KEYS.checkpoint)
    const showingCheckpoint = rawCheckpoint ? parseInt(rawCheckpoint, 10) : null

    const lastUpdated  = localStorage.getItem(KEYS.lastUpdated) ?? ''

    return { currentStep, data, cvMeta, showingCheckpoint, lastUpdated }
  } catch {
    return null
  }
}

export function clearProgress(): void {
  try {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  } catch {
    // silencieux
  }
}

export function hasStartedTest(): boolean {
  try {
    return localStorage.getItem(KEYS.hasStarted) === 'true'
  } catch {
    return false
  }
}
