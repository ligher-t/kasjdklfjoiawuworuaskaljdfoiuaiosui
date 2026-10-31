function applyRelationshipAndSiblingHealthEffects(e, s) {
  if (e.sp) {
    if (s.romance) {
      s.sp = {
        ...s.romance,
        id: s.romance.id,
        nm: s.romance.name || s.romance.nm,
        r: s.romance.race || s.romance.r,
        marriedYear: s.year,
        marriageType: "恋愛結婚"
      };
      s.romance = null;
    } else if (!s.sp)
      s.sp = {
        id: newRelativeId(s),
        nm: nmUnique_(s, s.sx == "男" ? "女" : "男", s.res),
        r: pickRaceFor(s.res),
        by: s.year - rnd(20, 38),
        j: wp(SIM_TABLES.parentJobs).jobId,
        inf: 0,
        infHidden: 0,
        marriedYear: s.year,
        marriageType: ""
      };
  }
  if (e.romanceStart && !s.romance && !s.sp) {
    const sex = s.sx === "男" ? "女" : "男";
    s.romance = {
      id: newRelativeId(s),
      name: nmUnique_(s, sex, s.res),
      race: pickRaceFor(s.res),
      by: s.year - rnd(20, 38),
      j: wp(SIM_TABLES.parentJobs).jobId,
      stage: "known",
      metYear: s.year,
      stageSinceYear: s.year,
      yearsKnown: 0,
      context: e.romanceContext || "日常のつながり"
    };
  }
  if (e.romanceStage && s.romance) {
    if (s.romance.stage !== e.romanceStage) s.romance.stageSinceYear = s.year;
    s.romance.stage = e.romanceStage;
    s.romance.yearsKnown = (s.romance.yearsKnown || 0) + 1;
    if (e.romanceStage === "cohabiting") {
      s.fl.romance_cohabiting = 1;
      s.residenceArrangement = "spouse_shared";
      s.fl.household_separated = 1;
    }
  }
  if (e.romanceEnd && s.romance) {
    s.relationshipHistory || (s.relationshipHistory = []);
    s.relationshipHistory.push({
      ...s.romance,
      ageAtEnd: Number.isFinite(s.romance.by) ? s.year - s.romance.by : null,
      endedYear: s.year,
      ending: "別離"
    });
    s.romance = null;
  }
  if (e.arrangedMarriage && !s.sp) {
    const id = newRelativeId(s);
    s.romance = {
      id,
      name: nmUnique_(s, s.sx === "男" ? "女" : "男", s.res),
      race: pickRaceFor(s.res),
      by: s.year - rnd(20, 38),
      j: wp(SIM_TABLES.parentJobs).jobId,
      stage: "arranged",
      metYear: s.year,
      yearsKnown: 0,
      context: "家族・知人を介した縁談"
    };
    s.sp = {
      ...s.romance,
      nm: s.romance.name,
      r: s.romance.race,
      inf: 0,
      infHidden: 0,
      marriageType: "縁談",
      marriedYear: s.year
    };
    s.romance = null;
  }
  if (s.sp && !s.sp.d && s.sp.marriedYear === s.year && s.sp.sharesHousehold == null) {
    const familyHome =
      (s.residenceArrangement || "family_home_shared_budget").startsWith("family_home_") &&
      !s.fl.household_separated;
    s.sp.sharesHousehold = true;
    s.residenceArrangement = familyHome ? "family_home_shared_budget" : "spouse_shared";
    s.residenceHistory || (s.residenceHistory = []);
    s.residenceHistory.push({
      year: s.year,
      arrangement: s.residenceArrangement,
      reason: "婚姻後の同居開始"
    });
    s.residenceHistory = s.residenceHistory.slice(-24);
  }
  if (e.sibBirth) {
    const sex = R() < P("birth.femaleShare") ? "女" : "男";
    s.siblings || (s.siblings = []);
    s.siblings.push({
      id: newRelativeId(s),
      nm: nmUnique_(
        s,
        sex,
        s.res,
        [],
        s.householdFamilyName || npcFamilyPart(s.par?.fa?.nm, npcPoolFor(s.g?.n).style)
      ),
      sx: sex,
      r: pickChildRace([s.par?.fa?.r, s.par?.mo?.r], s.g),
      j: null,
      by: s.year,
      d: 0,
      inf: 0,
      infCause: null
    });
    s.fl.sibling_born = 1;
  }
  if (e.sibExposurePending) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (sibling) {
      sibling.exposurePending = 1;
      sibling.exposureYear = sibling.exposureYear || s.year;
      sibling.exposureKnownYear = s.year;
      sibling.exposureReviewYear = s.year + 1;
      sibling.exposureCause = "廃材に混じった源石結晶片による皮膚損傷";
    }
  }
  if (e.sibExposureEmployerResponse) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (
      !sibling?.exposurePending ||
      !["partial-cost", "denied"].includes(e.sibExposureEmployerResponse)
    )
      throw new Error("勤務先の曝露報告への回答を記録する対象きょうだいが不正");
    sibling.exposureEmployerResponse = e.sibExposureEmployerResponse;
    sibling.exposureEmployerResponseYear = s.year;
  }
  if (e.sibExposureReviewDelay) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d && x.exposurePending);
    if (sibling) sibling.exposureReviewYear = s.year + Math.max(1, Math.round(e.sibExposureReviewDelay));
  }
  if (e.sibExposureClose) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d && x.exposurePending);
    if (sibling) {
      sibling.exposurePending = 0;
      sibling.exposureClosedYear = s.year;
      sibling.exposureReviewYear = null;
    }
  }
  if (e.sibInf) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d && !x.inf);
    if (sibling) {
      sibling.inf = 1;
      sibling.infKnown = 1;
      sibling.infYear = s.year;
      sibling.infCause = e.sibInfCause || "源石結晶への接触（経路未記録）";
      sibling.exposurePending = 0;
      sibling.exposureKnownYear = s.year;
      sibling.exposureReviewYear = null;
    }
  }
  if (e.sibInfectionDiscussed) {
    const sibling = siblingsOf(s).find(
      x => x.id === s.eventRelativeId && !x.d && x.inf
    );
    if (!sibling) throw new Error("感染きょうだいの相談対象が不正");
    sibling.infectionDiscussedYear = s.year;
  }
  if (e.sibTreatment != null) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (!sibling || !sibling.inf || ![0, 1].includes(e.sibTreatment))
      throw new Error("きょうだいの診療支援対象・計画が不正");
    const previous = sibling.tx ?? 0;
    sibling.tx = e.sibTreatment;
    sibling.treatmentPlanYear = e.sibTreatment ? sibling.treatmentPlanYear || s.year : null;
    if (previous !== e.sibTreatment) {
      sibling.treatmentPlanHistory || (sibling.treatmentPlanHistory = []);
      sibling.treatmentPlanHistory.push({
        year: s.year,
        from: previous,
        to: e.sibTreatment,
        cause: "家族が診療・通院支援を選択"
      });
      sibling.treatmentPlanHistory = sibling.treatmentPlanHistory.slice(-12);
    }
  }
  if (e.sibDeath) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (sibling) {
      const delay = Math.min(
        Math.max(0, Number(s.eventRelativeDelayYears) || 0),
        Math.max(0, s.year - sibling.by)
      );
      sibling.d = s.year - delay;
      sibling.deathKnownYear = s.year;
      sibling.deathCause = e.sibDeathCause || "病・事故（詳細未記録）";
      sibling.exposurePending = 0;
      sibling.exposureReviewYear = null;
      sibling.parentNeedPending = null;
      sibling.reconnectInviteYear = null;
      sibling.reconnectReviewYear = null;
      sibling.contactReviewYear = null;
      sibling.moveReviewYear = null;
      sibling.workReviewYear = null;
      sibling.parentNeedReviewYear = null;
      sibling.parentSupportReviewYear = null;
      if (sibling.independentSinceYear && sibling.familyHousehold) sibling.familyHousehold.reviewYear = null;
      if (sibling.careSupportAnnual > 0) {
        sibling.careSupportAnnual = 0;
        sibling.careSupportEndedYear = sibling.d;
      }
      if (sibling.independentSinceYear && sibling.familyHousehold)
        sibling.postDeathFamilyFinance = {
          status: "survivor_economy_untracked",
          deathYear: sibling.d,
          lastKnownYear: Number.isFinite(sibling.financialUpdatedYear)
            ? Math.min(sibling.financialUpdatedYear, sibling.d)
            : null
        };
    }
  }
}

function applySpouseEffects(e, s) {
  if (e.sp && s.romance) {
    s.sp = {
      ...s.romance,
      nm: s.romance.name,
      r: s.romance.race,
      inf: 0,
      infHidden: 0,
      marriageType: s.romance.stage === "arranged" ? "縁談" : "恋愛結婚",
      marriedYear: s.year
    };
    s.romance = null;
  }
  if (s.sp && (e.sp || e.arrangedMarriage)) {
    initializeSpouseHealth(s);
    if (!s.sp.personalFinance) initializeSpouseFinance(s);
  }
  if (e.spouseInf && s.sp) {
    s.sp.inf = 1;
    s.sp.infHidden = 1;
    s.sp.tx = 0;
    s.sp.careEverStarted = 0;
    s.sp.infCause = "婚姻以前の結晶曝露（経路不明）";
    s.sp.infDisclosedYear = s.year;
  }
  if (e.spouseDisclose && s.sp) {
    s.sp.infHidden = 0;
    s.sp.disclosedYear = s.year;
    s.fl.spouse_disclosure = 1;
  }
  if (["separate_rooms", "repaired"].includes(e.spouseDisclosureBoundary) && s.sp) {
    const previous = s.sp.disclosureBoundary || null;
    s.sp.disclosureBoundary = e.spouseDisclosureBoundary;
    s.fl.marriage_strained = e.spouseDisclosureBoundary === "separate_rooms" ? 1 : 0;
    if (e.spouseDisclosureBoundary === "separate_rooms") {
      s.sp.disclosureBoundarySinceYear = s.sp.disclosureBoundarySinceYear || s.year;
      s.sp.disclosureReviewYear =
        s.year +
        Math.max(
          1,
          Math.min(8, Number.isInteger(e.spouseDisclosureReviewDelay) ? e.spouseDisclosureReviewDelay : 2)
        );
    } else {
      s.sp.disclosureResolvedYear = s.year;
      s.sp.disclosureReviewYear = null;
    }
    s.sp.disclosureBoundaryHistory || (s.sp.disclosureBoundaryHistory = []);
    s.sp.disclosureBoundaryHistory.push({ year: s.year, from: previous, to: e.spouseDisclosureBoundary });
    s.sp.disclosureBoundaryHistory = s.sp.disclosureBoundaryHistory.slice(-12);
  }
  if ((e.spouseTreatment === 0 || e.spouseTreatment === 1) && s.sp?.inf) {
    if (e.spouseTreatment === 1) s.sp.careEverStarted = 1;
    else if (s.sp.careEverStarted !== 1) s.sp.careEverStarted = 0;
    s.sp.tx = e.spouseTreatment;
  }
  if (
    ["none", "living", "medical"].includes(e.spouseSeparateSupportPlan) &&
    ["regular", "letters", "paused"].includes(e.spouseSeparateContact) &&
    s.sp &&
    !spouseLivesWithProtagonist(s)
  ) {
    const spouse = s.sp,
      previousSupport = spouse.separateSupportPlan || "unrecorded",
      previousContact = spouse.separateContact || "unrecorded";
    spouse.separateSupportPlan = e.spouseSeparateSupportPlan;
    spouse.separateContact = e.spouseSeparateContact;
    spouse.separateLifeReviewHistory || (spouse.separateLifeReviewHistory = []);
    spouse.separateLifeReviewHistory.push({
      year: s.year,
      fromSupport: previousSupport,
      toSupport: e.spouseSeparateSupportPlan,
      fromContact: previousContact,
      toContact: e.spouseSeparateContact
    });
    spouse.separateLifeReviewHistory = spouse.separateLifeReviewHistory.slice(-12);
    spouse.separateLifeReviewPending = false;
    spouse.separateLifeReviewYear =
      s.year + rnd(P("family.spouseSeparateReviewMinYears"), P("family.spouseSeparateReviewMaxYears"));
  }
  if (e.spouseHousingKeep === 1 && s.sp && !spouseLivesWithProtagonist(s)) {
    s.sp.separateLifeReviewPending = false;
    s.sp.separateLifeReviewYear =
      s.year + rnd(P("family.spouseSeparateReviewMinYears"), P("family.spouseSeparateReviewMaxYears"));
  }
  if (
    ["shared", "standard", "private"].includes(e.spouseHousingPlan) &&
    s.sp &&
    !spouseLivesWithProtagonist(s)
  ) {
    const spouse = s.sp,
      previous = spouseHousingPlan(spouse),
      changed = previous !== e.spouseHousingPlan;
    spouse.housingPlan = e.spouseHousingPlan;
    spouse.separateLifeReviewPending = false;
    spouse.separateLifeReviewYear =
      s.year + rnd(P("family.spouseSeparateReviewMinYears"), P("family.spouseSeparateReviewMaxYears"));
    spouse.housingPlanHistory || (spouse.housingPlanHistory = []);
    const setupCost = changed
      ? P("economy.spouseHousingChangeCost") * spouseResidenceRegion(s).pm * (s.priceIndex || 1)
      : 0;
    if (setupCost) {
      spouse.pendingHousingSetupCostForYear = (spouse.pendingHousingSetupCostForYear || 0) + setupCost;
      spouse.personalFinance?.transfers?.push({
        year: s.year,
        kind: "housing_change",
        cause: "住居形態の変更",
        amount: -setupCost,
        from: previous,
        to: e.spouseHousingPlan
      });
      if (spouse.personalFinance?.transfers)
        spouse.personalFinance.transfers = spouse.personalFinance.transfers.slice(-20);
    }
    spouse.housingPlanHistory.push({
      year: s.year,
      from: previous,
      to: e.spouseHousingPlan,
      region: spouseResidenceRegion(s).n,
      annualHousingCost: spouseIndependentHousingExpense(s),
      setupCost
    });
    spouse.housingPlanHistory = spouse.housingPlanHistory.slice(-12);
  }
  if (e.spouseVisit === 1 && s.sp && !spouseLivesWithProtagonist(s)) {
    const trip = spouseVisitRoute(s);
    if (!trip || !spouseVisitAffordable(s)) throw Error("配偶者を訪ねる経路または家計資金がありません");
    const wallet = inSharedHousehold(s) ? s.house || (s.house = { cash: 0, debt: 0, inc: 0, exp: 0 }) : s;
    wallet.cash = Math.max(0, wallet.cash - trip.fare);
    s.sp.visitHistory || (s.sp.visitHistory = []);
    s.sp.visitHistory.push({
      year: s.year,
      from: trip.from,
      to: trip.to,
      kind: trip.kind,
      fare: trip.fare,
      paidBy: inSharedHousehold(s) ? "household" : "personal"
    });
    s.sp.visitHistory = s.sp.visitHistory.slice(-20);
    s.sp.visitTotal = (s.sp.visitTotal || 0) + trip.fare;
    s.sp.visitCount = (s.sp.visitCount || 0) + 1;
    s.sp.separateContact = "regular";
    s.sp.lastVisitYear = s.year;
  }
  if (
    e.spouseMoveNotice === 1 &&
    s.sp?.residenceMoveNotice &&
    s.sp.residenceMoveNotice.deliveredYear <= s.year
  ) {
    s.sp.residenceNoticeHistory || (s.sp.residenceNoticeHistory = []);
    s.sp.residenceNoticeHistory.push({
      year: s.year,
      from: s.sp.residenceMoveNotice.from,
      to: s.sp.residenceMoveNotice.to,
      moveYear: s.sp.residenceMoveNotice.year
    });
    s.sp.residenceNoticeHistory = s.sp.residenceNoticeHistory.slice(-12);
    s.sp.residenceMoveNotice = null;
    s.sp.separateLifeReviewPending = false;
    s.sp.separateLifeReviewYear =
      s.year + rnd(P("family.spouseSeparateReviewMinYears"), P("family.spouseSeparateReviewMaxYears"));
    s.sp.independentMoveReviewYear =
      s.year + rnd(P("family.spouseMoveReviewMinYears"), P("family.spouseMoveReviewMaxYears"));
  }
  if (e.spouseRejoin === 1 && s.sp && !spouseLivesWithProtagonist(s)) {
    const move = spouseRejoinRoute(s);
    if (!move || !spouseRejoinAffordable(s))
      throw Error("配偶者の再合流に必要な経路または家計資金がありません");
    const wallet = inSharedHousehold(s) ? s.house : s;
    if (!wallet) throw Error("配偶者の移動費を支払う家計がありません");
    wallet.cash = Math.max(0, wallet.cash - move.fare);
    s.sp.residenceRegion = s.res.n;
    s.sp.sharesHousehold = true;
    s.sp.knownResidenceRegion = s.res.n;
    s.sp.residenceKnownYear = s.year;
    s.sp.residenceHistory || (s.sp.residenceHistory = []);
    s.sp.residenceHistory.push({
      year: s.year,
      from: move.origin.n,
      to: s.res.n,
      decision: "spouse_rejoined",
      kind: move.kind || "regional",
      fare: move.fare
    });
    s.sp.residenceHistory = s.sp.residenceHistory.slice(-16);
    s.sp.separateLifeReviewHistory || (s.sp.separateLifeReviewHistory = []);
    s.sp.separateLifeReviewHistory.push({
      year: s.year,
      fromSupport: s.sp.separateSupportPlan || "unrecorded",
      toSupport: "none",
      fromContact: s.sp.separateContact || "unrecorded",
      toContact: "regular",
      outcome: "再合流"
    });
    s.sp.separateLifeReviewHistory = s.sp.separateLifeReviewHistory.slice(-12);
    s.sp.separateSupportPlan = "none";
    s.sp.separateContact = "regular";
    s.sp.separateLifeReviewPending = false;
    s.sp.separateLifeReviewYear = null;
    s.sp.workPreferenceReviewPending = true;
    s.sp.workPreferenceReviewYear = s.year + 1;
    s.sp.workPreferenceReviewCause = "rejoin";
    s.sp.workReviewYear = s.year + 2;
  }
  if (["shared", "separate", "caregiving"].includes(e.spouseArrangement) && s.sp) {
    s.sp.householdArrangement = e.spouseArrangement;
    s.sp.arrangementYear = s.year;
    s.sp.arrangementReviewYear = s.year + P("family.spouseArrangementReviewYears");
  }
  if (e.childResidencePlan) {
    const child = (s.kids || []).find(
      item =>
        item.id === s.eventRelativeId &&
        !item.d &&
        s.year - item.by < P("life.adultStartAge") &&
        formerSpouseForChild(s, item)
    );
    if (
      !child ||
      !["self", "former_support", "former", "shared", "unresolved"].includes(e.childResidencePlan)
    )
      throw new Error("離婚後の子の生活先相談の対象または選択が不正");
    if (
      e.childResidencePlan === "former_support" &&
      moveFunds(s) < divorceChildSupportAnnualCost(s, child) + annualCashReserve(s)
    )
      throw new Error("定期支援後の生活予備費を残せません");
    child.householdResidenceHistory || (child.householdResidenceHistory = []);
    child.householdResidenceHistory.push({
      year: s.year,
      from: child.householdResidencePlan || "unrecorded",
      plan: e.childResidencePlan,
      annualSupport: e.childResidencePlan === "former_support" ? divorceChildSupportAnnualCost(s, child) : 0
    });
    child.householdResidenceHistory = child.householdResidenceHistory.slice(-12);
    child.householdResidencePlan = e.childResidencePlan;
    child.householdResidenceUpdatedYear = s.year;
    child.householdResidenceReviewYear =
      s.year + rnd(P("family.divorceParentingReviewMinYears"), P("family.divorceParentingReviewMaxYears"));
  }
  if (e.childResidenceReview === 1) {
    const child = (s.kids || []).find(
      item =>
        item.id === s.eventRelativeId &&
        !item.d &&
        s.year - item.by < P("life.adultStartAge") &&
        formerSpouseForChild(s, item)
    );
    if (!child) throw new Error("離婚後の子の生活先を再確認する対象がいません");
    child.householdResidenceReviewYear =
      s.year + rnd(P("family.divorceParentingReviewMinYears"), P("family.divorceParentingReviewMaxYears"));
  }
  if (e.childResidenceProposal) {
    const child = (s.kids || []).find(
      item =>
        item.id === s.eventRelativeId &&
        !item.d &&
        s.year - item.by < P("life.adultStartAge") &&
        formerSpouseForChild(s, item)
    );
    const plan = e.childResidenceProposal.plan,
      plans = ["self", "former_support", "former", "shared"],
      former = formerSpouseForChild(s, child),
      otherParentDead = formerSpouseDeathKnown(former);
    if (!child || !plans.includes(plan)) throw new Error("離婚後の子の生活先提案が不正");
    if (otherParentDead && plan !== "self")
      throw new Error("亡くなった相手を生活先の提案先にできません");
    const annualSupport = plan === "former_support" ? divorceChildSupportAnnualCost(s, child) : 0;
    if (plan === "former_support" && moveFunds(s) < annualSupport + annualCashReserve(s))
      throw new Error("提案する定期支援と生活予備費を残せません");
    child.householdResidenceProposal = {
      year: s.year,
      plan,
      annualSupport,
      status: "pending",
      recipientRole: otherParentDead ? "child" : "former_spouse",
      recipientId: otherParentDead ? child.id : former.id
    };
    child.householdResidenceReviewYear =
      s.year + rnd(P("family.divorceParentingReviewMinYears"), P("family.divorceParentingReviewMaxYears"));
  }
  if (e.divorceParentingPlan) reviewFormerSpouseParenting(s, e.divorceParentingPlan);
  if (e.spouseFinanceReview === 1 && s.sp?.personalFinance) {
    const finance = s.sp.personalFinance;
    finance.reviewYear =
      s.year + rnd(P("family.spouseFinanceReviewMinYears"), P("family.spouseFinanceReviewMaxYears"));
  }
  if (["consult", "lighter_load", "defer"].includes(e.spouseHealthReview) && s.sp) {
    const spouse = s.sp,
      plan = e.spouseHealthReview;
    if (plan === "consult") spouse.healthPlan = "consult";
    else if (plan === "lighter_load") {
      spouse.healthPlan = "lighter_load";
      spouse.healthPlanUntilYear = s.year + 2;
      spouse.reducedWorkUntilYear = s.year + 2;
    } else spouse.healthPlan = "defer";
    spouse.healthReviewHistory || (spouse.healthReviewHistory = []);
    spouse.healthReviewHistory.push({
      year: s.year,
      plan,
      health: Math.round(spouse.health),
      cost: plan === "consult" ? spouseHealthConsultCost(s) : 0
    });
    spouse.healthReviewHistory = spouse.healthReviewHistory.slice(-12);
    spouse.healthNoticePending = false;
    spouse.healthNextReviewYear =
      s.year + rnd(P("family.spouseHealthReviewMinYears"), P("family.spouseHealthReviewMaxYears"));
  }
  if (e.spouseContributionPause && s.sp) {
    s.sp.contributionPauseUntilYear = s.year + Math.max(1, Math.round(e.spouseContributionPause));
    if (s.sp.personalFinance) {
      s.sp.personalFinance.reviewYear =
        s.year + rnd(P("family.spouseFinanceReviewMinYears"), P("family.spouseFinanceReviewMaxYears"));
      s.sp.personalFinance.transfers || (s.sp.personalFinance.transfers = []);
      s.sp.personalFinance.transfers.push({
        year: s.year,
        amount: 0,
        direction: "pause",
        cause: "配偶者の家計拠出を一時休止",
        debtPaid: 0,
        cashAdded: 0
      });
      s.sp.personalFinance.transfers = s.sp.personalFinance.transfers.slice(-20);
    }
  }
  if (["income", "low_hazard", "stay", "open"].includes(e.spouseWorkPreference) && s.sp) {
    const spouse = s.sp,
      previous = spouse.workPreference || "unrecorded";
    spouse.workPreference = e.spouseWorkPreference;
    spouse.workPreferenceHistory || (spouse.workPreferenceHistory = []);
    spouse.workPreferenceHistory.push({
      year: s.year,
      from: previous,
      to: e.spouseWorkPreference,
      cause: spouse.workPreferenceReviewCause || "定期の希望確認"
    });
    spouse.workPreferenceHistory = spouse.workPreferenceHistory.slice(-12);
    spouse.workPreferenceReviewPending = false;
    spouse.workPreferenceReviewYear =
      s.year +
      rnd(P("family.spouseWorkPreferenceReviewMinYears"), P("family.spouseWorkPreferenceReviewMaxYears"));
    spouse.workPreferenceReviewCause = null;
  }
  if (
    ["training", "search", "wait"].includes(e.spouseEmploymentSupport) &&
    s.sp &&
    spouseEmploymentStatus(s.sp) === "unemployed"
  ) {
    const spouse = s.sp;
    spouse.employmentSupportHistory || (spouse.employmentSupportHistory = []);
    spouse.employmentSupportHistory.push({ year: s.year, kind: e.spouseEmploymentSupport });
    spouse.employmentSupportHistory = spouse.employmentSupportHistory.slice(-12);
    spouse.unemploymentSupportPending = false;
    spouse.reemploymentBoost =
      e.spouseEmploymentSupport === "training"
        ? P("family.spouseTrainingReemploymentBoost")
        : e.spouseEmploymentSupport === "search"
          ? P("family.spouseSearchReemploymentBoost")
          : 0;
    spouse.workReviewYear = s.year + 1;
  }
  if (e.divorce && s.sp) {
    s.relationshipHistory || (s.relationshipHistory = []);
    const former = {
        ...s.sp,
        ageAtEnd: Number.isFinite(s.sp.by) ? s.year - s.sp.by : null,
        endedYear: s.year,
        ending: "離婚",
        lifeStatus: s.sp.lifeStatus || "alive",
        mortalityCheckedYear: s.year,
        knownResidenceRegion: s.sp.knownResidenceRegion || s.sp.residenceRegion || s.res.n,
        moveCount:
          s.sp.residenceMoveNotice && !Number.isInteger(s.sp.residenceMoveNotice.deliveredYear) ? 1 : 0,
        knownMoveCount: 0,
        moveHistory: [],
        moveNoticeHistory: s.sp.residenceNoticeHistory || [],
        residenceMoveNotice:
          s.sp.residenceMoveNotice && !Number.isInteger(s.sp.residenceMoveNotice.deliveredYear)
            ? { ...s.sp.residenceMoveNotice, moveCount: 1 }
            : null,
        independentMoveReviewYear:
          s.year + rnd(P("family.spouseMoveReviewMinYears"), P("family.spouseMoveReviewMaxYears"))
      },
      sharedMinor = (s.kids || []).some(
        child => !child.d && child.otherParentId === former.id && s.year - child.by < P("life.adultStartAge")
      );
    if (sharedMinor) {
      former.parentingPlan = "unreviewed";
      former.parentingReviewPending = true;
      former.parentingReviewYear = s.year + 1;
      former.parentingHistory = [];
      for (const child of s.kids || [])
        if (!child.d && child.otherParentId === former.id && s.year - child.by < P("life.adultStartAge")) {
          child.householdResidenceReviewYear = s.year + 1;
          child.householdResidenceHistory = [];
        }
    }
    s.relationshipHistory.push(former);
    s.sp = null;
    s.fl.marriage_ended = 1;
    s.fl.divorced = 1;
  }
  if (e.spouseDeath && s.sp && s.sp.id === s.eventRelativeId) {
    if (
      !s.sp.d ||
      !s.sp.deathNoticePending ||
      !Number.isFinite(s.sp.deathNoticeAvailableYear) ||
      s.sp.deathNoticeAvailableYear > s.year
    )
      throw new Error("配偶者の死亡が確定していないか、訃報がまだ届いていません");
    const deathYear = Number.isFinite(s.sp.deathYear) ? s.sp.deathYear : s.year,
      deathCause = s.sp.deathCause || "病死（詳細未記録）";
    s.relationshipHistory || (s.relationshipHistory = []);
    s.relationshipHistory.push({
      ...s.sp,
      ageAtEnd: Number.isFinite(s.sp.by) ? deathYear - s.sp.by : null,
      deathYear,
      deathKnownYear: s.year,
      deathNoticePending: false,
      deathCause,
      deathNoticeAvailableYear: s.sp.deathNoticeAvailableYear ?? deathYear,
      deathNoticeChannel: s.sp.deathNoticeChannel || "face_to_face",
      deathNoticeHistory: [
        ...(s.sp.deathNoticeHistory || []),
        { year: s.year, deathYear, channel: s.sp.deathNoticeChannel || "face_to_face" }
      ].slice(-8),
      endedYear: deathYear,
      ending: "死別"
    });
    s.sp = null;
    s.fl.marriage_ended = 1;
    s.fl.spouse_death = 1;
  }
  if (e.lateranoFamilyProcess) {
    const deceased = (s.relationshipHistory || []).find(
      x => x.id === s.eventRelativeId && x.ending === "死別" && x.deathYear
    );
    if (
      s.res?.n !== "ラテラーノ" ||
      s.legal?.status !== "recorded" ||
      s.legal?.citizenshipCountry !== "ラテラーノ" ||
      !deceased ||
      !e.spouseDeath
    )
      throw Error("ラテラーノ家族手続き照会の条件が一致しません");
    s.legal.familyProceedings || (s.legal.familyProceedings = []);
    s.legal.familyProceedings.push({
      year: s.year,
      relativeId: deceased.id,
      caseType: e.lateranoFamilyProcess,
      children: s.kids.filter(k => !k.d).map(k => k.id),
      outcome: "照会済み・法的結果未確定"
    });
  }
}
