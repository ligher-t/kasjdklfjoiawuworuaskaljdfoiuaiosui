'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const annual = require('./support/annual-cases.cjs');
const root = path.resolve(__dirname, '..');
const { ctx, nodes, storage } = annual.context(root);

annual.setup(ctx, { id: 'sys-audit', seed: 906001, region: 'ヴィクトリア', age: 25 });

console.log('--- Test 1: SYS-01 Regional career death failure branches have valid d: [...] ---');
{
  const result = vm.runInContext(`
    const careerEvents = EV.filter(e => e.id && e.id.startsWith("car_"));
    let deathBranchesCount = 0;
    for (const ev of careerEvents) {
      if (!ev.c) continue;
      for (const ch of ev.c) {
        if (!ch.o) continue;
        for (const outcome of ch.o) {
          const effects = outcome[2];
          if (effects && effects.h === -100) {
            deathBranchesCount++;
            if (!effects.d || !Array.isArray(effects.d) || effects.d.length < 2) {
              throw new Error('Missing or invalid d: [...] on event: ' + ev.id);
            }
          }
        }
      }
    }
    deathBranchesCount;
  `, ctx);

  assert.equal(result, 28, 'Expected 28 death branches with valid d: [...] arrays');
  console.log(`Passed Test 1: All ${result} death branches in regional careers have valid d: [cause, detail].`);
}

console.log('--- Test 2: SYS-02 Victoria 1094 coup event constraints ---');
{
  const coup = vm.runInContext(`
    EV.find(e => e.id === 'car_vic_royal_choice_coup');
  `, ctx);

  assert.ok(coup, 'car_vic_royal_choice_coup exists');
  assert.equal(coup.once, true, 'car_vic_royal_choice_coup has once: true');
  assert.ok(coup.le && coup.le.year === 1094, 'car_vic_royal_choice_coup has le: { year: 1094 }');
  console.log('Passed Test 2: Victoria 1094 coup event has once: true and le: { year: 1094 }.');
}

console.log('--- Test 3: SYS-03 Relative name XSS & DOM sanitization ---');
{
  // 1. tpl 置換時のエスケープ確認
  const rendered = vm.runInContext(`
    const testState = {
      ...S,
      nm: '安全な主人公',
      sp: { nm: '<script>alert("xss")</script>' },
      kids: [{ nm: '<b>子</b>', by: 1090, d: null }]
    };
    tpl('{sp}とともに{kid}を見守った。', testState);
  `, ctx);

  assert.ok(!rendered.includes('<script>'), 'tpl output does not contain raw script tag');
  assert.ok(!rendered.includes('<b>'), 'tpl output does not contain raw bold tag');
  assert.ok(rendered.includes('&lt;script&gt;'), 'tpl output properly escapes spouse name');
  assert.ok(rendered.includes('&lt;b&gt;'), 'tpl output properly escapes child name');

  // 2. auditLifeState による不正文字の検知
  const snapshot = vm.runInContext('makeResumeSnapshot()', ctx);
  const badState = JSON.parse(JSON.stringify(snapshot.S));
  badState.sp = { nm: '配偶者<tag>' };
  badState.kids = [{ nm: '子<script>' }];
  badState.par = { fa: { nm: '父<xss>' }, mo: { nm: '母親' } };

  const problems = vm.runInContext(`auditLifeState(${JSON.stringify(badState)})`, ctx);
  assert.ok(problems.includes('配偶者の名前が不正'), 'auditLifeState flags malformed spouse name');
  assert.ok(problems.includes('子どもの名前が不正'), 'auditLifeState flags malformed child name');
  assert.ok(problems.includes('父親の名前が不正'), 'auditLifeState flags malformed father name');

  // 3. normalizeResumeImport による不正親族名の拒否
  const rawSave = {
    format: 'terra-resume-save',
    version: vm.runInContext('SAVE_VERSION', ctx),
    acc: 0,
    sp: 2,
    AU: '',
    log: [],
    W: snapshot.W,
    S: badState
  };

  assert.throws(
    () => vm.runInContext(`normalizeResumeImport(${JSON.stringify(rawSave)})`, ctx),
    /現行版の中断データとして必要な状態が揃っていません|保存状態が現行版の監査に通りません/,
    'import rejects malicious relative name in snapshot'
  );
  console.log('Passed Test 3: Relative name XSS & DOM sanitization verified.');
}

console.log('--- Test 4: SYS-05 Debt limit excess deficit tracking ---');
{
  vm.runInContext(`
    S.cash = 0;
    S.debt = 30000000; // 借入上限に到達
    S.h = 50;
    S.p = 50;
    S.unpaidExpenses = 0;
    delete S.fl.insolvent;

    const baseAmounts = {
      inc: 0,
      baseExpense: 100000,
      tcGross: 0,
      tcTravelPaid: 0,
      coveredTreatmentCost: 0,
      essentialWithCoverage: 0,
      annualInsurance: 0,
      veteranPension: 0,
      childHouseholdIncome: 0,
      spouseHouseholdContribution: 0,
      siblingCareSupportCost: 0,
      siblingCareSupportTravel: 0,
      spouseLivingCost: 0,
      petCost: 0,
      hobbyCost: 0,
      childCost: 0,
      childCareTravel: 0,
      childHousingCost: 0,
      childStudyCost: 0,
      childRemittanceCost: 0,
      divorceChildSupportCost: 0,
      spouseCareCost: 0,
      spouseSeparateSupport: 0,
      spouseContactCost: 0,
      spouseCareTravel: 0,
      adultParentTreatmentCost: 0,
      adultParentTreatmentTravel: 0,
      familyCareCost: 0
    };

    // settleAnnualPersonalCash をシミュレート
    // inc = 0, baseExpense = 100000 (ネット赤字 100,000)
    settleAnnualPersonalCash(S, ANNUAL_SERVICES, baseAmounts, 25);
  `, ctx);

  const stateInsolvent = vm.runInContext('S', ctx);
  assert.equal(stateInsolvent.unpaidExpenses, 100000, 'Unpaid expenses recorded on debt limit excess');
  assert.equal(stateInsolvent.fl.insolvent, 1, 'Insolvent flag set');
  assert.ok(stateInsolvent.flow?.expense?.unfundedDeficit === 100000, 'Annual flow recorded unfunded deficit');

  // 翌年黒字（収入 150000, 支出 100000 -> ネット黒字 50000）で滞納を一部返済
  vm.runInContext(`
    settleAnnualPersonalCash(S, ANNUAL_SERVICES, { ...baseAmounts, inc: 150000 }, 26);
  `, ctx);
  const stateRepaying = vm.runInContext('S', ctx);
  assert.equal(stateRepaying.unpaidExpenses, 50000, 'Unpaid expenses paid down from 100,000 to 50,000');
  assert.equal(stateRepaying.fl.insolvent, 1, 'Insolvent flag remains while unpaid expenses > 0');

  // 翌々年黒字（収入 160000, 支出 100000 -> ネット黒字 60000）で完済
  vm.runInContext(`
    settleAnnualPersonalCash(S, ANNUAL_SERVICES, { ...baseAmounts, inc: 160000 }, 27);
  `, ctx);
  const stateCleared = vm.runInContext('S', ctx);
  assert.equal(stateCleared.unpaidExpenses, 0, 'Unpaid expenses cleared to 0');
  assert.ok(!stateCleared.fl.insolvent, 'Insolvent flag cleared after payoff');
  // 余剰10000は既存の借入金（debt）の返済に充当される
  assert.equal(stateCleared.debt, 30000000 - 10000, 'Remaining surplus after unpaid expense payoff applied to debt repayment');

  console.log('Passed Test 4: Debt limit excess deficit tracking and payoff cycle verified.');
}

console.log('All v88 system audit tests passed successfully!');
