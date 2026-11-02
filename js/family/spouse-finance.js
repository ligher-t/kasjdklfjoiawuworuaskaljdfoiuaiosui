function initializeSpouseFinance(s, spouse = s.sp) {
  if (!spouse || spouse.personalFinance) return spouse?.personalFinance || null;
  const age = Math.max(0, s.year - (spouse.by || s.year)),
    years = Math.min(15, Math.max(0, age - P("life.workStartAge"))),
    job = Number.isInteger(spouse.j) ? J[spouse.j] : null,
    region = REG.find(item => item.n === spouse.residenceRegion) || s.res,
    gross = Math.max(0, job?.pay || 0) * region.pm * (1 + ((s.priceIndex || 1) - 1) * 0.65),
    expenseTier = clamp((s.w?.i ?? 2) + (R() < 0.5 ? -1 : 1), 0, EXP.length - 1),
    startingCash = Math.max(0, gross * years * P("economy.spouseOpeningSavingsShare") * (0.25 + R() * 1.5)),
    hasDebt = R() < P("economy.spouseOpeningDebtChance"),
    startingDebt = hasDebt
      ? gross *
        (P("economy.spouseOpeningDebtMinYears") +
          R() * (P("economy.spouseOpeningDebtMaxYears") - P("economy.spouseOpeningDebtMinYears")))
      : 0,
    annualExpense =
      Math.max(P("economy.minimumExpenseBase"), EXP[expenseTier]) * region.pm * (s.priceIndex || 1);
  spouse.personalFinance = {
    status: "modeled_balance",
    startedYear: s.year + 1,
    openingCash: startingCash,
    openingDebt: startingDebt,
    cash: startingCash,
    debt: startingDebt,
    expenseTier,
    condition: startingDebt > 0 || startingCash < annualExpense * 0.25 ? "strained" : "stable",
    reviewYear:
      s.year + rnd(P("family.spouseFinanceReviewMinYears"), P("family.spouseFinanceReviewMaxYears")),
    netChangeSinceStart: 0,
    history: [],
    transfers: []
  };
  return spouse.personalFinance;
}
function repairSpouseDisclosureBoundary(s) {
  const spouse = s.sp;
  if (!spouse) return s;
  if (!Array.isArray(spouse.disclosureBoundaryHistory)) spouse.disclosureBoundaryHistory = [];
  if (!["separate_rooms", "repaired"].includes(spouse.disclosureBoundary)) {
    if (s.fl?.spouse_strained) {
      spouse.disclosureBoundary = "separate_rooms";
      spouse.disclosureBoundarySinceYear = Number.isInteger(spouse.disclosedYear)
        ? spouse.disclosedYear
        : null;
      spouse.disclosureReviewYear = s.year;
      s.fl.marriage_strained = 1;
      spouse.disclosureBoundaryHistory.push({
        year: s.year,
        state: "separate_rooms",
        basis: "legacy-repair"
      });
      spouse.legacyRepair = [
        ...new Set([...(spouse.legacyRepair || []), "旧記録の婚姻関係緊張を移行年から追跡"])
      ];
    } else {
      spouse.disclosureBoundary = null;
      spouse.disclosureBoundarySinceYear = null;
      spouse.disclosureReviewYear = null;
    }
  }
  if (
    spouse.disclosureBoundary === "separate_rooms" &&
    (!Number.isInteger(spouse.disclosureReviewYear) || spouse.disclosureReviewYear < s.year)
  )
    spouse.disclosureReviewYear = s.year;
  if (spouse.disclosureBoundary === "repaired") {
    spouse.disclosureReviewYear = null;
    s.fl.marriage_strained = 0;
  }
  if (spouse.disclosureBoundary === "separate_rooms") s.fl.marriage_strained = 1;
  return s;
}
function repairSpouseFinance(s) {
  const spouse = s.sp;
  if (!spouse || spouse.d) return s;
  if (!spouse.personalFinance) {
    spouse.personalFinance = {
      status: "legacy_unknown_balance",
      startedYear: s.year + 1,
      openingCash: null,
      openingDebt: null,
      cash: null,
      debt: null,
      expenseTier: 2,
      condition: "unknown",
      reviewYear:
        s.year + rnd(P("family.spouseFinanceReviewMinYears"), P("family.spouseFinanceReviewMaxYears")),
      netChangeSinceStart: 0,
      history: [],
      transfers: []
    };
    return s;
  }
  const finance = spouse.personalFinance;
  if (!["modeled_balance", "legacy_unknown_balance"].includes(finance.status))
    finance.status = "legacy_unknown_balance";
  if (!Number.isInteger(finance.startedYear) || finance.startedYear > s.year + 1)
    finance.startedYear = s.year + 1;
  if (!Number.isInteger(finance.reviewYear) || finance.reviewYear < s.year)
    finance.reviewYear =
      s.year + rnd(P("family.spouseFinanceReviewMinYears"), P("family.spouseFinanceReviewMaxYears"));
  if (!Array.isArray(finance.history)) finance.history = [];
  finance.history = finance.history.slice(-20);
  if (!Array.isArray(finance.transfers)) finance.transfers = [];
  finance.transfers = finance.transfers.slice(-20);
  if (!Number.isFinite(finance.netChangeSinceStart))
    finance.netChangeSinceStart = finance.history.reduce(
      (sum, row) => sum + (Number.isFinite(row.net) ? row.net : 0),
      0
    );
  if (finance.status === "legacy_unknown_balance") {
    finance.openingCash = null;
    finance.openingDebt = null;
    finance.cash = null;
    finance.debt = null;
    finance.condition = "unknown";
  }
  return s;
}
function spouseHousingPlan(spouse) {
  return ["shared", "standard", "private"].includes(spouse?.housingPlan) ? spouse.housingPlan : "standard";
}
function spouseHousingMultiplier(spouse) {
  const plan = spouseHousingPlan(spouse);
  return plan === "shared"
    ? P("economy.spouseSharedHousingMultiplier")
    : plan === "private"
      ? P("economy.spousePrivateHousingMultiplier")
      : 1;
}
function spouseHousingPlanLabel(plan) {
  return { shared: "相部屋・間借り", standard: "現在の居室", private: "個室" }[plan] || "住居未記録";
}
function spouseHousingAnnualCost(s, plan = "standard") {
  if (!s.sp || s.sp.d || spouseLivesWithProtagonist(s)) return 0;
  const region = spouseResidenceRegion(s),
    finance = s.sp.personalFinance || {},
    tier = Number.isInteger(finance.expenseTier) ? finance.expenseTier : 2,
    multiplier =
      plan === "shared"
        ? P("economy.spouseSharedHousingMultiplier")
        : plan === "private"
          ? P("economy.spousePrivateHousingMultiplier")
          : 1;
  return (
    Math.max(P("economy.minimumExpenseBase"), EXP[tier] || EXP[2]) *
    region.pm *
    (s.priceIndex || 1) *
    P("economy.spouseSeparateHousingExpenseShare") *
    multiplier
  );
}
function spouseHousingTransitionAffordable(s, plan) {
  const spouse = s.sp;
  if (
    !spouse ||
    spouse.d ||
    spouseLivesWithProtagonist(s) ||
    !["shared", "standard", "private"].includes(plan)
  )
    return false;
  const finance = spouse.personalFinance;
  if (!finance || finance.status !== "modeled_balance") return true;
  const current = spouseHousingPlan(spouse);
  if (current === plan) return true;
  const region = spouseResidenceRegion(s),
    price = region.pm * (s.priceIndex || 1),
    setup = P("economy.spouseHousingChangeCost") * price,
    tier = Number.isInteger(finance.expenseTier) ? finance.expenseTier : 2,
    annualBase = Math.max(P("economy.minimumExpenseBase"), EXP[tier] || EXP[2]) * price,
    reserve = annualBase * P("economy.spouseHousingChangeReserveShare"),
    income = spouseGrossAnnualIncome(s),
    support = spouseSeparateSupportCost(s),
    contribution = spouseHouseholdIncome(s),
    nonHousing = spouseIndependentNonHousingExpense(s),
    medical = spouseIndependentMedicalExpense(s),
    housing = spouseHousingAnnualCost(s, plan),
    interest = Math.max(0, finance.debt || 0) * P("economy.debtInterest"),
    annualCashFlow = income + support - contribution - nonHousing - medical - housing - setup,
    projectedCash =
      annualCashFlow >= 0
        ? finance.cash + Math.max(0, annualCashFlow - (finance.debt || 0) - interest)
        : finance.cash + annualCashFlow;
  return Number.isFinite(projectedCash) && projectedCash >= reserve;
}
function spouseIndependentLivingExpense(s) {
  const spouse = s.sp;
  if (!spouse || spouse.d || spouseLivesWithProtagonist(s)) return 0;
  const region = spouseResidenceRegion(s),
    finance = spouse.personalFinance || {},
    tier = Number.isInteger(finance.expenseTier) ? finance.expenseTier : 2,
    base = Math.max(P("economy.minimumExpenseBase"), EXP[tier] || EXP[2]) * region.pm * (s.priceIndex || 1),
    housing = base * P("economy.spouseSeparateHousingExpenseShare");
  return base - housing + housing * spouseHousingMultiplier(spouse);
}
function spouseIndependentHousingExpense(s) {
  const spouse = s.sp;
  if (!spouse || spouse.d || spouseLivesWithProtagonist(s)) return 0;
  const region = spouseResidenceRegion(s),
    finance = spouse.personalFinance || {},
    tier = Number.isInteger(finance.expenseTier) ? finance.expenseTier : 2,
    base = Math.max(P("economy.minimumExpenseBase"), EXP[tier] || EXP[2]) * region.pm * (s.priceIndex || 1);
  return base * P("economy.spouseSeparateHousingExpenseShare") * spouseHousingMultiplier(spouse);
}
function spouseIndependentNonHousingExpense(s) {
  const base = spouseIndependentLivingExpense(s);
  return Math.max(0, base - spouseIndependentHousingExpense(s));
}
function spouseIndependentMedicalExpense(s) {
  const spouse = s.sp;
  if (!spouse || spouse.d || spouseLivesWithProtagonist(s) || !spouse.inf || !spouse.tx) return 0;
  const region = spouseResidenceRegion(s),
    pressure =
      SIM_TABLES.oripathyPressure?.[region.n]?.medical ??
      SIM_TABLES.oripathyPressure?.default?.medical ??
      0.45;
  return P("economy.spouseInfectionCareAnnualCost") * region.pm * (1 + pressure * 0.3) * (s.priceIndex || 1);
}
function recordSpouseAnnualFinance(
  s,
  {
    income = 0,
    contribution = 0,
    support = 0,
    supportTransactionId = null,
    living = 0,
    housing = 0,
    medical = 0,
    coveredLiving = 0,
    coveredMedical = 0,
    relocation = 0,
    housingSetup = 0
  } = {}
) {
  const spouse = s.sp;
  if (!spouse || spouse.d) return null;
  repairSpouseFinance(s);
  const finance = spouse.personalFinance;
  if (!finance.history.length && finance.startedYear > s.year) finance.startedYear = s.year;
  const interest =
      finance.status === "modeled_balance"
        ? Math.max(0, finance.debt || 0) * P("economy.debtInterest")
        : null,
    cashflow = income + support - contribution - living - housing - medical - relocation - housingSetup,
    net = cashflow - (interest || 0),
    row = {
      year: s.year,
      region: spouseResidenceRegion(s).n,
      income,
      contribution,
      support,
      supportTransactionId,
      living,
      housing,
      medical,
      coveredLiving,
      coveredMedical,
      relocation,
      housingSetup,
      interest,
      net
    };
  finance.netChangeSinceStart = (finance.netChangeSinceStart || 0) + net;
  if (finance.status === "modeled_balance") {
    finance.debt = Math.max(0, finance.debt + interest);
    if (cashflow >= 0) {
      const paid = Math.min(finance.debt, cashflow);
      finance.debt -= paid;
      finance.cash += cashflow - paid;
    } else {
      const shortfall = -cashflow,
        used = Math.min(finance.cash, shortfall);
      finance.cash -= used;
      finance.debt = Math.min(1e12, finance.debt + shortfall - used);
    }
    const annualExpense =
      Math.max(P("economy.minimumExpenseBase"), EXP[finance.expenseTier] || EXP[2]) *
      spouseResidenceRegion(s).pm *
      (s.priceIndex || 1);
    finance.condition = finance.debt > 0 || finance.cash < annualExpense * 0.25 ? "strained" : "stable";
    row.cash = finance.cash;
    row.debt = finance.debt;
    row.condition = finance.condition;
  } else {
    row.cash = null;
    row.debt = null;
    row.condition = "unknown";
  }
  finance.history.push(row);
  finance.history = finance.history.slice(-20);
  finance.updatedYear = s.year;
  return row;
}
function recordSpouseSeparateSupportTransfer(s, amount) {
  const spouse = s.sp;
  if (!spouse || !Number.isFinite(amount) || amount <= 0) return null;
  const transactionId = `${spouse.id}::support::${s.year}`,
    region = spouseResidenceRegion(s).n,
    plan = spouse.separateSupportPlan,
    receipt = { transactionId, year: s.year, amount, region, plan, fromId: "player" };
  spouse.separateSupportPaidTotal = (spouse.separateSupportPaidTotal || 0) + amount;
  spouse.separateSupportPaidYear = s.year;
  spouse.separateSupportPaidAmount = amount;
  spouse.separateSupportHistory || (spouse.separateSupportHistory = []);
  spouse.separateSupportHistory.push({ transactionId, year: s.year, amount, region, plan });
  spouse.separateSupportHistory = spouse.separateSupportHistory.slice(-16);
  repairSpouseFinance(s);
  const finance = spouse.personalFinance;
  finance.supportReceipts || (finance.supportReceipts = []);
  finance.supportReceipts.push(receipt);
  finance.supportReceipts = finance.supportReceipts.slice(-16);
  spouse.pendingSupportTransactionId = transactionId;
  return transactionId;
}
function spouseSeparateSupportCost(s, plan = s.sp?.separateSupportPlan) {
  const spouse = s.sp;
  if (!spouse || spouse.d || spouseLivesWithProtagonist(s)) return 0;
  const region = spouseResidenceRegion(s),
    price = s.priceIndex || 1;
  if (plan === "living") return P("economy.spouseSeparateSupportAnnualCost") * region.pm * price;
  if (plan === "medical" && spouse.inf && spouse.tx) {
    const pressure =
      SIM_TABLES.oripathyPressure?.[region.n]?.medical ??
      SIM_TABLES.oripathyPressure?.default?.medical ??
      0.45;
    return P("economy.spouseInfectionCareAnnualCost") * region.pm * (1 + pressure * 0.3) * price;
  }
  return 0;
}
function spouseSeparateContactAnnualCost(s, plan = s.sp?.separateContact) {
  if (!s.sp || s.sp.d || spouseLivesWithProtagonist(s) || !["regular", "letters"].includes(plan)) return 0;
  const base = P("economy.spouseContactAnnualCost"),
    frequency = plan === "regular" ? P("economy.spouseRegularContactCostScale") : 1,
    region = spouseResidenceRegion(s);
  return base * frequency * region.pm * (s.priceIndex || 1);
}
function spouseSeparateSupportAffordable(s, amount) {
  const nextYearIndex = 1 + P("economy.costInflationAnnual"),
    reserve =
      Math.max(s.exp || 0, P("economy.minimumExpenseBase") * s.res.pm * (s.priceIndex || 1)) * nextYearIndex;
  return Number.isFinite(amount) && amount >= 0 && s.cash >= amount * nextYearIndex + reserve;
}
function spouseRejoinRoute(s) {
  if (
    !s.sp ||
    s.sp.d ||
    spouseLivesWithProtagonist(s) ||
    (s.sp.residenceMoveNotice && !Number.isInteger(s.sp.residenceMoveNotice.deliveredYear))
  )
    return null;
  const origin = spouseResidenceRegion(s),
    price = origin.pm * (s.priceIndex || 1);
  if (origin.n === s.res.n)
    return { kind: "local", origin, fare: Math.round(P("economy.spouseLocalRejoinBaseCost") * price) };
  const route = (MIGRATION_ROUTES[origin.n] || []).find(item => item.n === s.res.n);
  return route ? { kind: "regional", route, origin, fare: Math.round(route.fare * price) } : null;
}
function spouseIndependentMoveRoute(s) {
  const origin = spouseResidenceRegion(s),
    routes = (MIGRATION_ROUTES[origin.n] || []).filter(
      route => route.n !== origin.n && REG.some(region => region.n === route.n)
    );
  if (!routes.length) return null;
  const route = wp(routes.map(item => ({ w: item.w, route: item }))).route,
    destination = REG.find(region => region.n === route.n);
  return destination
    ? {
        route,
        origin,
        destination,
        fare: Math.round(
          ((route.fare || 0) + P("economy.spouseMoveCostBase")) * origin.pm * (s.priceIndex || 1)
        )
      }
    : null;
}
function spouseRejoinAffordable(s) {
  const move = spouseRejoinRoute(s);
  if (!move) return false;
  const reserve = Math.max(
    (inSharedHousehold(s) && s.house ? s.house.exp : s.exp) || 0,
    P("economy.minimumExpenseBase") * s.res.pm * (s.priceIndex || 1)
  );
  return moveFunds(s) >= move.fare + reserve;
}
function spouseHealthConsultCost(s) {
  return P("family.spouseHealthConsultBaseCost") * s.res.md * (s.priceIndex || 1);
}
function spouseInitialTreatmentCost(s) {
  return 1e5 * s.res.pm * (s.priceIndex || 1);
}
const regionalCashCost = (s, base) => base * s.res.pm * (s.priceIndex || 1);
const childFeverVisitCost = s => 2e4 * s.res.md * (s.priceIndex || 1);
const hobbyMusicStartCost = s => regionalCashCost(s, 1e5);
const hobbyCraftStartCost = s => regionalCashCost(s, 8e4);
const hobbyGardenStartCost = s => regionalCashCost(s, 6e4);
const hobbyAnnualCost = s => regionalCashCost(s, P("economy.hobbyAnnualCost"));
const adultChildContactCost = s => regionalCashCost(s, P("economy.adultChildContactBaseCost"));
const leithArtsPreparationCost = s => regionalCashCost(s, 3e4);
const leithMusicEveningCost = s => regionalCashCost(s, 5e4);
function romanceCeremonyCost(s) {
  return regionalCashCost(s, 8e4);
}
function spouseFinanceAidCost(s) {
  return regionalCashCost(s, 1e5);
}
function siblingHealthAidCost(s) {
  return P("family.siblingHealthAidCost") * s.res.pm * (s.priceIndex || 1);
}
function spouseVisitRoute(s) {
  if (
    !s.sp ||
    s.sp.d ||
    spouseLivesWithProtagonist(s) ||
    (s.sp.residenceMoveNotice && !Number.isInteger(s.sp.residenceMoveNotice.deliveredYear))
  )
    return null;
  const destination = spouseKnownResidenceRegion(s).n,
    price = s.res.pm * (s.priceIndex || 1);
  if (destination === s.res.n)
    return {
      from: s.res.n,
      to: destination,
      kind: "local",
      fare: Math.round(P("economy.spouseLocalVisitBaseCost") * price)
    };
  const base = P("economy.spouseVisitBaseCost"),
    route = (MIGRATION_ROUTES[s.res.n] || []).find(item => item.n === destination);
  return route
    ? { from: s.res.n, to: destination, kind: "regional", fare: Math.round((2 * route.fare + base) * price) }
    : null;
}
function spouseVisitAffordable(s) {
  const trip = spouseVisitRoute(s);
  return !!trip && moveFunds(s) >= trip.fare + annualCashReserve(s);
}
