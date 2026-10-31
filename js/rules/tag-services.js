// Compatibility preparation ports may repair state. Domain rules receive this dependency table explicitly.
const TAG_RULE_SERVICES = Object.freeze({
  helpers: Object.freeze({
    eduLv(...args) {
      return eduLv(...args);
    },
    restricted(...args) {
      return restricted(...args);
    },
    P(...args) {
      return P(...args);
    },
    stg(...args) {
      return stg(...args);
    },
    hasActiveCraftKnowledgeGoal(...args) {
      return hasActiveCraftKnowledgeGoal(...args);
    },
    formerSpouseDeathNoticeTarget(...args) {
      return formerSpouseDeathNoticeTarget(...args);
    },
    formerSpouseMoveNoticeTarget(...args) {
      return formerSpouseMoveNoticeTarget(...args);
    },
    siblingDeathNoticeTarget(...args) {
      return siblingDeathNoticeTarget(...args);
    },
    householdEndAge(...args) {
      return householdEndAge(...args);
    },
    siblingsOf(...args) {
      return siblingsOf(...args);
    },
    communitySignals(...args) {
      return communitySignals(...args);
    },
    formerSpouseParentingTarget(...args) {
      return formerSpouseParentingTarget(...args);
    },
    childResidencePlanTarget(...args) {
      return childResidencePlanTarget(...args);
    },
    spouseLivesWithProtagonist(...args) {
      return spouseLivesWithProtagonist(...args);
    },
    spouseInfectionHousingPressure(...args) {
      return spouseInfectionHousingPressure(...args);
    },
    familyCareScheduleSiblingCandidates(...args) {
      return familyCareScheduleSiblingCandidates(...args);
    },
    familyCareCostShareSiblingCandidates(...args) {
      return familyCareCostShareSiblingCandidates(...args);
    },
    siblingCount(...args) {
      return siblingCount(...args);
    },
    childIsSupported(...args) {
      return childIsSupported(...args);
    },
    siblingInfectionKnownToPlayer(...args) {
      return siblingInfectionKnownToPlayer(...args);
    },
    inSharedHousehold(...args) {
      return inSharedHousehold(...args);
    },
    householdStrained(...args) {
      return householdStrained(...args);
    },
    hardlineBias(...args) {
      return hardlineBias(...args);
    },
    discriminationEncounterRisk(...args) {
      return discriminationEncounterRisk(...args);
    },
    infectionSocialPressure(...args) {
      return infectionSocialPressure(...args);
    },
    worldPressure(...args) {
      return worldPressure(...args);
    }
  }),
  catalog: Object.freeze({
    get STG() {
      return STG;
    },
    get J() {
      return J;
    },
    get FC() {
      return FC;
    },
    get FLAG_REGISTRY() {
      return FLAG_REGISTRY;
    }
  }),
  preparation: Object.freeze({
    localityStateView(...args) {
      return localityStateView(...args);
    },
    activeFacility(...args) {
      return activeFacility(...args);
    },
    ensureLifeRecord(...args) {
      return ensureLifeRecord(...args);
    },
    initializeSocialClass(...args) {
      return initializeSocialClass(...args);
    },
    ensureIdentity(...args) {
      return ensureIdentity(...args);
    },
    conflictState(...args) {
      return conflictState(...args);
    },
    literacyValue(...args) {
      return literacyValue(...args);
    },
    barrierRecently(...args) {
      return barrierRecently(...args);
    },
    socialModel(...args) {
      return socialModel(...args);
    },
    infectionCareAccess(...args) {
      return infectionCareAccess(...args);
    }
  }),
  world: Object.freeze({
    get events() {
      return W;
    }
  })
});
