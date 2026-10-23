type Bus = { master: GainNode; sfx: GainNode; music: GainNode };

let ctx: AudioContext | null = null;
let bus: Bus | null = null;
let muted = false;
let musicTimer: number | null = null;
let musicStep = 0;
let musicSpeed = 1;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C({ latencyHint: "interactive" });
    const master = ctx.createGain();
    const sfx = ctx.createGain();
    const music = ctx.createGain();
    sfx.gain.value = 0.7;
    music.gain.value = 0.18;
    master.gain.value = muted ? 0 : 0.9;
    sfx.connect(master);
    music.connect(master);
    master.connect(ctx.destination);
    bus = { master, sfx, music };
  }
  return ctx;
}

export function unlockAudio(): void {
  const c = ac();
  if (c && c.state === "suspended") void c.resume();
}

export function setMuted(next: boolean): void {
  muted = next;
  if (bus && ctx) {
    bus.master.gain.setTargetAtTime(next ? 0 : 0.9, ctx.currentTime, 0.02);
  }
}

export function isMuted(): boolean {
  return muted;
}

function envGain(duration: number, peak: number, dest: AudioNode): GainNode | null {
  if (!ctx) return null;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  g.connect(dest);
  return g;
}

function noiseBuffer(): AudioBuffer | null {
  if (!ctx) return null;
  const len = ctx.sampleRate * 0.25;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

let noise: AudioBuffer | null = null;

export function sfxJump(): void {
  const c = ac();
  if (!c || !bus || muted) return;
  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(220, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(520, c.currentTime + 0.09);
  const g = envGain(0.16, 0.12, bus.sfx);
  if (!g) return;
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.18);
}

export function sfxSlide(): void {
  const c = ac();
  if (!c || !bus || muted) return;
  if (!noise) noise = noiseBuffer();
  if (!noise) return;
  const src = c.createBufferSource();
  src.buffer = noise;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 900;
  f.Q.value = 0.7;
  const g = envGain(0.22, 0.18, bus.sfx);
  if (!g) return;
  src.connect(f);
  f.connect(g);
  src.start();
}

export function sfxLand(): void {
  const c = ac();
  if (!c || !bus || muted) return;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(90, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.08);
  const g = envGain(0.1, 0.16, bus.sfx);
  if (!g) return;
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.12);
}

export function sfxCoin(): void {
  const c = ac();
  if (!c || !bus || muted) return;
  const o = c.createOscillator();
  o.type = "sine";
  const rate = 1 + (Math.random() * 2 - 1) * 0.06;
  o.frequency.setValueAtTime(880 * rate, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(1320 * rate, c.currentTime + 0.06);
  const g = envGain(0.12, 0.1, bus.sfx);
  if (!g) return;
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.14);
}

export function sfxCombo(level: number): void {
  const c = ac();
  if (!c || !bus || muted) return;
  const o = c.createOscillator();
  o.type = "square";
  const f = 420 + Math.min(level, 16) * 28;
  o.frequency.setValueAtTime(f, c.currentTime);
  const g = envGain(0.1, 0.06, bus.sfx);
  if (!g) return;
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.11);
}

export function sfxCrash(): void {
  const c = ac();
  if (!c || !bus || muted) return;
  if (!noise) noise = noiseBuffer();
  if (!noise) return;
  const src = c.createBufferSource();
  src.buffer = noise;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(1200, c.currentTime);
  f.frequency.exponentialRampToValueAtTime(180, c.currentTime + 0.28);
  const g = envGain(0.4, 0.32, bus.sfx);
  if (!g) return;
  src.connect(f);
  f.connect(g);
  src.start();

  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(140, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.3);
  const g2 = envGain(0.32, 0.1, bus.sfx);
  if (!g2) return;
  o.connect(g2);
  o.start();
  o.stop(c.currentTime + 0.34);
}

export function sfxTrain(): void {
  const c = ac();
  if (!c || !bus || muted) return;
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(110, c.currentTime);
  o.frequency.linearRampToValueAtTime(90, c.currentTime + 0.45);
  const g = envGain(0.5, 0.08, bus.sfx);
  if (!g) return;
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.52);
}

export function sfxNear(): void {
  const c = ac();
  if (!c || !bus || muted) return;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(640, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(980, c.currentTime + 0.08);
  const g = envGain(0.1, 0.08, bus.sfx);
  if (!g) return;
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.12);
}

const NOTES = [220, 261.63, 293.66, 329.63, 392, 440];

function tickMusic(): void {
  const c = ac();
  if (!c || !bus || muted) return;
  const n = NOTES[musicStep % NOTES.length]!;
  musicStep++;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.value = n / 2;
  const g = envGain(0.35, 0.09, bus.music);
  if (!g) return;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 640;
  o.connect(f);
  f.connect(g);
  o.start();
  o.stop(c.currentTime + 0.4);
}

export function setMusicSpeed(speedRatio: number): void {
  musicSpeed = Math.max(0.7, Math.min(1.8, speedRatio));
}

export function startMusic(): void {
  stopMusic();
  const beat = () => {
    tickMusic();
    musicTimer = window.setTimeout(beat, 420 / musicSpeed);
  };
  beat();
}

export function stopMusic(): void {
  if (musicTimer != null) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
}

export function resumeAudio(): void {
  const c = ac();
  if (c && c.state === "suspended") void c.resume();
}
