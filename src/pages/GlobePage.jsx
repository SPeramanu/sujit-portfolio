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

export default function GlobePage() {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const globe = Globe()(el)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#00f0ff')
      .atmosphereAltitude(0.18)
      .width(el.clientWidth)
      .height(el.clientHeight)
      // location pins
      .pointsData(travels)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(() => '#ff9f1c')
      .pointAltitude(0.015)
      .pointRadius(0.45)
      .onPointClick((t) => {
        setSelected(t);
        setActiveImg(0);
        globe.pointOfView({ lat: t.lat, lng: t.lng, altitude: 1.6 }, 900);
      })
      // sonar rings under each pin
      .ringsData(travels)
      .ringLat('lat')
      .ringLng('lng')
      .ringColor(() => (t) => `rgba(0, 240, 255, ${1 - t})`)
      .ringMaxRadius(3.2)
      .ringPropagationSpeed(1.4)
      .ringRepeatPeriod(1400)
      // floating labels
      .labelsData(travels)
      .labelLat('lat')
      .labelLng('lng')
      .labelText('name')
      .labelSize(1.1)
      .labelDotRadius(0)
      .labelColor(() => '#00f0ff')
      .labelAltitude(0.03)
      // journey arcs
      .arcsData(arcs)
      .arcColor(() => ['#00f0ff', '#ff9f1c'])
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

  // pause auto-rotation while a location panel is open
  useEffect(() => {
    const globe = globeRef.current;
    if (globe) globe.controls().autoRotate = !selected;
  }, [selected]);

  return (
    <div className="globe-page">
      <header className="globe-header">
        <a href="#hero" className="btn btn-ghost globe-back">
          ◄ RETURN TO BASE
        </a>
        <div className="globe-title">
          <h1>TRAVERSAL LOG</h1>
          <p>// {travels.length} WAYPOINTS LOGGED — DRAG TO ROTATE, CLICK A PIN</p>
        </div>
      </header>

      <div className="globe-canvas" ref={containerRef} />

      <aside className={`globe-panel hud-frame ${selected ? 'open' : ''}`}>
        {selected && (
          <>
            <div className="modal-titlebar">
              <span className="modal-file">
                WAYPOINT://{selected.id.toUpperCase()}
              </span>
              <button
                className="modal-close"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                [ X ]
              </button>
            </div>
            <h2>{selected.name}</h2>
            <div className="globe-panel-meta">
              <span>{selected.country}</span>
              <span>{selected.date}</span>
              <span>
                {selected.lat.toFixed(2)}°, {selected.lng.toFixed(2)}°
              </span>
            </div>
            <p className="globe-panel-blurb">{selected.blurb}</p>
            {selected.images?.length > 0 && (
              <div className="globe-panel-gallery">
                <img
                  src={selected.images[activeImg]}
                  alt={`${selected.name} — photo ${activeImg + 1}`}
                />
                {selected.images.length > 1 && (
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
                )}
              </div>
            )}
          </>
        )}
      </aside>

      <footer className="globe-footer" aria-hidden="true">
        ORBITAL VIEW // SP-OS v4.1
      </footer>
    </div>
  );
}
