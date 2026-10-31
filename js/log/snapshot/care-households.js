function traceCareHouseholds(s, services) {
  return {
    careNetwork: s.care?.supportNetwork
      ? {
          id: s.care.supportNetwork.id,
          type: s.care.supportNetwork.type,
          label: s.care.supportNetwork.label,
          roles: [...(s.care.supportNetwork.roles || [])],
          members: (s.care.supportNetwork.members || []).map(person => ({
            id: person.id,
            name: person.nm,
            birthYear: person.by,
            roles: [...(person.roles || [])],
            careStatus: person.careStatus,
            careStatusKnownYear: person.careStatusKnownYear,
            region: person.knownRegion || null,
            moveCount: person.knownMoveCount || 0,
            moveKnownYear: person.moveKnownYear || null,
            knownMoveHistory: (person.knownMoveHistory || []).map(row => ({ ...row })),
            knownLifeStatus: person.knownLifeStatus || "unrecorded",
            knownLifeStatusYear: person.knownLifeStatusYear || null,
            knownMissingSinceYear:
              person.knownLifeStatus === "missing" ? person.knownMissingSinceYear || null : null,
            knownMissingLastRegion:
              person.knownLifeStatus === "missing" ? person.knownMissingLastRegion || null : null,
            deathYear: person.knownLifeStatus === "dead" ? person.deathYear || null : null,
            deathKnownYear: person.deathKnownYear || null,
            knownDeathCause: person.knownDeathCause || null,
            knownLifeHistory: (person.knownLifeHistory || []).map(row => ({ ...row })),
            roleHistory: (person.roleHistory || []).map(row => ({ ...row }))
          })),
          status: s.care.supportNetwork.status,
          fundingStatus: s.care.supportNetwork.fundingStatus,
          contactState: s.care.supportNetwork.contactState,
          knownRegion: s.care.supportNetwork.knownRegion || null,
          knownMoveCount: s.care.supportNetwork.knownMoveCount || 0,
          moveKnownYear: s.care.supportNetwork.moveKnownYear || null,
          knownMoveHistory: (s.care.supportNetwork.knownMoveHistory || []).map(row => ({ ...row })),
          contactHistory: (s.care.supportNetwork.contactHistory || []).map(row => ({ ...row })),
          contributionHistory: (s.care.supportNetwork.contributionHistory || []).map(row => ({ ...row })),
          legacyRepair: [...(s.care.supportNetwork.legacyRepair || [])]
        }
      : null,
    parentWork: Object.fromEntries(
      ["fa", "mo"].map(key => {
        const parent = s.par?.[key];
        return [
          key,
          parent
            ? {
                id: parent.id,
                health: parent.health ?? null,
                workShare: parent.workShare ?? null,
                healthUpdatedYear: parent.healthUpdatedYear ?? null,
                job: parent.j ?? 0,
                knownJobId: parent.knownJobId ?? null,
                jobKnownYear: parent.jobKnownYear ?? null,
                workReviewYear: parent.workReviewYear ?? null,
                jobHistory: parent.jobHistory || [],
                knownJobChangeCount: parent.knownJobChangeCount ?? 0,
                infected: !!parent.inf,
                treatment: !!parent.tx,
                treatmentStartedYear: parent.treatmentStartedYear || null,
                treatmentEndedYear: parent.treatmentEndedYear || null,
                treatmentHistory: parent.treatmentHistory || [],
                unemployed: key === s.parentUnemploymentTargetKey,
                workCapacityHistory: parent.workCapacityHistory || [],
                legacyRepair: parent.legacyRepair || []
              }
            : null
        ];
      })
    ),
    familyCare: s.familyCare
      ? {
          targetKey: s.familyCare.target,
          targetId: s.par?.[s.familyCare.target]?.id || null,
          plan: s.familyCare.plan || "direct",
          startedYear: s.familyCare.startedYear,
          yearsRemaining: s.familyCare.yearsRemaining,
          treatmentSupport: !!s.familyCare.treatmentSupport,
          treatmentPaidTotal: s.familyCare.treatmentPaidTotal || 0,
          siblingContributorId: s.familyCare.siblingContributorId || null,
          siblingContributionPaidYear: s.familyCare.siblingContributionPaidYear ?? null,
          siblingContributionPaidAmount: s.familyCare.siblingContributionPaidAmount || 0,
          siblingContributionPaidTotal: s.familyCare.siblingContributionPaidTotal || 0,
          workIncomeScale: services.familyCareEarningsScale(s, 1)
        }
      : null,
    familyCareHistory: (s.familyCareHistory || []).map(row => ({ ...row })),
    parentHousehold: s.house?.parentLedger
      ? s.house.parentLedger.status === "tracked"
        ? {
            ...s.house.parentLedger,
            residenceRegion: s.house.parentLedger.region,
            cash: s.house.cash,
            debt: s.house.debt,
            income: s.house.inc,
            expense: s.house.exp,
            flow: s.house.flow
              ? {
                  ...s.house.flow,
                  income: { ...(s.house.flow.income || {}) },
                  expense: { ...(s.house.flow.expense || {}) }
                }
              : null
          }
        : {
            status: s.house.parentLedger.status,
            residenceRegion: null,
            history: [],
            legacyRepair: s.house.parentLedger.legacyRepair || []
          }
      : null
  };
}
