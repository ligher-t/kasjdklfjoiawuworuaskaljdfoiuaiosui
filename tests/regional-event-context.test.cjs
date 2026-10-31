'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname, '..'));
const run = source => vm.runInContext(source, ctx);
const plain = source => JSON.parse(run(`JSON.stringify((()=>{${source}})())`));
const start = (region, age = 24) => setup(ctx, {id:'regional-context', seed:905003, region, age});
// UI drawing is outside these state/condition tests; retain the actual import path.
run(`rd=()=>{};play=()=>{};tab=()=>{};restorePendingChoice=()=>false;`);
const restore = () => assert.equal(run('cont(JSON.parse(JSON.stringify(makeResumeSnapshot())))'), true);

start('クルビア', 12);
run('S.fl.sch=0;S.educationPath=null;S.job=0;S.house.cash=10000000;');
const classes = ['daily_columbia_57','daily_columbia_58','daily_columbia_59','daily_columbia_60'];
for (const id of classes)
  assert.equal(run(`elig(EV.find(e=>e.id===${JSON.stringify(id)}),S,tags(S))`), false, id+' rejects a child outside school');
run(`educationStart(S,'lower',1,'regional-context');`);
for (const id of classes)
  assert.equal(run(`elig(EV.find(e=>e.id===${JSON.stringify(id)}),S,tags(S))`), true, id+' remains reachable for a pupil');
run(`educationEnd(S,'withdrawn','本人が通学を終えた','regional-context');`);
restore();
for (const id of classes)
  assert.equal(run(`elig(EV.find(e=>e.id===${JSON.stringify(id)}),S,tags(S))`), false, id+' stays unavailable after leaving school and restoring');

start('クルビア');
assert.deepEqual(plain(`
  S.home='移動都市';S.local.kind='移動都市の居住区';
  const e=EV.find(e=>e.id==='daily_columbia_45'),urban=elig(e,S,tags(S));
  S.home='固定集落';S.local.kind='小規模な定住地';
  return {urban,rural:elig(e,S,tags(S))};
`), {urban:false,rural:true}, 'rural work requires an actual rural locality');
start('炎国');
assert.deepEqual(plain(`
  const e=EV.find(e=>e.id==='daily_yan_45');
  S.local.city='尚蜀';const elsewhere=elig(e,S,tags(S));
  S.local.city='玉門';return {elsewhere,yumen:elig(e,S,tags(S))};
`), {elsewhere:false,yumen:true}, 'city-specific scenes use the current city');

start('クルビア');
const finance = plain(`
  S.age=24;S.year=S.by+24;S.job=1;S.cash=0;S.house.cash=0;S.debt=0;
  S.residenceArrangement='independent_rental';S.fl.household_separated=1;
  S.priceIndex=1.7;S.res={...S.res,pm:1.4};
  const e=EV.find(e=>e.id==='choice_columbia_10'),c=e.c[0],required=80000*S.res.pm*S.priceIndex;
  const enabled=()=>simulationChoiceStates(e,S,tags(S))[0].enabled;
  const zeroEnabled=enabled();S.cash=required-1;const belowEnabled=enabled();
  S.cash=required;const enoughEnabled=enabled();ap(c.o[1][2]);
  const personal={cash:S.cash,debt:S.debt};
  S.residenceArrangement='family_home_shared_budget';S.fl.household_separated=0;
  S.cash=1000000;S.house.cash=0;S.house.debt=0;const unsupportedByHousehold=enabled();
  S.house.cash=required;const householdEnabled=enabled();ap(c.o[1][2]);
  return {zeroEnabled,belowEnabled,enoughEnabled,personal,unsupportedByHousehold,householdEnabled,
    household:{cash:S.house.cash,debt:S.house.debt},personalCash:S.cash};
`);
assert.equal(finance.zeroEnabled,false,'unfunded investment is disabled');
assert.equal(finance.belowEnabled,false,'the full price-adjusted amount is required');
assert.equal(finance.enoughEnabled,true);
assert(Math.abs(finance.personal.cash)<1e-8);
assert.equal(finance.personal.debt,0,'a fully funded loss must not introduce debt');
assert.equal(finance.unsupportedByHousehold,false,'shared household decisions use the household wallet');
assert.equal(finance.householdEnabled,true);
assert(Math.abs(finance.household.cash)<1e-8);
assert.equal(finance.household.debt,0);
assert.equal(finance.personalCash,1000000,'household spending does not also charge personal money');

start('クルビア');
run('S.job=1;');
for (const id of ['daily_columbia_39','daily_columbia_40','daily_columbia_41','daily_columbia_42','daily_columbia_43'])
  assert.equal(run(`elig(EV.find(e=>e.id===${JSON.stringify(id)}),S,tags(S))`), false, id+' does not invent specialist employment');
run(`S.job=38;applyLifeAffiliation({id:'rhine-lab',title:'ライン生命',kind:'employer',action:'join',role:'研究実習'});`);
assert.equal(run(`elig(EV.find(e=>e.id==='daily_columbia_39'),S,tags(S))`), true);
run(`fire(EV.find(e=>e.id==='daily_columbia_39'),S,tags(S));`);
assert.equal(run(`S.lifeRecord.skills.find(x=>x.id==='job-38').practiceCount`), 1,'research work records the actual occupation skill');
restore();
assert.equal(run(`S.lifeRecord.skills.find(x=>x.id==='job-38').practiceCount`), 1,'the practice survives a same-version round trip');
run(`applyLifeAffiliation({id:'rhine-lab',action:'leave'});`);
assert.equal(run(`elig(EV.find(e=>e.id==='daily_columbia_39'),S,tags(S),{ignoreOccurrence:true})`), false,'former laboratory membership does not permit current lab work');

start('ラテラーノ', 15);
run(`S.r=RACE.find(x=>x.n==='サンクタ');S.fl.gun=0;`);
const personalGunScenes = ['daily_laterano_04','daily_laterano_12','daily_laterano_14','daily_laterano_36','daily_laterano_40'];
for (const id of personalGunScenes)
  assert.equal(run(`elig(EV.find(e=>e.id===${JSON.stringify(id)}),S,tags(S))`), false, id+' requires recorded receipt/training');
run(`ap(EV.find(e=>e.id==='lat_gun').c[0].o[0][2]);`);
restore();
for (const id of personalGunScenes)
  assert.equal(run(`elig(EV.find(e=>e.id===${JSON.stringify(id)}),S,tags(S))`), true, id+' is available after the existing receipt choice and restore');
run(`S.r=RACE.find(x=>x.n==='リーベリ');`);
for (const id of personalGunScenes)
  assert.equal(run(`elig(EV.find(e=>e.id===${JSON.stringify(id)}),S,tags(S))`), false, id+' does not give a non-Sankta their own guardian gun');
assert.equal(run(`ok(EV.find(e=>e.id==='choice_laterano_10').c[0].en,S,tags(S))`), false,'celebration shooting also requires the actual gun route');

const prose = plain(`
  return ['choice_columbia_10','daily_columbia_40','choice_higashi_10','choice_victoria_10']
    .map(id=>EV.find(e=>e.id===id)).filter(Boolean).map(e=>String(e.t));
`);
for (const text of prose)
  assert.doesNotMatch(text,/ニューヨーク風|BSW風|日本刀|大英博物館風/,'world-facing prose does not expose the rejected production comparisons');
console.log('PASS regional school, locality, payment, occupation, guardian-gun and same-version restore boundaries');
