// care-network: original rule order and preparation timing are preserved.
function appendCareNetworkTags(s, services, on) {
  const careNetwork = s.care?.supportNetwork;
  on(
    !!s.fl?.household_separated &&
      ["active", "distant"].includes(careNetwork?.contactState) &&
      Number.isFinite(careNetwork.contactReviewYear) &&
      careNetwork.contactReviewYear <= s.year,
    "養育ネットワークとの連絡時期"
  );
  on(
    !!s.fl?.household_separated &&
      careNetwork?.contactState === "ended" &&
      Number.isFinite(careNetwork.reconnectInviteYear) &&
      careNetwork.reconnectInviteYear <= s.year,
    "養育ネットワークから再接触の知らせ"
  );
  on(
    !!s.fl?.household_separated &&
      (careNetwork?.pendingMoveNotices || []).some(
        message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
      ),
    "養育ネットワークの転居を知る"
  );
  on(
    !!s.sp &&
      !s.sp.d &&
      Number.isInteger(s.sp.marriedYear) &&
      s.sp.marriedYear <= s.year &&
      !s.sn?.family_newlywed_residence,
    "新婚の住まい相談"
  );
  on(
    (s.residenceArrangement || "family_home_shared_budget").startsWith("family_home_") &&
      ([s.par?.fa, s.par?.mo].some(person => person && !person.d) ||
        services.helpers.siblingsOf(s).some(person => !person.d)),
    "同居家族あり"
  );
  on(
    !!s.fl?.household_separated &&
      (careNetwork?.members || []).some(person =>
        (person.pendingMoveNotices || []).some(
          message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
        )
      ),
    "養育者個人の転居を知る"
  );
  on(
    (careNetwork?.members || []).some(person =>
      (person.pendingDeathNotices || []).some(
        message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
      )
    ),
    "養育者個人の訃報を知る"
  );
  on(
    (careNetwork?.members || []).some(person =>
      (person.pendingMissingNotices || []).some(
        message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
      )
    ),
    "養育者個人の消息不明を知る"
  );
  on(
    (careNetwork?.members || []).some(person =>
      (person.pendingFoundNotices || []).some(
        message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
      )
    ),
    "消息不明だった養育者の安否を知る"
  );
  on(
    !!s.house?.parentLedger?.treatmentReviewDue &&
      [s.par?.fa, s.par?.mo].some(
        parent =>
          parent?.id === s.house.parentLedger.treatmentReviewDue.parentId &&
          !parent.d &&
          parent.inf &&
          parent.tx
      ),
    "親が療養費の判断を迫られている"
  );
  on(
    !!s.fl?.household_separated &&
      s.house?.parentLedger?.status === "tracked" &&
      [s.par?.fa, s.par?.mo].some(
        parent => parent && !parent.d && (parent.jobHistory?.length || 0) > (parent.knownJobChangeCount || 0)
      ),
    "親の仕事変更を知らせる"
  );
  on(
    !!s.fl?.household_separated &&
      s.house?.parentLedger?.status === "tracked" &&
      [s.par?.fa, s.par?.mo].some(parent => parent && !parent.d) &&
      (s.house.parentLedger.moveHistory?.length || 0) > (s.house.parentLedger.knownMoveCount || 0),
    "親世帯の転居知らせ"
  );
}
