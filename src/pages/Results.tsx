import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { fetchReport } from '../lib/api'
import type { PathData, Report, RichTimelineStep, ActionPlanWeek, CvInfluence } from '../types'
import Logo from '../components/Logo'

// ── Score bar ─────────────────────────────────────────────────────

function ScoreBar({ label, score, color = 'bg-brand-500' }: { label: string; score: number; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-200 font-semibold">{score}/100</span>
      </div>
      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

// ── CV Influence section ─────────────────────────────────────────

function CvInfluenceSection({ cv }: { cv: CvInfluence }) {
  return (
    <section className="card p-6 border-dark-700">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">📄</span>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Analyse de ton CV</h2>
          <p className="text-xs text-slate-500">Éléments pris en compte pour personnaliser tes trajectoires</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {cv.detectedElements?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Éléments détectés</h3>
            <ul className="space-y-1.5">
              {cv.detectedElements.map((el, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-brand-400 mt-0.5 flex-shrink-0">✓</span>
                  <span>{el}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {cv.transferableSkills?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Compétences transférables</h3>
            <ul className="space-y-1.5">
              {cv.transferableSkills.map((sk, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-purple-400 mt-0.5 flex-shrink-0">→</span>
                  <span>{sk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {cv.relevantExperiences?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Expériences valorisées</h3>
            <ul className="space-y-1.5">
              {cv.relevantExperiences.map((ex, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">★</span>
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {(cv.cvLimits?.length > 0 || cv.improvementSuggestions?.length > 0) && (
          <div>
            {cv.cvLimits?.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Limites identifiées</h3>
                <ul className="space-y-1.5 mb-3">
                  {cv.cvLimits.map((lim, i) => (
                    <li key={i} className="text-sm text-slate-400 flex gap-2">
                      <span className="text-slate-500 mt-0.5 flex-shrink-0">·</span>
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {cv.improvementSuggestions?.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Améliorer ton CV</h3>
                <ul className="space-y-1.5">
                  {cv.improvementSuggestions.map((sg, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">↑</span>
                      <span>{sg}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

// ── Collapsible section ───────────────────────────────────────────

function Accordion({ title, icon, children, defaultOpen = false }: {
  title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-dark-700 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 bg-dark-800/50 hover:bg-dark-800 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
          <span>{icon}</span> {title}
        </span>
        <span className={`text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && <div className="px-5 py-4 border-t border-dark-700">{children}</div>}
    </div>
  )
}

// ── Timeline ──────────────────────────────────────────────────────

function TimelineSection({ timeline }: { timeline: RichTimelineStep[] }) {
  return (
    <div className="space-y-4">
      {timeline.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/50 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-400 text-[10px] font-bold">{i + 1}</span>
            </div>
            {i < timeline.length - 1 && <div className="w-px flex-1 bg-dark-700 mt-1 min-h-[16px]" />}
          </div>
          <div className="pb-4 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-brand-400 bg-brand-900/30 px-2.5 py-0.5 rounded-full border border-brand-800/50">
                {step.period}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-200 mb-2">{step.objective}</p>
            <ul className="space-y-1 mb-2">
              {step.actions.map((a, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-brand-500 mt-0.5 flex-shrink-0">→</span> {a}
                </li>
              ))}
            </ul>
            {step.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {step.skills.map((s, k) => (
                  <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/30 border border-purple-800/40 text-purple-300">{s}</span>
                ))}
              </div>
            )}
            {step.proofsToBuild?.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] font-semibold text-slate-500 mb-1">Preuves à construire :</p>
                <ul className="space-y-0.5">
                  {step.proofsToBuild.map((proof, k) => (
                    <li key={k} className="text-[10px] text-slate-500 flex items-start gap-1.5">
                      <span className="text-blue-500 flex-shrink-0">▸</span> {proof}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-green-400 mt-2 bg-green-900/20 border border-green-800/30 rounded px-2 py-1">
              ✓ {step.expectedResult}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 30-day plan ───────────────────────────────────────────────────

function ActionPlan({ weeks }: { weeks: ActionPlanWeek[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {weeks.map((week) => (
        <div key={week.week} className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-xs font-bold text-brand-400 mb-1">Semaine {week.week} — {week.title}</p>
          {week.objective && (
            <p className="text-xs text-slate-400 italic mb-2">{week.objective}</p>
          )}
          <ul className="space-y-1.5 mb-3">
            {week.actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-brand-500 flex-shrink-0 mt-0.5">•</span> {a}
              </li>
            ))}
          </ul>
          {week.deliverable && (
            <div className="text-xs bg-green-900/20 border border-green-800/30 rounded px-2 py-1.5 mb-1.5">
              <span className="font-semibold text-green-400">Livrable : </span>
              <span className="text-slate-300">{week.deliverable}</span>
            </div>
          )}
          {week.practicalTip && (
            <div className="text-xs bg-blue-900/20 border border-blue-800/30 rounded px-2 py-1.5 mb-1.5">
              <span className="font-semibold text-blue-400">Conseil : </span>
              <span className="text-slate-300">{week.practicalTip}</span>
            </div>
          )}
          {week.mistakeToAvoid && (
            <div className="text-xs bg-red-900/10 border border-red-800/20 rounded px-2 py-1.5">
              <span className="font-semibold text-red-400">Erreur à éviter : </span>
              <span className="text-slate-300">{week.mistakeToAvoid}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Path type labels ──────────────────────────────────────────────

const PATH_META: Record<string, { label: string; gradient: string; border: string; icon: string }> = {
  current_aligned: { label: 'Proche de ton parcours', gradient: 'from-blue-600 to-purple-500', border: 'border-blue-700/30', icon: '🛤️' },
  passion_based:   { label: 'Basée sur tes passions',  gradient: 'from-purple-600 to-pink-500',  border: 'border-purple-700/30', icon: '❤️' },
  high_potential:  { label: 'Fort potentiel',           gradient: 'from-amber-500 to-orange-500', border: 'border-amber-700/30',  icon: '🚀' },
}

// ── Full path card ────────────────────────────────────────────────

function PathCard({ path, index }: { path: PathData; index: number }) {
  const meta = PATH_META[path.pathType] ?? PATH_META.current_aligned

  return (
    <div className={`card relative overflow-hidden border ${meta.border}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.gradient}`} />

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-start gap-3 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{meta.icon}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{meta.label}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-1">{path.title}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="bg-dark-700 px-2.5 py-1 rounded-full">{path.sector}</span>
              <span className="bg-dark-700 px-2.5 py-1 rounded-full">💰 {path.revenueEstimate}</span>
              <span className={`px-2.5 py-1 rounded-full ${
                path.riskLevel.includes('Élevé') ? 'bg-red-900/30 text-red-300' :
                path.riskLevel.includes('Faible') ? 'bg-green-900/30 text-green-300' :
                'bg-amber-900/30 text-amber-300'
              }`}>⚡ {path.riskLevel}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-3xl font-black ${
              path.fitScore >= 75 ? 'text-green-400' : path.fitScore >= 55 ? 'text-amber-400' : 'text-red-400'
            }`}>{path.fitScore}%</div>
            <div className="text-xs text-slate-500">adéquation</div>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 bg-dark-800/50 rounded-xl border border-dark-700 mb-6">
          <ScoreBar label="Sécurité" score={path.securityScore} color="bg-blue-500" />
          <ScoreBar label="Liberté" score={path.freedomScore} color="bg-purple-500" />
          <ScoreBar label="Revenu potentiel" score={path.incomePotentialScore} color="bg-green-500" />
          <ScoreBar label="Alignement perso." score={path.alignmentScore} color="bg-amber-500" />
        </div>

        {/* Key insight */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-blue-300 mb-1">💡 Insight clé</p>
          <p className="text-sm text-slate-300 leading-relaxed">{path.keyInsight}</p>
        </div>

        {/* Description */}
        <Accordion title="Description complète" icon="📄">
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{path.longDescription}</p>
          {path.dailyLife && (
            <div className="mt-4 bg-dark-800/60 border border-dark-600 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 mb-1.5">🗓️ Quotidien réaliste</p>
              <p className="text-sm text-slate-300 leading-relaxed">{path.dailyLife}</p>
            </div>
          )}
        </Accordion>

        {/* Why it fits */}
        <div className="mt-3">
          <Accordion title="Pourquoi cette trajectoire te correspond" icon="🎯">
            <ul className="space-y-2">
              {path.whyItFits.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span> {w}
                </li>
              ))}
            </ul>
          </Accordion>
        </div>

        {/* How to reach this role */}
        {path.howToReachRole && (
          <div className="mt-3">
            <Accordion title="Comment atteindre ce métier concrètement" icon="🗺️">
              <div className="space-y-5">
                {/* Starting point */}
                {path.howToReachRole.startingPoint.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-green-400 mb-2">✅ Point de départ — ce que tu as déjà</p>
                    <ul className="space-y-1.5">
                      {path.howToReachRole.startingPoint.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-green-900/10 border border-green-800/20 rounded-lg px-3 py-2">
                          <span className="text-green-500 flex-shrink-0 mt-0.5">+</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Gap to fill */}
                {path.howToReachRole.gapToFill.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-amber-400 mb-2">⚡ Écart à combler</p>
                    <ul className="space-y-1.5">
                      {path.howToReachRole.gapToFill.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-amber-900/10 border border-amber-800/20 rounded-lg px-3 py-2">
                          <span className="text-amber-400 flex-shrink-0 mt-0.5">→</span> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Recommended path */}
                {path.howToReachRole.recommendedPath.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-400 mb-2">🛤️ Chemin recommandé</p>
                    <ol className="space-y-1.5">
                      {path.howToReachRole.recommendedPath.map((r, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-blue-900/40 border border-blue-800/50 text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          {r}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {/* Priority actions */}
                {path.howToReachRole.priorityActions.length > 0 && (
                  <div className="bg-brand-900/20 border border-brand-800/40 rounded-xl p-4">
                    <p className="text-xs font-semibold text-brand-300 mb-3">🎯 5 actions prioritaires</p>
                    <ul className="space-y-2">
                      {path.howToReachRole.priorityActions.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-200">
                          <span className="text-brand-400 font-bold flex-shrink-0">{i + 1}.</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Mistakes to avoid */}
                {path.howToReachRole.mistakesToAvoid.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-2">🚫 Erreurs à éviter</p>
                    <ul className="space-y-1.5">
                      {path.howToReachRole.mistakesToAvoid.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-red-900/10 border border-red-800/20 rounded-lg px-3 py-2">
                          <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Accordion>
          </div>
        )}

        {/* Skills */}
        <div className="mt-3">
          <Accordion title="Compétences : acquises vs à développer" icon="🧠">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-green-400 mb-2">✅ Déjà acquises</p>
                <ul className="space-y-1">
                  {path.alreadyAcquiredStrengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-green-500 flex-shrink-0">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-400 mb-2">📈 À développer</p>
                <ul className="space-y-1">
                  {path.missingSkills.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-amber-500 flex-shrink-0">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Accordion>
        </div>

        {/* Training */}
        {(path.recommendedTrainingTypes?.length ?? 0) > 0 && (
          <div className="mt-3">
            <Accordion title="Formations recommandées" icon="🎓">
              <ul className="space-y-1.5">
                {(path.recommendedTrainingTypes ?? []).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-blue-400 flex-shrink-0 mt-0.5">•</span> {r}
                  </li>
                ))}
              </ul>
            </Accordion>
          </div>
        )}

        {/* 5-year timeline */}
        <div className="mt-3">
          <Accordion title="Timeline sur 5 ans" icon="📅">
            {path.fiveYearTimeline?.length > 0
              ? <TimelineSection timeline={path.fiveYearTimeline} />
              : <p className="text-sm text-slate-500">Timeline non disponible</p>
            }
          </Accordion>
        </div>

        {/* 30-day action plan */}
        <div className="mt-3">
          <Accordion title="Plan d'action 30 jours" icon="📋">
            {path.detailedActionPlan30Days?.length > 0
              ? <ActionPlan weeks={path.detailedActionPlan30Days} />
              : <p className="text-sm text-slate-500">Plan non disponible</p>
            }
          </Accordion>
        </div>

        {/* First week actions */}
        <div className="mt-3">
          <Accordion title="Cette semaine — actions concrètes" icon="⚡">
            <ul className="space-y-2">
              {path.firstWeekActions.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300 bg-dark-800/50 border border-dark-700 rounded-lg px-3 py-2">
                  <span className="text-brand-400 font-bold flex-shrink-0">{i + 1}.</span> {a}
                </li>
              ))}
            </ul>
            {path.miniProjectToLaunch && (
              <div className="mt-4 bg-green-900/20 border border-green-700/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-green-400 mb-1">🎯 Mini-projet à lancer</p>
                <p className="text-sm text-slate-300">{path.miniProjectToLaunch}</p>
              </div>
            )}
          </Accordion>
        </div>

        {/* People & proofs */}
        {((path.peopleToContact?.length ?? 0) > 0 || (path.proofsToBuild?.length ?? 0) > 0) && (
          <div className="mt-3">
            <Accordion title="Personnes à contacter & preuves à construire" icon="🤝">
              <div className="grid sm:grid-cols-2 gap-4">
                {(path.peopleToContact?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-purple-400 mb-2">👥 Personnes à contacter</p>
                    <ul className="space-y-1">
                      {(path.peopleToContact ?? []).map((p, i) => (
                        <li key={i} className="text-xs text-slate-400">• {p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(path.proofsToBuild?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-400 mb-2">📁 Preuves à construire</p>
                    <ul className="space-y-1">
                      {(path.proofsToBuild ?? []).map((p, i) => (
                        <li key={i} className="text-xs text-slate-400">• {p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Accordion>
          </div>
        )}

        {/* Risks */}
        {path.risksAndLimits.length > 0 && (
          <div className="mt-3">
            <Accordion title="Risques et limites à connaître" icon="⚠️">
              <div className="space-y-2">
                {path.risksAndLimits.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-red-900/10 border border-red-800/20 rounded-lg px-3 py-2">
                    <span className="text-red-400 flex-shrink-0">!</span> {r}
                  </div>
                ))}
              </div>
              {(path.mistakesToAvoid?.length ?? 0) > 0 && (
                <div className="mt-3 border-t border-dark-700 pt-3">
                  <p className="text-xs font-semibold text-orange-400 mb-2">🚫 Erreurs à éviter</p>
                  <ul className="space-y-1">
                    {(path.mistakesToAvoid ?? []).map((m, i) => (
                      <li key={i} className="text-xs text-slate-400">• {m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(path.likelyObstacles?.length ?? 0) > 0 && (
                <div className="mt-3 border-t border-dark-700 pt-3">
                  <p className="text-xs font-semibold text-yellow-400 mb-2">🧱 Obstacles probables</p>
                  <ul className="space-y-1">
                    {(path.likelyObstacles ?? []).map((o, i) => (
                      <li key={i} className="text-xs text-slate-400">• {o}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Accordion>
          </div>
        )}

        {/* Similar jobs */}
        {(path.similarJobs?.length ?? 0) > 0 && (
          <div className="mt-3">
            <Accordion title="Métiers proches à explorer" icon="🔭">
              <div className="flex flex-wrap gap-2">
                {(path.similarJobs ?? []).map((j, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-dark-700 border border-dark-600 text-slate-300">{j}</span>
                ))}
              </div>
            </Accordion>
          </div>
        )}

        {/* Positioning */}
        {(path.positioningStatement || path.linkedinHeadline || path.interviewPitch || path.cvKeywords?.length) && (
          <div className="mt-3">
            <Accordion title="Positionnement professionnel" icon="🎙️">
              {path.positioningStatement && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-violet-400 mb-1.5">Phrase de positionnement</p>
                  <p className="text-sm text-slate-300 italic bg-dark-800/60 border border-dark-600 rounded-lg px-3 py-2 leading-relaxed">{path.positioningStatement}</p>
                </div>
              )}
              {path.linkedinHeadline && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-blue-400 mb-1.5">Accroche LinkedIn</p>
                  <p className="text-sm text-slate-200 font-medium bg-dark-800/60 border border-dark-600 rounded-lg px-3 py-2">{path.linkedinHeadline}</p>
                </div>
              )}
              {path.interviewPitch && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-green-400 mb-1.5">Pitch entretien</p>
                  <p className="text-sm text-slate-300 leading-relaxed bg-dark-800/60 border border-dark-600 rounded-lg px-3 py-2">{path.interviewPitch}</p>
                </div>
              )}
              {path.cvKeywords?.length && (
                <div>
                  <p className="text-xs font-semibold text-amber-400 mb-1.5">Mots-clés CV</p>
                  <div className="flex flex-wrap gap-1.5">
                    {path.cvKeywords.map((kw, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-amber-900/20 border border-amber-800/30 text-amber-300">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </Accordion>
          </div>
        )}

        {/* Why this vs others */}
        {path.comparisonWithOtherPaths && (
          <div className="mt-3">
            <Accordion title="Pourquoi cette voie plutôt qu'une autre ?" icon="⚖️">
              <p className="text-sm text-slate-300 leading-relaxed">{path.comparisonWithOtherPaths}</p>
            </Accordion>
          </div>
        )}

        {/* Company types to target */}
        {path.companyTypesToTarget && path.companyTypesToTarget.length > 0 && (
          <div className="mt-3">
            <Accordion title="Types d'entreprises à cibler" icon="🏢">
              <div className="space-y-2">
                {path.companyTypesToTarget.map((c, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-dark-800/50 border border-dark-700 rounded-lg px-3 py-2.5">
                    <span className="text-brand-400 font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{c}</p>
                  </div>
                ))}
              </div>
            </Accordion>
          </div>
        )}

        {/* Questions to ask professionals */}
        {path.questionsToAskProfessionals && path.questionsToAskProfessionals.length > 0 && (
          <div className="mt-3">
            <Accordion title="Questions à poser à un professionnel" icon="💬">
              <p className="text-xs text-slate-500 mb-3 italic">Ces questions t'aideront à valider la trajectoire lors d'un échange réseau.</p>
              <div className="space-y-2">
                {path.questionsToAskProfessionals.map((q, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-dark-800/50 border border-dark-700 rounded-lg px-3 py-2.5">
                    <span className="text-purple-400 font-bold text-xs flex-shrink-0 mt-0.5">?</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </Accordion>
          </div>
        )}

        {/* Choose or avoid */}
        {(path.choosePath?.length || path.avoidPath?.length) && (
          <div className="mt-3">
            <Accordion title="Choisissez cette voie si… / Évitez si…" icon="🔀">
              <div className="grid sm:grid-cols-2 gap-4">
                {path.choosePath && path.choosePath.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-green-400 mb-2">✅ Choisissez cette voie si…</p>
                    <ul className="space-y-1.5">
                      {path.choosePath.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-green-900/10 border border-green-800/20 rounded-lg px-3 py-2">
                          <span className="text-green-500 flex-shrink-0 mt-0.5">→</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {path.avoidPath && path.avoidPath.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-2">🚫 Évitez cette voie si…</p>
                    <ul className="space-y-1.5">
                      {path.avoidPath.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-red-900/10 border border-red-800/20 rounded-lg px-3 py-2">
                          <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Accordion>
          </div>
        )}

        {/* First concrete step */}
        <div className="mt-6 bg-gradient-to-r from-brand-900/40 to-purple-900/40 border border-brand-700/40 rounded-2xl p-5">
          <p className="text-xs font-bold text-brand-400 mb-2">🎯 Ton premier pas concret</p>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">{path.firstConcreteStep}</p>
        </div>
      </div>
    </div>
  )
}

// ── Comparison table ──────────────────────────────────────────────

function ComparisonTable({ paths }: { paths: PathData[] }) {
  const scoreCols = [
    { key: 'fitScore',               label: 'Adéquation',     icon: '🎯', desc: 'Score global de compatibilité' },
    { key: 'securityScore',          label: 'Sécurité',        icon: '🛡️', desc: 'Stabilité et sécurité du revenu' },
    { key: 'freedomScore',           label: 'Liberté',         icon: '🕊️', desc: 'Autonomie et flexibilité' },
    { key: 'incomePotentialScore',   label: 'Revenu potentiel', icon: '💰', desc: 'Potentiel de revenu à terme' },
    { key: 'alignmentScore',         label: 'Alignement',      icon: '❤️', desc: 'Alignement valeurs/motivation' },
    { key: 'marketOpportunityScore', label: 'Opportunité marché', icon: '📈', desc: 'Demande actuelle & tendance' },
    { key: 'transitionEffortScore',  label: 'Effort transition', icon: '⚙️', desc: 'Effort requis (0 = facile, 100 = exigeant)' },
  ] as const

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-700">
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide sticky left-0 bg-dark-800/80 backdrop-blur-sm z-10">Trajectoire</th>
              {scoreCols.map((c) => (
                <th key={c.key} className="text-center p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap" title={c.desc}>
                  {c.icon} {c.label}
                </th>
              ))}
              <th className="text-center p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Revenu estimé</th>
              <th className="text-center p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Risque</th>
              <th className="text-center p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Difficulté</th>
            </tr>
          </thead>
          <tbody>
            {paths.map((path, i) => {
              const meta = PATH_META[path.pathType] ?? PATH_META.current_aligned
              return (
                <tr key={i} className="border-b border-dark-800 last:border-0 hover:bg-dark-800/30 transition-colors">
                  <td className="p-4 sticky left-0 bg-dark-900/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2">
                      <span>{meta.icon}</span>
                      <div>
                        <p className="font-medium text-slate-200 text-xs leading-tight">{path.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{path.sector}</p>
                      </div>
                    </div>
                  </td>
                  {scoreCols.map((c) => {
                    const score = path[c.key] as number
                    const isEffort = c.key === 'transitionEffortScore'
                    const color = isEffort
                      ? (score >= 75 ? 'text-red-400' : score >= 45 ? 'text-amber-400' : 'text-green-400')
                      : (score >= 75 ? 'text-green-400' : score >= 55 ? 'text-amber-400' : 'text-red-400')
                    return (
                      <td key={c.key} className="p-3 text-center">
                        <span className={`font-bold text-sm ${color}`}>{score}</span>
                      </td>
                    )
                  })}
                  <td className="p-3 text-center text-xs text-slate-400 whitespace-nowrap">{path.revenueEstimate}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      path.riskLevel.includes('Élevé') ? 'bg-red-900/30 text-red-300' :
                      path.riskLevel.includes('Faible') ? 'bg-green-900/30 text-green-300' :
                      'bg-amber-900/30 text-amber-300'
                    }`}>{path.riskLevel}</span>
                  </td>
                  <td className="p-3 text-center">
                    {path.difficultyLevel && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        path.difficultyLevel === 'Exigeante' ? 'bg-red-900/30 text-red-300' :
                        path.difficultyLevel === 'Progressive' ? 'bg-amber-900/30 text-amber-300' :
                        'bg-green-900/30 text-green-300'
                      }`}>{path.difficultyLevel}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 pb-3 flex flex-wrap gap-4 border-t border-dark-800 pt-3">
        <p className="text-[10px] text-slate-600">⚙️ Effort transition : 0 = très facile, 100 = exigeant — score inversé par rapport aux autres</p>
        <p className="text-[10px] text-slate-600">📈 Opportunité marché : demande actuelle + tendance du secteur</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function Results() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate     = useNavigate()
  const location     = useLocation()
  const adminMode    = (location.state as { adminMode?: boolean } | null)?.adminMode === true

  const [report,       setReport]       = useState<Report | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [error,        setError]        = useState('')

  useEffect(() => {
    if (!reportId) { navigate('/'); return }

    const isMock = reportId.startsWith('mock_')

    // ── Garde production : les rapports mock ne donnent jamais accès aux résultats complets
    // En développement local (import.meta.env.DEV = true), les mocks sont autorisés.
    // En production Vercel, VITE_ALLOW_MOCK_REPORTS doit être "true" pour les activer (ne jamais le faire).
    const allowMockReports = import.meta.env.DEV || import.meta.env.VITE_ALLOW_MOCK_REPORTS === 'true'
    if (isMock && !allowMockReports) {
      setAccessDenied(true)
      setError('Rapport de démonstration indisponible en production. Génère un rapport réel pour accéder aux résultats.')
      setLoading(false)
      return
    }

    // Le cookie HttpOnly d'accès est posé par Success.tsx via /api/verify-payment.
    // Results.tsx vérifie uniquement via le cookie (credentials: 'include') + statut DB.
    fetchReport(reportId)
      .then((r) => {
        // Mock : pas de vérification de paiement (dev / fallback local)
        if (isMock) { setReport(r); return }

        // Rapport réel non payé → rediriger vers la paywall
        if (r.status !== 'paid' && r.status !== 'complete') {
          navigate(`/paywall/${reportId}`, { replace: true })
          return
        }
        // Paths absents malgré le statut payé → anomalie DB
        if (!r.paths?.length && !r.trajectories?.length) {
          setError('Rapport indisponible. Contacte le support.')
          return
        }
        setReport(r)
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Rapport introuvable'
        if (msg === 'ACCESS_DENIED') {
          setAccessDenied(true)
          setError('Accès au rapport non autorisé. Finalise ton paiement pour obtenir un lien d\'accès valide.')
        } else {
          setError(msg)
        }
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Logo size={72} withText={false} to={null} className="mx-auto mb-5 opacity-80" />
          <p className="text-slate-400">Chargement de ton rapport…</p>
        </div>
      </div>
    )
  }

  // Paiement non confirmé → message clair + lien retour paywall
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-3 text-slate-100">Accès au rapport complet</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {reportId && (
              <button
                onClick={() => navigate(`/paywall/${reportId}`)}
                className="btn-primary"
              >
                Finaliser mon accès →
              </button>
            )}
            <button onClick={() => navigate('/')} className="btn-secondary">Accueil</button>
          </div>
        </div>
      </div>
    )
  }

  // Erreur technique ou rapport introuvable
  if (error || !report) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2 text-slate-100">Rapport introuvable</h2>
          <p className="text-slate-500 mb-6">{error || 'Ce rapport n\'existe pas ou n\'est plus disponible.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/onboarding')} className="btn-primary">Recommencer</button>
            <button onClick={() => navigate('/')} className="btn-secondary">Accueil</button>
          </div>
        </div>
      </div>
    )
  }

  const paths = report.paths ?? []

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-dark-950/90 backdrop-blur-md border-b border-dark-800">
        <Logo size={40} />
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block">
            Rapport de {report.firstName}
          </span>
          <button onClick={() => navigate('/')} className="btn-secondary text-sm py-2 px-4">
            Accueil
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="text-center">
          {adminMode && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300/90 text-xs font-semibold uppercase tracking-wider mb-3">
              <span>🔑</span> Mode admin — aperçu non payé
            </div>
          )}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 ${
            adminMode
              ? 'bg-amber-600/10 border border-amber-600/25 text-amber-300/80'
              : 'bg-green-600/15 border border-green-600/30 text-green-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${adminMode ? 'bg-amber-400' : 'bg-green-400'}`} />
            Rapport OtherMe complet
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Tes <span className="gradient-text">3 trajectoires</span> alternatives, {report.firstName}
          </h1>
          {report.reportSummary && (
            <div className="max-w-3xl mx-auto bg-dark-800/50 border border-dark-700 rounded-2xl p-6 text-left">
              <p className="text-sm font-semibold text-slate-400 mb-2">📊 Synthèse personnalisée</p>
              <p className="text-slate-300 leading-relaxed">{report.reportSummary}</p>
            </div>
          )}
        </div>

        {/* ── Comparison table ─────────────────────────────────────── */}
        {paths.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-4">📊 Comparatif des 3 trajectoires</h2>
            <ComparisonTable paths={paths} />
          </section>
        )}

        {/* ── Path cards ───────────────────────────────────────────── */}
        {paths.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-lg font-bold text-slate-100">🗺️ Détail de tes trajectoires</h2>
            {paths.map((path, i) => (
              <PathCard key={path.pathType} path={path} index={i} />
            ))}
          </section>
        )}

        {/* ── Synthesis ────────────────────────────────────────────── */}
        {report.comparison && (
          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-4">🧭 Synthèse finale</h2>

            {/* Comparison trio */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                {
                  icon: '🛡️', label: 'La plus sûre', value: report.comparison.safestPath,
                  color: 'border-blue-700/30 bg-blue-900/10', badge: 'bg-blue-900/30 text-blue-300',
                  tag: 'Sécurité maximale',
                },
                {
                  icon: '❤️', label: 'La plus alignée', value: report.comparison.mostPassionAlignedPath,
                  color: 'border-purple-700/30 bg-purple-900/10', badge: 'bg-purple-900/30 text-purple-300',
                  tag: 'Passion & sens',
                },
                {
                  icon: '🚀', label: 'Le plus haut potentiel', value: report.comparison.highestPotentialPath,
                  color: 'border-amber-700/30 bg-amber-900/10', badge: 'bg-amber-900/30 text-amber-300',
                  tag: 'Impact & ambition',
                },
              ].map((item) => (
                <div key={item.label} className={`border ${item.color} rounded-xl p-4 flex flex-col gap-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{item.icon}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badge}`}>{item.tag}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Recommended choice — highlighted */}
            <div className="relative bg-gradient-to-br from-brand-900/50 to-purple-900/30 border border-brand-700/40 rounded-2xl p-6 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-400 text-sm">💡</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-0.5">Recommandation prioritaire</p>
                  <p className="text-base font-bold text-slate-100 leading-snug">{report.comparison.recommendedFirstChoice}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed pl-11">{report.comparison.reason}</p>
            </div>
          </section>
        )}

        {/* ── Best first step 48h ───────────────────────────────────── */}
        {report.bestFirstStep48h && (
          <section className="bg-gradient-to-r from-brand-900/50 to-purple-900/50 border border-brand-700/40 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h2 className="text-xl font-bold text-slate-100 mb-3">Ton meilleur premier pas</h2>
            <p className="text-base text-slate-200 leading-relaxed max-w-2xl mx-auto font-medium">
              {report.bestFirstStep48h}
            </p>
            <p className="text-xs text-slate-500 mt-4">À faire dans les 48 prochaines heures</p>
          </section>
        )}

        {report.cvInfluence && <CvInfluenceSection cv={report.cvInfluence} />}

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="text-center pt-4 border-t border-dark-800">
          <Logo size={36} className="justify-center mb-2" />
          <p className="text-xs text-slate-600">Rapport généré par OtherMe · Analyse personnalisée basée sur ton profil</p>
          <button onClick={() => navigate('/')} className="btn-secondary text-sm py-2 px-5 mt-4">
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}
