function applyFacilityAction(s, action) {
  if (
    !action ||
    !["clinic", "school", "workplace"].includes(action.kind) ||
    typeof action.action !== "string" ||
    typeof action.description !== "string"
  )
    throw Error("施設への対応記録が不正");
  const facility = activeFacility(s, action.kind);
  if (!facility) throw Error("対象の施設が現在の生活圏にない");
  facility.contacts.push({
    year: s.year,
    action: action.action,
    description: action.description,
    eventId: TRACE_RESOLUTION?.id || null,
    actor: "player",
    statusAtContact: facility.status
  });
  facility.contacts = facility.contacts.slice(-28);
  s.facilityContacts ||= [];
  s.facilityContacts.push({
    year: s.year,
    areaKey: s.community.key,
    facilityId: facility.id,
    kind: action.kind,
    action: action.action,
    description: action.description
  });
  s.facilityContacts = s.facilityContacts.slice(-80);
  // 窓口へ問い合わせたことと、受付・採用・治療・都市施設の復旧は別。
}
function facilitySummary(s) {
  const f = ["clinic", "school", "workplace"].map(kind => activeFacility(s, kind)).filter(Boolean);
  return (
    f
      .map(x => `${x.label}：${FACILITY_MODEL.states[x.status]}`)
      .join("／") || "施設の登録なし"
  );
}
function facilitySchoolMultiplier(s) {
  if (!s.fl?.sch || restricted(s)) return 1;
  const f = activeFacility(s, "school");
  return f?.status === "limited" ? 0.35 : f?.status === "strained" ? 0.75 : 1;
}
function facilityWorkMultiplier(s) {
  const f = activeFacility(s, "workplace");
  return f?.status === "limited" ? 0.88 : f?.status === "strained" ? 0.96 : 1;
}
function facilityCarePenalty(s) {
  const f = activeFacility(s, "clinic");
  return f?.status === "limited" ? 0.08 : f?.status === "strained" ? 0.025 : 0;
}

function localityShockMatchesPlace(s, shock) {
  return (
    shock.region === s.res?.n &&
    (!shock.city || s.local?.city === shock.city) &&
    (!shock.excludeCity || s.local?.city !== shock.excludeCity)
  );
}
function localityShockWasApplied(state, id) {
  return (
    state.historicalShockContext?.version === 1 &&
    Array.isArray(state.historicalShockContext.applied) &&
    state.historicalShockContext.applied.includes(id)
  );
}
function markLocalityShockApplied(state, id) {
  const applied = new Set(
    state.historicalShockContext?.version === 1 && Array.isArray(state.historicalShockContext.applied)
      ? state.historicalShockContext.applied
      : []
  );
  applied.add(id);
  state.historicalShockContext = { version: 1, applied: [...applied].sort() };
}
function localityShockStartedBy(shock, year, month) {
  if (year > shock.from) return true;
  if (year < shock.from) return false;
  if (!Number.isInteger(shock.fromMonth) || shock.fromMonth <= 1) return true;
  return Number.isInteger(month) && month >= shock.fromMonth;
}
function localityShockElapsedYears(shock, year, month) {
  const elapsed = year - shock.from;
  if (!Number.isInteger(shock.fromMonth)) return Math.max(0, elapsed);
  const observedMonth = month === 0 ? 1 : Number.isInteger(month) ? month : 0;
  return Math.max(0, elapsed - (observedMonth < shock.fromMonth ? 1 : 0));
}
function applyLocalityShockImpact(state, shock, elapsedYears) {
  const retained = Math.pow(1 - P("local.lifeRecovery"), Math.max(0, elapsedYears));
  for (const [axis, magnitude] of Object.entries(shock.impact))
    state.metrics[axis] = clamp(state.metrics[axis] - magnitude * retained, 0.08, 1);
  markLocalityShockApplied(state, shock.id);
}
function seedPastLocalityShocks(s, state, year) {
  const throughYear = Number.isInteger(state.lastYear)
    ? Math.min(state.lastYear, year - 1)
    : year - 1;
  for (const shock of LOCALITY_MODEL.shocks) {
    if (!localityShockMatchesPlace(s, shock) || localityShockWasApplied(state, shock.id)) continue;
    if (throughYear < shock.from) continue;
    applyLocalityShockImpact(state, shock, throughYear - shock.from);
  }
}

function localityAdvanceOne(s, regionState, year) {
  const b = localityBaseline(s),
    before = { ...regionState.metrics },
    shockIds = [];
  for (const axis of localityAxes)
    regionState.metrics[axis] = clamp(
      regionState.metrics[axis] + (b[axis] - regionState.metrics[axis]) * P("local.lifeRecovery"),
      0.08,
      1
    );
  for (const shock of LOCALITY_MODEL.shocks) {
    if (
      !localityShockMatchesPlace(s, shock) ||
      year < shock.from ||
      year > shock.to
    )
      continue;
    // 期間の各年に全量を再投入せず、最初の年に一度だけ発生した負荷として記録する。
    const eventMonth = year < s.year ? CALENDAR_MONTHS : s.mo;
    const start =
      localityShockStartedBy(shock, year, eventMonth) &&
      (year === shock.from || (regionState.lastYear === null && !localityShockWasApplied(regionState, shock.id)));
    if (start && !localityShockWasApplied(regionState, shock.id)) {
      applyLocalityShockImpact(
        regionState,
        shock,
        localityShockElapsedYears(shock, year, eventMonth)
      );
      shockIds.push(shock.id);
    }
  }
  // 出典未確定の生活背景の小規模変動。固定の場所・年で決まり、プレイヤー選択では世界が書き換わらない。
  const random = keyedRoll(`terra-local-v1:${regionState.key}:${year}`);
  if (random < P("local.interruptionShare")) {
    const axes = ["food", "jobs", "housing", "medical", "transport"],
      axis = axes[Math.floor(keyedRoll(`terra-local-axis:${regionState.key}:${year}`) * axes.length)];
    regionState.metrics[axis] = clamp(regionState.metrics[axis] - 0.045, 0.08, 1);
    shockIds.push("game-background-" + axis);
  }
  regionState.lastYear = year;
  facilityAdvance(s, regionState, year);
  facilityPersonAdvance(s, regionState, year);
  const diffs = localityAxes.filter(axis => Math.abs(regionState.metrics[axis] - before[axis]) >= 0.055);
  if (shockIds.length || diffs.length >= 3) {
    regionState.history.push({
      year,
      types: shockIds,
      changes: Object.fromEntries(
        diffs.map(axis => [axis, Number((regionState.metrics[axis] - before[axis]).toFixed(3))])
      ),
      basis: "simulation"
    });
    regionState.history = regionState.history.slice(-20);
  }
}
function applyCurrentLocalityShocks(s, state) {
  if (!Number.isInteger(s.mo) || s.mo < 1 || s.mo > CALENDAR_MONTHS) return;
  const before = { ...state.metrics }, applied = [];
  for (const shock of LOCALITY_MODEL.shocks) {
    if (
      !localityShockMatchesPlace(s, shock) ||
      s.year < shock.from ||
      s.year > shock.to ||
      !localityShockStartedBy(shock, s.year, s.mo) ||
      localityShockWasApplied(state, shock.id)
    )
      continue;
    applyLocalityShockImpact(state, shock, localityShockElapsedYears(shock, s.year, s.mo));
    applied.push(shock.id);
  }
  if (!applied.length) return;
  const diffs = localityAxes.filter(axis => Math.abs(state.metrics[axis] - before[axis]) >= 0.055);
  state.history.push({
    year: s.year,
    types: applied,
    changes: Object.fromEntries(
      diffs.map(axis => [axis, Number((state.metrics[axis] - before[axis]).toFixed(3))])
    ),
    basis: "simulation"
  });
  state.history = state.history.slice(-20);
}
function ensureLocalityState(s) {
  if (!s?.res || !s.local) return null;
  ensureResidenceIdentity(s);
  ensureEducationWorldForResidence(s);
  s.world || (s.world = { events: {} });
  s.world.localityArchive || (s.world.localityArchive = {});
  const key = localityKey(s);
  if (s.community?.key !== key) {
    if (s.community?.key) {
      const old = s.community;
      s.world.localityArchive[old.key] = old;
      s.world.localityVisits || (s.world.localityVisits = []);
      s.world.localityVisits.push({ year: s.year, from: old.key, to: key });
      s.world.localityVisits = s.world.localityVisits.slice(-32);
    }
    const old = s.world.localityArchive[key];
    if (old && old.lastYear <= s.year) {
      s.community = old;
      delete s.world.localityArchive[key];
    } else
      s.community = {
        version: 1,
        key,
        region: s.res.n,
        city: s.local.city || null,
        district: s.local.kind,
        metrics: localityBaseline(s),
        lastYear: null,
        history: [],
        actions: [],
        source: "game-model"
      };
  }
  const state = s.community;
  state.region=s.res.n;
  state.city=s.local.city || null;
  state.district=s.local.kind;
  let rewound = false;
  if (state.lastYear !== null && state.lastYear > s.year) {
    state.lastYear = s.year;
    state.history = [];
    rewound = true;
  } // デバッグの年戻し時には履歴の偽造を避ける
  if (!rewound) seedPastLocalityShocks(s, state, s.year);
  const first = state.lastYear === null ? s.year : state.lastYear + 1;
  for (let year = first; year <= s.year && year < first + 500; year++) localityAdvanceOne(s, state, year);
  if (!rewound) applyCurrentLocalityShocks(s, state);
  if (state.lastYear === s.year) facilityAdvance(s, state, s.year);
  ensureFacilityPersonStore(s, state);
  facilityPersonAdvance(s, state, s.year);
  // 移動・転職などの後にも他地区/旧職場への現在在籍を残さない。
  if (s.siteAffiliations) {
    for (const [kind, link] of Object.entries(s.siteAffiliations)) {
      const extra = kind === "workplace" ? String(s.job) : "";
      const eligible = kind !== "workplace" || (s.job > 0 && !s.fl?.retired && !restricted(s));
      if (
        link.areaKey === state.key &&
        link.extra === extra &&
        eligible &&
        state.facilities?.[link.facilityId]
      )
        continue;
      const reason =
        link.areaKey !== state.key
          ? "relocation"
          : link.extra !== extra
            ? "occupation_changed"
            : "eligibility_changed";
      s.siteAffiliationHistory ||= [];
      s.siteAffiliationHistory.push({
        year: s.year,
        kind,
        facilityId: link.facilityId,
        areaKey: link.areaKey,
        action: "ended",
        reason,
        basis: "game-model"
      });
      s.siteAffiliationHistory = s.siteAffiliationHistory.slice(-96);
      delete s.siteAffiliations[kind];
    }
  }
  // 現職・居住地を変更した直後でも旧勤務契約が現在在籍として残らない。
  // この場所では activeFacility を再帰呼出しせず、既にある台帳だけを見る。
  if (
    s.workContract &&
    (!s.siteAffiliations?.workplace ||
      s.workContract.siteId !== s.siteAffiliations.workplace.facilityId ||
      s.workContract.jobId !== s.job ||
      s.fl?.retired ||
      restricted(s))
  ) {
    const prior = s.workContract;
    s.workContractHistory ||= [];
    s.workContractHistory.push({
      year: s.year,
      siteId: prior.siteId,
      jobId: prior.jobId,
      action: "ended",
      reason: "site-or-job-changed",
      assignment: prior.assignment
    });
    s.workContractHistory = s.workContractHistory.slice(-80);
    s.workContract = null;
  }
  return state;
}
function localityStateView(s) {
  const state = ensureLocalityState(s);
  return state ? { ...state.metrics } : null;
}
const localityLivingMultiplier = s => {
  const m = localityStateView(s);
  return m ? 1 + Math.max(0, 0.73 - Math.min(m.food, m.housing)) * P("local.foodCostScale") : 1;
};
const localityEarningsMultiplier = s => {
  const m = localityStateView(s);
  return m ? 1 - Math.max(0, 0.72 - m.jobs) * P("local.jobIncomeScale") : 1;
};
const personalWorkEarningsMultiplier = s => localityEarningsMultiplier(s) * facilityWorkMultiplier(s);
const localityTravelMultiplier = s => {
  const m = localityStateView(s);
  return m ? 1 + Math.max(0, 0.72 - m.transport) * P("local.transportCostScale") : 1;
};
const localityMedicalPenalty = s => {
  const m = localityStateView(s);
  return (m ? Math.max(0, 0.7 - m.medical) * P("local.medicalAccessScale") : 0) + facilityCarePenalty(s);
};
function applyLocalityAction(s, action) {
  const state = ensureLocalityState(s);
  if (
    !state ||
    !action ||
    typeof action.kind !== "string" ||
    typeof action.action !== "string" ||
    !action.description
  )
    throw Error("地域生活行動の記録が不正");
  state.actions.push({
    year: s.year,
    kind: action.kind,
    action: action.action,
    description: action.description,
    eventId: TRACE_RESOLUTION?.id || null
  });
  state.actions = state.actions.slice(-32);
  // 本人の小さな援助によって、都市全体の供給・医療容量を勝手に変えない。
}
function localityDisplay(s) {
  const state = ensureLocalityState(s);
  if (!state) return "まだ地域状況を記録していません";
  const metrics = localityAxes
    .map(axis => `${LOCALITY_MODEL.axes[axis]} ${Math.round(state.metrics[axis] * 100)}`)
    .join(" / ");
  return `${s.residenceBase ? s.residenceBase.label + "／" : ""}${metrics}（0〜100の生活環境目安。高いほど整っている）`;
}
function pressureMatchesPlace(p, region, city) {
  return p.regions.includes(region) && (!p.cities || p.cities.includes(city));
}
function pressureHasMonthWindow(p) {
  return Number.isInteger(p.fromMonth) && Number.isInteger(p.toMonth);
}
function pressureYearHasExposure(p, year) {
  if (year < p.from || year > p.to) return false;
  if (!pressureHasMonthWindow(p)) return true;
  if (p.from === p.to) return p.fromMonth <= p.toMonth;
  if (year === p.from) return p.fromMonth <= CALENDAR_MONTHS;
  if (year === p.to) return p.toMonth >= 1;
  return true;
}
function pressureMatchesMonth(p, year, month) {
  if (!pressureYearHasExposure(p, year)) return false;
  if (!pressureHasMonthWindow(p)) return true;
  if (!Number.isInteger(month) || month < 1 || month > CALENDAR_MONTHS) return false;
  if (p.from === p.to) return month >= p.fromMonth && month <= p.toMonth;
  if (year === p.from) return month >= p.fromMonth;
  if (year === p.to) return month <= p.toMonth;
  return true;
}
function pressureAnnualExposureShare(p, year) {
  if (!pressureHasMonthWindow(p)) return 1;
  if (p.from === p.to) return (p.toMonth - p.fromMonth + 1) / CALENDAR_MONTHS;
  if (year === p.from) return (CALENDAR_MONTHS - p.fromMonth + 1) / CALENDAR_MONTHS;
  if (year === p.to) return p.toMonth / CALENDAR_MONTHS;
  return 1;
}
function worldPressureValue(p, key, s) {
  const value = p[key] || 1;
  if (s.mo !== 0 || !pressureHasMonthWindow(p)) return value;
  // Annual processing resolves health and mortality before assigning this year's event month.
  // Approximate a partial-year effect without publishing its historical event flag early.
  return 1 + (value - 1) * pressureAnnualExposureShare(p, s.year);
}
function worldPressureDeathMonth(s, cause) {
  if (
    s.mo !== 0 ||
    !["戦闘職務中の死亡", "戦争に伴う民間人死亡"].includes(cause)
  )
    return null;
  const months = activeWorldPressures(s)
    .filter(pressureHasMonthWindow)
    .flatMap(p => {
      const first = p.from === s.year ? p.fromMonth : 1;
      const last = p.to === s.year ? p.toMonth : CALENDAR_MONTHS;
      return Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => first + i);
    });
  return months.length ? months[rnd(0, months.length - 1)] : null;
}
function activeWorldPressures(s, region = s.res?.n, city = s.local?.city) {
  return WORLD_PRESSURES.filter(
    p => {
      if (!pressureMatchesPlace(p, region, city) || !pressureYearHasExposure(p, s.year)) return false;
      // Annual health/mortality runs before hist() publishes this year's flags.
      // The configured pressure window itself is sufficient for this aggregate
      // estimate; monthly event eligibility still waits for the historical flag.
      if (s.mo === 0) return true;
      return s.world?.events?.[p.id] != null && pressureMatchesMonth(p, s.year, s.mo);
    }
  );
}
function worldPressureContext(s) {
  const active = activeWorldPressures(s).map(p => ({
    id: p.id,
    from: p.from,
    to: p.to,
    ...(pressureHasMonthWindow(p) ? { fromMonth: p.fromMonth, toMonth: p.toMonth } : {}),
    regions: [...p.regions],
    ...(p.cities ? { cities: [...p.cities] } : {}),
    war: worldPressureValue(p, "war", s),
    ...(pressureHasMonthWindow(p) ? { configuredWar: p.war, annualExposureShare: pressureAnnualExposureShare(p, s.year) } : {}),
    dateConfidence: p.dateConfidence,
    sourceRefs: [...p.sourceRefs],
    anchor: p.anchor,
    scope: p.scope
  }));
  return {
    year: s.year,
    region: s.res.n,
    active,
    summary: active.length
      ? active
          .map(p => {
            const period = Number.isInteger(p.fromMonth)
              ? `${p.from}年${p.fromMonth}月〜${p.to}年${p.toMonth}月`
              : `${p.from}〜${p.to}年`;
            return `${p.id}（${period}${p.cities ? `・対象都市${p.cities.join("/ ")}` : ""}・年代確度${p.dateConfidence}・この時点の戦乱圧力×${p.war}）: ${p.scope}`;
          })
          .join(" ／ ")
      : "登録された年表圧力はない。"
  };
}
const worldPressure = (s, key, region = s.res?.n, city = s.local?.city) =>
  activeWorldPressures(s, region, city).reduce((v, p) => v * worldPressureValue(p, key, s), 1);
