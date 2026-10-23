export type Screen = "title" | "playing" | "paused" | "over";

export type Avoid = "jump" | "slide";

export type ObstacleKind =
  | "crate"
  | "barrier"
  | "cone"
  | "awning"
  | "pipe"
  | "sign"
  | "cart"
  | "drone"
  | "trainLow"
  | "trainGap"
  | "trainFast";

export interface Obstacle {
  kind: ObstacleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  bobAmp: number;
  bobFreq: number;
  bobPhase: number;
  avoid: Avoid;
  passed: boolean;
  nearMissed: boolean;
  alive: boolean;
}

export interface Coin {
  x: number;
  y: number;
  r: number;
  collected: boolean;
  alive: boolean;
  phase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  color: string;
  g: number;
  alive: boolean;
}

export interface Floater {
  x: number;
  y: number;
  text: string;
  life: number;
  max: number;
  color: string;
  alive: boolean;
}

export type PlayerState = "run" | "jump" | "slide" | "crash";

export interface Player {
  x: number;
  y: number;
  vy: number;
  w: number;
  h: number;
  state: PlayerState;
  grounded: boolean;
  coyote: number;
  jumpBuf: number;
  slideT: number;
  squashX: number;
  squashY: number;
  crashT: number;
  crashRot: number;
  blink: number;
}

export interface StageDef {
  id: number;
  name: string;
  subtitle: string;
  reward: number;
  baseSpeed: number;
  skyTop: string;
  skyBot: string;
  movingFromStart: boolean;
  trainsFromStart: boolean;
  trainFromM: number;
  movingFromM: number;
  accent: string;
}
