'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),document={currentScript:null,getElementById(){return{hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const ctx={window:{},document,console,Date,setTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),ctx,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],ctx,{timeout:15000});
ctx.rd=()=>{};
const result=vm.runInNewContext(String.raw`(()=>{
 if(infectionAwarenessAttitude({biasInfected:8,age:14})!=='protective'||infectionAwarenessAttitude({biasInfected:20,age:30})!=='mixed'||infectionAwarenessAttitude({biasInfected:35,age:30})!=='exclusionary')throw Error('infection attitude bands do not match the event-selection tags');
 born({seed:871126,by:1047,region:'龍門'});S.age=30;S.year=S.by+S.age;S.inf=1;S.fl.dg=1;S.fl.hid=1;
 const origin={region:S.res.n,placeId:S.local?.placeId||null,areaKey:S.community?.key||null};
 const event=id=>window.GAME_DATA.EV.find(row=>row.id===id),rumor=event('infection_neighborhood_rumor_under_concealment'),housing=event('infection_regional_housing_pressure'),harassment=event('infection_rumor_public_harassment');
 if(!rumor||rumor.need.includes('infection_family_disclosed'))throw Error('the local rumor still depends on telling family');
 if(rumor.c.some(choice=>choice.o.some(outcome=>outcome[2].fl?.infection_community_rumor_current_area!==1||outcome[2].fl?.infection_housing_rumor_current_home!==1)))throw Error('the rumor does not record both the current community and manager separately');
 if(!housing.need.includes('infection_housing_rumor_current_home')||housing.need.includes('infection_community_rumor'))throw Error('housing pressure is gated by a life-wide rumor instead of current-home knowledge');
 if(typeof housing.show!=='function'||housing.show(S))throw Error('housing pressure does not require a current-home awareness record');
 if(housing.after?.id!==rumor.id||housing.after.min!==1||!harassment.need.includes('infection_community_rumor_current_area')||harassment.need.includes('infection_housing_rumor_current_home'))throw Error('follow-up timing or local harassment scope is missing');
 if(harassment.t.includes('診断を誰に話したか')||harassment.c.some(choice=>choice.l.includes('家族')))throw Error('clinic harassment assumes an unrecorded diagnosis recipient or available family member');
 if(!FLAG_REGISTRY.infection_community_rumor_current_area?.engineClearers?.length)throw Error('the current-community rumor state has no declared lifecycle');
 if(!FLAG_REGISTRY.infection_housing_rumor_current_home?.engineClearers?.length)throw Error('the current-home knowledge state has no declared lifecycle');
 const previous=TRACE_RESOLUTION;TRACE_RESOLUTION={kind:'choice',id:rumor.id,label:rumor.c[0].l};try{ap(rumor.c[0].o[0][2])}finally{TRACE_RESOLUTION=previous}
 if(S.fl.infection_community_rumor!==1||S.fl.infection_community_rumor_current_area!==1||S.fl.infection_housing_rumor_current_home!==1)throw Error('the rumor history, current community and manager knowledge were not recorded');
 const rumorRecord=infectionAwarenessEntries(S).find(row=>row.source==='unattributed-rumor'&&row.audience==='housing-management');
 if(!rumorRecord||rumorRecord.certainty!=='unverified'||rumorRecord.subjectMatch!=='unclear'||rumorRecord.region!==origin.region||rumorRecord.placeId!==origin.placeId||rumorRecord.areaKey!==origin.areaKey)throw Error('housing rumor provenance or uncertainty was not preserved');
 if(infectionAwarenessHas(S,'housing-management'))throw Error('an unverified rumor was treated as a confirmed diagnosis');
 if(!infectionAwarenessHas(S,'housing-management',{currentPlace:true,includeUnverified:true}))throw Error('current-home rumor was not found at its recorded place');
 if(!housing.show(S))throw Error('current-home awareness did not unlock the housing pressure follow-up');
 const priorCommunity=S.community;
 S.community={...S.community,key:'awareness-test-other-neighborhood'};
 if(infectionAwarenessHas(S,'housing-management',{currentPlace:true,includeUnverified:true}))throw Error('same-city knowledge crossed into a different neighborhood');
 if(housing.show(S))throw Error('housing awareness crossed into a different neighborhood');
 S.community=priorCommunity;
 const history= S.fl.infection_community_rumor;
 const movePrevious=TRACE_RESOLUTION;TRACE_RESOLUTION={kind:'choice',id:'test-locality-move',label:'test'};try{ap({home:'移動都市',localKind:'移動都市の周縁区'})}finally{TRACE_RESOLUTION=movePrevious}
 if(S.fl.infection_community_rumor_current_area!==0||S.fl.infection_housing_rumor_current_home!==0||S.fl.infection_community_rumor!==history)throw Error('moving homes must clear local knowledge and preserve the life history');
 if(!infectionAwarenessEntries(S).includes(rumorRecord)||rumorRecord.region!==origin.region||rumorRecord.placeId!==origin.placeId||(origin.placeId&&S.local?.placeId===origin.placeId))throw Error('a former residence awareness record followed the protagonist or lost its origin');
 S.ob=60;
 const applyChoice=(id,choiceIndex,outcomeIndex=0)=>{const row=event(id),effect=row?.c?.[choiceIndex]?.o?.[outcomeIndex]?.[2];if(!effect)throw Error('missing infection-awareness choice '+id+'/'+choiceIndex);const previous=TRACE_RESOLUTION;TRACE_RESOLUTION={kind:'choice',id,label:row.c[choiceIndex].l};try{ap(effect)}finally{TRACE_RESOLUTION=previous}};
 const question=event('infection_visible_crystal_question');if(!question||question.c.length!==3)throw Error('visible-crystal question route is incomplete');
 applyChoice(question.id,1);
 const suspected=infectionAwarenessEntries(S).find(row=>row.source==='direct-question'&&row.audience==='clinic-waiting-room');
 if(!suspected||suspected.certainty!=='suspected'||suspected.subjectMatch!=='unclear'||infectionAwarenessHas(S,'clinic-waiting-room'))throw Error('a direct question was treated as confirmed knowledge');
 applyChoice(question.id,0);
 if(!infectionAwarenessHas(S,'clinic-waiting-room'))throw Error('voluntary diagnosis disclosure was not distinct from a direct question');
 const scope=event('infection_diagnosis_disclosure_scope');if(!scope||scope.c.length!==3)throw Error('voluntary disclosure scope choices are incomplete');
 applyChoice(scope.id,1);
 const publication=infectionAwarenessEntries(S).find(row=>row.source==='self-publication'&&row.audience==='public');
 if(!publication||publication.certainty!=='published'||publication.subjectMatch!=='unclear'||infectionAwarenessHas(S,'public')||!infectionAwarenessHas(S,'public',{includePublication:true}))throw Error('a public posting was treated as proof that anyone read it');
 const school=event('infection_school_disclosure');
 if(school?.c?.[0]?.o?.[0]?.[2]?.infectionAwarenessAction?.audience!=='school-contact'||school.c[0].o[0][2].infectionAwarenessAction.recipientRef!=='current-teacher')throw Error('a disclosure to one teacher was recorded as school-wide knowledge');
 const relativeState={...S,infectionAwareness:null,siblings:[{id:'awareness-test-sibling',inf:1}],eventRelativeId:'awareness-test-sibling'},
  relativeRows=recordInfectionAwarenessActions(relativeState,[
   {subject:'sibling',audience:'subject',certainty:'confirmed',source:'medical-consultation',consent:'unclear',recipientRef:'current-clinic'},
   {subject:'sibling',audience:'household',certainty:'confirmed',source:'family-disclosure',consent:'unclear',recipientRef:'current-household'},
   {subject:'sibling',audience:'medical-service',certainty:'confirmed',source:'medical-consultation',consent:'unclear',recipientRef:'current-clinic'}
  ]);
 if(relativeRows.length!==3||relativeRows.some(row=>row.subject!=='relative'||row.subjectId!=='awareness-test-sibling')||new Set(relativeRows.map(row=>row.audience)).size!==3)throw Error('relative infection awareness scopes were merged or misattributed');
 const parentId='awareness-test-parent',parentState={...S,infectionAwareness:null,par:{fa:{id:parentId,inf:1},mo:null},eventRelativeId:parentId},
  parentRow=recordInfectionAwarenessAction(parentState,{subject:'parent',audience:'subject',certainty:'confirmed',source:'medical-consultation',consent:'unclear',recipientRef:'current-clinic'});
 if(parentRow.subjectId!==parentId||parentRow.subject!=='relative')throw Error('parent infection awareness lost the person identity');
 const formerSpouseId='awareness-test-former-spouse',formerSpouseState={...S,infectionAwareness:null,sp:null,eventRelativeId:null,relationshipHistory:[{id:formerSpouseId,inf:1,endedYear:S.year,ending:'離婚'}]},
  formerSpouseRow=recordInfectionAwarenessAction(formerSpouseState,{subject:'spouse',audience:'protagonist',certainty:'confirmed',source:'relative-disclosure',consent:'voluntary'});
 if(formerSpouseRow.subjectId!==formerSpouseId)throw Error('a spouse disclosure followed by divorce lost its subject');
 const snapshot=makeResumeSnapshot(),restored=normalizeResumeImport(JSON.parse(JSON.stringify(snapshot)));
 if(JSON.stringify(restored.S.infectionAwareness)!==JSON.stringify(S.infectionAwareness))throw Error('same-version save restore lost infection awareness history');
 S.infectionAwareness.entries.push({...suspected,certainty:'confirmed',sourceEventId:'invalid-confirmed-question'});
 const invalidAudit=auditLifeState(S);S.infectionAwareness.entries.pop();
 if(!invalidAudit.some(problem=>problem.includes('感染認知')))throw Error('state audit accepted an unverified direct question as confirmed');
 const problems=auditLifeState(S);if(problems.length)throw Error('state audit: '+problems.slice(0,6).join('/'));
 return{passed:true,familyDisclosureNotRequired:true,unverifiedRumorSeparatedFromConfirmedDiagnosis:true,disclosureScopeAndPublicationSeparated:true,relativeKnowledgeSeparatedByAudience:true,parentAndFormerSpouseSubjectsPreserved:true,schoolDisclosureLimitedToTeacher:true,housingFollowupTiedToCurrentHome:true,clinicEventTiedToCurrentCommunity:true,localKnowledgeClearedOnMove:true,lifeRumorHistoryPreserved:true,sameVersionAwarenessRestore:true,auditRejectsFalseCertainty:true,auditErrors:problems.length};
})()`,ctx,{timeout:30000});
assert.equal(result.passed,true);console.log(JSON.stringify(result,null,2));
