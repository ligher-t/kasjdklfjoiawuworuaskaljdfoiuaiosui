'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const document={currentScript:null,getElementById(){return {hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const ctx={window:{},document,console,Date,setTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),ctx,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],ctx,{timeout:15000});ctx.rd=()=>{};
const D=ctx.window.GAME_DATA,event=id=>D.EV.find(row=>row.id===id);
for(const row of D.EV.filter(row=>/^(?:ori_rhodes|life_rhodes|sr_rhodes)_/.test(row.id)&&row.id!=='life_rhodes_research_pause_review'))assert.equal(row.ge?.year,1095,`${row.id} is unavailable before the first full year after reorganization`);
const pausedReview=event('life_rhodes_research_pause_review');
assert(pausedReview&&pausedReview.c.length===3);
const researchReview=event('life_rhodes_research_review'),researchLegacy=event('life_rhodes_research_legacy');
const activeResearch={id:'rhodes-research',title:'ロドスの鉱石病経過研究',kind:'medical-research-support',status:'active',role:'匿名化記録の補助',startedYear:1098,endedYear:null,lastChangedYear:1098,episodes:[{startedYear:1098,endedYear:null,roleAtStart:'匿名化記録の補助',returning:false,basis:'recorded'}],history:[]};
const earlyResearchState={year:1099,age:30,lifeRecord:{version:4,goals:[],skills:[],affiliations:[activeResearch]}};
assert.equal(researchReview.show(earlyResearchState),false,'research review cannot claim several years after a one-year tenure');
earlyResearchState.year=1100;
assert.equal(researchReview.show(earlyResearchState),true,'research review opens after two recorded years');
assert.equal(researchReview.show({...earlyResearchState,lifeRecord:{...earlyResearchState.lifeRecord,affiliations:[{...activeResearch,status:'suspended'}]}}),false,'suspended research uses its own delayed review');
assert.equal(researchReview.show({...earlyResearchState,lifeRecord:{...earlyResearchState.lifeRecord,affiliations:[{...activeResearch,startedYear:null,episodes:[]}]}}),false,'legacy research without a recorded start year is not assigned an invented tenure');
const endedResearch={...activeResearch,status:'left',endedYear:1101,episodes:[{...activeResearch.episodes[0],endedYear:1101}]};
const legacyResearchState={year:1102,age:32,lifeRecord:{version:4,goals:[],skills:[],affiliations:[endedResearch]}};
assert.equal(researchLegacy.show(legacyResearchState),false,'research legacy event waits after a recent departure');
legacyResearchState.year=1103;
assert.equal(researchLegacy.show(legacyResearchState),true,'research legacy event opens after two years away');
assert.equal(researchLegacy.show({...legacyResearchState,lifeRecord:{...legacyResearchState.lifeRecord,affiliations:[{...endedResearch,status:'active'}]}}),false,'rejoining research hides the departure follow-up');
const affiliation={id:'rhodes-research',title:'ロドスの鉱石病経過研究',kind:'medical-research-support',status:'suspended',role:'匿名化記録の補助',startedYear:1098,endedYear:null,lastChangedYear:1100,episodes:[{startedYear:1098,endedYear:null,roleAtStart:'匿名化記録の補助',returning:false,basis:'recorded'}],history:[]};
const state={year:1104,age:30,lifeRecord:{version:4,goals:[],skills:[],affiliations:[affiliation]}};
ctx.__state=state;
assert.equal(pausedReview.show(state),false,'review must wait five years after a status change');
state.year=1105;
assert.equal(pausedReview.show(state),true,'a suspended research path must receive a later review');
vm.runInNewContext('S=__state; applyLifeAffiliation({id:"rhodes-research",action:"review",note:"次の確認時期を記録"});',ctx);
assert.equal(state.lifeRecord.affiliations[0].status,'suspended');
assert.equal(state.lifeRecord.affiliations[0].lastChangedYear,1105);
assert.equal(state.lifeRecord.affiliations[0].history.at(-1).action,'review');
assert.equal(state.lifeRecord.affiliations[0].episodes.length,1,'review must not create a new work episode');
state.year=1110;
assert.equal(pausedReview.show(state),true,'a continued pause must become reviewable again');
vm.runInNewContext('S=__state; applyLifeAffiliation({id:"rhodes-research",action:"return",role:"短時間の記録補助"});',ctx);
assert.equal(state.lifeRecord.affiliations[0].status,'active');
assert.equal(state.lifeRecord.affiliations[0].episodes.length,1,'resuming the same research period must not invent a new episode');
assert.equal(state.lifeRecord.affiliations[0].episodes[0].endedYear,null);
assert.equal(pausedReview.show(state),false,'resumed research must leave the suspended-only event');
const exitingState={year:1110,age:35,lifeRecord:{version:4,goals:[],skills:[],affiliations:[{...affiliation,status:'suspended',lastChangedYear:1105,episodes:[{...affiliation.episodes[0]}],history:[]}]}};
ctx.__state=exitingState;
vm.runInNewContext('S=__state; applyLifeAffiliation({id:"rhodes-research",action:"leave",note:"研究協力を正式終了"});',ctx);
assert.equal(exitingState.lifeRecord.affiliations[0].status,'left');
assert.equal(exitingState.lifeRecord.affiliations[0].episodes[0].endedYear,1110,'leaving a paused path must close its original episode');
const roleReview=event('life_rhodes_role_review');
const careExit=roleReview.c.find(c=>c.l.includes('療養相談の連絡を終え'));
const jobExit=roleReview.c.find(c=>c.l.includes('勤務を終えて'));
assert.equal(JSON.stringify(careExit.show.need),JSON.stringify(['ロドスと継続連絡中']),'care exit must require an existing care relationship');
assert.equal(JSON.stringify(jobExit.show.need),JSON.stringify(['ロドス職員として活動中']),'employment exit must require active staff membership');

const rhodesEvents=D.EV.filter(row=>row.id.startsWith('sr_rhodes_'));
assert(rhodesEvents.length>=10,'Rhodes route should include ongoing role, posting, and colleague events');
assert(rhodesEvents.every(row=>Number.isInteger(row.ge?.year)&&row.ge.year>=1094),`Rhodes Pharmaceutical Company events must not predate reorganization: ${JSON.stringify(rhodesEvents.filter(row=>!Number.isInteger(row.ge?.year)||row.ge.year<1094).map(row=>({id:row.id,ge:row.ge})))}`);
for(const id of ['wld_rhodes','ori_rhodes_examination_contact','life_rhodes_referral','life_rhodes_referral_response','life_rhodes_role_review']){
  const row=event(id);
  if(row) assert(row.ge&&row.ge.year>=1094,`${id} must be gated to the post-Babel Rhodes organization`);
}

const arenaJob=D.J.findIndex(row=>row.n==='カジミエーシュの競技会場運営職員');
const transporterJob=D.J.findIndex(row=>row.n==='ロドスのトランスポーター');
const reserveJob=D.J.findIndex(row=>row.n==='ロドス行動予備隊員');
assert.equal(arenaJob,32,'existing Kazimierz career job keeps its established job index');
assert.equal(transporterJob,33,'transporter job is appended after the existing arena job');
assert.equal(reserveJob,34,'reserve-team job is appended after the transporter job');

const routeEvent=id=>event(id);
const rhodesAffiliation=(role='')=>({id:'rhodes-staff',title:'ロドス・アイランド',kind:'employer',status:'active',role,startedYear:1094,endedYear:null,lastChangedYear:1094,episodes:[{startedYear:1094,endedYear:null,roleAtStart:role,returning:false,basis:'recorded'}],history:[]});
const researchStall=event('life_rhodes_research_stall');
const makeResearchStallState=staffStatus=>{
 ctx.__staffStatus=staffStatus;
 return vm.runInNewContext(`(()=>{
  born({seed:871061,by:1070,region:'クルビア'});S.year=1102;S.age=32;S.res=REG.find(row=>row.n==='クルビア');S.job=30;
  applyLifeAffiliation({id:'rhodes-staff',title:'ロドス・アイランド',action:'join',role:'本艦・船内居住／職務:物資記録'});
  applyLifeAffiliation({id:'rhodes-research',title:'ロドスの鉱石病経過研究',action:'join',role:'匿名化記録の補助'});
  applyLifeGoal({id:'oripathy-research',title:'患者の同意を守りながら研究を続ける',action:'start'});
  if(__staffStatus==='suspended'){
   applyLifeAffiliation({id:'rhodes-staff',action:'suspend',note:'研究中に勤務を休止'});S.job=0;
  }
  if(__staffStatus==='left'){
   applyLifeAffiliation({id:'rhodes-staff',action:'leave',note:'研究中に勤務を終了'});S.job=0;
  }
  if(__staffStatus==='contacted'){
   applyLifeAffiliation({id:'rhodes-staff',action:'leave',note:'研究中に勤務を終了'});
   applyLifeAffiliation({id:'rhodes-staff',action:'contact',note:'別部署の採用照会'});S.job=0;
  }
  return S;
 })()`,ctx,{timeout:30000});
};
for(const [staffStatus,expectedAction,expectedStaffStatus,expectedJob] of [['active','role','active',28],['suspended','leave','left',0],['left',null,'left',0],['contacted',null,'contacted',0]]){
 const researchState=makeResearchStallState(staffStatus);ctx.__state=researchState;
 const visibleExitChoices=researchStall.c.filter(choice=>{
  ctx.__choice=choice;
  return vm.runInNewContext('ok(__choice.show,__state,tags(__state))',ctx,{timeout:30000});
 }).filter(choice=>choice.l.includes('研究')&&choice.l.includes('離れ'));
 assert.equal(visibleExitChoices.length,1,`${staffStatus} staff sees exactly one valid research exit`);
 const exitChoice=visibleExitChoices[0],effect=exitChoice.o[0][2];
 const staffEffect=[effect.lifeAffiliation,...(effect.lifeAffiliations||[])].find(row=>row?.id==='rhodes-staff');
 assert.equal(staffEffect?.action??null,expectedAction,`${staffStatus} staff uses a valid employment transition`);
 ctx.__effect=effect;
 vm.runInNewContext('S=__state;ap(__effect)',ctx,{timeout:30000});
 const research=researchState.lifeRecord.affiliations.find(row=>row.id==='rhodes-research');
 const staff=researchState.lifeRecord.affiliations.find(row=>row.id==='rhodes-staff');
 assert.equal(research.status,'left',`${staffStatus} path closes the research affiliation`);
 assert.equal(staff.status,expectedStaffStatus,`${staffStatus} path records the chosen employment transition`);
 assert.equal(researchState.job,expectedJob,`${staffStatus} path keeps the occupation aligned with the employment choice`);
 if(staffStatus==='active')assert.match(staff.role,/本艦・船内居住／職務:患者支援・物資補助/,'an active employee changes duty without losing the current posting');
 assert.deepEqual(Array.from(vm.runInNewContext('auditLifeState(__state)',Object.assign(ctx,{__state:researchState}))),[],`${staffStatus} research exit leaves an auditable state`);
}
const staffState={year:1100,age:24,by:1076,job:transporterJob,res:{n:'クルビア'},lifeRecord:{version:4,goals:[],skills:[],affiliations:[rhodesAffiliation()]}};
assert.equal(routeEvent('sr_rhodes_posting_review').show(staffState),true,'new staff member receives a first posting decision');
staffState.lifeRecord.affiliations[0].role='本艦・船内居住';
assert.equal(routeEvent('sr_rhodes_posting_review').show(staffState),false,'posting decision stops after a location is recorded');
assert.equal(routeEvent('sr_rhodes_ship_routine').show(staffState),true,'ship resident receives shipboard routine events');
assert.equal(routeEvent('sr_rhodes_branch_routine').show(staffState),false,'ship resident does not receive branch routine events');
assert.equal(routeEvent('sr_rhodes_posting_transfer').show(staffState),true,'established ship resident can later seek a regional posting');
assert.equal(routeEvent('sr_rhodes_transport_dispatch').show(staffState),true,'transporter receives route-specific assignments');
assert.equal(routeEvent('sr_rhodes_reserve_drill').show({...staffState,job:reserveJob}),true,'reserve member receives reserve-team drills');
assert.equal(routeEvent('sr_rhodes_field_assignment').show({...staffState,job:31}),true,'field operator receives recurring field assignments');
staffState.lifeRecord.affiliations[0].role='地域支部・地上拠点勤務';
assert.equal(routeEvent('sr_rhodes_branch_routine').show(staffState),true,'regional staff member receives branch routines');
assert.equal(routeEvent('sr_rhodes_branch_transfer').show(staffState),true,'established regional staff member can later request a ship posting');
assert.equal(routeEvent('sr_rhodes_ship_routine').show(staffState),false,'regional staff member does not receive shipboard residence events');

staffState.lifeRecord.affiliations[0].role='本艦・船内居住';
ctx.__state=staffState;
vm.runInNewContext('S=__state; applyLifeAffiliation({id:"rhodes-staff",action:"role",role:"短時間勤務・引継ぎ",preserveRhodesPost:true});',ctx);
assert.equal(staffState.lifeRecord.affiliations[0].role,'本艦・船内居住／職務:短時間勤務・引継ぎ','role change preserves the recorded posting');
assert.equal(routeEvent('sr_rhodes_ship_routine').show(staffState),true,'ship routine remains available after a duty change');

ctx.__state=staffState;
vm.runInNewContext('recordPersonTieAction(__state,{kind:"rhodes",action:"introduced"})',ctx);
assert.equal(staffState.personTies.rhodesColleagues.length,1,'first coworker relationship is stored as a person tie');
const firstColleague=staffState.personTies.rhodesColleagues[0];
assert.equal(firstColleague.actualStatus,'working');
assert(staffState.personTies.links[firstColleague.id],'coworker has a corresponding interaction record');
assert(vm.runInNewContext('personTieSummary(__state)',ctx).includes('同じ配属先の職員'),'coworker appears in the relationship summary');
ctx.__state.year=1101;
vm.runInNewContext('S=__state; applyLifeAffiliation({id:"rhodes-staff",action:"leave",note:"勤務終了"});',ctx);
assert.equal(firstColleague.actualStatus,'former','leaving Rhodes marks the established coworker as former');
assert.equal(routeEvent('sr_rhodes_colleague_introduction').show(staffState),false,'former coworker cannot receive active-work followups');
ctx.__state.year=1104;
vm.runInNewContext('S=__state; applyLifeAffiliation({id:"rhodes-staff",action:"return",role:"本艦・船内居住"});',ctx);
assert.equal(routeEvent('sr_rhodes_colleague_introduction').show(staffState),true,'returning staff member can establish a new current coworker tie');
vm.runInNewContext('recordPersonTieAction(__state,{kind:"rhodes",action:"introduced"})',ctx);
assert.equal(staffState.personTies.rhodesColleagues.length,2,'rejoining Rhodes preserves past colleagues and creates a new current tie');
assert.notEqual(staffState.personTies.rhodesColleagues[0].id,staffState.personTies.rhodesColleagues[1].id);

const legacyPerson={id:'rhodes-colleague:legacy',kind:'rhodes',nm:'同じ配属先の職員',role:'同じ配属先の職員',metYear:1098,actualStatus:'working'};
const legacyTieState={year:1100,personTies:{version:1,links:{[legacyPerson.id]:{personId:legacyPerson.id,metYear:1098,lastInteractionYear:1098,standing:50,relationship:'unresolved',history:[],basis:'from-current-contact-no-retrospective-inference'}},history:[],rhodesColleague:legacyPerson}};
vm.runInNewContext('recordPersonTieAction(__state,{kind:"rhodes",action:"shared-work"})',Object.assign(ctx,{__state:legacyTieState}));
assert.equal(legacyTieState.personTies.rhodesColleagues.length,1,'legacy single-coworker saves migrate without losing their relationship');
assert.equal(legacyTieState.personTies.rhodesColleagues[0].id,legacyPerson.id);

const reducedState=vm.runInNewContext('(()=>{born({seed:871055,by:1048,region:"ヴィクトリア"});S.age=52;S.year=1100;return S;})()',ctx);
const reducedFollowup=event('old_followup');
vm.runInNewContext('applyResidenceEffects({fl:{reduced_work:1}},0,S,S.res.n,{},()=>{});',ctx);
assert.equal(reducedState.reducedWorkStartedYear,1100,'starting reduced work records its start year');
assert.equal(reducedFollowup.show(reducedState),false,'senior work review does not appear in the start year');
reducedState.year=1101;
assert.equal(reducedFollowup.show(reducedState),false,'senior work review waits through the next annual boundary');
reducedState.year=1102;
assert.equal(reducedFollowup.show(reducedState),true,'senior work review opens after two recorded years');
assert.equal(vm.runInNewContext('auditLifeState(S).length',ctx),0,'a dated reduced-work state passes state audit');
vm.runInNewContext('S.year=1102;applyResidenceEffects({fl:{reduced_work:0}},0,S,S.res.n,{},()=>{});',ctx);
assert.equal(reducedState.reducedWorkStartedYear,null,'ending reduced work clears its start year');
assert.equal(reducedFollowup.show({...reducedState,fl:{...reducedState.fl,reduced_work:1}}),false,'a legacy reduced-work flag without a start date does not invent elapsed years');
assert.equal(vm.runInNewContext('auditLifeState(S).length',ctx),0,'legacy reduced-work saves without a date remain auditable');
const legacyReducedState={...reducedState,reducedWorkStartedYear:undefined,fl:{...reducedState.fl,reduced_work:1}};
assert.equal(reducedFollowup.show(legacyReducedState),false,'a legacy reduced-work save without a date does not fabricate a follow-up interval');
assert.equal(vm.runInNewContext('auditLifeState(__state).length',Object.assign(ctx,{__state:legacyReducedState})),0,'a legacy reduced-work save with unknown start date remains valid');

console.log(JSON.stringify({passed:true,researchPauseReviewable:true,researchTenureGated:true,researchDepartureFollowupGated:true,pauseCanBeContinuedResumedOrEnded:true,resumptionPreservesEpisode:true,careAndEmploymentExitsGated:true,rhodesDateGate:true,reducedWorkFollowupGated:true,legacyDatesNotInvented:true,jobIndicesStable:true,postingAndRoleEventsGated:true,rolesAndFieldRoutesPresent:true,coworkerLifecycleRecorded:true,legacyCoworkerHistoryPreserved:true},null,2));
