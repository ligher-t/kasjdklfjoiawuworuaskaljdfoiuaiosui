const CLOSE_INFO_KINDS = ["father", "mother", "spouse", "friend"];
const CLOSE_INFO_ACTIONS = [
  "disclose",
  "defer",
  "ask-privacy",
  "privacy-accepted",
  "privacy-unconfirmed",
  "ask-for-help",
  "help-accepted",
  "help-declined",
  "help-unconfirmed",
  "help-execution"
];
const CLOSE_HELP_COMMITMENT_RESULTS = {
  fulfilled: "fulfilled",
  "not-realized": "not-realized",
  "withdrawn-by-other": "withdrawn-by-other",
  "cancelled-by-player": "cancelled-by-player"
};
function closeInfoPerson(s, kind) {
  return kind === "father"
    ? s.par?.fa || null
    : kind === "mother"
      ? s.par?.mo || null
      : kind === "spouse"
        ? s.sp || null
        : kind === "friend"
          ? s.friendContact || null
          : null;
}
function closeInfoAvailable(s, kind) {
  const person = closeInfoPerson(s, kind);
  if (!person?.id || person.d || person.lifeStatus === "dead" || person.knownLifeStatus === "dead")
    return false;
  if (kind === "spouse") return spouseLivesWithProtagonist(s);
  if (kind === "friend")
    return (
      !["severed", "deceased", "missing"].includes(person.status) && person.knownLifeStatus !== "missing"
    );
  const region = person.knownRegion || person.region || s.res?.n;
  return inSharedHousehold(s) || region === s.res?.n;
}
function closeInfoStore(s) {
  if (!s.closeKnowledge || typeof s.closeKnowledge !== "object")
    s.closeKnowledge = { version: 1, links: {}, history: [] };
  const data = s.closeKnowledge;
  if (!data.links || typeof data.links !== "object" || Array.isArray(data.links)) data.links = {};
  if (!Array.isArray(data.history)) data.history = [];
  return data;
}
function repairCloseKnowledge(s) {
  // Import a recorded ledger, but do not synthesize past disclosure from global flags.
  if (!s.closeKnowledge) return s;
  const store = closeInfoStore(s);
  for (const [id, link] of Object.entries(store.links)) {
    if (!link || typeof link !== "object" || !CLOSE_INFO_KINDS.includes(link.kind) || link.personId !== id) {
      delete store.links[id];
      continue;
    }
    link.history = Array.isArray(link.history) ? link.history.slice(-16) : [];
    if (!link.knownFacts || typeof link.knownFacts !== "object") link.knownFacts = {};
    if (
      link.helpCommitment &&
      (link.helpCommitment.personId !== id ||
        link.helpCommitment.kind !== "next-appointment" ||
        !Number.isInteger(link.helpCommitment.agreedYear) ||
        !Number.isInteger(link.helpCommitment.dueYear) ||
        link.helpCommitment.dueYear !== link.helpCommitment.agreedYear + 1 ||
        !["pending", ...Object.values(CLOSE_HELP_COMMITMENT_RESULTS)].includes(link.helpCommitment.status))
    )
      delete link.helpCommitment;
    else if (link.helpCommitment) {
      if (!Array.isArray(link.helpCommitment.history)) link.helpCommitment.history = [];
      link.helpCommitment.history = link.helpCommitment.history.slice(-8);
    }
  }
  store.history = store.history.slice(-80);
  return s;
}
function closeInfoKnown(s, kind) {
  const person = closeInfoPerson(s, kind);
  return !!(
    person?.id && s.closeKnowledge?.links?.[person.id]?.knownFacts?.playerDiagnosis?.sinceYear != null
  );
}
function recordCloseKnowledgeAction(s, { kind, personId, action, recipientResponse, commitmentKind, outcome }) {
  if (
    !CLOSE_INFO_KINDS.includes(kind) ||
    !CLOSE_INFO_ACTIONS.includes(action) ||
    !closeInfoAvailable(s, kind)
  )
    throw Error("現在連絡できない相手への情報行動は記録できません");
  const person = closeInfoPerson(s, kind);
  if (!personId || personId !== person.id) throw Error("人物IDが一致しません");
  if (
    recipientResponse != null &&
    (action !== "disclose" ||
      !["heard-undecided", "questioned-diagnosis", "withdrew"].includes(recipientResponse))
  )
    throw Error("診断開示への相手の反応記録が不正");
  const prior = s.closeKnowledge?.links?.[person.id],
    known = !!prior?.knownFacts?.playerDiagnosis;
  if (action === "disclose" && (!s.inf || !s.fl?.dg))
    throw Error("未診断または感染中でないため診断開示を記録できません");
  if (
    [
      "ask-privacy",
      "privacy-accepted",
      "privacy-unconfirmed",
      "ask-for-help",
      "help-accepted",
      "help-declined",
      "help-unconfirmed"
    ].includes(action) &&
    !known
  )
    throw Error("本人が伝えていない診断を相手が知っていることにはできません");
  if (commitmentKind != null && (action !== "help-accepted" || commitmentKind !== "next-appointment"))
    throw Error("記録できない援助の約束です");
  if (action === "help-accepted" && commitmentKind === "next-appointment" && prior?.helpCommitment?.status === "pending")
    throw Error("未確認の付き添いの約束が残っています");
  const pendingHelp = prior?.helpCommitment;
  if (
    action === "help-execution" &&
    (!pendingHelp ||
      pendingHelp.personId !== person.id ||
      pendingHelp.kind !== "next-appointment" ||
      pendingHelp.status !== "pending" ||
      !Number.isInteger(pendingHelp.dueYear) ||
      s.year < pendingHelp.dueYear ||
      !Object.prototype.hasOwnProperty.call(CLOSE_HELP_COMMITMENT_RESULTS, outcome))
  )
    throw Error("実行前または別人の付き添いの約束は更新できません");
  if (
    (action === "privacy-accepted" || action === "privacy-unconfirmed") &&
    prior?.privacyReplyYear === s.year
  )
    throw Error("同じ年の返答を重複記録できません");
  if (["help-accepted", "help-declined", "help-unconfirmed"].includes(action) && prior?.helpReplyYear === s.year)
    throw Error("同じ年の援助への返答を重複記録できません");
  const store = closeInfoStore(s),
    link =
      store.links[person.id] ||
      (store.links[person.id] = { personId: person.id, kind, metYear: s.year, knownFacts: {}, history: [] });
  if (action === "disclose" && !known)
    link.knownFacts.playerDiagnosis = {
      sinceYear: s.year,
      source: "direct-self-disclosure",
      subject: "player"
    };
  if (action === "disclose" && !known) recordCloseInfectionDisclosure(s, kind, person);
  if (recipientResponse)
    link.latestResponse = { state: recipientResponse, sinceYear: s.year, basis: "direct-observed-response" };
  if (action === "ask-privacy") link.privacyRequestYear = s.year;
  if (action === "privacy-accepted" || action === "privacy-unconfirmed") {
    link.privacyRequestYear = s.year;
    link.privacyReplyYear = s.year;
    link.privacyResponse = action === "privacy-accepted" ? "accepted-request" : "unconfirmed";
    // Acceptance is a statement, not a guarantee of future confidentiality.
  }
  if (["help-accepted", "help-declined", "help-unconfirmed"].includes(action)) {
    link.helpRequestYear = s.year;
    link.helpReplyYear = s.year;
    link.helpResponse =
      action === "help-accepted"
        ? commitmentKind === "next-appointment"
          ? "appointment-agreed"
          : "accepted-limited-help"
        : action === "help-declined"
          ? "declined-request"
          : "unconfirmed";
  }
  if (action === "help-accepted" && commitmentKind === "next-appointment") {
    link.helpCommitment = {
      kind: commitmentKind,
      personId: person.id,
      agreedYear: s.year,
      dueYear: s.year + 1,
      status: "pending",
      outcomeYear: null,
      history: [{ year: s.year, action: "agreed", eventId: TRACE_RESOLUTION?.id || null }]
    };
  } else if (action === "help-execution") {
    const commitment = link.helpCommitment;
    commitment.status = CLOSE_HELP_COMMITMENT_RESULTS[outcome];
    commitment.outcomeYear = s.year;
    commitment.history.push({
      year: s.year,
      action: "outcome",
      outcome,
      eventId: TRACE_RESOLUTION?.id || null
    });
    commitment.history = commitment.history.slice(-8);
  }
  const entry = {
    year: s.year,
    personId: person.id,
    kind,
    action,
    basis: "direct-observed-contact",
    sourceEventId: TRACE_RESOLUTION?.id || null,
    ...(action === "disclose" && known ? { reaffirmed: true } : {}),
    ...(recipientResponse ? { recipientResponse } : {}),
    ...(commitmentKind ? { commitmentKind } : {}),
    ...(action === "help-execution" ? { commitmentOutcome: outcome } : {})
  };
  link.history.push(entry);
  link.history = link.history.slice(-16);
  store.history.push(entry);
  store.history = store.history.slice(-80);
  if(action==='help-execution'&&outcome==='fulfilled')
    disclosureImpactRecovery(s,'relationship',person.id+'|appointment|'+pendingHelp.agreedYear,{recipientId:person.id});
  return entry;
}
function closeKnowledgeSummary(s) {
  const links = Object.values(s.closeKnowledge?.links || {});
  if (!links.length) return "相手を特定した情報のやり取りは、まだ記録されていません。";
  return links
    .slice(-12)
    .map(link => {
      const person = closeInfoPerson(s, link.kind),
        name = person?.id === link.personId ? person.nm : "現在の連絡先は未確認";
      const y = link.knownFacts?.playerDiagnosis?.sinceYear;
      const responses = [];
      if (y != null) responses.push(`${y}年に本人の診断を直接伝えた`);
      if (link.latestResponse?.state === "withdrew")
        responses.push(`${link.latestResponse.sinceYear}年、その場で距離を置く反応があった`);
      if (link.latestResponse?.state === "questioned-diagnosis")
        responses.push(`${link.latestResponse.sinceYear}年、診断について追加確認を求められた`);
      if (link.latestResponse?.state === "heard-undecided")
        responses.push(`${link.latestResponse.sinceYear}年、その場では返事が決まらなかった`);
      if (link.privacyResponse)
        responses.push(
          link.privacyResponse === "accepted-request"
            ? "秘密にしてほしいという依頼を了承（実行状況は未確認）"
            : "秘密保持への返答未確定"
        );
      if (link.helpResponse)
        responses.push(
          link.helpResponse === "accepted-limited-help"
            ? "連絡や買い物など、限定的な援助を申し出た（実行状況は未確認）"
            : link.helpResponse === "appointment-agreed"
              ? "次回受診日の付き添いを約束した"
              : link.helpResponse === "declined-request"
                ? "付き添いの依頼を断った"
                : "援助の返答未確定"
        );
      const commitment = link.helpCommitment;
      if (commitment?.kind === "next-appointment") {
        const result = {
          pending: "付き添いの実行はまだ確認していない",
          fulfilled: `${commitment.outcomeYear}年、実際に受診へ付き添った`,
          "not-realized": `${commitment.outcomeYear}年、待ち合わせに現れなかった（理由は未確認）`,
          "withdrawn-by-other": `${commitment.outcomeYear}年、相手から付き添いを取り下げる連絡があった`,
          "cancelled-by-player": `${commitment.outcomeYear}年、本人が付き添いを断り、一人で受診した`
        }[commitment.status];
        if (result) responses.push(`${commitment.agreedYear}年の約束：${result}`);
      }
      if (!responses.length) responses.push("開示は未記録。接触の選択のみ記録");
      return `${name || "相手名未確認"}：${responses.join("／")}`;
    })
    .join("\n");
}
const personTieSummary = s => {
  const d = s.personTies;
  if (!d?.links || !Object.keys(d.links).length) return "まだ個別の関係の記録はありません。";
  return Object.values(d.links)
    .slice(-8)
    .map(t => {
      const person = [
        ...(s.personTies?.rhodesColleagues ||
          (s.personTies?.rhodesColleague ? [s.personTies.rhodesColleague] : [])),
        ...Object.values(s.community?.people || {}),
        ...Object.values(s.world?.localityArchive || {}).flatMap(a => Object.values(a.people || {}))
      ].find(p => p.id === t.personId);
      const disclosures = Number.isInteger(person?.knowsPlayerInfectionSince)
        ? `・本人の診断を${person.knowsPlayerInfectionSince}年に伝えた`
        : "";
      const responses = {
        "apology-heard": "言葉を聞いた（関係の修復は別）",
        "apology-deferred": "返答を保留",
        "apology-accountability": "不利益の是正を求めた"
      };
      const apology = Number.isInteger(person?.apologyOfferedYear)
        ? `・${person.apologyOfferedYear}年に謝罪の申し出／${responses[person.apologyResponse] || "返答未記録"}`
        : "";
      return (
        `${person?.nm || "名前未確認"}：${
          t.relationship === "trusted"
            ? "信頼が育っている"
            : t.relationship === "strained"
              ? "関係に亀裂がある"
              : "関係を探っている"
        }` +
        `（最終交流 ${t.lastInteractionYear}` +
        `年、経験 ${t.history.length}件${disclosures}${apology}）`
      );
    })
    .join("\n");
};
