const CONTEXT_REVIEW_EVENTS = new Set(['life_debt_budget_review','life_work_project_setback','local_medical_capacity','v77_written_application',
  'people_clinic_followup','site_clinic_contact_change','site_clinic_different_conditions']);
// Bounded review records: compare living conditions, never the passage of a year alone.
function eventReviewSignature(e,s) {
  if(e.id==='life_debt_budget_review') {
    const debt=Math.max(0,(s.debt||0)-(s.cash||0)),capacity=Math.max(annualCashReserve(s),s.inc||0,1),ratio=debt/capacity;
    return JSON.stringify([s.res?.n,s.job,ratio<1?0:ratio<3?1:ratio<10?2:3,
      (s.loanContracts||[]).filter(c=>c.balance>0).map(c=>[c.id,c.status])]);
  }
  if(e.id==='life_work_project_setback')return JSON.stringify([s.res?.n,s.workContract?.siteId,s.job,
    s.workContract?.hours,personalWorkCapacity(s)]);
  const medical=e.id==='illness_followup' || e.id.startsWith('life_medical_');
  if(!medical && !CONTEXT_REVIEW_EVENTS.has(e.id))return null;
  const link=s.siteAffiliations?.clinic,
    clinic=link?.areaKey===s.community?.key ? s.community?.facilities?.[link.facilityId] : null;
  if(e.id==='v77_written_application')return JSON.stringify({region:s.res?.n,place:s.local?.placeId,
    job:s.job,work:s.workContract?.siteId,literate:(s.socialLearning?.literacy||0)>=48,
    knowledge:s.k>=24,contacts:s.rl>=26});
  return JSON.stringify({region:s.res?.n,place:s.local?.placeId,job:medical?s.job:null,
    clinic:clinic?.id,clinicStatus:clinic?.status,
    clinics:!medical?Object.values(s.community?.facilities||{}).filter(f=>f.kind==='clinic').map(f=>[f.id,f.status]):null,
    people:!medical?Object.values(s.community?.people||{}).filter(p=>p.facilityId===clinic?.id && p.metYear!=null)
      .map(p=>[p.id,p.knownStatus]):null,
    treatment:medical?!!s.fl?.tx:null,diagnosed:medical?!!s.fl?.dg:null,
    illness:medical?[s.illness?.kind,s.illness?.stage,!!s.illness?.treated]:null,
    episodes:medical?(s.mortality?.episodes||[]).filter(x=>x.status==='active').map(x=>[x.id,x.severity]):null,
    health:medical?Math.floor(s.h/20):null,
    budget:medical?moveFunds(s)>=annualCashReserve(s)+50000:null});
}
function recordEventReview(e,s,label) {
  const signature=eventReviewSignature(e,s);
  if(signature===null)return;
  s.eventReviews || (s.eventReviews={});
  s.eventReviews[e.id]={year:s.year,signature,choice:label};
}
function eventMatchesAffiliation(e,s) {
  const current=new Set((s.lifeRecord?.affiliations||[]).filter(a=>["active","crisis"].includes(a.status)).map(a=>a.id));
  return [e.fx,...(Array.isArray(e.c)?e.c:[]).flatMap(c=>c.o.map(o=>o[2]))].some(f=>
    f?.lifeAffiliation && current.has(f.lifeAffiliation.id) && !["contact","join","leave"].includes(f.lifeAffiliation.action));
}
function contextualDailyEvent(e,s,T) {
  if (e.id && e.id.startsWith("daily_rhodes_") && typeof e.show === "function") return true;
  const specific=condition=>typeof condition==='string' ? /^(国:|職:)/.test(condition) && ok(condition,s,T) :
    !!condition && typeof condition==='object' &&
    ['need','any'].some(key=>(condition[key]||[]).some(specific));
  if(eventMatchesAffiliation(e,s))return true;
  if(e.after && Number.isInteger(s.sn?.[e.after.id]))return true;
  if(specific(e))return true;
  if(Array.isArray(e.t)) {
    const selected=e.t.find(row=>row && typeof row==='object' && (row.when==null || ok(row.when,s,T)));
    return specific(selected?.when);
  }
  return false;
}
function siblingInfectionKnownToPlayer(sibling) {
  return !!(sibling?.inf && sibling.infKnown);
}
function hasActiveCraftKnowledgeGoal(life) {
  return life.goals.some(
    x => x.id === "craft-knowledge-sharing" && (x.status === "active" || x.status === "compromised")
  );
}
// Compatibility entry: may repair the supplied state, exactly as before.
function tags(s) {
  return collectEligibilityTags(s, TAG_RULE_SERVICES);
}
function collectEligibilityTags(s, services) {
  const a = s.age,
    el = services.helpers.eduLv(s),
    sc = !services.helpers.restricted(s) &&
      ((s.fl.sch && a < services.helpers.P("life.schoolEnrollmentEndAge")) ||
       (typeof educationFullTime === "function" && educationFullTime(s))),
    isLandship = isRhodesLandshipResident(s);
  const T = new Set([
    services.catalog.STG[services.helpers.stg(s)],
    isLandship ? "国:ロドス本艦" : "国:" + s.res.n,
    "出身:" + s.g.n,
    "種族:" + s.r.n,
    "気質:" + s.t.n,
    "性別:" + s.sx,
    "職:" + services.catalog.J[s.job].n,
    "方針:" + services.catalog.FC[s.f],
    s.home
  ]);
  const on = (c, x) => {
    if (c) T.add(x);
  };
  appendLocalityTags(s, services, T);
  appendLifeAndCareersTags(s, services, T, on);
  appendCareNetworkTags(s, services, on);
  appendClassAndEducationTags(s, services, a, el, sc, on);
  appendRelationshipsTags(s, services, a, on);
  appendChildrenAndSiblingsTags(s, services, a, on);
  appendHouseholdAndParentsTags(s, services, on);
  appendHealthAndEconomyTags(s, services, on);
  appendIdentityAndSocialTags(s, services, on);
  appendEnvironmentAndWellbeingTags(s, services, T, on);
  appendFlagsAndWorldTags(s, services, T);
  return T;
}
const wt = (e, s, T) => {
  const w = e.w == null ? 1 : e.w,
    base = typeof w == "number" ? w : w.slice(1).reduce((a, m) => (ok(m.when, s, T) ? a * m.x : a), w[0]),
    previousYear = e.after && s.sn?.[e.after.id];
  // An eligible consequence gains weight gradually until its first occurrence;
  // it still competes with other choices and never overrides its own conditions.
  if (e.c && e.after && s.sn?.[e.id] == null && Number.isFinite(previousYear)) {
    const overdue = Math.max(0, s.year - previousYear - (e.after.min || 0));
    return base * (1 + Math.min(2, overdue / 3)) * (eventMatchesAffiliation(e,s)?1.6:1);
  }
  return base * (eventMatchesAffiliation(e,s)?1.6:1);
};
const wpk = (a, s, T) => {
  if (!a.length) return null;
  let t = a.reduce((x, e) => x + wt(e, s, T), 0) * R();
  for (const e of a) if ((t -= wt(e, s, T)) < 0) return e;
  return a[a.length - 1];
};
const tpl = (t, s) => {
  const caregiver = caregiverWords(s.care),
    livingKids = s.kids.filter(k => !k.d),
    dependents = livingKids.filter(k => childIsSupported(s, k)),
    youngest = dependents[dependents.length - 1],
    eventChild = s.kids.find(k => k.id === s.eventRelativeId),
    infected = eventChild?.inf ? eventChild : [...dependents].reverse().find(k => k.inf),
    grown =
      eventChild && s.year - eventChild.by >= 18
        ? eventChild
        : [...livingKids].reverse().find(k => s.year - k.by >= 18),
    deadChild = [...s.kids].filter(k => k.d).sort((a, b) => b.d - a.d)[0];
  const dailyFamily = familyDailyTargetById(s),
    sibling =
      siblingsOf(s).find(x => x.id === s.eventRelativeId) ||
      siblingsOf(s).find(x => !x.d) ||
      siblingsOf(s)[0],
    pendingSiblingJob = sibling && (sibling.jobHistory?.length || 0) > (sibling.knownJobChangeCount || 0),
    pendingSiblingMove = sibling && (sibling.moveHistory?.length || 0) > (sibling.knownMoveCount || 0);
  const pendingChildMove = grown && (grown.moveHistory?.length || 0) > (grown.knownMoveCount || 0),
    delayYears = s.eventRelativeDelayYears || 0,
    contact =
      s.friendContact?.id === s.eventRelativeId
        ? s.friendContact
        : s.neighborContact?.id === s.eventRelativeId
          ? s.neighborContact
          : null,
    contactNotice =
      contact?.pendingMissingNotices?.find(
        message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
      ) ||
      contact?.pendingFoundNotices?.find(
        message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
      ),
    words = {
      sp: s.sp ? s.sp.nm : "",
      formerSpouse:
        (s.relationshipHistory || []).find(person => person.id === s.eventRelativeId)?.nm ||
        formerSpouseParentingTarget(s)?.nm ||
        "以前の配偶者",
      romancePartner: s.romance?.name || "相手",
      friendName: s.friendContact?.nm || "友人",
      neighborName: s.neighborContact?.nm || "隣人",
      contactName: contact?.nm || "知人",
      contactReplyYear:
        contact?.pendingRecontactNotices?.find(
          message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
        )?.replyYear || "不明な年",
      contactDeathTiming: delayYears === 0 ? "最近" : delayYears === 1 ? "昨年" : `${delayYears}年前`,
      contactMissingYear: contactNotice?.missingSinceYear || contact?.knownMissingSinceYear || "不明な年",
      contactMissingRegion:
        contactNotice?.lastKnownRegion || contact?.knownMissingLastRegion || "最後に確認された地域",
      contactFoundYear: contactNotice?.foundYear || "不明な年",
      contactNoticeChannel:
        {
          face_to_face: "地域の人から",
          family_letter_or_travelling_relative: "便りや移動する親族から",
          kin_or_community_relay: "親族・共同体の伝言で"
        }[contactNotice?.channel] || "知らせの経路は不明",
      nm: s.nm,
      rg: s.res.n,
      rc: s.r.n,
      kid: (eventChild || livingKids.at(-1) || deadChild)?.nm || "",
      careKid: youngest?.nm || "",
      grownKid: grown?.nm || "",
      grownKidRegion: pendingChildMove ? grown.region : grown?.knownRegion || "居場所はまだ聞けていない",
      grownKidWork: pendingChildMove
        ? J[grown.jobId]?.n || "新しい仕事"
        : Number.isInteger(grown?.knownJobId)
          ? J[grown.knownJobId]?.n || "仕事"
          : "仕事の詳しい話はまだ聞けていない",
      grownKidVisitFare:
        adultChildVisitRoute(s, grown)?.fare != null
          ? m(adultChildVisitRoute(s, grown).fare)
          : "移動費未確認",
      grownKidReturnRoomCost: m(adultChildReturnRoomSetupCost(s)),
      infectedKid: infected?.nm || "",
      deceasedKid: (eventChild || deadChild)?.nm || "子ども",
      childDeathTiming: delayYears === 0 ? "最近" : delayYears === 1 ? "昨年" : `${delayYears}年前`,
      sibling: sibling?.nm || "きょうだい",
      workplace: siblingOccupationLabel(sibling, pendingSiblingJob),
      siblings: sibling?.nm,
      siblingWork: siblingOccupationLabel(sibling, pendingSiblingJob),
      siblingRegion: pendingSiblingMove ? sibling.region : sibling?.knownRegion || "居住地は未確認",
      siblingVisitFare:
        siblingVisitRoute(s, sibling)?.fare != null ? m(siblingVisitRoute(s, sibling).fare) : "移動費未確認",
      siblingCareSupportAmount: m(siblingCareSupportQuote(s, sibling)),
      siblingHealthAidAmount: m(siblingHealthAidCost(s)),
      siblingDeathTiming: delayYears === 0 ? "最近" : delayYears === 1 ? "昨年" : `${delayYears}年前`,
      dailyFamilyName: dailyFamily?.person?.nm || "",
      dailyFamilyRelation:
        { sibling: "きょうだい", child: "子ども", spouse: "配偶者", parent: "親" }[dailyFamily?.kind] ||
        "家の人",
      spouseRegion: spouseKnownResidenceRegion(s).n,
      spouseMovedRegion: spouseKnownResidenceRegion(s).n,
      spouseHealthConsultCost: m(spouseHealthConsultCost(s)),
      spouseInitialTreatmentCost: m(spouseInitialTreatmentCost(s)),
      spouseVisitFare: spouseVisitRoute(s)?.fare != null ? m(spouseVisitRoute(s).fare) : "移動費未確認",
      spouseSharedHousingCost: m(spouseHousingAnnualCost(s, "shared")),
      spouseHousingStandardCost: m(spouseHousingAnnualCost(s, "standard")),
      spouseHousingPrivateCost: m(spouseHousingAnnualCost(s, "private")),
      spouseHousingSetupCost: m(
        P("economy.spouseHousingChangeCost") * spouseResidenceRegion(s).pm * (s.priceIndex || 1)
      ),
      spouseDeathTiming: delayYears === 0 ? "最近" : delayYears === 1 ? "昨年" : `${delayYears}年前`,
      deceasedParent:
        s.par?.fa?.id === s.eventRelativeId
          ? s.par.fa.nm
          : s.par?.mo?.id === s.eventRelativeId
            ? s.par.mo.nm
            : "親",
      parentDeathTiming: delayYears === 0 ? "最近" : delayYears === 1 ? "昨年" : `${delayYears}年前`,
      caregiver: caregiver.who,
      caregiverArms: caregiver.arms,
      careNetwork: s.care?.supportNetwork?.label || "養育に関わった人たち"
    };
  const formerMoveNotice = formerSpouseMoveNoticeTarget(s)?.residenceMoveNotice;
  words.formerSpouseMovedRegion = formerMoveNotice?.to || "新しい地域";
  const formerMovePerson = formerSpouseMoveNoticeTarget(s),
    formerMoveChild = (s.kids || []).find(child => !child.d && child.otherParentId === formerMovePerson?.id);
  words.formerSpouseChildResidenceContext =
    formerMoveChild?.householdResidencePlan === "self"
      ? "子どもは今の家で暮らし続けている。"
      : formerMoveChild?.householdResidencePlan === "shared"
        ? "子どもは二つの家を行き来している。"
        : formerMoveChild?.householdResidencePlan === "former" ||
            formerMoveChild?.householdResidencePlan === "former_support"
          ? "便りには、子どもも今はその地域で暮らしているとあった。"
          : "子どもの生活先はまだ確かめられていない。";
  words.formerSpouseMoveDelay =
    formerMoveNotice?.delayYears === 0 ? "その年" : `${formerMoveNotice?.delayYears || 1}年後`;
  words.formerSpouseMoveChannel =
    {
      face_to_face: "同じ地域の人づてに",
      family_letter_or_travelling_relative: "便りで",
      kin_or_community_relay: "親族や仲介者から"
    }[formerMoveNotice?.channel] || "経路が分からないまま";
  words.formerSpouseReplyRoute =
    {
      coordinate: "これまでの連絡方法で",
      mediated: "仲介役を通じて",
      low_contact: "必要な連絡だけを記す便りで"
    }[(formerMovePerson || {}).parentingPlan] || "安全な連絡方法が分かってから";
  const careNotice = s.care?.supportNetwork?.pendingMoveNotices?.find(
    message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
  );
  words.careNetworkMoveFrom = careNotice?.from || "以前の地域";
  words.careNetworkMoveTo = careNotice?.to || s.care?.supportNetwork?.knownRegion || "新しい地域";
  words.careNetworkMoveChannel =
    {
      face_to_face: "知らせは顔を合わせた時に聞いた",
      family_letter_or_travelling_relative: "知らせは親族の便りか、移動する親族の口伝えで届いた",
      kin_or_community_relay: "知らせは親族や共同体の伝言で届いた"
    }[careNotice?.channel] || "知らせがどう届いたのかは分からなかった";
  const siblingFamilyChanges = (sibling?.familyHousehold?.history || []).filter(
    row => row.year > (sibling.knownFamilyYear || sibling.independentSinceYear || 0)
  );
  words.siblingFamilyNews =
    siblingFamilyChanges
      .map(row =>
        row.type === "partner_died"
          ? `${row.personName || "同居相手"}が${row.deathYear}年に亡くなったと聞いた。${row.cause || "詳しい死因は伝わっていない"}という。`
          : row.type === "child_died"
            ? `${row.personName || "子"}が${row.deathYear}年に亡くなったと聞いた。${row.cause || "詳しい死因は伝わっていない"}という。`
            : row.type === "partner_formed"
              ? `${row.personName || "相手"}と新しい暮らしを始めたと聞いた。`
              : row.type === "child_joined_household"
                ? `${row.personName || "子"}を家族として迎えたと聞いた。`
                : ""
      )
      .filter(Boolean)
      .join(" ") || "家族の近況を聞いた。";
  words.siblingDeathCause = sibling?.deathCause || "死因の詳細は未確認";
  words.siblingBereavementTravelCost = m(2e4 * s.res.pm * (s.priceIndex || 1));
  words.siblingBereavementSupportAmount = m(5e4 * s.res.pm * (s.priceIndex || 1));
  words.siblingCareAnnualCost = m(
    P("economy.childInfectionCareAnnualCost") *
      s.res.pm *
      (1 + infectionSocialPressure(s).medical * 0.3) *
      infectionCareTravelCostScale(s) *
      (s.priceIndex || 1)
  );
  words.spouseFromRegion = s.sp?.residenceMovePending?.from || s.res.n;
  words.spouseToRegion = s.sp?.residenceMovePending?.to || s.res.n;
  words.spouseRejoinFare = m(spouseRejoinRoute(s)?.fare || 0);
  words.spouseRejoinContext =
    spouseRejoinRoute(s)?.kind === "local" ? "同じ地域で世帯を一つにする" : "相手自身がこちらへ移る";
  words.spouseWorkPreferenceContext = ["rejoin", "independent_move"].includes(s.sp?.workPreferenceReviewCause)
    ? "住まいが変わった今"
    : "仕事の節目を迎えた今";
  words.deferredMedicalCost = m(6e4 * s.res.md * (s.priceIndex || 1));
  words.hospitalMedicalCost = m(6e4 * s.res.md * (s.priceIndex || 1));
  words.clinicMedicalCost = m(18e3 * s.res.md * (s.priceIndex || 1));
  words.specialistMedicalCost = m(12e4 * s.res.md * (s.priceIndex || 1));
  words.siblingExposureTestCost = m(3e4 * s.res.pm * (s.priceIndex || 1));
  words.siblingExposureWoundCareCost = m(1e4 * s.res.pm * (s.priceIndex || 1));
  words.siblingExposureReportReserve = m(2e4 * s.res.pm * (s.priceIndex || 1));
  words.siblingExposureRetestCost = m(2e4 * s.res.pm * (s.priceIndex || 1));
  words.childInfectionInitialSupportCost = m(childInfectionInitialSupportCost(s));
  words.childInfectionSpecialistStartCost = m(childInfectionSpecialistStartCost(s));
  words.childInfectionTreatmentRestartCost = m(childInfectionTreatmentRestartCost(s));
  words.childCareAnnualCost = m(childInfectionAnnualTreatmentCost(s));
  words.childBasicCareAnnualCost = m(childInfectionAnnualCareCost(s));
  words.childCareSupportStatus =
    eventChild?.tx === 1
      ? `家族が専門診療を支援中（年額目安 ${words.childCareAnnualCost}）`
      : eventChild?.careSupport === 1
        ? `家族が基本支援を継続中（年額目安 ${words.childBasicCareAnnualCost}）`
        : eventChild?.careSupport === 0
          ? "家計による継続支援は未開始"
          : "旧記録のため支援状態は不明";
  words.taxNoticeAmount = m(1e5 * s.res.pm * (s.priceIndex || 1));
  words.taxArrearsAmount = m(3e5 * s.res.pm * (s.priceIndex || 1));
  words.overtimePay = m(12e4 * s.res.pm * (s.priceIndex || 1));
  words.nightStudyCost = m(8e4 * s.res.pm * (s.priceIndex || 1));
  words.grownKidBudgetNote = adultChildBudgetNote(s, eventChild || grown);
  words.adultChildEmergencyAidAmount = m(adultChildEmergencyAidCost(s));
  const selectedCareMember = s.care?.supportNetwork?.members?.find(
      person => person.id === s.eventCareNetworkMemberId
    ),
    memberNotice = selectedCareMember?.pendingMoveNotices?.find(
      message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
    ),
    memberDeathNotice = selectedCareMember?.pendingDeathNotices?.find(
      message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
    ),
    memberMissingNotice = selectedCareMember?.pendingMissingNotices?.find(
      message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
    ),
    memberFoundNotice = selectedCareMember?.pendingFoundNotices?.find(
      message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
    );
  words.careMemberName = selectedCareMember?.nm || "養育者";
  words.careMemberMoveFrom = memberNotice?.from || selectedCareMember?.knownRegion || "以前の地域";
  words.careMemberMoveTo = memberNotice?.to || "新しい地域";
  words.careMemberMoveChannel =
    {
      face_to_face: "同じ地域でのやり取り",
      family_letter_or_travelling_relative: "便りや移動する親族",
      kin_or_community_relay: "親族・共同体の伝言"
    }[memberNotice?.channel] || "知らせの経路は不明";
  words.careMemberDeathYear = memberDeathNotice?.deathYear || "不明な年";
  words.careMemberDeathCause = memberDeathNotice?.cause || "不明";
  words.careMemberDeathChannel =
    {
      face_to_face: "その場で",
      family_letter_or_travelling_relative: "便りや移動する親族から",
      kin_or_community_relay: "親族や共同体の伝言で"
    }[memberDeathNotice?.channel] || "遅れて";
  words.careMemberMissingYear = memberMissingNotice?.missingSinceYear || "不明な年";
  words.careMemberMissingRegion = memberMissingNotice?.lastKnownRegion || "最後に確認された地域";
  words.careMemberMissingChannel =
    {
      face_to_face: "近所の人から",
      family_letter_or_travelling_relative: "便りや移動する親族から",
      kin_or_community_relay: "親族や共同体の伝言で"
    }[memberMissingNotice?.channel] || "経路の分からない伝言で";
  words.careMemberFoundYear = memberFoundNotice?.foundYear || "不明な年";
  words.careMemberFoundChannel =
    {
      face_to_face: "近所の人から",
      family_letter_or_travelling_relative: "便りや移動する親族から",
      kin_or_community_relay: "親族や共同体の伝言で"
    }[memberFoundNotice?.channel] || "経路の分からない伝言で";
  const selectedParent = [s.par?.fa, s.par?.mo].find(x => x?.id === s.eventRelativeId),
    selectedCareSibling = siblingsOf(s).find(x => x?.id === s.eventCareSiblingId),
    parentLedger = s.house?.parentLedger,
    latestParentMove = parentLedger?.moveHistory?.at(-1);
  words.parentName = selectedParent?.nm || "親";
  words.careSiblingName = selectedCareSibling?.nm || "きょうだい";
  words.parentTreatmentNote =
    selectedParent?.inf && selectedParent?.tx
      ? `治療が続いている。付き添いとは別に療養費もかかり、主に負担する場合は年額${m(parentTreatmentCostForPlan(s, selectedParent, "direct"))}ほどになる。`
      : "";
  words.parentCareCostAction =
    selectedParent?.inf && selectedParent?.tx ? "親の療養費も自分の家計から分担した。" : "";
  words.parentCareWorkAction =
    s.job > 0 && !restricted(s) && !s.fl.retired ? "勤務を調整し" : "日々の予定を組み替えて時間を確保し";
  const latestParentJobChange = selectedParent?.jobHistory?.at(-1);
  words.parentWork = J[selectedParent?.j || 0]?.n || "仕事";
  words.parentOldWork = J[latestParentJobChange?.fromJobId]?.n || "以前の仕事";
  words.parentHouseholdFrom = latestParentMove?.from || parentLedger?.knownRegion || "以前の地域";
  words.parentHouseholdTo = latestParentMove?.to || parentLedger?.region || "新しい地域";
  const selectedSibling = siblingsOf(s).find(x => x?.id === s.eventRelativeId);
  words.siblingParentSupportAmount = m(selectedSibling?.parentSupportPaidAmount || 0);
  words.siblingParentSupportStatus =
    selectedSibling?.parentSupportStatus === "active" ? "始めた" : "終えた";
  const giftLedger = s.house?.parentLedger;
  words.parentHouseholdGiftAmount = m(
    25000 *
      (giftLedger?.status === "tracked"
        ? (giftLedger.res?.pm || s.res.pm) * (giftLedger.priceIndex || s.priceIndex || 1)
        : s.res.pm * (s.priceIndex || 1))
  );
  words.colTechApplicationCost = m(5e4 * s.res.pm * (s.priceIndex || 1));
  words.vicClerkApplicationCost = m(3e4 * s.res.pm * (s.priceIndex || 1));
  words.divorceChildSupportAnnualCost = m(
    divorceChildSupportAnnualCost(s, eventChild || childResidencePlanTarget(s))
  );
  words.lungmenGuardApplicationCost = m(3e4 * s.res.pm * (s.priceIndex || 1));
  words.romanceCeremonyCost = m(romanceCeremonyCost(s));
  words.spouseFinanceAidAmount = m(spouseFinanceAidCost(s));
  words.childFeverVisitCost = m(childFeverVisitCost(s));
  words.illnessReviewCost = m(2e4 * s.res.md * (s.priceIndex || 1));
  words.rimSupplyKitCost = m(P("economy.rimSupplyKitCost") * s.res.pm * (s.priceIndex || 1));
  words.investmentProjectName = investmentProjectName(s);
  words.investmentCurrentValue = m(s.investment || 0);
  words.newHouseholdSetupCost = newHouseholdSetupCost(s);
  words.newHouseholdKinSetupCost = newHouseholdKinSetupCost(s);
  words.hobbyExamples = hobbyExamples(s);
  words.hobbyMusicStartCost = m(hobbyMusicStartCost(s));
  words.hobbyCraftStartCost = m(hobbyCraftStartCost(s));
  words.hobbyGardenStartCost = m(hobbyGardenStartCost(s));
  words.hobbyAnnualCost = m(hobbyAnnualCost(s));
  words.hobbyAnnualCostReduced = m(hobbyCostForKey(s, s.eventHobbyKey, "reduced"));
  words.hobbyAnnualCostShared = m(hobbyCostForKey(s, s.eventHobbyKey, "shared"));
  words.adultChildContactCost = m(adultChildContactCost(s));
  words.leithArtsPreparationCost = m(leithArtsPreparationCost(s));
  words.leithMusicEveningCost = m(leithMusicEveningCost(s));
  words.illnessFollowupCost = m(4e4 * s.res.md * (s.priceIndex || 1));
  words.rimWorkmateName =
    (s.lifeRecord?.workRelationships || []).find(
      row => row.id === "rim-craft-mentorship" && row.consent === true
    )?.person?.nm || "以前に一緒に働いた人";
  const sanitizeWord = val =>
    typeof esc === "function"
      ? esc(val ?? "")
      : String(val ?? "").replace(
          /[&<>"']/g,
          c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
        );
  return t.replace(/\{(\w+)\}/g, (_, k) => (words[k] != null ? sanitizeWord(words[k]) : ""));
};
function textVariant(key, values, s, eventKey = key) {
  s.textDeck || (s.textDeck = {});
  s.textLast || (s.textLast = {});
  s.textRecent || (s.textRecent = {});
  let deck = s.textDeck[key];
  deck = Array.isArray(deck) ? deck.filter(i => Number.isInteger(i) && i >= 0 && i < values.length) : [];
  if (!deck.length) {
    deck = Array.from({ length: values.length }, (_, i) => i);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(R() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    if (deck.length > 1 && deck[0] === s.textLast[key]) {
      const j = deck.findIndex(x => x !== deck[0]);
      [deck[0], deck[j]] = [deck[j], deck[0]];
    }
  }
  let i = deck.shift(),
    recent = s.textRecent[eventKey] || [];
  if (recent.includes(values[i])) {
    const alt = deck.findIndex(x => !recent.includes(values[x]));
    if (alt >= 0) {
      const [replacement] = deck.splice(alt, 1);
      deck.push(i);
      i = replacement;
    } else {
      const candidates = values.map((_, n) => n).filter(n => n !== i && !recent.includes(values[n]));
      if (candidates.length) {
        i = candidates[Math.floor(R() * candidates.length)];
      }
    }
  }
  s.textDeck[key] = deck;
  s.textLast[key] = i;
  s.textRecent[eventKey] = [...recent, values[i]].slice(-4);
  return values[i];
}
const eventTextValue = (value, s, T) => (typeof value === "function" ? value(s, T) : value);
const txt = (e, s, T) => {
  let t = eventTextValue(e.t, s, T);
  if (Array.isArray(t)) {
    if (t.every(v => typeof v === "string")) t = textVariant(e.id, t, s, e.id);
    else {
      const f = t.find(v => v && typeof v === "object" && (v.when == null || ok(v.when, s, T)));
      if (f && f.t !== undefined) t = eventTextValue(f.t, s, T);
      else {
        const fallback = t.filter(v => typeof v === "string");
        t = fallback.length ? textVariant(e.id + ":fallback", fallback, s, e.id) : "";
      }
      if (Array.isArray(t) && t.every(v => typeof v === "string"))
        t = textVariant(e.id + ":" + e.t.indexOf(f), t, s, e.id);
    }
  }
  if(e.id==='family_child_future') {
    const child=s.kids.find(x=>x.id===s.eventRelativeId),last=child?.futurePlanSupportHistory?.at(-1),
      action={'study-funds':'学費の足しを渡した','work-introduction':'見習い先への紹介を頼んだ',
        'household-open':'家に残る場合の支えを伝えた','move-funds':'支度金を渡した','revisit':'結論を急がず話し直すと決めた'}[last?.kind];
    if(action)t=`前回は${action}。{kid}の今の学校・仕事・住まいを確かめ、支え方を見直した。`;
  }
  if(CONTEXT_REVIEW_EVENTS.has(e.id) && s.eventReviews?.[e.id])
    t=`前回は「${s.eventReviews[e.id].choice}」と決めた。その後の状況を踏まえて、改めて考えた。${t}`;
  return tpl(t, s);
};
function rejectEligibility(e, reason, options) {
  if (options.onReject) options.onReject(e, reason);
  return false;
}
function elig(e, s, T, options = {}) {
  if (e.groundOnly && isRhodesLandshipResident(s)) return rejectEligibility(e, "ground-location", options);
  if (e.id?.startsWith("daily_rhodes_") && !isRhodesLandshipResident(s)) return rejectEligibility(e, "landship-location", options);
  if (!affiliationEventAvailable(e, s)) return rejectEligibility(e, "affiliation-place", options);
  const l = s.sn[e.id] ?? (e.id === "displacement_after" ? s.sn.disaster_after : undefined),
    a = e.after,
    ignoreOccurrence = options.ignoreOccurrence === true,
    cd = e.cd != null ? e.cd : e.c ? Infinity : 8;
  if (!ignoreOccurrence && e.once && l != null) return rejectEligibility(e, "once", options);
  if (e.st && !e.st.includes(STG[stg(s)])) return rejectEligibility(e, "stage", options);
  if (e.months && !e.months.includes(s.mo)) return rejectEligibility(e, "month", options);
  // Katorga is a particular sealed location with a scripted release. The
  // generic detention appeal/escape route cannot liberate this special case,
  // and ordinary jobs/social scenes cannot occur while trapped inside.
  if (s.fl?.ursus_katorga_detained &&
      !["life_ursus_katorga_life", "life_ursus_student_assembly_release"].includes(e.id))
    return rejectEligibility(e, "katorga-route", options);
  if (restricted(s) && !e.inConfinement && !e.need?.some(t => t === "収容中" || t === "隔離中")) return rejectEligibility(e, "confinement", options);
  if (!ok(e, s, T)) return rejectEligibility(e, "event-condition", options);
  if (!ok(e.show, s, T)) return rejectEligibility(e, "event-show-condition", options);
  const review=s.eventReviews?.[e.id];
  if(!ignoreOccurrence && review && review.signature===eventReviewSignature(e,s) &&
     (CONTEXT_REVIEW_EVENTS.has(e.id) || s.year-review.year<5))
    return rejectEligibility(e,'unchanged-review',options);
  if (
    [
      "family_sibling_independence",
      "family_sibling_contact",
      "family_sibling_reconnect",
      "family_sibling_infection"
    ].includes(e.id) &&
    !siblingForEvent(s, e.id)
  )
    return rejectEligibility(e, "missing-relative-target", options);
  if (e.id === "family_child_future" && !childForEvent(s, e.id)) return rejectEligibility(e, "missing-child-target", options);
  if (e.id === "family_child_exposure_followup" && !childForEvent(s, e.id)) return rejectEligibility(e, "missing-child-target", options);
  if (e.id === "fam_care" && s.familyCare) return rejectEligibility(e, "care-already-active", options);
  if (e.id === "adult_child_contact" && !childForEvent(s, e.id)) return rejectEligibility(e, "missing-child-target", options);
  if (e.c && !e.c.some(c => ok(c.show, s, T) && ok(c.en, s, T))) return rejectEligibility(e, "no-actionable-choice", options);
  if (!ignoreOccurrence && l != null && s.year - l < cd) return rejectEligibility(e, "cooldown", options);
  if (a) {
    const x = s.sn[a.id];
    if (x == null || s.year - x < (a.min || 0) || (a.max != null && s.year - x > a.max)) return rejectEligibility(e, "after-dependency", options);
    if (a.choice != null || a.outcome != null || a.subject === "romance") {
      const result = s.eventOutcomes?.[a.id];
      if (!result || result.year !== x ||
          (a.choice != null && result.choiceIndex !== a.choice) ||
          (a.outcome != null && result.outcomeIndex !== a.outcome) ||
          (a.subject === "romance" &&
            (!s.romance?.id || result.romanceId !== s.romance.id)))
        return rejectEligibility(e, "after-outcome", options);
    }
  }
  if (e.excl && e.excl.some(i => s.sn[i] != null)) return rejectEligibility(e, "excluded-by-event", options);
  return true;
}
