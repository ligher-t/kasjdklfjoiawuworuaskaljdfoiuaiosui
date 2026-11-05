// Derived from docs/employment/EMPLOYER_PLAYER_ACCESS_POLICY_66_20261105.json.
// This is a policy boundary for new player employment, not a source about actual vacancies.
const EMPLOYER_PLAYER_ACCESS_MODES = Object.freeze({
  "rhodes-island": "SPECIAL",
  "blacksteel-worldwide": "SPECIAL",
  "rhine-lab": "SPECIAL",
  "karlan-trade": "SPECIAL",
  "lungmen-guard-department": "SPECIAL",
  "penguin-logistics": "BLOCKED",
  "mountaindash-logistics": "GENERAL",
  "lee-detective-agency": "BLOCKED",
  "kazimierz-arena": "GENERAL",
  "kazimierz-general-chamber": "SPECIAL",
  "kazimierz-corporate-knight-club": "SPECIAL",
  "mieszko-group": "GENERAL",
  "rose-papers-union": "GENERAL",
  "sloma-food-corporation": "GENERAL",
  "ellen-select-technology": "GENERAL",
  "gale-industries": "GENERAL",
  "kazimierz-armorless-union": "CONTACT",
  "rhein-sami-station": "SPECIAL",
  "raythean-industries": "GENERAL",
  "mama-johns": "GENERAL",
  "maylander-foundation": "CONTACT",
  "beachbrella": "GENERAL",
  "volvort-kochinski": "GENERAL",
  "haydn-pharmaceuticals": "SPECIAL",
  "columbia-frontier-program": "GENERAL",
  "laterano-notarial-hall": "SPECIAL",
  "laterano-curia-sixth": "SPECIAL",
  "laterano-cohors": "SPECIAL",
  "laterano-landen-monastery": "SOURCE_HOLD",
  "karlan-rail": "GENERAL",
  "rmia": "CONTACT",
  "rim-billiton-mining-conglomerates": "GENERAL",
  "siesta-city-council": "SPECIAL",
  "siesta-volcanology-center": "SPECIAL",
  "siesta-hot-springs-hotel": "GENERAL",
  "mountaincomm-trade": "SPECIAL",
  "scwire-group": "GENERAL",
  "iberian-inquisition-and-coastal-sites": "SPECIAL",
  "sargon-acahualla-community": "COMMUNITY",
  "sargon-padishah-palace": "SPECIAL",
  "sami-tribes": "COMMUNITY",
  "kazdel-military-commission": "SPECIAL",
  "babel-historical": "HISTORICAL",
  "higashi-household-retainers": "SPECIAL",
  "higashi-cyberninja-scenario": "SOURCE_HOLD",
  "higashi-touhou-heavy-scenario": "SOURCE_HOLD",
  "higashi-religious-institution": "SPECIAL",
  "ursus-imperial-forces": "SPECIAL",
  "ursus-science-academy-scenario": "SOURCE_HOLD",
  "victoria-military-authorities": "SPECIAL",
  "victoria-legislative-administration": "SPECIAL",
  "victoria-rail-works": "GENERAL",
  "yan-civil-service": "SPECIAL",
  "yan-supervisory-authority": "SOURCE_HOLD",
  "yan-tianshi-office": "SPECIAL",
  "lungmen-underground-brokerage": "CONTACT",
  "leithanien-court": "SPECIAL",
  "leithanien-legal-enforcement-scenario": "SOURCE_HOLD",
  "siracusa-family": "CONTACT",
  "siracusa-volsinii-court": "SPECIAL",
  "dossoles-police": "SPECIAL",
  "bolivar-faction-military": "SPECIAL",
  "kazdel-craft-workshop": "COMMUNITY",
  "kjerag-monastery": "SPECIAL",
  "minos-hero-temple-arena": "SPECIAL",
  "minos-civic-court": "SPECIAL"
});
const EMPLOYER_JOB_ORGANIZATIONS = Object.freeze({
  "28": "rhodes-island",
  "29": "rhodes-island",
  "30": "rhodes-island",
  "31": "rhodes-island",
  "32": "kazimierz-arena",
  "33": "rhodes-island",
  "34": "rhodes-island",
  "35": "blacksteel-worldwide",
  "36": "blacksteel-worldwide",
  "37": "blacksteel-worldwide",
  "38": "rhine-lab",
  "39": "rhine-lab",
  "40": "rhine-lab",
  "41": "yan-civil-service",
  "42": "yan-supervisory-authority",
  "43": "yan-tianshi-office",
  "44": "lungmen-guard-department",
  "45": "lungmen-underground-brokerage",
  "46": "higashi-household-retainers",
  "47": "higashi-household-retainers",
  "48": "higashi-cyberninja-scenario",
  "49": "higashi-religious-institution",
  "50": "higashi-touhou-heavy-scenario",
  "51": "ursus-imperial-forces",
  "52": "ursus-imperial-forces",
  "53": "ursus-science-academy-scenario",
  "54": "victoria-military-authorities",
  "55": "victoria-military-authorities",
  "56": "victoria-legislative-administration",
  "57": "victoria-rail-works",
  "58": "leithanien-legal-enforcement-scenario",
  "59": "leithanien-court",
  "60": "laterano-notarial-hall",
  "61": "laterano-landen-monastery",
  "62": "columbia-frontier-program",
  "63": "kazimierz-corporate-knight-club",
  "64": "kazimierz-armorless-union",
  "65": "siracusa-family",
  "66": "siracusa-volsinii-court",
  "67": "siesta-volcanology-center",
  "68": "sargon-padishah-palace",
  "69": "sargon-acahualla-community",
  "70": "sami-tribes",
  "71": "sami-tribes",
  "72": "karlan-trade",
  "73": "kjerag-monastery",
  "74": "kazdel-military-commission",
  "75": "kazdel-craft-workshop",
  "76": "iberian-inquisition-and-coastal-sites",
  "77": "iberian-inquisition-and-coastal-sites",
  "78": "bolivar-faction-military",
  "79": "dossoles-police",
  "80": "rim-billiton-mining-conglomerates",
  "81": "minos-hero-temple-arena",
  "82": "minos-civic-court"
});

/** A read-only access decision. No application, post, affiliation or salary is created here. */
function assessPlayerEmploymentAccess(s, request = {}) {
  const hasJob = Number.isInteger(request.jobId),
    mappedKey = hasJob ? EMPLOYER_JOB_ORGANIZATIONS[request.jobId] : null,
    requestedKey = request.organizationKey || request.employerOrganizationKey || null;
  if (hasJob && (request.jobId < 0 || request.jobId > 82))
    return { canApply: false, canStart: false, mode: null, reasonCode: "unknown-occupation" };
  if (mappedKey && requestedKey && requestedKey !== mappedKey)
    return { canApply: false, canStart: false, mode: null, reasonCode: "occupation-employer-mismatch" };
  const organizationKey = mappedKey || requestedKey;
  if (!organizationKey)
    return { canApply: true, canStart: false, mode: "GENERIC", reasonCode: null };
  if (!Object.hasOwn(EMPLOYER_PLAYER_ACCESS_MODES, organizationKey))
    return { canApply: false, canStart: false, mode: null, reasonCode: "unregistered-employer" };
  const mode = EMPLOYER_PLAYER_ACCESS_MODES[organizationKey];
  if (mode === "BLOCKED")
    return { canApply: false, canStart: false, mode, reasonCode: "player-employment-prohibited" };
  if (mode === "CONTACT" || mode === "HISTORICAL" || mode === "SOURCE_HOLD")
    return { canApply: false, canStart: false, mode, reasonCode: "non-recruiting-organization" };
  if (mode === "COMMUNITY")
    return { canApply: false, canStart: false, mode, reasonCode: "community-role-not-formal-employment" };
  if (mode === "SPECIAL" && request.specialPath !== true)
    return { canApply: false, canStart: false, mode, reasonCode: "specific-appointment-required" };
  const hasSite = typeof request.siteId === "string" && request.siteId.length > 0,
    hasPosition = typeof request.positionId === "string" && request.positionId.length > 0,
    hasOpening = typeof request.openingId === "string" && request.openingId.length > 0;
  // A real office, selection and commencement are independent of the employer's existence.
  // The caller must validate each ID against the occupationWorld records before committing.
  const canApply = hasSite && hasPosition && hasOpening;
  return {
    canApply,
    canStart: canApply && request.selected === true && request.accepted === true &&
      request.started === true,
    mode,
    reasonCode: canApply ? null : "verified-position-and-opening-required"
  };
}

/** View-only policy for a non-salaried community livelihood, never a formal employer. */
function canRecognizeCommunityWork(s, request = {}) {
  const key = request.organizationKey || EMPLOYER_JOB_ORGANIZATIONS[request.jobId];
  return EMPLOYER_PLAYER_ACCESS_MODES[key] === "COMMUNITY" &&
    !!request.communityRoleId && request.roleAccepted === true;
}
