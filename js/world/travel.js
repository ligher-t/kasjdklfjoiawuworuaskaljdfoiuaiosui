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
    ...base, mode: "stop", region: leg?.toRegion || null,
    stopId: journey.id + ":destination"
  };
  return base;
}
function travelLegFareQuote(state, fromRegion, toRegion) {
  const route = (MIGRATION_ROUTES[fromRegion] || []).find(row => row.n === toRegion);
  const origin = REG.find(row => row.n === fromRegion);
  if (!route || !origin || !Number.isFinite(route.fare) || route.fare < 0)
    throw Error("Travel route has no valid cost basis");
  const amount = Math.round(route.fare * origin.pm * (state.priceIndex || 1));
  if (!Number.isSafeInteger(amount) || amount < 0)
    throw Error("Travel fare is invalid");
  return { amount, currency: "龍門幣", source: "migration-route-cost-proxy" };
}
function travelDebitLeg(state, journey, leg) {
  const id = leg.id + ":fare";
  const travel = ensureTravelState(state);
  if (travel.transactions[id]) return travel.transactions[id];
  const quote = travelLegFareQuote(state, leg.fromRegion, leg.toRegion);
  const personal = !inSharedHousehold(state);
  const account = personal ? state : state.house;
  if (!account || !Number.isFinite(account.cash) || account.cash < quote.amount)
    throw Error("旅程の運賃を支払える残高がない");
  // The debit, receipt, leg transition and annual expense projection belong
  // to one synchronous commit. The annual projection never charges again.
  account.cash -= quote.amount;
  const transaction = {
    id, kind: "fare", journeyId: journey.id, legId: leg.id,
    amount: quote.amount, currency: quote.currency,
    source: quote.source, paidBy: personal ? "personal" : "household",
    year: state.year, month: state.mo,
    fromRegion: leg.fromRegion, toRegion: leg.toRegion
  };
  travel.transactions[id] = transaction;
  return transaction;
}
function travelAnnualOutflow(state, year, paidBy) {
  return Object.values(state.travelState?.transactions || {})
    .filter(row => row.kind === "fare" && row.year === year && row.paidBy === paidBy)
    .reduce((sum, row) => sum + row.amount, 0);
}
function travelProjectAnnualOutflow(state, year, paidBy) {
  const amount = travelAnnualOutflow(state, year, paidBy);
  const ledger = paidBy === "personal" ? state : state.house;
  if (!amount || !ledger?.flow || ledger.flow.year !== year) return amount;
  // An expense already debited during travel is only reported here.
  ledger.flow.expense.travelFare = amount;
  ledger.flow.net -= amount;
  if (paidBy === "household") ledger.exp += amount;
  return amount;
}
function travelBlocksResidenceEvent(event, state) {
  if (travelPresence(state).mode === "residence") return false;
  const tags = Array.isArray(event.need) ? event.need : [];
  return tags.some(tag => typeof tag === "string" &&
    /^(国|都市|住環境|地勢):/.test(tag));
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
      state.fl?.isolated || (state.age < 18))
    throw Error("Travel permission is unavailable");
  const duration = request?.durationMonths == null ? 1 : request.durationMonths;
  if (!Number.isInteger(duration) || duration < 1 || duration > 24)
    throw Error("Invalid modeled travel duration");
  travelLegFareQuote(state, state.res.n, to);
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
  if (purpose === "wandering") travel.lifestyle = "itinerant";
  return journey;
}
function travelDepart(state) {
  const journey = travelCurrentJourney(state);
  if (!journey || journey.status !== "planned") throw Error("Journey is not planned");
  if (!Number.isInteger(state.mo) || state.mo < 1 || state.mo > 12)
    throw Error("Journey departure requires a known calendar month");
  travelDebitLeg(state, journey, journey.legs[journey.activeLegIndex]);
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
function travelBeginReturn(state) {
  const journey = travelCurrentJourney(state);
  if (!journey || journey.status !== "arrived" || journey.activeLegIndex !== 0 ||
      !(MIGRATION_ROUTES[journey.destinationRegion] || []).some(r => r.n === journey.originRegion))
    throw Error("No confirmed return option from the reached destination");
  if (!Number.isInteger(state.mo) || state.mo < 1 || state.mo > 12)
    throw Error("Return departure month is not known");
  const leg = {
    id: journey.id + ":leg:1",
    routeId: "migration-reference:" + journey.destinationRegion + ":" + journey.originRegion,
    fromRegion: journey.destinationRegion, toRegion: journey.originRegion,
    durationMonths: journey.legs[0].durationMonths,
    checkpointId: null, checkpointRegion: null, sourceKind: "game-model"
  };
  travelDebitLeg(state, journey, leg);
  journey.legs.push(leg);
  journey.activeLegIndex = 1;
  journey.status = "en-route";
  journey.departedAt = {year: state.year, month: state.mo};
  journey.lastProcessed = {year: state.year, month: state.mo};
  return journey;
}
function travelEnd(state, reason) {
  if (!["abandoned", "returned-home", "ended-by-death"].includes(reason))
    throw Error("Unsupported journey conclusion");
  const journey = travelCurrentJourney(state);
  if (!journey) return null;
  if (reason === "abandoned" && journey.status !== "planned")
    throw Error("An actual trip needs a physical return, not an instant cancellation");
  if (reason === "returned-home" &&
      !(journey.status === "arrived" && journey.legs[journey.activeLegIndex].toRegion === journey.originRegion))
    throw Error("The traveler has not returned to their residence");
  journey.status = reason;
  journey.conclusion = {reason, year: state.year, month: state.mo};
  const travel = ensureTravelState(state);
  travel.activeJourneyId = null;
  if (reason === "returned-home" || reason === "abandoned") travel.lifestyle = "settled";
  return journey;
}

function auditTravelState(state) {
  const t = state.travelState;
  if (t == null) return [];
  const errors = [];
  if (t.version !== 1 || !["settled", "itinerant"].includes(t.lifestyle) ||
      !Number.isInteger(t.journeySeq) || t.journeySeq < 0 ||
      !t.journeys || typeof t.journeys !== "object" ||
      !t.transactions || typeof t.transactions !== "object" ||
      !Array.isArray(t.history)) return ["旅程台帳の構造が不正"];
  const active = t.activeJourneyId ? t.journeys[t.activeJourneyId] : null;
  if (t.activeJourneyId && (!active || !TRAVEL_OPEN_STATUSES.includes(active.status)))
    errors.push("活動中の旅程IDが不正");
  for (const [id, tx] of Object.entries(t.transactions)) {
    if (!tx || id !== tx.id || tx.kind !== "fare" || !t.journeys[tx.journeyId] ||
        !Number.isSafeInteger(tx.amount) || tx.amount < 0 ||
        !["personal", "household"].includes(tx.paidBy) ||
        !Number.isInteger(tx.year) || tx.year > state.year ||
        !Number.isInteger(tx.month) || tx.month < 1 || tx.month > 12)
      errors.push("旅費の決済記録が不正");
  }
  const open = Object.values(t.journeys).filter(j => j && TRAVEL_OPEN_STATUSES.includes(j.status));
  if (open.length > 1 || open.length !== (active ? 1 : 0))
    errors.push("未終了旅程が複数または未参照");
  for (const [id, j] of Object.entries(t.journeys)) {
    const leg = j?.legs?.[j.activeLegIndex];
    if (!j || j.id !== id || !TRAVEL_PURPOSES.includes(j.purpose) ||
        !Array.isArray(j.legs) || j.legs.length < 1 || j.legs.length > 2 ||
        !Number.isInteger(j.activeLegIndex) || !leg ||
        !REG.some(r => r.n === j.originRegion) ||
        !REG.some(r => r.n === j.destinationRegion) ||
        !Number.isInteger(j.startedAt?.year) ||
        !Number.isInteger(j.lastProcessed?.year) ||
        !Number.isInteger(j.lastProcessed?.month) ||
        j.lastProcessed.month < 0 || j.lastProcessed.month > 12)
      errors.push("旅程の起点・時点・区間が不正");
    if (j && !["planned","abandoned"].includes(j.status) &&
        !j.legs.every((part, index) => index > j.activeLegIndex ||
          !!t.transactions[part.id + ":fare"]))
      errors.push("実際の旅程に決済記録がない");
    if (j?.status === "at-checkpoint" &&
        (!leg?.checkpointId || leg.checkpointId !== j.currentCheckpointId))
      errors.push("登録されていない検問所で待機");
  }
  return errors;
}
