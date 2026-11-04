/** Held arrows for keyboard dragging, independent of browser key-repeat timing. */
export class DragKeys {
  private held = new Set<string>();
  key(k: string, down: boolean): void {
    if (!k.startsWith('Arrow')) return;
    if (down) this.held.add(k); else this.held.delete(k);
  }
  clear(): void { this.held.clear(); }
  delta(dt: number): [number, number] {
    const x = Number(this.held.has('ArrowRight')) - Number(this.held.has('ArrowLeft'));
    const y = Number(this.held.has('ArrowDown')) - Number(this.held.has('ArrowUp'));
    const d = Math.hypot(x, y) || 1;
    return [x / d * 300 * dt, y / d * 300 * dt];
  }
}
