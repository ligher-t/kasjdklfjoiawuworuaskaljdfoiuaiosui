'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const {context, setup} = require('./support/annual-cases.cjs');

const {ctx} = context(path.resolve(__dirname, '..'));
const inspect = source => JSON.parse(vm.runInContext(
  'JSON.stringify((()=>{' + source + '})())', ctx
));

setup(ctx, {id:'reunion-crisis-goal',seed:192100,region:'ウルサス',age:35});
const crisis=inspect(`
 S.year=1098; S.age=35;
 ap({lifeAffiliation:{id:'reunion-reorg',title:'再編互助網',kind:'network',
   action:'join',role:'近隣への物資運び'},
   lifeGoal:{id:'reunion-relief',title:'感染者世帯への配給',action:'start'}});
 const tension=EV.find(e=>e.id==='life_reunion_reorg_tension'),
       review=EV.find(e=>e.id==='life_reunion_reorg_crisis_review'),
       pauseReview=EV.find(e=>e.id==='life_reunion_reorg_pause_review');
 ap(tension.c[0].o[0][2]);
 const during={aff:S.lifeRecord.affiliations.find(a=>a.id==='reunion-reorg').status,
   goal:S.lifeRecord.goals.find(a=>a.id==='reunion-relief').status};
 S.year=1099;S.age=36;
 ap(review.c[1].o[0][2]);
 const after={aff:S.lifeRecord.affiliations.find(a=>a.id==='reunion-reorg').status,
   goal:S.lifeRecord.goals.find(a=>a.id==='reunion-relief').status,
   goalAction:S.lifeRecord.goals.find(a=>a.id==='reunion-relief').history.at(-1).action};
 S.sn.life_reunion_reorg_crisis_review=1099;
 const immediately=elig(pauseReview,S,tags(S));
 S.year=1101;S.age=38;
 const tooSoon=elig(pauseReview,S,tags(S));
 S.year=1102;S.age=39;
 const due=elig(pauseReview,S,tags(S));
 ap(pauseReview.c[0].o[0][2]);
 const resumed={aff:S.lifeRecord.affiliations.find(a=>a.id==='reunion-reorg').status,
   goal:S.lifeRecord.goals.find(a=>a.id==='reunion-relief').status};
 return {during,after,immediately,tooSoon,due,resumed};
`);
assert.deepEqual(crisis.during,{aff:'crisis',goal:'active'});
assert.deepEqual(crisis.after,{aff:'suspended',goal:'paused',goalAction:'pause'});
assert.deepEqual([crisis.immediately,crisis.tooSoon,crisis.due],
 [false,false,true],'the follow-up must wait three years from the actual suspended status');
assert.deepEqual(crisis.resumed,{aff:'active',goal:'active'},
 'return from the pause must reopen both the membership and its mission');

for (const [index,paused] of [false,true].entries()) {
 setup(ctx,{id:'reunion-transfer-'+index,seed:192101+index,region:'ウルサス',age:30});
 ctx.PAUSE_OLD=paused;
 const transfer=inspect(`
  S.year=1098;S.age=30;S.inf=1;
  ap({lifeAffiliation:{id:'reunion-1096',title:'旧支援隊',kind:'network',
    action:'join',role:'事変後の小隊・見張りと避難者護衛'},
    lifeGoal:{id:'protect-neighbours',title:'避難中の感染者の生活を守る',action:'start'}});
  if(PAUSE_OLD)ap({lifeAffiliation:{id:'reunion-1096',action:'suspend'},
    lifeGoal:{id:'protect-neighbours',action:'pause'}});
  const event=EV.find(e=>e.id==='life_reunion_survivor_reconnection');
  const beforeGoal=S.lifeRecord.goals.find(g=>g.id==='protect-neighbours').status;
  ap(event.c[0].o[0][2]);
  const old=S.lifeRecord.affiliations.find(a=>a.id==='reunion-1096');
  const next=S.lifeRecord.affiliations.find(a=>a.id==='reunion-reorg');
  const oldGoal=S.lifeRecord.goals.find(g=>g.id==='protect-neighbours');
  const nextGoal=S.lifeRecord.goals.find(g=>g.id==='reunion-relief');
  return {beforeGoal,oldStatus:old.status,oldEndedYear:old.endedYear,
    oldGoal:oldGoal.status,oldAction:oldGoal.history.at(-1).action,
    nextStatus:next.status,nextGoal:nextGoal.status};
 `);
 assert.equal(transfer.beforeGoal,paused?'paused':'active');
 assert.deepEqual(
  {oldStatus:transfer.oldStatus,oldEndedYear:transfer.oldEndedYear,
   oldGoal:transfer.oldGoal,oldAction:transfer.oldAction,
   nextStatus:transfer.nextStatus,nextGoal:transfer.nextGoal},
  {oldStatus:'left',oldEndedYear:1098,oldGoal:'abandoned',oldAction:'abandon',
   nextStatus:'active',nextGoal:'active'},
  'joining the reorganized network must close the previous assignment and mission');
}
console.log('PASS Reunion crisis pause and active/paused old-unit transfer keep goal states coherent');
