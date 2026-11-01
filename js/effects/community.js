function applyNeighbourAndWorkplaceEffects(e, s, resolvedId) {
  if (resolvedId === "wld_friend" && s.friendContact) {
    if (e.fl?.friend_unpaid === 1) {
      s.friendContact.status = "loan_outstanding";
      s.friendContact.loanAmount = Math.round(50000 * (s.priceIndex || 1));
      s.friendContact.loanYear = s.year;
    } else if (e.fl?.friend_cut_off === 1) s.friendContact.status = "severed";
    else s.friendContact.status = "acquaintance";
  }
  if (resolvedId === "wld_friend_repay" && s.friendContact) {
    if (e.fl?.friend_unpaid === 0)
      s.friendContact.status = e.fl?.friend_cut_off === 1 ? "severed" : "reconciled";
    if (s.friendContact.status !== "loan_outstanding") {
      s.friendContact.loanAmount = 0;
      s.friendContact.loanYear = null;
    }
  }
  if (resolvedId === "neighbor_move" && s.neighborContact && e.fl?.neighbor_contact === 1)
    s.neighborContact.status = "acquaintance";
  if (resolvedId === "neighbor_followup" && s.neighborContact && e.fl?.neighbor_familiar === 1)
    s.neighborContact.status = "familiar";
  if (resolvedId === "life_neighbor_mutual_aid" && s.neighborContact)
    s.neighborContact.lastMutualAidYear = s.year;
  if (e.w != null) s.w = WEALTH[clamp(s.w.i + e.w, 0, 4)];
  if (e.classAction) applyClassExperience(s, e.classAction);
  if (e.localityAction) applyLocalityAction(s, e.localityAction);
  if (e.facilityAction) applyFacilityAction(s, e.facilityAction);
  if (e.siteAction) applySiteAction(s, e.siteAction);
  if (e.workContractAction) applyWorkContractAction(s, e.workContractAction);
  if (e.infectionWorkplaceAction) applyInfectionWorkplaceAction(s, e.infectionWorkplaceAction, e);
  if (e.intergroupAction) recordIntergroupContact(s, e.intergroupAction);
  if (e.facilityPersonAction) applyFacilityPersonAction(s, e.facilityPersonAction);
  if (e.personTieAction) recordPersonTieAction(s, e.personTieAction);
  if (e.closeKnowledgeAction) {
    const person = closeInfoPerson(s, e.closeKnowledgeAction.kind);
    recordCloseKnowledgeAction(s, { ...e.closeKnowledgeAction, personId: person?.id });
  }
  if (e.infectionAwarenessAction) recordInfectionAwarenessAction(s, e.infectionAwarenessAction);
  if (e.infectionAwarenessActions) recordInfectionAwarenessActions(s, e.infectionAwarenessActions);
}

function applyInfectionWorkplaceAction(s, action, effect) {
  if (action.action === "disclose") {
    if (!s.inf || !s.fl?.dg || s.job <= 0 || s.infectionWorkplace)
      throw Error("診断を伝えられる勤務先の記録条件が不正");
    if (!["leave-approved-once", "unresolved"].includes(action.response))
      throw Error("勤務先の初回回答が不正");
    const contract = reconcileWorkContract(s);
    s.infectionWorkplace = {
      version: 1,
      status: "awaiting-review",
      disclosedYear: s.year,
      disclosedJobId: s.job,
      siteId: contract?.siteId || null,
      firstResponse: action.response,
      firstResponseYear: s.year,
      reviewDueYear: s.year + 1,
      reviewedYear: null,
      reviewOutcome: null,
      reviewJobId: null,
      reviewSiteId: null
    };
    recordInfectionAwareness(s, {
      subject: "protagonist",
      audience: "employer",
      certainty: "confirmed",
      source: "workplace-disclosure",
      consent: "voluntary",
      recipientRef: s.infectionWorkplace.siteId || `job:${s.job}`,
      sourceEventId: TRACE_RESOLUTION?.id || null
    });
    return;
  }
  if (action.action !== "review") throw Error("勤務先との鉱石病相談行動が不正");
  const record = s.infectionWorkplace;
  if (
    !record ||
    record.status !== "awaiting-review" ||
    !Number.isInteger(record.reviewDueYear) ||
    record.reviewDueYear > s.year
  )
    throw Error("再相談の時期ではない勤務先記録を更新できない");
  const outcomes = [
    "leave-approved-again",
    "leave-unresolved",
    "hours-approved",
    "hours-declined",
    "assignment-approved",
    "assignment-declined",
    "left-by-player"
  ];
  if (!outcomes.includes(action.outcome)) throw Error("勤務先の再相談結果が不正");
  if (action.outcome === "left-by-player" && (effect.job !== 0 || s.job !== 0))
    throw Error("本人が退職を選んだ記録と就労状態が一致しない");
  if (action.outcome === "hours-approved" && s.workContract?.hours !== "short")
    throw Error("勤務時間の変更承認と契約記録が一致しない");
  if (action.outcome === "hours-declined" && effect.workContractAction?.result !== "declined")
    throw Error("勤務時間の変更拒否が契約履歴に記録されていない");
  if (action.outcome === "assignment-approved" && s.workContract?.assignment !== "adjusted")
    throw Error("配置変更の承認と勤務契約の記録が一致しない");
  if (action.outcome === "assignment-declined" && effect.workContractAction?.result !== "declined")
    throw Error("配置変更の拒否が契約履歴に記録されていない");
  record.status = action.outcome === "left-by-player" ? "left-employment" : "reviewed";
  record.reviewedYear = s.year;
  record.reviewOutcome = action.outcome;
  record.reviewJobId = s.job;
  record.reviewSiteId = s.workContract?.siteId || null;
}

function reconcileSocialAndInformationEffects(e, s) {
  ensureLocalityState(s);
  reconcileWorkContract(s);
  recordEquityOutcome(s, e, TRACE_RESOLUTION?.id || null);
  recordSocialOutcome(s, e, TRACE_RESOLUTION?.id || null);
  if (e.informationResponseAction)
    recordInformationResponse(s, e.informationResponseAction, TRACE_RESOLUTION?.id || null);
  if (e.informationClaimAction)
    recordInformationClaimAction(s, e.informationClaimAction, TRACE_RESOLUTION?.id || null);
  if (e.informationClaimResponseAction)
    recordInformationClaimResponse(s, e.informationClaimResponseAction, TRACE_RESOLUTION?.id || null);
  if (e.informationClaimCorrectionResponseAction)
    recordInformationClaimCorrectionResponse(
      s,
      e.informationClaimCorrectionResponseAction,
      TRACE_RESOLUTION?.id || null
    );
  if (e.informationClaimLaterResponseAction)
    recordInformationClaimLaterResponse(
      s,
      e.informationClaimLaterResponseAction,
      TRACE_RESOLUTION?.id || null
    );
  reconcileEquity(s);
  refreshSocialClass(s, "選択による生活条件の変化");
}
