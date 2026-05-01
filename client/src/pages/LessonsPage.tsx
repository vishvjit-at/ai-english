import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, Users, Star, ArrowRight } from 'lucide-react'
import { fetchLessons } from '@/lib/api'
import { useTheme } from '@/lib/speakup-theme'
import type { Lesson } from '@/lib/types'

const CATEGORIES = ['All', 'Interviews', 'Business', 'Daily Life', 'Grammar'] as const

type Category = (typeof CATEGORIES)[number]
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

function inferCategory(l: Lesson): Category {
  const n = `${l.name} ${l.description}`.toLowerCase()
  if (l.type === 'grammar_focus' || /grammar|tense/.test(n)) return 'Grammar'
  if (/interview|job/.test(n)) return 'Interviews'
  if (/business|meeting|presentation|negotiat|professional|phone call|pitch/.test(n)) return 'Business'
  return 'Daily Life'
}
function deriveDuration(l: Lesson): string {
  return `${Math.max(10, Math.round(l.maxExchanges * 1.2))} min`
}
function deriveEnrollees(_l: Lesson, i: number): string {
  const base = [1240, 980, 2100, 760, 1800, 540, 890, 1100, 1500]
  const n = base[i % base.length] || 800
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`
}
function deriveRating(l: Lesson): string {
  const map: Record<string, string> = { beginner: '4.8', intermediate: '4.7', advanced: '4.5' }
  return map[l.difficulty] || '4.6'
}
function diffLabel(d: string): Difficulty {
  const v = d.toLowerCase()
  if (v.startsWith('int')) return 'Intermediate'
  if (v.startsWith('adv')) return 'Advanced'
  return 'Beginner'
}

export function LessonsPage() {
  const T = useTheme()
  const nav = useNavigate()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<Category>('All')

  useEffect(() => {
    fetchLessons().then((d) => setLessons(d.lessons)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = lessons.filter((l) => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.description.toLowerCase().includes(search.toLowerCase())) return false
    if (cat !== 'All' && inferCategory(l) !== cat) return false
    return true
  })

  return (
    <div style={{ background: T.bg, minHeight: 'calc(100vh - 64px)', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.indigo, fontFamily: T.bodyFont, marginBottom: 6 }}>
            Lesson Library
          </div>
          <h1 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 'clamp(26px, 3.4vw, 34px)', color: T.heading, letterSpacing: -0.5, margin: '0 0 6px' }}>
            Practice real conversations
          </h1>
          <p style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.body, margin: 0, lineHeight: 1.5 }}>
            Each lesson is a guided scenario with your AI coach. Pick one and start speaking.
          </p>
        </div>

        {/* Search + tabs row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '0 0 280px', maxWidth: 280 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.bodyLight }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lessons..."
              style={{
                width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
                border: `1px solid ${T.border}`, fontFamily: T.bodyFont, fontSize: 14,
                outline: 'none', background: T.surface, color: T.heading,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = T.indigo)}
              onBlur={(e) => (e.currentTarget.style.borderColor = T.border)} />
          </div>
          <div style={{
            display: 'flex', gap: 2, padding: 4, borderRadius: 12,
            background: T.bgAlt,
            flexWrap: 'wrap',
          }}>
            {CATEGORIES.map((c) => {
              const active = cat === c
              return (
                <button key={c} onClick={() => setCat(c)} style={{
                  fontFamily: T.bodyFont, fontSize: 13, fontWeight: active ? 600 : 500,
                  padding: '6px 14px', borderRadius: 8, cursor: 'pointer', border: 'none',
                  background: active ? T.surface : 'transparent',
                  color: active ? T.heading : T.bodyLight,
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s',
                }}>{c}</button>
              )
            })}
          </div>
        </div>

        {!loading && (
          <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight, marginBottom: 16 }}>
            {filtered.length} lesson{filtered.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: 170, borderRadius: T.radius, background: T.bgAlt }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: T.body, fontFamily: T.bodyFont }}>
            No lessons found. Try a different filter.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {filtered.map((l, i) => (
              <LessonCard key={l.id} lesson={l}
                category={inferCategory(l)} difficulty={diffLabel(l.difficulty)}
                duration={deriveDuration(l)} enrollees={deriveEnrollees(l, i)} rating={deriveRating(l)}
                onClick={() => nav(`/lessons/${l.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LessonCard({
  lesson, category, difficulty, duration, enrollees, rating, onClick,
}: {
  lesson: Lesson; category: Category; difficulty: Difficulty;
  duration: string; enrollees: string; rating: string; onClick: () => void;
}) {
  const T = useTheme()
  const [h, setH] = useState(false)

  const diffColor: Record<Difficulty, string> = {
    Beginner: T.green,
    Intermediate: T.indigo,
    Advanced: T.orange,
  }

  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.surface, border: `1px solid ${h ? T.indigoMid : T.border}`,
        borderRadius: T.radius, padding: 22, cursor: 'pointer',
        transition: 'all 0.22s ease',
        transform: h ? 'translateY(-3px)' : 'none',
        boxShadow: h ? '0 12px 30px rgba(0,0,0,0.06)' : '0 1px 2px rgba(0,0,0,0.02)',
        display: 'flex', flexDirection: 'column',
      }}>
      {/* Two badges — category muted, difficulty colored */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <MutedTag text={category} />
        <Tag color={diffColor[difficulty]} text={difficulty} />
      </div>

      <h3 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 17, color: T.heading, margin: '0 0 8px', lineHeight: 1.3 }}>
        {lesson.name}
      </h3>
      <p style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.body, margin: '0 0 18px', lineHeight: 1.5, flex: 1 }}>
        {lesson.description}
      </p>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: T.bodyLight, fontFamily: T.bodyFont, fontSize: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} /> {duration}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Users size={12} /> {enrollees}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.orange }}>
          <Star size={12} fill={T.orange} stroke={T.orange} /> {rating}
        </span>
        <span style={{ marginLeft: 'auto', color: T.indigo, transform: h ? 'translateX(4px)' : 'none', transition: 'transform 0.2s' }}>
          <ArrowRight size={16} />
        </span>
      </div>
    </div>
  )
}

function Tag({ color, text }: { color: string; text: string }) {
  const T = useTheme()
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 600, fontFamily: T.bodyFont,
      padding: '3px 10px', borderRadius: 8, letterSpacing: 0.2,
      color, background: `${color}1a`,
    }}>{text}</span>
  )
}

function MutedTag({ text }: { text: string }) {
  const T = useTheme()
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 500, fontFamily: T.bodyFont,
      padding: '3px 10px', borderRadius: 8, letterSpacing: 0.2,
      color: T.body, background: T.bgAlt,
    }}>{text}</span>
  )
}
