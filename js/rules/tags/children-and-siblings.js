// children-and-siblings: original rule order and preparation timing are preserved.
function appendChildrenAndSiblingsTags(s, services, a, on) {
  const careAvailableSiblings = services.helpers.familyCareScheduleSiblingCandidates(s);
  on(careAvailableSiblings.length > 0, "連絡を保っている成人きょうだいがいる");
  on(
    services.helpers.familyCareCostShareSiblingCandidates(s).length > 0,
    "家計の余力を最近確認した別居きょうだいがいる"
  );
  on(
    [s.par?.fa, s.par?.mo].some(parent => parent && !parent.d && parent.inf && parent.tx),
    "親が感染症の治療中"
  );
  on(a < 18 && services.helpers.siblingCount(s) < 5 && (!s.par.fa.d || !s.par.mo.d), "きょうだいを増やせる");
  on(
    s.kids.some(k => services.helpers.childIsSupported(s, k)),
    "扶養中の子"
  );
  on(
    s.kids.some(k => services.helpers.childIsSupported(s, k) && k.inf),
    "扶養中の感染者"
  );
  on(
    s.kids.some(k => !k.d && s.year - k.by >= 18 && k.householdStatus === "independent"),
    "別居している成人した子"
  );
  on(
    s.kids.some(k => !k.d && k.remittanceAnnual > 0),
    "子への仕送り中"
  );
  on(
    s.kids.some(k => !k.d && Number.isFinite(k.returnOfferYear)),
    "子の帰宅相談中"
  );
  on(
    s.kids.some(k => !k.d && Number.isFinite(k.returnRequestYear)),
    "子から帰宅相談中"
  );
  on(
    s.kids.some(
      k =>
        !k.d && k.householdStatus === "independent" && (k.moveHistory?.length || 0) > (k.knownMoveCount || 0)
    ),
    "子の転居知らせあり"
  );
  on(
    s.kids.some(k => !k.d && s.year - k.by < 6),
    "幼い子あり"
  );
  on(
    s.kids.some(k => !k.d && s.year - k.by >= 18),
    "成人した子あり"
  );
  const targetChild = (s.kids || []).find(k => k.id === s.eventRelativeId && !k.d),
    hasTreatmentTarget = targetChild
      ? targetChild.inf && targetChild.tx && s.year - targetChild.by < 18
      : s.kids.some(k => !k.d && k.inf && k.tx && s.year - k.by < 18);
  on(hasTreatmentTarget, "対象の子が治療中");
  on(
    targetChild?.exposurePending &&
      targetChild.contactState !== "ended" &&
      targetChild.contactState !== "paused" &&
      Number.isFinite(targetChild.exposureReviewYear) &&
      targetChild.exposureReviewYear <= s.year,
    "対象の子に曝露後の再診予定"
  );
  on(targetChild?.householdStatus === "independent", "対象の子は別居中");
  on(Number.isFinite(targetChild?.returnOfferYear), "対象の子の帰宅相談中");
  on(Number.isFinite(targetChild?.returnRequestYear), "対象の子から帰宅相談中");
  on((targetChild?.remittanceAnnual || 0) > 0, "対象の子へ仕送り中");
  const childKnownRegion = targetChild?.knownRegion;
  on(childKnownRegion === s.res.n, "対象の子と同じ地域");
  const targetSibling = services.helpers.siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
  on(!!targetSibling?.independentSinceYear, "対象の別居きょうだい");
  on(
    targetSibling?.inf &&
      targetSibling.infKnown &&
      !targetSibling.independentSinceYear &&
      !Number.isFinite(targetSibling.infectionDiscussedYear),
    "対象の同居感染きょうだいと未相談"
  );
  on(
    targetSibling?.exposurePending &&
      Number.isFinite(targetSibling.exposureReviewYear) &&
      targetSibling.exposureReviewYear <= s.year,
    "対象きょうだいに再診予定"
  );
  on(
    targetSibling?.exposurePending && targetSibling.exposureEmployerResponse === "partial-cost",
    "対象きょうだいの仕事先が前回の検査費を一部負担"
  );
  on(
    targetSibling?.exposurePending && targetSibling.exposureEmployerResponse === "denied",
    "対象きょうだいの仕事先が曝露報告を退けた"
  );
  on(targetSibling?.contactState === "paused", "別居きょうだいとの連絡休止中");
  on(targetSibling?.contactState === "ended", "対象きょうだいとの連絡終了");
  on(
    Number.isFinite(targetSibling?.reconnectInviteYear) && targetSibling.reconnectInviteYear <= s.year,
    "対象きょうだいから再接触の便り"
  );
  on(
    services.helpers
      .siblingsOf(s)
      .some(
        x =>
          !x.d &&
          x.contactState === "ended" &&
          Number.isFinite(x.reconnectInviteYear) &&
          x.reconnectInviteYear <= s.year
      ),
    "きょうだいから再接触の便り"
  );
  on(
    targetSibling && (targetSibling.jobHistory?.length || 0) > (targetSibling.knownJobChangeCount || 0),
    "対象の別居きょうだいに仕事変更あり"
  );
  on(
    targetSibling && (targetSibling.moveHistory?.length || 0) > (targetSibling.knownMoveCount || 0),
    "対象の別居きょうだいに転居知らせあり"
  );
  on(
    targetSibling?.independentSinceYear && services.helpers.siblingInfectionKnownToPlayer(targetSibling),
    "対象の感染した別居きょうだい"
  );
  on(targetSibling?.careSupportAnnual > 0, "対象の別居きょうだい療養費支援中");
  on(
    services.helpers
      .siblingsOf(s)
      .some(x => x.independentSinceYear && !x.d && x.inf && x.careSupportAnnual > 0),
    "別居きょうだいの療養費支援中"
  );
  on(
    targetSibling &&
      Number.isFinite(targetSibling.healthNoticeYear) &&
      targetSibling.healthNoticeYear >
        (targetSibling.healthKnownYear || targetSibling.independentSinceYear || 0),
    "対象きょうだいの体調に注意"
  );
  on(
    targetSibling &&
      Number.isFinite(targetSibling.familyNoticeYear) &&
      targetSibling.familyNoticeYear >
        (targetSibling.knownFamilyYear || targetSibling.independentSinceYear || 0),
    "対象きょうだいに家族の変化あり"
  );
  const supportConference = s.siblingParentSupportConference,
    conferenceTarget = services.helpers
      .siblingsOf(s)
      .find(person => person.id === supportConference?.initiatorSiblingId && !person.d),
    conferenceParticipants = (supportConference?.participantIds || []).filter(id =>
      services.helpers.siblingsOf(s).some(person => person.id === id && !person.d)
    );
  on(s.house?.parentLedger?.status === "tracked", "親世帯の家計を追跡中");
  on(
    services.helpers.siblingsOf(s).some(person => !person.d && person.id !== targetSibling?.id),
    "ほかの存命きょうだいがいる"
  );
  on(!supportConference || supportConference.status !== "scheduled", "きょうだいの支援相談は未予約");
  on(
    supportConference?.status === "scheduled" &&
      supportConference.dueYear <= s.year &&
      conferenceTarget &&
      conferenceParticipants.length > 0 &&
      targetSibling?.id === conferenceTarget.id,
    "きょうだいの親世帯支援相談時期"
  );
  on(targetSibling?.knownParentSupportStatus === "active", "対象きょうだいは親世帯へ支援中");
  on(
    targetSibling &&
      targetSibling.parentSupportChangeCount > (targetSibling.knownParentSupportChangeCount || 0),
    "対象きょうだいの親世帯支援知らせ"
  );
  on(
    targetSibling &&
      Number.isFinite(targetSibling.financialNoticeYear) &&
      targetSibling.financialNoticeYear >
        (targetSibling.financialKnownYear || targetSibling.independentSinceYear || 0),
    "対象きょうだいの家計を案じる知らせ"
  );
  on(s.study && !s.study.suspended && s.study.nextDue <= s.year, "学費期");
  on(s.study && s.study.yearsPaid >= s.study.duration - 1, "修了年度");
}
