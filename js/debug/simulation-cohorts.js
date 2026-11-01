// Observational diagnostics only: no random draws or changes to life state.
function devCreateAnalytics() {
  return { residences: {}, transitions: {}, paths: {}, lifeDurations: [], observedLives: 0 };
}
function devCountResidence(analytics, phase, region, home) {
  const key = JSON.stringify([phase, region || "不明"]);
  const row = analytics.residences[key] ||= { phase, region: region || "不明", total: 0, mobile: 0, fixed: 0, unknown: 0 };
  row.total++;
  if (home === "移動都市") row.mobile++;
  else if (home === "固定集落") row.fixed++;
  else row.unknown++;
}
function devPathState(s) {
  return {
    education: `${s.fl?.sch ? "就学経験あり" : "就学未確認"} / ${EL[eduLv(s)]}`,
    work: (typeof occupationLabel === "function" ? occupationLabel(s) : J[s.job]?.n) || "不明",
    family: s.sp ? s.sp.d ? "配偶者死亡" : spouseLivesWithProtagonist(s) ? "配偶者と同居" : "配偶者と別居" : s.romance ? "交際相手あり" : "配偶者・交際相手なし",
    medical: `${s.inf ? "感染" : "非感染"} / ${s.fl?.dg ? "診断済み" : "診断未確認"} / ${s.fl?.tx ? "治療中" : "治療なし"}`,
    affiliations: Object.fromEntries((s.lifeRecord?.affiliations || []).map(row => [row.id, row.status]))
  };
}
function devCreateLifeObserver(s, analytics, lifeIndex, seed) {
  analytics.observedLives++;
  devCountResidence(analytics, "birth", s.origin?.n || s.g?.n || s.res?.n, s.home);
  return {
    previous: null, moves: 0, seen: new Set(), countedPaths: new Set(), lifeIndex, seed,
    birthRegion: s.origin?.n || s.g?.n || s.res?.n || "不明",
    lastAnnualYear: s.year, durationRecorded: false,
    duration: {
      observedYears: 0,
      eventFreeCurrentYears: 0, eventFreeStartYear: null,
      maxEventFreeYears: 0, maxEventFreeFromYear: null, maxEventFreeThroughYear: null,
      noJobCurrentYears: 0, noJobStartYear: null,
      maxNoJobYears: 0, maxNoJobFromYear: null, maxNoJobThroughYear: null
    }
  };
}
function devObserveLife(s, observer, analytics, { annualCheckpoint = false } = {}) {
  const state = devPathState(s), previous = observer.previous;
  if (annualCheckpoint && Number.isInteger(s.year) && Number.isInteger(observer.lastAnnualYear)) {
    const elapsedYears = Math.max(0, s.year - observer.lastAnnualYear);
    const hasRecordedJob = Number(s.job) > 0 && Boolean(J[s.job]?.n);
    for (let offset = 0; offset < elapsedYears; offset++) {
      const year = observer.lastAnnualYear + offset;
      const duration = observer.duration;
      duration.observedYears++;
      if (STAT.lifeEventYears?.has(year)) {
        duration.eventFreeCurrentYears = 0;
        duration.eventFreeStartYear = null;
      } else {
        if (!duration.eventFreeCurrentYears) duration.eventFreeStartYear = year;
        duration.eventFreeCurrentYears++;
        if (duration.eventFreeCurrentYears > duration.maxEventFreeYears) {
          duration.maxEventFreeYears = duration.eventFreeCurrentYears;
          duration.maxEventFreeFromYear = duration.eventFreeStartYear;
          duration.maxEventFreeThroughYear = year;
        }
      }
      if (hasRecordedJob) {
        duration.noJobCurrentYears = 0;
        duration.noJobStartYear = null;
      } else {
        if (!duration.noJobCurrentYears) duration.noJobStartYear = year;
        duration.noJobCurrentYears++;
        if (duration.noJobCurrentYears > duration.maxNoJobYears) {
          duration.maxNoJobYears = duration.noJobCurrentYears;
          duration.maxNoJobFromYear = duration.noJobStartYear;
          duration.maxNoJobThroughYear = year;
        }
      }
    }
    observer.lastAnnualYear = s.year;
  }
  const record = (domain, from, to) => {
    if (from === to) return;
    const key = JSON.stringify([domain, from, to]);
    const row = analytics.transitions[key] ||= { domain, from, to, occurrences: 0, examples: [] };
    row.occurrences++;
    if (row.examples.length < 3) row.examples.push({ lifeIndex: observer.lifeIndex, seed: observer.seed, year: s.year, age: s.age });
  };
  if (previous) {
    for (const domain of ["education", "work", "family", "medical"]) record(domain, previous[domain], state[domain]);
    for (const id of new Set([...Object.keys(previous.affiliations), ...Object.keys(state.affiliations)]))
      record("affiliation:" + id, previous.affiliations[id] || "記録なし", state.affiliations[id] || "記録なし");
  }
  // Observe every audited checkpoint, so bounded gameplay history cannot erase counts.
  const milestones = [];
  if (s.fl?.sch || s.socialLearning?.schoolAccessYears > 0) milestones.push("school");
  if (s.job > 0) milestones.push("work");
  if (s.romance) milestones.push("relationship");
  if (s.sp && !s.sp.d && spouseLivesWithProtagonist(s)) milestones.push("cohabitation");
  if (s.sp && !s.sp.d && !spouseLivesWithProtagonist(s)) milestones.push("separation");
  if (s.inf) milestones.push("infection");
  if (s.fl?.dg) milestones.push("diagnosis");
  if (s.fl?.tx) milestones.push("treatment");
  const affiliations = Object.values(state.affiliations);
  if (affiliations.some(status => ["active", "crisis", "suspended"].includes(status))) milestones.push("affiliation");
  if (affiliations.some(status => ["left", "ended"].includes(status))) milestones.push("departure");
  for (const [from, to] of [["school", "work"], ["relationship", "cohabitation"], ["cohabitation", "separation"], ["infection", "diagnosis"], ["diagnosis", "treatment"], ["affiliation", "departure"]]) {
    const key = from + "→" + to;
    if (observer.seen.has(from) && !observer.seen.has(to) && milestones.includes(to) && !observer.countedPaths.has(key)) {
      analytics.paths[key] = (analytics.paths[key] || 0) + 1;
      observer.countedPaths.add(key);
    }
  }
  milestones.forEach(value => observer.seen.add(value));
  const moves = s.moves || [];
  for (const move of moves.slice(observer.moves)) devCountResidence(analytics, "arrival", move.to, move.toHome);
  observer.moves = moves.length;
  observer.previous = state;
}
function devFinalizeLifeObserver(observer, analytics, status = "finished") {
  if (!observer || observer.durationRecorded) return;
  observer.durationRecorded = true;
  const duration = observer.duration;
  analytics.lifeDurations.push({
    lifeIndex: observer.lifeIndex,
    seed: observer.seed,
    birthRegion: observer.birthRegion || "不明",
    status,
    observedYears: duration.observedYears,
    maxEventFreeYears: duration.maxEventFreeYears,
    eventFreeFromYear: duration.maxEventFreeFromYear,
    eventFreeThroughYear: duration.maxEventFreeThroughYear,
    maxYearsWithoutRecordedJob: duration.maxNoJobYears,
    noRecordedJobFromYear: duration.maxNoJobFromYear,
    noRecordedJobThroughYear: duration.maxNoJobThroughYear,
    endingWorkState: observer.previous?.work || "不明"
  });
}

function devTopDurationExamples(rows, field) {
  return [...rows]
    .filter(row => row[field] > 0)
    .sort((a, b) => b[field] - a[field] || a.lifeIndex - b.lifeIndex)
    .slice(0, 5);
}

function devFinalizeAnalytics(analytics = devCreateAnalytics(), options) {
  const lifeDurations = analytics.lifeDurations.map(row => ({ ...row })),
    longestEventFree = devTopDurationExamples(lifeDurations, "maxEventFreeYears"),
    longestWithoutRecordedJob = devTopDurationExamples(lifeDurations, "maxYearsWithoutRecordedJob");
  return {
    sampling: options.regionSampling || "natural", fixedRegion: options.region || null,
    observedLives: analytics.observedLives,
    residences: Object.values(analytics.residences).map(row => ({ ...row, mobilePercent: row.total ? Number((100 * row.mobile / row.total).toFixed(2)) : null })),
    transitions: Object.values(analytics.transitions), orderedPaths: analytics.paths,
    durationCoverage: { recordedLives: lifeDurations.length, annualCheckpoints: lifeDurations.reduce((sum, row) => sum + row.observedYears, 0) },
    lifeDurations,
    longestEventFreeExamples: longestEventFree,
    longestWithoutRecordedJobExamples: longestWithoutRecordedJob,
    note: "空白期間は年次チェックポイントで数える。イベント未発生は観測した暦年に発生記録がない状態。職業記録なしは年次時点で現在の職業IDがない状態で、失業を断定しない。進学・療養・退職などの状態と併せて読む。例のseed・年・地域は再現用で、発生率やテラの人口統計ではない。"
  };
}
function formatDevLifePaths(paths) {
  if (!paths) return "このレポートには地域・人生経路の集計がありません。";
  const lines = [paths.sampling === "balanced" ? "地域別同数試行（中止・失敗時の完了人数は不均等になり得ます）" : paths.fixedRegion ? `出生地域固定: ${paths.fixedRegion}` : "出生地域を自然抽選", paths.note, `観測した人生: ${paths.observedLives}人`, "", "地域別居住形態（移動都市 / 固定集落 / 不明 / 合計・移動都市率）"];
  for (const row of paths.residences) lines.push(`${row.phase === "birth" ? "出生" : "転居先"} / ${row.region}: ${row.mobile} / ${row.fixed} / ${row.unknown} / ${row.total}・${row.mobilePercent}%`);
  const labels = {school:"就学",work:"就業",relationship:"交際",cohabitation:"配偶者と同居",separation:"配偶者と別居",infection:"感染",diagnosis:"診断",treatment:"治療",affiliation:"所属",departure:"離脱"};
  lines.push("", "順序を確認した人生経路（人数）");
  for (const [from,to] of [["school","work"],["relationship","cohabitation"],["cohabitation","separation"],["infection","diagnosis"],["diagnosis","treatment"],["affiliation","departure"]]) lines.push(`${labels[from]} → ${labels[to]}: ${paths.orderedPaths[from+"→"+to] || 0}`);
  lines.push("", "年次チェックポイントの空白期間");
  lines.push("観測した試行: " + (paths.durationCoverage?.recordedLives || 0) + "人 / " +
    (paths.durationCoverage?.annualCheckpoints || 0) + "年次確認");
  const eventGap = paths.longestEventFreeExamples?.[0];
  lines.push(eventGap
    ? "イベント未発生の最長期間: " + eventGap.maxEventFreeYears + "年（" +
      eventGap.eventFreeFromYear + "〜" + eventGap.eventFreeThroughYear + "年、人生" +
      eventGap.lifeIndex + "、seed " + eventGap.seed + "、" + eventGap.birthRegion + "）"
    : "イベント未発生期間: 0年");
  const workGap = paths.longestWithoutRecordedJobExamples?.[0];
  lines.push(workGap
    ? "職業記録がない最長期間: " + workGap.maxYearsWithoutRecordedJob + "年（" +
      workGap.noRecordedJobFromYear + "〜" + workGap.noRecordedJobThroughYear + "年、人生" +
      workGap.lifeIndex + "、seed " + workGap.seed + "、" + workGap.birthRegion +
      "）。失業とは断定せず、進学・療養・退職などの状態と併せて確認。"
    : "職業記録がない期間: 0年");
  lines.push("", "状態遷移の内訳", JSON.stringify(paths.transitions, null, 2));
  return lines.join("\n");
}
