// health-and-economy: original rule order and preparation timing are preserved.
function appendHealthAndEconomyTags(s, services, on) {
  on((s.oripathyExposure?.protectionUntilYear ?? -1) >= s.year, "源石防護対策を実施中");
  on(s.inf && s.ob >= services.helpers.P("condition.infectionDiagnosisMin") && !s.fl.dg, "診断待ち");
  on(s.fl.dg, "感染診断済");
  on(!s.inf, "非感染");
  on(s.fl.tx, "治療中");
  on(s.fl.hid, "隠蔽");
  on(s.debt > 0, "借金");
  on(services.helpers.inSharedHousehold(s) && s.house?.debt > 0, "家計負債");
  on(s.w.i < services.helpers.P("condition.povertyWealthIndex"), "貧困");
  on(services.helpers.householdStrained(s), "家計逼迫");
  on(s.w.i >= services.helpers.P("condition.highWealthIndex"), "裕福");
  on(s.cash > services.helpers.P("condition.wealthAvailableCash"), "資金余裕");
  on((s.investment || 0) > services.helpers.P("condition.wealthAvailableCash"), "投資資産に余裕");
}
