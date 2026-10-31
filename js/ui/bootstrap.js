try {
  if (localStorage.getItem("terra2")) $("ct").hidden = 0;
} catch (e) {}
renderResumeSlots();
$("resume-close").addEventListener("click", () => {
  closeUIDialog("resume-manager");
});
$("resume-manager").addEventListener("click", event => {
  if (event.target === $("resume-manager")) closeUIDialog("resume-manager");
});
$("resume-slots").addEventListener("click", event => {
  const button = event.target.closest("button[data-resume-action]");
  if (!button) return;
  const index = Number(button.dataset.resumeIndex);
  if (button.dataset.resumeAction === "save") saveResumeSlot(index);
  else if (button.dataset.resumeAction === "load") loadResumeSlot(index);
  else if (button.dataset.resumeAction === "export") exportResumeSlot(index);
  else if (button.dataset.resumeAction === "clear") clearResumeSlot(index);
});
$("resume-import-button").addEventListener("click", () => $("resume-import-file").click());
$("resume-import-file").addEventListener("change", async event => {
  const file = event.target.files?.[0],
    index = Number($("resume-import-target").value);
  await importResumeFile(file, index);
  event.target.value = "";
});
document.addEventListener("keydown", handleUIDialogKey);

document.querySelectorAll(".sg").forEach(g => {
  if (g.id == "fc" || g.id == "lf") return;
  const speeds = ["停止", "×1", "×2", "×5", "×10", "×20"];
  if (DEBUG_PLAYBACK) speeds.push("×50");
  speeds.forEach((t, n) => {
    const b = document.createElement("button");
    b.textContent = t;
    b.dataset.n = n;
    b.title = n === 0 ? "進行を停止" : n === 1 ? "1年につき約50秒" : `${t}の速さで進める`;
    b.onclick = () => play(n, "user");
    g.append(b);
  });
});
if (DEBUG_PLAYBACK) {
  let debugCheckpoint = null;
  const debugClone = (value, seen = new Map()) => {
    if (!value || typeof value !== "object") return value;
    if (seen.has(value)) return seen.get(value);
    const copy = value instanceof Set ? new Set() : Array.isArray(value) ? [] : {};
    seen.set(value, copy);
    if (value instanceof Set) for (const item of value) copy.add(debugClone(item, seen));
    else for (const [key, item] of Object.entries(value)) copy[key] = debugClone(item, seen);
    return copy;
  };
  const debugSummary = () => S ? { name:S.nm, age:S.age, year:S.year, month:S.mo,
    region:S.res?.n, home:S.home, job:J[S.job]?.n, cash:S.cash, debt:S.debt,
    health:S.h, pendingChoice:S.ev?.id || null, seed:RANDOM_SEED, rng:RANDOM_STATE } : null;
  window.TERRA_DEBUG_API = {
    version: "1.1",
    catalog: () => ({
      birthYears: {min:BIRTH_YEAR_MIN,max:BIRTH_YEAR_MAX},
      regions: REG.map(x => x.n),
      races: RACE.map(x => x.n),
      wealth: WEALTH.map(x => x.n),
      jobs: J.map((x, i) => ({ id: i, name: x.n })),
      socialPositions: [
        "都市労働者世帯",
        "農村共同体",
        "旧家・官僚の家",
        "貧民街・避難世帯",
        "鉱山・採掘の家",
        "開拓・輸送世帯",
        "市民登録のある世帯",
        "移動・離散したサルカズ世帯",
        "氏族・共同体の家",
        "移民・開拓世帯",
        "貴族・地主の家",
        "騎士団に縁のある家"
      ],
      events: EV.filter(event => event.c).map(event => ({ id:event.id, choice:true, label:typeof event.t === "string" ? event.t.slice(0,90) : event.c[0]?.l || event.id }))
    }),
    seed(seed) {
      DEBUG_RANDOM = null;
      return seedLifeRandom(seed);
    },
    newLife(options = {}) {
      if (validBirthYear(options.by ?? START) === null) throw new Error(`出生年は${BIRTH_YEAR_MIN}〜${BIRTH_YEAR_MAX}年で指定してください`);
      play(0);
      replaceCurrentLife(null);
      replaceWorldKnowledge({});
      HL = 0;
      AU = "";
      born(options);
      if (!S) return null;
      S.debugSeed = Number.isFinite(+options.seed) ? +options.seed >>> 0 : null;
      if (Number.isInteger(options.jobId)) S.job = clamp(options.jobId, 0, J.length - 1);
      if (options.infected) {
        S.inf = 1;
        S.fl.dg = 1;
        S.ob = Number.isFinite(+options.oripathyLoad) ? clamp(+options.oripathyLoad, 0, 100) : 8;
        S.infection = {
          year: S.year,
          cause: "デバッグ設定・曝露経路は指定なし",
          basis: "event-unclassified"
        };
      }
      rd();
      return this.inspect();
    },
    region() {
      return S
        ? JSON.parse(
            JSON.stringify({
              community: ensureLocalityState(S),
              archive: S.world?.localityArchive || {},
              metrics: localityStateView(S)
            })
          )
        : null;
    },
    facilities() {
      return S
        ? JSON.parse(
            JSON.stringify({
              current: Object.values(ensureLocalityState(S)?.facilities || {}),
              history: S.facilityContacts || [],
              affiliations: S.siteAffiliations || {},
              affiliationHistory: S.siteAffiliationHistory || []
            })
          )
        : null;
    },
    facilityPeople() {
      return S
        ? JSON.parse(
            JSON.stringify({
              current: Object.values(ensureLocalityState(S)?.people || {}),
              history: S.facilityPeopleContacts || []
            })
          )
        : null;
    },
    ensureContact(kind) {
      if (!S || !["friend", "neighbor"].includes(kind)) throw new Error("友人または近隣の連絡先が必要です");
      return JSON.parse(JSON.stringify(ensureSocialContact(S, kind)));
    },
    summary: debugSummary,
    inspect(includeEvents = false) {
      return S
        ? JSON.parse(
            JSON.stringify({
              state: S,
              tags: [...tags(S)],
              events: includeEvents ? EV.map(e => this.eventStatus(e.id)) : undefined
            })
          )
        : null;
    },
    setState(patch = {}) {
      if (!S || !patch || typeof patch !== "object" || Array.isArray(patch)) throw new Error("先に人生を作成してください");
      const allowed = new Set([
        "home",
        "intergroupHistory",
        "socialAftermath",
        "infection",
        "sn",
        "community",
        "siteAffiliations",
        "siteAffiliationHistory",
        "facilityContacts",
        "facilityPeopleContacts",
        "age",
        "year",
        "mo",
        "h",
        "p",
        "k",
        "rl",
        "ar",
        "cr",
        "cash",
        "debt",
        "investment",
        "inf",
        "ob",
        "job",
        "socialPosition",
        "socialClass",
        "residenceArrangement",
        "biasInfected",
        "biasSarkaz",
        "socialLearning",
        "culturalIdentity",
        "socialConflict",
        "equityLedger",
        "personTies",
        "informationResponses",
        "informationClaims",
        "f",
        "fl",
        "r",
        "g",
        "res",
        "siblings",
        "par",
        "kids",
        "sp",
        "romance",
        "illness",
        "lifeRecord",
        "known",
        "world"
      ]);
      const rejected = Object.keys(patch).filter(key => !allowed.has(key) && key !== "localCity");
      if (rejected.length) throw new Error("未対応のパッチ項目: " + rejected.join("、"));
      if (S.ev) throw new Error("保留中の選択を確定するか一時復帰してから変更してください");
      play(0);
      const before = debugClone(S);
      for (const [key, value] of Object.entries(patch))
        if (allowed.has(key)) S[key] = JSON.parse(JSON.stringify(value));
      if (typeof patch.localCity === "string") {
        S.home = "移動都市";
        if (!SIM_TABLES.locality.mobile.some(row => row.n === S.local?.kind))
          S.local = makeLocality(S.home, S.res?.n);
        S.local = { ...S.local, city: patch.localCity };
      }
      if (Number.isFinite(patch.age) && !Number.isFinite(patch.year)) S.year = S.by + S.age;
      replaceWorldKnowledge(S.known || {});
      rd();
      return { summary:debugSummary(), changes:Object.keys(S).filter(key=>JSON.stringify(before[key])!==JSON.stringify(S[key])).map(key=>({key,before:before[key],after:debugClone(S[key])})), audit:auditLifeState(S) };
    },
    setFlag(flag, value = true) {
      if (!S) throw new Error("先に人生を作成してください");
      S.fl[flag] = value ? 1 : 0;
      rd();
      return this.inspect();
    },
    eventStatus(id) {
      if (!S) throw new Error("先に人生を作成してください");
      const event=EV.find(row=>row.id===id);
      if(!event) throw new Error("イベントIDが見つかりません: "+id);
      const original={life:S,world:W,seed:RANDOM_SEED,rng:RANDOM_STATE};
      const isolated=debugClone({life:S,world:W});
      replaceCurrentLife(isolated.life);replaceWorldKnowledge(isolated.world);
      try {
      const state=S, T=tags(state);let reason=null;
      let eligible=elig(event,state,T,{onReject:(_event,gate)=>{reason ||= gate;}});
      if(eligible && event.c && state.majorEventMonth?.year===state.year && state.majorEventMonth?.month===state.mo){eligible=false;reason="monthly-choice-limit";}
      const who=typeof event.who === "function" ? event.who(state) : event.who || (stg(state)<=1 ? "parent" : "self");
      if(eligible && event.c && !event.c.some(choice=>ok(choice.show,state,T)&&ok(choice.en,state,T)&&!ethicalLock(event,choice,state,who))){eligible=false;reason="ethical-choice-lock";}
      return {id,eligible,firstBlockingGate:reason,choices:event.c?.map((choice,index)=>({index:index+1,label:tpl(choice.l,state),shown:ok(choice.show,state,T),enabled:ok(choice.show,state,T)&&ok(choice.en,state,T)&&!ethicalLock(event,choice,state,who),why:choice.why || null})) || []};
      } finally {replaceCurrentLife(original.life);replaceWorldKnowledge(original.world);RANDOM_SEED=original.seed;RANDOM_STATE=original.rng;}
    },
    forceEvent(id, requireEligible = false) {
      if (!S || S.dead) throw new Error("生存中の人生が必要です");
      const event = EV.find(x => x.id === id);
      if (!event) throw new Error("イベントIDが見つかりません: " + id);
      if (!event.c) throw new Error("選択式イベントではありません: " + id);
      if (S.ev) throw new Error("保留中の選択を確定してください");
      if (requireEligible && !this.eventStatus(id).eligible) throw new Error("発生条件を満たしません: " + this.eventStatus(id).firstBlockingGate);
      play(0);
      fire(event, S, tags(S));
      return this.inspect();
    },
    choose(index) {
      const button = $("mc").children[Number(index) - 1];
      if (!button) throw new Error("選択肢番号がありません");
      button.click();
      return this.inspect();
    },
    advanceSlot() {
      if (!S || S.dead || S.ev) throw new Error("選択待ちでない生存中の人生が必要です");
      play(0);
      if (S.q.length) { const position=S.q.shift();acc=position;slot(position); }
      else { acc=0;tick(); }
      rd();return debugSummary();
    },
    advanceToYearEnd() {
      if (!S || S.dead || S.ev) throw new Error("選択待ちでない生存中の人生が必要です");
      const year=S.year;play(0);
      while(S && !S.dead && !S.ev && S.year===year) this.advanceSlot();
      return debugSummary();
    },
    checkpoint() {
      if(!S)throw new Error("先に人生を作成してください");
      debugCheckpoint=debugClone({life:S,world:W,randomSeed:RANDOM_SEED,randomState:RANDOM_STATE,debugRandom:DEBUG_RANDOM,trace:TRACE_RESOLUTION,pending:PENDING_DEATH_TRACE,capture:CAPTURE_TRACE,speed:sp,acc,hl:HL,au:AU,statistics:STAT,choiceText:$("mt").textContent,sheetHidden:$("md").hidden,screens:Object.fromEntries(["s0","s1"].map(id=>[id,$(id).hidden]))});
      return {checkpoint:"保存済み（メモリー内のみ）",summary:debugSummary()};
    },
    restoreCheckpoint() {
      if(!debugCheckpoint)throw new Error("一時チェックポイントがありません");
      const saved=debugClone(debugCheckpoint);play(0);
      replaceCurrentLife(saved.life);replaceWorldKnowledge(saved.world);
      RANDOM_SEED=saved.randomSeed;RANDOM_STATE=saved.randomState;DEBUG_RANDOM=saved.debugRandom;
      TRACE_RESOLUTION=saved.trace;PENDING_DEATH_TRACE=saved.pending;CAPTURE_TRACE=saved.capture;restoreSimulationStatistics(saved.statistics);
      for(const [id,hidden] of Object.entries(saved.screens))$(id).hidden=hidden;
      HL=0;AU="";$("md").hidden=true;$("resumeChoice").hidden=true;
      if(S.ev){const event=EV.find(row=>row.id===S.ev.id);S.ev=event;ask(event,tags(S),saved.choiceText,S.evBefore,true);if(saved.sheetHidden)collapseChoiceSheet();}
      HL=saved.hl;AU=saved.au;sp=saved.speed;acc=saved.acc;
      RANDOM_SEED=saved.randomSeed;RANDOM_STATE=saved.randomState;
      rd();syncUIDialogs();syncChoiceControls();
      return {checkpoint:"復帰済み",summary:debugSummary()};
    },
    advanceYear() {
      if (!S || S.dead) throw new Error("生存中の人生が必要です");
      if (S.ev) throw new Error("選択肢を確定してから進めてください");
      play(0);
      tick();
      rd();
      return this.inspect();
    },
    validate() {
      return {
        state: S ? auditLifeState(S) : { skipped: true, reason: "先に人生を作成してください" },
        events: validate()
      };
    },
    setSpeed(value) {
      play(clamp(Number(value), 0, 6));
    }
  };
  // The diagnostic panel is outside s0; never let it inspect or mutate a hidden trial life.
  for (const [name, method] of Object.entries(window.TERRA_DEBUG_API)) {
    if (name === "catalog" || typeof method !== "function") continue;
    window.TERRA_DEBUG_API[name] = function (...args) {
      if (DEV_SIMULATION_ACTIVE) throw new Error("シミュレーション実行中はデバッグ操作を利用できません");
      return method.apply(this, args);
    };
  }
  const debugScript = document.createElement("script");
  debugScript.src = "debug.js";
  debugScript.defer = true;
  document.head.appendChild(debugScript);
}
play(1);
// The simulation still advances at 100 ms steps. A compositor-only CSS
// transition interpolates between successive progress values without another
// timer or a continuous animation-frame loop.
let lastProgress = 0;
function paintYearProgress(value) {
  const bar = $("pb");
  const progress = Math.min(1, Math.max(0, Number(value) || 0));
  const wrapped = progress < lastProgress;
  lastProgress = progress;
  if (wrapped) {
    // Year rollover must jump to the start, not animate backwards across a
    // whole year. One forced style commit only once per simulated year.
    bar.style.transition = "none";
    bar.style.transform = `scaleX(${progress})`;
    void bar.offsetWidth;
    bar.style.transition = "";
  } else {
    bar.style.transform = `scaleX(${progress})`;
  }
  $("pg").setAttribute("aria-valuenow", String(Math.round(progress * 100)));
}
setInterval(() => {
  if (!S || S.dead || S.ev || !SPD[sp]) return;
  acc += (SPD[sp] * 100) / YMS;
  while (S.q.length && acc >= S.q[0] && !S.ev && !S.dead) slot(S.q.shift());
  if (acc >= 1 && !S.ev && !S.dead) {
    acc -= 1;
    tick();
  }
  paintYearProgress(acc);
  $("mo").textContent = Math.floor(acc * CALENDAR_MONTHS) + 1 + "月";
}, 100);
initializeUIPreferences();
try {
  const tb = document.getElementById("tb");
  new ResizeObserver(() =>
    document.documentElement.style.setProperty("--tbh", tb.offsetHeight + "px")
  ).observe(tb);
} catch (e) {}
// 大規模な静的監査は検証モードで明示的に実行。通常の起動を妨げない。
if (/[?&]fullAudit=1(?:&|$)/.test(window.location?.search || ""))
  try {
    const w = validate();
    if (w.length) console.warn("イベント検証:\n" + w.join("\n"));
  } catch (e) {
    console.error(e);
  }
initDeveloperTools();
