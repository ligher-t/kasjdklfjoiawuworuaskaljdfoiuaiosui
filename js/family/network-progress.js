function careNetworkInfoRoute(s, destination) {
  if (s.res.n === destination) return { channel: "face_to_face", delayYears: 0, reach: 1 };
  const connected = (MIGRATION_ROUTES[s.res.n] || []).some(route => route.n === destination);
  return connected
    ? {
        channel: "family_letter_or_travelling_relative",
        delayYears: 1,
        reach: P("family.careNetworkMoveLetterReach")
      }
    : { channel: "kin_or_community_relay", delayYears: 2, reach: P("family.careNetworkMoveRelayReach") };
}
function advanceCareNetwork(s) {
  const n = s.care?.supportNetwork;
  if (!n || !s.fl?.household_separated || !["active", "distant"].includes(n.contactState)) return;
  if (!Number.isFinite(n.moveReviewYear))
    n.moveReviewYear =
      s.year + rnd(P("family.careNetworkMoveReviewMinYears"), P("family.careNetworkMoveReviewMaxYears"));
  if (s.year < n.moveReviewYear) return;
  n.moveReviewYear =
    s.year + rnd(P("family.careNetworkMoveReviewMinYears"), P("family.careNetworkMoveReviewMaxYears"));
  const origin = REG.find(region => region.n === n.region),
    routes = origin
      ? (MIGRATION_ROUTES[origin.n] || []).filter(
          route => route.n !== origin.n && REG.some(region => region.n === route.n)
        )
      : [];
  if (!routes.length || R() >= P("family.careNetworkMoveChance")) return;
  const route = wp(routes.map(item => ({ w: item.w, route: item }))).route,
    from = n.region,
    to = route.n;
  n.region = to;
  n.moveCount = (n.moveCount || 0) + 1;
  n.moveHistory || (n.moveHistory = []);
  n.moveHistory.push({ id: n.moveCount, year: s.year, from, to, cause: "構成員の仕事・住居・生活事情" });
  n.moveHistory = n.moveHistory.slice(-16);
  for (const person of n.members || []) {
    if (["dead", "missing"].includes(person.lifeStatus)) continue;
    const personFrom = person.region || from;
    person.region = to;
    person.moveCount = (person.moveCount || 0) + 1;
    person.moveHistory || (person.moveHistory = []);
    person.moveHistory.push({ id: person.moveCount, year: s.year, from: personFrom, to, groupMove: true });
    person.moveHistory = person.moveHistory.slice(-12);
    person.moveReviewYear =
      s.year +
      rnd(P("family.careNetworkMemberMoveReviewMinYears"), P("family.careNetworkMemberMoveReviewMaxYears"));
  }
  const channel = careNetworkInfoRoute(s, to);
  if (R() < P("family.careNetworkMoveNoticeChance") * channel.reach) {
    n.pendingMoveNotices || (n.pendingMoveNotices = []);
    n.pendingMoveNotices.push({
      moveCount: n.moveCount,
      from,
      to,
      sentYear: s.year,
      deliveryYear: s.year + channel.delayYears,
      delayYears: channel.delayYears,
      channel: channel.channel
    });
    n.pendingMoveNotices = n.pendingMoveNotices.slice(-8);
  }
}
function advanceIndependentCareNetworkMembers(s) {
  const n = s.care?.supportNetwork;
  if (!n || !s.fl?.household_separated || !["active", "distant"].includes(n.contactState)) return;
  for (const person of n.members || []) {
    if (person.lifeStatus === "dead") continue;
    if (!Number.isFinite(person.moveReviewYear))
      person.moveReviewYear =
        s.year +
        rnd(P("family.careNetworkMemberMoveReviewMinYears"), P("family.careNetworkMemberMoveReviewMaxYears"));
    if (s.year < person.moveReviewYear) continue;
    person.moveReviewYear =
      s.year +
      rnd(P("family.careNetworkMemberMoveReviewMinYears"), P("family.careNetworkMemberMoveReviewMaxYears"));
    if (person.moveHistory?.at(-1)?.year === s.year) continue;
    const origin = REG.find(region => region.n === person.region),
      routes = origin
        ? (MIGRATION_ROUTES[origin.n] || []).filter(
            route => route.n !== origin.n && REG.some(region => region.n === route.n)
          )
        : [];
    if (!routes.length || R() >= P("family.careNetworkMemberMoveChance")) continue;
    const route = wp(routes.map(item => ({ w: item.w, route: item }))).route,
      from = person.region,
      to = route.n;
    person.region = to;
    person.moveCount = (person.moveCount || 0) + 1;
    person.moveHistory || (person.moveHistory = []);
    person.moveHistory.push({
      id: person.moveCount,
      year: s.year,
      from,
      to,
      cause: "本人の仕事・住居・家族事情"
    });
    person.moveHistory = person.moveHistory.slice(-12);
    const channel = careNetworkInfoRoute(s, to);
    if (R() < P("family.careNetworkMemberMoveNoticeChance") * channel.reach) {
      person.pendingMoveNotices || (person.pendingMoveNotices = []);
      person.pendingMoveNotices.push({
        memberId: person.id,
        moveCount: person.moveCount,
        from,
        to,
        sentYear: s.year,
        deliveryYear: s.year + channel.delayYears,
        delayYears: channel.delayYears,
        channel: channel.channel
      });
      person.pendingMoveNotices = person.pendingMoveNotices.slice(-8);
    }
  }
}
function advanceCareNetworkMemberLives(s) {
  const n = s.care?.supportNetwork;
  if (!n) return;
  for (const person of n.members || []) {
    if (person.lifeStatus !== "alive") continue;
    const age = Math.max(0, s.year - person.by),
      lifeScale = Number.isFinite(person.r?.lm) && person.r.lm > 0 ? person.r.lm : 1,
      effectiveAge = age / lifeScale,
      forcedAge = P("life.mortalityAgeScale") * lifeScale,
      risk =
        age >= forcedAge
          ? 1
          : Math.min(
              1,
              P("life.generalMortalityBase") +
                Math.max(0, effectiveAge - P("life.oldAgeMortalityStart")) * P("life.oldAgeMortalitySlope")
            );
    if (keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|death`) >= risk) continue;
    person.lifeStatus = "dead";
    person.deathYear = s.year;
    person.deathCause = effectiveAge > P("life.oldAgeMortalityStart") ? "老衰" : (person.inf ? "病死（鉱石病）" : "病死");
    person.lifeHistory || (person.lifeHistory = []);
    person.lifeHistory.push({ year: s.year, status: "dead", cause: person.deathCause });
    person.lifeHistory = person.lifeHistory.slice(-12);
    const route = careNetworkInfoRoute(s, person.region || s.res.n),
      channelReach =
        route.channel === "face_to_face"
          ? 1
          : route.channel === "family_letter_or_travelling_relative"
            ? P("family.careNetworkMoveLetterReach")
            : P("family.careNetworkMoveRelayReach");
    if (
      keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|death-notice`) <
      P("family.careNetworkMemberDeathNoticeChance") * channelReach
    ) {
      person.pendingDeathNotices || (person.pendingDeathNotices = []);
      person.pendingDeathNotices.push({
        memberId: person.id,
        deathYear: s.year,
        cause: person.deathCause,
        sentYear: s.year,
        deliveryYear: s.year + route.delayYears,
        delayYears: route.delayYears,
        channel: route.channel
      });
      person.pendingDeathNotices = person.pendingDeathNotices.slice(-8);
    }
  }
}
function advanceSocialContactMissing(s) {
  for (const person of [s.friendContact, s.neighborContact].filter(Boolean)) {
    const established =
      person.lifeStatus === "missing" ||
      (person.kind === "friend"
        ? ["acquaintance", "reconciled"].includes(person.status)
        : person.status === "familiar");
    if (!established) continue;
    if (person.lifeStatus === "alive") {
      const region = REG.find(item => item.n === person.region);
      if (!region) continue;
      const warPressure = worldPressure(s, "war", region.n, null),
        activeCanonWar =
          warPressure > 1 &&
          WORLD_PRESSURES.some(
            item =>
              item.regions.includes(region.n) &&
              !item.cities?.length &&
              s.year >= item.from &&
              s.year <= item.to &&
              s.world?.events?.[item.id] != null
          );
      if (!activeCanonWar || region.war * warPressure < P("condition.warRegionScale")) continue;
      if (Number.isFinite(person.missingReviewYear) && s.year < person.missingReviewYear) continue;
      person.missingReviewYear = s.year + 3;
      if (
        keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|social-missing`) <
        P("family.socialContactMissingChance")
      ) {
        const lastRegion = person.region;
        person.lifeStatus = "missing";
        person.status = "missing";
        person.missingSinceYear = s.year;
        person.missingFromRegion = lastRegion;
        person.region = null;
        person.lifeHistory || (person.lifeHistory = []);
        person.lifeHistory.push({
          year: s.year,
          status: "missing",
          lastKnownRegion: lastRegion,
          cause: "戦乱下で連絡・所在を確認できなくなった"
        });
        person.lifeHistory = person.lifeHistory.slice(-12);
        const route = careNetworkInfoRoute({ ...s, res: region }, s.res.n),
          reach =
            route.channel === "face_to_face"
              ? 1
              : route.channel === "family_letter_or_travelling_relative"
                ? P("family.careNetworkMoveLetterReach")
                : P("family.careNetworkMoveRelayReach");
        if (keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|social-missing-notice`) < reach) {
          person.pendingMissingNotices || (person.pendingMissingNotices = []);
          person.pendingMissingNotices.push({
            missingSinceYear: s.year,
            lastKnownRegion: lastRegion,
            sentYear: s.year,
            deliveryYear: s.year + route.delayYears,
            delayYears: route.delayYears,
            channel: route.channel
          });
          person.pendingMissingNotices = person.pendingMissingNotices.slice(-8);
        }
      }
    } else if (person.lifeStatus === "missing") {
      if (
        keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|social-found`) <
        Math.min(
          1,
          P("family.socialContactFoundChance") +
            Math.min(0.3, (person.searchEffort || 0) * P("family.socialContactSearchBoost"))
        )
      ) {
        person.lifeStatus = "alive";
        person.region = null;
        person.foundYear = s.year;
        person.lifeHistory || (person.lifeHistory = []);
        person.lifeHistory.push({ year: s.year, status: "found_alive", locationKnown: false });
        person.lifeHistory = person.lifeHistory.slice(-12);
        const origin = REG.find(item => item.n === person.missingFromRegion) || s.res,
          route = careNetworkInfoRoute({ ...s, res: origin }, s.res.n),
          reach =
            route.channel === "face_to_face"
              ? 1
              : route.channel === "family_letter_or_travelling_relative"
                ? P("family.careNetworkMoveLetterReach")
                : P("family.careNetworkMoveRelayReach");
        if (keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|social-found-notice`) < reach) {
          person.pendingFoundNotices || (person.pendingFoundNotices = []);
          person.pendingFoundNotices.push({
            foundYear: s.year,
            missingSinceYear: person.missingSinceYear,
            lastKnownRegion: person.missingFromRegion,
            locationKnown: false,
            sentYear: s.year,
            deliveryYear: s.year + route.delayYears,
            delayYears: route.delayYears,
            channel: route.channel
          });
          person.pendingFoundNotices = person.pendingFoundNotices.slice(-8);
        }
      }
    }
  }
}
function advanceSocialContactRecontact(s) {
  for (const person of [s.friendContact, s.neighborContact].filter(Boolean)) {
    if (
      person.lifeStatus !== "alive" ||
      person.region !== null ||
      person.recontactIntent !== "requested" ||
      person.knownRecontactStatus !== "requested"
    )
      continue;
    if (Number.isFinite(person.recontactReviewYear) && s.year < person.recontactReviewYear) continue;
    person.recontactAttemptCount = (person.recontactAttemptCount || 0) + 1;
    person.recontactReviewYear = s.year + 3;
    if (
      keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|social-recontact`) <
      P("family.socialContactRecontactChance")
    ) {
      person.pendingRecontactNotices || (person.pendingRecontactNotices = []);
      person.pendingRecontactNotices.push({
        replyYear: s.year,
        sentYear: s.year,
        deliveryYear: s.year + P("family.socialContactRecontactRelayYears"),
        channel: "kin_or_community_relay"
      });
      person.pendingRecontactNotices = person.pendingRecontactNotices.slice(-8);
    }
  }
}
function deliverSocialContactNotices(s) {
  for (const person of [s.friendContact, s.neighborContact].filter(Boolean))
    for (const key of ["pendingMissingNotices", "pendingFoundNotices", "pendingRecontactNotices"])
      for (const message of person[key] || [])
        if (message.deliveryYear <= s.year && !Number.isFinite(message.availableYear))
          message.availableYear = s.year;
}
function confirmSocialContactMissingNotice(s, search = false) {
  const person = [s.friendContact, s.neighborContact].find(contact => contact?.id === s.eventRelativeId);
  if (!person) return;
  const index = (person.pendingMissingNotices || []).findIndex(
    message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
  );
  if (index < 0) return;
  const message = person.pendingMissingNotices[index];
  person.knownLifeStatus = "missing";
  person.knownLifeStatusYear = s.year;
  person.knownMissingSinceYear = message.missingSinceYear;
  person.knownMissingLastRegion = message.lastKnownRegion;
  person.knownLifeHistory || (person.knownLifeHistory = []);
  person.knownLifeHistory.push({
    year: s.year,
    status: "missing",
    missingSinceYear: message.missingSinceYear,
    lastKnownRegion: message.lastKnownRegion,
    channel: message.channel
  });
  person.knownLifeHistory = person.knownLifeHistory.slice(-12);
  if (search) person.searchEffort = (person.searchEffort || 0) + 1;
  person.pendingMissingNotices.splice(index, 1);
}
function confirmSocialContactFoundNotice(s) {
  const person = [s.friendContact, s.neighborContact].find(contact => contact?.id === s.eventRelativeId);
  if (!person) return;
  const index = (person.pendingFoundNotices || []).findIndex(
    message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
  );
  if (index < 0) return;
  const message = person.pendingFoundNotices[index];
  person.knownLifeStatus = "alive";
  person.knownLifeStatusYear = s.year;
  person.knownMissingSinceYear = null;
  person.knownMissingLastRegion = null;
  person.knownLifeHistory || (person.knownLifeHistory = []);
  person.knownLifeHistory.push({
    year: s.year,
    status: "alive",
    foundYear: message.foundYear,
    locationKnown: false,
    channel: message.channel
  });
  person.knownLifeHistory = person.knownLifeHistory.slice(-12);
  person.pendingFoundNotices.splice(index, 1);
}
function confirmSocialContactRecontactNotice(s) {
  const person = [s.friendContact, s.neighborContact].find(contact => contact?.id === s.eventRelativeId);
  if (!person) return;
  const index = (person.pendingRecontactNotices || []).findIndex(
    message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
  );
  if (index < 0) return;
  const message = person.pendingRecontactNotices[index];
  person.knownRecontactStatus = "reply_received";
  person.knownLifeHistory || (person.knownLifeHistory = []);
  person.knownLifeHistory.push({
    year: s.year,
    status: "recontact_reply",
    replyYear: message.replyYear,
    locationKnown: false,
    channel: message.channel
  });
  person.knownLifeHistory = person.knownLifeHistory.slice(-12);
  person.pendingRecontactNotices.splice(index, 1);
}
function advanceCareNetworkMemberMissing(s) {
  const n = s.care?.supportNetwork;
  if (!n || !s.fl?.household_separated) return;
  for (const person of n.members || []) {
    if (person.lifeStatus === "alive") {
      const region = REG.find(item => item.n === person.region);
      if (!region) continue;
      const warPressure = worldPressure(s, "war", region.n, null),
        activeCanonWar =
          warPressure > 1 &&
          WORLD_PRESSURES.some(
            item =>
              item.regions.includes(region.n) &&
              !item.cities?.length &&
              s.year >= item.from &&
              s.year <= item.to &&
              s.world?.events?.[item.id] != null
          );
      if (!activeCanonWar || region.war * warPressure < P("condition.warRegionScale")) continue;
      if (Number.isFinite(person.missingReviewYear) && s.year < person.missingReviewYear) continue;
      person.missingReviewYear = s.year + 3;
      if (
        keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|missing`) <
        P("family.careNetworkMemberMissingChance")
      ) {
        person.lifeStatus = "missing";
        person.missingSinceYear = s.year;
        person.missingFromRegion = region.n;
        person.region = null;
        person.lifeHistory || (person.lifeHistory = []);
        person.lifeHistory.push({
          year: s.year,
          status: "missing",
          lastKnownRegion: region.n,
          cause: "戦乱下で連絡・所在を確認できなくなった"
        });
        person.lifeHistory = person.lifeHistory.slice(-12);
        const route = careNetworkInfoRoute({ ...s, res: region }, s.res.n),
          reach =
            route.channel === "face_to_face"
              ? 1
              : route.channel === "family_letter_or_travelling_relative"
                ? P("family.careNetworkMoveLetterReach")
                : P("family.careNetworkMoveRelayReach");
        if (keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|missing-notice`) < reach) {
          person.pendingMissingNotices || (person.pendingMissingNotices = []);
          person.pendingMissingNotices.push({
            memberId: person.id,
            missingSinceYear: s.year,
            lastKnownRegion: region.n,
            sentYear: s.year,
            deliveryYear: s.year + route.delayYears,
            delayYears: route.delayYears,
            channel: route.channel
          });
          person.pendingMissingNotices = person.pendingMissingNotices.slice(-8);
        }
      }
    } else if (person.lifeStatus === "missing") {
      const foundChance = Math.min(
        1,
        P("family.careNetworkMemberFoundChance") + Math.min(0.3, (person.searchEffort || 0) * 0.06)
      );
      if (keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|found`) < foundChance) {
        person.lifeStatus = "alive";
        person.region = null;
        person.foundYear = s.year;
        person.lifeHistory || (person.lifeHistory = []);
        person.lifeHistory.push({ year: s.year, status: "found_alive", locationKnown: false });
        person.lifeHistory = person.lifeHistory.slice(-12);
        const route = careNetworkInfoRoute(
            { ...s, res: REG.find(item => item.n === person.missingFromRegion) || s.res },
            s.res.n
          ),
          reach =
            route.channel === "face_to_face"
              ? 1
              : route.channel === "family_letter_or_travelling_relative"
                ? P("family.careNetworkMoveLetterReach")
                : P("family.careNetworkMoveRelayReach");
        if (keyedRoll(`${person.id}|${person.nm}|${person.by}|${s.year}|found-notice`) < reach) {
          person.pendingFoundNotices || (person.pendingFoundNotices = []);
          person.pendingFoundNotices.push({
            memberId: person.id,
            missingSinceYear: person.missingSinceYear,
            foundYear: s.year,
            lastKnownRegion: person.missingFromRegion,
            locationKnown: false,
            sentYear: s.year,
            deliveryYear: s.year + route.delayYears,
            delayYears: route.delayYears,
            channel: route.channel
          });
          person.pendingFoundNotices = person.pendingFoundNotices.slice(-8);
        }
      }
    }
  }
}
function deliverCareNetworkMoveNotice(s) {
  const n = s.care?.supportNetwork;
  if (!n) return;
  for (const message of n.pendingMoveNotices || [])
    if (message.deliveryYear <= s.year && !Number.isFinite(message.availableYear))
      message.availableYear = s.year;
  for (const person of n.members || [])
    for (const message of person.pendingMoveNotices || [])
      if (message.deliveryYear <= s.year && !Number.isFinite(message.availableYear))
        message.availableYear = s.year;
  for (const person of n.members || [])
    for (const message of person.pendingDeathNotices || [])
      if (message.deliveryYear <= s.year && !Number.isFinite(message.availableYear))
        message.availableYear = s.year;
  for (const person of n.members || [])
    for (const message of person.pendingMissingNotices || [])
      if (message.deliveryYear <= s.year && !Number.isFinite(message.availableYear))
        message.availableYear = s.year;
  for (const person of n.members || [])
    for (const message of person.pendingFoundNotices || [])
      if (message.deliveryYear <= s.year && !Number.isFinite(message.availableYear))
        message.availableYear = s.year;
}
function confirmCareNetworkMoveNotice(s) {
  const n = s.care?.supportNetwork;
  if (!n) return;
  const member = n.members?.find(person => person.id === s.eventCareNetworkMemberId);
  if (member) {
    const index = (member.pendingMoveNotices || []).findIndex(
      message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
    );
    if (index < 0) return;
    const message = member.pendingMoveNotices[index];
    member.knownRegion = message.to;
    member.knownMoveCount = Math.max(member.knownMoveCount || 0, message.moveCount);
    member.moveKnownYear = s.year;
    member.knownMoveHistory || (member.knownMoveHistory = []);
    member.knownMoveHistory.push({ ...message, heardYear: s.year });
    member.knownMoveHistory = member.knownMoveHistory.slice(-12);
    member.pendingMoveNotices.splice(index, 1);
    return;
  }
  const index = (n.pendingMoveNotices || []).findIndex(
    message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
  );
  if (index < 0) return;
  const message = n.pendingMoveNotices[index];
  n.knownRegion = message.to;
  n.knownMoveCount = Math.max(n.knownMoveCount || 0, message.moveCount);
  n.moveKnownYear = s.year;
  n.knownMoveHistory || (n.knownMoveHistory = []);
  n.knownMoveHistory.push({ ...message, heardYear: s.year });
  n.knownMoveHistory = n.knownMoveHistory.slice(-12);
  for (const person of n.members || []) {
    if (["dead", "missing"].includes(person.lifeStatus)) continue;
    person.knownRegion = message.to;
    person.knownMoveCount = Math.max(person.knownMoveCount || 0, person.moveCount || 0);
    person.moveKnownYear = s.year;
    person.knownMoveHistory || (person.knownMoveHistory = []);
    if (person.moveHistory?.at(-1)?.groupMove && person.moveHistory.at(-1).year === message.sentYear)
      person.knownMoveHistory.push({
        ...person.moveHistory.at(-1),
        heardYear: s.year,
        channel: message.channel,
        deliveryYear: message.deliveryYear
      });
    person.knownMoveHistory = person.knownMoveHistory.slice(-12);
  }
  n.pendingMoveNotices.splice(index, 1);
}
function confirmCareNetworkMemberDeathNotice(s) {
  const person = s.care?.supportNetwork?.members?.find(member => member.id === s.eventCareNetworkMemberId);
  if (!person) return;
  const index = (person.pendingDeathNotices || []).findIndex(
    message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
  );
  if (index < 0) return;
  const message = person.pendingDeathNotices[index];
  person.knownLifeStatus = "dead";
  person.deathKnownYear = s.year;
  person.knownDeathCause = message.cause || "死因は未確認";
  person.knownLifeStatusYear = s.year;
  person.knownLifeHistory || (person.knownLifeHistory = []);
  person.knownLifeHistory.push({
    year: s.year,
    status: "dead",
    deathYear: message.deathYear,
    cause: person.knownDeathCause,
    channel: message.channel
  });
  person.knownLifeHistory = person.knownLifeHistory.slice(-12);
  person.pendingDeathNotices.splice(index, 1);
}
function confirmCareNetworkMemberMissingNotice(s, search = false) {
  const person = s.care?.supportNetwork?.members?.find(member => member.id === s.eventCareNetworkMemberId);
  if (!person) return;
  const index = (person.pendingMissingNotices || []).findIndex(
    message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
  );
  if (index < 0) return;
  const message = person.pendingMissingNotices[index];
  person.knownLifeStatus = "missing";
  person.knownLifeStatusYear = s.year;
  person.knownMissingSinceYear = message.missingSinceYear;
  person.knownMissingLastRegion = message.lastKnownRegion;
  person.knownLifeHistory || (person.knownLifeHistory = []);
  person.knownLifeHistory.push({
    year: s.year,
    status: "missing",
    missingSinceYear: message.missingSinceYear,
    lastKnownRegion: message.lastKnownRegion,
    channel: message.channel
  });
  person.knownLifeHistory = person.knownLifeHistory.slice(-12);
  if (search) person.searchEffort = (person.searchEffort || 0) + 1;
  person.pendingMissingNotices.splice(index, 1);
}
function confirmCareNetworkMemberFoundNotice(s) {
  const person = s.care?.supportNetwork?.members?.find(member => member.id === s.eventCareNetworkMemberId);
  if (!person) return;
  const index = (person.pendingFoundNotices || []).findIndex(
    message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
  );
  if (index < 0) return;
  const message = person.pendingFoundNotices[index];
  person.knownLifeStatus = "alive";
  person.knownLifeStatusYear = s.year;
  person.knownMissingSinceYear = null;
  person.knownMissingLastRegion = null;
  person.knownLifeHistory || (person.knownLifeHistory = []);
  person.knownLifeHistory.push({
    year: s.year,
    status: "alive",
    foundYear: message.foundYear,
    locationKnown: false,
    channel: message.channel
  });
  person.knownLifeHistory = person.knownLifeHistory.slice(-12);
  person.pendingFoundNotices.splice(index, 1);
}
