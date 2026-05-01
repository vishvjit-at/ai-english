import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Timer, BarChart3, Flame } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { fetchProgress } from '@/lib/api'
import { useTheme } from '@/lib/speakup-theme'
import type { ProgressData } from '@/lib/types'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function ProgressPage() {
  const T = useTheme()
  const nav = useNavigate()
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress().then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: T.bg, minHeight: 'calc(100vh - 64px)', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.indigo, fontFamily: T.bodyFont, marginBottom: 6 }}>
            Progress
          </div>
          <h1 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 'clamp(26px, 3.4vw, 34px)', color: T.heading, letterSpacing: -0.5, margin: '0 0 6px' }}>
            Your improvement over time
          </h1>
          <p style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.body, margin: 0, lineHeight: 1.5 }}>
            Track how your speaking skills develop session by session.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
            {[0,1,2,3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 104, borderRadius: T.radius, background: T.bgAlt }} />
            ))}
          </div>
        ) : !data || data.totalSessions === 0 ? (
          <Empty onStart={() => nav('/practice/custom')} />
        ) : (
          <Filled data={data} />
        )}
      </div>
    </div>
  )
}

function Empty({ onStart }: { onStart: () => void }) {
  const T = useTheme()
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
      padding: 60, textAlign: 'center',
    }}>
      <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 20, color: T.heading, margin: '0 0 8px' }}>
        No data yet
      </div>
      <p style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.body, margin: '0 0 18px' }}>
        Complete a few conversations to see your progress here.
      </p>
      <button onClick={onStart} style={{
        fontFamily: T.bodyFont, fontSize: 14, fontWeight: 700, border: 'none',
        padding: '10px 22px', borderRadius: 12, cursor: 'pointer',
        background: T.indigo, color: '#fff',
      }}>Start Practicing</button>
    </div>
  )
}

function Filled({ data }: { data: ProgressData }) {
  const T = useTheme()

  const stats: { Icon: LucideIcon; value: string; label: string; sub: string }[] = [
    { Icon: Target, value: String(data.totalSessions), label: 'Sessions completed', sub: data.totalSessions > 0 ? `+${Math.min(data.totalSessions, 5)} this week` : '' },
    { Icon: Timer, value: `${(data.totalMinutes / 60).toFixed(1)}h`, label: 'Total practice time', sub: '+0.5h this week' },
    { Icon: BarChart3, value: data.averageScore != null ? String(Math.round(data.averageScore * 10)) : '—', label: 'Average score', sub: '+4 vs last month' },
    { Icon: Flame, value: `${data.currentStreak} day${data.currentStreak !== 1 ? 's' : ''}`, label: 'Current streak', sub: data.currentStreak > 0 ? 'Keep it going!' : 'Start today' },
  ]

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const weekBars = DAYS.map((day, i) => {
    const histEntry = data.scoreHistory[data.scoreHistory.length - 7 + i]
    const score = histEntry?.score != null ? Math.round(histEntry.score * 10) : null
    return { day, score, isToday: i === todayIdx }
  })
  const maxVal = Math.max(...weekBars.map((b) => b.score ?? 0), 100)

  const skills: { name: string; score: number; prev: number; color: string }[] = [
    { name: 'Fluency',       score: Math.min(100, Math.round((data.averageScore ?? 7) * 10)), prev: 74, color: '#22c55e' },
    { name: 'Grammar',       score: Math.max(20, Math.round(100 - data.grammarCorrectionRate)), prev: 65, color: '#f97316' },
    { name: 'Pronunciation', score: 78, prev: 72, color: T.indigo },
    { name: 'Vocabulary',    score: Math.min(100, 60 + Math.min(data.totalSessions * 2, 40)), prev: 60, color: '#8b5cf6' },
  ]

  return (
    <>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 22 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Two-column: weekly + skills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 18 }}>
        <Panel title="Weekly scores">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, paddingTop: 18 }}>
            {weekBars.map((b) => (
              <div key={b.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: T.bodyFont, fontSize: 11, fontWeight: 600, color: b.isToday ? T.indigo : T.bodyLight }}>
                  {b.score ?? ''}
                </span>
                <div style={{ width: '100%', maxWidth: 36, position: 'relative', display: 'flex', alignItems: 'flex-end', height: 110 }}>
                  <div style={{
                    width: '100%', borderRadius: 6,
                    height: `${b.score != null ? (b.score / maxVal) * 100 : 8}%`,
                    minHeight: 6,
                    background: b.score == null ? T.borderLight : b.isToday ? T.indigo : T.borderLight,
                    transition: 'height 0.5s ease',
                  }} />
                </div>
                <span style={{ fontFamily: T.bodyFont, fontSize: 11, color: b.isToday ? T.indigo : T.bodyLight, fontWeight: b.isToday ? 600 : 400 }}>
                  {b.day}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Skill breakdown">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 8 }}>
            {skills.map((sk) => (
              <div key={sk.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.heading }}>{sk.name}</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: T.headingFont, fontSize: 14, fontWeight: 700, color: T.heading }}>{sk.score}</span>
                    {sk.score > sk.prev && (
                      <span style={{ fontFamily: T.bodyFont, fontSize: 11, fontWeight: 600, color: T.green }}>
                        +{sk.score - sk.prev}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: T.borderLight, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(sk.score, 100)}%`, borderRadius: 3, background: sk.color, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}

function StatCard({ Icon, value, label, sub }: { Icon: LucideIcon; value: string; label: string; sub: string }) {
  const T = useTheme()
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
      padding: 18, display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: T.indigoLight, color: T.indigo,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 22, color: T.heading, lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.body, marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontFamily: T.bodyFont, fontSize: 11, color: T.green, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  const T = useTheme()
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
      padding: 22,
    }}>
      <h3 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 15, color: T.heading, margin: 0 }}>
        {title}
      </h3>
      {children}
    </div>
  )
}
