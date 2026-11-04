/* I07: P13/P17 evidence-gated education event actions.
 * Every eligibility check is pure. No event prose settles an exam or awards a degree.
 */

// P17 information-only scenes have distinct prerequisites. A notice, teacher,
// barrier or historical memory must exist before prose claims it was observed.
const EDUCATION_P17_EXTRA = new Set(
  Array.from({length:80},(_,i)=>"E"+String(i+1).padStart(2,"0")).filter(id=>
    !["E34","E35","E41","E43","E47","E48","E49","E50","E51","E52","E53","E54",
      "E57","E59","E60","E65","E66","E73"].includes(id))
);
const EDUCATION_P17_REGIONS = Object.freeze({
  E56:"炎国",E58:"ヴィクトリア",E61:"カジミエーシュ",
  E62:"クルビア",E63:"極東",E64:"イベリア",E67:"カズデル",
  E68:"サーミ",E69:"リターニア",E70:"イェラグ",
  E71:"レム・ビリトン",E72:"ボリバル",E74:"ミノス",
  E75:"ウルサス",E76:"ウルサス"
});
const EDUCATION_P17_CASE_SCENES = new Set(
  ["E01","E02","E03","E04","E05","E06","E07","E08","E09",
   "E10","E11","E12","E20","E21","E24","E25","E26","E27",
   "E28","E30","E31","E32","E33"]
);
const EDUCATION_P17_STUDENT_SCENES = new Set(
  ["E13","E14","E15","E22","E23","E29","E36","E37","E38",
   "E39","E40","E42","E78","E79"]
);
function educationP17Witness(s,review) {
  return Object.values(s.educationSceneEvidence?.items||{}).some(row=>
    row.reviewId===review && row.status==="verified" && row.evidenceRef &&
    row.year<=s.year && (row.areaId===s.local?.educationAreaId ||
      row.areaId==="region:"+s.res?.n));
}
function educationP17SchoolExperience(s,tag) {
  const current=educationMigrationCurrent(s);
  return !!current && Object.values(s.educationSchoolExperiences?.items||{})
    .some(row=>row.enrollmentId===current.enroll.id &&
      row.offeringId===current.offering.id && row.experienceTag===tag &&
      row.status==="verified" && row.evidenceRef && row.year<=s.year);
}
// Independent issuers must be tied to a known route, employer, examination
// or enrolled student's actual accessibility needs. Reading an offer does
// not imply that a decision has been made.
function educationP17ExternalBasis(s,review) {
  const world=s.world?.educationWorld,item=educationActiveCase(s),
    current=educationMigrationCurrent(s),area=s.local?.educationAreaId,
    known=item?educationCaseCandidates(s):[];
  if(!world)return null;
  if(review==="E20" && item?.phase==="planning"){
    const requirements=Object.values(s.educationTravelRequirements?.items||{});
    const requirement=requirements.find(row=>{
      if(row.status!=="verified" || !row.evidenceRef || !row.policyRef ||
         !row.authorityId || !row.permitKind || row.personId!=="protagonist" ||
         row.caseId!==item.id || row.fromRegion!==s.res?.n ||
         row.at?.year>s.year)return false;
      const offer=known.find(x=>x.offeringId===row.offeringId),
        link=world.transportLinks?.[row.routeId],
        destination=world.areas?.[offer?.areaId];
      return !!offer && !!link && !!destination &&
        destination.regionKey!==s.res?.n &&
        row.toRegion===destination.regionKey &&
        link.endpointAreaIds?.includes(area) &&
        link.endpointAreaIds?.includes(offer.areaId);
    });
    return requirement?{
      issuerId:requirement.authorityId,sourceId:requirement.id,
      sourceRef:requirement.evidenceRef,caseId:item.id,
      offeringId:requirement.offeringId,routeId:requirement.routeId,
      permitKind:requirement.permitKind
    }:null;
  }
  if(review==="E27" && item && ["planning","contract"].includes(item.phase) &&
     s.job>0){
    const employers=(s.lifeRecord?.affiliations||[]).filter(x=>
      x.kind==="employer" && ["active","crisis"].includes(x.status));
    const programs=Object.values(s.educationEmployerPrograms?.items||{});
    const program=programs.find(row=>{
      const provider=world.informalProviders?.[row.providerId];
      return row.status==="verified" && !!row.evidenceRef && !!row.policyRef &&
        row.personId==="protagonist" && row.jobId===s.job &&
        row.caseId===item.id && row.maxContribution>0 &&
        employers.some(x=>x.id===row.employerId) &&
        known.some(x=>x.offeringId===row.offeringId && x.tuitionEstimate>0) &&
        provider?.kind==="corporate-training" &&
        provider.organizationId===row.employerId && !!provider.evidenceRef &&
        provider.status==="active" && provider.areaId===area;
    });
    return program?{
      issuerId:program.employerId,sourceId:program.id,
      sourceRef:program.evidenceRef,caseId:item.id,
      offeringId:program.offeringId,maxContribution:program.maxContribution
    }:null;
  }
  if(review==="E42" && current){
    const exam=Object.values(s.educationSchoolExperiences?.items||{}).find(row=>
      row.enrollmentId===current.enroll.id &&
      row.offeringId===current.offering.id &&
      row.institutionId===current.m.institutionId &&
      row.experienceTag==="examination-cancelled" &&
      row.status==="verified" && !!row.evidenceRef && !!row.examId &&
      row.year<=s.year);
    const session=exam && s.educationExamSessions?.items?.[exam.examId];
    return session?.status==="cancelled" && !!session.evidenceRef &&
      session.institutionId===current.m.institutionId &&
      session.offeringId===current.offering.id &&
      session.enrollmentId===current.enroll.id ? {
        issuerId:current.m.institutionId,sourceId:exam.examId,
        sourceRef:exam.evidenceRef,enrollmentId:current.enroll.id,
        offeringId:current.offering.id
      }:null;
  }
  if(review==="E79" && current){
    const profile=s.educationMobility?.accessibilityProfiles?.[current.enroll.id],
      observed=educationP17SchoolExperience(s,"accessibility-barrier");
    return profile?.status==="verified" && !!profile.evidenceRef &&
      profile.enrollmentId===current.enroll.id &&
      profile.institutionId===current.m.institutionId &&
      profile.offeringId===current.offering.id &&
      Array.isArray(profile.needs) && profile.needs.length && observed ? {
        issuerId:current.m.institutionId,sourceId:profile.id,
        sourceRef:profile.evidenceRef,enrollmentId:current.enroll.id,
        offeringId:current.offering.id,needs:[...profile.needs]
      }:null;
  }
  return null;
}
function educationP17ExtraEligible(s,review,letter=null) {
  if(!EDUCATION_P17_EXTRA.has(review))return false;
  if(EDUCATION_P17_REGIONS[review] &&
     s.res?.n!==EDUCATION_P17_REGIONS[review])return false;
  const current=educationMigrationCurrent(s),item=educationActiveCase(s),
    cases=s.educationCases?.history||[],
    known=item?educationCaseCandidates(s):[],
    area=s.local?.educationAreaId,
    world=s.world.educationWorld,
    witness=educationP17Witness(s,review),
    school= current&&educationSchoolStatusAt(s,current.offering.id,s.year,s.mo);
  const searched=scope=>s.educationAccess?.searches?.some(x=>
    x.caseId===item?.id && x.scope===scope);
  const primary=item?.stage==="primary",
    planning=item?.phase==="planning",
    contract=item?.phase==="contract";
  if(EDUCATION_P17_CASE_SCENES.has(review) && !item && review!=="E33")return false;
  if(EDUCATION_P17_STUDENT_SCENES.has(review) && !current)return false;
  switch(review){
    case "E01": return planning && primary && !!searched("local") &&
      known.length===0 && (s.age>=6&&s.age<=11);
    case "E02": return planning && primary && !!searched("adjacent") &&
      (letter==="B"?known.length===0:letter==="A"||letter==="C"?
        known.length>0:true);
    case "E03": return planning && primary && known.some(x=>{
      const route=educationCanReach(s,{institutionId:x.institutionId,
        campusId:x.campusId,offeringId:x.offeringId,
        year:s.year,month:s.mo,purpose:"daily-commute"});
      return !route.reachable;
    });
    case "E04": return planning && item.stage==="lower" &&
      educationHas(s,"primary");
    case "E05": return planning && item.stage==="upper" &&
      !!searched("local") && known.every(x=>x.areaId!==area);
    case "E06": return planning &&
      ["university","vocational","arts"].includes(item.stage);
    case "E07": return planning && known.length>=2;
    case "E08": return planning && known.some(x=>
      educationSchoolStatusAt(s,x.offeringId,s.year,s.mo)?.admissionStatus==="closed");
    case "E09": return contract && !!item.evidence?.admissionOfferId &&
      (letter!=="A" || educationCaseCommitEligibility(s).allowed);
    case "E10": return planning && item.kind==="reentry" &&
      s.educationRecord?.enrollments?.some(x=>x.status==="withdrawn");
    case "E11": return planning && item.stage==="preparatory" && s.age>=18;
    case "E12": return planning && s.mo>=10 && !known.length;
    case "E20":return !!educationP17ExternalBasis(s,"E20");
    case "E21":return planning && known.some(x=>
      educationOfferingLanguageAssessment(s,x.offeringId,
        "instruction-session").status==="blocked");
    case "E24": return (planning||contract) &&
      known.some(x=>Number.isFinite(x.tuitionEstimate));
    case "E25": return item.phase==="application" && witness;
    case "E26":
      return contract && !!s.educationAccess?.financingOffers?.[item.id] &&
        s.educationAccess.financingOffers[item.id].source===
          "institutional-desk-inquiry";
    case "E28":
      return contract && !!s.educationAccess?.financingOffers?.[item.id]?.loan;
    case "E27":return !!educationP17ExternalBasis(s,"E27");
    case "E30": return (planning||contract) &&
      known.some(x=>x.tuitionEstimate>0);
    case "E31": return planning && s.job>0 && known.length>0;
    case "E32":return planning && witness;
    case "E33":return cases.some(x=>
      x.reason==="institution-refused" && x.endedAt?.year===s.year &&
      x.applicationId &&
      s.educationAccess?.notices?.[x.applicationId]?.result==="not-accepted");
    case "E13": return !!school && school.teachingEquivalent>0 &&
      educationP17SchoolExperience(s,"paid-commute-quote") &&
      (letter!=="A"||educationP17SchoolExperience(s,"paid-commute-pass"));
    case "E14":case "E15": return !!school && witness &&
      !educationCanReach(s,{institutionId:current.m.institutionId,
        campusId:current.m.campusId,offeringId:current.offering.id,
        year:s.year,month:s.mo,purpose:"daily-commute"}).reachable;
    case "E22":return !!school && school.teachingEquivalent>0 &&
      educationP17SchoolExperience(s,"long-commute");
    case "E23":{
      if(!school || !current)return false;
      const prev=s.mo===1?{year:s.year-1,month:12}:
        {year:s.year,month:s.mo-1},
        args={originAreaId:s.local?.educationAreaId,
          campusAreaId:world.campuses?.[current.m.campusId]?.educationAreaId,
          purpose:"daily-commute"},
        earlier=educationFindRoute(s,{...args,...prev}),
        now=educationFindRoute(s,{...args,year:s.year,month:s.mo});
      return earlier.status==="blocked" && now.status==="feasible" &&
        earlier.reasonCodes.some(code=>["route-suspended","no-active-link",
          "no-return-service"].includes(code));
    }
    case "E29":return !!school && witness &&
      !educationCanReach(s,{institutionId:current.m.institutionId,
        campusId:current.m.campusId,offeringId:current.offering.id,
        year:s.year,month:s.mo,purpose:"daily-commute"}).reachable;
    case "E36":return educationP17SchoolExperience(s,"teacher-shortage");
    case "E37":return educationP17SchoolExperience(s,"specialized-laboratory");
    case "E38":return !!school && school.teachingEquivalent===0;
    case "E39":return educationP17SchoolExperience(s,"teacher-evacuated");
    case "E40":{
      if(!current || school?.learningContinuity!=="alternative_classroom" ||
         !school.alternativeCampusId)return false;
      return Object.values(
        s.educationAttendance?.enrollments?.[current.enroll.id]?.[s.year]||{}
      ).some(month=>Object.values(month.segments||{}).some(seg=>
        seg.offeringId===current.offering.id && seg.recognized &&
        seg.schoolDelivery>0 && !!seg.evidenceRef));
    }
    case "E42":return !!educationP17ExternalBasis(s,"E42");
    case "E44":return s.educationRecord?.enrollments?.some(x=>
      x.status!=="enrolled"&&x.institutionId) &&
      Object.values(s.educationPeopleTies?.items||{}).some(x=>
        x.role==="teacher"&&x.personallyKnown) && witness;
    case "E45":return s.age<18 && cases.some(x=>
      x.reason==="guardian-refused" && x.endedAt?.year===s.year);
    case "E46":return Object.values(s.dependentEducation||{})
      .filter(child=>Object.values(s.educationFinance?.invoices||{})
        .some(invoice=>invoice.personId===child.personId &&
          invoice.kind==="tuition" && invoice.outstanding>0)).length>=2;
    case "E55":return Object.values(s.dependentEducation||{})
      .some(child=>child.knownFacts?.some(fact=>
        fact.certainty==="reported" &&
        fact.claim?.schoolOfferingId &&
        world.offerings?.[fact.claim.schoolOfferingId]));
    case "E16":return Object.values(
        s.educationMobility?.residenceOffers||{}).some(x=>
          x.evidenceRef && x.campusId &&
          world.campuses?.[x.campusId] &&
          (x.offeringId===item?.offeringId ||
           x.offeringId===current?.offering.id));
    case "E17":case "E18":case "E19":
      return witness && (letter!=="A" || review==="E19" ||
        Object.values(s.educationMobility?.residenceContracts||{})
          .some(x=>x.status==="committed"&&x.evidenceRef));
    case "E58":{
      const prev=s.mo===1?{year:s.year-1,month:12}:
        {year:s.year,month:s.mo-1};
      return Object.values(world.offerings||{}).some(x=>
        x.stage==="university" &&
        world.campuses?.[x.campusId]?.educationAreaId===area &&
        (()=>{
          const now=educationSchoolStatusAt(s,x.id,s.year,s.mo),
            former=educationSchoolStatusAt(s,x.id,prev.year,prev.month);
          return now && former && now.teachingEquivalent!==former.teachingEquivalent &&
            (now.activeEffectIds.length || former.activeEffectIds.length);
        })());
    }
    case "E63":case "E71":{
      const kind=review==="E63"?"dojo-or-guild":"corporate-training",
        required=review==="E63"?"craft":"safety",
        month=s.year*12+s.mo;
      return Object.values(world.informalProviders||{}).some(x=>
        x.kind===kind && x.areaId===area && x.status==="active" &&
        !!x.evidenceRef && x.subjectIds?.includes(required) &&
        x.activeFrom?.year*12+(x.activeFrom?.month??1)<=month &&
        (!x.activeTo ||
         x.activeTo.year*12+(x.activeTo.month??12)>=month));
    }
    case "E69":return institutionOfferings(s,area,"arts").some(x=>
      x.admissionTier>=2 &&
      ["open","limited"].includes(
        educationSchoolStatusAt(s,x.id,s.year,s.mo)?.admissionStatus));
    case "E56":case "E61":case "E62":case "E64":
    case "E67":case "E70":case "E72":
      return witness && !!world.areas?.[area];
    case "E68":return witness;
    case "E74":return !!world.areas?.[area] && (s.age>=12);
    case "E75":return witness &&
      s.educationRecord?.enrollments?.some(x=>x.region==="ウルサス" &&
        x.startedYear<=1096 && (x.endedYear??s.year)>=1096);
    case "E76":return witness;
    case "E77":return witness;
    case "E78":return !!school && school.teachingEquivalent>0 &&
      Object.values(s.educationPeopleTies?.items||{}).some(x=>
        x.enrollmentId===current.enroll.id&&x.role==="peer"&&x.personallyKnown);
    case "E79":return !!school && !!educationP17ExternalBasis(s,"E79");
    case "E80":return s.age>=25 && !current &&
      s.lifeRecord?.careerChanges?.length>0 &&
      institutionOfferings(s,area,"vocational").some(x=>
        ["open","limited"].includes(educationSchoolStatusAt(s,x.id,
          s.year,s.mo)?.admissionStatus));
    default: return false;
  }
}
function educationP17ExtraApply(s,review,letter,eventId){
  const item=educationActiveCase(s);
  if(!educationP17ExtraEligible(s,review,letter))return false;
  const decision={
    E01:{A:"case:search-adjacent",B:"case:nonformal"},
    E05:{A:"case:search-adjacent",C:"case:defer"},
    E06:{B:"case:defer"},
    E09:{A:"case:commit",B:"case:decline-offer"},
    E12:{A:"case:defer",B:"case:nonformal"}
  }[review]?.[letter];
  if(decision && !educationCaseAction(s,decision))return false;
  const external=["E20","E27","E42","E79"].includes(review) &&
    letter==="A"?educationP17ExternalBasis(s,review):null;
  if(["E20","E27","E42","E79"].includes(review) &&
     letter==="A" && !external)return false;
  const current=educationMigrationCurrent(s);
  const routeCheck=letter==="A" && ["E14","E23"].includes(review) &&
    current ? educationFindRoute(s,{
      originAreaId:s.local?.educationAreaId,
      campusAreaId:s.world.educationWorld.campuses[
        current.offering.campusId]?.educationAreaId,
      year:s.year,month:s.mo,purpose:"daily-commute"
    }) : null;
  const schoolStatus=routeCheck && educationSchoolStatusAt(s,
    current.offering.id,s.year,s.mo);
  educationMigrationRecord(s,eventId,letter,{
    evidenceRef:educationP17Witness(s,review)?review+":"+s.year+":"+s.mo:null,
    caseId:item?.id||null,informationOnly:review!=="E09"||letter!=="A",
    formalEnrollmentIssued:review==="E09"&&letter==="A",
    awardIssued:false,automaticPayment:false,
    ...(external?{externalRequest:{
      id:eventId+":"+educationMigrationScope(s,eventId)+":request",
      reviewId:review,issuedAt:{year:s.year,month:s.mo},...external
    }}:{}),
    ...(routeCheck?{routeCheck:{
      status:routeCheck.status,
      reasonCodes:routeCheck.reasonCodes,
      basisRefs:routeCheck.basisRefs||[],
      checkedAt:{year:s.year,month:s.mo},
      schoolTeaching:schoolStatus?.teachingEquivalent??0
    }}:{})
  });
  return true;
}

const EDUCATION_MIGRATION_NONFORMAL = Object.freeze({
  edu_roving_teacher_visit: {
    mode:"roving-tutor",kind:"roving-tutor",subject:"basic_literacy"},
  edu_community_tent_learning: {
    mode:"temporary-community-class",kind:"temporary-community-class",
    subject:"basic_literacy"},
  edu_apprentice_literacy_exchange: {
    mode:"workshop-apprenticeship",kind:"workshop-apprenticeship",subject:"repair"},
  edu_correspondence_lessons: {
    mode:"correspondence",kind:"correspondence",subject:"academic_knowledge"},
  edu_religious_school_nonformal: {
    mode:"religious-community",kind:"religious-community",subject:"literacy"},
  edu_clan_knowledge_transmission: {
    mode:"clan-tradition",kind:"clan-tradition",subject:"terrain"},
  edu_adult_evening_literacy: {
    mode:"evening-literacy",kind:"evening-literacy",subject:"basic_literacy"}
});
function educationMigrationProviderFor(s,eventId) {
  const config=EDUCATION_MIGRATION_NONFORMAL[eventId],
    providers=s.world?.educationWorld?.informalProviders||{},
    areaId=s.local?.educationAreaId;
  if(!config||!areaId)return null;
  const now=s.year*12+(s.mo||0);
  return Object.values(providers).filter(p=>
    p.kind===config.kind && p.status==="active" &&
    p.areaId===areaId && p.evidenceRef &&
    Array.isArray(p.subjectIds) && p.subjectIds.includes(config.subject) &&
    now>=p.activeFrom.year*12+(p.activeFrom.month||0) &&
    (!p.activeTo ||
      now<=p.activeTo.year*12+(p.activeTo.month??12)))
    .sort((a,b)=>a.id.localeCompare(b.id))[0]||null;
}

function educationMigrationCurrent(s) {
  const m=s.educationPath,enroll=educationActiveEnrollment(s);
  if(!enroll||m.status!=="enrolled"||
     !s.world?.educationWorld?.institutions?.[m.institutionId])return null;
  const offering=s.world.educationWorld.offerings?.[m.offeringId];
  if(!offering||offering.institutionId!==m.institutionId)return null;
  return {m,enroll,offering};
}
function educationMigrationTransferOffer(s) {
  const current=educationMigrationCurrent(s);
  if(!current)return null;
  const {m,enroll}=current;
  const approvals=Object.entries(s.educationTransferApprovals||{})
    .filter(([,a])=>a.approved && a.reviewStatus!=="declined" &&
      a.fromEnrollmentId===enroll.id &&
      a.effectiveFrom?.year===s.year &&
      a.effectiveFrom?.month===(s.mo||0) &&
      a.sourceRef && a.recognitionRef && a.fundingClearanceRef &&
      a.creditRecognitionStatus==="approved" &&
      a.tuitionRecognitionStatus==="approved").sort(([a],[b])=>a.localeCompare(b));
  for(const [id,approval] of approvals){
    const target=s.world?.educationWorld?.offerings?.[approval.toOfferingId];
    if(!target||target.stage!==m.stage ||
       target.institutionId===m.institutionId)continue;
    const status=educationSchoolStatusAt(s,target.id,s.year,s.mo||0);
    if(!["open","limited"].includes(status?.admissionStatus) ||
       status.teachingEquivalent<=0)continue;
    const route=educationCanReach(s,{
      institutionId:target.institutionId,campusId:target.campusId,
      offeringId:target.id,year:s.year,month:s.mo||0,purpose:"daily-commute"
    });
    if(!route.reachable)continue;
    const oldInvoice=s.educationFinance?.invoices?.[enroll.id+":tuition:"+s.year];
    if(oldInvoice?.status!=="paid")continue;
    const oldFee=educationFunds(s,m.stage,m.tier,m.offeringId),
      nextFee=educationFunds(s,m.stage,target.admissionTier,target.id),
      differential=approval.feeInvoiceId?
        s.educationFinance?.invoices?.[approval.feeInvoiceId]:null;
    if(approval.feeInvoiceId && differential?.status!=="paid")continue;
    if(nextFee>oldFee&&
       (!differential||differential.kind!=="tuition" ||
        differential.recipient?.id!==target.institutionId ||
        differential.serviceYear!==s.year ||
        differential.net<nextFee-oldFee))continue;
    return {id,approval,target};
  }
  return null;
}
function educationMigrationRecognitionTarget(s) {
  const world=s.world?.educationWorld;
  if(!world)return null;
  const paths=(s.learningPaths||[]).filter(p=>
    p.participation?.length && p.evidenceIds?.length);
  for(const path of paths)
    for(const school of Object.values(world.institutions||{}))
      for(const [ruleId,rule] of Object.entries(school.nonformalRecognitionRules||{})){
        if(rule.approved&&rule.sourceRef&&rule.jurisdiction===s.res?.n &&
           ["entry_eligibility","partial_course_credit",
             "skill_certificate","occupational_registration"].includes(rule.kind))
          return {path,school,rule,ruleId};
      }
  return null;
}
function educationMigrationScope(s,eventId) {
  const current=educationMigrationCurrent(s);
  if(eventId==="edu_school_confidential_disclosure")
    return (current?.enroll.id||"none")+":"+s.year;
  if(["edu_first_day_of_actual_school",
    "edu_real_institution_transfer","edu_graduation_record_review"].includes(eventId))
    return current?.enroll.id||"none";
  const provider=educationMigrationProviderFor(s,eventId);
  if(provider)return provider.id+":"+s.year;
  return String(s.year);
}
function educationMigrationEligible(s,eventId,choice=null) {
  if(!s||s.dead||!s.world?.educationWorld||!(s.mo>=1&&s.mo<=12))
    return false;
  const current=educationMigrationCurrent(s),
    key=eventId+":"+educationMigrationScope(s,eventId);
  if(s.educationMigration?.seen?.[key])return false;
  if(eventId==="edu_school_confidential_disclosure"){
    if(!current||!s.inf||!s.fl?.dg)return false;
    const people=Object.values(s.world.educationWorld.staff||{}).filter(p=>
      p.institutionId===current.m.institutionId &&
      p.offeringId===current.m.offeringId && p.status==="assigned");
    if(!people.length)return false;
    const teacher=people[0],
      teacherKnows=educationRecipientInfectionKnowledge(s,{
        institutionId:current.m.institutionId,recipientKind:"teacher",
        personId:teacher.id}).status==="individual-confirmed",
      official=educationRecipientInfectionKnowledge(s,{
        institutionId:current.m.institutionId,recipientKind:"institution"
      }).status==="institution-confirmed";
    return choice==="A"?!teacherKnows:
      choice==="B"?!official:!teacherKnows||!official;
  }
  if(eventId==="edu_first_day_of_actual_school"){
    if(!current)return false;
    const year=current.enroll.startedYear;
    if(s.year!==year)return false;
    const status=educationSchoolStatusAt(s,current.offering.id,s.year,s.mo);
    if(!status||status.teachingEquivalent<=0)return false;
    return educationCanReach(s,{
      institutionId:current.m.institutionId,campusId:current.m.campusId,
      offeringId:current.offering.id,year:s.year,month:s.mo,
      purpose:"daily-commute"
    }).reachable;
  }
  if(eventId==="edu_real_institution_transfer")
    return !!educationMigrationTransferOffer(s);
  if(eventId==="edu_graduation_record_review")
    return !!current && s.mo>=11 &&
      Object.values(s.educationCredits?.items||{}).some(x=>
        x.enrollmentId===current.enroll.id ||
        (s.educationCreditTransfers?.items?.[current.enroll.id]?.acceptedCreditIds||[]).includes(x.id));
  if(eventId==="edu_informal_skill_assessment")
    return !!educationMigrationRecognitionTarget(s);
  const review=window.GAME_DATA?.EDUCATION_P17_REVIEWED?.find(x=>x.eventId===eventId)?.reviewId;
  if(EDUCATION_P17_EXTRA.has(review))return educationP17ExtraEligible(s,review,choice);
  const config=EDUCATION_MIGRATION_NONFORMAL[eventId];
  if(!config)return false;
  if(eventId==="edu_adult_evening_literacy" &&
     (s.age<18 || (s.socialLearning?.literacy??100)>=45))return false;
  if(eventId==="edu_correspondence_lessons"){
    const delivery=s.educationLearningDeliveries?.items;
    if(!delivery||!Object.values(delivery).some(row=>
      row.personId==="protagonist" &&
      row.providerId===educationMigrationProviderFor(s,eventId)?.id &&
      row.status==="delivered" && row.evidenceRef &&
      row.deliveredAt?.year===s.year))return false;
  }
  if(eventId==="edu_apprentice_literacy_exchange"){
    const ties=s.educationWorkshopLinks?.items||{};
    if(!Object.values(ties).some(row=>row.personId==="protagonist" &&
      row.providerId===educationMigrationProviderFor(s,eventId)?.id &&
      row.status==="active"))return false;
  }
  if(eventId==="edu_religious_school_nonformal"){
    if(!Object.values(s.educationCommunityPermissions?.items||{}).some(row=>
      row.providerId===educationMigrationProviderFor(s,eventId)?.id &&
      row.personId==="protagonist"&&row.status==="granted"))return false;
  }
  if(eventId==="edu_clan_knowledge_transmission"){
    if(!Object.values(s.educationMentorTies?.items||{}).some(row=>
      row.personId==="protagonist" &&
      row.providerId===educationMigrationProviderFor(s,eventId)?.id &&
      row.status==="active"))return false;
  }
  if(eventId==="edu_adult_evening_literacy"&&
     (s.sn?.v77_adult_literacy_path===s.year ||
      s.sn?.life_night_study===s.year))return false;
  return !!educationMigrationProviderFor(s,eventId);
}

// A conditional P17 notice describes an observed result, never the mere
// decision to apply. The originating choice is the owner of its one-time log.
// A written response from the relevant authority is the only source of
// these four outcomes. It cannot enroll, pay tuition, or award a credential.
function educationP17RecordExternalDecision(s,{requestId,issuerId,status,
  evidenceRef,approvedAmount=null,makeupAt=null,adjustmentRef=null}={}) {
  const record=s.educationMigration?.records?.find(x=>
    x.result?.externalRequest?.id===requestId),
    request=record?.result?.externalRequest,
    review=request?.reviewId,
    now={year:s.year,month:s.mo};
  if(!request || record.choice!=="A" || !evidenceRef ||
     evidenceRef===request.sourceRef || issuerId!==request.issuerId ||
     !["E20","E27","E42","E79"].includes(review) ||
     !["approved","rejected",...(review==="E42"?["undetermined"]:[])].includes(status) ||
     (status==="undetermined" && review!=="E42") ||
     now.year*12+now.month<record.at.year*12+record.at.month)
    throw Error("教育申請の相手方・結果または通知証拠が一致しない");
  const source=review==="E20"?
    s.educationTravelRequirements?.items?.[request.sourceId]:
    review==="E27"?s.educationEmployerPrograms?.items?.[request.sourceId]:
    review==="E42"?
      Object.values(s.educationSchoolExperiences?.items||{}).find(x=>
        x.examId===request.sourceId && x.experienceTag==="examination-cancelled"):
      s.educationMobility?.accessibilityProfiles?.[request.enrollmentId];
  const examSession=review==="E42"?
      s.educationExamSessions?.items?.[request.sourceId]:null,
    adjustment=review==="E79" && status==="approved"?
      s.educationMobility?.schoolAdjustments?.[adjustmentRef]:null;
  if(!source || source.evidenceRef!==request.sourceRef ||
     (review==="E42" && (
       !examSession || examSession.institutionId!==issuerId ||
       examSession.enrollmentId!==request.enrollmentId ||
       examSession.offeringId!==request.offeringId ||
       (status==="approved" &&
         (examSession.status!=="rescheduled" ||
          !examSession.evidenceRef ||
          examSession.makeupAt?.year!==makeupAt?.year ||
          examSession.makeupAt?.month!==makeupAt?.month)))) ||
     (review==="E79" && status==="approved" && (
       !adjustment || adjustment.status!=="verified" ||
       !adjustment.evidenceRef ||
       adjustment.institutionId!==issuerId ||
       adjustment.enrollmentId!==request.enrollmentId ||
       adjustment.offeringId!==request.offeringId ||
       !request.needs.every(need=>adjustment.supportedNeeds?.includes(need)))) ||
     (review==="E27" && (status==="approved" &&
       (!Number.isSafeInteger(approvedAmount) || approvedAmount<=0 ||
        approvedAmount>request.maxContribution))) ||
     (review==="E42" && (status==="approved"?
       !makeupAt || !Number.isInteger(makeupAt.year) ||
         !Number.isInteger(makeupAt.month) || makeupAt.month<1 ||
         makeupAt.month>12 || makeupAt.year*12+makeupAt.month<
           now.year*12+now.month : makeupAt!==null)) ||
     (review==="E79" && status==="approved" && !adjustmentRef))
    throw Error("教育申請の原本・支援額・振替日・配慮決定が不足");
  s.educationP17Decisions ||= {version:1,items:{}};
  const ledger=s.educationP17Decisions;
  if(ledger.version!==1)throw Error("教育通知の決定台帳の版が不正");
  const result={id:requestId,requestId,reviewId:review,
    issuerId,status,evidenceRef,decidedAt:now,
    ...(status==="approved" && review==="E27"?{approvedAmount}:{}),
    ...(makeupAt?{makeupAt:{...makeupAt}}:{}),
    ...(adjustmentRef?{adjustmentRef}:{})};
  const existing=ledger.items[requestId];
  if(existing){
    if(existing.status!==result.status ||
       existing.evidenceRef!==result.evidenceRef ||
       existing.issuerId!==result.issuerId)
      throw Error("同一教育申請に異なる発行者または結果が登録された");
    return existing;
  }
  ledger.items[requestId]=result;
  educationP17ReconcileNotices(s);
  return result;
}
function educationP17NoticeRegisteredSource(s,row,record) {
  if(!row || row.status!=="verified" || !row.evidenceRef ||
     row.reviewId!==window.GAME_DATA.EDUCATION_P17_REVIEWED?.find(x=>
       x.eventId===record.eventId)?.reviewId ||
     row.choiceLetter!==record.choice ||
     !Number.isInteger(row.noticeIndex) || row.noticeIndex<0 ||
     !row.sourceId || !row.sourceKind || !row.sourceStatus ||
     !Number.isInteger(row.year) || !Number.isInteger(row.month) ||
     row.year*12+row.month<record.at.year*12+record.at.month ||
     row.year*12+row.month>s.year*12+(s.mo??0) ||
     (row.areaId!==s.local?.educationAreaId &&
      row.areaId!=="region:"+s.res?.n))return false;
  const roots={
    "admission-notice":s.educationAccess?.notices,
    "case-decision":s.educationCases?.items,
    "residence-offer":s.educationMobility?.residenceOffers,
    "residence-contract":s.educationMobility?.residenceContracts,
    "transport-transaction":s.educationMobility?.transportTransactions,
    "finance-posting":s.educationFinance?.postings,
    "recognition-inquiry":s.educationRecognitionInquiries?.items
  };
  const obj=roots[row.sourceKind]?.[row.sourceId];
  if(!obj)return false;
  const actual=obj.status??obj.result??obj.reason??obj.reviewStatus;
  if(actual!==row.sourceStatus)return false;
  if(record.result?.caseId &&
     row.sourceKind==="case-decision"&&row.sourceId!==record.result.caseId)
    return false;
  return true;
}
function educationP17NoticeOutcome(s,record,review,letter) {
  const caseItem=s.educationCases?.items?.[record.result?.caseId],
    access=s.educationAccess,world=s.world?.educationWorld;
  if(["E20","E27","E42","E79"].includes(review)&&letter==="A"){
    const request=record.result?.externalRequest,
      decision=s.educationP17Decisions?.items?.[request?.id];
    if(!request || !decision || decision.requestId!==request.id ||
       decision.issuerId!==request.issuerId ||
       decision.reviewId!==review || !decision.evidenceRef ||
       decision.decidedAt.year*12+decision.decidedAt.month<
         record.at.year*12+record.at.month)return null;
    return {index:decision.status==="approved"?0:1,
      evidenceRef:decision.evidenceRef};
  }
  if(review==="E09"&&letter==="A" && caseItem?.reason==="accepted-not-enrolled")
    return {index:0,evidenceRef:caseItem.id+":accepted-not-enrolled"};
  if(review==="E16"&&letter==="A"){
    const candidates=Object.values(s.educationMobility?.residenceOffers||{})
      .filter(x=>x.evidenceRef && x.campusId &&
        (x.offeringId===caseItem?.offeringId ||
         x.campusId===s.educationPath?.campusId));
    const offer=candidates.sort((a,b)=>String(a.id).localeCompare(String(b.id)))[0];
    if(offer?.approved && offer.capacityRemaining>0)
      return {index:0,evidenceRef:offer.evidenceRef};
    if(offer && offer.capacityRemaining===0)
      return {index:1,evidenceRef:offer.evidenceRef};
  }
  if((review==="E14"||review==="E23")&&letter==="A"){
    const route=record.result?.routeCheck;
    if(route?.checkedAt?.year===record.at.year &&
       route.checkedAt.month===record.at.month &&
       ["feasible","blocked"].includes(route.status)){
      const index=review==="E14"?
        (route.status==="feasible"?0:1):
        (route.status==="feasible"&&route.schoolTeaching>0?0:1);
      return {index,evidenceRef:record.id+":route-inquiry:"+
        record.at.year+":"+record.at.month};
    }
  }
  if(review==="E28"&&letter==="A"){
    if(caseItem?.reason==="admitted" && caseItem.commit?.enrollmentId){
      const invoiceId=caseItem.commit.enrollmentId+":tuition:"+
        caseItem.commit.committedAt.year;
      const loan=Object.values(s.educationFinance?.loans||{}).find(x=>
        x.invoiceId===invoiceId && x.principal>0 &&
        s.educationFinance?.invoices?.[invoiceId]?.status==="paid");
      if(loan)return {index:0,evidenceRef:loan.id};
    }
  }
  if(review==="E26"&&letter==="A"){
    const offer=access?.financingOffers?.[record.result?.caseId];
    if(offer?.source==="institutional-desk-inquiry" &&
       offer.checkedAt?.year>=record.at.year)
      return {index:offer.grant?0:1,evidenceRef:
        offer.grant?.id||offer.caseId+":institutional-desk-inquiry"};
  }
  if(review==="E38"&&letter==="B" && caseItem?.reason==="paused" &&
     caseItem.endedAt?.year>=record.at.year)
    return {index:0,evidenceRef:caseItem.id+":paused"};
  if(review==="E40"&&letter==="A"){
    const current=educationMigrationCurrent(s);
    if(current){
      const yearRows=s.educationAttendance?.enrollments?.[current.enroll.id];
      const months=yearRows?.[s.year]||{};
      for(const month of Object.values(months)){
        for(const segment of Object.values(month.segments||{})){
          const state=educationSchoolStatusAt(s,segment.offeringId,
            month.academicYear,month.month);
          if(segment.offeringId!==current.offering.id ||
             !segment.evidenceRef || !state ||
             state.learningContinuity!=="alternative_classroom" ||
             segment.schoolDelivery<=0)continue;
          return {index:segment.recognized&&segment.equivalent>0?0:1,
            evidenceRef:segment.evidenceRef};
        }
      }
    }
  }
  if(review==="E54"&&letter==="A"){
    const inquiries=Object.values(s.educationRecognitionInquiries?.items||{})
      .filter(x=>x.sourceEventId===record.eventId &&
        x.at?.year>=record.at.year);
    for(const inquiry of inquiries){
      const success=["approved","recognized","awarded"].includes(inquiry.status),
        failed=["denied","rejected","failed"].includes(inquiry.status);
      const assessment=s.educationRecognitionAssessments?.items?.[
        inquiry.assessmentEvidenceRef],
        matching=!!assessment &&
          assessment.applicationId===inquiry.id &&
          assessment.pathId===inquiry.pathId &&
          assessment.authorityId===inquiry.authorityId &&
          assessment.ruleId===inquiry.ruleId;
      const award=success && matching && assessment.verdict==="passed" &&
        (s.educationRecord?.recognitions||[]).some(x=>
          x.recognitionId===inquiry.awardId &&
          x.applicationId===inquiry.id &&
          x.sourceEvidenceIds?.includes(inquiry.assessmentEvidenceRef));
      if(award)return {index:0,evidenceRef:inquiry.assessmentEvidenceRef};
      if(failed && matching && assessment.verdict==="failed")
        return {index:1,evidenceRef:inquiry.assessmentEvidenceRef};
    }
  }
  if(review==="E68"&&letter==="B"){
    const searches=(access?.searches||[]).filter(x=>
      x.checkedAt?.year*12+x.checkedAt?.month>=
        record.at.year*12+record.at.month &&
      x.areaIds?.includes(s.local?.educationAreaId) &&
      x.foundIds?.length===0);
    if(searches.length)
      return {index:0,evidenceRef:searches[0].caseId+":locality-inquiry"};
  }
  const entry=window.GAME_DATA.EDUCATION_P17_REVIEWED?.find(x=>x.reviewId===review),
    choice=entry?.choices.find(x=>x.letter===letter);
  const proof=Object.values(s.educationSceneEvidence?.items||{})
    .filter(x=>x.noticeIndex<choice?.notifications.length &&
      educationP17NoticeRegisteredSource(s,x,record))
    .sort((a,b)=>a.year-b.year||a.month-b.month||
      String(a.evidenceRef).localeCompare(String(b.evidenceRef)))[0];
  return proof?{index:proof.noticeIndex,evidenceRef:proof.evidenceRef}:null;
}
function educationP17ReconcileNotices(s) {
  if(!s||s.dead || !s.educationMigration?.records?.length)return 0;
  const reviewed=window.GAME_DATA.EDUCATION_P17_REVIEWED||[];
  let delivered=0;
  for(const record of s.educationMigration.records){
    if(record.notice || !record.at || record.at.year>s.year ||
       record.at.year===s.year&&record.at.month>(s.mo??0))continue;
    const entry=reviewed.find(x=>x.eventId===record.eventId);
    if(!entry || entry.decision==="保留")continue;
    const choice=entry.choices.find(x=>x.letter===record.choice);
    if(!choice?.notifications.length)continue;
    const truth=educationP17NoticeOutcome(s,record,entry.reviewId,record.choice);
    if(!truth || !Number.isInteger(truth.index) ||
       !choice.notifications[truth.index] || !truth.evidenceRef)continue;
    record.notice={index:truth.index,evidenceRef:truth.evidenceRef,
      deliveredAt:{year:s.year,month:s.mo??0}};
    if(typeof L==="function")L(choice.notifications[truth.index]);
    delivered++;
  }
  return delivered;
}
function educationMigrationRecord(s,eventId,letter,result={},scopeOverride=null) {
  s.educationMigration ||= {version:1,seen:{},records:[]};
  const reg=s.educationMigration,
    scope=scopeOverride||educationMigrationScope(s,eventId),
    id=eventId+":"+scope;
  if(reg.seen[id])return reg.seen[id];
  const record={id,eventId,choice:letter,
    at:{year:s.year,month:s.mo},result:{...result},
    sourceKind:"P17-reviewed-scene"};
  reg.seen[id]=record;reg.records.push(record);
  educationP17ReconcileNotices(s);
  return record;
}
function educationMigrationApply(s,action) {
  if(typeof action!=="string")throw Error("教育イベントの選択内容が不正");
  const [review,letter]=action.split(":"),
    entry=window.GAME_DATA.EDUCATION_P17_REVIEWED?.find(x=>x.reviewId===review),
    eventId=entry?.eventId;
  if(!entry||!educationMigrationEligible(s,eventId,letter))
    throw Error("学校イベントの在籍・人物・募集・時間条件が変わった");
  const current=educationMigrationCurrent(s);
  if(review==="E34"){
    if(letter!=="C"){
      const teacher=letter==="A"?
        Object.values(s.world.educationWorld.staff||{}).find(p=>
          p.institutionId===current.m.institutionId &&
          p.offeringId===current.m.offeringId&&p.status==="assigned"):null;
      educationRecordSchoolDisclosure(s,{
        institutionId:current.m.institutionId,
        recipientKind:teacher?"teacher":"institution",
        personId:teacher?.id||null,
        certainty:"confirmed",source:"self-disclosure",consent:"voluntary",
        evidenceRef:eventId+":"+current.enroll.id+":"+s.year+":"+letter
      });
    }
    educationMigrationRecord(s,eventId,letter,{
      institutionId:current.m.institutionId,
      teacherOnly:letter==="A",schoolOfficial:letter==="B"
    });
    return true;
  }
  if(review==="E35"){
    educationMigrationRecord(s,eventId,"solo",{
      enrollmentId:current.enroll.id,
      institutionId:current.m.institutionId
    });
    return true;
  }
  if(review==="E41"){
    const target=educationMigrationTransferOffer(s);
    if(!target)return false;
    const oldId=current.enroll.id;
    if(letter==="A"){
      const transferred=educationTransferToApprovedInstitution(s,target.id);
      if(!transferred)throw Error("確定した新校への学籍転籍に失敗");
      educationMigrationRecord(s,eventId,letter,{
        formerEnrollmentId:oldId,newEnrollmentId:transferred.id,
        targetInstitutionId:target.target.institutionId
      },oldId);
    }else{
      target.approval.reviewStatus="declined";
      educationMigrationRecord(s,eventId,letter,{
        formerEnrollmentId:oldId,approvalId:target.id,decision:"declined"
      });
    }
    if(s.educationDecision?.kind==="transfer")s.educationDecision=null;
    return true;
  }
  if(review==="E43"){
    const ids=educationTransferredCreditIds(s,current.enroll.id);
    const result=educationCreditForPreviousYear(s);
    educationMigrationRecord(s,eventId,letter,{
      enrollmentId:current.enroll.id,
      checkedCreditIds:ids,
      latestRecognized:!!result?.credited,
      action:letter==="A"?"reviewed-records":"requested-remedial-advice"
    });
    return true;
  }
  if(review==="E54"){
    const target=educationMigrationRecognitionTarget(s);
    if(!target)return false;
    if(letter==="A"){
      s.educationRecognitionInquiries ||= {version:1,items:{}};
      const id="edu-recogn-inquiry:"+s.year+":"+target.path.pathId;
      s.educationRecognitionInquiries.items[id] ||= {
        id,personId:"protagonist",pathId:target.path.pathId,
        authorityId:target.school.id,ruleId:target.ruleId,
        status:"awaiting-assessment",sourceEventId:eventId,
        at:{year:s.year,month:s.mo},
        awardId:null
      };
    }
    educationMigrationRecord(s,eventId,letter,{
      pathId:target.path.pathId,authorityId:target.school.id,
      noAutomaticQualification:true
    });
    return true;
  }
  if(EDUCATION_P17_EXTRA.has(review))return educationP17ExtraApply(s,review,letter,eventId);
  const config=EDUCATION_MIGRATION_NONFORMAL[eventId],
    provider=educationMigrationProviderFor(s,eventId);
  if(!config||!provider)return false;
  // Preparing a tent classroom and inspecting an evening school do not
  // enroll the visitor or manufacture an attended lesson.
  if((review==="E48"||review==="E53")&&letter==="B"){
    educationMigrationRecord(s,eventId,letter,{
      providerId:provider.id,observationOnly:true,
      formalEnrollmentIssued:false,actualParticipation:false
    });
    return true;
  }
  const subjectId=letter==="B"&&review==="E51"?"ritual_knowledge":
    config.subject;
  let mode=config.mode,providerId=provider.id;
  if(letter==="B"&&["E47","E50"].includes(review)){
    mode="self-directed";providerId="self";
  }
  const path=educationOpenLearningPath(s,{
    personId:"protagonist",modeId:mode,providerId,
    siteRef:{region:s.res.n,areaId:s.local.educationAreaId,
      placeId:s.local.placeId,attendanceMode:providerId==="self"?"self":"in-person"},
    subjectIds:[providerId==="self"?"academic_knowledge":subjectId],
    sourceEventId:eventId+":"+s.year+":"+s.mo+":"+letter
  });
  const attended=review==="E47"&&letter==="A" ||
    review==="E48"&&letter==="A" ||
    review==="E49"&&["A","B"].includes(letter) ||
    review==="E50"&&letter==="B" ||
    review==="E51"&&["A","B"].includes(letter) ||
    review==="E52"&&["A","B"].includes(letter);
  if(attended)educationRecordLearningParticipation(s,{
    pathId:path.pathId,year:s.year,month:s.mo,
    attendedSessions:letter==="B"?1:2,totalSessions:2,
    evidenceRef:eventId+":"+s.year+":"+s.mo+":"+letter+":lesson"
  });
  educationMigrationRecord(s,eventId,letter,{
    pathId:path.pathId,providerId,actualParticipation:attended,
    formalEnrollmentIssued:false
  });
  return true;
}
// Existing narrated tutoring with legacy immediate stat effects is an
// independently observed encounter. Link it to P12 as already applied,
// never awarding the same literacy or expertise a second time.
function educationMigrationLinkLegacyLearning(s,effect) {
  const id=TRACE_RESOLUTION?.id,letter=TRACE_RESOLUTION?.label;
  if(!id||!letter||!s.world?.educationWorld||!s.local?.educationAreaId||
     s.mo<1||s.mo>12)return null;
  let mode=null,kind=null,subject=null,participation=1;
  if(id==="v77_child_informal_study" && effect.literacyGain>0){
    mode="neighborhood-literacy";kind=mode;subject="basic_literacy";
  }else if(id==="v77_adult_literacy_path"&&effect.literacyGain>=8){
    mode="evening-literacy";kind=mode;subject="basic_literacy";
  }else if(id==="life_night_study"&&effect.ep>0&&effect.cash<0){
    mode="evening-vocational";kind=mode;subject="technical";
    participation=effect.ep>=8?1:0.5;
  }else if(id==="life_youth_apprenticeship"&&effect.lifeSkill?.id==="youth-workshop-learning"){
    mode="workshop-apprenticeship";kind=mode;subject="repair";
  }else return null;
  const providerId="observed-informal:"+id+":"+s.year+":"+s.mo,
    sourceEventId=id+":"+s.year+":"+s.mo,
    areaId=s.local.educationAreaId;
  const provider=educationRegisterInformalProvider(s,{
    providerId,personId:"unnamed-mentor:"+sourceEventId,
    kind,areaId,activeFrom:{year:s.year,month:s.mo},
    subjectIds:[subject],evidenceRef:sourceEventId+":direct-encounter"
  });
  const path=educationOpenLearningPath(s,{
    modeId:mode,providerId:provider.id,
    siteRef:{region:s.res.n,areaId,placeId:s.local.placeId,
      attendanceMode:"observed-lesson"},
    subjectIds:[subject],sourceEventId
  });
  const row=educationRecordLearningParticipation(s,{
    pathId:path.pathId,year:s.year,month:s.mo,
    attendedSessions:Math.round(participation*2),totalSessions:2,
    evidenceRef:sourceEventId+":original-outcome",
    alreadyApplied:true
  });
  return row;
}
