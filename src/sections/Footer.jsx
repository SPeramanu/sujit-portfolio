import { profile } from '../data/profile.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-line" aria-hidden="true" />
      <div className="footer-content">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className="footer-meta">
          Designed &amp; built by Sujit Peramanu · React + Vite
        </span>
      </div>
    </footer>
  );
}
