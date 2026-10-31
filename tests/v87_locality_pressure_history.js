'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const document={currentScript:null,getElementById(){return {hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const context={window:{},document,console,localStorage:{getItem(){return null},setItem(){}},Date,setTimeout(){},setInterval(){}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),context,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],context,{timeout:15000});
const data=context.window.GAME_DATA,event=id=>data.EV.find(row=>row.id===id);
const localityShocks=Object.fromEntries(data.LOCALITY_MODEL.shocks.map(shock=>[shock.id,shock]));
for(const id of ['chernobog-direct','chernobog-indirect','lungmen-indirect'])
 assert.equal(localityShocks[id]?.fromMonth,12,id+' uses the December event boundary');
for(const id of ['londinium-direct','victoria-indirect'])
 assert.equal(localityShocks[id]?.fromMonth,7,id+' uses the July crisis boundary');
const expected={
 local_food_shortage:{intents:['information','self-or-family-care','voluntary-aid'],actions:[['food','information'],['food','budget'],['food','aid']]},
 local_medical_capacity:{intents:['information','voluntary-aid','self-or-family-care'],actions:[['medical','information'],['medical','aid'],['medical','rest']]},
 local_jobs_pressure:{intents:['information','self-or-family-care','information'],actions:[['jobs','information'],['jobs','stay'],['jobs','network']]},
 local_housing_pressure:{intents:['information','voluntary-aid','self-or-family-care'],actions:[['housing','information'],['housing','aid'],['housing','stay']]},
 local_transport_pressure:{intents:['information','voluntary-aid','self-or-family-care'],actions:[['transport','information'],['transport','aid'],['transport','defer']]},
 local_recovery_choices:{intents:['voluntary-aid','information','self-or-family-care'],actions:[['recovery','aid'],['recovery','information'],['recovery','self']]},
 local_support_followup:{intents:['information','neutral'],actions:[['social','followup'],['social','brief']]},
 local_medical_followup:{intents:['information','defer'],actions:[['medical','followup'],['medical','defer']]}
};
const baseMetrics={food:.5,jobs:.5,housing:.5,medical:.5,transport:.5};
for(const [id,spec] of Object.entries(expected)){
 const row=event(id);assert(row,id+' event exists');assert.equal(row.c.length,spec.intents.length,id+' choice count');
 assert(row.references?.includes('SRC_LOCALITY_GAME'),id+' labels modeled conditions and effects as game assumptions');
 assert(row.c.every(choice=>choice.ethics?.reviewed&&choice.ethics.policyVersion===87),id+' every choice receives current semantic review');
 for(const [index,choice] of row.c.entries()){
  const result=choice.o[0][2],action=result.localityAction;
  assert.equal(choice.ethics.intent,spec.intents[index],id+'@'+index+' intent classification');
  assert.equal(choice.o.length,1,id+'@'+index+' outcome does not imply an unmodeled success roll');
  assert(action,id+'@'+index+' records the specific local action');
  assert.deepEqual([action.kind,action.action],spec.actions[index],id+'@'+index+' records the expected action');
  assert(!result.regionalImpact,id+'@'+index+' does not infer a region-wide result');
  const city='記録確認用の仮想生活圏',home='移動都市',kind='仮想区画',key=`炎国|${city}|${home}|${kind}`;
  const state={year:1100,age:35,home,res:{n:'炎国'},local:{city,kind},world:{events:{},localityArchive:{}},community:{version:1,key,region:'炎国',city,district:kind,metrics:{...baseMetrics},lastYear:1100,history:[],actions:[]}};
  context.ensureResidenceIdentity(state);context.__state=state;
  state.community.key=vm.runInNewContext('localityKey(__state)',context);
  context.applyLocalityAction(state,action);
  assert.equal(state.community.actions.length,1,id+'@'+index+' enters the current locality history');
  assert.equal(state.community.actions[0].kind,action.kind);assert.equal(state.community.actions[0].action,action.action);
  assert.deepEqual({...state.community.metrics},baseMetrics,id+'@'+index+' leaves shared service capacity unchanged');
 }
}
assert.deepEqual(Array.from(event('local_support_followup').need),['地域で誰かを手伝った'],'food follow-up requires a recorded assistance action');
assert.equal(event('local_support_followup').after.id,'local_food_shortage','food follow-up stays anchored to prior supply-pressure events');
assert.deepEqual(Array.from(event('local_medical_followup').need),['地域の医療相談を調べた'],'medical follow-up requires prior service information');
assert.equal(event('local_medical_followup').after.id,'local_medical_capacity','medical follow-up stays anchored to prior care-pressure events');
const localityShockReplay = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  HL = 1; rd = () => {}; STAT.ev = {}; STAT.op = {}; STAT.currentLife = -1; STAT.choiceMonths = new Set();
  PARAM['local.interruptionShare'] = 0;
  const configure = (year, region, city, seed) => {
    born({seed, by: 1070, region});
    S.year = year; S.age = year - S.by; S.mo = 0;
    S.res = REG.find(row => row.n === region); S.home = '移動都市';
    S.local = {kind:'移動都市の居住区',city,ecology:SIM_TABLES.environments[region]?.[0]?.n || '未特定',mixedNeighborhood:false,access:0.55,hazard:0.5,info:0.5};
    S.community = null; S.world = {events:{},localityArchive:{}};
    return S;
  };
  const metrics = state => Object.fromEntries(Object.entries(state.community.metrics).map(([key,value])=>[key,Number(value.toFixed(9))]));
  const chernobog = configure(1096, 'ウルサス', 'チェルノボーグ', 876096);
  ensureLocalityState(chernobog);
  chernobog.year = 1097; chernobog.age++; chernobog.mo = 0;
  ensureLocalityState(chernobog);
  const chernobogStayed = metrics(chernobog);
  const chernobogArrival = configure(1097, 'ウルサス', 'チェルノボーグ', 876097);
  ensureLocalityState(chernobogArrival);
  const londinium = configure(1098, 'ヴィクトリア', 'ロンディニウム', 876098);
  ensureLocalityState(londinium);
  londinium.mo = 7; ensureLocalityState(londinium);
  for (let year = 1099; year <= 1101; year++) {
    londinium.year = year; londinium.age++; londinium.mo = 0;
    ensureLocalityState(londinium);
  }
  const londiniumStayed = metrics(londinium);
  const londiniumArrival = configure(1101, 'ヴィクトリア', 'ロンディニウム', 876101);
  ensureLocalityState(londiniumArrival);
  const siesta = configure(1097, 'シエスタ', null, 8761097);
  siesta.home = '固定集落';
  siesta.local = {kind:'小規模な定住地',city:null,ecology:SIM_TABLES.environments['シエスタ']?.[0]?.n || '未特定',mixedNeighborhood:false,access:0.55,hazard:0.5,info:0.5};
  siesta.community = null;
  ensureLocalityState(siesta);
  const siestaBeforeTransitionYear = metrics(siesta),
    siestaShockAbsentBeforeFirstFullYear = !siesta.community.history.some(row => row.types?.includes('siesta-transition'));
  siesta.year = 1098; siesta.age++; siesta.mo = 0;
  ensureLocalityState(siesta);
  const siestaAfterTransitionYear = metrics(siesta),
    siestaShockAppliedInFirstFullYear = siesta.community.history.some(row => row.types?.includes('siesta-transition'));
  return {
    chernobogStayed, chernobogArrival:metrics(chernobogArrival),
    chernobogContext:chernobogArrival.community.historicalShockContext,
    londiniumStayed, londiniumArrival:metrics(londiniumArrival),
    londiniumContext:londiniumArrival.community.historicalShockContext,
    siestaBeforeTransitionYear, siestaAfterTransitionYear, siestaShockAbsentBeforeFirstFullYear, siestaShockAppliedInFirstFullYear,
    noPersonalIncident:!londiniumArrival.community.history.some(row=>row.types?.includes('londinium-direct')),
    audits:[chernobogArrival,londiniumArrival,siesta].map(state=>auditLifeState(state))
  };
})()`,context)));
assert.deepEqual(localityShockReplay.chernobogArrival,localityShockReplay.chernobogStayed,'late arrival in Chernobog inherits the same residual city conditions as continuous residence');
assert(localityShockReplay.chernobogContext?.applied.includes('chernobog-direct'),'the restored shock context records its modeled source');
assert.deepEqual(localityShockReplay.londiniumArrival,localityShockReplay.londiniumStayed,'late arrival after the London battle window inherits the recovering local conditions');
assert(localityShockReplay.londiniumContext?.applied.includes('londinium-direct'),'the London historical context is persisted separately from personal incident history');
assert(localityShockReplay.siestaShockAbsentBeforeFirstFullYear,'Siesta does not receive the relocation shock at the start of 1097 before summer activity begins');
assert(localityShockReplay.siestaShockAppliedInFirstFullYear,'the Siesta transition shock begins in the first full-year approximation, 1098');
assert(localityShockReplay.siestaAfterTransitionYear.food < localityShockReplay.siestaBeforeTransitionYear.food,
  'the Siesta regional food indicator reflects the transition after its dated start');
assert(localityShockReplay.noPersonalIncident,'reconstructing regional conditions does not fabricate a personal incident entry');
assert(localityShockReplay.audits.every(errors=>errors.length===0),`reconstructed locality audit failures: ${JSON.stringify(localityShockReplay.audits)}`);

const datedLocalityShockReplay = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  PARAM['local.interruptionShare'] = 0;
  const make = (year, month, region, city, seed, existingCommunity = false) => {
    const state = (() => {
      born({seed, by:1070, region});
      S.year = year; S.age = year - S.by; S.mo = month;
      S.res = REG.find(row => row.n === region); S.home = '移動都市';
      S.local = {kind:'移動都市の居住区',city,ecology:SIM_TABLES.environments[region]?.[0]?.n || '未特定',mixedNeighborhood:false,access:0.55,hazard:0.5,info:0.5};
      S.world = {events:{},localityArchive:{}};
      S.community = existingCommunity ? {
        version:1,key:localityKey(S),region,city,district:S.local.kind,
        metrics:localityBaseline(S),lastYear:year,history:[],actions:[]
      } : null;
      return S;
    })();
    return state;
  };
  const has = (state,id) => state.community.historicalShockContext?.applied.includes(id) || false;
  const cBefore = make(1096, 1, 'ウルサス', 'チェルノボーグ', 877096);
  ensureLocalityState(cBefore); const cJanuary = {...cBefore.community.metrics};
  cBefore.mo=11; ensureLocalityState(cBefore); const cNovember = {...cBefore.community.metrics};
  const cNotEarly = !has(cBefore,'chernobog-direct');
  cBefore.mo=12; ensureLocalityState(cBefore); const cDecember = {...cBefore.community.metrics};
  const cOpened = has(cBefore,'chernobog-direct');
  cBefore.year=1097; cBefore.age++; cBefore.mo=0; ensureLocalityState(cBefore);
  const cSavedBeforeBoundary = make(1096, 11, 'ウルサス', 'チェルノボーグ', 877097, true);
  ensureLocalityState(cSavedBeforeBoundary); const savedBeforeBoundary = !has(cSavedBeforeBoundary,'chernobog-direct');
  cSavedBeforeBoundary.mo=12; ensureLocalityState(cSavedBeforeBoundary); const savedAtBoundary = has(cSavedBeforeBoundary,'chernobog-direct');
  const repeatedApply = make(1096, 12, 'ウルサス', 'チェルノボーグ', 877098, true);
  ensureLocalityState(repeatedApply);
  const once = JSON.stringify(repeatedApply.community.metrics);
  ensureLocalityState(repeatedApply);
  const noDoubleApply = JSON.stringify(repeatedApply.community.metrics) === once;
  const missingContext = JSON.parse(JSON.stringify(repeatedApply));
  delete missingContext.community.historicalShockContext;
  const missingContextRejected = auditLifeState(missingContext).some(row => row.includes('過去圧力履歴と適用記録が不一致'));
  const cLate = make(1097, 1, 'ウルサス', 'チェルノボーグ', 877099);
  ensureLocalityState(cLate);
  const lateArrivalMatchesBoundary = Object.keys(cBefore.community.metrics).every(key =>
    Math.abs(cLate.community.metrics[key] - cBefore.community.metrics[key]) < 1e-9
  );
  const lBefore = make(1098, 1, 'ヴィクトリア', 'ロンディニウム', 877098);
  ensureLocalityState(lBefore); const lJanuary = {...lBefore.community.metrics};
  lBefore.mo=6; ensureLocalityState(lBefore); const lJune = {...lBefore.community.metrics};
  const lNotEarly = !has(lBefore,'londinium-direct');
  lBefore.mo=7; ensureLocalityState(lBefore); const lJuly = {...lBefore.community.metrics};
  const lOpened = has(lBefore,'londinium-direct');
  const lSlotStart = make(1098, 0, 'ヴィクトリア', 'ロンディニウム', 877100);
  ensureLocalityState(lSlotStart); slot(0.5);
  const slotSynchronizesMonth = lSlotStart.mo===7 && has(lSlotStart,'londinium-direct');
  return {
    cJanuary,cNovember,cDecember,cNotEarly,cOpened,savedBeforeBoundary,savedAtBoundary,
    noDoubleApply,missingContextRejected,lateArrivalMatchesBoundary,
    lJanuary,lJune,lJuly,lNotEarly,lOpened,slotSynchronizesMonth
  };
})()`,context)));
assert(datedLocalityShockReplay.cNotEarly && datedLocalityShockReplay.savedBeforeBoundary,
  'December 1096 Chernobog shocks do not affect new or current saved locality states before the event month');
assert(datedLocalityShockReplay.cOpened && datedLocalityShockReplay.savedAtBoundary,
  'the Chernobog city shock is applied when December begins');
assert.deepEqual(datedLocalityShockReplay.cJanuary,datedLocalityShockReplay.cNovember,
  'the Chernobog locality remains stable through January to November before the incident');
assert(datedLocalityShockReplay.cDecember.food < datedLocalityShockReplay.cNovember.food,
  'the December event causes the modeled local supply shock');
assert(datedLocalityShockReplay.noDoubleApply,'a current locality shock is applied only once across repeated monthly synchronization');
assert(datedLocalityShockReplay.missingContextRejected,'a saved locality history cannot contain a historical shock without its current application record');
assert(datedLocalityShockReplay.lateArrivalMatchesBoundary,
  'a new January 1097 resident receives the same recovered Chernobog conditions as an existing resident');
assert(datedLocalityShockReplay.lNotEarly && datedLocalityShockReplay.lOpened,
  'Londinium locality pressure begins in July 1098, not January');
assert(datedLocalityShockReplay.slotSynchronizesMonth,
  'the monthly event slot synchronizes locality pressure before event eligibility is evaluated');
assert.deepEqual(datedLocalityShockReplay.lJanuary,datedLocalityShockReplay.lJune,
  'the Londinium locality remains stable through January to June before the city crisis');
assert(datedLocalityShockReplay.lJuly.food < datedLocalityShockReplay.lJune.food,
  'the July crisis causes the modeled Londinium locality shock');

const annualPressureWindow = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  const stateFor = (region, year, month) => {
    born({seed:878092,by:1080,region});
    S.year=year; S.age=year-S.by; S.mo=month;
    S.res=REG.find(row=>row.n===region);
    S.local={city:null,kind:'移動都市の居住区',access:0.5,hazard:0.5,info:0.5};
    S.world={events:{},localityArchive:{}};
    return S;
  };
  const firstYearAnnual=stateFor('カズデル',1092,0),
    annualWithoutPublishedFlag=worldPressure(firstYearAnnual,'war'),
    firstMonthlyWithoutFlag=stateFor('カズデル',1092,1),
    monthlyWithoutFlag=worldPressure(firstMonthlyWithoutFlag,'war');
  firstMonthlyWithoutFlag.world.events.kazdel_civil_war=1092;
  const monthlyAfterFlag=worldPressure(firstMonthlyWithoutFlag,'war');
  const beforeWindow=stateFor('カズデル',1091,0),
    afterWindow=stateFor('カズデル',1095,0),
    unrelatedRegion=stateFor('ヴィクトリア',1092,0);
  return {
    annualWithoutPublishedFlag,
    monthlyWithoutFlag,
    monthlyAfterFlag,
    beforeWindow:worldPressure(beforeWindow,'war'),
    afterWindow:worldPressure(afterWindow,'war'),
    unrelatedRegion:worldPressure(unrelatedRegion,'war')
  };
})()`,context)));
assert.equal(annualPressureWindow.annualWithoutPublishedFlag,1.55,
  'year-precision Kazdel pressure participates in first-year annual health/mortality before hist() publishes the flag');
assert.equal(annualPressureWindow.monthlyWithoutFlag,1,
  'monthly event pressure remains closed until the historical flag is active');
assert.equal(annualPressureWindow.monthlyAfterFlag,1.55,
  'monthly pressure becomes available after its historical flag is active');
assert.equal(annualPressureWindow.beforeWindow,1,'annual pressure stays inactive before its configured year window');
assert.equal(annualPressureWindow.afterWindow,1,'annual pressure stays inactive after its configured year window');
assert.equal(annualPressureWindow.unrelatedRegion,1,'annual pressure does not spill into unrelated regions');
console.log(JSON.stringify({passed:true,reviewedEvents:Object.keys(expected).length,reviewedChoices:Object.values(expected).reduce((n,x)=>n+x.intents.length,0),localActionPersistence:true,sharedMetricsUnchanged:true,followupsRequireRelevantHistory:true,historicalShockTiming:true,datedShockBoundaries:true,lateResidenceRecovery:true,currentLocalityStateAudit:true,siestaTransitionBoundary:true,noPersonalIncidentReconstruction:true,annualHistoricalPressureBoundary:true},null,2));
