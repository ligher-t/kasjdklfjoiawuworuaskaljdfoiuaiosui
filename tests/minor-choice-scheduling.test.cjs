'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context, setup } = require('./support/annual-cases.cjs');

const { ctx, nodes } = context(path.resolve(__dirname, '..'));
const read = code => JSON.parse(vm.runInContext(
  'JSON.stringify((()=>{return (' + code + ');})())', ctx, { timeout: 15000 }
));
const run = code => vm.runInContext(code, ctx, { timeout: 15000 });
setup(ctx, { id: 'minor-schedule', seed: 905888, region: 'クルビア', age: 28 });

const candidateCountInvariant = read(`(()=>{
  const originalRandom=DEBUG_RANDOM,
    generalOne=[{id:'g1',lifeSystemFamily:'general'}],
    generalMany=Array.from({length:100},(_,i)=>({id:'g'+i,lifeSystemFamily:'general'})),
    arts=[{id:'arts',lifeSystemFamily:'arts'}];
  try {
    DEBUG_RANDOM=()=>0.64;
    const generalWithOne=chooseOrdinaryMinorChoice([...generalOne,...arts],S,tags(S));
    const generalWithMany=chooseOrdinaryMinorChoice([...generalMany,...arts],S,tags(S));
    DEBUG_RANDOM=()=>0.95;
    const artsWithOne=chooseOrdinaryMinorChoice([...generalOne,...arts],S,tags(S));
    const artsWithMany=chooseOrdinaryMinorChoice([...generalMany,...arts],S,tags(S));
    return {generalWithOne:generalWithOne.lifeSystemFamily,generalWithMany:generalWithMany.lifeSystemFamily,
      artsWithOne:artsWithOne.lifeSystemFamily,artsWithMany:artsWithMany.lifeSystemFamily};
  } finally { DEBUG_RANDOM=originalRandom; }
})()`);
assert.deepEqual(candidateCountInvariant, {
  generalWithOne: 'general', generalWithMany: 'general', artsWithOne: 'arts', artsWithMany: 'arts'
}, 'adding 100 same-family minor events must not change either family budget');
const combinedMinorBudget = read(`(()=>[0,0.07,0.15,0.25].map(social=>{
  const ordinary=ordinaryMinorChoiceChance(social);
  return Number((social+(1-social)*ordinary).toFixed(12));
}))()`);
assert.deepEqual(combinedMinorBudget, [0.25,0.25,0.25,0.25],
  'social and ordinary minor categories together must stay within the 25% daily-slot budget');
const socialBudgetCap = read(`(()=>{
  const region=S.res.n;
  try {
    S.res.n='ウルサス';
    return socialMinorChoiceBudget([
      {interactionScope:'minor',c:[{}],socialConstraint:{group:'ordinary-contrast'}},
      {interactionScope:'minor',c:[{}],socialConstraint:{group:'daily-bias',target:'感染者'}},
      {interactionScope:'minor',c:[{}],socialConstraint:{group:'daily-bias',target:'市民'}}
    ],S);
  } finally { S.res.n=region; }
})()`);
assert.equal(socialBudgetCap, 0.25,
  'even maximum-pressure social candidates must be capped before ordinary minor choices are budgeted');
const socialFamilyInvariant = read(`(()=>{
  const originalRandom=DEBUG_RANDOM,originalRegion=S.res.n,
    contrast={id:'social-contrast',interactionScope:'minor',c:[{o:[[1,'ok',{}]]}],w:1,
      socialConstraint:{group:'ordinary-contrast'}},
    infectedOne=[{id:'infected-one',interactionScope:'minor',c:[{o:[[1,'ok',{}]]}],w:1,
      socialConstraint:{group:'daily-bias',target:'感染者'}}],
    infectedMany=Array.from({length:100},(_,i)=>({id:'infected-'+i,interactionScope:'minor',c:[{o:[[1,'ok',{}]]}],w:1,
      socialConstraint:{group:'daily-bias',target:'感染者'}}));
  const select=events=>{
    const draws=[0.1,0.3,0.2];
    DEBUG_RANDOM=()=>draws.shift()??0.2;
    return chooseSocialMinorChoice(events,S,tags(S))?.socialConstraint?.group||null;
  };
  try {
    S.res.n='ウルサス';
    return {one:select([contrast,...infectedOne]),many:select([contrast,...infectedMany])};
  } finally { DEBUG_RANDOM=originalRandom;S.res.n=originalRegion; }
})()`);
assert.deepEqual(socialFamilyInvariant, {one:'daily-bias',many:'daily-bias'},
  'adding same-group discrimination events must not increase that category budget');
const slotSource = vm.runInContext('slot.toString()', ctx);
assert.match(slotSource,
  /R\(\) < ordinaryMinorChoiceChance\(socialMinorShare\)[\s\S]*?chooseOrdinaryMinorChoice\(ordinaryMinorChoices, s, T\)/,
  'the ordinary minor-choice slot must use the remaining combined category budget');
assert.match(slotSource, /chooseSocialMinorChoice\(socialMinorChoices, s, T\)/,
  'the social minor-choice slot must use the shared capped category budget');

const dueAtContract = read(`(()=>{
  const event={id:'fixture-deadline',scheduledAt:state=>({year:state.year,month:3})};
  S.mo=2;
  const before=scheduledFollowupDuePeriod(event,S);
  S.mo=3;
  const due=scheduledFollowupDuePeriod(event,S);
  return {before,due,expected:S.year*12+3,year:S.year};
})()`);
assert.equal(dueAtContract.before, null, 'a scheduled event must not appear before its owner date');
assert.equal(dueAtContract.due, dueAtContract.expected,
  'the common dispatcher consumes the event-level scheduledAt contract as year/month');

const scope = read(`({minor:isMinorChoiceEvent({interactionScope:'minor'}),
  major:isMinorChoiceEvent({interactionScope:'major'}),
  legacy:isMinorChoiceEvent({c:[{}]})})`);
assert.deepEqual(scope, { minor: true, major: false, legacy: false },
  'legacy choice scope remains major while explicit minor choices use the separate monthly gate');

const pendingEventId = 'fixture_minor_resume_once';
ctx.PENDING_EVENT_ID = pendingEventId;
run(`(()=>{
  const e={id:PENDING_EVENT_ID,interactionScope:'minor',t:'短い日常の選択。',
    c:[{l:'記録を一度つける',o:[[1,'記録をつけた。',{cash:100}]]}]};
  HL=0;AU='';S.mo=3;
  EV.push(e);
  S.ev=e;
  S.evBefore=traceState(S);
  ask(e,tags(S),e.t,traceState(S));
})()`);
const pending = read('({id:S.ev?.id,major:S.majorEventMonth,minor:S.minorEventMonth,cash:S.cash,houseCash:S.house?.cash||0})');
assert.equal(pending.id, pendingEventId);
assert.equal(pending.major, null, 'minor presentation does not consume major-choice capacity');
assert.deepEqual(pending.minor, { year: dueAtContract.year, month: 3 });

const serialized = vm.runInContext('JSON.stringify(makeResumeSnapshot())', ctx);
ctx.PENDING_SNAPSHOT = JSON.parse(serialized);
const resumed = read(`(()=>{
  const snapshot=normalizeResumeImport(PENDING_SNAPSHOT);
  S=snapshot.S;
  const before={eventId:S.ev.id,minor:S.minorEventMonth,cash:S.cash};
  const restored=restorePendingChoice();
  return {restored,before,afterEvent:S.ev?.id||null};
})()`);
assert.equal(resumed.restored, true, 'a same-version save restores the same pending minor event');
assert.equal(resumed.before.eventId, pendingEventId);
assert.deepEqual(resumed.before.minor, pending.minor);
assert.equal(resumed.afterEvent, pendingEventId);

const button = nodes.get('created-button');
assert.equal(typeof button?.onclick, 'function', 'resumed choice renders one actionable result');
button.onclick();
const resolved = read(`({cash:S.cash,houseCash:S.house?.cash||0,event:S.ev?.id||null,record:S.eventOutcomes?.[PENDING_EVENT_ID]||null,
  major:S.majorEventMonth,minor:S.minorEventMonth})`);
assert.equal(resolved.cash + resolved.houseCash, pending.cash + pending.houseCash + 100,
  'the pending result applies once to the acting household wallet');
assert.equal(resolved.event, null);
assert.equal(resolved.record.year, dueAtContract.year);
assert.equal(resolved.major, null);
assert.deepEqual(resolved.minor, pending.minor);
assert.equal(read('restorePendingChoice()'), false, 'a resolved event cannot be applied a second time');

console.log('PASS minor-family budgets, scheduledAt priority date, monthly scope and pending-choice resume');
