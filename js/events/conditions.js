const adultRomanceTag = s => !!s.romance?.stage;
// Non-simulation callers retain the original eager evaluation contract.
const eagerConditionValue = (s, k) =>
  ({
    cash: moveFunds(s),
    householdCash: s.house?.cash || 0,
    householdDebt: s.house?.debt || 0,
    debt: s.debt,
    investment: s.investment || 0,
    net: s.cash - s.debt,
    edu: eduLv(s),
    sch: s.fl?.sch ? 1 : 0,
    age: s.age,
    year: s.year,
    month: s.mo,
    literacy: literacyValue(s),
    biasInfected: s.biasInfected || 0,
    biasSarkaz: s.biasSarkaz || 0,
    socialAccess: socialParticipation(s) * 100,
    equity: socialModel(s, true).equityCommitment || 0,
    routes: moveDestinations(s).length,
    fare: moveFare(s),
    k: s.k,
    h: s.h,
    p: s.p,
    rl: s.rl,
    ar: s.ar,
    cr: s.cr,
    ob: s.ob,
    sc: s.res.sc,
    w: s.w.i,
    payBonusRoom: Math.max(0, Math.round((P("economy.maxJobPayBonus") - (s.workPayBonus || 0)) * 1e6) / 1e6),
    kids: s.kids.length,
    sib: siblingCount(s),
    access: s.local?.access || 0,
    support: s.care?.support || 0,
    hazard: s.local?.hazard || 0
  })[k];
const simulationConditionValue = (s, k) => {
  // Preserve normalization previously triggered by eager literacy/social/travel reads.
  socialModel(s, true);
  socialAftermath(s);
  ensureLocalityState(s);
  switch (k) {
    case "cash": return moveFunds(s);
    case "householdCash": return s.house?.cash || 0;
    case "householdDebt": return s.house?.debt || 0;
    case "debt": return s.debt;
    case "investment": return s.investment || 0;
    case "net": return s.cash - s.debt;
    case "edu": return eduLv(s);
    case "sch": return s.fl?.sch ? 1 : 0;
    case "age": return s.age;
    case "year": return s.year;
    case "month": return s.mo;
    case "literacy": return literacyValue(s);
    case "biasInfected": return s.biasInfected || 0;
    case "biasSarkaz": return s.biasSarkaz || 0;
    case "socialAccess": return socialParticipation(s) * 100;
    case "equity": return socialModel(s, true).equityCommitment || 0;
    case "routes": return moveDestinations(s).length;
    case "fare": return moveFare(s);
    case "k": return s.k;
    case "h": return s.h;
    case "p": return s.p;
    case "rl": return s.rl;
    case "ar": return s.ar;
    case "cr": return s.cr;
    case "ob": return s.ob;
    case "sc": return s.res.sc;
    case "w": return s.w.i;
    case "payBonusRoom": return Math.max(0, Math.round((P("economy.maxJobPayBonus") - (s.workPayBonus || 0)) * 1e6) / 1e6);
    case "kids": return s.kids.length;
    case "sib": return siblingCount(s);
    case "access": return s.local?.access || 0;
    case "support": return s.care?.support || 0;
    case "hazard": return s.local?.hazard || 0;
    default: return undefined;
  }
};
const val = (s, k) => HL ? simulationConditionValue(s, k) : eagerConditionValue(s, k);
const checkLanguageCondition = (s, langCond) => {
  if (!langCond) return true;
  if (!s || !s.languageState) return false;
  if (typeof langCond === "string") {
    return (getLanguageSkill(s, langCond, "listen") > 0 || getLanguageSkill(s, langCond, "speak") > 0);
  }
  if (typeof langCond === "object") {
    if (langCond.context) {
      const assessment = assessCommunication(s, langCond.context, langCond.assistance);
      return assessment.understood;
    }
    const langId = langCond.language || langCond.id || s.res?.n;
    const mode = langCond.mode || "listen";
    const threshold = Number.isFinite(langCond.threshold) ? langCond.threshold : 20;
    const skill = getLanguageSkill(s, langId, mode);
    let effective = skill;
    if (Array.isArray(langCond.alternatives) && Array.isArray(s.languageState.accessArrangements)) {
      const hasArrangement = languageHasSupport(
        s, langId, mode, langCond.purpose || "language-condition",
        langCond.assistance, langCond.alternatives
      );
      if (hasArrangement) effective += 25;
    }
    if (langCond.register) {
      const formal = getLanguageSkill(s, langId, "formalRegister");
      if (formal < threshold) effective -= Math.round((threshold - formal) * 0.35);
    }
    return effective >= threshold;
  }
  return true;
};
const annualCashReserve = s =>
  Math.max(
    (inSharedHousehold(s) && s.house ? s.house.exp : s.exp) || 0,
    P("economy.minimumExpenseBase") * s.res.pm * (s.priceIndex || 1)
  );
const ok = (c, s, T) => {
  if (!c) return true;
  if (typeof c === "function") return !!c(s, T);
  if (typeof c == "string") return T.has(c);
  if (Array.isArray(c)) return c.every(x => T.has(x));
  const routeBuffer = typeof c.affordableRoute == "number" ? c.affordableRoute : 0;
  const parentLedger = s.house?.parentLedger,
    parentGiftPrice =
      (parentLedger?.status === "tracked" ? parentLedger.res?.pm || s.res.pm : s.res.pm) *
      (parentLedger?.priceIndex || s.priceIndex || 1);
  return (
    (!c.need || c.need.every(x => T.has(x))) &&
    (!c.any || c.any.some(x => T.has(x))) &&
    (!c.ban || !c.ban.some(x => T.has(x))) &&
    (!c.ge || Object.keys(c.ge).every(k => val(s, k) >= c.ge[k])) &&
    (!c.le || Object.keys(c.le).every(k => val(s, k) <= c.le[k])) &&
    (!c.or || c.or.some(x => ok(x, s, T))) &&
    (!c.lang || checkLanguageCondition(s, c.lang)) &&
    (!c.affordableRoute ||
      moveDestinations(s).some(r => r.fare * s.res.pm * (s.priceIndex || 1) + routeBuffer <= moveFunds(s))) &&
    (c.affordableCash == null || moveFunds(s) >= c.affordableCash * s.res.pm * (s.priceIndex || 1)) &&
    (c.affordableCashAfterReserve == null ||
      moveFunds(s) >= c.affordableCashAfterReserve * s.res.pm * (s.priceIndex || 1) + annualCashReserve(s)) &&
    (c.affordableMedicalCash == null ||
      moveFunds(s) >= c.affordableMedicalCash * s.res.md * (s.priceIndex || 1)) &&
    (c.affordableParentHouseholdCash == null ||
      moveFunds(s) >= c.affordableParentHouseholdCash * parentGiftPrice + annualCashReserve(s)) &&
    (!c.affordableSiblingCareSupport ||
      moveFunds(s) >=
        independentSiblingCareSupportExpense(s) +
          P("economy.siblingInfectionSupportAnnualCost") * s.res.pm * (s.priceIndex || 1) *
            localityLivingMultiplier(s) * infectionCareTravelCostScale(s) +
          annualCashReserve(s))
  );
};
const stg = s => {
  const a = s.age;
  return a < P("life.stageToddlerEndAge")
    ? 0
    : a < P("life.stageChildEndAge")
      ? 1
      : a < P("life.stageYouthEndAge")
        ? 2
        : a < P("life.stageAdolescentEndAge")
          ? 3
          : a < P("life.stageAdultEndAge")
            ? 4
            : a < P("life.stageOlderAgeScale") * s.r.lm
              ? 5
              : 6;
};
const BT = new Set([
  ...STG,
  "未成年",
  "成人",
  "就学中",
  "就労中",
  "無職",
  "高齢期の非就労",
  "継続中の人生目標",
  "保留中の人生目標",
  "所属なし",
  "地域互助の担い手",
  "保留中の人生目標",
  "継続中の所属",
  "技能を練習した経験",
  "実務に熟達",
  "レム・ビリトン整備職で技能記録あり",
  "クルビア企業技術職経験",
  "技師職の安全案件",
  "技師職で安全懸念を報告",
  "技師職の安全メモ",
  "技師職の安全懸念を保留",
  "技師職の安全案件を終えた",
  "技師職で次の役割を選んだ",
  "小さな作業班の点検役",
  "後輩技師を教えた",
  "納期優先の試験調整を担った",
  "技師職の後年の働き方を決めた",
  "技師職の内部確認待ち",
  "書類未確認の部品を例外扱いした",
  "書類未確認の部品を保留した",
  "書類未確認の部品を仮受けとして記録した",
  "仕入れ記録の内部確認を終えた",
  "ロドスへ療養相談を申し込み中",
  "ロドスと継続連絡中",
  "ロドス巡回診療の予約あり",
  "ロドス巡回受診を延期中",
  "ロドス巡回診療後の療養確認",
  "ロドス職員として活動中",
  "ロドス研究班に協力中",
  "ロドス研究から離脱済み",
  "1096年のレユニオン地域網",
  "ロンディニウム期の別組織に接触",
  "1097年以後の再編レユニオン互助網に連絡中",
  "再編レユニオン互助網から離脱済み",
  "ロンディニウムの地域互助に協力中",
  "戦乱避難歴",
  "感染者排除運動の主催",
  "感染者互助組織の主催",
  "感染者排除団体に所属中",
  "感染者互助組織に所属中",
  "感染者排除団体から退出済み",
  "感染者互助組織から退出済み",
  "ウルサス学校の避難支援",
  "初等以上",
  "中等以上",
  "高等以上",
  "専門",
  "既婚",
  "離婚した相手の転居知らせ",
  "独身",
  "子あり",
  "成人した子あり",
  "別居している成人した子",
  "対象の子に曝露後の再診予定",
  "対象の別居きょうだい",
  "対象きょうだいに再診予定",
  "対象きょうだいの仕事先が前回の検査費を一部負担",
  "対象きょうだいの仕事先が曝露報告を退けた",
  "対象の同居感染きょうだいと未相談",
  "対象きょうだいとの連絡終了",
  "きょうだいから再接触の便り",
  "対象きょうだいから再接触の便り",
  "子への仕送り中",
  "子の帰宅相談中",
  "子から帰宅相談中",
  "扶養中の子",
  "扶養中の感染者",
  "親存命",
  "未把握の親感染",
  "親の継続的な手助けが必要",
  "親族ケアの負担見直しが必要",
  "退職後",
  "家計を担う親あり",
  "失業中の親",
  "両親没",
  "兄弟あり",
  "氏族養育",
  "存命の商人親",
  "存命の友人",
  "存命の顔なじみの隣人",
  "友人の消息不明を知る",
  "隣人の消息不明を知る",
  "消息不明だった友人の安否を知る",
  "消息不明だった隣人の安否を知る",
  "消息不明だった友人から返事が届く",
  "消息不明だった隣人から返事が届く",
  "診断待ち",
  "感染診断済",
  "非感染",
  "治療中",
  "隠蔽",
  "借金",
  "家計負債",
  "貧困",
  "家計逼迫",
  "裕福",
  "資金余裕",
  "投資資産に余裕",
  "種族差別",
  "制度差別",
  "戦乱地域",
  "天災危険",
  "移動都市",
  "固定集落",
  "転居経験",
  "転居直後",
  "健康不良",
  "健康良好",
  "不幸",
  "幸福",
  "孤立",
  "社交的",
  "博識",
  "アーツ優",
  "ファミリー",
  "収容中",
  "隔離中",
  "亡命",
  "ラテラーノ市民",
  "ロドスとの接触歴",
  "レジスタンス",
  "密告者",
  "徴用",
  "労災",
  "学費期",
  "修了年度",
  "避難長期化",
  "天災避難中",
  "戦乱避難中",
  "投資保有中",
  "大学在籍",
  "職業課程在籍",
  "debt_yakuza",
  "trauma_war",
  "trauma_crime",
  "criminal_yakuza",
  "veteran",
  "arts_grad",
  "workplace_hazard",
  "hid_helper",
  "patron",
  "gun",
  "knight",
  "arena",
  "segregated",
  "detained",
  "exiled",
  "insured",
  "family",
  "guard",
  "resistance",
  "rhodes",
  "reunion",
  "uni",
  "voc",
  "noble_patron"
]);
[
  "ロドスの採用照会中",
  "ロドスでの勤務経験あり",
  "ロドス勤務を休止中",
  "ロドスの職務配置と雇用が一致",
  "ロドス本艦居住",
  "ロドス本艦"
].forEach(x => BT.add(x));
[
  "旧家・領主層に縁がある生家",
  "専門職・行政職に縁がある生家",
  "商いや交易に縁がある生家",
  "労働・生業を中心とする生家",
  "流入・避難の経験を持つ生家",
  "現在の家計に余裕がない",
  "現在の家計に余裕がある",
  "都市の周縁部で暮らす",
  "生活階層が変化した経験"
].forEach(x => BT.add(x));
BT.add("病状要再診");
BT.add("受け入れた整備指導相手");
BT.add("整備手順を手帳に記録");
BT.add("住居で感染者圧力が強い");
BT.add("感染者への世間圧力が強い");
BT.add("養育者個人の消息不明を知る");
BT.add("消息不明だった養育者の安否を知る");
BT.add("配偶者の家計分担を再相談する時期");
BT.add("別居配偶者の転居知らせ");
BT.add("身体機能の見直し時期");
BT.add("身体に合わせた職務変更を考えられる");
BT.add("再編レユニオン連絡網の内部危機");
BT.add("別世帯の感染した配偶者");
BT.add("配偶者の地域で住居圧力が強い");
const PF = ["国:", "出身:", "種族:", "気質:", "性別:", "職:", "方針:", "住環境:", "地勢:", "都市:", "事件:"];
[
  "読み書きに不安がある",
  "学校外で学ぶ",
  "身近で排斥を経験",
  "差別への異議を実践",
  "感染者への強い偏見",
  "サルカズへの強い偏見",
  "感染者への偏見に疑問",
  "サルカズへの偏見に疑問"
].forEach(x => BT.add(x));
BT.add("幼い子あり");
BT.add("成人した子あり");
BT.add("別居している成人した子");
BT.add("子への仕送り中");
BT.add("対象の子が治療中");
BT.add("飼育動物との節目");
BT.add("感染した親の死後");
BT.add("感染した配偶者");
BT.add("感染を伏せた配偶者");
BT.add("サルカズの配偶者");
BT.add("婚姻関係が緊張");
BT.add("配偶者の関係を話し合う時期");
BT.add("感染者偏見");
BT.add("サルカズ偏見");
BT.add("交際中");
BT.add("親しい相手がいる");
BT.add("婚姻の縁談");
BT.add("同居する恋人");
BT.add("配偶者の療養中");
BT.add("配偶者の療養を休止中");
BT.add("配偶者の療養未開始");
BT.add("配偶者の家計分担が未相談");
BT.add("地域の感染者圧力が強い");
BT.add("地域の感染者圧力が比較的弱い");
BT.add("地域の隠蔽圧力が強い");
BT.add("地域の隠蔽圧力が比較的弱い");
BT.add("診療先へ通いやすい");
BT.add("診療先が遠い");
BT.add("感染したきょうだいがいる");
BT.add("本人が感染を知っているきょうだいがいる");
BT.add("感染した同居きょうだいがいる");
BT.add("存命のきょうだいがいる");
BT.add("存命の成人きょうだいがいる");
BT.add("きょうだいを増やせる");
BT.add("地域で少数派");
BT.add("多種族の交流圏");
BT.add("異種族の家族");
BT.add("家計分離の時期");
BT.add("高齢期の再就職後");
BT.add("勤務再開後の見直し時期");
BT.add("新婚の住まい相談");
BT.add("同居家族あり");
BT.add("知り合って一年以上");
BT.add("結婚意思確認後一年以上");
BT.add("対象の子は別居中");
BT.add("対象の子の帰宅相談中");
BT.add("対象の子から帰宅相談中");
BT.add("対象の子へ仕送り中");
BT.add("対象の子と同じ地域");
BT.add("親族ケアの再相談が必要");
BT.add("親世帯の家計を追跡中");
BT.add("ほかの存命きょうだいがいる");
BT.add("きょうだいの支援相談は未予約");
BT.add("きょうだいの親世帯支援相談時期");
BT.add("養育ネットワークとの連絡時期");
BT.add("養育ネットワークから再接触の知らせ");
BT.add("養育ネットワークの転居を知る");
BT.add("養育者個人の転居を知る");
BT.add("養育者個人の訃報を知る");
BT.add("住居で感染者圧力が強い");
BT.add("感染者への世間圧力が強い");
BT.add("養育者個人の消息不明を知る");
BT.add("消息不明だった養育者の安否を知る");
BT.add("配偶者の家計が逼迫");
BT.add("配偶者の家計相談時期");
const WFLAGS = new Set();
BT.add("子の転居知らせあり");
BT.add("親が療養費の判断を迫られている");
BT.add("親の仕事変更を知らせる");
BT.add("親世帯の転居知らせ");
BT.add("離婚後の養育について話す時期");
BT.add("離婚後に連絡を提案した");
BT.add("離婚後に仲介を頼んだ");
BT.add("離婚後に直接連絡を控えた");
BT.add("離婚後の子の生活先を相談");
BT.add("離婚後の子のもう一方の親の訃報を確認済み");
BT.add("配偶者の死の知らせ");
BT.add("配偶者が失職中");
BT.add("配偶者の求職相談が必要");
BT.add("配偶者と仕事の希望を話す時期");
BT.add("配偶者の体調について話す時期");
BT.add("配偶者の転居を相談する");
BT.add("配偶者と別居生活を相談する時期");
BT.add("別居した成人きょうだいがいる");
BT.add("別居きょうだいと連絡を取る時期");
BT.add("別居きょうだいとの連絡休止中");
BT.add("対象の別居きょうだいに仕事変更あり");
BT.add("対象の別居きょうだいに転居知らせあり");
BT.add("対象の感染した別居きょうだい");
BT.add("対象の別居きょうだい療養費支援中");
BT.add("別居きょうだいの療養費支援中");
BT.add("避難中");
BT.add("家族ケアへの関与経験が多い");
BT.add("連絡を保っている成人きょうだいがいる");
BT.add("家計の余力を最近確認した別居きょうだいがいる");
BT.add("親が感染症の治療中");
BT.add("対象きょうだいの体調に注意");
BT.add("対象きょうだいの家計を案じる知らせ");
BT.add("対象きょうだいに家族の変化あり");
BT.add("対象きょうだいの親世帯支援知らせ");
BT.add("対象きょうだいは親世帯へ支援中");
[
  "地域の供給が不安定",
  "地域の働き口が減少",
  "地域で住居を確保しにくい",
  "地域の診療が逼迫",
  "地域の移動や物流が滞る",
  "地域で復旧作業が続く",
  "地域で誰かを手伝った",
  "地域の医療相談を調べた",
  "近隣の診療拠点が利用制限中",
  "学び舎の通常授業が制限中",
  "学び舎の授業が再開した",
  "仕事場の業務が縮小中",
  "仕事場の業務が再開した",
  "以前この地区の診療拠点を調べた",
  "別の生活圏へ転居した経験"
].forEach(tag => BT.add(tag));
HIST.forEach(h => {
  if (h.flag) WFLAGS.add(h.flag);
});
["家計相談の時期", "勤務縮小済み", "病状悪化", "ターラー系の家の記録", "イベリアのエーギル系の家の記録"].forEach(tag => BT.add(tag));
/* 地域の状態は本人が居住している間の生活背景。世界全体を変えたという記録ではない。 */
