'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inspect=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx,{timeout:30000}));
const endings=[
  {event:'hig_service_review',choice:1,outcome:0,job:16,newGoal:'transporter-work'},
  {event:'hig_service_review',choice:2,outcome:0,job:0},
  {event:'hig_service_later_career_review',choice:1,outcome:0,job:16,newGoal:'transporter-work'},
  {event:'hig_service_later_career_review',choice:1,outcome:1,job:0,newGoal:'higashi-civilian-work-search'},
  {event:'hig_service_later_career_review',choice:2,outcome:0,job:0,newGoal:'higashi-civilian-work-search'}
];
for(let i=0;i<endings.length;i++){
  ctx.CASE=endings[i];ctx.SEED=i;
  const result=inspect(`
    born({seed:209300+SEED,by:1058,region:'極東'});
    S.year=1092;S.age=34;S.job=14;S.fl.higashi_service=1;
    ap({lifeAffiliation:{id:'higashi-service',title:'極東の軍務・兵站職',kind:'career',
        action:'join',role:'街道警備と物資の受け渡し'},
        lifeGoal:{id:'higashi-service',
          title:'軍務を通じて生活を支え、地域の安全に関わる',action:'start'}});
    S.sn.hig_tension=1092;S.year=1111;S.age=53;
    const event=EV.find(e=>e.id===CASE.event),
      before=elig(event,S,tags(S));
    ap(event.c[CASE.choice].o[CASE.outcome][2]);
    const affiliation=S.lifeRecord.affiliations.find(a=>a.id==='higashi-service'),
      goal=S.lifeRecord.goals.find(g=>g.id==='higashi-service');
    return {before,after:elig(event,S,tags(S)),aff:affiliation.status,
      goal:goal.status,action:goal.history.at(-1).action,job:S.job,
      flag:S.fl.higashi_service,
      newGoal:CASE.newGoal?S.lifeRecord.goals.find(g=>g.id===CASE.newGoal)?.status:null,
      issues:auditLifeState(S)};
  `);
  assert.equal(result.before,true,endings[i].event+' applicable before retirement');
  assert.equal(result.after,false,endings[i].event+' inapplicable after departure');
  assert.equal(result.aff,'left');
  assert.equal(result.goal,'abandoned');
  assert.equal(result.action,'abandon');
  assert.equal(result.job,endings[i].job);
  assert.equal(result.flag,0);
  if(endings[i].newGoal)assert.equal(result.newGoal,'active');
  assert.deepEqual(result.issues,[],endings[i].event+' state validation');
}
const older=inspect(`
  born({seed:209401,by:1030,region:'シラクーザ'});
  S.year=1094;S.age=64;S.job=16;
  ap({lifeAffiliation:{id:'siracusa-post-family-work',title:'シラクーザのファミリー離脱後の地域就労',
        kind:'occupation',action:'join',role:'配達'},
      lifeGoal:{id:'siracusa-post-family-work',
        title:'ファミリーを離れ、地域の仕事で生計を立てる',action:'start'}});
  const event=EV.find(e=>e.id==='sir_family_later_work'),
    before=elig(event,S,tags(S));
  ap(event.c[2].o[0][2]);
  const goal=S.lifeRecord.goals.find(g=>g.id==='siracusa-post-family-work');
  return {before,after:elig(event,S,tags(S)),job:S.job,
    aff:S.lifeRecord.affiliations.find(a=>a.id==='siracusa-post-family-work').status,
    goal:goal.status,action:goal.history.at(-1).action,issues:auditLifeState(S)};
`);
assert.equal(older.before,true);
assert.equal(older.after,false);
assert.equal(older.job,0);
assert.equal(older.aff,'left');
assert.equal(older.goal,'abandoned');
assert.equal(older.action,'abandon');
assert.deepEqual(older.issues,[]);
// Paused life goals and older saves with an omitted goal must still close on departure.
for(let i=0;i<2;i++){
  ctx.MODE=i;
  const boundary=inspect(`
    born({seed:209500+MODE,by:1059,region:'極東'});
    S.year=1090;S.age=31;S.job=14;S.fl.higashi_service=1;
    ap({lifeAffiliation:{id:'higashi-service',title:'極東の軍務・兵站職',
      kind:'career',action:'join',role:'街道警備'}});
    if(MODE===0){
      ap({lifeGoal:{id:'higashi-service',
        title:'軍務を通じて生活を支え、地域の安全に関わる',action:'start'}});
      ap({lifeGoal:{id:'higashi-service',action:'pause'}});
    }
    S.year=1101;S.age=42;
    ap(EV.find(e=>e.id==='hig_service_review').c[2].o[0][2]);
    const goal=S.lifeRecord.goals.find(g=>g.id==='higashi-service');
    return {status:goal?.status,title:goal?.title,
      affiliation:S.lifeRecord.affiliations.find(a=>a.id==='higashi-service').status,
      issues:auditLifeState(S)};
  `);
  assert.equal(boundary.status,'abandoned');
  assert.equal(boundary.title,'軍務を通じて生活を支え、地域の安全に関わる');
  assert.equal(boundary.affiliation,'left');
  assert.deepEqual(boundary.issues,[]);
}
console.log('PASS: Higashi service departures and Siracusa retirement close former goals');
