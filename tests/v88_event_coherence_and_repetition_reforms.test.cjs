'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const { context } = require('./support/presentation-cases.cjs');
const runtimeEnv = context(root);

console.log('Testing Event Coherence, Repetition Limits and Narrative Reforms (v88)...');

// 1. Bolivar choice events coherence & selfCash
const bolivarTest = vm.runInContext(`(() => {
  const ev08 = EV.find(e => e.id === 'choice_bolivar_08');
  const ev09 = EV.find(e => e.id === 'choice_bolivar_09');
  const daily38 = EV.find(e => e.id === 'daily_bolivar_38');

  // Verify intermediate outcome in choice_bolivar_08
  const compromiseOutcome = ev08?.c?.[1]?.o?.[1];
  const selfCashSuccess = ev08?.c?.[1]?.o?.[0]?.[2]?.selfCash;

  // Verify choice_bolivar_09 once constraint & role options
  const bridgeAidChoice = ev09?.c?.find(c => c.intent === 'voluntary-aid');

  return {
    ev08Present: !!ev08,
    ev08Choices: ev08?.c?.length,
    selfCashSuccess,
    compromiseOutcomePresent: !!compromiseOutcome,
    ev09Once: ev09?.once,
    bridgeAidChoicePresent: !!bridgeAidChoice,
    daily38Text: daily38?.t
  };
})()`, runtimeEnv.ctx);

assert.equal(bolivarTest.ev08Present, true, 'choice_bolivar_08 is registered');
assert.ok(bolivarTest.selfCashSuccess > 0, 'choice_bolivar_08 awards selfCash for direct personal wallet');
assert.equal(bolivarTest.compromiseOutcomePresent, true, 'choice_bolivar_08 contains intermediate compromise outcome');
assert.equal(bolivarTest.ev09Once, true, 'choice_bolivar_09 restricted to once in lifetime');
assert.equal(bolivarTest.bridgeAidChoicePresent, true, 'choice_bolivar_09 offers medical/relief support role');
assert.ok(!bolivarTest.daily38Text.includes('丹精込めて育てたトウモロコシの半分'), 'daily_bolivar_38 eliminates personal farmland assumption');
console.log('PASS: Bolivar choices state coherence, intermediate outcomes and objective text verified');

// 2. Columbia robbery age gate and once constraint
const columbiaTest = vm.runInContext(`(() => {
  const evRobbery = EV.find(e => e.id === 'daily_columbia_38');
  const sChild = { age: 6, cash: 20000, res: { n: 'クルビア' } };
  const sAdult = { age: 25, cash: 20000, res: { n: 'クルビア' } };

  return {
    evRobberyPresent: !!evRobbery,
    stages: evRobbery?.st,
    once: evRobbery?.once,
    childEligible: evRobbery?.st?.includes('児童'),
    adultShow: evRobbery?.show ? evRobbery.show(sAdult) : true
  };
})()`, runtimeEnv.ctx);

assert.equal(columbiaTest.evRobberyPresent, true, 'daily_columbia_38 registered');
assert.equal(columbiaTest.childEligible, false, 'Children completely excluded from late-night street robbery');
assert.equal(columbiaTest.once, true, 'daily_columbia_38 restricted to once in lifetime');
console.log('PASS: Columbia street robbery age gate and once constraint verified');

// 3. Higashi taxation and flood defence age gates & cooldowns
const higashiTest = vm.runInContext(`(() => {
  const evTax = EV.find(e => e.id === 'daily_higashi_31');
  const evFlood = EV.find(e => e.id === 'daily_higashi_34');

  return {
    taxChild: evTax?.st?.includes('児童'),
    taxCd: evTax?.cd,
    taxHasCashCheck: typeof evTax?.show === 'function',
    floodChild: evFlood?.st?.includes('児童'),
    floodCd: evFlood?.cd
  };
})()`, runtimeEnv.ctx);

assert.equal(higashiTest.taxChild, false, 'Children excluded from military taxation');
assert.ok(higashiTest.taxCd >= 6, 'Taxation has cooldown of at least 6 years');
assert.equal(higashiTest.taxHasCashCheck, true, 'Taxation checks cash availability before firing');
assert.equal(higashiTest.floodChild, false, 'Children excluded from strenuous flood defence labor');
assert.ok(higashiTest.floodCd >= 8, 'Flood defence has cooldown of at least 8 years');
console.log('PASS: Higashi military levy and flood defence age gates and cooldowns verified');

// 4. Leithanien accident limits & repetition cooldowns
const leithanienTest = vm.runInContext(`(() => {
  const evAccident = EV.find(e => e.id === 'daily_leithanien_29');
  const evFreeze = EV.find(e => e.id === 'daily_leithanien_31');
  const evFall = EV.find(e => e.id === 'daily_leithanien_38');

  return {
    accidentOnce: evAccident?.once,
    freezeCd: evFreeze?.cd,
    fallCd: evFall?.cd
  };
})()`, runtimeEnv.ctx);

assert.equal(leithanienTest.accidentOnce, true, 'Student arts runaway accident restricted to once in lifetime');
assert.ok(leithanienTest.freezeCd >= 5, 'Water pipe freeze has cooldown of at least 5 years');
assert.ok(leithanienTest.fallCd >= 6, 'Severe slip/fall injury has cooldown of at least 6 years');
console.log('PASS: Leithanien accident once-constraint and cooldown controls verified');

// 5. Mental crisis support narrative continuity and chronic management
const mentalCrisisTest = vm.runInContext(`(() => {
  const evMental = EV.find(e => e.id === 'life_mental_crisis_support');
  const sInitial = {
    age: 25, year: 1100, p: 10, rl: 30,
    mortality: { crisis: { status: 'active', consultCount: 0, lastDecisionYear: 1098 } }
  };
  const sRecurring = {
    age: 30, year: 1105, p: 15, rl: 35,
    mortality: { crisis: { status: 'active', consultCount: 2, lastDecisionYear: 1103 } }
  };

  const initialText = typeof evMental?.t === 'function' ? evMental.t(sInitial) : evMental?.t;
  const recurringText = typeof evMental?.t === 'function' ? evMental.t(sRecurring) : evMental?.t;

  return {
    initialText,
    recurringText,
    textsDiffer: initialText !== recurringText,
    mentalCd: evMental?.cd
  };
})()`, runtimeEnv.ctx);

assert.ok(mentalCrisisTest.mentalCd >= 3, 'Mental crisis cooldown expanded to at least 3 years');
assert.equal(mentalCrisisTest.textsDiffer, true, 'Recurring mental crisis adapts text based on past consultation history');
assert.ok(mentalCrisisTest.recurringText.includes('以前の苦しさがまたぶり返し'), 'Recurring text acknowledges past care history');
console.log('PASS: Mental crisis support narrative continuity and recurring history verified');

// 6. Columbia loan assistance realistic intermediate outcome
const columbiaLoanTest = vm.runInContext(`(() => {
  const evLoan = EV.find(e => e.id === 'choice_columbia_08');
  const legalChoice = evLoan?.c?.[0];
  const aidChoice = evLoan?.c?.[1];

  return {
    legalOutcomesCount: legalChoice?.o?.length,
    aidOutcomesCount: aidChoice?.o?.length,
    legalText: legalChoice?.t
  };
})()`, runtimeEnv.ctx);

assert.ok(columbiaLoanTest.legalOutcomesCount >= 3, 'Legal choice has 3 tiers of outcome (success, compromise, retaliation)');
assert.ok(columbiaLoanTest.aidOutcomesCount >= 2, 'Aid choice has 2 tiers of outcome (smooth settlement vs extra fee friction)');
console.log('PASS: Columbia loan choice realistic intermediate outcomes verified');

console.log('ALL V88 EVENT COHERENCE AND REPETITION REFORMS TESTS PASSED!');
