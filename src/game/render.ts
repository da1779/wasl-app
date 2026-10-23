import { STAGES } from "./stages";
import { hash } from "./util";
import type { Coin, Floater, Obstacle, Particle, Player, Screen } from "./types";

export interface DrawState {
  vw: number;
  vh: number;
  dpr: number;
  ground: number;
  worldX: number;
  time: number;
  trauma: number;
  reducedMotion: boolean;
  hitFlash: number;
  stageIndex: number;
  screen: Screen;
  player: Player;
  obstacles: Obstacle[];
  coins: Coin[];
  particles: Particle[];
  floaters: Floater[];
  liveSpeed: () => number;
}

export function drawWorld(ctx: CanvasRenderingContext2D, g: DrawState, _alpha: number): void {
  const { vw, vh, dpr, ground } = g;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, vw, vh);

  const shake = g.reducedMotion ? 0 : g.trauma * g.trauma;
  const t = g.time;
  const sx = shake * 12 * Math.sin(t * 73.1);
  const sy = shake * 9 * Math.sin(t * 91.7);
  ctx.save();
  ctx.translate(sx, sy);

  const stage = STAGES[g.stageIndex]!;
  drawSky(ctx, g, stage.skyTop, stage.skyBot);
  drawStars(ctx, g);
  drawFarCity(ctx, g);
  drawMidCity(ctx, g);
  drawNearFacades(ctx, g);
  drawGround(ctx, g);
  drawCoins(ctx, g);
  drawObstacles(ctx, g);
  drawPlayer(ctx, g.player, g);
  drawParticles(ctx, g);
  drawFloaters(ctx, g);
  drawSpeedLines(ctx, g);
  drawVignette(ctx, vw, vh);

  ctx.restore();

  if (g.hitFlash > 0) {
    ctx.fillStyle = `rgba(244,244,245,${g.hitFlash * 0.28})`;
    ctx.fillRect(0, 0, vw, vh);
  }
  void ground;
}

function drawSky(ctx: CanvasRenderingContext2D, g: DrawState, top: string, bot: string): void {
  const grd = ctx.createLinearGradient(0, 0, 0, g.vh);
  grd.addColorStop(0, top);
  grd.addColorStop(0.55, bot);
  grd.addColorStop(1, "#0a0a0b");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, g.vw, g.vh);

  const glow = ctx.createRadialGradient(g.vw * 0.72, g.vh * 0.18, 10, g.vw * 0.72, g.vh * 0.18, g.vw * 0.5);
  glow.addColorStop(0, "rgba(196,180,140,0.14)");
  glow.addColorStop(1, "rgba(196,180,140,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, g.vw, g.vh);
}

function drawStars(ctx: CanvasRenderingContext2D, g: DrawState): void {
  ctx.save();
  for (let i = 0; i < 48; i++) {
    const hx = hash(i * 19.2 + 2);
    const hy = hash(i * 7.7 + 4);
    const x = ((hx * g.vw * 3 - g.worldX * 0.04) % (g.vw + 40)) - 20;
    const y = hy * g.ground * 0.45 + 12;
    ctx.globalAlpha = 0.15 + hash(i + 9) * 0.45;
    ctx.fillStyle = "#e8e4dc";
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.restore();
}

function drawFarCity(ctx: CanvasRenderingContext2D, g: DrawState): void {
  const y0 = g.ground - 210;
  const scroll = g.worldX * 0.18;
  ctx.fillStyle = "#141820";
  let x = -((scroll % 220) + 220);
  let i = 0;
  while (x < g.vw + 80) {
    const h = 70 + hash(Math.floor((scroll + x) / 220) + i) * 140;
    const w = 70 + hash(i + 4) * 90;
    ctx.fillRect(x, y0 + (210 - h), w, h);
    x += w + 12;
    i++;
  }
}

function drawMidCity(ctx: CanvasRenderingContext2D, g: DrawState): void {
  const scroll = g.worldX * 0.38;
  const base = g.ground;
  let x = -((scroll % 180) + 180);
  let i = Math.floor(scroll / 180);
  while (x < g.vw + 100) {
    const seed = i * 17.3;
    const h = 90 + hash(seed) * 170;
    const w = 88 + hash(seed + 1) * 70;
    ctx.fillStyle = i % 5 === 0 ? "#1a1e26" : "#171b22";
    roundRect(ctx, x, base - h, w, h, 2);
    ctx.fill();
    const cols = 3 + Math.floor(hash(seed + 2) * 3);
    const rows = 4 + Math.floor(hash(seed + 3) * 5);
    const lit = hash(seed + 8);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (hash(seed + r * 11 + c) < 0.55) continue;
        ctx.fillStyle = hash(seed + r + c) > 0.72 ? "rgba(212,184,120,0.55)" : "rgba(160,176,188,0.28)";
        const wx = x + 10 + c * ((w - 16) / cols);
        const wy = base - h + 12 + r * ((h - 24) / rows);
        ctx.globalAlpha = 0.35 + lit * 0.4;
        ctx.fillRect(wx, wy, 6, 8);
        ctx.globalAlpha = 1;
      }
    }
    x += w + 18;
    i++;
  }
}

function drawNearFacades(ctx: CanvasRenderingContext2D, g: DrawState): void {
  const scroll = g.worldX * 0.72;
  const base = g.ground;
  let x = -((scroll % 260) + 260);
  let i = Math.floor(scroll / 260);
  while (x < g.vw + 140) {
    const seed = i * 23.1 + g.stageIndex;
    const h = 40 + hash(seed) * 90;
    ctx.fillStyle = "#12151a";
    ctx.fillRect(x, base - h, 40, h);
    ctx.fillStyle = "#0e1014";
    ctx.fillRect(x + 200, base - h * 0.7, 28, h * 0.7);
    if (hash(seed + 2) > 0.4) {
      ctx.strokeStyle = "rgba(200,196,188,0.08)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 48, base - 8);
      ctx.lineTo(x + 180, base - 70 - hash(seed) * 40);
      ctx.stroke();
    }
    x += 260;
    i++;
  }
}

function drawGround(ctx: CanvasRenderingContext2D, g: DrawState): void {
  const y = g.ground;
  ctx.fillStyle = "#0c0d10";
  ctx.fillRect(0, y, g.vw, g.vh - y);
  const strip = ctx.createLinearGradient(0, y - 8, 0, y + 18);
  strip.addColorStop(0, "rgba(200,196,188,0.16)");
  strip.addColorStop(0.4, "#1c1e24");
  strip.addColorStop(1, "#0c0d10");
  ctx.fillStyle = strip;
  ctx.fillRect(0, y - 6, g.vw, 22);

  ctx.strokeStyle = "rgba(232,228,220,0.08)";
  ctx.lineWidth = 2;
  ctx.setLineDash([28, 22]);
  ctx.lineDashOffset = -(g.worldX * 0.9);
  ctx.beginPath();
  ctx.moveTo(0, y + 10);
  ctx.lineTo(g.vw, y + 10);
  ctx.stroke();
  ctx.setLineDash([]);

  if (g.stageIndex >= 2) {
    ctx.strokeStyle = "rgba(180,176,168,0.22)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y + 2);
    ctx.lineTo(g.vw, y + 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y + 18);
    ctx.lineTo(g.vw, y + 18);
    ctx.stroke();
    const sleeper = 42;
    const off = g.worldX % sleeper;
    ctx.fillStyle = "rgba(90,86,80,0.45)";
    for (let x = -off; x < g.vw; x += sleeper) {
      ctx.fillRect(x, y + 3, 8, 16);
    }
  }
}

function drawObstacles(ctx: CanvasRenderingContext2D, g: DrawState): void {
  for (const o of g.obstacles) {
    if (!o.alive) continue;
    const x = o.x - g.worldX;
    if (x > g.vw + 40 || x + o.w < -40) continue;
    const bob = o.bobAmp ? Math.sin(g.time * o.bobFreq + o.bobPhase) * o.bobAmp : 0;
    const y = o.y + bob;
    drawObstacle(ctx, o, x, y, g);
  }
}

function drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, x: number, y: number, g: DrawState): void {
  ctx.save();
  switch (o.kind) {
    case "crate":
      ctx.fillStyle = "#2a2e34";
      roundRect(ctx, x, y - o.h, o.w, o.h, 4);
      ctx.fill();
      ctx.strokeStyle = "rgba(232,228,220,0.12)";
      ctx.stroke();
      ctx.fillStyle = "rgba(196,180,140,0.2)";
      ctx.fillRect(x + 8, y - o.h + 8, o.w - 16, 6);
      break;
    case "barrier":
      ctx.fillStyle = "#262a30";
      ctx.fillRect(x, y - o.h, o.w, o.h);
      ctx.fillStyle = "#c4b8a4";
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 8 + i * 22, y - o.h + 8, 10, o.h - 8);
      break;
    case "cone":
      ctx.fillStyle = "#8a8478";
      ctx.beginPath();
      ctx.moveTo(x + o.w / 2, y - o.h);
      ctx.lineTo(x + o.w, y);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e8e4dc";
      ctx.fillRect(x + 8, y - o.h * 0.45, o.w - 16, 6);
      break;
    case "awning":
    case "sign":
      ctx.fillStyle = "#1c2026";
      ctx.fillRect(x + o.w * 0.45, y - o.h - 40, 8, 40 + o.h);
      ctx.fillStyle = o.kind === "sign" ? "#2a3038" : "#3a342c";
      roundRect(ctx, x, y - o.h, o.w, o.h, 3);
      ctx.fill();
      ctx.fillStyle = "rgba(196,180,140,0.35)";
      ctx.fillRect(x + 10, y - o.h + 10, o.w - 20, 8);
      break;
    case "pipe":
      ctx.strokeStyle = "#4a4e54";
      ctx.lineWidth = o.h;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y - o.h / 2);
      ctx.lineTo(x + o.w, y - o.h / 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(200,204,212,0.2)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 8, y - o.h / 2 - 4);
      ctx.lineTo(x + o.w - 8, y - o.h / 2 - 4);
      ctx.stroke();
      break;
    case "cart":
      ctx.fillStyle = "#2c3036";
      roundRect(ctx, x, y - o.h + 10, o.w, o.h - 10, 6);
      ctx.fill();
      ctx.fillStyle = "#1a1c20";
      ctx.beginPath();
      ctx.arc(x + 18, y - 8, 8, 0, Math.PI * 2);
      ctx.arc(x + o.w - 18, y - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(196,180,140,0.4)";
      ctx.fillRect(x + o.w - 16, y - o.h + 16, 8, 6);
      break;
    case "drone":
      ctx.fillStyle = "#2a3038";
      roundRect(ctx, x, y - o.h, o.w, o.h, 8);
      ctx.fill();
      ctx.fillStyle = "rgba(200,204,212,0.5)";
      ctx.fillRect(x + 10, y - o.h + 8, 12, 6);
      ctx.fillRect(x + o.w - 22, y - o.h + 8, 12, 6);
      ctx.strokeStyle = "rgba(232,228,220,0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x + 8, y - o.h - 4, 14, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(x + o.w - 8, y - o.h - 4, 14, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "trainLow":
    case "trainFast":
    case "trainGap":
      drawTrain(ctx, x, y, o, g);
      break;
  }
  ctx.restore();
}

function drawTrain(ctx: CanvasRenderingContext2D, x: number, y: number, o: Obstacle, g: DrawState): void {
  const gap = o.kind === "trainGap";
  const bodyY = gap ? y - o.h : y - o.h;
  const bodyH = gap ? o.h : o.h;
  ctx.fillStyle = "#1a1e24";
  roundRect(ctx, x, bodyY, o.w, bodyH, 8);
  ctx.fill();
  ctx.fillStyle = "#c8ccd4";
  ctx.fillRect(x + o.w - 18, bodyY + 16, 10, 8);
  ctx.fillStyle = "rgba(212,184,120,0.55)";
  const windows = Math.max(3, Math.floor(o.w / 70));
  for (let i = 0; i < windows; i++) {
    ctx.fillRect(x + 16 + i * 64, bodyY + 14, 28, 18);
  }
  ctx.fillStyle = "#121418";
  const wheels = Math.max(3, Math.floor(o.w / 80));
  for (let i = 0; i < wheels; i++) {
    ctx.beginPath();
    ctx.arc(x + 30 + i * 72, y - (gap ? 8 : 10), 9, 0, Math.PI * 2);
    ctx.fill();
  }
  if (o.kind === "trainFast") {
    ctx.fillStyle = "rgba(232,228,220,0.08)";
    ctx.fillRect(x - 40, bodyY + 8, 40, bodyH - 16);
  }
  void g;
}

function drawCoins(ctx: CanvasRenderingContext2D, g: DrawState): void {
  for (const c of g.coins) {
    if (!c.alive) continue;
    const x = c.x - g.worldX;
    if (x < -20 || x > g.vw + 20) continue;
    const pulse = 0.85 + Math.sin(c.phase) * 0.15;
    ctx.save();
    ctx.translate(x, c.y);
    ctx.scale(pulse, 1);
    ctx.fillStyle = "#d4c4a0";
    ctx.beginPath();
    ctx.ellipse(0, 0, c.r, c.r * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#efe6d2";
    ctx.beginPath();
    ctx.ellipse(-2, -2, c.r * 0.4, c.r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, g: DrawState): void {
  const cycle = (g.worldX * 0.045) % (Math.PI * 2);
  const running = p.state === "run" && p.grounded;
  const sliding = p.state === "slide";
  const jumping = p.state === "jump";
  const crash = p.state === "crash";

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.squashX, p.squashY);
  if (crash) ctx.rotate(p.crashRot);
  if (sliding) ctx.rotate(0.95);

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 4, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const swing = running ? Math.sin(cycle) : jumping ? 0.35 : sliding ? 0.1 : 0;
  const bob = running ? Math.abs(Math.sin(cycle * 2)) * 2 : 0;

  const hipY = -28 - bob;
  const torso = sliding ? -6 : -46;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const drawLimb = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, w: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x1, y1, x2, y2);
    ctx.stroke();
  };

  const legColor = "#1a1c20";
  const armColor = "#2a2e34";

  drawLimb(-4, hipY, -10 - swing * 10, hipY + 18, -8 - swing * 16, -4, 9, legColor);
  drawLimb(4, hipY, 8 + swing * 10, hipY + 16, 10 + swing * 14, -4, 9, legColor);

  ctx.fillStyle = "#2c3038";
  roundRect(ctx, -16, torso, 32, 38, 10);
  ctx.fill();
  ctx.fillStyle = "#c4b8a4";
  ctx.fillRect(-16, torso + 10, 4, 16);

  ctx.fillStyle = "#2c3038";
  ctx.beginPath();
  ctx.ellipse(2, torso - 2, 16, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d8d0c4";
  ctx.beginPath();
  ctx.arc(4, torso + 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1c20";
  ctx.beginPath();
  ctx.arc(8, torso + 1, 1.6, 0, Math.PI * 2);
  ctx.fill();

  const armSwing = running ? -swing : jumping ? -0.8 : sliding ? 0.4 : 0;
  drawLimb(10, torso + 10, 18 + armSwing * 8, torso + 22, 16 + armSwing * 16, torso + 34, 7, armColor);
  drawLimb(-10, torso + 12, -16 - armSwing * 8, torso + 22, -14 - armSwing * 14, torso + 32, 7, armColor);

  ctx.fillStyle = "#e8e4dc";
  ctx.beginPath();
  ctx.ellipse(-8 - swing * 16, -2, 7, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10 + swing * 14, -2, 7, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, g: DrawState): void {
  for (const p of g.particles) {
    if (!p.alive) continue;
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFloaters(ctx: CanvasRenderingContext2D, g: DrawState): void {
  ctx.font = "600 14px 'IBM Plex Sans Arabic', sans-serif";
  ctx.textAlign = "center";
  for (const f of g.floaters) {
    if (!f.alive) continue;
    ctx.globalAlpha = Math.max(0, f.life / f.max);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}

function drawSpeedLines(ctx: CanvasRenderingContext2D, g: DrawState): void {
  if (g.screen !== "playing") return;
  const intensity = Math.max(0, (g.liveSpeed() - 500) / 400);
  if (intensity < 0.05) return;
  ctx.strokeStyle = `rgba(244,244,245,${0.05 + intensity * 0.08})`;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 10; i++) {
    const y = hash(i * 3.2 + Math.floor(g.worldX / 40)) * g.ground;
    const len = 30 + intensity * 80;
    const x = ((hash(i + 2) * g.vw - g.worldX * (1.4 + intensity)) % (g.vw + 80)) - 40;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
}

function drawVignette(ctx: CanvasRenderingContext2D, vw: number, vh: number): void {
  const v = ctx.createRadialGradient(vw * 0.45, vh * 0.5, vw * 0.2, vw * 0.45, vh * 0.5, vw * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, vw, vh);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
