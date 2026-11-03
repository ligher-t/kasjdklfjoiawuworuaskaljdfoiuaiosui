// js/life/annual/personal-cash.js: ordered annual phase; see ANNUAL.md.
function settleAnnualPersonalCash(s, services, amounts, a) {
  const {
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
    adultParentTreatmentCost,
    adultParentTreatmentTravel,
    familyCareCost,
    coveredTreatmentCost,
    essentialWithCoverage,
    annualInsurance,
    veteranPension,
    inc
  } = amounts;
  let insuranceCost = 0;
  if (s.fl.insured && s.insurancePaidYear !== s.year) {
    if (s.cash + inc - essentialWithCoverage >= annualInsurance) {
      insuranceCost = annualInsurance;
      s.insurancePaidYear = s.year;
    } else {
      s.fl.insured = 0;
      s.insurancePaidYear = null;
      services.L(
        '<span class="bad">暮らしの支払いを済ませると、医療保険の更新料が足りなかった。契約が切れた。</span>'
      );
    }
  }
  const tc = s.fl.insured ? coveredTreatmentCost : tcGross,
    tcTravelPaid = services.infectionCareTravelPortion(tc, s),
    medicalTravel =
      tcTravelPaid +
      childCareTravel +
      spouseCareTravel +
      siblingCareSupportTravel +
      adultParentTreatmentTravel;
  const ex =
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
      insuranceCost,
    net = inc - ex - tc - adultParentTreatmentCost;
  let unfundedDeficit = 0;
  if (net >= 0) {
    if (typeof updateLoanContractStatuses === "function") updateLoanContractStatuses(s);
    const contractPaid = typeof settleContractDebt === "function" ? settleContractDebt(s, "personal", net) : 0;
    let remaining = net - contractPaid;
    if (s.unpaidExpenses > 0 && remaining > 0) {
      const payUnpaid = Math.min(s.unpaidExpenses, remaining);
      s.unpaidExpenses -= payUnpaid;
      remaining -= payUnpaid;
      if (s.unpaidExpenses === 0 && s.fl?.insolvent) {
        delete s.fl.insolvent;
      }
    }
    const d = Math.min(Math.max(0, (s.debt || 0) - loanContractOutstanding(s, "personal")), remaining);
    s.debt -= d;
    s.cash += remaining - d;
  } else {
    s.cash += net;
    if (s.cash < 0) {
      const deficit = -s.cash;
      s.cash = 0;
      const MAX_PERSONAL_DEBT = 30000000;
      const currentDebt = s.debt || 0;
      let addDebt = 0;
      if (currentDebt < MAX_PERSONAL_DEBT) {
        addDebt = Math.min(deficit, MAX_PERSONAL_DEBT - currentDebt);
        s.debt = currentDebt + addDebt;
      }
      unfundedDeficit = deficit - addDebt;
      if (unfundedDeficit > 0) {
        s.unpaidExpenses = (s.unpaidExpenses || 0) + unfundedDeficit;
        s.fl || (s.fl = {});
        s.fl.insolvent = 1;
      }
      if (currentDebt >= MAX_PERSONAL_DEBT || unfundedDeficit > 0) {
        s.h = Math.max(0, (s.h || 0) - 2);
        s.p = Math.max(0, (s.p || 0) - 3);
        if (s.fl?.tx && tc > 0) {
          s.fl.tx = 0;
        }
      }
    }
  }
  const supportIncome =
      s.fl.retired || (!s.job && a >= services.P("economy.employmentAgeLimit"))
        ? Math.max(
            0,
            inc - childHouseholdIncome - spouseHouseholdContribution - veteranPension
          )
        : 0,
    annualFlow = {
      year: s.year,
      income: {
        wages: Math.max(
          0,
          inc - supportIncome - childHouseholdIncome - spouseHouseholdContribution - veteranPension
        ),
        children: childHouseholdIncome,
        spouse: spouseHouseholdContribution,
        support: supportIncome,
        veteranPension
      },
      expense: {
        living: baseExpense,
        spouseLiving: spouseLivingCost,
        spouseSeparateContact: spouseContactCost,
        medical: tc - tcTravelPaid,
        medicalTravel,
        insurance: insuranceCost,
        hobby: hobbyCost,
        pet: petCost,
        children: childCost - childCareTravel - childHousingCost,
        childHousing: childHousingCost,
        childEducation: childStudyCost,
        childRemittance: childRemittanceCost,
        divorceChildSupport: divorceChildSupportCost,
        spouseCare: spouseCareCost - spouseCareTravel,
        spouseSeparateSupport,
        parentTreatment: adultParentTreatmentCost - adultParentTreatmentTravel,
        siblingCareSupport: siblingCareSupportCost - siblingCareSupportTravel,
        familyCare: familyCareCost,
        ...(unfundedDeficit > 0 ? { unfundedDeficit } : {})
      },
      net
    };
  const educationTuition=educationAnnualOutflow(s,s.year,"personal");
  if(educationTuition){
    annualFlow.expense.education = educationTuition;
    annualFlow.net -= educationTuition;
  }
  const arrangement = s.residenceArrangement,
    inFamilyHome =
      !s.fl?.household_separated &&
      (!arrangement ||
        arrangement === "legacy_unknown" ||
        (typeof arrangement === "string" && arrangement.startsWith("family_home_"))),
    familyHouseholdActive = inFamilyHome && s.house?.flow?.year === s.year;
  if (familyHouseholdActive && s.familyContribution > 0) {
    const house = s.house || (s.house = { cash: 0, debt: 0, inc: 0, exp: 0 });
    const contribution = Math.min(s.cash, inc * s.familyContribution);
    s.cash -= contribution;
    house.cash += contribution;
    house.inc += contribution;
    annualFlow.expense.familyContribution = contribution;
    annualFlow.net -= contribution;
    house.flow || (house.flow = { year: s.year, income: {}, expense: {}, net: 0 });
    house.flow.income.protagonistContribution = (house.flow.income.protagonistContribution || 0) + contribution;
    house.flow.net += contribution;
  }
  // Household costs funded from pre-existing personal savings earlier in the year
  // must also appear on the protagonist's own annual ledger.
  const reserveContribution = s.house?.flow?.year === s.year
    ? s.house.flow.income?.protagonistReserve || 0 : 0;
  if (reserveContribution > 0) {
    annualFlow.expense.familyContribution = (annualFlow.expense.familyContribution || 0) + reserveContribution;
    annualFlow.net -= reserveContribution;
  }
  s.flow = annualFlow;
  return { tc, ex, annualFlow };
}
