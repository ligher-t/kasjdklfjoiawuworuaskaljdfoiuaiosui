'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
let seq=0;
function fresh(age=22,region="龍門"){
 setup(ctx,{id:"p10-12-"+(++seq),seed:901250+seq,region,age});
}
function run(fn){
 return JSON.parse(vm.runInContext("JSON.stringify(("+fn.toString()+")())",ctx,{timeout:15000}));
}
function fixture(){
 return run(function(){
  const s=S;s.mo=0;s.cash=10000000;s.home="移動都市";
  ensureResidenceIdentity(s);
  const area=ensureEducationWorldForResidence(s),world=s.world.educationWorld;
  const school=educationRegisterInstitution(world,area,"p10-school-fixture",
    "university",["university"],s.year);
  const offering=world.offerings[school.offeringIds[0]];
  offering.admissionTier=1;
  educationStart(s,"university",1,"p10-teacher-fixture");
  s.educationPath.institutionId=school.id;
  s.educationPath.campusId=offering.campusId;
  s.educationPath.offeringId=offering.id;
  const enrollment=s.educationRecord.enrollments.at(-1);
  educationBindFormalEnrollment(s,enrollment.id);
  const people=educationEnsureEnrolledSchoolPeople(s,enrollment.id);
  const invoice=educationEnsureTuitionInvoice(s,s.educationPath,s.year);
  educationSettleInvoice(s,invoice);
  educationFinanceProjectInvoice(s,invoice);
  s.mo=12;
  return {area,schoolId:school.id,offeringId:offering.id,
    enrollmentId:enrollment.id,teacherId:people.teacherPersonId,
    peerId:people.peerPersonIds[0],paid:invoice.status};
 });
}
fresh();const identity=fixture();
assert.equal(identity.paid,"paid");
const recipientScopes=run(function(){
 const s=S;s.inf=1;s.fl.dg=1;
 const schoolId=s.educationPath.institutionId,
   people=educationEnsureEnrolledSchoolPeople(s,s.educationPath.currentEnrollmentId),
   teacher=people.teacherPersonId,peer=people.peerPersonIds[0];
 const before=educationRecipientInfectionKnowledge(s,{
   institutionId:schoolId,recipientKind:"institution"}).status;
 const first=educationRecordSchoolDisclosure(s,{
   institutionId:schoolId,recipientKind:"teacher",personId:teacher,
   certainty:"confirmed",source:"self-disclosure",consent:"voluntary",
   evidenceRef:"private-teacher-disclosure"
 });
 const again=educationRecordSchoolDisclosure(s,{
   institutionId:schoolId,recipientKind:"teacher",personId:teacher,
   certainty:"confirmed",source:"self-disclosure",consent:"voluntary",
   evidenceRef:"private-teacher-disclosure"
 });
 const teacherKnows=educationRecipientInfectionKnowledge(s,{
   institutionId:schoolId,recipientKind:"teacher",personId:teacher}).status,
   peerKnows=educationRecipientInfectionKnowledge(s,{
   institutionId:schoolId,recipientKind:"peer",personId:peer}).status,
   schoolKnows=educationRecipientInfectionKnowledge(s,{
   institutionId:schoolId,recipientKind:"institution"}).status,
   institutionBarrier=educationSchoolKnowsInfection(s,"university");
 const official=educationRecordSchoolDisclosure(s,{
   institutionId:schoolId,recipientKind:"institution",
   certainty:"confirmed",source:"official-notice",consent:"voluntary",
   evidenceRef:"school-official-receipt"
 });
 const after=educationRecipientInfectionKnowledge(s,{
   institutionId:schoolId,recipientKind:"institution"}).status,
   issues=educationAccessIdentityInvariants(s);
 return {before,firstId:first.sourceEventId,
  duplicate:again===first,teacherKnows,peerKnows,schoolKnows,
  institutionBarrier,after,officialRef:official.recipientRef,issues};
});
assert.equal(recipientScopes.before,"unaware");
assert.equal(recipientScopes.firstId,"private-teacher-disclosure");
assert.equal(recipientScopes.duplicate,true);
assert.equal(recipientScopes.teacherKnows,"individual-confirmed");
assert.equal(recipientScopes.peerKnows,"unaware");
assert.equal(recipientScopes.schoolKnows,"unaware");
assert.equal(recipientScopes.institutionBarrier,false);
assert.equal(recipientScopes.after,"institution-confirmed");
assert.equal(recipientScopes.officialRef,identity.schoolId);
assert.deepEqual(recipientScopes.issues,[]);
const rumor=run(function(){
 const s=S,school=s.educationPath.institutionId,
   peer=educationEnsureEnrolledSchoolPeople(s,s.educationPath.currentEnrollmentId)
     .peerPersonIds[0];
 const first=recordInfectionAwareness(s,{
   subject:"protagonist",audience:"school-contact",
   certainty:"unverified",source:"unattributed-rumor",consent:"unclear",
   subjectMatch:"unclear",recipientId:peer,
   recipientRef:school,sourceEventId:"unnamed-rumor-1"
 });
 const state=educationRecipientInfectionKnowledge(s,{
   institutionId:school,recipientKind:"peer",personId:peer}).status;
 return {status:state,source:first.source,school:
  educationRecipientInfectionKnowledge(s,{
   institutionId:school,recipientKind:"institution"}).status};
});
assert.equal(rumor.status,"individual-suspected");
assert.equal(rumor.source,"unattributed-rumor");
assert.equal(rumor.school,"institution-confirmed");
const communication=run(function(){
 const s=S,offer=s.world.educationWorld.offerings[s.educationPath.offeringId],
   teacher=Object.values(s.world.educationWorld.staff)[0].id;
 offer.instructionLanguage={
   languageId:"unknown-to-student",scriptId:"unfamiliar-script",
   evidenceRef:"verified-course-handbook",minimum:{listen:65,read:65}};
 const blocked=educationOfferingLanguageAssessment(s,offer.id,"instruction-session"),
   unassisted=educationOfferingLanguageAssessment(s,offer.id,"application-document");
 const providerDenied=(()=>{try{educationRegisterLanguageSupport(s,{
   offeringId:offer.id,languageId:"unknown-to-student",purpose:"instruction-session",
   kind:"interpreter",mode:"listen",providerPersonId:"invented-speaker",
   evidenceRef:"unsourced",start:{year:s.year,month:12},end:{year:s.year,month:12}
  });return false;}catch{return true;}})();
 educationRegisterLanguageSupport(s,{
   offeringId:offer.id,languageId:"unknown-to-student",purpose:"instruction-session",
   kind:"interpreter",mode:"listen",providerPersonId:teacher,
   evidenceRef:"teacher-interpreter-appointment",
   start:{year:s.year,month:12},end:{year:s.year,month:12}
 });
 const supported=educationOfferingLanguageAssessment(s,offer.id,"instruction-session"),
   examStillBlocked=educationOfferingLanguageAssessment(s,offer.id,"application-document"),
   future=educationOfferingLanguageAssessment(s,offer.id,"instruction-session",
     {year:s.year+1,month:1});
 return {blocked:blocked.status,unassisted:unassisted.status,
  providerDenied,supported:supported.status,supportedFraction:supported.fraction,
  examStillBlocked:examStillBlocked.status,future:future.status,
  unlearned:getLanguageSkill(s,"unknown-to-student","listen")===0,
  issues:educationAccessIdentityInvariants(s)};
});
assert.equal(communication.blocked,"blocked");
assert.equal(communication.unassisted,"blocked");
assert.equal(communication.providerDenied,true);
assert.equal(communication.supported,"understood");
assert.equal(communication.supportedFraction,1);
assert.equal(communication.examStillBlocked,"blocked");
assert.equal(communication.future,"blocked");
assert.equal(communication.unlearned,true);
assert.deepEqual(communication.issues,[]);
fresh(38);
const family=run(function(){
 const s=S;s.kids=[
   {id:"relative-child-p11-a",by:s.year-8,d:0},
   {id:"relative-child-p11-b",by:s.year-11,d:0}
 ];
 const added=educationSynchronizeDependents(s),addedAgain=educationSynchronizeDependents(s);
 const first=educationDependentEntry(s,"relative-child-p11-a"),
   second=educationDependentEntry(s,"relative-child-p11-b");
 const area=ensureEducationWorldForResidence(s);
 const school=educationRegisterInstitution(s.world.educationWorld,area,
   "p11-family-primary","general_primary",["primary"],s.year);
 const offering=s.world.educationWorld.offerings[school.offeringIds[0]];
 const before=s.educationRecord.enrollments.length;
 const recordBlocked=(()=>{try{
   educationDependentRecordEnrollment(s,{
    personId:first.personId,offeringId:offering.id,
    admissionTransactionId:"admission-p11",sourceEventId:"confirmed-offer",
    personConsentId:"child-agreement",guardianConsentId:"guardian-agreement",
    confirmedAt:{year:s.year,month:s.mo}
   });return false;}catch{return true;}})();
 educationDependentResidenceUpdate(s,{
  personId:first.personId,kind:"family-home",region:s.res.n,areaId:area,
  effectiveAt:{year:s.year,month:s.mo},sourceEventId:"observed-home",
  reportedToProtagonist:false
 });
 const knownBefore=first.knownResidence.status;
 educationDependentResidenceUpdate(s,{
  personId:first.personId,kind:"family-home",region:s.res.n,areaId:area,
  effectiveAt:{year:s.year,month:s.mo},sourceEventId:"seen-at-home",
  reportedToProtagonist:true,knownAt:{year:s.year,month:s.mo}
 });
 first.consents.push(
   {consentId:"child-agreement",personId:first.personId,
     purpose:"attend",status:"approved"},
   {consentId:"guardian-agreement",personId:first.personId,
     purpose:"guardian-enrollment",status:"approved"}
 );
 const enrollment=educationDependentRecordEnrollment(s,{
    personId:first.personId,offeringId:offering.id,
    admissionTransactionId:"admission-p11",sourceEventId:"confirmed-offer",
    personConsentId:"child-agreement",guardianConsentId:"guardian-agreement",
    confirmedAt:{year:s.year,month:s.mo}
 });
 const same=educationDependentRecordEnrollment(s,{
    personId:first.personId,offeringId:offering.id,
    admissionTransactionId:"admission-p11",sourceEventId:"confirmed-offer",
    personConsentId:"child-agreement",guardianConsentId:"guardian-agreement",
    confirmedAt:{year:s.year,month:s.mo}
 })===enrollment;
 return {added,addedAgain,blocked:recordBlocked,knownBefore,
  knownAfter:first.knownResidence.status,
  oneEnrollment:first.enrollments.length,twoEnrollment:second.enrollments.length,
  noParentEnrollment:s.educationRecord.enrollments.length===before,
  same,issues:educationDependentInvariants(s)};
});
assert(family.added>=2);
assert.equal(family.addedAgain,0);
assert.equal(family.blocked,true);
assert.equal(family.knownBefore,"unknown");
assert.equal(family.knownAfter,"family-home");
assert.equal(family.oneEnrollment,1);
assert.equal(family.twoEnrollment,0);
assert.equal(family.noParentEnrollment,true);
assert.equal(family.same,true);
assert.deepEqual(family.issues,[]);
fresh(25,"カズデル");
const informal=run(function(){
 const s=S,area=ensureEducationWorldForResidence(s);
 const before={awards:s.educationRecord.awards.length,
   enrollments:s.educationRecord.enrollments.length,
   university:s.fl.uni||0,knowledge:s.k};
 const modeCount=Object.keys(EDUCATION_NONFORMAL_MODES).length;
 const path=educationOpenLearningPath(s,{
   personId:"protagonist",modeId:"self-directed",providerId:"self",
   siteRef:{region:s.res.n,areaId:area,attendanceMode:"self"},
   subjectIds:["academic_knowledge"],sourceEventId:"observed-self-reading"
 });
 const record=educationRecordLearningParticipation(s,{
   pathId:path.pathId,year:s.year,month:s.mo,
   attendedSessions:3,totalSessions:4,evidenceRef:"read-notes-evidence"
 });
 const duplicate=educationRecordLearningParticipation(s,{
   pathId:path.pathId,year:s.year,month:s.mo,
   attendedSessions:3,totalSessions:4,evidenceRef:"read-notes-evidence"
 })===record;
 const idempotent=Object.keys(s.learningCompetenceEffects.items).length;
 let unverifiedRejected=false;
 try{
   educationNonformalRecognition(s,{
     applicationId:"imaginary-license",pathId:path.pathId,
     authorityId:"unknown-authority",ruleId:"unknown-rule",
     targetJurisdiction:s.res.n,targetStageOrRole:"university",
     outcome:"accepted",assessmentEvidenceId:"no-exam",
     recognitionKind:"entry_eligibility",
     effectiveFrom:{year:s.year,month:s.mo},sourceEventId:"no-source"
   });
 }catch{unverifiedRejected=true;}
 const after={awards:s.educationRecord.awards.length,
   enrollments:s.educationRecord.enrollments.length,
   university:s.fl.uni||0,knowledge:s.k};
 return {modeCount,duplicate,idempotent,unverifiedRejected,
   knowledgeGain:after.knowledge>before.knowledge,
   noAutomaticDegree:after.awards===before.awards &&
     after.enrollments===before.enrollments &&
     after.university===before.university,
   pathStatus:path.status,issues:educationNonformalInvariants(s)};
});
assert.equal(informal.modeCount,16);
assert.equal(informal.duplicate,true);
assert(informal.idempotent>=1);
assert.equal(informal.unverifiedRejected,true);
assert.equal(informal.knowledgeGain,true);
assert.equal(informal.noAutomaticDegree,true);
assert.equal(informal.pathStatus,"active");
assert.deepEqual(informal.issues,[]);
console.log("PASS P09/P10/P11/P12 scoped school knowledge, language, dependents, and nonformal learning");
