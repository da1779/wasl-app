import { useEffect, useRef } from "react";
import { SikkahEngine } from "@/game/engine";
import { GameOverlay } from "./GameOverlay";

export function SikkahGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SikkahEngine | null>(null);

  useEffect(() => {
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
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

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none select-none"
        onContextMenu={(ev) => ev.preventDefault()}
      />
      <GameOverlay
        onStart={() => engineRef.current?.beginRun()}
        onReplay={() => engineRef.current?.replay()}
        onNext={() => engineRef.current?.nextStage()}
        onPause={() => engineRef.current?.pause()}
        onResume={() => engineRef.current?.resume()}
        onMute={() => engineRef.current?.toggleMute()}
        onSelectStage={(i) => engineRef.current?.selectStage(i)}
        onJump={() => engineRef.current?.input.pulseJump()}
        onSlide={() => engineRef.current?.input.pulseSlide()}
        onTitle={() => engineRef.current?.toTitle()}
      />
    </div>
  );
}
