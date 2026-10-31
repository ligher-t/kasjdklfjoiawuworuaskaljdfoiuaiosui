function traceSiblingSupport(s, services) {
  return {
    siblingParentSupportConference: s.siblingParentSupportConference
      ? {
          ...s.siblingParentSupportConference,
          participantIds: [...(s.siblingParentSupportConference.participantIds || [])],
          history: (s.siblingParentSupportConference.history || []).map(row => ({
            ...row,
            participantIds: row.participantIds ? [...row.participantIds] : undefined
          }))
        }
      : null,
    siblingParentSupport: services
      .siblingsOf(s)
      .filter(x => x.independentSinceYear)
      .map(x => ({
        siblingId: x.id,
        status: x.parentSupportStatus || "none",
        disposition: x.parentSupportDisposition ?? null,
        reviewYear: x.parentSupportReviewYear ?? null,
        paidTotal: x.parentSupportPaidTotal || 0,
        paidYear: x.parentSupportPaidYear || null,
        paidAmount: x.parentSupportPaidAmount || 0,
        changeCount: x.parentSupportChangeCount || 0,
        knownStatus: x.knownParentSupportStatus || "none",
        knownPaidTotal: x.knownParentSupportPaidTotal || 0,
        knownChangeCount: x.knownParentSupportChangeCount || 0,
        knownYear: x.parentSupportKnownYear || null,
        parentNeedKnownStatus: x.parentNeedKnownStatus || "unknown",
        parentNeedKnownYear: x.parentNeedKnownYear || null,
        parentNeedReviewYear: x.parentNeedReviewYear || null,
        parentNeedPending: x.parentNeedPending ? { ...x.parentNeedPending } : null,
        parentNeedHistory: x.parentNeedHistory || [],
        history: x.parentSupportHistory || []
      })),
    siblingHouseholds: services
      .siblingsOf(s)
      .filter(x => x.independentSinceYear)
      .map(x => ({
        siblingId: x.id,
        partner: x.familyHousehold?.partner
          ? {
              id: x.familyHousehold.partner.id,
              name: x.familyHousehold.partner.nm,
              birthYear: x.familyHousehold.partner.by,
              age: s.year - x.familyHousehold.partner.by,
              alive: !x.familyHousehold.partner.d,
              deathYear: x.familyHousehold.partner.d || null,
              deathCause: x.familyHousehold.partner.deathCause || null,
              mortalityCheckedYear: x.familyHousehold.partner.mortalityCheckedYear ?? null,
              jobId: x.familyHousehold.partner.j
            }
          : null,
        children: (x.familyHousehold?.children || []).map(child => ({
          id: child.id,
          name: child.nm,
          birthYear: child.by,
          age: s.year - child.by,
          alive: !child.d,
          deathYear: child.d || null,
          deathCause: child.deathCause || null,
          mortalityCheckedYear: child.mortalityCheckedYear ?? null,
          relationType: child.relationType || null
        })),
        familyHistory: x.familyHousehold?.history || [],
        supportTransfers: x.familyHousehold?.supportTransfers || [],
        postDeathFamilyFinance: x.postDeathFamilyFinance ? { ...x.postDeathFamilyFinance } : null,
        bereavementSupportHistory: x.bereavementSupportHistory || [],
        knownPartner: x.knownFamilyPartner,
        knownChildren: x.knownFamilyChildren,
        knownYear: x.knownFamilyYear || null,
        noticeYear: x.familyNoticeYear || null,
        annualExpense: x.financialAnnualExpense || 0
      }))
  };
}
