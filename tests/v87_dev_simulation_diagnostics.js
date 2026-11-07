'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const {ctx: context} = require('./support/annual-cases.cjs').context(root);
context.setTimeout = setTimeout;

(async () => {
  const result = await vm.runInNewContext(`(async () => {
    HL=1; born({seed:72001,by:1077,region:'ウルサス'});
    HL=0; AU='c'; sp=0; acc=0.25;
    replaceWorldKnowledge({diagnosticSentinel:{kept:true}});
    STAT.ev={preserved:{adult:3}}; STAT.currentLife=77;
    const original={life:S,world:W,hl:HL,au:AU,speed:sp,acc,randomSeed:RANDOM_SEED,randomState:RANDOM_STATE};
    original.lifeSnapshot=JSON.stringify(S); original.statisticsKeys=Object.keys(STAT); original.statisticsEvent=STAT.ev; original.statisticsLife=STAT.currentLife; original.statisticsEventYears=STAT.lifeEventYears;
    const options={count:4,masterSeed:712345,maxYears:6,birthYearMin:1060,birthYearMax:1080,region:'ウルサス',wealth:'平均的'};
    const progress=[];
    const first=await runDevSimulation(options,{onProgress:row=>progress.push({...row})});
    const second=await runDevSimulation(options);
    devRenderComparison(second,first);
    const after={life:S,world:W,hl:HL,au:AU,speed:sp,acc,randomSeed:RANDOM_SEED,randomState:RANDOM_STATE};
    after.lifeSnapshot=JSON.stringify(S); after.statisticsKeys=Object.keys(STAT); after.statisticsEvent=STAT.ev; after.statisticsLife=STAT.currentLife; after.statisticsEventYears=STAT.lifeEventYears;
    let cancelNow=false;
    const canceled=await runDevSimulation({...options,count:20},{shouldCancel:()=>cancelNow,onProgress:state=>{if(state.phase==='life-finished')cancelNow=true;}});
    const large=await runDevSimulation({count:12,masterSeed:72025,maxYears:100,birthYearMin:1077,birthYearMax:1077});
    const findings=devStructureFindings([EV[0].id+': 未定義の資料ID「missing」']);
    const findingSummary=devSummarizeCatalogFindings(findings);
    const comparison=compareDevSimulationReports(first,second);
    let invalidOptionsRejected=false;
    try { normalizeDevSimulationOptions({...options,birthYearMin:1080,birthYearMax:1060}); } catch { invalidOptionsRejected=true; }
    return {progress,first,second,canceled,large:{summary:large.summary,failures:large.failures,cohortCount:large.cohorts.reduce((sum,row)=>sum+row.lives,0),lifeDurations:large.lifePaths.lifeDurations},findings,findingSummary,comparison,original,after,eventCount:EV.length,invalidOptionsRejected};
  })()`, context, { timeout: 60000 });

  const cohorts = await vm.runInContext(`(async()=>{
    const count=REG.length;
    const balanced=await runDevSimulation({count,maxYears:1,regionSampling:'balanced'});
    const analytics=devCreateAnalytics();
    const s={res:REG.find(row=>row.n==='サーミ'),year:1080,age:20,origin:{n:'サーミ'},home:'固定集落',job:0,ep:0,fl:{},moves:[],lifeRecord:{affiliations:[]}};
    const observer=devCreateLifeObserver(s,analytics,1,99);
    devObserveLife(s,observer,analytics);
    s.romance={};s.fl.sch=1;s.inf=1;devObserveLife(s,observer,analytics);
    s.sp={residenceRegion:'サーミ'};s.job=1;s.fl.dg=1;devObserveLife(s,observer,analytics);
    s.sp.sharesHousehold=false;s.fl.tx=1;s.lifeRecord.affiliations=[{id:'test',status:'active'}];devObserveLife(s,observer,analytics);
    s.lifeRecord.affiliations[0].status='left';
    s.moves.push({to:'サルゴン',toHome:'移動都市'});devObserveLife(s,observer,analytics);devObserveLife(s,observer,analytics);
    STAT.lifeEventYears.clear();
    const annual=devCreateAnalytics();
    const annualState={res:REG.find(row=>row.n==='ウルサス'),year:1080,age:20,origin:{n:'ウルサス'},
      home:'移動都市',job:0,ep:0,fl:{},moves:[],lifeRecord:{affiliations:[]}};
    const annualObserver=devCreateLifeObserver(annualState,annual,3,101);
    STAT.lifeEventYears.add(1080);
    annualState.year=1081;devObserveLife(annualState,annualObserver,annual,{annualCheckpoint:true});
    annualState.year=1082;devObserveLife(annualState,annualObserver,annual,{annualCheckpoint:true});
    annualState.job=1;annualState.year=1083;devObserveLife(annualState,annualObserver,annual,{annualCheckpoint:true});
    annualState.job=0;annualState.year=1084;devObserveLife(annualState,annualObserver,annual,{annualCheckpoint:true});
    devFinalizeLifeObserver(annualObserver,annual,'year-limit');
    const duration=annual.lifeDurations[0];
    const reversed=devCreateAnalytics();
    const backwards={...s,sp:null,romance:null,job:1,fl:{tx:1,dg:1},moves:[],inf:1};
    const reverseObserver=devCreateLifeObserver(backwards,reversed,2,100);devObserveLife(backwards,reverseObserver,reversed);
    backwards.fl.sch=1;devObserveLife(backwards,reverseObserver,reversed);devObserveLife(backwards,reverseObserver,reversed);
    if(reversed.paths['school→work'] || reversed.paths['diagnosis→treatment']) throw Error('reverse/simultaneous path counted');
    let rejects=false;try{normalizeDevSimulationOptions({count:1,regionSampling:'balanced'});}catch{rejects=true;}
    return {count,balanced,paths:devFinalizeAnalytics(analytics,{regionSampling:'natural'}),duration,rejects};
  })()`,context);
  assert(cohorts.rejects);
  assert(!vm.runInContext("validate()",context).some(row=>row.includes("地域居住許可")));
  assert.equal(cohorts.balanced.lifePaths.residences.filter(row=>row.phase==='birth').length,cohorts.count);
  assert(cohorts.balanced.lifePaths.residences.filter(row=>row.phase==='birth').every(row=>row.total===1));
  assert.equal(cohorts.paths.orderedPaths['relationship→cohabitation'],1);
  assert.equal(cohorts.paths.orderedPaths['cohabitation→separation'],1);
  assert.equal(cohorts.paths.orderedPaths['school→work'],1);
  assert.equal(cohorts.paths.orderedPaths['infection→diagnosis'],1);
  assert.equal(cohorts.paths.orderedPaths['diagnosis→treatment'],1);
  assert.equal(cohorts.paths.orderedPaths['affiliation→departure'],1);
  assert.equal(cohorts.paths.residences.find(row=>row.phase==='arrival').total,1);
  assert.equal(cohorts.paths.residences.find(row=>row.phase==='birth').mobilePercent,0);
  assert.deepEqual(
    {eventFree:cohorts.duration.maxEventFreeYears,eventFrom:cohorts.duration.eventFreeFromYear,eventThrough:cohorts.duration.eventFreeThroughYear,
      noJob:cohorts.duration.maxYearsWithoutRecordedJob,noJobFrom:cohorts.duration.noRecordedJobFromYear,
      noJobThrough:cohorts.duration.noRecordedJobThroughYear},
    {eventFree:3,eventFrom:1081,eventThrough:1083,noJob:2,noJobFrom:1080,noJobThrough:1081},
    'annual duration metrics use checkpoint years and separate job-record gaps from unemployment'
  );
  assert.deepEqual(result.first.lifePaths,result.second.lifePaths);
  assert(result.progress.every(row=>row.completed + row.failed <= row.attempted));
  assert(result.progress.filter(row=>row.phase==='running').every(row=>row.completed + row.failed < row.total));
  assert.equal(result.progress.at(-1).completed, 4);
  const replay = await vm.runInContext(`(async()=>{
    const originalDev=dev, originalReport=DEV_LAST_SIMULATION_REPORT;
    try {
      DEV_LAST_SIMULATION_REPORT={options:{maxYears:6},failures:[{example:{seed:10,birthYear:1070}},{example:{seed:20,birthYear:1080}}]};
      document.getElementById('dev-failure-select').value='1';
      dev=async options=>options;
      return await devReplayFirstFailure();
    } finally {dev=originalDev;DEV_LAST_SIMULATION_REPORT=originalReport;}
  })()`,context);
  assert.equal(replay.replaySeed,20);
  assert.equal(replay.replayBirthYear,1080);
  assert.equal(result.first.summary.processedYears, 24);
  const base = result.first;
  const edited = JSON.parse(JSON.stringify(base));
  edited.eventCoverage = base.eventCoverage.slice(1);
  edited.eventCoverage.push({eventId:'new-debug-event', fired:0, candidateSlots:0});
  edited.choiceBranches = [];
  context.compareCases = {base, edited};
  const diff = vm.runInContext('compareDevSimulationReports(compareCases.edited, compareCases.base)', context);
  assert(diff.eventChanges.some(row=>row.eventId===base.eventCoverage[0].eventId && row.status==='removed'));
  assert(diff.eventChanges.some(row=>row.eventId==='new-debug-event' && row.status==='added'));
  assert(diff.branchChanges.length > 0 && diff.branchChanges.every(row=>row.status==='removed'));
  assert.equal(result.first.schema, 'terra-dev-simulation-report');
  assert.equal(result.first.schemaVersion,2);
  assert.equal(result.first.lifePaths.lifeDurations.length,4);
  assert.deepEqual(result.first.lifePaths,result.second.lifePaths);
  const legacyReport={...result.first,schemaVersion:1};
  context.legacyReport=legacyReport;
  assert.throws(()=>vm.runInContext('compareDevSimulationReports(compareCases.edited, legacyReport)',context),/v1.*自動移行.*比較対象/);
  assert.equal(result.first.summary.requested, 4);
  assert.equal(result.first.summary.attempted, 4);
  assert.equal(result.first.summary.sampled, 4);
  assert.equal(result.first.options.masterSeed, 712345);
  assert(result.first.cohorts.every(row => row.region === 'ウルサス' && row.birthDecade >= 1060 && row.birthDecade <= 1080));
  assert.equal(result.first.eventCoverage.length, result.eventCount);
  assert(result.first.eventCoverage.every(row => row.fired <= row.candidateSlots));
  assert(result.first.eventCoverage.some(row => Object.values(row.firstBlockingGateCounts).some(count => count > 0)), 'rejection reasons must be measured');
  assert(result.first.eventCoverage.every(row => row.evaluated === row.eligibleSlots + Object.values(row.firstBlockingGateCounts).reduce((sum,count)=>sum+count,0)), 'each event-slot evaluation has one first outcome');
  assert(result.first.choiceBranches.every(row => row.outcomes.reduce((sum, outcome) => sum + outcome.count, 0) <= row.enabled));
  assert(result.first.choiceBranches.some(row => row.enabled > 0), 'choice availability must include eligible but unselected candidates');
  assert(result.first.eventCoverage.every(row => row.monthlyChoiceBlocked === 0), 'collision-free annual scheduling must not waste major choices in the same month');
  assert.deepEqual(JSON.parse(JSON.stringify(result.first.eventCoverage)), JSON.parse(JSON.stringify(result.second.eventCoverage)), 'same seed and cohort must reproduce event coverage');
  assert.deepEqual(JSON.parse(JSON.stringify(result.first.choiceBranches)), JSON.parse(JSON.stringify(result.second.choiceBranches)), 'same seed and cohort must reproduce selected outcomes');
  assert.equal(result.comparison.sameConfig, true);
  assert.equal(result.comparison.eventChanges.length, 0);
  assert.equal(result.second.comparison.sameConfig, true, 'same-tab baseline comparison must be wired');
  assert.equal(result.canceled.summary.canceled, true);
  assert.equal(result.canceled.summary.attempted, 1);
  assert.equal(result.canceled.summary.sampled, 1, 'cancellation should retain completed lives');
  assert.equal(result.large.summary.attempted, 12);
  assert.equal(result.large.summary.sampled, 12, JSON.stringify(result.large.failures));
  assert.equal(result.large.cohortCount, 12);
  assert.equal(result.large.lifeDurations.length,12);
  assert(result.large.lifeDurations.every(row=>row.observedYears<=100&&row.maxEventFreeYears<=100&&row.maxYearsWithoutRecordedJob<=100));
  assert(result.large.lifeDurations.some(row=>row.maxEventFreeYears>=0),'the exploratory cohort should expose observed event-free spans');
  assert(result.large.lifeDurations.every(row=>Number.isInteger(row.seed)&&row.birthRegion),'duration examples need reproducible seed and region');
  assert.strictEqual(result.after.statisticsEventYears,result.original.statisticsEventYears);
  assert.equal(result.after.lifeSnapshot,result.original.lifeSnapshot,'diagnostic birth must not mutate the visible life before replacing it');
  assert.deepEqual(result.after.statisticsKeys,result.original.statisticsKeys);
  assert.strictEqual(result.after.life, result.original.life);
  assert.strictEqual(result.after.world, result.original.world);
  assert.deepEqual({ hl: result.after.hl, au: result.after.au, speed: result.after.speed, acc: result.after.acc, randomSeed: result.after.randomSeed, randomState: result.after.randomState }, { hl: result.original.hl, au: result.original.au, speed: result.original.speed, acc: result.original.acc, randomSeed: result.original.randomSeed, randomState: result.original.randomState });
  assert.strictEqual(result.after.statisticsEvent, result.original.statisticsEvent);
  assert.equal(result.after.statisticsLife, result.original.statisticsLife);
  assert.equal(result.invalidOptionsRejected, true);
  assert.equal(result.findings[0].severity, 'error');
  assert.equal(result.findings[0].eventId, result.findings[0].message.split(':')[0]);
  assert.equal(result.findingSummary.total, 1);
  assert.equal(result.findingSummary.bySeverity.error, 1);
// Price-scaled availability must agree with both the independent and family wallets.
const costAudit = vm.runInContext(`(() => {
  const targets = [['disaster_displacement_after',1],['kje_pilgrim',0],['kje_open',1],['lon_merchant',0],['sar_sandstorm',0],['sie_volcano',0]];
  let checked=0;
  for (const [id,index] of targets) {
    const choice=EV.find(row=>row.id===id).c[index];
    const cost=choice.en.affordableCash ?? choice.en.affordableCashAfterReserve;
    for (const pm of [0.6,1.8]) for (const shared of [false,true]) {
      HL=1;born({seed:871200,by:1077,region:'シエスタ'});S.age=30;S.year=1107;
      S.res={...S.res,pm};S.priceIndex=1.25;
      S.residenceArrangement=shared?'family_home_shared_budget':'independent';
      S.fl.household_separated=shared?0:1;
      S.house ||= {cash:0,debt:0,inc:0,exp:0};
      const wallet=shared?S.house:S;
      const reserve=choice.en.affordableCashAfterReserve!=null?annualCashReserve(S):0;
      const threshold=cost*pm*S.priceIndex+reserve;
      wallet.cash=threshold-1;
      if(ok(choice.en,S,tags(S)))throw Error(id+' accepts insufficient funds');
      wallet.cash=threshold;
      if(!ok(choice.en,S,tags(S)))throw Error(id+' rejects sufficient funds');
      for(const outcome of choice.o) {
        const effect=outcome[2];
        if(typeof effect.cash!=='number')continue;
        if(effect.pm!==1)throw Error(id+' lacks regional scaling');
        wallet.cash=threshold;wallet.debt=0;
        // Exercise the real effect dispatcher and household wallet selection.
        ap({cash:effect.cash,pm:effect.pm});
        const expected=threshold+effect.cash*pm*S.priceIndex;
        if(Math.abs(wallet.cash-expected)>0.001||wallet.debt)throw Error(id+' charged a different price');
        checked++;
      }
    }
  }
  // Catalog synchronization has its own generator check in CI; this fixture isolates wallet-gate behavior from unrelated catalog findings.
  HL=1;born({seed:871200,by:1077,region:'ヴィクトリア'});
  S.siblings=[];
  const hasSibling=()=>ok({need:['存命のきょうだいがいる']},S,tags(S));
  if(hasSibling())throw Error('missing sibling tagged alive');
  S.siblings=[{id:'cost-audit-sibling',by:1076,r:S.r,d:null}];
  if(!hasSibling())throw Error('living sibling not tagged');
  S.siblings[0].d=1077;
  if(hasSibling())throw Error('dead sibling tagged alive');
  return checked;
})()`,context);
assert.equal(costAudit,44);

  console.log(JSON.stringify({ passed: true, deterministic: true, isolatedStateRestore: true, cancellation: true, eventRows: result.first.eventCoverage.length, branchRows: result.first.choiceBranches.length, cohorts: result.first.cohorts.length }));
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
