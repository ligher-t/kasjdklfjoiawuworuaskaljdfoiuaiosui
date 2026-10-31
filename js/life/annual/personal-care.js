// js/life/annual/personal-care.js: ordered annual phase; see ANNUAL.md.
function finishAnnualPersonalBudget(s, services, amounts, tc, ex, annualFlow) {
  const { parentForCare, adultParentTreatmentCost, inc } = amounts;
  if(typeof updateLoanContractStatuses==="function")updateLoanContractStatuses(s);
  const debtInterest = typeof accrueUncontractedDebtInterest==="function"
    ? accrueUncontractedDebtInterest(s,"personal",services.P("economy.debtInterest"))
    : s.debt * services.P("economy.debtInterest");
  if(typeof accrueUncontractedDebtInterest!=="function")s.debt+=debtInterest;
  annualFlow.expense.debtInterest = debtInterest;
  annualFlow.net -= debtInterest;
  if (s.debt === 0 && s.fl.debt_yakuza) s.fl.debt_yakuza = 0;
  s.inc = inc;
  s.exp = ex + tc + adultParentTreatmentCost + (annualFlow.expense.familyContribution || 0) + debtInterest + (annualFlow.expense.education || 0);
  if (tc && s.debt > services.P("economy.treatmentStopDebtMultiple") * tc && s.cash < tc) {
    s.fl.tx = 0;
    services.L('<span class="bad">費用が払えず、治療を続けられなくなった。</span>');
  }
  if (
    adultParentTreatmentCost &&
    s.debt > services.P("economy.treatmentStopDebtMultiple") * adultParentTreatmentCost &&
    s.cash < adultParentTreatmentCost &&
    parentForCare &&
    s.familyCare?.treatmentSupport
  ) {
    s.familyCare.treatmentSupport = false;
    services.recordFamilyCareHistory(s, "contribution_paused", {
      target: s.familyCare.target,
      plan: s.familyCare.plan,
      treatmentSupport: true,
      treatmentStillActive: !!parentForCare.tx,
      treatmentPaidTotal: s.familyCare.treatmentPaidTotal,
      amount: adultParentTreatmentCost,
      reason: "本人の家計で分担額を負担できない"
    });
    services.L(
      `<span class="bad">${services.esc(parentForCare.nm)}の療養費のうち、あなたが担っていた分担を続けられなくなった。治療自体が終わったかは分からず、費用を誰が担うか家族で話し直すことになった。</span>`
    );
  }
  if (s.familyCare) {
    s.familyCare.yearsRemaining--;
    if (s.familyCare.yearsRemaining <= 0) {
      const parent = s.par?.[s.familyCare.target];
      services.recordFamilyCareHistory(s, "period_ended", {
        target: s.familyCare.target,
        plan: s.familyCare.plan,
        treatmentSupport: !!s.familyCare.treatmentSupport,
        treatmentStillActive: !!parent?.tx,
        treatmentPaidTotal: s.familyCare.treatmentPaidTotal
      });
      services.L(
        '<span class="nt">親族の通院付き添いと日々の支援を二年間続けた。必要な手助けが終わったとは限らないが、今後の分担をあらためて相談することになった。</span>'
      );
      s.familyCare = null;
    }
  }
  services.lapseUnaffordableChildTreatments(s);
}
