const hardlineBias = (s, kind) => s.age >= 14 && (kind === "sarkaz" ? s.biasSarkaz : s.biasInfected) >= 75;
/* 旧イベントに対する意味監査済みの選択番号。単語マッチは『差別の拡大』や
 * 『本人の受診』まで誤遮断するため使わない。対象・意図の判定はイベント単位。 */
const ETHICAL_GATE_CHOICES = {
  bias_family_sarkaz_model: { sarkaz: [1] },
  family_spouse_oripathy_disclosure: { infected: [0] },
  life_infected_association_choice: { infected: [1] },
  life_infected_exclusion_consequence: { infected: [2] },
  life_rhodes_research_offer: { infected: [1] },
  earth_discr_school_guardian: { infected: [0] },
  family_sibling_infection: { infected: [0, 1] },
  earth_discr_aid_internal_voice: { infected: [0] },
  v77_social_stigma_family: { infected: [0] },
  inter_sankta_sarkaz_work_v76: { sarkaz: [0] }
};
function ethicalActor(s, who) {
  if (who !== "parent")
    return { age: s.age, biasInfected: s.biasInfected || 0, biasSarkaz: s.biasSarkaz || 0, role: "self" };
  const parent =
    [s.par?.fa, s.par?.mo].find(x => x?.id === s.eventRelativeId && !x.d) ||
    [s.par?.fa, s.par?.mo].find(x => x && !x.d);
  if (!parent || !parent.beliefs) return { age: 0, role: "parent-unknown" }; // 旧セーブで思想は推定しない
  return {
    age: Math.max(0, s.year - parent.by),
    biasInfected: parent.beliefs.infected,
    biasSarkaz: parent.beliefs.sarkaz,
    role: "parent",
    id: parent.id
  };
}
function ethicalLock(e, c, s, who = "self") {
  if (!e || !c) return null;
  const ethics = c.ethics || {},
    actor = ethicalActor(s, who),
    target = ethics.target;
  // 選択肢に目的を明記した場合に限り抑止する。語句一致は利用しない。
  // 家族の治療、本人の受診、自衛、法的照会を善意の意思表明と誤認しない。
  if (
    actor.role !== "parent-unknown" &&
    actor.age >= 14 &&
    ["voluntary-aid", "oppose-exclusion"].includes(ethics.intent) &&
    ((target === "infected" && (actor.biasInfected || 0) >= 75) ||
      (target === "sarkaz" && (actor.biasSarkaz || 0) >= 75))
  )
    return target === "sarkaz"
      ? "これまでのサルカズへの強い敵意と矛盾するため、今はこの行動を選べない。"
      : "感染者への強い排斥思想と矛盾するため、今はこの行動を選べない。";
  // 手作業で以前確認した旧イベントの制限を、意図付与済みのイベントでは置換する。
  if (ethics.reviewed) return null;
  const gates = ETHICAL_GATE_CHOICES[e.id];
  if (!gates || actor.role === "parent-unknown") return null;
  const i = e.c?.indexOf(c) ?? -1;
  for (const group of ["infected", "sarkaz"]) {
    if (
      gates[group]?.includes(i) &&
      actor.age >= 14 &&
      (group === "sarkaz" ? actor.biasSarkaz || 0 : actor.biasInfected || 0) >= 75
    )
      return group === "sarkaz"
        ? "長年のサルカズへの敵意が強く、この交流を自分の意思として選べない。"
        : "感染者を排除する考えが強く、今は自発的な援助を選べない。";
  }
  return null;
}

/* v77 生活経験・社会化モデル。値は人物の道徳性や種族固有の性質ではない。
 * 'familyNorms' は周辺の言説のゲーム用代理値。親の一意な信念を確定しない。
 * 実際の排斥経験だけが機会制約を発生させる。所属集団自体は能力を下げない。 */
const socialModel = (s, legacy = false) => {
  if (s.socialLearning && typeof s.socialLearning === "object") return s.socialLearning;
  const regionPressure = clamp((s.res?.st || 0) * 65, 0, 55),
    p = infectionSocialPressure(s);
  const isSarkazFamily =
    s.r?.n === "サルカズ" || s.par?.fa?.r?.n === "サルカズ" || s.par?.mo?.r?.n === "サルカズ";
  const isInfectedFamily = !!s.inf || !!s.par?.fa?.inf || !!s.par?.mo?.inf;
  const familyInf = isInfectedFamily
    ? clamp(keyedRoll(`${s.randomSeed || 0}|${s.by}|family-inf`) * 8, 0, 8)
    : clamp(
        6 +
          regionPressure * 0.2 +
          p.public * 23 +
          (keyedRoll(`${s.randomSeed || 0}|${s.by}|family-inf`) - 0.5) * 32,
        0,
        65
      );
  const familySar = isSarkazFamily
    ? 0
    : clamp(
        6 +
          regionPressure * 0.3 +
          (s.res?.n === "ラテラーノ" ? 11 : 0) +
          (keyedRoll(`${s.randomSeed || 0}|${s.by}|family-sar`) - 0.5) * 34,
        0,
        65
      );
  s.socialLearning = {
    version: 1,
    initializedYear: s.year,
    legacy,
    schoolAccessYears: 0,
    outOfSchoolYears: 0,
    literacy: legacy ? null : 0,
    familyNorms: {
      infected: legacy ? null : +familyInf.toFixed(1),
      sarkaz: legacy ? null : +familySar.toFixed(1)
    },
    equityCommitment: 0,
    contacts: { infected: 0, sarkaz: 0 },
    peerPressure: 0,
    yearlyHistory: [],
    exclusionHistory: [],
    exclusionHistoryCount: 0,
    exclusionHistoryCountBasis: legacy ? "retained-lower-bound" : "complete-since-start",
    lastExposureYear: null
  };
  return s.socialLearning;
};
const repairSocialLearning = s => {
  const m = socialModel(s, true);
  if (!Array.isArray(m.yearlyHistory)) m.yearlyHistory = [];
  if (!Array.isArray(m.exclusionHistory)) m.exclusionHistory = [];
  if (!Number.isInteger(m.exclusionHistoryCount) || m.exclusionHistoryCount < m.exclusionHistory.length) {
    m.exclusionHistoryCount = m.exclusionHistory.length;
    m.exclusionHistoryCountBasis = "retained-lower-bound";
  }
  if (!["complete-since-start", "retained-lower-bound"].includes(m.exclusionHistoryCountBasis))
    m.exclusionHistoryCountBasis = "retained-lower-bound";
  if (!m.contacts) m.contacts = { infected: 0, sarkaz: 0 };
  if (!m.familyNorms) m.familyNorms = { infected: 0, sarkaz: 0 };
  if (!Number.isFinite(m.equityCommitment)) m.equityCommitment = 0;
  if (m.literacy !== null && !Number.isFinite(m.literacy)) m.literacy = null;
  return m;
};
function socialIncidentLocation(s) {
  return {
    regionKey: typeof s?.res?.n === "string" ? s.res.n : null,
    localityKey: typeof s?.community?.key === "string" ? s.community.key : null,
    localityKind: typeof s?.local?.kind === "string" ? s.local.kind : null,
    locationBasis: "current-location-at-event"
  };
}
function socialIncidentLocationLabel(row) {
  return typeof row?.regionKey === "string"
    ? `${row.regionKey}${typeof row.localityKind === "string" ? `・${row.localityKind}` : ""}`
    : row?.locationBasis === "current-location-at-event"
      ? "所在地不明（発生時点で未記録）"
      : "所在地未記録（旧記録）";
}
function socialIncidentLocationValid(row) {
  const hasLocation =
    row?.locationBasis != null ||
    row?.regionKey != null ||
    row?.localityKey != null ||
    row?.localityKind != null;
  return (
    !hasLocation ||
    (row.locationBasis === "current-location-at-event" &&
      [row.regionKey, row.localityKey, row.localityKind].every(
        value => value == null || (typeof value === "string" && value.length <= 120)
      ))
  );
}
function appendSocialExclusionHistory(s, m, row) {
  const model = repairSocialLearning(s);
  model.exclusionHistoryCount = (model.exclusionHistoryCount || 0) + 1;
  model.exclusionHistory.push({ ...socialIncidentLocation(s), ...row });
  model.exclusionHistory = model.exclusionHistory.slice(-24);
}
const literacyValue = s => {
  const v = socialModel(s, true).literacy;
  return Number.isFinite(v) ? v : Math.min(75, eduLv(s) * 18 + s.k * 0.32);
};
const socialStance = s => {
  const m = socialModel(s, true);
  if ((s.biasInfected || 0) >= 67 || (s.biasSarkaz || 0) >= 67) return "排除的な考えが強い";
  if (m.equityCommitment >= 34 && (s.biasInfected || 0) < 38 && (s.biasSarkaz || 0) < 38)
    return "差別への異議を実践";
  if (barrierRecently(s)) return "不当な扱いを経験";
  if ((s.biasInfected || 0) >= 34 || (s.biasSarkaz || 0) >= 34) return "不信と葛藤がある";
  return "考えはまだ定まらない";
};
/* v81: 単一の排斥経験に由来する一時的な社会的障壁を識別する。
 * 申立て・照会は被害の証拠ではない。過去の被害を後から作らず、本人の行動・地域の条件と分離する。 */
function socialAftermath(s) {
  if (!s.socialAftermath || typeof s.socialAftermath !== "object")
    s.socialAftermath = {
      version: 1,
      episodes: [],
      actions: [],
      nextId: 1,
      episodeCount: 0,
      episodeCountBasis: "complete-since-start"
    };
  const m = s.socialAftermath;
  if (!Array.isArray(m.episodes)) m.episodes = [];
  if (!Array.isArray(m.actions)) m.actions = [];
  if (!Number.isInteger(m.episodeCount) || m.episodeCount < m.episodes.length) {
    m.episodeCount = m.episodes.length;
    m.episodeCountBasis = "retained-lower-bound";
  }
  if (!["complete-since-start", "retained-lower-bound"].includes(m.episodeCountBasis))
    m.episodeCountBasis = "retained-lower-bound";
  if (!Number.isInteger(m.nextId) || m.nextId < 1) m.nextId = 1;
  return m;
}
function registerSocialHarm(s, input) {
  const model = socialAftermath(s),
    sourceId = String(input.eventId || "annual-encounter"),
    domain = String(input.domain || "community");
  const existing = model.episodes.find(
    x => x.year === s.year && x.eventId === sourceId && x.domain === domain
  );
  if (existing) return existing; // 同一の結果に複数のフラグがあっても一度しか数えない
  const episode = {
    id: `soc-${s.year}-${model.nextId++}`,
    year: s.year,
    domain,
    eventId: sourceId,
    areaKey: s.community?.key || s.res?.n || null,
    ...socialIncidentLocation(s),
    basis: input.basis || "game-model",
    status: "active",
    supportedYear: null,
    endedYear: null,
    directMoodDelta: Number(input.moodDelta || 0),
    directRelationsDelta: Number(input.relationsDelta || 0),
    note: String(input.note || "経験した不利益").slice(0, 160)
  };
  model.episodeCount = (model.episodeCount || 0) + 1;
  model.episodes.push(episode);
  if (model.episodes.length > 256) {
    let trim = model.episodes.findIndex(x => x.status !== "active");
    if (trim < 0) trim = 0;
    model.episodes.splice(trim, 1);
  }
  return episode;
}
function recordSocialOutcome(s, fx, eventId) {
  if (!fx) return;
  // 行動タグだけから被害を捏造しない。具体的な被害フラグか、明示的な家族拒絶の結果に限る。
  const a = fx.socialConflictAction,
    flags = fx.fl || {},
    source = eventId || "effect-without-id";
  const harms = [
    ["ed_work_disadvantage", "work"],
    ["ed_sarkaz_work_bias", "work"],
    ["housing_exclusion", "housing"],
    ["ed_sarkaz_lodging_refused", "housing"],
    ["ed_clinic_delayed", "medical"],
    ["ed_iberia_port_screen", "administration"]
  ].filter(([flag]) => flags[flag] === 1);
  const seen = new Set();
  for (const [flag, domain] of harms) {
    if (seen.has(domain)) continue;
    seen.add(domain);
    registerSocialHarm(s, {
      domain,
      eventId: source,
      basis: "explicit-event-effect",
      note: flag,
      moodDelta: fx.p,
      relationsDelta: fx.rl
    });
  }
  if (a?.action === "family-rejected")
    registerSocialHarm(s, {
      domain: "family",
      eventId: source,
      basis: "explicit-family-rejection",
      note: a.context || "家庭からの拒絶",
      moodDelta: fx.p,
      relationsDelta: fx.rl
    });
  if (a?.action === "report-harm") {
    const m = socialAftermath(s);
    m.actions.push({
      year: s.year,
      action: "report",
      eventId: source,
      note: String(a.context || "対応を問い合わせた").slice(0, 120)
    });
    m.actions = m.actions.slice(-48);
  }
  if (fx.socialAftermathAction) applySocialAftermathAction(s, fx.socialAftermathAction, eventId);
}
function applySocialAftermathAction(s, input, eventId) {
  if (!input || !["support", "review", "close", "document"].includes(input.type))
    throw Error("社会的被害の後日談の効果が不正");
  const m = socialAftermath(s),
    matches = x => !input.domain || x.domain === input.domain,
    episodes = m.episodes.slice().reverse(),
    target =
      episodes.find(x => x.status === "active" && matches(x)) ||
      episodes.find(x => x.status === "supported" && matches(x));
  if (!target) throw Error("記録された被害がない状態で被害の解消・支援を記録できません");
  if (input.type === "support") {
    target.status = "supported";
    target.supportedYear = s.year; // 傷や失われた収入は消えない
  } else if (input.type === "close") {
    target.status = "ended";
    target.endedYear = s.year; // 過去の事実自体は残す
  }
  m.actions.push({
    year: s.year,
    action: input.type,
    episodeId: target.id,
    domain: target.domain,
    eventId: eventId || null,
    note: String(input.note || "").slice(0, 160)
  });
  m.actions = m.actions.slice(-48);
}
const relevantSocialEpisodes = s =>
  socialAftermath(s).episodes.filter(x => x.status !== "ended" && x.year <= s.year && x.year >= s.year - 3);
function hasRecordedExclusionExperience(s) {
  const learning = s.socialLearning,
    conflict = s.socialConflict;
  return (
    (learning?.exclusionHistoryCount || learning?.exclusionHistory?.length || 0) > 0 ||
    socialConflictRecordCount(conflict, "experienceTotals") > 0 ||
    (conflict?.experienced || []).length > 0
  );
}
const barrierRecently = s => {
  const episodes = s.socialAftermath?.episodes;
  if (Array.isArray(episodes) && episodes.length)
    return episodes.some(x => x.status !== "ended" && x.year >= s.year - 3);
  // v80などの旧セーブは記録を捏造しない。申し立ては被害として数えず、古い記録は読むだけ。
  return (socialModel(s, true).exclusionHistory || []).some(
    x =>
      x.year >= s.year - 3 &&
      x.consequence !== "resolved" &&
      x.kind !== "reported" &&
      x.context !== "institution-inquiry"
  );
};

const socialParticipation = s => {
  const m = socialModel(s, true),
    episodes = relevantSocialEpisodes(s),
    structural = episodes.length
      ? episodes.every(x => x.status === "supported")
        ? -0.1
        : -0.27
      : barrierRecently(s)
        ? -0.27
        : 0;
  const displacement = s.fl?.disaster_displaced || s.fl?.war_displaced || s.fl?.kazdel_displaced ? -0.14 : 0;
  const supportive = (s.care?.support || 0.5) > 0.67 ? 0.12 : 0;
  return clamp(0.72 + structural + displacement + supportive + (s.local?.access || 0.5) * 0.24, 0.2, 1.12);
};
const addAttitudeDrift = (s, key, diff, source) => {
  if (key === "biasSarkaz" && s.r?.n === "サルカズ" && diff > 0) return;
  if (key === "biasInfected" && s.inf && diff > 0) return;
  const before = s[key] || 0,
    after = clamp(before + diff, 0, 100),
    actual = after - before;
  if (Math.abs(actual) < 0.01) return;
  s[key] = after;
  // 記録は統計モデルの年次作用。実際の発言や接触があったとは主張しない。
  const history = s.attitudeHistory || (s.attitudeHistory = []);
  if (Math.floor(before / 10) !== Math.floor(after / 10))
    history.push({
      year: s.year,
      age: s.age,
      attitude: key === "biasInfected" ? "infected" : "sarkaz",
      sourceEventId: null,
      choice: null,
      source,
      model: true,
      inputDelta: diff,
      effectiveDelta: actual,
      before,
      after,
      formation: false
    });
  if (history.length > 40) history.splice(0, history.length - 40);
};
function annualSocialHarmDomain(s, age) {
  if (age < 18) return "community"; // school and neighborhood cases share the community follow-up
  if (s.job > 0 && keyedRoll(`${s.randomSeed || 0}|${s.year}|annual-social-domain`) < 0.5) return "work";
  return "housing";
}
function advanceSocialLearning(s) {
  const m = socialModel(s),
    a = s.age;
  if (a < 3) return;
  const studying = !!s.fl?.sch && !restricted(s) && a < P("life.schoolEnrollmentEndAge"),
    participation = socialParticipation(s);
  if (studying) m.schoolAccessYears++;
  else if (a <= 18) m.outOfSchoolYears++;
  const beforeLiteracy = literacyValue(s);
  // 正規就学外の読み書きにも道を残す。ただし学校の不在を毎年の大幅成長に変換しない。
  const formal = studying
    ? (a < 16 ? P("social.v77SchoolLiteracyGain") : 3.2) * facilitySchoolMultiplier(s)
    : 0;
  const informal = !studying && s.f === 1 && a >= 8 ? P("social.v77InformalLiteracyGain") * participation : 0;
  if (m.literacy === null) m.literacy = beforeLiteracy;
  m.literacy = clamp(m.literacy + (formal + informal) * (1 - m.literacy / 110), 0, 100);
  // 子どもの成長は、家族の言説、学校・仲間の空気、具体的な接触が重なって形成される。
  // ラテラーノの住民全員などの態度を一括で確定しない。成人後も緩やかに更新可能。
  m.peerPressure = clamp(
    m.peerPressure * 0.84 +
      (R() - 0.42) * (studying ? 9 : 4) +
      (infectionSocialPressure(s).public - 0.5) * (studying ? 6 : 2),
    -22,
    32
  );
  const oldInf = s.biasInfected || 0,
    oldSar = s.biasSarkaz || 0;
  for (const [key, group] of [
    ["biasInfected", "infected"],
    ["biasSarkaz", "sarkaz"]
  ]) {
    if (group === "sarkaz" && s.r?.n === "サルカズ") {
      s[key] = 0;
      continue;
    }
    if (group === "infected" && s.inf) {
      s[key] = 0;
      continue;
    }
    const pressure = group === "infected" ? infectionSocialPressure(s).public * 13 : (s.res?.st || 0) * 10;
    const peer = m.peerPressure * 0.16,
      contact = Math.min(16, (m.contacts[group] || 0) * 2.0);
    const learnedNorm = Number.isFinite(m.familyNorms[group]) ? m.familyNorms[group] : s[key] || 0;
    const target = clamp(learnedNorm * (a < 19 ? 0.8 : 0.42) + pressure + peer - contact, 0, 85);
    const rate = a < 8 ? 0.16 : a < 18 ? P("social.v77AttitudeYearlyDrift") : 0.018;
    const delta = clamp((target - (s[key] || 0)) * rate, -3.8, 3.8);
    addAttitudeDrift(s, key, delta, "yearly-socialization-game-model");
  }
  // 著しく排除的な家庭・仲間の環境では、本人が選ばずとも態度が先鋭化する可能性がある。
  // どの種族・地域でも固定の性格にはしない。家族の実際の発言を捏造しない抽象モデル。
  if (
    a >= 12 &&
    a <= 29 &&
    Number.isFinite(m.familyNorms.infected) &&
    m.familyNorms.infected >= 44 &&
    m.peerPressure >= 5 &&
    (s.biasInfected || 0) >= 12 &&
    R() < 0.18
  ) {
    addAttitudeDrift(s, "biasInfected", 5.5, "social-circle-escalation-game-model");
  }
  // 歴史にない具体的な差別被害を種族だけで確定しない。まず「実際の遭遇」を低頻度で抽選。
  if (a >= 8 && a <= 70 && !restricted(s)) {
    const infected = !!s.inf && !!s.fl?.dg;
    const sarkaz = s.r?.n === "サルカズ";
    const domain = annualSocialHarmDomain(s, a),
      contexts = [];
    if (sarkaz && s.res?.n === "ラテラーノ")
      contexts.push({ context: "laterano-sarkaz", chance: 0.045 * discriminationEncounterRisk(s) });
    else if (sarkaz && s.res?.n !== "カズデル")
      contexts.push({ context: "sarkaz-minority", chance: 0.025 * discriminationEncounterRisk(s) });
    if (infected) {
      const pressure = infectionSocialPressure(s),
        contextualPressure =
          domain === "work" ? pressure.work : domain === "housing" ? pressure.housing : pressure.public;
      contexts.push({ context: "infected", chance: P("social.v77ExclusionChance") * contextualPressure });
    }
    /* 複数属性に該当する場合も一件の年次エピソードだけを記録し、より高い既存リスク文脈を選ぶ。 */
    const contextualEvent = contexts.sort((x, y) => y.chance - x.chance)[0],
      contextual = contextualEvent?.context || null,
      chance = contextualEvent?.chance || 0;
    const recent = m.exclusionHistory.some(x => x.year >= s.year - 2 && x.kind !== "reported");
    if (!recent && R() < chance) {
      const episode = {
        year: s.year,
        context: contextual,
        area: s.community?.key || s.res?.n,
        kind: a < 18 ? "school-or-neighborhood" : "work-or-housing",
        domain,
        consequence: "unresolved",
        basis: "encounter-game-model"
      };
      appendSocialExclusionHistory(s, m, episode);
      registerSocialHarm(s, {
        domain: episode.domain,
        eventId: "annual-encounter",
        basis: "encounter-game-model",
        note: contextual
      });
      m.lastExposureYear = s.year;
      if (a < 18 && s.fl.sch) {
        s.ep = Math.max(0, s.ep - 0.65);
      }
      const encounterText =
        episode.domain === "work"
          ? "勤務先で、仕事の割当てや申し送りに不利な扱いを受けた。"
          : episode.domain === "housing"
            ? "住まいの手続きや近所付き合いで、不利な扱いを受けた。"
            : "学校や近所で、参加や学びに不利な扱いを受けた。";
      L(`<span class="bad">${encounterText}相手の事情までは分からない。</span>`);
    }
  }
  if (
    Math.floor(oldInf / 20) !== Math.floor((s.biasInfected || 0) / 20) ||
    Math.floor(oldSar / 20) !== Math.floor((s.biasSarkaz || 0) / 20) ||
    a % 5 === 0
  )
    m.yearlyHistory.push({
      year: s.year,
      age: a,
      stance: socialStance(s),
      infected: +s.biasInfected.toFixed(2),
      sarkaz: +s.biasSarkaz.toFixed(2),
      literacy: +m.literacy.toFixed(2),
      school: studying,
      source: "simulation"
    });
  m.yearlyHistory = m.yearlyHistory.slice(-32);
  /* 行動は価値観を完全に決めない。重度の排斥思想では、選択せず加害的な振る舞いをすることがある。 */
  const dailyExclusionTargets = [];
  if (a >= 17 && a < 75 && !restricted(s)) {
    if (hardlineBias(s, "infected")) dailyExclusionTargets.push("infected");
    if (hardlineBias(s, "sarkaz") && s.job > 0) dailyExclusionTargets.push("sarkaz");
  }
  if (dailyExclusionTargets.length && R() < P("social.v78AnnualDiscriminatoryActChance")) {
    const target = dailyExclusionTargets[Math.floor(R() * dailyExclusionTargets.length)],
      c = conflictState(s);
    const action = target === "infected" ? "avoid" : "exclude",
      context = target === "infected" ? "everyday-contact-avoidance" : "everyday-workplace-withholding";
    appendSocialAct(s, c, {
      year: s.year,
      age: a,
      action,
      target,
      context,
      eventId: null,
      basis: "annual-simulation",
      ...socialIncidentLocation(s)
    });
    addAttitudeDrift(s, target === "infected" ? "biasInfected" : "biasSarkaz", 1.2, "habitual-exclusion");
    L(
      target === "infected"
        ? '<span class="bad">感染者の隣人が近くを通ると、会話を交わす前に席を移した。相手との接触を避ける行動が、今年の記録に残った。</span>'
        : '<span class="bad">職場でサルカズの同僚へ必要な引継ぎをせず、別の人へ仕事を回した。相手は一人で予定を組み直すことになった。</span>'
    );
  }
  const shock = conflictState(s).infectionShock;
  if (shock && s.fl?.dg && !shock.diagnosisKnown) {
    shock.diagnosisKnown = true;
    shock.diagnosisKnownYear = s.year;
    const summary = infectionPriorSummary(shock);
    if (summary) L(`<span class="bad">${summary}</span>`);
  }
}
function annualEducationAndRelationships(s, f, t) {
  const a = s.age,
    m = socialModel(s),
    inSchool = !!s.fl?.sch && !restricted(s) && a < P("life.schoolEnrollmentEndAge"),
    schoolMultiplier = inSchool ? facilitySchoolMultiplier(s) : 0;
  const studying = f === 1 && !restricted(s),
    access = socialParticipation(s);
  const literacy = literacyValue(s),
    literacyFit = Math.max(0.15, 0.3 + literacy / 145);
  let gain = 0;
  if (inSchool) gain += (1.4 + R() * 0.8) * schoolMultiplier * access;
  if (studying) gain += (inSchool ? 1.05 : 0.24) * literacyFit * access;
  else if (!inSchool && a < 19) gain += R() * P("social.v77EverydayKnowledgeGain") * access;
  else if (a >= 19 && s.job > 0 && literacy > 28) gain += 0.055 * access;
  // 知識と親しい人間関係は有限の経験で増加が逓減する。絶対上限は設けない。
  const knowledgeSpace = Math.max(0.035, 1 - Math.pow(Math.max(0, s.k) / 110, 1.6));
  s.k = clamp(s.k + gain * knowledgeSpace);
  /* 被害の同一エピソードを、直接のrl変化に加え毎年もう一度減点しない。アクセス不足としてのみ扱う。 */
  const ambient = (R() - 0.53) * 1.25 * access,
    connections = (f === 3 ? 1.35 : 0) + (f === 7 ? 0.6 : 0);
  let relChange = (ambient + connections * access + (t.rl || 0) * 0.035) * Math.max(0.09, 1 - s.rl / 104);
  if (relChange < 0) relChange *= 1.15;
  s.rl = clamp(s.rl + relChange);
  if (!restricted(s)) {
    const course = !!s.study && !s.study.suspended;
    const lesson = studying
      ? inSchool
        ? P("education.studyPoints")
        : course
          ? P("education.studyPoints") * 0.55 * access
          : 0
      : 0;
    const formal = inSchool ? P("education.schoolPoints") * schoolMultiplier * access : 0;
    const passive = inSchool ? P("education.passiveLearningProgress") * 0.22 : 0;
    s.ep = Math.max(
      0,
      s.ep +
        (lesson + formal + passive) *
          (P("education.studyAccessBase") + s.local.access * P("education.studyAccessScale"))
    );
  }
}
