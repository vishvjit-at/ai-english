function WaveformBars({ size = 20 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: size, marginRight: 8 }}>
      {[0.6, 1, 0.7, 0.9, 0.5].map((h, i) => (
        <span key={i} style={{
          width: 3, borderRadius: 2,
          background: 'white',
          animation: `waveBar 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
          height: size * h,
        }}></span>
      ))}
    </span>
  );
}

function AIOrb() {
  return (
    <div style={{ position: 'relative', width: 420, height: 420, flexShrink: 0 }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', inset: -40,
        background: 'radial-gradient(circle, oklch(0.55 0.22 275 / 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
      }}></div>
      {/* Main orb */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 40%, oklch(0.65 0.2 275), oklch(0.45 0.25 275))',
        boxShadow: '0 0 80px oklch(0.55 0.22 275 / 0.3)',
      }}></div>
      {/* Pulse rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute', inset: -20, borderRadius: '50%',
          border: '1.5px solid oklch(0.55 0.22 275 / 0.25)',
          animation: `pulseRing 3s ease-out ${i * 1}s infinite`,
        }}></div>
      ))}
      {/* Center waveform bars */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {[28, 44, 36, 52, 32, 48, 38, 42].map((h, i) => (
          <div key={i} style={{
            width: 6, borderRadius: 3,
            background: `linear-gradient(to top, oklch(0.55 0.22 275), oklch(0.70 0.18 30))`,
            animation: `waveBar 0.9s ease-in-out ${i * 0.12}s infinite alternate`,
            height: h,
          }}></div>
        ))}
      </div>
      {/* Floating chat bubbles */}
      {[
        { text: 'How do I introduce myself?', bg: 'oklch(0.55 0.22 275)', color: '#fff', top: '8%', left: '-30%', delay: 0 },
        { text: 'Great start! Try saying…', bg: '#fff', color: 'oklch(0.18 0.02 275)', top: '55%', right: '-25%', left: 'auto', delay: 0.5 },
        { text: 'Tell me about your company', bg: '#fff', color: 'oklch(0.18 0.02 275)', bottom: '5%', left: '-20%', top: 'auto', delay: 1 },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', top: b.top, left: b.left, right: b.right, bottom: b.bottom,
          background: b.bg, color: b.color,
          padding: '12px 18px', borderRadius: 16, fontSize: 14, fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: '0 8px 30px oklch(0.2 0.02 275 / 0.12)',
          whiteSpace: 'nowrap',
          animation: `floatBubble 4s ease-in-out ${b.delay}s infinite`,
        }}>{b.text}</div>
      ))}
    </div>
  );
}

function Hero() {
  const items = [
    // Badge
    <div key="badge" style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'oklch(0.55 0.22 275 / 0.08)', padding: '6px 16px',
      borderRadius: 100, fontSize: 14, fontWeight: 600, letterSpacing: 1.5,
      textTransform: 'uppercase', color: 'oklch(0.55 0.22 275)',
      fontFamily: "'DM Sans', sans-serif", marginBottom: 20,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
        animation: 'pulseDot 2s ease-in-out infinite',
      }}></span>
      AI-Powered Practice
    </div>,

    // Headline
    <h1 key="h1" style={{
      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
      fontSize: 'clamp(42px, 6vw, 68px)', lineHeight: 1.08,
      letterSpacing: -1.5, color: 'oklch(0.18 0.02 275)', margin: '0 0 20px',
    }}>
      Speak English with{' '}
      <span style={{
        background: 'linear-gradient(135deg, oklch(0.55 0.22 275), oklch(0.70 0.18 30))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>confidence</span>
    </h1>,

    // Subtitle
    <p key="sub" style={{
      fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(17px, 2vw, 20px)',
      lineHeight: 1.6, color: 'oklch(0.45 0.02 275)', margin: '0 0 32px', maxWidth: 520,
    }}>
      Practice real conversations with an AI coach that listens, corrects gently, and helps you grow — at your own pace, without judgment.
    </p>,

    // Buttons
    <div key="btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
      <HeroButton primary>
        <WaveformBars size={16} />Start Practicing
      </HeroButton>
      <HeroButton>View Lessons</HeroButton>
    </div>,

    // Social proof
    <div key="social" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex' }}>
        {['#6366f1','#f97316','#22c55e','#ec4899','#8b5cf6'].map((c, i) => (
          <div key={i} style={{
            width: 36, height: 36, borderRadius: '50%', background: c,
            border: '2.5px solid oklch(0.985 0.005 275)',
            marginLeft: i ? -10 : 0, position: 'relative', zIndex: 5 - i,
          }}></div>
        ))}
      </div>
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'oklch(0.45 0.02 275)',
      }}>
        <strong style={{ color: 'oklch(0.18 0.02 275)' }}>12,000+</strong> learners improving daily
      </span>
    </div>,
  ];

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: '100px clamp(20px, 4vw, 60px) 60px',
      gap: 'clamp(40px, 6vw, 100px)', justifyContent: 'space-between',
      maxWidth: 1300, margin: '0 auto',
    }}>
      <div style={{ flex: '1 1 520px', maxWidth: 600 }}>
        {items.map((item, i) => (
          <div key={i} className="hero-stagger" style={{
            opacity: 0,
            animation: `fadeSlideUp 0.7s ease ${0.15 + i * 0.12}s forwards`,
          }}>{item}</div>
        ))}
      </div>
      <div className="orb-container" style={{
        flex: '0 0 auto',
        opacity: 0,
        animation: 'fadeSlideUp 1s ease 0.6s forwards',
      }}>
        <AIOrb />
      </div>
    </section>
  );
}

function HeroButton({ primary, children }) {
  const [hovered, setHovered] = React.useState(false);
  const base = primary ? {
    background: hovered ? 'oklch(0.48 0.22 275)' : 'oklch(0.55 0.22 275)',
    color: '#fff',
    boxShadow: hovered ? '0 8px 30px oklch(0.55 0.22 275 / 0.35)' : '0 4px 15px oklch(0.55 0.22 275 / 0.2)',
  } : {
    background: hovered ? 'oklch(0.93 0.01 275)' : 'oklch(0.95 0.008 275)',
    color: 'oklch(0.18 0.02 275)',
  };
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...base,
        border: 'none', padding: '16px 32px', borderRadius: 14,
        fontSize: 16, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >{children}</button>
  );
}

window.Hero = Hero;
