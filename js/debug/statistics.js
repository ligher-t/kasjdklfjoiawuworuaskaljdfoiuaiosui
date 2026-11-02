// Shared counters. Debug simulations reset these without changing game state.
const STAT = {
  ev: {},
  dc: {},
  deathOrigins: {},
  deathCohorts: {},
  eventCoverage: {},
  choiceAvailability: {},
  choiceOutcomes: {},
  recentEvents: [],
  lifeMetrics: [],
  lifeEventYears: new Set(),
  totalSlots: 0,
  postDeathSlotAttempts: 0,
  postDeathFireAttempts: 0,
  choiceBlocked: 0,
  duplicateChoiceMonths: 0,
  unavailableChoiceCandidates: 0,
  choiceMonths: new Set(),
  deadlinePending: new Map(),
  deadlineFired: new Set(),
  deadlineCoverage: {observed:0,delivered:0,expiredUnserved:0,censored:0,byEvent:{},missedExamples:[]},
  currentLife: -1
};

function resetSimulationStatistics() {
  STAT.ev = {};
  STAT.dc = {};
  STAT.deathOrigins = {};
  STAT.deathCohorts = {};
  STAT.eventCoverage = Object.fromEntries(EV.map(event => [event.id, {
    type: event.c ? "choice" : "daily",
    evaluated: 0,
    eligibleSlots: 0,
    candidateSlots: 0,
    fired: 0,
    blocked: 0,
    unavailableChoiceSlots: 0,
    monthlyChoiceBlocked: 0,
    rejections: {},
    stages: {}
  }]));
  STAT.choiceAvailability = {};
  STAT.choiceOutcomes = {};
  STAT.recentEvents = [];
  STAT.lifeMetrics = [];
  STAT.lifeEventYears = new Set();
  STAT.totalSlots = 0;
  STAT.op = {};
  STAT.postDeathSlotAttempts = 0;
  STAT.postDeathFireAttempts = 0;
  STAT.choiceBlocked = 0;
  STAT.duplicateChoiceMonths = 0;
  STAT.unavailableChoiceCandidates = 0;
  STAT.choiceMonths = new Set();
  STAT.deadlinePending = new Map();
  STAT.deadlineFired = new Set();
  STAT.deadlineCoverage = {observed:0,delivered:0,expiredUnserved:0,censored:0,byEvent:{},missedExamples:[]};
  STAT.currentLife = -1;
  STAT.currentEventId = null;
}

function recordSimulationSlot(stage, eligible, candidates) {
  if (!HL) return;
  STAT.totalSlots++;
  for (const event of eligible) {
    const row = STAT.eventCoverage[event.id];
    if (!row) continue;
    row.evaluated++;
    row.eligibleSlots++;
    row.stages[stage] ||= { eligible: 0, candidates: 0, fired: 0 };
    row.stages[stage].eligible++;
  }
  for (const event of candidates) {
    const row = STAT.eventCoverage[event.id];
    if (!row) continue;
    row.candidateSlots++;
    row.stages[stage] ||= { eligible: 0, candidates: 0, fired: 0 };
    row.stages[stage].candidates++;
  }
}

function recordSimulationEligibilityRejection(event, reason) {
  if (!HL) return;
  const row = STAT.eventCoverage[event.id];
  if (!row) return;
  row.evaluated++;
  if (reason === "no-actionable-choice") {
    row.unavailableChoiceSlots++;
    STAT.unavailableChoiceCandidates++;
  }
  row.rejections[reason] = (row.rejections[reason] || 0) + 1;
}

// Count each actionable final-year event once per person-year, even when
// it remains a candidate through multiple monthly slots.
function recordSimulationExpiringChoices(state, events) {
  if (!HL) return;
  for (const event of events) {
    const existing = STAT.deadlinePending.get(event.id);
    if (existing) existing.lastMonth = state.mo;
    else STAT.deadlinePending.set(event.id, {firstMonth:state.mo,lastMonth:state.mo});
  }
}
function finalizeSimulationDeadlineYear(state, interrupted = false) {
  if (!HL) return;
  for (const [id, window] of STAT.deadlinePending) {
    const summary = STAT.deadlineCoverage,
      row = summary.byEvent[id] || (summary.byEvent[id] = {observed:0,delivered:0,expiredUnserved:0,censored:0});
    summary.observed++; row.observed++;
    const status = STAT.deadlineFired.has(id) ? "delivered" :
      interrupted ? "censored" : "expiredUnserved";
    summary[status]++; row[status]++;
    if (status === "expiredUnserved" && summary.missedExamples.length < 30)
      summary.missedExamples.push({
        lifeIndex:STAT.currentLife+1, eventId:id, year:state.year,
        age:state.age, region:state.res?.n || null,
        firstEligibleMonth:window.firstMonth, lastEligibleMonth:window.lastMonth,
        lastProcessedMonth:state.mo
      });
  }
  STAT.deadlinePending.clear();
  STAT.deadlineFired.clear();
}
function recordSimulationEvent(event, state) {
  if (!HL) return;
  if (Number.isInteger(state?.year)) STAT.lifeEventYears.add(state.year);
  if (event.c) STAT.deadlineFired.add(event.id);
  const row = STAT.eventCoverage[event.id];
  const stage = STG[stg(state)] || "不明";
  if (row) {
    row.fired++;
    row.stages[stage] ||= { eligible: 0, candidates: 0, fired: 0 };
    row.stages[stage].fired++;
  }
  STAT.recentEvents.push({
    life: STAT.currentLife + 1,
    eventId: event.id,
    kind: event.c ? "choice" : "daily",
    year: state.year,
    month: state.mo,
    age: state.age,
    choiceIndex: null,
    outcomeIndex: null
  });
  if (STAT.recentEvents.length > 12) STAT.recentEvents.shift();
}

function recordSimulationChoiceAvailability(event, states) {
  if (!HL) return;
  const rows = STAT.choiceAvailability[event.id] || (STAT.choiceAvailability[event.id] = {});
  const coverage = STAT.eventCoverage[event.id];
  for (const row of states) {
    const current = rows[row.index] || (rows[row.index] = { evaluated: 0, shown: 0, hidden: 0, enabled: 0, gateBlocked: 0, ethicalBlocked: 0 });
    current.evaluated++;
    if (row.shown) current.shown++;
    else current.hidden++;
    if (row.enabled) current.enabled++;
    if (row.shown && row.gateEnabled === false) current.gateBlocked++;
    if (row.ethicalBlocked) current.ethicalBlocked++;
  }
  if (coverage && states.length && !states.some(row => row.enabled)) coverage.blocked++;
}

function recordSimulationOutcome(event, choiceIndex, outcomeIndex) {
  if (!HL) return;
  const eventRows = STAT.choiceOutcomes[event.id] || (STAT.choiceOutcomes[event.id] = {});
  const choiceRows = eventRows[choiceIndex] || (eventRows[choiceIndex] = {});
  choiceRows[outcomeIndex] = (choiceRows[outcomeIndex] || 0) + 1;
  const recent = STAT.recentEvents[STAT.recentEvents.length - 1];
  if (recent?.eventId === event.id) {
    recent.choiceIndex = choiceIndex;
    recent.outcomeIndex = outcomeIndex;
  }
}

// Restore the exact key set as well as values, including pre-run reference identities.
function restoreSimulationStatistics(saved) {
  for (const key of Object.keys(STAT)) if (!Object.prototype.hasOwnProperty.call(saved, key)) delete STAT[key];
  Object.assign(STAT, saved);
}

function recordSimulationDeath(s) {
  const cause=s.dc || "不明",origin=s.deathOrigin || "unknown",
    ageBand=s.age<18?"under-18":s.age<50?"18-49":"50-plus";
  STAT.dc[cause]=(STAT.dc[cause]||0)+1;
  STAT.deathOrigins[origin]=(STAT.deathOrigins[origin]||0)+1;
  const byOrigin=STAT.deathCohorts[ageBand] ||= {},counts=byOrigin[origin] ||= {};
  counts[cause]=(counts[cause]||0)+1;
}
