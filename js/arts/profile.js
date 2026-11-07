// Arts aptitude and evidence are separate from qualifications, equipment and
// employment. The initial band is derived from the existing birth roll so
// adding this profile does not consume another random value.
function createArtsProfile(legacyAptitude) {
  const score = Math.max(0, Math.min(40, Number.isFinite(legacyAptitude) ? legacyAptitude : 0)),
    // The existing 0-40 birth draw has 41 discrete values; these cut points
    // approximate the planned 8/76/14/2 shares without an additional RNG draw.
    innateBand = score <= 2 ? "lower" : score <= 33 ? "intermediate" : score <= 39 ? "upper" : "exceptional";
  return {
    version: 1,
    innateBand,
    assessmentStatus: "unassessed",
    assessment: null,
    assessmentHistory: [],
    exposureHistory: [],
    disciplines: {},
    techSkills: {},
    adjustmentRequests: [],
    knownTechniques: [],
    courseRefs: [],
    licenseRefs: [],
    practiceHistory: [],
    practiceArchive: [],
    useHistory: [],
    useArchive: [],
    techSkillHistory: []
  };
}

function artsInnateBandLabel(s) {
  return ({ lower: "低め", intermediate: "中程度", upper: "高め", exceptional: "まれに高い" })[
    s?.artsProfile?.innateBand
  ] || "未記録";
}

function artsAdmissionPotential(s) {
  return ({ lower: 3, intermediate: 20, upper: 35, exceptional: 40 })[
    s?.artsProfile?.innateBand
  ] ?? 0;
}

function artsPracticeSummary(s) {
  const profile = s?.artsProfile;
  if (!profile) return "未記録";
  const rows = profile.practiceHistory || [], counts = {
    "guided-success": 0, observed: 0, theory: 0, "attempt-not-achieved": 0
  };
  for (const row of rows) if (Object.prototype.hasOwnProperty.call(counts, row.outcome)) counts[row.outcome]++;
  const archived = (profile.practiceArchive || []).reduce((sum, row) => sum + row.count, 0),
    uses = (profile.useHistory || []).filter(row => row.result === "performed").length,
    technical = Object.entries(profile.techSkills || {}).filter(([, value]) => value > 0)
      .map(([id]) => id === "unit-maintenance" ? "器具保守" : id === "unit-inspection" ? "器具点検" : "技術技能"),
    techniques = (profile.knownTechniques || []).map(row =>
      row.id === "kinetic-small-object" ? "小物を動かす初歩（未認定）" : "個別の初歩的な型（未認定）");
  if (!rows.length && !archived && !techniques.length && !uses && !technical.length) return "授業・指導の記録なし";
  const summary = [
    counts["guided-success"] ? "指導下の実技 " + counts["guided-success"] + "件" : null,
    counts.observed ? "観察 " + counts.observed + "件" : null,
    counts.theory ? "理論 " + counts.theory + "件" : null,
    counts["attempt-not-achieved"] ? "未達 " + counts["attempt-not-achieved"] + "件" : null,
    archived ? "過去の集約 " + archived + "件" : null,
    uses ? "実際の行使 " + uses + "件" : null
  ].filter(Boolean);
  return [...new Set([...techniques, ...technical, ...summary])].join("・");
}

function isValidArtsProfileState(profile, currentYear) {
  if (!Number.isInteger(currentYear) || !profile || typeof profile !== "object" || Array.isArray(profile) ||
      profile.version !== 1 ||
      !["lower", "intermediate", "upper", "exceptional"].includes(profile.innateBand) ||
      !["unassessed", "assessed"].includes(profile.assessmentStatus) ||
      (profile.assessmentStatus === "unassessed" && profile.assessment !== null) ||
      (profile.assessmentStatus === "assessed" &&
        (!profile.assessment || !Number.isInteger(profile.assessment.year) ||
         profile.assessment.year > currentYear || typeof profile.assessment.basis !== "string" ||
         !profile.assessment.basis || typeof profile.assessment.sourceRef !== "string" ||
         !profile.assessment.sourceRef)) ||
      !Array.isArray(profile.assessmentHistory) || profile.assessmentHistory.length > 12 ||
      profile.assessmentHistory.some(row => !row || !Number.isInteger(row.year) || row.year > currentYear ||
        !Number.isInteger(row.month) || row.month < 1 || row.month > 12 ||
        typeof row.enrollmentId !== "string" || !row.enrollmentId ||
        typeof row.sourceEventId !== "string" || !row.sourceEventId || typeof row.passed !== "boolean" ||
         row.basis !== "observed-practical-assessment") ||
      !Array.isArray(profile.adjustmentRequests) || profile.adjustmentRequests.length > 16 ||
      profile.adjustmentRequests.some(row => !row || typeof row.sourceEventId !== "string" || !row.sourceEventId ||
        !Number.isInteger(row.year) || row.year > currentYear || !Number.isInteger(row.month) ||
        row.month < 1 || row.month > 12 || row.result !== "work-adjustment-requested") ||
      !Array.isArray(profile.exposureHistory) || profile.exposureHistory.length > 24 ||
      !profile.disciplines || typeof profile.disciplines !== "object" ||
      Array.isArray(profile.disciplines) ||
      !profile.techSkills || typeof profile.techSkills !== "object" ||
      Array.isArray(profile.techSkills) ||
      !Array.isArray(profile.knownTechniques) || profile.knownTechniques.length > 64 ||
      !Array.isArray(profile.courseRefs) || profile.courseRefs.length > 32 ||
      !Array.isArray(profile.licenseRefs) || profile.licenseRefs.length > 32 ||
      !Array.isArray(profile.practiceHistory) || profile.practiceHistory.length > 24 ||
      !Array.isArray(profile.practiceArchive) || profile.practiceArchive.length > 64 ||
      !Array.isArray(profile.useHistory) || profile.useHistory.length > 24 ||
      !Array.isArray(profile.useArchive) || profile.useArchive.length > 64 ||
      !Array.isArray(profile.techSkillHistory) || profile.techSkillHistory.length > 64) return false;
  const boundedSkill = value => Number.isFinite(value) && value >= 0 && value <= 100;
  if (Object.entries(profile.disciplines).some(([key, row]) =>
      !["thermal", "kinetic", "acoustic", "material", "medical-support", "ritual-local"].includes(key) ||
      !row || typeof row !== "object" || Array.isArray(row) ||
      Object.keys(row).some(field => !["knowledge", "control", "practice"].includes(field)) ||
      !["knowledge", "control", "practice"].every(key => boundedSkill(row[key])))) return false;
  if (Object.entries(profile.techSkills).some(([key, value]) => !key || !boundedSkill(value))) return false;
  if ([...profile.courseRefs, ...profile.licenseRefs].some(value =>
      typeof value !== "string" || !value) ||
      new Set(profile.courseRefs).size !== profile.courseRefs.length ||
      new Set(profile.licenseRefs).size !== profile.licenseRefs.length ||
      profile.knownTechniques.some((row, index) =>
        !row || typeof row.id !== "string" || !row.id ||
        profile.knownTechniques.findIndex(other => other?.id === row.id) !== index ||
        typeof row.courseRef !== "string" || !row.courseRef ||
        typeof row.sourceEventId !== "string" || !row.sourceEventId ||
        !["thermal", "kinetic", "acoustic", "material", "medical-support", "ritual-local"].includes(row.disciplineId) ||
        row.scope !== "introductory" || typeof row.certified !== "boolean")) return false;
  const ids = new Set();
  for (const row of profile.practiceHistory) {
    if (!row || typeof row.id !== "string" || !row.id || ids.has(row.id) ||
        !Number.isInteger(row.year) || row.year > currentYear ||
        !Number.isInteger(row.month) || row.month < 1 || row.month > 12 ||
        typeof row.sourceEventId !== "string" || !row.sourceEventId ||
        typeof row.enrollmentId !== "string" || !row.enrollmentId ||
        !["thermal", "kinetic", "acoustic", "material", "medical-support", "ritual-local"].includes(row.disciplineId) ||
        typeof row.techniqueId !== "string" || !row.techniqueId ||
        (row.response != null && !["alternative-task-shown", "stopped-for-day"].includes(row.response)) ||
        !["guided-success", "observed", "theory", "attempt-not-achieved"].includes(row.outcome) ||
        (row.response != null && row.outcome !== "attempt-not-achieved") ||
        (row.response === "alternative-task-shown" && !row.alternativeTaskId) ||
        (row.response === "stopped-for-day" && row.alternativeTaskId != null) ||
        (row.alternativeTaskId != null &&
          (typeof row.alternativeTaskId !== "string" || !row.alternativeTaskId))) return false;
    ids.add(row.id);
  }
  const validPracticeArchive = profile.practiceArchive.every(row =>
    row && typeof row.key === "string" && row.key &&
    Number.isInteger(row.year) && row.year <= currentYear &&
    Number.isInteger(row.lastYear) && row.lastYear >= row.year && row.lastYear <= currentYear &&
    ["thermal", "kinetic", "acoustic", "material", "medical-support", "ritual-local"].includes(row.disciplineId) &&
    typeof row.techniqueId === "string" && row.techniqueId &&
    Number.isInteger(row.count) && row.count > 0 && row.count <= 10000);
  if (!validPracticeArchive) return false;
  const useIds = new Set();
  for (const row of profile.useHistory) {
    if (!row || typeof row.id !== "string" || !row.id || useIds.has(row.id) ||
        typeof row.techniqueId !== "string" || !row.techniqueId ||
        !["performed", "attempted", "stopped"].includes(row.result) ||
        typeof row.sourceEventId !== "string" || !row.sourceEventId ||
        !Number.isInteger(row.year) || row.year > currentYear ||
        !Number.isInteger(row.month) || row.month < 1 || row.month > 12 ||
        typeof row.siteRef !== "string" || !row.siteRef ||
        !["supervised-practice", "personal-practice", "inspection", "repair", "workplace-use", "medical-support", "high-load-internal"].includes(row.purpose) ||
        !["thermal", "kinetic", "acoustic", "material", "medical-support", "ritual-local"].includes(row.disciplineId) ||
        (row.equipmentId != null && typeof row.equipmentId !== "string")) return false;
    useIds.add(row.id);
  }
  return profile.useArchive.every(row =>
    row && typeof row.key === "string" && !!row.key &&
    Number.isInteger(row.year) && row.year <= currentYear &&
    Number.isInteger(row.lastYear) && row.lastYear >= row.year && row.lastYear <= currentYear &&
    typeof row.techniqueId === "string" && !!row.techniqueId &&
    Number.isInteger(row.count) && row.count > 0 && row.count <= 10000) &&
    profile.techSkillHistory.every(row => row && typeof row.id === "string" && !!row.id &&
      typeof row.skillId === "string" && !!row.skillId && typeof row.learningPathId === "string" &&
      !!row.learningPathId && typeof row.siteRef === "string" && !!row.siteRef &&
      typeof row.sourceEventId === "string" && !!row.sourceEventId &&
      Number.isInteger(row.year) && row.year <= currentYear &&
      Number.isInteger(row.month) && row.month >= 1 && row.month <= 12 &&
      Number.isFinite(row.delta) && row.delta > 0 && row.delta <= 1) &&
    profile.exposureHistory.every(row => row && typeof row.id === "string" && !!row.id &&
      typeof row.sourceEventId === "string" && !!row.sourceEventId &&
      Number.isInteger(row.year) && row.year <= currentYear &&
      Number.isInteger(row.month) && row.month >= 1 && row.month <= 12 &&
      row.kind === "high-load-internal-arts" && typeof row.symptomsAtUse === "boolean");
}

function artsCurrentFormalEnrollment(s) {
  if (s?.educationPath?.status !== "enrolled" || s.educationPath.stage !== "arts") return null;
  return typeof educationActiveEnrollment === "function" ? educationActiveEnrollment(s) : null;
}

function artsHasAttendedCurrentCourse(s, enrollment = artsCurrentFormalEnrollment(s)) {
  if (!enrollment || enrollment.stage !== "arts") return false;
  const record = s.educationAttendance?.enrollments?.[enrollment.id]?.[s.year]?.[s.mo];
  return Number.isFinite(record?.recognizedEquivalent) && record.recognizedEquivalent > 0;
}

function artsInformalLearningPath(s, pathId, year = s?.year, month = s?.mo) {
  if (typeof pathId !== "string" || typeof educationLearningPath !== "function") return null;
  const path = educationLearningPath(s, "protagonist", pathId),
    periodKey = String(year) + "-" + String(month).padStart(2, "0");
  return path?.status === "active" && path.participation?.some(row =>
    row.periodKey === periodKey && row.teacherPresent === true && row.attendedSessions > 0) ? path : null;
}

function artsLearningPathForPractice(s, pathId, disciplineId, sourceEventId) {
  if (!pathId || typeof educationLearningPath !== "function") return null;
  let path = educationLearningPath(s, "protagonist", pathId);
  if (!path || path.status !== "active" || !path.providerRef || path.providerRef.kind === "self" ||
      !["arts-foundation", "arts-unit-maintenance", "arts-workshop", "arts-tradition", "arts-medical-support"].includes(path.modeId) ||
      !path.subjectIds?.some(id => id === disciplineId || id.startsWith("arts-")) ||
      path.siteRef?.areaId !== s.local?.educationAreaId ||
      typeof educationNonformalProviderActive !== "function" ||
      !educationNonformalProviderActive(s, path, s.year, s.mo)) return null;
  const periodKey = String(s.year) + "-" + String(s.mo).padStart(2, "0"),
    participated = path.participation?.some(row => row.periodKey === periodKey &&
      row.teacherPresent === true && row.attendedSessions > 0);
  if (!participated) {
    try {
      educationRecordLearningParticipation(s, { personId: "protagonist", pathId,
        year: s.year, month: s.mo, attendedSessions: 1, totalSessions: 1,
        evidenceRef: sourceEventId });
    } catch { return null; }
    path = educationLearningPath(s, "protagonist", pathId);
  }
  return artsInformalLearningPath(s, pathId) ? path : null;
}

function recordArtsFormalAdmissionAssessment(s, sourceRef) {
  if (!s?.artsProfile || s.educationPath?.status !== "enrolled" ||
      s.educationPath.stage !== "arts") return false;
  const enrollment = artsCurrentFormalEnrollment(s), ref = typeof sourceRef === "string" && sourceRef.trim()
    ? sourceRef : "formal-arts-admission:" + s.year;
  if (!enrollment) return false;
  // Admission proves access to a course, not practical competence or a license.
  if (!s.artsProfile.courseRefs.includes(enrollment.id) && s.artsProfile.courseRefs.length < 32)
    s.artsProfile.courseRefs.push(enrollment.id);
  s.artsProfile.admissionRef = ref;
  return true;
}

function artsRecordPractice(s, action, sourceEventId) {
  if (!s || s.dead || !s.artsProfile || !action ||
      action.action !== "record-practice" ||
      !["thermal", "kinetic", "acoustic", "material", "medical-support", "ritual-local"].includes(action.disciplineId) ||
      typeof action.techniqueId !== "string" || !action.techniqueId.trim() ||
      (action.response != null && !["alternative-task-shown", "stopped-for-day"].includes(action.response)) ||
      !["guided-success", "observed", "theory", "attempt-not-achieved"].includes(action.outcome) ||
      (action.response != null && action.outcome !== "attempt-not-achieved") ||
      (action.response === "alternative-task-shown" &&
        (typeof action.alternativeTaskId !== "string" || !action.alternativeTaskId.trim())) ||
      (action.response === "stopped-for-day" && action.alternativeTaskId != null) ||
      (action.alternativeTaskId != null &&
        (typeof action.alternativeTaskId !== "string" || !action.alternativeTaskId.trim())) ||
      typeof sourceEventId !== "string" || !sourceEventId) return false;
  const enrollment = artsCurrentFormalEnrollment(s),
    formalAttendance = artsHasAttendedCurrentCourse(s, enrollment),
    learningPath = !formalAttendance && action.learningPathId
      ? artsLearningPathForPractice(s, action.learningPathId, action.disciplineId, sourceEventId)
      : null,
    learningRef = formalAttendance ? enrollment.id : learningPath?.pathId;
  if (!learningRef) return false;
  const resolution = typeof TRACE_RESOLUTION === "undefined" ? null : TRACE_RESOLUTION,
    choicePart = Number.isInteger(resolution?.choiceIndex) ? resolution.choiceIndex : 0,
    outcomePart = Number.isInteger(resolution?.outcomeIndex) ? resolution.outcomeIndex : 0,
    id = [sourceEventId, learningRef, s.year, s.mo, choicePart, outcomePart].join(":"),
    profile = s.artsProfile;
  if (profile.practiceHistory.some(row => row.id === id)) return false;
  profile.disciplines[action.disciplineId] ||= { knowledge: 0, control: 0, practice: 0 };
  const discipline = profile.disciplines[action.disciplineId];
  if (action.outcome === "guided-success") {
    discipline.knowledge = Math.min(100, discipline.knowledge + 1);
    discipline.control = Math.min(100, discipline.control + 1);
    discipline.practice = Math.min(100, discipline.practice + 1);
    if (profile.knownTechniques.length < 64 &&
        !profile.knownTechniques.some(row => row.id === action.techniqueId))
      profile.knownTechniques.push({
        id: action.techniqueId,
        courseRef: learningRef,
        sourceEventId,
        disciplineId: action.disciplineId,
        scope: "introductory",
        certified: false
      });
  } else if (action.outcome === "observed" || action.outcome === "theory") {
    discipline.knowledge = Math.min(100, discipline.knowledge + 1);
  }
  if (!profile.courseRefs.includes(learningRef) && profile.courseRefs.length < 32) {
    profile.courseRefs.push(learningRef);
  }
  profile.practiceHistory.push({
    id, enrollmentId: learningRef, sourceEventId,
    disciplineId: action.disciplineId, techniqueId: action.techniqueId,
    outcome: action.outcome, alternativeTaskId: action.alternativeTaskId || null,
    response: action.response || null,
    sourceKind: formalAttendance ? "formal-course" : "observed-nonformal-learning",
    year: s.year, month: s.mo
  });
  if (profile.practiceHistory.length > 24) {
    const oldest = profile.practiceHistory.shift(),
      key = String(oldest.year) + ":" + oldest.disciplineId + ":" + oldest.techniqueId,
      archived = profile.practiceArchive.find(row => row.key === key);
    if (archived) {
      archived.count++;
      archived.lastYear = Math.max(archived.lastYear, oldest.year);
    } else {
      profile.practiceArchive.push({
        key, year: oldest.year, lastYear: oldest.year,
        disciplineId: oldest.disciplineId, techniqueId: oldest.techniqueId, count: 1
      });
      if (profile.practiceArchive.length > 64) profile.practiceArchive.shift();
    }
  }
  return true;
}

function applyArtsAction(s, action) {
  if (!action || typeof action !== "object" || Array.isArray(action)) return false;
  const resolution = typeof TRACE_RESOLUTION === "undefined" ? null : TRACE_RESOLUTION;
  if (action.action === "record-practice")
    return artsRecordPractice(s, action, resolution?.id || "");
  if (["record-use", "assess-course", "record-tech-skill"].includes(action.action) &&
      typeof applyArtsAdvancedAction === "function")
    return applyArtsAdvancedAction(s, action, resolution?.id || "", resolution);
  if (typeof artsApplyEquipmentAction === "function" && ARTS_EQUIPMENT_ACTIONS.includes(action.action))
    return artsApplyEquipmentAction(s, action, resolution?.id || "", resolution);
  throw Error("不明なアーツ実績操作");
}
