'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm'),path=require('node:path');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const fresh=(id,region,seed,age)=>setup(ctx,{id,region,seed,age});
const run=fn=>JSON.parse(vm.runInContext(
  'JSON.stringify(('+fn.toString()+')())',ctx,{timeout:20000}));

fresh('p15-D02','カズデル',151502,8);
const d02=run(function(){
  const s=S;s.year=1093;s.age=8;s.mo=3;s.res=REG.find(x=>x.n==='カズデル');
  s.local={kind:'辺境・移動の多い居住地',city:null,
    placeId:'p15-d02-frontier',districtId:'p15-d02'};
  ensureResidenceIdentity(s);
  const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld;
  const before=JSON.stringify(w.generationDecisions);
  const local=institutionOfferings(s,area,'primary').map(x=>x.id);
  s.cash=1000000;
  const after=institutionOfferings(s,area,'primary').map(x=>x.id);
  const began=educationCaseAction(s,'case:begin:primary:primary:1');
  const item=educationActiveCase(s);
  const defer=educationCaseAction(s,'case:defer');
  return {rate:educationPresenceRates('カズデル',s.local.kind).primary,
    local,after,unchanged:before===JSON.stringify(w.generationDecisions),
    began,defer,reason:item.reason,notFailed:item.reason!=='institution-refused',
    noEnrollment:s.educationRecord.enrollments.length===0};
});
assert.equal(d02.rate,0);assert.deepEqual(d02.local,[]);
assert.deepEqual(d02.after,[]);assert.equal(d02.unchanged,true);
assert.equal(d02.began,true);assert.equal(d02.defer,true);
assert.equal(d02.notFailed,true);assert.equal(d02.reason,'voluntary-defer');
assert.equal(d02.noEnrollment,true);

fresh('p15-D03','サルゴン',151503,20);
const d03=run(function(){
  const s=S;s.year=1095;s.age=20;s.mo=4;s.res=REG.find(x=>x.n==='サルゴン');
  const context=(place,designation)=>({
    kind:'固定都市の街区',city:null,placeId:'p15-d03:'+place,
    districtId:'p15-d03:'+place,educationAreaAnchor:'p15-d03:'+place,
    ...(designation?{educationDesignation:{
      id:'sargon_reform_core',approved:true,sourceRef:'explicit-test-location-record'
    }}:{})
  });
  s.local=context('ordinary',false);
  ensureResidenceIdentity(s);
  const ordinary=ensureEducationWorldForResidence(s),w=s.world.educationWorld;
  const first=Object.values(w.generationDecisions)
    .find(x=>x.scopeId===ordinary&&x.family==='core');
  s.local=context('designated',true);
  ensureResidenceIdentity(s);
  const designated=ensureEducationWorldForResidence(s);
  const second=Object.values(w.generationDecisions)
    .find(x=>x.scopeId===designated&&x.family==='core');
  return {ordinary,designated,
    ordinaryThreshold:first?.thresholds?.upper,
    specialThreshold:second?.thresholds?.upper,
    ordinaryDesignation:w.areas[ordinary]?.designation,
    specialDesignation:w.areas[designated]?.designation,
    normalRate:educationPresenceRates('サルゴン','固定都市の街区').upper,
    specialRate:educationPresenceRates('サルゴン','固定都市の街区',
      'sargon_reform_core').upper};
});
assert.notEqual(d03.ordinary,d03.designated);
assert.equal(d03.ordinaryThreshold,35);assert.equal(d03.specialThreshold,62);
assert.equal(d03.normalRate,35);assert.equal(d03.specialRate,62);
assert.equal(d03.ordinaryDesignation,null);
assert.equal(d03.specialDesignation,'sargon_reform_core');

fresh('p15-D04','クルビア',151504,20);
const d04=run(function(){
  const s=S;s.year=1095;s.age=20;s.mo=4;s.res=REG.find(x=>x.n==='クルビア');
  s.local={kind:'移動都市の居住区',city:'p15-d04',
    placeId:'city:クルビア:p15-d04',districtId:'p15-d04',
    access:0.95,hazard:0.05};
  s.home='移動都市';
  s.educationPath={status:'outside',equivalency:['upper']};s.study=null;
  ensureResidenceIdentity(s);
  const area=ensureEducationWorldForResidence(s);
  const w=s.world.educationWorld;
  const inst=educationRegisterInstitution(w,area,'a-p15-university','university',
    ['university'],s.year);
  const off=w.offerings[inst.offeringIds[0]];
  off.admissionTier=1;
  s.cash=10000000;s.house.cash=0;
  const began=educationCaseAction(s,'case:begin:higher-path:university:1');
  const item=educationActiveCase(s);
  const candidate=educationCaseCandidates(s)[0];
  const tuition=educationFunds(s,'university',1,candidate.offeringId);
  const examFee=Math.round(tuition*0.06);
  s.cash=examFee+100;
  const fundsForExam=educationPaymentPlan(s,examFee).allowed;
  const fundsForTuition=educationPaymentPlan(s,tuition).allowed;
  const before=s.cash;
  const preflight=educationCasePreflight(s,candidate);
  const selected=preflight.allowed?educationCaseAction(s,'case:select:0'):false;
  const notice=s.educationAccess.notices[item.applicationId];
  const receipts=Object.values(s.educationFinance?.receipts||{}),
    invoices=s.educationFinance?.invoices||{};
  return {began,tuition,examFee,fundsForExam,fundsForTuition,
    preflight:preflight.allowed,reasons:preflight.reasonCodes,selected,
    notice:notice?.result||null,examReceipts:receipts.filter(x=>
      invoices[x.invoiceId]?.kind==='entrance-exam').length,
    tuitionReceipts:receipts.filter(x=>
      invoices[x.invoiceId]?.kind==='tuition').length,
    cashDelta:before-s.cash,students:s.educationRecord.enrollments.length,
    awards:s.educationRecord.awards.length};
});
assert.equal(d04.began,true);assert(d04.tuition>d04.examFee);
assert.equal(d04.fundsForExam,true);assert.equal(d04.fundsForTuition,false);
assert.equal(d04.preflight,true,JSON.stringify(d04.reasons));
assert.equal(d04.selected,true);
assert(['accepted','exam-failed'].includes(d04.notice));
assert.equal(d04.examReceipts,1);assert.equal(d04.tuitionReceipts,0);
assert.equal(d04.cashDelta,d04.examFee);
assert.equal(d04.students,0);assert.equal(d04.awards,0);

fresh('p15-D29','龍門',151529,8);
const d29=run(function(){
  const s=S;s.age=8;s.year=1094;s.mo=4;s.res=REG.find(x=>x.n==='龍門');
  s.home='移動都市';s.local={city:'龍門',kind:'移動都市の居住区',
    placeId:'city:龍門:龍門',districtId:'p15-d29',access:0.8,hazard:0.1};
  ensureResidenceIdentity(s);
  const here=ensureEducationWorldForResidence(s),w=s.world.educationWorld;
  const off=institutionOfferings(s,here,'primary')[0];
  const adjacent=w.hubs[w.areas[here].educationHubId].areaIds.find(x=>x!==here);
  educationCreateMobilityState(s);
  s.educationMobility.consentRecords['p15-parent']={
    personId:'protagonist',institutionId:off.institutionId,
    purpose:'daily-commute',consenterPersonId:'fa',
    consentState:'granted',evidenceRef:'parent-signed-trip',
    validFrom:{year:s.year,month:1},validThrough:{year:s.year,month:12}};
  s.educationMobility.escortRecords['p15-escort']={
    personId:'protagonist',institutionId:off.institutionId,
    purpose:'daily-commute',escortPersonId:'fa',
    status:'verified',evidenceRef:'verified-return-escort',
    validFrom:{year:s.year,month:1},validThrough:{year:s.year,month:12}};
  s.local.educationAreaId=adjacent;
  for(const id of Object.keys(w.transportLinks))delete w.transportLinks[id];
  const id=educationLinkId(adjacent,here,'urban-transit'),[a,b]=[adjacent,here].sort();
  w.transportLinks[id]={id,endpointAreaIds:[a,b],
    routeKind:'urban-transit',travelMinutesAB:16,travelMinutesBA:18,
    transferWaitMinutes:2,riskScore:0.02,accessibility:['step-free'],
    accessibilityKnown:true,directionalAccess:{[a]:true,[b]:true},
    statusHistory:[]};
  const args={personId:'protagonist',institutionId:off.institutionId,
    campusId:off.campusId,offeringId:off.id,
    year:s.year,month:s.mo,purpose:'daily-commute'};
  const outboundAndReturn=educationCanReach(s,args);
  w.transportLinks[id].directionalAccess[here]=false;
  const noReturn=educationCanReach(s,args);
  return {outboundAndReturn:outboundAndReturn.status,
    noReturn:noReturn.status,reasons:noReturn.reasonCodes,
    schoolExists:!!w.offerings[off.id],
    admissions:Object.keys(s.educationAccess?.notices||{}).length};
});
assert.equal(d29.outboundAndReturn,'feasible');
assert(d29.reasons.includes('no-return-service'));
assert.equal(d29.schoolExists,true);
assert.equal(d29.admissions,0);

fresh('p15-D30','カズデル',151530,8);
const d30=run(function(){
  const s=S;s.age=8;s.year=1094;s.mo=0;s.res=REG.find(x=>x.n==='カズデル');
  s.home='固定集落';s.local={city:null,kind:'小規模な定住地',
    placeId:'p15-d30-verified-village',districtId:'p15-d30',
    access:0.85,hazard:0.1};
  ensureResidenceIdentity(s);
  const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld,
    inst=educationRegisterInstitution(w,area,'p15-verified-classroom',
      'general_primary',['primary'],s.year),
    off=w.offerings[inst.offeringIds[0]];
  educationStart(s,'primary',1,'p15-formal-evidence');
  const student=s.educationPath;
  student.institutionId=inst.id;student.campusId=off.campusId;student.offeringId=off.id;
  educationBindFormalEnrollment(s,s.educationRecord.enrollments.at(-1).id);
  const invoice=educationEnsureTuitionInvoice(s,student,s.year);
  educationSettleInvoice(s,invoice);
  educationFinanceProjectInvoice(s,invoice);
  s.mo=12;
  educationRecordSchoolAction(s,{
    effectId:'p15-d30-verified-suspension',approved:true,
    basis:'explicit-simulation-site-action',sourceRef:'signed-closure-notice',
    institutionId:inst.id,campusId:off.campusId,offeringId:off.id,
    effectiveFrom:{year:s.year,month:5},next:{offering:'suspended'}
  });
  const enrollmentId=student.currentEnrollmentId;
  const placementId=s.educationPlacements.currentPlacementId;
  for(let month=1;month<=12;month++)educationRecordAttendance(s,{
    enrollmentId,placementId,year:s.year,month,personalAccess:1,
    evidenceRef:'p15-d30-attendance:'+month
  });
  const credit=educationSettleCompletedAcademicYear(s,s.year);
  educationRegisterInformalProvider(s,{
    providerId:'p15-d30-household-tutor',personId:'guardian-p15-d30',
    kind:'home-literacy',areaId:area,subjectIds:['basic_literacy'],
    activeFrom:{year:s.year,month:1},evidenceRef:'witnessed-home-lesson'
  });
  const learning=educationOpenLearningPath(s,{
    modeId:'home-literacy',providerId:'p15-d30-household-tutor',
    siteRef:{region:'カズデル',areaId:area,attendanceMode:'home'},
    subjectIds:['basic_literacy'],sourceEventId:'p15-d30-home-teaching'
  });
  educationRecordLearningParticipation(s,{
    pathId:learning.pathId,year:s.year,month:12,
    attendedSessions:2,totalSessions:4,evidenceRef:'p15-d30-notebook'
  });
  return {formal:credit.equivalent,credited:credit.credited,
    school5:educationSchoolStatusAt(s,off.id,s.year,5).teachingStatus,
    learningMonths:learning.participation.length,
    awards:s.educationRecord.awards.length,
    noHistoryRewrite:educationSchoolStatusAt(s,off.id,s.year,4).teachingStatus,
    issues:educationAttendanceInvariants(s),
    informalIssues:educationNonformalInvariants(s)};
});
assert.equal(d30.formal,4);assert.equal(d30.credited,false);
assert.equal(d30.school5,'suspended');assert.equal(d30.noHistoryRewrite,'teaching');
assert.equal(d30.learningMonths,1);assert.equal(d30.awards,0);
assert.deepEqual(d30.issues,[]);assert.deepEqual(d30.informalIssues,[]);
console.log('PASS P15 D02/D03/D04/D29/D30: school identity, designated areas, exam funding, return routes and closure/self-study');
