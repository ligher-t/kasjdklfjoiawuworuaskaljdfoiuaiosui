function traceSocialLife(s, services) {
  return {
    culturalIdentity: JSON.parse(JSON.stringify(services.ensureIdentity(s))),
    socialConflict: JSON.parse(JSON.stringify(services.conflictState(s))),
    socialAftermath: JSON.parse(JSON.stringify(services.socialAftermath(s))),
    personTies: JSON.parse(JSON.stringify(services.personTieStore(s))),
    violence: JSON.parse(JSON.stringify(violenceSummaryForPlayer(s))),
    closeKnowledge: JSON.parse(JSON.stringify(services.closeInfoStore(s))),
    equityLedger: JSON.parse(JSON.stringify(services.reconcileEquity(s))),
    attitudes: {
      infected: s.biasInfected || 0,
      sarkaz: s.biasSarkaz || 0,
      socialLearning: JSON.parse(JSON.stringify(services.socialModel(s))),
      history: (s.attitudeHistory || []).map(x => ({ ...x }))
    },
    lifeRecord: JSON.parse(JSON.stringify(services.ensureLifeRecord(s))),
    careEngagement: {
      familyCareInclination: s.careInclination ?? 50,
      history: (s.careInclinationHistory || []).map(x => ({ ...x }))
    },
    siracusaFamilyTie: s.siracusaFamilyTie
      ? {
          ...s.siracusaFamilyTie,
          history: (s.siracusaFamilyTie.history || []).map(row => ({ ...row })),
          duty: s.siracusaFamilyTie.duty
            ? {
                ...s.siracusaFamilyTie.duty,
                history: (s.siracusaFamilyTie.duty.history || []).map(row => ({ ...row }))
              }
            : null
        }
      : null
  };
}
