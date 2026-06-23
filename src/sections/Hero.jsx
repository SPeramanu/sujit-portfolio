import ParticleCanvas from '../components/ParticleCanvas.jsx';
import GlitchText from '../components/GlitchText.jsx';
import MusicPlayer from '../components/MusicPlayer.jsx';
import useTypewriter from '../hooks/useTypewriter.js';
import { profile } from '../data/profile.js';

export default function Hero() {
  const tagline = useTypewriter(profile.taglines);

  return (
    <section id="hero" className="hero">
      <ParticleCanvas />
      <div className="hero-grid-overlay" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-pretitle">ENGINEERING SCIENCE AT THE UNIVERSITY OF TORONTO</div>
        <h1 className="hero-name">
          <GlitchText text={profile.name} />
        </h1>
        <div className="hero-tagline">
          <span className="prompt">&gt;</span> {tagline}
          <span className="type-cursor">█</span>
        </div>
        <p className="hero-blurb">
          My goal is to build robots that see, learn, and act for the benifit of the space and medical community.
        </p>
        <div className="hero-cta">
          <a href="#projects" className="btn btn-primary">
            VIEW PROJECTS
          </a>
          <a href="#contact" className="btn btn-ghost">
            CONTACT
          </a>
        </div>
      </div>

      <MusicPlayer />

      <a href="#about" className="scroll-indicator" aria-label="Scroll to about">
        <span className="scroll-chevron">▼</span>
        <span className="scroll-text">SCROLL</span>
      </a>
    </section>
  );
}
