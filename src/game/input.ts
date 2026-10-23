const GAME_KEYS = new Set([
  "Space",
  "ArrowUp",
  "ArrowDown",
  "KeyW",
  "KeyS",
  "Escape",
  "KeyP",
  "Enter",
]);

export class Input {
  keys = new Set<string>();
  jump = false;
  slide = false;
  pause = false;
  confirm = false;
  private jumpEdge = false;
  private slideEdge = false;
  private pauseEdge = false;
  private confirmEdge = false;
  private ptrId: number | null = null;
  private startX = 0;
  private startY = 0;
  private startT = 0;
  private swiped = false;
  private unsubs: Array<() => void> = [];

  attach(el: HTMLElement): void {
    const onKeyDown = (e: KeyboardEvent) => {
      if (GAME_KEYS.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(e.code);
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") this.jumpEdge = true;
      if (e.code === "ArrowDown" || e.code === "KeyS") this.slideEdge = true;
      if (e.code === "Escape" || e.code === "KeyP") this.pauseEdge = true;
      if (e.code === "Enter") this.confirmEdge = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.code);
    };
    const clear = () => this.keys.clear();
    const onDown = (e: PointerEvent) => {
      if (this.ptrId != null) return;
      this.ptrId = e.pointerId;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startT = performance.now();
      this.swiped = false;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== this.ptrId || this.swiped) return;
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      if (Math.abs(dy) > 28 && Math.abs(dy) > Math.abs(dx) * 0.85) {
        this.swiped = true;
        if (dy < 0) this.jumpEdge = true;
        else this.slideEdge = true;
      }
    };
    const onUp = (e: PointerEvent) => {
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

    this.unsubs.push(
      () => window.removeEventListener("keydown", onKeyDown),
      () => window.removeEventListener("keyup", onKeyUp),
      () => window.removeEventListener("blur", clear),
      () => el.removeEventListener("pointerdown", onDown),
      () => el.removeEventListener("pointermove", onMove),
      () => el.removeEventListener("pointerup", onUp),
      () => el.removeEventListener("pointercancel", onUp),
    );
  }

  pulseJump(): void {
    this.jumpEdge = true;
  }

  pulseSlide(): void {
    this.slideEdge = true;
  }

  pulsePause(): void {
    this.pauseEdge = true;
  }

  poll(): void {
    const jumpHeld =
      this.keys.has("Space") || this.keys.has("ArrowUp") || this.keys.has("KeyW");
    const slideHeld = this.keys.has("ArrowDown") || this.keys.has("KeyS");
    const pauseHeld = this.keys.has("Escape") || this.keys.has("KeyP");
    const confirmHeld = this.keys.has("Enter") || this.keys.has("Space");

    const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : null;
    let padJump = false;
    let padSlide = false;
    let padPause = false;
    if (pads) {
      for (const p of pads) {
        if (!p) continue;
        if (p.buttons[0]?.pressed || p.buttons[12]?.pressed) padJump = true;
        if (p.buttons[1]?.pressed || p.buttons[13]?.pressed) padSlide = true;
        if (p.buttons[9]?.pressed) padPause = true;
      }
    }

    const jumpNow = jumpHeld || padJump;
    const slideNow = slideHeld || padSlide;
    const pauseNow = pauseHeld || padPause;
    const confirmNow = confirmHeld;

    this.jump = this.jumpEdge || jumpNow;
    this.slide = this.slideEdge || slideNow;
    this.pause = this.pauseEdge || pauseNow;
    this.confirm = this.confirmEdge || confirmNow;

    this.justJump = this.jumpEdge || (jumpNow && !this.prevJump);
    this.justSlide = this.slideEdge || (slideNow && !this.prevSlide);
    this.justPause = this.pauseEdge || (pauseNow && !this.prevPause);
    this.justConfirm = this.confirmEdge || (confirmNow && !this.prevConfirm);

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
  private prevJump = false;
  private prevSlide = false;
  private prevPause = false;
  private prevConfirm = false;

  dispose(): void {
    for (const u of this.unsubs) u();
    this.unsubs = [];
  }
}
