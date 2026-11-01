function pickBirthSocialPosition(g, w, care) {
  const common = [
    { n: "都市の雇用世帯", w: 4 },
    { n: "農村・採集世帯", w: 2 },
    { n: "職人・商いの家", w: 1.5 },
    { n: "移住・避難世帯", w: care?.kind === "避難・離散した世帯で育つ" ? 5 : 0.35 }
  ];
  const regional = {
    "ウルサス": [
      { n: "都市労働者世帯", w: 3 },
      { n: "農村共同体", w: 2.5 },
      { n: "旧家・官僚の家", w: 0.65 },
      { n: "貧民街・避難世帯", w: 2 }
    ],
    "レム・ビリトン": [
      { n: "鉱山・採掘の家", w: 2.5 },
      { n: "開拓・輸送世帯", w: 3 },
      { n: "町の職人・商家", w: 2 },
      { n: "土地を持つ家", w: 0.5 }
    ],
    "ラテラーノ": [
      { n: "都市に暮らす世帯", w: 4 },
      { n: "聖職・教会関係の家", w: 1.2 },
      { n: "移住者・滞在者の世帯", w: 1.5 },
      { n: "都市労働者世帯", w: 2 }
    ],
    "カズデル": [
      { n: "移動・離散した住民世帯", w: 4 },
      { n: "傭兵・護衛の家", w: 2 },
      { n: "避難先の雇用世帯", w: 2 },
      { n: "交易・職人の家", w: 1 }
    ],
    "イェラグ": [
      { n: "氏族・共同体の家", w: 4 },
      { n: "山間の農牧世帯", w: 2.5 },
      { n: "交易・宿場の家", w: 1.4 },
      { n: "氏族の有力家", w: 0.7 }
    ],
    "シラクーザ": [
      { n: "都市労働者世帯", w: 3 },
      { n: "商い・職人の家", w: 2 },
      { n: "ファミリーと縁のある家", w: 0.75 },
      { n: "農村世帯", w: 1.5 }
    ],
    "クルビア": [
      { n: "移民・開拓世帯", w: 3 },
      { n: "工業・研究都市の雇用世帯", w: 3 },
      { n: "農村世帯", w: 1.5 },
      { n: "資本・専門職の家", w: 0.8 }
    ],
    "龍門": [
      { n: "長屋・都市労働者世帯", w: 4 },
      { n: "商店・職人の家", w: 2 },
      { n: "公的機関の家", w: 1.1 },
      { n: "周縁区・流入世帯", w: 2 }
    ],
    "ヴィクトリア": [
      { n: "工業区の労働世帯", w: 4 },
      { n: "農村・荘園の奉公世帯", w: 2 },
      { n: "商人・職人の家", w: 2 },
      { n: "貴族・地主の家", w: 0.45 }
    ],
    "リターニア": [
      { n: "都市の職人・労働世帯", w: 3 },
      { n: "音楽・劇場に関わる家", w: 2 },
      { n: "地方領主の保護下", w: 1.4 },
      { n: "貴族・アーツ名家", w: 0.5 }
    ],
    "カジミエーシュ": [
      { n: "都市の一般市民世帯", w: 4 },
      { n: "農村・牧畜世帯", w: 2 },
      { n: "騎士団に縁のある家", w: 0.7 },
      { n: "企業・商人の家", w: 1.5 }
    ],
    "サルゴン": [
      { n: "オアシス・水場の共同体", w: 3 },
      { n: "農牧・狩猟世帯", w: 3 },
      { n: "隊商・市場の家", w: 2 },
      { n: "部族・都市の有力家", w: 0.6 }
    ],
    "ボリバル": [
      { n: "農園・農村労働世帯", w: 3 },
      { n: "港湾・交易の家", w: 2 },
      { n: "都市の職人・労働世帯", w: 2 },
      { n: "軍政・有力者の家", w: 0.65 }
    ],
    "極東": [
      { n: "農漁・沿岸の家", w: 3 },
      { n: "町人・職人の家", w: 3 },
      { n: "氏族・武家に縁のある家", w: 0.8 },
      { n: "港の流入世帯", w: 1.5 }
    ],
    "シエスタ": [
      { n: "観光・飲食の家", w: 3 },
      { n: "漁業・港湾の世帯", w: 2 },
      { n: "移動都市の労働世帯", w: 2 },
      { n: "商い・興行の家", w: 1.5 }
    ],
    "ミノス": [
      { n: "牧畜・農村共同体", w: 3 },
      { n: "都市の職人世帯", w: 2 },
      { n: "競技・鍛冶に縁のある家", w: 1.2 },
      { n: "有力市民の家", w: 0.5 }
    ],
    "サーミ": [
      { n: "集落・狩猟共同体", w: 4 },
      { n: "交易路の世帯", w: 1.2 },
      { n: "辺境の移住世帯", w: 1.5 }
    ],
    "炎国": [
      { n: "町の職人・商いの家", w: 3 },
      { n: "田畑に関わる世帯", w: 3 },
      { n: "街区の雇用世帯", w: 3 },
      { n: "官衙・書記仕事に縁がある家", w: 1 },
      { n: "土地や商会に縁のある有力家", w: 0.45 }
    ],
    "イベリア": [
      { n: "港町・沿岸の雇用世帯", w: 2.5 },
      { n: "内陸の農漁・手仕事の家", w: 3 },
      { n: "船舶整備や運送の家", w: 1.4 },
      { n: "信仰共同体に縁のある家", w: 1 },
      { n: "移住・避難世帯", w: 1.5 }
    ],
    "ヒガシ": [
      { n: "農村・氏族の家", w: 3 },
      { n: "港町・職人の家", w: 2 },
      { n: "武家・役所に縁のある家", w: 0.8 }
    ]
  };
  // 出自は資産の別名ではない。貴族も窮乏し、労働者も資産を持ちうる。
  // ただし世帯の資産が正反対の組合せは少数に留めるゲーム用条件付き抽選。
  const high = /貴族|旧家|資本|有力|領主|騎士団|武家|官僚|公的機関|聖職|氏族の有力|軍政|商家/;
  const precarious = /貧民|避難|離散|流入|周縁|奉公/;
  const pool = (regional[g?.n] || common).map(x => {
    let factor = 1;
    if (high.test(x.n)) factor = [0.12, 0.3, 0.85, 1.35, 1.75][w.i];
    if (precarious.test(x.n)) factor = [2, 1.65, 1, 0.55, 0.25][w.i];
    if (care?.kind === "避難・離散した世帯で育つ" && precarious.test(x.n)) factor *= 2;
    return { ...x, w: x.w * factor };
  });
  return wp(pool).n;
}
/* 生まれた家の制度的な立場と、現在の経済状態・暮らしは別の記録。
   これらの等級・重みは人生シミュレーション用であり、テラ共通の公定階級ではない。 */
const CLASS_ORIGIN_GROUPS = {
  landed: /貴族|地主|領主|旧家|氏族の有力|武家/,
  professional: /官僚|公的機関|専門職|研究|聖職|騎士団|有力市民/,
  merchant: /商人|商い|商家|交易|隊商|市場|資本|興行/,
  labor: /工業|労働|職人|鉱山|採掘|農|牧|漁|狩猟|工場|輸送|運送|開拓|飲食|宿|雇用/,
  displaced: /避難|離散|貧民|周縁|流入|移住者|滞在者/
};
function classOriginGroup(label) {
  for (const [key, pattern] of Object.entries(CLASS_ORIGIN_GROUPS)) if (pattern.test(label || "")) return key;
  return "community";
}
function currentClassBand(s) {
  if (!s?.w) return "unverified";
  if (
    s.displacement?.status === "shelter" ||
    s.fl?.war_displaced ||
    s.fl?.disaster_displaced ||
    s.fl?.kazdel_displaced
  )
    return "displaced";
  if (s.fl?.detained || s.fl?.segregated) return "restricted";
  if (s.w.i === 0) return "precarious";
  if (s.w.i === 1) return "low_income";
  if (s.w.i >= 4) return "wealthy";
  if (s.w.i === 3) return "secure";
  return s.job > 0 ? "working" : "modest";
}
const CLASS_BAND_NAMES = {
  unverified: "未確認",
  displaced: "避難・住居不安定",
  restricted: "就労・居住に制限",
  precarious: "生活基盤が脆弱",
  low_income: "家計に余裕が少ない",
  modest: "平均的な暮らし",
  working: "働いて生活を維持",
  secure: "比較的安定した暮らし",
  wealthy: "資産に余裕がある"
};
function initializeSocialClass(s) {
  if (s.socialClass && typeof s.socialClass === "object") return repairSocialClass(s);
  s.socialClass = {
    version: 1,
    origin: s.socialPosition || "出自未確認",
    originRegion: s.g?.n || null,
    originWealth: s.originWealth?.n || null,
    originGroup: classOriginGroup(s.socialPosition),
    originRecordedYear: s.by,
    legacyOrigin: !s.originWealth,
    currentBand: currentClassBand(s),
    bandSinceYear: s.year,
    lastReviewedYear: s.year,
    neighborhoodHistory: [],
    opportunities: [],
    experiences: [],
    mobilityHistory: [],
    viewHistory: [],
    view: "未形成・未確認"
  };
  return s.socialClass;
}
function repairSocialClass(s) {
  const c = s.socialClass;
  if (!c || typeof c !== "object") return initializeSocialClass(s);
  c.version = 1;
  c.origin ||= s.socialPosition || "出自未確認";
  c.originGroup ||= classOriginGroup(c.origin);
  c.originRegion ||= s.g?.n || null;
  c.originWealth ||= s.originWealth?.n || null;
  for (const key of ["neighborhoodHistory", "opportunities", "experiences", "mobilityHistory", "viewHistory"])
    if (!Array.isArray(c[key])) c[key] = [];
  c.view ||= "未形成・未確認";
  c.currentBand ||= currentClassBand(s);
  if (!Number.isInteger(c.bandSinceYear)) c.bandSinceYear = s.year;
  if (!Number.isInteger(c.lastReviewedYear)) c.lastReviewedYear = s.year;
  return c;
}
function refreshSocialClass(s, reason = "年次の暮らしの見直し") {
  const c = initializeSocialClass(s),
    next = currentClassBand(s),
    prev = c.currentBand;
  if (prev !== next) {
    c.mobilityHistory.push({
      year: s.year,
      from: prev,
      to: next,
      reason,
      region: s.res?.n || null,
      householdWealth: s.w?.n || null,
      job: (typeof occupationLabel === "function" ? occupationLabel(s) : J[s.job]?.n) || null,
      basis: "game-model"
    });
    c.mobilityHistory = c.mobilityHistory.slice(-40);
    c.currentBand = next;
    c.bandSinceYear = s.year;
  }
  c.lastReviewedYear = s.year;
}
function applyClassExperience(s, e) {
  if (!e || typeof e !== "object") return;
  const c = initializeSocialClass(s),
    kind = String(e.kind || "experience"),
    note = String(e.note || "").slice(0, 200);
  const row = {
    year: s.year,
    age: s.age,
    kind,
    note,
    region: s.res?.n || null,
    eventId: TRACE_RESOLUTION?.id || null,
    choice: TRACE_RESOLUTION?.label || null,
    basis: "game-fiction"
  };
  if (e.view) {
    c.view = String(e.view);
    c.viewHistory.push({ year: s.year, value: c.view, reason: note, eventId: row.eventId });
    c.viewHistory = c.viewHistory.slice(-30);
  }
  if (e.opportunity) {
    c.opportunities.push({ ...row, status: String(e.opportunity) });
    c.opportunities = c.opportunities.slice(-30);
  } else {
    c.experiences.push(row);
    c.experiences = c.experiences.slice(-50);
  }
  if (e.relocateKind) {
    if (s.home !== "移動都市" || !SIM_TABLES.locality.mobile.some(x => x.n === e.relocateKind))
      throw Error("居住区画の移転先が一致しない");
    const previous = s.local?.kind || null,
      city = s.local?.city || null;
    s.local = makeLocality(s.home, s.res.n, e.relocateKind);
    s.local.city = city;
    clearLocalContacts(s);
    s.residenceHistory || (s.residenceHistory = []);
    s.residenceHistory.push({
      year: s.year,
      fromLocality: previous,
      toLocality: e.relocateKind,
      region: s.res.n,
      city,
      arrangement: s.residenceArrangement,
      reason: "住居費・家計をめぐる転居",
      basis: "game-model"
    });
    s.residenceHistory = s.residenceHistory.slice(-24);
    c.neighborhoodHistory.push({ ...row, from: previous, to: e.relocateKind });
  } else if (e.neighborhood) {
    c.neighborhoodHistory.push({ ...row, residence: s.local?.kind || null });
  }
  c.neighborhoodHistory = c.neighborhoodHistory.slice(-20);
}
function socialClassSummary(s) {
  const c = initializeSocialClass(s);
  return {
    origin: c.origin,
    originGroup: c.originGroup,
    originWealth: c.originWealth,
    originRegion: c.originRegion,
    current: CLASS_BAND_NAMES[c.currentBand] || "未確認",
    currentBand: c.currentBand,
    view: c.view,
    changes: c.mobilityHistory.slice(-8),
    experiences: c.experiences.slice(-8),
    opportunities: c.opportunities.slice(-8)
  };
}
