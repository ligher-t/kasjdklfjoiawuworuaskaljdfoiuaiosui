// P0: a course is a continuous life process, not an education-point threshold.
// Ages, tuition and admission rates below are GAME MODEL ASSUMPTIONS.
// Per-country legal prohibitions are not inferred from these parameters.
const EDUCATION_PROGRAMS = Object.freeze({
  primary: {years:6, fee:0}, lower: {years:3, fee:42000},
  upper: {years:3, fee:72000}, preparatory: {years:3, fee:38000}, university: {years:4, fee:185000},
  vocational: {years:3, fee:115000}, arts: {years:3, fee:160000}
});
// Region entries are bounded, explicitly GAME-MODEL school admissions profiles.
// "deny" represents ordinary school refusal, not a universal statute or a proven
// national statistic. Exceptional schools require their own named event/record.
const EDUCATION_REGION_PROFILES = Object.freeze({
  "炎国":           {infection:"conditional", infectedChance:0.32, leave:true,  formal:true,  source:"simulation-urban-school"},
  "龍門":           {infection:"deny",        infectedChance:0,    leave:true,  formal:true,  source:"simulation-city-restrictions"},
  "ヴィクトリア":   {infection:"deny",        infectedChance:0,    leave:true,  formal:true,  source:"simulation-war-and-class"},
  "ウルサス":       {infection:"deny",        infectedChance:0,    leave:true,  formal:true,  source:"ST-3-ursus-school-and-simulation"},
  "ラテラーノ":     {infection:"deny",        infectedChance:0,    leave:true,  formal:true,  source:"simulation-civic-school-access"},
  "カジミエーシュ": {infection:"deny",        infectedChance:0,    leave:true,  formal:true,  source:"simulation-competition-class"},
  "クルビア":       {infection:"conditional", infectedChance:0.25, leave:true,  formal:true,  source:"simulation-variable-private-school"},
  "極東":           {infection:"conditional", infectedChance:0.24, leave:false, formal:true,  source:"simulation-uncertain-local-regime"},
  "イベリア":       {infection:"deny",        infectedChance:0,    leave:false, formal:true,  source:"simulation-inquisition-period-varies"},
  "シラクーザ":     {infection:"deny",        infectedChance:0,    leave:false, formal:true,  source:"simulation-family-employer-power"},
  "サルゴン":       {infection:"deny",        infectedChance:0,    leave:false, formal:true,  source:"simulation-uneven-institutions"},
  "カズデル":       {infection:"conditional", infectedChance:0.50, leave:false, formal:true,  source:"simulation-disrupted-education"},
  "サーミ":         {infection:"conditional", infectedChance:0.45, leave:false, formal:false, source:"simulation-clan-versus-settlement"},
  "リターニア":     {infection:"deny",        infectedChance:0,    leave:true,  formal:true,  source:"simulation-institutional-selectivity"},
  "イェラグ":       {infection:"conditional", infectedChance:0.38, leave:false, formal:true,  source:"simulation-regional-variation"},
  "レム・ビリトン": {infection:"deny",        infectedChance:0,    leave:true,  formal:true,  source:"simulation-mine-and-employment"},
  "ボリバル":       {infection:"deny",        infectedChance:0,    leave:false, formal:true,  source:"simulation-conflict-disruption"},
  "シエスタ":       {infection:"conditional", infectedChance:0.40, leave:true,  formal:true,  source:"simulation-mobile-city-schools"},
  "ミノス":         {infection:"conditional", infectedChance:0.42, leave:false, formal:true,  source:"simulation-unverified-school-practices"}
});
const EDUCATION_INSTITUTIONAL_REGIONS = Object.freeze(
  Object.keys(EDUCATION_REGION_PROFILES).filter(n=>EDUCATION_REGION_PROFILES[n].leave)
);
function educationRegionProfile(s) {
  return EDUCATION_REGION_PROFILES[s.res?.n] ||
    {infection:"conditional",infectedChance:0.3,leave:false,formal:false,source:"unverified-region-fallback"};
}
function educationLive(s) {
  return !!(s.educationPath && s.educationPath.status === "enrolled");
}
function educationFullTime(s) {
  return educationLive(s) && s.educationPath.mode !== "working";
}
function educationOccupied(s) {
  return educationLive(s) || s.educationPath?.status === "paused";
}
function educationSchoolOrDecision(s) {
  return educationFullTime(s) ||
    s.educationPath?.status === "paused" ||
    ["primary","upper-path","higher-path","graduation","funding","resume","transfer"].includes(s.educationDecision?.kind);
}
function educationHas(s, stage) {
  return !!s.educationPath?.completed?.includes(stage);
}
// A school recipient is the current school or the particular higher-course
// enrolment, never the neighborhood elementary school for a university.
function educationInstitutionRef(s, stage = s?.educationPath?.stage) {
  if(s?.educationPath?.stage===stage && s.educationPath.offeringId &&
     s.educationPath.institutionId)return s.educationPath.institutionId;
  if (["primary","lower","upper"].includes(stage))
    return typeof activeFacility === "function" ? activeFacility(s,"school")?.id || null : null;
  if (!["university","vocational","arts","preparatory"].includes(stage) ||
      s?.educationPath?.stage !== stage ||
      !["enrolled","paused"].includes(s.educationPath.status)) return null;
  const m=s.educationPath;
  return m.institutionId || [
    "course",s.res?.n || "unknown",s.local?.placeId || s.community?.key || "unknown",
    stage,m.tier,m.stageStartYear
  ].join(":");
}
function educationSchoolKnowsInfection(s, stage) {
  if (!s.inf || !s.fl?.dg || typeof infectionAwarenessEntries !== "function")
    return false;
  const siteId = educationInstitutionRef(s,stage);
  if (!siteId) return false;
  if(s.world?.educationWorld?.institutions?.[siteId])
    return educationRecipientInfectionKnowledge(s,{
      institutionId:siteId,recipientKind:"institution"
    }).status==="institution-confirmed";
  return infectionAwarenessEntries(s).some(row =>
    row.subject === "protagonist" &&
    row.audience === "school" &&
    row.certainty === "confirmed" && row.subjectMatch === "confirmed" &&
    row.region === s.res?.n &&
    (!row.placeId || row.placeId === s.local?.placeId) &&
    (!row.areaKey || row.areaKey === s.community?.key) &&
    row.recipientRef === siteId
  );
}
function educationBarrier(s, stage, tier = 1) {
  const region = s.res?.n || "", profile = educationRegionProfile(s),
    schoolKnows = educationSchoolKnowsInfection(s, stage),
    sarkaz = s.r?.n === "サルカズ",
    tara = region === "ヴィクトリア" &&
      s.culturalIdentity?.affiliation === "ターラー系",
    realOffering=s.educationPath?.stage===stage &&
      s.world?.educationWorld?.offerings?.[s.educationPath.offeringId],
    school = realOffering?
      (()=>{const status=educationSchoolStatusAt(s,realOffering.id,s.year,s.mo??0);
        return status?{id:realOffering.institutionId,
          status:status.teachingEquivalent<=0?"closed":
            status.teachingEquivalent<1?"strained":"open"}:null;})() :
      typeof activeFacility==="function"?activeFacility(s,"school"):null,
    basicSchool = ["primary","lower","upper"].includes(stage),
    clanSite = region === "サーミ" && s.local?.kind &&
      /氏族|遊牧|非定住/.test(s.local.kind);
  if (clanSite && basicSchool)
    return {allowed:false,chance:0,reason:"この氏族の生活圏に通える常設校は記録されていない",
      basis:"game-model-locality",profile:profile.source};
  if (basicSchool && (!school || ["limited","closed"].includes(school.status)))
    return {allowed:false,chance:0,reason:"通学可能な学校または受入枠がない",
      basis:"current-facility",profile:profile.source};
  // A medical diagnosis is not evidence that a particular school has learned it.
  // Institutional screening here is scoped to the named site/cohort, not a
  // nation-wide prohibition. Every number is a simulation assumption.
  const institutionKey = basicSchool && school?.id ?
    school.id : [region,stage,tier].join(":");
  const policyRoll = keyedRoll("education-infection-policy-v1:" +
    institutionKey + ":" + Math.floor(s.year / 20));
  const strictRefusal = schoolKnows && profile.infection === "deny" && policyRoll < 0.84;
  if (strictRefusal)
    return {allowed:false,chance:0,
      reason:"この学校・募集区分で、学校側に確認された感染を理由に受入れを断られた",
      basis:"game-model-site-policy",profile:profile.source};
  let chance = schoolKnows ?
    (profile.infection === "deny" ? 0.3 : profile.infectedChance) *
      (0.75 + 0.5 * policyRoll) : 1;
  // Documented ethnic hostility does not imply a universal 97.5% or 92%
  // national admissions ban. Institutions and periods may treat applicants
  // very differently; these numbers are game-model opportunity factors.
  const climateRoll = keyedRoll("education-identity-climate-v1:" +
    institutionKey + ":" + region + ":" + Math.floor(s.year / 8));
  if (sarkaz && region !== "カズデル")
    chance *= 0.16 + 0.70 * climateRoll;
  if (tara)
    chance *= 0.24 + 0.61 * climateRoll;
  if (tier >= 2 && s.legal?.status === "restricted" && s.legal?.basis)
    chance *= 0.6;
  if (tier >= 2 && s.socialClass?.originGroup === "displaced")
    chance *= 0.75;
  // The neighborhood primary school's status cannot stand in for a university campus.
  if (basicSchool && school && school.status === "strained")
    chance *= 0.75;
  if (basicSchool && (s.local?.access || 0) < 0.25)
    chance *= 0.7;
  if (["university","vocational","arts"].includes(stage) && tier >= 3)
    chance *= 0.85;
  return {allowed:true,chance:Math.min(1,Math.max(0,chance)),
    reason:chance<1 ? "学校側の受入れ、地域の身分・種族・感染者差別、交通の影響" : null,
    basis:"game-model-school-policy",profile:profile.source};
}
function educationFunds(s,stage,tier=1,offeringId=null) {
  const current=s.educationPath;
  const named=offeringId||(current?.stage===stage&&current.tier===tier?
    current.offeringId||null:null);
  return educationFinancePrice(s,stage,tier,named).amount;
}
function educationPaymentPlan(s, fee) {
  const requested=Math.max(0,fee||0),
    canUseHouse=!!s.house && (s.age<18 ||
      (typeof inSharedHousehold==="function" && inSharedHousehold(s))),
    houseCash=canUseHouse?Math.max(0,s.house.cash||0):0,
    ownCash=Math.max(0,s.cash||0);
  // Young children use caregiver funds first; adults use their own first.
  const first=s.age<18?Math.min(requested,houseCash):Math.min(requested,ownCash),
    second=s.age<18?Math.min(requested-first,ownCash):Math.min(requested-first,houseCash);
  return {allowed:first+second>=requested,
    household:s.age<18?first:second,personal:s.age<18?second:first,
    amount:requested};
}
function educationPayer(s, required = 0) {
  if(s.age < 18 && s.house && (s.house.cash||0)>=required)return s.house;
  if((s.cash || 0) >= required)return s;
  return s.house && typeof inSharedHousehold==="function" && inSharedHousehold(s) &&
    (s.house.cash || 0) >= required ? s.house : s;
}
function educationChargeFee(s,amount,stage,recordAnnual=true) {
  const m=s.educationPath,
    inSameCourse=recordAnnual&&m?.status==="enrolled"&&m.stage===stage;
  const invoice=inSameCourse
    ? educationEnsureTuitionInvoice(s,m,s.year)
    : educationEnsureInvoice(s,{
      id:["education-legacy",stage,s.year,
        typeof TRACE_RESOLUTION==="object"&&TRACE_RESOLUTION?.id||"annual",
        m?.stageStartYear||"new"].join(":"),
      kind:stage==="materials"?"school-materials":"tuition",
      institutionId:m?.institutionId||"legacy-school:"+s.res?.n+":"+stage,
      offeringId:m?.stage===stage?m.offeringId||null:null,
      amount:educationFinanceAmount(amount),serviceYear:s.year
    });
  if(invoice.net!==amount)return false;
  const receipt=educationSettleInvoice(s,invoice);
  if(!receipt)return false;
  if(recordAnnual)educationFinanceProjectInvoice(s,invoice);
  return true;
}
function educationCanEnter(s, stage, tier = 1) {
  const access = educationBarrier(s,stage,tier), fee = educationFunds(s,stage,tier),
    funds = educationPaymentPlan(s,fee);
  return {allowed:access.allowed && funds.allowed,
    chance:access.chance,fee,
    reason:access.allowed ? funds.allowed ? null : "家計・本人の学費負担を確保できない" : access.reason};
}
function educationExam(s, stage, tier = 1) {
  const hasQualification = educationHas(s,"upper") ||
    !!s.educationPath?.equivalency?.includes("upper");
  const access=educationBarrier(s,stage,tier),
    fee=educationFunds(s,stage,tier),examFee=Math.round(fee*0.06),
    funded=educationPaymentPlan(s,examFee),
    knowledge = Number(s.k || 0),
    literacy = Number.isFinite(s.socialLearning?.literacy) ? s.socialLearning.literacy : 0,
    arts = Number(s.ar || 0);
  const threshold = (stage === "university" ? 43 : stage === "arts" ? 27 : 25) + (tier - 1) * 22,
    aptitude = stage === "arts" ? arts * 0.7 + knowledge * 0.2 + literacy * 0.1 :
      knowledge * 0.67 + literacy * 0.33,
    // Large gaps should make success extremely unlikely; exceptional prepared
    // applicants pass with high probability, without an invented intelligence trait.
    examChance = Math.max(0.008,Math.min(0.985,0.5 + (aptitude - threshold) * 0.025));
  return {allowed:hasQualification && access.allowed && funded.allowed && !educationOccupied(s),
    chance:examChance * access.chance,fee,examFee,
    reason:!hasQualification ? "後期中等課程の修了、または正式な同等資格が必要" :
      educationOccupied(s) ? "在籍・休学中の課程を先に終える必要がある" :
      !funded.allowed?"受験料の支払手段が不足している":access.reason};
}
function educationAppendHistory(s,action,details = {}) {
  const model = s.educationPath;
  if (!model) return;
  model.history || (model.history=[]);
  model.history.push({year:s.year,age:s.age,action,...details});
  model.history=model.history.slice(-64);
}
function educationStart(s,stage,tier = 1,source = null) {
  const years=stage==="university"&&tier===1?3:EDUCATION_PROGRAMS[stage].years,
    previous = s.educationPath;
  s.educationPath={
    version:1, stage, tier, mode:stage==="preparatory"?"working":"full-time", status:"enrolled",
    startedYear:s.year, stageStartYear:s.year, lastProcessedYear:s.year,
    yearsCompleted:0, duration:years, fundedYear:s.year,
    completed:[...(previous?.completed || [])],
    equivalency:[...(previous?.equivalency || [])],
    history:[...(previous?.history || [])].slice(-60),sourceEventId:source
  };
  s.educationPath.institutionId = educationInstitutionRef(s,stage);
  if(stage === "arts" && typeof recordArtsFormalAdmissionAssessment === "function")
    recordArtsFormalAdmissionAssessment(s,source);
  educationAppendHistory(s,"enrolled",{stage,tier,source,
    schoolSiteId:s.educationPath.institutionId || null
  });
  s.educationDecision=null;
  // All full-time courses, not only universities, exclude concurrent regular work.
  if (stage !== "preparatory" && s.job > 0) {
    const previousJob = s.job;
    s.job = 0;
    s.workPayBonus = 0;
    s.fl.reduced_work = 0;
    s.reducedWorkStartedYear = null;
    if (typeof recordCareerChange === "function")
      recordCareerChange(s,previousJob,0,source || "full-time-enrollment");
  }
  if (["primary","lower","upper"].includes(stage)) {
    s.fl.sch=1;
    recordEducationTransition(s,"general-school","start",source);
  } else if(stage!=="preparatory") {
    s.fl.sch=0;
    const kind=stage==="university" ? "uni" : "voc";
    s.fl[kind+"_enrolled"]=1;
    if(stage==="arts")s.fl.arts_enrolled=1;
    s.study={kind,yearsPaid:1,nextDue:s.year+1,duration:years,educationManaged:true};
    recordEducationTransition(s, stage==="university"?"university":stage==="arts"?"arts-academy":"vocational","start",source);
    // Regular work was reconciled before applying the course flags.
  }else recordEducationTransition(s,"preparatory","start",source);
}
function educationEnd(s,outcome,reason,source=null) {
  const model=s.educationPath;
  if(!model || model.status!=="enrolled" && model.status!=="paused")return false;
  if(outcome==="completed" && model.stage==="preparatory" &&
     (!model.offeringId || !model.currentEnrollmentId ||
       model.completionAssessment?.passed!==true ||
       model.completionAssessment.enrollmentId!==model.currentEnrollmentId))
    return false;
  if(outcome==="completed" && model.offeringId){
    const enrollment=educationActiveEnrollment(s),
      credits=enrollment?educationTransferredCreditIds(s,enrollment.id):[],
      offering=s.world?.educationWorld?.offerings?.[model.offeringId];
    if(!enrollment||credits.length<model.duration||
       model.yearsCompleted<model.duration ||
       offering?.recognitionRule?.issuerBasis!=="game-model"){
      if(!s.educationDecision)s.educationDecision={kind:"graduation",year:s.year};
      return false;
    }
  }
  if(model.offeringId)
    educationSimulateAttendanceThrough(s,s.year,Math.max(0,(s.mo||0)-1));
  const program=model.stage;
  educationAppendHistory(s,outcome,{stage:program,reason,source});
  model.status=outcome;
  model.endedYear=s.year;
  if(outcome==="completed" && !model.completed.includes(program))model.completed.push(program);
  s.fl.sch=0;
  if(s.study){
    const kind=s.study.kind;
    s.fl[kind+"_enrolled"]=0;
    s.fl.arts_enrolled=0;
    if(outcome==="completed") {
      if(program==="university")s.fl.uni=1;
      else if(program==="vocational")s.fl.voc=1;
      else if(program==="arts")s.fl.arts_grad=1;
      recordEducationTransition(s,program==="university"?"university":program==="arts"?"arts-academy":"vocational","finish",source||"annual-education-completion");
    }else {
      recordEducationTransition(s,program==="university"?"university":program==="arts"?"arts-academy":"vocational","stop",source||"annual-education-withdrawal");
    }
    s.study=null;
  } else if(outcome==="completed" && (program==="lower" || program==="upper")){
    recordEducationTransition(s,"general-school","finish",source||"annual-school-completion");
  }else if(outcome!=="completed" && ["primary","lower","upper"].includes(program)){
    recordEducationTransition(s,"general-school","stop",source||"annual-school-withdrawal");
  }else if(program==="preparatory"){
    recordEducationTransition(s,"preparatory",outcome==="completed"?"finish":"stop",
      source||"formal-preparatory-closure");
  }
  if(educationAutoStage(s,program)){
    if(outcome==="completed")educationAutoMessage(s,(EDUCATION_CASE_STAGES[program]||"学校")+"を修了した。");
    else educationAutoMessage(s,(EDUCATION_CASE_STAGES[program]||"学校")+"での在籍が終了した。"+reason,true);
  }
  return true;
}
// Aid and credit fund the upcoming year; they do not award completed study immediately.
function educationRecordFundedYear(s,m,source,historyKind,details) {
  educationAppendHistory(s,historyKind,Object.assign({stage:m.stage},details||{}, {source}));
  m.fundedYear=s.year;
  m.lastProcessedYear=s.year;
  if(s.study){s.study.yearsPaid++;s.study.nextDue=s.year+1;}
  s.educationDecision=null;
}
function educationApplyAction(s,action) {
  if(typeof action==="string" && action.startsWith("legacy:teacher-"))
    return educationLegacyTeacherAction(s,action);
  if(typeof action==="string" && action.startsWith("event:"))
    return educationMigrationApply(s,action.slice(6));
  if(typeof action==="string" && action.startsWith("case:")) {
    educationCaseAction(s,action);
    return;
  }
  const source=typeof TRACE_RESOLUTION==="object" ? TRACE_RESOLUTION?.id : null;
  if(action==="primary"){
    const gate=educationCanEnter(s,"primary");
    if(!gate.allowed || R()>gate.chance){
      s.educationDecision=null;
      s.educationPath=s.educationPath||{version:1,status:"outside",completed:[],history:[]};
      educationAppendHistory(s,"admission-denied",{stage:"primary",reason:gate.reason||"学校側の受入拒否",source});
      s.fl.sch=0;
      if(typeof L==="function")L("初等課程への入学は認められなかった。"+(gate.reason||"学校側の選考・受入れで断られた。"));
      return;
    }
    educationStart(s,"primary",1,source);
    if(typeof L==="function")L("学校から入学が認められたと知らせが届いた。初等課程での通学が始まった。");
    return;
  }
  if(action==="denied-primary"){
    const barrier=educationBarrier(s,"primary");
    s.educationDecision=null;
    s.educationPath=s.educationPath||{version:1,status:"outside",completed:[],history:[]};
    educationAppendHistory(s,"institutional-refusal",{stage:"primary",reason:barrier.reason||"学校の受入拒否",source});
    s.fl.sch=0;return;
  }
  if(action==="decline-primary"){
    s.educationDecision=null;
    s.educationPath=s.educationPath||{version:1,status:"outside",completed:[],history:[]};
    educationAppendHistory(s,"family-deferral",{stage:"primary",reason:"家の手伝いと家計を優先",source});
    s.fl.sch=0;return;
  }
  if(action==="enter-upper"){
    const gate=educationCanEnter(s,"upper");
    if(gate.allowed && R()<=gate.chance && educationChargeFee(s,gate.fee,"upper")) {
      educationStart(s,"upper",1,source);
    }else {
      s.educationDecision=null;
      educationAppendHistory(s,"upper-admission-denied",{reason:gate.reason||"選考・受入れの結果",source});
    }
    return;
  }
  if(action==="start-preparatory"){
    if(!educationOccupied(s) && !educationHas(s,"upper"))
      educationCaseAction(s,"case:begin:reentry:preparatory:1");
    return;
  }
  if(action==="school-materials"){
    if(!educationLive(s) || !["primary","lower","upper"].includes(s.educationPath.stage))return;
    const amount=Math.round(3e4*(s.res?.pm||1)),plan=educationPaymentPlan(s,amount);
    if(educationChargeFee(s,amount,"materials",false))
      educationAppendHistory(s,"materials-purchased",{
        stage:s.educationPath.stage,amount,personal:plan.personal,household:plan.household,source
      });
    return;
  }
  if(action==="reenter-secondary"){
    const old=s.educationPath,stage=old?.stage;
    if(!old || !["lower","upper"].includes(stage) ||
       !["withdrawn","outside"].includes(old.status) || s.age>20)return;
    const gate=educationCanEnter(s,stage);
    if(!gate.allowed)return;
    if(R()<=gate.chance && educationChargeFee(s,gate.fee,stage))
      educationStart(s,stage,1,source);
    else educationAppendHistory(s,"reentry-denied",{stage,source,reason:gate.reason||"学校側の受入判断"});
    return;
  }
  if(action==="leave-secondary" || action==="leave-higher"){
    s.educationDecision=null;educationAppendHistory(s,"school-to-work",{source});return;
  }
  if(action==="funding-grant"){
    const m=s.educationPath;
    if(s.educationDecision?.kind!=="funding"||!m||m.status!=="enrolled"||
       !EDUCATION_INSTITUTIONAL_REGIONS.includes(s.res?.n))return;
    const invoice=educationEnsureTuitionInvoice(s,m),
      remaining=invoice.net-invoice.paid,
      plan=educationPaymentPlan(s,remaining),
      aid=Math.max(0,remaining-plan.personal-plan.household);
    if(plan.allowed||aid<=0)return;
    const id="grant:"+s.year+":"+invoice.id;
    const posting=educationSettleInvoice(s,invoice,{
      postingId:invoice.id+":grant-settlement",
      grant:{id,amount:aid,basis:"game-model-institutional-relief"}
    });
    if(!posting)return;
    educationFinanceProjectInvoice(s,invoice);
    educationRecordFundedYear(s,m,source,"aid-granted",{
      tuition:invoice.net,personal:plan.personal,household:plan.household,
      grant:aid,basis:"game-model-institutional-relief"
    });
    return;
  }
  if(action==="funding-loan"){
    const m=s.educationPath;
    if(s.educationDecision?.kind!=="funding"||!m||m.status!=="enrolled"||
       s.age<18||s.res?.n!=="クルビア"||typeof addLoanContract!=="function")return;
    const invoice=educationEnsureTuitionInvoice(s,m),
      remaining=invoice.net-invoice.paid,
      plan=educationPaymentPlan(s,remaining),
      principal=Math.max(0,remaining-plan.personal-plan.household);
    if(plan.allowed||principal<=0)return;
    const id="edu-loan:"+educationTuitionEnrollmentId(s,m)+":"+invoice.id;
    const posting=educationSettleInvoice(s,invoice,{
      postingId:invoice.id+":loan-settlement",
      loan:{id,amount:principal,creditor:"クルビア工業区の民間学費貸付人"}
    });
    if(!posting)return;
    educationFinanceProjectInvoice(s,invoice);
    educationRecordFundedYear(s,m,source,"education-credit-signed",{
      tuition:invoice.net,personal:plan.personal,household:plan.household,
      principal,totalDue:Math.round(principal*1.1),contractId:id
    });
    return;
  }
  if(action==="funding-pause"){
    if(s.educationPath?.status==="enrolled"){
      if(s.educationPath.offeringId)
        educationSimulateAttendanceThrough(s,s.year,Math.max(0,(s.mo||0)-1));
      s.educationPath.status="paused";
      if(s.study)s.study.suspended=true;
      s.educationPath.pauseYear=s.year;
      s.educationPath.fundedYear=null;
      educationAppendHistory(s,"paused",{reason:"学費不足",source});
    }
    s.educationDecision=null;return;
  }
  if(action==="funding-defer"){s.educationDecision=null;return;}
  if(action==="transfer-school"){
    if(s.educationDecision?.kind!=="transfer")return;
    const to=applySiteAction(s,{kind:"school",action:"switch"});
    educationAppendHistory(s,"transferred",{stage:s.educationPath.stage,siteId:to.id,source});
    s.educationDecision=null;return;
  }
  if(action==="transfer-leave"){
    if(s.educationDecision?.kind!=="transfer")return;
    educationEnd(s,"withdrawn","通学先の利用制限と転学断念",source);
    s.educationDecision=null;return;
  }
  if(action==="leave-school"){
    educationEnd(s,"withdrawn","学校生活の継続を断念した",source);
    s.educationDecision=null;return;
  }
  if(action==="funding-leave"){
    educationEnd(s,"withdrawn","学費負担の継続不能",source);
    s.educationDecision=null;return;
  }
  if(action==="funding-resume"){
    const m=s.educationPath;
    if(!m || m.status!=="paused") {s.educationDecision=null;return;}
    const fee=educationFunds(s,m.stage,m.tier,m.offeringId||null);
    if(m?.status==="paused" && educationBarrier(s,m.stage,m.tier).allowed &&
       educationChargeFee(s,fee,m.stage)){
      m.status="enrolled";m.lastProcessedYear=s.year;m.fundedYear=s.year;
      if(s.study){s.study.yearsPaid++;s.study.nextDue=s.year+1;}
      if(s.study)s.study.suspended=false;
      if(m.mode!=="working" && s.job>0){
        const previousJob=s.job;
        s.job=0;s.workPayBonus=0;s.fl.reduced_work=0;s.reducedWorkStartedYear=null;
        if(typeof recordCareerChange==="function")
          recordCareerChange(s,previousJob,0,source||"school-resumption");
      }
      educationAppendHistory(s,"resumed",{source,fee});
    }
    s.educationDecision=null;return;
  }
  if(action==="repeat"){
    if(s.educationPath?.status==="enrolled") {
      s.educationPath.duration++;
      if(s.study) s.study.duration++;
      s.educationPath.lastProcessedYear=s.year;
      educationAppendHistory(s,"repeat-year",{source});
      s.educationDecision=null;
      educationFundYear(s,s.educationPath);
    }
    return;
  }
  if(action==="withdraw"){
    educationEnd(s,"withdrawn","卒業審査後の退学",source);
    s.educationDecision=null;return;
  }
  if(action.startsWith("apply:")){
    const [,stage,t]=action.split(":"),tier=Number(t),
      exam=educationExam(s,stage,tier);
    if(!exam.allowed)return;
    const applicationId=["legacy-application",source||"unattributed",stage,tier,s.year].join(":"),
      invoice=educationEnsureInvoice(s,{
        id:applicationId+":exam:1",kind:"entrance-exam",
        applicationId,institutionId:"legacy-course:"+s.res?.n+":"+stage+":"+tier,
        amount:exam.examFee,serviceYear:s.year,
        policyId:"game-model-legacy-entrance-exam-v1"
      });
    // The identical fee is settled before selection. A failed examination
    // cannot defer payment until after seeing the result.
    if(!educationSettleInvoice(s,invoice))return;
    const admitted=R()<exam.chance;
    if(admitted){
      const funded=educationPaymentPlan(s,exam.fee).allowed;
      if(funded && educationChargeFee(s,exam.fee,stage)){
        educationStart(s,stage,tier,source);
        if(typeof L==="function")L("選考に合格し、学費を納付して"+
          (stage==="university"?"大学":stage==="arts"?"アーツ学院":"専門校")+
          "への入学が認められた。");
      }else{
        s.educationPath=s.educationPath||{version:1,status:"outside",completed:[],history:[]};
        educationAppendHistory(s,"accepted-not-enrolled",{
          stage,tier,applicationId,reason:"入学年度の学費未納",source
        });
        s.educationDecision=null;
        if(typeof L==="function")L("選考には通ったものの、入学年度の学費がそろわず、在籍の手続は成立しなかった。受験料の支払は記録に残った。");
      }
    }else{
      s.educationPath=s.educationPath||{version:1,status:"outside",completed:[],history:[]};
      educationAppendHistory(s,"exam-failed",{
        stage,tier,source,applicationId,examChance:exam.chance,examFee:exam.examFee
      });
      s.educationDecision=null;
      if(typeof L==="function")L("入学試験の結果は不合格だった。受験料は戻らず、学費は支払っていない。");
    }
    return;
  }
}
function educationEnforceAccess(s){
  const m=s.educationPath;
  if (!educationOccupied(s) || !m || !educationSchoolKnowsInfection(s,m.stage)) return;
  const access=educationBarrier(s,m.stage,m.tier);
  if (!access.allowed && ["game-model-site-policy", "current-facility", "game-model-locality"].includes(access.basis)) {
    educationAppendHistory(s,"school-infection-identified",{
      stage:m.stage,reason:access.reason,profile:access.profile
    });
    educationEnd(s,"withdrawn","この学校が感染を認知し、在籍継続を拒否した","school-infection-exclusion");
  }
}
function educationFundYear(s,m) {
  // Old diagnostic fixtures and incomplete school records may lack a real
  // defined course. Never bill or mark study funded for such a stage.
  if(!Object.hasOwn(EDUCATION_PROGRAMS,m.stage)){
    m.lastProcessedYear=s.year;
    return;
  }
  const invoice=educationEnsureTuitionInvoice(s,m,s.year);
  if(invoice.status==="void")return;
  if(invoice.outstanding>0){
    const posting=educationSettleInvoice(s,invoice);
    if(!posting){
      // Only regions with an actual institutional tuition-support pathway
      // can leave a funding decision pending. Else stop the enrollment.
      if(!EDUCATION_INSTITUTIONAL_REGIONS.includes(s.res?.n)){
        educationEnd(s,"withdrawn","学費不足による在籍終了","annual-finance");
        educationVoidInvoice(s,invoice.id,"enrollment-ended-unfunded");
        return;
      }
      s.educationDecision={kind:"funding",year:s.year,fee:invoice.outstanding,
        invoiceId:invoice.id};
      m.lastProcessedYear=s.year;
      return;
    }
  }
  if(invoice.status!=="paid")return;
  educationFinanceProjectInvoice(s,invoice);
  m.fundedYear=s.year;
  m.lastProcessedYear=s.year;
  if(s.study){s.study.yearsPaid++;s.study.nextDue=s.year+1;}
}

function educationAdvanceYear(s) {
  if(s.age===6 && !s.educationPath && !s.educationDecision)
    s.educationDecision={kind:"primary",year:s.year};
  educationEnforceAccess(s);
  const m=s.educationPath;
  if(!m || m.lastProcessedYear===s.year || s.dead)return;
  if(m.status==="paused") {
    if(s.year-m.pauseYear>=2){
      educationEnd(s,"withdrawn","休学期限に達した");
    }else if(!s.educationDecision){
      s.educationDecision={kind:"resume",year:s.year};
    }
    m.lastProcessedYear=s.year;return;
  }
  if(m.status!=="enrolled")return;
  const barrier=educationBarrier(s,m.stage,m.tier);
  if(["primary","lower","upper"].includes(m.stage) && !barrier.allowed) {
    if(barrier.basis==="current-facility" &&
       typeof alternativeFacility==="function" && alternativeFacility(s,"school")) {
      s.educationDecision={kind:"transfer",year:s.year};
      m.lastProcessedYear=s.year;
      educationAppendHistory(s,"transfer-offered",{stage:m.stage,reason:barrier.reason});
      return;
    }
    educationEnd(s,"withdrawn",barrier.reason||"通学可能な学校・受入枠が失われた",
      barrier.basis==="game-model-site-policy"?"school-infection-exclusion":"school-access-disruption");
    return;
  }
  if(m.stageStartYear===s.year)return;
  // Only a funded, uninterrupted previous year earns study credit. Calendar gaps do not.
  const credit=m.offeringId?educationCreditForPreviousYear(s):null;
  const recognized=m.offeringId?credit?.credited===true:m.fundedYear===s.year-1;
  if(recognized && m.lastCreditedYear!==s.year-1) {
    m.yearsCompleted++;
    m.lastCreditedYear=s.year-1;
    m.fundedYear=null;
    educationAppendHistory(s,"advanced",{stage:m.stage,yearsCompleted:m.yearsCompleted,
      creditId:credit?.id||null});
    // For actual school offerings the social learning subsystem owns skills:
    // a recognized year is a credential input, not another ability bonus.
    if(!m.offeringId){
      s.ep=Math.min(120,(s.ep||0)+(m.stage==="primary"?8:5));
      s.k=Math.min(100,(s.k||0)+(m.stage==="primary"?3:4));
      if(s.socialLearning && Number.isFinite(s.socialLearning.literacy))
        s.socialLearning.literacy=Math.min(100,s.socialLearning.literacy+(m.stage==="primary"?9:4));
    }
  } else if(m.offeringId && !recognized && credit && !s.educationDecision){
    const pending=educationCaseBegin(s,"interruption-review",m.stage,m.tier,"continuity");
    if(pending)educationAppendHistory(s,"credit-interrupted",{
      academicYear:s.year-1,creditId:credit.id,reason:credit.outcome});
  }
  m.lastProcessedYear=s.year;
  if(m.yearsCompleted>=m.duration){
    if(m.stage==="primary") {
      educationAppendHistory(s,"completed-stage",{stage:"primary"});
      if(m.offeringId) {
        if(!educationEnd(s,"completed","初等課程の履修を修了","annual-progression"))return;
        recordEducationTransition(s,"general-school","finish","annual-progression");
        s.educationDecision={kind:"lower-path",year:s.year};
        return;
      }
      if(!m.completed.includes("primary"))m.completed.push("primary");
      const lowerAccess=educationBarrier(s,"lower");
      if(!lowerAccess.allowed) {
        educationEnd(s,"withdrawn",lowerAccess.reason || "前期中等課程への進学先がない","annual-school-access");
        return;
      }
      const lowerFee=educationFunds(s,"lower");
      if(!educationChargeFee(s,lowerFee,"lower")){
        educationEnd(s,"withdrawn","前期中等課程の授業料を確保できない","annual-school-finance");
        return;
      }
      educationStart(s,"lower",1,"annual-progression");return;
    }
    if(m.stage==="lower"){
      if(!educationEnd(s,"completed","前期中等課程の年限を修了","annual-progression"))return;
      educationAppendHistory(s,"completed-stage",{stage:"lower"});
      s.educationDecision={kind:"upper-path",year:s.year};return;
    }
    if(m.stage==="upper"){
      if(!educationEnd(s,"completed","後期中等課程の年限を修了","annual-progression"))return;
      educationAppendHistory(s,"completed-stage",{stage:"upper"});
      s.educationDecision={kind:"higher-path",year:s.year};return;
    }
    const knowledge=s.k||0,lit=Number.isFinite(s.socialLearning?.literacy)?s.socialLearning.literacy:0,
      preparatoryReady=m.stage==="preparatory" ? knowledge>=48 && lit>=45 : true,
      artsReady=m.stage==="arts" ? (s.ar||0)>=30 : true,
      threshold=m.stage==="university" ? 45+(m.tier-1)*13 : 25+(m.tier-1)*10;
    if(knowledge>=threshold && lit>=35 && artsReady && preparatoryReady){
      if(m.stage==="preparatory"){
        const enrollment=educationActiveEnrollment(s);
        if(!enrollment || !m.offeringId ||
           enrollment.id!==m.currentEnrollmentId){
          s.educationDecision={kind:"graduation",year:s.year};
          return;
        }
        const evidenceRef=enrollment.id+":formal-completion-assessment:"+s.year;
        m.completionAssessment={evidenceRef,enrollmentId:enrollment.id,
          assessedAt:{year:s.year,month:s.mo||0},
          knowledge, literacy:lit,passed:true,
          basis:"game-model-formal-qualification-assessment",
          sourceCreditIds:educationTransferredCreditIds(s,enrollment.id)};
      }
      const completed=educationEnd(s,"completed",
        "年限・履修・修了評価を満たした","annual-progression");
      if(completed && m.stage==="preparatory" && !m.equivalency.includes("upper"))
        m.equivalency.push("upper");
    }else {
      s.educationDecision={kind:"graduation",year:s.year};
      m.lastProcessedYear=s.year;
    }
    return;
  }
  if(!s.educationDecision || s.educationDecision.kind!=="case-review"){
    educationFundYear(s,m);
    if(m.status==="enrolled"&&m.offeringId)educationRenewGuardianStudy(s);
  }
}
