function ScrollReveal({ children, delay = 0 }) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>{children}</div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 14, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
      color: 'oklch(0.55 0.22 275)', fontFamily: "'DM Sans', sans-serif", marginBottom: 12,
    }}>{children}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
      fontSize: 'clamp(32px, 4vw, 44px)', lineHeight: 1.15,
      letterSpacing: -1, color: 'oklch(0.18 0.02 275)', margin: '0 0 48px',
    }}>{children}</h2>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <ScrollReveal delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'oklch(0.97 0.008 275)',
          border: '1px solid oklch(0.9 0.01 275)',
          borderRadius: 18, padding: '36px 30px', position: 'relative',
          overflow: 'hidden', transition: 'all 0.35s ease',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hovered ? '0 20px 50px oklch(0.55 0.22 275 / 0.1)' : '0 2px 10px oklch(0.2 0.02 275 / 0.04)',
        }}
      >
        {/* Top gradient bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, height: 4, borderRadius: '18px 18px 0 0',
          background: 'linear-gradient(90deg, oklch(0.55 0.22 275), oklch(0.70 0.18 30))',
          width: hovered ? '100%' : '0%',
          transition: 'width 0.4s ease',
        }}></div>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'oklch(0.55 0.22 275 / 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, marginBottom: 20,
        }}>{icon}</div>
        <h3 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
          fontSize: 21, color: 'oklch(0.18 0.02 275)', margin: '0 0 10px',
        }}>{title}</h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.6,
          color: 'oklch(0.45 0.02 275)', margin: 0,
        }}>{desc}</p>
      </div>
    </ScrollReveal>
  );
}

function Features() {
  const cards = [
    { icon: '🎙️', title: 'Real-Time AI Conversations', desc: 'Speak naturally with an AI coach that listens, responds, and corrects — like a patient tutor who never judges.' },
    { icon: '📚', title: 'Structured Lesson Library', desc: 'Practice real scenarios: job interviews, business meetings, daily conversations — each designed to build fluency fast.' },
    { icon: '📈', title: 'Smart Progress Tracking', desc: 'See your fluency, grammar, and vocabulary improve over time with detailed session history and skill breakdowns.' },
  ];
  return (
    <section id="features" style={{
      padding: '100px clamp(20px, 4vw, 60px)',
      maxWidth: 1200, margin: '0 auto',
    }}>
      <ScrollReveal>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 0' }}>
          <SectionLabel>Why SpeakUp</SectionLabel>
          <SectionTitle>Built for how you actually learn to speak</SectionTitle>
        </div>
      </ScrollReveal>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 28,
      }}>
        {cards.map((c, i) => (
          <FeatureCard key={i} {...c} delay={i * 0.12} />
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: 1, title: 'Choose a lesson or topic', desc: 'Browse structured lessons or start a freeform conversation on any topic you want to practice.' },
    { num: 2, title: 'Speak with your AI coach', desc: 'Have a real-time voice conversation. The AI listens, responds naturally, and gently corrects your mistakes.' },
    { num: 3, title: 'Review and improve', desc: 'Get a detailed transcript with feedback, track your progress, and review new vocabulary from your sessions.' },
  ];
  return (
    <section id="how-it-works" style={{
      padding: '100px clamp(20px, 4vw, 60px)',
      background: 'oklch(0.97 0.008 275)',
      borderTop: '1px solid oklch(0.9 0.01 275)',
      borderBottom: '1px solid oklch(0.9 0.01 275)',
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionLabel>How It Works</SectionLabel>
            <SectionTitle>Three steps to fluent speaking</SectionTitle>
          </div>
        </ScrollReveal>
        <div style={{ position: 'relative', paddingLeft: 60 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 22, top: 8, bottom: 8, width: 2,
            background: 'oklch(0.85 0.02 275)',
          }}></div>
          {steps.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 24,
                marginBottom: i < 2 ? 48 : 0, position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', left: -60 + 10, top: 2,
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'oklch(0.55 0.22 275)',
                  color: '#fff', fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 20px oklch(0.55 0.22 275 / 0.3)',
                  zIndex: 1,
                }}>{s.num}</div>
                <div style={{ paddingTop: 4 }}>
                  <h3 style={{
                    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                    fontSize: 22, color: 'oklch(0.18 0.02 275)', margin: '0 0 8px',
                  }}>{s.title}</h3>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 17, lineHeight: 1.6,
                    color: 'oklch(0.45 0.02 275)', margin: 0,
                  }}>{s.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const [hovered, setHovered] = React.useState(false);
  return (
    <section style={{ padding: '100px clamp(20px, 4vw, 60px)', maxWidth: 1200, margin: '0 auto' }}>
      <ScrollReveal>
        <div style={{
          background: 'linear-gradient(135deg, oklch(0.55 0.22 275), oklch(0.38 0.25 290))',
          borderRadius: 28, padding: 'clamp(50px, 8vw, 80px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          boxShadow: '0 30px 80px oklch(0.55 0.22 275 / 0.25)',
        }}>
          {/* Wave decoration */}
          <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.1 }}
            viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" fill="white"/>
          </svg>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
            fontSize: 'clamp(28px, 4vw, 42px)', color: '#fff',
            margin: '0 0 16px', letterSpacing: -0.5, position: 'relative',
          }}>Ready to speak with confidence?</h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: 'rgba(255,255,255,0.85)',
            margin: '0 0 36px', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto',
            position: 'relative', lineHeight: 1.6,
          }}>Join thousands of professionals who are building their English fluency every day.</p>
          <button
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              background: '#fff', color: 'oklch(0.55 0.22 275)',
              border: 'none', padding: '18px 40px', borderRadius: 14,
              fontSize: 17, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer', position: 'relative',
              transition: 'all 0.3s ease',
              transform: hovered ? 'translateY(-3px) scale(1.03)' : 'none',
              boxShadow: hovered ? '0 12px 30px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.1)',
            }}
          >Start Practicing — It's Free</button>
        </div>
      </ScrollReveal>
    </section>
  );
}

function Footer() {
  const [hoveredLink, setHoveredLink] = React.useState(null);
  return (
    <footer style={{
      padding: '28px clamp(20px, 4vw, 60px)',
      borderTop: '1px solid oklch(0.9 0.01 275)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 12,
      fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'oklch(0.55 0.02 275)',
    }}>
      <span>© 2026 SpeakUp. All rights reserved.</span>
      <div style={{ display: 'flex', gap: 24 }}>
        {['Privacy', 'Terms', 'Support'].map(l => (
          <a key={l} href="#"
            onMouseEnter={() => setHoveredLink(l)}
            onMouseLeave={() => setHoveredLink(null)}
            style={{
              color: hoveredLink === l ? 'oklch(0.55 0.22 275)' : 'oklch(0.55 0.02 275)',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
          >{l}</a>
        ))}
      </div>
    </footer>
  );
}

Object.assign(window, { ScrollReveal, Features, HowItWorks, CTASection, Footer });
