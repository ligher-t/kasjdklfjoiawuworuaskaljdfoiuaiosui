/* I07: P13/P17 evidence-gated education event actions.
 * Every eligibility check is pure. No event prose settles an exam or awards a degree.
 */
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
function educationMigrationRecord(s,eventId,letter,result={}) {
  s.educationMigration ||= {version:1,seen:{},records:[]};
  const reg=s.educationMigration,
    scope=educationMigrationScope(s,eventId),
    id=eventId+":"+scope;
  if(reg.seen[id])return reg.seen[id];
  const record={id,eventId,choice:letter,
    at:{year:s.year,month:s.mo},result:{...result},
    sourceKind:"P17-reviewed-scene"};
  reg.seen[id]=record;reg.records.push(record);
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
      });
    }else{
      target.approval.reviewStatus="declined";
      educationMigrationRecord(s,eventId,letter,{
        formerEnrollmentId:oldId,approvalId:target.id,decision:"declined"
      });
    }
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
