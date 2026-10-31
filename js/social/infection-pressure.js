const infectionSocialPressure = s => {
  const p = {
    ...(SIM_TABLES.oripathyPressure?.[s.res.n] ||
      SIM_TABLES.oripathyPressure?.default || {
        public: 0.45,
        work: 0.45,
        housing: 0.45,
        medical: 0.45,
        disclosure: 0.45
      })
  };
  /* ラテラーノの感染者圧力は地域仮説を全居住者へ適用する。
     手元の二次資料は市民資格・種族・感染後の扱いの差を示すが、各群の圧力値までは示さない。 */
  const locality =
    s.local?.kind?.includes("周縁") || s.local?.kind?.includes("避難・労働")
      ? 0.12
      : s.local?.kind?.includes("小規模") || s.local?.kind?.includes("辺境")
        ? 0.08
        : 0;
  const war =
    s.res.war >= P("condition.warRegionScale") ||
    worldPressure(s, "war") > P("condition.activeWorldPressureScale")
      ? 0.12
      : 0;
  /* 二次整理の「工業汚染・隔離政策の二重負担」を地域一律に適用しない。
     工業・採掘居住地だけへ向けた三つの弱い補正はすべてゲーム用仮定。 */
  if (s.res.n === "ヴィクトリア" && s.local?.kind === "工業・採掘地域") {
    p.work += P("infection.victoriaIndustrialWorkPressure");
    p.housing += P("infection.victoriaIndustrialHousingPressure");
    p.disclosure += P("infection.victoriaIndustrialDisclosurePressure");
  }
  return Object.fromEntries(
    Object.entries(p).map(([k, v]) => [
      k,
      clamp(v + locality + (k === "disclosure" ? war * 1.25 : war), 0, 1)
    ])
  );
};
