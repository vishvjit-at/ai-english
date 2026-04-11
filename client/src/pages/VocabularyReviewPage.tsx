import { useState } from 'react'
import { BookOpen, Send, Check, X, ArrowRight, RotateCcw, Sparkles } from 'lucide-react'
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
    <div className="h-full overflow-y-auto bg-surface">
      <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-neutral-800 text-xl">Vocabulary Review</h1>
            <p className="text-xs text-neutral-400 font-body">Practice using your saved words</p>
          </div>
        </div>

        {/* Idle / Start */}
        {phase === 'idle' && (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-purple-50 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-purple-300" />
            </div>
            {loading ? (
              <div className="w-8 h-8 mx-auto border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            ) : (
              <>
                <h2 className="font-heading font-bold text-neutral-600 text-lg mb-2">Ready to review?</h2>
                <p className="text-sm text-neutral-400 font-body mb-6">
                  Use your saved vocabulary words in sentences. Aria will evaluate your usage.
                </p>
                <button
                  onClick={() => startReview(10)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-purple-400 to-purple-500 text-white rounded-xl font-heading font-semibold text-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Start Review
                </button>
              </>
            )}
          </div>
        )}

        {/* Reviewing / Evaluated */}
        {(phase === 'reviewing' || phase === 'evaluated') && currentWord && (
          <div className="animate-fade-in-up">
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-heading font-semibold text-neutral-400">
                {progress.current} / {progress.total}
              </span>
              <span className="text-xs text-neutral-300 font-body">
                {correctCount} correct
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-purple-400 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>

            {/* Word card */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center mb-6">
              <p className="text-[10px] font-heading font-semibold text-purple-400 uppercase tracking-widest mb-3">
                Use this word in a sentence
              </p>
              <p className="font-heading font-extrabold text-neutral-800 text-3xl mb-1">
                {currentWord.word}
              </p>
              {currentWord.mastered && (
                <span className="text-[10px] font-heading text-green-500 bg-green-50 px-2 py-0.5 rounded-full">mastered</span>
              )}
            </div>

            {/* Input or evaluation */}
            {phase === 'reviewing' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a sentence using this word..."
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={evaluating}
                  className="flex-1 text-sm font-body bg-white border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-300/50 focus:border-purple-300 transition-all placeholder:text-neutral-300"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  disabled={!sentence.trim() || evaluating}
                  className="w-[42px] h-[42px] flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-500 text-white rounded-xl shadow-sm hover:shadow-md disabled:from-neutral-200 disabled:to-neutral-200 disabled:shadow-none disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {evaluating ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {phase === 'evaluated' && currentEval && (
              <div className="animate-fade-in-up">
                <div className={`rounded-2xl border p-5 mb-4 ${currentEval.correct ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {currentEval.correct ? (
                      <><Check className="w-5 h-5 text-green-500" /><span className="font-heading font-bold text-green-700 text-sm">Correct!</span></>
                    ) : (
                      <><X className="w-5 h-5 text-amber-500" /><span className="font-heading font-bold text-amber-700 text-sm">Not quite</span></>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 font-body mb-3">{currentEval.feedback}</p>
                  <div className="bg-white/60 rounded-xl px-3 py-2">
                    <p className="text-[10px] font-heading font-semibold text-neutral-400 uppercase mb-1">Example</p>
                    <p className="text-sm text-neutral-600 font-body italic">{currentEval.exampleSentence}</p>
                  </div>
                </div>
                <button
                  onClick={nextWord}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-neutral-200 rounded-xl font-heading font-semibold text-sm text-neutral-600 hover:border-primary-200 hover:shadow-sm transition-all cursor-pointer"
                >
                  {progress.current >= progress.total ? 'See Results' : 'Next Word'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Done / Results */}
        {phase === 'done' && (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-primary-100 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-purple-500" />
              </div>
              <h2 className="font-heading font-extrabold text-neutral-800 text-xl mb-2">Review Complete!</h2>
              <p className="text-sm text-neutral-400 font-body mb-4">
                You got <span className="font-semibold text-primary-600">{correctCount}</span> out of <span className="font-semibold">{results.length}</span> correct
              </p>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-primary-400 rounded-full"
                  style={{ width: `${results.length ? (correctCount / results.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Results list */}
            <div className="flex flex-col gap-2 mb-6">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-neutral-100 px-4 py-3">
                  {r.evaluation.correct ? (
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-heading font-semibold text-neutral-700">{r.word}</p>
                    <p className="text-xs text-neutral-400 font-body truncate">{r.sentence}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => startReview(10)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-purple-400 to-purple-500 text-white rounded-xl font-heading font-semibold text-sm hover:shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Review Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
