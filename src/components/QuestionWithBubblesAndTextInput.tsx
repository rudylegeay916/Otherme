import type { QuestionAnswer } from '../types'

interface Props {
  questionTitle: string
  questionSubtitle?: string
  bubbleOptions: string[]
  allowMultiple?: boolean
  value: QuestionAnswer
  onChange: (v: QuestionAnswer) => void
  placeholder?: string
  onSkip?: () => void
}

export default function QuestionWithBubblesAndTextInput({
  questionTitle,
  questionSubtitle,
  bubbleOptions,
  allowMultiple = true,
  value,
  onChange,
  placeholder = 'Précisez votre pensée en quelques mots…',
  onSkip,
}: Props) {
  const toggle = (opt: string) => {
    const selected = value.selectedOptions
    if (selected.includes(opt)) {
      onChange({ ...value, selectedOptions: selected.filter((s) => s !== opt) })
    } else if (allowMultiple) {
      onChange({ ...value, selectedOptions: [...selected, opt] })
    } else {
      onChange({ ...value, selectedOptions: [opt] })
    }
  }

  return (
    <div className="space-y-5">
      {/* Titre + sous-titre */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 leading-snug">{questionTitle}</h2>
        {questionSubtitle && (
          <p className="text-slate-500 text-sm mt-1">{questionSubtitle}</p>
        )}
      </div>

      {/* Bulles */}
      <div className="flex flex-wrap gap-2">
        {bubbleOptions.map((opt) => {
          const active = value.selectedOptions.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3.5 py-2 rounded-full text-sm border transition-all duration-200 ${
                active
                  ? 'bg-brand-600 border-brand-500 text-white shadow-sm shadow-brand-900'
                  : 'bg-dark-800 border-dark-600 text-slate-400 hover:border-brand-700 hover:text-slate-200'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Champ libre */}
      <textarea
        rows={3}
        className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600/30 resize-none transition-colors"
        placeholder={placeholder}
        value={value.freeText}
        onChange={(e) => onChange({ ...value, freeText: e.target.value })}
      />

      {/* Passer */}
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          Passer cette question →
        </button>
      )}
    </div>
  )
}
