import useTypewriter from '../hooks/useTypewriter.js';
import { profile } from '../data/profile.js';

export default function Hero() {
  const tagline = useTypewriter(profile.taglines);

  return (
    <section id="hero" className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-pretitle">Engineering Science · University of Toronto</div>
          <h1 className="hero-name">{profile.name}</h1>
          <div className="hero-tagline">
            {tagline}
            <span className="type-cursor">|</span>
          </div>
          <p className="hero-blurb">
            I seek to build robots that see, learn, and act for the benefit of the space
            and medical communities.
          </p>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary">
              View Work
            </a>
            <a href="#contact" className="btn btn-ghost">
              Contact
            </a>
          </div>
        </div>

        <div className="hero-portrait">
          <img src="assets/photos/portrait.jpg" alt="Sujit Peramanu" />
        </div>
      </div>

      <a href="#about" className="scroll-indicator" aria-label="Scroll to about">
        <span className="scroll-chevron">▼</span>
        <span className="scroll-text">SCROLL</span>
      </a>
    </section>
  );
}
