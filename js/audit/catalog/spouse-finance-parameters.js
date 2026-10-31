function validateSpouseFinanceParameters(W_, services) {
  const spouseSharedIncome = services.P("economy.spouseSharedHouseholdIncomeShare"),
    spouseSeparateIncome = services.P("economy.spouseSeparateHouseholdIncomeShare"),
    spouseLivingShare = services.P("economy.spouseLivingExpenseShare"),
    spouseSeparateSupportCost = services.P("economy.spouseSeparateSupportAnnualCost"),
    spouseSeparateReviewMin = services.P("family.spouseSeparateReviewMinYears"),
    spouseSeparateReviewMax = services.P("family.spouseSeparateReviewMaxYears"),
    spouseReviewYears = services.P("family.spouseArrangementReviewYears"),
    spouseWorkMin = services.P("family.spouseWorkReviewMinYears"),
    spouseWorkMax = services.P("family.spouseWorkReviewMaxYears"),
    spouseWorkChance = services.P("family.spouseWorkChangeChance"),
    spouseHousingShare = services.P("economy.spouseSeparateHousingExpenseShare"),
    spouseSharedHousing = services.P("economy.spouseSharedHousingMultiplier"),
    spousePrivateHousing = services.P("economy.spousePrivateHousingMultiplier"),
    spouseHousingChangeCost = services.P("economy.spouseHousingChangeCost");
  if (
    [spouseSharedIncome, spouseSeparateIncome, spouseLivingShare].some(
      value => !Number.isFinite(value) || value < 0 || value > 1
    ) ||
    !Number.isInteger(spouseReviewYears) ||
    spouseReviewYears < 1
  )
    W_.push("配偶者の家計分担・生活費設定値が不正");
  if (!Number.isFinite(spouseHousingShare) || spouseHousingShare < 0 || spouseHousingShare > 1)
    W_.push("配偶者の住居維持費割合が不正");
  if (
    !Number.isFinite(spouseSharedHousing) ||
    spouseSharedHousing < 0 ||
    spouseSharedHousing > 1 ||
    !Number.isFinite(spousePrivateHousing) ||
    spousePrivateHousing < 1 ||
    !Number.isFinite(spouseHousingChangeCost) ||
    spouseHousingChangeCost < 0
  )
    W_.push("配偶者の住居選択・変更費設定値が不正");
  if (
    !Number.isFinite(spouseSeparateSupportCost) ||
    spouseSeparateSupportCost < 0 ||
    !Number.isInteger(spouseSeparateReviewMin) ||
    spouseSeparateReviewMin < 1 ||
    !Number.isInteger(spouseSeparateReviewMax) ||
    spouseSeparateReviewMax < spouseSeparateReviewMin
  )
    W_.push("配偶者の別居支援設定値が不正");
  if (
    !Number.isInteger(spouseWorkMin) ||
    spouseWorkMin < 1 ||
    !Number.isInteger(spouseWorkMax) ||
    spouseWorkMax < spouseWorkMin ||
    !Number.isFinite(spouseWorkChance) ||
    spouseWorkChance < 0 ||
    spouseWorkChance > 1
  )
    W_.push("配偶者の職業更新設定値が不正");
  const spouseContactBase = services.P("economy.spouseContactAnnualCost"),
    spouseContactScale = services.P("economy.spouseRegularContactCostScale"),
    spouseLocalVisit = services.P("economy.spouseLocalVisitBaseCost"),
    spouseLocalRejoin = services.P("economy.spouseLocalRejoinBaseCost");
  if (
    !Number.isFinite(spouseContactBase) ||
    spouseContactBase < 0 ||
    !Number.isFinite(spouseContactScale) ||
    spouseContactScale < 1
  )
    W_.push("配偶者の連絡費設定値が不正");
  if (
    !Number.isFinite(spouseLocalVisit) ||
    spouseLocalVisit < 0 ||
    !Number.isFinite(spouseLocalRejoin) ||
    spouseLocalRejoin < 0
  )
    W_.push("配偶者の同地域訪問・再合流費設定値が不正");
  const spouseMoveCost = services.P("economy.spouseMoveCostBase"),
    spouseMoveMin = services.P("family.spouseMoveReviewMinYears"),
    spouseMoveMax = services.P("family.spouseMoveReviewMaxYears"),
    spouseMoveChance = services.P("family.spouseIndependentMoveChance");
  if (
    !Number.isFinite(spouseMoveCost) ||
    spouseMoveCost < 0 ||
    !Number.isInteger(spouseMoveMin) ||
    spouseMoveMin < 1 ||
    !Number.isInteger(spouseMoveMax) ||
    spouseMoveMax < spouseMoveMin ||
    !Number.isFinite(spouseMoveChance) ||
    spouseMoveChance < 0 ||
    spouseMoveChance > 1
  )
    W_.push("配偶者の独立転居設定値が不正");
  const spouseSavings = services.P("economy.spouseOpeningSavingsShare"),
    spouseDebtChance = services.P("economy.spouseOpeningDebtChance"),
    spouseDebtMin = services.P("economy.spouseOpeningDebtMinYears"),
    spouseDebtMax = services.P("economy.spouseOpeningDebtMaxYears");
  if (
    !Number.isFinite(spouseSavings) ||
    spouseSavings < 0 ||
    spouseSavings > 1 ||
    !Number.isFinite(spouseDebtChance) ||
    spouseDebtChance < 0 ||
    spouseDebtChance > 1 ||
    !Number.isFinite(spouseDebtMin) ||
    spouseDebtMin < 0 ||
    !Number.isFinite(spouseDebtMax) ||
    spouseDebtMax < spouseDebtMin
  )
    W_.push("配偶者の初期家計推計設定値が不正");
  const spouseFinanceReviewMin = services.P("family.spouseFinanceReviewMinYears"),
    spouseFinanceReviewMax = services.P("family.spouseFinanceReviewMaxYears");
  if (
    !Number.isInteger(spouseFinanceReviewMin) ||
    spouseFinanceReviewMin < 1 ||
    !Number.isInteger(spouseFinanceReviewMax) ||
    spouseFinanceReviewMax < spouseFinanceReviewMin
  )
    W_.push("配偶者家計再相談間隔が不正");
  const spousePreferenceMin = services.P("family.spouseWorkPreferenceReviewMinYears"),
    spousePreferenceMax = services.P("family.spouseWorkPreferenceReviewMaxYears");
  if (
    !Number.isInteger(spousePreferenceMin) ||
    spousePreferenceMin < 1 ||
    !Number.isInteger(spousePreferenceMax) ||
    spousePreferenceMax < spousePreferenceMin
  )
    W_.push("配偶者の仕事希望見直し設定値が不正");
}
