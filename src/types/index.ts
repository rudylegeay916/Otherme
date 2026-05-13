export interface QuestionAnswer {
  selectedOptions: string[]
  freeText: string
}

export interface OnboardingData {
  // ── Étape 1 — Identité (champs requis) ───────────────────────────
  firstName: string
  email: string
  age: number
  currentSituation: string

  // ── Étape 1 — Identité (optionnels) ──────────────────────────────
  gender?: string
  city?: string

  // ── Étape 2 — CV (optionnel) ─────────────────────────────────────
  cvText?: string

  // ── Étape 3 — Parcours ───────────────────────────────────────────
  currentJob?: string
  sector?: string
  yearsExperience?: number
  educationLevel?: string
  educationField?: string
  languages?: string[]

  // ── Questions (Q1–Q20 + adaptatives) — toutes optionnelles ───────
  answers?: Record<string, QuestionAnswer>
}

export interface TimelineStep {
  year: string
  event: string
}

export interface Trajectory {
  id: number
  title: string
  tagline: string
  description: string[]
  timeline: TimelineStep[]
  skillsToDevlop: string[]
  feasibilityScore: number
  feasibilityNote: string
}

export interface Report {
  id: string
  email: string
  firstName: string
  status: 'generating' | 'ready' | 'paid' | 'complete'
  trajectories: Trajectory[]
  createdAt: string
}

export interface OnboardingResponse {
  reportId: string
  status: string
}
