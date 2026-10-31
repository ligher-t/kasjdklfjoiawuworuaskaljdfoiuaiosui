/* ===== ENGINE ===== */
const D_ = window.GAME_DATA;
const {
  FACILITY_MODEL,
  LOCALITY_MODEL,
  REG,
  RX,
  RACE,
  RACE_AFF,
  WEALTH,
  TR,
  J,
  EV,
  HIST,
  WORLD_PRESSURES,
  MIGRATION_ROUTES,
  STG_NAMES,
  EL_NAMES,
  FC_NAMES,
  RM_NAMES,
  EXP_VALUES,
  START_YEAR,
  BIRTH_YEAR_MIN,
  BIRTH_YEAR_MAX,
  DATA_GUIDE,
  SIM_PARAMS,
  SIM_TABLES,
  REGIONAL_LIFE_PROFILES,
  REGIONAL_EMPLOYMENT_PROFILES,
  REGIONAL_SERVICE_PROFILES,
  REGIONAL_ENTITY_CONTEXT,
  REGIONAL_HISTORICAL_LOCALITIES,
  REGIONAL_RESIDENCE_PROFILES,
  DATASET_META,
  EVENT_FIELD_META,
  EVENT_EFFECT_TYPES,
  FLAG_REGISTRY,
  SETTING_SOURCES,
  eventFlagValues,
  eventFlagRefs
} = D_;
const PARAM = Object.fromEntries(SIM_PARAMS.map(x => [x.id, x.value])),
  P = id => {
    if (!Object.prototype.hasOwnProperty.call(PARAM, id))
      throw new Error(`未定義のシミュレーション値: ${id}`);
    return PARAM[id];
  };
const petCostBase = pet => {
  if (!pet) return 0;
  if (pet.includes("サルゴンの砂獣")) return P("economy.petSandbeastAnnualCost");
  if (pet.includes("鼷獣")) return P("economy.petXishouAnnualCost");
  if (pet.includes("雲獣")) return P("economy.petCloudbeastAnnualCost");
  if (pet.includes("オリジムシ")) return P("economy.petOripathySlugAnnualCost");
  return P("economy.petAnnualCost");
};
const hobbyCount = s =>
  ["hobby_music", "hobby_craft", "hobby_garden", "hobby_sport", "hobby_collect", "hobby_story"].filter(
    k => s.fl?.[k]
  ).length;
const restricted = s => !!(s.fl?.detained || s.fl?.segregated);
const isStudent = s =>
  !s.job &&
  Boolean(
    (typeof educationLive === "function" && educationLive(s)) ||
    s.fl?.sch ||
    s.fl?.uni_enrolled ||
    s.fl?.voc_enrolled ||
    s.fl?.arts_enrolled ||
    (s.educationPath && s.educationPath.status === "enrolled")
  );
const occupationLabel = s =>
  s.fl?.detained
    ? "収容中（仕事を中断）"
    : s.fl?.segregated
      ? s.fl.seg_work
        ? "隔離区画内の仕事"
        : "隔離中（外の仕事を中断）"
      : s.fl?.retired
        ? "退職後"
        : isStudent(s)
          ? "学生"
          : (J[s.job]?.n || "無職");
const clearLocalContacts = s => {
  s.fl ||= {};
  ["neighbor_contact", "neighbor_welcome", "neighbor_familiar"].forEach(k => (s.fl[k] = 0));
  s.fl.infection_community_rumor_current_area=0;
  s.fl.infection_housing_rumor_current_home=0;
  if (s.neighborContact && s.neighborContact.lifeStatus !== "dead" && !["moved","deceased","以前の近所の人"].includes(s.neighborContact.status)) {
    s.neighborContact.status = "以前の近所の人";
    s.neighborContact.outOfAreaSinceYear = s.year;
    s.neighborContact.endedYear ??= s.year;
    s.neighborContact.ending = "あなたが生活圏を離れ、近所で顔を合わせる関係を終えた";
  }
};
const START = P("clock.startYear"),
  // UI playback indices 0–5 remain available in every build (0,1,2,5,10,20).
  // Index 6 (50x) is reserved for the explicitly enabled debug session.
  SPD = [0, 1, 2, 5, 10, 20, 50],
  DEBUG_PLAYBACK = /(?:^|[?&])debug=1(?:&|$)/.test(window.location?.search || ""),
  YMS = P("clock.yearMs");
const CALENDAR_MONTHS = P("birth.monthCount");
const esc = x =>
  String(x ?? "").replace(
    /[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
const SAVE_VERSION = 87;
const TRACE_VERSION = 69;
const FLOW_HISTORY_LIMIT = 600;
let CAPTURE_TRACE = false;
let TRACE_RESOLUTION = null,
  PENDING_DEATH_TRACE = null;
const fingerprint = (prefix, source) => {
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619) >>> 0;
  return prefix + hash.toString(16).padStart(8, "0");
};
const keyedRoll = key => {
  let hash = 2166136261;
  const source = String(key);
  for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619) >>> 0;
  return hash / 4294967296;
};
const DATA_FINGERPRINT = fingerprint(
  "terra-data-",
  JSON.stringify(
    {
      EV,
      HIST,
      LOCALITY_MODEL,
      SIM_PARAMS,
      REG,
      RACE,
      RACE_AFF,
      MIGRATION_ROUTES,
      WORLD_PRESSURES,
      SIM_TABLES,
      WEALTH,
      TR,
      J,
      EXP_VALUES,
      REGIONAL_LIFE_PROFILES,
      REGIONAL_EMPLOYMENT_PROFILES,
      REGIONAL_SERVICE_PROFILES,
      REGIONAL_ENTITY_CONTEXT,
      REGIONAL_HISTORICAL_LOCALITIES,
      REGIONAL_RESIDENCE_PROFILES
    },
    (_, v) => (typeof v === "function" ? String(v) : v)
  )
);
const SOURCE_FINGERPRINT = fingerprint("terra-source-", DATA_FINGERPRINT + ENGINE_REVISION);
const EXP = EXP_VALUES,
  EL = EL_NAMES,
  ELT = P("education.levelThresholds"),
  FC = FC_NAMES,
  RM = RM_NAMES;
const STG = STG_NAMES;
const MAJ_PER_SLOT = P("events.majorChancePerSlot");
/* 暮らしの抽選表と係数はevents.jsのSIM_TABLESで定義する。 */
const CARE_TYPES = SIM_TABLES.care;
