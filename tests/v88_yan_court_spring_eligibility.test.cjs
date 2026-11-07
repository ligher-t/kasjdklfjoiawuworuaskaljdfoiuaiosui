'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');

const {ctx} = context(path.resolve(__dirname, '..'));
const run = source => vm.runInContext(source, ctx);
const sample = month => {
  ctx.TEST_MONTH = month;
  return JSON.parse(run(`JSON.stringify((() => {
    S.mo = TEST_MONTH;
    const event = EV.find(item => item.id === 'car_yan_court_entry');
    return {found: !!event, months: event?.months, eligible: event ? elig(event, S, tags(S)) : false};
  })())`));
};

setup(ctx, {id: 'yan-court-spring', seed: 741102, region: '炎国', age: 24});
run('S.age=24; S.year=1098; S.job=0; S.k=60; S.fl.retired=0; S.sn={};');
assert.equal(sample(3).found, true, 'Yan court examination event exists');
assert.deepEqual(sample(3).months, [3, 4, 5], 'spring is March through May');
for (const month of [3, 4, 5]) {
  assert.equal(sample(month).eligible, true, `exam may be offered in month ${month}`);
}
for (const month of [0, 1, 2, 6, 7, 12]) {
  assert.equal(sample(month).eligible, false, `exam may not be offered in month ${month}`);
}
run('S.mo=4; S.sn.car_yan_court_entry=1097;');
assert.equal(sample(4).eligible, false, 'existing three-year cooldown still applies');
run('delete S.sn.car_yan_court_entry; S.res.n="龍門";');
assert.equal(sample(4).eligible, false, 'the spring gate does not bypass the region gate');
console.log('PASS: Yan court examination spring month, region and cooldown boundaries');
