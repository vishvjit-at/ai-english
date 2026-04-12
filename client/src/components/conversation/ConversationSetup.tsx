import { useState } from 'react'
import { Mic, ArrowRight, Info } from 'lucide-react'
import type { Scenario, UserContext } from '@/lib/types'
import { MaskButton } from '@/components/ui/MaskButton'

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

  const inputClass = 'w-full border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:border-primary-500 transition-all placeholder:text-neutral-400'

  return (
    <div className="min-h-full flex items-center justify-center p-4 sm:p-8" style={{ background: 'var(--sem-surface)' }}>
      <div className="bg-white rounded-3xl border border-neutral-100 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 rounded-t-3xl text-white" style={{ background: 'linear-gradient(135deg, var(--sem-primary-900), var(--sem-primary-600))' }}>
          <span className="inline-flex text-xs px-3 py-1 rounded-full mb-3 font-semibold tracking-wider uppercase" style={{ background: 'rgba(255,255,255,0.15)' }}>
            {scenario.topic.replace('_', ' ')}
          </span>
          <h2 className="font-black text-2xl mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{scenario.name}</h2>
          <p className="text-sm opacity-80">{scenario.description}</p>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col gap-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul" className={inputClass} autoFocus />
          </div>

          {/* Level */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">English Level</label>
            <div className="flex gap-2">
              {levels.map((opt) => (
                <button key={opt.value} onClick={() => setLevel(opt.value)}
                  className={`px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all cursor-pointer flex-1
                    ${level === opt.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic-specific fields */}
          {scenario.topic === 'job_interview' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Role</label>
                <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Company</label>
                <input type="text" value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} placeholder="Optional" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Experience</label>
                <input type="text" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} placeholder="e.g. 3 years" className={inputClass} />
              </div>
            </div>
          )}
          {scenario.topic === 'daily_life' && (
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Details (Optional)</label>
              <input type="text" value={situationDetail} onChange={(e) => setSituationDetail(e.target.value)}
                placeholder={scenario.id === 'restaurant' ? 'e.g. I want vegetarian food' : scenario.id === 'doctor' ? 'e.g. headache for 3 days' : 'e.g. gift under 500'}
                className={inputClass} />
            </div>
          )}
          {scenario.topic === 'college' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Data Structures" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">College</label>
                <input type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="Optional" className={inputClass} />
              </div>
            </div>
          )}

          {/* Note */}
          <div className="bg-neutral-50 rounded-2xl p-4 text-sm text-neutral-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <span>More details help Aria tailor the conversation to your specific situation.</span>
          </div>

          {/* Start button */}
          <MaskButton onClick={handleStart} disabled={!canStart || isLoading} fullWidth
            className="py-3.5 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Starting…</>
              : <><Mic className="w-4 h-4" /> Start Session <ArrowRight className="w-4 h-4" /></>}
          </MaskButton>
        </div>
      </div>
    </div>
  )
}
