'use strict';
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const document = {
  currentScript: null,
  getElementById() { return { hidden: false, textContent: '', value: '', dataset: {}, innerHTML: '', insertAdjacentHTML() {} }; },
  querySelectorAll() { return []; }
};
const context = {
  window: {}, document, console,
  localStorage: { getItem() { return null; }, setItem() {} },
  Date, setTimeout() {}, setInterval() {}
};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root), context, { timeout: 15000 });
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0], context, { timeout: 15000 });
context.rd = () => {};

const data = context.window.GAME_DATA;
const event = id => data.EV.find(row => row.id === id);
const ids = [
  'life_kazdel_displaced_start',
  'life_kazdel_displaced_daily',
  'life_kazdel_displaced_contacts',
  'life_kazdel_return_appeal',
  'life_kazdel_displaced_review',
  'life_kazdel_displaced_paused_review',
  'life_kazdel_displaced_next_generation',
  'life_kazdel_displaced_legacy'
];
const events = ids.map(event);
assert(events.every(Boolean), 'all long-term Kazdel displacement events must be registered');
assert.equal(events.reduce((sum, row) => sum + row.c.length, 0), 23);
assert(events.every(row => row.c.every(choice => choice.ethics?.reviewed && choice.ethics.policyVersion === 87)));
for (const row of events) for (const ref of row.references || []) assert(data.SETTING_SOURCES[ref], `${row.id} missing ${ref}`);
assert.equal(events[0].once, true);
assert.equal(events[1].cd, 4, 'regional livelihood routine should recur over years');
assert.equal(events[2].cd, 5, 'correspondence should recur at a slower pace');
assert.equal(events[3].ge.year, 1097, 'the Military Commission return appeal must not appear before its story-era signal');
assert.equal(events[4].after.min, 8, 'long-term reassessment must follow years of resettlement');
assert.equal(events[5].once, true, 'a paused route receives one later review');
assert.equal(events[6].once, true, 'family memory appears once and only when the player has a living child');

const born = (seed, year = 1100, age = 30, region = 'ヴィクトリア') => {
  context.__scenario = null;
  return vm.runInNewContext(
    `(()=>{born({seed:${seed},by:${year - age},region:${JSON.stringify(region)}});S.year=${year};S.age=${age};S.res=REG.find(x=>x.n===${JSON.stringify(region)});return S})()`,
    context,
    { timeout: 30000 }
  );
};
const choiceAvailable = (choice, state) => {
  context.__choice = choice;
  context.__state = state;
  return vm.runInNewContext('ok(__choice.en,__state,tags(__state))', context);
};
const apply = (state, sceneId, choiceIndex, outcomeIndex = 0) => {
  const scene = event(sceneId);
  assert(scene, `missing ${sceneId}`);
  const outcome = scene.c[choiceIndex]?.o[outcomeIndex];
  assert(outcome, `missing outcome ${sceneId}/${choiceIndex}/${outcomeIndex}`);
  context.__state = state;
  context.__effect = outcome[2];
  vm.runInNewContext('S=__state;ap(__effect);', context, { timeout: 30000 });
  return outcome[2];
};
const goal = state => state.lifeRecord?.goals?.find(row => row.id === 'kazdel-displaced-life');
const audit = state => {
  context.__state = state;
  return Array.from(vm.runInNewContext('auditLifeState(__state)', context));
};
const eligible = (scene, state) => {
  context.__event = scene;
  context.__state = state;
  return vm.runInNewContext('elig(__event,__state,tags(__state))', context);
};

const exile = event('kaz_exile');
const afterfall = event('kazdel_afterfall');
assert(exile.c[0].o[0][2].fl.kazdel_displaced_life, 'early successful escape starts a persistent post-displacement life route');
assert(afterfall.c[0].o[0][2].fl.kazdel_displaced_life, 'post-fall relocation starts the persistent life route');
assert(afterfall.c[1].o[0][2].fl.kazdel_displaced_life, 'a temporary settlement after losing the home also starts the route');

const earlyExile = born(871901);
earlyExile.fl.kazdel_left = 1;
assert.equal(events[0].show(earlyExile), true, 'legacy wartime flight flags remain eligible');
const acuteDisplacement = born(871902);
acuteDisplacement.fl.kazdel_displaced_life = 1;
acuteDisplacement.fl.kazdel_displaced = 1;
assert.equal(events[0].show(acuteDisplacement), false, 'long-term routine waits for acute displacement to end');
const kazdelOriginOnly = born(871903, 1100, 30, 'カズデル');
assert.equal(events[0].show(kazdelOriginOnly), false, 'Kazdel birth alone does not imply evacuation');
const legacyMove = born(871904);
legacyMove.moves.push({ year: 1094, from: 'カズデル', to: 'ヴィクトリア' });
assert.equal(events[0].show(legacyMove), true, 'a recorded move from Kazdel is accepted for older saves');
assert.equal(eligible(events[0], legacyMove), true, 'legacy saves without the wartime event log can enter the route');
const inKazdelShelter = born(871907, 1100, 30, 'カズデル');
inKazdelShelter.fl.kazdel_displaced_life = 1;
inKazdelShelter.fl.kazdel_displaced = 0;
assert(events[0].t(inKazdelShelter).includes('故郷の家を離れて'), 'internal displacement is described as leaving home, not leaving Kazdel');

const state = born(871905);
state.fl.kazdel_displaced_life = 1;
state.fl.kazdel_displaced = 0;
state.displacement = { status: 'housed', sinceYear: 1094, origin: 'カズデル', resolvedYear: 1098 };
assert.equal(events[0].show(state), true);
apply(state, 'life_kazdel_displaced_start', 0);
assert.equal(goal(state)?.status, 'active');
assert.equal(events[1].show(state), true);
assert.equal(events[2].show(state), true);
assert.equal(events[3].show(state), true, 'the canonical return message is visible after 1097 without implying a safe return');
const childState = born(871908, 1100, 8);
const adultState = born(871909, 1100, 16);
assert.equal(choiceAvailable(events[1].c[0], childState), false, 'work-schedule choice is hidden from a child');
assert.equal(choiceAvailable(events[1].c[0], adultState), true, 'work-schedule choice is available at eligible age');

const homeBeforeAppeal = state.home;
apply(state, 'life_kazdel_return_appeal', 1);
assert.equal(state.res.n, 'ヴィクトリア', 'hearing the return appeal must not move the protagonist');
assert.equal(state.home, homeBeforeAppeal, 'the return appeal must not overwrite the current home');
assert.equal(goal(state)?.status, 'active');
assert.equal(events[6].show(state), false, 'no child is invented to receive inherited memories');
state.kids.push({ id: 'child-kazdel-route-test', nm: '検査用の子', by: 1092, age: 8, d: false });
assert.equal(events[6].show(state), true, 'the later family-memory event requires a living child');
apply(state, 'life_kazdel_displaced_next_generation', 0);
assert.equal(state.kids[0].response, undefined, 'the parent’s choice must not invent the child’s reaction');

apply(state, 'life_kazdel_displaced_review', 2);
assert.equal(goal(state)?.status, 'paused');
assert.equal(events[1].show(state), false, 'paused route stops its routine events');
assert.equal(events[5].show(state), true, 'a paused route gets its own later review');
apply(state, 'life_kazdel_displaced_paused_review', 0);
assert.equal(goal(state)?.status, 'active', 'resume restores the life goal');
apply(state, 'life_kazdel_displaced_review', 0);
assert.equal(goal(state)?.status, 'achieved', 'settling in the current country completes only this life goal');
assert.equal(events[7].show(state), true, 'after years, route legacy remains visible after completion');
apply(state, 'life_kazdel_displaced_legacy', 0);
assert.equal(goal(state)?.status, 'achieved', 'recording life history must not reopen the goal');
assert.deepEqual(audit(state), [], 'long-term migration life records must pass state audit');

const unsupported = born(871906);
unsupported.fl.kazdel_displaced_life = 1;
unsupported.fl.kazdel_displaced = 0;
assert(events[0].references.includes('SRC_KAZDEL_DISPLACED_LIFE_MODEL'));
assert(data.SETTING_SOURCES.SRC_KAZDEL_RETURN_APPEAL.note.includes('保証しない'));
assert(data.SETTING_SOURCES.SRC_KAZDEL_DISPLACED_LIFE_MODEL.note.includes('典型例ではない'));
assert.equal(unsupported.res.n, 'ヴィクトリア');

console.log(JSON.stringify({
  passed: true,
  events: events.length,
  choices: events.reduce((sum, row) => sum + row.c.length, 0),
  legacySaveFlightAndMoveDetected: true,
  acuteAndLongTermPhasesSeparated: true,
  workContactsAndReturnAppealConnected: true,
  familyMemoryRequiresLivingChild: true,
  pauseResumeCompletionAndLegacy: true,
  noForcedReturnOrInventedFamilyResponse: true,
  lifeAuditClear: true
}, null, 2));
