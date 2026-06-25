import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { travels } from '../data/travels.js';

// Journey arcs connect locations in array order.
const arcs = travels.slice(0, -1).map((t, i) => ({
  startLat: t.lat,
  startLng: t.lng,
  endLat: travels[i + 1].lat,
  endLng: travels[i + 1].lng,
}));

const DOT = '#b9542d';
const DOT_HOT = '#e6a06a';

export default function GlobePage() {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const hoverIdRef = useRef(null);
  const selectedIdRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const refreshPoints = () => globe.pointsData(travels.slice());

    const globe = Globe()(el)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-day.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#e6c9a8')
      .atmosphereAltitude(0.18)
      .width(el.clientWidth)
      .height(el.clientHeight)
      // location pins — bigger + with a generous clickable radius
      .pointsData(travels)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor((d) =>
        d.id === hoverIdRef.current || d.id === selectedIdRef.current ? DOT_HOT : DOT
      )
      .pointAltitude((d) => (d.id === hoverIdRef.current ? 0.05 : 0.02))
      .pointRadius((d) =>
        d.id === hoverIdRef.current || d.id === selectedIdRef.current ? 1.1 : 0.72
      )
      .onPointClick((t) => flyTo(t))
      .onPointHover((pt) => {
        hoverIdRef.current = pt ? pt.id : null;
        el.style.cursor = pt ? 'pointer' : 'grab';
        refreshPoints();
      })
      // sonar rings under each pin
      .ringsData(travels)
      .ringLat('lat')
      .ringLng('lng')
      .ringColor(() => (t) => `rgba(185, 84, 45, ${1 - t})`)
      .ringMaxRadius(3.2)
      .ringPropagationSpeed(1.4)
      .ringRepeatPeriod(1400)
      // journey arcs
      .arcsData(arcs)
      .arcColor(() => ['#b9542d', '#e6c9a8'])
      .arcAltitude(0.22)
      .arcStroke(0.55)
      .arcDashLength(0.45)
      .arcDashGap(0.6)
      .arcDashAnimateTime(2400);

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.55;
    globe.controls().enableDamping = true;
    globe.pointOfView({ lat: 45, lng: -60, altitude: 2.3 }, 0);

    globeRef.current = globe;

    const onResize = () => {
      globe.width(el.clientWidth).height(el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      globe._destructor?.();
      el.replaceChildren();
    };
  }, []);

  // pause auto-rotation while a location panel is open + keep the highlighted
  // pin in sync with the selection
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    selectedIdRef.current = selected?.id ?? null;
    globe.controls().autoRotate = !selected;
    globe.pointsData(travels.slice());
  }, [selected]);

  function flyTo(t) {
    setSelected(t);
    setActiveImg(0);
    globeRef.current?.pointOfView({ lat: t.lat, lng: t.lng, altitude: 1.6 }, 900);
  }

  const setHover = (id) => {
    hoverIdRef.current = id;
    globeRef.current?.pointsData(travels.slice());
  };

  return (
    <div className={`globe-page ${selected ? 'has-selection' : ''}`}>
      <header className="globe-header">
        <a href="#hero" className="btn btn-ghost globe-back">
          ← Back
        </a>
        <div className="globe-title">
          <h1>Places</h1>
          <p>Where work and travel has taken me. Drag to rotate the globe.</p>
        </div>
      </header>

      <aside className="globe-sidebar">
        <div className="globe-sidebar-title">Locations</div>
        <ul>
          {travels.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={`globe-loc ${selected?.id === t.id ? 'active' : ''}`}
                onClick={() => flyTo(t)}
                onMouseEnter={() => setHover(t.id)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="globe-loc-name">{t.name}</span>
                <span className="globe-loc-country">{t.country}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="globe-canvas" ref={containerRef} />

      <aside className={`globe-panel hud-frame ${selected ? 'open' : ''}`}>
        {selected && (
          <>
            <div className="modal-titlebar">
              <span className="modal-file">{selected.country}</span>
              <button
                className="modal-close"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <h2>{selected.name}</h2>
            <div className="globe-panel-meta">
              <span>{selected.date}</span>
              <span>
                {selected.lat.toFixed(2)}°, {selected.lng.toFixed(2)}°
              </span>
            </div>
            <p className="globe-panel-blurb">{selected.blurb}</p>
            {selected.images?.length > 0 && (
              <div className="globe-panel-gallery">
                <div className="globe-slideshow">
                  {selected.images.length > 1 && (
                    <button
                      className="globe-slide-btn globe-slide-prev"
                      onClick={() => setActiveImg((activeImg - 1 + selected.images.length) % selected.images.length)}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                  )}
                  <img
                    src={selected.images[activeImg]}
                    alt={`${selected.name} — photo ${activeImg + 1}`}
                    onClick={() => setLightbox(true)}
                    style={{ cursor: 'zoom-in' }}
                  />
                  {selected.images.length > 1 && (
                    <button
                      className="globe-slide-btn globe-slide-next"
                      onClick={() => setActiveImg((activeImg + 1) % selected.images.length)}
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  )}
                </div>
                {selected.images.length > 1 && (
                  <>
                    <div className="globe-slide-dots">
                      {selected.images.map((_, i) => (
                        <button
                          key={i}
                          className={`globe-dot ${i === activeImg ? 'active' : ''}`}
                          onClick={() => setActiveImg(i)}
                          aria-label={`Photo ${i + 1}`}
                        />
                      ))}
                    </div>
                    <div className="modal-thumbs">
                      {selected.images.map((src, i) => (
                        <button
                          key={src}
                          className={i === activeImg ? 'active' : ''}
                          onClick={() => setActiveImg(i)}
                        >
                          <img src={src} alt="" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </aside>

      {lightbox && selected && selected.images?.length > 0 && (
        <div
          className="globe-lightbox"
          onClick={() => setLightbox(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setLightbox(false);
            if (e.key === 'ArrowRight') setActiveImg((activeImg + 1) % selected.images.length);
            if (e.key === 'ArrowLeft') setActiveImg((activeImg - 1 + selected.images.length) % selected.images.length);
          }}
          tabIndex={0}
          ref={(el) => el?.focus()}
        >
          {selected.images.length > 1 && (
            <button
              className="globe-lb-btn globe-lb-prev"
              onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg - 1 + selected.images.length) % selected.images.length); }}
              aria-label="Previous"
            >
              ‹
            </button>
          )}
          <img
            src={selected.images[activeImg]}
            alt={`${selected.name} — photo ${activeImg + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          {selected.images.length > 1 && (
            <button
              className="globe-lb-btn globe-lb-next"
              onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg + 1) % selected.images.length); }}
              aria-label="Next"
            >
              ›
            </button>
          )}
          <button
            className="globe-lb-close"
            onClick={() => setLightbox(false)}
            aria-label="Close"
          >
            ✕
          </button>
          {selected.images.length > 1 && (
            <div className="globe-lb-counter">
              {activeImg + 1} / {selected.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
