'use strict';
const assert = require('node:assert/strict'),
  path = require('node:path'),
  vm = require('node:vm'),
  root = path.resolve(__dirname, '..'),
  { context, setup } = require('./support/annual-cases.cjs');

function fresh(id) {
  const { ctx } = context(root);
  setup(ctx, { id, seed: 907731, region: 'クルビア', age: 32 });
  vm.runInContext(
    `S.inf = 1;
     S.fl.dg = 1;
     S.infection = { year: S.year - 1, cause: '検査で確認', basis: 'test', diagnosedYear: S.year };
     S.job = J.findIndex(row => row.n === '工場労働者');
     S.workContract = null;
     reconcileWorkContract(S);
     if (S.workContract) S.workContract.hours = 'regular';`,
    ctx
  );
  return ctx;
}

function event(ctx, id) {
  return vm.runInContext(`EV.find(row => row.id === ${JSON.stringify(id)})`, ctx);
}

function applyChoice(ctx, id, label, outcomeIndex = 0) {
  const choice = event(ctx, id).c.find(row => row.l === label);
  assert(choice, `${id} is missing choice: ${label}`);
  const effect = choice.o[outcomeIndex]?.[2];
  assert(effect, `${id}/${label} is missing outcome ${outcomeIndex}`);
  vm.runInContext(
    `(() => {
      const previous = TRACE_RESOLUTION;
      TRACE_RESOLUTION = { kind: 'choice', id: ${JSON.stringify(id)}, label: ${JSON.stringify(label)} };
      try { ap(${JSON.stringify(effect)}); } finally { TRACE_RESOLUTION = previous; }
    })()`,
    ctx
  );
  return { choice, effect };
}

function advanceOneYear(ctx) {
  vm.runInContext('S.year += 1; S.age += 1; S.mo = 1;', ctx);
}

{
  const ctx = fresh('infection-workplace-hours'),
    disclosure = 'infection_family_disclosure_choice';
  vm.runInContext('S.par.fa.knownRegion = S.res.n; S.par.mo.knownRegion = S.res.n;', ctx);
  applyChoice(ctx, disclosure, '父にだけ診断を伝え、通院の相談をする');
  const workplaceDisclosure = event(ctx, 'infection_workplace_disclosure'),
    employer = workplaceDisclosure.c.find(choice => choice.l.startsWith('雇用先へ'));
  assert(workplaceDisclosure.show(vm.runInContext('S', ctx)), 'a family disclosure must not block workplace disclosure');
  const firstContract = vm.runInContext('S.workContract', ctx);
  assert(firstContract, 'the disclosed workplace must be tied to the current employment contract');
  applyChoice(ctx, workplaceDisclosure.id, employer.l, 0);
  const initial = vm.runInContext(
    `({ record: S.infectionWorkplace, awareness: S.infectionAwareness?.entries?.filter(row => row.audience === 'employer') || [], dueVisible: EV.find(row => row.id === 'infection_workplace_review').show(S), audit: auditLifeState(S) })`,
    ctx
  );
  assert.equal(initial.record.status, 'awaiting-review');
  assert.equal(initial.record.disclosedJobId, vm.runInContext('S.job', ctx));
  assert.equal(initial.record.siteId, firstContract.siteId);
  assert.equal(initial.record.firstResponse, 'leave-approved-once');
  assert.equal(initial.record.reviewDueYear, vm.runInContext('S.year + 1', ctx));
  assert.equal(initial.awareness.length, 1, 'employer disclosure must be recorded at its chosen scope');
  assert.equal(initial.awareness[0].certainty, 'confirmed');
  assert.equal(initial.awareness[0].source, 'workplace-disclosure');
  assert.equal(initial.awareness[0].recipientRef, initial.record.siteId);
  assert(!vm.runInContext("S.infectionAwareness.entries.some(row => row.audience === 'workplace')", ctx), 'a disclosure to an employer must not imply that coworkers know');
  assert.equal(initial.dueVisible, false, 'the employer follow-up must wait until its recorded year');
  assert.deepEqual(Array.from(initial.audit), []);

  advanceOneYear(ctx);
  const review = event(ctx, 'infection_workplace_review'),
    hoursChoice = review.c.find(choice => choice.l.startsWith('勤務時間を短く'));
  assert(review.show(vm.runInContext('S', ctx)), 'the follow-up must appear when its due year arrives');
  assert(hoursChoice?.show(vm.runInContext('S', ctx)), 'a matching active work contract can request shorter hours');
  const beforeIncome = vm.runInContext(
    'prepareAnnualPersonalBudget(S, ANNUAL_SERVICES, S.age, S.t, S.f).inc',
    ctx
  );
  applyChoice(ctx, 'infection_workplace_review', hoursChoice.l, 0);
  const after = vm.runInContext(
    `({
      record: S.infectionWorkplace,
      hours: S.workContract?.hours,
      income: prepareAnnualPersonalBudget(S, ANNUAL_SERVICES, S.age, S.t, S.f).inc,
      contractHistory: S.workContractHistory.at(-1),
      trace: traceState(S).infectionWorkplace,
      recordText: lifeRows(S).find(row => row[0] === '鉱石病を伝えた勤務先との経過')?.[1],
      audit: auditLifeState(S)
    })`,
    ctx
  );
  assert.equal(after.record.status, 'reviewed');
  assert.equal(after.record.reviewOutcome, 'hours-approved');
  assert.equal(after.record.reviewedYear, vm.runInContext('S.year', ctx));
  assert.equal(after.hours, 'short');
  assert(after.income < beforeIncome, 'approved shorter hours must reduce the modeled annual income');
  assert.equal(after.contractHistory.action, 'hours');
  assert.equal(after.contractHistory.outcome, 'approved');
  assert.deepEqual(after.trace, after.record, 'the life trace must retain the same workplace response');
  assert.match(after.recordText, /短時間勤務を承認/);
  assert.deepEqual(Array.from(after.audit), []);

  const roundTrip = vm.runInContext(
    `(() => {
      const snapshot = makeResumeSnapshot();
      writeResumeSlot(0, { savedAt: snapshot.savedAt, snapshot });
      const saved = readResumeSlots().slots[0].snapshot;
      const loaded = cont(normalizeResumeImport(JSON.parse(JSON.stringify(saved))));
      return { loaded, record: S.infectionWorkplace, audit: auditLifeState(S) };
    })()`,
    ctx
  );
  assert.equal(roundTrip.loaded, true, 'the current save format must restore the workplace response');
  assert.deepEqual(roundTrip.record, after.record);
  assert.deepEqual(Array.from(roundTrip.audit), []);
  vm.runInContext('S.infectionWorkplace.reviewedYear = S.year + 1;', ctx);
  assert(
    vm.runInContext('auditLifeState(S)', ctx).includes('診断開示後の勤務先・就労経過が不正'),
    'the state audit must reject a future-dated workplace review'
  );
}

{
  const ctx = fresh('infection-workplace-assignment'),
    disclosure = 'infection_workplace_disclosure';
  vm.runInContext(
    `S.job = J.findIndex(row => row.n === '鉱夫'); S.workContract = null; reconcileWorkContract(S);`,
    ctx
  );
  applyChoice(ctx, disclosure, '雇用先へ診断を伝え、通院日の休みを相談する', 0);
  advanceOneYear(ctx);
  const review = event(ctx, 'infection_workplace_review'),
    assignmentChoice = review.c.find(choice => choice.l.startsWith('負担の大きい工程から'));
  assert(assignmentChoice?.show(vm.runInContext('S', ctx)), 'an exposed current job may request a placement change');
  const originalExposure = vm.runInContext('J[S.job].ex', ctx);
  vm.runInContext('J[S.job].ex = 1', ctx);
  assert.equal(assignmentChoice.show(vm.runInContext('S', ctx)), false, 'low-exposure jobs must not offer this route');
  vm.runInContext(`J[S.job].ex = ${originalExposure}`, ctx);
  const beforeIncome = vm.runInContext(
    'prepareAnnualPersonalBudget(S, ANNUAL_SERVICES, S.age, S.t, S.f).inc',
    ctx
  );
  applyChoice(ctx, review.id, assignmentChoice.l, 0);
  const approved = vm.runInContext(
    `({
      record: S.infectionWorkplace,
      assignment: S.workContract?.assignment,
      exposureAction: S.oripathyExposure.history.at(-1),
      income: prepareAnnualPersonalBudget(S, ANNUAL_SERVICES, S.age, S.t, S.f).inc,
      history: S.workContractHistory.at(-1),
      trace: traceState(S),
      recordText: lifeRows(S).find(row => row[0] === '鉱石病を伝えた勤務先との経過')?.[1],
      contractText: lifeRows(S).find(row => row[0] === '勤務先との契約')?.[1],
      audit: auditLifeState(S)
    })`,
    ctx
  );
  assert.equal(approved.record.reviewOutcome, 'assignment-approved');
  assert.equal(approved.assignment, 'adjusted');
  assert.equal(approved.exposureAction.kind, 'adjust-assignment');
  assert.equal(approved.income, beforeIncome, 'placement alone must not invent a wage change');
  assert.equal(approved.history.action, 'assignment');
  assert.equal(approved.history.outcome, 'approved');
  assert.equal(approved.trace.workContractAssignment, 'adjusted');
  assert.equal(approved.trace.infectionWorkplace.reviewOutcome, 'assignment-approved');
  assert.match(approved.recordText, /負担の大きい工程から配置変更/);
  assert.match(approved.contractText, /担当工程を変更/);
  assert.deepEqual(Array.from(approved.audit), []);

  const roundTrip = vm.runInContext(
    `(() => {
      const snapshot = makeResumeSnapshot();
      writeResumeSlot(0, { savedAt: snapshot.savedAt, snapshot });
      const saved = readResumeSlots().slots[0].snapshot;
      const loaded = cont(normalizeResumeImport(JSON.parse(JSON.stringify(saved))));
      return { loaded, assignment: S.workContract?.assignment, audit: auditLifeState(S) };
    })()`,
    ctx
  );
  assert.equal(roundTrip.loaded, true, 'the assigned-work state must restore in the current save format');
  assert.equal(roundTrip.assignment, 'adjusted');
  assert.deepEqual(Array.from(roundTrip.audit), []);

  vm.runInContext(`S.workContract.assignment = 'invalid'`, ctx);
  assert(
    vm.runInContext('auditLifeState(S)', ctx).includes('勤務契約と現在の在籍が不一致'),
    'the state audit must reject an unknown assignment state'
  );
  vm.runInContext(`S.workContract.assignment = 'adjusted'`, ctx);

  vm.runInContext(
    `(() => {
      const next = J.findIndex((row, index) => index > 0 && index !== S.job);
      S.job = next;
      ensureLocalityState(S);
      reconcileWorkContract(S);
    })()`,
    ctx
  );
  assert.deepEqual(
    Array.from(vm.runInContext('auditLifeState(S)', ctx)),
    [],
    'the reviewed workplace outcome must remain valid after later employment changes'
  );
  assert(
    vm.runInContext('S.workContractHistory.some(row => row.action === "ended" && row.assignment === "adjusted")', ctx),
    'the former contract history must retain the accepted placement state'
  );
}

{
  const ctx = fresh('infection-workplace-assignment-declined');
  vm.runInContext(
    `S.job = J.findIndex(row => row.n === '鉱夫'); S.workContract = null; reconcileWorkContract(S);`,
    ctx
  );
  applyChoice(ctx, 'infection_workplace_disclosure', '雇用先へ診断を伝え、通院日の休みを相談する', 1);
  advanceOneYear(ctx);
  applyChoice(ctx, 'infection_workplace_review', '負担の大きい工程から外れる配置を相談する', 1);
  const after = vm.runInContext(
    `({ record: S.infectionWorkplace, assignment: S.workContract?.assignment, history: S.workContractHistory.at(-1), audit: auditLifeState(S) })`,
    ctx
  );
  assert.equal(after.record.reviewOutcome, 'assignment-declined');
  assert.equal(after.assignment, 'usual', 'a declined request must leave the assignment unchanged');
  assert.equal(after.history.action, 'assignment');
  assert.equal(after.history.outcome, 'declined');
  assert.deepEqual(Array.from(after.audit), []);
}

{
  const ctx = fresh('infection-workplace-voluntary-exit'),
    disclosure = 'infection_family_disclosure_choice';
  applyChoice(ctx, 'infection_workplace_disclosure', '雇用先へ診断を伝え、通院日の休みを相談する', 1);
  advanceOneYear(ctx);
  applyChoice(ctx, 'infection_workplace_review', '仕事を辞め、受診時間を確保する');
  const after = vm.runInContext(
    `({
      job: S.job,
      record: S.infectionWorkplace,
      change: S.lifeRecord.careerChanges.at(-1),
      income: prepareAnnualPersonalBudget(S, ANNUAL_SERVICES, S.age, S.t, S.f).inc,
      audit: auditLifeState(S)
    })`,
    ctx
  );
  assert.equal(after.job, 0);
  assert.equal(after.record.status, 'left-employment');
  assert.equal(after.record.reviewOutcome, 'left-by-player');
  assert.equal(after.change.toJobId, 0, 'the chosen exit must continue into the career history');
  assert.equal(after.income, 0, 'the next annual wage model must reflect the chosen exit');
  assert.deepEqual(Array.from(after.audit), []);
}

{
  const ctx = fresh('infection-workplace-job-change');
  applyChoice(ctx, 'infection_workplace_disclosure', '雇用先へ診断を伝え、通院日の休みを相談する');
  vm.runInContext(
    `(() => {
      const next = J.findIndex((row, index) => index > 0 && index !== S.job);
      if (next < 1) throw Error('A second valid occupation is required for the workplace transition check');
      S.job = next;
      ensureLocalityState(S);
      reconcileWorkContract(S);
    })()`,
    ctx
  );
  const after = vm.runInContext(
    `({
      job: S.job,
      record: S.infectionWorkplace,
      reviewVisible: EV.find(row => row.id === 'infection_workplace_review').show(S),
      audit: auditLifeState(S)
    })`,
    ctx
  );
  assert.notEqual(after.job, after.record.disclosedJobId);
  assert.equal(after.record.status, 'employment-changed');
  assert.equal(after.record.reviewOutcome, 'occupation-changed');
  assert.equal(after.record.reviewJobId, after.job);
  assert.equal(after.reviewVisible, false, 'a former employer review must close when the occupation changes');
  assert.deepEqual(Array.from(after.audit), []);
}

// Retention boundaries must not turn an old completed review into a new invariant failure.
{
 const ctx=fresh('retained-work-review');
 const result=vm.runInContext(`(()=>{
   S.infectionWorkplace={version:1,status:'reviewed',disclosedYear:S.year-10,disclosedJobId:S.job,siteId:'retention-site',firstResponse:'leave-approved-once',firstResponseYear:S.year-10,reviewDueYear:S.year-9,reviewedYear:S.year-9,reviewOutcome:'assignment-approved',reviewJobId:S.job,reviewSiteId:'retention-site'};
   S.fl.infection_work_disclosed=1;
   S.workContractHistory=Array.from({length:80},(_,i)=>({year:S.year-8+Math.floor(i/10),action:'started',siteId:'retention-site',jobId:S.job}));
   const problems=()=>{const issues=[];auditSocialAndFacilityState(S,issues);return issues.includes('診断開示後の勤務先・就労経過が不正');};
   const expired=problems();
   S.workContractHistory.pop();const shorter=problems();
   S.workContractHistory.push({year:S.infectionWorkplace.reviewedYear,action:'started',siteId:'retention-site',jobId:S.job});const retainedMissing=problems();
   S.workContractHistory[S.workContractHistory.length-1]={year:S.infectionWorkplace.reviewedYear,action:'assignment',outcome:'approved',siteId:'retention-site',jobId:S.job};const matched=problems();
   return {expired,shorter,retainedMissing,matched};
 })()`,ctx);
 assert.equal(result.expired,false);
 assert.equal(result.shorter,true,'a short history does not establish that missing evidence was pruned');
 assert.equal(result.retainedMissing,true,'missing assignment within the retained year window is still an error');
 assert.equal(result.matched,false);
}
console.log(
  JSON.stringify({
    passed: true,
    familyAndWorkplaceDisclosureAreIndependent: true,
    employerResponseWaitsForReviewYear: true,
    shorterHoursPersistIntoAnnualIncomeAndTrace: true,
    placementChangePersistsWithoutInventingWageChange: true,
    declinedPlacementKeepsUsualAssignment: true,
    voluntaryExitPersistsIntoCareerAndIncome: true,
    changedOccupationClosesFormerEmployerReview: true,
    currentSaveRoundTripAndStateAudit: true
  })
);
