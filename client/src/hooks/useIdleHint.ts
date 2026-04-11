import { useCallback, useEffect, useRef, useState } from 'react'
import type { Message } from '@/lib/types'

const IDLE_TIMEOUT_MS = 15_000

export function useIdleHint(
  messages: Message[],
  isThinking: boolean,
  lastFollowUp: string | null
) {
  const [hint, setHint] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismissHint = useCallback(() => setHint(null), [])

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Clear hint when user sends a new message or AI is thinking
    setHint(null)

    // Only start timer if last message is from assistant and not thinking
    if (isThinking || messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role !== 'assistant') return

    timerRef.current = setTimeout(() => {
      const hintText = lastFollowUp || "Take your time! Try responding to what Aria said."
      setHint(hintText)
    }, IDLE_TIMEOUT_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [messages, isThinking, lastFollowUp])

  return { hint, dismissHint }
}
