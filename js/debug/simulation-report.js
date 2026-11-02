function normalizedDeathCauseCounts(raw) {
  const grouped={};
  for(const [cause,count] of Object.entries(raw||{})) {
    const key=cause === "天災による死亡" ? "天災" : cause;
    grouped[key]=(grouped[key]||0)+count;
  }
  return Object.fromEntries(Object.entries(grouped).sort((a,b)=>b[1]-a[1]));
}
// Structured, comparable diagnostics for developer simulations.
const DEV_SIMULATION_REPORT_VERSION = 2;
let DEV_LAST_SIMULATION_REPORT = null,
  DEV_BASELINE_SIMULATION_REPORT = null;

function devSimulationReportVersionError(report) {
  if (report?.schema === "terra-dev-simulation-report" && report.schemaVersion === 1)
    return "開発者レポートschema v1はv2へ自動移行せず、比較対象にも含めません。v2で再出力してください。";
  return "比較用レポートの形式または版が対応していません。";
}

function devPercentile(values, percentile) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b),
    index = (sorted.length - 1) * percentile,
    lower = Math.floor(index),
    upper = Math.ceil(index);
  return Number((sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)).toFixed(2));
}

function devDistribution(values) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return { count: 0, min: null, p10: null, median: null, p90: null, max: null };
  return {
    count: finite.length,
    min: Number(Math.min(...finite).toFixed(2)),
    p10: devPercentile(finite, 0.1),
    median: devPercentile(finite, 0.5),
    p90: devPercentile(finite, 0.9),
    max: Number(Math.max(...finite).toFixed(2))
  };
}

function devCatalogCategory(message) {
  if (/時期|年齢|発生月|期間|月の指定/.test(message)) return "年代・条件";
  if (/参照|資料ID|イベントID|タグ|フラグ/.test(message)) return "ID・参照";
  if (/選択肢|結果|累積確率|確率が|選べない理由/.test(message)) return "選択・結果";
  if (/金額|資金|費用|家計|運賃/.test(message)) return "家計・費用";
  if (/本文|ラベル|who/.test(message)) return "表示・語り手";
  if (/効果|値|型|単位|設定値|パラメータ/.test(message)) return "効果・設定";
  return "構造";
}

function devStableIssueCode(message) {
  let hash = 2166136261;
  for (const character of message) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return `CAT-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function devStructureFindings(messages) {
  return messages.map((message, index) => {
    const event = EV.find(row => message.startsWith(row.id + ":") || message.startsWith(row.id + "#"));
    const severity = /未知|未定義|重複|不正|ない|不足|確率|参照先/.test(message) ? "error" : "review";
    return {
      code: devStableIssueCode(message),
      severity,
      category: devCatalogCategory(message),
      eventId: event?.id || null,
      message,
      sourceOrder: index
    };
  });
}

function devSummarizeCatalogFindings(findings) {
  const bySeverity = {}, byCategory = {};
  for (const finding of findings) {
    bySeverity[finding.severity] = (bySeverity[finding.severity] || 0) + 1;
    byCategory[finding.category] = (byCategory[finding.category] || 0) + 1;
  }
  return { total: findings.length, bySeverity, byCategory };
}

function formatDevCatalogFindings(findings) {
  return JSON.stringify({ summary: devSummarizeCatalogFindings(findings), findings }, null, 2);
}

function devAggregateCohorts(lives) {
  const groups = new Map();
  for (const life of lives) {
    const decade = Math.floor(life.birthYear / 10) * 10,
      key = `${life.birthRegion} / ${decade}年代`,
      row = groups.get(key) || { region: life.birthRegion, decade, lives: 0, deaths: 0, diagnosed: 0, ages: [] };
    row.lives++;
    if (life.dead) row.deaths++;
    if (life.diagnosed) row.diagnosed++;
    row.ages.push(life.age);
    groups.set(key, row);
  }
  return [...groups.values()]
    .sort((a, b) => a.decade - b.decade || a.region.localeCompare(b.region, "ja"))
    .map(row => ({
      region: row.region,
      birthDecade: row.decade,
      lives: row.lives,
      deaths: row.deaths,
      diagnosed: row.diagnosed,
      meanAge: Number((row.ages.reduce((sum, age) => sum + age, 0) / row.ages.length).toFixed(2))
    }));
}

const TERRA_SPECIFIC_CAUSE_GROUPS = {
  environmental: [
    "獣害（狂暴化源石獣の襲撃）",
    "海の怪異（恐魚の捕食・同化・海への喪失）",
    "極北の虚無・悪魔（未知の侵食による消失）",
    "事故死（都市煤煙・急性スモッグ窒息）",
    "凍死（極寒・吹雪での遭難）",
    "遭難死（熱砂・脱水）",
    "事故死（源石粉塵吸入・爆発）"
  ],
  socialPersecution: [
    "医療拒絶による病死（敗血症・門前払い）",
    "生体実験・未承認薬投与による死亡",
    "私刑による死亡（暴徒のリンチ・放火）",
    "隔離・追放による衰弱死",
    "迫害死（ゼルグラード燃料化虐殺）"
  ],
  occupationalAndOrganizational: [
    "事故死（落盤・坑道崩落生き埋め）",
    "闘技場での致命傷（競技・地下闘技）",
    "暗殺・粛清（組織の掟・オメルタの執行）",
    "国家機密漏洩・密告者処刑"
  ],
  originiumArts: [
    "アーツ暴走による自壊"
  ],
  psychologicalCrisis: [
    "自死（不可逆な絶望・破滅の果て）",
    "名誉の自決（矜持・信仰・拷問拒絶の自裁）"
  ]
};

function devAggregateTerraMortality(deaths) {
  const terraCauses = Object.values(TERRA_SPECIFIC_CAUSE_GROUPS).flat();
  const summary = { totalTerraDeaths: 0, byCategory: {}, byCause: {} };
  for (const cat of Object.keys(TERRA_SPECIFIC_CAUSE_GROUPS)) {
    summary.byCategory[cat] = 0;
  }
  for (const d of deaths) {
    const c = d.cause;
    if (c && terraCauses.includes(c)) {
      summary.totalTerraDeaths++;
      summary.byCause[c] = (summary.byCause[c] || 0) + 1;
      for (const [cat, list] of Object.entries(TERRA_SPECIFIC_CAUSE_GROUPS)) {
        if (list.includes(c)) {
          summary.byCategory[cat]++;
          break;
        }
      }
    }
  }
  summary.terraShare = deaths.length
    ? Number(((summary.totalTerraDeaths / deaths.length) * 100).toFixed(2))
    : 0;
  return summary;
}

function devAggregateDiscriminationMetrics(lives) {
  const sarkazLives = lives.filter(r => r.isSarkaz);
  const nonSarkazLives = lives.filter(r => !r.isSarkaz);
  const levels = {};
  for (let i = 0; i <= 8; i++) levels[i] = 0;
  for (const row of lives) {
    const lv = Math.min(8, Math.max(0, row.discriminationLevel || 0));
    levels[lv]++;
  }
  return {
    sarkazCount: sarkazLives.length,
    sarkazInfectedCount: sarkazLives.filter(r => r.infected).length,
    sarkazInfectionRate: sarkazLives.length
      ? Number(((sarkazLives.filter(r => r.infected).length / sarkazLives.length) * 100).toFixed(2))
      : 0,
    nonSarkazInfectionRate: nonSarkazLives.length
      ? Number(((nonSarkazLives.filter(r => r.infected).length / nonSarkazLives.length) * 100).toFixed(2))
      : 0,
    discriminationLevelDistribution: levels
  };
}

function devAggregateEconomicHealth(lives) {
  const highDebtLives = lives.filter(r => r.highDebt || r.debt >= 50000000);
  const extremeDebtLives = lives.filter(r => r.debt >= 100000000);
  return {
    highDebtCount: highDebtLives.length,
    extremeDebtCount: extremeDebtLives.length,
    highDebtShare: lives.length
      ? Number(((highDebtLives.length / lives.length) * 100).toFixed(2))
      : 0
  };
}

function buildDevSimulationReport(options, result, catalogFindings = []) {
  const lives = STAT.lifeMetrics,
    deaths = lives.filter(row => row.dead),
    eventCoverage = EV.map(event => {
      const row = STAT.eventCoverage[event.id] || {},
        stageRows = Object.entries(row.stages || {}).map(([stage, counts]) => ({ stage, ...counts }));
      return {
        eventId: event.id,
        type: event.c ? "choice" : "daily",
        evaluated: row.evaluated || 0,
        eligibleSlots: row.eligibleSlots || 0,
        candidateSlots: row.candidateSlots || 0,
        fired: row.fired || 0,
        blocked: row.blocked || 0,
        unavailableChoiceSlots: row.unavailableChoiceSlots || 0,
        monthlyChoiceBlocked: row.monthlyChoiceBlocked || 0,
        firstBlockingGateCounts: row.rejections || {},
        fireRateAmongCandidateSlots: row.candidateSlots
          ? Number(((row.fired / row.candidateSlots) * 100).toFixed(3))
          : null,
        reachability: !row.eligibleSlots
          ? "not-eligible-in-sample"
          : !row.candidateSlots
            ? row.monthlyChoiceBlocked ? "blocked-by-monthly-choice-limit" : "eligible-without-actionable-candidate"
            : !row.fired
              ? "candidate-never-selected"
              : "observed",
        stages: stageRows
      };
    }),
    choiceBranches = EV.filter(event => event.c).flatMap(event =>
      (event.c || []).map((choice, choiceIndex) => {
        const availability = STAT.choiceAvailability[event.id]?.[choiceIndex] || {},
          outcomes = STAT.choiceOutcomes[event.id]?.[choiceIndex] || {};
        return {
          eventId: event.id,
          choiceIndex,
          label: typeof choice.l === "string" ? choice.l : "（動的ラベル）",
          shown: availability.shown || 0,
          hidden: availability.hidden || 0,
          enabled: availability.enabled || 0,
          gateBlocked: availability.gateBlocked || 0,
          ethicalBlocked: availability.ethicalBlocked || 0,
          outcomes: (choice.o || []).map((outcome, outcomeIndex) => ({
            outcomeIndex,
            probability: Number(((outcome[0] - (choice.o[outcomeIndex - 1]?.[0] || 0)) * 100).toFixed(3)),
            count: outcomes[outcomeIndex] || 0
          }))
        };
      })
    ),
    failureCount = result.failures.reduce((sum, row) => sum + row.count, 0),
    causeCounts = Object.fromEntries(Object.entries(STAT.dc).sort((a, b) => b[1] - a[1]));
  return {
    schema: "terra-dev-simulation-report",
    schemaVersion: DEV_SIMULATION_REPORT_VERSION,
    generatedAt: new Date().toISOString(),
    elapsedMs: result.elapsedMs,
    fingerprints: { data: DATA_FINGERPRINT, source: SOURCE_FINGERPRINT },
    options,
    assumptions: [
      "抽選重み・発生数・分布はゲーム内設定による試行結果で、テラの人口統計や正史上の頻度ではありません。",
      "候補回数はイベントが発生可能な抽選枠の数です。結果の率は設定条件とこの標本に限ります。",
      "未発生は即座に不具合を意味しません。希少条件は固定条件の経路試験で確認してください。",
      "年次空白期間はチェックポイントでの記録です。職業記録なしを失業と断定せず、教育・療養・退職等の状態と併せて読みます.",
      "最終発火年に少なくとも一度選択可能だった人物・イベント・年を期限付き候補の母数とし、死亡や実行失敗で途中終了した年を打切りに分類します。年内の条件変化で不適格となった選択はsupersededへ分け、未処理例の最初と最後の適格月を最大30件記録します。"
    ],
    summary: {
      requested: options.count,
      processedYears: result.processedYears || 0,
      attempted: result.attempted,
      sampled: lives.length,
      died: deaths.length,
      reachedYearLimit: lives.filter(row => row.status === "year-limit").length,
      runtimeFailures: result.runtimeFailureCount,
      stateFailures: result.stateFailureCount,
      canceled: result.canceled,
      meanAgeAtDeath: deaths.length
        ? Number((deaths.reduce((sum, row) => sum + row.age, 0) / deaths.length).toFixed(2))
        : null,
      totalStateChecks: result.stateChecks,
      totalEventSlots: STAT.totalSlots,
      infectedAtEnd: lives.filter(row => row.infected).length,
      diagnosedAtEnd: lives.filter(row => row.diagnosed).length,
      choiceBlocked: STAT.choiceBlocked,
      duplicateChoiceMonths: STAT.duplicateChoiceMonths,
      unavailableChoiceCandidates: STAT.unavailableChoiceCandidates,
      postDeathSlotAttempts: STAT.postDeathSlotAttempts,
      postDeathFireAttempts: STAT.postDeathFireAttempts,
      failureCount,
      completion: result.canceled ? "canceled" : result.attempted >= options.count ? "finished" : "incomplete"
    },
    deathCauses: normalizedDeathCauseCounts(causeCounts),
    rawDeathCauses: causeCounts,
    deathOrigins: {...STAT.deathOrigins},
    deathCausesByAgeAndOrigin: Object.fromEntries(Object.entries(STAT.deathCohorts).map(([age,origins])=>
      [age,Object.fromEntries(Object.entries(origins).map(([origin,causes])=>[origin,normalizedDeathCauseCounts(causes)]))])),
    distributions: {
      age: devDistribution(lives.map(row => row.age)),
      health: devDistribution(lives.map(row => row.health)),
      wellbeing: devDistribution(lives.map(row => row.wellbeing)),
      knowledge: devDistribution(lives.map(row => row.knowledge)),
      relations: devDistribution(lives.map(row => row.relations)),
      netAssets: devDistribution(lives.map(row => row.netAssets)),
      debt: devDistribution(lives.map(row => row.debt)),
      educationLevel: devDistribution(lives.map(row => row.educationLevel))
    },
    cohorts: devAggregateCohorts(lives),
    lifePaths: devFinalizeAnalytics(result.analytics, options),
    terraSpecificMortality: devAggregateTerraMortality(deaths),
    discriminationMetrics: devAggregateDiscriminationMetrics(lives),
    economicHealthMetrics: devAggregateEconomicHealth(lives),
    eventCoverage,
    deadlineCoverage: {
      ...STAT.deadlineCoverage,
      eligibleForRate: STAT.deadlineCoverage.observed - STAT.deadlineCoverage.censored - STAT.deadlineCoverage.superseded,
      deliveryRatePercent: STAT.deadlineCoverage.observed > STAT.deadlineCoverage.censored + STAT.deadlineCoverage.superseded
        ? Number((100 * STAT.deadlineCoverage.delivered / (STAT.deadlineCoverage.observed - STAT.deadlineCoverage.censored - STAT.deadlineCoverage.superseded)).toFixed(2)) : null,
      expiryRatePercent: STAT.deadlineCoverage.observed > STAT.deadlineCoverage.censored + STAT.deadlineCoverage.superseded
        ? Number((100 * STAT.deadlineCoverage.expiredUnserved / (STAT.deadlineCoverage.observed - STAT.deadlineCoverage.censored - STAT.deadlineCoverage.superseded)).toFixed(2)) : null
    },
    choiceBranches,
    catalogSummary: devSummarizeCatalogFindings(catalogFindings),
    catalogFindings,
    failures: result.failures
  };
}

function compareDevSimulationReports(current, baseline) {
  if (
    !baseline ||
    baseline.schema !== "terra-dev-simulation-report" ||
    baseline.schemaVersion !== DEV_SIMULATION_REPORT_VERSION ||
    !Array.isArray(baseline.eventCoverage) ||
    !baseline.summary
  )
    throw new Error(devSimulationReportVersionError(baseline));
  const sameConfig = JSON.stringify(current.options) === JSON.stringify(baseline.options),
    previousById = new Map(baseline.eventCoverage.map(row => [row.eventId, row])),
    currentById = new Map(current.eventCoverage.map(row => [row.eventId, row])),
    eventChanges = [...new Set([...previousById.keys(), ...currentById.keys()])].flatMap(eventId => {
      const old = previousById.get(eventId), row = currentById.get(eventId);
      const change = { eventId, status: !old ? "added" : !row ? "removed" : "changed",
        previousFired: old?.fired || 0, currentFired: row?.fired || 0,
        firedDelta: (row?.fired || 0) - (old?.fired || 0),
        previousCandidates: old?.candidateSlots || 0, currentCandidates: row?.candidateSlots || 0 };
      return !old || !row || change.firedDelta || change.previousCandidates !== change.currentCandidates ? [change] : [];
    }),
    previousBranches = new Map((baseline.choiceBranches || []).map(row => [row.eventId + ":" + row.choiceIndex, row])),
    currentBranches = new Map((current.choiceBranches || []).map(row => [row.eventId + ":" + row.choiceIndex, row])),
    branchChanges = [...new Set([...previousBranches.keys(), ...currentBranches.keys()])].flatMap(key => {
      const old = previousBranches.get(key), row = currentBranches.get(key), branch = row || old;
      const before = new Map((old?.outcomes || []).map(item => [item.outcomeIndex, item]));
      const after = new Map((row?.outcomes || []).map(item => [item.outcomeIndex, item]));
      return [...new Set([...before.keys(), ...after.keys()])].flatMap(outcomeIndex => {
        const prior = before.get(outcomeIndex), next = after.get(outcomeIndex);
        return prior && next && prior.count === next.count && prior.probability === next.probability ? [] : [{
          eventId: branch.eventId, choiceIndex: branch.choiceIndex, outcomeIndex,
          status: !prior ? "added" : !next ? "removed" : "changed",
          previous: prior?.count || 0, current: next?.count || 0,
          delta: (next?.count || 0) - (prior?.count || 0),
          previousProbability: prior?.probability ?? null, currentProbability: next?.probability ?? null
        }];
      });
    }),
    distributionChanges = Object.fromEntries(Object.keys(current.distributions).map(key => {
      const previousMedian = baseline.distributions?.[key]?.median ?? null,
        currentMedian = current.distributions[key].median ?? null;
      const delta = previousMedian == null || currentMedian == null
        ? null
        : Number((currentMedian - previousMedian).toFixed(2));
      return [key, { previousMedian, currentMedian, delta }];
    }));
  return {
    sameConfig,
    sameDataFingerprint: current.fingerprints.data === baseline.fingerprints?.data,
    sameSourceFingerprint: current.fingerprints.source === baseline.fingerprints?.source,
    note: sameConfig
      ? "同一設定での記述的な差分です。統計的有意差や正史上の頻度を示しません。"
      : "実行条件が異なります。差分は条件差を含むため参考値です。",
    summary: Object.fromEntries(
      ["sampled", "died", "reachedYearLimit", "infectedAtEnd", "diagnosedAtEnd", "runtimeFailures", "stateFailures", "choiceBlocked"].map(key => [
        key,
        {
          previous: baseline.summary[key] || 0,
          current: current.summary[key] || 0,
          delta: (current.summary[key] || 0) - (baseline.summary[key] || 0)
        }
      ])
    ),
    eventChanges,
    branchChanges,
    distributionChanges
  };
}

function formatDevSimulationSummary(report) {
  const s = report.summary,
    d = report.distributions;
  return [
    `結果: ${s.completion} / ${s.attempted}/${s.requested}人を試行（標本 ${s.sampled}人、死亡 ${s.died}人、年数上限 ${s.reachedYearLimit}人）`,
    `処理: ${((report.elapsedMs || 0) / 1000).toFixed(2)}秒 / ${s.processedYears || 0}年 / 地域方式 ${report.options.regionSampling === "balanced" ? "地域別同数" : "自然抽選・地域指定"}`,
    `設定: seed ${report.options.masterSeed} / 出生年 ${report.options.birthYearMin}〜${report.options.birthYearMax}`,
    `地域 ${report.options.region || "抽選"} / 種族 ${report.options.race || "抽選"} / 家計 ${report.options.wealth || "抽選"} / 最大 ${report.options.maxYears}年`,
    `平均享年 ${s.meanAgeAtDeath ?? "—"} / 状態検査 ${s.totalStateChecks}回 / 実行例外 ${s.runtimeFailures} / 状態不整合 ${s.stateFailures}`,
    `イベント枠 ${s.totalEventSlots} / 選択不能 ${s.choiceBlocked} / 同月重複 ${s.duplicateChoiceMonths} / 死後処理 ${s.postDeathFireAttempts}`,
    `死因判定の入口: イベント ${report.deathOrigins?.event || 0} / 年次 ${report.deathOrigins?.annual || 0} / 不明 ${report.deathOrigins?.unknown || 0}`,
    `感染状態（試行終了時）: 感染 ${s.infectedAtEnd}人 / 診断済み ${s.diagnosedAtEnd}人 / 主な死因 ${JSON.stringify(report.deathCauses)}`,
    `健康 中央値 ${d.health.median ?? "—"}（P10–P90 ${d.health.p10 ?? "—"}–${d.health.p90 ?? "—"}） / 幸福 ${d.wellbeing.median ?? "—"}`,
    `知識 中央値 ${d.knowledge.median ?? "—"} / 人間関係中央値 ${d.relations.median ?? "—"}`,
    `純資産 中央値 ${d.netAssets.median ?? "—"} / 負債中央値 ${d.debt.median ?? "—"} / 学習段階中央値 ${d.educationLevel.median ?? "—"}`,
    `指紋: data ${report.fingerprints.data} / source ${report.fingerprints.source}`,
    report.comparison
      ? `比較: ${report.comparison.note} / 差のあるイベント ${report.comparison.eventChanges.length}件`
      : "比較: 同一タブ内の前回結果または読み込んだJSONを指定できます。",
    "集計値はゲーム設定に基づく標本結果です。公式人口比や正史上のイベント頻度ではありません。"
  ].join("\n");
}

function renderDevSimulationDetails(report) {
  const summary = document.getElementById("dv"),
    events = document.getElementById("dev-event-report"),
    findings = document.getElementById("dev-catalog-report"),
    failures = document.getElementById("dev-failure-report"),
    compare = document.getElementById("dev-compare-report");
  const cohortOutput = document.getElementById("dev-cohort-report");
  if (cohortOutput) cohortOutput.textContent = formatDevLifePaths(report.lifePaths);
  if (summary) summary.textContent = formatDevSimulationSummary(report);
  if (events) events.textContent = JSON.stringify({ eventCoverage: report.eventCoverage, choiceBranches: report.choiceBranches }, null, 2);
  if (findings) findings.textContent = formatDevCatalogFindings(report.catalogFindings);
  if (failures) failures.textContent = JSON.stringify(report.failures, null, 2);
  if (compare) compare.textContent = report.comparison ? JSON.stringify(report.comparison, null, 2) : "比較結果なし";
  const download = document.getElementById("dev-download-report"),
    replay = document.getElementById("dev-replay-failure");
  if (download) download.disabled = false;
  if (replay) replay.disabled = !report.failures.length;
  const selection = document.getElementById("dev-failure-select");
  if (selection?.replaceChildren) {
    selection.replaceChildren();
    const rows = report.failures.length ? report.failures : [null];
    rows.forEach((row, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = row ? `${index + 1}: ${row.eventId || row.type} / ${row.count}件 / seed ${row.example.seed} / ${row.error}` : "失敗なし";
      selection.append(option);
    });
    selection.disabled = !report.failures.length;
  }
}

function devDownloadSimulationReport() {
  if (!DEV_LAST_SIMULATION_REPORT) return;
  const blob = new Blob([JSON.stringify(DEV_LAST_SIMULATION_REPORT, null, 2)], { type: "application/json" }),
    link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `terra-dev-simulation-${DEV_LAST_SIMULATION_REPORT.fingerprints.source}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function devRenderComparison(report, baseline = DEV_BASELINE_SIMULATION_REPORT) {
  if (!baseline) {
    report.comparison = null;
    return;
  }
  try {
    report.comparison = compareDevSimulationReports(report, baseline);
  } catch (error) {
    report.comparison = { error: error.message, eventChanges: [] };
  }
}

function initDeveloperTools() {
  const panel = document.querySelector?.("#developer-tools");
  if (!panel) return;
  const initialize = () => {
    if (panel.dataset.devToolsInitialized) return;
    panel.dataset.devToolsInitialized = "true";
    initializeDeveloperToolControls();
  };
  if (panel.open) initialize();
  else panel.addEventListener("toggle", () => {
    if (panel.open) initialize();
  });
}

function initializeDeveloperToolControls() {
  const setOptions = (id, values, emptyLabel) => {
    const select = document.getElementById(id);
    if (!select || select.dataset.initialized) return;
    select.dataset.initialized = "true";
    select.replaceChildren();
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = emptyLabel;
    select.append(empty);
    for (const value of values) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.append(option);
    }
  };
  setOptions("dev-region", REG.map(row => row.n), "全地域から抽選");
  setOptions("dev-race", RACE.map(row => row.n), "種族を抽選");
  setOptions("dev-wealth", WEALTH.map(row => row.n), "家計階層を抽選");
  const baselineInput = document.getElementById("dev-baseline-file");
  if (baselineInput && !baselineInput.dataset.initialized) {
    baselineInput.dataset.initialized = "true";
    baselineInput.addEventListener("change", async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        if (file.size > 10 * 1024 * 1024) throw new Error("比較ファイルは10MB以下にしてください。");
        const baseline = JSON.parse(await file.text());
        if (baseline.schema !== "terra-dev-simulation-report" || baseline.schemaVersion !== DEV_SIMULATION_REPORT_VERSION)
          throw new Error(devSimulationReportVersionError(baseline));
        DEV_BASELINE_SIMULATION_REPORT = baseline;
        if (DEV_LAST_SIMULATION_REPORT) {
          devRenderComparison(DEV_LAST_SIMULATION_REPORT);
          renderDevSimulationDetails(DEV_LAST_SIMULATION_REPORT);
        }
        document.getElementById("dev-status").textContent = `比較用レポートを読み込みました: ${file.name}`;
      } catch (error) {
        document.getElementById("dev-status").textContent = `比較レポートを読み込めません: ${error.message}`;
      } finally {
        event.target.value = "";
      }
    });
  }
  const filter = document.getElementById("dev-event-filter");
  if (filter && !filter.dataset.initialized) {
    filter.dataset.initialized = "true";
    filter.addEventListener("input", () => {
      const report = DEV_LAST_SIMULATION_REPORT,
        target = document.getElementById("dev-event-report");
      if (!report || !target) return;
      const term = filter.value.trim().toLocaleLowerCase("ja"),
        eventCoverage = report.eventCoverage.filter(row => `${row.eventId} ${row.reachability}`.toLocaleLowerCase("ja").includes(term)),
        choiceBranches = report.choiceBranches.filter(row => `${row.eventId} ${row.label}`.toLocaleLowerCase("ja").includes(term));
      target.textContent = JSON.stringify({ eventCoverage, choiceBranches }, null, 2);
    });
  }
}
