'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {installEmploymentAppointmentFixture}=require('./support/employment-appointment-fixture.cjs');
const {installGeneralEmploymentFixture}=require('./support/general-employment-fixture.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
installEmploymentAppointmentFixture(ctx);installGeneralEmploymentFixture(ctx);
const source="\n born({seed:SEED,by:1080,region:'ウルサス'});\n S.age=22;S.year=1102;S.mo=1;S.home='移動都市';\n S.local={...makeLocality(S.home,S.res.n),kind:'移動都市の避難・労働区画',city:null};\n S.inf=1;S.fl.dg=1;S.infection={year:1100,cause:'test',basis:'test'};\n S.cash=10000000;S.house.cash=10000000;S.job=0;\n const event=id=>EV.find(e=>e.id===id),\n  start=event('life_ursus_zelgrad_recruitment'),evac=event('life_ursus_zelgrad_evacuation'),\n  shop=event('life_ursus_zelgrad_displaced_work'),\n  shopReview=event('life_ursus_zelgrad_displaced_work_review'),\n  search=event('life_ursus_zelgrad_post_settlement_job_search'),\n  reemployment=event('life_ursus_zelgrad_post_settlement_work_review'),\n  loss=event('life_ursus_zelgrad_later_unemployment'),\n  lossReview=event('life_ursus_zelgrad_later_unemployment_review'),\n  choice=(e,c)=>ap(e.c[c].o[0][2]),\n  goal=id=>S.lifeRecord.goals.find(g=>g.id===id),\n  old='ursus-zelgrad-after-crisis',\n  first='ursus-post-settlement-reemployment',\n  second='ursus-later-reemployment',\n  aff=()=>S.lifeRecord.affiliations.find(a=>a.id==='ursus-displaced-repair-workshop');\n prepareEmploymentAppointmentFixture(start.id,2,'ursus-zelgrad-factory');choice(start,0);choice(evac,0);\n S.year=1103;S.age++;prepareEmploymentAppointmentFixture(shop.id,2,'ursus-displaced-repair-workshop');choice(shop,0);\n S.year=1105;S.age+=2;choice(shopReview,1);S.sn[shopReview.id]=1105;\n S.year=1108;S.age+=3;choice(shopReview,2);S.sn[shopReview.id]=1108;\n S.year=1109;S.age++;choice(search,0);S.sn[search.id]=1109;\n S.year=1110;S.age++;startGeneralEmploymentFixture(16,'zelgrad-first-reemployment');\n choice(reemployment,0);S.sn[reemployment.id]=1110;\n const previous={old:goal(old)?.status,first:goal(first)?.status,shop:aff()?.status,\n  firstEnded:goal(first)?.lastChangedYear};\n if(MODE==='repeat'){\n   S.year=1111;S.age++;ap({job:0});\n   const eligible=elig(loss,S,tags(S)),withoutEmployment=loss.show(S);\n   const oldGoals=[goal(old)?.status,goal(first)?.status];\n   choice(loss,0);S.sn[loss.id]=1111;\n   const secondStarted=goal(second)?.status;\n   S.year=1112;S.age++;\n   const reviewEligible=elig(lossReview,S,tags(S));\n   choice(lossReview,2);S.sn[lossReview.id]=1112;\n   const paused=goal(second)?.status;\n   S.year=1114;S.age+=2;\n   const afterCooldown=elig(lossReview,S,tags(S));choice(lossReview,1);\n   const resumed=goal(second)?.status;\n   S.year=1116;S.age+=2;startGeneralEmploymentFixture(16,'zelgrad-second-reemployment');\n   const hiredChoice=lossReview.c[0].show(S);\n   choice(lossReview,0);S.sn[lossReview.id]=1116;\n   const afterHired={\n      old:goal(old)?.status,first:goal(first)?.status,second:goal(second)?.status,\n      firstCompletion:goal(first)?.history.filter(h=>h.action==='complete').length,\n      secondCompletion:goal(second)?.history.filter(h=>h.action==='complete').length,\n      doubleLossAvailable:elig(loss,S,tags(S)),\n      newReviewAvailable:elig(lossReview,S,tags(S)),job:S.job,\n      contract:!!S.workContract,\n      audit:auditLifeState(S)\n   };\n   S.year=1118;S.age+=2;ap({job:0});\n   const afterThirdLoss={\n     old:goal(old)?.status,first:goal(first)?.status,second:goal(second)?.status,\n     contract:S.workContract,workplace:S.siteAffiliations?.workplace||null,\n     audit:auditLifeState(S)\n   };\n   return {previous,eligible,withoutEmployment,oldGoals,secondStarted,reviewEligible,\n      paused,afterCooldown,resumed,hiredChoice,afterHired,afterThirdLoss};\n }\n if(MODE==='moves'){\n   const initial={site:S.workContract?.siteId||null,\n     area:S.siteAffiliations?.workplace?.areaKey||null,region:S.res.n,\n     job:S.job,goal:goal(first)?.status,audit:auditLifeState(S)};\n   const to1=moveDestinations(S).find(x=>x.n!==S.res.n);\n   if(!to1)throw Error('First destination not found');\n   S.year=1111;S.age++;\n   ap({resTo:to1.n,resFareCovered:true});reconcileCareerPlacements(S);ensureLocalityState(S);\n   const firstMove={site:S.workContract?.siteId||null,\n     area:S.siteAffiliations?.workplace?.areaKey||null,region:S.res.n,\n     job:S.job,goal:goal(first)?.status,audit:auditLifeState(S)};\n   const to2=moveDestinations(S).find(x=>x.n!==S.res.n);\n   if(!to2)throw Error('Second destination not found');\n   S.year=1112;S.age++;\n   ap({resTo:to2.n,resFareCovered:true});reconcileCareerPlacements(S);ensureLocalityState(S);\n   const secondMove={site:S.workContract?.siteId||null,\n     area:S.siteAffiliations?.workplace?.areaKey||null,region:S.res.n,\n     job:S.job,goal:goal(first)?.status,audit:auditLifeState(S)};\n   const siteHistory=S.siteAffiliationHistory.filter(x=>x.kind==='workplace').map(x=>({\n     action:x.action,reason:x.reason,siteId:x.facilityId\n   }));\n   const contractHistory=S.workContractHistory.filter(x=>['started','ended'].includes(x.action)).map(x=>({\n     action:x.action,siteId:x.siteId\n   }));\n   S.year=1113;S.age++;ap({job:0});\n   const nowNoWork={job:S.job,site:S.siteAffiliations?.workplace||null,\n      contract:S.workContract,goal:goal(first)?.status,eligible:elig(loss,S,tags(S)),\n      audit:auditLifeState(S)};\n   choice(loss,1);\n   const afterDeferral={newGoal:goal(second)?.status,first:goal(first)?.status,\n     old:goal(old)?.status,audit:auditLifeState(S)};\n   return {previous,initial,firstMove,secondMove,siteHistory,contractHistory,\n      nowNoWork,afterDeferral};\n }\n throw Error('unknown mode');\n";

const run=(seed,mode)=>{
 ctx.SEED=seed;ctx.MODE=mode;
 return JSON.parse(vm.runInContext('JSON.stringify((()=>{'+source+'})())',ctx,{timeout:40000}));
};
const repeat=run(882201,'repeat');
assert.deepEqual([repeat.previous.old,repeat.previous.first,repeat.previous.shop],
 ['achieved','achieved','left']);
assert.equal(repeat.eligible,true);
assert.equal(repeat.withoutEmployment,true);
assert.deepEqual(repeat.oldGoals,['achieved','achieved']);
assert.equal(repeat.secondStarted,'active');
assert.equal(repeat.reviewEligible,true);
assert.equal(repeat.paused,'paused');
assert.equal(repeat.afterCooldown,true);
assert.equal(repeat.resumed,'active');
assert.equal(repeat.hiredChoice,true);
assert.deepEqual([repeat.afterHired.old,repeat.afterHired.first,repeat.afterHired.second],
 ['achieved','achieved','achieved']);
assert.deepEqual([repeat.afterHired.firstCompletion,repeat.afterHired.secondCompletion],
 [1,1]);
assert.equal(repeat.afterHired.doubleLossAvailable,false);
assert.equal(repeat.afterHired.newReviewAvailable,false);
assert.equal(repeat.afterHired.job,24);
assert.equal(repeat.afterHired.audit.length,0);
assert.deepEqual([repeat.afterThirdLoss.old,repeat.afterThirdLoss.first,repeat.afterThirdLoss.second],
 ['achieved','achieved','achieved']);
assert.equal(repeat.afterThirdLoss.contract,null);
assert.equal(repeat.afterThirdLoss.workplace,null);
assert.equal(repeat.afterThirdLoss.audit.length,0);
const moves=run(882202,'moves');
assert.deepEqual([moves.previous.old,moves.previous.first,moves.previous.shop],
 ['achieved','achieved','left']);
assert.equal(moves.initial.job,16);
assert.equal(moves.initial.goal,'achieved');
assert.equal(moves.initial.audit.length,0);
for(const state of [moves.firstMove,moves.secondMove]){
 assert.equal(state.job,16);
 assert.equal(state.goal,'achieved');
 assert.equal(state.audit.length,0);
 assert(state.site && state.area,'active job must have consistent site and contract');
}
assert.notEqual(moves.initial.region,moves.firstMove.region);
assert.notEqual(moves.firstMove.region,moves.secondMove.region);
assert.notEqual(moves.initial.site,moves.firstMove.site);
assert.notEqual(moves.firstMove.site,moves.secondMove.site);
assert(moves.siteHistory.some(x=>x.action==='ended' && x.reason==='relocation'));
assert(moves.contractHistory.filter(x=>x.action==='ended').length>=2);
assert.equal(moves.nowNoWork.job,0);
assert.equal(moves.nowNoWork.site,null);
assert.equal(moves.nowNoWork.contract,null);
assert.equal(moves.nowNoWork.goal,'achieved');
assert.equal(moves.nowNoWork.eligible,true);
assert.equal(moves.nowNoWork.audit.length,0);
assert.deepEqual([moves.afterDeferral.newGoal,moves.afterDeferral.old,moves.afterDeferral.first],
 ['paused','achieved','achieved']);
assert.equal(moves.afterDeferral.audit.length,0);
console.log('PASS: repeated unemployment leaves prior achievements intact; two relocations reconcile employers, contracts, and goals');
