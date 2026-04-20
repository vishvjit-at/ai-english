import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Clock, MessageSquare, Sparkles, AlertTriangle, BookOpen, Lightbulb, Trash2, Loader2, Download, Star } from 'lucide-react'
import { fetchSession, generateSummary, deleteSession, fetchDifficultyRecommendation } from '@/lib/api'
import { LevelRecommendation } from '@/components/ui/LevelRecommendation'
import { MaskButton } from '@/components/ui/MaskButton'
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
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--sem-surface)' }}>
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4" style={{ background: 'var(--sem-surface)' }}>
        <p className="text-neutral-400">Session not found</p>
        <Link to="/history" className="text-primary-600 font-semibold text-sm hover:underline">Back to History</Link>
      </div>
    )
  }

  const summary = session.summary

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--sem-surface)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">

        {/* Back + delete row */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/history" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to History
          </Link>
          <button onClick={handleDelete} className="text-neutral-300 hover:text-red-500 transition-colors cursor-pointer p-2 rounded-xl hover:bg-red-50" title="Delete session">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase font-medium mb-2" style={{ color: 'var(--sem-neutral-400)', fontFamily: 'var(--font-heading)' }}>
            Session Detail
          </p>
          <h1 className="font-black tracking-tight leading-tight mb-4" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontFamily: 'var(--font-heading)', color: 'var(--sem-neutral-900)' }}>
            {session.scenarioName}
          </h1>
          <div className="flex items-center gap-5 text-sm text-neutral-500">
            <span>{new Date(session.startedAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDuration(session.durationSecs)}</span>
            <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {session.messageCount} messages</span>
          </div>
        </div>

        {/* Summary section */}
        {summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {/* Score card */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex flex-col items-center hover-lift">
              <div className="w-28 h-28 rounded-full border-4 border-primary-500 flex items-center justify-center mb-4">
                <div className="text-center">
                  <span className="font-black text-primary-600 leading-none" style={{ fontSize: '2.5rem' }}>{summary.overallScore}</span>
                  <span className="text-lg text-neutral-400">/10</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-1">
                {[1,2,3,4,5].map((n) => (
                  <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(summary.overallScore / 2) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 fill-neutral-200'}`} />
                ))}
              </div>
              <p className="font-bold text-neutral-900 text-sm mt-1">Great Progress!</p>
            </div>

            {/* Fluency card */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 hover-lift">
              <p className="font-bold text-neutral-900 mb-4">Performance</p>
              <div className="space-y-4">
                {[
                  { label: 'Fluency', value: Math.min(100, (summary.overallScore / 10) * 100), color: 'bg-primary-500' },
                  { label: 'Grammar', value: Math.min(100, (summary.overallScore / 10) * 90), color: 'bg-blue-500' },
                  { label: 'Vocabulary', value: Math.min(100, (summary.vocabHighlights?.length || 0) * 10), color: 'bg-purple-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-neutral-600">{item.label}</span>
                      <span className="text-sm font-semibold text-neutral-700">{Math.round(item.value)}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aria's note */}
            <div className="bg-primary-50 rounded-2xl border border-primary-100 p-6 hover-lift">
              <p className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary-600" /> Aria's Note
              </p>
              <p className="text-neutral-600 text-sm italic leading-relaxed">"{summary.encouragement}"</p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary-200">
                <div className="w-7 h-7 bg-primary-600 rounded-full text-white text-xs font-bold flex items-center justify-center">A</div>
                <span className="text-xs text-neutral-500">Aria, your English partner</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 p-10 mb-8 text-center">
            <Sparkles className="w-10 h-10 text-primary-400 mx-auto mb-4" />
            <p className="font-bold text-neutral-700 mb-1">No summary yet</p>
            <p className="text-sm text-neutral-400 mb-6">Generate an AI-powered analysis of this conversation</p>
            <MaskButton
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="px-7 py-3 font-semibold text-sm"
            >
              {generatingSummary ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Summary</>}
            </MaskButton>
          </div>
        )}

        {/* Vocabulary highlights */}
        {summary?.vocabHighlights && summary.vocabHighlights.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <h2 className="font-bold text-neutral-900">Good Vocabulary</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.vocabHighlights.map((word) => (
                <span key={word} className="bg-primary-50 text-primary-700 text-sm font-semibold px-3.5 py-1.5 rounded-full">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Areas to improve */}
        {summary?.areasToImprove && summary.areasToImprove.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-neutral-900">Areas to Improve</h2>
            </div>
            <ul className="flex flex-col gap-2.5">
              {summary.areasToImprove.map((area) => (
                <li key={area} className="text-sm text-neutral-600 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Level Recommendation */}
        {recommendation?.shouldShow && (
          <div className="mb-5">
            <LevelRecommendation recommendation={recommendation} compact />
          </div>
        )}

        {/* Transcript */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary-600" />
              <h2 className="font-bold text-neutral-900">Transcript</h2>
            </div>
            <button className="flex items-center gap-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-full px-4 py-2 text-sm transition-colors cursor-pointer">
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
                    <div className="bg-primary-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[90%] sm:max-w-[75%] text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 bg-primary-600 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0">A</div>
                      <div className="bg-neutral-100 text-neutral-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[90%] sm:max-w-[75%] text-sm leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  )}
                  {feedback?.show && (
                    <div className="mt-2 max-w-[90%] sm:max-w-[75%] bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-amber-800">Grammar Feedback</span>
                      </div>
                      <p className="text-xs text-neutral-600">
                        <span className="line-through text-neutral-400">{feedback.original}</span>
                        {' → '}
                        <span className="text-primary-700 font-semibold">{feedback.improved}</span>
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
