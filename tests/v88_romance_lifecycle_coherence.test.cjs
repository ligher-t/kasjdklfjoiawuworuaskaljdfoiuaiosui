'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const { context } = require('./support/annual-cases.cjs');
const { ctx: runtimeEnv } = context(root);
runtimeEnv.assert = assert;

console.log('Testing Romance & Marriage Lifecycle Coherence (v88)...');

// Test 1: Scheduled Followup Due Year logic
const scheduledTest = vm.runInContext(`(() => {
  const s = {
    year: 1090,
    sn: { lov: 1089 },
    romance: { stage: 'known', metYear: 1089, yearsKnown: 1 }
  };
  const evFollowup = EV.find(e => e.id === 'romance_followup');
  const due1 = scheduledFollowupDueYear(evFollowup, s);

  s.sn.romance_followup = 1090;
  s.romance.stage = 'dating';
  s.romance.stageSinceYear = 1090;
  s.year = 1091;
  const evFutureTalk = EV.find(e => e.id === 'romance_future_talk');
  const due2 = scheduledFollowupDueYear(evFutureTalk, s);

  s.sn.romance_future_talk = 1091;
  s.romance.stage = 'committed';
  s.romance.stageSinceYear = 1091;
  s.year = 1092;
  const evMarriage = EV.find(e => e.id === 'romance_marriage_choice');
  const due3 = scheduledFollowupDueYear(evMarriage, s);

  return { due1, due2, due3 };
})()`, runtimeEnv);

assert.equal(scheduledTest.due1, 1090, 'romance_followup is scheduled 1 year after lov');
assert.equal(scheduledTest.due2, 1091, 'romance_future_talk is scheduled 1 year after romance_followup');
assert.equal(scheduledTest.due3, 1092, 'romance_marriage_choice is scheduled 1 year after romance_future_talk');
console.log('PASS: Priority scheduled followups for romance chain verified');

// Test 2: after.max boundary eligibility rejection
const eligibilityBoundaryTest = vm.runInContext(`(() => {
  const evFollowup = EV.find(e => e.id === 'romance_followup');
  born({ seed: 8802, by: 1068 });
  S.year = 1092;
  S.age = 24;
  S.sn.lov = 1090;
  S.romance = { id: 'same-romance-partner', stage: 'known', metYear: 1090, yearsKnown: 2 };
  S.eventOutcomes = { lov: { year: 1090, choiceIndex: 0, outcomeIndex: 0, romanceId: 'same-romance-partner' } };
  
  const tagsValid = tags(S);
  const eligibleWithinMax = elig(evFollowup, S, tagsValid);

  // 7 years after lov (> max: 6)
  S.year = 1097;
  S.age = 29;
  const tagsOver = tags(S);
  const rejectionOptions = {};
  const eligibleOverMax = elig(evFollowup, S, tagsOver, {
    onReject: (e, reason) => { rejectionOptions.reason = reason; }
  });

  return {
    eligibleWithinMax,
    eligibleOverMax,
    rejectionReason: rejectionOptions.reason
  };
})()`, runtimeEnv);

assert.equal(eligibilityBoundaryTest.eligibleWithinMax, true, 'romance_followup eligible within max: 6');
assert.equal(eligibilityBoundaryTest.eligibleOverMax, false, 'romance_followup rejected after exceeding max: 6');
assert.equal(eligibilityBoundaryTest.rejectionReason, 'after-dependency', 'Rejection reason is after-dependency');
console.log('PASS: Strict after.max boundary enforcement verified (no 50-year gap possible)');

// Test 3: advanceRomanceLife annual processing and natural expiration
const advanceRomanceTest = vm.runInContext(`(() => {
  // Case A: known expires after 3 years
  const sKnown = {
    year: 1090, age: 25,
    romance: { stage: 'known', metYear: 1087, by: 1065, name: 'テスト相手' },
    relationshipHistory: []
  };
  advanceRomanceLife(sKnown);
  const knownEnded = sKnown.romance === null && sKnown.relationshipHistory.length === 1;
  const knownEnding = sKnown.relationshipHistory[0]?.ending;

  // Case B: dating expires after 5 years
  const sDating = {
    year: 1095, age: 30,
    romance: { stage: 'dating', metYear: 1088, stageSinceYear: 1090, by: 1065, name: '交際相手' },
    fl: { romance_dating: 1 },
    relationshipHistory: []
  };
  advanceRomanceLife(sDating);
  const datingEnded = sDating.romance === null && sDating.fl.romance_dating === 0;

  // Case C: annual yearsKnown counter increment
  const sActive = {
    year: 1091, age: 26,
    romance: { stage: 'dating', metYear: 1090, stageSinceYear: 1090, yearsKnown: 1 },
    relationshipHistory: []
  };
  advanceRomanceLife(sActive);
  const countIncremented = sActive.romance.yearsKnown === 2;

  return { knownEnded, knownEnding, datingEnded, countIncremented };
})()`, runtimeEnv);

assert.ok(advanceRomanceTest.knownEnded, 'Stagnant known romance naturally expires after 3 years');
assert.equal(advanceRomanceTest.knownEnding, '別離', 'Natural expiration recorded as 別離 in relationshipHistory');
assert.ok(advanceRomanceTest.datingEnded, 'Stagnant dating romance naturally expires after 5 years and clears flags');
assert.ok(advanceRomanceTest.countIncremented, 'Annual yearsKnown count is incremented during annual step');
console.log('PASS: advanceRomanceLife natural expiration and aging verified');

// Test 4: Full love marriage transition from romance_marriage_choice
const marriageChoiceTest = vm.runInContext(`(() => {
  born({ seed: 8804, by: 1068 });
  S.year = 1092;
  S.age = 24;
  S.cash = 100000;
  S.debt = 0;
  S.romance = { stage: 'committed', metYear: 1090, stageSinceYear: 1091, name: '恋人', race: { n: 'リーベ' }, by: 1068 };
  S.res = { n: 'ヴィクトリア', pm: 1 };
  S.residenceArrangement = 'independent_rental';
  S.fl.romance_committed = 1;

  // Option 1: Simple wedding ceremony
  const evMarriage = EV.find(e => e.id === 'romance_marriage_choice');
  const choice = evMarriage.c[0]; //ささやかな式を挙げて結婚
  const outcome = choice.o[0];
  ap(outcome[2], S);

  return {
    hasSpouse: !!S.sp,
    spouseName: S.sp?.nm || S.sp?.name,
    marriageType: S.sp?.marriageType,
    romanceCleared: S.romance === null
  };
})()`, runtimeEnv);

assert.ok(marriageChoiceTest.hasSpouse, 'Spouse created from romance_marriage_choice');
assert.equal(marriageChoiceTest.spouseName, '恋人', 'Spouse inherits romance partner name');
assert.equal(marriageChoiceTest.marriageType, '恋愛結婚', 'Spouse marriageType is 恋愛結婚');
assert.ok(marriageChoiceTest.romanceCleared, 's.romance is cleared upon marriage');
console.log('PASS: Full love marriage completion verified');

console.log('ALL v88 Romance & Marriage Lifecycle tests PASS successfully!');
