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
      {isUser ? (
        <div className="flex justify-end">
          <div className="bg-green-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[75%] text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 bg-green-600 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">
            A
          </div>
          <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[75%] text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
      )}
      {message.feedback && <FeedbackCard feedback={message.feedback} />}
      <p className="text-xs text-slate-400 mt-1">
        {new Date(message.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  )
}
