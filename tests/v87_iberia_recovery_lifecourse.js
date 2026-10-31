'use strict';
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const document = {
  currentScript: null,
  getElementById() {
    return { hidden: false, textContent: '', value: '', dataset: {}, innerHTML: '', insertAdjacentHTML() {} };
  },
  querySelectorAll() {
    return [];
  }
};
const context = {
  window: {},
  document,
  console,
  Date,
  setTimeout() {},
  setInterval() {},
  localStorage: { getItem() { return null; }, setItem() {} }
};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root), context, { timeout: 15000 });
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0], context, {
  timeout: 15000
});
context.rd = () => {};

const result = vm.runInNewContext(
  String.raw`(()=>{
    const event=id=>window.GAME_DATA.EV.find(row=>row.id===id);
    const apply=(id,choice,outcome=0)=>{
      const row=event(id),previous=TRACE_RESOLUTION;
      TRACE_RESOLUTION={kind:'choice',id:row.id,label:row.c[choice].l};
      try{ap(row.c[choice].o[outcome][2]);}finally{TRACE_RESOLUTION=previous;}
    };
    const setup=seed=>{
      born({seed,by:1080,region:'イベリア'});
      S.age=25;S.year=1105;S.mo=4;S.res=REG.find(row=>row.n==='イベリア');
      S.home='固定集落';S.local={...makeLocality(S.home,S.res.n)};S.job=3;S.house.cash=300000;
      return S;
    };
    const start=seed=>{const state=setup(seed),jobBefore=state.job;apply('ibe_rebuild',0);return {state,jobBefore};};
    const entry=event('ibe_rebuild'),review=event('ibe_rebuild_contract_review');
    const accepted=start(981510),affiliation=accepted.state.lifeRecord.affiliations.find(row=>row.id==='iberia-coastal-recovery-contract');
    const goal=accepted.state.lifeRecord.goals.find(row=>row.id==='iberia-coastal-recovery-work');
    const initialAffiliation={status:affiliation?.status,episodes:affiliation?.episodes?.length,goal:goal?.status};
    accepted.state.year++;accepted.state.age++;const oneYearHidden=!review.show(accepted.state);
    accepted.state.year++;accepted.state.age++;const twoYearVisible=review.show(accepted.state);
    apply(review.id,0,0);
    const second=accepted.state.lifeRecord.affiliations.find(row=>row.id==='iberia-coastal-recovery-contract');
    const repeat={job:accepted.state.job,episodes:second.episodes.length,status:second.status,goal:accepted.state.lifeRecord.goals.find(row=>row.id==='iberia-coastal-recovery-work')?.status,audit:auditLifeState(accepted.state)};

    const rejected=start(981511);rejected.state.year+=2;rejected.state.age+=2;apply(review.id,0,1);
    const noOpening={job:rejected.state.job,goal:rejected.state.lifeRecord.goals.find(row=>row.id==='iberia-coastal-recovery-work')?.status,audit:auditLifeState(rejected.state)};
    const transferred=start(981512);transferred.state.year+=2;transferred.state.age+=2;apply(review.id,1);
    const otherWork={goal:transferred.state.lifeRecord.goals.find(row=>row.id==='iberia-coastal-recovery-work')?.status,audit:auditLifeState(transferred.state)};
    const ended=start(981513);ended.state.year+=2;ended.state.age+=2;apply(review.id,2);
    const end={goal:ended.state.lifeRecord.goals.find(row=>row.id==='iberia-coastal-recovery-work')?.status,audit:auditLifeState(ended.state)};

    const noRoute=setup(981514);noRoute.year+=5;noRoute.age+=5;
    const noRouteHidden=!review.show(noRoute);
    const moved=start(981515);moved.state.year+=2;moved.state.age+=2;moved.state.res=REG.find(row=>row.n==='龍門');
    const movedOutsideIberiaHidden=!review.show(moved.state);
    const movedWithinIberia=start(981517);movedWithinIberia.state.year+=2;movedWithinIberia.state.age+=2;
    movedWithinIberia.state.local={...movedWithinIberia.state.local,kind:'固定都市の街区',city:null};
    const movedWithinIberiaVisible=review.show(movedWithinIberia.state);
    const reviewAvoidsUntrackedTown=typeof review.t==='string'&&!review.t.includes('以前働いた沿岸の町')&&review.t.includes('前に覚えた手順');
    const failedResearch=setup(981516);apply('ibe_rebuild',1,1);
    const failedResearchHasNoContract=!failedResearch.lifeRecord.affiliations.some(row=>row.id==='iberia-coastal-recovery-contract');
    return {
      entryChoices:entry.c.length,reviewChoices:review.c.length,localGate:review.need.includes('国:イベリア'),
      jobBefore:accepted.jobBefore,jobAfterEntry:accepted.state.job,
      affiliationStatus:initialAffiliation.status,episodeCount:initialAffiliation.episodes,goalAtStart:initialAffiliation.goal,
      oneYearHidden,twoYearVisible,repeat,noOpening,otherWork,end,noRouteHidden,movedOutsideIberiaHidden,movedWithinIberiaVisible,reviewAvoidsUntrackedTown,failedResearchHasNoContract
    };
  })()`,
  context,
  { timeout: 30000 }
);

assert.equal(result.entryChoices, 3);
assert.equal(result.reviewChoices, 3);
assert(result.localGate, 'the aftermath remains tied to Iberia');
assert.equal(result.jobBefore, 3);
assert.equal(result.jobAfterEntry, 3, 'a short contract must not become a permanent day-labor occupation');
assert.deepEqual([result.affiliationStatus, result.episodeCount, result.goalAtStart], ['left', 1, 'active']);
assert(result.oneYearHidden && result.twoYearVisible, 'the review waits for two years after the short contract');
assert.deepEqual([result.repeat.job, result.repeat.episodes, result.repeat.status, result.repeat.goal, result.repeat.audit.length], [3, 2, 'left', 'active', 0]);
assert.deepEqual([result.noOpening.job, result.noOpening.goal, result.noOpening.audit.length], [3, 'paused', 0]);
assert.deepEqual([result.otherWork.goal, result.otherWork.audit.length], ['compromised', 0]);
assert.deepEqual([result.end.goal, result.end.audit.length], ['abandoned', 0]);
assert(result.noRouteHidden && result.movedOutsideIberiaHidden, 'the aftermath needs the original route and current region');
assert(result.movedWithinIberiaVisible && result.reviewAvoidsUntrackedTown, 'a regional job notice must not claim the worker returned to an unrecorded town');
assert(result.failedResearchHasNoContract, 'an unsuccessful record search must not invent a work contract');

console.log(JSON.stringify({
  passed: true,
  shortContractDoesNotChangePermanentOccupation: true,
  twoYearFollowupAndThreeClosures: true,
  failedResearchCreatesNoEmployment: true,
  regionalNoticeDoesNotInventWorksiteTown: true,
  regionAndRouteGates: true,
  auditErrors: 0
}, null, 2));
