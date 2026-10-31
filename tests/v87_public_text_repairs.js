'use strict';
const assert = require('node:assert/strict'),
  path = require('node:path'),
  vm = require('node:vm'),
  root = path.resolve(__dirname, '..'),
  { loadData } = require('../tools/data-values.cjs'),
  { context } = require('./support/annual-cases.cjs'),
  { data } = loadData(root),
  event = id => data.EV.find(row => row.id === id),
  allDataText = JSON.stringify(data);

assert(data.RACE.some(row => row.n === 'ヴァルポ'));
assert(data.RACE.some(row => row.n === 'ヴィーヴル'));
assert.equal(data.RACE_AFF['シラクーザ']['ヴァルポ'], 1.5);
assert.equal(data.RACE_AFF['極東']['ヴァルポ'], 1.5);
for (const obsolete of ['ヴァルボ', 'ヴイーヴル', 'デイティ・グリファーバーグ', 'ファミリア', '雪祀司'])
  assert(!allDataText.includes(obsolete), `published data retains obsolete terminology: ${obsolete}`);
assert(allDataText.includes('サンクト・グリファーブルク'));
assert(allDataText.includes('ファミリー'));
assert(allDataText.includes('雪祭司'));

// Event text can be a function; JSON serialization is not a text resolver.
const graffiti = data.EV.find(row => Array.isArray(row.t) && row.t.some(variant => variant?.when === '隠蔽' && typeof variant.t === 'string' && variant.t.includes('感染者は出ていけ')));
assert(graffiti, 'daily graffiti uses natural Japanese particles');
const disclosure = event('infection_family_disclosure_choice');
assert(!disclosure.c.some(choice => choice.l.includes('雇用先')),'family disclosure choices stay separate from workplace decisions');
const employerDisclosure = event('infection_workplace_disclosure').c[0];
assert.match(employerDisclosure.l, /通院日の休みを相談/);
assert(!employerDisclosure.l.includes('休診'));
assert(employerDisclosure.o[0][1].includes('その日の休みは認められた'));
const protest = event('life_ursus_student_assembly_protest');
assert.equal(protest.c[0].l, '転んだ友人を起こそうとする');
assert(protest.c[0].o[0][1].includes('取り押さえられた'));
assert(!protest.c[0].l.includes('拘束'));
assert(protest.t.includes('帰る道も見失われた'));
assert(!protest.t.includes('誰が拘束され') && !protest.c[0].o[0][1].includes('全員が捕まったわけではない'));

const civilian = event('sr_ursus_civilian_account');
assert(!civilian.t.includes('原作') && !civilian.t.includes('ゲーム上の仮定'));
assert(!civilian.c.some(choice => /未確認|判断は保留/.test(choice.l)));
const landRumor = data.HIST.find(row => row.flag === 'victoria_leak');
assert(landRumor.t.includes('土地をめぐる異変') && !landRumor.t.includes('誰が何を持ち出した'));
const mine = event('ursus_mine_assignment_offer');
assert(!mine.t.includes('全国の制度') && mine.t.includes('命令書'));
assert(mine.c.every(choice => choice.o.every(outcome => !/ゲーム上の|個別経路|同僚全員|長期の保護|配属を拒めるか/.test(outcome[1]))));
const distantNews = event('sr_londinium_distant_news');
assert(!distantNews.t.includes('ゲーム上の一場面') && distantNews.t.includes('市場'));
const counterReport = event('sr_londinium_counterreport_followup');
assert(!counterReport.t.includes('正史の市場記録'));
assert.match(counterReport.t, /売り手.*話した/);
assert.match(counterReport.t, /噂と食い違い/);
assert.match(counterReport.c[0].o[0][1], /値札.*今日の数字.*前に見た値段は思い出せなかった/);
assert.equal(counterReport.c[0].o[0][2].informationClaimAction.action, 'observe-one-stall');
const response = event('sr_londinium_recipient_response');
assert(!response.t.includes('確率を置いた') && !response.t.includes('ゲーム上の会話例'));
const laterReport = event('sr_information_claim_recipient_later_report');
assert(!laterReport.t.includes('最大6時点') && !laterReport.t.includes('2年以上'));
assert(laterReport.t.includes('久しぶりに顔を合わせた'));
const meeting = event('sr_information_claim_organization_meeting');
assert(!meeting.t.includes('会員が出席したか') && !meeting.t.includes('ゲーム上の仮定'));
assert(meeting.c.every(choice => !choice.l.includes('未確認として')));
const business = event('sr_siracusa_independent_business');
assert(!business.t.includes('ゲーム上の仮定') && !business.t.includes('ヌオバ・ウォルシーニ'));
assert(business.c.every(choice => !/店主は.*決めた|案を引き受ける|案は受けない/.test(choice.l + choice.o[0][1])));
const businessFollowup = event('sr_siracusa_trade_followup');
assert(!businessFollowup.t.toString().includes('市場全体の結論') && businessFollowup.c.every(choice => choice.o.every(outcome => !/未確認のまま|他の労働者へどう及ぶ|地域の経済から離れる/.test(outcome[1]))));
const military = event('inter_ursus_minority_work_v76');
assert(!military.t.includes('本作') && !military.t.includes('ゲーム上の仮定'));
const conflict = event('sr_londinium_claim_conflict_followup');
assert(conflict.c.slice(0, 4).every(choice => choice.o[0][1].endsWith('伝えた。')));
assert(conflict.c.slice(0, 4).every(choice => !/返事|黙って|尋ねた|言った/.test(choice.o[0][1])));
assert(!allDataText.includes('{spouse}'));

const schoolAid = event('life_ursus_school_aid_followup');
assert.equal(
  schoolAid.c[1].o[0][2].regionalImpact.description,
  '家族の転居前、同級生の連絡先を近所の大人へ託した'
);
const divorceReview = event('family_divorce_parenting_review');
assert(!JSON.stringify(divorceReview.t).includes('返答や合意は記録されていない'));
assert(!JSON.stringify(divorceReview.t).includes('今の記録だけでは分からない'));
const knightInjury = event('kaz_knight_injury_adaptation');
assert(!JSON.stringify(knightInjury.c).includes('回復を保証しない'));
const discriminationFollow = event('earth_discr_work_follow');
const discriminationYears = event('earth_discr_work_years');
// This route concerns infection disclosure, separately from Sarkaz ancestry.
assert.match(discriminationFollow.c[2].o[0][1], /別の働き手.*契約.*診断を告げた後に条件が変わった/);
assert.equal(discriminationFollow.c[2].o[0][2].fl.ed_work_collective, 1);
const sarkazApplication = event('earth_discr_sarkaz_application');
assert.match(sarkazApplication.c[2].o[0][1], /同じ求人.*条件を尋ねた.*自分が聞けた内容.*次に確かめること/);
assert.equal(sarkazApplication.c[2].o[0][2].fl.ed_sarkaz_terms_recorded, 1);
assert(!JSON.stringify([discriminationFollow, discriminationYears, sarkazApplication]).includes('断定できない'));
const medicalAftermath = event('v87_medical_access_aftermath');
assert(medicalAftermath.c[1].o[0][1].includes('二人で窓口の説明を確かめ'));
assert.match(medicalAftermath.c[2].o[0][1], /帳面.*交通費と休める日/);
assert.equal(medicalAftermath.c[2].o[0][2].socialAftermathAction.type, 'review');
assert(!JSON.stringify(medicalAftermath.c).includes('診療そのものが成立したか'));
const lateranoReview = event('inter_laterano_sarkaz_route_review_v87');
assert(lateranoReview.t.includes('返事を待ちながら今の暮らしを続けてきた'));
assert(lateranoReview.c[2].o[0][1].includes('別の働き口を探すことにした'));
assert(!JSON.stringify(lateranoReview).includes('返答や許可、採用はまだ記録されていない'));
assert(!JSON.stringify(lateranoReview).includes('許可や越境を意味せず'));

const ctx = context(root).ctx;
const noRegisteredWorldPressure = vm.runInContext(
  "worldPressureContext({res:REG.find(region=>region.n==='ウルサス'),year:1090,world:{events:{}}}).summary",
  ctx
);
assert.equal(noRegisteredWorldPressure, '登録された年表圧力はない。');
function startLife(seed = 870901, divorced = false) {
  vm.runInContext(`(()=>{
    born({seed:${seed},by:1077,region:'ウルサス'});
    S.age=35;S.year=1112;S.mo=6;S.cash=10000000;S.priceIndex=1;
    const child={id:'child-text-audit',nm:'子ども',by:S.year-16,r:RACE[0],d:0,inf:0,householdStatus:'supported',jobId:2};
    S.kids=[child];S.eventRelativeId=child.id;
    ${divorced ? `
      child.otherParentId='former-text-audit';
      child.householdResidencePlan='self';
      S.relationshipHistory=[{id:'former-text-audit',nm:'元配偶者',ending:'離婚',endedYear:S.year-2,residenceRegion:'ウルサス',knownResidenceRegion:'ウルサス'}];
    ` : ''}
  })()`, ctx, { timeout: 15000 });
}
function choose(id, index) {
  ctx.textRepairChoiceIndex = index;
  vm.runInContext(`(()=>{
    const row=window.GAME_DATA.EV.find(item=>item.id==='${id}'),choice=row.c[textRepairChoiceIndex],previous=TRACE_RESOLUTION;
    TRACE_RESOLUTION={kind:'choice',id:row.id,label:choice.l};
    try{ap(choice.o[0][2]);}finally{TRACE_RESOLUTION=previous;}
  })()`, ctx, { timeout: 15000 });
}

const childFuture = event('family_child_future'),
  supportKinds = ['study-funds', 'work-introduction', 'household-open', 'move-funds', 'revisit'];
assert.deepEqual(Array.from(childFuture.c, choice => choice.o[0][2].childFutureSupport?.kind), supportKinds);
assert(childFuture.c.every(choice => choice.o.every(outcome => outcome[2].childPlan === undefined)));
for (let index = 0; index < childFuture.c.length; index++) {
  startLife(870910 + index);
  const before = vm.runInContext(`(()=>{const k=S.kids[0];return {status:k.householdStatus,job:k.jobId,plan:k.futurePlan||null,move:k.independentSinceYear||null,cash:S.cash,houseCash:S.house.cash}})()`, ctx);
  choose('family_child_future', index);
  const after = vm.runInContext(`(()=>{const k=S.kids[0];return {status:k.householdStatus,job:k.jobId,plan:k.futurePlan||null,move:k.independentSinceYear||null,review:k.futurePlanReviewYear,support:k.futurePlanSupportHistory?.at(-1),cash:S.cash,houseCash:S.house.cash}})()`, ctx);
  assert.deepEqual({ status: after.status, job: after.job, plan: after.plan, move: after.move },
    { status: before.status, job: before.job, plan: before.plan, move: before.move },
    `parent support choice ${index} does not select the child's path`);
  assert.equal(after.support.kind, supportKinds[index]);
  assert.equal(after.support.year, 1112);
  assert.equal(after.review, 1115);
  assert.equal(after.cash, before.cash, 'household support comes from shared household funds');
  assert.equal(after.houseCash, before.houseCash - (index === 0 ? 120000 : index === 3 ? 64000 : 0));
}

const residence = event('family_divorce_child_residence'),
  residencePlans = ['self', 'former_support', 'former', 'shared'];
assert(!JSON.stringify(residence.t).includes('親としての権利') && !JSON.stringify(residence.t).includes('窓口で確かめる'));
assert.deepEqual(
  Array.from(residence.c.slice(0, residencePlans.length), choice => choice.o[0][2].childResidenceProposal?.plan),
  residencePlans
);
assert.equal(residence.c[4].o[0][2].childResidenceReview, 1, 'deferring a proposal only schedules a later review');
for (let index = 0; index < residencePlans.length; index++) {
  startLife(870930 + index, true);
  const before = vm.runInContext(`(()=>({plan:S.kids[0].householdResidencePlan,cash:S.cash,share:childResidenceCostShare(S,S.kids[0])}))()`, ctx);
  choose('family_divorce_child_residence', index);
  const after = vm.runInContext(`(()=>({
    plan:S.kids[0].householdResidencePlan,
    updated:S.kids[0].householdResidenceUpdatedYear||null,
    proposal:S.kids[0].householdResidenceProposal,
    cash:S.cash,
    share:childResidenceCostShare(S,S.kids[0]),
    trace:traceChildren(S).children[0],
    visible:JSON.stringify(fam(S))
  }))()`, ctx);
  assert.equal(after.plan, before.plan, `proposal ${index} does not move the child`);
  assert.equal(after.updated, null);
  assert.equal(after.proposal.plan, residencePlans[index]);
  assert.equal(after.proposal.year, 1112);
  assert.equal(after.share, before.share, 'budget continues to use the current residence');
  assert.equal(after.cash, before.cash, 'a proposed allowance is not recorded as paid');
  assert.equal(after.trace.householdResidenceProposal.plan, residencePlans[index], 'proposal survives the life snapshot');
  assert(after.visible.includes('生活先の案を伝えた（返事待ち'), 'family panel distinguishes a proposal from the residence in use');
}

startLife(870935, true);
const beforeDefer = vm.runInContext('(()=>({plan:S.kids[0].householdResidencePlan,cash:S.cash,review:S.kids[0].householdResidenceReviewYear||null}))()', ctx);
choose('family_divorce_child_residence', 4);
const afterDefer = vm.runInContext('(()=>({plan:S.kids[0].householdResidencePlan,cash:S.cash,review:S.kids[0].householdResidenceReviewYear,proposal:S.kids[0].householdResidenceProposal||null,visible:JSON.stringify(fam(S))}))()', ctx);
assert.equal(afterDefer.plan, beforeDefer.plan, 'deferral leaves the recorded residence plan unchanged');
assert.equal(afterDefer.cash, beforeDefer.cash);
assert(afterDefer.review > 1112, 'deferral schedules another review');
assert.equal(afterDefer.proposal, null, 'deferral does not create a nonexistent recipient or pending reply');
assert(!afterDefer.visible.includes('返事待ち'));

startLife();
vm.runInContext(`S.sp={id:'spouse-text-audit',nm:'カナ',r:RACE[0],d:1110,deathYear:1110,deathCause:'病死',deathNoticePending:true};`, ctx);
const pendingNotice = vm.runInContext('spouseHealthMarkup(S)', ctx);
assert(pendingNotice.includes('その後の近況は届いていない'));
assert(!pendingNotice.includes('病死') && !pendingNotice.includes('1110年'));
const pendingFamilyOverview = vm.runInContext('JSON.stringify(fam(S))', ctx);
assert(!pendingFamilyOverview.includes('病死') && !pendingFamilyOverview.includes('1110年') && !pendingFamilyOverview.includes('訃報未着'));
vm.runInContext(`S.sp.deathNoticePending=false;S.sp.deathKnownYear=1112;`, ctx);
const receivedNotice = vm.runInContext('spouseHealthMarkup(S)', ctx);
assert(receivedNotice.includes('1112年に死亡の知らせが届いた') && receivedNotice.includes('病死'));


startLife();
vm.runInContext(`S.sp={id:'spouse-text-audit',nm:'カナ',r:RACE[0]};`, ctx);
for (const id of ['family_spouse_separate_life', 'family_spouse_infected_housing_pressure']) {
  const row = event(id), template = row.c.flatMap(choice => choice.o).map(outcome => outcome[1]).find(text => text.includes('{sp}の暮らす'));
  assert(template, `${id} keeps the spouse name in its visit result`);
  ctx.textRepairTemplate = template;
  const rendered = vm.runInContext('tpl(textRepairTemplate,S)', ctx);
  assert(rendered.includes('カナの暮らす'), `${id} renders the spouse name`);
}

// Check actual rendered text and resulting records, rather than replacing old quotations alone.
startLife();
ctx.publicTextGraffitiId = graffiti.id;
const renderedGraffiti = vm.runInContext(`(()=>{
  S.fl.hid=1;
  const row=EV.find(row=>row.id===publicTextGraffitiId);
  return {conditional:txt(row,S,tags(S)),dynamic:txt({id:'text-test',t:s=>'動的な記録 '+s.age+'歳'},S,tags(S))};
})()`,ctx);
assert.match(renderedGraffiti.conditional,/感染者は出ていけ/);
assert.equal(renderedGraffiti.dynamic,'動的な記録 35歳');
for (const [id,index,flag] of [['earth_discr_work_follow',2,'ed_work_collective'],['earth_discr_sarkaz_application',2,'ed_sarkaz_terms_recorded']]) {
  startLife();
  const before=vm.runInContext('({job:S.job,cash:S.cash,houseCash:S.house.cash})',ctx);
  choose(id,index);
  ctx.publicTextFlag=flag;
  const after=vm.runInContext('({job:S.job,cash:S.cash,houseCash:S.house.cash,recorded:S.fl[publicTextFlag]})',ctx);
  assert.equal(after.recorded,1);
  assert.deepEqual({job:after.job,cash:after.cash,houseCash:after.houseCash},{...before},'comparing records must not invent employment or compensation');
}
const informationObservation=vm.runInContext(`(()=>{
  HL=1;born({seed:109901,by:1077,region:'ヴィクトリア'});S.age=30;S.year=1099;
  const history=HIST.find(row=>row.flag==='londinium_war');S.known.londinium_war=1;S.world.events.londinium_war=history.y;
  const first=EV.find(row=>row.id==='sr_londinium_distant_news');
  recordInformationClaimAction(S,first.c[0].o[0][2].informationClaimAction,first.id);
  const receive=EV.find(row=>row.id==='sr_londinium_price_followup');
  const choice=receive.c.find(choice=>choice.o[0][2].informationClaimAction?.claimId==='londinium-grain-price-stability');
  recordInformationClaimAction(S,choice.o[0][2].informationClaimAction,receive.id);
  S.year++;
  const follow=EV.find(row=>row.id==='sr_londinium_counterreport_followup');
  const visible=follow.show(S),text=txt(follow,S,tags(S));
  const claim=S.informationClaims.find(row=>row.id==='londinium-grain-price-stability');
  const before=claim.status;
  const prior=TRACE_RESOLUTION;TRACE_RESOLUTION={kind:"choice",id:follow.id,label:follow.c[0].l};
  try{ap(follow.c[0].o[0][2]);}finally{TRACE_RESOLUTION=prior;}
  return {visible,text,before,status:claim.status,evidence:claim.evidence.at(-1)};
})()`,ctx);
assert(informationObservation.visible);
assert.match(informationObservation.text,/噂と食い違い/);
assert.equal(informationObservation.status,'unverified');
assert.equal(informationObservation.status,informationObservation.before);
assert.equal(informationObservation.evidence.type,'single-stall-price-observation');
assert.equal(informationObservation.evidence.scope,'一店舗・一時点');
const medicalReview=vm.runInContext(`(()=>{
  const patient={age:42,year:1100,socialAftermath:{version:1,nextId:2,episodes:[{id:'medical-test',year:1099,domain:'medical',status:'active'}]},fl:{dg:0,tx:0},inf:0};
  const row=EV.find(row=>row.id==='v87_medical_access_aftermath');
  applySocialAftermathAction(patient,row.c[2].o[0][2].socialAftermathAction,row.id);
  return patient;
})()`,ctx);
assert.equal(medicalReview.socialAftermath.actions.at(-1).action,'review');
assert.equal(medicalReview.socialAftermath.episodes[0].status,'active');
assert.equal(medicalReview.fl.dg,0);
assert.equal(medicalReview.fl.tx,0);
assert.equal(medicalReview.inf,0);

console.log('PASS priority public-text repairs, child agency/proposal state, notice privacy and spouse-name templates');
