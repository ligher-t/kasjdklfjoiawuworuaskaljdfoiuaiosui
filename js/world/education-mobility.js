/* P08: explicit, immutable school transport links and read-only reachability checks. */
const EDUCATION_COMMUTE_LIMITS = Object.freeze({
  lower:50,upper:70,vocational:80,university:90,arts:90,preparatory:60
});
const EDUCATION_MOBILITY_PURPOSES = Object.freeze([
  "daily-commute","exam-visit","boarding-move","relative-lodging",
  "family-relocation","temporary-visit"
]);
function educationCreateMobilityState(s) {
  return s.educationMobility ||= {
    version:1,planSeq:0,activePlanId:null,plans:{},routePlans:{},
    residenceContracts:{},consentRecords:{},escortRecords:{},
    residenceOffers:{},transportTransactions:{},history:[]
  };
}
function educationLinkId(a,b,kind) {
  const pair=[a,b].sort();
  return "edu-link:v1:"+pair[0]+":"+pair[1]+":"+kind;
}
function educationEnsureTransportLinks(world,hub) {
  world.transportLinks ||= {};
  if (!hub || hub.areaIds.length<2) return;
  const ids=[...hub.areaIds].sort();
  const center=hub.hostAreaId;
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
    const [a,b]=[ids[i],ids[j]];
    const nearHub=a===center||b===center;
    const connection=educationDraw(world,a+"|"+b,"transport-link","presence").value;
    if(connection>=(nearHub?0.82:0.48)) continue;
    const industrial=[a,b].some(id=>world.areas[id]?.kind==="工業・採掘地域");
    const kind=industrial?"road":"urban-transit";
    const id=educationLinkId(a,b,kind);
    if(world.transportLinks[id])continue;
    const range=industrial?[30,90]:[15,45];
    const minutes=role=>range[0]+Math.floor(
      educationDraw(world,id,"travel-minutes",role).value*(range[1]-range[0]+1));
    const risk=educationDraw(world,id,"travel-risk","baseline").value*0.66;
    const returnAvailable=educationDraw(world,id,"return-service","baseline").value>=0.12;
    world.transportLinks[id]={
      id,endpointAreaIds:[a,b],routeKind:kind,
      travelMinutesAB:minutes("ab"),travelMinutesBA:minutes("ba"),
      transferWaitMinutes:nearHub?5:9,
      reliability:0.75+educationDraw(world,id,"reliability","baseline").value*0.23,
      riskScore:Number(risk.toFixed(3)),
      accessibility:educationDraw(world,id,"accessible","step-free").value<0.65?["step-free"]:[],
      accessibilityKnown:true,
      guardianRequirement:null,restrictionRefs:[],
      farePolicyId:"edu-local-fare-v1",
      directionalAccess:{[a]:true,[b]:returnAvailable},
      statusHistory:[],sourceKind:"game-model-transport"
    };
  }
}
function educationTransportImpairmentAt(world,link,year,month) {
  const score={status:"active",riskAdd:0,impactRefs:[]};
  for(const window of EDUCATION_OPERATION_WINDOWS){
    if(!["direct","indirect","localized"].includes(window.kind))continue;
    if(educationDateIndex(year,month)<educationDateIndex(...window.from))continue;
    if(window.to && educationDateIndex(year,month)>educationDateIndex(...window.to))continue;
    const endpoints=link.endpointAreaIds.map(id=>world.areas[id]).filter(Boolean);
    if(!endpoints.some(area=>area.regionKey===window.region &&
      (!window.city||area.cityOrSettlementKey==="city:"+window.city)&&
      (!window.excludeCity||area.cityOrSettlementKey!=="city:"+window.excludeCity)))continue;
    if(window.scope==="conflict-evidence"||window.scope==="evidence-only"||
       window.scope==="volcanic-exposure-evidence") {
      if(!link.restrictionRefs?.includes(window.id))continue;
    }
    if(window.scope==="weakened-locality" &&
      !endpoints.some(x=>["辺境・移動の多い居住地","移動都市の避難・労働区画","工業・採掘地域"].includes(x.kind)))continue;
    const u=educationDraw(world,link.id,"transport-window",window.id).value;
    const closed=u<(window.kind==="direct"?0.25:window.kind==="indirect"?0.045:0.12);
    const dangerous=u<(window.kind==="direct"?0.70:window.kind==="indirect"?0.30:0.48);
    if(closed)score.status="suspended";
    else if(dangerous && score.status==="active")score.status="limited";
    if(closed||dangerous){
      score.riskAdd=Math.max(score.riskAdd,window.kind==="direct"?0.38:0.16);
      score.impactRefs.push(window.id);
    }
  }
  return score;
}
function educationTransportLinkStateAt(world,link,fromId,year,month) {
  if(!link.endpointAreaIds.includes(fromId))return null;
  const toId=link.endpointAreaIds.find(x=>x!==fromId),
    directionOk=link.directionalAccess?.[fromId]===true;
  const impaired=educationTransportImpairmentAt(world,link,year,month);
  const authored=(link.statusHistory||[]).filter(x=>
    educationDateIndex(x.from?.year,x.from?.month)<=educationDateIndex(year,month) &&
    (!x.to || educationDateIndex(year,month)<=educationDateIndex(x.to.year,x.to.month)) &&
    (!x.fromAreaId || x.fromAreaId===fromId)).sort((a,b)=>
    educationDateIndex(b.from.year,b.from.month)-educationDateIndex(a.from.year,a.from.month))[0];
  const status=authored?.status||impaired.status;
  const allowed=directionOk&&status!=="suspended"&&status!=="closed";
  return {
    linkId:link.id,fromAreaId:fromId,toAreaId:toId,allowed,status,
    minutes:fromId===link.endpointAreaIds[0]?link.travelMinutesAB:link.travelMinutesBA,
    waitMinutes:link.transferWaitMinutes||0,
    riskScore:Math.min(1,(link.riskScore||0)+impaired.riskAdd),
    accessibility:link.accessibility||[],accessibilityKnown:link.accessibilityKnown===true,
    farePolicyId:link.farePolicyId,restrictionRefs:impaired.impactRefs
  };
}
function educationTransportationGraph(s,originAreaId,year=s?.year,month=s?.mo??0) {
  const world=s?.world?.educationWorld;
  if(!world?.areas?.[originAreaId]||educationDateIndex(year,month)===null)return [];
  return Object.values(world.transportLinks||{}).filter(x=>x.endpointAreaIds.includes(originAreaId))
    .map(x=>educationTransportLinkStateAt(world,x,originAreaId,year,month))
    .filter(Boolean);
}
function educationFindOneWay(s,fromAreaId,toAreaId,year,month,purpose="daily-commute") {
  const world=s?.world?.educationWorld;
  if(!world?.areas?.[fromAreaId]||!world?.areas?.[toAreaId])
    return {found:false,reason:"origin-unknown"};
  if(fromAreaId===toAreaId){
    const draw=educationDraw(world,fromAreaId,"intra-area-foot","time").value;
    const policy=world.areas[fromAreaId].localTravelPolicy,
      verified=policy?.evidenceRef && Number.isFinite(policy.minutes)&&policy.minutes>=0 &&
        Number.isFinite(policy.riskScore)&&policy.riskScore>=0&&policy.riskScore<=1;
    const mins=verified?policy.minutes:5+Math.floor(draw*16);
    return {found:true,minutes:mins,riskScore:verified?policy.riskScore:0.08,links:[],
      accessibility:verified?policy.accessibility||[]:[],
      accessibilityKnown:verified&&Array.isArray(policy.accessibility),waitMinutes:0,
      sourceKind:verified?"observed-local-route":"game-model-local-foot"};
  }
  let queue=[{area:fromAreaId,minutes:0,riskScore:0,links:[],accessibility:[],accessibilityKnown:true}],
    best=new Map(),sawClosed=false;
  while(queue.length){
    queue.sort((a,b)=>(a.riskScore*100+a.minutes)-(b.riskScore*100+b.minutes)||
      a.links.join("|").localeCompare(b.links.join("|")));
    const current=queue.shift();
    const cost=current.riskScore*100+current.minutes;
    if(best.has(current.area)&&best.get(current.area)<=cost)continue;
    best.set(current.area,cost);
    if(current.area===toAreaId)return {
      found:true,minutes:current.minutes,riskScore:current.riskScore,links:current.links,
      accessibility:current.accessibility,accessibilityKnown:current.accessibilityKnown
    };
    if(current.links.length>=4)continue;
    for(const edge of educationTransportationGraph(s,current.area,year,month)){
      const link=world.transportLinks[edge.linkId];
      if(link.allowedPurposes&&!link.allowedPurposes.includes(purpose))continue;
      if(!edge.allowed){sawClosed=true;continue;}
      if(current.links.includes(edge.linkId))continue;
      queue.push({
        area:edge.toAreaId,minutes:current.minutes+edge.minutes+edge.waitMinutes,
        riskScore:Math.max(current.riskScore,edge.riskScore),
        links:[...current.links,edge.linkId],
        accessibility:edge.accessibilityKnown ?
          (current.links.length && current.accessibilityKnown ? current.accessibility.filter(x=>edge.accessibility.includes(x)) : edge.accessibility) :
          current.accessibility,
        accessibilityKnown:current.accessibilityKnown&&edge.accessibilityKnown
      });
    }
  }
  return {found:false,reason:sawClosed?"route-suspended":"no-active-link"};
}
function educationFindRoute(s,{originAreaId,campusAreaId,year=s?.year,month=s?.mo??0,purpose="daily-commute"}={}) {
  if(!EDUCATION_MOBILITY_PURPOSES.includes(purpose) || educationDateIndex(year,month)===null)
    return {status:"unknown",reasonCodes:["term-timing-unknown"]};
  const outbound=educationFindOneWay(s,originAreaId,campusAreaId,year,month,purpose);
  if(!outbound.found)return {
    status:"blocked",reasonCodes:[outbound.reason],outboundMinutes:null,returnMinutes:null,
    outbound:null,returnTrip:null
  };
  const needsReturn=purpose==="daily-commute"||purpose==="exam-visit"||purpose==="temporary-visit";
  const returnTrip=needsReturn?educationFindOneWay(s,campusAreaId,originAreaId,year,month,purpose):null;
  if(needsReturn&&!returnTrip.found)return {
    status:"blocked",reasonCodes:["no-return-service"],
    outboundMinutes:outbound.minutes,returnMinutes:null,outbound,returnTrip
  };
  return {
    status:"feasible",reasonCodes:[],outboundMinutes:outbound.minutes,
    returnMinutes:returnTrip?.minutes??null,
    outbound,returnTrip,
    riskScore:Math.max(outbound.riskScore,returnTrip?.riskScore??0),
    basisRefs:[...new Set([...outbound.links,...returnTrip?.links||[]])]
  };
}
function educationGuardianReview(s,personId,purpose,institutionId,year,month,selectedConsentId=null) {
  const dependent=personId!=="protagonist"?educationDependentPerson(s,personId):null;
  if(personId!=="protagonist"&&!dependent)
    return {authorityStatus:"unknown-person",guardianConsentStatus:"unknown-person",escortStatus:"unknown"};
  const personAge=dependent?s.year-dependent.person.by:s.age;
  const minor=personAge<18;
  if(!minor)return {authorityStatus:"not-required",guardianConsentStatus:"not-required",escortStatus:"not-required"};
  const record=Object.entries(s.educationMobility?.consentRecords||{}).find(([id,x])=>
    (!selectedConsentId||selectedConsentId===id||selectedConsentId===x.id) &&
    x.personId===personId && x.purpose===purpose && x.institutionId===institutionId &&
    x.evidenceRef && x.consentState &&
    educationDateIndex(x.validFrom?.year,x.validFrom?.month)<=educationDateIndex(year,month) &&
    (!x.validThrough || educationDateIndex(year,month)<=educationDateIndex(x.validThrough.year,x.validThrough.month)))?.[1];
  const isParent=x=>["fa","mo"].includes(x) && s.care?.parentKeys?.includes(x) &&
    s.par?.[x] && !s.par[x].d && !s.par[x].separated;
  const explicitAuthority=x=>(s.educationMobility?.guardianAuthorities||[]).some(a=>
    a.personId===x && a.authority==="explicit-guardian"&&a.evidenceRef);
  const authorized=record&&(personId!=="protagonist" ?
    record.consenterPersonId==="protagonist"&&dependent.kind==="child" ||
    s.dependentEducation?.[personId]?.authority?.guardians?.some(x=>x.personId===record.consenterPersonId&&x.status==="verified") :
    isParent(record.consenterPersonId)||explicitAuthority(record.consenterPersonId));
  const consentStatus=record?.consentState==="refused"?"refused":
    authorized&&record.consentState==="granted"?"granted":
    record&&!authorized?"unverified":"pending";
  const escort=Object.values(s.educationMobility?.escortRecords||{}).find(x=>
    x.personId===personId && x.institutionId===institutionId && x.purpose===purpose &&
    x.status==="verified" && x.escortPersonId && x.evidenceRef &&
    educationDateIndex(x.validFrom?.year,x.validFrom?.month)<=educationDateIndex(year,month) &&
    (!x.validThrough || educationDateIndex(year,month)<=educationDateIndex(x.validThrough.year,x.validThrough.month)));
  return {
    authorityStatus:authorized?"parent-recorded":explicitAuthority(record?.consenterPersonId)?"explicit-guardian":"unconfirmed",
    guardianConsentStatus:consentStatus,
    escortStatus:escort?"verified":"unknown"
  };
}
function educationResolvePersonLocation(s,personId="protagonist") {
  if(personId!=="protagonist"){
    const entry=s.dependentEducation?.[personId],actual=entry?.actualResidence;
    return actual?.educationAreaId && s.world?.educationWorld?.areas?.[actual.educationAreaId] &&
      actual.sinceYear*12+(actual.sinceMonth||0)<=s.year*12+(s.mo||0) ?
      {personId,areaId:actual.educationAreaId,basis:"individual-residence-evidence"}:null;
  }
  const active=s.educationMobility?.residenceContracts &&
    Object.values(s.educationMobility.residenceContracts).find(x=>
      x.personId==="protagonist"&&x.status==="committed"&&x.actualAreaId&&
      educationResidenceContractMonth(x,s.year,s.mo));
  const areaId=active?.actualAreaId||s.local?.educationAreaId||null;
  return areaId && s.world?.educationWorld?.areas?.[areaId]
    ? {personId,areaId,residenceContractId:active?.id||null,basis:active?"committed-student-residence":"current-residence"}
    : null;
}
function educationCanReach(s,{institutionId,campusId,offeringId,
  personId="protagonist",year=s?.year,month,purpose="daily-commute",
  selectedEscortPersonId=null,selectedConsentId=null,accessibilityNeeds=[],
  residenceOfferId=null}={}) {
  const result={
    reachable:false,status:"unknown",purpose,reasonCodes:[],routePlanId:null,
    outboundMinutes:null,returnMinutes:null,safeTravelStatus:"needs-review",
    guardianConsentStatus:"not-required",residenceStatus:"not-applicable",
    fareQuoteRequest:null,basisRefs:[],
    evaluatedAt:{year,month:month??null}
  };
  const reasons=result.reasonCodes,world=s?.world?.educationWorld;
  const add=reason=>{if(!reasons.includes(reason))reasons.push(reason);};
  const dependent=personId!=="protagonist"?educationDependentPerson(s,personId):null;
  if(!s || personId!=="protagonist"&&!dependent) {add("unknown-person");result.status="blocked";return result;}
  const personAge=dependent?s.year-dependent.person.by:s.age;
  const inst=world?.institutions?.[institutionId],campus=world?.campuses?.[campusId],
    offering=world?.offerings?.[offeringId];
  if(!inst)add("unknown-institution");
  if(!campus||campus.institutionId!==institutionId)add("unknown-campus");
  if(!offering||offering.institutionId!==institutionId||offering.campusId!==campusId)
    add("no-matching-offering");
  if(reasons.length){result.status="blocked";return result;}
  const time=month==null?(year===s.year?s.mo:null):month;
  if(educationDateIndex(year,time)===null){add("term-timing-unknown");return result;}
  // A year-only quote cannot certify every later month of a historical crisis year.
  if(purpose==="daily-commute" && travelAwayDuringMonth(s,year,time,personId)){
    add("protagonist-away-on-journey");result.status="blocked";return result;
  }
  if(month==null && EDUCATION_OPERATION_WINDOWS.some(w=>w.region===world.areas[campus.educationAreaId].regionKey &&
    w.from[0]===year && w.kind!=="none"))add("term-timing-unknown");
  const school=educationSchoolStatusAt(s,offeringId,year,time);
  if(["destroyed","inaccessible","relocated"].includes(school.campusStatus))
    add("campus-temporarily-inaccessible");
  if((purpose==="daily-commute" && school.teachingStatus==="suspended") ||
    (purpose==="exam-visit" && ["suspended","closed","full"].includes(school.admissionStatus)))
    add("campus-temporarily-inaccessible");
  const origin=educationResolvePersonLocation(s,personId);
  if(!origin)add("origin-unknown");
  if(!origin){result.status="blocked";return result;}
  const route=educationFindRoute(s,{
    originAreaId:origin.areaId,campusAreaId:campus.educationAreaId,year,month:time,purpose
  });
  if(route.status!=="feasible")for(const code of route.reasonCodes)add(code);
  result.outboundMinutes=route.outboundMinutes??null;
  result.returnMinutes=route.returnMinutes??null;
  result.basisRefs=route.basisRefs||[];
  if(route.status==="feasible"){
    const risk=route.riskScore||0;
    result.safeTravelStatus=risk>=0.75?"critical":risk>=0.5?"high":risk>=0.25?"watch":"low";
    if(risk>=0.75 && purpose==="daily-commute")add("route-risk-critical");
    const minor=personAge<18;
    const guardian=educationGuardianReview(s,personId,purpose,institutionId,year,time,selectedConsentId);
    result.guardianConsentStatus=guardian.guardianConsentStatus;
    const escortRequired=minor && (personAge<=9 || (risk>=0.25&&personAge<12) || risk>=0.5);
    if(minor&&risk>=0.5&&guardian.escortStatus!=="verified")
      add("route-risk-unmitigated-minor");
    if(escortRequired && (guardian.escortStatus!=="verified" ||
       (selectedEscortPersonId && !Object.values(s.educationMobility?.escortRecords||{}).some(x=>
         x.escortPersonId===selectedEscortPersonId && x.institutionId===institutionId && x.status==="verified"))))
      add("escort-required");
    if(purpose==="daily-commute"){
      const limit=offering.stage==="primary" ? personAge<=9?35:personAge<=12?30:35 :
        EDUCATION_COMMUTE_LIMITS[offering.stage];
      if(Number.isFinite(limit) && (route.outboundMinutes>limit||route.returnMinutes>limit))
        add("time-limit-exceeded");
    } else if(["boarding-move","relative-lodging","family-relocation"].includes(purpose)){
      const offer=s.educationMobility?.residenceOffers?.[residenceOfferId];
      if(!offer||!offer.approved||!offer.evidenceRef||offer.campusId!==campusId ||
         !offer.areaId||!world.areas[offer.areaId]){
        add("residence-offer-unconfirmed");result.residenceStatus="unconfirmed";
      }else if((offer.capacityRemaining||0)<=0){
        add("boarding-full");result.residenceStatus="full";
      }else if(personAge<12 && (!offer.responsibleAdultId||!offer.overnightSupervisionConfirmed)){
        add("boarding-age-policy");result.residenceStatus="age-review";
      }else result.residenceStatus="offer-confirmed";
    }
    if(minor&&purpose!=="daily-commute"){
      if(guardian.guardianConsentStatus==="refused")add("guardian-consent-refused");
      else if(guardian.guardianConsentStatus==="unverified")add("guardianship-unverified");
      else if(guardian.guardianConsentStatus!=="granted")add("guardian-consent-pending");
      if(personAge<=11 && guardian.escortStatus!=="verified")add("escort-required");
    }
    for(const need of accessibilityNeeds){
      if(!route.outbound?.accessibilityKnown||!route.outbound.accessibility?.includes(need)||
         (route.returnTrip && (!route.returnTrip.accessibilityKnown ||
           !route.returnTrip.accessibility.includes(need))))
        add("accessible-route-unavailable");
    }
  }
  result.status=reasons.length?(reasons.every(x=>x==="term-timing-unknown")?"unknown":"blocked"):"feasible";
  result.reachable=result.status==="feasible";
  return result;
}
