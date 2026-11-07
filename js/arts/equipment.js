const ARTS_EQUIPMENT_PURPOSES = Object.freeze([
  "supervised-practice", "personal-practice", "inspection", "repair", "workplace-use"
]);
const ARTS_EQUIPMENT_CONDITIONS = Object.freeze([
  "serviceable", "inspection-due", "unsafe", "in-repair", "lost", "returned"
]);
const ARTS_EQUIPMENT_OWNERS = Object.freeze(["person", "school", "employer", "organization", "community"]);
const ARTS_EQUIPMENT_ACTIONS = Object.freeze([
  "borrow-equipment", "return-equipment", "inspect-equipment",
  "request-equipment-repair", "record-repair-parts", "complete-equipment-repair"
]);

function createArtsEquipmentState() {
  return { version: 1, items: [], maintenanceRecords: [], maintenanceArchive: [] };
}

function artsEquipmentStatusSummary(s) {
  const items = s?.artsEquipment?.items || [],
    held = items.find(item => item.holderId === "protagonist" && item.condition !== "returned"),
    repair = items.find(item => item.condition === "in-repair");
  if (repair) return "学校所有の器具を修理中";
  if (!held) return "貸与器具なし";
  if (held.condition === "unsafe") return "点検待ち・使用停止";
  if (held.condition === "lost") return "所在確認中";
  if (held.condition === "inspection-due") return "点検時期・使用前に点検";
  if (held.dueAt && (held.dueAt.year < s.year || held.dueAt.year === s.year && held.dueAt.month < s.mo))
    return "貸与期限超過・返却手続き待ち";
  if (held.dueAt) return `貸与中・返却期限 ${held.dueAt.year}年${held.dueAt.month}月`;
  return "学校所有の器具を貸与中";
}

function isValidArtsEquipmentState(state, currentYear) {
  if (!Number.isInteger(currentYear) || !state || typeof state !== "object" || Array.isArray(state) ||
      state.version !== 1 ||
      !Array.isArray(state.items) || state.items.length > 64 ||
      !Array.isArray(state.maintenanceRecords) || state.maintenanceRecords.length > 4096 ||
      !Array.isArray(state.maintenanceArchive) || state.maintenanceArchive.length > 8192) return false;
  const itemIds = new Set(), purposeSet = new Set(ARTS_EQUIPMENT_PURPOSES),
    conditionSet = new Set(ARTS_EQUIPMENT_CONDITIONS), ownerSet = new Set(ARTS_EQUIPMENT_OWNERS);
  for (const item of state.items) {
    if (!item || typeof item !== "object" || Array.isArray(item) ||
        typeof item.id !== "string" || !item.id || itemIds.has(item.id) ||
        typeof item.kind !== "string" || !item.kind || !ownerSet.has(item.ownerType) ||
        typeof item.ownerId !== "string" || !item.ownerId ||
        !(item.holderId === null || item.holderId === "protagonist") ||
        typeof item.siteRef !== "string" || !item.siteRef || !conditionSet.has(item.condition) ||
        !Array.isArray(item.allowedPurposes) || !item.allowedPurposes.length ||
        item.allowedPurposes.some(value => !purposeSet.has(value)) ||
        !Array.isArray(item.compatibility) || item.compatibility.some(value =>
          typeof value !== "string" || !["thermal", "kinetic", "acoustic", "material", "medical-support", "ritual-local"].includes(value)) ||
        typeof item.provenance !== "string" || !item.provenance ||
        !Number.isInteger(item.borrowedAt?.year) || item.borrowedAt.year > currentYear ||
        !Number.isInteger(item.borrowedAt?.month) || item.borrowedAt.month < 1 || item.borrowedAt.month > 12 ||
        ["lastInspectedAt", "returnedAt", "repairedAt", "repairRequestedAt"].some(key => item[key] != null &&
          (!Number.isInteger(item[key].year) || item[key].year > currentYear ||
           !Number.isInteger(item[key].month) || item[key].month < 1 || item[key].month > 12)) ||
        (item.dueAt != null && (!Number.isInteger(item.dueAt.year) || item.dueAt.year < item.borrowedAt.year ||
          item.dueAt.year > currentYear + 2 || !Number.isInteger(item.dueAt.month) || item.dueAt.month < 1 || item.dueAt.month > 12)) ||
        (item.loanEpisodeId != null && (typeof item.loanEpisodeId !== "string" || !item.loanEpisodeId))) return false;
    if (item.lateFee != null && (!item.lateFee || item.lateFee.amount !== 250 ||
        !["due", "deferred", "paid"].includes(item.lateFee.status) ||
        !Number.isInteger(item.lateFee.issuedAt?.year) || item.lateFee.issuedAt.year > currentYear ||
        !Number.isInteger(item.lateFee.issuedAt?.month) || item.lateFee.issuedAt.month < 1 || item.lateFee.issuedAt.month > 12 ||
        (item.lateFee.nextReviewAt != null && (!Number.isInteger(item.lateFee.nextReviewAt.year) ||
          !Number.isInteger(item.lateFee.nextReviewAt.month) || item.lateFee.nextReviewAt.month < 1 || item.lateFee.nextReviewAt.month > 12)) ||
        (item.lateFee.status === "paid" && (!item.lateFee.paymentId || !item.lateFee.paidAt)))) return false;
    if ((item.useCount != null && (!Number.isInteger(item.useCount) || item.useCount < 0 || item.useCount > 100000)) ||
        (item.wear != null && (!Number.isFinite(item.wear) || item.wear < 0 || item.wear > 100))) return false;
    itemIds.add(item.id);
  }
  const recordIds = new Set(), allowedActions = new Set([
    "inspection", "repair-requested", "parts-available", "repair-completed", "returned"
  ]);
  for (const row of state.maintenanceRecords) {
    if (!row || typeof row !== "object" || Array.isArray(row) ||
        typeof row.id !== "string" || !row.id || recordIds.has(row.id) ||
        !itemIds.has(row.equipmentId) || !allowedActions.has(row.action) ||
        typeof row.sourceEventId !== "string" || !row.sourceEventId ||
        !Number.isInteger(row.year) || row.year > currentYear ||
        !Number.isInteger(row.month) || row.month < 1 || row.month > 12 ||
        (row.result != null && !["serviceable", "repair-required", "returned"].includes(row.result))) return false;
    recordIds.add(row.id);
  }
  const archiveKeys = new Set();
  return state.maintenanceArchive.every(row => {
    if (!row || typeof row.key !== "string" || !row.key || archiveKeys.has(row.key) ||
        !Number.isInteger(row.year) || row.year > currentYear ||
        !Number.isInteger(row.lastYear) || row.lastYear < row.year || row.lastYear > currentYear ||
        typeof row.equipmentId !== "string" || !itemIds.has(row.equipmentId) ||
        !allowedActions.has(row.action) ||
        !Number.isInteger(row.count) || row.count < 1 || row.count > 10000) return false;
    archiveKeys.add(row.key);
    return true;
  });
}

function artsEquipmentForAction(s, action) {
  const equipment = s?.artsEquipment;
  if (!equipment || typeof action?.equipmentId !== "string") return null;
  if (["$oldest-school-loan", "$oldest-due-school-loan", "$oldest-unsafe-school-loan", "$oldest-overdue-school-loan"].includes(action.equipmentId))
    return equipment.items.filter(item => item.ownerType === "school" && item.holderId === "protagonist" &&
      item.condition !== "returned" && item.condition !== "lost" &&
      (action.equipmentId !== "$oldest-overdue-school-loan" || item.lateFee && ["due", "deferred"].includes(item.lateFee.status)) &&
      (action.equipmentId !== "$oldest-due-school-loan" || item.condition === "serviceable" && item.dueAt &&
        (item.dueAt.year < s.year || item.dueAt.year === s.year && item.dueAt.month <= s.mo)) &&
      (action.equipmentId !== "$oldest-unsafe-school-loan" || item.condition === "unsafe")).sort((a, b) =>
      a.borrowedAt.year - b.borrowedAt.year || a.borrowedAt.month - b.borrowedAt.month || a.id.localeCompare(b.id))[0] || null;
  if (action.equipmentId === "$oldest-school-repair")
    return equipment.items.filter(item => item.ownerType === "school" && item.holderId === null &&
      item.condition === "in-repair").sort((a, b) =>
      a.borrowedAt.year - b.borrowedAt.year || a.borrowedAt.month - b.borrowedAt.month || a.id.localeCompare(b.id))[0] || null;
  if (action.equipmentId !== "$current-course-unit")
    return equipment.items.find(item => item.id === action.equipmentId) || null;
  const enrollment = artsCurrentFormalEnrollment(s);
  if (!enrollment) return null;
  return equipment.items.find(item => item.kind === "supervised-arts-unit" &&
    item.ownerType === "school" && item.ownerId === (s.educationPath?.institutionId || enrollment.id) &&
    item.holderId === "protagonist" && item.condition !== "returned") || null;
}

function advanceArtsEquipment(s) {
  const state = s?.artsEquipment;
  if (!state || !Number.isInteger(s.year) || !Number.isInteger(s.mo)) return;
  for (const item of state.items) {
    if (item.ownerType !== "school" || item.holderId !== "protagonist" ||
        ["returned", "lost"].includes(item.condition) || !item.dueAt || item.lateFee ||
        s.year * 12 + s.mo <= item.dueAt.year * 12 + item.dueAt.month) continue;
    item.lateFee = { amount: 250, status: "due", issuedAt: { year: s.year, month: s.mo },
      nextReviewAt: { year: s.year, month: s.mo }, paymentId: null, paidAt: null };
  }
}

function artsEquipmentLateFeeAction(s, action, eventId, resolution) {
  if (!s?.artsEquipment || !["pay-late-fee", "defer-late-fee"].includes(action?.action) ||
      typeof eventId !== "string" || !eventId) return false;
  const item = artsEquipmentForAction(s, { equipmentId: action.equipmentId || "$oldest-overdue-school-loan" }),
    fee = item?.lateFee;
  if (!item || item.ownerType !== "school" || item.holderId !== "protagonist" || !fee ||
      !["due", "deferred"].includes(fee.status) ||
      s.year * 12 + s.mo < fee.nextReviewAt.year * 12 + fee.nextReviewAt.month) return false;
  if (action.action === "pay-late-fee") {
    const wallet = inSharedHousehold(s) ? s.house : s;
    if (!wallet || wallet.cash < fee.amount) return false;
    wallet.cash -= fee.amount;
    fee.status = "paid";
    fee.paymentId = `arts-loan-fee:${item.id}:${fee.issuedAt.year}:${fee.issuedAt.month}`;
    fee.paidAt = { year: s.year, month: s.mo, sourceEventId: eventId,
      resolution: [resolution?.choiceIndex ?? 0, resolution?.outcomeIndex ?? 0], amount: fee.amount,
      paidBy: inSharedHousehold(s) ? "household" : "personal" };
    return true;
  }
  fee.status = "deferred";
  const next = s.year * 12 + s.mo + 12;
  fee.nextReviewAt = { year: Math.floor((next - 1) / 12), month: ((next - 1) % 12) + 1 };
  fee.lastDeferAt = { year: s.year, month: s.mo, sourceEventId: eventId };
  return true;
}

function artsEquipmentAvailable(s, equipmentId, purpose, siteRef) {
  const item = artsEquipmentForAction(s, { equipmentId }) || s?.artsEquipment?.items?.find(row => row.id === equipmentId);
  if (!item) return { allowed: false, reason: "equipment-not-recorded", item: null };
  if (item.holderId !== "protagonist") return { allowed: false, reason: "not-in-custody", item };
  if (!ARTS_EQUIPMENT_PURPOSES.includes(purpose) || !item.allowedPurposes.includes(purpose))
    return { allowed: false, reason: "purpose-not-authorized", item };
  if (siteRef && item.siteRef !== siteRef) return { allowed: false, reason: "wrong-site", item };
  if (item.condition !== "serviceable") return { allowed: false, reason: "equipment-not-serviceable", item };
  return { allowed: true, reason: null, item };
}

function artsLatestEquipmentRecord(s, equipmentId) {
  return (s?.artsEquipment?.maintenanceRecords || []).filter(row => row.equipmentId === equipmentId)
    .sort((a, b) => b.year - a.year || b.month - a.month || b.id.localeCompare(a.id))[0] || null;
}

function artsEquipmentFollowupDue(s, item, requiredAction) {
  const row = artsLatestEquipmentRecord(s, item?.id);
  return !!row && row.action === requiredAction &&
    s.year * 12 + s.mo - (row.year * 12 + row.month) >= 1;
}

function artsEquipmentActionId(s, eventId, itemId, action, resolution) {
  return [eventId, itemId, action, s.year, s.mo,
    resolution?.choiceIndex ?? 0, resolution?.outcomeIndex ?? 0].join(":");
}

function artsAppendMaintenance(s, item, action, eventId, result, resolution) {
  const state = s.artsEquipment,
    id = artsEquipmentActionId(s, eventId, item.id, action, resolution);
  if (state.maintenanceRecords.some(row => row.id === id) || state.maintenanceRecords.length >= 4096) return false;
  state.maintenanceRecords.push({ id, equipmentId: item.id, action,
    sourceEventId: eventId, result: result || null, year: s.year, month: s.mo });
  artsCompactEquipmentHistory(state, item);
  return state.maintenanceRecords.length <= 4096;
}

function artsCompactEquipmentHistory(state, item) {
  const rows = state.maintenanceRecords.filter(row => row.equipmentId === item.id).sort((a, b) =>
      a.year - b.year || a.month - b.month || a.id.localeCompare(b.id)),
    terminalIndex = rows.reduce((last, row, index) =>
      ["repair-completed", "returned"].includes(row.action) ? index : last, -1);
  let activeRepairStart = -1;
  if (item.condition === "in-repair") {
    const requestIndex = rows.reduce((last, row, index) =>
      index > terminalIndex && row.action === "repair-requested" ? index : last, -1);
    if (requestIndex >= 0) {
      activeRepairStart = rows.reduce((last, row, index) =>
        index < requestIndex && row.action === "inspection" && row.result === "repair-required" ? index : last, requestIndex);
    }
  }
  const byAction = new Map();
  for (const row of rows) {
    if (!byAction.has(row.action)) byAction.set(row.action, []);
    byAction.get(row.action).push(row);
  }
  const remove = new Set();
  for (const group of byAction.values()) {
    const retained = new Set(group.slice(-12).map(row => row.id));
    if (activeRepairStart >= 0) for (const row of rows.slice(activeRepairStart)) retained.add(row.id);
    for (const row of group) if (!retained.has(row.id)) remove.add(row.id);
  }
  for (const row of rows) if (remove.has(row.id)) {
    const index = state.maintenanceRecords.findIndex(candidate => candidate.id === row.id);
    if (index >= 0) state.maintenanceRecords.splice(index, 1);
    const key = row.year + ":" + item.id + ":" + row.action,
      archived = state.maintenanceArchive.find(candidate => candidate.key === key);
    if (archived) { archived.count++; archived.lastYear = Math.max(archived.lastYear, row.year); }
    else {
      state.maintenanceArchive.push({ key, year: row.year, lastYear: row.year,
        equipmentId: item.id, action: row.action, count: 1 });
      if (state.maintenanceArchive.length > 8192) state.maintenanceArchive.shift();
    }
  }
}

function artsApplyEquipmentAction(s, action, eventId, resolution) {
  if (!s?.artsEquipment || !ARTS_EQUIPMENT_ACTIONS.includes(action.action) ||
      typeof eventId !== "string" || !eventId) return false;
  const state = s.artsEquipment;
  if (action.action === "borrow-equipment") {
    const enrollment = artsCurrentFormalEnrollment(s);
    if (!enrollment || !artsHasAttendedCurrentCourse(s, enrollment) ||
        s.educationPath?.stage !== "arts" || s.educationPath.status !== "enrolled") return false;
    const ownerId = s.educationPath.institutionId || enrollment.id,
      duplicate = state.items.some(item => item.ownerType === "school" && item.holderId === "protagonist" &&
        item.condition !== "returned" && item.condition !== "lost");
    if (duplicate || state.items.length >= 64) return false;
    const id = "arts-unit:" + [ownerId, enrollment.id, s.year, s.mo, resolution?.choiceIndex ?? 0,
      resolution?.outcomeIndex ?? 0].join(":");
    if (state.items.some(item => item.id === id)) return false;
    state.items.push({ id, kind: "supervised-arts-unit", ownerType: "school", ownerId,
      holderId: "protagonist", siteRef: ownerId, allowedPurposes: ["supervised-practice", "inspection"],
      compatibility: ["kinetic"], condition: "serviceable", borrowedAt: { year: s.year, month: s.mo },
      dueAt: { year: s.year + 1, month: Math.max(1, Math.min(12, s.mo)) }, loanEpisodeId: id,
      provenance: eventId });
    return true;
  }
  const item = artsEquipmentForAction(s, action);
  const requiresPlayerCustody = ["return-equipment", "inspect-equipment", "request-equipment-repair"]
    .includes(action.action);
  if (!item || requiresPlayerCustody && item.holderId !== "protagonist") return false;
  const lastRecord = state.maintenanceRecords.filter(row => row.equipmentId === item.id)
    .sort((a, b) => b.year - a.year || b.month - a.month || b.id.localeCompare(a.id))[0];
  if (action.action === "return-equipment") {
    if (item.condition === "in-repair" || item.condition === "lost") return false;
    if (!artsAppendMaintenance(s, item, "returned", eventId, "returned", resolution)) return false;
    item.holderId = null; item.condition = "returned"; item.returnedAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "inspect-equipment") {
    if (!item.allowedPurposes.includes("inspection") || !["serviceable", "inspection-due", "unsafe"].includes(item.condition) ||
        !["serviceable", "repair-required"].includes(action.result)) return false;
    if (!artsAppendMaintenance(s, item, "inspection", eventId, action.result, resolution)) return false;
    item.condition = action.result === "serviceable" ? "serviceable" : "unsafe";
    item.lastInspectedAt = { year: s.year, month: s.mo };
    if (action.result === "serviceable") item.dueAt = { year: s.year + 1, month: s.mo };
    return true;
  }
  if (action.action === "request-equipment-repair") {
    if (item.condition !== "unsafe" || lastRecord?.action !== "inspection" || lastRecord.result !== "repair-required") return false;
    if (!artsAppendMaintenance(s, item, "repair-requested", eventId, null, resolution)) return false;
    item.condition = "in-repair"; item.holderId = null; item.repairRequestedAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "record-repair-parts") {
    if (item.condition !== "in-repair" || item.holderId !== null || lastRecord?.action !== "repair-requested" ||
        s.year * 12 + s.mo - (lastRecord.year * 12 + lastRecord.month) < 1) return false;
    return artsAppendMaintenance(s, item, "parts-available", eventId, null, resolution);
  }
  if (action.action === "complete-equipment-repair") {
    if (item.condition !== "in-repair" || item.holderId !== null || lastRecord?.action !== "parts-available" ||
        s.year * 12 + s.mo - (lastRecord.year * 12 + lastRecord.month) < 1) return false;
    if (!artsAppendMaintenance(s, item, "repair-completed", eventId, "serviceable", resolution)) return false;
    item.condition = "serviceable"; item.holderId = "protagonist";
    item.repairedAt = { year: s.year, month: s.mo };
    return true;
  }
  return false;
}
