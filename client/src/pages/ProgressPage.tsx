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
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!data || data.totalSessions === 0) {
    return (
      <div className="h-full overflow-y-auto bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Progress</h1>
          <p className="text-slate-500 text-sm mb-8">Track your improvement over time</p>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="font-bold text-slate-600 text-lg mb-2">No data yet</h2>
            <p className="text-sm text-slate-400">Complete some conversations to see your progress.</p>
          </div>
        </div>
      </div>
    )
  }

  const maxScore = Math.max(...data.scoreHistory.map((s) => s.score), 10)

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Progress</h1>
        <p className="text-slate-500 text-sm mb-8">Track your improvement over time</p>

        {/* Level Recommendation */}
        {recommendation?.shouldShow && (
          <div className="mb-6">
            <LevelRecommendation recommendation={recommendation} />
          </div>
        )}

        {/* 4 stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3 text-blue-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{data.totalSessions}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total Sessions</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3 text-green-500">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{data.totalMinutes}</p>
            <p className="text-xs text-slate-400 mt-0.5">Minutes Practiced</p>
            <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full mt-1 inline-block">
              {data.totalMinutes > 60 ? `${Math.floor(data.totalMinutes / 60)}h` : 'Keep going!'}
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3 text-amber-500">
              <Star className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{data.averageScore ?? '--'}</p>
            <p className="text-xs text-slate-400 mt-0.5">Avg Score /10</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3 text-red-500">
              <Flame className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{data.currentStreak}</p>
            <p className="text-xs text-slate-400 mt-0.5">Day Streak</p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Score trend (col-span-2) */}
          {data.scoreHistory.length > 0 && (
            <section className="col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <h2 className="font-semibold text-slate-900">Score Trend</h2>
                </div>
                <div className="flex gap-1">
                  <button className="text-xs px-3 py-1 rounded-lg bg-green-50 text-green-600 font-medium">Weekly</button>
                  <button className="text-xs px-3 py-1 rounded-lg text-slate-500 hover:bg-slate-50">Daily</button>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-32">
                {data.scoreHistory.map((entry, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {entry.scenarioName}: {entry.score}/10
                    </div>
                    <div
                      className="w-full bg-green-500 rounded-t-md transition-all hover:bg-green-600"
                      style={{ height: `${(entry.score / maxScore) * 100}%`, minHeight: '8px' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-slate-400">Oldest</span>
                <span className="text-[10px] text-slate-400">Latest</span>
              </div>
            </section>
          )}

          {/* Areas to Focus (col-span-1) */}
          <section className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-slate-900">Areas to Focus</h2>
            </div>
            {data.recentWeakAreas.length > 0 ? (
              <div className="flex flex-col gap-2">
                {data.recentWeakAreas.map((item) => (
                  <div key={item.area} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                    <span className="text-sm text-slate-600">{item.area}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Complete more sessions to see insights.</p>
            )}
          </section>
        </div>

        {/* Topics Practiced */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-green-600" />
            <h2 className="font-semibold text-slate-900">Topics Practiced</h2>
          </div>
          <div className="flex flex-col gap-4">
            {Object.entries(data.topicBreakdown).map(([topic, count]) => {
              const pct = Math.round((count / data.totalSessions) * 100)
              return (
                <div key={topic}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-600">{TOPIC_LABELS[topic] || topic}</span>
                    <span className="text-sm font-semibold text-slate-500">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Smart Recommendation */}
        <section className="bg-gradient-to-br from-green-900 to-green-700 rounded-2xl p-8 text-white">
          <p className="text-xs tracking-wider text-green-300 mb-2">SMART RECOMMENDATION</p>
          <h3 className="text-2xl font-bold mb-2">Level up your practice</h3>
          <p className="text-green-200 text-sm mb-4">
            Based on your {data.totalSessions} sessions, Aria recommends focusing on more advanced scenarios.
          </p>
          <button className="bg-white text-green-900 font-semibold px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 hover:bg-green-50 transition-colors cursor-pointer">
            Upgrade My Curriculum →
          </button>
        </section>

        {/* Grammar stats */}
        <section className="bg-white rounded-2xl border border-slate-100 p-5 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Grammar Correction Rate</p>
              <p className="text-sm text-slate-400">Percentage of messages needing corrections</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-2xl text-slate-900">{data.grammarCorrectionRate}%</p>
              <p className="text-xs text-slate-400">{data.grammarCorrectionRate < 30 ? 'Great!' : data.grammarCorrectionRate < 60 ? 'Getting better' : 'Keep practicing'}</p>
            </div>
          </div>
        </section>

        {data.longestStreak > 0 && (
          <p className="mt-4 text-center text-xs text-slate-400">
            Longest streak: <span className="font-semibold text-slate-600">{data.longestStreak} days</span>
          </p>
        )}
      </div>
    </div>
  )
}
