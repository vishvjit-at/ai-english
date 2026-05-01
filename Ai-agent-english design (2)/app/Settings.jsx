function SettingsPage() {
  const [profile, setProfile] = React.useState({ name: 'Priya Sharma', email: 'priya@example.com' });
  const [voiceSpeed, setVoiceSpeed] = React.useState(1);
  const [reminders, setReminders] = React.useState(true);
  const [reminderTime, setReminderTime] = React.useState('09:00');
  const [mic, setMic] = React.useState('Default Microphone');
  const [saved, setSaved] = React.useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle = {
    width: '100%', maxWidth: 360, padding: '12px 16px', borderRadius: T.radiusSm,
    border: `1px solid ${T.border}`, fontFamily: T.bodyFont, fontSize: 15,
    outline: 'none', color: T.heading, background: T.white,
  };
  const labelStyle = {
    fontFamily: T.bodyFont, fontSize: 14, fontWeight: 600, color: T.heading,
    display: 'block', marginBottom: 8,
  };

  function Section({ title, children }) {
    return (
      <AppCard hover={false} style={{ padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 18, color: T.heading, margin: '0 0 20px' }}>{title}</h3>
        {children}
      </AppCard>
    );
  }

  return (
    <div>
      <PageTitle label="Settings" title="Manage your preferences" subtitle="Profile, voice, reminders, and account settings." />

      <Section title="Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} style={inputStyle}
              onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} style={inputStyle}
              onFocus={e => e.target.style.borderColor = T.indigo} onBlur={e => e.target.style.borderColor = T.border} />
          </div>
        </div>
      </Section>

      <Section title="Voice & Microphone">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Microphone</label>
            <select value={mic} onChange={e => setMic(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option>Default Microphone</option>
              <option>External USB Microphone</option>
              <option>Headset Microphone</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>AI Voice Speed</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 360 }}>
              <span style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight }}>Slow</span>
              <input type="range" min="0.5" max="2" step="0.1" value={voiceSpeed}
                onChange={e => setVoiceSpeed(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: T.indigo }} />
              <span style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight }}>Fast</span>
              <span style={{ fontFamily: T.headingFont, fontWeight: 600, fontSize: 14, color: T.indigo, minWidth: 36, textAlign: 'center' }}>{voiceSpeed}×</span>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Daily Reminders">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <span style={{ fontFamily: T.bodyFont, fontSize: 15, color: T.heading }}>Practice reminders</span>
          <button onClick={() => setReminders(!reminders)} style={{
            width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: reminders ? T.indigo : T.border, position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: T.white,
              position: 'absolute', top: 3,
              left: reminders ? 23 : 3, transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}></div>
          </button>
        </div>
        {reminders && (
          <div>
            <label style={labelStyle}>Reminder time</label>
            <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
              style={{ ...inputStyle, maxWidth: 180 }} />
          </div>
        )}
      </Section>

      <Section title="Account">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <BtnSecondary style={{ fontSize: 14 }}>Change Password</BtnSecondary>
          <BtnSecondary style={{ fontSize: 14, color: T.red, borderColor: T.red }}>Delete Account</BtnSecondary>
        </div>
      </Section>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <BtnPrimary onClick={save} style={{ padding: '14px 36px' }}>Save Changes</BtnPrimary>
        {saved && <span style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.green, fontWeight: 600, animation: 'fadeSlideUp 0.3s ease' }}>✓ Saved!</span>}
      </div>
    </div>
  );
}

window.SettingsPage = SettingsPage;
