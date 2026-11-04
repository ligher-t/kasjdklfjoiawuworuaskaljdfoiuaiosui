'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');

const fixtures = [
  ['R01','炎国','小規模な定住地','upper',25,15,1094],
  ['R02','龍門','移動都市の避難・労働区画','primary',84,7,1094],
  ['R03','ヴィクトリア','移動都市の居住区','university',59,19,1093],
  ['R04','ウルサス','工業・採掘地域','lower',74,13,1096],
  ['R05','ラテラーノ','固定都市の街区','upper',90,16,1094],
  ['R06','カジミエーシュ','移動都市の居住区','vocational',69,17,1094],
  ['R07','クルビア','移動都市の周縁区','university',43,18,1095],
  ['R08','極東','小規模な定住地','arts',0,16,1093],
  ['R09','イベリア','工業・採掘地域','primary',78,9,1094],
  ['R10','シラクーザ','固定都市の街区','lower',83,13,1095],
  ['R11','サルゴン','小規模な定住地','upper',0,15,1095],
  ['R12','カズデル','辺境・移動の多い居住地','primary',0,8,1093],
  ['R13','サーミ','辺境・移動の多い居住地','primary',0,9,1093],
  ['R14','リターニア','固定都市の街区','arts',83,18,1094],
  ['R15','イェラグ','小規模な定住地','university',0,18,1095],
  ['R16','レム・ビリトン','工業・採掘地域','vocational',85,16,1094],
  ['R17','ボリバル','小規模な定住地','primary',50,10,1096],
  ['R18','シエスタ','固定都市の街区','upper',67,16,1097],
  ['R19','ミノス','固定都市の街区','university',29,18,1095]
];
const nonformal = {
  R08:['dojo-or-guild','craft'],
  R12:['home-literacy','basic_literacy'],
  R13:['clan-tradition','terrain'],
  R15:['workshop-apprenticeship','manufacturing'],
  R19:['religious-community','literacy']
};
const {ctx} = context(path.resolve(__dirname,'..'));
const run = fn => JSON.parse(vm.runInContext(
  'JSON.stringify(('+fn.toString()+')())',ctx,{timeout:20000}));

assert.equal(fixtures.length,19);
assert.equal(new Set(fixtures.map(x=>x[1])).size,19);
for (let i=0;i<fixtures.length;i++) {
  const [id,region,kind,stage,expectedRate,age,year] = fixtures[i];
  setup(ctx,{id:'p15-'+id,region,seed:151500+i,age});
  ctx.P15_FIXTURE = {id,region,kind,stage,age,year,nonformal:nonformal[id]||null};
  const result = run(function() {
    const x=P15_FIXTURE,s=S;
    s.year=x.year;s.by=x.year-x.age;s.age=x.age;s.mo=4;
    s.res=REG.find(r=>r.n===x.region);
    s.home=x.kind.startsWith('移動都市')?'移動都市':'固定集落';
    s.local={city:null,kind:x.kind,placeId:'p15:'+x.id,
      districtId:'p15-district:'+x.id,access:0.8,hazard:0.1};
    s.study=null;s.educationPath=null;s.fl.sch=0;s.cash=10000000;
    ensureResidenceIdentity(s);
    const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld;
    const rates=educationPresenceRates(x.region,x.kind),rate=rates[x.stage];
    const local=institutionOfferings(s,area,x.stage);
    const initial=JSON.stringify(w.generationDecisions);
    const rng=s.rngState,originalCash=s.cash,houseCash=s.house.cash;
    const kind=x.stage==='primary'?'primary':
      x.stage==='lower'?'lower-path':
      x.stage==='upper'?'upper-path':'higher-path';
    const tier=local[0]?.admissionTier||1;
    const began=educationCaseAction(s,
      'case:begin:'+kind+':'+x.stage+':'+tier);
    const item=educationActiveCase(s);
    const known=educationCaseCandidates(s);
    const presentation=educationCasePresentation(s);
    const noFees=s.cash===originalCash&&s.house.cash===houseCash;
    const noApplications=Object.keys(s.educationAccess?.notices||{}).length===0;
    const noEnrollments=(s.educationRecord?.enrollments||[]).length===0;
    const noAwards=(s.educationRecord?.awards||[]).length===0;
    const noRandomDraws=s.rngState===rng;
    const generatedBeforeSearch=initial===JSON.stringify(w.generationDecisions);
    const resolved=educationCaseAction(s,'case:nonformal');
    let learned=null;
    if(x.nonformal){
      const [modeId,subject]=x.nonformal;
      const providerId='p15-provider:'+x.id;
      educationRegisterInformalProvider(s,{
        providerId,personId:'mentor:'+x.id,kind:modeId,areaId:area,
        subjectIds:[subject],activeFrom:{year:x.year,month:1},
        evidenceRef:'observed-teacher:'+x.id
      });
      const path=educationOpenLearningPath(s,{
        modeId,providerId,siteRef:{region:x.region,areaId:area,
          attendanceMode:'in-person'},subjectIds:[subject],
        sourceEventId:'p15-practice:'+x.id
      });
      educationRecordLearningParticipation(s,{
        pathId:path.pathId,year:x.year,month:4,
        attendedSessions:2,totalSessions:4,
        evidenceRef:'p15-session:'+x.id
      });
      learned={modeId,subject,count:path.participation.length,
        noCredentials:s.educationRecord.awards.length===0,
        issues:educationNonformalInvariants(s)};
    }
    return {rate,area,offeringCount:local.length,
      localIds:local.map(o=>o.id),knownIds:known.map(o=>o.offeringId),
      began,resolved,reason:item.reason,active:!!educationActiveCase(s),
      noFees,noApplications,noEnrollments,noAwards,noRandomDraws,
      generatedBeforeSearch,presentation,
      learned,caseHistory:s.educationCases.history.filter(h=>h.id===item.id).length};
  });
  const prefix='P15-'+id+' '+region;
  assert.equal(result.rate,expectedRate,prefix+' site probability');
  assert.equal(result.began,true,prefix);
  assert.equal(result.resolved,true,prefix);
  assert.equal(result.reason,'nonformal-choice',prefix);
  assert.equal(result.active,false,prefix);
  assert.equal(result.caseHistory,1,prefix);
  assert.equal(result.noFees,true,prefix);
  assert.equal(result.noApplications,true,prefix);
  assert.equal(result.noEnrollments,true,prefix);
  assert.equal(result.noAwards,true,prefix);
  assert.equal(result.noRandomDraws,true,prefix);
  assert.equal(result.generatedBeforeSearch,true,prefix);
  assert.deepEqual(result.localIds.slice().sort(),result.knownIds.slice().sort(),
    prefix+' inquiry must reveal exactly the local offering IDs');
  if(expectedRate===0) assert.equal(result.offeringCount,0,
    prefix+' cannot have a stage offering in the zero-probability area');
  assert(!result.presentation.includes('edu-inst:v1:'),
    prefix+' private school ID must not be printed');
  if(nonformal[id]) {
    assert.equal(result.learned.modeId,nonformal[id][0],prefix);
    assert.equal(result.learned.count,1,prefix);
    assert.equal(result.learned.noCredentials,true,prefix);
    assert.deepEqual(result.learned.issues,[],prefix);
  }
}
console.log('PASS P15 R01-R19: 19 regional representative site/intent snapshots and five evidence-backed learning routes');
