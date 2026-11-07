// Employment cases and actual work episodes. See docs/employment/TERRA_EMPLOYMENT_INTEGRATED_DESIGN_V3_20261105.md.
// This module intentionally does not create jobs from a profession identifier.
function playerEmploymentState(s) {
  s.employmentState ||= { version: 1, cases: [], episodes: [], activeEpisodeId: null, knowledge: [] };
  return s.employmentState;
}
function currentPlayerEmployment(s) {
  const records = s.employmentState;
  return records?.episodes?.find(row =>
    row.episodeId === records.activeEpisodeId && row.status === "active") || null;
}
function employmentQualificationRole(jobId) {
  return jobId === 7 ? "technical" : jobId === 12 ? "teacher" :
    jobId === 20 ? "medical-assistant" : jobId === 21 ? "office-assistant" : "general";
}
function employmentOpeningRequest(s, jobId, opening) {
  const employer = s.world?.occupationWorld?.employers?.[opening.employerId];
  return {
    jobId, organizationKey: employer?.organizationKey || undefined,
    siteId: opening.siteId, positionId: opening.positionId,
    openingId: opening.openingId, role: employmentQualificationRole(jobId),
    knownToPerson: true, selected: true, accepted: true, started: true,
    specialPath: false
  };
}
// Read-only eligibility check. A visible offer has to be one the person can
// actually accept, not merely the first site with an unfilled position.
function employmentOpeningForChoice(s, jobId, openingId = null, allowTransfer = false) {
  if (s.dead || (!allowTransfer && (s.job > 0 || currentPlayerEmployment(s))) ||
      s.fl?.retired || restricted(s) || travelPresence(s).mode !== "residence")
    return null;
  return occupationOpeningsFor(s, jobId).find(opening => {
    if (openingId && opening.openingId !== openingId) return false;
    const request = employmentOpeningRequest(s, jobId, opening);
    return assessPlayerEmploymentAccess(s, request).canStart &&
      careerOpeningAssessment(s, request).canBeAssigned;
  }) || null;
}
function assessEmploymentChoice(s, jobId, openingId = null, allowTransfer = false) {
  const opening = employmentOpeningForChoice(s, jobId, openingId, allowTransfer);
  if (!opening) return { canStart: false, reasonCode: "no-qualified-opening" };
  const request = employmentOpeningRequest(s, jobId, opening),
    work = s.world.occupationWorld,
    site = work.sites[opening.siteId],
    access = careerOpeningAssessment(s, request),
    gate = assessPlayerEmploymentAccess(s, request);
  return {
    canStart: gate.canStart && access.canBeAssigned && !!site &&
      site.areaId === occupationWorkAreaKey(s),
    reasonCode: gate.reasonCode || (!access.canBeAssigned ? "qualification-incomplete" : null),
    request, opening
  };
}
function endPlayerEmployment(s, reason = "voluntary-leave", endAt = null) {
  const episode = currentPlayerEmployment(s);
  if (!episode) return null;
  const date = endAt || {year:s.year, month:Math.max(1,s.mo || 1)};
  settleEmploymentThrough(s, date.year, date.month - 1);
  const work = s.world?.occupationWorld;
  const position = work?.positions?.[episode.positionId];
  if (position) {
    position.identifiedOccupiedSlots = Math.max(0, (position.identifiedOccupiedSlots || 0) - 1);
    position.vacancyCount = Math.max(0, position.capacity - position.aggregateOccupiedSlots -
      position.identifiedOccupiedSlots - (position.reservedSlots || 0));
  }
  episode.status = "terminated";
  episode.endYear = date.year;
  episode.endMonth = date.month;
  episode.leaveReason = reason;
  episode.history.push({ year: s.year, month: episode.endMonth, status: "terminated", reason });
  const state = playerEmploymentState(s);
  state.activeEpisodeId = null;
  if (reason !== "death" && s.job === episode.jobId) {
    const previousJob = s.job;
    s.job = 0;
    recordCareerChange(s, previousJob, 0);
  }
  if (s.workContract?.basis === "occupation-episode" &&
      s.workContract.episodeId === episode.episodeId) {
    s.workContractHistory ||= [];
    s.workContractHistory.push({
      year: s.year, siteId: episode.siteId, jobId: episode.jobId,
      action: "ended", reason, basis: "occupation-episode", episodeId: episode.episodeId
    });
    s.workContract = null;
  }
  return episode;
}
function applyPlayerEmploymentAction(s, action) {
  if (["accept-known-opening", "decline-known-opening"].includes(action?.action))
    return resolveKnownEmploymentOpening(s, action.action === "accept-known-opening");
  if (action?.action === "start-livelihood") return startEmploymentLivelihood(s, action);
  if (action?.action === "receive-work-meal") return recordEmploymentMeal(s, action.sourceEventId);
  if (action?.action === "record-in-kind-allocation")
    return recordEmploymentInKindAllocation(s, action.sourceEventId, action.supportShare);
  if (action?.action === "site-incident") return applyEmploymentSiteIncident(s, action);
  if (!action || !["accept-local-opening", "leave", "complete-gig", "suspend", "resume", "pay-arrears"].includes(action.action))
    throw Error("採用案件の操作が不正");
  if (action.action === "pay-arrears") return payEmploymentArrears(s, action.episodeId);
  if (["suspend", "resume"].includes(action.action)) return changeEmploymentAvailability(s, action);
  if (action.action === "complete-gig")
    return recordCompletedGig(s, action);
  if (action.action === "leave") {
    if (!currentPlayerEmployment(s)) throw Error("終了する現職の記録がない");
    return endPlayerEmployment(s, action.reason || "voluntary-leave");
  }
  const jobId = action.jobId, assessed = assessEmploymentChoice(s, jobId, action.openingId, action.replaceCurrent === true);
  if (!assessed.canStart) throw Error("募集と本人の資格・通勤・勤務開始条件が一致しない");
  return commitEmploymentOpening(s, assessed, {transition:action.replaceCurrent === true});
}
function commitEmploymentOpening(s, assessed, options = {}) {
  const jobId = assessed.request.jobId;
  // All checks precede mutation. One player decision may commit the ordinary
  // clerical stages without requiring several consecutive choice events.
  const { opening, request } = assessed;
  const world = s.world.occupationWorld,
    position = world.positions[request.positionId],
    site = world.sites[request.siteId],
    employer = world.employers[site.employerId];
  if (position.vacancyCount < 1 || opening.slots < 1 ||
      site.status !== "open" || position.jobId !== jobId)
    throw Error("求人枠または職位がすでに埋まっている");
  const state = playerEmploymentState(s);
  if (currentPlayerEmployment(s)) {
    if (!options.transition) throw Error("すでに別の職業で勤務している");
    endPlayerEmployment(s, options.reason || "new-position");
  }
  const month = Number.isInteger(s.mo) && s.mo >= 1 && s.mo <= 12 ? s.mo : 1,
    personId = s.personId || s.identity?.id || "protagonist",
    caseId = "work-case:" + personId + ":" + (state.cases.length + 1),
    episodeId = "work-episode:" + personId + ":" + (state.episodes.length + 1);
  const application = {
    caseId, personId, openingId: opening.openingId, employerId: site.employerId,
    siteId: site.siteId, positionId: position.positionId, jobId,
    year: s.year, month, status: "active", basis: "player-choice",
    history: ["discovered", "verified", "applied", "screening", "offered",
      "accepted", "contracted", "active"].map(status => ({ status, year: s.year, month }))
  };
  const episode = {
    episodeId, personId, sourceCaseId: caseId, employerId: site.employerId,
    organizationKey: employer.organizationKey || null,
    siteId: site.siteId, positionId: position.positionId, jobId, kind: "wage-employment",
    status: "active", startYear: s.year, startMonth: month,
    sourceEventId: options.sourceEventId || TRACE_RESOLUTION?.id || null,
    affiliationId: options.affiliationId || null, payRegionPm: s.res.pm, areaId: site.areaId,
    endYear: null, endMonth: null, workFraction: 1, basis: options.affiliationId ? "confirmed-appointment" : "confirmed-local-opening",
    history: [{ year: s.year, month, status: "active", caseId }]
  };
  opening.slots--;
  position.identifiedOccupiedSlots = (position.identifiedOccupiedSlots || 0) + 1;
  position.vacancyCount = Math.max(0, position.capacity -
    position.aggregateOccupiedSlots - position.identifiedOccupiedSlots -
    (position.reservedSlots || 0));
  if (opening.slots === 0) opening.status = "filled";
  state.knowledge.push({
    openingId: opening.openingId, learnedYear: s.year, learnedMonth: month,
    source: "individual-job-choice", certainty: "confirmed"
  });
  state.cases.push(application);
  state.episodes.push(episode);
  state.activeEpisodeId = episodeId;
  const affiliation = episode.affiliationId && s.lifeRecord?.affiliations?.find(row => row.id === episode.affiliationId);
  if (affiliation && AFFILIATION_RULES[affiliation.id]?.scope === "workplace" && episode.siteId) {
    affiliation.anchor ||= {};
    affiliation.anchor.localityKey = localityKey(s);
    affiliation.anchor.workplaceId = episode.siteId;
    const history = affiliation.history?.at(-1);
    if (history && history.year === s.year) history.anchor = { ...affiliation.anchor };
  }
  const priorJob = s.job;
  s.job = jobId;
  s.workPayBonus = 0;
  s.fl.retired = 0;
  recordCareerChange(s, priorJob, jobId);
  s.workContractHistory ||= [];
  s.workContract = {
    siteId: episode.siteId, jobId, episodeId, startYear: s.year, status: "active",
    wagePremium: 0, hours: "regular", assignment: "usual",
    knownConditions: "basic", basis: "occupation-episode"
  };
  closeInfectionWorkplaceDisclosureIfEmploymentChanged(s);
  s.workContractHistory.push({
    year: s.year, siteId: episode.siteId, jobId, episodeId,
    action: "started", basis: "occupation-episode"
  });
  return episode;
}
/**
 * Completed one-off work is evidence of a specific task and payment, never an
 * indefinite employer or monthly salary. An event's money effect performs the
 * actual transfer; this record attributes the stated pre-scaling amount to the task.
 */
function recordCompletedGig(s, action) {
  const kind = action.kind;
  if (!["cargo-handling", "short-sentry", "local-errand", "market-watch", "contingency-logistics"].includes(kind))
    throw Error("短期業務の種類が不正");
  if (!Number.isSafeInteger(action.nominalCash) || action.nominalCash < 0 ||
      !action.sourceEventId || typeof action.sourceEventId !== "string")
    throw Error("短期業務の支払根拠が不正");
  const resourceJobId = kind === "short-sentry" ? 4 : 1,
    resource = action.resourceId ? resolveEmploymentLivelihoodResource(s, "seasonal-contract", resourceJobId, action.resourceId) : null;
  if (action.resourceId && !resource) throw Error("短期業務の現場がない");
  const month = Number.isInteger(s.mo) && s.mo >= 1 && s.mo <= 12 ? s.mo : 1,
    state = playerEmploymentState(s),
    sourceKey = action.sourceEventId + ":" + kind + ":" + s.year + ":" + month;
  if (state.episodes.some(row => row.sourceKey === sourceKey))
    throw Error("同じ短期業務の成果を二重に記録できない");
  const personId = s.personId || s.identity?.id || "protagonist",
    episode = {
      episodeId: "gig:" + personId + ":" + (state.episodes.length + 1),
      personId, sourceKey, sourceEventId: action.sourceEventId, kind: "gig",
      taskKind: kind, jobId: null, employerId: resource?.employerId || null, siteId: resource?.siteId || null,
      resourceId: resource?.resourceId || null,
      status: "completed", startYear: s.year, startMonth: month,
      endYear: s.year, endMonth: month, nominalCash: action.nominalCash,
      basis: "single-event-completed-work",
      history: [{ status: "completed", year: s.year, month }]
    };
  state.episodes.push(episode);
  return episode;
}
// Sum the actual months in this annual accounting period. End month is exclusive.
function employmentAnnualWageBase(s, year) {
  const episodes = s.employmentState?.episodes;
  if (!episodes?.some(row => row.kind === "wage-employment")) return null;
  let earnings = 0;
  for (const row of episodes) {
    if (row.kind !== "wage-employment" || row.startYear > year ||
        (row.endYear != null && row.endYear < year)) continue;
    const first = row.startYear === year ? row.startMonth : 1,
      afterLast = row.endYear === year ? row.endMonth : 13,
      months = Math.max(0, Math.min(13, afterLast) - Math.max(1, first));
    earnings += (J[row.jobId]?.pay || 0) * months / 12 * (row.workFraction ?? 1);
  }
  return earnings;
}
