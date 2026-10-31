function auditSocialAndFacilityState(s, problems, services = STATE_AUDIT_SERVICES) {
  if (s.culturalIdentity) {
    const d = s.culturalIdentity;
    if (
      d.version !== 1 ||
      !Array.isArray(d.history) ||
      d.history.length > 24 ||
      d.history.some(x => x.year > s.year)
    )
      problems.push("文化的帰属の記録が不正");
  }
  if (s.equityLedger) {
    const d = s.equityLedger;
    if (
      d.version !== 1 ||
      !Array.isArray(d.episodes) ||
      !Array.isArray(d.history) ||
      d.episodes.length > 64 ||
      d.history.length > 64 ||
      d.episodes.some(
        x =>
          x.year > s.year || x.endedYear > s.year || !["active", "ended", "observed-only"].includes(x.status)
      )
    )
      problems.push("差別経験・補正台帳が不正");
  }
  if (s.personTies) {
    const t = s.personTies,
      links = Object.values(t.links || {});
    if (
      t.version !== 1 ||
      !Array.isArray(t.history) ||
      t.history.length > 90 ||
      links.length > 90 ||
      links.some(
        x =>
          !x.personId ||
          !Number.isInteger(x.metYear) ||
          x.metYear > s.year ||
          !Number.isInteger(x.lastInteractionYear) ||
          x.lastInteractionYear > s.year ||
          !Number.isFinite(x.standing) ||
          x.standing < 0 ||
          x.standing > 100 ||
          !Array.isArray(x.history) ||
          x.history.length > 24 ||
          x.history.some(
            v =>
              v.year > s.year ||
              (v.action?.startsWith("apology-") &&
                !x.history.some(prev => prev.action === "rejection-received"))
          ) ||
          !["trusted", "strained", "unresolved"].includes(x.relationship)
      )
    )
      problems.push("個別NPCとの社会関係台帳が不正");
    const rhodesColleagues = Array.isArray(t.rhodesColleagues)
      ? t.rhodesColleagues
      : t.rhodesColleague
        ? [t.rhodesColleague]
        : [];
    if (
      rhodesColleagues.length > 30 ||
      new Set(rhodesColleagues.map(row => row.id)).size !== rhodesColleagues.length ||
      rhodesColleagues.some(
        person =>
          person.kind !== "rhodes" ||
          !person.id ||
          !Number.isInteger(person.metYear) ||
          person.metYear > s.year ||
          !["working", "former"].includes(person.actualStatus) ||
          !links.some(link => link.personId === person.id)
      ) ||
      (t.rhodesColleague && !rhodesColleagues.some(row => row.id === t.rhodesColleague.id))
    )
      problems.push("ロドスの同僚との関係記録が不正");
  }
  if (s.closeKnowledge) {
    const d = s.closeKnowledge,
      links = Object.values(d.links || {});
    if (
      d.version !== 1 ||
      !Array.isArray(d.history) ||
      d.history.length > 80 ||
      links.length > 32 ||
      links.some(
        link =>
          !link.personId ||
          !services.CLOSE_INFO_KINDS.includes(link.kind) ||
          !Array.isArray(link.history) ||
          link.history.length > 16 ||
          !link.knownFacts ||
          Object.values(link.knownFacts).some(f => !Number.isInteger(f.sinceYear) || f.sinceYear > s.year) ||
          (link.helpResponse != null &&
            !["accepted-limited-help", "appointment-agreed", "declined-request", "unconfirmed"].includes(
              link.helpResponse
            )) ||
          (link.helpResponse === "appointment-agreed" && link.helpCommitment?.kind !== "next-appointment") ||
          (link.helpCommitment &&
            (link.helpCommitment.personId !== link.personId ||
              link.helpCommitment.kind !== "next-appointment" ||
              !Number.isInteger(link.helpCommitment.agreedYear) ||
              link.helpCommitment.agreedYear > s.year ||
              !Number.isInteger(link.helpCommitment.dueYear) ||
              link.helpCommitment.dueYear !== link.helpCommitment.agreedYear + 1 ||
              !["pending", "fulfilled", "not-realized", "withdrawn-by-other", "cancelled-by-player"].includes(
                link.helpCommitment.status
              ) ||
              !Array.isArray(link.helpCommitment.history) ||
              link.helpCommitment.history.length < 1 ||
              link.helpCommitment.history.length > 8 ||
              link.helpCommitment.history.some(
                row =>
                  !Number.isInteger(row.year) ||
                  row.year > s.year ||
                  !["agreed", "outcome"].includes(row.action)
              ) ||
              link.helpCommitment.history[0]?.year !== link.helpCommitment.agreedYear ||
              link.helpCommitment.history[0]?.action !== "agreed" ||
              (link.helpCommitment.status === "pending"
                ? link.helpCommitment.outcomeYear !== null || link.helpCommitment.history.length !== 1
                : !Number.isInteger(link.helpCommitment.outcomeYear) ||
                  link.helpCommitment.outcomeYear < link.helpCommitment.dueYear ||
                  link.helpCommitment.outcomeYear > s.year ||
                  link.helpCommitment.history.length !== 2 ||
                  link.helpCommitment.history[1]?.action !== "outcome" ||
                  link.helpCommitment.history[1]?.year !== link.helpCommitment.outcomeYear ||
                  link.helpCommitment.history[1]?.outcome !== link.helpCommitment.status))) ||
          (link.latestResponse &&
            (!Number.isInteger(link.latestResponse.sinceYear) ||
              link.latestResponse.sinceYear > s.year ||
              !["heard-undecided", "questioned-diagnosis", "withdrew"].includes(link.latestResponse.state) ||
              link.latestResponse.basis !== "direct-observed-response")) ||
          link.history.some(
            x =>
              x.year > s.year ||
              x.personId !== link.personId ||
              !services.CLOSE_INFO_ACTIONS.includes(x.action) ||
              (x.recipientResponse != null &&
                !["heard-undecided", "questioned-diagnosis", "withdrew"].includes(x.recipientResponse))
          )
      )
    )
      problems.push("近親者・友人への個別開示記録が不正");
  }
  if (s.infectionAwareness != null) {
    const d = s.infectionAwareness,
      entries = Array.isArray(d.entries) ? d.entries : [];
    if (
      d.version !== 1 ||
      !Array.isArray(d.entries) ||
      entries.length > 80 ||
      entries.some(
        row =>
          !row ||
          typeof row !== "object" ||
          Array.isArray(row) ||
          !Number.isInteger(row.year) ||
          row.year < s.by ||
          row.year > s.year ||
          !["protagonist", "relative"].includes(row.subject) ||
          (row.subject === "relative" && (typeof row.subjectId !== "string" || !row.subjectId)) ||
          (row.subject === "protagonist" && row.subjectId != null) ||
          !services.INFECTION_AWARENESS_AUDIENCES.includes(row.audience) ||
          !services.INFECTION_AWARENESS_CERTAINTY.includes(row.certainty) ||
          !services.INFECTION_AWARENESS_SOURCES.includes(row.source) ||
          !["voluntary", "nonconsensual", "unclear"].includes(row.consent) ||
          !["confirmed", "unclear"].includes(row.subjectMatch) ||
          (row.recipientId != null && typeof row.recipientId !== "string") ||
          (row.recipientRef != null && typeof row.recipientRef !== "string") ||
          (row.region != null && typeof row.region !== "string") ||
          (row.placeId != null && typeof row.placeId !== "string") ||
          (row.areaKey != null && typeof row.areaKey !== "string") ||
          (row.sourceEventId != null && typeof row.sourceEventId !== "string") ||
          (row.source === "unattributed-rumor" &&
            (row.certainty !== "unverified" || row.subjectMatch !== "unclear" || row.consent !== "nonconsensual")) ||
          (row.source === "direct-question" &&
            (row.certainty !== "suspected" || row.subjectMatch !== "unclear" || row.consent !== "nonconsensual")) ||
          (row.source === "self-publication" &&
            (row.audience !== "public" || row.certainty !== "published" || row.subjectMatch !== "unclear" || row.consent !== "voluntary"))
      )
    )
      problems.push("感染認知の対象・範囲・根拠の記録が不正");
  }
  if (s.infectionWorkplace != null) {
    const d = s.infectionWorkplace,
      validResponses = ["leave-approved-once", "unresolved"],
      validOutcomes = [
        "leave-approved-again",
        "leave-unresolved",
        "hours-approved",
        "hours-declined",
        "assignment-approved",
        "assignment-declined",
        "left-by-player",
        "occupation-changed",
        "worksite-changed"
      ],
      year = value => Number.isInteger(value) && value <= s.year;
    if (
      d.version !== 1 ||
      !s.fl?.infection_work_disclosed ||
      !year(d.disclosedYear) ||
      !Number.isInteger(d.disclosedJobId) ||
      d.disclosedJobId <= 0 ||
      !services.J[d.disclosedJobId] ||
      (d.siteId != null && typeof d.siteId !== "string") ||
      !validResponses.includes(d.firstResponse) ||
      !year(d.firstResponseYear) ||
      d.firstResponseYear !== d.disclosedYear ||
      !["awaiting-review", "reviewed", "left-employment", "employment-changed"].includes(d.status) ||
      (d.reviewDueYear != null && !Number.isInteger(d.reviewDueYear)) ||
      (d.reviewedYear != null && !year(d.reviewedYear)) ||
      (d.closedYear != null && !year(d.closedYear)) ||
      (d.reviewOutcome != null && !validOutcomes.includes(d.reviewOutcome)) ||
      (d.reviewJobId != null && (!Number.isInteger(d.reviewJobId) || !services.J[d.reviewJobId])) ||
      (d.reviewSiteId != null && typeof d.reviewSiteId !== "string") ||
      (d.status === "awaiting-review" &&
        (!Number.isInteger(d.reviewDueYear) ||
          d.reviewDueYear <= d.disclosedYear ||
          d.reviewDueYear > s.year + 2 ||
          d.reviewedYear != null ||
          d.reviewOutcome != null)) ||
      (d.status === "reviewed" &&
        (!Number.isInteger(d.reviewDueYear) ||
          !year(d.reviewedYear) ||
          d.reviewDueYear <= d.disclosedYear ||
          d.reviewedYear < d.reviewDueYear ||
          ![
            "leave-approved-again",
            "leave-unresolved",
            "hours-approved",
            "hours-declined",
            "assignment-approved",
            "assignment-declined"
          ].includes(
            d.reviewOutcome
          ) ||
          !Number.isInteger(d.reviewJobId) ||
          d.reviewJobId <= 0 ||
          (["assignment-approved", "assignment-declined"].includes(d.reviewOutcome) &&
            // An 80-row rolling history cannot prove or disprove a review older than its retained window.
            !(s.workContractHistory?.length === 80 && s.workContractHistory.every(row => row.year > d.reviewedYear)) &&
            !s.workContractHistory?.some(
              row =>
                row.siteId === d.siteId &&
                row.jobId === d.disclosedJobId &&
                row.action === "assignment" &&
                row.outcome === (d.reviewOutcome === "assignment-approved" ? "approved" : "declined") &&
                row.year === d.reviewedYear
            )))) ||
      (d.status === "left-employment" &&
        (!Number.isInteger(d.reviewDueYear) ||
          !year(d.reviewedYear) ||
          d.reviewDueYear <= d.disclosedYear ||
          d.reviewedYear < d.reviewDueYear ||
          d.reviewOutcome !== "left-by-player" ||
          d.reviewJobId !== 0)) ||
      (d.status === "employment-changed" &&
        (d.reviewDueYear != null ||
          !year(d.closedYear) ||
          d.reviewedYear != null ||
          !["occupation-changed", "worksite-changed"].includes(d.reviewOutcome) ||
          !Number.isInteger(d.reviewJobId) ||
          (d.reviewOutcome === "occupation-changed" && d.reviewJobId === d.disclosedJobId) ||
          (d.reviewOutcome === "worksite-changed" && (!d.siteId || d.reviewSiteId === d.siteId))))
    )
      problems.push("診断開示後の勤務先・就労経過が不正");
  }
  if (s.socialAftermath) {
    const m = s.socialAftermath;
    if (
      m.version !== 1 ||
      !Array.isArray(m.episodes) ||
      !Array.isArray(m.actions) ||
      m.episodes.length > 256 ||
      m.actions.length > 48 ||
      !Number.isInteger(m.nextId) ||
      m.nextId < 1 ||
      (m.episodeCount != null && (!Number.isInteger(m.episodeCount) || m.episodeCount < m.episodes.length)) ||
      (m.episodeCountBasis != null &&
        !["complete-since-start", "retained-lower-bound"].includes(m.episodeCountBasis)) ||
      m.episodes.some(
        x =>
          !Number.isInteger(x.year) ||
          x.year > s.year ||
          !x.id ||
          !["active", "supported", "ended"].includes(x.status) ||
          (x.endedYear != null && x.endedYear > s.year) ||
          (x.supportedYear != null && x.supportedYear > s.year) ||
          !services.socialIncidentLocationValid(x)
      ) ||
      m.actions.some(x => !Number.isInteger(x.year) || x.year > s.year)
    )
      problems.push("差別経験・社会的帰結の台帳が不正");
  }
  if (s.socialConflict) {
    const d = s.socialConflict,
      b = d.familyBreach,
      history = b?.contactHistory;
    if (
      d.version !== 1 ||
      ![d.acts, d.experienced, d.reports || []].every(Array.isArray) ||
      d.acts.length > 40 ||
      d.experienced.length > 30 ||
      (d.reports || []).length > 30 ||
      [...d.acts, ...(d.experienced || []), ...(d.reports || [])].some(
        x => x.year > s.year || !services.socialIncidentLocationValid(x)
      ) ||
      !services.socialActTotalsValid(d) ||
      !services.socialConflictTotalsValid(d, "experienceTotals", "experienced", "experienceTotalsBasis") ||
      !services.socialConflictTotalsValid(d, "reportTotals", "reports", "reportTotalsBasis")
    )
      problems.push("差別・加害履歴が不正");
    if (
      b != null &&
      (!Number.isInteger(b.year) ||
        b.year > s.year ||
        !b.personId ||
        !b.personName ||
        !["父", "母"].includes(b.personRelation) ||
        ![s.par?.fa?.id, s.par?.mo?.id].includes(b.personId) ||
        (b.personRelation === "父" && s.par?.fa?.id !== b.personId) ||
        (b.personRelation === "母" && s.par?.mo?.id !== b.personId) ||
        !["damaged", "replied", "no-reply"].includes(b.contact) ||
        !Array.isArray(history) ||
        history.length > 12 ||
        history.some(
          x =>
            !Number.isInteger(x.year) ||
            x.year < b.year ||
            x.year > s.year ||
            !["replied", "no-reply"].includes(x.outcome) ||
            x.personId !== b.personId
        ) ||
        (b.lastContactYear != null &&
          (!Number.isInteger(b.lastContactYear) ||
            b.lastContactYear < b.year ||
            b.lastContactYear > s.year ||
            (history?.length && b.lastContactYear !== history.at(-1).year))))
    )
      problems.push("感染後の家庭拒絶・個別連絡履歴が不正");
  }
  if (s.socialLearning) {
    const m = s.socialLearning;
    if (
      m.version !== 1 ||
      !Number.isInteger(m.initializedYear) ||
      m.initializedYear > s.year ||
      !Number.isInteger(m.schoolAccessYears) ||
      m.schoolAccessYears < 0 ||
      !Number.isInteger(m.outOfSchoolYears) ||
      m.outOfSchoolYears < 0 ||
      (m.literacy !== null && (!Number.isFinite(m.literacy) || m.literacy < 0 || m.literacy > 100)) ||
      !m.familyNorms ||
      ["infected", "sarkaz"].some(
        k =>
          m.familyNorms[k] !== null &&
          (!Number.isFinite(m.familyNorms[k]) || m.familyNorms[k] < 0 || m.familyNorms[k] > 100)
      ) ||
      !Number.isFinite(m.equityCommitment) ||
      m.equityCommitment < 0 ||
      m.equityCommitment > 100 ||
      !m.contacts ||
      ["infected", "sarkaz"].some(k => !Number.isFinite(m.contacts[k]) || m.contacts[k] < 0) ||
      !Array.isArray(m.yearlyHistory) ||
      m.yearlyHistory.length > 32 ||
      m.yearlyHistory.some(x => !Number.isInteger(x.year) || x.year > s.year) ||
      !Array.isArray(m.exclusionHistory) ||
      m.exclusionHistory.length > 24 ||
      (m.exclusionHistoryCount != null &&
        (!Number.isInteger(m.exclusionHistoryCount) ||
          m.exclusionHistoryCount < m.exclusionHistory.length)) ||
      (m.exclusionHistoryCountBasis != null &&
        !["complete-since-start", "retained-lower-bound"].includes(m.exclusionHistoryCountBasis)) ||
      m.exclusionHistory.some(
        x =>
          !Number.isInteger(x.year) ||
          x.year > s.year ||
          !x.consequence ||
          !services.socialIncidentLocationValid(x)
      )
    )
      problems.push("社会化・識字・排斥経験の履歴が不正");
  }
  if (
    s.intergroupHistory &&
    (!Array.isArray(s.intergroupHistory) ||
      s.intergroupHistory.length > 60 ||
      s.intergroupHistory.some(x => x.year > s.year || !x.region || !x.context || !x.response))
  )
    problems.push("種族間・地域間接触履歴が不正");
  if (
    s.facilityContacts != null &&
    (!Array.isArray(s.facilityContacts) ||
      s.facilityContacts.length > 80 ||
      s.facilityContacts.some(
        x =>
          !Number.isInteger(x.year) ||
          x.year > s.year ||
          !["clinic", "school", "workplace"].includes(x.kind) ||
          !x.areaKey ||
          !x.facilityId ||
          !x.action
      ))
  )
    problems.push("施設への問い合わせ履歴が不正");
  const localFacilityContainers = [s.community, ...Object.values(s.world?.localityArchive || {})].filter(
    Boolean
  );
  for (const area of localFacilityContainers) {
    if (area.facilities != null && (typeof area.facilities !== "object" || Array.isArray(area.facilities)))
      problems.push("地域施設台帳の形式が不正");
    for (const [key, site] of Object.entries(area.facilities || {})) {
      if (
        key !== site.id ||
        !site.id.startsWith(area.key + "#") ||
        !services.FACILITY_MODEL.kinds[site.kind] ||
        !["available", "strained", "limited"].includes(site.status) ||
        !Array.isArray(site.history) ||
        site.history.length > 24 ||
        !Array.isArray(site.contacts) ||
        site.contacts.length > 28
      )
        problems.push("地域施設の状態・識別子が不正");
    }
  }
  if (
    s.local.city &&
    (s.home !== "移動都市" || !services.SIM_TABLES.namedCities[s.res.n]?.includes(s.local.city))
  )
    problems.push("都市名と居住地域・形態が不一致");
  if (
    s.local.ecology &&
    s.local.ecology !== "未特定" &&
    !services.SIM_TABLES.environments[s.res.n]?.some(e => e.n === s.local.ecology)
  )
    problems.push("地勢と居住地域が不一致");
  for (const child of s.kids || []) {
    if (
      child.budgetExpenseTier != null &&
      (!Number.isInteger(child.budgetExpenseTier) ||
        child.budgetExpenseTier < 0 ||
        child.budgetExpenseTier >= services.EXP.length)
    )
      problems.push("成人した別居子の生活費階層が不正");
    if (
      child.budgetStartedYear != null &&
      (!Number.isInteger(child.budgetStartedYear) ||
        child.budgetStartedYear < child.by ||
        child.budgetStartedYear > s.year)
    )
      problems.push("成人した別居子の収支追跡開始年が不正");
    if (
      child.budgetUpdatedYear != null &&
      (!Number.isInteger(child.budgetUpdatedYear) ||
        child.budgetUpdatedYear < child.budgetStartedYear ||
        child.budgetUpdatedYear > s.year)
    )
      problems.push("成人した別居子の収支更新年が不正");
    if (
      child.budgetKnownYear != null &&
      (!Number.isInteger(child.budgetKnownYear) ||
        child.budgetKnownYear < child.by ||
        child.budgetKnownYear > s.year ||
        (child.budgetKnownNet != null && !Number.isFinite(child.budgetKnownNet)))
    )
      problems.push("親が把握する成人子の収支記録が不正");
    if (child.budgetKnownYear == null && child.budgetKnownNet != null)
      problems.push("成人子の収支認知年が欠落");
    if (
      child.budgetHistory != null &&
      (!Array.isArray(child.budgetHistory) || child.budgetHistory.length > 16)
    )
      problems.push("成人した別居子の収支履歴が不正");
    let previousBudgetYear = 0;
    for (const row of child.budgetHistory || []) {
      if (
        !Number.isInteger(row.year) ||
        row.year < child.budgetStartedYear ||
        row.year > s.year ||
        row.year <= previousBudgetYear ||
        !services.REG.some(region => region.n === row.region) ||
        (row.jobId != null && (!Number.isInteger(row.jobId) || !services.J[row.jobId])) ||
        !Number.isFinite(row.support) ||
        row.support < 0 ||
        !Number.isFinite(row.living) ||
        row.living < 0 ||
        (row.jobId == null
          ? row.income !== null || row.net !== null
          : !Number.isFinite(row.income) ||
            row.income < 0 ||
            !Number.isFinite(row.net) ||
            Math.abs(row.net - (row.income + row.support - row.living)) > 0.01)
      )
        problems.push("成人した別居子の年次収支行が不正");
      previousBudgetYear = row.year;
    }
  }
  for (const child of s.kids || []) {
    if (
      child.aidReceivedTotal != null &&
      (!Number.isFinite(child.aidReceivedTotal) || child.aidReceivedTotal < 0)
    )
      problems.push("成人子への一時援助累計が不正");
    if (child.aidTransfers != null && (!Array.isArray(child.aidTransfers) || child.aidTransfers.length > 12))
      problems.push("成人子への一時援助履歴が不正");
    for (const transfer of child.aidTransfers || [])
      if (
        !Number.isInteger(transfer.year) ||
        transfer.year < child.independentSinceYear ||
        transfer.year > s.year ||
        !Number.isFinite(transfer.amount) ||
        transfer.amount <= 0 ||
        transfer.cause !== "収支不足を聞いた後の一時援助"
      )
        problems.push("成人子への一時援助記録が不正");
  }
}
