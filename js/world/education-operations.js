/* P05/P14: school operations have their own dated, school-specific history. */
const EDUCATION_OPERATION_WINDOWS = Object.freeze([
  {id:"great_silence",region:"イベリア",from:[1038,7],scope:"evidence-only",kind:"localized",eventRef:"great_silence"},
  {id:"bolivar_civil_war",region:"ボリバル",from:[1048,1],to:[1052,12],scope:"conflict-evidence",kind:"localized",eventRef:"bolivar_civil_war"},
  {id:"kazdel_civil_war",region:"カズデル",from:[1086,1],to:[1094,12],scope:"conflict-evidence",kind:"localized",eventRef:"kazdel_civil_war"},
  {id:"kazdel_war_local_pressure",region:"カズデル",from:[1092,1],to:[1094,12],scope:"weakened-locality",kind:"indirect",eventRef:"kazdel-war"},
  {id:"londinium_occupation",region:"ヴィクトリア",city:"ロンディニウム",from:[1094,8],to:[1098,10],scope:"context",kind:"none",eventRef:"thelazia_dead"},
  {id:"chernobog_direct",region:"ウルサス",city:"チェルノボーグ",from:[1096,12],to:[1097,1],scope:"named-city",kind:"direct",eventRef:"chernobog-direct"},
  {id:"chernobog_indirect",region:"ウルサス",excludeCity:"チェルノボーグ",from:[1096,12],to:[1097,1],scope:"regional-logistics",kind:"indirect",eventRef:"chernobog-indirect"},
  {id:"lungmen_indirect",region:"龍門",from:[1096,12],to:[1097,1],scope:"regional-logistics",kind:"indirect",eventRef:"lungmen-indirect"},
  {id:"siesta_volcanic_activity",region:"シエスタ",city:"シエスタ",from:[1097,7],to:[1097,12],scope:"volcanic-exposure-evidence",kind:"localized",eventRef:"siesta_disaster"},
  {id:"siesta_mobile_platform",region:"シエスタ",city:"シエスタ",from:[1097,8],scope:"context",kind:"none",eventRef:"siesta_disaster"},
  {id:"siesta_resettlement_load",region:"シエスタ",from:[1098,1],to:[1098,12],scope:"weakened-locality",kind:"indirect",eventRef:"siesta-transition"},
  {id:"londinium_direct",region:"ヴィクトリア",city:"ロンディニウム",from:[1098,7],to:[1098,9],scope:"named-city",kind:"direct",eventRef:"londinium-direct"},
  {id:"victoria_indirect",region:"ヴィクトリア",excludeCity:"ロンディニウム",from:[1098,7],to:[1098,9],scope:"regional-logistics",kind:"indirect",eventRef:"victoria-indirect"},
  {id:"londinium_recovery_background",region:"ヴィクトリア",city:"ロンディニウム",from:[1098,10],to:[1100,12],scope:"context",kind:"none",eventRef:"londinium-direct"}
]);
const EDUCATION_OPERATION_ODDS = Object.freeze({
  direct:[["normal",0.10],["limited",0.30],["suspended",0.50],["destroyed",0.10]],
  indirect:[["normal",0.69],["limited",0.25],["suspended",0.06],["destroyed",0]],
  localized:[["normal",0.35],["limited",0.40],["suspended",0.25],["destroyed",0]]
});
function educationDateIndex(year,month) {
  return Number.isInteger(year) && Number.isInteger(month) && month>=0 && month<=12
    ? year*13+month : null;
}
function educationDateAtLeast(year,month,date) {
  return educationDateIndex(year,month)>=educationDateIndex(date[0],date[1]);
}
function educationCampusInWindow(world,campus,window) {
  const area=world.areas[campus.educationAreaId];
  if (!area || area.regionKey!==window.region) return false;
  if (window.city && area.cityOrSettlementKey!=="city:"+window.city) return false;
  if (window.excludeCity && area.cityOrSettlementKey==="city:"+window.excludeCity) return false;
  if (window.scope==="evidence-only")
    return !!campus.exposureTags?.includes("iberia-coastal-silence-affected");
  if (window.scope==="conflict-evidence")
    return !!campus.exposureTags?.includes(window.id+":confirmed-exposure");
  if (window.scope==="volcanic-exposure-evidence")
    return !!campus.exposureTags?.includes("siesta-volcanic-affected");
  if (window.scope==="weakened-locality")
    return ["辺境・移動の多い居住地","移動都市の避難・労働区画",
      "工業・採掘地域"].includes(area.kind);
  return true;
}
function educationCampusRecordedBefore(world,campus,window) {
  const institution=world.institutions[campus.institutionId],
    area=world.areas[campus.educationAreaId],
    first=Number.isInteger(campus.firstObservedYear) ? campus.firstObservedYear :
      Number.isInteger(institution?.firstObservedYear) ? institution.firstObservedYear :
        world.generationDecisions["core:"+area?.id]?.confirmedAt;
  // An institution first discovered after an event is not assigned retroactive damage.
  return Number.isInteger(first) && first<=window.from[0];
}
function educationOutcomeForWindow(world,campus,window) {
  const draw=educationDraw(world,campus.id,"operations-v1",window.id).value;
  let remaining=draw, outcome="normal";
  for(const [status,p] of EDUCATION_OPERATION_ODDS[window.kind] || []) {
    remaining-=p;
    if (remaining<0) {outcome=status;break;}
  }
  return {draw,outcome};
}
function educationRecoveryAt(world,campus,window,outcome) {
  if(outcome==="normal" || outcome==="destroyed" || !window.to) return null;
  const u=educationDraw(world,campus.id,"operations-recovery-v1",window.id).value;
  const years=outcome==="limited" ? (u<0.65?1:2) : u<0.33?2:u<0.77?3:4;
  return {year:window.to[0]+years,month:window.to[1]};
}
function educationWindowEffect(world,campus,window) {
  if (window.kind==="none" || !educationCampusInWindow(world,campus,window) ||
      !educationCampusRecordedBefore(world,campus,window)) return null;
  const sample=educationOutcomeForWindow(world,campus,window);
  const recovery=educationRecoveryAt(world,campus,window,sample.outcome);
  const effectId="edu-shock:v1:"+campus.id+":"+window.id+":"+window.from.join("-");
  return {
    effectId,institutionId:campus.institutionId,campusId:campus.id,
    effectiveFrom:{year:window.from[0],month:window.from[1]},
    effectiveTo:window.to?{year:window.to[0],month:window.to[1]}:null,
    recoveryAt:recovery,kind:sample.outcome,
    previous:{institution:"operating",campus:"usable",offering:"teaching",admission:"open"},
    next:educationEffectStatus(sample.outcome),
    eventRef:window.eventRef,scope:window.scope,basis:"simulation-school-impact",
    sourceRefs:[window.eventRef],sample:sample.draw,
    evidenceNote:"歴史の時刻・地域と、校地ごとの架空被害抽選を分離"
  };
}
function educationEffectStatus(outcome) {
  return {
    normal:{campus:"usable",offering:"teaching",admission:"open"},
    limited:{campus:"limited",offering:"limited",admission:"limited"},
    suspended:{campus:"inaccessible",offering:"suspended",admission:"suspended"},
    destroyed:{campus:"destroyed",offering:"suspended",admission:"suspended"}
  }[outcome];
}
function educationSchoolEffectsAt(world,campus,year,month) {
  const now=educationDateIndex(year,month);
  if (now===null) return [];
  const modeled=EDUCATION_OPERATION_WINDOWS
    .filter(w=>educationDateAtLeast(year,month,w.from))
    .map(w=>educationWindowEffect(world,campus,w))
    .filter(Boolean);
  const explicit=(world.operationalHistory||[]).filter(x =>
    x.campusId===campus.id &&
    ["explicit-canon-school-action","explicit-simulation-site-action"].includes(x.basis));
  return [...modeled,...explicit].filter(x=>{
    const from=educationDateIndex(x.effectiveFrom?.year,x.effectiveFrom?.month);
    const recovery=x.recoveryAt && educationDateIndex(x.recoveryAt.year,x.recoveryAt.month);
    return from!==null && from<=now && (recovery===null||recovery===undefined||now<recovery);
  }).sort((a,b)=>{
    const p=x=>x.basis==="explicit-canon-school-action"?0:
      x.basis==="explicit-simulation-site-action"?1:x.kind==="destroyed"?2:
      x.kind==="suspended"?3:x.kind==="limited"?4:5;
    return p(a)-p(b)||String(a.effectId).localeCompare(String(b.effectId));
  });
}
function educationSchoolStatusAt(s,offeringId,year=s?.year,month=s?.mo??0) {
  const world=s?.world?.educationWorld,
    offering=world?.offerings?.[offeringId];
  if(!offering) return null;
  const campus=world.campuses[offering.campusId],
    institution=world.institutions[offering.institutionId];
  if(!campus||!institution) return null;
  let institutionStatus=institution.status||"operating",
    campusStatus=campus.physicalStatus||"usable",
    teachingStatus=offering.teachingStatus||"teaching",
    admissionStatus=offering.admissionStatus||"open",
    activeEffectIds=[],basis="game-model-baseline";
  const active=educationSchoolEffectsAt(world,campus,year,month);
  // Explicit records override transient model results for their stated target only.
  const explicit=active.filter(x=>x.basis?.startsWith("explicit-"));
  const modeled=active.filter(x=>!x.basis?.startsWith("explicit-"));
  for(const x of modeled){
    activeEffectIds.push(x.effectId);
    const next=x.next||educationEffectStatus(x.kind);
    if(x.kind==="destroyed")campusStatus="destroyed";
    else if(x.kind==="suspended" && campusStatus!=="destroyed")campusStatus="inaccessible";
    else if(x.kind==="limited" && campusStatus==="usable")campusStatus="limited";
    if(x.kind==="destroyed" || x.kind==="suspended") {
      teachingStatus="suspended";admissionStatus="suspended";
    }else if(x.kind==="limited" && teachingStatus==="teaching") {
      teachingStatus="limited";if(admissionStatus==="open")admissionStatus="limited";
    }
    basis="simulation-school-impact";
  }
  for(const x of explicit.slice().reverse()){
    activeEffectIds.push(x.effectId);
    if(x.next?.institution) institutionStatus=x.next.institution;
    if(x.next?.campus) campusStatus=x.next.campus;
    if(x.next?.offering && (!x.offeringId||x.offeringId===offeringId))
      teachingStatus=x.next.offering;
    if(x.next?.admission && (!x.offeringId||x.offeringId===offeringId))
      admissionStatus=x.next.admission;
    basis=x.basis;
  }
  if(institutionStatus!=="operating" || campusStatus==="destroyed" ||
    campusStatus==="inaccessible") {
    teachingStatus="suspended";admissionStatus="suspended";
  }
  if(teachingStatus==="discontinued")admissionStatus="closed";
  return {
    institutionId:institution.id,campusId:campus.id,offeringId,
    institutionStatus,campusStatus,teachingStatus,admissionStatus,
    teachingEquivalent:teachingStatus==="teaching"?1:teachingStatus==="limited"?0.5:0,
    effectiveAt:{year,month},activeEffectIds,basis
  };
}
function educationReconcileWorldAt(s,year=s?.year,month=s?.mo??0) {
  const world=s?.world?.educationWorld;
  if(!world || educationDateIndex(year,month)===null) return 0;
  world.operationalHistory ||= [];
  world.appliedEffectIds ||= [];
  const known=new Set(world.appliedEffectIds);
  let added=0;
  for(const campus of Object.values(world.campuses)){
    for(const window of EDUCATION_OPERATION_WINDOWS){
      if(!educationDateAtLeast(year,month,window.from)) continue;
      const record=educationWindowEffect(world,campus,window);
      if(!record || known.has(record.effectId)) continue;
      world.operationalHistory.push(record);
      world.appliedEffectIds.push(record.effectId);
      known.add(record.effectId);
      added++;
    }
  }
  if(added) world.operationalHistory.sort((a,b)=>
    educationDateIndex(a.effectiveFrom.year,a.effectiveFrom.month)-
    educationDateIndex(b.effectiveFrom.year,b.effectiveFrom.month)||
    a.effectId.localeCompare(b.effectId));
  return added;
}
function educationRecordSchoolAction(s,action) {
  const world=s?.world?.educationWorld,now=educationDateIndex(s?.year,s?.mo??0);
  if(!world || !action || !["explicit-canon-school-action","explicit-simulation-site-action"].includes(action.basis) ||
     !action.approved || !action.sourceRef || typeof action.sourceRef!=="string" ||
     !world.campuses[action.campusId] || action.institutionId!==world.campuses[action.campusId].institutionId ||
     (action.offeringId && world.offerings[action.offeringId]?.campusId!==action.campusId))
    throw new Error("証拠と対象校地を持つ正式な学校運営記録が必要");
  const from=action.effectiveFrom;
  if(!from || educationDateIndex(from.year,from.month)===null ||
      educationDateIndex(from.year,from.month)>now || !action.effectId ||
      !action.next || typeof action.next!=="object")
    throw new Error("過去から現在までに有効な学校運営処理のみ記録可能");
  for(const [field,value] of Object.entries(action.next)){
    const valid={
      institution:["operating","administratively_suspended","dissolved"],
      campus:["usable","limited","inaccessible","destroyed","relocated"],
      offering:["teaching","limited","suspended","discontinued"],
      admission:["open","limited","suspended","closed","full"]
    }[field];
    if(!valid?.includes(value))throw new Error("学校運営状態の更新内容が不正");
  }
  world.operationalHistory ||= [];
  const prior=world.operationalHistory.find(row=>row.effectId===action.effectId);
  if(prior) {
    if(JSON.stringify(prior)!==JSON.stringify(action))throw new Error("学校運営処理IDが衝突");
    return prior;
  }
  const record=JSON.parse(JSON.stringify(action));
  world.operationalHistory.push(record);
  world.appliedEffectIds ||= [];
  if(!world.appliedEffectIds.includes(record.effectId))world.appliedEffectIds.push(record.effectId);
  return record;
}
