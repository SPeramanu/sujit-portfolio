import { lazy, Suspense, useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar.jsx';
import FractalBackground from './components/FractalBackground.jsx';
import MusicPlayer from './components/MusicPlayer.jsx';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Experience from './sections/Experience.jsx';
import Projects from './sections/Projects.jsx';
import Contact from './sections/Contact.jsx';
import Footer from './sections/Footer.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
// Lazy-loaded: globe.gl bundles three.js (~1.5 MB), so it only downloads
// when the visitor actually opens the #/globe page.
const GlobePage = lazy(() => import('./pages/GlobePage.jsx'));
// Lazy-loaded too — keeps the game engines out of the main bundle.
const ArcadePage = lazy(() => import('./pages/ArcadePage.jsx'));

// Hash routing: "#/globe", "#/arcade", "#/project/<id>" -> dedicated pages,
// anything else -> main page. Plain section anchors like "#about" still scroll
// in-page. "#/robotron" is kept as a legacy alias for the arcade.
function getRoute() {
  const h = window.location.hash;
  if (h.startsWith('#/globe')) return 'globe';
  // Arcade temporarily disabled — re-enable by uncommenting this line
  // (and the nav link in components/Navbar.jsx).
  // if (h.startsWith('#/arcade') || h.startsWith('#/robotron')) return 'arcade';
  if (h.startsWith('#/project/')) return 'project';
  return 'main';
}

function MainPage() {
  // When navigating back from the globe page with a section anchor
  // (e.g. "#projects"), scroll to it once the page mounts.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && !hash.startsWith('#/')) {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <>
      <FractalBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <>
      {/* Rendered once at the root so the draggable/minimizable player persists
          across every route — music keeps playing as you navigate. */}
      <MusicPlayer />
      {route === 'globe' ? (
        <Suspense
          fallback={
            <div className="globe-loading">
              <span>Loading…</span>
            </div>
          }
        >
          <GlobePage />
        </Suspense>
      ) : route === 'arcade' ? (
        <Suspense
          fallback={
            <div className="globe-loading">
              <span>Loading…</span>
            </div>
          }
        >
          <ArcadePage />
        </Suspense>
      ) : route === 'project' ? (
        <ProjectPage />
      ) : (
        <MainPage />
      )}
      <Analytics />
    </>
  );
}
