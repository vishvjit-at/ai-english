import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { fetchSessions } from '@/lib/api'
import { useTheme } from '@/lib/speakup-theme'
import type { SessionListItem } from '@/lib/types'

type FilterTab = 'All' | 'Lesson' | 'Custom'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatDuration(secs: number | null): string {
  if (!secs) return '—'
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)} min`
}
function isLessonSession(s: SessionListItem): boolean {
  return s.topic !== 'custom' && !s.scenarioName.toLowerCase().includes('—')
}

export function HistoryPage() {
  const T = useTheme()
  const nav = useNavigate()
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions(50).then((d) => setSessions(d.sessions)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = sessions.filter((s) => {
    if (filter === 'All') return true
    return (isLessonSession(s) ? 'Lesson' : 'Custom') === filter
  })

  return (
    <div style={{ background: T.bg, minHeight: 'calc(100vh - 64px)', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.indigo, fontFamily: T.bodyFont, marginBottom: 6 }}>
            Session History
          </div>
          <h1 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 'clamp(26px, 3.4vw, 34px)', color: T.heading, letterSpacing: -0.5, margin: '0 0 6px' }}>
            Review your practice
          </h1>
          <p style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.body, margin: 0, lineHeight: 1.5 }}>
            Expand any session to see skill-level feedback.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['All', 'Lesson', 'Custom'] as FilterTab[]).map((t) => {
              const active = filter === t
              return (
                <button key={t} onClick={() => setFilter(t)} style={{
                  fontFamily: T.bodyFont, fontSize: 13, fontWeight: active ? 600 : 500,
                  padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                  border: active ? `1px solid ${T.border}` : '1px solid transparent',
                  background: active ? T.surface : 'transparent',
                  color: active ? T.heading : T.bodyLight,
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
                  transition: 'all 0.18s',
                }}>{t}</button>
              )
            })}
          </div>
          <span style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight }}>
            {filtered.length} session{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0,1,2,3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 70, borderRadius: T.radius, background: T.bgAlt }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: T.body, fontFamily: T.bodyFont }}>
            No sessions yet. Start a conversation to see history here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((s) => (
              <SessionRow key={s.id} session={s} expanded={expandedId === s.id}
                onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                onView={() => nav(`/history/${s.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionRow({ session, expanded, onToggle, onView }: {
  session: SessionListItem; expanded: boolean; onToggle: () => void; onView: () => void;
}) {
  const T = useTheme()
  const [h, setH] = useState(false)
  const isLesson = isLessonSession(session)
  const score = session.overallScore
  const tone = score == null ? T.bodyLight : score >= 85 ? T.green : score >= 70 ? T.orange : T.red

  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.surface, border: `1px solid ${h ? T.indigoMid : T.border}`,
        borderRadius: T.radius,
        boxShadow: h ? '0 6px 18px rgba(0,0,0,0.04)' : '0 1px 2px rgba(0,0,0,0.02)',
        transition: 'all 0.2s',
      }}>
      <div onClick={onToggle} style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
        cursor: 'pointer',
      }}>
        {/* Score chip */}
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: `${tone}1a`, color: tone,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.headingFont, fontWeight: 700, fontSize: 16,
        }}>
          {score ?? '—'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.headingFont, fontWeight: 600, fontSize: 15, color: T.heading,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.scenarioName}
          </div>
          <div style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.bodyLight, marginTop: 3, display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span>{formatDate(session.startedAt)}</span>
            <span>·</span>
            <span>{formatDuration(session.durationSecs)}</span>
            <span>·</span>
            <span style={{
              display: 'inline-block', fontSize: 10, fontWeight: 600, fontFamily: T.bodyFont,
              padding: '2px 8px', borderRadius: 6, letterSpacing: 0.2,
              color: isLesson ? T.indigo : T.orange,
              background: isLesson ? T.indigoLight : `${T.orange}1a`,
            }}>{isLesson ? 'Lesson' : 'Custom'}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 18, color: T.heading, lineHeight: 1 }}>
            {session.correctionCount ?? 0}
          </div>
          <div style={{ fontFamily: T.bodyFont, fontSize: 11, color: T.bodyLight, marginTop: 3 }}>corrections</div>
        </div>

        <div style={{ color: T.bodyLight, transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>
          <ChevronRight size={16} />
        </div>
      </div>

      {expanded && (
        <div style={{
          padding: '0 18px 16px', borderTop: `1px solid ${T.borderLight}`,
          fontFamily: T.bodyFont, fontSize: 13, color: T.body, lineHeight: 1.5,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, paddingTop: 12, marginBottom: 14 }}>
            <Skill T={T} label="Score" value={score != null ? `${score}/100` : 'Pending'} />
            <Skill T={T} label="Duration" value={formatDuration(session.durationSecs)} />
            <Skill T={T} label="Corrections" value={String(session.correctionCount ?? 0)} />
            <Skill T={T} label="Type" value={isLesson ? 'Lesson' : 'Custom'} />
          </div>
          <button onClick={(e) => { e.stopPropagation(); onView() }} style={{
            fontFamily: T.bodyFont, fontSize: 12, fontWeight: 600,
            border: `1px solid ${T.border}`, padding: '7px 14px', borderRadius: 8,
            cursor: 'pointer', background: T.surface, color: T.heading,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.bgAlt)}
          onMouseLeave={(e) => (e.currentTarget.style.background = T.surface)}>
            View transcript <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>
      )}
    </div>
  )
}

function Skill({ T, label, value }: { T: ReturnType<typeof useTheme>; label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: T.bodyLight, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 14, color: T.heading, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  )
}
