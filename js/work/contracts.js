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
        moved ? "relocation" : "occupation-or-availability-changed",
        site?.status === "closed" ? site.operationTo : termEnded ? term : null);
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
  // A profession projection alone is not an employment contract. Versioned
  // career state has no legacy-save migration path; only active episodes may
  // own a current contract.
  if (s.workContract) s.workContract = null;
  s.workContractHistory = s.workContractHistory.slice(-80);
  closeInfectionWorkplaceDisclosureIfEmploymentChanged(s);
  return null;
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
  return clamp(
    (1 + (contract.wagePremium || 0)) *
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
  const facility = contract.basis === "occupation-episode"
      ? s.world?.occupationWorld?.sites?.[contract.siteId] : null,
    position = facility && s.world?.occupationWorld?.positions?.[contract.positionId ||
      currentPlayerEmployment(s)?.positionId],
    ledger = position ? { openings: position.vacancyCount ?? 0 } : null;
  if (!facility || facility.siteId !== contract.siteId || !ledger)
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
