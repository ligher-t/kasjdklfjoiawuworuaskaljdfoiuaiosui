// Bind only after all engine declarations, before UI startup. Getters preserve test/debug overrides.
window.TERRA_RULES.bind({
  mortality: {
    get urgentEpisodes() {
      return urgentMortalityEpisodes;
    }
  },
  economy: {
    get availableFunds() {
      return moveFunds;
    },
    get annualReserve() {
      return annualCashReserve;
    }
  },
  family: {
    get adultChildEmergencyAidAffordable() {
      return adultChildEmergencyAidAffordable;
    },
    get adultChildReturnRoomSetupAffordable() {
      return adultChildReturnRoomSetupAffordable;
    },
    get adultChildVisitAffordable() {
      return adultChildVisitAffordable;
    },
    get adultChildVisitRoute() {
      return adultChildVisitRoute;
    },
    get childForEvent() {
      return childForEvent;
    },
    get childInfectionInitialSupportCost() {
      return childInfectionInitialSupportCost;
    },
    get childInfectionSpecialistStartCost() {
      return childInfectionSpecialistStartCost;
    },
    get childInfectionTreatmentRestartCost() {
      return childInfectionTreatmentRestartCost;
    },
    get childInfectionConsultTravelCost() {
      return childInfectionConsultTravelCost;
    },
    get divorceChildSupportAnnualCost() {
      return divorceChildSupportAnnualCost;
    },
    get familyDailyTargetById() {
      return familyDailyTargetById;
    },
    get inSharedHousehold() {
      return inSharedHousehold;
    },
    get siblingVisitAffordable() {
      return siblingVisitAffordable;
    },
    get siblingVisitRoute() {
      return siblingVisitRoute;
    },
    get spouseHealthConsultCost() {
      return spouseHealthConsultCost;
    },
    get spouseHouseholdIncome() {
      return spouseHouseholdIncome;
    },
    get spouseHousingPlan() {
      return spouseHousingPlan;
    },
    get spouseHousingTransitionAffordable() {
      return spouseHousingTransitionAffordable;
    },
    get spouseLivesWithProtagonist() {
      return spouseLivesWithProtagonist;
    },
    get spouseRejoinAffordable() {
      return spouseRejoinAffordable;
    },
    get spouseResidenceRegion() {
      return spouseResidenceRegion;
    },
    get spouseSeparateContactAnnualCost() {
      return spouseSeparateContactAnnualCost;
    },
    get spouseSeparateSupportAffordable() {
      return spouseSeparateSupportAffordable;
    },
    get spouseVisitAffordable() {
      return spouseVisitAffordable;
    },
    get spouseVisitRoute() {
      return spouseVisitRoute;
    }
  },
  facilities: {
    get activeFacility() {
      return activeFacility;
    },
    get alternativeFacility() {
      return alternativeFacility;
    },
    get facilityPersonFor() {
      return facilityPersonFor;
    },
    get localSites() {
      return localSites;
    }
  },
  relationships: {
    get closeInfoAvailable() {
      return closeInfoAvailable;
    },
    get closeInfoKnown() {
      return closeInfoKnown;
    }
  },
  careers: {
    get currentCareerPlacement() {
      return currentCareerPlacement;
    }
  },
  affiliations: {
    get canWork() { return affiliationWorkAvailable; },
    get appointmentHere() { return affiliationAppointmentHere; },
    get canChoose() { return affiliationChoiceAvailable; },
    get previousResidence() { return previousResidenceKey; },
    get atRecordedLocality() {
      return lifeAffiliationAtRecordedLocality;
    },
    get awayFromRecordedLocality() {
      return lifeAffiliationAwayFromRecordedLocality;
    }
  },
  social: {
    get institutionalInfectionAudience() { return institutionalInfectionAudience; },
    get hasRecordedExclusionExperience() {
      return hasRecordedExclusionExperience;
    },
    get infectionPriorSummary() {
      return infectionPriorSummary;
    },
    get literacyValue() {
      return literacyValue;
    },
    get relevantSocialEpisodes() {
      return relevantSocialEpisodes;
    }
  },
  information: {
    get canCorrectInformationClaim() {
      return canCorrectInformationClaim;
    },
    get canShareInformationClaim() {
      return canShareInformationClaim;
    },
    get informationClaimConflictRecipientTarget() {
      return informationClaimConflictRecipientTarget;
    },
    get informationClaimConflictRecipients() {
      return informationClaimConflictRecipients;
    },
    get informationClaimCorrectionResponseTarget() {
      return informationClaimCorrectionResponseTarget;
    },
    get informationClaimLaterReportTarget() {
      return informationClaimLaterReportTarget;
    },
    get informationClaimOrganizationConflictTarget() {
      return informationClaimOrganizationConflictTarget;
    },
    get informationClaimOrganizationTarget() {
      return informationClaimOrganizationTarget;
    },
    get informationClaimOrganizationTargets() {
      return informationClaimOrganizationTargets;
    },
    get informationClaimRecipientTarget() {
      return informationClaimRecipientTarget;
    },
    get informationClaimWorkplaceCorrectionTarget() {
      return informationClaimWorkplaceCorrectionTarget;
    },
    get informationClaimWorkplaceTarget() {
      return informationClaimWorkplaceTarget;
    }
  },
  language: {
    get getSkill() { return getLanguageSkill; },
    get getLevel() { return getLanguageSummaryLevel; },
    get assess() { return assessCommunication; },
    get canRead() { return canReadLanguageDocument; },
    get formatProfileSummary() { return formatLanguageSummaryForProfile; },
    get formatLedgerDetails() { return formatLanguageLearningDetails; },
    get formatMetric() { return formatLanguageMetric; }
  },
  conditions: {
    get matches() { return ok; },
    get restricted() {
      return restricted;
    },
    get inspectTags() {
      return inspectEligibilityTags;
    }
  },
  compatibility: {
    get tags() {
      return tags;
    }
  },
  parameters: {
    get value() {
      return P;
    }
  }
});
