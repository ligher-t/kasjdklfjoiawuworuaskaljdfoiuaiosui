// UI-only navigation. Existing detail nodes retain their IDs and render destinations.
// Never modify life state, RNG, event selection or save data here.
const TERMINAL_RECORDS = Object.freeze({
  health: {number:"01", title:"体調と医療", register:"MEDICAL RECORD", sections:["detail-health"]},
  work: {number:"02", title:"生業と学び", register:"EXPERIENCE FILE", sections:["detail-work"]},
  family: {number:"03", title:"家族と家計", register:"RELATIONS / HOUSEHOLD", sections:["detail-family", "detail-finance"]},
  place: {number:"04", title:"住まいと地域", register:"RESIDENCE RECORD", sections:["detail-place"]}
});
const TERMINAL_LEDGER_SECTIONS = Object.freeze(Object.fromEntries(
  Object.entries(TERMINAL_RECORDS).map(([kind, record]) => [kind, record.sections])));
let TERMINAL_LEDGER = null;
let TERMINAL_ANCHOR_SEQUENCE = 0;
function terminalRecordPathMarkup(s, page) {
  return `<span>生活記録</span><span aria-hidden="true">/</span><span>${esc(s.nm || "氏名未記録")}</span>` +
    `<span aria-hidden="true">/</span><strong>${esc(page)}</strong>`;
}
function terminalRecordImage(kind, className = "") {
  const image = {mobile:"residence-structure", fixed:"residence-fixed", archive:"archive-files"}[kind];
  return image ? `<img class="ui-record-illustration ${className}" src="assets/ui/${image}.svg" alt="" aria-hidden="true" width="${kind === "archive" ? 560 : 1200}" height="${kind === "archive" ? 400 : 260}">` : "";
}
function syncTerminalRecordPath(s) {
  const target = document.getElementById("life-journal-path");
  if (target) {
    const value = terminalRecordPathMarkup(s, "人生の記録");
    setRecordMarkup(target, value);
  }
}
// These diagrams reuse player-facing projections. They add no relationship,
// geographical position, diagnosis or event that is absent from the text.
function terminalRecordDiagramMarkup(kind, s) {
  if (kind === "place") {
    const form = s.home === "移動都市" ? "mobile" : s.home === "固定集落" ? "fixed" : null;
    if (!form) return "";
    const label = form === "mobile" ? "移動都市" : "定住地";
    return `<figure class="ui-residence-plate">${terminalRecordImage(form)}<figcaption><span class="ui-register" aria-hidden="true">RESIDENCE / STRUCTURE</span>${label}のイメージ<span>実際の地図・位置関係は示しません</span></figcaption></figure>`;
  }
  if (kind === "work" && typeof lifeChapterRecords === "function") {
    const learning = (s.socialLearning?.yearlyHistory || []).filter(row =>
      Number.isInteger(row.year) && row.year >= s.by && row.year <= s.year &&
      Number.isInteger(row.age) && row.age >= 0 && row.age <= s.age &&
      typeof row.school === "boolean" && Number.isFinite(row.literacy)).map(row => ({
        year:row.year, age:row.age, kind:"学び",
        text:(row.school ? "通学した記録" : "この年の通学記録なし") + `・読み書き ${Math.round(Math.max(0, Math.min(100, row.literacy)))} / 100`
      }));
    const rows = [...lifeChapterRecords(s).filter(row => ["仕事", "技能", "所属"].includes(row.kind)), ...learning]
      .sort((a, b) => a.year - b.year || a.age - b.age);
    if (!rows.length) return "";
    return `<section class="ui-career-strip" aria-label="記録された経歴の抜粋"><p class="ui-register" aria-hidden="true">EXPERIENCE / LATEST ${Math.min(rows.length, 4)}</p><ol>${rows.slice(-4).map(row =>
      `<li><span>${esc(row.year)}年・${esc(row.age)}歳</span><strong>${esc(row.kind)}</strong><p>${esc(row.text)}</p></li>`).join("")}</ol><p class="nt">記録された経歴の直近${Math.min(rows.length, 4)}件。詳しい経緯は下の資料で読めます。</p>` +
      (learning.length ? `<details class="ui-learning-history" data-record-group="terminal-learning-history"><summary>記録された年の学び（${learning.length}件）</summary><p class="nt">記録がある年だけを示します。間の時期の通学・学習は推定しません。</p><ol>${learning.map(row => `<li><span>${esc(row.year)}年・${esc(row.age)}歳</span><p>${esc(row.text)}</p></li>`).join("")}</ol></details>` : "") + `</section>`;
  }
  if (kind === "family" && typeof lifeSummaryFacts === "function") {
    const rows = lifeSummaryFacts(s).familyRecords.filter(([label, value]) =>
      ["親", "きょうだい", "子", "配偶者・恋愛関係", "友人・近所"].includes(label) && value && !["記録なし", "なし"].includes(value));
    if (!rows.length) return "";
    return `<section class="ui-relations-plate" aria-label="本人から見た家族と近しい関係"><p class="ui-register" aria-hidden="true">RELATIONS / PERSONAL RECORD</p><p class="ui-relations-self">${esc(s.nm || "本人")}</p><ul>${rows.map(([label, value]) =>
      `<li><strong>${esc(label)}</strong><span>${esc(value)}</span></li>`).join("")}</ul><p class="nt">線は本人から見た続柄を示します。相手同士の関係や内心は推定しません。</p></section>`;
  }
  return "";
}
function refreshTerminalRecordPresentation(s, kind) {
  const record = TERMINAL_RECORDS[kind];
  for (const [id, value] of [
    ["terminal-ledger-register", `${record.number} / PERSONAL RECORD / ${record.register}`],
    ["terminal-ledger-date", `テラ暦${s.year}年・${s.age}歳`],
    ["terminal-directory-current", `${record.number} / ${record.title}`]
  ]) {
    const target = document.getElementById(id);
    if (target && target.textContent !== value) target.textContent = value;
  }
  const path = document.getElementById("terminal-ledger-path");
  if (path) {
    const value = terminalRecordPathMarkup(s, record.title);
    setRecordMarkup(path, value);
  }
  const diagram = document.getElementById("terminal-ledger-diagram");
  if (diagram) {
    const value = terminalRecordDiagramMarkup(kind, s);
    setRecordMarkup(diagram, value);
    diagram.hidden = !value;
  }
  syncTerminalSectionIndex();
}
function jumpToTerminalRecord(id) {
  const heading = document.getElementById(id);
  if (!heading) return;
  for (let node = heading.parentElement; node && node.id !== "terminal-ledger-body"; node = node.parentElement)
    if (node.tagName === "DETAILS") node.open = true;
  const directory = document.getElementById("terminal-directory");
  if (window.matchMedia?.("(max-width:899px)").matches && directory) directory.open = false;
  heading.focus({preventScroll:true});
  scrollToTerminalSection(heading);
  markTerminalSection(id);
}
function markTerminalSection(id) {
  for (const link of document.querySelectorAll("#terminal-section-index a")) {
    if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}
function syncTerminalSectionIndex() {
  const body = document.getElementById("terminal-ledger-body");
  const index = document.getElementById("terminal-section-index");
  if (!body || !index) return;
  const headings = [...body.querySelectorAll(":scope > details > summary, .ui-ledger-contents > .pn > h3, .ui-empty-records:not([hidden]) > summary")];
  for (const heading of headings) {
    if (!heading.id) heading.id = heading.parentElement.dataset.recordGroup
      ? "terminal-record-group-" + heading.parentElement.dataset.recordGroup
      : "terminal-record-section-" + (++TERMINAL_ANCHOR_SEQUENCE);
    if (heading.tagName !== "SUMMARY") heading.tabIndex = -1;
  }
  const signature = headings.map(heading => heading.id + ":" + heading.textContent).join("|");
  if (index.dataset.indexSignature === signature) return;
  const focused = index.contains(document.activeElement) ? document.activeElement.getAttribute("href") : null;
  const current = index.querySelector('[aria-current="location"]')?.getAttribute("href");
  index.dataset.indexSignature = signature;
  index.replaceChildren();
  for (const [position, heading] of headings.entries()) {
    const link = document.createElement("a");
    link.href = "#" + heading.id;
    link.textContent = String(position + 1).padStart(2, "0") + " / " + heading.textContent;
    link.addEventListener("click", event => { event.preventDefault(); jumpToTerminalRecord(heading.id); });
    index.append(link);
  }
  const currentId = headings.find(heading => "#" + heading.id === current)?.id || headings[0]?.id;
  if (currentId) markTerminalSection(currentId);
  if (focused) [...index.querySelectorAll("a")].find(link => link.getAttribute("href") === focused)?.focus({preventScroll:true});
}
function initializeTerminalDirectory() {
  const directory = document.getElementById("terminal-directory");
  const switcher = document.getElementById("terminal-ledger-switcher");
  if (directory?.tagName !== "DETAILS" || !switcher) return;
  for (const [kind, record] of Object.entries(TERMINAL_RECORDS)) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.ledgerTo = kind;
    button.innerHTML = `<span class="ui-directory-number" aria-hidden="true">${record.number}</span><span><strong>${record.title}</strong><small aria-hidden="true">${record.register}</small></span>`;
    button.addEventListener("click", () => {
      openLifeLedger(kind);
      if (window.matchMedia?.("(max-width:899px)").matches) {
        directory.open = false;
        document.getElementById("terminal-ledger-title")?.focus({preventScroll:true});
        scrollToTerminalSection(document.getElementById("terminal-ledger-view"));
      }
    });
    switcher.append(button);
  }
  const wide = window.matchMedia?.("(min-width:900px)");
  const adapt = () => {
    if (!wide) return;
    if (!wide.matches && directory.contains(document.activeElement)) directory.querySelector("summary")?.focus({preventScroll:true});
    directory.open = wide.matches;
  };
  wide?.addEventListener?.("change", adapt);
  adapt();
  const controlsWide = window.matchMedia?.("(min-width:1280px)");
  const adaptControls = () => {
    const controls = document.getElementById("terminal-progress");
    if (!controls || !controlsWide) return;
    if (!controlsWide.matches && controls.contains(document.activeElement)) controls.querySelector("summary")?.focus({preventScroll:true});
    controls.open = controlsWide.matches;
  };
  controlsWide?.addEventListener?.("change", adaptControls);
  adaptControls();
  document.getElementById("terminal-ledger-title").tabIndex = -1;
  let scheduled = false;
  window.addEventListener("scroll", () => {
    if (!TERMINAL_LEDGER || scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      const links = [...document.querySelectorAll("#terminal-section-index a")];
      const offset = (document.getElementById("tb")?.getBoundingClientRect().height || 66) + 65;
      const current = links.filter(link => {
        const heading = document.getElementById(link.hash.slice(1));
        return heading?.getClientRects().length && heading.getBoundingClientRect().top <= offset;
      }).at(-1) || links[0];
      if (current) markTerminalSection(current.hash.slice(1));
    });
  }, {passive:true});
}
// These are game records already available to the player; never infer private diagnoses,
// absent family income or another person's thoughts from raw simulation state.
function lifeLedgerMetrics(kind, s, view) {
  const validMoney = value => Number.isFinite(value) ? new Intl.NumberFormat("ja-JP").format(Math.round(value)) : null;
  if (kind === "health") {
    const result = [];
    if (Number.isFinite(s.h)) result.push({label:"体力",value:Math.round(s.h) + " / 100",type:"health",ratio:Math.max(0,Math.min(100,s.h))});
    if (s.fl?.dg) result.push({label:"鉱石病の診断",value:"診断あり"});
    return result;
  }
  if (kind === "family") {
    const household = Number(s.age) < 15;
    const source = household ? s.house : s;
    const result = [];
    const cash = validMoney(source?.cash);
    const debt = validMoney(source?.debt);
    if (cash !== null) result.push({label:household ? "養育家計の手元資金" : "本人の手元資金",value:cash + " 龍門幣"});
    if (debt !== null) result.push({label:household ? "養育家計の負債" : "本人の負債",value:debt + " 龍門幣"});
    return result;
  }
  if (kind === "work") {
    const metrics = [
      {label:"現在の生業",value:view.person.occupation},
      {label:"学びの記録",value:view.person.education}
    ];
    const langMetric = typeof formatLanguageMetric === "function" ? formatLanguageMetric(s) : null;
    if (langMetric) metrics.push({label:"主な使用言語",value:langMetric});
    return metrics;
  }
  if (kind === "place") return [
    {label:"現在の居住地",value:view.person.place},
    {label:"出身地",value:view.person.birthplace}
  ];
  return [];
}
function renderLifeLedgerMetrics(kind, s, view) {
  const target = document.getElementById("terminal-ledger-metrics");
  if (!target) return;
  const summary = view.cards.find(item => item.id === kind);
  const facts = lifeLedgerMetrics(kind, s, view).filter(fact =>
    fact.value !== summary?.headline && fact.value !== summary?.detail);
  const signature = JSON.stringify(facts);
  if (target.dataset.factSignature === signature) return;
  target.dataset.factSignature = signature;
  target.replaceChildren();
  for (const fact of facts) {
    const item = document.createElement("div");
    item.className = "terminal-ledger-metric" + (fact.type ? " terminal-ledger-metric-" + fact.type : "");
    const label = document.createElement("span");
    label.className = "terminal-ledger-metric-label";
    label.textContent = fact.label;
    const value = document.createElement("strong");
    value.className = "terminal-ledger-metric-value";
    value.textContent = fact.value;
    item.append(label,value);
    if (Number.isFinite(fact.ratio)) {
      const meter = document.createElement("span");
      meter.className = "terminal-ledger-metric-meter";
      meter.setAttribute("role","meter");
      meter.setAttribute("aria-label",fact.label);
      meter.setAttribute("aria-valuemin","0");
      meter.setAttribute("aria-valuemax","100");
      meter.setAttribute("aria-valuenow",String(Math.round(fact.ratio)));
      const fill = document.createElement("span");
      fill.style.width = fact.ratio + "%";
      meter.append(fill);
      item.append(meter);
    }
    target.append(item);
  }
  target.hidden = !target.children.length;
}
function syncLifeLedgerNavigation(kind) {
  for (const button of document.querySelectorAll("#terminal-ledger-switcher button[data-ledger-to]")) {
    const active = button.dataset.ledgerTo === kind;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-current",active ? "page" : "false");
  }
}
function refreshLifeLedgerContext(s) {
  if (!TERMINAL_LEDGER || !s || s.dead) return;
  const surface = document.getElementById("terminal-ledger-view");
  if (!surface || surface.hidden) return;
  const view = playerInformationSummary(s);
  const kind = TERMINAL_LEDGER.kind;
  const summary = view.cards.find(item => item.id === kind);
  surface.dataset.ledgerLevel = String(summary?.level ?? 0);
  const headline = document.getElementById("terminal-ledger-headline");
  const context = document.getElementById("terminal-ledger-context");
  if (headline && headline.textContent !== (summary?.headline || "")) headline.textContent = summary?.headline || "";
  if (context && context.textContent !== (summary?.detail || "")) context.textContent = summary?.detail || "";
  renderLifeLedgerMetrics(kind, s, view);
  refreshTerminalRecordPresentation(s, kind);
}
// The ledger uses the document's single vertical scroll. Keep the
// navigation within reach when entering or switching between unequal records.
function scrollToTerminalSection(element) {
  if (!element || typeof window === "undefined" || typeof window.scrollTo !== "function") return;
  const bounds = element.getBoundingClientRect?.();
  if (!bounds) return;
  const toolbar = document.getElementById("tb");
  const toolbarHeight = toolbar?.getBoundingClientRect?.().height || 66;
  const directoryHeight = window.matchMedia?.("(max-width:899px)").matches
    ? document.querySelector("#terminal-directory > summary")?.getBoundingClientRect?.().height || 0 : 0;
  const top = Math.max(0, (window.scrollY || 0) + bounds.top - toolbarHeight - directoryHeight - 8);
  window.scrollTo(0, top);
}
function openLifeLedger(kind) {
  const ids = TERMINAL_LEDGER_SECTIONS[kind];
  const surface = document.getElementById("terminal-ledger-view");
  const body = document.getElementById("terminal-ledger-body");
  if (!ids || !surface || !body || typeof S === "undefined" || !S || S.dead) return;
  if (TERMINAL_LEDGER?.kind === kind) return;
  const previous = TERMINAL_LEDGER;
  const switching = !!previous;
  // Changing a section is not an exit from reading mode.
  if (switching) closeLifeLedger(false, true);
  const journal = document.getElementById("lg");
  const profile = document.getElementById("cl");
  const title = TERMINAL_RECORDS[kind].title;
  const moved = [];
  const scrollTop = switching ? previous.scrollTop : (journal?.scrollTop || 0);
  const profileScrollTop = switching ? previous.profileScrollTop : (profile?.scrollTop || 0);
  const pageScrollY = switching ? previous.pageScrollY : (window.scrollY || 0);
  for (const id of ids) {
    const element = document.getElementById(id);
    if (!element?.parentNode) continue;
    const marker = document.createComment("return " + id);
    element.parentNode.insertBefore(marker, element);
    moved.push({element,marker,open:element.open});
    body.append(element);
    if (element.tagName === "DETAILS") element.open = true;
  }
  if (!moved.length) return;
  TERMINAL_LEDGER = {
    kind,moved,scrollTop,profileScrollTop,pageScrollY,
    resumeSpeed: switching ? previous.resumeSpeed : null
  };
  if (!switching) syncLedgerAutoPause();
  // The detailed record occupies the main workspace, not a card within a
  // three-column dashboard. Preserve the prior sidebar location for returning.
  document.getElementById("s1")?.classList?.add("terminal-ledger-active");
  const toolbarExit = document.getElementById("terminal-ledger-exit");
  if (toolbarExit) toolbarExit.hidden = false;
  const toolbarChoice = document.getElementById("terminal-ledger-choice");
  if (toolbarChoice) toolbarChoice.hidden = !S?.ev;
  if (profile) profile.scrollTop = 0;
  document.getElementById("terminal-ledger-title").textContent = title;
  surface.dataset.ledgerKind = kind;
  syncLifeLedgerNavigation(kind);
  surface.hidden = false;
  refreshLifeLedgerContext(S);
  document.getElementById("cc").dataset.terminalView = "detail";
  closeTerminalStatusDrawer();
  if (typeof tab === "function") tab("c");
  // On every category change show the new record from its beginning.
  // The shared return control stays in the fixed rail. The directory and
  // document keep a single page scroll, with no clipped final row.
  if (!switching) document.getElementById("terminal-ledger-exit")?.focus({preventScroll:true});
  const sheet = document.querySelector("#terminal-ledger-view .terminal-document");
  if (sheet) {
    sheet.classList.remove("ui-record-enter", "ui-record-switch");
    void sheet.offsetWidth;
    sheet.classList.add(switching ? "ui-record-switch" : "ui-record-enter");
  }
  // The sticky navigator's current bounds describe its pinned position, not
  // the beginning of the record. Use the ordinary document-flow surface.
  scrollToTerminalSection(surface);
}
function closeLifeLedger(restoreFocus = true, switching = false) {
  const current = TERMINAL_LEDGER;
  if (!current) return;
  TERMINAL_LEDGER = null;
  // The toolbar remains fixed even when the category navigator scrolls away.
  // During a category switch it stays available without a visible flicker.
  if (!switching) {
    const toolbarExit = document.getElementById("terminal-ledger-exit");
    if (toolbarExit) toolbarExit.hidden = true;
    const toolbarChoice = document.getElementById("terminal-ledger-choice");
    if (toolbarChoice) toolbarChoice.hidden = true;
    document.getElementById("s1")?.classList?.remove("terminal-ledger-active");
  }
  for (const {element,marker,open} of current.moved) {
    if (marker.isConnected) marker.replaceWith(element);
    if (element.tagName === "DETAILS") element.open = open;
  }
  const body = document.getElementById("terminal-ledger-body");
  body?.replaceChildren();
  document.getElementById("terminal-ledger-view").hidden = true;
  delete document.getElementById("terminal-ledger-view").dataset.ledgerKind;
  delete document.getElementById("terminal-ledger-view").dataset.ledgerLevel;
  const metrics = document.getElementById("terminal-ledger-metrics");
  metrics?.replaceChildren();
  if (metrics) delete metrics.dataset.factSignature;
  syncLifeLedgerNavigation(null);
  delete document.getElementById("cc").dataset.terminalView;
  const journal = document.getElementById("lg");
  if (journal) journal.scrollTop = current.scrollTop;
  const profile = document.getElementById("cl");
  if (profile && Number.isFinite(current.profileScrollTop))
    profile.scrollTop = current.profileScrollTop;
  if (!switching && current.resumeSpeed !== null &&
      typeof sp !== "undefined" && sp === 0 &&
      typeof S !== "undefined" && S && !S.dead && !S.ev &&
      typeof play === "function") play(current.resumeSpeed);
  if (restoreFocus) {
    // On 900–1279px screens the right rail is an inert closed drawer.
    // Never restore keyboard focus into that off-screen rail.
    const compactLayout = typeof window !== "undefined"
      && !!window.matchMedia?.("(max-width:1279px)").matches;
    const summaryAction = document.querySelector(`#situation-overview [data-summary="${current.kind}"] .ui-open-ledger`);
    const target = compactLayout || summaryAction?.closest("[inert], [hidden]")
      ? document.querySelector("#lf button")
      : summaryAction;
    (target || document.querySelector("#lf button") || document.getElementById("policy-toggle"))?.focus({preventScroll:true});
  }
  if (!switching) {
    if (Number.isFinite(current.pageScrollY) && typeof window.scrollTo === "function")
      window.scrollTo(0, current.pageScrollY);
    else scrollToTerminalSection(document.getElementById("life-journal-panel"));
  }
}
// This is an explicit user request, not an auto-decision. Leaving the
// ledger first restores the original record DOM before reopening the modal.
function resumePendingChoiceFromLedger() {
  if (typeof S === "undefined" || !S?.ev || !TERMINAL_LEDGER) return;
  closeLifeLedger(false);
  if (typeof showChoiceSheet === "function") showChoiceSheet();
}
// Presentation-only auto pause. Do not write a pause flag into the life save
// or advance the simulation. Manual speed changes while reading cancel resume.
function syncLedgerAutoPause() {
  if (!TERMINAL_LEDGER || typeof sp === "undefined" || typeof play !== "function") return;
  const enabled = typeof UI_PREFERENCES === "undefined" || UI_PREFERENCES.pauseInLedger !== false;
  if (enabled) {
    if (TERMINAL_LEDGER.resumeSpeed === null && sp > 0) {
      TERMINAL_LEDGER.resumeSpeed = sp;
      play(0);
    }
  } else {
    const speed = TERMINAL_LEDGER.resumeSpeed;
    TERMINAL_LEDGER.resumeSpeed = null;
    if (speed !== null && sp === 0 && typeof S !== "undefined" && S && !S.dead && !S.ev)
      play(speed);
  }
}
function toggleLifePolicyEditor() {
  const editor = document.getElementById("policy-editor");
  const trigger = document.getElementById("policy-toggle");
  if (!editor || !trigger) return;
  editor.hidden = !editor.hidden;
  trigger.setAttribute("aria-expanded", String(!editor.hidden));
  if (!editor.hidden) editor.querySelector("button:not(:disabled)")?.focus();
  else trigger.focus();
}
function syncLifePolicyLabel() {
  const current = document.querySelector?.("#fc button.on");
  const target = document.getElementById("policy-current");
  if (target) target.textContent = current?.textContent?.trim() || "のんびり";
}

function toggleTerminalStatusDrawer() {
  const host = document.getElementById("s1");
  const trigger = document.getElementById("terminal-status-toggle");
  if (!host || !trigger) return;
  const open = host.classList.toggle("terminal-status-open");
  trigger.setAttribute("aria-expanded", String(open));
  syncTerminalStatusDrawer();
  if (open) document.querySelector("#cr .ui-open-ledger")?.focus();
  else trigger.focus();
}
function closeTerminalStatusDrawer() {
  document.getElementById("s1")?.classList.remove("terminal-status-open");
  document.getElementById("terminal-status-toggle")?.setAttribute("aria-expanded","false");
  syncTerminalStatusDrawer();
}
if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
  document.addEventListener("keydown", event => {
    // Dialogs own Escape while visible. Closing a drawer at the same time would
    // restore focus to controls beneath the topmost modal.
    if (event.defaultPrevented || (typeof topUIDialog === "function" && topUIDialog())) return;
    if (event.key !== "Escape") return;
    if (document.getElementById("s1")?.classList.contains("terminal-status-open")) {
      event.preventDefault?.();
      closeTerminalStatusDrawer();
      document.getElementById("terminal-status-toggle")?.focus();
    } else if (typeof TERMINAL_LEDGER !== "undefined" && TERMINAL_LEDGER) {
      event.preventDefault?.();
      closeLifeLedger(true);
    }
  });
}

function syncTerminalStatusDrawer() {
  const panel = document.getElementById("cr");
  if (!panel || typeof window === "undefined" || !window.matchMedia) return;
  const medium = window.matchMedia("(min-width:900px) and (max-width:1279px)").matches;
  panel.inert = medium && !document.getElementById("s1")?.classList.contains("terminal-status-open");
}
if (typeof window !== "undefined") {
  window.addEventListener?.("resize", syncTerminalStatusDrawer);
  if (document.readyState === "loading") document.addEventListener?.("DOMContentLoaded", syncTerminalStatusDrawer);
  else syncTerminalStatusDrawer();
  if (document.readyState === "loading") document.addEventListener?.("DOMContentLoaded", initializeTerminalDirectory);
  else initializeTerminalDirectory();
}
