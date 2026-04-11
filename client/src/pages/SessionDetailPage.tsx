import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Clock, MessageSquare, Star, Sparkles, AlertTriangle, BookOpen, Lightbulb, Trash2, Loader2 } from 'lucide-react'
import { fetchSession, generateSummary, deleteSession, fetchDifficultyRecommendation } from '@/lib/api'
import { LevelRecommendation } from '@/components/ui/LevelRecommendation'
import type { SessionDetail, FeedbackData, DifficultyRecommendation } from '@/lib/types'

function formatDuration(secs: number | null): string {
  if (!secs) return '--'
  const mins = Math.floor(secs / 60)
  const s = secs % 60
  if (mins === 0) return `${s}s`
  return `${mins}m ${s}s`
}

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [recommendation, setRecommendation] = useState<DifficultyRecommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingSummary, setGeneratingSummary] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchDifficultyRecommendation().then(setRecommendation).catch(() => {})
    fetchSession(id)
      .then((data) => setSession(data.session))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleGenerateSummary = async () => {
    if (!id) return
    setGeneratingSummary(true)
    try {
      const { summary } = await generateSummary(id)
      setSession((prev) => prev ? { ...prev, summary } : prev)
    } catch {
      console.error('Failed to generate summary')
    } finally {
      setGeneratingSummary(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Delete this conversation?')) return
    await deleteSession(id)
    navigate('/history')
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-surface gap-4">
        <p className="text-neutral-400 font-body">Session not found</p>
        <Link to="/history" className="text-primary-500 font-heading font-semibold text-sm hover:underline">Back to History</Link>
      </div>
    )
  }

  const summary = session.summary

  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
        {/* Back + Actions */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <Link to="/history" className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 font-heading transition-colors">
            <ArrowLeft className="w-4 h-4" /> History
          </Link>
          <button onClick={handleDelete} className="text-neutral-300 hover:text-red-400 transition-colors cursor-pointer" title="Delete session">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Session Header */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <h1 className="font-heading font-extrabold text-neutral-800 text-xl mb-2">{session.scenarioName}</h1>
          <div className="flex items-center gap-4 text-xs text-neutral-400 font-body">
            <span>{new Date(session.startedAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(session.durationSecs)}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {session.messageCount} messages</span>
          </div>
        </div>

        {/* Summary Card */}
        {summary ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <h2 className="font-heading font-bold text-neutral-700 text-sm">Session Summary</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-heading font-extrabold text-neutral-800 text-lg">{summary.overallScore}</span>
                <span className="text-xs text-neutral-400 font-body">/10</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Fluency */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <p className="text-xs font-heading font-semibold text-neutral-600">Fluency</p>
                </div>
                <p className="text-sm text-neutral-500 font-body leading-relaxed">{summary.fluencyAssessment}</p>
              </div>

              {/* Grammar */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-green-400" />
                  <p className="text-xs font-heading font-semibold text-neutral-600">Grammar</p>
                </div>
                <p className="text-sm text-neutral-500 font-body leading-relaxed">{summary.grammarSummary}</p>
              </div>

              {/* Vocabulary Highlights */}
              {summary.vocabHighlights.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <p className="text-xs font-heading font-semibold text-neutral-600">Good Vocabulary</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summary.vocabHighlights.map((word) => (
                      <span key={word} className="text-xs font-body bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full border border-purple-100">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas to Improve */}
              {summary.areasToImprove.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-xs font-heading font-semibold text-neutral-600">Areas to Improve</p>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {summary.areasToImprove.map((area) => (
                      <li key={area} className="text-sm text-neutral-500 font-body flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-300 rounded-full mt-1.5 shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Encouragement */}
              <div className="bg-primary-50 rounded-xl p-3 border border-primary-100">
                <p className="text-sm text-primary-700 font-body leading-relaxed">{summary.encouragement}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-6 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Sparkles className="w-8 h-8 text-primary-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-body mb-3">No summary generated yet</p>
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-xl font-heading font-semibold text-sm hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              {generatingSummary ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate Summary'}
            </button>
          </div>
        )}

        {/* Level Recommendation */}
        {recommendation?.shouldShow && (
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
            <LevelRecommendation recommendation={recommendation} compact />
          </div>
        )}

        {/* Transcript */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-primary-500" />
            <h2 className="font-heading font-bold text-neutral-700 text-sm">Conversation</h2>
          </div>

          <div className="flex flex-col gap-3">
            {session.messages.map((msg) => {
              const isUser = msg.role === 'user'
              const feedback = msg.feedback as FeedbackData | null
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-3 text-[15px] leading-relaxed font-body ${
                      isUser
                        ? 'bg-primary-100 text-neutral-700 rounded-2xl rounded-br-md'
                        : 'bg-white text-neutral-600 rounded-2xl rounded-bl-md shadow-sm border border-neutral-100'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">A</span>
                        </div>
                        <span className="text-xs font-heading font-semibold text-primary-600">Aria</span>
                      </div>
                    )}
                    {msg.content}
                  </div>
                  {feedback?.show && (
                    <div className="mt-1.5 max-w-[80%] bg-accent-50 border border-accent-100 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-3 h-3 text-accent-500" />
                        <span className="text-[10px] font-heading font-semibold text-accent-600">Tip</span>
                      </div>
                      <p className="text-xs text-neutral-500 font-body">
                        <span className="line-through text-neutral-400">{feedback.original}</span>
                        {' → '}
                        <span className="text-primary-600 font-semibold">{feedback.improved}</span>
                      </p>
                      <p className="text-[11px] text-neutral-400 font-body mt-1">{feedback.tip}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
