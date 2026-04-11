import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettings } from '@/hooks/useSettings'

interface UseWebSpeechSTTOptions {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
}

export function useWebSpeechSTT({ onTranscript, onError }: UseWebSpeechSTTOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    setIsSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
  }, [])

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      onError?.('Speech recognition is not supported. Please use Chrome or Edge.')
      return
    }

    const recognition = new SR()
    recognition.lang = 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false)
      if (event.error === 'no-speech') {
        onError?.('No speech detected. Please try again.')
      } else if (event.error === 'not-allowed') {
        onError?.('Microphone access denied. Please allow microphone access.')
      } else {
        onError?.(`Speech recognition error: ${event.error}`)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [onTranscript, onError])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, isSupported, startListening, stopListening }
}

export function useWebSpeechTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { settings } = useSettings()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined') return

    // Stop any current playback
    window.speechSynthesis.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const provider = settings.voiceProvider

    if (provider === 'browser') {
      speakWithBrowser(text, onEnd)
      return
    }

    // Server-side TTS (Google or ElevenLabs)
    setIsSpeaking(true)

    fetch('/api/voice/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        provider,
        voiceName: settings.voiceName,
        speed: settings.voiceSpeed,
      }),
    })
      .then((res) => res.json())
      .then((data: { audio?: string; contentType?: string; error?: string }) => {
        if (data.error === 'limit_exceeded') {
          // Fall back to browser voice
          console.warn(`${provider} free limit exceeded, falling back to browser voice`)
          speakWithBrowser(text, onEnd)
          return
        }

        if (data.error) {
          console.error('TTS error:', data.error)
          // Fall back to browser
          speakWithBrowser(text, onEnd)
          return
        }

        if (data.audio) {
          const contentType = data.contentType || 'audio/mp3'
          const audio = new Audio(`data:${contentType};base64,${data.audio}`)
          audioRef.current = audio

          audio.onplay = () => setIsSpeaking(true)
          audio.onended = () => {
            setIsSpeaking(false)
            audioRef.current = null
            onEnd?.()
          }
          audio.onerror = () => {
            setIsSpeaking(false)
            audioRef.current = null
            // Fall back to browser on playback error
            speakWithBrowser(text, onEnd)
          }

          audio.play().catch(() => {
            setIsSpeaking(false)
            speakWithBrowser(text, onEnd)
          })
        } else {
          setIsSpeaking(false)
          onEnd?.()
        }
      })
      .catch((err) => {
        console.error('TTS fetch error:', err)
        setIsSpeaking(false)
        // Fall back to browser
        speakWithBrowser(text, onEnd)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.voiceProvider, settings.voiceName, settings.voiceSpeed])

  const speakWithBrowser = useCallback((text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = settings.voiceSpeed
    utterance.pitch = 1.05
    utterance.volume = 1

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()

      // Use user-selected voice if set and provider is browser
      if (settings.voiceProvider === 'browser' && settings.voiceName) {
        const selected = voices.find((v) => v.name === settings.voiceName)
        if (selected) {
          utterance.voice = selected
          return
        }
      }

      // Auto-pick best English female voice
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Female') ||
            v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Google UK English Female'))
      )
      if (preferred) utterance.voice = preferred
    }

    if (window.speechSynthesis.getVoices().length) {
      pickVoice()
    } else {
      window.speechSynthesis.onvoiceschanged = pickVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      onEnd?.()
    }
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [settings.voiceName, settings.voiceSpeed, settings.voiceProvider])

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsSpeaking(false)
  }, [])

  return { isSpeaking, speak, stop }
}
