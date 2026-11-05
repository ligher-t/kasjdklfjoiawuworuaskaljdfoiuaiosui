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
function employmentOpeningForChoice(s, jobId, openingId = null) {
  if (s.dead || s.job > 0 || currentPlayerEmployment(s) ||
      s.fl?.retired || restricted(s) || travelPresence(s).mode !== "residence")
    return null;
  return occupationOpeningsFor(s, jobId).find(opening => {
    if (openingId && opening.openingId !== openingId) return false;
    const request = employmentOpeningRequest(s, jobId, opening);
    return assessPlayerEmploymentAccess(s, request).canStart &&
      careerOpeningAssessment(s, request).canBeAssigned;
  }) || null;
}
function assessEmploymentChoice(s, jobId, openingId = null) {
  const opening = employmentOpeningForChoice(s, jobId, openingId);
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
function endPlayerEmployment(s, reason = "voluntary-leave") {
  const episode = currentPlayerEmployment(s);
  if (!episode) return null;
  const work = s.world?.occupationWorld;
  const position = work?.positions?.[episode.positionId];
  if (position) {
    position.identifiedOccupiedSlots = Math.max(0, (position.identifiedOccupiedSlots || 0) - 1);
    position.vacancyCount = Math.max(0, position.capacity - position.aggregateOccupiedSlots -
      position.identifiedOccupiedSlots - (position.reservedSlots || 0));
  }
  episode.status = "terminated";
  episode.endYear = s.year;
  episode.endMonth = Number.isInteger(s.mo) ? s.mo : 1;
  episode.leaveReason = reason;
  episode.history.push({ year: s.year, month: episode.endMonth, status: "terminated", reason });
  const state = playerEmploymentState(s);
  state.activeEpisodeId = null;
  if (s.job === episode.jobId) {
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
  if (!action || !["accept-local-opening", "leave"].includes(action.action))
    throw Error("採用案件の操作が不正");
  if (action.action === "leave") {
    if (!currentPlayerEmployment(s)) throw Error("終了する現職の記録がない");
    return endPlayerEmployment(s, action.reason || "voluntary-leave");
  }
  const jobId = action.jobId, assessed = assessEmploymentChoice(s, jobId, action.openingId);
  if (!assessed.canStart) throw Error("募集と本人の資格・通勤・勤務開始条件が一致しない");
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
  if (state.activeEpisodeId || state.episodes.some(row => row.status === "active"))
    throw Error("すでに別の職業で勤務している");
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
    endYear: null, endMonth: null, workFraction: 1, basis: "confirmed-local-opening",
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
  const priorJob = s.job;
  s.job = jobId;
  recordCareerChange(s, priorJob, jobId);
  s.workContractHistory ||= [];
  s.workContract = {
    siteId: episode.siteId, jobId, episodeId, startYear: s.year, status: "active",
    wagePremium: 0, hours: "regular", assignment: "usual",
    knownConditions: "basic", basis: "occupation-episode"
  };
  s.workContractHistory.push({
    year: s.year, siteId: episode.siteId, jobId, episodeId,
    action: "started", basis: "occupation-episode"
  });
  return episode;
}
// Sum the actual months in this annual accounting period. End month is exclusive.
function employmentAnnualWageBase(s, year) {
  const episodes = s.employmentState?.episodes;
  if (!episodes?.length) return null;
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
