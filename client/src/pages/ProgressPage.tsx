import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, MessageSquare, Clock, Star, Flame, Target, BookOpen } from 'lucide-react'
import { fetchProgress, fetchDifficultyRecommendation } from '@/lib/api'
import { LevelRecommendation } from '@/components/ui/LevelRecommendation'
import { MaskButton } from '@/components/ui/MaskButton'
import type { ProgressData, DifficultyRecommendation } from '@/lib/types'

const TOPIC_LABELS: Record<string, string> = {
  job_interview: 'Job Interview',
  daily_life: 'Daily Life',
  college: 'College',
  custom: 'Custom',
}

export function ProgressPage() {
  const navigate = useNavigate()
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
      <div className="h-full overflow-y-auto" style={{ background: 'var(--sem-surface)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
          <div className="mb-10">
            <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse mb-3" />
            <div className="h-12 w-56 bg-neutral-200 rounded-xl animate-pulse mb-2" />
            <div className="h-12 w-40 bg-neutral-200 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-5">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 animate-pulse mb-3" />
                <div className="h-9 w-14 bg-neutral-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-16 bg-neutral-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-neutral-100 p-6 h-52 animate-pulse" />
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 h-52 animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 h-32 animate-pulse mb-6" />
        </div>
      </div>
    )
  }

  if (!data || data.totalSessions === 0) {
    return (
      <div className="h-full overflow-y-auto" style={{ background: 'var(--sem-surface)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
          <div className="mb-10">
            <p className="text-xs tracking-[0.3em] uppercase font-medium mb-2" style={{ color: 'var(--sem-neutral-400)', fontFamily: 'var(--font-heading)' }}>
              Your Journey
            </p>
            <h1 className="font-black tracking-tight leading-none" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontFamily: 'var(--font-heading)', color: 'var(--sem-neutral-900)' }}>
              Track Your<br />Progress
            </h1>
          </div>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center mb-6">
              <TrendingUp className="w-10 h-10 text-primary-400" />
            </div>
            <h2 className="font-black text-neutral-700 text-2xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>No data yet</h2>
            <p className="text-neutral-400 text-sm mb-8 max-w-xs">Complete some conversations to see your progress here.</p>
            <MaskButton onClick={() => navigate('/')} className="px-7 py-3 text-sm font-semibold">
              Start Practicing
            </MaskButton>
          </div>
        </div>
      </div>
    )
  }

  const maxScore = Math.max(...data.scoreHistory.map((s) => s.score), 10)

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--sem-surface)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">

        {/* Page header */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] uppercase font-medium mb-2" style={{ color: 'var(--sem-neutral-400)', fontFamily: 'var(--font-heading)' }}>
            Your Journey
          </p>
          <h1 className="font-black tracking-tight leading-none" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontFamily: 'var(--font-heading)', color: 'var(--sem-neutral-900)' }}>
            Track Your<br />Progress
          </h1>
        </div>

        {/* Level Recommendation */}
        {recommendation?.shouldShow && (
          <div className="mb-8">
            <LevelRecommendation recommendation={recommendation} />
          </div>
        )}

        {/* 4 stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <MessageSquare className="w-5 h-5" />, value: data.totalSessions, label: 'Sessions', color: 'bg-blue-50 text-blue-500' },
            { icon: <Clock className="w-5 h-5" />, value: `${data.totalMinutes}m`, label: 'Practiced', color: 'bg-primary-50 text-primary-500' },
            { icon: <Star className="w-5 h-5" />, value: data.averageScore ?? '--', label: 'Avg Score', color: 'bg-amber-50 text-amber-500' },
            { icon: <Flame className="w-5 h-5" />, value: data.currentStreak, label: 'Day Streak', color: 'bg-red-50 text-red-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-neutral-100 p-5 hover-lift">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
              <p className="text-4xl font-black text-neutral-900 leading-none">{s.value}</p>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Score trend */}
          {data.scoreHistory.length > 0 && (
            <section className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                <h2 className="font-bold text-neutral-900">Score Trend</h2>
              </div>
              <div className="flex items-end gap-1.5 h-36">
                {data.scoreHistory.map((entry, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {entry.scenarioName}: {entry.score}/10
                    </div>
                    <div
                      className="w-full bg-primary-500 rounded-t-md transition-all hover:bg-primary-600"
                      style={{ height: `${(entry.score / maxScore) * 100}%`, minHeight: '8px' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-[10px] text-neutral-400">Oldest</span>
                <span className="text-[10px] text-neutral-400">Latest</span>
              </div>
            </section>
          )}

          {/* Areas to Focus */}
          <section className="bg-white rounded-2xl border border-neutral-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <h2 className="font-bold text-neutral-900">Focus Areas</h2>
            </div>
            {data.recentWeakAreas.length > 0 ? (
              <div className="flex flex-col gap-3">
                {data.recentWeakAreas.map((item) => (
                  <div key={item.area} className="flex items-start gap-2.5">
                    <span className="w-2 h-2 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                    <span className="text-sm text-neutral-600">{item.area}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">Complete more sessions to see insights.</p>
            )}
          </section>
        </div>

        {/* Topics Practiced */}
        <section className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-4 h-4 text-primary-600" />
            <h2 className="font-bold text-neutral-900">Topics Practiced</h2>
          </div>
          <div className="flex flex-col gap-4">
            {Object.entries(data.topicBreakdown).map(([topic, count]) => {
              const pct = Math.round((count / data.totalSessions) * 100)
              return (
                <div key={topic}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">{TOPIC_LABELS[topic] || topic}</span>
                    <span className="text-sm font-bold text-neutral-500">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Grammar stats */}
        <section className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-neutral-900 mb-1">Grammar Correction Rate</p>
              <p className="text-sm text-neutral-400">Percentage of messages needing corrections</p>
            </div>
            <div className="text-right">
              <p className="font-black text-4xl text-neutral-900 leading-none">{data.grammarCorrectionRate}%</p>
              <p className="text-xs text-neutral-400 mt-1">
                {data.grammarCorrectionRate < 30 ? 'Great!' : data.grammarCorrectionRate < 60 ? 'Getting better' : 'Keep practicing'}
              </p>
            </div>
          </div>
        </section>

        {/* Smart Recommendation CTA */}
        <section className="rounded-2xl p-8 text-white" style={{ background: 'linear-gradient(135deg, var(--sem-primary-900), var(--sem-primary-700))' }}>
          <p className="text-xs tracking-[0.25em] uppercase font-semibold mb-3" style={{ color: 'var(--sem-primary-300)' }}>Smart Recommendation</p>
          <h3 className="font-black text-2xl mb-2">Level up your practice</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--sem-primary-200)' }}>
            Based on your {data.totalSessions} sessions, Aria recommends focusing on more advanced scenarios.
          </p>
          <MaskButton fillColor="white" labelColor="white" fillTextColor="var(--sem-primary-900)" className="px-7 py-3 text-sm font-semibold">
            Upgrade My Curriculum →
          </MaskButton>
        </section>

        {data.longestStreak > 0 && (
          <p className="mt-6 text-center text-xs text-neutral-400">
            Longest streak: <span className="font-semibold text-neutral-600">{data.longestStreak} days</span>
          </p>
        )}
      </div>
    </div>
  )
}
