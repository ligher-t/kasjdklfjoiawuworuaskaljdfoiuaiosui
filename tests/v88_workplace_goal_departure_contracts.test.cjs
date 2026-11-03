'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inspect=source=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+source+'})())',ctx,{timeout:30000}));

const workplaceCases=[
  {event:'col_tech_safety_aftermath',region:'クルビア',aff:'columbia-technical-work',goal:'columbia-technical-work',job:7},
  {event:'col_tech_internal_review',region:'クルビア',aff:'columbia-technical-work',goal:'columbia-technical-work',job:7},
  {event:'col_tech_workplace_consequence',region:'クルビア',aff:'columbia-technical-work',goal:'columbia-technical-work',job:7},
  {event:'col_tech_later_years',region:'クルビア',aff:'columbia-technical-work',goal:'columbia-technical-work',job:7},
  {event:'vic_clerk_role_review',region:'ヴィクトリア',aff:'victoria-insurance-clerk',goal:'victoria-clerk-livelihood',job:21},
  {event:'sr_rhodes_work_review',region:'クルビア',aff:'rhodes-staff',goal:'rhodes-work',job:28}
];
for(let i=0;i<workplaceCases.length;i++){
 const cfg=workplaceCases[i];ctx.TARGET=cfg;ctx.SEED=203000+i;
 const result=inspect(`
  const c=TARGET;
  born({seed:SEED,by:1065,region:c.region});
  S.year=1102;S.age=37;S.job=c.job;
  ap({lifeAffiliation:{id:c.aff,title:'仕事と所属',kind:'workplace',action:'join',role:'職員'},
    lifeGoal:{id:c.goal,title:'職場での仕事を続ける',action:'start'}});
  const before={aff:S.lifeRecord.affiliations.find(x=>x.id===c.aff).status,
    goal:S.lifeRecord.goals.find(x=>x.id===c.goal).status};
  const event=EV.find(x=>x.id===c.event);
  ap(event.c[2].o[0][2]);
  const aff=S.lifeRecord.affiliations.find(x=>x.id===c.aff),
    goal=S.lifeRecord.goals.find(x=>x.id===c.goal);
  return {before,aff:aff.status,goal:goal.status,action:goal.history.at(-1)?.action,
    job:S.job,endedYear:aff.endedYear,issues:auditLifeState(S)};
 `);
 assert.deepEqual(result.before,{aff:'active',goal:'active'},cfg.event+' setup');
 assert.equal(result.aff,'left',cfg.event+' must end work affiliation');
 assert.equal(result.goal,'abandoned',cfg.event+' must end workplace goal');
 assert.equal(result.action,'abandon',cfg.event+' goal history');
 assert.equal(result.endedYear,1102,cfg.event+' exit year');
 assert.equal(result.job,0,cfg.event+' job cleared');
 assert.deepEqual(result.issues,[],cfg.event+' state audit');
}
const separateContract=inspect(`
 born({seed:203100,by:1065,region:'サルゴン'});
 S.year=1102;S.age=37;
 ap({lifeGoal:{id:'sargon-market-guard-work',title:'市場の護衛請負を続ける',action:'start'},
   lifeAffiliation:{id:'sargon-market-guard-contracts',title:'市場の護衛請負',kind:'contract',action:'join'}});
 ap({lifeAffiliation:{id:'sargon-market-guard-contracts',action:'leave'}});
 const outcome=EV.find(x=>x.id==='sargon_market_contract_review').c[0].o[0][2];
 ap(outcome);
 const aff=S.lifeRecord.affiliations.find(x=>x.id==='sargon-market-guard-contracts'),
   goal=S.lifeRecord.goals.find(x=>x.id==='sargon-market-guard-work');
 return {aff:aff.status,goal:goal.status,history:goal.history.at(-1)?.action,issues:auditLifeState(S)};
`);
assert.equal(separateContract.aff,'left','completed short contract remains closed');
assert.equal(separateContract.goal,'active','aspiration to find another short contract can remain active');
assert.equal(separateContract.history,'continue');
assert.deepEqual(separateContract.issues,[]);
console.log('PASS: six workplace exits close their career goals; intermittent contract aspiration stays active');
