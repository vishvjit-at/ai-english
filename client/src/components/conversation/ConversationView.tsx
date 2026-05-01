import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, RotateCcw, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import { VoiceButton } from '@/components/voice/VoiceButton'
import { AudioVisualizer } from '@/components/voice/AudioVisualizer'
import { MessageBubble } from './MessageBubble'
import { HintBubble } from './HintBubble'
import { useConversation } from '@/hooks/useConversation'
import { useIdleHint } from '@/hooks/useIdleHint'
import { useWebSpeechSTT, useWebSpeechTTS } from '@/hooks/useWebSpeech'
import { useTheme } from '@/lib/speakup-theme'
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

function formatElapsed(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ConversationView({ config, userContext, starterMessage }: ConversationViewProps) {
  const T = useTheme()
  const [textInput, setTextInput] = useState('')
  const [elapsed, setElapsed] = useState(0)
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
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

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

  useEffect(() => {
    if (lessonComplete && !isSaving) handleEndConversation()
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
    stopSpeaking(); stopListening()
    try {
      const { sessionId } = await endConversation()
      navigate(`/history/${sessionId}`)
    } catch (err) {
      console.error('Failed to save conversation:', err)
    }
  }

  const correctionCount = messages.filter((m) => m.feedback?.show).length
  const status = isSaving ? 'Saving…' : isSpeaking ? 'Speaking…' : isListening ? 'Listening…' : 'Session in progress'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      background: T.bg,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px clamp(16px, 4vw, 32px)', borderBottom: `1px solid ${T.border}`,
        background: T.surface, flexShrink: 0, gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.body, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.bgAlt)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 17, color: T.heading,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>
              {config.scenarioName}
            </div>
            <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight, display: 'flex', alignItems: 'center', gap: 6 }}>
              {isSpeaking && <AudioVisualizer isActive={true} />}
              <span>{status}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.body }}>
            ⏱ {formatElapsed(elapsed)}
          </span>
          <span style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.orange, fontWeight: 600 }}>
            ✏️ {correctionCount} correction{correctionCount !== 1 ? 's' : ''}
          </span>
          {config.lessonId && config.maxExchanges && (
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '4px 12px',
              borderRadius: 100, background: T.indigoLight, color: T.indigo,
            }}>{exchangeCount}/{config.maxExchanges}</span>
          )}
          <button onClick={handleReset} title="Restart" style={{
            width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`,
            background: T.surface, color: T.body, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.bgAlt)}
          onMouseLeave={(e) => (e.currentTarget.style.background = T.surface)}>
            <RotateCcw size={14} />
          </button>
          <button onClick={handleEndConversation} disabled={isSaving || messages.length < 2}
            style={{
              fontFamily: T.bodyFont, fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${T.border}`, padding: '8px 18px',
              borderRadius: 10, cursor: isSaving || messages.length < 2 ? 'not-allowed' : 'pointer',
              background: T.surface, color: T.heading,
              opacity: isSaving || messages.length < 2 ? 0.5 : 1,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
            }}>
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            End Session
          </button>
        </div>
      </div>

      {/* Lesson progress */}
      {config.lessonId && config.maxExchanges && (
        <div style={{ height: 3, background: T.border, flexShrink: 0 }}>
          <div style={{
            height: '100%', background: T.indigo,
            width: `${Math.min(100, (exchangeCount / config.maxExchanges) * 100)}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}

      {/* Chat */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 'clamp(20px, 4vw, 32px)',
        display: 'flex', flexDirection: 'column', gap: 16,
        background: T.bgAlt,
      }}>
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} message={msg} index={i} />
        ))}
        {isThinking && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '14px 22px', borderRadius: 18, borderBottomLeftRadius: 6,
              background: T.surface, border: `1px solid ${T.border}`,
              fontFamily: T.bodyFont, fontSize: 16, color: T.bodyLight, display: 'inline-flex', gap: 4,
            }}>
              <span style={{ animation: 'pulseDot 1s infinite' }}>●</span>
              <span style={{ animation: 'pulseDot 1s 0.2s infinite' }}>●</span>
              <span style={{ animation: 'pulseDot 1s 0.4s infinite' }}>●</span>
            </div>
          </div>
        )}
        {error && (
          <div style={{
            background: `${T.red}15`, border: `1px solid ${T.red}`, color: T.red,
            fontSize: 14, padding: '12px 16px', borderRadius: 12, fontFamily: T.bodyFont,
          }}>{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {hint && (
        <HintBubble hint={hint} onDismiss={dismissHint}
          onUseHint={(text) => { setTextInput(text); dismissHint() }} />
      )}

      {/* Input bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px clamp(16px, 4vw, 32px)',
        borderTop: `1px solid ${T.border}`, background: T.surface, flexShrink: 0,
      }}>
        <VoiceButton
          isListening={isListening} isThinking={isThinking} isSpeaking={isSpeaking}
          isSupported={isSupported} onStart={startListening} onStop={stopListening}
        />
        <input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening…' : 'Type or tap the mic to speak…'}
          style={{
            flex: 1, padding: '14px 18px', borderRadius: 14,
            border: `1px solid ${T.border}`, fontFamily: T.bodyFont, fontSize: 15,
            outline: 'none', color: T.heading, background: T.bgAlt,
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = T.indigo)}
          onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
        />
        <button onClick={handleTextSend}
          disabled={!textInput.trim() || isThinking}
          style={{
            width: 48, height: 48, borderRadius: 12, border: 'none',
            background: T.indigo, color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: !textInput.trim() || isThinking ? 0.5 : 1,
            transition: 'all 0.2s',
          }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
