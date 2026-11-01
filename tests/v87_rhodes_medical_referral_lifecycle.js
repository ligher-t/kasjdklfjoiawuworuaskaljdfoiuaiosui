'use strict';
const assert = require('node:assert/strict'),
  path = require('node:path'),
  vm = require('node:vm'),
  root = path.resolve(__dirname, '..'),
  { context, setup } = require('./support/annual-cases.cjs');

function fresh(id) {
  const { ctx } = context(root);
  setup(ctx, { id, seed: 882041, region: 'クルビア', age: 32 });
  vm.runInContext(
    `S.year = 1095; S.mo = 1; S.age = 32; S.cash = 1e6; S.debt = 0;
     S.inf = 1; S.fl.dg = 1; S.fl.tx = 0;
     S.infection = { year: S.year - 1, cause: '診療所で診断', basis: 'test', diagnosedYear: S.year };`,
    ctx
  );
  return ctx;
}

function event(ctx, id) {
  return vm.runInContext(`EV.find(row => row.id === ${JSON.stringify(id)})`, ctx);
}

function eligible(ctx, id) {
  return vm.runInContext(
    `elig(EV.find(row => row.id === ${JSON.stringify(id)}), S, tags(S))`,
    ctx
  );
}

function choiceVisible(ctx, id, label) {
  return vm.runInContext(
    `(() => { const choice = EV.find(row => row.id === ${JSON.stringify(id)}).c.find(row => row.l === ${JSON.stringify(label)}); return !!choice && ok(choice.show, S, tags(S)) && ok(choice.en, S, tags(S)); })()`,
    ctx
  );
}

function applyChoice(ctx, id, label, outcomeIndex = 0) {
  const choice = event(ctx, id).c.find(row => row.l === label);
  assert(choice, `${id} is missing choice: ${label}`);
  const effect = choice.o[outcomeIndex]?.[2];
  assert(effect, `${id}/${label} is missing outcome ${outcomeIndex}`);
  vm.runInContext(
    `(() => {
      S.sn[${JSON.stringify(id)}] = S.year;
      const previous = TRACE_RESOLUTION;
      TRACE_RESOLUTION = { kind: 'choice', id: ${JSON.stringify(id)}, label: ${JSON.stringify(label)} };
      try { ap(${JSON.stringify(effect)}); } finally { TRACE_RESOLUTION = previous; }
    })()`,
    ctx
  );
  return choice;
}

function advanceYear(ctx) {
  vm.runInContext('S.year += 1; S.age += 1; S.mo = 1;', ctx);
}

function beginReferral(ctx) {
  applyChoice(ctx, 'life_rhodes_referral', '紹介状を受け取り、療養の相談を頼む');
  assert(vm.runInContext('tags(S).has("ロドスへ療養相談を申し込み中")', ctx));
  advanceYear(ctx);
  assert(eligible(ctx, 'life_rhodes_referral_response'));
  applyChoice(ctx, 'life_rhodes_referral_response', '次の巡回時の相談枠を予約する');
  assert(vm.runInContext('tags(S).has("ロドスと継続連絡中")', ctx));
  assert.equal(vm.runInContext('tags(S).has("ロドス巡回診療の予約あり")', ctx), false);
  assert.equal(
    eligible(ctx, 'life_rhodes_role_review'),
    false,
    'the general Rhodes review must not overwrite a newly booked medical appointment'
  );
  advanceYear(ctx);
  assert(eligible(ctx, 'life_rhodes_clinic_visit'));
}

{
  const ctx = fresh('rhodes-medical-route'),
    diagnosis = event(ctx, 'life_rhodes_referral');
  assert.equal(diagnosis.ge.year, 1095, 'the first Rhodes medical referral must respect the organization date');
  assert(!vm.runInContext('tags(S).has("ロドスへ療養相談を申し込み中")', ctx));
  beginReferral(ctx);

  const visit = event(ctx, 'life_rhodes_clinic_visit'),
    selfPay = visit.c.find(choice => choice.l === '受診し、費用を手元の資金から払う');
  assert(selfPay?.en, 'the cash payment must have a modeled affordability condition');
  assert(choiceVisible(ctx, visit.id, selfPay.l));
  const beforeCash = vm.runInContext('inSharedHousehold(S) ? (S.house?.cash || 0) : S.cash', ctx),
    scale = vm.runInContext('S.res.pm * S.priceIndex', ctx);
  applyChoice(ctx, visit.id, selfPay.l);
  const afterVisit = vm.runInContext(
    `({
      cash: inSharedHousehold(S) ? (S.house?.cash || 0) : S.cash,
      debt: S.debt + (S.house?.debt || 0),
      tx: S.fl.tx,
      affiliation: S.lifeRecord.affiliations.find(row => row.id === 'rhodes-care'),
      tags: Array.from(tags(S)),
      recordText: lifeRows(S).find(row => row[0] === 'ロドスの診療経路')?.[1],
      annualTreatment: prepareAnnualPersonalBudget(S, ANNUAL_SERVICES, S.age, S.t, S.f).tcGross,
      audit: auditLifeState(S)
    })`,
    ctx
  );
  assert.equal(afterVisit.cash, beforeCash - 3e4 * scale, 'the consultation and travel cost is charged once at the regional price rate');
  assert.equal(afterVisit.debt, 0);
  assert.equal(afterVisit.tx, 0, 'an examination alone must not start ongoing treatment');
  assert.equal(afterVisit.affiliation.role, '巡回診療を受診済み');
  assert.match(afterVisit.recordText, /診察を受け/);
  assert.equal(afterVisit.annualTreatment, 0, 'recurring treatment expense starts only after the player chooses treatment');
  assert.equal(afterVisit.tags.includes('ロドス巡回診療後の療養確認'), false);
  assert.deepEqual(Array.from(afterVisit.audit), []);
  assert.equal(eligible(ctx, 'life_rhodes_role_review'), false);

  advanceYear(ctx);
  const careReview = event(ctx, 'life_rhodes_care_review');
  assert(eligible(ctx, careReview.id), 'the post-consultation decision must arrive after the visit');
  applyChoice(ctx, careReview.id, '診療で聞いた方法をもとに、療養を始める');
  const afterStart = vm.runInContext(
    `({ tx: S.fl.tx, tags: Array.from(tags(S)), recordText: lifeRows(S).find(row => row[0] === 'ロドスの診療経路')?.[1], annualTreatment: prepareAnnualPersonalBudget(S, ANNUAL_SERVICES, S.age, S.t, S.f).tcGross, audit: auditLifeState(S) })`,
    ctx
  );
  assert.equal(afterStart.tx, 1);
  assert(afterStart.tags.includes('治療中'));
  assert.match(afterStart.recordText, /本人が療養を選び、継続中/);
  assert(afterStart.annualTreatment > 0, 'the existing annual budget must account for ongoing treatment');
  assert.deepEqual(Array.from(afterStart.audit), []);

  for (let i = 0; i < 3; i++) advanceYear(ctx);
  assert(eligible(ctx, careReview.id), 'the ongoing-care review must respect its three-year cooldown');
  const pause = careReview.c.find(choice => choice.l === '費用が重く、療養を一時休止する');
  assert(choiceVisible(ctx, careReview.id, pause.l));
  applyChoice(ctx, careReview.id, pause.l);
  assert.equal(vm.runInContext('S.fl.tx', ctx), 0);
  assert.equal(
    vm.runInContext('prepareAnnualPersonalBudget(S, ANNUAL_SERVICES, S.age, S.t, S.f).tcGross', ctx),
    0,
    'pausing treatment must stop the recurring treatment expense'
  );

  const roundTrip = vm.runInContext(
    `(() => {
      const snapshot = makeResumeSnapshot();
      writeResumeSlot(0, { savedAt: snapshot.savedAt, snapshot });
      const saved = readResumeSlots().slots[0].snapshot;
      return { loaded: cont(normalizeResumeImport(JSON.parse(JSON.stringify(saved)))), audit: auditLifeState(S), affiliation: S.lifeRecord.affiliations.find(row => row.id === 'rhodes-care') };
    })()`,
    ctx
  );
  assert.equal(roundTrip.loaded, true, 'the current save format must preserve the Rhodes care stage');
  assert.equal(roundTrip.affiliation.role, '巡回診療後、療養を休止');
  assert.deepEqual(Array.from(roundTrip.audit), []);
}

{
  const ctx = fresh('rhodes-medical-reschedule');
  beginReferral(ctx);
  applyChoice(ctx, 'life_rhodes_clinic_visit', '仕事や移動の都合で、予約を延期する');
  assert.equal(vm.runInContext('tags(S).has("ロドス巡回受診を延期中")', ctx), false);
  assert.equal(eligible(ctx, 'life_rhodes_role_review'), false);
  advanceYear(ctx);
  const reschedule = event(ctx, 'life_rhodes_clinic_reschedule');
  assert(eligible(ctx, reschedule.id), 'a deferred appointment must enter its own rescheduling step');
  applyChoice(ctx, reschedule.id, '次の巡回相談を予約し直す');
  assert.equal(vm.runInContext('tags(S).has("ロドス巡回診療の予約あり")', ctx), false);
  advanceYear(ctx);
  assert(eligible(ctx, 'life_rhodes_clinic_visit'));

  const visit = event(ctx, 'life_rhodes_clinic_visit');
  vm.runInContext('S.cash = 0; S.debt = 0; if (S.house) { S.house.cash = 0; S.house.debt = 0; }', ctx);
  assert.equal(
    choiceVisible(ctx, visit.id, '受診し、費用を手元の資金から払う'),
    false,
    'a cash-constrained patient must not be offered an unaffordable cash payment'
  );
  const debtBefore = vm.runInContext('S.debt + (S.house?.debt || 0)', ctx);
  applyChoice(ctx, visit.id, '受診し、費用を医療費の借入として記録する');
  const debtAfter = vm.runInContext('S.debt + (S.house?.debt || 0)', ctx);
  assert(debtAfter > debtBefore, 'choosing the debt route must record the medical expense as debt');
  assert.equal(vm.runInContext('S.fl.tx', ctx), 0);
  assert.equal(vm.runInContext('tags(S).has("ロドス巡回診療後の療養確認")', ctx), false);
  advanceYear(ctx);
  assert(eligible(ctx, 'life_rhodes_care_review'));
}

{
  const ctx = fresh('rhodes-medical-local-handoff');
  beginReferral(ctx);
  applyChoice(ctx, 'life_rhodes_clinic_visit', '紹介先との連絡を終え、地域の診療先を探す');
  const after = vm.runInContext(
    `({ active: S.lifeRecord.affiliations.some(row => row.id === 'rhodes-care' && ['active', 'crisis'].includes(row.status)), tx: S.fl.tx, reviewVisible: elig(EV.find(row => row.id === 'life_rhodes_care_review'), S, tags(S)), audit: auditLifeState(S) })`,
    ctx
  );
  assert.equal(after.active, false);
  assert.equal(after.tx, 0, 'a referral or a canceled appointment must not imply treatment');
  assert.equal(after.reviewVisible, false);
  assert.deepEqual(Array.from(after.audit), []);
}

console.log(
  JSON.stringify({
    passed: true,
    referralAppointmentConsultationAndTreatmentAreSeparate: true,
    regionalConsultationCostRecordedOnce: true,
    treatmentUsesExistingRecurringBudget: true,
    missedAppointmentsCanBeRescheduledOrHandedOff: true,
    currentSaveRoundTripAndStateAudit: true
  })
);
