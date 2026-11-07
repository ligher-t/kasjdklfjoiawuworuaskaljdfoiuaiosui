// P07: canonical invoice/receipt ledger. All rates are simulation assumptions.
function educationFinanceClone(value) {return JSON.parse(JSON.stringify(value));}
const EDUCATION_FINANCE_KINDS = Object.freeze([
  "entrance-exam","application-document","entrance-deposit","tuition",
  "school-materials","entrance-trip","commute-pass","boarding-room",
  "boarding-food","rent","relocation","living","leave-of-absence-fee"
]);
const EDUCATION_FINANCE_REFUND_POLICIES = Object.freeze({
  "exam-cancel-school":{kind:"entrance-exam",ratio:1},
  "exam-cancel-student-before":{kind:"entrance-exam",ratio:0},
  "exam-held":{kind:"entrance-exam",ratio:0},
  "tuition-school-cancel-before-term":{kind:"tuition",ratio:1},
  "tuition-student-withdraw-before-term":{kind:"tuition",ratio:1},
  "tuition-student-withdraw-after-start":{kind:"tuition",ratio:0},
  "tuition-school-cancel-midyear":{kind:"tuition",prorate:true},
  "temporary-closure-with-makeup":{kind:"tuition",ratio:0},
  "boarding-school-cancel-before":{kind:"boarding-room",ratio:1}
});
function educationFinanceState(s) {
  if(!s.educationFinance) s.educationFinance={
    version:1,seq:0,quotes:{},invoices:{},receipts:{},
    grants:{},loans:{},refunds:{},postings:{},annualSummaries:{}
  };
  const f=s.educationFinance;
  if(f.version!==1)throw Error("教育会計のモデル版が不正");
  // Same-save-version I03 ledgers can contain an array of completed cash
  // receipts. Retain every historical debit without charging wallets again.
  if(Array.isArray(f.receipts)){
    const historical=f.receipts;
    f.receipts={};
    f.invoices||={};f.postings||={};
    for(const old of historical){
      if(!old?.id || f.postings[old.id])continue;
      const invoiceId="education-i03:"+old.id,
        paid=(old.personal||0)+(old.household||0);
      const when=old.settledAt||{year:s.year,month:s.mo||0};
      f.invoices[invoiceId]={
        id:invoiceId,kind:old.kind==="exam"?"entrance-exam":"tuition",
        caseId:old.caseId||null,applicationId:old.applicationId||null,
        enrollmentId:null,offeringId:null,
        personId:"protagonist",recipient:{kind:"institution",id:"legacy-education-case"},
        serviceYear:when.year,issuedAt:when,dueAt:when,
        lines:[{lineId:"historical-payment",baseAmount:paid,discount:0}],
        gross:paid,discountTotal:0,net:paid,paid,refunded:0,
        outstanding:0,status:"paid",refundStatus:"none",receiptIds:[],
        refundIds:[],policyId:"game-model-i03-record"
      };
      for(const [account,amount] of [["personal",old.personal||0],["household",old.household||0]]){
        if(!amount)continue;
        const id=old.id+":"+account;
        f.receipts[id]={id,invoiceId,amount,source:account,
          payerPersonId:account==="personal"?"protagonist":"household",
          sourceRef:null,paidAt:when,status:"settled",postingId:old.id};
        f.invoices[invoiceId].receiptIds.push(id);
      }
      f.postings[old.id]={id:old.id,invoiceId,amount:paid,
        receiptIds:[...f.invoices[invoiceId].receiptIds],status:"settled"};
    }
  }
  f.seq||=0;f.quotes||={};f.invoices||={};f.receipts||={};
  f.grants||={};f.loans||={};f.refunds||={};f.postings||={};
  f.annualSummaries||={};
  return f;
}
function educationFinanceAmount(n) {
  if(!Number.isSafeInteger(n) || n<0)throw Error("教育費は非負の整数で指定してください");
  return n;
}
function educationFinanceAt(s) {
  return {year:s.year,month:Number.isInteger(s.mo)?s.mo:0};
}
function educationFinancePrice(s,stage,tier=1,offeringId=null) {
  const base=EDUCATION_PROGRAMS[stage]?.fee;
  if(!Number.isFinite(base))throw Error("未定義の教育課程の学費");
  const world=s.world?.educationWorld,offer=offeringId?world?.offerings?.[offeringId]:null;
  if(offeringId&&!offer)throw Error("存在しない学校課程での学費見積");
  if(offer && (offer.stage!==stage || offer.admissionTier!==tier))
    throw Error("学費見積と学校課程の条件が一致しない");
  const area=offer?world?.areas?.[world?.campuses?.[offer.campusId]?.educationAreaId]:null;
  if(offer&&!area)throw Error("課程の所在地を特定できない");
  const priceRegion=area?.regionKey||s.res?.n,
    regionPrice=typeof REG!=="undefined" ? REG.find(x=>x.n===priceRegion)?.pm : null;
  if(offer&&!Number.isFinite(regionPrice))throw Error("学校所在地の価格係数がない");
  const tierFactor=["university","vocational","arts"].includes(stage)?1+0.55*(tier-1):1;
  const priceIndex=s.priceIndex||1;
  if(!Number.isFinite(priceIndex)||priceIndex<=0)throw Error("物価指数が不正");
  const override=offer?.annualFeeOverride;
  if(override!=null && (!Number.isSafeInteger(override)||override<0 ||
    offer.priceBasis!=="final-base"))throw Error("課程学費の上書き根拠が不正");
  const amount=Math.round(override!=null?override:base*tierFactor*(regionPrice||s.res?.pm||1)*priceIndex);
  return {amount:educationFinanceAmount(amount),priceRegion,
    priceIndexAtIssue:priceIndex,regionMultiplier:regionPrice||s.res?.pm||1,
    tuitionBasis:override!=null?"school-final-base":"game-model-stage-base",
    tierMultiplier:override!=null?1:tierFactor};
}
// Pure calculations never alter wallets, eligibility, random state or enrollment.
function educationQuoteCosts(s,input) {
  const stage=input?.stage||s.educationPath?.stage,
    tier=input?.tier||s.educationPath?.tier||1,
    offerId=input?.offeringId||null,kind=input?.kind||"tuition";
  if(!EDUCATION_FINANCE_KINDS.includes(kind))throw Error("教育費の請求区分が不正");
  const price=educationFinancePrice(s,stage,tier,offerId);
  const amount=kind==="entrance-exam"?Math.round(price.amount*0.06):
    kind==="tuition"?price.amount:educationFinanceAmount(input?.amount||0);
  return {
    id:(input?.caseId||input?.enrollmentId||input?.applicationId||"education")+":quote:"+
      kind+":"+(input?.year||s.year)+":"+(offerId||stage),
    caseId:input?.caseId||null,applicationId:input?.applicationId||null,
    enrollmentId:input?.enrollmentId||null,offeringId:offerId,
    stage,tier,kind,amount,serviceYear:input?.year||s.year,
    pricedAt:{year:s.year,month:s.mo||0,priceRegion:price.priceRegion,
      priceIndex:price.priceIndexAtIssue},
    priceBasis:price.tuitionBasis,
    basis:"game-model-school-tuition",
    lines:[{kind,amount}]
  };
}
function educationRecordQuote(s,quote) {
  if(!quote?.id||!Number.isSafeInteger(quote.amount))throw Error("教育見積の内容が不正");
  const f=educationFinanceState(s);
  if(f.quotes[quote.id])return f.quotes[quote.id];
  f.quotes[quote.id]=educationFinanceClone(quote);
  return f.quotes[quote.id];
}
function educationEnsureInvoice(s,input) {
  if(!input?.id||typeof input.id!=="string"||
     !EDUCATION_FINANCE_KINDS.includes(input.kind))
    throw Error("教育請求IDまたは費目が不正");
  const f=educationFinanceState(s),found=f.invoices[input.id];
  if(found)return found;
  const now=educationFinanceAt(s),
    amount=educationFinanceAmount(input.amount),
    discount=educationFinanceAmount(input.discount||0);
  if(discount>amount)throw Error("教育費の減免が請求額を超えている");
  if(input.serviceYear!=null && (!Number.isInteger(input.serviceYear) ||
    input.serviceYear>s.year))throw Error("未到来年度の教育請求");
  const recipientId=input.institutionId||input.recipientId||null;
  if(!recipientId)throw Error("教育請求の受取先が未確定");
  const lines=input.lines||[{lineId:input.kind,baseAmount:amount,discount}];
  if(!Array.isArray(lines)||!lines.length ||
    lines.some(row=>!row?.lineId||!Number.isSafeInteger(row.baseAmount)||
      row.baseAmount<0||!Number.isSafeInteger(row.discount)||row.discount<0) ||
    lines.reduce((sum,row)=>sum+row.baseAmount,0)!==amount ||
    lines.reduce((sum,row)=>sum+row.discount,0)!==discount)
    throw Error("教育請求明細の総額が一致しない");
  const invoice={
    id:input.id,kind:input.kind,personId:input.personId||"protagonist",
    caseId:input.caseId||null,applicationId:input.applicationId||null,
    enrollmentId:input.enrollmentId||null,offeringId:input.offeringId||null,
    recipient:{kind:input.recipientKind||"institution",id:recipientId},
    serviceYear:input.serviceYear||s.year,issuedAt:now,
    dueAt:input.dueAt||{year:s.year,month:12},
    lines:lines.map(row=>({...row})),
    gross:amount,discountTotal:discount,net:amount-discount,
    paid:0,refunded:0,outstanding:amount-discount,
    status:amount-discount===0?"paid":"issued",refundStatus:"none",receiptIds:[],refundIds:[],
    policyId:input.policyId||"game-model-school-standard-v1",
    priceRegion:input.priceRegion||null,priceIndexAtIssue:input.priceIndexAtIssue??null
  };
  f.invoices[invoice.id]=invoice;
  return invoice;
}
function educationTuitionEnrollmentId(s,m) {
  const enrolled=(s.educationRecord?.enrollments||[]).filter(x=>
    x.status==="enrolled").at(-1);
  return enrolled?.id||m.enrollmentId||[
    "legacy-enrollment",m.stageStartYear,m.stage,m.tier,m.institutionId||s.res?.n
  ].join(":");
}
function educationEnsureTuitionInvoice(s,m,serviceYear=s.year) {
  const enrollmentId=educationTuitionEnrollmentId(s,m),
    id=enrollmentId+":tuition:"+serviceYear;
  const prior=s.educationFinance?.invoices?.[id];
  if(prior)return prior;
  const quote=educationQuoteCosts(s,{enrollmentId,offeringId:m.offeringId||null,
    stage:m.stage,tier:m.tier,kind:"tuition",year:serviceYear});
  return educationEnsureInvoice(s,{
    id,kind:"tuition",enrollmentId,offeringId:m.offeringId||null,
    institutionId:m.institutionId||"legacy-school:"+s.res?.n+":"+m.stage,
    amount:quote.amount,serviceYear,priceRegion:quote.pricedAt.priceRegion,
    priceIndexAtIssue:quote.pricedAt.priceIndex
  });
}
function educationPlanSettlement(s,invoiceId,sources={}) {
  const invoice=s.educationFinance?.invoices?.[invoiceId];
  const fail=reason=>({allowed:false,reason,invoiceId});
  if(!invoice || invoice.status==="void")return fail("invoice-not-issued");
  const postingId=sources.postingId||invoiceId+":cash-settlement";
  if(s.educationFinance?.postings?.[postingId])return {
    allowed:true,idempotent:true,postingId,invoiceId
  };
  const outstanding=invoice.net-invoice.paid;
  if(!Number.isSafeInteger(outstanding)||outstanding<0)return fail("invoice-inconsistent");
  if(outstanding===0)return fail("already-paid");
  const grant=sources.grant||null,loan=sources.loan||null;
  const grantAmount=educationFinanceAmount(grant?.amount||0),
    loanAmount=educationFinanceAmount(loan?.amount||0);
  if(grantAmount+loanAmount>outstanding)return fail("overpayment");
  if(grantAmount && (!grant?.id || !grant.basis))return fail("grant-not-approved");
  if(grantAmount && s.educationFinance?.grants?.[grant.id])
    return fail("grant-already-used");
  if(loanAmount){
    if(!loan?.id || !loan.creditor || typeof addLoanContract!=="function" ||
       loanContract(s,loan.id))return fail("loan-unavailable");
    const offer=s.educationFinance?.creditOffers?.[loan.id];
    const documented=offer&&offer.status==="approved"&&offer.evidenceRef&&
      offer.creditor===loan.creditor&&offer.invoiceId===invoiceId&&
      offer.amount===loanAmount&&offer.validYear===s.year;
    if(s.age<18 || s.res?.n!=="クルビア"&&!documented)return fail("loan-not-eligible");
  }
  const required=outstanding-grantAmount-loanAmount,
    cash=educationPaymentPlan(s,required);
  if(!cash.allowed)return fail("insufficient-funds");
  const parts=[
    ...(cash.personal>0?[{source:"personal",amount:cash.personal}]:[]),
    ...(cash.household>0?[{source:"household",amount:cash.household}]:[]),
    ...(grantAmount>0?[{source:"grant",amount:grantAmount,sourceRef:grant.id}]:[]),
    ...(loanAmount>0?[{source:"contract-loan",amount:loanAmount,sourceRef:loan.id}]:[])
  ];
  return {allowed:true,idempotent:false,invoiceId,postingId,parts,
    outstanding,personalBalance:s.cash||0,householdBalance:s.house?.cash||0,
    invoicePaid:invoice.paid,
    grant:grant?{...grant,amount:grantAmount}:null,
    loan:loan?{...loan,amount:loanAmount}:null};
}
function educationCommitSettlement(s,plan) {
  if(!plan?.allowed)return null;
  const f=educationFinanceState(s);
  if(f.postings[plan.postingId])return f.postings[plan.postingId];
  const invoice=f.invoices[plan.invoiceId];
  if(!invoice || invoice.status==="void" ||
     invoice.paid!==plan.invoicePaid ||
     invoice.net-invoice.paid!==plan.outstanding ||
     (s.cash||0)!==plan.personalBalance ||
     (s.house?.cash||0)!==plan.householdBalance)
    return null;
  const personal=plan.parts.filter(x=>x.source==="personal").reduce((n,x)=>n+x.amount,0),
    household=plan.parts.filter(x=>x.source==="household").reduce((n,x)=>n+x.amount,0);
  if(personal>(s.cash||0)||household>(s.house?.cash||0))return null;
  if(plan.loan && loanContract(s,plan.loan.id))return null;
  if(plan.grant && f.grants[plan.grant.id])return null;
  if(plan.parts.reduce((n,x)=>n+x.amount,0)!==plan.outstanding)return null;
  const before={cash:s.cash,houseCash:s.house?.cash,debt:s.debt,
    houseWalletId:s.house?.educationWalletId,
    contracts:educationFinanceClone(s.loanContracts||[]),finance:educationFinanceClone(f)};
  try {
    if(plan.loan?.amount){
      const amount=plan.loan.amount;
      addLoanContract(s,{
        contractId:plan.loan.id,kind:"education-credit",borrower:"本人",
        creditor:plan.loan.creditor,region:s.res.n,
        currency:"共通計算単位（ゲームモデル）",account:"personal",
        principal:amount,totalDue:Math.round(amount*1.1),installmentShare:0.2,
        dueInYears:3,disbursement:"school",
        terms:"契約元本の1.1倍を返済する。契約年から3年後の年末を期限とし、一部返済可。追加費用は含まない。",
        sourceEventId:plan.invoiceId
      },1);
      f.loans[plan.loan.id]={id:plan.loan.id,invoiceId:plan.invoiceId,
        principal:amount,contractId:plan.loan.id,sourceKind:"game-model-loan"};
    }
    s.cash=(s.cash||0)-personal;
    if(household){
      if(!s.house.educationWalletId)
        s.house.educationWalletId="edu-wallet:"+String(s.randomSeed||s.by||"life")+":"+plan.invoiceId;
      s.house.cash-=household;
    }
    const now=educationFinanceAt(s),receiptIds=[];
    for(const part of plan.parts){
      const id="edu-pay:"+(++f.seq);
      f.receipts[id]={id,invoiceId:plan.invoiceId,amount:part.amount,
        source:part.source,sourceRef:part.source==="household"?
          s.house.educationWalletId:part.sourceRef||null,
        payerPersonId:part.source==="personal"?"protagonist":
          part.source==="household"?"household":null,
        paidAt:now,status:"settled",postingId:plan.postingId};
      invoice.receiptIds.push(id);receiptIds.push(id);
    }
    invoice.paid+=plan.outstanding;
    invoice.outstanding=invoice.net-invoice.paid;
    invoice.status=invoice.outstanding?"partially_paid":"paid";
    if(plan.grant?.amount){
      f.grants[plan.grant.id]={id:plan.grant.id,invoiceId:plan.invoiceId,
        amount:plan.grant.amount,basis:plan.grant.basis,
        settledAt:now,sourceKind:"game-model-approved-grant"};
    }
    const posting={id:plan.postingId,invoiceId:plan.invoiceId,
      amount:plan.outstanding,receiptIds,at:now,status:"settled"};
    f.postings[plan.postingId]=posting;
    return posting;
  }catch(error){
    s.cash=before.cash;
    if(s.house){
      s.house.cash=before.houseCash;
      if(before.houseWalletId===undefined)delete s.house.educationWalletId;
      else s.house.educationWalletId=before.houseWalletId;
    }
    s.debt=before.debt;s.loanContracts=before.contracts;
    s.educationFinance=before.finance;
    throw error;
  }
}
function educationSettleInvoice(s,invoice,sources={}) {
  if(invoice.net===0)return {id:invoice.id+":no-charge",invoiceId:invoice.id,
    receiptIds:[],amount:0,status:"settled"};
  const plan=educationPlanSettlement(s,invoice.id,sources);
  return plan.allowed?educationCommitSettlement(s,plan):null;
}
function educationFinanceProjectInvoice(s,invoice) {
  if(invoice?.kind!=="tuition")return;
  const receipts=invoice.receiptIds.map(id=>s.educationFinance.receipts[id]);
  const personal=receipts.filter(x=>x.source==="personal").reduce((n,x)=>n+x.amount,0),
    household=receipts.filter(x=>x.source==="household").reduce((n,x)=>n+x.amount,0),
    contract=receipts.filter(x=>x.source==="contract-loan").reduce((n,x)=>n+x.amount,0),
    aid=receipts.filter(x=>x.source==="grant").reduce((n,x)=>n+x.amount,0);
  const payer=contract?(personal+household?"mixed-contract":"contract"):
    household?(personal?"mixed":"household"):"personal";
  s.educationAnnualFee={year:invoice.serviceYear,
    stage:s.educationPath?.stage||s.educationCases?.items?.[invoice.caseId]?.stage||null,
    amount:invoice.net,payer,paidByPersonal:personal,paidByHousehold:household,
    ...(aid?{aidAmount:aid,aidBasis:"game-model-approved-grant"}:{}),
    ...(contract?{paidByContract:contract,contractId:receipts.find(x=>x.source==="contract-loan").sourceRef}:{}),
    invoiceId:invoice.id};
}
function educationVoidInvoice(s,id,reason="service-not-provided") {
  const invoice=educationFinanceState(s).invoices[id];
  if(!invoice || invoice.paid || invoice.status==="void")return false;
  invoice.status="void";invoice.voidReason=reason;
  invoice.outstanding=0;
  return true;
}
function educationPlanRefund(s,invoiceId,reasonId,parameters={}) {
  const f=s.educationFinance,invoice=f?.invoices?.[invoiceId],
    policy=EDUCATION_FINANCE_REFUND_POLICIES[reasonId];
  const id="edu-refund:"+invoiceId+":"+reasonId;
  if(f?.refunds?.[id])return {allowed:true,idempotent:true,id};
  if(!invoice||!policy||invoice.kind!==policy.kind)return {allowed:false,reason:"policy-unavailable"};
  if(invoice.paid<=invoice.refunded)return {allowed:false,reason:"nothing-refundable"};
  let ceiling=policy.prorate?0:Math.floor(invoice.paid*policy.ratio);
  if(policy.prorate){
    const periods=parameters.contractedTeachingPeriods,
      provided=parameters.verifiedTeachingPeriods;
    if(!Number.isInteger(periods)||periods<=0 ||
       !Number.isFinite(provided)||provided<0||provided>periods ||
       parameters.makeupProvided===true)
      return {allowed:false,reason:"delivery-not-verified"};
    ceiling=Math.floor(invoice.paid*(periods-provided)/periods);
  }
  ceiling=Math.min(Math.max(0,ceiling-invoice.refunded),invoice.paid-invoice.refunded);
  if(!ceiling)return {allowed:false,reason:"policy-zero-refund"};
  const receiptGroups={};
  for(const receiptId of invoice.receiptIds){
    const row=f.receipts[receiptId];
    if(!row || row.status!=="settled")continue;
    const key=row.source+":"+(row.sourceRef||"");
    const group=receiptGroups[key] ||= {source:row.source,sourceRef:row.sourceRef,amount:0};
    group.amount+=row.amount;
  }
  const prior=Object.values(f.refunds||{}).filter(row=>
    row.invoiceId===invoiceId && row.status==="settled");
  for(const settled of prior)for(const part of settled.allocation||[]){
    const key=part.source+":"+(part.sourceRef||"");
    if(!receiptGroups[key])return {allowed:false,reason:"refund-source-mismatch"};
    receiptGroups[key].amount-=part.amount;
    if(receiptGroups[key].amount<0)return {allowed:false,reason:"refund-overpayer"};
  }
  const total=Object.values(receiptGroups).reduce((n,row)=>n+row.amount,0);
  if(total!==invoice.paid-invoice.refunded)return {allowed:false,reason:"receipt-mismatch"};
  const payerOrder=["personal","household","grant","contract-loan"];
  const parts=Object.values(receiptGroups).sort((a,b)=>
    payerOrder.indexOf(a.source)-payerOrder.indexOf(b.source) ||
    String(a.sourceRef||"").localeCompare(String(b.sourceRef||"")));
  let assigned=0;
  for(const [index,row] of parts.entries()){
    const available=row.amount;
    row.amount=index===parts.length-1?ceiling-assigned:Math.floor(ceiling*available/total);
    assigned+=row.amount;
    if(row.amount>available)return {allowed:false,reason:"refund-overpayer"};
  }
  return {allowed:true,idempotent:false,id,invoiceId,reasonId,amount:ceiling,
    expectedPaid:invoice.paid,expectedRefunded:invoice.refunded,parts,
    basis:"game-model-policy",parameters:policy.prorate?{...parameters}:null};
}
function educationCommitRefund(s,plan) {
  if(!plan?.allowed)return null;
  const f=educationFinanceState(s);
  if(f.refunds[plan.id])return f.refunds[plan.id];
  const inv=f.invoices[plan.invoiceId];
  if(!inv||inv.paid!==plan.expectedPaid||inv.refunded!==plan.expectedRefunded ||
    plan.amount>inv.paid-inv.refunded)return null;
  for(const row of plan.parts){
    if(row.source==="contract-loan" &&
       loanContractBalance(s,row.sourceRef)<row.amount)return null;
    // Do not direct a parental household's refund into a different
    // household when residence and sharing arrangements have changed.
    if(row.source==="household" && (!row.sourceRef ||
       s.house?.educationWalletId!==row.sourceRef))return null;
  }
  const before={cash:s.cash,house:s.house?.cash,debt:s.debt,
    contracts:educationFinanceClone(s.loanContracts||[]),finance:educationFinanceClone(f)};
  try{
    for(const row of plan.parts){
      if(row.source==="personal")s.cash=(s.cash||0)+row.amount;
      else if(row.source==="household"){
        if(!s.house)throw Error("家計口座が失われた");
        s.house.cash=(s.house.cash||0)+row.amount;
      }else if(row.source==="contract-loan"){
        if(recordContractLoanPayment(s,row.sourceRef,row.amount,"education-refund")!==row.amount)
          throw Error("貸付返金と債務相殺の額が不一致");
      }
    }
    const refund={id:plan.id,invoiceId:plan.invoiceId,reasonId:plan.reasonId,
      amount:plan.amount,allocation:plan.parts.map(row=>({...row})),
      refundedAt:educationFinanceAt(s),status:"settled",
      basis:plan.basis,parameters:plan.parameters};
    inv.refunded+=plan.amount;
    inv.refundStatus=inv.refunded===inv.paid?"full":"partial";
    inv.refundIds.push(refund.id);
    f.refunds[refund.id]=refund;
    return refund;
  }catch(error){
    s.cash=before.cash;
    if(s.house)s.house.cash=before.house;
    s.debt=before.debt;s.loanContracts=before.contracts;
    s.educationFinance=before.finance;
    throw error;
  }
}
// P08 owns the actual move and its dates. Finance may charge only a
// confirmed, priced residence/service; a school listing is never a bill.
function educationResidenceContractMonth(contract,year,month) {
  if(!contract || !Number.isInteger(year)||!Number.isInteger(month)||
     month<1||month>12)return false;
  const key=(date,edge)=>date?.year*12+(date?.month||edge);
  const current=year*12+month,
    from=key(contract.start,1),to=contract.end?key(contract.end,12):Infinity;
  return Number.isFinite(from)&&current>=from&&current<=to;
}
function educationResidenceAwayMonths(s,year) {
  const covered=new Set();
  for(const contract of Object.values(s.educationMobility?.residenceContracts||{})){
    if(contract?.personId!=="protagonist" ||
       contract.status!=="committed" || !contract.actualAreaId ||
       !contract.householdRemainsAtOrigin || !contract.start ||
       (contract.previousHomeRef && contract.previousHomeRef===contract.actualAreaId))continue;
    for(let month=1;month<=12;month++)
      if(educationResidenceContractMonth(contract,year,month))covered.add(month);
  }
  return covered.size;
}
function educationEnsureVerifiedMobilityInvoice(s,input) {
  const kind=input?.kind,year=input?.year||s.year,month=input?.month,
    residenceKind=["boarding-room","boarding-food","rent"].includes(kind),
    travelKind=["entrance-trip","commute-pass","relocation"].includes(kind);
  if(!residenceKind&&!travelKind)throw Error("教育移動費の区分が不正");
  if(!Number.isInteger(year)||!Number.isInteger(month)||month<1||month>12 ||
     year>s.year)throw Error("教育移動費のサービス期間が不正");
  const f=educationFinanceState(s);
  let invoiceId,amount,recipient,ownerId;
  if(residenceKind){
    const contract=s.educationMobility?.residenceContracts?.[input.residenceContractId];
    if(!contract || contract.status!=="committed"||
       contract.personId!=="protagonist" || !contract.actualAreaId ||
       !educationResidenceContractMonth(contract,year,month))
      throw Error("確定した本人の居住契約・対象月がない");
    if(kind==="rent" ? contract.lodgingKind!=="independent-rental" :
       contract.lodgingKind!=="institution-dormitory")
      throw Error("居住契約と室料・家賃の費目が一致しない");
    const fee=contract.feeSchedule?.[kind],
      provider=contract.providerId;
    if(!Number.isSafeInteger(fee)||fee<0||!provider)
      throw Error("寄宿費の実料金・提供者が確定していない");
    amount=fee;recipient=provider;ownerId=contract.id||input.residenceContractId;
    invoiceId=ownerId+":boarding:"+year+":"+month+":"+kind;
    const conflict=kind==="rent"?"boarding-room":"rent";
    if(Object.values(f.invoices).some(row=>
      row.personId==="protagonist" && row.kind===conflict &&
      row.serviceYear===year && row.serviceMonth===month &&
      row.residenceContractId===ownerId))
      throw Error("同じ居住月の家賃と寄宿室料が重複");
  }else{
    const tx=s.educationMobility?.transportTransactions?.[input.transactionId];
    if(!tx || tx.status!=="confirmed" || !tx.providerId ||
       !Number.isSafeInteger(tx.amount)||tx.amount<0 ||
       tx.year!==year||tx.month!==month||tx.kind!==kind)
      throw Error("実施済みの交通契約と明示額がない");
    if(tx.chargedElsewhere || tx.paidInResidenceEffect)
      throw Error("一般の移動取引で既に清算された交通費");
    amount=tx.amount;recipient=tx.providerId;ownerId=tx.id||input.transactionId;
    invoiceId=kind==="relocation" ?
      "move:"+(tx.moveTransactionId||ownerId):ownerId+":"+kind;
  }
  const invoice=educationEnsureInvoice(s,{
    id:invoiceId,kind,amount,serviceYear:year,
    recipientKind:residenceKind?"residence-provider":"transport-provider",
    recipientId:recipient,
    personId:"protagonist"
  });
  invoice.serviceMonth=month;
  if(residenceKind)invoice.residenceContractId=ownerId;
  else invoice.transportTransactionId=ownerId;
  return invoice;
}
function educationSettleVerifiedMobility(s,input) {
  const invoice=educationEnsureVerifiedMobilityInvoice(s,input);
  return educationSettleInvoice(s,invoice,{
    postingId:invoice.id+":cash-settlement"
  });
}

function educationAnnualOutflow(s,year,account) {
  if(!["personal","household"].includes(account))throw Error("教育会計の集計口座が不正");
  if(!s.educationFinance){
    const old=s.educationAnnualFee;
    return old?.year===year ? (old[account==="personal"?"paidByPersonal":"paidByHousehold"]||0):0;
  }
  const f=educationFinanceState(s);
  const expense=Object.values(f.receipts).filter(x=>
    x.source===account && x.status==="settled" && x.paidAt?.year===year)
    .reduce((n,x)=>n+x.amount,0);
  const refunded=Object.values(f.refunds||{}).filter(x=>
    x.status==="settled" && x.refundedAt?.year===year)
    .flatMap(x=>x.allocation||[]).filter(row=>row.source===account)
    .reduce((n,x)=>n+x.amount,0);
  return expense-refunded;
}
function educationCheckFinanceInvariants(s) {
  const f=s.educationFinance;
  if(!f)return [];
  if(Array.isArray(f.receipts))return ["教育会計の旧領収を正本へ統合していない"];
  const problems=[];
  for(const [id,inv] of Object.entries(f.invoices||{})){
    if(inv.id!==id || inv.gross-inv.discountTotal!==inv.net ||
       inv.paid<0||inv.paid>inv.net||inv.refunded<0||inv.refunded>inv.paid ||
       (inv.status!=="void"&&inv.outstanding!==inv.net-inv.paid))
      problems.push(id+":請求明細・残額が不整合");
    const receipts=inv.receiptIds.map(rid=>f.receipts[rid]).filter(Boolean);
    if(receipts.length!==inv.receiptIds.length ||
      receipts.reduce((n,x)=>n+x.amount,0)!==inv.paid)
      problems.push(id+":領収と既払額が不一致");
    const refunds=inv.refundIds.map(rid=>f.refunds[rid]).filter(Boolean);
    if(refunds.length!==inv.refundIds.length ||
      refunds.reduce((n,x)=>n+x.amount,0)!==inv.refunded)
      problems.push(id+":返金と払戻額が不一致");
  }
  for(const row of Object.values(f.receipts||{}))if(row.source==="contract-loan"){
    const contract=loanContract(s,row.sourceRef);
    if(!contract || contract.principal!==row.amount ||
       !f.loans[row.sourceRef] || f.loans[row.sourceRef].invoiceId!==row.invoiceId)
      problems.push(row.id+":貸付契約と学校受領の突合不可");
  }
  if((s.cash||0)<0||(s.house?.cash||0)<0)
    problems.push("教育会計確認時の口座が負残高");
  return problems;
}
