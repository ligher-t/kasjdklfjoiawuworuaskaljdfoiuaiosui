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
    city: state?.local?.city || null, localityKey: state?.local?.placeId||null,
    routeId: null, legId: null, stopId: null, checkpointId: null
  };
  if (!journey || journey.status === "planned") return residence;
  const leg = journey.legs[journey.activeLegIndex];
  const base = {
    mode: "in-transit", region: null, city: null, localityKey: null,
    routeId: leg?.routeId || null, legId: leg?.id || null,
    stopId: null, checkpointId: null,journeyId:journey.id
  };
  if (journey.status === "at-checkpoint" && leg?.checkpointId &&
      journey.currentCheckpointId === leg.checkpointId) {
    return { ...base, mode: "checkpoint", region: leg.checkpointRegion || null,
      checkpointId: leg.checkpointId };
  }
  if (["at-stop","blocked"].includes(journey.status) && journey.currentStopId) {
    return { ...base, mode: "stop", region: journey.currentStopRegion || null,
      stopId: journey.currentStopId };
  }
  if (journey.status === "arrived") return {
    ...base, mode: "stop", region: leg?.toRegion || null,
    stopId: journey.id + ":destination",city:leg.returnToBase?state.local?.city||null:leg.toLocation?.city||null,
    localityKey:leg.toLocation?.localityKey||journey.id+":stop:"+journey.activeLegIndex
  };
  return base;
}
// A trip remains physically away from the home school until an actual return.
// Re-reading a completed year must consult dated legs rather than today's address.
function travelAwayDuringMonth(state, year, month,personId="protagonist") {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12)
    return false;
  const date = year * 12 + month;
  return Object.values(state.travelState?.journeys || {}).some(journey => {
    if(personId!=="protagonist"&&!journey.companions?.some(x=>x.personId===personId))return false;
    const departure = journey.legs?.[0]?.departedAt;
    if (!departure) return false;
    const from = departure.year * 12 + departure.month;
    const conclusion = journey.conclusion;
    const through = conclusion
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
function travelFamilyCareAgreement(state,companionIds=[]) {
  const children = travelResidentMinorChildren(state).filter(x=>!companionIds.includes(x.id));
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
function travelValidateFamilyCare(state, agreementId,companions=[]) {
  const children = travelResidentMinorChildren(state).filter(c=>!companions.some(x=>x.personId===c.id));
  if (!children.length) return {kind:"solo",caregiverId:null,childIds:[],agreementId:null};
  const spouse = state.sp;
  if (!spouse || spouse.d || !spouse.id || !spouseLivesWithProtagonist(state))
    throw Error("同居する未成年の子の見守り役が不在");
  if(companions.some(x=>x.personId===spouse.id))throw Error("同行する配偶者を留守中の見守り役にはできない");
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
  journey.householdCare = travelValidateFamilyCare(state, agreementId,journey.companions);
  return journey;
}
function travelLegFareQuote(state, fromRegion, toRegion) {
  if(fromRegion===toRegion&&REG.some(x=>x.n===fromRegion))return {amount:Math.round(20000*(state.priceIndex||1)),currency:"龍門幣",source:"registered-local-transport-model"};
  const route = (MIGRATION_ROUTES[fromRegion] || []).find(row => row.n === toRegion);
  const origin = REG.find(row => row.n === fromRegion);
  if (!route || !origin || !Number.isFinite(route.fare) || route.fare < 0)
    throw Error("この経路の運賃が未確認");
  const amount = Math.round(route.fare * origin.pm * (state.priceIndex || 1));
  if (!Number.isSafeInteger(amount) || amount < 0)
    throw Error("運賃が不正");
  return { amount, currency: "龍門幣", source: "migration-route-cost-proxy" };
}
function travelDebitLeg(state, journey, leg) {
  const id = leg.id + ":fare";
  const travel = ensureTravelState(state);
  if (travel.transactions[id]) return travel.transactions[id];
  if(leg.fareReceiptId&&travel.transactions[leg.fareReceiptId])return travel.transactions[leg.fareReceiptId];
  const quote = leg.fareOverride==null?travelLegFareQuote(state, leg.fromRegion, leg.toRegion):
    {amount:leg.fareOverride,currency:"龍門幣",source:"confirmed-return-quote"};
  quote.amount*=1+(journey.companions?.length||0)+(journey.guardianEscort?1:0);
  const personal = !inSharedHousehold(state);
  const account = personal ? state : state.house;
  const credit=leg.returnFareCredit===true&&!!leg.returnAlongRoute;
  if (!account || !Number.isFinite(account.cash) || account.cash<0 || account.cash < quote.amount&&!credit)
    throw Error("旅程の運賃を支払える残高がない");
  // The debit, receipt, leg transition and annual expense projection belong
  // to one synchronous commit. The annual projection never charges again.
  const paid=Math.min(account.cash,quote.amount),unpaid=quote.amount-paid;
  account.cash-=paid;
  if(unpaid)account.debt=(account.debt||0)+unpaid;
  const transaction = {
    id, kind: "fare", journeyId: journey.id, legId: leg.id,
    amount: quote.amount, currency: quote.currency,
    ...(credit?{paid,unpaid,creditorId:leg.returnAlongRoute+":return-operator",creditBasis:"S:individual-deferred-return-fare"}:{}),
    source: quote.source, paidBy: personal ? "personal" : "household",
    year: state.year, month: state.mo,
    fromRegion: leg.fromRegion, toRegion: leg.toRegion
  };
  travel.transactions[id] = transaction;
  return transaction;
}
// Each charge is an additional, modeled overnight/road provision expense.
// The annual household and personal living budgets still cover the home.
function travelStayQuote(state, region) {
  const area = REG.find(row => row.n === region);
  const base = P("economy.minimumExpenseBase");
  if (!area || !Number.isFinite(area.pm) || area.pm <= 0 ||
      !Number.isFinite(base) || base <= 0)
    throw Error("旅先の食宿費を算定する地域情報がない");
  const amount = Math.max(1, Math.round(base * area.pm * (state.priceIndex || 1) * 0.25 / 12));
  if (!Number.isSafeInteger(amount)) throw Error("旅先の食宿費が計算範囲を超えた");
  return {amount,currency:"龍門幣",source:"temporary-stay-cost-game-model"};
}
function travelChargeStayMonth(state, journey, year, month, region) {
  if (journey.status === "planned") return null;
  const id = journey.id + ":stay:" + year + ":" + month;
  const travel = ensureTravelState(state);
  if (travel.transactions[id]) return travel.transactions[id];
  const quote = travelStayQuote(state, region),people=1+(journey.companions?.length||0)+(journey.guardianEscort?1:0);
  quote.amount*=people;
  const support=journey.staySupport,eligibleSupport=support?.status==="approved"&&support.region===region&&
    year*12+month>support.from.year*12+support.from.month;
  const reduction=eligibleSupport?Math.min(quote.amount,support.remaining||0):0;
  const gross=quote.amount;quote.amount-=reduction;
  const personal = !inSharedHousehold(state);
  const account = personal ? state : state.house;
  if (!account || !Number.isFinite(account.cash) || account.cash < 0)
    throw Error("旅先の食宿費を記帳する会計が不正");
  if(reduction)support.remaining-=reduction;
  const paid = Math.min(quote.amount, account.cash);
  const unpaid = quote.amount - paid;
  account.cash -= paid;
  if (unpaid) {
    if (personal) {
      state.unpaidExpenses = (state.unpaidExpenses || 0) + unpaid;
      state.fl ||= {};
      state.fl.insolvent = 1;
    } else {
      // The household budget already recognizes negative balances as debt.
      account.debt = (account.debt || 0) + unpaid;
    }
  }
  const receipt = {
    id,kind:"stay",journeyId:journey.id,legId:journey.legs[journey.activeLegIndex].id,
    amount:quote.amount,paid,unpaid,gross,supportReduction:reduction,currency:quote.currency,
    source:quote.source,paidBy:personal?"personal":"household",
    year,month,region
  };
  travel.transactions[id] = receipt;
  return receipt;
}
function travelStayRegion(journey) {
  if(journey.currentStopRegion)return journey.currentStopRegion;
  const leg = journey.legs[journey.activeLegIndex];
  return journey.status === "arrived" || journey.status === "at-stop"
    ? leg.toRegion : leg.fromRegion;
}
function travelAnnualOutflow(state, year, paidBy, kind = "fare") {
  return Object.values(state.travelState?.transactions || {})
    .filter(row => row.kind === kind && row.year === year && row.paidBy === paidBy)
    .reduce((sum, row) => sum + row.amount, 0);
}
function travelProjectAnnualOutflow(state, closingYear, paidBy) {
  // Annual finances close the preceding calendar year after advanceAnnualCalendar
  // has already moved state.year forward.
  const fare = travelAnnualOutflow(state, closingYear - 1, paidBy, "fare");
  const stay = travelAnnualOutflow(state, closingYear - 1, paidBy, "stay");
  const amount = fare + stay;
  const income=Object.values(state.travelState?.transactions||{}).filter(x=>x.kind==="income"&&x.year===closingYear-1&&x.paidBy===paidBy).reduce((v,x)=>v+x.amount,0);
  const ledger = paidBy === "personal" ? state : state.house;
  if(!ledger?.flow||ledger.flow.year!==closingYear)return amount;
  const previous=ledger.flow.travelProjection||{expense:0,income:0};
  ledger.flow.income ||= {};ledger.flow.expense ||= {};
  if(income)ledger.flow.income.travelWork=income;
  if(fare)ledger.flow.expense.travelFare=fare;if(stay)ledger.flow.expense.travelStay=stay;
  ledger.flow.net+=(income-previous.income)-(amount-previous.expense);
  ledger.inc=(ledger.inc||0)+income-previous.income;
  if(paidBy==="household")ledger.exp=(ledger.exp||0)+amount-previous.expense;
  ledger.flow.travelProjection={expense:amount,income};
  return amount;
}
function travelBlocksResidenceEvent(event, state) {
  if (travelPresence(state).mode === "residence") return false;
  if(event.timelineFlag)return false; // historicalSceneEligibility owns presence.
  const tags = Array.isArray(event.need) ? event.need : [];
  const move = fx => !!fx && !!(fx.res || fx.resTo || fx.returnToLocality || fx.home || fx.localCity);
  return tags.some(tag => typeof tag === "string" &&
    /^(国|都市|住環境|地勢):/.test(tag)) ||
    move(event.fx) ||
    (event.c || []).some(choice => (choice.o || []).some(result => move(result[2])));
}
function travelStart(state, request) {
  const travel = ensureTravelState(state);
  if (travelCurrentJourney(state)) throw Error("進行中の旅程がある");
  const purpose = request?.purpose;
  const to = request?.destinationRegion||travelCorridors(state).find(x=>x.id===request?.corridorId)?.toRegion;
  const local=to===state.res?.n&&travelCorridors(state,state.res.n,to).some(x=>x.id===request?.corridorId);
  if (!TRAVEL_PURPOSES.includes(purpose) || !REG.some(r => r.n === to) ||
      !local&&!(MIGRATION_ROUTES[state.res.n] || []).some(r => r.n === to))
    throw Error("旅の目的または行先が不正");
  if (state.fl?.detained || state.fl?.ursus_katorga_detained ||
      state.fl?.isolated || (state.age < 18 && !travelMinorPermission(state,request)))
    throw Error("出発に必要な了承または移動条件が確認できない");
  const duration = request?.durationMonths == null ? 1 : request.durationMonths;
  if (!Number.isInteger(duration) || duration < 1 || duration > 24)
    throw Error("移動期間が不正");
  const companions=travelValidateCompanions(state,request?.companionAgreementId,to);
  const householdCare = travelValidateFamilyCare(state, request?.familyCareAgreementId || null,companions);
  travelLegFareQuote(state, state.res.n, to);
  const prepayReturn = request?.prepayReturn === true;
  if (prepayReturn && !(MIGRATION_ROUTES[to] || []).some(row => row.n === state.res.n))
    throw Error("帰路の運賃を確保できる往復経路がない");
  if (prepayReturn) travelLegFareQuote(state, to, state.res.n);
  if(request.corridorId&&!travelCorridors(state,state.res.n,to).some(x=>x.id===request.corridorId))throw Error("選択した路線の登録がない");
  const id = "journey:" + (++travel.journeySeq);
  const leg = {
    id: id + ":leg:0", routeId: "migration-reference:" + state.res.n + ":" + to,
    fromRegion: state.res.n, toRegion: to, durationMonths: duration,
    checkpointId: null, checkpointRegion: null, sourceKind: "game-model"
  };
  if(request.corridorId){
    const corridor=travelCorridors(state,state.res.n,to).find(x=>x.id===request.corridorId);
    if(!corridor)throw Error("選択した路線の登録がない");
    leg.routeId=corridor.id;leg.passage=corridor.passage;leg.checkpointId=corridor.checkpoint?.id||null;
    leg.checkpointRegion=corridor.checkpoint?.region||null;
  }
  const journey = {
    id, purpose, status: "planned", startedAt: {year: state.year, month: state.mo},
    originRegion: state.res.n,originCity:state.local?.city||null,originEcology:state.local?.ecology||null,originLocalityKey:localityKey(state),destinationRegion: to,
    finalDestinationRegion:purpose==="wandering"?null:to,
    causeEventId:travel.intent?.status==="planning"&&travel.intent.purpose===purpose&&
      travel.intent.requestedAt?.year===state.year&&travel.intent.originRegion===state.res.n?travel.intent.causeEventId:null,
    legs: [leg], activeLegIndex: 0, currentCheckpointId: null,
    currentStopId: null, currentStopRegion: null, companions,
    companionAgreementId:request?.companionAgreementId||null,
    guardianEscort:state.age<18?travelMinorPermission(state,request):null,
    householdCare, permitRefs: [], lastProcessed: {year: state.year, month: state.mo},
    returnReservation: prepayReturn ? {
      legId: id + ":leg:1", fromRegion: to, toRegion: state.res.n, status: "pending"
    } : null,
    departedAt: null, conclusion: null
  };
  if(travel.intent)travel.intent.status="journey-planned";
  travel.journeys[id] = journey;
  travel.activeJourneyId = id;
  if (purpose === "wandering") travel.lifestyle = "itinerant";
  return journey;
}
function travelDepart(state) {
  const journey = travelCurrentJourney(state);
  if (!journey || journey.status !== "planned") throw Error("出発前の旅程がない");
  if(restricted(state))throw Error("現在は出発できない");
  if(state.age<18&&!travelMinorPermission(state,{destinationRegion:journey.destinationRegion,
    guardianAgreementId:journey.guardianEscort?.id}))throw Error("出発時の保護者の同行了承が確認できない");
  if (!Number.isInteger(state.mo) || state.mo < 1 || state.mo > 12)
    throw Error("出発する年月が未確定");
  const party=travelValidateCompanions(state,journey.companionAgreementId,journey.destinationRegion);
  if(JSON.stringify(party.map(x=>x.personId))!==JSON.stringify(journey.companions.map(x=>x.personId)))throw Error("同行者を再確認する必要がある");
  const actualCare = travelValidateFamilyCare(state, journey.householdCare?.agreementId,party);
  if (JSON.stringify(actualCare) !== JSON.stringify(journey.householdCare))
    throw Error("旅程の家族見守り計画を更新してから出発する必要がある");
  const outbound = journey.legs[journey.activeLegIndex];
  if (journey.returnReservation?.status === "pending") {
    const reserve = journey.returnReservation;
    const required = travelLegFareQuote(state, outbound.fromRegion, outbound.toRegion).amount +
      travelLegFareQuote(state, reserve.fromRegion, reserve.toRegion).amount;
    const partyCost=required*(1+(journey.companions?.length||0)+(journey.guardianEscort?1:0));
    const wallet = inSharedHousehold(state) ? state.house : state;
    if (!wallet || !Number.isFinite(wallet.cash) || wallet.cash < partyCost)
      throw Error("往復運賃を先払いできる残高がない");
    travelDebitLeg(state, journey, outbound);
    travelDebitLeg(state, journey, {id:reserve.legId,fromRegion:reserve.fromRegion,toRegion:reserve.toRegion});
    reserve.status = "paid";
  } else travelDebitLeg(state, journey, outbound);
  journey.status = "en-route";
  journey.departedAt = {year: state.year, month: state.mo};
  journey.legs[journey.activeLegIndex].departedAt = { ...journey.departedAt };
  journey.lastProcessed = {year: state.year, month: state.mo};
  travelChargeStayMonth(state, journey, state.year, state.mo, travelStayRegion(journey));
  travelMonthPresence(state,journey,state.year,state.mo);
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
  // Process every calendar month, including those skipped by annual fast-forward.
  // Arriving at a region changes the cost proxy only from that month onward.
  for (let date = last + 1; date <= target; date++) {
    if (journey.status === "en-route" && journey.departedAt && !restricted(state)) {
      const leg = journey.legs[journey.activeLegIndex];
      const arrival = travelMonthIndex(leg.departedAt||journey.departedAt) + leg.durationMonths;
      if (date >= arrival) {
        const at={year:Math.floor((date-1)/12),month:((date-1)%12)+1},
          cp=travelCheckpointDefinition({...state,year:at.year,mo:at.month},journey);
        if(cp?.active&&!leg.inspectionResolved){journey.status="at-checkpoint";journey.currentCheckpointId=cp.id;}
        else journey.status = "arrived";
        if(journey.status==="arrived"){
        journey.arrivedAt = {year: Math.floor((arrival - 1) / 12),
          month: ((arrival - 1) % 12) + 1};
        leg.arrivedAt = { ...journey.arrivedAt };
        travelRecordHistoryArrival(state,journey);
        }
      }
    }
    if(restricted(state)&&journey.status==="en-route"){
      // Custody pauses this exact leg; it does not establish a new city.
      const part=journey.legs[journey.activeLegIndex];
      part.departedAt={year:Math.floor((date-1)/12),month:((date-1)%12)+1};
      journey.departedAt={...part.departedAt};
    }
    if (journey.status !== "planned") {
      const at = {year:Math.floor((date - 1) / 12),month:((date - 1) % 12) + 1};
      travelChargeStayMonth(state, journey, at.year, at.month, travelStayRegion(journey));
      travelMonthPresence(state,journey,at.year,at.month);
      travelProcessServicesMonth(state,journey,at.year,at.month);
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
      leg.checkpointId !== checkpoint?.id||!travelCheckpointDefinition(state,journey)?.active)
    throw Error("現在の区間に登録された検問所ではない");
  journey.status = "at-checkpoint";
  journey.currentCheckpointId = checkpoint.id;
  return journey;
}
function travelBeginReturn(state,options={}) {
  const j=travelCurrentJourney(state);
  if(!j||j.status==="planned"||restricted(state)||!Number.isInteger(state.mo)||state.mo<1||state.mo>12)
    throw Error("帰路を始める現在地と時点が確認できない");
  const current=j.legs[j.activeLegIndex],presence=travelPresence(state);
  if(j.status==="arrived"&&current.returnToBase)throw Error("既に帰還地点へ到着している");
  const path=j.returnPath?[...j.returnPath]:presence.region===j.originRegion?[j.originRegion]:j.legs.slice(0,j.activeLegIndex+1).reverse().map(x=>x.fromRegion);
  const target=path.shift();if(!target)throw Error("帰路の区間がない");
  const source=presence.region||current.fromRegion,leg={id:travelAllocateLegId(j,source,target),
    routeId:current.routeId+":return",fromRegion:source,toRegion:target,durationMonths:1,
    returnAlongRoute:current.routeId,checkpointId:null,checkpointRegion:null,sourceKind:"S:backtrack-quote"};
  if(options.deferPayment===true)leg.returnFareCredit=true;
  leg.returnToBase=target===j.originRegion&&path.length===0;
  if(j.returnReservation?.status==="paid"&&source===j.returnReservation.fromRegion&&target===j.returnReservation.toRegion)
    leg.fareReceiptId=j.returnReservation.legId+":fare";
  else if(source===target)leg.fareOverride=0;
  else if(!(MIGRATION_ROUTES[source]||[]).some(r=>r.n===target))
    leg.fareOverride=travelLegFareQuote(state,current.fromRegion,current.toRegion).amount;
  travelDebitLeg(state,j,leg);j.returnPath=path;
  if(j.localWork?.status==="active")j.localWork.status="ended";
  j.legs.push(leg);j.activeLegIndex=j.legs.length-1;j.status="en-route";j.returning=true;
  j.currentCheckpointId=null;j.currentStopId=null;j.currentStopRegion=null;
  j.departedAt={year:state.year,month:state.mo};leg.departedAt={...j.departedAt};j.lastProcessed={...j.departedAt};
  return j;
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
    throw Error("旅程の終了理由が不正");
  const journey = travelCurrentJourney(state);
  if (!journey) return null;
  if (reason === "abandoned" && journey.status !== "planned")
    throw Error("出発した旅は、帰還先へ戻ってから終了できる");
  if (reason === "returned-home" &&
      !(journey.status === "arrived" && journey.legs[journey.activeLegIndex].returnToBase))
    throw Error("元の暮らしの場所へまだ戻っていない");
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
    if (!tx || id !== tx.id || !["fare","stay","income"].includes(tx.kind) || !t.journeys[tx.journeyId] ||
        !Number.isSafeInteger(tx.amount) || tx.amount < 0 ||
        !["personal", "household"].includes(tx.paidBy) ||
        !Number.isInteger(tx.year) || tx.year > state.year ||
        !Number.isInteger(tx.month) || tx.month < 1 || tx.month > 12)
      errors.push("旅費の決済記録が不正");
    if (tx?.kind === "stay" &&
        (tx.paid + tx.unpaid !== tx.amount ||
         !Number.isSafeInteger(tx.paid) || tx.paid < 0 ||
         !Number.isSafeInteger(tx.unpaid) || tx.unpaid < 0 ||
         tx.id !== tx.journeyId + ":stay:" + tx.year + ":" + tx.month ||
         !REG.some(r => r.n === tx.region)))
      errors.push("旅先食宿費の決済記録が不正");
    if(tx?.creditBasis&&(!tx.creditorId||tx.creditBasis!=="S:individual-deferred-return-fare"||
      !Number.isSafeInteger(tx.paid)||tx.paid<0||!Number.isSafeInteger(tx.unpaid)||tx.unpaid<0||
      tx.paid+tx.unpaid!==tx.amount))errors.push("帰路の後払い運賃が不正");
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
        !Array.isArray(j.legs) || j.legs.length < 1 || j.legs.length > 64 ||
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
          !!t.transactions[part.fareReceiptId||part.id + ":fare"]))
      errors.push("実際の旅程に決済記録がない");
    if (j?.returnReservation) {
      const reserve = j.returnReservation, receipt = t.transactions[reserve.legId + ":fare"];
      if (!["pending","paid"].includes(reserve.status) ||
          !REG.some(x=>x.n===reserve.fromRegion) ||
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
  return [...errors,...travelLifeInvariants(state)];
}
