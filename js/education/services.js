/* I07: school desk interactions. Policies below belong to individual generated
 * providers in this save; they are game assumptions, never national law.
 * Inquiry cannot enroll, pay, award, disclose a diagnosis, or consume life RNG. */
function educationServiceContext(s) {
  const item=educationActiveCase(s),current=educationMigrationCurrent(s);
  return {item,current,offers:item?educationCaseCandidates(s):[],
    world:s.world?.educationWorld,at:{year:s.year,month:s.mo}};
}
function educationServiceLedger(s) {
  return s.educationServices ||= {version:1,inquiries:{},replies:{}};
}
function educationServicePolicy(s,offeringId) {
  const w=s.world?.educationWorld,o=w?.offerings?.[offeringId];
  if(!o)return null;
  const school=w.institutions[o.institutionId];
  // Configuration is fixed per offering, independently of the applicant's cash.
  return school.servicePolicies?.[o.id] || {
    basis:"game-model-individual-provider",evidenceRef:o.id+":service-policy:v1",
    stepFree:educationDraw(w,o.id,"school-services-v1","step-free").value<0.65,
    dormAvailable:educationDraw(w,o.id,"school-services-v1","dorm").value<0.45,
    libraryPublic:educationDraw(w,o.id,"school-services-v1","library").value<0.5,
    scheduleFlexible:educationDraw(w,o.id,"school-services-v1","schedule").value<0.5,
    appealsAvailable:educationDraw(w,o.id,"school-services-v1","appeal").value<0.5,
    commuteSupport:EDUCATION_INSTITUTIONAL_REGIONS.includes(s.world.educationWorld.areas[s.world.educationWorld.campuses[o.campusId].educationAreaId].regionKey)&&
      educationDraw(w,o.id,"school-services-v1","commute-support").value<0.32,
    equipmentAvailable:educationDraw(w,o.id,"school-services-v1","equipment").value<0.65,
    // Explicit provider quotes, using the P07 12,000 commute example.
    commuteAnnual:Math.round(12000*(s.priceIndex||1)),
    roomMonthly:Math.round(3000*(s.priceIndex||1)),
    foodMonthly:Math.round(2000*(s.priceIndex||1))
  };
}
function educationServiceExperience(s,current,tag,sourceId,extra={}) {
  if(!current)return null;
  s.educationSchoolExperiences ||= {version:1,items:{}};
  const id=current.enroll.id+":"+tag+":"+s.year;
  return s.educationSchoolExperiences.items[id] ||= {
    id,institutionId:current.m.institutionId,offeringId:current.offering.id,
    enrollmentId:current.enroll.id,experienceTag:tag,status:"verified",
    year:s.year,month:s.mo,evidenceRef:sourceId,...extra
  };
}
function educationServiceWitness(s,reviewId,evidenceRef) {
  s.educationSceneEvidence ||= {version:1,items:{}};
  const id=reviewId+":"+s.local.educationAreaId+":"+s.year+":"+s.mo;
  return s.educationSceneEvidence.items[id] ||= {id,reviewId,status:"verified",
    areaId:s.local.educationAreaId,year:s.year,month:s.mo,evidenceRef};
}
function educationServiceInquiry(s) {
  if(!s||s.dead||s.mo<1||s.mo>12)return false;
  const {item,current,offers,world,at}=educationServiceContext(s);
  if(!world||!item&&!current)return false;
  const scope=item?.id||current.enroll.id,id=scope+":desk:"+s.year+":"+s.mo,
    ledger=educationServiceLedger(s);
  const firstInquiry=!ledger.inquiries[id];
  const mob=educationCreateMobilityState(s),known=offers.length?offers:
    current?[{offeringId:current.offering.id,campusId:current.m.campusId,
      institutionId:current.m.institutionId}]:[];
  for(const row of known){
    const o=world.offerings[row.offeringId],campus=world.campuses[o.campusId],
      policy=educationServicePolicy(s,o.id),school=world.institutions[o.institutionId];
    school.servicePolicies ||= {};school.servicePolicies[o.id] ||= policy;
    const route=educationFindRoute(s,{originAreaId:s.local.educationAreaId,
      campusAreaId:campus.educationAreaId,year:s.year,month:s.mo});
    if(current?.offering.id===o.id && campus.educationAreaId!==s.local.educationAreaId){
      educationServiceExperience(s,current,"paid-commute-quote",id,{amount:policy.commuteAnnual});
      if((route.outboundMinutes||0)>35)educationServiceExperience(s,current,"long-commute",id);
    }
    if(campus.educationAreaId!==s.local.educationAreaId &&
       ["lower","upper","preparatory","vocational","university","arts"].includes(o.stage)){
      const offerId=scope+":"+o.id+":dorm:"+s.year;
      mob.residenceOffers[offerId] ||= {id:offerId,personId:"protagonist",
        offeringId:o.id,campusId:o.campusId,areaId:campus.educationAreaId,
        providerId:o.institutionId,approved:policy.dormAvailable,
        capacityRemaining:policy.dormAvailable?1:0,responsibleAdultId:o.institutionId+":warden",
        overnightSupervisionConfirmed:true,evidenceRef:id+":dorm-reply",
        feeSchedule:{"boarding-room":policy.roomMonthly,"boarding-food":policy.foodMonthly},
        start:at,end:{year:s.year,month:12},basis:policy.basis};
    }
    if(item){
      if(o.requiredDocuments?.some(kind=>!s.educationDocuments?.some(x=>
        x.kind===kind&&x.personId==="protagonist"&&x.status==="verified")))
        educationServiceWitness(s,"E32",id+":"+o.id+":document-requirements");
      const link=Object.values(world.transportLinks||{}).find(x=>
        x.endpointAreaIds?.includes(item.originAreaId)&&x.endpointAreaIds.includes(campus.educationAreaId));
      const dest=world.areas[campus.educationAreaId];
      if(link&&dest.regionKey!==s.res.n){
        s.educationTravelRequirements ||= {version:1,items:{}};
        const key=item.id+":"+link.id;
        s.educationTravelRequirements.items[key] ||= {id:key,personId:"protagonist",
          caseId:item.id,offeringId:o.id,routeId:link.id,fromRegion:s.res.n,toRegion:dest.regionKey,
          status:"verified",authorityId:link.id+":travel-desk",permitKind:"individual-route-clearance",
          policyRef:policy.evidenceRef,evidenceRef:id+":route-requirements",at,
          basis:"game-model-route-specific-not-national-law"};
      }
      const employer=(s.lifeRecord?.affiliations||[]).find(x=>x.kind==="employer"&&
        ["active","crisis"].includes(x.status));
      if(s.job>0&&employer&&row.tuitionEstimate>0){
        s.educationEmployerPrograms ||= {version:1,items:{}};
        const key=item.id+":"+employer.id+":"+o.id,providerId=employer.id+":training:"+s.local.educationAreaId;
        if(!world.informalProviders?.[providerId])educationRegisterInformalProvider(s,{
          providerId,organizationId:employer.id,kind:"corporate-training",areaId:s.local.educationAreaId,
          activeFrom:at,subjectIds:["technical","safety"],evidenceRef:id+":employer-inquiry"});
        s.educationEmployerPrograms.items[key] ||= {id:key,personId:"protagonist",caseId:item.id,
          offeringId:o.id,employerId:employer.id,providerId,jobId:s.job,status:"verified",
          maxContribution:Math.round(row.tuitionEstimate*0.25),
          policyRef:key+":individual-program",evidenceRef:id+":employer-reply",
          basis:"game-model-individual-employer",at};
      }
    }
  }
  if(current){
    const route=educationCanReach(s,{institutionId:current.m.institutionId,
      campusId:current.m.campusId,offeringId:current.offering.id,year:s.year,month:s.mo});
    if(route.reasonCodes.some(x=>["route-suspended","no-active-link","no-return-service"].includes(x)))
      educationServiceWitness(s,"E14",id+":route-service-reply");
    if(route.reasonCodes.some(x=>/risk|danger|unsafe/.test(x)))
      educationServiceWitness(s,"E15",id+":route-safety-reply");
    const episode=(s.mortality?.episodes||[]).find(x=>x.status==="active"&&x.kind==="injury"&&x.severity>=3),
      needs=Array.isArray(s.accessibilityNeeds)?s.accessibilityNeeds:episode?["step-free"]:[];
    if(needs.length && educationServicePolicy(s,current.offering.id).stepFree===false){
      mob.accessibilityProfiles ||= {};
      mob.accessibilityProfiles[current.enroll.id] ||= {id:current.enroll.id+":needs",
        enrollmentId:current.enroll.id,institutionId:current.m.institutionId,
        offeringId:current.offering.id,needs:[...needs],status:"verified",
        evidenceRef:episode?.id||id+":learner-needs",basis:"individual-consultation"};
      educationServiceExperience(s,current,"accessibility-barrier",id);
    }
  }
  ledger.inquiries[id]={id,scope,at,offeringIds:known.map(x=>x.offeringId),basis:"actual-desk-inquiry"};
  if(firstInquiry&&typeof L==="function")L("学校の窓口で、通学や住まい、利用できる支援の条件を確かめた。申込みや支払いは、条件を読んでから決める。");
  return true;
}
function educationServiceMobilityQuote(s,current,kind) {
  const o=current?.offering;if(!o)return {allowed:false};
  const policy=educationServicePolicy(s,o.id),campus=s.world.educationWorld.campuses[o.campusId],
    route=educationCanReach(s,{institutionId:o.institutionId,campusId:o.campusId,offeringId:o.id,
      purpose:kind==="entrance-trip"?"exam-visit":kind==="relocation"?"boarding-move":"daily-commute",year:s.year,month:s.mo});
  const amount=campus.educationAreaId===educationResolvePersonLocation(s)?.areaId?0:
    kind==="entrance-trip"||kind==="relocation"?
      ((route.basisRefs||[]).reduce((sum,id)=>sum+(s.world.educationWorld.transportLinks[id]?.studyTravelFare||0),0)||
        Math.round(policy.commuteAnnual/12))*(kind==="entrance-trip"?2:1):policy.commuteAnnual;
  return {allowed:route.reachable&&educationPaymentPlan(s,amount).allowed,amount,route};
}
function educationServicePayMobility(s,current,kind,sources={}) {
  const o=current?.offering;if(!o)return null;
  const policy=educationServicePolicy(s,o.id),mob=educationCreateMobilityState(s),
    campus=s.world.educationWorld.campuses[o.campusId],route=educationCanReach(s,{
      institutionId:o.institutionId,campusId:o.campusId,offeringId:o.id,
      purpose:kind==="entrance-trip"?"exam-visit":kind==="relocation"?"boarding-move":"daily-commute",year:s.year,month:s.mo});
  if(!route.reachable)return null;
  const amount=campus.educationAreaId===educationResolvePersonLocation(s)?.areaId?0:
      kind==="entrance-trip"||kind==="relocation"?
      ((route.basisRefs||[]).reduce((sum,id)=>sum+(s.world.educationWorld.transportLinks[id]?.studyTravelFare||0),0)||
        Math.round(policy.commuteAnnual/12))*(kind==="entrance-trip"?2:1):policy.commuteAnnual,
    id=(current.enroll?.id||current.item?.applicationId)+":"+kind+":"+s.year;
  const previous=s.educationFinance?.postings?.[id+":"+kind+":cash-settlement"];
  if(previous)return previous;
  if(!educationPaymentPlan(s,Math.max(0,amount-(sources.grant?.amount||0))).allowed)return null;
  mob.transportTransactions[id] ||= {id,kind,year:s.year,month:s.mo,
    personId:"protagonist",providerId:o.campusId+":transport",amount,
    status:"confirmed",evidenceRef:id+":signed-service",offeringId:o.id};
  const invoice=educationEnsureVerifiedMobilityInvoice(s,{kind,transactionId:id,year:s.year,month:s.mo});
  invoice.offeringId=o.id;invoice.enrollmentId=current.enroll?.id||null;
  return educationSettleInvoice(s,invoice,sources);
}
function educationServiceBoard(s,current) {
  const {item,world}=educationServiceContext(s),offeringId=item?.offeringId||current?.offering.id,
    mob=educationCreateMobilityState(s),offer=Object.values(mob.residenceOffers).find(x=>
      x.offeringId===offeringId && x.approved && x.capacityRemaining>0);
  const existing=Object.values(mob.residenceContracts).find(x=>x.offeringId===offeringId&&
    x.status==="committed"&&educationResidenceContractMonth(x,s.year,s.mo));
  if(existing)return existing;
  if(!offer||s.age<12)return null;
  const o=world.offerings[offeringId];
  if(s.age<18 && educationGuardianReview(s,"protagonist","boarding-move",o.institutionId,s.year,s.mo).guardianConsentStatus!=="granted")
    educationCaseGuardianResponse(s,item||{id:current.enroll.id,history:[]},
      {institutionId:o.institutionId},["boarding-move"]);
  const check=educationCanReach(s,{institutionId:o.institutionId,
    campusId:o.campusId,offeringId:o.id,purpose:"boarding-move",residenceOfferId:offer.id,
    year:s.year,month:s.mo});
  if(!check.reachable)return null;
  const journey=educationServiceMobilityQuote(s,{offering:o},"relocation"),
    amount=offer.feeSchedule["boarding-room"]+offer.feeSchedule["boarding-food"]+journey.amount;
  if(!educationPaymentPlan(s,amount).allowed)return null;
  const id=offer.id+":contract";
  if(mob.residenceContracts[id])return mob.residenceContracts[id];
  // All prerequisites precede the atomic wallet/residence commit.
  const before={cash:s.cash,houseCash:s.house?.cash,finance:educationFinanceClone(s.educationFinance||null),mobility:educationFinanceClone(mob)};
  const contract={...offer,id,status:"committed",lodgingKind:"institution-dormitory",
    actualAreaId:offer.areaId,previousHomeRef:s.local.educationAreaId,
    householdRemainsAtOrigin:true,start:{year:s.year,month:s.mo},evidenceRef:id+":signed"};
  mob.residenceContracts[id]=contract;
  try{
    const travelId=id+":relocation";
    mob.transportTransactions[travelId]={id:travelId,kind:"relocation",year:s.year,month:s.mo,
      status:"confirmed",personId:"protagonist",providerId:o.campusId+":travel",amount:journey.amount,
      evidenceRef:travelId+":signed",moveTransactionId:travelId};
    const trip=educationEnsureVerifiedMobilityInvoice(s,{kind:"relocation",transactionId:travelId,year:s.year,month:s.mo});
    trip.offeringId=o.id;
    if(!educationSettleInvoice(s,trip))throw Error("relocation-payment");
    for(const kind of ["boarding-room","boarding-food"])
      if(!educationSettleVerifiedMobility(s,{kind,residenceContractId:id,year:s.year,month:s.mo}))throw Error("boarding-payment");
    offer.capacityRemaining--;return contract;
  }catch(error){
    delete mob.residenceContracts[id];s.cash=before.cash;if(s.house)s.house.cash=before.houseCash;
    s.educationFinance=before.finance;s.educationMobility=before.mobility;return null;
  }
}
function educationServiceReply(s,review,letter,index,source) {
  if(!source)return null;
  const id=review+":"+letter+":"+source,
    ledger=educationServiceLedger(s);
  return ledger.replies[id] ||= {id,review,letter,index,evidenceRef:source,
    at:{year:s.year,month:s.mo},basis:"resolved-school-service"};
}
function educationServiceSceneAction(s,review,letter) {
  const {item,current,offers,world}=educationServiceContext(s);
  let index=null,source=null;
  if(letter==="A"&&review==="E03"){
    const row=offers[0];if(row){
      educationCaseGuardianResponse(s,item,row);
      const route=educationCanReach(s,{...row,year:s.year,month:s.mo});
      if(!route.reachable){index=0;source=item.id+":guardian-response";}
    }
  }
  if(letter==="A"&&review==="E13"){
    const paid=educationServicePayMobility(s,current,"commute-pass");
    if(paid){index=0;source=paid.id;educationServiceExperience(s,current,"paid-commute-pass",paid.id);}
  }
  if(review==="E38"&&letter==="B"&&current){
    const continuity=item||educationCaseBegin(s,"interruption-review",current.m.stage,current.m.tier,"continuity");
    const paused=continuity&&educationCaseAction(s,"case:pause");
    index=paused?0:1;source=(continuity?.id||current.enroll.id)+":leave-response";
  }
  if(review==="E40"&&letter==="A"&&current){
    const rows=s.educationAttendance?.enrollments?.[current.enroll.id]?.[s.year]||{};
    if(!rows[s.mo])educationRecordAttendance(s,{enrollmentId:current.enroll.id,
      placementId:s.educationPlacements.currentPlacementId,year:s.year,month:s.mo,
      personalAccess:1,evidenceRef:current.enroll.id+":temporary-class:"+s.year+":"+s.mo});
  }
  if(review==="E28"&&letter==="A"&&item?.phase==="contract"){
    educationCaseFinanceInquiry(s);
    if(!s.educationAccess.financingOffers[item.id].loan){index=1;source=item.id+":loan-refused";}
  }
  if(letter==="A"&&review==="E17"){
    const contract=educationServiceBoard(s,current);
    if(!contract){index=0;source=(item?.id||current?.enroll.id)+":boarding-incomplete";}
  }
  if(review==="E25"&&item?.phase==="application"){
    if(letter==="A"){
      if(item.examAt && s.year*12+s.mo<item.examAt.year*12+item.examAt.month)return null;
      const o=world.offerings[item.offeringId],paid=educationServicePayMobility(s,{offering:o,item},"entrance-trip");
      index=paid?0:1;source=paid?.id||item.applicationId+":journey-unavailable";
      if(paid)item.examAttendedAt ||= {year:s.year,month:s.mo};
    }else educationCaseCancelApplication(s,item,"application-withdrawn");
  }
  if(letter==="A"&&review==="E29"){
    const policy=educationServicePolicy(s,current.offering.id),
      grant=policy.commuteSupport?{id:current.enroll.id+":commute-support:"+s.year,
        amount:policy.commuteAnnual,basis:policy.evidenceRef}:null;
    const paid=grant?educationServicePayMobility(s,current,"commute-pass",{grant}):null;
    index=paid?0:1;source=paid?.id||(current?.enroll.id+":no-commute-funding");
  }
  if(letter==="A"&&review==="E30"){
    const row=offers.find(x=>x.tuitionEstimate>0);
    if(row){const guardian=educationCaseKnownGuardian(s),
      consent=s.age<18?educationCaseGuardianResponse(s,item,row):
        guardian&&inSharedHousehold(s)?(educationDraw(world,item.id,
          "family-contribution-v1","response").value<0.78?"granted":"refused"):"unconfirmed",
      plan=educationPaymentPlan(s,row.tuitionEstimate);
      index=consent==="granted"&&plan.allowed?0:1;source=item.id+":family-contribution-review";
      item.evidence.familyContribution={status:index===0?"agreed":"pending",
        payerPersonId:educationCaseKnownGuardian(s)?.personId||null,
        offeringId:row.offeringId,amount:row.tuitionEstimate,at:{year:s.year,month:s.mo}};
    }
  }
  if(letter==="A"&&["E31","E33","E45","E64"].includes(review)){
    const refusal=review==="E33"?"institution-refused":review==="E45"?"guardian-refused":null,
      past=refusal?(s.educationCases?.history||[]).filter(x=>x.reason===refusal).at(-1):null,
      o=world.offerings[past?.offeringId||item?.offeringId||offers[0]?.offeringId||current?.offering.id];
    if(o){const policy=educationServicePolicy(s,o.id);
      if(review==="E31"){
        const employer=(s.lifeRecord?.affiliations||[]).find(x=>x.kind==="employer"&&["active","crisis"].includes(x.status));
        index=policy.scheduleFlexible&&!!employer?0:1;
        s.educationWorkArrangements ||= {};
        s.educationWorkArrangements[item.id]={caseId:item.id,offeringId:o.id,jobId:s.job,
          status:index===0?"approved":"refused",evidenceRef:policy.evidenceRef,at:{year:s.year,month:s.mo}};
      }
      if(review==="E33"){index=policy.appealsAvailable?0:1;
        const notice=s.educationAccess?.notices?.[past?.applicationId];
        if(notice){notice.reasonDisclosed=index===0;notice.appealMethod=index===0?"institution-desk":null;
          notice.responseEvidenceRef=policy.evidenceRef;}
      }
      if(review==="E64")index=policy.libraryPublic?0:1;
      if(review==="E45"){
        const previous=(s.educationCases?.history||[]).filter(x=>x.reason==="guardian-refused").at(-1),
          closed=s.educationCases?.items?.[previous?.id];
        if(closed){
          const request={id:closed.id+":reconsider:"+s.year,history:closed.history};
          index=educationCaseGuardianResponse(s,request,{institutionId:o.institutionId})==="granted"?0:1;
          if(index===0&&!educationActiveCase(s)){
            const next=educationCaseBegin(s,closed.kind,closed.stage,closed.tier);
            educationCaseStep(s,next,"reconsider-interest");next.phase="planning";educationCaseDiscover(s,"local");
          }
        }
      }
      source=policy.evidenceRef+":"+review+":"+s.year;
    }
  }
  if(review==="E61"&&letter==="B"){
    if(item?.phase==="planning")educationCaseAction(s,"case:nonformal");
    index=0;source=(item?.id||s.local.educationAreaId)+":alternative-inquiry:"+s.year;
  }
  return index===null?null:educationServiceReply(s,review,letter,index,source);
}
function educationServiceTick(s) {
  if(!s||s.dead||!s.world?.educationWorld)return;
  const {current,item,world}=educationServiceContext(s),at={year:s.year,month:s.mo};
  if(item?.phase==="application"){
    const state=educationSchoolStatusAt(s,item.offeringId,s.year,s.mo);
    if(!item.examAttendedAt&&(!state||!["open","limited"].includes(state.admissionStatus)))
      educationCaseCancelApplication(s,item,"exam-cancelled");
    else if(item.examAttendedAt&&item.examAttendedAt.year*12+item.examAttendedAt.month<s.year*12+s.mo)
      educationCaseResolveExam(s,item);
  }
  if(current){
    // An actual enrolled school's dated exam, not a fabricated entrance failure.
    const id=current.enroll.id+":annual-exam:"+s.year;
    if(s.mo>=6){
      s.educationExamSessions ||= {version:1,items:{}};
      const session=s.educationExamSessions.items[id] ||= {id,
        institutionId:current.m.institutionId,offeringId:current.offering.id,
        enrollmentId:current.enroll.id,status:"scheduled",scheduledAt:{year:s.year,month:6},
        evidenceRef:id+":school-calendar",basis:"game-model-school-calendar"};
      const state=educationSchoolStatusAt(s,current.offering.id,s.year,6);
      if(session.status==="scheduled"&&state.teachingEquivalent===0){
        session.status="cancelled";
        educationServiceExperience(s,current,"examination-cancelled",id,{examId:id});
      }
    }
  }
  for(const request of Object.values(s.educationTransferRequests?.items||{})){
    if(request.status==="rejected"||request.status==="closed"||!current||
       current.enroll.id!==request.fromEnrollmentId)continue;
    if(request.requestedAt.year!==s.year)continue;
    const off=world.offerings[request.toOfferingId];if(!off)continue;
    if(request.status==="awaiting-school" && s.year*12+s.mo>request.requestedAt.year*12+request.requestedAt.month){
      const status=educationSchoolStatusAt(s,off.id,s.year,s.mo),
        accepted=["open","limited"].includes(status?.admissionStatus)&&
          educationDraw(world,request.id,"transfer-school-answer-v1","decision").value<0.85;
      request.status=accepted?"accepted":"rejected";request.answeredAt=at;
      if(accepted){
        const delta=Math.max(0,educationFunds(s,off.stage,off.admissionTier,off.id)-
          educationFunds(s,current.m.stage,current.m.tier,current.offering.id)),
          fee=educationEnsureInvoice(s,{id:request.id+":difference",kind:"tuition",amount:delta,
            institutionId:off.institutionId,offeringId:off.id,serviceYear:s.year});
        s.educationTransferApprovals ||= {};
        s.educationTransferApprovals[request.id]={approved:true,fromEnrollmentId:current.enroll.id,
          toOfferingId:off.id,effectiveFrom:at,sourceRef:request.id+":receiving-school-answer",
          recognitionRef:request.id+":same-stage-credit-review",fundingClearanceRef:fee.id,
          creditRecognitionStatus:"approved",tuitionRecognitionStatus:"approved",feeInvoiceId:fee.id,
          serviceRequestId:request.id};
      }
    }
    const approval=s.educationTransferApprovals?.[request.id];
    if(approval&&approval.reviewStatus!=="declined")approval.effectiveFrom=at;
  }
  for(const record of s.educationMigration?.records||[]){
    const req=record.result?.externalRequest;
    if(!req||!req.issuedAt||s.educationP17Decisions?.items?.[req.id]||
       s.year*12+s.mo<=req.issuedAt.year*12+req.issuedAt.month)continue;
    const o=world.offerings[req.offeringId];if(!o)continue;
    const policy=educationServicePolicy(s,o.id),evidenceRef=req.id+":issuer-response",
      result={requestId:req.id,issuerId:req.issuerId,evidenceRef,status:"rejected"};
    if(req.reviewId==="E20"){
      const link=world.transportLinks[req.routeId];
      result.status=link&&educationTransportLinkStateAt(world,link,link.endpointAreaIds[0],s.year,s.mo).status==="active"?"approved":"rejected";
    }else if(req.reviewId==="E27"){
      const employer=(s.lifeRecord?.affiliations||[]).find(x=>x.id===req.issuerId&&["active","crisis"].includes(x.status));
      const program=s.educationEmployerPrograms?.items?.[req.sourceId];
      if(employer&&s.job>0&&program?.jobId===s.job){result.status="approved";result.approvedAmount=req.maxContribution;}
    }else if(req.reviewId==="E42"){
      const session=s.educationExamSessions?.items?.[req.sourceId],
        state=educationSchoolStatusAt(s,o.id,s.year,s.mo);
      if(session&&state.teachingEquivalent>0){
        session.status="rescheduled";session.makeupAt=at;session.rescheduleEvidenceRef=evidenceRef;
        result.status="approved";result.makeupAt=at;
      }else continue;
    }else if(req.reviewId==="E79"&&policy.equipmentAvailable){
      const mob=educationCreateMobilityState(s),id=req.id+":adjustment";
      mob.schoolAdjustments ||= {};
      mob.schoolAdjustments[id]={id,status:"verified",institutionId:req.issuerId,
        enrollmentId:req.enrollmentId,offeringId:req.offeringId,supportedNeeds:[...req.needs],
        evidenceRef:id+":installed",decisionEvidenceRef:evidenceRef};
      result.status="approved";result.adjustmentRef=id;
    }
    educationP17RecordExternalDecision(s,result);
    if(req.reviewId==="E27"&&result.status==="approved"){
      const access=educationAccessState(s);
      access.financingOffers ||= {};
      access.financingOffers[req.caseId]={...access.financingOffers[req.caseId],
        caseId:req.caseId,offeringId:req.offeringId,checkedAt:at,
        source:"institutional-desk-inquiry",grant:{id:req.id+":employer-direct",
          amount:result.approvedAmount,basis:evidenceRef}};
    }
  }
  for(const inquiry of Object.values(s.educationRecognitionInquiries?.items||{})){
    if(inquiry.status!=="awaiting-assessment"||
       inquiry.at.year*12+inquiry.at.month>=s.year*12+s.mo)continue;
    const authority=world.institutions[inquiry.authorityId],
      rule=authority?.nonformalRecognitionRules?.[inquiry.ruleId],
      path=educationLearningPath(s,"protagonist",inquiry.pathId);
    if(!rule?.approved||!rule.sourceRef||!path?.participation.length)continue;
    const id=inquiry.id+":examiner-result",passed=educationDraw(world,inquiry.id,
      "nonformal-independent-assessment-v1","verdict").value<0.7;
    educationRecordRecognitionAssessment(s,{applicationId:inquiry.id,pathId:path.pathId,
      authorityId:authority.id,ruleId:inquiry.ruleId,assessmentEvidenceId:id,
      examinerId:authority.id+":assessor",verdict:passed?"passed":"failed",sourceEventId:id});
    educationNonformalRecognition(s,{applicationId:inquiry.id,pathId:path.pathId,
      authorityId:authority.id,ruleId:inquiry.ruleId,targetJurisdiction:rule.jurisdiction,
      targetStageOrRole:rule.targetStageOrRole,outcome:passed?"accepted":"refused",
      assessmentEvidenceId:id,sourceEventId:id,recognitionKind:rule.kind,effectiveFrom:at});
  }
  for(const contract of Object.values(s.educationMobility?.residenceContracts||{})){
    if(contract.status!=="committed"||!educationResidenceContractMonth(contract,s.year,s.mo))continue;
    for(const kind of ["boarding-room","boarding-food"]){
      const invoice=educationEnsureVerifiedMobilityInvoice(s,{kind,residenceContractId:contract.id,
        year:s.year,month:s.mo});
      if(invoice.status!=="paid")educationSettleInvoice(s,invoice);
    }
  }
  educationP17ReconcileNotices(s);
}

function educationServiceInvariants(s) {
  const issues=[],service=s.educationServices;
  if(service&&(service.version!==1||!service.inquiries||!service.replies))issues.push("教育窓口の台帳が不正");
  for(const record of s.educationMigration?.records||[]){
    const id=record.result?.serviceReplyId,reply=service?.replies?.[id];
    if(id&&(!reply||reply.letter!==record.choice||!reply.evidenceRef||
      !Number.isInteger(reply.index)||reply.index<0))issues.push("学校の回答と選択が不一致");
  }
  for(const decision of Object.values(s.educationP17Decisions?.items||{})){
    const record=s.educationMigration?.records?.find(x=>x.result?.externalRequest?.id===decision.requestId);
    if(!record||record.result.externalRequest.issuerId!==decision.issuerId||
      record.result.externalRequest.reviewId!==decision.reviewId)
      issues.push("教育決定の申請または発行者が不一致");
  }
  return issues;
}

function educationServiceTravelApproved(s,caseId,offeringId) {
  return (s.educationMigration?.records||[]).some(record=>{
    const request=record.result?.externalRequest,
      decision=s.educationP17Decisions?.items?.[request?.id];
    return request?.reviewId==="E20"&&request.caseId===caseId&&request.offeringId===offeringId&&
      decision?.status==="approved"&&decision.reviewId==="E20"&&decision.issuerId===request.issuerId&&
      record.at.year===s.year;
  });
}

function educationServiceTransferInquiry(s) {
  const current=educationMigrationCurrent(s),world=s.world?.educationWorld;
  if(!current||s.dead||s.mo<1||s.mo>12)return false;
  s.educationTransferRequests ||= {version:1,items:{}};
  const areas=[s.local.educationAreaId,...educationNeighborAreaIds(s,s.local.educationAreaId)];
  for(const area of areas)for(const off of institutionOfferings(s,area,current.m.stage)){
    if(off.institutionId===current.m.institutionId)continue;
    const status=educationSchoolStatusAt(s,off.id,s.year,s.mo);
    if(!["open","limited"].includes(status?.admissionStatus))continue;
    const id=current.enroll.id+":"+off.id+":transfer:"+s.year;
    s.educationTransferRequests.items[id] ||= {id,personId:"protagonist",status:"awaiting-school",
      fromEnrollmentId:current.enroll.id,toOfferingId:off.id,requestedAt:{year:s.year,month:s.mo},
      sourceRef:id+":learner-request"};
  }
  if(typeof L==="function")L("通える範囲の学校へ、転学の受入れと履修・学費の扱いを問い合わせた。今の学籍は、そのまま残している。");
  return true;
}
