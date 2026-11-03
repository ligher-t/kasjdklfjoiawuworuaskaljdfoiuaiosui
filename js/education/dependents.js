/* P11: dependent education is person-owned, never inferred from the parent's
 * schooling, gifts, household payments or current region. */
function educationDependentPerson(s,personId) {
  if(!personId||typeof personId!=="string")return null;
  for(const [kind,list] of [["child",s.kids],["sibling",s.siblings]]){
    const person=(list||[]).find(x=>x?.id===personId);
    if(person)return {kind,person};
  }
  for(const sibling of s.siblings||[])
    for(const child of sibling.familyHousehold?.children||[])
      if(child?.id===personId)return {kind:"sibling_child",person:child};
  return null;
}
function educationDependentEntry(s,personId,create=false) {
  const source=educationDependentPerson(s,personId);
  if(!source)return null;
  if(!create)return s.dependentEducation?.[personId]||null;
  s.dependentEducation ||= {};
  return s.dependentEducation[personId] ||= {
    personId,subjectKind:source.kind,createdAt:{year:s.year,month:s.mo??0},
    recordLevel:"unknown",
    actualResidence:{
      status:"unknown",region:null,educationAreaId:null,
      sinceYear:null,sinceMonth:null,sourceEventId:null,basis:"unknown"
    },
    knownResidence:{
      status:"unknown",region:null,educationAreaId:null,
      knownAtYear:null,knownAtMonth:null,sourceEventId:null,certainty:"unknown"
    },
    authority:{guardians:[],authorityStatus:"unknown",basis:"unverified",reviewAt:null},
    preferences:[],consents:[],cases:[],enrollments:[],placements:[],
    attendanceMonths:{},awards:[],learningPaths:[],
    financialAccount:{cash:null,receipts:[]},
    aidHistory:[],decisions:[],knownFacts:[],
    lastUpdatedAt:{year:s.year,month:s.mo??0}
  };
}
function educationSynchronizeDependents(s) {
  if(!s)return 0;
  let added=0;
  const ids=new Set([
    ...(s.kids||[]).map(x=>x?.id),
    ...(s.siblings||[]).map(x=>x?.id),
    ...(s.siblings||[]).flatMap(x=>
      (x.familyHousehold?.children||[]).map(c=>c?.id))
  ].filter(x=>typeof x==="string"&&x));
  for(const id of ids)if(!s.dependentEducation?.[id]){
    educationDependentEntry(s,id,true);added++;
  }
  return added;
}
function educationDependentRecordFact(s,{personId,factId,claim,
  actual=false,observedAt,knownAt,sourceEventId,certainty}={}) {
  const entity=educationDependentEntry(s,personId,true);
  if(!entity||!factId||!claim||!sourceEventId||
     !["reported","person-confirmed","school-confirmed","event-resolved"].includes(certainty) ||
     !observedAt||!Number.isInteger(observedAt.year)||observedAt.year>s.year||
     actual===false && (!knownAt || !Number.isInteger(knownAt.year)||
       knownAt.year>s.year || knownAt.year<observedAt.year))
    throw Error("他者教育の実際・本人に伝わった情報の根拠が不足");
  const existing=entity.knownFacts.find(x=>x.factId===factId);
  const record={factId,personId,claim,actual,observedAt:{...observedAt},
    knownAt:knownAt?{...knownAt}:null,sourceEventId,certainty};
  if(existing){
    if(JSON.stringify(existing)!==JSON.stringify(record))
      throw Error("他者教育の同一情報IDに衝突がある");
    return existing;
  }
  entity.knownFacts.push(record);
  entity.lastUpdatedAt={year:s.year,month:s.mo??0};
  if(!actual)entity.recordLevel=certainty;
  return record;
}
function educationDependentResidenceUpdate(s,{personId,kind,region,
  areaId=null,effectiveAt,sourceEventId,reportedToProtagonist=false,
  knownAt=null,certainty="reported"}={}) {
  const entry=educationDependentEntry(s,personId,true);
  if(!entry||!sourceEventId||!effectiveAt||
     !Number.isInteger(effectiveAt.year)||effectiveAt.year>s.year ||
     !["family-home","other-parent","shared","dormitory",
       "relative-home","independent","displaced"].includes(kind)||
     !region||areaId&&!s.world?.educationWorld?.areas?.[areaId])
    throw Error("扶養対象本人の住居確認条件が不足");
  const actual={
    status:kind,region,educationAreaId:areaId,
    sinceYear:effectiveAt.year,sinceMonth:effectiveAt.month??0,
    sourceEventId,basis:"individual-residence-evidence"
  };
  entry.actualResidence=actual;
  if(reportedToProtagonist){
    if(!knownAt||knownAt.year>s.year||knownAt.year<effectiveAt.year)
      throw Error("居住地の本人への伝達日付が不正");
    entry.knownResidence={
      status:kind,region,educationAreaId:areaId,
      knownAtYear:knownAt.year,knownAtMonth:knownAt.month??0,
      sourceEventId,certainty
    };
  }
  return entry.actualResidence;
}
function educationDependentRecordPreference(s,{personId,stage,stance,
  sourceEventId,reportedToId=null,certainty="person-confirmed"}={}) {
  const entry=educationDependentEntry(s,personId,true);
  if(!entry||!sourceEventId||!stage||
     !["attend","defer","work","informal","decline","undecided"].includes(stance)||
     !["person-confirmed","reported"].includes(certainty))
    throw Error("本人の意向として確認できる証拠がない");
  const preferenceId=[personId,sourceEventId,stage].join(":"),
    old=entry.preferences.find(x=>x.preferenceId===preferenceId);
  if(old)return old;
  const row={preferenceId,personId,courseStage:stage,stance,
    expressedAt:{year:s.year,month:s.mo??0},reportedToId,sourceEventId,certainty};
  entry.preferences.push(row);
  return row;
}
function educationDependentRecordConsent(s,{personId,consentId,purpose,
  signerPersonId,offeringId,status,sourceEventId}={}) {
  const entry=educationDependentEntry(s,personId,true),
    offer=s.world?.educationWorld?.offerings?.[offeringId];
  if(!entry||!consentId||!sourceEventId||!offer||!signerPersonId||
     !["attend","guardian-enrollment","informal-learning"].includes(purpose)||
     !["approved","refused","pending"].includes(status))
    throw Error("子本人・後見者の個別同意を記録する証拠が不足");
  const actualParent=entry.subjectKind==="child"&&
    signerPersonId==="protagonist";
  const verifiedGuardian=entry.authority.guardians.some(x=>
    x.personId===signerPersonId && x.status==="verified");
  if(purpose==="attend"&&signerPersonId!==personId ||
     purpose!=="attend"&&!actualParent&&!verifiedGuardian)
    throw Error("教育判断の署名者が本人または実際の後見人と一致しない");
  const row={
    consentId,personId,signerPersonId,signerAuthority:purpose==="attend"?
      "learner":actualParent?"protagonist-parent":"confirmed-guardian",
    purpose,offeringId,status,sourceEventId,
    period:{year:s.year,month:s.mo??0}
  };
  const existing=entry.consents.find(x=>x.consentId===consentId);
  if(existing){
    if(JSON.stringify(existing)!==JSON.stringify(row))
      throw Error("同意記録IDの異なる署名内容");
    return existing;
  }
  entry.consents.push(row);
  return row;
}
function educationDependentRecordSchoolDecision(s,{personId,applicationId,
  offeringId,status,sourceEventId}={}) {
  const entry=educationDependentEntry(s,personId,true),
    offer=s.world?.educationWorld?.offerings?.[offeringId],
    note=educationSchoolStatusAt(s,offeringId,s.year,s.mo??0);
  if(!entry||!applicationId||!sourceEventId||!offer||!note||
     !["accepted","rejected","expired","applied"].includes(status))
    throw Error("子別の学校判断と募集の根拠が不足");
  const record={
    caseId:applicationId,personId,stage:offer.stage,
    status:status==="accepted"?"awaiting-funds":
      status==="applied"?"awaiting-school":"closed",
    schoolDecision:status,candidateOfferingId:offeringId,
    decisionOwnerId:offer.institutionId,
    createdAt:{year:s.year,month:s.mo??0},
    sourceEventId,reasonCodes:[]
  };
  const old=entry.cases.find(x=>x.caseId===applicationId);
  if(old){
    if(JSON.stringify(old)!==JSON.stringify(record))
      throw Error("同じ子の出願判断IDに異なる結果");
    return old;
  }
  entry.cases.push(record);
  return record;
}
function educationDependentRecordEnrollment(s,{personId,offeringId,
  admissionTransactionId,sourceEventId,personConsentId,guardianConsentId,
  fundingInvoiceId=null,confirmedAt}={}) {
  const entry=educationDependentEntry(s,personId,true),
    offer=s.world?.educationWorld?.offerings?.[offeringId];
  if(!entry||!offer||!admissionTransactionId||!sourceEventId||
     !personConsentId||!guardianConsentId||!confirmedAt||
     confirmedAt.year>s.year ||
     !["open","limited"].includes(
       educationSchoolStatusAt(s,offeringId,confirmedAt.year,confirmedAt.month??0)?.admissionStatus))
    throw Error("扶養対象本人の受入・意思・後見・課程が未確定");
  const agreements=entry.consents||[];
  const acceptance=entry.cases.find(x=>
    x.caseId===admissionTransactionId &&
    x.candidateOfferingId===offeringId &&
    x.schoolDecision==="accepted"&&
    x.decisionOwnerId===offer.institutionId);
  if(!acceptance)throw Error("当人の入学願書に対する学校の受入記録がない");
  if(!agreements.some(x=>x.consentId===personConsentId &&
      x.personId===personId&&x.status==="approved"&&x.purpose==="attend"&&
      x.signerPersonId===personId&&x.offeringId===offeringId)||
     !agreements.some(x=>x.consentId===guardianConsentId &&
       x.personId===personId&&x.status==="approved"&&
       x.purpose==="guardian-enrollment"&&x.offeringId===offeringId&&
       (x.signerAuthority==="protagonist-parent"||
         x.signerAuthority==="confirmed-guardian")))
    throw Error("本人の希望と後見人の許諾を別々に確認する必要がある");
  if(entry.actualResidence.status==="unknown"||
     !entry.actualResidence.educationAreaId)
    throw Error("扶養対象本人の実際の居所が未確認");
  if(fundingInvoiceId){
    const invoice=s.educationFinance?.invoices?.[fundingInvoiceId];
    if(!invoice||invoice.status!=="paid"||invoice.personId!==personId||
       invoice.offeringId!==offeringId)
      throw Error("別人物の学費・領収記録を流用できない");
  }else if(EDUCATION_PROGRAMS[offer.stage]?.fee>0)
    throw Error("学費の正規請求・納付確認がない");
  const enrollmentId="dependent-enrol:"+admissionTransactionId;
  if(entry.enrollments.some(x=>x.enrollmentId===enrollmentId))
    return entry.enrollments.find(x=>x.enrollmentId===enrollmentId);
  if(entry.enrollments.some(x=>x.status==="enrolled"))
    throw Error("別の在籍を終了する前に新学籍を作成できない");
  const row={
    enrollmentId,personId,offeringId,
    institutionId:offer.institutionId,campusId:offer.campusId,
    status:"enrolled",startAt:{...confirmedAt},
    sourceEventId,admissionTransactionId,
    personConsentId,guardianConsentId,
    fundingInvoiceId,attendanceMonths:[],awards:[]
  };
  entry.enrollments.push(row);
  acceptance.status="closed";
  return row;
}
function educationDependentRecordSupport(s,{personId,transferId,
  amount,kind,postingId,sourceEventId,purpose="education"}={}) {
  const entry=educationDependentEntry(s,personId,true),
    posted=s.educationFinance?.postings?.[postingId];
  if(!entry||!transferId||!sourceEventId||
     !["gift","education-earmarked","fee-payment"].includes(kind)||
     !Number.isSafeInteger(amount)||amount<=0||
     !posted||posted.status!=="settled"||posted.amount!==amount ||
     (kind==="fee-payment" &&
       s.educationFinance?.invoices?.[posted.invoiceId]?.personId!==personId))
    throw Error("教育支援の実資金移動・対象受取人が不明");
  if(entry.aidHistory.some(x=>x.transferId===transferId))
    return entry.aidHistory.find(x=>x.transferId===transferId);
  const row={transferId,personId,amount,kind,postingId,sourceEventId,
    purpose,year:s.year,month:s.mo??0,credentialEffect:false};
  entry.aidHistory.push(row);
  return row;
}
function educationDependentInvariants(s) {
  const issues=[];
  for(const [id,row] of Object.entries(s.dependentEducation||{})){
    if(!educationDependentPerson(s,id)||row.personId!==id||
       !Array.isArray(row.enrollments)||!Array.isArray(row.knownFacts)||
       row.enrollments.filter(x=>x.status==="enrolled").length>1 ||
       row.enrollments.some(x=>x.personId!==id ||
         !s.world?.educationWorld?.offerings?.[x.offeringId]))
      issues.push("子・親族の教育記録が別人物または未知の学校を参照");
    if(row.aidHistory?.some(x=>!x.postingId||
       !s.educationFinance?.postings?.[x.postingId]))
      issues.push("子への教育支援の実取引が不一致");
  }
  return issues;
}
