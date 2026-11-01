'use strict';
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const { context } = require('./support/annual-cases.cjs');
const root = path.resolve(__dirname, '..');
const { ctx } = context(root);
ctx.assert = assert;

console.log('Running v87 choice consequences coherence test...');

vm.runInContext(`
  // 1. col_frontier success: Frontier Pioneer (62), dormitory, household separation, school withdrawal
  born({ seed: 871101, by: 1080, region: 'クルビア' });
  S.year = 1098;
  S.age = 18;
  educationStart(S, 'university', 1, 'frontier-test');
  S.debt = 500000;
  S.cash = 30000;
  S.residenceArrangement = 'family_home_shared_budget';
  S.fl.household_separated = 0;

  const event = EV.find(e => e.id === 'col_frontier');
  assert(event, 'col_frontier exists');
  assert(elig(event, S, tags(S)), 'col_frontier eligible for in-debt youth');

  // Choose option 0: 支度金で借金を相殺し、開拓地へ赴く (success branch)
  ap(event.c[0].o[0][2]);

  assert.equal(S.job, 62, 'Job must be Frontier Pioneer (62)');
  assert.equal(S.fl.frontier_contract, 1, 'Frontier contract flag set');
  assert.equal(S.fl.household_separated, 1, 'Household separated flag set');
  assert.equal(S.residenceArrangement, 'independent_rental', 'Residence arrangement set to independent');
  assert.equal(S.fl.sch, 0, 'School flag cleared');
  assert.equal(educationLive(S), false, 'Education path ended');

  // Age 19: family_separation and car must NOT be eligible
  S.year++;
  S.age++;
  const newTags = tags(S);
  const famEvent = EV.find(e => e.id === 'family_separation');
  assert.equal(elig(famEvent, S, newTags), false, 'family_separation must not fire in frontier camp');
  const carEvent = EV.find(e => e.id === 'car');
  assert.equal(elig(carEvent, S, newTags), false, 'car must not fire when employed as pioneer');

  // 2. col_frontier failure: job 0, independent living preserved
  born({ seed: 871102, by: 1080, region: 'クルビア' });
  S.year = 1098;
  S.age = 18;
  educationStart(S, 'vocational', 1, 'frontier-fail-test');
  S.debt = 500000;
  ap(event.c[0].o[1][2]); // failure branch
  assert.equal(S.job, 0, 'Failure branch resets job to 0');
  assert.equal(S.fl.household_separated, 1, 'Household separated flag set on failure branch');
  assert.equal(S.fl.sch, 0, 'School flag cleared on failure branch');

  // 3. Dismissal and closure job clears
  born({ seed: 871103, by: 1080, region: 'ヴィクトリア' });
  S.job = 2; // factory worker
  ap(EV.find(e => e.id === 'choice_victoria_01').c[0].o[1][2]);
  assert.equal(S.job, 0, 'Factory strike dismissal clears job');

  born({ seed: 871104, by: 1080, region: 'クルビア' });
  S.job = 8; // researcher
  ap(EV.find(e => e.id === 'choice_columbia_03').c[1].o[0][2]);
  assert.equal(S.job, 0, 'Whistleblower resignation clears job');

  born({ seed: 871105, by: 1080, region: 'ウルサス' });
  S.job = 14; // army
  ap(EV.find(e => e.id === 'choice_ursus_04').c[0].o[1][2]);
  assert.equal(S.job, 0, 'Army discharge clears job');

  born({ seed: 871106, by: 1080, region: '龍門' });
  S.job = 5; // merchant
  ap(EV.find(e => e.id === 'lon_merchant').c[0].o[1][2]);
  assert.equal(S.job, 0, 'Merchant closure clears job');

  born({ seed: 871107, by: 1080, region: 'ヴィクトリア' });
  S.job = 2; // factory worker
  ap(EV.find(e => e.id === 'earth_persecution_victoria_framed_debt').c[0].o[0][2]);
  assert.equal(S.job, 0, 'Framed debt dismissal clears job');

  // 4. Rhodes Landship room posting
  born({ seed: 871108, by: 1080, region: 'クルビア' });
  S.year = 1098;
  S.age = 18;
  educationStart(S, 'university', 1, 'rhodes-test');
  S.fl.household_separated = 0;
  S.residenceArrangement = 'family_home_shared_budget';
  // Join Rhodes first
  for (const id of ['sr_rhodes_recruitment_contact', 'sr_rhodes_hiring_review']) {
    ap(EV.find(e => e.id === id).c[0].o[0][2]);
  }
  const rhodesPosting = EV.find(e => e.id === 'sr_rhodes_posting_review');
  ap(rhodesPosting.c[0].o[0][2]);
  assert.equal(S.fl.rhodes_landship, 1, 'Rhodes Landship flag set');
  assert.equal(S.residenceArrangement, 'independent_rental', 'Arrangement updated to independent');
  assert.equal(S.fl.household_separated, 1, 'Household separated on landship');
  assert.equal(S.fl.sch, 0, 'School attendance terminated on landship posting');

  // 5. Laterano Exile
  born({ seed: 871109, by: 1080, region: 'ラテラーノ' });
  S.year = 1098;
  S.age = 18;
  S.inf = 1;
  S.ob = 15;
  S.fl.dg = 1;
  if (typeof recordInfectionDiagnosis === 'function') recordInfectionDiagnosis(S, S.year, 'laterano-hospital');
  else if (typeof recordDiagnosis === 'function') recordDiagnosis(S, S.year, 'laterano-hospital');
  educationStart(S, 'vocational', 1, 'exile-test');
  const latExile = EV.find(e => e.id === 'lat_exile');
  ap(latExile.c[0].o[0][2]);
  assert.equal(S.fl.household_separated, 1, 'Household separated on exile');
  assert.equal(S.residenceArrangement, 'independent_rental', 'Arrangement set on exile');
  assert.equal(S.fl.sch, 0, 'School attendance terminated on exile');

  // 6. Matchmaking Marriage
  born({ seed: 871110, by: 1080, region: '龍門' });
  S.residenceArrangement = 'family_home_shared_budget';
  S.fl.household_separated = 0;
  const lov = EV.find(e => e.id === 'lov');
  ap(lov.c[1].o[0][2]); // arranged marriage branch
  assert.equal(S.residenceArrangement, 'spouse_shared', 'Residence set to spouse_shared on marriage');
  assert.equal(S.fl.household_separated, 1, 'Household separated on marriage');
`, ctx);

console.log('PASS: All choice consequences coherence checks passed successfully!');
