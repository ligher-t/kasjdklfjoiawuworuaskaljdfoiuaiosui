'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const read=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx,{timeout:15000}));
const districtKinds=['小規模な定住地','移動都市の避難・労働区画','移動都市の居住区','工業・採掘地域',
  '固定都市の街区','移動都市の居住区','移動都市の周縁区','小規模な定住地','工業・採掘地域',
  '固定都市の街区','小規模な定住地','辺境・移動の多い居住地','辺境・移動の多い居住地',
  '固定都市の街区','小規模な定住地','工業・採掘地域','小規模な定住地','固定都市の街区','固定都市の街区'];
const fixtures=[
 ['R01','炎国','upper',1094,15],['R02','龍門','primary',1094,7],
 ['R03','ヴィクトリア','university',1093,19],['R04','ウルサス','lower',1096,13],
 ['R05','ラテラーノ','upper',1094,16],['R06','カジミエーシュ','vocational',1094,17],
 ['R07','クルビア','university',1095,18],['R08','極東','arts',1093,16],
 ['R09','イベリア','primary',1094,9],['R10','シラクーザ','lower',1095,13],
 ['R11','サルゴン','upper',1095,15],['R12','カズデル','primary',1093,8],
 ['R13','サーミ','primary',1093,9],['R14','リターニア','arts',1095,18],
 ['R15','イェラグ','university',1095,18],['R16','レム・ビリトン','vocational',1094,16],
 ['R17','ボリバル','primary',1050,10],['R18','シエスタ','upper',1097,16],
 ['R19','ミノス','university',1093,18]
];
vm.runInContext(`
function p15School(key,stage=RF.stage,area=RF.area){
  const school=educationRegisterInstitution(RF.w,area,key,'scenario-school',[stage],S.year),
    off=RF.w.offerings[school.offeringIds[0]];off.admissionTier=1;return off;
}
function p15Install(off){
  S.mo=0;educationStart(S,off.stage,1,'signed:'+RF.id);
  Object.assign(S.educationPath,{institutionId:off.institutionId,campusId:off.campusId,offeringId:off.id});
  const id=S.educationRecord.enrollments.at(-1).id;educationBindFormalEnrollment(S,id);
  educationEnsureEnrolledSchoolPeople(S,id);
  const inv=educationEnsureTuitionInvoice(S,S.educationPath,S.year);educationSettleInvoice(S,inv);
  educationFinanceProjectInvoice(S,inv);
  educationCreateMobilityState(S);
  if(S.age<18){
    const consent={id:RF.id+':consent',personId:'protagonist',institutionId:off.institutionId,
      purpose:'daily-commute',consenterPersonId:'fa',consentState:'granted',evidenceRef:'signed-parent',
      validFrom:{year:S.year,month:1},validThrough:{year:S.year+2,month:12}};
    S.care.parentKeys=['fa'];S.par.fa.d=0;S.par.fa.separated=false;
    S.educationMobility.consentRecords[consent.id]=consent;
    S.educationMobility.escortRecords[consent.id]={...consent,escortPersonId:'fa',status:'verified'};
  }
  S.mo=1;return id;
}
function p15RecordYear(id,personal=1){
  S.mo=12;for(let month=1;month<=12;month++)educationRecordAttendance(S,{enrollmentId:id,
    placementId:S.educationPlacements.currentPlacementId,year:S.year,month,personalAccess:personal,
    evidenceRef:RF.id+':'+S.year+':'+month});
  return educationSettleCompletedAcademicYear(S,S.year);
}
function p15Move(key,kind='小規模な定住地'){
  const old=S.local;S.local={kind,city:null,placeId:key,educationAreaAnchor:key,districtId:key,access:0.9,hazard:0.02};
  ensureResidenceIdentity(S);const area=ensureEducationWorldForResidence(S);S.local=old;return area;
}
function p15Learn(mode,subject,month=5){
  S.mo=month;const providerId=RF.id+':mentor';
  const p=educationRegisterInformalProvider(S,{providerId,personId:RF.id+':teacher',kind:mode,
    areaId:S.local.educationAreaId,subjectIds:[subject],activeFrom:{year:S.year,month:1},evidenceRef:'witnessed:'+RF.id});
  const learn=educationOpenLearningPath(S,{modeId:mode,providerId:p.id,
    siteRef:{region:S.res.n,areaId:S.local.educationAreaId},subjectIds:[subject],sourceEventId:RF.id});
  educationRecordLearningParticipation(S,{pathId:learn.pathId,year:S.year,month,
    attendedSessions:2,totalSessions:2,evidenceRef:RF.id+':lesson'});return learn;
}
`,ctx);

for(let i=0;i<fixtures.length;i++){
  const [id,region,stage,year,age]=fixtures[i];setup(ctx,{id,region,seed:153000+i,age});
  ctx.REGIONAL={id,region,stage,year,age,kind:districtKinds[i]};
  read(`const f=REGIONAL,s=S;s.year=f.year;s.by=f.year-f.age;s.age=f.age;s.mo=1;
    s.cash=100000000;s.house.cash=10000000;s.study=null;s.educationPath=null;s.fl.sch=0;
    s.educationCases=null;s.educationAccess=null;s.educationDecision=null;s.k=90;s.ar=90;s.socialLearning.literacy=90;
    const kind=f.kind;
    s.local={kind,city:null,placeId:'regional:'+f.id,districtId:f.id,access:0.94,hazard:0.02};
    ensureResidenceIdentity(s);const area=ensureEducationWorldForResidence(s);
    globalThis.RF={...f,area,w:s.world.educationWorld};return true;`);
  let result;
  switch(id){
    case 'R01':
      result=read(`const s=S,far=p15Move('yan-neighbor'),off=p15School('yan-upper','upper',far);
        s.educationPath={version:1,status:'outside',completed:['primary'],history:[]};
        RF.w.areas[RF.area].neighborIds.push(far);
        educationCaseAction(s,'case:begin:upper-path:upper:1');educationCaseDiscover(s,'adjacent');
        const item=educationActiveCase(s);item.evidence.knownCandidateIds=[off.id];s.mo=3;
        const a=educationCasePreflight(s,educationCaseCandidate(s,0));s.mo=4;
        return {eligible:a.allowed,degree:educationHas(s,'upper'),noInvoice:!s.educationFinance?.invoices||
          Object.keys(s.educationFinance.invoices).length===0};`);
      assert.deepEqual(result,{eligible:false,degree:false,noInvoice:true});break;
    case 'R02':
      result=read(`const s=S,off=p15School('lungmen-primary');RF.w.areas[RF.area].localTravelPolicy={
        evidenceRef:'observed-road',minutes:20,riskScore:0.58,accessibility:[]};
        educationCaseAction(s,'case:begin:primary:primary:1');const item=educationActiveCase(s);
        item.evidence.knownCandidateIds=[off.id];s.mo=2;educationCreateMobilityState(s);
        const before=educationCanReach(s,{institutionId:off.institutionId,campusId:off.campusId,offeringId:off.id});
        s.mo=4;p15Install(off);s.mo=4;const after=educationCanReach(s,{institutionId:off.institutionId,campusId:off.campusId,offeringId:off.id});
        educationSimulateAttendanceThrough(s,s.year,4);
        return {before:before.reachable,after:after.reachable,school:RF.w.offerings[off.id].id===off.id,
          monthly:!!s.educationAttendance.enrollments[s.educationPath.currentEnrollmentId][s.year][4]};`);
      assert.deepEqual(result,{before:false,after:true,school:true,monthly:true});break;
    case 'R03':
      result=read(`const s=S,off=p15School('victoria-university');s.mo=3;
        s.educationPath={version:1,status:'outside',completed:['upper'],history:[]};
        educationCaseAction(s,'case:begin:higher-path:university:1');const item=educationActiveCase(s);
        item.evidence.knownCandidateIds=[off.id];s.mo=4;educationCaseAction(s,'case:select:0');
        const result=s.educationAccess.notices[item.applicationId].result;
        s.mo=5;if(result==='accepted')educationCaseAction(s,'case:decline-offer');
        return {result,exam:Object.values(s.educationFinance.invoices).some(x=>x.kind==='entrance-exam'&&x.status==='paid'),
          noUniversity:s.educationRecord.enrollments.length===0,noDegree:s.educationRecord.awards.length===0};`);
      assert.equal(result.exam,true);assert.equal(result.noUniversity,true);assert.equal(result.noDegree,true);break;
    case 'R04':case 'R09':
      result=read(`const s=S,off=p15School(RF.id+'-school'),eid=p15Install(off);s.mo=11;
        educationRecordAttendance(s,{enrollmentId:eid,placementId:s.educationPlacements.currentPlacementId,
          year:s.year,month:11,personalAccess:1,evidenceRef:'prehistory-attendance'});
        s.mo=12;educationReconcileWorldAt(s,s.year,12);const state=educationSchoolStatusAt(s,off.id,s.year,12);
        const credit=p15RecordYear(eid),saved=JSON.stringify(s.educationAttendance.enrollments[eid][s.year]);
        s.year++;s.age++;s.mo=0;educationAdvanceYear(s);
        return {notDestroyed:state.campusStatus!=='destroyed',periods:credit.finalizedMonths,
          evidence:saved===JSON.stringify(s.educationAttendance.enrollments[eid][s.year-1]),
          sameSchool:s.educationPath.offeringId===off.id};`);
      assert.deepEqual(result,{notDestroyed:true,periods:12,evidence:true,sameSchool:true});break;
    case 'R05':
      result=read(`const s=S,off=p15School('laterano-upper');off.requiredDocuments=['residence'];
        s.educationDocuments=[{kind:'residence',personId:'protagonist',status:'verified'}];
        s.legal={status:'unknown'};s.educationPath={version:1,status:'outside',completed:['lower'],history:[]};
        s.mo=2;educationCaseAction(s,'case:begin:upper-path:upper:1');const item=educationActiveCase(s);
        item.evidence.knownCandidateIds=[off.id];s.mo=3;const review=educationCasePreflight(s,educationCaseCandidate(s,0));
        s.mo=9;return {allowed:review.allowed,noCitizenshipRequirement:!off.requiredDocuments.includes('citizenship'),
          noDegree:s.educationRecord.awards.length===0};`);
      assert.deepEqual(result,{allowed:true,noCitizenshipRequirement:true,noDegree:true});break;
    case 'R06':
      result=read(`const s=S,off=p15School('general-vocational');p15Install(off);
        const knights=p15School('knight-training');knights.specializations=['knightly_training'];s.mo=8;
        const allowed=educationLegacySceneGuard(s,'daily_kazimierz_57');s.year++;s.age++;s.mo=0;
        return {allowed,knightAward:s.educationRecord.awards.some(x=>x.offeringId===knights.id),
          actual:s.educationPath.offeringId===off.id};`);
      assert.deepEqual(result,{allowed:false,knightAward:false,actual:true});break;
    case 'R07':
      result=read(`const s=S,far=p15Move('columbia-academic','固定都市の街区'),off=p15School('distant-university','university',far);
        RF.w.areas[RF.area].neighborIds.push(far);const link='exam-road';
        RF.w.transportLinks[link]={id:link,endpointAreaIds:[RF.area,far],travelMinutesAB:110,travelMinutesBA:110,
          transferWaitMinutes:0,riskScore:0.05,directionalAccess:{[RF.area]:true,[far]:true},statusHistory:[]};
        s.educationPath={version:1,status:'outside',completed:['upper'],history:[]};s.mo=2;
        educationCaseAction(s,'case:begin:higher-path:university:1');educationCaseDiscover(s,'adjacent');
        const item=educationActiveCase(s);item.evidence.knownCandidateIds=[off.id];educationCaseAction(s,'case:select:0');
        const application=item.phase==='application',noTuition=Object.values(s.educationFinance.invoices).every(x=>x.kind!=='tuition');
        s.mo=3;educationMigrationApply(s,'E25:A');s.mo=4;educationServiceTick(s);const outcome=s.educationAccess.notices[item.applicationId];
        const check=outcome.result==='accepted'?educationCaseCommitEligibility(s):{allowed:false};
        s.mo=5;if(outcome.result==='accepted')educationCaseFinanceInquiry(s);
        return {application,noTuition,examRecorded:!!outcome,blocked:!check.allowed,
          noEnrollment:s.educationRecord.enrollments.length===0};`);
      assert.deepEqual(result,{application:true,noTuition:true,examRecorded:true,blocked:true,noEnrollment:true});break;
    case 'R08':case 'R12':case 'R13':case 'R15':case 'R19':
      result=read(`const s=S,mode={R08:['dojo-or-guild','craft'],R12:['home-literacy','basic_literacy'],
        R13:['clan-tradition','terrain'],R15:['workshop-apprenticeship','manufacturing'],
        R19:['religious-community','literacy']}[RF.id];
        if(RF.id==='R12'||RF.id==='R13'){
          educationCaseAction(s,'case:begin:primary:primary:1');educationCaseDiscover(s,'adjacent');
          educationCaseAction(s,'case:nonformal');}
        const p=p15Learn(...mode),proof=JSON.stringify(p);s.mo=7;educationReconcileWorldAt(s,s.year,7);
        s.year++;s.age++;s.mo=0;educationAdvanceYear(s);
        if(RF.id==='R13'){s.local={kind:'小規模な定住地',city:null,placeId:'trading-settlement',educationAreaAnchor:'trading-settlement'};
          ensureResidenceIdentity(s);ensureEducationWorldForResidence(s);}
        return {retained:proof===JSON.stringify(p),formal:s.educationRecord.enrollments.length,
          degree:s.educationRecord.awards.length,recognition:educationMigrationRecognitionTarget(s)===null,
          separate:RF.id!=='R13'||s.local.educationAreaId!==RF.area};`);
      assert.deepEqual(result,{retained:true,formal:0,degree:0,recognition:true,separate:true});break;
    case 'R10':
      result=read(`const s=S,off=p15School('siracusa-lower');p15Install(off);s.mo=4;
        const student=educationLegacySceneGuard(s,'daily_siracusa_50');
        const path=s.educationPath;s.educationPath=null;s.fl.sch=0;const outsider=educationLegacySceneGuard(s,'daily_siracusa_50');
        s.educationPath=path;s.fl.sch=1;s.mo=11;
        return {student,outsider,noFabricatedCredits:Object.keys(s.educationCredits.items).length===0};`);
      assert.deepEqual(result,{student:true,outsider:false,noFabricatedCredits:true});break;
    case 'R11':
      result=read(`const s=S,before=JSON.stringify(RF.w.generationDecisions);
        const rate=educationPresenceRates('サルゴン','小規模な定住地').upper;s.mo=4;
        educationCaseAction(s,'case:begin:upper-path:upper:1');s.mo=6;educationCaseDiscover(s,'adjacent');
        return {rate,noCandidate:educationCaseCandidates(s).length===0,
          fixed:before===JSON.stringify(RF.w.generationDecisions),noGrade:!educationHas(s,'upper')};`);
      assert.deepEqual(result,{rate:0,noCandidate:true,fixed:true,noGrade:true});break;
    case 'R14':
      result=read(`const s=S,off=p15School('arts-college');off.instructionLanguage={languageId:'specialist-arts',
        evidenceRef:'published-specialist-requirement',minimum:{listen:70}};
        off.applicationLanguage={languageId:'specialist-arts',evidenceRef:'published-exam-requirement',minimum:{read:70}};
        s.educationPath={version:1,status:'outside',completed:['upper'],history:[]};s.mo=2;
        educationCaseAction(s,'case:begin:higher-path:arts:1');const item=educationActiveCase(s);item.evidence.knownCandidateIds=[off.id];
        s.mo=3;const review=educationCasePreflight(s,educationCaseCandidate(s,0));s.mo=5;
        return {blocked:!review.allowed,school:!!RF.w.offerings[off.id],noLab:!educationMigrationEligible(s,'edu_course_specific_equipment'),
          noAward:s.educationRecord.awards.length===0};`);
      assert.deepEqual(result,{blocked:true,school:true,noLab:true,noAward:true});break;
    case 'R16':
      result=read(`const s=S,off=p15School('mining-school'),id=p15Install(off);s.job=3;
        const p=p15Learn('workshop-apprenticeship','repair',7),credit=p15RecordYear(id),proof=JSON.stringify(p);
        s.job=0;s.year++;s.age++;s.mo=0;educationAdvanceYear(s);
        return {credit:credit.credited,advanced:s.educationPath.yearsCompleted===1,
          separate:proof===JSON.stringify(p),noGraduation:s.educationRecord.awards.length===0};`);
      assert.deepEqual(result,{credit:true,advanced:true,separate:true,noGraduation:true});break;
    case 'R17':case 'R18':
      result=read(`const s=S,off=p15School('affected-campus'),id=p15Install(off),far=p15Move('unaffected-neighbor'),
        other=p15School('other-school',RF.stage,far);s.mo=RF.id==='R17'?3:7;
        const from=s.mo;educationRecordSchoolAction(s,{effectId:RF.id+':site-damage',approved:true,
          basis:'explicit-simulation-site-action',sourceRef:'site-inspection',institutionId:off.institutionId,
          campusId:off.campusId,offeringId:off.id,effectiveFrom:{year:s.year,month:from},
          next:{offering:'suspended',campus:'inaccessible'}});
        const otherBefore=educationSchoolStatusAt(s,other.id,s.year,s.mo).campusStatus;
        s.mo=8;const oldId=s.educationPath.currentEnrollmentId;
        if(RF.id==='R18'){s.home='移動都市';s.local={kind:'移動都市の居住区',city:'シエスタ',
          placeId:'siesta-moving',districtId:'new-siesta'};ensureResidenceIdentity(s);ensureEducationWorldForResidence(s);}
        const credit=p15RecordYear(id),kept=JSON.stringify(s.educationAttendance.enrollments[id][s.year]);
        s.year++;s.age++;s.mo=0;educationAdvanceYear(s);
        return {unaffected:otherBefore!=='destroyed',insufficient:!credit.credited,
          kept:kept===JSON.stringify(s.educationAttendance.enrollments[id][s.year-1]),
          originalEnrollment:oldId===id,noDegree:s.educationRecord.awards.length===0};`);
      assert.deepEqual(result,{unaffected:true,insufficient:true,kept:true,originalEnrollment:true,noDegree:true});break;
  }
  assert(result,id+' has a scenario result');
}
console.log('PASS P15 R01-R19 prescribed dated paths, including annual boundaries; bounded fixtures, not population simulation');
