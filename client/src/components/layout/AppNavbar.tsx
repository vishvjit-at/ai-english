import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Moon, Sun, Menu, X, BookOpen, Mic, Clock, Activity, MessageSquare, Brain, Settings as SettingsIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/lib/speakup-theme'
import { useDarkMode } from './AppLayout'

const NAV: { id: string; to: string; label: string; Icon: LucideIcon }[] = [
  { id: 'lessons',    to: '/lessons',         label: 'Lessons',   Icon: BookOpen },
  { id: 'practice',   to: '/practice/custom', label: 'Practice',  Icon: Mic },
  { id: 'history',    to: '/history',         label: 'History',   Icon: Clock },
  { id: 'progress',   to: '/progress',        label: 'Progress',  Icon: Activity },
  { id: 'vocabulary', to: '/vocabulary',      label: 'Vocab',     Icon: MessageSquare },
  { id: 'quiz',       to: '/quiz',            label: 'Quiz',      Icon: Brain },
  { id: 'settings',   to: '/settings',        label: 'Settings',  Icon: SettingsIcon },
]

export function AppNavbar({ minimal = false }: { minimal?: boolean }) {
  const T = useTheme()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { dark, toggleDark } = useDarkMode()
  const [hovered, setHovered] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const isActive = (id: string, to: string) => {
    if (id === 'practice') return location.pathname.startsWith('/practice')
    if (id === 'lessons')  return location.pathname.startsWith('/lessons')
    if (id === 'history')  return location.pathname.startsWith('/history')
    if (id === 'quiz')     return location.pathname.startsWith('/quiz')
    return location.pathname === to
  }

  const initial = (user?.user_metadata?.full_name || user?.email || '?')[0].toUpperCase()
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(16px, 3vw, 40px)',
      background: dark ? 'rgba(15,17,23,0.92)' : 'oklch(0.985 0.005 275 / 0.92)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${T.border}`,
      boxShadow: '0 2px 20px oklch(0.55 0.22 275 / 0.04)',
    }}>
      {/* Logo */}
      <Link to="/lessons" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: T.indigo,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: T.headingFont,
        }}>S</div>
        <span style={{
          fontFamily: T.headingFont, fontWeight: 700, fontSize: 20,
          color: T.heading, letterSpacing: -0.5,
        }}>SpeakUp</span>
      </Link>

      {/* Desktop nav links */}
      {!minimal && (
        <div className="spk-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {NAV.map(item => {
            const active = isActive(item.id, item.to)
            const h = hovered === item.id
            const Icon = item.Icon
            return (
              <Link key={item.id} to={item.to}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  fontFamily: T.bodyFont, fontSize: 14, fontWeight: active ? 600 : 500,
                  padding: '8px 14px', borderRadius: 10, textDecoration: 'none',
                  cursor: 'pointer', transition: 'all 0.18s',
                  background: active
                    ? (dark ? 'rgba(255,255,255,0.08)' : T.bgAlt)
                    : h ? (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)') : 'transparent',
                  color: active ? T.heading : T.body,
                  border: 'none',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <Icon size={16} strokeWidth={2} />
                <span className="spk-nav-label">{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Right: dark toggle + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={toggleDark}
          aria-label="Toggle dark mode"
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: T.body,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.indigoLight; e.currentTarget.style.color = T.indigo }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.body }}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {!minimal && (
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="spk-mobile-toggle"
            aria-label="Menu"
            style={{
              display: 'none', width: 36, height: 36, borderRadius: 10, border: 'none',
              cursor: 'pointer', background: 'transparent', color: T.body,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(v => !v)}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, oklch(0.55 0.22 275), oklch(0.70 0.18 30))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: T.headingFont,
            }}
          >
            {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
          </button>
          {menuOpen && user && (
            <div style={{
              position: 'absolute', right: 0, top: 44, minWidth: 200,
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 30,
            }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.borderLight}` }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.heading, margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: T.bodyFont }}>
                  {user.user_metadata?.full_name || user.email}
                </p>
              </div>
              <button onClick={() => { setMenuOpen(false); signOut() }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', fontSize: 14, fontWeight: 600, color: SPK_RED,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: T.bodyFont, transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && !minimal && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0,
          background: T.surface, borderBottom: `1px solid ${T.border}`,
          padding: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 99,
          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        }} className="spk-mobile-drawer">
          {NAV.map(item => {
            const active = isActive(item.id, item.to)
            const Icon = item.Icon
            return (
              <Link key={item.id} to={item.to} onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: T.bodyFont, fontSize: 15, fontWeight: 500,
                  padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                  background: active ? T.indigoLight : 'transparent',
                  color: active ? T.indigo : T.body,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <Icon size={18} strokeWidth={2} />{item.label}
              </Link>
            )
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .spk-nav-links { display: none !important; }
          .spk-mobile-toggle { display: flex !important; }
        }
        @media (max-width: 480px) {
          .spk-nav-label { display: none; }
        }
      `}</style>
    </nav>
  )
}

const SPK_RED = '#ef4444'
