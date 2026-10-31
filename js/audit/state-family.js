function auditFamilyCareState(s, problems, services = STATE_AUDIT_SERVICES) {
  const siracusaTie = s.siracusaFamilyTie;
  if (
    siracusaTie &&
    (!["active", "distant", "left", "declined"].includes(siracusaTie.status) ||
      (siracusaTie.startedYear != null &&
        (!Number.isInteger(siracusaTie.startedYear) || siracusaTie.startedYear > s.year)) ||
      !Array.isArray(siracusaTie.history) ||
      siracusaTie.history.length > 16 ||
      siracusaTie.history.some(
        row =>
          !Number.isInteger(row.year) ||
          row.year > s.year ||
          !["active", "distant", "left", "declined"].includes(row.to)
      ) ||
      (siracusaTie.status === "active" && !s.fl?.family) ||
      (siracusaTie.status !== "active" && !!s.fl?.family))
  )
    problems.push("シラクーザのファミリー関係記録が不正");
  const familyDuty = siracusaTie?.duty;
  if (
    familyDuty &&
    (!Number.isInteger(familyDuty.count) ||
      familyDuty.count < 0 ||
      (familyDuty.lastYear != null &&
        (!Number.isInteger(familyDuty.lastYear) || familyDuty.lastYear > s.year)) ||
      (familyDuty.nextYear != null &&
        (!Number.isInteger(familyDuty.nextYear) ||
          familyDuty.nextYear < s.by ||
          familyDuty.nextYear > s.year + services.P("family.siracusaFamilyDutyYears"))) ||
      !Number.isFinite(familyDuty.outstandingAmount) ||
      familyDuty.outstandingAmount < 0 ||
      (familyDuty.settleByYear != null &&
        (!Number.isInteger(familyDuty.settleByYear) || familyDuty.settleByYear > s.year + 2)) ||
      !Array.isArray(familyDuty.history) ||
      familyDuty.history.length > 20 ||
      familyDuty.history.some(
        row =>
          !Number.isInteger(row.year) ||
          row.year > s.year ||
          ![
            "join",
            "paidErrand",
            "refusedPressure",
            "acceptedPressure",
            "settled",
            "mediated",
            "disputed"
          ].includes(row.action) ||
          !Number.isFinite(row.amount) ||
          row.amount < 0
      ))
  )
    problems.push("シラクーザの用事・借り記録が不正");
  const siracusaDutyYears = services.P("family.siracusaFamilyDutyYears");
  if (!Number.isInteger(siracusaDutyYears) || siracusaDutyYears < 1 || siracusaDutyYears > 10)
    problems.push("シラクーザの用事再提示間隔が不正");
  if (
    s.careInclination != null &&
    (!Number.isFinite(s.careInclination) || s.careInclination < 0 || s.careInclination > 100)
  )
    problems.push("家族ケアへの関与傾向が範囲外");
  if (
    s.careInclinationHistory != null &&
    (!Array.isArray(s.careInclinationHistory) ||
      s.careInclinationHistory.length > 40 ||
      s.careInclinationHistory.some(
        row =>
          !Number.isInteger(row.year) ||
          row.year > s.year ||
          !Number.isFinite(row.before) ||
          !Number.isFinite(row.after) ||
          row.before < 0 ||
          row.before > 100 ||
          row.after < row.before ||
          row.after > 100 ||
          typeof row.choice !== "string"
      ))
  )
    problems.push("家族ケアへの関与履歴が不正");
  const careNetwork = s.care?.supportNetwork;
  if (careNetwork) {
    if (
      !/^care-network-\d+$/.test(careNetwork.id || "") ||
      !["kin_household", "guardian_household", "clan_community", "displacement_network"].includes(
        careNetwork.type
      ) ||
      !careNetwork.label ||
      !Array.isArray(careNetwork.roles) ||
      !careNetwork.roles.length ||
      !["unconfirmed", "yes", "no"].includes(careNetwork.formalGuardianship) ||
      !["active", "ended"].includes(careNetwork.status) ||
      !Number.isFinite(careNetwork.startedYear) ||
      careNetwork.startedYear > (s.year || services.START) ||
      (careNetwork.endedYear != null &&
        (!Number.isFinite(careNetwork.endedYear) ||
          careNetwork.endedYear < careNetwork.startedYear ||
          careNetwork.endedYear > s.year)) ||
      !["active", "ended"].includes(careNetwork.fundingStatus) ||
      (careNetwork.fundingStatus === "ended" &&
        (!Number.isFinite(careNetwork.fundingEndedYear) ||
          careNetwork.fundingEndedYear < careNetwork.startedYear ||
          careNetwork.fundingEndedYear > s.year)) ||
      !Array.isArray(careNetwork.contributionHistory) ||
      careNetwork.contributionHistory.length > 16 ||
      !["within_care", "active", "distant", "ended", "unrecorded"].includes(careNetwork.contactState) ||
      !Array.isArray(careNetwork.contactHistory) ||
      careNetwork.contactHistory.length > 20 ||
      (careNetwork.contactReviewYear != null &&
        (!Number.isFinite(careNetwork.contactReviewYear) ||
          careNetwork.contactReviewYear < s.by ||
          careNetwork.contactReviewYear > s.year + 10)) ||
      (careNetwork.reconnectInviteYear != null &&
        (!Number.isFinite(careNetwork.reconnectInviteYear) ||
          careNetwork.reconnectInviteYear < s.by ||
          careNetwork.reconnectInviteYear > s.year + 10))
    )
      problems.push("親以外の養育ネットワーク記録が不正");
    for (const row of careNetwork.contributionHistory || [])
      if (
        !Number.isInteger(row.year) ||
        row.year <= careNetwork.startedYear ||
        row.year > s.year ||
        !Number.isFinite(row.amount) ||
        row.amount <= 0 ||
        !services.REG.some(region => region.n === row.region) ||
        !Number.isFinite(row.priceIndex) ||
        row.priceIndex <= 0
      )
        problems.push("養育ネットワーク家計支援履歴が不正");
    if (!Array.isArray(careNetwork.legacyRepair)) problems.push("養育ネットワーク旧記録補完欄が不正");
    if (
      (careNetwork.region != null && !services.REG.some(region => region.n === careNetwork.region)) ||
      (careNetwork.knownRegion != null &&
        !services.REG.some(region => region.n === careNetwork.knownRegion)) ||
      !Number.isInteger(careNetwork.moveCount) ||
      careNetwork.moveCount < 0 ||
      !Number.isInteger(careNetwork.knownMoveCount) ||
      careNetwork.knownMoveCount < 0 ||
      careNetwork.knownMoveCount > careNetwork.moveCount ||
      !Array.isArray(careNetwork.moveHistory) ||
      careNetwork.moveHistory.length > 16 ||
      !Array.isArray(careNetwork.knownMoveHistory) ||
      careNetwork.knownMoveHistory.length > 12 ||
      !Array.isArray(careNetwork.pendingMoveNotices) ||
      careNetwork.pendingMoveNotices.length > 8 ||
      (careNetwork.moveReviewYear != null &&
        (!Number.isFinite(careNetwork.moveReviewYear) ||
          careNetwork.moveReviewYear < s.by ||
          careNetwork.moveReviewYear > s.year + 10))
    )
      problems.push("養育ネットワーク転居・既知情報記録が不正");
    for (const move of careNetwork.moveHistory || [])
      if (
        !Number.isInteger(move.year) ||
        move.year < careNetwork.startedYear ||
        move.year > s.year ||
        !services.REG.some(region => region.n === move.from) ||
        !services.REG.some(region => region.n === move.to) ||
        move.from === move.to
      )
        problems.push("養育ネットワーク転居履歴が不正");
    for (const message of careNetwork.pendingMoveNotices || [])
      if (
        !Number.isInteger(message.deliveryYear) ||
        message.deliveryYear < message.sentYear ||
        message.deliveryYear > s.year + 3 ||
        !services.REG.some(region => region.n === message.from) ||
        !services.REG.some(region => region.n === message.to) ||
        !Number.isInteger(message.moveCount) ||
        message.moveCount < 1 ||
        message.moveCount > careNetwork.moveCount ||
        !["face_to_face", "family_letter_or_travelling_relative", "kin_or_community_relay"].includes(
          message.channel
        )
      )
        problems.push("養育ネットワーク転居通知が不正");
  }
  if (careNetwork?.members != null) {
    if (!Array.isArray(careNetwork.members) || careNetwork.members.length > 6)
      problems.push("養育ネットワーク個人記録が不正");
    else {
      const ids = new Set();
      for (const person of careNetwork.members) {
        if (
          !/^relative-\d+$/.test(person.id || "") ||
          ids.has(person.id) ||
          !person.nm ||
          !Number.isInteger(person.by) ||
          person.by > s.by ||
          !Array.isArray(person.roles) ||
          !person.roles.length ||
          !["active", "former"].includes(person.careStatus) ||
          !Number.isFinite(person.careStatusKnownYear) ||
          person.careStatusKnownYear > s.year ||
          (person.region != null && !services.REG.some(region => region.n === person.region)) ||
          (person.knownRegion != null && !services.REG.some(region => region.n === person.knownRegion)) ||
          !Array.isArray(person.roleHistory) ||
          person.roleHistory.length > 12 ||
          !Array.isArray(person.moveHistory) ||
          person.moveHistory.length > 12 ||
          !Array.isArray(person.knownMoveHistory) ||
          person.knownMoveHistory.length > 12 ||
          !Array.isArray(person.pendingMoveNotices) ||
          person.pendingMoveNotices.length > 8 ||
          !Number.isInteger(person.moveCount) ||
          person.moveCount < 0 ||
          !Number.isInteger(person.knownMoveCount) ||
          person.knownMoveCount < 0 ||
          person.knownMoveCount > person.moveCount ||
          (person.moveReviewYear != null && !Number.isFinite(person.moveReviewYear)) ||
          !["alive", "dead", "missing", "untracked"].includes(person.lifeStatus) ||
          !["alive", "dead", "missing", "unrecorded"].includes(person.knownLifeStatus) ||
          !Array.isArray(person.lifeHistory) ||
          person.lifeHistory.length > 12 ||
          !Array.isArray(person.knownLifeHistory) ||
          person.knownLifeHistory.length > 12 ||
          !Array.isArray(person.pendingDeathNotices) ||
          person.pendingDeathNotices.length > 8 ||
          !Array.isArray(person.pendingMissingNotices) ||
          person.pendingMissingNotices.length > 8 ||
          !Array.isArray(person.pendingFoundNotices) ||
          person.pendingFoundNotices.length > 8 ||
          (person.lifeStatus === "dead" &&
            (!Number.isInteger(person.deathYear) ||
              person.deathYear < person.by ||
              person.deathYear > s.year)) ||
          (person.lifeStatus === "alive" && (person.deathYear != null || person.deathCause)) ||
          (person.knownLifeStatus === "dead" &&
            (!Number.isInteger(person.deathKnownYear) ||
              !Number.isInteger(person.deathYear) ||
              person.deathKnownYear < person.deathYear ||
              person.deathKnownYear > s.year)) ||
          (person.knownLifeStatusYear != null &&
            (!Number.isInteger(person.knownLifeStatusYear) || person.knownLifeStatusYear > s.year))
        )
          problems.push("養育ネットワーク構成員の状態が不正");
        ids.add(person.id);
        for (const row of person.roleHistory || [])
          if (
            !Number.isInteger(row.year) ||
            row.year > s.year ||
            !["active", "ended"].includes(row.state) ||
            !Array.isArray(row.roles)
          )
            problems.push("養育ネットワーク構成員の役割履歴が不正");
        for (const message of person.pendingDeathNotices || [])
          if (
            !Number.isInteger(message.deathYear) ||
            message.deathYear > message.deliveryYear ||
            message.deliveryYear > s.year + 3 ||
            !Number.isInteger(message.sentYear) ||
            !Number.isInteger(message.deliveryYear) ||
            typeof message.cause !== "string" ||
            !["face_to_face", "family_letter_or_travelling_relative", "kin_or_community_relay"].includes(
              message.channel
            )
          )
            problems.push("養育者個人の訃報通知が不正");
        for (const message of person.pendingMissingNotices || [])
          if (
            !Number.isInteger(message.missingSinceYear) ||
            !Number.isInteger(message.sentYear) ||
            !Number.isInteger(message.deliveryYear) ||
            message.missingSinceYear > message.sentYear ||
            message.deliveryYear < message.sentYear ||
            message.deliveryYear > s.year + 3 ||
            !services.REG.some(region => region.n === message.lastKnownRegion) ||
            !["face_to_face", "family_letter_or_travelling_relative", "kin_or_community_relay"].includes(
              message.channel
            )
          )
            problems.push("養育者個人の消息不明通知が不正");
        for (const message of person.pendingFoundNotices || [])
          if (
            !Number.isInteger(message.foundYear) ||
            !Number.isInteger(message.sentYear) ||
            !Number.isInteger(message.deliveryYear) ||
            message.foundYear > message.sentYear ||
            message.deliveryYear < message.sentYear ||
            message.deliveryYear > s.year + 3 ||
            typeof message.locationKnown !== "boolean" ||
            !["face_to_face", "family_letter_or_travelling_relative", "kin_or_community_relay"].includes(
              message.channel
            )
          )
            problems.push("養育者個人の安否確認通知が不正");
        if (
          person.lifeStatus === "missing" &&
          (!Number.isInteger(person.missingSinceYear) ||
            person.missingSinceYear < person.by ||
            person.missingSinceYear > s.year ||
            person.region != null ||
            !services.REG.some(region => region.n === person.missingFromRegion))
        )
          problems.push("消息不明の養育者の状態が不正");
        if (
          person.knownLifeStatus === "missing" &&
          (!Number.isInteger(person.knownMissingSinceYear) ||
            person.knownMissingSinceYear > s.year ||
            !services.REG.some(region => region.n === person.knownMissingLastRegion))
        )
          problems.push("本人が知る養育者の消息不明記録が不正");
      }
    }
  }
}

function auditSiblingParentSupport(s, problems, services = STATE_AUDIT_SERVICES) {
  const parentSupportMin = services.P("family.siblingParentSupportReviewMinYears"),
    parentSupportMax = services.P("family.siblingParentSupportReviewMaxYears"),
    parentSupportChance = services.P("family.siblingParentSupportChance"),
    parentSupportIncomeShare = services.P("family.siblingParentSupportIncomeShare"),
    parentSupportExpenseCap = services.P("family.siblingParentSupportExpenseCapShare"),
    parentNeedMin = services.P("family.siblingParentNeedReviewMinYears"),
    parentNeedMax = services.P("family.siblingParentNeedReviewMaxYears"),
    parentNeedSignalChance = services.P("family.siblingParentNeedSignalChance"),
    parentNeedReachValues = [
      services.P("family.siblingParentNeedFaceToFaceReach"),
      services.P("family.siblingParentNeedLetterReach"),
      services.P("family.siblingParentNeedRelayReach")
    ];
  if (
    !Number.isInteger(parentSupportMin) ||
    parentSupportMin < 1 ||
    !Number.isInteger(parentSupportMax) ||
    parentSupportMax < parentSupportMin ||
    !Number.isFinite(parentSupportChance) ||
    parentSupportChance < 0 ||
    parentSupportChance > 1 ||
    !Number.isFinite(parentSupportIncomeShare) ||
    parentSupportIncomeShare < 0 ||
    parentSupportIncomeShare > 1 ||
    !Number.isFinite(parentSupportExpenseCap) ||
    parentSupportExpenseCap < 0 ||
    parentSupportExpenseCap > 1 ||
    !Number.isInteger(parentNeedMin) ||
    parentNeedMin < 1 ||
    !Number.isInteger(parentNeedMax) ||
    parentNeedMax < parentNeedMin ||
    !Number.isFinite(parentNeedSignalChance) ||
    parentNeedSignalChance < 0 ||
    parentNeedSignalChance > 1 ||
    parentNeedReachValues.some(value => !Number.isFinite(value) || value < 0 || value > 1)
  )
    problems.push("きょうだいの親世帯支援設定値が不正");
  const infoChannels = ["face_to_face", "family_letter_or_travelling_relative", "kin_or_community_relay"],
    caregiverIds = s.house?.parentLedger?.caregiverIds || [];
  for (const sibling of services.siblingsOf(s))
    if (sibling.independentSinceYear) {
      const invalidHistory = (sibling.parentNeedHistory || []).some(row => {
        if (
          !Number.isInteger(row.year) ||
          row.year < sibling.independentSinceYear ||
          row.year > s.year ||
          !["unknown", "strained", "stable"].includes(row.from) ||
          !["strained", "stable"].includes(row.to)
        )
          return true;
        const hasRoute = row.sentYear != null || row.channel != null || row.sourceId != null;
        return (
          hasRoute &&
          (!Number.isInteger(row.sentYear) ||
            row.sentYear < row.year - 2 ||
            row.sentYear > row.year ||
            !Number.isInteger(row.deliveryYear) ||
            row.deliveryYear !== row.year ||
            !Number.isInteger(row.delayYears) ||
            row.delayYears < 0 ||
            row.delayYears > 2 ||
            !infoChannels.includes(row.channel) ||
            !caregiverIds.includes(row.sourceId))
        );
      });
      const pending = sibling.parentNeedPending,
        invalidPending =
          pending &&
          (!["strained", "stable"].includes(pending.status) ||
            !Number.isInteger(pending.sentYear) ||
            pending.sentYear < sibling.independentSinceYear ||
            pending.sentYear > s.year ||
            !Number.isInteger(pending.deliveryYear) ||
            pending.deliveryYear < s.year ||
            pending.deliveryYear > s.year + 2 ||
            pending.deliveryYear - pending.sentYear > 2 ||
            !infoChannels.includes(pending.channel) ||
            !caregiverIds.includes(pending.sourceId));
      if (
        !["unknown", "strained", "stable"].includes(sibling.parentNeedKnownStatus) ||
        (!sibling.d &&
          (!Number.isFinite(sibling.parentNeedReviewYear) ||
            sibling.parentNeedReviewYear < s.year ||
            sibling.parentNeedReviewYear > s.year + parentNeedMax)) ||
        (sibling.d && sibling.parentNeedReviewYear != null) ||
        (sibling.parentNeedKnownYear != null &&
          (!Number.isFinite(sibling.parentNeedKnownYear) ||
            sibling.parentNeedKnownYear < sibling.independentSinceYear ||
            sibling.parentNeedKnownYear > s.year)) ||
        !Array.isArray(sibling.parentNeedHistory) ||
        sibling.parentNeedHistory.length > 12 ||
        invalidHistory ||
        invalidPending
      )
        problems.push("きょうだいが知る親世帯状況の記録が不正");
    }
  for (const sibling of services.siblingsOf(s))
    if (sibling.independentSinceYear) {
      if (
        !["none", "active", "ended"].includes(sibling.parentSupportStatus) ||
        !Number.isFinite(sibling.parentSupportDisposition) ||
        sibling.parentSupportDisposition < 0 ||
        sibling.parentSupportDisposition > 1 ||
        (!sibling.d &&
          (!Number.isFinite(sibling.parentSupportReviewYear) ||
            sibling.parentSupportReviewYear < s.year ||
            sibling.parentSupportReviewYear > s.year + parentSupportMax)) ||
        (sibling.d && sibling.parentSupportReviewYear != null) ||
        !Number.isFinite(sibling.parentSupportPaidTotal) ||
        sibling.parentSupportPaidTotal < 0 ||
        !Number.isInteger(sibling.parentSupportChangeCount) ||
        sibling.parentSupportChangeCount < 0 ||
        !Array.isArray(sibling.parentSupportHistory) ||
        sibling.parentSupportHistory.length > 24 ||
        !Number.isInteger(sibling.knownParentSupportChangeCount) ||
        sibling.knownParentSupportChangeCount < 0 ||
        sibling.knownParentSupportChangeCount > sibling.parentSupportChangeCount ||
        !["none", "active", "ended"].includes(sibling.knownParentSupportStatus) ||
        !Number.isFinite(sibling.knownParentSupportPaidTotal) ||
        sibling.knownParentSupportPaidTotal < 0 ||
        sibling.knownParentSupportPaidTotal > sibling.parentSupportPaidTotal + 1e-6 ||
        (sibling.parentSupportKnownYear != null &&
          (!Number.isFinite(sibling.parentSupportKnownYear) || sibling.parentSupportKnownYear > s.year)) ||
        (sibling.parentSupportPaidYear != null &&
          (!Number.isFinite(sibling.parentSupportPaidYear) ||
            sibling.parentSupportPaidYear < sibling.independentSinceYear ||
            sibling.parentSupportPaidYear > s.year ||
            !Number.isFinite(sibling.parentSupportPaidAmount) ||
            sibling.parentSupportPaidAmount <= 0))
      )
        problems.push("別居きょうだいの親世帯支援状態・既知情報が不正");
      for (const row of sibling.parentSupportHistory || [])
        if (
          !Number.isInteger(row.year) ||
          row.year < sibling.independentSinceYear ||
          row.year > s.year ||
          !["none", "active", "ended"].includes(row.from) ||
          !["active", "ended"].includes(row.to) ||
          row.from === row.to ||
          typeof row.cause !== "string"
        )
          problems.push("きょうだいの親世帯支援履歴が不正");
      if (
        (sibling.knownParentSupportChangeCount || 0) === (sibling.parentSupportChangeCount || 0) &&
        sibling.knownParentSupportStatus !== sibling.parentSupportStatus
      )
        problems.push("きょうだい支援の本人把握状態と変更件数が一致しない");
    }
  const conference = s.siblingParentSupportConference;
  if (conference) {
    const siblingIds = new Set(services.siblingsOf(s).map(person => person.id));
    if (
      !["scheduled", "completed", "cancelled"].includes(conference.status) ||
      !siblingIds.has(conference.initiatorSiblingId) ||
      !Number.isInteger(conference.requestedYear) ||
      conference.requestedYear > s.year ||
      !Number.isInteger(conference.dueYear) ||
      conference.dueYear <= conference.requestedYear ||
      !Array.isArray(conference.participantIds) ||
      !conference.participantIds.length ||
      conference.participantIds.some(id => id === conference.initiatorSiblingId || !siblingIds.has(id)) ||
      !Array.isArray(conference.history) ||
      conference.history.length > 12 ||
      (conference.status === "completed" &&
        (!Number.isInteger(conference.heldYear) ||
          conference.heldYear > s.year ||
          !["一時送金", "手伝いを申し出た", "親へ個別に確認"].includes(conference.outcome)))
    )
      problems.push("きょうだいの親世帯支援相談記録が不正");
    for (const row of conference.history || [])
      if (
        !Number.isInteger(row.year) ||
        row.year < conference.requestedYear ||
        row.year > s.year ||
        !["scheduled", "completed", "cancelled"].includes(row.state)
      )
        problems.push("きょうだいの親世帯支援相談履歴が不正");
  }
  const supportLedger = s.house?.parentLedger;
  if (supportLedger?.status === "tracked") {
    if (
      !Array.isArray(supportLedger.pendingSiblingContributions) ||
      !Array.isArray(supportLedger.siblingContributionHistory) ||
      !Array.isArray(supportLedger.parentGiftHistory)
    )
      problems.push("実家家計の家族拠出記録が配列ではない");
    for (const row of [
      ...(supportLedger.pendingSiblingContributions || []),
      ...(supportLedger.siblingContributionHistory || [])
    ])
      if (
        !Number.isInteger(row.year) ||
        row.year > s.year ||
        !Number.isFinite(row.amount) ||
        row.amount <= 0 ||
        !services.siblingsOf(s).some(person => person.id === row.siblingId && person.independentSinceYear)
      )
        problems.push("実家家計のきょうだい拠出明細が不正");
    for (const row of supportLedger.history || [])
      if (
        row.siblingContributions != null &&
        (!Number.isFinite(row.siblingContributions) ||
          row.siblingContributions < 0 ||
          !Array.isArray(row.siblingContributionRows) ||
          Math.abs(
            row.siblingContributions - row.siblingContributionRows.reduce((sum, item) => sum + item.amount, 0)
          ) > 0.01)
      )
        problems.push("実家家計のきょうだい拠出合計と明細が不一致");
    for (const row of supportLedger.parentGiftHistory || [])
      if (
        !Number.isInteger(row.year) ||
        row.year > s.year ||
        !Number.isFinite(row.amount) ||
        row.amount <= 0 ||
        !Number.isFinite(row.debtPaid) ||
        row.debtPaid < 0 ||
        !Number.isFinite(row.cashAdded) ||
        row.cashAdded < 0 ||
        Math.abs(row.amount - row.debtPaid - row.cashAdded) > 0.01
      )
        problems.push("親世帯への一時送金明細が不正");
  }
}

function auditParentsAndSiblings(s, problems, services = STATE_AUDIT_SERVICES) {
  const movementLedger = s.house?.parentLedger;
  if (movementLedger?.status === "tracked") {
    if (
      movementLedger.res?.n !== movementLedger.region ||
      !Array.isArray(movementLedger.moveHistory) ||
      !Number.isInteger(movementLedger.knownMoveCount) ||
      movementLedger.knownMoveCount < 0 ||
      movementLedger.knownMoveCount > (movementLedger.moveHistory || []).length ||
      !services.REG.some(region => region.n === movementLedger.knownRegion) ||
      !Number.isFinite(movementLedger.moveKnownYear) ||
      movementLedger.moveKnownYear > s.year ||
      !Number.isFinite(movementLedger.moveReviewYear) ||
      movementLedger.moveReviewYear < s.year ||
      !Array.isArray(movementLedger.householdSiblingIds) ||
      movementLedger.householdSiblingIds.some(id => !services.siblingsOf(s).some(person => person.id === id))
    )
      problems.push("実家世帯の転居・既知情報・同居きょうだい記録が不正");
    for (const move of movementLedger.moveHistory || [])
      if (
        !Number.isInteger(move.year) ||
        move.year < movementLedger.sinceYear ||
        move.year > s.year ||
        !services.REG.some(region => region.n === move.from) ||
        !services.REG.some(region => region.n === move.to) ||
        move.from === move.to ||
        !Array.isArray(move.dependents) ||
        move.dependents.some(id => !services.siblingsOf(s).some(person => person.id === id))
      )
        problems.push("実家世帯の転居履歴が不正");
    for (const row of movementLedger.history || [])
      if (row.movingCost != null && (!Number.isFinite(row.movingCost) || row.movingCost < 0))
        problems.push("実家家計の転居費記録が不正");
  }
  const parentLedger = s.house?.parentLedger;
  if (parentLedger) {
    if (!["tracked", "ended", "legacy_unknown", "not_parent_household"].includes(parentLedger.status))
      problems.push("実家家計の追跡状態が不正");
    if (parentLedger.status === "tracked" || parentLedger.status === "ended") {
      if (
        !Number.isInteger(parentLedger.sinceYear) ||
        parentLedger.sinceYear > (parentLedger.lastUpdatedYear ?? s.year) ||
        !Number.isInteger(parentLedger.lastUpdatedYear) ||
        parentLedger.lastUpdatedYear > s.year ||
        !services.REG.some(region => region.n === parentLedger.region) ||
        !parentLedger.res ||
        !Number.isFinite(parentLedger.res.pm) ||
        parentLedger.res.pm <= 0 ||
        !Number.isFinite(parentLedger.priceIndex) ||
        parentLedger.priceIndex <= 0 ||
        !parentLedger.local ||
        !Number.isInteger(parentLedger.wealthIndex) ||
        parentLedger.wealthIndex < 0 ||
        parentLedger.wealthIndex >= services.EXP.length ||
        !Array.isArray(parentLedger.caregiverIds) ||
        !parentLedger.caregiverIds.length ||
        parentLedger.caregiverIds.some(id => ![s.par?.fa?.id, s.par?.mo?.id].includes(id)) ||
        new Set(parentLedger.caregiverIds).size !== parentLedger.caregiverIds.length
      )
        problems.push("実家家計の基準・居住地・養育者記録が不正");
      if (
        parentLedger.status === "ended" &&
        (!Number.isInteger(parentLedger.endedYear) ||
          parentLedger.endedYear < parentLedger.sinceYear ||
          parentLedger.endedYear > s.year)
      )
        problems.push("実家家計の終了年が不正");
      if (!Array.isArray(parentLedger.history) || parentLedger.history.length > 16)
        problems.push("実家家計の年次履歴が不正");
      else
        for (const row of parentLedger.history)
          if (
            !Number.isInteger(row.year) ||
            row.year < parentLedger.sinceYear ||
            row.year > s.year ||
            !["stable", "strained"].includes(row.status) ||
            [
              row.income,
              row.expense,
              row.net,
              row.cash,
              row.debt,
              row.treatmentCost,
              row.familyTreatmentSupport
            ].some(value => !Number.isFinite(value)) ||
            [row.income, row.expense, row.cash, row.debt, row.treatmentCost, row.familyTreatmentSupport].some(
              value => value < 0
            )
          )
            problems.push("実家家計の年次収支項目が不正");
      for (const row of parentLedger.history || [])
        if (
          row.siblingTreatmentContributionRows != null &&
          (!Array.isArray(row.siblingTreatmentContributionRows) ||
            row.siblingTreatmentContributionRows.some(
              item =>
                !services
                  .siblingsOf(s)
                  .some(person => person.id === item.siblingId && person.independentSinceYear) ||
                !Number.isFinite(item.amount) ||
                item.amount <= 0
            ) ||
            Math.abs(
              (row.familyTreatmentSiblingContributions || 0) -
                row.siblingTreatmentContributionRows.reduce((sum, item) => sum + item.amount, 0)
            ) > 0.01 ||
            Math.abs(
              (row.familyTreatmentSupport || 0) -
                row.familyTreatmentSiblingContributions -
                row.familyTreatmentPlayerContribution
            ) > 0.01)
        )
          problems.push("実家家計の親療養費分担明細が不正");
      for (const row of parentLedger.history || [])
        if (
          row.parentJobs != null &&
          (!Array.isArray(row.parentJobs) ||
            row.parentJobs.some(
              parent =>
                ![s.par?.fa?.id, s.par?.mo?.id].includes(parent.id) ||
                !Number.isInteger(parent.jobId) ||
                !services.J[parent.jobId] ||
                !Number.isFinite(parent.workShare) ||
                parent.workShare < 0 ||
                parent.workShare > 1
            ))
        )
          problems.push("実家家計の親の職業・就労可能度記録が不正");
      if (
        parentLedger.treatmentLapseDue &&
        (![s.par?.fa?.id, s.par?.mo?.id].includes(parentLedger.treatmentLapseDue.parentId) ||
          !Number.isInteger(parentLedger.treatmentLapseDue.dueYear) ||
          parentLedger.treatmentLapseDue.dueYear <= s.year ||
          typeof parentLedger.treatmentLapseDue.cause !== "string")
      )
        problems.push("実家家計の療養中断予定が不正");
      if (
        parentLedger.treatmentReviewDue &&
        (![s.par?.fa?.id, s.par?.mo?.id].includes(parentLedger.treatmentReviewDue.parentId) ||
          !Number.isInteger(parentLedger.treatmentReviewDue.dueYear) ||
          parentLedger.treatmentReviewDue.dueYear > s.year ||
          typeof parentLedger.treatmentReviewDue.cause !== "string")
      )
        problems.push("親本人の療養相談予定が不正");
      if (
        parentLedger.treatmentReviewNextYear != null &&
        (!Number.isInteger(parentLedger.treatmentReviewNextYear) ||
          parentLedger.treatmentReviewNextYear > s.year + 3)
      )
        problems.push("次回の親療養相談年が不正");
    } else if (
      parentLedger.sinceYear != null ||
      parentLedger.lastUpdatedYear != null ||
      parentLedger.history?.length
    )
      problems.push("追跡対象外または旧記録の実家家計へ根拠のない推移を付与");
  }
  for (const parent of [s.par?.fa, s.par?.mo].filter(Boolean)) {
    if (parent.d && (parent.d < parent.by || parent.d > s.year)) problems.push("親の死亡年が不正");
    if (
      parent.d &&
      (!Number.isFinite(parent.deathKnownYear) ||
        parent.deathKnownYear < parent.d ||
        parent.deathKnownYear > s.year)
    )
      problems.push("親の死亡年・認知年が不正");
    if (!parent.d && parent.deathKnownYear) problems.push("存命の親に死亡認知年が残存");
    if (parent.tx && (!parent.inf || parent.d)) problems.push("未感染または死亡した親の療養が継続中");
    if (
      parent.treatmentStartedYear != null &&
      (!Number.isFinite(parent.treatmentStartedYear) || parent.treatmentStartedYear > s.year)
    )
      problems.push("親の療養開始年が不正");
    if (
      parent.treatmentEndedYear != null &&
      (!Number.isFinite(parent.treatmentEndedYear) || parent.treatmentEndedYear > s.year)
    )
      problems.push("親の療養終了年が不正");
    if (
      !Number.isFinite(parent.treatmentPriority) ||
      parent.treatmentPriority < 0 ||
      parent.treatmentPriority > 1
    )
      problems.push("親の療養継続傾向が不正");
    if (
      parent.treatmentHistory != null &&
      (!Array.isArray(parent.treatmentHistory) ||
        parent.treatmentHistory.some(
          row =>
            !Number.isFinite(row.year) ||
            row.year > s.year ||
            !["started", "stopped", "reviewed"].includes(row.state) ||
            typeof row.cause !== "string"
        ))
    )
      problems.push("親の療養履歴が不正");
    const trackedParent =
      !parent.d &&
      s.house?.parentLedger?.status === "tracked" &&
      (s.house.parentLedger.caregiverIds || []).includes(parent.id);
    if (
      !Array.isArray(parent.jobHistory) ||
      parent.jobHistory.length > 100 ||
      !Number.isInteger(parent.knownJobId) ||
      !services.J[parent.knownJobId] ||
      !Number.isInteger(parent.knownJobChangeCount) ||
      parent.knownJobChangeCount < 0 ||
      parent.knownJobChangeCount > parent.jobHistory.length ||
      !Number.isFinite(parent.jobKnownYear) ||
      parent.jobKnownYear > s.year ||
      !Number.isFinite(parent.workReviewYear) ||
      (trackedParent && parent.workReviewYear < s.year)
    )
      problems.push("親の仕事・本人把握履歴が不正");
    for (const change of parent.jobHistory || [])
      if (
        !Number.isFinite(change.year) ||
        change.year > s.year ||
        !Number.isInteger(change.fromJobId) ||
        !services.J[change.fromJobId] ||
        !Number.isInteger(change.toJobId) ||
        !services.J[change.toJobId] ||
        change.fromJobId === change.toJobId ||
        typeof change.cause !== "string"
      )
        problems.push("親の職業変更履歴が不正");
  }
  for (const [key, parent] of Object.entries(s.par || {})) {
    if (!parent) continue;
    if (!Number.isFinite(parent.health) || parent.health < 0 || parent.health > 100)
      problems.push(`${key}の健康モデル値が範囲外`);
    if (!Number.isFinite(parent.workShare) || parent.workShare < 0 || parent.workShare > 1)
      problems.push(`${key}の就労可能度が範囲外`);
    if (!Number.isFinite(parent.healthUpdatedYear) || parent.healthUpdatedYear > s.year)
      problems.push(`${key}の健康更新年が不正`);
  }
  if (
    s.parentUnemploymentTargetKey != null &&
    (!["fa", "mo"].includes(s.parentUnemploymentTargetKey) ||
      !s.fl.parent_unemployed ||
      !s.par?.[s.parentUnemploymentTargetKey] ||
      s.par[s.parentUnemploymentTargetKey].d)
  )
    problems.push("親の失業対象キーが不正");
  if (!Array.isArray(s.siblings)) problems.push("きょうだい記録が配列ではない");
  if (
    !Number.isInteger(s.legacySiblingCount || 0) ||
    (s.legacySiblingCount || 0) < 0 ||
    (s.legacySiblingCount || 0) > 99 ||
    services.siblingCount(s) > 99
  )
    problems.push("個別記録のない旧きょうだい人数が不正");
  else
    for (const sibling of s.siblings) {
      if (!sibling.nm || !services.RACE.some(r => r.n === sibling.r?.n))
        problems.push("きょうだいの識別情報が不正");
      if (!Number.isFinite(sibling.by) || sibling.by > s.year) problems.push("きょうだいの出生年が不正");
      if (sibling.d && (sibling.d < sibling.by || sibling.d > s.year))
        problems.push("きょうだいの死亡年が不正");
      if (
        sibling.d &&
        (sibling.deathNoticePending
          ? sibling.deathKnownYear != null ||
            !Number.isFinite(sibling.deathNoticeAvailableYear) ||
            sibling.deathNoticeAvailableYear < sibling.d ||
            sibling.deathNoticeAvailableYear > s.year + 2
          : !Number.isFinite(sibling.deathKnownYear) ||
            sibling.deathKnownYear < sibling.d ||
            sibling.deathKnownYear > s.year)
      )
        problems.push("きょうだいの死亡年・認知年が不正");
      if (!sibling.d && (sibling.deathKnownYear || sibling.deathNoticePending))
        problems.push("存命のきょうだいに死亡認知年が残存");
      if (sibling.tx != null && (![0, 1].includes(sibling.tx) || (sibling.tx && !sibling.inf)))
        problems.push("きょうだいの継続診療計画が不正");
      if (
        sibling.treatmentPlanYear != null &&
        (!Number.isInteger(sibling.treatmentPlanYear) ||
          sibling.treatmentPlanYear < sibling.by ||
          sibling.treatmentPlanYear > s.year ||
          !sibling.tx)
      )
        problems.push("きょうだいの継続診療開始年が不正");
      if (
        sibling.treatmentPlanHistory != null &&
        (!Array.isArray(sibling.treatmentPlanHistory) ||
          sibling.treatmentPlanHistory.length > 12 ||
          sibling.treatmentPlanHistory.some(
            row =>
              !Number.isInteger(row.year) ||
              row.year < sibling.by ||
              row.year > s.year ||
              ![0, 1].includes(row.from) ||
              ![0, 1].includes(row.to) ||
              row.from === row.to ||
              typeof row.cause !== "string"
          ))
      )
        problems.push("きょうだいの継続診療計画履歴が不正");
      if (sibling.inf && !sibling.infCause) problems.push("感染したきょうだいの曝露経路記録がない");
      if (
        sibling.exposurePending &&
        (!Number.isFinite(sibling.exposureYear) ||
          sibling.exposureYear > s.year ||
          !Number.isFinite(sibling.exposureKnownYear) ||
          sibling.exposureKnownYear > s.year ||
          !Number.isFinite(sibling.exposureReviewYear) ||
          sibling.exposureReviewYear < sibling.exposureYear ||
          !sibling.exposureCause ||
          sibling.inf ||
          sibling.d)
      )
        problems.push("きょうだいの曝露後検査待ち記録が不正");
      if (
        sibling.exposureClosedYear != null &&
        (!Number.isFinite(sibling.exposureClosedYear) ||
          sibling.exposureClosedYear > s.year ||
          sibling.exposurePending ||
          sibling.inf)
      )
        problems.push("きょうだいの曝露後再診保留記録が不正");
      if (
        sibling.exposureEmployerResponse != null &&
        (!["partial-cost", "denied"].includes(sibling.exposureEmployerResponse) ||
          !Number.isFinite(sibling.exposureYear) ||
          !Number.isFinite(sibling.exposureEmployerResponseYear) ||
          sibling.exposureEmployerResponseYear < sibling.exposureYear ||
          sibling.exposureEmployerResponseYear > s.year)
      )
        problems.push("きょうだいの勤務先による曝露報告への回答が不正");
      if (
        sibling.exposureEmployerResponse == null &&
        sibling.exposureEmployerResponseYear != null
      )
        problems.push("きょうだいの勤務先回答年が欠落した曝露報告記録");
      if (
        sibling.independentSinceYear &&
        (sibling.independentSinceYear < sibling.by || sibling.independentSinceYear > s.year)
      )
        problems.push("きょうだいの別居開始年が不正");
      if (
        sibling.independenceDiscussedYear &&
        (sibling.independenceDiscussedYear < sibling.by || sibling.independenceDiscussedYear > s.year)
      )
        problems.push("きょうだいの独立相談年が不正");
      if (
        sibling.independenceOpeningReserve != null &&
        (!Number.isFinite(sibling.independenceOpeningReserve) ||
          sibling.independenceOpeningReserve < 0 ||
          sibling.independenceOpeningReserve > 4e4 ||
          sibling.independenceOpeningReserveYear !== sibling.independentSinceYear)
      )
        problems.push("きょうだいの独立準備金記録が不正");
    }
}

function auditSiblingAndPartnerState(s, problems, services = STATE_AUDIT_SERVICES) {
  for (const sibling of services.siblingsOf(s)) {
    if (sibling.contactState != null && !["regular", "paused", "ended"].includes(sibling.contactState))
      problems.push("別居きょうだいとの連絡状態が不正");
    if (sibling.contactState && !sibling.independentSinceYear)
      problems.push("同居中のきょうだいに別居後の連絡状態がある");
    if (
      sibling.contactState === "ended" &&
      (!Number.isFinite(sibling.contactEndedYear) ||
        sibling.contactEndedYear < sibling.independentSinceYear ||
        sibling.contactEndedYear > s.year ||
        sibling.contactReviewYear != null)
    )
      problems.push("きょうだいとの連絡終了記録が不正");
    if (sibling.contactState !== "ended" && sibling.contactEndedYear != null)
      problems.push("連絡中のきょうだいに終了年が残存");
    if (
      sibling.contactReopenedYear != null &&
      (sibling.contactState === "ended" ||
        !Number.isFinite(sibling.contactReopenedYear) ||
        sibling.contactReopenedYear < sibling.independentSinceYear ||
        sibling.contactReopenedYear > s.year)
    )
      problems.push("きょうだいとの再接触年が不正");
    if (
      sibling.reconnectReviewYear != null &&
      (!Number.isFinite(sibling.reconnectReviewYear) ||
        sibling.reconnectReviewYear < sibling.contactEndedYear ||
        sibling.reconnectReviewYear > s.year + services.P("family.siblingRecontactReviewMaxYears"))
    )
      problems.push("きょうだいとの再接触確認年が不正");
    if (
      sibling.reconnectInviteYear != null &&
      (!Number.isFinite(sibling.reconnectInviteYear) ||
        sibling.contactState !== "ended" ||
        sibling.reconnectInviteYear > s.year ||
        sibling.reconnectInviteYear < sibling.contactEndedYear)
    )
      problems.push("きょうだいからの再接触便り年が不正");
    if (
      sibling.contactHistory != null &&
      (!Array.isArray(sibling.contactHistory) ||
        sibling.contactHistory.some(
          (h, i) =>
            !Number.isFinite(h.year) ||
            h.year < (sibling.independentSinceYear || sibling.by) ||
            h.year > s.year ||
            !["ended", "declined", "reopened", "recontact_invited"].includes(h.state) ||
            (h.initiatedBy != null && !["protagonist", "sibling"].includes(h.initiatedBy)) ||
            (i > 0 && h.year < sibling.contactHistory[i - 1].year)
        ))
    )
      problems.push("きょうだいとの関係履歴が不正");
    if (
      sibling.contactReviewYear != null &&
      (!Number.isFinite(sibling.contactReviewYear) ||
        sibling.contactReviewYear < sibling.by ||
        sibling.contactReviewYear > s.year + 10)
    )
      problems.push("きょうだいとの連絡再確認年が不正");
    if (
      sibling.lastContactYear != null &&
      (!Number.isFinite(sibling.lastContactYear) ||
        sibling.lastContactYear < sibling.by ||
        sibling.lastContactYear > s.year)
    )
      problems.push("きょうだいとの最終連絡年が不正");
    if (
      sibling.lastAidYear != null &&
      (!Number.isFinite(sibling.lastAidYear) ||
        sibling.lastAidYear < sibling.by ||
        sibling.lastAidYear > s.year ||
        !Number.isFinite(sibling.lastAidAmount) ||
        sibling.lastAidAmount <= 0)
    )
      problems.push("きょうだいへの一時援助記録が不正");
    if (
      sibling.careSupportAnnual != null &&
      (!Number.isFinite(sibling.careSupportAnnual) ||
        sibling.careSupportAnnual < 0 ||
        sibling.careSupportAnnual > services.P("economy.siblingInfectionSupportAnnualCost") ||
        (sibling.careSupportAnnual > 0 &&
          (!sibling.independentSinceYear ||
            !sibling.inf ||
            sibling.d ||
            !Number.isFinite(sibling.careSupportStartedYear) ||
            sibling.careSupportStartedYear > s.year)))
    )
      problems.push("別居きょうだいへの療養支援記録が不正");
    if (
      sibling.careSupportEndedYear != null &&
      (!Number.isFinite(sibling.careSupportEndedYear) ||
        sibling.careSupportEndedYear <
          (sibling.careSupportStartedYear || sibling.independentSinceYear || sibling.by) ||
        sibling.careSupportEndedYear > s.year)
    )
      problems.push("別居きょうだいへの療養支援終了年が不正");
    if (
      sibling.aidReceivedTotal != null &&
      (!Number.isFinite(sibling.aidReceivedTotal) || sibling.aidReceivedTotal < 0)
    )
      problems.push("別居きょうだいの支援受領総額が不正");
    if (
      sibling.careSupportPaidTotal != null &&
      (!Number.isFinite(sibling.careSupportPaidTotal) || sibling.careSupportPaidTotal < 0)
    )
      problems.push("別居きょうだいへの療養支援累計が不正");
    if (
      sibling.careSupportPaidYear != null &&
      (!Number.isFinite(sibling.careSupportPaidYear) ||
        sibling.careSupportPaidYear > (sibling.careSupportEndedYear ?? s.year) ||
        sibling.careSupportPaidYear <
          (sibling.careSupportStartedYear || sibling.independentSinceYear || sibling.by) ||
        !Number.isFinite(sibling.careSupportPaidAmount) ||
        sibling.careSupportPaidAmount <= 0)
    )
      problems.push("別居きょうだいへの療養支払記録が不正");
  }
  for (const sibling of services.siblingsOf(s)) {
    if (sibling.visitHistory != null && !Array.isArray(sibling.visitHistory))
      problems.push("きょうだいへの訪問履歴が配列ではない");
    const visits = Array.isArray(sibling.visitHistory) ? sibling.visitHistory : [];
    if (
      !Number.isInteger(sibling.visitCount || 0) ||
      (sibling.visitCount || 0) < visits.length ||
      !Number.isFinite(sibling.visitTotal || 0) ||
      (sibling.visitTotal || 0) <
        visits.reduce((sum, visit) => sum + (Number.isFinite(visit.fare) ? visit.fare : 0), 0) - 0.01
    )
      problems.push("きょうだいへの訪問回数・累計費用が不正");
    for (const visit of visits)
      if (
        !Number.isInteger(visit.year) ||
        visit.year < (sibling.independentSinceYear || sibling.by) ||
        visit.year > s.year ||
        !services.REG.some(region => region.n === visit.from) ||
        !services.REG.some(region => region.n === visit.to) ||
        !Number.isFinite(visit.fare) ||
        visit.fare < 0 ||
        !["local", "regional"].includes(visit.kind) ||
        (visit.kind === "local" && visit.from !== visit.to) ||
        (visit.kind === "regional" &&
          (visit.from === visit.to ||
            !(services.MIGRATION_ROUTES[visit.from] || []).some(route => route.n === visit.to))) ||
        !["household", "personal"].includes(visit.paidBy)
      )
        problems.push("きょうだいへの訪問履歴内容が不正");
  }
  for (const sibling of services.siblingsOf(s)) {
    if (
      sibling.lastHealthAidYear != null &&
      (!Number.isFinite(sibling.lastHealthAidYear) ||
        sibling.lastHealthAidYear < (sibling.independentSinceYear || sibling.by) ||
        sibling.lastHealthAidYear > s.year ||
        !Number.isFinite(sibling.lastHealthAidAmount) ||
        sibling.lastHealthAidAmount <= 0)
    )
      problems.push("きょうだいの診療・移動援助記録が不正");
    if (sibling.lastHealthAidYear == null && sibling.lastHealthAidAmount != null)
      problems.push("きょうだいの一時医療援助年が不足");
    if (
      (sibling.healthHistory || []).some(
        h => h.amount != null && (!Number.isFinite(h.amount) || h.amount < 0)
      )
    )
      problems.push("きょうだいの健康履歴に不正な支出額がある");
  }
  for (const sibling of services.siblingsOf(s))
    if (sibling.independentSinceYear) {
      if (
        !Number.isFinite(sibling.financialCash) ||
        sibling.financialCash < 0 ||
        !Number.isFinite(sibling.financialDebt) ||
        sibling.financialDebt < 0
      )
        problems.push("別居きょうだいの家計残高・負債が不正");
      if (
        !Number.isInteger(sibling.financialExpenseTier) ||
        sibling.financialExpenseTier < 0 ||
        sibling.financialExpenseTier >= services.EXP.length
      )
        problems.push("別居きょうだいの生活費階層が不正");
      if (!Number.isFinite(sibling.financialPriceIndex) || sibling.financialPriceIndex <= 0)
        problems.push("別居きょうだいの物価指数が不正");
      if (
        !Number.isFinite(sibling.financialUpdatedYear) ||
        sibling.financialUpdatedYear < sibling.independentSinceYear ||
        sibling.financialUpdatedYear > s.year
      )
        problems.push("別居きょうだいの家計更新年が不正");
      if (!["stable", "strained", "unknown"].includes(sibling.financialStatus))
        problems.push("別居きょうだいの家計状態が不正");
      if (
        sibling.knownFinancialStatus != null &&
        (!["stable", "strained"].includes(sibling.knownFinancialStatus) ||
          !Number.isFinite(sibling.financialKnownYear) ||
          sibling.financialKnownYear < sibling.independentSinceYear ||
          sibling.financialKnownYear > s.year)
      )
        problems.push("本人が把握するきょうだいの家計記録が不正");
      if (
        sibling.financialNoticeYear != null &&
        (!Number.isFinite(sibling.financialNoticeYear) ||
          sibling.financialNoticeYear < sibling.independentSinceYear ||
          sibling.financialNoticeYear > s.year)
      )
        problems.push("きょうだいの家計知らせ年が不正");
      if (!Array.isArray(sibling.financialHistory) || sibling.financialHistory.length > 12)
        problems.push("別居きょうだいの家計履歴が不正");
      for (const row of sibling.financialHistory || [])
        if (
          !Number.isFinite(row.year) ||
          row.year <= sibling.independentSinceYear ||
          row.year > s.year ||
          !Number.isFinite(row.income) ||
          row.income < 0 ||
          !Number.isFinite(row.expense) ||
          row.expense < 0 ||
          !Number.isFinite(row.cash) ||
          row.cash < 0 ||
          !Number.isFinite(row.debt) ||
          row.debt < 0 ||
          !["stable", "strained"].includes(row.status)
        )
          problems.push("別居きょうだいの年次収支履歴が不正");
      if (
        sibling.parentTreatmentContributionPaidYear != null &&
        (!Number.isInteger(sibling.parentTreatmentContributionPaidYear) ||
          sibling.parentTreatmentContributionPaidYear < sibling.independentSinceYear ||
          sibling.parentTreatmentContributionPaidYear > s.year ||
          !Number.isFinite(sibling.parentTreatmentContributionPaidAmount) ||
          sibling.parentTreatmentContributionPaidAmount <= 0 ||
          !Number.isFinite(sibling.parentTreatmentContributionPaidTotal) ||
          sibling.parentTreatmentContributionPaidTotal < sibling.parentTreatmentContributionPaidAmount)
      )
        problems.push("別居きょうだいの親療養費分担記録が不正");
      if (
        sibling.parentTreatmentContributionPaidYear == null &&
        (sibling.parentTreatmentContributionPaidAmount != null ||
          sibling.parentTreatmentContributionPaidTotal != null)
      )
        problems.push("別居きょうだいの親療養費分担年が欠落");
      if (!Array.isArray(sibling.financialTransfers) || sibling.financialTransfers.length > 12)
        problems.push("きょうだいへの家族資金移転履歴が不正");
      for (const transfer of sibling.financialTransfers || []) {
        const isOutgoing =
            transfer.direction === "out" &&
            [
              "別居きょうだい本人が親世帯へ定期拠出",
              "別居きょうだい本人が親の療養費を医療機関へ直接分担"
            ].includes(transfer.reason),
          invalid = isOutgoing
            ? transfer.debtPayment != null || transfer.cashAdded != null
            : !Number.isFinite(transfer.debtPayment) ||
              transfer.debtPayment < 0 ||
              !Number.isFinite(transfer.cashAdded) ||
              transfer.cashAdded < 0 ||
              Math.abs(transfer.amount - transfer.debtPayment - transfer.cashAdded) > 1e-6;
        if (
          !Number.isFinite(transfer.year) ||
          transfer.year < sibling.independentSinceYear ||
          transfer.year > s.year ||
          !Number.isFinite(transfer.amount) ||
          transfer.amount <= 0 ||
          (!isOutgoing && transfer.direction != null) ||
          invalid
        )
          problems.push("きょうだいへの家族資金移転記録が不正");
      }
    }
  for (const sibling of services.siblingsOf(s)) {
    if (sibling.region != null && !services.REG.some(region => region.n === sibling.region))
      problems.push("きょうだいの居住地域が不正");
    if (sibling.knownRegion != null && !services.REG.some(region => region.n === sibling.knownRegion))
      problems.push("きょうだいの既知の居住地域が不正");
    if (
      sibling.regionKnownYear != null &&
      (!Number.isFinite(sibling.regionKnownYear) ||
        sibling.regionKnownYear < (sibling.independentSinceYear || sibling.by) ||
        sibling.regionKnownYear > s.year)
    )
      problems.push("きょうだいの居住確認年が不正");
    if (
      sibling.moveReviewYear != null &&
      (!Number.isFinite(sibling.moveReviewYear) ||
        sibling.moveReviewYear < s.year ||
        sibling.moveReviewYear > s.year + services.P("family.siblingMoveReviewMaxYears"))
    )
      problems.push("きょうだいの転居見直し年が不正");
    if (sibling.moveHistory != null && !Array.isArray(sibling.moveHistory))
      problems.push("きょうだいの転居履歴が配列ではない");
    const moves = Array.isArray(sibling.moveHistory) ? sibling.moveHistory : [];
    if (
      !Number.isInteger(sibling.knownMoveCount || 0) ||
      (sibling.knownMoveCount || 0) < 0 ||
      (sibling.knownMoveCount || 0) > moves.length
    )
      problems.push("本人が把握するきょうだいの転居件数が不正");
    if (
      sibling.independentSinceYear &&
      (!sibling.region ||
        !sibling.knownRegion ||
        !Number.isFinite(sibling.regionKnownYear) ||
        (!sibling.d && !Number.isFinite(sibling.moveReviewYear)) ||
        (sibling.d && sibling.moveReviewYear != null))
    )
      problems.push("別居きょうだいの居住記録が不足");
    for (const move of moves)
      if (
        !Number.isFinite(move.year) ||
        move.year <= (sibling.independentSinceYear || sibling.by) ||
        move.year > s.year ||
        !services.REG.some(region => region.n === move.from) ||
        !services.REG.some(region => region.n === move.to) ||
        move.from === move.to
      )
        problems.push("きょうだいの転居記録が不正");
    if (
      sibling.knownJobId != null &&
      (!Number.isInteger(sibling.knownJobId) || !services.J[sibling.knownJobId])
    )
      problems.push("きょうだいの既知の職業IDが不正");
    if (
      sibling.jobKnownYear != null &&
      (!Number.isFinite(sibling.jobKnownYear) ||
        sibling.jobKnownYear < (sibling.independentSinceYear || sibling.by) ||
        sibling.jobKnownYear > s.year)
    )
      problems.push("きょうだいの職業確認年が不正");
    if (
      sibling.workReviewYear != null &&
      (!Number.isFinite(sibling.workReviewYear) ||
        sibling.workReviewYear < s.year ||
        sibling.workReviewYear > s.year + services.P("family.siblingWorkReviewMaxYears"))
    )
      problems.push("きょうだいの仕事再確認年が不正");
    if (
      sibling.independentSinceYear &&
      (!Number.isInteger(sibling.knownJobId) ||
        !Number.isFinite(sibling.jobKnownYear) ||
        (!sibling.d && !Number.isFinite(sibling.workReviewYear)) ||
        (sibling.d && sibling.workReviewYear != null))
    )
      problems.push("別居きょうだいの仕事記録が不足");
    if (sibling.independentSinceYear) {
      if (!Number.isFinite(sibling.health) || sibling.health < 0 || sibling.health > 100)
        problems.push("別居きょうだいの健康値が範囲外");
      if (
        !Number.isFinite(sibling.healthUpdatedYear) ||
        sibling.healthUpdatedYear > s.year ||
        sibling.healthUpdatedYear < sibling.independentSinceYear
      )
        problems.push("別居きょうだいの健康更新年が不正");
      if (!Number.isFinite(sibling.knownHealth) || sibling.knownHealth < 0 || sibling.knownHealth > 100)
        problems.push("本人が把握するきょうだいの健康値が範囲外");
      if (
        !Number.isFinite(sibling.healthKnownYear) ||
        sibling.healthKnownYear < sibling.independentSinceYear ||
        sibling.healthKnownYear > s.year
      )
        problems.push("きょうだいの健康確認年が不正");
      if (!Array.isArray(sibling.healthHistory)) problems.push("きょうだいの健康履歴が配列ではない");
      for (const h of sibling.healthHistory || [])
        if (
          !Number.isFinite(h.year) ||
          h.year <= sibling.independentSinceYear ||
          h.year > s.year ||
          !Number.isFinite(h.from) ||
          !Number.isFinite(h.to) ||
          h.from < 0 ||
          h.from > 100 ||
          h.to < 0 ||
          h.to > 100
        )
          problems.push("きょうだいの健康履歴が不正");
    }
    if (sibling.jobHistory != null && !Array.isArray(sibling.jobHistory))
      problems.push("きょうだいの職歴が配列ではない");
    const history = Array.isArray(sibling.jobHistory) ? sibling.jobHistory : [];
    if (
      !Number.isInteger(sibling.knownJobChangeCount || 0) ||
      (sibling.knownJobChangeCount || 0) < 0 ||
      (sibling.knownJobChangeCount || 0) > history.length
    )
      problems.push("親が把握するきょうだいの転職件数が不正");
    for (const change of history)
      if (
        !Number.isFinite(change.year) ||
        change.year <= (sibling.independentSinceYear || sibling.by) ||
        change.year > s.year ||
        !Number.isInteger(change.fromJobId) ||
        !services.J[change.fromJobId] ||
        !Number.isInteger(change.toJobId) ||
        !services.J[change.toJobId] ||
        change.fromJobId === change.toJobId
      )
        problems.push("きょうだいの職歴記録が不正");
  }
  const spouseFinance = s.sp?.personalFinance;
  if (spouseFinance) {
    if (
      !["modeled_balance", "legacy_unknown_balance"].includes(spouseFinance.status) ||
      !Number.isInteger(spouseFinance.startedYear) ||
      spouseFinance.startedYear > s.year + 1 ||
      !Number.isFinite(spouseFinance.netChangeSinceStart) ||
      !Array.isArray(spouseFinance.history) ||
      spouseFinance.history.length > 20
    )
      problems.push("配偶者本人の家計状態が不正");
    if (
      spouseFinance.status === "modeled_balance" &&
      (!Number.isFinite(spouseFinance.cash) ||
        spouseFinance.cash < 0 ||
        !Number.isFinite(spouseFinance.debt) ||
        spouseFinance.debt < 0 ||
        !Number.isFinite(spouseFinance.openingCash) ||
        spouseFinance.openingCash < 0 ||
        !Number.isFinite(spouseFinance.openingDebt) ||
        spouseFinance.openingDebt < 0 ||
        !Number.isInteger(spouseFinance.expenseTier) ||
        spouseFinance.expenseTier < 0 ||
        spouseFinance.expenseTier >= services.EXP.length ||
        !["stable", "strained"].includes(spouseFinance.condition))
    )
      problems.push("配偶者本人の推定貯蓄・負債が不正");
    if (
      spouseFinance.status === "legacy_unknown_balance" &&
      (spouseFinance.cash != null ||
        spouseFinance.debt != null ||
        spouseFinance.openingCash != null ||
        spouseFinance.openingDebt != null)
    )
      problems.push("旧配偶者記録へ不明残高が補われている");
    let previousSpouseFinanceYear = spouseFinance.startedYear - 1;
    for (const row of spouseFinance.history || []) {
      if (
        !Number.isInteger(row.year) ||
        row.year < spouseFinance.startedYear ||
        row.year > s.year ||
        row.year <= previousSpouseFinanceYear ||
        !services.REG.some(region => region.n === row.region) ||
        [
          row.income,
          row.contribution,
          row.support,
          row.living,
          row.housing ?? 0,
          row.medical,
          row.coveredLiving,
          row.coveredMedical,
          row.relocation ?? 0,
          row.housingSetup ?? 0
        ].some(value => !Number.isFinite(value) || value < 0) ||
        (row.supportTransactionId != null &&
          (typeof row.supportTransactionId !== "string" || !row.supportTransactionId || row.support <= 0)) ||
        !Number.isFinite(row.net) ||
        (row.interest != null && (!Number.isFinite(row.interest) || row.interest < 0)) ||
        (row.cash != null && (!Number.isFinite(row.cash) || row.cash < 0)) ||
        (row.debt != null && (!Number.isFinite(row.debt) || row.debt < 0))
      )
        problems.push("配偶者本人の年次家計履歴が不正");
      previousSpouseFinanceYear = row.year;
    }
  }
  if (
    s.sp?.workPreferenceReviewCause != null &&
    !["rejoin", "independent_move"].includes(s.sp.workPreferenceReviewCause)
  )
    problems.push("配偶者の仕事希望相談理由が不正");
  if (
    s.sp?.health != null &&
    (!Number.isFinite(s.sp.health) ||
      s.sp.health < 0 ||
      s.sp.health > 100 ||
      !Number.isInteger(s.sp.healthUpdatedYear) ||
      s.sp.healthUpdatedYear < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
      s.sp.healthUpdatedYear > s.year ||
      !["new-marriage", "legacy-current-baseline", "legacy-recorded"].includes(s.sp.healthBasis) ||
      !["unreviewed", "consult", "lighter_load", "defer"].includes(s.sp.healthPlan) ||
      (s.sp.healthNoticePending != null && typeof s.sp.healthNoticePending !== "boolean") ||
      !Number.isInteger(s.sp.healthNextReviewYear) ||
      (!s.sp.d && s.sp.healthNextReviewYear < s.year) ||
      !Array.isArray(s.sp.healthHistory) ||
      s.sp.healthHistory.length > 12 ||
      !Array.isArray(s.sp.healthReviewHistory) ||
      s.sp.healthReviewHistory.length > 12)
  )
    problems.push("配偶者の一般的な体調目安記録が不正");
  for (const row of s.sp?.healthHistory || [])
    if (
      !Number.isInteger(row.year) ||
      row.year < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
      row.year > s.sp.healthUpdatedYear ||
      !Number.isFinite(row.from) ||
      !Number.isFinite(row.to) ||
      row.from < 0 ||
      row.from > 100 ||
      row.to < 0 ||
      row.to > 100 ||
      typeof row.cause !== "string" ||
      row.basis !== "game-model"
    )
      problems.push("配偶者の体調目安履歴が不正");
  for (const row of s.sp?.healthReviewHistory || [])
    if (
      !Number.isInteger(row.year) ||
      row.year < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
      row.year > s.year ||
      !["consult", "lighter_load", "defer"].includes(row.plan) ||
      !Number.isFinite(row.health) ||
      row.health < 0 ||
      row.health > 100 ||
      !Number.isFinite(row.cost) ||
      row.cost < 0
    )
      problems.push("配偶者の体調相談履歴が不正");
  if (s.sp?.workPreference != null && !["income", "low_hazard", "stay", "open"].includes(s.sp.workPreference))
    problems.push("配偶者の仕事希望が不正");
  if (s.sp?.workPreferenceReviewPending != null && typeof s.sp.workPreferenceReviewPending !== "boolean")
    problems.push("配偶者の仕事希望相談状態が不正");
  const preferenceMin = services.P("family.spouseWorkPreferenceReviewMinYears"),
    preferenceMax = services.P("family.spouseWorkPreferenceReviewMaxYears");
  if (
    s.sp?.workPreferenceReviewYear != null &&
    (!Number.isInteger(s.sp.workPreferenceReviewYear) ||
      s.sp.workPreferenceReviewYear > s.year + preferenceMax ||
      (s.sp.workPreferenceReviewYear <= s.year && !s.sp.workPreferenceReviewPending))
  )
    problems.push("配偶者の仕事希望見直し年が不正");
  if (s.sp?.workPreferenceHistory != null && !Array.isArray(s.sp.workPreferenceHistory))
    problems.push("配偶者の仕事希望履歴が配列ではない");
  for (const row of s.sp?.workPreferenceHistory || [])
    if (
      !Number.isInteger(row.year) ||
      row.year < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
      row.year > s.year ||
      !["unrecorded", "income", "low_hazard", "stay", "open"].includes(row.from) ||
      !["income", "low_hazard", "stay", "open"].includes(row.to)
    )
      problems.push("配偶者の仕事希望履歴が不正");
  if (s.sp?.residenceRegion != null && !services.REG.some(region => region.n === s.sp.residenceRegion))
    problems.push("配偶者の居住地域が不正");
  if (s.sp?.sharesHousehold != null && typeof s.sp.sharesHousehold !== "boolean")
    problems.push("配偶者の同一世帯状態が不正");
  if (s.sp?.sharesHousehold === true && s.sp.residenceRegion != null && s.sp.residenceRegion !== s.res.n)
    problems.push("別地域にいる配偶者が同じ世帯として記録されている");
  if (
    s.sp?.knownResidenceRegion != null &&
    !services.REG.some(region => region.n === s.sp.knownResidenceRegion)
  )
    problems.push("本人が把握する配偶者の居住地域が不正");
  const spouseMoveNotice = s.sp?.residenceMoveNotice;
  if (
    spouseMoveNotice &&
    (!Number.isInteger(spouseMoveNotice.year) ||
      spouseMoveNotice.year < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
      spouseMoveNotice.year > s.year ||
      !Number.isInteger(spouseMoveNotice.availableYear) ||
      spouseMoveNotice.availableYear !== spouseMoveNotice.year + 1 ||
      (spouseMoveNotice.deliveredYear != null &&
        (!Number.isInteger(spouseMoveNotice.deliveredYear) ||
          spouseMoveNotice.deliveredYear < spouseMoveNotice.availableYear ||
          spouseMoveNotice.deliveredYear > s.year)) ||
      !services.REG.some(region => region.n === spouseMoveNotice.from) ||
      !services.REG.some(region => region.n === spouseMoveNotice.to) ||
      spouseMoveNotice.from === spouseMoveNotice.to ||
      typeof spouseMoveNotice.cause !== "string")
  )
    problems.push("配偶者の転居知らせが不正");
  const spouseNoticeHistory = s.sp?.residenceNoticeHistory;
  if (spouseNoticeHistory != null && (!Array.isArray(spouseNoticeHistory) || spouseNoticeHistory.length > 12))
    problems.push("配偶者の転居知らせ履歴が不正");
  if (Array.isArray(spouseNoticeHistory))
    for (const notice of spouseNoticeHistory)
      if (
        !Number.isInteger(notice.year) ||
        notice.year > s.year ||
        !Number.isInteger(notice.moveYear) ||
        notice.moveYear > notice.year ||
        !services.REG.some(region => region.n === notice.from) ||
        !services.REG.some(region => region.n === notice.to)
      )
        problems.push("配偶者の転居知らせ履歴項目が不正");
  if (
    s.sp?.independentMoveReviewYear != null &&
    !services.spouseLivesWithProtagonist(s) &&
    (!Number.isInteger(s.sp.independentMoveReviewYear) ||
      s.sp.independentMoveReviewYear < s.year ||
      s.sp.independentMoveReviewYear > s.year + services.P("family.spouseMoveReviewMaxYears"))
  )
    problems.push("配偶者の転居再確認年が不正");
  const contactHistory = s.sp?.separateContactHistory;
  if (contactHistory != null && (!Array.isArray(contactHistory) || contactHistory.length > 16))
    problems.push("配偶者の別居連絡費履歴が不正");
  if (Array.isArray(contactHistory)) {
    const contactSum = contactHistory.reduce(
      (sum, row) => sum + (Number.isFinite(row.amount) ? row.amount : 0),
      0
    );
    if (
      !Number.isFinite(s.sp.separateContactPaidTotal || 0) ||
      (s.sp.separateContactPaidTotal || 0) < contactSum - 0.01
    )
      problems.push("配偶者の連絡費累計が不正");
    for (const row of contactHistory)
      if (
        !Number.isInteger(row.year) ||
        row.year < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
        row.year > s.year ||
        !Number.isFinite(row.amount) ||
        row.amount <= 0 ||
        !services.REG.some(region => region.n === row.region) ||
        !(row.plan === "regular" || row.plan === "letters")
      )
        problems.push("配偶者の別居連絡費記録が不正");
  }
}
