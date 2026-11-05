// finalize: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("finalize", function ($terraData, $define, $rules) {
  "use strict";
  if(typeof window.TERRA_HISTORY_SCENE_REVIEWS==="function"){
    window.TERRA_HISTORY_SCENE_REVIEWS($terraData);delete window.TERRA_HISTORY_SCENE_REVIEWS;
  }
  // Inject authored, separately guarded education scenes at the existing
  // terminal data phase; preserve the strict source-module phase ordering.
  if(typeof window.TERRA_EDUCATION_INJECT_P17==="function"){
    window.TERRA_EDUCATION_INJECT_P17($terraData,$define);
    delete window.TERRA_EDUCATION_INJECT_P17;
  }
  window.TERRA_PARENT_BEREAVEMENT($terraData);delete window.TERRA_PARENT_BEREAVEMENT;
  // 明確な成功・失敗でも、状態操作だけでイベント評価点に表れない結果は
  // 表示用の色を明示する。効果・自動選択の評価点は変更しない。
  const reviewedOutcomeTones = [
    ["edu_neighbor_school_notice", 1, 0, "bad"],
    ["edu_primary_commute_guardian", 1, 0, "bad"],
    ["edu_no_path_year_close", 1, 0, "bad"],
    ["education_school_family_pressure", 1, 0, "bad"],
    ["education_transfer_review", 0, 0, "good"],
    ["education_transfer_review", 1, 0, "bad"],
    ["education_funding_review", 0, 0, "bad"],
    ["education_funding_review", 1, 0, "good"],
    ["education_funding_review", 2, 0, "bad"],
    ["education_funding_review", 4, 0, "good"],
    ["education_funding_review", 4, 1, "bad"],
    ["education_funding_review", 5, 0, "bad"],
    ["education_graduation_review", 1, 0, "bad"],
    ["education_case_review", 8, 0, "good"],
    ["edu_course_admission_contract", 0, 0, "good"],
    ["car", 6, 1, "bad"],
    ["car", 10, 1, "bad"],
    ["car", 18, 1, "bad"],
    ["car", 20, 1, "bad"],
    ["fam_care", 1, 1, "bad"],
    ["col_hire", 1, 0, "good"],
    ["col_hire", 1, 1, "bad"],
    ["col_hire", 2, 0, "good"],
    ["col_hire", 2, 1, "bad"],
    ["kaz_knight", 1, 1, "bad"],
    ["lei_arts", 0, 1, "bad"],
    ["lei_arts", 1, 1, "bad"],
    ["ibe_rebuild_contract_review", 0, 1, "bad"],
    ["kje_open", 0, 0, "good"],
    ["kje_open", 0, 1, "bad"],
    ["bol_tourist", 2, 1, "bad"],
    ["arts_academy_completion", 0, 1, "bad"],
    ["teacher_path", 0, 1, "bad"],
    ["family_newlywed_residence", 2, 1, "bad"],
    ["life_infected_exclusion_consequence", 0, 0, "bad"],
    ["earth_discr_work_years", 1, 0, "good"],
    ["earth_discr_work_years", 2, 0, "bad"],
    ["life_night_study", 1, 1, "bad"],
    ["infection_workplace_review", 1, 1, "bad"],
    ["vic_strike", 1, 0, "good"],
    ["family_allowance_support", 0, 0, "good"],
    ["sir_family_afterwork", 0, 0, "good"],
    ["sir_family_later_work", 1, 0, "good"],
    ["choice_columbia_01", 1, 0, "good"],
    ["voc_final_fee", 0, 0, "good"],
    ["sr_rhodes_hiring_review", 0, 0, "good"],
    ["sr_rhodes_hiring_review", 0, 1, "good"],
    ["sr_rhodes_hiring_review", 1, 0, "good"],
    ["sr_rhodes_hiring_review", 1, 1, "good"],
    ["sr_rhodes_hiring_review", 2, 0, "good"],
    ["sr_rhodes_hiring_review", 4, 0, "good"],
    ["sr_rhodes_hiring_review", 4, 1, "good"],
    ["car_hig_touhou_entry", 0, 0, "good"],
    ["car_yan_tianshi_entry", 0, 1, "bad"],
    ["car_urs_academy_entry", 0, 0, "good"],
    ["car_urs_academy_entry", 0, 1, "bad"],
    ["car_vic_royal_entry", 0, 0, "good"],
    ["car_vic_scribe_entry", 0, 0, "good"],
    ["car_vic_scribe_entry", 0, 1, "bad"],
    ["car_vic_works_entry", 0, 0, "good"],
    ["car_lat_executor_entry", 0, 1, "bad"],
    ["car_sir_police_entry", 0, 1, "bad"],
    ["car_sie_obs_entry", 0, 0, "good"],
    ["car_sie_obs_entry", 0, 1, "bad"],
    ["car_hig_shinto_entry", 0, 2, "bad"],
    ["car_kje_karlan_entry", 0, 0, "good"],
    ["car_kje_karlan_entry", 0, 1, "bad"],
    ["car_ibe_tuner_entry", 0, 0, "good"],
    ["car_lmd_guard_choice_raid", 0, 1, "bad"],
    ["car_lat_executor_choice_dispute", 0, 1, "bad"],
    ["car_sar_warrior_choice_beast", 0, 1, "bad"],
    ["site_school_transfer", 0, 1, "bad"],
    ["v77_adult_literacy_path", 1, 1, "bad"],
    ["life_ursus_zelgrad_recruitment", 0, 0, "good"],
    ["life_ursus_zelgrad_recruitment", 0, 1, "bad"],
    ["life_ursus_zelgrad_recruitment_retry", 0, 0, "good"],
    ["life_ursus_zelgrad_displaced_work", 0, 1, "bad"],
    ["sr_intersect_battlefield_mercy", 2, 0, "bad"]
  ];
  for (const [id, choiceIndex, outcomeIndex, displayTone] of reviewedOutcomeTones) {
    const event = $terraData.EV.find(row => row.id === id),
      outcome = event?.c?.[choiceIndex]?.o?.[outcomeIndex];
    if (!outcome || outcome.length !== 3)
      throw Error(`色校閲対象のイベント結果が見つからない: ${id}#${choiceIndex + 1}.${outcomeIndex + 1}`);
    outcome.push(displayTone);
  }
  const reviewedEventTones = {
    daily_yan_37: "bad",
    daily_victoria_42: "bad",
    daily_leithanien_32: "bad",
    daily_rhodes_30: "bad",
    arena_brutal_record_daily: "bad",
    daily_kazdel_38: "bad",
    parent_oripathy_death_1: "bad",
    parent_oripathy_death_2: "bad",
    parent_oripathy_death_3: "bad",
    parent_oripathy_death_4: "bad",
    parent_oripathy_death_5: "bad",
    peril_iberia_deep_sea_wash_daily: "bad",
    f100: "bad",
    daily_bolivar_38: "bad",
    daily_rim_38: "bad",
    daily_kazimierz_29: "bad",
    daily_kazimierz_01: "good",
    daily_iberia_09: "good",
    daily_kazdel_08: "good",
    daily_rim_48: "good",
    daily_minos_57: "good",
    daily_bolivar_07: "good",
    daily_bolivar_10: "good",
    daily_sargon_05: "good",
    daily_sargon_56: "good",
    daily_sami_50: "good",
    daily_sami_51: "good",
    daily_kazdel_50: "good",
    daily_kazdel_52: "good"
  };
  for (const [id, displayTone] of Object.entries(reviewedEventTones)) {
    const event = $terraData.EV.find(row => row.id === id);
    if (!event || event.c || event.displayTone)
      throw Error(`色校閲対象の単独イベントが見つからない: ${id}`);
    event.displayTone = displayTone;
  }
  $terraData.refreshFlagUsage();
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
    EDUCATION_P17_REVIEWED:$terraData.EDUCATION_P17_REVIEWED||[],
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
