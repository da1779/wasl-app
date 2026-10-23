import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Play, i as RotateCcw, n as Volume2, o as Pause, s as ChevronLeft, t as VolumeX } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-De9CGWlb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GAME_KEYS = /* @__PURE__ */ new Set([
	"Space",
	"ArrowUp",
	"ArrowDown",
	"KeyW",
	"KeyS",
	"Escape",
	"KeyP",
	"Enter"
]);
var Input = class {
	keys = /* @__PURE__ */ new Set();
	jump = false;
	slide = false;
	pause = false;
	confirm = false;
	jumpEdge = false;
	slideEdge = false;
	pauseEdge = false;
	confirmEdge = false;
	ptrId = null;
	startX = 0;
	startY = 0;
	startT = 0;
	swiped = false;
	unsubs = [];
	attach(el) {
		const onKeyDown = (e) => {
			if (GAME_KEYS.has(e.code)) e.preventDefault();
			this.keys.add(e.code);
		};
		const onKeyUp = (e) => {
			this.keys.delete(e.code);
		};
		const clear = () => this.keys.clear();
		const onDown = (e) => {
			if (this.ptrId != null) return;
			this.ptrId = e.pointerId;
			this.startX = e.clientX;
			this.startY = e.clientY;
			this.startT = performance.now();
			this.swiped = false;
			try {
				el.setPointerCapture(e.pointerId);
			} catch {}
		};
		const onMove = (e) => {
			if (e.pointerId !== this.ptrId || this.swiped) return;
			const dx = e.clientX - this.startX;
			const dy = e.clientY - this.startY;
			if (Math.abs(dy) > 28 && Math.abs(dy) > Math.abs(dx) * .85) {
				this.swiped = true;
				if (dy < 0) this.jumpEdge = true;
				else this.slideEdge = true;
			}
		};
		const onUp = (e) => {
			if (e.pointerId !== this.ptrId) return;
			this.ptrId = null;
		};
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", clear);
		document.addEventListener("visibilitychange", () => {
			if (document.hidden) this.keys.clear();
		});
		el.addEventListener("pointerdown", onDown);
		el.addEventListener("pointermove", onMove);
		el.addEventListener("pointerup", onUp);
		el.addEventListener("pointercancel", onUp);
		this.unsubs.push(() => window.removeEventListener("keydown", onKeyDown), () => window.removeEventListener("keyup", onKeyUp), () => window.removeEventListener("blur", clear), () => el.removeEventListener("pointerdown", onDown), () => el.removeEventListener("pointermove", onMove), () => el.removeEventListener("pointerup", onUp), () => el.removeEventListener("pointercancel", onUp));
	}
	pulseJump() {
		this.jumpEdge = true;
	}
	pulseSlide() {
		this.slideEdge = true;
	}
	pulsePause() {
		this.pauseEdge = true;
	}
	poll() {
		const jumpHeld = this.keys.has("Space") || this.keys.has("ArrowUp") || this.keys.has("KeyW");
		const slideHeld = this.keys.has("ArrowDown") || this.keys.has("KeyS");
		const pauseHeld = this.keys.has("Escape") || this.keys.has("KeyP");
		const confirmHeld = this.keys.has("Enter") || this.keys.has("Space");
		const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : null;
		let padJump = false;
		let padSlide = false;
		let padPause = false;
		if (pads) for (const p of pads) {
			if (!p) continue;
			if (p.buttons[0]?.pressed || p.buttons[12]?.pressed) padJump = true;
			if (p.buttons[1]?.pressed || p.buttons[13]?.pressed) padSlide = true;
			if (p.buttons[9]?.pressed) padPause = true;
		}
		const jumpNow = jumpHeld || padJump;
		const slideNow = slideHeld || padSlide;
		const pauseNow = pauseHeld || padPause;
		const confirmNow = confirmHeld;
		this.jump = this.jumpEdge || jumpNow;
		this.slide = this.slideEdge || slideNow;
		this.pause = this.pauseEdge || pauseNow;
		this.confirm = this.confirmEdge || confirmNow;
		this.justJump = this.jumpEdge || jumpNow && !this.prevJump;
		this.justSlide = this.slideEdge || slideNow && !this.prevSlide;
		this.justPause = this.pauseEdge || pauseNow && !this.prevPause;
		this.justConfirm = this.confirmEdge || confirmNow && !this.prevConfirm;
		this.prevJump = jumpNow;
		this.prevSlide = slideNow;
		this.prevPause = pauseNow;
		this.prevConfirm = confirmNow;
		this.jumpEdge = false;
		this.slideEdge = false;
		this.pauseEdge = false;
		this.confirmEdge = false;
	}
	justJump = false;
	justSlide = false;
	justPause = false;
	justConfirm = false;
	prevJump = false;
	prevSlide = false;
	prevPause = false;
	prevConfirm = false;
	dispose() {
		for (const u of this.unsubs) u();
		this.unsubs = [];
	}
};
var KEY = "sikkah-save-v1";
var VERSION = 1;
var defaults = {
	version: VERSION,
	highScore: 0,
	bestDistance: 0,
	unlockedStage: 0,
	bestCombo: 0,
	muted: false
};
function migrate(raw) {
	const s = {
		...defaults,
		...raw,
		version: VERSION
	};
	s.unlockedStage = Math.max(0, Math.min(3, Math.floor(s.unlockedStage) || 0));
	s.highScore = Math.max(0, s.highScore || 0);
	s.bestDistance = Math.max(0, s.bestDistance || 0);
	s.bestCombo = Math.max(0, s.bestCombo || 0);
	s.muted = Boolean(s.muted);
	return s;
}
function loadSave() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return { ...defaults };
		return migrate(JSON.parse(raw));
	} catch {
		return { ...defaults };
	}
}
function writeSave(data) {
	try {
		localStorage.setItem(KEY, JSON.stringify({
			...data,
			version: VERSION
		}));
	} catch {}
}
var STAGES = [
	{
		id: 0,
		name: "الأزقة",
		subtitle: "حواجز وصناديق بين جدران المدينة",
		reward: 1,
		baseSpeed: 430,
		skyTop: "#10141c",
		skyBot: "#1c2430",
		movingFromStart: false,
		trainsFromStart: false,
		movingFromM: 4e3,
		trainFromM: 1e4,
		accent: "#c4b8a4"
	},
	{
		id: 1,
		name: "الجسر",
		subtitle: "عربات متحركة ورياح عالية",
		reward: 1.5,
		baseSpeed: 470,
		skyTop: "#0c1218",
		skyBot: "#182028",
		movingFromStart: true,
		trainsFromStart: false,
		movingFromM: 0,
		trainFromM: 1e4,
		accent: "#b8c4cc"
	},
	{
		id: 2,
		name: "النفق",
		subtitle: "قطارات تزداد سرعتها مع التقدم",
		reward: 2,
		baseSpeed: 500,
		skyTop: "#07080a",
		skyBot: "#101214",
		movingFromStart: true,
		trainsFromStart: true,
		movingFromM: 0,
		trainFromM: 0,
		accent: "#d4c4a0"
	},
	{
		id: 3,
		name: "الاندفاع",
		subtitle: "كل العقبات. أقصى سرعة. أعلى مكافأة.",
		reward: 3,
		baseSpeed: 540,
		skyTop: "#0a0c10",
		skyBot: "#161820",
		movingFromStart: true,
		trainsFromStart: true,
		movingFromM: 0,
		trainFromM: 0,
		accent: "#e8e4dc"
	}
];
var UNLOCK_DISTANCE = 2500;
var useGameUI = create((set) => ({
	screen: "title",
	score: 0,
	distance: 0,
	combo: 0,
	comboMult: 1,
	highScore: 0,
	bestDistance: 0,
	stageIndex: 0,
	unlockedStage: 0,
	maxCombo: 0,
	speed: 0,
	muted: false,
	isNewBest: false,
	runScore: 0,
	runDistance: 0,
	runCombo: 0,
	canNext: false,
	patch: (p) => set(p)
}));
var ctx = null;
var bus = null;
var muted = false;
var musicTimer = null;
var musicStep = 0;
var musicSpeed = 1;
function ac() {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const C = window.AudioContext || window.webkitAudioContext;
		if (!C) return null;
		ctx = new C({ latencyHint: "interactive" });
		const master = ctx.createGain();
		const sfx = ctx.createGain();
		const music = ctx.createGain();
		sfx.gain.value = .7;
		music.gain.value = .18;
		master.gain.value = muted ? 0 : .9;
		sfx.connect(master);
		music.connect(master);
		master.connect(ctx.destination);
		bus = {
			master,
			sfx,
			music
		};
	}
	return ctx;
}
function unlockAudio() {
	const c = ac();
	if (c && c.state === "suspended") c.resume();
}
function setMuted(next) {
	muted = next;
	if (bus && ctx) bus.master.gain.setTargetAtTime(next ? 0 : .9, ctx.currentTime, .02);
}
function envGain(duration, peak, dest) {
	if (!ctx) return null;
	const g = ctx.createGain();
	g.gain.setValueAtTime(1e-4, ctx.currentTime);
	g.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + .012);
	g.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + duration);
	g.connect(dest);
	return g;
}
function noiseBuffer() {
	if (!ctx) return null;
	const len = ctx.sampleRate * .25;
	const buf = ctx.createBuffer(1, len, ctx.sampleRate);
	const d = buf.getChannelData(0);
	for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
	return buf;
}
var noise = null;
function sfxJump() {
	const c = ac();
	if (!c || !bus || muted) return;
	const o = c.createOscillator();
	o.type = "triangle";
	o.frequency.setValueAtTime(220, c.currentTime);
	o.frequency.exponentialRampToValueAtTime(520, c.currentTime + .09);
	const g = envGain(.16, .12, bus.sfx);
	if (!g) return;
	o.connect(g);
	o.start();
	o.stop(c.currentTime + .18);
}
function sfxSlide() {
	const c = ac();
	if (!c || !bus || muted) return;
	if (!noise) noise = noiseBuffer();
	if (!noise) return;
	const src = c.createBufferSource();
	src.buffer = noise;
	const f = c.createBiquadFilter();
	f.type = "bandpass";
	f.frequency.value = 900;
	f.Q.value = .7;
	const g = envGain(.22, .18, bus.sfx);
	if (!g) return;
	src.connect(f);
	f.connect(g);
	src.start();
}
function sfxLand() {
	const c = ac();
	if (!c || !bus || muted) return;
	const o = c.createOscillator();
	o.type = "sine";
	o.frequency.setValueAtTime(90, c.currentTime);
	o.frequency.exponentialRampToValueAtTime(40, c.currentTime + .08);
	const g = envGain(.1, .16, bus.sfx);
	if (!g) return;
	o.connect(g);
	o.start();
	o.stop(c.currentTime + .12);
}
function sfxCoin() {
	const c = ac();
	if (!c || !bus || muted) return;
	const o = c.createOscillator();
	o.type = "sine";
	const rate = 1 + (Math.random() * 2 - 1) * .06;
	o.frequency.setValueAtTime(880 * rate, c.currentTime);
	o.frequency.exponentialRampToValueAtTime(1320 * rate, c.currentTime + .06);
	const g = envGain(.12, .1, bus.sfx);
	if (!g) return;
	o.connect(g);
	o.start();
	o.stop(c.currentTime + .14);
}
function sfxCombo(level) {
	const c = ac();
	if (!c || !bus || muted) return;
	const o = c.createOscillator();
	o.type = "square";
	const f = 420 + Math.min(level, 16) * 28;
	o.frequency.setValueAtTime(f, c.currentTime);
	const g = envGain(.1, .06, bus.sfx);
	if (!g) return;
	o.connect(g);
	o.start();
	o.stop(c.currentTime + .11);
}
function sfxCrash() {
	const c = ac();
	if (!c || !bus || muted) return;
	if (!noise) noise = noiseBuffer();
	if (!noise) return;
	const src = c.createBufferSource();
	src.buffer = noise;
	const f = c.createBiquadFilter();
	f.type = "lowpass";
	f.frequency.setValueAtTime(1200, c.currentTime);
	f.frequency.exponentialRampToValueAtTime(180, c.currentTime + .28);
	const g = envGain(.4, .32, bus.sfx);
	if (!g) return;
	src.connect(f);
	f.connect(g);
	src.start();
	const o = c.createOscillator();
	o.type = "sawtooth";
	o.frequency.setValueAtTime(140, c.currentTime);
	o.frequency.exponentialRampToValueAtTime(40, c.currentTime + .3);
	const g2 = envGain(.32, .1, bus.sfx);
	if (!g2) return;
	o.connect(g2);
	o.start();
	o.stop(c.currentTime + .34);
}
function sfxNear() {
	const c = ac();
	if (!c || !bus || muted) return;
	const o = c.createOscillator();
	o.type = "sine";
	o.frequency.setValueAtTime(640, c.currentTime);
	o.frequency.exponentialRampToValueAtTime(980, c.currentTime + .08);
	const g = envGain(.1, .08, bus.sfx);
	if (!g) return;
	o.connect(g);
	o.start();
	o.stop(c.currentTime + .12);
}
var NOTES = [
	220,
	261.63,
	293.66,
	329.63,
	392,
	440
];
function tickMusic() {
	const c = ac();
	if (!c || !bus || muted) return;
	const n = NOTES[musicStep % NOTES.length];
	musicStep++;
	const o = c.createOscillator();
	o.type = "sine";
	o.frequency.value = n / 2;
	const g = envGain(.35, .09, bus.music);
	if (!g) return;
	const f = c.createBiquadFilter();
	f.type = "lowpass";
	f.frequency.value = 640;
	o.connect(f);
	f.connect(g);
	o.start();
	o.stop(c.currentTime + .4);
}
function setMusicSpeed(speedRatio) {
	musicSpeed = Math.max(.7, Math.min(1.8, speedRatio));
}
function startMusic() {
	stopMusic();
	const beat = () => {
		tickMusic();
		musicTimer = window.setTimeout(beat, 420 / musicSpeed);
	};
	beat();
}
function stopMusic() {
	if (musicTimer != null) {
		clearTimeout(musicTimer);
		musicTimer = null;
	}
}
function resumeAudio() {
	const c = ac();
	if (c && c.state === "suspended") c.resume();
}
function hash(n) {
	const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
}
function drawWorld(ctx, g, _alpha) {
	const { vw, vh, dpr, ground } = g;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, vw, vh);
	const shake = g.reducedMotion ? 0 : g.trauma * g.trauma;
	const t = g.time;
	const sx = shake * 12 * Math.sin(t * 73.1);
	const sy = shake * 9 * Math.sin(t * 91.7);
	ctx.save();
	ctx.translate(sx, sy);
	const stage = STAGES[g.stageIndex];
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
		ctx.fillStyle = `rgba(244,244,245,${g.hitFlash * .28})`;
		ctx.fillRect(0, 0, vw, vh);
	}
}
function drawSky(ctx, g, top, bot) {
	const grd = ctx.createLinearGradient(0, 0, 0, g.vh);
	grd.addColorStop(0, top);
	grd.addColorStop(.55, bot);
	grd.addColorStop(1, "#0a0a0b");
	ctx.fillStyle = grd;
	ctx.fillRect(0, 0, g.vw, g.vh);
	const glow = ctx.createRadialGradient(g.vw * .72, g.vh * .18, 10, g.vw * .72, g.vh * .18, g.vw * .5);
	glow.addColorStop(0, "rgba(196,180,140,0.14)");
	glow.addColorStop(1, "rgba(196,180,140,0)");
	ctx.fillStyle = glow;
	ctx.fillRect(0, 0, g.vw, g.vh);
}
function drawStars(ctx, g) {
	ctx.save();
	for (let i = 0; i < 48; i++) {
		const hx = hash(i * 19.2 + 2);
		const hy = hash(i * 7.7 + 4);
		const x = (hx * g.vw * 3 - g.worldX * .04) % (g.vw + 40) - 20;
		const y = hy * g.ground * .45 + 12;
		ctx.globalAlpha = .15 + hash(i + 9) * .45;
		ctx.fillStyle = "#e8e4dc";
		ctx.fillRect(x, y, 1.4, 1.4);
	}
	ctx.restore();
}
function drawFarCity(ctx, g) {
	const y0 = g.ground - 210;
	const scroll = g.worldX * .18;
	ctx.fillStyle = "#141820";
	let x = -(scroll % 220 + 220);
	let i = 0;
	while (x < g.vw + 80) {
		const h = 70 + hash(Math.floor((scroll + x) / 220) + i) * 140;
		const w = 70 + hash(i + 4) * 90;
		ctx.fillRect(x, y0 + (210 - h), w, h);
		x += w + 12;
		i++;
	}
}
function drawMidCity(ctx, g) {
	const scroll = g.worldX * .38;
	const base = g.ground;
	let x = -(scroll % 180 + 180);
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
		for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
			if (hash(seed + r * 11 + c) < .55) continue;
			ctx.fillStyle = hash(seed + r + c) > .72 ? "rgba(212,184,120,0.55)" : "rgba(160,176,188,0.28)";
			const wx = x + 10 + c * ((w - 16) / cols);
			const wy = base - h + 12 + r * ((h - 24) / rows);
			ctx.globalAlpha = .35 + lit * .4;
			ctx.fillRect(wx, wy, 6, 8);
			ctx.globalAlpha = 1;
		}
		x += w + 18;
		i++;
	}
}
function drawNearFacades(ctx, g) {
	const scroll = g.worldX * .72;
	const base = g.ground;
	let x = -(scroll % 260 + 260);
	let i = Math.floor(scroll / 260);
	while (x < g.vw + 140) {
		const seed = i * 23.1 + g.stageIndex;
		const h = 40 + hash(seed) * 90;
		ctx.fillStyle = "#12151a";
		ctx.fillRect(x, base - h, 40, h);
		ctx.fillStyle = "#0e1014";
		ctx.fillRect(x + 200, base - h * .7, 28, h * .7);
		if (hash(seed + 2) > .4) {
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
function drawGround(ctx, g) {
	const y = g.ground;
	ctx.fillStyle = "#0c0d10";
	ctx.fillRect(0, y, g.vw, g.vh - y);
	const strip = ctx.createLinearGradient(0, y - 8, 0, y + 18);
	strip.addColorStop(0, "rgba(200,196,188,0.16)");
	strip.addColorStop(.4, "#1c1e24");
	strip.addColorStop(1, "#0c0d10");
	ctx.fillStyle = strip;
	ctx.fillRect(0, y - 6, g.vw, 22);
	ctx.strokeStyle = "rgba(232,228,220,0.08)";
	ctx.lineWidth = 2;
	ctx.setLineDash([28, 22]);
	ctx.lineDashOffset = -(g.worldX * .9);
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
		for (let x = -off; x < g.vw; x += sleeper) ctx.fillRect(x, y + 3, 8, 16);
	}
}
function drawObstacles(ctx, g) {
	for (const o of g.obstacles) {
		if (!o.alive) continue;
		const x = o.x - g.worldX;
		if (x > g.vw + 40 || x + o.w < -40) continue;
		const bob = o.bobAmp ? Math.sin(g.time * o.bobFreq + o.bobPhase) * o.bobAmp : 0;
		drawObstacle(ctx, o, x, o.y + bob, g);
	}
}
function drawObstacle(ctx, o, x, y, g) {
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
			ctx.fillRect(x + 8, y - o.h * .45, o.w - 16, 6);
			break;
		case "awning":
		case "sign":
			ctx.fillStyle = "#1c2026";
			ctx.fillRect(x + o.w * .45, y - o.h - 40, 8, 40 + o.h);
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
		case "trainGap": drawTrain(ctx, x, y, o, g);
	}
	ctx.restore();
}
function drawTrain(ctx, x, y, o, g) {
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
	for (let i = 0; i < windows; i++) ctx.fillRect(x + 16 + i * 64, bodyY + 14, 28, 18);
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
}
function drawCoins(ctx, g) {
	for (const c of g.coins) {
		if (!c.alive) continue;
		const x = c.x - g.worldX;
		if (x < -20 || x > g.vw + 20) continue;
		const pulse = .85 + Math.sin(c.phase) * .15;
		ctx.save();
		ctx.translate(x, c.y);
		ctx.scale(pulse, 1);
		ctx.fillStyle = "#d4c4a0";
		ctx.beginPath();
		ctx.ellipse(0, 0, c.r, c.r * .92, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#efe6d2";
		ctx.beginPath();
		ctx.ellipse(-2, -2, c.r * .4, c.r * .35, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
}
function drawPlayer(ctx, p, g) {
	const cycle = g.worldX * .045 % (Math.PI * 2);
	const running = p.state === "run" && p.grounded;
	const sliding = p.state === "slide";
	const jumping = p.state === "jump";
	const crash = p.state === "crash";
	ctx.save();
	ctx.translate(p.x, p.y);
	ctx.scale(p.squashX, p.squashY);
	if (crash) ctx.rotate(p.crashRot);
	if (sliding) ctx.rotate(.95);
	ctx.fillStyle = "rgba(0,0,0,0.28)";
	ctx.beginPath();
	ctx.ellipse(0, 4, 22, 6, 0, 0, Math.PI * 2);
	ctx.fill();
	const swing = running ? Math.sin(cycle) : jumping ? .35 : sliding ? .1 : 0;
	const hipY = -28 - (running ? Math.abs(Math.sin(cycle * 2)) * 2 : 0);
	const torso = sliding ? -6 : -46;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	const drawLimb = (x0, y0, x1, y1, x2, y2, w, color) => {
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
	const armSwing = running ? -swing : jumping ? -.8 : sliding ? .4 : 0;
	drawLimb(10, torso + 10, 18 + armSwing * 8, torso + 22, 16 + armSwing * 16, torso + 34, 7, armColor);
	drawLimb(-10, torso + 12, -16 - armSwing * 8, torso + 22, -14 - armSwing * 14, torso + 32, 7, armColor);
	ctx.fillStyle = "#e8e4dc";
	ctx.beginPath();
	ctx.ellipse(-8 - swing * 16, -2, 7, 4, .2, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(10 + swing * 14, -2, 7, 4, -.2, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawParticles(ctx, g) {
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
function drawFloaters(ctx, g) {
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
function drawSpeedLines(ctx, g) {
	if (g.screen !== "playing") return;
	const intensity = Math.max(0, (g.liveSpeed() - 500) / 400);
	if (intensity < .05) return;
	ctx.strokeStyle = `rgba(244,244,245,${.05 + intensity * .08})`;
	ctx.lineWidth = 1.5;
	for (let i = 0; i < 10; i++) {
		const y = hash(i * 3.2 + Math.floor(g.worldX / 40)) * g.ground;
		const len = 30 + intensity * 80;
		const x = (hash(i + 2) * g.vw - g.worldX * (1.4 + intensity)) % (g.vw + 80) - 40;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + len, y);
		ctx.stroke();
	}
}
function drawVignette(ctx, vw, vh) {
	const v = ctx.createRadialGradient(vw * .45, vh * .5, vw * .2, vw * .45, vh * .5, vw * .75);
	v.addColorStop(0, "rgba(0,0,0,0)");
	v.addColorStop(1, "rgba(0,0,0,0.35)");
	ctx.fillStyle = v;
	ctx.fillRect(0, 0, vw, vh);
}
function roundRect(ctx, x, y, w, h, r) {
	const rr = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.arcTo(x + w, y, x + w, y + h, rr);
	ctx.arcTo(x + w, y + h, x, y + h, rr);
	ctx.arcTo(x, y + h, x, y, rr);
	ctx.arcTo(x, y, x + w, y, rr);
	ctx.closePath();
}
var STEP = 1 / 60;
var GRAVITY = 2350;
var JUMP_V = -860;
var MAX_FALL = 1550;
var SLIDE_DUR = .5;
var COYOTE = .11;
var JUMP_BUF = .13;
var STAND_W = 36;
var STAND_H = 82;
var SLIDE_W = 58;
var SLIDE_H = 34;
var SPEED_PER_K = 26;
var MAX_SPEED = 840;
var COMBO_DECAY = 2.4;
var PPM = 8;
function pool(n, make) {
	return Array.from({ length: n }, make);
}
var SikkahEngine = class {
	canvas;
	ctx;
	input = new Input();
	destroyed = false;
	acc = 0;
	last = 0;
	time = 0;
	screen = "title";
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
	lastAvoid = null;
	lastWasJump = false;
	save;
	player;
	obstacles;
	coins;
	particles;
	floaters;
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
	raf = 0;
	unsubVis = null;
	constructor(canvas) {
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
		this.speed = STAGES[0].baseSpeed;
		this.input.attach(canvas);
		setMuted(this.save.muted);
		this.pushUi({
			screen: "title",
			highScore: this.save.highScore,
			bestDistance: this.save.bestDistance,
			unlockedStage: this.save.unlockedStage,
			muted: this.save.muted,
			stageIndex: 0
		});
	}
	makePlayer() {
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
			blink: 0
		};
	}
	makeObstacle() {
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
			alive: false
		};
	}
	makeCoin() {
		return {
			x: 0,
			y: 0,
			r: 11,
			collected: false,
			alive: false,
			phase: 0
		};
	}
	makeParticle() {
		return {
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			life: 0,
			max: 1,
			r: 2,
			color: "#fff",
			g: 0,
			alive: false
		};
	}
	makeFloater() {
		return {
			x: 0,
			y: 0,
			text: "",
			life: 0,
			max: 1,
			color: "#fff",
			alive: false
		};
	}
	start() {
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
	destroy() {
		this.destroyed = true;
		cancelAnimationFrame(this.raf);
		this.input.dispose();
		this.unsubVis?.();
		window.removeEventListener("resize", this.resize);
		stopMusic();
	}
	resize = () => {
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
		this.ground = h * .8;
		this.playerX = Math.min(Math.max(w * .2, 96), 300);
		this.speedScale = Math.min(1.12, Math.max(.62, w / 980));
		if (this.player.state !== "crash") {
			this.player.x = this.playerX;
			if (this.player.grounded) this.player.y = this.ground;
		}
	};
	loop = (now) => {
		if (this.destroyed) return;
		let dt = (now - this.last) / 1e3;
		this.last = now;
		if (dt > .1) dt = .1;
		this.input.poll();
		this.handleMenuInput();
		if (this.hitstop > 0) this.hitstop -= dt;
		else if (this.screen === "playing") {
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
		if (this.uiClock > .08 || this.screen !== "playing") {
			this.uiClock = 0;
			this.syncHud();
		}
		this.raf = requestAnimationFrame(this.loop);
	};
	handleMenuInput() {
		if (this.input.justPause) {
			if (this.screen === "playing") this.pause();
			else if (this.screen === "paused") this.resume();
		}
	}
	toTitle() {
		stopMusic();
		this.screen = "title";
		this.resetRun();
		this.pushUi({
			screen: "title",
			stageIndex: this.stageIndex,
			highScore: this.save.highScore,
			bestDistance: this.save.bestDistance,
			unlockedStage: this.save.unlockedStage
		});
	}
	pause() {
		if (this.screen !== "playing") return;
		this.screen = "paused";
		stopMusic();
		this.pushUi({ screen: "paused" });
	}
	resume() {
		if (this.screen !== "paused") return;
		unlockAudio();
		this.screen = "playing";
		startMusic();
		this.last = performance.now();
		this.pushUi({ screen: "playing" });
	}
	selectStage(i) {
		if (i < 0 || i > this.save.unlockedStage) return;
		this.stageIndex = i;
		this.pushUi({ stageIndex: i });
	}
	beginRun() {
		unlockAudio();
		this.resetRun();
		this.screen = "playing";
		startMusic();
		this.pushUi({
			screen: "playing",
			score: 0,
			distance: 0,
			combo: 0,
			comboMult: 1
		});
	}
	replay() {
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
			isNewBest: false
		});
	}
	nextStage() {
		const n = Math.min(this.stageIndex + 1, 3);
		if (n > this.save.unlockedStage) return;
		this.stageIndex = n;
		this.pushUi({ stageIndex: n });
		this.replay();
	}
	toggleMute() {
		this.save.muted = !this.save.muted;
		setMuted(this.save.muted);
		writeSave(this.save);
		this.pushUi({ muted: this.save.muted });
	}
	resetRun() {
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
		this.nextSpawn = this.vw * .55;
		this.lastAvoid = null;
		this.lastWasJump = false;
		this.acc = 0;
		this.speed = STAGES[this.stageIndex].baseSpeed;
		this.player = this.makePlayer();
		for (const o of this.obstacles) o.alive = false;
		for (const c of this.coins) c.alive = false;
		for (const p of this.particles) p.alive = false;
		for (const f of this.floaters) f.alive = false;
	}
	meters() {
		return this.worldX / PPM;
	}
	comboMult() {
		return 1 + Math.min(this.combo, 20) * .1;
	}
	liveSpeed() {
		return this.speed * this.speedScale;
	}
	step(dt) {
		const stage = STAGES[this.stageIndex];
		const m = this.meters();
		const k = Math.floor(m / 1e3);
		this.speed = Math.min(MAX_SPEED, stage.baseSpeed + k * SPEED_PER_K);
		setMusicSpeed(this.liveSpeed() / 500);
		this.worldX += this.liveSpeed() * dt;
		this.time += dt;
		this.score += this.liveSpeed() * dt * .12 * stage.reward * this.comboMult();
		this.comboT -= dt;
		if (this.comboT <= 0 && this.combo > 0) {
			this.combo = Math.max(0, this.combo - 1);
			this.comboT = .55;
		}
		this.updatePlayer(dt);
		this.spawnAhead();
		this.updateObstacles(dt);
		this.updateCoins(dt);
		this.updateParticles(dt);
		this.updateFloaters(dt);
	}
	updatePlayer(dt) {
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
		if (p.jumpBuf > 0 && (p.grounded || p.coyote > 0)) {
			p.vy = JUMP_V;
			p.grounded = false;
			p.state = "jump";
			p.jumpBuf = 0;
			p.coyote = 0;
			p.w = STAND_W;
			p.h = STAND_H;
			p.slideT = 0;
			p.squashX = .86;
			p.squashY = 1.16;
			sfxJump();
			this.burst(p.x, this.ground, 8, "#c8c4bc", 80, -40);
		} else if (this.input.justSlide && p.state !== "slide" && p.grounded) {
			p.state = "slide";
			p.slideT = SLIDE_DUR;
			p.w = SLIDE_W;
			p.h = SLIDE_H;
			p.squashX = 1.18;
			p.squashY = .82;
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
				p.squashY = .78;
				sfxLand();
				this.burst(p.x, this.ground, 10, "#d8d4cc", 90, -70);
				if (!this.reducedMotion) this.trauma = Math.min(1, this.trauma + .12);
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
		if (p.state === "run" && p.grounded && hash(Math.floor(this.worldX / 28)) > .72) this.emit(p.x - 8, this.ground - 4, -40 - Math.random() * 30, -20 - Math.random() * 20, .28, 2.2, "#b8b4ac");
	}
	stepCrash(dt) {
		const p = this.player;
		p.crashT += dt;
		p.crashRot += dt * 2.4;
		p.vy += GRAVITY * .55 * dt;
		p.y += p.vy * dt;
		if (p.y > this.ground + 8) {
			p.y = this.ground + 8;
			p.vy *= -.22;
		}
		this.updateParticles(dt);
		this.updateFloaters(dt);
		if (this.screen === "playing" && p.crashT > .55) this.finishOver();
	}
	spawnAhead() {
		const viewRight = this.worldX + this.vw + 120;
		let guard = 0;
		while (this.nextSpawn < viewRight && guard++ < 8) this.placePattern(this.nextSpawn);
	}
	placePattern(at) {
		const stage = STAGES[this.stageIndex];
		const m = this.meters();
		const k = Math.floor(m / 1e3);
		const moving = m >= stage.movingFromM || stage.movingFromStart;
		const trains = m >= stage.trainFromM || stage.trainsFromStart;
		const gapMul = Math.max(.72, 1 - k * .045);
		const minGap = (this.liveSpeed() * .95 + 80) * gapMul;
		const roll = hash(at * .017 + this.stageIndex * 9.1 + k);
		let kind = "crate";
		let usedTrain = false;
		if (trains && roll > .76) {
			kind = roll > .92 ? "trainFast" : roll > .84 ? "trainGap" : "trainLow";
			usedTrain = true;
		} else if (moving && roll > .56) kind = roll > .72 ? "drone" : "cart";
		else if (roll > .34) kind = roll > .48 ? "awning" : roll > .41 ? "pipe" : "sign";
		else kind = roll > .2 ? "barrier" : roll > .09 ? "crate" : "cone";
		const avoid = kind === "awning" || kind === "pipe" || kind === "sign" || kind === "trainGap" || kind === "drone" ? "slide" : "jump";
		let spawnX = at;
		if (this.lastAvoid && avoid !== this.lastAvoid && this.lastWasJump) spawnX = at + minGap * .4;
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
		const extra = usedTrain ? this.liveSpeed() * .5 : 0;
		this.nextSpawn = spawnX + spec.w + minGap + extra + hash(at + 3) * 70;
	}
	kindSpec(kind, k, m) {
		const g = this.ground;
		const trainExtra = Math.max(0, m - 1e4);
		const trainVx = kind.startsWith("train") ? -(50 + Math.min(160, trainExtra * .02 + k * 6)) : 0;
		switch (kind) {
			case "crate": return {
				w: 54,
				h: 54,
				y: g,
				vx: 0,
				bobAmp: 0,
				bobFreq: 0
			};
			case "barrier": return {
				w: 78,
				h: 64,
				y: g,
				vx: 0,
				bobAmp: 0,
				bobFreq: 0
			};
			case "cone": return {
				w: 36,
				h: 48,
				y: g,
				vx: 0,
				bobAmp: 0,
				bobFreq: 0
			};
			case "awning": return {
				w: 110,
				h: 36,
				y: g - 58,
				vx: 0,
				bobAmp: 0,
				bobFreq: 0
			};
			case "pipe": return {
				w: 90,
				h: 28,
				y: g - 54,
				vx: 0,
				bobAmp: 0,
				bobFreq: 0
			};
			case "sign": return {
				w: 70,
				h: 40,
				y: g - 56,
				vx: 0,
				bobAmp: 0,
				bobFreq: 0
			};
			case "cart": return {
				w: 86,
				h: 58,
				y: g,
				vx: -70 - k * 8,
				bobAmp: 0,
				bobFreq: 0
			};
			case "drone": return {
				w: 64,
				h: 28,
				y: g - 62,
				vx: -40,
				bobAmp: 8,
				bobFreq: 2.2
			};
			case "trainLow": return {
				w: 260 + k * 12,
				h: 70,
				y: g,
				vx: trainVx,
				bobAmp: 0,
				bobFreq: 0
			};
			case "trainGap": return {
				w: 300 + k * 10,
				h: 86,
				y: g - 54,
				vx: trainVx,
				bobAmp: 0,
				bobFreq: 0
			};
			case "trainFast": return {
				w: 340 + k * 16,
				h: 76,
				y: g,
				vx: trainVx * 1.25,
				bobAmp: 0,
				bobFreq: 0
			};
		}
	}
	placeCoins(at, kind, spec) {
		const jump = kind === "crate" || kind === "barrier" || kind === "cone" || kind === "cart" || kind === "trainLow" || kind === "trainFast";
		const n = jump ? 5 : 4;
		for (let i = 0; i < n; i++) {
			const c = this.coins.find((x) => !x.alive);
			if (!c) break;
			c.alive = true;
			c.collected = false;
			c.phase = i * .4;
			if (jump) {
				const t = n === 1 ? .5 : i / (n - 1);
				const arc = Math.sin(t * Math.PI);
				c.x = at + spec.w * t;
				c.y = this.ground - spec.h - 36 - arc * 70;
			} else {
				c.x = at + 18 + i * (spec.w / (n + .5));
				c.y = this.ground - 18;
			}
		}
	}
	updateObstacles(dt) {
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
			const ob = {
				x: screenX,
				y: oy - o.h,
				w: sweptW,
				h: o.h
			};
			if (this.hit(pb, ob)) {
				this.crash();
				return;
			}
			const passedLine = screenX + o.w < p.x - p.w * .5;
			if (!o.passed && passedLine) {
				o.passed = true;
				this.addCombo(1);
				this.score += 40 * this.comboMult() * STAGES[this.stageIndex].reward;
				this.float(p.x + 20, p.y - p.h - 10, `+${Math.round(40 * this.comboMult())}`, "#e8e4dc");
			}
			if (!o.nearMissed && !o.passed) {
				const tight = {
					x: screenX,
					y: oy - o.h,
					w: o.w,
					h: o.h
				};
				const gap = this.boxGap(pb, tight);
				if (gap > 0 && gap < 22) {
					o.nearMissed = true;
					this.addCombo(2);
					this.score += 90 * this.comboMult() * STAGES[this.stageIndex].reward;
					this.float(p.x + 10, p.y - p.h - 28, "قريب!", "#c4a574");
					sfxNear();
					if (!this.reducedMotion) this.trauma = Math.min(1, this.trauma + .18);
				}
			}
		}
	}
	updateCoins(dt) {
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
			if (pb.x < sx + c.r && pb.x + pb.w > sx - c.r && pb.y < c.y + c.r && pb.y + pb.h > c.y - c.r) {
				c.collected = true;
				c.alive = false;
				this.score += 25 * this.comboMult() * STAGES[this.stageIndex].reward;
				sfxCoin();
				this.burst(sx, c.y, 7, "#e8d5a3", 60, -40);
				this.float(sx, c.y - 12, `+${Math.round(25 * this.comboMult())}`, "#e8d5a3");
			}
		}
	}
	playerBox() {
		const p = this.player;
		return {
			x: p.x - p.w * .5 + 6,
			y: p.y - p.h + 4,
			w: p.w - 12,
			h: p.h - 6
		};
	}
	hit(a, b) {
		return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
	}
	boxGap(a, b) {
		const dx = a.x + a.w < b.x ? b.x - (a.x + a.w) : b.x + b.w < a.x ? a.x - (b.x + b.w) : 0;
		const dy = a.y + a.h < b.y ? b.y - (a.y + a.h) : b.y + b.h < a.y ? a.y - (b.y + b.h) : 0;
		if (dx === 0 && dy === 0) return 0;
		return Math.hypot(dx, dy);
	}
	addCombo(n) {
		this.combo += n;
		this.comboT = COMBO_DECAY;
		if (this.combo > this.maxCombo) this.maxCombo = this.combo;
		if (this.combo > 0 && this.combo % 5 === 0) sfxCombo(this.combo);
	}
	crash() {
		if (this.player.state === "crash") return;
		this.player.state = "crash";
		this.player.crashT = 0;
		this.player.vy = -280;
		this.player.crashRot = -.2;
		this.hitstop = this.reducedMotion ? .02 : .09;
		this.hitFlash = 1;
		this.trauma = this.reducedMotion ? .15 : .85;
		sfxCrash();
		stopMusic();
		this.burst(this.player.x, this.player.y - 30, 22, "#d8d0c8", 220, -180);
		this.persistRun();
	}
	finishOver() {
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
			stageIndex: this.stageIndex
		});
	}
	persistRun() {
		const dist = Math.floor(this.meters());
		const sc = Math.floor(this.score);
		this.wasBest = sc > this.save.highScore;
		let unlocked = this.save.unlockedStage;
		if (dist >= 2500 && this.stageIndex === unlocked && unlocked < 3) unlocked += 1;
		this.save = {
			...this.save,
			highScore: Math.max(this.save.highScore, sc),
			bestDistance: Math.max(this.save.bestDistance, dist),
			bestCombo: Math.max(this.save.bestCombo, this.maxCombo),
			unlockedStage: unlocked
		};
		writeSave(this.save);
	}
	emit(x, y, vx, vy, life, r, color) {
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
	burst(x, y, n, color, spd, lift) {
		for (let i = 0; i < n; i++) {
			const a = -Math.PI * .15 - Math.random() * Math.PI * .7;
			const s = spd * (.35 + Math.random());
			this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s + lift * .2, .35 + Math.random() * .35, 1.6 + Math.random() * 2.4, color);
		}
	}
	float(x, y, text, color) {
		const f = this.floaters.find((q) => !q.alive);
		if (!f) return;
		f.alive = true;
		f.x = x;
		f.y = y;
		f.text = text;
		f.color = color;
		f.life = .7;
		f.max = .7;
	}
	updateParticles(dt) {
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
	updateFloaters(dt) {
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
	decayJuice(dt) {
		this.trauma = Math.max(0, this.trauma - dt * 1.6);
		this.hitFlash = Math.max(0, this.hitFlash - dt * 3.2);
	}
	pushUi(p) {
		useGameUI.getState().patch(p);
	}
	syncHud() {
		if (this.screen !== "playing") return;
		this.pushUi({
			screen: "playing",
			score: Math.floor(this.score),
			distance: Math.floor(this.meters()),
			combo: this.combo,
			comboMult: this.comboMult(),
			speed: Math.round(this.liveSpeed()),
			stageIndex: this.stageIndex
		});
	}
};
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,border-color] duration-[var(--motion-quick)] ease-[var(--ease-smooth-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-surface text-fg border border-border hover:bg-surface-2",
			ghost: "text-fg-muted hover:text-fg hover:bg-surface",
			danger: "bg-danger text-fg hover:opacity-90"
		},
		size: {
			default: "h-11 rounded-md px-5 text-sm",
			lg: "h-12 rounded-lg px-6 text-base",
			xl: "h-14 rounded-lg px-7 text-base",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
function GameOverlay({ onStart, onReplay, onNext, onPause, onResume, onMute, onSelectStage, onJump, onSlide, onTitle }) {
	const ui = useGameUI();
	const stage = STAGES[ui.stageIndex] ?? STAGES[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10 text-fg",
		children: [
			ui.screen === "playing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {
				ui,
				stageName: stage.name,
				onPause,
				onMute
			}),
			ui.screen === "playing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchPad, {
				onJump,
				onSlide
			}),
			ui.screen === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
				ui,
				onStart,
				onSelectStage,
				onMute
			}),
			ui.screen === "paused" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paused, {
				onResume,
				onTitle,
				onMute,
				muted: ui.muted
			}),
			ui.screen === "over" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOver, {
				ui,
				onReplay,
				onNext,
				onTitle
			})
		]
	});
}
function Hud({ ui, stageName, onPause, onMute }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-fg-muted",
					children: stageName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-2xl font-medium tabular-nums leading-none text-fg sm:text-3xl",
					children: [ui.distance.toLocaleString("ar-EG"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ms-1 text-sm text-fg-muted",
						children: "م"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-sm tabular-nums text-fg-muted",
					children: ui.score.toLocaleString("ar-EG")
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-end gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					onClick: onMute,
					label: ui.muted ? "صوت" : "كتم",
					children: ui.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					onClick: onPause,
					label: "إيقاف",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {})
				})]
			}), ui.combo > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border bg-surface/80 px-3 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center font-mono text-lg font-medium tabular-nums leading-none",
					children: ["×", ui.comboMult.toFixed(1)]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-center text-[11px] text-fg-muted",
					children: ["كومبو ", ui.combo]
				})]
			})]
		})]
	});
}
function TouchPad({ onJump, onSlide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "ltr",
		className: "pointer-events-none absolute inset-x-0 bottom-0 flex justify-between gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onPointerDown: (e) => {
				e.preventDefault();
				onSlide();
			},
			className: "pointer-events-auto h-16 min-w-28 rounded-lg border border-border bg-surface/70 px-5 text-sm font-medium text-fg backdrop-blur-sm",
			children: "تزحلق"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onPointerDown: (e) => {
				e.preventDefault();
				onJump();
			},
			className: "pointer-events-auto h-16 min-w-28 rounded-lg bg-accent px-5 text-sm font-medium text-accent-fg",
			children: "قفز"
		})]
	});
}
function Title({ ui, onStart, onSelectStage, onMute }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto flex h-full flex-col justify-between bg-bg/55 px-5 py-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-[2px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.18em] text-fg-subtle",
					children: "SIKKAH"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					onClick: onMute,
					label: ui.muted ? "صوت" : "كتم",
					children: ui.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-5xl font-medium tracking-tight text-fg sm:text-6xl",
						children: "سكة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-sm text-base leading-relaxed text-fg-muted",
						children: "اركض. اقفز بالسحب للأعلى. تزحلق بالسحب للأسفل. العقبات تتسارع كل ألف متر."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-6 flex gap-6 font-mono text-sm tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-fg-subtle",
							children: "أفضل نتيجة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 text-lg text-fg",
							children: ui.highScore.toLocaleString("ar-EG")
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-fg-subtle",
							children: "أبعد مسافة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
							className: "mt-1 text-lg text-fg",
							children: [ui.bestDistance.toLocaleString("ar-EG"), " م"]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: STAGES.map((s, i) => {
							const locked = i > ui.unlockedStage;
							const active = i === ui.stageIndex;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: locked,
								onClick: () => onSelectStage(i),
								className: cn("rounded-lg border px-3 py-3 text-right transition-[border-color,background-color] duration-[var(--motion-quick)]", active ? "border-accent bg-surface-2" : "border-border bg-surface", locked && "opacity-40"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: s.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-fg-muted",
									children: locked ? `افتح عند ${UNLOCK_DISTANCE.toLocaleString("ar-EG")} م` : `مكافأة ×${s.reward}`
								})]
							}, s.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "xl",
						className: "mt-8 w-full",
						onClick: onStart,
						children: "ابدأ الجري"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-center text-xs text-fg-subtle",
						children: "مسافة أو ↑ للقفز · ↓ للتزحلق · اسحب على الشاشة"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {})
		]
	});
}
function Paused({ onResume, onTitle, onMute, muted }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto flex h-full items-center justify-center bg-bg/70 px-5 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-xl border border-border bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-medium",
					children: "إيقاف"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-fg-muted",
					children: "العالم ما زال ينتظر على السكة."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							onClick: onResume,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}), " متابعة"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							variant: "secondary",
							onClick: onMute,
							children: [muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {}), muted ? "تشغيل الصوت" : "كتم الصوت"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							variant: "ghost",
							onClick: onTitle,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {}), " القائمة"]
						})
					]
				})
			]
		})
	});
}
function GameOver({ ui, onReplay, onNext, onTitle }) {
	const stage = STAGES[ui.stageIndex] ?? STAGES[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto flex h-full items-end justify-center bg-bg/60 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 backdrop-blur-[3px] sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-xl border border-border bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.16em] text-fg-subtle",
					children: "اصطدام"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-3xl font-medium tracking-tight",
					children: ui.isNewBest ? "رقم قياسي" : "انتهت الجولة"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-fg-muted",
					children: [
						stage.name,
						" · مكافأة ×",
						stage.reward
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 font-mono tabular-nums",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "النقاط",
							value: ui.runScore.toLocaleString("ar-EG")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "المسافة",
							value: `${ui.runDistance.toLocaleString("ar-EG")} م`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "أقصى كومبو",
							value: String(ui.runCombo)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-fg-subtle",
					children: [
						"الأفضل ",
						ui.highScore.toLocaleString("ar-EG"),
						" · ",
						ui.bestDistance.toLocaleString("ar-EG"),
						" م"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							onClick: onReplay,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {}), " إعادة اللعب"]
						}),
						ui.canNext ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							variant: "secondary",
							onClick: onNext,
							children: "المرحلة التالية"
						}) : ui.stageIndex < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "py-2 text-center text-xs text-fg-subtle",
							children: [
								"اقطع ",
								UNLOCK_DISTANCE.toLocaleString("ar-EG"),
								" م لفتح المرحلة التالية"
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							variant: "ghost",
							onClick: onTitle,
							children: "القائمة"
						})
					]
				})
			]
		})
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-[11px] text-fg-subtle",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-1 text-base text-fg",
		children: value
	})] });
}
function IconBtn({ onClick, label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "pointer-events-auto grid size-11 place-items-center rounded-md border border-border bg-surface/80 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "[&>svg]:size-4",
			children
		})
	});
}
function SikkahGame() {
	const canvasRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const engine = new SikkahEngine(canvas);
		engineRef.current = engine;
		engine.start();
		return () => {
			engine.destroy();
			engineRef.current = null;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "absolute inset-0 h-full w-full touch-none select-none",
			onContextMenu: (ev) => ev.preventDefault()
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOverlay, {
			onStart: () => engineRef.current?.beginRun(),
			onReplay: () => engineRef.current?.replay(),
			onNext: () => engineRef.current?.nextStage(),
			onPause: () => engineRef.current?.pause(),
			onResume: () => engineRef.current?.resume(),
			onMute: () => engineRef.current?.toggleMute(),
			onSelectStage: (i) => engineRef.current?.selectStage(i),
			onJump: () => engineRef.current?.input.pulseJump(),
			onSlide: () => engineRef.current?.input.pulseSlide(),
			onTitle: () => engineRef.current?.toTitle()
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "h-dvh w-full overflow-hidden bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SikkahGame, {})
	});
}
//#endregion
export { Home as component };
