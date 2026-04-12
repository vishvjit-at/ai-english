import { useState } from 'react'
import { BookOpen, Send, Check, X, ArrowRight, RotateCcw, Sparkles, Brain, History } from 'lucide-react'
import { useVocabReview } from '@/hooks/useVocabReview'

export function VocabularyReviewPage() {
  const {
    phase, loading, evaluating, currentWord, currentEval,
    progress, results, correctCount, startReview, submitSentence, nextWord,
  } = useVocabReview()
  const [sentence, setSentence] = useState('')

  const handleSubmit = async () => {
    if (!sentence.trim()) return
    await submitSentence(sentence.trim())
    setSentence('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  return (
    <div className="h-full overflow-y-auto bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-neutral-900">Review Session</h1>
          <p className="text-neutral-500 text-sm">Topic: Business & Professionalism</p>
        </div>

        {/* Progress bar */}
        {(phase === 'reviewing' || phase === 'evaluated') && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">{progress.current}/{progress.total} Words</span>
              <span className="text-sm text-neutral-500">{correctCount} correct</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Idle / Start */}
        {phase === 'idle' && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-primary-50 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary-400" />
            </div>
            {loading ? (
              <div className="w-8 h-8 mx-auto border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            ) : (
              <>
                <h2 className="font-bold text-neutral-700 text-xl mb-2">Ready to review?</h2>
                <p className="text-sm text-neutral-400 mb-8 max-w-sm mx-auto">
                  Use your saved vocabulary words in sentences. Aria will evaluate your usage.
                </p>
                <button
                  onClick={() => startReview(10)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Start Review
                </button>
              </>
            )}
          </div>
        )}

        {/* Reviewing / Evaluated */}
        {(phase === 'reviewing' || phase === 'evaluated') && currentWord && (
          <div>
            {/* Word card */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-12 text-center mb-6">
              <p className="text-xs tracking-[0.2em] text-primary-600 font-semibold mb-4 uppercase">Current Focus</p>
              <p className="text-6xl font-bold text-neutral-900 mb-4">{currentWord.word}</p>
              {currentWord.mastered && (
                <span className="text-xs text-primary-600 bg-primary-50 px-3 py-1 rounded-full font-medium">mastered</span>
              )}
              {currentWord.definition && (
                <p className="text-neutral-500 text-lg max-w-md mx-auto mt-4">{currentWord.definition}</p>
              )}
            </div>

            {/* Evaluated result */}
            {phase === 'evaluated' && currentEval && (
              <div className={`rounded-xl border p-4 mb-4 ${currentEval.correct ? 'bg-primary-50 border-primary-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {currentEval.correct ? (
                    <><Check className="w-5 h-5 text-primary-500" /><span className="font-semibold text-primary-700 text-sm">Correct!</span></>
                  ) : (
                    <><X className="w-5 h-5 text-amber-500" /><span className="font-semibold text-amber-700 text-sm">Not quite</span></>
                  )}
                </div>
                <p className="text-sm text-neutral-600 mb-3">{currentEval.feedback}</p>
                <div className="bg-white/60 rounded-xl px-3 py-2">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase mb-1">Example</p>
                  <p className="text-sm text-neutral-600 italic">{currentEval.exampleSentence}</p>
                </div>
              </div>
            )}

            {/* Input */}
            {phase === 'reviewing' && (
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Type a sentence using this word..."
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={evaluating}
                  className="flex-1 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-neutral-400"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  disabled={!sentence.trim() || evaluating}
                  className="w-[46px] h-[46px] flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {evaluating ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {phase === 'evaluated' && (
              <button
                onClick={nextWord}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl font-semibold text-sm text-neutral-700 transition-colors cursor-pointer mb-6"
              >
                {progress.current >= progress.total ? 'See Results' : 'Next Word'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Memory Tip + Review History */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <Brain className="w-5 h-5 text-primary-600 mb-2" />
                <p className="font-semibold text-neutral-900 text-sm mb-1">Memory Tip</p>
                <p className="text-neutral-500 text-xs">Try to use new words in at least 3 different sentences to reinforce memory.</p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <History className="w-5 h-5 text-primary-600 mb-2" />
                <p className="font-semibold text-neutral-900 text-sm mb-1">Review History</p>
                <p className="text-neutral-500 text-xs">{correctCount} correct out of {progress.current} attempted so far.</p>
              </div>
            </div>
          </div>
        )}

        {/* Done / Results */}
        {phase === 'done' && (
          <div>
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-12 text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="font-bold text-neutral-900 text-2xl mb-2">Review Complete!</h2>
              <p className="text-neutral-400 text-sm mb-6">
                You got <span className="font-semibold text-primary-600">{correctCount}</span> out of <span className="font-semibold">{results.length}</span> correct
              </p>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${results.length ? (correctCount / results.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Results list */}
            <div className="flex flex-col gap-2 mb-6">
              {results.map((r, i) => (
                <div key={i} className="bg-white rounded-xl border border-neutral-100 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-neutral-700">{r.word}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.evaluation.correct ? 'bg-primary-50 text-primary-600' : 'bg-amber-50 text-amber-600'}`}>
                      {r.evaluation.correct ? 'EXCELLENT' : 'NEEDS WORK'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 italic truncate">"{r.sentence}"</p>
                  {r.evaluation.feedback && (
                    <p className="text-primary-700 text-sm mt-2">Aria's Feedback: {r.evaluation.feedback.slice(0, 80)}...</p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => startReview(10)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Review Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
