'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');

const {ctx} = context(path.resolve(__dirname, '..'));
const regions = JSON.parse(vm.runInContext(
  'JSON.stringify(Object.keys(EDUCATION_REGIONAL_PRESENCE))', ctx));
assert.equal(regions.length, 19);

const run = () => JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  const input=P19_S04_INPUT, s=S;
  s.age=20;s.year=s.by+s.age;s.mo=12;
  s.res=REG.find(x=>x.n===input.region);
  s.home='固定集落';
  s.local={kind:'固定都市の街区',city:null,
    placeId:'p19-s04-fixed:'+input.region,
    districtId:'p19-s04-district:'+input.region,
    access:0.8,hazard:0.1};
  s.educationPath={status:'outside',equivalency:['upper']};
  s.study=null;s.fl.sch=0;
  s.cash=input.rich?100000000:0;
  s.house.cash=0;
  s.k=55;
  if(s.socialLearning)s.socialLearning.literacy=75;
  ensureResidenceIdentity(s);
  const area=ensureEducationWorldForResidence(s);
  const world=s.world.educationWorld;
  const beforeLocation=JSON.stringify(world.generationDecisions);
  const beforeRng=s.rngState;
  const beforeCash=s.cash,beforeHouse=s.house.cash;
  const localOfferings=institutionOfferings(s,area,'vocational');
  const tier=localOfferings[0]?.admissionTier||1;
  const began=educationCaseAction(s,'case:begin:higher-path:vocational:'+tier);
  const item=educationActiveCase(s);
  const initial=educationObservationCaseBridgeRows(s,{
    year:s.year,month:s.mo,caseIds:[item.id]})[0];
  const localIds=educationCaseCandidates(s).map(x=>x.offeringId);
  if(!localIds.length)educationCaseAction(s,'case:search-adjacent');
  const candidates=educationCaseCandidates(s);
  const candidate=candidates[0]||null;
  const preflight=candidate?educationCasePreflight(s,candidate):null;
  const tuition=candidate?educationFunds(s,'vocational',tier,candidate.offeringId):null;
  const examFee=tuition===null?null:Math.round(tuition*0.06);
  const payment=examFee===null?null:educationPaymentPlan(s,examFee);
  const noChargesFromInquiry=s.cash===beforeCash&&s.house.cash===beforeHouse;
  const knownBeforeChoice=educationObservationCaseBridgeRows(s,{
    year:s.year,month:s.mo,caseIds:[item.id]})[0];
  let selected=false,declined=false,nonformalChoice=false;
  if(input.rich&&candidate&&preflight.allowed){
    selected=educationCaseAction(s,'case:select:0');
    if(educationActiveCase(s)?.phase==='contract')
      declined=educationCaseAction(s,'case:decline-offer');
  }else nonformalChoice=educationCaseAction(s,'case:nonformal');
  const resolved=s.educationCases.items[item.id];
  const originalAwards=s.educationRecord.awards.length;
  const originalEnrollments=s.educationRecord.enrollments.length;
  const path=educationOpenLearningPath(s,{
    modeId:'self-directed',providerId:'self',
    siteRef:{region:input.region,areaId:area,attendanceMode:'self'},
    subjectIds:['academic_knowledge'],
    sourceEventId:'p19-s04-self-study:'+input.region+':'+input.seed
  });
  const attendance=educationRecordLearningParticipation(s,{
    pathId:path.pathId,year:s.year,month:s.mo,
    attendedSessions:3,totalSessions:4,
    evidenceRef:'p19-s04-study-evidence:'+input.region+':'+input.seed
  });
  const repeated=educationRecordLearningParticipation(s,{
    pathId:path.pathId,year:s.year,month:s.mo,
    attendedSessions:3,totalSessions:4,
    evidenceRef:'p19-s04-study-evidence:'+input.region+':'+input.seed
  })===attendance;
  const bridge=educationObservationCaseBridgeRows(s,{
    year:s.year,month:s.mo,caseIds:[item.id]})[0];
  const beforeRead=JSON.stringify(s),rng=s.rngState;
  const observed=educationObservationRows(s,{
    year:s.year,month:s.mo,caseIds:[item.id],
    siteFrame:[],openFrame:[],applicationIds:item.applicationId?[item.applicationId]:[],
    enrollmentIds:[]});
  const repeatedObservation=educationObservationRows(s,{
    year:s.year,month:s.mo,caseIds:[item.id],
    siteFrame:[],openFrame:[],applicationIds:item.applicationId?[item.applicationId]:[],
    enrollmentIds:[]});
  return {
    region:input.region,seed:input.seed,rich:input.rich,area,
    worldSeed:world.worldSeed,schoolDecision:beforeLocation,
    localIds,knownIds:candidates.map(x=>x.offeringId),
    began,firstKnown:initial.N_known,nowKnown:knownBeforeChoice.N_known,
    selected,declined,nonformalChoice,reason:resolved.reason,
    resolved:resolved.status==='resolved'&&educationActiveCase(s)===null,
    tuition,examFee,payment:payment?.allowed??null,
    preflight:preflight?.allowed??null,
    noChargesFromInquiry,
    applicationId:item.applicationId,
    notices:Object.keys(s.educationAccess?.notices||{}).length,
    examReceipts:Object.values(s.educationFinance?.receipts||{}).filter(r=>
      s.educationFinance.invoices[r.invoiceId]?.kind==='entrance-exam').length,
    tuitionReceipts:Object.values(s.educationFinance?.receipts||{}).filter(r=>
      s.educationFinance.invoices[r.invoiceId]?.kind==='tuition').length,
    noAutomaticCredential:s.educationRecord.awards.length===originalAwards,
    noAutomaticEnrollment:s.educationRecord.enrollments.length===originalEnrollments,
    learningRecorded:attendance.evidenceIds.length===1&&path.participation.length===1,
    repeated,nonformalGain:bridge.N_nonformal_gain,
    observedCount:Object.keys(observed).length,
    readOnly:beforeRead===JSON.stringify(s)&&rng===s.rngState &&
      JSON.stringify(observed)===JSON.stringify(repeatedObservation),
    schoolRngPure:beforeRng===s.rngState,
    learningIssues:educationNonformalInvariants(s),
    caseHistory:s.educationCases.history.filter(x=>x.id===item.id).length
  };
})())`,ctx,{timeout:20000}));

const rows = [];
for (let regionIndex=0;regionIndex<regions.length;regionIndex++) {
  const region=regions[regionIndex];
  for (const worldIndex of [0,1]) {
    const seed=2026110400+regionIndex*2+worldIndex;
    for (const rich of [false,true]) {
      setup(ctx,{id:'p19-s04',seed,region,age:20});
      ctx.P19_S04_INPUT={region,seed,rich};
      const row=run();
      const scope=region+' / seed '+seed+' / '+(rich?'rich':'poor');
      assert.equal(row.began,true,scope);
      assert.equal(row.resolved,true,scope);
      assert.equal(row.caseHistory,1,scope);
      assert.equal(row.noChargesFromInquiry,true,scope);
      assert.equal(row.schoolRngPure,true,scope);
      assert.equal(row.noAutomaticCredential,true,scope);
      assert.equal(row.noAutomaticEnrollment,true,scope);
      assert.equal(row.learningRecorded,true,scope);
      assert.equal(row.repeated,true,scope);
      assert.equal(row.nonformalGain,true,scope);
      assert.equal(row.observedCount,7,scope);
      assert.equal(row.readOnly,true,scope);
      assert.deepEqual(row.learningIssues,[],scope);
      assert.equal(row.tuitionReceipts,0,scope);
      if (row.localIds.length===0)assert.notEqual(row.firstKnown,true,scope);
      if (row.tuition!==null) {
        assert(row.tuition>0,scope);
        assert(row.examFee>0,scope);
        assert.equal(row.payment,rich,scope);
      }
      if (row.selected) {
        assert.equal(rich,true,scope);
        assert.equal(row.preflight,true,scope);
        assert.equal(row.examReceipts,1,scope);
        assert.equal(row.notices,1,scope);
        assert.equal(row.applicationId!==null,true,scope);
      } else {
        assert.equal(row.nonformalChoice,true,scope);
        assert.equal(row.examReceipts,0,scope);
      }
      rows.push(row);
    }
    const poor=rows.at(-2),richRow=rows.at(-1);
    assert.equal(poor.rich,false);
    assert.equal(richRow.rich,true);
    assert.equal(poor.area,richRow.area,'wealth must not move the education area');
    assert.equal(poor.worldSeed,richRow.worldSeed,'wealth must not change world seed');
    assert.equal(poor.schoolDecision,richRow.schoolDecision,
      'wealth must not regenerate the schools');
    assert.deepEqual(poor.localIds,richRow.localIds,
      'wealth must not change the discovered local offerings');
    assert.deepEqual(poor.knownIds,richRow.knownIds,
      'wealth must not change the same fixed-seed search results');
  }
}
assert.equal(rows.length,76);
assert.equal(new Set(rows.map(x=>x.region)).size,19);
assert.equal(rows.filter(x=>!x.rich).length,38);
assert.equal(rows.filter(x=>x.rich).length,38);
assert(rows.some(x=>x.localIds.length===0),
  'the fixture must exercise the local school-absence path');
assert(rows.some(x=>x.localIds.length>0),
  'the fixture must exercise the local school-presence path');
assert(rows.some(x=>x.selected),
  'the fixture must reach the real application and examination path');
console.log('PASS P19 S04: 76 regional household/seed local transitions, school access and nonformal evidence');
