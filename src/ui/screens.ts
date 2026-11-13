import { ctx, W, H, clock, reduce, layer } from '../core/canvas';
import { C, lin, rad, rr, circ, text } from '../core/draw';
import { audioEnabled, canSpeak } from '../core/audio';
import { drawCards, drawTopics, drawQuiz, drawPractice, SPEAK_BTN } from './meta';
import { drawLesson, lessonButton, check, LESSON_CONTINUE, LESSON_REPLAY } from './lessons';
import { progress } from '../meta/progress';
import { TOPICS,infoOf } from '../meta/content';
import { games } from '../games';

const TOTAL_CARDS = games.length;
import { PLAY_BTN, PRACTICE_BTN, CARDS_BTN, TEACH_BTN, AGAIN_BTN, HOME_BTN, HUD_HOME, HUD_SOUND, SOUND_BTN, goldFace, homeIcon, soundIcon, panel, button } from './widgets';
export { type Btn, PLAY_BTN, AGAIN_BTN, HOME_BTN, HUD_HOME, inBtn, inHudHome } from './widgets';
import { bayraa } from '../art/bayraa';
import { OUTFITS, look } from '../art/look';
import { ger } from '../art/props';
import { sun, cloud, ridge, hills, grass, chimneySmoke, vignette, grain } from '../art/scenery';
import { g } from '../flow';
import { drawConsequence } from './consequences';
import {drawLevelView,levelFrame} from './levelView';

export function render(): void {
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  if (g.state === 'title') { drawTitle(); vignette(0.12); }
  else if (g.state === 'cards') drawCards();
  else if (g.state === 'topics') drawTopics();
  else if (g.state === 'practice') drawPractice();
  else {
    drawLevelView(g.game,g.state==='play',(g.failures.get(g.game.cmd)??0)>=3);
    vignette();
    hud();
    const frame=levelFrame(g.game);
    if(frame.y>=126){const label=infoOf(g.game.cmd)?.card??'';text(label,W/2,frame.y-18,label.length>20?15:18,C.gold);}
    if (g.state === 'play') drawPlay();
    else if (g.state === 'result') drawResult();
    else if (g.state === 'quiz') drawQuiz();
    else drawOver();
  }
  grain();
  ctx.restore();
}

function heart(x: number, y: number, r: number, full: boolean): void {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, r * 0.9);
  ctx.bezierCurveTo(-r * 1.6, -r * 0.2, -r * 0.6, -r * 1.3, 0, -r * 0.4);
  ctx.bezierCurveTo(r * 0.6, -r * 1.3, r * 1.6, -r * 0.2, 0, r * 0.9);
  ctx.fillStyle = full ? rad(0, 0, r * 1.4, [[0, '#ff7a6e'], [0.6, C.red], [1, '#9e140d']], -r * 0.4, -r * 0.5) : 'rgba(27,31,59,.3)';
  ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
  if (full) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-r * 0.55, -r * 0.35, r * 0.28, r * 0.18, -0.6, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function hud(): void {
  ctx.fillStyle = 'rgba(10,12,30,.3)'; circ(37, 39, 23);
  ctx.fillStyle = rad(36, 36, 23, [[0, '#ffe58a'], [0.6, C.gold], [1, '#b87d00']], 30, 29); circ(36, 36, 22);
  ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.strokeStyle = 'rgba(120,70,0,.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(36, 36, 16, 0, Math.PI * 2); ctx.stroke();
  text(String(g.score), 36, 37, 20, C.ink);
  if (g.state !== 'over') { homeIcon(HUD_HOME.x, HUD_HOME.y, HUD_HOME.r); soundIcon(HUD_SOUND.x, HUD_SOUND.y, HUD_SOUND.r, audioEnabled()); }
  for (let i = 0; i < 3; i++) heart(W - 30 - i * 32, 36, 11, i < g.lives);
  const level = games.indexOf(g.game);
  if (level >= 0) text(`${level + 1} / ${games.length}`, W / 2, 73, 12, '#fff', { stroke: C.ink, sw: 3 });
  if (g.practice) text('ДАДЛАГА', W - 57, 73, 11, '#fff', { stroke: C.ink, sw: 3 });
}

function drawPlay(): void {
  const frame=levelFrame(g.game);
  ctx.save();ctx.translate(0,Math.min(616,frame.y+frame.h+20)-616);
  const f = 1 - g.frac, bw = W - 32;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i <= (g.practice ? 1 : Math.min(2, 1 + Math.floor(g.score / 6))) ? C.gold : 'rgba(27,31,59,.3)';
    circ(W / 2 + (i - 1) * 12, 603, 3);
  }
  ctx.fillStyle = 'rgba(27,31,59,.5)'; rr(16, 616, bw, 12, 6);
  ctx.fillStyle = f < 0.3 ? lin(0, 616, 0, 628, [[0, '#ff6a5c'], [1, '#b81a12']]) : goldFace(616, 628);
  rr(16, 616, Math.max(12, bw * f), 12, 6);
  ctx.fillStyle = 'rgba(255,255,255,.45)'; rr(20, 618, Math.max(4, bw * f - 8), 3, 2);
  const sx = 16 + bw * f;
  ctx.fillStyle = rad(sx, 622, 14, [[0, 'rgba(255,240,180,.9)'], [1, 'rgba(255,160,40,0)']]); circ(sx, 622, 14);
  ctx.fillStyle = reduce ? '#fff' : `rgb(255,${(200 + Math.random() * 55) | 0},120)`; circ(sx, 622, 6);
  ctx.restore();
}

function drawResult(): void {
  if (g.ok) {
    // A different small celebration each win, with a static reduced-motion version.
    for (let i = 0; i < 16; i++) {
      const phase = reduce ? .5 : Math.min(1, g.st / 1.1);
      const a = i * 2.399 + g.celebration;
      const radius = 34 + phase * (75 + i % 3 * 18);
      const x = W / 2 + Math.cos(a) * radius;
      const y = 210 + Math.sin(a) * radius + phase * phase * 35;
      ctx.fillStyle = ['#ffe58a', '#9ce3c4', '#fff', '#bdc9ff'][i % 4];
      circ(x, y, 2 + i % 3);
    }
    const pop = reduce ? 1 : 1 + 0.3 * Math.max(0, 1 - g.st * 5);
    ctx.save(); ctx.translate(W / 2, 250); ctx.scale(pop, pop);
    const size = g.winText.length > 8 ? 34 : 54;
    text(g.winText, 0, 0, size, goldFace(-size / 2, size / 2), { stroke: C.ink, sw: 10, drop: true });
    ctx.restore();
    check(W / 2, 182, 32);
    if (g.newCard) {
      const k = reduce ? 1 : Math.min(1, g.st * 4);
      ctx.save(); ctx.translate(W / 2, 370); ctx.scale(k, k); ctx.rotate(reduce ? 0 : Math.sin(clock.t * 3) * 0.04);
      panel(-76, -57, 152, 114, 12, '#fff');
      drawLesson(g.game.cmd, -70, -51, 140, 102, 3);
      ctx.restore();
    }
    if (g.reward >= 0) {
      const outfit = OUTFITS[g.reward];
      panel(62, 462, 236, 126, 16, '#fff');
      // Preview the earned reward without changing the saved selection.
      const previous = look.outfit;
      try {
        look.outfit = outfit;
        bayraa(120, 575, .72, { mood: 'happy' });
      } finally { look.outfit = previous; }
      text('ШИНЭ ХУВЦАС!', 218, 498, 15, C.ink);
      text(outfit.label, 218, 529, 12, C.ink);
    }
    return;
  }
  ctx.fillStyle = 'rgba(27,31,59,.62)'; ctx.fillRect(0, 0, W, H);
  if (g.st < g.effectDur) {
    drawConsequence(g.game.cmd, 18, 158, 324, 288, g.st, g.msg);
    return;
  }
  text('ХАМТДАА СУРЪЯ', W / 2, 126, 26, '#fff');
  // Fade the frozen final consequence into the safe action, without motion
  // or a sudden replacement of the scene. The lesson still gets its full time.
  const lessonTime = g.st - g.effectDur;
  const blend = reduce ? 1 : Math.min(1, lessonTime / .25);
  if (blend < 1) drawConsequence(g.game.cmd, 18, 158, 324, 288, g.effectDur, g.msg);
  ctx.save(); ctx.globalAlpha = blend;
  drawLesson(g.game.cmd, 18, 158, 324, 288, g.st - g.effectDur);
  ctx.restore();
  lessonButton(LESSON_REPLAY.x, LESSON_REPLAY.y, LESSON_REPLAY.r, true);
  ctx.save(); ctx.globalAlpha = g.st >= g.effectDur + 3 ? 1 : 0.3;
  lessonButton(LESSON_CONTINUE.x, LESSON_CONTINUE.y, LESSON_CONTINUE.r, false);
  ctx.restore();
  if (canSpeak()) soundIcon(SPEAK_BTN.x, SPEAK_BTN.y, SPEAK_BTN.r, true);
}

function paintTitle(): void {
  ctx.fillStyle = lin(0, 0, 0, 470, [[0, '#3f8fd8'], [0.55, '#9fd2f2'], [1, '#ffe9c4']]); ctx.fillRect(0, 0, W, H);
  sun(300, 90, 26, '#fff1b8', '255,230,160', 0.55);
  cloud(80, 70, 0.8, 0.95, 11); cloud(250, 300, 0.55, 0.8, 12); cloud(40, 330, 0.4, 0.7, 13);
  ridge(400, 150, 61, [[0, '#7f98c4'], [1, '#a9bedb']], 0.35);
  ridge(430, 80, 67, [[0, '#6f8fa8'], [1, '#8fa9b8']], 0.15);
  hills(470, 8, 0.025, 0.5, [[0, '#a6d468'], [1, '#86bb4a']]);
  hills(505, 6, 0.04, 2, [[0, '#8fc653'], [1, '#5f9a2f']]);
  grass(500, H, 140, 5, 'rgba(50,95,20,.7)', 'rgba(190,230,120,.7)');
  ger(75, 505, 2.1);
}

function drawTitle(): void {
  layer('title', paintTitle);
  chimneySmoke(120, 278, 1.4);
  const t = clock.t;
  if (!reduce) {
    ctx.strokeStyle = 'rgba(27,31,59,.6)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const bx = ((t * 18 + i * 40) % (W + 80)) - 40, by = 300 - i * 14 + Math.sin(t * 2 + i) * 4, w = Math.sin(t * 9 + i) * 3;
      ctx.beginPath(); ctx.moveTo(bx - 6, by - w); ctx.quadraticCurveTo(bx - 3, by - 3, bx, by); ctx.quadraticCurveTo(bx + 3, by - 3, bx + 6, by - w); ctx.stroke();
    }
  }
  bayraa(250, 515, 1.45, { wave: true, mood: 'happy', hat: true });
  text('Болгоомжтой', W / 2, 150, 40, '#fff', { stroke: C.ink, sw: 9, drop: true });
  text('Баяраа', W / 2, 205, 60, goldFace(175, 235), { stroke: C.ink, sw: 11, drop: true });
  text('Монгол амьдралын аюулаас Баярааг авар', W / 2, 256, 15, C.ink, { w: 700, stroke: 'rgba(255,255,255,.6)', sw: 4 });
  button(PLAY_BTN, 'ТОГЛОХ');
  button(PRACTICE_BTN, 'ДАДЛАГА', true);
  button(CARDS_BTN, 'КАРТУУД ' + progress.cards.size + '/' + TOTAL_CARDS, true);
  button(TEACH_BTN, 'БАГШ', true);
  soundIcon(SOUND_BTN.x, SOUND_BTN.y, SOUND_BTN.r, audioEnabled());
  if (progress.topics.size < TOPICS.length) {
    text('Сэдэв: ' + TOPICS.filter(t => progress.topics.has(t.id)).map(t => t.label).join(', '), W / 2, 304, 13, '#fff', { w: 700, stroke: C.ink, sw: 4 });
  }
  if (g.best) text('Шилдэг оноо: ' + g.best, W / 2, 282, 13, '#fff', { w: 700, stroke: C.ink, sw: 4 });
}

function drawOver(): void {
  ctx.fillStyle = lin(0, 0, 0, H, [[0, 'rgba(27,31,59,.92)'], [1, 'rgba(15,18,40,.95)']]); ctx.fillRect(0, 0, W, H);
  text('Тоглоом дууслаа', W / 2, 150, 30, '#fff');
  text('Оноо', W / 2, 220, 18, '#c9cbe0', { w: 500 });
  ctx.fillStyle = rad(W / 2, 290, 90, [[0, 'rgba(244,180,0,.25)'], [1, 'rgba(244,180,0,0)']]); circ(W / 2, 290, 90);
  text(String(g.score), W / 2, 290, 86, goldFace(250, 330), { stroke: '#fff', sw: 6 });
  text(g.score >= g.best && g.score > 0 ? 'Шинэ дээд амжилт!' : 'Шилдэг: ' + g.best, W / 2, 365, 18, '#fff', { w: 700 });
  if (g.quiz.list.length) text('Асуулт: ' + g.quiz.right + '/' + g.quiz.list.length + '  (+' + g.bonus + ' оноо)', W / 2, 392, 15, C.gold, { w: 700 });
  bayraa(W / 2, 455, 0.7, { mood: 'happy', wave: true, noShadow: true });
  if (g.st > 0.6) { button(AGAIN_BTN, 'ДАХИН ТОГЛОХ'); button(HOME_BTN, 'НҮҮР ХУУДАС', true); }
}
