// P05/P09: one enrollment, one month-equivalent, one recognized annual credit.
// Twelve months and 9.0 are simulation accounting units, not Terra school terms.
const EDUCATION_CREDIT_THRESHOLD=9;
function educationAttendanceState(s) {
  s.educationAttendance ||= {version:1,enrollments:{}};
  s.educationCredits ||= {version:1,items:{}};
  s.educationPlacements ||= {version:1,items:{},currentPlacementId:null};
  if(s.educationAttendance.version!==1||s.educationCredits.version!==1||
     s.educationPlacements.version!==1)throw Error("教育履修台帳の版が不正");
  return {attendance:s.educationAttendance,credits:s.educationCredits,
    placements:s.educationPlacements};
}
function educationActiveEnrollment(s) {
  const model=s?.educationPath,rec=s?.educationRecord;
  if(!model?.offeringId||!rec)return null;
  const current=rec.enrollments?.find(row=>row.id===model.currentEnrollmentId)||
    [...(rec.enrollments||[])].reverse().find(row=>row.status==="enrolled"&&
      row.offeringId===model.offeringId);
  return current?.offeringId===model.offeringId?current:null;
}
function educationBindFormalEnrollment(s,enrollmentId) {
  const model=s.educationPath,record=s.educationRecord?.enrollments?.find(x=>x.id===enrollmentId),
    world=s.world?.educationWorld,offering=world?.offerings?.[model?.offeringId];
  if(!record||record.status!=="enrolled"||!offering ||
     offering.institutionId!==model.institutionId ||
     offering.campusId!==model.campusId || offering.stage!==model.stage)
    throw Error("学籍と実在する学校課程を結び付けられない");
  if(!offering.recognitionRule || offering.recognitionRule.issuerBasis!=="game-model")
    throw Error("課程の履修認定権限が不明");
  const reg=educationAttendanceState(s),now={year:s.year,month:s.mo||0};
  record.institutionId=model.institutionId;
  record.campusId=model.campusId;
  record.offeringId=model.offeringId;
  record.stage=model.stage;
  record.recognitionRule=offering.recognitionRule;
  model.currentEnrollmentId=enrollmentId;
  const id=enrollmentId+":placement:1";
  reg.placements.items[id] ||= {
    id,enrollmentId,institutionId:model.institutionId,
    campusId:model.campusId,offeringId:model.offeringId,
    effectiveFrom:now,effectiveTo:null,
    sourceRef:model.sourceEventId||"formal-enrollment-contract",
    recognitionStatus:"recognized",status:"active"
  };
  reg.placements.currentPlacementId=id;
  return reg.placements.items[id];
}
function educationRecordPlacementTransfer(s,{enrollmentId,campusId,offeringId,
  evidenceRef,recognitionRef}={}) {
  const reg=educationAttendanceState(s),record=educationActiveEnrollment(s),
    world=s.world?.educationWorld,offer=world?.offerings?.[offeringId],
    campus=world?.campuses?.[campusId];
  if(!record||record.id!==enrollmentId||!evidenceRef||!recognitionRef||
     !offer||offer.campusId!==campusId||offer.stage!==s.educationPath.stage||
     !campus||campus.institutionId!==offer.institutionId)
    return null;
  const current=reg.placements.items[reg.placements.currentPlacementId];
  if(!current||current.enrollmentId!==enrollmentId)return null;
  // Preserve every already closed month at the former placement before
  // changing the live school affiliation.
  if(s.mo>1)educationSimulateAttendanceThrough(s,s.year,s.mo-1);
  const ordinal=Object.keys(reg.placements.items).filter(id=>
    id.startsWith(enrollmentId+":placement:")).length+1;
  const id=enrollmentId+":placement:"+ordinal,now={year:s.year,month:s.mo||0};
  if(reg.placements.items[id])return reg.placements.items[id];
  current.effectiveTo=now;current.status="transferred";
  const placement={
    id,enrollmentId,institutionId:offer.institutionId,campusId,offeringId,
    effectiveFrom:now,effectiveTo:null,
    sourceRef:evidenceRef,transferRecognitionId:recognitionRef,
    recognitionStatus:"recognized",status:"active"
  };
  reg.placements.items[id]=placement;
  reg.placements.currentPlacementId=id;
  record.institutionId=offer.institutionId;record.campusId=campusId;
  record.offeringId=offeringId;s.educationPath.institutionId=offer.institutionId;
  s.educationPath.campusId=campusId;s.educationPath.offeringId=offeringId;
  return placement;
}
function educationTeachingMonth(s,offeringId,year,month) {
  const offer=s.world?.educationWorld?.offerings?.[offeringId],
    status=offer && educationSchoolStatusAt(s,offeringId,year,month);
  const institution=s.world?.educationWorld?.institutions?.[offer?.institutionId];
  const recognized=!!offer?.recognitionRule?.issuerBasis &&
    offer.recognitionRule.issuerBasis==="game-model" &&
    institution?.status==="operating" && status?.institutionStatus==="operating";
  return {recognized,delivery:recognized?status.teachingEquivalent:0,
    status,authorityId:recognized?offer.institutionId:null};
}
function educationMonthKey(enrollmentId,year,month) {
  return enrollmentId+":"+year+":"+month;
}
function educationRecordAttendance(s,input) {
  const {enrollmentId,year,month,placementId,personalAccess,evidenceRef,
    sourceKind="confirmed-attendance"}=input||{};
  if(!enrollmentId||!evidenceRef||!Number.isInteger(year)||
     !Number.isInteger(month)||month<1||month>12||
     year>s.year||!Number.isFinite(personalAccess)||
     personalAccess<0||personalAccess>1)
    throw Error("月次出席の日時・参加率・証拠が不正");
  const record=s.educationRecord?.enrollments?.find(x=>x.id===enrollmentId),
    reg=educationAttendanceState(s),placement=reg.placements.items[placementId];
  if(!record||!placement||placement.enrollmentId!==enrollmentId)
    throw Error("出席実績と学籍・校地が一致しない");
  const effective=year*12+month,
    started=placement.effectiveFrom.year*12+placement.effectiveFrom.month,
    ended=placement.effectiveTo &&
      placement.effectiveTo.year*12+placement.effectiveTo.month;
  if(effective<started || (ended!=null && effective>ended))
    throw Error("学籍上の校地在籍期間外に出席した");
  const creditId=enrollmentId+":credit:"+year;
  if(reg.credits.items[creditId])throw Error("年度履修認定済みの月次出席は変更できない");
  const {recognized,delivery,status,authorityId}=
    educationTeachingMonth(s,placement.offeringId,year,month);
  const key=educationMonthKey(enrollmentId,year,month),
    yearRows=reg.attendance.enrollments[enrollmentId] ||= {},
    months=yearRows[year] ||= {},
    row=months[month] ||= {
      id:key,enrollmentId,academicYear:year,month,segments:{},
      equivalent:0,finalized:true,recognizedEquivalent:0
    };
  const previous=row.segments[placementId];
  if(previous && previous.evidenceRef===evidenceRef &&
     previous.personalAccess===personalAccess)return row;
  row.segments[placementId]={
    id:key+":"+placementId,placementId,offeringId:placement.offeringId,
    campusId:placement.campusId,
    schoolDelivery:delivery,personalAccess,
    recognized,authorityId,sourceKind,evidenceRef,
    teachingStatus:status?.teachingStatus||"unknown",
    recognitionStatus:placement.recognitionStatus,
    equivalent:recognized&&placement.recognitionStatus==="recognized"?
      Math.min(delivery,personalAccess):0
  };
  // A person cannot study two full months in a single calendar month.
  row.equivalent=Math.min(1,Object.values(row.segments)
    .reduce((n,x)=>n+x.equivalent,0));
  row.recognizedEquivalent=row.equivalent;
  return row;
}
function educationRenewGuardianStudy(s) {
  const m=s.educationPath,record=educationActiveEnrollment(s);
  if(!record||m.status!=="enrolled"||s.age>=18||!s.educationMobility ||
     !s.world?.educationWorld)return false;
  const old=Object.values(s.educationMobility.consentRecords||{}).filter(x=>
    x.personId==="protagonist"&&x.institutionId===m.institutionId&&
    x.purpose==="daily-commute"&&x.consentState==="granted"&&
    x.validFrom?.year<s.year);
  if(!old.length)return false;
  const person=educationCaseKnownGuardian(s);
  if(!person||!old.some(x=>x.consenterPersonId===person.personId))return false;
  const id=record.id+":guardian-study:"+s.year,
    current=s.educationMobility.consentRecords[id];
  if(current)return current.consentState==="granted";
  const world=s.world.educationWorld,
    roll=educationDraw(world,id,"annual-guardian-continuity-v1","response"),
    granted=roll.value<0.88,
    from={year:s.year,month:1},through={year:s.year,month:12};
  s.educationMobility.consentRecords[id]={
    id,personId:"protagonist",institutionId:m.institutionId,
    purpose:"daily-commute",consenterPersonId:person.personId,
    consentState:granted?"granted":"refused",
    evidenceRef:id+":model-response",validFrom:from,validThrough:through
  };
  if(granted && ["fa","mo"].includes(person.personId)&&
      (s.par?.[person.personId]?.health??100)>20)
    s.educationMobility.escortRecords[id]={
      id,personId:"protagonist",institutionId:m.institutionId,
      purpose:"daily-commute",escortPersonId:person.personId,
      evidenceRef:id+":escort-response",status:"verified",
      validFrom:from,validThrough:through
    };
  if(typeof L==="function")L(granted?
    "今年も学校に通うため、家の人と送り迎えや通学について改めて相談した。承諾を得て、今期の約束を記録した。":
    "今年の通学について家の人に相談したが、今期は承諾を得られなかった。学校の学籍は残っていても、出席できる条件は整っていない。");
  return granted;
}
function educationSimulateAttendanceThrough(s,year= s?.year,untilMonth=12) {
  const m=s.educationPath,record=educationActiveEnrollment(s),world=s.world?.educationWorld;
  if(!record||!["enrolled","paused"].includes(m.status)||!world||
     year!==s.year || untilMonth<1)return 0;
  const reg=educationAttendanceState(s);
  if(!reg.placements.currentPlacementId)educationBindFormalEnrollment(s,record.id);
  const placement=reg.placements.items[reg.placements.currentPlacementId];
  if(!placement||placement.enrollmentId!==record.id)return 0;
  let count=0;
  for(let month=1;month<=Math.min(12,untilMonth);month++){
    const date=year*12+month,start=placement.effectiveFrom.year*12+placement.effectiveFrom.month;
    const row=reg.attendance.enrollments[record.id]?.[year]?.[month];
    if(row)continue;
    if(date<start){
      const months=(reg.attendance.enrollments[record.id] ||= {});
      const values=(months[year] ||= {});
      values[month]={
        id:educationMonthKey(record.id,year,month),
        enrollmentId:record.id,academicYear:year,month,segments:{},
        equivalent:0,recognizedEquivalent:0,finalized:true,
        basis:"pre-enrollment-month"
      };
      count++;
      continue;
    }
    educationReconcileWorldAt(s,year,month);
    const teaching=educationTeachingMonth(s,placement.offeringId,year,month);
    let access=0,basis="no-formal-class";
    if(teaching.recognized&&teaching.delivery>0 &&
       m.status==="enrolled"&&!s.study?.suspended){
      const route=educationCanReach(s,{
        institutionId:placement.institutionId,campusId:placement.campusId,
        offeringId:placement.offeringId,year,month,purpose:"daily-commute"
      });
      if(route.reachable){
        // A distinct keyed monthly participation draw, after verifying
        // actual enrollment, school, safe transport and caregiver conditions.
        const roll=educationDraw(world,record.id+":"+year+":"+month,
          "personal-attendance-v1","participation");
        access=roll.value<0.91?1:roll.value<0.975?0.5:0;
        basis="game-model-personal-participation";
      }else basis="route-unavailable";
    }
    educationRecordAttendance(s,{enrollmentId:record.id,year,month,
      placementId:placement.id,personalAccess:access,
      evidenceRef:record.id+":sim-month:"+year+":"+month,
      sourceKind:basis});
    count++;
  }
  return count;
}
function educationSettleCompletedAcademicYear(s,year) {
  if(!Number.isInteger(year)||year>s.year)return null;
  const m=s.educationPath,record=educationActiveEnrollment(s);
  if(!m?.offeringId||!record)return null;
  const reg=educationAttendanceState(s),id=record.id+":credit:"+year;
  if(reg.credits.items[id])return reg.credits.items[id];
  const months=reg.attendance.enrollments[record.id]?.[year]||{},
    rows=Array.from({length:12},(_,i)=>months[i+1]).filter(Boolean);
  if(rows.length!==12)return {id,enrollmentId:record.id,academicYear:year,
    outcome:"pending",finalizedMonths:rows.length,credited:false};
  const offered=s.world?.educationWorld?.offerings?.[record.offeringId],
    authorized=!!offered && offered.stage===m.stage &&
    offered.recognitionRule?.issuerBasis==="game-model" &&
    (offered.recognitionRule.completionStage===m.stage ||
      m.stage==="preparatory" && offered.recognitionRule.upperEquivalency==="assessment-required");
  const equivalent=rows.reduce((n,x)=>n+x.recognizedEquivalent,0);
  const invoice=s.educationFinance?.invoices?.[record.id+":tuition:"+year],
    funded=invoice?.status==="paid" ||
      (m.fundedYear===year && !invoice && offered && EDUCATION_PROGRAMS[m.stage]?.fee===0);
  const credited=authorized && funded && equivalent>=EDUCATION_CREDIT_THRESHOLD;
  const result={
    id,enrollmentId:record.id,academicYear:year,
    offeringId:record.offeringId,authorityId:authorized?record.institutionId:null,
    equivalent:Number(equivalent.toFixed(4)),finalizedMonths:12,
    credited,recognizedEquivalent:credited?equivalent:0,
    outcome:credited?"recognized":equivalent<EDUCATION_CREDIT_THRESHOLD?
      "insufficient-attendance":!funded?"unfunded":"authority-unverified",
    fundingInvoiceId:invoice?.id||null,
    sourceMonthKeys:rows.map(x=>x.id),decidedAt:{year:s.year,month:s.mo??0},
    recognitionBasis:"game-model-P05-P09"
  };
  reg.credits.items[id]=result;
  return result;
}
function educationCreditForPreviousYear(s) {
  const m=s.educationPath,record=educationActiveEnrollment(s);
  if(!m?.offeringId||!record)return null;
  return s.educationCredits?.items?.[record.id+":credit:"+(s.year-1)]||null;
}
function educationAnnualParticipationScale(s) {
  const credit=educationCreditForPreviousYear(s);
  return credit?.credited?Math.max(0,Math.min(1,credit.equivalent/12)):0;
}
function educationAttendanceInvariants(s) {
  const issues=[],att=s.educationAttendance,credits=s.educationCredits,places=s.educationPlacements;
  if(!att&&!credits&&!places)return issues;
  if(att?.version!==1||credits?.version!==1||places?.version!==1)
    return ["教育月次・履修・校地台帳の版が不正"];
  for(const [enrollmentId,years] of Object.entries(att.enrollments||{}))
    for(const [year,months] of Object.entries(years))
      for(const [month,row] of Object.entries(months)){
        const sum=Object.values(row.segments||{}).reduce((n,x)=>n+x.equivalent,0);
        if(row.enrollmentId!==enrollmentId||row.academicYear!==Number(year)||
           row.month!==Number(month)||!Number.isFinite(row.equivalent)||
           row.equivalent<0||row.equivalent>1||Math.abs(row.equivalent-Math.min(1,sum))>1e-7)
          issues.push("同一月の出席換算または学籍参照が不正");
      }
  for(const [id,row] of Object.entries(credits?.items||{})){
    if(row.id!==id||!Number.isFinite(row.equivalent)||row.equivalent<0||
       row.equivalent>12||row.finalizedMonths!==12||
       row.credited !== (row.outcome==="recognized")||
       row.credited && row.equivalent<EDUCATION_CREDIT_THRESHOLD)
      issues.push("履修年度の認定台帳が不正");
  }
  return issues;
}
