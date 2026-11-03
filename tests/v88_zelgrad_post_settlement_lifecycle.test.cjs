'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const script="\nborn({seed:SEED,by:1080,region:'ウルサス'});\nS.age=22;S.year=1102;S.mo=1;S.home='移動都市';\nS.local={...makeLocality(S.home,S.res.n),kind:'移動都市の避難・労働区画',city:null};\nS.inf=1;S.fl.dg=1;S.infection={year:1100,cause:'case',basis:'test'};\nS.cash=10000000;S.house.cash=10000000;S.job=0;\nconst event=id=>EV.find(x=>x.id===id),\n factory=event('life_ursus_zelgrad_recruitment'),\n evacuation=event('life_ursus_zelgrad_evacuation'),\n work=event('life_ursus_zelgrad_displaced_work'),\n review=event('life_ursus_zelgrad_displaced_work_review'),\n displacedReview=event('life_ursus_zelgrad_displacement_review'),\n search=event('life_ursus_zelgrad_post_settlement_job_search'),\n follow=event('life_ursus_zelgrad_post_settlement_work_review'),\n status=id=>S.lifeRecord.affiliations.find(x=>x.id===id)?.status,\n goal=id=>S.lifeRecord.goals.find(x=>x.id===id)?.status,\n applyChoice=(e,c,o=0)=>ap(e.c[c].o[o][2]),\n settlementGoal='ursus-zelgrad-after-crisis',\n reemploymentGoal='ursus-post-settlement-reemployment';\napplyChoice(factory,0);applyChoice(evacuation,0);\nif(MODE==='returned'){\n S.year=1104;S.age=24;applyChoice(displacedReview,1,0);\n return {returnedText:work.t(S),impact:S.lifeRecord.regionalImpacts.at(-1)?.kind,\n  audit:auditLifeState(S)};\n}\nS.year=1103;S.age=23;applyChoice(work,0,0);\nS.year=1105;S.age=25;\nconst before=review.show(S),preText=review.t(S);\nif(MODE==='not-settled'){\n applyChoice(review,2,0);S.sn[review.id]=1105;S.year=1106;S.age++;\n return {before,preText,original:goal(settlementGoal),\n  searchEligible:elig(search,S,tags(S)),searchShown:search.show(S),audit:auditLifeState(S)};\n}\napplyChoice(review,1,0);S.sn[review.id]=1105;\nconst settled={status:goal(settlementGoal),job:S.job,\n employer:status('ursus-displaced-repair-workshop'),\n displacement:S.displacement?.status,text:review.t(S)};\nif(MODE==='voluntary'){\n S.year=1108;S.age=28;applyChoice(review,2,0);S.sn[review.id]=1108;\n S.year=1109;S.age=29;\n const unlocked=elig(search,S,tags(S));applyChoice(search,0,0);S.sn[search.id]=1109;\n const afterStart={oldGoal:goal(settlementGoal),newGoal:goal(reemploymentGoal),\n  employer:status('ursus-displaced-repair-workshop'),job:S.job};\n S.year=1110;S.age=30;\n const firstReview=elig(follow,S,tags(S));applyChoice(follow,1,0);S.sn[follow.id]=1110;\n S.year=1112;S.age=32;applyChoice(follow,2,0);S.sn[follow.id]=1112;\n const paused=goal(reemploymentGoal);\n S.year=1114;S.age=34;ap({job:24});\n const employedChoice=follow.c[0].show(S);applyChoice(follow,0,0);\n return {before,preText,settled,unlocked,afterStart,firstReview,paused,\n  employedChoice,newGoal:goal(reemploymentGoal),oldGoal:goal(settlementGoal),\n  repeat:follow.show(S),job:S.job,audit:auditLifeState(S)};\n}\nif(MODE==='moved'){\n const to=moveDestinations(S).find(x=>x.n!==S.res.n);\n if(!to)throw Error('No reachable new region');\n ap({resTo:to.n,resFareCovered:true});\n const blocked=review.show(S),movedTo=S.res.n;\n reconcileCareerPlacements(S);\n const afterMove={job:S.job,employer:status('ursus-displaced-repair-workshop'),\n  originalGoal:goal(settlementGoal),newGoal:goal(reemploymentGoal),audit:auditLifeState(S)};\n S.year=1106;S.age=26;\n const eligible=elig(search,S,tags(S));\n applyChoice(search,1,0);S.sn[search.id]=1106;\n S.year=1107;S.age=27;\n const paused=goal(reemploymentGoal),followEligible=elig(follow,S,tags(S));\n ap({job:24});applyChoice(follow,0,0);\n return {before,preText,settled,blocked,movedTo,afterMove,eligible,\n  paused,followEligible,newGoal:goal(reemploymentGoal),\n  oldGoal:goal(settlementGoal),audit:auditLifeState(S)};\n}\nthrow Error('Unknown mode');\n";
const inspect=(seed,mode)=>{ctx.SEED=seed;ctx.MODE=mode;return JSON.parse(vm.runInContext('JSON.stringify((()=>{'+script+'})())',ctx,{timeout:40000}));};

const voluntary=inspect(882101,'voluntary');
assert.equal(voluntary.before,true);
assert.match(voluntary.preText,/避難先の修理工房/);
assert.deepEqual([voluntary.settled.status,voluntary.settled.job,voluntary.settled.employer],
 ['achieved',2,'active']);
assert.match(voluntary.settled.text,/避難先の修理工房/);
assert.equal(voluntary.unlocked,true);
assert.deepEqual(voluntary.afterStart,{oldGoal:'achieved',newGoal:'active',employer:'left',job:0});
assert.equal(voluntary.firstReview,true);
assert.equal(voluntary.paused,'paused');
assert.equal(voluntary.employedChoice,true);
assert.deepEqual([voluntary.newGoal,voluntary.oldGoal,voluntary.repeat,voluntary.job],
 ['achieved','achieved',false,24]);
assert.deepEqual(voluntary.audit,[]);
const moved=inspect(882102,'moved');
assert.equal(moved.before,true);
assert.notEqual(moved.movedTo,'ウルサス');
assert.equal(moved.blocked,false,'after moving, the old workshop review is not eligible');
assert.deepEqual([moved.afterMove.job,moved.afterMove.employer,moved.afterMove.originalGoal,moved.afterMove.newGoal],
 [0,'left','achieved',undefined]);
assert.deepEqual(moved.afterMove.audit,[]);
assert.equal(moved.eligible,true,'moving and unemployment unlock the next hardship');
assert.equal(moved.paused,'paused');
assert.equal(moved.followEligible,true);
assert.deepEqual([moved.newGoal,moved.oldGoal],['achieved','achieved']);
assert.deepEqual(moved.audit,[]);
const pending=inspect(882103,'not-settled');
assert.equal(pending.before,true);
assert.equal(pending.original,'compromised');
assert.equal(pending.searchEligible,false);
assert.equal(pending.searchShown,false);
assert.deepEqual(pending.audit,[]);
const returned=inspect(882104,'returned');
assert.equal(returned.impact,'individual-return');
assert.match(returned.returnedText,/労働区画へ戻って/);
assert.deepEqual(returned.audit,[]);
console.log('PASS: completed settlement remains achieved across a new relocation, unemployment, renewed work and deferred search');
