function auditViolenceState(s, problems) {
  const state = s.violenceState;
  if (state == null) return;
  if (!state || state.version !== 1 || !state.beliefs || typeof state.beliefs !== "object" ||
      Array.isArray(state.beliefs) || !Array.isArray(state.formationHistory) ||
      !state.victims || typeof state.victims !== "object" || Array.isArray(state.victims) ||
      !Array.isArray(state.incidents) || !Array.isArray(state.incidentOrder) ||
      !Array.isArray(state.proceedings) || !Array.isArray(state.receiptIds) ||
      !Array.isArray(state.awareness) || !Array.isArray(state.familyContactBlocks) ||
      !state.counters || typeof state.counters !== "object") {
    problems.push("暴力事件・加害経験の台帳が不正");
    return;
  }
  const unique = values => new Set(values).size === values.length,
    incidentIds = state.incidents.map(row => row?.id),
    receiptIds = state.receiptIds,
    byIncident = new Map(state.incidents.map(row => [row.id, row])),
    historyArchive = state.historyArchive || {
      incidents: { count: 0, byKind: {}, byContext: {}, byOutcome: {}, through: null },
      witnessAwareness: { count: 0, byRelation: {}, through: null }
    },
    validArchiveGroup = (group, fields) => group && Number.isInteger(group.count) && group.count >= 0 &&
      fields.every(field => group[field] && typeof group[field] === "object" && !Array.isArray(group[field]) &&
        Object.values(group[field]).every(value => Number.isInteger(value) && value > 0) &&
        Object.values(group[field]).reduce((sum, value) => sum + value, 0) === group.count) &&
      (group.count === 0 ? group.through == null : Number.isInteger(group.through?.year) &&
        group.through.year <= s.year && Number.isInteger(group.through?.month) &&
        group.through.month >= 1 && group.through.month <= 12),
    archivedLightIncidents = state.incidents.filter(row => row?.kind === "threat" &&
      ["no-injury", "escaped", "prevented"].includes(row.outcome) && row.witnesses?.length === 0 &&
      !row.nextSceneAt && row.authorityAction === "none"),
    deathKinds = new Set(["attempted-lethal", "intentional-killing", "targeted-persecution", "defensive-lethal", "combat-lethal",
      "unlawful-order-execution", "assault", "negligent-fatality"]),
    confirmedVictimCount = row => row?.outcome === "confirmed-death"
      ? row.victims?.filter(link => link.conditionAtResolution === "confirmed-death").length || 0 : 0,
    directDeaths = state.incidents.reduce((count, row) => count +
      (deathKinds.has(row?.kind) ? confirmedVictimCount(row) : 0), 0),
    commandedDeaths = state.incidents.reduce((count, row) => count +
      (row?.kind === "command-harm" ? confirmedVictimCount(row) : 0), 0),
    assistedDeaths = state.incidents.reduce((count, row) => count +
      (row?.kind === "material-assistance" ? confirmedVictimCount(row) : 0), 0),
    witnessedFatalities = state.incidents.reduce((count, row) =>
      count + confirmedVictimCount(row) * (row?.witnesses?.length || 0), 0),
    nonlethalAssaults = state.incidents.reduce((count, row) =>
      count + (row?.kind === "assault" && row.outcome === "injured" ? row.victims?.length || 0 : 0), 0),
    attemptedLethalActs = state.incidents.reduce((count, row) =>
      count + (["attempted-lethal", "intentional-killing", "targeted-persecution"].includes(row?.kind) &&
        row.outcome !== "confirmed-death" ? row.victims?.length || 0 : 0), 0);
  if (!unique(incidentIds) || !unique(receiptIds) || !unique(state.incidentOrder) ||
      state.incidentOrder.length !== state.incidents.length ||
      state.incidentOrder.some((id, index) => id !== incidentIds[index]) ||
      !validArchiveGroup(historyArchive.incidents, ["byKind", "byContext", "byOutcome"]) ||
      !validArchiveGroup(historyArchive.witnessAwareness, ["byRelation"]) ||
      archivedLightIncidents.length > 48 || state.awareness.length > 16 ||
      Object.values(state.beliefs).some(row => !row || !Number.isFinite(row.harmLegitimacy) ||
        row.harmLegitimacy < 0 || row.harmLegitimacy > 100 || !Array.isArray(row.evidenceIds)) ||
      state.formationHistory.some(row => !row || typeof row.id !== "string" || !row.id ||
        !Number.isInteger(row.year) || row.year > s.year || !Number.isInteger(row.month) || row.month < 1 || row.month > 12 ||
        !["hear", "endorse", "reject", "leave-group"].includes(row.behavior) ||
        !VIOLENCE_TARGET_GROUPS.has(row.targetGroup) || !Number.isInteger(row.delta) || row.delta < 0 || row.delta > 30) ||
      state.incidents.some(row => !row || typeof row.id !== "string" || !row.id ||
        typeof row.sourceEventId !== "string" || !row.sourceEventId ||
        !Number.isInteger(row.year) || row.year > s.year || !Number.isInteger(row.month) || row.month < 1 || row.month > 12 ||
        !VIOLENCE_KINDS.has(row.kind) || !VIOLENCE_CONTEXTS.has(row.context) || !VIOLENCE_OUTCOMES.has(row.outcome) ||
        !Array.isArray(row.actors) || !Array.isArray(row.victims) || !Array.isArray(row.witnesses) ||
        typeof row.effectReceiptId !== "string" || !receiptIds.includes(row.effectReceiptId) ||
        !Array.isArray(row.evidenceIds) || row.evidenceIds.some(id => typeof id !== "string" || !id.trim()) ||
        (row.kind === "material-assistance" && row.outcome === "confirmed-death" &&
          (!row.linkedIncidentId || !byIncident.get(row.linkedIncidentId) ||
            byIncident.get(row.linkedIncidentId)?.kind !== "unlawful-order-execution" ||
            byIncident.get(row.linkedIncidentId)?.outcome !== "confirmed-death")) ||
        typeof row.actionFingerprint !== "string" || !row.actionFingerprint ||
        (row.outcome === "confirmed-death" &&
          (!["confirmed", "observed"].includes(row.deathEvidence) || !row.deathEvidenceId ||
            !row.evidenceIds.includes(row.deathEvidenceId))) ||
        !row.victims.length || new Set(row.victims.map(link => link?.victimId)).size !== row.victims.length ||
        new Set(row.victims.map(link => link?.localOrdinal)).size !== row.victims.length ||
        row.victims.some(link => !link || typeof link.victimId !== "string" ||
          !state.victims[link.victimId] || !Number.isInteger(link.localOrdinal) || link.localOrdinal < 1) ||
        row.witnesses.some(w => w.knowledge !== "direct" || !w.ref?.id || !Number.isInteger(w.learnedAt?.year) ||
          w.learnedAt.year > s.year || !Number.isInteger(w.learnedAt?.month) || w.learnedAt.month < 1 || w.learnedAt.month > 12)) ||
      Object.values(state.victims).some(row => !row || typeof row.id !== "string" || !row.id ||
        !["alive", "injured", "confirmed-dead", "unresolved"].includes(row.actualCondition) ||
        !Number.isInteger(row.createdAt?.year) || row.createdAt.year > s.year ||
        (row.deathAt && (!Number.isInteger(row.deathAt.year) || row.deathAt.year > s.year || row.actualCondition !== "confirmed-dead" ||
          !byIncident.get(row.deathIncidentId)?.victims?.some(link => link.victimId === row.id) ||
          byIncident.get(row.deathIncidentId)?.outcome !== "confirmed-death")) ||
        (row.actualCondition === "confirmed-dead" && !row.deathAt)) ||
      state.incidents.some((row, index) => {
        const marker = row?.targetGroup === "infected" ? "visible-oripathy-signs" :
          row?.targetGroup === "sarkaz" ? "recognized-sarkaz-target" : null;
        if (!marker || !["assault", "attempted-lethal", "intentional-killing", "targeted-persecution"].includes(row?.kind))
          return false;
        return !row.evidenceIds.includes(marker) && !state.incidents.slice(0, index).some(previous =>
          previous.targetGroup === row.targetGroup && previous.evidenceIds.includes(marker) &&
          previous.victims.some(link => row.victims.some(current => current.victimId === link.victimId))
        );
      }) ||
      state.awareness.some(row => !row || !row.personId || !incidentIds.includes(row.incidentId) ||
        row.knowledge !== "direct" || !Number.isInteger(row.year) || row.year > s.year ||
        !Number.isInteger(row.month) || row.month < 1 || row.month > 12 ||
        !byIncident.get(row.incidentId)?.witnesses?.some(w => w.ref.id === row.personId)) ||
      state.proceedings.some(row => !row || !incidentIds.includes(row.incidentId) ||
        !["investigation-open", "convicted", "sentence-served", "dismissed"].includes(row.status) ||
        !Number.isInteger(row.openedAt?.year) || row.openedAt.year > s.year ||
        typeof row.hadEmploymentAtOpen !== "boolean" ||
        !byIncident.get(row.incidentId) ||
        byIncident.get(row.incidentId)?.authorityAction !== "detain-and-investigate" ||
        (["convicted", "sentence-served"].includes(row.status) &&
          (typeof row.adjudicationActionReceiptId !== "string" ||
            !receiptIds.includes(row.adjudicationActionReceiptId) ||
            typeof row.adjudicationActionFingerprint !== "string")) ||
        (row.status === "sentence-served" &&
          (typeof row.releaseActionReceiptId !== "string" ||
            !receiptIds.includes(row.releaseActionReceiptId) ||
            typeof row.releaseActionFingerprint !== "string")) ||
        (["convicted", "sentence-served"].includes(row.status) &&
          row.employmentEndedBySentence !== row.hadEmploymentAtOpen) ||
        (row.caseType === "civilian-homicide" && byIncident.get(row.incidentId)?.outcome !== "confirmed-death") ||
        (row.caseType === "attempted-civilian-homicide" &&
          (byIncident.get(row.incidentId)?.context !== "civilian" ||
            !["attempted-lethal", "intentional-killing", "targeted-persecution"].includes(byIncident.get(row.incidentId)?.kind) ||
            byIncident.get(row.incidentId)?.outcome === "confirmed-death")) ||
        (row.caseType === "serious-civilian-assault" && byIncident.get(row.incidentId)?.outcome !== "injured") ||
        (row.releaseAt && (row.releaseAt.year < row.openedAt.year || row.status === "investigation-open"))) ||
      state.familyContactBlocks.some(row => !row || !row.personId || !incidentIds.includes(row.incidentId) ||
        !["active", "restored"].includes(row.status) || !Number.isInteger(row.openedAt?.year) || row.openedAt.year > s.year ||
        !byIncident.get(row.incidentId)?.witnesses?.some(w => w.ref.id === row.personId) ||
        ["military", "civilian-defense"].includes(byIncident.get(row.incidentId)?.context) ||
        (byIncident.get(row.incidentId)?.outcome !== "confirmed-death" &&
          !["attempted-lethal", "intentional-killing", "targeted-persecution"].includes(byIncident.get(row.incidentId)?.kind)) ||
        byIncident.get(row.incidentId)?.witnessNorm === "violent-group-approval") ||
      Object.values(state.counters).some(value => !Number.isInteger(value) || value < 0) ||
      state.counters.directDeaths !== directDeaths ||
      state.counters.commandedDeaths !== commandedDeaths ||
      state.counters.assistedDeaths !== assistedDeaths ||
      state.counters.witnessedFatalities !== witnessedFatalities ||
      state.counters.nonlethalAssaults !== nonlethalAssaults ||
      state.counters.attemptedLethalActs !== attemptedLethalActs)
    problems.push("暴力事件・加害経験の台帳が不正");
}
