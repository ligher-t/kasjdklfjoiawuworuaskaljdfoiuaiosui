function auditFamilyIdentityAndNotices(s, problems, services = STATE_AUDIT_SERVICES) {
  const spouse = s.sp;
  if (
    spouse?.d &&
    (!Number.isInteger(spouse.d) ||
      spouse.d > s.year ||
      spouse.deathYear !== spouse.d ||
      !spouse.deathNoticePending ||
      !Number.isInteger(spouse.deathNoticeAvailableYear) ||
      spouse.deathNoticeAvailableYear < spouse.d ||
      spouse.deathNoticeAvailableYear > s.year + 2 ||
      !["face_to_face", "family_letter_or_travelling_relative", "kin_or_community_relay"].includes(
        spouse.deathNoticeChannel
      ) ||
      spouse.deathKnownYear != null ||
      typeof spouse.deathCause !== "string" ||
      spouse.mortalityCheckedYear < spouse.d)
  )
    problems.push("配偶者の死亡・訃報待ち記録が不正");
  if (
    spouse &&
    !spouse.d &&
    (spouse.deathYear != null ||
      spouse.deathCause != null ||
      spouse.deathNoticePending ||
      spouse.deathNoticeAvailableYear != null ||
      spouse.deathNoticeChannel != null)
  )
    problems.push("存命の配偶者に死亡待ち記録が残存");
  if (
    spouse?.mortalityCheckedYear != null &&
    (!Number.isInteger(spouse.mortalityCheckedYear) ||
      spouse.mortalityCheckedYear < (spouse.by || s.year) ||
      spouse.mortalityCheckedYear > s.year)
  )
    problems.push("配偶者の死亡判定年が不正");
  const relatives = [
      s.par?.fa,
      s.par?.mo,
      ...services.siblingsOf(s),
      ...services
        .siblingsOf(s)
        .flatMap(x => [x.familyHousehold?.partner, ...(x.familyHousehold?.children || [])]),
      s.sp,
      ...(s.kids || []),
      s.romance,
      s.friendContact,
      s.neighborContact,
      ...(s.relationshipHistory || [])
    ].filter(Boolean),
    relativeIds = relatives.map(x => x.id).filter(Boolean);
  if (relativeIds.length !== relatives.length) problems.push("家族・関係者に安定IDがない");
  if (new Set(relativeIds).size !== relativeIds.length) problems.push("家族・関係者のIDが重複");
  for (const sibling of services.siblingsOf(s))
    if (sibling.independentSinceYear) {
      const family = sibling.familyHousehold;
      for (const relative of [family?.partner, ...(family?.children || [])].filter(Boolean)) {
        if (
          relative.mortalityCheckedYear != null &&
          (!Number.isInteger(relative.mortalityCheckedYear) ||
            relative.mortalityCheckedYear > s.year ||
            relative.mortalityCheckedYear < (relative.by || s.year))
        )
          problems.push("別居きょうだい世帯の死亡判定年が不正");
        if (
          relative.d &&
          (!Number.isInteger(relative.d) ||
            relative.d < relative.by ||
            relative.d > s.year ||
            typeof relative.deathCause !== "string" ||
            relative.mortalityCheckedYear < relative.d)
        )
          problems.push("別居きょうだい世帯の死亡記録が不正");
        if (!relative.d && relative.deathCause != null)
          problems.push("存命の別居きょうだい世帯員に死因が残存");
      }
      if (
        !family ||
        !Array.isArray(family.children) ||
        !Array.isArray(family.history) ||
        (!sibling.d &&
          (!Number.isFinite(family.reviewYear) ||
            family.reviewYear < s.year ||
            family.reviewYear > s.year + services.P("family.siblingFamilyReviewMaxYears"))) ||
        (sibling.d && family.reviewYear != null)
      )
        problems.push("別居きょうだいの家族記録・見直し年が不正");
      if (
        family?.partner &&
        (!family.partner.id ||
          !family.partner.nm ||
          !services.RACE.some(r => r.n === family.partner.r?.n) ||
          !Number.isFinite(family.partner.by) ||
          family.partner.by > s.year ||
          !Number.isInteger(family.partner.j) ||
          !services.J[family.partner.j] ||
          !Number.isFinite(family.partner.unionYear) ||
          family.partner.unionYear < sibling.independentSinceYear ||
          family.partner.unionYear > s.year)
      )
        problems.push("別居きょうだいの同居相手記録が不正");
      if ((family?.children || []).length > services.P("family.siblingChildrenMax"))
        problems.push("別居きょうだいが追跡する子の人数上限を超過");
      for (const child of family?.children || [])
        if (
          !child.id ||
          !child.nm ||
          !services.RACE.some(r => r.n === child.r?.n) ||
          !Number.isFinite(child.by) ||
          child.by > s.year ||
          child.relationType !== "子として育てている"
        )
          problems.push("別居きょうだいの子の個人記録が不正");
      for (const row of family?.history || [])
        if (
          !Number.isFinite(row.year) ||
          row.year < sibling.independentSinceYear ||
          row.year > s.year ||
          !["partner_formed", "child_joined_household", "partner_died", "child_died"].includes(row.type)
        )
          problems.push("別居きょうだいの家族履歴が不正");
      if (sibling.knownFamilyPartner != null && typeof sibling.knownFamilyPartner !== "boolean")
        problems.push("本人が把握するきょうだいの家族状態が不正");
      if (
        sibling.knownFamilyChildren != null &&
        (!Number.isInteger(sibling.knownFamilyChildren) ||
          sibling.knownFamilyChildren < 0 ||
          sibling.knownFamilyChildren > services.P("family.siblingChildrenMax"))
      )
        problems.push("本人が把握するきょうだいの子の人数が不正");
      if (
        sibling.knownFamilyYear != null &&
        (!Number.isFinite(sibling.knownFamilyYear) ||
          sibling.knownFamilyYear < sibling.independentSinceYear ||
          sibling.knownFamilyYear > s.year)
      )
        problems.push("本人が家族状況を確認した年が不正");
      if (
        sibling.familyNoticeYear != null &&
        (!Number.isFinite(sibling.familyNoticeYear) ||
          sibling.familyNoticeYear < sibling.independentSinceYear ||
          sibling.familyNoticeYear > s.year)
      )
        problems.push("きょうだいの家族状況の知らせ年が不正");
    }
  if (
    !Number.isInteger(s.nextRelativeId) ||
    s.nextRelativeId < 1 ||
    relativeIds.some(id => Number(id.split("-").at(-1)) >= s.nextRelativeId)
  )
    problems.push("家族・関係者IDの採番位置が不正");
  if (s.romance && !["known", "dating", "committed", "cohabiting", "arranged"].includes(s.romance.stage))
    problems.push("恋愛・縁談の段階が不正");
  const contactRecords = [s.friendContact, s.neighborContact, ...(s.relationshipHistory || []).filter(person => ["friend", "neighbor"].includes(person.kind))].filter(Boolean);
  for (const contact of contactRecords) {
    if (
      !contact.nm ||
      !services.RACE.some(r => r.n === contact.r?.n) ||
      !Number.isFinite(contact.by) ||
      contact.by > s.year
    )
      problems.push("友人・隣人の識別情報が不正");
    if (
      !contact.id ||
      !contact.status ||
      !["alive", "missing", "dead"].includes(contact.lifeStatus) ||
      !["alive", "missing", "dead", "unrecorded"].includes(contact.knownLifeStatus) ||
      !Array.isArray(contact.pendingMissingNotices) ||
      contact.pendingMissingNotices.length > 8 ||
      !Array.isArray(contact.pendingFoundNotices) ||
      contact.pendingFoundNotices.length > 8 ||
      !Array.isArray(contact.pendingRecontactNotices) ||
      contact.pendingRecontactNotices.length > 8 ||
      !["none", "requested", "closed"].includes(contact.recontactIntent) ||
      !["none", "requested", "reply_received", "reconnected", "closed"].includes(
        contact.knownRecontactStatus
      ) ||
      !Number.isInteger(contact.recontactAttemptCount) ||
      contact.recontactAttemptCount < 0 ||
      (contact.recontactReviewYear != null && !Number.isFinite(contact.recontactReviewYear)) ||
      !Array.isArray(contact.lifeHistory) ||
      contact.lifeHistory.length > 12 ||
      !Array.isArray(contact.knownLifeHistory) ||
      contact.knownLifeHistory.length > 12
    )
      problems.push("友人・隣人の関係状態が不正");
    if (
      contact.lifeStatus === "missing" &&
      (!Number.isInteger(contact.missingSinceYear) ||
        contact.missingSinceYear > s.year ||
        contact.region != null ||
        !services.REG.some(region => region.n === contact.missingFromRegion))
    )
      problems.push("友人・隣人の消息不明記録が不正");
    if (
      contact.knownLifeStatus === "missing" &&
      (!Number.isInteger(contact.knownMissingSinceYear) ||
        contact.knownMissingSinceYear > s.year ||
        !services.REG.some(region => region.n === contact.knownMissingLastRegion))
    )
      problems.push("友人・隣人の本人認知記録が不正");
    if (
      contact.lifeStatus === "dead" &&
      (contact.status !== "deceased" ||
        !Number.isFinite(contact.deathYear) ||
        !Number.isFinite(contact.deathKnownYear) ||
        contact.deathYear < (contact.metYear ?? contact.by) ||
        contact.deathYear > contact.deathKnownYear ||
        contact.deathKnownYear > s.year)
    )
      problems.push("友人・隣人の死亡年・訃報認知年が不正");
    if (contact.lifeStatus !== "dead" && (contact.deathYear != null || contact.deathKnownYear != null))
      problems.push("存命の友人・隣人に死亡記録が残存");
  }
  for (const contact of [s.friendContact, s.neighborContact].filter(Boolean)) {
    for (const [key, type] of [
      ["pendingMissingNotices", "missing"],
      ["pendingFoundNotices", "found"]
    ])
      for (const message of contact[key] || []) {
        if (
          !Number.isInteger(message.sentYear) ||
          !Number.isInteger(message.deliveryYear) ||
          message.deliveryYear < message.sentYear ||
          message.deliveryYear > s.year + 3 ||
          (!Number.isFinite(message.availableYear) && message.deliveryYear <= s.year) ||
          (Number.isFinite(message.availableYear) && message.availableYear > s.year) ||
          !services.REG.some(region => region.n === message.lastKnownRegion) ||
          !["face_to_face", "family_letter_or_travelling_relative", "kin_or_community_relay"].includes(
            message.channel
          )
        )
          problems.push("友人・隣人の安否知らせが不正");
        if (
          type === "missing" &&
          (!Number.isInteger(message.missingSinceYear) || message.missingSinceYear > message.sentYear)
        )
          problems.push("友人・隣人の消息不明知らせが不正");
        if (
          type === "found" &&
          (!Number.isInteger(message.foundYear) ||
            message.foundYear > message.sentYear ||
            message.locationKnown !== false)
        )
          problems.push("友人・隣人の生存確認知らせが不正");
      }
  }
  for (const contact of [s.friendContact, s.neighborContact].filter(Boolean))
    for (const message of contact.pendingRecontactNotices || [])
      if (
        !Number.isInteger(message.replyYear) ||
        !Number.isInteger(message.sentYear) ||
        message.replyYear > message.sentYear ||
        message.sentYear > s.year ||
        !Number.isInteger(message.deliveryYear) ||
        message.deliveryYear < message.sentYear ||
        message.deliveryYear > s.year + services.P("family.socialContactRecontactRelayYears") ||
        (Number.isFinite(message.availableYear) && message.availableYear > s.year) ||
        (!Number.isFinite(message.availableYear) && message.deliveryYear <= s.year) ||
        message.channel !== "kin_or_community_relay"
      )
        problems.push("友人・隣人の再連絡通知が不正");
}
