'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');

const {ctx} = context(path.resolve(__dirname, '..'));
const inspect = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())',ctx));
setup(ctx,{id:'kazdel-family-memory-context',seed:195202,region:'クルビア',age:48});
const result = inspect(`
  S.year=1110;S.age=48;
  S.sn.life_kazdel_displaced_start=1100;
  ap({lifeGoal:{id:'kazdel-displaced-life',title:'避難先で暮らしの足場を整える',action:'start'}});
  const event=EV.find(e=>e.id==='life_kazdel_displaced_next_generation');
  const eligible=()=>elig(event,S,tags(S));
  const child={id:'home-child',nm:'子ども',by:1105,householdStatus:'supported'};
  S.kids=[child];
  const fiveYears=eligible();
  child.by=1104;
  const sixYears=eligible();
  child.d=1109;
  const deceased=eligible();
  delete child.d;
  child.householdStatus='independent';
  const independent=eligible();
  child.householdStatus='study';
  const studyingAtHome=eligible();
  child.householdResidencePlan='former';
  const studyingWithFormerParent=eligible();
  delete child.householdResidencePlan;
  child.householdStatus='supported';
  child.householdResidencePlan='former';
  const formerHome=eligible();
  child.householdResidencePlan='former_support';
  const supportedFormerHome=eligible();
  child.householdResidencePlan='unresolved';
  const uncertainHome=eligible();
  child.householdResidencePlan='shared';
  const sharedResidence=eligible();
  child.contactState='paused';
  const contactPaused=eligible();
  child.contactState='regular';
  const contactRestored=eligible();
  child.householdStatus='working';
  const workingAtHome=eligible();
  S.kids=[{id:'infant',by:1109,householdStatus:'supported'},{id:'away',by:1095,householdStatus:'independent'},child];
  const mixedFamily=eligible();
  S.kids=[{id:'infant',by:1109,householdStatus:'supported'},{id:'away',by:1095,householdStatus:'independent'}];
  const noEligibleChild=eligible();
  S.kids=[child]; S.sn.life_kazdel_displaced_next_generation=1110;
  const alreadySeen=eligible();
  delete S.sn.life_kazdel_displaced_next_generation;
  ap({lifeGoal:{id:'kazdel-displaced-life',action:'pause'}});
  const pausedLifeGoal=eligible();
  return {fiveYears,sixYears,deceased,independent,studyingAtHome,studyingWithFormerParent,formerHome,
    supportedFormerHome,uncertainHome,sharedResidence,contactPaused,
    contactRestored,workingAtHome,mixedFamily,noEligibleChild,alreadySeen,pausedLifeGoal,
    text:event.t};
`);
const {text:paragraph,...checks}=result;
assert.deepEqual(checks,{
  fiveYears:false,sixYears:true,deceased:false,independent:false,
  studyingAtHome:true,studyingWithFormerParent:false,formerHome:false,supportedFormerHome:false,
  uncertainHome:false,sharedResidence:true,contactPaused:false,
  contactRestored:true,workingAtHome:true,mixedFamily:true,noEligibleChild:false,
  alreadySeen:false,pausedLifeGoal:false
},'an actual conversational child must be mature enough and plausibly present');
assert.equal(paragraph,"夕餉の支度をしていると、子どもに「カズデルってどんな場所だったの？」と尋ねられた。自分が目で見た故郷の風景や、苦しい避難の記憶をどこまで語って聞かせるか考えた。");
console.log('PASS: Kazdel displaced parent-child conversation age, household and contact boundaries');
