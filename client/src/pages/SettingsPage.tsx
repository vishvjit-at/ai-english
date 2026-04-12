import { useEffect, useState } from 'react'
import { Settings, Palette, Zap, Volume2, Play, AlertTriangle } from 'lucide-react'
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
    <div className="h-full overflow-y-auto bg-neutral-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Settings</h1>
        <p className="text-neutral-500 text-sm mb-8">Personalise your sanctuary with Aria</p>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Appearance + Voice (col-span-2) */}
          <div className="col-span-2">
            {/* Appearance section */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 mb-4">
                <Palette className="w-4 h-4 text-primary-600" /> Appearance
              </div>

              {/* Color Theme */}
              <div className="mb-6">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Color Theme</p>
                <div className="flex gap-3 flex-wrap">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateSettings({ theme: t.id })}
                      className={`w-8 h-8 rounded-full cursor-pointer transition-all ${settings.theme === t.id ? 'ring-2 ring-offset-2 ring-primary-600' : 'hover:scale-110'}`}
                      style={{ background: `linear-gradient(135deg, ${t.swatch}, ${t.swatch}dd)` }}
                      title={t.label}
                    />
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="mb-6">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Font Size</p>
                <div className="flex gap-2">
                  {([
                    { value: 'small', label: 'A', size: 'text-sm' },
                    { value: 'medium', label: 'A', size: 'text-base' },
                    { value: 'large', label: 'A', size: 'text-xl' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSettings({ fontSize: opt.value })}
                      className={`flex items-center justify-center w-12 h-10 rounded-xl border font-bold transition-all cursor-pointer ${opt.size}
                        ${settings.fontSize === opt.value ? 'bg-primary-600 text-white border-primary-600' : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corner Style */}
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Corner Style</p>
                <div className="flex gap-2">
                  {([
                    { value: 'sharp', label: 'Sharp', radius: '4px' },
                    { value: 'rounded', label: 'Rounded', radius: '12px' },
                    { value: 'pill', label: 'Pill', radius: '9999px' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSettings({ borderRadius: opt.value })}
                      className={`flex flex-col items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer
                        ${settings.borderRadius === opt.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                    >
                      <div className="w-10 h-6 bg-current opacity-20 border-2 border-current" style={{ borderRadius: opt.radius }} />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voice & Audio section */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 mb-4">
                <Volume2 className="w-4 h-4 text-primary-600" /> Voice & Audio
              </div>

              {/* Provider Selection */}
              <div className="mb-5">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Voice Provider</p>
                <div className="grid grid-cols-2 gap-2">
                  {PROVIDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSettings({ voiceProvider: opt.value, voiceName: '' })}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all cursor-pointer
                        ${settings.voiceProvider === opt.value ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                    >
                      <span className="text-sm font-semibold text-neutral-700">{opt.label}</span>
                      <span className="text-xs text-neutral-400">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Usage Bar */}
              {settings.voiceProvider !== 'browser' && usageInfo && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-neutral-500">Usage this month</p>
                    <span className="text-xs text-neutral-400">{formatNumber(usageInfo.used)} / {formatNumber(usageInfo.limit)} chars</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all ${isLimitExceeded ? 'bg-red-400' : 'bg-primary-500'}`}
                      style={{ width: `${Math.min(100, (usageInfo.used / usageInfo.limit) * 100)}%` }}
                    />
                  </div>
                  {isLimitExceeded && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-500">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">Free limit reached — switch to Browser voice</span>
                    </div>
                  )}
                </div>
              )}

              {/* Voice Selection */}
              <div className="mb-5">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Aria Voice Library</p>
                {loadingVoices ? (
                  <p className="text-xs text-neutral-400">Loading voices...</p>
                ) : voiceList.length === 0 ? (
                  <p className="text-xs text-neutral-400">
                    {settings.voiceProvider === 'browser'
                      ? 'No English voices detected. Voices depend on your browser and OS.'
                      : 'No voices available. Check API key configuration on the server.'}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {/* Auto option */}
                    <button
                      onClick={() => updateSettings({ voiceName: '' })}
                      className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all
                        ${settings.voiceName === '' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                    >
                      <div className="w-10 h-10 bg-primary-600 rounded-full text-white font-bold flex items-center justify-center">A</div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-neutral-900">Auto-select</p>
                        <p className="text-xs text-neutral-500">
                          {settings.voiceProvider === 'browser' ? 'Best voice for your device' : 'Default voice'}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${settings.voiceName === '' ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'}`} />
                    </button>

                    {voiceList.slice(0, 2).map((v) => {
                      const voiceKey = settings.voiceProvider === 'browser' ? v.name : (v.id || v.name)
                      return (
                        <button
                          key={voiceKey}
                          onClick={() => updateSettings({ voiceName: voiceKey })}
                          className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all
                            ${settings.voiceName === voiceKey ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                        >
                          <div className="w-10 h-10 bg-primary-600 rounded-full text-white font-bold flex items-center justify-center">
                            {v.name[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-neutral-900 truncate">{v.name}</p>
                            <p className="text-xs text-neutral-500">{v.lang}{v.type ? ` - ${v.type}` : ''}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${settings.voiceName === voiceKey ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'}`} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Speed slider */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Speed</p>
                  <span className="text-xs text-neutral-500 font-medium">
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
                  className="w-full h-2 bg-neutral-100 rounded-full appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-neutral-300">Slow</span>
                  <span className="text-[10px] text-neutral-300">Normal</span>
                  <span className="text-[10px] text-neutral-300">Fast</span>
                </div>
              </div>

              {/* Voice Pitch row */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-neutral-700">Voice Pitch</p>
                <button className="border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl px-4 py-2 text-sm transition-colors cursor-pointer">
                  Default
                </button>
              </div>

              {/* Preview */}
              <button
                onClick={handlePreview}
                disabled={isPreviewing || isLimitExceeded}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer
                  ${isLimitExceeded
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
              >
                <Play className="w-4 h-4" />
                {isPreviewing ? 'Playing...' : 'Preview Voice'}
              </button>
            </div>

            {/* Animations toggle */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary-600" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-700">Animations</p>
                    <p className="text-xs text-neutral-400">Entrance effects & transitions</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ animations: !settings.animations })}
                  className={`w-10 h-6 rounded-full transition-all cursor-pointer flex items-center px-0.5
                    ${settings.animations ? 'bg-primary-500' : 'bg-neutral-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.animations ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Insights (col-span-1) */}
          <div>
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 mb-4">
                <Settings className="w-4 h-4 text-primary-600" /> Insights
              </div>

              {/* Character Usage */}
              <div className="mb-5">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Character Usage</p>
                {usageInfo ? (
                  <>
                    <p className="text-3xl font-bold text-neutral-900 mb-1">{formatNumber(usageInfo.used)}</p>
                    <p className="text-xs text-neutral-400 mb-2">of {formatNumber(usageInfo.limit)} chars</p>
                    <div className="w-full h-2 bg-neutral-100 rounded-full mb-2">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${Math.min(100, (usageInfo.used / usageInfo.limit) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-400">Upgrading offers unrestricted access to all voice features.</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-neutral-900 mb-1">∞</p>
                    <p className="text-xs text-neutral-400 mb-2">Browser voice is unlimited</p>
                    <div className="w-full h-2 bg-neutral-100 rounded-full mb-2" />
                    <p className="text-xs text-neutral-400">Upgrading offers unrestricted access to premium voices.</p>
                  </>
                )}
              </div>

              {/* Toggle rows */}
              <div className="space-y-4 mb-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-700">Chat Density: {settings.chatDensity}</p>
                  <button
                    onClick={() => {
                      const options = ['compact', 'comfortable', 'spacious'] as const
                      const idx = options.indexOf(settings.chatDensity)
                      updateSettings({ chatDensity: options[(idx + 1) % options.length] })
                    }}
                    className={`w-10 h-6 rounded-full transition-all cursor-pointer flex items-center px-0.5
                      ${settings.chatDensity !== 'compact' ? 'bg-primary-500' : 'bg-neutral-200'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.chatDensity !== 'compact' ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Reset Defaults */}
              <button
                onClick={() => updateSettings({ theme: themes[0].id, fontSize: 'medium', borderRadius: 'rounded', chatDensity: 'comfortable', animations: true })}
                className="w-full border border-red-200 text-red-500 hover:bg-red-50 rounded-xl py-2.5 text-sm font-medium transition-colors cursor-pointer mt-4"
              >
                Reset Defaults
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-8">Settings are saved automatically</p>
      </div>
    </div>
  )
}
