'use strict';

const assert = require('node:assert/strict'),
  path = require('node:path'),
  vm = require('node:vm'),
  root = path.resolve(__dirname, '..'),
  { context, setup } = require('./support/annual-cases.cjs'),
  { ctx } = context(root);

setup(ctx, { id: 'columbia-tech-safety', seed: 905141, region: 'クルビア', age: 30 });
const state = vm.runInContext('S', ctx),
  data = vm.runInContext('window.GAME_DATA', ctx),
  event = id => data.EV.find(row => row.id === id),
  eligibility = scene => {
    ctx.__state = state;
    ctx.__event = scene;
    return vm.runInContext('elig(__event, __state, tags(__state))', ctx);
  },
  apply = (sceneId, choice, outcome = 0) => {
    const effect = event(sceneId).c[choice].o[outcome][2];
    ctx.__state = state;
    ctx.__effect = effect;
    ctx.__sceneId = sceneId;
    ctx.__choiceLabel = event(sceneId).c[choice].l;
    vm.runInContext(
      `(() => {
        S = __state;
        const previous = TRACE_RESOLUTION;
        TRACE_RESOLUTION = { kind: 'choice', id: __sceneId, label: __choiceLabel };
        try { ap(__effect); } finally { TRACE_RESOLUTION = previous; }
      })()`,
      ctx,
      { timeout: 30000 }
    );
    return effect;
  },
  advance = years => {
    state.year += years;
    state.age += years;
    state.mo = 1;
  };

const safety = event('col_tech_safety_review'),
  aftermath = event('col_tech_safety_aftermath'),
  roleReview = event('col_tech_role_review'),
  sources = vm.runInContext('SETTING_SOURCES', ctx),
  source = sources.SRC_COLUMBIA_TECH_SAFETY_MODEL;
assert(safety && aftermath && roleReview, 'the Columbia workplace safety sequence must be registered');
assert(source?.kind === 'ゲーム用仮定', 'this individual workplace case must be labeled as a game assumption');
assert([safety, aftermath, roleReview].every(row => row.references.includes('SRC_COLUMBIA_TECH_SAFETY_MODEL')));

const careerStart = event('car'),
  hiringChoice = careerStart.c.findIndex(choice => choice.l.includes('クルビアの研究企業の技師職'));
assert(hiringChoice >= 0, 'the current career-entry path must provide the specific technician role');
apply('car', hiringChoice, 0);
assert.equal(state.job, 7);
assert.equal(safety.show(state), true, 'the safety incident belongs to the active Columbia technician placement');
state.sn.car = state.year - 1;
advance(1);
assert.equal(eligibility(safety), true, 'the workplace incident must follow the actual employment entry');

const cashBeforeReport = state.cash;
apply(safety.id, 0, 0);
assert.equal(state.fl.col_tech_reported, 1, 'the worker records the hazard with the responsible manager');
assert.equal(state.fl.col_tech_safety_case, 1, 'the unresolved workplace case remains open after the initial report');
assert.equal(state.cash, cashBeforeReport, 'reporting alone must not invent compensation or lost wages');
state.sn[safety.id] = state.year;
advance(2);
assert.equal(eligibility(aftermath), true, 'the same workplace case must return after its recorded waiting period');

const cashBeforeTransfer = state.cash,
  transferChoice = aftermath.c.findIndex(choice => choice.l === '担当替えを願い出て、点検・記録の仕事を続ける');
assert(transferChoice >= 0);
apply(aftermath.id, transferChoice);
assert.equal(state.job, 7, 'the player can keep working in a safer assignment');
assert.equal(state.fl.col_tech_safety_closed, 1);
assert.equal(state.fl.col_tech_safety_case, 0);
assert.equal(state.cash, cashBeforeTransfer, 'a task reassignment does not silently change wages');
assert.equal(state.lifeRecord.affiliations.find(row => row.id === 'columbia-technical-work')?.role, '点検・記録担当');

state.sn[aftermath.id] = state.year;
advance(2);
assert.equal(eligibility(roleReview), true, 'the safety decision must connect to later work in the same career');
apply(roleReview.id, 0);
assert.equal(state.workPayBonus, 0.08, 'the later role choice applies its stated individual pay adjustment');
assert.equal(state.fl.col_tech_supervisor, 1);

console.log(JSON.stringify({
  passed: true,
  workplaceCaseHasScopedGameSource: true,
  reportAndTwoYearFollowup: true,
  reassignmentKeepsEmploymentAndWages: true,
  laterRoleAndPayEffectRecorded: true
}, null, 2));
