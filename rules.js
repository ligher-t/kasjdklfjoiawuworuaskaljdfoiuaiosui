// Explicit event-rule service contract. No engine state is exposed here.
(function () {
  "use strict";
  if (!Function.prototype.toJSON) {
    Function.prototype.toJSON = function () { return this.toString(); };
  }
  if (window.TERRA_RULES) throw new Error("Rule API already initialized");
  const contract = {
    "mortality": { "urgentEpisodes": "urgentMortalityEpisodes" },
    "economy": { "availableFunds": "moveFunds", "annualReserve": "annualCashReserve" },
    "family": {
      "adultChildEmergencyAidAffordable": "adultChildEmergencyAidAffordable",
      "adultChildReturnRoomSetupAffordable": "adultChildReturnRoomSetupAffordable",
      "adultChildVisitAffordable": "adultChildVisitAffordable",
      "adultChildVisitRoute": "adultChildVisitRoute",
      "childForEvent": "childForEvent",
      "childInfectionInitialSupportCost": "childInfectionInitialSupportCost",
      "childInfectionConsultTravelCost": "childInfectionConsultTravelCost",
      "childInfectionSpecialistStartCost": "childInfectionSpecialistStartCost",
      "childInfectionTreatmentRestartCost": "childInfectionTreatmentRestartCost",
      "divorceChildSupportAnnualCost": "divorceChildSupportAnnualCost",
      "familyDailyTargetById": "familyDailyTargetById",
      "inSharedHousehold": "inSharedHousehold",
      "siblingVisitAffordable": "siblingVisitAffordable",
      "siblingVisitRoute": "siblingVisitRoute",
      "spouseHealthConsultCost": "spouseHealthConsultCost",
      "spouseHouseholdIncome": "spouseHouseholdIncome",
      "spouseHousingPlan": "spouseHousingPlan",
      "spouseHousingTransitionAffordable": "spouseHousingTransitionAffordable",
      "spouseLivesWithProtagonist": "spouseLivesWithProtagonist",
      "spouseRejoinAffordable": "spouseRejoinAffordable",
      "spouseResidenceRegion": "spouseResidenceRegion",
      "spouseSeparateContactAnnualCost": "spouseSeparateContactAnnualCost",
      "spouseSeparateSupportAffordable": "spouseSeparateSupportAffordable",
      "spouseVisitAffordable": "spouseVisitAffordable",
      "spouseVisitRoute": "spouseVisitRoute"
    },
    "facilities": {
      "activeFacility": "activeFacility",
      "alternativeFacility": "alternativeFacility",
      "facilityPersonFor": "facilityPersonFor",
      "localSites": "localSites"
    },
    "relationships": { "closeInfoAvailable": "closeInfoAvailable", "closeInfoKnown": "closeInfoKnown" },
    "careers": { "currentCareerPlacement": "currentCareerPlacement" },
    "affiliations": {
      "atRecordedLocality": "lifeAffiliationAtRecordedLocality",
      "awayFromRecordedLocality": "lifeAffiliationAwayFromRecordedLocality",
      "canWork": "affiliationWorkAvailable",
      "appointmentHere": "affiliationAppointmentHere",
      "canChoose": "affiliationChoiceAvailable",
      "previousResidence": "previousResidenceKey"
    },
    "social": {
      "institutionalInfectionAudience": "institutionalInfectionAudience",
      "hasRecordedExclusionExperience": "hasRecordedExclusionExperience",
      "infectionPriorSummary": "infectionPriorSummary",
      "literacyValue": "literacyValue",
      "relevantSocialEpisodes": "relevantSocialEpisodes"
    },
    "information": {
      "canCorrectInformationClaim": "canCorrectInformationClaim",
      "canShareInformationClaim": "canShareInformationClaim",
      "informationClaimConflictRecipientTarget": "informationClaimConflictRecipientTarget",
      "informationClaimConflictRecipients": "informationClaimConflictRecipients",
      "informationClaimCorrectionResponseTarget": "informationClaimCorrectionResponseTarget",
      "informationClaimLaterReportTarget": "informationClaimLaterReportTarget",
      "informationClaimOrganizationConflictTarget": "informationClaimOrganizationConflictTarget",
      "informationClaimOrganizationTarget": "informationClaimOrganizationTarget",
      "informationClaimOrganizationTargets": "informationClaimOrganizationTargets",
      "informationClaimRecipientTarget": "informationClaimRecipientTarget",
      "informationClaimWorkplaceCorrectionTarget": "informationClaimWorkplaceCorrectionTarget",
      "informationClaimWorkplaceTarget": "informationClaimWorkplaceTarget"
    },
    "language": {
      "getSkill": "getLanguageSkill",
      "getLevel": "getLanguageSummaryLevel",
      "assess": "assessCommunication",
      "canRead": "canReadLanguageDocument",
      "formatProfileSummary": "formatLanguageSummaryForProfile",
      "formatLedgerDetails": "formatLanguageLearningDetails",
      "formatMetric": "formatLanguageMetric"
    },
    "conditions": { "restricted": "restricted", "inspectTags": "inspectEligibilityTags", "matches": "ok" },
    "compatibility": { "tags": "tags" },
    "parameters": { "value": "P" }
  };
  let providers = null;
  const services = {};
  for (const [domain, methods] of Object.entries(contract)) {
    const group = {};
    for (const method of Object.keys(methods))
      group[method] = function (...args) {
        if (!providers) throw new Error("Rule services have not been bound: " + domain + "." + method);
        const fn = providers[domain][method];
        return Reflect.apply(fn, undefined, args);
      };
    Object.freeze(methods);
    services[domain] = Object.freeze(group);
  }
  Object.freeze(contract);
  Object.freeze(services);
  window.TERRA_RULES = Object.freeze({
    contract,
    services,
    bind(input) {
      if (providers) throw new Error("Rule services are already bound");
      for (const domain of Object.keys(input || {}))
        if (!contract[domain]) throw new Error("Unknown rule domain: " + domain);
      const next = {};
      for (const [domain, methods] of Object.entries(contract)) {
        const candidate = input?.[domain];
        for (const method of Object.keys(candidate || {}))
          if (!methods[method]) throw new Error("Unknown rule service: " + domain + "." + method);
        const descriptors = {};
        for (const method of Object.keys(methods)) {
          if (typeof candidate?.[method] !== "function")
            throw new Error("Missing rule service: " + domain + "." + method);
          const descriptor = Object.getOwnPropertyDescriptor(candidate, method);
          if (!descriptor) throw new Error("Rule service must be an own property: " + domain + "." + method);
          descriptors[method] = descriptor;
        }
        next[domain] = Object.freeze(Object.defineProperties({}, descriptors));
      }
      providers = Object.freeze(next);
    }
  });
})();
