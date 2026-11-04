let ac: AudioContext | null = null;

type AudioCtor = typeof AudioContext;

export function unlockAudio(): void {
  try {
    if (!ac) {
      const Ctor: AudioCtor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
      if (!Ctor) return;
      ac = new Ctor();
    }
    if (ac.state === 'suspended') void ac.resume();
  } catch { ac = null; }
}

export type Sfx = 'win' | 'lose' | 'go';

export function sfx(kind: Sfx): void {
  if (!ac) return;
  const a = ac, n = a.currentTime;
  const tone = (f: number, t: number, d: number, type: OscillatorType = 'square', v = 0.05) => {
    const o = a.createOscillator(), gn = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, n + t);
    gn.gain.setValueAtTime(v, n + t); gn.gain.exponentialRampToValueAtTime(0.0001, n + t + d);
    o.connect(gn).connect(a.destination); o.start(n + t); o.stop(n + t + d);
  };
  if (kind === 'win') { tone(660, 0, 0.12); tone(880, 0.1, 0.2); }
  else if (kind === 'lose') { tone(220, 0, 0.25, 'sawtooth'); tone(150, 0.18, 0.4, 'sawtooth'); }
  else tone(520, 0, 0.08, 'triangle', 0.08);
}
