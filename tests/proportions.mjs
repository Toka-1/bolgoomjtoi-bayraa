import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
function load(file,names,bindings={}) {
  const code=stripTypeScriptTypes(readFileSync(new URL('../src/'+file,import.meta.url),'utf8'))
    .replace(/^import .*;$/gm,'').replace(/export /g,'');
  return runInNewContext(code+'\n({'+names.join(',')+'})',{...bindings});
}
let matrix=[1,1,0,0];const stack=[],draws=[];
const noop=()=>{};
const ctx=new Proxy({
  save(){stack.push([...matrix]);},restore(){assert.ok(stack.length);matrix=stack.pop();},
  translate(x,y){matrix[2]+=x*matrix[0];matrix[3]+=y*matrix[1];},
  scale(x,y){matrix[0]*=x;matrix[1]*=y;},
},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>{o[k]=v;return true;}});
function record(kind,x,y,w=0,h=0) {
  const d={kind,x:x*matrix[0]+matrix[2],y:y*matrix[1]+matrix[3],w:w*matrix[0],h:h*matrix[1]};
  for(const v of [d.x,d.y,d.w,d.h])assert.ok(Number.isFinite(v));draws.push(d);
}
const bindings={outdoorFor:()=>undefined,outdoorBackdrop:noop,ctx,clock:{t:0},reduce:true,C:{red:'#f00',ink:'#123',gold:'#fc0'},TAU:Math.PI*2,
  rr:(x,y,w,h)=>record('rect',x,y,w,h),circ:(x,y,r)=>record('circle',x,y,r*2,r*2),ell:noop,seg:noop,
  lin:()=> '#123',rad:()=> '#123',shadow:noop,glow:noop,
};
const {car}=load('art/props.ts',['car'],bindings);car(0,0,false);
const wheels=draws.filter(d=>d.kind==='circle'&&d.w===18&&d.h===18);
assert.equal(wheels.length,2,'lengthened cars retain round wheels');
assert.equal(Math.max(...draws.filter(d=>d.kind==='rect').map(d=>d.x+d.w)),128,'rendered car matches its traffic collision length');
assert.equal(stack.length,0);

// Buildings must meet the ground instead of ending above the foreground people.
draws.length=0;
const {snowRoof}=load('art/prevention.ts',['snowRoof'],bindings);
const {Reversing,Icicles}=load('games/prevention.ts',['Reversing','Icicles'],{
  ...bindings,W:360,H:640,ctl:{},layer:(key,paint)=>paint(),
  perspectiveFloor:y=>record('floor',0,y),reversingCar:noop,snowRoof,icicle:noop,
  caregiver:(x,y,s)=>record('adult',x,y,0,163*s),bayraa:noop,
});
const reversing=new Reversing();reversing.init();reversing.draw();
const yard=draws.find(d=>d.kind==='floor');
assert.ok(draws.some(d=>d.kind==='rect'&&d.x===207&&Math.abs(d.y+d.h-yard.y)<.01),'garage opening meets the yard');
draws.length=0;
const iceBuilding=new Icicles();iceBuilding.init();iceBuilding.draw();
const pedestrian=draws.find(d=>d.kind==='adult');
assert.ok(draws.some(d=>d.kind==='rect'&&d.x===183&&d.y===318&&d.y+d.h===pedestrian.y),'icicle building shares the pedestrians ground plane');
assert.equal(stack.length,0);

draws.length=0;
const {Cleaner,LOCK}=load('games/cleaner.ts',['Cleaner','LOCK'],{
  ...bindings,ctl:{},W:360,H:640,layer:(key,paint)=>paint(),perspectiveFloor:noop,
  solidBox:(x,y,w,h)=>record('box',x,y,w,h),
  caregiver:(x,y,s)=>record('adult',x,y,0,163*s),baby:noop,cleaningBottle:noop,
});
const cleaner=new Cleaner();cleaner.init();cleaner.draw();
const adult=draws.find(d=>d.kind==='adult');
const counter=draws.find(d=>d.kind==='box'&&d.h<15&&d.y<500);
assert.ok((adult.y-counter.y)/adult.h>.4&&(adult.y-counter.y)/adult.h<.65,'sink countertop stays around adult waist height');
assert.ok(counter.w/adult.h<.7,'sink cabinet fits the adult scale');
assert.ok(draws.some(d=>d.kind==='circle'&&Math.abs(d.x-LOCK.x)<.01&&Math.abs(d.y-LOCK.y)<.01),'lock hit target shares the rendered transform');
assert.equal(stack.length,0);

const assets={extraLesson:noop,...bindings,bayraa:(x,y,s)=>record('child',x,y,0,109*s),caregiver:(x,y,s)=>record('adult',x,y,0,163*s),
  car:(x,y)=>record('car',x,y,128,54),reversingCar:(x,y,s)=>record('car',x,y,128*s,54*s),
  hotCup:(x,y,s)=>record('cup',x,y,32*s,33*s),baby:noop,cradle:noop,stove:noop,cow:noop,ger:noop,
  winterHat:noop,noSwimmingSign:noop,dog:noop,manhole:noop,cleaningBottle:noop,boosterSeat:noop,
  damagedCord:noop,snowRoof:noop,icicle:noop,
};
const {LESSONS,drawLesson}=load('ui/lessons.ts',['LESSONS','drawLesson'],assets);
for(const [cmd,kind] of Object.entries(LESSONS)) {
  draws.length=0;drawLesson(cmd,0,0,320,240,3);
  if(kind==='reversing'||kind==='crossing') {
    const child=draws.find(d=>d.kind==='child'),vehicle=draws.find(d=>d.kind==='car');
    assert.ok(child.h<vehicle.h,'lesson child is shorter than the adjacent car: '+kind);
  }
  if(kind==='drink') {
    const cup=draws.find(d=>d.kind==='cup'),adult=draws.find(d=>d.kind==='adult');
    assert.ok(cup.h/adult.h<.1,'lesson cup is hand-sized');
  }
  if(kind==='river'||kind==='socket'||kind==='dog'||kind==='reversing') {
    const child=draws.find(d=>d.kind==='child'),adult=draws.find(d=>d.kind==='adult');
    assert.ok(child.h/adult.h>.5&&child.h/adult.h<.7,'lesson uses distinct child/adult heights: '+kind);
  }
  assert.equal(stack.length,0);
}
console.log('Vehicle geometry, sink reach, interaction anchors and lesson proportions passed.');
