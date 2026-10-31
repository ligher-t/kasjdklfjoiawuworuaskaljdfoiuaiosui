const moveDestinations = s =>
  (MIGRATION_ROUTES[s.res.n] || [])
    .filter(x => x.n !== s.res.n && REG.some(r => r.n === x.n))
    .map(route => ({ ...route, fare: Math.round(route.fare * localityTravelMultiplier(s)) }));
const householdEndAge = s =>
  Number.isFinite(s.householdExitAge) ? s.householdExitAge : P("life.childHouseholdEndAge");
const inSharedHousehold = s => {
  const arrangement = s.residenceArrangement;
  if (!arrangement || arrangement === "legacy_unknown")
    return !s.fl?.household_separated && s.age < householdEndAge(s);
  return !s.fl?.household_separated && arrangement === "family_home_shared_budget";
};
const moveFunds = s => (inSharedHousehold(s) ? s.house?.cash || 0 : s.cash);
const moveFare = s => {
  const r = moveDestinations(s);
  return r.length ? Math.min(...r.map(x => x.fare)) * s.res.pm : Infinity;
};
const siblingsOf = s => (Array.isArray(s.siblings) ? s.siblings : []);
const familyDailySiblingCandidates = s =>
  siblingsOf(s)
    .filter(
      person =>
        !person.d &&
        person.contactState !== "ended" &&
        (!person.independentSinceYear ||
          (person.contactState === "regular" &&
            person.knownRegion === s.res.n &&
            (person.moveHistory?.length || 0) <= (person.knownMoveCount || 0)))
    )
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
const familyDailySiblingTarget = s => pick(familyDailySiblingCandidates(s)) || null;
const familyDailyCandidates = s => {
  const rows = familyDailySiblingCandidates(s).map(person => ({ person, kind: "sibling" }));
  if (s.sp && !s.sp.d && spouseLivesWithProtagonist(s)) rows.push({ person: s.sp, kind: "spouse" });
  for (const person of s.kids || []) {
    const plan = person.householdResidencePlan,
      former = formerSpouseForChild(s, person);
    if (
      !person.d &&
      person.householdStatus !== "independent" &&
      childIsSupported(s, person) &&
      (!former || plan === "self" || plan === "shared") &&
      plan !== "former" &&
      plan !== "former_support" &&
      plan !== "unresolved"
    )
      rows.push({ person, kind: "child" });
  }
  if (inSharedHousehold(s)) {
    const parentKeys = s.care?.parentKeys || ["fa", "mo"];
    for (const key of parentKeys) {
      const person = s.par?.[key];
      if (person && !person.d) rows.push({ person, kind: "parent" });
    }
  }
  return rows
    .filter(row => row.person?.id && row.person?.nm)
    .sort((a, b) => String(a.person.id).localeCompare(String(b.person.id)) || a.kind.localeCompare(b.kind));
};
const familyDailyTarget = s => pick(familyDailyCandidates(s)) || null;
const familyDailyTargetById = (s, id = s.eventRelativeId) =>
  familyDailyCandidates(s).find(row => row.person.id === id) || null;
