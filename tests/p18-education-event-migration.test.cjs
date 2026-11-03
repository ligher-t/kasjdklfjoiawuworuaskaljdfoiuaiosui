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
  const items=window.TERRA_EDUCATION_P17_REVIEWED,
    shown=EV.filter(x=>x.id.startsWith("edu_")&&
      items.some(y=>y.eventId===x.id));
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
assert.equal(corpus.enabled.length,12);
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
console.log("PASS P13/P17 80 reviewed prose, 12 activated scenes, scoped I03-I06 effects, and safe legacy classroom guards");
