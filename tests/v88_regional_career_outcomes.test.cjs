'use strict';
// Selected regression cases for the story-to-state contract. No life cohort run.
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname, '..'));
const run = src => vm.runInContext(src,ctx);
const snap = src => JSON.parse(run('JSON.stringify((()=>{'+src+'})())'));
function start(region, species='エラフィア') {
  setup(ctx,{id:'regional-career-outcomes',seed:740011,region,age:24});
  ctx.TEST_SPECIES=species;
  run('S.r={...S.r,n:TEST_SPECIES}; S.age=24; S.year=1098; S.mo=6; S.job=0; S.fl.retired=0; S.fl.inf=0; S.sn={};');
}
// Exercise the actual event dispatcher once, not a manually fabricated result.
start('イベリア');
const dispatchResult=snap(`
  rd=()=>{}; syncUIDialogs=()=>{}; $('stt').focus=()=>{}; // VM has no visual DOM
  AU='r';HL=0;
  const e=EV.find(x=>x.id==='car_ibe_inq_entry');
  fire(e,S,tags(S));
  const row=S.eventOutcomes?.[e.id];
  return {hasOutcome:!!row,year:row?.year,sn:S.sn[e.id],
    choiceIndex:row?.choiceIndex,outcomeIndex:row?.outcomeIndex,
    valid:!!row&&row.choiceIndex>=0&&row.choiceIndex<e.c.length&&
      row.outcomeIndex>=0&&row.outcomeIndex<e.c[row.choiceIndex].o.length};
`);
assert.equal(dispatchResult.hasOutcome,true,'an actually dispatched choice must record its concrete result');
assert.equal(dispatchResult.year,dispatchResult.sn,'result year must match the event occurrence');
assert.equal(dispatchResult.valid,true,'recorded indices must identify the selected choice and actual result');

start('イベリア');
assert.deepEqual(snap(`
  const e=EV.find(x=>x.id==='car_ibe_inq_entry'), choices=simulationChoiceStates(e,S,tags(S));
  return {eligible:elig(e,S,tags(S)),visible:choices.map(x=>x.shown)};
`),{eligible:true,visible:[true,false,true]},'non-Aegir applicant cannot receive the Aegir-only result');
let ordinary=snap(`
  const e=EV.find(x=>x.id==='car_ibe_inq_entry');
  ap(e.c[0].o[0][2]);
  return {job:S.job,detained:!!S.fl.detained,
    employer:S.lifeRecord.affiliations.find(x=>x.id==='iberia-inquisition-officer')?.status,
    role:S.lifeRecord.affiliations.find(x=>x.id==='iberia-inquisition-officer')?.role};
`);
assert.equal(ordinary.job,76);
assert.equal(ordinary.detained,false);
assert.equal(ordinary.employer,'active');
assert.equal(ordinary.role,'見習い審問官');

start('イベリア','エーギル');
assert.deepEqual(snap(`
  const e=EV.find(x=>x.id==='car_ibe_inq_entry'), choices=simulationChoiceStates(e,S,tags(S));
  return {eligible:elig(e,S,tags(S)),visible:choices.map(x=>x.shown)};
`),{eligible:true,visible:[false,true,true]},'Aegir applicant sees only the species-specific route plus withdrawal');
const detention=snap(`
  const e=EV.find(x=>x.id==='car_ibe_inq_entry');
  ap(e.c[1].o[1][2]);
  const confined=EV.find(x=>x.id==='detain_life'),
    now={restricted:restricted(S),job:S.job,available:elig(confined,S,tags(S))};
  ap(confined.c[2].o[0][2]);
  return {now, released:!restricted(S),availableAfter:elig(confined,S,tags(S))};
`);
assert.deepEqual(detention,{now:{restricted:true,job:0,available:true},released:true,availableAfter:false},
  'actual detention opens confinement, and review release closes it');

start('サルゴン');
const outcome=snap(`
  const entry=EV.find(x=>x.id==='car_sar_guard_entry'),
    incident=EV.find(x=>x.id==='car_sar_guard_choice_assassination');
  ap(entry.c[0].o[0][2]);
  const before=S.lifeRecord.affiliations.find(x=>x.id==='sargon-padishah-guard');
  const eligible=elig(incident,S,tags(S));
  const former=before.role;
  ap(incident.c[0].o[0][2]);
  const after=S.lifeRecord.affiliations.find(x=>x.id==='sargon-padishah-guard');
  S.sn[incident.id]=S.year;
  const repeat=elig(incident,S,tags(S));
  return {eligible,former,role:after.role,changeRecorded:after.history.some(x=>x.action==='role'&&x.role==='親衛隊長'),repeat};
`);
assert.equal(outcome.eligible,true);
assert.equal(outcome.role,'親衛隊長');
assert.notEqual(outcome.former,outcome.role);
assert.equal(outcome.changeRecorded,true,'the new role persists in affiliation history');
assert.equal(outcome.repeat,false,'same palace attack must not repeat after a cooldown');

assert.deepEqual(snap(`
  const incident=EV.find(x=>x.id==='car_sar_guard_choice_assassination'),
    followup={id:'test-actual-outcome-consequence',st:['青年','壮年'],
      after:{id:incident.id,min:1,choice:0,outcome:0},fx:{},w:1,t:'not dispatched'};
  S.year++;S.age++;S.sn[incident.id]=S.year-1;
  const missing=elig(followup,S,tags(S));
  S.eventOutcomes={[incident.id]:{year:S.year-1,choiceIndex:0,outcomeIndex:1}};
  const wrong=elig(followup,S,tags(S));
  S.eventOutcomes[incident.id].outcomeIndex=0;
  const correct=elig(followup,S,tags(S));
  const roundtrip=JSON.parse(JSON.stringify(S)).eventOutcomes[incident.id].outcomeIndex;
  return {missing,wrong,correct,roundtrip};
`),{missing:false,wrong:false,correct:true,roundtrip:0},
  'result-dependent after requires the actual result and is serializable');
console.log('PASS Aegir gate, non-Aegir route, custody-release, promotion history, once-only and after-outcome');
