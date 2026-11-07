function createCatastropheWarningState() {
  return { version: 1, sequence: 0, items: [], completedArchive: [], terminalIds: [], lastGeneratedPeriod: null };
}

function ensureCatastropheWarningState(s) {
  if (!s.catastropheWarnings) s.catastropheWarnings = createCatastropheWarningState();
  return s.catastropheWarnings;
}

function isValidCatastropheWarningState(state, year) {
  if (!state || state.version !== 1 || !Number.isInteger(state.sequence) || state.sequence < 0 ||
      !Array.isArray(state.items) || state.items.length > 32 ||
      !Array.isArray(state.completedArchive) || state.completedArchive.length > 64 ||
      !Array.isArray(state.terminalIds) || state.terminalIds.length > 512 ||
      new Set(state.terminalIds).size !== state.terminalIds.length) return false;
  const ids = new Set();
  for (const row of state.items) {
    if (!row || typeof row.id !== "string" || !row.id || ids.has(row.id) ||
        typeof row.areaKey !== "string" || !row.areaKey ||
        !["power", "water", "route"].includes(row.expectedKind) ||
        !["issued", "received", "responded", "resolved", "expired"].includes(row.status) ||
        !Number.isInteger(row.issuedAt?.year) || row.issuedAt.year > year ||
        !Number.isInteger(row.issuedAt?.month) || row.issuedAt.month < 1 || row.issuedAt.month > 12 ||
        !Number.isInteger(row.dueAt?.year) || !Number.isInteger(row.dueAt?.month) ||
        row.dueAt.month < 1 || row.dueAt.month > 12 ||
        (row.receivedAt && (!Number.isInteger(row.receivedAt.year) || !Number.isInteger(row.receivedAt.month))) ||
        (row.result != null && !["observed", "no-disruption"].includes(row.result))) return false;
    if (["responded", "resolved"].includes(row.status) && row.receivedAt == null) return false;
    ids.add(row.id);
  }
  return (Number.isInteger(state.lastGeneratedPeriod) || state.lastGeneratedPeriod === null) &&
    state.completedArchive.every(row => row && typeof row.key === "string" && !!row.key &&
      Number.isInteger(row.year) && row.year <= year && Number.isInteger(row.lastYear) &&
      row.lastYear >= row.year && row.lastYear <= year && typeof row.areaKey === "string" && !!row.areaKey &&
      Number.isInteger(row.count) && row.count > 0 && row.count <= 100000);
}

function compactCatastropheWarningHistory(state, reserveSlot = false) {
  const terminal = state.items.filter(row => ["resolved", "expired"].includes(row.status))
    .sort((a, b) => a.issuedAt.year - b.issuedAt.year || a.issuedAt.month - b.issuedAt.month || a.id.localeCompare(b.id));
  while (state.items.length >= (reserveSlot ? 32 : 33) && terminal.length) {
    const row = terminal.shift(), key = `${row.issuedAt.year}:${row.areaKey}`,
      summary = state.completedArchive.find(item => item.key === key);
    if (summary) { summary.count++; summary.lastYear = Math.max(summary.lastYear, row.issuedAt.year); }
    else state.completedArchive.push({ key, year: row.issuedAt.year, lastYear: row.issuedAt.year,
      areaKey: row.areaKey, count: 1 });
    state.terminalIds.push(row.id);
    state.items.splice(state.items.findIndex(item => item.id === row.id), 1);
  }
  if (state.completedArchive.length > 64) {
    const oldest = state.completedArchive.splice(0, state.completedArchive.length - 63),
      year = Math.min(...oldest.map(row => row.year)), lastYear = Math.max(...oldest.map(row => row.lastYear));
    state.completedArchive.unshift({ key: `older:${year}-${lastYear}`, year, lastYear,
      areaKey: "mixed", count: oldest.reduce((sum, row) => sum + row.count, 0) });
  }
  if (state.terminalIds.length > 512) state.terminalIds.splice(0, state.terminalIds.length - 512);
}

function activeCatastropheWarning(s, statuses = ["issued", "received"]) {
  const areaKey = s?.community?.key;
  return (s?.catastropheWarnings?.items || []).filter(row => row.areaKey === areaKey && statuses.includes(row.status))
    .sort((a, b) => a.issuedAt.year - b.issuedAt.year || a.issuedAt.month - b.issuedAt.month || a.id.localeCompare(b.id))[0] || null;
}

function latestCatastropheWarning(s, statuses = ["issued", "received", "responded", "resolved", "expired"]) {
  return (s?.catastropheWarnings?.items || []).filter(row => row.areaKey === s?.community?.key && statuses.includes(row.status))
    .sort((a, b) => b.issuedAt.year - a.issuedAt.year || b.issuedAt.month - a.issuedAt.month || b.id.localeCompare(a.id))[0] || null;
}

function catastrophePeriod(year, month) { return year * 12 + month; }

function advanceCatastropheWarnings(s) {
  if (!s?.community?.key || !Number.isInteger(s.mo) || s.mo < 1 || s.mo > 12) return;
  const state = ensureCatastropheWarningState(s), period = catastrophePeriod(s.year, s.mo);
  if (state.lastGeneratedPeriod !== period) {
    state.lastGeneratedPeriod = period;
    const active = state.items.some(row => row.areaKey === s.community.key && ["issued", "received", "responded"].includes(row.status));
    compactCatastropheWarningHistory(state, true);
    const roll = keyedRoll(`local-warning-v1:${s.community.key}:${s.year}:${s.mo}`);
    if (!active && state.items.length < 32 && roll < 0.08) {
      const choice = keyedRoll(`local-warning-kind-v1:${s.community.key}:${s.year}:${s.mo}`),
        expectedKind = choice < 0.34 ? "power" : choice < 0.67 ? "water" : "route",
        duePeriod = period + 2,
        dueAt = { year: Math.floor((duePeriod - 1) / 12), month: ((duePeriod - 1) % 12) + 1 },
        id = `warning:${s.community.key}:${s.year}:${s.mo}:${++state.sequence}`;
      state.items.push({ id, areaKey: s.community.key, region: s.res.n, expectedKind,
        issuedAt: { year: s.year, month: s.mo }, dueAt, status: "issued", receivedAt: null,
        response: null, result: null, source: "local-game-model-forecast" });
    }
  }
  for (const warning of state.items) {
    if (!["issued", "received", "responded"].includes(warning.status) ||
        catastrophePeriod(s.year, s.mo) < catastrophePeriod(warning.dueAt.year, warning.dueAt.month)) continue;
    if (warning.status === "issued") warning.status = "expired";
    else {
      warning.result = keyedRoll(`local-warning-result-v1:${warning.id}`) < 0.28 ? "observed" : "no-disruption";
      warning.status = "resolved";
      warning.resolvedAt = { year: s.year, month: s.mo };
    }
  }
  compactCatastropheWarningHistory(state);
}

function applyCatastropheWarningAction(s, action) {
  const warning = ["review", "feedback"].includes(action?.action)
    ? latestCatastropheWarning(s, ["resolved"])
    : activeCatastropheWarning(s);
  if (!warning || !action || typeof action.action !== "string") return false;
  if (action.action === "receive") {
    warning.status = "received";
    warning.receivedAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "respond") {
    if (warning.status !== "received" || !["prepare", "keep-schedule", "ask-source"].includes(action.mode)) return false;
    warning.response = action.mode;
    warning.respondedAt = { year: s.year, month: s.mo };
    warning.status = "responded";
    return true;
  }
  if (action.action === "review" && warning.status === "resolved" && warning.receivedAt) {
    warning.reviewedAt ||= { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "feedback" && warning.status === "resolved" && warning.respondedAt) {
    warning.feedbackAt ||= { year: s.year, month: s.mo };
    return true;
  }
  return false;
}
