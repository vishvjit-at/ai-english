import { Link } from 'react-router-dom'
import { TrendingUp, ArrowRight } from 'lucide-react'
import type { DifficultyRecommendation } from '@/lib/types'

interface LevelRecommendationProps {
  recommendation: DifficultyRecommendation
  compact?: boolean
}

export function LevelRecommendation({ recommendation, compact }: LevelRecommendationProps) {
  if (!recommendation.shouldShow) return null

  const isLevelUp = recommendation.recommendedLevel !== recommendation.currentLevel &&
    ['intermediate', 'advanced'].includes(recommendation.recommendedLevel) &&
    recommendation.recommendedLevel !== recommendation.currentLevel

  const bgClass = isLevelUp
    ? 'bg-gradient-to-br from-primary-50 to-primary-50 border-primary-200'
    : 'bg-gradient-to-br from-amber-50 to-accent-50 border-amber-200'

  const iconClass = isLevelUp ? 'text-primary-500 bg-primary-100' : 'text-amber-500 bg-amber-100'

  if (compact) {
    return (
      <div className={`rounded-xl border px-4 py-3 ${bgClass}`}>
        <div className="flex items-center gap-3">
          <TrendingUp className={`w-4 h-4 ${isLevelUp ? 'text-primary-500' : 'text-amber-500'}`} />
          <p className="text-sm text-neutral-600 font-body flex-1">{recommendation.reason}</p>
          <Link
            to="/"
            className="text-xs font-heading font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 shrink-0"
          >
            Try {recommendation.recommendedLevel} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border p-5 ${bgClass}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-heading font-bold text-neutral-700 text-sm mb-1">
            {isLevelUp ? 'Ready for a Challenge!' : 'Build Your Foundation'}
          </p>
          <p className="text-sm text-neutral-500 font-body mb-3">{recommendation.reason}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-sm font-heading font-semibold text-primary-600 hover:shadow-sm border border-neutral-100 transition-all"
          >
            Try {recommendation.recommendedLevel} scenarios <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
