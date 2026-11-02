// Annual processing uses live ports; calls retain their original order and receiver.
const ANNUAL_SERVICES = Object.freeze({
  get personalWorkCapacity() { return personalWorkCapacity; },
  get initializeInfection() { return initializeInfection; },
  P(...args) {
    return P(...args);
  },
  restricted(...args) {
    return restricted(...args);
  },
  ensureLocalityState(...args) {
    return ensureLocalityState(...args);
  },
  L(...args) {
    return L(...args);
  },
  esc(...args) {
    return esc(...args);
  },
  recordTrace(...args) {
    return recordTrace(...args);
  },
  recordCareerChange(...args) {
    return recordCareerChange(...args);
  },
  reconcileCareerPlacements(...args) {
    return reconcileCareerPlacements(...args);
  },
  advanceHobbyJourneys(...args) {
    return advanceHobbyJourneys(...args);
  },
  advanceParentWorkLives(...args) {
    return advanceParentWorkLives(...args);
  },
  advanceRomanceLife(...args) {
    return advanceRomanceLife(...args);
  },
  advanceSpouseHealth(...args) {
    return advanceSpouseHealth(...args);
  },
  advanceSpouseLife(...args) {
    return advanceSpouseLife(...args);
  },
  advanceFormerSpouseParenting(...args) {
    return advanceFormerSpouseParenting(...args);
  },
  advanceSpouseWorkLife(...args) {
    return advanceSpouseWorkLife(...args);
  },
  advanceSpouseSeparateLife(...args) {
    return advanceSpouseSeparateLife(...args);
  },
  advanceSpouseIndependentMove(...args) {
    return advanceSpouseIndependentMove(...args);
  },
  deliverSpouseMoveNotice(...args) {
    return deliverSpouseMoveNotice(...args);
  },
  advanceSeparatedParentWorkLives(...args) {
    return advanceSeparatedParentWorkLives(...args);
  },
  advanceRelativeMilestones(...args) {
    return advanceRelativeMilestones(...args);
  },
  advanceIndependentChildLives(...args) {
    return advanceIndependentChildLives(...args);
  },
  advanceIndependentChildBudgets(...args) {
    return advanceIndependentChildBudgets(...args);
  },
  advanceSiblingLives(...args) {
    return advanceSiblingLives(...args);
  },
  advanceIndependentSiblingMoves(...args) {
    return advanceIndependentSiblingMoves(...args);
  },
  advanceIndependentSiblingFamilies(...args) {
    return advanceIndependentSiblingFamilies(...args);
  },
  advanceIndependentSiblingEconomy(...args) {
    return advanceIndependentSiblingEconomy(...args);
  },
  advanceIndependentSiblingHealth(...args) {
    return advanceIndependentSiblingHealth(...args);
  },
  advanceSiblingReconnectionInvites(...args) {
    return advanceSiblingReconnectionInvites(...args);
  },
  advanceSeparatedParentHousehold(...args) {
    return advanceSeparatedParentHousehold(...args);
  },
  advanceCareNetwork(...args) {
    return advanceCareNetwork(...args);
  },
  advanceIndependentCareNetworkMembers(...args) {
    return advanceIndependentCareNetworkMembers(...args);
  },
  advanceCareNetworkMemberLives(...args) {
    return advanceCareNetworkMemberLives(...args);
  },
  advanceCareNetworkMemberMissing(...args) {
    return advanceCareNetworkMemberMissing(...args);
  },
  deliverCareNetworkMoveNotice(...args) {
    return deliverCareNetworkMoveNotice(...args);
  },
  advanceSocialContactMissing(...args) {
    return advanceSocialContactMissing(...args);
  },
  advanceSocialContactRecontact(...args) {
    return advanceSocialContactRecontact(...args);
  },
  deliverSocialContactNotices(...args) {
    return deliverSocialContactNotices(...args);
  },
  refreshMobileCityEcology(...args) {
    return refreshMobileCityEcology(...args);
  },
  settleSiblingParentTreatmentContribution(...args) {
    return settleSiblingParentTreatmentContribution(...args);
  },
  clamp(...args) {
    return clamp(...args);
  },
  R(...args) {
    return R(...args);
  },
  advanceIllnessState(...args) {
    return advanceIllnessState(...args);
  },
  advanceSocialLearning(...args) {
    return advanceSocialLearning(...args);
  },
  hobbyCount(...args) {
    return hobbyCount(...args);
  },
  annualEducationAndRelationships(...args) {
    return annualEducationAndRelationships(...args);
  },
  oriAnnualChance(...args) {
    return oriAnnualChance(...args);
  },
  recordInfectionPrior(...args) {
    return recordInfectionPrior(...args);
  },
  get HL() {
    return HL;
  },
  get CAPTURE_TRACE() {
    return CAPTURE_TRACE;
  },
  traceState(...args) {
    return traceState(...args);
  },
  oriSuspectedSetting(...args) {
    return oriSuspectedSetting(...args);
  },
  rnd(...args) {
    return rnd(...args);
  },
  oriState(...args) {
    return oriState(...args);
  },
  oriRecord(...args) {
    return oriRecord(...args);
  },
  get J() {
    return J;
  },
  advanceMortalityState(...args) {
    return advanceMortalityState(...args);
  },
  householdEndAge(...args) {
    return householdEndAge(...args);
  },
  get EXP() {
    return EXP;
  },
  localityEarningsMultiplier(...args) {
    return localityEarningsMultiplier(...args);
  },
  petCostBase(...args) {
    return petCostBase(...args);
  },
  infectionSocialPressure(...args) {
    return infectionSocialPressure(...args);
  },
  infectionCareTravelCostScale(...args) {
    return infectionCareTravelCostScale(...args);
  },
  householdSiblingCareExpense(...args) {
    return householdSiblingCareExpense(...args);
  },
  infectionCareTravelPortion(...args) {
    return infectionCareTravelPortion(...args);
  },
  localityLivingMultiplier(...args) {
    return localityLivingMultiplier(...args);
  },
  householdDependentSiblings(...args) {
    return householdDependentSiblings(...args);
  },
  setParentTreatment(...args) {
    return setParentTreatment(...args);
  },
  lapseUnaffordableSiblingTreatment(...args) {
    return lapseUnaffordableSiblingTreatment(...args);
  },
  endCareNetworkPeopleRoles(...args) {
    return endCareNetworkPeopleRoles(...args);
  },
  pickStarterJob(...args) {
    return pickStarterJob(...args);
  },
  reconcileWorkContract(...args) {
    return reconcileWorkContract(...args);
  },
  reconcileEquity(...args) {
    return reconcileEquity(...args);
  },
  childHouseholdFinances(...args) {
    return childHouseholdFinances(...args);
  },
  spouseHouseholdIncome(...args) {
    return spouseHouseholdIncome(...args);
  },
  independentSiblingCareSupportExpense(...args) {
    return independentSiblingCareSupportExpense(...args);
  },
  contractIncomeFactor(...args) {
    return contractIncomeFactor(...args);
  },
  employmentDiscriminationPenalty(...args) {
    return employmentDiscriminationPenalty(...args);
  },
  spouseLivesWithProtagonist(...args) {
    return spouseLivesWithProtagonist(...args);
  },
  hobbyAnnualExpense(...args) {
    return hobbyAnnualExpense(...args);
  },
  spouseSeparateSupportCost(...args) {
    return spouseSeparateSupportCost(...args);
  },
  spouseSeparateContactAnnualCost(...args) {
    return spouseSeparateContactAnnualCost(...args);
  },
  parentTreatmentShare(...args) {
    return parentTreatmentShare(...args);
  },
  parentTreatmentTravel(...args) {
    return parentTreatmentTravel(...args);
  },
  familyCareEarningsScale(...args) {
    return familyCareEarningsScale(...args);
  },
  personalWorkEarningsMultiplier(...args) {
    return personalWorkEarningsMultiplier(...args);
  },
  inSharedHousehold(...args) {
    return inSharedHousehold(...args);
  },
  spouseResidenceRegion(...args) {
    return spouseResidenceRegion(...args);
  },
  recordIndependentSiblingCareSupportPayments(...args) {
    return recordIndependentSiblingCareSupportPayments(...args);
  },
  recordDivorceChildSupportPayments(...args) {
    return recordDivorceChildSupportPayments(...args);
  },
  recordSpouseSeparateSupportTransfer(...args) {
    return recordSpouseSeparateSupportTransfer(...args);
  },
  recordSpouseAnnualFinance(...args) {
    return recordSpouseAnnualFinance(...args);
  },
  spouseGrossAnnualIncome(...args) {
    return spouseGrossAnnualIncome(...args);
  },
  spouseIndependentNonHousingExpense(...args) {
    return spouseIndependentNonHousingExpense(...args);
  },
  spouseIndependentHousingExpense(...args) {
    return spouseIndependentHousingExpense(...args);
  },
  spouseIndependentMedicalExpense(...args) {
    return spouseIndependentMedicalExpense(...args);
  },
  recordFamilyCareHistory(...args) {
    return recordFamilyCareHistory(...args);
  },
  lapseUnaffordableChildTreatments(...args) {
    return lapseUnaffordableChildTreatments(...args);
  },
  revalueWorkshopShare(...args) {
    return revalueWorkshopShare(...args);
  },
  get FLOW_HISTORY_LIMIT() {
    return FLOW_HISTORY_LIMIT;
  },
  refreshWealthClass(...args) {
    return refreshWealthClass(...args);
  },
  refreshSocialClass(...args) {
    return refreshSocialClass(...args);
  },
  eduLv(...args) {
    return eduLv(...args);
  },
  equityCreditPenalty(...args) {
    return equityCreditPenalty(...args);
  },
  hist(...args) {
    return hist(...args);
  },
  fin(...args) {
    return fin(...args);
  },
  rd(...args) {
    return rd(...args);
  },
  sched(...args) {
    return sched(...args);
  },
  SV(...args) {
    return SV(...args);
  }
});
