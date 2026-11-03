// finalize: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("finalize", function ($terraData, $define, $rules) {
  "use strict";
  // Inject authored, separately guarded education scenes at the existing
  // terminal data phase; preserve the strict source-module phase ordering.
  if(typeof window.TERRA_EDUCATION_INJECT_P17==="function")
    window.TERRA_EDUCATION_INJECT_P17($terraData);
  // 同じ所属への二重加入・二重応募を、表示と実行候補の両方で防ぐ。
  for (const event of $terraData.EV) for (const choice of event.c || []) {
    if (!choice.o?.some(outcome => {
      const e = outcome?.[2];
      return e && typeof e === "object" && (e.resTo || e.returnToLocality || [e.lifeAffiliation, ...(e.lifeAffiliations || [])]
        .some(input => input && ["join", "contact"].includes(input.action || "join")));
    })) continue;
    const show = choice.show;
    choice.show = (s, tags) => $rules.conditions.matches(show, s,
      tags || (show != null && typeof show !== "function" ? $rules.conditions.inspectTags(s) : undefined)) &&
      $rules.affiliations.canChoose(choice, s);
  }
  window.GAME_DATA = {
    FACILITY_MODEL: $terraData.FACILITY_MODEL,
    LOCALITY_MODEL: $terraData.LOCALITY_MODEL,
    REG: $terraData.REG,
    RX: $terraData.RX,
    RACE: $terraData.RACE,
    RACE_AFF: $terraData.RACE_AFF,
    WEALTH: $terraData.WEALTH,
    TR: $terraData.TR,
    J: $terraData.J,
    EV: $terraData.EV,
    HIST: $terraData.HIST,
    WORLD_PRESSURES: $terraData.WORLD_PRESSURES,
    MIGRATION_ROUTES: $terraData.MIGRATION_ROUTES,
    STG_NAMES: $terraData.STG_NAMES,
    EL_NAMES: $terraData.EL_NAMES,
    FC_NAMES: $terraData.FC_NAMES,
    RM_NAMES: $terraData.RM_NAMES,
    EXP_VALUES: $terraData.EXP_VALUES,
    START_YEAR: $terraData.START_YEAR,
    BIRTH_YEAR_MIN: $terraData.BIRTH_YEAR_MIN,
    BIRTH_YEAR_MAX: $terraData.BIRTH_YEAR_MAX,
    DATA_GUIDE: $terraData.DATA_GUIDE,
    SIM_PARAMS: $terraData.SIM_PARAMS,
    SIM_TABLES: $terraData.SIM_TABLES,
    REGIONAL_LIFE_PROFILES: $terraData.REGIONAL_LIFE_PROFILES,
    REGIONAL_EMPLOYMENT_PROFILES: $terraData.REGIONAL_EMPLOYMENT_PROFILES,
    REGIONAL_SERVICE_PROFILES: $terraData.REGIONAL_SERVICE_PROFILES,
    REGIONAL_ENTITY_CONTEXT: $terraData.REGIONAL_ENTITY_CONTEXT,
    REGIONAL_HISTORICAL_LOCALITIES: $terraData.REGIONAL_HISTORICAL_LOCALITIES,
    REGIONAL_RESIDENCE_PROFILES: $terraData.REGIONAL_RESIDENCE_PROFILES,
    DATASET_META: $terraData.DATASET_META,
    EVENT_FIELD_META: $terraData.EVENT_FIELD_META,
    EVENT_EFFECT_TYPES: $terraData.EVENT_EFFECT_TYPES,
    FLAG_REGISTRY: $terraData.FLAG_REGISTRY,
    SETTING_SOURCES: $terraData.SETTING_SOURCES,
    LANGUAGE_REGISTRY: $terraData.LANGUAGE_REGISTRY,
    REGION_LANGUAGE_PROFILES: $terraData.REGION_LANGUAGE_PROFILES,
    LANGUAGE_CONTEXTS: $terraData.LANGUAGE_CONTEXTS,
    eventFlagValues: $terraData.eventFlagValues,
    eventFlagRefs: $terraData.eventFlagRefs
  };
});
window.TERRA_DATA_BUILD.complete();
