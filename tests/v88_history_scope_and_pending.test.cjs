'use strict';
// Contract cases GH-01 .. GH-05 from the integrated workplan.
// Uses the real runtime, not a parallel simulation engine.
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context } = require('./support/annual-cases.cjs');
const { ctx } = context(path.resolve(__dirname, '..'));
vm.runInContext('HL=0;AU="r";L=()=>{};',ctx);
const result = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  const loc = (region, city, year, month) => {
    born({seed:771108,by:1060,region});
    S.age=year-S.by;S.year=year;S.mo=month;
    S.res=REG.find(r=>r.n===region);
    S.local={...makeLocality(S.home,region),city};
    S.infoLog=[];S.hd={};S.known={};S.pendingHistoricalNews={};
    S.world={events:{}};
    return S;
  };
  const war=HIST.find(h=>h.flag==="londinium_war"),
    chernobog=HIST.find(h=>h.flag==="chernobog_incident"),
    secret=HIST.find(h=>h.infoScope==="sealed"),
    oneRegion=HIST.find(h=>h.localRegions?.length && !h.localCities?.length && !h.localCity && !h.city);
  loc("ヴィクトリア","ヴィクトリアの別都市",1098,8);
  const gh01={direct:isHistoricalEventLocal(war,S),
    nearby:historyIsNearby(war,S),
    regionImpact:historicalPlaceScope(war,S).affected};
  activateHistoricalWorldEvents(S);
  announceHistoricalNews(war,war.flag,"現地での直接の目撃・体験","public");
  gh01.route=S.infoLog[0].route;gh01.textBasis=S.infoLog[0].textBasis;
  // GH-02: birthplace never substitutes for missing current city or region.
  loc("クルビア",null,1096,12);
  S.birthLocality={city:"チェルノボーグ",region:"ウルサス"};
  const gh02={direct:isHistoricalEventLocal(chernobog,S)};
  // GH-03: knowing the world event does not bypass a sealed information scope.
  const gh03=informationScopeDecision(secret, true, S).eligible;
  // GH-04: a pre-release public report rechecks its route after relocation.
  loc("ヴィクトリア","ロンディニウム",1098,6);
  S.pendingHistoricalNews={[war.flag]:{route:"現地での直接の目撃・体験",infoScope:"public"}};
  S.res=REG.find(r=>r.n==="クルビア");
  S.local={...makeLocality(S.home,"クルビア"),city:"トカロント"};
  S.mo=7;activateHistoricalWorldEvents(S);releasePendingHistoricalNews(S);
  const gh04={route:S.infoLog[0]?.route,heardRegion:S.infoLog[0]?.heardRegion,
    heardYear:S.infoLog[0]?.heardYear,eventYear:S.infoLog[0]?.eventYear};
  // GH-05: an actual event-backed city encounter survives later relocation.
  loc("ヴィクトリア","ロンディニウム",1098,8);
  const noRecordedDirect=historicalDirectEncounter(war,S);
  const missed=recordHistoricalDirectEncounter(war,{...S,local:{...S.local,city:"別都市"}},"vic_war");
  const recorded=recordHistoricalDirectEncounter(war,S,"vic_war");
  S.res=REG.find(r=>r.n==="クルビア");
  S.local={...makeLocality(S.home,"クルビア"),city:"トカロント"};
  S.year=1099;S.mo=5;
  activateHistoricalWorldEvents(S);
  announceHistoricalNews(war,war.flag,historicalInformationRoute(war,S),"public");
  const gh05={noRecordedDirect:!!noRecordedDirect,missed:!!missed,recorded:!!recorded,
    route:S.infoLog[0]?.route,encounterCity:S.infoLog[0]?.eventCity,
    heardRegion:S.infoLog[0]?.heardRegion,heardYear:S.infoLog[0]?.heardYear,
    eventYear:S.infoLog[0]?.eventYear};
  const regionOnly=oneRegion ? isHistoricalEventLocal(oneRegion,S) : null;
  loc("ボリバル","ボリバルの別都市",1048,8);
  activateHistoricalWorldEvents(S);
  const regionalCrisis={direct:isHistoricalEventLocal(HIST.find(h=>h.flag==="bolivar_civil_war"),S),active:isLocationInCrisis(S)};
  // A queued regional-only bulletin cannot be delivered after moving out.
  const narrow=HIST.find(h=>h.infoScope==="local_news"&&h.r!=="all");
  loc(narrow.r[0],"地域内の別都市",narrow.y,narrow.availableFromMonth||1);
  S.pendingHistoricalNews={[narrow.flag]:{route:"現地での直接の目撃・体験",infoScope:"local_news"}};
  S.year=narrow.y+1;S.res=REG.find(r=>r.n==="クルビア"&&r.n!==narrow.r[0]) || REG.find(r=>r.n==="極東");
  S.local={...makeLocality(S.home,S.res.n),city:null};
  releasePendingHistoricalNews(S);
  const restricted={heard:!!S.hd[narrow.flag],pending:!!S.pendingHistoricalNews?.[narrow.flag]};
  return {gh01,gh02,gh03,gh04,gh05,regionOnly,regionalCrisis,restricted};
})()`,ctx)));
assert.equal(result.gh01.direct,false,'other Victoria city is not the Londinium battlefield');
assert.equal(result.gh01.nearby,true,'regional news may reach another Victoria city');
assert.equal(result.gh01.regionImpact,true,'regional disruption may be modeled separately');
assert.notEqual(result.gh01.route,'現地での直接の目撃・体験','news never self-promotes to witnessed battle');
assert.notEqual(result.gh01.textBasis,'現地体験文面');
assert.equal(result.gh02.direct,false,'birthplace fallback is forbidden');
assert.equal(result.gh03,false,'sealed news must not be delivered as public information');
assert.notEqual(result.gh04.route,'現地での直接の目撃・体験');
assert.equal(result.gh04.heardRegion,'クルビア');
assert.equal(result.gh04.heardYear,1098);
assert.equal(result.gh04.eventYear,1098);
assert.equal(result.gh05.noRecordedDirect,false);
assert.equal(result.gh05.missed,false);
assert.equal(result.gh05.recorded,true);
assert.equal(result.gh05.route,'現地での直接の目撃・体験');
assert.equal(result.gh05.encounterCity,'ロンディニウム');
assert.equal(result.gh05.heardRegion,'クルビア');
assert.equal(result.gh05.eventYear,1098);
assert.equal(result.gh05.heardYear,1099);
assert.equal(result.regionOnly,false,'region-only data are not eyewitness proof');
assert.deepEqual(result.regionalCrisis,{direct:false,active:true},
  'civilian disruption remains recognized without inventing a witnessed battle');
assert.deepEqual(result.restricted,{heard:false,pending:false},
  'the moved recipient no longer qualifies for the held regional notice');
console.log('PASS GH-01..05: direct encounter, residence, sealed, delayed receipt and relocation');
