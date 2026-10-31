// model/sources/context-and-access: construction fragment; evaluation order is declared by data/model/sources.js.
window.TERRA_DATA_BUILD.fragment(
  "model/sources",
  "model/sources/context-and-access"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $terraData.SIM_PARAMS.push(
    {
      id: "context.parentJobs",
      label: "親の職業分布",
      value: $terraData.SIM_TABLES.parentJobs,
      valueType: "table",
      unit: "抽選重み・職業ID",
      status: "S",
      scope: "家族・生業",
      description: "親の職業を生成する相対重み。出生時の選択肢を集約したゲーム仮定。",
      source: "ゲーム用仮定",
      usedBy: ["人物生成"]
    },
    {
      id: "context.careTypes",
      label: "養育形態分布",
      value: $terraData.SIM_TABLES.care,
      valueType: "table",
      unit: "抽選重み・0〜1係数・龍門幣",
      status: "S",
      scope: "養育・家計",
      description:
        "養育形態、支援ネットワークの種類・役割、家計負担の抽選テーブル。法的後見権や実世帯の組織形態を表す公式分類ではない。",
      source: "ゲーム用仮定",
      usedBy: ["人物生成", "年次ケア計算"]
    },
    {
      id: "context.mobileLocalities",
      label: "移動都市の居住環境分布",
      value: $terraData.SIM_TABLES.locality.mobile,
      valueType: "table",
      unit: "抽選重み・0〜1係数",
      status: "S",
      scope: "居住・情報・危険",
      description: "移動都市内の居住環境テーブル。",
      source: "ゲーム用仮定",
      usedBy: ["人物生成", "年次生活計算"]
    },
    {
      id: "context.fixedLocalities",
      label: "固定居住地の居住環境分布",
      value: $terraData.SIM_TABLES.locality.fixed,
      valueType: "table",
      unit: "抽選重み・0〜1係数",
      status: "S",
      scope: "居住・情報・危険",
      description: "固定居住地の居住環境テーブル。",
      source: "ゲーム用仮定",
      usedBy: ["人物生成", "年次生活計算"]
    }
  );

  Object.entries($terraData.SIM_TABLES.environments).forEach(([region, rows]) =>
    $terraData.SIM_PARAMS.push({
      id: "context.environment." + region,
      label: region + "の周辺地勢抽選",
      value: rows,
      valueType: "table",
      unit: "相対重み",
      status: "S",
      scope: "地勢・居住",
      description:
        "提供資料の地域内の差を抽象化したゲーム上の居住抽選。面積比・人口比ではない。移動都市の移動経路や地勢切替率も再現値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_REGIONAL_ENVIRONMENT", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["人物生成", "転居", "移動都市の年次地勢遷移"]
    })
  );

  $terraData.SIM_PARAMS.push({
    id: "locality.victoriaCapitalShare",
    label: "ヴィクトリアの王都居住抽選率",
    value: 0.12,
    unit: "確率",
    status: "S",
    scope: "居住都市",
    description:
      "ヴィクトリアの移動都市居住者のうち、ロンディニウムの住民として生成する抽象抽選。人口比ではなく、占領地を国全域へ広げないためのゲーム仮定。",
    source: "ゲーム用仮定",
    references: ["SRC_TL_EARLY", "SRC_TL_LATE"],
    usedBy: ["人物生成", "転居"]
  });

  $terraData.SIM_PARAMS.push({
    id: "locality.ursusChernobogShare",
    label: "ウルサス移動都市のチェルノボーグ抽選",
    value: 0.1,
    unit: "条件付き確率",
    status: "S",
    scope: "居住都市",
    description: "出生・転居時の都市割当てのためのゲーム仮定。公式の都市人口比ではない。",
    source: "ゲーム用仮定",
    usedBy: ["出生・居住地生成", "局地歴史イベントの適用範囲"]
  });

  $terraData.SIM_PARAMS.push({
    id: "locality.ursusCapitalConditionalShare",
    label: "チェルノボーグ以外のウルサス移動都市における首都抽選",
    value: 0.06,
    unit: "条件付き確率",
    status: "S",
    scope: "居住都市",
    description: "サンクト・グリファーブルクに住む可能性を表す仮置き。公式人口比ではない。",
    source: "ゲーム用仮定",
    usedBy: ["出生・居住地生成", "首都への接触条件"]
  });

  for (const [id, label, value, references, description] of [
    [
      "locality.ursusZelgradConditionalShare",
      "チェルノボーグ以外のウルサス移動都市におけるゼルグラード抽選",
      0.03,
      ["SRC_URSUS_ZELGRAD_CITY", "SRC_URSUS_EP17_ZELGRAD_TRANSFER"],
      "作中報告と後続章から同定した衛星都市を、ごく一部へ割り当てるゲーム仮定。1100年初頭は低確度の最早候補で、公式の都市人口比ではない。"
    ],
    [
      "locality.lungmenNamedCityShare",
      "龍門地域の移動都市居住者を龍門市内として記録する割合",
      0.78,
      ["SRC_LUNGMEN_AUTONOMY"],
      "龍門地域の全住民や人口比ではなく、名のある市内街区と都市周辺の居住地を分けるゲーム仮定。"
    ],
    [
      "locality.bolivarNamedCityShare",
      "ボリバルの移動都市居住者を当時の固有都市名で記録する割合",
      0.1,
      ["SRC_BOLIVAR_DOSSOLES_STORY", "SRC_COMMUNITY_DOSSOLES_HISTORY"],
      "1007〜1085年はエル・ソル、1086年以降はドッソレスとして、一部の移動都市居住者に割り当てるゲーム仮定。都市の人口比ではない。"
    ],
    [
      "locality.siestaCityShare",
      "移動都市化後のシエスタ市内居住抽選",
      0.3,
      ["SRC_SIESTA_TRANSITION", "SRC_SIESTA_TOURISM", "SRC_COMMUNITY_SIESTA_VOLCANIC_ACTIVITY"],
      "移動都市への移住計画が始まる1097年夏以降の候補。出生月が未記録の1097年出生には付けず、8月以降の移転または1098年以降の出生でのみ割り当てるゲーム近似。人口比ではない。"
    ]
  ])
    $terraData.SIM_PARAMS.push({
      id,
      label,
      value,
      unit: "条件付き確率",
      status: "S",
      scope: "居住都市",
      description,
      source: "ゲーム用仮定",
      references,
      usedBy: ["出生・居住地生成", "都市別イベント条件"]
    });

  $terraData.SIM_PARAMS.push({
    id: "law.lateranoBirthRecordShare",
    label: "ラテラーノ出生時の市民記録抽選率",
    value: 0.8,
    unit: "確率",
    status: "S",
    scope: "法的資格",
    description:
      "ラテラーノ出身者の市民資格を出生地から自動確定せず、出生記録がある人物を生成するゲーム上の抽象抽選。資格人口比や公式の出生登録制度を表す数値ではない。資料に個別資格の判定方法がないため、未確認状態も残す。",
    source: "ゲーム用仮定",
    references: ["SRC_LATERANO_CIVIC"],
    usedBy: ["人物生成", "ラテラーノ市民向け制度イベント"]
  });

  $terraData.SIM_PARAMS.push(
    {
      id: "infection.careAccessBase",
      label: "診療到達度の基礎値",
      value: 0.18,
      unit: "0–1",
      status: "S",
      scope: "鉱石病・医療アクセス",
      description: "居住地の診療アクセス値を感染症の通院到達度へ換算する基礎値。地域別の医療網統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_MOBILE_CITY_MOBILITY", "SRC_REGIONAL_ENVIRONMENT"],
      usedBy: ["診療到達度", "感染者家計"]
    },
    {
      id: "infection.localityCareAccessScale",
      label: "居住地アクセスの通院換算係数",
      value: 0.72,
      unit: "倍率",
      status: "S",
      scope: "鉱石病・医療アクセス",
      description:
        "移動都市の区画・集落・辺境ごとの既存access値を通院到達度へ換算する。access値自体もゲーム用分布。",
      source: "ゲーム用仮定",
      references: ["SRC_MOBILE_CITY_MOBILITY", "SRC_REGIONAL_ENVIRONMENT"],
      usedBy: ["診療到達度"]
    },
    {
      id: "infection.remoteCareAccessPenalty",
      label: "辺境・小規模居住地の通院補正",
      value: 0.08,
      unit: "0–1",
      status: "S",
      scope: "鉱石病・医療アクセス",
      description: "辺境や小規模居住地の移動負担を表す追加補正。資料に数値はない。",
      source: "ゲーム用仮定",
      references: ["SRC_REGIONAL_ENVIRONMENT"],
      usedBy: ["診療到達度"]
    },
    {
      id: "infection.hazardCareAccessPenalty",
      label: "高危険居住地の通院補正",
      value: 0.05,
      unit: "0–1",
      status: "S",
      scope: "鉱石病・医療アクセス",
      description: "高い危険度が診療先への移動を難しくする抽象補正。資料に数値はない。",
      source: "ゲーム用仮定",
      references: ["SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["診療到達度"]
    },
    {
      id: "infection.warCareAccessPenalty",
      label: "戦乱地域の通院補正",
      value: 0.08,
      unit: "0–1",
      status: "S",
      scope: "鉱石病・医療アクセス",
      description: "戦乱状況が移動を妨げる抽象補正。資料に医療供給や係数の定量値はない。",
      source: "ゲーム用仮定",
      references: ["SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["診療到達度"]
    },
    {
      id: "infection.careAccessHighThreshold",
      label: "診療先へ通いやすい判定値",
      value: 0.62,
      unit: "0–1",
      status: "S",
      scope: "鉱石病・イベント条件",
      description: "居住地の到達度から通院イベントの選択肢を分けるゲーム用境界値。",
      source: "ゲーム用仮定",
      usedBy: ["状態タグ", "家族の鉱石病イベント"]
    },
    {
      id: "infection.careAccessLowThreshold",
      label: "診療先が遠い判定値",
      value: 0.34,
      unit: "0–1",
      status: "S",
      scope: "鉱石病・イベント条件",
      description: "居住地の到達度から巡回診療・付き添い探しの選択肢を分けるゲーム用境界値。",
      source: "ゲーム用仮定",
      usedBy: ["状態タグ", "家族の鉱石病イベント"]
    },
    {
      id: "infection.victoriaIndustrialWorkPressure",
      label: "ヴィクトリア工業地域の感染者雇用圧力補正",
      value: 0.08,
      unit: "0–1",
      status: "S",
      scope: "鉱石病・地域差",
      description:
        "二次整理が記す工業汚染・隔離政策の二重負担を、感染者の雇用上の圧力へ弱く反映するゲーム用仮定。ヴィクトリアの工業・採掘居住地だけに適用し、企業規則・法令・実測値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_VICTORIA_INFECTED", "SRC_TERRA_INDUSTRY_POLICY"],
      usedBy: ["感染者への雇用圧力", "雇用差別による収入補正"]
    },
    {
      id: "infection.victoriaIndustrialHousingPressure",
      label: "ヴィクトリア工業地域の感染者住居圧力補正",
      value: 0.05,
      unit: "0–1",
      status: "S",
      scope: "鉱石病・地域差",
      description:
        "工業・採掘居住地での感染者の住居上の不利益を表す抽象補正。地域の隔離政策を特定の法律・全住民一律の措置として再現しない。",
      source: "ゲーム用仮定",
      references: ["SRC_VICTORIA_INFECTED"],
      usedBy: ["感染者の住居圧力", "地域文脈の選択条件"]
    },
    {
      id: "infection.victoriaIndustrialDisclosurePressure",
      label: "ヴィクトリア工業地域の感染者開示圧力補正",
      value: 0.08,
      unit: "0–1",
      status: "S",
      scope: "鉱石病・地域差",
      description:
        "工業・採掘居住地で感染を開示する社会的負担を表す抽象補正。個人の隠蔽率や開示義務の公式値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_VICTORIA_INFECTED", "SRC_TERRA_INDUSTRY_POLICY"],
      usedBy: ["感染開示の選択条件"]
    },
    {
      id: "infection.socialPressureHighThreshold",
      label: "感染者への地域圧力が強い判定値",
      value: 0.68,
      unit: "0–1",
      status: "S",
      scope: "鉱石病・イベント条件",
      description:
        "地域別の世間・雇用・住居・医療圧力のゲーム用係数を強い圧力として扱う境界値。地域の実測値・公式基準ではない。",
      source: "ゲーム用仮定",
      usedBy: ["状態タグ", "住居差別イベント"]
    },
    {
      id: "infection.socialPressureLowThreshold",
      label: "感染者への地域圧力が比較的弱い判定値",
      value: 0.34,
      unit: "0–1",
      status: "S",
      scope: "鉱石病・イベント条件",
      description:
        "地域別の圧力係数を比較的弱いものとして扱うゲーム用境界値。地域の実測値・公式基準ではない。",
      source: "ゲーム用仮定",
      usedBy: ["状態タグ"]
    },
    {
      id: "economy.infectionCareTravelCostScale",
      label: "通院アクセス不足の年間費用補正",
      value: 0.18,
      unit: "倍率",
      status: "S",
      scope: "鉱石病・家計",
      description:
        "診療先へ通いにくい場合の追加移動負担。本人・配偶者・子・きょうだいの療養費に適用するゲーム用仮定で、治療費の公定額ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_MOBILE_CITY_MOBILITY", "SRC_REGIONAL_ENVIRONMENT"],
      usedBy: ["本人資産更新", "家族療養費", "きょうだい支援"]
    }
  );

  $terraData.SIM_PARAMS.push({
    id: "economy.maxJobPayBonus",
    label: "勤め先の賃金改善上限",
    value: 0.25,
    unit: "基準給金への加算率",
    status: "S",
    scope: "生業・家計",
    description:
      "同じ仕事に在籍する間の賃金改善を最大25%まで蓄積する。職業の変更・退職・収容等で解除する。公式の賃金率ではない。",
    source: "ゲーム用仮定",
    usedBy: ["イベント結果", "本人の年収"]
  });
});
