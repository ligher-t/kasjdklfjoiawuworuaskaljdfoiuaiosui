const VIOLENCE_TARGET_GROUPS = new Set(["infected", "sarkaz"]);

function violenceFormationAssessment(s, action, resolution, eventId) {
  if (!action || action.action !== "record-belief" ||
      !VIOLENCE_TARGET_GROUPS.has(action.targetGroup) ||
      !["hear", "endorse", "reject", "leave-group"].includes(action.behavior) ||
      typeof action.evidenceId !== "string" || !action.evidenceId.trim() ||
      typeof action.basis !== "string" || !action.basis.trim() ||
      (action.delta != null && (!Number.isInteger(action.delta) || action.delta < 0 || action.delta > 30)) ||
      (action.behavior === "endorse" && !(action.delta > 0)) ||
      (action.behavior !== "endorse" && (action.delta || 0) !== 0))
    return { ok: false, reason: "invalid-formation-action" };
  if (!eventId || !resolution || !Number.isInteger(s.year) || !Number.isInteger(s.mo))
    return { ok: false, reason: "missing-observed-source" };
  const evidenceId = `${eventId}:${action.evidenceId}`,
    state = violenceStateFor(s, false);
  if (state?.formationHistory.some(row => row.id === evidenceId))
    return { ok: true, duplicate: true, evidenceId };
  return { ok: true, duplicate: false, evidenceId };
}

function violenceApplyFormation(s, action, resolution, eventId) {
  const assessment = violenceFormationAssessment(s, action, resolution, eventId);
  if (!assessment.ok) throw Error(`暴力形成記録を適用できない: ${assessment.reason}`);
  if (assessment.duplicate) return { duplicate: true, evidenceId: assessment.evidenceId };
  const state = violenceStateFor(s),
    belief = state.beliefs[action.targetGroup] ||= { harmLegitimacy: 0, evidenceIds: [] },
    delta = action.behavior === "endorse" ? action.delta : 0,
    row = {
      id: assessment.evidenceId,
      sourceEventId: eventId,
      year: s.year,
      month: s.mo,
      region: s.res?.n || null,
      targetGroup: action.targetGroup,
      behavior: action.behavior,
      delta,
      basis: action.basis,
      audience: action.audience || "not-recorded"
    };
  belief.harmLegitimacy = Math.max(0, Math.min(100, belief.harmLegitimacy + delta));
  belief.evidenceIds ||= [];
  belief.evidenceIds.push(row.id);
  state.formationHistory.push(row);
  return { duplicate: false, evidenceId: row.id, delta };
}
