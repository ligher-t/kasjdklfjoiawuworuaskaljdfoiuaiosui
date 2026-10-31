function auditNumericAndMoneyHistory(s, problems, services = STATE_AUDIT_SERVICES) {
  for (const key of [
    "age",
    "year",
    "h",
    "p",
    "k",
    "rl",
    "ar",
    "cr",
    "ep",
    "ob",
    "cash",
    "debt",
    "investment",
    "inc",
    "exp",
    "workPayBonus"
  ])
    if (!Number.isFinite(s[key])) problems.push(`${key}が有限数でない`);
  if (!Array.isArray(s.flowHistory) || s.flowHistory.length > services.FLOW_HISTORY_LIMIT)
    problems.push("本人の年次収支履歴が不正");
  else {
    let previousFlowYear = 0;
    for (const row of s.flowHistory) {
      if (
        !Number.isInteger(row.year) ||
        row.year <= (s.by || services.START) ||
        row.year > s.year ||
        row.year <= previousFlowYear ||
        !row.income ||
        !row.expense ||
        !row.afterAnnualUpdate ||
        !Number.isFinite(row.net) ||
        !Number.isFinite(row.investmentDelta) ||
        Object.values(row.income).some(value => !Number.isFinite(value) || value < 0) ||
        Object.values(row.expense).some(value => !Number.isFinite(value) || value < 0) ||
        [row.afterAnnualUpdate.cash, row.afterAnnualUpdate.debt, row.afterAnnualUpdate.investment].some(
          value => !Number.isFinite(value) || value < 0
        )
      )
        problems.push("本人の年次収支履歴に不正な年・収支・更新後残高がある");
      previousFlowYear = row.year;
    }
  }
  if (!Array.isArray(s.moneyLog) || s.moneyLog.length > services.CHOICE_ECONOMY_HISTORY_LIMIT)
    problems.push("選択時の資金履歴が不正");
  else
    for (const row of s.moneyLog)
      if (
        !Number.isInteger(row.year) ||
        row.year < (s.by || services.START) ||
        row.year > s.year ||
        typeof row.label !== "string" ||
        !Number.isFinite(row.assetsDelta) ||
        !Number.isFinite(row.debtDelta) ||
        !Number.isFinite(row.investmentDelta)
      )
        problems.push("選択時の資金履歴に不正な年・差分がある");
  if (s.investmentDelta != null && !Number.isFinite(s.investmentDelta))
    problems.push("投資持分の直近年次評価差が有限数でない");
  const investmentVolatility = services.PARAM["economy.workshopShareAnnualVolatility"];
  if (!Number.isFinite(investmentVolatility) || investmentVolatility < 0 || investmentVolatility >= 1)
    problems.push("地域共同事業持分の変動幅が0以上1未満でない");
}
