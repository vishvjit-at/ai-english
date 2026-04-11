import { useState } from 'react'
import { Mic, Sparkles, ChevronDown, ChevronUp, ArrowRight, Lightbulb } from 'lucide-react'
import type { UserContext } from '@/lib/types'

const levels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
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

  const inputClass = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-slate-400'

  return (
    <div className="min-h-full bg-slate-50 p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Custom Scenario</h1>
      <p className="text-slate-500 mb-8">Describe any situation and practice with Aria.</p>

      {/* Your Practice Topic card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Your Name <span className="text-red-400">*</span>
          </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul" className={inputClass} autoFocus />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Your Scenario <span className="text-red-400">*</span>
          </label>
          <textarea
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            placeholder="e.g. I am negotiating my salary with my manager. I have a competing offer."
            rows={4}
            className={`${inputClass} resize-none min-h-[120px]`}
          />
          <p className="text-sm text-slate-400 mt-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            More detail = more realistic practice
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">English Level</label>
          <div className="flex gap-2">
            {levels.map((opt) => (
              <button key={opt.value} onClick={() => setLevel(opt.value)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer flex-1
                  ${level === opt.value
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleStart} disabled={!canStart || isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] mt-6">
          {isLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Building scenario...</>
            : <><Mic className="w-4 h-4" /> Start Practice <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>

      {/* Browse Ideas collapsible */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
        <button
          onClick={() => setShowExamples((v) => !v)}
          className="flex items-center justify-between p-4 cursor-pointer w-full text-left hover:bg-slate-50 transition-colors"
        >
          <span className="text-sm font-semibold text-slate-700">Browse Ideas</span>
          {showExamples ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {showExamples && (
          <div className="grid grid-cols-2 gap-2 p-4 pt-0">
            {examples.map((ex, i) => (
              <button key={i} onClick={() => { setCustomScenario(ex); setShowExamples(false) }}
                className="text-left bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-green-50 hover:text-green-700 cursor-pointer transition-colors">
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Aria preview card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-4">
        <div className="w-12 h-12 bg-green-600 rounded-full text-white font-bold flex items-center justify-center text-lg shrink-0">
          A
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm mb-1">Meet Aria</p>
          <p className="text-slate-600 text-sm">
            Your AI English partner. Patient, encouraging, and tailored to your scenario. She'll guide the conversation naturally.
          </p>
          <div className="flex gap-2 mt-3">
            <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Patient</span>
            <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Encouraging</span>
            <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI-Powered
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
