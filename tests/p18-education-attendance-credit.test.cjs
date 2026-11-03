'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
let n=0;
const fresh=(region="龍門",age=18)=>setup(ctx,{
  id:"education-attendance-"+(++n),seed:880100+n,region,age
});
const run=fn=>JSON.parse(vm.runInContext('JSON.stringify(('+fn.toString()+')())',ctx,{timeout:20000}));
const install=()=>run(function(){
  const s=S;s.year=1094;s.age=18;s.mo=12;s.cash=20000000;
  s.res=REG.find(x=>x.n==="龍門");s.home="移動都市";
  s.local={kind:"移動都市の居住区",city:"龍門",placeId:"city:龍門:龍門",
    districtId:"district:edu-credit",access:0.8,hazard:0};
  ensureResidenceIdentity(s);const area=ensureEducationWorldForResidence(s);
  const world=s.world.educationWorld;
  const inst=educationRegisterInstitution(world,area,"I05-university","university",
    ["university"],s.year),offer=world.offerings[inst.offeringIds[0]];
  offer.admissionTier=1;
  s.mo=0;
  educationStart(s,"university",1,"i05-test-enrollment");
  const m=s.educationPath;m.institutionId=inst.id;m.campusId=offer.campusId;
  m.offeringId=offer.id;
  const record=s.educationRecord.enrollments.at(-1);
  educationBindFormalEnrollment(s,record.id);
  const invoice=educationEnsureTuitionInvoice(s,m,s.year),posting=educationSettleInvoice(s,invoice);
  educationFinanceProjectInvoice(s,invoice);
  s.mo=12;
  s.k=95;s.socialLearning.literacy=88;s.ar=50;
  return {id:record.id,placementId:s.educationPlacements.currentPlacementId,
    offeringId:offer.id,invoice:invoice.id,
    posted:!!posting,stage:m.stage,years:m.duration};
});
fresh();const metadata=install();
assert.equal(metadata.posted,true);
assert(metadata.offeringId.startsWith("edu-off:"));
assert.equal(metadata.years,3);
const nine=run(function(){
  const s=S,id=s.educationPath.currentEnrollmentId,
    placementId=s.educationPlacements.currentPlacementId;
  for(let month=1;month<=12;month++)
    educationRecordAttendance(s,{enrollmentId:id,year:s.year,month,
      placementId,personalAccess:month<=9?1:0,evidenceRef:"verified:"+month});
  const before=JSON.stringify(s.educationAttendance),credit=educationSettleCompletedAcademicYear(s,s.year);
  const replay=educationSettleCompletedAcademicYear(s,s.year);
  const unchanged=before===JSON.stringify(s.educationAttendance);
  let blocked=false;try{educationRecordAttendance(s,{
    enrollmentId:id,year:s.year,month:8,placementId,personalAccess:0,
    evidenceRef:"retroactive-attempt"
  });}catch{blocked=true;}
  return {id,credited:credit.credited,equivalent:credit.equivalent,
    status:credit.outcome,replay:replay.id===credit.id,unchanged,blocked,
    monthCount:Object.keys(s.educationAttendance.enrollments[id][s.year]).length,
    issues:educationAttendanceInvariants(s)};
});
assert.equal(nine.credited,true);
assert.equal(nine.equivalent,9);
assert.equal(nine.status,"recognized");
assert.equal(nine.replay,true);
assert.equal(nine.unchanged,true);
assert.equal(nine.blocked,true);
assert.equal(nine.monthCount,12);
assert.deepEqual(nine.issues,[]);
const yearAdvance=run(function(){
  const s=S,year=s.year,skill=s.k,literacy=s.socialLearning.literacy;
  s.year++;s.age++;s.mo=0;
  educationAdvanceYear(s);
  return {year,recognized:s.educationPath.yearsCompleted,
    last:s.educationPath.lastCreditedYear,skillUnchanged:s.k===skill,
    literacyUnchanged:s.socialLearning.literacy===literacy,
    nextInvoice:s.educationFinance.invoices[
      s.educationPath.currentEnrollmentId+":tuition:"+s.year]?.status,
    sourceRefs:s.educationPath.history.filter(x=>x.action==="advanced").map(x=>x.creditId)};
});
assert.equal(yearAdvance.recognized,1);
assert.equal(yearAdvance.last,1094);
assert.equal(yearAdvance.skillUnchanged,true);
assert.equal(yearAdvance.literacyUnchanged,true);
assert.equal(yearAdvance.nextInvoice,"paid");
assert(yearAdvance.sourceRefs[0]?.includes("credit:1094"));
fresh();install();
const eight=run(function(){
  const s=S,id=s.educationPath.currentEnrollmentId,
    placementId=s.educationPlacements.currentPlacementId;
  for(let month=1;month<=12;month++)educationRecordAttendance(s,{
    enrollmentId:id,year:s.year,month,placementId,
    personalAccess:month<=8?1:0,evidenceRef:"confirmed:"+month
  });
  const credit=educationSettleCompletedAcademicYear(s,s.year);
  s.year++;s.age++;s.mo=0;educationAdvanceYear(s);
  return {credited:credit.credited,equivalent:credit.equivalent,
    creditedYears:s.educationPath.yearsCompleted,
    pending:s.educationCases.items[s.educationCases.activeCaseId]?.phase,
    decision:s.educationDecision?.kind,
    history:s.educationPath.history.filter(x=>x.action==="credit-interrupted").length,
    repeat:educationSettleCompletedAcademicYear(s,s.year-1).id===credit.id};
});
assert.equal(eight.equivalent,8);
assert.equal(eight.credited,false);
assert.equal(eight.creditedYears,0);
assert.equal(eight.decision,"case-review");
assert.equal(eight.pending,"continuity");
assert.equal(eight.history,1);
assert.equal(eight.repeat,true);
fresh();install();
const limited=run(function(){
  const s=S,world=s.world.educationWorld,
    offer=world.offerings[s.educationPath.offeringId],
    placementId=s.educationPlacements.currentPlacementId,
    enrollmentId=s.educationPath.currentEnrollmentId;
  educationRecordSchoolAction(s,{
    effectId:"test-I05-limited",approved:true,
    basis:"explicit-simulation-site-action",sourceRef:"verified-classroom",
    institutionId:offer.institutionId,campusId:offer.campusId,
    offeringId:offer.id,effectiveFrom:{year:s.year,month:9},
    next:{offering:"limited"}
  });
  let annual=0;
  for(let month=1;month<=12;month++){
    const row=educationRecordAttendance(s,{enrollmentId,placementId,
      year:s.year,month,personalAccess:1,evidenceRef:"attended-"+month});
    annual+=row.equivalent;
  }
  const credit=educationSettleCompletedAcademicYear(s,s.year);
  return {annual,final:credit.equivalent,
    recognized:credit.credited,month9:s.educationAttendance.enrollments[enrollmentId][s.year][9].equivalent,
    month8:s.educationAttendance.enrollments[enrollmentId][s.year][8].equivalent};
});
assert.equal(limited.annual,10);
assert.equal(limited.final,10);
assert.equal(limited.month9,0.5);
assert.equal(limited.month8,1);
assert.equal(limited.recognized,true);
fresh();install();
const insufficient=run(function(){
  const s=S,world=s.world.educationWorld,
    offer=world.offerings[s.educationPath.offeringId],
    placementId=s.educationPlacements.currentPlacementId,
    enrollmentId=s.educationPath.currentEnrollmentId;
  educationRecordSchoolAction(s,{
    effectId:"test-I05-severe",approved:true,
    basis:"explicit-simulation-site-action",sourceRef:"confirmed-closure",
    institutionId:offer.institutionId,campusId:offer.campusId,
    offeringId:offer.id,effectiveFrom:{year:s.year,month:7},
    next:{offering:"suspended"}
  });
  for(let month=1;month<=12;month++)educationRecordAttendance(s,{
    enrollmentId,placementId,year:s.year,month,personalAccess:1,
    evidenceRef:"attended-"+month
  });
  const credit=educationSettleCompletedAcademicYear(s,s.year);
  return {equivalent:credit.equivalent,credited:credit.credited,
    reason:credit.outcome,tuitionPaid:educationEnsureTuitionInvoice(s,s.educationPath).status};
});
assert.equal(insufficient.equivalent,6);
assert.equal(insufficient.credited,false);
assert.equal(insufficient.reason,"insufficient-attendance");
assert.equal(insufficient.tuitionPaid,"paid");
fresh();install();
const double=run(function(){
  const s=S,world=s.world.educationWorld,
    id=s.educationPath.currentEnrollmentId,
    first=s.educationPlacements.currentPlacementId,
    institute=world.institutions[s.educationPath.institutionId],
    oldCampus=world.campuses[s.educationPath.campusId],
    campusId=oldCampus.id+":annex";
  world.campuses[campusId]={...oldCampus,id:campusId,campusId};
  institute.campusIds.push(campusId);
  const old=world.offerings[s.educationPath.offeringId],
    offerId=old.id+":annex";
  world.offerings[offerId]={...old,id:offerId,offeringId:offerId,campusId};
  institute.offeringIds.push(offerId);
  s.mo=6;
  const newPlacement=educationRecordPlacementTransfer(s,{
    enrollmentId:id,campusId,offeringId:offerId,
    evidenceRef:"signed-transfer-acceptance",recognitionRef:"approved-equivalent-credit"
  });
  const a=educationRecordAttendance(s,{enrollmentId:id,year:s.year,month:6,
    placementId:first,personalAccess:1,evidenceRef:"old-site-first-half"}),
    b=educationRecordAttendance(s,{enrollmentId:id,year:s.year,month:6,
    placementId:newPlacement.id,personalAccess:1,evidenceRef:"new-site-second-half"});
  const invalid=educationRecordPlacementTransfer(s,{
    enrollmentId:id,campusId:"invented-campus",offeringId:offerId,evidenceRef:"no",recognitionRef:"no"});
  return {newId:newPlacement.id,month:a.id===b.id?b.equivalent:null,
    numberOfSegments:Object.keys(b.segments).length,
    recognizedTransfer:newPlacement.transferRecognitionId,
    refused:invalid===null,oldRecorded:!!s.educationAttendance.enrollments[id][s.year][5]};
});
assert.equal(double.month,1);
assert.equal(double.numberOfSegments,2);
assert.equal(double.refused,true);
assert.equal(double.oldRecorded,true);
fresh();install();
const pending=run(function(){
  const s=S,id=s.educationPath.currentEnrollmentId,
    placementId=s.educationPlacements.currentPlacementId,
    before=JSON.stringify(s.educationCredits);
  educationRecordAttendance(s,{enrollmentId:id,placementId,year:s.year,
    month:1,personalAccess:1,evidenceRef:"first-month-confirmed"});
  const decision=educationSettleCompletedAcademicYear(s,s.year);
  return {decision,notStored:before===JSON.stringify(s.educationCredits)};
});
assert.equal(pending.decision.outcome,"pending");
assert.equal(pending.decision.finalizedMonths,1);
assert.equal(pending.notStored,true);
fresh();install();
const boundary=run(function(){
  const s=S,place=s.educationPlacements.currentPlacementId,
    enrollmentId=s.educationPath.currentEnrollmentId;
  for(let month=1;month<=12;month++)educationRecordAttendance(s,{
    enrollmentId,placementId:place,year:s.year,month,
    personalAccess:month<=8?1:month===9?0.5:0,
    evidenceRef:"attended-"+month
  });
  const credit=educationSettleCompletedAcademicYear(s,s.year);
  return {amount:credit.equivalent,credited:credit.credited,outcome:credit.outcome};
});
assert.equal(boundary.amount,8.5);
assert.equal(boundary.credited,false);
fresh();install();
const temporary=run(function(){
  const s=S,world=s.world.educationWorld,
    offer=world.offerings[s.educationPath.offeringId],
    old=world.campuses[offer.campusId],
    temporaryCampusId=old.id+":approved-temporary",
    institution=world.institutions[offer.institutionId],
    enrollmentId=s.educationPath.currentEnrollmentId,
    placementId=s.educationPlacements.currentPlacementId;
  world.campuses[temporaryCampusId]={...old,id:temporaryCampusId,
    campusId:temporaryCampusId,physicalStatus:"usable"};
  institution.campusIds.push(temporaryCampusId);
  educationRecordSchoolAction(s,{
    effectId:"i05-confirmed-temporary-classroom",approved:true,
    basis:"explicit-simulation-site-action",
    sourceRef:"institutional-temporary-class-recognition",
    institutionId:offer.institutionId,campusId:offer.campusId,offeringId:offer.id,
    effectiveFrom:{year:s.year,month:7},
    next:{campus:"inaccessible",offering:"suspended",
      learningContinuity:"alternative_classroom",alternativeCampusId:temporaryCampusId}
  });
  for(let month=1;month<=12;month++)educationRecordAttendance(s,{
    enrollmentId,placementId,year:s.year,month,
    personalAccess:1,evidenceRef:"verified-temporary-course:"+month
  });
  const credit=educationSettleCompletedAcademicYear(s,s.year);
  return {equivalent:credit.equivalent,credited:credit.credited,
    month7:s.educationAttendance.enrollments[enrollmentId][s.year][7].equivalent};
});
assert.equal(temporary.equivalent,10.5);
assert.equal(temporary.month7,0.75);
assert.equal(temporary.credited,true);
fresh();install();
const diploma=run(function(){
  const s=S,enrollmentId=s.educationPath.currentEnrollmentId,
    place=s.educationPlacements.currentPlacementId,
    program=s.educationPath.duration;
  for(let i=0;i<program;i++){
    s.mo=12;
    for(let month=1;month<=12;month++)educationRecordAttendance(s,{
      enrollmentId,placementId:place,year:s.year,month,
      personalAccess:1,evidenceRef:"academic-year:"+s.year+":"+month
    });
    const credit=educationSettleCompletedAcademicYear(s,s.year);
    if(!credit.credited)throw Error("Expected completed annual credit");
    s.year++;s.age++;s.mo=0;
    educationAdvanceYear(s);
  }
  const diploma=s.educationRecord.awards.find(row=>row.enrollmentId===enrollmentId);
  const clone=JSON.parse(JSON.stringify(s));
  educationAdvanceYear(s);
  return {completed:s.educationPath.status,years:s.educationPath.yearsCompleted,
    credits:Object.values(s.educationCredits.items).filter(row=>row.credited).length,
    awards:s.educationRecord.awards.filter(row=>row.enrollmentId===enrollmentId).length,
    issuer:diploma?.issuerInstitutionId,sourceCredits:diploma?.sourceCreditIds?.length,
    same:JSON.stringify(clone)===JSON.stringify(s),
    audit:educationAttendanceInvariants(s)};
});
assert.equal(diploma.completed,"completed");
assert.equal(diploma.years,3);
assert.equal(diploma.credits,3);
assert.equal(diploma.awards,1);
assert(diploma.issuer?.startsWith("edu-inst:"));
assert.equal(diploma.sourceCredits,3);
assert.equal(diploma.same,true);
assert.deepEqual(diploma.audit,[]);
fresh();install();
const noFuture=run(function(){
  const s=S,id=s.educationPath.currentEnrollmentId,
    placementId=s.educationPlacements.currentPlacementId;
  s.mo=3;
  let refused=false;try{
    educationRecordAttendance(s,{enrollmentId:id,placementId,
      year:s.year,month:4,personalAccess:1,evidenceRef:"future-month"});
  }catch{refused=true;}
  const current=educationSettleCompletedAcademicYear(s,s.year);
  const prior=JSON.stringify(s.educationCredits);
  educationEnd(s,"deceased","本人死亡","confirmed-death");
  s.dead=1;
  let afterDeath=false;try{
    educationRecordAttendance(s,{enrollmentId:id,placementId,
      year:s.year,month:3,personalAccess:1,evidenceRef:"postmortem"});
  }catch{afterDeath=true;}
  return {refused,pending:current.outcome,afterDeath,
    noNewCredit:prior===JSON.stringify(s.educationCredits)};
});
assert.equal(noFuture.refused,true);
assert.equal(noFuture.pending,"pending");
assert.equal(noFuture.afterDeath,true);
assert.equal(noFuture.noNewCredit,true);
fresh();install();
const interSchool=run(function(){
  const s=S,world=s.world.educationWorld,origin=s.local.educationAreaId,
    oldId=s.educationPath.currentEnrollmentId,
    oldPlacement=s.educationPlacements.currentPlacementId,
    first=s.educationPath.offeringId;
  const secondInst=educationRegisterInstitution(world,origin,"I05-second-university",
    "university",["university"],s.year),
    second=world.offerings[secondInst.offeringIds[0]];
  second.admissionTier=1;
  s.mo=7;
  const blocked=educationTransferToApprovedInstitution(s,"not-approved");
  for(let month=1;month<=6;month++)educationRecordAttendance(s,{
    enrollmentId:oldId,placementId:oldPlacement,year:s.year,month,
    personalAccess:1,evidenceRef:"prior-school:"+month
  });
  s.educationTransferApprovals={
    "approved-placement-1":{
      approved:true,sourceRef:"receiving-institution-signed-offer",
      recognitionRef:"approved-course-credit-read-across",
      fundingClearanceRef:"incoming-institution-school-tuition-accepted",
      creditRecognitionStatus:"approved",tuitionRecognitionStatus:"approved",
      fromEnrollmentId:oldId,toOfferingId:second.id,
      effectiveFrom:{year:s.year,month:7}
    }
  };
  const relocated=educationTransferToApprovedInstitution(s,"approved-placement-1"),
    noRepeat=educationTransferToApprovedInstitution(s,"approved-placement-1"),
    current=s.educationPath.currentEnrollmentId,
    currentPlacement=s.educationPlacements.currentPlacementId;
  s.mo=12;
  for(let month=7;month<=12;month++)educationRecordAttendance(s,{
    enrollmentId:current,placementId:currentPlacement,year:s.year,month,
    personalAccess:1,evidenceRef:"receiving-school:"+month
  });
  const credit=educationSettleCompletedAcademicYear(s,s.year),
    from=s.educationRecord.enrollments.find(x=>x.id===oldId),
    to=s.educationRecord.enrollments.find(x=>x.id===current);
  return {blocked:blocked===null,relocated:!!relocated,noRepeat:noRepeat===null,
    fromStatus:from.status,toStatus:to.status,
    beforeOffering:first!==second.id,
    oldLink:to.priorEnrollmentId===oldId,
    equivalent:credit.equivalent,credited:credit.credited,
    references:credit.sourceMonthKeys.length,
    distinct:oldId!==current,issues:educationAttendanceInvariants(s)};
});
assert.equal(interSchool.blocked,true);
assert.equal(interSchool.relocated,true);
assert.equal(interSchool.noRepeat,true);
assert.equal(interSchool.fromStatus,"transferred");
assert.equal(interSchool.toStatus,"enrolled");
assert.equal(interSchool.beforeOffering,true);
assert.equal(interSchool.oldLink,true);
assert.equal(interSchool.equivalent,12);
assert.equal(interSchool.credited,true);
assert.equal(interSchool.references,12);
assert.equal(interSchool.distinct,true);
assert.deepEqual(interSchool.issues,[]);
fresh();install();
const graduateAfterTransfer=run(function(){
  const s=S,world=s.world.educationWorld,area=s.local.educationAreaId,
    original=s.educationPath.currentEnrollmentId,
    originalPlacement=s.educationPlacements.currentPlacementId;
  for(let month=1;month<=12;month++)educationRecordAttendance(s,{
    enrollmentId:original,placementId:originalPlacement,
    year:s.year,month,personalAccess:1,evidenceRef:"first-year:"+month
  });
  educationSettleCompletedAcademicYear(s,s.year);
  s.year++;s.age++;s.mo=0;educationAdvanceYear(s);
  s.mo=7;
  for(let month=1;month<=6;month++)educationRecordAttendance(s,{
    enrollmentId:original,placementId:originalPlacement,
    year:s.year,month,personalAccess:1,evidenceRef:"second-year-before-transfer:"+month
  });
  const institute=educationRegisterInstitution(world,area,"I05-last-university",
    "university",["university"],s.year),
    offer=world.offerings[institute.offeringIds[0]];
  offer.admissionTier=1;
  s.educationTransferApprovals={
    secondYear:{
      approved:true,sourceRef:"receiving-school-approval",
      recognitionRef:"academic-credit-recognition",
      fundingClearanceRef:"tuition-invoice-transferred",
      creditRecognitionStatus:"approved",
      tuitionRecognitionStatus:"approved",
      fromEnrollmentId:original,toOfferingId:offer.id,
      effectiveFrom:{year:s.year,month:7}
    }
  };
  const transfer=educationTransferToApprovedInstitution(s,"secondYear");
  const newId=s.educationPath.currentEnrollmentId,
    newPlacement=s.educationPlacements.currentPlacementId;
  s.mo=12;
  for(let month=7;month<=12;month++)educationRecordAttendance(s,{
    enrollmentId:newId,placementId:newPlacement,year:s.year,month,
    personalAccess:1,evidenceRef:"after-transfer:"+month
  });
  const second=educationSettleCompletedAcademicYear(s,s.year);
  s.year++;s.age++;s.mo=0;educationAdvanceYear(s);
  s.mo=12;
  for(let month=1;month<=12;month++)educationRecordAttendance(s,{
    enrollmentId:newId,placementId:newPlacement,year:s.year,month,
    personalAccess:1,evidenceRef:"final-year:"+month
  });
  const third=educationSettleCompletedAcademicYear(s,s.year);
  s.year++;s.age++;s.mo=0;educationAdvanceYear(s);
  const award=s.educationRecord.awards.find(x=>x.enrollmentId===newId);
  return {transfer:!!transfer,second:second.credited,third:third.credited,
    completed:s.educationPath.status,
    creditedYears:s.educationPath.yearsCompleted,
    sourceCreditIds:award?.sourceCreditIds?.length,
    oldCredited:award?.sourceCreditIds?.some(x=>x.startsWith(original+":credit:")),
    currentIssuer:award?.issuerInstitutionId===institute.id,
    audit:educationAttendanceInvariants(s)};
});
assert.equal(graduateAfterTransfer.transfer,true);
assert.equal(graduateAfterTransfer.second,true);
assert.equal(graduateAfterTransfer.third,true);
assert.equal(graduateAfterTransfer.completed,"completed");
assert.equal(graduateAfterTransfer.creditedYears,3);
assert.equal(graduateAfterTransfer.sourceCreditIds,3);
assert.equal(graduateAfterTransfer.oldCredited,true);
assert.equal(graduateAfterTransfer.currentIssuer,true);
assert.deepEqual(graduateAfterTransfer.audit,[]);
console.log("PASS P05/P09 annual 9/12, disruptions, transfer cap, idempotence and non-anticipatory credits");
