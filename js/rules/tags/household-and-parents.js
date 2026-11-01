// household-and-parents: original rule order and preparation timing are preserved.
function appendHouseholdAndParentsTags(s, services, on) {
  const displacementYear = s.displacement?.sinceYear ?? s.sn.displacement_after ?? s.sn.disaster_after;
  on(!!(s.fl.disaster_displaced || s.fl.war_displaced), "避難中");
  on(
    (s.fl.disaster_displaced || s.fl.war_displaced) &&
      Number.isInteger(displacementYear) &&
      s.year - displacementYear >= 1,
    "避難長期化"
  );
  const lastMove = (s.moves || []).at(-1);
  on((s.moves || []).length > 0, "転居経験");
  on(!!lastMove && s.year - lastMove.year <= services.helpers.P("migration.recentArrivalYears"), "転居直後");
  on(!s.par.fa.d || !s.par.mo.d, "親存命");
  on(s.par.fa.d && s.par.mo.d, "両親没");
  on(services.helpers.siblingCount(s) > 0, "兄弟あり");
  on(
    services.helpers.siblingsOf(s).some(x => x.inf && !x.d),
    "感染したきょうだいがいる"
  );
  on(
    services.helpers.siblingsOf(s).some(x => x.inf && x.infKnown && !x.d),
    "本人が感染を知っているきょうだいがいる"
  );
  on(
    services.helpers.siblingsOf(s).some(x => x.inf && x.infKnown && !x.d && !x.independentSinceYear),
    "感染した同居きょうだいがいる"
  );
  on(
    services.helpers.siblingsOf(s).some(x => !x.d),
    "存命のきょうだいがいる"
  );
  on(
    services.helpers.siblingsOf(s).some(x => !x.d && s.year - x.by >= 18),
    "存命の成人きょうだいがいる"
  );
  on(
    services.helpers.siblingsOf(s).some(x => !x.d && x.independentSinceYear),
    "別居した成人きょうだいがいる"
  );
  on(
    services.helpers
      .siblingsOf(s)
      .some(
        x =>
          !x.d &&
          x.independentSinceYear &&
          (x.contactState !== "ended" || x.careSupportAnnual > 0) &&
          s.year - x.by >= services.helpers.P("life.adultStartAge") &&
          (!Number.isFinite(x.contactReviewYear) || x.contactReviewYear <= s.year)
      ),
    "別居きょうだいと連絡を取る時期"
  );
  on(
    [s.par.fa, s.par.mo].some(p => p?.inf && p.d),
    "感染した親の死後"
  );
  on(
    [s.par.fa, s.par.mo].some(p => p && !p.d && p.j === 5),
    "存命の商人親"
  );
  on(s.care?.kind === "氏族・共同体で育つ", "氏族養育");
  on(
    (s.care?.parentKeys || ["fa", "mo"]).some(key => {
      const p = s.par?.[key];
      return p && !p.d && p.inf && !p.infectionKnown;
    }),
    "未把握の親感染"
  );
  const caregiverParents = (s.care.parentKeys || []).map(k => s.par[k]).filter(p => p && !p.d && p.j > 0);
  on(caregiverParents.length > 0 && !s.fl.parent_unemployed, "家計を担う親あり");
  on(caregiverParents.length > 0 && s.fl.parent_unemployed, "失業中の親");
  on(
    [s.par?.fa, s.par?.mo].some(
      p =>
        p &&
        !p.d &&
        (p.health <= services.helpers.P("family.parentCareNeedThreshold") ||
          (p.inf && p.health <= services.helpers.P("family.parentCareNeedInfectedThreshold")))
    ),
    "親の継続的な手助けが必要"
  );
  const careHistory = s.familyCareHistory || [];
  let lastCareEndIndex = -1;
  careHistory.forEach((row, index) => {
    if (row.type === "period_ended") lastCareEndIndex = index;
  });
  const lastCareEnd = lastCareEndIndex >= 0 ? careHistory[lastCareEndIndex] : null,
    careReviewDone =
      lastCareEndIndex >= 0 && careHistory.slice(lastCareEndIndex + 1).some(row => row.type === "reviewed"),
    careReviewParent = lastCareEnd
      ? [s.par?.fa, s.par?.mo].find(parent => parent?.id === lastCareEnd.targetId && !parent.d)
      : null,
    careReviewStillNeeded =
      !!careReviewParent &&
      (careReviewParent.health <= services.helpers.P("family.parentCareNeedThreshold") ||
        (careReviewParent.inf &&
          careReviewParent.health <= services.helpers.P("family.parentCareNeedInfectedThreshold")));
  on(
    !s.familyCare &&
      !careReviewDone &&
      lastCareEnd &&
      s.year - lastCareEnd.year <= services.helpers.P("family.parentCareReviewWindowYears") &&
      careReviewStillNeeded,
    "親族ケアの再相談が必要"
  );
  on(
    !!s.familyCare &&
      s.familyCare.plan === "direct" &&
      s.h < services.helpers.P("family.parentCareDirectMinHealth") &&
      s.familyCare.capacityReviewYear !== s.year,
    "親族ケアの負担見直しが必要"
  );
  on(s.inf && !s.fl.dg, "感染の疑い・診断未確定");
  on((s.oripathyExposure?.reviewDueYear ?? Infinity) <= s.year, "曝露後の診察時期");
}
