function spouseEmploymentStatus(spouse) {
  return spouse?.employmentStatus === "unemployed"
    ? "unemployed"
    : Number.isInteger(spouse?.j) && J[spouse.j]
      ? "employed"
      : "unrecorded";
}
function spouseHealthWorkCapacity(spouse, year = spouse?.healthUpdatedYear || 0) {
  if (!Number.isFinite(spouse?.health)) return 1;
  const threshold = P("family.spouseHealthWorkThreshold"),
    floor = P("family.spouseHealthWorkFloor"),
    health = Math.max(0, Math.min(100, spouse.health)),
    capacity = health >= threshold ? 1 : floor + (1 - floor) * (health / threshold),
    temporaryReduction =
      Number.isFinite(spouse.reducedWorkUntilYear) && year <= spouse.reducedWorkUntilYear ? 0.85 : 1;
  return capacity * temporaryReduction;
}
function initializeSpouseHealth(s, spouse = s.sp, basis = "new-marriage") {
  if (!spouse) return null;
  if (!Number.isFinite(spouse.health)) {
    spouse.health = rnd(P("family.spouseHealthInitialMin"), P("family.spouseHealthInitialMax"));
    spouse.healthBasis = basis;
    spouse.healthUpdatedYear = s.year;
    spouse.healthHistory = [];
  }
  if (!Number.isFinite(spouse.healthUpdatedYear)) spouse.healthUpdatedYear = s.year;
  if (!spouse.healthBasis) spouse.healthBasis = basis;
  spouse.healthHistory = Array.isArray(spouse.healthHistory) ? spouse.healthHistory : [];
  spouse.healthPlan = spouse.healthPlan || "unreviewed";
  if (!Number.isFinite(spouse.healthNextReviewYear))
    spouse.healthNextReviewYear =
      s.year + rnd(P("family.spouseHealthReviewMinYears"), P("family.spouseHealthReviewMaxYears"));
  spouse.healthReviewHistory = Array.isArray(spouse.healthReviewHistory) ? spouse.healthReviewHistory : [];
  return spouse;
}
function repairSpouseHealth(s) {
  const spouse = s?.sp;
  if (!spouse || spouse.d) return s;
  if (!Number.isFinite(spouse.health)) {
    spouse.health = P("family.spouseHealthLegacyBaseline");
    spouse.healthBasis = "legacy-current-baseline";
    spouse.healthUpdatedYear = s.year;
    spouse.healthHistory = [];
  } else if (!Number.isFinite(spouse.healthUpdatedYear)) {
    spouse.healthUpdatedYear = s.year;
    spouse.healthBasis = spouse.healthBasis || "legacy-current-baseline";
    spouse.healthHistory = Array.isArray(spouse.healthHistory) ? spouse.healthHistory : [];
  }
  if (!["new-marriage", "legacy-current-baseline", "legacy-recorded"].includes(spouse.healthBasis))
    spouse.healthBasis = "legacy-recorded";
  if (!Array.isArray(spouse.healthHistory)) spouse.healthHistory = [];
  spouse.healthHistory = spouse.healthHistory.slice(-12);
  if (!Array.isArray(spouse.healthReviewHistory)) spouse.healthReviewHistory = [];
  spouse.healthReviewHistory = spouse.healthReviewHistory.slice(-12);
  if (!Number.isFinite(spouse.healthNextReviewYear) || spouse.healthNextReviewYear < s.year)
    spouse.healthNextReviewYear =
      s.year + rnd(P("family.spouseHealthReviewMinYears"), P("family.spouseHealthReviewMaxYears"));
  spouse.healthPlan = spouse.healthPlan || "unreviewed";
  spouse.healthNoticePending = !!spouse.healthNoticePending;
  return s;
}
function formerSpouseParentingTarget(s) {
  return (
    (s.relationshipHistory || [])
      .filter(
        person =>
          person?.ending === "離婚" &&
          !formerSpouseDeathKnown(person) &&
          person.parentingReviewPending &&
          s.kids?.some(
            child =>
              !child.d && child.otherParentId === person.id && s.year - child.by < P("life.adultStartAge")
          )
      )
      .sort(
        (a, b) =>
          (a.parentingReviewYear || s.year) - (b.parentingReviewYear || s.year) ||
          String(a.id).localeCompare(String(b.id))
      )[0] || null
  );
}
function formerSpouseDeathKnown(person) {
  return !!(
    person &&
    person.lifeStatus === "dead" &&
    !person.deathNoticePending &&
    Number.isInteger(person.deathKnownYear)
  );
}
function formerSpouseMoveNoticeTarget(s) {
  return (
    (s.relationshipHistory || [])
      .filter(
        person =>
          person?.ending === "離婚" &&
          person.lifeStatus !== "dead" &&
          person.residenceMoveNotice &&
          !Number.isInteger(person.residenceMoveNotice.deliveredYear) &&
          Number.isFinite(person.residenceMoveNotice.availableYear) &&
          person.residenceMoveNotice.availableYear <= s.year &&
          s.kids?.some(child => !child.d && child.otherParentId === person.id)
      )
      .sort(
        (a, b) =>
          a.residenceMoveNotice.availableYear - b.residenceMoveNotice.availableYear ||
          String(a.id).localeCompare(String(b.id))
      )[0] || null
  );
}
function advanceFormerSpouseParenting(s) {
  for (const person of s.relationshipHistory || []) {
    if (person.ending !== "離婚") continue;
    if (formerSpouseDeathKnown(person)) {
      person.parentingReviewPending = false;
      person.parentingReviewYear = null;
      continue;
    }
    if (!person.parentingPlan) continue;
    const hasMinor = (s.kids || []).some(
      child => !child.d && child.otherParentId === person.id && s.year - child.by < P("life.adultStartAge")
    );
    if (!hasMinor) {
      person.parentingReviewPending = false;
      person.parentingReviewYear = null;
      continue;
    }
    if (Number.isFinite(person.parentingReviewYear) && person.parentingReviewYear <= s.year)
      person.parentingReviewPending = true;
  }
  advanceFormerSpouseLives(s);
  advanceFormerSpouseMovement(s);
}
function formerSpouseDeathNoticeTarget(s) {
  return (
    (s.relationshipHistory || [])
      .filter(
        person =>
          person?.ending === "離婚" &&
          person.lifeStatus === "dead" &&
          person.deathNoticePending &&
          Number.isFinite(person.deathNoticeAvailableYear) &&
          person.deathNoticeAvailableYear <= s.year &&
          s.kids?.some(child => !child.d && child.otherParentId === person.id)
      )
      .sort(
        (a, b) =>
          a.deathNoticeAvailableYear - b.deathNoticeAvailableYear || String(a.id).localeCompare(String(b.id))
      )[0] || null
  );
}
function siblingDeathNoticeTarget(s) {
  return (
    siblingsOf(s)
      .filter(
        person =>
          person?.d &&
          person.deathNoticePending &&
          Number.isFinite(person.deathNoticeAvailableYear) &&
          person.deathNoticeAvailableYear <= s.year
      )
      .sort(
        (a, b) =>
          a.deathNoticeAvailableYear - b.deathNoticeAvailableYear || String(a.id).localeCompare(String(b.id))
      )[0] || null
  );
}
function advanceFormerSpouseLives(s) {
  for (const person of s.relationshipHistory || []) {
    if (
      person?.ending !== "離婚" ||
      !Number.isFinite(person.by) ||
      person.lifeStatus === "dead" ||
      !s.kids?.some(child => !child.d && child.otherParentId === person.id)
    )
      continue;
    if (!Number.isInteger(person.mortalityCheckedYear)) person.mortalityCheckedYear = s.year - 1;
    if (person.mortalityCheckedYear >= s.year) continue;
    const mortality = spouseMortalityRisk(s, person);
    person.mortalityCheckedYear = s.year;
    if (
      !mortality ||
      !(
        mortality.risk >= 1 ||
        keyedRoll(
          `${person.id}|${person.nm || person.name || "former spouse"}|${person.by}|${s.year}|death`
        ) < mortality.risk
      )
    )
      continue;
    const before = HL && !CAPTURE_TRACE ? null : traceState(s);
    person.lifeStatus = "dead";
    person.actualDeathYear = s.year;
    person.actualDeathCause = mortality.cause;
    person.independentMoveReviewYear = null;
    person.deathNoticePending = true;
    const origin = REG.find(region => region.n === person.residenceRegion) || s.res,
      route = careNetworkInfoRoute({ ...s, res: origin }, s.res.n);
    person.deathNoticeAvailableYear = s.year + route.delayYears;
    person.deathNoticeChannel = route.channel;
    recordTrace(
      "former-spouse-death",
      person.id,
      {
        actualDeathYear: person.actualDeathYear,
        cause: person.actualDeathCause,
        noticeAvailableYear: person.deathNoticeAvailableYear,
        channel: person.deathNoticeChannel,
        basis: "game-model"
      },
      before
    );
  }
}
function repairFormerSpouseMovement(s) {
  for (const person of s.relationshipHistory || []) {
    if (person?.ending !== "離婚" || !s.kids?.some(child => !child.d && child.otherParentId === person.id))
      continue;
    if (!Array.isArray(person.moveHistory)) person.moveHistory = [];
    person.moveHistory = person.moveHistory.slice(-12);
    if (!person.lifeStatus && !Number.isInteger(person.actualDeathYear)) person.lifeStatus = "alive";
    if (!Number.isInteger(person.moveCount)) person.moveCount = person.moveHistory.length;
    if (!Number.isInteger(person.knownMoveCount)) person.knownMoveCount = person.moveCount;
    if (!Array.isArray(person.moveNoticeHistory)) person.moveNoticeHistory = [];
    person.moveNoticeHistory = person.moveNoticeHistory.slice(-12);
    if (
      !REG.some(region => region.n === person.knownResidenceRegion) &&
      REG.some(region => region.n === person.residenceRegion)
    )
      person.knownResidenceRegion = person.residenceRegion;
    if (!Array.isArray(person.pendingMoveNotices)) person.pendingMoveNotices = [];
    person.pendingMoveNotices = person.pendingMoveNotices.slice(-4);
    if (!Number.isInteger(person.independentMoveReviewYear) || person.independentMoveReviewYear < s.year)
      person.independentMoveReviewYear =
        s.year + rnd(P("family.spouseMoveReviewMinYears"), P("family.spouseMoveReviewMaxYears"));
  }
  return s;
}
function formerSpouseMoveInformationRoute(s, person, origin) {
  const route = careNetworkInfoRoute({ ...s, res: origin }, s.res.n);
  if (person.parentingPlan !== "low_contact") return route;
  return { ...route, delayYears: Math.min(2, route.delayYears + 1), channel: "kin_or_community_relay" };
}
function advanceFormerSpouseMovement(s) {
  for (const person of s.relationshipHistory || []) {
    const sharedChildren = (s.kids || []).filter(child => !child.d && child.otherParentId === person.id);
    if (
      person?.ending !== "離婚" ||
      person.lifeStatus === "dead" ||
      !Number.isFinite(person.by) ||
      !sharedChildren.length
    )
      continue;
    repairFormerSpouseMovement({ relationshipHistory: [person], kids: sharedChildren, year: s.year });
    if (person.residenceMoveNotice && !Number.isInteger(person.residenceMoveNotice.deliveredYear)) continue;
    if (!Number.isInteger(person.independentMoveReviewYear) || person.independentMoveReviewYear < s.year)
      person.independentMoveReviewYear =
        s.year + rnd(P("family.spouseMoveReviewMinYears"), P("family.spouseMoveReviewMaxYears"));
    if (s.year < person.independentMoveReviewYear) continue;
    person.independentMoveReviewYear =
      s.year + rnd(P("family.spouseMoveReviewMinYears"), P("family.spouseMoveReviewMaxYears"));
    if (
      keyedRoll(`${person.id}|${person.by}|${s.year}|former-relocation`) >=
      P("family.spouseIndependentMoveChance")
    )
      continue;
    const origin = REG.find(region => region.n === person.residenceRegion);
    if (!origin) continue;
    const routes = (MIGRATION_ROUTES[origin.n] || []).filter(
      route => route.n !== origin.n && REG.some(region => region.n === route.n)
    );
    if (!routes.length) continue;
    const route = wp(routes.map(item => ({ w: item.w, route: item }))).route,
      destination = REG.find(region => region.n === route.n);
    if (!destination) continue;
    const fare = Math.round(
        ((route.fare || 0) + P("economy.spouseMoveCostBase")) * origin.pm * (s.priceIndex || 1)
      ),
      from = origin.n,
      to = destination.n,
      noticeRoute = formerSpouseMoveInformationRoute(s, person, origin),
      before = HL && !CAPTURE_TRACE ? null : traceState(s);
    person.residenceRegion = to;
    person.moveCount = (person.moveCount || 0) + 1;
    person.moveHistory || (person.moveHistory = []);
    person.moveHistory.push({
      id: person.moveCount,
      year: s.year,
      from,
      to,
      estimatedFare: fare,
      cause: "仕事・住居・生活事情",
      basis: "game-model"
    });
    person.moveHistory = person.moveHistory.slice(-12);
    person.residenceMoveNotice = {
      moveCount: person.moveCount,
      year: s.year,
      availableYear: s.year + noticeRoute.delayYears,
      from,
      to,
      channel: noticeRoute.channel,
      delayYears: noticeRoute.delayYears,
      deliveredYear: null
    };
    person.pendingMoveNotices || (person.pendingMoveNotices = []);
    person.pendingMoveNotices.push({ ...person.residenceMoveNotice });
    person.pendingMoveNotices = person.pendingMoveNotices.slice(-4);
    recordTrace(
      "former-spouse-move",
      person.id,
      {
        moveCount: person.moveCount,
        from,
        to,
        estimatedFare: fare,
        noticeAvailableYear: person.residenceMoveNotice.availableYear,
        channel: noticeRoute.channel,
        financeBasis: "former-household post-divorce finances are not tracked; fare is an estimate"
      },
      before
    );
  }
}
function recordFormerSpouseMoveNotice(s, id) {
  const person = (s.relationshipHistory || []).find(
    item =>
      item.id === id &&
      item.ending === "離婚" &&
      item.lifeStatus !== "dead" &&
      item.residenceMoveNotice &&
      !Number.isInteger(item.residenceMoveNotice.deliveredYear) &&
      item.residenceMoveNotice.availableYear <= s.year
  );
  if (!person) throw new Error("離婚した相手の転居知らせを確認できません");
  const notice = person.residenceMoveNotice;
  person.knownResidenceRegion = notice.to;
  person.residenceKnownYear = s.year;
  person.knownMoveCount = Math.max(person.knownMoveCount || 0, notice.moveCount);
  notice.deliveredYear = s.year;
  person.moveNoticeHistory || (person.moveNoticeHistory = []);
  person.moveNoticeHistory.push({
    year: s.year,
    moveYear: notice.year,
    from: notice.from,
    to: notice.to,
    channel: notice.channel
  });
  person.moveNoticeHistory = person.moveNoticeHistory.slice(-12);
  for (const child of s.kids || [])
    if (
      !child.d &&
      child.otherParentId === person.id &&
      child.householdResidencePlan &&
      child.householdResidencePlan !== "self" &&
      child.householdResidencePlan !== "unresolved"
    )
      child.householdResidenceReviewYear = s.year + 1;
  return person;
}
function recordFormerSpouseDeathNotice(s, id) {
  const person = (s.relationshipHistory || []).find(
    item => item.id === id && item.ending === "離婚" && item.lifeStatus === "dead" && item.deathNoticePending
  );
  if (
    !person ||
    !Number.isFinite(person.deathNoticeAvailableYear) ||
    person.deathNoticeAvailableYear > s.year
  )
    throw new Error("離婚した相手の訃報はまだ届いていません");
  person.deathYear = person.actualDeathYear;
  person.deathCause = person.actualDeathCause || "死因不明";
  person.deathKnownYear = s.year;
  person.deathNoticePending = false;
  person.deathNoticeHistory || (person.deathNoticeHistory = []);
  person.deathNoticeHistory.push({
    year: s.year,
    deathYear: person.deathYear,
    channel: person.deathNoticeChannel || "kin_or_community_relay"
  });
  person.deathNoticeHistory = person.deathNoticeHistory.slice(-8);
  person.parentingReviewPending = false;
  person.parentingReviewYear = null;
  for (const child of s.kids || []) {
    if (child.d || child.otherParentId !== person.id) continue;
    if (
      child.householdResidenceProposal &&
      [undefined, "former_spouse"].includes(child.householdResidenceProposal.recipientRole)
    ) {
      child.householdResidenceProposalHistory || (child.householdResidenceProposalHistory = []);
      child.householdResidenceProposalHistory.push({
        ...child.householdResidenceProposal,
        recipientRole: "former_spouse",
        recipientId: child.householdResidenceProposal.recipientId || person.id,
        status: "closed_co_parent_death",
        closedYear: s.year
      });
      child.householdResidenceProposalHistory = child.householdResidenceProposalHistory.slice(-12);
      child.householdResidenceProposal = null;
    }
    if (s.year - child.by >= P("life.adultStartAge")) continue;
    const plan = child.householdResidencePlan;
    if (plan === "self") {
      child.householdResidenceReviewYear = null;
      continue;
    }
    if (["former", "former_support", "shared"].includes(plan)) {
      child.householdResidenceHistory || (child.householdResidenceHistory = []);
      child.householdResidenceHistory.push({
        year: s.year,
        from: plan,
        plan: "unresolved",
        annualSupport: 0,
        cause: "other_parent_death_notice"
      });
      child.householdResidenceHistory = child.householdResidenceHistory.slice(-12);
      child.householdResidencePlan = "unresolved";
      child.householdResidenceUpdatedYear = s.year;
    }
    child.householdResidenceReviewYear = Math.max(
      Number.isInteger(person.endedYear) ? person.endedYear + 1 : s.year,
      s.year
    );
  }
  return person;
}
function confirmSiblingDeathNotice(s, id) {
  const sibling = siblingsOf(s).find(
    item =>
      item.id === id &&
      item.d &&
      item.deathNoticePending &&
      Number.isFinite(item.deathNoticeAvailableYear) &&
      item.deathNoticeAvailableYear <= s.year
  );
  if (!sibling) throw new Error("きょうだいの訃報を確認できません");
  sibling.deathKnownYear = s.year;
  sibling.deathNoticePending = false;
  sibling.deathNoticeHistory || (sibling.deathNoticeHistory = []);
  sibling.deathNoticeHistory.push({
    year: s.year,
    deathYear: sibling.d,
    channel: sibling.deathNoticeChannel || "kin_or_community_relay"
  });
  sibling.deathNoticeHistory = sibling.deathNoticeHistory.slice(-8);
  return sibling;
}
function reviewFormerSpouseParenting(s, plan) {
  const person =
    (s.relationshipHistory || []).find(item => item.id === s.eventRelativeId && item.ending === "離婚") ||
    formerSpouseParentingTarget(s);
  if (
    !person ||
    !s.kids?.some(
      child => !child.d && child.otherParentId === person.id && s.year - child.by < P("life.adultStartAge")
    )
  )
    throw new Error("離婚後の養育連絡を相談する相手または未成年の子がいません");
  if (!["coordinate", "mediated", "low_contact"].includes(plan))
    throw new Error("離婚後の養育連絡方針が不正");
  person.parentingPlan = plan;
  person.parentingReviewPending = false;
  person.parentingReviewYear =
    s.year + rnd(P("family.divorceParentingReviewMinYears"), P("family.divorceParentingReviewMaxYears"));
  person.parentingHistory || (person.parentingHistory = []);
  person.parentingHistory.push({
    year: s.year,
    plan,
    children: s.kids
      .filter(
        child => !child.d && child.otherParentId === person.id && s.year - child.by < P("life.adultStartAge")
      )
      .map(child => child.id)
  });
  person.parentingHistory = person.parentingHistory.slice(-12);
  return person;
}
function advanceSpouseHealth(s) {
  const spouse = s.sp;
  if (!spouse || spouse.d) return;
  repairSpouseHealth(s);
  if (spouse.healthUpdatedYear >= s.year) return;
  const age = Math.max(0, s.year - (spouse.by ?? s.year)),
    ageLoad = Math.max(0, age - P("family.spouseHealthAgeStart")) * P("family.spouseHealthAgeDrift"),
    infectionLoad = spouse.inf ? P("family.spouseHealthInfectionDrift") : 0,
    job = J[spouse.j] || {},
    hazardLoad = Math.max(0, (job.ex || 1) - 1) * P("family.spouseHealthHazardDrift"),
    restRelief =
      spouse.healthPlan === "lighter_load" &&
      Number.isFinite(spouse.healthPlanUntilYear) &&
      s.year <= spouse.healthPlanUntilYear
        ? P("family.spouseHealthRestRelief")
        : 0,
    before = spouse.health,
    change =
      -(ageLoad + infectionLoad + hazardLoad - restRelief) +
      (R() - 0.5) * P("family.spouseHealthRandomDrift"),
    after = Math.max(0, Math.min(100, before + change));
  spouse.health = after;
  spouse.healthUpdatedYear = s.year;
  if (Math.abs(after - before) > 0.001) {
    spouse.healthHistory.push({
      year: s.year,
      from: before,
      to: after,
      cause:
        [
          ageLoad > 0 ? "年齢に伴う負担" : null,
          infectionLoad > 0 ? "感染状態" : null,
          hazardLoad > 0 ? "生業上の負担" : null,
          restRelief > 0 ? "仕事・家事の負担を見直した期間" : null
        ]
          .filter(Boolean)
          .join("・") || "年ごとの揺れ",
      basis: "game-model"
    });
    spouse.healthHistory = spouse.healthHistory.slice(-12);
  }
  if (after <= P("family.spouseHealthNoticeThreshold") && s.year >= (spouse.healthNextReviewYear || s.year))
    spouse.healthNoticePending = true;
}
function spouseMortalityRisk(s, spouse = s.sp) {
  if (!spouse || !Number.isFinite(spouse.by)) return null;
  const age = Math.max(0, s.year - spouse.by),
    lifeScale = Number.isFinite(spouse.r?.lm) && spouse.r.lm > 0 ? spouse.r.lm : 1,
    effectiveAge = age / lifeScale,
    forcedAge = P("life.mortalityAgeScale") * lifeScale;
  if (age >= forcedAge) {
    return { age, effectiveAge, risk: 1, cause: "老衰" };
  }
  const oldAgeRisk = Math.max(0, effectiveAge - P("life.oldAgeMortalityStart")) * P("life.oldAgeMortalitySlope");
  const baseRisk = P("life.generalMortalityBase");

  // 健康度の反映（低健康ほど病死リスク加算）
  const healthVal = Number.isFinite(spouse.health) ? spouse.health : 60;
  const healthDeficit = Math.max(0, 50 - healthVal) / 50;
  const healthIllnessRisk = healthDeficit * healthDeficit * 0.04;

  // 鉱石病の反映
  const oripathyRisk = spouse.inf ? (healthVal < 30 ? 0.03 : 0.012) : 0;

  // 危険職種・現場リスクの反映
  const jobDef = J[spouse.job] || {};
  const hazardMultiplier = (jobDef.ex || 1);
  const accidentRisk = hazardMultiplier > 1 ? 0.006 * hazardMultiplier : 0;

  const totalRisk = Math.min(0.95, baseRisk + oldAgeRisk + healthIllnessRisk + oripathyRisk + accidentRisk);

  // 死因の決定
  let cause = "病死";
  if (effectiveAge > P("life.oldAgeMortalityStart") && oldAgeRisk >= Math.max(healthIllnessRisk, oripathyRisk, accidentRisk)) {
    cause = "老衰";
  } else if (oripathyRisk > 0 && oripathyRisk >= Math.max(healthIllnessRisk, accidentRisk)) {
    cause = "病死（鉱石病）";
  } else if (accidentRisk > 0 && accidentRisk >= healthIllnessRisk) {
    cause = jobDef.n === "軍務・兵站" || jobDef.n === "傭兵・護衛" ? "戦闘職務中の死亡" : "事故死";
  }

  return {
    age,
    effectiveAge,
    risk: totalRisk,
    cause
  };
}
function advanceSpouseLife(s) {
  const spouse = s.sp;
  if (!spouse || spouse.d || !Number.isFinite(spouse.by) || spouse.mortalityCheckedYear >= s.year) return;
  const mortality = spouseMortalityRisk(s, spouse);
  if (!mortality) return;
  spouse.mortalityCheckedYear = s.year;
  if (
    mortality.risk >= 1 ||
    keyedRoll(`${spouse.id}|${spouse.nm}|${spouse.by}|${s.year}|death`) < mortality.risk
  ) {
    const cohabiting = spouseLivesWithProtagonist(s),
      origin = spouseResidenceRegion(s),
      route = cohabiting
        ? { channel: "face_to_face", delayYears: 0 }
        : careNetworkInfoRoute({ ...s, res: origin }, s.res.n);
    spouse.d = s.year;
    spouse.deathYear = s.year;
    spouse.deathCause = mortality.cause;
    spouse.deathNoticePending = true;
    spouse.deathNoticeAvailableYear = s.year + route.delayYears;
    spouse.deathNoticeChannel = route.channel;
    spouse.independentMoveReviewYear = null;
  }
}
