import { useState } from 'react'
import { Mic, Sparkles, ChevronDown, ChevronUp, ArrowRight, Lightbulb } from 'lucide-react'
import type { UserContext } from '@/lib/types'
import { MaskButton } from '@/components/ui/MaskButton'

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

  const inputClass = 'w-full border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:border-primary-500 transition-all placeholder:text-neutral-400'

  return (
    <div className="min-h-full p-4 sm:p-8 max-w-2xl mx-auto" style={{ background: 'var(--sem-surface)' }}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] uppercase font-medium mb-2" style={{ color: 'var(--sem-neutral-400)', fontFamily: 'var(--font-heading)' }}>
          Free Practice
        </p>
        <h1 className="font-black tracking-tight leading-none" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-heading)', color: 'var(--sem-neutral-900)' }}>
          Custom<br />Scenario
        </h1>
      </div>

      {/* Main form card */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-8 mb-5">
        <div className="mb-5">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
            Your Name <span className="text-red-400">*</span>
          </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul" className={inputClass} autoFocus />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
            Your Scenario <span className="text-red-400">*</span>
          </label>
          <textarea
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            placeholder="e.g. I am negotiating my salary with my manager. I have a competing offer."
            rows={4}
            className={`${inputClass} resize-none min-h-[120px]`}
          />
          <p className="text-sm text-neutral-400 mt-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            More detail = more realistic practice
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">English Level</label>
          <div className="flex gap-2">
            {levels.map((opt) => (
              <button key={opt.value} onClick={() => setLevel(opt.value)}
                className={`px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all cursor-pointer flex-1
                  ${level === opt.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <MaskButton onClick={handleStart} disabled={!canStart || isLoading} fullWidth
          className="py-3.5 font-bold">
          {isLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Building scenario…</>
            : <><Mic className="w-4 h-4" /> Start Practice <ArrowRight className="w-4 h-4" /></>}
        </MaskButton>
      </div>

      {/* Browse Ideas collapsible */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-5">
        <button
          onClick={() => setShowExamples((v) => !v)}
          className="flex items-center justify-between p-5 cursor-pointer w-full text-left hover:bg-neutral-50 transition-colors"
        >
          <span className="text-sm font-bold text-neutral-700">Browse Ideas</span>
          {showExamples ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>
        {showExamples && (
          <div className="grid grid-cols-2 gap-2 p-5 pt-0">
            {examples.map((ex, i) => (
              <button key={i} onClick={() => { setCustomScenario(ex); setShowExamples(false) }}
                className="text-left bg-neutral-50 rounded-2xl px-4 py-3 text-sm text-neutral-600 hover:bg-primary-50 hover:text-primary-700 cursor-pointer transition-colors">
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Aria preview card */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex gap-4">
        <div className="w-12 h-12 bg-primary-600 rounded-full text-white font-bold flex items-center justify-center text-lg shrink-0">
          A
        </div>
        <div>
          <p className="font-bold text-neutral-900 mb-1">Meet Aria</p>
          <p className="text-neutral-600 text-sm">
            Your AI English partner. Patient, encouraging, and tailored to your scenario. She'll guide the conversation naturally.
          </p>
          <div className="flex gap-2 mt-3">
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">Patient</span>
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">Encouraging</span>
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI-Powered
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
