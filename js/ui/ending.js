// Death screen and peer simulation.
function die(c, l, monthBasis = null, episodeId = null) {
  const s = S;
  if (s.dead) return;
  const before = traceState(s);
  if(educationLive(s)||s.educationPath?.status==="paused")
    educationEnd(s,"deceased","在学中に死亡し、課程を修了できなかった","death");
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
    `<p class="ui-ending-place">${s.year}年、${s.res.n}にて</p>` +
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
// A failed peer must not hide the other valid lives, or damage the active save.
function renderEndingPeers(life, root, retryAttempt = 0) {
  if (S !== life || !life.dead) return;
  const box = root?.querySelector(".peers");
  if (!box) return;
  box.setAttribute("aria-busy", "true");
  const seed = Number.isInteger(life.randomSeed) ? life.randomSeed : life.by;
  const peers = [];
  let failed = 0;
  // A user-initiated retry selects the next deterministic group of seeds.
  // It preserves the same birth year and birthday without replaying an
  // already failing life indefinitely.
  const count = endingPeerCount();
  for (let index = 0; index < count; index++) {
    try {
      peers.push(simPeer(endingPeerSeed(seed, index + retryAttempt * count)));
    } catch (error) {
      failed++;
      console.error("ending peer " + (index + 1) + " failed", error);
    }
  }
  const html = peers.map((person, index) =>
    `<div class="peer"><b>${index + 1}.</b> ${esc(person.nm)} — ${esc(person.res)}・${esc(person.local)}／${esc(person.r)}／${esc(person.care)}。${person.age}歳没・${esc(person.dc)}` +
    `。<span class="nt">${esc(person.job)}・${esc(person.edu)}・移住${person.moves}回</span></div>`
  ).join("");
  const note = peers.length
    ? '<p class="nt">同じ年の同じ日に生を享けても、降り立った土地や巡り合わせによって、歩む道はこれほど変わります。</p>'
    : '<p class="nt" role="status">今回は比較する人生を作成できませんでした。</p>';
  box.innerHTML = html + note + (failed
    ? '<p class="nt">一部の比較記録を作成できませんでした。</p>' +
      (retryAttempt < 2 ? '<button type="button" class="ui-peer-retry">別の条件で比較を再試行</button>' :
      '<p class="nt">これ以上の自動再試行は行いません。</p>')
    : "");
  box.setAttribute("aria-busy", "false");
  box.querySelector(".ui-peer-retry")?.addEventListener("click", () => {
    if (S !== life) return;
    box.innerHTML = '<p class="nt" role="status">比較する人生を再計算しています…</p>';
    setTimeout(() => renderEndingPeers(life, root, retryAttempt + 1), 30);
  });
}
function endingPeerSeed(base, index) {
  let value = (Number(base) ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0 || 0x6d2b79f5;
}
function simPeer(seed = null) {
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
    const birth = { by: bkS.by, bd: bkS.bd };
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
