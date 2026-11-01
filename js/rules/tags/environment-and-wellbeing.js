// environment-and-wellbeing: original rule order and preparation timing are preserved.
function appendEnvironmentAndWellbeingTags(s, services, T, on) {
  const op = services.helpers.infectionSocialPressure(s),
    careAccess = services.preparation.infectionCareAccess(s);
  on(
    Math.max(op.public, op.work, op.housing, op.medical) >=
      services.helpers.P("infection.socialPressureHighThreshold"),
    "地域の感染者圧力が強い"
  );
  on(op.public >= services.helpers.P("infection.socialPressureHighThreshold"), "感染者への世間圧力が強い");
  on(op.housing >= services.helpers.P("infection.socialPressureHighThreshold"), "住居で感染者圧力が強い");
  on(
    Math.max(op.public, op.work, op.housing, op.medical) <=
      services.helpers.P("infection.socialPressureLowThreshold"),
    "地域の感染者圧力が比較的弱い"
  );
  on(op.disclosure >= services.helpers.P("infection.socialPressureHighThreshold"), "地域の隠蔽圧力が強い");
  on(
    op.disclosure <= services.helpers.P("infection.socialPressureLowThreshold"),
    "地域の隠蔽圧力が比較的弱い"
  );
  on(careAccess >= services.helpers.P("infection.careAccessHighThreshold"), "診療先へ通いやすい");
  on(careAccess <= services.helpers.P("infection.careAccessLowThreshold"), "診療先が遠い");
  on(
    s.res.war >= services.helpers.P("condition.warRegionScale") ||
      services.helpers.worldPressure(s, "war") > services.helpers.P("condition.activeWorldPressureScale"),
    "戦乱地域"
  );
  on(s.local?.hazard >= services.helpers.P("health.hazardThreshold"), "天災危険");
  on((s.careInclination || 0) >= 65, "家族ケアへの関与経験が多い");
  if (s.local?.kind) T.add("住環境:" + s.local.kind);
  if (s.local?.ecology && s.local.ecology !== "未特定") T.add("地勢:" + s.local.ecology);
  if (s.local?.city) T.add("都市:" + s.local.city);
  on(s.h < services.helpers.P("condition.healthLow"), "健康不良");
  on(s.h >= services.helpers.P("condition.healthHigh"), "健康良好");
  on(s.p < services.helpers.P("condition.moodLow"), "不幸");
  on(s.p >= services.helpers.P("condition.moodHigh"), "幸福");
  on(s.rl < services.helpers.P("condition.relationLow"), "孤立");
  on(s.rl >= services.helpers.P("condition.relationHigh"), "社交的");
  on(s.k >= services.helpers.P("condition.knowledgeHigh"), "博識");
  on(s.ar >= services.helpers.P("condition.artsHigh"), "アーツ優");
}
