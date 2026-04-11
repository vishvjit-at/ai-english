import { cn } from '@/lib/utils'
import type { Message } from '@/lib/types'
import { FeedbackCard } from './FeedbackCard'

interface MessageBubbleProps {
  message: Message
  index: number
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn('flex flex-col animate-fade-in-up', isUser ? 'items-end' : 'items-start')}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 text-[15px] leading-relaxed font-body',
          isUser
            ? 'bg-primary-100 text-neutral-700 rounded-2xl rounded-br-md'
            : 'bg-white text-neutral-600 rounded-2xl rounded-bl-md shadow-sm border border-neutral-100'
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">A</span>
            </div>
            <span className="text-xs font-heading font-semibold text-primary-600">Aria</span>
          </div>
        )}
        {message.content}
      </div>
      {message.feedback && <FeedbackCard feedback={message.feedback} />}
    </div>
  )
}
