// model/sources/family-and-economy-events-05: construction fragment; evaluation order is declared by data/model/sources.js.
window.TERRA_DATA_BUILD.fragment(
  "model/sources",
  "model/sources/family-and-economy-events-05"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  return [
    {
      id: "economy.columbiaInsuranceAnnualCost",
      label: "クルビアの保険更新費",
      value: 400000,
      unit: "龍門幣/年",
      status: "S",
      scope: "医療・家計",
      description:
        "加入後の年度更新に必要な抽象保険料。地域物価を反映し、生活費後の資金で払えなければ失効する。公式価格ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_COLUMBIA_INSURANCE"],
      usedBy: ["本人資産更新", "保険加入表示"]
    },
    {
      id: "economy.columbiaInsuranceTreatmentCostScale",
      label: "保険加入中の治療費自己負担率",
      value: 0.2,
      unit: "倍率",
      status: "S",
      scope: "医療・家計",
      description:
        "年度更新できた加入者の鉱石病治療費の自己負担を2割とする抽象的な保障。公式の給付率ではない。失効年は全額負担。",
      source: "ゲーム用仮定",
      references: ["SRC_COLUMBIA_INSURANCE"],
      usedBy: ["本人資産更新", "保険加入表示"]
    },
    {
      id: "economy.detainedPersonalAnnualCost",
      label: "収容中の身の回りの費用",
      value: 30000,
      unit: "龍門幣/年",
      status: "S",
      scope: "収容・家計",
      description:
        "日用品・連絡等の本人負担をまとめた抽象費用。通常の外部職の給金は停止する。施設の公式料金ではない。",
      source: "ゲーム用仮定",
      usedBy: ["本人資産更新"]
    },
    {
      id: "economy.segregationLivingAnnualCost",
      label: "隔離区画の基礎生活費",
      value: 200000,
      unit: "龍門幣/年",
      status: "S",
      scope: "隔離・家計",
      description:
        "配給や住居の支援を仮定した区画内の基礎負担。医療・子の扶養等は別計上する。全国共通の制度ではない。",
      source: "ゲーム用仮定",
      usedBy: ["本人資産更新"]
    },
    {
      id: "economy.segregationWorkAnnualPay",
      label: "隔離区画内の仕事の収入",
      value: 300000,
      unit: "龍門幣/年",
      status: "S",
      scope: "隔離・生業",
      description: "区画内の仕事を得た後の抽象年収。地域物価を反映する。職種別の公式賃金ではない。",
      source: "ゲーム用仮定",
      usedBy: ["本人資産更新"]
    },
    {
      id: "economy.hobbyMoodBenefit",
      label: "趣味継続の幸福補正",
      value: 0.6,
      unit: "幸福点/年",
      status: "S",
      scope: "幸福",
      description: "趣味を続けることによる小さな年次補正。",
      source: "ゲーム用仮定",
      usedBy: ["年次幸福"]
    },
    {
      id: "economy.workshopShareAnnualGrowth",
      label: "地域共同事業持分の年次評価補正",
      value: 0.03,
      unit: "倍率/年",
      status: "S",
      scope: "長期投資",
      description:
        "地域の共同事業・小規模企業の持分評価額に毎年適用する成長仮定。配当や公式投資収益率を示す値ではない。",
      source: "ゲーム用仮定",
      usedBy: ["年次投資評価"]
    },
    {
      id: "economy.workshopShareAnnualVolatility",
      label: "地域共同事業持分の年次変動幅",
      value: 0.08,
      unit: "倍率/年",
      status: "S",
      scope: "長期投資",
      description:
        "地域共同事業持分の基準成長補正に毎年加える一様な変動幅。評価損益の幅は資料にないゲーム用仮定。",
      source: "ゲーム用仮定",
      usedBy: ["年次投資評価", "本人の投資表示"]
    },
    {
      id: "economy.spouseInfectionCareAnnualCost",
      label: "配偶者の鉱石病ケア費",
      value: 260000,
      unit: "龍門幣/年",
      status: "S",
      scope: "家計・鉱石病",
      description:
        "治療継続を記録した配偶者の通院・薬・移動等をまとめた抽象的な追加家計費。地域物価と医療アクセスを反映し、テラ各地の公式価格や治療効果を示さない。未治療・治療状態未記録の配偶者には計上しない。",
      source: "ゲーム用仮定",
      usedBy: ["継続療養中の配偶者がいる家計"]
    }
  ];
});
