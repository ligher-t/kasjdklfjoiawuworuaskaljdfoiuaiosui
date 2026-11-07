'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const {context, setup} = require('./support/annual-cases.cjs');

const {ctx} = context(path.resolve(__dirname, '..'));
const inspect = source => JSON.parse(vm.runInContext(
  'JSON.stringify((()=>{' + source + '})())', ctx
));
const cases = [
  ['life_leithanian_civic_activity', 3, 'leithanian-district-petition', false],
  ['life_leithanian_civic_relocation', 0, 'leithanian-district-petition', false],
  ['life_leithanian_civic_later_active', 2, 'leithanian-district-petition', false],
  ['life_leithanian_civic_later_suspended', 2, 'leithanian-district-petition', true],
  ['life_leithanian_noble_household_review', 3, 'leithanian-noble-household', false],
  ['life_leithanian_noble_household_later_active', 2, 'leithanian-noble-household', false],
  ['life_leithanian_noble_household_later_suspended', 2, 'leithanian-noble-household', true],
  ['life_rhodes_research_pause_review', 2, 'rhodes-research', true]
];
let seed = 191500;
for (const [eventId, optionIndex, id, suspended] of cases) {
  setup(ctx, {id: 'goal-closure-' + seed, seed: seed++,
    region: id === 'rhodes-research' ? 'クルビア' : 'リターニア', age: 35});
  ctx.TARGET_EVENT = eventId;
  ctx.TARGET_OPTION = optionIndex;
  ctx.TARGET_ID = id;
  ctx.TARGET_PAUSED = suspended;
  const result = inspect(`
    S.year=1100; S.age=35;
    ap({lifeAffiliation:{id:TARGET_ID,title:'所属の境界テスト',kind:'community',action:'join'},
      lifeGoal:{id:TARGET_ID === 'rhodes-research' ? 'oripathy-research' : TARGET_ID,
        title:'所属と連動する人生目標',action:'start'}});
    const goalId = TARGET_ID === 'rhodes-research' ? 'oripathy-research' : TARGET_ID;
    if(TARGET_PAUSED) ap({lifeAffiliation:{id:TARGET_ID,action:'suspend'},
      lifeGoal:{id:goalId,action:'pause'}});
    const event=EV.find(row=>row.id===TARGET_EVENT);
    const outcome=event?.c?.[TARGET_OPTION]?.o?.[0]?.[2];
    if(!outcome) return {error:'missing event or result',event:TARGET_EVENT};
    const before = S.lifeRecord.goals.find(row=>row.id===goalId).status;
    ap(outcome);
    const affiliation=S.lifeRecord.affiliations.find(row=>row.id===TARGET_ID);
    const goal=S.lifeRecord.goals.find(row=>row.id===goalId);
    return {before,affiliation:affiliation.status,goal:goal.status,
      recordedAction:goal.history.at(-1)?.action,endedYear:affiliation.endedYear};
  `);
  assert.equal(result.error, undefined, eventId + ' outcome is reachable in data');
  assert.equal(result.before, suspended ? 'paused' : 'active', eventId + ' initial goal');
  assert.equal(result.affiliation, 'left', eventId + ' must end the affiliation');
  assert.equal(result.goal, 'abandoned', eventId + ' must not leave an ongoing goal');
  assert.equal(result.recordedAction, 'abandon', eventId + ' goal history must record actual exit');
  assert.equal(result.endedYear, 1100, eventId + ' must close the affiliation episode');
}
console.log('PASS eight civic, noble-household and research exits close their life goals');
