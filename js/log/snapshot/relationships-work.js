function traceRelationshipsWork(s, services) {
  return {
    romance: s.romance ? { ...s.romance } : null,
    relationshipHistory: (s.relationshipHistory || []).map(x => ({
      id: x.id,
      name: x.name || x.nm,
      ending: x.ending,
      metYear: x.metYear || x.marriedYear || null,
      endedYear: x.endedYear,
      infected: !!x.inf,
      disclosureBoundary: x.disclosureBoundary || null,
      disclosureBoundaryHistory: x.disclosureBoundaryHistory || [],
      parentingPlan: x.parentingPlan || null,
      parentingReviewPending: !!x.parentingReviewPending,
      parentingReviewYear: x.parentingReviewYear ?? null,
      parentingHistory: x.parentingHistory || [],
      deathYear: x.deathYear || null,
      deathKnownYear: x.deathKnownYear || null,
      deathCause: x.deathCause || null,
      deathNoticeAvailableYear: x.deathNoticeAvailableYear ?? null,
      deathNoticeChannel: x.deathNoticeChannel || null,
      deathNoticeHistory: (x.deathNoticeHistory || []).map(row => ({ ...row })),
      legacyRepair: x.legacyRepair || []
    })),
    job: services.occupationLabel(s),
    workPayBonus: s.workPayBonus || 0,
    ...(s.workContract?.assignment === "adjusted" ? { workContractAssignment: "adjusted" } : {}),
    ...(s.infectionWorkplace ? { infectionWorkplace: { ...s.infectionWorkplace } } : {}),
    education: services.EL[services.eduLv(s)],
    study: s.study ? { ...s.study } : null,
    educationCourse: s.educationPath ? {
      stage:s.educationPath.stage || null,tier:s.educationPath.tier || null,
      mode:s.educationPath.mode || null,status:s.educationPath.status,
      startedYear:s.educationPath.startedYear || null,
      stageStartYear:s.educationPath.stageStartYear || null,
      yearsCompleted:s.educationPath.yearsCompleted ?? null,
      duration:s.educationPath.duration || null,
      completed:[...(s.educationPath.completed||[])],
      equivalency:[...(s.educationPath.equivalency||[])],
      recentHistory:(s.educationPath.history||[]).slice(-3).map(x=>({...x}))
    }:null,
    educationAwards:(s.educationRecord?.awards||[]).slice(-6).map(x=>({...x})),
    socialContacts: [s.friendContact, s.neighborContact].filter(Boolean).map(x => ({
      id: x.id,
      kind: x.kind,
      name: x.nm,
      birthYear: x.by,
      age: Math.max(
        0,
        (x.knownLifeStatus === "dead" ? (x.deathYear ?? s.year) : s.year) - (x.by ?? x.metYear ?? s.year)
      ),
      race: x.r?.n || null,
      region: x.knownLifeStatus === "missing" ? x.knownMissingLastRegion || null : x.region,
      home: x.home,
      localKind: x.localKind,
      metYear: x.metYear,
      status:
        x.lifeStatus === "missing" && x.knownLifeStatus !== "missing"
          ? x.kind === "friend"
            ? "acquaintance"
            : "familiar"
          : x.status,
      lifeStatus: x.knownLifeStatus || "unrecorded",
      lifeStatusKnownYear: x.knownLifeStatusYear || null,
      missingSinceYear: x.knownLifeStatus === "missing" ? x.knownMissingSinceYear || null : null,
      missingLastRegion: x.knownLifeStatus === "missing" ? x.knownMissingLastRegion || null : null,
      deathYear: x.knownLifeStatus === "dead" ? x.deathYear || null : null,
      deathKnownYear: x.knownLifeStatus === "dead" ? x.deathKnownYear || null : null,
      deathCause: x.knownLifeStatus === "dead" ? x.deathCause || null : null,
      knownLifeHistory: (x.knownLifeHistory || []).map(row => ({ ...row })),
      recontactIntent: x.recontactIntent || "none",
      knownRecontactStatus: x.knownRecontactStatus || "none",
      recontactAttemptCount: x.recontactAttemptCount || 0,
      loanAmount: x.loanAmount || 0,
      loanYear: x.loanYear || null,
      lastMutualAidYear: x.lastMutualAidYear || null
    }))
  };
}
