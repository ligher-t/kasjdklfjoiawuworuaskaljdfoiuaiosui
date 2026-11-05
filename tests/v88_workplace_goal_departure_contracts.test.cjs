'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {installEmploymentAppointmentFixture}=require('./support/employment-appointment-fixture.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
installEmploymentAppointmentFixture(ctx);
vm.runInContext(`globalThis.provisionGeneralOpening=function(jobId,token){
  const area=occupationAreaSnapshot(S),work=S.world.occupationWorld,
    employerId='workplace-goal-employer:'+token,siteId='workplace-goal-site:'+token,
    positionId='workplace-goal-position:'+token,openingId='workplace-goal-opening:'+token;
  work.employers[employerId]={employerId,organizationKey:null,kind:'anonymous-operator'};
  work.sites[siteId]={siteId,employerId,areaId:area.areaId,status:'open',sector:jobId===7?'MFG':'CIV',positionIds:[positionId]};
  work.positions[positionId]={positionId,siteId,jobId,capacity:1,aggregateOccupiedSlots:0,
    identifiedOccupiedSlots:0,reservedSlots:0,vacancyCount:1,openingIds:[openingId]};
  work.openings[openingId]={openingId,siteId,positionId,employerId,areaId:area.areaId,
    kind:'general-public',status:'open',slots:1,validFromYear:S.year};
  area.siteIds.push(siteId);
  return openingId;
};
globalThis.seedGeneralEmployment=function(jobId,token){
  S.k=50;S.socialLearning||={};S.socialLearning.literacy=60;
  if(jobId===7)ap({lifeSkill:{id:'engineering-experience',title:'技術経験',delta:12,context:'勤務開始の受入fixture'}});
  const openingId=provisionGeneralOpening(jobId,token);
  const assessment=assessEmploymentChoice(S,jobId,openingId);
  if(!assessment.canStart)throw Error('General employment fixture rejected J'+jobId+': '+assessment.reasonCode);
  ap({employmentAction:{action:'accept-local-opening',jobId,openingId}});
  return openingId;
};`,ctx);
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
  S.year=1102;S.age=37;S.job=0;S.mo=4;
  if(c.job===28){
    applyEmploymentAppointmentFixture('sr_rhodes_hiring_review',28,'rhodes-staff',0,0);
  }else{
    seedGeneralEmployment(c.job,'event:'+c.job);
  }
  if(c.job!==28)ap({lifeAffiliation:{id:c.aff,title:'仕事と所属',kind:'workplace',action:'join',role:'職員'},
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
const medical=inspect(`
 born({seed:203101,by:1065,region:'クルビア'});
 S.year=1102;S.age=37;
 ap({lifeAffiliation:{id:'rhodes-care',title:'ロドスへの療養相談',kind:'contact',
       action:'join',role:'定期相談'},
     lifeGoal:{id:'rhodes-care',title:'通院と暮らしを両立しながら療養する',action:'start'}});
 ap(EV.find(x=>x.id==='life_rhodes_role_review').c[2].o[0][2]);
 const aff=S.lifeRecord.affiliations.find(x=>x.id==='rhodes-care'),
   goal=S.lifeRecord.goals.find(x=>x.id==='rhodes-care');
 return {aff:aff.status,goal:goal.status,goalLast:goal.history.at(-1)?.action,
   issues:auditLifeState(S)};
`);
assert.equal(medical.aff,'left','Rhodes contact ends after the referral is transferred');
assert.equal(medical.goal,'active','local treatment remains a personal health goal');
assert.equal(medical.goalLast,'start','no phantom abandonment of health goal');
assert.deepEqual(medical.issues,[]);

const regionalPlacements=[
  {region:'クルビア',aff:'columbia-technical-work',goal:'columbia-technical-work',job:7},
  {region:'ヴィクトリア',aff:'victoria-insurance-clerk',goal:'victoria-clerk-livelihood',job:21},
  {region:'クルビア',aff:'bsw-contract',goal:'bsw-work',job:35},
  {region:'クルビア',aff:'rhine-lab',goal:'rhine-research',job:38}
];
for(let i=0;i<regionalPlacements.length;i++){
 const cfg=regionalPlacements[i];
 for(const mode of ['relocate','change-job','retire']){
  if(mode!=='relocate' && i>=2)continue;
  ctx.TARGET=cfg;ctx.MODE=mode;ctx.SEED=204000+i*10+['relocate','change-job','retire'].indexOf(mode);
  const result=inspect(`
   born({seed:SEED,by:1065,region:TARGET.region});
   S.year=1102;S.age=37;S.mo=4;S.cash=10000000;S.house.cash=10000000;S.k=100;S.h=100;
   if(TARGET.job===35)applyEmploymentAppointmentFixture('sr_bsw_recruitment_assessment',35,'bsw-contract',0,0);
   else if(TARGET.job===38)applyEmploymentAppointmentFixture('sr_rhine_recruitment_exam',38,'rhine-lab',0,0);
   else{
     seedGeneralEmployment(TARGET.job,'transition:'+TARGET.job);
     ap({lifeAffiliation:{id:TARGET.aff,title:'現地の勤務先',kind:'workplace',action:'join',role:'職員'},
       lifeGoal:{id:TARGET.goal,title:'この職場の仕事を続ける',action:'start'}});
   }
   const before={job:S.job,contract:S.workContract?.siteId||null,
     affiliation:S.lifeRecord.affiliations.find(a=>a.id===TARGET.aff)?.status,
     goal:S.lifeRecord.goals.find(g=>g.id===TARGET.goal)?.status};
   const historyLength=S.workContractHistory.length;
   if(MODE==='relocate'){
     const dest=moveDestinations(S).find(x=>x.n!==S.res.n);
     if(!dest)throw Error('No cross-region route for '+TARGET.region);
     ap({resTo:dest.n,resFareCovered:true});
   }else if(MODE==='change-job'){
     provisionGeneralOpening(19,'transition-destination:'+TARGET.job);
     ap({job:19});
   }
   else if(MODE==='retire')ap({fl:{retired:1}});
   const a=S.lifeRecord.affiliations.find(x=>x.id===TARGET.aff),
     g=S.lifeRecord.goals.find(x=>x.id===TARGET.goal),
     career=S.lifeRecord.careerChanges.at(-1);
   return {before,job:S.job,affiliation:a.status,goal:g.status,
     contract:S.workContract?.siteId||null,site:S.siteAffiliations?.workplace?.facilityId||null,
     career:{from:career?.fromJobId,to:career?.toJobId},
     ended:S.workContractHistory.slice(historyLength).filter(x=>x.action==='ended').length,
     phantomStarts:S.workContractHistory.slice(historyLength).filter(x=>x.action==='started').length,
     issues:auditLifeState(S)};
  `);
  assert.deepEqual([result.before.job,result.before.affiliation,result.before.goal],
    [cfg.job,'active','active'],cfg.aff+' entered employment');
  assert.equal(result.affiliation,'left',cfg.aff+' must leave the original job posting on '+mode);
  assert.equal(result.goal,'compromised',cfg.aff+' career goal reflects ended placement on '+mode);
  assert.equal(result.job,mode==='change-job'?19:0,cfg.aff+' correct occupation after '+mode);
  assert.equal(result.career.from,cfg.job,cfg.aff+' change source');
  assert.equal(result.career.to,mode==='change-job'?19:0,cfg.aff+' change destination');
  if(mode==='relocate'||mode==='retire'){
    assert.equal(result.contract,null,cfg.aff+' old contract must close');
    assert.equal(result.site,null,cfg.aff+' former worksite must close');
    assert.equal(result.phantomStarts,0,cfg.aff+' must not create employment in destination');
    if(result.before.contract)assert.equal(result.ended,1,cfg.aff+' old contract ended once');
  }
  assert.deepEqual(result.issues,[],cfg.aff+' state audit after '+mode);
 }
}
console.log('PASS: workplace goals and short contracts; relocation, job change and retirement close region-bound employment without phantom contracts');
