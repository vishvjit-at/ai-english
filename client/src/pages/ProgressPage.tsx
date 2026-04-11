import { useEffect, useState } from 'react'
import { TrendingUp, MessageSquare, Clock, Star, Flame, Target, BookOpen } from 'lucide-react'
import { fetchProgress, fetchDifficultyRecommendation } from '@/lib/api'
import { LevelRecommendation } from '@/components/ui/LevelRecommendation'
import type { ProgressData, DifficultyRecommendation } from '@/lib/types'

const TOPIC_LABELS: Record<string, string> = {
  job_interview: 'Job Interview',
  daily_life: 'Daily Life',
  college: 'College',
  custom: 'Custom',
}

const TOPIC_COLORS: Record<string, string> = {
  job_interview: 'bg-blue-400',
  daily_life: 'bg-green-400',
  college: 'bg-purple-400',
  custom: 'bg-amber-400',
}

export function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [recommendation, setRecommendation] = useState<DifficultyRecommendation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchProgress().then(setData).catch(() => {}),
      fetchDifficultyRecommendation().then(setRecommendation).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!data || data.totalSessions === 0) {
    return (
      <div className="h-full overflow-y-auto bg-surface">
        <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-neutral-800 text-xl">Progress</h1>
              <p className="text-xs text-neutral-400 font-body">Track your improvement</p>
            </div>
          </div>
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary-50 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary-300" />
            </div>
            <h2 className="font-heading font-bold text-neutral-600 text-lg mb-2">No data yet</h2>
            <p className="text-sm text-neutral-400 font-body">Complete some conversations to see your progress.</p>
          </div>
        </div>
      </div>
    )
  }

  const maxScore = Math.max(...data.scoreHistory.map((s) => s.score), 10)

  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-neutral-800 text-xl">Progress</h1>
            <p className="text-xs text-neutral-400 font-body">Track your improvement</p>
          </div>
        </div>

        {/* Level Recommendation */}
        {recommendation?.shouldShow && (
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.04s' }}>
            <LevelRecommendation recommendation={recommendation} />
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Sessions" value={String(data.totalSessions)} color="text-blue-500 bg-blue-50" />
          <StatCard icon={<Clock className="w-4 h-4" />} label="Minutes" value={String(data.totalMinutes)} color="text-green-500 bg-green-50" />
          <StatCard icon={<Star className="w-4 h-4" />} label="Avg Score" value={data.averageScore != null ? String(data.averageScore) : '--'} color="text-amber-500 bg-amber-50" />
          <StatCard icon={<Flame className="w-4 h-4" />} label="Streak" value={`${data.currentStreak}d`} color="text-red-500 bg-red-50" />
        </div>

        {/* Score Trend */}
        {data.scoreHistory.length > 0 && (
          <section className="bg-white rounded-2xl border border-neutral-100 p-5 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <h2 className="font-heading font-bold text-neutral-700 text-sm">Score Trend</h2>
            </div>
            <div className="flex items-end gap-1.5 h-32">
              {data.scoreHistory.map((entry, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {entry.scenarioName}: {entry.score}/10
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-primary-400 to-primary-300 rounded-t-md transition-all hover:from-primary-500 hover:to-primary-400"
                    style={{ height: `${(entry.score / maxScore) * 100}%`, minHeight: '8px' }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-neutral-300 font-body">Oldest</span>
              <span className="text-[10px] text-neutral-300 font-body">Latest</span>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Topic Breakdown */}
          <section className="bg-white rounded-2xl border border-neutral-100 p-5 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary-500" />
              <h2 className="font-heading font-bold text-neutral-700 text-sm">Topics Practiced</h2>
            </div>
            <div className="flex flex-col gap-2.5">
              {Object.entries(data.topicBreakdown).map(([topic, count]) => {
                const pct = Math.round((count / data.totalSessions) * 100)
                return (
                  <div key={topic}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-body text-neutral-600">{TOPIC_LABELS[topic] || topic}</span>
                      <span className="text-[11px] font-heading font-semibold text-neutral-400">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${TOPIC_COLORS[topic] || 'bg-neutral-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Weak Areas */}
          <section className="bg-white rounded-2xl border border-neutral-100 p-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-primary-500" />
              <h2 className="font-heading font-bold text-neutral-700 text-sm">Areas to Focus</h2>
            </div>
            {data.recentWeakAreas.length > 0 ? (
              <div className="flex flex-col gap-2">
                {data.recentWeakAreas.map((item) => (
                  <div key={item.area} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-300 rounded-full mt-1.5 shrink-0" />
                    <span className="text-sm text-neutral-500 font-body">{item.area}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400 font-body">No data yet. Complete more sessions to see insights.</p>
            )}
          </section>
        </div>

        {/* Grammar Stats */}
        <section className="bg-white rounded-2xl border border-neutral-100 p-5 mt-4 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-heading font-semibold text-neutral-600 mb-1">Grammar Correction Rate</p>
              <p className="text-sm text-neutral-400 font-body">Percentage of messages needing corrections</p>
            </div>
            <div className="text-right">
              <p className="font-heading font-extrabold text-2xl text-neutral-800">{data.grammarCorrectionRate}%</p>
              <p className="text-[10px] text-neutral-400 font-body">{data.grammarCorrectionRate < 30 ? 'Great!' : data.grammarCorrectionRate < 60 ? 'Getting better' : 'Keep practicing'}</p>
            </div>
          </div>
        </section>

        {/* Streak Info */}
        {data.longestStreak > 0 && (
          <div className="mt-4 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-xs text-neutral-400 font-body">
              Longest streak: <span className="font-heading font-semibold text-neutral-500">{data.longestStreak} days</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-4 flex flex-col items-center gap-2">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <p className="font-heading font-extrabold text-neutral-800 text-lg">{value}</p>
      <p className="text-[10px] text-neutral-400 font-heading uppercase tracking-wider">{label}</p>
    </div>
  )
}
