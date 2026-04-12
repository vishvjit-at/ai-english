import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, MessageSquare, Star, Calendar, Plus, TrendingUp, Timer } from 'lucide-react'
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
  return `${Math.floor(secs / 60)}m`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
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
      .then((d) => setSessions(d.sessions))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalMessages = sessions.reduce((s, x) => s + x.messageCount, 0)
  const scored = sessions.filter((s) => s.overallScore != null)
  const avgScore = scored.length > 0
    ? (scored.reduce((s, x) => s + (x.overallScore || 0), 0) / scored.length).toFixed(1)
    : '--'
  const totalMins = sessions.reduce((s, x) => s + Math.floor((x.durationSecs || 0) / 60), 0)

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--sem-surface)' }}>
      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Page header */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] uppercase font-medium mb-2" style={{ color: 'var(--sem-neutral-400)', fontFamily: 'var(--font-heading)' }}>
            Your Journey
          </p>
          <h1 className="font-black tracking-tight leading-none" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontFamily: 'var(--font-heading)', color: 'var(--sem-neutral-900)' }}>
            Conversation<br />History
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { icon: <MessageSquare className="w-5 h-5" />, value: sessions.length, label: 'Sessions', color: 'bg-blue-50 text-blue-500' },
            { icon: <TrendingUp className="w-5 h-5" />, value: totalMessages, label: 'Messages', color: 'bg-primary-50 text-primary-500' },
            { icon: <Star className="w-5 h-5" />, value: avgScore, label: 'Avg Score', color: 'bg-amber-50 text-amber-500' },
            { icon: <Timer className="w-5 h-5" />, value: `${totalMins}m`, label: 'Practice Time', color: 'bg-purple-50 text-purple-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-neutral-100 p-5 hover-lift">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
              <p className="text-4xl font-black text-neutral-900 leading-none">{s.value}</p>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-primary-400" />
            </div>
            <h2 className="font-black text-neutral-700 text-2xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Your journey starts here</h2>
            <p className="text-neutral-400 text-sm mb-8 max-w-xs">Start a conversation with Aria to see your history here.</p>
            <Link to="/" className="bg-primary-600 text-white px-7 py-3 rounded-full text-sm font-semibold hover-glow">
              Start First Session
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs tracking-[0.25em] uppercase font-semibold text-neutral-400 mb-5">Recent Sessions</p>
            <div className="grid grid-cols-2 gap-4">
              {sessions.map((s) => (
                <Link key={s.id} to={`/history/${s.id}`}
                  className="group bg-white rounded-2xl border border-neutral-100 p-6 hover-lift cursor-pointer block">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${TOPIC_COLORS[s.topic] || 'bg-neutral-100 text-neutral-500'}`}>
                      {TOPIC_LABELS[s.topic] || s.topic}
                    </span>
                    {s.overallScore != null && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-neutral-700">{s.overallScore}/10</span>
                      </div>
                    )}
                  </div>

                  <p className="font-bold text-neutral-900 mb-4 line-clamp-2 text-base leading-snug">{s.scenarioName}</p>

                  <div className="flex gap-4 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(s.startedAt)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(s.durationSecs)}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {s.messageCount}</span>
                  </div>

                  <div className="flex items-center gap-1 mt-4 text-primary-600 text-sm font-semibold">
                    View Transcript <span className="group-arrow">→</span>
                  </div>
                </Link>
              ))}

              {sessions.length % 2 !== 0 && (
                <Link to="/" className="group border-2 border-dashed border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-neutral-400 hover:border-primary-300 hover:text-primary-500 transition-all cursor-pointer hover-lift">
                  <Plus className="w-8 h-8 mb-2" />
                  <p className="text-sm font-semibold">New Session</p>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
