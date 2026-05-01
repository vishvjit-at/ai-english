const PRACTICE_TOPICS = [
  { id: 'casual', label: 'Casual Chat', icon: '💬', desc: 'Talk about anything — hobbies, weekend plans, movies.' },
  { id: 'interview', label: 'Interview Prep', icon: '💼', desc: 'Practice answering tough interview questions.' },
  { id: 'debate', label: 'Debate Practice', icon: '⚡', desc: 'Argue a position and defend your point of view.' },
  { id: 'presentation', label: 'Presentation Prep', icon: '🎤', desc: 'Rehearse a talk or pitch before the real thing.' },
  { id: 'meeting', label: 'Meeting Simulation', icon: '📋', desc: 'Practice leading or participating in a team meeting.' },
  { id: 'custom', label: 'Custom Topic', icon: '✏️', desc: 'Type any topic you want to practice.' },
];

function CustomPracticePage({ navigate }) {
  const [selected, setSelected] = React.useState(null);
  const [customTopic, setCustomTopic] = React.useState('');
  const [goal, setGoal] = React.useState('Improve fluency');

  const goals = ['Improve fluency', 'Work on grammar', 'Build vocabulary', 'Sound more professional', 'Reduce hesitation'];

  return (
    <div>
      <PageTitle label="Custom Practice" title="Start a freeform conversation" subtitle="Pick a topic and goal, then jump straight into a voice session with your AI coach." />

      <h3 style={{ fontFamily: T.headingFont, fontWeight: 600, fontSize: 18, color: T.heading, margin: '0 0 16px' }}>Choose a topic</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 32 }}>
        {PRACTICE_TOPICS.map(t => (
          <AppCard key={t.id} onClick={() => setSelected(t.id)}
            style={{
              padding: '20px',
              border: selected === t.id ? `2px solid ${T.indigo}` : `1px solid ${T.border}`,
              background: selected === t.id ? T.indigoLight : T.white,
            }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
            <div style={{ fontFamily: T.headingFont, fontWeight: 600, fontSize: 16, color: T.heading, marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.body, lineHeight: 1.4 }}>{t.desc}</div>
          </AppCard>
        ))}
      </div>

      {selected === 'custom' && (
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontFamily: T.bodyFont, fontSize: 14, fontWeight: 600, color: T.heading, display: 'block', marginBottom: 8 }}>Your topic</label>
          <input value={customTopic} onChange={e => setCustomTopic(e.target.value)}
            placeholder="e.g. Explaining my project to a new team member"
            style={{
              width: '100%', maxWidth: 500, padding: '12px 16px', borderRadius: T.radiusSm,
              border: `1px solid ${T.border}`, fontFamily: T.bodyFont, fontSize: 15,
              outline: 'none', color: T.heading,
            }}
            onFocus={e => e.target.style.borderColor = T.indigo}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </div>
      )}

      <h3 style={{ fontFamily: T.headingFont, fontWeight: 600, fontSize: 18, color: T.heading, margin: '0 0 14px' }}>Set your goal</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
        {goals.map(g => (
          <button key={g} onClick={() => setGoal(g)} style={{
            fontFamily: T.bodyFont, fontSize: 14, fontWeight: 500, padding: '10px 20px',
            borderRadius: 100, border: `1.5px solid ${goal === g ? T.indigo : T.border}`,
            background: goal === g ? T.indigoLight : 'transparent',
            color: goal === g ? T.indigo : T.body, cursor: 'pointer', transition: 'all 0.2s',
          }}>{g}</button>
        ))}
      </div>

      <BtnPrimary onClick={() => selected && navigate('conversation', { topic: selected, goal })}
        style={{ opacity: selected ? 1 : 0.5, pointerEvents: selected ? 'auto' : 'none', padding: '14px 36px', fontSize: 16 }}>
        Start Conversation →
      </BtnPrimary>
    </div>
  );
}

window.CustomPracticePage = CustomPracticePage;
