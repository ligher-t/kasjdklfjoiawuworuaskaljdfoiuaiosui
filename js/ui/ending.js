// Death screen and peer simulation.
function die(c, l, monthBasis = null, episodeId = null) {
  const s = S;
  if (s.dead) return;
  const before = traceState(s);
  endPlayerEmployment(s, "death");
  if(educationLive(s)||s.educationPath?.status==="paused")
    educationEnd(s,"deceased","在学中に死亡し、課程を修了できなかった","death");
  const journeyLocation = travelDeathLocation(s);
  if (journeyLocation) {
    s.deathTravel = journeyLocation;
    travelEnd(s, "ended-by-death");
  }
  s.dead = 1;
  s.dc = c;
  s.dl = l;
  // Hidden peer simulations must never erase the real player\'s autosave.
  if (!HL) {
    try {
      localStorage.removeItem("terra2");
    } catch (e) {}
  }
  // Annual mortality is not a dated incident. Keep month=0 when unknown.
  const annualMonthWasUnassigned = !s.mo;
  if (annualMonthWasUnassigned && !monthBasis) s.mo = 0;
  s.deathOrigin = ["choice","daily"].includes(TRACE_RESOLUTION?.kind) ? "event" : "annual";
  s.deathProcess = mortalityDeathDetail(
    s,
    c,
    l,
    monthBasis || (annualMonthWasUnassigned ? "annual-month-unknown" : "current-calendar-month"),
    episodeId
  );
  if (TRACE_RESOLUTION && !(HL && !CAPTURE_TRACE)) {
    PENDING_DEATH_TRACE = {
      version: TRACE_VERSION,
      kind: "death",
      id: c,
      year: s.year,
      age: s.age,
      month: s.mo || 0,
      details: { text: l, causedBy: { ...TRACE_RESOLUTION } },
      before,
      after: traceState(s)
    };
  } else recordTrace("death", c, { text: l }, before);
  L(`<span class="bad">${l}</span>`);
  rd();
  // Hidden comparison deaths must finalize the state, never replace the
  // visible ending or detach the peer result container being populated.
  if (HL) return;
  $("ctl").hidden = 1;
  tab("c");
  if (!HL) window.scrollTo(0, 0);
  const r = $("rs");
  r.hidden = 0;
  r.innerHTML =
    `<header class="ui-ending-heading">${terminalRecordImage("archive", "ui-ending-illustration")}<p class="ui-register" aria-hidden="true">LIFE RECORD / TERRA / ARCHIVE</p>` +
    `<div class="ui-record-path">${terminalRecordPathMarkup(s, "生涯の記録")}</div><p class="ui-ending-kicker">生涯の記録 / 終幕</p>` +
    `<h2 id="ending-title">${esc(s.nm)}は<span class="ui-ending-age">${s.age}<small>歳</small></span>で生涯を終えた</h2>` +
    `<p class="ui-ending-period">テラ暦${s.by}年 <span aria-hidden="true">―</span> ${s.year}年</p>` +
    `<p class="ui-ending-place">${s.year}年、${esc(s.deathTravel?.label || s.res.n)}にて</p>` +
    `<div class="ui-ending-cause"><p><strong>死因の分類</strong><span>${c}</span></p>` +
    `<p class="cause"><strong>記録された経緯</strong><span>${l}</span></p></div></header>` +
    `<div class="ui-ending-actions" role="group" aria-label="人生を終えた後の操作"><section class="ui-ending-next"><h3>次の人生</h3><p>また別の時代、別の土地で産声を上げる。</p>` +
    `<button class="go" type="button" onclick="born()">もう一度生まれる →</button></section>` +
    `<section><h3>記録を持ち帰る</h3><p>この生涯の歩みと日々の記録をJSON形式で手元に残します。</p>` +
    `<button type="button" onclick="exportLife()">記録を書き出す</button></section></div>` +
    `<nav class="ui-ending-toc" aria-labelledby="ending-toc-title"><div class="ui-ending-toc-head"><h3 id="ending-toc-title">記録の目次</h3><span class="ui-register" aria-hidden="true">ARCHIVE / INDEX</span></div>` +
    `<ol><li><a href="#ending-summary"><span>01</span>生涯の要約</a></li>` +
    `<li><a href="#ending-metrics"><span>02</span>人生を通じた主な指標</a></li>` +
    `<li><a href="#ending-peers"><span>03</span>同じ年に生まれた別の人々</a></li>` +
    `<li><a href="#life-journal-panel"><span>04</span>人生の記録</a></li></ol></nav>` +
    `<section id="ending-summary" tabindex="-1" class="ui-ending-record" aria-labelledby="ending-record-title"><h3 id="ending-record-title">生涯の記録</h3>${lifeSummaryMarkup(s)}</section>` +
    `<figure id="ending-metrics" tabindex="-1" class="ui-ending-chart"><figcaption>人生を通じた主な指標</figcaption>${chart(s.hs)}` +
    `<p class="nt">職業:${occupationLabel(s)} / 学歴・就学:${educationStandingLabel(s)} / 最終純資産:${m(s.cash + (s.investment || 0) - s.debt)}</p></figure>` +
    `<section id="ending-peers" tabindex="-1" class="ui-ending-comparison" aria-labelledby="ending-comparison-title">` +
    `<h3 id="ending-comparison-title">同じ年に生まれた、別の人々</h3><div class="peers" aria-live="polite" aria-busy="true">` +
    `<p class="nt" role="status">同じ年・同じ誕生日から始まる${endingPeerCount()}人の人生を計算しています…</p></div></section>` +
    `${["自殺", "自死"].includes(c) ? '<p class="nt ui-ending-support">※創作作品です。つらい気持ちを抱えているときは、よりそいホットライン(0120-279-338)などに相談できます。</p>' : ""}` +
`<p class="nt ui-ending-archive-note">この人生の出来事は「人生の記録」から読み返せます。</p>`;
  r.setAttribute("aria-labelledby", "ending-title");
  // Focus must not scroll the ending heading under the fixed toolbar.
  r.focus?.({preventScroll:true});
  if (!HL) {
    // The documented world.maxLifeEvents setting controls the comparison count.
    // Keep each expensive peer simulation isolated so one failure is not fatal.
    setTimeout(() => renderEndingPeers(s, r), 30);
  }
}
// The documented parameter defaults to three comparison lifetimes.
function endingPeerCount() {
  const configured = P("world.maxLifeEvents");
  return Number.isSafeInteger(configured) && configured >= 1 && configured <= 6 ? configured : 3;
}
// Comparison lifetimes run in their own worker; the visible life remains untouched.
let ENDING_PEERS_ACTIVE = null;
const ENDING_PEERS_CACHE = new Map();
function cancelEndingPeerComparison() {
  if (!ENDING_PEERS_ACTIVE) return;
  ENDING_PEERS_ACTIVE.worker.terminate();
  ENDING_PEERS_ACTIVE = null;
}
function renderEndingPeers(life, root, retryAttempt = 0) {
  if (S !== life || !life.dead || root?.hidden) return;
  cancelEndingPeerComparison();
  const box = root?.querySelector(".peers");
  if (!box) return;
  const count = endingPeerCount(),
    seed = Number.isInteger(life.randomSeed) ? life.randomSeed : life.by,
    key = JSON.stringify([ENGINE_REVISION, seed, life.by, life.bd, count, retryAttempt]),
    cached = ENDING_PEERS_CACHE.get(key),
    results = cached ? cached.slice() : Array(count).fill(null);
  let received = cached ? count : 0;
  const present = finished => {
    if (S !== life || root.hidden) return;
    const peers = results.filter(person => person && !person.error);
    const failed = results.filter(person => person?.error).length;
    const html = results.map((person, index) =>
      person && !person.error
        ? `<div class="peer"><b>${index + 1}.</b> ${esc(person.nm)} — ${esc(person.res)}・${esc(person.local)}／${esc(person.r)}／${esc(person.care)}。${person.age}歳没・${esc(person.dc)}` +
          `。<span class="nt">${esc(person.job)}・${esc(person.edu)}・移住${person.moves}回</span></div>`
        : "").join("");
    const note = finished
      ? peers.length
        ? '<p class="nt">同じ年の同じ日に生を享けても、降り立った土地や巡り合わせによって、歩む道はこれほど変わります。</p>'
        : '<p class="nt" role="status">今回は比較する人生を作成できませんでした。</p>'
      : `<p class="nt" role="status">比較する人生を計算しています（${received}/${count}人）…</p>`;
    box.innerHTML = html + note + (finished && failed
      ? '<p class="nt">一部の比較記録を作成できませんでした。</p>' +
        (retryAttempt < 2 ? '<button type="button" class="ui-peer-retry">別の条件で比較を再試行</button>' :
        '<p class="nt">これ以上の自動再試行は行いません。</p>')
      : "");
    box.setAttribute("aria-busy", String(!finished));
    if (finished) box.querySelector(".ui-peer-retry")?.addEventListener("click", () => {
      if (S !== life || root.hidden) return;
      box.innerHTML = '<p class="nt" role="status">比較する人生を再計算しています…</p>';
      setTimeout(() => renderEndingPeers(life, root, retryAttempt + 1), 30);
    });
  };
  if (cached) {
    present(true);
    return;
  }
  if (typeof Worker !== "function") {
    box.innerHTML = '<p class="nt" role="status">この環境では比較人生を計算する機能が利用できません。</p>';
    box.setAttribute("aria-busy", "false");
    return;
  }
  let worker;
  try {
    worker = new Worker("js/ui/ending-peer-worker.js", { name: "terra-ending-peers" });
  } catch (error) {
    console.error("ending peer worker initialization failed", error);
    box.innerHTML = '<p class="nt" role="status">比較人生の計算を開始できませんでした。</p>';
    box.setAttribute("aria-busy", "false");
    return;
  }
  const active = { worker, life, root };
  ENDING_PEERS_ACTIVE = active;
  const current = () => ENDING_PEERS_ACTIVE === active && S === life &&
    life.dead && !root.hidden && root.isConnected !== false;
  const stop = () => {
    if (ENDING_PEERS_ACTIVE === active) cancelEndingPeerComparison();
  };
  const finish = () => {
    if (!current()) { stop(); return; }
    for (let i = 0; i < count; i++) if (results[i] === null) results[i] = { error: true };
    received = count;
    if (results.every(person => !person.error)) {
      ENDING_PEERS_CACHE.set(key, results.slice());
      if (ENDING_PEERS_CACHE.size > 8) ENDING_PEERS_CACHE.delete(ENDING_PEERS_CACHE.keys().next().value);
    }
    stop();
    present(true);
  };
  worker.onmessage = ({ data }) => {
    if (!current()) { stop(); return; }
    if (data?.type === "peer" && Number.isInteger(data.index) &&
        data.index >= 0 && data.index < count && results[data.index] === null) {
      results[data.index] = data.person || { error: data.error || true };
      received++;
      present(false);
    } else if (data?.type === "done") {
      finish();
    } else if (data?.type === "fatal") {
      console.error("ending peer worker failed", data.error);
      finish();
    }
  };
  worker.onerror = error => {
    console.error("ending peer worker error", error);
    finish();
  };
  worker.onmessageerror = error => {
    console.error("ending peer worker message error", error);
    finish();
  };
  worker.postMessage({
    type: "run", revision: ENGINE_REVISION, seed, by: life.by, bd: life.bd,
    count, retryAttempt
  });
}
function endingPeerSeed(base, index) {
  let value = (Number(base) ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0 || 0x6d2b79f5;
}
function simPeer(seed = null, birthDetails = null) {
  const cloneStats = value =>
    value instanceof Set
      ? new Set(value)
      : Array.isArray(value)
        ? value.map(cloneStats)
        : value && Object.getPrototypeOf(value) === Object.prototype
          ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneStats(item)]))
          : value;
  const bkS = S,
    bkLifeRngState = bkS?.rngState,
    bkW = W,
    baAU = AU,
    bcAcc = acc,
    bkHL = HL,
    bsSpeed = sp,
    bkDebugRandom = DEBUG_RANDOM,
    bkRandomSeed = RANDOM_SEED,
    bkRandomState = RANDOM_STATE,
    bkTraceResolution = TRACE_RESOLUTION,
    bkPendingDeathTrace = PENDING_DEATH_TRACE,
    bkCaptureTrace = CAPTURE_TRACE,
    bkStatistics = cloneStats(STAT);
  let peer = null,
    failure = null;
  try {
    // Normal play has not initialized the batch-simulation opportunity map.
    // Each hidden life owns fresh counters; restore the caller's in finally.
    resetSimulationStatistics();
    replaceWorldKnowledge({});
    HL = 1;
    AU = "r";
    sp = 0;
    acc = 0;
    DEBUG_RANDOM = null;
    TRACE_RESOLUTION = null;
    PENDING_DEATH_TRACE = null;
    CAPTURE_TRACE = false;
    const birth = { by: birthDetails?.by ?? bkS?.by, bd: birthDetails?.bd ?? bkS?.bd };
    if (Number.isSafeInteger(seed)) birth.seed = seed;
    born(birth);
    let g = 0;
    while (!S.dead && g++ < 400) {
      for (const q of S.q.splice(0)) {
        if (S.dead) break;
        slot(q);
      }
      if (!S.dead) tick();
    }
    // Never present an unfinished or capped simulation as a valid death.
    if (!S.dead) throw new Error("比較人生が完了する前に400年の計算上限へ達しました");
    peer = {
      nm: S.nm,
      age: S.age,
      res: S.res.n,
      local: S.residenceBase?.label || S.local.kind,
      r: S.r.n,
      care: S.care.kind,
      moves: S.moves.length,
      dc: S.dc || "?",
      dl: S.dl || "",
      cash: S.cash - S.debt,
      job: occupationLabel(S),
      edu: educationStandingLabel(S)
    };
  } catch (e) {
    failure = e;
    console.error(e);
  } finally {
    replaceCurrentLife(bkS);
    replaceWorldKnowledge(bkW);
    HL = bkHL;
    AU = baAU;
    acc = bcAcc;
    sp = bsSpeed;
    DEBUG_RANDOM = bkDebugRandom;
    RANDOM_SEED = bkRandomSeed;
    RANDOM_STATE = bkRandomState;
    TRACE_RESOLUTION = bkTraceResolution;
    PENDING_DEATH_TRACE = bkPendingDeathTrace;
    CAPTURE_TRACE = bkCaptureTrace;
    if (bkS && "rngState" in bkS) bkS.rngState = bkLifeRngState;
    for (const key of Object.keys(STAT)) delete STAT[key];
    Object.assign(STAT, bkStatistics);
  }
  if (failure) throw failure;
  if (!peer) throw new Error("比較する人生の計算結果がありません。");
  return peer;
}
