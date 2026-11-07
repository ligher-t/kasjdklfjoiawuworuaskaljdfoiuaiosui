function renderLocalityPanel(s, services) {
  renderTravelControls(s, services);
  const regionMetrics = services.localityStateView(s);
  const meter = services.document.getElementById("locality-meter");
  if (meter && regionMetrics)
    meter.innerHTML = services.localityAxes
      .map(
        axis =>
          `<div class="region-meter"><span>${services.esc(services.LOCALITY_MODEL.axes[axis])}</span><i aria-hidden="true"><b style="width:${Math.round(regionMetrics[axis] * 100)}` +
          `%"></b></i><em>${Math.round(regionMetrics[axis] * 100)}</em></div>`
      )
      .join("");
  services.setRecordMarkup(services.$("facility-people"), services.recordLinesMarkup(services.facilityPeopleSummary(s)));
  services.$("facility-people-history").innerHTML =
    (s.facilityPeopleContacts || [])
      .slice(-12)
      .map(x => `<div class="ledger">${services.esc(x.year + "年 " + x.description)}</div>`)
      .join("") || "個人との交流履歴はまだありません。";
  if (services.document.getElementById("person-tie-summary"))
    services.setRecordMarkup(services.$("person-tie-summary"), services.recordLinesMarkup(services.personTieSummary(s)));
  if (services.document.getElementById("close-knowledge"))
    services.setRecordMarkup(services.$("close-knowledge"), services.recordLinesMarkup(services.closeKnowledgeSummary(s)));
  services.setRecordMarkup(services.$("facility-meter"), services.recordLinesMarkup(services.facilitySummary(s), "／"));
  const localFacilities = Object.values(services.ensureLocalityState(s)?.facilities || {});
  services.$("facility-history").innerHTML =
    [
      ...(s.siteAffiliationHistory || [])
        .slice(-5)
        .map(
          h =>
            `${h.year}年 ${h.kind}：${
              h.action === "transferred"
                ? "変更先を確定"
                : h.action === "ended"
                  ? "以前の施設との関係を終了"
                  : "その年の利用先を記録"
            }`
        ),
      ...localFacilities.flatMap(f => [
        ...f.history.map(
          h =>
            `${h.year}年 ${f.label}：${services.FACILITY_MODEL.states[h.from]} → ${services.FACILITY_MODEL.states[h.to]}`
        ),
        ...f.contacts.map(c => `${c.year}年 ${f.label}：${c.description}`)
      ])
    ]
      .slice(-12)
      .map(t => `<div class="ledger">${services.esc(t)}</div>`)
      .join("") || "この生活圏での施設の変化・問い合わせ記録はまだありません。";
}
