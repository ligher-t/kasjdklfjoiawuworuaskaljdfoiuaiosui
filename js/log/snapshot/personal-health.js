function tracePersonalHealth(s) {
  return {
    wealth: s.w?.n || null,
    health: s.h,
    mood: s.p,
    relations: s.rl,
    knowledge: s.k,
    arts: s.ar,
    credit: s.cr,
    infectionExposure: s.infection
      ? {
          year: s.infection.year ?? null,
          cause: s.infection.cause || null,
          onset: s.infectionOnset ? {...s.infectionOnset} : null,
          basis: s.infection.basis || "legacy-unclassified",
          diagnosedYear: s.infection.diagnosedYear ?? null,
          suspectedSetting: s.infection.suspectedSetting || null
        }
      : null,
    exposurePrevention: s.oripathyExposure
      ? {
          version: s.oripathyExposure.version,
          protectionUntilYear: s.oripathyExposure.protectionUntilYear ?? null,
          reviewDueYear: s.oripathyExposure.reviewDueYear ?? null,
          history: (s.oripathyExposure.history || []).map(row => ({ ...row }))
        }
      : null,
    infected: !!s.inf,
    diagnosed: !!s.fl?.dg,
    infectionLoad: s.ob,
    infectionAwarenessCount: infectionAwarenessEntries(s).length
  };
}
