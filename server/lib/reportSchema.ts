import { z } from 'zod'

// ── Sous-schémas ──────────────────────────────────────────────────

const score = z.number().int().min(0).max(100, {
  message: 'Le score doit être un entier entre 0 et 100',
})

const RichTimelineStepSchema = z.object({
  period:         z.string().min(1),
  objective:      z.string().min(1),
  actions:        z.array(z.string()).min(1),
  skills:         z.array(z.string()),
  proofsToBuild:  z.array(z.string()),
  expectedResult: z.string().min(1),
}).passthrough()

const ActionPlanWeekSchema = z.object({
  week:    z.number().int().min(1).max(4),
  title:   z.string().min(1),
  actions: z.array(z.string()).min(1),
}).passthrough()

// ── PathData ──────────────────────────────────────────────────────

const PathDataSchema = z.object({
  pathType:                    z.enum(['current_aligned', 'passion_based', 'high_potential']),
  title:                       z.string().min(1, 'Le titre de la trajectoire ne peut pas être vide'),
  sector:                      z.string().min(1),
  revenueEstimate:             z.string().min(1),
  fitScore:                    score,
  alignmentScore:              score,
  personalCompatibilityScore:  score,
  feasibilityScore:            score,
  marketOpportunityScore:      score,
  transitionEffortScore:       score,
  riskLevel:                   z.string().min(1),
  risksAndLimits:              z.array(z.string()).min(1),
  alreadyAcquiredStrengths:    z.array(z.string()).min(1),
  missingSkills:               z.array(z.string()).min(1),
  detailedActionPlan30Days:    z.array(ActionPlanWeekSchema).length(4, {
    message: 'detailedActionPlan30Days doit contenir exactement 4 semaines',
  }),
  firstWeekActions:   z.array(z.string()).min(1),
  fiveYearTimeline:   z.array(RichTimelineStepSchema).length(7, {
    message: 'fiveYearTimeline doit contenir exactement 7 périodes',
  }),
  whyItFits:          z.array(z.string()).min(1),
  firstConcreteStep:  z.string().min(1),
}).passthrough() // conserve les champs extra (longDescription, dailyLife, etc.)

// ── GeneratedReport ───────────────────────────────────────────────

const ComparisonSchema = z.object({
  safestPath:              z.string().min(1),
  mostPassionAlignedPath:  z.string().min(1),
  highestPotentialPath:    z.string().min(1),
  recommendedFirstChoice:  z.string().min(1),
  reason:                  z.string().min(1),
}).passthrough()

const GeneratedReportSchema = z.object({
  reportSummary:    z.string().min(1),
  bestFirstStep48h: z.string().min(1),
  comparison:       ComparisonSchema,
  paths:            z.array(PathDataSchema).length(3, {
    message: 'Le rapport doit contenir exactement 3 trajectoires',
  }),
}).passthrough()

// ── Validation cross-champs ───────────────────────────────────────

export type ValidationResult<T> =
  | { success: true;  data: T }
  | { success: false; error: string; details?: string }

export function validateGeneratedReport(
  raw: unknown
): ValidationResult<z.infer<typeof GeneratedReportSchema>> {
  const result = GeneratedReportSchema.safeParse(raw)

  if (!result.success) {
    const first = result.error.issues[0]
    const field = first?.path.join('.') ?? 'inconnu'
    const msg   = first?.message ?? 'Erreur de validation'
    return {
      success: false,
      error:   `Champ invalide : ${field} — ${msg}`,
      details: result.error.message,
    }
  }

  // Vérification cross-champs : 3 pathTypes distincts et obligatoires
  const pathTypes = result.data.paths.map(p => p.pathType)
  const distinct  = new Set(pathTypes)
  const required  = ['current_aligned', 'passion_based', 'high_potential'] as const

  if (distinct.size !== 3 || required.some(t => !distinct.has(t))) {
    return {
      success: false,
      error:   `Les 3 pathTypes doivent être distincts et inclure current_aligned, passion_based, high_potential. Reçu : [${pathTypes.join(', ')}]`,
    }
  }

  return { success: true, data: result.data }
}
