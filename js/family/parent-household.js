function beginSeparatedParentLedger(s) {
  if (!s.house) s.house = { cash: 0, debt: 0, inc: 0, exp: 0 };
  if (s.house.parentLedger?.status === "tracked") return;
  const caregiverKeys = (s.care?.parentKeys || ["fa", "mo"]).filter(key => s.par?.[key] && !s.par[key].d);
  for (const key of caregiverKeys) {
    const parent = s.par[key];
    parent.jobHistory || (parent.jobHistory = []);
    parent.knownJobId = parent.j;
    parent.knownJobChangeCount = parent.jobHistory.length;
    parent.jobKnownYear = s.year;
    parent.workReviewYear =
      s.year + rnd(P("family.parentWorkReviewMinYears"), P("family.parentWorkReviewMaxYears"));
  }
  const householdSiblings = siblingsOf(s).filter(person => !person.d && !person.independentSinceYear);
  s.house.parentLedger = {
    status: caregiverKeys.length ? "tracked" : "not_parent_household",
    sinceYear: caregiverKeys.length ? s.year : null,
    lastUpdatedYear: caregiverKeys.length ? s.year : null,
    region: caregiverKeys.length ? s.res.n : null,
    knownRegion: caregiverKeys.length ? s.res.n : null,
    moveKnownYear: caregiverKeys.length ? s.year : null,
    knownMoveCount: 0,
    moveReviewYear: caregiverKeys.length
      ? s.year + rnd(P("family.parentMoveReviewMinYears"), P("family.parentMoveReviewMaxYears"))
      : null,
    moveHistory: [],
    householdSiblingIds: caregiverKeys.length
      ? householdSiblings.map(person => person.id).filter(Boolean)
      : [],
    res: caregiverKeys.length ? { ...s.res } : null,
    home: caregiverKeys.length ? s.home : null,
    local: caregiverKeys.length ? { ...(s.local || {}) } : null,
    priceIndex: caregiverKeys.length ? s.priceIndex || 1 : null,
    wealthIndex: caregiverKeys.length ? (s.originWealth || s.w || WEALTH[0]).i : null,
    caregiverIds: caregiverKeys.map(key => s.par[key].id),
    history: [],
    pendingSiblingContributions: [],
    siblingContributionHistory: [],
    parentGiftHistory: [],
    legacyRepair: caregiverKeys.length ? [] : ["家計分離時の主な養育者は親以外のため実家家計として扱わない"]
  };
}
function parentHouseholdView(s, ledger, parent) {
  // Cost projections for a separated household must not mutate the protagonist's
  // locality archive, facility affiliations, contacts, or employment state.
  const world = s.world
    ? { ...s.world, localityArchive: {}, localityVisits: [] }
    : { events: {}, localityArchive: {}, localityVisits: [] };
  return {
    ...s,
    world,
    community: null,
    siteAffiliations: {},
    siteAffiliationHistory: [],
    facilityContacts: [],
    facilityPeopleContacts: [],
    workContract: null,
    res: ledger.res || s.res,
    home: ledger.home || s.home,
    local: { ...(ledger.local || s.local) },
    r: parent?.r || s.r,
    legal: parent?.legal ? { ...parent.legal } : { status: "unverified", citizenshipCountry: null },
    priceIndex: ledger.priceIndex || s.priceIndex
  };
}
function parentMedicalCost(s, ledger, parent) {
  if (!parent || parent.d || !parent.inf || !parent.tx) return 0;
  const view = parentHouseholdView(s, ledger, parent);
  return (
    P("economy.parentInfectionTreatmentAnnualCost") *
    view.res.pm *
    (1 + infectionSocialPressure(view).medical * 0.3) *
    infectionCareTravelCostScale(view) *
    (ledger.priceIndex || 1)
  );
}
function parentTreatmentCostForPlan(s, parent, plan = "direct") {
  if (!parent || parent.d || !parent.inf || !parent.tx) return 0;
  const ledger =
    s.house?.parentLedger?.status === "tracked"
      ? s.house.parentLedger
      : { res: s.res, home: s.home, local: s.local, priceIndex: s.priceIndex };
  const rate = P(
    plan === "shared"
      ? "family.parentTreatmentSharedShare"
      : plan === "network"
        ? "family.parentTreatmentNetworkShare"
        : "family.parentTreatmentDirectShare"
  );
  return parentMedicalCost(s, ledger, parent) * rate;
}
function parentTreatmentShare(s, parent) {
  const care = s.familyCare;
  if (!care?.treatmentSupport || !parent || parent.id !== s.par?.[care.target]?.id) return 0;
  const ledger =
    s.house?.parentLedger?.status === "tracked"
      ? s.house.parentLedger
      : { res: s.res, home: s.home, local: s.local, priceIndex: s.priceIndex };
  if (!parent.tx) return 0;
  if (care.plan === "shared" && care.siblingContributorId)
    return Math.max(
      0,
      parentMedicalCost(s, ledger, parent) -
        (care.siblingContributionPaidYear === s.year ? care.siblingContributionPaidAmount || 0 : 0)
    );
  return parentTreatmentCostForPlan(s, parent, care.plan);
}
function settleSiblingParentTreatmentContribution(s) {
  const care = s.familyCare;
  if (
    !care?.treatmentSupport ||
    care.plan !== "shared" ||
    !care.siblingContributorId ||
    care.siblingContributionPaidYear === s.year
  )
    return;
  const parent = s.par?.[care.target],
    sibling = siblingsOf(s).find(person => person.id === care.siblingContributorId);
  if (!parent || parent.d || !parent.inf || !parent.tx || !sibling) return;
  const ledger =
      s.house?.parentLedger?.status === "tracked"
        ? s.house.parentLedger
        : { res: s.res, home: s.home, local: s.local, priceIndex: s.priceIndex },
    gross = parentMedicalCost(s, ledger, parent),
    planned = gross * (1 - P("family.parentTreatmentSharedShare")),
    cash = Math.max(0, sibling.financialCash || 0),
    reserve = Math.max(0, (sibling.financialAnnualExpense || 0) * P("family.siblingCarePaymentReserveShare")),
    ableToPay = familyCareCostShareSiblingCandidates(s).some(person => person.id === sibling.id),
    amount = ableToPay ? Math.min(planned, Math.max(0, cash - reserve)) : 0,
    before = sibling.financialStatus || "unknown";
  if (amount > 0) {
    sibling.financialCash = cash - amount;
    sibling.financialAnnualExpense = (sibling.financialAnnualExpense || 0) + amount;
    sibling.parentTreatmentContributionPaidYear = s.year;
    sibling.parentTreatmentContributionPaidAmount = amount;
    sibling.parentTreatmentContributionPaidTotal =
      (sibling.parentTreatmentContributionPaidTotal || 0) + amount;
    sibling.financialTransfers || (sibling.financialTransfers = []);
    sibling.financialTransfers.push({
      year: s.year,
      amount,
      direction: "out",
      reason: "別居きょうだい本人が親の療養費を医療機関へ直接分担"
    });
    sibling.financialTransfers = sibling.financialTransfers.slice(-12);
  }
  sibling.financialStatus = siblingFinancialStatus(sibling);
  const latest = sibling.financialHistory?.at(-1);
  if (latest?.year === s.year) {
    latest.expense += amount;
    latest.net -= amount;
    latest.cash = sibling.financialCash;
    latest.status = sibling.financialStatus;
  }
  if (
    amount > 0 &&
    sibling.financialStatus === "strained" &&
    before !== "strained" &&
    sibling.contactState !== "ended" &&
    sibling.contactState !== "paused"
  ) {
    sibling.financialNoticeYear = s.year;
    sibling.contactReviewYear = Math.min(sibling.contactReviewYear ?? s.year, s.year);
  }
  care.siblingContributionPaidYear = s.year;
  care.siblingContributionPaidAmount = amount;
  care.siblingContributionPaidTotal = (care.siblingContributionPaidTotal || 0) + amount;
  recordFamilyCareHistory(s, amount > 0 ? "sibling_contribution" : "sibling_contribution_unavailable", {
    target: care.target,
    plan: care.plan,
    treatmentSupport: true,
    treatmentStillActive: !!parent.tx,
    treatmentPaidTotal: care.treatmentPaidTotal || 0,
    contributorSiblingId: sibling.id,
    contributorSiblingName: sibling.nm,
    amount,
    reason:
      amount > 0
        ? "別居きょうだいが手元の生活準備金を残して療養費を直接支払った"
        : !ableToPay
          ? "きょうだいの連絡・居住・家計状況を再確認できず、今年は支払いを見送った"
          : "きょうだいの家計から生活準備金を残すと、今年は療養費を分担できなかった"
  });
}
function parentTreatmentTravel(s, parent, cost) {
  if (!parent || cost <= 0) return 0;
  const ledger =
    s.house?.parentLedger?.status === "tracked"
      ? s.house.parentLedger
      : { res: s.res, home: s.home, local: s.local, priceIndex: s.priceIndex };
  return infectionCareTravelPortion(cost, parentHouseholdView(s, ledger, parent));
}
function advanceSeparatedParentRelocation(s, ledger, house, dependents) {
  if (!Number.isFinite(ledger.moveReviewYear))
    ledger.moveReviewYear =
      s.year + rnd(P("family.parentMoveReviewMinYears"), P("family.parentMoveReviewMaxYears"));
  if (s.year < ledger.moveReviewYear) return 0;
  ledger.moveReviewYear =
    s.year + rnd(P("family.parentMoveReviewMinYears"), P("family.parentMoveReviewMaxYears"));
  if (R() >= P("family.parentMoveChance")) return 0;
  const routes = (MIGRATION_ROUTES[ledger.region] || []).filter(route =>
    REG.some(region => region.n === route.n)
  );
  if (!routes.length) return 0;
  const route = wp(routes.map(item => ({ w: item.w, route: item }))).route,
    destination = REG.find(region => region.n === route.n),
    from = ledger.region,
    fromHome = ledger.home,
    originPm = ledger.res?.pm || 1;
  ledger.region = destination.n;
  for (const id of ledger.caregiverIds || []) {
    const parent = [s.par?.fa, s.par?.mo].find(person => person?.id === id);
    if (!parent || parent.d) continue;
    closeDependentEmployment(s, parent, "relocation");
    // A changed place creates no company, vacancy, or appointment. The next
    // work review, rather than the move itself, supplies the new livelihood.
    parent.workReviewYear = s.year + 1;
    parent.employmentRelocationPending = true;
  }
  ledger.res = { ...destination };
  ledger.local = makeLocality(fromHome, destination.n);
  ledger.moveHistory || (ledger.moveHistory = []);
  ledger.moveHistory.push({
    year: s.year,
    from,
    to: destination.n,
    home: fromHome,
    dependents: dependents.map(person => person.id).filter(Boolean),
    cause: "仕事・住居・家計の事情"
  });
  ledger.householdSiblingIds = dependents.map(person => person.id).filter(Boolean);
  ledger.moveHistory = ledger.moveHistory.slice(-16);
  return Math.max(
    0,
    P("family.parentHouseholdMoveCostBase") * originPm * (ledger.priceIndex || 1) +
      (route.fare || 0) * originPm
  );
}
function advanceSeparatedParentHousehold(s) {
  const ledger = s.house?.parentLedger,
    house = s.house;
  if (
    !s.fl?.household_separated ||
    !ledger ||
    ledger.status !== "tracked" ||
    ledger.lastUpdatedYear >= s.year
  )
    return;
  if (ledger.treatmentLapseDue?.dueYear <= s.year) {
    ledger.treatmentReviewDue = {
      parentId: ledger.treatmentLapseDue.parentId,
      dueYear: s.year,
      cause: ledger.treatmentLapseDue.cause
    };
    ledger.treatmentLapseDue = null;
  }
  if (
    ledger.treatmentReviewDue &&
    ![s.par?.fa, s.par?.mo].some(
      parent => parent?.id === ledger.treatmentReviewDue.parentId && !parent.d && parent.inf && parent.tx
    )
  )
    ledger.treatmentReviewDue = null;
  const parents = (ledger.caregiverIds || [])
      .map(id => ["fa", "mo"].find(key => s.par?.[key]?.id === id))
      .filter(Boolean)
      .map(key => s.par[key])
      .filter(parent => parent && !parent.d),
    dependents = siblingsOf(s).filter(person => !person.d && !person.independentSinceYear);
  if (!parents.length) {
    ledger.status = "ended";
    ledger.endedYear = s.year;
    ledger.pendingSiblingContributions = [];
    ledger.treatmentReviewDue = null;
    ledger.treatmentLapseDue = null;
    for (const sibling of siblingsOf(s)) sibling.parentNeedPending = null;
    return;
  }
  const movingCost = advanceSeparatedParentRelocation(s, ledger, house, dependents),
    context = parentHouseholdView(s, ledger, parents[0]),
    priceIndex = (ledger.priceIndex || 1) * (1 + P("economy.costInflationAnnual"));
  ledger.priceIndex = priceIndex;
  context.priceIndex = priceIndex;
  settleSiblingParentTreatmentContribution(s);
  const siblingContributionRows = (ledger.pendingSiblingContributions || []).filter(
      row => row.year === s.year
    ),
    siblingSupport = siblingContributionRows.reduce((sum, row) => sum + row.amount, 0);
  ledger.pendingSiblingContributions = (ledger.pendingSiblingContributions || []).filter(
    row => row.year > s.year
  );
  ledger.siblingContributionHistory = (ledger.siblingContributionHistory || [])
    .concat(siblingContributionRows)
    .slice(-32);
  const parentEarnings = parents.map(parent => ({parent,
      amount: parent.employmentRelocationPending ? 0 : dependentEmploymentAnnualIncome(s, parent, s.year, {
        jobId: parent.j, region: context.res.n, priceIndex,
        unemployed: !!s.fl.parent_unemployed && s.par?.[s.parentUnemploymentTargetKey] === parent
      })})),
    income = parentEarnings.reduce((sum, row) => sum + row.amount, 0),
    units = Math.max(1, parents.length) + 0.5 * dependents.length,
    baseLivingRaw = Math.max(
      P("economy.minimumExpenseBase") * context.res.pm * priceIndex,
      EXP[ledger.wealthIndex ?? 2] * context.res.pm * priceIndex * units
    ),
    austerity = ledger.treatmentAusterityUntil >= s.year ? 0.88 : 1,
    baseLiving = baseLivingRaw * austerity,
    treatment = parents.reduce((sum, parent) => sum + parentMedicalCost(s, ledger, parent), 0),
    treatmentTravel = parents.reduce(
      (sum, parent) =>
        sum +
        infectionCareTravelPortion(
          parentMedicalCost(s, ledger, parent),
          parentHouseholdView(s, ledger, parent)
        ),
      0
    ),
    siblingTreatment = householdSiblingCareExpense(context) * priceIndex,
    siblingTreatmentTravel = infectionCareTravelPortion(siblingTreatment, context),
    familySupport = parents.reduce(
      (sum, parent) =>
        sum +
        parentTreatmentShare(s, parent) +
        (s.familyCare?.siblingContributorId &&
        s.familyCare.siblingContributionPaidYear === s.year &&
        s.par?.[s.familyCare.target]?.id === parent.id
          ? s.familyCare.siblingContributionPaidAmount || 0
          : 0),
      0
    ),
    net = income + familySupport + siblingSupport - baseLiving - treatment - siblingTreatment - movingCost;
  if (net >= 0) {
    const payment = Math.min(house.debt || 0, net);
    house.debt = (house.debt || 0) - payment;
    house.cash = (house.cash || 0) + net - payment;
  } else {
    house.cash = (house.cash || 0) + net;
    if (house.cash < 0) {
      house.debt = (house.debt || 0) - house.cash;
      house.cash = 0;
    }
  }
  const debtInterest = (house.debt || 0) * P("economy.debtInterest");
  house.debt = (house.debt || 0) + debtInterest;
  house.inc = income + familySupport + siblingSupport;
  for (const {parent, amount} of parentEarnings)
    recordDependentEmploymentPayment(s, parent, {amount, recipientId: "parent-household",
      year: s.year, source: "separated-parent-annual-settlement"});
  house.exp = baseLiving + treatment + siblingTreatment + movingCost + debtInterest;
  house.flow = {
    year: s.year,
    income: {
      parentWages: income,
      familyTreatmentSupport: familySupport,
      siblingContributions: siblingSupport
    },
    expense: {
      living: baseLiving,
      parentTreatment: treatment - treatmentTravel,
      siblingTreatment: siblingTreatment - siblingTreatmentTravel,
      medicalTravel: treatmentTravel + siblingTreatmentTravel,
      relocation: movingCost,
      debtInterest
    },
    net: net - debtInterest
  };
  const entry = {
    year: s.year,
    income: house.inc,
    expense: house.exp,
    net: net - debtInterest,
    cash: house.cash,
    debt: house.debt,
    treatmentCost: treatment + siblingTreatment,
    movingCost,
    debtInterest,
    familyTreatmentSupport: familySupport,
    familyTreatmentSiblingContributions:
      s.familyCare?.siblingContributionPaidYear === s.year
        ? s.familyCare.siblingContributionPaidAmount || 0
        : 0,
    familyTreatmentPlayerContribution:
      familySupport -
      (s.familyCare?.siblingContributionPaidYear === s.year
        ? s.familyCare.siblingContributionPaidAmount || 0
        : 0),
    siblingTreatmentContributionRows:
      s.familyCare?.siblingContributionPaidYear === s.year && s.familyCare.siblingContributionPaidAmount > 0
        ? [
            {
              siblingId: s.familyCare.siblingContributorId,
              amount: s.familyCare.siblingContributionPaidAmount
            }
          ]
        : [],
    siblingContributions: siblingSupport,
    siblingContributionRows,
    parentJobs: parents.map(parent => ({ id: parent.id, jobId: parent.j, workShare: parent.workShare ?? 1 })),
    status:
      house.debt > Math.max(1, house.exp * P("condition.financialStrainDebtYears")) ? "strained" : "stable"
  };
  ledger.history = (ledger.history || []).concat(entry).slice(-16);
  ledger.lastUpdatedYear = s.year;
  ledger.status = "tracked";
  const lapseThreshold = P("economy.treatmentStopDebtMultiple") * Math.max(1, treatment);
  if (
    treatment > 0 &&
    house.debt > lapseThreshold &&
    house.cash < treatment &&
    !ledger.treatmentReviewDue &&
    s.year >= (ledger.treatmentReviewNextYear || 0)
  ) {
    const parent = parents.find(person => person.inf && person.tx);
    if (parent)
      ledger.treatmentLapseDue = {
        parentId: parent.id,
        dueYear: s.year + 1,
        cause: "実家家計の療養費を払えない"
      };
  }
}
