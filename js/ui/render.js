const DLT = {};
const cnt = k => {
  const c = S.cn || (S.cn = { g: 0, b: 0, n: 0 });
  c[k == "gd" ? "g" : k == "bad" ? "b" : "n"]++;
};
function sts() {
  if (HL) return;
  $("stt").textContent = !S || S.dead ? "" : S.ev ? "選択待ち" : SPD[sp] ? "進行中" : "停止中";
  $("stt").dataset.flow = !S || S.dead ? "ended" : S.ev ? "waiting" : SPD[sp] ? "running" : "paused";
  const progressControls = document.getElementById("terminal-progress");
  if (progressControls) progressControls.hidden = !!S?.dead;
}
function tab(t) {
  // The record room lives in the central tab. Leaving it restores its moved
  // DOM before the other tabs become visible, so no panel is left half-empty.
  if (t !== "c" && typeof TERMINAL_LEDGER !== "undefined" && TERMINAL_LEDGER)
    closeLifeLedger(false);
  $("cols").dataset.t = t;
  if (typeof UI_PREFERENCES !== "undefined" && UI_PREFERENCES.activeTab !== t) setUIPreference("activeTab", t);
  document.querySelectorAll("#tabs button").forEach(b => {
    const active = b.dataset.t === t;
    b.classList.toggle("on", active);
    b.setAttribute("aria-pressed", String(active));
  });
}
function petHouseholdMarkup(s) {
  if (!s.pet) return "";
  const years = Math.max(0, s.year - (s.petSinceYear ?? s.year)),
    care = restricted(s) ? (s.fl.pet_care_outsourced ? "（知人宅へ預けている）" : "（預け先未決定）") : "";
  return `<dt>飼育動物</dt><dd>${esc(s.pet)}${care}（共に暮らして${years}年／現在の年間費用 ${m(petCostBase(s.pet) * s.res.pm * (s.priceIndex || 1))}）</dd>`;
}
function recurringHouseholdCostsMarkup(s) {
  const spouseCare =
      s.sp?.inf && !s.sp.infHidden
        ? `<dt>配偶者の療養</dt><dd>${
            s.sp.tx
              ? `継続中（年額 ${m(
                  P("economy.spouseInfectionCareAnnualCost") *
                    s.res.pm *
                    (s.priceIndex || 1) *
                    (1 + infectionSocialPressure(s).medical * 0.3) *
                    infectionCareTravelCostScale(s)
                )}` + `を家計に計上）`
              : s.sp.careEverStarted === 1
                ? "休止中（現在の療養費は未計上）"
                : "未開始（現在の療養費は未計上）"
          }` + `</dd>`
        : "",
    pet = petHouseholdMarkup(s),
    hobbyNames = {
      hobby_music: "音楽",
      hobby_craft: "手仕事",
      hobby_garden: "植物",
      hobby_sport: "運動・武術",
      hobby_collect: "収集",
      hobby_story: "物語・唄・信仰"
    },
    hobbies = hobbyCount(s)
      ? `<dt>続けている趣味</dt><dd>${Object.entries(hobbyNames)
          .filter(([key]) => s.fl[key])
          .map(
            ([key, name]) =>
              `${name}（${
                { full: "通常", reduced: "頻度縮小", shared: "共同利用・現金支出なし" }[
                  s.hobbyModes?.[key]
                ] || "通常"
              }` + `）`
          )
          .join("・")}` +
        `${restricted(s) ? "（生活制限により休止中）" : ""}（現在の年会費・材料費 ${m(restricted(s) ? 0 : hobbyAnnualExpense(s))}）</dd>`
      : "",
    insurance = s.fl.insured
      ? `<dt>医療保険</dt><dd>クルビアの契約を維持（現在の年度更新 ${m(P("economy.columbiaInsuranceAnnualCost") * s.res.pm * (s.priceIndex || 1))}` +
        `、治療費の自己負担 ${Math.round(P("economy.columbiaInsuranceTreatmentCostScale") * 100)}%）</dd>`
      : "";
  return spouseCare + pet + hobbies + insurance;
}
function rd() {
  const services = RENDER_SERVICES;
  if (services.HL) return;
  const s = services.S,
    pv = s.pv || (s.pv = {}),
    st = s.ob < services.P("infection.stageOneEnd") ? 0 : s.ob < services.P("infection.stageTwoEnd") ? 1 : 2,
    now = Date.now();
  const dl = (k, v) => {
    const d = v - (pv[k] == null ? v : pv[k]);
    pv[k] = v;
    if (Math.abs(d) >= 0.5)
      services.DLT[k] = {
        v: (services.DLT[k] && now - services.DLT[k].t < 1500 ? services.DLT[k].v : 0) + d,
        t: now
      };
    const x = services.DLT[k];
    return x && now - x.t < 3000
      ? `<span class="dl ${x.v > 0 ? "up" : "dn"}">${x.v > 0 ? "+" : ""}${Math.round(x.v)}</span>`
      : "";
  };
  const b = (k, n, v, c, tip, x) =>
    `<div class="b ${c || ""}" title="${tip}"><span class="ui-stat-label">${n}</span><i><u style="width:${v}%"></u></i>` +
    `<em class="ui-stat-number">${x ?? Math.round(v)}</em><span class="ui-stat-delta">${dl(k, v)}</span></div>`;
  if (s.dead && typeof TERMINAL_LEDGER !== "undefined" && TERMINAL_LEDGER) closeLifeLedger(false);
  renderProfilePanel(s, services, st);
  renderVitalsPanel(s, services, b);
  renderFamilyPanel(s, services);
  renderEconomyPanel(s, services);
  renderTagsAndHealthPanel(s, services);
  renderLocalityPanel(s, services);
  renderEducationPanel(s);
  renderLifeAndKnowledgePanel(s, services);
  renderControlsPanel(s, services);
  renderSocialPanel(s, services);
  renderTreatmentPanel(s, services);
  organizeLifeRecordSections();
  renderPlayerSummary(s);
  services.sts();
  syncChoiceControls();
}
function play(n, source = "system") {
  if (!Number.isInteger(n) || n < 0 || n >= SPD.length) return;
  // Even a restored or programmatically requested debug index cannot exceed
  // the ordinary 20x ceiling without ?debug=1.
  if (!DEBUG_PLAYBACK && n > 5) n = 5;
  if (S?.ev && n !== 0) return;
  // Explicit speed changes override the auto-resume of the record room.
  if (source === "user" && typeof TERMINAL_LEDGER !== "undefined" && TERMINAL_LEDGER)
    TERMINAL_LEDGER.resumeSpeed = null;
  sp = n;
  sts();
  document
    .querySelectorAll("#ctl button,#s0 .sg button")
    .forEach(b => b.classList.toggle("on", +b.dataset.n === n));
}
$("hideChoice").onclick = collapseChoiceSheet;
$("resumeChoice").onclick = () => { if (S?.ev) showChoiceSheet(); };
