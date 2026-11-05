'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),document={currentScript:null,getElementById(){return{hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const ctx={window:{},document,console,Date,setTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),ctx,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],ctx,{timeout:15000});ctx.rd=()=>{};
const rows=vm.runInNewContext(String.raw`(()=>{
 const event=id=>window.GAME_DATA.EV.find(row=>row.id===id),apply=(id,choice,outcome=0)=>{const e=event(id),previous=TRACE_RESOLUTION;TRACE_RESOLUTION={kind:'choice',id:e.id,label:e.c[choice].l};try{ap(e.c[choice].o[outcome][2])}finally{TRACE_RESOLUTION=previous}};
 const setup=seed=>{born({seed,by:1080,region:'サルゴン'});S.age=18;S.year=1098;S.mo=3;S.res=REG.find(row=>row.n==='サルゴン');S.home='固定集落';S.local={...makeLocality(S.home,S.res.n),ecology:'乾燥地・オアシス'};S.job=0;S.house.cash=300000;return S};
 const career=event('car'),follow=event('sargon_market_contract_review'),eligible=setup(981001);
 const entryIndex=career.c.findIndex(row=>row.l==='移動バザール周辺で短い警戒任務を探す'),visible=career.c[entryIndex].show(eligible);
 apply('car',entryIndex,0);const initialJob=eligible.job;const affiliation=eligible.lifeRecord.affiliations.find(row=>row.id==='sargon-market-guard-contracts'),goal=eligible.lifeRecord.goals.find(row=>row.id==='sargon-market-guard-work');
 const oneYearHidden=(eligible.year++,eligible.age++,!follow.show(eligible));eligible.year++;eligible.age++;const twoYearVisible=follow.show(eligible);apply(follow.id,0,0);
 const repeat={status:affiliation.status,episodes:affiliation.episodes.map(row=>[row.startedYear,row.endedYear]),goal:eligible.lifeRecord.goals.find(row=>row.id==='sargon-market-guard-work')?.status,job:eligible.job,audit:auditLifeState(eligible)};
 const failedIntro=setup(981002);apply('car',entryIndex,1);const failedEntry={hasAffiliation:failedIntro.lifeRecord.affiliations.some(row=>row.id==='sargon-market-guard-contracts'),followHidden:!follow.show(failedIntro),audit:auditLifeState(failedIntro)};
 const followFailure=setup(981003);apply('car',entryIndex,0);followFailure.year+=2;followFailure.age+=2;apply(follow.id,0,1);
 const paused={status:followFailure.lifeRecord.goals.find(row=>row.id==='sargon-market-guard-work')?.status,episodes:followFailure.lifeRecord.affiliations.find(row=>row.id==='sargon-market-guard-contracts')?.episodes.length,audit:auditLifeState(followFailure)};
 const transport=setup(981004);apply('car',entryIndex,0);transport.year+=2;transport.age+=2;
 ensureOccupationWorkArea(transport);
 if(!employmentOpeningForChoice(transport,16)){
   const areaId=occupationWorkAreaKey(transport),w=transport.world.occupationWorld,
     employerId='test-sargon-transport',siteId='test-sargon-transport-site',
     positionId='test-sargon-transport-position',openingId='test-sargon-transport-opening';
   w.employers[employerId]={employerId,organizationKey:null,areaId};
   w.sites[siteId]={siteId,employerId,areaId,status:'open',positionIds:[positionId]};
   w.areas[areaId].siteIds.push(siteId);
   w.positions[positionId]={positionId,siteId,jobId:16,capacity:1,
     aggregateOccupiedSlots:0,identifiedOccupiedSlots:0,reservedSlots:0,
     vacancyCount:1,openingIds:[openingId]};
   w.openings[openingId]={openingId,positionId,siteId,employerId,areaId,
     status:'open',slots:1,validFromYear:transport.year};
 }
 const transportOffer=follow.c[1].show(transport);
 apply(follow.id,1);
 const moved={job:transport.job,goal:transport.lifeRecord.goals.find(row=>row.id==='sargon-market-guard-work')?.status,
   basis:transport.workContract?.basis,episodeId:transport.employmentState?.activeEpisodeId,
   audit:auditLifeState(transport)};
 const stopped=setup(981005);apply('car',entryIndex,0);stopped.year+=2;stopped.age+=2;apply(follow.id,2);
 const exit={job:stopped.job,goal:stopped.lifeRecord.goals.find(row=>row.id==='sargon-market-guard-work')?.status,audit:auditLifeState(stopped)};
 const concurrentWork=setup(981008);concurrentWork.job=2;
 apply('car',entryIndex,0);
 const sideGig={job:concurrentWork.job,
   kind:concurrentWork.employmentState?.episodes?.at(-1)?.kind,
   employerId:concurrentWork.employmentState?.episodes?.at(-1)?.employerId,
   ongoingEmployment:concurrentWork.employmentState?.activeEpisodeId??null};
 const ongoingGuard=setup(981009);ongoingGuard.job=2;
 apply('car',entryIndex,0);ongoingGuard.year+=2;ongoingGuard.age+=2;
 apply(follow.id,0,0);
 const ongoingGuardResult={
   job:ongoingGuard.job,
   gigCount:ongoingGuard.employmentState.episodes.filter(x=>x.kind==='gig').length,
   guardAffiliation:ongoingGuard.lifeRecord.affiliations
     .find(x=>x.id==='sargon-market-guard-contracts')?.status
 };
 const deniedGuard=setup(981010);deniedGuard.job=2;
 apply('car',entryIndex,0);deniedGuard.year+=2;deniedGuard.age+=2;
 apply(follow.id,0,1);
 const deniedGuardJob=deniedGuard.job;
 const retiredGuard=setup(981011);retiredGuard.job=2;
 apply('car',entryIndex,0);retiredGuard.year+=2;retiredGuard.age+=2;
 apply(follow.id,2);
 const retiredGuardJob=retiredGuard.job;
 const regionGate=setup(981006);apply('car',entryIndex,0);regionGate.year+=2;regionGate.age+=2;regionGate.res=REG.find(row=>row.n==='龍門');const outsideRegionHidden=!follow.show(regionGate);
 const ecologyGate=setup(981007);apply('car',entryIndex,0);ecologyGate.year+=2;ecologyGate.age+=2;ecologyGate.local.ecology='熱帯雨林';const outsideEcologyHidden=!follow.show(ecologyGate);
 return {careerChoices:career.c.length,entryIndex,visible,initialJob,followChoices:follow.c.length,oneYearHidden,twoYearVisible,goalAtStart:goal?.status,repeat,failedEntry,paused,moved,exit,sideGig,ongoingGuardResult,deniedGuardJob,retiredGuardJob,transportOffer,outsideRegionHidden,outsideEcologyHidden};
})()`,ctx,{timeout:45000});
assert(rows.visible,'the contract work is limited to Sargonian desert/oasis lives: '+JSON.stringify({entryIndex:rows.entryIndex,visible:rows.visible}));
assert.equal(rows.followChoices,3);assert(rows.oneYearHidden&&rows.twoYearVisible,'the reflection waits until two years after an accepted contract');
assert.equal(rows.initialJob,0,'the first one-off hire ends before the next decision');assert.equal(rows.goalAtStart,'active');assert.equal(rows.repeat.status,'left');assert.equal(rows.repeat.episodes.length,2,'each accepted job is a bounded individual assignment, not continuous unit membership');assert.equal(rows.repeat.goal,'active');assert.equal(rows.repeat.job,0,'a completed short contract must leave no active mercenary occupation');assert.equal(rows.repeat.audit.length,0);
assert.deepEqual([rows.failedEntry.hasAffiliation,rows.failedEntry.followHidden,rows.failedEntry.audit.length],[false,true,0],'a failed introduction creates no employment history or follow-up');
assert.deepEqual([rows.paused.status,rows.paused.episodes,rows.paused.audit.length],['paused',1,0]);
assert.equal(rows.transportOffer,true,'transport work is offered only when a real vacancy is available');
assert.equal(rows.moved.basis,'occupation-episode');
assert(rows.moved.episodeId,'transport work creates an individual paid work episode');
assert.deepEqual([rows.moved.job,rows.moved.goal,rows.moved.audit.length],[16,'compromised',0]);
assert.deepEqual([rows.exit.job,rows.exit.goal,rows.exit.audit.length],[0,'abandoned',0]);
assert.equal(rows.sideGig.job,2,'short guard duty does not displace another occupation');
assert.equal(rows.sideGig.kind,'gig');
assert.equal(rows.sideGig.employerId,null);
assert.equal(rows.sideGig.ongoingEmployment,null);
assert.equal(rows.ongoingGuardResult.job,2,'a follow-up guard shift preserves independent work');
assert.equal(rows.ongoingGuardResult.gigCount,2,'both individual assignments are recorded once');
assert.equal(rows.ongoingGuardResult.guardAffiliation,'left');
assert.equal(rows.deniedGuardJob,2,'rejected guard work preserves the unrelated current job');
assert.equal(rows.retiredGuardJob,2,'declining more guard work preserves an unrelated current job');
assert(rows.outsideRegionHidden&&rows.outsideEcologyHidden,'later choices stay within the modeled Sargonian local context');
console.log(JSON.stringify({passed:true,individualContractsOnly:true,twoYearFollowup:true,failedAndDeclinedRoutesDoNotInventMembership:true,regionAndEcologyGates:true,auditErrors:0},null,2));
