import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
function load(file,names,bindings={}) {
  const code=stripTypeScriptTypes(readFileSync(new URL('../src/'+file,import.meta.url),'utf8'))
    .replace(/^import[\s\S]*?;\r?$/gm,'').replace(/export /g,'');
  return runInNewContext(code+'\n({'+names.join(',')+'})',{...bindings});
}
const {DragKeys}=load('core/dragKeys.ts',['DragKeys']);
const classes={};
for(const [file,name] of [['smoke','Smoke'],['ice','Ice'],['socket','Socket'],['hat','Hat'],['cow','Cow'],['baby','Baby'],['crossing','Crossing'],['dust','Dust'],['cabinet','Cabinet'],['river','River'],['dog','Dog'],['drink','Drink'],['manhole','Manhole'],['seatbelt','Seatbelt'],['balcony','Balcony'],['cleaner','Cleaner']]) {
  Object.assign(classes,load('games/'+file+'.ts',[name],{DragKeys}));
}
Object.assign(classes,load('games/prevention.ts',['Reversing','Cord','Icicles']));
const {EXTRA_LEVELS}=load('meta/extra.ts',['EXTRA_LEVELS']);
Object.assign(classes,load('games/extra.ts',['extraGames'],{EXTRA_LEVELS,DragKeys}));
const {games}=load('games/index.ts',['games'],classes);
assert.equal(games.length,30);
assert.equal(new Set(games.map(m=>m.cmd)).size,30,'each level has a unique identity');
const content=load('meta/content.ts',['TOPICS','INFO','ACTIVE_COMMANDS','infoOf']);
for(const m of games)assert.ok(content.infoOf(m.cmd),'each playable level has a card and lesson metadata');
assert.ok(!/\?{2,}/.test(JSON.stringify(content.INFO)),'Mongolian metadata must survive source generation');
assert.deepEqual([...content.ACTIVE_COMMANDS].sort(),Array.from(games,m=>m.cmd).sort());
const {OUTFITS,look}=load('art/look.ts',['OUTFITS','look']);
assert.ok(OUTFITS.every(o=>o.need<=games.length),'all outfit rewards are reachable with thirty cards');
const oldSave={cards:[...Object.keys(content.INFO),'retired'],topics:['home','summer'],outfit:'festival',sound:true};
const {progress}=load('meta/progress.ts',['progress'],{
  ...content,OUTFITS,look,localStorage:{getItem:()=>JSON.stringify(oldSave)},
});
assert.equal(progress.cards.size,30,'retired cards do not inflate active totals after reload');
assert.equal(progress.topics.size,2,'saved home and summer topics remain available');

const ctl={playing:true,frac:.8,stage:2,variation:-1};let draws=0;
class Preview {
  cmd='preview'; marker='untouched';
  init(){this.marker='initialized';}
  draw(){draws++;assert.equal(this.marker,'initialized');assert.equal(ctl.stage,1);}
  danger(){}
}
const previews=Array.from({length:3},()=>new Preview());
const cache=new Map();const picks=[];
const widgets=load('ui/widgets.ts',['inBtn','inCircle','BACK_BTN']);
const menus=load('ui/meta.ts',['practicePreview','practiceRect','uiPress'],{
  drawLevelView:m=>m.draw(),...widgets,ctl,games:previews,infoOf:()=>({card:'test'}),OUTFITS:[],look,W:360,H:640,
  g:{state:'practice'},startPractice:i=>picks.push(i),sfx(){},
  snapshot(key,scale,paint){if(!cache.has(key)){paint();cache.set(key,{key});}return cache.get(key);},
});
menus.practicePreview(previews[0]);menus.practicePreview(previews[0]);
assert.equal(draws,1,'previews are cached');
assert.equal(previews[0].marker,'untouched','menu rendering never initializes the playable instance');
assert.deepEqual(ctl,{playing:true,frac:.8,stage:2,variation:-1});
let bottom=0;
for(let i=0;i<3;i++) {
  const b=menus.practiceRect(i,3);assert.ok(b.y>bottom&&b.y+b.h<640);bottom=b.y+b.h;
  menus.uiPress(b.x+b.w/2,b.y+b.h/2);
}
assert.deepEqual(picks,[0,1,2],'every portrait practice card opens its corresponding level');
console.log('Thirty-level roster, active progress, reward reachability and gameplay previews passed.');
