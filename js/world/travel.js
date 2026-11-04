// Travel is temporary physical presence. Residence, the move ledger and
// education commuting remain separately owned by their existing systems.
const TRAVEL_PURPOSES = Object.freeze(["wandering", "flight", "work", "family", "study", "other"]);
const TRAVEL_OPEN_STATUSES = Object.freeze([
  "planned", "en-route", "at-stop", "at-checkpoint", "blocked", "arrived"
]);
function ensureTravelState(state) {
  if (!state.travelState) state.travelState = {
    version: 1, lifestyle: "settled", activeJourneyId: null,
    journeySeq: 0, journeys: {}, transactions: {}, history: []
  };
  return state.travelState;
}
function travelCurrentJourney(state) {
  const travel = state?.travelState;
  if (!travel?.activeJourneyId) return null;
  const journey = travel.journeys?.[travel.activeJourneyId] || null;
  return journey && TRAVEL_OPEN_STATUSES.includes(journey.status) ? journey : null;
}
function travelPresence(state) {
  const journey = travelCurrentJourney(state);
  const residence = {
    mode: "residence", region: state?.res?.n || null,
    city: state?.local?.city || null, localityKey: null,
    routeId: null, legId: null, stopId: null, checkpointId: null
  };
  if (!journey || journey.status === "planned") return residence;
  const leg = journey.legs[journey.activeLegIndex];
  const base = {
    mode: "in-transit", region: null, city: null, localityKey: null,
    routeId: leg?.routeId || null, legId: leg?.id || null,
    stopId: null, checkpointId: null
  };
  if (journey.status === "at-checkpoint" && leg?.checkpointId &&
      journey.currentCheckpointId === leg.checkpointId) {
    return { ...base, mode: "checkpoint", region: leg.checkpointRegion || null,
      checkpointId: leg.checkpointId };
  }
  if (journey.status === "at-stop" && journey.currentStopId) {
    return { ...base, mode: "stop", region: journey.currentStopRegion || null,
      stopId: journey.currentStopId };
  }
  if (journey.status === "arrived") return {
    ...base, mode: "stop", region: journey.destinationRegion,
    stopId: journey.id + ":destination"
  };
  return base;
}
function travelStart(state, request) {
  const travel = ensureTravelState(state);
  if (travelCurrentJourney(state)) throw Error("An active journey already exists");
  const purpose = request?.purpose;
  const to = request?.destinationRegion;
  if (!TRAVEL_PURPOSES.includes(purpose) || !REG.some(r => r.n === to) ||
      to === state.res?.n || !(MIGRATION_ROUTES[state.res.n] || []).some(r => r.n === to))
    throw Error("Invalid travel purpose or destination");
  if (state.fl?.detained || state.fl?.ursus_katorga_detained ||
      state.fl?.isolated || (state.age < 18 && !request.guardianConsentRef))
    throw Error("Travel permission is unavailable");
  const duration = request?.durationMonths == null ? 1 : request.durationMonths;
  if (!Number.isInteger(duration) || duration < 1 || duration > 24)
    throw Error("Invalid modeled travel duration");
  const id = "journey:" + (++travel.journeySeq);
  const leg = {
    id: id + ":leg:0", routeId: "migration-reference:" + state.res.n + ":" + to,
    fromRegion: state.res.n, toRegion: to, durationMonths: duration,
    checkpointId: null, checkpointRegion: null, sourceKind: "game-model"
  };
  const journey = {
    id, purpose, status: "planned", startedAt: {year: state.year, month: state.mo},
    originRegion: state.res.n, destinationRegion: to,
    legs: [leg], activeLegIndex: 0, currentCheckpointId: null,
    currentStopId: null, currentStopRegion: null, companions: [],
    permitRefs: [], lastProcessed: {year: state.year, month: state.mo},
    departedAt: null, conclusion: null
  };
  travel.journeys[id] = journey;
  travel.activeJourneyId = id;
  return journey;
}
function travelDepart(state) {
  const journey = travelCurrentJourney(state);
  if (!journey || journey.status !== "planned") throw Error("Journey is not planned");
  if (!Number.isInteger(state.mo) || state.mo < 1 || state.mo > 12)
    throw Error("Journey departure requires a known calendar month");
  journey.status = "en-route";
  journey.departedAt = {year: state.year, month: state.mo};
  journey.lastProcessed = {year: state.year, month: state.mo};
  return journey;
}
function travelMonthIndex(date) {
  return date.year * 12 + date.month;
}
function advanceJourneyThrough(state, year, month) {
  const journey = travelCurrentJourney(state);
  if (!journey || state.dead || !Number.isInteger(month) ||
      month < 1 || month > 12) return journey;
  const target = travelMonthIndex({year, month});
  const last = travelMonthIndex(journey.lastProcessed);
  if (target <= last) return journey;
  // A planned journey and a blocked checkpoint never move autonomously.
  if (journey.status === "en-route" && journey.departedAt) {
    const leg = journey.legs[journey.activeLegIndex];
    const arrival = travelMonthIndex(journey.departedAt) + leg.durationMonths;
    if (target >= arrival) {
      journey.status = "arrived";
      journey.arrivedAt = {year: Math.floor((arrival - 1) / 12),
        month: ((arrival - 1) % 12) + 1};
    }
  }
  journey.lastProcessed = {year, month};
  return journey;
}
function travelMarkCheckpoint(state, checkpoint) {
  const journey = travelCurrentJourney(state);
  const leg = journey?.legs[journey.activeLegIndex];
  // No checkpoint is invented from MIGRATION_ROUTES or an inactive world flag.
  if (!leg?.checkpointId || journey.status !== "en-route" ||
      leg.checkpointId !== checkpoint?.id)
    throw Error("Checkpoint is not registered on the active leg");
  journey.status = "at-checkpoint";
  journey.currentCheckpointId = checkpoint.id;
  return journey;
}
function travelEnd(state, reason) {
  if (!["abandoned", "ended-by-death"].includes(reason))
    throw Error("Unsupported journey conclusion");
  const journey = travelCurrentJourney(state);
  if (!journey) return null;
  journey.status = reason;
  journey.conclusion = {reason, year: state.year, month: state.mo};
  ensureTravelState(state).activeJourneyId = null;
  return journey;
}
