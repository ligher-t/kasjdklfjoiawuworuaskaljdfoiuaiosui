'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const read=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx,{timeout:30000}));
const actual=read(`
 const siestaBlocked=['daily_siesta_01','daily_siesta_07','daily_siesta_09',
  'daily_siesta_13','daily_siesta_19','daily_siesta_47','daily_siesta_50','daily_siesta_51'];
 const bolivarBlocked=['daily_bolivar_39','daily_bolivar_40','daily_bolivar_43'];
 const allowed=['daily_siesta_06','daily_siesta_11','daily_siesta_26','daily_siesta_39',
  'daily_siesta_42','daily_siesta_44','daily_siesta_48','daily_siesta_52',
  'daily_siesta_55','daily_siesta_57','daily_siesta_58',
  'daily_bolivar_44','daily_bolivar_47','daily_bolivar_48',
  'daily_bolivar_50','daily_bolivar_51','daily_bolivar_54'];
 const events=[...siestaBlocked,...bolivarBlocked,...allowed].map(id=>EV.find(e=>e.id===id));
 const result={missing:events.map((e,i)=>!e?[...siestaBlocked,...bolivarBlocked,...allowed][i]:null).filter(Boolean),
   blocked:[...siestaBlocked,...bolivarBlocked].map(id=>isPeacefulLeisureEvent(EV.find(e=>e.id===id))),
   allowed:allowed.map(id=>isPeacefulLeisureEvent(EV.find(e=>e.id===id))),
   catalog:validate()};
 born({seed:159725,by:1060,region:'シエスタ'});
 S.year=1097;S.age=37;S.mo=8;S.cash=800000;
 S.res=REG.find(r=>r.n==='シエスタ');
 S.local={kind:'固定都市の街区',city:'シエスタ'};
 S.world={events:{siesta_disaster:1097}};
 S.educationDecision=null;S.majorEventMonth=null;
 const original=EV.slice(),oldFire=fire,chosen=[];
 try {
   const luxury=original.find(e=>e.id==='daily_siesta_50'),
     care=original.find(e=>e.id==='daily_siesta_11');
   EV.splice(0,EV.length,luxury,care);
   result.crisis=isLocationInCrisis(S);
   result.eligible={luxury:elig(luxury,S,tags(S)),care:elig(care,S,tags(S))};
   fire=e=>chosen.push(e.id);
   slot(7.5/12);
   S.year=1095;S.age=35;S.world={events:{}};
   EV.splice(0,EV.length,luxury);
   result.peace=isLocationInCrisis(S);
   result.peaceEligible=elig(luxury,S,tags(S));
   slot(7.5/12);
   result.delivered=chosen;
 } finally {fire=oldFire;EV.splice(0,EV.length,...original);}
 return result;
`);
assert.deepEqual(actual.missing,[],'all named actual daily events exist');
assert(actual.blocked.every(Boolean),'nonessential leisure is classified without reading prose');
assert(actual.allowed.every(value=>value===false),'emergency work, food, rescue and livelihood stay available');
assert.deepEqual(actual.catalog,[],'all added tags are accepted by the actual catalog');
assert.equal(actual.crisis,true,'1097 Siesta disaster affects a real Siesta resident');
assert.deepEqual(actual.eligible,{luxury:true,care:true},'both daily scenes pass real eligibility before crisis filtering');
assert.equal(actual.peace,false,'before disaster no local crisis is active');
assert.equal(actual.peaceEligible,true,'leisure remains available in peacetime');
assert.deepEqual(actual.delivered,['daily_siesta_11','daily_siesta_50'],
  'real dispatcher suppresses luxury in crisis but preserves ordinary life and peacetime leisure');
console.log('PASS: Siesta volcano and Bolivar civil-war leisure classification and real dispatch');
