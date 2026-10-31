// model/sources/family-and-economy-events-03: construction fragment; evaluation order is declared by data/model/sources.js.
window.TERRA_DATA_BUILD.fragment(
  "model/sources",
  "model/sources/family-and-economy-events-03"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  return [
    {
      id: "family.parentWorkReviewMinYears",
      label: "家計分離後の親の仕事見直し最短間隔",
      value: 3,
      unit: "年",
      status: "S",
      scope: "家族・生活経路",
      description: "親の仕事の変化を確認するモデル上の最短間隔。テラの雇用契約や転職頻度を示す統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["家計分離後の親の仕事"]
    },
    {
      id: "family.parentWorkReviewMaxYears",
      label: "家計分離後の親の仕事見直し最長間隔",
      value: 8,
      unit: "年",
      status: "S",
      scope: "家族・生活経路",
      description: "仕事の変化を確率的に検討するまでの上限。実際の雇用継続期間ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["家計分離後の親の仕事"]
    },
    {
      id: "family.parentWorkChangeChance",
      label: "仕事見直し時に親の生業が変わる確率",
      value: 0.24,
      unit: "割合",
      status: "S",
      scope: "家族・生活経路",
      description: "家計分離後の親に仕事の変化を起こすためのゲーム用確率。地域別の転職率や失業率ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["家計分離後の親の仕事"]
    },
    {
      id: "family.parentMoveReviewMinYears",
      label: "別居後の親世帯移動の最短見直し間隔",
      value: 4,
      unit: "年",
      status: "S",
      scope: "家族・移動",
      description: "家計分離後、親世帯の転居可能性を再検討する最短間隔。テラの移住頻度を示す統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["家計分離後の親世帯移動"]
    },
    {
      id: "family.parentMoveReviewMaxYears",
      label: "別居後の親世帯移動の最長見直し間隔",
      value: 9,
      unit: "年",
      status: "S",
      scope: "家族・移動",
      description: "親世帯の転居可能性を再検討するまでの上限間隔。地域の定住制度や移動周期を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["家計分離後の親世帯移動"]
    },
    {
      id: "family.parentMoveChance",
      label: "移動見直し時に親世帯が転居する確率",
      value: 0.12,
      unit: "割合",
      status: "S",
      scope: "家族・移動",
      description: "仕事・住居・家計の事情を抽象化したゲーム確率。正史上の転居率や地域別移住統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["家計分離後の親世帯移動"]
    },
    {
      id: "family.parentHouseholdMoveCostBase",
      label: "親世帯転居の基礎費用",
      value: 90000,
      unit: "龍門幣相当",
      status: "S",
      scope: "家族・家計",
      description:
        "荷物・仮住まい・手続き等をまとめた移動時の追加費用。地域の公定引越費用ではなくゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["家計分離後の親世帯移動"]
    },
    {
      id: "family.parentCareNeedThreshold",
      label: "親族の手助けが必要とみなす健康値",
      value: 34,
      unit: "0–100点",
      status: "S",
      scope: "家族・ケア",
      description: "親の手助けを相談するイベントの抽象条件。診断や介護認定の基準ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["親族のケアイベント"]
    },
    {
      id: "family.parentCareDirectMinHealth",
      label: "本人が継続的な直接ケアを選べる体調の目安",
      value: 25,
      unit: "0–100点",
      status: "S",
      scope: "家族・ケア",
      description:
        "本人が二年間の付き添い・日々の用事を主に担う選択の抽象的な下限。医療的な就労可否や介護能力の診断基準ではなく、家族や周囲に頼る選択を残すゲーム仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["直接ケアの選択条件"]
    },
    {
      id: "family.parentCareNeedInfectedThreshold",
      label: "感染している親の手助けを検討する健康値",
      value: 44,
      unit: "0–100点",
      status: "S",
      scope: "家族・ケア",
      description:
        "感染状態と一般健康値を合わせてケア相談を検討するための抽象条件。鉱石病の病期や予後ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_FAMILY"],
      usedBy: ["親族のケアイベント"]
    },
    {
      id: "family.parentCareReviewWindowYears",
      label: "親族ケア終了後の再相談期間",
      value: 3,
      unit: "年",
      status: "S",
      scope: "家族・ケア",
      description:
        "二年間のケア期間終了後、親にまだ継続的な手助けが必要な場合に再相談を提示する期限。家族の実際の再交渉間隔の統計ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["親族ケア再相談イベント"]
    },
    {
      id: "family.parentCareDirectAnnualCost",
      label: "親を直接支える年間追加費用",
      value: 180000,
      unit: "龍門幣相当/年",
      status: "S",
      scope: "家族・家計",
      description: "通院・身の回りの用事を本人が主に担う場合の抽象追加費用。薬価・公定介護費ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["親族介護の年次家計"]
    },
    {
      id: "family.siblingCareFinancialKnowledgeYears",
      label: "きょうだい家計の把握を有効とみなす年数",
      value: 4,
      unit: "年",
      status: "S",
      scope: "家族・家計",
      description:
        "療養費を分ける選択肢の表示に、別居成人きょうだいの家計状態を本人が把握した記録を使う期限。家族の連絡間隔や支払能力の統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["家族ケアの療養費分担選択"]
    },
    {
      id: "family.siblingCarePaymentReserveShare",
      label: "きょうだいの療養費分担後に残す生活準備金",
      value: 0.15,
      unit: "推定年間生活費比",
      status: "S",
      scope: "家族・家計",
      description:
        "家計が安定しているきょうだいでも、生活費見込みの一定分を手元に残し、その範囲を超える分だけ療養費を直接支払うゲーム上の安全余裕。実際の貯蓄統計や支払意思ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["きょうだいの親療養費分担"]
    },
    {
      id: "family.parentCareSharedAnnualCost",
      label: "きょうだいとケアを分担する年間追加費用",
      value: 90000,
      unit: "龍門幣相当/年",
      status: "S",
      scope: "家族・家計",
      description: "きょうだいと用事を分ける際の移動・連絡などをまとめた抽象追加費用。実費統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["親族介護の年次家計"]
    },
    {
      id: "family.parentCareNetworkAnnualCost",
      label: "親族・近隣とケアを組む年間追加費用",
      value: 150000,
      unit: "龍門幣相当/年",
      status: "S",
      scope: "家族・家計",
      description:
        "訪問や用事を親族・近隣と調整する場合の移動・連絡費をまとめた抽象値。地域の公的支援制度や実費統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["親族介護の年次家計"]
    },
    {
      id: "family.parentTreatmentDirectShare",
      label: "親の療養費を本人が直接支える割合",
      value: 1,
      unit: "本人負担割合",
      status: "S",
      scope: "家族・鉱石病",
      description:
        "本人中心で親を支える場合に、親の推定療養費から本人の家計へ計上する割合。家族の実際の負担分担を示す統計ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_ORIPATHY_SOCIAL"],
      usedBy: ["成人後の親療養費支援"]
    },
    {
      id: "family.parentTreatmentSharedShare",
      label: "きょうだい分担時の親療養費負担割合",
      value: 0.5,
      unit: "本人負担割合",
      status: "S",
      scope: "家族・鉱石病",
      description:
        "きょうだいと通院や費用を分けるときの本人側の推定負担割合。家族人数や実際の送金を示す統計ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_ORIPATHY_SOCIAL"],
      usedBy: ["成人後の親療養費支援"]
    },
    {
      id: "family.parentTreatmentNetworkShare",
      label: "親族・近隣と組む際の親療養費負担割合",
      value: 0.3,
      unit: "本人負担割合",
      status: "S",
      scope: "家族・鉱石病",
      description:
        "親族・近隣と支援を調整する間に本人が負担する推定割合。地域の公的支援や実際の分担統計を意味しないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_ORIPATHY_SOCIAL"],
      usedBy: ["成人後の親療養費支援"]
    },
    {
      id: "family.parentCareDirectIncomeScale",
      label: "直接ケア中の本人賃金係数",
      value: 0.75,
      unit: "通常賃金比",
      status: "S",
      scope: "家族・家計",
      description: "仕事時間を調整してケアを担う場合のゲーム上の賃金係数。労働制度や所得統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["親族介護の本人賃金"]
    },
    {
      id: "family.parentCareSharedIncomeScale",
      label: "きょうだいと分担する場合の本人賃金係数",
      value: 0.9,
      unit: "通常賃金比",
      status: "S",
      scope: "家族・家計",
      description: "ケアを分担して仕事の調整を小さくする場合のゲーム上の賃金係数。家族構成の統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["親族介護の本人賃金"]
    },
    {
      id: "family.parentCareNetworkIncomeScale",
      label: "親族・近隣とケアを組む場合の本人賃金係数",
      value: 1,
      unit: "通常賃金比",
      status: "S",
      scope: "家族・家計",
      description:
        "訪問予定などを分担し、仕事を続ける場合のゲーム上の賃金係数。支援者の常時確保を意味しない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["親族介護の本人賃金"]
    },
    {
      id: "family.siblingHealthAgeStart",
      label: "別居きょうだいの加齢負担開始年齢",
      value: 45,
      unit: "歳",
      status: "S",
      scope: "家族・健康",
      description: "健康状態に年齢由来の低下を加え始める抽象境界。医学上の閾値ではない。",
      source: "ゲーム用仮定",
      usedBy: ["別居きょうだいの健康更新"]
    },
    {
      id: "family.siblingHealthAgeScale",
      label: "別居きょうだいの加齢健康係数",
      value: 0.018,
      unit: "健康点/年齢差・年",
      status: "S",
      scope: "家族・健康",
      description: "加齢負担開始年齢からの年齢差に掛ける健康低下係数。寿命・疾患の医学統計を示さない。",
      source: "ゲーム用仮定",
      usedBy: ["別居きょうだいの健康更新"]
    },
    {
      id: "family.siblingHealthInfectionDrift",
      label: "別居きょうだいの感染による健康負担",
      value: 0.35,
      unit: "健康点/年",
      status: "S",
      scope: "家族・健康",
      description: "感染状態を一般健康へ反映する年次負担。鉱石病の進行度や生存率ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_ORIPATHY_SOCIAL"],
      usedBy: ["別居きょうだいの健康更新"]
    },
    {
      id: "family.siblingHealthHazardJobDrift",
      label: "危険職の別居きょうだいの健康負担",
      value: 0.28,
      unit: "健康点/年",
      status: "S",
      scope: "家族・健康",
      description: "採掘・工場・傭兵の生業に置く年次負担。各職の労災統計ではなく限定NPCのゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE", "SRC_INDUSTRIAL_LIFE"],
      usedBy: ["別居きょうだいの健康更新"]
    },
    {
      id: "family.siblingHealthRecovery",
      label: "別居きょうだいの基礎健康回復",
      value: 0.12,
      unit: "健康点/年",
      status: "S",
      scope: "家族・健康",
      description: "生活が安定している場合の小さな基礎回復。医療の効果や治癒率ではない。",
      source: "ゲーム用仮定",
      usedBy: ["別居きょうだいの健康更新"]
    },
    {
      id: "family.siblingHealthSupportRecovery",
      label: "療養費支援による健康維持補正",
      value: 0.35,
      unit: "健康点/年",
      status: "S",
      scope: "家族・健康",
      description: "年次の療養費支援がある場合に健康維持へ加える抽象補正。治療効果を保証しない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_ORIPATHY_SOCIAL"],
      usedBy: ["別居きょうだいの健康更新"]
    },
    {
      id: "family.siblingHealthRandomDrift",
      label: "別居きょうだいの健康変動幅",
      value: 0.3,
      unit: "健康点/年",
      status: "S",
      scope: "家族・健康",
      description: "個人差を表す年次の小さな無作為変動幅。疾病発症率ではない。",
      source: "ゲーム用仮定",
      usedBy: ["別居きょうだいの健康更新"]
    },
    {
      id: "family.siblingHealthConcernThreshold",
      label: "体調を案じる連絡の判定値",
      value: 42,
      unit: "0–100点",
      status: "S",
      scope: "家族・健康",
      description: "本人と普段連絡を取る別居きょうだいの体調低下を話題にするゲーム上の境界値。",
      source: "ゲーム用仮定",
      usedBy: ["近況連絡イベント"]
    },
    {
      id: "family.siblingHealthAidCost",
      label: "きょうだいの一時的な医療・移動援助額",
      value: 50000,
      unit: "龍門幣相当",
      status: "S",
      scope: "家族・家計",
      description: "体調を案じるきょうだいへ、診療・移動のため一度だけ渡す額。公式の診療価格ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["近況連絡イベント"]
    },
    {
      id: "family.siblingFinanceStrainReserveShare",
      label: "別居きょうだいの家計逼迫判定予備率",
      value: 0.5,
      unit: "年間生活費比",
      status: "S",
      scope: "家族・家計",
      description:
        "貯蓄が推定年間生活費の半分を下回るか負債がある場合に、家計を案じる状態とするゲーム用境界。貧困線や地域統計を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["別居きょうだいの限定的な年次家計"]
    },
    {
      id: "family.siblingIndependenceOpeningReserve",
      label: "きょうだいの独立準備金",
      value: 20000,
      unit: "龍門幣相当",
      status: "S",
      scope: "家族・家計",
      description:
        "別居準備に出す4万龍門幣相当のうち、本人の手元に残す開始時資金。残額は移動・住居準備に使う抽象費用。世帯資産・実際の引越し価格を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["別居きょうだいの初年度家計"]
    },
    {
      id: "family.siblingFamilyReviewMinYears",
      label: "別居きょうだいの家族形成見直し最短間隔",
      value: 3,
      unit: "年",
      status: "S",
      scope: "家族・関係",
      description:
        "別居後の家族形成状態を抽象更新する確認間隔の下限。婚姻年齢や家族形成頻度の統計ではなく、特定の家族像を必然化しないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいの家族形成"]
    },
    {
      id: "family.siblingFamilyReviewMaxYears",
      label: "別居きょうだいの家族形成見直し最長間隔",
      value: 6,
      unit: "年",
      status: "S",
      scope: "家族・関係",
      description:
        "別居後の家族形成状態を抽象更新する確認間隔の上限。婚姻制度や出生率の地域統計を表さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいの家族形成"]
    },
    {
      id: "family.siblingPartnerMinAge",
      label: "別居きょうだいの同居相手形成判定開始年齢",
      value: 20,
      unit: "歳",
      status: "S",
      scope: "家族・関係",
      description:
        "家族形成の抽象判定を始める年齢境界。テラ共通の婚姻可能年齢ではなく、関係形成を確定しないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいの家族形成"]
    },
    {
      id: "family.siblingPartnerMaxAge",
      label: "別居きょうだいの同居相手形成判定終了年齢",
      value: 55,
      unit: "歳",
      status: "S",
      scope: "家族・関係",
      description: "抽象的な新規同居関係の判定を止める年齢境界。婚姻・恋愛の上限年齢を示す設定ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいの家族形成"]
    },
    {
      id: "family.siblingPartnerFormationChance",
      label: "家族形成見直し時の同居相手形成抽象確率",
      value: 0.12,
      unit: "見直し一回あたりの確率",
      status: "S",
      scope: "家族・関係",
      description:
        "独立したきょうだいが複数の関係形態の一例として同居相手を持つ抽象確率。婚姻率や恋愛規範を表さず、縁談・非婚・同性関係・単身生活などを網羅しない暫定モデル。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいの家族形成"]
    },
    {
      id: "family.siblingChildArrivalMaxAge",
      label: "別居きょうだいが子を迎える判定終了年齢",
      value: 45,
      unit: "歳",
      status: "S",
      scope: "家族・関係",
      description:
        "既に同居相手がいる場合の子を迎える抽象判定を止める年齢境界。生物学的・養子縁組上の上限を示す設定ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいの家族形成"]
    },
    {
      id: "family.siblingChildJoinChance",
      label: "家族形成見直し時の子の参加抽象確率",
      value: 0.12,
      unit: "見直し一回あたりの確率",
      status: "S",
      scope: "家族・関係",
      description:
        "同居相手がいるきょうだいが子を迎える抽象確率。出生率ではなく、養子・後見・氏族養育等を含む制度値でもない暫定仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいの家族形成"]
    },
    {
      id: "family.siblingChildrenMax",
      label: "別居きょうだいの追跡する子の上限",
      value: 3,
      unit: "人",
      status: "S",
      scope: "家族・関係",
      description:
        "処理量を抑えて近しいNPCの子を追うためのシミュレーション上限。家族規模や出生数の統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいの家族形成"]
    },
    {
      id: "family.siblingPartnerIncomeShare",
      label: "別居きょうだいの同居相手所得反映率",
      value: 0.55,
      unit: "相手の推定給金に対する比率",
      status: "S",
      scope: "家族・家計",
      description:
        "記録した相手の生業給金の一部を共有家計へ反映する暫定係数。就労率、賃金、共有口座、家事労働の統計値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["別居きょうだいの年次家計"]
    },
    {
      id: "family.siblingPartnerExpenseShare",
      label: "同居相手による世帯追加費用率",
      value: 0.62,
      unit: "基礎生活費比",
      status: "S",
      scope: "家族・家計",
      description:
        "同居相手が加わる際の生活費増分。住宅共有等で一人分より小さいと仮定したゲーム用係数で、実際の家計統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["別居きょうだいの年次家計"]
    },
    {
      id: "family.siblingChildExpenseShare",
      label: "子一人による世帯追加費用率",
      value: 0.38,
      unit: "基礎生活費比/人",
      status: "S",
      scope: "家族・家計",
      description:
        "子一人あたりの養育・食費等を一人分の基礎生活費に対する割合で表す暫定係数。地域別学費・医療費・扶養費の統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["別居きょうだいの年次家計"]
    },
    {
      id: "family.siblingMoveReviewMinYears",
      label: "別居きょうだいの転居見直し最短間隔",
      value: 4,
      unit: "年",
      status: "S",
      scope: "家族・移動",
      description:
        "別居したきょうだいの居住地域を節目に再確認する最短間隔。人口移動統計ではなくゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ENVIRONMENT", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["別居きょうだいの限定的な居住更新"]
    },
    {
      id: "family.siblingMoveReviewMaxYears",
      label: "別居きょうだいの転居見直し最長間隔",
      value: 8,
      unit: "年",
      status: "S",
      scope: "家族・移動",
      description:
        "既存の移動経路を使って別居きょうだいの居住を再検討する上限。転居を保証せず、正史や人口統計を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ENVIRONMENT", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["別居きょうだいの限定的な居住更新"]
    },
    {
      id: "family.siblingMoveChance",
      label: "転居見直し時に別地域へ移る抽象確率",
      value: 0.12,
      unit: "確率",
      status: "S",
      scope: "家族・移動",
      description:
        "別居したきょうだいが仕事・親族・暮らしの縁で移動経路上の別地域へ移るゲーム用確率。地域差や実際の移住統計を表す値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ENVIRONMENT", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["別居きょうだいの限定的な居住更新"]
    },
    {
      id: "family.careNetworkMoveReviewMinYears",
      label: "養育ネットワークの転居再検討最短間隔",
      value: 4,
      unit: "年",
      status: "S",
      scope: "家族・移動",
      description:
        "家計分離後、支援ネットワークの居住状況を見直す最短間隔。正史の移住周期や人口統計を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ENVIRONMENT", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["養育ネットワークの限定的な転居"]
    }
  ];
});
