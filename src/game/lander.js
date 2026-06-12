// ============================================================
//  MARE DESCENT — a gravity-lander arcade tribute (1979 style).
//  All original code, art, physics, and procedural terrain.
//
//  Bring the lander down on a beacon pad: kill your horizontal
//  speed, keep the descent gentle, stay upright. Narrow pads pay
//  more. Every sortie generates fresh terrain, gravity creeps up,
//  fuel gets tighter — and from sortie 3, the mascon winds drift
//  you off course.
//
//  Controls:  ←/→ or A/D rotate · ↑/W/SPACE thrust · P pause
//
//  Visual feature set: dynamic camera zoom on descent, parallax
//  starfield + Earth, particle exhaust and landing dust, debris
//  physics on crash, screen shake, color-coded flight HUD.
// ============================================================

export const W = 900;
export const H = 680;

const WORLD_W = 1900;
const WORLD_H = 720;
const STEP = 24; // terrain sample spacing

// flight envelope for a safe touchdown
const SAFE_VX = 24;
const SAFE_VY = 42;
const SAFE_ANG = 0.26;

const PAD_SPECS = [
  { mult: 2, width: 116 },
  { mult: 3, width: 80 },
  { mult: 5, width: 52 },
];

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a, b, t) => a + (b - a) * t;

export class LanderGame {
  constructor(canvas, { onState } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onState = onState || (() => {});
    canvas.width = W;
    canvas.height = H;

    this.keys = new Set();
    this.touch = { move: null, jump: false };

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._loop = this._loop.bind(this);

    this.highScore = Number(localStorage.getItem('arcade-hi-lander') || 0);

    // parallax starfield (screen-space, 3 depth layers)
    this.stars = Array.from({ length: 150 }, () => ({
      x: rand(0, W * 2),
      y: rand(0, H * 0.85),
      r: rand(0.4, 1.7),
      p: [0.15, 0.35, 0.6][Math.floor(rand(0, 3))],
      tw: rand(0, Math.PI * 2),
    }));

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
    this.ships = 3;
    this.sortie = 0;
    this.extraAwarded = false;
    this._newSortie();
  }

  _newSortie() {
    this.sortie += 1;
    this.gravity = Math.min(22 + (this.sortie - 1) * 1.6, 32);
    this.windMax = this.sortie >= 3 ? Math.min(4 + this.sortie * 1.4, 13) : 0;
    this.windSeed = rand(0, 100);
    this._genTerrain();
    this._spawnShip(true);
    this.banner = `SORTIE ${this.sortie}`;
    this.bannerT = 2.4;
    this.landedT = 0;
    this.lastLanding = null;
    this._emit();
  }

  _spawnShip(fullFuel) {
    this.lander = {
      x: rand(180, 320),
      y: 90,
      vx: rand(26, 40),
      vy: 0,
      angle: 0,
      fuel: fullFuel || !this.lander ? Math.max(100 - (this.sortie - 1) * 5, 72) : this.lander.fuel,
      thrust: 0, // ramped 0..1
      alive: true,
    };
    this.particles = [];
    this.debris = [];
    this.floaters = [];
    this.shock = 0;
    this.shake = 0;
    this.cam = { x: this.lander.x, y: 300, s: 1 };
    this.deathT = 0;
  }

  // procedural terrain via random walk + smoothing, then carve pads
  _genTerrain() {
    const n = Math.ceil(WORLD_W / STEP) + 1;
    let y = rand(520, 580);
    const pts = [];
    for (let i = 0; i < n; i++) {
      y += rand(-52, 52);
      // bias back toward the band so it never runs away
      y += (560 - y) * 0.08;
      y = clamp(y, 300, 648);
      pts.push(y);
    }
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 1; i < n - 1; i++) {
        pts[i] = (pts[i - 1] + pts[i] * 2 + pts[i + 1]) / 4;
      }
    }

    // carve three pads with minimum spacing
    this.pads = [];
    const taken = [];
    for (const spec of PAD_SPECS) {
      const span = Math.ceil(spec.width / STEP);
      let idx;
      let tries = 0;
      do {
        idx = Math.floor(rand(6, n - 6 - span));
        tries++;
      } while (
        tries < 80 &&
        taken.some(([a, b]) => idx < b + 8 && idx + span > a - 8)
      );
      taken.push([idx, idx + span]);
      const py = clamp(pts[idx], 380, 620);
      for (let i = idx; i <= idx + span; i++) pts[i] = py;
      this.pads.push({
        x1: idx * STEP,
        x2: (idx + span) * STEP,
        y: py,
        mult: spec.mult,
      });
    }
    this.terrain = pts;
  }

  ySurface(x) {
    const fx = clamp(x, 0, WORLD_W - 0.01) / STEP;
    const i = Math.floor(fx);
    const t = fx - i;
    const pts = this.terrain;
    return pts[i] + (pts[Math.min(i + 1, pts.length - 1)] - pts[i]) * t;
  }

  _emit() {
    this.onState({
      status: this.status,
      score: this.score,
      lives: this.ships,
      wave: this.sortie,
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

  _rotInput() {
    let r = 0;
    if (this.keys.has('arrowleft') || this.keys.has('a')) r -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) r += 1;
    if (this.touch.move && Math.abs(this.touch.move.x) > 0.3) r += Math.sign(this.touch.move.x);
    return clamp(r, -1, 1);
  }

  _thrustInput() {
    return (
      this.keys.has('arrowup') || this.keys.has('w') || this.keys.has(' ') ||
      this.touch.jump ||
      (this.touch.move && this.touch.move.y < -0.5)
    );
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
    if (this.bannerT > 0) this.bannerT -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 26);
    if (this.shock > 0) this.shock += dt * 520;
    this._updateParticles(dt);
    this._updateDebris(dt);
    this._updateFloaters(dt);

    if (this.status === 'dying') {
      this.deathT -= dt;
      if (this.deathT <= 0) {
        if (this.ships <= 0) {
          this.status = 'gameover';
          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('arcade-hi-lander', String(this.score));
          }
        } else {
          this._spawnShip(true); // same terrain, fresh attempt
          this.status = 'playing';
        }
        this._emit();
      }
      this._updateCamera(dt);
      return;
    }

    // touchdown freeze -> next sortie
    if (this.landedT > 0) {
      this.landedT -= dt;
      if (this.landedT <= 0) this._newSortie();
      this._updateCamera(dt);
      return;
    }

    this._updateShip(dt);
    this._updateCamera(dt);
  }

  _updateShip(dt) {
    const l = this.lander;

    l.angle = clamp(l.angle + this._rotInput() * 2.4 * dt, -2.4, 2.4);

    // thrust with a short spool-up ramp for feel
    const burning = this._thrustInput() && l.fuel > 0;
    l.thrust = clamp(l.thrust + (burning ? dt / 0.14 : -dt / 0.08), 0, 1);
    if (burning) l.fuel = Math.max(0, l.fuel - 9.5 * dt);

    const acc = 62 * l.thrust;
    l.vx += Math.sin(l.angle) * acc * dt;
    l.vy += -Math.cos(l.angle) * acc * dt + this.gravity * dt;

    // mascon wind (sortie 3+)
    this.wind = this.windMax
      ? Math.sin(this.time * 0.32 + this.windSeed) * this.windMax
      : 0;
    l.vx += this.wind * 0.5 * dt;

    l.x += l.vx * dt;
    l.y += l.vy * dt;
    l.x = clamp(l.x, 14, WORLD_W - 14);

    // exhaust particles
    if (l.thrust > 0.25) {
      const nIter = Math.ceil(140 * l.thrust * dt);
      for (let i = 0; i < nIter && this.particles.length < 420; i++) {
        const spread = rand(-0.3, 0.3);
        const a = l.angle + Math.PI + spread; // opposite the nose
        const sp = rand(120, 240) * l.thrust;
        this.particles.push({
          x: l.x - Math.sin(l.angle) * 13,
          y: l.y + Math.cos(l.angle) * 13,
          vx: Math.sin(a) * -sp + l.vx * 0.6,
          vy: Math.cos(a) * sp + l.vy * 0.6,
          life: rand(0.18, 0.45),
          max: 0.45,
          kind: 'flame',
        });
      }
      // dust kick-up when burning near the surface
      const alt = this.ySurface(l.x) - l.y;
      if (alt < 95) {
        for (let i = 0; i < 3 && this.particles.length < 420; i++) {
          const dx = rand(-26, 26);
          this.particles.push({
            x: l.x + dx,
            y: this.ySurface(l.x + dx) - 2,
            vx: Math.sign(dx) * rand(40, 170) * (1 - alt / 95),
            vy: rand(-46, -8),
            life: rand(0.4, 0.9),
            max: 0.9,
            kind: 'dust',
          });
        }
      }
    }

    // ---- terrain contact: sample legs + nose ----
    const pts = [
      { ox: -11, oy: 14 }, // left leg
      { ox: 11, oy: 14 }, // right leg
      { ox: 0, oy: -13 }, // nose
    ].map(({ ox, oy }) => {
      const ca = Math.cos(l.angle);
      const sa = Math.sin(l.angle);
      return { x: l.x + ox * ca - oy * sa, y: l.y + ox * sa + oy * ca };
    });

    let contact = false;
    for (const p of pts) {
      if (p.y >= this.ySurface(p.x)) { contact = true; break; }
    }
    if (!contact) return;

    const pad = this.pads.find((pd) => pts[0].x >= pd.x1 && pts[1].x <= pd.x2);
    const safe =
      Math.abs(l.vx) <= SAFE_VX && l.vy > -5 && l.vy <= SAFE_VY && Math.abs(l.angle) <= SAFE_ANG;

    if (pad && safe) this._touchdown(pad);
    else this._crash();
  }

  _touchdown(pad) {
    const l = this.lander;
    l.y = pad.y - 14;
    l.vx = 0;
    l.vy = 0;
    l.angle = 0;
    l.thrust = 0;

    const base = 150 * pad.mult;
    const fuelBonus = Math.round(l.fuel) * 2;
    const total = base + fuelBonus;
    this.lastLanding = { mult: pad.mult, base, fuelBonus, total };
    this._addScore(total, l.x, l.y - 46, true);

    this.banner = 'TOUCHDOWN!';
    this.bannerT = 2.4;
    this.landedT = 2.6;

    // celebratory dust ring
    for (let i = 0; i < 26; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      this.particles.push({
        x: l.x + dir * 14,
        y: pad.y - 2,
        vx: dir * rand(60, 200),
        vy: rand(-40, -6),
        life: rand(0.4, 0.9),
        max: 0.9,
        kind: 'dust',
      });
    }
  }

  _crash() {
    if (this.status !== 'playing') return;
    const l = this.lander;
    l.alive = false;
    this.ships -= 1;
    this.status = 'dying';
    this.deathT = 2.1;
    this.shake = 14;
    this.shock = 1;
    this._shockX = l.x;
    this._shockY = l.y;

    // explosion particles
    for (let i = 0; i < 46; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(40, 320);
      this.particles.push({
        x: l.x,
        y: l.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: rand(0.4, 1.1),
        max: 1.1,
        kind: 'flame',
      });
    }
    // tumbling hull fragments
    const segs = [
      [-9, 8, -6, -4], [-6, -4, 0, -12], [0, -12, 6, -4], [6, -4, 9, 8],
      [-9, 8, 9, 8], [-7, 8, -13, 16], [7, 8, 13, 16],
    ];
    for (const [x1, y1, x2, y2] of segs) {
      this.debris.push({
        x: l.x, y: l.y,
        vx: rand(-130, 130), vy: rand(-220, -40),
        rot: rand(0, Math.PI * 2), vr: rand(-7, 7),
        x1, y1, x2, y2, life: rand(1.2, 2),
      });
    }
    this._emit();
  }

  _addScore(n, x, y, big = false) {
    this.score += n;
    if (x !== undefined) {
      this.floaters.push({ x, y, text: `+${n}`, life: big ? 1.6 : 0.8, big });
    }
    if (!this.extraAwarded && this.score >= 2500) {
      this.extraAwarded = true;
      this.ships += 1;
    }
    this._emit();
  }

  // ---- camera ----------------------------------------------------
  _updateCamera(dt) {
    const l = this.lander;
    const alt = this.ySurface(l.x) - l.y;
    const targetS = 1 + clamp((300 - alt) / 230, 0, 1) * 1.15;
    this.cam.s = lerp(this.cam.s, targetS, clamp(dt * 3, 0, 1));
    const s = this.cam.s;
    const tx = clamp(l.x, W / 2 / s, WORLD_W - W / 2 / s);
    const ty = clamp(l.y + 60, H / 2 / s, WORLD_H - H / 2 / s);
    this.cam.x = lerp(this.cam.x, tx, clamp(dt * 4, 0, 1));
    this.cam.y = lerp(this.cam.y, ty, clamp(dt * 4, 0, 1));
  }

  _updateParticles(dt) {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'dust') p.vy += 220 * dt;
      else { p.vx *= 0.96; p.vy *= 0.96; }
      p.life -= dt;
      // dust settles on the ground
      if (p.kind === 'dust' && p.y > this.ySurface(p.x)) {
        p.y = this.ySurface(p.x);
        p.vy = 0;
        p.vx *= 0.8;
      }
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  _updateDebris(dt) {
    for (const d of this.debris) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy += 320 * dt;
      d.rot += d.vr * dt;
      d.life -= dt;
      const gy = this.ySurface(d.x);
      if (d.y > gy) { d.y = gy; d.vy *= -0.35; d.vx *= 0.7; d.vr *= 0.7; }
    }
    this.debris = this.debris.filter((d) => d.life > 0);
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
    const { s } = this.cam;

    // deep-space sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#020308');
    sky.addColorStop(0.55, '#04070d');
    sky.addColorStop(1, '#070d18');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    this._drawStars(ctx);
    this._drawEarth(ctx);

    if (this.status === 'ready') { this._drawVignette(ctx); return; }

    // ---- world space ----
    const shx = this.shake > 0 ? rand(-this.shake, this.shake) : 0;
    const shy = this.shake > 0 ? rand(-this.shake, this.shake) : 0;
    ctx.save();
    ctx.translate(W / 2 + shx, H / 2 + shy);
    ctx.scale(s, s);
    ctx.translate(-this.cam.x, -this.cam.y);

    this._drawTerrain(ctx);
    this._drawPads(ctx);
    this._drawGuidance(ctx);
    this._drawParticles(ctx);
    this._drawDebris(ctx);
    if (this.lander.alive) this._drawShip(ctx);
    if (this.shock > 0 && this.shock < 400) {
      ctx.strokeStyle = `rgba(255,159,28,${1 - this.shock / 400})`;
      ctx.lineWidth = 3 / s;
      ctx.beginPath();
      ctx.arc(this._shockX, this._shockY, this.shock, 0, Math.PI * 2);
      ctx.stroke();
    }
    this._drawFloaters(ctx);
    ctx.restore();

    // ---- screen space HUD ----
    this._drawHUD(ctx);
    this._drawVignette(ctx);

    if (this.bannerT > 0 && (this.status === 'playing' || this.status === 'dying')) {
      ctx.globalAlpha = clamp(this.bannerT, 0, 1);
      ctx.fillStyle = this.banner === 'TOUCHDOWN!' ? '#7dffb0' : '#ff9f1c';
      ctx.font = '900 42px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.banner, W / 2, 200);
      if (this.banner === 'TOUCHDOWN!' && this.lastLanding) {
        const ll = this.lastLanding;
        ctx.font = "500 15px 'JetBrains Mono', monospace";
        ctx.fillStyle = '#c9d7e6';
        ctx.fillText(
          `PAD ×${ll.mult}  ·  BASE ${ll.base}  ·  FUEL BONUS ${ll.fuelBonus}`,
          W / 2,
          230
        );
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }
  }

  _drawStars(ctx) {
    const { x: cx, s } = this.cam;
    for (const st of this.stars) {
      const sx = (((st.x - cx * st.p * s) % (W * 2)) + W * 2) % (W * 2) - W * 0.5;
      if (sx < -10 || sx > W + 10) continue;
      const tw = 0.45 + 0.55 * Math.abs(Math.sin(this.time * 1.4 + st.tw));
      ctx.globalAlpha = tw * (0.35 + st.p);
      ctx.fillStyle = '#cfe9ff';
      ctx.beginPath();
      ctx.arc(sx, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawEarth(ctx) {
    const ex = W - 150 - this.cam.x * 0.04;
    const ey = 120;
    ctx.save();
    const glow = ctx.createRadialGradient(ex, ey, 20, ex, ey, 88);
    glow.addColorStop(0, 'rgba(80,150,255,0.25)');
    glow.addColorStop(1, 'rgba(80,150,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(ex - 90, ey - 90, 180, 180);

    // planet disc, with the terminator shadow clipped inside it
    ctx.beginPath();
    ctx.arc(ex, ey, 44, 0, Math.PI * 2);
    ctx.clip();
    const g = ctx.createRadialGradient(ex - 14, ey - 14, 4, ex, ey, 44);
    g.addColorStop(0, '#9fd4ff');
    g.addColorStop(0.5, '#2f7fd6');
    g.addColorStop(1, '#0a2a55');
    ctx.fillStyle = g;
    ctx.fillRect(ex - 44, ey - 44, 88, 88);
    ctx.fillStyle = 'rgba(2,3,8,0.55)';
    ctx.beginPath();
    ctx.arc(ex + 26, ey + 10, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawTerrain(ctx) {
    const pts = this.terrain;
    const s = this.cam.s;
    // filled regolith with subtle gradient
    const grad = ctx.createLinearGradient(0, 300, 0, WORLD_H);
    grad.addColorStop(0, '#10182a');
    grad.addColorStop(1, '#070a14');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, WORLD_H + 50);
    for (let i = 0; i < pts.length; i++) ctx.lineTo(i * STEP, pts[i]);
    ctx.lineTo(WORLD_W, WORLD_H + 50);
    ctx.closePath();
    ctx.fill();
    // ridge line glow
    ctx.strokeStyle = '#5b7ecf';
    ctx.lineWidth = 1.6 / s;
    ctx.shadowColor = '#5b7ecf';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(0, pts[0]);
      else ctx.lineTo(i * STEP, pts[i]);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  _drawPads(ctx) {
    const s = this.cam.s;
    const blink = Math.sin(this.time * 5) > 0;
    for (const pad of this.pads) {
      // landing light cone
      const cone = ctx.createLinearGradient(0, pad.y - 130, 0, pad.y);
      cone.addColorStop(0, 'rgba(125,255,176,0)');
      cone.addColorStop(1, 'rgba(125,255,176,0.10)');
      ctx.fillStyle = cone;
      ctx.fillRect(pad.x1, pad.y - 130, pad.x2 - pad.x1, 130);
      // pad surface
      ctx.strokeStyle = '#7dffb0';
      ctx.lineWidth = 3 / s;
      ctx.shadowColor = '#7dffb0';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(pad.x1, pad.y);
      ctx.lineTo(pad.x2, pad.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // beacon lights
      ctx.fillStyle = blink ? '#7dffb0' : '#1c5a36';
      ctx.fillRect(pad.x1 - 2, pad.y - 7, 4, 7);
      ctx.fillRect(pad.x2 - 2, pad.y - 7, 4, 7);
      // multiplier
      const bob = Math.sin(this.time * 2.6 + pad.x1) * 3;
      ctx.fillStyle = '#7dffb0';
      ctx.font = `700 ${15 / s}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`×${pad.mult}`, (pad.x1 + pad.x2) / 2, pad.y - 16 + bob);
      ctx.textAlign = 'left';
    }
  }

  // dashed altitude line + ground marker under the ship
  _drawGuidance(ctx) {
    const l = this.lander;
    if (!l.alive || this.landedT > 0) return;
    const gy = this.ySurface(l.x);
    const s = this.cam.s;
    ctx.strokeStyle = 'rgba(0,240,255,0.25)';
    ctx.lineWidth = 1 / s;
    ctx.setLineDash([6 / s, 8 / s]);
    ctx.beginPath();
    ctx.moveTo(l.x, l.y + 18);
    ctx.lineTo(l.x, gy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(0,240,255,0.6)';
    ctx.beginPath();
    ctx.moveTo(l.x - 7, gy);
    ctx.lineTo(l.x + 7, gy);
    ctx.stroke();
  }

  _drawShip(ctx) {
    const l = this.lander;
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.angle);

    // thrust flame (under the hull, drawn first)
    if (l.thrust > 0.15) {
      const len = (14 + Math.sin(this.time * 40) * 4) * l.thrust + 8;
      ctx.fillStyle = '#ff9f1c';
      ctx.shadowColor = '#ff9f1c';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(-4.5, 13);
      ctx.lineTo(0, 13 + len);
      ctx.lineTo(4.5, 13);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff3c8';
      ctx.beginPath();
      ctx.moveTo(-2.2, 13);
      ctx.lineTo(0, 13 + len * 0.55);
      ctx.lineTo(2.2, 13);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // hull
    ctx.fillStyle = 'rgba(16,30,46,0.92)';
    ctx.strokeStyle = '#e8f6ff';
    ctx.lineWidth = 1.6;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-9, 8);
    ctx.lineTo(-6, -5);
    ctx.lineTo(0, -13);
    ctx.lineTo(6, -5);
    ctx.lineTo(9, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    // cockpit dome
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(0, -4, 3.4, 0, Math.PI * 2);
    ctx.fill();
    // nozzle
    ctx.strokeStyle = '#9fb6c9';
    ctx.beginPath();
    ctx.moveTo(-4.5, 8);
    ctx.lineTo(-3, 13);
    ctx.lineTo(3, 13);
    ctx.lineTo(4.5, 8);
    ctx.stroke();
    // legs + foot pads
    ctx.strokeStyle = '#e8f6ff';
    ctx.beginPath();
    ctx.moveTo(-7, 8);
    ctx.lineTo(-11, 14);
    ctx.moveTo(7, 8);
    ctx.lineTo(11, 14);
    ctx.moveTo(-13.5, 14);
    ctx.lineTo(-8.5, 14);
    ctx.moveTo(8.5, 14);
    ctx.lineTo(13.5, 14);
    ctx.stroke();
    ctx.restore();
  }

  _drawParticles(ctx) {
    for (const p of this.particles) {
      const t = clamp(p.life / p.max, 0, 1);
      if (p.kind === 'flame') {
        ctx.globalAlpha = t;
        ctx.fillStyle = t > 0.55 ? '#fff3c8' : t > 0.25 ? '#ff9f1c' : '#ff4f28';
        ctx.fillRect(p.x - 1.6, p.y - 1.6, 3.2, 3.2);
      } else {
        ctx.globalAlpha = t * 0.7;
        ctx.fillStyle = '#9aa7bd';
        ctx.fillRect(p.x - 1.4, p.y - 1.4, 2.8, 2.8);
      }
    }
    ctx.globalAlpha = 1;
  }

  _drawDebris(ctx) {
    ctx.strokeStyle = '#e8f6ff';
    for (const d of this.debris) {
      ctx.globalAlpha = clamp(d.life, 0, 1);
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(d.x1, d.y1);
      ctx.lineTo(d.x2, d.y2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  _drawFloaters(ctx) {
    ctx.textAlign = 'center';
    for (const f of this.floaters) {
      ctx.globalAlpha = clamp(f.life * 1.4, 0, 1);
      ctx.fillStyle = f.big ? '#7dffb0' : '#9fe0ff';
      ctx.font = `${f.big ? 700 : 500} ${f.big ? 19 : 13}px 'JetBrains Mono', monospace`;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  _drawHUD(ctx) {
    const l = this.lander;
    const alt = Math.max(0, Math.round(this.ySurface(l.x) - l.y - 14));
    const vs = Math.round(l.vy);
    const hs = Math.round(l.vx);
    const angOk = Math.abs(l.angle) <= SAFE_ANG;

    ctx.font = "500 13px 'JetBrains Mono', monospace";
    const row = (label, value, ok, y) => {
      ctx.fillStyle = '#6e8099';
      ctx.fillText(label, 18, y);
      ctx.fillStyle = ok ? '#7dffb0' : '#ff5050';
      ctx.fillText(value, 92, y);
    };
    row('ALT', `${alt} m`, true, 30);
    row('V/S', `${vs > 0 ? '+' : ''}${vs}`, Math.abs(vs) <= SAFE_VY, 50);
    row('H/S', `${hs > 0 ? '+' : ''}${hs}`, Math.abs(hs) <= SAFE_VX, 70);
    row('TILT', `${Math.round((l.angle * 180) / Math.PI)}°`, angOk, 90);
    if (this.windMax) {
      const w = Math.round(this.wind || 0);
      ctx.fillStyle = '#6e8099';
      ctx.fillText('WIND', 18, 110);
      ctx.fillStyle = '#ffb24a';
      ctx.fillText(`${w < 0 ? '◄' : '►'} ${Math.abs(w)}`, 92, 110);
    }

    // fuel gauge
    const fw = 180;
    const fx = W - fw - 18;
    const frac = l.fuel / 100;
    const low = l.fuel < 25;
    ctx.fillStyle = '#6e8099';
    ctx.fillText('FUEL', fx - 46, 30);
    ctx.strokeStyle = 'rgba(0,240,255,0.4)';
    ctx.strokeRect(fx, 18, fw, 14);
    ctx.fillStyle = low
      ? Math.sin(this.time * 8) > 0 ? '#ff5050' : '#7a1020'
      : '#00f0ff';
    ctx.fillRect(fx + 2, 20, (fw - 4) * frac, 10);
  }

  _drawVignette(ctx) {
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.85);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }
}
