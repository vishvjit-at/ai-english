import { Mic, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="h-full relative overflow-hidden flex flex-col" style={{ background: 'var(--sem-surface)' }}>

      {/* Atmospheric background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--sem-primary-300), transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--sem-primary-400), transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--sem-tertiary-300), transparent 70%)' }}
        />
      </div>

      {/* Main content — fills all space above bottom bar */}
      <div className="flex-1 relative flex items-end pb-8 px-8 min-h-0">

        {/* Giant brand name — bottom-left anchor like Hyer */}
        <div className="relative z-0 select-none leading-none">
          <div
            className="font-black text-neutral-900 leading-[0.85] tracking-tighter"
            style={{ fontSize: 'clamp(5rem, 14vw, 11rem)', fontFamily: 'var(--font-heading)' }}
          >
            Speak<br />Up
          </div>
          <sup
            className="absolute text-lg font-bold text-neutral-400 tracking-normal"
            style={{ top: '0.3em', right: '-0.6em' }}
          >
            ®
          </sup>
        </div>

        {/* Tagline — pinned to right, vertically centered */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-right z-10">
          <p
            className="font-bold text-neutral-800 leading-tight"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontFamily: 'var(--font-heading)' }}
          >
            Your AI<br />English Coach
          </p>
          <p className="text-neutral-400 text-sm mt-3 max-w-[200px] ml-auto">
            Speak freely. Improve naturally.
          </p>
        </div>
      </div>

      {/* Hero orb — centered, overlaps text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative flex items-center justify-center">

          {/* Outermost pulse ring */}
          <div
            className="absolute w-80 h-80 rounded-full border opacity-20 animate-ping"
            style={{
              borderColor: 'var(--sem-primary-400)',
              animationDuration: '3s',
              animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
            }}
          />

          {/* Middle ring */}
          <div
            className="absolute w-64 h-64 rounded-full border-2 opacity-30"
            style={{
              borderColor: 'var(--sem-primary-300)',
              animation: 'pulse-ring 2.5s ease-in-out infinite',
            }}
          />

          {/* Inner ring */}
          <div
            className="absolute w-48 h-48 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, var(--sem-primary-400), transparent 70%)',
              animation: 'pulse-ring 2s ease-in-out infinite 0.3s',
            }}
          />

          {/* Orb */}
          <div
            className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-2xl animate-float"
            style={{
              background: 'linear-gradient(135deg, var(--sem-primary-400), var(--sem-primary-700))',
              boxShadow: '0 20px 60px -12px var(--sem-primary-500), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {/* Shine */}
            <div className="absolute top-4 left-6 w-10 h-4 bg-white/20 rounded-full blur-sm rotate-[-20deg]" />
            <Mic className="w-14 h-14 text-white relative z-10 drop-shadow-lg" />
          </div>

          {/* Floating speech bubble chips */}
          <div
            className="absolute -top-6 -right-16 bg-white rounded-2xl px-3 py-2 shadow-lg border border-neutral-100 text-xs font-medium text-neutral-700 whitespace-nowrap"
            style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}
          >
            💬 "Tell me about yourself"
          </div>
          <div
            className="absolute -bottom-4 -left-20 bg-white rounded-2xl px-3 py-2 shadow-lg border border-neutral-100 text-xs font-medium text-neutral-700 whitespace-nowrap"
            style={{ animation: 'float 4s ease-in-out infinite 1.2s' }}
          >
            ✨ Great pronunciation!
          </div>
        </div>
      </div>

      {/* Bottom bar — Hyer style */}
      <div
        className="relative z-20 flex items-center justify-between px-8 py-5"
        style={{ borderTop: '1px solid var(--sem-neutral-200)' }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--sem-neutral-500)' }}>
          More fluency, more confidence, more you.
        </p>

        <div className="flex items-center gap-3">
          <Link to="/practice/custom">
            <button
              className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover-glow cursor-pointer"
              style={{ background: 'var(--sem-neutral-900)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Start Practicing
            </button>
          </Link>

          <Link to="/lessons">
            <button
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full cursor-pointer hover-slide"
              style={{
                border: '1.5px solid var(--sem-neutral-300)',
                color: 'var(--sem-neutral-700)',
                background: 'transparent',
              }}
            >
              View Lessons
              <ArrowRight className="w-3.5 h-3.5 group-arrow" />
            </button>
          </Link>
        </div>
      </div>

      {/* Pulse ring keyframes */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.06); opacity: 0.15; }
        }
      `}</style>
    </div>
  )
}
