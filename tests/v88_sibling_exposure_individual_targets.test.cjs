'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');

const {ctx} = context(path.resolve(__dirname, '..'));
const inspect = source => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + source + '})())', ctx));

setup(ctx,{id:'two-sibling-exposures',seed:193200,region:'ウルサス',age:35});
const two = inspect(`
  S.year=1098; S.age=35;
  S.siblings=[
    {id:'sib-a',nm:'第一きょうだい',by:1070,inf:0,contactState:'regular'},
    {id:'sib-b',nm:'第二きょうだい',by:1074,inf:0,contactState:'regular'}
  ];
  S.legacySiblingCount=0;
  const e=EV.find(x=>x.id==='family_sibling_exposure');
  const first=siblingForEvent(S,e.id)?.id;
  const initiallyEligible=elig(e,S,tags(S));
  S.eventRelativeId=first;
  ap(e.c[2].o[0][2]); // Wait for test: pending exposure for the first sibling.
  S.sn[e.id]=1098;
  const firstAfter=S.siblings.find(x=>x.id===first);
  const afterFirst={year:firstAfter.exposureYear,pending:firstAfter.exposurePending,
    globalFlag:S.fl.sibling_exposure_seen,eligible:elig(e,S,tags(S)),
    next:siblingForEvent(S,e.id)?.id};
  S.year=1099; S.age=36;
  const next=siblingForEvent(S,e.id)?.id;
  const secondEligible=elig(e,S,tags(S));
  S.eventRelativeId=next;
  ap(e.c[2].o[0][2]);
  S.sn[e.id]=1099;
  const afterSecond={eligible:elig(e,S,tags(S)),
    outstanding:S.siblings.filter(x=>x.exposurePending).map(x=>x.id).sort(),
    next:siblingForEvent(S,e.id)?.id||null};
  S.year=1100;S.age=37;
  S.eventRelativeId=first;
  ap({sibExposureClose:1}); // A closed investigation is still a past exposure.
  const afterClose={eligible:elig(e,S,tags(S)),
    next:siblingForEvent(S,e.id)?.id||null,
    firstYear:S.siblings.find(x=>x.id===first).exposureYear};
  return {first,initiallyEligible,afterFirst,secondEligible,afterSecond,afterClose};
`);
assert.equal(two.initiallyEligible,true);
assert(['sib-a','sib-b'].includes(two.first));
assert.equal(two.afterFirst.year,1098);
assert.equal(two.afterFirst.pending,1);
assert.equal(two.afterFirst.globalFlag,1);
assert.equal(two.afterFirst.eligible,false,'one incident per year remains guarded');
assert.notEqual(two.afterFirst.next,two.first);
assert.equal(two.secondEligible,true,'a different sibling can suffer a separate incident next year');
assert.deepEqual(two.afterSecond,{eligible:false,outstanding:['sib-a','sib-b'],next:null});
assert.deepEqual(two.afterClose,{eligible:false,next:null,firstYear:1098},
  'closing a prior exposure investigation must not create a fresh first-exposure incident');

setup(ctx,{id:'infected-sibling-does-not-block-another',seed:193201,region:'ウルサス',age:35});
const mixed = inspect(`
  S.year=1099; S.age=35;
  S.siblings=[
    {id:'infected',nm:'既感染きょうだい',by:1068,inf:1,infKnown:1,contactState:'regular'},
    {id:'healthy',nm:'未感染きょうだい',by:1073,inf:0,contactState:'regular'}
  ];
  S.legacySiblingCount=0;
  S.fl.sibling_exposure_seen=1;
  S.sn.family_sibling_exposure=1097;
  const e=EV.find(x=>x.id==='family_sibling_exposure');
  const eligible=elig(e,S,tags(S));
  const target=siblingForEvent(S,e.id)?.id;
  S.eventRelativeId=target;
  ap(e.c[0].o[0][2]); // The diagnosis affects the healthy sibling only.
  return {eligible,target,olderInfYear:S.siblings[0].infYear||null,
    healthyInf:S.siblings[1].inf,healthyYear:S.siblings[1].infYear,
    protagonistInf:S.inf||0,next:siblingForEvent(S,e.id)?.id||null};
`);
assert.deepEqual(mixed,{eligible:true,target:'healthy',olderInfYear:null,
  healthyInf:1,healthyYear:1099,protagonistInf:0,next:null},
  'a sibling already infected and the historical household flag cannot suppress another sibling');
console.log('PASS sibling-specific exposure, global flag preservation and individual diagnosis');
