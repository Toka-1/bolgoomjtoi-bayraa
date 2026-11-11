import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
function load(file,names,bindings={}){
 const code=stripTypeScriptTypes(readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).replace(/^import[\s\S]*?;\r?$/gm,'').replace(/export /g,'');
 return runInNewContext(code+'\n({'+names.join(',')+'})',{...bindings});
}
const {DragKeys}=load('core/dragKeys.ts',['DragKeys']);const classes={};
for(const [file,name] of [['smoke','Smoke'],['ice','Ice'],['socket','Socket'],['hat','Hat'],['cow','Cow'],['baby','Baby'],['crossing','Crossing'],['dust','Dust'],['cabinet','Cabinet'],['river','River'],['dog','Dog'],['drink','Drink'],['manhole','Manhole'],['seatbelt','Seatbelt'],['balcony','Balcony'],['cleaner','Cleaner']])Object.assign(classes,load('games/'+file+'.ts',[name],{DragKeys}));
Object.assign(classes,load('games/prevention.ts',['Reversing','Cord','Icicles']));
const {EXTRA_LEVELS}=load('meta/extra.ts',['EXTRA_LEVELS']);
Object.assign(classes,load('games/extra.ts',['extraGames'],{EXTRA_LEVELS,DragKeys}));
const {games}=load('games/index.ts',['games'],classes);
let depth=0,draws=0,dangers=0;
const noop=()=>{};
const ctx=new Proxy({save(){depth++;},restore(){depth--;assert.ok(depth>=0);}},{get:(o,k)=>k in o?o[k]:noop,set:()=>true});
const focus=load('ui/levelView.ts',['levelFrame','levelCamera','levelToWorld','worldToLevel','inLevelView','drawLevelView'],{ctx,W:360,H:640});
const targets=[
 [[292,390]],[[70,400],[290,400]],[[108,558],[225,470.6]],[[180,280],[180,433.35]],[[180,550]],
 [[290,529],[290,444]],[[180,450]],[[70,420],[290,420]],[[270,220],[56,470],[130,560]],
 [[130,500],[250,500]],[[60,450],[275,535]],[[60,430],[269,385]],[[65,470],[295,470]],
 [[123,398],[218,451]],[[65,460]],[[297.8,494.18],[216,540]],[[60,450],[300,550]],
 [[60,450],[270,578]],[[60,450],[201,371]],[[255,460],[170,463.95]],[[70,380]],[[130,535],[130,365]],
];
for(let i=22;i<30;i++)targets.push([[100,460],[274,['glass','battery','bag','oven'].includes(EXTRA_LEVELS[i-19].kind)?568:EXTRA_LEVELS[i-19].kind==='kettle'?459:468]]);
assert.equal(targets.length,30);
for(let i=0;i<games.length;i++){
 const game=games[i],f=focus.levelFrame(game),c=focus.levelCamera(game);
 assert.ok(f.y>=96&&f.y+f.h<=596);assert.ok(f.h>=320&&f.h<=500);
 assert.ok((f.y-c.y)/c.scale>=0&&(f.y+f.h-c.y)/c.scale<=640+1e-8,'framing never exposes space below the scene');
 for(const [x,y] of targets[i]){
  const [sx,sy]=focus.worldToLevel(game,x,y);
  assert.ok(focus.inLevelView(sx,sy,game),game.constructor.name+' keeps its target visible: '+x+','+y);
  const [wx,wy]=focus.levelToWorld(game,sx,sy);assert.ok(Math.hypot(wx-x,wy-y)<1e-8);
 }
 focus.drawLevelView({focus:game.focus,draw(){draws++;},danger(){dangers++;}},true);assert.equal(depth,0);
}
assert.equal(draws,30);assert.equal(dangers,30);
console.log('All 30 focused frames retain their action targets and invert pointer coordinates correctly.');
