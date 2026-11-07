// Individual body traits are recorded only when the person reports or has an
// observation on file. Species membership never fills these values by itself.
const RACE_PROFILE_TRAITS = Object.freeze({
  aegir_aquatic_adaptation: { race: "エーギル", label: "水中環境への適応" },
  aegir_water_retention: { race: "エーギル", label: "水分保持の特徴" },
  elafia_horn_sensation: { race: "エラフィア", label: "角への感覚" },
  anura_toxin_secretion: { race: "アヌーラ", label: "分泌物の毒性" }
});
const RACE_PROFILE_STATUSES = new Set(["present", "absent", "unknown", "not_applicable"]);
const RACE_PROFILE_SOURCES = new Set([
  "not-assessed", "self-report", "clinical-record", "direct-observation", "game-assumption"
]);

function createRaceProfile(race) {
  const raceName = typeof race === "string" ? race : race?.n || null,
    traits = Object.fromEntries(Object.entries(RACE_PROFILE_TRAITS)
      .filter(([, trait]) => trait.race === raceName)
      .map(([id]) => [id, {
        status: "unknown", source: "not-assessed", basis: "未評価", year: null, month: null, eventId: null
      }]));
  return { version: 1, race: raceName, traits, history: [] };
}

function raceProfileTraitStatus(state, traitId) {
  if (!state || !Object.hasOwn(RACE_PROFILE_TRAITS, traitId)) return "unknown";
  const expectedRace = RACE_PROFILE_TRAITS[traitId].race,
    profile = state.raceProfile;
  if (state.r?.n !== expectedRace || profile?.version !== 1 || profile.race !== expectedRace)
    return "unknown";
  const status = profile.traits?.[traitId]?.status;
  return RACE_PROFILE_STATUSES.has(status) ? status : "unknown";
}

function hasRaceTrait(state, traitId, status = "present") {
  return raceProfileTraitStatus(state, traitId) === status;
}

function isValidRaceProfileEntry(entry, currentYear) {
  return !!entry && typeof entry === "object" && !Array.isArray(entry) &&
    RACE_PROFILE_STATUSES.has(entry.status) && RACE_PROFILE_SOURCES.has(entry.source) &&
    typeof entry.basis === "string" && entry.basis.length > 0 && entry.basis.length <= 240 &&
    ((entry.year === null && entry.month === null && entry.status === "unknown" && entry.source === "not-assessed") ||
      (Number.isInteger(entry.year) && entry.year <= currentYear && Number.isInteger(entry.month) &&
        entry.month >= 0 && entry.month <= 12 && entry.source !== "not-assessed")) &&
    (entry.eventId === null || (typeof entry.eventId === "string" && entry.eventId.length <= 128));
}

function isValidRaceProfileState(profile, race, currentYear) {
  const raceName = typeof race === "string" ? race : race?.n;
  if (!profile || typeof profile !== "object" || Array.isArray(profile) ||
      profile.version !== 1 || profile.race !== raceName ||
      !profile.traits || typeof profile.traits !== "object" || Array.isArray(profile.traits) ||
      !Array.isArray(profile.history) || profile.history.length > 120) return false;
  for (const [id, entry] of Object.entries(profile.traits)) {
    if (!Object.hasOwn(RACE_PROFILE_TRAITS, id) || RACE_PROFILE_TRAITS[id].race !== raceName ||
        !isValidRaceProfileEntry(entry, currentYear)) return false;
  }
  return profile.history.every(row => row && typeof row === "object" && !Array.isArray(row) &&
    Object.hasOwn(RACE_PROFILE_TRAITS, row.traitId) && RACE_PROFILE_TRAITS[row.traitId].race === raceName &&
    isValidRaceProfileEntry(row, currentYear));
}

function applyRaceProfileAction(state, action, eventId = null) {
  if (!action) return;
  if (typeof action !== "object" || Array.isArray(action))
    throw new Error("個体プロフィールの更新内容が不正です");
  if (!state.raceProfile) state.raceProfile = createRaceProfile(state.r);
  if (!isValidRaceProfileState(state.raceProfile, state.r, state.year))
    throw new Error("個体プロフィールが現行の種族記録と一致しません");
  const trait = RACE_PROFILE_TRAITS[action.traitId];
  if (!trait || trait.race !== state.r?.n || !RACE_PROFILE_STATUSES.has(action.status) ||
      !RACE_PROFILE_SOURCES.has(action.source) || action.source === "not-assessed" ||
      typeof action.basis !== "string" || !action.basis.trim() || action.basis.length > 240)
    throw new Error("個体プロフィールの更新内容が不正です");
  const row = {
    traitId: action.traitId,
    status: action.status,
    source: action.source,
    basis: action.basis.trim(),
    year: state.year,
    month: Number.isInteger(state.mo) ? state.mo : 0,
    eventId: eventId || null
  };
  state.raceProfile.traits[action.traitId] = {
    status: row.status, source: row.source, basis: row.basis,
    year: row.year, month: row.month, eventId: row.eventId
  };
  state.raceProfile.history.push(row);
  if (state.raceProfile.history.length > 120) state.raceProfile.history.shift();
}
