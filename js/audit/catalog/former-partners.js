function validateFormerPartners(W_, services) {
  for (const former of services.S?.relationshipHistory || [])
    if (former.ending === "離婚") {
      if (
        former.knownResidenceRegion != null &&
        !services.REG.some(region => region.n === former.knownResidenceRegion)
      )
        W_.push("離婚した相手の既知の居住地域が不正");
      if (
        former.moveHistory != null &&
        (!Array.isArray(former.moveHistory) || former.moveHistory.length > 12)
      )
        W_.push("離婚した相手の移動履歴が不正");
      for (const row of former.moveHistory || [])
        if (
          !Number.isInteger(row.id) ||
          !Number.isInteger(row.year) ||
          row.year < (former.by || 0) ||
          row.year > services.S.year ||
          !services.REG.some(region => region.n === row.from) ||
          !services.REG.some(region => region.n === row.to) ||
          row.from === row.to ||
          !Number.isFinite(row.estimatedFare) ||
          row.estimatedFare < 0 ||
          row.basis !== "game-model"
        )
          W_.push("離婚した相手の移動履歴項目が不正");
      if (
        former.moveCount != null &&
        (!Number.isInteger(former.moveCount) ||
          former.moveCount < (former.moveHistory || []).length ||
          !Number.isInteger(former.knownMoveCount) ||
          former.knownMoveCount < 0 ||
          former.knownMoveCount > former.moveCount)
      )
        W_.push("離婚した相手の移動認知数が不正");
      if (
        former.independentMoveReviewYear != null &&
        (!Number.isInteger(former.independentMoveReviewYear) ||
          former.independentMoveReviewYear < services.S.year ||
          former.independentMoveReviewYear > services.S.year + services.P("family.spouseMoveReviewMaxYears"))
      )
        W_.push("離婚した相手の移動見直し年が不正");
      const moveNotice = former.residenceMoveNotice;
      if (
        moveNotice != null &&
        (!Number.isInteger(moveNotice.moveCount) ||
          moveNotice.moveCount < 1 ||
          moveNotice.moveCount > former.moveCount ||
          !Number.isInteger(moveNotice.year) ||
          moveNotice.year < (former.by || 0) ||
          moveNotice.year > services.S.year ||
          !Number.isInteger(moveNotice.availableYear) ||
          moveNotice.availableYear < moveNotice.year ||
          moveNotice.availableYear > services.S.year + 2 ||
          !services.REG.some(region => region.n === moveNotice.from) ||
          !services.REG.some(region => region.n === moveNotice.to) ||
          moveNotice.from === moveNotice.to ||
          (moveNotice.deliveredYear != null &&
            (!Number.isInteger(moveNotice.deliveredYear) ||
              moveNotice.deliveredYear < moveNotice.availableYear ||
              moveNotice.deliveredYear > services.S.year)))
      )
        W_.push("離婚した相手の転居知らせ状態が不正");
      if (
        former.moveNoticeHistory != null &&
        (!Array.isArray(former.moveNoticeHistory) || former.moveNoticeHistory.length > 12)
      )
        W_.push("離婚した相手の転居通知履歴が不正");
      for (const row of former.moveNoticeHistory || [])
        if (
          !Number.isInteger(row.year) ||
          row.year > services.S.year ||
          !Number.isInteger(row.moveYear) ||
          row.moveYear > row.year ||
          row.moveYear < (former.by || 0) ||
          !services.REG.some(region => region.n === row.from) ||
          !services.REG.some(region => region.n === row.to)
        )
          W_.push("離婚した相手の転居通知履歴項目が不正");
    }
  for (const former of services.S?.relationshipHistory || []) {
    const sharedChild = (services.S.kids || []).some(child => child.otherParentId === former.id);
    if (
      former.ending === "離婚" &&
      former.lifeStatus != null &&
      (!sharedChild ||
        !Number.isInteger(former.mortalityCheckedYear) ||
        former.mortalityCheckedYear > services.S.year ||
        (former.lifeStatus === "dead" &&
          (!Number.isInteger(former.actualDeathYear) ||
            former.actualDeathYear > former.mortalityCheckedYear ||
            (!former.deathNoticePending && !Number.isInteger(former.deathKnownYear)))))
    )
      W_.push("離婚した相手の生死・訃報記録が不正");
    if (
      former.ending === "離婚" &&
      former.deathNoticePending &&
      (!Number.isInteger(former.deathNoticeAvailableYear) ||
        former.deathNoticeAvailableYear < former.actualDeathYear ||
        former.deathNoticeAvailableYear > services.S.year + 2 ||
        !sharedChild)
    )
      W_.push("離婚した相手の訃報伝達記録が不正");
    if (
      former.ending === "離婚" &&
      Number.isInteger(former.deathKnownYear) &&
      (!Number.isInteger(former.deathYear) ||
        former.deathYear > former.deathKnownYear ||
        former.deathKnownYear > services.S.year)
    )
      W_.push("離婚した相手の訃報認知年が不正");
  }
}
