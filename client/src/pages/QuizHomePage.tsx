import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchQuizModules, type QuizModuleInfo } from '@/lib/api'
import { useTheme } from '@/lib/speakup-theme'

export function QuizHomePage() {
  const T = useTheme()
  const nav = useNavigate()
  const [modules, setModules] = useState<QuizModuleInfo[]>([])
  const [dailyDone, setDailyDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizModules()
      .then((d) => { setModules(d.modules); setDailyDone(d.dailyDoneToday) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: T.bg, minHeight: 'calc(100vh - 64px)', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: T.indigo, fontFamily: T.bodyFont, marginBottom: 8 }}>
              Quiz
            </div>
            <h1 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 'clamp(26px, 4vw, 36px)', color: T.heading, letterSpacing: -0.5, margin: '0 0 8px' }}>
              Test what you know
            </h1>
            <p style={{ fontFamily: T.bodyFont, fontSize: 16, color: T.body, margin: 0, lineHeight: 1.5 }}>
              Pick a module — 10 fresh AI-generated MCQs each time. We never repeat a question you've seen.
            </p>
          </div>
          <Link to="/quiz/history" style={{
            fontFamily: T.bodyFont, fontSize: 14, fontWeight: 600,
            color: T.indigo, textDecoration: 'none',
            padding: '10px 18px', borderRadius: 10,
            border: `1px solid ${T.border}`, background: T.surface,
            transition: 'all 0.2s',
          }}>View History →</Link>
        </div>

        {/* Daily Quiz hero */}
        <DailyCard done={dailyDone} onStart={() => nav('/quiz/run/daily')} />

        <h2 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 20, color: T.heading, margin: '36px 0 16px' }}>
          Modules
        </h2>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="skeleton" style={{ height: 160, borderRadius: T.radius, background: T.bgAlt }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {modules.map((m) => (
              <ModuleCard key={m.id} mod={m} onClick={() => nav(`/quiz/run/${m.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DailyCard({ done, onStart }: { done: boolean; onStart: () => void }) {
  const T = useTheme()
  const [h, setH] = useState(false)
  return (
    <div style={{
      background: T.gradientDeep,
      borderRadius: 24, padding: 'clamp(28px, 4vw, 40px)',
      color: '#fff', position: 'relative', overflow: 'hidden',
      boxShadow: '0 20px 60px oklch(0.55 0.22 275 / 0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 24, flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.75, marginBottom: 8 }}>
          Daily Challenge
        </div>
        <h3 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 26, margin: '0 0 8px', letterSpacing: -0.5 }}>
          Today's Daily Quiz
        </h3>
        <p style={{ fontFamily: T.bodyFont, fontSize: 15, margin: 0, opacity: 0.85, maxWidth: 460, lineHeight: 1.5 }}>
          10 mixed questions across all modules. {done ? 'You\'ve already done today\'s — come back tomorrow!' : 'Sharpen everything in 5 minutes.'}
        </p>
      </div>
      <button onClick={onStart} disabled={done}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{
          fontFamily: T.bodyFont, fontSize: 16, fontWeight: 700,
          background: '#fff', color: 'oklch(0.45 0.22 275)',
          border: 'none', padding: '14px 32px', borderRadius: 14,
          cursor: done ? 'not-allowed' : 'pointer',
          opacity: done ? 0.5 : 1,
          transform: h && !done ? 'translateY(-2px)' : 'none',
          boxShadow: h && !done ? '0 12px 30px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.1)',
          transition: 'all 0.25s',
          whiteSpace: 'nowrap',
        }}>{done ? '✓ Done Today' : 'Start Daily Quiz →'}</button>
    </div>
  )
}

function ModuleCard({ mod, onClick }: { mod: QuizModuleInfo; onClick: () => void }) {
  const T = useTheme()
  const [h, setH] = useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: T.radius, padding: 22, cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: h ? 'translateY(-3px)' : 'none',
        boxShadow: h ? T.shadowHover : T.shadow,
      }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{mod.icon}</div>
      <h3 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 17, color: T.heading, margin: '0 0 6px' }}>
        {mod.label}
      </h3>
      <p style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.body, margin: '0 0 14px', lineHeight: 1.5 }}>
        {mod.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.bodyLight }}>
          {mod.seen} answered
        </span>
        <span style={{ fontFamily: T.bodyFont, fontSize: 13, fontWeight: 600, color: T.indigo }}>
          Start →
        </span>
      </div>
    </div>
  )
}
