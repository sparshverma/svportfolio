// Tiny rolling-average FPS meter. Zero allocations in the hot path.
export class FpsMeter {
  private buf: Float32Array;
  private idx = 0;
  private filled = 0;
  constructor(size = 60) {
    this.buf = new Float32Array(size);
  }
  push(deltaSeconds: number) {
    if (deltaSeconds <= 0) return;
    this.buf[this.idx] = 1 / deltaSeconds;
    this.idx = (this.idx + 1) % this.buf.length;
    if (this.filled < this.buf.length) this.filled++;
  }
  avg(): number {
    if (this.filled === 0) return 0;
    let s = 0;
    for (let i = 0; i < this.filled; i++) s += this.buf[i];
    return s / this.filled;
  }
  reset() {
    this.idx = 0;
    this.filled = 0;
  }
}
