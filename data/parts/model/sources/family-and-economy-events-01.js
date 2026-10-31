// model/sources/family-and-economy-events-01: construction fragment; evaluation order is declared by data/model/sources.js.
window.TERRA_DATA_BUILD.fragment(
  "model/sources",
  "model/sources/family-and-economy-events-01"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  return [
    {
      id: "economy.schoolMaterialsAnnualCost",
      label: "初等教育の年間教材費",
      value: 30000,
      unit: "龍門幣/年",
      status: "S",
      scope: "家計・教育",
      description:
        "通学中の教材費を表す抽象費用。地域別の制度・授業料・助成は未確定のため、授業料の公式値ではない。",
      source: "ゲーム用仮定",
      usedBy: ["未成年の家計更新"]
    },
    {
      id: "economy.childCareAnnualCost",
      label: "乳幼児の養育費",
      value: 140000,
      unit: "龍門幣/年/人",
      status: "S",
      scope: "家計・子育て",
      description:
        "食事・衣類・日用品などをまとめた抽象的な年額。テラ各地の公式価格ではなく、地域物価係数で調整するゲーム用仮定。6歳未満の子に適用。",
      source: "ゲーム用仮定",
      usedBy: ["子のいる成人家計"]
    },
    {
      id: "economy.childLivingAnnualCost",
      label: "児童の養育費",
      value: 220000,
      unit: "龍門幣/年/人",
      status: "S",
      scope: "家計・子育て",
      description:
        "食事・衣類・日用品などをまとめた抽象的な年額。学費や医療費は別イベントで扱い、地域物価係数で調整する。6歳以上15歳未満に適用。",
      source: "ゲーム用仮定",
      usedBy: ["子のいる成人家計"]
    },
    {
      id: "economy.childTeenAnnualCost",
      label: "少年期の養育費",
      value: 300000,
      unit: "龍門幣/年/人",
      status: "S",
      scope: "家計・子育て",
      description:
        "食費・衣類・移動・日用品などをまとめた抽象的な年額。18歳未満の子に適用する。成人後の生活支援は別の選択状態と費目で扱う。",
      source: "ゲーム用仮定",
      usedBy: ["子のいる成人家計"]
    },
    {
      id: "economy.adultChildSupportAnnualCost",
      label: "成人した子の家族内生活支援費",
      value: 350000,
      unit: "龍門幣/年/人",
      status: "S",
      scope: "家計・子育て",
      description:
        "家族と同居し、本人が生活を支える選択をした成人した子の食費・衣類・日用品など。住居・療養・学業費は別計上。地域ごとの公式価格・扶養制度ではなく、物価指数で調整するゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["子の成人後の家計"]
    },
    {
      id: "economy.adultChildSharedHousingAnnualCost",
      label: "同居する成人子の住居・共益費",
      value: 90000,
      unit: "龍門幣/年/人",
      status: "S",
      scope: "家計・住居",
      description:
        "成人した子が家族と同居する場合の共益費・水道光熱・住居維持への追加負担を表す基準額。家賃や賃貸契約、公式の住宅相場ではなく、物価指数で調整するゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["成人子の同居家計"]
    },
    {
      id: "economy.adultChildStudyAnnualCost",
      label: "成人した子の学業支援費",
      value: 220000,
      unit: "龍門幣/年/人",
      status: "S",
      scope: "家計・教育",
      description:
        "専門課程・技術訓練へ進む子を家族が支える場合の年額追加費用。授業料や制度の公式価格ではなく、進学アクセス・学費減免の地域差を別途モデル化するまでのゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["子の学業支援"]
    },
    {
      id: "economy.childHouseholdContributionShare",
      label: "働く子の家計拠出割合",
      value: 0.3,
      unit: "賃金比率",
      status: "S",
      scope: "家計・子育て",
      description:
        "同居して働く成人した子の推定賃金のうち、家計へ入る割合。家族内の慣行を示す公式値ではなく、共同生活の負担を追跡するゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["子の家計拠出"]
    },
    {
      id: "economy.spouseSharedHouseholdIncomeShare",
      label: "夫婦共同家計への配偶者拠出割合",
      value: 0.65,
      unit: "配偶者の推定賃金比率",
      status: "S",
      scope: "家計・配偶者",
      description:
        "共同家計を選んだ際、配偶者の職業表上の推定賃金から家計に入る割合。雇用率・賃金統計・婚姻慣行を示す公式値ではなく、実際の就労状態を限定記録するまでのゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の年次家計拠出"]
    },
    {
      id: "economy.spouseSeparateHouseholdIncomeShare",
      label: "個別会計時の配偶者拠出割合",
      value: 0.25,
      unit: "配偶者の推定賃金比率",
      status: "S",
      scope: "家計・配偶者",
      description:
        "配偶者が収入を個別に管理しながら家計へ分担する場合の抽象割合。制度・家族慣行・統計ではなくゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の年次家計拠出"]
    },
    {
      id: "economy.spouseSeparateSupportAnnualCost",
      label: "別居配偶者への生活費支援",
      value: 180000,
      unit: "龍門幣/年",
      status: "S",
      scope: "配偶者・家計",
      description:
        "別地域で暮らす配偶者へ送る生活費の抽象年額。実際の扶養義務や平均送金額を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居配偶者への年次支援"]
    },
    {
      id: "economy.spouseContactAnnualCost",
      label: "別居配偶者との便りの基準費",
      value: 5000,
      unit: "龍門幣/年",
      status: "S",
      scope: "配偶者・家計",
      description:
        "別居配偶者との便り・短い通話を続けるための抽象年額。実際の通信料金・頻度を示す正史情報ではなくゲーム用仮定。地域物価と生活物価指数で調整する。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居配偶者との連絡費"]
    },
    {
      id: "economy.spouseRegularContactCostScale",
      label: "別居配偶者との定期連絡費倍率",
      value: 2,
      unit: "便り基準費の倍率",
      status: "S",
      scope: "配偶者・家計",
      description:
        "定期的な連絡を便り中心の連絡より高く見積もる抽象倍率。実際の通信頻度や料金を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居配偶者との連絡費"]
    },
    {
      id: "economy.spouseMoveCostBase",
      label: "配偶者が単独転居する基準費",
      value: 65000,
      unit: "龍門幣/回",
      status: "S",
      scope: "配偶者・家計",
      description:
        "別居中の配偶者が地域を移る際の荷造り等の抽象費用。運賃に加算し、実際の移転価格を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の独立した地域移動"]
    },
    {
      id: "economy.spouseOpeningSavingsShare",
      label: "配偶者の婚姻時貯蓄推計率",
      value: 0.08,
      unit: "過去賃金に対する年率",
      status: "S",
      scope: "配偶者・家計",
      description:
        "婚姻時点の独立した貯蓄残高を、職業表の推定賃金と過去就労年数からゲーム上推計する率。公式貯蓄統計ではなく、旧記録には適用しない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の初期家計推計"]
    },
    {
      id: "economy.spouseOpeningDebtChance",
      label: "配偶者の婚姻時借入推計率",
      value: 0.24,
      unit: "確率",
      status: "S",
      scope: "配偶者・家計",
      description:
        "婚姻時点の配偶者に推定借入残高を付与するゲーム用確率。債務統計ではなく、旧記録には適用しない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の初期家計推計"]
    },
    {
      id: "economy.spouseOpeningDebtMinYears",
      label: "配偶者の初期借入推計下限",
      value: 0.25,
      unit: "年分の賃金",
      status: "S",
      scope: "配偶者・家計",
      description: "婚姻時に借入があると推計された場合の推定賃金年数の下限。公式借入額ではなくゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の初期家計推計"]
    },
    {
      id: "economy.spouseOpeningDebtMaxYears",
      label: "配偶者の初期借入推計上限",
      value: 1.5,
      unit: "年分の賃金",
      status: "S",
      scope: "配偶者・家計",
      description: "婚姻時に借入があると推計された場合の推定賃金年数の上限。公式借入額ではなくゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の初期家計推計"]
    },
    {
      id: "economy.spouseLivingExpenseShare",
      label: "同居配偶者の生活費増加割合",
      value: 0.65,
      unit: "本人の基礎生活費比",
      status: "S",
      scope: "家計・配偶者",
      description:
        "配偶者と同居する家計に加える食事・日用品等の抽象生活費。家族一人あたり支出統計や地域価格そのものではなく、既存の基礎生活費を用いるゲーム上の世帯人数補正。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の年次家計支出"]
    },
    {
      id: "economy.spouseSeparateHousingExpenseShare",
      label: "別居配偶者の住居維持費割合",
      value: 0.28,
      unit: "別居生活費に占める割合",
      status: "S",
      scope: "家計・配偶者",
      description:
        "別居配偶者の既存の年間生活費を、住居維持とその他の生活へ見やすく分ける帳簿上の割合。総支出へ上乗せせず、家賃・契約形態・住居価格を示さないゲーム用仮定。資料は龍門の地区ごとに住宅密度等が異なると整理するが、住居費の数値は示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_HOUSING_CONTEXT"],
      usedBy: ["配偶者の別居家計内訳"]
    },
    {
      id: "economy.spouseSharedHousingMultiplier",
      label: "相部屋・間借り住居維持費倍率",
      value: 0.65,
      unit: "標準住居費比",
      status: "S",
      scope: "配偶者・家計",
      description:
        "別居配偶者が相部屋や間借りを選ぶ場合の、帳簿上の住居費倍率。テラの家賃相場や実在する標準契約を示す資料はなく、住居選択の家計差を表現するゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_HOUSING_CONTEXT"],
      usedBy: ["別居配偶者の住居選択"]
    },
    {
      id: "economy.spousePrivateHousingMultiplier",
      label: "個室住居維持費倍率",
      value: 1.4,
      unit: "標準住居費比",
      status: "S",
      scope: "配偶者・家計",
      description:
        "別居配偶者が個室を選ぶ場合の、帳簿上の住居費倍率。テラの家賃相場や実在する標準契約を示さず、選択による家計差を表すゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_HOUSING_CONTEXT"],
      usedBy: ["別居配偶者の住居選択"]
    },
    {
      id: "economy.spouseHousingChangeCost",
      label: "住居変更の初期費用",
      value: 18000,
      unit: "龍門幣/回",
      status: "S",
      scope: "配偶者・家計",
      description:
        "別居配偶者が住まいを変更する際に生じる荷運び・寝具等の抽象費用。敷金・賃貸契約や実際の価格を表さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_HOUSING_CONTEXT"],
      usedBy: ["別居配偶者の住居選択"]
    },
    {
      id: "economy.spouseHousingChangeReserveShare",
      label: "住居変更後に残す生活準備金",
      value: 0.25,
      unit: "本人の基準年支出比",
      status: "S",
      scope: "配偶者・家計",
      description:
        "住居変更の初期費用を払った後、別居配偶者本人の現金に残す最低限の家計準備金。年支出の25%は人口・制度統計ではなく選択制約のゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_HOUSING_CONTEXT"],
      usedBy: ["別居配偶者の住居変更可否"]
    },
    {
      id: "family.siracusaFamilyReviewYears",
      label: "シラクーザのファミリー関係を見直す目安",
      value: 6,
      unit: "年",
      status: "S",
      scope: "地域関係・シラクーザ",
      description:
        "仕事・保護・債務・地域内のつながりがどう続いているかを改めて選ぶためのゲーム用間隔。ファミリーの実際の加入期間や離脱頻度を表す統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_CRIME_REGIONAL"],
      usedBy: ["シラクーザのファミリー関係見直し"]
    },
    {
      id: "family.siracusaFamilyDutyYears",
      label: "シラクーザの個別仕事を再び頼まれる目安",
      value: 3,
      unit: "年",
      status: "S",
      scope: "地域関係・シラクーザ",
      description:
        "個人が関係する用事を数年おきに再提示するための間隔。ファミリーの実際の仕事量や犯罪頻度ではなく、局所的な架空経路を動かすゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_CRIME_REGIONAL"],
      usedBy: ["シラクーザでの個別の手伝い"]
    },
    {
      id: "family.spouseArrangementReviewYears",
      label: "配偶者との家計分担再相談の目安",
      value: 5,
      unit: "年",
      status: "S",
      scope: "家計・配偶者",
      description:
        "家計分担を決めた後、暮らしの変化を改めて話し合うためのゲーム用間隔。婚姻慣行や実際の再相談頻度を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者との家計分担再相談"]
    },
    {
      id: "family.spouseFinanceReviewMinYears",
      label: "配偶者本人の家計を再確認する最短間隔",
      value: 2,
      unit: "年",
      status: "S",
      scope: "配偶者・家計",
      description:
        "配偶者本人の収支を話し合う時期の下限。生活費・雇用・借入に関する実際の頻度を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の家計相談"]
    },
    {
      id: "family.spouseFinanceReviewMaxYears",
      label: "配偶者本人の家計を再確認する最長間隔",
      value: 5,
      unit: "年",
      status: "S",
      scope: "配偶者・家計",
      description:
        "配偶者本人の収支を話し合う時期の上限。経済変化に気づくための節目であり、実際の相談頻度を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の家計相談"]
    },
    {
      id: "family.spouseWorkReviewMinYears",
      label: "配偶者の仕事を見直す最短間隔",
      value: 4,
      unit: "年",
      status: "S",
      scope: "配偶者・生業",
      description:
        "少数の配偶者記録だけを節目ごとに見直す最短間隔。テラの職業移動統計ではなく、全NPCを常時更新しないためのゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の限定的な職業更新"]
    },
    {
      id: "family.spouseWorkReviewMaxYears",
      label: "配偶者の仕事を見直す最長間隔",
      value: 9,
      unit: "年",
      status: "S",
      scope: "配偶者・生業",
      description: "配偶者の仕事を再検討する節目の上限間隔。転職の発生や雇用継続を保証しないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の限定的な職業更新"]
    },
    {
      id: "family.spouseMoveReviewMinYears",
      label: "別居配偶者の転居見直し最短間隔",
      value: 4,
      unit: "年",
      status: "S",
      scope: "配偶者・移動",
      description:
        "別居配偶者が仕事・住居・生活上の都合から別地域への移動を考える機会の最短間隔。移住実績を表さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の独立した地域移動"]
    },
    {
      id: "family.spouseMoveReviewMaxYears",
      label: "別居配偶者の転居見直し最長間隔",
      value: 8,
      unit: "年",
      status: "S",
      scope: "配偶者・移動",
      description:
        "別居配偶者の地域移動機会を再確認する上限間隔。本人が必ず移ることを意味しないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の独立した地域移動"]
    },
    {
      id: "family.spouseIndependentMoveChance",
      label: "別居配偶者の転居抽象確率",
      value: 0.12,
      unit: "確率/確認時",
      status: "S",
      scope: "配偶者・移動",
      description:
        "転居見直し時に、本人が資金と経路を確保して別地域へ移るゲーム用確率。雇用移動・移住統計を表さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の独立した地域移動"]
    },
    {
      id: "family.spouseWorkChangeChance",
      label: "仕事の見直し時に職を変える抽象確率",
      value: 0.18,
      unit: "確率",
      status: "S",
      scope: "配偶者・生業",
      description:
        "仕事の節目ごとに職業候補表から別の仕事へ移るゲーム用確率。失業率・転職率・国別雇用統計を表さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の限定的な職業更新"]
    },
    {
      id: "family.spouseUnemploymentChance",
      label: "仕事の見直し時に職を失う抽象確率",
      value: 0.06,
      unit: "確率",
      status: "S",
      scope: "配偶者・生業",
      description:
        "追跡中の配偶者が仕事の節目に失職するゲーム用確率。産業別の雇用統計・地域の実際の失業率を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の求職・家計"]
    },
    {
      id: "family.spouseReemploymentReviewMinYears",
      label: "配偶者の再就職見直し最短間隔",
      value: 1,
      unit: "年",
      status: "S",
      scope: "配偶者・生業",
      description: "失職後に再就職状況を確認する最短のゲーム上の間隔。実際の求人・採用期間を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の求職・家計"]
    },
    {
      id: "family.spouseReemploymentReviewMaxYears",
      label: "配偶者の再就職見直し最長間隔",
      value: 3,
      unit: "年",
      status: "S",
      scope: "配偶者・生業",
      description: "失職後に再就職状況を再確認する間隔の上限。就職・雇用を保証しないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の求職・家計"]
    },
    {
      id: "family.spouseReemploymentChance",
      label: "失職中の再就職抽象確率",
      value: 0.42,
      unit: "確率/確認時",
      status: "S",
      scope: "配偶者・生業",
      description: "再就職の確認時に仕事を得るゲーム用確率。地域や資格別の採用実績ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の求職・家計"]
    },
    {
      id: "family.spouseTrainingReemploymentBoost",
      label: "職業訓練を支援した場合の再就職補正",
      value: 0.18,
      unit: "加算確率",
      status: "S",
      scope: "配偶者・生業",
      description:
        "本人が望む講習を支援した場合、次の再就職判定に一度だけ加えるゲーム用補正。訓練の実際の効果を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の求職・家計"]
    },
    {
      id: "family.spouseSearchReemploymentBoost",
      label: "求職活動を手伝った場合の再就職補正",
      value: 0.1,
      unit: "加算確率",
      status: "S",
      scope: "配偶者・生業",
      description:
        "相手の希望に沿って求人探しを手伝った場合、次の再就職判定に一度だけ加えるゲーム用補正。実際の採用効果を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の求職・家計"]
    },
    {
      id: "family.spouseWorkPreferenceReviewMinYears",
      label: "配偶者と仕事の希望を話し合う最短間隔",
      value: 5,
      unit: "年",
      status: "S",
      scope: "配偶者・生業",
      description:
        "現在の仕事や求職条件について本人の希望を再確認するゲーム上の間隔。実際の家族内会話頻度を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の仕事希望"]
    },
    {
      id: "family.spouseWorkPreferenceReviewMaxYears",
      label: "配偶者と仕事の希望を話し合う最長間隔",
      value: 9,
      unit: "年",
      status: "S",
      scope: "配偶者・生業",
      description: "配偶者が仕事の希望を改めて話す機会を置く間隔の上限。本人の希望を固定するものではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の仕事希望"]
    },
    {
      id: "family.spouseSeparateReviewMinYears",
      label: "別居配偶者との生活相談の最短間隔",
      value: 3,
      unit: "年",
      status: "S",
      scope: "配偶者・家計",
      description:
        "別居中の連絡と家計支援を見直す抽象的なゲーム内間隔。実際の手紙・移動・会話の頻度を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居配偶者との生活相談"]
    },
    {
      id: "family.spouseSeparateReviewMaxYears",
      label: "別居配偶者との生活相談の最長間隔",
      value: 5,
      unit: "年",
      status: "S",
      scope: "配偶者・家計",
      description: "別居中の連絡と家計支援を見直す間隔の上限。本人らの関係変化を決めつけないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居配偶者との生活相談"]
    },
    {
      id: "family.spouseHealthInitialMin",
      label: "新規配偶者の健康目安下限",
      value: 68,
      unit: "健康点",
      status: "S",
      scope: "配偶者・健康",
      description:
        "追跡開始時の一般的な体調目安の下限。出生・婚姻人口の健康統計ではなく、感染診断や疾病を表さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE"],
      usedBy: ["配偶者の限定的な一般健康更新"]
    },
    {
      id: "family.spouseHealthInitialMax",
      label: "新規配偶者の健康目安上限",
      value: 94,
      unit: "健康点",
      status: "S",
      scope: "配偶者・健康",
      description:
        "追跡開始時の一般的な体調目安の上限。出生・婚姻人口の健康統計ではなく、感染診断や疾病を表さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE"],
      usedBy: ["配偶者の限定的な一般健康更新"]
    },
    {
      id: "family.spouseHealthLegacyBaseline",
      label: "旧配偶者記録の追跡開始時健康目安",
      value: 78,
      unit: "健康点",
      status: "S",
      scope: "配偶者・健康",
      description:
        "健康欄のない旧セーブを現在年から追跡するための中立的な開始目安。過去の健康や診断を復元しない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE"],
      usedBy: ["旧配偶者セーブの現在年移行"]
    }
  ];
});
