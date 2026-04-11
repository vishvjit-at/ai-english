import { useState } from 'react'
import { Mic, ArrowRight, Info } from 'lucide-react'
import type { Scenario, UserContext } from '@/lib/types'

const levels = [
  { value: 'beginner', label: 'Beginner', desc: 'Basic sentences' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some mistakes' },
  { value: 'advanced', label: 'Advanced', desc: 'Want to polish' },
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

  const inputClass = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-slate-400'

  return (
    <div className="min-h-full bg-slate-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-900 to-green-600 p-8 rounded-t-3xl text-white">
          <span className="inline-flex bg-green-800 text-green-200 text-xs px-3 py-1 rounded-full mb-3">
            {scenario.topic.replace('_', ' ').toUpperCase()}
          </span>
          <h2 className="text-2xl font-bold mb-1">{scenario.name}</h2>
          <p className="text-green-200 text-sm">{scenario.description}</p>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col gap-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul" className={inputClass} autoFocus />
          </div>

          {/* Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">English Level</label>
            <div className="flex gap-2">
              {levels.map((opt) => (
                <button key={opt.value} onClick={() => setLevel(opt.value)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer flex-1
                    ${level === opt.value
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic-specific fields */}
          {scenario.topic === 'job_interview' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Company</label>
                <input type="text" value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} placeholder="Optional" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Experience</label>
                <input type="text" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} placeholder="e.g. 3 years" className={inputClass} />
              </div>
            </div>
          )}
          {scenario.topic === 'daily_life' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Details (Optional)</label>
              <input type="text" value={situationDetail} onChange={(e) => setSituationDetail(e.target.value)}
                placeholder={scenario.id === 'restaurant' ? 'e.g. I want vegetarian food' : scenario.id === 'doctor' ? 'e.g. headache for 3 days' : 'e.g. gift under 500'}
                className={inputClass} />
            </div>
          )}
          {scenario.topic === 'college' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Data Structures" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">College</label>
                <input type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="Optional" className={inputClass} />
              </div>
            </div>
          )}

          {/* Note */}
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-500 flex items-start gap-2 mt-0">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <span>More details help Aria tailor the conversation to your specific situation.</span>
          </div>

          {/* Start button */}
          <button onClick={handleStart} disabled={!canStart || isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] mt-0">
            {isLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Starting...</>
              : <><Mic className="w-4 h-4" /> Start Session <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
