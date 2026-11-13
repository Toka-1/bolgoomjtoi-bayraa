/**
 * All sound is synthesised with Web Audio, so there are no files to load and it works offline.
 * Nothing plays until the first tap/keypress (browsers block autoplay); `enabled` mutes everything.
 */
let ac: AudioContext | null = null;
let master: GainNode | null = null;
/** Music bus under master, so it can be ducked while a voice clip plays. */
let music: GainNode | null = null;
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
      music = ac.createGain();
      music.connect(master);
    }
    if (ac.state === 'suspended') void ac.resume();
    if (enabled) startMusic();
  } catch { ac = null; master = null; music = null; }
}

export function setAudioEnabled(on: boolean): void {
  enabled = on;
  if (ac && master) master.gain.setTargetAtTime(on ? 1 : 0, ac.currentTime, 0.05);
  if (on) startMusic(); else stopMusic();
  if (!on) stopSpeaking();
}
export const audioEnabled = (): boolean => enabled;

/* ---------- effects ---------- */
export type Sfx = 'win' | 'lose' | 'go' | 'card' | 'tap' | 'horn' | 'zap' | 'splash' | 'door' | 'right' | 'wrong' | 'buckle' | 'settle';

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
    case 'buckle': noise(0, .035, .09, 2400, 2); tone(1100, .025, .07, 'triangle', .06); break;
    case 'settle': noise(0, .09, .045, 600, .8); tone(660, .04, .15, 'sine', .06, 220); break;
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

/* ---------- music: an original, cheerful two-part tune (marimba lead, bass, light drums) ---------- */
let musicTimer: number | null = null;
let nextNote = 0, step = 0;
let musicPace = 1, musicActive = false, musicUrgent = false;
/** Menus get a gentle arrangement; rounds add drums and chord stabs, and speed up with the round. */
export function setMusicScene(active: boolean, speed: number, urgent: boolean): void {
  musicActive = active;
  musicPace = active ? Math.max(1, Math.min(1.55, speed)) : 1;
  musicUrgent = active && urgent;
}

/** [step in bar (16ths), MIDI note, length in 16ths] */
type Ev = readonly [number, number, number];
const C = [48, 52, 55], AM = [45, 48, 52], F = [41, 45, 48], G = [43, 47, 50], EM = [40, 43, 47];
/** Part A then part B, 8 bars each. */
const CHORDS = [C, AM, F, G, F, G, AM, C, F, G, EM, AM, F, G, C, C];
const LEAD: readonly (readonly Ev[])[] = [
  [[0, 72, 2], [2, 76, 2], [4, 79, 4], [8, 76, 2], [10, 79, 2], [12, 81, 4]],
  [[0, 79, 2], [2, 76, 2], [4, 72, 2], [6, 74, 2], [8, 76, 6]],
  [[0, 81, 2], [2, 79, 2], [4, 77, 2], [6, 76, 2], [8, 74, 4], [12, 72, 4]],
  [[0, 74, 3], [3, 76, 1], [4, 74, 2], [6, 71, 2], [8, 74, 8]],
  [[0, 72, 2], [2, 77, 2], [4, 81, 4], [8, 84, 2], [10, 81, 2], [12, 79, 4]],
  [[0, 79, 2], [2, 81, 2], [4, 79, 2], [6, 76, 2], [8, 74, 4], [12, 79, 4]],
  [[0, 76, 2], [2, 79, 2], [4, 81, 2], [6, 84, 2], [8, 83, 2], [10, 81, 2], [12, 79, 4]],
  [[0, 76, 2], [2, 74, 2], [4, 72, 10]],
  [[0, 81, 4], [4, 79, 2], [6, 77, 2], [8, 81, 4], [12, 84, 4]],
  [[0, 83, 4], [4, 79, 2], [6, 74, 2], [8, 79, 8]],
  [[0, 76, 2], [2, 79, 2], [4, 83, 4], [8, 79, 2], [10, 76, 2], [12, 71, 4]],
  [[0, 72, 2], [2, 76, 2], [4, 81, 6], [10, 79, 2], [12, 76, 4]],
  [[0, 77, 2], [2, 81, 2], [4, 84, 4], [8, 86, 2], [10, 84, 2], [12, 81, 4]],
  [[0, 83, 2], [2, 84, 2], [4, 86, 4], [8, 83, 2], [10, 79, 2], [12, 74, 4]],
  [[0, 76, 2], [2, 79, 2], [4, 84, 4], [8, 79, 2], [10, 76, 2], [12, 74, 2], [14, 76, 2]],
  [[0, 72, 8]],
];
const BARS = LEAD.length;
const hz = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

/** Pitched voice on the music bus with a quick attack and a natural decay. */
function note(f: number, t: number, d: number, v: number, type: OscillatorType): void {
  if (!ac || !music) return;
  const o = ac.createOscillator(), gn = ac.createGain();
  o.type = type; o.frequency.value = f;
  gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(v, t + 0.008);
  gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(gn).connect(music); o.start(t); o.stop(t + d + 0.02);
}
/** Marimba-like lead: warm body plus a short bright "knock". */
function marimba(f: number, t: number, d: number, v: number): void {
  note(f, t, Math.max(0.25, d * 1.3), v, 'triangle');
  note(f * 4, t, 0.06, v * 0.25, 'sine');
}
let noiseBuf: AudioBuffer | null = null;
function hit(t: number, d: number, v: number, type: BiquadFilterType, freq: number): void {
  if (!ac || !music) return;
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = ac.createBufferSource(), flt = ac.createBiquadFilter(), gn = ac.createGain();
  src.buffer = noiseBuf; flt.type = type; flt.frequency.value = freq;
  gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
  src.connect(flt).connect(gn).connect(music); src.start(t, Math.random() * 0.5); src.stop(t + d + 0.02);
}
function kick(t: number, v: number): void {
  if (!ac || !music) return;
  const o = ac.createOscillator(), gn = ac.createGain();
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(gn).connect(music); o.start(t); o.stop(t + 0.2);
}

function schedule(): void {
  if (!ac) return;
  // 16th-note length: about 100 bpm in menus, 116 bpm in rounds rising with round speed
  const bpm = musicActive ? 116 * (1 + (musicPace - 1) * 0.5) * (musicUrgent ? 1.08 : 1) : 100;
  const sx = 15 / bpm;
  // after the tab was in the background, pick up from now instead of firing the missed notes at once
  if (nextNote < ac.currentTime - 0.2) nextNote = ac.currentTime + 0.05;
  while (nextNote < ac.currentTime + 0.3) {
    const t = nextNote, s = step % 16, bar = Math.floor(step / 16) % BARS;
    const second = Math.floor(step / (16 * BARS)) % 2 === 1;
    const chord = CHORDS[bar];
    for (const [at, m, len] of LEAD[bar]) {
      if (at !== s) continue;
      marimba(hz(m), t, len * sx, 0.05);
      // the second time round a soft glockenspiel doubles the tune an octave up
      if (second) note(hz(m + 12), t, Math.max(0.3, len * sx * 1.5), 0.012, 'sine');
    }
    // bass: root and fifth, busier in rounds
    if (s === 0 || s === 8 || (musicActive && (s === 6 || s === 14))) {
      const m = s === 8 ? chord[2] - 12 : s === 6 ? chord[0] : chord[0] - 12;
      note(hz(m), t, sx * (s % 8 ? 1.6 : 3), 0.07, 'triangle');
    }
    if (musicActive) {
      if (s % 4 === 2) for (const m of chord) note(hz(m + 12), t, sx * 1.2, 0.012, 'square');
      if (s === 0 || s === 8 || (s === 10 && bar % 2 === 1)) kick(t, 0.16);
      if (s === 4 || s === 12) hit(t, 0.12, 0.05, 'bandpass', 1800);
      if (s % 2 === 0 || musicUrgent) hit(t, 0.035, s % 4 === 2 ? 0.03 : 0.018, 'highpass', 7000);
    } else if (s === 0 && bar % 2 === 0) {
      // gentle chord bloom under the menu
      for (const m of chord) note(hz(m + 12), t, sx * 14, 0.01, 'sine');
    }
    nextNote += sx; step++;
  }
}
function startMusic(): void {
  if (!ac || musicTimer !== null || !enabled) return;
  nextNote = ac.currentTime + 0.1;
  musicTimer = window.setInterval(schedule, 100);
}
function stopMusic(): void {
  if (musicTimer !== null) { clearInterval(musicTimer); musicTimer = null; }
}

/* ---------- voice: recorded clips in public/voice first, a device Mongolian voice second ---------- */

/** Stable clip name for a line of text (FNV-1a), so a changed sentence needs a new recording. */
export function voiceId(text: string): string {
  let h = 0x811c9dc5;
  for (const ch of text.trim()) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

/** id → file extension, from public/voice/manifest.json (written by record.html). */
let clips: Record<string, string> = {};
try {
  if (typeof fetch === 'function') {
    void fetch('./voice/manifest.json', { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : {}))
      .then((m: unknown) => { if (m && typeof m === 'object') clips = m as Record<string, string>; })
      .catch(() => {});
  }
} catch { /* no network API */ }

const decoded = new Map<string, Promise<AudioBuffer | null>>();
function clipBuffer(id: string, ext: string): Promise<AudioBuffer | null> {
  let p = decoded.get(id);
  if (!p) {
    p = fetch(`./voice/${id}.${ext}`)
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('missing'))))
      .then(b => (ac ? ac.decodeAudioData(b) : null))
      .catch(() => null);
    decoded.set(id, p);
  }
  return p;
}

let voiceSrc: AudioBufferSourceNode | null = null;
let voiceToken = 0;
function duck(on: boolean): void {
  if (ac && music) music.gain.setTargetAtTime(on ? 0.2 : 1, ac.currentTime, 0.08);
}

function mnVoice(): SpeechSynthesisVoice | undefined {
  try { return speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('mn')); } catch { return undefined; }
}
function speakDevice(text: string): void {
  const v = mnVoice();
  if (!v) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.voice = v; u.lang = v.lang; u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch { /* speech unavailable */ }
}

export const hasClip = (text: string): boolean => voiceId(text) in clips;
/** Whether `text` (or, without it, any text) can be read aloud on this device. */
export const canSpeak = (text?: string): boolean => (text !== undefined && hasClip(text)) || !!mnVoice();

export function stopSpeaking(): void {
  voiceToken++;
  if (voiceSrc) { try { voiceSrc.stop(); } catch { /* already stopped */ } voiceSrc = null; }
  duck(false);
  try { speechSynthesis.cancel(); } catch { /* speech unavailable */ }
}

export function speak(text: string): void {
  if (!enabled) return;
  stopSpeaking();
  const id = voiceId(text), ext = clips[id];
  if (!ext || !ac || !master) { speakDevice(text); return; }
  const token = voiceToken;
  void clipBuffer(id, ext).then(buf => {
    if (token !== voiceToken || !enabled) return;
    if (!buf || !ac || !master) { speakDevice(text); return; }
    const src = ac.createBufferSource();
    src.buffer = buf; src.connect(master);
    src.onended = () => { if (voiceSrc === src) { voiceSrc = null; duck(false); } };
    voiceSrc = src; duck(true); src.start();
  });
}
