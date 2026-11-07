// js/life/annual/wealth-and-history.js: ordered annual phase; see ANNUAL.md.
function recordAnnualWealthAndHistory(s, services, a, annualFlowRecorded) {
  if (s.investment > 0) {
    const before = s.investment;
    s.investment = services.revalueWorkshopShare(before);
    s.investmentDelta = s.investment - before;
  } else s.investmentDelta = 0;
  if (annualFlowRecorded && s.flow) {
    s.flowHistory || (s.flowHistory = []);
    s.flowHistory.push({
      ...s.flow,
      income: { ...s.flow.income },
      expense: { ...s.flow.expense },
      investmentDelta: s.investmentDelta || 0,
      afterAnnualUpdate: { cash: s.cash, debt: s.debt, investment: s.investment || 0 }
    });
    if (s.flowHistory.length > services.FLOW_HISTORY_LIMIT) s.flowHistory.shift();
  }
  services.refreshWealthClass(s);
  services.refreshSocialClass(s, "世帯の収支・就労・住環境の年次更新");
  const tg =
    services.P("social.creditBase") +
    services.eduLv(s) * services.P("social.educationCreditScale") +
    (employmentPaidForYear(s, s.year - 1) > services.P("social.highIncomeThreshold")
      ? services.P("social.highIncomeBonus")
      : 0) +
    (s.cash + (s.investment || 0) >= s.debt
      ? services.P("social.solvencyBonus")
      : services.P("social.insolvencyPenalty")) -
    services.equityCreditPenalty(s);
  s.cr = services.clamp(s.cr + (tg - s.cr) * services.P("social.creditSmoothing"));
  s.hs.push([a, s.h, s.p, s.cash + (s.investment || 0) - s.debt]);
}
