import { LAST_ORDER, PARTS, RUN_START, TIMING, clamp01 } from "./layout";

// Where the build has got to. One instance is advanced once per frame and every part
// reads its own numbers from it, so nothing in the scene needs React state to animate.
export class Timeline {
  readonly draw: number[]; // 0..1, how much of each part's plan outline is drawn
  readonly land: number[]; // 0..1, how far each part has travelled to its place
  readonly since: number[]; // seconds since each part locked in; negative while it travels
  wiring: number; // 0..1, how much of the wiring is drawn
  run: number; // seconds since the system started running; negative during the build
  landed: number; // the highest assembly order whose parts have all landed

  constructor(readonly animate: boolean) {
    const done = animate ? 0 : 1;
    this.draw = PARTS.map(() => done);
    this.land = PARTS.map(() => done);
    this.since = PARTS.map(() => (animate ? -1 : 60));
    this.wiring = done;
    this.run = animate ? -RUN_START : 0;
    this.landed = animate ? 0 : LAST_ORDER;
  }

  // Requests only flow once everything has landed, and never when motion is reduced.
  get running() {
    return this.animate && this.run >= 0;
  }

  update(elapsed: number) {
    if (!this.animate) return;
    let landed = LAST_ORDER;
    PARTS.forEach((part, i) => {
      const step = part.order - 1;
      const travel = part.order === 0 ? TIMING.boardSeconds : TIMING.landSeconds;
      const lockAt = part.order === 0 ? TIMING.boardSeconds : TIMING.landStart + step * TIMING.landStagger + TIMING.landSeconds;
      this.draw[i] = clamp01((elapsed - TIMING.planStart - step * TIMING.planStagger) / TIMING.planSeconds);
      this.land[i] = clamp01(1 - (lockAt - elapsed) / travel);
      this.since[i] = elapsed - lockAt;
      if (this.land[i] < 1) landed = Math.min(landed, part.order - 1);
    });
    this.landed = Math.max(0, landed);
    this.wiring = clamp01((elapsed - TIMING.wiringStart) / TIMING.wiringSeconds);
    this.run = elapsed - RUN_START;
  }
}

// A short flash on a part when a request reaches it. Requests raise the level to 1 and
// it falls away on its own.
export class Signals {
  private readonly levels = new Map<string, number>();

  bump(id: string) {
    this.levels.set(id, 1);
  }

  level(id: string) {
    return this.levels.get(id) ?? 0;
  }

  decay(delta: number) {
    this.levels.forEach((v, id) => this.levels.set(id, Math.max(0, v - delta * 2.4)));
  }
}
