'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inspect=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx));
const results=[];
for(const releaseChoice of [0,1,2]){
  setup(ctx,{id:'katorga-custody-'+releaseChoice,seed:110270+releaseChoice,region:'ウルサス',age:20});
  ctx.RELEASE_CHOICE=releaseChoice;
  const outcome=inspect("\n    S.year=1101;S.age=20;S.mo=12;S.job=4;\n    const contact=EV.find(e=>e.id==='life_ursus_student_assembly_contact'),\n      meeting=EV.find(e=>e.id==='life_ursus_student_assembly_meeting'),\n      protest=EV.find(e=>e.id==='life_ursus_student_assembly_protest'),\n      katorga=EV.find(e=>e.id==='life_ursus_katorga_life'),\n      release=EV.find(e=>e.id==='life_ursus_student_assembly_release'),\n      generic=EV.find(e=>e.id==='detain_life');\n    ap(contact.c[0].o[0][2]);\n    ap(meeting.c[0].o[0][2]);\n    S.sn[meeting.id]=1101;\n    S.eventOutcomes={[meeting.id]:{year:1101,choiceIndex:0,outcomeIndex:0}};\n    ap(protest.c[0].o[0][2]);\n    S.sn[protest.id]=1101;\n    const ordinary={id:'work-while-sealed',st:['青年'],w:1,t:'probe',fx:{}};\n    const sealed={detained:S.fl.detained,special:S.fl.ursus_katorga_detained,\n      restricted:restricted(S),job:S.job,active:S.fl.ursus_student_assembly_active,\n      normalEvent:elig(ordinary,S,tags(S)),genericRelease:elig(generic,S,tags(S))};\n    S.year=1102;S.age=21;S.mo=3;\n    const canLive=elig(katorga,S,tags(S));\n    ap(katorga.c[0].o[0][2]);S.sn[katorga.id]=1102;\n    const canRelease=elig(release,S,tags(S));\n    ap(release.c[RELEASE_CHOICE].o[0][2]);\n    const after={detained:S.fl.detained,special:S.fl.ursus_katorga_detained,\n      restricted:restricted(S),active:S.fl.ursus_student_assembly_active,\n      normalEvent:elig(ordinary,S,tags(S)),\n      again:elig(release,S,tags(S)),\n      affiliation:S.lifeRecord?.affiliations?.find(x=>x.id==='ursus-student-assembly')?.status};\n    return {sealed,canLive,canRelease,after};\n");
  results.push(outcome);
  assert.equal(outcome.sealed.detained,1,'physical custody blocks work outside Katorga');
  assert.equal(outcome.sealed.special,1);
  assert.equal(outcome.sealed.restricted,true);
  assert.equal(outcome.sealed.job,0,'internment suspends previous employment');
  assert.equal(outcome.sealed.active,0,'group cannot operate normally from sealed Katorga');
  assert.equal(outcome.sealed.normalEvent,false);
  assert.equal(outcome.sealed.genericRelease,false,'generic escape/appeal must not bypass the Katorga story');
  assert.equal(outcome.canLive,true,'special confinement scene must be reachable');
  assert.equal(outcome.canRelease,true,'special Katorga release remains reachable');
  assert.equal(outcome.after.detained,0);
  assert.equal(outcome.after.special,0);
  assert.equal(outcome.after.restricted,false);
  assert.equal(outcome.after.normalEvent,true,'ordinary opportunities return once freed');
}
assert.deepEqual(results.map(r=>r.after.active),[1,0,0],
  'only one release choice resumes student activity');
setup(ctx,{id:'other-detention-available',seed:110299,region:'ウルサス',age:20});
const regular=inspect("\n  S.year=1102;S.age=21;S.mo=3;S.fl.detained=1;\n  S.fl.ursus_katorga_detained=0;\n  return {available:elig(EV.find(e=>e.id==='detain_life'),S,tags(S))};\n");
assert.equal(regular.available,true,'ordinary custody retains its existing appeal/escape flow');
console.log('PASS Katorga custody blocks outside work and generic escape; all three release routes restore ordinary life');
