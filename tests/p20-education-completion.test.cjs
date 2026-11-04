'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
let serial=0;
function run(code){return JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx,{timeout:15000}));}
assert.deepEqual(run(`return educationDependentKnownView({year:1077});`),[]);
function fresh(region='クルビア',stage='university',age=22){
  setup(ctx,{id:'p20-'+(++serial),seed:882000+serial,region,age});
  ctx.STAGE=stage;
  run(`const s=S;s.year=1095;s.by=s.year-s.age;s.mo=1;s.cash=10000000;s.house.cash=10000000;
    s.educationPath=null;s.study=null;s.educationDecision=null;s.fl.sch=0;s.k=95;s.ar=95;
    s.socialLearning.literacy=95;s.educationCases=null;s.educationAccess=null;
    ensureResidenceIdentity(s);const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld;
    const inst=educationRegisterInstitution(w,area,'a-completion','completion-fixture',[STAGE],s.year),o=w.offerings[inst.offeringIds[0]];
    o.admissionTier=1;globalThis.F={area,w,inst,o};return true;`);
}
function enroll(){return run(`const s=S,{inst,o}=F;
  educationStart(s,o.stage,1,'school-signed-enrollment');
  Object.assign(s.educationPath,{institutionId:inst.id,campusId:o.campusId,offeringId:o.id});
  const e=s.educationRecord.enrollments.at(-1);educationBindFormalEnrollment(s,e.id);
  educationEnsureEnrolledSchoolPeople(s,e.id);
  const inv=educationEnsureTuitionInvoice(s,s.educationPath,s.year);educationSettleInvoice(s,inv);
  educationFinanceProjectInvoice(s,inv);return e.id;`);}
function begin(){run(`S.educationPath={version:1,status:'outside',completed:[],history:[],equivalency:['upper']};
  educationCaseAction(S,'case:begin:higher-path:'+F.o.stage+':1');
  const item=educationActiveCase(S);item.evidence.knownCandidateIds=[F.o.id];return true;`);}

// D01: another person sees the same saved world, without inheriting discovery.
fresh('クルビア','primary',8);
assert.deepEqual(run(`const a=S,other={...a,educationCases:null,educationAccess:null};
  const before=JSON.stringify(F.w.generationDecisions);
  educationCaseAction(a,'case:begin:primary:primary:1');
  const unseen=educationCaseCandidates(other).length;
  educationCaseAction(other,'case:begin:primary:primary:1');
  return {unseen,same:educationCaseCandidates(a).map(x=>x.offeringId).join()===
    educationCaseCandidates(other).map(x=>x.offeringId).join(),fixed:before===JSON.stringify(F.w.generationDecisions)};`),
  {unseen:0,same:true,fixed:true});

// D05: a documented Victoria lender, direct grant, two actual wallets.
fresh('ヴィクトリア');
assert.deepEqual(run(`const s=S;s.cash=50000;s.house.cash=20000;s.residenceArrangement='family_home_shared_budget';
  const inv=educationEnsureInvoice(s,{id:'d05',kind:'tuition',amount:100000,institutionId:F.inst.id,serviceYear:s.year});
  educationFinanceState(s).creditOffers={lender:{status:'approved',evidenceRef:'signed-lender',
    invoiceId:inv.id,creditor:'individual-lender',amount:10000,validYear:s.year}};
  const paid=educationSettleInvoice(s,inv,{grant:{id:'d05-grant',amount:20000,basis:'signed-grant'},
    loan:{id:'lender',amount:10000,creditor:'individual-lender'}});
  const again=educationSettleInvoice(s,inv);
  return {paid:paid?.amount,cash:s.cash,house:s.house.cash,again:again?.id===paid?.id,
    out:[educationAnnualOutflow(s,s.year,'personal'),educationAnnualOutflow(s,s.year,'household')],
    loan:loanContract(s,'lender')?.principal,issues:educationCheckFinanceInvariants(s)};`),
  {paid:100000,cash:0,house:0,again:true,out:[50000,20000],loan:10000,issues:[]});

// D06/D31: school cancellation versus learner withdrawal; one application/refund.
for(const reason of ['exam-cancelled','application-withdrawn']){
  fresh();begin();ctx.REASON=reason;
  const row=run(`const s=S,item=educationActiveCase(s);item.phase='application';
    item.offeringId=F.o.id;item.targetInstitutionId=F.inst.id;item.applicationId=item.id+':application:1';
    const before=s.cash,inv=educationEnsureInvoice(s,{id:item.applicationId+':exam:1',kind:'entrance-exam',
      applicationId:item.applicationId,institutionId:F.inst.id,amount:1000,serviceYear:s.year});
    educationSettleInvoice(s,inv);
    const first=educationCaseCancelApplication(s,item,REASON),again=educationCaseCancelApplication(s,item,REASON),
      end=s.cash,created=Object.keys(s.educationFinance.refunds).length;
    educationCaseAction(s,'case:begin:higher-path:university:1');const next=educationActiveCase(s);
    return {first,again,spent:before-end,refunds:created,reason:item.reason,
      result:s.educationAccess.notices[item.applicationId].result,newId:next.id!==item.id};`);
  assert.deepEqual(row,{first:true,again:true,spent:reason==='exam-cancelled'?0:1000,
    refunds:reason==='exam-cancelled'?1:0,reason,result:reason,newId:true});
}

// D08: no lender or relief inferred for Kazdel, and no phantom money.
fresh('カズデル');begin();
assert.deepEqual(run(`const s=S,item=educationActiveCase(s);Object.assign(item,{phase:'contract',
  offeringId:F.o.id,targetInstitutionId:F.inst.id,campusId:F.o.campusId});s.cash=0;s.house.cash=0;
  educationCaseFinanceInquiry(s);const offer=s.educationAccess.financingOffers[item.id];
  return {grant:offer.grant,loan:offer.loan,cash:s.cash,awards:s.educationRecord.awards.length};`),
  {grant:null,loan:null,cash:0,awards:0});

// D09: a caregiver cannot sign boarding without recorded authority.
fresh('ラテラーノ','lower',12);
assert.deepEqual(run(`const s=S;educationCreateMobilityState(s);s.care.parentKeys=[];
  s.educationMobility.consentRecords.c={id:'c',personId:'protagonist',institutionId:F.inst.id,
    purpose:'boarding-move',consenterPersonId:'caregiver',consentState:'granted',evidenceRef:'co-residence',
    validFrom:{year:s.year,month:1}};
  const r=educationGuardianReview(s,'protagonist','boarding-move',F.inst.id,s.year,1);
  return {authority:r.authorityStatus,consent:r.guardianConsentStatus,cash:s.cash};`),
  {authority:'unconfirmed',consent:'unverified',cash:10000000});

// D17/D32: documents are school-specific; translation does not waive exam language.
fresh('ラテラーノ','vocational',22);begin();
assert.deepEqual(run(`const s=S;F.o.requiredDocuments=['residence-proof'];s.legal={status:'unknown'};
  const a=educationCasePreflight(s,educationCaseCandidate(s,0));
  s.educationDocuments=[{kind:'residence-proof',personId:'protagonist',status:'verified',institutionId:F.inst.id}];
  const b=educationCasePreflight(s,educationCaseCandidate(s,0));
  return {missing:a.reasonCodes[0],allowed:b.allowed,noEnrollment:s.educationRecord.enrollments.length};`),
  {missing:'documents-missing',allowed:true,noEnrollment:0});

// D18/D20: real, repeated training evidence survives years without a degree.
for(const [region,mode,subject] of [['サーミ','clan-tradition','terrain'],['クルビア','corporate-training','technical']]){
  fresh(region,'primary',24);ctx.TRAIN={mode,subject};
  assert.deepEqual(run(`const s=S,{mode,subject}=TRAIN;if(mode==="corporate-training")s.job=7;
    const provider=educationRegisterInformalProvider(s,{providerId:'actual-mentor',personId:'mentor',
      kind:mode,areaId:F.area,subjectIds:[subject],activeFrom:{year:s.year,month:1},evidenceRef:'observed-lessons'});
    const p=educationOpenLearningPath(s,{modeId:mode,providerId:provider.id,
      siteRef:{region:s.res.n,areaId:F.area},subjectIds:[subject],sourceEventId:'training'});
    for(let year=1095;year<=1096;year++){s.year=year;s.mo=12;
      educationRecordLearningParticipation(s,{pathId:p.pathId,year,month:6,attendedSessions:2,totalSessions:2,evidenceRef:'lesson-'+year});}
    return {periods:p.participation.length,proof:p.evidenceIds.length,formal:s.educationRecord.enrollments.length,
      awards:s.educationRecord.awards.length,issues:educationNonformalInvariants(s)};`),
    {periods:2,proof:2,formal:0,awards:0,issues:[]});
}

// D25: an arts building alone does not put a general student in a music course.
fresh('リターニア','upper',18);enroll();
assert.equal(run(`educationRegisterInstitution(F.w,F.area,'music-school','originium_arts_academy',['arts'],S.year);
  return educationLegacySceneGuard(S,'daily_leithanien_57');`),false);

// D26: support remains a gift until the child independently enrolls.
fresh('レム・ビリトン','lower',40);
assert.deepEqual(run(`const s=S;s.kids=[{id:'adult-child',by:s.year-20,d:0}];educationSynchronizeDependents(s);
  const invoice=educationEnsureInvoice(s,{id:'gift',personId:'adult-child',recipientKind:'dependent',recipientId:'adult-child',kind:'living',amount:150000,serviceYear:s.year});
  const posting=educationSettleInvoice(s,invoice);
  educationDependentRecordSupport(s,{personId:'adult-child',transferId:'gift',amount:150000,
    kind:'gift',postingId:posting.id,sourceEventId:'parent-support'});
  const c=educationDependentEntry(s,'adult-child');return {enrolled:c.enrollments.length,
    awards:c.awards.length,tuition:Object.values(s.educationFinance.invoices).filter(x=>x.kind==='tuition').length,
    paid:c.aidHistory[0].amount};`),{enrolled:0,awards:0,tuition:0,paid:150000});

// The normal inquiry produces E27's source, a later month supplies its answer.
fresh();begin();
assert.deepEqual(run(`const s=S;s.job=7;s.lifeRecord.affiliations.push({id:'actual-employer',kind:'employer',status:'active'});
  const cash=s.cash,rng=s.rngState;educationServiceInquiry(s);
  const eligible=educationMigrationEligible(s,'edu_employer_sponsored_course','A');
  educationMigrationApply(s,'E27:A');const record=s.educationMigration.records.at(-1);
  const pending=!record.notice;s.mo=2;educationServiceTick(s);
  const notice=!!record.notice,decision=s.educationP17Decisions.items[record.result.externalRequest.id];
  educationServiceTick(s);
  return {eligible,pending,notice,status:decision.status,uncharged:cash===s.cash,randomFixed:rng===s.rngState,
    enrollment:s.educationRecord.enrollments.length,issues:educationServiceInvariants(s)};`),
  {eligible:true,pending:true,notice:true,status:'approved',uncharged:true,randomFixed:true,enrollment:0,issues:[]});

// E42/E79 are created by actual calendar/closure and individual health, not tests injecting decisions.
fresh('ヴィクトリア','upper',22);enroll();
assert.deepEqual(run(`const s=S;s.mo=6;
  educationRecordSchoolAction(s,{effectId:'school-closure',approved:true,basis:'explicit-simulation-site-action',
    sourceRef:'school-closure-reply',institutionId:F.inst.id,campusId:F.o.campusId,offeringId:F.o.id,
    effectiveFrom:{year:s.year,month:6},recoveryAt:{year:s.year,month:7},next:{offering:'suspended'}});
  educationServiceTick(s);const eligible=educationMigrationEligible(s,'edu_exam_cancelled','A');
  educationMigrationApply(s,'E42:A');s.mo=7;educationServiceTick(s);
  const record=s.educationMigration.records.at(-1);
  return {eligible,notified:!!record.notice,makeup:s.educationP17Decisions.items[record.result.externalRequest.id].makeupAt.month};`),
  {eligible:true,notified:true,makeup:7});

fresh('ヴィクトリア','upper',22);enroll();
assert.deepEqual(run(`const s=S;educationServiceInquiry(s);
  const absent=educationMigrationEligible(s,'edu_safety_for_disabled_student','A');
  startMortalityEpisode(s,'injury',3,'recorded-fall');F.inst.servicePolicies[F.o.id].stepFree=false;
  s.mo=2;educationServiceInquiry(s);
  const possible=educationMigrationEligible(s,'edu_safety_for_disabled_student','A');
  educationMigrationApply(s,'E79:A');s.mo=3;educationServiceTick(s);
  const record=s.educationMigration.records.at(-1);
  return {absent,possible,notified:!!record.notice,noExtraEnrollment:s.educationRecord.enrollments.length===1};`),
  {absent:false,possible:true,notified:true,noExtraEnrollment:true});

// D10/D11: tuition-bearing sibling enrollments and each child's real route.
fresh('シラクーザ','lower',40);
assert.deepEqual(run(`const s=S;s.kids=[{id:'child-a',by:s.year-13,d:0,nm:'A'},
    {id:'child-b',by:s.year-15,d:0,nm:'B'}];const before=s.cash;
  for(const personId of ['child-a','child-b']){
    educationDependentResidenceUpdate(s,{personId,kind:'family-home',region:s.res.n,areaId:F.area,
      effectiveAt:{year:s.year,month:1},sourceEventId:personId+':home',reportedToProtagonist:true,
      knownAt:{year:s.year,month:1}});
    for(const [purpose,signerPersonId] of [['attend',personId],['guardian-enrollment','protagonist']])
      educationDependentRecordConsent(s,{personId,consentId:personId+':'+purpose,purpose,signerPersonId,
        offeringId:F.o.id,status:'approved',sourceEventId:personId+':signed:'+purpose});
    const tx=personId+':admission',eid='dependent-enrol:'+tx;
    educationDependentRecordSchoolDecision(s,{personId,applicationId:tx,offeringId:F.o.id,
      status:'accepted',sourceEventId:personId+':school-reply'});
    const inv=educationEnsureInvoice(s,{id:personId+':tuition',kind:'tuition',personId,
      enrollmentId:eid,offeringId:F.o.id,institutionId:F.inst.id,amount:42000,serviceYear:s.year});
    educationSettleInvoice(s,inv);educationSettleInvoice(s,inv);
    const enrollment=educationDependentRecordEnrollment(s,{personId,offeringId:F.o.id,
      admissionTransactionId:tx,sourceEventId:tx,personConsentId:personId+':attend',
      guardianConsentId:personId+':guardian-enrollment',fundingInvoiceId:inv.id,
      confirmedAt:{year:s.year,month:1}});
    s.mo=12;
    for(let month=1;month<=12;month++)educationDependentRecordAttendance(s,{personId,
      enrollmentId:enrollment.enrollmentId,year:s.year,month,evidenceRef:personId+':lesson:'+month});
  }
  const entries=['child-a','child-b'].map(id=>s.dependentEducation[id]),
    total=entries.map(x=>Object.values(x.attendanceMonths).reduce((n,r)=>n+r.equivalent,0));
  const oldKnown=JSON.stringify(entries[1].knownResidence);
  const away={...s.local,placeId:'remote-child-home',educationAreaAnchor:'remote-child-home',
    city:null,educationAreaId:null};const proxy={...s,local:away};
  const remote=ensureEducationWorldForResidence(proxy);
  educationDependentResidenceUpdate(s,{personId:'child-b',kind:'independent',region:s.res.n,
    areaId:remote,effectiveAt:{year:s.year,month:12},sourceEventId:'child-private-move'});
  const route=educationCanReach(s,{personId:'child-b',institutionId:F.inst.id,
    campusId:F.o.campusId,offeringId:F.o.id,year:s.year,month:12});
  const view=educationDependentKnownView(s);
  return {spent:before-s.cash,total,distinct:entries[0].enrollments[0].enrollmentId!==entries[1].enrollments[0].enrollmentId,
    unreported:oldKnown===JSON.stringify(entries[1].knownResidence),realRouteBlocked:!route.reachable,
    hidden:!JSON.stringify(view).includes(remote)&&!JSON.stringify(view).includes('actualEnrollment'),
    parentNotStudent:s.educationRecord.enrollments.length===0};`),
  {spent:84000,total:[12,12],distinct:true,unreported:true,realRouteBlocked:true,hidden:true,parentNotStudent:true});

// D32: a lecture interpreter does not grant examination comprehension.
fresh('リターニア','arts',22);enroll();
assert.deepEqual(run(`const s=S,teacher=Object.values(F.w.staff).find(x=>x.offeringId===F.o.id);
  F.o.instructionLanguage={languageId:'specialist-language',minimum:{listen:65},evidenceRef:'lecture-rule'};
  F.o.applicationLanguage={languageId:'specialist-language',minimum:{read:65},evidenceRef:'exam-rule'};
  educationRegisterLanguageSupport(s,{offeringId:F.o.id,languageId:'specialist-language',purpose:'instruction-session',
    kind:'interpreter',mode:'listen',providerPersonId:teacher.id,evidenceRef:'signed-lecture-interpreter',
    start:{year:s.year,month:1},end:{year:s.year,month:12}});
  return {lecture:educationOfferingLanguageAssessment(s,F.o.id,'instruction-session').status,
    exam:educationOfferingLanguageAssessment(s,F.o.id,'entrance-exam-reading').status,
    degrees:s.educationRecord.awards.length};`),{lecture:'understood',exam:'blocked',degrees:0});

// D28: actual dispatcher protects school, due medical review, then history.
fresh('ウルサス','lower',18);
assert.deepEqual(run(`const s=S;s.year=1097;s.by=s.year-s.age;s.mo=4;s.educationDecision={kind:'graduation',year:s.year};
  s.infectionWorkplace={reviewDueYear:s.year};s.world.events.londinium_war=s.year;
  const source=EV.slice(),oldFire=fire,selected=[],choices=[{l:'act',o:[[1,'done',{}]]}],
    school={id:'education_graduation_review',st:['青年'],c:choices,w:1},
    medical={id:'infection_workplace_review',st:['青年'],c:choices,w:1},
    history={id:'p15-history',st:['青年'],timelineFlag:'londinium_war',c:choices,w:1};
  try{EV.splice(0,EV.length,history,medical,school);
    fire=(e,state)=>{selected.push(e.id);state.majorEventMonth={year:state.year,month:state.mo};
      state.sn[e.id]=state.year;if(e===school)state.educationDecision=null;
      if(e===medical)state.infectionWorkplace=null;};
    slot(3.5/12);slot(3.5/12);slot(4.5/12);slot(5.5/12);
    return selected;
  }finally{fire=oldFire;EV.splice(0,EV.length,...source);}`),
  ['education_graduation_review','infection_workplace_review','p15-history']);

// I08: read-only regional output exposes separate denominators, no player secrets.
fresh();begin();
assert.deepEqual(run(`const s=S,before=JSON.stringify(s),rng=s.rngState,
    rows=educationObservationRegionalRows(s),html=educationObservationMarkup(s);
  renderEducationPanel(s);
  return {pure:before===JSON.stringify(s),rng:rng===s.rngState,
    metrics:Object.keys(rows[0].metrics).length,hasDenominator:html.includes('分子／分母'),
    zeroKept:rows.every(r=>Object.values(r.metrics).every(x=>x.denominator!==0||x.rate===null))};`),
  {pure:true,rng:true,metrics:7,hasDenominator:true,zeroKept:true});

// E20: explicit foreign inquiry creates a journey, never a daily commute.
fresh();begin();
assert.deepEqual(run(`const s=S,item=educationActiveCase(s),rng=s.rngState,cash=s.cash;
  educationServiceInquiry(s);
  const ids=educationPrepareStudyDestinations(s),area=ids[0],
    inst=educationRegisterInstitution(F.w,area,'a-foreign-university','university',['university'],s.year),
    off=F.w.offerings[inst.offeringIds[0]];off.admissionTier=1;
  educationCaseDiscover(s,'abroad');item.previewOfferingId=off.id;educationServiceInquiry(s);
  const before=educationCasePreflight(s,educationCaseCandidates(s)[0]);
  educationMigrationApply(s,'E20:A');s.mo=2;educationServiceTick(s);
  const approved=educationServiceTravelApproved(s,item.id,off.id),
    daily=educationCanReach(s,{institutionId:inst.id,campusId:off.campusId,offeringId:off.id,year:s.year,month:s.mo}),
    exam=educationCanReach(s,{institutionId:inst.id,campusId:off.campusId,offeringId:off.id,purpose:'exam-visit',year:s.year,month:s.mo});
  return {before:before.reasonCodes[0],approved,daily:daily.reachable,exam:exam.reachable,
    cash:cash===s.cash,rng:rng===s.rngState,noEnrollment:s.educationRecord.enrollments.length===0};`),
  {before:'travel-permission-pending',approved:true,daily:false,exam:true,cash:true,rng:true,noEnrollment:true});

// E17: the learner moves, the family stays, and only real occupied months bill.
fresh('クルビア','upper',22);
assert.deepEqual(run(`const s=S,original=s.local.educationAreaId,proxy={...s,local:{kind:'固定都市の街区',
    city:null,placeId:'boarding-district',educationAreaAnchor:'boarding-district',districtId:'boarding-district'}},
    far=ensureEducationWorldForResidence(proxy);
  F.w.campuses[F.o.campusId].educationAreaId=far;
  F.w.transportLinks.boarding={id:'boarding',endpointAreaIds:[original,far],travelMinutesAB:20,travelMinutesBA:20,
    riskScore:0.05,directionalAccess:{[original]:true,[far]:true},statusHistory:[]};
  F.inst.servicePolicies={[F.o.id]:{...educationServicePolicy(s,F.o.id),dormAvailable:true,
    commuteAnnual:12000,roomMonthly:3000,foodMonthly:2000}};
  return true;`),true);
enroll();
assert.deepEqual(run(`const s=S,current=educationMigrationCurrent(s),cash=s.cash,home=s.local.educationAreaId;
  educationServiceInquiry(s);educationMigrationApply(s,'E17:A');
  const contract=Object.values(s.educationMobility.residenceContracts)[0],after=s.cash;
  educationServiceTick(s);educationServiceTick(s);const repeat=s.cash===after;
  s.mo=2;educationServiceTick(s);const total=cash-s.cash;
  s.year++;s.mo=1;
  return {first:cash-after,total,repeat,studentAway:contract.actualAreaId!==home,
    familyHome:s.local.educationAreaId===home,expired:educationResolvePersonLocation(s).areaId===home,
    noExtraEnrollment:s.educationRecord.enrollments.length===1};`),
  {first:6000,total:11000,repeat:true,studentAway:true,familyHome:true,expired:true,noExtraEnrollment:true});

// D07: inquiry -> receiving school's answer -> actual E41 -> one fee difference.
fresh('レム・ビリトン','upper',22);enroll();
assert.deepEqual(run(`const s=S,other=educationRegisterInstitution(F.w,F.area,'receiving-school','general_upper',['upper'],s.year),
    target=F.w.offerings[other.offeringIds[0]];target.admissionTier=1;
  target.annualFeeOverride=educationFunds(s,'upper',1,F.o.id)+11000;target.priceBasis='final-base';
  const old=s.educationPath.currentEnrollmentId,oldCash=s.cash;
  educationServiceTransferInquiry(s);const request=Object.values(s.educationTransferRequests.items).find(x=>x.toOfferingId===target.id);
  const pending=request.status==='awaiting-school';s.mo=2;educationServiceTick(s);
  // This fixed world exercises an accepted answer without retrying admission draws.
  if(request.status==='rejected')return {pending,rejected:true,old:s.educationPath.currentEnrollmentId===old,
    unchanged:oldCash===s.cash};
  const eligible=educationMigrationEligible(s,'edu_real_institution_transfer','A');
  educationMigrationApply(s,'E41:A');
  return {pending,rejected:false,eligible,oldClosed:s.educationRecord.enrollments.find(x=>x.id===old).status,
    current:s.educationPath.offeringId===target.id,difference:oldCash-s.cash,
    onlyOne:s.educationRecord.enrollments.filter(x=>x.status==='enrolled').length===1,
    noSecond:!educationMigrationEligible(s,'edu_real_institution_transfer','A')};`),
  {pending:true,rejected:false,eligible:true,oldClosed:'transferred',current:true,difference:11000,onlyOne:true,noSecond:true});

// D21: an actual displaced learner keeps the old school and payment history;
// interruption is a recorded individual decision, never national destruction.
fresh('カズデル','primary',10);enroll();
assert.deepEqual(run(`const s=S,old=s.educationPath.currentEnrollmentId,school=s.educationPath.offeringId;
  const paid=JSON.stringify(s.educationFinance);s.fl.war_displaced=1;
  s.local={kind:'移動都市の避難・労働区画',city:null,placeId:'verified-evacuation',districtId:'evacuation'};
  ensureResidenceIdentity(s);ensureEducationWorldForResidence(s);
  const item=educationCaseBegin(s,'interruption-review','primary',1,'continuity');
  item.evidence.displacementRef='actual-evacuation-arrival';educationCaseAction(s,'case:pause');
  return {paused:s.educationPath.status,reason:item.reason,school:s.educationPath.offeringId===school,
    enrollment:s.educationRecord.enrollments.some(x=>x.id===old),
    noNewBill:paid===JSON.stringify(s.educationFinance),evidence:item.evidence.displacementRef};`),
  {paused:'paused',reason:'paused',school:true,enrollment:true,noNewBill:true,evidence:'actual-evacuation-arrival'});

// D23: actual damage persists past the battle window until school-specific recovery.
fresh('ヴィクトリア','university',22);enroll();
assert.deepEqual(run(`const s=S,w=F.w,o=F.o;s.year=1098;s.mo=7;
  educationRecordSchoolAction(s,{effectId:'d23-damage',campusId:o.campusId,institutionId:o.institutionId,
    effectiveFrom:{year:1098,month:7},basis:'explicit-simulation-site-action',approved:true,
    sourceRef:'actual-campus-damage',next:{campus:'inaccessible',offering:'suspended'}});
  const before=educationSchoolStatusAt(s,o.id,1098,6),july=educationSchoolStatusAt(s,o.id,1098,7);
  s.mo=10;const october=educationSchoolStatusAt(s,o.id,1098,10);
  educationRecordSchoolAction(s,{effectId:'d23-repair',campusId:o.campusId,institutionId:o.institutionId,
    effectiveFrom:{year:1098,month:10},basis:'explicit-simulation-site-action',approved:true,
    sourceRef:'actual-school-repair',next:{campus:'usable',offering:'teaching'}});
  const after=educationSchoolStatusAt(s,o.id,1098,10);
  return {before:before.teachingEquivalent,july:july.teachingEquivalent,october:october.teachingEquivalent,
    after:after.teachingEquivalent,history:w.operationalHistory.filter(x=>x.effectId.startsWith('d23-')).length,
    same:s.educationPath.offeringId===o.id};`),
  {before:1,july:0,october:0,after:1,history:2,same:true});

// I08: pending applications/services, worlds, accounts and knowledge use real resume.
fresh();begin();
assert.deepEqual(run(`const s=S;s.job=7;applyLifeAffiliation({id:'resume-employer',kind:'employer',title:'Actual employer',action:'join'});
  educationServiceInquiry(s);educationMigrationApply(s,'E27:A');
  const before=JSON.stringify({world:s.world.educationWorld,finance:s.educationFinance,
    cases:s.educationCases,known:s.educationAccess,rng:s.rngState,service:s.educationServices});
  const snapshot=makeResumeSnapshot();HL=0;play=()=>{};tab=()=>{};restorePendingChoice=()=>false;rd=()=>{};
  const resumed=cont(snapshot),after=JSON.stringify({world:S.world.educationWorld,finance:S.educationFinance,
    cases:S.educationCases,known:S.educationAccess,rng:S.rngState,service:S.educationServices});
  S.mo=2;educationServiceTick(S);const notices=S.educationMigration.records.filter(x=>x.notice).length;
  const snapshot2=makeResumeSnapshot();cont(snapshot2);educationServiceTick(S);
  return {resumed,same:before===after,notices,afterReplay:S.educationMigration.records.filter(x=>x.notice).length};`),
  {resumed:true,same:true,notices:1,afterReplay:1});
console.log('PASS I07/I08 completion: D01 D05 D06 D08 D09 D17 D18 D20 D25 D26 D31; natural services and actual resume');
