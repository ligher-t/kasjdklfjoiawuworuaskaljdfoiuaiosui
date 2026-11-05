// Appointment sites are a world catalogue, not a consequence of the player's J.
// Exact named places follow existing event/source anchors. An unnamed military
// unit/office is an explicit game-model archetype, not a nationwide branch.
const EMPLOYMENT_APPOINTMENT_SITES = Object.freeze([
  ["rhodes-staff","rhodes-island",[28,29,30,31,33,34],null,null,1095,"mobile","ロドスの採用窓口"],
  ["bsw-contract","blacksteel-worldwide",[35,36,37],"クルビア",null,1090,"mobile","BSW本艦の採用窓口"],
  ["rhine-lab","rhine-lab",[38,39,40],"クルビア","トリマウンツ",1093,"campus","ライン生命研究所"],
  ["kazimierz-arena-staff","kazimierz-arena",[32],"カジミエーシュ",null,1090,"archetype","競技場の運営事務所"],
  ["yan-court-bureaucracy","yan-civil-service",[41],"炎国",null,1090,"archetype","朝廷の登用先官署"],
  ["yan-tianshi-academy","yan-tianshi-office",[43],"炎国",null,1090,"archetype","天師の配属先官署"],
  ["lungmen-guard-bureau","lungmen-guard-department",[44],"龍門","龍門",1092,"institution","龍門近衛局"],
  ["higashi-samurai-household","higashi-household-retainers",[46],"極東",null,1090,"archetype","家臣を募る武家"],
  ["higashi-ninja-clan","higashi-household-retainers",[47],"極東",null,1090,"archetype","隠密の配属先"],
  ["higashi-shinto-temple","higashi-religious-institution",[49],"極東",null,1090,"archetype","受入先の寺社"],
  ["ursus-imperial-officer","ursus-imperial-forces",[51],"ウルサス",null,1090,"archetype","将校の配属先部隊"],
  ["ursus-border-mine-guard","ursus-imperial-forces",[52],"ウルサス",null,1090,"archetype","国境警備の配属先部隊"],
  ["victoria-regular-infantry","victoria-military-authorities",[54],"ヴィクトリア",null,1090,"archetype","歩兵の配属先部隊"],
  ["victoria-royal-officer","victoria-military-authorities",[55],"ヴィクトリア",null,1092,"archetype","将校の配属先公爵軍"],
  ["victoria-exiled-ducal-command","victoria-military-authorities",[55],"ヴィクトリア",null,1094,"scenario","亡命公爵軍の指揮所"],
  ["victoria-parliament-scribe","victoria-legislative-administration",[56],"ヴィクトリア","ロンディニウム",1090,"institution","議会の書記官署"],
  ["victoria-locomotive-works","victoria-rail-works",[57],"ヴィクトリア",null,1090,"archetype","配属先の鉄道工廠"],
  ["leithania-court-musician","leithanien-court",[59],"リターニア",null,1090,"archetype","後援者の宮廷"],
  ["laterano-notarial-executor","laterano-notarial-hall",[60],"ラテラーノ",null,1092,"institution","公証人役場"],
  ["columbia-frontier-contract-crew","columbia-frontier-program",[62],"クルビア",null,1090,"archetype","企業開拓地の作業所"],
  ["kazimierz-competition-knight","kazimierz-corporate-knight-club",[63],"カジミエーシュ",null,1090,"archetype","スポンサー契約先"],
  ["siracusa-court-police","siracusa-volsinii-court",[66],"シラクーザ","ウォルシーニ",1092,"institution","ウォルシーニの裁判所"],
  ["siesta-observatory-research","siesta-volcanology-center",[67],"シエスタ",null,1090,"institution","火山観測所"],
  ["sargon-padishah-guard","sargon-padishah-palace",[68],"サルゴン",null,1090,"archetype","配属先の宮廷"],
  ["kjerag-karlan-commercial","karlan-trade",[72],"イェラグ",null,1092,"headquarters","カランド貿易の事業所"],
  ["kjerag-vine-court-monk","kjerag-monastery",[73],"イェラグ",null,1090,"institution","曼珠院"],
  ["kazdel-military-commission","kazdel-military-commission",[74],"カズデル",null,1092,"archetype","軍事委員会の配属先部隊"],
  ["iberia-inquisition-officer","iberian-inquisition-and-coastal-sites",[76],"イベリア",null,1092,"archetype","裁判所の配属先"],
  ["iberia-lantern-tuner","iberian-inquisition-and-coastal-sites",[77],"イベリア",null,1090,"archetype","沿岸の担当灯台"],
  ["bolivar-coalition-soldier","bolivar-faction-military",[78],"ボリバル",null,1090,"archetype","配属先の軍部隊"],
  ["bolivar-dossoles-police","dossoles-police",[79],"ボリバル","ドッソレス",1092,"institution","ドッソレス市警"],
  ["rim-mining-lead-engineer","rim-billiton-mining-conglomerates",[80],"レム・ビリトン",null,1090,"archetype","配属先の鉱区事業所"],
  ["minos-temple-champion","minos-hero-temple-arena",[81],"ミノス",null,1090,"archetype","担当する神殿競技場"],
  ["minos-agora-orator","minos-civic-court",[82],"ミノス",null,1090,"archetype","市民集会の法廷"]
].map(([affiliationId,organizationKey,jobs,region,city,fromYear,kind,label]) =>
  Object.freeze({affiliationId,organizationKey,jobs,region,city,fromYear,kind,label})));

const APPOINTMENT_JOB_SECTORS = Object.freeze({
  32:"REC",41:"CIV",43:"CIV",44:"CIV",46:"MIL",47:"MIL",49:"REL",51:"MIL",52:"MIL",
  54:"MIL",55:"MIL",56:"CIV",57:"MFG",59:"CRE",60:"CIV",62:"AGR",63:"REC",66:"CIV",
  67:"SCI",68:"MIL",73:"REL",74:"MIL",76:"CIV",77:"SCI",78:"MIL",79:"CIV",80:"MIN",81:"REC",82:"CIV"
});
function appointmentIsLocalArchetype(spec) { return spec.kind==="archetype" || spec.kind==="scenario"; }
function appointmentWorldSiteId(spec,s) {
  return "appointment-site:"+spec.affiliationId+
    (appointmentIsLocalArchetype(spec)?":"+occupationWorkAreaKey(s):"");
}
function appointmentPositionId(spec,jobId,s) { return appointmentWorldSiteId(spec,s)+":j"+jobId; }

// This is deliberately not called from any eligibility query or chosen effect.
function ensureAppointmentWorld(s) {
  const work=s.world?.occupationWorld;
  if(!work)return;
  for(const spec of EMPLOYMENT_APPOINTMENT_SITES) {
    const mode=EMPLOYER_PLAYER_ACCESS_MODES[spec.organizationKey];
    if(!["GENERAL","SPECIAL"].includes(mode))continue;
    const localArchetype=appointmentIsLocalArchetype(spec),area=occupationAreaSnapshot(s),
      sector=APPOINTMENT_JOB_SECTORS[spec.jobs[0]];
    if(localArchetype && (!area || spec.region!==s.res?.n || !area.sectorPresence[sector]))continue;
    const siteId=appointmentWorldSiteId(spec,s),employerId="organization-employer:"+spec.organizationKey+
      (localArchetype?":"+area.areaId:"");
    work.employers[employerId] ||= {employerId,organizationKey:spec.organizationKey,
      kind:spec.kind==="archetype"?"institution-archetype":"named-organization",
      basis:localArchetype?"game-model":"existing-event-source"};
    const site=work.sites[siteId] ||= {siteId,employerId,areaId:localArchetype?area.areaId:"appointment-area:"+spec.affiliationId,
      region:spec.region,city:localArchetype?s.local?.city||null:spec.city,kind:spec.kind,label:spec.label,
      locationPrecision:spec.city?"city":spec.kind==="mobile"?"mobile-platform":"region-and-appointment",
      status:s.year<spec.fromYear?"planned":"open",createdYear:spec.fromYear,
      operationFrom:{year:spec.fromYear,month:1},positionIds:[],history:[],
      affiliationId:spec.affiliationId,
      availabilityBasis:spec.affiliationId==="rhodes-staff"?"source-supported-first-full-year":"event-minimum-year-game-window",
      basis:localArchetype?"game-model":"existing-event-source"};
    for(const jobId of spec.jobs) {
      const positionId=appointmentPositionId(spec,jobId,s),
        capacity=2+Math.floor(keyedRoll("appointment-capacity:"+positionId)*7),
        // Slots model the institution, not the total canonical headcount.
        occupied=Math.floor(keyedRoll("appointment-background:"+positionId)*capacity);
      if(!site.positionIds.includes(positionId))site.positionIds.push(positionId);
      work.positions[positionId] ||= {positionId,siteId,jobId,capacity,
        aggregateOccupiedSlots:occupied,identifiedOccupiedSlots:0,reservedSlots:0,
        vacancyCount:capacity-occupied,openingIds:[],affiliationId:spec.affiliationId,
        basis:"appointment-capacity-game-model"};
    }
  }
  work.appointmentSchemaVersion=1;
  advanceAppointmentWorld(s,s.year,s.mo||1);
}

function occupationMonthIndex(year,month=1) { return year*12+month-1; }
function occupationSiteOperationalAt(site,year,month=1) {
  const at=occupationMonthIndex(year,month),from=site?.operationFrom,to=site?.operationTo;
  return !!site && (!from||at>=occupationMonthIndex(from.year,from.month)) &&
    (!to||at<occupationMonthIndex(to.year,to.month)) &&
    !["closed","suspended","planned"].includes(site.status);
}
function advanceOccupationSiteOperations(s,site,year,month=1) {
  if(!site || site.status==="closed")return;
  const at=occupationMonthIndex(year,month),from=site.operationFrom,to=site.operationTo;
  let next=from&&at<occupationMonthIndex(from.year,from.month)?"planned":
    to&&at>=occupationMonthIndex(to.year,to.month)?"closed":site.status==="planned"?"open":site.status;
  // These are local game-model damage decisions, never a claim that every
  // company in the country closed. Named institutions need individual evidence.
  if(site.basis==="game-model" && site.kind!=="archetype") {
    const crisis=site.city==="チェルノボーグ" && at>=occupationMonthIndex(1096,12)?"chernobog_incident":
      site.city==="ロンディニウム"&&at>=occupationMonthIndex(1098,7)?"londinium_war":null;
    if(crisis && keyedRoll("occupation-site-damage:"+site.siteId+":"+crisis)<0.30) {
      next="closed";site.operationTo ||= crisis==="chernobog_incident"?{year:1096,month:12}:{year:1098,month:7};
    }
  }
  if(next!==site.status) {
    site.history ||= [];
    site.history.push({year,month,from:site.status,to:next,basis:"dated-site-operations"});
    site.status=next;
  }
}
function advanceAppointmentWorld(s,year,month=1) {
  const work=s.world?.occupationWorld;if(!work)return;
  for(const spec of EMPLOYMENT_APPOINTMENT_SITES) {
    const site=work.sites[appointmentWorldSiteId(spec,s)];if(!site)continue;
    advanceOccupationSiteOperations(s,site,year,month);
    for(const positionId of site.positionIds) {
      const p=work.positions[positionId];
      p.vacancyCount=Math.max(0,p.capacity-p.aggregateOccupiedSlots-p.identifiedOccupiedSlots-p.reservedSlots);
      const openingId="appointment-opening:"+positionId+":"+year;
      if(p.openingYear===year)continue;
      for(const priorId of p.openingIds) {
        const prior=work.openings[priorId];
        if(prior?.status==="open"){prior.status="expired";prior.validToYear=year-1;}
      }
      p.openingIds=[];p.openingYear=year;
      if(!occupationSiteOperationalAt(site,year,month)||!p.vacancyCount)continue;
      work.openings[openingId]={openingId,positionId,siteId:site.siteId,employerId:site.employerId,
        areaId:site.areaId,kind:"individual-appointment",affiliationId:spec.affiliationId,
        validFromYear:Math.max(year,spec.fromYear),status:"open",slots:p.vacancyCount,
        visibleToPlayer:false,basis:"appointment-capacity-game-model"};
      p.openingIds.push(openingId);
    }
  }
}

function appointmentEffectMatches(effect,jobId,affiliationId) {
  if (affiliationId === "bsw-contract" && effect?.employmentAction?.kind === "promotion-offer" &&
      effect.employmentAction.incident === "accepted" && effect.employmentAction.jobId === jobId) return true;
  return effect?.job===jobId && [effect.lifeAffiliation,...(effect.lifeAffiliations||[])]
    .some(a=>a?.id===affiliationId && ["join","return","role","continue"].includes(a.action||"join"));
}
function appointmentSourceAllowed(sourceEventId,jobId,affiliationId) {
  const event=EV.find(e=>e.id===sourceEventId);
  return !!event && [event.fx,...(event.c||[]).flatMap(c=>(c.o||[]).map(o=>o[2]))]
    .some(effect=>appointmentEffectMatches(effect,jobId,affiliationId));
}

/** Read-only exact-source authorization; root's lifecycle owns consumption. */
function assessEmploymentAppointment(s,input={}) {
  const jobId=input.jobId,key=EMPLOYER_JOB_ORGANIZATIONS[jobId],mode=EMPLOYER_PLAYER_ACCESS_MODES[key];
  const reject=reasonCode=>({canApply:false,canStart:false,reasonCode});
  if(["BLOCKED","CONTACT","HISTORICAL","SOURCE_HOLD","COMMUNITY"].includes(mode))
    return reject(mode==="CONTACT"?"non-employment-network":"non-recruiting-organization");
  const spec=EMPLOYMENT_APPOINTMENT_SITES.find(row=>row.jobs.includes(jobId) &&
    (!input.affiliationId||row.affiliationId===input.affiliationId));
  if(!spec || !appointmentSourceAllowed(input.sourceEventId,jobId,spec.affiliationId))
    return reject("appointment-authority-unverified");
  if(s.dead||s.age<16||s.fl?.detained||s.fl?.segregated||s.year<spec.fromYear)
    return reject("unable-to-start");
  // A documented appointment may identify a separate work location without
  // inventing a permanent branch at the applicant's current residence.
  const city=s.local?.city==="エル・ソル"?"ドッソレス":s.local?.city;
  if(spec.region && s.res?.n!==spec.region)return reject("appointment-region-mismatch");
  if(spec.city && city!==spec.city && !(spec.city==="ウォルシーニ"&&city==="ヌオバ・ウォルシーニ"))
    return reject("appointment-city-mismatch");
  const work=s.world?.occupationWorld,site=work?.sites?.[appointmentWorldSiteId(spec,s)],
    position=work?.positions?.[appointmentPositionId(spec,jobId,s)],
    opening=(position?.openingIds||[]).map(id=>work.openings[id]).find(o=>o.status==="open"&&o.slots>0);
  if(!occupationSiteOperationalAt(site,s.year,s.mo||1)||!position||!opening||position.vacancyCount<1)
    return reject("no-appointment-opening");
  const current=currentPlayerEmployment(s),
    physicalScene=EMPLOYMENT_PHYSICAL_INTERVIEWS[input.sourceEventId]===spec.affiliationId,
    reached=current?.siteId===site.siteId || (spec.organizationKey==="rhodes-island" &&
      s.residenceBase?.id==="rhodes-landship") || s.appointmentEncounters?.some(row=>
      row.siteId===site.siteId && row.sourceEventId===input.sourceEventId && row.year===s.year && row.month===(s.mo||1)),
    needsEncounter=["headquarters","mobile"].includes(spec.kind) && !spec.city;
  if(needsEncounter && !reached && !physicalScene) return reject("appointment-site-not-reached");
  const request={jobId,organizationKey:spec.organizationKey,siteId:site.siteId,positionId:position.positionId,
    openingId:opening.openingId,knownToPerson:true,specialPath:true,selected:true,accepted:true,started:true,
    sourceEventId:input.sourceEventId,affiliationId:spec.affiliationId};
  const gate=assessPlayerEmploymentAccess(s,request);
  return {...gate,canStart:gate.canStart && (!needsEncounter || !!reached),
    reasonCode:needsEncounter && !reached ? "appointment-visit-required" : gate.reasonCode,
    request,opening,site,position,affiliationId:spec.affiliationId};
}
function appointmentEmploymentRequest(s,input) { return assessEmploymentAppointment(s,input); }

const EMPLOYMENT_PHYSICAL_INTERVIEWS = Object.freeze({
  sr_bsw_recruitment_assessment:"bsw-contract",
  choice_columbia_06:"bsw-contract",
  car_kje_karlan_entry:"kjerag-karlan-commercial",
  sr_rhodes_hiring_review:"rhodes-staff"
});
function hasEmploymentPhysicalInterview(eventId) { return Object.hasOwn(EMPLOYMENT_PHYSICAL_INTERVIEWS, eventId); }
/** Only actual presentation of the physical scene establishes arrival. */
function recordEmploymentAppointmentEncounter(s,eventId) {
  const id=EMPLOYMENT_PHYSICAL_INTERVIEWS[eventId];
  if(!id || s.dead)return null;
  const spec=EMPLOYMENT_APPOINTMENT_SITES.find(row=>row.affiliationId===id);
  if(!spec || (spec.region&&spec.region!==s.res?.n))return null;
  const site=s.world?.occupationWorld?.sites?.[appointmentWorldSiteId(spec,s)];
  if(!occupationSiteOperationalAt(site,s.year,s.mo||1))return null;
  s.appointmentEncounters ||= [];
  const prior=s.appointmentEncounters.find(row=>row.siteId===site.siteId&&row.sourceEventId===eventId&&
    row.year===s.year&&row.month===(s.mo||1));
  if(prior)return prior;
  const row={siteId:site.siteId,sourceEventId:eventId,year:s.year,month:s.mo||1,
    status:"arrived",basis:"presented-physical-interview",region:s.res.n,
    residenceUnchanged:true};
  s.appointmentEncounters.push(row);
  // The visit identifies this platform/office. It does not place another
  // headquarters in the visitor's home city or alter their residence.
  return row;
}
