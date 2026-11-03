/* P02/P03/P04/P18: one life's persistent, simulated education geography. */
const EDUCATION_WORLD_MODEL_VERSION = "education-world-v1";
const EDUCATION_SITE_STAGES = Object.freeze([
  "primary", "lower", "upper", "vocational", "university", "arts"
]);
const EDUCATION_REGIONAL_PRESENCE = Object.freeze({
  "炎国":[92,83,61,55,38,36],
  "龍門":[100,100,75,64,60,42],
  "ヴィクトリア":[94,87,70,65,50,43],
  "ウルサス":[91,82,60,56,37,32],
  "ラテラーノ":[99,98,90,79,70,50],
  "カジミエーシュ":[88,79,58,61,39,28],
  "クルビア":[96,90,76,76,62,51],
  "極東":[85,72,49,55,27,28],
  "イベリア":[78,60,40,44,20,23],
  "シラクーザ":[91,83,65,62,41,34],
  "サルゴン":[74,58,35,44,27,29],
  "カズデル":[28,13,5,13,2,5],
  "サーミ":[22,10,3,9,1,3],
  "リターニア":[98,96,85,80,72,83],
  "イェラグ":[72,50,27,50,13,16],
  "レム・ビリトン":[84,67,45,72,23,32],
  "ボリバル":[75,55,32,47,18,22],
  "シエスタ":[97,89,67,77,36,41],
  "ミノス":[86,72,52,50,29,30]
});
const EDUCATION_LOCALITY_PRESENCE_DELTA = Object.freeze({
  "移動都市の居住区":[4,5,7,8,9,10],
  "固定都市の街区":[0,0,0,0,0,0],
  "移動都市の周縁区":[-7,-10,-15,-13,-19,-20],
  "工業・採掘地域":[0,-8,-15,13,-17,-14],
  "移動都市の避難・労働区画":[-16,-21,-29,-24,-35,-35],
  "小規模な定住地":[-25,-33,-36,-32,-38,-39],
  "辺境・移動の多い居住地":[-46,-52,-48,-43,-45,-46]
});
const EDUCATION_ACADEMIC_DELTA = Object.freeze([8,10,17,21,27,28]);
const EDUCATION_SPECIAL_PRESENCE = Object.freeze({
  kazdel_reconstruction_core:{region:"カズデル",values:[80,63,40,45,17,28]},
  sargon_reform_core:{region:"サルゴン",values:[94,81,62,71,53,54]},
  sami_trade_settlement:{region:"サーミ",values:[64,50,24,40,13,20]},
  leithanien_academy_core:{region:"リターニア",values:[100,98,92,88,91,96]}
});
const EDUCATION_CITY_SECTORS = Object.freeze([
  {key:"central",kind:"移動都市の居住区"},
  {key:"periphery",kind:"移動都市の周縁区"},
  {key:"industrial",kind:"工業・採掘地域"},
  {key:"labor",kind:"移動都市の避難・労働区画"}
]);
function educationPresenceRates(region, localityKind, designation = null, academicCore = false) {
  const base = EDUCATION_REGIONAL_PRESENCE[region];
  const delta = EDUCATION_LOCALITY_PRESENCE_DELTA[localityKind];
  if (!base || !delta) throw new Error("未登録の教育配置地域または地区型");
  const special = designation ? EDUCATION_SPECIAL_PRESENCE[designation] : null;
  if (designation && (!special || special.region !== region))
    throw new Error("教育特例の地域または名称が一致しない");
  const amounts = EDUCATION_SITE_STAGES.map((stage, index) =>
    Math.max(0, Math.min(100, special
      ? special.values[index]
      : base[index] + delta[index] + (academicCore ? EDUCATION_ACADEMIC_DELTA[index] : 0))));
  amounts[1] = Math.min(amounts[0], amounts[1]);
  amounts[2] = Math.min(amounts[1], amounts[2]);
  return Object.fromEntries(EDUCATION_SITE_STAGES.map((stage, index) => [stage, amounts[index]]));
}
function educationHash32(value) {
  let hash = 2166136261;
  const input = String(value);
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}
function educationSeedFromLife(randomSeed) {
  if (!Number.isInteger(randomSeed) || randomSeed < 0)
    throw new Error("教育世界を初期化するための生涯Seedがない");
  return educationHash32("education-world-v1|" + (randomSeed >>> 0)) || 0x6d2b79f5;
}
function educationDraw(world, scopeId, family, role) {
  const key = ["education-world-v1",world.worldSeed,world.modelVersion,scopeId,family,role].join("|");
  return {key, value:educationHash32(key) / 4294967296};
}
function ensureEducationWorld(s) {
  if (!s || !Number.isInteger(s.randomSeed)) return null;
  s.world ||= {events:{}};
  const world = s.world.educationWorld ||= {
    modelVersion:EDUCATION_WORLD_MODEL_VERSION,
    worldSeed:educationSeedFromLife(s.randomSeed),
    areas:{},hubs:{},institutions:{},campuses:{},offerings:{},
    transportLinks:{},generationDecisions:{},residenceEducationAnchors:{}
  };
  if (world.modelVersion !== EDUCATION_WORLD_MODEL_VERSION ||
      !Number.isInteger(world.worldSeed) || !world.worldSeed)
    throw new Error("教育世界のモデル版または固定Seedが不正");
  return world;
}
function educationAreaKey(region, groupKey, sector) {
  return "edu-area:v1:" + encodeURIComponent(region) + ":" +
    encodeURIComponent(groupKey) + ":" + encodeURIComponent(sector);
}
function educationHubKey(region, groupKey) {
  return "edu-hub:v1:" + encodeURIComponent(region) + ":" + encodeURIComponent(groupKey);
}
function educationConfirmedDesignation(local, region) {
  const record = local?.educationDesignation;
  if (!record) return null;
  const entry = EDUCATION_SPECIAL_PRESENCE[record.id];
  if (!entry || entry.region !== region ||
      record.approved !== true || typeof record.sourceRef !== "string" || !record.sourceRef)
    throw new Error("教育特例には地域に一致する承認済みの根拠が必要");
  return record.id;
}
function educationAreaRegistration(world, definition) {
  const existing = world.areas[definition.id];
  if (existing) {
    if (existing.regionKey !== definition.regionKey ||
        existing.cityOrSettlementKey !== definition.cityOrSettlementKey ||
        existing.hubId !== definition.hubId)
      throw new Error("教育圏IDが別の場所に衝突");
    if (definition.designation && existing.designation !== definition.designation)
      throw new Error("学校配置確定後の特例はP05の新設履歴で扱う");
    return existing;
  }
  const area = {
    id:definition.id,regionKey:definition.regionKey,
    cityOrSettlementKey:definition.cityOrSettlementKey,
    catchmentType:definition.catchmentType,kind:definition.kind,
    educationHubId:definition.hubId,
    designation:definition.designation || null,
    academicCore:!!definition.academicCore,
    neighborIds:[],institutionIds:[],
    permanentGenerationVersion:EDUCATION_WORLD_MODEL_VERSION,
    sourceKind:"game-model"
  };
  world.areas[area.id] = area;
  return area;
}
function educationDecision(world, scopeId, family, thresholds, confirmedYear, hubId) {
  const id = family + ":" + scopeId;
  if (world.generationDecisions[id]) return world.generationDecisions[id];
  let chosen, selector = null;
  if (family === "core") {
    selector = educationDraw(world, scopeId, family, "hub-shared-selector");
    chosen = selector.value < 0.60
      ? educationDraw(world, hubId, family, "hub-uniform")
      : educationDraw(world, scopeId, family, "area-uniform");
  } else {
    selector = educationDraw(world, scopeId, family, "hub-shared-selector");
    chosen = selector.value < 0.35
      ? educationDraw(world, hubId, "specialist", "hub-uniform")
      : educationDraw(world, scopeId, family, "scope-uniform");
  }
  const present = Object.fromEntries(Object.entries(thresholds)
    .map(([stage, percent]) => [stage, chosen.value < percent / 100]));
  const decision = {
    id,scopeId,modelVersion:world.modelVersion,worldSeedRef:world.worldSeed,
    family,drawKey:chosen.key,drawValue:chosen.value,
    selectorKey:selector.key,selectorValue:selector.value,
    thresholds:{...thresholds},present,confirmedAt:confirmedYear
  };
  world.generationDecisions[id] = decision;
  return decision;
}
function educationSchoolTier(world, scopeId, stage) {
  if (stage === "primary" || stage === "lower" || stage === "upper" || stage === "preparatory") return 1;
  const u = educationDraw(world, scopeId, stage, "admission-tier").value;
  if (stage === "university") return u < 0.55 ? 1 : u < 0.90 ? 2 : 3;
  if (stage === "vocational") return u < 0.65 ? 1 : 2;
  return u < 0.88 ? 1 : 3;
}
function educationRegisterOffering(world, institution, stage, tier) {
  const campusId = institution.campusIds[0];
  const id = "edu-off:v1:" + institution.id + ":" + campusId + ":" + stage;
  if (world.offerings[id]) return world.offerings[id];
  const specializations = stage === "arts" ? ["originium_arts"] :
    stage === "vocational" ? ["practical_training"] :
    stage === "preparatory" ? ["academic_knowledge"] :
    ["general_academic", "basic_literacy"];
  const offering = {
    id,offeringId:id,institutionId:institution.id,campusId,stage,
    trackKey:stage,specializations,admissionTier:tier,
    recognitionRule:stage === "preparatory"
      ? {upperEquivalency:"assessment-required",issuerBasis:"game-model"}
      : {completionStage:stage,issuerBasis:"game-model"},
    sourceKind:"game-model"
  };
  world.offerings[id] = offering;
  institution.offeringIds.push(id);
  return offering;
}
function educationRegisterInstitution(world, areaId, key, category, stages) {
  const area = world.areas[areaId];
  const id = "edu-inst:v1:" + areaId + ":" + key;
  if (world.institutions[id]) return world.institutions[id];
  const campusId = "edu-campus:v1:" + id + ":main";
  const institution = {
    id,institutionId:id,institutionCategory:category,
    homeAreaId:areaId,campusIds:[campusId],offeringIds:[],
    sourceKind:"game-model",foundedYear:null,operationalHistory:[]
  };
  world.institutions[id] = institution;
  world.campuses[campusId] = {
    id:campusId,campusId,institutionId:id,educationAreaId:areaId,
    sourceKind:"game-model",operationalHistory:[]
  };
  area.institutionIds.push(id);
  const hub = world.hubs[area.educationHubId];
  if (hub && !hub.institutionIds.includes(id)) hub.institutionIds.push(id);
  for (const stage of stages)
    educationRegisterOffering(world,institution,stage,educationSchoolTier(world,areaId,stage));
  return institution;
}
function educationGenerateArea(world, area, confirmedYear) {
  const rates = educationPresenceRates(area.regionKey,area.kind,area.designation,area.academicCore);
  const core = educationDecision(world,area.id,"core",
    {primary:rates.primary,lower:rates.lower,upper:rates.upper},confirmedYear,area.educationHubId);
  const vocational = educationDecision(world,area.id,"vocational",
    {vocational:rates.vocational},confirmedYear,area.educationHubId);
  const stages = ["primary","lower","upper"].filter(stage => core.present[stage]);
  if (stages.length) {
    const category = stages.length > 1 ? "comprehensive_school" :
      stages[0] === "primary" ? "general_primary" :
      stages[0] === "lower" ? "general_lower" : "general_upper";
    educationRegisterInstitution(world,area.id,"general",category,stages);
  }
  if (vocational.present.vocational)
    educationRegisterInstitution(world,area.id,"vocational","technical_college",["vocational"]);
  const hosts = area.institutionIds.map(id => world.institutions[id])
    .filter(inst => inst.offeringIds.some(id =>
      ["lower","upper","vocational"].includes(world.offerings[id].stage)));
  if (hosts.length) {
    const rate = area.academicCore ? 0.45 :
      ({"移動都市の居住区":0.40,"固定都市の街区":0.35,
        "移動都市の周縁区":0.25,"工業・採掘地域":0.42,
        "移動都市の避難・労働区画":0.18,"小規模な定住地":0.15,
        "辺境・移動の多い居住地":0.08}[area.kind] || 0);
    const decision = educationDecision(world,area.id,"preparatory_host",
      {preparatory:rate * 100},confirmedYear,area.educationHubId);
    if (decision.present.preparatory) {
      const host = hosts.sort((a,b) => a.id.localeCompare(b.id))[0];
      educationRegisterOffering(world,host,"preparatory",1);
    }
  }
}
function educationGenerateHub(world, hub, confirmedYear) {
  const host = world.areas[hub.hostAreaId];
  const rates = educationPresenceRates(host.regionKey,host.kind,host.designation,host.academicCore);
  for (const stage of ["university","arts"]) {
    const decision = educationDecision(world,hub.id,stage,{[stage]:rates[stage]},confirmedYear,hub.id);
    if (!decision.present[stage]) continue;
    educationRegisterInstitution(world,host.id,stage,
      stage === "university" ? "university" : "originium_arts_academy",[stage]);
  }
}
function educationResidenceAreaInfo(s) {
  if (!s?.res?.n || !s.local || !EDUCATION_REGIONAL_PRESENCE[s.res.n]) return null;
  const city = s.local.city && s.local.city !== "エル・ソル" ? s.local.city :
    s.local.city === "エル・ソル" ? "ドッソレス" : null;
  if (city) {
    const keyByKind = {
      "移動都市の周縁区":"periphery",
      "工業・採掘地域":"industrial",
      "移動都市の避難・労働区画":"labor"
    };
    return {groupKey:"city:" + city,sector:keyByKind[s.local.kind] || "central",city:true};
  }
  const settlementKey = s.local.educationAreaAnchor || s.residenceBase?.id || s.local.placeId;
  if (typeof settlementKey !== "string" || !settlementKey) return null;
  return {groupKey:"settlement:" + settlementKey,sector:"home",city:false};
}
function ensureEducationWorldForResidence(s) {
  const info = educationResidenceAreaInfo(s);
  if (!info) return null;
  const world = ensureEducationWorld(s);
  const region = s.res.n;
  const hubId = educationHubKey(region,info.groupKey);
  const areaId = educationAreaKey(region,info.groupKey,info.sector);
  const existingHub = world.hubs[hubId];
  if (!existingHub) {
    world.hubs[hubId] = {
      id:hubId,regionKey:region,cityOrSettlementKey:info.groupKey,
      hostAreaId:info.city ? educationAreaKey(region,info.groupKey,"central") : areaId,
      areaIds:[],institutionIds:[],sourceKind:"game-model"
    };
  }
  const hub = world.hubs[hubId];
  const kindBySector = Object.fromEntries(EDUCATION_CITY_SECTORS.map(row => [row.key,row.kind]));
  const sectors = info.city ? EDUCATION_CITY_SECTORS.map(row => row.key) : ["home"];
  const designation = educationConfirmedDesignation(s.local,region);
  const academicCore = s.local.educationAcademicCore?.approved === true &&
    typeof s.local.educationAcademicCore.sourceRef === "string" &&
    !!s.local.educationAcademicCore.sourceRef;
  for (const sector of sectors) {
    const id = educationAreaKey(region,info.groupKey,sector);
    const area = educationAreaRegistration(world,{
      id,regionKey:region,cityOrSettlementKey:info.groupKey,hubId,
      kind:info.city ? kindBySector[sector] : s.local.kind,
      catchmentType:sector,
      designation:sector === info.sector ? designation : null,
      academicCore:sector === info.sector && academicCore
    });
    if (!hub.areaIds.includes(area.id)) hub.areaIds.push(area.id);
  }
  if (hub.areaIds.length > 4) throw new Error("教育拠点内の生活圏が上限を超過");
  for (const id of hub.areaIds)
    world.areas[id].neighborIds = hub.areaIds.filter(other => other !== id);
  for (const id of hub.areaIds)
    educationGenerateArea(world,world.areas[id],s.year);
  educationGenerateHub(world,hub,s.year);
  const residenceKey = (s.local.placeId || "") + "|" + (s.local.districtId || "");
  if (residenceKey !== "|") world.residenceEducationAnchors[residenceKey] = areaId;
  s.local.educationAreaId = areaId;
  return areaId;
}
function educationAreaForResidence(s) {
  return ensureEducationWorldForResidence(s);
}
function educationNeighborAreaIds(s, areaId) {
  return [...(s?.world?.educationWorld?.areas?.[areaId]?.neighborIds || [])];
}
function institutionOfferings(s, areaId, stage) {
  const world = s?.world?.educationWorld, area = world?.areas?.[areaId];
  if (!area) return [];
  const ids = new Set(area.institutionIds);
  for (const id of world.hubs[area.educationHubId]?.institutionIds || [])
    if (["university","arts"].some(type => world.institutions[id]?.offeringIds.some(
      offeringId => world.offerings[offeringId]?.stage === type)))
      ids.add(id);
  return [...ids].flatMap(id => world.institutions[id]?.offeringIds || [])
    .map(id => world.offerings[id])
    .filter(row => row && (!stage || row.stage === stage));
}
