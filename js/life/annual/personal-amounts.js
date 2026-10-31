// js/life/annual/personal-amounts.js: ordered annual phase; see ANNUAL.md.
function prepareAnnualPersonalBudget(s, services, a, t, f) {
  if (
    !s.job &&
    !s.lifeRecord?.careerChanges?.length &&
    !s.fl.retired &&
    !services.restricted(s) &&
    a < services.P("economy.employmentAgeLimit") &&
    !educationSchoolOrDecision(s) &&
    !(s.fl.sch && a < services.P("life.schoolEnrollmentEndAge")) &&
    !(s.educationPath?.completed?.includes("upper") && a <= 21 && !s.sn?.car)
  ) {
    s.job = services.pickStarterJob(s);
    services.recordCareerChange(s, 0, s.job, null);
  }
  services.reconcileWorkContract(s);
  services.reconcileEquity(s);
  const j = services.J[s.job],
    pm = s.res.pm,
    householdCoversPersonalCosts = a < services.householdEndAge(s) && services.inSharedHousehold(s),
    costPm = pm * s.priceIndex * services.localityLivingMultiplier(s),
    childFinance = services.childHouseholdFinances(s, costPm, pm),
    childHouseholdIncome = childFinance.income,
    spouseHouseholdContribution = services.spouseHouseholdIncome(s),
    siblingCareSupportCost = services.independentSiblingCareSupportExpense(s, costPm),
    isRhodesStaff =
      [28, 29, 30, 31, 33, 34].includes(s.job) ||
      (s.lifeRecord?.affiliations?.some(a => a.id === "rhodes-staff" && ["active", "crisis"].includes(a.status)) ?? false),
    isRhodesCare =
      !isRhodesStaff &&
      (s.lifeRecord?.affiliations?.some(a => a.id === "rhodes-care" && ["active", "crisis"].includes(a.status)) ?? false),
    tcGross =
      s.inf && s.fl.tx && !householdCoversPersonalCosts
        ? (isRhodesStaff
            ? 0
            : services.P("economy.treatmentCostBase") *
              s.res.md *
              (1 + services.infectionSocialPressure(s).medical * 0.45) *
              services.infectionCareTravelCostScale(s) *
              (1 +
                (s.ob < services.P("infection.stageOneEnd")
                  ? 0
                  : s.ob < services.P("infection.stageTwoEnd")
                    ? 1
                    : 2)) *
              s.priceIndex *
              (isRhodesCare ? 0.1 : 1))
        : 0,
    siblingCareSupportTravel = services.infectionCareTravelPortion(siblingCareSupportCost, s),
    incBase = s.fl.detained
      ? 0
      : s.fl.segregated
        ? s.fl.seg_work
          ? services.P("economy.segregationWorkAnnualPay") * pm
          : 0
        : !s.fl.retired && (a < services.P("economy.employmentAgeLimit") || s.job > 0)
          ? j.pay *
            pm *
            services.contractIncomeFactor(s) * services.personalWorkCapacity(s) *
            (1 + (s.workPayBonus || 0)) *
            (1 + s.k / services.P("economy.knowledgeIncomeScale")) *
            (t.inc || 1) *
            (s.study && !s.study.suspended
              ? services.P(
                  s.study.kind === "uni" ? "economy.universityIncomeScale" : "economy.vocationalIncomeScale"
                )
              : 1) *
            (1 + s.ar / services.P("economy.artsIncomeScale")) *
            (1 - services.employmentDiscriminationPenalty(s)) *
            (f == 2 ? services.P("economy.workIncomeScale") : 1) *
            (f == 4 ? services.P("economy.restIncomeScale") : 1) *
            (f == 7 ? services.P("economy.familyIncomeScale") : 1) *
            (f == 8 ? services.P("economy.riskyWorkIncomeScale") : 1) *
            (s.fl.reduced_work ? 0.65 : 1) *
            (1 + (s.priceIndex - 1) * 0.65)
          : pm *
            services.P("economy.retirementIncomeBase") *
            (s.w.i < services.P("condition.povertyWealthIndex") ? 1 : 0),
    /* 生活費の設定値は収入と独立していたため、収入を超える部分を機械的に固定しない。これはゲーム上の上限仮定。 */
    baseExpense = householdCoversPersonalCosts
      ? 0
      : s.fl.detained
      ? services.P("economy.detainedPersonalAnnualCost") * costPm
      : s.fl.segregated
        ? services.P("economy.segregationLivingAnnualCost") * costPm
        : Math.max(
            services.P("economy.minimumExpenseBase") * costPm,
            services.EXP[s.w.i] *
              costPm *
              (f == 6 ? services.P("economy.frugalExpenseScale") : 1) *
              ((s.debtPlan?.action === "frugal" && s.debt > 0) ? 0.9 : 1) *
              (s.fl.sch && a < services.P("life.schoolEnrollmentEndAge")
                ? services.P("economy.studentExpenseScale")
                : 1) *
              (!s.job && (s.cash || 0) < services.EXP[s.w.i] * costPm ? 0.65 : 1)
          ) * (isRhodesStaff ? 0.35 : [35, 36, 37].includes(s.job) ? 1.15 : 1),
    spouseLivingCost = services.spouseLivesWithProtagonist(s)
      ? baseExpense * services.P("economy.spouseLivingExpenseShare")
      : 0,
    petCost = s.pet ? services.petCostBase(s.pet) * costPm : 0,
    hobbyCost = services.restricted(s) ? 0 : services.hobbyAnnualExpense(s, costPm),
    childCost = childFinance.living,
    childCareTravel = childFinance.careTravel,
    childHousingCost = childFinance.housing,
    childStudyCost = childFinance.education,
    childRemittanceCost = childFinance.remittance,
    divorceChildSupportCost = childFinance.divorceSupport,
    spouseCareCost =
      s.sp && !s.sp.d && services.spouseLivesWithProtagonist(s) && s.sp.inf && s.sp.tx
        ? services.P("economy.spouseInfectionCareAnnualCost") *
          costPm *
          (1 + services.infectionSocialPressure(s).medical * 0.3) *
          services.infectionCareTravelCostScale(s)
        : 0,
    spouseSeparateSupport = services.spouseSeparateSupportCost(s),
    spouseContactCost = services.spouseSeparateContactAnnualCost(s),
    spouseCareTravel = services.infectionCareTravelPortion(spouseCareCost, s),
    parentForCare = s.familyCare?.target ? s.par?.[s.familyCare.target] : null,
    adultParentTreatmentCost = services.parentTreatmentShare(s, parentForCare),
    adultParentTreatmentTravel = services.parentTreatmentTravel(s, parentForCare, adultParentTreatmentCost),
    familyCareCost = s.familyCare
      ? services.P(
          s.familyCare.plan === "shared"
            ? "family.parentCareSharedAnnualCost"
            : s.familyCare.plan === "network"
              ? "family.parentCareNetworkAnnualCost"
              : "family.parentCareDirectAnnualCost"
        ) * costPm
      : 0,
    coveredTreatmentCost = tcGross * services.P("economy.columbiaInsuranceTreatmentCostScale"),
    essentialWithCoverage =
      baseExpense +
      spouseLivingCost +
      petCost +
      hobbyCost +
      childCost +
      childStudyCost +
      childRemittanceCost +
      divorceChildSupportCost +
      spouseCareCost +
      spouseSeparateSupport +
      spouseContactCost +
      siblingCareSupportCost +
      familyCareCost +
      adultParentTreatmentCost +
      coveredTreatmentCost,
    annualInsurance = services.P("economy.columbiaInsuranceAnnualCost") * costPm,
    veteranPension = s.fl.military_pension ? services.P("economy.veteranPensionAnnual") * costPm : 0,
    rhinePatentGrant = [38, 39, 40].includes(s.job) && !services.restricted(s)
      ? (s.job === 40 ? 1200000 : 500000) * pm
      : 0,
    inc =
      incBase *
        services.familyCareEarningsScale(s, incBase) *
        (s.job > 0 && s.job < 28 && !services.restricted(s)
          ? services.personalWorkEarningsMultiplier(s)
          : 1) +
      childHouseholdIncome +
      spouseHouseholdContribution +
      veteranPension +
      rhinePatentGrant;
  return {
    costPm,
    childHouseholdIncome,
    spouseHouseholdContribution,
    siblingCareSupportCost,
    tcGross,
    siblingCareSupportTravel,
    baseExpense,
    spouseLivingCost,
    petCost,
    hobbyCost,
    childCost,
    childCareTravel,
    childHousingCost,
    childStudyCost,
    childRemittanceCost,
    divorceChildSupportCost,
    spouseCareCost,
    spouseSeparateSupport,
    spouseContactCost,
    spouseCareTravel,
    parentForCare,
    adultParentTreatmentCost,
    adultParentTreatmentTravel,
    familyCareCost,
    coveredTreatmentCost,
    essentialWithCoverage,
    annualInsurance,
    veteranPension,
    inc
  };
}
