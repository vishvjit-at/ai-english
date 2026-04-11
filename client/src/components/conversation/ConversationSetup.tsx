import { useState } from 'react'
import { Mic, ArrowRight } from 'lucide-react'
import type { Scenario, UserContext } from '@/lib/types'

const levels = [
  { value: 'beginner', label: 'Beginner', desc: 'Basic sentences', color: 'bg-primary-300' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some mistakes', color: 'bg-accent-300' },
  { value: 'advanced', label: 'Advanced', desc: 'Want to polish', color: 'bg-tertiary-300' },
] as const

export function ConversationSetup({ scenario, onStart, isLoading }: { scenario: Scenario; onStart: (ctx: UserContext) => void; isLoading: boolean }) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState<UserContext['level']>('intermediate')
  const [targetRole, setTargetRole] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [situationDetail, setSituationDetail] = useState('')
  const [subject, setSubject] = useState('')
  const [collegeName, setCollegeName] = useState('')

  const canStart = name.trim().length > 0

  const handleStart = () => {
    if (!canStart) return
    onStart({
      name: name.trim(), level,
      ...(scenario.topic === 'job_interview' && { targetRole: targetRole.trim() || undefined, targetCompany: targetCompany.trim() || undefined, yearsOfExperience: yearsOfExperience.trim() || undefined }),
      ...(scenario.topic === 'daily_life' && { situationDetail: situationDetail.trim() || undefined }),
      ...(scenario.topic === 'college' && { subject: subject.trim() || undefined, collegeName: collegeName.trim() || undefined }),
    })
  }

  const inputClass = 'w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-body text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all placeholder:text-neutral-300'

  return (
    <div className="h-full overflow-y-auto bg-surface flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary-100 to-primary-50 px-6 py-5 border-b border-primary-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-sm">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-neutral-800 text-base">{scenario.name}</h2>
                <p className="text-neutral-400 text-xs font-body">{scenario.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <div>
              <label className="block text-sm font-heading font-semibold text-neutral-600 mb-1.5">Your name <span className="text-accent-400">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul" className={inputClass} autoFocus />
            </div>

            <div>
              <label className="block text-sm font-heading font-semibold text-neutral-600 mb-2">English level</label>
              <div className="grid grid-cols-3 gap-2">
                {levels.map((opt) => (
                  <button key={opt.value} onClick={() => setLevel(opt.value)}
                    className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border transition-all cursor-pointer
                      ${level === opt.value ? 'border-primary-300 bg-primary-50' : 'border-neutral-100 hover:border-neutral-200'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${opt.color} ${level === opt.value ? '' : 'opacity-30'} transition-all`} />
                    <span className="text-xs font-heading font-semibold text-neutral-700">{opt.label}</span>
                    <span className="text-[9px] text-neutral-400">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {scenario.topic === 'job_interview' && (
              <div className="flex flex-col gap-3 animate-fade-in">
                <p className="text-[10px] font-heading font-bold text-primary-500 uppercase tracking-widest">Customize</p>
                <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Role — e.g. Software Engineer" className={inputClass} />
                <input type="text" value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} placeholder="Company (optional)" className={inputClass} />
                <input type="text" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} placeholder="Years of experience" className={inputClass} />
              </div>
            )}
            {scenario.topic === 'daily_life' && (
              <div className="animate-fade-in">
                <p className="text-[10px] font-heading font-bold text-primary-500 uppercase tracking-widest mb-2">Customize</p>
                <input type="text" value={situationDetail} onChange={(e) => setSituationDetail(e.target.value)}
                  placeholder={scenario.id === 'restaurant' ? 'e.g. I want vegetarian food' : scenario.id === 'doctor' ? 'e.g. headache for 3 days' : 'e.g. gift under 500'}
                  className={inputClass} />
              </div>
            )}
            {scenario.topic === 'college' && (
              <div className="flex flex-col gap-3 animate-fade-in">
                <p className="text-[10px] font-heading font-bold text-primary-500 uppercase tracking-widest">Customize</p>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject/topic (optional)" className={inputClass} />
                <input type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="College name (optional)" className={inputClass} />
              </div>
            )}

            <button onClick={handleStart} disabled={!canStart || isLoading}
              className="w-full bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white py-3.5 rounded-xl font-heading font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:from-neutral-200 disabled:to-neutral-200 disabled:shadow-none disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.98]">
              {isLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Starting...</>
                : <><Mic className="w-4 h-4" /> Start Practice <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
