function applyStatEffects(e, s) {
  for (const k of ["h", "p", "k", "rl", "ar", "cr", "ep"])
    if (e[k]) {
      const diminishing =
        k === "k" || k === "rl" ? Math.max(0.08, 1 - Math.pow(Math.max(0, s[k]) / 111, 1.6)) : 1;
      const delta=e[k]*(e[k]>0?diminishing:1);
      s[k] = clamp(s[k] + wellbeingDelta(s,k,delta), 0, k === "ep" ? 200 : 100);
    }
  if (Number.isFinite(e.equityGain) && e.equityGain !== 0) {
    const model = socialModel(s);
    model.equityCommitment = clamp((model.equityCommitment || 0) + e.equityGain, 0, 100);
  }
  if (Number.isFinite(e.literacyGain) && e.literacyGain !== 0) {
    const social = socialModel(s);
    if (social.literacy === null) social.literacy = literacyValue(s);
    social.literacy = clamp(
      social.literacy + e.literacyGain * Math.max(0.12, 1 - social.literacy / 112),
      0,
      100
    );
  }
  if (e.socialContact) {
    const m = socialModel(s),
      group = e.socialContact;
    if (group === "infected" || group === "sarkaz")
      m.contacts[group] = Math.min(12, (m.contacts[group] || 0) + 1);
  }
}

function infectCoResidentAfterCatastrophe(person, s, chance, cause, knowledgeField) {
  if (!person || person.d || person.inf || R() >= chance) return false;
  const infected = { ...person, year: s.year, r: person.r || s.r, ob: person.ob || 0 };
  initializeInfection(infected, "dust");
  person.inf = 1;
  person.ob = infected.ob;
  person.ac = infected.ac;
  person.infectionOnset = infected.infectionOnset;
  person.infYear = s.year;
  person.infCause = cause;
  person[knowledgeField] = 0;
  person.infection = { year: s.year, cause, basis: "catastrophe-exposure", diagnosedYear: null };
  return true;
}

function applyCatastropheInfectionChecks(s, chance) {
  if (!Number.isFinite(chance) || chance <= 0 || chance > 0.05) return;
  const cause = "天災後に吸い込んだ源石粉塵への曝露";
  if (!s.inf && R() < chance) {
    applyInfectionAndContactEffects(
      { inf: 1, infectionRoute: "dust", infCause: cause },
      s
    );
  }
  if (!inSharedHousehold(s)) return;
  const parentKeys = s.care?.parentKeys?.length ? s.care.parentKeys : ["fa", "mo"];
  for (const key of parentKeys)
    infectCoResidentAfterCatastrophe(s.par?.[key], s, chance, cause, "infectionKnown");
  for (const sibling of siblingsOf(s))
    if (!sibling.independentSinceYear && sibling.contactState !== "ended")
      infectCoResidentAfterCatastrophe(sibling, s, chance, cause, "infKnown");
}

function applyInfectionAndContactEffects(e, s) {
  if (e.ob && s.inf) s.ob = clamp(s.ob + e.ob, 0, 100);
  if (e.exposureAction) oriApplyAction(s, e.exposureAction);
  if (e.inf && !s.inf) {
    recordInfectionPrior(s, "event-exposure");
    initializeInfection(s,e.infectionRoute, e.ob);
    s.infection = {
      year: s.year,
      cause: e.infCause || "源石への曝露が疑われるが詳細未確認",
      basis: e.infCause ? "event-recorded" : "event-unclassified",
      diagnosedYear: e.fl?.dg ? s.year : null
    };
    oriRecord(s, "event-infection", e.infCause || "個別イベントで鉱石病の感染状態に移行", {
      certainty: "event-described"
    });
  } else if (e.infCause && s.inf && s.infection) {
    oriRecord(s,"repeat-exposure",e.infCause,{route:e.infectionRoute||"unconfirmed"});
  }
  if (e.fl?.dg === 1 && s.inf) {
    s.infection || (s.infection = { year: s.year, cause: "感染経路未確認", basis: "event-unclassified" });
    const newlyDiagnosed=s.infection.diagnosedYear==null;
    s.infection.diagnosedYear ??= s.year;
    if(newlyDiagnosed)importantLifeNotification(s,"diagnosis");
    s.infection.diagnosisBasis ||= "イベントで確認した検査・診断";
    oriState(s).reviewDueYear = null;
    oriRecord(s, "diagnosis", "検査で鉱石病と診断された");
  }
  if (e.catastropheInfectionChance != null)
    applyCatastropheInfectionChecks(s, e.catastropheInfectionChance);
  if (Number.isFinite(e.careInclination) && e.careInclination > 0) {
    const before = s.careInclination ?? 50,
      after = clamp(before + e.careInclination, 0, 100);
    s.careInclination = after;
    if (after !== before) {
      s.careInclinationHistory || (s.careInclinationHistory = []);
      s.careInclinationHistory.push({
        year: s.year,
        age: s.age,
        sourceEventId: TRACE_RESOLUTION?.id || null,
        choice: TRACE_RESOLUTION?.label || e.label || "家族ケアの判断",
        delta: after - before,
        before,
        after
      });
      if (s.careInclinationHistory.length > 40)
        s.careInclinationHistory.splice(0, s.careInclinationHistory.length - 40);
    }
  }
  for (const [key, deltaValue] of [
    ["biasInfected", e.biasInf],
    ["biasSarkaz", e.biasSar]
  ]) {
    const formation = !!e.fl?.[key === "biasInfected" ? "bias_inf_formed" : "bias_sar_formed"];
    if (deltaValue || formation) {
      const delta = Number.isFinite(deltaValue) ? deltaValue : 0,
        adult = s.age >= P("life.adultStartAge"),
        change = adult && delta < 0 ? delta * 0.18 : delta,
        before = s[key] || 0,
        after = clamp(before + change, 0, 100),
        effectiveDelta = after - before;
      s[key] = after;
      s.attitudeHistory || (s.attitudeHistory = []);
      s.attitudeHistory.push({
        year: s.year,
        age: s.age,
        attitude: key === "biasInfected" ? "infected" : "sarkaz",
        sourceEventId: TRACE_RESOLUTION?.id || null,
        choice: TRACE_RESOLUTION?.label || e.label || null,
        inputDelta: delta,
        effectiveDelta,
        before,
        after,
        formation
      });
      if (s.attitudeHistory.length > 40) s.attitudeHistory.splice(0, s.attitudeHistory.length - 40);
    }
  }
  if (e.careNetworkContact) {
    const n = s.care?.supportNetwork;
    if (n) {
      n.contactHistory || (n.contactHistory = []);
      const action = e.careNetworkContact;
      if (action === "start") {
        if (
          n.contactState === "within_care" ||
          n.contactState === "active" ||
          n.contactState === "unrecorded"
        ) {
          n.contactState = "active";
          n.contactReviewYear = s.year + 1;
          n.reconnectInviteYear = null;
          n.contactHistory.push({ year: s.year, state: "review_scheduled", reason: "家計分離後の関係確認" });
        }
      } else if (action === "regular" || action === "visit") {
        n.contactState = "active";
        n.contactEndedYear = null;
        n.reconnectInviteYear = null;
        n.contactReviewYear = s.year + rnd(3, 6);
        n.lastContactYear = s.year;
        n.contactHistory.push({ year: s.year, state: action });
      } else if (action === "distant") {
        n.contactState = "distant";
        n.contactReviewYear = s.year + rnd(5, 8);
        n.lastContactYear = s.year;
        n.contactHistory.push({ year: s.year, state: "distant" });
      } else if (action === "end") {
        n.contactState = "ended";
        n.status = "ended";
        n.endedYear = s.year;
        n.contactEndedYear = s.year;
        n.contactReviewYear = null;
        n.reconnectInviteYear = s.year + rnd(4, 8);
        n.contactHistory.push({ year: s.year, state: "ended" });
      } else if (action === "reopen") {
        n.contactState = "active";
        n.status = "active";
        n.endedYear = null;
        n.contactEndedYear = null;
        n.reconnectInviteYear = null;
        n.contactReviewYear = s.year + rnd(3, 6);
        n.lastContactYear = s.year;
        n.contactHistory.push({ year: s.year, state: "reopened" });
      } else if (action === "decline") {
        n.contactState = "ended";
        n.status = "ended";
        n.endedYear = n.endedYear || s.year;
        n.contactEndedYear = n.contactEndedYear || s.year;
        n.contactReviewYear = null;
        n.reconnectInviteYear = null;
        n.contactHistory.push({ year: s.year, state: "recontact_declined" });
      }
      n.contactHistory = n.contactHistory.slice(-20);
    }
  }
  if (e.careNetworkMoveNotice === 1) confirmCareNetworkMoveNotice(s);
  if (e.careNetworkMemberMoveNotice === 1) confirmCareNetworkMoveNotice(s);
  if (e.careNetworkMemberDeathNotice === 1) confirmCareNetworkMemberDeathNotice(s);
  if (e.careNetworkMemberMissingNotice === 1) confirmCareNetworkMemberMissingNotice(s, !!e.careNetworkSearch);
  if (e.careNetworkMemberFoundNotice === 1) confirmCareNetworkMemberFoundNotice(s);
  if (e.contactMissingNotice === 1) confirmSocialContactMissingNotice(s, !!e.contactSearch);
  if (e.contactFoundNotice === 1) confirmSocialContactFoundNotice(s);
  if (e.contactRecontactNotice === 1) confirmSocialContactRecontactNotice(s);
  if (e.contactReconnect) {
    const person = [s.friendContact, s.neighborContact].find(contact => contact?.id === s.eventRelativeId);
    if (person) {
      if (e.contactReconnect === "request") {
        person.recontactIntent = "requested";
        person.knownRecontactStatus = "requested";
        person.recontactReviewYear = s.year + 1;
      } else if (e.contactReconnect === "continue") {
        person.recontactIntent = "none";
        person.knownRecontactStatus = "reconnected";
        person.recontactReviewYear = null;
      } else if (e.contactReconnect === "close") {
        person.recontactIntent = "closed";
        person.knownRecontactStatus = "closed";
        person.recontactReviewYear = null;
      }
    }
  }
}

function loanContracts(s) {
  if (!Array.isArray(s.loanContracts)) s.loanContracts = [];
  return s.loanContracts;
}
function loanContract(s, id) {
  return (Array.isArray(s?.loanContracts) ? s.loanContracts : []).find(row => row.id === id) || null;
}
function loanContractAccount(s, account) {
  if (account === "household") return s.house || (s.house = {cash:0,debt:0,inc:0,exp:0});
  if (account === "personal") return s;
  throw new Error("契約債務の会計区分が不正");
}
function loanContractOutstanding(s, account) {
  return (Array.isArray(s?.loanContracts) ? s.loanContracts : [])
    .filter(row => row.account === account && row.balance > 0 && ["open","overdue","unresolved-at-death"].includes(row.status))
    .reduce((sum,row) => sum + row.balance, 0);
}
function loanContractBalance(s, id) {
  return loanContract(s,id)?.balance || 0;
}
function loanContractPaymentAmount(contract, amount) {
  if (!contract) return 0;
  if (amount === "balance") return Math.max(0,contract.balance);
  if (amount === "installment") return Math.max(0,contract.installment || 0);
  return Number.isFinite(amount) ? Math.max(0,Math.round(amount)) : 0;
}
function loanContractPaymentAffordable(s, id, amount) {
  const contract=loanContract(s,id);
  if (!contract || contract.balance <= 0 || !["open","overdue"].includes(contract.status)) return false;
  const due=Math.min(contract.balance,loanContractPaymentAmount(contract,amount)),
    account=loanContractAccount(s,contract.account);
  return due > 0 && (account.cash || 0) >= due;
}
function appendLoanHistory(contract,row) {
  contract.history || (contract.history=[]);
  contract.history.push(row);
  if(contract.history.length>100)contract.history.splice(0,contract.history.length-100);
}
function addLoanContract(s,input,cashScale=1) {
  if(!input || typeof input!=="object")throw new Error("契約債務の内容がありません");
  const id=String(input.contractId || "");
  if(!id || loanContract(s,id))throw new Error("契約債務IDが空か重複しています");
  const account=input.account || "personal",
    scale=Number.isFinite(cashScale) && cashScale>0 ? cashScale : 1,
    principal=Math.max(1,Math.round(Number(input.principal)*scale)),
    totalDue=Math.max(principal,Math.round(Number(input.totalDue)*scale)),
    installment=Number.isFinite(input.installmentShare)
      ? Math.max(1,Math.round(totalDue*Math.min(1,input.installmentShare)))
      : Math.max(1,Math.round(Number(input.installment || totalDue)*scale));
  if(!Number.isFinite(principal) || !Number.isFinite(totalDue) ||
     typeof input.borrower!=="string" || typeof input.creditor!=="string" ||
     typeof input.region!=="string" || typeof input.currency!=="string" ||
     typeof input.terms!=="string" || !input.terms ||
     !Number.isInteger(input.dueInYears) || input.dueInYears<1)
    throw new Error("契約債務の署名条件が不正");
  if(!["personal","household"].includes(account))throw new Error("契約債務の会計区分が不正");
  const target=loanContractAccount(s,account),
    contract={
      id, borrower:input.borrower, creditor:input.creditor, region:input.region,
      currency:input.currency, account, kind:input.kind || "personal-loan",
      principal, totalDue, balance:totalDue, installment,
      nonContractualCharges:0, signedYear:s.year, dueYear:s.year+input.dueInYears,
      status:"open", terms:input.terms, sourceEventId:input.sourceEventId || TRACE_RESOLUTION?.id || null,
      history:[{year:s.year,kind:"signed",principal,totalDue,dueYear:s.year+input.dueInYears}]
    };
  loanContracts(s).push(contract);
  target.debt=Math.min(1e12,(target.debt||0)+totalDue);
  if(input.disbursement==="borrower")target.cash=(target.cash||0)+principal;
  updateLoanContractStatuses(s);
  return contract;
}
function recordContractLoanPayment(s,id,amount,source="payment") {
  const contract=loanContract(s,id);
  if(!contract || !["open","overdue"].includes(contract.status))return 0;
  const paid=Math.min(contract.balance,loanContractPaymentAmount(contract,amount));
  if(paid<=0)return 0;
  const target=loanContractAccount(s,contract.account);
  if((target.debt||0)+0.01<paid)throw new Error("契約債務残高と集計負債が一致しません");
  contract.balance=Math.max(0,contract.balance-paid);
  target.debt=Math.max(0,(target.debt||0)-paid);
  appendLoanHistory(contract,{year:s.year,kind:"payment",amount:paid,source});
  if(contract.balance===0){
    contract.status="paid";
    if(contract.id==="lungmen-private-credit" && s.fl)s.fl.debt_yakuza=0;
  }
  return paid;
}
function payContractLoanFromCash(s,id,amount) {
  const contract=loanContract(s,id);
  if(!contract)return 0;
  const target=loanContractAccount(s,contract.account),
    due=Math.min(contract.balance,loanContractPaymentAmount(contract,amount));
  if(due<=0 || (target.cash||0)<due)return 0;
  target.cash-=due;
  return recordContractLoanPayment(s,id,due,"cash-payment");
}
function settleContractDebt(s,account,available) {
  let remaining=Math.max(0,Math.floor(available||0)),paid=0;
  const contracts=(Array.isArray(s?.loanContracts)?s.loanContracts:[])
    .filter(row=>row.account===account && row.balance>0 && ["open","overdue"].includes(row.status))
    .sort((a,b)=>(a.status==="overdue"?0:1)-(b.status==="overdue"?0:1) || a.dueYear-b.dueYear || a.signedYear-b.signedYear);
  for(const contract of contracts) {
    if(remaining<=0)break;
    const amount=Math.min(contract.balance,remaining),
      applied=recordContractLoanPayment(s,contract.id,amount,"annual-surplus");
    remaining-=applied;paid+=applied;
  }
  return paid;
}
function addContractLoanCharge(s,input,cashScale=1) {
  const contract=loanContract(s,input?.contractId);
  if(!contract || !["open","overdue"].includes(contract.status))throw new Error("追加請求の対象となる契約がありません");
  const amount=input.amount==="installment" ? contract.installment :
    input.amount==="balance" ? contract.balance :
    Number.isFinite(input.amount) ? Math.round(input.amount*(cashScale||1)) : 0;
  if(amount<=0)throw new Error("追加請求額が不正");
  contract.balance+=amount;
  contract.nonContractualCharges=(contract.nonContractualCharges||0)+amount;
  const target=loanContractAccount(s,contract.account);
  target.debt=Math.min(1e12,(target.debt||0)+amount);
  appendLoanHistory(contract,{year:s.year,kind:"disputed-charge",amount,reason:String(input.reason||"契約外の請求"),disputed:input.disputed===true});
  return amount;
}
function accrueUncontractedDebtInterest(s,account,rate) {
  const target=loanContractAccount(s,account),
    ordinary=Math.max(0,(target.debt||0)-loanContractOutstanding(s,account));
  if (account === "personal" && (target.debt || 0) >= 30000000) {
    return 0;
  }
  const interest=Math.round(ordinary*Math.max(0,rate||0));
  target.debt=Math.min(account === "personal" ? 35000000 : 1e12,(target.debt||0)+interest);
  return interest;
}
function updateLoanContractStatuses(s) {
  for(const contract of Array.isArray(s?.loanContracts)?s.loanContracts:[]) {
    if(contract.balance<=0){contract.balance=0;contract.status="paid";}
    else if(contract.status!=="unresolved-at-death" && contract.dueYear<s.year)contract.status="overdue";
    else if(contract.status!=="overdue" && contract.status!=="unresolved-at-death")contract.status="open";
  }
}
function finalizeLoanContractsAtDeath(s) {
  for(const contract of Array.isArray(s?.loanContracts)?s.loanContracts:[]) {
    if(contract.balance>0 && ["open","overdue"].includes(contract.status)) {
      contract.status="unresolved-at-death";
      appendLoanHistory(contract,{year:s.year,kind:"unresolved-at-death",amount:contract.balance});
    }
  }
}
function applyMoneyEffects(e, s, cashScale, addMoney, cashAlreadyScaled = false) {
  if(e.debtPlan) {
    if(!["frugal","maintain"].includes(e.debtPlan))throw Error("家計再建の方針が不正");
    s.debtPlan={action:e.debtPlan,year:s.year};
  }
  if (e.sibVisit) {
    const sibling = siblingsOf(s).find(person => person.id === s.eventRelativeId && !person.d),
      trip = siblingVisitRoute(s, sibling);
    if (!trip || !siblingVisitAffordable(s, sibling))
      throw new Error("きょうだいへの訪問経路・費用・生活維持額を家計から用意できません");
    const wallet = inSharedHousehold(s) ? s.house || (s.house = { cash: 0, inc: 0, exp: 0, debt: 0 }) : s;
    addMoney(wallet, -trip.fare);
    sibling.visitHistory || (sibling.visitHistory = []);
    sibling.visitHistory.push({
      year: s.year,
      from: trip.from,
      to: trip.to,
      kind: trip.kind,
      fare: trip.fare,
      paidBy: inSharedHousehold(s) ? "household" : "personal"
    });
    sibling.visitHistory = sibling.visitHistory.slice(-20);
    sibling.visitTotal = (sibling.visitTotal || 0) + trip.fare;
    sibling.visitCount = (sibling.visitCount || 0) + 1;
  }
  if (e.cash) {
    const wallet = inSharedHousehold(s) ? s.house || (s.house = { cash: 0, debt: 0, inc: 0, exp: 0 }) : s;
    addMoney(wallet, e.cash * (cashAlreadyScaled ? 1 : cashScale));
  }
  if (e.sibBereavementSupport) {
    const sibling = siblingsOf(s).find(person => person.id === s.eventRelativeId && person.d);
    if (!sibling) throw new Error("訃報対象のきょうだいが確認できません");
    const family = sibling.familyHousehold,
      recipientIds = family
        ? [
            ...(family.partner && !family.partner.d ? [family.partner.id] : []),
            ...(family.children || []).filter(child => !child.d).map(child => child.id)
          ]
        : [];
    sibling.bereavementSupportHistory || (sibling.bereavementSupportHistory = []);
    const transfer = {
      year: s.year,
      amount: Math.max(0, Math.round(Math.abs(e.cash || 0) * (cashAlreadyScaled ? 1 : cashScale))),
      recipientIds,
      coverage: recipientIds.length ? "tracked_family" : "extended_family_or_community"
    };
    sibling.bereavementSupportHistory.push(transfer);
    sibling.bereavementSupportHistory = sibling.bereavementSupportHistory.slice(-12);
    if (family) {
      family.supportTransfers || (family.supportTransfers = []);
      family.supportTransfers.push({ ...transfer, siblingId: sibling.id });
      family.supportTransfers = family.supportTransfers.slice(-12);
    }
    sibling.postDeathFamilyFinance ||
      (sibling.postDeathFamilyFinance = {
        status: "survivor_economy_untracked",
        deathYear: sibling.d,
        lastKnownYear: Number.isFinite(sibling.financialUpdatedYear) ? sibling.financialUpdatedYear : null
      });
  }
  if (e.selfCash) addMoney(s, e.selfCash * cashScale);
  if (e.familyTransfer) {
    if (!s.house) throw new Error("養育家計がないため資金移行を実行できない");
    const amount = Math.floor(Math.max(0, s.house.cash) * Math.min(1, e.familyTransfer));
    s.house.cash -= amount;
    addMoney(s, amount);
  }
  if (e.investment) s.investment = (s.investment || 0) + e.investment;
  if (e.investmentCashout) {
    const proceeds = Math.max(0, s.investment || 0);
    s.investment = 0;
    s.investmentDelta = 0;
    addMoney(s, proceeds);
  }
  if (e.loanContract) addLoanContract(s,e.loanContract,cashScale);
  if (e.loanPayment) {
    const payment=e.loanPayment,
      paid=payContractLoanFromCash(s,payment.contractId,payment.amount);
    if(paid<=0)throw new Error("契約書の残額または本人の現金から返済額を用意できません");
  }
  if (e.loanCharge) addContractLoanCharge(s,e.loanCharge,cashScale);
  if (e.debt) {
    const account = inSharedHousehold(s) ? s.house || (s.house = { cash: 0, debt: 0, inc: 0, exp: 0 }) : s,
      accountKind=account===s.house?"household":"personal",
      tracked=loanContractOutstanding(s,accountKind),
      ordinary=Math.max(0,(account.debt||0)-tracked);
    account.debt=Math.max(tracked,Math.min(1e12,ordinary+e.debt+tracked));
    if (account.debt === 0 && s.fl?.debt_yakuza) s.fl.debt_yakuza = 0;
  }
  if (e.spouseFinanceTransfer) {
    const finance = s.sp?.personalFinance;
    if (!finance || e.spouseFinanceTransfer < 0) throw new Error("配偶者への資金移転記録がありません");
    repairSpouseFinance(s);
    const amount = Math.max(0, Math.round(e.spouseFinanceTransfer * cashScale));
    let debtPaid = null,
      cashAdded = null;
    if (finance.status === "modeled_balance") {
      debtPaid = Math.min(finance.debt, amount);
      cashAdded = amount - debtPaid;
      finance.debt -= debtPaid;
      finance.cash += cashAdded;
      finance.condition =
        finance.debt > 0
          ? "strained"
          : finance.cash <
              Math.max(P("economy.minimumExpenseBase"), EXP[finance.expenseTier]) *
                spouseResidenceRegion(s).pm *
                (s.priceIndex || 1) *
                0.25
            ? "strained"
            : "stable";
    }
    finance.netChangeSinceStart = (finance.netChangeSinceStart || 0) + amount;
    finance.transfers || (finance.transfers = []);
    finance.transfers.push({
      year: s.year,
      amount,
      direction: "in",
      cause: "主人公から家計支援",
      debtPaid,
      cashAdded
    });
    finance.transfers = finance.transfers.slice(-20);
  }
  if (e.medicalDebt) {
    const account = inSharedHousehold(s) ? s.house || (s.house = { cash: 0, debt: 0, inc: 0, exp: 0 }) : s;
    account.debt = Math.min(
      1e12,
      Math.max(0, account.debt || 0) + Math.max(0, Math.round(e.medicalDebt * cashScale))
    );
  }
}
