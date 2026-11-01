// js/life/annual/personal-budget.js: ordered annual phase; see ANNUAL.md.
function applyAnnualPersonalBudget(s, services, a, t, f) {
  let annualFlowRecorded = false;
  if (a >= services.P("life.workStartAge")) {
    const amounts = prepareAnnualPersonalBudget(s, services, a, t, f);
    const { tc, ex, annualFlow } = settleAnnualPersonalCash(s, services, amounts, a);
    annualFlowRecorded = true;
    recordAnnualFamilyPayments(s, services, amounts);
    finishAnnualPersonalBudget(s, services, amounts, tc, ex, annualFlow);
  }
  return annualFlowRecorded;
}
