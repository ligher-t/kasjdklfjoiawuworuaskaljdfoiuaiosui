// js/social/infection-awareness.js: person, audience, source and certainty for oripathy disclosure.
const INFECTION_AWARENESS_AUDIENCES = Object.freeze([
  "protagonist",
  "subject",
  "household",
  "family",
  "friend",
  "employer",
  "workplace",
  "school-contact",
  "school",
  "medical-service",
  "clinic-waiting-room",
  "support-service",
  "housing-management",
  "organization",
  "local-authority",
  "residents",
  "community-meeting",
  "community",
  "public"
]);
const INFECTION_AWARENESS_CERTAINTY = Object.freeze(["confirmed", "suspected", "unverified", "published"]);
const INFECTION_AWARENESS_SOURCES = Object.freeze([
  "self-disclosure",
  "workplace-disclosure",
  "family-disclosure",
  "medical-consultation",
  "support-referral",
  "relative-disclosure",
  "unattributed-rumor",
  "reported-leak",
  "direct-question",
  "self-publication",
  "official-notice",
  "official-search"
]);
function infectionAwarenessEntries(s) {
  return Array.isArray(s?.infectionAwareness?.entries) ? s.infectionAwareness.entries : [];
}
function infectionAwarenessStore(s) {
  if (!s || typeof s !== "object") throw new Error("感染認知を記録する人生状態がありません");
  if (!s.infectionAwareness) s.infectionAwareness = { version: 1, entries: [] };
  const store = s.infectionAwareness;
  if (store.version !== 1 || !Array.isArray(store.entries))
    throw new Error("感染認知台帳の形式が不正です");
  return store;
}
function recordInfectionAwareness(s, input) {
  const allowedConsent = ["voluntary", "nonconsensual", "unclear"],
    item = {
      year: s.year,
      subject: input.subject,
      subjectId: input.subjectId || null,
      audience: input.audience,
      certainty: input.certainty,
      source: input.source,
      consent: input.consent,
      subjectMatch: input.subjectMatch || (input.certainty === "confirmed" ? "confirmed" : "unclear"),
      recipientId: input.recipientId || null,
      recipientRef: input.recipientRef === "current-school"
        ? (typeof educationInstitutionRef === "function" ? educationInstitutionRef(s) : null)
        : input.recipientRef || null,
      region: s.res?.n || null,
      placeId: s.local?.placeId || null,
      areaKey: s.community?.key || null,
      sourceEventId: input.sourceEventId || TRACE_RESOLUTION?.id || null
    };
  if (
    !["protagonist", "relative"].includes(item.subject) ||
    (item.subject === "relative" && !item.subjectId) ||
    !INFECTION_AWARENESS_AUDIENCES.includes(item.audience) ||
    !INFECTION_AWARENESS_CERTAINTY.includes(item.certainty) ||
    !INFECTION_AWARENESS_SOURCES.includes(item.source) ||
    !allowedConsent.includes(item.consent) ||
    !["confirmed", "unclear"].includes(item.subjectMatch) ||
    (item.recipientId && typeof item.recipientId !== "string") ||
    (item.recipientRef && typeof item.recipientRef !== "string") ||
    (item.sourceEventId && typeof item.sourceEventId !== "string")
  )
    throw new Error("感染認知の対象・範囲・根拠が不正です");
  if (item.source === "unattributed-rumor" && (item.certainty !== "unverified" || item.subjectMatch !== "unclear"))
    throw new Error("出所不明の噂を本人の診断確認として記録できません");
  if (item.source === "direct-question" && item.certainty !== "suspected")
    throw new Error("問いかけだけで診断確認を記録できません");
  if (item.source === "self-publication" && (item.audience !== "public" || item.certainty !== "published"))
    throw new Error("公開掲示は受け手の確認と分けて記録してください");
  if (item.subject === "protagonist" && (!s.inf || !s.fl?.dg))
    throw new Error("本人の感染診断がないため周囲の認知を記録できません");
  const store = infectionAwarenessStore(s),
    duplicate = store.entries.find(
      row =>
        row.year === item.year &&
        row.subject === item.subject &&
        row.subjectId === item.subjectId &&
        row.audience === item.audience &&
        row.source === item.source &&
        row.sourceEventId === item.sourceEventId &&
        row.recipientId === item.recipientId &&
        row.recipientRef === item.recipientRef
    );
  if (duplicate) return duplicate;
  store.entries.push(item);
  if (store.entries.length > 80) store.entries.splice(0, store.entries.length - 80);
  return item;
}
function infectionAwarenessTarget(s, subject) {
  if (subject === "self" || subject === "protagonist") return { subject: "protagonist", subjectId: null, infected: !!s.inf && !!s.fl?.dg };
  const person =
    subject === "spouse"
      ? s.sp ||
        [...(s.relationshipHistory || [])]
          .reverse()
          .find(x => x?.inf && x.endedYear === s.year && x.ending === "離婚")
      : subject === "parent"
        ? [s.par?.fa, s.par?.mo].find(x => x?.id === s.eventRelativeId)
        : subject === "sibling"
          ? (s.siblings || []).find(x => x?.id === s.eventRelativeId)
          : subject === "child"
            ? (s.kids || []).find(x => x?.id === s.eventRelativeId)
            : subject === "friend"
              ? s.friendContact
              : null;
  if (!person || !person.inf) throw new Error("感染認知を記録する対象家族の診断を確認できません");
  return { subject: "relative", subjectId: person.id, infected: true };
}
function recordInfectionAwarenessAction(s, action) {
  if (!action || typeof action !== "object") throw new Error("感染認知の行動記録が不正です");
  const target = infectionAwarenessTarget(s, action.subject || "self");
  if (!target.infected) throw new Error("感染認知を記録する診断がありません");
  return recordInfectionAwareness(s, {
    ...action,
    ...target,
    // A disclosure to one school does not automatically notify a new school
    // after relocation or transfer. The actual facility is the recipient.
    recipientRef: action.audience === "school" && !action.recipientRef &&
      typeof activeFacility === "function"
      ? (typeof educationInstitutionRef === "function" ? educationInstitutionRef(s) : null)
      : action.recipientRef || null,
    sourceEventId: TRACE_RESOLUTION?.id || null
  });
}
function recordInfectionAwarenessActions(s, actions) {
  if (!Array.isArray(actions) || actions.length < 1 || actions.length > 8)
    throw new Error("感染認知の複数範囲記録が不正です");
  return actions.map(action => recordInfectionAwarenessAction(s, action));
}
function recordCloseInfectionDisclosure(s, kind, person) {
  const audience = kind === "friend" ? "friend" : closeInfoPerson(s, kind) &&
    ((kind === "spouse" && spouseLivesWithProtagonist(s)) || inSharedHousehold(s))
      ? "household"
      : "family";
  return recordInfectionAwareness(s, {
    subject: "protagonist",
    audience,
    certainty: "confirmed",
    source: "self-disclosure",
    consent: "voluntary",
    recipientId: person.id,
    sourceEventId: TRACE_RESOLUTION?.id || null
  });
}
function infectionAwarenessHas(
  s,
  audience,
  { subject = "protagonist", subjectId = null, currentPlace = false, includePublication = false, includeUnverified = false } = {}
) {
  return infectionAwarenessEntries(s).some(
    row => {
      const samePlace =
        row.region === s.res?.n &&
        (!row.placeId || row.placeId === s.local?.placeId) &&
        (!row.areaKey || row.areaKey === s.community?.key);
      return (
        row.subject === subject &&
        (subject !== "relative" || row.subjectId === subjectId) &&
        row.audience === audience &&
        ((row.certainty === "confirmed" && row.subjectMatch === "confirmed") ||
          (includeUnverified && ["suspected", "unverified"].includes(row.certainty)) ||
          (includePublication && row.certainty === "published")) &&
        (!currentPlace || samePlace)
      );
    }
  );
}
function infectionAwarenessAttitude(s) {
  if ((s?.biasInfected || 0) >= 35) return "exclusionary";
  if ((s?.biasInfected || 0) <= 12 && (s?.age || 0) >= 14) return "protective";
  return "mixed";
}

function institutionalInfectionAudience(s) {
  if(!s.inf || !s.fl?.dg)return null;
  const same=row=>row.subject==='protagonist' && row.certainty==='confirmed' &&
    row.subjectMatch==='confirmed' && row.region===s.res?.n &&
    (!row.placeId || row.placeId===s.local?.placeId) &&
    (!row.areaKey || row.areaKey===s.community?.key);
  const rows=infectionAwarenessEntries(s).filter(same);
  if(rows.some(row=>row.audience==='local-authority'))return 'local-authority';
  if(rows.some(row=>row.audience==='housing-management'))return 'housing-management';
  if(s.job>0 && s.workContract?.status==='active' && rows.some(row=>
      ['employer','workplace'].includes(row.audience) && row.recipientRef===s.workContract.siteId))return 'employer';
  return null;
}
