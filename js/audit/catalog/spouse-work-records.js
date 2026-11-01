function validateSpouseWorkRecords(W_, services) {
  if (services.S?.sp) {
    const spouse = services.S.sp,
      history = Array.isArray(spouse.workHistory) ? spouse.workHistory : [];
    if (spouse.j != null && (!Number.isInteger(spouse.j) || !services.J[spouse.j]))
      W_.push("配偶者の職業IDが不正");
    if (spouse.workHistory != null && !Array.isArray(spouse.workHistory))
      W_.push("配偶者の職歴が配列ではない");
    if (
      spouse.workReviewYear != null &&
      (!Number.isFinite(spouse.workReviewYear) ||
        spouse.workReviewYear < services.S.year ||
        spouse.workReviewYear > services.S.year + spouseWorkMax)
    )
      W_.push("配偶者の職業見直し年が不正");
    for (const change of history)
      if (
        !Number.isFinite(change.year) ||
        change.year <= (spouse.marriedYear ?? spouse.by ?? services.S.year) ||
        change.year > services.S.year ||
        !Number.isInteger(change.fromJobId) ||
        !services.J[change.fromJobId] ||
        !Number.isInteger(change.toJobId) ||
        !services.J[change.toJobId] ||
        change.fromJobId === change.toJobId
      )
        W_.push("配偶者の職歴記録が不正");
  }
  if (services.S?.sp) {
    const spouse = services.S.sp,
      employment = Array.isArray(spouse.employmentHistory) ? spouse.employmentHistory : [],
      support = Array.isArray(spouse.employmentSupportHistory) ? spouse.employmentSupportHistory : [];
    if (spouse.employmentStatus != null && !["employed", "unemployed"].includes(spouse.employmentStatus))
      W_.push("配偶者の雇用状態が不正");
    if (
      spouse.employmentStatus === "unemployed" &&
      (!Number.isFinite(spouse.unemployedSinceYear) ||
        spouse.unemployedSinceYear < (spouse.marriedYear ?? spouse.by ?? services.S.year) ||
        spouse.unemployedSinceYear > services.S.year)
    )
      W_.push("配偶者の失職開始年が不正");
    if (spouse.employmentStatus !== "unemployed" && spouse.unemployedSinceYear != null)
      W_.push("就労中の配偶者に失職年が残っている");
    if (spouse.unemploymentSupportPending != null && typeof spouse.unemploymentSupportPending !== "boolean")
      W_.push("配偶者の求職相談状態が不正");
    if (spouse.employmentHistory != null && !Array.isArray(spouse.employmentHistory))
      W_.push("配偶者の雇用履歴が配列ではない");
    for (const row of employment)
      if (
        !Number.isFinite(row.year) ||
        row.year <= (spouse.marriedYear ?? spouse.by ?? services.S.year) ||
        row.year > services.S.year ||
        !["employed", "unemployed"].includes(row.from) ||
        !["employed", "unemployed"].includes(row.to) ||
        row.from === row.to
      )
        W_.push("配偶者の雇用履歴が不正");
    if (spouse.employmentSupportHistory != null && !Array.isArray(spouse.employmentSupportHistory))
      W_.push("配偶者の求職支援履歴が配列ではない");
    for (const row of support)
      if (
        !Number.isFinite(row.year) ||
        row.year < (spouse.marriedYear ?? spouse.by ?? services.S.year) ||
        row.year > services.S.year ||
        !["training", "search", "wait"].includes(row.kind)
      )
        W_.push("配偶者の求職支援履歴が不正");
    if (
      spouse.reemploymentBoost != null &&
      (!Number.isFinite(spouse.reemploymentBoost) ||
        spouse.reemploymentBoost < 0 ||
        spouse.reemploymentBoost > 1)
    )
      W_.push("配偶者の求職支援補正が不正");
  }
}
