import { useEffect, useRef, useState } from 'react';

// Targeting-reticle cursor: corner brackets + crosshair dot that lerp toward
// the pointer. Locks (expands, turns amber, shows label) over interactive
// elements. Only rendered on fine-pointer devices.
export default function TargetingCursor() {
  const reticleRef = useRef(null);
  const dotRef = useRef(null);
  const coordsRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!fine.matches) return;
    setEnabled(true);
    document.documentElement.classList.add('custom-cursor');

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const target = { x: pos.x, y: pos.y };
    let raf = 0;
    let locked = false;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const t = e.target;
      const interactive = t.closest?.(
        'a, button, input, textarea, select, label, [data-interactive]'
      );
      if (!!interactive !== locked) {
        locked = !!interactive;
        reticleRef.current?.classList.toggle('locked', locked);
      }
    };

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.22;
      pos.y += (target.y - pos.y) * 0.22;
      if (reticleRef.current) {
        reticleRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.x}px, ${target.y}px)`;
      }
      if (coordsRef.current) {
        coordsRef.current.textContent = `X:${String(Math.round(target.x)).padStart(4, '0')} Y:${String(Math.round(target.y)).padStart(4, '0')}`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('custom-cursor');
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={reticleRef} className="cursor-reticle" aria-hidden="true">
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <span className="lock-label">LOCK</span>
        <span ref={coordsRef} className="cursor-coords" />
      </div>
    </>
  );
}
