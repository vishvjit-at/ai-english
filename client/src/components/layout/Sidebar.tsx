import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mic, Sparkles, Briefcase, Coffee, GraduationCap, X, MessageCircle, Settings, Clock, TrendingUp, BookOpen, LogOut } from 'lucide-react'
import { fetchScenarios } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import type { Scenario, PredefinedTopicKey } from '@/lib/types'

const topicConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  job_interview: { icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Job Interview' },
  daily_life:    { icon: <Coffee className="w-3.5 h-3.5" />,    label: 'Daily Life'    },
  college:       { icon: <GraduationCap className="w-3.5 h-3.5" />, label: 'College'   },
}

const bottomNav = [
  { to: '/history',    icon: <Clock className="w-4 h-4" />,      label: 'History'    },
  { to: '/progress',   icon: <TrendingUp className="w-4 h-4" />, label: 'Progress'   },
  { to: '/vocabulary', icon: <BookOpen className="w-4 h-4" />,   label: 'Vocabulary' },
  { to: '/settings',   icon: <Settings className="w-4 h-4" />,   label: 'Settings'   },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [scenarioData, setScenarioData] = useState<Record<PredefinedTopicKey, Scenario[]> | null>(null)

  useEffect(() => {
    fetchScenarios().then((d) => setScenarioData(d.scenarios)).catch(console.error)
  }, [])

  const isActive = (path: string) => location.pathname === path

  const navItemStyle = (active: boolean): React.CSSProperties => active
    ? { background: '#6366f1', color: '#fff', borderRadius: '10px' }
    : { background: 'transparent', color: 'var(--sem-neutral-600)', borderRadius: '10px' }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 flex flex-col
          transition-transform duration-300 ease-out
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'var(--sem-neutral-100)',
          borderRight: '1px solid var(--sem-neutral-200)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 shrink-0" style={{ borderBottom: '1px solid var(--sem-neutral-200)' }}>
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#6366f1' }}>
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--sem-neutral-900)' }}>SpeakUp</p>
                <p className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--sem-neutral-400)' }}>Your English Partner</p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
              style={{ color: 'var(--sem-neutral-400)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary actions */}
          <Link
            to="/practice/custom"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold mb-1 cursor-pointer transition-all"
            style={navItemStyle(isActive('/practice/custom'))}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            Custom Scenario
          </Link>

          <Link
            to="/lessons"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold cursor-pointer transition-all"
            style={navItemStyle(isActive('/lessons') || location.pathname.startsWith('/lessons/'))}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            Guided Lessons
          </Link>
        </div>

        {/* Scrollable scenarios */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {scenarioData && (Object.keys(scenarioData) as PredefinedTopicKey[]).map((topic) => {
            const cfg = topicConfig[topic]
            return (
              <div key={topic} className="mb-4">
                <p className="flex items-center gap-1.5 px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--sem-neutral-400)' }}>
                  {cfg.icon} {cfg.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {scenarioData[topic].map((scenario) => {
                    const active = isActive(`/practice/${scenario.id}`)
                    return (
                      <Link
                        key={scenario.id}
                        to={`/practice/${scenario.id}`}
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-all"
                        style={navItemStyle(active)}
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate flex-1">{scenario.name}</span>
                        <span className="text-[9px] font-semibold capitalize px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(99,102,241,0.15)', color: active ? '#c7d2fe' : 'var(--sem-neutral-500)' }}>
                          {scenario.difficulty.slice(0, 3)}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {!scenarioData && (
            <div className="flex flex-col gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-9 rounded-xl skeleton" style={{ background: 'var(--sem-neutral-200)' }} />
              ))}
            </div>
          )}

          {/* Bottom nav */}
          <div className="pt-3 mt-2 flex flex-col gap-0.5" style={{ borderTop: '1px solid var(--sem-neutral-200)' }}>
            {bottomNav.map(({ to, icon, label }) => {
              const active = to === '/history'
                ? isActive('/history') || location.pathname.startsWith('/history/')
                : isActive(to)
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium cursor-pointer transition-all"
                  style={navItemStyle(active)}
                >
                  {icon}
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="px-4 py-4 shrink-0" style={{ borderTop: '1px solid var(--sem-neutral-200)' }}>
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-9 h-9 rounded-full" />
                ) : (
                  (user.email?.[0] || '?').toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--sem-neutral-900)' }}>
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--sem-neutral-400)' }}>{user.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="ml-auto p-1.5 rounded-lg cursor-pointer btn-danger shrink-0"
                title="Sign out"
                style={{ color: 'var(--sem-neutral-400)' }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-center" style={{ color: 'var(--sem-neutral-400)' }}>Free to use</p>
          )}
        </div>
      </aside>
    </>
  )
}
