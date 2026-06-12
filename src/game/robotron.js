// ============================================================
//  ROBO-RAID 2084  —  a faithful Robotron-style twin-stick
//  shooter, written from scratch on the HTML5 Canvas.
//
//  No copyrighted assets or code — all original vector art and
//  game logic. Mechanics modelled on the 1982 arcade classic:
//  move with one hand, shoot in 8 directions with the other,
//  rescue the humans, survive the waves.
//
//  Controls:  WASD / move        Arrow keys / shoot
//             P    / pause        Enter / start · respawn
//
//  Usage (see RobotronPage.jsx):
//    const game = new RobotronGame(canvas, { onState });
//    game.start();  ...  game.destroy();
// ============================================================

// Fixed virtual resolution — game logic runs in these coords,
// CSS scales the canvas element to fit its container.
export const VW = 900;
export const VH = 680;
const MARGIN = 26; // arena inset (play-area border)

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const dist2 = (ax, ay, bx, by) => {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
};

// escalating human-rescue bonus, resets each wave (1k..5k)
const RESCUE_BONUS = [1000, 2000, 3000, 4000, 5000];
const EXTRA_LIFE_EVERY = 25000;

export class RobotronGame {
  constructor(canvas, { onState } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onState = onState || (() => {});
    canvas.width = VW;
    canvas.height = VH;

    this.keys = new Set();
    this.touch = { move: null, aim: null }; // {x,y} unit vectors from touch sticks

    // bound handlers so we can remove them later
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._loop = this._loop.bind(this);

    this.highScore = Number(localStorage.getItem('robotron-hi') || 0);
    this._resetGame();
    this.status = 'ready'; // ready | playing | paused | dying | gameover
    this._raf = 0;
    this._last = 0;
    this._emit();
  }

  // ---- lifecycle -------------------------------------------------
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

  // Called by the React UI (button / Enter key).
  beginRun() {
    this._resetGame();
    this.status = 'playing';
    this._spawnWave();
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

  // ---- touch sticks (mobile), set from React ---------------------
  setTouch(kind, vec) {
    this.touch[kind] = vec;
  }

  // ---- state -----------------------------------------------------
  _resetGame() {
    this.score = 0;
    this.lives = 3;
    this.wave = 0;
    this.nextExtra = EXTRA_LIFE_EVERY;
    this.rescueIdx = 0;
    this._clearEntities();
    this.player = this._makePlayer();
    this._fireCooldown = 0;
    this._respawnTimer = 0;
    this._waveBanner = 0;
  }

  _clearEntities() {
    this.bullets = [];
    this.enemyShots = [];
    this.grunts = [];
    this.hulks = [];
    this.brains = [];
    this.electrodes = [];
    this.humans = [];
    this.particles = [];
    this.floaters = []; // score popups
  }

  _makePlayer() {
    // brief spawn invulnerability so you don't die instantly to an enemy
    // that happens to be standing on the centre spawn point
    return { x: VW / 2, y: VH / 2, r: 12, speed: 230, alive: true, aim: { x: 0, y: -1 }, invuln: 1.6 };
  }

  _emit() {
    this.onState({
      status: this.status,
      score: this.score,
      lives: this.lives,
      wave: this.wave,
      highScore: this.highScore,
    });
  }

  // ---- input -----------------------------------------------------
  _onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (
      ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd', 'p'].includes(k)
    ) {
      e.preventDefault();
    }
    if (k === 'p' && (this.status === 'playing' || this.status === 'paused')) {
      this.togglePause();
      return;
    }
    if (k === 'enter') {
      if (this.status === 'ready' || this.status === 'gameover') this.beginRun();
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

  _moveVector() {
    let x = 0;
    let y = 0;
    if (this.keys.has('a')) x -= 1;
    if (this.keys.has('d')) x += 1;
    if (this.keys.has('w')) y -= 1;
    if (this.keys.has('s')) y += 1;
    if (this.touch.move) {
      x += this.touch.move.x;
      y += this.touch.move.y;
    }
    const m = Math.hypot(x, y);
    return m > 0 ? { x: x / m, y: y / m } : null;
  }

  _aimVector() {
    let x = 0;
    let y = 0;
    if (this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('arrowright')) x += 1;
    if (this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('arrowdown')) y += 1;
    if (this.touch.aim) {
      x += this.touch.aim.x;
      y += this.touch.aim.y;
    }
    const m = Math.hypot(x, y);
    return m > 0 ? { x: x / m, y: y / m } : null;
  }

  // ---- waves -----------------------------------------------------
  _spawnWave() {
    this.wave += 1;
    this.rescueIdx = 0;
    this._clearEntities();
    this.player = this._makePlayer();
    this._waveBanner = 2.2;
    const w = this.wave;

    const gruntCount = Math.min(8 + w * 3, 40);
    for (let i = 0; i < gruntCount; i++) this.grunts.push(this._spawnAway('grunt'));

    const hulkCount = Math.min(Math.floor(w / 2), 6);
    for (let i = 0; i < hulkCount; i++) this.hulks.push(this._spawnAway('hulk'));

    const brainCount = w >= 3 ? Math.min(Math.floor((w - 1) / 2), 6) : 0;
    for (let i = 0; i < brainCount; i++) this.brains.push(this._spawnAway('brain'));

    const elecCount = Math.min(3 + w, 12);
    for (let i = 0; i < elecCount; i++) this.electrodes.push(this._spawnAway('electrode'));

    const humanCount = clamp(2 + Math.floor(w / 2), 2, 7);
    for (let i = 0; i < humanCount; i++) this.humans.push(this._spawnAway('human'));

    this._emit();
  }

  // spawn an entity at a random point a safe distance from the player
  _spawnAway(type) {
    let x;
    let y;
    let tries = 0;
    do {
      x = rand(MARGIN + 30, VW - MARGIN - 30);
      y = rand(MARGIN + 30, VH - MARGIN - 30);
      tries++;
    } while (dist2(x, y, this.player.x, this.player.y) < 150 * 150 && tries < 40);

    switch (type) {
      case 'grunt':
        return { x, y, r: 11, speed: rand(46, 60) + this.wave * 2.5, t: rand(0, 6) };
      case 'hulk':
        return { x, y, r: 18, dir: { x: 0, y: 0 }, stepT: 0, hitFlash: 0 };
      case 'brain':
        return { x, y, r: 13, speed: 48, fireT: rand(1, 3), target: null };
      case 'electrode':
        return { x, y, r: 13, spin: rand(0, Math.PI), kind: Math.floor(rand(0, 3)) };
      case 'human':
        return {
          x,
          y,
          r: 10,
          speed: 32,
          dir: rand(0, Math.PI * 2),
          changeT: rand(0.5, 2),
          kind: Math.floor(rand(0, 3)), // mommy / daddy / mikey
        };
      default:
        return { x, y, r: 10 };
    }
  }

  // ---- main loop -------------------------------------------------
  _loop(now) {
    this._raf = requestAnimationFrame(this._loop);
    let dt = (now - this._last) / 1000;
    this._last = now;
    if (dt > 0.05) dt = 0.05; // clamp big frame gaps (tab switch)

    if (this.status === 'playing' || this.status === 'dying') {
      this._update(dt);
    }
    this._render();
  }

  _update(dt) {
    if (this._waveBanner > 0) this._waveBanner -= dt;

    // ----- respawn pause after death -----
    if (this.status === 'dying') {
      this._respawnTimer -= dt;
      this._updateParticles(dt);
      this._updateFloaters(dt);
      if (this._respawnTimer <= 0) {
        if (this.lives <= 0) {
          this.status = 'gameover';
          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('robotron-hi', String(this.score));
          }
          this._emit();
        } else {
          this.player = this._makePlayer();
          this.status = 'playing';
          this._emit();
        }
      }
      return;
    }

    this._updatePlayer(dt);
    this._updateBullets(dt);
    this._updateGrunts(dt);
    this._updateHulks(dt);
    this._updateBrains(dt);
    this._updateEnemyShots(dt);
    this._updateElectrodes(dt);
    this._updateHumans(dt);
    this._updateParticles(dt);
    this._updateFloaters(dt);

    // ----- wave clear: all must-kill enemies gone -----
    if (this.grunts.length === 0 && this.brains.length === 0 && this.status === 'playing') {
      this._spawnWave();
    }
  }

  _updatePlayer(dt) {
    const p = this.player;
    if (p.invuln > 0) p.invuln -= dt;
    const mv = this._moveVector();
    if (mv) {
      p.x = clamp(p.x + mv.x * p.speed * dt, MARGIN + p.r, VW - MARGIN - p.r);
      p.y = clamp(p.y + mv.y * p.speed * dt, MARGIN + p.r, VH - MARGIN - p.r);
    }

    // fire
    this._fireCooldown -= dt;
    const aim = this._aimVector();
    if (aim) {
      p.aim = aim;
      if (this._fireCooldown <= 0) {
        this._fireCooldown = 0.11;
        const sp = 620;
        this.bullets.push({
          x: p.x + aim.x * p.r,
          y: p.y + aim.y * p.r,
          vx: aim.x * sp,
          vy: aim.y * sp,
          life: 1.4,
        });
      }
    }
  }

  _updateBullets(dt) {
    for (const b of this.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.x < MARGIN || b.x > VW - MARGIN || b.y < MARGIN || b.y > VH - MARGIN) b.life = 0;
    }

    // bullet vs enemies
    for (const b of this.bullets) {
      if (b.life <= 0) continue;

      for (let i = this.grunts.length - 1; i >= 0; i--) {
        const g = this.grunts[i];
        if (dist2(b.x, b.y, g.x, g.y) < (g.r + 3) ** 2) {
          this.grunts.splice(i, 1);
          this._explode(g.x, g.y, '#ff3cf0');
          this._addScore(100, g.x, g.y);
          b.life = 0;
          break;
        }
      }
      if (b.life <= 0) continue;

      for (let i = this.brains.length - 1; i >= 0; i--) {
        const br = this.brains[i];
        if (dist2(b.x, b.y, br.x, br.y) < (br.r + 3) ** 2) {
          this.brains.splice(i, 1);
          this._explode(br.x, br.y, '#ff5050');
          this._addScore(500, br.x, br.y);
          b.life = 0;
          break;
        }
      }
      if (b.life <= 0) continue;

      for (let i = this.electrodes.length - 1; i >= 0; i--) {
        const el = this.electrodes[i];
        if (dist2(b.x, b.y, el.x, el.y) < (el.r + 3) ** 2) {
          this.electrodes.splice(i, 1);
          this._explode(el.x, el.y, '#00f0ff');
          this._addScore(25, el.x, el.y);
          b.life = 0;
          break;
        }
      }
      if (b.life <= 0) continue;

      // hulks are indestructible — bullets knock them back slightly
      for (const h of this.hulks) {
        if (dist2(b.x, b.y, h.x, h.y) < (h.r + 3) ** 2) {
          h.x = clamp(h.x + Math.sign(b.vx) * 5, MARGIN + h.r, VW - MARGIN - h.r);
          h.y = clamp(h.y + Math.sign(b.vy) * 5, MARGIN + h.r, VH - MARGIN - h.r);
          h.hitFlash = 0.12;
          b.life = 0;
          break;
        }
      }
    }
    this.bullets = this.bullets.filter((b) => b.life > 0);
  }

  _updateGrunts(dt) {
    const p = this.player;
    for (const g of this.grunts) {
      g.t += dt;
      // home toward the player with a touch of waver
      const ang = Math.atan2(p.y - g.y, p.x - g.x) + Math.sin(g.t * 3) * 0.25;
      g.x += Math.cos(ang) * g.speed * dt;
      g.y += Math.sin(ang) * g.speed * dt;
      g.x = clamp(g.x, MARGIN + g.r, VW - MARGIN - g.r);
      g.y = clamp(g.y, MARGIN + g.r, VH - MARGIN - g.r);

      // grunt walks into an electrode -> dies
      for (let i = this.electrodes.length - 1; i >= 0; i--) {
        const el = this.electrodes[i];
        if (dist2(g.x, g.y, el.x, el.y) < (g.r + el.r) ** 2) {
          this._explode(g.x, g.y, '#ff3cf0');
          g.dead = true;
          break;
        }
      }
      if (!g.dead && this._touchPlayer(g)) this._killPlayer();
    }
    this.grunts = this.grunts.filter((g) => !g.dead);
  }

  _updateHulks(dt) {
    for (const h of this.hulks) {
      if (h.hitFlash > 0) h.hitFlash -= dt;
      // hulks lumber toward the nearest human (or wander), killing humans on contact
      h.stepT -= dt;
      if (h.stepT <= 0) {
        h.stepT = rand(0.4, 0.9);
        const target = this._nearest(this.humans, h);
        if (target) {
          const a = Math.atan2(target.y - h.y, target.x - h.x);
          h.dir = { x: Math.cos(a), y: Math.sin(a) };
        } else {
          const a = rand(0, Math.PI * 2);
          h.dir = { x: Math.cos(a), y: Math.sin(a) };
        }
      }
      const hs = 42;
      h.x = clamp(h.x + h.dir.x * hs * dt, MARGIN + h.r, VW - MARGIN - h.r);
      h.y = clamp(h.y + h.dir.y * hs * dt, MARGIN + h.r, VH - MARGIN - h.r);

      for (let i = this.humans.length - 1; i >= 0; i--) {
        const hm = this.humans[i];
        if (dist2(h.x, h.y, hm.x, hm.y) < (h.r + hm.r) ** 2) {
          this.humans.splice(i, 1);
          this._explode(hm.x, hm.y, '#ff9f1c');
        }
      }
      if (this._touchPlayer(h)) this._killPlayer();
    }
  }

  _updateBrains(dt) {
    const p = this.player;
    for (const br of this.brains) {
      // hunt the nearest human; if none, drift toward player
      const target = this._nearest(this.humans, br);
      const tx = target ? target.x : p.x;
      const ty = target ? target.y : p.y;
      const a = Math.atan2(ty - br.y, tx - br.x);
      br.x += Math.cos(a) * br.speed * dt;
      br.y += Math.sin(a) * br.speed * dt;
      br.x = clamp(br.x, MARGIN + br.r, VW - MARGIN - br.r);
      br.y = clamp(br.y, MARGIN + br.r, VH - MARGIN - br.r);

      // reach a human -> it's lost
      if (target && dist2(br.x, br.y, target.x, target.y) < (br.r + target.r) ** 2) {
        this.humans = this.humans.filter((h) => h !== target);
        this._explode(target.x, target.y, '#ff5050');
      }

      // fire a cruise shot at the player
      br.fireT -= dt;
      if (br.fireT <= 0) {
        br.fireT = rand(1.6, 2.8);
        const fa = Math.atan2(p.y - br.y, p.x - br.x);
        const ss = 150;
        this.enemyShots.push({ x: br.x, y: br.y, vx: Math.cos(fa) * ss, vy: Math.sin(fa) * ss, r: 5, life: 5 });
      }

      if (this._touchPlayer(br)) this._killPlayer();
    }
  }

  _updateEnemyShots(dt) {
    for (const s of this.enemyShots) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.x < MARGIN || s.x > VW - MARGIN || s.y < MARGIN || s.y > VH - MARGIN) s.life = 0;
      if (this._touchPlayer(s)) {
        s.life = 0;
        this._killPlayer();
      }
    }
    this.enemyShots = this.enemyShots.filter((s) => s.life > 0);
  }

  _updateElectrodes(dt) {
    for (const el of this.electrodes) {
      el.spin += dt * 1.5;
      if (this._touchPlayer(el)) this._killPlayer();
    }
  }

  _updateHumans(dt) {
    const p = this.player;
    for (let i = this.humans.length - 1; i >= 0; i--) {
      const h = this.humans[i];
      h.changeT -= dt;
      if (h.changeT <= 0) {
        h.changeT = rand(0.6, 2);
        h.dir = rand(0, Math.PI * 2);
      }
      h.x = clamp(h.x + Math.cos(h.dir) * h.speed * dt, MARGIN + h.r, VW - MARGIN - h.r);
      h.y = clamp(h.y + Math.sin(h.dir) * h.speed * dt, MARGIN + h.r, VH - MARGIN - h.r);

      // rescue!
      if (dist2(h.x, h.y, p.x, p.y) < (h.r + p.r) ** 2) {
        this.humans.splice(i, 1);
        const bonus = RESCUE_BONUS[Math.min(this.rescueIdx, RESCUE_BONUS.length - 1)];
        this.rescueIdx++;
        this._addScore(bonus, h.x, h.y, true);
        this._explode(h.x, h.y, '#ffd24a');
      }
    }
  }

  _updateParticles(dt) {
    for (const pt of this.particles) {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= 0.93;
      pt.vy *= 0.93;
      pt.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  _updateFloaters(dt) {
    for (const f of this.floaters) {
      f.y -= 26 * dt;
      f.life -= dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
  }

  // ---- helpers ---------------------------------------------------
  _touchPlayer(e) {
    const p = this.player;
    if (!p.alive || p.invuln > 0) return false;
    return dist2(e.x, e.y, p.x, p.y) < (e.r + p.r * 0.7) ** 2;
  }

  _nearest(list, from) {
    let best = null;
    let bd = Infinity;
    for (const it of list) {
      const d = dist2(it.x, it.y, from.x, from.y);
      if (d < bd) {
        bd = d;
        best = it;
      }
    }
    return best;
  }

  _addScore(n, x, y, big = false) {
    this.score += n;
    this.floaters.push({ x, y, text: big ? `+${n}` : `${n}`, life: big ? 1.4 : 0.8, big });
    if (this.score >= this.nextExtra) {
      this.lives += 1;
      this.nextExtra += EXTRA_LIFE_EVERY;
    }
    this._emit();
  }

  _explode(x, y, color) {
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand(-0.3, 0.3);
      const sp = rand(60, 260);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: rand(0.3, 0.7),
        color,
      });
    }
  }

  _killPlayer() {
    if (!this.player.alive || this.status !== 'playing') return;
    this.player.alive = false;
    this.lives -= 1;
    this._explode(this.player.x, this.player.y, '#00f0ff');
    this.status = 'dying';
    this._respawnTimer = 1.4;
    this._emit();
  }

  // ---- rendering -------------------------------------------------
  _render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, VW, VH);

    // background grid
    ctx.fillStyle = '#04070d';
    ctx.fillRect(0, 0, VW, VH);
    ctx.strokeStyle = 'rgba(0,240,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = MARGIN; x <= VW - MARGIN; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, MARGIN);
      ctx.lineTo(x, VH - MARGIN);
      ctx.stroke();
    }
    for (let y = MARGIN; y <= VH - MARGIN; y += 40) {
      ctx.beginPath();
      ctx.moveTo(MARGIN, y);
      ctx.lineTo(VW - MARGIN, y);
      ctx.stroke();
    }

    // arena border (glowing)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.strokeRect(MARGIN, MARGIN, VW - MARGIN * 2, VH - MARGIN * 2);
    ctx.shadowBlur = 0;

    if (this.status === 'ready') return; // overlay handles the menu

    // entities
    this._drawElectrodes(ctx);
    this._drawHumans(ctx);
    this._drawParticles(ctx);
    for (const h of this.hulks) this._drawHulk(ctx, h);
    for (const g of this.grunts) this._drawGrunt(ctx, g);
    for (const br of this.brains) this._drawBrain(ctx, br);
    this._drawEnemyShots(ctx);
    this._drawBullets(ctx);
    if (this.player.alive && (this.status === 'playing' || this.status === 'paused')) {
      this._drawPlayer(ctx, this.player);
    }
    this._drawFloaters(ctx);

    if (this._waveBanner > 0 && this.status === 'playing') {
      ctx.globalAlpha = clamp(this._waveBanner, 0, 1);
      ctx.fillStyle = '#ff9f1c';
      ctx.font = '900 46px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`WAVE ${this.wave}`, VW / 2, VH / 2);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }
  }

  _drawPlayer(ctx, p) {
    // blink during spawn invulnerability
    if (p.invuln > 0 && Math.floor(p.invuln * 12) % 2 === 0) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 14;
    // body
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(-6, -8, 12, 16);
    // head
    ctx.fillStyle = '#bdfcff';
    ctx.fillRect(-4, -13, 8, 6);
    // legs
    ctx.fillStyle = '#0098b3';
    ctx.fillRect(-6, 8, 4, 5);
    ctx.fillRect(2, 8, 4, 5);
    // gun pointing along aim
    ctx.rotate(Math.atan2(p.aim.y, p.aim.x));
    ctx.fillStyle = '#ff9f1c';
    ctx.fillRect(6, -2, 12, 4);
    ctx.restore();
  }

  _drawGrunt(ctx, g) {
    ctx.save();
    ctx.translate(g.x, g.y);
    const bob = Math.sin(g.t * 8) * 2;
    ctx.shadowColor = '#ff3cf0';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff3cf0';
    ctx.fillRect(-7, -8 + bob * 0, 14, 14);
    ctx.fillStyle = '#ff9cf7';
    ctx.fillRect(-5, -13, 10, 6); // head
    ctx.fillStyle = '#c01fb0';
    ctx.fillRect(-7, 6, 5, 5 + bob); // legs bob
    ctx.fillRect(2, 6, 5, 5 - bob);
    ctx.restore();
  }

  _drawHulk(ctx, h) {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.shadowColor = '#33ff77';
    ctx.shadowBlur = 10;
    ctx.fillStyle = h.hitFlash > 0 ? '#d6ffe4' : '#2bd968';
    ctx.fillRect(-15, -16, 30, 32);
    ctx.fillStyle = '#0c3d1f';
    ctx.fillRect(-15, -16, 30, 32);
    ctx.strokeStyle = h.hitFlash > 0 ? '#ffffff' : '#33ff77';
    ctx.lineWidth = 3;
    ctx.strokeRect(-15, -16, 30, 32);
    // eyes
    ctx.fillStyle = '#aaffcc';
    ctx.fillRect(-9, -8, 6, 5);
    ctx.fillRect(3, -8, 6, 5);
    ctx.restore();
  }

  _drawBrain(ctx, br) {
    ctx.save();
    ctx.translate(br.x, br.y);
    ctx.shadowColor = '#ff5050';
    ctx.shadowBlur = 10;
    // body
    ctx.fillStyle = '#7a1020';
    ctx.fillRect(-8, -2, 16, 14);
    // brain dome
    ctx.fillStyle = '#ff5050';
    ctx.beginPath();
    ctx.arc(0, -4, 9, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#ffb0b0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(0, -2);
    ctx.stroke();
    ctx.restore();
  }

  _drawElectrodes(ctx) {
    for (const el of this.electrodes) {
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate(el.spin);
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#00f0ff';
      ctx.fillStyle = 'rgba(0,240,255,0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (el.kind === 0) {
        // diamond
        ctx.moveTo(0, -el.r);
        ctx.lineTo(el.r, 0);
        ctx.lineTo(0, el.r);
        ctx.lineTo(-el.r, 0);
        ctx.closePath();
      } else if (el.kind === 1) {
        // x-cross
        for (let i = 0; i < 4; i++) {
          ctx.moveTo(0, 0);
          const a = (i / 4) * Math.PI * 2;
          ctx.lineTo(Math.cos(a) * el.r, Math.sin(a) * el.r);
        }
      } else {
        // triangle
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
          if (i === 0) ctx.moveTo(Math.cos(a) * el.r, Math.sin(a) * el.r);
          else ctx.lineTo(Math.cos(a) * el.r, Math.sin(a) * el.r);
        }
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawHumans(ctx) {
    const palette = ['#ffd24a', '#ffb0e0', '#9fe0ff']; // mommy / daddy / mikey
    for (const h of this.humans) {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.shadowColor = '#ffd24a';
      ctx.shadowBlur = 6;
      const c = palette[h.kind] || '#ffd24a';
      ctx.fillStyle = c;
      ctx.fillRect(-3, -8, 6, 9); // body
      ctx.beginPath();
      ctx.arc(0, -10, 3, 0, Math.PI * 2); // head
      ctx.fill();
      ctx.fillRect(-3, 1, 2, 6); // legs
      ctx.fillRect(1, 1, 2, 6);
      ctx.restore();
    }
  }

  _drawBullets(ctx) {
    ctx.save();
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    for (const b of this.bullets) {
      const len = 10;
      const m = Math.hypot(b.vx, b.vy) || 1;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - (b.vx / m) * len, b.y - (b.vy / m) * len);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawEnemyShots(ctx) {
    ctx.save();
    ctx.shadowColor = '#ff5050';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff5050';
    for (const s of this.enemyShots) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = clamp(p.life * 2, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
  }

  _drawFloaters(ctx) {
    ctx.textAlign = 'center';
    for (const f of this.floaters) {
      ctx.globalAlpha = clamp(f.life * 1.5, 0, 1);
      ctx.fillStyle = f.big ? '#ffd24a' : '#9fe0ff';
      ctx.font = `${f.big ? 700 : 500} ${f.big ? 20 : 14}px 'JetBrains Mono', monospace`;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }
}
