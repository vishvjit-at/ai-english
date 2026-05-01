import { ArrowRight } from 'lucide-react'
import type { FeedbackData } from '@/lib/types'

export function FeedbackCard({ feedback }: { feedback: FeedbackData }) {
  if (!feedback.show) return null

  return (
    <div className="mx-1 mt-2 mb-1 max-w-[80%] animate-scale-in">
      <div className="rounded-xl p-4 border-l-4"
        style={{ background: 'var(--sem-neutral-100)', borderLeftColor: '#f59e0b', borderTop: '1px solid var(--sem-neutral-200)', borderRight: '1px solid var(--sem-neutral-200)', borderBottom: '1px solid var(--sem-neutral-200)' }}>
        <p className="text-xs font-bold mb-2" style={{ color: '#f59e0b' }}>Suggestion</p>
        {feedback.original && (
          <div className="flex items-center gap-2 text-sm mb-1.5">
            <span className="line-through" style={{ color: 'var(--sem-neutral-400)' }}>{feedback.original}</span>
            <ArrowRight className="w-3 h-3 shrink-0" style={{ color: 'var(--sem-neutral-400)' }} />
            <span className="font-medium" style={{ color: '#6366f1' }}>{feedback.improved}</span>
          </div>
        )}
        <p className="text-sm" style={{ color: 'var(--sem-neutral-600)' }}>{feedback.tip}</p>
      </div>
    </div>
  )
}
