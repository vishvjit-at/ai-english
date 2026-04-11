import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, RotateCcw, Volume2, CheckCircle, Loader2 } from 'lucide-react'
import { VoiceButton } from '@/components/voice/VoiceButton'
import { AudioVisualizer } from '@/components/voice/AudioVisualizer'
import { MessageBubble } from './MessageBubble'
import { HintBubble } from './HintBubble'
import { useConversation } from '@/hooks/useConversation'
import { useIdleHint } from '@/hooks/useIdleHint'
import { useWebSpeechSTT, useWebSpeechTTS } from '@/hooks/useWebSpeech'
import type { UserContext } from '@/lib/types'

interface ConversationViewProps {
  config: {
    scenarioId?: string
    scenarioName: string
    topic: string
    lessonId?: string
    maxExchanges?: number
  }
  userContext: UserContext
  starterMessage: string
  lessonObjective?: string
}

export function ConversationView({ config, userContext, starterMessage, lessonObjective }: ConversationViewProps) {
  const [textInput, setTextInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)
  const navigate = useNavigate()

  const {
    messages, isThinking, isSaving, error, lastFollowUp,
    lessonComplete, exchangeCount,
    sendMessage, initWithStarterMessage, endConversation, reset,
  } = useConversation(config, userContext)
  const { hint, dismissHint } = useIdleHint(messages, isThinking, lastFollowUp)
  const { isSpeaking, speak, stop: stopSpeaking } = useWebSpeechTTS()
  const { isListening, isSupported, startListening, stopListening } = useWebSpeechSTT({
    onTranscript: async (text) => {
      const r = await sendMessage(text)
      if (r) speak(r.response)
    },
    onError: (err) => console.error('STT error:', err),
  })

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true
    initWithStarterMessage(starterMessage)
    const timer = setTimeout(() => speak(starterMessage), 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-end lesson when complete
  useEffect(() => {
    if (lessonComplete && !isSaving) {
      handleEndConversation()
    }
  }, [lessonComplete])

  const handleTextSend = async () => {
    if (!textInput.trim()) return
    const text = textInput
    setTextInput('')
    const r = await sendMessage(text)
    if (r) speak(r.response)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSend() }
  }

  const handleReset = () => {
    stopSpeaking(); reset()
    initWithStarterMessage(starterMessage)
    setTimeout(() => speak(starterMessage), 300)
  }

  const handleEndConversation = async () => {
    stopSpeaking()
    stopListening()
    try {
      const { sessionId } = await endConversation()
      navigate(`/history/${sessionId}`)
    } catch (err) {
      console.error('Failed to save conversation:', err)
    }
  }

  const isLesson = !!config.lessonId

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="glass-soft shrink-0 px-5 py-3 flex items-center justify-between border-b border-neutral-100/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center">
              <span className="text-white font-heading font-bold text-sm">A</span>
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${isSpeaking || isListening ? 'bg-primary-400' : 'bg-primary-300'}`} />
          </div>
          <div>
            <p className="font-heading font-bold text-neutral-700 text-sm">Aria</p>
            <p className="text-[11px] text-neutral-400 font-body flex items-center gap-1">
              {isSaving ? 'Saving...'
                : isSpeaking ? <><Volume2 className="w-3 h-3 text-primary-400" /> Speaking...</>
                : isListening ? <><span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse" /> Listening...</>
                : 'Ready to chat'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && <AudioVisualizer isActive={true} />}
          <button
            onClick={handleEndConversation}
            disabled={isSaving || messages.length < 2}
            className="h-8 px-3 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 text-white text-xs font-heading font-semibold hover:shadow-md disabled:from-neutral-200 disabled:to-neutral-200 disabled:text-neutral-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
            title="End & Save"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'End & Save'}</span>
          </button>
          <button onClick={handleReset} className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer" title="Restart">
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Context bar */}
      <div className="px-5 py-2 bg-primary-50/50 border-b border-primary-100/50 flex items-center justify-between shrink-0">
        <div className="flex-1 min-w-0 mr-2">
          <p className="text-xs font-heading font-semibold text-primary-600">{config.scenarioName}</p>
          {lessonObjective && <p className="text-[11px] text-primary-400">{lessonObjective}</p>}
          {!isLesson && userContext.customScenario && <p className="text-[11px] text-primary-400 truncate">{userContext.customScenario}</p>}
          {!isLesson && userContext.targetRole && <p className="text-[11px] text-primary-400">{userContext.targetRole}{userContext.targetCompany ? ` at ${userContext.targetCompany}` : ''}</p>}
        </div>
        <div className="flex items-center gap-2">
          {isLesson && config.maxExchanges && (
            <span className="text-[10px] font-heading font-semibold text-primary-500 bg-primary-100 px-2 py-0.5 rounded-full">
              {exchangeCount}/{config.maxExchanges}
            </span>
          )}
          <span className="text-[9px] font-heading font-semibold text-primary-400 uppercase tracking-wider bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
            {userContext.level}
          </span>
        </div>
      </div>

      {/* Lesson progress bar */}
      {isLesson && config.maxExchanges && (
        <div className="h-1 bg-neutral-100 shrink-0">
          <div
            className="h-full bg-primary-400 transition-all"
            style={{ width: `${Math.min(100, (exchangeCount / config.maxExchanges) * 100)}%` }}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col" style={{ gap: 'var(--ui-chat-gap)' }}>
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} message={msg} index={i} />
        ))}
        {isThinking && (
          <div className="flex items-start animate-fade-in">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-neutral-100">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">A</span>
                </div>
                <span className="text-xs font-heading font-semibold text-primary-600">Aria</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />
                <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }} />
                <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-accent-100/60 border border-accent-200 text-neutral-600 text-sm px-4 py-3 rounded-xl animate-scale-in">{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Hint */}
      {hint && (
        <HintBubble
          hint={hint}
          onDismiss={dismissHint}
          onUseHint={(text) => { setTextInput(text); dismissHint() }}
        />
      )}

      {/* Input area */}
      <div className="shrink-0 bg-surface border-t border-neutral-100/60">
        <div className="pt-4 pb-2 flex justify-center">
          <VoiceButton isListening={isListening} isThinking={isThinking} isSpeaking={isSpeaking} isSupported={isSupported} onStart={startListening} onStop={stopListening} />
        </div>
        <div className="px-5 pb-4 flex gap-2">
          <textarea
            placeholder="Or type your message..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 resize-none text-sm font-body min-h-[42px] max-h-[100px] bg-white border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300/50 focus:border-primary-300 transition-all placeholder:text-neutral-300"
          />
          <button
            onClick={handleTextSend}
            disabled={!textInput.trim() || isThinking}
            className="self-end w-[42px] h-[42px] flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-xl shadow-sm hover:shadow-md disabled:from-neutral-200 disabled:to-neutral-200 disabled:shadow-none disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
