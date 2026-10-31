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
  'life_infected_org_records',
  'life_infected_org_rotation',
  'life_infected_org_recipients',
  'life_infected_org_finance',
  'life_infected_org_privacy',
  'life_infected_org_reentry'
];
const events = ids.map(event);
assert(events.every(Boolean), 'all infected organization operations must be registered');
assert.equal(events.reduce((sum, row) => sum + row.c.length, 0), 19);
assert(events.every(row => row.c.every(choice => choice.ethics?.reviewed && choice.ethics.policyVersion === 87)));
assert(events.every(row => row.references?.length), 'each operational scene must cite canon/context or its explicit game model');
assert.equal(events[0].cd, 4);
assert.equal(events[1].cd, 4);
assert.equal(events[2].cd, 5);
assert.equal(events[3].cd, 5);
assert.equal(events[4].once, true);

const state = vm.runInNewContext("(()=>{born({seed:871801,by:1050,region:'龍門'});S.year=1085;S.age=35;S.res=REG.find(x=>x.n==='龍門');S.biasInfected=0;S.house.cash=1000000;return S})()", context, { timeout: 30000 });
const apply = (sceneId, choiceIndex, outcomeIndex = 0) => {
  const scene = event(sceneId);
  assert(scene, `missing ${sceneId}`);
  const choice = scene.c[choiceIndex];
  const outcome = choice.o[outcomeIndex];
  assert(outcome, `missing outcome ${sceneId}/${choiceIndex}/${outcomeIndex}`);
  context.__state = state;
  context.__effect = outcome[2];
  vm.runInNewContext('S=__state;ap(__effect);', context, { timeout: 30000 });
  return outcome[2];
};
const affiliation = () => state.lifeRecord?.affiliations?.find(row => row.id === 'infected-mutual-aid');
const organization = () => state.lifeRecord?.organizations?.find(row => row.id === 'infected-mutual-aid');
const goal = () => state.lifeRecord?.goals?.find(row => row.id === 'infected-mutual-aid');
const audit = () => {
  context.__state = state;
  return Array.from(vm.runInNewContext('auditLifeState(__state)', context));
};
const auditState = candidate => {
  context.__state = candidate;
  return Array.from(vm.runInNewContext('auditLifeState(__state)', context));
};

apply('life_infected_association_choice', 1);
assert.equal(affiliation()?.status, 'active');
assert.equal(organization()?.status, 'active');
assert.equal(events[0].show(state), true);

const activeBaseline = JSON.parse(JSON.stringify(state));
for (const scene of events.filter(row => row.id !== 'life_infected_org_reentry')) {
  for (const choice of scene.c) {
    for (const outcome of choice.o) {
      const branch = JSON.parse(JSON.stringify(activeBaseline));
      context.__state = branch;
      context.__effect = outcome[2];
      vm.runInNewContext('S=__state;ap(__effect);', context, { timeout: 30000 });
      assert.deepEqual(auditState(branch), [], `${scene.id}/${choice.l} must preserve auditable state`);
    }
  }
}

apply('life_infected_org_records', 0);
assert.equal(organization().policy, '支援人数と費用のみ匿名で記録');
assert(state.lifeRecord.skills.some(row => row.id === 'infected-mutual-aid-ledger'));

apply('life_infected_org_rotation', 2);
assert.equal(affiliation().role, '一般会員・今期の当番なし');
assert.equal(affiliation().status, 'active', 'a duty break must not remove group membership');

apply('life_infected_org_recipients', 1);
assert.equal(organization().policy, '本人が許可した会合情報だけ家族へ共有');

const cashBeforeSupplement = state.house.cash;
apply('life_infected_org_finance', 2);
assert.equal(organization().contributionsTotal, 6500, 'personal supplementary dues must be recorded in the organization ledger');
assert.equal(state.house.cash, cashBeforeSupplement - 1500, 'personal dues must be paid from the protagonist household');

apply('life_infected_org_privacy', 0);
assert.equal(organization().policy, '外部には本人の同意なく名簿・診療日を渡さない');

const rotation = event('life_infected_org_rotation');
context.__state = state;
assert(rotation.show(state), 'active members can see continuing operational decisions');
assert.equal(affiliation().status, 'active', 'the ordinary no-duty choice stays an active member');

const suspended = JSON.parse(JSON.stringify(state));
context.__state = suspended;
context.__effect = event('life_infected_org_rotation').c[3].o[0][2];
vm.runInNewContext('S=__state;ap(__effect);', context, { timeout: 30000 });
assert.equal(suspended.lifeRecord.affiliations.find(row => row.id === 'infected-mutual-aid').status, 'suspended');
assert.equal(event('life_infected_org_records').show(suspended), false, 'suspended members cannot receive active operations');
const paused = suspended;
paused.year += 4;
paused.sn.life_infected_org_rotation = paused.year - 4;
context.__state = paused;
assert.equal(event('life_infected_org_records').show(paused), false, 'paused members cannot receive active operations');
assert.equal(event('life_infected_org_reentry').show(paused), true, 'paused members receive a return/exit review');
assert.equal(vm.runInNewContext('elig(__event,__state,tags(__state))', Object.assign(context, { __event: event('life_infected_org_reentry'), __state: paused })), true,
  'paused affiliation can reach the reentry decision through engine eligibility');
for (const [index, expected] of [[0, 'active'], [1, 'suspended'], [2, 'left']]) {
  const branch = JSON.parse(JSON.stringify(paused));
  context.__state = branch;
  context.__effect = event('life_infected_org_reentry').c[index].o[0][2];
  vm.runInNewContext('S=__state;ap(__effect);', context, { timeout: 30000 });
  assert.equal(branch.lifeRecord.affiliations.find(row => row.id === 'infected-mutual-aid').status, expected);
  assert.deepEqual(auditState(branch), [], `reentry option ${index} must preserve auditable state`);
}
context.__state = paused;
context.__effect = event('life_infected_org_reentry').c[0].o[0][2];
vm.runInNewContext('S=__state;ap(__effect);', context, { timeout: 30000 });
assert.equal(paused.lifeRecord.affiliations.find(row => row.id === 'infected-mutual-aid').status, 'active');
assert.equal(paused.lifeRecord.goals.find(row => row.id === 'infected-mutual-aid').status, 'active', 'returning must resume the paused goal');
assert.equal(event('life_infected_org_records').show(paused), true);

const left = JSON.parse(JSON.stringify(paused));
context.__state = left;
context.__effect = event('life_infected_org_reentry').c[2].o[0][2];
vm.runInNewContext('S=__state;ap(__effect);', context, { timeout: 30000 });
assert.equal(left.lifeRecord.affiliations.find(row => row.id === 'infected-mutual-aid').status, 'left');
assert.equal(event('life_infected_org_records').show(left), false, 'members who left cannot receive active operations');
left.year += 8;
left.sn.life_infected_association_choice = left.year - 8;
context.__state = left;
context.__event = event('life_infected_organization_exit_legacy');
assert.equal(vm.runInNewContext('elig(__event,__state,tags(__state))', context), true,
  'the existing after-exit history follows the new operational exit');

const makeExclusionCrisis = () => vm.runInNewContext(`(()=>{
  born({seed:871902,by:1050,region:'龍門'});
  S.age=35;S.year=1085;S.res=REG.find(row=>row.n==='龍門');S.inf=1;S.fl.dg=1;
  S.house.cash=1000000;
  return S;
})()`, context, { timeout: 30000 });
const applyTo = (candidate, eventId, choiceIndex, outcomeIndex = 0) => {
  context.__state = candidate;
  context.__effect = event(eventId).c[choiceIndex].o[outcomeIndex][2];
  vm.runInNewContext('S=__state;ap(__effect);', context, { timeout: 30000 });
};
const exclusionPauseReview = event('life_infected_exclusion_pause_review');
assert(exclusionPauseReview, 'a founder rejected by the exclusion association needs a later membership decision');
assert.equal(exclusionPauseReview.after.id, 'v87_exclusion_organizer_infected');
assert.equal(exclusionPauseReview.after.min, 3);
assert.equal(exclusionPauseReview.cd, 3);
assert.deepEqual(Array.from(exclusionPauseReview.c, choice => choice.ethics?.intent), [
  'organization-participation', 'defer', 'withdrawal'
]);
const makeRejectedExclusionFounder = (choiceIndex, seed) => {
  const state = makeExclusionCrisis();
  state.randomSeed = seed;
  state.biasInfected = 0;
  applyTo(state, 'life_infected_association_choice', 0);
  context.__state = state;
  vm.runInNewContext('S=__state;recordInfectionPrior(S,"fixture-before-diagnosis");', context, { timeout: 30000 });
  applyTo(state, 'v87_exclusion_organizer_infected', choiceIndex, 1);
  state.sn.v87_exclusion_organizer_infected = state.year;
  assert.equal(state.lifeRecord.affiliations.find(row => row.id === 'infected-exclusion').status, 'suspended');
  return state;
};
const rejectedFounderBranches = [
  makeRejectedExclusionFounder(1, 871903),
  makeRejectedExclusionFounder(2, 871904)
];
for (const state of rejectedFounderBranches) {
  context.__event = exclusionPauseReview;
  context.__state = state;
  assert.equal(exclusionPauseReview.show(state), false, 'the suspended founder cannot reconsider immediately');
  assert.equal(vm.runInNewContext('elig(__event,__state,tags(__state))', context), false,
    'the review is gated until three years after rejection');
  state.year += 2;
  state.age += 2;
  assert.equal(exclusionPauseReview.show(state), false, 'the three-year delay is enforced at two years');
  state.year += 1;
  state.age += 1;
  context.__state = state;
  assert.equal(exclusionPauseReview.show(state), true, 'both rejected founder branches can reconsider after three years');
  assert.equal(vm.runInNewContext('elig(__event,__state,tags(__state))', context), true,
    'the delayed founder review passes the real event eligibility gate');
}
for (const [index, expectedStatus] of ['active', 'suspended', 'left'].entries()) {
  const state = JSON.parse(JSON.stringify(rejectedFounderBranches[0]));
  const biasBefore = state.biasInfected;
  const policyBefore = state.lifeRecord.organizations.find(row => row.id === 'infected-exclusion').policy;
  context.__state = state;
  context.__effect = exclusionPauseReview.c[index].o[0][2];
  vm.runInNewContext('S=__state;ap(__effect);', context, { timeout: 30000 });
  const affiliation = state.lifeRecord.affiliations.find(row => row.id === 'infected-exclusion');
  assert.equal(affiliation.status, expectedStatus, `founder review option ${index} reaches the selected membership state`);
  assert.equal(state.lifeRecord.organizations.find(row => row.id === 'infected-exclusion').status, 'active',
    'the founder leaving or pausing does not decide what the remaining members do');
  assert.equal(state.lifeRecord.organizations.find(row => row.id === 'infected-exclusion').policy, policyBefore,
    'a personal membership decision does not change the association policy');
  assert.equal(state.biasInfected, biasBefore, 'leaving or returning does not force the protagonist to change their beliefs');
  assert.deepEqual(auditState(state), [], `founder review option ${index} must preserve auditable state`);
  if (expectedStatus === 'suspended') {
    state.sn.life_infected_exclusion_pause_review = state.year;
    state.year += 3;
    state.age += 3;
    context.__state = state;
    assert.equal(exclusionPauseReview.show(state), true, 'a continued pause can be reconsidered again after three years');
    assert.equal(vm.runInNewContext('elig(__event,__state,tags(__state))', context), true);
  } else {
    context.__state = state;
    assert.equal(exclusionPauseReview.show(state), false, 'a resolved membership cannot receive another pause review');
  }
}
{
  const crisis = makeExclusionCrisis();
  applyTo(crisis, 'life_infected_association_choice', 0);
  context.__state = crisis;
  vm.runInNewContext('S=__state;recordInfectionPrior(S,"fixture-before-diagnosis");', context, { timeout: 30000 });
  applyTo(crisis, 'v87_exclusion_organizer_infected', 1, 0);
  assert.equal(crisis.lifeRecord.affiliations.find(row => row.id === 'infected-exclusion').status, 'crisis');
  const review = event('life_infected_association_review');
  context.__event = review;
  context.__state = crisis;
  assert.equal(vm.runInNewContext('elig(__event,__state,tags(__state))', context), true,
    'the continuing organizer review must remain reachable while the affiliation is in crisis');
  applyTo(crisis, 'life_infected_association_review', 0);
  assert.equal(crisis.lifeRecord.affiliations.find(row => row.id === 'infected-exclusion').status, 'crisis',
    'maintaining the disputed policy leaves the organizer in an unresolved crisis');
  assert.equal(crisis.lifeRecord.organizations.find(row => row.id === 'infected-exclusion').status, 'active');
  crisis.year += 4;
  crisis.sn.life_infected_association_review = crisis.year - 4;
  context.__event = review;
  context.__state = crisis;
  assert.equal(vm.runInNewContext('elig(__event,__state,tags(__state))', context), true,
    'the recurring governance review must allow another decision after its cooldown');
  assert.deepEqual(auditState(crisis), [], 'continuing a crisis review must preserve auditable state');
}
for (const [choiceIndex, expectedOrganizationStatus] of [[1, 'handed-over'], [2, 'dissolved']]) {
  const crisis = makeExclusionCrisis();
  applyTo(crisis, 'life_infected_association_choice', 0);
  context.__state = crisis;
  vm.runInNewContext('S=__state;recordInfectionPrior(S,"fixture-before-diagnosis");', context, { timeout: 30000 });
  applyTo(crisis, 'v87_exclusion_organizer_infected', 1, 0);
  assert.equal(crisis.lifeRecord.affiliations.find(row => row.id === 'infected-exclusion').status, 'crisis');
  applyTo(crisis, 'life_infected_association_review', choiceIndex);
  assert.equal(crisis.lifeRecord.affiliations.find(row => row.id === 'infected-exclusion').status, 'left',
    'handover or dissolution must close a crisis-status organizer affiliation');
  assert.equal(crisis.lifeRecord.organizations.find(row => row.id === 'infected-exclusion').status, expectedOrganizationStatus);
  context.__event = event('life_infected_association_review');
  context.__state = crisis;
  assert.equal(vm.runInNewContext('elig(__event,__state,tags(__state))', context), false,
    'a completed handover or dissolution must not leave the crisis review eligible');
  assert.deepEqual(auditState(crisis), [], 'crisis exit must preserve an auditable life record');
}

const review = event('life_infected_association_review');
const dissolutionText = review.c[2].o[0][1];
assert.match(dissolutionText, /掲示や帳面を誰が引き取るかも決まらない/);
assert.doesNotMatch(dissolutionText, /排除の札|支援連絡/,
  'the shared dissolution result must not import details belonging to only one organization type');
for (const [choiceIndex, organizationId] of [[0, 'infected-exclusion'], [1, 'infected-mutual-aid']]) {
  for (const [reviewChoice, expectedOrganizationStatus] of [[1, 'handed-over'], [2, 'dissolved']]) {
    const state = makeExclusionCrisis();
    applyTo(state, 'life_infected_association_choice', choiceIndex);
    assert.equal(state.lifeRecord.organizations.find(row => row.id === organizationId).status, 'active');
    applyTo(state, 'life_infected_association_review', reviewChoice);
    assert.equal(state.lifeRecord.organizations.find(row => row.id === organizationId).status, expectedOrganizationStatus,
      `${organizationId} review branch ${reviewChoice} must match the handover/dissolution result`);
    assert.equal(state.lifeRecord.affiliations.find(row => row.id === organizationId).status, 'left');
    assert.deepEqual(auditState(state), [], `${organizationId} handover/dissolution must preserve an auditable life record`);
  }
}

assert.deepEqual(audit(), [], 'organization ledger and life route must pass state audit');
console.log(JSON.stringify({
  passed: true,
  events: events.length,
  choices: events.reduce((sum, row) => sum + row.c.length, 0),
  privacyAndConsentPolicies: true,
  dutyBreakAndPersonalDuesRecorded: true,
  suspendReturnExitLifecycle: true,
  crisisOrganizerHandoverAndDissolution: true,
  crisisReviewCanContinueAndRecur: true,
  rejectedFounderCanReconsider: true,
  afterExitLegacyConnected: true,
  lifeAuditClear: true
}, null, 2));
