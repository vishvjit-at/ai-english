import { useEffect, useState } from 'react'
import { Settings, Palette, Type, Layout, Zap, Volume2, Play, Check, AlertTriangle } from 'lucide-react'
import { useSettings, themes, type VoiceProvider, type VoiceOption } from '@/hooks/useSettings'
import { supabase } from '@/lib/supabase'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

const API_BASE = import.meta.env.VITE_API_URL || '/api'

interface UsageInfo {
  used: number
  limit: number
}

interface ServerVoice {
  id: string
  name: string
  lang: string
  type: string
}

const PROVIDER_OPTIONS: { value: VoiceProvider; label: string; desc: string }[] = [
  { value: 'browser', label: 'Browser', desc: 'Free, Unlimited' },
  { value: 'elevenlabs', label: 'ElevenLabs', desc: 'Free tier' },
]

export function SettingsPage() {
  const { settings, updateSettings, availableVoices } = useSettings()
  const [previewText] = useState("Hello! I'm Aria, your English speaking partner.")
  const [serverVoices, setServerVoices] = useState<ServerVoice[]>([])
  const [loadingVoices, setLoadingVoices] = useState(false)
  const [usage, setUsage] = useState<{ elevenlabs?: UsageInfo } | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)

  // Fetch server voices when provider changes
  useEffect(() => {
    if (settings.voiceProvider === 'browser') {
      setServerVoices([])
      return
    }

    setLoadingVoices(true)
    getAuthHeaders().then((headers) =>
      fetch(`${API_BASE}/voice/voices?provider=${settings.voiceProvider}`, { headers })
        .then((r) => r.json())
        .then((data: { voices: ServerVoice[] }) => {
          setServerVoices(data.voices || [])
        })
        .catch(() => setServerVoices([]))
        .finally(() => setLoadingVoices(false))
    )
  }, [settings.voiceProvider])

  // Fetch usage stats
  useEffect(() => {
    getAuthHeaders().then((headers) =>
      fetch(`${API_BASE}/voice/usage`, { headers })
        .then((r) => r.json())
        .then((data) => setUsage(data))
        .catch(() => {})
    )
  }, [])

  const getUsageForProvider = (): UsageInfo | null => {
    if (!usage) return null
    if (settings.voiceProvider === 'elevenlabs') {
      return usage.elevenlabs || null
    }
    return null
  }

  const usageInfo = getUsageForProvider()
  const isLimitExceeded = usageInfo ? usageInfo.used >= usageInfo.limit : false

  const formatNumber = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return String(n)
  }

  const handlePreview = async () => {
    if (settings.voiceProvider === 'browser') {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(previewText)
      utterance.rate = settings.voiceSpeed
      utterance.pitch = 1.05
      if (settings.voiceName) {
        const voice = window.speechSynthesis.getVoices().find((v) => v.name === settings.voiceName)
        if (voice) utterance.voice = voice
      }
      window.speechSynthesis.speak(utterance)
      return
    }

    // Server-side preview
    setIsPreviewing(true)
    try {
      const res = await fetch(`${API_BASE}/voice/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({
          text: previewText,
          provider: settings.voiceProvider,
          voiceName: settings.voiceName,
          speed: settings.voiceSpeed,
        }),
      })
      const data = await res.json()

      if (data.error === 'limit_exceeded') {
        alert('Free limit reached. Switch to Browser voice.')
        if (data.usage) {
          setUsage((prev) => prev ? { ...prev, elevenlabs: data.usage } : prev)
        }
        return
      }

      if (data.error) {
        alert(`TTS error: ${data.error}`)
        return
      }

      if (data.audio) {
        const contentType = data.contentType || 'audio/mp3'
        const audio = new Audio(`data:${contentType};base64,${data.audio}`)
        audio.play()

        if (data.usage) {
          setUsage((prev) => prev ? { ...prev, elevenlabs: data.usage } : prev)
        }
      }
    } catch {
      alert('Failed to preview voice. Check server connection.')
    } finally {
      setIsPreviewing(false)
    }
  }

  // Determine which voice list to show
  const voiceList: VoiceOption[] = settings.voiceProvider === 'browser'
    ? availableVoices
    : serverVoices.map((v) => ({ id: v.id, name: v.name, lang: v.lang, type: v.type }))

  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-sm">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-neutral-800 text-xl">Settings</h1>
            <p className="text-xs text-neutral-400 font-body">Customize your experience</p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* ── Section: Color Theme ── */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-primary-500" />
              <h2 className="font-heading font-bold text-neutral-700 text-sm">Color Theme</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateSettings({ theme: t.id })}
                  className={`
                    relative flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer text-left
                    ${settings.theme === t.id
                      ? 'border-primary-400 bg-primary-50 shadow-sm'
                      : 'border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-sm'
                    }
                  `}
                >
                  <div
                    className="w-10 h-10 rounded-xl shadow-inner shrink-0"
                    style={{ background: `linear-gradient(135deg, ${t.swatch}, ${t.swatch}dd)` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-neutral-700 text-sm">{t.label}</p>
                    <p className="text-[11px] text-neutral-400">{
                      t.id === 'calm-garden' ? 'Soft sage & peach' :
                      t.id === 'ocean-breeze' ? 'Cool blue & coral' :
                      t.id === 'sunset-glow' ? 'Warm amber & rose' :
                      t.id === 'lavender-dream' ? 'Purple & mint' :
                      'Dark teal & gold'
                    }</p>
                  </div>
                  {settings.theme === t.id && (
                    <div className="w-6 h-6 rounded-full bg-primary-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* ── Section: UI Design ── */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Layout className="w-4 h-4 text-primary-500" />
              <h2 className="font-heading font-bold text-neutral-700 text-sm">UI Design</h2>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 divide-y divide-neutral-50">
              {/* Font Size */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-3.5 h-3.5 text-neutral-400" />
                  <p className="text-sm font-heading font-semibold text-neutral-600">Font Size</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'small', label: 'Small', preview: 'Aa' },
                    { value: 'medium', label: 'Medium', preview: 'Aa' },
                    { value: 'large', label: 'Large', preview: 'Aa' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSettings({ fontSize: opt.value })}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all cursor-pointer
                        ${settings.fontSize === opt.value ? 'border-primary-300 bg-primary-50' : 'border-neutral-100 hover:border-neutral-200'}`}
                    >
                      <span className={`font-heading font-bold text-neutral-700 ${opt.value === 'small' ? 'text-xs' : opt.value === 'medium' ? 'text-base' : 'text-xl'}`}>
                        {opt.preview}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-heading">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layout className="w-3.5 h-3.5 text-neutral-400" />
                  <p className="text-sm font-heading font-semibold text-neutral-600">Corner Style</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'sharp', label: 'Sharp', radius: '4px' },
                    { value: 'rounded', label: 'Rounded', radius: '12px' },
                    { value: 'pill', label: 'Pill', radius: '9999px' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSettings({ borderRadius: opt.value })}
                      className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all cursor-pointer
                        ${settings.borderRadius === opt.value ? 'border-primary-300 bg-primary-50' : 'border-neutral-100 hover:border-neutral-200'}`}
                    >
                      <div className="w-10 h-7 bg-primary-300 transition-all" style={{ borderRadius: opt.radius }} />
                      <span className="text-[10px] text-neutral-400 font-heading">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Density */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layout className="w-3.5 h-3.5 text-neutral-400" />
                  <p className="text-sm font-heading font-semibold text-neutral-600">Chat Density</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'compact', label: 'Compact' },
                    { value: 'comfortable', label: 'Comfortable' },
                    { value: 'spacious', label: 'Spacious' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSettings({ chatDensity: opt.value })}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all cursor-pointer
                        ${settings.chatDensity === opt.value ? 'border-primary-300 bg-primary-50' : 'border-neutral-100 hover:border-neutral-200'}`}
                    >
                      <div className="flex flex-col items-center w-8">
                        <div className={`w-8 h-1.5 bg-primary-300 rounded-full`} />
                        <div className={`w-6 h-1.5 bg-neutral-200 rounded-full ${opt.value === 'compact' ? 'mt-1' : opt.value === 'comfortable' ? 'mt-2' : 'mt-3'}`} />
                        <div className={`w-7 h-1.5 bg-primary-200 rounded-full ${opt.value === 'compact' ? 'mt-1' : opt.value === 'comfortable' ? 'mt-2' : 'mt-3'}`} />
                      </div>
                      <span className="text-[10px] text-neutral-400 font-heading">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animations */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-neutral-400" />
                  <div>
                    <p className="text-sm font-heading font-semibold text-neutral-600">Animations</p>
                    <p className="text-[10px] text-neutral-400">Entrance effects & transitions</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ animations: !settings.animations })}
                  className={`w-11 h-6 rounded-full transition-all cursor-pointer flex items-center px-0.5
                    ${settings.animations ? 'bg-primary-400' : 'bg-neutral-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.animations ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* ── Section: Voice ── */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-4 h-4 text-primary-500" />
              <h2 className="font-heading font-bold text-neutral-700 text-sm">Aria's Voice</h2>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 divide-y divide-neutral-50">
              {/* Provider Selection */}
              <div className="p-4">
                <p className="text-sm font-heading font-semibold text-neutral-600 mb-3">Voice Provider</p>
                <div className="grid grid-cols-2 gap-2">
                  {PROVIDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        updateSettings({ voiceProvider: opt.value, voiceName: '' })
                      }}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all cursor-pointer
                        ${settings.voiceProvider === opt.value ? 'border-primary-300 bg-primary-50' : 'border-neutral-100 hover:border-neutral-200'}`}
                    >
                      <span className="text-sm font-heading font-semibold text-neutral-700">{opt.label}</span>
                      <span className="text-[10px] text-neutral-400 font-heading">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Usage Bar (for Google and ElevenLabs) */}
              {settings.voiceProvider !== 'browser' && usageInfo && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-heading font-semibold text-neutral-500">Usage this month</p>
                    <span className="text-xs text-neutral-400 font-heading">
                      {formatNumber(usageInfo.used)} / {formatNumber(usageInfo.limit)} chars
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isLimitExceeded ? 'bg-red-400' : 'bg-primary-400'}`}
                      style={{ width: `${Math.min(100, (usageInfo.used / usageInfo.limit) * 100)}%` }}
                    />
                  </div>
                  {isLimitExceeded && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-500">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="text-xs font-heading font-semibold">Free limit reached -- switch to Browser voice</span>
                    </div>
                  )}
                </div>
              )}

              {/* Voice Selection */}
              <div className="p-4">
                <p className="text-sm font-heading font-semibold text-neutral-600 mb-3">Voice</p>
                {loadingVoices ? (
                  <p className="text-xs text-neutral-400 font-body">Loading voices...</p>
                ) : voiceList.length === 0 && settings.voiceProvider === 'browser' ? (
                  <p className="text-xs text-neutral-400 font-body">No English voices detected. Voices depend on your browser and OS.</p>
                ) : voiceList.length === 0 ? (
                  <p className="text-xs text-neutral-400 font-body">No voices available. Check API key configuration on the server.</p>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                    {/* Auto option */}
                    <button
                      onClick={() => updateSettings({ voiceName: '' })}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer
                        ${settings.voiceName === '' ? 'bg-primary-50 border border-primary-300' : 'border border-neutral-100 hover:border-neutral-200'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${settings.voiceName === '' ? 'bg-primary-400' : 'bg-neutral-200'}`} />
                      <div>
                        <p className="text-sm font-body text-neutral-700">Auto-select</p>
                        <p className="text-[10px] text-neutral-400">
                          {settings.voiceProvider === 'browser' ? 'Best voice for your device' : 'Default voice'}
                        </p>
                      </div>
                    </button>

                    {voiceList.map((v) => {
                      const voiceKey = settings.voiceProvider === 'browser' ? v.name : (v.id || v.name)
                      return (
                        <button
                          key={voiceKey}
                          onClick={() => updateSettings({ voiceName: voiceKey })}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer
                            ${settings.voiceName === voiceKey ? 'bg-primary-50 border border-primary-300' : 'border border-neutral-100 hover:border-neutral-200'}`}
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${settings.voiceName === voiceKey ? 'bg-primary-400' : 'bg-neutral-200'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body text-neutral-700 truncate">{v.name}</p>
                            <p className="text-[10px] text-neutral-400">{v.lang}{v.type ? ` - ${v.type}` : ''}</p>
                          </div>
                          {settings.voiceName === voiceKey && <Check className="w-4 h-4 text-primary-400 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Voice Speed */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-heading font-semibold text-neutral-600">Speed</p>
                  <span className="text-xs text-neutral-400 font-heading">
                    {settings.voiceSpeed <= 0.8 ? 'Slow' : settings.voiceSpeed >= 1.1 ? 'Fast' : 'Normal'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.3"
                  step="0.05"
                  value={settings.voiceSpeed}
                  onChange={(e) => updateSettings({ voiceSpeed: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-neutral-100 rounded-full appearance-none cursor-pointer accent-primary-400"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-neutral-300">Slow</span>
                  <span className="text-[10px] text-neutral-300">Normal</span>
                  <span className="text-[10px] text-neutral-300">Fast</span>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4">
                <button
                  onClick={handlePreview}
                  disabled={isPreviewing || isLimitExceeded}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-heading font-semibold text-sm transition-colors cursor-pointer
                    ${isLimitExceeded
                      ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                >
                  <Play className="w-4 h-4" />
                  {isPreviewing ? 'Playing...' : 'Preview Voice'}
                </button>
              </div>
            </div>
          </section>
        </div>

        <p className="text-center text-[10px] text-neutral-300 font-heading mt-10">
          Settings are saved automatically
        </p>
      </div>
    </div>
  )
}
