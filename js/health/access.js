// Physical capacity is distinct from life remaining and from social exclusion.
const personalWorkCapacity = s => s.h <= 5 ? 0.35 : s.h <= 15 ? 0.55 : s.h <= 30 ? 0.8 : 1;
const assistedTravelScale = s => s.h <= 15 ? 1.3 : s.h <= 30 ? 1.15 : 1;
/* 社会的圧力とは別の、地勢・移動・周辺状況から見た診療への到達しやすさ。
   数値は公式の医療網データではなく、居住地の access を生活上の通院負担へ写すゲーム仮定。 */
const infectionCareAccess = s => {
  const locality = clamp(Number.isFinite(s.local?.access) ? s.local.access : 0.45, 0, 1),
    remote =
      s.local?.kind?.includes("辺境") || s.local?.kind?.includes("小規模")
        ? P("infection.remoteCareAccessPenalty")
        : 0,
    hazard = s.local?.hazard >= P("health.hazardThreshold") ? P("infection.hazardCareAccessPenalty") : 0,
    war =
      s.res.war >= P("condition.warRegionScale") ||
      worldPressure(s, "war") > P("condition.activeWorldPressureScale")
        ? P("infection.warCareAccessPenalty")
        : 0;
  return clamp(
    P("infection.careAccessBase") +
      locality * P("infection.localityCareAccessScale") -
      remote -
      hazard -
      war -
      localityMedicalPenalty(s),
    0,
    1
  );
};
const infectionCareTravelCostScale = s =>
  (1 + (1 - infectionCareAccess(s)) * P("economy.infectionCareTravelCostScale")) * assistedTravelScale(s);
const infectionCareTravelPortion = (total, s) => total * (1 - 1 / infectionCareTravelCostScale(s));
