import { useEffect, useRef, useState } from 'react'
import { LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// ─────────────────────────────────────────────
// Subtle dot-grid with cursor repulsion + glow
// ─────────────────────────────────────────────
function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const glow = glowRef.current
    if (!canvas || !glow) return
    const ctx = canvas.getContext('2d')!

    let W = 0, H = 0, dpr = 1
    let dots: { bx: number; by: number; x: number; y: number }[] = []
    let rafId: number
    let mx = -1000, my = -1000

    const COLS = 18, ROWS = 12

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dots = Array.from({ length: COLS * ROWS }, (_, i) => {
        const col = i % COLS, row = Math.floor(i / COLS)
        const bx = (col + 0.5) * (W / COLS)
        const by = (row + 0.5) * (H / ROWS)
        return { bx, by, x: bx, y: by }
      })
    }

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    const onLeave = () => { mx = -1000; my = -1000 }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      glow.style.left = mx + 'px'
      glow.style.top = my + 'px'

      for (const d of dots) {
        const dx = mx - d.bx, dy = my - d.by
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const range = 220

        if (dist < range) {
          const push = (1 - dist / range) * 18
          d.x = d.bx - (dx / dist) * push
          d.y = d.by - (dy / dist) * push
        } else {
          d.x += (d.bx - d.x) * 0.08
          d.y += (d.by - d.y) * 0.08
        }

        const proximity = Math.max(0, 1 - dist / range)
        const alpha = 0.06 + proximity * 0.2
        const r = 1.5 + proximity * 1.5

        ctx.beginPath()
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${alpha})`
        ctx.fill()
      }

      rafId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }} />
      <div ref={glowRef} style={{
        position: 'fixed', width: 500, height: 500, borderRadius: '50%',
        pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 65%)',
        transform: 'translate(-50%, -50%)',
        left: -1000, top: -1000,
        transition: 'left 0.6s cubic-bezier(0.22,1,0.36,1), top 0.6s cubic-bezier(0.22,1,0.36,1)',
      }} />
    </>
  )
}

// ─────────────────────────────────────────────
// Scroll reveal hook
// ─────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 }
    )
    document.querySelectorAll('.hp-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ─────────────────────────────────────────────
// Auth-aware nav sign in / avatar
// ─────────────────────────────────────────────
function NavUserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) {
    return (
      <Link
        to="/login"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          color: 'oklch(0.55 0.22 275)',
          background: 'transparent',
          border: '1.5px solid oklch(0.55 0.22 275 / 0.3)',
          padding: '9px 22px',
          borderRadius: 12,
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          textDecoration: 'none',
          display: 'inline-block',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'oklch(0.55 0.22 275 / 0.06)'
          e.currentTarget.style.borderColor = 'oklch(0.55 0.22 275)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'oklch(0.55 0.22 275 / 0.3)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        Sign In
      </Link>
    )
  }

  const initial = (user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          background: 'oklch(0.55 0.22 275 / 0.1)',
          border: '1.5px solid oklch(0.55 0.22 275 / 0.25)',
          color: 'oklch(0.55 0.22 275)',
        }}
      >
        {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute',
            right: 0,
            top: 48,
            zIndex: 30,
            borderRadius: 16,
            boxShadow: '0 8px 40px oklch(0.2 0.05 275 / 0.15)',
            overflow: 'hidden',
            minWidth: 180,
            background: '#fff',
            border: '1px solid oklch(0.9 0.01 275)',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid oklch(0.93 0.005 275)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'oklch(0.45 0.02 275)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.user_metadata?.full_name || user.email}
              </p>
            </div>
            <button
              onClick={() => { setOpen(false); signOut() }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 600,
                color: '#ef4444',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// AI orb waveform
// ─────────────────────────────────────────────
function OrbWaveform() {
  const heights = [18, 32, 48, 56, 40, 52, 36, 20]
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: 5, height: 60 }}>
      {heights.map((h, i) => (
        <span key={i} style={{
          display: 'block',
          width: 4,
          height: h,
          borderRadius: 4,
          background: 'linear-gradient(180deg, oklch(0.55 0.22 275), oklch(0.70 0.18 30))',
          animation: `orbWave 1.4s ease-in-out ${i * 0.1}s infinite`,
        }} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Expanding ring
// ─────────────────────────────────────────────
function OrbRing({ delay }: { delay: number }) {
  return (
    <div style={{
      position: 'absolute',
      inset: '30%',
      borderRadius: '50%',
      border: '1.5px solid oklch(0.55 0.22 275 / 0.12)',
      animation: `ringExpand 4s ease-out ${delay}s infinite`,
    }} />
  )
}

// ─────────────────────────────────────────────
// Main homepage
// ─────────────────────────────────────────────
export function HomePage() {
  useScrollReveal()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('hp-scrolled', window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: 'oklch(0.18 0.02 275)', background: 'oklch(0.985 0.005 275)', overflowX: 'hidden', WebkitFontSmoothing: 'antialiased', position: 'relative', zIndex: 1 }}>
      <DotGrid />
      <style>{`
        .hp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 clamp(24px, 5vw, 80px);
          height: 72px;
          display: flex; align-items: center; justify-content: space-between;
          background: oklch(0.985 0.005 275 / 0.85);
          backdrop-filter: blur(20px) saturate(1.4);
          border-bottom: 1px solid oklch(0.85 0.02 275 / 0.5);
          transition: box-shadow 0.3s;
        }
        .hp-nav.hp-scrolled { box-shadow: 0 2px 24px oklch(0.2 0.05 275 / 0.08); }
        .hp-nav-link {
          font-size: 15px; font-weight: 500; color: oklch(0.45 0.02 275);
          text-decoration: none; padding: 8px 16px; border-radius: 10px;
          transition: color 0.2s, background 0.2s;
        }
        .hp-nav-link:hover { color: oklch(0.55 0.22 275); background: oklch(0.55 0.22 275 / 0.06); }
        .hp-btn-primary {
          font-family: 'DM Sans', sans-serif; font-size: 17px; font-weight: 600;
          color: #fff; background: oklch(0.55 0.22 275);
          border: none; padding: 16px 36px; border-radius: 16px; cursor: pointer;
          position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 10px;
          text-decoration: none;
          box-shadow: 0 4px 24px oklch(0.55 0.22 275 / 0.3), 0 1px 3px oklch(0.55 0.22 275 / 0.2);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .hp-btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 32px oklch(0.55 0.22 275 / 0.4), 0 2px 8px oklch(0.55 0.22 275 / 0.2);
        }
        .hp-btn-primary:active { transform: translateY(0) scale(0.98); }
        .hp-btn-secondary {
          font-family: 'DM Sans', sans-serif; font-size: 17px; font-weight: 600;
          color: oklch(0.18 0.02 275); background: oklch(0.95 0.005 275);
          border: 1.5px solid oklch(0.85 0.02 275); padding: 15px 32px; border-radius: 16px;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .hp-btn-secondary:hover {
          background: oklch(0.92 0.01 275); border-color: oklch(0.75 0.04 275);
          transform: translateY(-2px); box-shadow: 0 4px 16px oklch(0.2 0.02 275 / 0.08);
        }
        .hp-btn-secondary:active { transform: translateY(0); }
        .hp-feature-card {
          padding: 36px; border-radius: 20px;
          background: oklch(0.98 0.003 275); border: 1px solid oklch(0.9 0.01 275);
          position: relative; overflow: hidden;
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s, border-color 0.35s;
        }
        .hp-feature-card::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, oklch(0.55 0.22 275), oklch(0.70 0.18 30));
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .hp-feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px oklch(0.2 0.05 275 / 0.1); border-color: oklch(0.8 0.04 275); }
        .hp-feature-card:hover::after { transform: scaleX(1); }
        .hp-orb-ring-pulse::before {
          content: ''; position: absolute; inset: 40px; border-radius: 50%;
          border: 2px solid oklch(0.55 0.22 275 / 0.12);
          animation: orbPulse 3s ease-in-out infinite;
        }
        .hp-orb-ring-pulse::after {
          content: ''; position: absolute; inset: 80px; border-radius: 50%;
          border: 2px solid oklch(0.55 0.22 275 / 0.08);
          animation: orbPulse 3s ease-in-out 0.5s infinite;
        }
        .hp-chat-bubble { position: absolute; padding: 10px 16px; border-radius: 16px; font-size: 13px; font-weight: 500; white-space: nowrap; pointer-events: none; box-shadow: 0 4px 20px oklch(0.2 0.05 275 / 0.08); }
        .hp-chat-user { background: oklch(0.55 0.22 275); color: #fff; border-bottom-right-radius: 4px; animation: bubbleFloat 6s ease-in-out infinite; }
        .hp-chat-ai { background: #fff; color: oklch(0.18 0.02 275); border: 1px solid oklch(0.9 0.01 275); border-bottom-left-radius: 4px; animation: bubbleFloat 6s ease-in-out -2s infinite; }
        .hp-chat-ai2 { background: #fff; color: oklch(0.18 0.02 275); border: 1px solid oklch(0.9 0.01 275); border-bottom-left-radius: 4px; animation: bubbleFloat 6s ease-in-out -4s infinite; }
        @media (max-width: 640px) { .hp-nav-link { display: none; } }
        @media (max-width: 900px) { .hp-hero-inner { flex-direction: column !important; } .hp-orb-col { display: none !important; } }
      `}</style>

      {/* NAV */}
      <nav className="hp-nav" ref={navRef}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: 'oklch(0.55 0.22 275)', textDecoration: 'none', letterSpacing: -0.5 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="oklch(0.55 0.22 275)" />
            <path d="M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="16" cy="12" r="2.5" fill="#fff" />
            <path d="M8 22c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </svg>
          SpeakUp
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="#features" className="hp-nav-link">Features</a>
          <a href="#how" className="hp-nav-link">How it works</a>
          <Link to="/lessons" className="hp-nav-link">Lessons</Link>
          <NavUserMenu />
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', padding: '72px clamp(24px, 5vw, 64px) 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="hp-hero-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(40px, 6vw, 80px)', maxWidth: 1040, width: '100%', position: 'relative', zIndex: 2 }}>

          {/* Left: text */}
          <div style={{ flex: '0 0 auto', width: 'min(500px, 100%)', textAlign: 'left' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'oklch(0.55 0.22 275 / 0.08)', border: '1px solid oklch(0.55 0.22 275 / 0.15)', padding: '6px 16px 6px 10px', borderRadius: 100, fontSize: 14, fontWeight: 500, color: 'oklch(0.55 0.22 275)', marginBottom: 28, animation: 'fadeUp 0.6s ease-out both' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.65 0.18 145)', flexShrink: 0, animation: 'pulseDot 2s ease-in-out infinite' }} />
              AI-Powered Practice
            </div>

            {/* H1 */}
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(42px, 6vw, 68px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5, color: 'oklch(0.18 0.02 275)', marginBottom: 24, textWrap: 'balance', animation: 'fadeUp 0.6s ease-out 0.1s both' }}>
              Speak English with{' '}
              <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, oklch(0.55 0.22 275), oklch(0.70 0.18 30))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>confidence</em>
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: 'clamp(17px, 2vw, 20px)', lineHeight: 1.6, color: 'oklch(0.45 0.02 275)', maxWidth: 520, margin: '0 0 40px', textWrap: 'pretty', animation: 'fadeUp 0.6s ease-out 0.2s both' }}>
              Practice real conversations with an AI coach that listens, corrects gently, and builds your fluency — no judgment, just progress.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', animation: 'fadeUp 0.6s ease-out 0.3s both' }}>
              <Link to="/practice/custom" className="hp-btn-primary">
                Start Practicing
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {[10, 16, 8, 14].map((h, i) => (
                    <span key={i} style={{ display: 'block', width: 3, height: h, borderRadius: 2, background: 'oklch(1 0 0 / 0.7)', animation: `waveBar 1.2s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </span>
              </Link>
              <Link to="/lessons" className="hp-btn-secondary">View Lessons</Link>
            </div>

            {/* Social proof */}
            <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, animation: 'fadeUp 0.6s ease-out 0.5s both' }}>
              <div style={{ display: 'flex' }}>
                {[
                  { l: 'A', c: 'oklch(0.60 0.18 275)' },
                  { l: 'R', c: 'oklch(0.65 0.16 30)' },
                  { l: 'P', c: 'oklch(0.55 0.14 180)' },
                  { l: 'S', c: 'oklch(0.60 0.18 340)' },
                  { l: 'K', c: 'oklch(0.58 0.16 100)' },
                ].map((av, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid oklch(0.985 0.005 275)', marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', background: av.c }}>
                    {av.l}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'oklch(0.45 0.02 275)', margin: 0 }}>
                <strong style={{ color: 'oklch(0.18 0.02 275)', fontWeight: 600 }}>12,000+</strong> learners improving daily
              </p>
            </div>
          </div>

          {/* Right: AI orb */}
          <div className="hp-orb-col" style={{ position: 'relative', flexShrink: 0, width: 420, height: 420, pointerEvents: 'none' }}>
            {/* Pulse rings */}
            <div className="hp-orb-ring-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, oklch(0.65 0.18 275 / 0.15), oklch(0.55 0.22 275 / 0.06) 60%, transparent 75%)' }} />
            <OrbRing delay={0} />
            <OrbRing delay={1.3} />
            <OrbRing delay={2.6} />
            <OrbWaveform />
            {/* Chat bubbles */}
            <div className="hp-chat-bubble hp-chat-user" style={{ top: '15%', left: '-5%' }}>How do I introduce myself?</div>
            <div className="hp-chat-bubble hp-chat-ai" style={{ top: '55%', right: '-8%' }}>Great start! Try saying…</div>
            <div className="hp-chat-bubble hp-chat-ai2" style={{ bottom: '12%', left: '5%' }}>Tell me about your company</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '100px clamp(24px, 5vw, 80px)', maxWidth: 1200, margin: '0 auto' }}>
        <p className="hp-reveal" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: 'oklch(0.55 0.22 275)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 16, textAlign: 'center' }}>
          Why SpeakUp
        </p>
        <h2 className="hp-reveal" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 700, letterSpacing: -1, textAlign: 'center', marginBottom: 64, textWrap: 'balance' }}>
          Built for how you actually learn to speak
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

          <div className="hp-feature-card hp-reveal">
            <div style={{ width: 52, height: 52, borderRadius: 14, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: 'oklch(0.55 0.22 275 / 0.1)' }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4v20M8 10v8M20 8v12M5 13v2M23 12v4" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 10, letterSpacing: -0.3 }}>Real-time Voice Conversations</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'oklch(0.45 0.02 275)', margin: 0 }}>Speak naturally with an AI that understands Indian English accents and responds like a real conversation partner.</p>
          </div>

          <div className="hp-feature-card hp-reveal">
            <div style={{ width: 52, height: 52, borderRadius: 14, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: 'oklch(0.70 0.18 30 / 0.1)' }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 20l6-6 4 4 10-10" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 10, letterSpacing: -0.3 }}>Gentle Corrections</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'oklch(0.45 0.02 275)', margin: 0 }}>Get helpful feedback on pronunciation and grammar without the anxiety of being judged. Build confidence at your own pace.</p>
          </div>

          <div className="hp-feature-card hp-reveal">
            <div style={{ width: 52, height: 52, borderRadius: 14, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: 'oklch(0.55 0.16 180 / 0.1)' }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="6" width="20" height="16" rx="3" stroke="#0ea5e9" strokeWidth="2.2" /><path d="M10 14h8M10 18h5" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 10, letterSpacing: -0.3 }}>Interview &amp; Job-Ready Topics</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'oklch(0.45 0.02 275)', margin: 0 }}>Practice scenarios that matter — job interviews, presentations, group discussions, and everyday professional conversations.</p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '80px clamp(24px, 5vw, 80px) 100px', background: 'oklch(0.97 0.008 275)', borderTop: '1px solid oklch(0.9 0.01 275)', borderBottom: '1px solid oklch(0.9 0.01 275)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 className="hp-reveal" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 700, letterSpacing: -1, textAlign: 'center', marginBottom: 64, textWrap: 'balance' }}>
            Three steps to fluent speaking
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 27, top: 28, bottom: 28, width: 2, background: 'oklch(0.85 0.04 275)' }} />
            {[
              { n: '1', title: 'Pick a scenario', desc: 'Choose from everyday conversations, interview prep, or workplace topics designed for Indian professionals.' },
              { n: '2', title: 'Speak freely', desc: 'Have a natural voice conversation with your AI coach. No scripts — just real practice that builds real skills.' },
              { n: '3', title: 'Review & improve', desc: 'Get a personalised breakdown of your fluency, pronunciation, and confidence — then watch your streak grow.' },
            ].map((step) => (
              <div key={step.n} className="hp-reveal" style={{ display: 'flex', gap: 28, alignItems: 'flex-start', padding: '20px 0', position: 'relative' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', background: 'oklch(0.55 0.22 275)', boxShadow: '0 4px 16px oklch(0.55 0.22 275 / 0.25)', zIndex: 1 }}>
                  {step.n}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, marginBottom: 6, letterSpacing: -0.3 }}>{step.title}</h3>
                  <p style={{ fontSize: 16, lineHeight: 1.6, color: 'oklch(0.45 0.02 275)', margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px clamp(24px, 5vw, 80px)', textAlign: 'center' }}>
        <div className="hp-reveal" style={{ maxWidth: 720, margin: '0 auto', padding: '64px 48px', borderRadius: 28, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, oklch(0.55 0.22 275), oklch(0.50 0.20 310))', boxShadow: '0 24px 64px oklch(0.55 0.22 275 / 0.3)' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(28px, 3.5vw, 38px)', fontWeight: 700, color: '#fff', letterSpacing: -0.8, marginBottom: 16 }}>
            Your voice deserves to be heard
          </h2>
          <p style={{ fontSize: 18, color: 'oklch(1 0 0 / 0.75)', marginBottom: 36, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
            Start a free conversation today. No sign-up required for your first session.
          </p>
          <Link
            to="/practice/custom"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 600, color: 'oklch(0.55 0.22 275)', background: '#fff', border: 'none', padding: '16px 40px', borderRadius: 16, cursor: 'pointer', display: 'inline-block', textDecoration: 'none', boxShadow: '0 4px 20px oklch(0.2 0.1 275 / 0.2)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 32px oklch(0.2 0.1 275 / 0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px oklch(0.2 0.1 275 / 0.2)' }}
          >
            Start Practicing — Free
          </Link>
          {/* Wave decoration */}
          <svg style={{ position: 'absolute', bottom: -2, left: 0, right: 0, width: '100%', height: 60, opacity: 0.12 }} viewBox="0 0 800 80" preserveAspectRatio="none">
            <path d="M0 40 Q100 10 200 40 T400 40 T600 40 T800 40 V80 H0Z" fill="#fff" />
          </svg>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '48px clamp(24px, 5vw, 80px) 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, color: 'oklch(0.45 0.02 275)', flexWrap: 'wrap', gap: 16, borderTop: '1px solid oklch(0.9 0.01 275)' }}>
        <span>&copy; 2026 SpeakUp. Built with care in India.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Support'].map((l) => (
            <a key={l} href="#" style={{ color: 'oklch(0.45 0.02 275)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'oklch(0.55 0.22 275)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'oklch(0.45 0.02 275)' }}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
