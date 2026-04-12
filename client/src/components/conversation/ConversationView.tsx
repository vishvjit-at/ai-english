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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-4 bg-white shrink-0">
        {/* Left: Aria info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full text-white font-bold flex items-center justify-center shrink-0">
            A
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-sm">Aria</p>
            <p className="text-xs text-neutral-400 flex items-center gap-1">
              {isSaving ? 'Saving...'
                : isSpeaking ? <><Volume2 className="w-3 h-3 text-primary-500" /> Speaking...</>
                : isListening ? <><span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" /> Listening...</>
                : 'Ready to chat'}
            </p>
          </div>
        </div>

        {/* Center: AudioVisualizer */}
        <div className="flex-1 flex justify-center">
          {isSpeaking && <AudioVisualizer isActive={true} />}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleEndConversation}
            disabled={isSaving || messages.length < 2}
            className="h-9 px-4 rounded-xl bg-primary-600 text-white text-sm font-semibold flex items-center gap-1.5 hover-glow disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer"
            title="End & Save"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'End & Save'}</span>
          </button>
          <button onClick={handleReset} className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer" title="Restart">
            <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
          </button>
        </div>
      </div>

      {/* Context bar */}
      <div className="bg-primary-50 border-b border-primary-100 px-6 py-2 flex items-center justify-between shrink-0">
        <div className="flex-1 min-w-0 mr-2">
          <p className="text-sm font-semibold text-primary-800">{config.scenarioName}</p>
          {lessonObjective && <p className="text-xs text-primary-600">{lessonObjective}</p>}
          {!isLesson && userContext.customScenario && <p className="text-xs text-primary-600 truncate">{userContext.customScenario}</p>}
          {!isLesson && userContext.targetRole && <p className="text-xs text-primary-600">{userContext.targetRole}{userContext.targetCompany ? ` at ${userContext.targetCompany}` : ''}</p>}
        </div>
        <div className="flex items-center gap-2">
          {isLesson && config.maxExchanges && (
            <span className="text-xs font-semibold text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
              {exchangeCount}/{config.maxExchanges}
            </span>
          )}
          <span className="text-xs font-semibold text-primary-600 uppercase bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
            {userContext.level}
          </span>
        </div>
      </div>

      {/* Lesson progress bar */}
      {isLesson && config.maxExchanges && (
        <div className="h-1 bg-neutral-100 shrink-0">
          <div
            className="h-full bg-primary-500 transition-all"
            style={{ width: `${Math.min(100, (exchangeCount / config.maxExchanges) * 100)}%` }}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1 bg-white">
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} message={msg} index={i} />
        ))}
        {isThinking && (
          <div className="flex items-start gap-2.5 animate-fade-in">
            <div className="w-7 h-7 bg-primary-600 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">A</div>
            <div className="bg-neutral-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }} />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
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
      <div className="border-t border-neutral-100 px-6 py-4 bg-white flex flex-col gap-3 items-center shrink-0">
        <VoiceButton isListening={isListening} isThinking={isThinking} isSpeaking={isSpeaking} isSupported={isSupported} onStart={startListening} onStop={stopListening} />
        <div className="flex gap-2 w-full">
          <textarea
            placeholder="Or type your message..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 resize-none text-sm min-h-[42px] max-h-[100px] bg-white border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-neutral-400"
          />
          <button
            onClick={handleTextSend}
            disabled={!textInput.trim() || isThinking}
            className="self-end w-[42px] h-[42px] flex items-center justify-center bg-primary-600 text-white rounded-xl hover-glow disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
