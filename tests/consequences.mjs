import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
function load(file,names,bindings={}){
 const code=stripTypeScriptTypes(readFileSync(new URL('../src/'+file,import.meta.url),'utf8')).replace(/^import[\s\S]*?;\r?$/gm,'').replace(/export /g,'');
 return runInNewContext(code+'\n({'+names.join(',')+'})',{...bindings});
}
let depth=0;const people=[],infants=[];
const finite=(...a)=>{for(const n of a)if(typeof n==='number')assert.ok(Number.isFinite(n));};
const ctx=new Proxy({save(){depth++;},restore(){depth--;assert.ok(depth>=0);}},{get:(o,k)=>k in o?o[k]:finite,set:(o,k,v)=>{o[k]=v;return true;}});
const assets={outdoorFor:()=>undefined,outdoorBackdrop:finite,ctx,W:360,H:640,reduce:false,clock:{t:0},C:{ink:'#123',gold:'#fc0'},lin:()=> '#abc',rr:finite,circ:finite,ell:finite,seg:finite,perspectiveFloor:finite,
 bayraa:(...a)=>{people.push(a);finite(...a);},baby:(...a)=>infants.push(a),caregiver:finite,
 car:finite,cow:finite,stove:finite,dog:finite,hotCup:finite,manhole:finite,cleaningBottle:finite,boosterSeat:finite,reversingCar:finite,damagedCord:finite,snowRoof:finite,icicle:finite,
};
const extra=load('art/extra.ts',['extraConsequence'],assets);
const expected={helmet:['hurt','head'],stairs:['hurt','head'],sidewalk:['hurt','foot'],knife:['hurt','hand'],iron:['hurt','hand'],kettle:['hurt','foot'],oven:['hurt','hand'],glass:['hurt','foot'],battery:['breathless','throat'],medicine:['dizzy','stomach'],bag:['breathless','head']};
for(const [kind,[mood,injury]] of Object.entries(expected)){
 people.length=0;extra.extraConsequence(kind,0,0,0);const before=people.at(-1);
 people.length=0;extra.extraConsequence(kind,1,1,1);const after=people.at(-1);
 assert.equal(after[3].mood,mood,kind+' shows its physical outcome');assert.equal(after[3].injury,injury);
 assert.notDeepEqual(after,before,kind+' changes the avatar after contact');assert.equal(depth,0);
 if(kind==='helmet'||kind==='stairs')assert.ok(after[3].rot>1.3,'fall visibly finishes on the ground');
 if(kind==='medicine')assert.equal(after[3].green,true);
 if(kind==='battery'||kind==='bag')assert.equal(after[3].pale,true);
}
const {LESSONS}=load('ui/lessons.ts',['LESSONS'],{});
const effect=load('ui/consequences.ts',['drawConsequence','consequenceMotion'],{...assets,...extra,LESSONS});
const cmd=kind=>Object.keys(LESSONS).find(c=>LESSONS[c]===kind);
function pose(kind,time,reason=''){
 people.length=0;effect.drawConsequence(cmd(kind),0,0,320,240,time,reason);assert.equal(depth,0);return people.at(-1);
}
const river=pose('river',2.8);assert.ok(river[1]-109>187,'drowning ends below the foreground waterline');assert.equal(river[3].wet,true);
assert.ok(pose('manhole',2.8)[1]-109>210,'fall completes below the manhole opening');
assert.ok(pose('balcony',2.8)[1]-109>240,'balcony fall continues beyond the railing');
assert.ok(pose('ice',2.8)[3].rot>1.3,'ice slip completes its fall');
assert.equal(pose('smoke',2.8)[3].cough,true,'smoke causes coughing');
assert.equal(pose('hat',2.8)[3].frozen,true,'cold causes visible freezing');
assert.equal(pose('socket',2.8)[3].injury,'hand');
assert.equal(pose('cord',2.8)[3].injury,'hand');
assert.ok(pose('seatbelt',2.8)[0]>180,'unrestrained occupant moves toward the dashboard');
pose('cleaner',2.8);assert.equal(infants.at(-1)[4],'sick');
pose('baby',2.8);assert.equal(infants.at(-1)[4],'hurt');
const final=effect.consequenceMotion(2.8);assert.equal(final.aftermath,1);
const still=effect.consequenceMotion(0,true);assert.equal(still.aftermath,1,'reduced motion preserves the final outcome');
console.log('All 30 consequences: physical outcomes, drowning/submersion, completed falls and distinct injury poses passed.');
