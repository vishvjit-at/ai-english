import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mic, Sparkles, Briefcase, Coffee, GraduationCap, X, MessageCircle, Settings, Clock, TrendingUp, BookOpen, LogOut } from 'lucide-react'
import { fetchScenarios } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import type { Scenario, PredefinedTopicKey } from '@/lib/types'

const topicConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  job_interview: { icon: <Briefcase className="w-4 h-4" />, label: 'Job Interview' },
  daily_life: { icon: <Coffee className="w-4 h-4" />, label: 'Daily Life' },
  college: { icon: <GraduationCap className="w-4 h-4" />, label: 'College' },
}

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
        fixed top-0 left-0 z-50 h-full w-[270px] bg-surface-dark flex flex-col
        transition-transform duration-300 ease-out border-r border-neutral-200/50
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between shrink-0">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-neutral-800 text-[15px] leading-tight">SpeakUp</h1>
              <p className="text-[10px] text-neutral-400 font-heading">with Aria</p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600 cursor-pointer rounded-lg hover:bg-neutral-200/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Custom scenario */}
        <div className="px-3 mb-4">
          <Link to="/practice/custom" onClick={onClose}>
            <div className={`
              relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all group
              ${isActive('/practice/custom')
                ? 'bg-gradient-to-br from-accent-300 to-accent-400 shadow-md'
                : 'bg-gradient-to-br from-accent-100 to-accent-200/80 hover:from-accent-200 hover:to-accent-300/80 hover:shadow-sm'
              }
            `}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive('/practice/custom') ? 'bg-white/30' : 'bg-white/60'}`}>
                  <Sparkles className={`w-4 h-4 ${isActive('/practice/custom') ? 'text-white' : 'text-accent-500'}`} />
                </div>
                <div>
                  <p className={`text-sm font-heading font-bold ${isActive('/practice/custom') ? 'text-white' : 'text-neutral-700'}`}>
                    Custom Scenario
                  </p>
                  <p className={`text-[10px] ${isActive('/practice/custom') ? 'text-white/70' : 'text-neutral-400'}`}>
                    Describe any situation
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Lessons link */}
        <div className="px-3 mb-3">
          <Link to="/lessons" onClick={onClose}>
            <div className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all
              ${isActive('/lessons') || location.pathname.startsWith('/lessons/')
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-100/80'
              }
            `}>
              <GraduationCap className={`w-4 h-4 ${isActive('/lessons') || location.pathname.startsWith('/lessons/') ? 'text-primary-400' : 'text-neutral-400'}`} />
              <p className="text-[13px] font-heading font-semibold">Guided Lessons</p>
            </div>
          </Link>
        </div>

        <div className="px-5 mb-3">
          <div className="h-px bg-neutral-200/60" />
        </div>

        {/* Scenario list */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {scenarioData && (Object.keys(scenarioData) as PredefinedTopicKey[]).map((topic) => (
            <div key={topic} className="mb-5">
              <div className="flex items-center gap-2 px-2 mb-2">
                <span className="text-neutral-400">{topicConfig[topic].icon}</span>
                <p className="text-[10px] font-heading font-bold text-neutral-400 uppercase tracking-widest">
                  {topicConfig[topic].label}
                </p>
              </div>

              <div className="flex flex-col gap-0.5">
                {scenarioData[topic].map((scenario) => {
                  const active = isActive(`/practice/${scenario.id}`)
                  return (
                    <Link key={scenario.id} to={`/practice/${scenario.id}`} onClick={onClose}>
                      <div className={`
                        flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                        ${active
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-600 hover:bg-neutral-100/80'
                        }
                      `}>
                        <MessageCircle className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-primary-400' : 'text-neutral-300'}`} />
                        <p className={`text-[13px] font-body truncate flex-1 ${active ? 'font-semibold' : ''}`}>
                          {scenario.name}
                        </p>
                        <span className={`text-[9px] font-heading font-semibold capitalize px-1.5 py-0.5 rounded-full
                          ${scenario.difficulty === 'beginner' ? 'bg-primary-50 text-primary-500' :
                            scenario.difficulty === 'intermediate' ? 'bg-accent-100 text-accent-500' :
                            'bg-tertiary-100 text-tertiary-500'}
                        `}>
                          {scenario.difficulty.slice(0, 3)}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {!scenarioData && (
            <div className="px-3 flex flex-col gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-neutral-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </nav>

        {/* Bottom nav links */}
        <div className="px-3 pb-3 shrink-0 flex flex-col gap-0.5">
          <Link to="/history" onClick={onClose}>
            <div className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all
              ${isActive('/history') || location.pathname.startsWith('/history/')
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-700'
              }
            `}>
              <Clock className={`w-4 h-4 ${isActive('/history') || location.pathname.startsWith('/history/') ? 'text-primary-400' : 'text-neutral-400'}`} />
              <p className="text-[13px] font-heading font-semibold">History</p>
            </div>
          </Link>
          <Link to="/progress" onClick={onClose}>
            <div className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all
              ${isActive('/progress')
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-700'
              }
            `}>
              <TrendingUp className={`w-4 h-4 ${isActive('/progress') ? 'text-primary-400' : 'text-neutral-400'}`} />
              <p className="text-[13px] font-heading font-semibold">Progress</p>
            </div>
          </Link>
          <Link to="/vocabulary" onClick={onClose}>
            <div className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all
              ${isActive('/vocabulary')
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-700'
              }
            `}>
              <BookOpen className={`w-4 h-4 ${isActive('/vocabulary') ? 'text-primary-400' : 'text-neutral-400'}`} />
              <p className="text-[13px] font-heading font-semibold">Vocabulary</p>
            </div>
          </Link>
          <Link to="/settings" onClick={onClose}>
            <div className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all
              ${isActive('/settings')
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-700'
              }
            `}>
              <Settings className={`w-4 h-4 ${isActive('/settings') ? 'text-primary-400' : 'text-neutral-400'}`} />
              <p className="text-[13px] font-heading font-semibold">Settings</p>
            </div>
          </Link>
        </div>

        <div className="px-3 py-3 border-t border-neutral-200/40 shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center shrink-0">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <span className="text-xs font-bold text-white">{(user.email?.[0] || '?').toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-heading font-semibold text-neutral-600 truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-[10px] text-neutral-300 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="w-7 h-7 flex items-center justify-center text-neutral-300 hover:text-neutral-500 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-[10px] text-neutral-300 font-heading text-center">Free to use</p>
          )}
        </div>
      </aside>
    </>
  )
}
