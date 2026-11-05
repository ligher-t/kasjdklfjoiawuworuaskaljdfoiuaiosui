// Monthly work claims and receipts. Cash is credited here once; annual budgets
// project these receipts and must not pay them again. All amounts are game values.
function employmentFinance(s) {
  const state = playerEmploymentState(s);
  state.finance ||= { claims: [], receipts: [] };
  return state.finance;
}
function employmentCredit(s, amount, walletKind) {
  if (!(amount > 0)) return;
  const wallet = walletKind === "household"
    ? (s.house ||= { cash: 0, debt: 0, inc: 0, exp: 0 }) : s;
  wallet.cash = (wallet.cash || 0) + amount;
}
function employmentMonthlyTerms(s, episode, year, month) {
  const contract = s.workContract?.episodeId === episode.episodeId ? s.workContract : null,
    site = s.world?.occupationWorld?.sites?.[episode.siteId],
    present = !travelAwayDuringMonth(s, year, month) || contract?.assignment === "external" ||
      episode.mobility === "mobile",
    eligible = !s.dead && !s.fl?.detained && !s.fl?.segregated &&
      !s.fl?.retired && present && !educationFullTime(s),
    hours = contract?.hours === "short" ? P("social.employerShortHoursIncomeFactor") :
      contract?.hours === "long" ? P("social.employerLongHoursIncomeFactor") : 1,
    fraction = Math.max(0, Math.min(1, episode.workFraction ?? 1)),
    rate = (episode.annualBase ?? J[episode.jobId]?.pay ?? 0) / 12,
    kind = episode.kind,
    wage = ["wage-employment", "seasonal-contract"].includes(kind),
    self = kind === "self-employment",
    closes = site?.operationTo,
    beforeClosure = !closes || year * 12 + month < closes.year * 12 + closes.month,
    active = episode.status === "active" && eligible && beforeClosure,
    price = 1 + ((s.priceIndex || 1) - 1) * 0.65,
    bonus = 1 + (contract?.wagePremium || 0) + (s.workPayBonus || 0),
    knowledge = 1 + s.k / P("economy.knowledgeIncomeScale"),
    arts = 1 + s.ar / P("economy.artsIncomeScale"),
    policy = s.f === 2 ? P("economy.workIncomeScale") : s.f === 4 ? P("economy.restIncomeScale") :
      s.f === 7 ? P("economy.familyIncomeScale") : s.f === 8 ? P("economy.riskyWorkIncomeScale") : 1,
    gross = active && (wage || self)
      ? Math.max(0, rate * (episode.payRegionPm ?? s.res.pm) * price * fraction * hours * bonus *
        personalWorkCapacity(s) * knowledge * arts * (s.t.inc || 1) * policy *
        (1 - employmentDiscriminationPenalty(s)) * (s.fl.reduced_work ? 0.65 : 1)) : 0,
    expenses = self ? gross * (episode.expenseShare ?? 0.35) : 0;
  return { gross, expenses, net: Math.max(0, gross - expenses),
    paid: site?.status !== "suspended" && episode.paymentStatus !== "withheld",
    siteStatus: site?.status || null, present, workFraction: active ? fraction : 0 };
}
function settleEmploymentThrough(s, year, throughMonth) {
  if (!s?.employmentState?.episodes?.length || !Number.isInteger(year)) return;
  const month = Math.max(0, Math.min(12, throughMonth)), finance = employmentFinance(s);
  for (const episode of s.employmentState.episodes) {
    if (!["wage-employment", "seasonal-contract", "self-employment", "family-community", "coerced-assignment"].includes(episode.kind)) continue;
    const endYear = episode.endYear ?? episode.scheduledEndAt?.year ?? Infinity;
    if (year < episode.startYear || year > endYear || (episode.payThrough?.year ?? -Infinity) > year) continue;
    const closedMonth = episode.endYear === year ? episode.endMonth : episode.scheduledEndAt?.year === year
      ? episode.scheduledEndAt.month : 13;
    const first = Math.max(episode.startYear === year ? episode.startMonth : 1,
      episode.payThrough?.year === year ? episode.payThrough.month + 1 : 1),
      end = Math.min(month, closedMonth - 1);
    for (let payMonth = first; payMonth <= end; payMonth++) {
      const claimId = episode.episodeId + ":" + year + ":" + payMonth;

      // Events flush completed months before changing terms. Thus earlier months
      // never inherit a later promotion, diagnosis, move or reduced-hours agreement.
      const terms = employmentMonthlyTerms(s, episode, year, payMonth),
        wallet = inSharedHousehold(s) ? "household" : "personal",
        claim = { claimId, episodeId: episode.episodeId, personId: episode.personId,
          employerId: episode.employerId, siteId: episode.siteId,
          worksiteId: episode.postingSiteId || episode.siteId,
          year, month: payMonth, kind: episode.kind,
          gross: terms.gross, expenses: terms.expenses, amount: terms.net,
          wallet, status: terms.paid ? "paid" : "unpaid", ...{ workFraction: terms.workFraction } };
      finance.claims.push(claim);
      episode.payThrough = { year, month: payMonth };
      if (terms.paid && claim.amount > 0) {
        employmentCredit(s, claim.amount, wallet);
        finance.receipts.push({ receiptId: claimId, claimId, episodeId: episode.episodeId,
          personId: episode.personId, year, month: payMonth, amount: claim.amount, wallet,
          kind: episode.kind === "self-employment" ? "net-self-profit" : "wages" });
      }
    }
  }
}
function employmentPaidForYear(s, year, wallet = "personal") {
  return (s.employmentState?.finance?.receipts || []).filter(row =>
    row.year === year && row.wallet === wallet && row.kind !== "gig").reduce((sum, row) => sum + row.amount, 0);
}
function employmentMealAvailable(s, sourceEventId) {
  const episode = currentPlayerEmployment(s);
  if (episode?.kind !== "family-community" || episode.localityKey !== localityKey(s) ||
      s.dead || restricted(s) || travelPresence(s).mode !== "residence" ||
      (s.employmentState.finance?.meals || []).some(row => row.year === s.year)) return false;
  if (sourceEventId === "work_family_shop_in_kind") {
    const business = resolveEmploymentLivelihoodResource(s, "family-community", 5, "family-business");
    return episode.roleId === "apprentice" && business?.resourceId === episode.resourceId;
  }
  return sourceEventId === "work_w11_community_bowl" &&
    ["サーミ", "カズデル"].includes(s.res.n) && [69, 70, 71, 75].includes(episode.jobId);
}
function recordEmploymentMeal(s, sourceEventId) {
  if (!employmentMealAvailable(s, sourceEventId)) throw Error("食事を分けてもらう条件が変わった");
  const episode = currentPlayerEmployment(s), finance = employmentFinance(s);
  finance.meals ||= [];
  finance.meals.push({
    episodeId: episode.episodeId, resourceId: episode.resourceId,
    sourceEventId, year: s.year, month: s.mo || 1,
    wallet: inSharedHousehold(s) ? "household" : "personal",
    livingCostOffset: P("economy.minimumExpenseBase") * s.res.pm * (s.priceIndex || 1) / (365 * 3)
  });
}
function employmentMealOffset(s, year, wallet) {
  return (s.employmentState?.finance?.meals || []).find(row =>
    row.year === year && row.wallet === wallet)?.livingCostOffset || 0;
}
function employmentInKindOffset(s, year, wallet) {
  return (s.employmentState?.finance?.inKindAllocations || []).filter(row =>
    row.serviceYear === year && row.wallet === wallet)
    .reduce((sum, row) => sum + row.livingCostOffset, 0);
}
function employmentInKindSupportAvailable(s, sourceEventId) {
  const episode=currentPlayerEmployment(s), month=s.mo || 1,
    eligible=sourceEventId==="work_sami_winter_food_share" && s.res?.n==="サーミ" &&
      month>=8 && month<=10 && episode?.kind==="family-community" &&
      [69,70,71].includes(episode.jobId) && !!episode.resourceId &&
      episode.localityKey===localityKey(s) &&
      !s.dead && !restricted(s) && travelPresence(s).mode==="residence";
  if(!eligible)return false;
  const allocationId="sami-winter-share:"+episode.resourceId+":"+s.year;
  return !(s.employmentState?.finance?.inKindAllocations || []).some(row=>row.allocationId===allocationId);
}
function recordEmploymentInKindAllocation(s, sourceEventId, supportShare) {
  if(!employmentInKindSupportAvailable(s,sourceEventId) || ![0.5,1].includes(supportShare))
    throw Error("冬季の現物分配を受け取る条件が変わった");
  const episode=currentPlayerEmployment(s), finance=employmentFinance(s), month=s.mo || 1,
    allocationId="sami-winter-share:"+episode.resourceId+":"+s.year,
    wallet=inSharedHousehold(s)?"household":"personal",
    first=month+1, mealValue=P("economy.minimumExpenseBase")*s.res.pm*(s.priceIndex||1)/(365*3),
    rows=[];
  finance.inKindAllocations ||= [];
  for(let offset=0;offset<4;offset++){
    const absolute=first+offset, serviceYear=s.year+Math.floor((absolute-1)/12),
      serviceMonth=((absolute-1)%12)+1;
    const row={allocationId,episodeId:episode.episodeId,resourceId:episode.resourceId,
      sourceEventId,recipientId:wallet==="household"?(s.householdId||"shared-household"):episode.personId,
      wallet,serviceYear,serviceMonth,livingCostOffset:mealValue*30*supportShare,
      basis:"recorded-community-winter-ration"};
    finance.inKindAllocations.push(row);rows.push(row);
  }
  return rows;
}
function employmentUnpaidAmount(s, episodeId = null) {
  return (s.employmentState?.finance?.claims || []).filter(row => row.status === "unpaid" &&
    (!episodeId || row.episodeId === episodeId)).reduce((sum, row) => sum + row.amount, 0);
}
function payEmploymentArrears(s, episodeId) {
  const finance = employmentFinance(s);
  for (const claim of finance.claims) {
    if (claim.episodeId !== episodeId || claim.status !== "unpaid") continue;
    claim.status = "paid";
    employmentCredit(s, claim.amount, claim.wallet);
    finance.receipts.push({ receiptId: claim.claimId, claimId: claim.claimId,
      episodeId, personId: claim.personId, year: s.year, month: s.mo,
      amount: claim.amount, wallet: claim.wallet, kind: "arrears" });
  }
}
function recordEmploymentGigPayment(s, action, amount, wallet) {
  const episode = s.employmentState?.episodes?.findLast(row => row.kind === "gig" &&
    row.sourceEventId === action.sourceEventId && row.startYear === s.year && row.startMonth === (s.mo || 1));
  if (!episode) throw Error("短期業務の支払先の実績がない");
  const finance = employmentFinance(s), receiptId = episode.episodeId + ":payment";
  if (finance.receipts.some(row => row.receiptId === receiptId)) throw Error("短期報酬の二重受取");
  episode.paidCash = amount;
  finance.receipts.push({ receiptId, episodeId: episode.episodeId, personId: episode.personId,
    year: s.year, month: s.mo, amount, wallet, kind: "gig" });
}
