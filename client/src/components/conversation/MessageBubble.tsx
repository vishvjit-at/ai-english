import type { Message } from '@/lib/types'
import { FeedbackCard } from './FeedbackCard'
import { useTheme } from '@/lib/speakup-theme'

interface MessageBubbleProps {
  message: Message
  index: number
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const T = useTheme()
  const isUser = message.role === 'user'
  const hasCorrection = !!message.feedback?.show

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      animation: 'fadeUp 0.3s ease both',
      animationDelay: `${index * 0.04}s`,
    }}>
      <div style={{
        maxWidth: 520, padding: '14px 20px', borderRadius: 18,
        fontFamily: T.bodyFont, fontSize: 15, lineHeight: 1.55,
        ...(isUser ? {
          background: T.indigo, color: '#fff',
          borderBottomRightRadius: 6,
        } : {
          background: T.surface, color: T.heading,
          border: hasCorrection ? `1.5px solid ${T.orange}` : `1px solid ${T.border}`,
          borderBottomLeftRadius: 6,
        }),
      }}>
        {hasCorrection && !isUser && (
          <div style={{ fontSize: 12, fontWeight: 600, color: T.orange, marginBottom: 4 }}>
            💡 Gentle correction
          </div>
        )}
        {message.content}
      </div>
      {message.feedback && <FeedbackCard feedback={message.feedback} />}
      <p style={{ fontSize: 11, color: T.bodyLight, marginTop: 4, fontFamily: T.bodyFont }}>
        {new Date(message.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  )
}
