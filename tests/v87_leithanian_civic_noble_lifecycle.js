'use strict';
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const document = {
  currentScript: null,
  getElementById() {
    return { hidden: false, textContent: '', value: '', dataset: {}, innerHTML: '', insertAdjacentHTML() {} };
  },
  querySelectorAll() {
    return [];
  }
};
const context = {
  window: {},
  document,
  console,
  localStorage: { getItem() { return null; }, setItem() {} },
  Date,
  setTimeout() {},
  setInterval() {}
};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root), context, { timeout: 15000 });
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0], context, {
  timeout: 15000
});
context.rd = () => {};

const data = context.window.GAME_DATA;
const event = id => data.EV.find(row => row.id === id);
const civic = [
  'life_leithanian_civic_entry',
  'life_leithanian_civic_routine',
  'life_leithanian_civic_activity',
  'life_leithanian_civic_later_active',
  'life_leithanian_civic_later_suspended',
  'life_leithanian_civic_after_exit'
].map(event);
const noble = [
  'life_leithanian_noble_household_entry',
  'life_leithanian_noble_household_routine',
  'life_leithanian_noble_household_review',
  'life_leithanian_noble_household_later_active',
  'life_leithanian_noble_household_later_suspended',
  'life_leithanian_noble_household_after_exit'
].map(event);
assert([...civic, ...noble].every(Boolean), 'both Leithanian life routes must be registered');
assert.equal(civic.reduce((sum, row) => sum + row.c.length, 0), 18);
assert.equal(noble.reduce((sum, row) => sum + row.c.length, 0), 18);
assert(civic.every(row => row.c.every(choice => choice.ethics?.reviewed && choice.ethics.policyVersion === 87)));
assert(noble.every(row => row.c.every(choice => choice.ethics?.reviewed && choice.ethics.policyVersion === 87)));
assert.deepEqual(Array.from(civic[0].need), ['国:リターニア']);
assert.equal(civic[0].ge.year, 1078, 'political participation starts after the 1077 regime transition');
assert.equal(civic[1].after.min, 1, 'the political route receives local meeting routines');
assert.equal(civic[1].cd, 4, 'the meeting routine is spaced across years');
assert.equal(civic[2].after.min, 2, 'the first political review waits two years');
assert.equal(civic[3].after.min, 5, 'the active political route has a later review');
assert.equal(civic[4].cd, 3, 'a continued political pause can be reviewed again after three years');
assert.equal(civic[4].once, undefined, 'the suspended political route is repeatable');
assert.deepEqual(Array.from(noble[0].need), ['国:リターニア']);
assert.equal(noble[0].ge.age, 18, 'household duties are chosen by an adult protagonist');
assert.equal(noble[1].after.min, 1, 'household routine follows an actual household role');
assert.equal(noble[1].cd, 4, 'household routine is spaced across years');
assert.equal(noble[4].cd, 3, 'a continued household-duty pause can be reviewed again after three years');
assert.equal(noble[4].once, undefined, 'the suspended household route is repeatable');
assert(!civic.concat(noble).some(row => (row.need || []).some(tag => tag.startsWith('都市:'))), 'routes do not assign a named city');
for (const row of [...civic, ...noble])
  for (const reference of row.references || []) assert(data.SETTING_SOURCES[reference], `${row.id} source ${reference}`);

const baseState = (seed, year = 1090, age = 20) => {
  context.__scenario = null;
  const state = vm.runInNewContext(
    `(()=>{born({seed:${seed},by:${year - age},region:'リターニア'});S.year=${year};S.age=${age};S.res={...(S.res||{}),n:'リターニア'};return S})()`,
    context,
    { timeout: 30000 }
  );
  return state;
};
const civicPostTransition = baseState(871210, 1078, 20);
assert.equal(civic[0].show(civicPostTransition), false, 'the route waits for the local transition flag');
civicPostTransition.world.events.leith_revolution = 1077;
assert.equal(civic[0].show(civicPostTransition), true, 'the local route opens after the transition without prior personal news');
const applyChoice = (state, scene, choiceIndex) => {
  const effect = scene.c[choiceIndex].o[0][2];
  context.__state = state;
  context.__effect = effect;
  vm.runInNewContext('S=__state;ap(__effect);', context, { timeout: 30000 });
  return effect;
};
const affiliation = (state, id) => state.lifeRecord?.affiliations?.find(row => row.id === id);
const goal = (state, id) => state.lifeRecord?.goals?.find(row => row.id === id);
const audit = state => {
  context.__state = state;
  return Array.from(vm.runInNewContext('auditLifeState(__state)', context));
};
const moveToAnotherLocality = state => {
  const origin = { home: state.home, local: structuredClone(state.local) };
  context.__state = state;
  const target = vm.runInNewContext(`(()=>{S=__state;const homes=allowedHomesForRegion(S.res.n),home=homes.find(value=>value!==S.home)||S.home,rows=SIM_TABLES.locality[home==='移動都市'?'mobile':'fixed'],kind=rows.find(row=>home!==S.home||row.n!==S.local.kind)?.n;if(!kind)throw Error('no alternate locality model');return{home,local:makeLocality(home,S.res.n,kind)}})()`, context);
  state.home = target.home;
  state.local = target.local;
  context.__state = state;
  vm.runInNewContext('(()=>{S=__state;ensureLocalityState(S)})()', context);
  return origin;
};
const restoreLocality = (state, origin) => {
  state.home = origin.home;
  state.local = structuredClone(origin.local);
  context.__state = state;
  vm.runInNewContext('(()=>{S=__state;ensureLocalityState(S)})()', context);
};

const nobleEligible = baseState(871201);
nobleEligible.socialPosition = '貴族・アーツ名家';
nobleEligible.socialClass.origin = '貴族・アーツ名家';
nobleEligible.socialClass.originRegion = 'リターニア';
nobleEligible.w.i = 0;
assert.equal(noble[0].show(nobleEligible), true, 'noble origin remains eligible with a precarious current household economy');
const wealthyCommoner = baseState(871202);
wealthyCommoner.socialPosition = '都市の職人・労働世帯';
wealthyCommoner.socialClass.origin = '都市の職人・労働世帯';
wealthyCommoner.socialClass.originRegion = 'リターニア';
wealthyCommoner.w.i = 4;
assert.equal(noble[0].show(wealthyCommoner), false, 'wealth alone does not create noble-family background');
const nobleElsewhere = baseState(871203);
nobleElsewhere.socialPosition = '貴族・アーツ名家';
nobleElsewhere.socialClass.origin = '貴族・アーツ名家';
nobleElsewhere.socialClass.originRegion = 'ヴィクトリア';
assert.equal(noble[0].show(nobleElsewhere), false, 'a different region cannot inherit the Leithanian route');
const oldPatronOnly = baseState(871204);
oldPatronOnly.fl.noble_patron = 1;
oldPatronOnly.socialClass.origin = '都市の職人・労働世帯';
oldPatronOnly.socialClass.originRegion = 'リターニア';
assert.equal(noble[0].show(oldPatronOnly), false, 'legacy music-patronage state does not invent noble birth');

const civicState = baseState(871205);
civicState.world.events.leith_revolution = 1077;
applyChoice(civicState, civic[0], 0);
assert.equal(affiliation(civicState, 'leithanian-district-petition').status, 'active');
assert.equal(goal(civicState, 'leithanian-district-petition').status, 'active');
civicState.year += 2;
civicState.age += 2;
assert.equal(civic[1].show(civicState), true, 'active participation receives regional meeting routines');
applyChoice(civicState, civic[2], 2);
assert.equal(affiliation(civicState, 'leithanian-district-petition').status, 'suspended');
assert.equal(goal(civicState, 'leithanian-district-petition').status, 'paused');
civicState.year += 5;
civicState.age += 5;
assert.equal(civic[4].show(civicState), true, 'suspended political participation can be reviewed later');
applyChoice(civicState, civic[4], 1);
assert.equal(affiliation(civicState, 'leithanian-district-petition').status, 'suspended');
assert.equal(affiliation(civicState, 'leithanian-district-petition').lastChangedYear, civicState.year);
civicState.year += 2;
civicState.age += 2;
assert.equal(civic[4].show(civicState), false, 'a continued pause cannot be reviewed before three years');
civicState.year += 1;
civicState.age += 1;
assert.equal(civic[4].show(civicState), true, 'a continued pause becomes reviewable at the three-year boundary');
applyChoice(civicState, civic[4], 0);
assert.equal(affiliation(civicState, 'leithanian-district-petition').status, 'active');
assert.equal(affiliation(civicState, 'leithanian-district-petition').episodes.length, 1, 'return resumes the same activity period');
assert.deepEqual(audit(civicState), []);

const civicExit = baseState(871206);
civicExit.world.events.leith_revolution = 1077;
applyChoice(civicExit, civic[0], 1);
civicExit.year += 2;
civicExit.age += 2;
applyChoice(civicExit, civic[2], 3);
const civicExitRecord = affiliation(civicExit, 'leithanian-district-petition');
assert.equal(civicExitRecord.status, 'left');
assert.equal(civicExitRecord.episodes[0].endedYear, civicExit.year);
civicExit.year += 10;
civicExit.age += 10;
assert.equal(civic[5].show(civicExit), true, 'an exit has a later personal reflection without claiming the petition succeeded');
assert.equal(civic[3].show(civicExit), false, 'leaving does not return the protagonist to active status');
assert.deepEqual(audit(civicExit), []);

const civicDeclined = baseState(871207);
civicDeclined.world.events.leith_revolution = 1077;
applyChoice(civicDeclined, civic[0], 2);
assert.equal(affiliation(civicDeclined, 'leithanian-district-petition'), undefined, 'declining does not invent membership');
assert.equal(civic[1].show(civicDeclined), false);

const civicRelocation = event('life_leithanian_civic_relocation');
assert(civicRelocation, 'local civic participation must react when its participant moves');
assert.deepEqual(Array.from(civicRelocation.c, choice => choice.ethics?.intent), ['withdrawal', 'defer']);
assert(civicRelocation.c.every(choice => choice.ethics?.reviewed && choice.ethics.policyVersion === 87));
assert.equal(civicRelocation.once, undefined, 'a later move can be handled after returning');
assert.equal(civicRelocation.cd, 3, 'repeated relocation decisions are spaced by three years');
const civicMoved = baseState(871211);
civicMoved.world.events.leith_revolution = 1077;
applyChoice(civicMoved, civic[0], 0);
const civicOrigin = moveToAnotherLocality(civicMoved);
assert.equal(civic[2].show(civicMoved), false, 'local meeting followups stop after moving away');
assert.equal(civic[3].show(civicMoved), false, 'later political reviews stop after moving away');
assert.equal(civicRelocation.show(civicMoved), true, 'the move opens an explicit handover or pause decision');
applyChoice(civicMoved, civicRelocation, 1);
assert.equal(affiliation(civicMoved, 'leithanian-district-petition').status, 'suspended');
restoreLocality(civicMoved, civicOrigin);
civicMoved.year += 3;
civicMoved.age += 3;
assert.equal(civic[4].show(civicMoved), true, 'a suspended local role can be reviewed after returning to its recorded locality');
applyChoice(civicMoved, civic[4], 0);
assert.equal(civic[2].show(civicMoved), true, 'returning resumes local meetings in the original locality');
assert.deepEqual(audit(civicMoved), []);

const nobleState = baseState(871208);
nobleState.socialPosition = '貴族・アーツ名家';
nobleState.socialClass.origin = '貴族・アーツ名家';
nobleState.socialClass.originRegion = 'リターニア';
nobleState.w.i = 0;
assert.equal(noble[0].show(nobleState), true);
const entryEffect = applyChoice(nobleState, noble[0], 1);
assert.equal(entryEffect.cash, undefined, 'noble household membership does not grant wealth');
assert.equal(entryEffect.job, undefined, 'household background does not invent a profession');
assert.equal(nobleState.job, 0, 'arts practice does not assign a career');
assert.equal(affiliation(nobleState, 'leithanian-noble-household').role, '楽譜・アーツ器具の目録と稽古');
nobleState.year += 1;
nobleState.age += 1;
assert.equal(noble[1].show(nobleState), true);
assert.equal(noble[1].c[0].show(nobleState), false, 'arts-family route does not receive the unrelated accounting task');
assert.equal(noble[1].c[1].show(nobleState), true, 'arts-family route receives a matched practice routine');
applyChoice(nobleState, noble[1], 1);
nobleState.year += 2;
nobleState.age += 2;
assert.equal(noble[2].show(nobleState), true);
applyChoice(nobleState, noble[2], 2);
assert.equal(affiliation(nobleState, 'leithanian-noble-household').status, 'suspended');
assert.equal(goal(nobleState, 'leithanian-noble-household').status, 'paused');
nobleState.year += 5;
nobleState.age += 5;
assert.equal(noble[4].show(nobleState), true);
applyChoice(nobleState, noble[4], 1);
assert.equal(affiliation(nobleState, 'leithanian-noble-household').status, 'suspended');
assert.equal(affiliation(nobleState, 'leithanian-noble-household').lastChangedYear, nobleState.year);
nobleState.year += 2;
nobleState.age += 2;
assert.equal(noble[4].show(nobleState), false, 'a continued household-duty pause cannot be reviewed before three years');
nobleState.year += 1;
nobleState.age += 1;
assert.equal(noble[4].show(nobleState), true, 'a continued household-duty pause is reviewable at the three-year boundary');
applyChoice(nobleState, noble[4], 0);
assert.equal(affiliation(nobleState, 'leithanian-noble-household').status, 'active');
assert.equal(affiliation(nobleState, 'leithanian-noble-household').episodes.length, 1, 'returning home resumes the recorded duty period');
assert.deepEqual(audit(nobleState), []);

const nobleExit = baseState(871209);
nobleExit.socialPosition = '貴族・アーツ名家';
nobleExit.socialClass.origin = '貴族・アーツ名家';
nobleExit.socialClass.originRegion = 'リターニア';
applyChoice(nobleExit, noble[0], 0);
nobleExit.year += 2;
nobleExit.age += 2;
applyChoice(nobleExit, noble[2], 3);
assert.equal(affiliation(nobleExit, 'leithanian-noble-household').status, 'left');
assert.equal(noble[3].show(nobleExit), false);
nobleExit.year += 10;
nobleExit.age += 10;
assert.equal(noble[5].show(nobleExit), true, 'ending a household role preserves a later life reflection');
assert.deepEqual(audit(nobleExit), []);

console.log(JSON.stringify({
  passed: true,
  civicEvents: civic.length,
  nobleHouseholdEvents: noble.length,
  recurringRegionalRoutines: true,
  civicJoinPauseReturnExit: true,
  nobleOriginIndependentOfWealth: true,
  nobleRoleDistinctFromPatronageAndCareer: true,
  exitReflectionsAndStateAudits: true
}, null, 2));
