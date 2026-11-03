'use strict';
const path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),document={currentScript:null,getElementById(){return{hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const ctx={window:{},document,console,Date,setTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),ctx,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],ctx,{timeout:15000});ctx.rd=()=>{};
const result=vm.runInNewContext(String.raw`(()=>{
 const event=id=>window.GAME_DATA.EV.find(row=>row.id===id),
   apply=(id,choice,outcome)=>{const e=event(id),prior=TRACE_RESOLUTION;TRACE_RESOLUTION={kind:'choice',id:e.id,label:e.c[choice].l};try{ap(e.c[choice].o[outcome][2])}finally{TRACE_RESOLUTION=prior}},
   factory=event('life_ursus_zelgrad_recruitment'),evac=event('life_ursus_zelgrad_evacuation'),stay=event('life_ursus_zelgrad_stay_review'),
   displacementReview=event('life_ursus_zelgrad_displacement_review'),work=event('life_ursus_zelgrad_displaced_work'),workReview=event('life_ursus_zelgrad_displaced_work_review'),
   setup=seed=>{born({seed,by:1080,region:'ウルサス'});S.age=22;S.year=1102;S.mo=1;S.res=REG.find(row=>row.n==='ウルサス');S.home='移動都市';S.local={...makeLocality(S.home,S.res.n),kind:'移動都市の避難・労働区画',city:null};S.inf=1;S.fl.dg=1;S.infection={year:1100,cause:'case setup',basis:'test'};S.job=0;S.house.cash=500000;return S},
   hiredAndEvacuated=(seed,evacChoice=0)=>{const s=setup(seed);apply(factory.id,0,0);const hired=s.lifeRecord.affiliations.find(row=>row.id==='ursus-zelgrad-factory');apply(evac.id,evacChoice,0);return{s,hired}},
   status=(s,id)=>s.lifeRecord?.affiliations?.find(row=>row.id===id)?.status,
   goal=(s,id)=>s.lifeRecord?.goals?.find(row=>row.id===id)?.status;

 const displaced=hiredAndEvacuated(874301),atEvac={job:displaced.s.job,oldStatus:status(displaced.s,'ursus-zelgrad-factory'),oldGoal:goal(displaced.s,'ursus-zelgrad-work'),goal:goal(displaced.s,'ursus-zelgrad-after-crisis'),status:displaced.s.displacement?.status,audit:auditLifeState(displaced.s)};
 displaced.s.year=1103;displaced.s.age++;
 const workVisible=work.show(displaced.s);apply(work.id,0,0);const hiredElsewhere={job:displaced.s.job,oldStatus:status(displaced.s,'ursus-zelgrad-factory'),newStatus:status(displaced.s,'ursus-displaced-repair-workshop'),newRole:displaced.s.lifeRecord.affiliations.find(row=>row.id==='ursus-displaced-repair-workshop')?.role,goal:goal(displaced.s,'ursus-zelgrad-after-crisis'),skill:displaced.s.lifeRecord.skills.find(row=>row.id==='industrial-production')?.level,audit:auditLifeState(displaced.s)};
 displaced.s.year=1105;displaced.s.age+=2;const reviewVisible=workReview.show(displaced.s);apply(workReview.id,1,0);const reviewExit={job:displaced.s.job,status:status(displaced.s,'ursus-displaced-repair-workshop'),goal:goal(displaced.s,'ursus-zelgrad-after-crisis'),audit:auditLifeState(displaced.s)};

 const noHire=hiredAndEvacuated(874302);noHire.s.year=1103;noHire.s.age++;apply(work.id,0,1);const rejected={job:noHire.s.job,oldStatus:status(noHire.s,'ursus-zelgrad-factory'),newStatus:status(noHire.s,'ursus-displaced-repair-workshop'),goal:goal(noHire.s,'ursus-zelgrad-after-crisis'),audit:auditLifeState(noHire.s)};
 const staying=hiredAndEvacuated(874303,2);staying.s.year=1103;staying.s.age++;apply(stay.id,0,0);const stayed={job:staying.s.job,status:status(staying.s,'ursus-zelgrad-factory'),goal:goal(staying.s,'ursus-zelgrad-work'),audit:auditLifeState(staying.s)};
 const delayed=hiredAndEvacuated(874304,2);delayed.s.year=1103;delayed.s.age++;apply(stay.id,1,0);const delayedEvacuation={job:delayed.s.job,status:status(delayed.s,'ursus-zelgrad-factory'),goal:goal(delayed.s,'ursus-zelgrad-work'),workVisible:work.show(delayed.s),audit:auditLifeState(delayed.s)};
 const returned=hiredAndEvacuated(874305);returned.s.year=1104;returned.s.age+=2;apply(displacementReview.id,1,0);const returnRecord={job:returned.s.job,oldStatus:status(returned.s,'ursus-zelgrad-factory'),workVisible:work.show(returned.s),audit:auditLifeState(returned.s)};
 const ordinary=setup(874306);apply(evac.id,0,0);ordinary.year=1103;ordinary.age++;const ordinaryGate=!work.show(ordinary);
 const employed=hiredAndEvacuated(874308);employed.s.job=24;const employedGate=!work.show(employed.s),
   employedJob=employed.s.job;
 const legacy=setup(874307);apply(factory.id,0,0);legacy.job=0;legacy.displacement={status:'shelter',sinceYear:1102};const prior=TRACE_RESOLUTION;TRACE_RESOLUTION={kind:'choice',id:'legacy_setup',label:'旧セーブ状態'};try{ap({lifeGoal:{id:'ursus-zelgrad-after-crisis',title:'ゼルグラード危機後の住まいと生計を整える',priority:'生計と居場所',action:'start'}})}finally{TRACE_RESOLUTION=prior}const legacyVisible=work.show(legacy);apply(work.id,1,0);const legacyClosed={visible:legacyVisible,oldStatus:status(legacy,'ursus-zelgrad-factory'),oldGoal:goal(legacy,'ursus-zelgrad-work'),goal:goal(legacy,'ursus-zelgrad-after-crisis'),audit:auditLifeState(legacy)};
 return{atEvac,workVisible,hiredElsewhere,reviewVisible,reviewExit,rejected,stayed,delayedEvacuation,returnRecord,ordinaryGate,employedGate,employedJob,legacyClosed};
})()`,ctx,{timeout:45000});
assert.deepEqual([result.atEvac.job,result.atEvac.oldStatus,result.atEvac.oldGoal,result.atEvac.goal,result.atEvac.status],[0,'left','compromised','active','shelter']);
assert.equal(result.atEvac.audit.length,0,'factory employment closes cleanly on evacuation: '+result.atEvac.audit.join('; '));
assert(result.workVisible,'a displaced worker with a recorded factory skill can encounter post-evacuation work');
assert.deepEqual([result.hiredElsewhere.job,result.hiredElsewhere.oldStatus,result.hiredElsewhere.newStatus,result.hiredElsewhere.goal,result.hiredElsewhere.skill],[2,'left','active','compromised',2]);
assert.equal(result.hiredElsewhere.newRole,'部品の仕分け・製造補助');
assert.equal(result.hiredElsewhere.audit.length,0,'transferring factory skills to an individual job passes the audit: '+result.hiredElsewhere.audit.join('; '));
assert(result.reviewVisible,'the new individual employment receives a two-year review');
assert.deepEqual([result.reviewExit.job,result.reviewExit.status,result.reviewExit.goal],[0,'left','compromised']);
assert.equal(result.reviewExit.audit.length,0,'leaving the second job passes the audit: '+result.reviewExit.audit.join('; '));
assert.deepEqual([result.rejected.job,result.rejected.oldStatus,result.rejected.newStatus,result.rejected.goal],[0,'left',undefined,'paused']);
assert.equal(result.rejected.audit.length,0,'a failed application leaves no fabricated employer: '+result.rejected.audit.join('; '));
assert.deepEqual([result.stayed.job,result.stayed.status,result.stayed.goal],[2,'active','active']);
assert.equal(result.stayed.audit.length,0,'remaining in Zelgrad preserves an active job record: '+result.stayed.audit.join('; '));
assert.deepEqual([result.delayedEvacuation.job,result.delayedEvacuation.status,result.delayedEvacuation.goal,result.delayedEvacuation.workVisible],[0,'left','compromised',true]);
assert.equal(result.delayedEvacuation.audit.length,0,'delayed evacuation closes the same employer and unlocks its aftermath: '+result.delayedEvacuation.audit.join('; '));
assert.deepEqual([result.returnRecord.job,result.returnRecord.oldStatus,result.returnRecord.workVisible],[0,'left',true]);
assert.equal(result.returnRecord.audit.length,0,'individual return does not restore the old employment automatically: '+result.returnRecord.audit.join('; '));
assert(result.ordinaryGate,'a displaced person without factory affiliation and skill does not enter this route');
assert(result.employedGate&&result.employedJob===24,'a displaced worker who already has another occupation cannot have it replaced silently');
assert.deepEqual([result.legacyClosed.visible,result.legacyClosed.oldStatus,result.legacyClosed.oldGoal,result.legacyClosed.goal],[true,'left','compromised','paused']);
assert.equal(result.legacyClosed.audit.length,0,'a legacy active affiliation can be closed through the post-evacuation event: '+result.legacyClosed.audit.join('; '));
console.log(JSON.stringify({passed:true,scope:'Zelgrad employment closure, evacuation/return, skill transfer, hiring outcome and two-year follow-up',audits:8,legacyRecordEligible:true,limitations:'One worker and one game-assumed repair workshop; no claim about Zelgrad-wide employment or factory reopening'},null,2));
