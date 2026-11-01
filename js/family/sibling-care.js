const familyCareScheduleSiblingCandidates = s =>
  siblingsOf(s).filter(person => {
    if (person.d || s.year - person.by < P("life.adultStartAge")) return false;
    if (person.independentSinceYear)
      return (
        person.contactState === "regular" &&
        person.knownRegion === s.res.n &&
        (person.moveHistory?.length || 0) <= (person.knownMoveCount || 0)
      );
    if (["ended", "paused"].includes(person.contactState)) return false;
    if (!s.fl?.household_separated) return true;
    const ledger = s.house?.parentLedger;
    return (
      ledger?.status === "tracked" &&
      ledger.knownRegion === s.res.n &&
      (ledger.moveHistory?.length || 0) <= (ledger.knownMoveCount || 0)
    );
  });
const familyCareCostShareSiblingCandidates = s =>
  familyCareScheduleSiblingCandidates(s).filter(
    person =>
      person.independentSinceYear &&
      person.knownFinancialStatus === "stable" &&
      Number.isFinite(person.financialKnownYear) &&
      s.year - person.financialKnownYear <= P("family.siblingCareFinancialKnowledgeYears") &&
      !(
        Number.isFinite(person.financialNoticeYear) &&
        person.financialNoticeYear > (person.financialKnownYear || person.independentSinceYear)
      )
  );
const familyCareEarningsScale = (s, annualBase = 1) => {
  const hasEarnings =
    annualBase > 0 &&
    s.job > 0 &&
    !s.fl?.retired &&
    !s.fl?.detained &&
    (!s.fl?.segregated || !!s.fl?.seg_work);
  if (!s.familyCare || !hasEarnings) return 1;
  return s.familyCare.plan === "shared"
    ? P("family.parentCareSharedIncomeScale")
    : s.familyCare.plan === "network"
      ? P("family.parentCareNetworkIncomeScale")
      : P("family.parentCareDirectIncomeScale");
};
const siblingOccupationLabel = (sibling, allowPending = false) =>
  !sibling?.independentSinceYear
    ? "同居・生業未記録"
    : allowPending
      ? J[sibling.j]?.n || "新しい仕事"
      : Number.isInteger(sibling.knownJobId)
        ? J[sibling.knownJobId]?.n || "仕事"
        : "仕事未確認";
const siblingCount = s =>
  (Array.isArray(s.siblings) ? s.siblings.length : 0) +
  (Number.isSafeInteger(s.legacySiblingCount)
    ? s.legacySiblingCount
    : Array.isArray(s.siblings)
      ? 0
      : Math.max(0, Number(s.sib) || 0));
function repairLegacySiblingCount(s) {
  if (!s) return s;
  if (!Array.isArray(s.siblings)) {
    const raw = Number(s.sib),
      count = Number.isFinite(raw) ? Math.max(0, Math.min(99, Math.trunc(raw))) : 0;
    s.siblings = [];
    s.legacySiblingCount = count;
    delete s.sib;
  } else {
    const raw = Number(s.legacySiblingCount);
    s.legacySiblingCount = Number.isFinite(raw) ? Math.max(0, Math.min(99, Math.trunc(raw))) : 0;
  }
  return s;
}
const householdDependentSiblings = s =>
  siblingsOf(s).filter(
    x => !x.d && !x.independentSinceYear && s.year - x.by < P("life.childHouseholdEndAge")
  );
const householdSiblingCareExpense = s =>
  siblingsOf(s).filter(x => x.inf && x.tx === 1 && !x.d && !x.independentSinceYear).length *
  P("economy.childInfectionCareAnnualCost") *
  s.res.pm *
  (1 + infectionSocialPressure(s).medical * 0.3) *
  infectionCareTravelCostScale(s);
function lapseUnaffordableSiblingTreatment(s, careCost = householdSiblingCareExpense(s)) {
  if (
    !s.house ||
    !careCost ||
    s.house.debt <= P("economy.treatmentStopDebtMultiple") * careCost ||
    s.house.cash >= careCost
  )
    return null;
  const sibling = siblingsOf(s).find(x => x.inf && x.tx === 1 && !x.d && !x.independentSinceYear);
  if (!sibling) return null;
  sibling.tx = 0;
  sibling.treatmentPlanYear = null;
  sibling.treatmentPlanHistory || (sibling.treatmentPlanHistory = []);
  sibling.treatmentPlanHistory.push({ year: s.year, from: 1, to: 0, cause: "家計負債により継続支援を休止" });
  sibling.treatmentPlanHistory = sibling.treatmentPlanHistory.slice(-12);
  L(
    `<span class="bad">家計の負債が膨らみ、${esc(sibling.nm)}の継続通院費を支えられなくなった。受診を望んでいないという意味ではなく、家族は別の支援先を探すことになった。</span>`
  );
  return sibling.id;
}
const siblingCareSupportQuote = (s, sibling, costPm = s.res.pm * (s.priceIndex || 1)) =>
  sibling?.independentSinceYear && sibling.inf && !sibling.d
    ? (sibling.careSupportAnnual || P("economy.siblingInfectionSupportAnnualCost")) *
      costPm *
      infectionCareTravelCostScale(s)
    : 0;
const independentSiblingCareSupportAnnualCost = (s, sibling, costPm = s.res.pm * (s.priceIndex || 1)) =>
  sibling?.careSupportAnnual > 0 ? siblingCareSupportQuote(s, sibling, costPm) : 0;
const independentSiblingCareSupportExpense = (s, costPm = s.res.pm * (s.priceIndex || 1)) =>
  siblingsOf(s).reduce(
    (sum, sibling) => sum + independentSiblingCareSupportAnnualCost(s, sibling, costPm),
    0
  );
function recordIndependentSiblingCareSupportPayments(s, costPm = s.res.pm * (s.priceIndex || 1)) {
  for (const sibling of siblingsOf(s))
    if (sibling.independentSinceYear && sibling.inf && !sibling.d && sibling.careSupportAnnual > 0) {
      const amount = sibling.careSupportAnnual * costPm * infectionCareTravelCostScale(s);
      sibling.careSupportPaidTotal = (sibling.careSupportPaidTotal || 0) + amount;
      sibling.careSupportPaidYear = s.year;
      sibling.careSupportPaidAmount = amount;
      sibling.aidReceivedTotal = (sibling.aidReceivedTotal || 0) + amount;
      creditSiblingFinance(sibling, amount, s.year, "年次療養支援");
    }
}
function creditSiblingFinance(
  sibling,
  amount,
  year = sibling.financialUpdatedYear || sibling.independentSinceYear || 0,
  cause = "家族からの一時援助"
) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  let debt = Math.max(0, sibling.financialDebt || 0),
    cash = Math.max(0, sibling.financialCash || 0);
  const debtPayment = Math.min(debt, amount);
  debt -= debtPayment;
  cash += amount - debtPayment;
  sibling.financialDebt = debt;
  sibling.financialCash = cash;
  if (Number.isFinite(sibling.financialAnnualExpense))
    sibling.financialStatus = siblingFinancialStatus(sibling);
  sibling.financialTransfers || (sibling.financialTransfers = []);
  sibling.financialTransfers.push({ year, amount, cause, debtPayment, cashAdded: amount - debtPayment });
  sibling.financialTransfers = sibling.financialTransfers.slice(-12);
}
