const ARTS_TECH_SKILL_THRESHOLDS = Object.freeze({
  "unit-maintenance": 12,
  "unit-inspection": 10,
  "unit-manufacture": 20,
  "medical-support": 35
});
const ARTS_DISCIPLINES = new Set(["thermal", "kinetic", "acoustic", "material", "medical-support", "ritual-local"]);

function artsCurrentWorksite(s) {
  const episode = typeof currentPlayerEmployment === "function" ? currentPlayerEmployment(s) : null,
    contract = s?.workContract,
    site = contract?.status === "active" && contract.episodeId === episode?.episodeId
      ? s.world?.occupationWorld?.sites?.[contract.siteId] : null;
  return episode && episode.status === "active" && site?.status === "open" &&
    episode.areaId === (typeof occupationWorkAreaKey === "function" ? occupationWorkAreaKey(s) : null)
    ? { episode, site } : null;
}

function artsTrainingAccess(s, request = {}) {
  const disciplineId = request.disciplineId,
    enrollment = artsCurrentFormalEnrollment(s),
    formal = enrollment && (!request.providerId || request.providerId === enrollment.id ||
      request.providerId === s.educationPath?.institutionId) && artsHasAttendedCurrentCourse(s, enrollment),
    path = request.learningPathId ? artsInformalLearningPath(s, request.learningPathId,
      request.year ?? s.year, request.month ?? s.mo) : null,
    subject = path?.subjectIds?.some(id => id === disciplineId || id.startsWith("arts-")),
    technique = request.techniqueId && s?.artsProfile?.knownTechniques?.find(row => row.id === request.techniqueId),
    learned = technique && technique.disciplineId === disciplineId &&
      s.artsProfile.practiceHistory.some(row => row.techniqueId === technique.id &&
        row.outcome === "guided-success" && row.enrollmentId === technique.courseRef);
  if (!ARTS_DISCIPLINES.has(disciplineId))
    return { allowed: false, reason: "discipline-unverified", providerRef: null };
  if (formal) return { allowed: true, reason: null, providerRef: enrollment.id, learningKind: "formal-course" };
  if (path && subject && ["arts-foundation", "arts-unit-maintenance", "arts-workshop", "arts-tradition", "arts-medical-support"].includes(path.modeId))
    return { allowed: true, reason: null, providerRef: path.pathId, learningKind: "observed-nonformal-learning" };
  if (learned && (!request.learningPathId || request.learningPathId === technique.courseRef))
    return { allowed: true, reason: null, providerRef: technique.courseRef, learningKind: "prior-guided-learning" };
  return { allowed: false, reason: "no-attended-arts-provider", providerRef: null };
}

function artsSafetyContext(s, siteRef) {
  const safeguards = [], currentArea = s?.community?.key,
    worksite = artsCurrentWorksite(s), course = artsCurrentFormalEnrollment(s),
    learningPaths = s?.learningPaths || [],
    pathSiteRefs = learningPaths.filter(path => path.status === "active" && path.participation?.some(row =>
      row.periodKey === `${s.year}-${String(s.mo).padStart(2, "0")}` && row.teacherPresent === true))
      .map(path => path.siteRef?.id || path.siteRef?.areaId).filter(Boolean);
  if (!siteRef || ![currentArea, worksite?.site?.siteId, worksite?.site?.areaId,
    course?.id, s.educationPath?.institutionId, ...pathSiteRefs].includes(siteRef))
    return { allowed: false, reason: "site-not-present", safeguards };
  if (Number.isFinite(s.h) && s.h < 25) safeguards.push("health-review");
  if (s.inf && Number(s.ob) >= 70) safeguards.push("infection-load-review");
  if (Number(s.local?.hazard) >= 0.8) safeguards.push("hazardous-area");
  return { allowed: safeguards.length === 0, reason: safeguards.length ? "safety-review-required" : null, safeguards };
}

function artsAssessUse(s, request = {}) {
  const reasons = [], operatorId = request.operatorId || "protagonist",
    purpose = request.purpose, siteRef = request.siteRef, disciplineId = request.disciplineId,
    techniqueId = request.techniqueId,
    technique = s?.artsProfile?.knownTechniques?.find(row => row.id === techniqueId),
    equipment = request.equipmentId ? artsEquipmentAvailable(s, request.equipmentId, purpose, siteRef) : null,
    safety = artsSafetyContext(s, siteRef), work = artsCurrentWorksite(s),
    training = techniqueId ? artsTrainingAccess(s, { disciplineId, techniqueId, learningPathId: request.learningPathId,
      providerId: request.providerId, year: request.year, month: request.month }) : null,
    skillId = request.techSkillId;
  if (!s || s.dead || operatorId !== "protagonist") reasons.push("operator-unavailable");
  if (typeof techniqueId !== "string" || !techniqueId.trim()) reasons.push("technique-not-specified");
  if (!new Set(["supervised-practice", "personal-practice", "inspection", "repair", "workplace-use", "medical-support", "high-load-internal"])
    .has(purpose)) reasons.push("purpose-not-authorized");
  if (techniqueId && (!technique || technique.disciplineId !== disciplineId)) reasons.push("technique-not-learned");
  if (techniqueId && !training?.allowed) reasons.push(training?.reason || "no-attended-arts-provider");
  if (skillId && (!Object.hasOwn(ARTS_TECH_SKILL_THRESHOLDS, skillId) ||
      (s?.artsProfile?.techSkills?.[skillId] || 0) < (request.minimumSkill || ARTS_TECH_SKILL_THRESHOLDS[skillId])))
    reasons.push("technical-skill-insufficient");
  if (purpose === "high-load-internal" && !s?.inf) reasons.push("no-recorded-internal-originium-exposure");
  if (request.requiresClinicalAuthority &&
      (!s?.artsProfile?.licenseRefs?.includes(request.licenseRef) ||
       !work || !["clinical", "medical-assistant"].includes(request.jobRole)))
    reasons.push("clinical-authority-unverified");
  if (request.workplaceUse && (!work || work.site.siteId !== siteRef)) reasons.push("active-worksite-mismatch");
  if (["inspection", "repair", "workplace-use"].includes(purpose) && !work)
    reasons.push("active-worksite-missing");
  if (request.requireEquipment && !equipment) reasons.push("equipment-not-recorded");
  if (equipment && !equipment.allowed) reasons.push(equipment.reason);
  const acknowledgedLoad = purpose === "high-load-internal" && safety.safeguards.length > 0 &&
    safety.safeguards.every(item => ["health-review", "infection-load-review"].includes(item));
  if (!safety.allowed && !acknowledgedLoad) reasons.push(safety.reason);
  return {
    eligible: reasons.length === 0,
    reasonCodes: [...new Set(reasons)],
    capabilities: technique ? [techniqueId] : skillId && (s?.artsProfile?.techSkills?.[skillId] || 0) > 0 ? [skillId] : [],
    safeguards: safety.safeguards,
    equipmentId: equipment?.item?.id || null,
    providerRef: training?.providerRef || null,
    siteRef: siteRef || null,
    uncertainty: "game-model-action-specific"
  };
}

function artsJobRequirement(s, requirement = {}) {
  const work = artsCurrentWorksite(s), occupation = s?.world?.occupationWorld,
    opening = requirement.openingId && occupation?.openings?.[requirement.openingId],
    position = opening && occupation?.positions?.[opening.positionId],
    knowledge = requirement.openingId && s?.employmentState?.knowledge?.find(row =>
      row.openingId === requirement.openingId && row.certainty === "confirmed" &&
      row.observedStatus === "open"),
    currentOpening = !!work && !!opening && !!position && !!knowledge &&
      opening.kind === "general-public" && opening.status === "open" && opening.slots > 0 &&
      opening.siteId === work.site.siteId && opening.employerId === work.site.employerId &&
      opening.areaId === work.site.areaId && position.siteId === work.site.siteId &&
      position.jobId === work.episode.jobId && (opening.validFromYear == null || s.year >= opening.validFromYear) &&
      (opening.validToYear == null || s.year <= opening.validToYear) &&
      knowledge.areaId === work.site.areaId && knowledge.isCurrentArea === true &&
      (knowledge.validToYear == null || s.year <= knowledge.validToYear),
    skill = requirement.techSkillId ? Number(s?.artsProfile?.techSkills?.[requirement.techSkillId] || 0) : 0,
    technique = requirement.techniqueId && s?.artsProfile?.knownTechniques?.some(row => row.id === requirement.techniqueId);
  const eligible = !!work && currentOpening &&
    (requirement.techSkillId ? skill >= (requirement.minimum || ARTS_TECH_SKILL_THRESHOLDS[requirement.techSkillId] || 10) :
      requirement.techniqueId ? !!technique : false);
  return { eligible, siteRef: work?.site?.siteId || null,
    reason: eligible ? null : !work ? "active-worksite-missing" : !currentOpening ? "opening-not-current-for-worksite" : "skill-evidence-insufficient" };
}

function artsUseHistoryCompact(profile) {
  while (profile.useHistory.length > 24) {
    const oldest = profile.useHistory.shift(), key = `${oldest.year}:${oldest.disciplineId}:${oldest.techniqueId}`,
      row = profile.useArchive.find(item => item.key === key);
    if (row) { row.count++; row.lastYear = Math.max(row.lastYear, oldest.year); }
    else {
      profile.useArchive.push({ key, year: oldest.year, lastYear: oldest.year,
        techniqueId: oldest.techniqueId, disciplineId: oldest.disciplineId, count: 1 });
      if (profile.useArchive.length > 64) profile.useArchive.shift();
    }
  }
}

function applyArtsAdvancedAction(s, action, sourceEventId, resolution) {
  if (!s?.artsProfile || !action || !sourceEventId) return false;
  if (action.action === "record-use") {
    const currentWorksite = artsCurrentWorksite(s),
      siteRef = action.siteRef === "$current-area" ? s.community?.key :
        action.siteRef === "$current-worksite" ? currentWorksite?.site?.siteId : action.siteRef,
      request = { ...action.request, purpose: action.purpose || action.request?.purpose,
        workplaceUse: action.workplaceUse === true || action.request?.workplaceUse === true,
        requireEquipment: action.requireEquipment === true || action.request?.requireEquipment === true,
        techniqueId: action.techniqueId, disciplineId: action.disciplineId, siteRef },
      assessment = artsAssessUse(s, request), result = action.result;
    if (!assessment.eligible || !["performed", "attempted", "stopped"].includes(result) ||
        !ARTS_DISCIPLINES.has(action.disciplineId) || typeof action.techniqueId !== "string" || !action.techniqueId ||
        typeof siteRef !== "string" || !siteRef) return false;
    const profile = s.artsProfile,
      id = [sourceEventId, action.techniqueId, siteRef, s.year, s.mo,
        resolution?.choiceIndex ?? 0, resolution?.outcomeIndex ?? 0].join(":"),
      equipmentId = assessment.equipmentId;
    if (profile.useHistory.some(row => row.id === id)) return false;
    const record = { id, techniqueId: action.techniqueId, disciplineId: action.disciplineId,
      purpose: request.purpose, sourceEventId, siteRef, equipmentId, result,
      providerRef: assessment.providerRef, year: s.year, month: s.mo };
    profile.useHistory.push(record);
    if (result === "performed") {
      const skill = profile.disciplines[action.disciplineId] ||= { knowledge: 0, control: 0, practice: 0 };
      skill.practice = Math.min(100, skill.practice + 1);
      skill.control = Math.min(100, skill.control + 1);
      if (equipmentId) {
        const item = s.artsEquipment.items.find(row => row.id === equipmentId);
        if (item) {
          item.useCount = (item.useCount || 0) + 1;
          item.wear = Math.min(100, (item.wear || 0) + 1);
          if (item.wear >= 12 && item.condition === "serviceable") item.condition = "inspection-due";
        }
      }
      if (request.purpose === "high-load-internal") {
        const exposureId = id + ":exposure";
        profile.exposureHistory.push({ id: exposureId, sourceEventId, year: s.year,
          month: s.mo, kind: "high-load-internal-arts", symptomsAtUse: s.h < 50 || s.ob >= 70 });
        profile.exposureHistory = profile.exposureHistory.slice(-24);
      }
    }
    artsUseHistoryCompact(profile);
    return true;
  }
  if (action.action === "assess-course") {
    const enrollment = artsCurrentFormalEnrollment(s), model = s.educationPath,
      credits = enrollment ? educationTransferredCreditIds(s, enrollment.id) : [],
      passed = action.result === "passed",
      practical = enrollment && s.artsProfile.practiceHistory.some(row =>
        row.enrollmentId === enrollment.id && row.outcome === "guided-success");
    if (!enrollment || action.enrollmentId !== enrollment.id || action.year !== s.year ||
        !Number.isInteger(action.year) || model.yearsCompleted < model.duration ||
        credits.length < model.duration || !practical || !["passed", "reassess"].includes(action.result) ||
        s.artsProfile.assessmentHistory.some(row => row.enrollmentId === enrollment.id && row.year === s.year)) return false;
    const assessment = { year: s.year, month: s.mo,
      basis: "observed-practical-assessment", enrollmentId: enrollment.id, sourceEventId, passed,
      result: passed ? "passed" : "reassess" };
    s.artsProfile.assessmentHistory.push(assessment);
    s.artsProfile.assessmentHistory = s.artsProfile.assessmentHistory.slice(-12);
    if (!passed) return true;
    const previous = model.completionAssessment;
    model.completionAssessment = { evidenceRef: enrollment.id + ":" + sourceEventId,
      enrollmentId: enrollment.id, assessedAt: { year: s.year, month: s.mo }, passed: true,
      basis: "observed-practical-assessment", sourceCreditIds: credits };
    if (!educationEnd(s, "completed", "履修・出席と実技評価を満たした", sourceEventId)) {
      if (previous) model.completionAssessment = previous;
      else delete model.completionAssessment;
      s.artsProfile.assessmentHistory.pop();
      return false;
    }
    s.artsProfile.assessmentStatus = "assessed";
    s.artsProfile.assessment = { year: s.year, basis: "course-practical-assessment",
      sourceRef: enrollment.id + ":" + sourceEventId };
    return true;
  }
  if (action.action === "record-tech-skill") {
    let path = action.learningPathId && typeof educationLearningPath === "function"
      ? educationLearningPath(s, "protagonist", action.learningPathId) : null;
    const work = artsCurrentWorksite(s), skillId = action.skillId, siteRef = work?.site?.siteId,
      provider = path && educationInformalProvider(s, path.providerId),
      providerMatch = path?.status === "active" && path.providerRef?.kind !== "self" && work &&
        [work.site.employerId, work.site.siteId].includes(path.providerId) &&
        path.siteRef?.areaId === s.local?.educationAreaId &&
        provider?.status === "active" && provider.subjectIds?.some(subject => path.subjectIds?.includes(subject) &&
          ["arts-unit-maintenance", "arts-workshop", "technical", "craft", "safety"].includes(subject)) &&
        educationNonformalProviderActive(s, path, s.year, s.mo),
      id = [sourceEventId, action.learningPathId, skillId, s.year, s.mo].join(":"),
      history = s.artsProfile.techSkillHistory;
    if (!providerMatch || !["unit-maintenance", "unit-inspection", "unit-manufacture"].includes(skillId) ||
        action.result !== "guided-success" || history.some(row => row.id === id)) return false;
    const periodKey = `${s.year}-${String(s.mo).padStart(2, "0")}`;
    if (!path.participation?.some(row => row.periodKey === periodKey && row.teacherPresent === true && row.attendedSessions > 0)) {
      try {
        educationRecordLearningParticipation(s, { personId: "protagonist", pathId: path.pathId,
          year: s.year, month: s.mo, attendedSessions: 1, totalSessions: 1, evidenceRef: sourceEventId });
      } catch { return false; }
      path = educationLearningPath(s, "protagonist", action.learningPathId);
      if (!path?.participation?.some(row => row.periodKey === periodKey && row.teacherPresent === true && row.attendedSessions > 0)) return false;
    }
    const delta = 1;
    s.artsProfile.techSkills[skillId] = Math.min(100, (s.artsProfile.techSkills[skillId] || 0) + delta);
    history.push({ id, skillId, learningPathId: path.pathId, siteRef, sourceEventId,
      year: s.year, month: s.mo, delta });
    if (history.length > 64) history.shift();
    return true;
  }
  return false;
}
