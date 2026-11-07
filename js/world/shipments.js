function createShipmentState() {
  return { version: 1, sequence: 0, items: [], completedArchive: [], terminalIds: [], lastMedicineOrderAt: null };
}

function ensureShipmentState(s) {
  s.world ||= { events: {} };
  if (!s.world.shipments) s.world.shipments = createShipmentState();
  return s.world.shipments;
}

function isValidShipmentState(state, year) {
  if (!state || state.version !== 1 || !Number.isInteger(state.sequence) || state.sequence < 0 ||
      !Array.isArray(state.items) || state.items.length > 64 ||
      !Array.isArray(state.completedArchive) || state.completedArchive.length > 64 ||
      !Array.isArray(state.terminalIds) || state.terminalIds.length > 512 ||
      new Set(state.terminalIds).size !== state.terminalIds.length) return false;
  const ids = new Set();
  for (const row of state.items) {
    if (!row || typeof row.id !== "string" || !row.id || ids.has(row.id) ||
        !["repair-part", "medicine", "letter", "relief-cargo"].includes(row.kind) ||
        !["in-transit", "delayed", "arrived-at-depot", "held-for-delivery", "delivered-to-recipient", "received-by-recipient", "received-by-clinic", "returned", "undeliverable"].includes(row.status) ||
        typeof row.originRef !== "string" || !row.originRef ||
        typeof row.originAreaKey !== "string" || !row.originAreaKey ||
        typeof row.destinationAreaKey !== "string" || !row.destinationAreaKey ||
        typeof row.recipientId !== "string" || !row.recipientId ||
        !["repair-site", "clinic", "person", "organization"].includes(row.recipientType) ||
        !Number.isInteger(row.quantity) || row.quantity < 1 || row.quantity > 1000 ||
        !Number.isInteger(row.createdAt?.year) || row.createdAt.year > year ||
        !Number.isInteger(row.createdAt?.month) || row.createdAt.month < 1 || row.createdAt.month > 12 ||
        !Number.isInteger(row.dueAt?.year) || row.dueAt.year > year + 2 ||
        !Number.isInteger(row.dueAt?.month) || row.dueAt.month < 1 || row.dueAt.month > 12 ||
        (row.completedAt && (!Number.isInteger(row.completedAt.year) || !Number.isInteger(row.completedAt.month)))) return false;
    ids.add(row.id);
  }
  if (state.items.filter(row => ["received-by-recipient", "received-by-clinic", "returned", "undeliverable"].includes(row.status)).length > 32) return false;
  if (!state.completedArchive.every(row => row && typeof row.key === "string" && row.key &&
      Number.isInteger(row.year) && row.year <= year && typeof row.areaKey === "string" &&
      Number.isInteger(row.count) && row.count > 0 && row.count <= 100000 &&
      Number.isSafeInteger(row.quantity) && row.quantity >= 0 && row.quantity <= 100000000 &&
      Number.isInteger(row.receivedCount) && row.receivedCount >= 0 &&
      Number.isInteger(row.returnedCount) && row.returnedCount >= 0 &&
      Number.isInteger(row.undeliverableCount) && row.undeliverableCount >= 0)) return false;
  return state.lastMedicineOrderAt == null || (Number.isInteger(state.lastMedicineOrderAt.year) &&
    state.lastMedicineOrderAt.year <= year && Number.isInteger(state.lastMedicineOrderAt.month) &&
    state.lastMedicineOrderAt.month >= 1 && state.lastMedicineOrderAt.month <= 12);
}

function shipmentState(s) { return s?.world?.shipments || null; }
function findShipment(s, id) { return shipmentState(s)?.items?.find(row => row.id === id) || null; }

function compactShipmentHistory(s) {
  const state = shipmentState(s);
  if (!state) return;
  const completed = state.items.filter(row => ["received-by-recipient", "received-by-clinic", "returned", "undeliverable"].includes(row.status))
    .sort((a, b) => a.completedAt.year - b.completedAt.year || a.completedAt.month - b.completedAt.month || a.id.localeCompare(b.id));
  while (completed.length > 32) {
    const row = completed.shift(), key = `${row.completedAt.year}:${row.destinationAreaKey}`,
      summary = state.completedArchive.find(item => item.key === key);
    if (summary) {
      summary.count++;
      summary.quantity += row.quantity;
      if (row.status === "received-by-recipient" || row.status === "received-by-clinic") summary.receivedCount++;
      if (row.status === "returned") summary.returnedCount++;
      if (row.status === "undeliverable") summary.undeliverableCount++;
    } else state.completedArchive.push({ key, year: row.completedAt.year, areaKey: row.destinationAreaKey,
      count: 1, quantity: row.quantity,
      receivedCount: ["received-by-recipient", "received-by-clinic"].includes(row.status) ? 1 : 0,
      returnedCount: row.status === "returned" ? 1 : 0,
      undeliverableCount: row.status === "undeliverable" ? 1 : 0 });
    state.terminalIds.push(row.id);
    state.items.splice(state.items.findIndex(item => item.id === row.id), 1);
  }
  if (state.completedArchive.length > 64) state.completedArchive.splice(0, state.completedArchive.length - 64);
  if (state.terminalIds.length > 512) state.terminalIds.splice(0, state.terminalIds.length - 512);
}

function shipmentKnownPersonArea(s, person) {
  if (typeof person?.residenceLocalityKey === "string" && s.world?.residences?.[person.residenceLocalityKey])
    return person.residenceLocalityKey;
  if (person?.residenceBaseId && person.residenceBaseId === s.residenceBase?.id && s.community?.key)
    return s.community.key;
  if (person === s.sp && typeof spouseLivesWithProtagonist === "function" && spouseLivesWithProtagonist(s))
    return s.community?.key || null;
  if ((person === s.par?.fa || person === s.par?.mo) && typeof inSharedHousehold === "function" && inSharedHousehold(s))
    return s.community?.key || null;
  return null;
}

function createShipment(s, details) {
  const state = ensureShipmentState(s);
  if (!details || typeof details.originRef !== "string" || !details.originRef ||
      !details.originAreaKey || !details.destinationAreaKey || !details.recipientId ||
      !["repair-part", "medicine", "letter", "relief-cargo"].includes(details.kind) ||
      !["repair-site", "clinic", "person", "organization"].includes(details.recipientType)) return null;
  if (state.items.some(row => row.originRef === details.originRef && row.kind === details.kind))
    return state.items.find(row => row.originRef === details.originRef && row.kind === details.kind) || null;
  const activeCount = state.items.filter(row => !["received-by-recipient", "received-by-clinic", "returned", "undeliverable"].includes(row.status)).length;
  if (activeCount >= 32) return null;
  const createdAt = { year: s.year, month: s.mo }, duePeriod = s.year * 12 + s.mo + (details.transitMonths || 1),
    row = { id: `shipment:${s.personId || "protagonist"}:${++state.sequence}`, kind: details.kind,
      originRef: details.originRef, originAreaKey: details.originAreaKey,
      destinationAreaKey: details.destinationAreaKey, recipientId: details.recipientId,
      recipientType: details.recipientType, quantity: details.quantity || 1,
      status: "in-transit", createdAt, dueAt: { year: Math.floor((duePeriod - 1) / 12), month: ((duePeriod - 1) % 12) + 1 },
      custodianId: details.custodianId || "local-carrier", contentsRef: details.contentsRef || details.kind,
      delayReason: null, completedAt: null, receiptId: null };
  state.items.push(row);
  return row;
}

function createRepairPartsShipment(s, incident) {
  if (!incident || incident.areaKey !== s.community?.key || incident.status !== "active") return null;
  return createShipment(s, { kind: "repair-part", originRef: incident.id,
    originAreaKey: incident.areaKey, destinationAreaKey: incident.areaKey,
    recipientId: `repair-site:${incident.id}`, recipientType: "repair-site",
    contentsRef: `${incident.kind}-replacement-part`, transitMonths: 1 });
}

function createFamilyNoticeShipment(s) {
  const person = s.sp && !s.sp.d ? s.sp : [s.par?.fa, s.par?.mo].find(row => row && !row.d);
  if (!person?.id || !s.community?.key) return null;
  const destinationAreaKey = shipmentKnownPersonArea(s, person) || "address-unconfirmed";
  if (destinationAreaKey === "address-unconfirmed") return null;
  return createShipment(s, { kind: "letter", originRef: `family-notice:${person.id}:${s.year}:${s.mo}`,
    originAreaKey: s.community.key, destinationAreaKey,
    recipientId: person.id, recipientType: "person", contentsRef: "departure-or-return-notice",
    transitMonths: 2 });
}

function advanceShipments(s) {
  const state = ensureShipmentState(s);
  if (!s.community?.key || !Number.isInteger(s.mo) || s.mo < 1 || s.mo > 12) return;
  const period = s.year * 12 + s.mo;
  if ([2, 8].includes(s.mo)) {
    const clinic = Object.values(s.community.facilities || {}).find(row => row.kind === "clinic" && row.status !== "closed"),
      last = state.lastMedicineOrderAt && state.lastMedicineOrderAt.year * 12 + state.lastMedicineOrderAt.month,
      active = state.items.some(row => row.kind === "medicine" && row.destinationAreaKey === s.community.key &&
        !["received-by-clinic", "returned", "undeliverable"].includes(row.status));
    if (clinic && !active && (!last || period - last >= 6)) {
      const shipment = createShipment(s, { kind: "medicine", originRef: `clinic-restock:${clinic.id}:${s.year}:${s.mo}`,
        originAreaKey: `supply-dispatch:${s.res.n}`, destinationAreaKey: s.community.key,
        recipientId: clinic.id, recipientType: "clinic", contentsRef: "clinic-stock", quantity: 3, transitMonths: 2 });
      if (shipment) state.lastMedicineOrderAt = { year: s.year, month: s.mo };
    }
  }
  for (const row of state.items) {
    if (!["in-transit", "delayed"].includes(row.status) || period < row.dueAt.year * 12 + row.dueAt.month) continue;
    if (row.destinationAreaKey === "address-unconfirmed") {
      row.status = "delayed";
      row.delayReason = "recipient-address-unconfirmed";
    } else if (row.destinationAreaKey === s.community.key && activeInfrastructureDisruption(s, "route")) {
      row.status = "delayed";
      row.delayReason = "route-disruption";
    } else {
      row.status = "arrived-at-depot";
      row.arrivedAt ||= { year: s.year, month: s.mo };
      row.delayReason = null;
    }
  }
  compactShipmentHistory(s);
}

function activeShipment(s, kind = null, statuses = null) {
  return (shipmentState(s)?.items || []).filter(row =>
    (!kind || row.kind === kind) && (!statuses || statuses.includes(row.status)) &&
    [row.originAreaKey, row.destinationAreaKey].includes(s?.community?.key))
    .sort((a, b) => a.createdAt.year - b.createdAt.year || a.createdAt.month - b.createdAt.month || a.id.localeCompare(b.id))[0] || null;
}

function applyShipmentAction(s, action, sourceEventId = null) {
  const row = action?.targetId ? findShipment(s, action.targetId) : activeShipment(s);
  if (!row || !action || typeof action.action !== "string") return false;
  if (action.action === "take-custody") {
    if (row.status !== "arrived-at-depot" || row.destinationAreaKey !== s.community?.key) return false;
    row.status = "held-for-delivery";
    row.custodianId = "protagonist";
    row.custodyAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "confirm-recipient") {
    if (row.status !== "held-for-delivery" || row.destinationAreaKey !== s.community?.key) return false;
    const recipientExists = row.recipientType === "repair-site" && row.recipientId.startsWith("community-project:")
      ? !!s.communityProjects?.items?.find(item => `community-project:${item.id}` === row.recipientId && item.areaKey === s.community.key)
      : row.recipientType === "repair-site" && row.recipientId.startsWith("repair-site:")
      ? !!(s.infrastructureIncidents?.items || []).find(item => `repair-site:${item.id}` === row.recipientId && item.areaKey === s.community.key)
      : row.recipientType === "clinic"
        ? !!s.community.facilities?.[row.recipientId]
      : row.recipientType === "person" ? [s.sp, s.par?.fa, s.par?.mo, ...(s.kids || [])].some(person =>
          person?.id === row.recipientId && shipmentKnownPersonArea(s, person) === row.destinationAreaKey &&
          row.destinationAreaKey === s.community?.key)
          : !!row.recipientId;
    if (!recipientExists) {
      row.recipientCheck = { status: "held-for-verification", checkedAt: { year: s.year, month: s.mo },
        sourceEventId, basis: "recipient-and-current-address-not-yet-matched" };
      return true;
    }
    row.status = "delivered-to-recipient";
    row.recipientVerifiedAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "return") {
    if (!["delayed", "held-for-delivery", "arrived-at-depot", "delivered-to-recipient", "undeliverable"].includes(row.status)) return false;
    row.status = "returned";
    row.completedAt = { year: s.year, month: s.mo };
    row.returnReason = "sender-return-requested";
    compactShipmentHistory(s);
    return true;
  }
  if (action.action === "resolve-address") {
    const recipient = [s.sp, s.par?.fa, s.par?.mo, ...(s.kids || [])].find(person => person?.id === row.recipientId),
      address = recipient?.residenceLocalityKey;
    if (row.kind !== "letter" || !["delayed", "undeliverable"].includes(row.status) ||
        (row.status === "delayed" && row.delayReason !== "recipient-address-unconfirmed") ||
        !address || !s.world?.residences?.[address]) return false;
    row.destinationAreaKey = address;
    row.addressConfirmedAt = { year: s.year, month: s.mo, recipientId: recipient.id };
    row.delayReason = null;
    row.dueAt = { year: s.year, month: s.mo };
    row.status = "in-transit";
    return true;
  }
  if (action.action === "record-delay-response") {
    if (!["delayed"].includes(row.status) || !["medicine", "letter"].includes(row.kind)) return false;
    row.delayResponse ||= { year: s.year, month: s.mo, sourceEventId,
      kind: row.kind === "medicine" ? "clinic-contact-requested" : "sender-location-query" };
    return true;
  }
  if (action.action === "receive-medicine") {
    const before = s.community?.medicalSupplyInventory?.[row.recipientId] || 0;
    if (row.kind !== "medicine" || row.status !== "arrived-at-depot" || row.recipientType !== "clinic" ||
        row.destinationAreaKey !== s.community?.key || !s.community.facilities?.[row.recipientId] || before + row.quantity > 1000) return false;
    row.status = "received-by-clinic";
    row.completedAt = { year: s.year, month: s.mo };
    row.receiptId = `${row.id}:clinic-receipt`;
    s.community.medicalSupplyInventory ||= {};
    s.community.medicalSupplyInventory[row.recipientId] = before + row.quantity;
    row.inventoryDelta = row.quantity;
    compactShipmentHistory(s);
    return true;
  }
  return false;
}
