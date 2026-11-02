function auditLifeRecords(s, problems, services = STATE_AUDIT_SERVICES) {
  const life = services.ensureLifeRecord(s),
    uniqueIds = rows => new Set(rows.map(row => row.id)).size === rows.length;
  auditDeathProcess(s, problems, services);
  if (
    !life ||
    life.version !== 4 ||
    ![
      "goals",
      "skills",
      "affiliations",
      "groupStandings",
      "regionalImpacts",
      "organizations",
      "bodyChanges",
      "careerChanges",
      "milestones",
      "hobbies",
      "artifacts",
      "workRelationships"
    ].every(key => Array.isArray(life[key]))
  )
    problems.push("共通人生経歴の構造が不正");
  if (
    life &&
    (life.hobbies.length > 6 ||
      new Set(life.hobbies.map(row => row.id)).size !== life.hobbies.length ||
      life.hobbies.some(
        row =>
          !services.HOBBY_META[row.id] ||
          row.title !== services.HOBBY_META[row.id].title ||
          !Number.isInteger(row.startedYear) ||
          row.startedYear > s.year ||
          !Number.isInteger(row.practiceYears) ||
          row.practiceYears < 0 ||
          row.practiceYears > s.age ||
          !["active", "paused", "ended"].includes(row.status) ||
          !Array.isArray(row.history) ||
          row.history.length > 32 ||
          row.history.some(
            entry =>
              !Number.isInteger(entry.year) ||
              entry.year < row.startedYear ||
              entry.year > s.year ||
              !["start", "resume", "pause", "end", "practice", "legacy_snapshot"].includes(entry.action)
          )
      ))
  )
    problems.push("趣味の継続・休止履歴が不正");
  if (
    life &&
    (life.artifacts.length > 40 ||
      new Set(life.artifacts.map(row => row.id)).size !== life.artifacts.length ||
      life.artifacts.some(
        row =>
          !row.id ||
          !life.hobbies.some(hobby => hobby.id === row.hobbyId) ||
          !row.title ||
          !Number.isInteger(row.createdYear) ||
          row.createdYear > s.year ||
          !["kept", "shared", "transferred", "lost"].includes(row.status) ||
          !Array.isArray(row.history) ||
          row.history.length > 16
      ))
  )
    problems.push("趣味から生まれた品の記録が不正");
  if (life) {
    if (
      life.goals.length > 40 ||
      !uniqueIds(life.goals) ||
      life.goals.some(
        x =>
          !x.id ||
          !x.title ||
          !["active", "paused", "achieved", "abandoned", "compromised"].includes(x.status) ||
          !Number.isInteger(x.startedYear) ||
          x.startedYear > s.year ||
          !Array.isArray(x.history) ||
          x.history.length > 20 ||
          x.history.some(row => !Number.isInteger(row.year) || row.year < x.startedYear || row.year > s.year)
      )
    )
      problems.push("人生目標・履歴が不正");
    if (
      life.skills.length > 60 ||
      !uniqueIds(life.skills) ||
      life.skills.some(
        x =>
          !x.id ||
          !x.title ||
          !Number.isFinite(x.level) ||
          x.level < 0 ||
          x.level > 100 ||
          !Number.isInteger(x.practiceCount) ||
          x.practiceCount < 0 ||
          !Array.isArray(x.history) ||
          x.history.length > 20 ||
          x.history.some(
            row =>
              !Number.isInteger(row.year) ||
              row.year > s.year ||
              !Number.isFinite(row.before) ||
              !Number.isFinite(row.after) ||
              row.before < 0 ||
              row.before > 100 ||
              row.after < 0 ||
              row.after > 100
          )
      )
    )
      problems.push("技能・熟達履歴が不正");
    if (
      life.affiliations.length > 60 ||
      !uniqueIds(life.affiliations) ||
      life.affiliations.some(
        x =>
          !x.id ||
          !x.title ||
          (x.scope != null && x.scope !== AFFILIATION_RULES[x.id]?.scope) ||
          (x.pausedFrom != null && !["active","crisis"].includes(x.pausedFrom)) ||
          (x.pauseContext != null && (typeof x.pauseContext !== "string" || x.pauseContext.length>40)) ||
          (x.anchor != null && (!x.anchor.region || !x.anchor.placeId || !x.anchor.localityKey)) ||
          (x.posting != null && (!x.posting.kind || !x.posting.region || !x.posting.localityKey)) ||
          (x.localityKey != null &&
            (typeof x.localityKey !== "string" || !x.localityKey || x.localityKey.length > 180)) ||
          !["outside", "contacted", "active", "crisis", "suspended", "left"].includes(x.status) ||
          (x.startedYear != null && (!Number.isInteger(x.startedYear) || x.startedYear > s.year)) ||
          (x.endedYear != null && (!Number.isInteger(x.endedYear) || x.endedYear > s.year)) ||
          (x.status === "left" && !Number.isInteger(x.endedYear)) ||
          !Array.isArray(x.episodes) ||
          x.episodes.length > 32 ||
          x.episodes.some(
            (episode, index) =>
              !Number.isInteger(episode.startedYear) ||
              episode.startedYear > s.year ||
              (episode.endedYear != null &&
                (!Number.isInteger(episode.endedYear) ||
                  episode.endedYear < episode.startedYear ||
                  episode.endedYear > s.year)) ||
              episode.startedYear <
                (x.episodes[index - 1]?.endedYear ?? x.startedYear ?? episode.startedYear) ||
              (index < x.episodes.length - 1 && episode.endedYear == null)
          ) ||
          (["active", "crisis", "suspended"].includes(x.status) &&
            (!x.episodes.length || x.episodes.at(-1).endedYear != null)) ||
          (x.status === "left" && x.episodes.at(-1)?.endedYear !== x.endedYear) ||
          (x.status === "contacted" &&
            (!Number.isInteger(x.lastContactYear) || x.lastContactYear > s.year)) ||
          !Array.isArray(x.history) ||
          x.history.length > 256 ||
          x.history.some(
            row =>
              !Number.isInteger(row.year) ||
              row.year > s.year ||
              ![
                "contact",
                "followup",
                "join",
                "assign",
                "continue",
                "role",
                "crisis",
                "suspend",
                "leave",
                "return",
                "review",
                "decline"
              ].includes(row.action)
          )
      )
    )
      problems.push("所属・役割履歴が不正");
    if (
      life.groupStandings.length > 60 ||
      !uniqueIds(life.groupStandings) ||
      life.groupStandings.some(
        x =>
          !x.id ||
          !x.title ||
          !Number.isFinite(x.value) ||
          x.value < -100 ||
          x.value > 100 ||
          !Array.isArray(x.history) ||
          x.history.length > 20 ||
          x.history.some(
            row =>
              !Number.isInteger(row.year) ||
              row.year > s.year ||
              !Number.isFinite(row.before) ||
              !Number.isFinite(row.after) ||
              row.after < -100 ||
              row.after > 100
          )
      )
    )
      problems.push("集団ごとの評価履歴が不正");
    if (
      life.regionalImpacts.length > 40 ||
      life.regionalImpacts.some(
        row =>
          !Number.isInteger(row.year) ||
          row.year > s.year ||
          !services.REG.some(region => region.n === row.region) ||
          !row.entity ||
          !row.kind ||
          !row.description ||
          row.scope !== "local"
      )
    )
      problems.push("地域への局所的影響履歴が不正");
  }
  if (
    life &&
    (life.workRelationships.length > 40 ||
      new Set(life.workRelationships.map(row => row.id)).size !== life.workRelationships.length ||
      new Set(life.workRelationships.map(row => row.person?.id)).size !== life.workRelationships.length ||
      life.workRelationships.some(row => !services.workRelationshipValid(row, s)))
  )
    problems.push("個人ID付きの職場関係・同意・後年履歴が不正");
  if (
    life &&
    (life.bodyChanges.length > 40 ||
      !uniqueIds(life.bodyChanges) ||
      life.bodyChanges.some(
        x =>
          !x.id ||
          !x.title ||
          !x.cause ||
          !x.function ||
          !Number.isInteger(x.startedYear) ||
          x.startedYear > s.year ||
          !["recovering", "ongoing", "adapted", "resolved"].includes(x.status) ||
          (x.reviewYear != null &&
            (!Number.isInteger(x.reviewYear) ||
              x.reviewYear <= x.startedYear ||
              x.reviewYear > s.year + 30)) ||
          (x.accommodation != null && typeof x.accommodation !== "string") ||
          !Array.isArray(x.history) ||
          x.history.length > 20 ||
          x.history.some(row => !Number.isInteger(row.year) || row.year < x.startedYear || row.year > s.year)
      ))
  )
    problems.push("身体変化・生活調整の履歴が不正");
  if (
    life &&
    (life.careerChanges.length > 60 ||
      life.careerChanges.some(
        x =>
          !x.id ||
          !Number.isInteger(x.year) ||
          x.year > s.year ||
          !Number.isInteger(x.age) ||
          x.age < 0 ||
          x.age > s.age ||
          !Number.isInteger(x.fromJobId) ||
          !services.J[x.fromJobId] ||
          !Number.isInteger(x.toJobId) ||
          !services.J[x.toJobId] ||
          x.fromJobId === x.toJobId ||
          x.fromTitle !== services.J[x.fromJobId].n ||
          x.toTitle !== services.J[x.toJobId].n ||
          (x.eventId != null && typeof x.eventId !== "string") ||
          (x.choice != null && typeof x.choice !== "string")
      ))
  )
    problems.push("本人の職業変更履歴が不正");
}

function auditDeathProcess(s, problems, services = STATE_AUDIT_SERVICES) {
  const detail = s.deathProcess;
  if (detail == null) {
    if (s.dead) problems.push("死亡過程の記録がない");
    return;
  }
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    problems.push("死亡過程の記録が不正");
    return;
  }
  if (
    detail.version !== 1 ||
    !s.dead ||
    detail.category !== s.dc ||
    typeof detail.description !== "string" ||
    detail.year !== s.year ||
    detail.month !== s.mo ||
    !Number.isInteger(detail.month) ||
    detail.month < 0 || detail.month > 12 ||
    !["current-calendar-month", "annual-month-unknown", "pressure-window-sample"].includes(detail.monthBasis) ||
    (detail.monthBasis === "annual-month-unknown" ? detail.month !== 0 : detail.month === 0) ||
    !detail.accountingPeriod ||
    !["full-year-model","last-completed-year"].includes(detail.accountingPeriod.kind) ||
    detail.accountingPeriod.proratedToDeath !== false ||
    (detail.accountingPeriod.kind === "full-year-model" && detail.accountingPeriod.year !== s.year) ||
    detail.age !== s.age ||
    !detail.place ||
    detail.place.region !== (s.res?.n || null) ||
    detail.place.city !== (s.local?.city || null) ||
    detail.place.residenceType !== (s.home || null) ||
    !Array.isArray(detail.careHistory) ||
    detail.careHistory.length > 12
  ) {
    problems.push("死亡過程の日時・場所・経過が不整合");
    return;
  }
  const isWarDeath = ["戦闘職務中の死亡", "戦争に伴う民間人死亡"].includes(detail.category);
  const context = detail.warModelContext;
  if (!isWarDeath) {
    if (context != null) problems.push("戦争以外の死因に戦乱抽選根拠が残っている");
    return;
  }
  const expectedDuty =
    detail.category === "戦闘職務中の死亡" ? "active" : s.fl?.veteran ? "veteran" : "civilian";
  const expectedDutyFactor = expectedDuty === "active" ? 2 : expectedDuty === "veteran" ? 1.4 : 0.45;
  const job = services.J[s.job] || {};
  if (
    !context ||
    context.region !== (s.res?.n || null) ||
    context.city !== (s.local?.city || null) ||
    context.residenceType !== (s.home || null) ||
    context.occupationId !== s.job ||
    context.occupationName !== (job.n || null) ||
    context.dutyClass !== expectedDuty ||
    !context.factors ||
    context.factors.duty !== expectedDutyFactor ||
    !Number.isFinite(context.factors.occupation) ||
    (context.factors.regional != null && !Number.isFinite(context.factors.regional)) ||
    (context.factors.regionalPressure != null && !Number.isFinite(context.factors.regionalPressure)) ||
    !Array.isArray(context.pressureIds) ||
    context.pressureIds.length > 8 ||
    new Set(context.pressureIds).size !== context.pressureIds.length ||
    context.pressureIds.some(id => typeof id !== "string" || !id) ||
    typeof context.basis !== "string" ||
    !context.basis.includes("個人が現地")
  )
    problems.push("戦乱死亡の地域・職務・モデル根拠が不整合");
}

function auditResidenceAndPersonalState(s, problems, services = STATE_AUDIT_SERVICES) {
  if (s.res && !services.allowedHomesForRegion(s.res.n).includes(s.home))
    problems.push("地域に許可されていない居住形態");
  const hobbyKeys = new Set([
    "hobby_music",
    "hobby_craft",
    "hobby_garden",
    "hobby_sport",
    "hobby_collect",
    "hobby_story"
  ]);
  if (
    s.hobbyModes != null &&
    (!s.hobbyModes ||
      typeof s.hobbyModes !== "object" ||
      Array.isArray(s.hobbyModes) ||
      Object.entries(s.hobbyModes).some(
        ([key, mode]) =>
          !hobbyKeys.has(key) || !Object.prototype.hasOwnProperty.call(services.HOBBY_MODE_SCALE, mode)
      ))
  )
    problems.push("趣味の継続形態が不正");
  if (
    s.hobbyModeHistory != null &&
    (!Array.isArray(s.hobbyModeHistory) ||
      s.hobbyModeHistory.length > 24 ||
      s.hobbyModeHistory.some(
        row =>
          !Number.isInteger(row.year) ||
          row.year > s.year ||
          !hobbyKeys.has(row.key) ||
          !Object.prototype.hasOwnProperty.call(services.HOBBY_MODE_SCALE, row.mode)
      ))
  )
    problems.push("趣味の費用形態履歴が不正");
  const residenceTypes = new Set([
    "legacy_unknown",
    "family_home_shared_budget",
    "family_home_separate_budget",
    "independent_rental",
    "independent_owned",
    "spouse_shared",
    "spouse_parent_home"
  ]);
  if (s.residenceArrangement != null && !residenceTypes.has(s.residenceArrangement))
    problems.push("住居・世帯形態のコードが未定義");
  if (!Array.isArray(s.residenceHistory) || s.residenceHistory.length > 24)
    problems.push("本人の住居・世帯履歴が不正");
  else
    for (const row of s.residenceHistory)
      if (
        !Number.isInteger(row.year) ||
        row.year > s.year ||
        !residenceTypes.has(row.arrangement) ||
        typeof row.reason !== "string"
      )
        problems.push("本人の住居・世帯履歴項目が不正");
  if (s.socialPosition != null && typeof s.socialPosition !== "string")
    problems.push("出生時の社会的位置が文字列ではない");
  if (s.lineageModelVersion === 1) {
    const parents = [s.par?.fa?.r?.n, s.par?.mo?.r?.n].filter(Boolean);
    if (parents.length !== 2 || !parents.includes(s.r?.n))
      problems.push("出生時の本人種族が記録された親の種族と一致しない");
    for (const sibling of s.siblings || [])
      if (sibling.r?.n && !parents.includes(sibling.r.n))
        problems.push("きょうだいの種族が記録された親のどちらにも含まれない");
  }
  if (
    s.romance &&
    (!["known", "dating", "committed", "cohabiting", "arranged"].includes(s.romance.stage) ||
      !Number.isInteger(s.romance.metYear) ||
      s.romance.metYear > s.year ||
      (s.romance.stageSinceYear != null &&
        (!Number.isInteger(s.romance.stageSinceYear) ||
          s.romance.stageSinceYear < s.romance.metYear ||
          s.romance.stageSinceYear > s.year)))
  )
    problems.push("交際段階または関係開始年が不正");
  if (
    s.illness &&
    (!Number.isInteger(s.illness.stage) ||
      s.illness.stage < 1 ||
      s.illness.stage > 3 ||
      !Number.isInteger(s.illness.startedYear) ||
      s.illness.startedYear > s.year ||
      typeof s.illness.kind !== "string" ||
      !Array.isArray(s.illness.causeTexts))
  )
    problems.push("病状の段階・発症年・死因文面が不正");
  if (
    services.S?.sp &&
    ((services.S.sp.disclosureBoundary != null &&
      !["separate_rooms", "repaired"].includes(services.S.sp.disclosureBoundary)) ||
      (services.S.sp.disclosureBoundary === "separate_rooms" &&
        ((services.S.sp.disclosureBoundarySinceYear != null &&
          (!Number.isInteger(services.S.sp.disclosureBoundarySinceYear) ||
            services.S.sp.disclosureBoundarySinceYear > services.S.year)) ||
          !Number.isInteger(services.S.sp.disclosureReviewYear))) ||
      (services.S.sp.disclosureBoundary === "repaired" && services.S.sp.disclosureReviewYear != null) ||
      (services.S.sp.disclosureBoundaryHistory != null &&
        (!Array.isArray(services.S.sp.disclosureBoundaryHistory) ||
          services.S.sp.disclosureBoundaryHistory.length > 12)))
  )
    problems.push("配偶者の告白後の関係境界が不正");
}
