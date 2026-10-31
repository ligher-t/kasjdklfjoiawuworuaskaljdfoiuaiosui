// Ordered catalog and current-life consistency checks.
function validate() {
  const services = CATALOG_AUDIT_SERVICES;
  const W_ = [],
    ids = new Set();
  validateFormerPartners(W_, services);
  validateSpouseFinanceParameters(W_, services);
  validateSpouseHealthParameters(W_, services);
  validateSpouseWorkRecords(W_, services);
  validateCareParameters(W_, services);
  const { checkAffordableCashEffect, checkCashGateEffect } = createCatalogCashChecks(W_);
  const historyIds = services.HIST.filter(h => h.flag).map(h => h.flag),
    duplicateHistoryIds = [...new Set(historyIds.filter((id, i) => historyIds.indexOf(id) !== i))];
  if (duplicateHistoryIds.length) W_.push(`年表イベントIDが重複: ${duplicateHistoryIds.join("、")}`);
  const { cc, weight, fx } = createCatalogFieldChecks(W_, services);
  validateFieldMetadata(W_, services);
  validateEvents(W_, services, ids, cc, weight, fx, checkAffordableCashEffect, checkCashGateEffect);
  validateBaselineCoverage(W_, services);
  validateRegionalModels(W_, services);
  validateParametersAndDatasets(W_, services);
  validateFlagLifecycle(W_, services);
  validateHistoryAndMigration(W_, services, fx);
  return W_;
}
