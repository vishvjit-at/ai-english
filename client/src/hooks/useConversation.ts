import { useCallback, useRef, useState } from 'react'
import { sendMessage as sendMessageApi, saveSession, generateSummary } from '@/lib/api'
import type { AriaResponse, Message, SessionSummary, UserContext } from '@/lib/types'

interface ConversationConfig {
  scenarioId?: string
  scenarioName: string
  topic: string
  lessonId?: string
  maxExchanges?: number
}

export function useConversation(config: ConversationConfig, userContext: UserContext) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFollowUp, setLastFollowUp] = useState<string | null>(null)
  const [lessonComplete, setLessonComplete] = useState(false)
  const messageCountRef = useRef(0)
  const startedAtRef = useRef<Date>(new Date())

  const addMessage = useCallback(
    (role: Message['role'], content: string, feedback?: Message['feedback']): Message => {
      const msg: Message = {
        id: crypto.randomUUID(),
        role,
        content,
        feedback,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, msg])
      return msg
    },
    []
  )

  const sendMessage = useCallback(
    async (userText: string): Promise<AriaResponse | null> => {
      if (!userText.trim()) return null

      addMessage('user', userText)
      messageCountRef.current += 1
      setIsThinking(true)
      setError(null)

      try {
        const history = messages.map((m) => ({ role: m.role, content: m.content }))
        const ariaResponse = await sendMessageApi(
          userText,
          userContext,
          history,
          { scenarioId: config.scenarioId, lessonId: config.lessonId }
        )

        addMessage(
          'assistant',
          ariaResponse.response,
          ariaResponse.feedback?.show ? ariaResponse.feedback : undefined
        )
        setLastFollowUp(ariaResponse.followUpQuestion || null)

        // Check if lesson is complete
        if (config.maxExchanges && messageCountRef.current >= config.maxExchanges) {
          setLessonComplete(true)
        }

        return ariaResponse
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        return null
      } finally {
        setIsThinking(false)
      }
    },
    [messages, config.scenarioId, config.lessonId, config.maxExchanges, userContext, addMessage]
  )

  const initWithStarterMessage = useCallback((text: string) => {
    startedAtRef.current = new Date()
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
      },
    ])
    messageCountRef.current = 0
    setLessonComplete(false)
  }, [])

  const endConversation = useCallback(
    async (): Promise<{ sessionId: string; summary: SessionSummary | null }> => {
      setIsSaving(true)
      try {
        const { sessionId } = await saveSession({
          scenarioId: config.scenarioId || config.lessonId || 'unknown',
          scenarioName: config.scenarioName,
          topic: config.topic,
          userContext,
          startedAt: startedAtRef.current.toISOString(),
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
            feedback: m.feedback || null,
            createdAt: m.timestamp.toISOString(),
          })),
        })

        let summary: SessionSummary | null = null
        try {
          const result = await generateSummary(sessionId)
          summary = result.summary
        } catch {
          console.warn('Failed to generate summary')
        }

        return { sessionId, summary }
      } finally {
        setIsSaving(false)
      }
    },
    [messages, config, userContext]
  )

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
    setLessonComplete(false)
    messageCountRef.current = 0
  }, [])

  const exchangeCount = messageCountRef.current

  return {
    messages, isThinking, isSaving, error, lastFollowUp,
    lessonComplete, exchangeCount,
    sendMessage, initWithStarterMessage, endConversation, reset,
  }
}
