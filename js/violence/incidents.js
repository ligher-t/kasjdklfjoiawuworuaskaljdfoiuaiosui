const VIOLENCE_KINDS = new Set([
  "threat", "assault", "attempted-lethal", "intentional-killing", "targeted-persecution",
  "defensive-lethal", "combat-lethal", "unlawful-order-execution", "command-harm",
  "material-assistance", "negligent-fatality", "witness", "refusal", "rescue", "withheld-help"
]);
const VIOLENCE_CONTEXTS = new Set(["civilian", "civilian-defense", "organized-contract", "military"]);
const VIOLENCE_OUTCOMES = new Set(["confirmed-death", "injured", "escaped", "prevented", "no-injury", "unresolved"]);
const VIOLENCE_MILITARY_POSTINGS = [
  ["ursus-imperial-officer", "ウルサス"],
  ["ursus-border-mine-guard", "ウルサス"],
  ["victoria-regular-infantry", "ヴィクトリア"],
  ["victoria-royal-officer", "ヴィクトリア"],
  ["higashi-samurai-household", "極東"],
  ["kazdel-military-commission", "カズデル"],
  ["bolivar-coalition-soldier", "ボリバル"]
];
const VIOLENCE_LOCAL_LEGAL_PROFILES = Object.freeze({
  "クルビア": Object.freeze({
    id: "columbia-civic-court-game-model",
    basis: "game-assumption-local-civic-adjudication",
    cases: Object.freeze({
      "civilian-homicide": Object.freeze({ years: 3, fine: 80000 }),
      "attempted-civilian-homicide": Object.freeze({ years: 2, fine: 50000 }),
      "serious-civilian-assault": Object.freeze({ years: 1, fine: 20000 })
    })
  })
});

function violenceRegionalAffiliationOnDuty(s, affiliationId) {
  return typeof affiliationWorkAvailable === "function" && affiliationWorkAvailable(s, affiliationId);
}

function violenceActorHasActiveMilitaryPosting(s) {
  return VIOLENCE_MILITARY_POSTINGS.some(([affiliationId, region]) =>
    s?.res?.n === region &&
    s.lifeRecord?.affiliations?.some(row => row.id === affiliationId && ["active", "crisis"].includes(row.status)) &&
    violenceRegionalAffiliationOnDuty(s, affiliationId)
  );
}

function violenceActorCanActInScene(s, action) {
  if (!s || s.dead) return { ok: false, reason: "actor-not-alive" };
  if (s.fl?.detained) return { ok: false, reason: "actor-not-free-to-act" };
  if (["assault", "attempted-lethal", "intentional-killing", "targeted-persecution", "defensive-lethal", "combat-lethal"]
      .includes(action.kind) && Number.isFinite(s.h) && s.h <= 0)
    return { ok: false, reason: "no-physical-capacity" };
  return { ok: true };
}

function violencePersonRows(s) {
  return [
    s.par?.fa, s.par?.mo, s.sp, ...(s.kids || []), ...(s.siblings || []),
    s.friendContact, s.neighborContact, ...(s.relationshipHistory || []),
    ...(s.care?.supportNetwork?.members || []),
    ...(s.personTies?.rhodesColleagues || []), s.personTies?.rhodesColleague
  ].filter(Boolean);
}

function violenceResolvePersonRef(s, ref) {
  if (!ref || typeof ref !== "object") return null;
  if (ref.kind === "family-role") {
    const person = ref.role === "spouse" ? s.sp :
      ref.role === "father" ? s.par?.fa :
        ref.role === "mother" ? s.par?.mo :
          ref.role === "friend" ? s.friendContact :
            ref.role === "neighbor" ? s.neighborContact : null;
    if (!person || typeof person.id !== "string" || !person.id || person.d || person.deathYear != null ||
        person.lifeStatus === "dead" || person.actualStatus === "dead") return null;
    if (ref.role === "spouse" && typeof spouseLivesWithProtagonist === "function" &&
        !spouseLivesWithProtagonist(s)) return null;
    return person;
  }
  if (["family-person", "recorded-contact"].includes(ref.kind) && typeof ref.id === "string") {
    const person = violencePersonRows(s).find(row => row.id === ref.id);
    return person && typeof person.id === "string" && !person.d && person.deathYear == null &&
      person.lifeStatus !== "dead" && person.actualStatus !== "dead" ? person : null;
  }
  return null;
}

function violencePersonIsKnownDead(s, id) {
  const person = violencePersonRows(s).find(row => row.id === id);
  return !person || !!person.d || person.deathYear != null || person.lifeStatus === "dead" || person.actualStatus === "dead";
}

function violenceFollowupWindowOpen(s, incident) {
  const due = incident?.nextSceneAt;
  if (!Number.isInteger(due?.year) || !Number.isInteger(due?.month)) return false;
  const currentMonth = (s.year || 0) * 12 + (s.mo || 1), dueMonth = due.year * 12 + due.month;
  return currentMonth >= dueMonth && currentMonth <= dueMonth + 2;
}

function violenceResolveVictimRef(s, ref, incidentId, action = null) {
  const state = violenceStateFor(s, false);
  if (ref?.kind === "family-role") {
    const person = ref.role === "spouse" ? s.sp : ref.role === "father" ? s.par?.fa :
      ref.role === "mother" ? s.par?.mo : null;
    if (!person || typeof person.id !== "string" || !person.id || person.d || person.deathYear != null ||
        person.lifeStatus === "dead" || person.actualStatus === "dead")
      return { ok: false, reason: "unknown-or-dead-family-person" };
    const id = `person:${person.id}`;
    return { ok: true, id, row: state?.victims?.[id] || null, isNew: !state?.victims?.[id], person };
  }
  if (ref?.kind === "anonymous-person" && Number.isInteger(ref.localOrdinal) && ref.localOrdinal > 0) {
    const id = `anonymous:${incidentId}:${ref.localOrdinal}`;
    return { ok: true, id, row: state?.victims?.[id] || null, isNew: true, person: null };
  }
  if (["family-person", "recorded-contact"].includes(ref?.kind) && typeof ref.id === "string") {
    const person = violenceResolvePersonRef(s, { kind: "recorded-contact", id: ref.id });
    if (!person) return { ok: false, reason: "unknown-or-dead-recorded-person" };
    const id = `person:${person.id}`;
    return { ok: true, id, row: state?.victims?.[id] || null, isNew: !state?.victims?.[id], person };
  }
  if (ref?.kind === "facility-person" && typeof ref.areaKey === "string" && typeof ref.personId === "string") {
    const person = s.community?.key === ref.areaKey ? s.community?.people?.[ref.personId] : null;
    if (!person || person.actualStatus !== "working") return { ok: false, reason: "facility-person-not-present-or-alive" };
    const id = `facility-person:${ref.areaKey}:${ref.personId}`;
    return { ok: true, id, row: state?.victims?.[id] || null, isNew: !state?.victims?.[id], person };
  }
  if (ref?.kind === "collective" && Number.isInteger(ref.localOrdinal) && ref.localOrdinal > 0) {
    const id = `collective:${incidentId}:${ref.localOrdinal}`;
    return { ok: true, id, row: state?.victims?.[id] || null, isNew: true, person: null };
  }
  if (ref?.kind === "incident-victim" && typeof ref.sourceEventId === "string" &&
      Number.isInteger(ref.localOrdinal) && ref.localOrdinal > 0) {
    const first = violenceLatestIncidentForEvent(s, ref.sourceEventId),
      victimId = first?.victims?.find(v => v.localOrdinal === ref.localOrdinal)?.victimId,
      row = victimId ? state?.victims?.[victimId] : null;
    const linkedAssistanceVictim = action?.kind === "material-assistance" &&
      row?.actualCondition === "confirmed-dead" && row.deathIncidentId === action.linkedExecutionIncidentId;
    if (!first || (!linkedAssistanceVictim && (first.followupSceneUsed || !violenceFollowupWindowOpen(s, first))))
      return { ok: false, reason: first?.followupSceneUsed ? "incident-followup-already-used" : "incident-followup-not-open" };
    if (!row || (row.actualCondition === "confirmed-dead" && !linkedAssistanceVictim))
      return { ok: false, reason: "incident-victim-not-alive" };
    if (row.personRef?.kind === "facility-person") {
      const person = s.community?.key === row.personRef.areaKey
        ? s.community?.people?.[row.personRef.personId] : null;
      if (!person || person.actualStatus !== "working") {
        if (!linkedAssistanceVictim || person?.actualStatus !== "dead")
          return { ok: false, reason: "incident-victim-not-alive" };
      }
    } else if (row.personRef?.id && violencePersonIsKnownDead(s, row.personRef.id) && !linkedAssistanceVictim) {
      return { ok: false, reason: "incident-victim-not-alive" };
    }
    const person = row?.personRef?.kind === "facility-person"
      ? (s.community?.key === row.personRef.areaKey ? s.community?.people?.[row.personRef.personId] : null)
      : row?.personRef?.id
        ? violenceResolvePersonRef(s, { kind: "recorded-contact", id: row.personRef.id })
        : null;
    return { ok: true, id: victimId, row, isNew: false, person };
  }
  return { ok: false, reason: "unsupported-victim-reference" };
}

function violenceTargetGroupKnown(s, victimId, targetGroup, evidenceIds) {
  const marker = targetGroup === "infected" ? "visible-oripathy-signs" :
    targetGroup === "sarkaz" ? "recognized-sarkaz-target" : null;
  if (!marker) return true;
  if (evidenceIds.includes(marker)) return true;
  return (violenceStateFor(s, false)?.incidents || []).some(row =>
    row.targetGroup === targetGroup && row.evidenceIds?.includes(marker) &&
    row.victims?.some(link => link.victimId === victimId)
  );
}

function violenceTraceReceiptId(resolution, eventId, actionName) {
  const choice = Number.isInteger(resolution?.choiceIndex) ? resolution.choiceIndex : 0,
    outcome = Number.isInteger(resolution?.outcomeIndex) ? resolution.outcomeIndex : 0;
  return `${eventId}:${safelyYearForViolence(resolution)}:${safelyMonthForViolence(resolution)}:${choice}:${outcome}:${actionName}`;
}
function safelyYearForViolence(resolution) { return Number.isInteger(resolution?.year) ? resolution.year : (typeof S !== "undefined" ? S.year : 0); }
function safelyMonthForViolence(resolution) { return Number.isInteger(resolution?.month) ? resolution.month : (typeof S !== "undefined" ? S.mo : 1); }

function violenceActionAssessment(s, action, resolution, eventId) {
  if (!action || typeof action !== "object" || Array.isArray(action)) return { ok: false, reason: "missing-action" };
  if (action.action === "record-belief")
    return violenceFormationAssessment(s, action, resolution, eventId);
  if (action.action === "resolve-scene") {
    const victimRefs = Array.isArray(action.victims) ? action.victims : action.victimRef ? [action.victimRef] : null;
    if (!VIOLENCE_KINDS.has(action.kind) || !VIOLENCE_CONTEXTS.has(action.context) ||
        !VIOLENCE_OUTCOMES.has(action.outcome) || typeof action.scenarioId !== "string" || !action.scenarioId.trim() ||
        typeof action.decision !== "string" || !action.decision.trim() || !eventId || !resolution ||
          !victimRefs?.length || victimRefs.length > 16 || (Array.isArray(action.victims) && action.victimRef) ||
          (action.victims != null && !Array.isArray(action.victims)) ||
          victimRefs.some(ref => !ref || typeof ref !== "object" || Array.isArray(ref)) ||
          !Array.isArray(action.witnesses) || !Array.isArray(action.evidenceIds) ||
          (action.targetGroup != null && (typeof action.targetGroup !== "string" || !action.targetGroup.trim() || action.targetGroup.length > 80)) ||
          (action.followupAfterMonths != null && (!Number.isInteger(action.followupAfterMonths) || action.followupAfterMonths < 1 || action.followupAfterMonths > 24)) ||
          action.evidenceIds.some(id => typeof id !== "string" || !id.trim()) ||
          (action.linkedExecutionIncidentId != null &&
            (typeof action.linkedExecutionIncidentId !== "string" || !action.linkedExecutionIncidentId.trim())) ||
          (action.outcome === "confirmed-death" && typeof action.deathEvidenceId !== "string"))
      return { ok: false, reason: "invalid-scene-resolution" };
    const localOrdinals = victimRefs.map((ref, index) =>
      ["anonymous-person", "collective", "incident-victim"].includes(ref.kind) ? ref.localOrdinal : index + 1);
    if (new Set(localOrdinals).size !== localOrdinals.length)
      return { ok: false, reason: "duplicate-victim-local-ordinal" };
    const militaryEvidence = {
      "combat-lethal": ["active-military-duty", "present-at-theater", "confirmed-combatant-target"],
      "unlawful-order-execution": ["active-military-duty", "present-at-scene", "order-received", "protected-person-target"],
      "command-harm": ["active-military-duty", "order-issued", "order-executed-by-unit"],
      "material-assistance": ["active-military-duty", "purpose-known"]
    };
    const lethalIntent = ["attempted-lethal", "intentional-killing", "targeted-persecution"].includes(action.kind),
      preventedLethalAct = action.outcome === "prevented" && lethalIntent;
    if (militaryEvidence[action.kind] && action.context !== "military")
      return { ok: false, reason: "military-action-needs-military-context" };
    if (action.context === "military" && militaryEvidence[action.kind] &&
        militaryEvidence[action.kind].some(id => !action.evidenceIds.includes(id)))
      return { ok: false, reason: "military-action-evidence-incomplete" };
    if (action.context === "military" &&
        ["combat-lethal", "unlawful-order-execution", "command-harm", "material-assistance", "refusal", "rescue", "withheld-help", "witness"].includes(action.kind) &&
        (!action.evidenceIds.includes("active-military-duty") || !violenceActorHasActiveMilitaryPosting(s)))
      return { ok: false, reason: "active-military-posting-required" };
    if (action.context === "military" && action.kind === "combat-lethal" &&
        (action.evidenceIds.includes("target-surrendered") || action.evidenceIds.includes("protected-person-target")))
      return { ok: false, reason: "combat-lethal-cannot-target-surrendered-or-protected-person" };
    if (action.kind === "defensive-lethal" && action.context !== "civilian-defense")
      return { ok: false, reason: "defensive-lethal-needs-defense-context" };
    if (action.context === "civilian-defense" && action.kind === "defensive-lethal" &&
        !["immediate-attack", "ongoing-attack", "armed-raid-on-farm"].some(id => action.evidenceIds.includes(id)))
      return { ok: false, reason: "defense-needs-immediate-threat-evidence" };
    const receiptId = violenceTraceReceiptId(resolution, eventId, action.action),
      state = violenceStateFor(s, false);
    if (state?.receiptIds?.includes(receiptId)) {
      const prior = state.incidents.find(row => row.effectReceiptId === receiptId);
      return prior?.actionFingerprint === JSON.stringify(action)
        ? { ok: true, duplicate: true, receiptId }
        : { ok: false, reason: "receipt-payload-mismatch" };
    }
    const capacity = violenceActorCanActInScene(s, action);
    if (!capacity.ok) return capacity;
    if (action.context === "military" && action.kind !== "combat-lethal" && action.kind !== "unlawful-order-execution" &&
        action.kind !== "refusal" && action.kind !== "rescue" && action.kind !== "witness" &&
        action.kind !== "command-harm" && action.kind !== "material-assistance")
      return { ok: false, reason: "military-action-classification" };
    if (["intentional-killing", "targeted-persecution", "attempted-lethal"].includes(action.kind) &&
        action.context === "civilian" &&
        !violenceCivilianHomicideEligible(s, action.targetGroup || "infected"))
      return { ok: false, reason: "civilian-lethal-act-lacks-formation-or-prior-assault" };
    if (["intentional-killing", "targeted-persecution", "attempted-lethal"].includes(action.kind) &&
        action.context === "organized-contract" &&
        !(s.res?.n === "カジミエーシュ" &&
          violenceRegionalAffiliationOnDuty(s, "kazimierz-armorless-union")))
      return { ok: false, reason: "active-assassin-contract-required" };
    if (action.context === "civilian-defense" && action.kind !== "defensive-lethal" && action.kind !== "rescue")
      return { ok: false, reason: "defensive-context-mismatch" };
    if (action.outcome === "confirmed-death" &&
        !["attempted-lethal", "intentional-killing", "targeted-persecution", "defensive-lethal", "combat-lethal", "unlawful-order-execution", "assault", "negligent-fatality", "command-harm", "material-assistance"].includes(action.kind))
      return { ok: false, reason: "death-outcome-without-lethal-act" };
    if (action.outcome === "confirmed-death" && action.kind === "assault" &&
        !action.evidenceIds.includes("fatal-consequence-confirmed"))
      return { ok: false, reason: "assault-fatality-needs-confirmed-fatal-consequence" };
    if (action.outcome === "confirmed-death" && action.kind === "command-harm" &&
        !action.evidenceIds.includes("subordinate-death-confirmed"))
      return { ok: false, reason: "commanded-death-needs-subordinate-result" };
    if (action.kind === "material-assistance" && action.outcome === "confirmed-death" &&
        (typeof action.linkedExecutionIncidentId !== "string" ||
          !violenceStateFor(s, false)?.incidents?.some(row => row.id === action.linkedExecutionIncidentId &&
            row.kind === "unlawful-order-execution" && row.outcome === "confirmed-death")))
      return { ok: false, reason: "assisted-death-needs-linked-confirmed-execution" };
    if (action.outcome === "confirmed-death" && !["confirmed", "observed"].includes(action.deathEvidence))
      return { ok: false, reason: "confirmed-death-evidence-required" };
    if (action.outcome === "confirmed-death" && !action.evidenceIds.includes(action.deathEvidenceId))
      return { ok: false, reason: "death-evidence-reference-missing" };
    if (action.payment != null && (!Number.isSafeInteger(action.payment) || action.payment <= 0 || action.payment > 1000000 ||
        action.context !== "organized-contract" || action.outcome !== "confirmed-death"))
      return { ok: false, reason: "payment-requires-confirmed-contract-completion" };
    if (action.authorityAction != null && !["none", "detain-and-investigate"].includes(action.authorityAction))
      return { ok: false, reason: "unsupported-authority-action" };
    if (action.witnessNorm != null &&
        !["ordinary-civilian-taboo", "violent-group-approval"].includes(action.witnessNorm))
      return { ok: false, reason: "unsupported-witness-norm" };
    if (action.witnessNorm === "violent-group-approval" &&
        !action.evidenceIds.includes("active-group-norm-explicit"))
      return { ok: false, reason: "group-approval-needs-scene-evidence" };
    const detainableCivilianHarm = action.context === "civilian" &&
      (["confirmed-death", "injured"].includes(action.outcome) || preventedLethalAct) &&
      action.evidenceIds.includes("authority-witness");
    if (action.authorityAction === "detain-and-investigate" && !detainableCivilianHarm)
      return { ok: false, reason: "detention-needs-observed-civilian-harm" };
    if (action.authorityAction === "detain-and-investigate" && !VIOLENCE_LOCAL_LEGAL_PROFILES[s.res?.n])
      return { ok: false, reason: "local-legal-profile-not-configured" };
    const victims = [], victimIds = new Set();
    for (const ref of victimRefs) {
      const victim = violenceResolveVictimRef(s, ref, receiptId, action);
      if (!victim.ok) return victim;
      if (victimIds.has(victim.id)) return { ok: false, reason: "duplicate-victim-reference" };
      victimIds.add(victim.id);
      if (["family-role", "family-person", "recorded-contact"].includes(ref.kind) &&
          !action.evidenceIds.includes("victim-present-at-scene"))
        return { ok: false, reason: "recorded-person-presence-not-established" };
      if (ref.kind === "facility-person" && !action.evidenceIds.includes("victim-present-at-facility"))
        return { ok: false, reason: "facility-person-presence-not-established" };
      if (["assault", "attempted-lethal", "intentional-killing", "targeted-persecution"].includes(action.kind) &&
          !violenceTargetGroupKnown(s, victim.id, action.targetGroup, action.evidenceIds))
        return { ok: false, reason: "target-group-not-known-to-actor" };
      if (victim.row?.actualCondition === "confirmed-dead" &&
          !(action.kind === "material-assistance" && victim.row.deathIncidentId === action.linkedExecutionIncidentId))
        return { ok: false, reason: "victim-already-dead" };
      if (action.kind === "material-assistance" && action.outcome === "confirmed-death" &&
          (!victim.row || victim.row.actualCondition !== "confirmed-dead" ||
            victim.row.deathIncidentId !== action.linkedExecutionIncidentId))
        return { ok: false, reason: "assisted-death-must-match-victim-and-execution" };
      if (victim.row?.targetGroup && action.targetGroup && victim.row.targetGroup !== action.targetGroup)
        return { ok: false, reason: "victim-target-group-mismatch" };
      victims.push({ ...victim, ref });
    }
    const witnessRows = [];
    const witnessIds = new Set();
    for (const witnessRef of action.witnesses || []) {
      const person = violenceResolvePersonRef(s, witnessRef);
      if (!person) return { ok: false, reason: "witness-not-present-or-known" };
      if (witnessIds.has(person.id)) return { ok: false, reason: "duplicate-scene-witness" };
      witnessIds.add(person.id);
      witnessRows.push({ person, ref: { kind: "family-person", id: person.id } });
    }
    for (const { ref, id: victimId } of victims) {
      if (ref.kind !== "incident-victim") continue;
      const sourceIncident = violenceLatestIncidentForEvent(s, ref.sourceEventId);
      if (sourceIncident && sourceIncident.scenarioId === action.scenarioId &&
          sourceIncident.year === s.year && sourceIncident.month === s.mo &&
          sourceIncident.victims.some(link => link.victimId === victimId))
        return { ok: false, reason: "same-incident-cannot-resolve-twice-in-one-period" };
    }
    return { ok: true, duplicate: false, receiptId, victims, victim: victims[0], witnessRows };
  }
  if (action.action === "adjudicate-case") {
    const state = violenceStateFor(s, false),
      actionReceiptId = violenceTraceReceiptId(resolution, eventId, action.action),
      prior = state?.proceedings?.find(row => row.adjudicationActionReceiptId === actionReceiptId);
    if (state?.receiptIds?.includes(actionReceiptId))
      return prior?.adjudicationActionFingerprint === JSON.stringify(action)
        ? { ok: true, duplicate: true, receiptId: actionReceiptId, proceeding: prior }
        : { ok: false, reason: "receipt-payload-mismatch" };
    const due = action.incidentId === "$due-violence-case" ? violenceNextLegalReview(s, action.caseType || null) : null,
      proceeding = state?.proceedings?.find(row => row.status === "investigation-open" &&
        (due
          ? row.reviewAt?.year === due.year && row.reviewAt?.month === due.month && (!action.caseType || row.caseType === action.caseType)
          : row.incidentId === action.incidentId));
    if (!proceeding || !Number.isInteger(proceeding.reviewAt?.year) ||
        proceeding.reviewAt.year * 12 + proceeding.reviewAt.month > (s.year || 0) * 12 + (s.mo || 1))
      return { ok: false, reason: "case-not-ready-for-adjudication" };
    if (action.caseType && proceeding.caseType !== action.caseType)
      return { ok: false, reason: "case-type-mismatch" };
    const profile = VIOLENCE_LOCAL_LEGAL_PROFILES[proceeding.jurisdiction];
    if (!profile || (proceeding.legalProfileId && proceeding.legalProfileId !== profile.id) || !profile.cases[proceeding.caseType])
      return { ok: false, reason: "case-local-law-profile-missing" };
    return { ok: true, duplicate: false, receiptId: actionReceiptId, proceeding };
  }
  if (action.action === "complete-sentence") {
    const state = violenceStateFor(s, false),
      actionReceiptId = violenceTraceReceiptId(resolution, eventId, action.action),
      prior = state?.proceedings?.find(row => row.releaseActionReceiptId === actionReceiptId);
    if (state?.receiptIds?.includes(actionReceiptId))
      return prior?.releaseActionFingerprint === JSON.stringify(action)
        ? { ok: true, duplicate: true, receiptId: actionReceiptId, proceeding: prior }
        : { ok: false, reason: "receipt-payload-mismatch" };
    const due = action.incidentId === "$due-violence-release" ? violenceNextSentenceRelease(s, action.caseType || null) : null,
      proceeding = state?.proceedings?.find(row => row.status === "convicted" &&
        (action.incidentId === "$due-violence-release"
          ? row.releaseAt?.year === due?.year && row.releaseAt?.month === due?.month && (!action.caseType || row.caseType === action.caseType)
          : row.incidentId === action.incidentId));
    if (!proceeding || !proceeding.releaseAt ||
        proceeding.releaseAt.year * 12 + proceeding.releaseAt.month > (s.year || 0) * 12 + (s.mo || 1))
      return { ok: false, reason: "sentence-not-complete" };
    return { ok: true, duplicate: false, receiptId: actionReceiptId, proceeding };
  }
  return { ok: false, reason: "unknown-action" };
}

function recordViolenceWitnessTie(s, person, incident) {
  if (typeof socialTieFor !== "function") return;
  const tie = socialTieFor(s, person, true), severe = incident.outcome === "confirmed-death",
    excusedDefense = incident.context === "civilian-defense",
    lethalIntent = ["attempted-lethal", "intentional-killing", "targeted-persecution"].includes(incident.kind),
    groupApproved = incident.witnessNorm === "violent-group-approval",
    delta = incident.context === "military" || groupApproved ? 0 :
      severe || lethalIntent ? (excusedDefense ? -12 : -42) : incident.outcome === "injured" ? -14 : 0;
  if (!tie) return;
  const before = tie.standing;
  tie.standing = clamp(before + delta, 0, 100);
  tie.lastInteractionYear = s.year;
  tie.relationship = tie.standing <= 27 ? "strained" : tie.standing >= 70 ? "trusted" : "unresolved";
  const entry = {
    year: s.year,
    personId: person.id,
    kind: violencePersonRelationKind(s, person),
    action: incident.context === "military"
      ? severe ? "witnessed-military-fatality" : "witnessed-military-violence"
      : severe ? excusedDefense ? "witnessed-defensive-fatality" : "witnessed-civilian-killing" : "witnessed-civilian-violence",
    delta: tie.standing - before,
    sourceEventId: incident.sourceEventId,
    incidentId: incident.id,
    basis: "direct-witness-to-resolved-scene"
  };
  tie.history.push(entry);
  tie.history = tie.history.slice(-24);
  const store = personTieStore(s);
  store.history.push(entry);
  store.history = store.history.slice(-90);
}

function violencePersonRelationKind(s, person) {
  if ([s.sp, s.par?.fa, s.par?.mo, ...(s.kids || []), ...(s.siblings || [])].some(row => row?.id === person?.id))
    return "family";
  if (s.friendContact?.id === person?.id || person?.kind === "friend") return "friend";
  if (s.neighborContact?.id === person?.id || person?.kind === "neighbor") return "neighbor";
  if (person?.kind === "rhodes") return "colleague";
  return "contact";
}

function violenceActorRoleForKind(kind) {
  if (kind === "command-harm") return "commander";
  if (kind === "material-assistance") return "facilitator";
  if (kind === "rescue") return "rescuer";
  if (kind === "refusal") return "refuser";
  if (kind === "witness") return "witness";
  if (kind === "withheld-help") return "withheld-helper";
  return "direct-actor";
}

function violenceApplyKnownPersonFatality(s, person, ref, incident) {
  const isFamilyMember = [s.sp, s.par?.fa, s.par?.mo, ...(s.kids || []), ...(s.siblings || []),
    ...(s.relationshipHistory || [])].some(row => row?.id === person.id);
  if (isFamilyMember) {
    person.d = s.year;
    person.actualDeathYear = s.year;
    person.deathMonth = s.mo;
    if (typeof closeDependentEmployment === "function")
      closeDependentEmployment(s, person, "death", { year: s.year, month: s.mo });
  }
  if (ref.kind === "facility-person") {
    person.actualStatus = "dead";
    person.knownStatus = "dead";
    person.lastRecordedStatus = "dead";
    person.lastKnownYear = s.year;
    person.lastUpdatedYear = s.year;
    person.history ||= [];
    person.history.push({ year: s.year, from: "working", to: "dead", basis: incident.id });
    person.history = person.history.slice(-16);
  }
  person.lifeStatus = "dead";
  person.deathYear = s.year;
  person.deathMonth = s.mo;
  person.deathKnownYear = s.year;
  person.deathCause = incident.context === "military"
    ? "軍務中の事件による死亡"
    : incident.context === "civilian-defense"
      ? "防衛行為中の死亡"
      : "暴力事件による死亡";
  person.actualDeathYear = s.year;
  person.actualDeathCause = person.deathCause;
  person.deathNoticePending = false;
  person.deathNoticeAvailableYear = s.year;
  person.deathNoticeChannel = "direct-witness";
  if (Array.isArray(person.lifeHistory)) {
    person.lifeHistory.push({ year: s.year, status: "dead", cause: person.deathCause });
    person.lifeHistory = person.lifeHistory.slice(-12);
  }
  if (person.id === s.sp?.id && typeof reconcileRelationshipStatusFlags === "function")
    reconcileRelationshipStatusFlags(s);
}

function applyViolenceAction(s, action, resolution = TRACE_RESOLUTION, eventId = resolution?.id) {
  const assessment = violenceActionAssessment(s, action, resolution, eventId);
  if (!assessment.ok) throw Error(`暴力事件の効果を適用できない: ${assessment.reason}`);
  if (assessment.duplicate) return { duplicate: true, receiptId: assessment.receiptId || assessment.evidenceId };
  if (action.action === "record-belief") return violenceApplyFormation(s, action, resolution, eventId);
  const state = violenceStateFor(s), traceId = assessment.receiptId,
    incidentId = `violence:${traceId}`,
    targetRows = (assessment.victims || [assessment.victim]).map(({ ref, id, row, person }, index) => {
      const targetPersonRef = person
        ? row?.personRef || (ref.kind === "facility-person"
          ? { kind: "facility-person", areaKey: ref.areaKey, personId: ref.personId }
          : { kind: "family-person", id: person.id })
        : null,
        localOrdinal = ["anonymous-person", "collective", "incident-victim"].includes(ref.kind)
          ? ref.localOrdinal : index + 1,
        victim = row || {
          id,
          kind: ref.kind === "anonymous-person" ? "anonymous-person" :
            ref.kind === "collective" ? "collective" : targetPersonRef ? "known-person" : "incident-victim",
          localOrdinal,
          sourceEventId: ref.kind === "incident-victim" ? ref.sourceEventId : eventId,
          personRef: targetPersonRef,
          targetGroup: action.targetGroup || null,
          actualCondition: action.outcome === "unresolved" ? "unresolved" : "alive",
          deathCertainty: null,
          createdAt: { year: s.year, month: s.mo },
          firstIncidentId: incidentId
        };
      if (!row) state.victims[id] = victim;
      return { ref, id, row: victim, person, personRef: targetPersonRef, localOrdinal,
        linkedPriorDeath: action.kind === "material-assistance" && victim.actualCondition === "confirmed-dead" };
    }),
    outcome = action.outcome,
    deathTargets = outcome === "confirmed-death" ? targetRows.filter(row => !row.linkedPriorDeath) : [],
    incident = {
      id: incidentId,
      sourceEventId: eventId,
      scenarioId: action.scenarioId,
      year: s.year,
      month: s.mo,
      region: s.res?.n || null,
      kind: action.kind,
      context: action.context,
      decision: action.decision,
      targetGroup: action.targetGroup || null,
      outcome,
      deathEvidence: outcome === "confirmed-death" ? action.deathEvidence : null,
      deathEvidenceId: outcome === "confirmed-death" ? action.deathEvidenceId : null,
      actionFingerprint: JSON.stringify(action),
      actors: [{ kind: "protagonist", role: violenceActorRoleForKind(action.kind) }],
      victims: targetRows.map(row => ({ victimId: row.id, localOrdinal: row.localOrdinal, conditionAtResolution: outcome })),
      witnesses: assessment.witnessRows.map(row => ({
        ref: row.ref,
        knowledge: "direct",
        learnedAt: { year: s.year, month: s.mo },
        response: "not-assessed"
      })),
      authorityAction: action.authorityAction || "none",
      witnessNorm: action.witnessNorm || "ordinary-civilian-taboo",
      evidenceIds: Array.isArray(action.evidenceIds) ? [...action.evidenceIds] : [],
      effectReceiptId: traceId,
      linkedIncidentId: action.linkedExecutionIncidentId || null,
      nextSceneAt: action.followupAfterMonths ? violencePeriod(s.year, s.mo, action.followupAfterMonths) : null,
      followupSceneUsed: false
    };
  for (const target of targetRows) {
    if (outcome === "confirmed-death" && !target.linkedPriorDeath) {
      target.row.actualCondition = "confirmed-dead";
      target.row.deathCertainty = action.deathEvidence;
      target.row.deathAt = { year: s.year, month: s.mo };
      target.row.deathIncidentId = incidentId;
      target.row.cause = action.kind;
      if (target.person) violenceApplyKnownPersonFatality(s, target.person, target.personRef || target.ref, incident);
    } else if (outcome === "injured") target.row.actualCondition = "injured";
    else if (["escaped", "prevented", "no-injury"].includes(outcome) && target.row.actualCondition !== "injured")
      target.row.actualCondition = "alive";
  }
  const followupSourceIds = new Set(targetRows.filter(row => row.ref.kind === "incident-victim" && action.kind !== "material-assistance")
    .map(row => row.ref.sourceEventId));
  for (const sourceEventId of followupSourceIds) {
    const prior = violenceLatestIncidentForEvent(s, sourceEventId);
    if (prior) prior.followupSceneUsed = true;
  }
  state.incidents.push(incident);
  state.incidentOrder.push(incident.id);
  state.receiptIds.push(traceId);
  const victimCount = incident.victims.length;
  if (action.kind === "assault") {
    if (outcome === "injured") state.counters.nonlethalAssaults += victimCount;
  } else if (action.kind === "attempted-lethal" || action.kind === "intentional-killing" || action.kind === "targeted-persecution") {
    if (outcome !== "confirmed-death") state.counters.attemptedLethalActs += victimCount;
  }
  if (outcome === "confirmed-death" && deathTargets.length &&
      ["attempted-lethal", "intentional-killing", "targeted-persecution", "defensive-lethal", "combat-lethal", "unlawful-order-execution", "assault", "negligent-fatality"].includes(action.kind))
    state.counters.directDeaths += deathTargets.length;
  if (outcome === "confirmed-death" && action.kind === "command-harm") state.counters.commandedDeaths += victimCount;
  if (outcome === "confirmed-death" && action.kind === "material-assistance") state.counters.assistedDeaths += victimCount;
  if (action.kind === "command-harm") state.counters.commandHarm++;
  if (action.kind === "material-assistance") state.counters.materialAssistance++;
  if (outcome === "confirmed-death") state.counters.witnessedFatalities += victimCount * incident.witnesses.length;
  const lethalIntent = ["attempted-lethal", "intentional-killing", "targeted-persecution"].includes(action.kind);
  for (const { person } of assessment.witnessRows) {
    recordViolenceWitnessTie(s, person, incident);
    state.awareness.push({
      personId: person.id,
      incidentId,
      sourceEventId: eventId,
      knowledge: "direct",
      relationshipKind: violencePersonRelationKind(s, person),
      year: s.year,
      month: s.mo,
      relationshipEffect: action.context === "military" || action.witnessNorm === "violent-group-approval" ? "none" :
        action.context === "civilian-defense" ? "distressed-but-not-taboo" :
          outcome === "confirmed-death" || lethalIntent ? "severed-routine-contact" : "strained"
    });
    if (!new Set(["military", "civilian-defense"]).has(action.context) &&
        (outcome === "confirmed-death" || lethalIntent) &&
        action.witnessNorm !== "violent-group-approval") {
      state.familyContactBlocks.push({ personId: person.id, incidentId, openedAt: { year: s.year, month: s.mo }, status: "active" });
      if (person.id === s.sp?.id) person.violenceContactBoundary = "no-routine-contact";
    }
  }
  if (action.authorityAction === "detain-and-investigate") {
    const reviewAt = violencePeriod(s.year, s.mo, 3);
    state.proceedings.push({
      incidentId,
      status: "investigation-open",
      caseType: outcome === "confirmed-death" ? "civilian-homicide" :
        ["attempted-lethal", "intentional-killing", "targeted-persecution"].includes(action.kind)
          ? "attempted-civilian-homicide" : "serious-civilian-assault",
      jurisdiction: s.res?.n || null,
      legalProfileId: VIOLENCE_LOCAL_LEGAL_PROFILES[s.res?.n]?.id || null,
      basis: VIOLENCE_LOCAL_LEGAL_PROFILES[s.res?.n]?.basis || "local-legal-profile-not-configured",
      openedAt: { year: s.year, month: s.mo },
      hadEmploymentAtOpen: !!(s.job || (typeof currentPlayerEmployment === "function" && currentPlayerEmployment(s))),
      reviewAt,
      releaseAt: null,
      sentence: null
    });
    s.fl.detained = 1;
    if (typeof currentPlayerEmployment === "function" && currentPlayerEmployment(s) &&
        typeof changeEmploymentAvailability === "function")
      changeEmploymentAvailability(s, { action: "suspend", reason: "custody-pending-civilian-homicide-review" });
  }
  let cashDelta = 0;
  if (action.payment && outcome === "confirmed-death") cashDelta = action.payment;
  violenceCompactHistory(s);
  return { duplicate: false, incidentId, receiptId: traceId, cashDelta };
}

function violenceApplyLegalAction(s, action, assessment) {
  const state = violenceStateFor(s), proceeding = assessment.proceeding;
  if (action.action === "adjudicate-case") {
    proceeding.adjudicationActionReceiptId = assessment.receiptId;
    proceeding.adjudicationActionFingerprint = JSON.stringify(action);
    proceeding.status = "convicted";
    const profile = VIOLENCE_LOCAL_LEGAL_PROFILES[proceeding.jurisdiction],
      sentenceTerms = profile?.cases?.[proceeding.caseType];
    if (!profile || (proceeding.legalProfileId && proceeding.legalProfileId !== profile.id) || !sentenceTerms)
      throw Error("地域の法制度モデルが審理時に利用できない");
    const { years, fine } = sentenceTerms;
    proceeding.sentence = { kind: "custody-and-fine", years, fine, basis: "game-assumption-local-civic-adjudication" };
    proceeding.employmentEndedBySentence = !!proceeding.hadEmploymentAtOpen;
    proceeding.adjudicatedAt = { year: s.year, month: s.mo };
    proceeding.releaseAt = violencePeriod(s.year, s.mo, years * 12);
    state.receiptIds.push(assessment.receiptId);
    if (typeof currentPlayerEmployment === "function" && currentPlayerEmployment(s) && typeof endPlayerEmployment === "function")
      endPlayerEmployment(s, "criminal-custody");
    else if (s.job) {
      const priorJob = s.job;
      s.job = 0;
      if (typeof recordCareerChange === "function") recordCareerChange(s, priorJob, 0);
    }
    return { duplicate: false, receiptId: assessment.receiptId, cashDelta: -fine };
  }
  if (action.action === "complete-sentence") {
    proceeding.releaseActionReceiptId = assessment.receiptId;
    proceeding.releaseActionFingerprint = JSON.stringify(action);
    proceeding.status = "sentence-served";
    proceeding.completedAt = { year: s.year, month: s.mo };
    state.receiptIds.push(assessment.receiptId);
    s.fl.detained = 0;
    if (typeof reconcileRelationshipStatusFlags === "function") reconcileRelationshipStatusFlags(s);
    return { duplicate: false, receiptId: assessment.receiptId, cashDelta: 0 };
  }
  throw Error("未知の法的事後処理");
}

function applyViolenceLegalAction(s, action, resolution = TRACE_RESOLUTION, eventId = resolution?.id) {
  const assessment = violenceActionAssessment(s, action, resolution, eventId);
  if (!assessment.ok) throw Error(`法的事後処理を適用できない: ${assessment.reason}`);
  if (assessment.duplicate) return { duplicate: true, receiptId: assessment.receiptId };
  return violenceApplyLegalAction(s, action, assessment);
}
