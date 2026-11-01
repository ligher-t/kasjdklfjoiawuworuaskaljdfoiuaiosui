const IDENTITY_AFFILIATIONS = [
  "ターラー系",
  "カズデル系",
  "イベリアのエーギル系",
  "ラテラーノ系",
  "地域共同体",
  "その他の自称"
];
function ensureIdentity(s, provided = null) {
  if (s.culturalIdentity && typeof s.culturalIdentity === "object") return s.culturalIdentity;
  const name = provided && IDENTITY_AFFILIATIONS.includes(provided.affiliation) ? provided.affiliation : null;
  const language =
    provided && typeof provided.homeLanguage === "string" && provided.homeLanguage.trim()
      ? provided.homeLanguage.trim().slice(0, 60)
      : null;
  s.culturalIdentity = {
    version: 1,
    affiliation: name,
    affiliationBasis: name ? "出生設定・本人の家の伝承" : "未確認",
    selfIdentification: null,
    homeLanguage: language,
    homeLanguageBasis: language ? "出生設定" : "未確認",
    literacyLanguage: null,
    otherLanguages: [],
    culturalPractice: null,
    documentationStatus: "未確認",
    legalReviewYear: null,
    history: [],
    initializedYear: s.year
  };
  return s.culturalIdentity;
}
function identityAction(s, action) {
  const m = ensureIdentity(s);
  if (!action || typeof action !== "object") throw Error("文化・地位の記録が不正");
  const allowed = [
    "affirm",
    "decline-label",
    "learn-language",
    "ask-records",
    "conceal",
    "practice",
    "seek-translation"
  ];
  if (!allowed.includes(action.type)) throw Error("文化・地位の行動が不正");
  if (action.type === "affirm") {
    if (!m.affiliation) return;
    m.selfIdentification = m.affiliation;
  }
  if (action.type === "decline-label") m.selfIdentification = "単一の帰属を選ばない";
  if (action.type === "conceal") m.selfIdentification = "周囲へは明かさない";
  if (action.type === "learn-language") m.literacyLanguage = m.homeLanguage || "学んだ言語名は未記録";
  if (action.type === "practice") m.culturalPractice = "身近な慣習に参加";
  if (action.type === "ask-records") {
    m.legalReviewYear = s.year;
    m.documentationStatus = "照会中";
  }
  m.history.push({
    year: s.year,
    type: action.type,
    note: String(action.note || "").slice(0, 130),
    region: s.res?.n || null,
    eventId: TRACE_RESOLUTION?.id || null
  });
  m.history = m.history.slice(-24);
}
/* 態度は対象ごとに別。実際の加害、受けた被害、自らの感染前史を保存する。 */
function conflictState(s) {
  if (!s.socialConflict || typeof s.socialConflict !== "object")
    s.socialConflict = {
      version: 1,
      acts: [],
      experienced: [],
      reports: [],
      infectionShock: null,
      familyBreach: null,
      actTotals: {},
      actTotalsBasis: "complete-since-start",
      experienceTotals: {},
      experienceTotalsBasis: "complete-since-start",
      reportTotals: {},
      reportTotalsBasis: "complete-since-start"
    };
  const m = s.socialConflict;
  for (const k of ["acts", "experienced", "reports"]) if (!Array.isArray(m[k])) m[k] = [];
  for (const [field, bucket, basis] of [
    ["actTotals", "acts", "actTotalsBasis"],
    ["experienceTotals", "experienced", "experienceTotalsBasis"],
    ["reportTotals", "reports", "reportTotalsBasis"]
  ]) {
    if (
      !m[field] ||
      typeof m[field] !== "object" ||
      Array.isArray(m[field]) ||
      Object.values(m[field]).some(n => !Number.isInteger(n) || n < 0)
    ) {
      m[field] = {};
      for (const row of m[bucket])
        if (row?.action && row?.target) {
          const key = `${row.target}:${row.action}`;
          m[field][key] = (m[field][key] || 0) + 1;
        }
      m[basis] = "retained-lower-bound";
    }
    if (!["complete-since-start", "retained-lower-bound"].includes(m[basis]))
      m[basis] = "retained-lower-bound";
  }
  return m;
}
function socialConflictActionCount(m) {
  return Object.values(m?.actTotals || {}).reduce(
    (sum, n) => sum + (Number.isInteger(n) && n > 0 ? n : 0),
    0
  );
}
function socialConflictRecordCount(m, field) {
  return Object.values(m?.[field] || {}).reduce((sum, n) => sum + (Number.isInteger(n) && n > 0 ? n : 0), 0);
}
function socialActTotalsValid(m) {
  if (m.actTotals == null) return true;
  if (
    typeof m.actTotals !== "object" ||
    Array.isArray(m.actTotals) ||
    Object.values(m.actTotals).some(n => !Number.isInteger(n) || n < 0) ||
    !["complete-since-start", "retained-lower-bound"].includes(m.actTotalsBasis)
  )
    return false;
  const observed = {};
  for (const row of m.acts || []) {
    if (row?.action && row?.target) {
      const key = `${row.target}:${row.action}`;
      observed[key] = (observed[key] || 0) + 1;
    }
  }
  return Object.entries(observed).every(([key, n]) => (m.actTotals[key] || 0) >= n);
}
function socialConflictTotalsValid(m, field, bucket, basis) {
  if (m[field] == null) return true;
  if (
    typeof m[field] !== "object" ||
    Array.isArray(m[field]) ||
    Object.values(m[field]).some(n => !Number.isInteger(n) || n < 0) ||
    !["complete-since-start", "retained-lower-bound"].includes(m[basis])
  )
    return false;
  const observed = {};
  for (const row of m[bucket] || []) {
    if (row?.action && row?.target) {
      const key = `${row.target}:${row.action}`;
      observed[key] = (observed[key] || 0) + 1;
    }
  }
  return Object.entries(observed).every(([key, n]) => (m[field][key] || 0) >= n);
}
function appendSocialRecord(s, m, entry, bucket, totals, basis) {
  const state = conflictState(s),
    key = `${entry.target}:${entry.action}`;
  state[totals][key] = (state[totals][key] || 0) + 1;
  state[bucket].push(entry);
  state[bucket] = state[bucket].slice(-(bucket === "acts" ? 40 : bucket === "experienced" ? 30 : 30));
}
function appendSocialAct(s, m, entry) {
  appendSocialRecord(s, m, entry, "acts", "actTotals", "actTotalsBasis");
}
function recordInfectionPrior(s, source) {
  const m = conflictState(s);
  if (m.infectionShock) return;
  m.infectionShock = {
    year: s.year,
    source,
    priorBias: s.biasInfected || 0,
    priorActions: m.actTotals["infected:exclude"] || 0,
    priorAvoids: m.actTotals["infected:avoid"] || 0,
    priorPresence: m.actTotals["infected:remain"] || 0,
    priorEndorsement: m.actTotals["infected:endorse"] || 0,
    priorActionHistoryBasis: m.actTotalsBasis,
    diagnosisKnown: false
  };
}
function infectionPriorSummary(shock) {
  if (
    !shock ||
    (shock.priorBias < 55 &&
      !(shock.priorActions > 0) &&
      !(shock.priorAvoids > 0) &&
      !(shock.priorPresence > 0) &&
      !(shock.priorEndorsement > 0))
  )
    return null;
  const excluded = shock.priorActions > 0,
    avoided = (shock.priorAvoids || 0) > 0,
    remain = (shock.priorPresence || 0) > 0,
    endorsed = (shock.priorEndorsement || 0) > 0;
  const past = [
    shock.priorBias >= 55 ? "以前は感染者を遠ざけるべきだと思っていた。" : "",
    excluded ? "排斥の場で、感染者を遠ざける行動をした。" : "",
    avoided ? "感染者との接触を避けたこともある。" : "",
    remain ? "排斥を唱える集まりから、途中で席を立たなかった。" : "",
    endorsed ? "家族の前で、排斥に賛成する言葉を口にした。" : ""
  ]
    .filter(Boolean)
    .join("");
  return `${past}鉱石病と告げられ、診療所を出た。かつて自分が感染者へ向けた言葉が、帰り道にもついてきた。`;
}
function socialConflictPerson(s, key) {
  if (key === "family-breach") {
    const b = s.socialConflict?.familyBreach,
      p = [s.par?.fa, s.par?.mo].find(x => x?.id === b?.personId);
    return p
      ? {
          id: String(p.id),
          name: String(p.nm || b.personName || b.personRelation || "親"),
          relation: b.personRelation || "親"
        }
      : null;
  }
  const pair = key === "father" ? ["父", s.par?.fa] : key === "mother" ? ["母", s.par?.mo] : null;
  if (!pair || !pair[1]?.id) return null;
  return { id: String(pair[1].id), name: String(pair[1].nm || pair[0]), relation: pair[0] };
}
function socialConflictFamilyBreachSummary(s) {
  const b = s?.socialConflict?.familyBreach;
  if (!b) return "";
  const latest = b.contactHistory?.at(-1),
    contact = latest
      ? latest.outcome === "replied"
        ? `・${latest.year}年に返事があった（関係が戻ったかは未確認）`
        : `・${latest.year}年に連絡したが返事は未確認`
      : "";
  return b.personId && b.personName && ["父", "母"].includes(b.personRelation)
    ? `感染後の家庭内拒絶: ${b.personRelation} ${b.personName}${contact}`
    : "感染後の家庭内拒絶: 相手の個人記録なし";
}
function socialConflictAction(s, action) {
  if (Array.isArray(action)) {
    for (const item of action) socialConflictAction(s, item);
    return;
  }
  if (
    !action ||
    typeof action !== "object" ||
    ![
      "exclude",
      "avoid",
      "remain",
      "endorse",
      "betray",
      "reconsider",
      "help",
      "report-harm",
      "seek-mutual-aid",
      "family-rejected",
      "family-distance",
      "make-contact",
      "social-rejection"
    ].includes(action.action)
  )
    throw Error("差別・排斥記録の行動が不正");
  const m = conflictState(s),
    person = action.personId ? socialConflictPerson(s, action.personId) : null;
  if (action.personId && !person) throw Error("家庭内の相手IDが現在の親記録と一致しない");
  if (
    action.contactOutcome &&
    (!["replied", "no-reply"].includes(action.contactOutcome) || action.action !== "make-contact")
  )
    throw Error("家庭連絡の返答記録が不正");
  const entry = {
    year: s.year,
    age: s.age,
    action: action.action,
    target: action.target || "infected",
    context: action.context || null,
    eventId: TRACE_RESOLUTION?.id || null,
    choice: TRACE_RESOLUTION?.label || null,
    ...(person ? { personId: person.id, personName: person.name, personRelation: person.relation } : {}),
    ...(action.contactOutcome ? { contactOutcome: action.contactOutcome } : {}),
    ...socialIncidentLocation(s)
  };
  if (
    ["exclude", "avoid", "remain", "endorse", "betray", "reconsider", "help", "make-contact"].includes(
      action.action
    )
  )
    appendSocialAct(s, m, entry);
  else if (["report-harm", "seek-mutual-aid"].includes(action.action))
    appendSocialRecord(s, m, entry, "reports", "reportTotals", "reportTotalsBasis");
  else appendSocialRecord(s, m, entry, "experienced", "experienceTotals", "experienceTotalsBasis");
  if (action.action === "social-rejection")
    registerSocialHarm(s, {
      domain: "community",
      eventId: TRACE_RESOLUTION?.id || action.context,
      basis: "event-recorded",
      note: action.context || "diagnosis-related-neighbor-withdrawal"
    });
  if (action.action === "family-distance")
    registerSocialHarm(s, {
      domain: "family",
      eventId: TRACE_RESOLUTION?.id || action.context,
      basis: "event-recorded",
      note: action.context || "diagnosis-related-family-distance"
    });
  if (action.action === "family-rejected") {
    m.familyBreach = {
      year: s.year,
      contact: "damaged",
      source: "event",
      contactHistory: [],
      ...(person ? { personId: person.id, personName: person.name, personRelation: person.relation } : {})
    };
    appendSocialExclusionHistory(s, null, {
      year: s.year,
      context: "family-rejection",
      kind: "home",
      consequence: "unresolved",
      basis: "event-recorded"
    });
    if (action.context === "household") {
      s.fl || (s.fl = {});
      s.fl.household_separated = 1;
      if (!s.residenceArrangement || s.residenceArrangement.startsWith("family_home_")) {
        s.residenceArrangement = "independent_rental";
        s.residenceHistory || (s.residenceHistory = []);
        s.residenceHistory.push({
          year: s.year,
          arrangement: "independent_rental",
          householdSeparated: true,
          reason: "家族からの追放"
        });
        s.residenceHistory = s.residenceHistory.slice(-24);
      }
    }
  }
  if (
    action.action === "make-contact" &&
    person &&
    action.contactOutcome &&
    m.familyBreach?.personId === person.id
  ) {
    if (!Array.isArray(m.familyBreach.contactHistory)) m.familyBreach.contactHistory = [];
    m.familyBreach.contactHistory.push({
      year: s.year,
      outcome: action.contactOutcome,
      personId: person.id,
      eventId: TRACE_RESOLUTION?.id || null
    });
    m.familyBreach.contactHistory = m.familyBreach.contactHistory.slice(-12);
    m.familyBreach.contact = action.contactOutcome;
    m.familyBreach.lastContactYear = s.year;
  }
  if (action.action === "report-harm") {
    /* 実際の被害は結果フラグまたは家庭からの拒絶で記録。申立てそれ自体は被害でない。 */
  }
}
