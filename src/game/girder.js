// ============================================================
//  GIRDER GAUNTLET — a barrel-climb platform arcade tribute
//  (1981 style). All original code, art, and level geometry.
//
//  Mechanics modelled on the classic formula: a giant ape hurls
//  barrels down six sloped girders; you climb ladders, jump
//  barrels (100), grab hammers to smash them (300), dodge the
//  fireballs from the oil drum, and reach the captive at the top
//  before the bonus timer runs out.
//
//  Controls:  A/D or arrows / walk     W/S or arrows / climb
//             SPACE / jump             P / pause     Enter / start
// ============================================================

export const W = 760;
export const H = 700;

const GX0 = 40;
const GX1 = 720;
const GRAV = 1000;

// Girders bottom (0) to top (5); 6 is the rescue platform.
// Slopes alternate so barrels zig-zag down the screen.
const GIRDERS = [
  { x1: 40, y1: 640, x2: 720, y2: 612 }, // 0: downhill left -> oil drum
  { x1: 40, y1: 510, x2: 720, y2: 538 }, // 1: downhill right
  { x1: 40, y1: 448, x2: 720, y2: 420 }, // 2: downhill left
  { x1: 40, y1: 330, x2: 720, y2: 358 }, // 3: downhill right
  { x1: 40, y1: 268, x2: 720, y2: 240 }, // 4: downhill left
  { x1: 40, y1: 150, x2: 720, y2: 178 }, // 5: downhill right (ape lives here)
  { x1: 280, y1: 96, x2: 440, y2: 96 }, // 6: rescue platform
];

const LADDERS = [
  { x: 660, lo: 0, hi: 1 },
  { x: 320, lo: 0, hi: 1 },
  { x: 120, lo: 1, hi: 2 },
  { x: 520, lo: 1, hi: 2 },
  { x: 660, lo: 2, hi: 3 },
  { x: 260, lo: 2, hi: 3 },
  { x: 120, lo: 3, hi: 4 },
  { x: 560, lo: 3, hi: 4 },
  { x: 660, lo: 4, hi: 5 },
  { x: 200, lo: 4, hi: 5 },
  { x: 360, lo: 5, hi: 6 }, // up to the captive
];

const HAMMERS = [
  { girder: 2, x: 200 },
  { girder: 4, x: 480 },
];

const APE_X = 100;
const CAPTIVE_X = 360;
const DRUM_X = 60;

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

function girderY(i, x) {
  const g = GIRDERS[i];
  const t = clamp((x - g.x1) / (g.x2 - g.x1), 0, 1);
  return g.y1 + (g.y2 - g.y1) * t;
}
// barrels roll toward the lower end
const downhill = (i) => (GIRDERS[i].y2 > GIRDERS[i].y1 ? 1 : -1);

export class GirderGame {
  constructor(canvas, { onState } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onState = onState || (() => {});
    canvas.width = W;
    canvas.height = H;

    this.keys = new Set();
    this.touch = { move: null, jump: false };
    this._touchJumpLatch = false;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._loop = this._loop.bind(this);

    this.highScore = Number(localStorage.getItem('arcade-hi-girder') || 0);
    this._resetGame();
    this.status = 'ready';
    this._raf = 0;
    this._last = 0;
    this.time = 0;
    this._emit();
  }

  start() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
    this._last = performance.now();
    this._raf = requestAnimationFrame(this._loop);
  }

  destroy() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
  }

  beginRun() {
    this._resetGame();
    this.status = 'playing';
    this._emit();
  }

  togglePause() {
    if (this.status === 'playing') this.status = 'paused';
    else if (this.status === 'paused') {
      this.status = 'playing';
      this._last = performance.now();
    }
    this._emit();
  }

  setTouch(kind, val) {
    this.touch[kind] = val;
  }

  // ---- setup -----------------------------------------------------
  _resetGame() {
    this.score = 0;
    this.lives = 3;
    this.stage = 0;
    this.extraAwarded = false;
    this._spawnStage(1);
  }

  _spawnStage(n) {
    this.stage = n;
    this.barrels = [];
    this.fireballs = [];
    this.particles = [];
    this.floaters = [];
    this.hammers = HAMMERS.map((h) => ({ ...h, used: false }));
    this.player = this._makePlayer();
    this.bonus = 5000;
    this._bonusT = 0;
    this._barrelT = 1.6; // first barrel comes quick
    this._barrelCount = 0;
    this._apeThrow = 0;
    this.bannerT = 2.2;
    this.banner = `STAGE ${n}`;
    this.clearT = 0;
    this.deathT = 0;
    this._emit();
  }

  _makePlayer() {
    return {
      x: 130,
      girder: 0,
      y: girderY(0, 130),
      vy: 0,
      grounded: true,
      ladder: null,
      climbDir: 0,
      face: 1,
      walking: false,
      hammer: 0,
      swing: 0,
      anim: 0,
    };
  }

  _emit() {
    this.onState({
      status: this.status,
      score: this.score,
      lives: this.lives,
      wave: this.stage,
      highScore: this.highScore,
    });
  }

  // ---- input -----------------------------------------------------
  _onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd', 'p'].includes(k)) {
      e.preventDefault();
    }
    if (k === 'p' && (this.status === 'playing' || this.status === 'paused')) {
      this.togglePause();
      return;
    }
    if (k === 'enter' && (this.status === 'ready' || this.status === 'gameover')) {
      this.beginRun();
      return;
    }
    this.keys.add(k);
  }

  _onKeyUp(e) {
    this.keys.delete(e.key.toLowerCase());
  }

  _onBlur() {
    this.keys.clear();
    if (this.status === 'playing') this.togglePause();
  }

  _axisX() {
    let x = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.touch.move && Math.abs(this.touch.move.x) > 0.35) x += Math.sign(this.touch.move.x);
    return clamp(x, -1, 1);
  }

  _axisY() {
    let y = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (this.touch.move && Math.abs(this.touch.move.y) > 0.45) y += Math.sign(this.touch.move.y);
    return clamp(y, -1, 1);
  }

  _jumpPressed() {
    const key = this.keys.has(' ');
    const touch = this.touch.jump;
    const pressed = key || touch;
    const edge = pressed && !this._touchJumpLatch;
    this._touchJumpLatch = pressed;
    return edge;
  }

  // ---- loop ------------------------------------------------------
  _loop(now) {
    this._raf = requestAnimationFrame(this._loop);
    let dt = (now - this._last) / 1000;
    this._last = now;
    if (dt > 0.05) dt = 0.05;
    this.time += dt;

    if (this.status === 'playing' || this.status === 'dying') this._update(dt);
    this._render();
  }

  _update(dt) {
    this._updateParticles(dt);
    this._updateFloaters(dt);
    if (this.bannerT > 0) this.bannerT -= dt;

    if (this.status === 'dying') {
      this.deathT -= dt;
      if (this.deathT <= 0) {
        if (this.lives <= 0) {
          this.status = 'gameover';
          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('arcade-hi-girder', String(this.score));
          }
        } else {
          // clear hazards, respawn at the bottom
          this.barrels = [];
          this.fireballs = [];
          this.player = this._makePlayer();
          this._barrelT = 1.6;
          this.status = 'playing';
        }
        this._emit();
      }
      return;
    }

    if (this.clearT > 0) {
      this.clearT -= dt;
      if (this.clearT <= 0) this._spawnStage(this.stage + 1);
      return;
    }

    // bonus countdown
    this._bonusT += dt;
    if (this._bonusT >= 1.7) {
      this._bonusT -= 1.7;
      this.bonus = Math.max(0, this.bonus - 100);
    }

    this._updatePlayer(dt);
    this._updateBarrels(dt);
    this._updateFireballs(dt);
    this._checkHazards();
  }

  // ---- player ----------------------------------------------------
  _updatePlayer(dt) {
    const p = this.player;
    const ax = this._axisX();
    const ay = this._axisY();
    p.anim += dt * (p.walking ? 10 : 2);

    if (p.hammer > 0) {
      p.hammer -= dt;
      p.swing += dt;
    }

    if (p.ladder) {
      // climbing: vertical only
      const l = p.ladder;
      p.walking = ay !== 0;
      p.y += ay * 95 * dt;
      const yTop = girderY(l.hi, l.x);
      const yBot = girderY(l.lo, l.x);
      if (p.y <= yTop) {
        p.y = yTop;
        p.girder = l.hi;
        p.ladder = null;
        p.grounded = true;
      } else if (p.y >= yBot) {
        p.y = yBot;
        p.girder = l.lo;
        p.ladder = null;
        p.grounded = true;
      }
    } else if (p.grounded) {
      p.walking = ax !== 0;
      if (ax !== 0) p.face = ax;
      p.x += ax * 115 * dt;
      const g = GIRDERS[p.girder];
      p.x = clamp(p.x, g.x1 + 8, g.x2 - 8);
      p.y = girderY(p.girder, p.x);

      // grab a ladder (not while holding the hammer — too heavy)
      if (p.hammer <= 0 && ay !== 0) {
        for (const l of LADDERS) {
          if (Math.abs(p.x - l.x) < 12) {
            if (ay < 0 && l.lo === p.girder) {
              p.ladder = l;
              p.x = l.x;
              p.grounded = false;
              break;
            }
            if (ay > 0 && l.hi === p.girder) {
              p.ladder = l;
              p.x = l.x;
              p.y = girderY(l.hi, l.x);
              p.grounded = false;
              break;
            }
          }
        }
      }

      // jump
      if (p.grounded && p.hammer <= 0 && this._jumpPressed()) {
        p.grounded = false;
        p.vy = -330;
      }

      // hammer pickup
      for (const h of this.hammers) {
        if (!h.used && h.girder === p.girder && Math.abs(p.x - h.x) < 16) {
          h.used = true;
          p.hammer = 7;
          p.swing = 0;
        }
      }
    } else {
      // airborne
      this._jumpPressed(); // keep edge-latch in sync
      p.x += ax * 115 * dt;
      const g = GIRDERS[p.girder];
      p.x = clamp(p.x, g.x1 + 8, g.x2 - 8);
      p.y += p.vy * dt;
      p.vy += GRAV * dt;
      const floor = girderY(p.girder, p.x);
      if (p.vy > 0 && p.y >= floor) {
        p.y = floor;
        p.vy = 0;
        p.grounded = true;
      }
    }

    // reached the rescue platform!
    if (p.grounded && p.girder === 6 && this.clearT <= 0) {
      this._stageClear();
    }
  }

  _stageClear() {
    this._addScore(this.bonus, this.player.x, this.player.y - 40, true);
    this.clearT = 2.6;
    this.banner = 'RESCUED!';
    this.bannerT = 2.6;
  }

  _hammerHead() {
    const p = this.player;
    // swing alternates above the head and out in front
    const up = Math.floor(p.swing / 0.18) % 2 === 0;
    return up
      ? { x: p.x + p.face * 4, y: p.y - 38 }
      : { x: p.x + p.face * 20, y: p.y - 12 };
  }

  // ---- barrels -----------------------------------------------------
  _updateBarrels(dt) {
    // ape throws
    this._barrelT -= dt;
    if (this._barrelT <= 0) {
      this._barrelT = Math.max(3.4 - this.stage * 0.25, 1.5) * rand(0.8, 1.2);
      this._apeThrow = 0.5;
      this.barrels.push({
        x: APE_X + 30,
        y: girderY(5, APE_X + 30),
        girder: 5,
        dir: downhill(5),
        state: 'roll',
        vy: 0,
        rot: 0,
        scored: false,
        lastLadder: null,
      });
      this._barrelCount++;
    }
    if (this._apeThrow > 0) this._apeThrow -= dt;

    const speed = 130 + this.stage * 12;
    const ladderProb = Math.min(0.25 + this.stage * 0.05, 0.55);

    for (const b of this.barrels) {
      b.rot += b.dir * dt * 9;
      if (b.state === 'roll') {
        b.x += b.dir * speed * dt;
        b.y = girderY(b.girder, b.x);

        // maybe take a ladder down (biased toward the player's side)
        for (const l of LADDERS) {
          if (l.hi !== b.girder || l.hi === 6 || b.lastLadder === l) continue;
          if (Math.abs(b.x - l.x) < 5) {
            b.lastLadder = l;
            let prob = ladderProb;
            if (
              this.player.girder === l.lo &&
              Math.abs(this.player.x - l.x) < 90
            ) {
              prob += 0.25;
            }
            if (Math.random() < prob) {
              b.state = 'ladder';
              b.ladder = l;
              b.x = l.x;
            }
            break;
          }
        }

        // off the end -> fall to the next girder
        if (b.state === 'roll') {
          if (b.girder === 0) {
            if (b.x < DRUM_X + 18) {
              b.dead = true;
              this._maybeFireball();
            }
          } else if ((b.dir < 0 && b.x < GX0 + 6) || (b.dir > 0 && b.x > GX1 - 6)) {
            b.state = 'fall';
            b.vy = 0;
          }
        }
      } else if (b.state === 'ladder') {
        b.y += 120 * dt;
        const yBot = girderY(b.ladder.lo, b.ladder.x);
        if (b.y >= yBot) {
          b.y = yBot;
          b.girder = b.ladder.lo;
          b.dir = downhill(b.girder);
          b.state = 'roll';
          b.lastLadder = null;
        }
      } else if (b.state === 'fall') {
        b.x += b.dir * 26 * dt;
        b.y += b.vy * dt;
        b.vy += GRAV * dt;
        const below = b.girder - 1;
        if (below >= 0) {
          const fy = girderY(below, b.x);
          if (b.y >= fy) {
            b.y = fy;
            b.girder = below;
            b.dir = downhill(below);
            b.state = 'roll';
            b.vy = 0;
          }
        } else if (b.y > H + 30) {
          b.dead = true;
        }
      }

      // jumped over -> points (awarded once per barrel)
      const p = this.player;
      if (
        !b.scored && !p.grounded && !p.ladder &&
        Math.abs(b.x - p.x) < 20 && b.y > p.y + 8
      ) {
        b.scored = true;
        this._addScore(100, p.x, p.y - 24);
      }
    }
    this.barrels = this.barrels.filter((b) => !b.dead);
  }

  _maybeFireball() {
    const cap = Math.min(2 + Math.floor(this.stage / 2), 4);
    if (this.fireballs.length < cap && this._barrelCount % 2 === 0) {
      this.fireballs.push({
        x: DRUM_X + 20,
        y: girderY(0, DRUM_X + 20),
        girder: 0,
        dir: 1,
        state: 'roll',
        flipT: rand(1, 2.5),
        ladder: null,
        flicker: rand(0, 9),
      });
    }
  }

  _updateFireballs(dt) {
    const speed = 52 + this.stage * 5;
    for (const f of this.fireballs) {
      f.flicker += dt * 14;
      if (f.state === 'roll') {
        f.flipT -= dt;
        if (f.flipT <= 0) {
          f.flipT = rand(1.2, 3);
          // drift toward the player's side of the screen
          f.dir = this.player.x > f.x ? 1 : -1;
          if (Math.random() < 0.25) f.dir *= -1;
        }
        f.x += f.dir * speed * dt;
        const g = GIRDERS[f.girder];
        if (f.x < g.x1 + 10 || f.x > g.x2 - 10) {
          f.x = clamp(f.x, g.x1 + 10, g.x2 - 10);
          f.dir *= -1;
        }
        f.y = girderY(f.girder, f.x);

        // occasionally climb toward the player's level
        for (const l of LADDERS) {
          if (l.hi === 6) continue;
          if ((l.lo === f.girder || l.hi === f.girder) && Math.abs(f.x - l.x) < 5) {
            const wantUp = this.player.girder > f.girder && l.lo === f.girder;
            const wantDown = this.player.girder < f.girder && l.hi === f.girder;
            if ((wantUp || wantDown) && Math.random() < 0.4) {
              f.state = 'ladder';
              f.ladder = l;
              f.to = wantUp ? l.hi : l.lo;
              f.x = l.x;
            }
            break;
          }
        }
      } else if (f.state === 'ladder') {
        const ty = girderY(f.to, f.ladder.x);
        f.y += Math.sign(ty - f.y) * 70 * dt;
        if (Math.abs(f.y - ty) < 3) {
          f.y = ty;
          f.girder = f.to;
          f.state = 'roll';
          f.ladder = null;
        }
      }
    }
  }

  // ---- hazards / scoring ------------------------------------------
  _checkHazards() {
    const p = this.player;
    const head = p.hammer > 0 ? this._hammerHead() : null;

    const smash = (list, pts) => {
      for (const o of list) {
        if (head) {
          const dx = o.x - head.x;
          const dy = o.y - 8 - head.y;
          if (dx * dx + dy * dy < 26 * 26) {
            o.dead = true;
            this._explode(o.x, o.y - 8, '#ffb24a');
            this._addScore(pts, o.x, o.y - 16);
            continue;
          }
        }
        if (!o.dead && Math.abs(o.x - p.x) < 13 && o.y - 8 > p.y - 26 && o.y - 8 < p.y + 4) {
          this._die();
          return;
        }
      }
    };
    smash(this.barrels, 300);
    if (this.status !== 'playing') return;
    smash(this.fireballs, 300);
    this.barrels = this.barrels.filter((b) => !b.dead);
    this.fireballs = this.fireballs.filter((f) => !f.dead);
  }

  _die() {
    if (this.status !== 'playing') return;
    this.lives -= 1;
    this.status = 'dying';
    this.deathT = 1.6;
    this._explode(this.player.x, this.player.y - 12, '#00f0ff');
    this._emit();
  }

  _addScore(n, x, y, big = false) {
    this.score += n;
    if (x !== undefined) {
      this.floaters.push({ x, y, text: `+${n}`, life: big ? 1.5 : 0.8, big });
    }
    if (!this.extraAwarded && this.score >= 15000) {
      this.extraAwarded = true;
      this.lives += 1;
    }
    this._emit();
  }

  _explode(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(50, 220);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: rand(0.3, 0.6),
        color,
      });
    }
  }

  _updateParticles(dt) {
    for (const pt of this.particles) {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 500 * dt;
      pt.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  _updateFloaters(dt) {
    for (const f of this.floaters) {
      f.y -= 24 * dt;
      f.life -= dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
  }

  // ---- rendering ---------------------------------------------------
  _render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#04070d';
    ctx.fillRect(0, 0, W, H);

    this._drawLadders(ctx);
    this._drawGirders(ctx);
    this._drawDrum(ctx);
    this._drawHammers(ctx);
    this._drawApe(ctx);
    this._drawCaptive(ctx);

    if (this.status !== 'ready') {
      for (const b of this.barrels) this._drawBarrel(ctx, b);
      for (const f of this.fireballs) this._drawFireball(ctx, f);
      this._drawPlayer(ctx);
      this._drawParticles(ctx);
      this._drawFloaters(ctx);

      // in-canvas HUD: bonus timer
      ctx.font = "700 15px 'JetBrains Mono', monospace";
      ctx.fillStyle = this.bonus <= 1000 ? '#ff5050' : '#ffd24a';
      ctx.textAlign = 'right';
      ctx.fillText(`BONUS ${this.bonus}`, W - 18, 30);
      ctx.textAlign = 'left';
      if (this.player.hammer > 0) {
        ctx.fillStyle = '#00f0ff';
        ctx.fillText(`HAMMER ${this.player.hammer.toFixed(1)}`, 18, 30);
      }
    }

    if (this.bannerT > 0 && this.status === 'playing') {
      ctx.globalAlpha = clamp(this.bannerT, 0, 1);
      ctx.fillStyle = this.banner === 'RESCUED!' ? '#ffd24a' : '#ff9f1c';
      ctx.font = '900 40px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.banner, W / 2, H / 2 - 60);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }
  }

  _drawGirders(ctx) {
    for (const g of GIRDERS) {
      ctx.save();
      const ang = Math.atan2(g.y2 - g.y1, g.x2 - g.x1);
      const len = Math.hypot(g.x2 - g.x1, g.y2 - g.y1);
      ctx.translate(g.x1, g.y1);
      ctx.rotate(ang);
      ctx.fillStyle = '#23080f';
      ctx.fillRect(0, 0, len, 12);
      ctx.strokeStyle = '#ff5d73';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 1, len, 10);
      // cross-bracing
      ctx.beginPath();
      for (let x = 0; x < len - 12; x += 24) {
        ctx.moveTo(x, 11);
        ctx.lineTo(x + 12, 1);
        ctx.moveTo(x + 12, 1);
        ctx.lineTo(x + 24, 11);
      }
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  _drawLadders(ctx) {
    ctx.strokeStyle = '#00b9c9';
    ctx.lineWidth = 2;
    for (const l of LADDERS) {
      const yTop = girderY(l.hi, l.x);
      const yBot = girderY(l.lo, l.x);
      ctx.beginPath();
      ctx.moveTo(l.x - 8, yTop);
      ctx.lineTo(l.x - 8, yBot);
      ctx.moveTo(l.x + 8, yTop);
      ctx.lineTo(l.x + 8, yBot);
      for (let y = yTop + 8; y < yBot - 2; y += 12) {
        ctx.moveTo(l.x - 8, y);
        ctx.lineTo(l.x + 8, y);
      }
      ctx.stroke();
    }
  }

  _drawDrum(ctx) {
    const y = girderY(0, DRUM_X);
    ctx.fillStyle = '#1a2335';
    ctx.fillRect(DRUM_X - 16, y - 30, 32, 30);
    ctx.strokeStyle = '#5b7090';
    ctx.lineWidth = 2;
    ctx.strokeRect(DRUM_X - 16, y - 30, 32, 30);
    ctx.strokeRect(DRUM_X - 16, y - 22, 32, 6);
    // flame flicker
    const fl = Math.sin(this.time * 13) * 4;
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.moveTo(DRUM_X - 8, y - 30);
    ctx.quadraticCurveTo(DRUM_X - 4, y - 44 - fl, DRUM_X, y - 32);
    ctx.quadraticCurveTo(DRUM_X + 5, y - 46 + fl, DRUM_X + 9, y - 30);
    ctx.fill();
  }

  _drawHammers(ctx) {
    for (const h of this.hammers) {
      if (h.used) continue;
      const y = girderY(h.girder, h.x) - 22;
      const bob = Math.sin(this.time * 3 + h.x) * 2;
      ctx.save();
      ctx.translate(h.x, y + bob);
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#9fe0ff';
      ctx.fillRect(-9, -8, 18, 10);
      ctx.fillStyle = '#7a5230';
      ctx.fillRect(-2, 2, 4, 14);
      ctx.restore();
    }
  }

  _drawApe(ctx) {
    const y = girderY(5, APE_X);
    const throwing = this._apeThrow > 0;
    const beat = throwing ? 0 : Math.sin(this.time * 3) * 3;
    ctx.save();
    ctx.translate(APE_X, y);
    ctx.fillStyle = '#3d2417';
    // torso
    ctx.fillRect(-26, -52, 52, 40);
    // head
    ctx.fillRect(-16, -70, 32, 22);
    // brow + eyes
    ctx.fillStyle = '#1d0f08';
    ctx.fillRect(-14, -62, 28, 5);
    ctx.fillStyle = '#ffd24a';
    ctx.fillRect(-10, -60, 5, 4);
    ctx.fillRect(5, -60, 5, 4);
    // arms
    ctx.fillStyle = '#3d2417';
    if (throwing) {
      ctx.fillRect(20, -56, 26, 12); // arm extended with the barrel
    } else {
      ctx.fillRect(-38, -46 + beat, 14, 26);
      ctx.fillRect(24, -46 - beat, 14, 26);
    }
    // legs
    ctx.fillRect(-22, -12, 16, 12);
    ctx.fillRect(6, -12, 16, 12);
    ctx.restore();
  }

  _drawCaptive(ctx) {
    const y = girderY(6, CAPTIVE_X);
    const wave = Math.sin(this.time * 4) > 0;
    ctx.save();
    ctx.translate(CAPTIVE_X, y);
    ctx.shadowColor = '#ff9fdc';
    ctx.shadowBlur = 8;
    // dress
    ctx.fillStyle = '#ff9fdc';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(8, -2);
    ctx.lineTo(-8, -2);
    ctx.closePath();
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.arc(0, -27, 5, 0, Math.PI * 2);
    ctx.fill();
    // waving arm
    ctx.strokeStyle = '#ff9fdc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(4, -20);
    ctx.lineTo(11, wave ? -30 : -24);
    ctx.stroke();
    // HELP! bubble
    if (this.status === 'playing' && this.clearT <= 0) {
      ctx.shadowBlur = 0;
      ctx.font = "700 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = '#ffffff';
      ctx.fillText(wave ? 'HELP!' : 'HELP', 14, -34);
    }
    ctx.restore();
  }

  _drawBarrel(ctx, b) {
    ctx.save();
    ctx.translate(b.x, b.y - 9);
    ctx.rotate(b.rot);
    ctx.fillStyle = '#b86b2e';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5e3211';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(9, 0);
    ctx.moveTo(0, -9);
    ctx.lineTo(0, 9);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  _drawFireball(ctx, f) {
    const r = 8 + Math.sin(f.flicker) * 1.5;
    ctx.save();
    ctx.translate(f.x, f.y - 9);
    ctx.shadowColor = '#ff9f1c';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe28a';
    ctx.beginPath();
    ctx.arc(0, 1, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // eyes
    ctx.fillStyle = '#1d0f08';
    ctx.fillRect(-4, -3, 2.5, 3);
    ctx.fillRect(2, -3, 2.5, 3);
    ctx.restore();
  }

  _drawPlayer(ctx) {
    const p = this.player;
    if (this.status === 'dying' && Math.floor(this.deathT * 10) % 2 === 0) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.face, 1);
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    const step = p.walking ? Math.sin(p.anim) * 3 : 0;
    // legs
    ctx.fillStyle = '#0a6f80';
    ctx.fillRect(-7, -8, 5, 8 + step * 0.5);
    ctx.fillRect(2, -8, 5, 8 - step * 0.5);
    // body
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(-8, -20, 16, 13);
    // head + cap
    ctx.fillStyle = '#ffd9a8';
    ctx.fillRect(-5, -29, 10, 9);
    ctx.fillStyle = '#ff5d73';
    ctx.fillRect(-6, -32, 12, 5);
    ctx.fillRect(0, -31, 10, 3);
    // hammer
    if (p.hammer > 0) {
      const up = Math.floor(p.swing / 0.18) % 2 === 0;
      ctx.fillStyle = '#7a5230';
      if (up) {
        ctx.fillRect(2, -46, 3, 18);
        ctx.fillStyle = '#9fe0ff';
        ctx.fillRect(-4, -52, 16, 9);
      } else {
        ctx.fillRect(8, -18, 14, 3);
        ctx.fillStyle = '#9fe0ff';
        ctx.fillRect(18, -24, 9, 14);
      }
    }
    ctx.restore();
  }

  _drawParticles(ctx) {
    for (const pt of this.particles) {
      ctx.globalAlpha = clamp(pt.life * 2.2, 0, 1);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
  }

  _drawFloaters(ctx) {
    ctx.textAlign = 'center';
    for (const f of this.floaters) {
      ctx.globalAlpha = clamp(f.life * 1.6, 0, 1);
      ctx.fillStyle = f.big ? '#ffd24a' : '#9fe0ff';
      ctx.font = `${f.big ? 700 : 500} ${f.big ? 19 : 13}px 'JetBrains Mono', monospace`;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }
}
