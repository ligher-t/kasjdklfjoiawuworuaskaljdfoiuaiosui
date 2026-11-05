'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const root=path.resolve(__dirname,'..');
const {ctx}=context(root);
setup(ctx,{id:'employment-i1',seed:20261105,region:'クルビア',age:25});
const evaluate=source=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+source+'})())',ctx,{timeout:15000}));
const policy=JSON.parse(fs.readFileSync(path.join(root,'docs/employment/EMPLOYER_PLAYER_ACCESS_POLICY_66_20261105.json'),'utf8'));
const legacyJobs=JSON.parse(fs.readFileSync(path.join(root,'docs/employment/JOB_83_ACCESS_CONTRACT_20261104.json'),'utf8'));
const mapped=evaluate(`
  return {policy:EMPLOYER_PLAYER_ACCESS_MODES,jobKeys:EMPLOYER_JOB_ORGANIZATIONS,
    regionCount:Object.keys(OCCUPATION_REGION_TIERS).length,
    sectors:OCCUPATION_SECTORS.length};
`);
assert.equal(Object.keys(mapped.policy).length,66);
for(const row of policy.entries)assert.equal(mapped.policy[row.organizationKey],row.mode,row.organizationKey);
for(const row of legacyJobs.jobs.filter(row=>row.organizationKey))
  assert.equal(mapped.jobKeys[row.jobId],row.organizationKey,'J'+row.jobId);
assert.equal(mapped.regionCount,19);
assert.equal(mapped.sectors,13);
const world=evaluate(`
  const area=occupationAreaSnapshot(S),work=S.world.occupationWorld;
  const before=JSON.stringify(work),rng=S.rngState,job=S.job;
  S.job=16;ensureOccupationWorkArea(S);
  const same=JSON.stringify(work)===before;
  S.job=job;
  const readOnly=occupationAreaSnapshot(S);
  return {created:!!area,region:area?.region,sectors:Object.keys(area?.sectorTiers||{}).length,
    siteIds:area?.siteIds||[],areas:Object.keys(work.areas).length,
    worldSame:same,readOnly:area?.areaId===readOnly?.areaId,
    rngSame:rng===S.rngState,
    anonymous:Object.values(work.employers).every(row=>row.organizationKey===null),
    jobsAreIndependent:Object.values(work.sites).every(row=>row.basis==='game-model'),
    positionLinks:Object.values(work.positions).every(p=>work.sites[p.siteId]),
    openingLinks:Object.values(work.openings).every(o=>
      work.sites[o.siteId]&&work.positions[o.positionId]&&
      o.slots>0&&o.visibleToPlayer===false)};
`);
assert.equal(world.created,true,'birth/annual locality progression creates work areas');
assert.equal(world.region,'クルビア');
assert.equal(world.sectors,13);
assert.equal(world.areas,1);
assert.equal(world.worldSame,true,'changing the player's job cannot create workplaces');
assert.equal(world.readOnly,true);
assert.equal(world.rngSame,true,'world inspection does not advance personal RNG');
assert.equal(world.anonymous,true,'industrial presence does not clone named companies');
assert.equal(world.jobsAreIndependent,true);
assert.equal(world.positionLinks,true);
assert.equal(world.openingLinks,true);
const accesses=evaluate(`
  const clean=()=>JSON.stringify(S.world.occupationWorld),before=clean(),rng=S.rngState;
  const sample={siteId:'dummy',positionId:'dummy',openingId:'dummy',
    knownToPerson:true,specialPath:true,selected:true,accepted:true,started:true};
  const penguin=assessPlayerEmploymentAccess(S,{...sample,organizationKey:'penguin-logistics',jobId:16});
  const lee=assessPlayerEmploymentAccess(S,{...sample,organizationKey:'lee-detective-agency',jobId:21});
  const armorless=assessPlayerEmploymentAccess(S,{...sample,jobId:64});
  const held=assessPlayerEmploymentAccess(S,{...sample,jobId:48});
  const mismatch=assessPlayerEmploymentAccess(S,{...sample,jobId:28,organizationKey:'penguin-logistics'});
  const unknown=assessPlayerEmploymentAccess(S,{...sample,organizationKey:'unknown-organization'});
  const rhodes=assessPlayerEmploymentAccess(S,{...sample,jobId:28,specialPath:false});
  const generic=assessPlayerEmploymentAccess(S,{role:'office-assistant'});
  const community=canRecognizeCommunityWork(S,{jobId:70,communityRoleId:'tribe-guard',roleAccepted:true});
  const noCommunity=canRecognizeCommunityWork(S,{jobId:70,roleAccepted:false});
  return {penguin,lee,armorless,held,mismatch,unknown,rhodes,generic,community,noCommunity,
    unchanged:before===clean(),rngSame:rng===S.rngState};
`);
for(const key of ['penguin','lee','armorless','held','mismatch','unknown','rhodes']) {
  assert.equal(accesses[key].canApply,false,key+' cannot silently enter public recruitment');
  assert.equal(accesses[key].canStart,false,key+' cannot start salary');
}
assert.equal(accesses.penguin.reasonCode,'player-employment-prohibited');
assert.equal(accesses.lee.reasonCode,'player-employment-prohibited');
assert.equal(accesses.generic.canApply,true,'ordinary eligibility remains available');
assert.equal(accesses.generic.canStart,false,'general eligibility is not a work episode');
assert.equal(accesses.community,true);
assert.equal(accesses.noCommunity,false);
assert.equal(accesses.unchanged,true);
assert.equal(accesses.rngSame,true);
const events=evaluate(`
  const before=JSON.stringify({job:S.job,aff:S.lifeRecord?.affiliations||[],rng:S.rngState});
  const denied=key=>{try{ap({job:16,lifeAffiliation:{id:key,kind:'employer',action:'join'}});return false}
    catch(e){return /加入対象外/.test(e.message)}};
  const penguin=denied('penguin-logistics'),lee=denied('lee-detective-agency');
  const after=JSON.stringify({job:S.job,aff:S.lifeRecord?.affiliations||[],rng:S.rngState});
  return {penguin,lee,unchanged:before===after};
`);
assert.equal(events.penguin,true,'legacy effect cannot join Penguin Logistics');
assert.equal(events.lee,true,'legacy effect cannot join Lee agency');
assert.equal(events.unchanged,true,'forbidden effect has no partial state mutation');
const site=evaluate(`
  const before=JSON.stringify(S.world.occupationWorld),rng=S.rngState;
  const w=S.world.occupationWorld,siteId='explicit-site',employerId='explicit-rhodes',
    positionId='explicit-position',openingId='explicit-opening';
  w.employers[employerId]={employerId,organizationKey:'rhodes-island'};
  w.sites[siteId]={siteId,employerId,status:'open'};
  w.positions[positionId]={positionId,siteId};
  w.openings[openingId]={openingId,positionId,siteId,employerId,status:'open',slots:1,validFromYear:1};
  const entry={jobId:28,siteId,positionId,openingId,
    knownToPerson:true,specialPath:true,selected:true,accepted:true,started:true};
  const valid=assessPlayerEmploymentAccess(S,entry);
  const noKnowledge=assessPlayerEmploymentAccess(S,{...entry,knownToPerson:false});
  const noSpecial=assessPlayerEmploymentAccess(S,{...entry,specialPath:false});
  const noVacancy=(()=>{w.openings[openingId].slots=0;return assessPlayerEmploymentAccess(S,entry)})();
  const after=JSON.stringify(S.world.occupationWorld);
  return {valid,noKnowledge,noSpecial,noVacancy,pure:after!==before,rngSame:rng===S.rngState};
`);
assert.equal(site.valid.canApply,true,'special route with real vacancy can be considered');
assert.equal(site.valid.canStart,true,'commencement requires explicit consent and started state');
assert.equal(site.noKnowledge.canApply,false,'unknown vacancy cannot be a public application');
assert.equal(site.noSpecial.canApply,false,'special employer cannot be a general random opening');
assert.equal(site.noVacancy.canApply,false,'zero vacancies cannot be applied for');
assert.equal(site.rngSame,true);
console.log('PASS employment I-1: 66 policies, 83 jobs, 19x13 work areas, blocked joins and read-only access');
