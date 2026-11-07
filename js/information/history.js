const informationScopeDecision = (historyEntry, nearby, state = S) => {
  const scope = historyEntry?.infoScope || "public";
  if (scope === "sealed") return { scope, eligible: false, chanceScale: 0 };
  if (scope === "local_news") return { scope, eligible: nearby, chanceScale: 1 };
  if (scope === "local_rumor") return { scope, eligible: nearby, chanceScale: 0.28 };
  if (scope === "faction_only")
    return {
      scope,
      eligible: !!historyEntry.requiredFlag && !!state?.fl?.[historyEntry.requiredFlag],
      chanceScale: 1
    };
  return { scope: "public", eligible: true, chanceScale: 1 };
};
// Spatial match is NOT an eyewitness record. National and regional news ranges
// cannot promote a resident of another city into a participant in the event.
function historicalPlaceScope(historyEntry, state = S) {
  const presence=typeof travelPresence==="function"?travelPresence(state):null;
  const city = presence?presence.city:state?.local?.city || null,
    region = presence?presence.region:state?.res?.n || null,
    cities = [
      ...(Array.isArray(historyEntry?.localCities) ? historyEntry.localCities : []),
      historyEntry?.localCity,
      historyEntry?.city
    ].filter(Boolean),
    regions = [
      ...(Array.isArray(historyEntry?.localRegions) ? historyEntry.localRegions : []),
      historyEntry?.localRegion
    ].filter(Boolean);
  const directPlace = !!city && cities.includes(city) &&
    (!regions.length || regions.includes(region));
  // A region-only source establishes a potential civilian-life impact, not an
  // encounter with the particular battlefield, court, or historical figure.
  const affected = historyEntry?.infoScope!=="sealed"&&(directPlace || (!!region && regions.includes(region)));
  return { city, region, directPlace, affected };
}
function isHistoricalEventLocal(historyEntry, state = S) {
  return historicalPlaceScope(historyEntry, state).directPlace;
}
function historyIsNearby(historyEntry, state = S) {
  // `r` is an information-reach list, including news from other cities.
  return historyEntry?.r === "all" ||
    (Array.isArray(historyEntry?.r) && historyEntry.r.includes(typeof travelPresence==="function"?travelPresence(state).region:state?.res?.n));
}
function recordHistoricalDirectEncounter(historyEntry, state = S, eventId = null,sceneProof=null) {
  if (!historyEntry?.flag || (!(sceneProof?.eligible&&sceneProof.delivery==="direct")&&
      (!isHistoricalEventLocal(historyEntry, state)||state.year!==historyEntry.y)) ||
      !historyAvailabilityReached(historyEntry, state))
    return null;
  const encounters = state.historicalDirectEncounters || (state.historicalDirectEncounters = {});
  return encounters[historyEntry.flag] || (encounters[historyEntry.flag] = {
    eventYear: historyEntry.y,
    year: state.year,
    month: Number.isInteger(state.mo) && state.mo >= 1 ? state.mo : null,
    region: sceneProof?.placeEvidence?.region||state.res.n,
    city: sceneProof?.placeEvidence?.city||state.local.city,
    eventId,
    basis: "event-shown-at-specific-city"
  });
}
function historicalDirectEncounter(historyEntry, state = S) {
  const encounter = state?.historicalDirectEncounters?.[historyEntry?.flag];
  return encounter?.eventYear === historyEntry?.y &&
    encounter.city &&
    encounter.eventId ? encounter : null;
}
function historicalInformationRoute(historyEntry, state = S) {
  if (historicalDirectEncounter(historyEntry, state))
    return "現地での直接の目撃・体験";
  return historyEntry?.r === "all" ? "広域の知らせ" :
    historyIsNearby(historyEntry, state) ? "近隣・地域の伝達網" : "交易商・旅人の伝聞";
}
function historyAvailabilityReached(historyEntry, state = S) {
  if (historyEntry.y < state.year) return true;
  if (historyEntry.y > state.year) return false;
  const month = historyEntry.availableFromMonth;
  return !Number.isInteger(month) || (Number.isInteger(state.mo) && state.mo >= month);
}
function historicalInformationChance(historyEntry, nearby, chanceScale = 1) {
  const channel =
    historyEntry.r === "all"
      ? P("information.globalChance")
      : nearby
        ? P("information.baseNearbyChance")
        : P("information.distantChance");
  const access = P("information.accessBase") + S.local.info * P("information.accessScale"),
    mobility =
      S.home === "移動都市" ? P("information.mobileMobilityScale") : P("information.fixedMobilityScale"),
    delay = Math.max(P("information.delayFloor"), 1 - (S.year - historyEntry.y) * P("information.delayPerYear"));
  return Math.min(P("information.chanceCap"), channel * access * mobility * delay * chanceScale);
}
function activateHistoricalWorldEvents(state = S) {
  const world = state.world || (state.world = { events: {} });
  world.events || (world.events = {});
  HIST.forEach(historyEntry => {
    const id = historyEntry.flag || historyEntry.t;
    if (historyEntry.conf === "S" && !historyEntry.flag) return;
    if (!historyAvailabilityReached(historyEntry, state)) return;
    if (world.events[id] == null) world.events[id] = historyEntry.y;
    if (state.year === historyEntry.y) {
      const location = historicalPlaceScope(historyEntry, state);
      if (location.affected) {
        const impacts = state.historicalPlaceImpacts || (state.historicalPlaceImpacts = {});
        impacts[id] ||= {
          eventYear: historyEntry.y,
          region: location.region,
          city: location.city,
          scope: location.directPlace ? "event-city-residence" : "regional-residence",
          basis: "residence-model-not-confirmed-witness"
        };
      }
    }
  });
}
function announceHistoricalNews(historyEntry, id, route, infoScope) {
  const before = HL && !CAPTURE_TRACE ? null : traceState(S),
    hd = S.hd || (S.hd = {}),
    known = S.known || (S.known = W || {});
  const encounter = historicalDirectEncounter(historyEntry, S),
    placeImpact = S.historicalPlaceImpacts?.[id] || null,
    effectiveRoute = encounter ? "現地での直接の目撃・体験" :
      (route === "現地での直接の目撃・体験" ? historicalInformationRoute(historyEntry, S) : route),
    receivedText = encounter && historyEntry.localText
      ? historyEntry.localText
      : (placeImpact && historyEntry.affectedText) || historyEntry.newsText ||
        historyEntry.publicText || historyEntry.t;
  hd[id] = 1;
  if (historyEntry.flag) known[historyEntry.flag] = 1;
  const source =
    effectiveRoute === "現地での直接の目撃・体験"
      ? "現地直面の体験から"
      : effectiveRoute === "広域の知らせ"
        ? "広く流れる知らせから"
        : effectiveRoute === "近隣・地域の伝達網"
          ? "近隣や地域の伝達網から"
          : "交易商や旅人の話から";
  (S.infoLog || (S.infoLog = [])).push({
    id,
    eventYear: historyEntry.y,
    eventAvailableFromMonth: historyEntry.availableFromMonth ?? null,
    heardYear: S.year,
    heardMonth: Number.isInteger(S.mo) && S.mo >= 1 && S.mo <= CALENDAR_MONTHS ? S.mo : null,
    route: effectiveRoute,
    heardRegion: travelPresence(S).region,
    heardCity: travelPresence(S).city,
    eventRegion: encounter?.region || placeImpact?.region || null,
    eventCity: encounter?.city || placeImpact?.city || null,
    encounterEventId: encounter?.eventId || null,
    exposureBasis: encounter ? encounter.basis :
      placeImpact ? placeImpact.basis : "no-personal-exposure-record",
    settingConfidence: historyEntry.conf || "?",
    infoScope,
    textBasis: encounter && historyEntry.localText ? "現地体験文面" :
      placeImpact && historyEntry.affectedText ? "地域への影響文面" :
      historyEntry.publicText ? "公開範囲に合わせた要約" : "登録文面"
  });
  L(`<span class="${tone(historyEntry.e || {})}">${source}、${receivedText}</span>`);
  // Existing HIST effects are emotional reactions to hearing the report.
  // Material or bodily losses cannot be inferred merely from receiving news.
  const newsEffect = historyEntry.newsEffect ||
    (historyEntry.e && Object.keys(historyEntry.e).every(key => key === "p") ? historyEntry.e : null);
  if (newsEffect) ap(newsEffect);
  recordTrace(
    "world-news",
    id,
    {
      eventYear: historyEntry.y,
      eventAvailableFromMonth: historyEntry.availableFromMonth ?? null,
      heardMonth: Number.isInteger(S.mo) && S.mo >= 1 && S.mo <= CALENDAR_MONTHS ? S.mo : null,
      route: effectiveRoute,
      eventRegion: encounter?.region || placeImpact?.region || null,
      eventCity: encounter?.city || placeImpact?.city || null,
      exposureBasis: encounter?.basis || placeImpact?.basis || "no-personal-exposure-record",
      infoScope,
      text: receivedText
    },
    before
  );
}
function releasePendingHistoricalNews(state = S) {
  const pending = state.pendingHistoricalNews;
  if (!pending) return;
  Object.entries(pending).forEach(([id, queued]) => {
    const historyEntry = HIST.find(row => (row.flag || row.t) === id);
    if (!historyEntry || !historyAvailabilityReached(historyEntry, state)) return;
    // A queued notice is only an attempt to deliver, never proof of an old
    // place, route or present information entitlement.
    const nearby = historyIsNearby(historyEntry, state),
      decision = informationScopeDecision(historyEntry, nearby, state);
    delete pending[id];
    if (state.hd?.[id] || (historyEntry.flag && state.known?.[historyEntry.flag]) ||
        !decision.eligible) return;
    announceHistoricalNews(historyEntry, id, historicalInformationRoute(historyEntry, state), decision.scope);
  });
  if (!Object.keys(pending).length) delete state.pendingHistoricalNews;
}
function hist() {
  repairHistoricalCityName(S);
  const hd = S.hd || (S.hd = {}),
    world = S.world || (S.world = { events: {} }),
    known = S.known || (S.known = W || {});
  world.events || (world.events = {});
  replaceWorldKnowledge(known);
  activateHistoricalWorldEvents(S);
  releasePendingHistoricalNews(S);
  HIST.filter(h => h.y <= S.year).forEach(h => {
    const id = h.flag || h.t;
    if (h.conf === "S" && !h.flag) {
      if (!hd[id]) {
        hd[id] = 1;
        L(h.t);
      }
      return;
    }
    if (S.age < P("information.personalRecallMinimumAge")) return;
    if (h.flag && known[h.flag]) {
      hd[id] = 1;
      return;
    }
    if (hd[id] || S.year - h.y > P("information.historyWindow")) return;
    const available = historyAvailabilityReached(h, S);
    const nearby = historyIsNearby(h, S),
      scopeAccess = informationScopeDecision(h, nearby, S);
    if (!scopeAccess.eligible) {
      if (scopeAccess.scope === "sealed") hd[id] = 1;
      return;
    }
    if (R() >= historicalInformationChance(h, nearby, scopeAccess.chanceScale)) return;
    const route = historicalInformationRoute(h, S);
    if (!available) {
      const queued = S.pendingHistoricalNews || (S.pendingHistoricalNews = {});
      queued[id] = { sampledYear: S.year, sampledMonth: S.mo };
      return;
    }
    announceHistoricalNews(h, id, route, scopeAccess.scope);
  });
}
function recordInformationResponse(s, input, eventId) {
  const allowed = new Set(["household-preparation", "look-up-relief", "withhold-unverified-report"]),
    history = HIST.find(row => row.flag === input?.factId),
    contact = (s.infoLog || []).find(row => row.id === input?.factId);
  if (
    !input ||
    !allowed.has(input.response) ||
    !history ||
    !EV.some(row => row.id === eventId) ||
    !contact ||
    !Number.isInteger(contact.heardYear) ||
    typeof contact.route !== "string" ||
    !s.known?.[input.factId] ||
    !s.hd?.[input.factId] ||
    !historyAvailabilityReached(history, s) ||
    s.world?.events?.[input.factId] !== history.y
  )
    throw new Error("本人が把握していない年表情報への応答は記録できません");
  const records = s.informationResponses || (s.informationResponses = []),
    duplicate = records.find(row => row.eventId === eventId && row.factId === input.factId);
  if (duplicate) return duplicate;
  const entry = {
      year: s.year,
      age: s.age,
      eventId,
      factId: input.factId,
      response: input.response,
      heardYear: contact.heardYear,
      heardMonth: contact.heardMonth ?? null,
      route: contact.route,
      sourceRecord: "recorded-route"
    };
  records.push(entry);
  if (records.length > 40) records.splice(0, records.length - 40);
  return entry;
}
