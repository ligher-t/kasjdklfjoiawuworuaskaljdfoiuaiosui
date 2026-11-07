function auditCareAndWorkplaceState(s, problems, services = STATE_AUDIT_SERVICES) {
  if (s.study) {
    if (
      !Number.isInteger(s.study.yearsPaid) ||
      s.study.yearsPaid < 1 ||
      s.study.yearsPaid > s.study.duration ||
      !Number.isFinite(s.study.nextDue)
    )
      problems.push("在籍年次が不正");
    if (services.restricted(s) && !s.study.suspended) problems.push("収容・隔離中の通学が中断されていない");
  }
  if (!Array.isArray(s.familyCareHistory) || s.familyCareHistory.length > 16)
    problems.push("親族ケア履歴の配列または上限が不正");
  else
    for (const row of s.familyCareHistory)
      if (
        !Number.isFinite(row.year) ||
        row.year < (s.by || services.START) ||
        row.year > s.year ||
        ![
          "started",
          "contribution_paused",
          "sibling_contribution",
          "sibling_contribution_unavailable",
          "period_ended",
          "reviewed",
          "capacity_review",
          "capacity_ended"
        ].includes(row.type) ||
        ![s.par?.fa?.id, s.par?.mo?.id].includes(row.targetId) ||
        !row.targetName ||
        !["direct", "shared", "network"].includes(row.plan) ||
        typeof row.treatmentSupport !== "boolean" ||
        typeof row.treatmentStillActive !== "boolean" ||
        !Number.isFinite(row.treatmentPaidTotal) ||
        row.treatmentPaidTotal < 0 ||
        !Number.isFinite(row.amount) ||
        row.amount < 0 ||
        (row.contributorSiblingId != null &&
          !services
            .siblingsOf(s)
            .some(person => person.id === row.contributorSiblingId && person.independentSinceYear)) ||
        (row.type.startsWith("sibling_contribution") &&
          (!row.contributorSiblingId || !row.contributorSiblingName))
      )
        problems.push("親族ケア履歴の対象・状態・金額が不正");
  const parentMoveMin = services.P("family.parentMoveReviewMinYears"),
    parentMoveMax = services.P("family.parentMoveReviewMaxYears"),
    parentMoveChance = services.P("family.parentMoveChance"),
    parentMoveCost = services.P("family.parentHouseholdMoveCostBase");
  if (
    !Number.isInteger(parentMoveMin) ||
    parentMoveMin < 1 ||
    !Number.isInteger(parentMoveMax) ||
    parentMoveMax < parentMoveMin ||
    !Number.isFinite(parentMoveChance) ||
    parentMoveChance < 0 ||
    parentMoveChance > 1 ||
    !Number.isFinite(parentMoveCost) ||
    parentMoveCost < 0
  )
    problems.push("親世帯移動のモデル設定が不正");
  const parentTreatmentShares = [
    "family.parentTreatmentDirectShare",
    "family.parentTreatmentSharedShare",
    "family.parentTreatmentNetworkShare"
  ].map(services.P);
  if (parentTreatmentShares.some(value => !Number.isFinite(value) || value < 0 || value > 1))
    problems.push("親の療養費分担率が0から1の範囲外");
  const parentWorkReviewMin = services.P("family.parentWorkReviewMinYears"),
    parentWorkReviewMax = services.P("family.parentWorkReviewMaxYears"),
    parentWorkChangeChance = services.P("family.parentWorkChangeChance");
  if (
    !Number.isInteger(parentWorkReviewMin) ||
    parentWorkReviewMin < 1 ||
    !Number.isInteger(parentWorkReviewMax) ||
    parentWorkReviewMax < parentWorkReviewMin ||
    !Number.isFinite(parentWorkChangeChance) ||
    parentWorkChangeChance < 0 ||
    parentWorkChangeChance > 1
  )
    problems.push("家計分離後の親の仕事モデル設定が不正");
  if (
    s.familyCare &&
    (!["fa", "mo"].includes(s.familyCare.target) ||
      !s.par?.[s.familyCare.target] ||
      s.par[s.familyCare.target].d ||
      !Number.isInteger(s.familyCare.startedYear) ||
      !Number.isInteger(s.familyCare.yearsRemaining) ||
      s.familyCare.yearsRemaining < 1 ||
      s.familyCare.yearsRemaining > 2 ||
      s.familyCare.startedYear > s.year ||
      !["direct", "shared", "network"].includes(s.familyCare.plan || "direct") ||
      (s.familyCare.treatmentSupport != null && typeof s.familyCare.treatmentSupport !== "boolean") ||
      (s.familyCare.siblingContributorId != null &&
        (s.familyCare.plan !== "shared" ||
          !s.familyCare.treatmentSupport ||
          !services
            .siblingsOf(s)
            .some(
              person => person.id === s.familyCare.siblingContributorId && person.independentSinceYear
            ))) ||
      (s.familyCare.siblingContributionPaidYear != null &&
        (!Number.isInteger(s.familyCare.siblingContributionPaidYear) ||
          s.familyCare.siblingContributionPaidYear < s.familyCare.startedYear ||
          s.familyCare.siblingContributionPaidYear > s.year ||
          !Number.isFinite(s.familyCare.siblingContributionPaidAmount) ||
          s.familyCare.siblingContributionPaidAmount < 0)) ||
      (s.familyCare.siblingContributionPaidTotal != null &&
        (!Number.isFinite(s.familyCare.siblingContributionPaidTotal) ||
          s.familyCare.siblingContributionPaidTotal < 0)) ||
      (s.familyCare.capacityReviewYear != null &&
        (!Number.isInteger(s.familyCare.capacityReviewYear) ||
          s.familyCare.capacityReviewYear < s.familyCare.startedYear ||
          s.familyCare.capacityReviewYear > s.year)))
  )
    problems.push("親族介護の対象・期間・分担方式が不正");
  if (
    s.displacement &&
    (!["shelter", "housed", "rebuilt"].includes(s.displacement.status) ||
      !Number.isInteger(s.displacement.sinceYear) ||
      s.displacement.sinceYear > s.year ||
      (s.displacement.resolvedYear != null &&
        (!Number.isInteger(s.displacement.resolvedYear) ||
          s.displacement.resolvedYear < s.displacement.sinceYear ||
          s.displacement.resolvedYear > s.year)))
  )
    problems.push("避難後の生活再建記録が不正");
  if (
    s.facilityPeopleContacts != null &&
    (!Array.isArray(s.facilityPeopleContacts) ||
      s.facilityPeopleContacts.length > 96 ||
      s.facilityPeopleContacts.some(
        x =>
          !Number.isInteger(x.year) ||
          x.year > s.year ||
          !x.areaKey ||
          !x.facilityId ||
          !x.personId ||
          !["clinic", "school", "workplace"].includes(x.kind)
      ))
  )
    problems.push("施設に結び付いた人物との交流記録が不正");
  for (const area of [s.community, ...Object.values(s.world?.localityArchive || {})]) {
    if (!area?.people) continue;
    const people = Object.values(area.people);
    if (
      people.length > 60 ||
      people.some(
        p =>
          !p.id ||
          !p.facilityId ||
          (!area.facilities?.[p.facilityId] && !(p.kind === "workplace" &&
            s.world?.occupationWorld?.sites?.[p.facilityId]?.siteId === p.facilityId &&
            typeof s.world.occupationWorld.sites[p.facilityId].areaId === "string" &&
            !!s.world.occupationWorld.sites[p.facilityId].areaId)) ||
          !Number.isInteger(p.by) ||
          !Number.isInteger(p.metYear) ||
          p.metYear > s.year ||
          !Number.isInteger(p.lastUpdatedYear) ||
          p.lastUpdatedYear > s.year ||
          !["working", "away", "left", "dead"].includes(p.actualStatus) ||
          !["working", "away", "left", "dead"].includes(p.knownStatus) ||
          (p.actualStatus === "dead" && (!Number.isInteger(p.deathYear) || p.deathYear > s.year || !p.deathCause)) ||
          p.lastKnownYear > p.lastUpdatedYear ||
          !Array.isArray(p.history) ||
          p.history.length > 16 ||
          !Array.isArray(p.contacts) ||
          p.contacts.length > 16
      )
    )
      problems.push("施設関係者の持続履歴に不整合");
    if (
      people.some(
        p =>
          p.life &&
          (!["settled", "shared", "temporary", "unknown"].includes(p.life.home) ||
            !["none", "relative", "household", "unknown"].includes(p.life.care) ||
            !["continue", "learn", "change", "balance", "unknown"].includes(p.life.goal) ||
            !["steady", "tight", "recovering", "unknown"].includes(p.life.means) ||
            !Number.isInteger(p.life.updatedYear) ||
            p.life.updatedYear > s.year ||
            !Array.isArray(p.life.changes) ||
            p.life.changes.length > 20 ||
            p.life.changes.some(c => c.year > p.life.updatedYear))
      )
    )
      problems.push("施設関係者の独立した生活履歴が不正");
    if (
      people.some(
        p =>
          p.knownLife &&
          (!Number.isInteger(p.knownLife.heardYear) ||
            p.knownLife.heardYear > s.year ||
            p.knownLife.heardYear > p.life?.updatedYear ||
            !["settled", "shared", "temporary", "unknown"].includes(p.knownLife.home))
      )
    )
      problems.push("施設関係者について本人が把握する生活記録が不正");
  }
  if (
    s.siteAffiliations != null &&
    (typeof s.siteAffiliations !== "object" ||
      Object.entries(s.siteAffiliations).some(
        ([kind, x]) =>
          !["clinic", "school", "workplace"].includes(kind) ||
          !x?.facilityId ||
          !x.areaKey ||
          !Number.isInteger(x.sinceYear) ||
          x.sinceYear > s.year ||
          x.kind !== kind
      ))
  )
    problems.push("施設在籍台帳の識別子が不正");
  if (
    s.siteAffiliationHistory != null &&
    (!Array.isArray(s.siteAffiliationHistory) ||
      s.siteAffiliationHistory.length > 96 ||
      s.siteAffiliationHistory.some(
        x =>
          !Number.isInteger(x.year) ||
          x.year > s.year ||
          !["clinic", "school", "workplace"].includes(x.kind) ||
          !x.facilityId ||
          !["established", "ended", "transferred"].includes(x.action)
      ))
  )
    problems.push("施設在籍履歴が不正");
  if (
    s.siteAffiliations?.workplace &&
    (!s.job || !currentPlayerEmployment(s) ||
      currentPlayerEmployment(s).siteId !== s.siteAffiliations.workplace.facilityId ||
      String(s.job) !== s.siteAffiliations.workplace.extra ||
      s.siteAffiliations.workplace.areaKey !== s.community?.key)
  )
    problems.push("現在の勤務先と職種・地区が不一致");
  if (
    s.workContract &&
    (!s.job ||
      s.workContract.status !== "active" ||
      s.workContract.jobId !== s.job ||
      (s.workContract.basis === "occupation-episode"
        ? !s.employmentState?.episodes?.some(row =>
            row.status === "active" &&
            row.episodeId === s.employmentState.activeEpisodeId &&
            row.episodeId === s.workContract.episodeId &&
            row.siteId === s.workContract.siteId &&
            row.jobId === s.job &&
            row.startYear === s.workContract.startYear &&
            s.world?.occupationWorld?.sites?.[row.siteId]?.siteId === row.siteId &&
            s.world?.occupationWorld?.positions?.[row.positionId]?.siteId === row.siteId)
        : true) ||
      !Number.isInteger(s.workContract.startYear) ||
      s.workContract.startYear > s.year ||
      s.workContract.wagePremium < 0 ||
      s.workContract.wagePremium > 0.12 ||
      !["usual", "adjusted"].includes(s.workContract.assignment))
  )
    problems.push("勤務契約と現在の在籍が不一致");
  if (
    s.workContractHistory &&
    (!Array.isArray(s.workContractHistory) ||
      s.workContractHistory.length > 80 ||
      s.workContractHistory.some(
        x =>
          x.year > s.year ||
          !x.siteId ||
          (x.assignment != null && !["usual", "adjusted"].includes(x.assignment))
      ))
  )
    problems.push("勤務契約履歴が不正");
}
