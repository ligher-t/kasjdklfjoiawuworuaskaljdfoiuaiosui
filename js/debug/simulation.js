// js/debug/simulation.js: reproducible, isolated diagnostic lifetime runs.
let DEV_SIMULATION_ACTIVE = false, DEV_SIMULATION_CANCEL_REQUESTED = false;
let DEV_SIMULATION_PREVIOUS_CONTROLS = null;

function normalizeDevSimulationOptions(input = {}) {
  const number = (key, fallback, min, max) => {
    const n = input[key] == null || input[key] === "" ? fallback : Number(input[key]);
    if (!Number.isInteger(n) || n < min || n > max) throw new Error(key + " は" + min + "〜" + max + "の整数で指定してください。");
    return n;
  };
  const options = {
    count: number("count", 1000, 1, 1000),
    masterSeed: number("masterSeed", 20261026, 0, 0xffffffff) >>> 0,
    maxYears: number("maxYears", 400, 1, 400),
    birthYearMin: number("birthYearMin", START, BIRTH_YEAR_MIN, BIRTH_YEAR_MAX),
    birthYearMax: number("birthYearMax", START, BIRTH_YEAR_MIN, BIRTH_YEAR_MAX),
    region: input.region || "",
    regionSampling: input.regionSampling || "natural",
    race: input.race || "",
    wealth: input.wealth || "",
    replaySeed: input.replaySeed == null ? null : Number(input.replaySeed) >>> 0
  };
  if (!["natural", "balanced"].includes(options.regionSampling)) throw new Error("地域の試行方式が不正です。");
  if (options.region && options.regionSampling === "balanced") throw new Error("地域別同数試行では出生地域を抽選にしてください。");
  if (options.regionSampling === "balanced" && options.count % REG.length) throw new Error("地域別同数試行の人数は地域数（" + REG.length + "）の倍数にしてください。");
  if (options.birthYearMin > options.birthYearMax) throw new Error("出生年の下限は上限以下にしてください。");
  if (options.region && !REG.some(row => row.n === options.region)) throw new Error("指定された地域が見つかりません。");
  if (options.race && !RACE.some(row => row.n === options.race)) throw new Error("指定された種族が見つかりません。");
  if (options.wealth && !WEALTH.some(row => row.n === options.wealth)) throw new Error("指定された家計階層が見つかりません。");
  return options;
}

function devSeedFor(masterSeed, index) {
  let value = (masterSeed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  value ^= value << 13; value ^= value >>> 17; value ^= value << 5;
  return value >>> 0 || 0x6d2b79f5;
}
function devBirthYearFor(options, index, seed) {
  if (options.birthYearMin === options.birthYearMax) return options.birthYearMin;
  const mixed = devSeedFor(seed, index + 0x4d3);
  return options.birthYearMin + mixed % (options.birthYearMax - options.birthYearMin + 1);
}
function devLifeMetrics(status) {
  const s = S;
  return {
    birthYear: s.by, birthRegion: s.origin?.n || s.g?.n || "不明",
    currentRegion: s.res?.n || "不明", race: s.r?.n || "不明",
    wealth: s.originWealth?.n || s.w?.n || "不明", age: s.age, status,
    dead: !!s.dead, cause: s.dc || null, causeCode: s.deathCauseCode || s.dc || null,
    infected: !!s.inf, diagnosed: !!s.fl?.dg,
    diagnosisYear: Number.isInteger(s.infection?.year) ? s.infection.year : null,
    discriminationLevel: typeof s.discrimLevel === "number" ? s.discrimLevel : (s.discrim || 0),
    exposureScope: s.exposureScope || (s.fl?.exposure ? "public" : "none"),
    isSarkaz: s.r?.n === "サルカズ", isAegir: s.r?.n === "エーギル",
    health: Number(s.h), wellbeing: Number(s.p), knowledge: Number(s.k), relations: Number(s.rl),
    cash: Number(s.cash), debt: Number(s.debt), highDebt: Number(s.debt) >= 50000000,
    netAssets: Number(s.cash) + Number(s.investment || 0) - Number(s.debt),
    educationLevel: Number(eduLv(s)), job: (typeof occupationLabel === "function" ? occupationLabel(s) : J[s.job]?.n) || "不明"
  };
}
function devStateSummary(s) {
  if (!s) return null;
  return {
    person: s.nm || null, age: s.age ?? null, year: s.year ?? null, month: s.mo ?? null,
    region: s.res?.n || null, city: s.local?.city || null, locality: s.local?.kind || null,
    infection: !!s.inf, diagnosed: !!s.fl?.dg,
    health: Number.isFinite(s.h) ? s.h : null, wellbeing: Number.isFinite(s.p) ? s.p : null,
    knowledge: Number.isFinite(s.k) ? s.k : null, relations: Number.isFinite(s.rl) ? s.rl : null,
    cash: Number.isFinite(s.cash) ? s.cash : null, debt: Number.isFinite(s.debt) ? s.debt : null,
    netAssets: Number.isFinite(s.cash) && Number.isFinite(s.debt) ? s.cash + Number(s.investment || 0) - s.debt : null
  };
}
function devRecordFailure(result, failure) {
  result.failureCount++;
  const signature = failure.type + "|" + (failure.eventId || "no-event") + "|" + failure.error;
  let group = result.failures.find(row => row.signature === signature);
  if (!group) {
    group = { signature, type: failure.type, eventId: failure.eventId, error: failure.error, count: 0, lives: [], example: failure };
    result.failures.push(group);
  }
  group.count++;
  if (group.lives.length < 8) group.lives.push(failure.lifeIndex);
}

async function runDevSimulation(input = {}, hooks = {}) {
  if (DEV_SIMULATION_ACTIVE) throw new Error("シミュレーションは既に実行中です。");
  const options = normalizeDevSimulationOptions(input),
    backup = {
      life: S, world: W, au: AU, acc, hl: HL, speed: sp, debugRandom: DEBUG_RANDOM,
      randomSeed: RANDOM_SEED, randomState: RANDOM_STATE,
      traceResolution: TRACE_RESOLUTION, pendingDeathTrace: PENDING_DEATH_TRACE, captureTrace: CAPTURE_TRACE,
      statistics: { ...STAT }
    },
    result = { attempted: 0, completed: 0, processedYears: 0, stateChecks: 0, runtimeFailureCount: 0, stateFailureCount: 0, failureCount: 0, failures: [], analytics: devCreateAnalytics(), canceled: false },
    startedAt = Date.now();
  DEV_SIMULATION_ACTIVE = true;
  DEV_SIMULATION_CANCEL_REQUESTED = false;
  try {
    // Birth draws write rngState on the current life before the new object exists.
    // Detach the visible life so diagnostic birth cannot mutate its saved RNG field.
    replaceCurrentLife(null);
    replaceWorldKnowledge(JSON.parse(JSON.stringify(W || {})));
    sp = 0; acc = 0; HL = 1; AU = "r"; DEBUG_RANDOM = null; CAPTURE_TRACE = false;
    resetSimulationStatistics();
    let lastYieldAt = Date.now();
    const progressState = phase => ({ attempted: result.attempted, completed: result.completed, failed: result.failureCount, processedYears: result.processedYears, elapsedMs: Date.now() - startedAt, total: options.count, age: S?.age, year: S?.year, phase });
    for (let index = 0; index < options.count; index++) {
      if (DEV_SIMULATION_CANCEL_REQUESTED || hooks.shouldCancel?.()) { result.canceled = true; break; }
      const seed = options.replaySeed == null ? devSeedFor(options.masterSeed, index) : options.replaySeed,
        birthYear = input.replayBirthYear == null ? devBirthYearFor(options, index, seed) : Number(input.replayBirthYear),
        birth = { seed, by: birthYear };
      if (options.region) birth.region = options.region;
      else if (options.regionSampling === "balanced") birth.region = REG[index % REG.length].n;
      if (options.race) birth.race = options.race;
      if (options.wealth) birth.wealth = options.wealth;
      result.attempted++;
      STAT.currentLife = index; STAT.currentEventId = null; STAT.recentEvents = []; STAT.lifeEventYears.clear();
      let observer = null;
      try {
        born(birth);
        observer = devCreateLifeObserver(S, result.analytics, index + 1, seed);
        const check = (where, annualCheckpoint = false) => {
          result.stateChecks++;
          const problems = auditLifeState(S);
          if (!problems.length) devObserveLife(S, observer, result.analytics, { annualCheckpoint });
          if (problems.length) { const error = new Error(where + ": " + problems.join("、")); error.stateFailure = true; throw error; }
        };
        check("出生直後");
        let years = 0;
        while (!S.dead && years < options.maxYears) {
          for (const q of S.q.splice(0)) { slot(q); check("イベント処理後"); }
          if (!S.dead) { tick(); check("年次更新後", true); years++; result.processedYears++; }
          if (Date.now() - lastYieldAt >= 10) {
            hooks.onProgress?.(progressState("running"));
            await new Promise(resolve => setTimeout(resolve, 0));
            lastYieldAt = Date.now();
            if (DEV_SIMULATION_CANCEL_REQUESTED || hooks.shouldCancel?.()) { result.canceled = true; break; }
          }
        }
        if (result.canceled) { devFinalizeLifeObserver(observer, result.analytics, "canceled"); break; }
        const status = S.dead ? "died" : "year-limit";
        devFinalizeLifeObserver(observer, result.analytics, status);
        STAT.lifeMetrics.push(devLifeMetrics(status));
        result.completed++;
        if (S.dead) recordSimulationDeath(S);
      } catch (error) {
        const type = error?.stateFailure ? "state" : "runtime";
        devFinalizeLifeObserver(observer, result.analytics, type + "-failure");
        if (error?.stateFailure) result.stateFailureCount++; else result.runtimeFailureCount++;
        let stage = "不明";
        try { stage = STG[stg(S)] || stage; } catch {}
        devRecordFailure(result, {
          lifeIndex: index + 1, seed, birthYear, birth, type,
          error: error?.message || String(error),
          eventId: STAT.currentEventId || STAT.recentEvents.at(-1)?.eventId || null,
          stage, state: devStateSummary(S), recentEvents: STAT.recentEvents.map(row => ({ ...row }))
        });
      }
      hooks.onProgress?.(progressState("life-finished"));
      if (Date.now() - lastYieldAt >= 10 || index + 1 < options.count) {
        await new Promise(resolve => setTimeout(resolve, 0)); lastYieldAt = Date.now();
      }
      if (DEV_SIMULATION_CANCEL_REQUESTED || hooks.shouldCancel?.()) { result.canceled = true; break; }
    }
    result.elapsedMs = Date.now() - startedAt;
    const report = buildDevSimulationReport(options, result);
    report.run = { startedAt: new Date(startedAt).toISOString(), finishedAt: new Date().toISOString() };
    return report;
  } finally {
    replaceCurrentLife(backup.life); replaceWorldKnowledge(backup.world);
    AU = backup.au; acc = backup.acc; HL = backup.hl; sp = backup.speed;
    DEBUG_RANDOM = backup.debugRandom; RANDOM_SEED = backup.randomSeed; RANDOM_STATE = backup.randomState;
    TRACE_RESOLUTION = backup.traceResolution; PENDING_DEATH_TRACE = backup.pendingDeathTrace; CAPTURE_TRACE = backup.captureTrace;
    restoreSimulationStatistics(backup.statistics);
    DEV_SIMULATION_ACTIVE = false; DEV_SIMULATION_CANCEL_REQUESTED = false;
  }
}

function readDevSimulationOptions() {
  const field = id => document.getElementById(id)?.value;
  return normalizeDevSimulationOptions({
    count: field("dev-count"), masterSeed: field("dev-seed"), maxYears: field("dev-years"),
    birthYearMin: field("dev-year-from"), birthYearMax: field("dev-year-to"),
    region: field("dev-region"), race: field("dev-race"), wealth: field("dev-wealth"), regionSampling: field("dev-region-sampling")
  });
}
function setDevRunBusy(busy) {
  if (busy) {
    DEV_SIMULATION_PREVIOUS_CONTROLS = [...document.querySelectorAll("#s0 button, #s0 input, #s0 select, #terra-debug button, #terra-debug input, #terra-debug select, #terra-debug textarea")]
      .map(control => ({ control, disabled: control.disabled }));
    for (const row of DEV_SIMULATION_PREVIOUS_CONTROLS)
      if (row.control.id !== "dev-cancel") row.control.disabled = true;
  } else if (DEV_SIMULATION_PREVIOUS_CONTROLS) {
    for (const row of DEV_SIMULATION_PREVIOUS_CONTROLS) row.control.disabled = row.disabled;
    DEV_SIMULATION_PREVIOUS_CONTROLS = null;
  }
  for (const id of ["dev-run", "dev-audit-catalog", "dev-replay-failure"]) {
    const button = document.getElementById(id);
    if (button) button.disabled = busy || (id === "dev-replay-failure" && !DEV_LAST_SIMULATION_REPORT?.failures.length);
  }
  const cancel = document.getElementById("dev-cancel");
  if (cancel) cancel.disabled = !busy;
  const download = document.getElementById("dev-download-report");
  if (download && !busy) download.disabled = !DEV_LAST_SIMULATION_REPORT;
}
async function dev(input = null) {
  if (DEV_SIMULATION_ACTIVE) return null;
  let options;
  try { options = normalizeDevSimulationOptions(input || readDevSimulationOptions()); }
  catch (error) { const status = document.getElementById("dev-status"); if (status) status.textContent = error.message; return null; }
  const catalogFindings = devStructureFindings(validate()),
    allowFindings = input?.allowCatalogFindings === true || !!document.getElementById("dev-continue-on-findings")?.checked,
    catalogOutput = document.getElementById("dev-catalog-report");
  if (catalogOutput) catalogOutput.textContent = formatDevCatalogFindings(catalogFindings);
  if (catalogFindings.length && !allowFindings) {
    const status = document.getElementById("dev-status");
    if (status) status.textContent = "構造検査で" + catalogFindings.length + "件の指摘があります。確認後、続行を明示してください。";
    return null;
  }
  const status = document.getElementById("dev-status"), progress = document.getElementById("dev-progress");
  setDevRunBusy(true);
  if (status) status.textContent = "シミュレーションを準備しています。";
  if (progress) { progress.max = options.count; progress.value = 0; }
  try {
    const prior = DEV_LAST_SIMULATION_REPORT;
    const report = await runDevSimulation(options, {
      shouldCancel: () => DEV_SIMULATION_CANCEL_REQUESTED,
      onProgress: state => {
        if (progress) { progress.max = state.total; progress.value = state.completed + state.failed; }
        if (status) {
          const seconds = state.elapsedMs / 1000;
          status.textContent = `完了 ${state.completed}/${state.total}人・失敗 ${state.failed}人・処理中 ${state.phase === "running" ? 1 : 0}人 / ${seconds.toFixed(1)}秒・${state.processedYears}年処理 / ${(state.completed / Math.max(seconds, 0.001)).toFixed(2)}人/秒 / ${state.year ?? "—"}年・${state.age ?? "—"}歳`;
        }
      }
    });
    report.catalogFindings = catalogFindings;
    report.catalogSummary = devSummarizeCatalogFindings(catalogFindings);
    devRenderComparison(report, DEV_BASELINE_SIMULATION_REPORT || prior);
    DEV_LAST_SIMULATION_REPORT = report;
    renderDevSimulationDetails(report);
    if (status) status.textContent = report.summary.canceled ? "中止しました。 " + report.summary.sampled + "人分の結果を保存できます。" : "シミュレーションが完了しました。";
    return report;
  } catch (error) {
    if (status) status.textContent = "シミュレーションを開始できません: " + error.message;
    throw error;
  } finally { setDevRunBusy(false); }
}
function devAuditCatalog() {
  const findings = devStructureFindings(validate()),
    output = document.getElementById("dev-catalog-report"),
    status = document.getElementById("dev-status");
  if (output) output.textContent = formatDevCatalogFindings(findings);
  if (status) status.textContent = findings.length ? "構造検査: " + findings.length + "件の指摘です。" : "構造検査: 指摘はありません。";
  return findings;
}
function devCancelSimulation() {
  if (!DEV_SIMULATION_ACTIVE) return;
  DEV_SIMULATION_CANCEL_REQUESTED = true;
  const status = document.getElementById("dev-status");
  if (status) status.textContent = "現在の年の処理後に中止します。";
}
async function devReplayFirstFailure() {
  const selected = Number(document.getElementById("dev-failure-select")?.value || 0);
  const failure = DEV_LAST_SIMULATION_REPORT?.failures?.[selected]?.example;
  if (!failure) return null;
  const previous = DEV_LAST_SIMULATION_REPORT.options;
  const replayOptions = {
    ...previous, regionSampling: "natural", region: failure.birth?.region || previous.region, count: 1, masterSeed: failure.seed,
    birthYearMin: failure.birthYear, birthYearMax: failure.birthYear,
    replaySeed: failure.seed, replayBirthYear: failure.birthYear, allowCatalogFindings: true
  };
  const fields = {
    "dev-count": replayOptions.count, "dev-region-sampling": replayOptions.regionSampling, "dev-seed": replayOptions.masterSeed,
    "dev-years": replayOptions.maxYears, "dev-year-from": replayOptions.birthYearMin,
    "dev-year-to": replayOptions.birthYearMax, "dev-region": replayOptions.region,
    "dev-race": replayOptions.race, "dev-wealth": replayOptions.wealth
  };
  for (const [id, value] of Object.entries(fields)) {
    const field = document.getElementById(id);
    if (field) field.value = String(value ?? "");
  }
  return dev(replayOptions);
}
