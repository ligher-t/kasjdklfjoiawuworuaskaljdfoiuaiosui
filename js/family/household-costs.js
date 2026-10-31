const siblingForEvent = (s, id) => {
  if (id === "family_sibling_bereavement") return siblingDeathNoticeTarget(s);
  const sibs = siblingsOf(s).filter(x => !x.d);
  if (id === "family_sibling_parent_support_conference") {
    const target = s.siblingParentSupportConference?.initiatorSiblingId;
    return sibs.find(x => x.id === target) || null;
  }
  if (id === "family_sibling_exposure_followup") {
    return (
      sibs
        .filter(
          x => x.exposurePending && Number.isFinite(x.exposureReviewYear) && x.exposureReviewYear <= s.year
        )
        .sort((a, b) => a.exposureReviewYear - b.exposureReviewYear)[0] || null
    );
  }
  if (id === "family_sibling_reconnect") {
    return (
      sibs
        .filter(
          x =>
            x.contactState === "ended" &&
            Number.isFinite(x.reconnectInviteYear) &&
            x.reconnectInviteYear <= s.year
        )
        .sort((a, b) => a.reconnectInviteYear - b.reconnectInviteYear)[0] || null
    );
  }
  if (id === "family_sibling_parent_support_news")
    return (
      sibs
        .filter(
          x =>
            x.independentSinceYear &&
            x.parentSupportChangeCount > (x.knownParentSupportChangeCount || 0) &&
            x.contactState !== "ended"
        )
        .sort((a, b) => (a.parentSupportNoticeYear || s.year) - (b.parentSupportNoticeYear || s.year))[0] ||
      null
    );
  if (id === "family_sibling_contact") {
    const grown = sibs.filter(
        x =>
          x.independentSinceYear &&
          (x.contactState !== "ended" || x.careSupportAnnual > 0) &&
          s.year - x.by >= P("life.adultStartAge")
      ),
      news = grown
        .filter(x => x.contactState !== "ended")
        .find(
          x =>
            (x.jobHistory?.length || 0) > (x.knownJobChangeCount || 0) ||
            (x.moveHistory?.length || 0) > (x.knownMoveCount || 0) ||
            (Number.isFinite(x.familyNoticeYear) &&
              x.familyNoticeYear > (x.knownFamilyYear || x.independentSinceYear)) ||
            x.parentSupportChangeCount > (x.knownParentSupportChangeCount || 0)
        );
    return (
      news || grown.find(x => !Number.isFinite(x.contactReviewYear) || x.contactReviewYear <= s.year) || null
    );
  }
  if (id === "family_sibling_exposure")
    return sibs.find(x => s.year - x.by >= 18 && !x.inf && !x.exposurePending) || null;
  if (id === "family_sibling_independence")
    return (
      sibs.find(
        x =>
          s.year - x.by >= 16 &&
          !x.independentSinceYear &&
          (!x.independenceDiscussedYear || s.year - x.independenceDiscussedYear >= 5)
      ) || null
    );
  if (id === "family_sibling_infection")
    return (
      sibs.find(
        x => x.inf && x.infKnown && !x.independentSinceYear && !Number.isFinite(x.infectionDiscussedYear)
      ) || null
    );
  return sibs[0] || null;
};
const childIsSupported = (s, child) => {
  if (!child || child.d) return false;
  const age = s.year - child.by;
  return age < 18 || ["supported", "study", "working"].includes(child.householdStatus);
};
function formerSpouseForChild(s, child) {
  return (
    (s.relationshipHistory || []).find(
      person => person?.ending === "離婚" && person.id === child?.otherParentId
    ) || null
  );
}
function childResidencePlanTarget(s) {
  return (
    (s.kids || [])
      .filter(child => {
        const former = formerSpouseForChild(s, child);
        return (
          !child.d &&
          s.year - child.by < P("life.adultStartAge") &&
          former &&
          !(formerSpouseDeathKnown(former) && child.householdResidencePlan === "self") &&
          Number.isFinite(child.householdResidenceReviewYear) &&
          child.householdResidenceReviewYear <= s.year
        );
      })
      .sort(
        (a, b) =>
          a.householdResidenceReviewYear - b.householdResidenceReviewYear ||
          String(a.id).localeCompare(String(b.id))
      )[0] || null
  );
}
function childResidenceCostShare(s, child) {
  if (!child) return 1;
  return (
    { self: 1, former_support: 0, former: 0, shared: 0.5, unresolved: 1 }[child.householdResidencePlan] ?? 1
  );
}
// The source does not establish child-support law or prices. Apply the game's existing regional index to the recorded divorce-time region; shared residence is an explicit arithmetic-mean assumption, not Terra-wide canon.
function childResidenceEconomicIndex(s, child, key = "pm", plan = child?.householdResidencePlan) {
  const own = s.res?.[key] || 1,
    former = formerSpouseForChild(s, child),
    other =
      REG.find(region => region.n === (former?.knownResidenceRegion || former?.residenceRegion))?.[key] ||
      own;
  if (plan === "former" || plan === "former_support") return other;
  if (plan === "shared" && former) return (own + other) / 2;
  return own;
}
function divorceChildSupportAnnualCost(s, child, plan = "former_support") {
  return (
    P("economy.divorcedChildSupportAnnualCost") *
    childResidenceEconomicIndex(s, child, "pm", plan) *
    (s.priceIndex || 1)
  );
}
function childResidencePlanLabel(plan, age = 0) {
  if (plan === "former_support" && age >= P("life.adultStartAge"))
    return "主な生活先は元配偶者側（未成年期の任意支援は終了）";
  return (
    {
      self: "主な生活先は本人の家",
      former: "主な生活先は元配偶者側",
      former_support: "元配偶者側を主な生活先として任意支援中",
      shared: "二つの家を行き来",
      unresolved: "生活先未確定・現行家計で見込み"
    }[plan] || "離婚後の生活先未記録"
  );
}
function spouseResidenceRegion(s) {
  return REG.find(region => region.n === s.sp?.residenceRegion) || s.res;
}
function spouseInfectionHousingPressure(s) {
  const region = spouseResidenceRegion(s).n;
  return (
    SIM_TABLES.oripathyPressure?.[region]?.housing ?? SIM_TABLES.oripathyPressure?.default?.housing ?? 0.46
  );
}
function spouseKnownResidenceRegion(s) {
  return REG.find(region => region.n === s.sp?.knownResidenceRegion) || spouseResidenceRegion(s);
}
function spouseLivesWithProtagonist(s) {
  if (!s.sp || s.sp.d) return false;
  if (s.residenceBase && s.sp.residenceBaseId !== s.residenceBase.id) return false;
  if (s.sp.sharesHousehold === false) return false;
  return spouseResidenceRegion(s).n === s.res.n;
}
function spouseGrossAnnualIncome(s) {
  const spouse = s.sp,
    job = Number.isInteger(spouse?.j) ? J[spouse.j] : null,
    region = spouseResidenceRegion(s);
  if (!spouse || spouse.d || !job || spouseEmploymentStatus(spouse) !== "employed") return 0;
  return (
    Math.max(0, job.pay) *
    region.pm *
    (1 + ((s.priceIndex || 1) - 1) * 0.65) *
    spouseHealthWorkCapacity(spouse, s.year)
  );
}
function spouseHouseholdIncome(s) {
  const spouse = s.sp,
    arrangement = spouse?.householdArrangement,
    share =
      arrangement === "shared"
        ? P("economy.spouseSharedHouseholdIncomeShare")
        : arrangement === "separate"
          ? P("economy.spouseSeparateHouseholdIncomeShare")
          : 0;
  if (
    !share ||
    (Number.isInteger(spouse?.contributionPauseUntilYear) && s.year <= spouse.contributionPauseUntilYear)
  )
    return 0;
  return spouseGrossAnnualIncome(s) * share;
}
