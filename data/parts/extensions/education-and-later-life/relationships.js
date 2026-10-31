// extensions/education-and-later-life/relationships: construction fragment; evaluation order is declared by data/extensions/education-and-later-life.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/education-and-later-life",
  "extensions/education-and-later-life/relationships"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $terraData.EV.push(
    ...$parts("extensions/education-and-later-life/relationships-events-01"),
    ...$parts("extensions/education-and-later-life/relationships-events-02"),
    ...$parts("extensions/education-and-later-life/relationships-events-03")
  );
});
