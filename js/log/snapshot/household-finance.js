function traceHouseholdFinance(s, services) {
  return {
    spouseHouseholdArrangement: s.sp
      ? {
          id: s.sp.id,
          mode: s.sp.householdArrangement || "unrecorded",
          decisionYear: s.sp.arrangementYear ?? null,
          reviewYear: s.sp.arrangementReviewYear ?? null,
          annualContribution: services.spouseHouseholdIncome(s)
        }
      : null,
    householdFlow:
      s.house?.flow && (!s.fl?.household_separated || s.house.parentLedger?.status === "tracked")
        ? {
            ...s.house.flow,
            income: { ...(s.house.flow.income || {}) },
            expense: { ...(s.house.flow.expense || {}) }
          }
        : null,
    livingParents: [s.par?.fa, s.par?.mo].filter(p => p && !p.d).length,
    pet: s.pet || null,
    petYears: s.pet ? Math.max(0, s.year - (s.petSinceYear ?? s.year)) : null,
    petCareExtended: !!s.fl?.pet_care_extended,
    cash: s.cash,
    debt: s.debt,
    investment: s.investment || 0,
    annualIncome: s.inc,
    annualExpense: s.exp,
    householdCash: s.house?.cash ?? null,
    householdDebt: s.house?.debt ?? null
  };
}
