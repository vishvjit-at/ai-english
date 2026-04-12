import { Mic, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSettings } from '@/hooks/useSettings'

// ─────────────────────────────────────────────
// Shared floating chips + bottom bar
// ─────────────────────────────────────────────

function Chip({ text, style, dark }: { text: string; style?: React.CSSProperties; dark?: boolean }) {
  return (
    <div
      className="absolute px-3 py-2 rounded-2xl text-xs font-medium whitespace-nowrap shadow-lg animate-float"
      style={{
        background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)',
        color: dark ? '#e2e8f0' : '#374151',
        ...style,
      }}
    >
      {text}
    </div>
  )
}

interface BottomBarProps {
  dark?: boolean
  btnBg?: string
  btnColor?: string
}

function BottomBar({ dark, btnBg, btnColor }: BottomBarProps) {
  return (
    <div
      className="relative z-20 flex items-center justify-between px-8 py-5 shrink-0"
      style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}
    >
      <p className="text-sm font-medium" style={{ color: dark ? '#94a3b8' : '#6b7280' }}>
        More fluency, more confidence, more you.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/practice/custom">
          <button
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full hover-glow cursor-pointer"
            style={{ background: btnBg || '#111827', color: btnColor || '#fff' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Start Practicing
          </button>
        </Link>
        <Link to="/lessons">
          <button
            className="group inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full cursor-pointer hover-slide"
            style={{
              border: `1.5px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
              color: dark ? '#e2e8f0' : '#374151',
              background: 'transparent',
            }}
          >
            View Lessons
            <ArrowRight className="w-3.5 h-3.5 group-arrow" />
          </button>
        </Link>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Design 1 — AURA (colorful rings, teal bg)
// ─────────────────────────────────────────────

function HomeAura() {
  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ background: '#d4ede8' }}>
      {/* Header */}
      <div className="relative z-10 text-center pt-10 pb-2 shrink-0">
        <h1 className="text-4xl font-black text-neutral-800 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Speak Up
        </h1>
        <p className="text-xs tracking-[0.25em] text-neutral-500 mt-1 uppercase">Your English Partner</p>
      </div>

      {/* Orb area — flex-1 */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">

        {/* Right tagline */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-right z-10">
          <p className="font-bold text-neutral-700 leading-tight" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)', fontFamily: 'var(--font-heading)' }}>
            Your AI<br />English Coach
          </p>
          <p className="text-neutral-500 text-sm mt-2">Speak freely. Improve naturally.</p>
        </div>

        {/* Orb with colorful rings */}
        <div className="relative flex items-center justify-center">
          {/* Ring 3 — outer green */}
          <div className="absolute rounded-full" style={{
            width: 320, height: 320,
            border: '2px solid rgba(52,211,153,0.35)',
            background: 'rgba(52,211,153,0.06)',
            animation: 'pulse-ring 3s ease-in-out infinite',
          }} />
          {/* Ring 2 — middle lavender */}
          <div className="absolute rounded-full" style={{
            width: 240, height: 240,
            border: '2px solid rgba(167,139,250,0.45)',
            background: 'rgba(167,139,250,0.08)',
            animation: 'pulse-ring 2.5s ease-in-out infinite 0.4s',
          }} />
          {/* Ring 1 — inner blue */}
          <div className="absolute rounded-full" style={{
            width: 168, height: 168,
            border: '2px solid rgba(96,165,250,0.55)',
            background: 'rgba(96,165,250,0.1)',
            animation: 'pulse-ring 2s ease-in-out infinite 0.8s',
          }} />

          {/* Center orb */}
          <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl animate-float"
            style={{
              background: 'linear-gradient(145deg, #ffffff, #e8f8f4)',
              boxShadow: '0 16px 48px -8px rgba(52,211,153,0.35), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <div className="absolute top-3 left-5 w-8 h-3 bg-white/60 rounded-full blur-sm rotate-[-15deg]" />
            <Mic className="w-12 h-12 relative z-10" style={{ color: '#10b981' }} />
          </div>

          {/* Floating chips */}
          <Chip text='💬 "Tell me about yourself"' style={{ top: -24, right: -80 }} />
          <Chip text='✨ Great pronunciation!' style={{ bottom: -16, left: -88, animationDelay: '1.2s' }} />
        </div>
      </div>

      <BottomBar btnBg="#10b981" btnColor="#fff" />
    </div>
  )
}

// ─────────────────────────────────────────────
// Design 2 — CLARITY (clean white, blue rings)
// ─────────────────────────────────────────────

function HomeClarity() {
  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ background: '#f8fbff' }}>
      {/* Subtle bg tint */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(219,234,254,0.5) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="relative z-10 pt-10 pb-2 px-10 shrink-0">
        <h1 className="text-4xl font-black text-neutral-800 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Speak Up
        </h1>
        <p className="text-xs tracking-[0.25em] text-neutral-400 mt-1 uppercase">Your English Partner</p>
      </div>

      {/* Orb area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">

        {/* Right tagline */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-right z-10">
          <p className="font-bold text-neutral-800 leading-tight" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)', fontFamily: 'var(--font-heading)' }}>
            Your AI<br />English Coach
          </p>
          <p className="text-neutral-400 text-sm mt-2">Speak freely. Improve naturally.</p>
        </div>

        {/* Orb */}
        <div className="relative flex items-center justify-center">
          {/* Rings — all monochrome blue */}
          <div className="absolute rounded-full" style={{
            width: 320, height: 320,
            border: '1.5px solid rgba(147,197,253,0.5)',
            background: 'rgba(219,234,254,0.2)',
            animation: 'pulse-ring 3s ease-in-out infinite',
          }} />
          <div className="absolute rounded-full" style={{
            width: 240, height: 240,
            border: '1.5px solid rgba(96,165,250,0.4)',
            background: 'rgba(191,219,254,0.2)',
            animation: 'pulse-ring 2.5s ease-in-out infinite 0.4s',
          }} />
          <div className="absolute rounded-full" style={{
            width: 168, height: 168,
            border: '1.5px solid rgba(59,130,246,0.35)',
            background: 'rgba(147,197,253,0.15)',
            animation: 'pulse-ring 2s ease-in-out infinite 0.8s',
          }} />

          {/* Center orb */}
          <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl animate-float"
            style={{
              background: 'linear-gradient(145deg, #eff6ff, #dbeafe)',
              boxShadow: '0 16px 48px -8px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <div className="absolute top-3 left-5 w-8 h-3 bg-white/70 rounded-full blur-sm rotate-[-15deg]" />
            <Mic className="w-12 h-12 relative z-10" style={{ color: '#3b82f6' }} />
          </div>

          <Chip text='💬 "Tell me about yourself"' style={{ top: -24, right: -80 }} />
          <Chip text='✨ Great pronunciation!' style={{ bottom: -16, left: -88, animationDelay: '1.2s' }} />
        </div>
      </div>

      <BottomBar btnBg="#2563eb" btnColor="#fff" />
    </div>
  )
}

// ─────────────────────────────────────────────
// Design 3 — NIGHT (dark navy, glowing orb)
// ─────────────────────────────────────────────

function HomeNight() {
  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ background: '#080e1a' }}>
      {/* Deep glow in center */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="relative z-10 pt-10 pb-2 px-10 shrink-0">
        <h1 className="text-4xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
          Speak Up
        </h1>
        <p className="text-xs tracking-[0.25em] mt-1 uppercase" style={{ color: '#475569' }}>Your English Partner</p>
      </div>

      {/* Orb area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">

        {/* Right tagline */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-right z-10">
          <p className="font-bold leading-tight" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)', fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
            Your AI<br />English Coach
          </p>
          <p className="text-sm mt-2" style={{ color: '#64748b' }}>Speak freely. Improve naturally.</p>
        </div>

        {/* Orb */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute rounded-full animate-ping" style={{
            width: 340, height: 340,
            border: '1px solid rgba(99,102,241,0.2)',
            animationDuration: '3s',
          }} />
          {/* Ring 3 */}
          <div className="absolute rounded-full" style={{
            width: 310, height: 310,
            border: '1px solid rgba(99,102,241,0.25)',
            background: 'rgba(99,102,241,0.04)',
            animation: 'pulse-ring 3s ease-in-out infinite',
          }} />
          {/* Ring 2 */}
          <div className="absolute rounded-full" style={{
            width: 230, height: 230,
            border: '1.5px solid rgba(139,92,246,0.35)',
            background: 'rgba(139,92,246,0.06)',
            animation: 'pulse-ring 2.5s ease-in-out infinite 0.5s',
          }} />
          {/* Ring 1 */}
          <div className="absolute rounded-full" style={{
            width: 160, height: 160,
            border: '1.5px solid rgba(167,139,250,0.5)',
            background: 'rgba(139,92,246,0.1)',
            animation: 'pulse-ring 2s ease-in-out infinite 1s',
          }} />

          {/* Center orb — glowing */}
          <div className="relative w-28 h-28 rounded-full flex items-center justify-center animate-float"
            style={{
              background: 'linear-gradient(145deg, #1e1b4b, #312e81)',
              boxShadow: '0 0 40px 12px rgba(99,102,241,0.35), 0 0 80px 24px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div className="absolute top-3 left-5 w-8 h-3 rounded-full blur-sm rotate-[-15deg]" style={{ background: 'rgba(255,255,255,0.12)' }} />
            <Mic className="w-12 h-12 relative z-10" style={{ color: '#a5b4fc' }} />
          </div>

          <Chip text='💬 "Tell me about yourself"' dark style={{ top: -24, right: -80 }} />
          <Chip text='✨ Great pronunciation!' dark style={{ bottom: -16, left: -88, animationDelay: '1.2s' }} />
        </div>
      </div>

      <BottomBar dark btnBg="#4f46e5" btnColor="#fff" />
    </div>
  )
}

// ─────────────────────────────────────────────
// Root — picks design from settings
// ─────────────────────────────────────────────

export function HomePage() {
  const { settings } = useSettings()

  if (settings.homeStyle === 'aura')    return <HomeAura />
  if (settings.homeStyle === 'night')   return <HomeNight />
  return <HomeClarity />
}
