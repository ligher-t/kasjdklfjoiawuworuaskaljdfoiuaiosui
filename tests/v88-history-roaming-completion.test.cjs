"use strict";
const assert=require("node:assert/strict"),path=require("node:path"),vm=require("node:vm");
const {ctx}=require("./support/annual-cases.cjs").context(path.resolve(__dirname,".."));
const run=code=>JSON.parse(vm.runInContext("JSON.stringify((()=>{"+code+"})())",ctx,{timeout:25000}));
function fresh(seed=99101){run(`born({seed:${seed},by:1067,region:'クルビア'});S.year=1099;S.age=32;S.mo=6;
 HL=1;AU='r';S.cash=100000000;S.house.cash=100000000;S.residenceArrangement='independent_rental';S.fl.household_separated=1;return true;`);}
const scope=run(`let checked=0,death=0,closed=0;const list=EV.filter(e=>e.id.startsWith('timeline_'));
 for(const e of list){const h=HIST.find(x=>x.flag===e.timelineFlag),sc=e.historicalScene;
   const region=sc.region||(sc.regions||[])[0]||[...(h.localRegions||[]),h.localRegion].find(x=>REG.some(r=>r.n===x))||'クルビア';
   born({seed:12000+checked,by:h.y-32,region});S.year=h.y;S.age=32;S.mo=h.availableFromMonth||1;
   S.res=REG.find(x=>x.n===region);S.cash=10000000;S.house.cash=10000000;
   if(sc.city){S.home='移動都市';S.local={...makeLocality(S.home,region),city:sc.city};}
   S.world.events[h.flag]=h.y;S.infoLog=[{id:h.flag,heardYear:S.year,heardMonth:S.mo}];
   if(sc.siteId)S.historicalAccess=[{siteId:sc.siteId,personId:'protagonist',year:S.year,month:S.mo,evidenceRef:'verified-direct-visit'}];
   const before=JSON.stringify(S),proof=historicalSceneEligibility(e,S);
   if(before!==JSON.stringify(S))throw Error(e.id+' mutated state');
   if(sc.delivery==='suspended'){if(proof.eligible||!sc.reason)throw Error(e.id+' unreviewed suspension');closed++;}
   else if(sc.delivery!=='journey'&&!proof.eligible)throw Error(e.id+' positive '+proof.reason);
   if(proof.eligible&&!elig(e,S,tags(S)))throw Error(e.id+' ordinary eligibility disagrees with valid scene');
   if(e.c?.some(c=>c.o.some(o=>o[2].d))){death++;if(!['direct','suspended'].includes(sc.delivery))throw Error(e.id+' reported death');}
   S.year=h.y-1;if(historicalSceneEligibility(e,S).eligible)throw Error(e.id+' early');
   if(sc.delivery==='direct'){
     S.year=h.y;S.mo=h.availableFromMonth||1;S.local.city='無関係な都市';
     if(historicalSceneEligibility(e,S).eligible)throw Error(e.id+' wrong city');
   }
   S.year=sc.through[0]+1;S.mo=1;if(historicalSceneEligibility(e,S).eligible)throw Error(e.id+' replay');
   checked++;
 }
 return {checked,death,closed,ledger:HISTORICAL_SCOPE_LEDGER.length,unknownSui:HISTORICAL_SCOPE_LEDGER.find(x=>x.flag==='sui_1102').cities};`);
assert.equal(scope.checked,40);assert.equal(scope.closed,5);assert.equal(scope.ledger,37);assert.deepEqual(scope.unknownSui,[]);

// Every checkpoint originates from a registered individual route, not a world flag.
fresh();
assert.deepEqual(run(`const s=S,route=travelCorridors(s).find(x=>x.checkpoint),old=s.res.n;
 const j=travelStart(s,{purpose:'wandering',destinationRegion:route.toRegion,corridorId:route.id,prepayReturn:true});
 travelDepart(s);s.mo=7;advanceJourneyThrough(s,1099,7);
 const at=j.status,early=travelCheckpointCan(s,'pass');s.world.events.world_1099=1099;
 const eligible=historicalSceneEligibility(EV.find(x=>x.id==='timeline_world_1099'),s).eligible;
 travelCheckpointAction(s,'wait');s.mo=8;advanceJourneyThrough(s,1099,8);
 const offered=s.travelState.permits[j.permitInquiry.permitId].status,before=s.cash;
 travelAcceptPermit(s);travelAcceptPermit(s);const once=before-s.cash===route.checkpoint.permitFee;
 travelCheckpointAction(s,'pass');s.mo=9;advanceJourneyThrough(s,1099,9);
 return {at,early,eligible,offered,once,arrival:j.status,home:s.res.n===old,
   checkpoint:!!j.legs[0].checkpointPassedAt,issues:auditTravelState(s),stopRegion:s.travelState.journeyMonthLedger[j.id+':1099:7'].region};`),
 {at:'at-checkpoint',early:false,eligible:true,offered:'offered',once:true,arrival:'arrived',home:true,checkpoint:true,issues:[],stopRegion:'クルビア'});
fresh();
assert.deepEqual(run(`const s=S,r=travelCorridors(s).find(x=>x.checkpoint),j=travelStart(s,{purpose:'wandering',destinationRegion:r.toRegion,corridorId:r.id});
 travelDepart(s);s.mo=7;advanceJourneyThrough(s,1099,7);const before=s.cash;travelCheckpointAction(s,'detour');
 s.mo=8;advanceJourneyThrough(s,1099,8);return {arrival:j.status,paid:before-s.cash-r.checkpoint.detourFee,
   marked:!!j.legs[0].detourId,notPassed:!j.legs[0].checkpointPassedAt,issues:auditTravelState(s)};`),
 {arrival:'arrived',paid:run(`return travelStayQuote(S,travelCurrentJourney(S).destinationRegion).amount;`),marked:true,notPassed:true,issues:[]});

// No in-transit cancellation teleports a traveler home; returning is another leg.
fresh();
assert.deepEqual(run(`const s=S,to=MIGRATION_ROUTES[s.res.n][0].n,j=travelStart(s,{purpose:'wandering',destinationRegion:to,durationMonths:3,prepayReturn:true});
 travelDepart(s);travelBeginReturn(s);const before=travelPresence(s).mode;s.mo=7;advanceJourneyThrough(s,1099,7);
 travelEnd(s,'returned-home');return {before,status:j.status,active:s.travelState.activeJourneyId,issues:auditTravelState(s)};`),
 {before:'in-transit',status:'returned-home',active:null,issues:[]});

// The prepaid return receipt must not pay for an unrelated onward leg.
fresh();
assert.deepEqual(run(`const s=S,to=MIGRATION_ROUTES[s.res.n][0].n,j=travelStart(s,{purpose:'wandering',destinationRegion:to,prepayReturn:true});
 travelDepart(s);s.mo=7;advanceJourneyThrough(s,1099,7);const r=travelCorridors(s,to).find(x=>x.toRegion!==j.originRegion&&
   (MIGRATION_ROUTES[x.toRegion]||[]).some(z=>z.n===to)),before=s.cash;
 if(!r)throw Error('fixture has no onward link');
 travelContinue(s,r.toRegion,r.id);const charged=before-s.cash===travelLegFareQuote(s,to,r.toRegion).amount,
 distinct=j.legs[1].id!==j.returnReservation.legId;
 s.mo=8;advanceJourneyThrough(s,1099,8);travelBeginReturn(s);s.mo=9;advanceJourneyThrough(s,1099,9);
 travelBeginReturn(s);s.mo=10;advanceJourneyThrough(s,1099,10);travelEnd(s,'returned-home');
 return {charged,distinct,ended:j.status,issues:auditTravelState(s)};`),
 {charged:true,distinct:true,ended:'returned-home',issues:[]});

// A real reached stop supplies work; earnings require later months worked there.
fresh();
assert.deepEqual(run(`const s=S,to=MIGRATION_ROUTES[s.res.n][0].n,j=travelStart(s,{purpose:'work',destinationRegion:to});
 travelDepart(s);s.mo=7;advanceJourneyThrough(s,1099,7);travelStayInquiry(s);
 if(j.workOffer.status!=='offered')throw Error('fixed service fixture has no job');travelTakeLocalWork(s);
 const before=s.cash,pay=j.localWork.monthlyPay;s.mo=8;advanceJourneyThrough(s,1099,8);advanceJourneyThrough(s,1099,8);
 const income=Object.values(s.travelState.transactions).filter(x=>x.kind==='income');
 s.flow={year:1100,income:{},expense:{},net:0};s.inc=0;travelProjectAnnualOutflow(s,1100,'personal');const net=s.flow.net;
 travelProjectAnnualOutflow(s,1100,'personal');return {months:income.length,pay:income[0].amount===pay,
   cash:before-s.cash===travelStayQuote(s,to).amount-pay,netStable:net===s.flow.net,issues:auditTravelState(s)};`),
 {months:1,pay:true,cash:true,netStable:true,issues:[]});

// Family travels only after an explicit individual agreement; the home school stays.
fresh();
assert.deepEqual(run(`const s=S,to=MIGRATION_ROUTES[s.res.n][0].n;s.kids=[{id:'travelling-child',nm:'子',by:1089,d:0,householdStatus:'supported'}];
 const a=travelCompanionAgreement(s,['travelling-child'],to),before=s.cash;
 const j=travelStart(s,{purpose:'family',destinationRegion:to,companionAgreementId:a.id});travelDepart(s);
 const fare=travelLegFareQuote(s,j.originRegion,to).amount,stay=travelStayQuote(s,j.originRegion).amount;
 const paid=before-s.cash===2*(fare+stay),childAway=travelAwayDuringMonth(s,1099,6,'travelling-child'),
   otherAway=travelAwayDuringMonth(s,1099,6,'other-child');
 s.mo=7;advanceJourneyThrough(s,1099,7);travelStayInquiry(s);const known=j.stayOffer.localityKey;
 travelSettle(s);const moves=s.moves.length,cash=s.cash;
 let again=false;try{travelSettle(s);}catch{again=true;}
 return {paid,childAway,otherAway,region:s.res.n===to,settled:j.status,onlyOnce:moves===s.moves.length&&cash===s.cash,
   known:s.local.placeId===known,school:s.educationRecord.enrollments.length,issues:auditTravelState(s)};`),
 {paid:true,childAway:true,otherAway:false,region:true,settled:'completed',onlyOnce:true,known:true,school:0,issues:[]});

// Unknown destinations remain unknown; a domestic ferry is not a border crossing.
fresh();
assert.deepEqual(run(`born({seed:88171,by:1067,region:'シエスタ'});S.year=1097;S.mo=7;S.age=30;S.cash=10000000;
 S.residenceArrangement='independent_rental';S.fl.household_separated=1;
 const r=travelCorridors(S).find(x=>x.passage==='sea'),j=travelStart(S,{purpose:'flight',corridorId:r.id});
 const before=!!S.fl.volcano_evacuee;travelDepart(S);S.mo=8;advanceJourneyThrough(S,1097,8);
 travelStayInquiry(S);return {domestic:j.originRegion===j.destinationRegion,checkpoint:j.legs[0].checkpointId,
 before,after:!!S.fl.volcano_evacuee,offer:!!j.stayOffer,issues:auditTravelState(S)};`),
 {domestic:true,checkpoint:null,before:false,after:true,offer:true,issues:[]});

fresh();
assert.deepEqual(run(`const s=S,r=travelCorridors(s).find(x=>x.checkpoint),j=travelStart(s,{purpose:'wandering',corridorId:r.id});
 travelDepart(s);s.mo=7;advanceJourneyThrough(s,1099,7);travelCheckpointAction(s,'wait');
 s.year=1100;s.mo=1;advanceJourneyThrough(s,1100,1);
 const reopened=travelCheckpointCan(s,'pass');travelCheckpointAction(s,'pass');s.mo=2;advanceJourneyThrough(s,1100,2);
 return {unknown:j.finalDestinationRegion,reopened,arrived:j.status,issues:auditTravelState(s)};`),
 {unknown:null,reopened:true,arrived:'arrived',issues:[]});

// New destinations need new consent, and a planned minor trip cannot outlive its guardian.
fresh();
assert.deepEqual(run(`const s=S,to=MIGRATION_ROUTES[s.res.n][0].n;s.kids=[{id:'child-next',nm:'子',by:1089,d:0}];
 const a=travelCompanionAgreement(s,['child-next'],to),j=travelStart(s,{purpose:'family',destinationRegion:to,companionAgreementId:a.id});
 travelDepart(s);s.mo=7;advanceJourneyThrough(s,1099,7);const route=travelCorridors(s,to).find(x=>x.toRegion!==to&&
   (MIGRATION_ROUTES[x.toRegion]||[]).some(r=>r.n===to)),cash=s.cash;
 let refused=false;try{travelContinue(s,route.toRegion,route.id);}catch{refused=true;}
 const unchanged=cash===s.cash&&j.status==='arrived',b=travelCompanionAgreement(s,['child-next'],route.toRegion);
 travelContinue(s,route.toRegion,route.id,{companionAgreementId:b.id});
 return {refused,unchanged,onward:j.status,issues:auditTravelState(s)};`),
 {refused:true,unchanged:true,onward:'en-route',issues:[]});

fresh();
assert.deepEqual(run(`const s=S,to=MIGRATION_ROUTES[s.res.n][0].n;s.age=14;s.by=s.year-14;
 s.care.parentKeys=['fa'];s.par.fa.d=0;s.par.fa.separated=false;
 const a=travelGuardianConsult(s,to);a.status='granted'; // explicit positive-response fixture
 const j=travelStart(s,{purpose:'study',destinationRegion:to,guardianAgreementId:a.id}),cash=s.cash;
 s.par.fa.d=s.year;let revoked=false;try{travelDepart(s);}catch{revoked=true;}
 const unchanged=cash===s.cash&&j.status==='planned';s.par.fa.d=0;travelDepart(s);s.fl.detained=1;
 s.mo=7;advanceJourneyThrough(s,1099,7);const held=j.status;s.fl.detained=0;s.mo=8;advanceJourneyThrough(s,1099,8);
 return {revoked,unchanged,escort:j.guardianEscort.guardianId,held,arrival:j.status,issues:auditTravelState(s)};`),
 {revoked:true,unchanged:true,escort:'fa',held:'en-route',arrival:'arrived',issues:[]});

// Foreign exam attendance needs this actual school, arrival and exam month; no second fare.
fresh();
assert.deepEqual(run(`const s=S,areaId=educationPrepareStudyDestinations(s)[0],w=s.world.educationWorld,
 inst=educationRegisterInstitution(w,areaId,'travel-exam-fixture','university',['university'],s.year),o=w.offerings[inst.offeringIds[0]],
 item=educationCaseBegin(s,'higher-path','university',1);
 Object.assign(item,{phase:'application',status:'active',offeringId:o.id,campusId:o.campusId,
  applicationId:item.id+':application:1',examVisitRequired:true,examAt:{year:1099,month:7}});
 const before=s.educationRecord.enrollments.length,j=travelEducationJourney(s,item.id);travelDepart(s);
 const early=travelEducationCanAttend(s);s.mo=7;advanceJourneyThrough(s,1099,7);
 const cash=s.cash,paid=educationServicePayMobility(s,{offering:o,item},'entrance-trip');
 educationServicePayMobility(s,{offering:o,item},'entrance-trip');
 return {early,receipt:paid.id===j.legs[0].id+':fare',noExtra:cash===s.cash,
 attended:item.examAttendedAt.journeyId===j.id,noEnrollment:s.educationRecord.enrollments.length===before,
 issues:auditTravelState(s)};`),
 {early:false,receipt:true,noExtra:true,attended:true,noEnrollment:true,issues:[]});

// Choosing civic participation leaves a continuing path and a later personal exit.
fresh();
assert.deepEqual(run(`const e=EV.find(x=>x.id==='timeline_columbia_independence');S.year=1019;S.age=32;S.by=987;S.mo=6;const worldBefore=JSON.stringify(S.world.events);
 ap(e.c[0].o[0][2]);S.sn[e.id]=S.year;
 const a=S.lifeRecord.affiliations.find(x=>x.id==='hist-columbia_independence'),initial=a.status,
 review=EV.find(x=>x.id==='history_path_review_columbia_independence');
 S.year=1021;S.age=34;const due=elig(review,S,tags(S));ap(review.c[1].o[0][2]);
 return {initial,due,ended:a.status,history:a.history.length>1,worldUnchanged:worldBefore===JSON.stringify(S.world.events)};`),
 {initial:'active',due:true,ended:'left',history:true,worldUnchanged:true});

// Annual exposure uses actual stops and the original home before settlement.
fresh();
assert.deepEqual(run(`const s=S,p={regions:[s.res.n],cities:null,from:1099,to:1099,war:4},
 j=travelStart(s,{purpose:'other',destinationRegion:MIGRATION_ROUTES[s.res.n][0].n});travelDepart(s);
 const unknown=travelPressureShare(s,p);s.mo=7;advanceJourneyThrough(s,1099,7);
 const away=travelPressureShare(s,p);s.mo=0;const annual=travelPressureShare(s,p);
 return {unknown,away,annual,noInventedDeathMonth:worldPressureDeathMonth(s,'戦争に伴う民間人死亡')===null};`),
 {unknown:0,away:0,annual:5/12,noInventedDeathMonth:true});

// Real fatal dispatch produces a dated exposure; a remote pending choice is discarded.
fresh();
assert.deepEqual(run(`born({seed:66171,by:1067,region:'ウルサス'});S.year=1096;S.mo=12;S.age=29;
 S.home='移動都市';S.local={...makeLocality(S.home,'ウルサス'),city:'チェルノボーグ'};
 S.world.events.chernobog_incident=1096;const source=EV.find(e=>e.id==='timeline_chernobog_incident_local'),
 oldRandom=DEBUG_RANDOM,oldAU=AU;try{DEBUG_RANDOM=()=>0.99;AU='r';fire({...source,c:[source.c[0]]},S,tags(S));}
 finally{DEBUG_RANDOM=oldRandom;AU=oldAU;}
 const x=S.deathHistorical;return {dead:!!S.dead,event:x?.eventId,month:x?.month,
 exposure:!!x?.exposureRef,issues:auditHistoricalExposureState(S)};`),
 {dead:true,event:'timeline_chernobog_incident_local',month:12,exposure:true,issues:[]});
fresh();
assert.deepEqual(run(`S.ev={id:'timeline_chernobog_incident_local'};const cash=S.cash,
 pending=restorePendingChoice();return {pending,closed:!S.ev,unchanged:cash===S.cash&&!S.dead};`),
 {pending:false,closed:true,unchanged:true});

const {duplicateSceneKeys}=require('../tools/history-source-keys.cjs');
assert.equal(duplicateSceneKeys('({show:()=>true, /* saved */ "show":()=>false})').length,1);
assert.equal(duplicateSceneKeys('({show:true,c:[{show:false}], t:"show: nope",timelineFlag:"x"})').length,0);
assert.equal(duplicateSceneKeys('({historicalScene:{delivery:"direct"},historicalScene:{delivery:"report-response"}})').length,1);

// Exhausted funds still have an explicit, accounted physical return option.
fresh();
assert.deepEqual(run(`const s=S,j=travelStart(s,{purpose:'other',destinationRegion:MIGRATION_ROUTES[s.res.n][0].n});
 travelDepart(s);s.mo=7;advanceJourneyThrough(s,1099,7);s.cash=0;s.debt=0;
 const before=JSON.stringify(s.travelState);let blocked=false;try{travelBeginReturn(s);}catch{blocked=true;}
 const atomic=before===JSON.stringify(s.travelState);travelBeginReturn(s,{deferPayment:true});
 const receipt=s.travelState.transactions[j.legs[j.activeLegIndex].id+':fare'],debt=s.debt;
 s.mo=8;advanceJourneyThrough(s,1099,8);travelEnd(s,'returned-home');
 return {blocked,atomic,debt:debt===receipt.unpaid&&debt>0,paid:receipt.paid,ended:j.status,issues:auditTravelState(s)};`),
 {blocked:true,atomic:true,debt:true,paid:0,ended:'returned-home',issues:[]});

// Arrival-derived flags are never granted by planning or by an aborted trip.
for(const cause of ['kaz_exile','kazdel_afterfall']){
 ctx.CAUSE=cause;
 assert.deepEqual(run(`born({seed:88181,by:1062,region:'カズデル'});S.year=1094;S.age=32;S.mo=6;S.cash=10000000;
 S.residenceArrangement='independent_rental';S.fl.household_separated=1;
 const prior=TRACE_RESOLUTION;TRACE_RESOLUTION={id:CAUSE};travelIntent(S,'flight');TRACE_RESOLUTION=prior;
 const j=travelStart(S,{purpose:'flight',destinationRegion:MIGRATION_ROUTES[S.res.n][0].n});
 const before=!!S.fl.kazdel_displaced_life;travelDepart(S);S.mo=7;advanceJourneyThrough(S,1094,7);
 return {before,after:!!S.fl.kazdel_displaced_life,specific:!!S.fl[CAUSE==='kaz_exile'?'kazdel_left':'kazdel_displaced'],issues:auditTravelState(S)};`),
 {before:false,after:true,specific:true,issues:[]});
}
assert.deepEqual(run(`born({seed:88182,by:1006,region:'イベリア'});S.year=1038;S.age=32;S.mo=7;S.cash=10000000;
 S.residenceArrangement='independent_rental';S.fl.household_separated=1;S.local.ecology='沿岸の港';
 const j=travelStart(S,{purpose:'flight',destinationRegion:MIGRATION_ROUTES[S.res.n][0].n});travelDepart(S);
 const before=!!S.fl.silence_survivor;S.mo=8;advanceJourneyThrough(S,1038,8);
 return {before,after:!!S.fl.silence_survivor,issues:auditTravelState(S)};`),
 {before:false,after:true,issues:[]});
for(const abort of [false,true]){
 ctx.ABORT=abort;
 assert.deepEqual(run(`born({seed:88183,by:1067,region:'ウルサス'});S.year=1096;S.age=29;S.mo=12;S.cash=10000000;
 S.residenceArrangement='independent_rental';S.fl.household_separated=1;S.home='移動都市';
 S.local={...makeLocality(S.home,S.res.n),city:'チェルノボーグ'};
 const prior=TRACE_RESOLUTION;TRACE_RESOLUTION={id:'timeline_chernobog_incident_local'};travelIntent(S,'flight');TRACE_RESOLUTION=prior;
 const j=travelStart(S,{purpose:'flight',destinationRegion:MIGRATION_ROUTES[S.res.n][0].n});travelDepart(S);
 if(ABORT)travelBeginReturn(S);S.year=1097;S.age=30;S.mo=1;advanceJourneyThrough(S,1097,1);
 return {refugee:!!S.fl.chernobog_refugee,issues:auditTravelState(S)};`),{refugee:!abort,issues:[]});
}

// Settling in a reached home preserves the existing formal school record.
fresh();
assert.deepEqual(run(`const s=S,w=s.world.educationWorld,area=ensureEducationWorldForResidence(s),
 inst=educationRegisterInstitution(w,area,'travel-school-fixture','university',['university'],s.year),o=w.offerings[inst.offeringIds[0]];
 educationStart(s,'university',1,'signed-fixture');Object.assign(s.educationPath,{institutionId:inst.id,campusId:o.campusId,offeringId:o.id});
 const enrollment=s.educationRecord.enrollments.at(-1);educationBindFormalEnrollment(s,enrollment.id);
 const j=travelStart(s,{purpose:'other',destinationRegion:MIGRATION_ROUTES[s.res.n][0].n});travelDepart(s);
 s.mo=7;advanceJourneyThrough(s,1099,7);travelStayInquiry(s);travelSettle(s);
 const kept=s.educationRecord.enrollments.find(x=>x.id===enrollment.id);
 return {formal:kept.status,offering:s.educationPath.offeringId===o.id,arrangement:s.residenceArrangement,
 housingIssues:auditLifeState(s).filter(x=>/住居・世帯|旅程|旅先/.test(x)),issues:auditTravelState(s)};`),
 {formal:'enrolled',offering:true,arrangement:'independent_rental',housingIssues:[],issues:[]});

// Empty new fields are optional in a valid current-version save; populated state is exact.
fresh();
assert.deepEqual(run(`const s=S,to=MIGRATION_ROUTES[s.res.n][0].n,j=travelStart(s,{purpose:'work',destinationRegion:to});
 travelDepart(s);s.mo=7;advanceJourneyThrough(s,1099,7);travelStayInquiry(s);
 const before=JSON.stringify(s.travelState),cash=s.cash,rng=s.rngState,snapshot=makeResumeSnapshot();
 HL=0;play=()=>{};tab=()=>{};restorePendingChoice=()=>false;rd=()=>{};const loaded=cont(snapshot);
 return {loaded,same:before===JSON.stringify(S.travelState),cash:cash===S.cash,rng:rng===S.rngState,issues:auditTravelState(S)};`),
 {loaded:true,same:true,cash:true,rng:true,issues:[]});
console.log('PASS 37 history authorities, 40 scene windows, registered checkpoints, onward/return, work, family, settlement and real resume');
