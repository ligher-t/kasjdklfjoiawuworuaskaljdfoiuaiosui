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
    disciplines: {},
    techSkills: {},
    knownTechniques: [],
    courseRefs: [],
    licenseRefs: [],
    practiceHistory: [],
    practiceArchive: []
  };
}

function artsInnateBandLabel(s) {
  return ({ lower: "低め", intermediate: "中程度", upper: "高め", exceptional: "まれに高い" })[
    s?.artsProfile?.innateBand
  ] || "未記録";
}

function artsPracticeSummary(s) {
  const profile = s?.artsProfile;
  if (!profile) return "未記録";
  const rows = profile.practiceHistory || [], counts = {
    "guided-success": 0, observed: 0, theory: 0, "attempt-not-achieved": 0
  };
  for (const row of rows) if (Object.prototype.hasOwnProperty.call(counts, row.outcome)) counts[row.outcome]++;
  const archived = (profile.practiceArchive || []).reduce((sum, row) => sum + row.count, 0),
    techniques = (profile.knownTechniques || []).map(row =>
      row.id === "kinetic-small-object" ? "小物を動かす初歩（未認定）" : "個別の初歩的な型（未認定）");
  if (!rows.length && !archived && !techniques.length) return "授業・指導の記録なし";
  const summary = [
    counts["guided-success"] ? "指導下の実技 " + counts["guided-success"] + "件" : null,
    counts.observed ? "観察 " + counts.observed + "件" : null,
    counts.theory ? "理論 " + counts.theory + "件" : null,
    counts["attempt-not-achieved"] ? "未達 " + counts["attempt-not-achieved"] + "件" : null,
    archived ? "過去の集約 " + archived + "件" : null
  ].filter(Boolean);
  return [...techniques, ...summary].join("・");
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
      !profile.disciplines || typeof profile.disciplines !== "object" ||
      Array.isArray(profile.disciplines) ||
      !profile.techSkills || typeof profile.techSkills !== "object" ||
      Array.isArray(profile.techSkills) ||
      !Array.isArray(profile.knownTechniques) || profile.knownTechniques.length > 64 ||
      !Array.isArray(profile.courseRefs) || profile.courseRefs.length > 32 ||
      !Array.isArray(profile.licenseRefs) || profile.licenseRefs.length > 32 ||
      !Array.isArray(profile.practiceHistory) || profile.practiceHistory.length > 24 ||
      !Array.isArray(profile.practiceArchive) || profile.practiceArchive.length > 64) return false;
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
  return profile.practiceArchive.every(row =>
    row && typeof row.key === "string" && row.key &&
    Number.isInteger(row.year) && row.year <= currentYear &&
    Number.isInteger(row.lastYear) && row.lastYear >= row.year && row.lastYear <= currentYear &&
    typeof row.techniqueId === "string" && row.techniqueId &&
    Number.isInteger(row.count) && row.count > 0 && row.count <= 10000);
}

function artsCurrentFormalEnrollment(s) {
  if (s?.educationPath?.status !== "enrolled" || s.educationPath.stage !== "arts") return null;
  return typeof educationActiveEnrollment === "function" ? educationActiveEnrollment(s) : null;
}

function artsHasAttendedCurrentCourse(s, enrollment = artsCurrentFormalEnrollment(s)) {
  if (!enrollment || enrollment.stage !== "arts") return false;
  const months = s.educationAttendance?.enrollments?.[enrollment.id]?.[s.year];
  return !!months && Object.values(months).some(row =>
    Number.isFinite(row?.recognizedEquivalent) && row.recognizedEquivalent > 0);
}

function recordArtsFormalAdmissionAssessment(s, sourceRef) {
  if (!s?.artsProfile || s.educationPath?.status !== "enrolled" ||
      s.educationPath.stage !== "arts" || s.artsProfile.assessmentStatus === "assessed") return false;
  const ref = typeof sourceRef === "string" && sourceRef.trim()
    ? sourceRef
    : "formal-arts-admission:" + s.year;
  s.artsProfile.assessmentStatus = "assessed";
  s.artsProfile.assessment = { year: s.year, basis: "formal-admission", sourceRef: ref };
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
  const enrollment = artsCurrentFormalEnrollment(s);
  if (!artsHasAttendedCurrentCourse(s, enrollment)) return false;
  const resolution = typeof TRACE_RESOLUTION === "undefined" ? null : TRACE_RESOLUTION,
    choicePart = Number.isInteger(resolution?.choiceIndex) ? resolution.choiceIndex : 0,
    outcomePart = Number.isInteger(resolution?.outcomeIndex) ? resolution.outcomeIndex : 0,
    id = [sourceEventId, enrollment.id, s.year, s.mo, choicePart, outcomePart].join(":"),
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
        courseRef: enrollment.id,
        sourceEventId,
        scope: "introductory",
        certified: false
      });
  } else if (action.outcome === "observed" || action.outcome === "theory") {
    discipline.knowledge = Math.min(100, discipline.knowledge + 1);
  }
  if (!profile.courseRefs.includes(enrollment.id)) {
    if (profile.courseRefs.length >= 32) profile.courseRefs.shift();
    profile.courseRefs.push(enrollment.id);
  }
  profile.practiceHistory.push({
    id, enrollmentId: enrollment.id, sourceEventId,
    disciplineId: action.disciplineId, techniqueId: action.techniqueId,
    outcome: action.outcome, alternativeTaskId: action.alternativeTaskId || null,
    response: action.response || null,
    year: s.year, month: s.mo
  });
  if (profile.practiceHistory.length > 24) {
    const oldest = profile.practiceHistory.shift(),
      key = String(oldest.year) + ":" + oldest.techniqueId,
      archived = profile.practiceArchive.find(row => row.key === key);
    if (archived) {
      archived.count++;
      archived.lastYear = oldest.year;
    } else {
      profile.practiceArchive.push({
        key, year: oldest.year, lastYear: oldest.year,
        techniqueId: oldest.techniqueId, count: 1
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
  if (typeof artsApplyEquipmentAction === "function" && ARTS_EQUIPMENT_ACTIONS.includes(action.action))
    return artsApplyEquipmentAction(s, action, resolution?.id || "", resolution);
  throw Error("不明なアーツ実績操作");
}
