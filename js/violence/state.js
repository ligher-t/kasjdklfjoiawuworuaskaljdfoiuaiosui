/* A violence record begins empty. It never infers intent from birth, race,
 * infection, poverty, health, temperament, or military membership. */
function createViolenceState() {
  return {
    version: 1,
    beliefs: {},
    formationHistory: [],
    victims: {},
    incidents: [],
    incidentOrder: [],
    proceedings: [],
    receiptIds: [],
    awareness: [],
    familyContactBlocks: [],
    historyArchive: createViolenceHistoryArchive(),
    counters: {
      directDeaths: 0,
      commandedDeaths: 0,
      assistedDeaths: 0,
      attemptedLethalActs: 0,
      nonlethalAssaults: 0,
      commandHarm: 0,
      materialAssistance: 0,
      witnessedFatalities: 0
    }
  };
}

function createViolenceHistoryArchive() {
  return {
    incidents: { count: 0, byKind: {}, byContext: {}, byOutcome: {}, through: null },
    witnessAwareness: { count: 0, byRelation: {}, through: null }
  };
}

function violenceStateFor(s, create = true) {
  if (!s || typeof s !== "object") return null;
  if (!s.violenceState && create) s.violenceState = createViolenceState();
  if (s.violenceState && create) {
    s.violenceState.historyArchive ||= createViolenceHistoryArchive();
    s.violenceState.historyArchive.incidents ||= createViolenceHistoryArchive().incidents;
    s.violenceState.historyArchive.witnessAwareness ||= createViolenceHistoryArchive().witnessAwareness;
  }
  return s.violenceState || null;
}

function violenceRecordArchivedCount(group, incident) {
  group.count++;
  group.byKind[incident.kind] = (group.byKind[incident.kind] || 0) + 1;
  group.byContext[incident.context] = (group.byContext[incident.context] || 0) + 1;
  group.byOutcome[incident.outcome] = (group.byOutcome[incident.outcome] || 0) + 1;
  group.through = { year: incident.year, month: incident.month };
}

function violenceCompactHistory(s) {
  const state = violenceStateFor(s);
  if (!state) return;
  const retainedLightIncidentIds = new Set(), lightIncidents = state.incidents.filter(row =>
      row.kind === "threat" && ["no-injury", "escaped", "prevented"].includes(row.outcome) &&
      row.witnesses.length === 0 && !row.nextSceneAt && row.authorityAction === "none" &&
      !state.proceedings.some(caseRow => caseRow.incidentId === row.id)
    );
  for (const row of lightIncidents.slice(-48)) retainedLightIncidentIds.add(row.id);
  const discarded = lightIncidents.filter(row => !retainedLightIncidentIds.has(row.id));
  if (discarded.length) {
    const archive = state.historyArchive.incidents;
    const discardedVictims = new Set();
    for (const row of discarded) {
      violenceRecordArchivedCount(archive, row);
      for (const link of row.victims || []) discardedVictims.add(link.victimId);
    }
    const discardedIds = new Set(discarded.map(row => row.id)),
      retainedVictims = new Set(state.incidents
      .filter(row => !discardedIds.has(row.id))
      .flatMap(row => (row.victims || []).map(link => link.victimId)));
    for (const victimId of discardedVictims) {
      const victim = state.victims[victimId];
      if (!retainedVictims.has(victimId) && victim?.kind === "anonymous-person" &&
          !victim.personRef && ["alive", "unresolved"].includes(victim.actualCondition))
        delete state.victims[victimId];
    }
    state.incidents = state.incidents.filter(row => !discarded.includes(row));
    state.incidentOrder = state.incidents.map(row => row.id);
  }

  if (state.awareness.length > 16) {
    const removed = state.awareness.splice(0, state.awareness.length - 16),
      archive = state.historyArchive.witnessAwareness;
    for (const row of removed) {
      archive.count++;
      const relation = ["family", "friend", "neighbor", "colleague", "contact"].includes(row.relationshipKind)
        ? row.relationshipKind : "other";
      archive.byRelation[relation] = (archive.byRelation[relation] || 0) + 1;
      archive.through = { year: row.year, month: row.month };
    }
  }
}

function violencePeriod(year, month, offsetMonths = 0) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12 ||
      !Number.isInteger(offsetMonths)) return null;
  const value = year * 12 + month - 1 + offsetMonths;
  return { year: Math.floor(value / 12), month: value % 12 + 1 };
}

function violenceBeliefScore(s, targetGroup) {
  const belief = violenceStateFor(s, false)?.beliefs?.[targetGroup];
  return Number.isFinite(belief?.harmLegitimacy) ? belief.harmLegitimacy : 0;
}

function violenceHasRecordedEndorsement(s, targetGroup) {
  return (violenceStateFor(s, false)?.formationHistory || []).some(row =>
    row.targetGroup === targetGroup && row.behavior === "endorse" && row.delta > 0
  );
}

function violenceLatestAssault(s, targetGroup = null) {
  const incidents = violenceStateFor(s, false)?.incidents || [];
  return incidents.slice().reverse().find(row =>
    row.kind === "assault" && row.context === "civilian" &&
    (!targetGroup || row.targetGroup === targetGroup) &&
    row.victims?.some(v => v.conditionAtResolution === "injured")
  ) || null;
}

function violenceCivilianHomicideEligible(s, targetGroup = "infected") {
  const state = violenceStateFor(s, false);
  return !!state && (s?.age || 0) >= 18 &&
    violenceBeliefScore(s, targetGroup) >= 55 &&
    violenceHasRecordedEndorsement(s, targetGroup) &&
    (state.counters?.nonlethalAssaults || 0) >= 1 &&
    !!violenceLatestAssault(s, targetGroup) &&
    !s?.fl?.detained && !s?.dead;
}

function violenceNextSceneAt(s, scenarioId) {
  const state = violenceStateFor(s, false);
  if (!state) return null;
  const row = state.incidents.slice().reverse().find(incident =>
    incident.scenarioId === scenarioId && incident.nextSceneAt &&
    !incident.followupSceneUsed && incident.victims?.some(v => v.conditionAtResolution === "injured")
  );
  return row ? { ...row.nextSceneAt } : null;
}

function violenceNextLegalReview(s, caseType = null) {
  const row = violenceStateFor(s, false)?.proceedings?.filter(item =>
    item.status === "investigation-open" && item.reviewAt && (!caseType || item.caseType === caseType)
  ).sort((a, b) => a.reviewAt.year * 12 + a.reviewAt.month - (b.reviewAt.year * 12 + b.reviewAt.month))[0];
  return row ? { ...row.reviewAt } : null;
}

function violenceNextSentenceRelease(s, caseType = null) {
  const row = violenceStateFor(s, false)?.proceedings?.filter(item =>
    item.status === "convicted" && item.releaseAt && (!caseType || item.caseType === caseType)
  ).sort((a, b) => a.releaseAt.year * 12 + a.releaseAt.month - (b.releaseAt.year * 12 + b.releaseAt.month))[0];
  return row ? { ...row.releaseAt } : null;
}

function violenceLatestIncidentForEvent(s, eventId) {
  return (violenceStateFor(s, false)?.incidents || []).slice().reverse().find(row =>
    row.sourceEventId === eventId
  ) || null;
}
