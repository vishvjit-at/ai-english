import { useEffect, useState } from 'react'
import { Play, AlertTriangle, Moon, Sun } from 'lucide-react'
import { useSettings, type VoiceOption } from '@/hooks/useSettings'
import { useDarkMode } from '@/components/layout/AppLayout'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/lib/speakup-theme'
import { supabase } from '@/lib/supabase'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

interface ServerVoice { id: string; name: string; lang: string; type: string }
interface UsageInfo { used: number; limit: number }

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

export function SettingsPage() {
  const T = useTheme()
  const { settings, updateSettings, availableVoices } = useSettings()
  const { dark, toggleDark } = useDarkMode()
  const { user } = useAuth()

  const [serverVoices, setServerVoices] = useState<ServerVoice[]>([])
  const [loadingVoices, setLoadingVoices] = useState(false)
  const [usage, setUsage] = useState<{ elevenlabs?: UsageInfo } | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [reminders, setReminders] = useState(false)
  const [reminderTime, setReminderTime] = useState('08:00')
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(user?.user_metadata?.full_name || '')

  useEffect(() => {
    if (settings.voiceProvider === 'browser') { setServerVoices([]); return }
    setLoadingVoices(true)
    getAuthHeaders().then((headers) =>
      fetch(`${API_BASE}/voice/voices?provider=${settings.voiceProvider}`, { headers })
        .then((r) => r.json())
        .then((data: { voices: ServerVoice[] }) => setServerVoices(data.voices || []))
        .catch(() => setServerVoices([]))
        .finally(() => setLoadingVoices(false))
    )
  }, [settings.voiceProvider])

  useEffect(() => {
    getAuthHeaders().then((headers) =>
      fetch(`${API_BASE}/voice/usage`, { headers })
        .then((r) => r.json())
        .then((data) => setUsage(data))
        .catch(() => {})
    )
  }, [])

  const voiceList: VoiceOption[] = settings.voiceProvider === 'browser'
    ? availableVoices
    : serverVoices.map((v) => ({ id: v.id, name: v.name, lang: v.lang, type: v.type }))

  const usageInfo = usage?.elevenlabs || null
  const isLimitExceeded = usageInfo ? usageInfo.used >= usageInfo.limit : false

  const formatNumber = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return String(n)
  }

  const handlePreview = async () => {
    const previewText = "Hello! I'm Aria, your English speaking partner."
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
    setIsPreviewing(true)
    try {
      const res = await fetch(`${API_BASE}/voice/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({ text: previewText, provider: settings.voiceProvider, voiceName: settings.voiceName, speed: settings.voiceSpeed }),
      })
      const data = await res.json()
      if (data.audio) {
        const audio = new Audio(`data:${data.contentType || 'audio/mp3'};base64,${data.audio}`)
        audio.play()
      }
    } catch { /* ignore */ }
    finally { setIsPreviewing(false) }
  }

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const inputStyle: React.CSSProperties = {
    width: '100%', maxWidth: 360, padding: '12px 16px', borderRadius: T.radiusSm,
    border: `1px solid ${T.border}`, fontFamily: T.bodyFont, fontSize: 15,
    outline: 'none', color: T.heading, background: T.surface,
    transition: 'border-color 0.2s',
  }
  const labelStyle: React.CSSProperties = {
    fontFamily: T.bodyFont, fontSize: 14, fontWeight: 600, color: T.heading,
    display: 'block', marginBottom: 8,
  }

  return (
    <div style={{ background: T.bg, minHeight: 'calc(100vh - 64px)', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.indigo, fontFamily: T.bodyFont, marginBottom: 6 }}>
            Settings
          </div>
          <h1 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 'clamp(26px, 3.4vw, 34px)', color: T.heading, letterSpacing: -0.5, margin: '0 0 6px' }}>
            Preferences
          </h1>
          <p style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.body, margin: 0, lineHeight: 1.5 }}>
            Manage your profile, voice settings, and account.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 18, marginBottom: 18 }}>

        <Section title="Profile" subtitle="Your display name and email address.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = T.indigo)}
                onBlur={(e) => (e.currentTarget.style.borderColor = T.border)} />
            </div>
            <div>
              <label style={labelStyle}>Email address</label>
              <input value={user?.email || ''} readOnly style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
          </div>
        </Section>

        <Section title="Voice & Audio" subtitle="AI voice provider, voice, and speech speed.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Voice provider</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {([
                  { id: 'browser', label: 'Browser', sub: 'Free, built-in' },
                  { id: 'elevenlabs', label: 'ElevenLabs', sub: 'Higher quality' },
                ] as const).map((opt) => {
                  const active = settings.voiceProvider === opt.id
                  return (
                    <button key={opt.id}
                      onClick={() => updateSettings({ voiceProvider: opt.id, voiceName: '' })}
                      style={{
                        flex: '1 1 160px', textAlign: 'left',
                        padding: '12px 16px', borderRadius: T.radiusSm,
                        border: active ? `2px solid ${T.indigo}` : `1px solid ${T.border}`,
                        background: active ? T.indigoLight : T.surface,
                        cursor: 'pointer', fontFamily: T.bodyFont,
                        transition: 'all 0.18s',
                      }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.heading }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: T.bodyLight, marginTop: 2 }}>{opt.sub}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label style={labelStyle}>AI voice</label>
              <select
                value={settings.voiceName}
                onChange={(e) => updateSettings({ voiceName: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Auto-select</option>
                {loadingVoices ? (
                  <option disabled>Loading voices…</option>
                ) : (
                  voiceList.map((v) => {
                    const key = settings.voiceProvider === 'browser' ? v.name : (v.id || v.name)
                    return <option key={key} value={key}>{v.name} {v.lang ? `(${v.lang})` : ''}</option>
                  })
                )}
              </select>
            </div>

            {usageInfo && (
              <div style={{ padding: 14, borderRadius: T.radiusSm, background: T.bgAlt }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: T.bodyFont, fontSize: 12, fontWeight: 600, color: T.heading }}>Usage this month</span>
                  <span style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.bodyLight }}>
                    {formatNumber(usageInfo.used)} / {formatNumber(usageInfo.limit)} chars
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: T.border, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: isLimitExceeded ? T.red : T.indigo,
                    width: `${Math.min(100, (usageInfo.used / usageInfo.limit) * 100)}%`,
                  }} />
                </div>
                {isLimitExceeded && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, fontWeight: 600, color: T.red, fontFamily: T.bodyFont }}>
                    <AlertTriangle size={14} /> Free limit reached — switch to Browser voice
                  </div>
                )}
              </div>
            )}

            <div>
              <label style={labelStyle}>AI voice speed — {settings.voiceSpeed}×</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 360 }}>
                <span style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.bodyLight }}>0.5×</span>
                <input type="range" min="0.5" max="2" step="0.1" value={settings.voiceSpeed}
                  onChange={(e) => updateSettings({ voiceSpeed: parseFloat(e.target.value) })}
                  style={{ flex: 1, accentColor: T.indigo }} />
                <span style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.bodyLight }}>2×</span>
              </div>
            </div>

            <button onClick={handlePreview} disabled={isPreviewing || isLimitExceeded}
              style={{
                fontFamily: T.bodyFont, fontSize: 14, fontWeight: 600, border: 'none',
                padding: '10px 18px', borderRadius: T.radiusSm, cursor: isLimitExceeded ? 'not-allowed' : 'pointer',
                background: T.indigoLight, color: T.indigo, alignSelf: 'flex-start',
                display: 'inline-flex', alignItems: 'center', gap: 6, opacity: isLimitExceeded ? 0.5 : 1,
                transition: 'all 0.2s',
              }}>
              <Play size={14} /> {isPreviewing ? 'Playing…' : 'Preview Voice'}
            </button>
          </div>
        </Section>

        <Section title="Appearance" subtitle="Customize how SpeakUp looks.">
          <ToggleRow
            label="Dark mode"
            sub="Switch between light and dark interface"
            on={dark}
            onChange={toggleDark}
            iconOn={<Moon size={16} />}
            iconOff={<Sun size={16} />}
          />
        </Section>

        <Section title="Daily Reminders" subtitle="Get a notification to practice each day.">
          <ToggleRow
            label="Enable daily reminders"
            on={reminders}
            onChange={() => setReminders((r) => !r)}
          />
          {reminders && (
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Reminder time</label>
              <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)}
                style={{ ...inputStyle, maxWidth: 180 }} />
            </div>
          )}
        </Section>

        <Section title="Account" subtitle="Security and account management.">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <SecondaryBtn>Change password</SecondaryBtn>
            <SecondaryBtn danger>Delete account</SecondaryBtn>
          </div>
        </Section>

        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
          <button onClick={handleSave} style={{
            fontFamily: T.bodyFont, fontSize: 16, fontWeight: 600, border: 'none',
            padding: '14px 36px', borderRadius: T.radiusSm, cursor: 'pointer',
            background: T.indigo, color: '#fff', transition: 'all 0.25s',
          }}>Save changes</button>
          {saved && (
            <span style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.green, fontWeight: 600 }}>
              ✓ Saved!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const T = useTheme()
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
      padding: 22,
    }}>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 15, color: T.heading, margin: 0 }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.bodyLight, margin: '4px 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

function ToggleRow({ label, sub, on, onChange, iconOn, iconOff }: {
  label: string; sub?: string; on: boolean; onChange: () => void;
  iconOn?: React.ReactNode; iconOff?: React.ReactNode;
}) {
  const T = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.heading, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          {(on ? iconOn : iconOff) || null} {label}
        </div>
        {sub && <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight, marginTop: 4 }}>{sub}</div>}
      </div>
      <button onClick={onChange} style={{
        width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
        background: on ? T.indigo : T.border, position: 'relative', transition: 'background 0.2s',
        flexShrink: 0,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, left: on ? 23 : 3,
          transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }} />
      </button>
    </div>
  )
}

function SecondaryBtn({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  const T = useTheme()
  const [h, setH] = useState(false)
  const color = danger ? T.red : T.heading
  const border = danger ? T.red : T.border
  return (
    <button onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontFamily: T.bodyFont, fontSize: 14, fontWeight: 600,
        border: `1.5px solid ${border}`, padding: '10px 22px',
        borderRadius: T.radiusSm, cursor: 'pointer',
        background: h ? (danger ? `${T.red}10` : T.bgAlt) : T.surface,
        color, transition: 'all 0.2s',
      }}>{children}</button>
  )
}
