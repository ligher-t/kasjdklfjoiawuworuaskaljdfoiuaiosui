function exportLife() {
  const services = LOG_SERVICES;
  if (!services.S) return;
  const visibleLog = [...services.document.querySelectorAll("#lg li")]
    .reverse()
    .map(li => li.textContent.trim());
  const dataKnown = String(services.S.dataFingerprintAtBirth || "").startsWith("terra-data-"),
    sourceKnown = String(services.S.sourceFingerprintAtBirth || "").startsWith("terra-source-");
  const payload = {
    format: "terra-life-log",
    traceVersion: services.TRACE_VERSION,
    traceVersionsPresent: [...new Set((services.S.trace || []).map(x => x.version || 1))],
    dataFingerprintAtBirth: services.S.dataFingerprintAtBirth || "旧セーブ・不明",
    currentDataFingerprint: services.DATA_FINGERPRINT,
    dataChangedDuringLife: dataKnown ? services.S.dataFingerprintAtBirth !== services.DATA_FINGERPRINT : null,
    sourceFingerprintAtBirth: services.S.sourceFingerprintAtBirth || "旧セーブ・不明",
    currentSourceFingerprint: services.SOURCE_FINGERPRINT,
    sourceChangedDuringLife: sourceKnown
      ? services.S.sourceFingerprintAtBirth !== services.SOURCE_FINGERPRINT
      : null,
    saveVersion: services.SAVE_VERSION,
    person: {
      name: services.S.nm,
      birthYear: services.S.by,
      birthDate: services.S.bd,
      age: services.S.age,
      year: services.S.year,
      dead: !!services.S.dead
    },
    personSummary: services.lifeSummaryFacts(services.S),
    annualEconomyHistory: services.S.flowHistory || [],
    choiceEconomyHistory: services.S.moneyLog || [],
    facilityContactHistory: services.S.facilityContacts || [],
    facilityPeopleContacts: services.S.facilityPeopleContacts || [],
    siteAffiliations: services.S.siteAffiliations || {},
    siteAffiliationHistory: services.S.siteAffiliationHistory || [],
    workContract: services.S.workContract || null,
    workContractHistory: services.S.workContractHistory || [],
    equityLedger: services.S.equityLedger || null,
    personTies: services.S.personTies || null,
    closeKnowledge: services.S.closeKnowledge || null,
    infectionAwareness: services.S.infectionAwareness || { version: 1, entries: [] },
    choiceIntentAudit: {
      version: 87,
      reviewedEvents: services.EV.filter(e => e.c?.some(c => c.ethics?.reviewed)).length,
      reviewedChoices: services.EV.reduce((n, e) => n + (e.c || []).filter(c => c.ethics?.reviewed).length, 0)
    },
    intergroupHistory: services.S.intergroupHistory || [],
    currentFacilityPeople: services.S.community?.people || {},
    currentFacilityState: services.S.community?.facilities || {},
    previousRegionFacilities: services.S.world?.localityArchive || {},
    currentState: services.traceState(services.S),
    pendingEventId: services.S.ev?.id || null,
    visibleLog,
    trace: services.S.trace || []
  };
  const url = services.URL.createObjectURL(
      new services.Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" })
    ),
    link = services.document.createElement("a");
  link.href = url;
  link.download = `terra-life-${services.S.by}-${services.S.age}-${services.SOURCE_FINGERPRINT}.json`;
  services.document.body.append(link);
  link.click();
  link.remove();
  services.setTimeout(() => services.URL.revokeObjectURL(url), 1000);
}
