// Ordered trace snapshot entry; original field evaluation and key order are retained.
function traceState(s) {
  const services = LOG_SERVICES;
  const lastMove = s.moves?.[s.moves.length - 1];
  return {
    ...traceIdentityLocation(s, services),
    ...traceCareHouseholds(s, services),
    ...traceSocialLife(s, services),
    ...traceSiblingSupport(s, services),
    ...traceParentsRelocation(s, lastMove),
    ...traceSiblings(s, services),
    ...traceRelationshipsWork(s, services),
    ...tracePersonalHealth(s),
    ...traceSpouse(s, services),
    ...traceChildren(s),
    ...traceHouseholdFinance(s, services),
    ...traceFormerAndFlags(s)
  };
}
