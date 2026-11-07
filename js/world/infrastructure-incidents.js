function createInfrastructureIncidentState() {
  return { version: 1, sequence: 0, items: [], completedArchive: [], terminalIds: [], lastGeneratedPeriod: null };
}

function ensureInfrastructureIncidentState(s) {
  if (!s.infrastructureIncidents) s.infrastructureIncidents = createInfrastructureIncidentState();
  return s.infrastructureIncidents;
}

function isValidInfrastructureIncidentState(state, year) {
  if (!state || state.version !== 1 || !Number.isInteger(state.sequence) || state.sequence < 0 ||
      !Array.isArray(state.items) || state.items.length > 32 ||
      !Array.isArray(state.completedArchive) || state.completedArchive.length > 64 ||
      !Array.isArray(state.terminalIds) || state.terminalIds.length > 512 ||
      new Set(state.terminalIds).size !== state.terminalIds.length) return false;
  const ids = new Set();
  for (const row of state.items) {
    if (!row || typeof row.id !== "string" || !row.id || ids.has(row.id) ||
        typeof row.areaKey !== "string" || !row.areaKey ||
        !["power", "water", "route"].includes(row.kind) ||
        !["active", "repair-requested", "repair-ready", "repaired", "closed"].includes(row.status) ||
        !Number.isInteger(row.startedAt?.year) || row.startedAt.year > year ||
        !Number.isInteger(row.startedAt?.month) || row.startedAt.month < 1 || row.startedAt.month > 12 ||
        typeof row.impactApplied !== "boolean" || typeof row.recoveryApplied !== "boolean" ||
        !Number.isFinite(row.metricDelta) || row.metricDelta <= 0 || row.metricDelta > 0.1 ||
        !["jobs", "medical", "transport"].includes(row.metricAxis) ||
        (row.status === "repaired" && !row.recoveryApplied) ||
        ["acknowledgedAt", "responseAt", "lastReviewedAt", "repairRequestedAt", "verifiedAt"].some(key => row[key] != null &&
          (!Number.isInteger(row[key].year) || row[key].year > year || !Number.isInteger(row[key].month) ||
           row[key].month < 1 || row[key].month > 12)) ||
        (row.repairShipmentId != null && typeof row.repairShipmentId !== "string")) return false;
    ids.add(row.id);
  }
  return (Number.isInteger(state.lastGeneratedPeriod) || state.lastGeneratedPeriod === null) &&
    state.completedArchive.every(row => row && typeof row.key === "string" && !!row.key &&
      Number.isInteger(row.year) && row.year <= year && Number.isInteger(row.lastYear) &&
      row.lastYear >= row.year && row.lastYear <= year && typeof row.areaKey === "string" && !!row.areaKey &&
      Number.isInteger(row.count) && row.count > 0 && row.count <= 100000);
}

function compactInfrastructureIncidentHistory(state, reserveSlot = false) {
  const terminal = state.items.filter(row => ["repaired", "closed"].includes(row.status))
    .sort((a, b) => a.startedAt.year - b.startedAt.year || a.startedAt.month - b.startedAt.month || a.id.localeCompare(b.id));
  while (state.items.length >= (reserveSlot ? 32 : 33) && terminal.length) {
    const row = terminal.shift(), key = `${row.startedAt.year}:${row.areaKey}`,
      summary = state.completedArchive.find(item => item.key === key);
    if (summary) { summary.count++; summary.lastYear = Math.max(summary.lastYear, row.startedAt.year); }
    else state.completedArchive.push({ key, year: row.startedAt.year, lastYear: row.startedAt.year,
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

function activeInfrastructureIncident(s, kinds = ["power", "water", "route"]) {
  return (s?.infrastructureIncidents?.items || []).filter(row =>
    row.areaKey === s?.community?.key && kinds.includes(row.kind) &&
    ["active", "repair-requested", "repair-ready"].includes(row.status))
    .sort((a, b) => a.startedAt.year - b.startedAt.year || a.startedAt.month - b.startedAt.month || a.id.localeCompare(b.id))[0] || null;
}

function infrastructureIncidentById(s, id) {
  return (s?.infrastructureIncidents?.items || []).find(row => row.id === id) || null;
}

function infrastructureMetricAxis(kind) {
  return kind === "power" ? "jobs" : kind === "water" ? "medical" : "transport";
}

function applyInfrastructureImpact(s, incident, delta) {
  if (!s?.community || s.community.key !== incident.areaKey) return false;
  const axis = incident.metricAxis, before = s.community.metrics?.[axis];
  if (!Number.isFinite(before)) return false;
  s.community.metrics[axis] = Math.max(0.08, Math.min(1, before + delta));
  s.community.actions ||= [];
  s.community.actions.push({ year: s.year, month: s.mo, kind: "infrastructure-incident",
    incidentId: incident.id, axis, delta: Number((s.community.metrics[axis] - before).toFixed(3)) });
  s.community.actions = s.community.actions.slice(-40);
  return true;
}

function advanceInfrastructureIncidents(s) {
  if (!s?.community?.key || !Number.isInteger(s.mo) || s.mo < 1 || s.mo > 12) return;
  const state = ensureInfrastructureIncidentState(s), period = s.year * 12 + s.mo;
  if (state.lastGeneratedPeriod === period) return;
  state.lastGeneratedPeriod = period;
  compactInfrastructureIncidentHistory(state, true);
  const unresolved = state.items.some(row => row.areaKey === s.community.key &&
    ["active", "repair-requested", "repair-ready"].includes(row.status));
  if (unresolved || state.items.length >= 32 || keyedRoll(`local-infrastructure-v1:${s.community.key}:${s.year}:${s.mo}`) >= 0.025) return;
  const kindRoll = keyedRoll(`local-infrastructure-kind-v1:${s.community.key}:${s.year}:${s.mo}`),
    kind = kindRoll < 0.34 ? "power" : kindRoll < 0.67 ? "water" : "route",
    incident = { id: `incident:${s.community.key}:${s.year}:${s.mo}:${++state.sequence}`,
      areaKey: s.community.key, region: s.res.n, city: s.local?.city || null, kind,
      status: "active", startedAt: { year: s.year, month: s.mo },
      metricAxis: infrastructureMetricAxis(kind), metricDelta: 0.035,
      impactApplied: false, recoveryApplied: false, repairShipmentId: null,
      source: "local-game-model-infrastructure-observation" };
  state.items.push(incident);
  if (applyInfrastructureImpact(s, incident, -incident.metricDelta)) incident.impactApplied = true;
}

function activeInfrastructureDisruption(s, kind = null) {
  return (s?.infrastructureIncidents?.items || []).some(row => row.areaKey === s?.community?.key &&
    (!kind || row.kind === kind) && ["active", "repair-requested", "repair-ready"].includes(row.status));
}

function applyInfrastructureIncidentAction(s, action) {
  const incident = activeInfrastructureIncident(s);
  if (!incident || !action || typeof action.action !== "string") return false;
  if (action.action === "acknowledge") {
    if (incident.acknowledgedAt && s.year * 12 + s.mo -
        (incident.acknowledgedAt.year * 12 + incident.acknowledgedAt.month) < 12) return false;
    incident.acknowledgedAt = { year: s.year, month: s.mo };
    incident.lastReviewedAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "respond") {
    if (!["active", "repair-requested", "repair-ready"].includes(incident.status) ||
        !["work-stop", "alternate", "notify"].includes(action.mode) ||
        incident.responseAt && s.year * 12 + s.mo -
          (incident.responseAt.year * 12 + incident.responseAt.month) < 12) return false;
    incident.acknowledgedAt ||= { year: s.year, month: s.mo };
    incident.response = action.mode;
    incident.responseAt = { year: s.year, month: s.mo };
    incident.lastReviewedAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "request-repair") {
    if (incident.status !== "active" || incident.repairShipmentId || typeof createRepairPartsShipment !== "function") return false;
    const shipment = createRepairPartsShipment(s, incident);
    if (!shipment) return false;
    incident.repairShipmentId = shipment.id;
    incident.status = "repair-requested";
    incident.repairRequestedAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "verify-repair") {
    const shipment = incident.repairShipmentId && findShipment(s, incident.repairShipmentId),
      worksite = typeof artsCurrentWorksite === "function" ? artsCurrentWorksite(s) : null;
    if (incident.status !== "repair-requested" || !shipment ||
        shipment.status !== "delivered-to-recipient" || !worksite || incident.areaKey !== s.community?.key) return false;
    shipment.status = "received-by-recipient";
    shipment.completedAt = { year: s.year, month: s.mo };
    shipment.receiptId = `${shipment.id}:repair-receipt`;
    incident.status = "repaired";
    incident.verifiedAt = { year: s.year, month: s.mo };
    if (!incident.recoveryApplied && incident.impactApplied && applyInfrastructureImpact(s, incident, incident.metricDelta)) {
      incident.recoveryApplied = true;
      s.community.actions.push({ year: s.year, month: s.mo, kind: "infrastructure-repair-verified", incidentId: incident.id });
    }
    compactInfrastructureIncidentHistory(s.infrastructureIncidents);
    return incident.recoveryApplied;
  }
  return false;
}
