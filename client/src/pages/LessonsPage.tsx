import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, MessageSquare, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { fetchLessons } from '@/lib/api'
import { MaskButton } from '@/components/ui/MaskButton'
import type { Lesson, LessonType } from '@/lib/types'

const TYPE_CONFIG: Record<LessonType, { icon: React.ReactNode; label: string; color: string }> = {
  grammar_focus: { icon: <BookOpen className="w-4 h-4" />, label: 'Grammar Focus', color: 'text-blue-600 bg-blue-50' },
  vocabulary_building: { icon: <MessageSquare className="w-4 h-4" />, label: 'Vocabulary Building', color: 'text-purple-600 bg-purple-50' },
  fluency_drill: { icon: <Zap className="w-4 h-4" />, label: 'Fluency Drill', color: 'text-primary-600 bg-primary-50' },
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-primary-50 text-primary-600',
  intermediate: 'bg-amber-50 text-amber-600',
  advanced: 'bg-purple-50 text-purple-600',
}

export function LessonsPage() {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLessons()
      .then((data) => setLessons(data.lessons))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const grouped = lessons.reduce<Record<LessonType, Lesson[]>>((acc, l) => {
    if (!acc[l.type]) acc[l.type] = []
    acc[l.type].push(l)
    return acc
  }, {} as Record<LessonType, Lesson[]>)

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--sem-surface)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">

        {/* Page header */}
        <div className="mb-10 animate-slide-in-up">
          <p className="text-xs tracking-[0.3em] uppercase font-medium mb-2" style={{ color: 'var(--sem-neutral-400)', fontFamily: 'var(--font-heading)' }}>
            Structured Learning
          </p>
          <h1 className="font-black tracking-tight leading-none" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontFamily: 'var(--font-heading)', color: 'var(--sem-neutral-900)' }}>
            Guided<br />Lessons
          </h1>
        </div>

        {loading ? (
          <>
            {[0, 1].map((g) => (
              <section key={g} className="mb-12">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-200 animate-pulse" />
                  <div className="h-5 w-36 bg-neutral-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-6 h-44 skeleton" />
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center mb-6">
              <GraduationCap className="w-10 h-10 text-primary-400" />
            </div>
            <h2 className="font-black text-neutral-700 text-2xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>No lessons yet</h2>
            <p className="text-neutral-400 text-sm mb-8 max-w-xs">Check back soon — new lessons are being added regularly.</p>
            <MaskButton onClick={() => navigate('/')} className="px-7 py-3 text-sm font-semibold">
              Start Practicing
            </MaskButton>
          </div>
        ) : (
          <>
            {(Object.keys(grouped) as LessonType[]).map((type) => {
              const cfg = TYPE_CONFIG[type]
              return (
                <section key={type} className="mb-12">
                  <div className="flex items-center gap-2.5 mb-5 animate-fade-in">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900">{cfg.label}</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {grouped[type].map((lesson) => (
                      <Link
                        key={lesson.id}
                        to={`/lessons/${lesson.id}`}
                        className="group bg-white rounded-2xl border border-neutral-100 p-6 hover-card cursor-pointer block"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full uppercase tracking-wide ${DIFFICULTY_COLORS[lesson.difficulty] || 'bg-neutral-100 text-neutral-500'}`}>
                            {lesson.difficulty}
                          </span>
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {lesson.maxExchanges}
                          </span>
                        </div>

                        <p className="font-bold text-neutral-900 mb-1.5 text-base">{lesson.name}</p>
                        <p className="text-neutral-500 text-sm line-clamp-2">{lesson.description}</p>

                        <div className="flex items-center justify-between mt-5">
                          <div className="flex -space-x-1">
                            {[1, 2, 3].map((n) => (
                              <div key={n} className="w-5 h-5 rounded-full bg-primary-100 border-2 border-white" />
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-primary-600 text-sm font-semibold">
                            Start <ArrowRight className="w-4 h-4 group-arrow" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })}

            {/* CTA */}
            <div className="rounded-2xl p-8 text-white flex items-center justify-between animate-slide-in-up delay-300" style={{ background: 'linear-gradient(135deg, var(--sem-primary-900), var(--sem-primary-700))' }}>
              <div>
                <p className="text-xs tracking-[0.25em] uppercase font-semibold mb-3" style={{ color: 'var(--sem-primary-300)' }}>Personalised</p>
                <h3 className="font-black text-2xl mb-2">Want a custom lesson?</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--sem-primary-200)' }}>
                  Aria can build a personalised curriculum based on your specific industry or interests.
                </p>
                <MaskButton fillColor="white" fillTextColor="var(--sem-primary-900)" className="px-7 py-3 text-sm font-semibold">
                  <Sparkles className="w-4 h-4" /> Request AI Curriculum
                </MaskButton>
              </div>
              <Sparkles className="w-20 h-20 shrink-0 opacity-20" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
