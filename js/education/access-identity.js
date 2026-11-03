/* P09/P10: identities, recipient-specific knowledge and school communication.
 * All generated roles are anonymous game-model people, never canon operators. */
function educationEnsureEnrolledSchoolPeople(s,enrollmentId) {
  const enrol=s.educationRecord?.enrollments?.find(x=>x.id===enrollmentId),
    world=s.world?.educationWorld,
    institution=world?.institutions?.[enrol?.institutionId],
    offering=world?.offerings?.[enrol?.offeringId];
  if(!institution||!offering||offering.institutionId!==institution.id ||
     offering.campusId!==enrol.campusId || enrol.status!=="enrolled")return null;
  world.staff ||= {};world.schoolPeers ||= {};
  s.educationPeopleTies ||= {version:1,items:{}};
  const teacherId="edu-teacher:v1:"+offering.id+":lead",
    assigned=world.staff[teacherId] ||= {
      id:teacherId,personId:teacherId,role:"teacher",
      institutionId:institution.id,offeringId:offering.id,
      campusId:offering.campusId,
      status:"assigned",sourceKind:"game-model-unnamed-teacher",
      firstObservedAt:{year:s.year,month:s.mo??0}
    };
  const members=[assigned];
  for(let i=1;i<=2;i++){
    const id="edu-peer:v1:"+offering.id+":"+i;
    members.push(world.schoolPeers[id] ||= {
      id,personId:id,role:"peer",institutionId:institution.id,
      campusId:offering.campusId,offeringId:offering.id,
      status:"enrolled-peer",sourceKind:"game-model-anonymous-peer",
      firstObservedAt:{year:s.year,month:s.mo??0}
    });
  }
  for(const member of members){
    const key=enrollmentId+":"+member.personId;
    s.educationPeopleTies.items[key] ||= {
      id:key,enrollmentId,personId:member.personId,
      role:member.role,relation:"school-shared-context",
      personallyKnown:false,knowledgeEvidenceIds:[],
      status:"active"
    };
  }
  return {teacherPersonId:teacherId,peerPersonIds:members.slice(1).map(x=>x.personId)};
}
function educationSchoolRecipient(s,institutionId,recipientKind,personId=null) {
  const world=s?.world?.educationWorld,institution=world?.institutions?.[institutionId];
  if(!institution)return null;
  if(recipientKind==="institution")
    return {kind:recipientKind,recipientRef:institutionId,recipientId:null};
  if(!["teacher","peer"].includes(recipientKind)||!personId)return null;
  const person=(recipientKind==="teacher"?world.staff:world.schoolPeers)?.[personId];
  if(!person||person.institutionId!==institutionId ||
     (recipientKind==="teacher"&&person.status!=="assigned")||
     (recipientKind==="peer"&&person.status!=="enrolled-peer"))return null;
  return {kind:recipientKind,recipientRef:institutionId,recipientId:personId};
}
function educationRecipientInfectionKnowledge(s,{institutionId,recipientKind,personId}={}) {
  const target=educationSchoolRecipient(s,institutionId,recipientKind,personId);
  if(!target)return {status:"unverified",basis:"unknown-recipient"};
  const explicitReceipts=Object.values(s.educationDisclosureReceipts?.items||{})
    .filter(x=>x.institutionId===institutionId)
    .map(x=>({
      subject:"protagonist",
      recipientRef:x.institutionId,recipientId:x.recipientId||null,
      audience:x.recipientKind==="institution"?"school":"school-contact",
      certainty:x.certainty,
      subjectMatch:x.certainty==="confirmed"?"confirmed":"unclear"
    }));
  const entries=[...infectionAwarenessEntries(s),...explicitReceipts].filter(row=>
    row.subject==="protagonist" &&
    row.recipientRef===target.recipientRef &&
    (recipientKind==="institution" ?
      row.audience==="school" && !row.recipientId :
      row.audience==="school-contact" && row.recipientId===target.recipientId));
  if(entries.some(x=>x.certainty==="confirmed" && x.subjectMatch==="confirmed"))
    return {status:recipientKind==="institution"?"institution-confirmed":"individual-confirmed",
      basis:"recipient-specific-confirmed"};
  if(entries.some(x=>x.certainty==="suspected"||x.certainty==="unverified"))
    return {status:recipientKind==="institution"?"institution-unverified":"individual-suspected",
      basis:"recipient-specific-unconfirmed"};
  return {status:"unaware",basis:"no-recipient-record"};
}
function educationRecordSchoolDisclosure(s,{institutionId,recipientKind,
  personId=null,certainty="confirmed",source="self-disclosure",
  consent="voluntary",evidenceRef}={}) {
  const target=educationSchoolRecipient(s,institutionId,recipientKind,personId);
  if(!target||!evidenceRef||typeof evidenceRef!=="string" ||
     !["confirmed","suspected","unverified"].includes(certainty))
    throw Error("学校の受信者・感染情報の出典が確定していない");
  if(certainty==="confirmed"&&(!s.inf||!s.fl?.dg))
    throw Error("本人の診断確認前に感染確知を共有できない");
  const id=[institutionId,recipientKind,personId||"office",evidenceRef].join("|"),
    prior=s.educationDisclosureReceipts?.items?.[id];
  if(prior && (prior.certainty!==certainty||prior.source!==source||
     prior.consent!==consent))
    throw Error("同じ感染情報受領IDに別の根拠や確度を付与できない");
  const row=recordInfectionAwareness(s,{
    subject:"protagonist",
    audience:recipientKind==="institution"?"school":"school-contact",
    certainty,source,consent,
    subjectMatch:certainty==="confirmed"?"confirmed":"unclear",
    recipientRef:institutionId,recipientId:target.recipientId,
    sourceEventId:evidenceRef
  });
  s.educationDisclosureReceipts ||= {version:1,items:{}};
  s.educationDisclosureReceipts.items[id] ||= {
    id,institutionId,recipientKind,recipientId:personId,
    awarenessSourceEventId:row.sourceEventId,
    disclosedAt:{year:s.year,month:s.mo??0},
    certainty,source,consent
  };
  if(personId){
    for(const x of Object.values(s.educationPeopleTies?.items||{}))
      if(x.personId===personId &&
         !x.knowledgeEvidenceIds.includes(id))x.knowledgeEvidenceIds.push(id);
  }
  return row;
}
// No national language requirement is inferred from place of birth. A
// published, school-specific instruction specification is required.
function educationOfferingLanguageAssessment(s,offeringId,purpose="instruction-session",
  at={year:s.year,month:s.mo??0}) {
  const offer=s.world?.educationWorld?.offerings?.[offeringId],
    applicationPurpose=["application-document","entrance-exam-reading",
      "entrance-exam-interview","school-inquiry"].includes(purpose),
    spec=applicationPurpose?offer?.applicationLanguage:offer?.instructionLanguage;
  if(!offer)return {status:"unknown",fraction:0,reason:"offering-not-found"};
  if(!spec?.languageId||!spec.evidenceRef)
    return {status:"unverified",fraction:1,reason:"instruction-language-unconfirmed"};
  const modes=["application-document","entrance-exam-reading"].includes(purpose)?
    ["read"]:purpose==="entrance-exam-interview"?["speak","listen"]:
    purpose==="specialized-practical-lesson"?["listen","formalRegister"]:["listen"];
  const arrangements=Object.values(s.educationLanguageSupports?.items||{}).filter(row=>
    row.personId==="protagonist" && row.offeringId===offeringId &&
    row.institutionId===offer.institutionId &&
    row.languageId===spec.languageId && row.purpose===purpose &&
    row.status==="verified" && row.evidenceRef &&
    at.year*12+at.month >= row.start.year*12+row.start.month &&
    at.year*12+at.month <= row.end.year*12+row.end.month);
  const scored=modes.map(mode=>{
    const help=arrangements.find(x=>x.mode===mode||x.mode==="both");
    const assist=help?{
      kind:help.kind,languageId:help.languageId,purpose,
      region:s.res?.n,placeId:s.local?.placeId,
      year:at.year,expiresYear:at.year,mode
    }:null;
    // Pure skill inspection; an interpreter never grants permanent fluency.
    const score=getLanguageSkill(s,spec.languageId,mode),
      needed=Number.isFinite(spec.minimum?.[mode])?spec.minimum[mode]:40,
      script=mode==="read"||mode==="formalRegister"?spec.scriptId:null,
      scriptOk=!script || (s.languageState?.scripts?.[script]||0)>=needed,
      supported=!!assist && ["interpreter","helper","translation"].includes(assist.kind),
      met=(score>=needed&&scriptOk)||supported;
    return {mode,met,partial:!met && score>=needed*0.6,
      supported,score,needed,scriptOk};
  });
  const fraction=scored.every(x=>x.met)?1:scored.some(x=>!x.met&&!x.partial)?0:0.5;
  return {status:fraction===1?"understood":fraction===0?"blocked":"partial",
    fraction,languageId:spec.languageId,scriptId:spec.scriptId||null,
    reason:fraction===1?null:"instruction-comprehension-pending",
    assessedAt:at,offeringId,supported:scored.some(x=>x.supported),
    modes:scored,basis:"explicit-offering-instruction"};
}
function educationRegisterLanguageSupport(s,input) {
  const {offeringId,languageId,purpose,personId="protagonist",kind,mode,
    providerPersonId,evidenceRef,start,end}=input||{},
    offer=s.world?.educationWorld?.offerings?.[offeringId],
    spec=["application-document","entrance-exam-reading",
      "entrance-exam-interview","school-inquiry"].includes(purpose)?
      offer?.applicationLanguage:offer?.instructionLanguage;
  const providerKnown=!!s.world?.educationWorld?.staff?.[providerPersonId] ||
    !!s.world?.educationWorld?.schoolPeers?.[providerPersonId] ||
    (Array.isArray(s.personTies) ?
      s.personTies.some(x=>x.personId===providerPersonId) :
      !!s.personTies?.[providerPersonId]) ||
    Object.values(s.par||{}).some(x=>x?.id===providerPersonId&&!x.d) ||
    (s.siblings||[]).some(x=>x?.id===providerPersonId&&!x.d) ||
    (s.kids||[]).some(x=>x?.id===providerPersonId&&!x.d);
  if(!offer||!evidenceRef||!providerPersonId||!providerKnown||
    personId!=="protagonist"||!["interpreter","helper","translation"].includes(kind)||
    !["listen","speak","read","write","formalRegister","both"].includes(mode) ||
    !["school-inquiry","application-document","entrance-exam-reading",
      "entrance-exam-interview","instruction-session","specialized-practical-lesson"].includes(purpose) ||
    !languageId||spec?.languageId!==languageId||
    !start||!end||!Number.isInteger(start.year)||!Number.isInteger(start.month)||
    !Number.isInteger(end.year)||!Number.isInteger(end.month) ||
    start.year*12+start.month>end.year*12+end.month||
    end.year*12+end.month>start.year*12+start.month+12||
    start.year*12+start.month>s.year*12+(s.mo??0))
    throw Error("特定校・用途・通訳者・期間の確認を欠く");
  s.educationLanguageSupports ||= {version:1,items:{}};
  const id=[personId,offeringId,purpose,mode,providerPersonId,start.year,start.month].join(":");
  const row={id,personId,offeringId,institutionId:offer.institutionId,
    languageId,purpose,kind,mode,providerPersonId,evidenceRef,
    start:{...start},end:{...end},status:"verified"};
  if(s.educationLanguageSupports.items[id] &&
     JSON.stringify(s.educationLanguageSupports.items[id])!==JSON.stringify(row))
    throw Error("同じ通訳予約IDの異なる内容");
  s.educationLanguageSupports.items[id] ||= row;
  return s.educationLanguageSupports.items[id];
}
function educationAccessIdentityInvariants(s) {
  const errors=[],receipts=s.educationDisclosureReceipts?.items||{};
  for(const row of Object.values(receipts)){
    if(!educationSchoolRecipient(s,row.institutionId,row.recipientKind,row.recipientId)||
       !row.awarenessSourceEventId || !row.source ||
       !["confirmed","suspected","unverified"].includes(row.certainty))
      errors.push("学校関係者の感染受領記録に根拠がない");
    const original=infectionAwarenessEntries(s).find(x=>
      x.sourceEventId===row.awarenessSourceEventId &&
      x.recipientRef===row.institutionId&&
      x.recipientId===(row.recipientId||null));
    if(original && (original.certainty!==row.certainty ||
       original.source!==row.source))
      errors.push("学校関係者の感染情報と原本の内容が矛盾");
  }
  for(const row of Object.values(s.educationLanguageSupports?.items||{}))
    if(!s.world?.educationWorld?.offerings?.[row.offeringId]||
       !row.evidenceRef||!row.providerPersonId)
      errors.push("学校言語支援の対象と証拠が不一致");
  return errors;
}
