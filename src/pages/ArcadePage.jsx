import { useEffect, useRef, useState } from 'react';
import { RobotronGame, VW, VH } from '../game/robotron.js';
import { MuncherGame, W as MW, H as MH } from '../game/muncher.js';
import { GirderGame, W as GW, H as GH } from '../game/girder.js';
import { LanderGame, W as LW, H as LH } from '../game/lander.js';

// ============================================================
//  THE ARCADE — four original tribute cabinets, all built
//  from scratch on the HTML5 Canvas (no copyrighted assets).
//  Routes: #/arcade (menu) · #/arcade/<id> · #/robotron (legacy)
// ============================================================

const GAMES = [
  {
    id: 'roboraid',
    Engine: RobotronGame,
    w: VW,
    h: VH,
    title: 'ROBO-RAID 2084',
    year: 'TWIN-STICK TRIBUTE · 1982',
    desc: 'The robots have turned. Move with one hand, shoot with the other, and save the last human family from the uprising.',
    stat: 'WAVE',
    touch: 'twin',
    controls: [
      { keys: ['W', 'A', 'S', 'D'], label: 'MOVE' },
      { keys: ['←', '↑', '↓', '→'], label: 'SHOOT' },
      { keys: ['P'], label: 'PAUSE' },
    ],
    legend: [
      { color: '#00f0ff', label: 'YOU' },
      { color: '#ff3cf0', label: 'GRUNT · 100' },
      { color: '#ff5050', label: 'BRAIN · 500' },
      { color: '#2bd968', label: 'HULK · INVULNERABLE' },
      { color: '#ffd24a', label: 'HUMAN · RESCUE 1K–5K' },
    ],
    accent: '#ff3cf0',
  },
  {
    id: 'muncher',
    Engine: MuncherGame,
    w: MW,
    h: MH,
    title: 'MUNCH PROTOCOL',
    year: 'MAZE-CHASE TRIBUTE · 1980',
    desc: 'Clear the maze pellet by pellet while four ghosts hunt you — each with its own personality. Energizers turn the tables.',
    stat: 'LEVEL',
    touch: 'dpad',
    controls: [
      { keys: ['←', '↑', '↓', '→'], label: 'STEER (OR WASD)' },
      { keys: ['P'], label: 'PAUSE' },
    ],
    legend: [
      { color: '#ffd24a', label: 'YOU' },
      { color: '#ff4f5e', label: 'PURSUER' },
      { color: '#ff9fdc', label: 'AMBUSHER' },
      { color: '#00e8ff', label: 'FLANKER' },
      { color: '#ffb24a', label: 'WANDERER' },
      { color: '#1f2bd6', label: 'FRIGHTENED · 200-1600' },
    ],
    accent: '#ffd24a',
  },
  {
    id: 'girder',
    Engine: GirderGame,
    w: GW,
    h: GH,
    title: 'GIRDER GAUNTLET',
    year: 'BARREL-CLIMB TRIBUTE · 1981',
    desc: 'A giant ape hurls barrels down six sloped girders. Climb, jump, grab the hammer, and reach the captive before the bonus runs out.',
    stat: 'STAGE',
    touch: 'dpad-jump',
    controls: [
      { keys: ['A', 'D'], label: 'WALK' },
      { keys: ['W', 'S'], label: 'CLIMB' },
      { keys: ['SPACE'], label: 'JUMP' },
      { keys: ['P'], label: 'PAUSE' },
    ],
    legend: [
      { color: '#00f0ff', label: 'YOU' },
      { color: '#b86b2e', label: 'BARREL · JUMP 100' },
      { color: '#ff9f1c', label: 'FIREBALL' },
      { color: '#9fe0ff', label: 'HAMMER · SMASH 300' },
      { color: '#ff9fdc', label: 'RESCUE · +BONUS' },
    ],
    accent: '#ff5d73',
  },
  {
    id: 'lander',
    Engine: LanderGame,
    w: LW,
    h: LH,
    title: 'MARE DESCENT',
    year: 'GRAVITY-LANDER TRIBUTE · 1979',
    desc: 'Procedural lunar terrain, real thrust-and-gravity physics, and three beacon pads. Kill your velocity, stay upright, watch the fuel — narrow pads pay 5×.',
    stat: 'SORTIE',
    touch: 'dpad-jump',
    jumpLabel: 'THRUST',
    controls: [
      { keys: ['←', '→'], label: 'ROTATE' },
      { keys: ['↑', 'SPACE'], label: 'THRUST' },
      { keys: ['P'], label: 'PAUSE' },
    ],
    legend: [
      { color: '#e8f6ff', label: 'LANDER' },
      { color: '#7dffb0', label: 'PAD · ×2 / ×3 / ×5' },
      { color: '#00f0ff', label: 'FUEL = BONUS' },
      { color: '#ffb24a', label: 'WIND · SORTIE 3+' },
      { color: '#ff5050', label: 'OUT OF ENVELOPE' },
    ],
    accent: '#7dffb0',
  },
];

// ============================================================
//  Lorenz strange attractor — drifts behind the cabinet select.
//  Pure canvas: a handful of tracers integrate the classic
//  system (σ=10, ρ=28, β=8/3) and leave glowing trails in the
//  arcade palette. The view rotates slowly for a 3D feel.
//  Honors prefers-reduced-motion with a single static render.
// ============================================================
function LorenzBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d'); // alpha defaults to true → transparent
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const SIGMA = 10;
    const RHO = 28;
    const BETA = 8 / 3;
    const DT = 0.005;
    const PALETTE = ['#00f0ff', '#ff3cf0', '#ffd24a', '#7dffb0', '#ff5d73'];

    const tracers = PALETTE.map((color, i) => ({
      x: 0.1 + i * 0.03,
      y: 0,
      z: 18 + i * 0.7,
      color,
      px: null,
      py: null,
    }));

    let angle = 0;
    let w = 0;
    let h = 0;
    let scale = 1;
    let cx = 0;
    let cy = 0;

    // Model-space half-extents of the attractor, used to fit it to the canvas.
    // Horizontal: |x·cos − y·sin| peaks near ~28. Vertical: z spans ~[2, 48],
    // so it's centred on z ≈ 25 with a half-height of ~24.
    const HALF_W = 28;
    const HALF_H = 24;
    const Z_CENTER = 25;

    const resize = () => {
          // Canvas is absolutely positioned and fills the stage, so measure its
          // own rendered box.
          w = canvas.clientWidth * dpr;
          h = canvas.clientHeight * dpr;
          canvas.width = w;
          canvas.height = h;
          // Fit the attractor's bounding box to the canvas (the smaller axis
          // wins so nothing important clips); the radial mask fades the edges.
          scale = Math.min(w / 2 / HALF_W, h / 2 / HALF_H);
          cx = w / 2;   // truly centred — the x/y lobes are symmetric about 0
          cy = h / 2;
          tracers.forEach((p) => {
            p.px = null;
            p.py = null;
          });
          ctx.clearRect(0, 0, w, h);
        };

    const step = (p) => {
      const dx = SIGMA * (p.y - p.x);
      const dy = p.x * (RHO - p.z) - p.y;
      const dz = p.x * p.y - BETA * p.z;
      p.x += dx * DT;
      p.y += dy * DT;
      p.z += dz * DT;
    };

    const project = (p, cos, sin) => {
      const rx = p.x * cos - p.y * sin;
      return [cx + rx * scale, cy - (p.z - Z_CENTER) * scale];
    };

    const drawSegments = (substeps, cos, sin) => {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1.1 * dpr;
      for (const p of tracers) {
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        for (let s = 0; s < substeps; s++) {
          step(p);
          const [sx, sy] = project(p, cos, sin);
          if (p.px !== null) {
            ctx.moveTo(p.px, p.py);
            ctx.lineTo(sx, sy);
          }
          p.px = sx;
          p.py = sy;
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    resize();
    window.addEventListener('resize', resize);

    if (reduce) {
      drawSegments(4000, Math.cos(0.5), Math.sin(0.5));
      return () => window.removeEventListener('resize', resize);
    }

    let raf;
    const frame = () => {
      // Fade old trails toward TRANSPARENT by subtracting alpha — keeps the
      // page background visible instead of building up an opaque black box.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      angle += 0.0011;
      drawSegments(6, Math.cos(angle), Math.sin(angle));
      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="lorenz-bg" aria-hidden="true" />;
}

// On-screen touch stick (phones/tablets); reports a unit vector or null.
function TouchStick({ label, onVec }) {
  const ref = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef(false);

  const compute = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const t = e.touches?.[0] || e;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = t.clientX - cx;
    let dy = t.clientY - cy;
    const max = rect.width / 2;
    const m = Math.hypot(dx, dy);
    if (m > max) {
      dx = (dx / m) * max;
      dy = (dy / m) * max;
    }
    setKnob({ x: dx, y: dy });
    const um = Math.hypot(dx, dy);
    onVec(um > max * 0.18 ? { x: dx / max, y: dy / max } : null);
  };

  const end = () => {
    active.current = false;
    setKnob({ x: 0, y: 0 });
    onVec(null);
  };

  return (
    <div
      ref={ref}
      className="touch-stick"
      onTouchStart={(e) => {
        active.current = true;
        compute(e);
      }}
      onTouchMove={(e) => active.current && compute(e)}
      onTouchEnd={end}
      onTouchCancel={end}
    >
      <span className="touch-stick-label">{label}</span>
      <span
        className="touch-stick-knob"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}

function GameShell({ meta }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [state, setState] = useState({
    status: 'ready',
    score: 0,
    lives: 3,
    wave: 0,
    highScore: 0,
  });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
    const game = new meta.Engine(canvasRef.current, { onState: setState });
    gameRef.current = game;
    game.start();
    return () => game.destroy();
  }, [meta]);

  const g = gameRef.current;
  const { status, score, lives, wave, highScore } = state;

  return (
    <div className="robotron-stage">
      <div className="robotron-scoreboard">
        <div className="score-block">
          <span className="score-label">SCORE</span>
          <span className="score-value">{score.toLocaleString()}</span>
        </div>
        <div className="score-block">
          <span className="score-label">{meta.stat}</span>
          <span className="score-value amber">{wave || '—'}</span>
        </div>
        <div className="score-block">
          <span className="score-label">LIVES</span>
          <span className="score-value">{'▲ '.repeat(Math.max(0, lives)).trim() || '—'}</span>
        </div>
        <div className="score-block">
          <span className="score-label">HI-SCORE</span>
          <span className="score-value dim">{highScore.toLocaleString()}</span>
        </div>
      </div>

      <div
        className="robotron-canvas-wrap hud-frame"
        style={{ aspectRatio: `${meta.w} / ${meta.h}`, maxWidth: meta.w }}
      >
        <canvas ref={canvasRef} className="robotron-canvas" />

        {status === 'ready' && (
          <div className="game-overlay">
            <h2 className="glitch" data-text={meta.title}>{meta.title}</h2>
            <p className="overlay-sub">{meta.year}</p>
            <div className="control-legend">
              {meta.controls.map((c) => (
                <div key={c.label}>
                  {c.keys.map((k) => (
                    <kbd key={k}>{k}</kbd>
                  ))}
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => g?.beginRun()}>
              INSERT COIN ► START
            </button>
            <p className="overlay-hint">Press ENTER to start</p>
          </div>
        )}

        {status === 'paused' && (
          <div className="game-overlay">
            <h2>PAUSED</h2>
            <button className="btn btn-primary" onClick={() => g?.togglePause()}>
              RESUME ►
            </button>
            <p className="overlay-hint">Press P to resume</p>
          </div>
        )}

        {status === 'gameover' && (
          <div className="game-overlay">
            <h2 className="glitch gameover-title" data-text="GAME OVER">GAME OVER</h2>
            <p className="overlay-sub">
              FINAL SCORE <strong>{score.toLocaleString()}</strong>
            </p>
            {score >= highScore && score > 0 && (
              <p className="new-hi">✦ NEW HIGH SCORE ✦</p>
            )}
            <button className="btn btn-primary" onClick={() => g?.beginRun()}>
              RETRY ►
            </button>
            <p className="overlay-hint">Press ENTER to retry</p>
          </div>
        )}
      </div>

      <div className="robotron-legend-bar">
        {meta.legend.map((l) => (
          <span key={l.label}>
            <i
              className="dot"
              style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }}
            />{' '}
            {l.label}
          </span>
        ))}
      </div>

      {isTouch && status !== 'gameover' && (
        <div className="touch-controls">
          {meta.touch === 'twin' && (
            <>
              <TouchStick label="MOVE" onVec={(v) => gameRef.current?.setTouch('move', v)} />
              <TouchStick label="SHOOT" onVec={(v) => gameRef.current?.setTouch('aim', v)} />
            </>
          )}
          {meta.touch === 'dpad' && (
            <TouchStick label="STEER" onVec={(v) => gameRef.current?.setTouch('move', v)} />
          )}
          {meta.touch === 'dpad-jump' && (
            <>
              <TouchStick label="MOVE" onVec={(v) => gameRef.current?.setTouch('move', v)} />
              <button
                className="jump-btn"
                onTouchStart={() => gameRef.current?.setTouch('jump', true)}
                onTouchEnd={() => gameRef.current?.setTouch('jump', false)}
              >
                {meta.jumpLabel || 'JUMP'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function parseHash() {
  const h = window.location.hash;
  if (h.startsWith('#/robotron')) return 'roboraid'; // legacy deep link
  const m = h.match(/^#\/arcade\/(\w+)/);
  return m ? m[1] : null;
}

export default function ArcadePage() {
  const [sel, setSel] = useState(parseHash);

  useEffect(() => {
    const onHash = () => setSel(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const meta = GAMES.find((gm) => gm.id === sel) || null;

  return (
    <div className="robotron-page">
      <header className="robotron-header">
        {meta ? (
          <a
            href="#/arcade"
            className="btn btn-ghost robotron-back"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#/arcade';
            }}
          >
            ◄ ALL CABINETS
          </a>
        ) : (
          <a href="#hero" className="btn btn-ghost robotron-back">
            ◄ RETURN TO BASE
          </a>
        )}
        <div className="robotron-title">
          <h1>{meta ? meta.title : 'THE ARCADE'}</h1>
          <p>
            {meta
              ? `// ${meta.year}`
              : '// FOUR ORIGINAL TRIBUTE CABINETS — ALL CODE & PIXELS FROM SCRATCH'}
          </p>
        </div>
      </header>

      {meta ? (
        <GameShell key={meta.id} meta={meta} />
      ) : (
        <div className="arcade-stage">
          <LorenzBackground />
          <div className="arcade-menu arcade-menu--grid">
            {GAMES.map((gm) => (
              <button
                key={gm.id}
                className="cabinet-card hud-frame"
                style={{ '--cab-accent': gm.accent }}
                onClick={() => {
                  window.location.hash = `#/arcade/${gm.id}`;
                }}
              >
                <div className="cabinet-marquee">{gm.title}</div>
                <div className="cabinet-year">{gm.year}</div>
                <p className="cabinet-desc">{gm.desc}</p>
                <div className="cabinet-legend">
                  {gm.legend.slice(0, 4).map((l) => (
                    <i
                      key={l.label}
                      className="dot"
                      title={l.label}
                      style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }}
                    />
                  ))}
                </div>
                <span className="cabinet-coin">INSERT COIN ►</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
