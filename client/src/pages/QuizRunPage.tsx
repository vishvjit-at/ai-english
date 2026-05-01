import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Check, X, RotateCcw } from 'lucide-react'
import { startQuiz, submitQuiz, type QuizQuestionPublic, type QuizResultRow } from '@/lib/api'
import { useTheme } from '@/lib/speakup-theme'

type Phase = 'loading' | 'playing' | 'submitting' | 'done' | 'error'

export function QuizRunPage() {
  const T = useTheme()
  const nav = useNavigate()
  const { module = 'daily' } = useParams<{ module: string }>()

  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState('')
  const [attemptId, setAttemptId] = useState('')
  const [questions, setQuestions] = useState<QuizQuestionPublic[]>([])
  const [idx, setIdx] = useState(0)
  const [chosen, setChosen] = useState<Record<string, number>>({})
  const [results, setResults] = useState<QuizResultRow[]>([])
  const [score, setScore] = useState(0)

  useEffect(() => {
    let cancelled = false
    setPhase('loading')
    startQuiz(module)
      .then((d) => {
        if (cancelled) return
        setAttemptId(d.attemptId)
        setQuestions(d.questions)
        setIdx(0)
        setChosen({})
        setPhase('playing')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not start quiz')
        setPhase('error')
      })
    return () => { cancelled = true }
  }, [module])

  const current = questions[idx]
  const allAnswered = questions.length > 0 && questions.every((q) => chosen[q.id] != null)

  const choose = (questionId: string, chosenIdx: number) => {
    setChosen((prev) => ({ ...prev, [questionId]: chosenIdx }))
  }
  const next = () => setIdx((i) => Math.min(questions.length - 1, i + 1))
  const prev = () => setIdx((i) => Math.max(0, i - 1))

  const submit = async () => {
    setPhase('submitting')
    try {
      const answers = questions.map((q) => ({ questionId: q.id, chosenIdx: chosen[q.id] ?? -1 }))
      const r = await submitQuiz(attemptId, answers)
      setResults(r.results)
      setScore(r.score)
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit')
      setPhase('error')
    }
  }

  return (
    <div style={{ background: T.bg, minHeight: 'calc(100vh - 64px)', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link to="/quiz" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: T.bodyFont, fontSize: 14, color: T.body,
          textDecoration: 'none', marginBottom: 20,
        }}><ArrowLeft size={14} /> Back to quizzes</Link>

        {phase === 'loading' && <CenterMsg text="Generating fresh questions for you…" spinner />}
        {phase === 'error' && (
          <CenterMsg text={error}>
            <button onClick={() => nav('/quiz')} style={btnPrimary(T)}>Back</button>
          </CenterMsg>
        )}

        {(phase === 'playing' || phase === 'submitting') && current && (
          <div>
            <ProgressHeader idx={idx} total={questions.length} answered={Object.keys(chosen).length} />

            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: T.radius, padding: 28, marginBottom: 16, boxShadow: T.shadow,
            }}>
              <div style={{ fontFamily: T.bodyFont, fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: T.indigo, marginBottom: 10 }}>
                Question {idx + 1} of {questions.length}
              </div>
              <h2 style={{ fontFamily: T.headingFont, fontWeight: 600, fontSize: 22, color: T.heading, margin: '0 0 24px', lineHeight: 1.4 }}>
                {current.prompt}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {current.options.map((opt, i) => {
                  const active = chosen[current.id] === i
                  return (
                    <OptionBtn key={i} text={opt} index={i} active={active}
                      onClick={() => choose(current.id, i)} />
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={prev} disabled={idx === 0} style={btnSecondary(T, idx === 0)}>← Previous</button>
              {idx < questions.length - 1 ? (
                <button onClick={next} disabled={chosen[current.id] == null} style={btnPrimary(T, chosen[current.id] == null)}>
                  Next →
                </button>
              ) : (
                <button onClick={submit} disabled={!allAnswered || phase === 'submitting'} style={btnPrimary(T, !allAnswered || phase === 'submitting')}>
                  {phase === 'submitting' ? 'Submitting…' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <ResultsView score={score} total={questions.length} results={results}
            onRetry={() => nav('/quiz')}
            onAnother={() => { setIdx(0); setChosen({}); setResults([]); window.location.reload() }}
          />
        )}
      </div>
    </div>
  )
}

function ProgressHeader({ idx, total, answered }: { idx: number; total: number; answered: number }) {
  const T = useTheme()
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.body }}>
          Question {idx + 1} / {total}
        </span>
        <span style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight }}>
          {answered} answered
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: T.bgAlt, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(answered / total) * 100}%`, background: T.indigo, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function OptionBtn({ text, index, active, onClick }: { text: string; index: number; active: boolean; onClick: () => void }) {
  const T = useTheme()
  const [h, setH] = useState(false)
  const letters = ['A', 'B', 'C', 'D']
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        textAlign: 'left', padding: '14px 18px',
        borderRadius: 12, cursor: 'pointer',
        border: active ? `2px solid ${T.indigo}` : `1px solid ${T.border}`,
        background: active ? T.indigoLight : (h ? T.bgAlt : T.surface),
        color: T.heading, fontFamily: T.bodyFont, fontSize: 15,
        display: 'flex', alignItems: 'center', gap: 14,
        transition: 'all 0.18s', width: '100%',
      }}>
      <span style={{
        width: 30, height: 30, borderRadius: 8,
        background: active ? T.indigo : T.bgAlt,
        color: active ? '#fff' : T.body,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 13, flexShrink: 0, fontFamily: T.headingFont,
      }}>{letters[index]}</span>
      <span style={{ flex: 1 }}>{text}</span>
    </button>
  )
}

function ResultsView({ score, total, results, onRetry, onAnother }: {
  score: number; total: number; results: QuizResultRow[]; onRetry: () => void; onAnother: () => void;
}) {
  const T = useTheme()
  const pct = total ? Math.round((score / total) * 100) : 0
  return (
    <div>
      <div style={{
        background: T.gradientDeep, borderRadius: 24, padding: 'clamp(28px, 4vw, 44px)',
        color: '#fff', textAlign: 'center', marginBottom: 24,
        boxShadow: '0 20px 60px oklch(0.55 0.22 275 / 0.25)',
      }}>
        <div style={{ fontSize: 46, marginBottom: 8 }}>
          {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
        </div>
        <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 38, marginBottom: 4 }}>
          {score} / {total}
        </div>
        <div style={{ fontFamily: T.bodyFont, fontSize: 15, opacity: 0.85, marginBottom: 20 }}>
          {pct}% correct — {pct >= 80 ? 'great work!' : pct >= 50 ? 'solid effort' : 'keep practicing'}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onAnother} style={{
            fontFamily: T.bodyFont, fontSize: 14, fontWeight: 700,
            background: '#fff', color: 'oklch(0.45 0.22 275)',
            border: 'none', padding: '12px 24px', borderRadius: 12,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}><RotateCcw size={14} /> Another set</button>
          <button onClick={onRetry} style={{
            fontFamily: T.bodyFont, fontSize: 14, fontWeight: 600,
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.4)', padding: '12px 24px', borderRadius: 12,
            cursor: 'pointer',
          }}>Back to quizzes</button>
        </div>
      </div>

      <h3 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 18, color: T.heading, margin: '0 0 14px' }}>
        Review
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results.map((r, i) => (
          <div key={r.questionId} style={{
            background: T.surface, border: `1px solid ${r.correct ? T.green : T.red}40`,
            borderLeft: `4px solid ${r.correct ? T.green : T.red}`,
            borderRadius: T.radius, padding: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <span style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight, fontWeight: 600 }}>
                Q{i + 1}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
                color: r.correct ? T.green : T.red,
                fontFamily: T.bodyFont,
              }}>
                {r.correct ? <><Check size={14} /> Correct</> : <><X size={14} /> Wrong</>}
              </span>
            </div>
            <div style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.heading, lineHeight: 1.5, marginBottom: 12 }}>
              {r.prompt}
            </div>
            <div style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.body, marginBottom: 6 }}>
              <strong style={{ color: T.heading }}>Your answer:</strong>{' '}
              {r.chosenIdx >= 0 ? r.options[r.chosenIdx] : <em>skipped</em>}
            </div>
            {!r.correct && (
              <div style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.body, marginBottom: 6 }}>
                <strong style={{ color: T.green }}>Correct answer:</strong> {r.options[r.correctIdx]}
              </div>
            )}
            {r.explanation && (
              <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight, fontStyle: 'italic', marginTop: 8 }}>
                {r.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CenterMsg({ text, spinner, children }: { text: string; spinner?: boolean; children?: React.ReactNode }) {
  const T = useTheme()
  return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      {spinner && (
        <div style={{ display: 'inline-block', width: 32, height: 32, border: `3px solid ${T.border}`, borderTopColor: T.indigo, borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
      )}
      <div style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.body, marginBottom: 16 }}>{text}</div>
      {children}
    </div>
  )
}

const btnPrimary = (T: ReturnType<typeof useTheme>, disabled = false): React.CSSProperties => ({
  fontFamily: T.bodyFont, fontSize: 15, fontWeight: 600, border: 'none',
  padding: '12px 28px', borderRadius: 12, cursor: disabled ? 'not-allowed' : 'pointer',
  background: T.indigo, color: '#fff', opacity: disabled ? 0.5 : 1,
  transition: 'all 0.2s',
})
const btnSecondary = (T: ReturnType<typeof useTheme>, disabled = false): React.CSSProperties => ({
  fontFamily: T.bodyFont, fontSize: 15, fontWeight: 600,
  border: `1.5px solid ${T.border}`, padding: '12px 22px',
  borderRadius: 12, cursor: disabled ? 'not-allowed' : 'pointer',
  background: T.surface, color: T.heading, opacity: disabled ? 0.5 : 1,
  transition: 'all 0.2s',
})
