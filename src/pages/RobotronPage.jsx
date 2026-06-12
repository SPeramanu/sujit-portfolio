import { useEffect, useRef, useState } from 'react';
import { RobotronGame } from '../game/robotron.js';

// On-screen dual touch-stick for phones/tablets. Reports a unit vector
// (or null) to the engine via game.setTouch(kind, vec).
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

export default function RobotronPage() {
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
    const game = new RobotronGame(canvasRef.current, { onState: setState });
    gameRef.current = game;
    game.start();
    return () => game.destroy();
  }, []);

  const g = gameRef.current;
  const { status, score, lives, wave, highScore } = state;

  return (
    <div className="robotron-page">
      <header className="robotron-header">
        <a href="#hero" className="btn btn-ghost robotron-back">
          ◄ RETURN TO BASE
        </a>
        <div className="robotron-title">
          <h1>ROBO-RAID 2084</h1>
          <p>// AN ARCADE TRIBUTE — ANOTHER SIDE OF THE OPERATOR</p>
        </div>
      </header>

      <div className="robotron-stage">
        <div className="robotron-scoreboard">
          <div className="score-block">
            <span className="score-label">SCORE</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
          <div className="score-block">
            <span className="score-label">WAVE</span>
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

        <div className="robotron-canvas-wrap hud-frame">
          <canvas ref={canvasRef} className="robotron-canvas" />

          {status === 'ready' && (
            <div className="game-overlay">
              <h2 className="glitch" data-text="ROBO-RAID 2084">ROBO-RAID 2084</h2>
              <p className="overlay-sub">SAVE THE HUMANS · SURVIVE THE WAVES</p>
              <div className="control-legend">
                <div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>MOVE</span></div>
                <div><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd><span>SHOOT</span></div>
                <div><kbd>P</kbd><span>PAUSE</span></div>
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
          <span><i className="dot cyan" /> YOU</span>
          <span><i className="dot magenta" /> GRUNT · 100</span>
          <span><i className="dot red" /> BRAIN · 500</span>
          <span><i className="dot green" /> HULK · INVULNERABLE</span>
          <span><i className="dot cyanline" /> ELECTRODE · 25</span>
          <span><i className="dot amber" /> HUMAN · RESCUE 1K–5K</span>
        </div>

        {isTouch && (status === 'playing' || status === 'ready') && (
          <div className="touch-controls">
            <TouchStick label="MOVE" onVec={(v) => g?.setTouch('move', v)} />
            <TouchStick label="SHOOT" onVec={(v) => g?.setTouch('aim', v)} />
          </div>
        )}
      </div>
    </div>
  );
}
