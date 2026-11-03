'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),vm=require('node:vm');
const annual=require('./support/annual-cases.cjs');
const root=path.resolve(__dirname,'..');
const {ctx}=annual.context(root);
annual.setup(ctx,{id:'p0-education-service',seed:948101,region:'ヴィクトリア',age:8});
function inspect(age,region,id){
  ctx.__scenario={age,region,id};
  return vm.runInContext(`(()=>{
    const {age,region,id}=__scenario;
    S.age=age;S.year=S.by+age;S.res=REG.find(r=>r.n===region);
    const scene=EV.find(e=>e.id===id),tagsNow=tags(S);
    return {eligible:elig(scene,S,tagsNow),shown:scene.c.map(c=>({label:c.l,visible:ok(c.show,S,tagsNow),enabled:ok(c.en,S,tagsNow)}))};
  })()`,ctx,{timeout:15000});
}
const schoolAtFive=inspect(5,'ヴィクトリア','sch');
const schoolAtEight=inspect(8,'ヴィクトリア','sch');
const schoolAtTen=inspect(10,'ヴィクトリア','sch');
assert.equal(schoolAtFive.eligible,false,'school choice cannot occur before its age gate');
assert.equal(schoolAtTen.eligible,false,'school choice cannot occur after its age gate');
assert.equal(schoolAtEight.eligible,true,'the player sees a school-entry decision at eight');
assert.equal(vm.runInContext("EV.find(e=>e.id==='sch').who",ctx),'self',
  'primary-school entry must pause for the player rather than roll a caregiver decision');
assert(schoolAtEight.shown.some(c=>c.label==='小学校への入学を希望する'&&c.visible),
  'the school application option is always displayed');
assert(schoolAtEight.shown.some(c=>c.label==='家の手伝いをする'&&c.visible),
  'a non-school route remains selectable');
const carAtSixteen=inspect(16,'ヴィクトリア','car');
const carAtEighteen=inspect(18,'ヴィクトリア','car');
const carAtTwentyTwo=inspect(22,'ヴィクトリア','car');
assert.equal(carAtSixteen.eligible,false,'career entry requires the minimum age');
assert.equal(carAtTwentyTwo.eligible,false,'career entry respects its upper age limit');
assert(carAtEighteen.shown.some(c=>c.label==='軍務に志願する'&&c.visible),'Victoria permits the declared military route');
const inKazdel=inspect(18,'カズデル','car');
assert.equal(inKazdel.shown.find(c=>c.label==='軍務に志願する').visible,false,'state army route is not universal');
assert.equal(inKazdel.shown.find(c=>c.label==='傭兵団に加わる').visible,true,'Kazdel route remains distinct from state service');
const career=vm.runInContext("EV.find(e=>e.id==='car')",ctx);
const service=career.c.find(c=>c.l==='軍務に志願する'),guard=career.c.find(c=>c.l==='傭兵団に加わる');
assert.equal(vm.runInContext('J',ctx)[service.o[0][2].job].n,'軍務・兵站','regular army recruitment must not assign mercenary work');
assert.equal(guard.o[0][2].job,4);
assert.equal(service.o[0][2].fl?.trauma_war,undefined,'recruitment alone does not establish wartime trauma');
assert.equal(guard.o[0][2].fl?.trauma_war,undefined,'a completed guard contract alone does not establish trauma');
assert.equal(service.o[1][2].fl?.trauma_war,1,'the explicit first-battle injury still records trauma');
function phaseBSchool(id, enrolled, age = 12) {
  ctx.__phaseBSchool = {id, enrolled, age};
  return vm.runInContext('(()=>{ const {id,enrolled,age}=__phaseBSchool; S.age=age; S.year=S.by+age; S.res=REG.find(r=>r.n==="ヴィクトリア"); S.fl.sch=enrolled?1:0; S.ep=0; const scene=EV.find(e=>e.id===id); return {eligible:elig(scene,S,tags(S)),text:typeof scene.t==="function"?scene.t(S):scene.t,education:educationStandingLabel(S)};})()', ctx);
}
const outOfSchool = phaseBSchool('bias_peer_mockery', false);
const inSchool = phaseBSchool('bias_peer_mockery', true);
assert.equal(outOfSchool.eligible, false, 'a classroom bullying scene must not affect a child outside school');
assert.equal(inSchool.eligible, true, 'a pupil can encounter the documented classroom bullying scene');
assert.match(inSchool.education, /在籍中/, 'entry into school is not mislabeled as never enrolled before completion');
assert.doesNotMatch(outOfSchool.education, /在籍中/, 'informal learning does not assert formal enrollment');
const teacherAway = phaseBSchool('people_school_life_conversation', false);
const teacherInClass = phaseBSchool('people_school_life_conversation', true);
assert.match(teacherAway.text, /道で再会/, 'former pupils can keep a personal connection without claiming current classes');
assert.doesNotMatch(teacherAway.text, /授業後|教室/, 'out-of-school teacher conversations do not invent attendance');
assert.match(teacherInClass.text, /授業後/, 'enrolled pupils still have the classroom conversation');
for (const id of ['facility_school_disruption','facility_school_reopen']) {
  const scene=vm.runInContext('EV.find(e=>e.id==='+JSON.stringify(id)+')',ctx);
  assert(scene.need.includes('就学中'), id+' must require actual enrollment in addition to local school availability');
}
assert.equal(service.o[0][2].fl?.retired, undefined, 'military recruitment is not immediate retirement');
const olderVeteran=vm.runInContext('EV.find(e=>e.id==="veteran")',ctx);
assert.equal(olderVeteran.c[0].o[0][2].fl.retired, 1, 'retirement is recorded only on the later explicit leave choice');
assert.equal(olderVeteran.c[1].o[0][2].fl?.retired, undefined, 'changing from duty to training is not retirement');
const conscription=vm.runInContext('EV.find(e=>e.id==="fam_conscript")',ctx);
assert(conscription,'the sibling conscription scene is available');
const replacement=conscription.c.find(c=>c.l==='自分が身代わりになって出頭する'||c.l==='自分が代わりに出頭する');
for(const outcome of replacement.o){
  assert.equal(outcome[2].fl?.trauma_war,undefined,'training or recruitment without combat cannot establish war trauma');
  assert.equal(outcome[2].fl?.veteran,1,'both service outcomes retain service history');
}
assert.equal(vm.runInContext('J',ctx)[replacement.o[0][2].job].n,'軍務・兵站');
for(const route of [service,guard])assert.equal(route.o[1][2].fl.veteran,1,'first-duty injury retains the service history');
assert.equal(guard.o[1][2].fl.trauma_war,undefined,'an unspecified first-duty injury does not prove combat');
assert.doesNotMatch(olderVeteran.t,/古傷/,'a worker without an injury record must not be assigned an old wound');
for(const [by,region,home] of [[1000,'カズデル','固定集落'],[1100,'ヴィクトリア','移動都市']]){
 ctx.schoolCase={by,region,home};
 const result=vm.runInContext(`(()=>{
   born({by:schoolCase.by,region:schoolCase.region,seed:948106});S.age=8;S.year=S.by+8;S.home=schoolCase.home;
   const school=activeFacility(S,'school'),entry=EV.find(e=>e.id==='sch').c[0];
   S.inf=0;S.fl.dg=0;
   school.lastYear=S.year;school.status='available';
   const available={visible:ok(entry.show,S,tags(S)),enabled:ok(entry.en,S,tags(S))};
   school.status='limited';
   const limited={visible:ok(entry.show,S,tags(S)),enabled:ok(entry.en,S,tags(S))};
   return {available,limited};
 })()`,ctx);
 assert.equal(result.available.visible,true,'school application is presented while a school is available');
 assert.equal(result.available.enabled,true,'an accessible school permits applying');
 assert.equal(result.limited.visible,true,'a disrupted school still shows the application choice');
 assert.equal(result.limited.enabled,true,'a disrupted school still permits stating the wish to search; enrollment is checked later');
}
for(const [eventId,label,outcomeIndex,expectedJob,trauma] of [
 ['car','軍務に志願する',0,'軍務・兵站',false],
 ['car','軍務に志願する',1,'無職',true],
 ['car','傭兵団に加わる',1,'無職',false],
 ['fam_conscript',conscription.c.find(c=>c.l==='自分が身代わりになって出頭する'||c.l==='自分が代わりに出頭する').l,0,'軍務・兵站',false]
]){
 annual.setup(ctx,{id:'service-outcome',seed:948109,region:'ヴィクトリア',age:18});
 ctx.effectCase={eventId,label,outcomeIndex};
 const outcome=vm.runInContext(`(()=>{const c=EV.find(e=>e.id===effectCase.eventId).c.find(c=>c.l===effectCase.label);ap(c.o[effectCase.outcomeIndex][2]);return {job:occupationLabel(S),trauma:!!S.fl.trauma_war,service:!!S.fl.veteran};})()`,ctx);
 assert.equal(outcome.job,expectedJob,'effect application preserves the declared occupation');
 assert.equal(outcome.trauma,trauma,'only explicit combat injury establishes war trauma');
 assert.equal(outcome.service,true,'service history survives the real effect pipeline');
}
annual.setup(ctx,{id:'medical-assistant',seed:948110,region:'クルビア',age:22});
assert.equal(vm.runInContext(`(()=>{
 const route=EV.find(e=>e.id==='study_to_work').c.find(c=>c.l==='診療・研究機関の補助職へ応募する');
 ap(route.o[0][2]);return occupationLabel(S);
})()`,ctx),'医療補助・薬局手伝い','an assistant appointment must not confer physician/researcher employment');
console.log('PASS P0 education, local school access, service occupation, combat trauma and retirement boundaries');
