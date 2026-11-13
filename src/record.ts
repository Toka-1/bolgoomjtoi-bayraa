/**
 * Dev tool (record.html): record every line the game reads aloud. Each clip is sent to the dev
 * server (tools/voice-server.mjs), which writes public/voice/<id>.<ext> and the manifest.
 */
import { games } from './games';
import { voiceId } from './core/audio';

interface Line { id: string; text: string; kind: string }

const lines: Line[] = [];
const seen = new Set<string>();
for (const [i, m] of games.entries()) {
  for (const [kind, text] of [['ДААЛГАВАР', m.cmd], ['ЗӨВЛӨГӨӨ', m.tip]] as const) {
    const id = voiceId(text);
    if (seen.has(id)) continue;
    seen.add(id);
    lines.push({ id, text, kind: `${i + 1}. ${kind}` });
  }
}

let manifest: Record<string, string> = {};
let current = 0;
let recorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let player: HTMLAudioElement | null = null;

const list = document.getElementById('list')!;
const count = document.getElementById('count')!;

/** m4a plays everywhere (iPhone included); webm is the fallback for older browsers. */
function pickFormat(): { mime: string; ext: string } {
  for (const [mime, ext] of [['audio/mp4;codecs=mp4a.40.2', 'm4a'], ['audio/mp4', 'm4a'], ['audio/webm;codecs=opus', 'webm'], ['audio/webm', 'webm']] as const) {
    if (MediaRecorder.isTypeSupported(mime)) return { mime, ext };
  }
  return { mime: '', ext: 'webm' };
}

function render(): void {
  list.textContent = '';
  for (const [i, line] of lines.entries()) {
    const row = document.createElement('div');
    row.className = 'row' + (manifest[line.id] ? ' done' : '') + (i === current ? ' current' : '');
    const dot = document.createElement('span'); dot.className = 'dot';
    const body = document.createElement('div');
    const kind = document.createElement('div'); kind.className = 'kind'; kind.textContent = line.kind;
    const text = document.createElement('div'); text.className = 'text'; text.textContent = line.text;
    body.append(kind, text);
    const btns = document.createElement('div'); btns.className = 'btns';
    const rec = document.createElement('button');
    const recording = recorder !== null && i === current;
    rec.className = 'rec' + (recording ? ' on' : '');
    rec.textContent = recording ? '■ Зогсоох' : '● Бичих';
    rec.disabled = recorder !== null && i !== current;
    rec.onclick = () => { current = i; void toggle(); };
    const play = document.createElement('button');
    play.textContent = '▶'; play.title = 'Сонсох'; play.disabled = !manifest[line.id];
    play.onclick = () => { current = i; listen(); render(); };
    const del = document.createElement('button');
    del.textContent = '✕'; del.title = 'Устгах'; del.disabled = !manifest[line.id] || recorder !== null;
    del.onclick = () => void remove(line);
    btns.append(rec, play, del);
    row.append(dot, body, btns);
    list.append(row);
  }
  const done = lines.filter(l => manifest[l.id]).length;
  count.textContent = `${done} / ${lines.length} бичсэн`;
  list.children[current]?.scrollIntoView({ block: 'nearest' });
}

async function toggle(): Promise<void> {
  if (recorder) { recorder.stop(); return; }
  const line = lines[current];
  try {
    stream ??= await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  } catch {
    alert('Микрофон ашиглах зөвшөөрөл хэрэгтэй.'); return;
  }
  const { mime, ext } = pickFormat();
  const chunks: Blob[] = [];
  const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  r.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  r.onstop = async () => {
    recorder = null;
    const blob = new Blob(chunks, { type: r.mimeType || mime });
    const res = await fetch(`/__voice?id=${line.id}&ext=${ext}`, { method: 'PUT', body: blob });
    if (res.ok) {
      manifest = await res.json();
      // the dev server notices the new public file a moment later
      setTimeout(listen, 400);
      if (current < lines.length - 1) current++;
    } else alert('Хадгалж чадсангүй (' + res.status + '). Dev server (npm run dev) ажиллаж байгаа эсэхийг шалгана уу.');
    render();
  };
  recorder = r;
  r.start();
  render();
}

function listen(): void {
  const line = lines[current], ext = manifest[line.id];
  if (!ext) return;
  player?.pause();
  player = new Audio(`/voice/${line.id}.${ext}?v=${Date.now()}`);
  void player.play().catch(() => {});
}

async function remove(line: Line): Promise<void> {
  if (!confirm(`"${line.text}" бичлэгийг устгах уу?`)) return;
  const res = await fetch(`/__voice?id=${line.id}`, { method: 'DELETE' });
  if (res.ok) manifest = await res.json();
  render();
}

addEventListener('keydown', e => {
  if (e.key === ' ') { e.preventDefault(); void toggle(); }
  else if (recorder) return;
  else if (e.key === 'ArrowDown') { e.preventDefault(); current = Math.min(lines.length - 1, current + 1); render(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); current = Math.max(0, current - 1); render(); }
  else if (e.key === 'p' || e.key === 'P') listen();
});

void fetch('/voice/manifest.json', { cache: 'no-cache' })
  .then(r => (r.ok ? r.json() : {}))
  .then((m: Record<string, string>) => { manifest = m; })
  .catch(() => {})
  .finally(() => {
    current = Math.max(0, lines.findIndex(l => !manifest[l.id]));
    render();
  });
