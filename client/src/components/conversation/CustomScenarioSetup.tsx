import { useState } from 'react'
import { useTheme } from '@/lib/speakup-theme'
import type { UserContext } from '@/lib/types'

const TYPES: { id: string; emoji: string; label: string; desc: string }[] = [
  { id: 'casual',       emoji: '💬', label: 'Casual Conversation', desc: 'Talk freely about anything — hobbies, plans, opinions.' },
  { id: 'interview',    emoji: '💼', label: 'Interview Practice',  desc: 'Rehearse answers for real interview scenarios.' },
  { id: 'debate',       emoji: '⚡', label: 'Structured Debate',   desc: 'Build and defend an argument on a given topic.' },
  { id: 'presentation', emoji: '🎤', label: 'Presentation Prep',   desc: 'Practice delivering a talk or pitch clearly.' },
  { id: 'meeting',      emoji: '📋', label: 'Meeting Simulation',  desc: 'Simulate leading or contributing to a work meeting.' },
  { id: 'custom',       emoji: '✏️', label: 'Custom Topic',        desc: 'Describe any scenario you want to practice.' },
]

const FOCUS = ['Improve fluency', 'Fix grammar', 'Build vocabulary', 'Sound professional', 'Reduce hesitation']

export function CustomScenarioSetup({ onStart, isLoading }: { onStart: (ctx: UserContext) => void; isLoading: boolean }) {
  const T = useTheme()
  const [selected, setSelected] = useState('casual')
  const [customTopic, setCustomTopic] = useState('')
  const [focus, setFocus] = useState('Improve fluency')

  const handleStart = () => {
    const t = TYPES.find((x) => x.id === selected)
    const scenario = selected === 'custom' && customTopic ? customTopic : `${t?.label}: ${t?.desc}`
    onStart({ name: 'Learner', level: 'intermediate', customScenario: scenario, situationDetail: focus })
  }
  const canStart = !isLoading && (selected !== 'custom' || customTopic.trim().length > 0)

  return (
    <div style={{ background: T.bg, minHeight: 'calc(100vh - 64px)', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.indigo, fontFamily: T.bodyFont, marginBottom: 6 }}>
            Custom Practice
          </div>
          <h1 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 'clamp(26px, 3.4vw, 34px)', color: T.heading, letterSpacing: -0.5, margin: '0 0 6px' }}>
            Start a freeform session
          </h1>
          <p style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.body, margin: 0, lineHeight: 1.5 }}>
            Choose a conversation type, set your focus area, and begin.
          </p>
        </div>

        <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 16, color: T.heading, marginBottom: 14 }}>
          Conversation type
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
          {TYPES.map((t) => (
            <TypeCard key={t.id} type={t} active={selected === t.id} onClick={() => setSelected(t.id)} />
          ))}
        </div>

        {selected === 'custom' && (
          <div style={{ marginBottom: 28, maxWidth: 500 }}>
            <label style={{ fontFamily: T.bodyFont, fontSize: 13, fontWeight: 600, color: T.heading, display: 'block', marginBottom: 6 }}>
              Your topic
            </label>
            <input value={customTopic} onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Explaining my project to a new team member"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${T.border}`, fontFamily: T.bodyFont, fontSize: 14,
                outline: 'none', color: T.heading, background: T.surface,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = T.indigo)}
              onBlur={(e) => (e.currentTarget.style.borderColor = T.border)} />
          </div>
        )}

        <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 16, color: T.heading, marginBottom: 14 }}>
          Focus area
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          {FOCUS.map((f) => {
            const active = focus === f
            return (
              <button key={f} onClick={() => setFocus(f)} style={{
                fontFamily: T.bodyFont, fontSize: 13, fontWeight: 600,
                padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${active ? T.indigo : T.border}`,
                background: active ? T.indigo : T.surface,
                color: active ? '#fff' : T.heading,
                transition: 'all 0.18s',
              }}>{f}</button>
            )
          })}
        </div>

        <button onClick={handleStart} disabled={!canStart}
          style={{
            fontFamily: T.bodyFont, fontSize: 14, fontWeight: 700, border: 'none',
            padding: '12px 26px', borderRadius: 12, cursor: canStart ? 'pointer' : 'not-allowed',
            background: T.indigo, color: '#fff', opacity: canStart ? 1 : 0.5,
            transition: 'all 0.2s',
          }}>{isLoading ? 'Building session…' : 'Begin Session →'}</button>
      </div>
    </div>
  )
}

function TypeCard({ type, active, onClick }: { type: { id: string; emoji: string; label: string; desc: string }; active: boolean; onClick: () => void }) {
  const T = useTheme()
  const [h, setH] = useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: active ? T.indigoLight : T.surface,
        border: `1px solid ${active ? T.indigo : h ? T.indigoMid : T.border}`,
        borderRadius: 14, padding: 20, cursor: 'pointer',
        transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.18s',
        transform: h && !active ? 'translateY(-2px)' : 'none',
        boxShadow: active
          ? `0 0 0 1px ${T.indigo}, 0 4px 16px oklch(0.55 0.22 275 / 0.12)`
          : h
            ? '0 6px 20px rgba(0,0,0,0.05)'
            : '0 1px 2px rgba(0,0,0,0.02)',
        minHeight: 150, display: 'flex', flexDirection: 'column',
      }}>
      <div style={{ fontSize: 28, marginBottom: 14, lineHeight: 1 }}>
        {type.emoji}
      </div>
      <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 15, color: T.heading, marginBottom: 6 }}>
        {type.label}
      </div>
      <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.body, lineHeight: 1.5 }}>
        {type.desc}
      </div>
    </div>
  )
}
