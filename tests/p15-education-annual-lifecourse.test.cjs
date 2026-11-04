'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const run=fn=>JSON.parse(vm.runInContext(
  'JSON.stringify(('+fn.toString()+')())',ctx,{timeout:25000}));
const fresh=(id,region,seed,age)=>setup(ctx,{id,region,seed,age});

// A specific, witnessed offering is registered once for each person.
// The fixture never turns a region's existence percentage into attendance.
function install(id,region,kind,stage,year,age,seed){
  fresh('p15-'+id,region,seed,age);
  ctx.P15_TERM={id,region,kind,stage,year,age};
  const row=run(function(){
    const s=S,f=P15_TERM;
    s.year=f.year;s.by=f.year-f.age;s.age=f.age;s.mo=0;
    s.res=REG.find(x=>x.n===f.region);s.home='固定集落';
    s.local={kind:f.kind,city:null,placeId:'p15-years:'+f.id,
      districtId:'p15-years-district:'+f.id,access:0.94,hazard:0.02};
    s.cash=100000000;s.house.cash=10000000;s.study=null;
    s.educationPath=null;s.fl.sch=0;s.k=82;
    if(s.socialLearning)s.socialLearning.literacy=85;
    ensureResidenceIdentity(s);
    const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld;
    const inst=educationRegisterInstitution(w,area,'witnessed-'+f.id,
      'verified_'+f.stage,[f.stage],s.year),offer=w.offerings[inst.offeringIds[0]];
    offer.admissionTier=1;
    educationStart(s,f.stage,1,'signed-enrollment-'+f.id);
    s.educationPath.institutionId=inst.id;
    s.educationPath.campusId=offer.campusId;
    s.educationPath.offeringId=offer.id;
    const enrollment=s.educationRecord.enrollments.at(-1);
    educationBindFormalEnrollment(s,enrollment.id);
    const invoice=educationEnsureTuitionInvoice(s,s.educationPath,s.year);
    const posted=educationSettleInvoice(s,invoice);
    educationFinanceProjectInvoice(s,invoice);
    return {enrollmentId:enrollment.id,stage:s.educationPath.stage,
      school:inst.id,offering:offer.id,posted:!!posted,
      invoiceId:invoice.id,paid:invoice.status==='paid'};
  });
  assert.equal(row.posted,true,id);
  assert.equal(row.paid,true,id);
  assert.equal(row.stage,stage,id);
  return row;
}

install('D12','クルビア','移動都市の居住区','primary',1093,8,151512);
const d12=run(function(){
  const s=S,m=s.educationPath,id=m.currentEnrollmentId,
    placement=s.educationPlacements.currentPlacementId,year=s.year;
  s.mo=12;
  for(let month=1;month<=12;month++)
    educationRecordAttendance(s,{enrollmentId:id,placementId:placement,
      year,month,personalAccess:month<=7?1:0,evidenceRef:'d12-person-'+month});
  const credit=educationSettleCompletedAcademicYear(s,year);
  const months=s.educationAttendance.enrollments[id][year];
  const provided=Object.values(months).reduce((n,row)=>n+
    Object.values(row.segments).reduce((sum,part)=>sum+part.schoolDelivery,0),0);
  const again=educationSettleCompletedAcademicYear(s,year);
  s.year++;s.age++;s.mo=0;educationAdvanceYear(s);
  return {equivalent:credit.equivalent,provided,
    credited:credit.credited,sameCredit:credit===again,
    yearsCompleted:m.yearsCompleted,
    nextCase:educationActiveCase(s)?.kind||null,
    awarded:s.educationRecord.awards.length,
    issues:educationAttendanceInvariants(s)};
});
assert.equal(d12.provided,12);
assert.equal(d12.equivalent,7);
assert.equal(d12.credited,false);
assert.equal(d12.sameCredit,true);
assert.equal(d12.yearsCompleted,0);
assert.equal(d12.nextCase,'interruption-review');
assert.equal(d12.awarded,0);
assert.deepEqual(d12.issues,[]);

install('D13','ウルサス','工業・採掘地域','lower',1093,13,151513);
const d13=run(function(){
  const s=S,m=s.educationPath,id=m.currentEnrollmentId,
    placement=s.educationPlacements.currentPlacementId,year=s.year,
    w=s.world.educationWorld,off=w.offerings[m.offeringId],
    campus=w.campuses[off.campusId],inst=w.institutions[off.institutionId],
    alternateId=campus.id+':recognized-temporary';
  w.campuses[alternateId]={...campus,id:alternateId,campusId:alternateId};
  inst.campusIds.push(alternateId);
  s.mo=12;
  educationRecordSchoolAction(s,{
    effectId:'p15-d13-temporary-approved',approved:true,
    basis:'explicit-simulation-site-action',
    sourceRef:'signed-six-month-temporary-classroom',
    institutionId:inst.id,campusId:campus.id,offeringId:off.id,
    effectiveFrom:{year,month:7},
    next:{campus:'inaccessible',offering:'suspended',
      learningContinuity:'alternative_classroom',alternativeCampusId:alternateId}
  });
  for(let month=1;month<=12;month++)
    educationRecordAttendance(s,{enrollmentId:id,placementId:placement,
      year,month,personalAccess:1,evidenceRef:'d13-student-'+month});
  const credit=educationSettleCompletedAcademicYear(s,year),
    first=JSON.stringify(s.educationCredits);
  s.year++;s.age++;s.mo=0;
  // The signed temporary teaching arrangement remains valid after the year.
  educationAdvanceYear(s);educationAdvanceYear(s);
  return {equivalent:credit.equivalent,credited:credit.credited,
    month7:s.educationAttendance.enrollments[id][year][7].equivalent,
    yearsCompleted:m.yearsCompleted,
    creditsCount:Object.keys(s.educationCredits.items).length,
    unchangedCredit:first===JSON.stringify(s.educationCredits),
    awards:s.educationRecord.awards.length,
    issues:educationAttendanceInvariants(s)};
});
assert.equal(d13.equivalent,10.5);
assert.equal(d13.month7,0.75);
assert.equal(d13.credited,true);
assert.equal(d13.yearsCompleted,1);
assert.equal(d13.creditsCount,1);
assert.equal(d13.unchangedCredit,true);
assert.equal(d13.awards,0);
assert.deepEqual(d13.issues,[]);

install('D14','ボリバル','小規模な定住地','upper',1093,16,151514);
const d14=run(function(){
  const s=S,m=s.educationPath,id=m.currentEnrollmentId,
    placement=s.educationPlacements.currentPlacementId,year=s.year,
    w=s.world.educationWorld,off=w.offerings[m.offeringId];
  s.mo=12;
  educationRecordSchoolAction(s,{
    effectId:'p15-d14-closure',approved:true,
    basis:'explicit-simulation-site-action',sourceRef:'signed-temporary-closure',
    institutionId:off.institutionId,campusId:off.campusId,offeringId:off.id,
    effectiveFrom:{year,month:9},
    next:{offering:'suspended'}
  });
  for(let month=1;month<=12;month++)
    educationRecordAttendance(s,{enrollmentId:id,placementId:placement,
      year,month,personalAccess:1,evidenceRef:'d14-attendee-'+month});
  const credit=educationSettleCompletedAcademicYear(s,year),
    retained=JSON.stringify(s.educationAttendance.enrollments[id][year]);
  s.year++;s.age++;s.mo=1;
  educationRecordSchoolAction(s,{
    effectId:'p15-d14-reopening',approved:true,
    basis:'explicit-simulation-site-action',sourceRef:'signed-reopening',
    institutionId:off.institutionId,campusId:off.campusId,offeringId:off.id,
    effectiveFrom:{year:s.year,month:1},
    next:{offering:'teaching',admission:'open'}
  });
  educationAdvanceYear(s);
  const before=JSON.stringify(s.educationCases);
  educationAdvanceYear(s);
  return {equivalent:credit.equivalent,credited:credit.credited,
    stage:m.stage,yearsCompleted:m.yearsCompleted,
    decision:educationActiveCase(s)?.kind||null,
    sameDecision:before===JSON.stringify(s.educationCases),
    sameEvidence:retained===JSON.stringify(s.educationAttendance.enrollments[id][year]),
    completed:m.completed.includes('upper'),
    awards:s.educationRecord.awards.length,
    issues:educationAttendanceInvariants(s)};
});
assert.equal(d14.equivalent,8);
assert.equal(d14.credited,false);
assert.equal(d14.yearsCompleted,0);
assert.equal(d14.decision,'interruption-review');
assert.equal(d14.sameDecision,true);
assert.equal(d14.sameEvidence,true);
assert.equal(d14.completed,false);
assert.equal(d14.awards,0);
assert.deepEqual(d14.issues,[]);

install('D19','炎国','移動都市の居住区','preparatory',1093,17,151519);
const d19=run(function(){
  const s=S,m=s.educationPath,id=m.currentEnrollmentId,
    placement=s.educationPlacements.currentPlacementId,
    start=s.year,credits=[],before=[];
  const snapshot=()=>({years:m.yearsCompleted,
    equivalency:m.equivalency.includes('upper'),
    graduated:m.completed.includes('preparatory'),
    credits:Object.values(s.educationCredits.items).filter(x=>x.credited).length});
  before.push(snapshot());
  for(let round=0;round<3;round++){
    s.mo=12;
    for(let month=1;month<=12;month++)
      educationRecordAttendance(s,{enrollmentId:id,placementId:placement,
        year:s.year,month,personalAccess:1,
        evidenceRef:'d19-formal:'+s.year+':'+month});
    const credit=educationSettleCompletedAcademicYear(s,s.year);
    credits.push({year:s.year,equivalent:credit.equivalent,
      credited:credit.credited,id:credit.id});
    if(round<2)before.push(snapshot());
    s.year++;s.age++;s.mo=0;
    educationAdvanceYear(s);
  }
  const end=s.educationRecord.enrollments.find(x=>x.id===id),
    after=snapshot(),againBefore=JSON.stringify({
      path:m,credits:s.educationCredits,records:s.educationRecord});
  educationAdvanceYear(s);
  return {start,credits,before,after,
    yearsCompleted:m.yearsCompleted,status:m.status,
    ends:!!end && end.status==='completed',
    noDuplicate:againBefore===JSON.stringify({
      path:m,credits:s.educationCredits,records:s.educationRecord}),
    completedEquivalency:m.equivalency.filter(x=>x==='upper').length,
    awards:s.educationRecord.awards.filter(x=>x.enrollmentId===id).length,
    certificates:(s.educationRecord.schoolCertificates||[]).filter(x=>
      x.enrollmentId===id && x.qualification==="upper-equivalency").map(x=>({
        issuer:x.issuer,sourceCredits:x.sourceCreditIds.length,
        assessmentEvidenceId:x.assessmentEvidenceId})),
    assessment:m.completionAssessment,
    issues:educationAttendanceInvariants(s)};
});
assert.deepEqual(d19.credits.map(x=>x.year),[1093,1094,1095]);
assert.deepEqual(d19.credits.map(x=>x.equivalent),[12,12,12]);
assert(d19.credits.every(x=>x.credited));
assert(d19.before.every(x=>!x.equivalency && !x.graduated));
assert.equal(d19.after.years,3);
assert.equal(d19.yearsCompleted,3);
assert.equal(d19.status,'completed');
assert.equal(d19.ends,true);
assert.equal(d19.completedEquivalency,1);
assert.equal(d19.noDuplicate,true);
assert.equal(d19.awards,0,"preparatory completion grants equivalency, not a university award");
assert.equal(d19.certificates.length,1);
assert.equal(d19.certificates[0].sourceCredits,3);
assert(d19.certificates[0].issuer.startsWith("edu-inst:"));
assert.equal(d19.certificates[0].assessmentEvidenceId,d19.assessment.evidenceRef);
assert.equal(d19.assessment.passed,true);
assert.deepEqual(d19.assessment.sourceCreditIds,d19.credits.map(x=>x.id));
assert.deepEqual(d19.issues,[]);

// D27 uses the real title resume entry, then replays only the annual
// education authority, without invoking multi-decade population simulation.
install('D27','ボリバル','小規模な定住地','primary',1095,8,151527);
const d27=run(function(){
  const s=S,m=s.educationPath,id=m.currentEnrollmentId,
    place=s.educationPlacements.currentPlacementId,year=s.year,
    w=s.world.educationWorld,off=w.offerings[m.offeringId];
  s.mo=12;
  educationRecordSchoolAction(s,{
    effectId:'p15-d27-local-school-impact',approved:true,
    basis:'explicit-simulation-site-action',sourceRef:'verified-local-school-damage',
    institutionId:off.institutionId,campusId:off.campusId,offeringId:off.id,
    effectiveFrom:{year,month:8},next:{offering:'limited'}
  });
  for(let month=1;month<=12;month++)
    educationRecordAttendance(s,{enrollmentId:id,placementId:place,
      year,month,personalAccess:1,evidenceRef:'d27-attended-'+month});
  const credit=educationSettleCompletedAcademicYear(s,year);
  s.year++;s.age++;s.mo=0;
  HL=0;AU='';sp=2;acc=0;
  play=()=>{};tab=()=>{};restorePendingChoice=()=>false;rd=()=>{};
  const state=()=>JSON.stringify({
    schoolWorld:S.world.educationWorld,attendance:S.educationAttendance,
    credits:S.educationCredits,placements:S.educationPlacements,
    finance:S.educationFinance,path:S.educationPath,
    records:S.educationRecord,cash:S.cash,houseCash:S.house.cash,
    rng:S.rngState,schoolId:off.id
  });
  const save=makeResumeSnapshot();
  const rngBefore=S.rngState;
  const restored=cont(save);
  educationAdvanceYear(S);
  const first=state();
  educationAdvanceYear(S);
  const replaySame=state()===first;
  const restoreAgain=cont(save);
  educationAdvanceYear(S);
  const second=state();
  return {credited:credit.credited,equivalent:credit.equivalent,
    restored,restoreAgain,replaySame,sameAfterRestore:first===second,
    sameRng:rngBefore===S.rngState,
    schoolPersisted:!!S.world.educationWorld.offerings[off.id],
    impactCount:S.world.educationWorld.operationalHistory.filter(x=>
      x.effectId==='p15-d27-local-school-impact').length,
    invoiceCount:Object.values(S.educationFinance.invoices).filter(x=>
      x.enrollmentId===id&&x.kind==='tuition').length,
    creditedYears:S.educationPath.yearsCompleted,
    creditRecords:Object.keys(S.educationCredits.items).length,
    issues:educationAttendanceInvariants(S)};
});
assert.equal(d27.credited,true);
assert.equal(d27.equivalent,9.5);
assert.equal(d27.restored,true);
assert.equal(d27.restoreAgain,true);
assert.equal(d27.replaySame,true);
assert.equal(d27.sameAfterRestore,true);
assert.equal(d27.sameRng,true);
assert.equal(d27.schoolPersisted,true);
assert.equal(d27.impactCount,1);
assert.equal(d27.invoiceCount,2);
assert.equal(d27.creditedYears,1);
assert.equal(d27.creditRecords,1);
assert.deepEqual(d27.issues,[]);
console.log('PASS P15 D12/D13/D14/D19/D27: annual credits, preparatory equivalency and save-replay idempotence');
