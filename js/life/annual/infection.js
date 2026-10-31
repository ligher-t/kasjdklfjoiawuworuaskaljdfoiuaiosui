// js/life/annual/infection.js: ordered annual phase; see ANNUAL.md.
function advanceAnnualInfection(s, services, f) {
  const annualExposureChance = services.oriAnnualChance(s);
  if (!s.inf && services.R() < annualExposureChance) {
    services.recordInfectionPrior(s, "annual-exposure");
    const before = services.HL && !services.CAPTURE_TRACE ? null : services.traceState(s),
      setting = services.oriSuspectedSetting(s);
    services.initializeInfection(s);
    s.fl.dg = 0;
    s.infection = {
      year: s.year,
      cause: "具体的な感染経路は特定できない",
      basis: "annual-risk-estimate",
      suspectedSetting: setting.label,
      exposureCategory: setting.code,
      diagnosedYear: null
    };
    const ori = services.oriState(s);
    ori.reviewDueYear = s.year + services.P("infection.diagnosticReviewYears");
    services.oriRecord(s, "model-infection", "源石に接する機会を年次モデルで推計。個々の接触事実は未確認", {
      certainty: "game-model",
      category: setting.code
    });
    services.L(
      '<span class="bad">体調に気がかりな変化が現れた。鉱石病かどうかはまだ分からず、診察を受けるか考えた。</span>'
    );
    services.recordTrace(
      "infection-onset",
      "annual-exposure",
      { basis: "annual-risk-estimate", suspectedSetting: setting.label, diagnosed: false },
      before
    );
  }
  if (s.inf && !s.fl.dg) {
    const ori = services.oriState(s);
    if (
      services.R() < services.P("infection.screeningChance") * (0.5 + s.local.access * 0.5) ||
      (ori.reviewDueYear != null && ori.reviewDueYear <= s.year && services.R() < 0.32)
    ) {
      s.fl.dg = 1;
      s.infection || (s.infection = { year: s.year, cause: "接触経路不明", basis: "event-unclassified" });
      s.infection.diagnosedYear = s.year;
      s.infection.diagnosisBasis = "年次の診察・検査機会（ゲーム上の仮定）";
      ori.reviewDueYear = null;
      services.oriRecord(s, "diagnosis", "検査で鉱石病と診断された", { certainty: "model-diagnostic" });
      services.L(
        '<span class="bad">体調の変化について受けた検査で、鉱石病の診断が告げられた。感染に至った接触経路は分かっていない。</span>'
      );
    }
  }
  if (s.inf)
    s.ob = Math.min(
      services.P("infection.terminalThreshold"),
      s.ob +
        services.R() *
          services.P("infection.annualProgressBase") *
          (s.ac ? services.P("infection.acuteProgressScale") : 1) *
          (s.fl.tx ? services.P("infection.treatmentProgressScale") : 1) *
          (f == 5 ? services.P("infection.artsProgressScale") : 1) *
          (services.J[s.job].ex ? services.P("infection.occupationProgressScale") : 1)
    );
  services.advanceMortalityState(s);
}
