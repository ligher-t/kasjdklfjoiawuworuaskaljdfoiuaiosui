const path = require('path');
const { context } = require(path.resolve(__dirname, '../tests/support/presentation-cases.cjs'));
const env = context(path.resolve(__dirname, '..'));
const vm = require('vm');

const code = `
(async () => {
  const origAudit = auditLifeState;
  auditLifeState = (s) => {
    const problems = origAudit(s);
    if (problems.some(p => p.includes("年次収支履歴に不正な年"))) {
      console.log("=== FAILING STATE VALIDATION ===");
      console.log("Current year:", s.year, "Current cash:", s.cash, "debt:", s.debt);
      const rows = s.flowHistory || [];
      console.log("Total flowHistory rows:", rows.length);
      let previousFlowYear = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const failYear = !Number.isInteger(row.year) || row.year <= (s.by || 1077) || row.year > s.year || row.year <= previousFlowYear;
        const failIncome = !row.income || Object.values(row.income).some(v => !Number.isFinite(v) || v < 0);
        const failExpense = !row.expense || Object.values(row.expense).some(v => !Number.isFinite(v) || v < 0);
        const failAfter = !row.afterAnnualUpdate || [row.afterAnnualUpdate.cash, row.afterAnnualUpdate.debt, row.afterAnnualUpdate.investment].some(v => !Number.isFinite(v) || v < 0);
        const failNet = !Number.isFinite(row.net);
        const failInv = !Number.isFinite(row.investmentDelta);
        if (failYear || failIncome || failExpense || failAfter || failNet || failInv) {
          console.log(\`Row \${i} (year \${row.year}) FAILS:\`, {
            failYear, failIncome, failExpense, failAfter, failNet, failInv,
            previousFlowYear, row
          });
        }
        previousFlowYear = row.year;
      }
    }
    return problems;
  };

  await runDevSimulation({
    count: 1,
    replaySeed: 4126179723,
    replayBirthYear: 1077,
    maxYears: 120
  });
})()
`;

vm.runInContext(code, env.ctx);
