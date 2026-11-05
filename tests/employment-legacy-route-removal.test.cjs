'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context, setup } = require('./support/annual-cases.cjs');
const { ctx } = context(path.resolve(__dirname, '..'));
setup(ctx, { id:'employment-legacy-route-removal', seed:20261105, region:'クルビア', age:25 });

const withoutEpisode = JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  const area=occupationAreaSnapshot(S);
  S.job=2;
  S.workContract={siteId:'legacy-site',jobId:2,startYear:S.year,status:'active',basis:'current-year-model'};
  const facility=activeFacility(S,'workplace'),contract=reconcileWorkContract(S),
    localWorkplaces=Object.values(area.facilities||{}).filter(row=>row.kind==='workplace').length,
    employment=prepareAnnualPersonalBudget(S,ANNUAL_SERVICES,S.age,S.t,S.f).inc,
    selectedJob=typeof pickStarterJob;
  S.job=0;
  const noJobIncome=prepareAnnualPersonalBudget(S,ANNUAL_SERVICES,S.age,S.t,S.f).inc;
  return {facility:facility?.id||null,contract,localWorkplaces,employment,noJobIncome,selectedJob,
    episodes:S.employmentState?.episodes?.length||0};
})())`, ctx));
assert.equal(withoutEpisode.facility, null, 'a profession identifier alone has no workplace');
assert.equal(withoutEpisode.contract, null, 'a profession identifier alone has no employment contract');
assert.equal(withoutEpisode.localWorkplaces, 0, 'profession identifiers do not synthesize local employers');
assert.equal(withoutEpisode.employment, withoutEpisode.noJobIncome, 'annual pay requires recorded wage receipts');
assert.equal(withoutEpisode.selectedJob, 'undefined', 'automatic starter job assignment has been removed');
assert.equal(withoutEpisode.episodes, 0);

const rejection = JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  const area=occupationAreaSnapshot(S),work=S.world.occupationWorld;
  for(const siteId of area?.siteIds||[])for(const positionId of work.sites[siteId]?.positionIds||[]){
    const position=work.positions[positionId];if(position?.jobId!==2)continue;
    position.vacancyCount=0;
    for(const openingId of position.openingIds||[]){const opening=work.openings[openingId];
      if(opening?.status==='open'){opening.status='filled';opening.slots=0;}}
  }
  S.job=0;TRACE_RESOLUTION={kind:'choice',id:'car'};
  let denied=false;
  try{ap({job:2});}catch(error){denied=/勤務開始/.test(error.message);}
  TRACE_RESOLUTION=null;
  return {denied,job:S.job,episodes:S.employmentState?.episodes?.length||0};
})())`, ctx));
assert.deepEqual(rejection, {denied:true,job:0,episodes:0}, 'missing openings reject old direct profession effects without mutation');

const appointment = JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  const area=occupationAreaSnapshot(S),work=S.world.occupationWorld,
    employerId='legacy-route-verified-employer',siteId='legacy-route-verified-site',
    positionId='legacy-route-verified-position',openingId='legacy-route-verified-opening';
  work.employers[employerId]={employerId,organizationKey:null};
  work.sites[siteId]={siteId,employerId,areaId:area.areaId,status:'open',sector:'MFG',positionIds:[positionId]};
  work.positions[positionId]={positionId,siteId,jobId:2,capacity:1,aggregateOccupiedSlots:0,
    identifiedOccupiedSlots:0,reservedSlots:0,vacancyCount:1,openingIds:[openingId]};
  work.openings[openingId]={openingId,siteId,positionId,employerId,areaId:area.areaId,
    kind:'general-public',status:'open',slots:1,validFromYear:S.year};
  area.siteIds.push(siteId);
  TRACE_RESOLUTION={kind:'choice',id:'car'};
  ap({job:2});
  TRACE_RESOLUTION=null;
  const episode=currentPlayerEmployment(S);
  return {job:S.job,kind:episode?.kind,siteId:episode?.siteId,
    contractBasis:S.workContract?.basis,openingSlots:work.openings[openingId].slots,
    positionVacancies:work.positions[positionId].vacancyCount};
})())`, ctx));
assert.deepEqual(appointment, {job:2,kind:'wage-employment',siteId:'legacy-route-verified-site',
  contractBasis:'occupation-episode',openingSlots:0,positionVacancies:0},
  'even an existing story effect becomes work only through a verified opening and episode');

console.log('Employment legacy route removal, verified opening admission and episode payroll PASS');
