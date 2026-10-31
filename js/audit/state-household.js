function auditSpouseAndChildState(s, problems, services = STATE_AUDIT_SERVICES) {
  const spouseVisits = s.sp?.visitHistory;
  if (spouseVisits != null && (!Array.isArray(spouseVisits) || spouseVisits.length > 20))
    problems.push("配偶者の訪問履歴が不正");
  if (Array.isArray(spouseVisits)) {
    const visitSum = spouseVisits.reduce(
      (sum, visit) => sum + (Number.isFinite(visit.fare) ? visit.fare : 0),
      0
    );
    if (
      !Number.isInteger(s.sp.visitCount || 0) ||
      (s.sp.visitCount || 0) < spouseVisits.length ||
      !Number.isFinite(s.sp.visitTotal || 0) ||
      (s.sp.visitTotal || 0) < visitSum - 0.01
    )
      problems.push("配偶者の訪問回数・累計費用が不正");
    for (const visit of spouseVisits)
      if (
        !Number.isInteger(visit.year) ||
        visit.year < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
        visit.year > s.year ||
        !services.REG.some(region => region.n === visit.from) ||
        !services.REG.some(region => region.n === visit.to) ||
        !Number.isFinite(visit.fare) ||
        visit.fare < 0 ||
        !("local" === visit.kind || "regional" === visit.kind) ||
        (visit.kind === "local" && visit.from !== visit.to) ||
        (visit.kind === "regional" &&
          (visit.from === visit.to ||
            !(services.MIGRATION_ROUTES[visit.from] || []).some(route => route.n === visit.to))) ||
        !(visit.paidBy === "household" || visit.paidBy === "personal")
      )
        problems.push("配偶者の訪問記録が不正");
  }
  const spouseResidenceHistory = s.sp?.residenceHistory;
  if (
    spouseResidenceHistory != null &&
    (!Array.isArray(spouseResidenceHistory) || spouseResidenceHistory.length > 16)
  )
    problems.push("配偶者の居住履歴が不正");
  if (Array.isArray(spouseResidenceHistory))
    for (const row of spouseResidenceHistory)
      if (
        !Number.isInteger(row.year) ||
        row.year < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
        row.year > s.year ||
        !services.REG.some(region => region.n === row.from) ||
        !services.REG.some(region => region.n === row.to) ||
        !["follow", "stay", "spouse_rejoined", "spouse_relocated"].includes(row.decision) ||
        ((row.decision === "spouse_rejoined" || row.decision === "spouse_relocated") &&
          (!Number.isFinite(row.fare) || row.fare < 0))
      )
        problems.push("配偶者の居住履歴項目が不正");
  for (const row of spouseResidenceHistory || [])
    if (
      row.kind != null &&
      (!["local", "regional"].includes(row.kind) ||
        (row.decision === "spouse_rejoined" &&
          ((row.kind === "local" && row.from !== row.to) ||
            (row.kind === "regional" &&
              (row.from === row.to ||
                !(services.MIGRATION_ROUTES[row.from] || []).some(route => route.n === row.to))))))
    )
      problems.push("配偶者の再合流経路記録が不正");
  const residencePending = s.sp?.residenceMovePending,
    residenceMove = residencePending ? s.moves?.[residencePending.moveIndex] : null;
  if (
    residencePending &&
    (!Number.isInteger(residencePending.year) ||
      residencePending.year > s.year ||
      residencePending.year < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
      !services.REG.some(region => region.n === residencePending.from) ||
      !services.REG.some(region => region.n === residencePending.to) ||
      !Number.isInteger(residencePending.moveIndex) ||
      residencePending.moveIndex < 0 ||
      residencePending.moveIndex >= (s.moves || []).length ||
      residenceMove?.year !== residencePending.year ||
      residenceMove?.from !== residencePending.from ||
      residenceMove?.to !== residencePending.to)
  )
    problems.push("配偶者の転居判断待ち記録が不正");
  if (s.sp?.separateSupportPlan != null && !["none", "living", "medical"].includes(s.sp.separateSupportPlan))
    problems.push("配偶者の別居中支援方法が不正");
  if (s.sp?.separateContact != null && !["regular", "letters", "paused"].includes(s.sp.separateContact))
    problems.push("配偶者の別居中連絡方法が不正");
  if (s.sp?.separateLifeReviewPending != null && typeof s.sp.separateLifeReviewPending !== "boolean")
    problems.push("配偶者の別居生活相談状態が不正");
  if (
    s.sp?.separateLifeReviewYear != null &&
    (!Number.isInteger(s.sp.separateLifeReviewYear) ||
      s.sp.separateLifeReviewYear < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
      s.sp.separateLifeReviewYear > s.year + services.P("family.spouseSeparateReviewMaxYears"))
  )
    problems.push("配偶者の別居生活相談年が不正");
  const separateHistory = s.sp?.separateLifeReviewHistory;
  if (separateHistory != null && (!Array.isArray(separateHistory) || separateHistory.length > 12))
    problems.push("配偶者の別居生活相談履歴が不正");
  if (Array.isArray(separateHistory))
    for (const row of separateHistory)
      if (
        !Number.isInteger(row.year) ||
        row.year < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
        row.year > s.year ||
        !["unrecorded", "none", "living", "medical"].includes(row.fromSupport) ||
        !["none", "living", "medical"].includes(row.toSupport) ||
        !["unrecorded", "regular", "letters", "paused"].includes(row.fromContact) ||
        !["regular", "letters", "paused"].includes(row.toContact)
      )
        problems.push("配偶者の別居生活相談履歴項目が不正");
  if (s.sp?.housingPlan != null && !["shared", "standard", "private"].includes(s.sp.housingPlan))
    problems.push("配偶者の住居形態が不正");
  const housingHistory = s.sp?.housingPlanHistory;
  if (housingHistory != null && (!Array.isArray(housingHistory) || housingHistory.length > 12))
    problems.push("配偶者の住居形態履歴が不正");
  if (Array.isArray(housingHistory))
    for (const row of housingHistory)
      if (
        !Number.isInteger(row.year) ||
        row.year < (s.sp.marriedYear ?? s.sp.by ?? s.year) ||
        row.year > s.year ||
        !services.REG.some(region => region.n === row.region) ||
        !["shared", "standard", "private"].includes(row.to) ||
        !["shared", "standard", "private"].includes(row.from) ||
        !Number.isFinite(row.annualHousingCost) ||
        row.annualHousingCost < 0 ||
        !Number.isFinite(row.setupCost) ||
        row.setupCost < 0
      )
        problems.push("配偶者の住居形態履歴項目が不正");
  if (
    s.sp?.pendingHousingSetupCostForYear != null &&
    (!Number.isFinite(s.sp.pendingHousingSetupCostForYear) || s.sp.pendingHousingSetupCostForYear < 0)
  )
    problems.push("配偶者の住居変更費が不正");
  if (
    s.sp?.separateSupportPaidTotal != null &&
    (!Number.isFinite(s.sp.separateSupportPaidTotal) || s.sp.separateSupportPaidTotal < 0)
  )
    problems.push("配偶者への別居支援累計が不正");
  if (
    s.sp?.separateSupportPaidYear != null &&
    (!Number.isInteger(s.sp.separateSupportPaidYear) || s.sp.separateSupportPaidYear > s.year)
  )
    problems.push("配偶者への別居支援年が不正");
  if (
    s.sp?.separateSupportPaidAmount != null &&
    (!Number.isFinite(s.sp.separateSupportPaidAmount) || s.sp.separateSupportPaidAmount < 0)
  )
    problems.push("配偶者への別居支援額が不正");
  const separateSupportHistory = s.sp?.separateSupportHistory;
  if (
    separateSupportHistory != null &&
    (!Array.isArray(separateSupportHistory) || separateSupportHistory.length > 16)
  )
    problems.push("配偶者への別居支援履歴が不正");
  if (Array.isArray(separateSupportHistory))
    for (const row of separateSupportHistory)
      if (
        !Number.isInteger(row.year) ||
        row.year > s.year ||
        !Number.isFinite(row.amount) ||
        row.amount <= 0 ||
        !services.REG.some(region => region.n === row.region) ||
        !["living", "medical"].includes(row.plan) ||
        (row.transactionId != null && typeof row.transactionId !== "string")
      )
        problems.push("配偶者への別居支援履歴項目が不正");
  const supportReceipts = s.sp?.personalFinance?.supportReceipts;
  if (supportReceipts != null && (!Array.isArray(supportReceipts) || supportReceipts.length > 16))
    problems.push("配偶者の別居支援受取履歴が不正");
  if (Array.isArray(supportReceipts))
    for (const receipt of supportReceipts) {
      if (
        typeof receipt.transactionId !== "string" ||
        !receipt.transactionId ||
        !Number.isInteger(receipt.year) ||
        receipt.year > s.year ||
        !Number.isFinite(receipt.amount) ||
        receipt.amount <= 0 ||
        !services.REG.some(region => region.n === receipt.region) ||
        !["living", "medical"].includes(receipt.plan) ||
        typeof receipt.fromId !== "string"
      )
        problems.push("配偶者の別居支援受取項目が不正");
      const sent = separateSupportHistory?.find(row => row.transactionId === receipt.transactionId),
        annual = s.sp.personalFinance.history?.find(
          row => row.supportTransactionId === receipt.transactionId
        );
      if (
        !sent ||
        sent.year !== receipt.year ||
        sent.amount !== receipt.amount ||
        sent.region !== receipt.region ||
        sent.plan !== receipt.plan ||
        !annual ||
        annual.year !== receipt.year ||
        annual.support !== receipt.amount
      )
        problems.push("配偶者の別居支援受取が送金側・年次家計と一致しない");
    }
  for (const sent of separateSupportHistory || [])
    if (sent.transactionId) {
      const receipt = supportReceipts?.find(row => row.transactionId === sent.transactionId);
      if (!receipt || receipt.year !== sent.year || receipt.amount !== sent.amount)
        problems.push("別居配偶者への送金に受取記録がない");
    }
  for (const row of s.sp?.personalFinance?.history || [])
    if (
      row.supportTransactionId &&
      (!Number.isFinite(row.support) ||
        row.support <= 0 ||
        // Annual budgets retain 20 years, while paired support receipts retain 16 transfers.
        (!(supportReceipts?.length === 16 && supportReceipts.every(receipt => receipt.year > row.year)) &&
          !supportReceipts?.some(
            receipt =>
              receipt.transactionId === row.supportTransactionId &&
              receipt.year === row.year &&
              receipt.amount === row.support
          )))
    )
      problems.push("配偶者本人の年次支援受取IDが不整合");
  if (s.sp?.tx != null && ![0, 1, false, true].includes(s.sp.tx)) problems.push("配偶者の療養状態が不正");
  if (s.sp?.careEverStarted != null && ![0, 1, false, true].includes(s.sp.careEverStarted))
    problems.push("配偶者の療養開始履歴が不正");
  if (
    s.sp?.householdArrangement != null &&
    !["shared", "separate", "caregiving"].includes(s.sp.householdArrangement)
  )
    problems.push("配偶者の家計分担記録が不正");
  if (
    s.sp?.arrangementYear != null &&
    (!Number.isFinite(s.sp.arrangementYear) || s.sp.arrangementYear > s.year || !s.sp.householdArrangement)
  )
    problems.push("配偶者の家計分担年が不正");
  if (
    s.sp?.arrangementReviewYear != null &&
    (!Number.isFinite(s.sp.arrangementReviewYear) ||
      !Number.isFinite(s.sp.arrangementYear) ||
      Math.abs(
        s.sp.arrangementReviewYear - s.sp.arrangementYear - services.P("family.spouseArrangementReviewYears")
      ) > 0.001)
  )
    problems.push("配偶者の家計分担再相談年が不正");
  for (const former of s.relationshipHistory || [])
    if (former.parentingPlan) {
      const history = former.parentingHistory;
      if (
        former.ending !== "離婚" ||
        !["unreviewed", "coordinate", "mediated", "low_contact", "completed"].includes(
          former.parentingPlan
        ) ||
        typeof former.parentingReviewPending !== "boolean" ||
        (former.parentingReviewYear != null &&
          (!Number.isInteger(former.parentingReviewYear) ||
            former.parentingReviewYear > s.year + services.P("family.divorceParentingReviewMaxYears"))) ||
        !Array.isArray(history) ||
        history.length > 12
      )
        problems.push("離婚後の養育相談状態が不正");
      for (const row of history || [])
        if (
          !Number.isInteger(row.year) ||
          row.year < former.endedYear ||
          row.year > s.year ||
          !["coordinate", "mediated", "low_contact"].includes(row.plan) ||
          !Array.isArray(row.children) ||
          row.children.some(id => !s.kids.some(child => child.id === id && child.otherParentId === former.id))
        )
          problems.push("離婚後の養育相談履歴が不正");
    }
  for (const former of s.relationshipHistory || [])
    if (
      former.ending === "離婚" &&
      formerSpouseDeathKnown(former) &&
      (former.parentingReviewPending || former.parentingReviewYear != null)
    )
      problems.push("死亡が確認された離婚相手への養育相談が継続中");
  for (const relationship of s.relationshipHistory || [])
    if (
      relationship.ending === "死別" &&
      !["friend", "neighbor"].includes(relationship.kind) &&
      (relationship.deathYear < 0 ||
        relationship.deathYear > s.year ||
        !Number.isFinite(relationship.deathKnownYear) ||
        relationship.deathKnownYear < relationship.deathYear ||
        relationship.deathKnownYear > s.year ||
        !Number.isInteger(relationship.deathNoticeAvailableYear) ||
        relationship.deathNoticeAvailableYear < relationship.deathYear ||
        relationship.deathNoticeAvailableYear > relationship.deathKnownYear ||
        !["face_to_face", "family_letter_or_travelling_relative", "kin_or_community_relay"].includes(
          relationship.deathNoticeChannel
        ) ||
        !Array.isArray(relationship.deathNoticeHistory) ||
        relationship.deathNoticeHistory.at(-1)?.year !== relationship.deathKnownYear)
    )
      problems.push("配偶者の死亡年・認知年が不正");
  if (
    !Number.isFinite(services.P("economy.divorcedChildSupportAnnualCost")) ||
    services.P("economy.divorcedChildSupportAnnualCost") < 0
  )
    problems.push("離婚後の子への任意支援額が不正");
  for (const child of s.kids || []) {
    const plan = child.householdResidencePlan,
      plans = ["self", "former_support", "former", "shared", "unresolved"],
      proposalPlans = ["self", "former_support", "former", "shared"],
      former = (s.relationshipHistory || []).find(
        person => person.id === child.otherParentId && person.ending === "離婚"
      );
    if (plan != null && (!plans.includes(plan) || !former)) problems.push("離婚後の子の生活先記録が不正");
    if (
      child.householdResidenceUpdatedYear != null &&
      (!Number.isInteger(child.householdResidenceUpdatedYear) ||
        child.householdResidenceUpdatedYear < (former?.endedYear ?? child.by) ||
        child.householdResidenceUpdatedYear > s.year ||
        !plan)
    )
      problems.push("離婚後の子の生活先更新年が不正");
    if (
      child.householdResidenceReviewYear != null &&
      (!Number.isInteger(child.householdResidenceReviewYear) ||
        !former ||
        child.householdResidenceReviewYear < former.endedYear + 1 ||
        child.householdResidenceReviewYear > s.year + services.P("family.divorceParentingReviewMaxYears"))
    )
      problems.push("離婚後の子の生活先再相談年が不正");
    const history = child.householdResidenceHistory;
    if (history != null && (!Array.isArray(history) || history.length > 12))
      problems.push("離婚後の子の生活先履歴が不正");
    for (const row of history || [])
      if (
        !former ||
        !Number.isInteger(row.year) ||
        row.year < former.endedYear ||
        row.year > s.year ||
        !plans.includes(row.plan) ||
        !Number.isFinite(row.annualSupport) ||
        row.annualSupport < 0 ||
        (row.plan === "former_support") !== (row.annualSupport > 0) ||
        (row.cause != null && row.cause !== "other_parent_death_notice")
      )
        problems.push("離婚後の子の生活先履歴項目が不正");
    if (history?.length && plan !== history.at(-1).plan)
      problems.push("離婚後の子の生活先と履歴の最終記録が不一致");
    const proposal = child.householdResidenceProposal;
    if (
      proposal != null &&
      (!former ||
        !Number.isInteger(proposal.year) ||
        proposal.year < former.endedYear ||
        proposal.year > s.year ||
        !proposalPlans.includes(proposal.plan) ||
        !Number.isFinite(proposal.annualSupport) ||
        proposal.annualSupport < 0 ||
        (proposal.plan === "former_support") !== (proposal.annualSupport > 0) ||
        proposal.status !== "pending" ||
        !["former_spouse", "child"].includes(proposal.recipientRole) ||
        (proposal.recipientRole === "former_spouse" && proposal.recipientId !== former.id) ||
        (proposal.recipientRole === "child" && proposal.recipientId !== child.id) ||
        (formerSpouseDeathKnown(former) &&
          (proposal.recipientRole !== "child" || proposal.plan !== "self")))
    )
      problems.push("離婚後の子の生活先提案が不正");
    const proposalHistory = child.householdResidenceProposalHistory;
    if (proposalHistory != null && (!Array.isArray(proposalHistory) || proposalHistory.length > 12))
      problems.push("離婚後の子の生活先提案履歴が不正");
    for (const row of proposalHistory || [])
      if (
        !former ||
        !Number.isInteger(row.year) ||
        row.year < former.endedYear ||
        row.year > s.year ||
        !proposalPlans.includes(row.plan) ||
        !Number.isFinite(row.annualSupport) ||
        row.annualSupport < 0 ||
        (row.plan === "former_support") !== (row.annualSupport > 0) ||
        row.status !== "closed_co_parent_death" ||
        !Number.isInteger(row.closedYear) ||
        row.closedYear < row.year ||
        row.closedYear > s.year ||
        row.recipientRole !== "former_spouse" ||
        row.recipientId !== former.id
      )
        problems.push("離婚後の子の生活先提案履歴項目が不正");
    if (
      formerSpouseDeathKnown(former) &&
      !child.d &&
      s.year - child.by < services.P("life.adultStartAge") &&
      ["former", "former_support", "shared"].includes(plan)
    )
      problems.push("死亡した親を前提とする子の生活先が残存");
    const supportHistory = child.futurePlanSupportHistory,
      supportKinds = ["study-funds", "work-introduction", "household-open", "move-funds", "revisit"];
    if (supportHistory != null && (!Array.isArray(supportHistory) || supportHistory.length > 12))
      problems.push("子どもの進路支援履歴が不正");
    for (const row of supportHistory || [])
      if (
        !Number.isInteger(row.year) ||
        row.year < child.by ||
        row.year > s.year ||
        !supportKinds.includes(row.kind) ||
        !Number.isFinite(row.amount) ||
        row.amount < 0 ||
        ((row.kind === "study-funds" || row.kind === "move-funds") !== (row.amount > 0)) ||
        (row.kind === "study-funds" && row.amount !== 15e4) ||
        (row.kind === "move-funds" && row.amount !== 8e4)
      )
        problems.push("子どもの進路支援履歴項目が不正");
  }
  for (const child of s.kids) {
    if (!Number.isFinite(child.by) || child.by > s.year) problems.push("子の出生年が不正");
    if (
      child.exposurePending &&
      (!Number.isFinite(child.exposureYear) ||
        child.exposureYear < child.by ||
        child.exposureYear > s.year ||
        !Number.isFinite(child.exposureReviewYear) ||
        child.exposureReviewYear < child.exposureYear ||
        child.exposureReviewYear > s.year + 10 ||
        !child.exposureCause ||
        child.inf ||
        child.d)
    )
      problems.push("子の曝露後検査待ち記録が不正");
    if (
      child.exposureClosedYear != null &&
      (!Number.isFinite(child.exposureClosedYear) ||
        child.exposureClosedYear < child.exposureYear ||
        child.exposureClosedYear > s.year ||
        child.exposurePending ||
        child.exposureReviewYear != null)
    )
      problems.push("子の曝露後検査終了記録が不正");
    if (child.tx && !child.inf) problems.push("未感染の子に専門診療が有効");
    if (
      child.careSupport != null &&
      (![0, 1].includes(child.careSupport) || (child.careSupport && !child.inf))
    )
      problems.push("子の療養支援状態が不正");
    if (
      child.careSupportUpdatedYear != null &&
      (!Number.isInteger(child.careSupportUpdatedYear) ||
        child.careSupportUpdatedYear < child.by ||
        child.careSupportUpdatedYear > s.year ||
        child.careSupport == null)
    )
      problems.push("子の療養支援更新年が不正");
    if (
      child.d &&
      (child.d < child.by ||
        child.d > s.year ||
        !Number.isFinite(child.deathKnownYear) ||
        child.deathKnownYear < child.d ||
        child.deathKnownYear > s.year)
    )
      problems.push("子の死亡年・訃報認知年が不正");
    if (child.d && child.tx) problems.push("死亡した子の治療が継続中");
    if (!child.d && (child.deathKnownYear != null || child.deathCause || child.treatmentEndedYear != null))
      problems.push("存命の子に死亡記録が残存");
    if (
      child.householdStatus &&
      !["study", "working", "supported", "independent"].includes(child.householdStatus)
    )
      problems.push("子の家族内進路が不正");
    if (
      child.futurePlanReviewYear != null &&
      (!Number.isFinite(child.futurePlanReviewYear) ||
        child.futurePlanReviewYear < child.by ||
        child.futurePlanReviewYear > s.year + 10)
    )
      problems.push("子の進路相談予定年が不正");
    if (child.householdStatus === "working" && (!Number.isInteger(child.jobId) || !services.J[child.jobId]))
      problems.push("働く子の職業記録が不正");
    if (
      child.householdStatus === "independent" &&
      (!Number.isFinite(child.independentSinceYear) ||
        child.independentSinceYear < child.by ||
        child.independentSinceYear > s.year)
    )
      problems.push("子の別居開始年が不正");
    if (
      child.householdStatus === "study" &&
      (!Number.isFinite(child.studyEndYear) || child.studyEndYear <= s.year)
    )
      problems.push("子の就学終了予定年が不正");
  }
  for (const child of s.kids) {
    if (child.contactState != null && !["regular", "paused"].includes(child.contactState))
      problems.push("成人した子との連絡状態が不正");
    if (
      child.contactReviewYear != null &&
      (!Number.isFinite(child.contactReviewYear) ||
        child.contactReviewYear < child.by ||
        child.contactReviewYear > s.year + 10)
    )
      problems.push("子との連絡再確認年が不正");
    if (
      child.lastContactYear != null &&
      (!Number.isFinite(child.lastContactYear) ||
        child.lastContactYear < child.by ||
        child.lastContactYear > s.year)
    )
      problems.push("子との最終連絡年が不正");
    if (
      child.returnOfferYear != null &&
      (!Number.isFinite(child.returnOfferYear) ||
        child.returnOfferYear < child.by ||
        child.returnOfferYear > s.year ||
        child.householdStatus !== "independent")
    )
      problems.push("子の帰宅相談状態が不正");
    if (child.d && (child.returnOfferYear != null || child.returnRequestYear != null))
      problems.push("死亡した子の帰宅相談が残存");
    if (
      child.returnRequestYear != null &&
      (!Number.isFinite(child.returnRequestYear) ||
        child.returnRequestYear < child.by ||
        child.returnRequestYear > s.year ||
        child.householdStatus !== "independent")
    )
      problems.push("子からの帰宅相談状態が不正");
    if (
      (child.returnRoomSetupYear == null) !== (child.returnRoomSetupCost == null) ||
      (child.returnRoomSetupYear != null &&
        (!Number.isFinite(child.returnRoomSetupYear) ||
          child.returnRoomSetupYear < child.by ||
          child.returnRoomSetupYear > s.year ||
          !Number.isFinite(child.returnRoomSetupCost) ||
          child.returnRoomSetupCost < 0))
    )
      problems.push("成人子の再同居準備費記録が不正");
    if (
      child.remittanceAnnual != null &&
      (!Number.isFinite(child.remittanceAnnual) || child.remittanceAnnual < 0)
    )
      problems.push("子への送金額が不正");
    if (child.remittanceAnnual > 0 && ((!child.d && child.householdStatus !== "independent") || child.d))
      problems.push("別居していない子または死亡した子への送金が残存");
    for (const key of ["remittanceStartedYear", "remittanceEndedYear"])
      if (
        child[key] != null &&
        (!Number.isFinite(child[key]) || child[key] < child.by || child[key] > s.year)
      )
        problems.push("子への送金の開始・終了年が不正");
    if (child.remittanceAnnual > 0 && child.remittanceEndedYear != null)
      problems.push("送金継続中の子に終了年が残存");
    if (
      child.returnedHomeYear != null &&
      (!Number.isFinite(child.returnedHomeYear) ||
        child.returnedHomeYear < child.by ||
        child.returnedHomeYear > s.year)
    )
      problems.push("子の再同居年が不正");
  }
  for (const child of s.kids) {
    if (child.visitHistory != null && !Array.isArray(child.visitHistory))
      problems.push("成人した子への訪問履歴が配列ではない");
    const visits = Array.isArray(child.visitHistory) ? child.visitHistory : [];
    if (
      !Number.isInteger(child.visitCount || 0) ||
      (child.visitCount || 0) < visits.length ||
      !Number.isFinite(child.visitTotal || 0) ||
      (child.visitTotal || 0) <
        visits.reduce((sum, visit) => sum + (Number.isFinite(visit.fare) ? visit.fare : 0), 0) - 0.01
    )
      problems.push("成人した子への訪問回数・累計費用が不正");
    for (const visit of visits)
      if (
        !Number.isInteger(visit.year) ||
        visit.year < child.by ||
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
        problems.push("成人した子への訪問記録が不正");
    for (const key of ["region", "knownRegion"])
      if (child[key] != null && !services.REG.some(region => region.n === child[key]))
        problems.push("成人した子の居住地域が不正");
    if (
      child.regionKnownYear != null &&
      (!Number.isFinite(child.regionKnownYear) ||
        child.regionKnownYear < child.by ||
        child.regionKnownYear > s.year)
    )
      problems.push("子の居住地域の確認年が不正");
    if (
      child.jobKnownYear != null &&
      (!Number.isFinite(child.jobKnownYear) || child.jobKnownYear < child.by || child.jobKnownYear > s.year)
    )
      problems.push("子の職業を確認した年が不正");
    if (child.knownJobId != null && (!Number.isInteger(child.knownJobId) || !services.J[child.knownJobId]))
      problems.push("子の既知の職業IDが不正");
    if (
      child.moveReviewYear != null &&
      (!Number.isFinite(child.moveReviewYear) ||
        child.moveReviewYear < s.year ||
        child.moveReviewYear > s.year + services.P("family.adultChildMoveReviewMaxYears"))
    )
      problems.push("子の転居再確認年が不正");
    if (child.moveReviewYear != null && child.householdStatus !== "independent")
      problems.push("別居していない子に転居見直し予定がある");
    if (child.moveHistory != null && !Array.isArray(child.moveHistory))
      problems.push("子の転居履歴が配列ではない");
    const moves = Array.isArray(child.moveHistory) ? child.moveHistory : [];
    if (
      !Number.isInteger(child.knownMoveCount || 0) ||
      (child.knownMoveCount || 0) < 0 ||
      (child.knownMoveCount || 0) > moves.length
    )
      problems.push("親が把握する子の転居件数が不正");
    for (const move of moves)
      if (
        !Number.isFinite(move.year) ||
        move.year < child.by ||
        move.year > s.year ||
        !services.REG.some(region => region.n === move.from) ||
        !services.REG.some(region => region.n === move.to) ||
        !Number.isInteger(move.jobId) ||
        !services.J[move.jobId]
      )
        problems.push("子の転居記録が不正");
  }
}

function auditFamilyModelParameters(problems, services = STATE_AUDIT_SERVICES) {
  const adultChildHousingCost = services.P("economy.adultChildSharedHousingAnnualCost");
  if (!Number.isFinite(adultChildHousingCost) || adultChildHousingCost < 0 || adultChildHousingCost > 1e7)
    problems.push("成人した同居子の住居・共益費設定が不正");
  const parentCareDirectMin = services.P("family.parentCareDirectMinHealth");
  if (!Number.isFinite(parentCareDirectMin) || parentCareDirectMin < 0 || parentCareDirectMin > 100)
    problems.push("本人の直接ケア体調条件が不正");
  for (const id of ["fam_care", "fam_care_followup"])
    if (services.EV.find(event => event.id === id)?.c?.[0]?.en?.ge?.h !== parentCareDirectMin)
      problems.push("直接ケアの選択条件と体調設定値が一致しない");
  const siblingMoveMin = services.P("family.siblingMoveReviewMinYears"),
    siblingMoveMax = services.P("family.siblingMoveReviewMaxYears"),
    siblingMoveChance = services.P("family.siblingMoveChance");
  const siblingCareSupport = services.P("economy.siblingInfectionSupportAnnualCost"),
    siblingFinanceReserve = services.P("family.siblingFinanceStrainReserveShare"),
    siblingOpeningReserve = services.P("family.siblingIndependenceOpeningReserve"),
    siblingTreatmentReserve = services.P("family.siblingCarePaymentReserveShare"),
    siblingFinancialKnowledgeYears = services.P("family.siblingCareFinancialKnowledgeYears");
  if (!Number.isFinite(siblingCareSupport) || siblingCareSupport < 0)
    problems.push("別居きょうだいの療養支援額が不正");
  if (!Number.isFinite(siblingFinanceReserve) || siblingFinanceReserve < 0 || siblingFinanceReserve > 2)
    problems.push("別居きょうだいの家計逼迫判定設定が不正");
  if (!Number.isFinite(siblingOpeningReserve) || siblingOpeningReserve < 0 || siblingOpeningReserve > 4e4)
    problems.push("きょうだいの独立準備金設定が不正");
  if (!Number.isFinite(siblingTreatmentReserve) || siblingTreatmentReserve < 0 || siblingTreatmentReserve > 1)
    problems.push("きょうだいの療養費分担後準備金設定が不正");
  if (
    !Number.isInteger(siblingFinancialKnowledgeYears) ||
    siblingFinancialKnowledgeYears < 1 ||
    siblingFinancialKnowledgeYears > 10
  )
    problems.push("きょうだい家計把握の有効期間設定が不正");
  if (
    !Number.isInteger(siblingMoveMin) ||
    siblingMoveMin < 1 ||
    !Number.isInteger(siblingMoveMax) ||
    siblingMoveMax < siblingMoveMin ||
    !Number.isFinite(siblingMoveChance) ||
    siblingMoveChance < 0 ||
    siblingMoveChance > 1
  )
    problems.push("別居きょうだいの移動モデル設定が不正");
  const moveMin = services.P("family.adultChildMoveReviewMinYears"),
    moveMax = services.P("family.adultChildMoveReviewMaxYears"),
    moveChance = services.P("family.adultChildMoveChance"),
    returnRequestChance = services.P("family.adultChildReturnRequestChance"),
    returnRoomSetupBase = services.P("family.adultChildReturnRoomSetupCost"),
    siblingContactYears = services.P("family.siblingContactReviewYears"),
    siblingWorkMin = services.P("family.siblingWorkReviewMinYears"),
    siblingWorkMax = services.P("family.siblingWorkReviewMaxYears"),
    siblingWorkChance = services.P("family.siblingWorkChangeChance");
  if (
    !Number.isInteger(moveMin) ||
    moveMin < 1 ||
    !Number.isInteger(moveMax) ||
    moveMax < moveMin ||
    !Number.isFinite(moveChance) ||
    moveChance < 0 ||
    moveChance > 1
  )
    problems.push("成人した子の移動モデル設定が不正");
  if (!Number.isFinite(returnRequestChance) || returnRequestChance < 0 || returnRequestChance > 1)
    problems.push("成人した子からの帰宅相談確率が不正");
  if (!Number.isFinite(returnRoomSetupBase) || returnRoomSetupBase < 0 || returnRoomSetupBase > 1e7)
    problems.push("成人子の寝床・部屋準備費設定が不正");
  if (!Number.isInteger(siblingContactYears) || siblingContactYears < 1)
    problems.push("別居きょうだいとの連絡間隔設定が不正");
  if (
    !Number.isInteger(siblingWorkMin) ||
    siblingWorkMin < 1 ||
    !Number.isInteger(siblingWorkMax) ||
    siblingWorkMax < siblingWorkMin ||
    !Number.isFinite(siblingWorkChance) ||
    siblingWorkChance < 0 ||
    siblingWorkChance > 1
  )
    problems.push("別居きょうだいの仕事モデル設定が不正");
  const familyReviewMin = services.P("family.siblingFamilyReviewMinYears"),
    familyReviewMax = services.P("family.siblingFamilyReviewMaxYears"),
    partnerMin = services.P("family.siblingPartnerMinAge"),
    partnerMax = services.P("family.siblingPartnerMaxAge"),
    childMaxAge = services.P("family.siblingChildArrivalMaxAge"),
    partnerChance = services.P("family.siblingPartnerFormationChance"),
    childChance = services.P("family.siblingChildJoinChance"),
    maxSiblingChildren = services.P("family.siblingChildrenMax"),
    partnerIncome = services.P("family.siblingPartnerIncomeShare"),
    partnerExpense = services.P("family.siblingPartnerExpenseShare"),
    childExpense = services.P("family.siblingChildExpenseShare");
  if (
    !Number.isInteger(familyReviewMin) ||
    familyReviewMin < 1 ||
    !Number.isInteger(familyReviewMax) ||
    familyReviewMax < familyReviewMin ||
    !Number.isInteger(partnerMin) ||
    partnerMin < 0 ||
    !Number.isInteger(partnerMax) ||
    partnerMax < partnerMin ||
    !Number.isInteger(childMaxAge) ||
    childMaxAge < partnerMin ||
    !Number.isFinite(partnerChance) ||
    partnerChance < 0 ||
    partnerChance > 1 ||
    !Number.isFinite(childChance) ||
    childChance < 0 ||
    childChance > 1 ||
    !Number.isInteger(maxSiblingChildren) ||
    maxSiblingChildren < 0 ||
    !Number.isFinite(partnerIncome) ||
    partnerIncome < 0 ||
    partnerIncome > 1 ||
    !Number.isFinite(partnerExpense) ||
    partnerExpense < 0 ||
    !Number.isFinite(childExpense) ||
    childExpense < 0
  )
    problems.push("別居きょうだい家族形成・費用の設定値が不正");
}
