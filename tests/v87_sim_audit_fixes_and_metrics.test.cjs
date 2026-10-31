'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const { context } = require('./support/presentation-cases.cjs');
const runtimeEnv = context(root);

console.log('Testing 1000-sim audit fixes and new telemetry metrics...');

// 1. Repeat study duration synchronization test
const repeatTest = vm.runInContext(`(() => {
  const s = {
    by: 1077, year: 1095, age: 18,
    fl: { sch: 1 },
    educationPath: {
      stage: 'secondary',
      duration: 3,
      status: 'enrolled',
      lastProcessedYear: 1094,
      history: []
    },
    study: {
      yearsPaid: 3,
      duration: 3,
      nextDue: 1095
    },
    educationDecision: { kind: 'graduation' },
    res: { n: 'クルビア', pm: 1 },
    familyCareHistory: []
  };

  educationApplyAction(s, 'repeat');

  const problems = [];
  auditCareAndWorkplaceState(s, problems);
  return {
    pathDuration: s.educationPath.duration,
    studyDuration: s.study.duration,
    problems: Array.from(problems)
  };
})()`, runtimeEnv.ctx);

assert.equal(repeatTest.pathDuration, 4, 'educationPath.duration incremented to 4');
assert.equal(repeatTest.studyDuration, 4, 'study.duration incremented to 4 in sync');
assert.deepEqual(JSON.parse(JSON.stringify(repeatTest.problems)), [], 'auditCareAndWorkplaceState reports NO "在籍年次が不正"');
console.log('PASS: Repeat graduation review keeps s.study.duration in sync with NO audit errors');

// 2. Information claim assessment guard and fallback safety test
const claimGuardTest = vm.runInContext(`(() => {
  const s = {
    by: 1077, year: 1100, age: 23,
    informationClaims: [{
      id: 'iberia-lighthouse-market-warning',
      recordedYear: 1099,
      pursuitStopped: false,
      evidence: [],
      assessments: [{
        year: 1099, age: 22,
        action: 'assess-plausible',
        evidenceCount: 0
      }]
    }],
    res: { n: 'イベリア' }
  };

  const ev = EV.find(e => e.id === 'sr_iberia_warning_followup');
  const canShow = ev && ev.show(s);

  // Direct call to recordInformationClaimAction without new evidence
  let threw = false;
  try {
    recordInformationClaimAction(s, {
      claimId: 'iberia-lighthouse-market-warning',
      action: 'assess-plausible'
    }, 'sr_iberia_warning_followup');
  } catch (err) {
    threw = true;
  }

  return {
    hasOnce: ev?.once === true,
    canShow,
    threw
  };
})()`, runtimeEnv.ctx);

assert.equal(claimGuardTest.hasOnce, true, 'sr_iberia_warning_followup has once: true');
assert.equal(claimGuardTest.canShow, false, 'sr_iberia_warning_followup blocked when already assessed without new evidence');
assert.equal(claimGuardTest.threw, false, 'claims.js safely handles duplicate assessment without throwing exception');
console.log('PASS: Information claim followup has once:true, show guard and safe fallback without throwing');

// 3. New telemetry metrics in simulation report
const reportMetricsTest = vm.runInContext(`(() => {
  const sampleLives = [
    {
      age: 65, dead: true, cause: '獣害（狂暴化源石獣の襲撃）',
      isSarkaz: true, infected: true, discriminationLevel: 4, debt: 60000000, highDebt: true
    },
    {
      age: 72, dead: true, cause: '天災',
      isSarkaz: false, infected: false, discriminationLevel: 1, debt: 500000, highDebt: false
    },
    {
      age: 58, dead: true, cause: '自死（不可逆な絶望・破滅の果て）',
      isSarkaz: true, infected: true, discriminationLevel: 6, debt: 120000000, highDebt: true
    }
  ];

  const terraMortality = devAggregateTerraMortality(sampleLives);
  const discrim = devAggregateDiscriminationMetrics(sampleLives);
  const econ = devAggregateEconomicHealth(sampleLives);

  return { terraMortality, discrim, econ };
})()`, runtimeEnv.ctx);

assert.equal(reportMetricsTest.terraMortality.totalTerraDeaths, 2, '2 Terra specific deaths identified (beast attack + despair suicide)');
assert.equal(reportMetricsTest.terraMortality.byCategory.environmental, 1, '1 environmental');
assert.equal(reportMetricsTest.terraMortality.byCategory.psychologicalCrisis, 1, '1 psychologicalCrisis');
assert.equal(reportMetricsTest.discrim.sarkazCount, 2, '2 Sarkaz lives tracked');
assert.equal(reportMetricsTest.discrim.sarkazInfectionRate, 100, 'Sarkaz 100% infection in sample');
assert.equal(reportMetricsTest.econ.highDebtCount, 2, '2 high debt lives tracked');
assert.equal(reportMetricsTest.econ.extremeDebtCount, 1, '1 extreme debt tracked');
console.log('PASS: Telemetry aggregation functions produce rich Terra-specific mortality, discrimination & debt metrics');

// 4. Economic health and bankruptcy crisis test
const bankruptcyTest = vm.runInContext(`(() => {
  const s = {
    by: 1077, year: 1130, age: 53,
    debt: 25000000,
    cash: 100000,
    rl: 50,
    p: 30,
    fl: {},
    res: { n: 'クルビア' },
    local: { city: 'ニューエルサレム', kind: '移動都市の居住区' }
  };

  const ev = EV.find(e => e.id === 'life_debt_bankruptcy_crisis');
  const canShow = ev && ev.show(s);

  // simulate Option 1: Bankruptcy and displacement
  const opt1 = ev.c[0].o[0][2];
  const bankruptDebt = s.debt + (opt1.debt || 0);

  return {
    canShow,
    opt1,
    bankruptDebt: Math.max(0, bankruptDebt)
  };
})()`, runtimeEnv.ctx);

assert.equal(bankruptcyTest.canShow, true, 'life_debt_bankruptcy_crisis shows when debt >= 20,000,000 and cash is low');
assert.equal(bankruptcyTest.opt1.displacement, 'displaced', 'Bankruptcy choice causes displacement to slums');
assert.equal(bankruptcyTest.bankruptDebt, 0, 'Bankruptcy choice successfully resets excessive debt to 0');
console.log('PASS: Bankruptcy crisis event properly triggers and resolves catastrophic debt');

// 5. Elder life experience events test
const elderEventsTest = vm.runInContext(`(() => {
  const s = {
    by: 1077, year: 1147, age: 70,
    ch: [{ id: 1, nm: '子供' }],
    inf: 1,
    h: 25,
    cash: 50000,
    res: { n: 'ウルサス' }
  };

  const memoir = EV.find(e => e.id === 'elder_choice_write_memoir');
  const will = EV.find(e => e.id === 'elder_choice_make_will');
  const grandchild = EV.find(e => e.id === 'elder_daily_grandchild_visit');
  const palliative = EV.find(e => e.id === 'elder_choice_palliative_care_switch');
  const reflection = EV.find(e => e.id === 'elder_choice_life_reflection');

  return {
    memoirPresent: !!memoir,
    willPresent: !!will,
    grandchildShow: grandchild && grandchild.show(s),
    palliativeShow: palliative && palliative.show(s),
    reflectionPresent: !!reflection
  };
})()`, runtimeEnv.ctx);

assert.equal(elderEventsTest.memoirPresent, true, 'elder_choice_write_memoir is registered in catalog');
assert.equal(elderEventsTest.willPresent, true, 'elder_choice_make_will is registered in catalog');
assert.equal(elderEventsTest.grandchildShow, true, 'elder_daily_grandchild_visit shows for grandparent with children/grandchildren');
assert.equal(elderEventsTest.palliativeShow, true, 'elder_choice_palliative_care_switch shows for infected low-health elder');
assert.equal(elderEventsTest.reflectionPresent, true, 'elder_choice_life_reflection is registered in catalog');
console.log('PASS: All elder life and later life events are properly registered and condition-tested');

// 6. Phase 3: Assets, Property, Insurance & UI Genealogy/Career Stepper test
const phase3Test = vm.runInContext(`(() => {
  const propertyEv = EV.find(e => e.id === 'asset_choice_property_purchase');
  const workshopEv = EV.find(e => e.id === 'asset_choice_workshop_open');
  const insuranceEv = EV.find(e => e.id === 'asset_choice_catastrophe_insurance');
  const claimEv = EV.find(e => e.id === 'asset_catastrophe_insurance_claim');

  // Test state with Rhodes Island job, owned property, opened workshop and catastrophe insurance
  const s = {
    by: 1070, year: 1120, age: 50,
    nm: 'テストオペレーター',
    r: { n: 'フェリーン' },
    j: 28, // Rhodes Island
    cash: 5000000,
    debt: 0,
    k: 45,
    inf: 0,
    dead: false,
    fl: {
      real_estate_owned: 1,
      workshop_opened: 1,
      catastrophe_insured: 1,
      grandchild_count: 2,
      grandchild_interaction: 1
    },
    par: {
      fa: { nm: '父', by: 1045, d: 1115, deathKnownYear: 1115, r: { n: 'フェリーン' } },
      mo: { nm: '母', by: 1048, d: 0, r: { n: 'フェリーン' } }
    },
    sp: { nm: '配偶者', by: 1072, d: 0, r: { n: 'ループス' } },
    kids: [
      { id: 1, nm: '長男', by: 1095, householdStatus: 'independent', r: { n: 'フェリーン' }, knownFamilyChildren: 2 }
    ],
    lifeRecord: {
      careerChanges: [
        { year: 1090, fromTitle: '見習い', toTitle: '下級警備員' },
        { year: 1100, fromTitle: '下級警備員', toTitle: 'ロドス警備員' }
      ]
    }
  };

  const badgeData = getAffiliationBadgeData(s);
  const treeMarkup = generationTreeMarkup(s);
  const stepperMarkup = careerStepperMarkup(s, s.lifeRecord);

  return {
    propertyPresent: !!propertyEv,
    workshopPresent: !!workshopEv,
    insurancePresent: !!insuranceEv,
    claimPresent: !!claimEv,
    propertyShow: propertyEv && propertyEv.show({ ...s, fl: {} }),
    workshopShow: workshopEv && workshopEv.show({ ...s, fl: {} }),
    badgeData,
    treeMarkup,
    stepperMarkup
  };
})()`, runtimeEnv.ctx);

assert.equal(phase3Test.propertyPresent, true, 'asset_choice_property_purchase is registered');
assert.equal(phase3Test.workshopPresent, true, 'asset_choice_workshop_open is registered');
assert.equal(phase3Test.insurancePresent, true, 'asset_choice_catastrophe_insurance is registered');
assert.equal(phase3Test.claimPresent, true, 'asset_catastrophe_insurance_claim is registered');
assert.equal(phase3Test.propertyShow, true, 'Property purchase is offered to adult with sufficient cash');
assert.equal(phase3Test.workshopShow, true, 'Workshop opening is offered to skilled adult with cash');

assert.equal(phase3Test.badgeData.label, 'ロドス・アイランド', 'Badge correctly detects Rhodes Island operator');
assert.equal(phase3Test.badgeData.code, 'rhodes', 'Badge assigned rhodes code');

assert.ok(phase3Test.treeMarkup.includes('GENEALOGY'), 'Generation tree contains GENEALOGY badge');
assert.ok(phase3Test.treeMarkup.includes('第1世代: 親'), 'Generation tree contains Level 1 Parent');
assert.ok(phase3Test.treeMarkup.includes('第2世代: 本人'), 'Generation tree contains Level 2 Protagonist');
assert.ok(phase3Test.treeMarkup.includes('第3世代: 子'), 'Generation tree contains Level 3 Children');
assert.ok(phase3Test.treeMarkup.includes('第4世代: 孫'), 'Generation tree contains Level 4 Grandchildren');

assert.ok(phase3Test.stepperMarkup.includes('ui-career-stepper'), 'Career timeline stepper is generated');
assert.ok(phase3Test.stepperMarkup.includes('1090年'), 'Career stepper contains past career change years');
assert.ok(phase3Test.stepperMarkup.includes('自営工房開業'), 'Career stepper contains workshop milestone');

console.log('PASS: Phase 3 long-term assets, insurance, badge telemetry, generation tree and career stepper verified');

console.log('ALL 1000-SIM AUDIT FIXES AND TELEMETRY TESTS PASSED!');
