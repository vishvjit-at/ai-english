import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Clock, MessageSquare, Sparkles, AlertTriangle, BookOpen, Lightbulb, Trash2, Loader2, Download } from 'lucide-react'
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
      <div className="h-full flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-neutral-50 gap-4">
        <p className="text-neutral-400">Session not found</p>
        <Link to="/history" className="text-primary-600 font-semibold text-sm hover:underline">Back to History</Link>
      </div>
    )
  }

  const summary = session.summary

  return (
    <div className="h-full overflow-y-auto bg-neutral-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back + title + delete */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/history" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> History
          </Link>
          <button onClick={handleDelete} className="text-neutral-300 hover:text-red-500 transition-colors cursor-pointer p-2 rounded-lg hover:bg-red-50" title="Delete session">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">{session.scenarioName}</h1>
        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-8">
          <span>{new Date(session.startedAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDuration(session.durationSecs)}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {session.messageCount} messages</span>
        </div>

        {/* Summary section */}
        {summary ? (
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Score circle card */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full border-4 border-primary-500 flex items-center justify-center mb-3">
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary-600">{summary.overallScore}</span>
                  <span className="text-lg text-neutral-400">/10</span>
                </div>
              </div>
              <p className="font-semibold text-neutral-900">Great Progress!</p>
              <p className="text-neutral-500 text-sm mt-1 text-center">{session.scenarioName}</p>
            </div>

            {/* Fluency card */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <p className="font-semibold text-neutral-900 mb-4">Fluency Assessment</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600">Fluency</span>
                    <span className="text-neutral-500 text-xs truncate max-w-[120px]">{summary.fluencyAssessment?.slice(0, 30)}...</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (summary.overallScore / 10) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600">Grammar</span>
                    <span className="text-neutral-500 text-xs truncate max-w-[120px]">{summary.grammarSummary?.slice(0, 30)}...</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (summary.overallScore / 10) * 90)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600">Vocabulary</span>
                    <span className="text-neutral-500 text-xs">{summary.vocabHighlights?.length || 0} words</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (summary.vocabHighlights?.length || 0) * 10)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Aria's note */}
            <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-6">
              <p className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary-600" /> Aria's Note
              </p>
              <p className="text-neutral-600 text-sm italic leading-relaxed">"{summary.encouragement}"</p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-200">
                <div className="w-7 h-7 bg-primary-600 rounded-full text-white text-xs font-bold flex items-center justify-center">A</div>
                <span className="text-xs text-neutral-500">Aria, your English partner</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 mb-6 text-center">
            <Sparkles className="w-8 h-8 text-primary-400 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 mb-4">No summary generated yet</p>
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {generatingSummary ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate Summary'}
            </button>
          </div>
        )}

        {/* Vocabulary highlights */}
        {summary?.vocabHighlights && summary.vocabHighlights.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <h2 className="font-semibold text-neutral-900">Good Vocabulary</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.vocabHighlights.map((word) => (
                <span key={word} className="bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1.5 rounded-full">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Areas to improve */}
        {summary?.areasToImprove && summary.areasToImprove.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-neutral-900">Areas to Improve</h2>
            </div>
            <ul className="space-y-2">
              {summary.areasToImprove.map((area) => (
                <li key={area} className="text-sm text-neutral-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Level Recommendation */}
        {recommendation?.shouldShow && (
          <div className="mb-6">
            <LevelRecommendation recommendation={recommendation} compact />
          </div>
        )}

        {/* Transcript */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary-600" />
              <h2 className="font-semibold text-neutral-900">Transcript</h2>
            </div>
            <button className="flex items-center gap-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl px-4 py-2 text-sm transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {session.messages.map((msg) => {
              const isUser = msg.role === 'user'
              const feedback = msg.feedback as FeedbackData | null
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {isUser ? (
                    <div className="bg-primary-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[75%] text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 bg-primary-600 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0">A</div>
                      <div className="bg-neutral-100 text-neutral-800 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[75%] text-sm leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  )}
                  {feedback?.show && (
                    <div className="mt-1.5 max-w-[75%] bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-800">Grammar Feedback</span>
                      </div>
                      <p className="text-xs text-neutral-600">
                        <span className="line-through text-neutral-400">{feedback.original}</span>
                        {' → '}
                        <span className="text-primary-700 font-medium">{feedback.improved}</span>
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">{feedback.tip}</p>
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
