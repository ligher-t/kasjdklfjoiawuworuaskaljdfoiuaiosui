function initializeLifeSystems(s) {
  ensureCatastropheWarningState(s);
  ensureInfrastructureIncidentState(s);
  ensureShipmentState(s);
  ensureContingencyContractState(s);
  ensureResearchConsentState(s);
  ensureCommunityProjectState(s);
  ensureCulturalPracticeState(s);
  return s;
}

function isValidLifeSystemsState(s) {
  return isValidCatastropheWarningState(s?.catastropheWarnings, s?.year) &&
    isValidInfrastructureIncidentState(s?.infrastructureIncidents, s?.year) &&
    isValidShipmentState(s?.world?.shipments, s?.year) &&
    isValidContingencyContractState(s?.contingencyContracts, s?.year) &&
    isValidResearchConsentState(s?.researchConsents, s?.year) &&
    isValidCommunityProjectState(s?.communityProjects, s?.year) &&
    isValidCulturalPracticeState(s?.culturalPractice, s?.year);
}

function advanceLifeSystems(s) {
  if (!s || s.dead) return;
  initializeLifeSystems(s);
  advanceCatastropheWarnings(s);
  advanceInfrastructureIncidents(s);
  advanceShipments(s);
  advanceArtsEquipment(s);
  advanceContingencyContracts(s);
  advanceResearchConsents(s);
  advanceArtsCulture(s);
}

function applyLifeSystemAction(s, action, sourceEventId) {
  if (!action || typeof action !== "object" || Array.isArray(action) || !sourceEventId) return false;
  if (action.domain === "warning") return applyCatastropheWarningAction(s, action);
  if (action.domain === "infrastructure") return applyInfrastructureIncidentAction(s, action);
  if (action.domain === "shipment") return applyShipmentAction(s, action, sourceEventId);
  if (action.domain === "contract") return applyContingencyContractAction(s, action, sourceEventId);
  if (action.domain === "research") return applyResearchConsentAction(s, action, sourceEventId);
  if (action.domain === "community-project") return applyCommunityProjectAction(s, action, sourceEventId);
  if (action.domain === "culture") {
    const mentee = action.menteeId === "$oldest-eligible-child"
      ? lifeSystemArtsMentoringCandidates(s)[0] : null;
    return applyCulturalPracticeAction(s, mentee ? { ...action, menteeId: mentee.id } : action, sourceEventId);
  }
  if (action.domain === "information") return applyLifeInformationAction(s, action, sourceEventId);
  if (action.domain === "arts") return applyLifeArtsAction(s, action, sourceEventId);
  return false;
}

function applyLifeInformationAction(s, action, sourceEventId) {
  if (action.action === "receive-situated")
    return !!recordInformationClaimAction(s, { claimId: action.claimId, action: "receive" }, sourceEventId);
  if (action.action === "record-local-correction") {
    const claim = s.informationClaims?.find(row => row.id === action.claimId),
      incident = (s.infrastructureIncidents?.items || []).find(row => row.id === action.targetId);
    if (!claim || claim.status !== "unverified" || claim.pursuitStopped ||
        sourceEventId !== "life_info_claim_correction" ||
        !incident || incident.areaKey !== s.community?.key || incident.status !== "repaired" ||
        claim.evidence?.some(row => row.type === "same-area-repair-observation")) return false;
    claim.evidence ||= [];
    claim.evidence.push({ year: s.year, month: s.mo, type: "same-area-repair-observation",
      scope: "確認した一地区・一設備の修理記録", source: "同じ地区の設備担当者による完了表示",
      result: "この設備の修理完了を確認。放送の他の内容や地区全体の安全は判定しない",
      incidentId: incident.id });
    claim.evidence = claim.evidence.slice(-12);
    claim.history ||= [];
    claim.history.push({ year: s.year, action: "narrow-local-correction", eventId: sourceEventId,
      incidentId: incident.id });
    return true;
  }
  if (action.action === "defer-local-correction") {
    const claim = s.informationClaims?.find(row => row.id === action.claimId);
    if (!claim || claim.status !== "unverified" || claim.pursuitStopped ||
        sourceEventId !== "life_info_claim_correction" || !claim.history?.length) return false;
    claim.localReviewDeferredAt = { year: s.year, month: s.mo };
    claim.history.push({ year: s.year, action: "defer-local-correction", eventId: sourceEventId });
    return true;
  }
  return false;
}

function applyLifeArtsAction(s, action, sourceEventId) {
  const resolution = typeof TRACE_RESOLUTION === "undefined" ? null : TRACE_RESOLUTION;
  const technique = action.techniqueId === "$first-known-technique"
      ? s.artsProfile?.knownTechniques?.[0] : null,
    work = typeof artsCurrentWorksite === "function" ? artsCurrentWorksite(s) : null,
    provider = action.providerId === "$current-arts-provider"
      ? lifeSystemArtsProviders(s, action.mode).find(row => [work?.site?.employerId, work?.site?.siteId].includes(row.organizationId || row.providerId))
      : null,
    path = action.learningPathId === "$current-arts-path"
      ? lifeSystemCurrentArtsPath(s, ["arts-unit-maintenance", "arts-workshop"])
      : null,
    enrollment = action.enrollmentId === "$current-arts-enrollment" ? artsCurrentFormalEnrollment(s) : null,
    mentee = action.menteeId === "$oldest-eligible-child"
      ? lifeSystemArtsMentoringCandidates(s)[0] : null,
    normalized = { ...action,
      ...(technique ? { techniqueId: technique.id, disciplineId: technique.disciplineId } : {}),
      ...(provider ? { providerId: provider.providerId } : {}),
      ...(path ? { learningPathId: path.pathId } : {}),
      ...(enrollment ? { enrollmentId: enrollment.id, year: s.year } : {}),
      ...(mentee ? { menteeId: mentee.id } : {}) };
  if (action.action === "record-practice") return artsRecordPractice(s, normalized, sourceEventId);
  if (["record-use", "assess-course", "record-tech-skill"].includes(action.action))
    return applyArtsAdvancedAction(s, normalized, sourceEventId, resolution);
  if (action.action === "followup") {
    const exposure = artsExposureNeedingFollowup(s);
    if (!exposure || !["consult", "defer"].includes(action.mode)) return false;
    exposure.followup = { status: action.mode === "consult" ? "consulted" : "deferred",
      year: s.year, month: s.mo, sourceEventId };
    return true;
  }
  if (action.action === "request-assessment") {
    const rows = s.artsProfile.adjustmentRequests ||= [];
    if (rows.some(row => row.sourceEventId === sourceEventId && row.year === s.year)) return false;
    rows.push({ sourceEventId, year: s.year, month: s.mo, result: "work-adjustment-requested" });
    if (rows.length > 16) rows.shift();
    return true;
  }
  if (["pay-late-fee", "defer-late-fee"].includes(action.action))
    return artsEquipmentLateFeeAction(s, action, sourceEventId, resolution);
  if (["borrow-equipment", "return-equipment", "inspect-equipment", "request-equipment-repair",
    "record-repair-parts", "complete-equipment-repair"].includes(action.action))
    return artsApplyEquipmentAction(s, action, sourceEventId, resolution);
  if (action.action === "open-path") {
    const mode = EDUCATION_NONFORMAL_MODES?.[action.mode], selectedProvider = educationInformalProvider(s, normalized.providerId || action.providerId),
      areaId = s.local?.educationAreaId;
    if (!mode || !selectedProvider || selectedProvider.status !== "active" || selectedProvider.areaId !== areaId ||
        !mode.subjects.some(subject => subject.startsWith("arts")) ||
        !selectedProvider.subjectIds.some(subject => mode.subjects.includes(subject))) return false;
    educationOpenLearningPath(s, { personId: "protagonist", modeId: action.mode,
      providerId: selectedProvider.providerId, siteRef: { region: s.res.n, areaId },
      subjectIds: mode.subjects.filter(subject => selectedProvider.subjectIds.includes(subject)),
      sourceEventId, languageId: action.languageId || null,
      languageMode: action.languageMode || null });
    return true;
  }
  return false;
}

function lifeSystemArtsProviders(s, modeId = null) {
  const areaId = s?.local?.educationAreaId,
    mode = modeId && EDUCATION_NONFORMAL_MODES?.[modeId];
  return Object.values(s?.world?.educationWorld?.informalProviders || {}).filter(provider =>
    provider?.status === "active" && provider.areaId === areaId &&
    provider.subjectIds?.some(subject => mode ? mode.subjects.includes(subject) : String(subject).startsWith("arts")) &&
    educationNonformalProviderActive(s, { providerId: provider.providerId, siteRef: { region: s.res.n, areaId } }, s.year, s.mo));
}

function lifeSystemCurrentArtsPath(s, modeIds = []) {
  const work = typeof artsCurrentWorksite === "function" ? artsCurrentWorksite(s) : null;
  if (!work) return null;
  return (s?.learningPaths || []).find(path => path.status === "active" && modeIds.includes(path.modeId) &&
    path.siteRef?.areaId === s.local?.educationAreaId &&
    [work.site.employerId, work.site.siteId].includes(path.providerId) &&
    lifeSystemArtsProviders(s, path.modeId).some(provider => provider.providerId === path.providerId)) || null;
}

function artsExposureNeedingFollowup(s) {
  const now = s?.year * 12 + s?.mo;
  return [...(s?.artsProfile?.exposureHistory || [])].reverse().find(row => {
    const occurred = row.year * 12 + row.month, followup = row.followup;
    return occurred < now && occurred >= now - 3 && (!followup ||
      followup.status === "deferred" && now - (followup.year * 12 + followup.month) >= 1);
  }) || null;
}

function lifeSystemScheduledDate(s, id) {
  const contract = activeContingencyContract(s), offer = activeResearchOffer(s),
    incident = activeInfrastructureIncident(s), project = activeCommunityProject(s),
    date = (year, month) => Number.isInteger(year) && Number.isInteger(month)
      ? { year, month } : null;
  let dueAt = null;
  if (id === "life_research_procedure") dueAt = offer?.status === "briefing-attended"
    ? date(s?.year, s?.mo) : offer?.procedureDueAt;
  else if (id === "life_research_followup") dueAt = offer?.followupDueAt;
  else if (id === "life_cc_payment") dueAt = contract?.paymentDueAt;
  else if (id === "life_cc_payment_dispute" && contract?.status === "payment-disputed")
    dueAt = contract.paymentReviewAt || contract.paymentDisputedAt || contract.history?.findLast(row => row.status === "payment-disputed");
  else if (["life_cc_handoff", "life_cc_organization_receipt", "life_cc_family_notice"].includes(id))
    dueAt = date(s?.year, s?.mo);
  else if (id === "life_cc_forecast_survey" && contract?.kind === "forecast-survey" &&
      contract.status === "at-site" && travelCurrentJourney(s)?.id === contract.travelJourneyId &&
      travelCurrentJourney(s)?.status === "arrived") dueAt = date(s?.year, s?.mo);
  else if (id === "life_cc_return") dueAt = contract?.returnDecisionDueAt || date(s?.year, s?.mo);
  else if (id === "life_infra_repair_verification") {
    const parts = incident?.repairShipmentId && findShipment(s, incident.repairShipmentId);
    dueAt = parts?.arrivedAt || date(s?.year, s?.mo);
  } else if (id === "life_culture_rural_repair") {
    const parts = project?.shipmentId && findShipment(s, project.shipmentId);
    dueAt = parts?.arrivedAt || date(s?.year, s?.mo);
  } else if (id === "life_ship_return") {
    const shipment = activeShipment(s, null, ["arrived-at-depot", "delivered-to-recipient", "undeliverable"]);
    dueAt = shipment?.arrivedAt || shipment?.returnRequestedAt || shipment?.completedAt;
  } else if (id === "life_ship_medicine_received") {
    const shipment = activeShipment(s, "medicine", ["arrived-at-depot"]);
    dueAt = shipment?.arrivedAt;
  }
  else if (id === "life_arts_after_overexertion") {
    const exposure = artsExposureNeedingFollowup(s);
    if (exposure) {
      const due = exposure.year * 12 + exposure.month + 1;
      dueAt = date(Math.floor((due - 1) / 12), ((due - 1) % 12) + 1);
    }
  }
  return Number.isInteger(dueAt?.year) && Number.isInteger(dueAt?.month) ? dueAt : null;
}

function lifeSystemScheduledDueYear(s, id) {
  const dueAt = lifeSystemScheduledDate(s, id);
  return dueAt && (dueAt.year < s.year || dueAt.year === s.year && dueAt.month <= s.mo) ? dueAt.year : null;
}

function lifeSystemEventEligible(s, id) {
  const warning = latestCatastropheWarning(s), incident = activeInfrastructureIncident(s),
    shipment = activeShipment(s), work = typeof artsCurrentWorksite === "function" ? artsCurrentWorksite(s) : null,
    contract = activeContingencyContract(s), offer = activeResearchOffer(s), festival = currentCommunityFestival(s),
    project = activeCommunityProject(s), claim = s?.informationClaims?.find(row => row.id === "local-infrastructure-bulletin");
  switch (id) {
    case "life_infra_warning_notice": return !!activeCatastropheWarning(s, ["issued"]);
    case "life_infra_warning_response": return warning?.status === "received";
    case "life_infra_warning_result": return warning?.status === "resolved" && !!warning.receivedAt && !warning.reviewedAt;
    case "life_infra_messenger_feedback": return !!work && /予報|気象|天災連絡/.test(String(work.episode.role || work.site.label || "")) && warning?.status === "resolved" && !!warning.respondedAt && !warning.feedbackAt;
    case "life_infra_power_loss": return incident?.kind === "power" && incident.status === "active" && lifeSystemIncidentReviewDue(s, incident);
    case "life_infra_water_loss": return incident?.kind === "water" && incident.status === "active" && lifeSystemIncidentReviewDue(s, incident);
    case "life_infra_route_block": return incident?.kind === "route" && incident.status === "active" && lifeSystemIncidentReviewDue(s, incident);
    case "life_infra_repair_request": return !!incident && incident.status === "active";
    case "life_infra_repair_verification": {
      const parts = incident?.repairShipmentId && findShipment(s, incident.repairShipmentId);
      return !!incident && incident.status === "repair-requested" && parts?.status === "delivered-to-recipient" && !!work;
    }
    case "life_infra_relocation_utility": return !!incident && incident.kind === "route" && s.home === "移動都市" && incident.areaKey === s.community?.key;
    case "life_ship_custody": return !!activeShipment(s, null, ["arrived-at-depot"]);
    case "life_ship_recipient_check": return !!activeShipment(s, null, ["held-for-delivery"]);
    case "life_ship_return": return !!activeShipment(s, null, ["arrived-at-depot", "held-for-delivery", "delivered-to-recipient", "undeliverable"]);
    case "life_ship_medicine_delay": return !!activeShipment(s, "medicine", ["delayed"]);
    case "life_ship_medicine_received": return !!activeShipment(s, "medicine", ["arrived-at-depot"]);
    case "life_info_media_claim": return !claim && (s.infrastructureIncidents?.items || []).some(row =>
      row.areaKey === s.community?.key && ["repair-requested", "repair-ready", "repaired"].includes(row.status));
    case "life_info_claim_correction": return !!claim && claim.status === "unverified" && !claim.pursuitStopped &&
      !claim.evidence?.some(row => row.type === "same-area-repair-observation") &&
      (!claim.localReviewDeferredAt || s.year * 12 + s.mo >= claim.localReviewDeferredAt.year * 12 + claim.localReviewDeferredAt.month + 12) &&
      (s.infrastructureIncidents?.items || []).some(row => row.areaKey === s.community?.key && row.status === "repaired");
    case "life_info_letter_delay": return !!activeShipment(s, "letter", ["delayed"]);
    case "life_info_letter_resolution": return !!activeShipment(s, "letter", ["delayed", "undeliverable"]);
    case "life_cc_first_contact": return !!incident && !!work && !s.fl?.detained && !s.fl?.isolated && s.age >= 18 &&
      !s.contingencyContracts?.contacts?.some(row => row.areaKey === s.community?.key &&
        row.employerId === work.site.employerId && row.status !== "closed") &&
      !activeContingencyContract(s, ["offered", "accepted", "prepared", "travelling", "at-site", "awaiting-verification", "awaiting-payment", "payment-disputed"]);
    case "life_cc_offer_review": return !!incident && !!work &&
      s.contingencyContracts?.contacts?.some(row => row.areaKey === s.community?.key &&
        row.employerId === work.site.employerId && row.status === "contacted") &&
      !activeContingencyContract(s, ["offered", "accepted", "prepared", "travelling", "at-site", "awaiting-verification", "awaiting-payment", "payment-disputed"]);
    case "life_cc_accept": {
      const offer = activeContingencyContract(s, ["offered"]);
      return offer?.status === "offered" && offer.disclosedCargo !== false && s.age >= 18 && !restricted(s);
    }
    case "life_cc_preparation": return activeContingencyContract(s, ["accepted"])?.status === "accepted";
    case "life_cc_departure": return activeContingencyContract(s, ["prepared"])?.status === "prepared";
    case "life_cc_handoff": return contract?.status === "at-site" && travelCurrentJourney(s)?.status === "arrived";
    case "life_cc_forecast_survey": return contract?.kind === "forecast-survey" && contract.status === "at-site" &&
      travelCurrentJourney(s)?.id === contract.travelJourneyId && travelCurrentJourney(s)?.status === "arrived";
    case "life_cc_suspicious_cargo": return contract?.status === "offered" && contract.kind === "relief-logistics" && contract.disclosedCargo === false;
    case "life_cc_support_equity": return contract?.status === "accepted" && contract.kind === "relief-logistics" &&
      (s.community?.metrics?.food < 0.55 || s.community?.metrics?.medical < 0.55);
    case "life_cc_hiring_bias": return contract?.status === "offered" &&
      (s.socialConflict?.events || []).some(row => row.employerId === contract.employerId &&
        row.areaKey === contract.areaKey && ["hiring-bias", "screening-discrimination"].includes(row.kind));
    case "life_cc_payment": {
      const due = activeContingencyContract(s, ["awaiting-payment", "payment-disputed"]);
      return !!due && due.paymentDueAt && s.year * 12 + s.mo >= due.paymentDueAt.year * 12 + due.paymentDueAt.month &&
        (due.status === "awaiting-payment" || !!due.paymentClaim);
    }
    case "life_cc_payment_dispute": return contract?.status === "payment-disputed" && !contract.paymentClaim &&
      (!contract.paymentReviewAt || s.year * 12 + s.mo >= contract.paymentReviewAt.year * 12 + contract.paymentReviewAt.month);
    case "life_cc_organization_receipt": return contract?.status === "awaiting-verification";
    case "life_cc_family_notice": {
      const person = s.sp && !s.sp.d ? s.sp : [s.par?.fa, s.par?.mo].find(row => row && !row.d);
      return !!activeContingencyContract(s, ["accepted", "prepared", "travelling", "at-site"] ) &&
        !contract.familyNoticeShipmentId && !!person?.id && !!shipmentKnownPersonArea(s, person);
    }
    case "life_cc_return": return !!activeContingencyContract(s, ["travelling", "at-site"]) && !!travelCurrentJourney(s) &&
      (!contract.returnDecisionDueAt || s.year * 12 + s.mo >= contract.returnDecisionDueAt.year * 12 + contract.returnDecisionDueAt.month);
    case "life_research_consent": return offer?.status === "offered";
    case "life_research_procedure": return offer?.status === "briefing-attended" ||
      offer?.status === "consented" && offer.procedureDueAt &&
        s.year * 12 + s.mo >= offer.procedureDueAt.year * 12 + offer.procedureDueAt.month;
    case "life_research_followup": return offer?.status === "procedure-complete" && offer.followupDueAt &&
      s.year * 12 + s.mo >= offer.followupDueAt.year * 12 + offer.followupDueAt.month;
    case "life_arts_family_glimpse": return s.age < 18 && inSharedHousehold(s) && !!(s.par?.fa && !s.par.fa.d || s.par?.mo && !s.par.mo.d) &&
      s.artsProfile?.useHistory?.some(row => row.result === "performed" && row.year === s.year &&
        row.siteRef === s.community?.key);
    case "life_arts_training_inquiry": return s.age >= 12 && s.age <= 25 &&
      !educationActiveCase(s) && !educationOccupied(s) && !s.educationDecision &&
      (s.world?.educationWorld?.offerings && Object.values(s.world.educationWorld.offerings).some(row =>
        row.stage === "arts" && row.admissionTier === 1 &&
        s.world.educationWorld.campuses?.[row.campusId]?.educationAreaId === s.local?.educationAreaId));
    case "life_arts_practical_assessment": {
      const enrollment = artsCurrentFormalEnrollment(s);
      return s.educationPath?.stage === "arts" && s.educationPath.status === "enrolled" && enrollment &&
        s.educationPath.yearsCompleted >= s.educationPath.duration &&
        educationTransferredCreditIds(s, enrollment.id).length >= s.educationPath.duration &&
        s.artsProfile?.practiceHistory?.some(row =>
          row.enrollmentId === enrollment.id && row.outcome === "guided-success") &&
        !s.artsProfile.assessmentHistory.some(row => row.enrollmentId === enrollment.id && row.year === s.year);
    }
    case "life_arts_course_after": return s.educationPath?.stage === "arts" &&
      s.educationPath.status === "completed" && !!s.artsProfile?.assessment?.sourceRef;
    case "life_arts_scholarship_inquiry": {
      const educationCase = educationActiveCase(s);
      return educationCase?.stage === "arts" && educationCase.phase === "contract" &&
        educationCase.status === "active" && !s.educationAccess?.financingOffers?.[educationCase.id];
    }
    case "life_arts_school_decision": {
      const educationCase = educationActiveCase(s), notice = educationCase?.applicationId &&
        s.educationAccess?.notices?.[educationCase.applicationId];
      return educationCase?.stage === "arts" && educationCase.phase === "contract" && notice?.result === "accepted";
    }
    case "life_arts_late_fee": {
      const loan = artsEquipmentForAction(s, { equipmentId: "$oldest-overdue-school-loan" });
      return artsEquipmentLateFeeDue(s, loan);
    }
    case "life_arts_workshop_invitation": return !!work && s.job === 18 &&
      lifeSystemArtsProviders(s).some(provider => [work.site.employerId, work.site.siteId].includes(provider.organizationId || provider.providerId));
    case "life_arts_skill_retest": return s.artsProfile?.assessmentHistory?.some(row => row.result === "reassess") &&
      (s.learningPaths || []).some(path => path.status === "active" && path.modeId === "arts-unit-maintenance" &&
        path.siteRef?.areaId === s.local?.educationAreaId);
    case "life_arts_small_use": {
      const technique = s.artsProfile?.knownTechniques?.[0];
      return !!technique &&
      (artsHasAttendedCurrentCourse(s) || (s.learningPaths || []).some(path => path.status === "active" &&
        path.modeId.startsWith("arts-") && path.siteRef?.areaId === s.local?.educationAreaId)) &&
      artsAssessUse(s, { techniqueId: technique.id,
        disciplineId: technique.disciplineId, purpose: "personal-practice",
        siteRef: s.community?.key, learningPathId: technique.courseRef }).eligible;
    }
    case "life_arts_non_caster_craft": return !!work && s.job === 18 &&
      (s.artsProfile?.techSkills?.["unit-maintenance"] || 0) < 12 &&
      !!lifeSystemCurrentArtsPath(s, ["arts-unit-maintenance", "arts-workshop"]);
    case "life_arts_employer_request": {
      const technique = s.artsProfile?.knownTechniques?.[0], opening = s.employmentState?.knowledge?.find(row => row.certainty === "confirmed");
      return !!work && s.job === 18 && !!technique && !!opening &&
        artsJobRequirement(s, { openingId: opening.openingId, techniqueId: technique.id }).eligible;
    }
    case "life_arts_medical_observation": return !!s.inf && artsHasAttendedCurrentCourse(s) && !!s.community?.facilities &&
      Object.values(s.community.facilities).some(row => row.kind === "clinic" && row.status !== "closed") &&
      !s.artsProfile?.practiceHistory?.some(row => row.sourceEventId === id && row.year === s.year);
    case "life_arts_medical_training": return !!s.inf && !!work && artsCurrentFormalEnrollment(s)?.stage === "arts" &&
      lifeSystemArtsProviders(s, "arts-medical-support").some(provider => [provider.organizationId, provider.providerId].includes(work.site.employerId));
    case "life_arts_overexertion": return !!s.inf && !!s.artsProfile?.knownTechniques?.length &&
      artsAssessUse(s, { techniqueId: s.artsProfile.knownTechniques[0]?.id,
        disciplineId: s.artsProfile.knownTechniques[0]?.disciplineId, purpose: "high-load-internal",
        siteRef: s.community?.key, learningPathId: s.artsProfile.knownTechniques[0]?.courseRef }).eligible;
    case "life_arts_after_overexertion": return !!artsExposureNeedingFollowup(s);
    case "life_arts_work_adjustment": return !!work && (s.h < 55 || s.artsProfile?.exposureHistory?.some(row => row.year >= s.year - 1));
    case "life_arts_mentor_later": return lifeSystemArtsMentoringCandidates(s).length > 0 &&
      (s.artsProfile?.techSkills?.["unit-maintenance"] > 0 ||
        Object.values(s.artsProfile?.disciplines || {}).some(row => row.practice > 0)) &&
      !s.culturalPractice?.mentoring?.some(row => row.sourceEventId === id && row.year === s.year);
    case "life_arts_tradition_lesson": return s.res?.n === "サーミ" && !!s.neighborContact?.id && !!s.culturalIdentity?.homeLanguage &&
      !s.culturalPractice?.traditions?.some(row => row.sourceEventId === id && row.year === s.year);
    case "life_culture_music_arts": return !!s.fl?.hobby_music || (s.artsProfile?.disciplines?.acoustic?.practice || 0) > 0;
    case "life_culture_festival_shortjob": return !!festival;
    case "life_culture_rural_well": return ruralWellEligible(s);
    case "life_culture_rural_repair": {
      const parts = project?.shipmentId && findShipment(s, project.shipmentId);
      return !!project && (project.status === "parts-received" || parts?.status === "delivered-to-recipient");
    }
    case "life_arts_lowaptitude_class": return s.artsProfile?.innateBand === "lower" && artsHasAttendedCurrentCourse(s) &&
      !s.artsProfile.practiceHistory.some(row => row.sourceEventId === id && row.year === s.year);
    default: return false;
  }
}

function lifeSystemIncidentReviewDue(s, incident) {
  const reviewed = incident?.lastReviewedAt || incident?.responseAt || incident?.acknowledgedAt;
  return !reviewed || s.year * 12 + s.mo - (reviewed.year * 12 + reviewed.month) >= 12;
}

function artsEquipmentLateFeeDue(s, item) {
  const fee = item?.lateFee;
  return !!fee && ["due", "deferred"].includes(fee.status) && !!fee.nextReviewAt &&
    s.year * 12 + s.mo >= fee.nextReviewAt.year * 12 + fee.nextReviewAt.month;
}

function artsCanPayLateFee(s) {
  const item = artsEquipmentForAction(s, { equipmentId: "$oldest-overdue-school-loan" }),
    wallet = inSharedHousehold(s) ? s.house : s;
  return artsEquipmentLateFeeDue(s, item) && Number.isFinite(wallet?.cash) && wallet.cash >= item.lateFee.amount;
}

function ruralWellDonationAffordable(s) {
  const wallet = inSharedHousehold(s) ? s.house : s;
  return Number.isFinite(wallet?.cash) && wallet.cash >= 2500;
}
