const KEY = "sikkah-save-v1";
const VERSION = 1;

export interface SaveData {
  version: number;
  highScore: number;
  bestDistance: number;
  unlockedStage: number;
  bestCombo: number;
  muted: boolean;
}

const defaults: SaveData = {
  version: VERSION,
  highScore: 0,
  bestDistance: 0,
  unlockedStage: 0,
  bestCombo: 0,
  muted: false,
};

function migrate(raw: SaveData): SaveData {
  const s = { ...defaults, ...raw, version: VERSION };
  s.unlockedStage = Math.max(0, Math.min(3, Math.floor(s.unlockedStage) || 0));
  s.highScore = Math.max(0, s.highScore || 0);
  s.bestDistance = Math.max(0, s.bestDistance || 0);
  s.bestCombo = Math.max(0, s.bestCombo || 0);
  s.muted = Boolean(s.muted);
  return s;
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as SaveData;
    return migrate(parsed);
  } catch {
    return { ...defaults };
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, version: VERSION }));
  } catch {
    /* private mode / quota */
  }
}
