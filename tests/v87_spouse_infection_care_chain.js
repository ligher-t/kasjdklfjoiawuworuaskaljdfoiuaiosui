'use strict';
const assert = require('node:assert/strict'),
  path = require('node:path'),
  vm = require('node:vm'),
  root = path.resolve(__dirname, '..'),
  { context, setup } = require('./support/annual-cases.cjs'),
  { ctx } = context(root);

setup(ctx, { id: 'spouse-infection-care', seed: 905121, region: 'ヴィクトリア', age: 42 });
vm.runInContext(`S.sp = {
  id: 'care-test-spouse', nm: '試験配偶者', r: S.r, inf: 1, infHidden: 1, tx: 0,
  careEverStarted: 0, residenceRegion: S.res.n, sharesHousehold: true,
  health: 80, healthUpdatedYear: S.year, healthBasis: 'new-marriage', healthHistory: [],
  healthPlan: 'unreviewed', healthNextReviewYear: S.year + 2, healthReviewHistory: []
};
S.fl.spouse_supported = 0;
S.fl.spouse_disclosure = 0;`, ctx);

const observed = vm.runInContext(`(() => {
  const event = id => EV.find(row => row.id === id);
  const apply = (id, effect) => {
    const previous = TRACE_RESOLUTION;
    TRACE_RESOLUTION = { kind: 'choice', id };
    try { ap(effect); } finally { TRACE_RESOLUTION = previous; }
  };
  const annualCost = () => {
    const state = JSON.parse(JSON.stringify(S));
    return prepareAnnualPersonalBudget(state, ANNUAL_SERVICES, state.age, state.t, state.f).spouseCareCost;
  };
  const tagSet = () => Array.from(tags(S)),
    careMarkup = () => recurringHouseholdCostsMarkup(S),
    separateCareMarkup = () => {
      const state = JSON.parse(JSON.stringify(S));
      state.sp.sharesHousehold = false;
      state.sp.residenceRegion = REG.find(region => region.n !== S.res.n).n;
      state.sp.separateSupportPlan = 'medical';
      return spouseSeparateLifeMarkup(state);
    };

  const disclosure = event('family_spouse_oripathy_disclosure'),
    disclosureChoice = disclosure.c.find(row => row.l === '一緒に診療先を探し、暮らしを支える');
  apply(disclosure.id, disclosureChoice.o[0][2]);
  const afterDisclosure = { tx: S.sp.tx, ever: S.sp.careEverStarted, tags: tagSet(), annualCost: annualCost(), markup: careMarkup(), separateMarkup: separateCareMarkup(), awareness: S.infectionAwareness?.entries?.filter(row => row.subjectId === 'care-test-spouse') || [] };

  S.sp = {
    id: 'care-test-spouse', nm: '試験配偶者', r: S.r, inf: 1, infHidden: 0, tx: 0,
    careEverStarted: 0, residenceRegion: S.res.n, sharesHousehold: true,
    health: 80, healthUpdatedYear: S.year, healthBasis: 'new-marriage', healthHistory: [],
    healthPlan: 'unreviewed', healthNextReviewYear: S.year + 2, healthReviewHistory: []
  };
  S.fl.spouse_supported = 0;
  S.fl.spouse_disclosure = 0;
  const care = event('family_spouse_infection_care'),
    localConsult = care.c.find(row => row.l.startsWith('地域の診療所や互助先'));
  apply(care.id, localConsult.o[0][2]);
  const afterConsult = { tx: S.sp.tx, ever: S.sp.careEverStarted, tags: tagSet(), annualCost: annualCost() };

  S.sp = {
    id: 'care-test-spouse', nm: '試験配偶者', r: S.r, inf: 1, infHidden: 0, tx: 0,
    careEverStarted: 0, residenceRegion: S.res.n, sharesHousehold: true,
    health: 80, healthUpdatedYear: S.year, healthBasis: 'new-marriage', healthHistory: [],
    healthPlan: 'unreviewed', healthNextReviewYear: S.year + 2, healthReviewHistory: []
  };
  S.fl.spouse_supported = 0;
  const rhodesConsult = care.c.find(row => row.l === 'ロドスの診療窓口へ照会する');
  apply(care.id, rhodesConsult.o[0][2]);
  const afterRhodesConsult = { tx: S.sp.tx, ever: S.sp.careEverStarted, tags: tagSet(), annualCost: annualCost() };

  S.sp = {
    id: 'care-test-spouse', nm: '試験配偶者', r: S.r, inf: 1, infHidden: 0, tx: 0,
    careEverStarted: 0, residenceRegion: S.res.n, sharesHousehold: true,
    health: 80, healthUpdatedYear: S.year, healthBasis: 'new-marriage', healthHistory: [],
    healthPlan: 'unreviewed', healthNextReviewYear: S.year + 2, healthReviewHistory: []
  };
  S.fl.spouse_supported = 0;
  const review = event('family_spouse_treatment_review'),
    firstStart = review.c.find(row => row.l.startsWith('配偶者の希望を確かめ'));
  const initialGate = firstStart.show.need[0];
  apply(review.id, firstStart.o[0][2]);
  const afterStart = { tx: S.sp.tx, ever: S.sp.careEverStarted, tags: tagSet(), annualCost: annualCost(), markup: careMarkup() };

  const pause = review.c.find(row => row.l === '費用が整うまで、通院を一時休止する');
  apply(review.id, pause.o[0][2]);
  const afterPause = { tx: S.sp.tx, ever: S.sp.careEverStarted, tags: tagSet(), annualCost: annualCost(), markup: careMarkup(), separateMarkup: separateCareMarkup() };
  const resume = review.c.find(row => row.l.startsWith('初回費用') && row.l.includes('再開'));
  const restartGate = resume.show.need[0], initialHiddenAfterStart = !tags(S).has(initialGate);
  apply(review.id, resume.o[0][2]);
  const afterResume = { tx: S.sp.tx, ever: S.sp.careEverStarted, tags: tagSet(), annualCost: annualCost(), markup: careMarkup() };

  const sibling = event('family_sibling_exposure');
  const siblingOutcome = sibling.c[0].o[0][1];
  return {
    afterDisclosure,
    afterConsult,
    afterRhodesConsult,
    initialGate,
    afterStart,
    afterPause,
    restartGate,
    initialHiddenAfterStart,
    afterResume,
    siblingOutcome
  };
})()`, ctx, { timeout: 30000 });

assert.equal(observed.afterDisclosure.tx, 0, 'choosing to seek care does not mark treatment as active');
assert.equal(observed.afterDisclosure.ever, 0);
assert.equal(observed.afterDisclosure.awareness.length, 1, 'the spouse disclosure must be recorded once for the specific infected spouse');
assert.equal(observed.afterDisclosure.awareness[0].audience, 'protagonist');
assert.equal(observed.afterDisclosure.awareness[0].source, 'relative-disclosure');
assert(observed.afterDisclosure.tags.includes('配偶者の療養未開始'));
assert(!observed.afterDisclosure.tags.includes('配偶者の療養を休止中'));
assert.equal(observed.afterDisclosure.annualCost, 0, 'no recurring care cost is charged before treatment starts');
assert.match(observed.afterDisclosure.markup, /未開始/);
assert.match(observed.afterDisclosure.separateMarkup, /療養開始時に費用を分担/);

assert.equal(observed.afterConsult.tx, 0, 'a referral consultation without a confirmed appointment is not treatment');
assert.equal(observed.afterConsult.ever, 0);
assert(observed.afterConsult.tags.includes('配偶者の療養未開始'));
assert.equal(observed.afterConsult.annualCost, 0);
assert.equal(observed.afterRhodesConsult.tx, 0, 'a Rhodes referral without a confirmed appointment is not treatment');
assert.equal(observed.afterRhodesConsult.ever, 0);
assert(observed.afterRhodesConsult.tags.includes('配偶者の療養未開始'));
assert.equal(observed.afterRhodesConsult.annualCost, 0);

assert.equal(observed.initialGate, '配偶者の療養未開始');
assert.equal(observed.afterStart.tx, 1);
assert.equal(observed.afterStart.ever, 1);
assert(observed.afterStart.tags.includes('配偶者の療養中'));
assert(observed.afterStart.annualCost > 0, 'recurring care costs start when the treatment choice takes effect');
assert.match(observed.afterStart.markup, /継続中/);
assert.equal(observed.restartGate, '配偶者の療養を休止中');
assert.equal(observed.initialHiddenAfterStart, true);
assert.equal(observed.afterPause.tx, 0);
assert.equal(observed.afterPause.ever, 1);
assert(observed.afterPause.tags.includes('配偶者の療養を休止中'));
assert.equal(observed.afterPause.annualCost, 0);
assert.match(observed.afterPause.markup, /休止中/);
assert.match(observed.afterPause.separateMarkup, /療養再開時に費用を分担/);
assert.equal(observed.afterResume.tx, 1);
assert.equal(observed.afterResume.ever, 1);
assert(observed.afterResume.tags.includes('配偶者の療養中'));
assert.match(observed.afterResume.markup, /継続中/);

// Current text records voluntary testing and asks for the sibling's preference; it does not decide treatment.
assert.match(observed.siblingOutcome, /本人が希望して検査を受け/);
assert.match(observed.siblingOutcome, /結果は.*本人から聞いた/);
assert.match(observed.siblingOutcome, /本人の希望を尋ねた/);
assert.doesNotMatch(observed.siblingOutcome, /仕事を休み/);
const siblingAgency = vm.runInContext(`(() => {
  HL=1;born({seed:905143,by:1077,region:'ヴィクトリア'});S.age=25;S.year=1102;
  const person={id:newRelativeId(S),nm:'アキ',r:S.r,by:1080,j:2,inf:0,infKnown:0,tx:0,d:0};
  S.siblings=[person];S.eventRelativeId=person.id;
  const row=EV.find(event=>event.id==='family_sibling_exposure'),before=TRACE_RESOLUTION;
  TRACE_RESOLUTION={kind:'choice',id:row.id,label:row.c[0].l};
  try{ap(row.c[0].o[0][2]);}finally{TRACE_RESOLUTION=before;}
  return {inf:person.inf,known:person.infKnown,tx:person.tx,job:person.j,plan:person.treatmentPlanYear??null,text:tpl(row.c[0].o[0][1],S)};
})()`,ctx);
assert.equal(siblingAgency.inf,1);
assert.equal(siblingAgency.known,1);
assert.equal(siblingAgency.tx,0,'voluntary test result does not start sibling treatment');
assert.equal(siblingAgency.plan,null);
assert.equal(siblingAgency.job,2,'test result does not decide whether the sibling leaves work');
assert.match(siblingAgency.text,/結果はアキ本人から聞いた/);
// Twenty annual records can legitimately reference support receipts older than the retained sixteen.
const receiptRetention=vm.runInContext(`(()=>{
  HL=1;born({seed:905144,by:1077,region:'ヴィクトリア'});
  const rows=Array.from({length:20},(_,i)=>({year:S.year-19+i,support:100,supportTransactionId:'support-'+i}));
  const receipts=rows.slice(-16).map(row=>({transactionId:row.supportTransactionId,year:row.year,amount:100,region:S.res.n,plan:'living',fromId:'player'}));
  S.sp={personalFinance:{history:rows,supportReceipts:receipts},separateSupportHistory:receipts.map(row=>({...row}))};
  const problems=()=>{const issues=[];auditSpouseAndChildState(S,issues);return issues.includes('配偶者本人の年次支援受取IDが不整合');};
  const expired=problems();
  rows[0].support=-1;const invalidExpiredAmount=problems();rows[0].support=100;
  receipts.pop();const shorter=problems();
  receipts.push({transactionId:'support-19',year:S.year,amount:100,region:S.res.n,plan:'living',fromId:'player'});
  rows.at(-1).supportTransactionId='missing-current';const retainedMissing=problems();
  rows.at(-1).supportTransactionId='support-19';const matched=problems();
  return {expired,invalidExpiredAmount,shorter,retainedMissing,matched};
})()`,ctx);
assert.equal(receiptRetention.expired,false);
assert.equal(receiptRetention.invalidExpiredAmount,true,'expired references still require valid transfer amounts');
assert.equal(receiptRetention.shorter,true,'missing receipts without a full retention window remain errors');
assert.equal(receiptRetention.retainedMissing,true,'a current missing receipt remains an error');
assert.equal(receiptRetention.matched,false);
console.log(JSON.stringify({ passed: true, consultationSeparatedFromTreatment: true, recurringCostStartsWithTreatment: true, pausedAndNotStartedStatesDistinct: true, siblingAgencyPreserved: true }));
