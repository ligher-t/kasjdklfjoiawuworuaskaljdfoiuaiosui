'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname, '..'));
const inspect = source => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + source + '})())', ctx));

setup(ctx,{id:'infected-org-actual-suspension-age',seed:195004,region:'龍門',age:35});
const result = inspect(`
  S.year=1100; S.age=35; S.cash=200000; S.house.cash=200000;
  const id='infected-mutual-aid';
  const founder=EV.find(e=>e.id==='life_infected_association_choice');
  const rotation=EV.find(e=>e.id==='life_infected_org_rotation');
  const returnEvent=EV.find(e=>e.id==='life_infected_org_reentry');
  ap(founder.c[1].o[0][2]);
  S.sn.life_infected_association_choice=1100;
  S.year=1101; S.age=36;
  S.sn.life_infected_org_records=1101;
  S.year=1102; S.age=37;
  ap(rotation.c[3].o[0][2]);
  S.sn.life_infected_org_rotation=1102;
  const paused=S.lifeRecord.affiliations.find(x=>x.id===id);
  const initialPauseYear=paused.history.filter(h=>h.action==='suspend').at(-1)?.year;
  const sameYear=elig(returnEvent,S,tags(S));
  S.year=1103; S.age=38;
  const afterOne=elig(returnEvent,S,tags(S));
  ap(returnEvent.c[0].o[0][2]);
  const activeAgain=elig(returnEvent,S,tags(S));
  S.sn.life_infected_org_reentry=1103;
  S.year=1110; S.age=45;
  ap({lifeAffiliation:{id,action:'suspend',note:'仕事の調整で再び休止'},lifeGoal:{id,action:'pause'}});
  const secondPauseYear=paused.history.filter(h=>h.action==='suspend').at(-1)?.year;
  const justPaused=elig(returnEvent,S,tags(S));
  ap({lifeAffiliation:{id,action:'review',note:'今期は休止を継続'}});
  const reviewedInSameYear=elig(returnEvent,S,tags(S));
  S.year=1111; S.age=46;
  const renewedAfterOne=elig(returnEvent,S,tags(S));
  ap(returnEvent.c[2].o[0][2]);
  const left=elig(returnEvent,S,tags(S));
  return {initialPauseYear,sameYear,afterOne,activeAgain,secondPauseYear,
    justPaused,reviewedInSameYear,renewedAfterOne,left,
    status:paused.status,organization:S.lifeRecord.organizations.find(x=>x.id===id)?.status};
`);
assert.deepEqual(result,{
  initialPauseYear:1102,sameYear:false,afterOne:true,activeAgain:false,
  secondPauseYear:1110,justPaused:false,reviewedInSameYear:false,renewedAfterOne:true,
  left:false,status:'left',organization:'active'
},'the followup must age from the latest actual suspension and not reset on review');
console.log('PASS: repeated mutual-aid suspensions, dated reentry, review and final resignation');
