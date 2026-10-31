function validateSpouseHealthParameters(W_, services) {
  const divorceParentingMin = services.P("family.divorceParentingReviewMinYears"),
    divorceParentingMax = services.P("family.divorceParentingReviewMaxYears");
  if (
    !Number.isInteger(divorceParentingMin) ||
    divorceParentingMin < 1 ||
    !Number.isInteger(divorceParentingMax) ||
    divorceParentingMax < divorceParentingMin
  )
    W_.push("離婚後の養育相談間隔設定が不正");
  const spouseHealthMin = services.P("family.spouseHealthInitialMin"),
    spouseHealthMax = services.P("family.spouseHealthInitialMax"),
    spouseHealthBase = services.P("family.spouseHealthLegacyBaseline"),
    spouseHealthAgeStart = services.P("family.spouseHealthAgeStart"),
    spouseHealthAgeDrift = services.P("family.spouseHealthAgeDrift"),
    spouseHealthInfection = services.P("family.spouseHealthInfectionDrift"),
    spouseHealthHazard = services.P("family.spouseHealthHazardDrift"),
    spouseHealthRandom = services.P("family.spouseHealthRandomDrift"),
    spouseHealthThreshold = services.P("family.spouseHealthWorkThreshold"),
    spouseHealthFloor = services.P("family.spouseHealthWorkFloor"),
    spouseHealthRelief = services.P("family.spouseHealthRestRelief"),
    spouseHealthCost = services.P("family.spouseHealthConsultBaseCost"),
    spouseHealthReviewMin = services.P("family.spouseHealthReviewMinYears"),
    spouseHealthReviewMax = services.P("family.spouseHealthReviewMaxYears"),
    spouseHealthNotice = services.P("family.spouseHealthNoticeThreshold");
  if (
    !Number.isFinite(spouseHealthMin) ||
    !Number.isFinite(spouseHealthMax) ||
    spouseHealthMin < 0 ||
    spouseHealthMax > 100 ||
    spouseHealthMax < spouseHealthMin ||
    !Number.isFinite(spouseHealthBase) ||
    spouseHealthBase < 0 ||
    spouseHealthBase > 100 ||
    !Number.isFinite(spouseHealthAgeStart) ||
    spouseHealthAgeStart < 0 ||
    [
      spouseHealthAgeDrift,
      spouseHealthInfection,
      spouseHealthHazard,
      spouseHealthRandom,
      spouseHealthRelief,
      spouseHealthCost
    ].some(value => !Number.isFinite(value) || value < 0) ||
    !Number.isFinite(spouseHealthThreshold) ||
    spouseHealthThreshold <= 0 ||
    spouseHealthThreshold > 100 ||
    !Number.isFinite(spouseHealthFloor) ||
    spouseHealthFloor < 0 ||
    spouseHealthFloor > 1 ||
    !Number.isInteger(spouseHealthReviewMin) ||
    spouseHealthReviewMin < 1 ||
    !Number.isInteger(spouseHealthReviewMax) ||
    spouseHealthReviewMax < spouseHealthReviewMin ||
    !Number.isFinite(spouseHealthNotice) ||
    spouseHealthNotice < 0 ||
    spouseHealthNotice > 100
  )
    W_.push("配偶者の一般健康モデル設定値が不正");
  const spouseLayoff = services.P("family.spouseUnemploymentChance"),
    spouseRehireMin = services.P("family.spouseReemploymentReviewMinYears"),
    spouseRehireMax = services.P("family.spouseReemploymentReviewMaxYears"),
    spouseRehireChance = services.P("family.spouseReemploymentChance"),
    spouseTrainingBoost = services.P("family.spouseTrainingReemploymentBoost"),
    spouseSearchBoost = services.P("family.spouseSearchReemploymentBoost");
  if (
    !Number.isFinite(spouseLayoff) ||
    spouseLayoff < 0 ||
    spouseLayoff > 1 ||
    !Number.isInteger(spouseRehireMin) ||
    spouseRehireMin < 1 ||
    !Number.isInteger(spouseRehireMax) ||
    spouseRehireMax < spouseRehireMin ||
    !Number.isFinite(spouseRehireChance) ||
    spouseRehireChance < 0 ||
    spouseRehireChance > 1 ||
    [spouseTrainingBoost, spouseSearchBoost].some(value => !Number.isFinite(value) || value < 0 || value > 1)
  )
    W_.push("配偶者の失職・再就職設定値が不正");
}
