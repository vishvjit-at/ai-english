import { Lightbulb, ArrowRight } from 'lucide-react'
import type { FeedbackData } from '@/lib/types'

export function FeedbackCard({ feedback }: { feedback: FeedbackData }) {
  if (!feedback.show) return null

  return (
    <div className="mx-1 mt-2 mb-1 max-w-[80%] animate-scale-in">
      <div className="bg-accent-100/60 border border-accent-200/50 rounded-xl p-3.5">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-accent-300 flex items-center justify-center shrink-0">
            <Lightbulb className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="text-neutral-400 line-through truncate">{feedback.original}</span>
              <ArrowRight className="w-3 h-3 text-neutral-300 shrink-0" />
              <span className="text-primary-600 font-semibold truncate">{feedback.improved}</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-body leading-relaxed">{feedback.tip}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
