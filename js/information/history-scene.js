// One pure decision for dispatch, pending choices, exposure and records.
function historicalSceneEligibility(event,state) {
  const scene=event?.historicalScene,entry=HIST.find(h=>h.flag===event?.timelineFlag);
  const fail=reason=>({eligible:false,delivery:scene?.delivery||null,reason,eventYear:entry?.y||null,
    placeEvidence:null,timeEvidence:null,journeyId:null,exposureBasis:null});
  if(!scene||!entry)return fail("scene-unclassified");
  if(scene.delivery==="suspended")return fail("scene-unverified");
  if(!["direct","area-impact","report-response","journey"].includes(scene.delivery))return fail("scene-unclassified");
  if(!state?.world?.events?.[entry.flag]||!historyAvailabilityReached(entry,state))return fail("history-not-active");
  const month=state.mo,from=scene.from||[entry.y,entry.availableFromMonth||1],
    through=scene.through||[entry.y,12],date=state.year*12+(month||1);
  if(date<from[0]*12+from[1]||date>through[0]*12+through[1])return fail("scene-window-closed");
  const presence=travelPresence(state),regions=scene.regions||[scene.region].filter(Boolean);
  if(scene.delivery==="report-response"){
    if(entry.infoScope==="sealed"||!state.infoLog?.some(x=>x.id===entry.flag&&x.heardYear<=state.year&&
      (x.heardYear<state.year||!x.heardMonth||x.heardMonth<=(month||0))))return fail("report-not-known");
    if(regions.length&&!regions.includes(presence.region))return fail("outside-impact-area");
    return {eligible:true,delivery:scene.delivery,eventYear:entry.y,timeEvidence:{year:state.year,month:month||null},
      placeEvidence:null,journeyId:null,exposureBasis:"received-information"};
  }
  if(!Number.isInteger(month)||month<1||month>12){
    if(scene.delivery!=="area-impact"||state.year===entry.y)return fail("presence-unknown");
  }
  if(scene.delivery==="journey"){
    const journey=travelCurrentJourney(state),leg=journey?.legs[journey.activeLegIndex];
    if(!journey||!(state.travelState.lifestyle==="itinerant"||journey.purpose==="flight"&&journey.causeEventId)||
       journey.status!=="at-checkpoint"||presence.mode!=="checkpoint")return fail("journey-inactive");
    if(!travelCheckpointDefinition(state,journey)?.active||leg?.checkpointId!==presence.checkpointId)return fail("checkpoint-not-established");
    return {eligible:true,delivery:"journey",eventYear:entry.y,placeEvidence:presence,
      timeEvidence:{year:state.year,month},journeyId:journey.id,exposureBasis:leg.id+":"+presence.checkpointId};
  }
  if(!["residence","stop"].includes(presence.mode)||!presence.region)return fail("presence-unknown");
  if(regions.length&&!regions.includes(presence.region))return fail("outside-scene");
  if(scene.city&&presence.city!==scene.city)return fail("outside-scene");
  if(scene.delivery==="direct"&&!scene.city&&!scene.siteId)return fail("place-unverified");
  if(scene.siteId&&!state.historicalAccess?.some(x=>x.siteId===scene.siteId&&x.personId==="protagonist"&&
    x.evidenceRef&&x.year===state.year&&x.month===month))return fail("role-not-established");
  if(entry.infoScope==="sealed"&&!scene.siteId)return fail("sealed-unqualified");
  return {eligible:true,delivery:scene.delivery,eventYear:entry.y,placeEvidence:presence,
    timeEvidence:{year:state.year,month:month||null},journeyId:presence.journeyId||null,
    exposureBasis:scene.siteId||"city:"+presence.region+":"+presence.city};
}
function historicalSceneExposure(event,state,choiceIndex,outcomeIndex) {
  const proof=historicalSceneEligibility(event,state);
  if(!proof.eligible||proof.delivery!=="direct")return null;
  return {eventId:event.id,flag:event.timelineFlag,subjectId:"protagonist",choiceIndex,outcomeIndex,
    year:state.year,month:state.mo,placeRef:proof.exposureBasis,
    exposureRef:event.id+":"+state.year+":"+state.mo+":"+choiceIndex+":"+outcomeIndex,
    journeyId:proof.journeyId,basis:"validated-historical-scene"};
}
function historicalLocalCrisis(entry,state) {
  if(entry.infoScope==="sealed"||!historyAvailabilityReached(entry,state))return false;
  const window={londinium_war:[[1098,7],[1098,9]],chernobog_incident:[[1096,12],[1097,1]]}[entry.flag];
  if(window){const date=state.year*12+(state.mo||1);if(!state.mo||date<window[0][0]*12+window[0][1]||date>window[1][0]*12+window[1][1])return false;}
  const p=travelPresence(state);if(!["residence","stop"].includes(p.mode))return false;
  const cities=[...(entry.localCities||[]),entry.localCity,entry.city].filter(Boolean),
    regions=[...(entry.localRegions||[]),entry.localRegion].filter(Boolean);
  if(cities.length)return !!p.city&&cities.includes(p.city)&&(!regions.length||regions.includes(p.region));
  return regions.includes(p.region);
}
function auditHistoricalExposureState(state){
  const x=state.deathHistorical;if(x==null)return [];
  const event=EV.find(e=>e.id===x.eventId),scene=event?.historicalScene,
    result=event?.c?.[x.choiceIndex]?.o?.[x.outcomeIndex]?.[2]?.d,
    date=x.year*12+x.month;
  return state.dead&&scene?.delivery==="direct"&&event.timelineFlag===x.flag&&
    x.subjectId==="protagonist"&&x.basis==="validated-historical-scene"&&x.exposureRef&&x.placeRef&&
    result?.[0]===x.cause&&Number.isInteger(x.year)&&Number.isInteger(x.month)&&x.month>=1&&x.month<=12&&
    date>=scene.from[0]*12+scene.from[1]&&date<=scene.through[0]*12+scene.through[1]
    ?[]:["歴史的死亡の本人・日時・原因・曝露根拠が不正"];
}
