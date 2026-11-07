'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const {context, setup} = require('./support/annual-cases.cjs');

const {ctx} = context(path.resolve(__dirname, '..'));
const read = source => JSON.parse(vm.runInContext(
  'JSON.stringify((()=>{' + source + '})())', ctx
));

setup(ctx, {id:'reunion-legacy-timing', seed:191720, region:'ウルサス', age:35});
const reunion = read(`
 S.year=1100; S.age=35;
 const event=EV.find(e=>e.id==='life_reunion_reorg_exit_legacy');
 ap({lifeAffiliation:{id:'reunion-reorg',title:'再編互助網',kind:'network',action:'join'},
   lifeGoal:{id:'reunion-relief',title:'配給への協力',action:'start'}});
 S.year=1101; S.age=36;
 ap({lifeAffiliation:{id:'reunion-reorg',action:'leave'},
   lifeGoal:{id:'reunion-relief',action:'abandon'}});
 S.sn.life_reunion_reorg_review=1100;
 const noConflict=elig(event,S,tags(S));
 S.sn.life_reunion_reorg_tension=1100;
 const sameYearExit=elig(event,S,tags(S));
 S.year=1102; S.age=37;
 const oneYear=elig(event,S,tags(S));
 S.year=1103; S.age=38;
 const afterTwoYears=elig(event,S,tags(S));
 S.year=1104; S.age=39;
 ap({lifeAffiliation:{id:'reunion-reorg',action:'return'},
   lifeGoal:{id:'reunion-relief',action:'continue'}});
 const activeAgain=elig(event,S,tags(S));
 S.year=1105; S.age=40;
 ap({lifeAffiliation:{id:'reunion-reorg',action:'leave'},
   lifeGoal:{id:'reunion-relief',action:'abandon'}});
 const secondRecentExit=elig(event,S,tags(S));
 S.year=1107; S.age=42;
 const secondAgedExit=elig(event,S,tags(S));
 S.sn.life_reunion_reorg_exit_legacy=1107;
 const alreadySeen=elig(event,S,tags(S));
 return {once:event.once,after:event.after?.id,
   noConflict,sameYearExit,oneYear,afterTwoYears,activeAgain,
   secondRecentExit,secondAgedExit,alreadySeen};
`);
assert.equal(reunion.once, true);
assert.equal(reunion.after,'life_reunion_reorg_tension');
assert.deepEqual(
 [reunion.noConflict,reunion.sameYearExit,reunion.oneYear,reunion.afterTwoYears,
  reunion.activeAgain,reunion.secondRecentExit,reunion.secondAgedExit,reunion.alreadySeen],
 [false,false,false,true,false,false,true,false],
 'the conflict recollection belongs only to a former participant who actually experienced the dispute'
);

setup(ctx, {id:'noble-legacy-exit-year', seed:191721, region:'リターニア', age:35});
const noble = read(`
 S.year=1090; S.age=35;
 const event=EV.find(e=>e.id==='life_leithanian_noble_household_after_exit');
 ap({lifeAffiliation:{id:'leithanian-noble-household',title:'屋敷実務',kind:'community',action:'join'},
   lifeGoal:{id:'leithanian-noble-household',title:'実務の継続',action:'start'}});
 S.sn.life_leithanian_noble_household_review=1092;
 S.year=1110; S.age=55;
 ap({lifeAffiliation:{id:'leithanian-noble-household',action:'leave'},
   lifeGoal:{id:'leithanian-noble-household',action:'abandon'}});
 const recentlyLeft=elig(event,S,tags(S));
 S.year=1119; S.age=64;
 const nineYears=elig(event,S,tags(S));
 S.year=1120; S.age=65;
 const tenYears=elig(event,S,tags(S));
 S.year=1121; S.age=66;
 ap({lifeAffiliation:{id:'leithanian-noble-household',action:'return'},
   lifeGoal:{id:'leithanian-noble-household',action:'continue'}});
 const returned=elig(event,S,tags(S));
 S.year=1125; S.age=70;
 ap({lifeAffiliation:{id:'leithanian-noble-household',action:'leave'},
   lifeGoal:{id:'leithanian-noble-household',action:'abandon'}});
 const secondRecent=elig(event,S,tags(S));
 S.year=1135; S.age=80;
 const secondDecade=elig(event,S,tags(S));
 return {recentlyLeft,nineYears,tenYears,returned,secondRecent,secondDecade};
`);
assert.deepEqual(Object.values(noble),[false,false,true,false,false,true],
 'the noble-household retrospection must age from the latest actual departure');

setup(ctx, {id:'rhodes-legacy-after-exit', seed:191722, region:'クルビア', age:36});
const research = read(`
 S.year=1100; S.age=36;
 const event=EV.find(e=>e.id==='life_rhodes_research_legacy');
 ap({lifeAffiliation:{id:'rhodes-research',title:'ロドス研究',kind:'project',action:'join'},
   lifeGoal:{id:'oripathy-research',title:'研究協力',action:'start'}});
 ap({lifeAffiliation:{id:'rhodes-research',action:'leave'},
   lifeGoal:{id:'oripathy-research',action:'abandon'}});
 S.year=1102; S.age=38;
 const eligible=elig(event,S,tags(S));
 const before=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-research');
 const beforeEndedYear=before.endedYear, beforeHistoryLength=before.history.length;
 const beforeGoal=S.lifeRecord.goals.find(a=>a.id==='oripathy-research').status;
 ap(event.c[1].o[0][2]);
 const after=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-research');
 const afterGoal=S.lifeRecord.goals.find(a=>a.id==='oripathy-research').status;
 S.sn.life_rhodes_research_legacy=1102;
 const repeat=elig(event,S,tags(S));
 return {once:event.once,eligible,repeat,status:after.status,
   endedUnchanged:beforeEndedYear===after.endedYear,
   historyUnchanged:beforeHistoryLength===after.history.length,
   goalUnchanged:beforeGoal===afterGoal};
`);
assert.deepEqual(research,{once:true,eligible:true,repeat:false,status:'left',
 endedUnchanged:true,historyUnchanged:true,goalUnchanged:true},
 'declining a post-departure letter cannot attempt to resign from an already-left affiliation');
console.log('PASS delayed affiliation memories use actual exits, participant history and valid no-op effects');
