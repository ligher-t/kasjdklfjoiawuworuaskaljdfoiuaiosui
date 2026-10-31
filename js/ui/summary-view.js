// Read-only player-facing projections. The UI must neither consume RNG nor reveal unseen facts.
function playerInformationSummary(s) {
  const place = s.residenceBase?.label || [s.res?.n, s.local?.city].filter(Boolean).join("・") || "居住地未記録";
  const cultural = s.culturalIdentity?.affiliation ? `（${s.culturalIdentity.affiliation}）` : "";
  const birthplace = ([s.g?.n, s.birthLocality?.city].filter(Boolean).join("・") || "出生地未記録") + cultural;
  const occupation = occupationLabel(s);
  const education = educationStandingLabel(s);
  const diagnosis = !!s.fl?.dg;
  const residence = {
    family_home_shared_budget: "家族と同居・共有家計",
    family_home_separate_budget: "家族と同居・本人の収支は別管理",
    independent_rental: "賃貸住居で独立",
    independent_owned: "自分の住居で独立",
    spouse_shared: "配偶者と同じ世帯",
    spouse_parent_home: "配偶者の親族宅で同居"
  }[s.residenceArrangement] || (s.age < 15 ? "養育世帯で生活" : "世帯形態の記録なし");

  // A body's experienced difficulties are more important than one disease's diagnosis.
  // Undiagnosed oripathy is NOT a player-known status and cannot appear here.
  const episodes = (s.mortality?.episodes || [])
    .filter(x => (x.status === "active" || x.status === "recovering") && (x.kind !== "oripathy" || diagnosis))
    .slice().sort((a, b) => (b.status === "active" ? 1 : 0) - (a.status === "active" ? 1 : 0) || (b.severity || 0) - (a.severity || 0));
  const episode = episodes[0];
  const symptom = episode ? (typeof MORBID_LABELS === "object" ? MORBID_LABELS[episode.kind] : null) || "長期の不調" : null;
  const entries = (s.infectionAwareness?.entries || []).filter(e => e.subject === "protagonist");
  const hasFamily = entries.some(e => ["family", "household"].includes(e.audience)) || !!s.fl?.infection_family_disclosed;
  const hasWorkSchool = entries.some(e => ["workplace", "employer", "school", "housing-management"].includes(e.audience));
  const hasPublic = entries.some(e => ["residents", "community", "public", "local-authority"].includes(e.audience));
  const awarenessBadge = hasPublic ? "地域社会に露見" : hasWorkSchool ? "関係先に露見" : hasFamily ? "身内のみ把握" : "完全秘匿";
  let health = {
    id: "health", title: "体調と医療", tone: "quiet", level: 0,
    headline: diagnosis ? "鉱石病の診断記録あり" : Number.isFinite(s.h)
      ? s.h >= 60 ? "体力には比較的余裕がある" : "体力は保たれている"
      : "体調の記録が十分でない",
    detail: diagnosis
      ? (s.fl?.tx ? "療養を継続中" : "治療継続の記録はありません")
      : "体力の目安です。未確認の病気の有無は示しません",
    value: Number.isFinite(s.h) ? Math.round(s.h) : null, unit: "/100", meter: "health"
  };
  if (episode) {
    const recovering = episode.status === "recovering";
    const severity = Number(episode.severity) || 1;
    health.headline = symptom + (recovering ? "・回復期" : severity >= 3 ? "・負担が大きい" : "・経過観察中");
    health.detail = recovering ? "経過を見ながら生活を立て直している" : "暮らしへの影響を確認し、相談や休息を選べる";
    health.level = recovering ? 0 : severity >= 3 ? 3 : severity >= 2 ? 2 : 1;
    health.tone = health.level >= 3 ? "danger" : health.level >= 1 ? "caution" : "quiet";
  } else if (s.h < 26) {
    health.headline = "体力が大きく低下している";
    health.detail = "身体の負担に注意が必要";
    health.level = 2;
    health.tone = "caution";
  } else if (s.h < 44) {
    health.headline = "体力に余裕が少ない";
    health.detail = "休息や周囲の支えが生活に関わる";
    health.level = 1;
    health.tone = "caution";
  }
  if (s.mortality?.threat?.status === "active") {
    health.detail += "。身の安全についても懸念が続く";
    health.level = Math.max(health.level, 2);
    // A concurrent safety threat must not downgrade an already severe
    // illness from the dangerous visual state to a caution-only card.
    health.tone = health.level >= 3 ? "danger" : "caution";
  }
  health.showOverviewDetail = diagnosis || !!episode || health.level > 0;

  const child = s.age < 15;
  const cash = child ? s.house?.cash : s.cash;
  const debt = child ? s.house?.debt : s.debt;
  const income = child ? s.house?.inc : s.inc;
  const expense = child ? s.house?.exp : s.exp;
  const finances = {
    id: "family", title: "暮らしと家計", level: 0, tone: "quiet",
    headline: residence,
    detail: child ? "養育世帯の収支を参照" : "本人の家計を参照",
    value: null, unit: null
  };
  if (Number.isFinite(income) && Number.isFinite(expense) && income < expense && expense > 0) {
    finances.headline = child ? "養育家計の支出が収入を上回る" : "年間支出が収入を上回る";
    finances.detail = residence;
    finances.level = 2;
    finances.tone = "caution";
  } else if (Number.isFinite(debt) && debt > 0) {
    finances.headline = child ? "養育家計に負債がある" : "本人に負債がある";
    finances.detail = residence;
    finances.level = 1;
    finances.tone = "caution";
  }
  if (Number.isFinite(cash) && Number.isFinite(expense) && expense > 0 && cash < expense / 4) {
    finances.headline = child ? "養育家計の手元資金が少ない" : "手元資金が少ない";
    finances.level = 3;
    finances.tone = "danger";
  }

  const work = {
    id: "work", title: "生業と学び", level: 0, tone: "quiet",
    headline: s.age < 6 ? "幼少期" : occupation,
    detail: s.age < 6 ? "学びはこれから" : education + (s.fl?.sch ? "・在学記録あり" : ""),
    value: null, unit: null
  };
  const placeCard = {
    id: "place", title: "住まいと地域", level: 0, tone: "quiet",
    headline: place,
    detail: s.home === "移動都市" ? "移動都市での暮らし" : "定住地での暮らし",
    value: null, unit: null
  };
  if (s.displacement?.status === "shelter") {
    placeCard.headline = "避難先・仮住まいで生活中";
    placeCard.detail = place;
    placeCard.level = 2;
    placeCard.tone = "caution";
  } else if (s.fl?.exiled) {
    placeCard.detail += "・追放の経験がある";
    placeCard.level = 1;
    placeCard.tone = "caution";
  }

  const cards = [health, work, finances, placeCard];
  // One consistent importance order; the layout may cap visible cards, but never hide urgent ones.
  const alerts = cards.filter(x => x.level >= 2).sort((a, b) => b.level - a.level);
  return {
    person: {
      name: s.nm || "名前未記録", age: Math.max(0, Number(s.age) || 0),
      place, birthplace, race: s.r?.n || "種族未記録", occupation, education,
      diagnosis: diagnosis ? "診断記録あり" : "診断記録なし（感染の有無は未確定）"
    },
    household: { residence },
    cards,
    alerts,
    knownStatuses: [
      diagnosis && "鉱石病の診断記録",
      diagnosis && s.fl?.tx && "療養を継続中",
      ...episodes.map(x => ((typeof MORBID_LABELS === "object" && MORBID_LABELS[x.kind]) || "長期の不調") + (x.status === "recovering" ? "・回復期" : "・経過観察中")),
      s.familyCare && "親族の療養を支援中",
      s.displacement?.status === "shelter" && "避難・仮住まい",
      s.fl?.exiled && "追放を経験",
      Number(s.debt) > 0 && "本人の負債を記録"
    ].filter(Boolean)
  };
}

function summaryText(parent, tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = String(text ?? "");
  parent.append(node);
  return node;
}
function summaryCard(parent, item) {
  const section = document.createElement("article");
  section.className = "ui-overview-card ui-tone-" + (item.tone || "quiet");
  section.dataset.summary = item.id;
  const record = typeof TERMINAL_RECORDS === "undefined" ? null : TERMINAL_RECORDS[item.id];
  if (record) {
    const register = summaryText(section, "p", "ui-register ui-overview-register", record.number + " / " + record.register);
    register.setAttribute("aria-hidden", "true");
  }
  const heading = document.createElement("div");
  heading.className = "ui-overview-head";
  summaryText(heading, "h4", "", item.title);
  if (item.level >= 2) summaryText(heading, "span", "ui-overview-alert", "要確認");
  section.append(heading);
  summaryText(section, "p", "ui-summary-value", item.headline);
  if (item.showOverviewDetail !== false) summaryText(section, "p", "ui-summary-detail", item.detail);
  if (item.value !== null && Number.isFinite(item.value)) {
    const meter = document.createElement("div");
    meter.className = "ui-overview-meter";
    meter.setAttribute("role", "meter");
    meter.setAttribute("aria-label", item.title + "の指標");
    meter.setAttribute("aria-valuemin", "0");
    meter.setAttribute("aria-valuemax", "100");
    meter.setAttribute("aria-valuenow", String(Math.max(0, Math.min(100, item.value))));
    const fill = document.createElement("span");
    fill.style.width = Math.max(0, Math.min(100, item.value)) + "%";
    meter.append(fill);
    section.append(meter);
  }
  const action = summaryText(section, "button", "ui-open-ledger", "台帳を開く");
  action.type = "button";
  action.setAttribute("aria-label", item.title + "の詳細記録を開く");
  action.addEventListener("click", () => openLifeLedger(item.id));
  parent.append(section);
}
function renderKnownStatusDetails(s, target) {
  if (!target) return;
  const view = playerInformationSummary(s);
  const groups = [
    { title: "体調と医療", values: view.knownStatuses.filter(v => /鉱石病|療養|不調/.test(v)) },
    { title: "仕事と学び", values: [view.person.occupation, view.person.education] },
    { title: "家族と家計", values: [view.household.residence, ...view.knownStatuses.filter(v => /親族|負債/.test(v))] },
    { title: "住まい", values: [view.person.place, ...view.knownStatuses.filter(v => /避難|追放/.test(v))] }
  ];
  target.replaceChildren();
  for (const group of groups) {
    const section = document.createElement("section");
    section.className = "ui-known-status-group";
    summaryText(section, "h4", "", group.title);
    const list = document.createElement("ul");
    list.className = "ui-known-statuses";
    for (const value of [...new Set(group.values.filter(Boolean))])
      summaryText(list, "li", "", value);
    section.append(list);
    target.append(section);
  }
}

function renderPlayerSummary(s) {
  const view = playerInformationSummary(s),
    profile = document.getElementById("person-summary"),
    overview = document.getElementById("situation-overview");
  // Stable player facts do not need their DOM (and keyboard focus) rebuilt
  // on every simulated tick.
  const personSignature = JSON.stringify(view.person);
  if (profile && profile.dataset.personSignature !== personSignature) {
    profile.dataset.personSignature = personSignature;
    profile.replaceChildren();
    const register = summaryText(profile, "p", "ui-register", "PERSONAL RECORD / TERRA");
    register.setAttribute("aria-hidden", "true");
    summaryText(profile, "p", "ui-person-lead", view.person.name);
    const age = document.createElement("p");
    age.className = "ui-person-age";
    summaryText(age, "strong", "", String(view.person.age));
    summaryText(age, "span", "", "歳");
    profile.append(age);
    summaryText(profile, "p", "ui-person-current", view.person.place);
    const facts = document.createElement("dl");
    facts.className = "ui-person-facts";
    for (const [label, value] of [
      ["出身", view.person.birthplace], ["種族", view.person.race],
      ["生業", view.person.occupation], ["学び", view.person.education],
      ["鉱石病", view.person.diagnosis]
    ]) {
      summaryText(facts, "dt", "", label);
      summaryText(facts, "dd", "", value);
    }
    document.getElementById("person-summary-facts")?.replaceChildren(facts);
  }
  if (overview) {
    const cards = view.cards;
    const signature = JSON.stringify(cards);
    if (overview.dataset.summarySignature !== signature) {
      // Health and household values can change while a keyboard user is
      // focused on a category button. Rebuilding the cards must not drop
      // that focus into the document body.
      const active = document.activeElement;
      const currentCard = active?.closest?.("[data-summary]");
      const focusedCategory = currentCard && overview.contains?.(active)
        ? currentCard.dataset.summary : null;
      overview.dataset.summarySignature = signature;
      overview.replaceChildren();
      cards.forEach(item => summaryCard(overview, item));
      if (focusedCategory && cards.some(item => item.id === focusedCategory)) {
        overview.querySelector?.(`[data-summary="${focusedCategory}"] .ui-open-ledger`)
          ?.focus({preventScroll:true});
      }
    }
  }
  // Urgent conditions are presented in the stable right-hand status cards.
  // No separate banner is inserted above the journal when an alert changes.
  if (typeof syncTerminalRecordPath === "function") syncTerminalRecordPath(s);
  if (typeof refreshLifeLedgerContext === "function") refreshLifeLedgerContext(s);
}
