// model/sources/mechanic-parameters: construction fragment; evaluation order is declared by data/model/sources.js.
window.TERRA_DATA_BUILD.fragment(
  "model/sources",
  "model/sources/mechanic-parameters"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $define(
    "mechanicRows",
    [
      ...$parts("model/sources/mechanic-parameters-rows-01"),
      ...$parts("model/sources/mechanic-parameters-rows-02")
    ],
    false
  );

  $terraData.SIM_PARAMS.push(
    ...$terraData.mechanicRows.map(([id, label, value, unit, scope, description, used, references]) => ({
      id,
      label,
      value,
      unit,
      status: "S",
      scope,
      description,
      source: "ゲーム用仮定",
      ...(references?.length ? { references } : {}),
      usedBy: [used]
    }))
  );
});
