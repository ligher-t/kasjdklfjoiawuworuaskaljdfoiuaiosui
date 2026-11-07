'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');

const cases = [
  {
    "id": "choice_higashi_05",
    "region": "極東",
    "months": [
      12,
      1,
      2
    ]
  },
  {
    "id": "choice_iberia_04",
    "region": "イベリア",
    "months": [
      6,
      7,
      8
    ]
  },
  {
    "id": "choice_iberia_06",
    "region": "イベリア",
    "months": [
      9,
      10,
      11
    ]
  },
  {
    "id": "choice_kjerag_05",
    "region": "イェラグ",
    "months": [
      9,
      10,
      11
    ]
  },
  {
    "id": "choice_kjerag_07",
    "region": "イェラグ",
    "months": [
      3,
      4,
      5
    ]
  },
  {
    "id": "choice_laterano_10",
    "region": "ラテラーノ",
    "months": [
      3,
      4,
      5
    ]
  },
  {
    "id": "choice_leithanien_10",
    "region": "リターニア",
    "months": [
      6,
      7
    ]
  },
  {
    "id": "choice_minos_07",
    "region": "ミノス",
    "months": [
      9,
      10,
      11
    ]
  },
  {
    "id": "choice_minos_09",
    "region": "ミノス",
    "months": [
      9,
      10,
      11
    ]
  },
  {
    "id": "choice_sami_03",
    "region": "サーミ",
    "months": [
      12,
      1,
      2
    ]
  },
  {
    "id": "choice_sami_07",
    "region": "サーミ",
    "months": [
      9,
      10,
      11
    ]
  },
  {
    "id": "choice_siesta_06",
    "region": "シエスタ",
    "months": [
      9,
      10,
      11,
      12,
      1,
      2
    ]
  },
  {
    "id": "choice_ursus_02",
    "region": "ウルサス",
    "months": [
      12,
      1,
      2
    ]
  },
  {
    "id": "choice_ursus_10",
    "region": "ウルサス",
    "months": [
      2,
      3
    ]
  },
  {
    "id": "choice_victoria_08",
    "region": "ヴィクトリア",
    "months": [
      12
    ]
  }
];
const {ctx} = context(path.resolve(__dirname, '..'));
const run = src => vm.runInContext(src, ctx);
const inspect = (id,month) => {
  ctx.TARGET_EVENT_ID = id;
  ctx.TARGET_MONTH = month;
  return JSON.parse(run(`JSON.stringify((() => {
    S.mo = TARGET_MONTH;
    const e = EV.find(row => row.id === TARGET_EVENT_ID);
    return {exists: !!e, months: e?.months, available: !!e && elig(e, S, tags(S))};
  })())`));
};

// Calendar seasons in these scenes are an explicit simulation convention.
// This does not assert canonical Terra calendar dates for regional festivals.
for (const {id,region,months} of cases) {
  setup(ctx,{id:'seasonal-'+id,seed:908811,region,age:24});
  run('S.age=24;S.year=1101;S.job=0;S.sn={};S.h=85;S.k=65;S.p=65;S.cr=65;S.fl.retired=0;');
  const wanted = new Set(months);
  for (let month = 0; month <= 12; month++) {
    const actual = inspect(id,month);
    assert.equal(actual.exists,true,id+' exists in the actual event registry');
    assert.deepEqual(actual.months,months,id+' has a defined month range');
    assert.equal(actual.available,wanted.has(month),id+' month '+month);
  }
  run(`S.mo=TARGET_MONTH;S.sn[TARGET_EVENT_ID]=S.year-1;`);
  assert.equal(inspect(id,months[0]).available,false,id+' preserves its cooldown');
}
console.log('PASS: seasonal choice month, unavailable-month and cooldown checks for '+cases.length+' regional events');
