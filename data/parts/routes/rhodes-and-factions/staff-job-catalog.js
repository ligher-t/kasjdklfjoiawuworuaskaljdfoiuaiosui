// routes/rhodes-and-factions/staff-job-catalog: append after arena-work to retain established career indices.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/staff-job-catalog"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  for (const key of ["transporter", "reserve"]) {
    if ($terraData.J.length !== $terraData.SR_JOBS[key])
      throw new Error(`ロドス職種の登録順が不正です: ${key}`);
    $terraData.J.push({ ...$terraData.SR_JOB_CATALOG[key] });
  }
});
