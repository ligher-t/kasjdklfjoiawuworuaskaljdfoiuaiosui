function ensureFacilityPersonStore(s, area) {
  area.people ||= {};
  s.facilityPeopleContacts ||= [];
  return area.people;
}
/* A contacted NPC has a small independent household and work-life state.
 * These are synthetic biographies, never demographic claims or named source characters.
 * Missing v73 biography data stays unknown. No past circumstances are invented on migration. */
const NPC_HOMES = ["settled", "shared", "temporary", "unknown"];
const NPC_CARE = ["none", "relative", "household", "unknown"];
const NPC_GOALS = ["continue", "learn", "change", "balance", "unknown"];
const NPC_MEANS = ["steady", "tight", "recovering", "unknown"];
const NPC_HOME_LABEL = {
  settled: "住まいは当面落ち着いている",
  shared: "家族や他人と住居を分け合っている",
  temporary: "住まいが落ち着かない",
  unknown: "住まいについては分からない"
};
const NPC_CARE_LABEL = {
  none: "特別な世話の用事は聞いていない",
  relative: "身内の世話に時間を割いている",
  household: "家族の用事が多い",
  unknown: "家庭の用事は不明"
};
const NPC_GOAL_LABEL = {
  continue: "今の役割を続けたい",
  learn: "仕事や暮らしの技能を学びたい",
  change: "働き方を変えたい",
  balance: "生活との両立を優先したい",
  unknown: "本人の希望は未確認"
};
const NPC_MEANS_LABEL = {
  steady: "日々の支払いはおおむね維持できている",
  tight: "暮らしのやりくりに余裕がない",
  recovering: "暮らしを立て直している途中",
  unknown: "家計状況は不明"
};
function personLifeCreate(p, year, legacy = false) {
  const pick = (field, choices) =>
    choices[Math.floor(keyedRoll(`terra-person-life-v74:${p.id}:${field}:${year}`) * choices.length)];
  p.life = {
    version: 1,
    startedYear: year,
    updatedYear: year,
    provenance: legacy ? "legacy-unobserved" : "simulated-at-meeting",
    home: legacy ? "unknown" : pick("home", ["settled", "settled", "shared", "temporary"]),
    care: legacy ? "unknown" : pick("care", ["none", "none", "relative", "household"]),
    goal: legacy ? "unknown" : pick("goal", ["continue", "continue", "learn", "change", "balance"]),
    means: legacy ? "unknown" : pick("means", ["steady", "steady", "tight", "recovering"]),
    changes: []
  };
  p.knownLife ??= null;
  return p.life;
}
function ensurePersonLife(p, year) {
  return p.life || personLifeCreate(p, year, true);
}
function personLifeAdvance(p, area, year) {
  const L = ensurePersonLife(p, year);
  if (L.updatedYear >= year) return;
  const update = (field, to) => {
    if (L[field] === to) return;
    L.changes.push({ year, field, from: L[field], to, basis: "game-model" });
    L.changes = L.changes.slice(-20);
    L[field] = to;
  };
  const roll = topic => keyedRoll(`terra-person-life-v74:${p.id}:${topic}:${year}`);
  if (L.home === "unknown") update("home", roll("home-first") < 0.76 ? "settled" : "shared");
  else if (L.home === "settled" && roll("housing") < P("social.npcHousingDisruption"))
    update("home", "temporary");
  else if (L.home === "temporary" && roll("housing") < P("social.npcHousingRecovery"))
    update("home", "settled");
  else if (L.home === "shared" && roll("housing") < P("social.npcSharedHousingChange"))
    update("home", "settled");
  if (L.care === "unknown") update("care", "none");
  else if (L.care === "none" && roll("care") < P("social.npcCareStart"))
    update("care", roll("care-kind") < 0.5 ? "relative" : "household");
  else if (L.care !== "none" && roll("care") < P("social.npcCareEase")) update("care", "none");
  if (L.goal === "unknown") update("goal", "continue");
  else if (roll("goal") < P("social.npcGoalReview"))
    update("goal", ["continue", "learn", "change", "balance"][Math.floor(roll("goal-choice") * 4)]);
  if (L.care !== "none" && roll("balance") < P("social.npcCareGoalShift")) update("goal", "balance");
  if (L.means === "unknown") update("means", "steady");
  else if (L.means === "steady" && roll("means") < P("social.npcFinancialPressure")) update("means", "tight");
  else if (L.means === "tight" && roll("means") < P("social.npcFinancialRecovery"))
    update("means", "recovering");
  else if (L.means === "recovering" && roll("means") < P("social.npcFinancialStabilize"))
    update("means", "steady");
  // An interruption to income may constrain the household, but an acquaintance's
  // situation never changes the city's indicators or the player's money automatically.
  if (
    p.actualStatus === "left" &&
    L.means === "steady" &&
    roll("job-loss") < P("social.npcLeftWorkFinancialPressure")
  )
    update("means", "tight");
  L.updatedYear = year;
}
function personKnownLife(p, year) {
  const L = ensurePersonLife(p, year);
  const told = (field, share) =>
    keyedRoll(`terra-person-disclosure-v74:${p.id}:${field}:${year}`) < share ? L[field] : "unknown";
  // Asking is not permission to infer a person's finances or every family matter.
  p.knownLife = {
    home: told("home", 0.65),
    care: told("care", 0.55),
    goal: L.goal,
    means: told("means", 0.28),
    heardYear: year
  };
  return p.knownLife;
}
function facilityPersonAdvance(s, area, year) {
  if (!area.people) return;
  for (const p of Object.values(area.people)) {
    if (p.actualStatus === "dead") continue;
    // Old saves are snapshots. Begin new biography from the year first inspected,
    // not a fictional reconstruction of their earlier years.
    ensurePersonLife(p, year);
    if (p.lastUpdatedYear >= year) continue;
    for (let y = Math.max(p.lastUpdatedYear + 1, p.metYear + 1); y <= year; y++) {
      const age = y - p.by,
        roll = keyedRoll(`terra-facility-person-v1:${p.id}:${y}`);
      personLifeAdvance(p, area, y);
      if (p.actualStatus === "working") {
        if (age >= P("social.facilityPersonLateCareerAge") && roll < P("social.facilityPersonLateCareerExit"))
          p.actualStatus = "left";
        else if (roll < P("social.facilityPersonExitChance")) p.actualStatus = "left";
        else if (
          p.life.care !== "none" &&
          p.life.care !== "unknown" &&
          keyedRoll(`terra-person-care-work:${p.id}:${y}`) < P("social.npcCareLeaveWorkChance")
        )
          p.actualStatus = "away";
        else if (
          area.facilities?.[p.facilityId]?.status === "limited" &&
          roll < P("social.facilityPersonTemporaryLeave")
        )
          p.actualStatus = "away";
      } else if (p.actualStatus === "away") {
        if (roll < P("social.facilityPersonReturnChance") * (p.life.care === "none" ? 1 : 0.55))
          p.actualStatus = "working";
        else if (roll > P("social.facilityPersonPermanentLeaveThreshold")) p.actualStatus = "left";
      }
      if (
        p.actualStatus === "working" &&
        keyedRoll(`terra-person-jobmove-v76:${p.id}:${y}`) < P("social.npcSiteTransferChance")
      ) {
        const alternatives = localSites(
          area,
          p.kind,
          p.kind === "workplace" ? area.facilities[p.facilityId]?.extra || "" : ""
        ).filter(site => site.id !== p.facilityId && site.status !== "limited");
        if (alternatives.length) {
          const oldFacilityId = p.facilityId,
            other = alternatives[0];
          p.facilityId = other.id;
          p.history.push({
            year: y,
            action: "transfer",
            fromFacilityId: oldFacilityId,
            toFacilityId: other.id,
            basis: "synthetic-npc-mobility"
          });
          p.history = p.history.slice(-16);
        }
      }
      if (p.actualStatus !== p.lastRecordedStatus) {
        p.history.push({ year: y, from: p.lastRecordedStatus, to: p.actualStatus, basis: "game-model" });
        p.history = p.history.slice(-16);
        p.lastRecordedStatus = p.actualStatus;
      }
    }
    p.lastUpdatedYear = year;
  }
}
function applyFacilityPersonAction(s, action) {
  if (
    !action ||
    !["clinic", "school", "workplace"].includes(action.kind) ||
    !["meet", "ask", "help", "leave", "talk", "feedback"].includes(action.action)
  )
    throw Error("施設で出会う人物への行動が不正");
  const f = activeFacility(s, action.kind);
  if (!f) throw Error("その施設に本人の生活上の接点がない");
  const people = ensureFacilityPersonStore(s, s.community);
  let person = facilityPersonFor(s, action.kind, null, action.action === "ask");
  if (action.action === "meet") {
    if (person) throw Error("すでに出会った施設関係者がいる");
    const sx = keyedRoll(`terra-person-sex:${f.id}:${s.year}`) < 0.5 ? "女" : "男";
    const birthYear = s.year - (24 + Math.floor(keyedRoll(`terra-person-age:${f.id}:${s.year}`) * 25));
    const priorCount = Object.values(people).filter(row => row.facilityId === f.id && row.kind === action.kind).length;
    const id = f.id + "#person#" + (priorCount + 1);
    person = {
      id,
      facilityId: f.id,
      kind: action.kind,
      role: FACILITY_PERSON_ROLES[action.kind],
      nm: nmUnique_(
        s,
        sx,
        s.res,
        Object.values(people).map(p => p.nm)
      ),
      sx,
      by: birthYear,
      metYear: s.year,
      lastUpdatedYear: s.year,
      actualStatus: "working",
      lastRecordedStatus: "working",
      knownStatus: "working",
      knownFacilityId: f.id,
      lastKnownYear: s.year,
      contactState: "acquaintance",
      history: [],
      contacts: [],
      basis: "game-model"
    };
    personLifeCreate(person, s.year, false);
    // 出会った相手の私的な考えは、主人公の思想・種族から推定しない。未開示の限り非表示。
    person.socialBeliefs = {
      infected: Math.round(12 + keyedRoll(`npc-belief-v82:${id}:infected`) * 76),
      sarkaz: Math.round(12 + keyedRoll(`npc-belief-v82:${id}:sarkaz`) * 76),
      basis: "synthetic-individual-not-demographic"
    };
    people[id] = person;
    recordPersonTieAction(s, { kind: action.kind, action: "introduced" });
  } else if (!person) throw Error("まだ知り合っていない人物の近況は確認できない");
  ensurePersonLife(person, s.year);
  if (action.action === "ask") {
    person.knownStatus = person.actualStatus;
    person.knownFacilityId = person.facilityId;
    person.lastKnownYear = s.year;
  } else if (action.action === "talk") {
    if (person.actualStatus !== "working") throw Error("相手が持ち場にいないため直接話せない");
    person.knownStatus = "working";
    person.lastKnownYear = s.year;
    personKnownLife(person, s.year);
    person.contactState = "familiar";
  } else if (action.action === "help") {
    if (person.actualStatus !== "working") throw Error("持ち場にいない相手と直接協力したことにはできない");
    person.knownStatus = "working";
    person.lastKnownYear = s.year;
    person.contactState = "familiar";
  } else if (action.action === "feedback") {
    if (person.actualStatus !== "working")
      throw Error("持ち場にいない相手へ案内への意見を伝えたことにはできない");
    person.knownStatus = "working";
    person.lastKnownYear = s.year;
  } else if (action.action === "leave") person.contactState = "distant";
  if (action.action === "talk") recordPersonTieAction(s, { kind: action.kind, action: "listen" });
  if (action.action === "help") recordPersonTieAction(s, { kind: action.kind, action: "shared-work" });
  if (action.action === "feedback")
    recordPersonTieAction(s, { kind: action.kind, action: "service-feedback" });
  if (action.action === "leave") recordPersonTieAction(s, { kind: action.kind, action: "keep-distance" });
  const lifeDetails =
    action.action === "talk"
      ? `。本人が話した範囲：${NPC_HOME_LABEL[person.knownLife.home]}。${NPC_CARE_LABEL[person.knownLife.care]}。${NPC_GOAL_LABEL[person.knownLife.goal]}` +
        `。${NPC_MEANS_LABEL[person.knownLife.means]}。`
      : "";
  const description =
    (action.description ||
      {
        meet: "自己紹介して名前を聞いた",
        ask: "最近の様子を確かめた",
        talk: "本人から暮らしや今後の希望を聞いた",
        help: "自分に可能な範囲で手を貸した",
        feedback: "案内の分かりにくい点を担当者へ伝えた",
        leave: "交流の区切りをつけた"
      }[action.action]) + lifeDetails;
  person.contacts.push({ year: s.year, action: action.action, description });
  person.contacts = person.contacts.slice(-16);
  s.facilityPeopleContacts.push({
    year: s.year,
    areaKey: s.community.key,
    facilityId: f.id,
    personId: person.id,
    kind: action.kind,
    action: action.action,
    description: `${person.nm}：${description}`
  });
  s.facilityPeopleContacts = s.facilityPeopleContacts.slice(-96);
  // ひとりとの会話は、施設全体の供給やサービス復旧を変えない。
}
function facilityPeopleSummary(s) {
  const area = ensureLocalityState(s),
    people = Object.values(area?.people || {});
  const past = Object.values(s.world?.localityArchive || {})
    .flatMap(a => Object.values(a.people || {}))
    .slice(-8);
  if (!people.length && !past.length) return "この生活圏で、名前を知っている施設関係者はまだいません。";
  const status = {
    working: "勤めを続けていると聞いた",
    away: "一時的に持ち場を離れたと聞いた",
    left: "その持ち場を離れたと聞いた",
    dead: "亡くなったと聞いた"
  };
  const line = (p, former) => {
    const known = p.knownLife,
      summary = known
        ? `／${known.heardYear}年に本人から聞いた暮らし：${NPC_HOME_LABEL[known.home]}・${NPC_CARE_LABEL[known.care]}・${NPC_GOAL_LABEL[known.goal]}` +
          `・${NPC_MEANS_LABEL[known.means]}`
        : "／本人の暮らしについてはまだ聞いていない";
    return (
      `${former ? "以前の地区：" : ""}${p.nm}（${p.role}）／${p.lastKnownYear}年の消息：${status[p.knownStatus] || "未確認"}／${p.contactState === "familiar" ? "顔なじみ" : p.contactState === "distant" ? "しばらく交流なし" : "知人"}` +
      `${summary}`
    );
  };
  return [...people.slice(-8).map(p => line(p, false)), ...past.map(p => line(p, true))].join("\n");
}
