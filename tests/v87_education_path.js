'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),context={window:{}};
const runtime=require('../tools/runtime.cjs');
vm.runInNewContext(runtime.readData(root),context,{timeout:15000});
require('./support/bind-rule-fixture.cjs').bindRuleFixture(context);
const events=context.window.GAME_DATA.EV,event=id=>events.find(row=>row.id===id);
const dataSources=runtime.dataFiles(root).filter(file=>file.startsWith('data/')).map(file=>fs.readFileSync(path.join(root,file),'utf8'));
const durationParams=['education.universityYears','education.vocationalYears']
  .map(id=>context.window.GAME_DATA.SIM_PARAMS.find(row=>row.id===id));
assert(durationParams.every(row=>row?.source==='ゲーム用仮定'&&row.references?.includes('SRC_EDUCATION_ACCESS')),
  'course duration parameters must expose their game-assumption class and the source that marks regional durations as unconfirmed');
assert.equal(context.window.GAME_DATA.SETTING_SOURCES.SRC_EDUCATION_ACCESS.kind,'ユーザー提供の二次整理資料');
assert(context.window.GAME_DATA.SETTING_SOURCES.SRC_EDUCATION_ACCESS.note.includes('国別の普及率・授業料・課程期間は確定せず'));
// finalize wraps affiliation choices in functions, hiding their original static condition from the built event.
function sourceLiteracyGate(label){
 const source=dataSources.find(text=>text.includes(label));
 if(!source)return undefined;
 const offset=source.indexOf(label),nextChoice=source.indexOf('$terraData.K(',offset+label.length);
 const choiceSource=source.slice(offset,nextChoice<0?source.length:nextChoice);
 const match=choiceSource.match(/,\s*\{\s*show\s*:\s*\{[\s\S]*?\bge\s*:\s*\{[^}]*\bliteracy\s*:\s*(\d+)/);
 return match?Number(match[1]):undefined;
}
const reviewedIntent={uni_fee:['self-or-family-care','self-or-family-care','withdrawal'],uni_final_fee:['self-or-family-care','self-or-family-care','withdrawal'],voc_fee:['self-or-family-care','self-or-family-care','withdrawal'],voc_final_fee:['self-or-family-care','self-or-family-care','withdrawal'],teacher_path:['procedure','voluntary-aid','withdrawal'],artist_path:['self-or-family-care','self-or-family-care','withdrawal'],study_to_work:['procedure','procedure','procedure','withdrawal'],arts_academy_completion:['procedure','procedure']};
for(const [id,intents] of Object.entries(reviewedIntent)){
 const scene=event(id);assert(scene,id+' missing');assert.equal(scene.c.length,intents.length,id+' choice count');
 assert.deepEqual(Array.from(scene.c,choice=>choice.ethics?.intent),intents,id+' intent classification');
 assert(scene.c.every(choice=>choice.ethics?.reviewed&&choice.ethics.policyVersion===87),id+' must be reviewed under v87');
}
for(const id of ['uni_fee','uni_final_fee','voc_fee','voc_final_fee'])assert(event(id).references?.includes('SRC_EDUCATION_ACCESS'),id+' needs the education access source');
const fundingReview=event('education_funding_review'),
  creditChoice=fundingReview.c.find(choice=>choice.l.includes('成人向け学費貸付'));
assert(fundingReview.references.includes('SRC_EDUCATION_CREDIT_MODEL'));
assert(creditChoice && creditChoice.o[0][2].educationAction==='funding-loan',
  'the explicit adult student credit choice must be source-tagged and routed through the education ledger');
const dropoutCases=[['uni_fee','働き方を考え直す'],['uni_final_fee','修了前'],['voc_fee','課程を離れ'],['voc_final_fee','修了前']];
for(const [id,label] of dropoutCases){
 const scene=event(id),choice=scene.c.find(row=>row.l.includes(label));
 assert(choice,id+' withdrawal choice missing');
 const outcome=choice.o.find(row=>row[2]?.study?.endsWith('stop'));
 assert(outcome,id+' must end the study record');
 assert.equal(outcome[2].job,undefined,id+' must preserve the learner’s existing job instead of assigning factory work');
 assert.equal(outcome[2].fl?.uni_enrolled??outcome[2].fl?.voc_enrolled,0,id+' must clear its active enrollment flag');
 if(id.startsWith('voc_'))assert.equal(outcome[2].fl?.arts_enrolled,0,id+' must end an Arts course with the vocational course');
}
for(const [id,tuition,credential] of [['uni_fee',200000,'uni'],['uni_final_fee',200000,'uni'],['voc_fee',120000,'voc'],['voc_final_fee',120000,'voc']]){
 const scene=event(id),isFinal=id.endsWith('final_fee'),hasUniversity=id.startsWith('uni');
 const paid=scene.c[0].o[0][2],borrowed=scene.c[1].o[0][2],dropped=scene.c[2].o[0][2];
 assert.equal(paid.cash,-tuition);
 assert.equal(borrowed.debt,tuition);
 assert.equal(paid.study,hasUniversity?(isFinal?'uni_finish':'uni_advance'):(isFinal?'voc_finish':'voc_advance'));
 assert.equal(borrowed.study,paid.study);
 assert.equal(dropped.study,hasUniversity?'uni_stop':'voc_stop');
 assert.equal(paid.fl?.[credential],isFinal?1:undefined,id+' credential must be awarded only at completion');
 assert.equal(borrowed.fl?.[credential],isFinal?1:undefined,id+' borrowed completion credential');
 assert.equal(dropped.fl?.[credential],undefined,id+' dropout must not award a credential');
 assert.equal(dropped.fl?.[hasUniversity?'uni_enrolled':'voc_enrolled'],0);
}
const career=event('car'),artsAdmission=career.c.find(choice=>choice.l==='アーツ学院を目指す');
assert(artsAdmission,'Arts Academy entry route missing');
assert.equal(artsAdmission.o[0][2].job,undefined,'admission must not imply employment');
assert.equal(artsAdmission.o[0][2].fl.arts_enrolled,1,'admission must record enrollment');
assert.equal(artsAdmission.o[0][2].fl.arts_grad,undefined,'admission must not imply graduation');
assert.equal(artsAdmission.o[0][2].fl.voc_enrolled,1,'Arts course must use tracked tuition and completion states');
assert.equal(artsAdmission.o[1][2].job,undefined,'rejected applicant must retain their existing employment state');
const artsCompletion=event('arts_academy_completion');
assert.equal(typeof artsCompletion.show,'function','career path must verify completed Arts enrollment');
const artsHire=artsCompletion.c[0];
assert.equal(artsHire.o[0][2].job,11,'Arts technician job must follow completed training and a successful application');
assert.equal(artsHire.o[0][2].fl?.arts_grad,undefined,'hiring must not reissue credentials');
assert.equal(artsHire.o[0][2].fl?.arts_enrolled,undefined,'graduated enrollment stays settled');
assert.equal(artsHire.o[1][2].job,undefined,'rejected Arts technician applicant keeps their existing job');
assert.equal(artsHire.o[1][2].fl?.arts_grad,undefined,'a rejected application must preserve existing issued credential without duplicating it');
assert.equal(event('voc_final_fee').c[0].o[0][2].fl.arts_grad,undefined,'generic course completion must not create an Arts Academy credential');
for(const [id,label,min] of [['car','医療補助や薬局の手伝いをする',28],['car','事務・記録の仕事を探す',40],['car','応募・移動費 {colTechApplicationCost} を払って、クルビアの研究企業の技師職に挑む',35],['car','応募費 {vicClerkApplicationCost} を払って、ヴィクトリアの保険仲介所で帳簿係を探す',40],['elder_work_opportunity','読み書きや帳面の経験を教える',40],['teacher_path','教材と交通費を用意し、模擬授業に臨む',40],['kaz_knight_injury_job_transition','応募・移動費5,000龍門幣を払い、帳簿や窓口補助の仕事に応募する',40],['vic_patron','書類仕事への紹介を頼む',40],['col_hire','研究室の選考を受ける',40],['col_hire','工場の技術職に応募する',35],['yan_exam','書記の採用選考を受ける',40]]){
 const choice=event(id).c.find(row=>row.l===label);
 assert(choice,id+' literacy-gated route missing: '+label);
 const runtimeGate=choice.show?.ge?.literacy??choice.en?.ge?.literacy;
 const gate=runtimeGate??(typeof choice.show==='function'?sourceLiteracyGate(label):undefined);
 assert.equal(gate,min,id+' needs a functional literacy threshold: '+label);
}
assert.equal(context.window.GAME_DATA.J[21].n,'事務・窓口補助','the generic office job must not assume unmodeled interpreter skill');
const teacher=event('teacher_path'),teacherSuccess=teacher.c[0].o[0][2],teacherFail=teacher.c[0].o[1][2];
assert.equal(teacherSuccess.job,12);assert.equal(teacherFail.job,undefined);
assert.equal(teacherSuccess.cash,-50000);assert.equal(teacherFail.cash,-50000);
assert.equal(teacher.c[1].o[0][2].job,undefined,'reading support must not imply paid teaching employment');
assert.equal(teacher.c[2].o[0][2].job,undefined,'declining a teaching offer must preserve current work');
const artist=event('artist_path'),artistSuccess=artist.c[0].o[0][2],artistFail=artist.c[0].o[1][2];
assert.equal(artistSuccess.job,13);assert.equal(artistFail.job,0);
assert.equal(artistSuccess.cash,-200000);assert.equal(artistFail.cash,-200000);
assert.equal(artist.c[1].o[0][2].job,undefined,'hobby continuation must preserve employment');
assert.equal(artist.c[2].o[0][2].job,undefined,'declining exhibition must preserve employment');
const literacy=event('v77_adult_literacy_path');
assert(literacy,'adult literacy route missing');
const sharedReading=literacy.c.find(choice=>choice.l.includes('身近な人に文書を読んでもらえるか頼む'));
assert(sharedReading?.o.some(outcome=>outcome[2]?.literacyGain>0),'shared reading must change functional literacy, not only generic knowledge');
for(const choice of literacy.c)for(const outcome of choice.o){
 const effects=outcome[2]||{};
 assert.equal(effects.ep,undefined,'informal literacy must not award a formal education credential');
 assert.equal(effects.study,undefined,'informal literacy must not create a university/vocational enrollment');
}
const university=event('higher_ed'),universityChoice=university.c.find(row=>row.l.includes('地域大学の募集先を探す'));
assert(universityChoice,'regional university search intent missing');
const universityApplication=universityChoice.o[0][2];
assert.equal(universityApplication.educationAction,'case:begin:higher-path:university:1');
assert.equal(universityApplication.study,undefined,'researching a course must not enroll before verified admission');
assert.equal(universityApplication.cash,undefined,'researching a course must not charge examination fees');
const disruption=event('facility_school_disruption'),reopen=event('facility_school_reopen');
assert(disruption&&reopen,'school disruption and reopening paths must both exist');
assert(disruption.need.includes('就学中') && typeof disruption.show==='function','disruption must assess actual current school operation');
assert(reopen.need.includes('就学中') && typeof reopen.show==='function','reopening must assess actual restoration of offering');
for(const id of ['higher_ed','facility_school_disruption','cl_columbia_school_fee','cl_training_long_term'])
 assert(event(id).c.every(choice=>choice.ethics?.reviewed),'education review inventory is incomplete: '+id);
const annualRuntime=require('./support/annual-cases.cjs'),
  lifeCtx=annualRuntime.context(root).ctx;
annualRuntime.setup(lifeCtx,{id:'adult-columbia-education-credit',seed:905124,region:'クルビア',age:22});
const credit=vm.runInContext(`(() => {
  const s=S;
  s.age=22;s.year=s.by+s.age;s.cash=0;s.debt=0;s.house.cash=0;
  s.loanContracts=[];s.educationPath={version:1,stage:'university',tier:1,mode:'full-time',
    status:'enrolled',startedYear:s.year-1,stageStartYear:s.year-1,lastProcessedYear:null,
    yearsCompleted:1,duration:3,completed:[],equivalency:[],history:[]};
  s.educationDecision={kind:'funding',year:s.year};
  const fee=educationFunds(s,'university',1);
  educationApplyAction(s,'funding-loan');
  const contract=s.loanContracts[0],paid=settleContractDebt(s,'personal',50000);
  return {fee,principal:contract.principal,totalDue:contract.totalDue,balance:contract.balance,
    aggregate:s.debt,paid,payer:s.educationAnnualFee.payer,paidByContract:s.educationAnnualFee.paidByContract,
    contractId:s.educationAnnualFee.contractId,year:s.year,years:s.educationPath.yearsCompleted,
    decision:s.educationDecision,cash:s.cash};
})()`,lifeCtx);
assert(credit.fee>0);
assert.equal(credit.principal,credit.fee,'the adult student borrows only the tuition gap');
assert.equal(credit.totalDue,Math.round(credit.principal*1.1),'the signed fixed fee is recorded in the contract');
assert.equal(credit.balance,credit.totalDue-50000);
assert.equal(credit.aggregate,credit.balance,'annual repayment changes the ledger and aggregate exactly once');
assert.equal(credit.payer,'contract');
assert.equal(credit.paidByContract,credit.fee);
assert(credit.contractId.startsWith('edu-loan:'),'the loan contract is keyed to the specific tuition invoice');
assert.equal(credit.years,1,'signing tuition credit starts a funded year without instant completed study');
assert.equal(credit.decision,null);
assert.equal(credit.cash,0,'education credit pays the school and does not inflate student cash');
console.log(JSON.stringify({passed:true,adultColumbiaTuitionCreditLedger:true,schoolPaidDirectly:true,contractRepaymentAndEducationProgressConnected:true},null,2));

// Regressions from the supplied lifetime audit: real course transitions, bounded years only.
function lifecycleRegressions(){
  const base=JSON.parse(JSON.stringify(S));
  function fresh(age=14){
    const s=JSON.parse(JSON.stringify(base));s.age=age;s.year=s.by+age;
    s.educationPath=null;s.educationDecision=null;s.educationRecord={version:1,enrollments:[],awards:[]};
    s.study=null;s.job=0;s.fl.sch=0;s.fl.uni=0;s.fl.voc=0;s.fl.arts_grad=0;
    s.fl.reduced_work=0;s.reducedWorkStartedYear=null;
    s.cash=50000000;s.house.cash=0;s.k=100;s.ar=100;socialModel(s).literacy=100;
    activeFacility(s,'school').status='available';return s;
  }
  function advance(s){s.year++;s.age++;educationAdvanceYear(s);}
  const reentry=fresh();
  educationStart(reentry,'lower');educationEnd(reentry,'withdrawn','test-dropout');
  DEBUG_RANDOM=()=>0;educationApplyAction(reentry,'reenter-secondary');DEBUG_RANDOM=null;
  const secondEnrollment=reentry.educationRecord.enrollments.length===2;
  for(let i=0;i<3;i++)advance(reentry);
  const reentryComplete=secondEnrollment && reentry.educationPath.status==='completed' &&
    reentry.educationPath.yearsCompleted===3 && reentry.educationDecision?.kind==='upper-path' &&
    reentry.educationRecord.enrollments[0].status==='interrupted' &&
    reentry.educationRecord.enrollments[1].status==='completed' &&
    reentry.educationRecord.awards.length===0;
  const normal=[];
  for(const stage of ['upper','university','vocational','arts','preparatory']){
    if(stage==='preparatory'){
      const s=fresh(22),start=s.year,initialCash=s.cash;
      s.mo=0;ensureResidenceIdentity(s);
      const area=ensureEducationWorldForResidence(s),world=s.world.educationWorld,
        inst=educationRegisterInstitution(world,area,'v87-confirmed-preparatory',
          'preparatory',['preparatory'],s.year),
        off=world.offerings[inst.offeringIds[0]];
      educationStart(s,'preparatory',1,'verified-preparatory-offer');
      s.educationPath.institutionId=inst.id;
      s.educationPath.campusId=off.campusId;
      s.educationPath.offeringId=off.id;
      const enrollment=s.educationRecord.enrollments.at(-1);
      educationBindFormalEnrollment(s,enrollment.id);
      const place=s.educationPlacements.currentPlacementId,
        tuition=educationFunds(s,'preparatory',1,off.id),
        initialInvoice=educationEnsureTuitionInvoice(s,s.educationPath,s.year);
      educationSettleInvoice(s,initialInvoice);
      educationFinanceProjectInvoice(s,initialInvoice);
      const duration=s.educationPath.duration;
      for(let i=0;i<duration;i++){
        s.mo=12;
        for(let month=1;month<=12;month++)
          educationRecordAttendance(s,{enrollmentId:enrollment.id,
            placementId:place,year:s.year,month,personalAccess:1,
            evidenceRef:'v87-preparatory:'+s.year+':'+month});
        const credit=educationSettleCompletedAcademicYear(s,s.year);
        if(!credit.credited)throw Error('Preparatory year lacks a real credit');
        s.year++;s.age++;s.mo=0;educationAdvanceYear(s);
      }
      normal.push({stage,
        complete:s.educationPath.status==='completed',
        years:s.educationPath.yearsCompleted,
        duration,elapsed:s.year-start,
        paid:initialCash-s.cash,expected:tuition*duration,
        credential:s.educationPath.equivalency.includes('upper') &&
          (s.educationRecord.schoolCertificates||[]).some(x=>
            x.enrollmentId===enrollment.id &&
            x.qualification==='upper-equivalency' &&
            x.sourceCreditIds.length===duration),
        audit:auditLifeState(s)});
      continue;
    }
    const s=fresh(22),fee=educationFunds(s,stage),start=s.year;
    educationChargeFee(s,fee,stage);educationStart(s,stage);
    const duration=s.educationPath.duration,initialCash=50000000;
    for(let i=0;i<duration;i++)advance(s);
    normal.push({stage,complete:s.educationPath.status==='completed',years:s.educationPath.yearsCompleted,
      duration,elapsed:s.year-start,paid:initialCash-s.cash,expected:fee*duration,
      credential:stage==='preparatory'?s.educationPath.equivalency.includes('upper'):
        stage==='upper'?educationHas(s,'upper'):educationCredential(s,stage==='arts'?'arts':stage),
      audit:auditLifeState(s)});
  }
  const deferred=fresh(22);educationStart(deferred,'university');
  deferred.cash=0;advance(deferred);
  const earned=deferred.educationPath.yearsCompleted;
  for(let i=0;i<4;i++){educationApplyAction(deferred,'funding-defer');advance(deferred);}
  const noFreeGraduation=earned===1 && deferred.educationPath.yearsCompleted===1 &&
    deferred.educationPath.status==='enrolled' && !educationCredential(deferred,'university');
  educationApplyAction(deferred,'funding-grant');
  const aidDoesNotCredit=deferred.educationPath.yearsCompleted===1;
  educationAdvanceYear(deferred);
  const noDuplicateCredit=deferred.educationPath.yearsCompleted===1;
  advance(deferred);
  const aidYearEarned=deferred.educationPath.yearsCompleted===2;
  const paused=fresh(22);educationStart(paused,'university');paused.cash=0;advance(paused);
  educationApplyAction(paused,'funding-pause');advance(paused);
  const pauseNoCredit=paused.educationPath.yearsCompleted===1;
  paused.job=2;paused.fl.reduced_work=1;paused.reducedWorkStartedYear=paused.year-1;
  paused.cash=50000000;educationApplyAction(paused,'funding-resume');
  const resumedWorkClear=paused.job===0 && !paused.fl.reduced_work && paused.reducedWorkStartedYear===null &&
    paused.educationPath.yearsCompleted===1 && !paused.study.suspended;
  advance(paused);advance(paused);
  const resumedComplete=paused.educationPath.status==='completed' && paused.educationPath.yearsCompleted===3;
  const working=fresh(22);working.job=2;working.fl.reduced_work=1;working.reducedWorkStartedYear=working.year;
  educationStart(working,'university');
  const admissionWorkClear=working.job===0 && working.fl.reduced_work===0 && working.reducedWorkStartedYear===null &&
    !auditLifeState(working).includes('勤務縮小の開始年が不正');
  const employed=fresh(22);employed.job=2;employed.fl.reduced_work=1;employed.reducedWorkStartedYear=employed.year;
  educationStart(employed,'preparatory');
  const workingCourseKeepsJob=employed.job===2 && employed.fl.reduced_work===1 && employed.reducedWorkStartedYear===employed.year;
  const repeat=fresh(22);repeat.k=0;repeat.socialLearning.literacy=0;
  educationStart(repeat,'university');
  for(let i=0;i<3;i++)advance(repeat);
  const review=repeat.educationDecision?.kind==='graduation';
  repeat.cash=0;educationApplyAction(repeat,'repeat');
  const repeatFundingPreserved=review && repeat.educationDecision?.kind==='funding' &&
    repeat.educationPath.yearsCompleted===3 && repeat.educationPath.duration===4;
  educationApplyAction(repeat,'funding-grant');repeat.k=100;repeat.socialLearning.literacy=100;
  const repeatNotInstant=repeat.educationPath.status==='enrolled' && !educationCredential(repeat,'university');
  advance(repeat);
  const repeatCompleted=repeat.educationPath.status==='completed' && repeat.educationPath.yearsCompleted===4;
  const broken=JSON.parse(JSON.stringify(repeat));broken.educationPath.yearsCompleted=0;
  const unearnedAwardDetected=auditLifeState(broken).includes('教育学籍の年限・就業・資格記録に矛盾');
  const gap=fresh(22);educationStart(gap,'upper');gap.year+=10;gap.age+=10;educationAdvanceYear(gap);
  const gapNoCredit=gap.educationPath.yearsCompleted===0 && gap.educationPath.status==='enrolled';
  return {reentryComplete,normal,noFreeGraduation,aidDoesNotCredit,noDuplicateCredit,aidYearEarned,
    pauseNoCredit,resumedWorkClear,resumedComplete,admissionWorkClear,workingCourseKeepsJob,gapNoCredit,repeatFundingPreserved,repeatNotInstant,repeatCompleted,unearnedAwardDetected};
}
const regressions=vm.runInContext('('+lifecycleRegressions.toString()+')()',lifeCtx,{timeout:18000});
for(const key of ['reentryComplete','noFreeGraduation','aidDoesNotCredit','noDuplicateCredit','aidYearEarned',
 'pauseNoCredit','resumedWorkClear','resumedComplete','admissionWorkClear','workingCourseKeepsJob','gapNoCredit','repeatFundingPreserved','repeatNotInstant','repeatCompleted','unearnedAwardDetected'])
 assert.equal(regressions[key],true,key);
for(const row of regressions.normal){
 assert.equal(row.complete,true,row.stage+' completes');assert.equal(row.credential,true,row.stage+' credential');
 assert.equal(row.years,row.duration,row.stage+' actual study years');assert.equal(row.elapsed,row.duration);
 assert.equal(row.paid,row.expected,row.stage+' exactly one fee per funded year');
 assert.deepEqual(Array.from(row.audit),[],row.stage+' audit');
}
console.log('PASS reentry ledger, earned years, deferred funding, leave/resume and reduced work');
