import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceButtonProps {
  isListening: boolean
  isThinking: boolean
  isSpeaking: boolean
  isSupported: boolean
  onStart: () => void
  onStop: () => void
}

export function VoiceButton({ isListening, isThinking, isSpeaking, isSupported, onStart, onStop }: VoiceButtonProps) {
  const isDisabled = isThinking || isSpeaking || !isSupported

  const handleClick = () => {
    if (isListening) onStop()
    else if (!isDisabled) onStart()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-accent-300/40" style={{ animation: 'pulse-soft 1.5s ease-out infinite' }} />
            <span className="absolute -inset-3 rounded-full bg-accent-200/25" style={{ animation: 'pulse-soft 1.5s ease-out infinite 0.3s' }} />
          </>
        )}
        {isSpeaking && (
          <span className="absolute -inset-2 rounded-full bg-primary-200/30" style={{ animation: 'pulse-soft 2s ease-out infinite' }} />
        )}

        <button
          onClick={handleClick}
          disabled={isDisabled}
          className={cn(
            'relative w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer',
            isListening
              ? 'bg-gradient-to-br from-accent-300 to-accent-400 shadow-lg shadow-accent-300/25 scale-110'
              : isSpeaking
              ? 'bg-gradient-to-br from-primary-300 to-primary-500 shadow-lg shadow-primary-300/25'
              : isThinking
              ? 'bg-neutral-200'
              : isDisabled
              ? 'bg-neutral-200 cursor-not-allowed'
              : 'bg-gradient-to-br from-primary-400 to-primary-500 shadow-md shadow-primary-300/20 hover:shadow-lg hover:shadow-primary-300/30 hover:scale-105 active:scale-95'
          )}
        >
          {isThinking ? (
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-6 h-6 text-white relative z-10" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      <p className="text-xs font-heading font-medium text-neutral-400 text-center min-h-[18px]">
        {isListening ? 'Listening... tap to stop'
          : isThinking ? 'Aria is thinking...'
          : isSpeaking ? 'Aria is speaking...'
          : !isSupported ? 'Use Chrome or Edge for voice'
          : 'Tap to speak'}
      </p>
    </div>
  )
}
