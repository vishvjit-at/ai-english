function ConversationPage({ navigate, context }) {
  const [messages, setMessages] = React.useState([
    { role: 'ai', text: context?.lesson
      ? `Welcome! Let's practice "${context.lesson.title}". I'll guide you through this scenario. Ready to begin?`
      : `Hi there! Let's have a conversation. ${context?.goal ? `Your goal: ${context.goal}.` : ''} Go ahead and say something!`
    },
  ]);
  const [input, setInput] = React.useState('');
  const [listening, setListening] = React.useState(false);
  const [aiTyping, setAiTyping] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [corrections, setCorrections] = React.useState(0);
  const chatRef = React.useRef(null);

  // Timer
  React.useEffect(() => {
    const iv = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const AI_RESPONSES = [
    { text: "That's a great sentence! Just a small note — try saying \"I have been working\" instead of \"I am working since.\" It sounds more natural.", correction: true },
    { text: "Nice! Your pronunciation is getting better. Can you tell me more about that?", correction: false },
    { text: "Good effort! One thing — \"discuss about\" isn't needed. Just say \"discuss the project.\" The verb already implies the topic.", correction: true },
    { text: "I like how you structured that answer. Very clear and professional. What would you say next?", correction: false },
    { text: "Almost perfect! Instead of \"I am agree,\" try \"I agree\" — no need for 'am' here.", correction: true },
  ];

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setAiTyping(true);
    setTimeout(() => {
      const resp = AI_RESPONSES[messages.length % AI_RESPONSES.length];
      if (resp.correction) setCorrections(c => c + 1);
      setMessages(m => [...m, { role: 'ai', text: resp.text, correction: resp.correction }]);
      setAiTyping(false);
    }, 1200 + Math.random() * 800);
  }

  function toggleListening() {
    setListening(l => !l);
    if (!listening) {
      // Simulate voice input after 2s
      setTimeout(() => {
        setInput('I think this is very useful for improving my English.');
        setListening(false);
      }, 2000);
    }
  }

  React.useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, aiTyping]);

  const title = context?.lesson?.title || context?.topic || 'Free Conversation';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)', margin: '-32px -32px 0', padding: 0 }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px', borderBottom: `1px solid ${T.border}`, background: T.white,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('lessons')} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: T.body, padding: 4,
          }}>←</button>
          <div>
            <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 17, color: T.heading }}>{title}</div>
            <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.bodyLight }}>Session in progress</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.body }}>⏱ {fmtTime(elapsed)}</div>
          <div style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.orange, fontWeight: 600 }}>✏️ {corrections} corrections</div>
          <BtnSecondary onClick={() => navigate('history')} style={{ padding: '8px 18px', fontSize: 13 }}>End Session</BtnSecondary>
        </div>
      </div>

      {/* Chat */}
      <div ref={chatRef} style={{
        flex: 1, overflowY: 'auto', padding: '28px', display: 'flex',
        flexDirection: 'column', gap: 16, background: T.bgAlt,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            animation: 'fadeSlideUp 0.3s ease forwards',
          }}>
            <div style={{
              maxWidth: 520, padding: '14px 20px', borderRadius: 18,
              fontFamily: T.bodyFont, fontSize: 15, lineHeight: 1.55,
              ...(m.role === 'user' ? {
                background: T.indigo, color: T.white,
                borderBottomRightRadius: 6,
              } : {
                background: T.white, color: T.heading,
                border: m.correction ? `1.5px solid ${T.orange}` : `1px solid ${T.border}`,
                borderBottomLeftRadius: 6,
              }),
            }}>
              {m.correction && <span style={{ fontSize: 12, fontWeight: 600, color: T.orange, display: 'block', marginBottom: 4 }}>💡 Gentle correction</span>}
              {m.text}
            </div>
          </div>
        ))}
        {aiTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '14px 24px', borderRadius: 18, borderBottomLeftRadius: 6,
              background: T.white, border: `1px solid ${T.border}`,
              fontFamily: T.bodyFont, fontSize: 15, color: T.bodyLight,
            }}>
              <span style={{ animation: 'pulseDot 1s infinite' }}>●</span>
              <span style={{ animation: 'pulseDot 1s 0.2s infinite' }}> ●</span>
              <span style={{ animation: 'pulseDot 1s 0.4s infinite' }}> ●</span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px',
        borderTop: `1px solid ${T.border}`, background: T.white, flexShrink: 0,
      }}>
        {/* Mic button */}
        <button onClick={toggleListening} style={{
          width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: listening ? T.red : T.indigoLight,
          color: listening ? T.white : T.indigo,
          fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: listening ? `0 0 0 6px ${T.red}30` : 'none',
          animation: listening ? 'pulseDot 1.5s infinite' : 'none',
        }}>🎙️</button>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={listening ? 'Listening...' : 'Type or tap the mic to speak...'}
          style={{
            flex: 1, padding: '14px 18px', borderRadius: 14,
            border: `1px solid ${T.border}`, fontFamily: T.bodyFont, fontSize: 15,
            outline: 'none', color: T.heading, background: T.bgAlt,
          }}
          onFocus={e => e.target.style.borderColor = T.indigo}
          onBlur={e => e.target.style.borderColor = T.border}
        />
        <BtnPrimary onClick={sendMessage} style={{ padding: '12px 24px' }}>Send</BtnPrimary>
      </div>
    </div>
  );
}

window.ConversationPage = ConversationPage;
