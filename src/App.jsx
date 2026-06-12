import { lazy, Suspense, useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import TargetingCursor from './components/TargetingCursor.jsx';
import BootOverlay from './components/BootOverlay.jsx';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Experience from './sections/Experience.jsx';
import Projects from './sections/Projects.jsx';
import Photography from './sections/Photography.jsx';
import Contact from './sections/Contact.jsx';
import Footer from './sections/Footer.jsx';
// Lazy-loaded: globe.gl bundles three.js (~1.5 MB), so it only downloads
// when the visitor actually opens the #/globe page.
const GlobePage = lazy(() => import('./pages/GlobePage.jsx'));
// Lazy-loaded too — keeps the game engine out of the main bundle.
const RobotronPage = lazy(() => import('./pages/RobotronPage.jsx'));

// Hash routing: "#/globe" and "#/robotron" -> dedicated pages, anything
// else -> main page. Plain section anchors like "#about" still scroll in-page.
function getRoute() {
  const h = window.location.hash;
  if (h.startsWith('#/globe')) return 'globe';
  if (h.startsWith('#/robotron')) return 'robotron';
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
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Photography />
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
      <BootOverlay />
      <TargetingCursor />
      <div className="scanlines" aria-hidden="true" />
      {route === 'globe' ? (
        <Suspense
          fallback={
            <div className="globe-loading">
              <span>LOADING ORBITAL VIEW...</span>
            </div>
          }
        >
          <GlobePage />
        </Suspense>
      ) : route === 'robotron' ? (
        <Suspense
          fallback={
            <div className="globe-loading">
              <span>BOOTING ARCADE CABINET...</span>
            </div>
          }
        >
          <RobotronPage />
        </Suspense>
      ) : (
        <MainPage />
      )}
    </>
  );
}
