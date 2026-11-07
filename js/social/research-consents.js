function createResearchConsentState() {
  return { version: 1, sequence: 0, offers: [], procedures: [], completedArchive: [], terminalIds: [], lastOfferAt: null };
}

function ensureResearchConsentState(s) {
  if (!s.researchConsents) s.researchConsents = createResearchConsentState();
  return s.researchConsents;
}

function isValidResearchConsentState(state, year) {
  if (!state || state.version !== 1 || !Number.isInteger(state.sequence) || state.sequence < 0 ||
      !Array.isArray(state.offers) || state.offers.length > 16 ||
      !Array.isArray(state.procedures) || state.procedures.length > 24 ||
      !Array.isArray(state.completedArchive) || state.completedArchive.length > 64 ||
      !Array.isArray(state.terminalIds) || state.terminalIds.length > 512 ||
      new Set(state.terminalIds).size !== state.terminalIds.length) return false;
  const ids = new Set();
  for (const row of state.offers) {
    if (!row || typeof row.id !== "string" || !row.id || ids.has(row.id) ||
        typeof row.clinicId !== "string" || !row.clinicId || typeof row.areaKey !== "string" || !row.areaKey ||
        typeof row.researcherId !== "string" || !row.researcherId || row.scope !== "observation-only" ||
        !["offered", "briefing-attended", "consented", "deferred", "refused", "withdrawn", "procedure-complete", "followed-up"].includes(row.status) ||
        !Number.isInteger(row.offeredAt?.year) || row.offeredAt.year > year ||
        !Number.isInteger(row.offeredAt?.month) || row.offeredAt.month < 1 || row.offeredAt.month > 12 ||
        (row.status === "consented" && !row.consentAt) ||
        (["refused", "deferred", "withdrawn"].includes(row.status) && row.procedureAt)) return false;
    ids.add(row.id);
  }
  return state.procedures.every(row => row && typeof row.id === "string" && !!row.id && ids.has(row.offerId) &&
    typeof row.sourceEventId === "string" && !!row.sourceEventId && row.kind === "non-invasive-observation" &&
    Number.isInteger(row.year) && row.year <= year && Number.isInteger(row.month) && row.month >= 1 && row.month <= 12) &&
    state.completedArchive.every(row => row && typeof row.key === "string" && !!row.key &&
      Number.isInteger(row.year) && row.year <= year && Number.isInteger(row.lastYear) &&
      row.lastYear >= row.year && row.lastYear <= year && typeof row.areaKey === "string" && !!row.areaKey &&
      Number.isInteger(row.count) && row.count > 0 && row.count <= 100000 &&
      Number.isInteger(row.procedureCount) && row.procedureCount >= 0 && row.procedureCount <= row.count);
}

function activeResearchOffer(s, statuses = ["offered", "briefing-attended", "consented", "procedure-complete"]) {
  return (s?.researchConsents?.offers || []).filter(row => row.areaKey === s?.community?.key && statuses.includes(row.status))
    .sort((a, b) => a.offeredAt.year - b.offeredAt.year || a.offeredAt.month - b.offeredAt.month || a.id.localeCompare(b.id))[0] || null;
}

function compactResearchConsentHistory(s, reserveOffer = false, reserveProcedure = false) {
  const state = s?.researchConsents;
  if (!state) return;
  const terminal = state.offers.filter(row => ["deferred", "refused", "withdrawn", "followed-up"].includes(row.status))
    .sort((a, b) => a.offeredAt.year - b.offeredAt.year || a.offeredAt.month - b.offeredAt.month || a.id.localeCompare(b.id));
  const archiveOffer = row => {
    const year = row.offeredAt.year, key = `${year}:${row.areaKey}:${row.status}`,
      summary = state.completedArchive.find(item => item.key === key),
      hadProcedure = state.procedures.some(item => item.offerId === row.id);
    if (summary) { summary.count++; summary.procedureCount += hadProcedure ? 1 : 0; summary.lastYear = Math.max(summary.lastYear, year); }
    else state.completedArchive.push({ key, year, lastYear: year, areaKey: row.areaKey, count: 1, procedureCount: hadProcedure ? 1 : 0 });
    state.procedures = state.procedures.filter(item => item.offerId !== row.id);
    state.terminalIds.push(row.id);
    state.offers.splice(state.offers.findIndex(item => item.id === row.id), 1);
  };
  while (state.offers.length >= (reserveOffer ? 16 : 17) && terminal.length) archiveOffer(terminal.shift());
  while (state.procedures.length >= (reserveProcedure ? 24 : 25)) {
    const oldest = state.offers.find(row => row.status === "followed-up" && state.procedures.some(item => item.offerId === row.id));
    if (!oldest) break;
    const index = terminal.findIndex(row => row.id === oldest.id);
    if (index >= 0) terminal.splice(index, 1);
    archiveOffer(oldest);
  }
  if (state.completedArchive.length > 64) {
    const oldest = state.completedArchive.splice(0, state.completedArchive.length - 63),
      year = Math.min(...oldest.map(row => row.year)), lastYear = Math.max(...oldest.map(row => row.lastYear));
    state.completedArchive.unshift({ key: `older:${year}-${lastYear}`, year, lastYear, areaKey: "mixed",
      count: oldest.reduce((sum, row) => sum + row.count, 0),
      procedureCount: oldest.reduce((sum, row) => sum + row.procedureCount, 0) });
  }
  if (state.terminalIds.length > 512) state.terminalIds.splice(0, state.terminalIds.length - 512);
}

function advanceResearchConsents(s) {
  const state = ensureResearchConsentState(s);
  if (!s?.community?.key || !s.inf || s.age < 18 || !Number.isInteger(s.mo) || s.mo < 1 || s.mo > 12) return;
  const clinic = Object.values(s.community.facilities || {}).find(row => row.kind === "clinic" && row.status !== "closed"),
    active = state.offers.some(row => row.areaKey === s.community.key && ["offered", "briefing-attended", "consented", "procedure-complete"].includes(row.status)),
    last = state.lastOfferAt && state.lastOfferAt.year * 12 + state.lastOfferAt.month,
    period = s.year * 12 + s.mo;
  compactResearchConsentHistory(s, true);
  if (!clinic || active || state.offers.length >= 16 || last && period - last < 60 ||
      keyedRoll(`research-offer-v1:${s.personId || "protagonist"}:${s.community.key}:${s.year}:${s.mo}`) >= 0.025) return;
  const id = `research:${s.personId || "protagonist"}:${++state.sequence}`;
  state.offers.push({ id, clinicId: clinic.id, areaKey: s.community.key,
    researcherId: `clinic-research-team:${clinic.id}`, participantId: s.personId || "protagonist",
    scope: "observation-only", status: "offered", offeredAt: { year: s.year, month: s.mo },
    consentAt: null, procedureAt: null, procedureDueAt: null, followupDueAt: null,
    interventionApplied: false, compensation: 0, source: "local-clinic-game-model-study" });
  state.lastOfferAt = { year: s.year, month: s.mo };
}

function applyResearchConsentAction(s, action, sourceEventId) {
  const offer = action?.targetId ? s?.researchConsents?.offers?.find(row => row.id === action.targetId) : activeResearchOffer(s);
  if (!offer || !action || !sourceEventId || offer.areaKey !== s.community?.key) return false;
  if (action.action === "attend-briefing" && offer.status === "offered" && s.age >= 18 &&
      s.community.facilities?.[offer.clinicId]) {
    offer.status = "briefing-attended";
    offer.briefingAt = { year: s.year, month: s.mo, sourceEventId, participantId: offer.participantId,
      scope: "research purpose and procedure described; no participation consent recorded" };
    return true;
  }
  if (action.action === "consent" && offer.status === "briefing-attended" && offer.briefingAt && s.age >= 18 &&
      s.community.facilities?.[offer.clinicId]) {
    offer.status = "consented";
    offer.consentAt = { year: s.year, month: s.mo, sourceEventId, participantId: offer.participantId,
      scope: "non-invasive observation only; may withdraw before or during the visit" };
    const due = s.year * 12 + s.mo + 1;
    offer.procedureDueAt = { year: Math.floor((due - 1) / 12), month: ((due - 1) % 12) + 1 };
    return true;
  }
  if (["defer", "refuse"].includes(action.action) && offer.status === "offered") {
    offer.status = action.action === "defer" ? "deferred" : "refused";
    offer.respondedAt = { year: s.year, month: s.mo, sourceEventId };
    return true;
  }
  if (action.action === "procedure" && offer.status === "consented" && offer.consentAt &&
      offer.procedureDueAt && s.year * 12 + s.mo >= offer.procedureDueAt.year * 12 + offer.procedureDueAt.month &&
      s.community.facilities?.[offer.clinicId] && !offer.interventionApplied) {
    compactResearchConsentHistory(s, false, true);
    if (s.researchConsents.procedures.length >= 24) return false;
    const id = `${offer.id}:procedure`;
    if (s.researchConsents.procedures.some(row => row.id === id)) return false;
    s.researchConsents.procedures.push({ id, offerId: offer.id, year: s.year, month: s.mo,
      sourceEventId, kind: "non-invasive-observation", result: "observation-recorded-no-treatment-change" });
    offer.status = "procedure-complete";
    offer.procedureAt = { year: s.year, month: s.mo, sourceEventId, procedureId: id };
    const due = s.year * 12 + s.mo + 1;
    offer.followupDueAt = { year: Math.floor((due - 1) / 12), month: ((due - 1) % 12) + 1 };
    return true;
  }
  if (action.action === "withdraw" && offer.status === "consented" && !offer.procedureAt) {
    offer.status = "withdrawn";
    offer.withdrawnAt = { year: s.year, month: s.mo, sourceEventId };
    return true;
  }
  if (action.action === "followup" && offer.status === "procedure-complete" && offer.procedureAt &&
      s.year * 12 + s.mo >= offer.followupDueAt.year * 12 + offer.followupDueAt.month) {
    offer.status = "followed-up";
    offer.followupAt = action.mode === "decline"
      ? { year: s.year, month: s.mo, sourceEventId, declined: true }
      : { year: s.year, month: s.mo, sourceEventId,
          healthObserved: s.h, infectionLoadObserved: s.ob, declined: false };
    return true;
  }
  return false;
}
