// relationships: original rule order and preparation timing are preserved.
function appendRelationshipsTags(s, services, a, on) {
  const formerParenting = services.helpers.formerSpouseParentingTarget(s);
  on(!!formerParenting, "離婚後の養育について話す時期");
  on(formerParenting?.parentingPlan === "coordinate", "離婚後に連絡を提案した");
  on(formerParenting?.parentingPlan === "mediated", "離婚後に仲介を頼んだ");
  on(formerParenting?.parentingPlan === "low_contact", "離婚後に直接連絡を控えた");
  const residenceTarget = services.helpers.childResidencePlanTarget(s);
  on(!!residenceTarget, "離婚後の子の生活先を相談");
  const residenceParent = residenceTarget
    ? (s.relationshipHistory || []).find(
        person => person.id === residenceTarget.otherParentId && person.ending === "離婚"
      )
    : null;
  on(
    !!residenceTarget && formerSpouseDeathKnown(residenceParent),
    "離婚後の子のもう一方の親の訃報を確認済み"
  );
  on(s.sp && !s.sp.d, "既婚");
  on(
    !!s.sp?.d &&
      s.sp.deathNoticePending &&
      Number.isFinite(s.sp.deathNoticeAvailableYear) &&
      s.sp.deathNoticeAvailableYear <= s.year,
    "配偶者の死の知らせ"
  );
  on(s.sp && !s.sp.d && !s.sp.householdArrangement, "配偶者の家計分担が未相談");
  on(a >= services.helpers.P("life.adultStartAge") && !s.sp, "独身");
  on(
    s.kids.some(k => !k.d),
    "子あり"
  );
  on(
    s.kids.some(k => k.d),
    "子と死別"
  );
  on(
    s.kids.some(k => !k.d),
    "存命の子"
  );
  on(
    s.sp &&
      !s.sp.d &&
      s.sp.disclosureBoundary === "separate_rooms" &&
      services.helpers.spouseLivesWithProtagonist(s) &&
      Number.isInteger(s.sp.disclosureReviewYear) &&
      s.sp.disclosureReviewYear <= s.year,
    "配偶者の関係を話し合う時期"
  );
  on(s.sp && !s.sp.d && s.sp.inf && !s.sp.infHidden, "感染した配偶者");
  on(s.sp && !s.sp.d && s.sp.inf && s.sp.infHidden, "感染を伏せた配偶者");
  on(s.sp && !s.sp.d && s.sp.inf && !!s.sp.tx, "配偶者の療養中");
  on(
    s.sp && !s.sp.d && s.sp.inf && !s.sp.tx && s.sp.careEverStarted === 1,
    "配偶者の療養を休止中"
  );
  on(
    s.sp && !s.sp.d && s.sp.inf && !s.sp.tx && s.sp.careEverStarted !== 1,
    "配偶者の療養未開始"
  );
  on(
    s.sp && !s.sp.d && s.sp.inf && !services.helpers.spouseLivesWithProtagonist(s),
    "別世帯の感染した配偶者"
  );
  on(
    s.sp &&
      !s.sp.d &&
      s.sp.inf &&
      !services.helpers.spouseLivesWithProtagonist(s) &&
      services.helpers.spouseInfectionHousingPressure(s) >=
        services.helpers.P("infection.socialPressureHighThreshold"),
    "配偶者の地域で住居圧力が強い"
  );
  on(s.sp && !s.sp.d && s.sp.r?.n === "サルカズ", "サルカズの配偶者");
  on(s.romance?.stage === "dating" || s.romance?.stage === "committed", "交際中");
  on(s.romance?.stage === "known", "親しい相手がいる");
  on(s.romance?.stage === "arranged", "婚姻の縁談");
  on(s.romance?.stage === "cohabiting", "同居する恋人");
  on(!!s.romance && s.year - (s.romance.metYear ?? s.year) >= 1, "知り合って一年以上");
  on(
    s.romance?.stage === "committed" &&
      s.year - (s.romance.stageSinceYear ?? s.romance.metYear ?? s.year) >= 1,
    "結婚意思確認後一年以上"
  );
  on(s.sp && !s.sp.d && s.sp.employmentStatus === "unemployed", "配偶者が失職中");
  on(s.sp && !s.sp.d && s.sp.unemploymentSupportPending, "配偶者の求職相談が必要");
  on(!!s.sp && !s.sp.d && s.sp.workPreferenceReviewPending, "配偶者と仕事の希望を話す時期");
  on(!!s.sp && !s.sp.d && s.sp.healthNoticePending, "配偶者の体調について話す時期");
  on(
    !!s.sp &&
      !s.sp.d &&
      s.sp.residenceMovePending &&
      !(s.sp.residenceMoveNotice && !Number.isInteger(s.sp.residenceMoveNotice.deliveredYear)),
    "配偶者の転居を相談する"
  );
  on(
    !!s.sp &&
      !s.sp.d &&
      s.sp.residenceMoveNotice &&
      Number.isInteger(s.sp.residenceMoveNotice.deliveredYear) &&
      s.sp.residenceMoveNotice.deliveredYear <= s.year,
    "別居配偶者の転居知らせ"
  );
  on(
    !!s.sp && !s.sp.d && !services.helpers.spouseLivesWithProtagonist(s) && s.sp.separateLifeReviewPending,
    "配偶者と別居生活を相談する時期"
  );
  on(
    s.sp &&
      !s.sp.d &&
      s.sp.householdArrangement &&
      Number.isFinite(s.sp.arrangementReviewYear) &&
      s.year >= s.sp.arrangementReviewYear,
    "配偶者の家計分担を再相談する時期"
  );
  on(
    s.sp &&
      !s.sp.d &&
      s.sp.personalFinance?.status === "modeled_balance" &&
      s.sp.personalFinance.condition === "strained",
    "配偶者の家計が逼迫"
  );
  on(
    s.sp &&
      !s.sp.d &&
      s.sp.personalFinance &&
      Number.isFinite(s.sp.personalFinance.reviewYear) &&
      s.sp.personalFinance.reviewYear <= s.year,
    "配偶者の家計相談時期"
  );
  on(
    s.friendContact?.lifeStatus === "alive" &&
      !!s.friendContact.region &&
      ["acquaintance", "reconciled"].includes(s.friendContact.status),
    "存命の友人"
  );
  on(
    s.neighborContact?.lifeStatus === "alive" &&
      !!s.neighborContact.region &&
      s.neighborContact.status === "familiar",
    "存命の顔なじみの隣人"
  );
  const pendingContactNotice = (person, key) =>
    !!person &&
    (person[key] || []).some(
      message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
    );
  on(pendingContactNotice(s.friendContact, "pendingMissingNotices"), "友人の消息不明を知る");
  on(pendingContactNotice(s.neighborContact, "pendingMissingNotices"), "隣人の消息不明を知る");
  on(pendingContactNotice(s.friendContact, "pendingFoundNotices"), "消息不明だった友人の安否を知る");
  on(pendingContactNotice(s.neighborContact, "pendingFoundNotices"), "消息不明だった隣人の安否を知る");
  on(pendingContactNotice(s.friendContact, "pendingRecontactNotices"), "消息不明だった友人から返事が届く");
  on(pendingContactNotice(s.neighborContact, "pendingRecontactNotices"), "消息不明だった隣人から返事が届く");
  on(
    s.pet && s.fl.pet_companion && Number.isFinite(s.petCareUntil) && s.year >= s.petCareUntil,
    "飼育動物との節目"
  );
}
