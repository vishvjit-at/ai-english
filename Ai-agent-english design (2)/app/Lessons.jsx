const LESSONS = [
  { id: 1, title: 'Job Interview Basics', desc: 'Practice common interview questions and confident responses.', category: 'Interviews', difficulty: 'Beginner', time: '15 min', icon: '💼' },
  { id: 2, title: 'Business Meeting Small Talk', desc: 'Learn to start conversations and build rapport in meetings.', category: 'Business', difficulty: 'Intermediate', time: '20 min', icon: '🤝' },
  { id: 3, title: 'Ordering Food & Drinks', desc: 'Practice placing orders and asking questions at restaurants.', category: 'Daily Life', difficulty: 'Beginner', time: '10 min', icon: '🍽️' },
  { id: 4, title: 'Presenting Your Ideas', desc: 'Structure and deliver clear presentations with confidence.', category: 'Business', difficulty: 'Advanced', time: '25 min', icon: '📊' },
  { id: 5, title: 'Grammar: Tenses Made Easy', desc: 'Master past, present, and future tenses through conversation.', category: 'Grammar', difficulty: 'Beginner', time: '15 min', icon: '📝' },
  { id: 6, title: 'Negotiation Skills', desc: 'Practice persuasive language and professional negotiation.', category: 'Business', difficulty: 'Advanced', time: '20 min', icon: '⚖️' },
  { id: 7, title: 'Phone Call Etiquette', desc: 'Handle professional phone calls with clarity and politeness.', category: 'Business', difficulty: 'Intermediate', time: '15 min', icon: '📞' },
  { id: 8, title: 'Describing Your Work', desc: 'Explain your role, projects, and achievements clearly.', category: 'Interviews', difficulty: 'Intermediate', time: '15 min', icon: '🎯' },
  { id: 9, title: 'Giving Directions', desc: 'Practice giving and understanding directions in English.', category: 'Daily Life', difficulty: 'Beginner', time: '10 min', icon: '🗺️' },
];

const CATEGORIES = ['All', 'Interviews', 'Business', 'Daily Life', 'Grammar'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function LessonsPage({ navigate }) {
  const [search, setSearch] = React.useState('');
  const [cat, setCat] = React.useState('All');
  const [diff, setDiff] = React.useState('All');

  const filtered = LESSONS.filter(l => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (cat !== 'All' && l.category !== cat) return false;
    if (diff !== 'All' && l.difficulty !== diff) return false;
    return true;
  });

  const diffColor = d => d === 'Beginner' ? T.green : d === 'Intermediate' ? T.orange : T.red;

  return (
    <div>
      <PageTitle label="Lessons" title="Explore the lesson library" subtitle="Pick a scenario and start practicing with your AI coach." />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search lessons..." />
        <PillTabs tabs={CATEGORIES} active={cat} onChange={setCat} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {DIFFICULTIES.map(d => (
          <button key={d} onClick={() => setDiff(d)} style={{
            fontSize: 13, fontFamily: T.bodyFont, fontWeight: 500, padding: '6px 14px',
            borderRadius: 8, border: `1px solid ${diff === d ? T.indigo : T.border}`,
            background: diff === d ? T.indigoLight : 'transparent',
            color: diff === d ? T.indigo : T.body, cursor: 'pointer', transition: 'all 0.2s',
          }}>{d}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {filtered.map(l => (
          <AppCard key={l.id} onClick={() => navigate('conversation', { lesson: l })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>{l.icon}</span>
              <Badge color={diffColor(l.difficulty)}>{l.difficulty}</Badge>
            </div>
            <h3 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 18, color: T.heading, margin: '0 0 6px' }}>{l.title}</h3>
            <p style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.body, margin: '0 0 14px', lineHeight: 1.5 }}>{l.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight }}>⏱ {l.time}</span>
              <span style={{ fontFamily: T.bodyFont, fontSize: 13, fontWeight: 600, color: T.indigo }}>Start →</span>
            </div>
          </AppCard>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: T.body, fontFamily: T.bodyFont }}>
            No lessons found. Try a different filter.
          </div>
        )}
      </div>
    </div>
  );
}

window.LessonsPage = LessonsPage;
window.LESSONS = LESSONS;
