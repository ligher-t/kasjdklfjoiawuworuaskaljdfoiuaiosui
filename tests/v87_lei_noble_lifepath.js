'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),document={currentScript:null,getElementById(){return{hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const context={window:{},document,console,localStorage:{getItem(){return null},setItem(){}},Date,setTimeout(){},setInterval(){}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),context,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],context,{timeout:15000});context.rd=()=>{};
const event=id=>context.window.GAME_DATA.EV.find(row=>row.id===id),entry=event('lei_noble'),review=event('lei_noble_after'),later=event('lei_noble_later');
assert(entry&&review&&later,'Leithanien cultural-access route events missing');
assert.equal(entry.c.length,3);assert.equal(review.c.length,3);assert.equal(later.c.length,2);
assert.equal(review.once,true);assert.equal(later.once,true);assert.equal(review.after.id,'lei_noble');assert.equal(review.after.min,2);assert.equal(later.after.id,'lei_noble_after');assert.equal(later.after.min,5);
assert(review.c.every(choice=>choice.ethics?.reviewed&&choice.ethics.policyVersion===87),'review choices must be classified');
assert(later.c.every(choice=>choice.ethics?.reviewed&&choice.ethics.policyVersion===87),'later choices must be classified');
assert.match(entry.c[0].o[0][1],/継続支援や次の招待はまだ決まっていない/);
assert.match(entry.c[1].o[0][1],/次の雇用は決まっていない/);
assert(!entry.c[0].o[0][2].fl?.noble_patron||entry.c[0].o[0][2].lifeAffiliation,'patron contact must be recorded as a personal affiliation');
assert(!event('piano').c[0].o[0][2].fl?.noble_patron,'purchasing an instrument must not grant patronage');
const affiliationIds=['lei-music-patronage','lei-music-casual-work'],goalIds=['lei-music-practice','lei-music-livelihood'];
function startPath(kind){
 return vm.runInNewContext(String.raw`(()=>{
  born({seed:871017,by:1070,region:'リターニア'});S.age=19;S.year=1089;
  const event=EV.find(row=>row.id==='lei_noble_after'),kind=${JSON.stringify(kind)};
  S.fl.noble_patron=1;
  const oldMarkerOnly=event.show(S);
  S.lifeRecord.affiliations=[];S.lifeRecord.goals=[];S.lifeRecord.skills=[];
  const identity=kind==='patron'?['lei-music-patronage','リターニアの音楽後援者との接点','arts-patronage','後援者一人と連絡先を交換']:['lei-music-casual-work','リターニアの演奏会補助','career','演奏会の設営・撤収を担う短期雇用'];
  applyLifeAffiliation({id:identity[0],title:identity[1],kind:identity[2],action:'join',role:identity[3]});
  applyLifeGoal({id:kind==='patron'?'lei-music-practice':'lei-music-livelihood',title:kind==='patron'?'後援だけに頼らず音楽の道を続ける':'文化催事の仕事で生計をつなぐ',action:'start'});
  const available=event.show(S);S.year+=2;S.age+=2;
  const fx=EV.find(row=>row.id==='lei_noble_after').c[1].o[0][2];
  ap(fx);
  const later=EV.find(row=>row.id==='lei_noble_later'),affiliation=S.lifeRecord.affiliations[0],goal=S.lifeRecord.goals[0];
  const atLater=(()=>{S.year+=5;S.age+=5;return later.show(S)})();
  const continuation=later.c[0].o[0][2],exit=later.c[1].o[0][2];
  ap({lifeGoals:continuation.lifeGoals||[]});
  const audit=auditLifeState(S);
  return {oldMarkerOnly,available,atLater,affiliation,goal,audit};
 })()`,context,{timeout:30000});
}
const outcomes=[];
for(const kind of ['patron','worker']){
 const state=startPath(kind);assert.equal(state.oldMarkerOnly,false,'legacy patron flag alone must not invent a continuous life route');
 assert.equal(state.available,true,'a recorded individual affiliation may continue after two years');assert.equal(state.atLater,true,'a continuing or deferred route reaches the later-life review');
 assert.equal(state.affiliation.status,'active');assert.equal(state.goal.status,'active');assert.deepEqual(Array.from(state.audit),[]);outcomes.push({kind,status:state.affiliation.status,goal:state.goal.status});
}
for(const choiceIndex of [0,1,2]){
 const state=vm.runInNewContext(String.raw`(()=>{
  born({seed:871100+${choiceIndex},by:1070,region:'リターニア'});S.age=19;S.year=1089;
  const kind=${choiceIndex===0?'"patron"':'"worker"'},review=EV.find(row=>row.id==='lei_noble_after');
  const input=kind==='patron'?{id:'lei-music-patronage',title:'リターニアの音楽後援者との接点',kind:'arts-patronage',action:'join',role:'一人と連絡先を交換'}:{id:'lei-music-casual-work',title:'リターニアの演奏会補助',kind:'career',action:'join',role:'一日の短期雇用'};
  applyLifeAffiliation(input);applyLifeGoal({id:kind==='patron'?'lei-music-practice':'lei-music-livelihood',title:kind==='patron'?'音楽の道を続ける':'文化催事の仕事で生計をつなぐ',action:'start'});
  const fx=review.c[${choiceIndex}].o[0][2];
  ap(fx);
  return {affiliation:S.lifeRecord.affiliations[0],goal:S.lifeRecord.goals[0],laterAvailable:EV.find(row=>row.id==='lei_noble_later').show(S),audit:auditLifeState(S)};
 })()`,context,{timeout:30000});
 if(choiceIndex===2){assert.equal(state.affiliation.status,'left');assert.equal(state.goal.status,'compromised');assert.equal(state.laterAvailable,false)}
 else {assert.equal(state.affiliation.status,'active');assert.equal(state.goal.status,'active');assert.equal(state.laterAvailable,true)}
 assert.deepEqual(Array.from(state.audit),[]);
}
console.log(JSON.stringify({passed:true,entryPaths:['patron-contact','casual-arts-work'],reviewChoices:review.c.length,laterChoices:later.c.length,legacyMarkerDoesNotCreateRoute:true,followupConditionsAndLifecycle:true,results:outcomes},null,2));
