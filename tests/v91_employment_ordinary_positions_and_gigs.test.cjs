'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const root=path.resolve(__dirname,'..');
const {ctx}=context(root);
setup(ctx,{id:'employment-ordinary-gig',seed:20261106,region:'クルビア',age:19});
function inspect(code) {
  return JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx,{timeout:25000}));
}
const world=inspect(`
  const work=S.world.occupationWorld, areas=Object.values(work.areas),
    sites=Object.values(work.sites), positions=Object.values(work.positions),
    openings=Object.values(work.openings);
  const sectorRoles=Object.entries(OCCUPATION_SECTOR_GENERAL_JOBS);
  const multiRoles=sites.filter(site=>site.positionIds.length>1);
  return {
    sectors:sectorRoles.length, allKnown:sectorRoles.every(([sector,ids])=>
      OCCUPATION_SECTORS.includes(sector)&&ids.every(id=>id>=1&&id<=27)),
    noGeneralMilitary:sectorRoles.find(x=>x[0]==='MIL')[1].length===0,
    noGeneralClergy:sectorRoles.find(x=>x[0]==='REL')[1].length===0,
    multiRoleCount:multiRoles.length,siteIdsUnique:new Set(sites.map(s=>s.siteId)).size===sites.length,
    noOverbook:sites.every(site=>{
      const allocated=site.positionIds.map(id=>work.positions[id]);
      return allocated.every(p=>p&&p.siteId===site.siteId&&p.aggregateOccupiedSlots+
        p.identifiedOccupiedSlots+p.reservedSlots+p.vacancyCount===p.capacity);
    }), openingOwned:openings.every(o=>work.positions[o.positionId]?.siteId===o.siteId &&
      work.sites[o.siteId]?.employerId===o.employerId)
  };
`);
assert.equal(world.sectors,13);
assert.equal(world.allKnown,true);
assert.equal(world.noGeneralMilitary,true);
assert.equal(world.noGeneralClergy,true);
assert.equal(world.noOverbook,true);
assert.equal(world.openingOwned,true);
const choices=inspect(`
  const entry=EV.find(e=>e.id==='car'),
    reentry=EV.find(e=>e.id==='work_unemployed_reentry'),
    labels=['工場労働者として働く','修理工房で技術を習う',
      '医療補助や薬局の手伝いをする','事務・記録の仕事を探す',
      '職人の工房で手仕事を覚える','鉱区へ働きに出る'];
  return {
    migrated:labels.map(label=>{
      const c=entry.c.find(x=>x.l===label);
      return {label,source:!!c,
        action:c?.o?.[0]?.[2]?.employmentAction?.action,
        jobId:c?.o?.[0]?.[2]?.employmentAction?.jobId};
    }),
    reentry:reentry.c.find(x=>x.l.includes('町工場'))?.o?.[0]?.[2]?.employmentAction?.jobId,
    mercenary:entry.c.find(x=>x.l==='傭兵団に加わる')?.o?.[0]?.[2],
    errand:entry.c.find(x=>x.l==='ファミリーの下で働く')?.o?.[0]?.[2],
    wandering:entry.c.find(x=>x.l==='故郷を離れ、放浪する')?.o?.[0]?.[2],
    cargo:reentry.c.find(x=>x.l.includes('荷揚げ場'))?.o?.[0]?.[2],
    market:entry.c.find(x=>x.l.includes('移動バザール周辺'))?.o?.[0]?.[2]
  };
`);
assert.deepEqual(choices.migrated.map(x=>x.jobId),[2,18,20,21,22,3]);
assert(choices.migrated.every(x=>x.source&&x.action==='accept-local-opening'));
assert.equal(choices.reentry,2);
for(const key of ['mercenary','errand','cargo','market']){
  assert.equal(choices[key].job,undefined,key+' cannot manufacture regular employment');
  assert.equal(choices[key].employmentAction.action,'complete-gig');
  assert.equal(choices[key].employmentAction.nominalCash,choices[key].cash);
}
assert.equal(choices.wandering.job,0,'travel alone must not grant an unverified employer');
const gig=inspect(`
  S.job=0;S.mo=7;
  const effect=EV.find(e=>e.id==='work_unemployed_reentry').c
    .find(c=>c.l.includes('荷揚げ場')).o[0][2];
  const cashBefore=S.cash, wagesBefore=employmentAnnualWageBase(S,S.year);
  ap(effect);
  const episodes=S.employmentState?.episodes||[];
  const actual=episodes.at(-1),cashAfter=S.cash,jobAfter=S.job,
    wagesAfter=employmentAnnualWageBase(S,S.year);
  let duplicateDenied=false,wrongPayDenied=false;
  try { ap(effect); } catch(e) { duplicateDenied=/二重/.test(e.message); }
  const cashAfterRepeat=S.cash, episodesAfterRepeat=S.employmentState.episodes.length;
  try { ap({ employmentAction:effect.employmentAction,cash:effect.cash+1 }); }
  catch(e) { wrongPayDenied=/一致しない/.test(e.message); }
  const zeroSideEffects=S.cash===cashAfter &&
    S.employmentState.episodes.length===episodesAfterRepeat;
  return {
    cashBefore,cashAfter,jobAfter,wagesBefore,wagesAfter,
    kind:actual?.kind,status:actual?.status,period:[actual?.startYear,actual?.endYear],
    nominalCash:actual?.nominalCash,duplicateDenied,wrongPayDenied,zeroSideEffects,
    episodesAfterRepeat
  };
`);
assert.equal(gig.jobAfter,0);
assert.equal(gig.wagesAfter,null,'completed gig does not generate annual salaried wages');
assert.equal(gig.kind,'gig');
assert.equal(gig.status,'completed');
assert.equal(gig.nominalCash,50000);
assert(gig.cashAfter>gig.cashBefore,'the event pays once');
assert.equal(gig.duplicateDenied,true);
assert.equal(gig.wrongPayDenied,true);
assert.equal(gig.zeroSideEffects,true);
assert.equal(gig.episodesAfterRepeat,1);
console.log('PASS employment I-2 ordinary positions and completed gigs');
