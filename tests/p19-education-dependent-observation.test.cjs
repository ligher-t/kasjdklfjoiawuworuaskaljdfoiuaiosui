'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm');
const path=require('node:path');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
setup(ctx,{id:'p19-two-children',seed:20261104,region:'龍門',age:38});
const result=JSON.parse(JSON.stringify(vm.runInContext(`(()=>{
 const s=S;s.mo=4;s.kids=[
   {id:"p19-dependent-a",by:s.year-8,d:0},
   {id:"p19-dependent-b",by:s.year-10,d:0}
 ];
 educationSynchronizeDependents(s);
 const area=ensureEducationWorldForResidence(s),
   w=s.world.educationWorld,
   school=educationRegisterInstitution(w,area,"p19-shared-primary",
     "general_primary",["primary"],s.year),
   off=w.offerings[school.offeringIds[0]],year=s.year,month=s.mo;
 const enroll=(personId,suffix)=>{
   educationDependentResidenceUpdate(s,{personId,
     kind:suffix==="a"?"family-home":"other-parent",
     region:s.res.n,areaId:area,
     effectiveAt:{year,month},sourceEventId:"actual-residence-"+suffix,
     reportedToProtagonist:suffix==="a",
     knownAt:{year,month}});
   educationDependentRecordConsent(s,{
     personId,consentId:"learner-"+suffix,purpose:"attend",
     signerPersonId:personId,offeringId:off.id,status:"approved",
     sourceEventId:"learner-signed-"+suffix});
   educationDependentRecordConsent(s,{
     personId,consentId:"parent-"+suffix,
     purpose:"guardian-enrollment",signerPersonId:"protagonist",
     offeringId:off.id,status:"approved",sourceEventId:"parent-signature-"+suffix});
   educationDependentRecordSchoolDecision(s,{
     personId,applicationId:"admission-"+suffix,offeringId:off.id,
     status:"accepted",sourceEventId:"school-accepted-"+suffix});
   return educationDependentRecordEnrollment(s,{
     personId,offeringId:off.id,admissionTransactionId:"admission-"+suffix,
     sourceEventId:"enrollment-verified-"+suffix,
     personConsentId:"learner-"+suffix,
     guardianConsentId:"parent-"+suffix,confirmedAt:{year,month}});
 };
 const a=enroll("p19-dependent-a","a"),b=enroll("p19-dependent-b","b");
 const before=educationObservationDependentRows(s,{
   personIds:[a.personId,b.personId,"p19-unknown-dependent"]});
 educationDependentRecordFact(s,{
   personId:a.personId,factId:"parent-heard-a",
   claim:{schoolOfferingId:off.id,enrollmentId:a.enrollmentId},
   actual:false,sourceEventId:"school-reported-to-parent-a",
   observedAt:{year,month},knownAt:{year,month},
   certainty:"school-confirmed"});
 const after=educationObservationDependentRows(s,{
   year,month,personIds:[a.personId,b.personId]});
 const childB=educationDependentEntry(s,b.personId);
 const reports=childB.knownFacts.length;
 // A student's changed residence and schooling may be real while
 // the parent remains unaware.
 educationDependentRecordFact(s,{
   personId:b.personId,factId:"parent-heard-b",
   claim:"child-studies-away",sourceEventId:"reported-by-relative",
   observedAt:{year,month},knownAt:{year,month},certainty:"reported"});
 const bReported=educationObservationDependentRows(s,{
   personIds:[b.personId]})[0];
 const stateBefore=JSON.stringify(s),
   rngBefore=s.rngState,
   viewA=educationObservationDependentRows(s),
   viewB=educationObservationDependentRows(s),
   pure=stateBefore===JSON.stringify(s)&&rngBefore===s.rngState,
   repeat=JSON.stringify(viewA)===JSON.stringify(viewB);
 const resumed=normalizeResumeImport(JSON.parse(JSON.stringify(
   makeResumeSnapshot())));
 const restored=educationObservationDependentRows(resumed.S,{
   personIds:[a.personId,b.personId]});
 return {sameSchool:a.offeringId===b.offeringId,
   distinctEnrollment:a.enrollmentId!==b.enrollmentId,
   twoEnrolled:after.map(x=>x.actualStatus),
   noParentEnrolled:s.educationRecord.enrollments.length===0,
   beforeKnown:before.map(x=>x.knownStatus),
   afterKnown:after.map(x=>x.knownStatus),
   knownResidence:after.map(x=>x.knownResidenceStatus),
   unknownRow:before[2].recordStatus,
   reportedB:bReported.knownStatus,
   evidenceB:reports===0&&childB.knownFacts.length===1,
   sourceA:after[0].knowledgeSourceId,
   actualIDs:after.map(x=>x.actualEnrollmentId),
   pure,repeat,
   saveExact:JSON.stringify(restored)===
     JSON.stringify(educationObservationDependentRows(s,{
       personIds:[a.personId,b.personId]})),
   noNewSchool:Object.keys(w.institutions).filter(id=>
     id===school.id).length===1,
   invariants:educationDependentInvariants(s)};
})()`,ctx,{timeout:20000})));
assert.deepEqual(result.twoEnrolled,['enrolled','enrolled']);
assert.equal(result.sameSchool,true);
assert.equal(result.distinctEnrollment,true);
assert.equal(result.noParentEnrolled,true);
assert.deepEqual(result.beforeKnown,['unknown','unknown','unknown']);
assert.deepEqual(result.afterKnown,['reported-enrollment','unknown']);
assert.deepEqual(result.knownResidence,['family-home','unknown']);
assert.equal(result.unknownRow,'not-observed');
assert.equal(result.reportedB,'reported-education-unspecified');
assert.equal(result.evidenceB,true);
assert.equal(result.sourceA,'school-reported-to-parent-a');
assert.deepEqual(result.actualIDs,[
  'dependent-enrol:admission-a','dependent-enrol:admission-b'
]);
assert.equal(result.pure,true);
assert.equal(result.repeat,true);
assert.equal(result.saveExact,true);
assert.equal(result.noNewSchool,true);
assert.deepEqual(result.invariants,[]);
console.log('PASS P19: two children one school, separate enrollments, hidden facts, indirect report, true state and same-version resume');
