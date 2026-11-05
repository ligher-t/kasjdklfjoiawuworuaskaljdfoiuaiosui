'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),context=require('./support/annual-cases.cjs').context(root).ctx;
context.rd=()=>{};
const {installEmploymentAppointmentFixture}=require('./support/employment-appointment-fixture.cjs');
const {installGeneralEmploymentFixture}=require('./support/general-employment-fixture.cjs');
installEmploymentAppointmentFixture(context);installGeneralEmploymentFixture(context);
const event=id=>context.window.GAME_DATA.EV.find(row=>row.id===id);
const expected={kaz_merc:['procedure','withdrawal'],sr_kazimierz_arena_backstage:['procedure','procedure','withdrawal'],sr_kazimierz_arena_shift:['procedure','self-or-family-care','withdrawal'],life_rhodes_research_pause_review:['organization-participation','defer','withdrawal']};
for(const [id,intents] of Object.entries(expected)){
 const row=event(id);assert(row,id+' event missing');assert.equal(row.c.length,intents.length,id+' choice count');
 assert.deepEqual(Array.from(row.c,choice=>choice.ethics?.intent),intents,id+' intent classification');
 assert(row.c.every(choice=>choice.ethics?.reviewed&&choice.ethics.policyVersion===87),id+' current review');
}
const mercenary=event('kaz_merc');assert(mercenary.c.every(choice=>choice.o.every(outcome=>outcome[2].lifeAffiliation===undefined)),'a completed guard contract does not establish ongoing membership');
const backstage=event('sr_kazimierz_arena_backstage');
assert.equal(backstage.c[0].o[0][2].lifeAffiliation.action,'join');assert.equal(backstage.c[0].o[1][2].lifeAffiliation,undefined);
assert.equal(backstage.c[1].o[0][2].lifeAffiliation,undefined,'one-day assistance must not imply employment');
const shift=event('sr_kazimierz_arena_shift');assert.equal(shift.c[2].o[0][2].lifeAffiliation.action,'leave');
const research=event('life_rhodes_research_pause_review');assert.deepEqual(Array.from(research.c,choice=>choice.o[0][2].lifeAffiliation.action),['return','review','leave']);
const states=[];
for(const choice of research.c){
 const affiliation=choice.o[0][2].lifeAffiliation,goal=choice.o[0][2].lifeGoal;
 const result=vm.runInContext(String.raw`(()=>{born({seed:870051,by:1070,region:'クルビア'});S.age=36;S.year=1107;const title='ロドスの鉱石病経過研究';applyLifeAffiliation({id:'rhodes-research',title,action:'join'});applyLifeAffiliation({id:'rhodes-research',action:'suspend',note:'生活事情'});applyLifeGoal({id:'oripathy-research',title,action:'start'});applyLifeAffiliation(${JSON.stringify(affiliation)});applyLifeGoal(${JSON.stringify(goal)});const a=S.lifeRecord.affiliations.find(x=>x.id==='rhodes-research'),g=S.lifeRecord.goals.find(x=>x.id==='oripathy-research');return {affiliation:a.status,episode:a.episodes.at(-1),goal:g.status,audit:auditLifeState(S)}})()`,context,{timeout:30000});
 const expectedAffiliation=affiliation.action==='return'?'active':affiliation.action==='leave'?'left':'suspended';
 const expectedGoal=goal.action==='continue'?'active':goal.action==='pause'?'paused':goal.action==='abandon'?'abandoned':'compromised';
 assert.equal(result.affiliation,expectedAffiliation);assert.equal(result.goal,expectedGoal);assert.deepEqual(Array.from(result.audit),[]);states.push({affiliation:result.affiliation,goal:result.goal});
}
const routeState=(seed,region,job,age=24)=>vm.runInContext(`(()=>{born({seed:${seed},by:1076,region:${JSON.stringify(region)}});S.age=${age};S.year=1100;S.mo=6;S.res=REG.find(row=>row.n===${JSON.stringify(region)});S.job=${job};S.sn.car=1100;return S})()`,context,{timeout:30000});
const provisionAppointment=(state,eventId,jobId,affiliationId)=>{context.__state=state;vm.runInContext(`S=__state;prepareEmploymentAppointmentFixture(${JSON.stringify(eventId)},${jobId},${JSON.stringify(affiliationId)})`,context,{timeout:30000});};
const applyEffect=(state,effect)=>{context.__state=state;context.__effect=effect;vm.runInContext('S=__state;ap(__effect);',context,{timeout:30000});};
const provisionOpening=(state,jobId,suffix)=>{
 context.__state=state;context.__jobId=jobId;context.__suffix=suffix;
 return JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  const area=ensureOccupationWorkArea(__state),work=__state.world.occupationWorld,
   employerId='career-route-employer:'+__suffix,siteId='career-route-site:'+__suffix,
   positionId='career-route-position:'+__suffix,openingId='career-route-opening:'+__suffix,
   sectorByJob={2:'MFG',3:'MIN',7:'SCI',14:'MIL',16:'LOG',21:'CIV',27:'SCI',32:'REC'},
   sector=sectorByJob[__jobId]||'MFG';
  area.sectorPresence||={};area.sectorPresence[sector]=true;
  work.employers[employerId]={employerId,organizationKey:null};
  work.sites[siteId]={siteId,employerId,areaId:area.areaId,status:'open',sector,positionIds:[positionId]};
  work.positions[positionId]={positionId,siteId,jobId:__jobId,capacity:1,aggregateOccupiedSlots:0,
   identifiedOccupiedSlots:0,reservedSlots:0,vacancyCount:1,openingIds:[openingId]};
  work.openings[openingId]={openingId,siteId,positionId,employerId,areaId:area.areaId,
   kind:'general-public',status:'open',slots:1,validFromYear:__state.year};
  area.siteIds.push(siteId);return {openingId,siteId};
 })())`,context,{timeout:30000}));
};
const restoreState=state=>{context.__state=state;return vm.runInContext('(()=>{S=__state;const saved=normalizeResumeImport(makeResumeSnapshot());replaceCurrentLife(saved.S);replaceWorldKnowledge(saved.W);S.known=W;restoreLifeRandom(S);return S})()',context);};
const eligible=(row,state)=>{context.__event=row;context.__state=state;return vm.runInContext('elig(__event,__state,tags(__state))',context,{timeout:30000});};
const affiliationEffect=(eventId,affiliationId,action='join')=>{
 const row=event(eventId);assert(row,eventId+' entry event missing');
 for(const choice of row.c||[])for(const outcome of choice.o||[]){
  const effect=outcome[2],affiliations=[effect?.lifeAffiliation,...(effect?.lifeAffiliations||[])];
  if(affiliations.some(item=>item?.id===affiliationId&&item.action===action))return effect;
 }
 assert.fail(`${eventId} has no ${action} outcome for ${affiliationId}`);
};
const employmentStartSource=(affiliationId,jobId)=>{
 let fallback=null;
 for(const row of context.window.GAME_DATA.EV)for(let choiceIndex=0;choiceIndex<(row.c||[]).length;choiceIndex++)
  for(let outcomeIndex=0;outcomeIndex<(row.c[choiceIndex].o||[]).length;outcomeIndex++){
   const effect=row.c[choiceIndex].o[outcomeIndex][2],memberships=[effect?.lifeAffiliation,...(effect?.lifeAffiliations||[])].filter(Boolean),
    starts=memberships.filter(item=>['join','assign'].includes(item.action||'join'));
   if(effect?.job===jobId&&starts.length===1&&starts[0]?.id===affiliationId&&
     memberships.every(item=>item===starts[0]||item.action==='leave')&&
     typeof starts[0].title==='string'&&starts[0].title.trim()){
    const establishedVisit=vm.runInContext(
     'EMPLOYMENT_PHYSICAL_INTERVIEWS[__eventId]===__affiliationId||EMPLOYMENT_ONBOARD_APPOINTMENT_SOURCES[__eventId]===__affiliationId',
     Object.assign(context,{__eventId:row.id,__affiliationId:affiliationId}));
    const source={eventId:row.id,choiceIndex,outcomeIndex};
    if(establishedVisit)return source;
    if(!fallback)fallback=source;
   }
  }
 return fallback;
};
const auditRoute=state=>vm.runInContext('auditLifeState(__state)',Object.assign(context,{__state:state}),{timeout:30000});
{
 const start=affiliationEffect('car','kjerag-village-transporter'),state=routeState(870081,'イェラグ',0);
 provisionAppointment(state,'car',16,'kjerag-village-transporter');
 applyEffect(state,start);
 assert.equal(state.job,16,'the Kjerag village route starts in the transporter occupation');
 assert.equal(state.lifeRecord.affiliations.find(row=>row.id==='kjerag-village-transporter').status,'active');
 assert.equal(state.lifeRecord.goals.find(row=>row.id==='kjerag-transporter-route').status,'active');
 const review=event('kjerag_transporter_route_review');
 assert.equal(review.show(state),false,'the Kjerag review waits until two recorded years on the route');
 state.year=1101;state.age+=1;assert.equal(review.show(state),false);
 state.year=1102;state.age+=1;assert.equal(review.show(state),true);
 assert(eligible(review,state),'the Kjerag route passes engine eligibility after its dated prerequisite');
 assert.equal(review.show({...state,res:{n:'ヴィクトリア'}}),false,'Kjerag route review stays local to Kjerag');
 applyEffect(state,review.c[0].o[0][2]);
 assert.equal(state.lifeRecord.affiliations.find(row=>row.id==='kjerag-village-transporter').role,'受け入れが決まった荷受け場所間の配達');
 assert.deepEqual(Array.from(auditRoute(state)),[],'continued Kjerag route remains auditable');
 const exitState=routeState(870082,'イェラグ',0);provisionAppointment(exitState,'car',16,'kjerag-village-transporter');applyEffect(exitState,start);exitState.year=1102;exitState.age+=2;
 applyEffect(exitState,review.c[2].o[0][2]);
 assert.equal(exitState.lifeRecord.affiliations.find(row=>row.id==='kjerag-village-transporter').status,'left');
 assert.equal(exitState.lifeRecord.goals.find(row=>row.id==='kjerag-transporter-route').status,'abandoned');
 assert.equal(exitState.job,0);assert.equal(review.show(exitState),false);
 assert.deepEqual(Array.from(auditRoute(exitState)),[],'leaving the Kjerag route closes the affiliation and goal');
}
{
 const start=affiliationEffect('car','rim-catastrophe-survey-assistant'),state=routeState(870083,'レム・ビリトン',0);
 provisionAppointment(state,'car',27,'rim-catastrophe-survey-assistant');
 applyEffect(state,start);
 assert.equal(state.job,27,'the Rim route starts as an investigation assistant, not an independent forecaster');
 const review=event('rim_catastrophe_transporter_review');
 assert.equal(review.show(state),false,'the Rim field review waits two years');
 state.year=1102;state.age+=2;assert.equal(review.show(state),true);
 assert(eligible(review,state),'the Rim assistant route passes engine eligibility at its dated boundary');
 assert.equal(review.show({...state,res:{n:'ヴィクトリア'}}),false,'the Rim assistant route stays local to Lem-Bilriton');
 applyEffect(state,review.c[1].o[0][2]);
 const assistant=state.lifeRecord.affiliations.find(row=>row.id==='rim-catastrophe-survey-assistant');
 assert.match(assistant.role,/観測助手/,'observation work remains an assistant role');
 assert.match(assistant.history.at(-1).note,/予測・警報発信を独立して担う職務ではない/);
 assert.equal(state.job,27,'observation assistance does not silently promote the person to a transporter');
 assert.deepEqual(Array.from(auditRoute(state)),[],'Rim assistant role update remains auditable');
 const exitState=routeState(870084,'レム・ビリトン',0);provisionAppointment(exitState,'car',27,'rim-catastrophe-survey-assistant');applyEffect(exitState,start);exitState.year=1102;exitState.age+=2;
 assert.match(review.c[2].l,/地域のトランスポーターとして働く/,'the selected transition begins the new job rather than only searching for one');
 assert.match(review.c[2].o[0][1],/トランスポーターへ移った/,'the result text matches the active transporter affiliation');
 assert.doesNotMatch(review.c[2].o[0][1],/求人を探し始めた/,'the result does not defer a job search after applying its hire effect');
 provisionAppointment(exitState,'rim_catastrophe_transporter_review',16,'terra-general-transporter');
 applyEffect(exitState,review.c[2].o[0][2]);
 assert.equal(exitState.lifeRecord.affiliations.find(row=>row.id==='rim-catastrophe-survey-assistant').status,'left');
 assert.equal(exitState.lifeRecord.affiliations.find(row=>row.id==='terra-general-transporter').status,'active');
 assert.equal(exitState.job,16,'leaving the survey team begins ordinary local transport work');
 assert.deepEqual(Array.from(auditRoute(exitState)),[],'the Rim-to-transporter transition closes one route and opens the next');
}
{
 const start=affiliationEffect('car','victoria-insurance-clerk'),state=routeState(870085,'ヴィクトリア',0);
 provisionAppointment(state,'car',21,'victoria-insurance-clerk');
 applyEffect(state,start);
 assert.equal(state.job,21);assert.equal(state.fl.vic_clerk_employed,1);
 const contract=event('vic_clerk_contract_review'),role=event('vic_clerk_role_review'),after=event('vic_clerk_after_departure');
 assert.equal(contract.show(state),true,'the contract review is tied to current clerk placement');
 assert.equal(eligible(contract,state),false,'the first review waits one year after the career-entry event');
 state.year=1101;state.age+=1;assert(eligible(contract,state),'the clerk review opens after its one-year prerequisite');
 applyEffect(state,contract.c[0].o[0][2]);
 assert.equal(state.lifeRecord.affiliations.find(row=>row.id==='victoria-insurance-clerk').role,'提出書類の照合補助');
 assert.equal(state.job,21,'the review changes the clerk role without ending employment');
 state.sn.vic_clerk_contract_review=state.year;
 state.year=1103;state.age+=2;assert.equal(role.show(state),true);assert.equal(eligible(role,state),false,'role review respects its three-year interval');
 state.year=1104;state.age+=1;assert(eligible(role,state),'the next clerk role review opens at three years');
 applyEffect(state,role.c[2].o[0][2]);
 assert.equal(state.lifeRecord.affiliations.find(row=>row.id==='victoria-insurance-clerk').status,'left');
 assert.equal(state.job,0);assert.equal(contract.show(state),false);assert.equal(role.show(state),false);
 state.year=1106;state.age+=2;assert.equal(after.show(state),false,'the post-employment memory waits three full years');
 state.year=1107;state.age+=1;assert(eligible(after,state),'the former clerk can receive a dated later-life follow-up');
 assert.deepEqual(Array.from(auditRoute(state)),[],'clerk departure and later follow-up state remain auditable');
}
{
 const entry=event('life_londinium_civilian_response'),afterwar=event('life_londinium_civilian_afterwar');
 const state=routeState(870088,'ヴィクトリア',0);state.year=1098;state.age=22;state.mo=7;
 state.local.city='ロンディニウム';state.world.events.londinium_war=1098;
 assert(eligible(entry,state),'the Londinium resident route opens from the local crisis without personal news receipt');
 applyEffect(state,entry.c[0].o[0][2]);
 const aid=state.lifeRecord.affiliations.find(row=>row.id==='londinium-mutual-aid');
 assert.equal(aid.status,'active');assert.equal(state.known.londinium_war,undefined,'a local resident response does not fabricate a personal news receipt');
 assert.equal(eligible(afterwar,state),false,'the relief follow-up does not jump from crisis entry to the later years');
 state.sn.life_londinium_civilian_response=1098;state.year=1100;state.age+=2;
 assert(eligible(afterwar,state),'the local civilian relief role receives a dated postwar continuation');
 applyEffect(state,afterwar.c[0].o[0][2]);
 assert.equal(aid.status,'left','the handover explicitly closes the civilian relief affiliation');
 assert.equal(state.lifeRecord.goals.find(row=>row.id==='londinium-civilian-continuity').status,'achieved');
 assert.deepEqual(Array.from(auditRoute(state)),[],'the crisis-to-postwar civilian route remains auditable');
}
{
 const entry=event('life_londinium_civilian_response'),reunionEntry=event('life_reunion_londinium_local_aid'),afterwar=event('life_londinium_civilian_afterwar'),reunionAfterwar=event('life_londinium_aid_afterwar'),relocation=event('life_londinium_mutual_aid_relocation'),pauseReview=event('life_londinium_mutual_aid_pause_review');
 assert(entry&&reunionEntry&&afterwar&&reunionAfterwar&&relocation&&pauseReview,'the Londinium local-aid route includes both entry paths and move/return handling');
 for(const row of [entry,reunionEntry])assert(row.c.some(choice=>choice.o.some(outcome=>outcome[2].lifeAffiliation?.id==='londinium-mutual-aid'&&outcome[2].lifeAffiliation.bindToLocality)),'each local-aid entry records its origin locality');
 assert(reunionEntry.c[0].o[0][2].lifeGoal?.id==='londinium-civilian-continuity','the Reunion referral entry starts the same ongoing civilian-aid goal');
 assert.deepEqual(Array.from(relocation.c,choice=>choice.ethics?.intent),['withdrawal','defer']);
 assert.deepEqual(Array.from(pauseReview.c,choice=>choice.ethics?.intent),['procedure','defer','withdrawal']);
 assert(relocation.c.every(choice=>choice.ethics?.reviewed&&choice.ethics.policyVersion===87));
 assert(pauseReview.c.every(choice=>choice.ethics?.reviewed&&choice.ethics.policyVersion===87));
 const makeAidState=(seed,source=entry)=>{
  const state=routeState(seed,'ヴィクトリア',0);state.year=1098;state.age=22;state.mo=6;state.home='移動都市';context.__state=state;
  state.local=vm.runInContext('makeLocality(__state.home,__state.res.n)',context);state.local.city='ロンディニウム';state.world.events.londinium_war=1098;
  applyEffect(state,{lifeAffiliation:{id:'reunion-reorg',title:'再編レユニオンの互助網',action:'join'}});
  assert.equal(eligible(source,state),false,'neither entry opens before July 1098');
  state.mo=7;state.age=17;assert.equal(eligible(source,state),false,'regular aid duty does not recruit a minor');
  state.age=22;assert(eligible(source,state));applyEffect(state,source.c[0].o[0][2]);state.sn[source.id]=1098;
  const alternative=source===entry?reunionEntry:entry;
  assert.equal(eligible(alternative,state),false,'the other entry cannot attempt a duplicate join into active membership');
  state.year=1100;state.age+=2;return state;
 };
 const state=makeAidState(870089),aid=state.lifeRecord.affiliations.find(row=>row.id==='londinium-mutual-aid'),originCity=state.local.city;
 assert.equal(aid.localityKey,vm.runInContext('localityKey(__state)',Object.assign(context,{__state:state})),'the activity records the exact resident locality');
 assert(eligible(afterwar,state),'the postwar duty remains available at the home locality');
 state.local.city=null;
 assert.equal(afterwar.show(state),false,'local postwar duties stop when the participant leaves Londinium');
 assert.equal(reunionAfterwar.show(state),false,'Reunion-referred duties also stop outside the recorded city');
 assert.equal(relocation.show(state),true,'moving away exposes a handover-or-pause decision');
 applyEffect(state,relocation.c[1].o[0][2]);state.sn.life_londinium_mutual_aid_relocation=state.year;
 assert.equal(aid.status,'suspended');assert.equal(state.lifeRecord.goals.find(row=>row.id==='londinium-civilian-continuity').status,'paused');
 assert.equal(entry.show(state),false);assert.equal(reunionEntry.show(state),false,'entry does not bypass a suspended membership');
 assert.deepEqual(Array.from(auditRoute(state)),[],'the relocation pause leaves a valid active goal and affiliation history');
 applyEffect(state,{returnToLocality:aid.localityKey});state.year+=3;state.age+=3;
 assert(eligible(pauseReview,state),'the home-city review opens after three years away');
 applyEffect(state,pauseReview.c[0].o[0][2]);state.sn.life_londinium_mutual_aid_pause_review=state.year;
 assert.equal(aid.status,'active');assert.equal(state.lifeRecord.goals.find(row=>row.id==='londinium-civilian-continuity').status,'active');
 assert(eligible(afterwar,state),'returning restores the local postwar route after an explicit choice');
 assert.deepEqual(Array.from(auditRoute(state)),[],'returning to the origin leaves a valid affiliation history');
 const leaveState=makeAidState(870090);leaveState.local.city=null;assert(relocation.show(leaveState));applyEffect(leaveState,relocation.c[0].o[0][2]);
 assert.equal(leaveState.lifeRecord.affiliations.find(row=>row.id==='londinium-mutual-aid').status,'left','a moved participant can hand the local work over and exit');
 assert.equal(leaveState.lifeRecord.goals.find(row=>row.id==='londinium-civilian-continuity').status,'achieved','handover completes the recorded duty');
 assert.equal(relocation.show(leaveState),false,'handover ends further relocation prompts');
 assert.deepEqual(Array.from(auditRoute(leaveState)),[],'leaving after relocation closes the local affiliation cleanly');
 leaveState.local.city=originCity;assert.equal(entry.show(leaveState),false);assert.equal(reunionEntry.show(leaveState),false,'a finished membership cannot be joined again through the alternative entry');
 for(const [source,followup] of [[entry,afterwar],[reunionEntry,reunionAfterwar]]){
  for(let choice=0;choice<3;choice++){
   const current=makeAidState(870100+choice,source);assert(eligible(followup,current),'each entry reaches its own later duty');
   applyEffect(current,followup.c[choice].o[0][2]);current.sn[followup.id]=current.year;
   const membership=current.lifeRecord.affiliations.find(row=>row.id==='londinium-mutual-aid'),goal=current.lifeRecord.goals.find(row=>row.id==='londinium-civilian-continuity');
   assert.equal(membership.status,['left','active','left'][choice]);assert.equal(goal.status,['achieved','active','abandoned'][choice],'handover, continuation and departure update the same goal');
   assert.equal(current.lifeRecord.goals.some(row=>row.id==='londinium-relief'),false,'continuation does not create a second unfinished goal');
   assert.deepEqual(Array.from(auditRoute(current)),[],source.id+' followup branch '+choice);
  }
  for(let choice=0;choice<3;choice++){
   const current=makeAidState(870110+choice,source),key=current.lifeRecord.affiliations.find(row=>row.id==='londinium-mutual-aid').localityKey;
   current.local.city=null;assert(eligible(relocation,current));applyEffect(current,relocation.c[1].o[0][2]);current.sn[relocation.id]=current.year;
   const restored=JSON.parse(JSON.stringify(current));
   assert.equal(restored.lifeRecord.affiliations.find(row=>row.id==='londinium-mutual-aid').localityKey,key,'same-version data roundtrip retains the original locality');
   assert.equal(restored.lifeRecord.goals.find(row=>row.id==='londinium-civilian-continuity').status,'paused');
   restored.year=1103;restored.age+=3;assert.equal(eligible(pauseReview,restored),false,'three years elapsed elsewhere do not permit local duties');
   applyEffect(restored,{returnToLocality:key});restored.year=1102;restored.age-=1;assert.equal(eligible(pauseReview,restored),false,'returning after only two years does not bypass the pause boundary');
   restored.year=1103;restored.age+=1;assert(eligible(pauseReview,restored));applyEffect(restored,pauseReview.c[choice].o[0][2]);restored.sn[pauseReview.id]=restored.year;
   const membership=restored.lifeRecord.affiliations.find(row=>row.id==='londinium-mutual-aid'),goal=restored.lifeRecord.goals.find(row=>row.id==='londinium-civilian-continuity');
   assert.equal(membership.status,['active','suspended','left'][choice]);assert.equal(goal.status,['active','paused','abandoned'][choice]);
   assert.equal(membership.episodes.length,1,'resuming does not invent a second membership period');
   assert.equal(eligible(followup,restored),choice===0,'only explicit resumption restores the local followup');
   assert.deepEqual(Array.from(auditRoute(restored)),[],source.id+' pause review branch '+choice);
   if(choice===1){restored.year=1105;restored.age+=2;assert.equal(eligible(pauseReview,restored),false);restored.year=1106;restored.age+=1;assert(eligible(pauseReview,restored),'continued suspension is reviewed again after three years');}
  }
 }
 const sameCity=makeAidState(870120);context.__state=sameCity;
 sameCity.local.kind=vm.runInContext("SIM_TABLES.locality[__state.home==='移動都市'?'mobile':'fixed'].find(row=>row.n!==__state.local.kind).n",context);
 assert.equal(sameCity.local.city,'ロンディニウム');assert.equal(afterwar.show(sameCity),false);assert(eligible(relocation,sameCity),'moving within the city still requires handing over the old locality duty');
}
{
 const contact=event('sr_rhodes_recruitment_contact'),hiring=event('sr_rhodes_hiring_review'),reapply=event('sr_rhodes_reapplication');
 const state=routeState(870086,'クルビア',0);state.local.access=0.8;
 assert(eligible(contact,state),'the Rhodes recruitment contact is reachable in an accessible locality');
 applyEffect(state,contact.c[0].o[0][2]);
 const application=state.lifeRecord.affiliations.find(row=>row.id==='rhodes-employment');
 assert.equal(application.status,'contacted');assert.equal(state.lifeRecord.affiliations.some(row=>row.id==='rhodes-staff'),false);
 assert.equal(hiring.show(state),false,'recruitment response does not resolve in the contact year');
 state.year=1101;state.age+=1;assert(eligible(hiring,state),'the hiring response follows the application');
 applyEffect(state,hiring.c[0].o[1][2]);
 assert.equal(application.status,'outside','a rejected application is closed without making the applicant Rhodes staff');
 assert.equal(state.lifeRecord.affiliations.some(row=>row.id==='rhodes-staff'),false);
 state.year=1103;state.age+=2;assert.equal(reapply.show(state),false,'reapplication waits three years after rejection');
 state.year=1104;state.age+=1;assert(eligible(reapply,state),'a later application can reopen after the recorded wait');
 applyEffect(state,reapply.c[0].o[0][2]);
 assert.equal(application.status,'contacted');assert.equal(application.role,'再応募・職務条件を確認中');
 assert.deepEqual(Array.from(auditRoute(state)),[],'rejected and renewed application states remain auditable');
 const hired=routeState(870087,'クルビア',0);hired.local.access=0.8;
 applyEffect(hired,contact.c[0].o[0][2]);hired.year=1101;hired.age+=1;
 provisionAppointment(hired,'sr_rhodes_hiring_review',28,'rhodes-staff');
 applyEffect(hired,hiring.c[0].o[0][2]);
 assert.equal(hired.lifeRecord.affiliations.find(row=>row.id==='rhodes-employment').status,'outside');
 assert.equal(hired.lifeRecord.affiliations.find(row=>row.id==='rhodes-staff').status,'active','accepted application transitions into active staff membership');
 assert.equal(contact.show(hired),false,'active staff cannot receive a second recruitment contact');
 assert.deepEqual(Array.from(auditRoute(hired)),[],'application closure and accepted staff placement remain auditable');
}
{
 // All current affiliation IDs have a reviewed physical/remote scope, not just the selected routes.
 const rules=vm.runInContext('AFFILIATION_RULES',context), ids=new Set();
 for(const row of context.window.GAME_DATA.EV)for(const choice of row.c||[])for(const outcome of choice.o||[]){
  const e=outcome[2];if(!e||typeof e!=='object')continue;
  for(const a of [e.lifeAffiliation,...(e.lifeAffiliations||[])].filter(Boolean))ids.add(a.id);
 }
 assert.deepEqual([...ids].sort(),Object.keys(rules).sort(),'new or unreviewed affiliation IDs cannot bypass the scope audit');
 const localWorkers=new Set(['military-service-entry','displaced-recovery-survey','ursus-military-factory-contract','columbia-technical-work','victoria-insurance-clerk','ursus-kleini-sever-mine','siracusa-post-family-work','kazimierz-arena-staff','ursus-zelgrad-factory','ursus-displaced-repair-workshop']);
 const localDuties=new Set(['local-mutual-aid','infected-exclusion','infected-mutual-aid','londinium-mutual-aid','leithanian-district-petition','leithanian-noble-household','siracusa-independent-trade','hist-columbia_independence','hist-kazdel_commission_founded','hist-siracusa_unification','hist-ursus_great_rebellion','hist-rim_billiton_independence','hist-leith_revolution','hist-kazdel_war_declared','hist-kazdel_civil_war']);
 for(const [i,id] of [...ids].sort().entries()){
  const rule=rules[id],s=routeState(872000+i,rule.region||'ヴィクトリア',rule.jobs?.[0]||0);
  const appOnly=id==='rhodes-employment';
  if(rule.scope==='workplace'){
   const jobId=rule.jobs[0];
   s.job=0;s.k=Math.max(50,s.k||0);s.socialLearning||={};s.socialLearning.literacy=60;
   if(id==='ursus-displaced-repair-workshop'){
    s.year=1102;s.age+=2;context.__state=s;
    vm.runInContext("S=__state;S.res=REG.find(row=>row.n==='ウルサス');S.home='移動都市';S.local={...makeLocality(S.home,S.res.n),kind:'移動都市の避難・労働区画',city:null};",context);
    s.displacement={status:'shelter',sinceYear:1102};
    applyEffect(s,{lifeAffiliation:{id:'ursus-zelgrad-factory',title:'ゼルグラードの工場',kind:'employer',action:'join',role:'工場補助'}});
    applyEffect(s,{lifeGoal:{id:'ursus-zelgrad-after-crisis',title:'ゼルグラード危機後の住まいと生計を整える',priority:'生計と居場所',action:'start'}});
    applyEffect(s,{lifeSkill:{id:'industrial-production',title:'工場の製造補助',delta:1,context:'ゼルグラード工場の検品・部品作業'}});
    s.year=1103;s.age+=1;
    assert(event('life_ursus_zelgrad_displaced_work').show(s),'Ursus displaced-work source is reachable after factory employment and evacuation');
   }
   if(id==='kazimierz-arena-staff'){
    s.age=55;s.year=1088;
    s.lifeRecord.affiliations.push({id:'kazimierz-competition-career',title:'カジミエーシュの競技騎士としての職業',kind:'individual-career',status:'active',role:'競技騎士',startedYear:1088,endedYear:null,episodes:[{startedYear:1088,endedYear:null,roleAtStart:'競技騎士',returning:false,basis:'recorded'}],history:[]});
    s.year=1100;
   }
   if(jobId===7)applyEffect(s,{lifeSkill:{id:'engineering-experience',title:'技術経験',delta:12,context:'所属範囲監査用の実在求人'}});
   context.__id=id;
   const spec=vm.runInContext('EMPLOYMENT_APPOINTMENT_SITES.find(row=>row.affiliationId===__id)',context);
   const source=employmentStartSource(id,jobId);
   assert(source,id+' has a source-backed employment start');
   context.__state=s;context.__source=source;context.__jobId=jobId;
   try{
    if(spec){
     s.year=Math.max(s.year,spec.fromYear);
     vm.runInContext('S=__state;applyEmploymentAppointmentFixture(__source.eventId,__jobId,__id,__source.choiceIndex,__source.outcomeIndex)',context,{timeout:30000});
    }else{
     assert.equal(id,'ursus-kleini-sever-mine','a missing appointment definition is reserved for the coercive mine assignment route');
     assert.equal(source.eventId,'ursus_mine_assignment_offer','the coercive mine assignment keeps its reviewed source');
     vm.runInContext('S=__state;applyEventOutcomeFixture(__source.eventId,__source.choiceIndex,__source.outcomeIndex)',context,{timeout:30000});
    }
   }
   catch(error){throw new Error(`${id} source ${source.eventId} could not establish its reviewed start: ${error.message}`);}
  }
  const existing=s.lifeRecord.affiliations.find(row=>row.id===id);
  if(!existing||!['active','crisis','suspended'].includes(existing.status))
   applyEffect(s,{lifeAffiliation:{id,title:id,action:appOnly?'contact':id==='ursus-kleini-sever-mine'?'assign':'join'}});
  const a=s.lifeRecord.affiliations.find(row=>row.id===id),key=a.anchor?.localityKey;
  assert(a.origin?.localityKey,id+' retains its first contact place');
  if(appOnly){applyEffect(s,{lifeAffiliation:{id,action:'followup'}});applyEffect(s,{lifeAffiliation:{id,action:'decline'}});assert.equal(a.status,'outside');continue;}
  applyEffect(s,{lifeAffiliation:{id,action:'suspend'}});
  assert.equal(a.status,'suspended');
  applyEffect(s,{lifeAffiliation:{id,action:'return'}});
  assert.equal(a.anchor.localityKey,key,'resuming does not replace the original place for '+id);
  assert.equal(a.episodes.length,1,'a pause is not a second membership for '+id);
  applyEffect(s,{home:s.home,localKind:s.local.kind});
  if(localWorkers.has(id)){
   assert.equal(a.status,'left',id+' stops at the old workplace after moving');
   assert.equal(s.job,0,id+' does not retain the old employer salary');
  }else if(localDuties.has(id)){
   context.__state=s;context.__id=id;
   assert.equal(vm.runInContext('affiliationWorkAvailable(__state,__id)',context),false,id+' does not perform old district work in the new district');
   assert.equal(a.status,'active',id+' membership is retained until the person chooses what to do');
  }else assert.equal(a.status,'active',id+' is a regional route, contact, or remote relationship rather than the old district job');
 }
}
{
 const s=routeState(872100,'ヴィクトリア',0);s.home='固定集落';context.__state=s;
 s.local=vm.runInContext("makeLocality('固定集落','ヴィクトリア','小規模な定住地')",context);
 vm.runInContext('ensureLocalityState(__state)',context);
 const originKey=s.community.key,originPlace=s.local.placeId,clinic=vm.runInContext("activeFacility(__state,'clinic').id",context);
 applyEffect(s,{home:'固定集落',localKind:'小規模な定住地'});
 assert.equal(s.local.city,null);assert.equal(s.local.kind,'小規模な定住地');
 assert.notEqual(s.local.placeId,originPlace,'same-shaped anonymous villages are different settlements');
 assert.notEqual(s.community.key,originKey);
 context.__state=s;assert.notEqual(vm.runInContext("activeFacility(__state,'clinic').id",context),clinic,'the second village has different facilities');
 const preserved=JSON.stringify(s);assert.throws(()=>applyEffect(s,{returnToLocality:'__proto__',cash:-100}),/居住記録/);
 assert.equal(JSON.stringify(s),preserved,'an invalid return is rejected before money or history changes');
 context.__state=s;
 const saved=restoreState(s);
 assert.equal(saved.community.key,s.community.key,'real current-version save normalization retains the current area');
 applyEffect(saved,{returnToLocality:originKey});
 assert.equal(saved.community.key,originKey,'return uses the recorded district instead of drawing a similar village');
 context.__state=saved;assert.equal(vm.runInContext("activeFacility(__state,'clinic').id",context),clinic);
 assert.deepEqual(Array.from(auditRoute(saved)),[]);
}
{
 const s=routeState(872110,'ウルサス',0);s.inf=1;s.fl.dg=1;s.cash=10000000;
 const entry=event('life_ursus_zelgrad_recruitment'),from=s.community.key;
 applyEffect(s,entry.c[0].o[0][2]);
 const a=s.lifeRecord.affiliations.find(row=>row.id==='ursus-zelgrad-factory');
 assert.equal(s.local.city,'ゼルグラード');assert.equal(a.status,'active');assert.equal(s.job,2);
 assert.equal(a.origin.localityKey,from,'the recruitment origin is retained separately');
 assert.equal(a.anchor.localityKey,s.community.key,'the employer is bound after relocation');
 assert.notEqual(a.anchor.localityKey,from);
 assert(a.anchor.workplaceId);
}
{
 const s=routeState(872120,'クルビア',0);
 s.k=50;s.socialLearning||={};s.socialLearning.literacy=60;s.lifeRecord.skills||=[];
 s.lifeRecord.skills.push({id:'engineering-experience',level:12,basis:'acceptance-fixture'});
 const first=provisionOpening(s,7,'first'),second=provisionOpening(s,7,'second');
 context.__state=s;context.__opening=first.openingId;
 vm.runInContext("S=__state;applyPlayerEmploymentAction(S,{action:'accept-local-opening',jobId:7,openingId:__opening})",context,{timeout:30000});
 applyEffect(s,{lifeAffiliation:{id:'columbia-technical-work',title:'研究企業',action:'join'}});
 context.__state=s;
 const available=vm.runInContext("alternativeFacility(__state,'workplace')",context);
 assert.equal(available?.id,second.siteId,'the alternative is an actual second employer opening');
 applyEffect(s,{siteAction:{kind:'workplace',action:'switch'}});
 assert.equal(s.lifeRecord.affiliations.find(row=>row.id==='columbia-technical-work').status,'left','same occupation at another workplace is not the old company');
 assert.equal(s.job,7,'a confirmed new placement retains the occupation');
 context.__state=s;assert.equal(vm.runInContext('S=__state;currentPlayerEmployment(S).siteId',context),second.siteId);
 assert(s.siteAffiliationHistory.some(row=>row.kind==='workplace'&&row.action==='ended'&&row.reason==='chosen-transfer'));
 s.fl.workplace_hazard=1;applyEffect(s,{job:0});assert.equal(s.fl.workplace_hazard,0,'past hazardous work does not remain a current workplace exposure');
}
{
 const s=routeState(872130,'ヴィクトリア',28);
 applyEffect(s,{lifeAffiliation:{id:'rhodes-staff',title:'ロドス',action:'join'}});
 context.__state=s;vm.runInContext("S=__state;S.neighborContact=ensureSocialContact(S,'neighbor');S.fl.neighbor_contact=1;S.fl.infection_community_rumor_current_area=1;S.fl.infection_housing_rumor_current_home=1",context);
 const oldNeighbor=s.neighborContact,oldNeighborMoveYear=oldNeighbor.movedYear;
 applyEffect(s,event('sr_rhodes_posting_review').c[0].o[0][2]);
 assert.equal(oldNeighbor.status,'以前の近所の人');assert.equal(oldNeighbor.movedYear,oldNeighborMoveYear,'the player moving does not invent a move by the neighbor');
 assert.equal(s.fl.neighbor_contact,0);assert.equal(s.fl.infection_community_rumor_current_area,0);assert.equal(s.fl.infection_housing_rumor_current_home,0);
 const nextNeighbor=vm.runInContext("ensureSocialContact(S,'neighbor')",context);
 assert.notEqual(nextNeighbor.id,oldNeighbor.id,'a new base neighbor is not the person from the old district');
 assert.equal(nextNeighbor.metResidenceBaseId,'rhodes-landship');
 assert.equal(s.residenceBase?.id,'rhodes-landship');
 const shipKey=s.community.key;
 s.local.ecology='変更後の航路';vm.runInContext('ensureLocalityState(__state)',Object.assign(context,{__state:s}));
 assert.equal(s.community.key,shipKey,'ship navigation does not become a household move');
 if(!s.personTies)s.personTies={};
 s.personTies.rhodesColleague={id:'posting-test',actualStatus:'working'};
 applyEffect(s,event('sr_rhodes_posting_transfer').c[0].o[0][2]);
 assert.equal(s.residenceBase,null);assert.notEqual(s.community.key,shipKey);
 assert.equal(s.lifeRecord.affiliations.find(row=>row.id==='rhodes-staff').posting.kind,'branch');
 assert.equal(s.personTies.rhodesColleague.actualStatus,'former','the old ship colleague is not assigned to the new branch');
 assert.equal(s.job,28);
 const branch=s.community.key;
 applyEffect(s,{home:s.home,localKind:s.local.kind});
 assert.notEqual(s.community.key,branch);assert.equal(s.job,0,'personal relocation does not retain the old branch salary');
 assert.equal(s.lifeRecord.affiliations.find(row=>row.id==='rhodes-staff').status,'left');
 assert.throws(()=>applyEffect(s,{returnToLocality:shipKey}),/居住記録/,'former staff cannot board by returning to an old address');
}
{
 const s=routeState(872140,'ヴィクトリア',0);s.inf=1;s.fl.dg=1;s.cash=10000000;
 s.year=1101;s.age++;
 applyEffect(s,{lifeAffiliation:{id:'reunion-reorg',title:'連絡網',action:'join'}});
 applyEffect(s,event('sr_reunion_movement_join').c[0].o[0][2]);
 assert.equal(s.res.n,'ウルサス');assert.equal(s.residenceBase?.kind,'camp');
 assert(event('sr_reunion_border_camp_daily').show(s));
 applyEffect(s,event('sr_reunion_border_relocation').c[0].o[0][2]);
 assert.equal(s.residenceBase?.kind,'column');assert.equal(event('sr_reunion_border_camp_daily').show(s),false);
 assert(event('sr_reunion_moving_column_daily').show(s));
 applyEffect(s,{home:s.home,localKind:s.local.kind});
 assert.equal(event('sr_reunion_moving_column_daily').show(s),false,'a personal departure from the column stops its local daily events');
}
{
 const s=routeState(872150,'ヴィクトリア',0);s.inf=1;s.fl.dg=1;
 applyEffect(s,{lifeAffiliation:{id:'rhodes-care',title:'療養相談',action:'contact'}});
 applyEffect(s,{lifeAffiliation:{id:'rhodes-care',action:'join',role:'巡回診療の予約あり'}});
 s.sn.life_rhodes_referral_response=1100;s.year=1101;s.age++;
 assert(eligible(event('life_rhodes_clinic_visit'),s));
 applyEffect(s,{home:s.home,localKind:s.local.kind});
 assert.equal(eligible(event('life_rhodes_clinic_visit'),s),false,'the old appointment does not become a visit to another clinic');
 const notice=event('life_rhodes_care_relocation');assert(eligible(notice,s));
 const health=s.h,inf=s.inf;
 applyEffect(s,notice.c[0].o[1][2]);assert.equal(eligible(event('life_rhodes_clinic_visit'),s),false,'requesting a new appointment does not guarantee acceptance');
 applyEffect(s,notice.c[0].o[0][2]);assert.equal(s.h,health);assert.equal(s.inf,inf);
 s.year++;s.age++;assert(eligible(event('life_rhodes_clinic_visit'),s),'a confirmed appointment at the new place can be attended later');
}
{
 for(const [i,id] of ['infected-exclusion','infected-mutual-aid','leithanian-noble-household','siracusa-familia'].entries()){
  const region=id==='leithanian-noble-household'?'リターニア':id==='siracusa-familia'?'シラクーザ':'ヴィクトリア';
  const s=routeState(872200+i,region,0);s.cash=10000000;
  const entry=id.startsWith('infected-')?event('life_infected_association_choice'):id==='siracusa-familia'?event('sir_family'):event('life_leithanian_noble_household_entry');
  const branch=id==='infected-mutual-aid'?1:0;applyEffect(s,entry.c[branch].o[0][2]);
  const a=s.lifeRecord.affiliations.find(row=>row.id===id),origin=a.localityKey,bias=s.biasInfected,policy=s.lifeRecord.organizations.find(row=>row.id===id)?.policy;
  if(id==='siracusa-familia')applyEffect(s,event('sir_family_duty').c[2].o[0][2]);
  const borrowed=s.siracusaFamilyTie?.duty?.outstandingAmount||0;
  applyEffect(s,{home:s.home,localKind:s.local.kind});
  const relocation=event('life_'+id.replaceAll('-','_')+'_relocation'),review=event('life_'+id.replaceAll('-','_')+'_absence_review');
  assert(eligible(relocation,s));applyEffect(s,relocation.c[1].o[0][2]);
  assert.equal(a.status,'suspended');s.year+=3;s.age+=3;assert(eligible(review,s));
  const personalPause=JSON.parse(JSON.stringify(s));personalPause.lifeRecord.affiliations.find(row=>row.id===id).pauseContext='personal';
  assert.equal(review.show(personalPause),false,'the relocation review cannot bypass an unrelated personal or diagnostic pause');
  assert.equal(review.c[0].show(s),false,'a remote letter does not restore the old district duty');
  const saved=restoreState(s);
  for(let choice=0;choice<3;choice++){
   const restored=JSON.parse(JSON.stringify(saved));
   if(choice===0)applyEffect(restored,{returnToLocality:origin});
   applyEffect(restored,review.c[choice].o[0][2]);
   assert.equal(restored.lifeRecord.affiliations.find(row=>row.id===id).status,['active','suspended','left'][choice]);
   assert.equal(restored.biasInfected,bias,'moving or pausing does not force a change of belief');
   if(policy!==undefined)assert.equal(restored.lifeRecord.organizations.find(row=>row.id===id).policy,policy,'leaving does not invent a successor policy');
   if(id==='siracusa-familia')assert.equal(restored.siracusaFamilyTie.duty.outstandingAmount,borrowed,'relocation and departure do not forgive a recorded debt');
   assert.deepEqual(Array.from(auditRoute(restored)),[],id+' departure/return branch '+choice);
  }
 }
}
{
 const s=routeState(872300,'ウルサス',0);s.inf=1;s.fl.dg=1;
 applyEffect(s,event('ursus_mine_assignment_offer').c[0].o[0][2]);
 const a=s.lifeRecord.affiliations.find(row=>row.id==='ursus-kleini-sever-mine');
 context.__state=s;assert.equal(vm.runInContext("affiliationChoiceAvailable({o:[[1,'',{home:'固定集落'}]]},__state)",context),false,'a normal move choice does not release a coerced miner');
 applyEffect(s,{job:0});
 assert.equal(a.status,'suspended','being unable to work does not record release from the mine');
 assert.equal(s.job,0);assert.equal(s.fl.workplace_hazard,0,'current work exposure stops during interruption');
 s.year+=2;s.age+=2;
 const review=event('ursus_mine_assignment_review');assert(review.show(s));
 applyEffect(s,review.c[0].o[1][2]);
 assert.equal(a.status,'suspended','a failed removal attempt does not turn interrupted work into active labor');
 applyEffect(s,review.c[0].o[0][2]);
 assert.equal(a.status,'left','the explicit individual exit closes the coerced period');
 assert.deepEqual(Array.from(auditRoute(s)),[]);
}
{
 const s=routeState(872310,'ヴィクトリア',0);s.cash=10000000;
 applyEffect(s,event('life_infected_association_choice').c[0].o[0][2]);
 const a=s.lifeRecord.affiliations.find(row=>row.id==='infected-exclusion'),key=a.localityKey;
 applyEffect(s,{lifeAffiliation:{id:a.id,action:'crisis',note:'会の中に対立がある'}});
 applyEffect(s,{home:s.home,localKind:s.local.kind});
 applyEffect(s,event('life_infected_exclusion_relocation').c[1].o[0][2]);
 assert.equal(a.pausedFrom,'crisis');s.year+=3;s.age+=3;
 const restored=restoreState(s);applyEffect(restored,{returnToLocality:key});
 applyEffect(restored,event('life_infected_exclusion_absence_review').c[0].o[0][2]);
 assert.equal(restored.lifeRecord.affiliations.find(row=>row.id===a.id).status,'crisis','returning to the area does not resolve the earlier conflict');
 assert.deepEqual(Array.from(auditRoute(restored)),[]);
}
{
 const ui=require('./support/presentation-cases.cjs').context(root);
 installEmploymentAppointmentFixture(ui.ctx);
 vm.runInContext("born({seed:872320,by:1077,region:'ヴィクトリア'});S.age=25;S.year=1102;applyEmploymentAppointmentFixture('sr_rhodes_hiring_review',28,'rhodes-staff',0,0);ap({lifeAffiliation:{id:'rhodes-staff',action:'role',role:'本艦・船内居住',bindAt:'destination'}});HL=0;rd();",ui.ctx);
 assert(ui.nodes.get('pf').innerHTML.includes('ロドス本艦'),'the profile renders the ship as the actual residence, not the old land district');
 vm.runInContext("ap({lifeAffiliation:{id:'rhodes-staff',action:'role',role:'地域支部・地上拠点勤務',bindAt:'destination'}});rd();",ui.ctx);
 assert(!ui.nodes.get('pf').innerHTML.includes('ロドス本艦'),'the residence display follows the move back to land');
}
{
 const s=routeState(872330,'ヴィクトリア',0);
 s.residenceBase={id:'fixture-ship',kind:'landship',label:'試験用本艦'};
 s.sp={residenceRegion:s.res.n,sharesHousehold:true};s.kids=[{d:0}];
 context.__state=s;
 vm.runInContext('(()=>{S=__state;applyResidenceEffects({home:S.home,localKind:S.local.kind},0,S,S.res.n,1000000,()=>{})})()',context);
 assert.equal(s.moves.at(-1).householdSize,1,'leaving a base does not invent that a land-based spouse or child was aboard and moved with the player');
}
console.log('PASS affiliation scopes and lifecycles, current-version restoration, stable places, workplaces, postings, appointments, interrupted coerced labor, unresolved conflicts, residence rendering and individual base departure');

const project=vm.runInContext(`(()=>{
  HL=1;AU='r';born({seed:909121,by:1077,region:'ヴィクトリア'});
  S.age=32;S.year=S.by+32;startGeneralEmploymentFixture(2,'work-project-setback');S.workContract.hours="regular";
  const e=EV.find(e=>e.id==='life_work_project_setback'),T=tags(S);
  const visible=elig(e,S,T);DEBUG_RANDOM=()=>0.999;fire(e,S,T);DEBUG_RANDOM=null;
  const short=S.workContract.hours,choice=S.eventReviews[e.id].choice,
    noDuplicateHours=!ok(e.c[2].show,S,tags(S));
  S.year+=4;S.age+=4;const afterT=tags(S),same=elig(e,S,afterT);
  S.workContract.siteId+='-new';const moved=elig(e,S,afterT);
  ap(e.c[0].o[0][2]);const skill=S.lifeRecord.skills.find(x=>x.id==='job-2');
  const serialized=JSON.parse(JSON.stringify(S));
  return {visible,short,choice,noDuplicateHours,same,moved,skill:skill.practiceCount,
    saved:serialized.eventReviews[e.id].choice===choice};
})()`,context);
assert.equal(project.visible,true);assert.equal(project.short,'short','the chosen shorter shift changes the actual contract');
assert.match(project.choice,/勤務を短く/);assert.equal(project.noDuplicateHours,true);assert.equal(project.same,false);
assert.equal(project.moved,true);assert.equal(project.skill,1);assert.equal(project.saved,true);
console.log('PASS practical work choice, actual shorter contract, job skill, changed-workplace review and serialized response');

const infantChoice=vm.runInContext(`(()=>{
  HL=1;AU='r';born({seed:1909390020,by:1065,region:'ウルサス',wealth:'平均的'});
  const infantAge=S.age;fire(EV.find(e=>e.id==='fever'),S,tags(S));
  return {age:infantAge,resolved:!S.ev,seen:S.sn.fever===S.year};
})()`,context);
assert.equal(infantChoice.age,0);assert.equal(infantChoice.resolved,true);assert.equal(infantChoice.seen,true);
console.log('PASS infant caregiver choice uses choice-wrapper weights without treating them as event arrays');
