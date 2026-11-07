function auditLifeState(s) {
  const services = STATE_AUDIT_SERVICES;
  const problems = [];
  auditCommunityAndRandomState(s, problems, services);
  auditLifeRecords(s, problems, services);
  auditResidenceAndPersonalState(s, problems, services);
  auditFamilyCareState(s, problems, services);
  auditNumericAndMoneyHistory(s, problems, services);
  auditSiblingParentSupport(s, problems, services);
  auditPersonalFlagsAndLimits(s, problems, services);
  auditParentsAndSiblings(s, problems, services);
  auditSiblingAndPartnerState(s, problems, services);
  auditSpouseAndChildState(s, problems, services);
  auditFamilyModelParameters(problems, services);
  auditFamilyIdentityAndNotices(s, problems, services);
  auditInformationState(s, problems, services);
  auditCareAndWorkplaceState(s, problems, services);
  auditSocialAndFacilityState(s, problems, services);
  if (typeof auditViolenceState === "function") auditViolenceState(s, problems);
  return problems;
}
