'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const {context, setup} = require('./support/annual-cases.cjs');

const {ctx} = context(path.resolve(__dirname, '..'));
const inspect = source => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + source + '})())',ctx));
let seed = 192901;
const unitCases = [
  {unit:'reunion-1096',goal:'protect-neighbours',pause:false},
  {unit:'reunion-reorg',goal:'reunion-relief',pause:false},
  {unit:'reunion-1096',goal:'protect-neighbours',pause:true},
  {unit:'reunion-reorg',goal:'reunion-relief',pause:true},
  {unit:'reunion-1096',goal:'protect-neighbours',noGoal:true}
];
for(const scenario of unitCases) {
  setup(ctx,{id:'faction-sanctuary-'+seed,seed:seed++,region:'ウルサス',age:36});
  ctx.SCENARIO = scenario;
  const r = inspect(`
    S.year=1102;S.age=36;S.inf=1;S.ob=55;S.fl.reunion=1;
    const {unit,goal,pause,noGoal}=SCENARIO;
    ap({lifeAffiliation:{id:unit,title:'レユニオンの一隊',kind:'network',
      action:'join',role:'事変後の小隊・見張りと避難者護衛'}});
    if(!noGoal){
      ap({lifeGoal:{id:goal,title:'感染者を支える',action:'start'}});
      if(pause)ap({lifeGoal:{id:goal,action:'pause'}});
    }
    const shelter=EV.find(e=>e.id==='sr_reunion_to_rhodes_sanctuary'),
          rehabilitation=EV.find(e=>e.id==='sr_reunion_turncoat_rehabilitation');
    const eligible=elig(shelter,S,tags(S));
    ap(shelter.c[0].o[0][2]);
    const old=S.lifeRecord.affiliations.find(a=>a.id===unit),
          g=S.lifeRecord.goals.find(a=>a.id===goal),
          care=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-care');
    const after={
      oldStatus:old.status,oldEnd:old.endedYear,
      oldHistoryAction:old.history.at(-1).action,
      goal:g?.status||null,goalAction:g?.history.at(-1).action||null,
      care:care?.status,oldFlag:S.fl.reunion,
      rehabVisible:rehabilitation.show(S),
      originalGuard:shelter.show(S)
    };
    ap(rehabilitation.c[0].o[0][2]);
    const staff=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-staff'),
          employment=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-employment');
    return {eligible,after,staff:staff?.status,job:S.job,
      employment:employment?.status||null,
      duplicateRehab:rehabilitation.show(S),
      oldHistoryPreserved:old.history.some(h=>h.action==='join')};
  `);
  assert.equal(r.eligible,true,'both historically recorded Reunion units may seek medical shelter');
  assert.deepEqual(r.after,{
    oldStatus:'left',oldEnd:1102,oldHistoryAction:'leave',
    goal:scenario.noGoal?null:'abandoned',
    goalAction:scenario.noGoal?null:'abandon',
    care:'active',oldFlag:0,rehabVisible:true,originalGuard:false
  },'shelter must leave only actual active units, close existing goals and retain a care link');
  assert.equal(r.staff,'active','rehabilitation must hire a current care recipient');
  assert.equal(r.job,28,'former member enters recorded noncombatant Rhodes role');
  assert.equal(r.employment,null,'shelter patients must not invent an application history');
  assert.equal(r.duplicateRehab,false,'new Rhodes staff must not be offered the same first job again');
  assert.equal(r.oldHistoryPreserved,true);
}

setup(ctx,{id:'former-care-does-not-reapply',seed:seed++,region:'ウルサス',age:36});
const formerCare=inspect(`
  S.year=1102;S.age=36;S.inf=1;S.ob=55;
  ap({lifeAffiliation:{id:'reunion-reorg',title:'再編互助網',action:'join'}});
  const rescue=EV.find(e=>e.id==='sr_reunion_to_rhodes_sanctuary'),
        rehire=EV.find(e=>e.id==='sr_reunion_turncoat_rehabilitation');
  ap(rescue.c[0].o[0][2]);
  const active=rehire.show(S);
  ap({lifeAffiliation:{id:'rhodes-care',action:'leave'}});
  return {active,left:rehire.show(S)};
`);
assert.deepEqual(formerCare,{active:true,left:false},
  'the former patient is not still undergoing the recruitment offered during current care');

for (const withGoal of [false,true]) {
  setup(ctx,{id:'rhodes-to-reunion-'+seed,seed:seed++,region:'クルビア',age:32});
  ctx.WITH_GOAL = withGoal;
  const r=inspect(`
    S.year=1099;S.age=32;S.job=31;S.biasInfected=0;
    ap({lifeAffiliation:{id:'rhodes-staff',title:'ロドス・アイランド',
      kind:'employer',action:'join',role:'地域支部・外勤'}});
    if(WITH_GOAL)ap({lifeGoal:{id:'rhodes-work',title:'ロドス勤務',action:'start'}});
    const turning=EV.find(e=>e.id==='sr_rhodes_to_reunion_turning_point');
    const available=turning.show(S);
    ap(turning.c[0].o[0][2]);
    const rhodes=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-staff'),
          reunion=S.lifeRecord.affiliations.find(a=>a.id==='reunion-reorg'),
          oldGoal=S.lifeRecord.goals.find(g=>g.id==='rhodes-work'),
          newGoal=S.lifeRecord.goals.find(g=>g.id==='reunion-relief');
    return {available,rhodes:rhodes.status,reunion:reunion.status,
      oldGoal:oldGoal?.status||null,newGoal:newGoal.status,
      job:S.job,flag:S.fl.reunion,again:turning.show(S)};
  `);
  assert.deepEqual(r,{available:true,rhodes:'left',reunion:'active',
    oldGoal:withGoal?'abandoned':null,newGoal:'active',job:0,flag:1,again:false},
    'a cross-faction transfer closes Rhodes work without fabricating missing goals');
}
console.log('PASS actual cross-faction exits, paused goal closure, care-only hiring and no duplicate recruitment');
