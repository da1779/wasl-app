import type { ReactNode } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STAGES, UNLOCK_DISTANCE } from "@/game/stages";
import { useGameUI } from "@/game/store";
import { cn } from "@/lib/utils";

interface Props {
  onStart: () => void;
  onReplay: () => void;
  onNext: () => void;
  onPause: () => void;
  onResume: () => void;
  onMute: () => void;
  onSelectStage: (i: number) => void;
  onJump: () => void;
  onSlide: () => void;
  onTitle: () => void;
}

export function GameOverlay({
  onStart,
  onReplay,
  onNext,
  onPause,
  onResume,
  onMute,
  onSelectStage,
  onJump,
  onSlide,
  onTitle,
}: Props) {
  const ui = useGameUI();
  const stage = STAGES[ui.stageIndex] ?? STAGES[0]!;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-fg">
      {ui.screen === "playing" && <Hud ui={ui} stageName={stage.name} onPause={onPause} onMute={onMute} />}
      {ui.screen === "playing" && <TouchPad onJump={onJump} onSlide={onSlide} />}
      {ui.screen === "title" && (
        <Title
          ui={ui}
          onStart={onStart}
          onSelectStage={onSelectStage}
          onMute={onMute}
        />
      )}
      {ui.screen === "paused" && <Paused onResume={onResume} onTitle={onTitle} onMute={onMute} muted={ui.muted} />}
      {ui.screen === "over" && (
        <GameOver ui={ui} onReplay={onReplay} onNext={onNext} onTitle={onTitle} />
      )}
    </div>
  );
}

function Hud({
  ui,
  stageName,
  onPause,
  onMute,
}: {
  ui: ReturnType<typeof useGameUI.getState>;
  stageName: string;
  onPause: () => void;
  onMute: () => void;
}) {
  return (
    <div className="pointer-events-none flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-5">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-fg-muted">{stageName}</p>
        <p className="font-mono text-2xl font-medium tabular-nums leading-none text-fg sm:text-3xl">
          {ui.distance.toLocaleString("ar-EG")}
          <span className="ms-1 text-sm text-fg-muted">م</span>
        </p>
        <p className="font-mono text-sm tabular-nums text-fg-muted">{ui.score.toLocaleString("ar-EG")}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="pointer-events-auto flex gap-2">
          <IconBtn onClick={onMute} label={ui.muted ? "صوت" : "كتم"}>
            {ui.muted ? <VolumeX /> : <Volume2 />}
          </IconBtn>
          <IconBtn onClick={onPause} label="إيقاف">
            <Pause />
          </IconBtn>
        </div>
        {ui.combo > 1 && (
          <div className="rounded-md border border-border bg-surface/80 px-3 py-1.5">
            <p className="text-center font-mono text-lg font-medium tabular-nums leading-none">
              ×{ui.comboMult.toFixed(1)}
            </p>
            <p className="mt-0.5 text-center text-[11px] text-fg-muted">كومبو {ui.combo}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TouchPad({ onJump, onSlide }: { onJump: () => void; onSlide: () => void }) {
  return (
    <div
      dir="ltr"
      className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden"
    >
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onSlide();
        }}
        className="pointer-events-auto h-16 min-w-28 rounded-lg border border-border bg-surface/70 px-5 text-sm font-medium text-fg backdrop-blur-sm"
      >
        تزحلق
      </button>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onJump();
        }}
        className="pointer-events-auto h-16 min-w-28 rounded-lg bg-accent px-5 text-sm font-medium text-accent-fg"
      >
        قفز
      </button>
    </div>
  );
}

function Title({
  ui,
  onStart,
  onSelectStage,
  onMute,
}: {
  ui: ReturnType<typeof useGameUI.getState>;
  onStart: () => void;
  onSelectStage: (i: number) => void;
  onMute: () => void;
}) {
  return (
    <div className="pointer-events-auto flex h-full flex-col justify-between bg-bg/55 px-5 py-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-[2px]">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-fg-subtle">SIKKAH</p>
        <IconBtn onClick={onMute} label={ui.muted ? "صوت" : "كتم"}>
          {ui.muted ? <VolumeX /> : <Volume2 />}
        </IconBtn>
      </div>

      <div className="mx-auto w-full max-w-md">
        <h1 className="text-5xl font-medium tracking-tight text-fg sm:text-6xl">سكة</h1>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-fg-muted">
          اركض. اقفز بالسحب للأعلى. تزحلق بالسحب للأسفل. العقبات تتسارع كل ألف متر.
        </p>
        <dl className="mt-6 flex gap-6 font-mono text-sm tabular-nums">
          <div>
            <dt className="text-fg-subtle">أفضل نتيجة</dt>
            <dd className="mt-1 text-lg text-fg">{ui.highScore.toLocaleString("ar-EG")}</dd>
          </div>
          <div>
            <dt className="text-fg-subtle">أبعد مسافة</dt>
            <dd className="mt-1 text-lg text-fg">{ui.bestDistance.toLocaleString("ar-EG")} م</dd>
          </div>
        </dl>

        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STAGES.map((s, i) => {
            const locked = i > ui.unlockedStage;
            const active = i === ui.stageIndex;
            return (
              <button
                key={s.id}
                type="button"
                disabled={locked}
                onClick={() => onSelectStage(i)}
                className={cn(
                  "rounded-lg border px-3 py-3 text-start transition-[border-color,background-color] duration-[var(--motion-quick)]",
                  active ? "border-accent bg-surface-2" : "border-border bg-surface",
                  locked && "opacity-40",
                )}
              >
                <p className="text-sm font-medium">{s.name}</p>
                <p className="mt-1 text-[11px] text-fg-muted">
                  {locked ? `افتح عند ${UNLOCK_DISTANCE.toLocaleString("ar-EG")} م` : `مكافأة ×${s.reward}`}
                </p>
              </button>
            );
          })}
        </div>

        <Button size="xl" className="mt-8 w-full" onClick={onStart}>
          ابدأ الجري
        </Button>
        <p className="mt-3 text-center text-xs text-fg-subtle">
          مسافة أو ↑ للقفز · ↓ للتزحلق · اسحب على الشاشة
        </p>
      </div>
      <div />
    </div>
  );
}

function Paused({
  onResume,
  onTitle,
  onMute,
  muted,
}: {
  onResume: () => void;
  onTitle: () => void;
  onMute: () => void;
  muted: boolean;
}) {
  return (
    <div className="pointer-events-auto flex h-full items-center justify-center bg-bg/70 px-5 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6">
        <h2 className="text-2xl font-medium">إيقاف</h2>
        <p className="mt-2 text-sm text-fg-muted">العالم ما زال ينتظر على السكة.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={onResume}>
            <Play /> متابعة
          </Button>
          <Button size="lg" variant="secondary" onClick={onMute}>
            {muted ? <VolumeX /> : <Volume2 />}
            {muted ? "تشغيل الصوت" : "كتم الصوت"}
          </Button>
          <Button size="lg" variant="ghost" onClick={onTitle}>
            <ChevronLeft /> القائمة
          </Button>
        </div>
      </div>
    </div>
  );
}

function GameOver({
  ui,
  onReplay,
  onNext,
  onTitle,
}: {
  ui: ReturnType<typeof useGameUI.getState>;
  onReplay: () => void;
  onNext: () => void;
  onTitle: () => void;
}) {
  const stage = STAGES[ui.stageIndex] ?? STAGES[0]!;
  return (
    <div className="pointer-events-auto flex h-full items-end justify-center bg-bg/60 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 backdrop-blur-[3px] sm:items-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-fg-subtle">اصطدام</p>
        <h2 className="mt-2 text-3xl font-medium tracking-tight">
          {ui.isNewBest ? "رقم قياسي" : "انتهت الجولة"}
        </h2>
        <p className="mt-2 text-sm text-fg-muted">
          {stage.name} · مكافأة ×{stage.reward}
        </p>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 font-mono tabular-nums">
          <Stat label="النقاط" value={ui.runScore.toLocaleString("ar-EG")} />
          <Stat label="المسافة" value={`${ui.runDistance.toLocaleString("ar-EG")} م`} />
          <Stat label="أقصى كومبو" value={String(ui.runCombo)} />
        </dl>
        <p className="mt-3 text-xs text-fg-subtle">
          الأفضل {ui.highScore.toLocaleString("ar-EG")} · {ui.bestDistance.toLocaleString("ar-EG")} م
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={onReplay}>
            <RotateCcw /> إعادة اللعب
          </Button>
          {ui.canNext ? (
            <Button size="lg" variant="secondary" onClick={onNext}>
              المرحلة التالية
            </Button>
          ) : ui.stageIndex < 3 ? (
            <p className="py-2 text-center text-xs text-fg-subtle">
              اقطع {UNLOCK_DISTANCE.toLocaleString("ar-EG")} م لفتح المرحلة التالية
            </p>
          ) : null}
          <Button size="lg" variant="ghost" onClick={onTitle}>
            القائمة
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-fg-subtle">{label}</dt>
      <dd className="mt-1 text-base text-fg">{value}</dd>
    </div>
  );
}

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="pointer-events-auto grid size-11 place-items-center rounded-md border border-border bg-surface/80 text-fg"
    >
      <span className="[&>svg]:size-4">{children}</span>
    </button>
  );
}
