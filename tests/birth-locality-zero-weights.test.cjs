'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const { ctx } = require('./support/annual-cases.cjs').context(root);

const localityZeroReview = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  const initial = birthLocalityWeightPool([{n:'A',w:60},{n:'B',w:40}],{A:0,B:30});
  const fallback = birthLocalityWeightPool([{n:'A',w:60},{n:'B',w:40}],{A:0,B:0});
  const uniform = birthLocalityWeightPool([{n:'A',w:0},{n:'B',w:0}],{A:0,B:0});
  const oldRandom = DEBUG_RANDOM;
  let draws = 0;
  const invalid = [];
  try {
    for (const home of ['移動都市','固定集落'])
      for (let wealth=0;wealth<5;wealth++)
        for (const infected of [false,true])
          for (const displaced of [false,true]) {
            const forbidden = [];
            if (home === '移動都市') {
              if (displaced || (infected && wealth < 4)) forbidden.push('移動都市の居住区');
              if (!displaced && !infected && wealth >= 3) forbidden.push('移動都市の避難・労働区画');
            } else {
              if (displaced || (infected && wealth < 4)) forbidden.push('固定都市の街区');
              if (!displaced && !infected && wealth >= 3) forbidden.push('辺境・移動の多い居住地');
            }
            for (let i=0;i<128;i++) {
              DEBUG_RANDOM = () => (i+0.5)/128;
              const chosen = pickBirthLocalityKind(home,{st:0.8},{i:wealth},
                {fa:{inf:infected},mo:{inf:false}},
                {kind:displaced?'避難・離散した世帯で育つ':'両親と暮らす'});
              draws++;
              if (forbidden.includes(chosen)) invalid.push({home,wealth,infected,displaced,chosen});
            }
          }
  } finally { DEBUG_RANDOM = oldRandom; }
  return {initial,fallback,uniform,draws,invalid};
})()`,ctx)));
assert.deepEqual(localityZeroReview.initial,[{n:'A',w:0},{n:'B',w:30}],
  'explicit zero weights remain excluded');
assert.deepEqual(localityZeroReview.fallback,[{n:'A',w:60},{n:'B',w:40}],
  'an impossible all-zero override returns to the authored base distribution');
assert.deepEqual(localityZeroReview.uniform,[{n:'A',w:1},{n:'B',w:1}],
  'even an all-zero base table remains drawable');
assert.equal(localityZeroReview.draws,5120);
assert.deepEqual(localityZeroReview.invalid,[],'zero-weight birth localities are never selected');

console.log('birth-locality-zero-weights: 5120 directed draws and fallbacks passed');
