import { useState } from 'react'
import { Send, Check, X, ArrowRight, RotateCcw, Sparkles } from 'lucide-react'
import { useVocabReview } from '@/hooks/useVocabReview'
import { useTheme } from '@/lib/speakup-theme'

type ViewMode = 'list' | 'flashcard'

export function VocabularyReviewPage() {
  const T = useTheme()
  const {
    phase, loading, evaluating, currentWord, currentEval,
    progress, results, correctCount, startReview, submitSentence, nextWord,
  } = useVocabReview()

  const [sentence, setSentence] = useState('')
  const [view, setView] = useState<ViewMode>('list')
  const [known, setKnown] = useState<Set<string>>(new Set())

  const handleSubmit = async () => {
    if (!sentence.trim()) return
    await submitSentence(sentence.trim())
    setSentence('')
  }
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const masteredCount = results.filter((r) => r.evaluation.correct).length + known.size
  const totalCount = progress.total || results.length

  return (
    <div style={{ background: T.bg, minHeight: 'calc(100vh - 64px)', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>

        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.indigo, fontFamily: T.bodyFont, marginBottom: 6 }}>
              Vocabulary
            </div>
            <h1 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 'clamp(26px, 3.4vw, 34px)', color: T.heading, letterSpacing: -0.5, margin: '0 0 6px' }}>
              Words from your sessions
            </h1>
            <p style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.body, margin: 0, lineHeight: 1.5 }}>
              Review vocabulary your AI coach flagged during conversations.
            </p>
          </div>
          {phase !== 'idle' && phase !== 'done' && (
            <div style={{ display: 'flex', gap: 4, padding: 4, background: T.bgAlt, borderRadius: 10, border: `1px solid ${T.border}` }}>
              {(['list','flashcard'] as ViewMode[]).map((m) => (
                <button key={m} onClick={() => setView(m)} style={{
                  padding: '6px 14px', borderRadius: 7, cursor: 'pointer', border: 'none',
                  background: view === m ? T.surface : 'transparent',
                  color: view === m ? T.heading : T.bodyLight,
                  boxShadow: view === m ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  fontFamily: T.bodyFont, fontSize: 12, fontWeight: 600,
                  transition: 'all 0.15s',
                }}>{m === 'list' ? 'List' : 'Cards'}</button>
              ))}
            </div>
          )}
        </div>

        {totalCount > 0 && phase !== 'idle' && (
          <div style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.bodyLight, marginBottom: 20 }}>
            {masteredCount} of {totalCount} words mastered
            <div style={{ height: 8, borderRadius: 4, background: T.bgAlt, overflow: 'hidden', width: '100%', marginTop: 8 }}>
              <div style={{ height: '100%', width: `${totalCount ? (masteredCount / totalCount) * 100 : 0}%`, borderRadius: 4, background: T.green, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}

        {/* IDLE */}
        {phase === 'idle' && (
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
            padding: 60, textAlign: 'center', boxShadow: T.shadow,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            {loading ? (
              <div style={{ display: 'inline-block', width: 32, height: 32, border: `3px solid ${T.border}`, borderTopColor: T.indigo, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <>
                <h2 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 24, color: T.heading, margin: '0 0 8px' }}>
                  Ready to review?
                </h2>
                <p style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.body, margin: '0 0 24px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                  Use your saved vocabulary words in sentences. Aria will evaluate your usage.
                </p>
                <button onClick={() => startReview(10)} style={{
                  fontFamily: T.bodyFont, fontSize: 15, fontWeight: 600, border: 'none',
                  padding: '12px 28px', borderRadius: T.radiusSm, cursor: 'pointer',
                  background: T.indigo, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.25s',
                }}>
                  <Sparkles size={16} /> Start Review
                </button>
              </>
            )}
          </div>
        )}

        {/* FLASHCARD */}
        {view === 'flashcard' && (phase === 'reviewing' || phase === 'evaluated') && currentWord && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 12 }}>
            <div style={{
              width: '100%', maxWidth: 480, minHeight: 240,
              background: `linear-gradient(135deg, ${T.indigo}, oklch(0.45 0.22 275))`,
              borderRadius: 20, padding: 36, textAlign: 'center', color: '#fff',
              boxShadow: '0 12px 40px oklch(0.55 0.22 275 / 0.25)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.7, marginBottom: 12 }}>
                {progress.current}/{progress.total}
              </div>
              <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 40 }}>
                {currentWord.word}
              </div>
              {currentWord.definition && (
                <div style={{ fontFamily: T.bodyFont, fontSize: 15, opacity: 0.85, marginTop: 12, maxWidth: 380 }}>
                  {currentWord.definition}
                </div>
              )}
            </div>

            {phase === 'evaluated' && currentEval && (
              <FeedbackPanel correct={currentEval.correct} feedback={currentEval.feedback} example={currentEval.exampleSentence} />
            )}

            {phase === 'reviewing' && (
              <SentenceInput
                value={sentence}
                onChange={setSentence}
                onKeyDown={handleKey}
                onSubmit={handleSubmit}
                disabled={evaluating}
                evaluating={evaluating}
              />
            )}

            {phase === 'evaluated' && (
              <button onClick={nextWord} style={{
                fontFamily: T.bodyFont, fontSize: 15, fontWeight: 600, border: 'none',
                padding: '12px 28px', borderRadius: T.radiusSm, cursor: 'pointer',
                background: T.indigo, color: '#fff',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'all 0.25s',
              }}>
                {progress.current >= progress.total ? 'See Results' : 'Next Word'} <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        {/* LIST view during review */}
        {view === 'list' && (phase === 'reviewing' || phase === 'evaluated') && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: T.bodyFont, fontSize: 14, fontWeight: 600, color: T.heading }}>
                {progress.current}/{progress.total} Words
              </span>
              <span style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.bodyLight }}>{correctCount} correct</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {currentWord && results.length === 0 && (
                <WordRow word={currentWord.word} definition={currentWord.definition || ''} active />
              )}
              {results.map((r, i) => (
                <WordRow key={i} word={r.word}
                  definition={r.evaluation.feedback || ''}
                  example={r.sentence}
                  correct={r.evaluation.correct}
                  isKnown={known.has(r.word)}
                  onToggleKnown={() => {
                    setKnown((prev) => {
                      const next = new Set(prev)
                      next.has(r.word) ? next.delete(r.word) : next.add(r.word)
                      return next
                    })
                  }}
                />
              ))}
            </div>

            {phase === 'reviewing' && currentWord && (
              <div>
                <p style={{ fontFamily: T.bodyFont, fontSize: 14, fontWeight: 600, color: T.heading, marginBottom: 8 }}>
                  Use <span style={{ color: T.indigo }}>"{currentWord.word}"</span> in a sentence:
                </p>
                <SentenceInput
                  value={sentence}
                  onChange={setSentence}
                  onKeyDown={handleKey}
                  onSubmit={handleSubmit}
                  disabled={evaluating}
                  evaluating={evaluating}
                />
              </div>
            )}
            {phase === 'evaluated' && (
              <button onClick={nextWord} style={{
                fontFamily: T.bodyFont, fontSize: 15, fontWeight: 600, border: 'none',
                padding: '12px 28px', borderRadius: T.radiusSm, cursor: 'pointer', marginTop: 12,
                background: T.indigo, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                {progress.current >= progress.total ? 'See Results' : 'Next Word'} <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        {/* DONE */}
        {phase === 'done' && (
          <div>
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
              padding: 40, textAlign: 'center', marginBottom: 24, boxShadow: T.shadow,
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h2 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 28, color: T.heading, margin: '0 0 8px' }}>
                Review Complete!
              </h2>
              <p style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.body, margin: '0 0 16px' }}>
                You got <span style={{ color: T.indigo, fontWeight: 700 }}>{correctCount}</span> out of <span style={{ fontWeight: 700, color: T.heading }}>{results.length}</span> correct
              </p>
              <div style={{ height: 8, borderRadius: 4, background: T.bgAlt, overflow: 'hidden', width: '100%' }}>
                <div style={{ height: '100%', width: `${results.length ? (correctCount / results.length) * 100 : 0}%`, borderRadius: 4, background: T.green, transition: 'width 0.5s ease' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {results.map((r, i) => (
                <WordRow key={i} word={r.word} definition={r.evaluation.feedback || ''} example={r.sentence} correct={r.evaluation.correct} />
              ))}
            </div>

            <button onClick={() => startReview(10)} style={{
              fontFamily: T.bodyFont, fontSize: 15, fontWeight: 600, border: 'none',
              padding: '12px 28px', borderRadius: T.radiusSm, cursor: 'pointer',
              background: T.indigo, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <RotateCcw size={16} /> Review Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function FeedbackPanel({ correct, feedback, example }: { correct: boolean; feedback: string; example: string }) {
  const T = useTheme()
  return (
    <div style={{
      width: '100%', maxWidth: 480,
      background: correct ? `${T.green}15` : `${T.orange}15`,
      border: `1px solid ${correct ? T.green : T.orange}`,
      borderRadius: T.radius, padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {correct ? <Check size={18} color={T.green} /> : <X size={18} color={T.orange} />}
        <span style={{ fontFamily: T.headingFont, fontWeight: 700, color: correct ? T.green : T.orange }}>
          {correct ? 'Correct!' : 'Not quite'}
        </span>
      </div>
      <p style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.body, margin: '0 0 8px', lineHeight: 1.5 }}>{feedback}</p>
      <p style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight, fontStyle: 'italic', margin: 0 }}>{example}</p>
    </div>
  )
}

function SentenceInput({ value, onChange, onKeyDown, onSubmit, disabled, evaluating }: {
  value: string; onChange: (v: string) => void; onKeyDown: (e: React.KeyboardEvent) => void;
  onSubmit: () => void; disabled: boolean; evaluating: boolean;
}) {
  const T = useTheme()
  return (
    <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 600 }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder="Type a sentence using this word..."
        autoFocus
        style={{
          flex: 1, padding: '12px 16px', borderRadius: T.radiusSm,
          border: `1px solid ${T.border}`, fontFamily: T.bodyFont, fontSize: 15,
          outline: 'none', background: T.surface, color: T.heading,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = T.indigo)}
        onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
      />
      <button onClick={onSubmit} disabled={!value.trim() || disabled}
        style={{
          width: 50, height: 50, borderRadius: T.radiusSm, border: 'none',
          background: T.indigo, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: !value.trim() || disabled ? 0.5 : 1,
        }}>
        {evaluating ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} /> : <Send size={16} />}
      </button>
    </div>
  )
}

function WordRow({ word, definition, example, correct, active, isKnown, onToggleKnown }: {
  word: string; definition: string; example?: string; correct?: boolean;
  active?: boolean; isKnown?: boolean; onToggleKnown?: () => void;
}) {
  const T = useTheme()
  const tag = active ? 'CURRENT' : correct === true ? 'EXCELLENT' : correct === false ? 'NEEDS WORK' : 'PROFESSIONAL'
  const tagColor = active ? T.indigo : correct === true ? T.green : correct === false ? T.orange : T.indigo

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: T.radius, padding: '16px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 18, color: T.heading }}>{word}</span>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 600, fontFamily: T.bodyFont,
              padding: '3px 10px', borderRadius: 100, letterSpacing: 0.5, textTransform: 'uppercase',
              color: tagColor, background: `${tagColor}20`,
            }}>{tag}</span>
          </div>
          {definition && <div style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.body, marginBottom: 4 }}>{definition}</div>}
          {example && <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight, fontStyle: 'italic' }}>"{example}"</div>}
        </div>
        {onToggleKnown && (
          <button onClick={onToggleKnown} style={{
            padding: '6px 14px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
            border: `1px solid ${isKnown ? T.green : T.border}`,
            background: 'transparent',
            color: isKnown ? T.green : T.bodyLight,
            fontFamily: T.bodyFont, fontSize: 12, fontWeight: 600,
            transition: 'all 0.18s',
          }}>{isKnown ? '✓ Known' : 'Mark known'}</button>
        )}
      </div>
    </div>
  )
}
