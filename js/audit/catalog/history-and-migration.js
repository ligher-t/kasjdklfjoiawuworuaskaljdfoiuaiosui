function validateHistoryAndMigration(W_, services, fx) {
  services.HIST.forEach((h, i) => {
    if (h.flag && !/^[a-z][a-z0-9_]*$/.test(h.flag)) W_.push(`年表[${i + 1}]: 世界イベントIDが不正`);
  });
  services.HIST.forEach((h, i) => {
    const w = "年表[" + (i + 1) + "]";
    if (
      h.infoScope &&
      !["public", "local_news", "local_rumor", "faction_only", "sealed"].includes(h.infoScope)
    )
      W_.push(w + ": 情報公開範囲が未定義");
    if (h.infoScope === "faction_only" && (!h.requiredFlag || !services.FLAG_REGISTRY[h.requiredFlag]))
      W_.push(w + ": 所属限定情報に必要なフラグが未定義");
    if (
      h.city &&
      (!Array.isArray(h.r) ||
        !h.r.some(region => services.SIM_TABLES.namedCities[region]?.includes(h.city)))
    )
      W_.push(w + ": 都市名が地域の登録都市に結びついていない");
    if (h.publicText != null && typeof h.publicText !== "string") W_.push(w + ": 公開要約が文字列でない");
    if (h.displayDate != null && (typeof h.displayDate !== "string" || !h.displayDate.trim()))
      W_.push(w + ": 表示用年代が文字列でない");
    if (!Number.isInteger(h.y) || h.y < services.BIRTH_YEAR_MIN) W_.push(w + ": 年アンカーが不正");
    if (h.conf && !services.DATA_GUIDE.confidence[h.conf])
      W_.push(w + ": 未知の確度ラベル「" + h.conf + "」");
    if (h.conf && h.conf !== "S" && !(h.references || []).length)
      W_.push(w + ": 根拠資料または仮定区分の参照がない");
    (h.references || []).forEach(ref => {
      if (!services.SETTING_SOURCES[ref]) W_.push(w + ": 未定義の資料ID「" + ref + "」");
    });
    if (!h.t) W_.push(w + ": 本文がない");
    if (h.e) fx(h.e, w + "の効果");
    if (h.r !== "all" && (!Array.isArray(h.r) || h.r.some(n => !services.REG.some(g => g.n === n))))
      W_.push(w + ": 未知の地域名");
  });
  services.WORLD_PRESSURES.forEach((p, i) => {
    const w = "地域圧力[" + (i + 1) + "]";
    if (!services.HIST.some(h => h.flag === p.id)) W_.push(w + ": 年表イベントとの接続がない");
    if (!Number.isInteger(p.from) || !Number.isInteger(p.to) || p.from > p.to || !Number.isFinite(p.war) || p.war < 1)
      W_.push(w + ": 年次窓または係数が不正");
    const hasFromMonth = Number.isInteger(p.fromMonth),
      hasToMonth = Number.isInteger(p.toMonth),
      hasMonthWindow = hasFromMonth && hasToMonth;
    if (
      hasFromMonth !== hasToMonth ||
      ((p.fromMonth != null || p.toMonth != null) &&
        (!hasMonthWindow || p.fromMonth < 1 || p.fromMonth > 12 || p.toMonth < 1 || p.toMonth > 12)) ||
      (hasMonthWindow && p.from === p.to && p.fromMonth > p.toMonth)
    )
      W_.push(w + ": 月次窓が不正");
    if (
      !p.dateConfidence ||
      !Object.prototype.hasOwnProperty.call(services.DATA_GUIDE.confidence, p.dateConfidence) ||
      !Array.isArray(p.sourceRefs) ||
      !p.sourceRefs.length ||
      !p.anchor ||
      !p.scope
    )
      W_.push(w + ": 年代確度・資料・アンカー・適用範囲が不完全");
    (p.sourceRefs || []).forEach(ref => {
      if (!services.SETTING_SOURCES[ref]) W_.push(w + ": 未定義の年表資料ID「" + ref + "」");
    });
    if (!p.regions.length || !p.regions.every(n => services.REG.some(g => g.n === n)))
      W_.push(w + ": 未知または空の地域名");
    if (
      p.cities != null &&
      (!Array.isArray(p.cities) ||
        !p.cities.length ||
        !p.cities.every(city => p.regions.some(region => services.SIM_TABLES.namedCities[region]?.includes(city))))
    )
      W_.push(w + ": 対象都市が未登録または対象地域に属していない");
  });
  Object.entries(services.MIGRATION_ROUTES).forEach(([from, routes]) => {
    if (!services.REG.some(r => r.n === from)) W_.push(`移動経路: 出発地域「${from}」が登録されていない`);
    const routeList = Array.isArray(routes) ? routes : [];
    if (!routeList.length) W_.push(`移動経路「${from}」に行先がない`);
    routeList.forEach(r => {
      if (!services.REG.some(g => g.n === r.n) || r.n === from)
        W_.push(`移動経路「${from}」に不正な行先「${r.n}」がある`);
    });
  });
  services.REG.forEach(r => {
    if (!services.MIGRATION_ROUTES[r.n]?.length) W_.push(`移動経路「${r.n}」が未登録`);
  });
}
