// js/life/annual/wellbeing.js: ordered annual phase; see ANNUAL.md.
function annualDebtMoodPenalty(s, services) {
  const netDebt = Math.max(0, (s.debt || 0) - (s.cash || 0));
  if (!netDebt) return 0;
  const annualCapacity = Math.max(
    1,
    s.inc || 0,
    services.P("economy.minimumExpenseBase") * (s.res.pm || 1) * (s.priceIndex || 1)
  );
  return Math.min(3, Math.log1p(netDebt / annualCapacity)) * services.P("mood.debtPenalty");
}

function annualHealthMoodPenalty(s, services) {
  const severity = Math.min(1, Math.max(0, (30 - s.h) / 30));
  return severity * services.P("mood.healthPenalty");
}

function advanceAnnualWellbeing(s, services, a, t, f, careEffect) {
  s.h = services.clamp(
    s.h +
      (a / s.r.lm < services.P("life.recoveryAgeScale")
        ? (services.P("health.recoveryTarget") - s.h) * services.P("health.recoveryRate")
        : 0) -
      (a / s.r.lm > services.P("life.recoveryAgeScale")
        ? (a / s.r.lm - services.P("life.recoveryAgeScale")) * services.P("health.declineRate")
        : 0) -
      (s.w.i < services.P("condition.povertyWealthIndex") ? services.P("health.povertyDrift") : 0) -
      (s.inf ? s.ob / services.P("health.infectionLoad") : 0) +
      (s.care.support - 0.5) * services.P("health.careSupport") * careEffect +
      (s.care.stability - 0.5) * services.P("health.careStability") * careEffect -
      Math.max(0, s.local.hazard - services.P("health.hazardThreshold")) *
        services.P("health.hazardPenalty") +
      (s.fl.disaster_displaced || s.fl.war_displaced || s.fl.kazdel_displaced
        ? services.P("health.displacementDrift")
        : 0) +
      (f == 4 ? services.P("health.restBenefit") : 0) -
      (f == 2 ? services.P("health.workPenalty") : 0) -
      (f == 8 ? services.P("health.riskyWorkPenalty") : 0) +
      (services.R() - services.P("health.randomBias")) * services.P("health.randomDrift")
  );
  services.advanceIllnessState(s);
  services.advanceSocialLearning(s);
  const moodParts=[
    (services.P("mood.equilibrium")-s.p)*services.P("mood.reversion"),
    (services.R()-0.5)*services.P("mood.randomDrift"),
    (t.p||0)*services.P("traits.moodScale"),
    (s.care.support-0.5)*services.P("mood.careSupport")*careEffect,
    (s.care.stability-0.5)*services.P("mood.careStability")*careEffect,
    -(s.inf&&s.ob>services.P("mood.infectionThreshold")?services.P("mood.infectionPenalty"):0),
    -(s.rl<services.P("mood.isolationThreshold")?services.P("mood.isolationPenalty"):0),
    f==4?services.P("mood.restBenefit"):0,
    -(f==2?services.P("mood.workPenalty"):0),
    -(f==6?services.P("mood.frugalPenalty"):0),
    -annualHealthMoodPenalty(s,services),
    -(a>services.P("life.workStartAge")?annualDebtMoodPenalty(s,services):0),
    f==7?services.P("mood.familyBenefit"):0,
    !services.restricted(s)&&(services.hobbyCount(s)||s.pet)?services.P("economy.hobbyMoodBenefit"):0
  ];
  s.p=services.clamp(s.p+moodParts.reduce((sum,delta)=>sum+wellbeingDelta(s,'p',delta),0));
  services.annualEducationAndRelationships(s, f, t);
}
