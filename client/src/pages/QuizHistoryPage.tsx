import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { fetchQuizHistory, type QuizAttemptHistory } from '@/lib/api'
import { useTheme } from '@/lib/speakup-theme'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function QuizHistoryPage() {
  const T = useTheme()
  const [attempts, setAttempts] = useState<QuizAttemptHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizHistory().then((d) => setAttempts(d.attempts)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: T.bg, minHeight: 'calc(100vh - 64px)', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
        <Link to="/quiz" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: T.bodyFont, fontSize: 14, color: T.body,
          textDecoration: 'none', marginBottom: 20,
        }}><ArrowLeft size={14} /> Back to quizzes</Link>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: T.indigo, fontFamily: T.bodyFont, marginBottom: 8 }}>
            Quiz History
          </div>
          <h1 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 'clamp(26px, 4vw, 36px)', color: T.heading, letterSpacing: -0.5, margin: '0 0 8px' }}>
            Your past quizzes
          </h1>
          <p style={{ fontFamily: T.bodyFont, fontSize: 16, color: T.body, margin: 0, lineHeight: 1.5 }}>
            See how you've done module-by-module.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0,1,2,3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 78, borderRadius: T.radius, background: T.bgAlt }} />
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
            padding: 60, textAlign: 'center', color: T.body, fontFamily: T.bodyFont,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            No quiz attempts yet. <Link to="/quiz" style={{ color: T.indigo, fontWeight: 600 }}>Take your first quiz →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {attempts.map((a) => {
              const pct = a.total ? Math.round((a.score / a.total) * 100) : 0
              const tone = pct >= 80 ? T.green : pct >= 50 ? T.orange : T.red
              return (
                <div key={a.id} style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: T.radius, padding: '18px 24px',
                  display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  boxShadow: T.shadow,
                }}>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: T.headingFont, fontWeight: 600, fontSize: 16, color: T.heading }}>
                        {a.moduleLabel}
                      </span>
                      <span style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 600, fontFamily: T.bodyFont,
                        padding: '3px 10px', borderRadius: 100, letterSpacing: 0.5, textTransform: 'uppercase',
                        color: a.mode === 'daily' ? T.orange : T.indigo,
                        background: a.mode === 'daily' ? `${T.orange}20` : T.indigoLight,
                      }}>{a.mode === 'daily' ? 'Daily' : 'Module'}</span>
                    </div>
                    <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight }}>
                      {formatDate(a.finishedAt)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 24, color: tone }}>
                      {a.score}/{a.total}
                    </div>
                    <div style={{ fontFamily: T.bodyFont, fontSize: 11, color: T.bodyLight }}>{pct}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
