/* P06/P16: one active admission case, verified information and bounded choices. */
const EDUCATION_CASE_PHASES = Object.freeze(["intent","planning","application","contract","continuity","resolved"]);
const EDUCATION_CASE_MAX_CHOICES = 3;
const EDUCATION_CASE_STAGES = Object.freeze({
  primary:"初等課程",lower:"前期中等課程",upper:"後期中等課程",
  preparatory:"同等資格の準備課程",university:"大学課程",
  vocational:"職業専門課程",arts:"アーツ専門学院"
});
const EDUCATION_CASE_TERMINALS = new Set([
  "admitted","continued","funded","resumed","transferred","paused","year-repeat",
  "completed","declined","nonformal-choice","no-candidate","candidate-unverified",
  "school-closed","recruitment-closed","no-reachable-route","no-guardian",
  "guardian-refused","no-funds","documents-missing","language-gate",
  "not-eligible","institution-refused","exam-failed","exam-cancelled",
  "accepted-not-enrolled","voluntary-defer","school-withdrawn","application-withdrawn",
  "year-expired","restricted-year","school-disrupted","no-class-credit",
  "deceased","precommit-stale","enrollment-conflict"
]);
function educationCasesState(s) {
  return s.educationCases ||= {version:1,sequence:0,activeCaseId:null,items:{},history:[]};
}
function educationAccessState(s) {
  return s.educationAccess ||= {
    version:1,knownOfferings:{},searches:[],applications:{},notices:{}
  };
}
function educationActiveCase(s) {
  const cases=s?.educationCases, id=cases?.activeCaseId;
  const item=id && cases.items?.[id];
  return item?.status==="active" ? item : null;
}
function educationCaseStep(s,caseItem,action,details={}) {
  if(caseItem.status!=="active"||caseItem.stepsUsed>=EDUCATION_CASE_MAX_CHOICES)
    return false;
  caseItem.stepsUsed++;
  caseItem.history.push({
    action,phase:caseItem.phase,at:{year:s.year,month:s.mo??0},
    ...details
  });
  return true;
}
function educationCaseFinish(s,caseItem,reason) {
  if(!EDUCATION_CASE_TERMINALS.has(reason))throw Error("不正な進路案件の終了理由");
  if(caseItem.status==="resolved")return caseItem;
  if(caseItem.status!=="active")throw Error("終了対象の進路案件がない");
  caseItem.status="resolved";
  caseItem.phase="resolved";
  caseItem.reason=reason;
  caseItem.endedAt={year:s.year,month:s.mo??0};
  caseItem.history.push({phase:"resolved",action:"close",reason,at:caseItem.endedAt});
  const root=educationCasesState(s);
  root.history.push({id:caseItem.id,kind:caseItem.kind,year:caseItem.year,
    stage:caseItem.stage,reason,endedAt:caseItem.endedAt,
    applicationId:caseItem.applicationId,offeringId:caseItem.offeringId,
    enrollmentId:caseItem.commit?.enrollmentId||null});
  root.history=root.history.slice(-64);
  if(root.activeCaseId===caseItem.id)root.activeCaseId=null;
  if(s.educationDecision?.caseId===caseItem.id)s.educationDecision=null;
  return caseItem;
}
function educationCaseBegin(s,kind,stage=null,tier=1,mode="entry") {
  const current=educationActiveCase(s);
  if(current)return current.kind===kind && current.year===s.year?current:null;
  if(!["primary","lower-path","upper-path","higher-path",
    "transfer","funding","resume","graduation","interruption-review","reentry"].includes(kind))
    throw Error("不明な進路案件の入口");
  const root=educationCasesState(s);
  const id="edu-case-"+(++root.sequence),now={year:s.year,month:s.mo??0};
  const item={
    version:1,id,year:s.year,kind,mode,stage,tier,
    phase:mode==="continuity"?"continuity":"intent",status:"active",
    originAreaId:s.local?.educationAreaId||null,
    targetInstitutionId:null,campusId:null,offeringId:null,applicationId:null,
    openedAt:now,deadlineYear:s.year,stepsUsed:0,reason:null,commit:null,
    history:[],evidence:{knownCandidateIds:[],routeQuoteId:null,
      fundingQuoteId:null,eligibilityReviewId:null,examResultId:null,admissionOfferId:null}
  };
  root.items[id]=item;root.activeCaseId=id;
  s.educationDecision={kind:"case-review",year:s.year,caseId:id};
  return item;
}
function educationCaseDiscover(s,scope="local") {
  const caseItem=educationActiveCase(s);
  if(!caseItem||caseItem.phase!=="planning")return [];
  const access=educationAccessState(s),world=s.world?.educationWorld;
  const own=s.local?.educationAreaId;
  if(!world?.areas?.[own])return [];
  const areaIds=scope==="adjacent" ?
    educationNeighborAreaIds(s,own) : [own];
  const unique=new Map();
  for(const areaId of areaIds)
    for(const offer of institutionOfferings(s,areaId,caseItem.stage))
      if((caseItem.stage==="university"||caseItem.stage==="vocational"||caseItem.stage==="arts") &&
        caseItem.tier!==offer.admissionTier)continue;
      else unique.set(offer.id,{offer,areaId});
  const found=[];
  for(const {offer,areaId} of unique.values()){
    const school=educationSchoolStatusAt(s,offer.id,s.year,s.mo??0);
    if(!school)continue;
    const row={
      offeringId:offer.id,institutionId:offer.institutionId,campusId:offer.campusId,
      areaId:world.campuses[offer.campusId].educationAreaId,
      searchedAreaId:areaId,stage:offer.stage,tier:offer.admissionTier,
      checkedAt:{year:s.year,month:s.mo??0},informationSource:"in-person-inquiry",
      epistemicStatus:"offering-verified",
      confirmedFields:["institution","campus","stage","admissionStatus"],
      admissionStatus:school.admissionStatus,teachingStatus:school.teachingStatus,
      tuitionEstimate:educationFunds(s,offer.stage,offer.admissionTier),
      estimateBasis:"game-model-current-quote"
    };
    access.knownOfferings[offer.id]=row;
    if(!caseItem.evidence.knownCandidateIds.includes(offer.id))
      caseItem.evidence.knownCandidateIds.push(offer.id);
    found.push(row);
  }
  access.searches.push({caseId:caseItem.id,stage:caseItem.stage,scope,
    areaIds:[...areaIds],checkedAt:{year:s.year,month:s.mo??0},
    foundIds:found.map(row=>row.offeringId),basis:"locality-inquiry"});
  access.searches=access.searches.slice(-48);
  return found;
}
function educationCaseCandidates(s) {
  const item=educationActiveCase(s),access=s?.educationAccess;
  if(!item || !access)return [];
  return item.evidence.knownCandidateIds
    .map(id=>access.knownOfferings?.[id])
    .filter(row=>row && row.epistemicStatus==="offering-verified" &&
      row.stage===item.stage &&
      (["university","vocational","arts"].includes(item.stage) ? row.tier===item.tier : true))
    .sort((a,b)=>{
      const origin=item.originAreaId;
      return (a.areaId===origin?0:1)-(b.areaId===origin?0:1) ||
        a.offeringId.localeCompare(b.offeringId);
    });
}
function educationCaseCandidate(s,index) {
  return educationCaseCandidates(s)[index]||null;
}
function educationCaseReasonText(s,index) {
  const status=educationCasePreflight(s,educationCaseCandidate(s,index));
  const codes={
    "candidate-not-searched":"学校について、まだ調べていない。",
    "candidate-not-verified":"候補校の募集内容を確かめていない。",
    "notice-stale":"募集案内を改めて確かめる必要がある。",
    "school-closed":"確認した校地で授業が休止している。",
    "recruitment-closed":"確認した学校は現在この課程を募集していない。",
    "no-reachable-route":"学校への通学手段が整っていない。",
    "escort-required":"付き添いを引き受ける人を確かめる必要がある。",
    "route-risk-unmitigated-minor":"未成年者が安全に通える付き添いが必要。",
    "no-funds":"出願に必要な費用が足りない。",
    "not-eligible":"この課程の出願資格を満たしていない。",
    "enrollment-conflict":"現在の学籍を先に整理する必要がある。"
  };
  return codes[status.reasonCodes[0]]||"応募条件を再確認する必要がある。";
}
function educationCaseCandidateLabel(s,index) {
  const row=educationCaseCandidate(s,index);
  if(!row)return "募集先を確認する";
  const area=s.world?.educationWorld?.areas?.[row.areaId];
  const site=area?.cityOrSettlementKey?.startsWith("city:")?
    area.cityOrSettlementKey.slice(5)+"・"+area.kind+"の学校" :
    area?.kind ? area.kind+"の学校" : "調べた地区の学校";
  return site+"の"+(EDUCATION_CASE_STAGES[row.stage]||"課程")+
    "（候補"+(index+1)+"）へ申し込む";
}
function educationCaseProofCurrent(s,row) {
  if(!row)return false;
  return row.checkedAt?.year===s.year &&
    row.checkedAt.month<=s.mo &&
    row.epistemicStatus==="offering-verified";
}
function educationCasePreflight(s,row) {
  const item=educationActiveCase(s);
  const fail=code=>({allowed:false,reasonCodes:[code],route:null,fee:null});
  if(!item||item.phase!=="planning"||!row)return fail("candidate-not-verified");
  if(!educationCaseProofCurrent(s,row))return fail("notice-stale");
  const world=s.world?.educationWorld,off=world?.offerings?.[row.offeringId];
  if(!off || off.institutionId!==row.institutionId ||
    off.campusId!==row.campusId || off.stage!==item.stage)return fail("candidate-not-verified");
  const status=educationSchoolStatusAt(s,row.offeringId,s.year,s.mo??0);
  if(!status||status.teachingStatus==="suspended"||status.campusStatus==="destroyed")
    return fail("school-closed");
  if(!["open","limited"].includes(status.admissionStatus))return fail("recruitment-closed");
  if(educationOccupied(s)||!!s.study)return fail("enrollment-conflict");
  const higher=["university","vocational","arts"].includes(item.stage);
  if(higher && !educationHas(s,"upper") &&
    !s.educationPath?.equivalency?.includes("upper"))return fail("not-eligible");
  if(item.stage==="lower" && !educationHas(s,"primary"))return fail("not-eligible");
  if(item.stage==="upper" && !educationHas(s,"lower"))return fail("not-eligible");
  if(item.stage==="primary"&&(s.age<6||s.age>14))return fail("not-eligible");
  const cost=educationFunds(s,off.stage,off.admissionTier),
    examFee=higher?Math.round(cost*0.06):0;
  if(!educationPaymentPlan(s,examFee).allowed)return fail("no-funds");
  const route=educationCanReach(s,{
    institutionId:off.institutionId,campusId:off.campusId,offeringId:off.id,
    year:s.year,month:s.mo??0,purpose:higher?"exam-visit":"daily-commute"
  });
  if(!route.reachable){
    const code=route.reasonCodes.find(x=>x==="escort-required"||
      x==="route-risk-unmitigated-minor")||"no-reachable-route";
    return {allowed:false,reasonCodes:[code],route,fee:examFee};
  }
  return {allowed:true,reasonCodes:[],route,fee:examFee,tuitionEstimate:cost};
}
function educationCaseAdmissionChance(s,row) {
  const higher=["university","vocational","arts"].includes(row.stage);
  const k=Number(s.k||0),
    lit=Number.isFinite(s.socialLearning?.literacy)?s.socialLearning.literacy:0,
    arts=Number(s.ar||0);
  if(!higher)return row.stage==="primary"?0.94:row.stage==="lower"?0.88:0.79;
  const threshold=(row.stage==="university"?43:row.stage==="arts"?27:25)+(row.tier-1)*22,
    aptitude=row.stage==="arts"?arts*0.7+k*0.2+lit*0.1:k*0.67+lit*0.33;
  return Math.max(0.008,Math.min(0.985,0.5+(aptitude-threshold)*0.025));
}
function educationCaseCharge(s,item,kind,amount) {
  s.educationFinance ||= {version:1,receipts:[]};
  const id=item.id+":"+kind;
  const prior=s.educationFinance.receipts.find(row=>row.id===id);
  if(prior)return prior;
  const plan=educationPaymentPlan(s,amount);
  if(!plan.allowed)return null;
  s.cash=(s.cash||0)-plan.personal;
  if(plan.household)s.house.cash-=plan.household;
  const receipt={id,caseId:item.id,applicationId:item.applicationId,
    kind,amount,personal:plan.personal,household:plan.household,
    settledAt:{year:s.year,month:s.mo??0},sourceKind:"game-model-school"};
  s.educationFinance.receipts.push(receipt);
  if(kind==="tuition")
    s.educationAnnualFee={year:s.year,stage:item.stage,amount,
      payer:plan.household===0?"personal":plan.personal===0?"household":"mixed",
      paidByPersonal:plan.personal,paidByHousehold:plan.household,receiptId:id};
  return receipt;
}
function educationCaseSelect(s,index) {
  const item=educationActiveCase(s);
  if(!item||item.phase!=="planning"||item.stepsUsed>=EDUCATION_CASE_MAX_CHOICES)return false;
  const row=educationCaseCandidate(s,index),
    assessment=educationCasePreflight(s,row);
  if(!assessment.allowed)return false;
  const world=s.world.educationWorld;
  item.phase="application";
  item.targetInstitutionId=row.institutionId;
  item.campusId=row.campusId;
  item.offeringId=row.offeringId;
  item.applicationId=item.id+":application:1";
  item.evidence.eligibilityReviewId=item.applicationId+":preflight";
  item.evidence.routeQuoteId=item.applicationId+":route";
  item.evidence.fundingQuoteId=item.applicationId+":estimate";
  if(!educationCaseStep(s,item,"select-eligible-candidate",{offeringId:row.offeringId,
    institutionId:row.institutionId,applicationId:item.applicationId}))return false;
  const high=["university","vocational","arts"].includes(item.stage);
  if(high && !educationCaseCharge(s,item,"exam",assessment.fee)){
    educationCaseFinish(s,item,"no-funds");return true;
  }
  const chance=educationCaseAdmissionChance(s,row),
    sample=educationDraw(world,item.applicationId,"school-admission-v1","result").value,
    accepted=sample<chance;
  const notice={
    applicationId:item.applicationId,caseId:item.id,offeringId:row.offeringId,
    informedAt:{year:s.year,month:s.mo??0},
    result:accepted?"accepted":high?"exam-failed":"not-accepted",
    reasonDisclosed:false,basis:"game-model-individual-selection"
  };
  educationAccessState(s).notices[item.applicationId]=notice;
  item.evidence.examResultId=high?item.applicationId+":exam-result":null;
  item.history.push({phase:"application",action:high?"exam-result":"admission-answer",
    at:notice.informedAt,accepted,noticeId:item.applicationId,
    sample,probability:chance});
  if(accepted){
    item.phase="contract";
    item.evidence.admissionOfferId=item.applicationId+":admission-offer";
  }else educationCaseFinish(s,item,high?"exam-failed":"institution-refused");
  return true;
}
function educationCaseCommitEligibility(s) {
  const item=educationActiveCase(s);
  if(!item||item.phase!=="contract"||item.stepsUsed>=EDUCATION_CASE_MAX_CHOICES)
    return {allowed:false,reason:"no-active-offer"};
  const notice=s.educationAccess?.notices?.[item.applicationId];
  if(notice?.result!=="accepted")return {allowed:false,reason:"offer-not-received"};
  const row=s.educationAccess?.knownOfferings?.[item.offeringId],world=s.world?.educationWorld;
  if(!row||!world?.offerings?.[item.offeringId] ||
    !educationCaseProofCurrent(s,row))return {allowed:false,reason:"notice-stale"};
  const status=educationSchoolStatusAt(s,item.offeringId,s.year,s.mo??0);
  if(!status||status.teachingStatus==="suspended" ||
    ["suspended","closed","full"].includes(status.admissionStatus))
    return {allowed:false,reason:"school-closed"};
  if(educationOccupied(s)||!!s.study)return {allowed:false,reason:"enrollment-conflict"};
  const route=educationCanReach(s,{institutionId:item.targetInstitutionId,
    campusId:item.campusId,offeringId:item.offeringId,year:s.year,month:s.mo??0,
    purpose:"daily-commute"});
  if(!route.reachable)return {allowed:false,reason:"no-reachable-route"};
  const tuition=educationFunds(s,item.stage,item.tier);
  if(!educationPaymentPlan(s,tuition).allowed)return {allowed:false,reason:"no-funds"};
  return {allowed:true,reason:null,tuition,route};
}
function educationCaseCommit(s) {
  const item=educationActiveCase(s),check=educationCaseCommitEligibility(s);
  if(!item||!check.allowed || !educationCaseStep(s,item,"commit-enrollment"))return false;
  const receipt=educationCaseCharge(s,item,"tuition",check.tuition);
  if(!receipt)throw Error("入学契約時の納付を確定できない");
  educationStart(s,item.stage,item.tier,item.applicationId);
  const m=s.educationPath;
  m.institutionId=item.targetInstitutionId;
  m.campusId=item.campusId;
  m.offeringId=item.offeringId;
  const enrolment=s.educationRecord?.enrollments?.at(-1);
  if(enrolment && enrolment.status==="enrolled"){
    enrolment.institutionId=item.targetInstitutionId;
    enrolment.campusId=item.campusId;
    enrolment.offeringId=item.offeringId;
  }
  item.commit={receiptId:receipt.id,institutionId:item.targetInstitutionId,
    campusId:item.campusId,offeringId:item.offeringId,
    enrollmentId:enrolment?.id||null,committedAt:{year:s.year,month:s.mo??0}};
  educationCaseFinish(s,item,"admitted");
  return true;
}
function educationCaseRequestGuardian(s,caseItem) {
  if(s.age>=18)return;
  const key=(s.care?.parentKeys||[]).find(x=>
    s.par?.[x]&&!s.par[x].d&&!s.par[x].separated);
  if(!key)return;
  const world=s.world?.educationWorld,origin=s.local?.educationAreaId;
  if(!world?.areas?.[origin])return;
  const offers=educationCaseCandidates(s);
  educationCreateMobilityState(s);
  for(const row of offers){
    const inst=row.institutionId;
    const allowed={year:s.year,month:s.mo??0};
    s.educationMobility.escortRecords[caseItem.id+":"+inst]={
      id:caseItem.id+":"+inst,personId:"protagonist",
      institutionId:inst,purpose:"daily-commute",
      escortPersonId:key,evidenceRef:caseItem.id+":family-escort",
      status:"verified",validFrom:allowed,validThrough:{year:s.year,month:12}
    };
    s.educationMobility.consentRecords[caseItem.id+":"+inst]={
      id:caseItem.id+":"+inst,personId:"protagonist",
      institutionId:inst,purpose:"daily-commute",
      consenterPersonId:key,evidenceRef:caseItem.id+":family-agreement",
      consentState:"granted",validFrom:allowed,validThrough:{year:s.year,month:12}
    };
  }
}
function educationCaseAction(s,action) {
  if(typeof action!=="string"||!action.startsWith("case:"))return false;
  const parts=action.split(":"),command=parts[1];
  if(command==="begin"){
    const kind=parts[2],stage=parts[3]||(
      kind==="primary"?"primary":kind==="lower-path"?"lower":kind==="upper-path"?"upper":null),
      tier=Number(parts[4]||1);
    if(!EDUCATION_CASE_STAGES[stage]||!Number.isInteger(tier)||tier<1||tier>3)return false;
    const item=educationCaseBegin(s,kind,stage,tier);
    if(!item||item.phase!=="intent")return false;
    if(!educationCaseStep(s,item,"express-interest"))return false;
    item.phase="planning";
    educationCaseDiscover(s,"local");
    educationCaseRequestGuardian(s,item);
    return true;
  }
  if(command==="decline"){
    const kind=parts[2]||"primary",stage=kind==="primary"?"primary":kind==="lower-path"?"lower":
      kind==="higher-path"?null:"upper";
    const item=educationCaseBegin(s,kind,stage);
    if(!item||!educationCaseStep(s,item,"decline"))return false;
    educationCaseFinish(s,item,"declined");return true;
  }
  const item=educationActiveCase(s);
  if(!item||item.deadlineYear!==s.year)return false;
  if(command==="select")return educationCaseSelect(s,Number(parts[2]));
  if(command==="commit")return educationCaseCommit(s);
  if(command==="defer"||command==="nonformal"){
    if(!educationCaseStep(s,item,command))return false;
    educationCaseFinish(s,item,command==="defer"?"voluntary-defer":"nonformal-choice");
    return true;
  }
  if(command==="search-adjacent"&&item.phase==="planning"){
    if(!educationCaseStep(s,item,command))return false;
    educationCaseDiscover(s,"adjacent");return true;
  }
  if(command==="decline-offer"&&item.phase==="contract"){
    if(!educationCaseStep(s,item,command))return false;
    educationCaseFinish(s,item,"accepted-not-enrolled");return true;
  }
  if(command==="pause"&&item.phase==="continuity"){
    if(!educationCaseStep(s,item,command))return false;
    if(s.educationPath?.status==="enrolled"){
      s.educationPath.status="paused";s.educationPath.pauseYear=s.year;
      if(s.study)s.study.suspended=true;
      educationAppendHistory(s,"paused",{reason:"本人の年度内判断"});
    }
    educationCaseFinish(s,item,"paused");return true;
  }
  if(command==="withdraw"&&item.phase==="continuity"){
    if(!educationCaseStep(s,item,command))return false;
    educationEnd(s,"withdrawn","本人の進路再検討","education-case");
    educationCaseFinish(s,item,"school-withdrawn");return true;
  }
  if(command==="keep-current"&&item.phase==="continuity"){
    if(!educationCaseStep(s,item,command))return false;
    educationCaseFinish(s,item,"continued");return true;
  }
  return false;
}
function educationExpireCases(s,nextYear) {
  const item=educationActiveCase(s);
  if(item && nextYear>item.deadlineYear)educationCaseFinish(s,item,"year-expired");
}
function educationCaseNeedsReview(s) {
  const item=educationActiveCase(s);
  return !!item && item.deadlineYear===s.year &&
    item.stepsUsed<EDUCATION_CASE_MAX_CHOICES &&
    ["planning","contract","continuity"].includes(item.phase);
}
function educationCasePresentation(s) {
  const item=educationActiveCase(s);
  if(!item)return "";
  const stage=EDUCATION_CASE_STAGES[item.stage]||"進路";
  const scope=s.educationAccess?.searches?.filter(x=>x.caseId===item.id)||[];
  const rows=educationCaseCandidates(s);
  const known=scope.length ? rows.length+
    "件の候補を調べた範囲で確認（最新照会："+scope.at(-1).checkedAt.year+"年）" :
    "まだ調べていない";
  const phase={
    intent:"進路の希望",planning:"募集先の確認",application:"申請の確認",
    contract:"入学手続",continuity:"在籍の継続",resolved:"今年の判断終了"
  }[item.phase]||"進路";
  const quote=item.phase==="contract"&&item.offeringId?
    educationFunds(s,item.stage,item.tier):null;
  const details=rows.slice(0,3).map((row,index)=>
    "\n"+(index+1)+". "+educationCaseCandidateLabel(s,index)+
    "・募集："+(row.admissionStatus==="open"?"受付中":
      row.admissionStatus==="limited"?"受付制限あり":"募集停止")).join("");
  return "\n"+stage+"／"+phase+
    "\n調べた募集先："+known+details+
    (quote!==null?"\n入学時の授業料概算："+Math.round(quote).toLocaleString()+"龍門幣":"")+
    "\n今年の進路判断："+item.stepsUsed+"/"+EDUCATION_CASE_MAX_CHOICES+"回";
}
function educationCaseReserveSlots(s) {
  const item=educationActiveCase(s);
  if(!item || !Array.isArray(s.q) || !educationCaseNeedsReview(s))return;
  const ceiling=P("events.slotPlacementCeiling"),
    future=new Set(s.q.map(q=>Math.floor(q*CALENDAR_MONTHS)+1).filter(month=>month>s.mo));
  const needed=Math.max(0,EDUCATION_CASE_MAX_CHOICES-item.stepsUsed-future.size);
  let left=needed;
  for(let month=s.mo+1;month<=CALENDAR_MONTHS&&left>0;month++){
    const position=(month-0.5)/CALENDAR_MONTHS;
    if(future.has(month)||position>=ceiling)continue;
    s.q.push(position);future.add(month);left--;
  }
  s.q.sort((a,b)=>a-b);
}
