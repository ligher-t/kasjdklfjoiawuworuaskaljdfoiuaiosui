'use strict';
const path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const {cases,context,setup}=require('./support/eligibility-cases.cjs');
const root=path.resolve(__dirname,'..'),{ctx,nodes,storage}=context(root);
for(const scenario of cases){
 setup(ctx,scenario);
 const before=vm.runInContext('JSON.stringify({state:S,world:W,rng:RANDOM_STATE,seed:RANDOM_SEED})',ctx);
 const dom=JSON.stringify([...nodes]),saved=JSON.stringify([...storage]);
 const inspected=Array.from(vm.runInContext('inspectEligibilityTags(S)',ctx));
 assert.equal(vm.runInContext('JSON.stringify({state:S,world:W,rng:RANDOM_STATE,seed:RANDOM_SEED})',ctx),before,scenario.id+' inspection changed state or RNG');
 assert.equal(JSON.stringify([...nodes]),dom,scenario.id+' inspection wrote DOM');
 assert.equal(JSON.stringify([...storage]),saved,scenario.id+' inspection wrote storage');
 assert.deepEqual(Array.from(vm.runInContext('window.TERRA_RULES.services.conditions.inspectTags(S)',ctx)),inspected);
 assert.deepEqual(Array.from(vm.runInContext('[...tags(S)]',ctx)),inspected,scenario.id+' inspection differs from actual eligibility tags');
 vm.runInContext("(()=>{const input=cloneEligibilityInput(S),seen=new Set();function freeze(v){if(!v||typeof v!=='object'||seen.has(v))return;seen.add(v);Object.values(v).forEach(freeze);Object.freeze(v)}freeze(input);const before=JSON.stringify(input);inspectEligibilityTags(input);if(JSON.stringify(input)!==before)throw Error('Frozen input was changed')})()",ctx,{timeout:15000});
}
// Differential contract: every numeric key, normalized state, and RNG must agree.
for (const scenario of cases) {
  setup(ctx,scenario);
  vm.runInContext(`(()=>{
    const keys=['cash','householdCash','householdDebt','debt','investment','net','edu','sch','age','year','month','literacy','biasInfected','biasSarkaz','socialAccess','equity','routes','fare','k','h','p','rl','ar','cr','ob','sc','w','payBonusRoom','kids','sib','access','support','hazard','unknown'];
    for(const key of keys) {
      const before=JSON.parse(JSON.stringify(S)),after=JSON.parse(JSON.stringify(S));
      const rng=RANDOM_STATE;
      const expected=eagerConditionValue(before,key),actual=simulationConditionValue(after,key);
      if(!Object.is(expected,actual)||JSON.stringify(before)!==JSON.stringify(after)||RANDOM_STATE!==rng)throw Error('condition value/state/RNG differs: '+key);
    }
  })()`,ctx,{timeout:15000});
}
console.log('PASS eligibility inspection, frozen inputs, actual tag parity and no state/RNG/DOM/storage changes');
