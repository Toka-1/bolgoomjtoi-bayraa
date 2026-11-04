import { ctx, W, H, reduce, snapshot } from '../core/canvas';
import { C, lin, rad, rr, circ, text, wrap } from '../core/draw';
import { setAudioEnabled, speak, canSpeak, sfx } from '../core/audio';
import { games } from '../games';
import { TOPICS, infoOf } from '../meta/content';
import { progress, toggleTopic, wear, setSound } from '../meta/progress';
import { OUTFITS, look } from '../art/look';
import { bayraa } from '../art/bayraa';
import { g, startRun, goHome, openScreen, answerQuiz, beginPractice } from '../flow';
import {
  type Btn, CARDS_BTN, TEACH_BTN, AGAIN_BTN, HOME_BTN, HUD_SOUND, SOUND_BTN, BACK_BTN,
  inBtn, inHudHome, inCircle, goldFace, panel, button, backIcon,
} from './widgets';

/** Read-aloud button on the failure tip card (only drawn where a Mongolian voice exists). */
export const SPEAK_BTN = { x: 306, y: 326, r: 15 };

const carded = games.filter(m => infoOf(m.cmd));

/* ---------- cards ---------- */
const CW = 104, CH = 108, GAP = 12, X0 = (W - (3 * CW + 2 * GAP)) / 2, Y0 = 92;
let detail = -1;

function cardRect(i: number): Btn {
  const row = Math.floor(i / 3), col = i % 3, inRow = Math.min(3, carded.length - row * 3);
  const rowX = (W - (inRow * CW + (inRow - 1) * GAP)) / 2;
  return { x: inRow < 3 ? rowX + col * (CW + GAP) : X0 + col * (CW + GAP), y: Y0 + row * (CH + GAP), w: CW, h: CH };
}
const swatchAt = (i: number) => ({ x: 120 + i * 52, y: 604, r: 18 });

function thumb(i: number): HTMLCanvasElement {
  const m = carded[i];
  return snapshot('card:' + m.cmd, 0.5, () => { m.dead = false; m.init(); m.draw(); });
}

export function drawCards(): void {
  ctx.fillStyle = lin(0, 0, 0, H, [[0, '#24306b'], [1, '#141838']]); ctx.fillRect(0, 0, W, H);
  backIcon(BACK_BTN.x, BACK_BTN.y, BACK_BTN.r);
  text('КАРТУУД', W / 2, 38, 26, goldFace(24, 52), { stroke: C.ink, sw: 6 });
  text(progress.cards.size + ' / ' + carded.length, W - 44, 38, 16, '#fff', { w: 700 });
  text('Үе бүрийг давахад шинэ карт нээгдэнэ', W / 2, 70, 13, '#c9cbe0', { w: 500 });
  carded.forEach((m, i) => {
    const b = cardRect(i), info = infoOf(m.cmd)!, open = progress.cards.has(m.cmd);
    if (open) {
      ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(b.x + 2, b.y + 5, b.w, b.h, 12);
      ctx.fillStyle = lin(0, b.y, 0, b.y + b.h, [[0, '#ffffff'], [1, '#e6eaf4']]); rr(b.x, b.y, b.w, b.h, 12);
      const img = thumb(i), tw = b.w - 12, th = 58;
      ctx.save(); ctx.beginPath(); ctx.roundRect(b.x + 6, b.y + 6, tw, th, 8); ctx.clip();
      const sw = img.width, sh = sw * th / tw;
      ctx.drawImage(img, 0, (img.height - sh) * 0.55, sw, sh, b.x + 6, b.y + 6, tw, th);
      ctx.restore();
      text(info.card, b.x + b.w / 2, b.y + 80, info.card.length > 11 ? 11 : 13, C.ink, { w: 700 });
      text(TOPICS.find(t => t.id === info.topic)!.label, b.x + b.w / 2, b.y + 97, 11, '#6b7090', { w: 500 });
    } else {
      ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(b.x + 2, b.y + 5, b.w, b.h, 12);
      ctx.fillStyle = lin(0, b.y, 0, b.y + b.h, [[0, '#3a4486'], [1, '#262d5e']]); rr(b.x, b.y, b.w, b.h, 12);
      ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(b.x + 5, b.y + 5, b.w - 10, b.h - 10, 9); ctx.stroke();
      text('?', b.x + b.w / 2, b.y + 48, 40, 'rgba(255,255,255,.35)');
      text('Түгжээтэй', b.x + b.w / 2, b.y + 90, 11, 'rgba(255,255,255,.5)', { w: 500 });
    }
  });
  // outfits unlocked by collecting cards
  text('Дээл:', 52, 604, 15, '#fff', { w: 700 });
  OUTFITS.forEach((f, i) => {
    const s = swatchAt(i), ok = progress.cards.size >= f.need, on = look.outfit.id === f.id;
    if (on) { ctx.fillStyle = C.gold; circ(s.x, s.y, s.r + 5); }
    ctx.fillStyle = rad(s.x, s.y, s.r, [[0, f.lt], [0.6, f.md], [1, f.dk]], s.x - 5, s.y - 6); circ(s.x, s.y, s.r);
    ctx.fillStyle = f.cuff; ctx.fillRect(s.x - s.r * 0.7, s.y + 2, s.r * 1.4, 4);
    if (!ok) {
      ctx.fillStyle = 'rgba(20,24,56,.7)'; circ(s.x, s.y, s.r);
      text(String(f.need), s.x, s.y + 1, 14, '#fff', { w: 700 });
    }
  });
  if (detail >= 0) drawDetail(detail);
}

function drawDetail(i: number): void {
  const m = carded[i], info = infoOf(m.cmd)!;
  ctx.fillStyle = 'rgba(10,12,30,.7)'; ctx.fillRect(0, 0, W, H);
  const k = reduce ? 1 : Math.min(1, 0.85 + 0.15 * Math.min(1, g.st * 6));
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2);
  panel(26, 80, W - 52, 480, 18, lin(0, 80, 0, 560, [[0, '#ffffff'], [1, '#e9edf6']]));
  const img = thumb(i), tw = W - 84, th = 190;
  ctx.save(); ctx.beginPath(); ctx.roundRect(42, 96, tw, th, 12); ctx.clip();
  const sw = img.width, sh = sw * th / tw;
  ctx.drawImage(img, 0, (img.height - sh) * 0.55, sw, sh, 42, 96, tw, th);
  ctx.restore();
  text(info.card, W / 2, 316, 26, C.ink);
  ctx.fillStyle = 'rgba(229,51,42,.1)'; rr(44, 338, W - 88, 58, 10);
  wrap(info.fact, W / 2, 358, W - 110, 16, C.red, 700);
  wrap(m.tip, W / 2, 420, W - 96, 14, '#3a3f60');
  text('Дарж хаах', W / 2, 540, 13, '#8a8fae', { w: 500 });
  ctx.restore();
}

/* ---------- teacher mode ---------- */
const topicRow = (i: number): Btn => ({ x: 30, y: 128 + i * 88, w: W - 60, h: 74 });
const START_BTN: Btn = { x: 70, y: 500, w: 220, h: 62 };

export function drawTopics(): void {
  ctx.fillStyle = lin(0, 0, 0, H, [[0, '#24306b'], [1, '#141838']]); ctx.fillRect(0, 0, W, H);
  backIcon(BACK_BTN.x, BACK_BTN.y, BACK_BTN.r);
  text('БАГШИЙН ГОРИМ', W / 2, 40, 22, goldFace(28, 52), { stroke: C.ink, sw: 5 });
  text('Ангидаа тоглуулах сэдвээ сонгоорой', W / 2, 88, 14, '#c9cbe0', { w: 500 });
  TOPICS.forEach((tp, i) => {
    const b = topicRow(i), on = progress.topics.has(tp.id);
    const n = carded.filter(m => infoOf(m.cmd)!.topic === tp.id).length;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; rr(b.x + 2, b.y + 4, b.w, b.h, 14);
    ctx.fillStyle = on ? lin(0, b.y, 0, b.y + b.h, [[0, '#ffffff'], [1, '#e6eaf4']]) : 'rgba(255,255,255,.12)';
    rr(b.x, b.y, b.w, b.h, 14);
    // checkbox
    ctx.fillStyle = on ? '#1f9a55' : 'rgba(255,255,255,.2)'; rr(b.x + 16, b.y + 22, 30, 30, 8);
    if (on) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(b.x + 23, b.y + 37); ctx.lineTo(b.x + 29, b.y + 44); ctx.lineTo(b.x + 40, b.y + 30); ctx.stroke();
    }
    text(tp.label, b.x + 62, b.y + 28, 22, on ? C.ink : '#fff', { align: 'left' });
    text(tp.note, b.x + 62, b.y + 52, 12, on ? '#6b7090' : 'rgba(255,255,255,.6)', { align: 'left', w: 500 });
    text(n + ' үе', b.x + b.w - 18, b.y + 38, 14, on ? '#6b7090' : 'rgba(255,255,255,.6)', { align: 'right', w: 700 });
  });
  button(START_BTN, 'ЭХЛЭХ');
  wrap('Сонголт хадгалагдана. Нүүр хуудасны «ТОГЛОХ» ч энэ сэдвүүдээр тоглоно.', W / 2, 590, W - 60, 12, '#c9cbe0');
}

/* ---------- end-of-run quiz ---------- */
const optRect = (i: number): Btn => ({ x: 28, y: 300 + i * 72, w: W - 56, h: 60 });

export function drawQuiz(): void {
  const q = g.quiz, item = q.list[q.i];
  ctx.fillStyle = lin(0, 0, 0, H, [[0, 'rgba(27,31,59,.9)'], [1, 'rgba(15,18,40,.95)']]); ctx.fillRect(0, 0, W, H);
  text('АСУУЛТ ' + (q.i + 1) + ' / ' + q.list.length, W / 2, 100, 22, goldFace(88, 112), { stroke: C.ink, sw: 5 });
  text('Зөв хариулт бүр +1 оноо', W / 2, 130, 13, '#c9cbe0', { w: 500 });
  panel(28, 156, W - 56, 120, 16, lin(0, 156, 0, 276, [[0, '#ffffff'], [1, '#eef0f6']]));
  wrap(item.q, W / 2, 200, W - 96, 19, C.ink, 700);
  item.a.forEach((label, i) => {
    const b = optRect(i);
    const done = q.picked >= 0, right = i === item.ok, chose = i === q.picked;
    const face = !done ? lin(0, b.y, 0, b.y + b.h, [[0, '#ffffff'], [1, '#d5dae8']])
      : right ? lin(0, b.y, 0, b.y + b.h, [[0, '#7fe0a4'], [1, '#1f9a55']])
        : chose ? lin(0, b.y, 0, b.y + b.h, [[0, '#ff8a7e'], [1, '#b81a12']])
          : 'rgba(255,255,255,.25)';
    ctx.fillStyle = '#0f1230'; rr(b.x, b.y + 5, b.w, b.h, 16);
    ctx.fillStyle = face; rr(b.x, b.y, b.w, b.h, 16);
    ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 16); ctx.stroke();
    ctx.fillStyle = C.ink; circ(b.x + 28, b.y + b.h / 2, 14);
    text(String(i + 1), b.x + 28, b.y + b.h / 2 + 1, 15, '#fff');
    text(label, b.x + 52, b.y + b.h / 2 + 1, label.length > 26 ? 13 : 16, done && !right && !chose ? 'rgba(27,31,59,.6)' : C.ink, { align: 'left', w: 700 });
  });
  if (q.picked >= 0) {
    const ok = q.picked === item.ok;
    const pop = reduce ? 1 : 1 + 0.25 * Math.max(0, 1 - g.st * 6);
    ctx.save(); ctx.translate(W / 2, 540); ctx.scale(pop, pop);
    text(ok ? 'ЗӨВ!' : 'Буруу байна', 0, 0, ok ? 34 : 24, ok ? goldFace(-17, 17) : '#fff', { stroke: ok ? C.ink : C.red, sw: 7 });
    ctx.restore();
  }
  bayraa(W - 46, 92, 0.42, { mood: q.picked < 0 ? 'ok' : q.picked === item.ok ? 'happy' : 'scared', noShadow: true });
}

/* ---------- input for menus and HUD buttons ---------- */
function toggleSound(): void {
  setSound(!progress.sound);
  setAudioEnabled(progress.sound);
  sfx('tap');
}

/** Handles taps that belong to menus/HUD rather than the microgame. Returns true when consumed. */
export function uiPress(x: number, y: number): boolean {
  switch (g.state) {
    case 'title':
      if (inCircle(SOUND_BTN, x, y)) toggleSound();
      else if (inBtn(CARDS_BTN, x, y)) { detail = -1; openScreen('cards'); sfx('tap'); }
      else if (inBtn(TEACH_BTN, x, y)) { openScreen('topics'); sfx('tap'); }
      else startRun();
      return true;
    case 'cards': {
      if (detail >= 0) { detail = -1; return true; }
      if (inCircle(BACK_BTN, x, y)) { goHome(); return true; }
      const i = carded.findIndex((_, k) => inBtn(cardRect(k), x, y));
      if (i >= 0 && progress.cards.has(carded[i].cmd)) { detail = i; g.st = 0; sfx('tap'); return true; }
      OUTFITS.forEach((f, k) => { if (inCircle(swatchAt(k), x, y) && wear(f.id)) sfx('tap'); });
      return true;
    }
    case 'topics': {
      if (inCircle(BACK_BTN, x, y)) { goHome(); return true; }
      const i = TOPICS.findIndex((_, k) => inBtn(topicRow(k), x, y));
      if (i >= 0) { toggleTopic(TOPICS[i].id); sfx('tap'); return true; }
      if (inBtn(START_BTN, x, y)) startRun();
      return true;
    }
    case 'over':
      if (g.st > 0.6 && inBtn(AGAIN_BTN, x, y)) startRun();
      else if (g.st > 0.6 && inBtn(HOME_BTN, x, y)) goHome();
      return true;
    case 'quiz': {
      const i = [0, 1, 2].find(k => inBtn(optRect(k), x, y));
      if (i !== undefined) answerQuiz(i);
      return true;
    }
    default:
  }
  // in a run: HUD buttons first, so they never reach the microgame
  if (inHudHome(x, y)) { goHome(); return true; }
  if (inCircle(HUD_SOUND, x, y)) { toggleSound(); return true; }
  if (g.state === 'intro') { if (g.practice) beginPractice(); return true; }
  if (g.state === 'result' && !g.ok && canSpeak() && inCircle(SPEAK_BTN, x, y)) { speak(g.game.tip); return true; }
  return false;
}

/** Keyboard shortcuts for menus. Returns true when consumed. */
export function uiKey(k: string): boolean {
  if (g.state === 'quiz' && (k === '1' || k === '2' || k === '3')) { answerQuiz(Number(k) - 1); return true; }
  if (g.state === 'topics' && k === 'Enter') { startRun(); return true; }
  if ((g.state === 'cards' || g.state === 'topics') && k === ' ') return true;
  return false;
}

