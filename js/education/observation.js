/* P19: read-only observations over existing education authorities.
 * Samples are explicit. These are within-save checks, not population rates.
 */
const EDUCATION_OBSERVATION_UNITS=Object.freeze({
  p_exists:"unique_education_area_or_hub_x_stage",
  p_open:"unique_offering_x_period",
  p_discovered:"unique_person_x_stage_x_intent_window",
  p_reachable:"unique_person_x_stage_x_intent_window",
  p_accepted:"unique_application_id",
  p_funded:"unique_accepted_offer_id",
  p_completed:"unique_enrollment_id_x_target_stage"
});
// Explicit saved-world samples, grouped without combining different denominators.
function educationObservationRegionalRows(s,{year=s.year,month=s.mo}={}) {
  const w=s.world?.educationWorld;
  return [...new Set(Object.values(w?.areas||{}).map(x=>x.regionKey))].sort().map(region=>{
    const areas=new Set(Object.values(w.areas).filter(x=>x.regionKey===region).map(x=>x.id)),
      hubs=new Set(Object.values(w.hubs).filter(x=>x.regionKey===region).map(x=>x.id)),
      offerings=new Set(Object.values(w.offerings).filter(x=>areas.has(w.campuses[x.campusId]?.educationAreaId)).map(x=>x.id)),
      siteFrame=Object.values(w.generationDecisions).filter(x=>areas.has(x.scopeId)||hubs.has(x.scopeId))
        .flatMap(x=>Object.keys(x.present).filter(stage=>["primary","lower","upper","vocational","university","arts"].includes(stage))
          .map(stage=>({scopeId:x.scopeId,stage}))),
      cases=Object.values(s.educationCases?.items||{}).filter(x=>areas.has(x.originAreaId)),
      applications=Object.values(s.educationCases?.items||{}).filter(x=>offerings.has(x.offeringId)&&x.applicationId),
      enrollments=(s.educationRecord?.enrollments||[]).filter(x=>offerings.has(x.offeringId));
    return {region,period:{year,month},sampleScope:"saved-world-and-recorded-person-cases",
      metrics:educationObservationRows(s,{year,month,siteFrame,
        openFrame:[...offerings].map(offeringId=>({offeringId,year,month})),
        caseIds:cases.map(x=>x.id),applicationIds:applications.map(x=>x.applicationId),
        enrollmentIds:enrollments.map(x=>x.id)})};
  });
}
// Player projection deliberately contains no actual residence/enrollment fields.
function educationDependentKnownView(s) {
  if(!s||!Number.isInteger(s.year)||!Number.isInteger(s.mo)||s.mo<1||s.mo>12)return [];
  const rows=educationObservationDependentRows(s);
  return rows.map(row=>{
    const source=educationDependentPerson(s,row.personId),entry=s.dependentEducation[row.personId],
      residence=entry?.knownResidence,at=residence?.knownAtYear,
      offer=s.world?.educationWorld?.offerings?.[row.knownOfferingId];
    return {personId:row.personId,name:source?.person.nm||"家族",
      education:row.knownStatus==="unknown"?"就学先は未確認":
        offer?EDUCATION_CASE_STAGES[offer.stage]+"について本人から報告あり":"学んでいるという便りあり（学校は未確認）",
      residence:row.knownResidenceStatus==="unknown"?"居住先は未確認":
        (residence.region||"地域未確認")+"（"+at+"年"+(residence.knownAtMonth?residence.knownAtMonth+"月":"・月未確認")+"の便り）",
      certainty:row.knowledgeCertainty||"unknown"};
  });
}
function educationObservationMeasure(metricId,values,period) {
  const row={metricId,unit:EDUCATION_OBSERVATION_UNITS[metricId],
    numerator:0,denominator:0,excludedUnknown:0,pending:0,
    notSearched:0,censored:0,competingDeath:0,
    period:{...period},observationWindow:{...period},
    evidenceClass:"game-model-authoritative-ledgers",
    sampleScope:"explicit-within-save",rate:null,reason:null};
  for(const item of values){
    if(item==="yes"||item==="no"||item==="not_searched"||item==="death"){
      row.denominator++;
      if(item==="yes")row.numerator++;
      if(item==="not_searched")row.notSearched++;
      if(item==="death")row.competingDeath++;
    }else if(item==="pending")row.pending++;
    else if(item==="censored")row.censored++;
    else row.excludedUnknown++;
  }
  row.rate=row.denominator?row.numerator/row.denominator:null;
  if(!row.denominator)row.reason="no_observations";
  return row;
}
function educationObservationRows(s,{
  year=s?.year,month=s?.mo,siteFrame=[],openFrame=[],
  caseIds=null,applicationIds=null,enrollmentIds=null
}={}) {
  if(!Number.isInteger(year)||!Number.isInteger(month)||month<1||month>12 ||
     year*12+month>s.year*12+(s.mo??0))
    throw Error("教育観測は既に到来した年月を必要とする");
  const world=s?.world?.educationWorld,
    access=s?.educationAccess||{},cases=s?.educationCases?.items||{},
    finance=s?.educationFinance||{},record=s?.educationRecord||{},
    date={year,month},at=year*12+month,
    validDate=x=>x&&Number.isInteger(x.year)&&Number.isInteger(x.month)&&
      x.year*12+x.month<=at,
    distinct=(rows,key)=>[...new Map(rows.map(x=>[key(x),x])).values()],
    offered=id=>world?.offerings?.[id],
    status=id=>world&&offered(id)?educationSchoolStatusAt(s,id,year,month):null,
    open=id=>{const x=status(id);return !!x &&
      (x.teachingEquivalent>0 || ["open","limited"].includes(x.admissionStatus));};
  const measuredSite=distinct(siteFrame,x=>x.scopeId+":"+x.stage).map(x=>{
    const decision=Object.values(world?.generationDecisions||{}).find(d=>
      d.scopeId===x.scopeId&&Object.hasOwn(d.present||{},x.stage));
    return decision?.present?.[x.stage]===true?"yes":
      decision?.present?.[x.stage]===false?"no":"unknown";
  });
  const measuredOpen=distinct(openFrame,x=>x.offeringId+":"+
    (x.year??year)+":"+(x.month??month)).map(x=>{
    const y=x.year??year,m=x.month??month,id=x.offeringId;
    if(!offered(id)||!Number.isInteger(y)||!Number.isInteger(m)||
       y*12+m>at)return "unknown";
    const state=educationSchoolStatusAt(s,id,y,m);
    return state&&(state.teachingEquivalent>0 ||
      ["open","limited"].includes(state.admissionStatus))?"yes":"no";
  });
  // Cases are a self-selected within-save cohort, not all eligible residents.
  const selectedCases=distinct((caseIds||Object.keys(cases))
    .map(id=>cases[id]).filter(Boolean),x=>x.id);
  const candidateSet=item=>{
    const origin=world?.areas?.[item.originAreaId];
    if(!origin)return null;
    const foreign=(access.searches||[]).some(x=>x.caseId===item.id&&x.scope==="abroad");
    const areas=[origin.id,...(origin.neighborIds||[]),...(foreign?origin.studyDestinationIds||[]:[])];
    return [...new Map(areas.flatMap(areaId=>
      institutionOfferings(s,areaId,item.stage)
        .filter(x=>!["university","vocational","arts"].includes(item.stage) ||
          x.admissionTier===item.tier)
        .map(x=>[x.id,x]))).values()].filter(x=>open(x.id));
  };
  const knownSet=(item,possible)=>possible.filter(x=>
    item.evidence?.knownCandidateIds?.includes(x.id) &&
    access.knownOfferings?.[x.id]?.epistemicStatus==="offering-verified" &&
    validDate(access.knownOfferings[x.id].checkedAt));
  const discovery=[],reach=[];
  for(const item of selectedCases){
    const possible=candidateSet(item);
    if(possible===null){discovery.push("unknown");reach.push("unknown");continue;}
    if(!possible.length)continue; // Not in the open-option denominator.
    const known=knownSet(item,possible);
    if(!known.length){
      discovery.push((access.searches||[]).some(x=>x.caseId===item.id)?
        "no":"not_searched");
      continue;
    }
    discovery.push("yes");
    if(item.originAreaId!==s.local?.educationAreaId ||
       year!==s.year||month!==s.mo){
      reach.push("unknown");continue;
    }
    const travel=known.map(x=>educationCanReach(s,{
      institutionId:x.institutionId,campusId:x.campusId,offeringId:x.id,
      year,month,purpose:"daily-commute"
    }));
    reach.push(travel.some(x=>x.reachable)?"yes":
      travel.every(x=>x.status==="blocked")?"no":"unknown");
  }
  const paidByObservationDate=invoice=>{
    if(invoice.status!=="paid"||!validDate(invoice.issuedAt))return false;
    if(invoice.net===0)return true;
    const receipts=(invoice.receiptIds||[]).map(id=>finance.receipts?.[id]);
    return receipts.length>0 && receipts.every(r=>r &&
      r.status==="settled" && r.invoiceId===invoice.id &&
      validDate(r.paidAt) && Number.isSafeInteger(r.amount)) &&
      receipts.reduce((total,r)=>total+r.amount,0)===invoice.net &&
      Object.values(finance.postings||{}).some(p=>
        p.invoiceId===invoice.id && p.status==="settled" && validDate(p.at));
  };
  const chosenApplications=distinct((applicationIds||
      Object.keys(access.notices||{})).map(id=>({id,notice:access.notices?.[id]})),
    x=>x.id);
  const accepted=[],funded=[];
  for(const {id,notice} of chosenApplications){
    const item=notice&&cases[notice.caseId];
    if(!notice || !item || item.applicationId!==id ||
       notice.applicationId!==id || !validDate(notice.informedAt)){
      accepted.push("unknown");continue;
    }
    if(notice.result==="accepted")accepted.push("yes");
    else if(["exam-failed","not-accepted"].includes(notice.result))
      accepted.push("no");
    else{accepted.push("pending");continue;}
    if(notice.result!=="accepted")continue;
    if(item.phase==="contract" && item.status==="active" &&
       year<=item.deadlineYear){funded.push("pending");continue;}
    const tuition=Object.values(finance.invoices||{}).find(x=>
      x.caseId===item.id && x.offeringId===notice.offeringId &&
      x.kind==="tuition" && x.personId==="protagonist");
    if(!tuition){funded.push("no");continue;}
    if(tuition.status!=="paid"){funded.push("no");continue;}
    if(!paidByObservationDate(tuition)){funded.push("unknown");continue;}
    const off=offered(notice.offeringId),
      campus=world?.campuses?.[off?.campusId];
    if(!campus){funded.push("unknown");continue;}
    // Different education areas may require an unresolved commute or dorm.
    if(campus.educationAreaId!==item.originAreaId){
      const transport=Object.values(finance.invoices||{}).filter(x=>
        x.personId==="protagonist" && x.offeringId===off.id &&
        ["commute-pass","boarding-room","boarding-food","entrance-trip"].includes(x.kind));
      funded.push(transport.length && transport.every(paidByObservationDate)?
        "yes":"unknown");
    }else funded.push("yes");
  }
  const cohort=distinct((enrollmentIds||
      (record.enrollments||[]).map(x=>x.id))
      .map(id=>(record.enrollments||[]).find(x=>x.id===id))
      .filter(Boolean),x=>x.id);
  const finished=cohort.map(x=>{
    if(!Number.isInteger(x.startedYear)||x.startedYear>year)
      return "unknown";
    if(x.status==="enrolled"||x.status==="paused"||x.status==="transferred")
      return s.dead?"death":"censored";
    if(!Number.isInteger(x.endedYear)||x.endedYear>year)
      return "unknown";
    if(x.status==="completed"){
      const awards=[...(record.awards||[]),...(record.schoolCertificates||[])];
      return awards.some(a=>a.enrollmentId===x.id && a.awardedYear<=year &&
        (a.offeringId===x.offeringId || !x.offeringId))?"yes":"unknown";
    }
    return ["interrupted","withdrawn"].includes(x.status)?"no":"unknown";
  });
  return Object.fromEntries(Object.keys(EDUCATION_OBSERVATION_UNITS).map(id=>[
    id,educationObservationMeasure(id,{
      p_exists:measuredSite,p_open:measuredOpen,
      p_discovered:discovery,p_reachable:reach,p_accepted:accepted,
      p_funded:funded,p_completed:finished
    }[id],date)]));
}

// P19 person-level bridge. Null means that the relevant fact has not been
// established in this save. Each row is one recorded life/case/stage window.
function educationObservationCaseBridgeRows(s,{
  year=s?.year,month=s?.mo,caseIds=null
}={}) {
  if(!Number.isInteger(year)||!Number.isInteger(month)||month<1||month>12)
    throw Error("人物別教育観測には確定した年月が必要");
  const world=s.world?.educationWorld,cases=s.educationCases?.items||{},
    access=s.educationAccess||{},enrollments=s.educationRecord?.enrollments||[],
    selected=[...new Set(caseIds||Object.keys(cases))],
    knownAt=x=>x?.checkedAt?.year*12+x?.checkedAt?.month<=year*12+month;
  return selected.map(id=>{
    const c=cases[id];
    if(!c)return null;
    const origin=world?.areas?.[c.originAreaId],
      areas=origin?[origin.id,...(origin.neighborIds||[]),...((access.searches||[]).some(x=>x.caseId===c.id&&x.scope==="abroad")?origin.studyDestinationIds||[]:[])]:[],
      offerings=origin?[...new Map(areas.flatMap(area=>
        institutionOfferings(s,area,c.stage).filter(off=>
          !["university","vocational","arts"].includes(c.stage) ||
          off.admissionTier===c.tier).map(off=>[off.id,off]))).values()]:[],
      opened=offerings.filter(off=>{
        const current=educationSchoolStatusAt(s,off.id,year,month);
        return current&&(current.teachingEquivalent>0 ||
          ["open","limited"].includes(current.admissionStatus));
      }),
      known=opened.filter(off=>
        c.evidence?.knownCandidateIds?.includes(off.id) &&
        access.knownOfferings?.[off.id]?.epistemicStatus==="offering-verified" &&
        knownAt(access.knownOfferings[off.id])),
      route=origin?.id===s.local?.educationAreaId?known.map(off=>
        educationCanReach(s,{institutionId:off.institutionId,
          campusId:off.campusId,offeringId:off.id,year,month,
          purpose:"daily-commute"})):[],
      notice=access.notices?.[c.applicationId],
      admission=notice?.caseId===c.id&&notice.applicationId===c.applicationId?
        notice:null,
      linked=c.commit?.enrollmentId?
        enrollments.find(x=>x.id===c.commit.enrollmentId &&
          x.offeringId===c.offeringId):null,
      evidence=linked && educationObservationRows(s,{year,month,
        caseIds:[],siteFrame:[],openFrame:[],
        applicationIds:[],enrollmentIds:[linked.id]}).p_completed,
      financing=admission?.result==="accepted"?
        educationObservationRows(s,{year,month,
          caseIds:[],siteFrame:[],openFrame:[],
          applicationIds:[c.applicationId],enrollmentIds:[]}).p_funded:null,
      participation=(s.learningPaths||[]).some(path=>
        path.personId==="protagonist" && path.evidenceIds?.length &&
        path.participation?.some(part=>
          part.periodKey<=year+"-"+String(month).padStart(2,"0") &&
          part.evidenceIds?.length));
    return {personId:"protagonist",caseId:c.id,stage:c.stage,
      intentYear:c.year,observedAt:{year,month},
      sampleScope:"recorded-intent-window",
      N_eligible:c.evidence?.eligibilityReviewId?true:
        c.reason==="not-eligible"?false:null,
      N_any_present:origin?offerings.length>0:null,
      N_any_open:origin?opened.length>0:null,
      N_known:opened.length?known.length>0:null,
      N_route:known.length && origin?.id===s.local?.educationAreaId &&
        year===s.year&&month===s.mo?
        route.some(x=>x.reachable)?true:
          route.every(x=>x.status==="blocked")?false:null:null,
      N_applied:!!c.applicationId,
      N_accepted:admission?.result==="accepted"?true:
        ["exam-failed","not-accepted"].includes(admission?.result)?false:null,
      N_funded:financing?.denominator?
        financing.numerator>0:financing?.pending?null:null,
      N_enrolled:linked?true:
        c.status==="resolved"?false:null,
      N_completed:evidence?.denominator?
        evidence.numerator>0:null,
      N_nonformal_gain:participation};
  }).filter(Boolean);
}

// P11/P19 audit projection. This returns actual and reported knowledge in
// separately labelled fields and is not suitable for direct player display.
function educationObservationDependentRows(s,{
  year=s?.year,month=s?.mo,personIds=null
}={}) {
  if(!s || !Number.isInteger(year)||!Number.isInteger(month)||
     month<1||month>12||year!==s.year||month!==(s.mo??0))
    throw Error("扶養対象の現況観測時点が不正");
  const at=year*12+month,ledger=s.dependentEducation||{},
    world=s.world?.educationWorld,
    knownAt=x=>x&&Number.isInteger(x.year)&&
      Number.isInteger(x.month)&&x.month>=0&&x.month<=12&&
      x.year*12+x.month<=at,
    ids=[...new Set(personIds||Object.keys(ledger))];
  return ids.map(personId=>{
    const entry=ledger[personId];
    if(!entry||entry.personId!==personId)return {
      personId,subjectKind:null,recordStatus:"not-observed",
      actualEnrollmentId:null,actualOfferingId:null,actualStatus:"unknown",
      knownStatus:"unknown",knownOfferingId:null,knowledgeCertainty:null,
      knownResidenceStatus:"unknown",actualResidenceStatus:"unknown",
      paidInvoiceId:null
    };
    const actual=(entry.enrollments||[]).filter(x=>
      x.personId===personId && knownAt(x.startAt) &&
      world?.offerings?.[x.offeringId] &&
      x.enrollmentId===
        "dependent-enrol:"+x.admissionTransactionId &&
      (x.status==="enrolled"||x.status==="completed"||
        x.status==="transferred"||x.status==="interrupted"))
      .at(-1)||null;
    const facts=(entry.knownFacts||[]).filter(f=>
      f.personId===personId && knownAt(f.knownAt) &&
      f.sourceEventId && f.certainty &&
      (typeof f.claim==="string" || !!f.claim &&
        typeof f.claim==="object"))
      .sort((a,b)=>{
        const da=a.knownAt.year*12+a.knownAt.month,
          db=b.knownAt.year*12+b.knownAt.month;
        return db-da||String(a.factId).localeCompare(String(b.factId));
      });
    const learning=facts.find(x=>
      typeof x.claim==="string"?
        /school|stud(?:y|ies|ying)|learn|学校|就学|通学/.test(x.claim):
        !!x.claim.schoolOfferingId || !!x.claim.enrollmentId) ||null;
    const claim=learning && typeof learning.claim==="object"?
      learning.claim:null;
    // Enrollment identifiers can be reported, but the report must not
    // confer a record or borrow another child's formal enrollment.
    const knownOffering=claim?.schoolOfferingId &&
      world?.offerings?.[claim.schoolOfferingId]?claim.schoolOfferingId:null;
    const reportedEnrollment=claim?.enrollmentId &&
      (entry.enrollments||[]).some(x=>
        x.personId===personId && x.enrollmentId===claim.enrollmentId &&
        (!knownOffering||x.offeringId===knownOffering));
    const knownStatus=learning?
      knownOffering?
        (reportedEnrollment?"reported-enrollment":"reported-school"):
        "reported-education-unspecified":"unknown";
    const residence=entry.knownResidence,
      residenceValid=residence&&residence.sourceEventId &&
        residence.knownAtYear!=null &&
        residence.knownAtYear*12+(residence.knownAtMonth??0)<=at &&
        residence.certainty!=="unknown";
    const invoice=actual?.fundingInvoiceId &&
      s.educationFinance?.invoices?.[actual.fundingInvoiceId],
      paid=invoice?.personId===personId &&
        invoice.offeringId===actual.offeringId &&
        invoice.status==="paid";
    return {
      personId,subjectKind:entry.subjectKind,
      recordStatus:"recorded",
      actualEnrollmentId:actual?.enrollmentId||null,
      actualOfferingId:actual?.offeringId||null,
      actualStatus:actual?.status||"unknown",
      knownStatus,knownOfferingId:knownOffering,
      knowledgeCertainty:learning?.certainty||null,
      knowledgeSourceId:learning?.sourceEventId||null,
      actualResidenceStatus:entry.actualResidence?.status||"unknown",
      knownResidenceStatus:residenceValid?residence.status:"unknown",
      paidInvoiceId:paid?invoice.id:null
    };
  });
}
