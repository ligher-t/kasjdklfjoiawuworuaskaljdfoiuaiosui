'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {installGeneralEmploymentFixture}=require('./support/general-employment-fixture.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
installGeneralEmploymentFixture(ctx);
const source="\n const cfg=CASE;\n born({seed:SEED,by:1077,region:cfg.region});\n S.age=20;S.year=1097;S.mo=3;S.cash=1e7;S.house.cash=1e7;S.job=0;S.k=50;S.socialLearning={...(S.socialLearning||{}),literacy:60};\n const car=EV.find(e=>e.id==='car'),entryIndex=car.c.findIndex(c=>c.l.includes(cfg.application));\n if(entryIndex<0)throw Error('Missing failed application choice: '+cfg.application);\n const follow=EV.find(e=>e.id===cfg.event);\n if(!follow)throw Error('Missing follow-up: '+cfg.event);\n const denied=car.c[entryIndex].o[1][2];\n ap(denied);S.sn.car=S.year;\n const employer=S.lifeRecord.affiliations.find(a=>a.id===cfg.employer),\n  goal=()=>S.lifeRecord.goals.find(g=>g.id===cfg.goal);\n const initial={job:S.job,employment:employer?.status,goal:goal()?.status,\n   hadContact:employer?.history.some(h=>h.action==='contact'),\n   declined:employer?.history.some(h=>h.action==='decline')};\n S.year=1098;S.age=21;\n const initiallyEligible=elig(follow,S,tags(S));\n let details={};\n if(MODE==='related'){\n   startGeneralEmploymentFixture(cfg.relatedJob,cfg.event+':'+S.year);\n   const relevant=follow.c[0].show(S),other=follow.c[1].show(S),unemployed=follow.c[3].show(S);\n   ap(follow.c[0].o[0][2]);S.sn[follow.id]=S.year;\n   details={relevant,other,unemployed,goal:goal()?.status,\n     history:goal()?.history.at(-1)?.action,\n     repeat:elig(follow,S,tags(S)),job:S.job,employment:employer?.status};\n }else if(MODE==='other'){\n   startGeneralEmploymentFixture(17,cfg.event+':'+S.year+':other');\n   const relevant=follow.c[0].show(S),other=follow.c[1].show(S),finish=follow.c[2].show(S);\n   ap(follow.c[1].o[0][2]);S.sn[follow.id]=S.year;\n   const compromised=goal()?.status;\n   S.year=1099;S.age=22;\n   const oneYearLater=elig(follow,S,tags(S));\n   S.year=1100;S.age=23;\n   const twoYearsLater=elig(follow,S,tags(S));\n   startGeneralEmploymentFixture(cfg.relatedJob,cfg.event+':'+S.year);\n   const relevantLater=follow.c[0].show(S);\n   ap(follow.c[0].o[0][2]);S.sn[follow.id]=S.year;\n   details={relevant,other,finish,compromised,oneYearLater,twoYearsLater,\n    relevantLater,goal:goal()?.status,history:goal()?.history.at(-1)?.action,\n    repeat:elig(follow,S,tags(S)),job:S.job,employment:employer?.status};\n }else if(MODE==='unemployed'){\n   const continueShown=follow.c[3].show(S),pauseShown=follow.c[4].show(S),\n     offeredWork=follow.c[0].show(S);\n   ap(follow.c[4].o[0][2]);S.sn[follow.id]=S.year;\n   const paused=goal()?.status;\n   S.year=1100;S.age=23;\n   const repeated=elig(follow,S,tags(S));\n   ap(follow.c[3].o[0][2]);S.sn[follow.id]=S.year;\n   const resumed=goal()?.status;\n   S.year=1102;S.age=25;startGeneralEmploymentFixture(17,cfg.event+':'+S.year+':other');\n   const finishShown=follow.c[2].show(S);\n   ap(follow.c[2].o[0][2]);S.sn[follow.id]=S.year;\n   details={continueShown,pauseShown,offeredWork,paused,repeated,resumed,\n    finishShown,goal:goal()?.status,history:goal()?.history.at(-1)?.action,\n    repeat:elig(follow,S,tags(S)),job:S.job,employment:employer?.status};\n }else throw Error('Unknown scenario');\n return {event:follow.id,initial,initiallyEligible,details,\n   audit:auditLifeState(S)};\n";
const run=(cfg,mode,seed)=>{
 ctx.CASE=cfg;ctx.MODE=mode;ctx.SEED=seed;
 return JSON.parse(vm.runInContext('JSON.stringify((()=>{'+source+'})())',ctx,{timeout:30000}));
};
const cases=[
 {event:'life_columbia_failed_application_followup',goal:'columbia-technical-next-step',
  region:'クルビア',application:'クルビアの研究企業の技師職',employer:'columbia-technical-work',relatedJob:18},
 {event:'life_victoria_failed_application_followup',goal:'victoria-clerk-next-step',
  region:'ヴィクトリア',application:'ヴィクトリアの保険仲介所',employer:'victoria-insurance-clerk',relatedJob:21}
];
for(let i=0;i<cases.length;i++){
 const cfg=cases[i];
 const related=run(cfg,'related',883300+i*3);
 assert.deepEqual(related.initial,{job:0,employment:'outside',goal:'active',hadContact:true,declined:true},cfg.event+' rejected application');
 assert.equal(related.initiallyEligible,true,cfg.event+' initial later review');
 assert.deepEqual([related.details.relevant,related.details.other,related.details.unemployed],
   [true,false,false],cfg.event+' relevant-job eligibility');
 assert.deepEqual([related.details.goal,related.details.history,related.details.repeat],
   ['achieved','complete',false],cfg.event+' related employment completes goal');
 assert.equal(related.details.employment,'outside',cfg.event+' must not revive rejected employer');
 assert.deepEqual(related.audit,[]);

 const other=run(cfg,'other',883301+i*3);
 assert.deepEqual([other.details.relevant,other.details.other,other.details.finish],
   [false,true,true],cfg.event+' unrelated job choices');
 assert.deepEqual([other.details.compromised,other.details.oneYearLater,other.details.twoYearsLater,other.details.relevantLater],
   ['compromised',false,true,true],cfg.event+' deliberate later related job choice');
 assert.deepEqual([other.details.goal,other.details.history,other.details.repeat],
   ['achieved','complete',false],cfg.event+' eventually achieves related work');
 assert.deepEqual(other.audit,[]);

 const idle=run(cfg,'unemployed',883302+i*3);
 assert.deepEqual([idle.details.continueShown,idle.details.pauseShown,idle.details.offeredWork],
   [true,true,false],cfg.event+' jobless choices');
 assert.deepEqual([idle.details.paused,idle.details.repeated,idle.details.resumed,idle.details.finishShown],
   ['paused',true,'active',true],cfg.event+' can defer, resume and settle for new occupation');
 assert.deepEqual([idle.details.goal,idle.details.history,idle.details.repeat,idle.details.job],
   ['abandoned','abandon',false,17],cfg.event+' abandonment requires explicit choice');
 assert.deepEqual(idle.audit,[]);
}
console.log('PASS: rejected technical and clerical applicants retain failed employer history and review independent job goals without invented hiring');
