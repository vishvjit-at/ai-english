import { useState } from 'react'
import { Mic, Sparkles, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import type { UserContext } from '@/lib/types'

const levels = [
  { value: 'beginner', label: 'Beginner', color: 'bg-primary-300' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-accent-300' },
  { value: 'advanced', label: 'Advanced', color: 'bg-tertiary-300' },
] as const

const examples = [
  'I am negotiating my salary with my manager after getting a competing offer',
  'I am presenting my startup idea to investors at a pitch competition',
  'I am at a visa interview at the US consulate for a student visa',
  'I am calling customer support to get a refund for a broken product',
  'I am meeting my new team on my first day at a new company',
  'I am asking my landlord to fix the broken AC',
  'I am at a networking event talking to a senior engineer',
  'I am doing a mock debate about whether AI is good for society',
]

export function CustomScenarioSetup({ onStart, isLoading }: { onStart: (ctx: UserContext) => void; isLoading: boolean }) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState<UserContext['level']>('intermediate')
  const [customScenario, setCustomScenario] = useState('')
  const [showExamples, setShowExamples] = useState(false)

  const canStart = name.trim().length > 0 && customScenario.trim().length > 10

  const handleStart = () => {
    if (!canStart) return
    onStart({ name: name.trim(), level, customScenario: customScenario.trim() })
  }

  const inputClass = 'w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-body text-neutral-700 focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-300 transition-all placeholder:text-neutral-300'

  return (
    <div className="h-full overflow-y-auto bg-surface flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-accent-100 to-accent-50 px-6 py-5 border-b border-accent-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-300 to-accent-400 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-neutral-800 text-base">Your Own Scenario</h2>
                <p className="text-neutral-400 text-xs font-body">Describe any situation</p>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <div>
              <label className="block text-sm font-heading font-semibold text-neutral-600 mb-1.5">Your name <span className="text-accent-400">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul" className={inputClass} autoFocus />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-heading font-semibold text-neutral-600">Your scenario <span className="text-accent-400">*</span></label>
                <button onClick={() => setShowExamples((v) => !v)} className="text-xs text-accent-400 hover:text-accent-500 flex items-center gap-0.5 font-heading font-semibold cursor-pointer">
                  Ideas {showExamples ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
              <textarea value={customScenario} onChange={(e) => setCustomScenario(e.target.value)}
                placeholder="e.g. I am negotiating my salary with my manager. I have a competing offer."
                rows={4} className={`${inputClass} resize-none`} />
              <p className="text-[10px] text-neutral-300 mt-1 font-body">More detail = more realistic practice</p>

              {showExamples && (
                <div className="mt-3 bg-accent-50/50 rounded-xl border border-accent-100 overflow-hidden animate-scale-in">
                  <p className="text-[10px] text-accent-400 font-heading font-bold px-3 py-2 uppercase tracking-widest">Tap to use</p>
                  <div className="flex flex-col max-h-40 overflow-y-auto">
                    {examples.map((ex, i) => (
                      <button key={i} onClick={() => { setCustomScenario(ex); setShowExamples(false) }}
                        className="text-left px-4 py-2.5 text-xs text-neutral-500 hover:bg-accent-100/50 cursor-pointer transition-colors border-t border-accent-100/30 first:border-0 font-body">
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-heading font-semibold text-neutral-600 mb-2">English level</label>
              <div className="grid grid-cols-3 gap-2">
                {levels.map((opt) => (
                  <button key={opt.value} onClick={() => setLevel(opt.value)}
                    className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border transition-all cursor-pointer
                      ${level === opt.value ? 'border-accent-300 bg-accent-50' : 'border-neutral-100 hover:border-neutral-200'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${opt.color} ${level === opt.value ? '' : 'opacity-30'} transition-all`} />
                    <span className="text-xs font-heading font-semibold text-neutral-700">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleStart} disabled={!canStart || isLoading}
              className="w-full bg-gradient-to-r from-accent-300 to-accent-400 hover:from-accent-400 hover:to-accent-500 text-white py-3.5 rounded-xl font-heading font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:from-neutral-200 disabled:to-neutral-200 disabled:shadow-none disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.98]">
              {isLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Building scenario...</>
                : <><Mic className="w-4 h-4" /> Start Practice <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
