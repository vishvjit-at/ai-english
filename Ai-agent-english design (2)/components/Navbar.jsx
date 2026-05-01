const NavbarStyles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, height: 72, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 clamp(20px, 4vw, 60px)',
    borderBottom: '1px solid oklch(0.85 0.02 275 / 0.5)',
    transition: 'box-shadow 0.3s ease, background 0.3s ease',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: 'oklch(0.55 0.22 275)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 18, fontFamily: "'Space Grotesk', sans-serif",
  },
  logoText: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
    fontSize: 22, color: 'oklch(0.18 0.02 275)', letterSpacing: -0.5,
  },
  links: {
    display: 'flex', alignItems: 'center', gap: 6,
  },
  link: {
    fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
    color: 'oklch(0.45 0.02 275)', textDecoration: 'none',
    padding: '8px 16px', borderRadius: 10, transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  signIn: {
    fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
    color: 'oklch(0.55 0.22 275)', background: 'transparent',
    border: '1.5px solid oklch(0.55 0.22 275)',
    padding: '8px 22px', borderRadius: 10, cursor: 'pointer',
    transition: 'all 0.2s ease', marginLeft: 10,
  },
};

function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [hoveredLink, setHoveredLink] = React.useState(null);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = ['Features', 'How it works', 'Lessons'];

  return (
    <nav style={{
      ...NavbarStyles.nav,
      background: scrolled ? 'oklch(0.985 0.005 275 / 0.92)' : 'oklch(0.985 0.005 275 / 0.85)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      boxShadow: scrolled ? '0 4px 30px oklch(0.55 0.22 275 / 0.08)' : 'none',
    }}>
      <a href="#" style={NavbarStyles.logo}>
        <div style={NavbarStyles.logoIcon}>S</div>
        <span style={NavbarStyles.logoText}>SpeakUp</span>
      </a>
      <div style={NavbarStyles.links}>
        {navLinks.map(link => (
          <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
            style={{
              ...NavbarStyles.link,
              background: hoveredLink === link ? 'oklch(0.55 0.22 275 / 0.08)' : 'transparent',
              color: hoveredLink === link ? 'oklch(0.55 0.22 275)' : NavbarStyles.link.color,
            }}
            onMouseEnter={() => setHoveredLink(link)}
            onMouseLeave={() => setHoveredLink(null)}
          >{link}</a>
        ))}
        <button
          style={{
            ...NavbarStyles.signIn,
            background: hoveredLink === 'signin' ? 'oklch(0.55 0.22 275 / 0.06)' : 'transparent',
          }}
          onMouseEnter={() => setHoveredLink('signin')}
          onMouseLeave={() => setHoveredLink(null)}
        >Sign In</button>
      </div>
    </nav>
  );
}

window.Navbar = Navbar;
