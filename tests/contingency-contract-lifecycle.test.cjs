'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context, setup } = require('./support/annual-cases.cjs');

const { ctx } = context(path.resolve(__dirname, '..'));
const read = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())', ctx,
  { timeout: 25000 }));
setup(ctx, { id: 'contingency-contract-lifecycle', seed: 905922, region: 'サルゴン', age: 28 });

const lifecycle = read(`
  const s=S;initializeLifeSystems(s);s.cash=100000000;s.house.cash=100000000;
  const area=s.community.key,wallet=()=>s.cash+(s.house?.cash||0),workArea=occupationWorkAreaKey(s),world=s.world.occupationWorld;
  world.sites['fixture-contract-site']={siteId:'fixture-contract-site',employerId:'fixture-relief-employer',
    areaId:workArea,status:'open',label:'地区運送所'};
  s.employmentState={version:1,cases:[],episodes:[{episodeId:'fixture-contract-worker',personId:s.personId,
    employerId:'fixture-relief-employer',siteId:'fixture-contract-site',jobId:17,kind:'wage-employment',
    status:'active',startYear:s.year,startMonth:s.mo,areaId:workArea,history:[]}],
    activeEpisodeId:'fixture-contract-worker',knowledge:[]};
  s.workContract={siteId:'fixture-contract-site',jobId:17,episodeId:'fixture-contract-worker',status:'active'};
  const incident={id:'incident-contract-water',areaKey:area,region:s.res.n,kind:'water',status:'active',
    startedAt:{year:s.year,month:s.mo},metricAxis:'medical',metricDelta:0.035,impactApplied:true,
    recoveryApplied:false,repairShipmentId:null};
  s.infrastructureIncidents.items.push(incident);
  s.kids=[{id:'child-contract-fixture',age:8,d:0}];s.sp={id:'caregiver-contract-fixture',d:0,fl:{}};
  const contacted=applyContingencyContractAction(s,{action:'contact'},'life_cc_first_contact'),
    offered=applyContingencyContractAction(s,{action:'offer'},'life_cc_offer_review'),
    contract=activeContingencyContract(s),kind=contract.kind,
    accepted=applyContingencyContractAction(s,{action:'accept',targetId:contract.id},'life_cc_accept'),
    missingCarePlanRejected=applyContingencyContractAction(s,{action:'prepare',mode:'manual-work-plan',targetId:contract.id},'life_cc_preparation');
  const prepared=applyContingencyContractAction(s,{action:'prepare',mode:'family-plan',targetId:contract.id},'life_cc_preparation'),
    carePlan=contract.carePlan?.personId||null,
    expiredCaregiver=(s.sp.d=1,applyContingencyContractAction(s,{action:'depart',targetId:contract.id},'life_cc_departure')),
    departureUnavailable=lifeSystemEventEligible(s,'life_cc_departure'),
    departureChoiceAvailable=EV.find(event=>event.id==='life_cc_departure').c[0].show(s),
    deferredDeparture=applyContingencyContractAction(s,{action:'defer-departure',targetId:contract.id},'life_cc_departure'),
    statusAfterDefer=contract.status;
  s.sp.d=0;
  const rePrepared=applyContingencyContractAction(s,{action:'prepare',mode:'family-plan',targetId:contract.id},'life_cc_preparation'),
    departed=applyContingencyContractAction(s,{action:'depart',targetId:contract.id},'life_cc_departure'),
    departureStatus=contract.status,journeyId=contract.travelJourneyId,
    fundsBeforeTravel=wallet(),prematureSettlement=applyContingencyContractAction(s,
      {action:'settle',targetId:contract.id},'life_cc_payment'),fundsAfterPrematureSettlement=wallet();
  const advanceOne=()=>{const p=s.year*12+s.mo+1,oldYear=s.year;s.year=Math.floor((p-1)/12);s.mo=(p-1)%12+1;
    s.age+=s.year-oldYear;advanceJourneyThrough(s,s.year,s.mo);advanceContingencyContracts(s);};
  advanceOne();
  const arrivedStatus=travelCurrentJourney(s)?.status,contractAtSite=contract.status,
    handoff=applyContingencyContractAction(s,{action:'handoff',targetId:contract.id},'life_cc_handoff'),
    handedOff=contract.status,
    verified=applyContingencyContractAction(s,{action:'verify-receipt',targetId:contract.id},'life_cc_organization_receipt'),
    awaitingPayment=contract.status,paymentDue={...contract.paymentDueAt};
  const scheduledEvent=EV.find(event=>event.id==='life_cc_payment'),
    dueBefore=scheduledFollowupDuePeriod(scheduledEvent,s);
  s.year=paymentDue.year;s.mo=paymentDue.month;
  const dueAtPayment=scheduledFollowupDuePeriod(scheduledEvent,s),
    missingPaymentReported=applyContingencyContractAction(s,{action:'mark-payment-missing',targetId:contract.id},'life_cc_payment'),
    statusAfterMissingReport=contract.status,beforeCash=wallet(),payEffect=scheduledEvent.c[0].o[0][2],oldTrace=TRACE_RESOLUTION;
  TRACE_RESOLUTION={kind:'choice',id:'life_cc_payment',choiceIndex:0,outcomeIndex:0};
  ap(payEffect);
  const afterFirst=wallet(),paidStatus=contract.status,settlementId=contract.settlementId,
    receipts=s.employmentState.finance.receipts.filter(row=>row.kind==='gig').length,
    gigs=s.employmentState.episodes.filter(row=>row.kind==='gig').length;
  let repeatRejected=false;try{ap(payEffect);}catch(error){repeatRejected=/二重/.test(error.message);}
  TRACE_RESOLUTION=oldTrace;
  const afterRepeat=wallet(),receiptsAfterRepeat=s.employmentState.finance.receipts.filter(row=>row.kind==='gig').length;
  const actionAgain=applyContingencyContractAction(s,{action:'settle',targetId:contract.id},'life_cc_payment'),
    terminalEligible=lifeSystemEventEligible(s,'life_cc_payment');
  return {contacted,offered,kind,accepted,missingCarePlanRejected,prepared,carePlan,expiredCaregiver,
    departureUnavailable,departureChoiceAvailable,deferredDeparture,statusAfterDefer,rePrepared,departed,departureStatus,
    fundsBeforeTravel,prematureSettlement,fundsAfterPrematureSettlement,
    journeyId,arrivedStatus,contractAtSite,handoff,handedOff,verified,awaitingPayment,paymentDue,dueBefore,
    dueAtPayment,missingPaymentReported,statusAfterMissingReport,beforeCash,afterFirst,paidStatus,settlementId,receipts,gigs,repeatRejected,afterRepeat,
    receiptsAfterRepeat,actionAgain,terminalEligible,valid:isValidLifeSystemsState(s)};
`);

assert.equal(lifecycle.contacted, true);
assert.equal(lifecycle.offered, true);
assert.equal(lifecycle.kind, 'relief-logistics');
assert.equal(lifecycle.accepted, true);
assert.equal(lifecycle.missingCarePlanRejected, false, 'a dependent child needs a documented care plan before departure');
assert.equal(lifecycle.prepared, true);
assert.equal(lifecycle.carePlan, 'caregiver-contract-fixture');
assert.equal(lifecycle.expiredCaregiver, false, 'a caregiver who becomes unavailable invalidates the saved departure plan');
assert.equal(lifecycle.departureUnavailable, true, 'the event remains available so departure can be deferred or cancelled');
assert.equal(lifecycle.departureChoiceAvailable, false, 'the unavailable departure itself is not offered');
assert.equal(lifecycle.deferredDeparture, true);
assert.equal(lifecycle.statusAfterDefer, 'accepted');
assert.equal(lifecycle.rePrepared, true);
assert.equal(lifecycle.departed, true);
assert.equal(lifecycle.departureStatus, 'travelling');
assert.equal(lifecycle.prematureSettlement, false, 'acceptance or travel cannot settle the contract before verification');
assert.equal(lifecycle.fundsAfterPrematureSettlement, lifecycle.fundsBeforeTravel);
assert.match(lifecycle.journeyId, /^journey:/);
assert.equal(lifecycle.arrivedStatus, 'arrived');
assert.equal(lifecycle.contractAtSite, 'at-site');
assert.equal(lifecycle.handoff, true);
assert.equal(lifecycle.handedOff, 'awaiting-verification');
assert.equal(lifecycle.verified, true);
assert.equal(lifecycle.awaitingPayment, 'awaiting-payment');
assert.equal(lifecycle.dueBefore, null, 'payment stays unavailable before the verified due date');
assert.equal(lifecycle.dueAtPayment, lifecycle.paymentDue.year * 12 + lifecycle.paymentDue.month);
assert.equal(lifecycle.missingPaymentReported, true);
assert.equal(lifecycle.statusAfterMissingReport, 'payment-disputed');
assert.equal(lifecycle.paidStatus, 'paid');
assert.equal(lifecycle.settlementId, 'contingency:protagonist:1:assignment:settlement');
assert.equal(lifecycle.afterFirst - lifecycle.beforeCash, 12000,
  'the verified task pays its stated one-time nominal amount');
assert.equal(lifecycle.gigs, 1);
assert.equal(lifecycle.receipts, 1);
assert.equal(lifecycle.repeatRejected, true);
assert.equal(lifecycle.afterRepeat, lifecycle.afterFirst, 'a repeated settlement has no cash effect');
assert.equal(lifecycle.receiptsAfterRepeat, 1);
assert.equal(lifecycle.actionAgain, false);
assert.equal(lifecycle.terminalEligible, false);
assert.equal(lifecycle.valid, true);

setup(ctx, { id: 'contingency-skill-gate', seed: 905923, region: 'サルゴン', age: 28 });
const skillGate = read(`
  const s=S;initializeLifeSystems(s);s.cash=100000000;s.ar=40;s.artsProfile.innateBand='upper';
  const area=s.community.key,workArea=occupationWorkAreaKey(s),world=s.world.occupationWorld,
    siteId='fixture-survey-site',employerId='fixture-survey-employer';
  world.sites[siteId]={siteId,employerId,areaId:workArea,status:'open',label:'地区観測所'};
  s.employmentState={version:1,cases:[],episodes:[{episodeId:'fixture-survey-worker',personId:s.personId,
    employerId,siteId,jobId:18,kind:'wage-employment',status:'active',startYear:s.year,startMonth:s.mo,
    areaId:workArea,history:[]}],activeEpisodeId:'fixture-survey-worker',knowledge:[]};
  s.workContract={siteId,jobId:18,episodeId:'fixture-survey-worker',status:'active'};
  s.infrastructureIncidents.items.push({id:'incident-contract-route',areaKey:area,region:s.res.n,kind:'route',
    status:'active',startedAt:{year:s.year,month:s.mo},metricAxis:'transport',metricDelta:0.035,
    impactApplied:true,recoveryApplied:false,repairShipmentId:null});
  const contacted=applyContingencyContractAction(s,{action:'contact'},'life_cc_first_contact'),
    offered=applyContingencyContractAction(s,{action:'offer'},'life_cc_offer_review'),
    contract=activeContingencyContract(s),assessmentBefore=contingencySkillAssessment(s,contract),
    acceptWithoutTraining=applyContingencyContractAction(s,{action:'accept',targetId:contract.id},'life_cc_accept'),
    acceptEvent=EV.find(event=>event.id==='life_cc_accept'),
    insufficientChoiceVisible=acceptEvent.c[1].show(s),qualifiedChoiceVisible=acceptEvent.c[0].show(s),
    acceptCanReturn=acceptEvent.once!==true,
    assessmentRecorded=contract.skillAssessment?.result,
    assessmentReview=applyContingencyContractAction(s,{action:'review-eligibility',targetId:contract.id},'life_cc_accept'),
    reviewResult=contract.skillAssessment?.result;
  s.artsProfile.techSkills['unit-inspection']=10;
  const assessmentAfter=contingencySkillAssessment(s,contract),acceptEligibleAfterTraining=lifeSystemEventEligible(s,'life_cc_accept'),
    acceptAfterTraining=applyContingencyContractAction(s,
    {action:'accept',targetId:contract.id},'life_cc_accept');
  const surveyBeforeDeparture=applyContingencyContractAction(s,{action:'survey',targetId:contract.id},'life_cc_forecast_survey'),
    surveyBeforeDepartureEligible=lifeSystemEventEligible(s,'life_cc_forecast_survey'),
    prepared=applyContingencyContractAction(s,{action:'prepare',mode:'equipment',targetId:contract.id},'life_cc_preparation'),
    departed=applyContingencyContractAction(s,{action:'depart',targetId:contract.id},'life_cc_departure'),
    surveyInTransit=applyContingencyContractAction(s,{action:'survey',targetId:contract.id},'life_cc_forecast_survey');
  const advanceOne=()=>{const p=s.year*12+s.mo+1,oldYear=s.year;s.year=Math.floor((p-1)/12);s.mo=(p-1)%12+1;
    s.age+=s.year-oldYear;advanceJourneyThrough(s,s.year,s.mo);advanceContingencyContracts(s);};
  advanceOne();
  const surveyAfterFirstTravelMonth=lifeSystemEventEligible(s,'life_cc_forecast_survey'),
    stillTravelling=contract.status==='travelling';
  advanceOne();
  const surveyAtSiteEligible=lifeSystemEventEligible(s,'life_cc_forecast_survey'),
    surveyAtSite=applyContingencyContractAction(s,{action:'survey',targetId:contract.id},'life_cc_forecast_survey');
  return {contacted,offered,kind:contract.kind,requiredSkillId:contract.requiredSkillId,
    requiredSkillLevel:contract.requiredSkillLevel,aptitude:s.ar,assessmentBefore,acceptWithoutTraining,
    insufficientChoiceVisible,qualifiedChoiceVisible,assessmentRecorded,assessmentReview,reviewResult,
    assessmentAfter,acceptAfterTraining,acceptCanReturn,acceptEligibleAfterTraining,
    prepared,departed,surveyBeforeDeparture,surveyBeforeDepartureEligible,
    surveyInTransit,surveyAfterFirstTravelMonth,stillTravelling,surveyAtSiteEligible,surveyAtSite,survey:contract.survey,
    status:contract.status,valid:isValidLifeSystemsState(s)};
`);
assert.equal(skillGate.contacted, true);
assert.equal(skillGate.offered, true);
assert.equal(skillGate.kind, 'forecast-survey');
assert.equal(skillGate.requiredSkillId, 'unit-inspection');
assert.equal(skillGate.requiredSkillLevel, 10);
assert.equal(skillGate.aptitude, 40);
assert.equal(skillGate.assessmentBefore.eligible, false, 'high aptitude is not evidence of practical inspection skill');
assert.equal(skillGate.acceptWithoutTraining, false, 'the high-skill task cannot be accepted without its required skill');
assert.equal(skillGate.insufficientChoiceVisible, true);
assert.equal(skillGate.qualifiedChoiceVisible, false);
assert.equal(skillGate.acceptCanReturn, true, 'an eligibility review must not consume a still-offered contract');
assert.equal(skillGate.assessmentRecorded, 'eligibility-insufficient');
assert.equal(skillGate.assessmentReview, true);
assert.equal(skillGate.reviewResult, 'eligibility-insufficient');
assert.equal(skillGate.assessmentAfter.eligible, true);
assert.equal(skillGate.acceptAfterTraining, true, 'documented practical skill unlocks the offered task');
assert.equal(skillGate.acceptEligibleAfterTraining, true);
assert.equal(skillGate.prepared, true);
assert.equal(skillGate.surveyBeforeDeparture, false, 'field observations cannot be recorded at the offer desk');
assert.equal(skillGate.surveyBeforeDepartureEligible, false);
assert.equal(skillGate.departed, true);
assert.equal(skillGate.surveyInTransit, false, 'the inspection must wait until physical arrival');
assert.equal(skillGate.surveyAfterFirstTravelMonth, false, 'the local route disruption adds a month to the journey');
assert.equal(skillGate.stillTravelling, true);
assert.equal(skillGate.surveyAtSiteEligible, true);
assert.equal(skillGate.surveyAtSite, true);
assert.equal(skillGate.survey.result, 'observed-local-conditions');
assert.equal(skillGate.status, 'at-site');
assert.equal(skillGate.valid, true);

console.log('PASS contingency contract consent, care plan, travel, receipt, due date and one-time settlement');

setup(ctx, { id: 'contingency-organization-receipt', seed: 905924, region: 'サルゴン', age: 28 });
const organizationReceipt = read(`
  const s=S;initializeLifeSystems(s);s.cash=80000;s.house.cash=20000;s.fl.rhodes=1;
  s.lifeRecord.affiliations ||= [];s.lifeRecord.affiliations.push({id:'rhodes-staff-fixture',status:'active'});
  const area=s.community.key,workArea=occupationWorkAreaKey(s),world=s.world.occupationWorld,
    siteId='fixture-rhodes-relief-site',employerId='fixture-rhodes-relief-employer';
  world.sites[siteId]={siteId,employerId,areaId:workArea,status:'open',label:'ロドス地区連絡所'};
  s.employmentState={version:1,cases:[],episodes:[{episodeId:'fixture-rhodes-relief-worker',personId:s.personId,
    employerId,siteId,jobId:17,kind:'wage-employment',status:'active',startYear:s.year,startMonth:s.mo,
    areaId:workArea,history:[]}],activeEpisodeId:'fixture-rhodes-relief-worker',knowledge:[]};
  s.workContract={siteId,jobId:17,episodeId:'fixture-rhodes-relief-worker',status:'active'};
  s.infrastructureIncidents.items.push({id:'incident-rhodes-relief',areaKey:area,region:s.res.n,kind:'water',
    status:'active',startedAt:{year:s.year,month:s.mo},metricAxis:'medical',metricDelta:0.035,
    impactApplied:true,recoveryApplied:false,repairShipmentId:null});
  applyContingencyContractAction(s,{action:'contact'},'life_cc_first_contact');
  applyContingencyContractAction(s,{action:'offer'},'life_cc_offer_review');
  const contract=activeContingencyContract(s),receiverType=contract.receiverType,
    accepted=applyContingencyContractAction(s,{action:'accept',targetId:contract.id},'life_cc_accept'),
    prepared=applyContingencyContractAction(s,{action:'prepare',mode:'equipment',targetId:contract.id},'life_cc_preparation'),
    departed=applyContingencyContractAction(s,{action:'depart',targetId:contract.id},'life_cc_departure');
  const p=s.year*12+s.mo+1,oldYear=s.year;s.year=Math.floor((p-1)/12);s.mo=(p-1)%12+1;
  s.age+=s.year-oldYear;advanceJourneyThrough(s,s.year,s.mo);advanceContingencyContracts(s);
  const arrived=contract.status==='at-site',handedOff=applyContingencyContractAction(s,
    {action:'handoff',targetId:contract.id},'life_cc_handoff'),cashBeforeReceipt=s.cash+s.house.cash,
    verified=applyContingencyContractAction(s,{action:'verify-receipt',targetId:contract.id},'life_cc_organization_receipt'),
    cashAfterReceipt=s.cash+s.house.cash,statusAfterReceipt=contract.status;
  s.year=contract.paymentDueAt.year;s.mo=contract.paymentDueAt.month;
  const paymentEventEligible=lifeSystemEventEligible(s,'life_cc_payment');
  const deadlinePeriod=s.year*12+s.mo+1;s.year=Math.floor((deadlinePeriod-1)/12);s.mo=(deadlinePeriod-1)%12+1;
  advanceContingencyContracts(s);
  const disputedStatus=contract.status,disputeEventEligible=lifeSystemEventEligible(s,'life_cc_payment_dispute'),
    cashAfterDeadline=s.cash+s.house.cash,
    claimFiled=applyContingencyContractAction(s,{action:'dispute-payment',targetId:contract.id},'life_cc_payment_dispute');
  return {receiverType,accepted,prepared,departed,arrived,handedOff,verified,statusAfterReceipt,
    cashBeforeReceipt,cashAfterReceipt,paymentEventEligible,disputedStatus,disputeEventEligible,
    cashAfterDeadline,claimFiled,claim:contract.paymentClaim?.amount,valid:isValidLifeSystemsState(s)};
`);
assert.equal(organizationReceipt.receiverType, 'organization');
assert.equal(organizationReceipt.accepted, true);
assert.equal(organizationReceipt.prepared, true);
assert.equal(organizationReceipt.departed, true);
assert.equal(organizationReceipt.arrived, true);
assert.equal(organizationReceipt.handedOff, true);
assert.equal(organizationReceipt.verified, true);
assert.equal(organizationReceipt.statusAfterReceipt, 'awaiting-payment');
assert.equal(organizationReceipt.cashAfterReceipt, organizationReceipt.cashBeforeReceipt,
  'organizational receipt is not personal income');
assert.equal(organizationReceipt.paymentEventEligible, true);
assert.equal(organizationReceipt.disputedStatus, 'payment-disputed');
assert.equal(organizationReceipt.disputeEventEligible, true,
  'an unhandled payment deadline moves the contract into a visible dispute path');
assert.equal(organizationReceipt.cashAfterDeadline, organizationReceipt.cashBeforeReceipt,
  'an overdue payment and claim do not themselves pay the contract');
assert.equal(organizationReceipt.claimFiled, true);
assert.equal(organizationReceipt.claim, 12000);
assert.equal(organizationReceipt.valid, true);

setup(ctx, { id: 'contingency-offer-expiry', seed: 905925, region: 'サルゴン', age: 28 });
const expiry = read(`
  const s=S;initializeLifeSystems(s);const workArea=occupationWorkAreaKey(s),world=s.world.occupationWorld,
    siteId='fixture-expiry-site',employerId='fixture-expiry-employer';
  world.sites[siteId]={siteId,employerId,areaId:workArea,status:'open',label:'地区受付'};
  s.employmentState={version:1,cases:[],episodes:[{episodeId:'fixture-expiry-worker',personId:s.personId,
    employerId,siteId,jobId:17,kind:'wage-employment',status:'active',startYear:s.year,startMonth:s.mo,
    areaId:workArea,history:[]}],activeEpisodeId:'fixture-expiry-worker',knowledge:[]};
  s.workContract={siteId,jobId:17,episodeId:'fixture-expiry-worker',status:'active'};
  s.infrastructureIncidents.items.push({id:'incident-expiring-offer',areaKey:s.community.key,region:s.res.n,
    kind:'water',status:'active',startedAt:{year:s.year,month:s.mo},metricAxis:'medical',metricDelta:0.035,
    impactApplied:true,recoveryApplied:false,repairShipmentId:null});
  applyContingencyContractAction(s,{action:'contact'},'life_cc_first_contact');
  applyContingencyContractAction(s,{action:'offer'},'life_cc_offer_review');
  const contract=activeContingencyContract(s);
  for(let i=0;i<7;i++){const p=s.year*12+s.mo+1;s.year=Math.floor((p-1)/12);s.mo=(p-1)%12+1;advanceContingencyContracts(s);}
  return {status:contract.status,active:!!activeContingencyContract(s,['offered']),
    eventEligible:lifeSystemEventEligible(s,'life_cc_accept'),valid:isValidLifeSystemsState(s)};
`);
assert.equal(expiry.status, 'expired');
assert.equal(expiry.active, false);
assert.equal(expiry.eventEligible, false);
assert.equal(expiry.valid, true);
console.log('PASS organization receipt, disputed payment, and offer expiry boundaries');
