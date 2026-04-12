import { Lightbulb, ArrowRight } from 'lucide-react'
import type { FeedbackData } from '@/lib/types'

export function FeedbackCard({ feedback }: { feedback: FeedbackData }) {
  if (!feedback.show) return null

  return (
    <div className="mx-1 mt-2 mb-1 max-w-[80%] animate-scale-in">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-800">Grammar Feedback</span>
        </div>
        <div className="flex items-center gap-2 text-sm mb-1">
          <span className="text-neutral-400 line-through">{feedback.original}</span>
          <ArrowRight className="w-3 h-3 text-neutral-400 shrink-0" />
          <span className="text-primary-700 font-medium">{feedback.improved}</span>
        </div>
        <p className="text-sm text-neutral-600 mt-1">{feedback.tip}</p>
      </div>
    </div>
  )
}
