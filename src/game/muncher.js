// ============================================================
//  MUNCH PROTOCOL — a maze-chase arcade tribute (1980 style).
//
//  All original code, art, and maze layout — no copyrighted
//  assets. Mechanics modelled on the classic: eat every pellet,
//  energizers turn the tables, four ghosts each with their own
//  hunting personality (pursuer / ambusher / flanker / wanderer),
//  scatter–chase cycles, a wrap-around tunnel, and bonus fruit.
//
//  Controls:  Arrow keys or WASD / steer    P / pause    Enter / start
// ============================================================

export const W = 630;
export const H = 690;

const T = 30; // tile size px
const COLS = 21;
const ROWS = 23;

// Original maze design. # wall · . pellet · o energizer ·
// (space) open corridor · - ghost-pen door · G pen interior.
// Row 12 is the wrap-around tunnel.
export const MAZE = [
  '#####################',
  '#o........#........o#',
  '#.###.###.#.###.###.#',
  '#...................#',
  '###.#.#########.#.###',
  '#...#.....#.....#...#',
  '#.#.#####.#.#####.#.#',
  '#.#.#...........#.#.#',
  '######.###-###.######',
  '######.#GGGGG#.######',
  '######.#GGGGG#.######',
  '######.#######.######',
  '                     ',
  '####.#####.#####.####',
  '#...................#',
  '#.###.###.#.###.###.#',
  '#o..#.....#.....#..o#',
  '##.#.#####.#####.#.##',
  '#....#.........#....#',
  '#.##.#.#######.#.##.#',
  '#...................#',
  '#.#######.#.#######.#',
  '#####################',
];

const TUNNEL_ROW = 12;
const EXIT_TILE = { c: 10, r: 7 }; // tile just above the pen door
const PEN_Y = 10 * T; // resting y for ghosts inside the pen
const PLAYER_SPAWN = { c: 10, r: 18 };
const FRUIT_TILE = { c: 10, r: 14 };

const DIRS = [
  { x: 0, y: -1 }, // up
  { x: -1, y: 0 }, // left
  { x: 0, y: 1 }, // down
  { x: 1, y: 0 }, // right
];

// scatter–chase schedule (seconds); last chase runs forever
const MODE_SCHEDULE = [
  ['scatter', 7], ['chase', 20], ['scatter', 7], ['chase', 20],
  ['scatter', 5], ['chase', 20], ['scatter', 5], ['chase', Infinity],
];

const GHOSTS = [
  { name: 'pursuer', color: '#ff4f5e', scatter: { c: 19, r: 1 }, release: 0, penCol: 10 },
  { name: 'ambusher', color: '#ff9fdc', scatter: { c: 1, r: 1 }, release: 1.5, penCol: 9 },
  { name: 'flanker', color: '#00e8ff', scatter: { c: 19, r: 21 }, release: 4, penCol: 11 },
  { name: 'wanderer', color: '#ffb24a', scatter: { c: 1, r: 21 }, release: 7, penCol: 10 },
];

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

function cellAt(c, r) {
  if (r === TUNNEL_ROW && (c < 0 || c >= COLS)) return ' '; // virtual tunnel
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return '#';
  return MAZE[r][c];
}
const openForPlayer = (c, r) => ' .o'.includes(cellAt(c, r));
const openForGhost = (c, r) => ' .o'.includes(cellAt(c, r));

export class MuncherGame {
  constructor(canvas, { onState } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onState = onState || (() => {});
    canvas.width = W;
    canvas.height = H;

    this.keys = new Set();
    this.touch = { move: null };
    this.wantDir = null;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._loop = this._loop.bind(this);

    this.highScore = Number(localStorage.getItem('arcade-hi-muncher') || 0);
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

  setTouch(kind, vec) {
    this.touch[kind] = vec;
    if (kind === 'move' && vec) {
      this.wantDir =
        Math.abs(vec.x) > Math.abs(vec.y)
          ? { x: Math.sign(vec.x), y: 0 }
          : { x: 0, y: Math.sign(vec.y) };
    }
  }

  // ---- setup -----------------------------------------------------
  _resetGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.extraAwarded = false;
    this._buildLevel();
  }

  _buildLevel() {
    // pellet map: 0 none · 1 pellet · 2 energizer
    this.pellets = [];
    this.pelletCount = 0;
    for (let r = 0; r < ROWS; r++) {
      const row = new Uint8Array(COLS);
      for (let c = 0; c < COLS; c++) {
        const ch = MAZE[r][c];
        if (ch === '.') { row[c] = 1; this.pelletCount++; }
        else if (ch === 'o') { row[c] = 2; this.pelletCount++; }
      }
      this.pellets.push(row);
    }
    this.dotsEaten = 0;
    this.fruit = null;
    this.fruitShown = 0;
    this.floaters = [];
    this._resetActors();
  }

  _resetActors() {
    this.player = {
      x: (PLAYER_SPAWN.c + 0.5) * T,
      y: (PLAYER_SPAWN.r + 0.5) * T,
      tc: PLAYER_SPAWN.c,
      tr: PLAYER_SPAWN.r,
      dir: { x: 0, y: 0 },
      mouth: 0,
    };
    this.wantDir = null;
    this.ghosts = GHOSTS.map((def, i) => ({
      ...def,
      idx: i,
      x: (def.penCol + 0.5) * T,
      y: i === 0 ? (EXIT_TILE.r + 0.5) * T : PEN_Y,
      tc: def.penCol,
      tr: EXIT_TILE.r,
      dir: { x: i === 0 ? -1 : 0, y: 0 },
      state: i === 0 ? 'normal' : 'pen', // pen | exit | normal | eyes | enter
      releaseT: def.release,
      frightened: false,
      bob: rand(0, Math.PI * 2),
    }));
    // pursuer starts just outside the door, heading left
    this.ghosts[0].x = (EXIT_TILE.c + 0.5) * T;
    this.ghosts[0].tc = EXIT_TILE.c;

    this.modeIdx = 0;
    this.modeT = MODE_SCHEDULE[0][1];
    this.frightT = 0;
    this.eatChain = 0;
    this.readyT = 1.6;
    this.clearT = 0;
    this.deathT = 0;
    this.banner = `LEVEL ${this.level}`;
  }

  _speedMult() {
    return Math.min(1 + (this.level - 1) * 0.05, 1.35);
  }

  _emit() {
    this.onState({
      status: this.status,
      score: this.score,
      lives: this.lives,
      wave: this.level,
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
    const map = {
      arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 },
      arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
      arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
      arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 },
    };
    if (map[k]) this.wantDir = map[k];
    this.keys.add(k);
  }

  _onKeyUp(e) {
    this.keys.delete(e.key.toLowerCase());
  }

  _onBlur() {
    this.keys.clear();
    if (this.status === 'playing') this.togglePause();
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
    this._updateFloaters(dt);

    if (this.status === 'dying') {
      this.deathT -= dt;
      if (this.deathT <= 0) {
        if (this.lives <= 0) {
          this.status = 'gameover';
          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('arcade-hi-muncher', String(this.score));
          }
        } else {
          this._respawnAfterDeath();
          this.status = 'playing';
        }
        this._emit();
      }
      return;
    }

    if (this.readyT > 0) { this.readyT -= dt; return; }
    if (this.clearT > 0) {
      this.clearT -= dt;
      if (this.clearT <= 0) {
        this.level += 1;
        this._buildLevel();
        this._emit();
      }
      return;
    }

    // scatter / chase clock (paused during fright)
    if (this.frightT > 0) {
      this.frightT -= dt;
      if (this.frightT <= 0) {
        for (const g of this.ghosts) g.frightened = false;
        this.eatChain = 0;
      }
    } else if (this.modeT !== Infinity) {
      this.modeT -= dt;
      if (this.modeT <= 0) {
        this.modeIdx = Math.min(this.modeIdx + 1, MODE_SCHEDULE.length - 1);
        this.modeT = MODE_SCHEDULE[this.modeIdx][1];
        for (const g of this.ghosts) {
          if (g.state === 'normal') this._retarget(g, { x: -g.dir.x, y: -g.dir.y });
        }
      }
    }

    this._updatePlayer(dt);
    this._updateGhosts(dt);
    this._updateFruit(dt);
    this._checkGhostCollisions();
  }

  // ---- grid movement core ---------------------------------------
  // Entities head toward the centre of a target tile (tc,tr); on
  // arrival `choose` picks the next direction from that tile.
  _moveGrid(e, speed, dt, choose) {
    let rem = speed * dt;
    let guard = 0;
    while (rem > 0.001 && guard++ < 6) {
      const tx = (e.tc + 0.5) * T;
      const ty = (e.tr + 0.5) * T;
      const d = Math.abs(tx - e.x) + Math.abs(ty - e.y);
      if (d <= rem) {
        e.x = tx;
        e.y = ty;
        rem -= d;
        const nd = choose(e.tc, e.tr, e.dir);
        if (!nd) { e.dir = { x: 0, y: 0 }; return; }
        e.dir = nd;
        let nc = e.tc + nd.x;
        const nr = e.tr + nd.y;
        // tunnel wrap
        if (nr === TUNNEL_ROW) {
          if (nc < 0) { nc = COLS - 1; e.x += COLS * T; }
          else if (nc >= COLS) { nc = 0; e.x -= COLS * T; }
        }
        e.tc = nc;
        e.tr = nr;
      } else {
        e.x += Math.sign(tx - e.x) * Math.min(rem, Math.abs(tx - e.x));
        e.y += Math.sign(ty - e.y) * Math.min(rem, Math.abs(ty - e.y));
        rem = 0;
      }
    }
  }

  // re-aim an entity mid-corridor (instant reversal, mode flips)
  _retarget(e, nd) {
    const c = Math.floor(e.x / T);
    const r = Math.floor(e.y / T);
    const cx = (c + 0.5) * T;
    const cy = (r + 0.5) * T;
    let tc = c;
    let tr = r;
    if (nd.x > 0 && e.x > cx) tc = c + 1;
    if (nd.x < 0 && e.x < cx) tc = c - 1;
    if (nd.y > 0 && e.y > cy) tr = r + 1;
    if (nd.y < 0 && e.y < cy) tr = r - 1;
    e.dir = nd;
    e.tc = clamp(tc, -1, COLS);
    e.tr = clamp(tr, 0, ROWS - 1);
  }

  // ---- player ----------------------------------------------------
  _updatePlayer(dt) {
    const p = this.player;
    // instant reversal
    if (
      this.wantDir && (p.dir.x || p.dir.y) &&
      this.wantDir.x === -p.dir.x && this.wantDir.y === -p.dir.y
    ) {
      this._retarget(p, this.wantDir);
    }

    const speed = 150 * this._speedMult();
    this._moveGrid(p, speed, dt, (c, r, dir) => {
      const w = this.wantDir;
      if (w && openForPlayer(c + w.x, r + w.y)) return w;
      if ((dir.x || dir.y) && openForPlayer(c + dir.x, r + dir.y)) return dir;
      return null;
    });
    if (p.dir.x || p.dir.y) p.mouth += dt * 10;

    // eat pellets
    const c = Math.floor(p.x / T);
    const r = Math.floor(p.y / T);
    if (c >= 0 && c < COLS && r >= 0 && r < ROWS && this.pellets[r][c]) {
      const cx = (c + 0.5) * T;
      const cy = (r + 0.5) * T;
      if (Math.abs(p.x - cx) < 8 && Math.abs(p.y - cy) < 8) {
        const kind = this.pellets[r][c];
        this.pellets[r][c] = 0;
        this.pelletCount--;
        this.dotsEaten++;
        this._addScore(kind === 2 ? 50 : 10);
        if (kind === 2) this._startFright();
        if ((this.dotsEaten === 70 || this.dotsEaten === 170) && !this.fruit) {
          this.fruit = { t: 9, value: 100 * Math.min(this.level, 5) };
        }
        if (this.pelletCount <= 0) this._levelClear();
      }
    }

    // fruit
    if (this.fruit) {
      const fx = (FRUIT_TILE.c + 0.5) * T;
      const fy = (FRUIT_TILE.r + 0.5) * T;
      if (Math.abs(p.x - fx) < 14 && Math.abs(p.y - fy) < 14) {
        this._addScore(this.fruit.value, fx, fy, true);
        this.fruit = null;
      }
    }
  }

  _startFright() {
    this.frightT = Math.max(6.5 - this.level * 0.5, 2);
    this.eatChain = 0;
    for (const g of this.ghosts) {
      if (g.state === 'normal') {
        g.frightened = true;
        this._retarget(g, { x: -g.dir.x, y: -g.dir.y });
      } else if (g.state === 'pen' || g.state === 'exit') {
        g.frightened = true;
      }
    }
  }

  _levelClear() {
    this.clearT = 2.2;
    this.banner = 'CLEARED!';
  }

  // ---- ghosts ----------------------------------------------------
  _ghostTarget(g) {
    const p = this.player;
    const pc = Math.floor(p.x / T);
    const pr = Math.floor(p.y / T);
    const mode = MODE_SCHEDULE[this.modeIdx][0];
    if (g.state === 'eyes') return EXIT_TILE;
    if (mode === 'scatter') return g.scatter;
    switch (g.name) {
      case 'pursuer':
        return { c: pc, r: pr };
      case 'ambusher':
        return { c: pc + p.dir.x * 4, r: pr + p.dir.y * 4 };
      case 'flanker': {
        const lead = { c: pc + p.dir.x * 2, r: pr + p.dir.y * 2 };
        const red = this.ghosts[0];
        const rc = Math.floor(red.x / T);
        const rr = Math.floor(red.y / T);
        return { c: lead.c + (lead.c - rc), r: lead.r + (lead.r - rr) };
      }
      case 'wanderer': {
        const d2 = (pc - Math.floor(g.x / T)) ** 2 + (pr - Math.floor(g.y / T)) ** 2;
        return d2 > 64 ? { c: pc, r: pr } : g.scatter;
      }
      default:
        return { c: pc, r: pr };
    }
  }

  _updateGhosts(dt) {
    const doorX = (10 + 0.5) * T;
    for (const g of this.ghosts) {
      if (g.state === 'pen') {
        g.bob += dt * 4;
        g.y = PEN_Y + Math.sin(g.bob) * 5;
        g.releaseT -= dt;
        if (g.releaseT <= 0) g.state = 'exit';
        continue;
      }
      if (g.state === 'exit') {
        // slide to door column, then rise through the door
        if (Math.abs(g.x - doorX) > 1.5) {
          g.x += Math.sign(doorX - g.x) * 60 * dt;
        } else {
          g.x = doorX;
          g.y -= 70 * dt;
          if (g.y <= (EXIT_TILE.r + 0.5) * T) {
            g.y = (EXIT_TILE.r + 0.5) * T;
            g.state = 'normal';
            g.tc = EXIT_TILE.c;
            g.tr = EXIT_TILE.r;
            g.dir = { x: 0, y: 0 };
          }
        }
        continue;
      }
      if (g.state === 'enter') {
        // eyes descend through the door back into the pen
        g.x = doorX;
        g.y += 90 * dt;
        if (g.y >= PEN_Y) {
          g.y = PEN_Y;
          g.state = 'pen';
          g.releaseT = 0.6;
          g.frightened = false;
        }
        continue;
      }

      // normal / eyes grid movement
      let speed;
      if (g.state === 'eyes') speed = 300;
      else if (g.frightened) speed = 95;
      else speed = 142 * this._speedMult();
      if (Math.floor(g.y / T) === TUNNEL_ROW && g.state !== 'eyes') speed *= 0.6;

      const target = this._ghostTarget(g);
      this._moveGrid(g, speed, dt, (c, r, dir) => {
        const opts = DIRS.filter(
          (d) =>
            !(d.x === -dir.x && d.y === -dir.y && (dir.x || dir.y)) &&
            openForGhost(c + d.x, r + d.y)
        );
        if (opts.length === 0) return { x: -dir.x, y: -dir.y }; // dead end
        if (g.frightened && g.state !== 'eyes') {
          return opts[Math.floor(rand(0, opts.length))];
        }
        let best = opts[0];
        let bd = Infinity;
        for (const d of opts) {
          const dd = (c + d.x - target.c) ** 2 + (r + d.y - target.r) ** 2;
          if (dd < bd) { bd = dd; best = d; }
        }
        return best;
      });

      // eyes reached the door tile -> drop back into the pen
      if (g.state === 'eyes') {
        const ec = Math.floor(g.x / T);
        const er = Math.floor(g.y / T);
        if (ec === EXIT_TILE.c && er === EXIT_TILE.r) {
          const cx = (EXIT_TILE.c + 0.5) * T;
          if (Math.abs(g.x - cx) < 3) g.state = 'enter';
        }
      }
    }
  }

  _checkGhostCollisions() {
    const p = this.player;
    for (const g of this.ghosts) {
      if (g.state === 'pen' || g.state === 'enter' || g.state === 'eyes') continue;
      const dx = g.x - p.x;
      const dy = g.y - p.y;
      if (dx * dx + dy * dy < (T * 0.55) ** 2) {
        if (g.frightened) {
          g.frightened = false;
          g.state = 'eyes';
          const pts = 200 * 2 ** Math.min(this.eatChain, 3);
          this.eatChain++;
          this._addScore(pts, g.x, g.y, true);
        } else {
          this._die();
          return;
        }
      }
    }
  }

  _die() {
    if (this.status !== 'playing') return;
    this.lives -= 1;
    this.status = 'dying';
    this.deathT = 1.5;
    this._emit();
  }

  _respawnAfterDeath() {
    // keep pellets/score, reset actor positions
    const pellets = this.pellets;
    const pelletCount = this.pelletCount;
    const dotsEaten = this.dotsEaten;
    this._resetActors();
    this.pellets = pellets;
    this.pelletCount = pelletCount;
    this.dotsEaten = dotsEaten;
    this.banner = 'READY!';
    this.readyT = 1.4;
  }

  _updateFruit(dt) {
    if (this.fruit) {
      this.fruit.t -= dt;
      if (this.fruit.t <= 0) this.fruit = null;
    }
  }

  _addScore(n, x, y, big = false) {
    this.score += n;
    if (x !== undefined) {
      this.floaters.push({ x, y, text: `${n}`, life: big ? 1.3 : 0.7, big });
    }
    if (!this.extraAwarded && this.score >= 10000) {
      this.extraAwarded = true;
      this.lives += 1;
    }
    this._emit();
  }

  _updateFloaters(dt) {
    for (const f of this.floaters) {
      f.y -= 22 * dt;
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

    const flash = this.clearT > 0 && Math.floor(this.clearT * 6) % 2 === 0;
    this._drawMaze(ctx, flash);
    this._drawPellets(ctx);
    if (this.fruit) this._drawFruit(ctx);

    if (this.status !== 'ready') {
      for (const g of this.ghosts) this._drawGhost(ctx, g);
      this._drawPlayer(ctx);
      this._drawFloaters(ctx);
    }

    if ((this.readyT > 0 || this.clearT > 0) && this.status === 'playing') {
      ctx.fillStyle = this.clearT > 0 ? '#ffd24a' : '#00f0ff';
      ctx.font = "700 26px Orbitron, sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(this.banner, W / 2, (TUNNEL_ROW + 0.5) * T + 9);
      ctx.textAlign = 'left';
    }
  }

  _drawMaze(ctx, flash) {
    ctx.lineWidth = 2;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const ch = MAZE[r][c];
        if (ch === '#') {
          ctx.fillStyle = '#0a1430';
          ctx.fillRect(c * T, r * T, T, T);
          ctx.strokeStyle = flash ? '#ffffff' : '#2f5cff';
          ctx.beginPath();
          if (cellAt(c, r - 1) !== '#') { ctx.moveTo(c * T, r * T + 1); ctx.lineTo((c + 1) * T, r * T + 1); }
          if (cellAt(c, r + 1) !== '#') { ctx.moveTo(c * T, (r + 1) * T - 1); ctx.lineTo((c + 1) * T, (r + 1) * T - 1); }
          if (cellAt(c - 1, r) !== '#') { ctx.moveTo(c * T + 1, r * T); ctx.lineTo(c * T + 1, (r + 1) * T); }
          if (cellAt(c + 1, r) !== '#') { ctx.moveTo((c + 1) * T - 1, r * T); ctx.lineTo((c + 1) * T - 1, (r + 1) * T); }
          ctx.stroke();
        } else if (ch === '-') {
          ctx.strokeStyle = '#ff9fdc';
          ctx.beginPath();
          ctx.moveTo(c * T + 3, r * T + T / 2);
          ctx.lineTo((c + 1) * T - 3, r * T + T / 2);
          ctx.stroke();
        }
      }
    }
  }

  _drawPellets(ctx) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const k = this.pellets[r][c];
        if (!k) continue;
        const x = (c + 0.5) * T;
        const y = (r + 0.5) * T;
        if (k === 1) {
          ctx.fillStyle = '#ffd9a8';
          ctx.fillRect(x - 2, y - 2, 4, 4);
        } else {
          const pulse = 5.5 + Math.sin(this.time * 6) * 1.8;
          ctx.fillStyle = '#ffd24a';
          ctx.shadowColor = '#ffd24a';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(x, y, pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  _drawFruit(ctx) {
    const x = (FRUIT_TILE.c + 0.5) * T;
    const y = (FRUIT_TILE.r + 0.5) * T;
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = '#ff5050';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff5050';
    ctx.beginPath();
    ctx.arc(-4, 2, 6, 0, Math.PI * 2);
    ctx.arc(4, 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2bd968';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -3);
    ctx.quadraticCurveTo(0, -12, 5, -10);
    ctx.stroke();
    ctx.restore();
  }

  _drawPlayer(ctx) {
    const p = this.player;
    if (this.status === 'dying') {
      // collapse animation
      const t = clamp(this.deathT / 1.5, 0, 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = '#ffd24a';
      ctx.shadowColor = '#ffd24a';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      const open = (1 - t) * Math.PI;
      ctx.arc(0, 0, 12 * t + 1, open, Math.PI * 2 - open);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.restore();
      return;
    }
    const ang = Math.atan2(p.dir.y, p.dir.x) || 0;
    const mouth = (Math.abs(Math.sin(p.mouth)) * 0.28 + 0.04) * Math.PI;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.dir.x || p.dir.y ? ang : 0);
    ctx.fillStyle = '#ffd24a';
    ctx.shadowColor = '#ffd24a';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, 12, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawGhost(ctx, g) {
    ctx.save();
    ctx.translate(g.x, g.y);
    const r = 12;
    const eyesOnly = g.state === 'eyes' || g.state === 'enter';
    if (!eyesOnly) {
      const flash =
        g.frightened && this.frightT < 2 && Math.floor(this.frightT * 5) % 2 === 0;
      const body = g.frightened ? (flash ? '#e8ecff' : '#1f2bd6') : g.color;
      ctx.fillStyle = body;
      ctx.shadowColor = body;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, -2, r, Math.PI, 0);
      ctx.lineTo(r, 9);
      // wavy skirt
      for (let i = 2; i >= -2; i--) {
        ctx.lineTo(i * (r / 2.5), i % 2 === 0 ? 9 : 6);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      if (g.frightened) {
        ctx.fillStyle = flash ? '#1f2bd6' : '#e8ecff';
        ctx.fillRect(-6, -4, 3, 4);
        ctx.fillRect(3, -4, 3, 4);
        ctx.beginPath();
        for (let i = -5; i <= 5; i += 2) {
          ctx.rect(i, 4, 1.5, 1.5);
        }
        ctx.fill();
        ctx.restore();
        return;
      }
    }
    // eyes track direction
    const ex = g.dir.x * 2;
    const ey = g.dir.y * 2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4.5, -4, 4, 0, Math.PI * 2);
    ctx.arc(4.5, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1830c8';
    ctx.beginPath();
    ctx.arc(-4.5 + ex, -4 + ey, 2, 0, Math.PI * 2);
    ctx.arc(4.5 + ex, -4 + ey, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawFloaters(ctx) {
    ctx.textAlign = 'center';
    for (const f of this.floaters) {
      ctx.globalAlpha = clamp(f.life * 1.6, 0, 1);
      ctx.fillStyle = f.big ? '#ffd24a' : '#9fe0ff';
      ctx.font = `${f.big ? 700 : 500} ${f.big ? 17 : 13}px 'JetBrains Mono', monospace`;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }
}
