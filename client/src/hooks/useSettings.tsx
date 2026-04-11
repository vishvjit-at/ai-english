import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// ── Theme ──
export type ThemeName = 'calm-garden' | 'ocean-breeze' | 'sunset-glow' | 'lavender-dream' | 'midnight'

export interface ThemeInfo {
  id: ThemeName
  label: string
  swatch: string
}

export const themes: ThemeInfo[] = [
  { id: 'calm-garden', label: 'Calm Garden', swatch: '#34d399' },
  { id: 'ocean-breeze', label: 'Ocean Breeze', swatch: '#60a5fa' },
  { id: 'sunset-glow', label: 'Sunset Glow', swatch: '#fbbf24' },
  { id: 'lavender-dream', label: 'Lavender Dream', swatch: '#a78bfa' },
  { id: 'midnight', label: 'Midnight', swatch: '#2dd4bf' },
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
  id?: string // for google/elevenlabs voices
  name: string
  lang: string
  type?: string
}

// ── Settings state ──
export interface Settings {
  theme: ThemeName
  fontSize: FontSize
  borderRadius: BorderRadius
  chatDensity: ChatDensity
  animations: boolean
  voiceProvider: VoiceProvider
  voiceName: string // empty = auto-pick
  voiceSpeed: number // 0.7 - 1.3
}

const defaultSettings: Settings = {
  theme: 'calm-garden',
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
    themes.forEach((t) => root.classList.remove(`theme-${t.id}`))
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
