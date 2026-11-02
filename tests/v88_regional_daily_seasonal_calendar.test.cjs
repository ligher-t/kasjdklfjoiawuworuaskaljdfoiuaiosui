'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');

const cases = [{"id":"daily_higashi_02","region":"極東","months":[3,4,5],"common":true},{"id":"daily_higashi_04","region":"極東","months":[9,10,11],"common":true},{"id":"daily_higashi_09","region":"極東","months":[12,1,2],"common":true},{"id":"daily_higashi_10","region":"極東","months":[6,7,8],"common":true},{"id":"daily_higashi_17","region":"極東","months":[12,1,2],"common":true},{"id":"daily_higashi_30","region":"極東","months":[12,1,2],"common":true},{"id":"daily_higashi_44","region":"極東","months":[9,10,11],"common":false},{"id":"daily_higashi_45","region":"極東","months":[1],"common":false},{"id":"daily_higashi_53","region":"極東","months":[12,1,2],"common":false},{"id":"daily_ursus_02","region":"ウルサス","months":[6,7],"common":true},{"id":"daily_ursus_06","region":"ウルサス","months":[12,1,2],"common":true},{"id":"daily_ursus_07","region":"ウルサス","months":[3,4,5],"common":true},{"id":"daily_ursus_14","region":"ウルサス","months":[12,1,2],"common":true},{"id":"daily_ursus_19","region":"ウルサス","months":[12,1,2],"common":true},{"id":"daily_ursus_21","region":"ウルサス","months":[12,1,2],"common":true},{"id":"daily_ursus_23","region":"ウルサス","months":[12,1,2],"common":true},{"id":"daily_ursus_28","region":"ウルサス","months":[12,1,2],"common":true},{"id":"daily_ursus_33","region":"ウルサス","months":[12,1,2],"common":true},{"id":"daily_ursus_38","region":"ウルサス","months":[3,4,5],"common":true},{"id":"daily_ursus_49","region":"ウルサス","months":[10,11],"common":false},{"id":"daily_ursus_50","region":"ウルサス","months":[12,1],"common":false},{"id":"daily_ursus_59","region":"ウルサス","months":[12,1,2],"common":false},{"id":"daily_sami_05","region":"サーミ","months":[3,4,5],"common":true},{"id":"daily_sami_10","region":"サーミ","months":[3,4,5],"common":true},{"id":"daily_sami_16","region":"サーミ","months":[3,4,5],"common":true},{"id":"daily_sami_20","region":"サーミ","months":[12,1,2],"common":true},{"id":"daily_sami_23","region":"サーミ","months":[12,1,2],"common":true},{"id":"daily_sami_26","region":"サーミ","months":[9,10,11],"common":true},{"id":"daily_sami_29","region":"サーミ","months":[12,1,2],"common":true},{"id":"daily_sami_37","region":"サーミ","months":[12,1,2],"common":true},{"id":"daily_sami_54","region":"サーミ","months":[12,1,2],"common":false},{"id":"daily_sami_55","region":"サーミ","months":[12,1,2],"common":false},{"id":"daily_leithanien_04","region":"リターニア","months":[9,10,11],"common":true},{"id":"daily_leithanien_15","region":"リターニア","months":[9,10,11],"common":true},{"id":"daily_leithanien_27","region":"リターニア","months":[9,10,11],"common":true},{"id":"daily_leithanien_31","region":"リターニア","months":[12,1,2],"common":true},{"id":"daily_leithanien_50","region":"リターニア","months":[3,4,5],"common":false},{"id":"daily_yan_02","region":"炎国","months":[9,10,11],"common":true},{"id":"daily_yan_03","region":"炎国","months":[6,7],"common":true},{"id":"daily_yan_19","region":"炎国","months":[3,4,5],"common":true},{"id":"daily_kazimierz_05","region":"カジミエーシュ","months":[9,10,11],"common":true},{"id":"daily_minos_35","region":"ミノス","months":[6,7,8],"common":true},{"id":"daily_sargon_37","region":"サルゴン","months":[6,7,8],"common":true},{"id":"daily_victoria_05","region":"ヴィクトリア","months":[12,1,2],"common":true},{"id":"daily_victoria_48","region":"ヴィクトリア","months":[9,10,11],"common":false},{"id":"daily_kjerag_16","region":"イェラグ","months":[3,4,5],"common":true}];
const {ctx} = context(path.resolve(__dirname, '..'));
const run = source => vm.runInContext(source, ctx);
const inspect = (id, month) => {
  ctx.TARGET_ID = id;
  ctx.TARGET_MONTH = month;
  return JSON.parse(run(`JSON.stringify((() => {
    S.mo = TARGET_MONTH;
    const event = EV.find(item => item.id === TARGET_ID);
    let rejected = '';
    const eligible = event ? elig(event, S, tags(S), {onReject:(_event, reason) => {rejected=reason;}}) : false;
    return {exists: !!event, months:event?.months, eligible, rejected};
  })())`));
};

for (const item of cases) {
  setup(ctx, {id:'daily-season-'+item.id, seed:980114, region:item.region, age:24});
  run('S.age=24;S.year=1101;S.job=0;S.sn={};S.mo=0;S.h=85;S.k=65;S.p=65;S.cr=65;');
  const allowed = new Set(item.months);
  for (let month=0;month<=12;month++) {
    const actual=inspect(item.id,month);
    assert.equal(actual.exists,true,item.id+' registered');
    assert.deepEqual(actual.months,item.months,item.id+' monthly metadata');
    if (!allowed.has(month)) {
      assert.equal(actual.eligible,false,item.id+' unavailable month '+month);
      assert.equal(actual.rejected,'month',item.id+' rejects for calendar rather than unrelated context');
    } else {
      assert.notEqual(actual.rejected,'month',item.id+' valid calendar month '+month);
      if (item.common) assert.equal(actual.eligible,true,item.id+' common daily event reachable in '+month);
    }
  }
  if (item.common) {
    run('S.sn[TARGET_ID] = S.year - 1;');
    assert.equal(inspect(item.id,item.months[0]).eligible,false,item.id+' retains normal replay cooldown');
  }
}
assert.equal(cases.length,46,'expected selection of seasonal daily events');
console.log('PASS: '+cases.length+' seasonal regional daily event month and cooldown boundaries');
