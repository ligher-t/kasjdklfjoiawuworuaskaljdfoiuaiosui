'use strict';
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const context = require('./support/annual-cases.cjs').context(root).ctx;
context.rd = () => {};

const data = context.window.GAME_DATA;
const event = id => data.EV.find(row => row.id === id);
const setup = (seed, { region = 'ヴィクトリア', home = '固定集落', kind = '小規模な定住地', ecology = '未特定', info = 0.6, hazard = 0.9, year = 1100, age = 30 } = {}) => {
  const regionArg = JSON.stringify(region), homeArg = JSON.stringify(home), kindArg = JSON.stringify(kind), ecologyArg = JSON.stringify(ecology);
  return vm.runInContext(
    `(()=>{born({seed:${seed},by:${year - age},region:${regionArg}});S.age=${age};S.year=${year};S.mo=1;S.res=REG.find(row=>row.n===${regionArg});S.home=${homeArg};S.local={...makeLocality(S.home,S.res.n,undefined,S.year),kind:${kindArg},ecology:${ecologyArg},info:${info},hazard:${hazard}};S.cash=2000000;S.house.cash=2000000;S.fl.disaster_displaced=0;S.fl.war_displaced=0;return S})()`,
    context,
    { timeout: 30000 }
  );
};
const eligible = (row, state) => {
  context.__event = row;
  context.__state = state;
  return vm.runInContext('elig(__event,__state,tags(__state))', context);
};
const applyChoice = (row, state, choiceIndex, outcomeIndex = 0) => {
  const effect = row.c[choiceIndex]?.o[outcomeIndex]?.[2];
  assert(effect, `missing effect for ${row.id}/${choiceIndex}/${outcomeIndex}`);
  context.__state = state;
  context.__effect = effect;
  vm.runInContext('S=__state;ap(__effect);', context, { timeout: 30000 });
};

const warning = event('nat');
const recovery = event('disaster_displacement_after');
const warRecovery = event('displacement_after');
const siestaMove = event('sie_volcano');
assert(warning && recovery && warRecovery && siestaMove, 'catastrophe warning and recovery events are registered');
for (const row of [warning, recovery, siestaMove])
  for (const ref of row.references || []) assert(data.SETTING_SOURCES[ref], `${row.id} missing ${ref}`);

const mobileGoodNotice = setup(879001, { home: '移動都市', kind: '移動都市の居住区', info: 0.8 });
const mobileLateNotice = setup(879002, { home: '移動都市', kind: '移動都市の避難・労働区画', info: 0.35 });
const sargonOasis = setup(879003, { region: 'サルゴン', ecology: '乾燥地・オアシス', info: 0.45 });
const samiWetland = setup(879004, { region: 'サーミ', ecology: '湿地', info: 0.4 });
const siestaBeforeVolcano = setup(879009, { region: 'シエスタ', year: 1096, age: 26 });
const siestaDuringVolcano = setup(879010, { region: 'シエスタ', year: 1097, age: 27 });
siestaDuringVolcano.world = { ...(siestaDuringVolcano.world || {}), events: { ...(siestaDuringVolcano.world?.events || {}), siesta_disaster: true } };
assert(eligible(warning, mobileGoodNotice) && warning.t(mobileGoodNotice).includes('観測報'), 'well-connected mobile-city resident hears the observation report before deciding');
assert(warning.t(mobileLateNotice).includes('列が通路まで延びていた'), 'low information access changes the warning-arrival scene');
assert(warning.t(sargonOasis).includes('水場へ続く道'), 'Sargon dryland settlement uses its locally grounded route');
assert(warning.t(samiWetland).includes('詳しい知らせはまだ来ていなかった'), 'Sami wetland route can receive incomplete warning details');
assert(!warning.t(siestaBeforeVolcano).includes('火山活動'), 'Siesta volcano warning does not appear before its historical timeline event');
assert(warning.t(siestaDuringVolcano).includes('火山活動'), 'the local volcano event is named only after it enters the timeline');
const noRisk = setup(879005, { hazard: 0.1 });
assert.equal(eligible(warning, noRisk), false, 'no warning scene is available without the modeled local hazard threshold');
const alreadyDisplaced = setup(879011);
alreadyDisplaced.fl.war_displaced = 1;
assert.equal(eligible(warning, alreadyDisplaced), false, 'a second displacement cause does not overwrite an active shelter record');

const displaced = setup(879006);
applyChoice(warning, displaced, 0, 0);
assert.deepEqual(
  [displaced.fl.disaster_displaced, displaced.displacement?.status, displaced.displacement?.sinceYear],
  [1, 'shelter', 1100],
  'successful flight records a shelter start year'
);
assert.equal(recovery.show(displaced), false, 'the recovery choice does not appear in the same year as flight');
context.__state = displaced;
assert.equal(vm.runInContext('tags(__state).has("避難長期化")', context), false, 'acute displacement is not mislabeled as long-term');
displaced.year = 1101;
displaced.age++;
assert(eligible(recovery, displaced), 'the disaster recovery route opens after one year in shelter');
assert.equal(vm.runInContext('tags(__state).has("避難長期化")', context), true, 'the long-term tag follows the actual shelter start year');
const aftermathText = recovery.t(displaced);
assert(aftermathText.includes('1100年に避難を始めてから1年が過ぎた') &&
  aftermathText.includes(`${displaced.res.n}で生活している`),
  'the aftermath text follows the recorded displacement year and destination');
displaced.fl.war_displaced = 1;
applyChoice(recovery, displaced, 0, 0);
assert.deepEqual(
  [displaced.fl.disaster_displaced, displaced.fl.war_displaced, displaced.displacement.status],
  [0, 1, 'rebuilt'],
  'catastrophe recovery clears only its own cause flag'
);

const continuedShelter = setup(879007);
applyChoice(warning, continuedShelter, 0, 0);
continuedShelter.year = 1101;
continuedShelter.age++;
applyChoice(recovery, continuedShelter, 1, 1);
assert.deepEqual(
  [continuedShelter.fl.disaster_displaced, continuedShelter.displacement.status],
  [1, 'shelter'],
  'a failed room rental keeps the person displaced'
);
assert(warRecovery.need.includes('war_displaced'), 'the pre-existing recovery event remains specific to war displacement');
assert(warRecovery.c.every(choice => choice.o.every(outcome => !Object.hasOwn(outcome[2]?.fl || {}, 'disaster_displaced'))), 'war recovery never clears the catastrophe flag');

const siestaFailure = setup(879008, { region: 'シエスタ', home: '固定集落', kind: '小規模な定住地', year: 1097, age: 27 });
siestaFailure.mo = 8;
assert(eligible(siestaMove, siestaFailure), 'Siesta relocation notice is available in its researched local window');
applyChoice(siestaMove, siestaFailure, 1, 1);
assert.deepEqual(
  [siestaFailure.fl.disaster_displaced, siestaFailure.displacement?.status, siestaFailure.displacement?.sinceYear],
  [1, 'shelter', 1097],
  'failed relocation creates an actual personal displacement record'
);
siestaFailure.year = 1098;
siestaFailure.age++;
assert(eligible(recovery, siestaFailure), 'the Siesta displacement enters the same individual recovery lifecycle');
const siestaSuccess = setup(879012, { region: 'シエスタ', home: '固定集落', kind: '小規模な定住地', year: 1097, age: 27 });
siestaSuccess.mo = 8;
applyChoice(siestaMove, siestaSuccess, 0, 0);
assert.deepEqual(
  [siestaSuccess.home, siestaSuccess.fl.disaster_displaced, siestaSuccess.displacement?.status],
  ['移動都市', 0, 'rebuilt'],
  'a successful planned move records a completed relocation without active displacement'
);

console.log(JSON.stringify({
  passed: true,
  scope: 'warning reach, locality-specific notice, catastrophe vs war displacement, and recovery timing',
  cases: 11,
  limitations: 'Event outcomes are individual game assumptions; this does not assert regional catastrophe rates or uniform relief systems.'
}, null, 2));
