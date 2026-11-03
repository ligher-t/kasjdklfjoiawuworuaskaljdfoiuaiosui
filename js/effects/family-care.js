function applyParentMedicalEffects(e, s) {
  if (e.parentTreatment === 0 || e.parentTreatment === 1) {
    const parent = [s.par?.fa, s.par?.mo].find(x => x && !x.d && x.id === s.eventRelativeId);
    if (parent) setParentTreatment(s, parent, e.parentTreatment, TRACE_RESOLUTION?.id || "家族の判断");
  }
  if (TRACE_RESOLUTION?.id === "fam_infected" && e.fl?.parent_infected === 1) {
    const parent = [s.par?.fa, s.par?.mo].find(x => x && !x.d && x.inf && x.id === s.eventRelativeId);
    if (parent) parent.infectionKnown = 1;
  }
  if (e.parentTreatmentReview === 0 || e.parentTreatmentReview === 1) {
    const parent = [s.par?.fa, s.par?.mo].find(x => x && !x.d && x.id === s.eventRelativeId),
      ledger = s.house?.parentLedger;
    if (parent && ledger?.treatmentReviewDue?.parentId === parent.id) {
      if (e.parentTreatmentReview === 1) {
        parent.treatmentHistory || (parent.treatmentHistory = []);
        parent.treatmentHistory.push({ year: s.year, state: "reviewed", cause: "療養継続を本人が選択" });
        parent.treatmentHistory = parent.treatmentHistory.slice(-12);
        ledger.treatmentReviewNextYear = s.year + 2;
        ledger.treatmentAusterityUntil = s.year + 1;
        ledger.treatmentReviewDue = null;
      } else setParentTreatment(s, parent, 0, "療養費を賄えず、本人が通院の一時中断を選択");
    }
  }
  if (e.parentJobNotice === 1) {
    const parent = [s.par?.fa, s.par?.mo].find(x => x && !x.d && x.id === s.eventRelativeId);
    if (parent) {
      parent.knownJobId = parent.j;
      parent.knownJobChangeCount = (parent.jobHistory || []).length;
      parent.jobKnownYear = s.year;
    }
  }
  if (e.parentMoveNotice === 1) {
    const ledger = s.house?.parentLedger;
    if (ledger?.status === "tracked") {
      ledger.knownRegion = ledger.region;
      ledger.knownMoveCount = (ledger.moveHistory || []).length;
      ledger.moveKnownYear = s.year;
    }
  }
}

function applyHouseholdHealthEffects(e, s) {
  if (e.familyContribution != null) s.familyContribution = clamp(e.familyContribution, 0, 1);
  if (e.investmentType) s.investmentType = e.investmentType;
  if (e.mortalityCare) applyMortalityCare(e.mortalityCare);
  if (e.illnessStart) {
    s.illness = {
      kind: e.illnessStart,
      stage: 1,
      startedYear: s.year,
      reviewed: 0,
      treated: !!e.illnessTreated,
      causeTexts: ["病状が長引き、治療が間に合わず亡くなった", "症状が悪化し、療養を続ける中で亡くなった"]
    };
  }
  if (e.illnessReviewed && s.illness) s.illness.reviewed = 1;
  if (e.illnessTreated && s.illness) s.illness.treated = 1;
  if (e.residenceArrangement) {
    s.residenceArrangement = e.residenceArrangement;
    s.residenceHistory || (s.residenceHistory = []);
    s.residenceHistory.push({
      year: s.year,
      arrangement: e.residenceArrangement,
      householdSeparated: !!s.fl.household_separated,
      reason: e.residenceReason || TRACE_RESOLUTION?.id || "生活上の選択"
    });
    s.residenceHistory = s.residenceHistory.slice(-24);
  }
}

function applyWorkAndCareEffects(e, s, fromRegion) {
  // Older family/job events can terminate attendance. The course must follow
  // the same choice instead of remaining permanently enrolled in parallel.
  if (educationFullTime(s) && e.job > 0)
    educationEnd(s,"withdrawn","常勤就職へ転じたため学籍を終了",TRACE_RESOLUTION?.id||"employment-transition");
  if (e.fl?.sch === 0 && educationLive(s) &&
      ["primary","lower","upper"].includes(s.educationPath.stage))
    educationEnd(s,"withdrawn","家庭・生活上の判断により通学を終了",TRACE_RESOLUTION?.id||"school-exit");
  if ((e.res === 1 || e.fl?.frontier_contract || e.fl?.rhodes_landship || (e.home && e.home !== "移動都市" && s.home === "移動都市")) && educationLive(s)) {
    educationEnd(s,"withdrawn","生活圏移動・専従労働のため通学を終了",TRACE_RESOLUTION?.id||"relocation-exit");
    s.fl.sch = 0;
  }
  if (e.res === 1 || e.fl?.frontier_contract || e.fl?.rhodes_landship) {
    if (!s.residenceArrangement || s.residenceArrangement.startsWith("family_home_")) {
      s.residenceArrangement = "independent_rental";
      s.residenceHistory || (s.residenceHistory = []);
      s.residenceHistory.push({
        year: s.year,
        arrangement: "independent_rental",
        householdSeparated: true,
        reason: e.residenceReason || TRACE_RESOLUTION?.id || "拠点移動による独立"
      });
      s.residenceHistory = s.residenceHistory.slice(-24);
    }
    s.fl.household_separated = 1;
  }
  if (e.job != null) {
    if (s.job !== e.job && e.fl?.workplace_hazard == null) s.fl.workplace_hazard=0;
    s.job = e.job;
    s.workPayBonus = 0;
    if (e.job > 0) s.fl.retired = 0;
  }
  if (e.payBonus != null && s.job > 0 && !restricted(s))
    s.workPayBonus = clamp((s.workPayBonus || 0) + e.payBonus, 0, P("economy.maxJobPayBonus"));
  // Educational progress, enrolment and awards are different kinds of evidence.
  // Only a resolved event can change the educational record.
  const educationSource = TRACE_RESOLUTION?.id || null;
  if (e.fl?.sch === 1) recordEducationTransition(s, "general-school", "start", educationSource);
  if (e.fl?.sch === 0) recordEducationTransition(s, "general-school", "stop", educationSource);
  if (e.study) {
    const kind = e.study.startsWith("uni") ? "uni" : "voc",
      program = kind === "uni" ? "university" : "vocational",
      duration = P(kind === "uni" ? "education.universityYears" : "education.vocationalYears"),
      action = e.study.split("_")[1];
    if (action === "start") s.study = { kind, yearsPaid: 1, nextDue: s.year + 1, duration };
    else if (action === "advance" && s.study?.kind === kind) {
      s.study.yearsPaid++;
      s.study.nextDue = s.year + 1;
    } else if (action === "finish" || action === "stop") s.study = null;
    if (["start", "advance", "stop"].includes(action) ||
        (action === "finish" && e.fl?.[kind] === 1))
      recordEducationTransition(s, program, action, educationSource);
  }
  if (e.fl?.arts_enrolled === 1)
    recordEducationTransition(s, "arts-academy", "start", educationSource);
  if (e.fl?.arts_grad === 1)
    recordEducationTransition(s, "arts-academy", "finish", educationSource);
  else if (e.fl?.arts_enrolled === 0)
    recordEducationTransition(s, "arts-academy", "stop", educationSource);
  if (e.educationAction) educationApplyAction(s,e.educationAction);
  if (e.educationMigrationAction) educationMigrationApply(s,e.educationMigrationAction);
  if (typeof educationMigrationLinkLegacyLearning==="function")
    educationMigrationLinkLegacyLearning(s,e);
  if (e.familyCare === "parent") {
    const parentKeys = s.care?.parentKeys?.length ? s.care.parentKeys : ["fa", "mo"],
      target =
        ["fa", "mo"].find(key => s.par?.[key] && !s.par[key].d && s.par[key].id === s.eventRelativeId) ||
        parentKeys.find(key => s.par?.[key] && !s.par[key].d);
    if (!target) throw new Error("存命の親がいないため介護支援を開始できない");
    const parent = s.par[target],
      support = !!(parent.inf && parent.tx),
      contributor =
        e.familyCareSiblingContribution === 1
          ? familyCareCostShareSiblingCandidates(s).find(person => person.id === s.eventCareSiblingId)
          : null;
    if (e.familyCareSiblingContribution === 1 && !contributor)
      throw new Error("本人が家計を把握している別居きょうだいが見つからないため療養費を分担できない");
    s.familyCare = {
      target,
      plan: e.familyCarePlan || "direct",
      startedYear: s.year,
      yearsRemaining: 2,
      treatmentSupport: e.familyCareTreatmentSupport === 0 ? false : support,
      siblingContributorId: contributor?.id || null,
      siblingContributionPaidTotal: 0,
      treatmentPaidTotal: 0
    };
    recordFamilyCareHistory(s, "started", {
      target,
      plan: s.familyCare.plan,
      treatmentSupport: s.familyCare.treatmentSupport,
      treatmentStillActive: !!parent.tx,
      contributorSiblingId: contributor?.id || null,
      contributorSiblingName: contributor?.nm || null
    });
  } else if (e.familyCare === "end") s.familyCare = null;
  if (e.familyCareCapacityPlan) {
    const care = s.familyCare,
      parent = care && s.par?.[care.target];
    if (!care || !parent || parent.d || care.plan !== "direct")
      throw new Error("見直し対象の直接ケアがありません");
    const oldPlan = care.plan,
      newPlan = e.familyCareCapacityPlan;
    care.capacityReviewYear = s.year;
    if (newPlan === "end") {
      recordFamilyCareHistory(s, "capacity_ended", {
        target: care.target,
        plan: oldPlan,
        fromPlan: oldPlan,
        treatmentSupport: !!care.treatmentSupport,
        treatmentStillActive: !!parent.tx,
        reason: "本人の体調悪化を受け、直接担当を終了。親の療養や他の支援は別途継続"
      });
      s.familyCare = null;
    } else {
      if (!["direct", "network"].includes(newPlan)) throw new Error("親族ケアの見直し方式が不正");
      care.plan = newPlan;
      care.siblingContributorId = null;
      recordFamilyCareHistory(s, "capacity_review", {
        target: care.target,
        plan: newPlan,
        fromPlan: oldPlan,
        treatmentSupport: !!care.treatmentSupport,
        treatmentStillActive: !!parent.tx,
        reason:
          newPlan === "network"
            ? "体調に合わせて日々の用事を親族・近隣と分担"
            : "体調の負担を承知して直接ケアを継続"
      });
    }
  }
  if (e.familyCareReview === 1) {
    const history = s.familyCareHistory || [],
      lastEnd = history
        .slice()
        .reverse()
        .find(row => row.type === "period_ended"),
      target = ["fa", "mo"].find(key => s.par?.[key] && !s.par[key].d && s.par[key].id === s.eventRelativeId);
    if (lastEnd && target)
      recordFamilyCareHistory(s, "reviewed", {
        target,
        plan: s.familyCare?.plan || lastEnd.plan,
        treatmentSupport: !!s.familyCare?.treatmentSupport,
        treatmentStillActive: !!s.par[target].tx,
        reason: "終了後の支援について再相談"
      });
  }
  if (e.displacement) {
    if (e.displacement === "displaced")
      s.displacement = { status: "shelter", sinceYear: s.year, origin: fromRegion, resolvedYear: null };
    else {
      s.displacement = s.displacement || { sinceYear: s.year, origin: fromRegion };
      s.displacement.status = e.displacement;
      s.displacement.resolvedYear = s.year;
    }
  }
  if (Object.prototype.hasOwnProperty.call(e, "pet")) {
    s.pet = e.pet;
    if (e.pet) {
      s.petSinceYear = s.year;
      s.petCareUntil = s.year + rnd(P("economy.petLifeReviewMinYears"), P("economy.petLifeReviewMaxYears"));
      s.fl.pet_care_extended = 0;
    } else {
      s.petSinceYear = null;
      s.petCareUntil = null;
      s.fl.pet_care_extended = 0;
    }
  }
  if (e.sibContact) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (sibling) {
      sibling.knownParentSupportChangeCount = sibling.parentSupportChangeCount || 0;
      sibling.knownParentSupportStatus = sibling.parentSupportStatus || "none";
      sibling.knownParentSupportPaidTotal = sibling.parentSupportPaidTotal || 0;
      sibling.parentSupportKnownYear = s.year;
      sibling.parentSupportNoticeYear = null;
    }
  }
}
