'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inspect=source=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+source+'})())',ctx,{timeout:30000}));
const cases=[
 {event:'life_local_mutual_aid_review',choice:1,goal:'neighborhood-mutual-aid',aff:'local-mutual-aid',expected:'left',target:'abandoned',action:'abandon'},
 {event:'life_local_mutual_aid_review',choice:2,goal:'neighborhood-mutual-aid',aff:'local-mutual-aid',expected:'suspended',target:'paused',action:'pause'},
 {event:'life_local_mutual_aid_pause_review',choice:0,goal:'neighborhood-mutual-aid',aff:'local-mutual-aid',expected:'active',target:'active',action:'continue',paused:true},
 {event:'life_local_mutual_aid_pause_review',choice:2,goal:'neighborhood-mutual-aid',aff:'local-mutual-aid',expected:'left',target:'abandoned',action:'abandon',paused:true},
 {event:'life_local_mutual_aid_relocation',choice:0,goal:'neighborhood-mutual-aid',aff:'local-mutual-aid',expected:'left',target:'abandoned',action:'abandon'},
 {event:'sr_reunion_ordinary_followup',choice:2,goal:'reunion-relief',aff:'reunion-reorg',expected:'left',target:'abandoned',action:'abandon'}
];
for(let i=0;i<cases.length;i++){
 const c=cases[i];ctx.CASE=c;ctx.SEED=i;
 const result=inspect(`
  born({seed:20261120+SEED,by:1060,region:'ウルサス'});
  S.year=1099;S.age=39;
  const c=CASE,kind=c.aff==='local-mutual-aid'?'community':'local-relief-network';
  ap({lifeAffiliation:{id:c.aff,title:'本人が参加した支援連絡',kind,action:'join',role:'当番'},
    lifeGoal:{id:c.goal,title:'当番と近隣の暮らしを守る',action:'start'}});
  if(c.paused)ap({lifeAffiliation:{id:c.aff,action:'suspend'},
    lifeGoal:{id:c.goal,action:'pause'}});
  const event=EV.find(x=>x.id===c.event);ap(event.c[c.choice].o[0][2]);
  const aff=S.lifeRecord.affiliations.find(x=>x.id===c.aff),
    goal=S.lifeRecord.goals.find(x=>x.id===c.goal);
  return {aff:aff.status,goal:goal.status,action:goal.history.at(-1)?.action,
    issues:auditLifeState(S)};
 `);
 assert.equal(result.aff,c.expected,c.event+' affiliation');
 assert.equal(result.goal,c.target,c.event+' goal');
 assert.equal(result.action,c.action,c.event+' action history');
 assert.deepEqual(result.issues,[],c.event+' state audit');
}
const absent=inspect(`
 born({seed:20261188,by:1060,region:'ウルサス'});
 S.year=1099;S.age=39;
 ap({lifeAffiliation:{id:'reunion-reorg',title:'再編後レユニオンの互助連絡',kind:'local-relief-network',action:'join',role:'配達'}});
 ap(EV.find(x=>x.id==='sr_reunion_ordinary_followup').c[2].o[0][2]);
 const goal=S.lifeRecord.goals.find(g=>g.id==='reunion-relief');
 return {status:goal?.status,title:goal?.title,
   aff:S.lifeRecord.affiliations.find(a=>a.id==='reunion-reorg').status,
   issues:auditLifeState(S)};
`);
assert.equal(absent.status,'abandoned');
assert.equal(absent.aff,'left');
assert.equal(absent.title,'身近な感染者へ薬と食料を届ける');
assert.deepEqual(absent.issues,[]);
console.log('PASS seven affiliation-goal exit, pause, resumption and orphan-close cases');
