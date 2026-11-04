// Ordered annual entry. The supplied state must be the current life.
function tick() {
  advanceCurrentLifeYear(currentLifeState(), ANNUAL_SERVICES);
}
function advanceCurrentLifeYear(s, services) {
  if(s.educationPath?.offeringId && !s.dead){
    s.educationYearClosing=true;
    try{
      educationSimulateAttendanceThrough(s,s.year,12);
      educationSettleCompletedAcademicYear(s,s.year);
    }finally{
      delete s.educationYearClosing;
    }
  }
  advanceJourneyThrough(s, s.year, 12);
  educationExpireCases(s,s.year+1);
  const a = ++s.age,
    t = s.t,
    f =
      a >= services.P("life.policyStartAge") && (!services.restricted(s) || [0, 1, 4].includes(s.f))
        ? s.f
        : 0,
    careEffect = a < services.P("life.careEffectEndAge") ? 1 : 0;
  let annualFlowRecorded = false;
  advanceAnnualCalendar(s, services);
  advanceAnnualRelationsAndAccess(s, services);
  educationSynchronizeDependents(s);
  advanceAnnualWellbeing(s, services, a, t, f, careEffect);
  advanceAnnualInfection(s, services, f);
  if (typeof educationAdvanceYear === "function") educationAdvanceYear(s);
  if (typeof advanceAnnualLanguageLearning === "function") advanceAnnualLanguageLearning(s, services, a);
  settleAnnualHouseholdBudget(s, services, a);
  annualFlowRecorded = applyAnnualPersonalBudget(s, services, a, t, f);
  recordAnnualWealthAndHistory(s, services, a, annualFlowRecorded);
  services.hist();
  if (s.dead) return;
  services.fin();
  if (!s.dead) {
    services.rd();
    services.sched();
    services.SV();
  }
}
