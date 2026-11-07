// model/sources/references: construction fragment; evaluation order is declared by data/model/sources.js.
window.TERRA_DATA_BUILD.fragment(
  "model/sources",
  "model/sources/references"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $define(
    "SETTING_SOURCES",
    {
      ...$parts("model/sources/references-entries-01"),
      ...$parts("model/sources/references-entries-02"),
      ...$parts("model/sources/references-entries-03"),
      ...$parts("model/sources/references-entries-04")
    },
    false
  );
});
