import { useEffect, useRef, useState } from 'react';
import { RobotronGame, VW, VH } from '../game/robotron.js';
import { MuncherGame, W as MW, H as MH } from '../game/muncher.js';
import { GirderGame, W as GW, H as GH } from '../game/girder.js';

// ============================================================
//  THE ARCADE — three original tribute cabinets, all built
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
];

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
                JUMP
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
              : '// THREE ORIGINAL TRIBUTE CABINETS — ALL CODE & PIXELS FROM SCRATCH'}
          </p>
        </div>
      </header>

      {meta ? (
        <GameShell key={meta.id} meta={meta} />
      ) : (
        <div className="arcade-menu">
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
      )}
    </div>
  );
}
