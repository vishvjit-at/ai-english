function ProgressPage() {
  const stats = [
    { label: 'Sessions Completed', value: '47', icon: '🎯', sub: '+5 this week' },
    { label: 'Total Practice Time', value: '12.5h', icon: '⏱️', sub: '+2.1h this week' },
    { label: 'Avg Fluency Score', value: '82', icon: '📈', sub: '+4 from last month' },
    { label: 'Daily Streak', value: '8', icon: '🔥', sub: 'Keep it going!' },
  ];

  const skills = [
    { name: 'Fluency', score: 82, prev: 74 },
    { name: 'Grammar', score: 71, prev: 65 },
    { name: 'Pronunciation', score: 78, prev: 72 },
    { name: 'Vocabulary', score: 68, prev: 60 },
  ];

  // Simple chart data (last 7 days)
  const chartData = [65, 72, 68, 80, 76, 82, 85];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxVal = Math.max(...chartData);

  return (
    <div>
      <PageTitle label="Progress" title="Your improvement over time" subtitle="Track fluency, grammar, pronunciation, and vocabulary growth." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 36 }}>
        {stats.map((s, i) => <StatBox key={i} {...s} />)}
      </div>

      {/* Score chart */}
      <AppCard hover={false} style={{ marginBottom: 32, padding: 28 }}>
        <h3 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 18, color: T.heading, margin: '0 0 24px' }}>Weekly Score Trend</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
          {chartData.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: T.bodyFont, fontSize: 12, fontWeight: 600, color: T.heading }}>{v}</span>
              <div style={{
                width: '100%', maxWidth: 48, borderRadius: 8,
                height: `${(v / maxVal) * 120}px`,
                background: `linear-gradient(to top, ${T.indigo}, oklch(0.65 0.2 275))`,
                transition: 'height 0.5s ease',
              }}></div>
              <span style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.bodyLight }}>{days[i]}</span>
            </div>
          ))}
        </div>
      </AppCard>

      {/* Skill breakdown */}
      <AppCard hover={false} style={{ padding: 28 }}>
        <h3 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 18, color: T.heading, margin: '0 0 24px' }}>Skill Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {skills.map(sk => (
            <div key={sk.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: T.bodyFont, fontSize: 15, fontWeight: 600, color: T.heading }}>{sk.name}</span>
                <span style={{ fontFamily: T.headingFont, fontSize: 15, fontWeight: 700, color: T.indigo }}>
                  {sk.score}
                  <span style={{ fontSize: 12, fontWeight: 500, color: T.green, marginLeft: 6 }}>+{sk.score - sk.prev}</span>
                </span>
              </div>
              <ProgressBar value={sk.score} />
            </div>
          ))}
        </div>
      </AppCard>
    </div>
  );
}

window.ProgressPage = ProgressPage;
