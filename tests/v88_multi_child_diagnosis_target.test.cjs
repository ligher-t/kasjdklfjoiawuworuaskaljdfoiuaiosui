'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');

const {ctx} = context(path.resolve(__dirname, '..'));
const inspect = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())', ctx));

setup(ctx, {id:'two-child-diagnosis',seed:193111,region:'ウルサス',age:35});
const two = inspect(`
  S.year=1090; S.age=35; S.kids=[
    {id:'child-a',nm:'第一子',by:1080,inf:0,householdStatus:'supported'},
    {id:'child-b',nm:'第二子',by:1083,inf:0,householdStatus:'supported'}
  ];
  const event=EV.find(e=>e.id==='fam_child_inf');
  const initial={eligible:elig(event,S,tags(S)),target:childForEvent(S,event.id)?.id};
  S.eventRelativeId='child-a';
  ap(event.c[2].o[0][2]);
  S.sn[event.id]=1090;
  const afterFirst={firstInf:S.kids[0].inf,secondInf:S.kids[1].inf,
    firstYear:S.kids[0].infYear,secondYear:S.kids[1].infYear??null,
    target:childForEvent(S,event.id)?.id,
    availableThisYear:elig(event,S,tags(S))};
  S.year=1091;S.age=36;S.eventRelativeId='child-b';
  const beforeSecond=elig(event,S,tags(S));
  ap(event.c[2].o[0][2]);S.sn[event.id]=1091;
  const afterSecond={firstInf:S.kids[0].inf,secondInf:S.kids[1].inf,
    firstYear:S.kids[0].infYear,secondYear:S.kids[1].infYear,
    availableAgain:elig(event,S,tags(S))};
  return {initial,afterFirst,beforeSecond,afterSecond};
`);
assert.equal(two.initial.eligible,true);
assert(['child-a','child-b'].includes(two.initial.target),
  'either still healthy dependent can be selected before the first diagnosis');
assert.deepEqual({
  afterFirst:two.afterFirst,beforeSecond:two.beforeSecond,afterSecond:two.afterSecond
},{
  afterFirst:{firstInf:1,secondInf:0,firstYear:1090,secondYear:null,
    target:'child-b',availableThisYear:false},
  beforeSecond:true,
  afterSecond:{firstInf:1,secondInf:1,firstYear:1090,secondYear:1091,availableAgain:false}
},'each dependent child receives one independent diagnosis without a household-wide once lock');

setup(ctx,{id:'pending-exposure-separate-from-diagnosis',seed:193112,region:'ウルサス',age:35});
const pending=inspect(`
 S.year=1090;S.age=35;
 S.kids=[
   {id:'infected',nm:'感染した子',by:1080,inf:1,infYear:1089,householdStatus:'supported'},
   {id:'pending',nm:'曝露検査待ちの子',by:1070,inf:0,exposurePending:1,householdStatus:'supported'}
 ];
 const event=EV.find(e=>e.id==='fam_child_inf');
 const initial=elig(event,S,tags(S));
 const initialTarget=childForEvent(S,event.id)?.id||null;
 S.kids[1].exposurePending=0;
 const afterClear=elig(event,S,tags(S));
 const clearedTarget=childForEvent(S,event.id)?.id||null;
 S.kids[1].householdStatus='independent';
 const afterIndependence=elig(event,S,tags(S));
 return {initial,initialTarget,afterClear,clearedTarget,afterIndependence};
`);
assert.deepEqual(pending,{initial:false,initialTarget:null,
 afterClear:true,clearedTarget:'pending',afterIndependence:false},
 'a child with a pending exposure investigation must not receive an unrelated fresh diagnosis');

console.log('PASS independent child-targeted infection diagnosis, cooldown, and exposure boundaries');
