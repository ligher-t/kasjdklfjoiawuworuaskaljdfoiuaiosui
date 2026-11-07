function createCommunityProjectState() {
  return { version: 1, sequence: 0, items: [], completedArchive: [], terminalIds: [] };
}

function ensureCommunityProjectState(s) {
  if (!s.communityProjects) s.communityProjects = createCommunityProjectState();
  return s.communityProjects;
}

function isValidCommunityProjectState(state, year) {
  if (!state || state.version !== 1 || !Number.isInteger(state.sequence) || state.sequence < 0 ||
      !Array.isArray(state.items) || state.items.length > 32 ||
      !Array.isArray(state.completedArchive) || state.completedArchive.length > 64 ||
      !Array.isArray(state.terminalIds) || state.terminalIds.length > 512 ||
      new Set(state.terminalIds).size !== state.terminalIds.length) return false;
  const ids = new Set();
  for (const row of state.items) {
    if (!row || typeof row.id !== "string" || !row.id || ids.has(row.id) ||
        typeof row.areaKey !== "string" || !row.areaKey || row.kind !== "rural-well" ||
        !["planned", "parts-in-transit", "parts-received", "completed", "cancelled"].includes(row.status) ||
        !Number.isInteger(row.createdAt?.year) || row.createdAt.year > year ||
        !Number.isInteger(row.createdAt?.month) || row.createdAt.month < 1 || row.createdAt.month > 12 ||
        !Number.isInteger(row.helperCount) || row.helperCount < 0 || row.helperCount > 8 ||
        !Number.isSafeInteger(row.donationTotal) || row.donationTotal < 0 || row.donationTotal > 1000000 ||
        !Array.isArray(row.donations) || row.donations.length > 32 ||
        row.donations.some(donation => !donation || typeof donation.id !== "string" || !donation.id ||
          !Number.isSafeInteger(donation.amount) || donation.amount <= 0 || donation.amount > 1000000 ||
          !Number.isInteger(donation.year) || donation.year > year || !Number.isInteger(donation.month) ||
          donation.month < 1 || donation.month > 12 || typeof donation.sourceEventId !== "string" || !donation.sourceEventId ||
          typeof donation.payerId !== "string" || !donation.payerId) ||
        row.donations.reduce((sum, donation) => sum + donation.amount, 0) !== row.donationTotal ||
        typeof row.impactApplied !== "boolean" ||
        (row.status === "completed" && (!row.impactApplied || !row.verifiedAt))) return false;
    ids.add(row.id);
  }
  return state.completedArchive.every(row => row && typeof row.key === "string" && !!row.key &&
    typeof row.areaKey === "string" && !!row.areaKey &&
    Number.isInteger(row.year) && row.year <= year && Number.isInteger(row.lastYear) && row.lastYear >= row.year &&
    row.lastYear <= year && Number.isInteger(row.count) && row.count > 0 &&
    Number.isSafeInteger(row.donations) && row.donations >= 0);
}

function createCulturalPracticeState() {
  return { version: 1, sequence: 0, performances: [], mentoring: [], traditions: [], festivals: [], lastFestivalAt: null };
}

function ensureCulturalPracticeState(s) {
  if (!s.culturalPractice) s.culturalPractice = createCulturalPracticeState();
  return s.culturalPractice;
}

function isValidCulturalPracticeState(state, year) {
  if (!state || state.version !== 1 || !Number.isInteger(state.sequence) || state.sequence < 0 ||
      !Array.isArray(state.performances) || state.performances.length > 24 ||
      !Array.isArray(state.mentoring) || state.mentoring.length > 24 ||
      !Array.isArray(state.traditions) || state.traditions.length > 24 ||
      !Array.isArray(state.festivals) || state.festivals.length > 8) return false;
  const validAt = row => Number.isInteger(row.year) && row.year <= year && Number.isInteger(row.month) && row.month >= 1 && row.month <= 12;
  return state.performances.every(row => row && typeof row.id === "string" && !!row.id && row.kind === "music-performance" && validAt(row)) &&
    state.mentoring.every(row => row && typeof row.id === "string" && !!row.id && typeof row.menteeId === "string" && !!row.menteeId && validAt(row)) &&
    state.traditions.every(row => row && typeof row.id === "string" && !!row.id && row.kind === "oral-tradition" && validAt(row)) &&
    state.festivals.every(row => row && typeof row.id === "string" && !!row.id && typeof row.areaKey === "string" &&
      !!row.areaKey && ["open", "signed-up", "work-complete", "paid", "declined", "expired"].includes(row.status) && validAt(row.createdAt)) &&
    (state.lastFestivalAt == null || validAt(state.lastFestivalAt));
}

function lifeSystemArtsMentoringCandidates(s) {
  if (typeof familyDailyCandidates !== "function") return [];
  return familyDailyCandidates(s).filter(row => row.kind === "child").map(row => row.person)
    .filter(person => {
      const age = Number.isInteger(person.age) ? person.age : Number.isInteger(person.by) ? s.year - person.by : null;
      return !person.d && Number.isInteger(age) && age >= 14 && age < 18 && age < s.age;
    })
    .sort((a, b) => (Number.isInteger(b.age) ? b.age : s.year - b.by) -
      (Number.isInteger(a.age) ? a.age : s.year - a.by) || String(a.id).localeCompare(String(b.id)));
}

function activeCommunityProject(s) {
  return (s?.communityProjects?.items || []).filter(row => row.areaKey === s?.community?.key &&
    ["planned", "parts-in-transit", "parts-received"].includes(row.status))
    .sort((a, b) => a.createdAt.year - b.createdAt.year || a.createdAt.month - b.createdAt.month)[0] || null;
}

function currentCommunityFestival(s) {
  return (s?.culturalPractice?.festivals || []).filter(row => row.areaKey === s?.community?.key &&
    ["open", "signed-up", "work-complete"].includes(row.status))
    .sort((a, b) => b.createdAt.year - a.createdAt.year)[0] || null;
}

function advanceArtsCulture(s) {
  if (!s?.community?.key || !Number.isInteger(s.mo) || s.mo < 1 || s.mo > 12) return;
  const culture = ensureCulturalPracticeState(s);
  if (s.mo === 7 && culture.lastFestivalAt?.year !== s.year &&
      keyedRoll(`community-festival-v1:${s.community.key}:${s.year}`) < 0.55) {
    culture.festivals.push({ id: `festival:${s.community.key}:${s.year}`, areaKey: s.community.key,
      status: "open", createdAt: { year: s.year, month: 7 }, workStartedAt: null,
      workCompletedAt: null, paidAt: null, source: "community-calendar-game-model" });
    culture.lastFestivalAt = { year: s.year, month: 7 };
    culture.festivals = culture.festivals.slice(-8);
  }
  for (const festival of culture.festivals) {
    if (festival.status === "signed-up" &&
        s.year * 12 + s.mo > festival.workStartedAt.year * 12 + festival.workStartedAt.month) {
      festival.status = "work-complete";
      festival.workCompletedAt = { year: s.year, month: s.mo };
    }
    if (festival.status === "open" && s.year > festival.createdAt.year) festival.status = "expired";
  }
}

function ruralWellEligible(s) {
  return !!s?.community?.key && s.home === "固定集落" && s.local?.kind === "小規模な定住地" &&
    (activeInfrastructureIncident(s, ["water"])?.status === "active" || s.community.metrics?.medical < 0.68) && !activeCommunityProject(s);
}

function compactCommunityProjects(s, reserveSlot = false) {
  const state = s?.communityProjects;
  if (!state) return;
  const terminal = state.items.filter(row => ["completed", "cancelled"].includes(row.status))
    .sort((a, b) => (a.closedAt?.year || a.verifiedAt?.year || a.createdAt.year) -
        (b.closedAt?.year || b.verifiedAt?.year || b.createdAt.year) ||
      (a.closedAt?.month || a.verifiedAt?.month || a.createdAt.month) -
        (b.closedAt?.month || b.verifiedAt?.month || b.createdAt.month) || a.id.localeCompare(b.id));
  while (state.items.length >= (reserveSlot ? 32 : 33) && terminal.length) {
    const row = terminal.shift(), year = row.closedAt?.year || row.verifiedAt?.year || row.createdAt.year,
      key = `${year}:${row.areaKey}`, summary = state.completedArchive.find(item => item.key === key);
    if (summary) { summary.count++; summary.donations += row.donationTotal || 0; summary.lastYear = Math.max(summary.lastYear, year); }
    else state.completedArchive.push({ key, year, lastYear: year, areaKey: row.areaKey,
      count: 1, donations: row.donationTotal || 0 });
    state.terminalIds.push(row.id);
    state.items.splice(state.items.findIndex(item => item.id === row.id), 1);
  }
  if (state.completedArchive.length > 64) {
    const oldest = state.completedArchive.splice(0, state.completedArchive.length - 63),
      year = Math.min(...oldest.map(row => row.year)), lastYear = Math.max(...oldest.map(row => row.lastYear)),
      mixed = oldest.some(row => row.areaKey !== oldest[0].areaKey);
    state.completedArchive.unshift({ key: `older:${mixed ? "mixed" : oldest[0].areaKey}:${year}-${lastYear}`, year, lastYear,
      areaKey: mixed ? "mixed" : oldest[0].areaKey, count: oldest.reduce((sum, row) => sum + row.count, 0),
      donations: oldest.reduce((sum, row) => sum + row.donations, 0) });
  }
  if (state.terminalIds.length > 512) state.terminalIds.splice(0, state.terminalIds.length - 512);
}

function createRuralWellProject(s, sourceEventId, donationAmount = 0) {
  const state = ensureCommunityProjectState(s), wallet = inSharedHousehold(s) ? s.house : s;
  if (!ruralWellEligible(s) || ![0, 2500].includes(donationAmount) ||
      (donationAmount > 0 && (!Number.isFinite(wallet?.cash) || wallet.cash < donationAmount))) return null;
  compactCommunityProjects(s, true);
  if (state.items.length >= 32) return null;
  const incident = activeInfrastructureIncident(s, ["water"]), id = `community-project:${s.community.key}:${++state.sequence}`,
    shipment = createShipment(s, { kind: "repair-part", originRef: id, originAreaKey: `supply-dispatch:${s.res.n}`,
      destinationAreaKey: s.community.key, recipientId: `community-project:${id}`, recipientType: "repair-site",
      contentsRef: "well-maintenance-parts", transitMonths: 2 });
  if (!shipment) { state.sequence--; return null; }
  if (donationAmount > 0) wallet.cash -= donationAmount;
  state.items.push({ id, areaKey: s.community.key, incidentId: incident?.id || null, kind: "rural-well",
    status: "parts-in-transit", createdAt: { year: s.year, month: s.mo }, shipmentId: shipment.id,
    helperCount: 0, helperBasis: null, donationTotal: donationAmount,
    donations: donationAmount ? [{ id: `${id}:donation`, amount: donationAmount, year: s.year,
      month: s.mo, sourceEventId, payerId: s.personId || "protagonist" }] : [],
    impactApplied: false, metricAxis: "medical", metricDelta: 0.035, sourceEventId });
  return state.items[state.items.length - 1];
}

function applyCommunityProjectAction(s, action, sourceEventId) {
  const state = ensureCommunityProjectState(s), project = action?.targetId
    ? state.items.find(row => row.id === action.targetId) : activeCommunityProject(s);
  if (action?.action === "propose") return !!createRuralWellProject(s, sourceEventId);
  if (action?.action === "donate") return action.amount === 2500 && !!createRuralWellProject(s, sourceEventId, action.amount);
  if (!project || !action || !sourceEventId || project.areaKey !== s.community?.key) return false;
  if (action.action === "mark-parts-received") {
    const shipment = findShipment(s, project.shipmentId);
    if (!shipment || shipment.status !== "delivered-to-recipient" || project.status !== "parts-in-transit") return false;
    shipment.status = "received-by-recipient";
    shipment.completedAt = { year: s.year, month: s.mo };
    shipment.receiptId = `${shipment.id}:community-project-receipt`;
    project.status = "parts-received";
    project.partsReceivedAt = { year: s.year, month: s.mo };
    return true;
  }
  if (action.action === "record-helpers" && project.status === "parts-received" &&
      !project.helpersRecordedAt && [1, 2].includes(action.helperCount)) {
    project.helperCount = action.helperCount;
    project.helperBasis = action.helperCount === 2
      ? "two-neighbors-agreed-at-the-community-meeting"
      : "one-neighbor-agreed-at-the-community-meeting";
    project.helpersRecordedAt = { year: s.year, month: s.mo, sourceEventId };
    return true;
  }
  if (action.action === "complete-work" && project.status === "parts-received" &&
      project.helperCount >= 2 && !project.impactApplied && s.community.metrics?.[project.metricAxis] < 1) {
    const before = s.community.metrics[project.metricAxis];
    s.community.metrics[project.metricAxis] = Math.min(1, before + project.metricDelta);
    project.status = "completed";
    project.impactApplied = true;
    project.verifiedAt = { year: s.year, month: s.mo, sourceEventId };
    project.metricBefore = before;
    project.metricAfter = s.community.metrics[project.metricAxis];
    s.community.actions ||= [];
    s.community.actions.push({ year: s.year, month: s.mo, kind: "community-project-verified", projectId: project.id,
      metricAxis: project.metricAxis, delta: project.metricAfter - before });
    s.community.actions = s.community.actions.slice(-40);
    return true;
  }
  return false;
}

function applyCulturalPracticeAction(s, action, sourceEventId) {
  const state = ensureCulturalPracticeState(s), festival = currentCommunityFestival(s);
  if (!action || !sourceEventId) return false;
  if (action.action === "record-music-performance") {
    if (!s.fl?.hobby_music && !s.artsProfile?.disciplines?.acoustic?.practice) return false;
    const id = `${sourceEventId}:${s.year}:${s.mo}`;
    if (state.performances.some(row => row.id === id)) return false;
    state.performances.push({ id, year: s.year, month: s.mo, kind: "music-performance",
      sourceEventId, artsTechniqueLearned: false, siteRef: s.community?.key || null });
    state.performances = state.performances.slice(-24);
    return true;
  }
  if (action.action === "record-oral-tradition") {
    if (sourceEventId === "life_arts_tradition_lesson" && s.res?.n !== "サーミ") return false;
    if (!s.neighborContact?.id || !s.culturalIdentity?.homeLanguage) return false;
    const id = `${sourceEventId}:${s.neighborContact.id}:${s.year}`;
    if (state.traditions.some(row => row.id === id)) return false;
    state.traditions.push({ id, year: s.year, month: s.mo, kind: "oral-tradition",
      sourceEventId, neighborId: s.neighborContact.id, languageId: s.culturalIdentity.homeLanguage,
      literacyGranted: false });
    state.traditions = state.traditions.slice(-24);
    return true;
  }
  if (action.action === "record-mentoring") {
    const mentee = lifeSystemArtsMentoringCandidates(s).find(row => row.id === action.menteeId);
    if (!mentee || !(s.artsProfile?.techSkills?.["unit-maintenance"] > 0 ||
      Object.values(s.artsProfile?.disciplines || {}).some(row => row.practice > 0))) return false;
    const id = `${sourceEventId}:${mentee.id}:${s.year}`;
    if (state.mentoring.some(row => row.id === id)) return false;
    state.mentoring.push({ id, menteeId: mentee.id, year: s.year, month: s.mo,
      sourceEventId, subject: "observed-skill-sharing", qualificationGranted: false });
    state.mentoring = state.mentoring.slice(-24);
    return true;
  }
  if (action.action === "sign-up-festival" && festival?.status === "open") {
    festival.status = "signed-up";
    festival.workStartedAt = { year: s.year, month: s.mo };
    festival.sourceEventId = sourceEventId;
    return true;
  }
  if (action.action === "decline-festival" && festival?.status === "open") {
    festival.status = "declined"; festival.closedAt = { year: s.year, month: s.mo }; return true;
  }
  if (action.action === "settle-festival" && festival?.status === "work-complete") {
    const paid = s.employmentState?.episodes?.some(row => row.kind === "gig" &&
      row.sourceEventId === "life_culture_festival_shortjob" && row.startYear === s.year && row.startMonth === s.mo);
    if (!paid || festival.paidAt) return false;
    festival.status = "paid"; festival.paidAt = { year: s.year, month: s.mo };
    return true;
  }
  return false;
}
