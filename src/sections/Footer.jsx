import { profile } from '../data/profile.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-line" aria-hidden="true" />
      <div className="footer-content">
        <span>
          © {new Date().getFullYear()} {profile.name} // ALL SYSTEMS NOMINAL
        </span>
        <span className="footer-meta">
          DESIGNED & BUILT BY SUJIT PERAMANU · REACT + VITE
        </span>
      </div>
    </footer>
  );
}
