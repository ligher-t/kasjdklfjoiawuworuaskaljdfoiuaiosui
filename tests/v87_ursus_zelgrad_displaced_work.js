'use strict';
const path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),document={currentScript:null,getElementById(){return{hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const ctx=vm.createContext({window:{},document,console,Date,setTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}}});
vm.runInContext(require('../tools/runtime.cjs').readData(root),ctx,{timeout:15000});
vm.runInContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],ctx,{timeout:15000});ctx.rd=()=>{};
require('./support/employment-appointment-fixture.cjs').installEmploymentAppointmentFixture(ctx);
const result=vm.runInContext(String.raw`(()=>{
 const event=id=>window.GAME_DATA.EV.find(row=>row.id===id),
   apply=(id,choice,outcome)=>{const e=event(id),effect=e.c[choice].o[outcome][2],
    affiliation=[effect?.lifeAffiliation,...(effect?.lifeAffiliations||[])].find(row=>row&&['join','assign'].includes(row.action||'join')),
    appointment=Number.isInteger(effect?.job)&&effect.job>0&&affiliation&&
      EMPLOYMENT_APPOINTMENT_SITES.some(spec=>spec.affiliationId===affiliation.id&&spec.jobs.includes(effect.job));
    if(appointment&&!currentPlayerEmployment(S))return applyEmploymentAppointmentFixture(id,effect.job,affiliation.id,choice,outcome);
    const prior=TRACE_RESOLUTION;TRACE_RESOLUTION={kind:'choice',id:e.id,label:e.c[choice].l};try{ap(effect)}finally{TRACE_RESOLUTION=prior}},
   factory=event('life_ursus_zelgrad_recruitment'),evac=event('life_ursus_zelgrad_evacuation'),stay=event('life_ursus_zelgrad_stay_review'),
   displacementReview=event('life_ursus_zelgrad_displacement_review'),work=event('life_ursus_zelgrad_displaced_work'),workReview=event('life_ursus_zelgrad_displaced_work_review'),
   setup=seed=>{born({seed,by:1080,region:'ウルサス'});S.age=22;S.year=1102;S.mo=1;S.res=REG.find(row=>row.n==='ウルサス');S.home='移動都市';S.local={...makeLocality(S.home,S.res.n),kind:'移動都市の避難・労働区画',city:null};S.inf=1;S.fl.dg=1;S.infection={year:1100,cause:'case setup',basis:'test'};S.job=0;S.house.cash=500000;return S},
   hiredAndEvacuated=(seed,evacChoice=0)=>{const s=setup(seed);apply(factory.id,0,0);const hired=s.lifeRecord.affiliations.find(row=>row.id==='ursus-zelgrad-factory');apply(evac.id,evacChoice,0);return{s,hired}},
   status=(s,id)=>s.lifeRecord?.affiliations?.find(row=>row.id===id)?.status,
   goal=(s,id)=>s.lifeRecord?.goals?.find(row=>row.id===id)?.status;

 const displaced=hiredAndEvacuated(874301),atEvac={job:displaced.s.job,oldStatus:status(displaced.s,'ursus-zelgrad-factory'),oldGoal:goal(displaced.s,'ursus-zelgrad-work'),goal:goal(displaced.s,'ursus-zelgrad-after-crisis'),status:displaced.s.displacement?.status,audit:auditLifeState(displaced.s)};
 displaced.s.year=1103;displaced.s.age++;
 const workVisible=work.show(displaced.s);apply(work.id,0,0);const hiredElsewhere={job:displaced.s.job,oldStatus:status(displaced.s,'ursus-zelgrad-factory'),newStatus:status(displaced.s,'ursus-displaced-repair-workshop'),newRole:displaced.s.lifeRecord.affiliations.find(row=>row.id==='ursus-displaced-repair-workshop')?.role,goal:goal(displaced.s,'ursus-zelgrad-after-crisis'),skill:displaced.s.lifeRecord.skills.find(row=>row.id==='industrial-production')?.level,audit:auditLifeState(displaced.s)};
 displaced.s.year=1105;displaced.s.age+=2;const reviewVisible=workReview.show(displaced.s);apply(workReview.id,2,0);const reviewExit={job:displaced.s.job,status:status(displaced.s,'ursus-displaced-repair-workshop'),goal:goal(displaced.s,'ursus-zelgrad-after-crisis'),audit:auditLifeState(displaced.s)};

 const noHire=hiredAndEvacuated(874302);noHire.s.year=1103;noHire.s.age++;apply(work.id,0,1);const rejected={job:noHire.s.job,oldStatus:status(noHire.s,'ursus-zelgrad-factory'),newStatus:status(noHire.s,'ursus-displaced-repair-workshop'),goal:goal(noHire.s,'ursus-zelgrad-after-crisis'),audit:auditLifeState(noHire.s)};
 const staying=hiredAndEvacuated(874303,2);staying.s.year=1103;staying.s.age++;apply(stay.id,0,0);const stayed={job:staying.s.job,status:status(staying.s,'ursus-zelgrad-factory'),goal:goal(staying.s,'ursus-zelgrad-work'),audit:auditLifeState(staying.s)};
 const delayed=hiredAndEvacuated(874304,2);delayed.s.year=1103;delayed.s.age++;apply(stay.id,1,0);const delayedEvacuation={job:delayed.s.job,status:status(delayed.s,'ursus-zelgrad-factory'),goal:goal(delayed.s,'ursus-zelgrad-work'),workVisible:work.show(delayed.s),audit:auditLifeState(delayed.s)};
 const returned=hiredAndEvacuated(874305);returned.s.year=1104;returned.s.age+=2;apply(displacementReview.id,1,0);const returnRecord={job:returned.s.job,oldStatus:status(returned.s,'ursus-zelgrad-factory'),workVisible:work.show(returned.s),audit:auditLifeState(returned.s)};
 const ordinary=setup(874306);apply(evac.id,0,0);ordinary.year=1103;ordinary.age++;const ordinaryGate=!work.show(ordinary);
 const workingElsewhere=hiredAndEvacuated(874309);
 workingElsewhere.s.year=1103;workingElsewhere.s.age++;apply(work.id,0,0);
 workingElsewhere.s.year=1104;workingElsewhere.s.age++;
 const returnEnabled=displacementReview.c[1].en(workingElsewhere.s);
 const workingBefore={job:workingElsewhere.s.job,
   status:status(workingElsewhere.s,'ursus-displaced-repair-workshop'),
   goal:goal(workingElsewhere.s,'ursus-zelgrad-after-crisis'),
   audit:auditLifeState(workingElsewhere.s)};
 apply(displacementReview.id,2,0);
 const workingAfter={job:workingElsewhere.s.job,
   status:status(workingElsewhere.s,'ursus-displaced-repair-workshop'),
   goal:goal(workingElsewhere.s,'ursus-zelgrad-after-crisis'),
   audit:auditLifeState(workingElsewhere.s)};
 const settled=hiredAndEvacuated(874310);
 settled.s.year=1103;settled.s.age++;apply(work.id,0,0);
 settled.s.year=1105;settled.s.age+=2;
 const settlementReady=workReview.show(settled.s)&&workReview.c[1].show(settled.s);
 const pendingGoal=goal(settled.s,'ursus-zelgrad-after-crisis');
 apply(workReview.id,1,0);
 const completedGoal=goal(settled.s,'ursus-zelgrad-after-crisis');
 const settledRecord={ready:settlementReady,pendingGoal,goal:completedGoal,
   displacement:settled.s.displacement?.status,job:settled.s.job,
   status:status(settled.s,'ursus-displaced-repair-workshop'),
   repeatChoice:workReview.c[1].show(settled.s),audit:auditLifeState(settled.s)};
 settled.s.year=1108;settled.s.age+=3;apply(workReview.id,2,0);
 const exitAfterSettlement={job:settled.s.job,
   affiliation:status(settled.s,'ursus-displaced-repair-workshop'),
   goal:goal(settled.s,'ursus-zelgrad-after-crisis'),audit:auditLifeState(settled.s)};
 const employed=hiredAndEvacuated(874308);employed.s.job=24;const employedGate=!work.show(employed.s),
   employedJob=employed.s.job;
 const legacy=setup(874307);apply(factory.id,0,0);legacy.job=0;legacy.displacement={status:'shelter',sinceYear:1102};const prior=TRACE_RESOLUTION;TRACE_RESOLUTION={kind:'choice',id:'legacy_setup',label:'旧セーブ状態'};try{ap({lifeGoal:{id:'ursus-zelgrad-after-crisis',title:'ゼルグラード危機後の住まいと生計を整える',priority:'生計と居場所',action:'start'}})}finally{TRACE_RESOLUTION=prior}const legacyVisible=work.show(legacy);apply(work.id,1,0);const legacyClosed={visible:legacyVisible,oldStatus:status(legacy,'ursus-zelgrad-factory'),oldGoal:goal(legacy,'ursus-zelgrad-work'),goal:goal(legacy,'ursus-zelgrad-after-crisis'),audit:auditLifeState(legacy)};
 return{atEvac,workVisible,hiredElsewhere,reviewVisible,reviewExit,rejected,stayed,delayedEvacuation,returnRecord,ordinaryGate,returnEnabled,workingBefore,workingAfter,settledRecord,exitAfterSettlement,employedGate,employedJob,legacyClosed};
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
assert.equal(result.returnEnabled,false,'an employed repair worker cannot return with a job reset and active old employer');
assert.deepEqual([result.workingBefore.job,result.workingBefore.status,result.workingAfter.job,result.workingAfter.status],[2,'active',2,'active']);
assert.equal(result.workingAfter.audit.length,0);
assert.deepEqual([result.settledRecord.ready,result.settledRecord.pendingGoal,result.settledRecord.goal,result.settledRecord.displacement,result.settledRecord.job,result.settledRecord.status,result.settledRecord.repeatChoice],[true,'compromised','achieved','rebuilt',2,'active',false]);
assert.equal(result.settledRecord.audit.length,0);
assert.deepEqual([result.exitAfterSettlement.job,result.exitAfterSettlement.affiliation,result.exitAfterSettlement.goal],[0,'left','achieved'],'a later job exit preserves the achieved housing-and-livelihood milestone');
assert.equal(result.exitAfterSettlement.audit.length,0);
assert(result.employedGate&&result.employedJob===24,'a displaced worker who already has another occupation cannot have it replaced silently');
assert.deepEqual([result.legacyClosed.visible,result.legacyClosed.oldStatus,result.legacyClosed.oldGoal,result.legacyClosed.goal],[true,'left','compromised','paused']);
assert.equal(result.legacyClosed.audit.length,0,'a legacy active affiliation can be closed through the post-evacuation event: '+result.legacyClosed.audit.join('; '));
console.log(JSON.stringify({passed:true,scope:'Zelgrad employment closure, evacuation/return, skill transfer, hiring outcome and two-year follow-up',audits:8,legacyRecordEligible:true,limitations:'One worker and one game-assumed repair workshop; no claim about Zelgrad-wide employment or factory reopening'},null,2));
