import { create } from "zustand";
import type { Screen } from "./types";

export interface GameUI {
  screen: Screen;
  score: number;
  distance: number;
  combo: number;
  comboMult: number;
  highScore: number;
  bestDistance: number;
  stageIndex: number;
  unlockedStage: number;
  maxCombo: number;
  speed: number;
  muted: boolean;
  isNewBest: boolean;
  runScore: number;
  runDistance: number;
  runCombo: number;
  canNext: boolean;
  patch: (p: Partial<Omit<GameUI, "patch">>) => void;
}

export const useGameUI = create<GameUI>((set) => ({
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
  patch: (p) => set(p),
}));
