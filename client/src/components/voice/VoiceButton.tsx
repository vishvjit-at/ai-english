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
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {isListening && (
          <>
            <span className="absolute inset-0 bg-red-400/30 rounded-full animate-ping" />
            <span className="absolute -inset-2 bg-red-400/20 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
          </>
        )}
        {isSpeaking && (
          <span className="absolute -inset-2 rounded-full bg-green-400/20 animate-ping" />
        )}

        <button
          onClick={handleClick}
          disabled={isDisabled && !isListening}
          className={cn(
            'relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer',
            isListening
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
              : isSpeaking
              ? 'bg-green-600 rounded-full shadow-lg shadow-green-600/30'
              : isThinking
              ? 'bg-slate-200 cursor-not-allowed'
              : isDisabled
              ? 'bg-slate-200 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 hover:scale-105 active:scale-95'
          )}
        >
          {isThinking ? (
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-6 h-6 text-white relative z-10" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      <p className="text-xs text-slate-500 mt-2 text-center">
        {isListening ? 'Listening... tap to stop'
          : isThinking ? 'Aria is thinking...'
          : isSpeaking ? 'Aria is speaking...'
          : !isSupported ? 'Use Chrome or Edge for voice'
          : 'Tap to speak'}
      </p>
    </div>
  )
}
