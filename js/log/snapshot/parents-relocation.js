function traceParentsRelocation(s, lastMove) {
  return {
    moves: (s.moves || []).length,
    lastMove: lastMove
      ? {
          year: lastMove.year,
          from: lastMove.from,
          to: lastMove.to,
          fromHome: lastMove.fromHome,
          toHome: lastMove.toHome,
          routeFare: lastMove.routeFare,
          fareCovered: !!lastMove.fareCovered,
          local: !!lastMove.local
        }
      : null,
    care: s.care?.kind || null,
    parents: {
      fa: s.par?.fa
        ? {
            id: s.par.fa.id,
            name: s.par.fa.nm,
            birthYear: s.par.fa.by,
            age: Number.isFinite(s.par.fa.by) ? Math.max(0, s.year - s.par.fa.by) : null,
            lifeStage: s.par.fa.d ? "死亡" : s.par.fa.lifeStage || null,
            alive: !s.par.fa.d,
            deathYear: s.par.fa.d || 0,
            deathKnownYear: s.par.fa.deathKnownYear || null,
            deathCause: s.par.fa.deathCause || null,
            infected: !!s.par.fa.inf,
            infectionKnown: !!s.par.fa.infectionKnown,
            job: s.par.fa.j || 0,
            legacyRepair: s.par.fa.legacyRepair || []
          }
        : null,
      mo: s.par?.mo
        ? {
            id: s.par.mo.id,
            name: s.par.mo.nm,
            birthYear: s.par.mo.by,
            age: Number.isFinite(s.par.mo.by) ? Math.max(0, s.year - s.par.mo.by) : null,
            lifeStage: s.par.mo.d ? "死亡" : s.par.mo.lifeStage || null,
            alive: !s.par.mo.d,
            deathYear: s.par.mo.d || 0,
            deathKnownYear: s.par.mo.deathKnownYear || null,
            deathCause: s.par.mo.deathCause || null,
            infected: !!s.par.mo.inf,
            infectionKnown: !!s.par.mo.infectionKnown,
            job: s.par.mo.j || 0,
            legacyRepair: s.par.mo.legacyRepair || []
          }
        : null
    },
    untrackedSiblingCount: s.legacySiblingCount || 0
  };
}
