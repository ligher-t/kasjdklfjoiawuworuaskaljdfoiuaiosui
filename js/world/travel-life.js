// Registered travel services are individual S-model assumptions, not national law.
const TRAVEL_CORRIDOR_MODELS=Object.freeze([
  {from:"クルビア",to:"レム・ビリトン",name:"鉱産物輸送の乗継便"},
  {from:"サルゴン",to:"イベリア",name:"隊商と港便をつなぐ行程"},
  {from:"イェラグ",to:"クルビア",name:"交易荷と同行する乗継便"}
]);
function travelCorridors(state,from=state.res.n,to=null){
  const abstract=(MIGRATION_ROUTES[from]||[]).filter(x=>!to||x.n===to).map(x=>({
    id:"migration-reference:"+from+":"+x.n,fromRegion:from,toRegion:x.n,
    passage:"unverified",sourceGrade:"S",sourceRef:"migration-cost-reference",
    name:from+"から"+x.n+"への広域行程",checkpoint:null}));
  const specific=TRAVEL_CORRIDOR_MODELS.filter(x=>x.from===from&&(!to||x.to===to)&&
    abstract.some(a=>a.toRegion===x.to)).map(x=>{
      const id="model-corridor:"+x.from+":"+x.to;
      return {id,fromRegion:x.from,toRegion:x.to,passage:"multimodal",sourceGrade:"S",
        sourceRef:"authored-individual-service:v1",name:x.name,
        checkpoint:{id:id+":inspection",region:x.from,stopId:id+":waiting-lodge",
          issuerId:id+":operator",closureFrom:[1099,1],closureThrough:[1099,12],
          permitFee:8000,detourFee:15000,detourId:id+":registered-bypass",guideId:id+":route-guide",
          basis:"S:fictional-route-specific-inspection"}};
    });
  const local={id:"model-local:"+from,fromRegion:from,toRegion:from,passage:"local-transport",
    sourceGrade:"S",sourceRef:"individual-local-transport-model",name:from+"内の別の停留地へ",checkpoint:null};
  const ferry=from==="シエスタ"&&state.year===1097&&state.mo>=7&&(!to||to===from)?[{
    ...local,id:"model:siesta:evacuation-ferry",passage:"sea",sourceRef:"S:individual-ferry-service",
    name:"シエスタ内の避難用連絡船（ゲーム内の個別運行）"}]:[];
  return [...abstract,...specific,...ferry,...(!to||to===from?[local]:[]),...Object.values(state.travelState?.corridors||{}).filter(x=>
    x.fromRegion===from&&(!to||x.toRegion===to))];
}
function travelRegisterCorridor(state,row){
  if(!row?.id||!row.sourceRef||!["S","B","C","D"].includes(row.sourceGrade)||
    !REG.some(x=>x.n===row.fromRegion)||!REG.some(x=>x.n===row.toRegion)||
    !(MIGRATION_ROUTES[row.fromRegion]||[]).some(x=>x.n===row.toRegion))throw Error("路線の根拠と地域が不正");
  const cp=row.checkpoint,validDate=x=>Array.isArray(x)&&Number.isInteger(x[0])&&Number.isInteger(x[1])&&x[1]>=1&&x[1]<=12;
  if(cp&&(!cp.id||!cp.stopId||!cp.issuerId||!cp.basis||!REG.some(x=>x.n===cp.region)||
    !validDate(cp.closureFrom)||!validDate(cp.closureThrough)||
    cp.closureFrom[0]*12+cp.closureFrom[1]>cp.closureThrough[0]*12+cp.closureThrough[1]||
    !Number.isSafeInteger(cp.permitFee)||cp.permitFee<0||!Number.isSafeInteger(cp.detourFee)||cp.detourFee<0))throw Error("検問の場所・期限・費用の根拠が不正");
  const t=ensureTravelState(state);t.corridors ||= {};
  const old=t.corridors[row.id];if(old&&JSON.stringify(old)!==JSON.stringify(row))throw Error("路線IDが矛盾");
  return t.corridors[row.id] ||= JSON.parse(JSON.stringify(row));
}
function travelCheckpointDefinition(state,journey=travelCurrentJourney(state)){
  const leg=journey?.legs?.[journey.activeLegIndex];if(!leg?.checkpointId)return null;
  const route=travelCorridors(state,leg.fromRegion,leg.toRegion).find(x=>x.id===leg.routeId),cp=route?.checkpoint;
  const date=state.year*12+(state.mo||1);
  return cp?.id===leg.checkpointId&&Array.isArray(cp.closureFrom)&&Array.isArray(cp.closureThrough)&&cp.sourceRef!=="unverified"?{...cp,
    active:date>=cp.closureFrom[0]*12+cp.closureFrom[1]&&date<=cp.closureThrough[0]*12+cp.closureThrough[1]}:null;
}
function travelCheckpointCan(state,action){
  const j=travelCurrentJourney(state),cp=travelCheckpointDefinition(state,j),leg=j?.legs[j.activeLegIndex];
  if(!cp||!["at-checkpoint","blocked"].includes(j.status)||restricted(state))return false;
  const funds=(inSharedHousehold(state)?state.house:state)?.cash||0;
  if(action==="wait")return !!cp.stopId;
  if(action==="detour")return !!cp.detourId&&!!cp.guideId&&funds>=cp.detourFee;
  if(action==="pass")return !cp.active||(j.permitRefs||[]).some(id=>{
    const p=state.travelState.permits?.[id];return p?.personId==="protagonist"&&p.routeId===leg.routeId&&
      p.checkpointId===cp.id&&p.issuerId===cp.issuerId&&p.status==="verified"&&p.evidenceRef&&
      p.validFrom.year*12+p.validFrom.month<=state.year*12+state.mo&&
      p.validThrough.year*12+p.validThrough.month>=state.year*12+state.mo;
  });
  return false;
}
function travelServiceDebit(state,j,kind,amount,reference){
  const t=ensureTravelState(state),id=j.id+":"+kind+":"+reference;
  if(t.transactions[id])return t.transactions[id];
  const personal=!inSharedHousehold(state),wallet=personal?state:state.house;
  if(!Number.isSafeInteger(amount)||amount<0||!wallet||wallet.cash<amount)throw Error("必要な費用を支払えない");
  wallet.cash-=amount;
  return t.transactions[id]={id,kind:"fare",serviceKind:kind,journeyId:j.id,legId:j.legs[j.activeLegIndex].id,
    amount,currency:"龍門幣",paidBy:personal?"personal":"household",year:state.year,month:state.mo,
    source:"verified-route-service",evidenceRef:reference};
}
function travelCheckpointAction(state,action){
  const j=travelCurrentJourney(state),cp=travelCheckpointDefinition(state,j),leg=j?.legs[j.activeLegIndex];
  if(!travelCheckpointCan(state,action))throw Error("検問でこの行動を選べる根拠がない");
  if(action==="wait"){
    j.status="blocked";j.currentStopId=cp.stopId;j.currentStopRegion=cp.region;
    j.permitInquiry ||= {id:j.id+":"+leg.id+":permit-inquiry",issuerId:cp.issuerId,requestedAt:{year:state.year,month:state.mo}};
  }else{
    if(action==="detour"){
      travelServiceDebit(state,j,"detour",cp.detourFee,leg.id+":"+cp.detourId);
      leg.detourId=cp.detourId;leg.guideId=cp.guideId;
    }else leg.checkpointPassedAt={year:state.year,month:state.mo};
    leg.inspectionResolved=true;j.currentCheckpointId=null;j.currentStopId=null;j.currentStopRegion=null;
    j.status="en-route";leg.departedAt={year:state.year,month:state.mo};j.departedAt={...leg.departedAt};
    leg.durationMonths=1;j.lastProcessed={...leg.departedAt};
  }
  return j;
}
function travelProcessServicesMonth(state,j,year,month){
  const date=year*12+month,leg=j.legs[j.activeLegIndex],cp=travelCheckpointDefinition({...state,year,mo:month},j);
  if(j.permitInquiry&&!j.permitInquiry.answeredAt&&date>travelMonthIndex(j.permitInquiry.requestedAt)&&cp){
    const id=j.permitInquiry.id+":response";state.travelState.permits ||= {};
    state.travelState.permits[id]={id,personId:"protagonist",routeId:leg.routeId,checkpointId:cp.id,
      issuerId:cp.issuerId,status:"offered",fee:cp.permitFee,validFrom:{year,month},validThrough:{year,month:12},
      evidenceRef:id+":operator-reply",basis:cp.basis};
    j.permitInquiry.answeredAt={year,month};j.permitInquiry.permitId=id;
  }
  if(j.localWork?.status==="active"&&!restricted(state)&&["arrived","at-stop"].includes(j.status)&&
     date>travelMonthIndex(j.localWork.startedAt)){
    const work=j.localWork,id=work.id+":"+year+":"+month,t=state.travelState;
    if(!t.transactions[id]){
      const personal=!inSharedHousehold(state),wallet=personal?state:state.house;
      wallet.cash+=work.monthlyPay;
      t.transactions[id]={id,kind:"income",journeyId:j.id,legId:leg.id,year,month,amount:work.monthlyPay,
        paidBy:personal?"personal":"household",source:work.evidenceRef,employerId:work.employerId};
    }
  }
}
function travelAcceptPermit(state){
  const j=travelCurrentJourney(state),id=j?.permitInquiry?.permitId,p=state.travelState?.permits?.[id];
  const cp=travelCheckpointDefinition(state,j),leg=j?.legs[j.activeLegIndex],date=state.year*12+state.mo;
  if(!j||!p||!["offered","verified"].includes(p.status)||!cp||p.personId!=="protagonist"||
    p.routeId!==leg.routeId||p.checkpointId!==cp.id||p.issuerId!==cp.issuerId||!p.evidenceRef||
    date<travelMonthIndex(p.validFrom)||date>travelMonthIndex(p.validThrough))throw Error("この検問の交付回答がない");
  if(p.status==="verified")return p;
  travelServiceDebit(state,j,"permit",p.fee,id);p.status="verified";
  if(!j.permitRefs.includes(id))j.permitRefs.push(id);return p;
}
function travelStayInquiry(state){
  const j=travelCurrentJourney(state),p=travelPresence(state);
  if(!j||j.status!=="arrived"||j.legs[j.activeLegIndex].returnToBase)throw Error("旅先への実到着が必要");
  const id=j.id+":stay-inquiry:"+j.activeLegIndex;
  const home=allowedHomesForRegion(p.region).includes("固定集落")?"固定集落":"移動都市",
    kind=home==="固定集落"?"小規模な定住地":"移動都市の周縁区",
    base=(home==="固定集落"?SIM_TABLES.locality.fixed:SIM_TABLES.locality.mobile).find(x=>x.n===kind),
    placeId=p.localityKey||j.id+":stop:"+j.activeLegIndex;
  j.stayOffer ||= {id,region:p.region,localityKey:placeId,
    home,localKind:kind,local:{kind,city:p.city,ecology:(SIM_TABLES.environments[p.region]||[])[0]?.n||"未特定",
      mixedNeighborhood:false,access:base.access,hazard:base.hazard,info:base.info,
      placeId,districtId:id+":living",identitySignature:p.region+"|"+(p.city||"")+"|"+home+"|"+kind},
    providerId:id+":lodging-desk",status:"available",
    monthlyQuote:travelStayQuote(state,p.region).amount,
    evidenceRef:id+":individual-response",basis:"S:individual-host-model"};
  if(!j.workOffer){
    const available=keyedRoll(id+":short-work")<0.8;
    j.workOffer={id:id+":work",region:p.region,employerId:id+":local-workshop",status:available?"offered":"unavailable",
      monthlyPay:Math.round(P("economy.minimumExpenseBase")*(REG.find(x=>x.n===p.region).pm)/12*0.6),
      evidenceRef:id+":actual-work-offer",term:"during-this-journey-at-this-stop",basis:"S:individual-short-work"};
  }
  return j.stayOffer;
}
function travelTakeLocalWork(state){
  const j=travelCurrentJourney(state);if(!j||j.status!=="arrived"||j.workOffer?.status!=="offered"||restricted(state))throw Error("引き受けられる旅先の仕事がない");
  if(j.localWork?.status==="active")return j.localWork;
  j.localWork={...j.workOffer,status:"active",startedAt:{year:state.year,month:state.mo}};return j.localWork;
}
function travelContinue(state,destinationRegion,corridorId=null,permissions={}){
  const j=travelCurrentJourney(state),p=travelPresence(state);
  if(!j||j.returning||restricted(state)||!["arrived","at-stop"].includes(j.status)||!p.region||j.legs.length>=24)throw Error("次の行程を決められる停留地にいない");
  const route=travelCorridors(state,p.region,destinationRegion).find(x=>!corridorId||x.id===corridorId);
  if(!route||destinationRegion!==p.region&&!(MIGRATION_ROUTES[destinationRegion]||[]).some(x=>x.n===p.region))throw Error("往来できる次区間が登録されていない");
  const party=travelValidateCompanions(state,permissions.companionAgreementId,destinationRegion);
  if(JSON.stringify(party.map(x=>x.personId))!==JSON.stringify(j.companions.map(x=>x.personId)))throw Error("次の行先について同行者の了承が必要");
  const guardian=state.age<18?travelMinorPermission(state,{destinationRegion,guardianAgreementId:permissions.guardianAgreementId}):null;
  if(state.age<18&&!guardian)throw Error("次の行先について保護者の同行了承が必要");
  const leg={id:travelAllocateLegId(j,p.region,destinationRegion),routeId:route.id,fromRegion:p.region,toRegion:destinationRegion,
    durationMonths:1,checkpointId:route.checkpoint?.id||null,checkpointRegion:route.checkpoint?.region||null,
    sourceKind:route.sourceGrade,passage:route.passage};
  travelDebitLeg(state,{...j,companions:party,guardianEscort:guardian},leg);
  j.companions=party;j.companionAgreementId=permissions.companionAgreementId||null;j.guardianEscort=guardian;
  if(j.localWork?.status==="active")j.localWork.status="ended";
  j.legs.push(leg);j.activeLegIndex=j.legs.length-1;j.destinationRegion=destinationRegion;
  j.currentStopId=null;j.currentStopRegion=null;j.currentCheckpointId=null;j.status="en-route";
  leg.departedAt={year:state.year,month:state.mo};j.departedAt={...leg.departedAt};j.lastProcessed={...leg.departedAt};
  delete j.stayOffer;delete j.workOffer;delete j.medicalInquiry;delete j.staySupport;
  delete j.permitInquiry;delete j.separationAgreement;delete j.separationAcknowledged;return j;
}
function travelCompanionCandidates(state){
  return [state.sp,...(state.kids||[]).filter(x=>x&&!x.d&&x.householdStatus!=="independent"&&
    !["former","former_support","unresolved"].includes(x.householdResidencePlan)&&
    (!x.residenceRegion||x.residenceRegion===state.res.n)&&
    (!state.residenceBase||!x.residenceBaseId||x.residenceBaseId===state.residenceBase.id))]
    .filter(x=>x&&!x.d&&x.id&&(x!==state.sp||spouseLivesWithProtagonist(state)));
}
function travelCompanionAgreement(state,personIds,destinationRegion){
  if(!REG.some(x=>x.n===destinationRegion))throw Error("同行の目的地が未確認");
  const ids=[...new Set(personIds)].sort(),known=travelCompanionCandidates(state),
    rows=ids.map(id=>known.find(x=>x.id===id));
  if(!ids.length||rows.some(x=>!x))throw Error("同行を相談できる同居家族が一致しない");
  const t=ensureTravelState(state),id=["travel-party",state.year,state.res.n,destinationRegion,...ids].join(":");
  t.companionAgreements ||= {};if(t.companionAgreements[id])return t.companionAgreements[id];
  const responses=rows.map(person=>({personId:person.id,
    status:person!==state.sp&&state.year-person.by<18?"guardian-permitted":
      keyedRoll(id+":"+person.id+":adult-response")<0.8?"granted":"refused",
    wishes:person!==state.sp&&state.year-person.by<18?"unconfirmed":"reported"})),
    approved=responses.every(x=>x.status!=="refused");
  return t.companionAgreements[id]={id,year:state.year,destinationRegion,personIds:ids,status:approved?"granted":"refused",
    guardianId:"protagonist",responses,evidenceRef:id+":family-consultation",basis:"game-model-family-response"};
}
function travelValidateCompanions(state,agreementId,destinationRegion=null){
  if(!agreementId)return [];
  const a=state.travelState?.companionAgreements?.[agreementId],known=travelCompanionCandidates(state);
  if(!a||destinationRegion&&a.destinationRegion!==destinationRegion||a.status!=="granted"||a.year!==state.year||!a.evidenceRef||a.personIds.some(id=>!known.some(x=>x.id===id))||
    a.responses?.some(x=>x.status==="refused"))throw Error("同行の有効な同意記録がない");
  return a.personIds.map(personId=>({personId,agreementId:a.id,joinedAt:{year:state.year,month:state.mo}}));
}
function travelMonthPresence(state,j,year,month){
  const leg=j.legs[j.activeLegIndex],p=travelPresence(state);
  const id=j.id+":"+year+":"+month,t=ensureTravelState(state);t.journeyMonthLedger ||= {};
  return t.journeyMonthLedger[id] ||= {id,journeyId:j.id,year,month,mode:j.status,
    region:["arrived","at-stop","blocked","at-checkpoint"].includes(j.status)?
      j.currentStopRegion||(j.status==="at-checkpoint"?leg.checkpointRegion:leg.toRegion):null,
    city:j.status==="arrived"?(leg.returnToBase?state.local?.city:leg.toLocation?.city)||null:null,companionIds:j.companions.map(x=>x.personId),
    homeRetained:!state.fl?.war_displaced&&!state.displacement?.active,
    evidenceRef:leg.id+":committed-presence"};
}
function travelRecordHistoryArrival(state,j){
  const leg=j.legs[j.activeLegIndex];
  if(leg.historyArrivalRecorded)return;
  travelArrivalConsequences(state,j);
  leg.historyArrivalRecorded=true;
  ensureTravelState(state).history.push({journeyId:j.id,legId:leg.id,kind:"arrival",at:{...leg.arrivedAt},
    region:leg.toRegion,companionIds:j.companions.map(x=>x.personId)});
}
function travelSettle(state){
  const j=travelCurrentJourney(state),p=travelPresence(state),offer=j?.stayOffer;
  if(!j||j.status!=="arrived"||!offer||offer.region!==p.region||offer.status!=="available"||state!==S)throw Error("実到着と受入先の住居確認が必要");
  if(restricted(state))throw Error("現在は住まいの契約を決められない");
  if(state.sp&&!state.sp.d&&spouseLivesWithProtagonist(state)&&!j.companions.some(x=>x.personId===state.sp.id)){
    if(j.separationAgreement?.spouseId!==state.sp.id||j.separationAgreement.destinationRegion!==p.region)throw Error("旅先で暮らす前に配偶者と別居を相談する必要がある");
    if(j.separationAgreement.status==="refused"&&!j.separationAcknowledged)throw Error("配偶者の反対を受けて、定住の意思を改めて決める必要がある");
  }
  const id=j.id+":settlement";if(state.travelState.settlements?.[id])return state.travelState.settlements[id];
  const snapshot=JSON.parse(JSON.stringify(state)),party=new Set(j.companions.map(x=>x.personId)),
    oldBase=state.residenceBase?.id,oldRegion=state.res.n,oldSpouse=state.sp?JSON.parse(JSON.stringify(state.sp)):null;
  try{
    // The original residence operation owns affiliation and locality changes.
    ap({resTo:offer.region,home:offer.home,localKind:offer.localKind,resFareCovered:true,travelResidenceRef:offer.id,fl:{household_separated:1}});
    if(oldSpouse&&!party.has(oldSpouse.id)){
      state.sp.residenceRegion=oldSpouse.residenceRegion||oldRegion;
      state.sp.knownResidenceRegion=oldSpouse.knownResidenceRegion||oldRegion;
      state.sp.sharesHousehold=false;state.sp.residenceBaseId=oldBase;
      state.rl=Math.max(0,state.rl-(j.separationAgreement?.status==="refused"?8:0));
      state.sp.residenceMovePending=null;
    }
    if(oldSpouse&&party.has(oldSpouse.id)){
      state.sp.residenceRegion=offer.region;state.sp.knownResidenceRegion=offer.region;
      state.sp.residenceBaseId=state.residenceBase?.id||null;state.sp.sharesHousehold=true;
      state.sp.residenceMovePending=null;
    }
    if(oldSpouse){
      state.sp.residenceKnownYear=state.year;state.sp.residenceHistory ||= [];
      state.sp.residenceHistory.push({year:state.year,from:oldRegion,to:state.sp.residenceRegion,
        decision:party.has(oldSpouse.id)?"follow":"stay",journeyId:j.id});
      state.sp.residenceHistory=state.sp.residenceHistory.slice(-16);
    }
    for(const child of state.kids||[]){
      if(party.has(child.id)){
        child.residenceRegion=offer.region;child.residenceBaseId=state.residenceBase?.id;
        const entry=state.dependentEducation?.[child.id];
        if(entry)educationDependentResidenceUpdate(state,{personId:child.id,kind:"family-home",region:offer.region,
          areaId:state.local.educationAreaId,effectiveAt:{year:state.year,month:state.mo},sourceEventId:id,
          reportedToProtagonist:true,knownAt:{year:state.year,month:state.mo}});
      }else if(!child.d){child.residenceRegion ||= oldRegion;child.residenceBaseId ||= oldBase;}
    }
    state.residenceArrangement=party.has(state.sp?.id)?"spouse_shared":"independent_rental";
    state.residenceHistory ||= [];
    state.residenceHistory.push({year:state.year,arrangement:state.residenceArrangement,
      householdSeparated:true,reason:"旅先で確認した住まいへの定住",journeyId:j.id});
    state.residenceHistory=state.residenceHistory.slice(-24);
    if(state.moves?.length){const move=state.moves.at(-1);move.householdSize=1+party.size;
      move.journeyId=j.id;move.localityOfferId=offer.id;}
    const settled=state.travelState.journeys[j.id];settled.status="completed";
    settled.conclusion={reason:"settled",year:state.year,month:state.mo,localityKey:localityKey(state)};
    if(settled.localWork){settled.localWork.status="ended";settled.localWork.endedAt={year:state.year,month:state.mo};settled.localWork.endReason="agreed-journey-term-ended";}
    state.travelState.activeJourneyId=null;state.travelState.lifestyle="settled";
    const record={id,journeyId:j.id,region:offer.region,providerId:offer.providerId,evidenceRef:offer.evidenceRef,
      year:state.year,month:state.mo,companionIds:[...party]};
    (state.travelState.settlements ||= {})[id]=record;return record;
  }catch(error){for(const key of Object.keys(state))delete state[key];Object.assign(state,snapshot);throw error;}
}
function travelEducationJourney(state,caseId,permissions={}){
  const item=state.educationCases?.items?.[caseId],o=state.world?.educationWorld?.offerings?.[item?.offeringId],
    area=state.world?.educationWorld?.areas?.[state.world.educationWorld.campuses[o?.campusId]?.educationAreaId];
  if(!item||item.examAttendedAt||item.phase!=="application"||!o||!area||area.regionKey===state.res.n)throw Error("越境受験の出願と実在校が必要");
  const trip=travelStart(state,{purpose:"study",destinationRegion:area.regionKey,...permissions});
  trip.educationRef={caseId:item.id,applicationId:item.applicationId,offeringId:o.id,campusId:o.campusId};
  const cityKey=area.cityOrSettlementKey,city=cityKey?.startsWith("city:")?cityKey.slice(5):null;
  trip.legs[0].toLocation={campusId:o.campusId,localityKey:area.id,city};
  return trip;
}
function travelGuardianConsult(state,destinationRegion){
  const guardian=educationCaseKnownGuardian(state);
  if(state.age>=18||!guardian||!REG.some(x=>x.n===destinationRegion))throw Error("本人の旅行を判断する保護者が未確認");
  const t=ensureTravelState(state),id=["travel-guardian",state.year,guardian.personId,destinationRegion].join(":");
  t.guardianAgreements ||= {};
  return t.guardianAgreements[id] ||= {id,personId:"protagonist",guardianId:guardian.personId,
    destinationRegion,year:state.year,status:keyedRoll(id+":consent")<0.8?"granted":"refused",
    accompanied:true,evidenceRef:id+":guardian-response"};
}
function travelMinorPermission(state,request){
  const g=educationCaseKnownGuardian(state),a=state.travelState?.guardianAgreements?.[request?.guardianAgreementId];
  return g&&a?.guardianId===g.personId&&a.personId==="protagonist"&&a.status==="granted"&&a.year===state.year&&
    a.destinationRegion===request.destinationRegion&&a.accompanied&&a.evidenceRef?{...a}:null;
}
function travelEducationCanAttend(state){
  const j=travelCurrentJourney(state),ref=j?.educationRef,item=state.educationCases?.items?.[ref?.caseId];
  const o=state.world?.educationWorld?.offerings?.[item?.offeringId],leg=j?.legs[j.activeLegIndex],
    area=state.world?.educationWorld?.areas?.[state.world.educationWorld.campuses[o?.campusId]?.educationAreaId];
  return !!(j&&j.status==="arrived"&&!restricted(state)&&item&&item.status==="active"&&
    item.applicationId===ref.applicationId&&item.offeringId===ref.offeringId&&item.phase==="application"&&
    leg.toLocation?.campusId===o?.campusId&&area?.regionKey===leg.toRegion&&
    (!item.examAt||state.year*12+state.mo===item.examAt.year*12+item.examAt.month)&&
    ["open","limited"].includes(educationSchoolStatusAt(state,item.offeringId,state.year,state.mo)?.admissionStatus));
}
function travelEducationAttendance(state){
  if(!travelEducationCanAttend(state))throw Error("受験先への到着と試験日を確認できない");
  const j=travelCurrentJourney(state),ref=j.educationRef,item=state.educationCases.items[ref.caseId];
  item.examAttendedAt ||= {year:state.year,month:state.mo,journeyId:j.id};
  item.educationJourneyId=j.id;item.mobilityReceiptRefs=j.legs.map(x=>x.fareReceiptId||x.id+":fare");return item;
}
function travelLifeInvariants(state){
  const t=state.travelState;if(!t)return [];
  const problems=[];
  for(const row of Object.values(t.journeyMonthLedger||{}))if(!t.journeys[row.journeyId]||
    !Number.isInteger(row.month)||row.month<1||row.month>12||row.year>state.year||!Array.isArray(row.companionIds))problems.push("旅先の月別所在が不正");
  for(const j of Object.values(t.journeys||{})){
    if(!j||!Array.isArray(j.legs)||!Array.isArray(j.companions)){problems.push("旅程の区間・同行者の構造が不正");continue;}
    if(j.status==="at-checkpoint"&&!travelCheckpointDefinition(state,j))problems.push("有効な路線にない検問");
    if(j.companions?.some(x=>!t.companionAgreements?.[x.agreementId]?.personIds.includes(x.personId)))problems.push("旅程の同行同意が不一致");
  }
  for(const permit of Object.values(t.permits||{})){
    if(!permit||permit.personId!=="protagonist"||!["offered","verified"].includes(permit.status)||!permit.evidenceRef||
      !permit.routeId||!permit.checkpointId||!permit.issuerId||!Number.isSafeInteger(permit.fee)||permit.fee<0||
      !Number.isInteger(permit.validFrom?.year)||!Number.isInteger(permit.validThrough?.year)||
      !Number.isInteger(permit.validFrom?.month)||permit.validFrom.month<1||permit.validFrom.month>12||
      !Number.isInteger(permit.validThrough?.month)||permit.validThrough.month<1||permit.validThrough.month>12)
      problems.push("個別の通行許可の本人・根拠・期限が不正");
  }
  return problems;
}

// Environmental exposure is limited to recorded stops; an unlocated road leg
// cannot inherit the home city's battle or both endpoint countries' hazards.
function travelPressureShare(state,pressure){
  const relevant=Object.values(state.travelState?.journeys||{}).some(j=>j.legs?.[0]?.departedAt&&
    j.legs[0].departedAt.year<=state.year&&(!j.conclusion||j.conclusion.year>=state.year));
  if(!relevant)return null;
  if(state.mo>0){
    const p=travelPresence(state);return ["residence","stop","checkpoint"].includes(p.mode)&&
      pressureMatchesPlace(pressure,p.region,p.city)?1:0;
  }
  const ledger=Object.values(state.travelState?.journeyMonthLedger||{}),year=state.year;
  let exposed=0;
  for(let month=1;month<=12;month++){
    if(!pressureMatchesMonth(pressure,year,month))continue;
    const row=ledger.find(x=>x.year===year&&x.month===month);
    if(row){if(row.region&&pressureMatchesPlace(pressure,row.region,row.city))exposed++;}
    else if(!travelAwayDuringMonth(state,year,month)){
      const next=Object.values(state.travelState.journeys).filter(j=>j.legs?.[0]?.departedAt&&
        travelMonthIndex(j.legs[0].departedAt)>year*12+month).sort((a,b)=>travelMonthIndex(a.legs[0].departedAt)-travelMonthIndex(b.legs[0].departedAt))[0];
      if(pressureMatchesPlace(pressure,next?.originRegion||state.res.n,next?next.originCity:state.local?.city))exposed++;
    }
  }
  return exposed/12;
}
const HISTORICAL_SCOPE_LEDGER=Object.freeze(HIST.map(h=>({flag:h.flag,year:h.y,
  sourceMonth:Number.isInteger(h.month)?h.month:null,
  gameStartMonth:h.availableFromMonth||1,sourceGrade:h.conf,infoScope:h.infoScope||"public",
  regions:[...(h.localRegions||[]),h.localRegion].filter(Boolean),
  cities:[...(h.localCities||[]),h.localCity,h.city].filter(Boolean),
  sourceRefs:[...(h.references||[])],
  sceneIds:EV.filter(e=>e.timelineFlag===h.flag).map(e=>e.id)})));

function travelSeparationConsult(state){
  const j=travelCurrentJourney(state),sp=state.sp;
  if(!j||j.status!=="arrived"||!sp||sp.d||!spouseLivesWithProtagonist(state)||j.companions.some(x=>x.personId===sp.id))throw Error("別居を相談する相手と旅先が確認できない");
  const id=j.id+":"+j.activeLegIndex+":separation:"+state.year;
  j.separationAgreement ||= {id,spouseId:sp.id,destinationRegion:travelPresence(state).region,
    status:keyedRoll(id+":answer")<0.7?"granted":"refused",year:state.year,
    evidenceRef:id+":spouse-answer",basis:"game-model-family-response"};
  return j.separationAgreement;
}

function travelResidenceOffer(state,id){
  const j=travelCurrentJourney(state),o=j?.stayOffer;
  if(j?.status!=="arrived"||o?.id!==id||o.status!=="available"||!o.local||
    o.region!==travelPresence(state).region||!o.evidenceRef||o.localityKey!==o.local.placeId)throw Error("確認した旅先の住居と実到着が一致しない");
  return o;
}

function travelAllocateLegId(j,from,to){
  let n=j.legs.length,id;
  do{id=j.id+":leg:"+n++;}while(j.legs.some(x=>x.id===id)||
    j.returnReservation?.legId===id&&(j.returnReservation.fromRegion!==from||j.returnReservation.toRegion!==to));
  return id;
}

function travelIntent(state,purpose,destinationRegion=null){
  if(!TRAVEL_PURPOSES.includes(purpose))throw Error("旅の目的が不明");
  const t=ensureTravelState(state),id=(TRACE_RESOLUTION?.id||"personal-travel")+":"+state.year+":"+state.mo;
  return t.intent={id,purpose,destinationRegion,causeEventId:TRACE_RESOLUTION?.id||null,
    originRegion:travelPresence(state).region,requestedAt:{year:state.year,month:state.mo},status:"planning"};
}
const TRAVEL_ENGINE_PRODUCED_FLAGS=new Set(["kazdel_left","kazdel_displaced","kazdel_displaced_life","silence_survivor","volcano_evacuee","chernobog_refugee"]);
function travelArrivalConsequences(state,j){
  if(j.legs[j.activeLegIndex].returnToBase)return;
  if(j.purpose==="flight"&&j.originRegion==="イベリア"&&/海|沿岸|港/.test(j.originEcology||"")&&j.startedAt.year===1038&&j.startedAt.month>=7)state.fl.silence_survivor=1;
  if(j.purpose==="flight"&&j.originRegion==="シエスタ"&&j.legs[j.activeLegIndex].passage==="sea"&&j.startedAt.year===1097&&j.startedAt.month>=7)state.fl.volcano_evacuee=1;
  if(j.purpose==="flight"&&j.originRegion==="ウルサス"&&j.originCity==="チェルノボーグ"&&
    j.causeEventId==="timeline_chernobog_incident_local"&&
    j.startedAt.year*12+j.startedAt.month>=1096*12+12&&j.startedAt.year*12+j.startedAt.month<=1097*12+1)state.fl.chernobog_refugee=1;
  if(j.purpose==="flight"&&j.originRegion==="カズデル"&&j.causeEventId==="kazdel_afterfall"){state.fl.kazdel_displaced=1;state.fl.kazdel_displaced_life=1;state.fl.kazdel_stayed=0;}
  if(j.purpose==="flight"&&j.originRegion==="カズデル"&&j.causeEventId==="kaz_exile"&&j.legs[j.activeLegIndex].toRegion!=="カズデル"){
    state.fl.kazdel_left=1;state.fl.kazdel_displaced_life=1;state.fl.kazdel_stayed=0;
  }
}
function travelHealthInquiry(state){
  const j=travelCurrentJourney(state),p=travelPresence(state);
  if(!j||!["stop","checkpoint"].includes(p.mode)||!p.region)throw Error("医療窓口を照会できる滞在地が未確認");
  const id=j.id+":"+j.activeLegIndex+":clinic";
  return j.medicalInquiry ||= {id,region:p.region,providerId:id+":local-clinic",
    status:keyedRoll(id+":availability")<0.65?"contact-confirmed":"not-confirmed",
    evidenceRef:id+":local-service-reply",at:{year:state.year,month:state.mo},
    treatmentStarted:false,diagnosisShared:false,basis:"S:individual-local-clinic-inquiry"};
}
function travelSupportInquiry(state){
  const j=travelCurrentJourney(state),p=travelPresence(state);
  if(!j||!["stop","checkpoint"].includes(p.mode)||!p.region)throw Error("支援を相談する滞在地が未確認");
  const id=j.id+":"+j.activeLegIndex+":provisions-support";
  return j.staySupport ||= {id,providerId:id+":lodging-provider",region:p.region,
    status:keyedRoll(id+":answer")<0.45?"approved":"refused",remaining:Math.round(travelStayQuote(state,p.region).amount/2),
    evidenceRef:id+":individual-reply",from:{year:state.year,month:state.mo},basis:"S:individual-provision-discount"};
}
