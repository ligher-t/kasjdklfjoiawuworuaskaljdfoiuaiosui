'use strict';
const assert = require('node:assert/strict'),
  path = require('node:path'),
  vm = require('node:vm'),
  root = path.resolve(__dirname, '..'),
  { context, setup } = require('./support/annual-cases.cjs'),
  { ctx } = context(root);

setup(ctx, { id: 'illness-work-exit', seed: 905121, region: 'カジミエーシュ', age: 95 });
vm.runInContext(`(() => {
  S.job = 20;
  S.fl.retired = 0;
  S.h = 12;
  S.w.i = 3;
  S.sp = null;
  S.children = [];
  S.lifeRecord.careerChanges = [];
  S.illness = { kind: 'chronic', stage: 2, startedYear: S.year - 1, reviewed: 0, treated: false, causeTexts: [] };
})()`, ctx);

const transition = vm.runInContext(`(() => {
  const event = EV.find(row => row.id === 'illness_review');
  const choice = event.c.find(row => row.l === '仕事を辞めて療養する');
  const visibleWhileEmployed = choice.show(S);
  S.job = 0;
  const hiddenWhenUnemployed = !choice.show(S);
  S.job = 20;
  const before = prepareAnnualPersonalBudget(S, ANNUAL_SERVICES, S.age, S.t, S.f).inc;
  ap(choice.o[0][2]);
  const after = prepareAnnualPersonalBudget(S, ANNUAL_SERVICES, S.age, S.t, S.f).inc;
  return {
    visibleWhileEmployed,
    hiddenWhenUnemployed,
    job: S.job,
    lastCareerChange: S.lifeRecord.careerChanges.at(-1),
    before,
    after
  };
})()`, ctx);
assert(transition.visibleWhileEmployed, 'the work-exit choice is available to a person with a job');
assert(transition.hiddenWhenUnemployed, 'the work-exit choice is hidden when there is no job to leave');
assert.equal(transition.job, 0, 'choosing medical rest must end the current job');
assert.equal(transition.lastCareerChange.fromJobId, 20);
assert.equal(transition.lastCareerChange.toJobId, 0);
assert(transition.before > 0, 'the employed state should have wage income');
assert.equal(transition.after, 0, 'the next annual budget must not pay wages for a job that was left');

const followup = vm.runInContext(`EV.find(row => row.id === 'illness_followup').c.find(row => row.l === '仕事を離れ、手元の薬と休養でしのぐ')`, ctx);
assert(followup, 'the later-care choice must describe leaving work as well');
assert.equal(followup.o[0][2].job, 0, 'the later-care choice must also end the job it says it leaves');
console.log('PASS severe-illness work exit records career termination, removes later wage income and is available only while employed');
