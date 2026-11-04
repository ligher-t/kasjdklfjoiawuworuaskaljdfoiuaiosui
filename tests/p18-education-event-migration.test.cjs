'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
let sequence=0;
const fresh=(region="龍門",age=19)=>{
  setup(ctx,{id:"P13-P17-"+(++sequence),seed:90371+sequence,region,age});
};
const run=fn=>JSON.parse(vm.runInContext("JSON.stringify(("+fn.toString()+")())",ctx,{timeout:12000}));
const fixture=()=>{
  fresh();
  return run(function(){
    const s=S;s.mo=0;s.cash=9000000;
    ensureResidenceIdentity(s);
    const area=ensureEducationWorldForResidence(s),
      world=s.world.educationWorld,
      inst=educationRegisterInstitution(world,area,"p17-school",
        "university",["university"],s.year),
      offer=world.offerings[inst.offeringIds[0]];
    offer.admissionTier=1;
    educationStart(s,"university",1,"p17-school-admission");
    s.educationPath.institutionId=inst.id;
    s.educationPath.campusId=offer.campusId;
    s.educationPath.offeringId=offer.id;
    const enrolled=s.educationRecord.enrollments.at(-1);
    educationBindFormalEnrollment(s,enrolled.id);
    educationEnsureEnrolledSchoolPeople(s,enrolled.id);
    const invoice=educationEnsureTuitionInvoice(s,s.educationPath,s.year);
    educationSettleInvoice(s,invoice);
    educationFinanceProjectInvoice(s,invoice);
    s.mo=4;
    return {area,instId:inst.id,offeringId:offer.id,
      enrollId:enrolled.id,invoice:invoice.id};
  });
};
const corpus=run(function(){
  const items=window.GAME_DATA.EDUCATION_P17_REVIEWED,
    shown=EV.filter(x=>x.id.startsWith("edu_")&&
      items.some(y=>y.eventId===x.id) &&
      (x.fx?.educationAction?.startsWith("event:") ||
        x.c?.some(c=>c.o?.some(o=>
          o?.[2]?.educationAction?.startsWith("event:")))));
  return {count:items.length,
    choices:items.reduce((n,x)=>n+x.choices.length,0),
    notes:items.reduce((n,x)=>n+x.choices.reduce((a,b)=>a+b.notifications.length,0),0),
    held:items.filter(x=>x.decision==="保留").map(x=>x.reviewId),
    enabled:shown.map(x=>x.id),unique:new Set(items.map(x=>x.eventId)).size,
    exact:items.find(x=>x.reviewId==="E34")?.body,
    conditional:items.find(x=>x.reviewId==="E54")
      .choices[0].notifications.length
  };
});
assert.equal(corpus.count,80);
assert.equal(corpus.choices,159);
assert.equal(corpus.notes,46);
assert.equal(corpus.unique,80);
assert.deepEqual(corpus.held,["E57","E59","E60","E65","E66","E73"]);
assert.equal(corpus.enabled.length,73);
const lowerStageOwners=run(function(){
  return EV.filter(e=>e.id==="edu_lower_stage_site_review").length;
});
assert.equal(lowerStageOwners,1,"E04 must reuse the existing I03 lower-stage event");
assert.equal(corpus.conditional,2);
assert.equal(corpus.exact,
  "診察のため授業を休む日のことを、誰に話すか考えた。担任にだけ相談する方法も、学校の担当窓口へ知らせる方法もある。");
fixture();
const first=run(function(){
  const s=S,id=s.educationPath.currentEnrollmentId,
    old=JSON.stringify(s.educationRecord.awards);
  const allowed=educationMigrationEligible(s,"edu_first_day_of_actual_school");
  const event=EV.find(x=>x.id==="edu_first_day_of_actual_school");
  const text=event.t,applied=educationMigrationApply(s,"E35:solo");
  const after=educationMigrationEligible(s,"edu_first_day_of_actual_school");
  return {allowed,text,applied,after,
    firstDay:s.educationMigration.records[0]?.result?.enrollmentId===id,
    awardsUnchanged:old===JSON.stringify(s.educationRecord.awards)};
});
assert.equal(first.allowed,true);
assert(first.text.includes("自分の名前が書かれた札"));
assert.equal(first.applied,true);
assert.equal(first.after,false);
assert.equal(first.firstDay,true);
assert.equal(first.awardsUnchanged,true);
fixture();
const scope=run(function(){
 const s=S;s.inf=1;s.fl.dg=1,
    institutionId=s.educationPath.institutionId,
    teacher=Object.values(s.world.educationWorld.staff)[0].id,
    peer=Object.values(s.world.educationWorld.schoolPeers)[0].id;
 const a=educationMigrationEligible(s,"edu_school_confidential_disclosure","A");
 educationMigrationApply(s,"E34:A");
 const school=educationRecipientInfectionKnowledge(s,{institutionId,
   recipientKind:"institution"}).status,
   teacherStatus=educationRecipientInfectionKnowledge(s,{institutionId,
   recipientKind:"teacher",personId:teacher}).status,
   peerStatus=educationRecipientInfectionKnowledge(s,{institutionId,
   recipientKind:"peer",personId:peer}).status,
   already=educationMigrationEligible(s,"edu_school_confidential_disclosure","B");
 s.year+=2;s.mo=4;
 const b=educationMigrationEligible(s,"edu_school_confidential_disclosure","B");
 educationMigrationApply(s,"E34:B");
 const schoolAfter=educationRecipientInfectionKnowledge(s,{institutionId,
   recipientKind:"institution"}).status;
 return {a,school,teacherStatus,peerStatus,already,b,schoolAfter,
   records:s.educationMigration.records.length};
});
assert.equal(scope.a,true);
assert.equal(scope.school,"unaware");
assert.equal(scope.teacherStatus,"individual-confirmed");
assert.equal(scope.peerStatus,"unaware");
assert.equal(scope.already,false);
assert.equal(scope.b,true);
assert.equal(scope.schoolAfter,"institution-confirmed");
assert.equal(scope.records,2);
fixture();
const roving=run(function(){
 const s=S,area=s.local.educationAreaId,
   world=s.world.educationWorld,prior=s.k;
 const before=educationMigrationEligible(s,"edu_roving_teacher_visit");
 educationRegisterInformalProvider(s,{
   providerId:"witnessed-roving",personId:"unnamed-mentor-roving",
   kind:"roving-tutor",areaId:area,
   activeFrom:{year:s.year,month:1},
   subjectIds:["basic_literacy"],
   evidenceRef:"confirmed-roving-teacher"
 });
 const can=educationMigrationEligible(s,"edu_roving_teacher_visit","A");
 const applied=educationMigrationApply(s,"E47:A");
 const after=educationMigrationEligible(s,"edu_roving_teacher_visit");
 const path=s.learningPaths.find(x=>x.modeId==="roving-tutor");
 return {before,can,applied,after,participations:path?.participation.length,
   provider:world.informalProviders["witnessed-roving"]?.id,
   growth:s.k>=prior,awards:s.educationRecord.awards.length,
   issues:educationNonformalInvariants(s)};
});
assert.equal(roving.before,false);
assert.equal(roving.can,true);
assert.equal(roving.applied,true);
assert.equal(roving.after,false);
assert.equal(roving.participations,1);
assert.equal(roving.provider,"witnessed-roving");
assert.equal(roving.growth,true);
assert.equal(roving.awards,0);
assert.deepEqual(roving.issues,[]);
fixture();
const recognition=run(function(){
 const s=S,area=s.local.educationAreaId,
   world=s.world.educationWorld;
 const provider=educationRegisterInformalProvider(s,{
   providerId:"known-workshop",personId:"workshop-master",
   kind:"workshop-apprenticeship",areaId:area,
   activeFrom:{year:s.year,month:1},subjectIds:["repair"],
   evidenceRef:"observed-workshop-teaching"
 });
 s.educationWorkshopLinks={version:1,items:{
   workshop:{personId:"protagonist",providerId:provider.id,status:"active"}
 }};
 const learned=educationMigrationEligible(s,"edu_apprentice_literacy_exchange");
 educationMigrationApply(s,"E49:A");
 const path=s.learningPaths.find(x=>x.modeId==="workshop-apprenticeship");
 const school=world.institutions[s.educationPath.institutionId];
 school.nonformalRecognitionRules={
   "real-skill-review":{
     approved:true,sourceRef:"approved-skill-assessment-standards",
     kind:"skill_certificate",jurisdiction:s.res.n,
     targetStageOrRole:"repair"
   }
 };
 const inquiryPossible=educationMigrationEligible(s,"edu_informal_skill_assessment");
 educationMigrationApply(s,"E54:A");
 return {learned,inquiryPossible,
   lessons:path.participation.length,
   pending:Object.values(s.educationRecognitionInquiries.items)[0].status,
   noDegree:s.educationRecord.awards.length===0,
   noRecognitions:!s.educationRecord.recognitions?.length,
   audit:educationNonformalInvariants(s)};
});
assert.equal(recognition.learned,true);
assert.equal(recognition.inquiryPossible,true);
assert.equal(recognition.lessons,1);
assert.equal(recognition.pending,"awaiting-assessment");
assert.equal(recognition.noDegree,true);
assert.equal(recognition.noRecognitions,true);
assert.deepEqual(recognition.audit,[]);
fresh("ウルサス",12);
const guard=run(function(){
 const s=S;s.mo=4;s.fl.sch=1;
 const before=educationLegacySceneGuard(s,"daily_ursus_47");
 const free=educationLegacySceneGuard(s,"life_family_remittance");
 const eligibility=elig(EV.find(x=>x.id==="daily_ursus_47"),s,tags(s));
 return {before,free,eligibility};
});
assert.equal(guard.before,false);
assert.equal(guard.free,true);
assert.equal(guard.eligibility,false);
fresh("龍門",15);
const legacy=run(function(){
 const s=S;s.mo=5;s.cash=1000000;
 ensureResidenceIdentity(s);
 ensureEducationWorldForResidence(s);
 const e=EV.find(x=>x.id==="v77_child_informal_study");
 const effect=e.c[0].o[0][2],startK=s.k;
 const previous=TRACE_RESOLUTION;
 TRACE_RESOLUTION={kind:"choice",id:e.id,label:e.c[0].l};
 try{ap(effect)}finally{TRACE_RESOLUTION=previous}
 const paths=s.learningPaths?.filter(x=>x.modeId==="neighborhood-literacy")||[];
 const first=paths[0];
 return {paths:paths.length,participation:first?.participation.length,
   alreadyApplied:!s.learningCompetenceEffects?.items ||
     Object.keys(s.learningCompetenceEffects.items).length===0,
   learned:s.k>startK,
   provider:!!s.world.educationWorld.informalProviders[first?.providerId],
   noDegree:s.educationRecord.awards.length===0};
});
assert.equal(legacy.paths,1);
assert.equal(legacy.participation,1);
assert.equal(legacy.alreadyApplied,true);
assert.equal(legacy.learned,true);
assert.equal(legacy.provider,true);
assert.equal(legacy.noDegree,true);
console.log("PASS P13/P17 80 reviewed prose, 73 P17 events plus the existing I03 lower-stage scene, scoped I03-I06 effects, and safe legacy classroom guards");


fresh();
const legacyRoutes=run(function(){
  const s=S;s.mo=6;s.educationPath={status:"outside"};
  const event=id=>EV.find(e=>e.id===id);
  const reentry=event("education_return_path");
  const unemployment=event("fam_unemploy");
  const childAid=event("ksc");
  const adultTutor=event("v77_child_informal_study");
  const minority=event("race_identity");
  const tagset=tags(s);
  return {
    reentryChoices:reentry.c.length,
    reentryActions:reentry.c.slice(0,4).map(c=>c.o[0][2].educationAction),
    transfersViaApproval:event("education_transfer_review").c[0].o[0][2].educationAction,
    unemploymentExit:unemployment.c[0].o.map(o=>o[2].educationAction),
    childAidCash:childAid.c.map(c=>c.o[0][2].cash??0),
    minorityClassroom:minority.t[0].when(s,tagset),
    generatedClasses:["f17","f18"].map(id=>event(id).show(s)),
    oldTutorWithoutProvider:adultTutor.c[0].en(s,tagset)
  };
});
assert.equal(legacyRoutes.reentryChoices,5);
assert.deepEqual(legacyRoutes.reentryActions,[
  "case:begin:reentry:primary:1",
  "case:begin:reentry:lower:1",
  "case:begin:reentry:upper:1",
  "case:begin:reentry:preparatory:1"
]);
assert.equal(legacyRoutes.transfersViaApproval,"event:E41:A");
assert.deepEqual(legacyRoutes.unemploymentExit,["leave-school","leave-school"]);
assert.deepEqual(legacyRoutes.childAidCash,[0,0]);
assert.equal(legacyRoutes.minorityClassroom,false);
assert.deepEqual(legacyRoutes.generatedClasses,[false,false]);
assert.equal(legacyRoutes.oldTutorWithoutProvider,false);
console.log("PASS education legacy reentry, family-school, minority, generated-classroom, and tutor guards");


fixture();
const actualClassroom=run(function(){
  const s=S,variant=EV.find(e=>e.id==="race_identity").t[0],
    known=tags(s);
  known.add("地域で少数派");
  const enrolled=variant.when(s,known);
  const before=JSON.stringify(s.educationRecord.enrollments);
  s.educationPath.status="outside";
  const afterWithdrawal=variant.when(s,known);
  return {enrolled,afterWithdrawal,
    noNewEnrollment:before===JSON.stringify(s.educationRecord.enrollments)};
});
assert.equal(actualClassroom.enrolled,true);
assert.equal(actualClassroom.afterWithdrawal,false);
assert.equal(actualClassroom.noNewEnrollment,true);

// The 62 newly connected scenes are registered without manufacturing facts.
fresh("クルビア",19);
const extra=run(function(){
  const s=S;s.mo=4;ensureResidenceIdentity(s);
  ensureEducationWorldForResidence(s);
  const entries=window.GAME_DATA.EDUCATION_P17_REVIEWED;
  const candidates=entries.filter(x=>EDUCATION_P17_EXTRA.has(x.reviewId));
  const events=candidates.map(x=>EV.find(e=>e.id===x.eventId));
  const before=events.filter(e=>e && educationMigrationEligible(s,e.id)).map(e=>e.id);
  const prior=JSON.stringify(s.educationRecord||{});
  const held=entries.filter(x=>x.decision==="保留")
    .some(x=>EV.some(e=>e.id===x.eventId));
  const notEligible=educationMigrationEligible(s,"edu_region_ursus_class_and_school");
  return {connected:candidates.length,allPresent:events.every(Boolean),
    liveWithoutEvidence:before,held,noChange:prior===JSON.stringify(s.educationRecord||{}),
    notEligible};
});
assert.equal(extra.connected,62);
assert.equal(extra.allPresent,true);
assert.deepEqual(extra.liveWithoutEvidence,[]);
assert.equal(extra.held,false);
assert.equal(extra.noChange,true);
assert.equal(extra.notEligible,false);
console.log("PASS P17 all 62 additional scenes registered, six held, no invented evidence");


fixture();
const currentTeacherIdentity=run(function(){
 const s=S,school=educationMigrationCurrent(s),old=s.educationRecord.enrollments.length;
 const unknown=educationLegacyTeacherContact(s,{known:false}),
   previous=TRACE_RESOLUTION;
 TRACE_RESOLUTION={kind:"choice",id:"people_school_introduction",label:"教卓へ歩み寄り、分からなかった箇所を尋ねる"};
 let met;
 try{met=educationApplyAction(s,"legacy:teacher-meet")}
 finally{TRACE_RESOLUTION=previous}
 const known=educationLegacyTeacherContact(s,{known:true});
 return {unknown:!!unknown,metId:met?.personId,
   knownId:known?.staff.personId,schoolId:school.m.institutionId,
   noSecondEnrollment:s.educationRecord.enrollments.length===old,
   evidence:known?.tie.contacts?.length};
});
assert.equal(currentTeacherIdentity.unknown,true);
assert.equal(currentTeacherIdentity.metId,currentTeacherIdentity.knownId);
assert.equal(currentTeacherIdentity.noSecondEnrollment,true);
assert.equal(currentTeacherIdentity.evidence,1);

fresh("クルビア",19);
const validatedCaseScene=run(function(){
 const s=S;s.mo=4;ensureResidenceIdentity(s);
 ensureEducationWorldForResidence(s);
 const c=educationCaseBegin(s,"higher-path","university",1);
 c.phase="planning";
 const before=educationMigrationEligible(s,"edu_higher_search_decision","B"),
   old=s.educationRecord?.enrollments?.length||0,
   cash=s.cash;
 const applied=educationMigrationApply(s,"E06:B");
 return {before,applied,reason:c.reason,
   noEnrollment:(s.educationRecord?.enrollments?.length||0)===old,
   noCharge:s.cash===cash};
});
assert.equal(validatedCaseScene.before,true);
assert.equal(validatedCaseScene.applied,true);
assert.equal(validatedCaseScene.reason,"voluntary-defer");
assert.equal(validatedCaseScene.noEnrollment,true);
assert.equal(validatedCaseScene.noCharge,true);
console.log("PASS verified teacher identity and P17 case decisions preserve school/finance ownership");


const noticeInventory=run(function(){
  const corpus=window.GAME_DATA.EDUCATION_P17_REVIEWED;
  const all=corpus.reduce((n,x)=>n+x.choices.reduce((m,c)=>
    m+c.notifications.length,0),0);
  const held=corpus.filter(x=>x.decision==="保留")
    .reduce((n,x)=>n+x.choices.reduce((m,c)=>
      m+c.notifications.length,0),0);
  return {all,held,active:all-held};
});
assert.deepEqual(noticeInventory,{all:46,held:2,active:44});

fresh("クルビア",22);
const informedGrant=run(function(){
  const s=S;s.mo=4;s.cash=0;s.house.cash=0;
  ensureResidenceIdentity(s);
  const area=ensureEducationWorldForResidence(s),
    world=s.world.educationWorld,
    institution=educationRegisterInstitution(world,area,
      "p17-grant-office","university",["university"],s.year),
    offer=world.offerings[institution.offeringIds[0]],
    item=educationCaseBegin(s,"higher-path","university",1);
  offer.admissionTier=1;
  item.phase="contract";item.offeringId=offer.id;
  item.targetInstitutionId=institution.id;
  const result=educationMigrationRecord(s,"edu_scholarship_application","A",
    {caseId:item.id,informationOnly:true}),
    before=!result.notice;
  const asked=educationCaseFinanceInquiry(s);
  const notified=educationP17ReconcileNotices(s),
    after=result.notice,
    repeated=educationP17ReconcileNotices(s);
  return {before,asked,notified,repeated,
    index:after?.index,
    matches:after?.index===(s.educationAccess.financingOffers[item.id].grant?0:1),
    evidence:!!after?.evidenceRef,
    newSchool:!!s.educationRecord?.enrollments?.length,
    cash:s.cash};
});
assert.equal(informedGrant.before,true);
assert.equal(informedGrant.asked,true);
assert.equal(informedGrant.notified,1);
assert.equal(informedGrant.repeated,0);
assert.equal(informedGrant.matches,true);
assert.equal(informedGrant.evidence,true);
assert.equal(informedGrant.newSchool,false);
assert.equal(informedGrant.cash,0);

fixture();
const noticeProof=run(function(){
 const s=S;s.mo=5,area=s.local.educationAreaId,
   world=s.world.educationWorld;
 const provider=educationRegisterInformalProvider(s,{
   providerId:"confirmed-workshop-fail",personId:"known-workshop-master",
   kind:"workshop-apprenticeship",areaId:area,
   activeFrom:{year:s.year,month:1},subjectIds:["repair"],
   evidenceRef:"observed-workshop-course"
 });
 s.educationWorkshopLinks={version:1,items:{
   workshop:{personId:"protagonist",providerId:provider.id,status:"active"}
 }};
 educationMigrationApply(s,"E49:A");
 const path=s.learningPaths.find(x=>x.modeId==="workshop-apprenticeship"),
   school=world.institutions[s.educationPath.institutionId];
 school.nonformalRecognitionRules={repair:{
   approved:true,sourceRef:"signed-repair-assessment-policy",
   kind:"skill_certificate",jurisdiction:s.res.n,
   targetStageOrRole:"repair"
 }};
 educationMigrationApply(s,"E54:A");
 const inquiry=Object.values(s.educationRecognitionInquiries.items)[0],
   row=s.educationMigration.records.find(x=>
     x.eventId==="edu_informal_skill_assessment"),
   pending=!row.notice;
 educationRecordRecognitionAssessment(s,{
   applicationId:inquiry.id,pathId:path.pathId,
   authorityId:school.id,ruleId:"repair",
   assessmentEvidenceId:"signed-repair-exam-fail",
   examinerId:"school-appointed-examiner",
   verdict:"failed",sourceEventId:"school-repair-exam"
 });
 const recognized=educationP17ReconcileNotices(s),
   repeated=educationP17ReconcileNotices(s),
   restored=JSON.parse(JSON.stringify(s)),
   afterRestore=educationP17ReconcileNotices(restored);
 return {pending,recognized,repeated,afterRestore,
   index:row.notice?.index,evidence:row.notice?.evidenceRef,
   rejected:inquiry.status==="rejected",
   credentials:s.educationRecord.awards.length,
   recognitionCount:s.educationRecord.recognitions?.length||0};
});
assert.equal(noticeProof.pending,true);
assert.equal(noticeProof.recognized,1);
assert.equal(noticeProof.repeated,0);
assert.equal(noticeProof.afterRestore,0);
assert.equal(noticeProof.index,1);
assert.equal(noticeProof.evidence,"signed-repair-exam-fail");
assert.equal(noticeProof.rejected,true);
assert.equal(noticeProof.credentials,0);
assert.equal(noticeProof.recognitionCount,0);

fixture();
const noticeAward=run(function(){
 const s=S;s.mo=5,world=s.world.educationWorld;
 const provider=educationRegisterInformalProvider(s,{
   providerId:"confirmed-workshop-pass",personId:"known-workshop-master",
   kind:"workshop-apprenticeship",areaId:s.local.educationAreaId,
   activeFrom:{year:s.year,month:1},subjectIds:["repair"],
   evidenceRef:"observed-workshop-course"
 });
 s.educationWorkshopLinks={version:1,items:{
   workshop:{personId:"protagonist",providerId:provider.id,status:"active"}
 }};
 educationMigrationApply(s,"E49:A");
 const path=s.learningPaths.find(x=>x.modeId==="workshop-apprenticeship"),
   school=world.institutions[s.educationPath.institutionId];
 school.nonformalRecognitionRules={repair:{
   approved:true,sourceRef:"signed-repair-assessment-policy",
   kind:"skill_certificate",jurisdiction:s.res.n,
   targetStageOrRole:"repair"
 }};
 educationMigrationApply(s,"E54:A");
 const inquiry=Object.values(s.educationRecognitionInquiries.items)[0],
   row=s.educationMigration.records.find(x=>
     x.eventId==="edu_informal_skill_assessment");
 educationRecordRecognitionAssessment(s,{
   applicationId:inquiry.id,pathId:path.pathId,
   authorityId:school.id,ruleId:"repair",
   assessmentEvidenceId:"signed-repair-exam-pass",
   examinerId:"school-appointed-examiner",
   verdict:"passed",sourceEventId:"school-repair-exam"
 });
 const noEarly=educationP17ReconcileNotices(s)===0 &&
   inquiry.status==="assessment-passed" &&
   !s.educationRecord.recognitions?.length;
 educationNonformalRecognition(s,{
   applicationId:inquiry.id,pathId:path.pathId,authorityId:school.id,
   ruleId:"repair",targetJurisdiction:s.res.n,
   targetStageOrRole:"repair",outcome:"accepted",
   assessmentEvidenceId:"signed-repair-exam-pass",
   sourceEventId:"school-repair-exam-final",
   recognitionKind:"skill_certificate",
   effectiveFrom:{year:s.year,month:s.mo}
 });
 const delivered=educationP17ReconcileNotices(s),
   duplicate=educationP17ReconcileNotices(s);
 return {noEarly,delivered,duplicate,
   index:row.notice?.index,proof:row.notice?.evidenceRef,
   inquiry:inquiry.status,
   recognitionId:s.educationRecord.recognitions?.[0]?.recognitionId,
   noDegree:s.educationRecord.awards.length===0};
});
assert.equal(noticeAward.noEarly,true);
assert.equal(noticeAward.delivered,1);
assert.equal(noticeAward.duplicate,0);
assert.equal(noticeAward.index,0);
assert.equal(noticeAward.proof,"signed-repair-exam-pass");
assert.equal(noticeAward.inquiry,"recognized");
assert.equal(noticeAward.recognitionId,
  "recognition:edu-recogn-inquiry:"+noticeAward.recognitionId?.split("edu-recogn-inquiry:")[1]);
assert.equal(noticeAward.noDegree,true);
console.log("PASS P17 conditional notices: 46 authored, two held, delayed source-backed dispatch, no duplicates or phantom awards");


const sixLegacyContracts=run(function(){
  const ids=["sch","education_paused_life","higher_ed","education_upper_path",
    "education_funding_review","education_graduation_review"];
  return ids.map(id=>{
    const event=EV.find(x=>x.id===id),
      choices=event?.c||[],
      actions=choices.flatMap(c=>(c.o||[]).map(o=>o?.[2]?.educationAction)
        .filter(Boolean)),
      effects=choices.flatMap(c=>(c.o||[]).map(o=>o?.[2]||{}));
    return {id,actions,count:choices.length,exists:!!event,
      directDegree:effects.some(f=>f.fl?.uni===1||f.fl?.voc===1||
        f.fl?.arts_grad===1||f.study?.endsWith("_finish")),
      directSchool:effects.some(f=>f.fl?.sch===1),
      directTuition:effects.some(f=>f.cash<0)};
  });
});
assert.equal(sixLegacyContracts.length,6);
assert(sixLegacyContracts.every(x=>x.exists&&!x.directDegree&&
  !x.directSchool&&!x.directTuition));
const legacyById=Object.fromEntries(sixLegacyContracts.map(x=>[x.id,x]));
assert.deepEqual(legacyById.sch.actions,
  ["case:begin:primary:primary:1","case:begin:primary:primary:1",
   "case:decline:primary"]);
assert.equal(legacyById.higher_ed.actions.filter(x=>
  x.startsWith("case:begin:higher-path:")).length,7);
assert.deepEqual(legacyById.education_upper_path.actions,
  ["case:begin:upper-path:upper:1","case:decline:upper-path",
   "case:decline:upper-path"]);
assert.deepEqual(legacyById.education_graduation_review.actions,
  ["repeat","withdraw"]);
assert(legacyById.education_funding_review.actions.includes("funding-loan"));
assert(legacyById.education_funding_review.actions.includes("funding-grant"));
assert(legacyById.education_paused_life.actions.includes("withdraw"));
fresh("龍門",7);
const actualInitialChoice=run(function(){
  const s=S;s.mo=4;ensureResidenceIdentity(s);
  ensureEducationWorldForResidence(s);
  const cash=s.cash,old=s.educationRecord?.enrollments?.length||0;
  const accepted=educationCaseAction(s,"case:begin:primary:primary:1"),
    active=educationActiveCase(s);
  return {accepted,phase:active?.phase,stage:active?.stage,
    searches:s.educationAccess?.searches?.length||0,
    sameCash:s.cash===cash,
    noEnrollment:(s.educationRecord?.enrollments?.length||0)===old};
});
assert.equal(actualInitialChoice.accepted,true);
assert.equal(actualInitialChoice.phase,"planning");
assert.equal(actualInitialChoice.stage,"primary");
assert.equal(actualInitialChoice.searches,1);
assert.equal(actualInitialChoice.sameCash,true);
assert.equal(actualInitialChoice.noEnrollment,true);
console.log("PASS six P13 legacy entrypoints: intent, funding, pause and graduation do not bypass school/finance/credit owners");


fixture();
const restoredCommute=run(function(){
 const s=S;s.mo=4;
 const world=s.world.educationWorld,current=educationMigrationCurrent(s),
   schoolArea=world.campuses[current.m.campusId].educationAreaId,
   hub=world.hubs[world.areas[schoolArea].educationHubId],
   adjacent=hub.areaIds.find(x=>x!==schoolArea);
 if(!adjacent)return {missingHub:true};
 s.local.educationAreaId=adjacent;
 for(const id of Object.keys(world.transportLinks))delete world.transportLinks[id];
 const id=educationLinkId(adjacent,schoolArea,"urban-transit"),
   [a,b]=[adjacent,schoolArea].sort();
 world.transportLinks[id]={
   id,endpointAreaIds:[a,b],routeKind:"urban-transit",
   travelMinutesAB:18,travelMinutesBA:18,transferWaitMinutes:0,
   riskScore:0.04,accessibility:["step-free"],accessibilityKnown:true,
   directionalAccess:{[a]:true,[b]:true},
   statusHistory:[{
     from:{year:s.year,month:3},to:{year:s.year,month:3},
     status:"closed",sourceRef:"recorded-monthly-service-disruption"
   }]
 };
 const earlier=educationFindRoute(s,{
   originAreaId:adjacent,campusAreaId:schoolArea,year:s.year,month:3
 }),now=educationFindRoute(s,{
   originAreaId:adjacent,campusAreaId:schoolArea,year:s.year,month:4
 }),eligible=educationMigrationEligible(s,"edu_route_recovered_notice","A"),
   applied=eligible&&educationMigrationApply(s,"E23:A"),
   scene=s.educationMigration.records.find(x=>
     x.eventId==="edu_route_recovered_notice");
 return {missingHub:false,earlier:earlier.status,now:now.status,
   eligible,applied,notice:scene?.notice?.index,
   noInvoice:!Object.values(s.educationFinance?.invoices||{}).some(x=>
     x.kind==="commute-pass"),noFakeArrival:
     s.educationRecord.enrollments.length===1};
});
assert.equal(restoredCommute.missingHub,false);
assert.equal(restoredCommute.earlier,"blocked");
assert.equal(restoredCommute.now,"feasible");
assert.equal(restoredCommute.eligible,true);
assert.equal(restoredCommute.applied,true);
assert.equal(restoredCommute.notice,0);
assert.equal(restoredCommute.noInvoice,true);
assert.equal(restoredCommute.noFakeArrival,true);
console.log("PASS P17 observed transport recovery and case-independent route notice");


fresh("極東",20);
const observedDojo=run(function(){
 const s=S;s.mo=5;ensureResidenceIdentity(s);
 const area=ensureEducationWorldForResidence(s),
   before=educationMigrationEligible(s,"edu_region_higashi_dojo_learning");
 educationRegisterInformalProvider(s,{
   providerId:"known-higashi-dojo",personId:"observed-master",
   kind:"dojo-or-guild",areaId:area,
   activeFrom:{year:s.year,month:4},subjectIds:["craft"],
   evidenceRef:"direct-observation-of-dojo-teaching"
 });
 const after=educationMigrationEligible(s,"edu_region_higashi_dojo_learning","A"),
   old=s.educationRecord?.enrollments?.length||0,
   applied=educationMigrationApply(s,"E63:A");
 return {before,after,applied,
   actualEnrollment:(s.educationRecord?.enrollments?.length||0)===old,
   noCredential:!s.educationRecord?.awards?.length};
});
assert.deepEqual(observedDojo,{
 before:false,after:true,applied:true,actualEnrollment:true,noCredential:true
});
fresh("リターニア",22);
const realArtsRecruitment=run(function(){
 const s=S;s.mo=5;ensureResidenceIdentity(s);
 const area=ensureEducationWorldForResidence(s),
   world=s.world.educationWorld;
 const inst=educationRegisterInstitution(world,area,
   "observed-arts-college","arts",["arts"],s.year),
   offer=world.offerings[inst.offeringIds[0]];
 offer.admissionTier=3;
 const available=educationMigrationEligible(s,
   "edu_region_leithanien_arts_selectivity","A"),
   old=s.educationRecord?.enrollments?.length||0,
   applied=available&&educationMigrationApply(s,"E69:A");
 return {available,applied,informational:
   (s.educationRecord?.enrollments?.length||0)===old,
   noPayment:!s.educationFinance?.postings ||
     Object.keys(s.educationFinance.postings).length===0};
});
assert.equal(realArtsRecruitment.available,true);
assert.equal(realArtsRecruitment.applied,true);
assert.equal(realArtsRecruitment.informational,true);
assert.equal(realArtsRecruitment.noPayment,true);
console.log("PASS P17 regional observations require actual local dojo and selective Arts offering");

fixture();
const delayedExam=run(function(){
 const s=S,m=educationMigrationCurrent(s),examId="cancelled-course-exam";
 s.educationSchoolExperiences={version:1,items:{exam:{
   enrollmentId:m.enroll.id,offeringId:m.offering.id,
   institutionId:m.m.institutionId,examId,experienceTag:"examination-cancelled",
   status:"verified",evidenceRef:"school-cancellation-notice",year:s.year
 }}};
 s.educationExamSessions={version:1,items:{[examId]:{
   institutionId:m.m.institutionId,offeringId:m.offering.id,
   enrollmentId:m.enroll.id,status:"cancelled",evidenceRef:"exam-closed"
 }}};
 const eligible=educationMigrationEligible(s,"edu_exam_cancelled","A");
 educationMigrationApply(s,"E42:A");
 const row=s.educationMigration.records.find(x=>x.eventId==="edu_exam_cancelled"),
   pending=!row.notice,req=row.result.externalRequest.id;
 let rejectedEarly=false;
 try{educationP17RecordExternalDecision(s,{requestId:req,
   issuerId:m.m.institutionId,status:"approved",
   evidenceRef:"rescheduling-decision",makeupAt:{year:s.year,month:8}})}
 catch{rejectedEarly=true}
 s.educationExamSessions.items[examId].status="rescheduled";
 s.educationExamSessions.items[examId].makeupAt={year:s.year,month:8};
 educationP17RecordExternalDecision(s,{requestId:req,
   issuerId:m.m.institutionId,status:"approved",
   evidenceRef:"rescheduling-decision",makeupAt:{year:s.year,month:8}});
 return {eligible,pending,rejectedEarly,notice:row.notice?.index,
   duplicate:educationP17ReconcileNotices(s),enrollments:s.educationRecord.enrollments.length};
});
assert.deepEqual(delayedExam,{eligible:true,pending:true,rejectedEarly:true,
 notice:0,duplicate:0,enrollments:1});
fixture();
const accessDecision=run(function(){
 const s=S,m=educationMigrationCurrent(s),mob=educationCreateMobilityState(s);
 s.educationSchoolExperiences={version:1,items:{barrier:{
   enrollmentId:m.enroll.id,offeringId:m.offering.id,year:s.year,
   experienceTag:"accessibility-barrier",status:"verified",
   evidenceRef:"observed-campus-barrier"
 }}};
 mob.accessibilityProfiles={[m.enroll.id]:{id:"student-access-needs",
   enrollmentId:m.enroll.id,offeringId:m.offering.id,
   institutionId:m.m.institutionId,status:"verified",
   evidenceRef:"person-specific-assessment",needs:["step-free"]}};
 const eligible=educationMigrationEligible(s,
   "edu_safety_for_disabled_student","A");
 educationMigrationApply(s,"E79:A");
 const row=s.educationMigration.records.find(x=>x.eventId==="edu_safety_for_disabled_student"),
   requestId=row.result.externalRequest.id;
 let rejectedEarly=false;
 try{educationP17RecordExternalDecision(s,{requestId,
   issuerId:m.m.institutionId,status:"approved",
   evidenceRef:"school-signed-adjustment",adjustmentRef:"reviewed-ramp"})}
 catch{rejectedEarly=true}
 mob.schoolAdjustments={"reviewed-ramp":{status:"verified",
   institutionId:m.m.institutionId,offeringId:m.offering.id,
   enrollmentId:m.enroll.id,supportedNeeds:["step-free"],
   evidenceRef:"observed-ramp-and-route"}};
 educationP17RecordExternalDecision(s,{requestId,
   issuerId:m.m.institutionId,status:"approved",
   evidenceRef:"school-signed-adjustment",adjustmentRef:"reviewed-ramp"});
 return {eligible,rejectedEarly,notice:row.notice?.index,
   duplicate:educationP17ReconcileNotices(s)};
});
assert.deepEqual(accessDecision,{eligible:true,rejectedEarly:true,notice:0,duplicate:0});
console.log("PASS E42 and E79: independent exam schedule and school adjustment evidence");

fresh("クルビア",24);
const fundingResponse=run(function(){
 const s=S;s.mo=4;s.job=7;ensureResidenceIdentity(s);
 const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld,
   inst=educationRegisterInstitution(w,area,"employer-course","university",
     ["university"],s.year),off=w.offerings[inst.offeringIds[0]];
 off.admissionTier=1;
 const item=educationCaseBegin(s,"higher-path","university",1);
 item.phase="planning";educationCaseDiscover(s,"local");
 ensureLifeRecord(s).affiliations.push({id:"company",kind:"employer",
   status:"active",title:"職場"});
 educationRegisterInformalProvider(s,{providerId:"company-course",
   organizationId:"company",kind:"corporate-training",areaId:area,
   activeFrom:{year:s.year,month:1},subjectIds:["technical"],
   evidenceRef:"observed-course"});
 s.educationEmployerPrograms={version:1,items:{aid:{
   id:"aid",status:"verified",evidenceRef:"signed-course-policy",
   policyRef:"company-student-aid",personId:"protagonist",
   jobId:7,employerId:"company",caseId:item.id,
   offeringId:off.id,providerId:"company-course",maxContribution:50000
 }}};
 const eligible=educationMigrationEligible(s,"edu_employer_sponsored_course","A");
 educationMigrationApply(s,"E27:A");
 const record=s.educationMigration.records.find(x=>
   x.eventId==="edu_employer_sponsored_course");
 const pending=!record.notice,cash=s.cash;
 educationP17RecordExternalDecision(s,{requestId:record.result.externalRequest.id,
   issuerId:"company",status:"approved",evidenceRef:"issued-course-approval",
   approvedAmount:30000});
 return {eligible,pending,index:record.notice?.index,unchangedCash:s.cash===cash,
   noEnrollment:!s.educationRecord.enrollments.length};
});
assert.deepEqual(fundingResponse,{eligible:true,pending:true,index:0,
 unchangedCash:true,noEnrollment:true});

fresh("クルビア",24);
const borderResponse=run(function(){
 const s=S;s.mo=4;ensureResidenceIdentity(s);
 const origin=ensureEducationWorldForResidence(s),w=s.world.educationWorld,
   far="edu-area:v1:verified-border-destination";
 educationAreaRegistration(w,{id:far,regionKey:"ヴィクトリア",
   cityOrSettlementKey:"city:verified-foreign-site",hubId:"foreign-hub",
   kind:"移動都市の居住区",catchmentType:"urban"});
 const inst=educationRegisterInstitution(w,far,"foreign-course",
   "university",["university"],s.year),off=w.offerings[inst.offeringIds[0]];
 off.admissionTier=1;
 const item=educationCaseBegin(s,"higher-path","university",1);
 item.phase="planning";
 const access=educationAccessState(s);
 access.knownOfferings[off.id]={offeringId:off.id,institutionId:inst.id,
   campusId:off.campusId,areaId:far,stage:"university",tier:1,
   tuitionEstimate:200000,epistemicStatus:"offering-verified",
   checkedAt:{year:s.year,month:4}};
 item.evidence.knownCandidateIds.push(off.id);
 const linkId="observed-border-crossing";
 w.transportLinks[linkId]={id:linkId,endpointAreaIds:[origin,far]};
 const before=educationMigrationEligible(s,"edu_crossborder_documents","A");
 s.educationTravelRequirements={version:1,items:{border:{
   id:"border",status:"verified",policyRef:"route-specific-rule",
   evidenceRef:"documented-crossing-requirement",
   personId:"protagonist",caseId:item.id,offeringId:off.id,
   fromRegion:"クルビア",toRegion:"ヴィクトリア",
   routeId:linkId,authorityId:"observed-permit-desk",
   permitKind:"student-entry",at:{year:s.year,month:4}
 }}};
 const eligible=educationMigrationEligible(s,"edu_crossborder_documents","A");
 educationMigrationApply(s,"E20:A");
 const record=s.educationMigration.records.find(x=>
   x.eventId==="edu_crossborder_documents");
 const pending=!record.notice;
 educationP17RecordExternalDecision(s,{requestId:record.result.externalRequest.id,
   issuerId:"observed-permit-desk",status:"rejected",
   evidenceRef:"confirmed-document-refusal"});
 return {before,eligible,pending,index:record.notice?.index,
   caseStillPlanning:item.phase==="planning",
   noEnrollment:!s.educationRecord.enrollments.length};
});
assert.deepEqual(borderResponse,{before:false,eligible:true,pending:true,
 index:1,caseStillPlanning:true,noEnrollment:true});
console.log("PASS E20/E27/E42/E79 conditional results require unique source-linked issuer decisions");
