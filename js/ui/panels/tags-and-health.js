function renderTagsAndHealthPanel(s, services) {
  renderKnownStatusDetails(s, services.$("tg"));
  services.$("mortality-status").innerHTML = services.mortalityStatusMarkup(s);
  services.$("mortality-history").innerHTML =
    services.mortalityState(s).history
      .filter(x => x.kind !== "oripathy" || s.fl?.dg)
      .slice(-25)
      .reverse()
      .map(x => `<div class="ledger">${services.esc(String(x.year))}年・${services.esc(x.text)}</div>`)
      .join("") || "まだ経過の記録はありません。";
}
