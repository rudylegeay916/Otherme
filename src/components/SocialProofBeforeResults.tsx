import { getRandomSocialProofProfiles } from '../data/socialProofProfiles'

const profiles = getRandomSocialProofProfiles(3)

export default function SocialProofBeforeResults() {
  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-white text-center mb-2">
        Ils ont osé changer de trajectoire
      </h2>
      <p className="text-gray-400 text-center text-sm mb-8">
        OtherMe les a aidés à voir des possibilités qu'ils n'avaient pas envisagées.
      </p>

      <div className="grid gap-5 sm:grid-cols-3">
        {profiles.map((p) => (
          <div
            key={p.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {p.name[0]}
              </div>
              <div>
                <p className="text-white font-semibold leading-tight">{p.name}, {p.age} ans</p>
                <p className="text-gray-400 text-xs leading-tight">{p.previousSituation}</p>
              </div>
            </div>

            <div className="text-xs text-purple-300 font-medium bg-purple-900/30 rounded-lg px-3 py-1.5">
              → {p.newDirection}
            </div>

            <blockquote className="text-gray-300 text-sm italic leading-relaxed flex-1">
              "{p.quote}"
            </blockquote>

            <div className="flex flex-wrap gap-1.5 mt-auto">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-white/10 text-gray-300 rounded-full px-2.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-gray-500 text-xs text-center mt-6">
        Profils illustratifs inspirés de trajectoires types générées par OtherMe.
      </p>
    </section>
  )
}
