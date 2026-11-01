const communityMixShare = {
  "移動都市の居住区": 0.32,
  "移動都市の周縁区": 0.48,
  "移動都市の避難・労働区画": 0.68,
  "固定都市の街区": 0.42,
  "工業・採掘地域": 0.62,
  "小規模な定住地": 0.12,
  "辺境・移動の多い居住地": 0.3
};
const allowedHomesForRegion = region =>
  REGIONAL_RESIDENCE_PROFILES?.[region]?.allowedHomes || ["移動都市", "固定集落"];
const siestaMobilePlatformAvailable = (year, month) =>
  year > 1097 || (year === 1097 && Number.isInteger(month) && month >= 8);
const chooseHomeForRegion = (
  region,
  draw = R(),
  mobileShare = P("birth.mobileCityShare"),
  year = Number.isInteger(S?.year) ? S.year : START,
  month = Number.isInteger(S?.mo) ? S.mo : null
) => {
  if (region === "シエスタ" && !siestaMobilePlatformAvailable(year, month)) return "固定集落";
  const allowed = allowedHomesForRegion(region);
  if (allowed.length === 1) return allowed[0];
  const regionalShare = REGIONAL_RESIDENCE_PROFILES?.[region]?.mobileCityShare ?? mobileShare;
  return draw < regionalShare && allowed.includes("移動都市") ? "移動都市" : "固定集落";
};
const normalizeHomeForRegion = (
  home,
  region,
  year = Number.isInteger(S?.year) ? S.year : START,
  month = Number.isInteger(S?.mo) ? S.mo : null
) => {
  if (region === "シエスタ" && home === "移動都市" && !siestaMobilePlatformAvailable(year, month))
    return "固定集落";
  return allowedHomesForRegion(region).includes(home)
    ? home
    : chooseHomeForRegion(region, undefined, undefined, year, month);
};
function repairHistoricalCityName(s) {
  if (
    s?.res?.n === "ボリバル" &&
    s.home === "移動都市" &&
    s.local?.city === "エル・ソル" &&
    s.year >= 1086
  )
    s.local.city = "ドッソレス";
  return s;
}
function repairResidenceModel(s) {
  if (!s?.res) return s;
  const allowed = allowedHomesForRegion(s.res.n);
  if (!allowed.includes(s.home)) {
    const before = s.home;
    s.home = allowed[0];
    s.local || (s.local = makeLocality(s.home, s.res.n));
    const table = s.home === "移動都市" ? SIM_TABLES.locality.mobile : SIM_TABLES.locality.fixed;
    if (!table.some(row => row.n === s.local.kind)) {
      s.local.kind = table.find(row => row.n === "小規模な定住地")?.n || table[0].n;
      if (s.home === "固定集落") s.local.city = null;
    }
    if (s.home === "固定集落") s.local.city = null;
    s.residenceModelRepairs || (s.residenceModelRepairs = []);
    s.residenceModelRepairs.push({
      year: s.year,
      region: s.res.n,
      from: before,
      to: s.home,
      basis: "game-model-residence-compatibility"
    });
    s.residenceModelRepairs = s.residenceModelRepairs.slice(-8);
  }
  return repairHistoricalCityName(s);
}
function makeLocality(home, region, requestedKind, year, month = Number.isInteger(S?.mo) ? S.mo : null) {
  const options = home === "移動都市" ? SIM_TABLES.locality.mobile : SIM_TABLES.locality.fixed;
  if (requestedKind && !options.some(x => x.n === requestedKind))
    throw new Error(`居住形態と地区の指定が一致しない: ${home} / ${requestedKind}`);
  const x = requestedKind ? options.find(x => x.n === requestedKind) : wp(options),
    localityYear = Number.isInteger(year) ? year : Number.isInteger(S?.year) ? S.year : START,
    localityMonth = Number.isInteger(month) ? month : null,
    environments = SIM_TABLES.environments[region],
    ecology = environments ? wp(environments).n : "未特定";
  const city =
    home === "移動都市"
      ? region === "龍門"
        ? R() < P("locality.lungmenNamedCityShare")
          ? "龍門"
          : null
        : region === "ヴィクトリア" && R() < P("locality.victoriaCapitalShare")
          ? "ロンディニウム"
        : region === "ウルサス"
          ? R() < P("locality.ursusChernobogShare")
            ? "チェルノボーグ"
            : localityYear === 1100
              ? (() => {
                  // 1100年初頭の移送先に衛星都市があった可能性を反映する保守的なゲーム近似。
                  // 都市の正式名称・一般住民の移入開始年は一次本文で確定しない。
                  const cityRoll = R(),
                    zelgradShare = P("locality.ursusZelgradConditionalShare"),
                    capitalShare = P("locality.ursusCapitalConditionalShare");
                  if (cityRoll < zelgradShare) return "ゼルグラード";
                  if (cityRoll < zelgradShare + capitalShare) return "サンクト・グリファーブルク";
                  return null;
                })()
              : localityYear >= 1101 && R() < P("locality.ursusZelgradConditionalShare")
                ? "ゼルグラード"
                : (() => {
                    const capitalCandidate = R() < P("locality.ursusCapitalConditionalShare");
                    // 1033年は二次資料の移行年。完了月が不明なため、最初の通年候補を1034年とする。
                    return localityYear >= 1034 && capitalCandidate ? "サンクト・グリファーブルク" : null;
                  })()
            : region === "ボリバル" && localityYear >= 1007 && R() < P("locality.bolivarNamedCityShare")
              ? localityYear >= 1086
                ? "ドッソレス"
                : "エル・ソル"
              : region === "シエスタ" && localityYear >= 1097
                ? (() => {
                    const cityRoll = R();
                    return siestaMobilePlatformAvailable(localityYear, localityMonth) &&
                      cityRoll < P("locality.siestaCityShare")
                      ? "シエスタ"
                      : null;
                  })()
                : null
      : null;
  return {
    kind: x.n,
    city,
    ecology,
    mixedNeighborhood: R() < (communityMixShare[x.n] || 0),
    access: clamp(x.access + (R() - 0.5) * P("locality.variation"), 0, 1),
    hazard: clamp(x.hazard + (R() - 0.5) * P("locality.variation"), 0, 1),
    info: clamp(x.info + (R() - 0.5) * P("locality.variation"), 0, 1)
  };
}
function communitySignals(s) {
  const mod = RACE_AFF[s.res?.n] || {},
    dominant = RACE.reduce(
      (best, r) => ((r.w || 1) * (mod[r.n] || 1) > (best.w || 1) * (mod[best.n] || 1) ? r : best),
      RACE[0]
    )?.n;
  const mixedFamily = [s.par?.fa?.r?.n, s.par?.mo?.r?.n].filter(Boolean).some(r => r !== s.r?.n);
  return {
    dominant,
    minority: !!s.r?.n && s.r.n !== dominant,
    mixed: !!s.local?.mixedNeighborhood,
    mixedFamily
  };
}
function refreshMobileCityEcology(s) {
  if (s.home !== "移動都市") return;
  const options = SIM_TABLES.environments[s.res.n] || [];
  if (options.length < 2 || R() >= P("locality.mobileRouteEcologyShiftChance")) return;
  const next = wp(options.filter(x => x.n !== s.local?.ecology));
  if (next) s.local.ecology = next.n;
}
