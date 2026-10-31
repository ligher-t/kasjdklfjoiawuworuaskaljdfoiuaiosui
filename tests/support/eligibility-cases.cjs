'use strict';
const vm = require('node:vm');
const {createHash} = require('node:crypto');
const cases = [
  {id:'infant',seed:904001,region:'ウルサス',age:0},
  {id:'schoolchild',seed:904002,region:'リターニア',age:8,profile:'school'},
  {id:'student',seed:904003,region:'クルビア',age:17,profile:'school'},
  {id:'workplace',seed:904004,region:'クルビア',age:28,profile:'work'},
  {id:'infection',seed:904005,region:'ヴィクトリア',age:35,profile:'infection'},
  {id:'relocation',seed:904007,region:'ウルサス',age:38,profile:'relocation'},
  {id:'clock-regression',seed:904008,region:'龍門',age:24,profile:'clock'},
  {id:'caregiver',seed:904009,region:'極東',age:45,profile:'care'},
  {id:'elder',seed:904010,region:'リターニア',age:71,profile:'retired'},
  {id:'cash-strain',seed:904011,region:'サルゴン',age:27,profile:'poor'},
  {id:'history',seed:904012,region:'カズデル',age:30,profile:'history'}
];
function context(root) {
  const {ctx,nodes,storage} = require('./annual-cases.cjs').context(root);
  vm.runInContext("HL=1;AU='r';rd=()=>{};STAT.op={};STAT.choiceMonths=new Set();",ctx);
  return {ctx,nodes,storage};
}
function setup(ctx,scenario) {
  ctx.SCENARIO=scenario;
  vm.runInContext(`(()=>{
    const c=SCENARIO;
    born({seed:c.seed,by:1077,region:c.region});
    S.age=c.age;S.year=S.by+c.age;
    if(c.profile==='school'){S.fl.sch=1;S.job=0;S.f=1;S.ep=c.age>12?80:15;}
    if(c.profile==='work'){S.job=7;S.f=2;S.k=65;}
    if(c.profile==='infection'){S.inf=1;S.ob=28;S.fl.dg=1;S.fl.tx=1;S.biasInfected=80;S.biasSarkaz=72;}
    if(c.profile==='relocation'){ensureLocalityState(S);S.res=REG.find(region=>region.n==='ヴィクトリア');S.home=normalizeHomeForRegion(S.home,S.res.n);S.local=makeLocality(S.home,S.res.n);S.job=21;}
    if(c.profile==='clock'){S.year+=5;S.age+=5;ensureLocalityState(S);S.year-=5;S.age-=5;}
    if(c.profile==='care'){S.par.fa.health=24;S.careInclination=80;S.familyCare={target:'fa',startedYear:S.year-2,capacityPlan:'shared',reviewYear:S.year};}
    if(c.profile==='retired'){S.fl.retired=1;S.job=0;S.h=35;}
    if(c.profile==='poor'){S.cash=0;S.debt=500000;S.house.cash=0;S.house.debt=300000;S.w=WEALTH[0];}
    if(c.profile==='history'){W.chernobog_incident=1;W.londinium_war=1;S.inf=1;S.fl.dg=1;S.h=55;}
  })()`,ctx,{timeout:15000});
}
function observe(ctx) {
  return JSON.parse(vm.runInContext(`JSON.stringify((()=>{
    const orderedTags=[...tags(S)];
    const candidates=EV.filter(event=>elig(event,S,new Set(orderedTags)));
    const available=candidates.map(event=>({id:event.id,choices:(event.c||[]).map((choice,index)=>({index,visible:!!ok(choice.show,S,new Set(orderedTags)),enabled:!!ok(choice.en,S,new Set(orderedTags))}))}));
    return{tags:orderedTags,available,state:S,rng:RANDOM_STATE,world:W};
  })(),(key,value)=>['sourceFingerprintAtBirth','dataFingerprintAtBirth'].includes(key)?undefined:value)`,ctx,{timeout:30000}));
}
function hash(value) {return createHash('sha256').update(JSON.stringify(value)).digest('hex');}
module.exports={cases,context,setup,observe,hash};
