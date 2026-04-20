import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mic, Sparkles, Briefcase, Coffee, GraduationCap, X, MessageCircle, Settings, Clock, TrendingUp, BookOpen, LogOut } from 'lucide-react'
import { fetchScenarios } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import type { Scenario, PredefinedTopicKey } from '@/lib/types'

const topicConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  job_interview: { icon: <Briefcase className="w-4 h-4" />, label: 'Job Interview', color: 'nav-item-primary' },
  daily_life:    { icon: <Coffee className="w-4 h-4" />,   label: 'Daily Life',    color: 'nav-item-amber'   },
  college:       { icon: <GraduationCap className="w-4 h-4" />, label: 'College',  color: 'nav-item-purple'  },
}

const bottomNav = [
  { to: '/history',    icon: <Clock className="w-4 h-4" />,      label: 'History',    color: 'nav-item-amber'   },
  { to: '/progress',   icon: <TrendingUp className="w-4 h-4" />, label: 'Progress',   color: 'nav-item-teal'    },
  { to: '/vocabulary', icon: <BookOpen className="w-4 h-4" />,   label: 'Vocabulary', color: 'nav-item-purple'  },
  { to: '/settings',   icon: <Settings className="w-4 h-4" />,   label: 'Settings',   color: 'nav-item-muted'   },
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

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-neutral-100 flex flex-col
        transition-transform duration-300 ease-out shadow-xl shadow-neutral-200/60
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-5 pb-3 shrink-0 border-b border-neutral-100/80">
          <div className="flex items-center justify-between mb-5">
            <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
              <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">SpeakUp</p>
                <p className="text-[10px] text-neutral-400 tracking-wider uppercase">Your English Partner</p>
              </div>
            </Link>
            <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center text-neutral-400 cursor-pointer rounded-lg btn-icon">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Top action links */}
          <Link
            to="/practice/custom"
            onClick={onClose}
            className={`nav-item nav-item-primary ${isActive('/practice/custom') ? 'nav-item-active' : ''}`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            Custom Scenario
          </Link>

          <Link
            to="/lessons"
            onClick={onClose}
            className={`nav-item nav-item-accent mt-0.5 ${isActive('/lessons') || location.pathname.startsWith('/lessons/') ? 'nav-item-active' : ''}`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            Guided Lessons
          </Link>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-3">
          {scenarioData && (Object.keys(scenarioData) as PredefinedTopicKey[]).map((topic) => {
            const cfg = topicConfig[topic]
            return (
              <div key={topic} className="mb-3">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-1 mt-3 flex items-center gap-1.5">
                  <span>{cfg.icon}</span>
                  {cfg.label}
                </p>

                <div className="flex flex-col gap-0.5">
                  {scenarioData[topic].map((scenario) => {
                    const active = isActive(`/practice/${scenario.id}`)
                    return (
                      <Link
                        key={scenario.id}
                        to={`/practice/${scenario.id}`}
                        onClick={onClose}
                        className={`nav-item ${cfg.color} ${active ? 'nav-item-active' : ''}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <p className="truncate flex-1">{scenario.name}</p>
                        <span className="text-[9px] font-semibold capitalize px-1.5 py-0.5 rounded-full bg-white/20">
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
            <div className="px-3 flex flex-col gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-9 bg-neutral-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Bottom nav */}
          <div className="border-t border-neutral-100 pt-2 mt-3 flex flex-col gap-0.5 pb-4">
            {bottomNav.map(({ to, icon, label, color }) => {
              const active = to === '/history'
                ? isActive('/history') || location.pathname.startsWith('/history/')
                : isActive(to)
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={`nav-item ${color} ${active ? 'nav-item-active' : ''}`}
                >
                  {icon}
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-neutral-100 p-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0 hover:ring-2 hover:ring-primary-400 hover:ring-offset-2 transition-all duration-200">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-9 h-9 rounded-full" />
                ) : (
                  (user.email?.[0] || '?').toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="ml-auto p-1.5 text-neutral-400 rounded-lg cursor-pointer shrink-0 btn-danger"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 text-center">Free to use</p>
          )}
        </div>
      </aside>
    </>
  )
}
