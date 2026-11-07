'use strict';
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const nodes = new Map();
const node = id => {
  if (!nodes.has(id))
    nodes.set(id, {
      id, hidden: false, value: '', textContent: '', innerHTML: '', dataset: {}, style: {}, children: [],
      classList: { toggle() {}, add() {}, remove() {} }, setAttribute() {}, append() {}, appendChild() {},
      replaceChildren() { this.children = []; }, querySelectorAll() { return []; }, addEventListener() {}, click() {}
    });
  return nodes.get(id);
};
const document = {
  currentScript: null,
  getElementById: node,
  querySelectorAll() { return []; },
  addEventListener() {},
  createElement: tag => node('created-' + tag),
  createTextNode: text => ({ textContent: text }),
  activeElement: { tagName: 'BODY' },
  documentElement: { style: { setProperty() {} }, removeAttribute() {}, setAttribute() {} },
  head: { appendChild() {} }
};
const context = {
  window: require('./support/annual-cases.cjs').mockBrowserWindow(), document, console, Date,
  localStorage: { getItem() { return null; }, setItem() {} },
  setTimeout() {}, setInterval() {}, alert() {}, confirm() { return true; }
};
const runtime = require('../tools/runtime.cjs');
vm.runInNewContext(runtime.readData(root), context, { timeout: 30000 });
vm.runInNewContext(runtime.readEngine(root), context, { timeout: 30000 });
const run = (job, flags, warModifier = null) => JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  HL = 1; AU = 'r'; STAT.ev = {}; STAT.op = {}; STAT.choiceMonths = new Set();
  born({ seed: 871093, by: 1068, region: 'カズデル' });
  S.year = 1093; S.age = 25; S.job = ${job};
  Object.assign(S.fl, ${JSON.stringify(flags)});
  if (${JSON.stringify(warModifier)} !== null)
    S.res.dm = { ...S.res.dm, '戦死・戦争被害': ${JSON.stringify(warModifier)} };
  S.world.events.kazdel_civil_war = 1092;
  const rows = D(S);
  return rows.find(row => row.c === '戦闘職務中の死亡' || row.c === '戦争に伴う民間人死亡');
})()`, context, { timeout: 30000 })));

const formerConscript = run(0, { conscripted: 1 });
const civilian = run(0, {});
const veteran = run(0, { veteran: 1 });
const conscriptOnDuty = run(4, { conscripted: 1 });
const logisticsOnDuty = run(14, { conscripted: 1 });

assert.equal(formerConscript.c, '戦争に伴う民間人死亡', 'past conscription alone is not current combat duty');
assert.equal(civilian.c, '戦争に伴う民間人死亡');
assert.equal(veteran.c, '戦争に伴う民間人死亡', 'past service alone does not assert death during a battle');
assert.equal(conscriptOnDuty.c, '戦闘職務中の死亡', 'current guard/mercenary work is modeled as active war duty');
assert.equal(logisticsOnDuty.c, '戦闘職務中の死亡', 'current military logistics work is modeled as active war duty');
assert.equal(formerConscript.p, civilian.p, 'a discharged conscription flag does not retain the active-duty multiplier');
assert(Math.abs(veteran.p / civilian.p - 1.4 / 0.45) < 1e-9, 'veteran exposure weighting remains separate from current duty');
assert(Math.abs(conscriptOnDuty.p / civilian.p - (2 * 2) / 0.45) < 1e-9, 'active war occupation and job risk retain their multipliers');
const baseKazdelWarModifier = vm.runInContext(
  "REG.find(region => region.n === 'カズデル').dm['戦死・戦争被害']", context
);
const regionalWarAdjusted = run(0, {}, baseKazdelWarModifier * 1.5);
assert(Math.abs(regionalWarAdjusted.p / civilian.p - 1.5) < 1e-9,
  'Kazdel regional war modifier scales the matching civilian war-death cause');
for (const result of [formerConscript, civilian, veteran]) {
  assert(result.l.every(text => !/避難の途中|街区が戦闘|生活圏に及び/.test(text)), 'civilian outcome does not invent local combat or evacuation');
}
assert(conscriptOnDuty.l.some(text => /任務中.*戦闘/.test(text)), 'active duty narrative is tied to the current occupation');

const dieAndRead = ({ region, city, year, flag = null, flagYear = year, cause, month = 0 }) => {
  const source = `(() => {
    HL = 1; AU = 'r'; STAT.ev = {}; STAT.op = {}; STAT.choiceMonths = new Set();
    born({ seed: 871094, by: 1068, region: ${JSON.stringify(region)} });
    S.year = ${year}; S.age = ${year - 1068}; S.mo = ${month};
    S.local.city = ${JSON.stringify(city)};
    if (${JSON.stringify(city)} != null) { S.home = '移動都市'; S.local.kind = SIM_TABLES.locality.mobile[0].n; }
    if (${JSON.stringify(flag)} != null) S.world.events[${JSON.stringify(flag)}] = ${flagYear};
    if (!S.mo) S.mo = worldPressureDeathMonth(S, ${JSON.stringify(cause)}) || 0;
    die(${JSON.stringify(cause)}, '検査用の死亡記録', ${month ? 'null' : "S.mo ? 'pressure-window-sample' : null"});
    return { month: S.mo, detail: S.deathProcess, errors: auditLifeState(S) };
  })()`;
  return JSON.parse(JSON.stringify(vm.runInNewContext(source, context, { timeout: 30000 })));
};
const chernobogDeath = dieAndRead({
  region: 'ウルサス', city: 'チェルノボーグ', year: 1096,
  flag: 'chernobog_incident', cause: '戦争に伴う民間人死亡'
});
assert.equal(chernobogDeath.month, 12, 'the 1096 annual death is placed inside the December incident window');
assert.equal(chernobogDeath.detail.month, chernobogDeath.month, 'the detail records the finalized death month');
assert.equal(chernobogDeath.detail.monthBasis, 'pressure-window-sample');
assert.equal(chernobogDeath.detail.note,'死亡月の詳細は未記録。','display keeps a short uncertainty label');
assert(chernobogDeath.detail.modelNote.includes('正確な死亡月を確定しない'));
assert.deepEqual(chernobogDeath.detail.warModelContext.pressureIds, ['chernobog_incident']);
assert.equal(chernobogDeath.detail.warModelContext.city, 'チェルノボーグ');
assert(chernobogDeath.detail.warModelContext.basis.includes('個人が現地'), 'regional model inputs do not claim direct presence');
assert.deepEqual(chernobogDeath.errors, [], 'new death-process context passes the state audit');

const kazdelDeath = dieAndRead({
  region: 'カズデル', city: null, year: 1093, flagYear: 1092,
  flag: 'kazdel_civil_war', cause: '戦争に伴う民間人死亡'
});
assert.equal(kazdelDeath.detail.month, kazdelDeath.month);
assert.equal(kazdelDeath.detail.monthBasis, 'annual-month-unknown');
assert.equal(kazdelDeath.month, 0, 'an annual death without a dated scene has no invented month');
assert.equal(kazdelDeath.detail.note,'死亡月の詳細は未記録。','an assigned annual month is not presented as a precise date');
assert(kazdelDeath.detail.modelNote.includes('死亡月は特定していない'));
assert.deepEqual(kazdelDeath.detail.warModelContext.pressureIds, ['kazdel_civil_war']);
assert.equal(kazdelDeath.detail.warModelContext.city, null, 'unknown city stays unknown in the recorded cause context');
assert.deepEqual(kazdelDeath.errors, []);

const currentMonthDeath = dieAndRead({
  region: 'ウルサス', city: null, year: 1096,
  cause: '急病（前兆の乏しい急変）', month: 5
});
assert.equal(currentMonthDeath.detail.month, 5);
assert.equal(currentMonthDeath.detail.monthBasis, 'current-calendar-month');
assert.deepEqual(currentMonthDeath.errors, []);

const corruptedDeath = JSON.parse(JSON.stringify(chernobogDeath.detail));
corruptedDeath.month = corruptedDeath.month === 12 ? 11 : 12;
vm.runInNewContext('S.deathProcess = ' + JSON.stringify(corruptedDeath), context);
assert(vm.runInNewContext('auditLifeState(S)', context).some(problem => problem.includes('死亡過程')),
  'state audit detects a death month that differs from the finalized life state');
vm.runInNewContext('delete S.deathProcess', context);
assert(vm.runInNewContext('auditLifeState(S)', context).some(problem => problem.includes('死亡過程の記録がない')), 'a dead current state must include its versioned death-process record');
console.log(JSON.stringify({
  passed: true,
  formerConscriptsClassifiedByCurrentWork: true,
  veteranWeightingPreserved: true,
  civilianNarrativeAvoidsUnrecordedLocalExposure: true,
  activeDutyNarrativeTiedToOccupation: true,
  deathMonthAndWarContextRecorded: true,
  unknownCityPreserved: true,
  deathProcessStateAudit: true,
  currentDeathRecordRequired: true
}, null, 2));
