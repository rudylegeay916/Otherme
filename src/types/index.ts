export interface OnboardingData {
  firstName: string
  email: string
  age: number
  city: string
  currentJob: string
  sector: string
  yearsExperience: number
  educationLevel: string
  educationField: string
  dreamJob: string
  values: string[]
  strengths: string[]
  languages: string[]
  cvText?: string
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
