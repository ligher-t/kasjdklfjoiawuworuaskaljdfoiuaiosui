'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const fresh=(id,region,seed,age)=>setup(ctx,{id,region,seed,age});
const run=fn=>JSON.parse(vm.runInContext(
  'JSON.stringify(('+fn.toString()+')())',ctx,{timeout:20000}));

// D07: a paid old school, evidence-backed institutional transfer and
// separately paid difference are distinct invoice and enrollment episodes.
fresh('p15-D07','レム・ビリトン',150107,20);
const transfer=run(function(){
  const s=S;s.age=20;s.year=1095;s.by=1075;s.mo=0;
  s.cash=2000000;s.house.cash=0;
  s.res=REG.find(x=>x.n==='レム・ビリトン');
  s.home='固定集落';
  s.local={kind:'工業・採掘地域',city:null,
    placeId:'p15-d07-school-area',districtId:'p15-d07-district',
    access:0.98,hazard:0};
  s.k=80;if(s.socialLearning)s.socialLearning.literacy=85;
  ensureResidenceIdentity(s);
  const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld,
    oldSchool=educationRegisterInstitution(w,area,'p15-D07-old','general_upper',
      ['upper'],s.year),
    oldOffering=w.offerings[oldSchool.offeringIds[0]];
  educationStart(s,'upper',1,'p15-D07-signed-initial-enrollment');
  s.educationPath.institutionId=oldSchool.id;
  s.educationPath.campusId=oldOffering.campusId;
  s.educationPath.offeringId=oldOffering.id;
  const oldEnrollment=s.educationRecord.enrollments.at(-1);
  educationBindFormalEnrollment(s,oldEnrollment.id);
  const oldPlacement=s.educationPlacements.currentPlacementId;
  const first=educationEnsureTuitionInvoice(s,s.educationPath,s.year);
  const oldPosted=educationSettleInvoice(s,first);
  educationFinanceProjectInvoice(s,first);
  const originalCost=first.net;
  const newSchool=educationRegisterInstitution(w,area,'p15-D07-new',
    'general_upper',['upper'],s.year),
    newOffering=w.offerings[newSchool.offeringIds[0]];
  newOffering.annualFeeOverride=originalCost+11000;
  newOffering.priceBasis='final-base';
  s.mo=7;
  for(let month=1;month<=6;month++)
    educationRecordAttendance(s,{enrollmentId:oldEnrollment.id,
      placementId:oldPlacement,year:s.year,month,personalAccess:1,
      evidenceRef:'p15-D07-old-attendance-'+month});
  const attempt=educationTransferToApprovedInstitution(s,'p15-D07-approval');
  const approval={
    approved:true,sourceRef:'p15-D07-receiving-school-signed',
    recognitionRef:'p15-D07-credit-recognition',
    fundingClearanceRef:'p15-D07-tuition-recognition',
    creditRecognitionStatus:'approved',
    tuitionRecognitionStatus:'approved',
    fromEnrollmentId:oldEnrollment.id,toOfferingId:newOffering.id,
    effectiveFrom:{year:s.year,month:7}
  };
  s.educationTransferApprovals={'p15-D07-approval':approval};
  const missingDifferential=educationTransferToApprovedInstitution(s,'p15-D07-approval');
  const difference=educationFunds(s,'upper',1,newOffering.id)-originalCost;
  const diffInvoice=educationEnsureInvoice(s,{
    id:'p15-D07-differential',kind:'tuition',personId:'protagonist',
    offeringId:newOffering.id,institutionId:newSchool.id,
    amount:difference,serviceYear:s.year
  });
  const newPosted=educationSettleInvoice(s,diffInvoice);
  approval.feeInvoiceId=diffInvoice.id;
  const moved=educationTransferToApprovedInstitution(s,'p15-D07-approval');
  const replay=educationTransferToApprovedInstitution(s,'p15-D07-approval');
  const next=s.educationPath.currentEnrollmentId,
    newPlacement=s.educationPlacements.currentPlacementId;
  s.mo=12;
  for(let month=7;month<=12;month++)
    educationRecordAttendance(s,{enrollmentId:next,placementId:newPlacement,
      year:s.year,month,personalAccess:1,
      evidenceRef:'p15-D07-new-attendance-'+month});
  const credit=educationSettleCompletedAcademicYear(s,s.year);
  const receipts=Object.values(s.educationFinance.receipts),
    invoices=Object.values(s.educationFinance.invoices);
  return {
    oldPosted:!!oldPosted,newPosted:!!newPosted,
    initiallyBlocked:attempt===null&&missingDifferential===null,
    difference,moved:!!moved,replayBlocked:replay===null,
    oldStatus:oldEnrollment.status,
    oldSuccessor:oldEnrollment.successorEnrollmentId===next,
    newStatus:moved?.status,newDifferent:next!==oldEnrollment.id,
    oldPaid:first.status==='paid',newPaid:diffInvoice.status==='paid',
    oldInvoiceCount:invoices.filter(x=>x.id===first.id).length,
    differentialCount:invoices.filter(x=>x.id===diffInvoice.id).length,
    oldCashOutflow:receipts.filter(x=>x.invoiceId===first.id)
      .reduce((n,x)=>n+x.amount,0),
    differentialOutflow:receipts.filter(x=>x.invoiceId===diffInvoice.id)
      .reduce((n,x)=>n+x.amount,0),
    tuitionTotal:educationAnnualOutflow(s,s.year,'personal'),
    credited:credit.credited,equivalent:credit.equivalent,
    sourceMonths:credit.sourceMonthKeys.length,
    activeEnrollments:s.educationRecord.enrollments.filter(x=>
      x.status==='enrolled').length,
    schoolRecords:educationAttendanceInvariants(s),
    financeRecords:educationCheckFinanceInvariants(s)
  };
});
assert.equal(transfer.oldPosted,true);
assert.equal(transfer.newPosted,true);
assert.equal(transfer.initiallyBlocked,true);
assert.equal(transfer.difference,11000);
assert.equal(transfer.moved,true);
assert.equal(transfer.replayBlocked,true);
assert.equal(transfer.oldStatus,'transferred');
assert.equal(transfer.oldSuccessor,true);
assert.equal(transfer.newStatus,'enrolled');
assert.equal(transfer.newDifferent,true);
assert.equal(transfer.oldPaid,true);
assert.equal(transfer.newPaid,true);
assert.equal(transfer.oldInvoiceCount,1);
assert.equal(transfer.differentialCount,1);
assert.equal(transfer.differentialOutflow,11000);
assert.equal(transfer.tuitionTotal,transfer.oldCashOutflow+11000);
assert.equal(transfer.credited,true);
assert.equal(transfer.equivalent,12);
assert.equal(transfer.sourceMonths,12);
assert.equal(transfer.activeEnrollments,1);
assert.deepEqual(transfer.schoolRecords,[]);
assert.deepEqual(transfer.financeRecords,[]);

// D10: the primary-stage model has zero tuition. Two siblings pay distinct,
// school-specific materials charges through the parent's actual wallet.
fresh('p15-D10','シラクーザ',150110,38);
const siblings=run(function(){
  const s=S;s.mo=4;s.cash=100000;s.house.cash=0;
  s.kids=[{id:'p15-D10-a',by:s.year-8,d:0},
    {id:'p15-D10-b',by:s.year-10,d:0}];
  educationSynchronizeDependents(s);
  const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld,
    school=educationRegisterInstitution(w,area,'p15-D10-shared-primary',
      'general_primary',['primary'],s.year),
    off=w.offerings[school.offeringIds[0]];
  const persons=['p15-D10-a','p15-D10-b'],enrollments=[],receipts=[];
  const parentBefore=s.cash;
  for(let i=0;i<2;i++){
    const personId=persons[i],tag=i?'b':'a';
    educationDependentResidenceUpdate(s,{personId,
      kind:'family-home',region:s.res.n,areaId:area,
      effectiveAt:{year:s.year,month:4},sourceEventId:'d10-residence-'+tag,
      reportedToProtagonist:true,
      knownAt:{year:s.year,month:4}});
    educationDependentRecordConsent(s,{personId,
      consentId:'d10-learner-'+tag,purpose:'attend',signerPersonId:personId,
      offeringId:off.id,status:'approved',
      sourceEventId:'d10-signed-learner-'+tag});
    educationDependentRecordConsent(s,{personId,
      consentId:'d10-parent-'+tag,purpose:'guardian-enrollment',
      signerPersonId:'protagonist',offeringId:off.id,status:'approved',
      sourceEventId:'d10-parent-signed-'+tag});
    educationDependentRecordSchoolDecision(s,{
      personId,applicationId:'d10-application-'+tag,
      offeringId:off.id,status:'accepted',
      sourceEventId:'d10-signed-school-offer-'+tag});
    const enrolled=educationDependentRecordEnrollment(s,{
      personId,offeringId:off.id,admissionTransactionId:'d10-application-'+tag,
      sourceEventId:'d10-joined-class-'+tag,
      personConsentId:'d10-learner-'+tag,guardianConsentId:'d10-parent-'+tag,
      confirmedAt:{year:s.year,month:4}});
    const amount=i?14000:12000;
    const invoice=educationEnsureInvoice(s,{
      id:'d10-'+tag+'-materials',kind:'school-materials',
      personId,offeringId:off.id,institutionId:school.id,
      serviceYear:s.year,amount});
    const payment=educationSettleInvoice(s,invoice);
    const replay=educationSettleInvoice(s,invoice);
    enrollments.push(enrolled);
    receipts.push({invoiceId:invoice.id,personId:invoice.personId,
      amount:invoice.paid,paid:invoice.status==='paid',
      successful:!!payment,repeat:replay?.id===payment?.id});
  }
  const before=educationSchoolStatusAt(s,off.id,s.year,4);
  s.mo=5;
  educationRecordSchoolAction(s,{effectId:'d10-shared-school-suspension',
    approved:true,basis:'explicit-simulation-site-action',
    sourceRef:'d10-school-signed-closure',institutionId:school.id,
    campusId:off.campusId,offeringId:off.id,
    effectiveFrom:{year:s.year,month:5},next:{offering:'suspended'}});
  const after=educationSchoolStatusAt(s,off.id,s.year,5);
  const observed=educationObservationDependentRows(s,{
    personIds:persons,year:s.year,month:s.mo});
  const records=persons.map(id=>educationDependentEntry(s,id));
  return {
    distinct:enrollments[0].enrollmentId!==enrollments[1].enrollmentId,
    sameSchool:enrollments[0].offeringId===enrollments[1].offeringId,
    parentNotStudent:s.educationRecord.enrollments.length===0,
    fees:receipts,spent:parentBefore-s.cash,
    annualPersonal:educationAnnualOutflow(s,s.year,'personal'),
    tuitionCount:Object.values(s.educationFinance.invoices).filter(x=>
      x.kind==='tuition').length,
    statuses:observed.map(x=>x.actualStatus),
    ids:observed.map(x=>x.actualEnrollmentId),
    credentials:records.map(x=>x.awards.length),
    beforeTeaching:before.teachingStatus,
    afterTeaching:after.teachingStatus,
    issues:educationDependentInvariants(s),
    financeIssues:educationCheckFinanceInvariants(s)
  };
});
assert.equal(siblings.distinct,true);
assert.equal(siblings.sameSchool,true);
assert.equal(siblings.parentNotStudent,true);
assert.deepEqual(siblings.fees.map(x=>x.amount),[12000,14000]);
assert(siblings.fees.every(x=>x.paid&&x.successful&&x.repeat));
assert.deepEqual(siblings.fees.map(x=>x.personId),['p15-D10-a','p15-D10-b']);
assert.equal(siblings.spent,26000);
assert.equal(siblings.annualPersonal,26000);
assert.equal(siblings.tuitionCount,0);
assert.deepEqual(siblings.statuses,['enrolled','enrolled']);
assert.notEqual(siblings.ids[0],siblings.ids[1]);
assert.deepEqual(siblings.credentials,[0,0]);
assert.equal(siblings.beforeTeaching,'teaching');
assert.equal(siblings.afterTeaching,'suspended');
assert.deepEqual(siblings.issues,[]);
assert.deepEqual(siblings.financeIssues,[]);

// D11: actual changed residence stays separate from an older parent's report.
fresh('p15-D11','イェラグ',150111,34);
const residence=run(function(){
  const s=S;s.mo=4;
  const id='p15-D11-child';
  s.kids=[{id,by:s.year-9,d:0}];
  educationSynchronizeDependents(s);
  s.local={kind:'小規模な定住地',city:null,
    placeId:'p15-d11-old-home',districtId:'p15-d11-old',
    educationAreaAnchor:'p15-d11-old-home'};
  ensureResidenceIdentity(s);
  const former=ensureEducationWorldForResidence(s);
  educationDependentResidenceUpdate(s,{personId:id,
    kind:'family-home',region:s.res.n,areaId:former,
    effectiveAt:{year:s.year,month:1},sourceEventId:'d11-known-first',
    reportedToProtagonist:true,knownAt:{year:s.year,month:1}});
  s.local={kind:'小規模な定住地',city:null,
    placeId:'p15-d11-current-home',districtId:'p15-d11-current',
    educationAreaAnchor:'p15-d11-current-home'};
  ensureResidenceIdentity(s);
  const current=ensureEducationWorldForResidence(s);
  educationDependentResidenceUpdate(s,{personId:id,
    kind:'other-parent',region:s.res.n,areaId:current,
    effectiveAt:{year:s.year,month:3},sourceEventId:'d11-unreported-move'});
  const row=educationDependentEntry(s,id);
  const snap=JSON.stringify(s),rng=s.rngState;
  const view=educationObservationDependentRows(s,{
    year:s.year,month:s.mo,personIds:[id]})[0];
  return {
    distinctAreas:former!==current,
    actualArea:row.actualResidence.educationAreaId===current,
    knownArea:row.knownResidence.educationAreaId===former,
    actualStatus:view.actualResidenceStatus,
    reportedStatus:view.knownResidenceStatus,
    knownSchool:view.knownStatus,
    enrollmentId:view.actualEnrollmentId,
    unchanged:JSON.stringify(s)===snap&&s.rngState===rng,
    issues:educationDependentInvariants(s)
  };
});
assert.equal(residence.distinctAreas,true);
assert.equal(residence.actualArea,true);
assert.equal(residence.knownArea,true);
assert.equal(residence.actualStatus,'other-parent');
assert.equal(residence.reportedStatus,'family-home');
assert.equal(residence.knownSchool,'unknown');
assert.equal(residence.enrollmentId,null);
assert.equal(residence.unchanged,true);
assert.deepEqual(residence.issues,[]);
console.log('PASS P15 D07/D10/D11: transferrable tuition, sibling enrollments and stale parent residence knowledge');
