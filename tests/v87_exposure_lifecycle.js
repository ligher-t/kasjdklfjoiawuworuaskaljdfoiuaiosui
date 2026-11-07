'use strict';
const assert = require('node:assert/strict'),
  path = require('node:path'),
  vm = require('node:vm'),
  root = path.resolve(__dirname, '..'),
  { context, setup } = require('./support/annual-cases.cjs'),
  { installGeneralEmploymentFixture } = require('./support/general-employment-fixture.cjs');

function fresh(id, region, age = 32) {
  const { ctx } = context(root);
  setup(ctx, { id, seed: 905121, region, age });
  installGeneralEmploymentFixture(ctx);
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

{
  const ctx = fresh('diagnosis-access-and-deferral', 'ヴィクトリア');
  vm.runInContext(
    `S.inf = 1;
     S.fl.dg = 0;
     S.infection = { year: S.year, cause: 'test', basis: 'test', diagnosedYear: null };
     S.oripathyExposure = { version: 3, history: [], protectionUntilYear: null, reviewDueYear: null, screeningRequestedYear: null };
     const clinic = activeFacility(S, 'clinic');
     clinic.status = 'limited';
     clinic.lastYear = S.year;`,
    ctx
  );
  const decision = event(ctx, 'ori_diagnosis_decision'),
    diagnosedChoice = decision.c.find(row => row.l === '検査を受け、結果と今後の療養について説明を聞く'),
    referralChoice = decision.c.find(row => row.l === '診療所で検査枠と費用を尋ねる');
  assert.equal(decision.c.length, 4, 'the branch keeps clinic access, no clinic, and rest choices distinct');
  assert(decision.c.every(choice => choice.ethics?.reviewed && choice.ethics.policyVersion === 87), 'all revised diagnosis choices retain current review');
  assert.deepEqual(Array.from(decision.c, choice => choice.ethics.intent),
    ['self-or-family-care', 'information', 'information', 'defer'],
    'diagnosis, referral, research, and rest retain separate reviewed intents');
  assert.equal(decision.show(vm.runInContext('S', ctx)), true);
  assert.equal(decision.t(vm.runInContext('S', ctx)).includes('鉱石病の検査を受け付けていない'), true);
  assert.equal(diagnosedChoice.show(vm.runInContext('S', ctx)), false, 'limited clinic cannot offer an examination outcome');
  assert.equal(referralChoice.show(vm.runInContext('S', ctx)), true, 'limited clinic can still be asked about alternatives');
  applyChoice(ctx, 'ori_diagnosis_decision', '診療所で検査枠と費用を尋ねる');
  const deferred = vm.runInContext(
    `({
      diagnosed: !!S.fl.dg,
      requestedYear: S.oripathyExposure.screeningRequestedYear,
      dueYear: S.oripathyExposure.reviewDueYear,
      referral: S.facilityContacts.at(-1)?.action
    })`,
    ctx
  );
  assert.equal(deferred.diagnosed, false, 'asking about access does not diagnose or claim an examination');
  assert.equal(deferred.requestedYear, vm.runInContext('S.year', ctx));
  assert(deferred.dueYear > deferred.requestedYear, 'a deferred examination gets a future review point');
  assert.equal(deferred.referral, 'referral', 'the clinic inquiry is recorded at the current facility');
  assert.equal(decision.show(vm.runInContext('S', ctx)), false, 'the initial decision does not repeat during the waiting period');

  vm.runInContext(
    `S.year = ${deferred.dueYear};
     S.community.lastYear = S.year;
     for (const facility of Object.values(S.community.facilities)) facility.lastYear = S.year;
     activeFacility(S, 'clinic').status = 'limited';`,
    ctx
  );
  const followup = event(ctx, 'ori_followup_access');
  assert.equal(followup.show(vm.runInContext('S', ctx)), true, 'the review reappears when its scheduled year arrives');
  assert.equal(followup.t(vm.runInContext('S', ctx)).includes('連絡が来た'), false, 'a review does not invent an incoming clinic message');
  assert.equal(followup.c[0].show(vm.runInContext('S', ctx)), false, 'a limited clinic cannot offer a test result');
  assert.equal(followup.c[1].show(vm.runInContext('S', ctx)), true, 'a limited clinic can offer a referral inquiry');
  applyChoice(ctx, 'ori_followup_access', '診療所で別の受付先と費用を確かめる');
  const rescheduled = vm.runInContext('S.oripathyExposure.reviewDueYear', ctx);
  assert(rescheduled > deferred.dueYear, 'a second deferral reschedules rather than repeating immediately');
  assert.equal(vm.runInContext('!!S.fl.dg', ctx), false, 'referral inquiry remains distinct from diagnosis');
}
{
  const ctx = fresh('diagnosis-direct-cost', 'ヴィクトリア');
  vm.runInContext(
    `S.inf = 1;
     S.fl.dg = 0;
     S.fl.household_separated = 1;
     S.infection = { year: S.year, cause: 'test', basis: 'test', diagnosedYear: null };
     S.oripathyExposure = { version: 3, history: [], protectionUntilYear: null, reviewDueYear: null, screeningRequestedYear: null };
     S.cash = 1000000;
     S.house = null;
     S.sp = null;
     S.kids = [];
     const clinic = activeFacility(S, 'clinic');
     clinic.status = 'available';
     clinic.lastYear = S.year;`,
    ctx
  );
  const decision = event(ctx, 'ori_diagnosis_decision'),
    exam = decision.c.find(row => row.l === '検査を受け、結果と今後の療養について説明を聞く'),
    before = vm.runInContext('S.cash', ctx),
    cost = vm.runInContext('Math.round(30000 * S.res.md * (S.priceIndex || 1))', ctx);
  assert.equal(exam.show(vm.runInContext('S', ctx)), true);
  vm.runInContext('S.cash = 0', ctx);
  assert.equal(vm.runInContext(`ok(${JSON.stringify(exam.en)}, S, tags(S))`, ctx), false, 'the examination cannot be selected without its cost');
  vm.runInContext(`S.cash = ${before}`, ctx);
  assert.equal(vm.runInContext(`ok(${JSON.stringify(exam.en)}, S, tags(S))`, ctx), true, 'the examination is selectable when its abstract cost is affordable');
  applyChoice(ctx, 'ori_diagnosis_decision', '検査を受け、結果と今後の療養について説明を聞く');
  assert.equal(vm.runInContext('S.cash', ctx), before - cost, 'the first diagnostic examination charges one locality-scaled cost');
  assert.equal(vm.runInContext('!!S.fl.dg', ctx), true, 'diagnosis follows the recorded examination');
}

const mineId = 'infection_mine_crystal_contact';
{
  const ctx = fresh('mine-diagnosis', 'レム・ビリトン'),
    label = event(ctx, mineId).c.find(row => row.l.includes('結晶')).l;
  vm.runInContext(
    `S.job = Object.keys(J).find(id => J[id]?.n === '鉱夫');`,
    ctx
  );
  applyChoice(ctx, mineId, label, 0);
  const state = vm.runInContext(
    `({
      diagnosed: !!S.inf && !!S.fl.dg,
      screened: S.oripathyExposure.history.some(row => row.kind === 'screen'),
      diagnosisRecorded: S.oripathyExposure.history.some(row => row.kind === 'diagnosis'),
      reviewDueYear: S.oripathyExposure.reviewDueYear,
      workplaceEventAvailable: EV.find(row => row.id === 'ori_diagnosed_workplace').show(S)
    })`,
    ctx
  );
  assert.equal(state.diagnosed, true);
  assert.equal(state.screened, true, 'the narrated examination must be recorded as screening');
  assert.equal(state.diagnosisRecorded, true);
  assert.equal(state.reviewDueYear, null, 'a confirmed diagnosis closes the uncertain-exposure review');
  assert.equal(state.workplaceEventAvailable, true, 'the worker can next review safety and continuing work');
}
{
  const ctx = fresh('mine-symptoms-unconfirmed', 'レム・ビリトン'),
    label = event(ctx, mineId).c.find(row => row.l.includes('結晶')).l;
  vm.runInContext(
    `S.job = Object.keys(J).find(id => J[id]?.n === '鉱夫');`,
    ctx
  );
  applyChoice(ctx, mineId, label, 1);
  const state = vm.runInContext(
    `({
      uninfected: !S.inf,
      hazardRecorded: S.oripathyExposure.history.some(row => row.kind === 'unsafe'),
      hazardFlag: !!S.fl.workplace_hazard
    })`,
    ctx
  );
  assert.equal(state.uninfected, true, 'an unconfirmed outcome must not mark a person infected');
  assert.equal(state.hazardRecorded, true, 'continued dust exposure must remain in the exposure history');
  assert.equal(state.hazardFlag, true);
}
{
  const ctx = fresh('infection-review-rescheduled', 'ヴィクトリア');
  vm.runInContext(
    `S.inf = 1;
     S.fl.dg = 0;
     S.infection = { year: S.year - 2, cause: '接触経路不明', basis: 'test', diagnosedYear: null };
     S.oripathyExposure = { version: 3, history: [], protectionUntilYear: null, reviewDueYear: null, screeningRequestedYear: S.year - 2 };
     S.oripathyExposure.reviewDueYear = S.year;
     S.oripathyExposure.screeningRequestedYear = S.year - 2;`,
    ctx
  );
  const dueBefore = vm.runInContext('S.oripathyExposure.reviewDueYear', ctx),
    dueChoice = '診療所で別の受付先と費用を確かめる';
  applyChoice(ctx, 'ori_followup_access', dueChoice);
  const review = vm.runInContext('S.oripathyExposure', ctx),
    eventAfter = event(ctx, 'ori_followup_access');
  assert.equal(review.screeningRequestedYear, vm.runInContext('S.year', ctx));
  assert(review.reviewDueYear > dueBefore, 'a deferred appointment must set a new review year');
  assert.equal(eventAfter.show(vm.runInContext('S', ctx)), false, 'the event waits until the new review date');
}

function siblingCase(id, outcomeIndex) {
  const ctx = fresh(id, 'ヴィクトリア');
  vm.runInContext(
    `S.cash = 1000000;
     S.siblings = [{
       id: 'sibling-exposure-target', nm: '試験きょうだい', by: S.year - 25, d: 0,
       inf: 0, infKnown: 0, tx: 0, r: S.res, region: S.res.n, knownRegion: S.res.n,
        independentSinceYear: S.year - 5, contactState: 'regular', contactReviewYear: S.year,
       exposurePending: 0, exposureYear: null, exposureKnownYear: null,
       exposureReviewYear: null, exposureCause: null
     }];
     repairSiblingRecords(S);
     assignRelativeIds(S);
     S.eventRelativeId = S.siblings[0].id;`,
    ctx
  );
  const report = applyChoice(
    ctx,
    'family_sibling_exposure',
    event(ctx, 'family_sibling_exposure').c[1].l,
    outcomeIndex
  );
  assert(report.effect.sibExposureEmployerResponse);
  return ctx;
}

{
  const ctx = fresh('child-exposure-lifecycle', 'レム・ビリトン');
  vm.runInContext(
    `S.cash = 1000000;
     S.kids = [{
       id: 'child-exposure-target', nm: '試験の子', by: S.year - 12, d: 0,
       inf: 0, householdStatus: 'supported', contactState: 'active', exposurePending: 0
     }];
     S.eventRelativeId = 'child-exposure-target';`,
    ctx
  );
  applyChoice(ctx, 'family_child_crystal_exposure', event(ctx, 'family_child_crystal_exposure').c[0].l, 1);
  const pending = vm.runInContext('S.kids[0]', ctx);
  assert.equal(pending.exposurePending, 1);
  assert.equal(pending.exposureReviewYear, vm.runInContext('S.year + 1', ctx));

  vm.runInContext('S.year += 1; S.age += 1;', ctx);
  applyChoice(ctx, 'family_child_exposure_followup', event(ctx, 'family_child_exposure_followup').c[0].l, 0);
  vm.runInContext('S.sn.family_child_exposure_followup = S.year; S.cash = 1000000;', ctx);
  const diagnosed = vm.runInContext('S.kids[0]', ctx);
  assert.equal(diagnosed.inf, 1);
  assert.equal(diagnosed.exposurePending, 0);
  const childAwareness = vm.runInContext(
    `S.infectionAwareness.entries.filter(row => row.subjectId === 'child-exposure-target')`,
    ctx
  );
  assert.deepEqual(Array.from(childAwareness, row => row.audience).sort(), ['household', 'medical-service', 'subject']);

  vm.runInContext('S.year += 1; S.age += 1;', ctx);
  const careAvailable = vm.runInContext(
    `elig(EV.find(row => row.id === 'fam_child_care'), S, tags(S))`,
    ctx
  );
  assert.equal(
    careAvailable,
    true,
    'children diagnosed through exposure follow-up must reach later household-care choices'
  );
}

{
  const ctx = siblingCase('sibling-employer-partial', 0),
    state = vm.runInContext(
      `({ sibling: S.siblings[0], tags: Array.from(tags(S)), text: txt(EV.find(row => row.id === 'family_sibling_exposure_followup'), S, tags(S)) })`,
      ctx
    );
  assert.equal(state.sibling.exposureEmployerResponse, 'partial-cost');
  assert.equal(state.sibling.exposureEmployerResponseYear, vm.runInContext('S.year', ctx));
  assert(state.tags.includes('対象きょうだいの仕事先が前回の検査費を一部負担'));
  assert.match(state.text, /最初の検査(?:費|代)を(?:一部負担|少しだけ出したが)/);
  const familyView = vm.runInContext('fam(S)', ctx),
    siblingTrace = vm.runInContext('traceSiblings(S, { siblingsOf })', ctx);
  assert.match(familyView, /勤務先は前回の検査費を一部負担/);
  assert.equal(siblingTrace.siblings[0].exposureEmployerResponse, 'partial-cost');
  const validAudit = vm.runInContext('auditLifeState(S)', ctx);
  assert(!validAudit.includes('きょうだいの勤務先による曝露報告への回答が不正'));
  const saveRoundTrip = vm.runInContext(
    `(() => {
      const snapshot = makeResumeSnapshot();
      writeResumeSlot(0, { savedAt: snapshot.savedAt, snapshot });
      const saved = readResumeSlots().slots[0].snapshot;
      const loaded = cont(normalizeResumeImport(JSON.parse(JSON.stringify(saved))));
      return {
        loaded,
        response: S.siblings[0].exposureEmployerResponse,
        year: S.siblings[0].exposureEmployerResponseYear,
        audit: auditLifeState(S)
      };
    })()`,
    ctx
  );
  assert.equal(saveRoundTrip.loaded, true, 'a current-format save must restore the sibling workplace response');
  assert.equal(saveRoundTrip.response, 'partial-cost');
  assert.equal(saveRoundTrip.year, state.sibling.exposureEmployerResponseYear);
  assert.deepEqual(Array.from(saveRoundTrip.audit), []);
  vm.runInContext('S.siblings[0].exposureEmployerResponseYear = S.year + 1;', ctx);
  assert(
    vm.runInContext('auditLifeState(S)', ctx).includes('きょうだいの勤務先による曝露報告への回答が不正'),
    'the state audit must reject a future-dated employer response'
  );
  vm.runInContext('S.siblings[0].exposureEmployerResponseYear = S.year;', ctx);
  vm.runInContext('S.siblings[0].exposureYear = null;', ctx);
  assert(
    vm.runInContext('auditLifeState(S)', ctx).includes('きょうだいの勤務先による曝露報告への回答が不正'),
    'an employer response must remain attached to a dated exposure record'
  );
  vm.runInContext('S.siblings[0].exposureYear = S.year;', ctx);

  vm.runInContext('S.year += 1; S.age += 1;', ctx);
  applyChoice(ctx, 'family_sibling_exposure_followup', event(ctx, 'family_sibling_exposure_followup').c[0].l, 0);
  const diagnosed = vm.runInContext(
    `({ sibling: S.siblings[0], tags: Array.from(tags(S)) })`,
    ctx
  );
  assert.equal(diagnosed.sibling.inf, 1);
  assert.equal(diagnosed.sibling.infKnown, 1);
  assert.equal(diagnosed.sibling.infectionDiscussedYear, vm.runInContext('S.year', ctx));
  assert.equal(diagnosed.sibling.exposurePending, 0);
  const siblingAwareness = vm.runInContext(
    `S.infectionAwareness.entries.filter(row => row.subjectId === S.siblings[0].id)`,
    ctx
  );
  assert.deepEqual(Array.from(siblingAwareness, row => row.audience).sort(), ['medical-service', 'protagonist', 'subject'], 'a sibling discloses to the protagonist, not automatically to every household member');
  assert.match(vm.runInContext('fam(S)', ctx), /勤務先は前回の検査費を一部負担/);
  assert(diagnosed.tags.includes('対象の感染した別居きょうだい'));
  const contact = event(ctx, 'family_sibling_contact'),
    supportChoice = contact.c.find(row => row.l.includes('療養') && (row.l.includes('年') || row.l.includes('仕送り'))),
    supportLabel = supportChoice?.l,
    supportIndex = contact.c.indexOf(supportChoice),
    supportVisible = vm.runInContext(
      `ok(EV.find(row => row.id === 'family_sibling_contact').c[${supportIndex}].show, S, tags(S))`,
      ctx
    );
  assert(supportChoice, 'the later sibling-care route is missing');
  assert.equal(supportVisible, true, 'a known independent infected sibling can reach voluntary ongoing support');
  applyChoice(ctx, 'family_sibling_contact', supportLabel);
  assert.equal(vm.runInContext('S.siblings[0].careSupportAnnual > 0', ctx), true);
}

{
  const ctx = siblingCase('sibling-employer-denied', 1),
    state = vm.runInContext(
      `({ sibling: S.siblings[0], tags: Array.from(tags(S)), text: txt(EV.find(row => row.id === 'family_sibling_exposure_followup'), S, tags(S)) })`,
      ctx
    );
  assert.equal(state.sibling.exposureEmployerResponse, 'denied');
  assert(state.tags.includes('対象きょうだいの仕事先が曝露報告を退けた'));
  assert.match(state.text, /源石片の持ち込みと費用負担を退けた|雇い主に労災を突っぱねられたまま/);
  assert.match(vm.runInContext('fam(S)', ctx), /勤務先は曝露報告を否認/);
}

console.log(
  JSON.stringify({
    passed: true,
    miningDiagnosisAndExposureRecorded: true,
    deferredScreeningRescheduled: true,
    siblingEmployerResponseContinuesIntoRetest: true,
    siblingEmployerResponsePersistsInFamilyViewAndTrace: true,
    siblingEmployerResponseCurrentSaveRoundTrip: true,
    independentSiblingDiagnosisRemainsDiscussable: true
  })
);

// Due-date regressions: a few slots, no lifetime simulation.
{
  const ctx=fresh('scheduled-family-and-school-followups','クルビア',40);
  const result=vm.runInContext(`(()=>{
    const s=S; s.r=RACE.find(x=>x.n==='フェリーン');s.age=40;s.year=s.by+40;
    const scheduledYear=(event,state)=>{const period=scheduledFollowupDuePeriod(event,state);return period===null?null:Math.floor((period-1)/12);};
    s.fl.household_separated=1;
    s.kids=[{id:'followup-child',nm:'再検査の子',by:s.year-35,d:0,inf:0,
      exposurePending:1,exposureYear:s.year-29,exposureReviewYear:s.year,
      contactState:'regular'}];
    s.eventRelativeId='followup-child';
    const child=EV.find(e=>e.id==='family_child_exposure_followup'),
      care=EV.find(e=>e.id==='family_care_network_contact'),
      school=EV.find(e=>e.id==='earth_discr_school_later');
    s.care.supportNetwork={contactState:'active',contactReviewYear:s.year,
      lastContactYear:s.year-6,contactHistory:[]};
    s.fl.ed_school_witness=1;s.sn.earth_discr_school_guardian=s.year-23;
    const text=e=>txt(e,s,tags(s));
    const childText=text(child),careText=text(care),schoolText=text(school);
    const before=JSON.stringify({s,rng:RANDOM_STATE});
    const due=scheduledYear(child,s),next=nextScheduledFollowup([child,care,school],s)?.id;
    const pure=before===JSON.stringify({s,rng:RANDOM_STATE});
    const restored=JSON.parse(JSON.stringify(s));
    const restoredDue=scheduledYear(child,restored);
    const saved=EV.slice(),realFire=fire;let fired=null;
    function oneSlot(events){EV.splice(0,EV.length,...events);fired=null;slot(0.1);return fired;}
    fire=e=>{fired=e.id};DEBUG_RANDOM=()=>0.999;
    let selected,future,closed,paused,dead,cooldown,used,schoolOnce,schoolEarly,schoolDue,blocked,careDue,careFuture,monthBlocked,yearBlocked,schoolRequired;
    try {
      selected=oneSlot([child]);
      careDue=oneSlot([care]);s.care.supportNetwork.contactReviewYear=s.year+1;
      careFuture=oneSlot([care]);s.care.supportNetwork.contactReviewYear=s.year;
      const upper=saved.find(e=>e.id==='education_upper_path');
      s.educationDecision={kind:'upper-path',year:s.year};
      schoolRequired=oneSlot([child,upper]);s.educationDecision=null;
      monthBlocked=oneSlot([{...child,months:[12]}]);
      yearBlocked=oneSlot([{...child,le:{year:s.year-1}}]);
      s.kids[0].exposureReviewYear=s.year+1;future=oneSlot([child]);
      s.kids[0].exposureReviewYear=s.year;s.kids[0].contactState='ended';closed=oneSlot([child]);
      s.kids[0].contactState='paused';paused=oneSlot([child]);
      s.kids[0].contactState='regular';s.kids[0].d=1;dead=oneSlot([child]);s.kids[0].d=0;
      s.sn[child.id]=s.year;cooldown=oneSlot([child]);delete s.sn[child.id];
      s.majorEventMonth={year:s.year,month:2};used=oneSlot([child]);s.majorEventMonth=null;
      const unavailable={...child,c:child.c.map(c=>({...c,en:()=>false}))};blocked=oneSlot([unavailable]);
      s.sn.earth_discr_school_guardian=s.year;schoolEarly=oneSlot([school]);
      s.sn.earth_discr_school_guardian=s.year-2;schoolDue=oneSlot([school]);
      s.sn[school.id]=s.year-1;schoolOnce=oneSlot([school]);delete s.sn[school.id];
    }finally{fire=realFire;DEBUG_RANDOM=null;EV.splice(0,EV.length,...saved);}
    // Apply actual postponement / closure to the pinned child, not a random sibling.
    s.eventRelativeId='followup-child';
    s.kids.push({id:'other-child',nm:'別の子',by:s.year-10,exposurePending:0});
    applyChildEffects({kidExposureReviewDelay:1},s,()=>{});
    const postponed=s.kids[0].exposureReviewYear===s.year+1 && !s.kids[1].exposurePending;
    const notYetDue=scheduledYear(child,s)===null;
    s.year++;s.age++;const nowDue=scheduledYear(child,s)===s.year;
    const postponedText=text(child);
    applyChildEffects({kidExposureClose:1},s,()=>{});
    const resolved=scheduledYear(child,s)===null;
    // A fresh injury replaces the episode date; deferral above never did.
    applyChildEffects({kidExposurePending:1,kidExposureReviewDelay:1},s,()=>{});
    const renewed=s.kids[0].exposureYear===s.year;
    s.care.supportNetwork.lastContactYear=null;
    s.care.supportNetwork.contactHistory=[{year:s.year-1,state:'review_scheduled'}];
    const firstCareText=text(care);
    s.care.supportNetwork.contactState='ended';
    const endedCareEligible=elig(care,s,tags(s));
    const workplace=EV.find(e=>e.id==='infection_workplace_review');
    s.infectionWorkplace={status:'awaiting-review',disclosedYear:s.year-12,reviewDueYear:s.year-11,disclosedJobId:2};
    s.job=0;const workText=text(workplace);
    const conference=EV.find(e=>e.id==='family_sibling_parent_support_conference');
    s.siblingParentSupportConference={status:'scheduled',requestedYear:s.year-9,dueYear:s.year-8};
    const conferenceText=text(conference);
    return {due,next,pure,restoredDue,selected,future,closed,dead,cooldown,used,blocked,schoolEarly,schoolDue,schoolOnce,
      paused,careDue,careFuture,monthBlocked,yearBlocked,schoolRequired,childText,careText,schoolText,postponed,notYetDue,nowDue,postponedText,resolved,renewed,
      firstCareText,endedCareEligible,workText,conferenceText};
  })()`,ctx,{timeout:15000});
  assert.equal(result.selected,'family_child_exposure_followup','due re-examination bypasses the optional random draw');
  assert.equal(result.careDue,'family_care_network_contact','due care contact bypasses optional randomness');
  assert.equal(result.schoolRequired,'education_upper_path','required school decisions retain precedence');
  assert.equal(result.schoolDue,'earth_discr_school_later','school consequence is selected once its own conditions permit it');
  assert.equal(result.next,'earth_discr_school_later','oldest eligible due date is handled first');
  for(const key of ['future','closed','paused','dead','cooldown','used','blocked','schoolEarly','schoolOnce','careFuture','monthBlocked','yearBlocked'])
    assert.equal(result[key],null,key+' must not bypass an existing gate');
  for(const key of ['pure','postponed','notYetDue','nowDue','resolved','renewed'])assert.equal(result[key],true,key);
  assert.equal(result.restoredDue,result.due,'serialized pending state retains its schedule');
  assert.equal(result.endedCareEligible,false,'ended care contact does not become a forced appointment');
  assert.match(result.childText,/29年/);assert.match(result.postponedText,/30年/);
  assert.match(result.careText,/6年/);assert.doesNotMatch(result.careText,/家計を分けて一年/);
  assert.match(result.firstCareText,/家計を分けてから1年/);
  assert.match(result.schoolText,/23年/);
  assert.match(result.workText,/12年/);assert.doesNotMatch(result.workText,/職場を離れて一年/);
  assert.match(result.conferenceText,/9年/);assert.doesNotMatch(result.conferenceText,/昨年/);
}
console.log('PASS scheduled followups, real elapsed text, target identity and dispatch gates');

// Short stateful regressions: resolve actual choices, then inspect specific future slots.
{
  const ctx=fresh('repeat-review-context','ヴィクトリア');
  ctx.startGeneralEmploymentFixture(2,'repeat-review-context');
  const r=vm.runInContext(`(()=>{
    S.cash=10000000;
    const e=EV.find(x=>x.id==='v77_written_application');
    const untouched=!S.eventReviews;
    DEBUG_RANDOM=()=>0.999;fire(e,S,tags(S));DEBUG_RANDOM=null;
    const recorded=S.eventReviews[e.id],label=recorded.choice;
    S.year+=6;S.age+=6;
    const T=tags(S),before=JSON.stringify({s:S,rng:RANDOM_STATE});
    const unchanged=elig(e,S,T),pure=before===JSON.stringify({s:S,rng:RANDOM_STATE});
    S.workContract.siteId+='-new';
    const changed=elig(e,S,T),text=txt(e,S,T),restored=JSON.parse(JSON.stringify(S));
    S.community.metrics.medical=0.5;const cap=EV.find(x=>x.id==='local_medical_capacity'),capT=tags(S);
    recordEventReview(cap,S,'今は予定を詰めず、自分の体調を整える');
    S.year+=6;S.age+=6;const sameClinic=elig(cap,S,capT);
    const clinic=S.community.facilities[S.siteAffiliations.clinic.facilityId];
    clinic.status=clinic.status==='limited'?'normal':'limited';
    const changedClinic=elig(cap,S,capT);
    return {untouched,recorded:!!recorded,unchanged,changed,pure,text,label,sameClinic,changedClinic,
      persisted:restored.eventReviews[e.id].choice===label};
  })()`,ctx);
  assert.equal(r.untouched,true);assert.equal(r.recorded,true,'actual resolution records the chosen response');
  assert.equal(r.unchanged,false,'elapsed cooldown alone does not reopen unchanged paperwork');
  for(const k of ['changed','pure','persisted'])assert.equal(r[k],true,k);
  assert(r.text.includes(r.label),'a renewed application recalls the previous response');
  assert.equal(r.sameClinic,false,'known intake instructions do not need periodic reconfirmation');
  assert.equal(r.changedClinic,true,'changed intake capacity permits a new response');
}
{
  const ctx=fresh('medical-and-child-reviews','ヴィクトリア',45);
  const r=vm.runInContext(`(()=>{
    S.inf=1;S.fl.dg=1;
    const ep=startMortalityEpisode(S,'oripathy',3,'regression');
    S.fl.tx=1;applyMortalityCare({kind:'urgent',action:'support'});
    S.year++;S.age++;
    const stable=urgentMortalityEpisodes(S).length;
    S.fl.tx=0;const interrupted=urgentMortalityEpisodes(S).length;S.fl.tx=1;
    ep.severity=4;ep.history.push({year:S.year,action:'worsened',severity:4});
    const worse=urgentMortalityEpisodes(S).length;
    const medical=EV.find(e=>e.id==='life_medical_followup');
    const medicalT=tags(S);recordEventReview(medical,S,'周囲へ支援を頼む');S.year+=2;S.age+=2;
    const sameMedical=elig(medical,S,medicalT);ep.severity=3;
    const changedMedical=elig(medical,S,medicalT);
    const child={id:'review-child',nm:'ミナ',sx:'女',by:S.year-19,d:0,
      householdStatus:'dependent',contactState:'regular'};
    S.kids=[child];S.eventRelativeId=child.id;
    ap({childFutureSupport:{kind:'work-introduction'}});
    const firstDone=child.futurePlanYear===S.year;
    S.year+=1;const early=childForEvent(S,'family_child_future');
    S.year+=2;const unchanged=childForEvent(S,'family_child_future');
    child.studyCompletedYear=S.year;
    const changed=childForEvent(S,'family_child_future')?.id;
    S.eventRelativeId=child.id;
    const text=txt(EV.find(e=>e.id==='family_child_future'),S,tags(S));
    ap({childFutureSupport:{kind:'revisit'}});
    S.year+=2;const tooEarly=childForEvent(S,'family_child_future');S.year++;
    const revisit=childForEvent(S,'family_child_future')?.id;
    child.contactState='ended';const ended=childForEvent(S,'family_child_future');
    S.kids.push({...child,id:'second-child',contactState:'regular',by:S.year-16,
      futurePlanYear:null,futurePlanReviewYear:null});
    const second=childForEvent(S,'family_child_future')?.id;
    const before=JSON.stringify({s:S,rng:RANDOM_STATE});childForEvent(S,'family_child_future');
    return {stable,interrupted,worse,sameMedical,changedMedical,firstDone,early,unchanged,
      changed,text,tooEarly,revisit,ended,second,pure:before===JSON.stringify({s:S,rng:RANDOM_STATE})};
  })()`,ctx);
  assert.equal(r.stable,0);assert.equal(r.interrupted,1,'loss of ongoing treatment permits urgent review');
  assert.equal(r.worse,1);assert.equal(r.sameMedical,false);assert.equal(r.changedMedical,true);
  for(const k of ['early','unchanged','tooEarly','ended'])assert.equal(r[k],null,k);
  assert.equal(r.firstDone,true);assert.equal(r.changed,'review-child');assert.equal(r.revisit,'review-child');
  assert.equal(r.second,'second-child');assert.equal(r.pure,true);assert.match(r.text,/前回は見習い先への紹介/);
}
{
  const ctx=fresh('scoped-institutional-knowledge','ウルサス');
  ctx.startGeneralEmploymentFixture(2,'scoped-institutional-knowledge');
  const r=vm.runInContext(`(()=>{
    S.inf=1;S.fl.dg=1;
    const sweep=EV.find(e=>e.id==='urs_sweep');
    const add=(audience,more={})=>recordInfectionAwareness(S,{subject:'protagonist',audience,
      certainty:'confirmed',source:'self-disclosure',consent:'voluntary',...more});
    add('family');const family=sweep.show(S);
    add('employer',{recipientRef:'former-site'});const former=sweep.show(S);
    add('local-authority',{certainty:'unverified',subjectMatch:'unclear',source:'unattributed-rumor'});
    const rumor=sweep.show(S);
    const current=add('employer',{recipientRef:S.workContract.siteId});
    current.region='ヴィクトリア';const abroad=sweep.show(S);current.region=S.res.n;
    const known=sweep.show(S),before=JSON.stringify({s:S,rng:RANDOM_STATE});
    institutionalInfectionAudience(S);const pure=before===JSON.stringify({s:S,rng:RANDOM_STATE});
    const all=EV.slice(),realFire=fire;let fired=null;
    EV.splice(0,EV.length,sweep);fire=e=>{fired=e.id};S.educationDecision=null;slot(0.4);
    EV.splice(0,EV.length,...all);fire=realFire;
    const arrest=sweep.c.flatMap(c=>c.o).find(o=>o[2]?.fl?.detained && o[2].infectionAwarenessAction);
    ap(arrest[2]);
    const restrictedNow=restricted(S),authority=institutionalInfectionAudience(S);
    const budget=prepareAnnualPersonalBudget(S,ANNUAL_SERVICES,S.age,S.t,S.f);
    return {family,former,rumor,abroad,known,pure,fired,restrictedNow,authority,income:budget.inc};
  })()`,ctx);
  for(const k of ['family','former','rumor','abroad'])assert.equal(r[k],false,k);
  assert.equal(r.known,true);assert.equal(r.pure,true);assert.equal(r.fired,'urs_sweep');
  assert(r.restrictedNow);assert.equal(r.authority,'local-authority');assert.equal(r.income,0,'detention interrupts actual annual income');
}
{
  const ctx=fresh('regional-daily-and-notice','リターニア');
  const r=vm.runInContext(`(()=>{
    S.inf=1;S.fl.dg=1;S.fl.hid=0;
    const notice=EV.find(e=>e.id==='lei_isolation');
    const privateOnly=notice.show(S);
    recordInfectionAwareness(S,{subject:'protagonist',audience:'housing-management',certainty:'confirmed',
      source:'self-disclosure',consent:'voluntary'});
    const known=notice.show(S);
    const regional={id:'regional-regression',st:['青年','壮年'],need:['国:リターニア'],fx:{p:1},t:'地域の暮らし'},
      common={id:'common-regression',st:['青年','壮年'],fx:{},t:'穏やかな日'},
      wrong={...regional,need:['国:ウルサス']};
    const wrongRegion=contextualDailyEvent(wrong,S,tags(S)),all=EV.slice(),realFire=fire;let fired=null;
    EV.splice(0,EV.length,common,regional);fire=e=>{fired=e.id};
    S.educationDecision=null;DEBUG_RANDOM=()=>0.1;slot(0.4);const preferred=fired;
    const occupation={...regional,id:'occupation-regression',need:['職:'+J[S.job].n]};
    EV.splice(0,EV.length,common,occupation);slot(0.5);const workPreferred=fired;
    S.sn.previous_work=S.year-2;
    const history={...regional,id:'history-regression',need:[],after:{id:'previous_work',min:1}};
    EV.splice(0,EV.length,common,history);slot(0.55);const historyPreferred=fired;
    EV.splice(0,EV.length,common);slot(0.6);const fallback=fired;
    DEBUG_RANDOM=null;fire=realFire;EV.splice(0,EV.length,...all);
    return {privateOnly,known,wrongRegion,preferred,workPreferred,historyPreferred,fallback};
  })()`,ctx);
  assert.equal(r.privateOnly,false);assert.equal(r.known,true);assert.equal(r.wrongRegion,false);
  assert.equal(r.preferred,'regional-regression','regional context may outrank the random common tone');
  assert.equal(r.workPreferred,'occupation-regression');assert.equal(r.historyPreferred,'history-regression');
  assert.equal(r.fallback,'common-regression','daily fallback remains available');
}
console.log('PASS resolved-choice recurrence, child milestones, medical change, contextual daily and institutional consequences');

{
  const ctx=fresh('route-specific-onset','ヴィクトリア');
  const r=vm.runInContext(`(()=>{
    const onset=route=>{S.inf=0;S.ob=0;S.infection=null;S.infectionOnset=null;S.mortality=null;
      DEBUG_RANDOM=()=>0.25;ap({inf:1,infectionRoute:route,infCause:'明示された接触',ob:4});DEBUG_RANDOM=null;
      return {...S.infectionOnset};};
    const dust=onset('dust'),wound=onset('wound'),deep=onset('deep-wound');
    const injury=S.mortality.episodes.find(e=>e.kind==='injury');
    const first={...S.infectionOnset},cause=S.infection.cause,load=S.ob;
    ap({inf:1,infectionRoute:'dust',infCause:'二度目の接触',ob:2});
    const retained=S.infection.cause===cause && S.ob===load+2 &&
      JSON.stringify(first)===JSON.stringify(S.infectionOnset);
    const repeat=S.oripathyExposure.history.at(-1).kind;
    const saved=JSON.parse(JSON.stringify(S));
    S.infectionOnset.initialLoad=101;const bad=auditLifeState(S).some(x=>x.includes('感染初期病状'));
    return {dust,wound,deep,injury:injury?.severity,retained,repeat,bad,
      saved:saved.infectionOnset.initialLoad===deep.initialLoad};
  })()`,ctx);
  assert(r.dust.initialLoad<r.wound.initialLoad && r.wound.initialLoad<r.deep.initialLoad,
    'equal controlled draws distinguish dust, superficial wounds and deep crystal injury');
  assert.equal(r.deep.acute,true);assert.equal(r.dust.acute,false);assert.equal(r.injury,3);
  assert.equal(r.dust.initialLoad,13,'first-onset ob applies in the same effect');
  for(const k of ['retained','saved','bad'])assert.equal(r[k],true,k);
  assert.equal(r.repeat,'repeat-exposure','later exposure does not rewrite the initial infection');
  const ctx2=fresh('annual-unconfirmed-route','ヴィクトリア');
  const annual=vm.runInContext(`(()=>{S.inf=0;S.ob=0;DEBUG_RANDOM=()=>0.5;
    advanceAnnualInfection(S,{...ANNUAL_SERVICES,oriAnnualChance:()=>1,R:()=>0},0);DEBUG_RANDOM=null;
    return {route:S.infectionOnset.route,cause:S.infection.cause};})()`,ctx2);
  assert.equal(annual.route,'unconfirmed','annual environmental estimates do not invent a wound');
  assert.match(annual.cause,/特定できない/);
}
console.log('PASS route-specific onset, first-exposure burden, injury, repeat-exposure provenance and annual unknown route');
