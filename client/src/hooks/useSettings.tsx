import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// ── Theme — driven by homeStyle, not user-selected independently ──
export type ThemeName = 'calm-garden' | 'ocean-breeze' | 'midnight'

// ── Home Style ──
export type HomeStyle = 'aura' | 'clarity' | 'night'

export interface HomeStyleInfo {
  id: HomeStyle
  label: string
  desc: string
  bg: string
  accent: string
}

export const homeStyles: HomeStyleInfo[] = [
  { id: 'aura',    label: 'Aura',    desc: 'Colorful & immersive', bg: '#d6eeea', accent: '#34d399' },
  { id: 'clarity', label: 'Clarity', desc: 'Clean & minimal',      bg: '#f0f6ff', accent: '#60a5fa' },
  { id: 'night',   label: 'Night',   desc: 'Dark & focused',       bg: '#0b1120', accent: '#818cf8' },
]

// ── UI Design ──
export type FontSize = 'small' | 'medium' | 'large'
export type BorderRadius = 'rounded' | 'sharp' | 'pill'
export type ChatDensity = 'compact' | 'comfortable' | 'spacious'

export const fontSizeValues: Record<FontSize, string> = {
  small: '13px',
  medium: '15px',
  large: '17px',
}
export const borderRadiusValues: Record<BorderRadius, string> = {
  sharp: '8px',
  rounded: '16px',
  pill: '9999px',
}
export const chatDensityValues: Record<ChatDensity, string> = {
  compact: '8px',
  comfortable: '16px',
  spacious: '24px',
}

// ── Voice ──
export type VoiceProvider = 'browser' | 'elevenlabs'

export interface VoiceOption {
  id?: string
  name: string
  lang: string
  type?: string
}

// ── Settings state ──
export interface Settings {
  theme: ThemeName
  homeStyle: HomeStyle
  fontSize: FontSize
  borderRadius: BorderRadius
  chatDensity: ChatDensity
  animations: boolean
  voiceProvider: VoiceProvider
  voiceName: string
  voiceSpeed: number
}

const defaultSettings: Settings = {
  theme: 'ocean-breeze',
  homeStyle: 'clarity',
  fontSize: 'medium',
  borderRadius: 'rounded',
  chatDensity: 'comfortable',
  animations: true,
  voiceProvider: 'browser',
  voiceName: '',
  voiceSpeed: 0.92,
}

interface SettingsContextValue {
  settings: Settings
  updateSettings: (partial: Partial<Settings>) => void
  availableVoices: VoiceOption[]
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const STORAGE_KEY = 'speakup-settings'

function loadSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) }
  } catch { /* ignore */ }
  return defaultSettings
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([])

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const english = voices
        .filter((v) => v.lang.startsWith('en'))
        .map((v) => ({ name: v.name, lang: v.lang }))
      setAvailableVoices(english)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-calm-garden', 'theme-ocean-breeze', 'theme-midnight')
    root.classList.add(`theme-${settings.theme}`)
  }, [settings.theme])

  // Apply UI CSS variables
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--ui-font-size', fontSizeValues[settings.fontSize])
    root.style.setProperty('--ui-radius', borderRadiusValues[settings.borderRadius])
    root.style.setProperty('--ui-chat-gap', chatDensityValues[settings.chatDensity])
    if (!settings.animations) {
      root.classList.add('no-animations')
    } else {
      root.classList.remove('no-animations')
    }
  }, [settings.fontSize, settings.borderRadius, settings.chatDensity, settings.animations])

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, availableVoices }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
