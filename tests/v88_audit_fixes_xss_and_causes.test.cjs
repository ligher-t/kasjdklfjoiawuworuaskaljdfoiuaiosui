'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const annual = require('./support/annual-cases.cjs');
const root = path.resolve(__dirname, '..');
const { ctx, nodes, storage } = annual.context(root);

annual.setup(ctx, { id: 'xss-audit', seed: 905003, region: 'クルビア', age: 20 });

// 1. XSS Escaping in UI (profile.js & ending.js)
{
  vm.runInContext(`
    HL = 0;
    tab = () => {};
    rd = () => {};
    S.nm = '<img src=x onerror=alert("xss")>';
    S.sx = '<svg onload=alert("xss")>';
    S.socialClass = { ...(S.socialClass || {}), origin: '<img src=x onerror=alert("class")>' };
    renderProfilePanel(S, {
      $: id => $(id),
      occupationLabel: s => '無職',
      educationStandingLabel: s => '未就学',
      CLASS_BAND_NAMES: {},
      esc
    }, stg(S));
  `, ctx);

  const tnNode = nodes.get('tn');
  assert.ok(tnNode, 'tn node exists in DOM mock');
  assert.ok(!tnNode.innerHTML.includes('<img src=x'), 'profile title does not contain raw img tag');
  assert.ok(tnNode.innerHTML.includes('&lt;img src=x'), 'profile title properly escapes HTML tags');

  const pfNode = nodes.get('pf');
  assert.ok(pfNode, 'pf node exists in DOM mock');
  assert.ok(!pfNode.innerHTML.includes('<img src=x'), 'profile details table does not contain raw img tag');
  assert.ok(pfNode.innerHTML.includes('&lt;img src=x'), 'profile details table properly escapes HTML tags');
  assert.ok(!pfNode.innerHTML.includes('<svg'), 'profile sex value is not interpreted as markup');
  assert.ok(pfNode.innerHTML.includes('&lt;svg'), 'profile sex value is escaped');

  const payload = '<img src=x onerror=alert("xss")>';
  const economyNodes = { fn: { innerHTML: '' }, fh: { innerHTML: '' }, ch: { innerHTML: '' } };
  ctx.xssPayload = payload;
  ctx.economyNodes = economyNodes;
  ctx.economyServices = {
    $: id => economyNodes[id],
    m: value => String(value),
    householdStrained: () => false,
    annualEconomyHistoryMarkup: () => '',
    choiceEconomyHistoryMarkup: () => ''
  };
  vm.runInContext(`
    S.investment = 1;
    S.investmentType = xssPayload;
    S.flow = { expense: { [xssPayload]: 1 }, income: {} };
    renderEconomyPanel(S, economyServices);
  `, ctx);
  assert.ok(!economyNodes.fn.innerHTML.includes('<img src=x'), 'economy panel does not contain raw imported markup');
  assert.ok(economyNodes.fn.innerHTML.includes('&lt;img src=x'), 'economy panel escapes investment and expense labels');

  // Ending panel XSS test
  vm.runInContext(`
    die('老衰', '天寿を全うした。');
  `, ctx);
  const endingNode = nodes.get('rs');
  assert.ok(endingNode, 'rs ending node exists in DOM mock');
  assert.ok(!endingNode.innerHTML.includes('<img src=x'), 'ending heading does not contain raw img tag');
  assert.ok(endingNode.innerHTML.includes('&lt;img src=x'), 'ending heading properly escapes HTML tags');

  vm.runInContext(`
    globalThis.employmentReviewText = EV.find(e => e.id === 'v87_hardline_sarkaz_employer_review').t({
      lifeRecord: {
        workRelationships: [{
          id: 'victoria-sarkaz-interview',
          person: { nm: xssPayload },
          applicantResponse: 'left-after-exclusion'
        }]
      }
    });
  `, ctx);
  assert.ok(!ctx.employmentReviewText.includes('<img src=x'), 'employment review text does not contain raw nested names');
  assert.ok(ctx.employmentReviewText.includes('&lt;img src=x'), 'employment review text escapes nested names');

  vm.runInContext(`
    S.nm = 'テラ市民';
    S.sx = '女';
    S.eventReviews = {};
    S.investmentType = '共同事業';
    S.flow = { year: S.year, expense: { living: 1 }, income: {} };
  `, ctx);
}

// 2. Save import validation (slots.js & auditLifeState)
{
  const snapshot = vm.runInContext('makeResumeSnapshot()', ctx);
  const rawSave = {
    format: 'terra-resume-save',
    version: vm.runInContext('SAVE_VERSION', ctx),
    acc: 0,
    sp: 2,
    AU: '',
    log: [],
    W: snapshot.W,
    S: JSON.parse(JSON.stringify(snapshot.S))
  };

  // Malicious name with HTML tags must be rejected by normalizeResumeImport
  rawSave.S.nm = '<script>evil()</script>';
  assert.throws(
    () => vm.runInContext(`normalizeResumeImport(${JSON.stringify(rawSave)})`, ctx),
    /現行版の中断データとして必要な状態が揃っていません|保存状態が現行版の監査に通りません/,
    'import rejects malicious HTML name in snapshot'
  );

  // auditLifeState rejects invalid name
  const problems = vm.runInContext(`auditLifeState(${JSON.stringify(rawSave.S)})`, ctx);
  assert.ok(problems.includes('名前が不正'), 'auditLifeState flags malformed/dangerous name');

  // Valid name passes
  rawSave.S.nm = 'テラ市民';
  const imported = vm.runInContext(`normalizeResumeImport(${JSON.stringify(rawSave)})`, ctx);
  assert.equal(imported.S.nm, 'テラ市民', 'valid name is preserved on clean import');

  const maliciousReviewSave = JSON.parse(JSON.stringify(rawSave));
  maliciousReviewSave.S.eventReviews = {
    life_debt_budget_review: {
      year: maliciousReviewSave.S.year,
      signature: '{}',
      choice: '<img src=x onerror=alert("xss")>'
    }
  };
  assert.throws(
    () => vm.runInContext(`normalizeResumeImport(${JSON.stringify(maliciousReviewSave)})`, ctx),
    /現行版の中断データとして必要な状態が揃っていません/,
    'import rejects HTML in event review labels'
  );

  vm.runInContext(`
    S.eventReviews = {
      life_debt_budget_review: {
        year: S.year,
        signature: '{}',
        choice: xssPayload
      }
    };
    globalThis.reviewText = txt({ id: 'life_debt_budget_review', t: '状況を振り返った。' }, S, {});
  `, ctx);
  assert.ok(!ctx.reviewText.includes('<img src=x'), 'event review text does not contain raw markup');
  assert.ok(ctx.reviewText.includes('&lt;img src=x'), 'event review text escapes imported choice labels');

  vm.runInContext(`
    globalThis.xssEmploymentRow = applyLifeWorkRelationship({
      id: 'xss-import-name',
      title: '職場関係',
      response: 'accepted'
    });
    S.eventReviews = {};
    xssEmploymentRow.person.nm = xssPayload;
  `, ctx);
  assert.equal(
    vm.runInContext('workRelationshipValid(xssEmploymentRow, S)', ctx),
    false,
    'employment record audit rejects an unsafe nested person name'
  );
  assert.throws(
    () => vm.runInContext('normalizeResumeImport(makeResumeSnapshot())', ctx),
    /保存状態が現行版の監査に通りません/,
    'import rejects unsafe nested employment names'
  );
}

// 3. Unreachable condition fix: clinical trial risk by debt (death-risk.js)
{
  // In a non-Columbia region with waiver signed, debt triggers clinical trial risk
  vm.runInContext(`
    born({ seed: 100200, by: 1080, region: 'シエスタ' });
    S.age = 26; S.h = 80; S.cash = 0; S.debt = 40000;
    S.fl.col_tech_waiver_signed = 1;
    globalThis.candidatesSiesta = D(S);
  `, ctx);

  const candidatesSiesta = ctx.candidatesSiesta;
  const trialCandidate = candidatesSiesta.find(c => c.c === '生体実験・未承認薬投与による死亡');
  assert.ok(trialCandidate, 'clinical trial risk triggers when debt >= 30000 outside Columbia');
  assert.equal(trialCandidate.p, 0.006, 'base rate applies for 30000 <= debt < 50000');

  // High debt multiplier
  vm.runInContext(`
    S.debt = 60000;
    globalThis.candidatesHighDebt = D(S);
  `, ctx);
  const trialHighDebt = ctx.candidatesHighDebt.find(c => c.c === '生体実験・未承認薬投与による死亡');
  assert.ok(trialHighDebt, 'clinical trial risk present at debt >= 50000');
  assert.equal(Math.round(trialHighDebt.p * 10000) / 10000, Math.round(0.006 * 1.8 * 10000) / 10000, 'debt >= 50000 applies 1.8x multiplier');
}

// 4. Age and context coherence for death causes (death-risk.js)
{
  // Whistleblower execution: must require age >= 16 and active threat/detention
  vm.runInContext(`
    born({ seed: 300400, by: 1085, region: 'クルビア' });
    S.age = 14; S.h = 90;
    S.fl.cyber_trace = 1;
    S.mortality = { episodes: [], threat: { status: 'none' } };
    globalThis.underageThreat = D(S).find(c => c.c === '国家機密漏洩・密告者処刑');
  `, ctx);
  assert.equal(ctx.underageThreat, undefined, 'underage character cannot receive whistleblower execution candidate');

  vm.runInContext(`
    S.age = 25;
    S.mortality = { episodes: [], threat: { status: 'none' } };
    globalThis.adultNoThreat = D(S).find(c => c.c === '国家機密漏洩・密告者処刑');
  `, ctx);
  assert.equal(ctx.adultNoThreat, undefined, 'adult with cyber_trace but no active threat/detention does not face execution');

  vm.runInContext(`
    S.mortality = { episodes: [], threat: { status: 'active' } };
    globalThis.adultWithThreat = D(S).find(c => c.c === '国家機密漏洩・密告者処刑');
  `, ctx);
  assert.ok(ctx.adultWithThreat, 'adult with cyber_trace and active threat receives whistleblower execution candidate');

  // Honor martyrdom: must not apply to non-knight civilian Laterano resident
  vm.runInContext(`
    born({ seed: 400500, by: 1080, region: 'ラテラーノ' });
    S.age = 22; S.h = 85; S.job = 1; // civilian clerk
    S.r = RACE.find(r => r.n === 'リーベリ');
    S.fl.detained = 1;
    globalThis.civilianDetained = D(S).find(c => c.c === '名誉の自決（矜持・信仰・拷問拒絶の自裁）');
  `, ctx);
  assert.equal(ctx.civilianDetained, undefined, 'ordinary civilian detainee does not receive knight honor suicide candidate');

  // Rhodes landship accident: facility staff must be aboard landship
  vm.runInContext(`
    born({ seed: 500600, by: 1075, region: 'ヴィクトリア' });
    S.age = 30; S.h = 80; S.job = 2; // researcher
    S.fl.rhodes = 1;
    S.fl.rhodes_landship = 0; // stationed at terrestrial branch
    globalThis.groundStaffRisk = D(S).find(c => c.c === '事故死（ロドス艦内研究・機関事故）');
  `, ctx);
  assert.equal(ctx.groundStaffRisk, undefined, 'terrestrial Rhodes staff cannot suffer landship engineering accident');

  // Probability ceiling order: probability after modifier cannot exceed 0.95
  vm.runInContext(`
    // Modify mortalityState to provide a high base chance
    S.res.dm = { '天災による死亡': 1.5 };
    const candidates = D(S);
    globalThis.allWithinCeiling = candidates.every(c => c.p <= 0.95);
  `, ctx);
  assert.ok(ctx.allWithinCeiling, 'all death risk candidates stay within 0.95 ceiling even after region multipliers');
}

console.log('PASS v88_audit_fixes_xss_and_causes.test.cjs: all security and coherence fixes verified');
