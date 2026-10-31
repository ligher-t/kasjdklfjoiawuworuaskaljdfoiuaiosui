/* ===== LIFE ENDINGS V2 : individual episodes, help and risk =====
 * Disease and crisis parameters are game hypotheses, not official Terra statistics.
 * All interventions are optional and cannot guarantee a medical outcome.
 */
const MORBID_LABELS = {
  respiratory: "呼吸器の不調",
  circulatory: "心臓・循環器の不調",
  vascular: "神経・血管に関わる不調",
  occupational: "仕事に関わる慢性の不調",
  injury: "負傷と後遺症",
  nutrition: "栄養不足と衰弱",
  oripathy: "鉱石病に伴う不調"
};
function mortalityState(s) {
  if (!s.mortality || typeof s.mortality !== "object")
    s.mortality = {
      version: 2,
      episodes: [],
      crisis: { status: "none", years: 0, lastDecisionYear: null, supportedUntilYear: null },
      threat: { status: "none", lastDecisionYear: null, safeUntilYear: null },
      exposureProtectionUntilYear: null,
      lateCareDiscussionYear: null,
      history: [],
      lastCompanionshipYear: null
    };
  const m = s.mortality;
  if (!Array.isArray(m.episodes)) m.episodes = [];
  if (!Array.isArray(m.history)) m.history = [];
  if (!m.crisis || typeof m.crisis !== "object") m.crisis = { status: "none", years: 0 };
  if (!m.threat || typeof m.threat !== "object") m.threat = { status: "none" };
  m.version = 2;
  return m;
}
const activeMortality = (s, kind) =>
  mortalityState(s).episodes.filter(x => x.status === "active" && (!kind || kind === x.kind));
const mortalityEpisodeTreatment = (s,ep) => ep.kind === "oripathy" ? !!s.fl?.tx :
  ep.kind === "respiratory" && !!s.illness?.treated;
const urgentMortalityEpisodes = s =>
  (s.mortality?.episodes || []).filter(ep =>
    ep.status === "active" && ep.severity >= 3 && ep.lastDecisionYear !== s.year &&
    (ep.lastDecisionSeverity==null || ep.severity>ep.lastDecisionSeverity ||
      (ep.lastDecisionTreatment && !mortalityEpisodeTreatment(s,ep))) &&
    (ep.careUntilYear == null || ep.careUntilYear < s.year || (ep.lastDecisionTreatment && !mortalityEpisodeTreatment(s,ep)) ||
      (ep.history || []).some(row => row.year === s.year && row.action === "worsened" && row.severity >= 3))
  );
function logMortality(s, kind, text, episode = null) {
  const m = mortalityState(s);
  m.history.push({ year: s.year, age: s.age, kind, text, episodeId: episode?.id || null });
  m.history = m.history.slice(-80);
}
function startMortalityEpisode(s, kind, severity = 1, origin = "annual-model") {
  const m = mortalityState(s),
    current = activeMortality(s, kind)[0];
  if (current) return current;
  // A resolved episode stays closed briefly; one low-health update is not a second diagnosis.
  const previous = m.episodes.filter(x => x.kind === kind && x.status !== "active").at(-1);
  if (previous && s.year - (previous.closedYear ?? previous.recoveryYear ?? previous.startedYear) < 3)
    return null;
  const ep = {
    id: `${kind}-${s.year}-${m.episodes.length + 1}`,
    kind,
    status: "active",
    severity: Math.max(1, Math.min(4, Math.floor(severity))),
    startedYear: s.year,
    lastReviewedYear: s.year,
    careUntilYear: null,
    lastDecisionYear: null,
    source: origin,
    history: [{ year: s.year, action: "onset", severity }]
  };
  m.episodes.push(ep);
  m.episodes = m.episodes.slice(-24);
  logMortality(s, kind, `${MORBID_LABELS[kind] || kind}の経過観察が始まった`, ep);
  if (!HL)
    L(
      `<span class="nt">${esc(MORBID_LABELS[kind] || "体調の変化")}が続き、これからの暮らしと療養を考える必要が出てきた。</span>`
    );
  return ep;
}
function advanceMortalityState(s) {
  const m = mortalityState(s),
    ageScaled = s.age / Math.max(0.3, s.r?.lm || 1),
    j = J[s.job] || {};
  // The old illness record stays intact for old saves/events. It is not a new diagnosis.
  if (
    s.illness &&
    s.illness.stage >= 2 &&
    !activeMortality(s).some(
      x => x.kind === (s.inf && s.illness.kind === "oripathy_complication" ? "oripathy" : "respiratory")
    )
  ) {
    startMortalityEpisode(
      s,
      s.inf && s.illness.kind === "oripathy_complication" ? "oripathy" : "respiratory",
      Math.min(3, s.illness.stage),
      "legacy-illness"
    );
  }
  // Infection is lifelong; treatment can mitigate episodes, not erase infection.
  if (s.inf && s.ob >= 55 && !activeMortality(s, "oripathy").length)
    startMortalityEpisode(s, "oripathy", s.ob >= 85 ? 3 : s.ob >= 70 ? 2 : 1, "oripathy-progression");
  if (
    s.h < 42 &&
    !activeMortality(s, "respiratory").length &&
    !activeMortality(s, "circulatory").length &&
    !activeMortality(s, "vascular").length
  ) {
    const choices =
      ageScaled > 55 ? ["circulatory", "respiratory", "vascular"] : ["respiratory", "circulatory"];
    if (R() < P("mortality.chronicOnset") * (s.h < 20 ? 8 : 3) * (1 + ageScaled / 90))
      startMortalityEpisode(s, pick(choices), s.h < 22 ? 2 : 1, "poor-health-model");
  }
  if (
    s.age >= 24 &&
    R() < P("mortality.chronicOnset") * (1 + Math.max(0, ageScaled - 40) / 35) &&
    activeMortality(s).length < 2
  ) {
    const options =
      ageScaled > 55 ? ["circulatory", "vascular", "respiratory"] : ["respiratory", "circulatory"];
    const kind = pick(options);
    if (!activeMortality(s, kind).length) startMortalityEpisode(s, kind, 1, "noncanonical-incidence-model");
  }
  if (
    (j.ex > 1 || s.f === 8 || s.fl?.workplace_hazard) &&
    s.age >= 14 &&
    R() < P("mortality.injuryOnset") * (j.ex || 1) * (0.5 + (s.local?.hazard || 0))
  ) {
    const kind = j.ex >= 1.5 && R() < 0.5 ? "occupational" : "injury";
    if (!activeMortality(s, kind).length) startMortalityEpisode(s, kind, 1, "work-exposure-model");
  }
  if (
    s.h < 30 &&
    (s.w.i <= 1 || s.fl.disaster_displaced || s.displacement?.status === "shelter") &&
    !activeMortality(s, "nutrition").length
  )
    startMortalityEpisode(s, "nutrition", 1, "precarity-exposure-model");
  for (const ep of m.episodes) {
    if (ep.status !== "active" || ep.lastReviewedYear >= s.year) continue;
    const prev = ep.severity,
      treated =
        (Number.isFinite(ep.careUntilYear) && ep.careUntilYear >= s.year) ||
        (ep.kind === "oripathy" && !!s.fl.tx);
    if (ep.kind === "oripathy") {
      ep.severity = Math.max(ep.severity, s.ob >= 90 ? 4 : s.ob >= 80 ? 3 : s.ob >= 67 ? 2 : 1);
    } else {
      const worsening =
          P("mortality.episodeWorsening") *
          (treated ? P("mortality.episodeCareReduction") : 1) *
          (s.h < 22 ? 1.35 : 1) *
          (ep.kind === "occupational" && (j.ex || 1) > 1 ? 1.15 : 1),
        healing = P("mortality.episodeRecovery") * (treated ? 1.45 : 1) * (ep.severity <= 2 ? 1 : 0.45);
      const r = R();
      if (r < worsening) ep.severity = Math.min(4, ep.severity + 1);
      else if (r < worsening + healing) ep.severity = Math.max(0, ep.severity - 1);
      if (ep.severity === 0) {
        ep.status = "recovering";
        ep.recoveryYear = s.year;
        ep.severity = 1;
        ep.history.push({ year: s.year, action: "recovery", severity: 1 });
        logMortality(s, ep.kind, `${MORBID_LABELS[ep.kind]}が落ち着き、生活を立て直す段階に入った`, ep);
      }
    }
    ep.lastReviewedYear = s.year;
    if (ep.severity !== prev) {
      ep.history.push({
        year: s.year,
        action: ep.severity > prev ? "worsened" : "improved",
        severity: ep.severity
      });
      ep.history = ep.history.slice(-16);
      if (ep.severity >= 3 && prev < 3 && !HL)
        L(
          `<span class="bad">${esc(MORBID_LABELS[ep.kind] || "体調の不調")}が重くなり、日々の用事にも助けが必要になった。</span>`
        );
    }
  }
  for (const ep of m.episodes)
    if (ep.status === "recovering" && s.year - (ep.recoveryYear || s.year) >= 2) {
      ep.status = "closed";
      ep.closedYear = s.year;
      logMortality(s, ep.kind, `${MORBID_LABELS[ep.kind]}の経過観察に区切りがついた`, ep);
    }
  const crisis = m.crisis;
  const acuteDespair = s.p < 15;
  const compoundDespair = s.p < 28 && (
    (s.debt || 0) >= 40000 ||
    s.fl?.housing_exclusion ||
    s.fl?.disaster_displaced ||
    s.fl?.ed_violent_threat ||
    (s.inf && (s.ob || 0) >= 75)
  );
  const inMentalCrisis = s.age >= 14 && (
    (s.p < 26 && s.rl < 45) || acuteDespair || compoundDespair
  );
  crisis.years = inMentalCrisis
    ? Math.min(9, (crisis.years || 0) + 1)
    : Math.max(0, (crisis.years || 0) - 1);
  if (crisis.years >= 2 && crisis.status === "none") {
    crisis.status = "active";
    crisis.startedYear = s.year;
    logMortality(s, "mental", "心身の負担が長く続き、相談や休息を必要とする時期になった");
  }
  if (
    crisis.status === "active" &&
    ((s.p >= 43 && s.rl >= 42) || (crisis.supportedUntilYear >= s.year && s.p >= 32))
  ) {
    crisis.status = "recovering";
    crisis.recoveryYear = s.year;
    logMortality(s, "mental", "危機のただ中を抜け、支援や休息を続けながら暮らしを整え始めた");
  }
  if (
    crisis.status === "recovering" &&
    crisis.years >= 3 &&
    crisis.supportedUntilYear < s.year &&
    inMentalCrisis
  ) {
    crisis.status = "active";
    crisis.startedYear = s.year;
    logMortality(s, "mental", "以前の危機が再び重なり、改めて支援を探す必要が生まれた");
  }
  if (crisis.status === "recovering" && s.year - (crisis.recoveryYear || s.year) > 3 && s.p >= 35)
    crisis.status = "none";
  const threatened = !!(
    s.fl?.ed_violent_threat ||
    s.fl?.criminal_yakuza ||
    s.fl?.debt_yakuza ||
    s.fl?.siracusa_feud
  );
  if (threatened && ["none", "resolved"].includes(m.threat.status)) {
    m.threat.status = "active";
    m.threat.startedYear = s.year;
    logMortality(s, "violence", "脅迫や対立による身の危険が生じ、安全を確かめる必要が出た");
  }
  if (!threatened && m.threat.status === "active") {
    m.threat.status = "resolved";
    m.threat.resolvedYear = s.year;
  }
}
function applyMortalityCare(input) {
  const s = S,
    m = mortalityState(s);
  if (!input || typeof input !== "object") throw new Error("危機への対応コードが不正");
  const { kind, action } = input,
    valid = new Set([
      "clinic",
      "emergency",
      "rest",
      "watch",
      "support",
      "safety",
      "report",
      "escape",
      "nutrition",
      "plan",
      "companionship"
    ]);
  if (!valid.has(action)) throw new Error("未定義の医療・安全対応: " + action);
  if (kind === "crisis") {
    m.crisis.lastDecisionYear = s.year;
    if (["clinic", "support", "rest"].includes(action))
      m.crisis.supportedUntilYear = s.year + P("mortality.episodeCareYears");
    if (action === "clinic" || action === "support")
      ((m.crisis.status = "recovering"), (m.crisis.recoveryYear = s.year));
  } else if (kind === "threat") {
    m.threat.lastDecisionYear = s.year;
    if (["safety", "report", "escape"].includes(action))
      m.threat.safeUntilYear = s.year + P("mortality.episodeCareYears");
  } else if (kind === "late") m.lateCareDiscussionYear = s.year;
  else if (kind === "exposure") m.exposureProtectionUntilYear = s.year + P("mortality.episodeCareYears");
  else {
    const eligible = kind === "urgent" ? urgentMortalityEpisodes(s) : m.episodes.filter(x =>
      kind === "recovering"
        ? x.status === "recovering"
        : x.status === "active" && (kind === "priority" || x.kind === kind)
    );
    const ep = eligible.sort((a, b) => b.severity - a.severity)[0];
    if (ep) {
      ep.lastDecisionYear = s.year;
      if (["clinic", "emergency", "support", "rest", "nutrition"].includes(action))
        ep.careUntilYear = s.year + P("mortality.episodeCareYears");
      if (action === "emergency" && ep.kind !== "oripathy") ep.severity = Math.max(1, ep.severity - 1);
      if (action === "clinic" && s.illness && ["respiratory", "oripathy"].includes(ep.kind))
        s.illness.treated = 1;
      ep.lastDecisionSeverity=ep.severity;
      ep.lastDecisionTreatment=mortalityEpisodeTreatment(s,ep);
      ep.history.push({ year: s.year, action, severity: ep.severity });
      ep.history = ep.history.slice(-16);
    }
    if (action === "companionship") m.lastCompanionshipYear = s.year;
  }
  logMortality(
    s,
    kind,
    {
      clinic: "診療の相談を受けた",
      emergency: "急いで医療者への連絡を試みた",
      rest: "負担を減らして休息を選んだ",
      watch: "変化を記録して様子を見た",
      support: "周囲へ支援を頼んだ",
      safety: "危険から身を守る段取りを整えた",
      report: "危険について相談と記録を試みた",
      escape: "危険な環境を避けた",
      nutrition: "食事を優先する調整をした",
      plan: "今後の暮らしと連絡先を相談した",
      companionship: "大事な人に今の希望を伝えた"
    }[action]
  );
}
function mortalityStatusMarkup(s) {
  if (!s) return "";
  const m = mortalityState(s),
    active = m.episodes.filter(x => x.status !== "closed" && (x.kind !== "oripathy" || s.fl?.dg)),
    ph = { active: "経過観察中", recovering: "回復期", closed: "区切りあり" };
  const rows = active
    .slice(-5)
    .map(
      x =>
        `<div class="ledger"><b>${esc(MORBID_LABELS[x.kind] || x.kind)}</b>：${esc(ph[x.status] || x.status)}${x.status === "active" ? `・負担の段階${x.severity}/4` : ""}` +
        `。開始：テラ暦${x.startedYear}年。${x.careUntilYear != null ? `相談・生活調整の見直し目安：${x.careUntilYear}年。` : ""}</div>`
    );
  if (m.crisis.status === "active")
    rows.push('<div class="ledger">負担の大きい時期が続いている。相談や休息の選択肢がある。</div>');
  if (m.crisis.status === "recovering")
    rows.push('<div class="ledger">心身の負担からの回復期。支援と休息を見直せる。</div>');
  if (m.threat.status === "active")
    rows.push('<div class="ledger">身の安全についての懸念が継続。相談や経路の見直しを選べる。</div>');
  return (
    rows.join("") ||
    '<p class="nt">長期の不調・危機の記録なし。</p>'
  );
}
const CAUSE_CODE_MAP = {
  "病死（小児期の急性疾患）": "medical.infant",
  "病死（呼吸器の病）": "medical.respiratory",
  "病死（循環器の病）": "medical.circulatory",
  "病死（脳血管の病）": "medical.vascular",
  "病死（職業に関わる慢性疾患）": "medical.occupational",
  "衰弱による死亡": "medical.nutrition",
  "負傷の合併症による死亡": "medical.injury_complication",
  "病死（鉱石病）": "medical.oripathy",
  "病死（病状の悪化）": "medical.chronic_unspecified",
  "急病（前兆の乏しい急変）": "medical.acute_sudden",
  "老衰": "old_age",
  "事故死（作業現場）": "accident.workplace",
  "事故死（移動中）": "accident.travel",
  "事故死（火災・建物）": "accident.fire_building",
  "事故死（不慮の転倒・負傷）": "accident.fall_injury",
  "事故死": "accident.unspecified",
  "天災による死亡": "disaster.catastrophe",
  "天災": "disaster.catastrophe",
  "戦闘職務中の死亡": "war.active_duty",
  "戦争に伴う民間人死亡": "war.civilian",
  "戦死・戦争被害": "war.casualty",
  "他殺（犯罪）": "homicide.crime",
  "他殺（抗争・報復）": "homicide.feud",
  "他殺（迫害・脅迫）": "homicide.persecution",
  "他殺": "homicide.unspecified",
  "自死": "suicide.crisis",
  "刑の執行": "legal.execution",
  "粛清による死亡": "legal.purge",
  "迫害死（ゼルグラード燃料化虐殺）": "persecution.zelgrad_purge",
  "アーツ暴走による自壊": "arts.overload",
  "事故死（源石粉塵吸入・爆発）": "accident.oripathy_dust",
  "凍死（極寒・吹雪での遭難）": "environment.hypothermia",
  "遭難死（熱砂・脱水）": "environment.dehydration",
  "怪異による精神侵食・消滅": "peril.demonic_corruption",
  "隔離・追放による衰弱死": "persecution.isolation",
  "都市モジュール衝突・砲撃被災": "war.bombardment",
  "獣害（狂暴化源石獣の襲撃）": "peril.originium_beasts",
  "海の怪異（恐魚の捕食・同化・海への喪失）": "peril.seaborn_assimilation",
  "極北の虚無・悪魔（未知の侵食による消失）": "peril.northern_demon",
  "医療拒絶による病死（敗血症・門前払い）": "persecution.medical_denial",
  "生体実験・未承認薬投与による死亡": "persecution.clinical_experiment",
  "私刑による死亡（暴徒のリンチ・放火）": "homicide.lynch_mob",
  "事故死（都市煤煙・急性スモッグ窒息）": "environment.urban_smog_toxicity",
  "事故死（落盤・坑道崩落生き埋め）": "accident.mine_collapse",
  "闘技場での致命傷（競技・地下闘技）": "career.arena_fatality",
  "暗殺・粛清（組織の掟・オメルタの執行）": "homicide.mafia_omerta",
  "国家機密漏洩・密告者処刑": "execution.espionage_silence",
  "自死（不可逆な絶望・破滅の果て）": "suicide.terminal_despair",
  "名誉の自決（矜持・信仰・拷問拒絶の自裁）": "suicide.honor_martyrdom",
  "殉職（ロドス外勤作戦）": "career.rhodes_field_casualty",
  "殉職（天災観測・救護輸送）": "career.rhodes_transporter_casualty",
  "事故死（ロドス艦内研究・機関事故）": "accident.rhodes_facility",
  "病死（ロドス医療部での看取り）": "medical.rhodes_palliative_care"
};

function mortalityDeathDetail(s, category, description, monthBasis, episodeId = null) {
  const m = mortalityState(s),
    active = m.episodes.filter(x => x.status === "active"),
    kind = category.includes("鉱石病")
      ? "oripathy"
      : (category.includes("呼吸") || category.includes("都市煤煙"))
        ? "respiratory"
        : category.includes("循環")
          ? "circulatory"
          : category.includes("脳血管")
            ? "vascular"
            : category.includes("職業に関わる")
              ? "occupational"
              : (category.includes("負傷") || category.includes("落盤") || category.includes("闘技場") || category.includes("医療拒絶") || category.includes("殉職"))
                ? "injury"
                : (category.includes("衰弱") || category.includes("隔離・追放"))
                  ? "nutrition"
                  : category.includes("看取り")
                    ? "oripathy"
                    : null;
  const ep = episodeId ? active.find(x => x.id === episodeId) : active.filter(x => category.includes("看取り")
    ? x.severity >= 3 && (x.kind === "oripathy" ? !!s.inf && s.ob > P("death.oripathyStart") : s.h < 25)
    : x.kind === kind).sort((a, b) => b.severity - a.severity)[0];
  const warRelated = ["戦闘職務中の死亡", "戦争に伴う民間人死亡", "都市モジュール衝突・砲撃被災"].includes(category);
  const job = J[s.job] || {};
  const activeDuty = category === "戦闘職務中の死亡";
  const veteran = !!s.fl?.veteran;
  const pressureContext =
    warRelated && typeof worldPressureContext === "function" ? worldPressureContext(s) : null;
  const isDirectEvent = s.deathOrigin === "event" || typeof TRACE_RESOLUTION?.id === "string";
  const originKind = isDirectEvent ? "event" : "annual";
  const originEventId = TRACE_RESOLUTION?.id || null;
  const classificationBasis = isDirectEvent
    ? "イベント選択の結果"
    : (kind && ep ? "記録された経過と年次判定" : "年次判定・その時点の生活状態");
  const warModelContext = warRelated
    ? {
        region: s.res?.n || null,
        city: s.local?.city || null,
        residenceType: s.home || null,
        occupationId: Number.isInteger(s.job) ? s.job : null,
        occupationName: job.n || null,
        dutyClass: activeDuty ? "active" : veteran ? "veteran" : "civilian",
        factors: {
          regional: Number.isFinite(s.res?.war)
            ? s.res.war *
              (s.res.n === "極東" && s.year < P("world.farEastWarReliefUntil")
                ? P("world.farEastWarReliefScale")
                : 1)
            : null,
          occupation: job.war || 1,
          duty: activeDuty ? 2 : veteran ? 1.4 : 0.45,
          regionalPressure:
            typeof worldPressure === "function" ? worldPressure(s, "war") : null
        },
        pressureIds: pressureContext?.active?.map(row => row.id) || [],
        basis: "地域・職業・従軍歴・年表圧力を使うゲーム内抽選。個人が現地の戦闘に居合わせた証拠ではない。"
      }
    : null;
  return {
    version: 1,
    causeCode: CAUSE_CODE_MAP[category] || "unknown",
    category,
    description,
    originKind,
    originEventId,
    year: s.year,
    month: Number.isInteger(s.mo) ? s.mo : null,
    monthBasis,
    age: s.age,
    place: {
      region: s.res?.n || null,
      city: s.local?.city || null,
      residenceType: s.home || null
    },
    warModelContext,
    episodeId: ep?.id || null,
    startedYear: ep?.startedYear ?? null,
    lastCareUntilYear: ep?.careUntilYear ?? null,
    careHistory: ep?.history?.slice(-12) || [],
    classificationBasis,
    note: monthBasis === "current-calendar-month" ? "記録された年月による。" : "死亡月の詳細は未記録。",
    modelNote:
      "死因名はゲーム上の分類。実世界の診断・原作の確定死因を意味しない。" +
      (monthBasis === "annual-random-placeholder"
        ? "月は年次処理後に置いた表示・記録用の仮置きで、実際の死亡月を特定しない。"
        : monthBasis === "pressure-window-sample"
          ? "月は有効な戦乱期間から選んだゲーム上の代表月で、正確な死亡月を確定しない。"
          : "月はゲーム内の進行暦による。日付までは記録しない。")
  };
}
/* 鉱石病への曝露モデル：確定的な生物学的種族差を感染抽選へ用いない。
 * 汚染現場・源石片・粉塵・天災後の環境は原作中の事例から着想した機会分類。
 * どの場面から感染したかの認定はせず、検査と判明時期を別記録とする。 */
