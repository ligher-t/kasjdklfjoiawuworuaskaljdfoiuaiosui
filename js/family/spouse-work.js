function spouseWorkPreferenceLabel(value) {
  return (
    {
      income: "収入を重視",
      low_hazard: "危険負担を抑える",
      stay: "現職継続を希望",
      open: "幅広く検討",
      unrecorded: "未確認"
    }[value] || "未確認"
  );
}
function spouseWorkChangeChance(spouse) {
  return P("family.spouseWorkChangeChance") * (spouse?.workPreference === "stay" ? 0.25 : 1);
}
function spouseEmploymentMarketContext(spouse, fallbackRegion) {
  const region = spouse?.residenceRegion || fallbackRegion || "未確認",
    knownRegion = spouse?.knownResidenceRegion || region,
    profile = REGIONAL_EMPLOYMENT_PROFILES?.[region];
  return profile
    ? {
        region,
        knownRegion,
        weights: { ...profile.weights },
        sourceRefs: [...profile.sourceRefs],
        evidence: profile.evidence,
        scope: profile.scope,
        temporalStatus: profile.temporalStatus,
        validFromYear: profile.validFromYear,
        validToYear: profile.validToYear,
        status: "S"
      }
    : {
        region,
        knownRegion,
        weights: {},
        evidence: "個別の地域別職種重みなし",
        scope: "共通候補重みを使用",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        status: "unmodeled"
      };
}
function spouseJobCandidates(spouse, pool) {
  const preference = spouse?.workPreference || "open",
    market = REGIONAL_EMPLOYMENT_PROFILES?.[spouse?.residenceRegion]?.weights || {},
    maxPay = Math.max(1, ...pool.map(job => J[job.jobId]?.pay || 0));
  return pool.map(job => {
    const profile = J[job.jobId] || {},
      weight = Math.max(0.01, job.w || 1);
    let adjusted = weight * Math.max(0.01, market[job.jobId] || 1);
    if (preference === "income") adjusted *= 0.5 + (1.5 * (profile.pay || 0)) / maxPay;
    else if (preference === "low_hazard")
      adjusted /= 1 + Math.max(0, profile.ex || 0) * 0.35 + Math.max(0, profile.war || 0) * 0.25;
    else if (preference === "stay" && job.jobId === spouse?.j) adjusted *= 4;
    return { ...job, w: adjusted };
  });
}
function advanceSpouseWorkLife(s) {
  const spouse = s.sp;
  if (!spouse || spouse.d || !Number.isInteger(spouse.j) || !J[spouse.j]) return;
  const preferenceMin = P("family.spouseWorkPreferenceReviewMinYears"),
    preferenceMax = P("family.spouseWorkPreferenceReviewMaxYears");
  if (!Number.isFinite(spouse.workPreferenceReviewYear))
    spouse.workPreferenceReviewYear = s.year + rnd(preferenceMin, preferenceMax);
  if (s.year >= spouse.workPreferenceReviewYear) spouse.workPreferenceReviewPending = true;
  const min = P("family.spouseWorkReviewMinYears"),
    max = P("family.spouseWorkReviewMaxYears"),
    unemployed = spouseEmploymentStatus(spouse) === "unemployed";
  if (!Number.isFinite(spouse.workReviewYear)) {
    spouse.workReviewYear = s.year + rnd(min, max);
    return;
  }
  if (s.year < spouse.workReviewYear) return;
  if (spouse.householdArrangement === "caregiving") {
    spouse.workReviewYear = s.year + rnd(min, max);
    return;
  }
  spouse.employmentHistory || (spouse.employmentHistory = []);
  if (unemployed) {
    spouse.workReviewYear =
      s.year +
      rnd(P("family.spouseReemploymentReviewMinYears"), P("family.spouseReemploymentReviewMaxYears"));
    const chance = Math.min(1, P("family.spouseReemploymentChance") + (spouse.reemploymentBoost || 0));
    spouse.reemploymentBoost = 0;
    if (R() >= chance) return;
    const fromJobId = spouse.j,
      pool = spouseJobCandidates(spouse, SIM_TABLES.parentJobs),
      toJobId = pool.length ? wp(pool).jobId : fromJobId;
    spouse.employmentStatus = "employed";
    spouse.unemployedSinceYear = null;
    spouse.unemploymentSupportPending = false;
    spouse.employmentHistory.push({
      year: s.year,
      from: "unemployed",
      to: "employed",
      cause: "本人の求職・再就職"
    });
    spouse.employmentHistory = spouse.employmentHistory.slice(-16);
    recordDependentEmployment(s, spouse, {jobId: toJobId, region: spouseResidenceRegion(s).n,
      source: "spouse-reemployment", kind: "background-livelihood"});
    if (toJobId !== fromJobId) {
      spouse.j = toJobId;
      spouse.workHistory || (spouse.workHistory = []);
      spouse.workHistory.push({
        year: s.year,
        fromJobId,
        toJobId,
        cause: "失職後の求職・再就職",
        marketContext: spouseEmploymentMarketContext(spouse, s.res.n)
      });
      spouse.workHistory = spouse.workHistory.slice(-16);
    }
    return;
  }
  spouse.workReviewYear = s.year + rnd(min, max);
  if (R() < P("family.spouseUnemploymentChance")) {
    spouse.employmentStatus = "unemployed";
    closeDependentEmployment(s, spouse, "unemployed");
    spouse.unemployedSinceYear = s.year;
    spouse.unemploymentSupportPending = true;
    spouse.reemploymentBoost = 0;
    spouse.employmentHistory.push({
      year: s.year,
      from: "employed",
      to: "unemployed",
      cause: "雇用先の事情"
    });
    spouse.employmentHistory = spouse.employmentHistory.slice(-16);
    spouse.workReviewYear =
      s.year +
      rnd(P("family.spouseReemploymentReviewMinYears"), P("family.spouseReemploymentReviewMaxYears"));
    return;
  }
  if (R() >= spouseWorkChangeChance(spouse)) return;
  const pool = spouseJobCandidates(
    spouse,
    SIM_TABLES.parentJobs.filter(job => job.jobId !== spouse.j)
  );
  if (!pool.length) return;
  const fromJobId = spouse.j,
    toJobId = wp(pool).jobId;
  if (fromJobId === toJobId) return;
  spouse.j = toJobId;
  recordDependentEmployment(s, spouse, {jobId: toJobId, region: spouseResidenceRegion(s).n,
    source: "spouse-work-change", kind: "background-livelihood"});
  spouse.workHistory || (spouse.workHistory = []);
  spouse.workHistory.push({
    year: s.year,
    fromJobId,
    toJobId,
    cause: "雇用や本人の暮らしの事情",
    marketContext: spouseEmploymentMarketContext(spouse, s.res.n)
  });
  spouse.workHistory = spouse.workHistory.slice(-16);
}
function advanceSpouseSeparateLife(s) {
  const spouse = s.sp;
  if (!spouse || spouse.d) return;
  const min = P("family.spouseSeparateReviewMinYears"),
    max = P("family.spouseSeparateReviewMaxYears");
  if (spouseLivesWithProtagonist(s)) {
    spouse.separateLifeReviewPending = false;
    if (Number.isFinite(spouse.separateLifeReviewYear) && spouse.separateLifeReviewYear <= s.year)
      spouse.separateLifeReviewYear = s.year + rnd(min, max);
    return;
  }
  if (!Number.isFinite(spouse.separateLifeReviewYear)) {
    spouse.separateLifeReviewYear = s.year + rnd(min, max);
    return;
  }
  if (s.year >= spouse.separateLifeReviewYear) spouse.separateLifeReviewPending = true;
}
function advanceSpouseIndependentMove(s) {
  const spouse = s.sp;
  if (!spouse || spouse.d || spouseLivesWithProtagonist(s)) return;
  const min = P("family.spouseMoveReviewMinYears"),
    max = P("family.spouseMoveReviewMaxYears");
  if (spouse.residenceMoveNotice) {
    if (!Number.isInteger(spouse.independentMoveReviewYear) || spouse.independentMoveReviewYear <= s.year)
      spouse.independentMoveReviewYear = s.year + rnd(min, max);
    return;
  }
  if (!Number.isInteger(spouse.independentMoveReviewYear))
    spouse.independentMoveReviewYear = s.year + rnd(min, max);
  if (s.year < spouse.independentMoveReviewYear) return;
  spouse.independentMoveReviewYear = s.year + rnd(min, max);
  if (R() >= P("family.spouseIndependentMoveChance")) return;
  const move = spouseIndependentMoveRoute(s),
    finance = spouse.personalFinance;
  if (!move || finance?.status !== "modeled_balance" || !Number.isFinite(finance.cash)) return;
  const annualExpense =
      Math.max(P("economy.minimumExpenseBase"), EXP[finance.expenseTier] || EXP[2]) *
      move.origin.pm *
      (s.priceIndex || 1),
    reserve = annualExpense * 0.5;
  if (finance.cash < move.fare + reserve) return;
  const from = move.origin.n,
    to = move.destination.n;
  spouse.pendingRelocationCostForYear = move.fare;
  finance.transfers || (finance.transfers = []);
  finance.transfers.push({
    year: s.year,
    kind: "independent_relocation",
    cause: "別地域への転居",
    amount: -move.fare,
    from,
    to
  });
  finance.transfers = finance.transfers.slice(-20);
  spouse.residenceRegion = to;
  // Moving home does not prove a new employer. End local work and let the
  // existing independent work review establish the next livelihood.
  closeDependentEmployment(s, spouse, "relocation");
  spouse.employmentStatus = "unemployed";
  spouse.unemployedSinceYear = s.year;
  spouse.sharesHousehold = false;
  spouse.residenceHistory || (spouse.residenceHistory = []);
  spouse.residenceHistory.push({
    year: s.year,
    from,
    to,
    decision: "spouse_relocated",
    fare: move.fare,
    cause: "仕事・住居・生活上の事情"
  });
  spouse.residenceHistory = spouse.residenceHistory.slice(-16);
  spouse.knownResidenceRegion = from;
  spouse.residenceMoveNotice = {
    year: s.year,
    availableYear: s.year + 1,
    from,
    to,
    cause: "仕事・住居・生活上の事情"
  };
  spouse.workPreferenceReviewPending = true;
  spouse.workPreferenceReviewYear = s.year + 1;
  spouse.workPreferenceReviewCause = "independent_move";
  spouse.workReviewYear = Math.max(spouse.workReviewYear || 0, s.year + 2);
}
function deliverSpouseMoveNotice(s) {
  const notice = s.sp?.residenceMoveNotice;
  if (notice && notice.availableYear <= s.year && !Number.isInteger(notice.deliveredYear)) {
    notice.deliveredYear = s.year;
    s.sp.knownResidenceRegion = notice.to;
    s.sp.residenceKnownYear = s.year;
  }
}
function advanceSeparatedParentWorkLives(s) {
  const ledger = s.house?.parentLedger;
  if (!s.fl?.household_separated || ledger?.status !== "tracked") return;
  const caregiverIds = new Set(ledger.caregiverIds || []);
  for (const [key, parent] of Object.entries(s.par || {})) {
    if (
      !parent ||
      parent.d ||
      !caregiverIds.has(parent.id) ||
      !Number.isFinite(parent.workReviewYear) ||
      s.year < parent.workReviewYear
    )
      continue;
    parent.workReviewYear =
      s.year + rnd(P("family.parentWorkReviewMinYears"), P("family.parentWorkReviewMaxYears"));
    if (s.fl.parent_unemployed && s.parentUnemploymentTargetKey === key) continue;
    if (R() >= P("family.parentWorkChangeChance")) continue;
    const pool = SIM_TABLES.parentJobs.filter(job => job.jobId !== parent.j);
    if (!pool.length) continue;
    const fromJobId = parent.j,
      toJobId = wp(pool).jobId;
    if (fromJobId === toJobId) continue;
    parent.j = toJobId;
    parent.employmentRelocationPending = false;
    recordDependentEmployment(s, parent, {jobId: toJobId, region: ledger.region,
      source: "parent-work-change", kind: "background-livelihood"});
    parent.jobHistory || (parent.jobHistory = []);
    parent.jobHistory.push({ year: s.year, fromJobId, toJobId, cause: "雇用や家計の事情" });
  }
}
function repairSocialContactDeathRecords(s) {
  for (const contact of [s.friendContact, s.neighborContact].filter(Boolean)) {
    if (!["alive", "missing", "dead"].includes(contact.lifeStatus))
      contact.lifeStatus =
        contact.status === "deceased" || Number.isFinite(contact.deathYear) ? "dead" : "alive";
    if (!["alive", "missing", "dead", "unrecorded"].includes(contact.knownLifeStatus))
      contact.knownLifeStatus = contact.lifeStatus === "dead" ? "dead" : "alive";
    if (!Number.isFinite(contact.knownLifeStatusYear))
      contact.knownLifeStatusYear =
        contact.knownLifeStatus === "alive"
          ? contact.metYear || s.year
          : contact.knownLifeStatus === "dead"
            ? contact.deathKnownYear || s.year
            : s.year;
    if (!Array.isArray(contact.pendingMissingNotices)) contact.pendingMissingNotices = [];
    if (!Array.isArray(contact.pendingFoundNotices)) contact.pendingFoundNotices = [];
    if (!Array.isArray(contact.pendingRecontactNotices)) contact.pendingRecontactNotices = [];
    if (!["none", "requested", "closed"].includes(contact.recontactIntent)) contact.recontactIntent = "none";
    if (
      !["none", "requested", "reply_received", "reconnected", "closed"].includes(contact.knownRecontactStatus)
    )
      contact.knownRecontactStatus = contact.recontactIntent === "requested" ? "requested" : "none";
    if (!Number.isInteger(contact.recontactAttemptCount) || contact.recontactAttemptCount < 0)
      contact.recontactAttemptCount = 0;
    if (contact.recontactReviewYear != null && !Number.isFinite(contact.recontactReviewYear))
      contact.recontactReviewYear = null;
    if (!Array.isArray(contact.lifeHistory)) contact.lifeHistory = [];
    if (!Array.isArray(contact.knownLifeHistory)) contact.knownLifeHistory = [];
    if (!Number.isFinite(contact.searchEffort)) contact.searchEffort = 0;
    if (contact.missingSinceYear != null && !Number.isFinite(contact.missingSinceYear))
      contact.missingSinceYear = null;
    if (contact.missingFromRegion != null && !REG.some(region => region.n === contact.missingFromRegion))
      contact.missingFromRegion = null;
    if (contact.knownMissingSinceYear != null && !Number.isFinite(contact.knownMissingSinceYear))
      contact.knownMissingSinceYear = null;
    if (
      contact.knownMissingLastRegion != null &&
      !REG.some(region => region.n === contact.knownMissingLastRegion)
    )
      contact.knownMissingLastRegion = null;
    if (contact.missingReviewYear != null && !Number.isFinite(contact.missingReviewYear))
      contact.missingReviewYear = null;
    contact.pendingMissingNotices = contact.pendingMissingNotices.slice(-8);
    contact.pendingFoundNotices = contact.pendingFoundNotices.slice(-8);
    contact.pendingRecontactNotices = contact.pendingRecontactNotices.slice(-8);
    contact.lifeHistory = contact.lifeHistory.slice(-12);
    contact.knownLifeHistory = contact.knownLifeHistory.slice(-12);
    if (contact.lifeStatus === "missing") {
      if (!Number.isFinite(contact.missingSinceYear)) contact.missingSinceYear = s.year;
      if (!REG.some(region => region.n === contact.missingFromRegion))
        contact.missingFromRegion = contact.region || contact.knownRegion || s.res.n;
      contact.region = null;
    } else if (contact.lifeStatus !== "dead" && !Number.isFinite(contact.deathYear))
      contact.lifeStatus = "alive";
    if (contact.lifeStatus === "dead") {
      contact.lifeStatus = "dead";
      contact.status = "deceased";
      if (!Number.isFinite(contact.deathYear))
        contact.deathYear = Math.min(s.year, contact.endedYear || s.year);
      contact.deathYear = Math.max(
        Number.isFinite(contact.metYear) ? contact.metYear : contact.by,
        Math.min(s.year, contact.deathYear)
      );
      if (!Number.isFinite(contact.deathKnownYear)) contact.deathKnownYear = contact.deathYear;
      contact.deathKnownYear = Math.max(contact.deathYear, Math.min(s.year, contact.deathKnownYear));
      contact.endedYear = contact.deathYear;
      contact.ending = "死別";
      contact.deathCause = contact.deathCause || "旧記録では不明";
      contact.legacyRepair || (contact.legacyRepair = []);
      if (!contact.legacyRepair.includes("死亡記録の不足項目を補完"))
        contact.legacyRepair.push("死亡記録の不足項目を補完");
      contact.knownLifeStatus = "dead";
      contact.knownLifeStatusYear = contact.deathKnownYear;
    }
  }
  return s;
}
const parentJobNewsTarget = s =>
  [s.par?.fa, s.par?.mo].find(
    person => person && !person.d && (person.jobHistory?.length || 0) > (person.knownJobChangeCount || 0)
  ) || null;
