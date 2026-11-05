const STANDARD_EMPLOYMENT_JOBS = new Set([2, 3, 6, 7, 8, 9, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 25, 27]);
const contractEligibleJob = s => STANDARD_EMPLOYMENT_JOBS.has(s.job);
function ensureWorkplaceLedger(s, facility, year = s.year) {
  if (!facility || facility.kind !== "workplace") return null;
  if (!facility.employer) {
    const roll = key => keyedRoll(`terra-employer-v76:${facility.id}:${key}`);
    const headCount = 3 + Math.floor(roll("size") * 10);
    facility.employer = {
      version: 1,
      createdYear: year,
      staffSlots: headCount,
      openings: 1 + Math.floor(roll("openings") * Math.min(4, headCount)),
      payScale:
        Math.round(
          (P("social.employerMinimumPayScale") +
            roll("pay") * (P("social.employerMaximumPayScale") - P("social.employerMinimumPayScale"))) *
            100
        ) / 100,
      shift: roll("shift") < 0.18 ? "long" : roll("shift") > 0.83 ? "short" : "regular",
      safety: roll("safety") < 0.3 ? "basic" : "managed",
      lastYear: year,
      history: [],
      basis: "synthetic-employer-model"
    };
  }
  return facility.employer;
}
function advanceWorkplaceLedger(s, facility, year) {
  const ledger = ensureWorkplaceLedger(s, facility, year);
  if (!ledger || ledger.lastYear >= year) return ledger;
  // 運営規模はモデル上の求人・募集余地。地元人口やNPC全員の採用枠を表さない。
  const old = ledger.openings;
  const localPressure = facility.status === "limited" ? -0.5 : facility.status === "strained" ? -0.2 : 0.15;
  const roll = keyedRoll(`terra-employer-openings:${facility.id}:${year}`);
  ledger.openings = clamp(
    Math.round(ledger.openings + (roll < 0.2 ? -1 : roll > 0.82 ? 1 : 0) + localPressure),
    0,
    Math.min(4, ledger.staffSlots)
  );
  if (old !== ledger.openings) {
    ledger.history.push({ year, field: "openings", from: old, to: ledger.openings, basis: "game-model" });
    ledger.history = ledger.history.slice(-16);
  }
  ledger.lastYear = year;
  return ledger;
}
function reconcileWorkContract(s) {
  const episode = currentPlayerEmployment(s);
  if (episode) {
    const site = s.world?.occupationWorld?.sites?.[episode.siteId],
      term = episode.scheduledEndAt,
      termEnded = term && s.year * 12 + (s.mo || 1) >= term.year * 12 + term.month,
      moved = episode.areaId && site?.kind !== "mobile" && !episode.affiliationId &&
        occupationWorkAreaKey(s) !== episode.areaId;
    if ((s.job !== episode.jobId && episode.projectAsJob !== false) || s.fl?.retired ||
        (restricted(s) && episode.kind !== "coerced-assignment") || site?.status === "closed" || termEnded || moved) {
      endPlayerEmployment(s, site?.status === "closed" ? "worksite-closed" : termEnded ? "term-completed" :
        "occupation-or-availability-changed", site?.status === "closed" ? site.operationTo : termEnded ? term : null);
    } else if (episode.kind === "wage-employment") {
      // The actual site is a persistent world record, never a local synthetic workplace.
      if (!s.workContract || s.workContract.basis !== "occupation-episode" ||
          s.workContract.episodeId !== episode.episodeId) {
        s.workContract = {
          siteId: episode.siteId, jobId: episode.jobId, episodeId: episode.episodeId,
          startYear: episode.startYear, status: "active", wagePremium: 0,
          hours: "regular", assignment: "usual", knownConditions: "basic",
          basis: "occupation-episode"
        };
      }
      return s.workContract;
    }
  }
  // Non-wage roles never fall through to the existing contract model.
  if (currentPlayerEmployment(s)) return null;
  s.workContractHistory ||= [];
  const prior = s.workContract;
  const eligible = contractEligibleJob(s) && !s.fl?.retired && !restricted(s);
  const away = travelPresence(s).mode !== "residence";
  // Temporary absence neither terminates an existing job nor creates a
  // new local employer contract at an unattended home workplace.
  if (away && prior?.status === "active" && eligible && prior.jobId === s.job)
    return prior;
  const site = eligible && !away ? activeFacility(s, "workplace") : null;
  if (prior && (!site || prior.siteId !== site.id || prior.jobId !== s.job || prior.status !== "active")) {
    if (prior.status === "active")
      s.workContractHistory.push({
        year: s.year,
        siteId: prior.siteId,
        jobId: prior.jobId,
        action: "ended",
        reason: !eligible ? "employment-ended" : prior.jobId !== s.job ? "occupation-changed" : "site-changed",
        assignment: prior.assignment
      });
    s.workContract = null;
  }
  if (site) {
    const employer = ensureWorkplaceLedger(s, site);
    if (!s.workContract) {
      s.workContract = {
        siteId: site.id,
        jobId: s.job,
        startYear: s.year,
        status: "active",
        wagePremium: 0,
        hours: employer.shift,
        assignment: "usual",
        knownConditions: "basic",
        basis: "current-year-model"
      };
      s.workContractHistory.push({
        year: s.year,
        siteId: site.id,
        jobId: s.job,
        action: "started",
        basis: "current-year-model"
      });
    }
  }
  s.workContractHistory = s.workContractHistory.slice(-80);
  closeInfectionWorkplaceDisclosureIfEmploymentChanged(s);
  return s.workContract || null;
}
function closeInfectionWorkplaceDisclosureIfEmploymentChanged(s) {
  const record = s.infectionWorkplace;
  if (!record || record.status !== "awaiting-review") return;
  const occupationChanged = s.job !== record.disclosedJobId,
    worksiteChanged = !!record.siteId && s.workContract?.siteId !== record.siteId;
  if (!occupationChanged && !worksiteChanged) return;
  record.status = "employment-changed";
  record.closedYear = s.year;
  record.reviewOutcome = occupationChanged ? "occupation-changed" : "worksite-changed";
  record.reviewedYear = null;
  record.reviewDueYear = null;
  record.reviewJobId = s.job;
  record.reviewSiteId = s.workContract?.siteId || null;
}
function contractIncomeFactor(s) {
  const contract = reconcileWorkContract(s);
  if (!contract) return 1;
  if (contract.basis === "occupation-episode")
    return clamp((1 + (contract.wagePremium || 0)) *
      (contract.hours === "short" ? P("social.employerShortHoursIncomeFactor") :
        contract.hours === "long" ? P("social.employerLongHoursIncomeFactor") : 1), 0.5, 1.4);
  const employer = s.community?.facilities?.[contract.siteId]?.employer;
  if (!employer) return 1;
  // 施設稼働の既存補正とは別に、雇用先の契約上の賃金だけを反映。親・配偶者の賃金は対象外。
  return clamp(
    employer.payScale *
      (1 + contract.wagePremium) *
      (contract.hours === "short"
        ? P("social.employerShortHoursIncomeFactor")
        : contract.hours === "long"
          ? P("social.employerLongHoursIncomeFactor")
          : 1),
    0.5,
    1.4
  );
}
function applyWorkContractAction(s, action) {
  if (!action || !["review", "negotiate", "hours", "assignment"].includes(action.action))
    throw Error("職場契約への行動が不正");
  settleEmploymentThrough(s, s.year, Math.max(0, (s.mo || 1) - 1));
  const result = action.result || "approved";
  if (!["approved", "declined"].includes(result)) throw Error("契約協議の結果が不正");
  const contract = reconcileWorkContract(s);
  if (!contract) throw Error("契約中の勤務先がない");
  const actualSite = contract.basis === "occupation-episode"
      ? s.world?.occupationWorld?.sites?.[contract.siteId] : null,
    facility = actualSite || activeFacility(s, "workplace"),
    ledger = actualSite
      ? { openings: s.world.occupationWorld.positions[actualSite.positionIds[0]]?.vacancyCount ?? 0 }
      : ensureWorkplaceLedger(s, facility);
  if (!facility || facility.siteId !== contract.siteId && facility.id !== contract.siteId || !ledger)
    throw Error("勤務先の施設情報が不一致");
  if (action.action === "review") contract.knownConditions = "reviewed";
  if (action.action === "negotiate") {
    if (result === "approved") {
      if (ledger.openings === 0 && facility.status === "limited")
        throw Error("採用停止中の施設で賃金改善を確定できない");
      contract.wagePremium = clamp(
        (contract.wagePremium || 0) + P("social.employerPayNegotiationStep"),
        0,
        0.12
      );
    }
    contract.knownConditions = "reviewed";
  }
  if (action.action === "hours") {
    if (result === "approved") contract.hours = "short";
    contract.knownConditions = "reviewed";
  }
  if (action.action === "assignment") {
    if (
      !s.inf ||
      !s.fl?.dg ||
      s.job !== s.infectionWorkplace?.disclosedJobId ||
      (J[s.job]?.ex || 1) <= 1.1 ||
      s.infectionWorkplace?.status !== "awaiting-review" ||
      (s.infectionWorkplace?.siteId && s.infectionWorkplace.siteId !== contract.siteId) ||
      contract.assignment !== "usual"
    )
      throw Error("鉱石病診断後の配置変更を相談できる勤務条件ではない");
    if (result === "approved") contract.assignment = "adjusted";
    contract.knownConditions = "reviewed";
  }
  s.workContractHistory.push({
    year: s.year,
    siteId: contract.siteId,
    jobId: contract.jobId,
    action: action.action,
    outcome: result,
    basis: "player-choice",
    wagePremium: contract.wagePremium,
    hours: contract.hours,
    assignment: contract.assignment
  });
  s.workContractHistory = s.workContractHistory.slice(-80);
}
