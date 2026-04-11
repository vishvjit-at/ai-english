import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, MessageSquare, Star, ChevronRight } from 'lucide-react'
import { fetchSessions } from '@/lib/api'
import type { SessionListItem } from '@/lib/types'

const TOPIC_LABELS: Record<string, string> = {
  job_interview: 'Job Interview',
  daily_life: 'Daily Life',
  college: 'College',
  custom: 'Custom',
}

const TOPIC_COLORS: Record<string, string> = {
  job_interview: 'bg-blue-100 text-blue-600',
  daily_life: 'bg-green-100 text-green-600',
  college: 'bg-purple-100 text-purple-600',
  custom: 'bg-amber-100 text-amber-600',
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

  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-neutral-800 text-xl">History</h1>
            <p className="text-xs text-neutral-400 font-body">Your past conversations</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary-50 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary-300" />
            </div>
            <h2 className="font-heading font-bold text-neutral-600 text-lg mb-2">No conversations yet</h2>
            <p className="text-sm text-neutral-400 font-body mb-6">Start practicing to see your history here.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-xl font-heading font-semibold text-sm hover:shadow-md transition-all"
            >
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s, i) => (
              <Link
                key={s.id}
                to={`/history/${s.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-neutral-100 hover:border-primary-200 hover:shadow-sm transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-heading font-semibold text-neutral-700 text-sm truncate">{s.scenarioName}</p>
                    <span className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full shrink-0 ${TOPIC_COLORS[s.topic] || 'bg-neutral-100 text-neutral-500'}`}>
                      {TOPIC_LABELS[s.topic] || s.topic}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-400 font-body">
                    <span>{formatDate(s.startedAt)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDuration(s.durationSecs)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {s.messageCount}
                    </span>
                  </div>
                </div>
                {s.overallScore != null && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-heading font-bold text-neutral-700 text-sm">{s.overallScore}</span>
                  </div>
                )}
                <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
