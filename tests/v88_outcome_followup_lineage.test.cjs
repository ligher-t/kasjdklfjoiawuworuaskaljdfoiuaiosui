'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inspect=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx));
setup(ctx,{id:'U19-romance-lineage',seed:110219,region:'龍門',age:25});
const romance=inspect(`
  S.year=1105;S.age=25;S.mo=6;S.sn={};S.eventOutcomes={};
  const rows=[
    ['romance_future_talk','romance_followup',0,0],
    ['romance_marriage_choice','romance_future_talk',0,0],
    ['romance_cohabitation_review','romance_marriage_choice',2,0]
  ].map(([laterId,earlierId,expectedChoice,expectedOutcome])=>{
    const event=EV.find(e=>e.id===laterId);
    if(!event)throw Error(laterId+' absent');
    S.sn[earlierId]=1103;
    const probe={id:'test-'+laterId,st:['青年','壮年'],
      after:event.after,fx:{},w:1,t:'probe'};
    const without=elig(probe,S,tags(S));
    S.eventOutcomes[earlierId]={year:1103,choiceIndex:expectedChoice===0?1:0,outcomeIndex:0};
    const wrong=elig(probe,S,tags(S));
    S.eventOutcomes[earlierId]={year:1103,choiceIndex:expectedChoice,outcomeIndex:expectedOutcome};
    const correct=elig(probe,S,tags(S));
    S.eventOutcomes[earlierId].year=1104;
    const stale=elig(probe,S,tags(S));
    return {laterId,without,wrong,correct,stale,rule:event.after};
  });
  return rows;
`);
for(const row of romance){
 assert.equal(row.without,false,row.laterId+' needs a recorded choice result');
 assert.equal(row.wrong,false,row.laterId+' must not fire after a different choice');
 assert.equal(row.correct,true,row.laterId+' follows only the intended event outcome');
 assert.equal(row.stale,false,row.laterId+' must reject a mismatched event year');
}
setup(ctx,{id:'U19-ursus-participation',seed:110220,region:'ウルサス',age:20});
const ursus=inspect(`
  S.year=1101;S.age=20;S.mo=12;
  const meeting=EV.find(e=>e.id==='life_ursus_student_assembly_meeting'),
        protest=EV.find(e=>e.id==='life_ursus_student_assembly_protest');
  const contact=EV.find(e=>e.id==='life_ursus_student_assembly_contact');
  ap(contact.c[0].o[0][2]); // contact starts the specific affiliation and life goal
  S.fl.ursus_student_assembly_active=1;
  S.sn[meeting.id]=1101;
  S.eventOutcomes={[meeting.id]:{year:1101,choiceIndex:0,outcomeIndex:0}};
  const street={seen:simulationChoiceStates(protest,S,tags(S)).map(x=>x.shown),
    text:txt(protest,S,tags(S))};
  S.eventOutcomes[meeting.id].choiceIndex=1;
  const liaison={seen:simulationChoiceStates(protest,S,tags(S)).map(x=>x.shown),
    text:txt(protest,S,tags(S))};
  ap(meeting.c[1].o[0][2]);
  ap(protest.c[3].o[0][2]);
  const participant=S.lifeRecord.affiliations.find(x=>x.id==='ursus-student-assembly');
  const afterLiaison={active:S.fl.ursus_student_assembly_active,role:participant?.role,
    status:participant?.status,detained:!!S.fl.ursus_katorga_detained};
  // A different outcome of the same choice event requires a separate life.
  born({seed:110221,by:1081,region:'ウルサス'});
  S.year=1101;S.age=20;S.mo=12;
  ap(contact.c[0].o[0][2]);
  ap(meeting.c[1].o[0][2]);
  ap(protest.c[4].o[0][2]);
  const paused=S.lifeRecord.affiliations.find(x=>x.id==='ursus-student-assembly');
  const afterPause={active:S.fl.ursus_student_assembly_active,status:paused?.status,
    detained:!!S.fl.ursus_katorga_detained};
  return {street,liaison,afterLiaison,afterPause};
`);
assert.deepEqual(ursus.street.seen,[true,true,true,false,false]);
assert.deepEqual(ursus.liaison.seen,[false,false,false,true,true]);
assert(ursus.street.text.includes('宮殿前の広場'));
assert(ursus.liaison.text.includes('広場から離れた部屋'));
assert(!ursus.liaison.text.includes('すぐ目の前で友人'));
assert.equal(ursus.afterLiaison.active,1);
assert.equal(ursus.afterLiaison.role,'帰宅確認と家族への伝言係');
assert.equal(ursus.afterLiaison.detained,false);
assert.equal(ursus.afterPause.active,0);
assert.equal(ursus.afterPause.status,'suspended');
assert.equal(ursus.afterPause.detained,false);
console.log('PASS romance actual-outcome lineage; distinct protest/liaison accounts and role state');
