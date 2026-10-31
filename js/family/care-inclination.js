function repairCareInclination(s) {
  s.careInclination = Number.isFinite(s.careInclination) ? clamp(s.careInclination, 0, 100) : 50;
  if (!Array.isArray(s.careInclinationHistory)) s.careInclinationHistory = [];
  else
    s.careInclinationHistory = s.careInclinationHistory
      .filter(
        row =>
          Number.isInteger(row.year) &&
          Number.isFinite(row.before) &&
          Number.isFinite(row.after) &&
          typeof row.choice === "string"
      )
      .slice(-40);
  return s;
}
