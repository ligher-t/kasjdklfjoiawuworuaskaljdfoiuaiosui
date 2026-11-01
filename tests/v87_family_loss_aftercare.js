'use strict';

const assert = require('node:assert/strict'),
  path = require('node:path'),
  vm = require('node:vm'),
  root = path.resolve(__dirname, '..'),
  { context, setup } = require('./support/annual-cases.cjs');

function newLife(id, seed = 905821) {
  const { ctx } = context(root);
  setup(ctx, { id, seed, region: 'ヴィクトリア', age: 35 });
  return ctx;
}

function apply(ctx, effect) {
  ctx.effectUnderTest = effect;
  return vm.runInContext('ap(effectUnderTest)', ctx, { timeout: 15000 });
}

{
  const ctx = newLife('separated-spouse-death-notice');
  const result = vm.runInContext(`(() => {
    const destination = S.res.n,
      origin = REG.find(region => region.n !== destination &&
        !(MIGRATION_ROUTES[region.n] || []).some(route => route.n === destination)) ||
        REG.find(region => region.n !== destination),
      spouse = {
        id: newRelativeId(S), nm: '離れて暮らす配偶者', r: RACE[0], by: S.year - 1000,
        marriedYear: S.year - 8, j: 0, residenceRegion: origin.n,
        knownResidenceRegion: origin.n, sharesHousehold: false,
        mortalityCheckedYear: S.year - 1
      };
    S.sp = spouse;
    repairSpouseHealth(S);
    const expectedRoute = careNetworkInfoRoute({ ...S, res: origin }, destination);
    advanceSpouseLife(S);
    S.eventRelativeId = spouse.id;
    const actualDeathYear = S.sp.deathYear,
      availableYear = S.sp.deathNoticeAvailableYear,
      channel = S.sp.deathNoticeChannel,
      hiddenBeforeDelivery = !tags(S).has('配偶者の死の知らせ');
    let earlyNoticeRejected = false;
    try { ap({ spouseDeath: 1 }); } catch { earlyNoticeRejected = true; }
    S.year = availableYear;
    const readyAtDelivery = tags(S).has('配偶者の死の知らせ');
    ap({ spouseDeath: 1 });
    const record = S.relationshipHistory.at(-1);
    return {
      expectedDelay: expectedRoute.delayYears,
      actualDelay: availableYear - actualDeathYear,
      channel,
      expectedChannel: expectedRoute.channel,
      hiddenBeforeDelivery,
      earlyNoticeRejected,
      readyAtDelivery,
      spouseCleared: S.sp === null,
      deathKnownYear: record.deathKnownYear,
      noticeHistory: record.deathNoticeHistory,
      audit: auditLifeState(S)
    };
  })()`, ctx, { timeout: 30000 });

  assert.equal(result.actualDelay, result.expectedDelay, 'separate spouses use the established information route delay');
  assert.equal(result.channel, result.expectedChannel);
  assert(result.expectedDelay > 0, 'the fixture places the spouse in another region');
  assert.equal(result.hiddenBeforeDelivery, true, 'actual death does not become player knowledge before notice delivery');
  assert.equal(result.earlyNoticeRejected, true, 'the death event cannot be resolved before its notice arrives');
  assert.equal(result.readyAtDelivery, true);
  assert.equal(result.spouseCleared, true);
  assert.equal(result.deathKnownYear, 1077 + 35 + result.expectedDelay);
  assert.equal(result.noticeHistory.at(-1).deathYear, 1077 + 35);
  assert.deepEqual(Array.from(result.audit), []);
}

{
  const ctx = newLife('former-spouse-death-child-aftercare', 905822);
  const result = vm.runInContext(`(() => {
    const formerId = newRelativeId(S), childId = newRelativeId(S), adultChildId = newRelativeId(S),
      former = {
        id: formerId, nm: '離婚した相手', ending: '離婚', endedYear: S.year - 5,
        lifeStatus: 'dead', actualDeathYear: S.year - 1, actualDeathCause: '病死',
        mortalityCheckedYear: S.year - 1, deathNoticePending: true,
        deathNoticeAvailableYear: S.year, deathNoticeChannel: 'face_to_face',
        parentingPlan: 'coordinate', parentingReviewPending: true,
        parentingReviewYear: S.year, parentingHistory: [], residenceRegion: S.res.n,
        knownResidenceRegion: S.res.n
      },
      child = {
        id: childId, nm: '子ども', by: S.year - 10, r: RACE[0], d: 0, inf: 0,
        otherParentId: formerId, householdStatus: 'supported',
        householdResidencePlan: 'former_support', householdResidenceReviewYear: S.year,
        householdResidenceProposal: {
          year: S.year - 1, plan: 'former_support', annualSupport: 50000,
          status: 'pending', recipientRole: 'former_spouse', recipientId: formerId
        }
      },
      adultChild = {
        id: adultChildId, nm: '成人した子', by: S.year - 20, r: RACE[0], d: 0, inf: 0,
        otherParentId: formerId,
        householdResidenceProposal: {
          year: S.year - 1, plan: 'former', annualSupport: 0,
          status: 'pending', recipientRole: 'former_spouse', recipientId: formerId
        }
      };
    S.relationshipHistory = [former];
    S.kids = [child, adultChild];
    S.eventRelativeId = formerId;
    former.deathNoticeAvailableYear = S.year + 1;
    let earlyFormerNoticeRejected = false;
    try { ap({ formerSpouseDeathNotice: 1 }); } catch { earlyFormerNoticeRejected = true; }
    const stillPendingBeforeDelivery = former.deathNoticePending && former.deathKnownYear == null;
    former.deathNoticeAvailableYear = S.year;
    ap({ formerSpouseDeathNotice: 1 });
    S.eventRelativeId = childId;
    const event = EV.find(row => row.id === 'family_divorce_child_residence'),
      choiceVisibility = event.c.map(choice => choice.show ? choice.show(S) : true),
      beforeProposal = child.householdResidencePlan,
      parentingTargetCleared = formerSpouseParentingTarget(S) === null,
      selfResidentChild = {
        id: newRelativeId(S), nm: '同居中の子', by: S.year - 10, r: RACE[0], d: 0, inf: 0,
        otherParentId: formerId, householdResidencePlan: 'self', householdResidenceReviewYear: S.year
      },
      selfResidenceReviewSuppressed = childResidencePlanTarget({ ...S, kids: [selfResidentChild] }) === null,
      target = childResidencePlanTarget(S),
      targetId = target?.id || null,
      closedProposalAtAfterNotice = child.householdResidenceProposal;
    const aftercare = event.c[5].o[0][2];
    ap(aftercare);
    const proposalAftercare = { ...child.householdResidenceProposal },
      waitingChild = {
        id: newRelativeId(S), nm: '知らせを待つ子', by: S.year - 10, r: RACE[0], d: 0, inf: 0,
        otherParentId: formerId, householdResidenceReviewYear: S.year
      };
    S.kids.push(waitingChild);
    S.eventRelativeId = waitingChild.id;
    const waitEffect = event.c[6].o[0][2];
    ap(waitEffect);
    return {
      knownDeathYear: former.deathKnownYear,
      formerId,
      earlyFormerNoticeRejected,
      stillPendingBeforeDelivery,
      childId,
      adultProposalHistory: adultChild.householdResidenceProposalHistory,
      adultProposalClosed: adultChild.householdResidenceProposal === null,
      parentingReviewPending: former.parentingReviewPending,
      residencePlan: child.householdResidencePlan,
      residenceHistory: child.householdResidenceHistory,
      closedProposalHistory: child.householdResidenceProposalHistory,
      currentProposal: child.householdResidenceProposal,
      closedProposalAtAfterNotice,
      choiceVisibility,
      parentingTargetCleared,
      selfResidenceReviewSuppressed,
      targetId,
      beforeProposal,
      proposalAftercare,
      waitEffect,
      waitingProposal: waitingChild.householdResidenceProposal || null,
      waitingReviewYear: waitingChild.householdResidenceReviewYear,
      audit: auditLifeState(S)
    };
  })()`, ctx, { timeout: 30000 });

  assert.equal(result.knownDeathYear, 1077 + 35);
  assert.equal(result.parentingReviewPending, false);
  assert.equal(result.earlyFormerNoticeRejected, true, 'a former spouse death notice cannot be confirmed before its route arrives');
  assert.equal(result.stillPendingBeforeDelivery, true);
  assert.equal(result.residencePlan, 'unresolved', 'a dead co-parent is not treated as an active caregiver or support recipient');
  assert.equal(result.residenceHistory.at(-1).cause, 'other_parent_death_notice');
  assert.equal(result.closedProposalHistory[0].status, 'closed_co_parent_death');
  assert.equal(result.closedProposalHistory[0].recipientId, result.formerId);
  assert.equal(result.closedProposalAtAfterNotice, null, 'the former proposal is no longer shown as awaiting a dead person');
  assert.equal(result.adultProposalClosed, true, 'stale proposals are closed even after the child has reached adulthood');
  assert.equal(result.adultProposalHistory[0].status, 'closed_co_parent_death');
  assert.deepEqual(Array.from(result.choiceVisibility.slice(0, 5)), [false, false, false, false, false]);
  assert.deepEqual(Array.from(result.choiceVisibility.slice(5)), [true, true]);
  assert.equal(result.parentingTargetCleared, true);
  assert.equal(result.selfResidenceReviewSuppressed, true, 'a child already living with the protagonist is not asked to relocate because the other parent died');
  assert.equal(result.targetId, result.childId);
  assert.equal(result.beforeProposal, 'unresolved');
  assert.equal(result.proposalAftercare.recipientRole, 'child');
  assert.equal(result.proposalAftercare.recipientId, result.childId);
  assert.equal(result.proposalAftercare.plan, 'self');
  assert.equal(result.waitEffect.childResidenceReview, 1);
  assert.equal(result.waitingProposal, null, 'waiting for reliable information does not invent a message or reply');
  assert(result.waitingReviewYear > result.knownDeathYear);
  assert.deepEqual(Array.from(result.audit), []);
}


{
const ctx=context(root).ctx;
// A deceased friend/neighbor archived on a later contact must retain contact, not spouse, audit rules.
const archivedContacts = vm.runInContext(`(() => {
  const results=[];
  for(const kind of ['friend','neighbor']) {
    HL=1;born({seed:905141,by:1077,region:'ヴィクトリア'});
    const person=ensureSocialContact(S,kind),id=person.id;
    S.eventRelativeId=id;S.eventRelativeDelayYears=0;
    ap({contactDeath:1,contactDeathCause:'知らせに死因の記載なし'});
    ensureSocialContact(S,kind);
    const archived=S.relationshipHistory.find(row=>row.id===id);
    if(archived.kind!==kind || archived.ending!=='死別' || archived.deathKnownYear!==S.year)throw Error('contact death facts were changed');
    const problems=auditLifeState(S);
    const broken=JSON.parse(JSON.stringify(S));broken.relationshipHistory.find(row=>row.id===id).deathKnownYear=undefined;
    results.push({kind,problems,broken:auditLifeState(broken)});
  }
  HL=1;born({seed:905142,by:1077,region:'ヴィクトリア'});
  S.relationshipHistory=[{id:newRelativeId(S),ending:'死別',deathYear:S.year,deathKnownYear:S.year}];
  return {results,invalidSpouse:auditLifeState(S)};
})()`,ctx);
for(const row of archivedContacts.results) {
  assert.equal(row.problems.length,0, row.kind+' death archive must satisfy the full audit');
  assert(row.broken.includes('友人・隣人の死亡年・訃報認知年が不正'),row.kind+' invalid death notice must still fail contact audit');
}
assert(archivedContacts.invalidSpouse.includes('配偶者の死亡年・認知年が不正'),'spouse-specific notice requirements must remain enforced');
}

{
  const ctx=newLife('personal-wishes-life-record',905829);
  const result=vm.runInContext(`(() => {
    const child={id:newRelativeId(S),nm:'成人した子',by:S.year-22,r:RACE[0],d:0,inf:0,
      otherParentId:null,householdStatus:'independent'};
    S.kids=[child];S.age=72;S.year=S.by+S.age;S.eventRelativeId=child.id;
    TRACE_RESOLUTION={id:'life_personal_wishes'};
    ap({personalWishes:{kind:'written',content:'仕事道具と帳面の扱いを家族で相談してほしい。'}});
    const written={...S.personalWishes};
    S.dead=1;finalizeLifeLedgerAtDeath(S);
    return {written,afterDeath:S.personalWishes.afterDeathStatus,
      deathYear:S.personalWishes.deathYear,year:S.year,markup:lifeSummaryMarkup(S)};
  })()`,ctx,{timeout:15000});
  assert.equal(result.written.status,'written');
  assert.equal(result.written.recipientName,'成人した子');
  assert.equal(result.written.recipientId!=null,true);
  assert.equal(result.afterDeath,'unverified','the record must not claim the family carried the wishes out');
  assert.equal(result.deathYear,result.year);
  assert(result.markup.includes('死後の実施状況は未確認'));
}

console.log(JSON.stringify({
  passed: true,
  spouseDeathNoticeUsesResidenceRoute: true,
  knownCoParentDeathClosesOldPlanAndOffersChildCenteredReview: true,
  personalWishesPersistAndDeathExecutionRemainsUnverified: true,
  noDecisionOrPaymentIsInferred: true
}, null, 2));
