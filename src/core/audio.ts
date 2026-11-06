/**
 * All sound is synthesised with Web Audio, so there are no files to load and it works offline.
 * Nothing plays until the first tap/keypress (browsers block autoplay); `enabled` mutes everything.
 */
let ac: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;

type AudioCtor = typeof AudioContext;

export function unlockAudio(): void {
  try {
    if (!ac) {
      const Ctor: AudioCtor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
      if (!Ctor) return;
      ac = new Ctor();
      master = ac.createGain();
      master.gain.value = enabled ? 1 : 0;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') void ac.resume();
    if (enabled) startMusic();
  } catch { ac = null; master = null; }
}

export function setAudioEnabled(on: boolean): void {
  enabled = on;
  if (ac && master) master.gain.setTargetAtTime(on ? 1 : 0, ac.currentTime, 0.05);
  if (on) startMusic(); else stopMusic();
  if (!on) try { speechSynthesis.cancel(); } catch { /* no speech */ }
}
export const audioEnabled = (): boolean => enabled;

/* ---------- effects ---------- */
export type Sfx = 'win' | 'lose' | 'go' | 'card' | 'tap' | 'horn' | 'zap' | 'splash' | 'door' | 'right' | 'wrong';

function tone(f: number, t: number, d: number, type: OscillatorType = 'square', v = 0.05, slide = 0): void {
  if (!ac || !master) return;
  const n = ac.currentTime, o = ac.createOscillator(), gn = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, n + t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), n + t + d);
  gn.gain.setValueAtTime(v, n + t); gn.gain.exponentialRampToValueAtTime(0.0001, n + t + d);
  o.connect(gn).connect(master); o.start(n + t); o.stop(n + t + d + 0.02);
}

function noise(t: number, d: number, v: number, freq: number, q = 1): void {
  if (!ac || !master) return;
  const n = ac.currentTime, len = Math.ceil(ac.sampleRate * d);
  const buf = ac.createBuffer(1, len, ac.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain();
  src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  gn.gain.setValueAtTime(v, n + t); gn.gain.exponentialRampToValueAtTime(0.0001, n + t + d);
  src.connect(f).connect(gn).connect(master); src.start(n + t);
}

export function sfx(kind: Sfx): void {
  if (!ac) return;
  switch (kind) {
    case 'win': tone(660, 0, 0.12); tone(880, 0.1, 0.2); break;
    case 'lose': tone(220, 0, 0.25, 'sawtooth'); tone(150, 0.18, 0.4, 'sawtooth'); break;
    case 'go': tone(520, 0, 0.08, 'triangle', 0.08); break;
    case 'card': [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.08, 0.22, 'triangle', 0.06)); break;
    case 'tap': tone(900, 0, 0.05, 'triangle', 0.05); break;
    case 'horn': tone(392, 0, 0.35, 'sawtooth', 0.05); tone(494, 0, 0.35, 'sawtooth', 0.04); break;
    case 'zap': noise(0, 0.35, 0.18, 3000, 0.7); tone(120, 0, 0.3, 'sawtooth', 0.05); break;
    case 'splash': noise(0, 0.18, 0.12, 900, 0.8); break;
    case 'door': noise(0, 0.08, 0.15, 400, 2); tone(140, 0.02, 0.1, 'sine', 0.08); break;
    case 'right': tone(523, 0, 0.1, 'triangle', 0.07); tone(784, 0.09, 0.18, 'triangle', 0.07); break;
    case 'wrong': tone(200, 0, 0.2, 'square', 0.04); break;
  }
}

/* ---------- music: a soft pentatonic tune over a drone, in the spirit of a morin khuur ---------- */
const SCALE = [0, 2, 4, 7, 9];
let musicTimer: number | null = null;
let nextNote = 0, step = 0, degree = 2;

function bowed(f: number, t: number, d: number, v: number): void {
  if (!ac || !master) return;
  const o = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain();
  const flt = ac.createBiquadFilter(), gn = ac.createGain();
  o.type = 'sawtooth'; o.frequency.value = f;
  lfo.frequency.value = 5.2; lg.gain.value = f * 0.006; lfo.connect(lg).connect(o.frequency);
  flt.type = 'lowpass'; flt.frequency.value = 1400; flt.Q.value = 0.7;
  gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(v, t + 0.08);
  gn.gain.setValueAtTime(v, t + d * 0.7); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(flt).connect(gn).connect(master);
  o.start(t); lfo.start(t); o.stop(t + d + 0.05); lfo.stop(t + d + 0.05);
}

function schedule(): void {
  if (!ac) return;
  const beat = 0.42;
  while (nextNote < ac.currentTime + 0.6) {
    if (step % 8 === 0) bowed(110, nextNote, beat * 8, 0.012);
    // a gentle random walk on the scale, resting now and then
    if (step % 4 !== 3 || Math.random() < 0.3) {
      degree = Math.max(0, Math.min(9, degree + [-1, 0, 1, 1, -1, 2, -2][Math.floor(Math.random() * 7)]));
      const semis = SCALE[degree % 5] + 12 * Math.floor(degree / 5);
      bowed(220 * Math.pow(2, semis / 12), nextNote, beat * (step % 2 ? 1 : 1.8), 0.018);
    }
    nextNote += beat; step++;
  }
}
function startMusic(): void {
  if (!ac || musicTimer !== null || !enabled) return;
  nextNote = ac.currentTime + 0.1;
  musicTimer = window.setInterval(schedule, 150);
}
function stopMusic(): void {
  if (musicTimer !== null) { clearInterval(musicTimer); musicTimer = null; }
}

/* ---------- read tips aloud, only where the device has a Mongolian voice ---------- */
function mnVoice(): SpeechSynthesisVoice | undefined {
  try { return speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('mn')); } catch { return undefined; }
}
export const canSpeak = (): boolean => !!mnVoice();
export function stopSpeaking(): void {
  try { speechSynthesis.cancel(); } catch { /* speech unavailable */ }
}
export function speak(text: string): void {
  const v = mnVoice();
  if (!v || !enabled) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = v; u.lang = v.lang; u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch { /* speech unavailable */ }
}
