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
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-100 flex flex-col
        transition-transform duration-300 ease-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo section */}
        <div className="p-5 shrink-0">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
              <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">SpeakUp</p>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase">Your English Partner</p>
              </div>
            </Link>
            <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Custom scenario */}
          <Link to="/practice/custom" onClick={onClose}>
            <div className={`
              flex items-center gap-3 px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors
              ${isActive('/practice/custom')
                ? 'bg-green-50 text-green-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
              }
            `}>
              <Sparkles className={`w-4 h-4 ${isActive('/practice/custom') ? 'text-green-600' : 'text-slate-400'}`} />
              Custom Scenario
            </div>
          </Link>

          {/* Lessons link */}
          <Link to="/lessons" onClick={onClose}>
            <div className={`
              flex items-center gap-3 px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors mt-1
              ${isActive('/lessons') || location.pathname.startsWith('/lessons/')
                ? 'bg-green-50 text-green-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
              }
            `}>
              <GraduationCap className={`w-4 h-4 ${isActive('/lessons') || location.pathname.startsWith('/lessons/') ? 'text-green-600' : 'text-slate-400'}`} />
              Guided Lessons
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3">
          {scenarioData && (Object.keys(scenarioData) as PredefinedTopicKey[]).map((topic) => (
            <div key={topic} className="mb-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 mt-4 flex items-center gap-1.5">
                <span className="text-slate-400">{topicConfig[topic].icon}</span>
                {topicConfig[topic].label}
              </p>

              <div className="flex flex-col gap-0.5">
                {scenarioData[topic].map((scenario) => {
                  const active = isActive(`/practice/${scenario.id}`)
                  return (
                    <Link key={scenario.id} to={`/practice/${scenario.id}`} onClick={onClose}>
                      <div className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm
                        ${active
                          ? 'bg-green-50 text-green-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                        }
                      `}>
                        <MessageCircle className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-green-600' : 'text-slate-300'}`} />
                        <p className="truncate flex-1">{scenario.name}</p>
                        <span className={`text-[9px] font-semibold capitalize px-1.5 py-0.5 rounded-full
                          ${scenario.difficulty === 'beginner' ? 'bg-green-50 text-green-600' :
                            scenario.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-600' :
                            'bg-purple-50 text-purple-600'}
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
            <div className="px-3 flex flex-col gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Bottom nav links with divider */}
          <div className="border-t border-slate-100 pt-4 mt-4 flex flex-col gap-0.5 pb-4">
            <Link to="/history" onClick={onClose}>
              <div className={`
                flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm
                ${isActive('/history') || location.pathname.startsWith('/history/')
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}>
                <Clock className={`w-4 h-4 ${isActive('/history') || location.pathname.startsWith('/history/') ? 'text-green-600' : 'text-slate-400'}`} />
                History
              </div>
            </Link>
            <Link to="/progress" onClick={onClose}>
              <div className={`
                flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm
                ${isActive('/progress')
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}>
                <TrendingUp className={`w-4 h-4 ${isActive('/progress') ? 'text-green-600' : 'text-slate-400'}`} />
                Progress
              </div>
            </Link>
            <Link to="/vocabulary" onClick={onClose}>
              <div className={`
                flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm
                ${isActive('/vocabulary')
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}>
                <BookOpen className={`w-4 h-4 ${isActive('/vocabulary') ? 'text-green-600' : 'text-slate-400'}`} />
                Vocabulary
              </div>
            </Link>
            <Link to="/settings" onClick={onClose}>
              <div className={`
                flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm
                ${isActive('/settings')
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}>
                <Settings className={`w-4 h-4 ${isActive('/settings') ? 'text-green-600' : 'text-slate-400'}`} />
                Settings
              </div>
            </Link>
          </div>
        </nav>

        {/* Bottom user section */}
        <div className="border-t border-slate-100 p-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-9 h-9 rounded-full" />
                ) : (
                  (user.email?.[0] || '?').toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="ml-auto p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 cursor-pointer shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center">Free to use</p>
          )}
        </div>
      </aside>
    </>
  )
}
