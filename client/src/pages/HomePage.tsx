import { useEffect, useRef, useState } from 'react'
import { Mic, Sparkles, ArrowRight, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSettings } from '@/hooks/useSettings'
import { useAuth } from '@/hooks/useAuth'
import type { CSSProperties, ReactNode } from 'react'

// ─────────────────────────────────────────────
// User avatar + logout menu — top-right overlay
// ─────────────────────────────────────────────

function HomeUserMenu({ dark }: { dark?: boolean }) {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  // Not logged in — show Sign In button
  if (!user) {
    return (
      <div className="absolute top-5 right-6 z-30">
        <Link
          to="/login"
          className="px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all hover:scale-105"
          style={{
            background: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            border: dark ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid rgba(0,0,0,0.12)',
            color: dark ? '#e2e8f0' : '#374151',
          }}
        >
          Sign In
        </Link>
      </div>
    )
  }

  const initial = (user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="absolute top-5 right-6 z-30">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm cursor-pointer transition-transform hover:scale-105"
        style={{
          background: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
          border: dark ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid rgba(0,0,0,0.12)',
          color: dark ? '#e2e8f0' : '#374151',
        }}
      >
        {avatarUrl
          ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          : initial
        }
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-12 z-30 rounded-2xl shadow-xl overflow-hidden min-w-[180px]"
            style={{
              background: dark ? '#0f172a' : '#ffffff',
              border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
              <p className="text-xs font-semibold truncate" style={{ color: dark ? '#94a3b8' : '#6b7280' }}>
                {user.user_metadata?.full_name || user.email}
              </p>
            </div>
            <button
              onClick={() => { setOpen(false); signOut() }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold cursor-pointer transition-colors"
              style={{ color: dark ? '#f87171' : '#ef4444' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = dark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Shared particle field — drop inside any mag-btn/mag-orb
// ─────────────────────────────────────────────

function ParticleField({ color = 'rgba(255,255,255,0.8)', count = 55, spread = 110 }: {
  color?: string
  count?: number
  spread?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const field = ref.current
    if (!field) return
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      p.className = 'mag-particle'
      p.style.setProperty('--px', `${Math.random() * spread * 2 - spread}px`)
      p.style.setProperty('--py', `${Math.random() * spread * 2 - spread}px`)
      p.style.animationName = 'particleFloat'
      p.style.animationDuration = `${1.2 + Math.random() * 1.8}s`
      p.style.animationTimingFunction = 'ease-in-out'
      p.style.animationIterationCount = 'infinite'
      p.style.animationDelay = `${Math.random() * 2}s`
      p.style.left = `${Math.random() * 100}%`
      p.style.top = `${Math.random() * 100}%`
      p.style.background = color
      field.appendChild(p)
    }
  }, [color, count, spread])
  return <div className="mag-field" ref={ref} />
}

// ─────────────────────────────────────────────
// Magnetic particle button
// ─────────────────────────────────────────────

function MagneticButton({
  children, style, particleColor = 'rgba(255,255,255,0.8)',
}: {
  children: ReactNode
  style?: CSSProperties
  particleColor?: string
}) {
  return (
    <button className="mag-btn inline-flex items-center gap-2 text-white text-sm font-semibold px-7 py-3 rounded-full" style={style}>
      {children}
      <ParticleField color={particleColor} />
    </button>
  )
}

// ─────────────────────────────────────────────
// Shared pieces
// ─────────────────────────────────────────────

function Chip({ text, style, dark }: { text: string; style?: CSSProperties; dark?: boolean }) {
  return (
    <div
      className="absolute px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap shadow-lg animate-float"
      style={{
        background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.07)',
        color: dark ? '#cbd5e1' : '#1f2937',
        ...style,
      }}
    >
      {text}
    </div>
  )
}

interface BottomBarProps {
  dark?: boolean
  btnBg: string
  particleColor?: string
}

function BottomBar({ dark, btnBg, particleColor }: BottomBarProps) {
  return (
    <div
      className="shrink-0 flex items-center justify-between px-10 py-5"
      style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` }}
    >
      <p className="text-sm font-medium tracking-wide" style={{ color: dark ? '#475569' : '#9ca3af' }}>
        More fluency, more confidence, more you.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/practice/custom">
          <MagneticButton style={{ background: btnBg }} particleColor={particleColor}>
            <Sparkles className="w-3.5 h-3.5" />
            Start Practicing
          </MagneticButton>
        </Link>
        <Link to="/lessons">
          <button
            className="group inline-flex items-center gap-2 text-sm font-semibold px-7 py-3 rounded-full cursor-pointer hover-slide"
            style={{
              border: `1.5px solid ${dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.13)'}`,
              color: dark ? '#e2e8f0' : '#374151',
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

// Size helpers — orb fills ~65% of viewport height
const S = {
  r1: 'clamp(280px, 60vh, 580px)',   // outer ring
  r2: 'clamp(210px, 46vh, 440px)',   // mid ring
  r3: 'clamp(148px, 32vh, 308px)',   // inner ring
  orb: 'clamp(90px, 17vh, 164px)',   // center orb
  mic: 'clamp(36px, 7vh, 68px)',     // mic icon
}

// ─────────────────────────────────────────────
// Design 1 — AURA
// ─────────────────────────────────────────────

function HomeAura() {
  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ background: '#c8e0ea' }}>
      <HomeUserMenu />

      {/* Top title */}
      <div className="relative z-10 pt-8 px-10 shrink-0">
        <h1 className="font-black tracking-tight leading-none"
          style={{ fontSize: 'clamp(2.8rem, 5.5vw, 5rem)', fontFamily: 'var(--font-heading)', color: '#1e3a4a' }}>
          Speak Up
        </h1>
        <p className="text-xs tracking-[0.3em] mt-2 uppercase" style={{ color: '#5a8a9f' }}>Your English Partner</p>
      </div>

      {/* Orb */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">

        {/* Tagline */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-right z-20 max-w-[220px]">
          <p className="font-black leading-[1.1]"
            style={{ fontSize: 'clamp(1.8rem, 3.2vw, 3rem)', fontFamily: 'var(--font-heading)', color: '#1e3a4a' }}>
            Your AI<br />English<br />Coach
          </p>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: '#5a8a9f' }}>Speak freely.<br />Improve naturally.</p>
        </div>

        {/* Rings — outer: sage green, mid: lavender, inner: sky blue */}
        <div className="relative flex items-center justify-center">
          <div className="absolute rounded-full" style={{
            width: S.r1, height: S.r1,
            border: '2px solid rgba(134,200,155,0.55)',
            background: 'rgba(134,200,155,0.1)',
            animation: 'pulse-ring 3.2s ease-in-out infinite',
          }} />
          <div className="absolute rounded-full" style={{
            width: S.r2, height: S.r2,
            border: '2px solid rgba(192,168,250,0.6)',
            background: 'rgba(192,168,250,0.1)',
            animation: 'pulse-ring 2.6s ease-in-out infinite 0.5s',
          }} />
          <div className="absolute rounded-full" style={{
            width: S.r3, height: S.r3,
            border: '2px solid rgba(120,180,240,0.65)',
            background: 'rgba(120,180,240,0.12)',
            animation: 'pulse-ring 2s ease-in-out infinite 1s',
          }} />

          {/* Orb — pearl white */}
          <Link to="/practice/custom">
            <div className="mic-orb relative rounded-full flex items-center justify-center animate-float cursor-pointer"
              style={{
                width: S.orb, height: S.orb,
                background: 'linear-gradient(145deg, #ffffff, #eef4f8)',
                boxShadow: '0 24px 64px -12px rgba(100,140,200,0.3), 0 8px 24px -4px rgba(100,140,200,0.2), inset 0 2px 0 rgba(255,255,255,1)',
              }}
            >
              <div className="absolute top-[18%] left-[28%] w-[35%] h-[18%] bg-white/70 rounded-full blur-sm rotate-[-15deg]" />
              <Mic style={{ width: S.mic, height: S.mic, color: '#7c8fcc' }} className="relative z-10" />
              <ParticleField color="rgba(0,0,0,0.45)" count={45} spread={130} />
            </div>
          </Link>

          <Chip text='💬 "Tell me about yourself"'
            style={{ top: '-12%', right: '-55%', animationDelay: '0s' }} />
          <Chip text='✨ Great pronunciation!'
            style={{ bottom: '-8%', left: '-58%', animationDelay: '1.3s' }} />
        </div>
      </div>

      {/* Buttons match reference: muted sage + soft teal */}
      <div className="shrink-0 flex items-center justify-between px-10 py-5"
        style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
        <p className="text-sm font-medium tracking-wide" style={{ color: '#5a8a9f' }}>
          More fluency, more confidence, more you.
        </p>
        <div className="flex items-center gap-3">
          <Link to="/practice/custom">
            <MagneticButton style={{ background: '#6aaa82' }} particleColor="rgba(0,0,0,0.55)">
              <Sparkles className="w-3.5 h-3.5" />
              Start Practicing
            </MagneticButton>
          </Link>
          <Link to="/lessons">
            <button className="group inline-flex items-center gap-2 text-sm font-semibold px-7 py-3 rounded-full cursor-pointer hover-slide"
              style={{ background: '#7dbdba', color: '#fff', border: 'none' }}>
              View Lessons
              <ArrowRight className="w-3.5 h-3.5 group-arrow" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Design 2 — CLARITY
// ─────────────────────────────────────────────

function HomeClarity() {
  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ background: '#f5f9ff' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 52%, rgba(191,219,254,0.45) 0%, transparent 65%)' }} />
      <HomeUserMenu />

      {/* Top title */}
      <div className="relative z-10 pt-8 px-10 shrink-0">
        <h1 className="font-black text-neutral-800 tracking-tight leading-none"
          style={{ fontSize: 'clamp(2.8rem, 5.5vw, 5rem)', fontFamily: 'var(--font-heading)' }}>
          Speak Up
        </h1>
        <p className="text-xs tracking-[0.3em] text-neutral-400 mt-2 uppercase">Your English Partner</p>
      </div>

      {/* Orb */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">

        {/* Tagline */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-right z-20 max-w-[220px]">
          <p className="font-black text-neutral-800 leading-[1.1]"
            style={{ fontSize: 'clamp(1.8rem, 3.2vw, 3rem)', fontFamily: 'var(--font-heading)' }}>
            Your AI<br />English<br />Coach
          </p>
          <p className="text-neutral-400 text-sm mt-3 leading-relaxed">Speak freely.<br />Improve naturally.</p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute rounded-full" style={{
            width: S.r1, height: S.r1,
            border: '1.5px solid rgba(147,197,253,0.45)',
            background: 'rgba(219,234,254,0.18)',
            animation: 'pulse-ring 3.2s ease-in-out infinite',
          }} />
          <div className="absolute rounded-full" style={{
            width: S.r2, height: S.r2,
            border: '1.5px solid rgba(96,165,250,0.4)',
            background: 'rgba(191,219,254,0.18)',
            animation: 'pulse-ring 2.6s ease-in-out infinite 0.5s',
          }} />
          <div className="absolute rounded-full" style={{
            width: S.r3, height: S.r3,
            border: '1.5px solid rgba(59,130,246,0.38)',
            background: 'rgba(147,197,253,0.14)',
            animation: 'pulse-ring 2s ease-in-out infinite 1s',
          }} />

          <Link to="/practice/custom">
            <div className="mic-orb relative rounded-full flex items-center justify-center shadow-2xl animate-float cursor-pointer"
              style={{
                width: S.orb, height: S.orb,
                background: 'linear-gradient(145deg, #eff6ff, #dbeafe)',
                boxShadow: '0 24px 64px -12px rgba(59,130,246,0.28), inset 0 2px 0 rgba(255,255,255,0.9)',
              }}
            >
              <div className="absolute top-[18%] left-[28%] w-[35%] h-[18%] bg-white/60 rounded-full blur-sm rotate-[-15deg]" />
              <Mic style={{ width: S.mic, height: S.mic, color: '#2563eb' }} className="relative z-10" />
              <ParticleField color="rgba(0,0,0,0.45)" count={45} spread={130} />
            </div>
          </Link>

          <Chip text='💬 "Tell me about yourself"'
            style={{ top: '-12%', right: '-55%', animationDelay: '0s' }} />
          <Chip text='✨ Great pronunciation!'
            style={{ bottom: '-8%', left: '-58%', animationDelay: '1.3s' }} />
        </div>
      </div>

      <BottomBar btnBg="#2563eb" particleColor="rgba(0,0,0,0.55)" />
    </div>
  )
}

// ─────────────────────────────────────────────
// Design 3 — NIGHT
// ─────────────────────────────────────────────

function HomeNight() {
  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ background: '#07090f' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 50% at 50% 54%, rgba(79,70,229,0.22) 0%, rgba(124,58,237,0.1) 40%, transparent 68%)' }} />
      <HomeUserMenu dark />

      {/* Top title */}
      <div className="relative z-10 pt-8 px-10 shrink-0">
        <h1 className="font-black tracking-tight leading-none"
          style={{ fontSize: 'clamp(2.8rem, 5.5vw, 5rem)', fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
          Speak Up
        </h1>
        <p className="text-xs tracking-[0.3em] mt-2 uppercase" style={{ color: '#334155' }}>Your English Partner</p>
      </div>

      {/* Orb */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">

        {/* Tagline */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-right z-20 max-w-[220px]">
          <p className="font-black leading-[1.1]"
            style={{ fontSize: 'clamp(1.8rem, 3.2vw, 3rem)', fontFamily: 'var(--font-heading)', color: '#f1f5f9' }}>
            Your AI<br />English<br />Coach
          </p>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: '#475569' }}>Speak freely.<br />Improve naturally.</p>
        </div>

        <div className="relative flex items-center justify-center">
          {/* Ping ring */}
          <div className="absolute rounded-full animate-ping" style={{
            width: S.r1, height: S.r1,
            border: '1px solid rgba(99,102,241,0.15)',
            animationDuration: '3.5s',
          }} />
          <div className="absolute rounded-full" style={{
            width: S.r1, height: S.r1,
            border: '1px solid rgba(99,102,241,0.2)',
            background: 'rgba(99,102,241,0.03)',
            animation: 'pulse-ring 3.2s ease-in-out infinite',
          }} />
          <div className="absolute rounded-full" style={{
            width: S.r2, height: S.r2,
            border: '1.5px solid rgba(139,92,246,0.32)',
            background: 'rgba(139,92,246,0.05)',
            animation: 'pulse-ring 2.6s ease-in-out infinite 0.5s',
          }} />
          <div className="absolute rounded-full" style={{
            width: S.r3, height: S.r3,
            border: '1.5px solid rgba(167,139,250,0.45)',
            background: 'rgba(139,92,246,0.08)',
            animation: 'pulse-ring 2s ease-in-out infinite 1s',
          }} />

          <Link to="/practice/custom">
            <div className="mic-orb relative rounded-full flex items-center justify-center animate-float cursor-pointer"
              style={{
                width: S.orb, height: S.orb,
                background: 'linear-gradient(145deg, #1e1b4b, #2e1065)',
                boxShadow: '0 0 48px 16px rgba(99,102,241,0.4), 0 0 96px 32px rgba(139,92,246,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <div className="absolute top-[18%] left-[28%] w-[35%] h-[18%] rounded-full blur-sm rotate-[-15deg]"
                style={{ background: 'rgba(255,255,255,0.1)' }} />
              <Mic style={{ width: S.mic, height: S.mic, color: '#a5b4fc' }} className="relative z-10" />
              <ParticleField color="rgba(255,255,255,0.75)" count={45} spread={130} />
            </div>
          </Link>

          <Chip text='💬 "Tell me about yourself"' dark
            style={{ top: '-12%', right: '-55%', animationDelay: '0s' }} />
          <Chip text='✨ Great pronunciation!' dark
            style={{ bottom: '-8%', left: '-58%', animationDelay: '1.3s' }} />
        </div>
      </div>

      <BottomBar dark btnBg="#4f46e5" particleColor="rgba(255,255,255,0.8)" />
    </div>
  )
}

// ─────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────

export function HomePage() {
  const { settings } = useSettings()
  if (settings.homeStyle === 'aura')  return <HomeAura />
  if (settings.homeStyle === 'night') return <HomeNight />
  return <HomeClarity />
}
