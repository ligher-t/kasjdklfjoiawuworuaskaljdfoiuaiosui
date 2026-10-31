function traceFormerAndFlags(s) {
  return {
    formerSpouses: (s.relationshipHistory || [])
      .filter(person => person.ending === "離婚")
      .map(person => ({
        id: person.id,
        name: person.nm || person.name,
        birthYear: person.by,
        age: Number.isFinite(person.by) ? Math.max(0, s.year - person.by) : null,
        lifeStatus: person.lifeStatus || "untracked",
        actualResidenceRegion: person.residenceRegion || null,
        knownResidenceRegion: person.knownResidenceRegion || null,
        moveCount: person.moveCount || 0,
        knownMoveCount: person.knownMoveCount || 0,
        independentMoveReviewYear: person.independentMoveReviewYear ?? null,
        residenceMoveNotice: person.residenceMoveNotice ? { ...person.residenceMoveNotice } : null,
        moveHistory: (person.moveHistory || []).map(row => ({ ...row })),
        moveNoticeHistory: (person.moveNoticeHistory || []).map(row => ({ ...row })),
        actualDeathYear: person.actualDeathYear ?? null,
        actualDeathCause: person.actualDeathCause || null,
        mortalityCheckedYear: person.mortalityCheckedYear ?? null,
        deathNoticePending: !!person.deathNoticePending,
        deathNoticeAvailableYear: person.deathNoticeAvailableYear ?? null,
        deathNoticeChannel: person.deathNoticeChannel || null,
        deathYear: person.deathYear ?? null,
        deathKnownYear: person.deathKnownYear ?? null,
        deathCause: person.deathCause || null,
        deathNoticeAvailableYear: person.deathNoticeAvailableYear ?? null,
        deathNoticeChannel: person.deathNoticeChannel || null,
        deathNoticeHistory: (person.deathNoticeHistory || []).map(row => ({ ...row })),
        sharedLivingChildren: (s.kids || [])
          .filter(child => !child.d && child.otherParentId === person.id)
          .map(child => child.id)
      })),
    flags: Object.keys(s.fl || {}).filter(k => s.fl[k]),
    knownEvents: Object.keys(s.known || {}).filter(k => s.known[k]),
    informationResponses: (s.informationResponses || []).map(row => ({ ...row })),
    informationClaims: (s.informationClaims || []).map(row => JSON.parse(JSON.stringify(row))),
    dead: !!s.dead
  };
}
