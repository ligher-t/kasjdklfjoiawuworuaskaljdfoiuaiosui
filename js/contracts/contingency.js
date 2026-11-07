function createContingencyContractState() {
  return { version: 1, sequence: 0, contacts: [], items: [], completedArchive: [], terminalIds: [] };
}

function ensureContingencyContractState(s) {
  if (!s.contingencyContracts) s.contingencyContracts = createContingencyContractState();
  return s.contingencyContracts;
}

function isValidContingencyContractState(state, year) {
  if (!state || state.version !== 1 || !Number.isInteger(state.sequence) || state.sequence < 0 ||
      !Array.isArray(state.contacts) || state.contacts.length > 24 ||
      !Array.isArray(state.items) || state.items.length > 64 ||
      !Array.isArray(state.completedArchive) || state.completedArchive.length > 64 ||
      !Array.isArray(state.terminalIds) || state.terminalIds.length > 512 ||
      new Set(state.terminalIds).size !== state.terminalIds.length) return false;
  const ids = new Set();
  for (const row of state.items) {
    if (!row || typeof row.id !== "string" || !row.id || ids.has(row.id) ||
        typeof row.assignmentId !== "string" || !row.assignmentId ||
        !["infrastructure-support", "relief-logistics", "forecast-survey"].includes(row.kind) ||
        !["offered", "accepted", "prepared", "travelling", "at-site", "awaiting-verification", "awaiting-payment", "payment-disputed", "paid", "declined", "expired", "cancelled", "returned"].includes(row.status) ||
        typeof row.areaKey !== "string" || !row.areaKey || typeof row.incidentId !== "string" || !row.incidentId ||
        typeof row.employerId !== "string" || !row.employerId || typeof row.receiverId !== "string" || !row.receiverId ||
        (row.requiredSkillId != null && (typeof row.requiredSkillId !== "string" || !row.requiredSkillId ||
          !Number.isInteger(row.requiredSkillLevel) || row.requiredSkillLevel < 1 || row.requiredSkillLevel > 100)) ||
        (row.skillAssessment != null && (!row.skillAssessment || typeof row.skillAssessment.eligible !== "boolean" ||
          !["eligible", "eligibility-insufficient"].includes(row.skillAssessment.result) ||
          typeof row.skillAssessment.sourceEventId !== "string" || !row.skillAssessment.sourceEventId ||
          !Number.isInteger(row.skillAssessment.assessedAt?.year) ||
          !Number.isInteger(row.skillAssessment.assessedAt?.month) || row.skillAssessment.assessedAt.month < 1 ||
          row.skillAssessment.assessedAt.month > 12)) ||
        !Number.isSafeInteger(row.nominalCash) || row.nominalCash < 0 || row.nominalCash > 1000000 ||
        !Number.isInteger(row.createdAt?.year) || row.createdAt.year > year ||
        !Number.isInteger(row.createdAt?.month) || row.createdAt.month < 1 || row.createdAt.month > 12 ||
        (row.travelJourneyId != null && typeof row.travelJourneyId !== "string") ||
        (row.settlementId != null && typeof row.settlementId !== "string") ||
        !Array.isArray(row.history) || row.history.length > 32 ||
        row.history.some(item => !item || typeof item.status !== "string" ||
          !Number.isInteger(item.year) || item.year > year || !Number.isInteger(item.month) || item.month < 1 || item.month > 12 ||
          typeof item.sourceEventId !== "string" || !item.sourceEventId) ||
        (row.carePlan != null && (!row.carePlan || typeof row.carePlan.personId !== "string" || !row.carePlan.personId ||
          !Number.isInteger(row.carePlan.year) || !Number.isInteger(row.carePlan.month))) ||
        (row.status === "paid" && (!row.settlementId || !row.paidAt || !Number.isInteger(row.paidAt.year)))) return false;
    ids.add(row.id);
  }
  if (state.items.filter(row => ["paid", "declined", "expired", "cancelled", "returned"].includes(row.status)).length > 32) return false;
  if (!state.completedArchive.every(row => row && typeof row.key === "string" && row.key &&
      Number.isInteger(row.year) && row.year <= year && typeof row.kind === "string" &&
      Number.isInteger(row.count) && row.count > 0 && row.count <= 100000 &&
      Number.isSafeInteger(row.amount) && row.amount >= 0)) return false;
  return state.contacts.every(row => row && typeof row.employerId === "string" && !!row.employerId &&
    typeof row.areaKey === "string" && !!row.areaKey && typeof row.incidentId === "string" && !!row.incidentId &&
    ["contacted", "offer-issued", "closed"].includes(row.status) &&
    typeof row.sourceEventId === "string" && !!row.sourceEventId && Number.isInteger(row.year) && row.year <= year &&
    Number.isInteger(row.month) && row.month >= 1 && row.month <= 12 &&
    (row.closedAt == null || Number.isInteger(row.closedAt.year) && Number.isInteger(row.closedAt.month)));
}

function contingencyDependentChildren(s) {
  return (s?.kids || []).filter(row => row && !row.d && Number.isInteger(row.age) && row.age < 18);
}

function contingencyAvailableCaregiver(s) {
  return [s?.sp, s?.par?.fa, s?.par?.mo].find(row => row?.id && !row.d && !row.fl?.detained && !row.fl?.isolated) || null;
}

function contingencyCarePlanValid(s, contract) {
  if (!contingencyNeedsCarePlan(s)) return true;
  const caregiverId = contract?.carePlan?.personId;
  return !!caregiverId && [s?.sp, s?.par?.fa, s?.par?.mo].some(row =>
    row?.id === caregiverId && !row.d && !row.fl?.detained && !row.fl?.isolated);
}

function contingencyNeedsCarePlan(s) {
  return contingencyDependentChildren(s).length > 0;
}

function activeContingencyContract(s, statuses = null) {
  return (s?.contingencyContracts?.items || []).filter(row => row.areaKey === s?.community?.key &&
    (!statuses || statuses.includes(row.status)))
    .sort((a, b) => b.createdAt.year - a.createdAt.year || b.createdAt.month - a.createdAt.month || b.id.localeCompare(a.id))[0] || null;
}

function compactContingencyContracts(s) {
  const state = s?.contingencyContracts;
  if (!state) return;
  const terminal = state.items.filter(row => ["paid", "declined", "expired", "cancelled", "returned"].includes(row.status))
    .sort((a, b) => (a.closedAt?.year || a.createdAt.year) - (b.closedAt?.year || b.createdAt.year) ||
      (a.closedAt?.month || a.createdAt.month) - (b.closedAt?.month || b.createdAt.month) || a.id.localeCompare(b.id));
  while (terminal.length > 32) {
    const row = terminal.shift(), year = row.closedAt?.year || row.createdAt.year,
      key = `${year}:${row.kind}`, summary = state.completedArchive.find(item => item.key === key);
    if (summary) { summary.count++; summary.amount += row.paidAmount || 0; }
    else state.completedArchive.push({ key, year, kind: row.kind, count: 1, amount: row.paidAmount || 0 });
    state.terminalIds.push(row.id);
    state.items.splice(state.items.findIndex(item => item.id === row.id), 1);
  }
  if (state.completedArchive.length > 64) state.completedArchive.splice(0, state.completedArchive.length - 64);
  if (state.terminalIds.length > 512) state.terminalIds.splice(0, state.terminalIds.length - 512);
}

function closeContingencyContact(state, contract, s, sourceEventId) {
  const contact = state?.contacts?.find(row => row.contractId === contract?.id && row.status !== "closed");
  if (!contact) return;
  contact.status = "closed";
  contact.closedAt = { year: s.year, month: s.mo, sourceEventId };
}

function compactContingencyContacts(state) {
  while (state.contacts.length >= 24) {
    const index = state.contacts.findIndex(row => row.status === "closed");
    if (index < 0) return false;
    state.contacts.splice(index, 1);
  }
  return true;
}

function contingencyTravelQuote(s) {
  try { return travelLegFareQuote(s, s.res.n, s.res.n); } catch { return null; }
}

function contingencyCanDepart(s, contract = activeContingencyContract(s, ["prepared"])) {
  const quote = contingencyTravelQuote(s), wallet = inSharedHousehold(s) ? s.house : s;
  return !!contract && !restricted(s) && !travelCurrentJourney(s) && quote &&
    Number.isFinite(wallet?.cash) && wallet.cash >= quote.amount && s.age >= 18 &&
    contingencyCarePlanValid(s, contract);
}

function contingencySkillAssessment(s, contract = activeContingencyContract(s, ["offered"])) {
  if (!contract) return { eligible: false, requiredSkillId: null, requiredLevel: 0, currentLevel: 0 };
  const requiredSkillId = contract.requiredSkillId || null,
    requiredLevel = Number.isFinite(contract.requiredSkillLevel) ? contract.requiredSkillLevel : 0,
    currentLevel = requiredSkillId ? Number(s?.artsProfile?.techSkills?.[requiredSkillId] || 0) : 0;
  return { eligible: !requiredSkillId || currentLevel >= requiredLevel,
    requiredSkillId, requiredLevel, currentLevel };
}

function advanceContingencyContracts(s) {
  const state = ensureContingencyContractState(s), period = s.year * 12 + (s.mo || 1),
    journey = travelCurrentJourney(s);
  for (const contract of state.items) {
    const age = period - (contract.createdAt.year * 12 + contract.createdAt.month);
    if (contract.status === "offered" && age > 6) {
      contract.status = "expired"; contract.closedAt = { year: s.year, month: s.mo };
      closeContingencyContact(state, contract, s, "contingency-offer-expired");
    } else if (contract.status === "awaiting-payment" && contract.paymentDueAt &&
        period > contract.paymentDueAt.year * 12 + contract.paymentDueAt.month) {
      contract.status = "payment-disputed";
      contract.disputeReason = "payment-not-received-by-due-period";
      contract.paymentDisputedAt = { year: s.year, month: s.mo };
      contract.history.push({ status: "payment-disputed", year: s.year, month: s.mo,
        sourceEventId: "contingency-payment-deadline", reason: contract.disputeReason });
      contract.history = contract.history.slice(-32);
    }
    if (contract.status === "travelling" && journey?.id === contract.travelJourneyId && journey.status === "arrived") {
      if (journey.legs?.[journey.activeLegIndex]?.returnToBase) {
        travelEnd(s, "returned-home");
        contract.returnedAt = { year: s.year, month: s.mo };
        if (contract.verifiedAt) {
          contract.status = "awaiting-payment";
          contract.returnDecisionDueAt = null;
        } else {
          contract.status = "returned";
          contract.closedAt = { year: s.year, month: s.mo };
          closeContingencyContact(state, contract, s, "contingency-return-before-verification");
        }
        contract.history.push({ status: contract.status, year: s.year, month: s.mo,
          sourceEventId: "contingency-return-arrived" });
        contract.history = contract.history.slice(-32);
      } else {
        contract.status = "at-site";
        const next = s.year * 12 + s.mo + 1;
        contract.returnDecisionDueAt = { year: Math.floor((next - 1) / 12), month: ((next - 1) % 12) + 1 };
      }
    }
  }
  compactContingencyContracts(s);
}

function applyContingencyContractAction(s, action, sourceEventId) {
  if (!action || typeof action.action !== "string" || !sourceEventId) return false;
  const state = ensureContingencyContractState(s),
    contract = action.targetId ? state.items.find(row => row.id === action.targetId) : activeContingencyContract(s);
  if (action.action === "contact") {
    const incident = activeInfrastructureIncident(s), work = artsCurrentWorksite(s);
    if (!incident || !work || !compactContingencyContacts(state) || state.contacts.some(row => row.areaKey === incident.areaKey && row.employerId === work.site.employerId && row.status !== "closed")) return false;
    state.contacts.push({ areaKey: incident.areaKey, incidentId: incident.id, employerId: work.site.employerId,
      sourceEventId, year: s.year, month: s.mo, status: "contacted", closedAt: null, contractId: null });
    return true;
  }
  if (action.action === "end-contact") {
    const contact = [...state.contacts].reverse().find(row => row.areaKey === s.community?.key && row.status === "contacted");
    if (!contact) return false;
    contact.status = "closed";
    contact.closedAt = { year: s.year, month: s.mo, sourceEventId };
    return true;
  }
  if (action.action === "offer") {
    const incident = activeInfrastructureIncident(s), work = artsCurrentWorksite(s),
      contact = [...state.contacts].reverse().find(row => row.areaKey === s.community?.key &&
        row.employerId === work?.site?.employerId && row.status === "contacted");
    compactContingencyContracts(s);
    if (!incident || !work || !contact || state.items.length >= 64 ||
        activeContingencyContract(s, ["offered", "accepted", "prepared", "travelling", "at-site", "awaiting-verification", "awaiting-payment", "payment-disputed"])) return false;
    const sequence = ++state.sequence, id = `contingency:${s.personId || "protagonist"}:${sequence}`,
      kind = incident.kind === "route" ? "forecast-survey" : incident.kind === "water" ? "relief-logistics" : "infrastructure-support",
      requirement = kind === "forecast-survey" ? { requiredSkillId: "unit-inspection", requiredSkillLevel: 10 } :
        kind === "infrastructure-support" ? { requiredSkillId: "unit-maintenance", requiredSkillLevel: 12 } :
          { requiredSkillId: null, requiredSkillLevel: 0 };
    const rhodesMember = s.fl?.rhodes === 1 && s.lifeRecord?.affiliations?.some(row =>
      row.id?.startsWith("rhodes") && ["active", "crisis"].includes(row.status));
    state.items.push({ id, assignmentId: id + ":assignment", kind, status: "offered",
      areaKey: incident.areaKey, incidentId: incident.id, employerId: work.site.employerId,
      receiverId: rhodesMember ? work.site.employerId : incident.areaKey,
      receiverType: rhodesMember ? "organization" : "community",
      ...requirement,
      destinationRegion: s.res.n, nominalCash: 12000, createdAt: { year: s.year, month: s.mo },
      expiresAfterMonths: 6, travelJourneyId: null, settlementId: null, paidAmount: 0,
      disclosedCargo: action.mode !== "undisclosed-cargo",
      history: [{ status: "offered", year: s.year, month: s.mo, sourceEventId }] });
    contact.status = "offer-issued"; contact.contractId = id;
    return true;
  }
  if (!contract) return false;
  const record = (status, details = {}) => {
    contract.status = status;
    contract.history.push({ status, year: s.year, month: s.mo, sourceEventId, ...details });
    contract.history = contract.history.slice(-32);
  };
  if (action.action === "decline" && contract.status === "offered") {
    record("declined", { reason: "player-declined" }); contract.closedAt = { year: s.year, month: s.mo };
    closeContingencyContact(state, contract, s, sourceEventId); compactContingencyContracts(s); return true;
  }
  if (action.action === "cancel" && ["offered", "accepted", "prepared"].includes(contract.status)) {
    record("cancelled", { reason: "player-withdrew-before-departure" });
    contract.closedAt = { year: s.year, month: s.mo };
    const contact = state.contacts.find(row => row.contractId === contract.id);
    if (contact) { contact.status = "closed"; contact.closedAt = { year: s.year, month: s.mo, sourceEventId }; }
    compactContingencyContracts(s);
    return true;
  }
  if (action.action === "accept" && contract.status === "offered" && !restricted(s) && s.age >= 18) {
    const assessment = contingencySkillAssessment(s, contract);
    if (!assessment.eligible) {
      contract.skillAssessment = { ...assessment, assessedAt: { year: s.year, month: s.mo },
        sourceEventId, result: "eligibility-insufficient" };
      return false;
    }
    record("accepted", { consentedAt: { year: s.year, month: s.mo } });
    contract.acceptedAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "review-eligibility" && contract.status === "offered") {
    const assessment = contingencySkillAssessment(s, contract);
    contract.skillAssessment = { ...assessment,
      assessedAt: { year: s.year, month: s.mo }, sourceEventId,
      result: assessment.eligible ? "eligible" : "eligibility-insufficient" };
    return true;
  }
  if (action.action === "prepare" && contract.status === "accepted") {
    const mode = action.mode === "family-plan" ? "family-plan" : action.mode === "equipment" ? "equipment-checked" : "manual-work-plan";
    if (mode === "family-plan") {
      const caregiver = contingencyAvailableCaregiver(s);
      if (!caregiver || !contingencyNeedsCarePlan(s)) return false;
      contract.carePlan = { personId: caregiver.id, year: s.year, month: s.mo, sourceEventId };
    } else if (contingencyNeedsCarePlan(s)) return false;
    record("prepared", { preparation: mode });
    contract.preparation = mode;
    return true;
  }
  if (action.action === "defer-preparation" && contract.status === "accepted") {
    contract.preparationDeferredAt = { year: s.year, month: s.mo, sourceEventId };
    return true;
  }
  if (action.action === "defer-departure" && contract.status === "prepared") {
    delete contract.preparation;
    contract.carePlan = null;
    contract.preparationDeferredAt = { year: s.year, month: s.mo, sourceEventId };
    record("accepted", { reason: "departure-deferred-for-replanning" });
    return true;
  }
  if (action.action === "depart" && contract.status === "prepared" && contingencyCanDepart(s, contract)) {
    const quote = contingencyTravelQuote(s), corridorId = `model-local:${s.res.n}`;
    try {
      const journey = travelStart(s, { purpose: "work", destinationRegion: s.res.n, corridorId,
        durationMonths: 1, prepayReturn: false });
      travelDepart(s);
      contract.travelJourneyId = journey.id;
      record("travelling", { journeyId: journey.id, fare: quote.amount });
      return true;
    } catch { return false; }
  }
  if (action.action === "handoff" && contract.status === "at-site" &&
      travelCurrentJourney(s)?.id === contract.travelJourneyId && travelCurrentJourney(s)?.status === "arrived") {
    record("awaiting-verification", { handedOffAt: { year: s.year, month: s.mo }, receiverId: contract.receiverId });
    contract.handoffId = contract.assignmentId + ":handoff";
    return true;
  }
  if (action.action === "continue-work" && contract.status === "at-site") {
    const next = s.year * 12 + s.mo + 1;
    contract.returnDecisionDueAt = { year: Math.floor((next - 1) / 12), month: ((next - 1) % 12) + 1 };
    contract.continuedWorkAt = { year: s.year, month: s.mo, sourceEventId };
    record("at-site", { workContinued: true });
    return true;
  }
  if (action.action === "survey" && contract.kind === "forecast-survey" && contract.status === "at-site" &&
      travelCurrentJourney(s)?.id === contract.travelJourneyId && travelCurrentJourney(s)?.status === "arrived") {
    contract.survey = { year: s.year, month: s.mo, result: "observed-local-conditions", sourceEventId };
    return true;
  }
  if (action.action === "query-cargo" && ["offered", "accepted"].includes(contract.status) && contract.disclosedCargo === false) {
    contract.cargoQuery = { year: s.year, month: s.mo, sourceEventId, result: "manifest-received",
      contents: "地区向けの救援物資", recipientId: contract.receiverId };
    contract.disclosedCargo = true;
    contract.cargoDisclosure = { year: s.year, month: s.mo, sourceEventId, basis: "sender-provided-manifest" };
    return true;
  }
  if (action.action === "support-equity" && contract.status === "accepted") {
    contract.allocationProposal = { year: s.year, month: s.mo, sourceEventId, result: "shortage-allocation-asked" };
    return true;
  }
  if (action.action === "query-screening" && contract.status === "offered") {
    contract.screeningQuery = { year: s.year, month: s.mo, sourceEventId,
      result: "criteria-requested", observedDiscrimination: false };
    return true;
  }
  if (action.action === "verify-receipt" && contract.status === "awaiting-verification") {
    const incident = infrastructureIncidentById(s, contract.incidentId),
      currentEmployer = artsCurrentWorksite(s)?.site?.employerId,
      receiverExists = incident && incident.areaKey === contract.areaKey &&
        (contract.receiverType === "community" && contract.receiverId === contract.areaKey ||
         contract.receiverType === "organization" && contract.receiverId === currentEmployer &&
           s.fl?.rhodes === 1 && s.lifeRecord?.affiliations?.some(row => row.id?.startsWith("rhodes") &&
             ["active", "crisis"].includes(row.status)));
    if (!receiverExists) return false;
    contract.verifiedAt = { year: s.year, month: s.mo };
    const due = s.year * 12 + s.mo + 1;
    contract.paymentDueAt = { year: Math.floor((due - 1) / 12), month: ((due - 1) % 12) + 1 };
    record("awaiting-payment", { receiptId: contract.assignmentId + ":receipt" });
    return true;
  }
  if (action.action === "dispute-payment" && contract.status === "payment-disputed") {
    if (contract.paymentClaim) return false;
    contract.paymentClaim = { id: contract.assignmentId + ":claim", filedAt: { year: s.year, month: s.mo },
      amount: contract.nominalCash, sourceEventId };
    return true;
  }
  if (action.action === "defer-payment-claim" && contract.status === "payment-disputed" && !contract.paymentClaim) {
    const next = s.year * 12 + s.mo + 1;
    contract.paymentReviewAt = { year: Math.floor((next - 1) / 12), month: ((next - 1) % 12) + 1 };
    contract.paymentReviewDeferredAt = { year: s.year, month: s.mo, sourceEventId };
    return true;
  }
  if (action.action === "mark-payment-missing" && contract.status === "awaiting-payment" && contract.paymentDueAt &&
      s.year * 12 + s.mo >= contract.paymentDueAt.year * 12 + contract.paymentDueAt.month) {
    record("payment-disputed", { reason: "player-reports-no-payment", disputeAt: { year: s.year, month: s.mo } });
    contract.disputeReason = "player-reports-no-payment";
    contract.paymentDisputedAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "settle" && ["awaiting-payment", "payment-disputed"].includes(contract.status)) {
    if (!contract.verifiedAt || !contract.paymentDueAt || contract.settlementId || contract.nominalCash !== 12000 ||
        !s.employmentState?.episodes?.some(row => row.kind === "gig" && row.sourceEventId === "life_cc_payment" && row.startYear === s.year && row.startMonth === s.mo)) return false;
    contract.settlementId = contract.assignmentId + ":settlement";
    contract.paidAmount = contract.nominalCash;
    contract.paidAt = { year: s.year, month: s.mo };
    record("paid", { settlementId: contract.settlementId, amount: contract.paidAmount });
    contract.closedAt = { year: s.year, month: s.mo };
    closeContingencyContact(state, contract, s, sourceEventId);
    compactContingencyContracts(s);
    return true;
  }
  if (action.action === "family-notice" && ["accepted", "prepared", "travelling", "at-site"].includes(contract.status)) {
    const shipment = createFamilyNoticeShipment(s);
    if (!shipment) return false;
    contract.familyNoticeShipmentId = shipment.id;
    contract.familyNoticeAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "return" && ["travelling", "at-site"].includes(contract.status)) {
    const journey = travelCurrentJourney(s);
    if (!journey || journey.id !== contract.travelJourneyId || journey.status === "planned" || journey.returning) return false;
    try { travelBeginReturn(s, { deferPayment: false }); record("travelling", { returnStartedAt: { year: s.year, month: s.mo } }); return true; }
    catch { return false; }
  }
  return false;
}
