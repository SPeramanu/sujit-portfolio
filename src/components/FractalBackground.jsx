import { useEffect, useRef } from 'react';

// Subtle generative fractal behind the main-page content: a radially-symmetric
// branching "canopy" that grows OUTWARD from the centre of the screen. Rendered
// at low opacity in the warm palette, drawn with a one-shot grow animation then
// left static. Honors prefers-reduced-motion (final state, no animation).
export default function FractalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let start = 0;

    const STROKE = '46, 32, 18'; // warm espresso, applied at low alpha
    const GROW_MS = 4200;
    const ARMS = 6; // six-fold radial symmetry
    const DEPTH = 9;
    const DECAY = 0.72;
    const SPREAD = 0.52; // branch half-angle
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    let baseLen = 0;
    let maxReach = 0;

    // One branch. `dist` is the path length from the centre to this branch's
    // start; `reach` is how far the growth front has travelled. A branch only
    // draws (and only spawns children) once the front has reached it, and its
    // segment is clipped to the front so the whole figure unfurls outward.
    const branch = (x, y, angle, len, depth, dist, reach, rnd) => {
      if (depth === 0 || len < 2 || dist >= reach) return;
      const grown = Math.min(len, reach - dist);
      const ex = x + Math.cos(angle) * grown;
      const ey = y + Math.sin(angle) * grown;
      ctx.lineWidth = Math.max(0.4, depth * 0.5) * dpr;
      ctx.strokeStyle = `rgba(${STROKE}, ${0.02 + depth * 0.006})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      if (grown < len) return; // tip still extending — wait to branch
      rnd = (rnd * 9301 + 49297) % 233280;
      const wob = (rnd / 233280 - 0.5) * 0.22;
      const next = len * DECAY;
      branch(ex, ey, angle - SPREAD + wob, next, depth - 1, dist + len, reach, rnd + 1);
      branch(ex, ey, angle + SPREAD + wob, next, depth - 1, dist + len, reach, rnd + 3);
      // a faint central shoot keeps the arms feeling full
      branch(ex, ey, angle + wob * 0.5, next * 0.78, depth - 1, dist + len, reach, rnd + 7);
    };

    const render = (grow) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const reach = maxReach * grow;
      // two interleaved rings (offset half a step) for a richer 12-fold motif
      for (let layer = 0; layer < 2; layer++) {
        const offset = layer * (Math.PI / ARMS);
        for (let i = 0; i < ARMS; i++) {
          const a = offset + (i * 2 * Math.PI) / ARMS;
          branch(cx, cy, a, baseLen * (layer ? 0.82 : 1), DEPTH, 0, reach, i * 17 + layer * 101 + 5);
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.round(rect.width * dpr);
      h = Math.round(rect.height * dpr);
      canvas.width = w;
      canvas.height = h;
      baseLen = Math.min(w, h) * 0.17;
      maxReach = (baseLen * (1 - Math.pow(DECAY, DEPTH))) / (1 - DECAY);
      if (reduce) render(1);
      else if (start) render(easeOut(Math.min(1, (performance.now() - start) / GROW_MS)));
    };

    resize();
    window.addEventListener('resize', resize);

    if (!reduce) {
      const frame = (now) => {
        if (!start) start = now;
        const t = Math.min(1, (now - start) / GROW_MS);
        render(easeOut(t));
        if (t < 1) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fractal-bg" aria-hidden="true" />;
}
