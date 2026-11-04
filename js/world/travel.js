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
// A trip remains physically away from the home school until an actual return.
// Re-reading a completed year must consult dated legs rather than today's address.
function travelAwayDuringMonth(state, year, month) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12)
    return false;
  const date = year * 12 + month;
  return Object.values(state.travelState?.journeys || {}).some(journey => {
    const departure = journey.legs?.[0]?.departedAt;
    if (!departure) return false;
    const from = departure.year * 12 + departure.month;
    const conclusion = journey.conclusion;
    const through = conclusion?.reason === "returned-home"
      ? conclusion.year * 12 + conclusion.month : Infinity;
    return date >= from && date <= through;
  });
}
// Home-bound work uses the actual months spent away. Portable assignments
// require their own contract evidence before being treated as uninterrupted.
function travelHomeWorkIncomeShare(state, year) {
  if (!state || !contractEligibleJob(state)) return 1;
  let available = 0;
  for (let month = 1; month <= 12; month++)
    if (!travelAwayDuringMonth(state, year, month)) available++;
  return available / 12;
}
function travelResidentMinorChildren(state) {
  return (state.kids || []).filter(child =>
    child && !child.d && Number.isInteger(child.by) &&
    state.year - child.by < 18 && state.year >= child.by &&
    child.householdStatus !== "independent" &&
    !["former", "former_support"].includes(child.householdResidencePlan) &&
    (!state.residenceBase || !child.residenceBaseId ||
      child.residenceBaseId === state.residenceBase.id));
}
function travelFamilyCareAgreement(state) {
  const children = travelResidentMinorChildren(state);
  if (!children.length) return null;
  const spouse = state.sp;
  if (!spouse || spouse.d || !spouse.id || !spouseLivesWithProtagonist(state))
    throw Error("同居する未成年の子の見守りを引き受ける大人が確認されていない");
  const travel = ensureTravelState(state);
  const childIds = children.map(child => child.id).filter(Boolean).sort();
  if (childIds.length !== children.length)
    throw Error("同居する未成年の子の本人IDが未記録");
  const id = ["travel-care", state.year, spouse.id, ...childIds].join(":");
  if (travel.familyCareAgreements?.[id]) return travel.familyCareAgreements[id];
  // One simulated response per year and set of children. A refused answer
  // is persistent, and it cannot be re-rolled by reopening the controls.
  const approved = keyedRoll("terra-travel-family-care-v1:" + id) < 0.7;
  const agreement = {
    id, year: state.year, caregiverId: spouse.id,
    childIds, status: approved ? "granted" : "refused",
    basis: "game-model-family-response"
  };
  (travel.familyCareAgreements ||= {})[id] = agreement;
  return agreement;
}
function travelValidateFamilyCare(state, agreementId) {
  const children = travelResidentMinorChildren(state);
  if (!children.length) return {kind:"solo",caregiverId:null,childIds:[],agreementId:null};
  const spouse = state.sp;
  if (!spouse || spouse.d || !spouse.id || !spouseLivesWithProtagonist(state))
    throw Error("同居する未成年の子の見守り役が不在");
  const ids = children.map(c=>c.id).sort();
  const agreement = state.travelState?.familyCareAgreements?.[agreementId];
  if (!agreement || agreement.id !== agreementId || agreement.year !== state.year ||
      agreement.status !== "granted" || agreement.caregiverId !== spouse.id ||
      agreement.childIds.length !== ids.length ||
      !agreement.childIds.every((id,index)=>id===ids[index]))
    throw Error("家族の見守りについて有効な同意記録がない");
  return {kind:"solo-care-arranged",caregiverId:spouse.id,childIds:ids,agreementId};
}
function travelRefreshFamilyCare(state, agreementId) {
  const journey = travelCurrentJourney(state);
  if (!journey || journey.status !== "planned") throw Error("出発前の行程だけ家族の見守りを更新できる");
  journey.householdCare = travelValidateFamilyCare(state, agreementId);
  return journey;
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
function travelProjectAnnualOutflow(state, closingYear, paidBy) {
  // Annual finances close the preceding calendar year after advanceAnnualCalendar
  // has already moved state.year forward.
  const amount = travelAnnualOutflow(state, closingYear - 1, paidBy);
  const ledger = paidBy === "personal" ? state : state.house;
  if (!amount || !ledger?.flow || ledger.flow.year !== closingYear) return amount;
  // An expense already debited during travel is only reported here.
  ledger.flow.expense.travelFare = amount;
  ledger.flow.net -= amount;
  if (paidBy === "household") ledger.exp += amount;
  return amount;
}
function travelBlocksResidenceEvent(event, state) {
  if (travelPresence(state).mode === "residence") return false;
  const tags = Array.isArray(event.need) ? event.need : [];
  const move = fx => !!fx && !!(fx.res || fx.resTo || fx.returnToLocality || fx.home || fx.localCity);
  return tags.some(tag => typeof tag === "string" &&
    /^(国|都市|住環境|地勢):/.test(tag)) ||
    move(event.fx) ||
    (event.c || []).some(choice => (choice.o || []).some(result => move(result[2])));
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
  const householdCare = travelValidateFamilyCare(state, request?.familyCareAgreementId || null);
  travelLegFareQuote(state, state.res.n, to);
  const prepayReturn = request?.prepayReturn === true;
  if (prepayReturn && !(MIGRATION_ROUTES[to] || []).some(row => row.n === state.res.n))
    throw Error("帰路の運賃を確保できる往復経路がない");
  if (prepayReturn) travelLegFareQuote(state, to, state.res.n);
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
    householdCare, permitRefs: [], lastProcessed: {year: state.year, month: state.mo},
    returnReservation: prepayReturn ? {
      legId: id + ":leg:1", fromRegion: to, toRegion: state.res.n, status: "pending"
    } : null,
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
  const actualCare = travelValidateFamilyCare(state, journey.householdCare?.agreementId);
  if (JSON.stringify(actualCare) !== JSON.stringify(journey.householdCare))
    throw Error("旅程の家族見守り計画を更新してから出発する必要がある");
  const outbound = journey.legs[journey.activeLegIndex];
  if (journey.returnReservation?.status === "pending") {
    const reserve = journey.returnReservation;
    const required = travelLegFareQuote(state, outbound.fromRegion, outbound.toRegion).amount +
      travelLegFareQuote(state, reserve.fromRegion, reserve.toRegion).amount;
    const wallet = inSharedHousehold(state) ? state.house : state;
    if (!wallet || !Number.isFinite(wallet.cash) || wallet.cash < required)
      throw Error("往復運賃を先払いできる残高がない");
    travelDebitLeg(state, journey, outbound);
    travelDebitLeg(state, journey, {id:reserve.legId,fromRegion:reserve.fromRegion,toRegion:reserve.toRegion});
    reserve.status = "paid";
  } else travelDebitLeg(state, journey, outbound);
  journey.status = "en-route";
  journey.departedAt = {year: state.year, month: state.mo};
  journey.legs[journey.activeLegIndex].departedAt = { ...journey.departedAt };
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
      leg.arrivedAt = { ...journey.arrivedAt };
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
  leg.departedAt = { ...journey.departedAt };
  journey.lastProcessed = {year: state.year, month: state.mo};
  return journey;
}
function travelDeathLocation(state) {
  const journey = travelCurrentJourney(state);
  if (!journey || journey.status === "planned") return null;
  const leg = journey.legs?.[journey.activeLegIndex];
  if (!leg) return null;
  const presence = travelPresence(state);
  const label = presence.mode === "checkpoint" && presence.region
    ? presence.region + "の検問所付近"
    : presence.mode === "stop" && presence.region
      ? presence.region + "の旅先"
      : leg.fromRegion + "から" + leg.toRegion + "への移動途上";
  return {
    journeyId: journey.id, legId: leg.id, status: journey.status,
    fromRegion: leg.fromRegion, toRegion: leg.toRegion,
    presenceMode: presence.mode, label, year: state.year,
    month: Number.isInteger(state.mo) && state.mo > 0 ? state.mo : null
  };
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
  for (const agreement of Object.values(t.familyCareAgreements || {})) {
    if (!agreement || typeof agreement.id !== "string" ||
        !["granted","refused"].includes(agreement.status) ||
        agreement.basis !== "game-model-family-response" ||
        !Number.isInteger(agreement.year) || agreement.year > state.year ||
        !Array.isArray(agreement.childIds))
      errors.push("旅程の家族同意記録が不正");
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
    if (j?.returnReservation) {
      const reserve = j.returnReservation, receipt = t.transactions[reserve.legId + ":fare"];
      if (!["pending","paid"].includes(reserve.status) ||
          reserve.fromRegion !== j.destinationRegion ||
          reserve.toRegion !== j.originRegion ||
          (reserve.status === "paid" && (!receipt || receipt.fromRegion !== reserve.fromRegion ||
            receipt.toRegion !== reserve.toRegion)) ||
          (reserve.status === "pending" && receipt))
        errors.push("帰路運賃の事前決済が不正");
    }
    if (j?.householdCare?.childIds?.length) {
      const agreement = t.familyCareAgreements?.[j.householdCare.agreementId];
      if (!agreement || agreement.status !== "granted" ||
          agreement.caregiverId !== j.householdCare.caregiverId)
        errors.push("旅程の家族見守り同意が失われている");
    }
    if (j?.status === "at-checkpoint" &&
        (!leg?.checkpointId || leg.checkpointId !== j.currentCheckpointId))
      errors.push("登録されていない検問所で待機");
  }
  return errors;
}
