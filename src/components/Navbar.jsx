import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#about', label: 'ABOUT' },
  { href: '#experience', label: 'EXPERIENCE' },
  { href: '#projects', label: 'PROJECTS' },
  { href: '#photography', label: 'PHOTOGRAPHY' },
  { href: '#contact', label: 'CONTACT' },
  { href: '#/globe', label: 'GLOBE', special: true },
  { href: '#/robotron', label: 'ARCADE', special: true },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a className="nav-logo" href="#hero" onClick={() => setOpen(false)}>
        <span className="logo-bracket">[</span>SP<span className="logo-cursor">_</span>
        <span className="logo-bracket">]</span>
      </a>
      <button
        className={`nav-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        <span /><span /><span />
      </button>
      <ul className={`nav-links ${open ? 'open' : ''}`}>
        {LINKS.map((l, i) => (
          <li key={l.href}>
            <a
              href={l.href}
              className={l.special ? 'nav-globe-link' : ''}
              onClick={() => setOpen(false)}
            >
              <span className="nav-index">{String(i + 1).padStart(2, '0')}.</span> {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
