// Live dependencies; defining this table performs no game work.
const LOG_SERVICES = Object.freeze({
  $(...args) {
    return $(...args);
  },
  get Blob() {
    return Blob;
  },
  get CAPTURE_TRACE() {
    return CAPTURE_TRACE;
  },
  get DATA_FINGERPRINT() {
    return DATA_FINGERPRINT;
  },
  get EL() {
    return EL;
  },
  get EV() {
    return EV;
  },
  get HL() {
    return HL;
  },
  set PENDING_DEATH_TRACE(value) {
    PENDING_DEATH_TRACE = value;
  },
  get PENDING_DEATH_TRACE() {
    return PENDING_DEATH_TRACE;
  },
  get S() {
    return S;
  },
  get SAVE_VERSION() {
    return SAVE_VERSION;
  },
  get SOURCE_FINGERPRINT() {
    return SOURCE_FINGERPRINT;
  },
  get TRACE_VERSION() {
    return TRACE_VERSION;
  },
  get URL() {
    return URL;
  },
  closeInfoStore(...args) {
    return closeInfoStore(...args);
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
  ensureIdentity(...args) {
    return ensureIdentity(...args);
  },
  ensureLifeRecord(...args) {
    return ensureLifeRecord(...args);
  },
  familyCareEarningsScale(...args) {
    return familyCareEarningsScale(...args);
  },
  lifeSummaryFacts(...args) {
    return lifeSummaryFacts(...args);
  },
  occupationLabel(...args) {
    return occupationLabel(...args);
  },
  personTieStore(...args) {
    return personTieStore(...args);
  },
  reconcileEquity(...args) {
    return reconcileEquity(...args);
  },
  regionalPolicyContext(...args) {
    return regionalPolicyContext(...args);
  },
  regionalServiceContext(...args) {
    return regionalServiceContext(...args);
  },
  setTimeout(...args) {
    return setTimeout(...args);
  },
  siblingsOf(...args) {
    return siblingsOf(...args);
  },
  socialAftermath(...args) {
    return socialAftermath(...args);
  },
  socialClassSummary(...args) {
    return socialClassSummary(...args);
  },
  socialModel(...args) {
    return socialModel(...args);
  },
  spouseEmploymentMarketContext(...args) {
    return spouseEmploymentMarketContext(...args);
  },
  spouseEmploymentStatus(...args) {
    return spouseEmploymentStatus(...args);
  },
  spouseHouseholdIncome(...args) {
    return spouseHouseholdIncome(...args);
  },
  spouseIndependentHousingExpense(...args) {
    return spouseIndependentHousingExpense(...args);
  },
  spouseKnownResidenceRegion(...args) {
    return spouseKnownResidenceRegion(...args);
  },
  spouseLivesWithProtagonist(...args) {
    return spouseLivesWithProtagonist(...args);
  },
  spouseRegionalServiceContext(...args) {
    return spouseRegionalServiceContext(...args);
  },
  spouseSeparateContactAnnualCost(...args) {
    return spouseSeparateContactAnnualCost(...args);
  },
  spouseSeparateSupportCost(...args) {
    return spouseSeparateSupportCost(...args);
  },
  traceState(...args) {
    return traceState(...args);
  },
  worldPressureContext(...args) {
    return worldPressureContext(...args);
  }
});
