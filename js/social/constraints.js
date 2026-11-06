// Social-constraint scene context and outcome records.
// Eligibility is read-only; persistent records are created only after a choice resolves.
const SOCIAL_CONSTRAINT_ACTIONS = Object.freeze([
  "record-response",
  "record-inquiry",
  "record-refusal",
  "record-help",
  "record-bias",
  "record-obligation",
  "update-episode",
  "close-episode"
]);
const SOCIAL_CONSTRAINT_RECORD_LIMIT = 256;

function isValidSocialConstraintState(value) {
  if (value == null) return true;
  if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== 1 ||
      !Array.isArray(value.episodes) || value.episodes.length > SOCIAL_CONSTRAINT_RECORD_LIMIT ||
      !Number.isInteger(value.nextId) || value.nextId < 1 ||
      !Number.isInteger(value.recordCount) || value.recordCount < value.episodes.length) return false;
  const resolutions = new Set();
  return value.episodes.every(row => {
    if (!row || typeof row !== "object" || Array.isArray(row) ||
        typeof row.id !== "string" || row.id.length > 64 ||
        typeof row.resolutionKey !== "string" || !row.resolutionKey || row.resolutionKey.length > 512 ||
        resolutions.has(row.resolutionKey) ||
        typeof row.episodeKey !== "string" || !row.episodeKey || row.episodeKey.length > 100 ||
        typeof row.eventId !== "string" || !row.eventId || row.eventId.length > 128 ||
        !Number.isInteger(row.year) || !Number.isInteger(row.month) || row.month < 1 || row.month > 12 ||
        !Number.isInteger(row.age) || row.age < 0 || row.age > 150 ||
        !Number.isInteger(row.choiceIndex) || row.choiceIndex < 0 ||
        !Number.isInteger(row.outcomeIndex) || row.outcomeIndex < 0 ||
        !SOCIAL_CONSTRAINT_ACTIONS.includes(row.action) ||
        !["kind", "target", "status", "subjectKind"].every(key =>
          typeof row[key] === "string" && row[key].length > 0 && row[key].length <= 100
        ) ||
        !["actorPersonId", "subjectPersonId", "sceneId", "region", "localityKey", "placeId", "sceneKind", "knowledgeBasis"]
          .every(key => row[key] == null || typeof row[key] === "string" && row[key].length <= 200) ||
        !Array.isArray(row.memoryTags) || row.memoryTags.length > 12 ||
        row.memoryTags.some(tag => typeof tag !== "string" || tag.length > 80)) return false;
    resolutions.add(row.resolutionKey);
    return true;
  });
}

function socialConstraintCurrentAffiliation(s, ids) {
  const allowed = new Set(Array.isArray(ids) ? ids : [ids]);
  return (s?.lifeRecord?.affiliations || []).find(row => {
    if (!allowed.has(row.id) || !["active", "crisis", "suspended"].includes(row.status)) return false;
    const posting = row.posting;
    return posting
      ? posting.region === s.res?.n && posting.localityKey === s.community?.key
      : s.residenceBase?.affiliationId === row.id;
  }) || null;
}

function readSocialSceneContext(s, event = null) {
  if (!s || typeof s !== "object") return null;
  const affiliations = s.lifeRecord?.affiliations || [],
    activeAtPlace = row => ["active", "crisis", "suspended"].includes(row?.status) &&
      (row.posting
        ? row.posting.region === s.res?.n && row.posting.localityKey === s.community?.key
        : s.residenceBase?.affiliationId === row.id),
    rhodesInterior = typeof isRhodesLandshipResident === "function" && isRhodesLandshipResident(s),
    rhodesBranch = affiliations.some(row => row.id === "rhodes-staff" &&
      ["active", "crisis", "suspended"].includes(row.status) && row.posting?.kind === "branch" && activeAtPlace(row)) ||
      affiliations.some(row => row.id === "rhodes-care" && ["active", "crisis"].includes(row.status) &&
        row.appointment?.region === s.res?.n && row.appointment?.localityKey === s.community?.key),
    reunionBase = ["reunion-1096", "reunion-reorg"].includes(s.residenceBase?.affiliationId) &&
      affiliations.some(row => row.id === s.residenceBase.affiliationId && activeAtPlace(row)),
    reunionPosting = affiliations.some(row => ["reunion-1096", "reunion-reorg"].includes(row.id) &&
      activeAtPlace(row) && row.posting),
    mutualAid = socialConstraintCurrentAffiliation(s, ["infected-mutual-aid", "local-mutual-aid"]),
    samiCommunity = s.res?.n === "サーミ" && affiliations.some(row =>
      /sami|clan|community/i.test(String(row.id)) && activeAtPlace(row)
    ),
    employment = typeof currentPlayerEmployment === "function" ? currentPlayerEmployment(s) : null,
    enrollment = typeof educationActiveEnrollment === "function" ? educationActiveEnrollment(s) : null,
    interior = rhodesInterior ? "rhodes" : rhodesBranch ? "rhodes-branch" : reunionBase || reunionPosting ? "reunion" : mutualAid ? "infected-mutual-aid" :
      samiCommunity ? "sami-community" : null;
  return {
    year: s.year,
    month: s.mo,
    region: s.res?.n || null,
    localityKey: s.community?.key || null,
    localKind: s.local?.kind || null,
    placeId: s.local?.placeId || null,
    sceneKind: event?.socialConstraint?.sceneBinding || null,
    sceneOwnerId: employment?.siteId || enrollment?.offeringId || s.residenceBase?.id || null,
    actorPersonId: null,
    subjectPersonId: null,
    subjectKind: event?.socialConstraint?.subjectKind || "scene-person",
    knowledgeBasis: event?.socialConstraint?.knowledgeBasis || null,
    domain: event?.socialConstraint?.domain || null,
    target: event?.socialConstraint?.target || null,
    interior,
    employmentSiteId: employment?.siteId || null,
    educationOfferingId: enrollment?.offeringId || null
  };
}

function socialConstraintHasHouseholdScene(s) {
  return !!(s?.house && (s.house.members?.length || s.par?.fa || s.par?.mo || s.sp || s.kids?.length));
}

function socialConstraintEmploymentEpisode(s, meta = {}) {
  const episode = typeof currentPlayerEmployment === "function" ? currentPlayerEmployment(s) : null;
  if (!episode || travelPresence(s).mode !== "residence" || restricted(s)) return null;
  if (Array.isArray(meta.workJobIds) && meta.workJobIds.length &&
      !meta.workJobIds.includes(episode.jobId)) return null;
  if (episode.kind === "wage-employment") {
    const areaId = typeof occupationWorkAreaKey === "function" ? occupationWorkAreaKey(s) : null,
      site = s.world?.occupationWorld?.sites?.[episode.siteId];
    if (!areaId || episode.areaId !== areaId || !site || site.areaId !== episode.areaId ||
        !["open", "strained"].includes(site.status)) return null;
  } else if (episode.region !== s.res?.n || episode.localityKey !== s.community?.key) return null;
  return episode;
}

function socialConstraintEnrollment(s, meta = {}, scene = null) {
  if (s.educationPath?.status !== "enrolled" || travelPresence(s).mode !== "residence" || restricted(s) ||
      typeof educationActiveEnrollment !== "function") return null;
  const enrollment = educationActiveEnrollment(s), world = s.world?.educationWorld,
    record = s.educationRecord?.enrollments?.find(row => row.id === enrollment?.id),
    offering = world?.offerings?.[enrollment?.offeringId],
    campus = world?.campuses?.[offering?.campusId],
    area = world?.areas?.[campus?.educationAreaId];
  if (!enrollment || record?.status !== "enrolled" || !offering || !campus || !area ||
      !s.local?.educationAreaId || campus.educationAreaId !== s.local.educationAreaId ||
      area.regionKey !== (scene?.region || s.res?.n)) return null;
  if (Array.isArray(meta.educationStages) && meta.educationStages.length &&
      !meta.educationStages.includes(offering.stage)) return null;
  return { enrollment, offering, institutionId: offering.institutionId };
}

function socialConstraintEducationIntent(s, meta = {}) {
  const item = typeof educationActiveCase === "function" ? educationActiveCase(s) : null;
  if (!item || item.status !== "active" || !["intent", "planning"].includes(item.phase)) return false;
  return !Array.isArray(meta.educationStages) || !meta.educationStages.length ||
    meta.educationStages.includes(item.stage);
}

function socialConstraintMarketStreet(s) {
  if (travelPresence(s).mode !== "residence" || restricted(s)) return false;
  const localKind = String(s.local?.kind || "");
  return !!s.local?.city || /市場|商業|中心|街区/.test(localKind);
}

function socialConstraintKnowledgeRecipients(s, meta = {}, scene = null) {
  if (meta.knowledgeRecipientBinding === "current-workplace") {
    const episode = socialConstraintEmploymentEpisode(s, {});
    return episode ? new Set([episode.siteId, episode.employerId].filter(Boolean)) : null;
  }
  if (meta.knowledgeRecipientBinding === "current-school") {
    const school = socialConstraintEnrollment(s, {}, scene);
    return school ? new Set([school.institutionId].filter(Boolean)) : null;
  }
  if (meta.knowledgeRecipientBinding === "specified") {
    return new Set([meta.knowledgeRecipientId, meta.knowledgeRecipientRef].filter(Boolean));
  }
  return null;
}

function socialConstraintHasProtagonistKnowledge(s, meta, scene) {
  if (!meta.requiresPlayerDiagnosis) return true;
  if (!s?.inf || !s.fl?.dg || typeof infectionAwarenessEntries !== "function") return false;
  const expectedRecipients = socialConstraintKnowledgeRecipients(s, meta, scene);
  if (!expectedRecipients?.size || !scene?.placeId || !scene?.localityKey) return false;
  const allowedAudience = new Set(Array.isArray(meta.knowledgeAudiences) ? meta.knowledgeAudiences : []);
  return infectionAwarenessEntries(s).some(row => {
    const sameRecipient = expectedRecipients.has(row.recipientId) || expectedRecipients.has(row.recipientRef);
    return row.subject === "protagonist" && row.certainty === "confirmed" && row.subjectMatch === "confirmed" &&
      row.region === scene.region && row.placeId === scene.placeId && row.areaKey === scene.localityKey &&
      allowedAudience.has(row.audience) && sameRecipient;
  });
}

function socialConstraintMotifAlreadyRecorded(s, meta, scene) {
  if (!meta?.episodeKey) return false;
  return readSocialConstraintEpisodes(s).some(row =>
    row.episodeKey === meta.episodeKey && row.year === s.year &&
    row.region === scene.region && row.localityKey === scene.localityKey
  );
}

function socialConstraintSceneEligible(event, s) {
  const meta = event?.socialConstraint;
  if (!meta) return true;
  if (!s || s.dead || !s.res?.n || !s.community?.key) return false;
  const scene = readSocialSceneContext(s, event),
    binding = meta.sceneBinding || "unverified",
    infectedTarget = /感染者|鉱石病/.test(String(meta.target || ""));
  if (meta.ageRange && (!Number.isFinite(s.age) ||
      (Number.isFinite(meta.ageRange.min) && s.age < meta.ageRange.min) ||
      (Number.isFinite(meta.ageRange.max) && s.age > meta.ageRange.max))) return false;
  if (Number.isInteger(meta.minYear) && (!Number.isInteger(s.year) || s.year < meta.minYear)) return false;
  if (Array.isArray(meta.regions) && meta.regions.length && !meta.regions.includes(scene.region)) return false;
  if (socialConstraintMotifAlreadyRecorded(s, meta, scene)) return false;
  if (meta.protectedInteriorMask && infectedTarget &&
      ["rhodes", "rhodes-branch", "reunion", "infected-mutual-aid", "sami-community"].includes(scene.interior))
    return false;
  if (meta.externalSettingRequired && scene.interior) return false;
  if (!socialConstraintHasProtagonistKnowledge(s, meta, scene)) return false;
  if (meta.requiresProtagonistSarkaz && !tags(s).includes("種族:サルカズ")) return false;
  if (meta.requiresProtagonistOni && !tags(s).includes("種族:鬼")) return false;
  if (meta.requiresProtagonistDurin && !tags(s).includes("種族:ドゥリン")) return false;
  if (meta.requiresProtagonistLiberi && !tags(s).includes("種族:リーベリ")) return false;
  if (meta.requiresCurrentEmployment && !socialConstraintEmploymentEpisode(s, meta)) return false;
  if (meta.requiresActiveEducation && !socialConstraintEnrollment(s, meta, scene)) return false;
  if (meta.requiresEducationIntent && !socialConstraintEducationIntent(s, meta)) return false;
  if (meta.requiresHouseholdScene && !socialConstraintHasHouseholdScene(s)) return false;
  if (meta.requiresRhodesBranch && scene.interior !== "rhodes-branch") return false;
  if (meta.requiresReunionBase &&
      !(scene.interior === "reunion" && ["reunion-1096", "reunion-reorg"].includes(s.residenceBase?.affiliationId))) return false;
  if (meta.requiresReunionMobileTeam &&
      !(s.lifeRecord?.affiliations || []).some(row => ["reunion-1096", "reunion-reorg"].includes(row.id) &&
        ["active", "crisis", "suspended"].includes(row.status) && row.posting?.kind === "移動隊" &&
        row.posting.region === scene.region && row.posting.localityKey === scene.localityKey)) return false;
  if (meta.requiresSamiCommunity && scene.interior !== "sami-community") return false;
  if (meta.held === true) return false;
  switch (binding) {
    case "legacy-event-eligibility":
      // Preserve the owning event's existing need/ban/show conditions.
      return true;
    case "ambient":
    case "session":
      return travelPresence(s).mode === "residence" && !restricted(s);
    case "current-home":
    case "actual-family-home":
      return travelPresence(s).mode === "residence" && socialConstraintHasHouseholdScene(s);
    case "current-residence":
      return travelPresence(s).mode === "residence";
    case "current-worksite":
      return !!socialConstraintEmploymentEpisode(s, meta);
    case "current-education":
    case "actual-school":
      return !!socialConstraintEnrollment(s, meta, scene);
    case "market-street":
      return socialConstraintMarketStreet(s);
    case "worksite-or-visit":
    case "actual-merchant-worksite":
    case "actual-boarding-school":
    case "education-interview":
    case "actual-education-offer":
    case "actual-meeting":
    case "festival-family":
    case "verified-festival":
    case "current-meeting":
    case "correspondence":
    case "actual-checkpoint":
    // Specific legal, research, property, patronage and archival scenes need
    // domain-owned provenance. These bindings also need a scene/actor record;
    // a related affiliation or an active journey alone does not prove the scene.
    default:
      return false;
  }
}

function socialConstraintState(s, create = false) {
  if (!s || typeof s !== "object") throw new Error("社会的制約を記録する人生状態がありません");
  if (!s.socialConstraints && !create) return null;
  if (!s.socialConstraints) {
    s.socialConstraints = { version: 1, episodes: [], nextId: 1, recordCount: 0 };
  }
  const model = s.socialConstraints;
  if (model.version !== 1 || !Array.isArray(model.episodes) ||
      model.episodes.length > SOCIAL_CONSTRAINT_RECORD_LIMIT ||
      !Number.isInteger(model.nextId) || model.nextId < 1 ||
      !Number.isInteger(model.recordCount) || model.recordCount < 0)
    throw new Error("社会的制約の記録形式が不正です");
  return model;
}

function readSocialConstraintEpisodes(s) {
  const model = socialConstraintState(s, false);
  return model ? model.episodes : [];
}

function applySocialConstraintAction(s, input) {
  if (!input || typeof input !== "object" || !SOCIAL_CONSTRAINT_ACTIONS.includes(input.action))
    throw new Error("社会的制約の結果記録が不正です");
  const resolution = TRACE_RESOLUTION;
  if (resolution?.kind !== "choice" || !Number.isInteger(resolution.choiceIndex) ||
      !Number.isInteger(resolution.outcomeIndex) || typeof resolution.id !== "string")
    throw new Error("社会的制約は解決済みの選択結果からのみ記録できます");
  const model = socialConstraintState(s, true), scene = resolution.socialScene || {},
    key = [resolution.id, s.year, s.mo, resolution.choiceIndex, resolution.outcomeIndex,
      scene.actorPersonId || "", scene.subjectPersonId || ""].join("|"),
    existing = model.episodes.find(row => row.resolutionKey === key);
  if (existing) return existing;
  const tags = Array.isArray(input.memoryTags)
    ? [...new Set(input.memoryTags.filter(value => typeof value === "string").map(value => value.slice(0, 80)))].slice(0, 12)
    : [],
    entry = {
      id: `social-${s.year}-${model.nextId++}`,
      resolutionKey: key,
      episodeKey: String(input.episodeKey || resolution.id).slice(0, 100),
      eventId: resolution.id,
      year: s.year,
      month: s.mo,
      age: s.age,
      choiceIndex: resolution.choiceIndex,
      outcomeIndex: resolution.outcomeIndex,
      action: input.action,
      kind: String(input.kind || "social-response").slice(0, 100),
      target: String(input.target || scene.target || "unspecified").slice(0, 80),
      status: String(input.status || input.action).slice(0, 60),
      subjectKind: String(input.subjectKind || scene.subjectKind || "scene-person").slice(0, 60),
      actorPersonId: scene.actorPersonId || null,
      subjectPersonId: scene.subjectPersonId || null,
      sceneId: scene.sceneId || null,
      region: scene.region || s.res?.n || null,
      localityKey: scene.localityKey || s.community?.key || null,
      placeId: scene.placeId || s.local?.placeId || null,
      sceneKind: scene.sceneKind || null,
      knowledgeBasis: scene.knowledgeBasis || null,
      memoryTags: tags
    };
  if (input.action === "update-episode" || input.action === "close-episode") {
    const prior = model.episodes.find(row => row.episodeKey === entry.episodeKey && row.status !== "closed");
    if (!prior) return null;
    prior.status = input.action === "close-episode" ? "closed" : entry.status;
    prior.updatedYear = s.year;
    prior.lastResolutionKey = key;
    prior.memoryTags = [...new Set([...(prior.memoryTags || []), ...tags])].slice(-12);
    model.recordCount++;
    return prior;
  }
  model.episodes.push(entry);
  model.recordCount++;
  if (model.episodes.length > SOCIAL_CONSTRAINT_RECORD_LIMIT) {
    const trim = model.episodes.findIndex(row => row.status === "closed");
    if (trim >= 0) model.episodes.splice(trim, 1);
    else model.episodes.splice(0, model.episodes.length - SOCIAL_CONSTRAINT_RECORD_LIMIT);
  }
  return entry;
}
