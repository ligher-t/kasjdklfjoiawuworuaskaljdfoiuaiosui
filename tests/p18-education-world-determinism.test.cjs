'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context,setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname,'..'));
setup(ctx,{id:'education-world',seed:20261103,region:'龍門',age:8});
const evaluate = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())',ctx,{timeout:20000}));
const grid = evaluate(`
  const regions=Object.keys(EDUCATION_REGIONAL_PRESENCE);
  const kinds=Object.keys(EDUCATION_LOCALITY_PRESENCE_DELTA);
  let cells=0,violations=0,outside=0;
  for(const region of regions) for(const kind of kinds){
    const rates=educationPresenceRates(region,kind);
    for(const stage of EDUCATION_SITE_STAGES){
      const n=rates[stage];cells++;if(n<0||n>100)outside++;
    }
    if(rates.primary<rates.lower||rates.lower<rates.upper)violations++;
  }
  return {regions:regions.length,kinds:kinds.length,stages:EDUCATION_SITE_STAGES.length,
    cells,violations,outside,lungmen:educationPresenceRates("龍門","固定都市の街区"),
    frontier:educationPresenceRates("カズデル","辺境・移動の多い居住地"),
    special:educationPresenceRates("カズデル","辺境・移動の多い居住地","kazdel_reconstruction_core")};
`);
assert.deepEqual([grid.regions,grid.kinds,grid.stages,grid.cells],[19,7,6,798]);
assert.equal(grid.violations,0);
assert.equal(grid.outside,0);
assert.equal(grid.lungmen.university,60);
assert.equal(grid.lungmen.primary,100);
assert.equal(grid.frontier.primary,0);
assert.equal(grid.special.primary,80);
assert.equal(grid.special.university,17);

const world = evaluate(`
  const s=S, rng=s.rngState;
  const areaId=educationAreaForResidence(s),w=s.world.educationWorld;
  const before=JSON.stringify(w),draws=Object.keys(w.generationDecisions).length;
  const offerings=institutionOfferings(s,areaId);
  const repeat=educationAreaForResidence(s),after=JSON.stringify(w);
  return {rngSame:rng===s.rngState,seed:w.worldSeed,
    areaId,repeat,worldSame:before===after,draws,
    linked:offerings.every(x=>w.campuses[x.campusId]?.institutionId===x.institutionId &&
      w.institutions[x.institutionId]?.offeringIds.includes(x.id)),
    formalCount:offerings.length,neighborCount:educationNeighborAreaIds(s,areaId).length};
`);
assert.equal(world.rngSame,true);
assert.equal(world.areaId,world.repeat);
assert.equal(world.worldSame,true);
assert(world.seed>0);
assert(world.draws>=2);
assert.equal(world.linked,true);
assert(world.neighborCount<=4);

const city = evaluate(`
  const s={randomSeed:998812,world:{events:{}},year:1099,res:{n:"龍門"},
    local:{city:"龍門",kind:"移動都市の居住区",placeId:"city:龍門:龍門",districtId:"district:1"}};
  const central=ensureEducationWorldForResidence(s);
  const records=s.world.educationWorld;
  const adjacent=educationNeighborAreaIds(s,central);
  const uni=institutionOfferings(s,central,"university").map(x=>x.institutionId);
  const arts=institutionOfferings(s,central,"arts").map(x=>x.institutionId);
  const alternatives=adjacent.map(id=>({
    id,university:institutionOfferings(s,id,"university").map(x=>x.institutionId),
    arts:institutionOfferings(s,id,"arts").map(x=>x.institutionId)}));
  return {central,adjacent,uni,arts,alternatives,hubs:Object.keys(records.hubs).length,
    uniInstitutions:Object.values(records.institutions).filter(x=>x.institutionCategory==="university").length,
    artsInstitutions:Object.values(records.institutions).filter(x=>x.institutionCategory==="originium_arts_academy").length};
`);
assert.equal(city.adjacent.length,3);
assert.equal(city.hubs,1);
assert(city.uniInstitutions<=1);
assert(city.artsInstitutions<=1);
for(const row of city.alternatives) {
  assert.deepEqual(row.university,city.uni,'university offering is hub-shared');
  assert.deepEqual(row.arts,city.arts,'arts offering is hub-shared');
}

const unordered = evaluate(`
  function state(){return {randomSeed:771122,world:{events:{}},year:1099,res:{n:"サーミ"},
    local:{kind:"小規模な定住地",city:null,educationAreaAnchor:"settlement-a",placeId:"A",districtId:"district:1"}};}
  function snapshot(reverse){
    const s=state(),ids=[];
    const places=reverse?["settlement-b","settlement-a"]:["settlement-a","settlement-b"];
    for(const place of places){
      s.local={kind:"小規模な定住地",city:null,educationAreaAnchor:place,placeId:place,districtId:"district:8"};
      ids.push(ensureEducationWorldForResidence(s));
    }
    const decisions=s.world.educationWorld.generationDecisions;
    return {ids,decisions:Object.fromEntries(Object.entries(decisions).sort())};
  }
  const ab=snapshot(false),ba=snapshot(true);
  return {first:ab,second:ba};
`);
assert.deepEqual(unordered.first.decisions,unordered.second.decisions,
  'placement does not depend on the order in which explicit settlements are consulted');
assert.notEqual(unordered.first.ids[0],unordered.first.ids[1]);

const saved = evaluate(`
  const original=S.world.educationWorld;
  const frozen=JSON.stringify(original);
  const clone=JSON.parse(JSON.stringify(S));
  const id=ensureEducationWorldForResidence(clone);
  return {unchanged:frozen===JSON.stringify(original),
    restoredWorld:frozen===JSON.stringify(clone.world.educationWorld),
    sameArea:id===S.local.educationAreaId};
`);
assert.equal(saved.unchanged,true);
assert.equal(saved.restoredWorld,true);
assert.equal(saved.sameArea,true);
console.log('PASS P18 education world placement: 798 cells, stable areas, shared hubs and RNG purity');
