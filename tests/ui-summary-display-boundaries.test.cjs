'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const presentation = require('./support/presentation-cases.cjs');

const root = path.resolve(__dirname, '..');
const env = presentation.context(root);
presentation.setup(env, {
  id: 'detail-source-id-boundary',
  seed: 907001,
  region: 'カズデル',
  age: 24,
  profile: 'standard'
});
vm.runInContext(
  `S.attitudeHistory = [{
    year: S.year, age: S.age, attitude: 'sarkaz', before: 20, after: 14,
    effectiveDelta: -6, inputDelta: -6, sourceEventId: 'bias_family_sarkaz_model',
    choice: '会ったこともないのに、どうして悪く言うのか尋ねる', formation: 1
  }];`,
  env.ctx
);

// The learning diagram exposes only dated attendance/literacy records. Gaps,
// future records and internal attitude values cannot become visible facts.
{
  vm.runInContext(`globalThis.savedLearningRows = S.socialLearning.yearlyHistory;
    S.socialLearning.yearlyHistory = [
      {year:S.by+8,age:8,school:true,literacy:29,infected:91,sarkaz:93},
      {year:S.by+12,age:12,school:false,literacy:42},
      {year:S.year+1,age:S.age+1,school:true,literacy:99}];`, env.ctx);
  const before = vm.runInContext('JSON.stringify({S,RANDOM_STATE})', env.ctx);
  const diagram = vm.runInContext('terminalRecordDiagramMarkup("work",S)',env.ctx);
  assert.match(diagram,/通学した記録・読み書き 29/);
  assert.match(diagram,/この年の通学記録なし・読み書き 42/);
  assert.match(diagram,/記録された年の学び（2件）/);
  assert.match(diagram,/間の時期の通学・学習は推定しません/);
  assert.doesNotMatch(diagram,/読み書き 99|infected|sarkaz/);
  assert.equal(vm.runInContext('JSON.stringify({S,RANDOM_STATE})',env.ctx),before);
  vm.runInContext('S.socialLearning.yearlyHistory=savedLearningRows;delete globalThis.savedLearningRows;',env.ctx);
}

// A repeated render must not destroy the career disclosure used by the index.
vm.runInContext('renderLifeAndKnowledgePanel(S,RENDER_SERVICES)', env.ctx);
env.writes.length=0;
vm.runInContext('renderLifeAndKnowledgePanel(S,RENDER_SERVICES)', env.ctx);
assert.ok(!env.writes.some(([id,property])=>id==='trajectory'&&property==='innerHTML'),
  'unchanged career records retain their DOM, disclosure state and index targets');

const details = vm.runInContext('fam(S)', env.ctx);
assert.match(details, /会ったこともないのに、どうして悪く言うのか尋ねる/);
assert.doesNotMatch(details, /bias_family_sarkaz_model/);
assert.match(details, /20\.0→14\.0/);

// Missing career records may be folded, but actual history must remain in
// the primary dossier. The renderer must not invent or discard a career.
{
  const initial=vm.runInContext('lifeRecordMarkup(S)',env.ctx);
  const disclosure=initial.indexOf('<details class="ui-empty-records"');
  assert.ok(disclosure>=0,'explicitly unrecorded fields share one disclosure');
  assert.ok(initial.indexOf('仕事の移り変わり')>disclosure,'missing career stays available in the disclosure');
  vm.runInContext(`ensureLifeRecord(S).careerChanges.push({year:S.year,fromTitle:'見習い',toTitle:'整備工'});`,env.ctx);
  const withCareer=vm.runInContext('lifeRecordMarkup(S)',env.ctx);
  assert.ok(withCareer.indexOf('見習いから整備工へ')<withCareer.indexOf('<details class="ui-empty-records"'),
    'a newly recorded career is promoted into the primary text');
}

// Compact only explicit missing values, never zero, an uncertain diagnosis or
// an unconfirmed person's safety. Every folded row remains readable.
{
  const markup=vm.runInContext(`recordTableMarkup('<dt>支援</dt><dd>記録なし</dd><dt>資金</dt><dd>0</dd><dt>診断</dt><dd>診断記録なし</dd><dt>親</dt><dd>安否未確認</dd><dt>一緒に暮らす人</dt><dd>なし</dd><dt>配偶者</dt><dd>なし</dd>', 'family', true)`,env.ctx);
  const unrecorded=markup.indexOf('data-record-group="family-unrecorded"');
  assert.ok(markup.indexOf('<dt>支援</dt>')>unrecorded);
  for(const value of ['<dd>0</dd>','診断記録なし','安否未確認','<dt>一緒に暮らす人</dt>'])
    assert.ok(markup.includes(value) && markup.indexOf(value)<markup.indexOf('<details'),value+' stays in the primary record');
  assert.ok(markup.includes('data-record-group="family-relations"'),'absence is distinct from an unrecorded history');
  const summary=vm.runInContext('lifeSummaryMarkup(S)',env.ctx);
  for(const title of ['生い立ちと暮らし','生業・学び・残したもの','家族と人とのつながり','身体・経験・最期'])
    assert.ok(summary.includes(title),title+' has a readable file');
  assert.ok(summary.includes('見習いから整備工へ'),'career details survive the grouped ending');
  assert.ok(summary.includes('最終純資産（龍門幣換算）'),'final balances remain available');
  assert.ok(summary.includes('家計の立て直し') && summary.includes('本人が残した希望'),'the added budget plan preserves personal wishes and final balances');
  const health=vm.runInContext(`(()=>{const s=JSON.parse(JSON.stringify(S));s.inf=1;s.fl.dg=0;return lifeSummaryFacts(s).health;})()`,env.ctx);
  assert.doesNotMatch(health,/感染記録あり|診断記録あり/,'the ending does not reveal an undiagnosed model infection');
  assert.match(health,/感染の有無は未確定/,'absence of diagnosis is not a negative diagnosis');
}

// Ledger indicators are an interpretation of values the player can already inspect.
// A missing diagnosis must never be converted into an infection label.
{
  const ledgerEnv=vm.createContext({
    document:{addEventListener(){},getElementById(){return null;}},
    Intl
  });
  vm.runInContext(fs.readFileSync(path.join(root,'js/ui/terminal-navigation.js'),'utf8'),ledgerEnv);
  ledgerEnv.sample={
    age:7,h:47,fl:{dg:0},
    house:{cash:225,debt:1500,inc:100,exp:500},
    mortality:{episodes:[{kind:'oripathy',status:'active',severity:4}]}
  };
  ledgerEnv.summary={person:{
    occupation:'無職',education:'未就学',
    place:'ヴィクトリア',birthplace:'ヴィクトリア'
  }};
  const before=JSON.stringify(ledgerEnv.sample);
  ledgerEnv.occupationLabel=person=>person.jobLabel || '無職';
  ledgerEnv.eduLv=()=>0;
  ledgerEnv.educationStandingLabel=()=> '初等教育の修了記録なし';
  ledgerEnv.EL=['未就学'];
  ledgerEnv.MORBID_LABELS={oripathy:'鉱石病に伴う不調'};
  vm.runInContext(fs.readFileSync(path.join(root,'js/ui/summary-view.js'),'utf8'),ledgerEnv);
  ledgerEnv.sample.h=75;
  const unknown=vm.runInContext('playerInformationSummary(sample)',ledgerEnv);
  assert.equal(unknown.cards[0].headline,'体力には比較的余裕がある');
  assert.doesNotMatch(JSON.stringify(unknown),/鉱石病/,
    'unknown diagnosis must not be inferred from raw episodes or ordinary vitality');
  ledgerEnv.sample.h=47;
  let health=vm.runInContext("lifeLedgerMetrics('health',sample,summary)",ledgerEnv);
  assert.equal(health.length,1,'hidden diagnoses are not used in visible ledgers');
  assert.equal(health[0].label,'体力（ゲーム内指標）');
  assert.equal(health[0].value,'47 / 100');
  assert.doesNotMatch(JSON.stringify(health),/鉱石病/);
  let household=vm.runInContext("lifeLedgerMetrics('family',sample,summary)",ledgerEnv);
  assert.deepEqual(Array.from(household,x=>x.label),['養育家計の手元資金','養育家計の負債']);
  assert.match(household[0].value,/225 龍門幣/);
  assert.equal(JSON.stringify(ledgerEnv.sample),before,'read-only ledger must not alter life state');
  ledgerEnv.sample.age=20;
  ledgerEnv.sample.cash=0;ledgerEnv.sample.debt=900;
  household=vm.runInContext("lifeLedgerMetrics('family',sample,summary)",ledgerEnv);
  assert.deepEqual(Array.from(household,x=>x.label),['本人の手元資金','本人の負債']);
  ledgerEnv.sample.fl.dg=1;
  health=vm.runInContext("lifeLedgerMetrics('health',sample,summary)",ledgerEnv);
  assert.equal(health[1].value,'診断あり');

  // Current presentation settings must not close the document being read.
  ledgerEnv.movedDetails=[
    {tagName:'DETAILS',open:true},
    {tagName:'DETAILS',open:true}
  ];
  ledgerEnv.document.querySelectorAll=()=>[];
  ledgerEnv.document.documentElement={setAttribute(){},removeAttribute(){}};
  vm.runInContext(fs.readFileSync(path.join(root,'js/ui/preferences.js'),'utf8'),ledgerEnv);
  vm.runInContext(`TERMINAL_LEDGER={moved:movedDetails.map(element=>({element}))};
    setUIPreference('spacing','standard');setUIPreference('motion','reduced');`,ledgerEnv);
  assert.ok(ledgerEnv.movedDetails.every(element=>element.open),
    'changing spacing and motion does not collapse the currently visible ledger');
}


// The four-way ending index must resolve to real targets, including the
// central journal that lives below the ending report.
{
  const markup=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const ending=fs.readFileSync(path.join(root,'js/ui/ending.js'),'utf8');
  const terminalCSS=fs.readFileSync(path.join(root,'css/terra-identity.css'),'utf8');
  for(const name of ['ending-summary','ending-metrics','ending-peers','life-journal-panel']){
    assert.ok(ending.includes('href="#'+name+'"'),'four-way index: '+name);
    assert.ok((ending+markup).includes('id="'+name+'"'),'valid index destination: '+name);
  }
  assert.match(markup,/id="terminal-ledger-nav"/,'the dossier directory remains available');
  assert.match(terminalCSS,/#terminal-ledger-nav\s*\{[\s\S]*?position:sticky/);
  assert.match(terminalCSS,/#terminal-ledger-body\s*\{\s*max-height:none;overflow:visible/,
    'detail view uses the page as its only primary scroller');
  // Decorative register copy is not an information-boundary requirement.
}
// Category changes must move the page to the ledger header rather than
// resetting an inner scroll element, and must account for sticky toolbar height.
{
  let scrolledTo=null;
  const win={scrollY:320,scrollTo:(x,y)=>{scrolledTo=[x,y];},
    addEventListener(){},matchMedia:()=>({matches:false})};
  const dom={addEventListener(){},readyState:'loading',getElementById:id=>id==='tb'
    ? {getBoundingClientRect:()=>({height:72})} : null};
  const ctxNav=vm.createContext({window:win,document:dom});
  vm.runInContext(fs.readFileSync(path.join(root,'js/ui/terminal-navigation.js'),'utf8'),ctxNav);
  ctxNav.anchor={getBoundingClientRect:()=>({top:105})};
  vm.runInContext('scrollToTerminalSection(anchor)',ctxNav);
  assert.deepEqual(scrolledTo,[0,345],
    'ledger headings are placed beneath the sticky main toolbar');
}

console.log('ui-summary-display-boundaries: passed');
