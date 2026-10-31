const informationScopeDecision = (historyEntry, nearby) => {
  const scope = historyEntry?.infoScope || "public";
  if (scope === "sealed") return { scope, eligible: false, chanceScale: 0 };
  if (scope === "local_news") return { scope, eligible: nearby, chanceScale: 1 };
  if (scope === "local_rumor") return { scope, eligible: nearby, chanceScale: 0.28 };
  if (scope === "faction_only")
    return {
      scope,
      eligible: !!historyEntry.requiredFlag && !!S.fl?.[historyEntry.requiredFlag],
      chanceScale: 1
    };
  return { scope: "public", eligible: true, chanceScale: 1 };
};
function historyIsNearby(historyEntry, state = S) {
  // `r` models information reach; it does not establish the resident's personal exposure to the event.
  if (historyEntry?.city && historyEntry.city !== state.local?.city) return false;
  return historyEntry?.r === "all" ||
    (Array.isArray(historyEntry?.r) && historyEntry.r.includes(state.res?.n));
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
  });
}
function announceHistoricalNews(historyEntry, id, route, infoScope) {
  const before = HL && !CAPTURE_TRACE ? null : traceState(S),
    hd = S.hd || (S.hd = {}),
    known = S.known || (S.known = W || {}),
    receivedText = historyEntry.publicText || historyEntry.t;
  hd[id] = 1;
  if (historyEntry.flag) known[historyEntry.flag] = 1;
  const source =
    route === "広域の知らせ"
      ? "広く流れる知らせから"
      : route === "近隣・地域の伝達網"
        ? "近隣や地域の伝達網から"
        : "交易商や旅人の話から";
  (S.infoLog || (S.infoLog = [])).push({
    id,
    eventYear: historyEntry.y,
    eventAvailableFromMonth: historyEntry.availableFromMonth ?? null,
    heardYear: S.year,
    heardMonth: Number.isInteger(S.mo) && S.mo >= 1 && S.mo <= CALENDAR_MONTHS ? S.mo : null,
    route,
    settingConfidence: historyEntry.conf || "?",
    infoScope,
    textBasis: historyEntry.publicText ? "公開範囲に合わせた要約" : "登録文面"
  });
  L(`<span class="${tone(historyEntry.e || {})}">${source}、${receivedText}</span>`);
  if (historyEntry.e) ap(historyEntry.e);
  recordTrace(
    "world-news",
    id,
    {
      eventYear: historyEntry.y,
      eventAvailableFromMonth: historyEntry.availableFromMonth ?? null,
      heardMonth: Number.isInteger(S.mo) && S.mo >= 1 && S.mo <= CALENDAR_MONTHS ? S.mo : null,
      route,
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
    delete pending[id];
    if (state.hd?.[id] || (historyEntry.flag && state.known?.[historyEntry.flag])) return;
    announceHistoricalNews(historyEntry, id, queued.route, queued.infoScope);
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
    const nearby = historyIsNearby(h),
      scopeAccess = informationScopeDecision(h, nearby);
    if (!scopeAccess.eligible) {
      if (scopeAccess.scope === "sealed") hd[id] = 1;
      return;
    }
    if (R() >= historicalInformationChance(h, nearby, scopeAccess.chanceScale)) return;
    const route = h.r === "all" ? "広域の知らせ" : nearby ? "近隣・地域の伝達網" : "交易商・旅人の伝聞";
    if (!available) {
      const queued = S.pendingHistoricalNews || (S.pendingHistoricalNews = {});
      queued[id] = { route, infoScope: scopeAccess.scope };
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
