function refreshWealthClass(s) {
  const shared = inSharedHousehold(s) && s.house;
  const personalNet = (s.cash || 0) + (s.investment || 0) - (s.debt || 0);
  const net = shared ? personalNet + (s.house.cash || 0) - (s.house.debt || 0) : personalNet;
  const benchmark = EXP[2] * (s.res?.pm || 1) * (s.priceIndex || 1);
  const reference = shared
    ? benchmark * 1.6
    : benchmark;
  const years = reference > 0 ? Math.max(0, net) / reference : 0,
    thresholds = P("economy.wealthClassReserveYears");
  let index = 0;
  for (let i = 0; i < thresholds.length; i++) if (years >= thresholds[i]) index = i + 1;
  s.w = WEALTH[Math.min(index, WEALTH.length - 1)];
}
function childResidenceCostTarget(s) {
  return (s.kids || []).find(child => child.id === s.eventRelativeId && !child.d) || null;
}
function childInfectionInitialSupportCost(s) {
  return (
    P("economy.childInfectionInitialSupportCost") *
    childResidenceEconomicIndex(s, childResidenceCostTarget(s), "pm") *
    (s.priceIndex || 1)
  );
}
function childInfectionSpecialistStartCost(s) {
  return (
    P("economy.childInfectionSpecialistStartCost") *
    childResidenceEconomicIndex(s, childResidenceCostTarget(s), "md") *
    (s.priceIndex || 1)
  );
}
function childInfectionTreatmentRestartCost(s) {
  return (
    P("economy.childInfectionTreatmentRestartCost") *
    childResidenceEconomicIndex(s, childResidenceCostTarget(s), "md") *
    (s.priceIndex || 1)
  );
}
function childInfectionConsultTravelCost(s) {
  return 5e4 * childResidenceEconomicIndex(s, childResidenceCostTarget(s), "pm") * (s.priceIndex || 1);
}
// Keep event quotes, annual payer charges, and treatment-lapse thresholds on the same cost basis.
function childAnnualMedicalExpense(s, child, treatment, costPm = s.res.pm * (s.priceIndex || 1) * localityLivingMultiplier(s)) {
  if (!child || child.d) return 0;
  const share = childResidenceCostShare(s, child);
  const localPm = childResidenceEconomicIndex(s, child, "pm");
  const childCostPm = (localPm / (s.res?.pm || 1)) * costPm;
  return (
    P(treatment ? "economy.childInfectionTreatmentAnnualCost" : "economy.childInfectionCareAnnualCost") *
    infectionCareTravelCostScale(s) *
    share *
    childCostPm
  );
}
function childInfectionAnnualTreatmentCost(s) {
  return childAnnualMedicalExpense(s, childResidenceCostTarget(s), true);
}
function childInfectionAnnualCareCost(s) {
  return childAnnualMedicalExpense(s, childResidenceCostTarget(s), false);
}
function activeChildTreatmentAnnualCost(s) {
  return (s.kids || [])
    .filter(child => childIsSupported(s, child) && child.inf && child.tx)
    .reduce((sum, child) => sum + childAnnualMedicalExpense(s, child, true), 0);
}
function lapseUnaffordableChildTreatments(s, annualCost = activeChildTreatmentAnnualCost(s)) {
  if (
    !Number.isFinite(annualCost) ||
    annualCost <= 0 ||
    s.debt <= P("economy.treatmentStopDebtMultiple") * annualCost ||
    s.cash >= annualCost
  )
    return [];
  const children = (s.kids || []).filter(k => childIsSupported(s, k) && k.inf && k.tx),
    lapsed = [];
  for (const child of children) {
    const before = HL && !CAPTURE_TRACE ? null : traceState(s);
    child.tx = 0;
    lapsed.push(child.id);
    L(`<span class="bad">家計の負債が膨らみ、${esc(child.nm)}の専門診療を続けられなくなった。</span>`);
    recordTrace(
      "child-treatment-lapse",
      child.id,
      { childId: child.id, child: child.nm, reason: "financial", annualCost },
      before
    );
  }
  return lapsed;
}
