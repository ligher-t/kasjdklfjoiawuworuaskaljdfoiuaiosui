// js/life/annual/family-payments.js: ordered annual phase; see ANNUAL.md.
function recordAnnualFamilyPayments(s, services, amounts) {
  const {
    costPm,
    spouseHouseholdContribution,
    spouseLivingCost,
    spouseCareCost,
    spouseSeparateSupport,
    spouseContactCost,
    adultParentTreatmentCost
  } = amounts;
  if (spouseContactCost > 0 && s.sp) {
    s.sp.separateContactPaidTotal = (s.sp.separateContactPaidTotal || 0) + spouseContactCost;
    s.sp.separateContactPaidYear = s.year;
    s.sp.separateContactPaidAmount = spouseContactCost;
    s.sp.separateContactHistory || (s.sp.separateContactHistory = []);
    s.sp.separateContactHistory.push({
      year: s.year,
      amount: spouseContactCost,
      region: services.spouseResidenceRegion(s).n,
      plan: s.sp.separateContact
    });
    s.sp.separateContactHistory = s.sp.separateContactHistory.slice(-16);
  }
  services.recordIndependentSiblingCareSupportPayments(s, costPm);
  if (spouseSeparateSupport > 0 && s.sp)
    services.recordSpouseSeparateSupportTransfer(s, spouseSeparateSupport);
  if (s.familyCare?.treatmentSupport && adultParentTreatmentCost > 0)
    s.familyCare.treatmentPaidTotal = (s.familyCare.treatmentPaidTotal || 0) + adultParentTreatmentCost;
  if (s.sp) {
    services.recordSpouseAnnualFinance(s, {
      income: services.spouseGrossAnnualIncome(s),
      contribution: spouseHouseholdContribution,
      support: spouseSeparateSupport,
      supportTransactionId: s.sp.pendingSupportTransactionId || null,
      living: services.spouseIndependentNonHousingExpense(s),
      housing: services.spouseIndependentHousingExpense(s),
      medical: services.spouseIndependentMedicalExpense(s),
      coveredLiving: spouseLivingCost,
      coveredMedical: spouseCareCost,
      relocation: s.sp.pendingRelocationCostForYear || 0,
      housingSetup: s.sp.pendingHousingSetupCostForYear || 0
    });
    delete s.sp.pendingRelocationCostForYear;
    delete s.sp.pendingHousingSetupCostForYear;
    delete s.sp.pendingSupportTransactionId;
  }
}
