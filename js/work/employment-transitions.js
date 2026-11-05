// Shared effect admission. Assessments only read established world and person records.
let EMPLOYMENT_EFFECT_SOURCES;
function employmentEffectSource(effect) {
  if (TRACE_RESOLUTION?.id) return TRACE_RESOLUTION.id;
  if (!EMPLOYMENT_EFFECT_SOURCES) {
    EMPLOYMENT_EFFECT_SOURCES = new WeakMap();
    for (const event of EV) for (const fx of [event.fx, ...(event.c || []).flatMap(c => c.o.map(o => o[2]))])
      if (fx && typeof fx === "object") EMPLOYMENT_EFFECT_SOURCES.set(fx, event.id);
  }
  return EMPLOYMENT_EFFECT_SOURCES.get(effect) || null;
}
function normalizeEmploymentAffiliationEffects(effect) {
  const normalize = row => {
    if (row?.kind !== "employer") return row;
    const mode = EMPLOYER_PLAYER_ACCESS_MODES[employmentOrganizationKey(row)];
    if (mode === "COMMUNITY") return { ...row, kind: "community" };
    if (mode === "CONTACT") return { ...row, kind: "network" };
    return row;
  };
  return { ...effect, ...(effect.lifeAffiliation ? {lifeAffiliation: normalize(effect.lifeAffiliation)} : {}),
    ...(effect.lifeAffiliations ? {lifeAffiliations: effect.lifeAffiliations.map(normalize)} : {}) };
}
function resolveEmploymentLivelihoodResource(s, kind, jobId, requestedId = "local-resource") {
  if (requestedId === "family-business" || kind === "family-community" && jobId === 5) {
    const parent = Object.values(s.par || {}).find(row => row && !row.d && [5, 24].includes(row.j));
    if (!parent || s.fl?.household_separated || !s.house) return null;
    return { resourceId: "family-business:" + parent.id, ownerId: parent.id,
      region: s.res.n, localityKey: localityKey(s), canStart: true, basis: "known-family-business" };
  }
  const resource = employmentLivelihoodResource(s, kind, jobId);
  if (!resource || resource.canStart === false ||
      requestedId && !["local-resource", resource.resourceId].includes(requestedId)) return null;
  return resource;
}
function employmentDirectLivelihoodKind(jobId) {
  if ([1, 4].includes(jobId)) return "seasonal-contract";
  if ([5, 10, 13, 23, 24, 26, 62].includes(jobId)) return "self-employment";
  const mode = EMPLOYER_PLAYER_ACCESS_MODES[EMPLOYER_JOB_ORGANIZATIONS[jobId]];
  return mode === "COMMUNITY" ? "family-community" : mode === "CONTACT" ? "informal-illicit" : null;
}
function employmentEffectAssessment(s, effect, sourceEventId = employmentEffectSource(effect)) {
  if (!effect || typeof effect !== "object") return { canStart: true, kind: "none" };
  const action = effect.employmentAction;
  if (action?.action === "start-livelihood") {
    const resource = resolveEmploymentLivelihoodResource(s, action.kind, action.jobId, action.resourceId);
    return { canStart: !!resource && !s.dead && !restricted(s), kind: "livelihood", resource };
  }
  if (action?.action === "site-incident" && effect.job == null) {
    const episode = currentPlayerEmployment(s), site = s.world?.occupationWorld?.sites?.[episode?.siteId];
    if (!episode || !site) return { canStart: false, reasonCode: "current-worksite-required" };
    if (action.kind === "promotion-offer" && action.incident === "accepted") {
      const offer = employmentPromotionOffer(s, action.offerId);
      return offer ? assessEmploymentAppointment(s, { jobId:offer.jobId,
        affiliationId:episode.affiliationId, sourceEventId }) : { canStart:false };
    }
  }
  if (!Number.isInteger(effect.job) || effect.job <= 0) return { canStart: true, kind: "none" };
  const jobId = effect.job, current = currentPlayerEmployment(s),
    membership = [effect.lifeAffiliation, ...(effect.lifeAffiliations || [])].find(row => row &&
      ["join", "return", "assign", "role", "continue"].includes(row.action || "join")),
    mode = EMPLOYER_PLAYER_ACCESS_MODES[EMPLOYER_JOB_ORGANIZATIONS[jobId]];
  if (["BLOCKED", "SOURCE_HOLD", "HISTORICAL"].includes(mode))
    return { canStart: false, reasonCode: "non-recruiting-organization" };
  if (current?.jobId === jobId && (!membership || current.affiliationId === membership.id))
    return { canStart: true, kind: "continue", episode: current };
  const kind = employmentDirectLivelihoodKind(jobId);
  if (kind && (!membership || ["COMMUNITY", "CONTACT"].includes(mode) || jobId === 62 && membership.id === "columbia-frontier-pioneer")) {
    const resource = resolveEmploymentLivelihoodResource(s, kind, jobId);
    return { canStart: !!resource && !s.dead && (!restricted(s) || membership?.action === "assign"),
      kind: "livelihood", resource, livelihoodKind: kind, jobId,
      affiliationId: membership?.id, sourceEventId };
  }
  if (EMPLOYER_JOB_ORGANIZATIONS[jobId] && membership) {
    const assessed = assessEmploymentAppointment(s, { jobId, affiliationId: membership.id, sourceEventId });
    return { ...assessed, kind: "opening", sourceEventId, affiliationId: membership.id };
  }
  if (s.dead || restricted(s) || educationFullTime(s)) return { canStart: false, reasonCode: "unable-to-start" };
  const opening = occupationOpeningsFor(s, jobId).find(row => {
    const request = employmentOpeningRequest(s, jobId, row);
    return assessPlayerEmploymentAccess(s, request).canStart && careerOpeningAssessment(s, request).canBeAssigned;
  });
  return opening ? { canStart: true, kind: "opening", opening,
    request: employmentOpeningRequest(s, jobId, opening), sourceEventId, affiliationId: membership?.id || null }
    : { canStart: false, reasonCode: "no-qualified-opening" };
}
function employmentChoiceCanResolve(event, choice, s) {
  return (choice.o || []).every(outcome => {
    const assessment = employmentEffectAssessment(s, outcome[2], event.id);
    return assessment.canStart || assessment.canApply;
  });
}
function commitEmploymentEffect(s, effect, assessment) {
  if (!Number.isInteger(effect.job)) return;
  if (effect.job === 0) { endPlayerEmployment(s, "resolved-job-exit"); return; }
  if (!assessment?.canStart) throw Error("実際の仕事口または役割の成立条件がない");
  if (assessment.kind === "opening") {
    const episode = commitEmploymentOpening(s, assessment, { transition: true,
      affiliationId: assessment.affiliationId, sourceEventId: assessment.sourceEventId });
    const site = s.world.occupationWorld.sites[episode.siteId];
    if (site.kind === "mobile") episode.mobility = "mobile";
  } else if (assessment.kind === "livelihood") {
    startEmploymentLivelihood(s, { action: "start-livelihood", jobId: effect.job,
      kind: assessment.livelihoodKind, roleId: assessment.affiliationId || "independent-work",
      sourceEventId: assessment.sourceEventId || TRACE_RESOLUTION?.id,
      resourceId: assessment.resource.resourceId, projectAsJob: true, resource: assessment.resource });
  }
}
function startEmploymentLivelihood(s, action) {
  const kinds = ["self-employment", "family-community", "coerced-assignment", "seasonal-contract", "informal-illicit"],
    resource = action.resource || resolveEmploymentLivelihoodResource(s, action.kind, action.jobId, action.resourceId);
  if (!kinds.includes(action.kind) || !resource || !action.roleId || !action.sourceEventId ||
      !Number.isInteger(action.jobId) || s.dead) throw Error("生計の役割・資源・実行根拠がない");
  const prior = currentPlayerEmployment(s), state = playerEmploymentState(s), month = Math.max(1, s.mo || 1);
  if (prior?.resourceId === resource.resourceId && prior.roleId === action.roleId)
    throw Error("同じ生計の役割を重ねて開始できない");
  if (prior) endPlayerEmployment(s, "livelihood-transition");
  const episode = { episodeId: "livelihood:" + (s.personId || "protagonist") + ":" + (state.episodes.length + 1),
    personId: s.personId || "protagonist", kind: action.kind, jobId: action.jobId,
    roleId: action.roleId, resourceId: resource.resourceId, siteId: resource.siteId || null,
    employerId: null, ownerId: resource.ownerId || null, sourceEventId: action.sourceEventId,
    affiliationId: action.roleId, region: s.res.n, localityKey: localityKey(s),
    startYear: s.year, startMonth: month, status: "active", endYear: null, endMonth: null,
    workFraction: action.workFraction ?? (action.roleId === "apprentice" ? 0.25 : 1),
    payRegionPm: s.res.pm, expenseShare: 0.35, basis: resource.basis || "game-model-local-resource",
    projectAsJob: action.projectAsJob !== false && action.roleId !== "apprentice",
    history: [{ status: "active", year: s.year, month, sourceEventId: action.sourceEventId }] };
  if (action.kind === "seasonal-contract") episode.scheduledEndAt = { year: s.year, month: Math.min(13, month + 1) };
  state.episodes.push(episode); state.activeEpisodeId = episode.episodeId;
  const jobBefore = s.job;
  s.job = episode.projectAsJob ? action.jobId : 0;
  if (jobBefore !== s.job) recordCareerChange(s, jobBefore, s.job);
  s.workContract = null;
  if (action.ownershipTransfer && resource.ownerId) {
    const parent = Object.values(s.par || {}).find(row => row?.id === resource.ownerId);
    if (!parent || parent.d) throw Error("家業を引き渡す本人がいない");
    closeDependentEmployment(s, parent, "business-handed-over");
    parent.j = 0;
    s.familyBusiness = { resourceId: resource.resourceId, ownerId: episode.personId,
      previousOwnerId: parent.id, transferredYear: s.year, transferredMonth: month, sourceEventId: action.sourceEventId };
  }
  return episode;
}
function employmentEventWorksite(s, purpose) {
  const episode = currentPlayerEmployment(s), site = s.world?.occupationWorld?.sites?.[episode?.siteId];
  if (!episode || episode.kind !== "wage-employment" || !site || !["open", "strained"].includes(site.status)) return null;
  if (["factory-dispute", "framed-debt"].includes(purpose) && site.sector !== "MFG") return null;
  if (purpose === "research-records" && (!episode.researchRecordsAccess ||
      site.sector !== "SCI" && episode.organizationKey !== "rhine-lab")) return null;
  return { ...site, episodeId: episode.episodeId };
}
function employmentPromotionOffer(s, id) {
  const episode = currentPlayerEmployment(s), offer = s.employmentState?.offers?.[id];
  return offer?.status === "offered" && offer.episodeId === episode?.episodeId ? offer : null;
}
function applyEmploymentSiteIncident(s, action) {
  const episode = currentPlayerEmployment(s), site = s.world?.occupationWorld?.sites?.[episode?.siteId];
  if (!episode || !site) throw Error("出来事の対象となる現役職場がない");
  const sourceEventId = TRACE_RESOLUTION?.id || action.sourceEventId;
  if (action.kind === "promotion-offer") {
    const state = playerEmploymentState(s); state.offers ||= {};
    if (["accepted", "declined"].includes(action.incident)) {
      const offer = employmentPromotionOffer(s, action.offerId || "bsw-specialist");
      if (!offer) throw Error("現在の勤務に結び付く内定がない");
      if (action.incident === "accepted") {
        const assessed = assessEmploymentAppointment(s, { jobId: offer.jobId,
          affiliationId: episode.affiliationId || "bsw-contract", sourceEventId });
        if (!assessed.canStart) throw Error("昇進先の実職位がない");
        commitEmploymentOpening(s, assessed, { transition: true, reason: "promotion",
          sourceEventId, affiliationId: episode.affiliationId });
      }
      offer.status = action.incident; offer.resolvedYear = s.year;
    } else state.offers[action.incident] = { episodeId: episode.episodeId,
      jobId: action.jobId, sourceEventId, year: s.year, status: "offered" };
    return;
  }
  site.incidents ||= [];
  site.incidents.push({ episodeId: episode.episodeId, sourceEventId, year: s.year,
    month: s.mo, kind: action.kind, incident: action.incident });
  if (action.kind === "research-access") episode.researchRecordsAccess = true;
  if (action.kind === "research-grant") {
    episode.grants ||= [];
    episode.grants.push({ sourceEventId, year: s.year, amount: action.amount, kind: action.incident });
  }
  if (Number.isFinite(action.payFactor)) episode.annualBase = (episode.annualBase ?? J[episode.jobId].pay) * action.payFactor;
  if (action.safetyImproved) site.safetyImprovedAt = { year: s.year, month: s.mo };
  if (action.status === "closed") {
    site.status = "closed"; site.operationTo = { year: s.year, month: Math.max(1, s.mo) };
    for (const id of site.positionIds || []) for (const openingId of s.world.occupationWorld.positions[id]?.openingIds || [])
      s.world.occupationWorld.openings[openingId].status = "closed";
  }
  if (action.incident === "dismissed-with-unpaid-wages") {
    episode.paymentStatus = "withheld";
    settleEmploymentThrough(s, s.year, s.mo);
  }
  if (action.terminate || action.status === "closed") endPlayerEmployment(s, action.kind);
}
function changeEmploymentAvailability(s, action) {
  const episode = currentPlayerEmployment(s);
  if (!episode) throw Error("休職・復帰する勤務期間がない");
  settleEmploymentThrough(s, s.year, Math.max(0, (s.mo || 1) - 1));
  episode.onLeave = action.action === "suspend";
  episode.workFraction = episode.onLeave ? 0 : 1;
  episode.history.push({ year: s.year, month: s.mo, status: episode.onLeave ? "suspended" : "active", reason: action.reason || action.action });
}
