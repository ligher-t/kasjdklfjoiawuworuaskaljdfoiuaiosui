// routes/rhodes-and-factions/staff-routes: construction fragment; evaluation order is declared by data/routes/rhodes-and-factions.js.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/staff-routes"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $terraData.EV.push(
    ...$parts("routes/rhodes-and-factions/staff-routes-events-01"),
    ...$parts("routes/rhodes-and-factions/staff-routes-events-02"),
    ...$parts("routes/rhodes-and-factions/staff-routes-events-03"),
    ...$parts("routes/rhodes-and-factions/staff-routes-events-04"),
    ...$parts("routes/rhodes-and-factions/staff-routes-events-05")
  );
});
