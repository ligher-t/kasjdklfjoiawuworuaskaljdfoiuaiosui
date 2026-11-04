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
  if(!Number.isInteger(year)||!Number.isInteger(month)||month<1||month>12)
    throw Error("教育観測は確定した年月を必要とする");
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
    const areas=[origin.id,...(origin.neighborIds||[])];
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
    if(item.originAreaId!==s.local?.educationAreaId){
      reach.push("unknown");continue;
    }
    const travel=known.map(x=>educationCanReach(s,{
      institutionId:x.institutionId,campusId:x.campusId,offeringId:x.id,
      year,month,purpose:"daily-commute"
    }));
    reach.push(travel.some(x=>x.reachable)?"yes":
      travel.every(x=>x.status==="blocked")?"no":"unknown");
  }
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
    const off=offered(notice.offeringId),
      campus=world?.campuses?.[off?.campusId];
    if(!campus){funded.push("unknown");continue;}
    // Different education areas may require an unresolved commute or dorm.
    if(campus.educationAreaId!==item.originAreaId){
      const transport=Object.values(finance.invoices||{}).filter(x=>
        x.personId==="protagonist" && x.offeringId===off.id &&
        ["commute-pass","boarding-room","boarding-food","entrance-trip"].includes(x.kind));
      funded.push(transport.length && transport.every(x=>x.status==="paid")?
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
      areas=origin?[origin.id,...(origin.neighborIds||[])]:[],
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
      N_route:known.length && origin?.id===s.local?.educationAreaId?
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
      N_nonformal_gain:participation}};
  }).filter(Boolean);
}
