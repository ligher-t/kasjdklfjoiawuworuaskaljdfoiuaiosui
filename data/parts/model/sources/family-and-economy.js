// model/sources/family-and-economy: construction fragment; evaluation order is declared by data/model/sources.js.
window.TERRA_DATA_BUILD.fragment(
  "model/sources",
  "model/sources/family-and-economy"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $terraData.SIM_PARAMS.push({
    id: "education.levelThresholds",
    label: "教育段階の到達境界",
    value: [0, 8, 25, 55, 85],
    valueType: "thresholds",
    unit: "教育点（段階境界）",
    status: "S",
    scope: "教育",
    description: "未就学から専門・研究までの学歴段階に到達する教育進捗の境界値。",
    source: "ゲーム用仮定",
    usedBy: ["学歴判定", "イベント条件", "人物表示"]
  });

  $terraData.SIM_PARAMS.push(
    ...$parts("model/sources/family-and-economy-events-01"),
    ...$parts("model/sources/family-and-economy-events-02"),
    ...$parts("model/sources/family-and-economy-events-03"),
    ...$parts("model/sources/family-and-economy-events-04"),
    ...$parts("model/sources/family-and-economy-events-05")
  );
});
