function childHouseholdFinances(s, costPm, regionPm = s.res.pm) {
  let living = 0,
    education = 0,
    income = 0,
    remittance = 0,
    care = 0,
    housing = 0,
    divorceSupport = 0;
  for (const child of s.kids || []) {
    if (child.d) continue;
    const age = s.year - child.by,
      dependent = childIsSupported(s, child),
      share = childResidenceCostShare(s, child),
      localPm = childResidenceEconomicIndex(s, child, "pm"),
      childCostPm = (localPm / (s.res?.pm || 1)) * costPm;
    living +=
      (age < 6
        ? P("economy.childCareAnnualCost")
        : age < 15
          ? P("economy.childLivingAnnualCost")
          : age < 18
            ? P("economy.childTeenAnnualCost")
            : dependent
              ? P("economy.adultChildSupportAnnualCost")
              : 0) *
      share *
      childCostPm;
    if (age >= 18 && dependent && child.householdStatus !== "independent") {
      housing += P("economy.adultChildSharedHousingAnnualCost") * share * childCostPm;
      living += P("economy.adultChildSharedHousingAnnualCost") * share * childCostPm;
    }
    if (child.inf && dependent && (child.tx || child.careSupport !== 0)) {
      const careBase = childAnnualMedicalExpense(s, child, !!child.tx, costPm);
      care += careBase;
      living += careBase;
    }
    if (child.householdStatus === "study")
      education += P("economy.adultChildStudyAnnualCost") * share * childCostPm;
    if (dependent && child.householdStatus === "working" && Number.isInteger(child.jobId) && J[child.jobId])
      income +=
        dependentEmploymentAnnualIncome(s, child, s.year, {
          jobId: child.jobId, region: child.region || s.res.n
        }) *
        P("economy.childHouseholdContributionShare") *
        share;
    if (child.householdStatus === "independent" && child.remittanceAnnual > 0)
      remittance += child.remittanceAnnual;
    if (age < P("life.adultStartAge") && child.householdResidencePlan === "former_support")
      divorceSupport += divorceChildSupportAnnualCost(s, child);
  }
  return {
    living,
    housing,
    education,
    income,
    remittance: remittance * costPm,
    divorceSupport,
    careTravel: infectionCareTravelPortion(care, s)
  };
}
// The former spouse's current cash balance is not modeled, so record matching remittance receipts without inventing assets.
function recordDivorceChildSupportPayments(s) {
  for (const child of s.kids || []) {
    if (
      child.d ||
      s.year - child.by >= P("life.adultStartAge") ||
      child.householdResidencePlan !== "former_support" ||
      child.divorceSupportPaidYear === s.year
    ) continue;
    const recipient = formerSpouseForChild(s, child);
    if (!recipient || formerSpouseDeathKnown(recipient)) continue;
    const amount = divorceChildSupportAnnualCost(s, child),
      transactionId = `${child.id}::divorce-support::${s.year}`,
      receipt = { year: s.year, amount, transactionId, childId: child.id, fromId: "player", recipientId: recipient.id };
    child.divorceSupportPaidYear = s.year;
    child.divorceSupportPaidAmount = amount;
    child.divorceSupportPaidTotal = (child.divorceSupportPaidTotal || 0) + amount;
    child.divorceSupportReceipts || (child.divorceSupportReceipts = []);
    child.divorceSupportReceipts.push(receipt);
    child.divorceSupportReceipts = child.divorceSupportReceipts.slice(-16);
    recipient.childSupportReceipts || (recipient.childSupportReceipts = []);
    recipient.childSupportReceipts.push({ ...receipt });
    recipient.childSupportReceipts = recipient.childSupportReceipts.slice(-16);
  }
}
function adultChildVisitRoute(
  s,
  child = (s.kids || []).find(item => item.id === s.eventRelativeId && !item.d)
) {
  if (!child || child.d || child.householdStatus !== "independent") return null;
  const movePending = (child.moveHistory?.length || 0) > (child.knownMoveCount || 0);
  if (movePending) return null;
  const destination = child.knownRegion;
  if (!destination || !REG.some(region => region.n === destination)) return null;
  const price = s.res.pm * (s.priceIndex || 1),
    localVisit = P("economy.adultChildLocalVisitBaseCost");
  if (destination === s.res.n)
    return { from: s.res.n, to: destination, kind: "local", fare: Math.round(localVisit * price) };
  const route = (MIGRATION_ROUTES[s.res.n] || []).find(item => item.n === destination);
  return route
    ? {
        from: s.res.n,
        to: destination,
        kind: "regional",
        fare: Math.round((2 * route.fare + localVisit) * price)
      }
    : null;
}
function adultChildVisitAffordable(s, child) {
  const trip = adultChildVisitRoute(s, child);
  return !!trip && moveFunds(s) >= trip.fare + annualCashReserve(s);
}
function adultChildReturnRoomSetupCost(s) {
  return P("family.adultChildReturnRoomSetupCost") * s.res.pm * (s.priceIndex || 1);
}
function adultChildReturnAnnualCost(s, child) {
  if (!child || !Number.isFinite(child.by) || s.year - child.by < 18) return 0;
  const care = child.inf
    ? P(child.tx ? "economy.childInfectionTreatmentAnnualCost" : "economy.childInfectionCareAnnualCost") *
      infectionCareTravelCostScale(s)
    : 0;
  return (
    (P("economy.adultChildSupportAnnualCost") + P("economy.adultChildSharedHousingAnnualCost") + care) *
    s.res.pm *
    (s.priceIndex || 1)
  );
}
function adultChildReturnRoomSetupAffordable(s, child) {
  if (!child || child.d || !Number.isFinite(child.by)) return false;
  if (Number.isFinite(child.returnRoomSetupYear)) return true;
  return moveFunds(s) >= adultChildReturnRoomSetupCost(s) + annualCashReserve(s);
}
function siblingVisitRoute(
  s,
  sibling = siblingsOf(s).find(item => item.id === s.eventRelativeId && !item.d)
) {
  if (!sibling || sibling.d || !sibling.independentSinceYear) return null;
  const movePending = (sibling.moveHistory?.length || 0) > (sibling.knownMoveCount || 0);
  if (movePending) return null;
  const destination = sibling.knownRegion;
  if (!destination || !REG.some(region => region.n === destination)) return null;
  const price = s.res.pm * (s.priceIndex || 1),
    base = P("economy.siblingVisitBaseCost");
  if (destination === s.res.n)
    return { from: s.res.n, to: destination, kind: "local", fare: Math.round(base * price) };
  const route = (MIGRATION_ROUTES[s.res.n] || []).find(item => item.n === destination);
  return route
    ? { from: s.res.n, to: destination, kind: "regional", fare: Math.round((2 * route.fare + base) * price) }
    : null;
}
function siblingVisitAffordable(s, sibling) {
  const trip = siblingVisitRoute(s, sibling);
  return !!trip && moveFunds(s) >= trip.fare + annualCashReserve(s);
}
function childFutureContext(s,child) {
  return JSON.stringify([child.householdStatus,child.studyCompletedYear,child.trainingCompletedYear,
    child.studyEndYear,child.knownJobId,child.knownRegion,!!child.infKnown,
    s.year-child.by>=18]);
}
const childForEvent = (s, id) => {
  const children = (s.kids || []).filter(x => !x.d);
  if (id === "family_child_exposure_followup")
    return (
      children
        .filter(
          x =>
            x.exposurePending &&
            x.contactState !== "ended" &&
            x.contactState !== "paused" &&
            Number.isFinite(x.exposureReviewYear) &&
            x.exposureReviewYear <= s.year
        )
        .sort((a, b) => a.exposureReviewYear - b.exposureReviewYear)[0] || null
    );
  if (id === "family_child_bereavement") return children.length ? pick(children) : null;
  if (id === "family_child_future") {
    const due = children.filter(x => {
      const age = s.year - x.by,
        firstDiscussion = x.futurePlanYear == null && age <= P("family.childFutureDiscussionMaxAge"),
        reviewDue = Number.isFinite(x.futurePlanReviewYear) && x.futurePlanReviewYear <= s.year &&
          (x.futurePlanSupportHistory?.at(-1)?.kind==='revisit' ||
           x.futurePlanReviewContext!==childFutureContext(s,x));
      return (
        age >= P("family.childFutureDiscussionMinAge") &&
        (firstDiscussion || reviewDue) &&
        x.householdStatus !== "independent" &&
        x.contactState !== "ended" && x.contactState !== "paused"
      );
    });
    return due.sort((a,b)=>(a.futurePlanReviewYear ?? a.by)-(b.futurePlanReviewYear ?? b.by) ||
      String(a.id).localeCompare(String(b.id)))[0] || null;
  }
  if (id === "adult_child_contact") {
    const grown = children.filter(
      x => s.year - x.by >= 18 && (x.contactReviewYear == null || x.contactReviewYear <= s.year)
    );
    // Eligibility, choice display, and dispatch must agree on the same child.
    const stable = candidates => {
      if (!candidates.length) return null;
      const sorted = candidates.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
      return sorted[((s.year % sorted.length) + sorted.length) % sorted.length];
    };
    const moved = grown.filter(x => (x.moveHistory?.length || 0) > (x.knownMoveCount || 0));
    if (moved.length) return stable(moved);
    const request = grown.filter(x => Number.isFinite(x.returnRequestYear));
    if (request.length) return stable(request);
    const pending = grown.filter(x => Number.isFinite(x.returnOfferYear));
    if (pending.length) return stable(pending);
    const supported = grown.filter(x => (x.remittanceAnnual || 0) > 0);
    return stable(supported.length ? supported : grown);
  }
  if (id === "adult_child_memory" || id === "life_personal_wishes") {
    const grown = children.filter(x => s.year - x.by >= 18);
    return grown.length ? pick(grown) : null;
  }
  const dependents = children.filter(x => childIsSupported(s, x));
  if (id === "fam_child_care") {
    const infected = dependents.filter(x => x.inf);
    return infected.length ? pick(infected) : null;
  }
  if (["fam_child_inf", "family_child_crystal_exposure"].includes(id)) {
    const uninfected = dependents.filter(x => !x.inf && !x.exposurePending);
    return uninfected.length ? pick(uninfected) : null;
  }
  const infected = dependents.filter(x => x.inf);
  return infected.length ? pick(infected) : dependents.length ? pick(dependents) : null;
};
function adultChildBudgetNote(s, child) {
  const row = child?.budgetHistory?.at(-1);
  if (!row) return "家計の話にはならなかった。次の便りでは、仕事や住まいのことを尋ねようと思った。";
  if (!Number.isFinite(row.net))
    return "仕事の話は聞けたが、毎月の支払いまでは分からなかった。次に返事を書くとき、住まいの様子を尋ねてみる。";
  return row.net < 0
    ? "便りにあった仕事とこの町の家賃や食費を比べると、毎月のやりくりは厳しそうだった。何に困っているのか、次の便りで尋ねることにした。"
    : "便りにあった仕事とこの町の家賃や食費を書き出した。暮らしは何とか回っていそうだが、仕事の忙しさは次の便りでも聞くことにした。";
}
function adultChildEmergencyAidCost(s) {
  return 1e5 * s.res.pm * (s.priceIndex || 1);
}
function adultChildEmergencyAidAffordable(s, child = childForEvent(s, "adult_child_contact")) {
  const row = child?.budgetHistory?.at(-1);
  return (
    child?.householdStatus === "independent" &&
    !!row &&
    Number.isFinite(row.net) &&
    row.net < 0 &&
    s.year - row.year <= 2 &&
    moveFunds(s) >= adultChildEmergencyAidCost(s) + annualCashReserve(s)
  );
}
function advanceIndependentChildLives(s) {
  for (const child of s.kids || []) {
    if (
      child.d ||
      child.householdStatus !== "independent" ||
      !Number.isFinite(child.moveReviewYear) ||
      s.year < child.moveReviewYear
    )
      continue;
    child.moveReviewYear =
      s.year + rnd(P("family.adultChildMoveReviewMinYears"), P("family.adultChildMoveReviewMaxYears"));
    if (R() >= P("family.adultChildMoveChance")) continue;
    const origin = REG.find(r => r.n === child.region),
      routes = origin
        ? (MIGRATION_ROUTES[origin.n] || []).filter(route => REG.some(r => r.n === route.n))
        : [];
    if (!routes.length) continue;
    const destination = wp(routes.map(route => ({ w: route.w, route }))).route,
      wealthIndex = s.w?.i ?? 2,
      jobs = SIM_TABLES.parentJobs.map(job => ({
        ...job,
        w: job.w * (job.jobId <= 2 ? [3, 2, 1, 0.5, 0.2][wealthIndex] : [0.2, 0.5, 1, 2, 4][wealthIndex])
      })),
      job = wp(jobs).jobId,
      from = child.region;
    child.region = destination.n;
    child.jobId = job;
    recordDependentEmployment(s, child, {jobId: job, region: destination.n,
      source: "independent-child-work-and-move", kind: "background-livelihood"});
    child.moveHistory || (child.moveHistory = []);
    child.moveHistory.push({ year: s.year, from, to: destination.n, jobId: job, cause: "仕事や暮らしの縁" });
    child.returnOfferYear = null;
    if (R() < P("family.adultChildReturnRequestChance")) child.returnRequestYear = s.year;
    child.contactReviewYear = Math.min(child.contactReviewYear ?? s.year, s.year);
  }
}
function advanceIndependentChildBudgets(s) {
  for (const child of s.kids || []) {
    if (child.d || child.householdStatus !== "independent" || s.year - child.by < P("life.adultStartAge"))
      continue;
    const region = REG.find(item => item.n === child.region) || s.res;
    if (
      !Number.isInteger(child.budgetExpenseTier) ||
      child.budgetExpenseTier < 0 ||
      child.budgetExpenseTier >= EXP.length
    )
      child.budgetExpenseTier = Math.max(0, Math.min(EXP.length - 1, s.originWealth?.i ?? s.w?.i ?? 2));
    if (!Number.isInteger(child.budgetStartedYear)) child.budgetStartedYear = s.year;
    if (!Array.isArray(child.budgetHistory)) child.budgetHistory = [];
    if (child.budgetHistory.some(row => row.year === s.year)) continue;
    const priceIndex = Math.max(0.1, s.priceIndex || 1),
      job = Number.isInteger(child.jobId) ? J[child.jobId] : null,
      income = job ? dependentEmploymentAnnualIncome(s, child, s.year, {
        jobId: child.jobId, region: region.n, priceIndex
      }) : null,
      living =
        Math.max(P("economy.minimumExpenseBase"), EXP[child.budgetExpenseTier] || EXP[2]) *
        region.pm *
        priceIndex,
      support =
        Math.max(0, child.remittanceAnnual || 0) * s.res.pm * priceIndex * localityLivingMultiplier(s) +
        (child.aidTransfers || [])
          .filter(transfer => transfer.year === s.year)
          .reduce((sum, transfer) => sum + transfer.amount, 0),
      net = Number.isFinite(income) ? income + support - living : null;
    const row = {
      year: s.year,
      region: region.n,
      jobId: job ? child.jobId : null,
      income,
      support,
      living,
      net
    };
    child.budgetHistory.push(row);
    child.budgetHistory = child.budgetHistory.slice(-16);
    child.budgetUpdatedYear = s.year;
    if (net < 0 && child.contactState !== "paused")
      child.contactReviewYear = Math.min(child.contactReviewYear ?? s.year, s.year + 1);
  }
}
