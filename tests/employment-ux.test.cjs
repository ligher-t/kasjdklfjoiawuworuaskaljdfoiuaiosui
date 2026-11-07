'use strict';
// High-value boundaries: an undiscovered world vacancy is not a known offer;
// a search is not consent; rendering and resuming do not consume decision quota;
// optional recruitment never hides a due medical decision.
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname, '..'));
setup(ctx, {id:'employment-ux', seed:20261105, region:'クルビア', age:24});
const evaluate = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())', ctx, {timeout:10000}));
const knowledge = evaluate(`
  S.job=0; S.mo=2;
  const area=occupationAreaSnapshot(S), world=S.world.occupationWorld,
    siteId='ux-site', positionId='ux-position', openingId='ux-opening', employerId='ux-employer';
  world.employers[employerId]={employerId,organizationKey:null,kind:'anonymous-operator'};
  world.sites[siteId]={siteId,employerId,areaId:area.areaId,status:'open',positionIds:[positionId]};
  world.positions[positionId]={positionId,siteId,jobId:2,capacity:1,aggregateOccupiedSlots:0,
    identifiedOccupiedSlots:0,reservedSlots:0,vacancyCount:1,openingIds:[openingId]};
  world.openings[openingId]={openingId,employerId,siteId,positionId,areaId:area.areaId,
    kind:'general-public',status:'open',slots:1,validFromYear:S.year};
  area.siteIds.push(siteId);
  const before=JSON.stringify(S),rng=JSON.stringify(RANDOM_STATE),
    unknown=employmentKnownOpenings(S).some(row=>row.openingId===openingId);
  employmentDeskModel(S); employmentDeskModel(S);
  const readOnly=before===JSON.stringify(S)&&rng===JSON.stringify(RANDOM_STATE),
    worldBefore=JSON.stringify(world);
  discoverEmploymentOpenings(S,'local-inquiry','safe');
  const found=employmentKnownOpenings(S).find(row=>row.openingId===openingId),
    informationOnly=S.job===0&&!currentPlayerEmployment(S)&&!S.workContract,
    unchangedWorld=worldBefore===JSON.stringify(world),
    beforeRepeat=S.employmentState.knowledge.length;
  discoverEmploymentOpenings(S,'local-inquiry','safe');
  const noDuplicates=S.employmentState.knowledge.length===beforeRepeat,
    ux=employmentUxFor(S,true);
  ux.pendingOpeningId=openingId;
  const pending=JSON.parse(JSON.stringify(S));
  const restored=employmentPendingOpening(pending)?.openingId===openingId;
  resolveKnownEmploymentOpening(S,false);
  const declined=S.job===0&&!currentPlayerEmployment(S)&&!ux.pendingOpeningId;
  ux.pendingOpeningId=openingId;
  const episode=resolveKnownEmploymentOpening(S,true);
  const accepted=episode?.siteId===siteId&&S.job===2&&world.openings[openingId].slots===0;
  // A prohibited employer's name never becomes a card merely because it is
  // inserted into the person's knowledge by another source.
  world.employers[employerId].organizationKey='penguin-logistics';
  const blockedHidden=!employmentKnownOpenings(S).some(row=>row.openingId===openingId);
  return {unknown,readOnly,found:!!found,informationOnly,unchangedWorld,noDuplicates,restored,declined,accepted,blockedHidden};
`);
assert.equal(knowledge.unknown, false);
for (const key of ['readOnly','found','informationOnly','unchangedWorld','noDuplicates','restored','declined','accepted','blockedHidden'])
  assert.equal(knowledge[key], true, key);

setup(ctx, {id:'employment-ux-quota', seed:20261106, region:'クルビア', age:24});
const quota = evaluate(`
  S.job=0; S.mo=1;
  const a={id:'ux-routine-a',employmentDecisionKind:'routine',workTopicKey:'a',c:[{}]},
    b={id:'ux-routine-b',employmentDecisionKind:'routine',workTopicKey:'b',c:[{}]},
    c={id:'ux-routine-c',employmentDecisionKind:'routine',workTopicKey:'c',c:[{}]},
    different={id:'ux-family',c:[{}]};
  recordEmploymentPrompt(a,S);recordEmploymentDecision(a,S,'待つ');
  const unchanged=!employmentRoutineAvailable(a,S);
  recordEmploymentPrompt(b,S);
  const twoBlocked=!employmentRoutineAvailable(c,S),
    beforeResume=JSON.stringify(S.employmentUx);
  recordEmploymentPrompt(b,S,{resumed:true});
  const resumeStable=beforeResume===JSON.stringify(S.employmentUx);
  employmentDeskModel(S);
  const renderStable=beforeResume===JSON.stringify(S.employmentUx);
  recordEmploymentPrompt(different,S);recordEmploymentPrompt(different,S);
  const fiveWindowBlocked=!employmentRoutineAvailable(c,S);
  recordEmploymentPrompt(different,S);
  const newCapacity=employmentRoutineAvailable(c,S),beforeManual=employmentUxFor(S).presented.length;
  recordEmploymentPrompt(c,S,{userInitiated:true});
  const manualExcluded=employmentUxFor(S).presented.length===beforeManual;
  const beforeRevision=employmentTopicRevision(a,S);
  S.residenceArrangement='independent_rental';
  const changed=employmentTopicRevision(a,S)!==beforeRevision;
  return {unchanged,twoBlocked,resumeStable,renderStable,fiveWindowBlocked,newCapacity,manualExcluded,changed};
`);
for (const [key,value] of Object.entries(quota)) assert.equal(value,true,key);

setup(ctx, {id:'employment-ux-priority', seed:20261107, region:'クルビア', age:24});
const priority = evaluate(`
  S.job=0; S.mo=1; S.educationDecision=null; S.educationPath=null;
  S.q=[]; S.eventSchedule=null;
  const routine={id:'ux-routine',employmentDecisionKind:'routine',pri:true,cd:0,t:'募集の案内がある。',
    c:[{l:'見送る',o:[[1,'今は見送った。',{}]]}]},
    medical={id:'infection_workplace_review',cd:0,t:'勤務先から返事が届いた。',
    c:[{l:'確かめる',o:[[1,'返事を確かめた。',{}]]}]};
  const ux=employmentUxFor(S,true);
  ux.presented=[{kind:'routine'},{kind:'routine'}];
  const original=EV.slice();
  EV.splice(0,EV.length,routine,medical);
  S.infectionWorkplace={reviewDueYear:S.year};
  let event;
  try { slot(0.12); event=S.eventOutcomes?.infection_workplace_review; }
  finally { EV.splice(0,EV.length,...original); }
  return {medicalDelivered:!!event,routineNotDelivered:!S.eventOutcomes?.['ux-routine']};
`);
assert.equal(priority.medicalDelivered,true);
assert.equal(priority.routineNotDelivered,true);
console.log('employment UX knowledge, consent, quota, resume and medical priority PASS');
