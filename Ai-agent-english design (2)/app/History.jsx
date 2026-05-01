const SESSIONS = [
  { id: 1, title: 'Job Interview Basics', date: 'Apr 26, 2026', duration: '14 min', score: 82, corrections: 5, type: 'Lesson' },
  { id: 2, title: 'Casual Chat — Weekend Plans', date: 'Apr 25, 2026', duration: '20 min', score: 88, corrections: 3, type: 'Custom' },
  { id: 3, title: 'Business Meeting Small Talk', date: 'Apr 24, 2026', duration: '18 min', score: 76, corrections: 7, type: 'Lesson' },
  { id: 4, title: 'Debate — Remote vs Office Work', date: 'Apr 23, 2026', duration: '22 min', score: 91, corrections: 2, type: 'Custom' },
  { id: 5, title: 'Presenting Your Ideas', date: 'Apr 22, 2026', duration: '16 min', score: 73, corrections: 8, type: 'Lesson' },
  { id: 6, title: 'Phone Call Etiquette', date: 'Apr 20, 2026', duration: '12 min', score: 85, corrections: 4, type: 'Lesson' },
  { id: 7, title: 'Interview Prep — Tell Me About Yourself', date: 'Apr 19, 2026', duration: '15 min', score: 79, corrections: 6, type: 'Custom' },
];

function SessionHistoryPage({ navigate }) {
  const [filter, setFilter] = React.useState('All');
  const [expandedId, setExpandedId] = React.useState(null);

  const filtered = filter === 'All' ? SESSIONS : SESSIONS.filter(s => s.type === filter);
  const scoreColor = s => s >= 85 ? T.green : s >= 70 ? T.orange : T.red;

  return (
    <div>
      <PageTitle label="History" title="Your practice sessions" subtitle="Review past sessions, scores, and feedback." />
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 28 }}>
        <PillTabs tabs={['All', 'Lesson', 'Custom']} active={filter} onChange={setFilter} />
        <div style={{ marginLeft: 'auto', fontFamily: T.bodyFont, fontSize: 14, color: T.bodyLight }}>
          {filtered.length} session{filtered.length !== 1 && 's'}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(s => (
          <AppCard key={s.id} onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
            style={{ padding: '18px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontFamily: T.headingFont, fontWeight: 600, fontSize: 16, color: T.heading }}>{s.title}</div>
                <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight, marginTop: 2 }}>
                  {s.date} · {s.duration} · <Badge color={s.type === 'Lesson' ? T.indigo : T.orange}>{s.type}</Badge>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 24, color: scoreColor(s.score) }}>{s.score}</div>
                  <div style={{ fontFamily: T.bodyFont, fontSize: 11, color: T.bodyLight }}>Score</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 24, color: T.heading }}>{s.corrections}</div>
                  <div style={{ fontFamily: T.bodyFont, fontSize: 11, color: T.bodyLight }}>Corrections</div>
                </div>
                <span style={{ fontSize: 18, color: T.bodyLight, transition: 'transform 0.2s', transform: expandedId === s.id ? 'rotate(180deg)' : 'none' }}>▾</span>
              </div>
            </div>
            {expandedId === s.id && (
              <div style={{
                marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}`,
                fontFamily: T.bodyFont, fontSize: 14, color: T.body, lineHeight: 1.6,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <div><strong style={{ color: T.heading }}>Fluency:</strong> Good</div>
                  <div><strong style={{ color: T.heading }}>Grammar:</strong> {s.corrections <= 3 ? 'Excellent' : s.corrections <= 6 ? 'Good' : 'Needs work'}</div>
                  <div><strong style={{ color: T.heading }}>Pronunciation:</strong> Good</div>
                  <div><strong style={{ color: T.heading }}>Vocabulary:</strong> {s.score >= 85 ? 'Advanced' : 'Intermediate'}</div>
                </div>
                <p style={{ margin: '0 0 12px', color: T.bodyLight, fontStyle: 'italic' }}>
                  "Good session overall. Focus on tense consistency and try to use more varied sentence structures."
                </p>
                <BtnSecondary onClick={e => { e.stopPropagation(); }} style={{ padding: '8px 18px', fontSize: 13 }}>
                  View Full Transcript
                </BtnSecondary>
              </div>
            )}
          </AppCard>
        ))}
      </div>
    </div>
  );
}

window.SessionHistoryPage = SessionHistoryPage;
