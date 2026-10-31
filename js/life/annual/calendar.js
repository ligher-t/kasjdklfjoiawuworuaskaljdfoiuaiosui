// js/life/annual/calendar.js: ordered annual phase; see ANNUAL.md.
function advanceAnnualCalendar(s, services) {
  s.year++;
  s.mo = 0;
  services.ensureLocalityState(s);
  const areaChange = s.community.history.find(
    entry =>
      entry.year === s.year &&
      entry.types.some(id =>
        ["chernobog-direct", "londinium-direct", "kazdel-war", "siesta-transition"].includes(id)
      )
  );
  if (areaChange) {
    const place = s.local.city || s.res.n;
    services.L(
      `<span class="nt">${services.esc(place)}では、荷物の搬入、働き口、住居の確保などに変化が現れた。暮らしへの影響は世帯や区画によって異なる。</span>`
    );
    services.recordTrace("local-life-change", areaChange.types[0], {
      localityKey: s.community.key,
      model: "simulation",
      note: "原作の事件を背景とした生活影響の仮定"
    });
  }
}
