function validateCareParameters(W_, services) {
  const careMoveMin = services.P("family.careNetworkMoveReviewMinYears"),
    careMoveMax = services.P("family.careNetworkMoveReviewMaxYears"),
    careMoveChance = services.P("family.careNetworkMoveChance"),
    careNoticeChance = services.P("family.careNetworkMoveNoticeChance"),
    careLetterReach = services.P("family.careNetworkMoveLetterReach"),
    careRelayReach = services.P("family.careNetworkMoveRelayReach"),
    memberMoveMin = services.P("family.careNetworkMemberMoveReviewMinYears"),
    memberMoveMax = services.P("family.careNetworkMemberMoveReviewMaxYears"),
    memberMoveChance = services.P("family.careNetworkMemberMoveChance"),
    memberNoticeChance = services.P("family.careNetworkMemberMoveNoticeChance"),
    memberDeathNotice = services.P("family.careNetworkMemberDeathNoticeChance"),
    memberMissingChance = services.P("family.careNetworkMemberMissingChance"),
    memberFoundChance = services.P("family.careNetworkMemberFoundChance"),
    socialMissingChance = services.P("family.socialContactMissingChance"),
    socialFoundChance = services.P("family.socialContactFoundChance"),
    socialSearchBoost = services.P("family.socialContactSearchBoost"),
    socialRecontactChance = services.P("family.socialContactRecontactChance"),
    socialRecontactDelay = services.P("family.socialContactRecontactRelayYears");
  if (!Number.isInteger(socialRecontactDelay) || socialRecontactDelay < 1 || socialRecontactDelay > 4)
    W_.push("友人・隣人の再連絡遅延設定が不正");
  if (
    !Number.isInteger(careMoveMin) ||
    careMoveMin < 1 ||
    !Number.isInteger(careMoveMax) ||
    careMoveMax < careMoveMin ||
    !Number.isInteger(memberMoveMin) ||
    memberMoveMin < 1 ||
    !Number.isInteger(memberMoveMax) ||
    memberMoveMax < memberMoveMin ||
    [
      careMoveChance,
      careNoticeChance,
      careLetterReach,
      careRelayReach,
      memberMoveChance,
      memberNoticeChance,
      memberDeathNotice,
      memberMissingChance,
      memberFoundChance,
      socialMissingChance,
      socialFoundChance,
      socialSearchBoost,
      socialRecontactChance
    ].some(value => !Number.isFinite(value) || value < 0 || value > 1)
  )
    W_.push("養育ネットワークの移動・情報到達設定値が不正");
  for (const care of services.SIM_TABLES.care) {
    if (
      !Number.isFinite(care.parentShare) ||
      care.parentShare < 0 ||
      care.parentShare > 1 ||
      !Number.isFinite(care.network) ||
      care.network < 0
    )
      W_.push(`養育形態「${care.n}」の家計負担値が不正`);
    if (
      care.network > 0 &&
      (!care.networkType ||
        !care.networkLabel ||
        !Array.isArray(care.networkRoles) ||
        !care.networkRoles.length)
    )
      W_.push(`養育形態「${care.n}」の支援ネットワーク定義が不足`);
    if (care.network === 0 && (care.networkType || care.networkRoles?.length))
      W_.push(`養育形態「${care.n}」に拠出のないネットワークが登録されている`);
  }
}
