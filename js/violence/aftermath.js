const VIOLENCE_ROUTINE_RELATION_EVENTS = new Map([
  ["family_daily_spouse_cooking", "spouse"],
  ["family_daily_spouse_errand_together", "spouse"],
  ["family_daily_spouse_health_care", "spouse"],
  ["family_daily_spouse_holiday_stroll", "spouse"],
  ["family_daily_spouse_mutual_gift", "spouse"],
  ["family_daily_spouse_shared_quiet", "spouse"],
  ["family_daily_spouse_worn_clothes", "spouse"]
]);
const VIOLENCE_RELATION_NOTIFICATION_EVENTS = new Set([
  "family_spouse_independent_move_notice",
  "family_former_spouse_move_notice",
  "friend_death_notice", "neighbor_death_notice",
  "friend_missing_news", "neighbor_missing_news",
  "friend_found_news", "neighbor_found_news"
]);
const VIOLENCE_CHILD_CONTACT_EVENTS = new Set([
  "fam_child_inf", "fam_child_care", "family_child_crystal_exposure",
  "family_child_exposure_followup", "family_child_future", "adult_child_contact"
]);
const VIOLENCE_PARENT_CONTACT_EVENTS = new Set([
  "fam_care", "fam_care_capacity_review", "fam_care_followup",
  "parent_treatment_review", "parent_work_news", "fam_infected"
]);

function violenceFamilyDailyCandidates(s) {
  if (typeof familyDailyCandidates !== "function") return [];
  const blockedIds = new Set((violenceStateFor(s, false)?.familyContactBlocks || [])
    .filter(row => row.status === "active").map(row => row.personId));
  return familyDailyCandidates(s).filter(row => !blockedIds.has(row.person?.id));
}

function violenceFamilyDailyTarget(s) {
  return pick(violenceFamilyDailyCandidates(s)) || null;
}

function violencePersonContactBlocked(s, person) {
  return !!person?.id && (violenceStateFor(s, false)?.familyContactBlocks || []).some(row =>
    row.personId === person.id && row.status === "active"
  );
}

function violencePeekChildForEvent(s, eventId) {
  if (typeof childForEvent !== "function") return null;
  const hasRandomState = typeof RANDOM_STATE !== "undefined",
    previousRandomState = hasRandomState ? RANDOM_STATE : null;
  try {
    return childForEvent(s, eventId);
  } finally {
    if (hasRandomState) RANDOM_STATE = previousRandomState;
  }
}

function violenceParentForEvent(s, eventId) {
  const parents = [s.par?.fa, s.par?.mo].filter(person => person && !person.d &&
      person.lifeStatus !== "dead" && person.actualStatus !== "dead" && !violencePersonContactBlocked(s, person));
  if (eventId === "fam_care") {
    return parents.filter(person => person.health <= P("family.parentCareNeedThreshold") ||
      (person.inf && person.health <= P("family.parentCareNeedInfectedThreshold")))
      .sort((a, b) => a.health - b.health)[0] || null;
  }
  if (eventId === "fam_care_capacity_review")
    return parents.find(person => person.id === s.familyCare?.target) || null;
  if (eventId === "fam_care_followup") {
    const ended = (s.familyCareHistory || []).slice().reverse().find(row => row.type === "period_ended");
    return parents.find(person => person.id === ended?.targetId) || null;
  }
  if (eventId === "parent_treatment_review")
    return parents.find(person => person.id === s.house?.parentLedger?.treatmentReviewDue?.parentId) || null;
  if (eventId === "parent_work_news")
    return parents.find(person => (person.jobHistory?.length || 0) > (person.knownJobChangeCount || 0)) || null;
  if (eventId === "fam_infected") {
    const parentKeys = s.care?.parentKeys || ["fa", "mo"];
    return parentKeys.map(key => parents.find(person => person === s.par?.[key]))
      .find(person => person?.inf && !person.infectionKnown) || null;
  }
  return null;
}

function violenceRecordedRomancePartner(s) {
  const romance = s?.romance;
  if (!romance) return null;
  const people = [s.sp, s.friendContact, s.neighborContact, ...(s.kids || []), ...(s.siblings || []),
    s.par?.fa, s.par?.mo, ...(s.relationshipHistory || [])].filter(Boolean);
  if (typeof romance.personId === "string") return people.find(person => person.id === romance.personId) || null;
  if (typeof romance.name === "string" && romance.name.trim())
    return people.find(person => person.nm === romance.name) || null;
  return null;
}

function violenceCurrentRhodesColleague(s) {
  const rows = Array.isArray(s?.personTies?.rhodesColleagues)
    ? s.personTies.rhodesColleagues
    : s?.personTies?.rhodesColleague ? [s.personTies.rhodesColleague] : [];
  const current = s?.personTies?.rhodesColleague;
  return current?.actualStatus === "working" && !violencePersonContactBlocked(s, current)
    ? current
    : rows.find(person => person?.actualStatus === "working" && !violencePersonContactBlocked(s, person)) || null;
}

function violenceEventEligible(event, s) {
  // These are consequential notices carried by a letter or co-parenting channel,
  // not invitations to resume ordinary contact with the witness.
  if (VIOLENCE_RELATION_NOTIFICATION_EVENTS.has(event?.id)) return true;
  if (event?.id === "family_daily_small_care") {
    if (typeof familyDailyCandidates !== "function") return true;
    return familyDailyCandidates(s).length === 0 || violenceFamilyDailyCandidates(s).length > 0;
  }
  if (VIOLENCE_CHILD_CONTACT_EVENTS.has(event?.id))
    return !!violencePeekChildForEvent(s, event.id);
  if (VIOLENCE_PARENT_CONTACT_EVENTS.has(event?.id))
    return !!violenceParentForEvent(s, event.id);
  if (event?.id === "family_sibling_bereavement") return true;
  if (event?.id?.startsWith("family_sibling_")) {
    const person = typeof siblingForEvent === "function" ? siblingForEvent(s, event.id) : null;
    return !person || !violencePersonContactBlocked(s, person);
  }
  if (event?.id === "family_spouse_death" || event?.id === "family_former_spouse_death_notice") return true;
  if (event?.id === "sr_rhodes_colleague_followup")
    return !!violenceCurrentRhodesColleague(s);
  if (event?.id?.startsWith("family_spouse_")) return !violencePersonContactBlocked(s, s.sp);
  const role = VIOLENCE_ROUTINE_RELATION_EVENTS.get(event?.id);
  if (role === "spouse" || event?.id?.startsWith("family_daily_spouse_"))
    return !violencePersonContactBlocked(s, s.sp);
  if (event?.id?.includes("romance") || event?.id?.includes("partner"))
    return !violencePersonContactBlocked(s, violenceRecordedRomancePartner(s));
  if (event?.id === "life_later_spouse_evening_walk") return !violencePersonContactBlocked(s, s.sp);
  if (event?.id?.includes("friend"))
    return !violencePersonContactBlocked(s, s.friendContact);
  if (event?.id?.includes("neighbor"))
    return !violencePersonContactBlocked(s, s.neighborContact);
  return true;
}

function violenceSummaryForPlayer(s) {
  const state = violenceStateFor(s, false);
  if (!state) return { directDeaths: 0, attempts: 0, openCases: 0, witnessRelationships: 0, incidents: [], proceedings: [] };
  return {
    directDeaths: state.counters?.directDeaths || 0,
    commandedDeaths: state.counters?.commandedDeaths || 0,
    assistedDeaths: state.counters?.assistedDeaths || 0,
    attempts: state.counters?.attemptedLethalActs || 0,
    nonlethalAssaults: state.counters?.nonlethalAssaults || 0,
    commandHarm: state.counters?.commandHarm || 0,
    materialAssistance: state.counters?.materialAssistance || 0,
    openCases: (state.proceedings || []).filter(row => row.status === "investigation-open" || row.status === "convicted").length,
    witnessRelationships: (state.familyContactBlocks || []).filter(row => row.status === "active").length,
    historyArchive: {
      incidents: JSON.parse(JSON.stringify(state.historyArchive?.incidents || { count: 0, byKind: {}, byContext: {}, byOutcome: {}, through: null })),
      witnessAwareness: JSON.parse(JSON.stringify(state.historyArchive?.witnessAwareness || { count: 0, byRelation: {}, through: null }))
    },
    incidents: (state.incidents || []).map(row => ({
      id: row.id, year: row.year, month: row.month, region: row.region,
      kind: row.kind, context: row.context, decision: row.decision,
      targetGroup: row.targetGroup, outcome: row.outcome,
      deathEvidence: row.deathEvidence, deathEvidenceId: row.deathEvidenceId,
      witnesses: row.witnesses.map(w => ({ ...w })),
      evidenceIds: [...row.evidenceIds], authorityAction: row.authorityAction
    })),
    proceedings: (state.proceedings || []).map(row => ({
      incidentId: row.incidentId, status: row.status, caseType: row.caseType,
      jurisdiction: row.jurisdiction, basis: row.basis,
      openedAt: { ...row.openedAt }, reviewAt: row.reviewAt ? { ...row.reviewAt } : null,
      hadEmploymentAtOpen: !!row.hadEmploymentAtOpen,
      employmentEndedBySentence: !!row.employmentEndedBySentence,
      sentence: row.sentence ? { ...row.sentence } : null,
      releaseAt: row.releaseAt ? { ...row.releaseAt } : null,
      completedAt: row.completedAt ? { ...row.completedAt } : null
    })),
    familyContactBlocks: (state.familyContactBlocks || []).map(row => ({ ...row, openedAt: { ...row.openedAt } }))
  };
}
