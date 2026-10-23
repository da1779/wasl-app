import { Input } from "./input";
import { loadSave, writeSave, type SaveData } from "./save";
import { STAGES, UNLOCK_DISTANCE } from "./stages";
import { useGameUI } from "./store";
import type { Coin, Floater, Obstacle, ObstacleKind, Particle, Player, Screen } from "./types";
import {
  resumeAudio,
  setMuted,
  setMusicSpeed,
  sfxCoin,
  sfxCombo,
  sfxCrash,
  sfxJump,
  sfxLand,
  sfxNear,
  sfxSlide,
  startMusic,
  stopMusic,
  unlockAudio,
} from "./audio";
import { drawWorld } from "./render";
import { hash } from "./util";

const STEP = 1 / 60;
const GRAVITY = 2350;
const JUMP_V = -860;
const MAX_FALL = 1550;
const SLIDE_DUR = 0.5;
const COYOTE = 0.11;
const JUMP_BUF = 0.13;
const STAND_W = 36;
const STAND_H = 82;
const SLIDE_W = 58;
const SLIDE_H = 34;
const SPEED_PER_K = 26;
const MAX_SPEED = 840;
const COMBO_DECAY = 2.4;
const PPM = 8;

function pool<T>(n: number, make: () => T): T[] {
  return Array.from({ length: n }, make);
}

export class SikkahEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  input = new Input();
  destroyed = false;
  acc = 0;
  last = 0;
  time = 0;
  screen: Screen = "title";
  stageIndex = 0;
  worldX = 0;
  speed = 430;
  score = 0;
  combo = 0;
  comboT = 0;
  maxCombo = 0;
  trauma = 0;
  hitstop = 0;
  hitFlash = 0;
  overDelay = 0;
  nextSpawn = 420;
  lastAvoid: "jump" | "slide" | null = null;
  lastWasJump = false;
  save: SaveData;
  player: Player;
  obstacles: Obstacle[];
  coins: Coin[];
  particles: Particle[];
  floaters: Floater[];
  uiClock = 0;
  reducedMotion = false;
  dpr = 1;
  cssW = 390;
  cssH = 720;
  vw = 1280;
  vh = 720;
  ground = 598;
  playerX = 268;
  speedScale = 1;
  wasBest = false;
  private raf = 0;
  private unsubVis: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D unavailable");
    this.ctx = ctx;
    this.save = loadSave();
    this.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.player = this.makePlayer();
    this.obstacles = pool(28, () => this.makeObstacle());
    this.coins = pool(56, () => this.makeCoin());
    this.particles = pool(140, () => this.makeParticle());
    this.floaters = pool(18, () => this.makeFloater());
    this.stageIndex = 0;
    this.speed = STAGES[0]!.baseSpeed;
    this.input.attach(canvas);
    setMuted(this.save.muted);
    this.pushUi({
      screen: "title",
      highScore: this.save.highScore,
      bestDistance: this.save.bestDistance,
      unlockedStage: this.save.unlockedStage,
      muted: this.save.muted,
      stageIndex: 0,
    });
  }

  makePlayer(): Player {
    return {
      x: this.playerX,
      y: this.ground,
      vy: 0,
      w: STAND_W,
      h: STAND_H,
      state: "run",
      grounded: true,
      coyote: 0,
      jumpBuf: 0,
      slideT: 0,
      squashX: 1,
      squashY: 1,
      crashT: 0,
      crashRot: 0,
      blink: 0,
    };
  }

  makeObstacle(): Obstacle {
    return {
      kind: "crate",
      x: 0,
      y: this.ground,
      w: 40,
      h: 40,
      vx: 0,
      bobAmp: 0,
      bobFreq: 0,
      bobPhase: 0,
      avoid: "jump",
      passed: false,
      nearMissed: false,
      alive: false,
    };
  }

  makeCoin(): Coin {
    return { x: 0, y: 0, r: 11, collected: false, alive: false, phase: 0 };
  }

  makeParticle(): Particle {
    return { x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, r: 2, color: "#fff", g: 0, alive: false };
  }

  makeFloater(): Floater {
    return { x: 0, y: 0, text: "", life: 0, max: 1, color: "#fff", alive: false };
  }

  start(): void {
    this.last = performance.now();
    this.resize();
    this.raf = requestAnimationFrame(this.loop);
    const onVis = () => {
      if (document.hidden) {
        this.input.keys.clear();
        if (this.screen === "playing") this.pause();
      } else {
        resumeAudio();
        this.last = performance.now();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    this.unsubVis = () => document.removeEventListener("visibilitychange", onVis);
    window.addEventListener("resize", this.resize);
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.input.dispose();
    this.unsubVis?.();
    window.removeEventListener("resize", this.resize);
    stopMusic();
  }

  resize = (): void => {
    const parent = this.canvas.parentElement ?? this.canvas;
    const w = Math.max(1, parent.clientWidth || window.innerWidth);
    const h = Math.max(1, parent.clientHeight || window.innerHeight);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cssW = w;
    this.cssH = h;
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.vw = w;
    this.vh = h;
    this.ground = h * 0.8;
    this.playerX = Math.min(Math.max(w * 0.2, 96), 300);
    this.speedScale = Math.min(1.12, Math.max(0.62, w / 980));
    if (this.player.state !== "crash") {
      this.player.x = this.playerX;
      if (this.player.grounded) this.player.y = this.ground;
    }
  };

  loop = (now: number): void => {
    if (this.destroyed) return;
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > 0.1) dt = 0.1;
    this.input.poll();
    this.handleMenuInput();

    if (this.hitstop > 0) {
      this.hitstop -= dt;
    } else if (this.screen === "playing") {
      this.acc += dt;
      let steps = 0;
      while (this.acc >= STEP && steps < 5) {
        this.step(STEP);
        this.acc -= STEP;
        steps++;
      }
    } else if (this.screen === "over") {
      this.stepCrash(dt);
      this.worldX += 40 * dt;
      this.time += dt;
    } else {
      this.worldX += 55 * dt;
      this.time += dt;
    }

    this.decayJuice(dt);
    const alpha = this.screen === "playing" ? this.acc / STEP : 0;
    drawWorld(this.ctx, this, alpha);
    this.uiClock += dt;
    if (this.uiClock > 0.08 || this.screen !== "playing") {
      this.uiClock = 0;
      this.syncHud();
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  handleMenuInput(): void {
    if (this.input.justPause) {
      if (this.screen === "playing") this.pause();
      else if (this.screen === "paused") this.resume();
    }
  }

  toTitle(): void {
    stopMusic();
    this.screen = "title";
    this.resetRun();
    this.pushUi({
      screen: "title",
      stageIndex: this.stageIndex,
      highScore: this.save.highScore,
      bestDistance: this.save.bestDistance,
      unlockedStage: this.save.unlockedStage,
    });
  }

  pause(): void {
    if (this.screen !== "playing") return;
    this.screen = "paused";
    stopMusic();
    this.pushUi({ screen: "paused" });
  }

  resume(): void {
    if (this.screen !== "paused") return;
    unlockAudio();
    this.screen = "playing";
    startMusic();
    this.last = performance.now();
    this.pushUi({ screen: "playing" });
  }

  selectStage(i: number): void {
    if (i < 0 || i > this.save.unlockedStage) return;
    this.stageIndex = i;
    this.pushUi({ stageIndex: i });
  }

  beginRun(): void {
    unlockAudio();
    this.resetRun();
    this.screen = "playing";
    startMusic();
    this.pushUi({ screen: "playing", score: 0, distance: 0, combo: 0, comboMult: 1 });
  }

  replay(): void {
    unlockAudio();
    this.resetRun();
    this.screen = "playing";
    startMusic();
    this.pushUi({
      screen: "playing",
      score: 0,
      distance: 0,
      combo: 0,
      comboMult: 1,
      isNewBest: false,
    });
  }

  nextStage(): void {
    const n = Math.min(this.stageIndex + 1, 3);
    if (n > this.save.unlockedStage) return;
    this.stageIndex = n;
    this.pushUi({ stageIndex: n });
    this.replay();
  }

  toggleMute(): void {
    this.save.muted = !this.save.muted;
    setMuted(this.save.muted);
    writeSave(this.save);
    this.pushUi({ muted: this.save.muted });
  }

  resetRun(): void {
    this.worldX = 0;
    this.score = 0;
    this.combo = 0;
    this.comboT = 0;
    this.maxCombo = 0;
    this.trauma = 0;
    this.hitstop = 0;
    this.hitFlash = 0;
    this.overDelay = 0;
    this.wasBest = false;
    this.nextSpawn = this.vw * 0.55;
    this.lastAvoid = null;
    this.lastWasJump = false;
    this.acc = 0;
    this.speed = STAGES[this.stageIndex]!.baseSpeed;
    this.player = this.makePlayer();
    for (const o of this.obstacles) o.alive = false;
    for (const c of this.coins) c.alive = false;
    for (const p of this.particles) p.alive = false;
    for (const f of this.floaters) f.alive = false;
  }

  meters(): number {
    return this.worldX / PPM;
  }

  comboMult(): number {
    return 1 + Math.min(this.combo, 20) * 0.1;
  }

  liveSpeed(): number {
    return this.speed * this.speedScale;
  }

  step(dt: number): void {
    const stage = STAGES[this.stageIndex]!;
    const m = this.meters();
    const k = Math.floor(m / 1000);
    this.speed = Math.min(MAX_SPEED, stage.baseSpeed + k * SPEED_PER_K);
    setMusicSpeed(this.liveSpeed() / 500);
    this.worldX += this.liveSpeed() * dt;
    this.time += dt;

    this.score += this.liveSpeed() * dt * 0.12 * stage.reward * this.comboMult();

    this.comboT -= dt;
    if (this.comboT <= 0 && this.combo > 0) {
      this.combo = Math.max(0, this.combo - 1);
      this.comboT = 0.55;
    }

    this.updatePlayer(dt);
    this.spawnAhead();
    this.updateObstacles(dt);
    this.updateCoins(dt);
    this.updateParticles(dt);
    this.updateFloaters(dt);
  }

  updatePlayer(dt: number): void {
    const p = this.player;
    p.x = this.playerX;
    if (p.state === "crash") {
      this.stepCrash(dt);
      return;
    }

    if (this.input.justJump) p.jumpBuf = JUMP_BUF;
    else p.jumpBuf = Math.max(0, p.jumpBuf - dt);

    if (p.grounded) p.coyote = COYOTE;
    else p.coyote = Math.max(0, p.coyote - dt);

    if (p.state === "slide") {
      p.slideT -= dt;
      if (p.slideT <= 0) {
        p.state = p.grounded ? "run" : "jump";
        p.w = STAND_W;
        p.h = STAND_H;
      }
    }

    const canJump = p.jumpBuf > 0 && (p.grounded || p.coyote > 0);
    if (canJump) {
      p.vy = JUMP_V;
      p.grounded = false;
      p.state = "jump";
      p.jumpBuf = 0;
      p.coyote = 0;
      p.w = STAND_W;
      p.h = STAND_H;
      p.slideT = 0;
      p.squashX = 0.86;
      p.squashY = 1.16;
      sfxJump();
      this.burst(p.x, this.ground, 8, "#c8c4bc", 80, -40);
    } else if (this.input.justSlide && p.state !== "slide" && p.grounded) {
      p.state = "slide";
      p.slideT = SLIDE_DUR;
      p.w = SLIDE_W;
      p.h = SLIDE_H;
      p.squashX = 1.18;
      p.squashY = 0.82;
      sfxSlide();
      this.burst(p.x, this.ground, 6, "#9a968e", 120, -20);
    }

    p.vy += GRAVITY * dt;
    if (p.vy > MAX_FALL) p.vy = MAX_FALL;
    p.y += p.vy * dt;

    const wasAir = !p.grounded;
    if (p.y >= this.ground) {
      p.y = this.ground;
      if (wasAir && p.vy > 200) {
        p.squashX = 1.2;
        p.squashY = 0.78;
        sfxLand();
        this.burst(p.x, this.ground, 10, "#d8d4cc", 90, -70);
        if (!this.reducedMotion) this.trauma = Math.min(1, this.trauma + 0.12);
      }
      p.vy = 0;
      p.grounded = true;
      if (p.state === "jump") p.state = "run";
    } else {
      p.grounded = false;
      if (p.state === "run") p.state = "jump";
    }

    p.squashX += (1 - p.squashX) * (1 - Math.exp(-12 * dt));
    p.squashY += (1 - p.squashY) * (1 - Math.exp(-12 * dt));
    p.blink += dt;

    if (p.state === "run" && p.grounded && hash(Math.floor(this.worldX / 28)) > 0.72) {
      this.emit(
        p.x - 8,
        this.ground - 4,
        -40 - Math.random() * 30,
        -20 - Math.random() * 20,
        0.28,
        2.2,
        "#b8b4ac",
      );
    }
  }

  stepCrash(dt: number): void {
    const p = this.player;
    p.crashT += dt;
    p.crashRot += dt * 2.4;
    p.vy += GRAVITY * 0.55 * dt;
    p.y += p.vy * dt;
    if (p.y > this.ground + 8) {
      p.y = this.ground + 8;
      p.vy *= -0.22;
    }
    this.updateParticles(dt);
    this.updateFloaters(dt);
    if (this.screen === "playing" && p.crashT > 0.55) this.finishOver();
  }

  spawnAhead(): void {
    const viewRight = this.worldX + this.vw + 120;
    let guard = 0;
    while (this.nextSpawn < viewRight && guard++ < 8) {
      this.placePattern(this.nextSpawn);
    }
  }

  placePattern(at: number): void {
    const stage = STAGES[this.stageIndex]!;
    const m = this.meters();
    const k = Math.floor(m / 1000);
    const moving = m >= stage.movingFromM || stage.movingFromStart;
    const trains = m >= stage.trainFromM || stage.trainsFromStart;
    const gapMul = Math.max(0.72, 1 - k * 0.045);
    const minGap = (this.liveSpeed() * 0.95 + 80) * gapMul;

    const roll = hash(at * 0.017 + this.stageIndex * 9.1 + k);
    let kind: ObstacleKind = "crate";
    let usedTrain = false;

    if (trains && roll > 0.76) {
      kind = roll > 0.92 ? "trainFast" : roll > 0.84 ? "trainGap" : "trainLow";
      usedTrain = true;
    } else if (moving && roll > 0.56) {
      kind = roll > 0.72 ? "drone" : "cart";
    } else if (roll > 0.34) {
      kind = roll > 0.48 ? "awning" : roll > 0.41 ? "pipe" : "sign";
    } else {
      kind = roll > 0.2 ? "barrier" : roll > 0.09 ? "crate" : "cone";
    }

    const avoid: "jump" | "slide" =
      kind === "awning" || kind === "pipe" || kind === "sign" || kind === "trainGap" || kind === "drone"
        ? "slide"
        : "jump";

    let spawnX = at;
    if (this.lastAvoid && avoid !== this.lastAvoid && this.lastWasJump) {
      spawnX = at + minGap * 0.4;
    }

    const spec = this.kindSpec(kind, k, m);
    const o = this.obstacles.find((x) => !x.alive);
    if (!o) {
      this.nextSpawn = at + minGap;
      return;
    }
    o.alive = true;
    o.kind = kind;
    o.x = spawnX;
    o.w = spec.w;
    o.h = spec.h;
    o.y = spec.y;
    o.vx = spec.vx;
    o.bobAmp = spec.bobAmp;
    o.bobFreq = spec.bobFreq;
    o.bobPhase = hash(at) * Math.PI * 2;
    o.avoid = avoid;
    o.passed = false;
    o.nearMissed = false;

    this.placeCoins(spawnX, kind, spec);

    this.lastAvoid = avoid;
    this.lastWasJump = avoid === "jump";
    const extra = usedTrain ? this.liveSpeed() * 0.5 : 0;
    this.nextSpawn = spawnX + spec.w + minGap + extra + hash(at + 3) * 70;
  }

  kindSpec(kind: ObstacleKind, k: number, m: number) {
    const g = this.ground;
    const trainExtra = Math.max(0, m - 10000);
    const trainVx = kind.startsWith("train") ? -(50 + Math.min(160, trainExtra * 0.02 + k * 6)) : 0;
    switch (kind) {
      case "crate":
        return { w: 54, h: 54, y: g, vx: 0, bobAmp: 0, bobFreq: 0 };
      case "barrier":
        return { w: 78, h: 64, y: g, vx: 0, bobAmp: 0, bobFreq: 0 };
      case "cone":
        return { w: 36, h: 48, y: g, vx: 0, bobAmp: 0, bobFreq: 0 };
      case "awning":
        return { w: 110, h: 36, y: g - 58, vx: 0, bobAmp: 0, bobFreq: 0 };
      case "pipe":
        return { w: 90, h: 28, y: g - 54, vx: 0, bobAmp: 0, bobFreq: 0 };
      case "sign":
        return { w: 70, h: 40, y: g - 56, vx: 0, bobAmp: 0, bobFreq: 0 };
      case "cart":
        return { w: 86, h: 58, y: g, vx: -70 - k * 8, bobAmp: 0, bobFreq: 0 };
      case "drone":
        return { w: 64, h: 28, y: g - 62, vx: -40, bobAmp: 8, bobFreq: 2.2 };
      case "trainLow":
        return { w: 260 + k * 12, h: 70, y: g, vx: trainVx, bobAmp: 0, bobFreq: 0 };
      case "trainGap":
        return { w: 300 + k * 10, h: 86, y: g - 54, vx: trainVx, bobAmp: 0, bobFreq: 0 };
      case "trainFast":
        return { w: 340 + k * 16, h: 76, y: g, vx: trainVx * 1.25, bobAmp: 0, bobFreq: 0 };
    }
  }

  placeCoins(at: number, kind: ObstacleKind, spec: { w: number; h: number; y: number }): void {
    const jump =
      kind === "crate" ||
      kind === "barrier" ||
      kind === "cone" ||
      kind === "cart" ||
      kind === "trainLow" ||
      kind === "trainFast";
    const n = jump ? 5 : 4;
    for (let i = 0; i < n; i++) {
      const c = this.coins.find((x) => !x.alive);
      if (!c) break;
      c.alive = true;
      c.collected = false;
      c.phase = i * 0.4;
      if (jump) {
        const t = i / Math.max(1, n - 1);
        const arc = Math.sin(t * Math.PI);
        c.x = at + spec.w * t;
        c.y = this.ground - spec.h - 36 - arc * 70;
      } else {
        c.x = at + 18 + i * (spec.w / (n + 0.5));
        c.y = this.ground - 18;
      }
    }
  }

  updateObstacles(dt: number): void {
    const p = this.player;
    const left = this.worldX - 240;
    const rel = this.liveSpeed();
    for (const o of this.obstacles) {
      if (!o.alive) continue;
      o.x += o.vx * dt;
      const bob = o.bobAmp ? Math.sin(this.time * o.bobFreq + o.bobPhase) * o.bobAmp : 0;
      const oy = o.y + bob;
      if (o.x + o.w < left) {
        o.alive = false;
        continue;
      }

      const screenX = o.x - this.worldX;
      const pb = this.playerBox();
      const sweptW = o.w + (rel - o.vx) * dt;
      const ob = { x: screenX, y: oy - o.h, w: sweptW, h: o.h };
      if (this.hit(pb, ob)) {
        this.crash();
        return;
      }

      const passedLine = screenX + o.w < p.x - p.w * 0.5;
      if (!o.passed && passedLine) {
        o.passed = true;
        this.addCombo(1);
        this.score += 40 * this.comboMult() * STAGES[this.stageIndex]!.reward;
        this.float(p.x + 20, p.y - p.h - 10, `+${Math.round(40 * this.comboMult())}`, "#e8e4dc");
      }

      if (!o.nearMissed && !o.passed) {
        const tight = { x: screenX, y: oy - o.h, w: o.w, h: o.h };
        const gap = this.boxGap(pb, tight);
        if (gap > 0 && gap < 22) {
          o.nearMissed = true;
          this.addCombo(2);
          this.score += 90 * this.comboMult() * STAGES[this.stageIndex]!.reward;
          this.float(p.x + 10, p.y - p.h - 28, "قريب!", "#c4a574");
          sfxNear();
          if (!this.reducedMotion) this.trauma = Math.min(1, this.trauma + 0.18);
        }
      }
    }
  }

  updateCoins(dt: number): void {
    const pb = this.playerBox();
    const left = this.worldX - 80;
    for (const c of this.coins) {
      if (!c.alive || c.collected) continue;
      c.phase += dt * 6;
      if (c.x < left) {
        c.alive = false;
        continue;
      }
      const sx = c.x - this.worldX;
      const hit =
        pb.x < sx + c.r && pb.x + pb.w > sx - c.r && pb.y < c.y + c.r && pb.y + pb.h > c.y - c.r;
      if (hit) {
        c.collected = true;
        c.alive = false;
        this.score += 25 * this.comboMult() * STAGES[this.stageIndex]!.reward;
        sfxCoin();
        this.burst(sx, c.y, 7, "#e8d5a3", 60, -40);
        this.float(sx, c.y - 12, `+${Math.round(25 * this.comboMult())}`, "#e8d5a3");
      }
    }
  }

  playerBox() {
    const p = this.player;
    const inset = 6;
    return {
      x: p.x - p.w * 0.5 + inset,
      y: p.y - p.h + 4,
      w: p.w - inset * 2,
      h: p.h - 6,
    };
  }

  hit(
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number },
  ): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  boxGap(
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number },
  ): number {
    const dx = a.x + a.w < b.x ? b.x - (a.x + a.w) : b.x + b.w < a.x ? a.x - (b.x + b.w) : 0;
    const dy = a.y + a.h < b.y ? b.y - (a.y + a.h) : b.y + b.h < a.y ? a.y - (b.y + b.h) : 0;
    if (dx === 0 && dy === 0) return 0;
    return Math.hypot(dx, dy);
  }

  addCombo(n: number): void {
    this.combo += n;
    this.comboT = COMBO_DECAY;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    if (this.combo > 0 && this.combo % 5 === 0) sfxCombo(this.combo);
  }

  crash(): void {
    if (this.player.state === "crash") return;
    this.player.state = "crash";
    this.player.crashT = 0;
    this.player.vy = -280;
    this.player.crashRot = -0.2;
    this.hitstop = this.reducedMotion ? 0.02 : 0.09;
    this.hitFlash = 1;
    this.trauma = this.reducedMotion ? 0.15 : 0.85;
    sfxCrash();
    stopMusic();
    this.burst(this.player.x, this.player.y - 30, 22, "#d8d0c8", 220, -180);
    this.persistRun();
  }

  finishOver(): void {
    this.screen = "over";
    const canNext = this.stageIndex < 3 && this.stageIndex < this.save.unlockedStage;
    this.pushUi({
      screen: "over",
      runScore: Math.floor(this.score),
      runDistance: Math.floor(this.meters()),
      runCombo: this.maxCombo,
      isNewBest: this.wasBest,
      canNext,
      highScore: this.save.highScore,
      bestDistance: this.save.bestDistance,
      unlockedStage: this.save.unlockedStage,
      stageIndex: this.stageIndex,
    });
  }

  persistRun(): void {
    const dist = Math.floor(this.meters());
    const sc = Math.floor(this.score);
    this.wasBest = sc > this.save.highScore;
    let unlocked = this.save.unlockedStage;
    if (dist >= UNLOCK_DISTANCE && this.stageIndex === unlocked && unlocked < 3) {
      unlocked += 1;
    }
    this.save = {
      ...this.save,
      highScore: Math.max(this.save.highScore, sc),
      bestDistance: Math.max(this.save.bestDistance, dist),
      bestCombo: Math.max(this.save.bestCombo, this.maxCombo),
      unlockedStage: unlocked,
    };
    writeSave(this.save);
  }

  emit(x: number, y: number, vx: number, vy: number, life: number, r: number, color: string): void {
    const p = this.particles.find((q) => !q.alive);
    if (!p) return;
    p.alive = true;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = life;
    p.max = life;
    p.r = r;
    p.color = color;
    p.g = 420;
  }

  burst(x: number, y: number, n: number, color: string, spd: number, lift: number): void {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
      const s = spd * (0.35 + Math.random());
      this.emit(
        x,
        y,
        Math.cos(a) * s,
        Math.sin(a) * s + lift * 0.2,
        0.35 + Math.random() * 0.35,
        1.6 + Math.random() * 2.4,
        color,
      );
    }
  }

  float(x: number, y: number, text: string, color: string): void {
    const f = this.floaters.find((q) => !q.alive);
    if (!f) return;
    f.alive = true;
    f.x = x;
    f.y = y;
    f.text = text;
    f.color = color;
    f.life = 0.7;
    f.max = 0.7;
  }

  updateParticles(dt: number): void {
    for (const p of this.particles) {
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.alive = false;
        continue;
      }
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  updateFloaters(dt: number): void {
    for (const f of this.floaters) {
      if (!f.alive) continue;
      f.life -= dt;
      if (f.life <= 0) {
        f.alive = false;
        continue;
      }
      f.y -= 38 * dt;
    }
  }

  decayJuice(dt: number): void {
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    this.hitFlash = Math.max(0, this.hitFlash - dt * 3.2);
  }

  pushUi(p: Partial<Omit<ReturnType<typeof useGameUI.getState>, "patch">>): void {
    useGameUI.getState().patch(p);
  }

  syncHud(): void {
    if (this.screen !== "playing") return;
    this.pushUi({
      screen: "playing",
      score: Math.floor(this.score),
      distance: Math.floor(this.meters()),
      combo: this.combo,
      comboMult: this.comboMult(),
      speed: Math.round(this.liveSpeed()),
      stageIndex: this.stageIndex,
    });
  }
}
