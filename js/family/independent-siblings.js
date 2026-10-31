function advanceIndependentSiblingHealth(s) {
  for (const sibling of siblingsOf(s)) {
    if (sibling.d || !sibling.independentSinceYear) continue;
    if (!Number.isFinite(sibling.health)) {
      sibling.health = P("family.siblingHealthInitial");
      sibling.healthUpdatedYear = s.year - 1;
    }
    if (!Number.isFinite(sibling.healthUpdatedYear)) {
      sibling.healthUpdatedYear = s.year - 1;
    }
    if (sibling.healthUpdatedYear >= s.year) continue;
    const before = sibling.health,
      age = Math.max(0, s.year - sibling.by),
      hazardousJob = [2, 3, 4].includes(sibling.j) ? P("family.siblingHealthHazardJobDrift") : 0,
      drift =
        P("family.siblingHealthRecovery") +
        Math.max(0, age - P("family.siblingHealthAgeStart")) *
          P("family.siblingHealthAgeScale") *
          (age > P("family.siblingHealthAgeStart") ? -1 : 0) -
        (sibling.inf ? P("family.siblingHealthInfectionDrift") : 0) -
        hazardousJob +
        (sibling.careSupportAnnual > 0 ? P("family.siblingHealthSupportRecovery") : 0) +
        (R() - 0.5) * P("family.siblingHealthRandomDrift");
    sibling.health = clamp(before + drift, 0, 100);
    sibling.healthUpdatedYear = s.year;
    sibling.healthHistory || (sibling.healthHistory = []);
    if (Math.abs(sibling.health - before) > 0.001) {
      sibling.healthHistory.push({
        year: s.year,
        from: before,
        to: sibling.health,
        cause: "加齢・感染・生業・暮らしの変化"
      });
      sibling.healthHistory = sibling.healthHistory.slice(-12);
    }
    if (
      before > P("family.siblingHealthConcernThreshold") &&
      sibling.health <= P("family.siblingHealthConcernThreshold") &&
      sibling.contactState !== "ended" &&
      sibling.contactState !== "paused"
    ) {
      sibling.healthNoticeYear = s.year;
      sibling.contactReviewYear = Math.min(sibling.contactReviewYear ?? s.year, s.year);
    }
  }
}
function siblingFinancialStatus(sibling) {
  const householdScale =
      1 +
      (sibling.familyHousehold?.partner && !sibling.familyHousehold.partner.d
        ? P("family.siblingPartnerExpenseShare")
        : 0) +
      (sibling.familyHousehold?.children || []).filter(child => !child.d).length *
        P("family.siblingChildExpenseShare"),
    annualExpense =
      Math.max(
        P("economy.minimumExpenseBase"),
        (EXP[sibling.financialExpenseTier] || EXP[2]) * householdScale
      ) *
      (REG.find(region => region.n === sibling.region)?.pm || 1) *
      (sibling.financialPriceIndex || 1);
  return (sibling.financialDebt || 0) > 0 ||
    (sibling.financialCash || 0) < annualExpense * P("family.siblingFinanceStrainReserveShare")
    ? "strained"
    : "stable";
}
function siblingParentInfoRoute(s, ledger, sibling) {
  if (sibling.region === ledger.region) return { channel: "face_to_face", delayYears: 0 };
  const routes = MIGRATION_ROUTES[sibling.region] || [],
    connected = routes.some(route => route.n === ledger.region);
  return connected
    ? { channel: "family_letter_or_travelling_relative", delayYears: 1 }
    : { channel: "kin_or_community_relay", delayYears: 2 };
}
function siblingParentInfoReach(route) {
  return P(
    route.channel === "face_to_face"
      ? "family.siblingParentNeedFaceToFaceReach"
      : route.channel === "family_letter_or_travelling_relative"
        ? "family.siblingParentNeedLetterReach"
        : "family.siblingParentNeedRelayReach"
  );
}
function reviewSiblingParentSupport(s, sibling) {
  const ledger = s.house?.parentLedger,
    house = s.house;
  if (sibling.d) {
    sibling.parentNeedPending = null;
    return;
  }
  if (!sibling.independentSinceYear) return;
  if (!["none", "active", "ended"].includes(sibling.parentSupportStatus))
    sibling.parentSupportStatus = "none";
  if (!["unknown", "strained", "stable"].includes(sibling.parentNeedKnownStatus))
    sibling.parentNeedKnownStatus = "unknown";
  if (
    !Number.isFinite(sibling.parentNeedReviewYear) ||
    sibling.parentNeedReviewYear < s.year ||
    sibling.parentNeedReviewYear > s.year + P("family.siblingParentNeedReviewMaxYears")
  )
    sibling.parentNeedReviewYear =
      s.year + rnd(P("family.siblingParentNeedReviewMinYears"), P("family.siblingParentNeedReviewMaxYears"));
  if (!Array.isArray(sibling.parentNeedHistory)) sibling.parentNeedHistory = [];
  if (!Number.isFinite(sibling.parentSupportDisposition)) sibling.parentSupportDisposition = 0.15 + R() * 0.7;
  sibling.parentSupportDisposition = clamp(sibling.parentSupportDisposition, 0, 1);
  if (!Number.isFinite(sibling.parentSupportReviewYear)) sibling.parentSupportReviewYear = s.year;
  if (!ledger || ledger.status !== "tracked") {
    if (sibling.parentSupportReviewYear <= s.year)
      sibling.parentSupportReviewYear =
        s.year +
        rnd(P("family.siblingParentSupportReviewMinYears"), P("family.siblingParentSupportReviewMaxYears"));
    return;
  }
  if (!Number.isFinite(sibling.parentSupportPaidTotal) || sibling.parentSupportPaidTotal < 0)
    sibling.parentSupportPaidTotal = 0;
  if (!Number.isInteger(sibling.parentSupportChangeCount) || sibling.parentSupportChangeCount < 0)
    sibling.parentSupportChangeCount = 0;
  if (!Array.isArray(sibling.parentSupportHistory)) sibling.parentSupportHistory = [];
  if (!Number.isInteger(sibling.knownParentSupportChangeCount) || sibling.knownParentSupportChangeCount < 0)
    sibling.knownParentSupportChangeCount = 0;
  if (!["none", "active", "ended"].includes(sibling.knownParentSupportStatus))
    sibling.knownParentSupportStatus = "none";
  if (!Number.isFinite(sibling.knownParentSupportPaidTotal) || sibling.knownParentSupportPaidTotal < 0)
    sibling.knownParentSupportPaidTotal = 0;
  if (!Number.isFinite(sibling.parentSupportKnownYear)) sibling.parentSupportKnownYear = null;
  const parentExpense = Math.max(1, house.exp || 0),
    parents = (ledger.caregiverIds || [])
      .map(id => ["fa", "mo"].map(key => s.par?.[key]).find(parent => parent?.id === id))
      .filter(Boolean),
    hasLivingCaregiver = parents.some(parent => !parent.d),
    treatmentPressure = parents.some(
      parent =>
        !parent.d &&
        parent.inf &&
        (parent.tx ||
          ledger.treatmentLapseDue?.parentId === parent.id ||
          ledger.treatmentReviewDue?.parentId === parent.id)
    ),
    actualNeed =
      hasLivingCaregiver &&
      ((house.debt || 0) > Math.max(1, parentExpense * P("condition.financialStrainDebtYears")) ||
        (house.cash || 0) < parentExpense * 0.35 ||
        treatmentPressure ||
        ledger.history?.at(-1)?.status === "strained");
  if (sibling.parentNeedPending && sibling.parentNeedPending.deliveryYear <= s.year) {
    const message = sibling.parentNeedPending,
      previous = sibling.parentNeedKnownStatus,
      next = message.status;
    sibling.parentNeedKnownStatus = next;
    sibling.parentNeedKnownYear = s.year;
    sibling.parentNeedHistory.push({
      year: s.year,
      sentYear: message.sentYear,
      deliveryYear: s.year,
      delayYears: s.year - message.sentYear,
      from: previous,
      to: next,
      sourceId: message.sourceId,
      channel: message.channel,
      cause:
        next === "strained"
          ? "親世帯の困窮が家族連絡で伝わった"
          : "親世帯の家計が持ち直したと家族連絡で伝わった"
    });
    sibling.parentNeedHistory = sibling.parentNeedHistory.slice(-12);
    sibling.parentNeedPending = null;
  }
  if (s.year >= sibling.parentNeedReviewYear && !sibling.parentNeedPending) {
    sibling.parentNeedReviewYear =
      s.year + rnd(P("family.siblingParentNeedReviewMinYears"), P("family.siblingParentNeedReviewMaxYears"));
    const route = siblingParentInfoRoute(s, ledger, sibling),
      reachChance = P("family.siblingParentNeedSignalChance") * siblingParentInfoReach(route);
    if (R() < reachChance) {
      const sourceId = (ledger.caregiverIds || []).find(id =>
        parents.some(parent => parent.id === id && !parent.d)
      );
      if (sourceId) {
        sibling.parentNeedPending = {
          status: actualNeed ? "strained" : "stable",
          sourceId,
          channel: route.channel,
          sentYear: s.year,
          deliveryYear: s.year + route.delayYears
        };
        if (route.delayYears === 0) {
          const message = sibling.parentNeedPending,
            previous = sibling.parentNeedKnownStatus,
            next = message.status;
          sibling.parentNeedKnownStatus = next;
          sibling.parentNeedKnownYear = s.year;
          sibling.parentNeedHistory.push({
            year: s.year,
            sentYear: s.year,
            deliveryYear: s.year,
            delayYears: 0,
            from: previous,
            to: next,
            sourceId,
            channel: route.channel,
            cause:
              next === "strained"
                ? "親世帯の困窮が家族との対面連絡で伝わった"
                : "親世帯の家計改善が家族との対面連絡で伝わった"
          });
          sibling.parentNeedHistory = sibling.parentNeedHistory.slice(-12);
          sibling.parentNeedPending = null;
        }
      }
    }
  }
  const needsSupport = sibling.parentNeedKnownStatus === "strained";
  if (s.year >= sibling.parentSupportReviewYear) {
    sibling.parentSupportReviewYear =
      s.year +
      rnd(P("family.siblingParentSupportReviewMinYears"), P("family.siblingParentSupportReviewMaxYears"));
    const previous = sibling.parentSupportStatus || "none";
    let next = previous;
    if (previous === "active") {
      if (
        !hasLivingCaregiver ||
        (!needsSupport && (house.cash || 0) >= parentExpense * 1.5) ||
        (sibling.financialStatus === "strained" && sibling.financialCash < parentExpense * 0.15) ||
        R() > sibling.parentSupportDisposition
      )
        next = "ended";
    } else if (
      needsSupport &&
      sibling.financialStatus !== "strained" &&
      sibling.financialCash > Math.max(1, (sibling.financialAnnualExpense || 0) * 0.2) &&
      R() < P("family.siblingParentSupportChance") * sibling.parentSupportDisposition
    )
      next = "active";
    if (next !== previous) {
      sibling.parentSupportStatus = next;
      sibling.parentSupportChangeCount = (sibling.parentSupportChangeCount || 0) + 1;
      sibling.parentSupportHistory.push({
        year: s.year,
        from: previous,
        to: next,
        cause:
          next === "active"
            ? "親世帯の家計を案じ、本人が定期拠出を申し出た"
            : "本人の家計・意向を見直し、定期拠出を終えた"
      });
      sibling.parentSupportHistory = sibling.parentSupportHistory.slice(-24);
      if (sibling.contactState !== "ended") {
        sibling.parentSupportNoticeYear = s.year;
        sibling.contactReviewYear = Math.min(sibling.contactReviewYear ?? s.year, s.year);
      }
    }
  }
  if (sibling.parentSupportStatus !== "active" || sibling.parentSupportPaidYear === s.year) return;
  const amount = Math.max(
    0,
    Math.min(
      (sibling.financialAnnualIncome || 0) * P("family.siblingParentSupportIncomeShare"),
      parentExpense * P("family.siblingParentSupportExpenseCapShare"),
      Math.max(0, (sibling.financialCash || 0) - Math.max(0, (sibling.financialAnnualExpense || 0) * 0.15))
    )
  );
  if (amount <= 0) return;
  sibling.financialCash -= amount;
  sibling.financialAnnualExpense = (sibling.financialAnnualExpense || 0) + amount;
  sibling.parentSupportPaidYear = s.year;
  sibling.parentSupportPaidAmount = amount;
  sibling.parentSupportPaidTotal = (sibling.parentSupportPaidTotal || 0) + amount;
  sibling.financialTransfers || (sibling.financialTransfers = []);
  sibling.financialTransfers.push({
    year: s.year,
    amount,
    direction: "out",
    reason: "別居きょうだい本人が親世帯へ定期拠出"
  });
  sibling.financialTransfers = sibling.financialTransfers.slice(-12);
  const previousFinancialStatus = sibling.financialStatus,
    latest = sibling.financialHistory?.at(-1);
  sibling.financialStatus = siblingFinancialStatus(sibling);
  if (latest?.year === s.year) {
    latest.expense += amount;
    latest.net -= amount;
    latest.cash = sibling.financialCash;
    latest.status = sibling.financialStatus;
  }
  if (
    sibling.financialStatus === "strained" &&
    previousFinancialStatus !== "strained" &&
    sibling.contactState !== "ended" &&
    sibling.contactState !== "paused"
  ) {
    sibling.financialNoticeYear = s.year;
    sibling.contactReviewYear = Math.min(sibling.contactReviewYear ?? s.year, s.year);
  }
  ledger.pendingSiblingContributions || (ledger.pendingSiblingContributions = []);
  ledger.pendingSiblingContributions.push({ year: s.year, siblingId: sibling.id, amount });
}
function advanceIndependentSiblingEconomy(s) {
  for (const sibling of siblingsOf(s)) {
    if (sibling.d || !sibling.independentSinceYear) continue;
    if (!Number.isFinite(sibling.financialUpdatedYear)) {
      sibling.financialUpdatedYear = s.year - 1;
      sibling.financialCash = 0;
      sibling.financialDebt = 0;
      sibling.financialExpenseTier = Math.max(0, Math.min(EXP.length - 1, s.w?.i ?? 2));
      sibling.financialPriceIndex = s.priceIndex || 1;
      sibling.financialStatus = "unknown";
      sibling.financialHistory = [];
      sibling.financialTransfers = [];
    }
    if (sibling.financialUpdatedYear >= s.year) {
      reviewSiblingParentSupport(s, sibling);
      continue;
    }
    const region = REG.find(item => item.n === sibling.region) || s.res,
      priceIndex = Math.max(0.1, (sibling.financialPriceIndex || 1) * (1 + P("economy.costInflationAnnual"))),
      job = J[sibling.j] || J[0],
      partner =
        sibling.familyHousehold?.partner && !sibling.familyHousehold.partner.d
          ? sibling.familyHousehold.partner
          : null,
      children = (sibling.familyHousehold?.children || []).filter(child => !child.d),
      partnerJob = partner && Number.isInteger(partner.j) ? J[partner.j] : null,
      income =
        (Math.max(0, job.pay || 0) +
          Math.max(0, partnerJob?.pay || 0) * P("family.siblingPartnerIncomeShare")) *
        region.pm *
        (1 + (priceIndex - 1) * 0.65),
      householdCostScale =
        1 +
        (partner ? P("family.siblingPartnerExpenseShare") : 0) +
        children.length * P("family.siblingChildExpenseShare"),
      expense =
        Math.max(
          P("economy.minimumExpenseBase"),
          (EXP[sibling.financialExpenseTier] || EXP[2]) * householdCostScale
        ) *
        region.pm *
        priceIndex,
      debtBefore = Math.max(0, sibling.financialDebt || 0) * (1 + P("economy.debtInterest")),
      cashBefore = Math.max(0, sibling.financialCash || 0),
      net = income - expense;
    if (net >= 0) {
      const repayment = Math.min(debtBefore, net);
      sibling.financialDebt = debtBefore - repayment;
      sibling.financialCash = cashBefore + net - repayment;
    } else {
      const shortfall = -net;
      sibling.financialCash = Math.max(0, cashBefore - shortfall);
      sibling.financialDebt = Math.min(1e12, debtBefore + Math.max(0, shortfall - cashBefore));
    }
    const previous = sibling.financialStatus || "unknown";
    sibling.financialPriceIndex = priceIndex;
    sibling.financialUpdatedYear = s.year;
    sibling.financialAnnualIncome = income;
    sibling.financialAnnualExpense = expense;
    sibling.financialStatus = siblingFinancialStatus(sibling);
    sibling.financialHistory || (sibling.financialHistory = []);
    sibling.financialHistory.push({
      year: s.year,
      income,
      expense,
      net,
      cash: sibling.financialCash,
      debt: sibling.financialDebt,
      status: sibling.financialStatus
    });
    sibling.financialHistory = sibling.financialHistory.slice(-12);
    if (
      sibling.financialStatus === "strained" &&
      previous !== "strained" &&
      sibling.contactState !== "ended" &&
      sibling.contactState !== "paused"
    ) {
      sibling.financialNoticeYear = s.year;
      sibling.contactReviewYear = Math.min(sibling.contactReviewYear ?? s.year, s.year);
    }
    reviewSiblingParentSupport(s, sibling);
  }
}
function advanceIndependentSiblingFamilies(s) {
  for (const sibling of siblingsOf(s)) {
    if (!sibling.independentSinceYear || !sibling.familyHousehold) continue;
    const family = sibling.familyHousehold,
      relatives = [...(family.partner ? [family.partner] : []), ...(family.children || [])];
    for (const person of relatives) {
      if (person.d) continue;
      if (!Number.isInteger(person.mortalityCheckedYear)) {
        person.mortalityCheckedYear = s.year;
        continue;
      }
      if (person.mortalityCheckedYear >= s.year) continue;
      const mortality = spouseMortalityRisk(s, person);
      person.mortalityCheckedYear = s.year;
      if (
        !mortality ||
        !(
          mortality.risk >= 1 ||
          keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|sibling-family-death`) < mortality.risk
        )
      )
        continue;
      person.d = s.year;
      person.deathCause = mortality.cause;
      const type = person === family.partner ? "partner_died" : "child_died";
      family.history || (family.history = []);
      family.history.push({
        year: s.year,
        type,
        personId: person.id,
        personName: person.nm,
        deathYear: s.year,
        cause: person.deathCause
      });
      family.history = family.history.slice(-20);
      if (!sibling.d) {
        sibling.familyNoticeYear = s.year;
        if (sibling.contactState !== "ended" && sibling.contactState !== "paused")
          sibling.contactReviewYear = Math.min(sibling.contactReviewYear ?? s.year, s.year);
      }
    }
    if (sibling.d || !Number.isFinite(family.reviewYear) || s.year < family.reviewYear) continue;
    const age = Math.max(0, s.year - sibling.by);
    family.reviewYear =
      s.year + rnd(P("family.siblingFamilyReviewMinYears"), P("family.siblingFamilyReviewMaxYears"));
    const region = REG.find(r => r.n === sibling.region) || s.res;
    if (
      (!family.partner || family.partner.d) &&
      age >= P("family.siblingPartnerMinAge") &&
      age <= P("family.siblingPartnerMaxAge") &&
      R() < P("family.siblingPartnerFormationChance")
    ) {
      const sx = R() < P("birth.femaleShare") ? "女" : "男",
        partner = {
          id: newRelativeId(s),
          nm: nmUnique_(s, sx, region),
          sx,
          r: pickRaceFor(region),
          by: sibling.by + rnd(-5, 5),
          j: wp(SIM_TABLES.parentJobs).jobId,
          unionYear: s.year,
          relationType: "共同生活する相手",
          inf: 0,
          d: 0,
          mortalityCheckedYear: s.year
        };
      family.partner = partner;
      family.history.push({
        year: s.year,
        type: "partner_formed",
        personId: partner.id,
        personName: partner.nm
      });
      sibling.familyNoticeYear = s.year;
      if (sibling.contactState !== "ended" && sibling.contactState !== "paused")
        sibling.contactReviewYear = Math.min(sibling.contactReviewYear ?? s.year, s.year);
    } else if (
      family.partner &&
      family.children.length < P("family.siblingChildrenMax") &&
      age <= P("family.siblingChildArrivalMaxAge") &&
      R() < P("family.siblingChildJoinChance")
    ) {
      const sx = R() < P("birth.femaleShare") ? "女" : "男",
        childAge = rnd(0, Math.min(17, age)),
        child = {
          id: newRelativeId(s),
          nm: nmUnique_(s, sx, region),
          sx,
          r: pickRaceFor(region),
          by: s.year - childAge,
          j: 0,
          inf: 0,
          d: 0,
          relationType: "子として育てている",
          mortalityCheckedYear: s.year
        };
      family.children.push(child);
      family.history.push({
        year: s.year,
        type: "child_joined_household",
        personId: child.id,
        personName: child.nm
      });
      sibling.familyNoticeYear = s.year;
      if (sibling.contactState !== "ended" && sibling.contactState !== "paused")
        sibling.contactReviewYear = Math.min(sibling.contactReviewYear ?? s.year, s.year);
    }
  }
}
function advanceSiblingLives(s) {
  for (const sibling of siblingsOf(s)) {
    if (sibling.d) continue;
    const uncertainLegacyFields = new Set(sibling.legacyRepair || []);
    if (
      !uncertainLegacyFields.has("出生年") &&
      !uncertainLegacyFields.has("種族") &&
      !uncertainLegacyFields.has("生死記録")
    ) {
      if (!Number.isInteger(sibling.mortalityCheckedYear)) sibling.mortalityCheckedYear = s.year - 1;
      if (sibling.mortalityCheckedYear < s.year) {
        const mortality = spouseMortalityRisk(s, sibling),
          before = HL && !CAPTURE_TRACE ? null : traceState(s);
        sibling.mortalityCheckedYear = s.year;
        if (
          mortality &&
          (mortality.risk >= 1 ||
            keyedRoll(`${sibling.id}|${sibling.nm}|${sibling.by}|${s.year}|death`) < mortality.risk)
        ) {
          sibling.d = s.year;
          sibling.deathCause = mortality.cause;
          sibling.deathNoticePending = true;
          const origin = REG.find(region => region.n === sibling.region) || s.res,
            route = careNetworkInfoRoute({ ...s, res: origin }, s.res.n);
          sibling.deathNoticeAvailableYear = s.year + route.delayYears;
          sibling.deathNoticeChannel = route.channel;
          sibling.exposurePending = 0;
          sibling.exposureReviewYear = null;
          sibling.parentNeedPending = null;
          sibling.reconnectInviteYear = null;
          sibling.reconnectReviewYear = null;
          sibling.contactReviewYear = null;
          sibling.moveReviewYear = null;
          sibling.workReviewYear = null;
          sibling.parentNeedReviewYear = null;
          sibling.parentSupportReviewYear = null;
          if (sibling.independentSinceYear && sibling.familyHousehold)
            sibling.familyHousehold.reviewYear = null;
          if (sibling.independentSinceYear && sibling.familyHousehold)
            sibling.postDeathFamilyFinance = {
              status: "survivor_economy_untracked",
              deathYear: s.year,
              lastKnownYear: Number.isFinite(sibling.financialUpdatedYear)
                ? sibling.financialUpdatedYear
                : null
            };
          if (sibling.careSupportAnnual > 0) {
            sibling.careSupportAnnual = 0;
            sibling.careSupportEndedYear = s.year;
          }
          recordTrace(
            "sibling-death",
            sibling.id,
            {
              actualDeathYear: sibling.d,
              cause: sibling.deathCause,
              noticeAvailableYear: sibling.deathNoticeAvailableYear,
              channel: sibling.deathNoticeChannel,
              basis: "game-model"
            },
            before
          );
        }
      }
    }
    if (sibling.d || !sibling.independentSinceYear) continue;
    if (sibling.d || !Number.isFinite(sibling.workReviewYear) || s.year < sibling.workReviewYear) continue;
    sibling.workReviewYear =
      s.year + rnd(P("family.siblingWorkReviewMinYears"), P("family.siblingWorkReviewMaxYears"));
    if (R() >= P("family.siblingWorkChangeChance")) continue;
    const pool = SIM_TABLES.parentJobs.filter(job => job.jobId !== sibling.j);
    if (!pool.length) continue;
    const fromJobId = sibling.j,
      toJobId = wp(pool).jobId;
    if (fromJobId === toJobId) continue;
    sibling.j = toJobId;
    sibling.jobHistory || (sibling.jobHistory = []);
    sibling.jobHistory.push({ year: s.year, fromJobId, toJobId, cause: "雇用や暮らしの事情" });
    if (sibling.contactState !== "ended" && sibling.contactState !== "paused")
      sibling.contactReviewYear = Math.min(sibling.contactReviewYear ?? s.year, s.year);
  }
}
function advanceIndependentSiblingMoves(s) {
  for (const sibling of siblingsOf(s)) {
    if (
      sibling.d ||
      !sibling.independentSinceYear ||
      !Number.isFinite(sibling.moveReviewYear) ||
      s.year < sibling.moveReviewYear
    )
      continue;
    sibling.moveReviewYear =
      s.year + rnd(P("family.siblingMoveReviewMinYears"), P("family.siblingMoveReviewMaxYears"));
    if (R() >= P("family.siblingMoveChance")) continue;
    const origin = REG.find(region => region.n === sibling.region),
      routes = origin
        ? (MIGRATION_ROUTES[origin.n] || []).filter(route => REG.some(region => region.n === route.n))
        : [];
    if (!routes.length) continue;
    const destination = wp(routes.map(route => ({ w: route.w, route }))).route,
      from = sibling.region;
    sibling.region = destination.n;
    sibling.moveHistory || (sibling.moveHistory = []);
    sibling.moveHistory.push({ year: s.year, from, to: destination.n, cause: "仕事・親族・暮らしの縁" });
    if (sibling.contactState !== "ended" && sibling.contactState !== "paused")
      sibling.contactReviewYear = Math.min(sibling.contactReviewYear ?? s.year, s.year);
  }
}
function advanceSiblingReconnectionInvites(s) {
  for (const sibling of siblingsOf(s)) {
    if (
      sibling.d ||
      !sibling.independentSinceYear ||
      sibling.contactState !== "ended" ||
      sibling.reconnectInviteYear
    )
      continue;
    if (!Number.isFinite(sibling.reconnectReviewYear)) {
      sibling.reconnectReviewYear =
        s.year + rnd(P("family.siblingRecontactReviewMinYears"), P("family.siblingRecontactReviewMaxYears"));
      continue;
    }
    if (s.year < sibling.reconnectReviewYear) continue;
    sibling.reconnectReviewYear =
      s.year + rnd(P("family.siblingRecontactReviewMinYears"), P("family.siblingRecontactReviewMaxYears"));
    if (R() < P("family.siblingRecontactInviteChance")) {
      sibling.reconnectInviteYear = s.year;
      sibling.contactHistory || (sibling.contactHistory = []);
      sibling.contactHistory.push({
        year: s.year,
        state: "recontact_invited",
        initiatedBy: "sibling",
        reason: "連絡を再開したいと本人が便りを送った"
      });
      sibling.contactHistory = sibling.contactHistory.slice(-20);
    }
  }
}
