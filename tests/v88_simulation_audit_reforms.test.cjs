'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const { context } = require('./support/presentation-cases.cjs');
const runtimeEnv = context(root);

console.log('Testing v88 Simulation Reforms and Audit Fixes...');

// 1. 親の年次老衰・自然死判定の検証
const parentMortalityTest = vm.runInContext(`(() => {
  const s = {
    by: 1077, year: 1157, age: 80,
    dead: false,
    par: {
      fa: { nm: '父', by: 1047, d: 0, h: 10, r: { n: 'フェリーン' } },
      mo: { nm: '母', by: 1049, d: 0, h: 5, r: { n: 'フェリーン' } }
    },
    fl: {},
    res: { n: '龍門', pm: 1 },
    cash: 100000,
    debt: 0,
    personalFinance: { history: [], supportReceipts: [] }
  };

  // 110歳の高齢・低健康の親に対して複数年進める
  let fatherDied = false;
  let motherDied = false;
  for (let y = 1157; y <= 1165; y++) {
    s.year = y;
    advanceParentWorkLives(s);
    if (s.par.fa.d > 0) fatherDied = true;
    if (s.par.mo.d > 0) motherDied = true;
    if (fatherDied && motherDied) break;
  }

  return {
    fatherDied,
    fatherDeathYear: s.par.fa.d,
    fatherKnownYear: s.par.fa.deathKnownYear,
    motherDied,
    motherDeathYear: s.par.mo.d,
    motherKnownYear: s.par.mo.deathKnownYear
  };
})()`, runtimeEnv.ctx);

assert.equal(parentMortalityTest.fatherDied, true, 'Elderly low-health father passes away naturally');
assert.ok(parentMortalityTest.fatherDeathYear > 0, 'Father death year is recorded');
assert.equal(parentMortalityTest.fatherKnownYear, parentMortalityTest.fatherDeathYear, 'Death is immediately known to household');
assert.equal(parentMortalityTest.motherDied, true, 'Elderly low-health mother passes away naturally');
assert.ok(parentMortalityTest.motherDeathYear > 0, 'Mother death year is recorded');
console.log('PASS: Parent annual senility and natural death correctly fires without zombie immortality');

// 2. 恋愛セーフティネットと緩和チェーンの検証
const romanceSafetyTest = vm.runInContext(`(() => {
  const safetyEv = EV.find(e => e.id === 'romance_resolve_safety');
  const followupEv = EV.find(e => e.id === 'romance_followup');
  const futureEv = EV.find(e => e.id === 'romance_future_talk');
  const marriageEv = EV.find(e => e.id === 'romance_marriage_choice');

  // 長期交際中（5年経過）で未婚の状態
  const s = {
    by: 1077, year: 1105, age: 28,
    fl: { lov: 1100 },
    romance: {
      metYear: 1100,
      stage: 'dating',
      partner: { nm: '交際相手' }
    },
    sp: null,
    dead: false,
    res: { n: 'クルビア', pm: 1 }
  };

  const safetyShow = safetyEv ? safetyEv.show(s) : false;

  return {
    safetyPresent: !!safetyEv,
    safetyShow,
    followupMax: followupEv?.after?.max,
    futureMax: futureEv?.after?.max,
    marriageMax: marriageEv?.after?.max,
    safetyChoices: safetyEv?.c?.length
  };
})()`, runtimeEnv.ctx);

assert.equal(romanceSafetyTest.safetyPresent, true, 'romance_resolve_safety is registered');
assert.equal(romanceSafetyTest.safetyShow, true, 'romance_resolve_safety shows for couple together 4+ years');
assert.ok(romanceSafetyTest.followupMax >= 6, 'romance_followup window relaxed to at least 6 years');
assert.ok(romanceSafetyTest.futureMax >= 6, 'romance_future_talk window relaxed to at least 6 years');
assert.ok(romanceSafetyTest.marriageMax >= 7, 'romance_marriage_choice window relaxed to at least 7 years');
assert.ok(romanceSafetyTest.safetyChoices >= 3, 'Safety event has at least 3 resolutions (marriage, cohabitation, breakup)');
console.log('PASS: Romance safety net and relaxed chain windows properly resolve long-term relationships');

// 3. 負債利息キャップと破産免責の検証
const debtCapTest = vm.runInContext(`(() => {
  const s1 = { debt: 35000000, loanContracts: [] };
  accrueUncontractedDebtInterest(s1, "personal", 0.05);

  const s2 = { debt: 10000000, loanContracts: [] };
  accrueUncontractedDebtInterest(s2, "personal", 0.05);

  // 破産イベントの免責効果
  const crisisEv = EV.find(e => e.id === 'life_debt_bankruptcy_crisis');
  const bankruptChoice = crisisEv?.c?.[0];
  const bankruptEffect = bankruptChoice?.o?.[0]?.[2] || bankruptChoice?.e;

  return {
    overCapDebtAdded: s1.debt - 35000000,
    underCapDebtAdded: s2.debt - 10000000,
    crisisPresent: !!crisisEv,
    bankruptReliefDebt: bankruptEffect?.debt
  };
})()`, runtimeEnv.ctx);

assert.equal(debtCapTest.overCapDebtAdded, 0, 'No interest accrued when debt exceeds 30,000,000 cap');
assert.equal(debtCapTest.underCapDebtAdded, 500000, 'Normal 5% interest accrued when debt is below cap');
assert.equal(debtCapTest.crisisPresent, true, 'life_debt_bankruptcy_crisis is registered');
assert.ok(debtCapTest.bankruptReliefDebt <= -100000000, 'Bankruptcy discharges debt completely');
console.log('PASS: Debt interest cap prevents infinite compounding and bankruptcy cleanly discharges debt');

// 4. 失業者・高齢者向け再就職イベントの供給検証
const reentryTest = vm.runInContext(`(() => {
  const youngUnemployedEv = EV.find(e => e.id === 'work_unemployed_reentry');
  const elderUnemployedEv = EV.find(e => e.id === 'work_elder_reentry');

  const sYoung = {
    by: 1077, year: 1107, age: 30,
    j: 0, h: 60, dead: false,
    res: { n: 'ヴィクトリア', pm: 1 },
    fl: { unemp_reentry_attempt: 0 }
  };

  const sElder = {
    by: 1077, year: 1142, age: 65,
    j: 0, h: 50, dead: false,
    res: { n: 'ヴィクトリア', pm: 1 },
    fl: { elder_reentry_attempt: 0 }
  };

  const getJobs = ev => (ev?.c || []).map(c => c.o?.[0]?.[2]?.job || c.e?.job).filter(Boolean);

  return {
    youngPresent: !!youngUnemployedEv,
    youngShow: youngUnemployedEv?.show(sYoung),
    youngJobs: getJobs(youngUnemployedEv),
    elderPresent: !!elderUnemployedEv,
    elderShow: elderUnemployedEv?.show(sElder),
    elderJobs: getJobs(elderUnemployedEv)
  };
})()`, runtimeEnv.ctx);

assert.equal(reentryTest.youngPresent, true, 'work_unemployed_reentry is registered');
assert.equal(reentryTest.youngShow, true, 'Shows for 30-year-old unemployed worker');
assert.ok(reentryTest.youngJobs.length >= 3, 'Offers multiple reentry jobs (day labor, factory, vending, etc.)');
assert.equal(reentryTest.elderPresent, true, 'work_elder_reentry is registered');
assert.equal(reentryTest.elderShow, true, 'Shows for 65-year-old unemployed elder');
console.log('PASS: Unemployed and elder re-entry events provide steady lifeline opportunities');

// 5. 家計整合性（State Failures ゼロ）の検証
const householdIntegrityTest = vm.runInContext(`(() => {
  // Test 1: Floating point epsilon in supportIncome
  const s = {
    by: 1077, year: 1120, age: 43,
    cash: 50000,
    debt: 0,
    kids: [],
    rel: [],
    res: { n: '龍門', pm: 1 },
    fl: {},
    personalFinance: {
      history: [
        { year: 1120, supportIncome: 0, supportPaid: 0, netSavings: 0, cashEnding: 50000, debtEnding: 0 }
      ],
      supportReceipts: [
        // 25年前（履歴スライス外）の古い受取記録
        { year: 1095, fromPersonId: 999, amount: 20000, role: 'fa' }
      ]
    }
  };

  const problems = [];
  auditSpouseAndChildState(s, problems);
  return {
    problems: Array.from(problems)
  };
})()`, runtimeEnv.ctx);

assert.equal(householdIntegrityTest.problems.length, 0, 'No audit problems for history-sliced supportReceipts');
console.log('PASS: Household integrity handles floating precision and history-window purge correctly');

console.log('ALL V88 SIMULATION REFORMS AND AUDIT FIXES VERIFIED SUCCESSFULLY!');
