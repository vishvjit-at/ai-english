import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, MessageSquare, Star, Calendar, Filter, Download, Plus } from 'lucide-react'
import { fetchSessions } from '@/lib/api'
import type { SessionListItem } from '@/lib/types'

const TOPIC_LABELS: Record<string, string> = {
  job_interview: 'Job Interview',
  daily_life: 'Daily Life',
  college: 'College',
  custom: 'Custom',
}

const TOPIC_COLORS: Record<string, string> = {
  job_interview: 'bg-blue-50 text-blue-600',
  daily_life: 'bg-primary-50 text-primary-600',
  college: 'bg-purple-50 text-purple-600',
  custom: 'bg-amber-50 text-amber-600',
}

function formatDuration(secs: number | null): string {
  if (!secs) return '--'
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  return `${mins}m`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export function HistoryPage() {
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions(50)
      .then((data) => setSessions(data.sessions))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0)
  const avgScore = sessions.filter((s) => s.overallScore != null).length > 0
    ? (sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / sessions.filter((s) => s.overallScore != null).length).toFixed(1)
    : '--'
  const totalMins = sessions.reduce((sum, s) => sum + Math.floor((s.durationSecs || 0) / 60), 0)

  return (
    <div className="h-full overflow-y-auto bg-neutral-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header row */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Conversation History</h1>
            <p className="text-neutral-500 text-sm mt-1">Review your past practice sessions</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl px-4 py-2 text-sm transition-colors cursor-pointer">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl px-4 py-2 text-sm transition-colors cursor-pointer">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <p className="text-2xl font-bold text-neutral-900">{sessions.length}</p>
            <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Total Sessions</p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <p className="text-2xl font-bold text-neutral-900">{totalMessages}</p>
            <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Messages Sent</p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <p className="text-2xl font-bold text-neutral-900">{avgScore}</p>
            <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Avg Score</p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <p className="text-2xl font-bold text-neutral-900">{totalMins}m</p>
            <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Total Practice</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center text-center text-neutral-400">
            <p className="text-3xl mb-2">+</p>
            <p className="font-semibold text-neutral-600 mb-1">Your journey is just beginning</p>
            <p className="text-sm mb-4">Start a conversation to see your history here.</p>
            <Link to="/" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Start Session
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Sessions</h2>
            <div className="grid grid-cols-2 gap-4">
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  to={`/history/${s.id}`}
                  className="bg-white rounded-2xl border border-neutral-100 p-6 hover:shadow-md transition-all cursor-pointer block"
                >
                  {/* Top: badge + score */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full uppercase ${TOPIC_COLORS[s.topic] || 'bg-neutral-100 text-neutral-500'}`}>
                      {TOPIC_LABELS[s.topic] || s.topic}
                    </span>
                    {s.overallScore != null && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold text-neutral-700">{s.overallScore}/10</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <p className="font-semibold text-neutral-900 mt-2 mb-3 line-clamp-2">{s.scenarioName}</p>

                  {/* Meta row */}
                  <div className="flex gap-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(s.startedAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {formatDuration(s.durationSecs)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> {s.messageCount}
                    </span>
                  </div>

                  <p className="text-primary-600 text-sm font-medium mt-4">View Transcript →</p>
                </Link>
              ))}

              {/* Empty slot CTA if odd number */}
              {sessions.length % 2 !== 0 && (
                <Link to="/" className="border-2 border-dashed border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-neutral-400 hover:border-primary-300 hover:text-primary-600 transition-colors cursor-pointer">
                  <Plus className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium">Start a new session</p>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
