/* v82：実際に知っている特定の人物との関係。差別の属性からNPCの内心を決めつけない。
 * 非接触の人物に過去を捏造せず、記録できるのは個別の行為と相手の明示された反応だけ。 */
const PERSON_TIE_ACTIONS = new Set([
  "introduced",
  "listen",
  "shared-work",
  "service-feedback",
  "agree-prejudice",
  "challenge-prejudice",
  "state-harm",
  "keep-distance",
  "disclose-infection",
  "support-given",
  "ordinary-contact",
  "rejection-received",
  "repair-attempt",
  "respect-boundary",
  "apology-heard",
  "apology-deferred",
  "apology-accountability"
]);
function personTieStore(s) {
  if (!s.personTies || typeof s.personTies !== "object")
    s.personTies = { version: 1, links: {}, history: [] };
  const d = s.personTies;
  if (!d.links || typeof d.links !== "object") d.links = {};
  if (!Array.isArray(d.history)) d.history = [];
  return d;
}
function socialTieFor(s, person, create = false) {
  if (!person) return null;
  const store = personTieStore(s);
  let t = store.links[person.id];
  if (!t && create) {
    t = {
      personId: person.id,
      metYear: s.year,
      lastInteractionYear: s.year,
      standing: 50,
      relationship: "unresolved",
      history: [],
      basis: "from-current-contact-no-retrospective-inference"
    };
    store.links[person.id] = t;
  }
  return t || null;
}
function recordPersonTieAction(s, input) {
  if (
    !input ||
    !["clinic", "school", "workplace", "rhodes"].includes(input.kind) ||
    !PERSON_TIE_ACTIONS.has(input.action)
  )
    throw Error("個人関係の行動が不正");
  let person;
  if (input.kind === "rhodes") {
    const store = personTieStore(s);
    if (!Array.isArray(store.rhodesColleagues))
      store.rhodesColleagues = store.rhodesColleague ? [store.rhodesColleague] : [];
    else if (store.rhodesColleague && !store.rhodesColleagues.some(row => row.id === store.rhodesColleague.id))
      store.rhodesColleagues.push(store.rhodesColleague);
    if (store.rhodesColleague)
      store.rhodesColleague = store.rhodesColleagues.find(row => row.id === store.rhodesColleague.id) || store.rhodesColleague;
    let current = store.rhodesColleagues.find(row => row.actualStatus === "working") || null;
    if (!current && input.action === "introduced") {
      const status = s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-staff")?.status;
      if (s.year < 1094 || !["active", "crisis"].includes(status))
        throw Error("ロドスで勤務中でない人物に同僚との接点を作れない");
      current = {
        id: "rhodes-colleague:" + String(s.by || s.randomSeed || s.year) + ":" + (store.rhodesColleagues.length + 1),
        kind: "rhodes",
        nm: "同じ配属先の職員",
        role: "同じ配属先の職員",
        metYear: s.year,
        actualStatus: "working",
        basis: "game-model-current-contact"
      };
      store.rhodesColleagues.push(current);
      store.rhodesColleague = current;
    }
    person = input.personId
      ? store.rhodesColleagues.find(row => row.id === input.personId) || null
      : current || store.rhodesColleague || null;
  } else person = facilityPersonFor(s, input.kind, input.personId || null);
  if (
    !person ||
    (person.actualStatus !== "working" &&
      !["repair-attempt", "respect-boundary", "keep-distance"].includes(input.action))
  )
    throw Error("実際に接点のある施設の人物を指定できない");
  if (input.personId && person.id !== input.personId) throw Error("別の人物への行動を流用できない");
  const action = input.action,
    priorTie = s.personTies?.links?.[person.id];
  // Validate before changing standing, history or disclosed knowledge. A rejected
  // invalid event must not leave partially changed relationships in the save.
  if (action === "disclose-infection" && (!s.inf || !s.fl?.dg))
    throw Error("診断のない状態で感染確定を開示できない");
  if (
    action === "rejection-received" &&
    (!s.inf ||
      !Number.isInteger(person.knowsPlayerInfectionSince) ||
      person.knowsPlayerInfectionSince > s.year)
  )
    throw Error("相手が知らない感染を理由に拒絶した扱いにできない");
  if (
    ["state-harm", "repair-attempt", "apology-heard", "apology-deferred", "apology-accountability"].includes(
      action
    ) &&
    !priorTie?.history?.some(row => row.action === "rejection-received")
  )
    throw Error("該当人物から拒絶された履歴がない");
  if (action.startsWith("apology-") && Number.isInteger(person.apologyOfferedYear))
    throw Error("同じ謝罪の申し出を二重に作れない");
  const tie = socialTieFor(s, person, true),
    delta = {
      introduced: 0,
      listen: 2,
      "shared-work": 4,
      "service-feedback": 0,
      "agree-prejudice": 3,
      "challenge-prejudice": -7,
      "state-harm": 0,
      "keep-distance": -4,
      "disclose-infection": 0,
      "support-given": 7,
      "ordinary-contact": 1,
      "rejection-received": -24,
      "repair-attempt": 0,
      "respect-boundary": 0,
      "apology-heard": 0,
      "apology-deferred": 0,
      "apology-accountability": 0
    }[action];
  const before = tie.standing;
  tie.standing = clamp(before + delta, 0, 100);
  tie.lastInteractionYear = s.year;
  if (action === "disclose-infection") {
    if (!s.inf || !s.fl?.dg) throw Error("診断のない状態で感染確定を開示できない");
    if (!Number.isInteger(person.knowsPlayerInfectionSince)) person.knowsPlayerInfectionSince = s.year;
  }
  if (action === "challenge-prejudice" || action === "agree-prejudice") {
    // The explicit discriminatory words are observable; a private belief score is not.
    person.knownBiasStatement = {
      topic: "infected",
      heardYear: s.year,
      level: "hostile",
      basis: "direct-statement-in-scene"
    };
  }
  if (action === "rejection-received") {
    if (
      !Number.isInteger(person.knowsPlayerInfectionSince) ||
      person.knowsPlayerInfectionSince > s.year ||
      !s.inf
    )
      throw Error("相手が知らない感染を理由に拒絶した扱いにできない");
    const a = socialAftermath(s);
    registerSocialHarm(s, {
      eventId: TRACE_RESOLUTION?.id || "known-person-rejection",
      domain: "work",
      basis: "identified-person-incident",
      note: `${person.id}による職場の排除`
    });
    const c = conflictState(s);
    appendSocialRecord(
      s,
      c,
      {
        year: s.year,
        age: s.age,
        action: "person-rejection",
        target: "infected",
        personId: person.id,
        eventId: TRACE_RESOLUTION?.id || null,
        ...socialIncidentLocation(s)
      },
      "experienced",
      "experienceTotals",
      "experienceTotalsBasis"
    );
  }
  if (action.startsWith("apology-")) {
    // An NPC's apology is an observable offer, not forgiveness, agreement or
    // termination of a documented loss.  No response updates the damage ledger.
    if (!tie.history.some(entry => entry.action === "rejection-received"))
      throw Error("拒絶の記録がない相手への謝罪を追加できない");
    if (Number.isInteger(person.apologyOfferedYear)) throw Error("同じ謝罪の申し出を二重に作れない");
    person.apologyOfferedYear = s.year;
    person.apologyResponse = action;
  }
  if (action === "support-given") {
    // 支援の事実と被害の履歴は別。全ての過去の傷や職場環境を解消しない。
    const m = socialAftermath(s);
    m.actions.push({
      year: s.year,
      action: "person-support",
      personId: person.id,
      eventId: TRACE_RESOLUTION?.id || null
    });
    m.actions = m.actions.slice(-48);
  }
  tie.relationship = tie.standing <= 27 ? "strained" : tie.standing >= 70 ? "trusted" : "unresolved";
  const entry = {
    year: s.year,
    personId: person.id,
    kind: input.kind,
    action,
    delta: tie.standing - before,
    sourceEventId: TRACE_RESOLUTION?.id || null,
    basis: "observed-interaction"
  };
  tie.history.push(entry);
  tie.history = tie.history.slice(-24);
  const store = personTieStore(s);
  store.history.push(entry);
  store.history = store.history.slice(-90);
  // NPC自身や家族、他の施設職員の関係には波及しない。選択から心理統計を捏造しない。
  return { person, tie, entry };
}
/* v87: disclosure to an identified close person is never equivalent to telling a
 * household, a workplace, or every acquaintance. Missing old history stays unknown. */
