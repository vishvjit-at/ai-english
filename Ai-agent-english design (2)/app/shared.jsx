/* Shared design tokens and utilities for the SpeakUp app */

const T = {
  indigo: 'oklch(0.55 0.22 275)',
  indigoLight: 'oklch(0.55 0.22 275 / 0.08)',
  indigoMid: 'oklch(0.55 0.22 275 / 0.15)',
  orange: 'oklch(0.70 0.18 30)',
  bg: 'oklch(0.985 0.005 275)',
  bgAlt: 'oklch(0.97 0.008 275)',
  heading: 'oklch(0.18 0.02 275)',
  body: 'oklch(0.45 0.02 275)',
  bodyLight: 'oklch(0.55 0.02 275)',
  border: 'oklch(0.9 0.01 275)',
  borderLight: 'oklch(0.93 0.01 275)',
  white: '#fff',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#eab308',
  headingFont: "'Space Grotesk', sans-serif",
  bodyFont: "'DM Sans', sans-serif",
  radius: 16,
  radiusSm: 10,
  shadow: '0 2px 12px oklch(0.2 0.02 275 / 0.06)',
  shadowHover: '0 8px 30px oklch(0.55 0.22 275 / 0.1)',
};

/* Reusable small components */
function AppCard({ children, style, hover = true, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radius,
        padding: 24, transition: 'all 0.25s ease', cursor: onClick ? 'pointer' : 'default',
        transform: hover && h ? 'translateY(-3px)' : 'none',
        boxShadow: hover && h ? T.shadowHover : T.shadow,
        ...style,
      }}>{children}</div>
  );
}

function Badge({ children, color = T.indigo, bg }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 12, fontWeight: 600, fontFamily: T.bodyFont,
      padding: '4px 12px', borderRadius: 100, letterSpacing: 0.5, textTransform: 'uppercase',
      color: color, background: bg || (color === T.indigo ? T.indigoLight : `${color}20`),
    }}>{children}</span>
  );
}

function PageTitle({ label, title, subtitle }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {label && <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: T.indigo, fontFamily: T.bodyFont, marginBottom: 8 }}>{label}</div>}
      <h1 style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 'clamp(26px, 4vw, 36px)', color: T.heading, letterSpacing: -0.5, margin: '0 0 8px' }}>{title}</h1>
      {subtitle && <p style={{ fontFamily: T.bodyFont, fontSize: 16, color: T.body, margin: 0, lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}

function StatBox({ label, value, sub, icon }) {
  return (
    <AppCard hover={false} style={{ textAlign: 'center', padding: '20px 16px' }}>
      {icon && <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>}
      <div style={{ fontFamily: T.headingFont, fontWeight: 700, fontSize: 28, color: T.heading }}>{value}</div>
      <div style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.body, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.green, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
    </AppCard>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', maxWidth: 400, width: '100%' }}>
      <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Search...'}
        style={{
          width: '100%', padding: '12px 16px 12px 42px', borderRadius: T.radiusSm,
          border: `1px solid ${T.border}`, fontFamily: T.bodyFont, fontSize: 15,
          outline: 'none', background: T.white, color: T.heading,
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = T.indigo}
        onBlur={e => e.target.style.borderColor = T.border}
      />
    </div>
  );
}

function PillTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          fontFamily: T.bodyFont, fontSize: 14, fontWeight: 500,
          padding: '8px 18px', borderRadius: 100, border: 'none', cursor: 'pointer',
          background: active === t ? T.indigo : T.bgAlt,
          color: active === t ? T.white : T.body,
          transition: 'all 0.2s',
        }}>{t}</button>
      ))}
    </div>
  );
}

function BtnPrimary({ children, onClick, style }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontFamily: T.bodyFont, fontSize: 15, fontWeight: 600, border: 'none',
        padding: '12px 28px', borderRadius: T.radiusSm, cursor: 'pointer',
        background: h ? 'oklch(0.48 0.22 275)' : T.indigo, color: T.white,
        transition: 'all 0.25s', transform: h ? 'translateY(-2px)' : 'none',
        boxShadow: h ? '0 6px 20px oklch(0.55 0.22 275 / 0.3)' : 'none',
        ...style,
      }}>{children}</button>
  );
}

function BtnSecondary({ children, onClick, style }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontFamily: T.bodyFont, fontSize: 15, fontWeight: 600,
        border: `1.5px solid ${T.border}`, padding: '12px 28px',
        borderRadius: T.radiusSm, cursor: 'pointer',
        background: h ? T.bgAlt : T.white, color: T.heading,
        transition: 'all 0.2s', ...style,
      }}>{children}</button>
  );
}

function ProgressBar({ value, max = 100, color = T.indigo }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ height: 8, borderRadius: 4, background: T.bgAlt, overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: color, transition: 'width 0.5s ease' }}></div>
    </div>
  );
}

Object.assign(window, { T, AppCard, Badge, PageTitle, StatBox, SearchBar, PillTabs, BtnPrimary, BtnSecondary, ProgressBar });
