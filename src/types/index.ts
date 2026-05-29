export interface QuestionAnswer {
  selectedOptions: string[]
  freeText: string
}

export interface OnboardingData {
  firstName: string
  email: string
  age: number
  currentSituation: string
  gender?: string
  city?: string
  cvText?: string
  currentJob?: string
  sector?: string
  yearsExperience?: number
  educationLevel?: string
  educationField?: string
  languages?: string[]
  answers?: Record<string, QuestionAnswer>
}

// ── Legacy (backward compat) ──────────────────────────────────────

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

// ── New rich format ───────────────────────────────────────────────

export interface RichTimelineStep {
  period: string
  objective: string
  actions: string[]
  skills: string[]
  proofsToBuild: string[]
  expectedResult: string
}

export interface ActionPlanWeek {
  week: number
  title: string
  actions: string[]
  objective?: string
  deliverable?: string
  practicalTip?: string
  mistakeToAvoid?: string
}

export interface PathData {
  pathType: 'current_aligned' | 'passion_based' | 'high_potential'
  title: string
  sector: string
  revenueEstimate: string
  happinessScore: number
  riskLevel: string
  difficultyLevel: string
  fitScore: number
  securityScore: number
  freedomScore: number
  incomePotentialScore: number
  alignmentScore: number
  personalCompatibilityScore: number
  feasibilityScore: number
  marketOpportunityScore: number
  transitionEffortScore: number
  longDescription: string
  keyInsight: string
  whyItFits: string[]
  dailyLife: string
  alreadyAcquiredStrengths: string[]
  missingSkills: string[]
  likelyObstacles: string[]
  mistakesToAvoid: string[]
  fiveYearTimeline: RichTimelineStep[]
  detailedActionPlan30Days: ActionPlanWeek[]
  firstWeekActions: string[]
  miniProjectToLaunch: string
  peopleToContact: string[]
  proofsToBuild: string[]
  recommendedTrainingTypes: string[]
  similarJobs: string[]
  risksAndLimits: string[]
  firstConcreteStep: string
  // ── Positionnement professionnel (nouveaux champs) ────────────────
  positioningStatement?: string
  linkedinHeadline?: string
  interviewPitch?: string
  cvKeywords?: string[]
  comparisonWithOtherPaths?: string
  // ── Ciblage & questionnement ──────────────────────────────────────
  companyTypesToTarget?: string[]
  questionsToAskProfessionals?: string[]
  choosePath?: string[]
  avoidPath?: string[]
  howToReachRole?: HowToReachRole
}

export interface HowToReachRole {
  startingPoint: string[]
  gapToFill: string[]
  recommendedPath: string[]
  priorityActions: string[]
  mistakesToAvoid: string[]
}

export interface CvInfluence {
  detectedElements:       string[]
  transferableSkills:     string[]
  relevantExperiences:    string[]
  cvLimits:               string[]
  improvementSuggestions: string[]
}

export interface ReportComparison {
  safestPath: string
  mostPassionAlignedPath: string
  highestPotentialPath: string
  recommendedFirstChoice: string
  reason: string
}

export interface Report {
  id: string
  email: string
  firstName: string
  status: 'generating' | 'ready' | 'paid' | 'complete'
  paths?: PathData[]
  reportSummary?: string
  comparison?: ReportComparison
  bestFirstStep48h?: string
  cvInfluence?: CvInfluence
  trajectories?: Trajectory[]
  createdAt: string
}

export interface OnboardingResponse {
  reportId: string
  status: string
  isMock?: boolean
  mockPaths?: PathData[]
  mockReportSummary?: string
  mockComparison?: ReportComparison
  mockBestFirstStep?: string
  mockTrajectories?: Trajectory[]
  firstName?: string
  email?: string
}
