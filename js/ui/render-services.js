// Live dependencies; defining this table performs no game work.
const RENDER_SERVICES = Object.freeze({
  $(...args) {
    return $(...args);
  },
  get CLASS_BAND_NAMES() {
    return CLASS_BAND_NAMES;
  },
  get DLT() {
    return DLT;
  },
  get EL() {
    return EL;
  },
  get FACILITY_MODEL() {
    return FACILITY_MODEL;
  },
  get FLAG_REGISTRY() {
    return FLAG_REGISTRY;
  },
  get HIST() {
    return HIST;
  },
  get HL() {
    return HL;
  },
  get LOCALITY_MODEL() {
    return LOCALITY_MODEL;
  },
  P(...args) {
    return P(...args);
  },
  get RM() {
    return RM;
  },
  get S() {
    return S;
  },
  get SETTING_SOURCES() {
    return SETTING_SOURCES;
  },
  annualEconomyHistoryMarkup(...args) {
    return annualEconomyHistoryMarkup(...args);
  },
  basisMarkup(...args) {
    return basisMarkup(...args);
  },
  careEngagementMarkup(...args) {
    return careEngagementMarkup(...args);
  },
  choiceEconomyHistoryMarkup(...args) {
    return choiceEconomyHistoryMarkup(...args);
  },
  closeKnowledgeSummary(...args) {
    return closeKnowledgeSummary(...args);
  },
  conflictState(...args) {
    return conflictState(...args);
  },
  get document() {
    return document;
  },
  eduLv(...args) {
    return eduLv(...args);
  },
  educationStandingLabel(...args) {
    return educationStandingLabel(...args);
  },
  ensureIdentity(...args) {
    return ensureIdentity(...args);
  },
  ensureLocalityState(...args) {
    return ensureLocalityState(...args);
  },
  esc(...args) {
    return esc(...args);
  },
  facilityPeopleSummary(...args) {
    return facilityPeopleSummary(...args);
  },
  facilitySummary(...args) {
    return facilitySummary(...args);
  },
  formatLanguageLearningDetails(...args) {
    return typeof formatLanguageLearningDetails === "function" ? formatLanguageLearningDetails(...args) : "";
  },
  formatLanguageMetric(...args) {
    return typeof formatLanguageMetric === "function" ? formatLanguageMetric(...args) : null;
  },
  formatLanguageSummaryForProfile(...args) {
    return typeof formatLanguageSummaryForProfile === "function" ? formatLanguageSummaryForProfile(...args) : "未記録";
  },
  fam(...args) {
    return fam(...args);
  },
  generationTreeMarkup(...args) {
    return generationTreeMarkup(...args);
  },
  formerSpouseLifeMarkup(...args) {
    return formerSpouseLifeMarkup(...args);
  },
  householdEndAge(...args) {
    return householdEndAge(...args);
  },
  householdStrained(...args) {
    return householdStrained(...args);
  },
  inSharedHousehold(...args) {
    return inSharedHousehold(...args);
  },
  informationClaimLaterReportMarkup(...args) {
    return informationClaimLaterReportMarkup(...args);
  },
  lifeRecordMarkup(...args) {
    return lifeRecordMarkup(...args);
  },
  lifeRows(...args) {
    return lifeRows(...args);
  },
  recordTableMarkup(...args) { return recordTableMarkup(...args); },
  setRecordMarkup(...args) { return setRecordMarkup(...args); },
  recordLinesMarkup(...args) { return recordLinesMarkup(...args); },
  literacyValue(...args) {
    return literacyValue(...args);
  },
  get localityAxes() {
    return localityAxes;
  },
  localityStateView(...args) {
    return localityStateView(...args);
  },
  m(...args) {
    return m(...args);
  },
  mortalityState(...args) {
    return mortalityState(...args);
  },
  mortalityStatusMarkup(...args) {
    return mortalityStatusMarkup(...args);
  },
  occupationLabel(...args) {
    return occupationLabel(...args);
  },
  personTieSummary(...args) {
    return personTieSummary(...args);
  },
  recurringHouseholdCostsMarkup(...args) {
    return recurringHouseholdCostsMarkup(...args);
  },
  repairSocialLearning(...args) {
    return repairSocialLearning(...args);
  },
  restricted(...args) {
    return restricted(...args);
  },
  siracusaFamilyDutyMarkup(...args) {
    return siracusaFamilyDutyMarkup(...args);
  },
  socialAftermath(...args) {
    return socialAftermath(...args);
  },
  socialConflictActionCount(...args) {
    return socialConflictActionCount(...args);
  },
  socialConflictFamilyBreachSummary(...args) {
    return socialConflictFamilyBreachSummary(...args);
  },
  socialConflictRecordCount(...args) {
    return socialConflictRecordCount(...args);
  },
  socialIncidentLocationLabel(...args) {
    return socialIncidentLocationLabel(...args);
  },
  socialStance(...args) {
    return socialStance(...args);
  },
  spouseHealthMarkup(...args) {
    return spouseHealthMarkup(...args);
  },
  spouseHouseholdArrangementMarkup(...args) {
    return spouseHouseholdArrangementMarkup(...args);
  },
  spousePersonalFinanceMarkup(...args) {
    return spousePersonalFinanceMarkup(...args);
  },
  spouseResidenceMarkup(...args) {
    return spouseResidenceMarkup(...args);
  },
  spouseSeparateLifeMarkup(...args) {
    return spouseSeparateLifeMarkup(...args);
  },
  spouseVisitMarkup(...args) {
    return spouseVisitMarkup(...args);
  },
  spouseWorkMarkup(...args) {
    return spouseWorkMarkup(...args);
  },
  sts(...args) {
    return sts(...args);
  },
  tags(...args) {
    return tags(...args);
  }
});
