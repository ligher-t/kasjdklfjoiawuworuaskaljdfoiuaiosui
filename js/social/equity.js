/* 社会的不利益の数値は、種族そのものの属性ではない。局所的に観測した扱いと、その環境に関するゲーム仮定を分ける。 */
/* v80: 差別経験と費用の出所を管理。出来事の記憶フラグだけを経済損失に流用しない。
 * 体質・種族係数は遭遇機会の仮定であり、被害の立証でも、所得の確定減額でもない。 */
const equityLedger = s => {
  if (!s.equityLedger || typeof s.equityLedger !== "object")
    s.equityLedger = { version: 1, episodes: [], history: [] };
  const x = s.equityLedger;
  if (!Array.isArray(x.episodes)) x.episodes = [];
  if (!Array.isArray(x.history)) x.history = [];
  return x;
};
const equityWorksite = s => (s.workContract?.status === "active" ? s.workContract.siteId : null);
function reconcileEquity(s) {
  const ledger = equityLedger(s),
    site = equityWorksite(s);
  for (const episode of ledger.episodes) {
    if (episode.status !== "active") continue;
    const expired = episode.endYear != null && s.year > episode.endYear;
    const changed =
      episode.domain === "work" &&
      (!site || site !== episode.siteId || s.job !== episode.jobId || restricted(s));
    const relocated =
      episode.domain !== "work" &&
      episode.areaKey != null &&
      s.community?.key != null &&
      episode.areaKey !== s.community.key;
    if (expired || changed || relocated) {
      episode.status = "ended";
      episode.endedYear = s.year;
      episode.endReason = expired
        ? "short-term-effect-ended"
        : relocated
          ? "moved-to-a-different-area"
          : "worksite-or-occupation-changed";
      ledger.history.push({
        year: s.year,
        domain: episode.domain,
        action: "ended",
        id: episode.id,
        reason: episode.endReason
      });
    }
  }
  ledger.history = ledger.history.slice(-64);
  ledger.episodes = ledger.episodes.slice(-64);
  return ledger;
}
function recordEquityOutcome(s, fx, eventId) {
  if (!fx?.fl) return;
  const ledger = reconcileEquity(s),
    flags = fx.fl,
    site = equityWorksite(s),
    defs = [
      { flag: "ed_work_disadvantage", domain: "work" },
      { flag: "ed_sarkaz_work_bias", domain: "opportunity", years: 2 },
      { flag: "housing_exclusion", domain: "housing", years: 3 },
      { flag: "ed_sarkaz_lodging_refused", domain: "housing", years: 3 },
      { flag: "ed_iberia_port_screen", domain: "administration", years: 2 },
      { flag: "ed_clinic_delayed", domain: "medical", years: 2 }
    ];
  for (const item of defs) {
    if (flags[item.flag] === 1) {
      const active = ledger.episodes.find(
        x =>
          x.status === "active" && x.flag === item.flag && x.siteId === (item.domain === "work" ? site : null)
      );
      if (active) {
        active.lastConfirmedYear = s.year;
        continue;
      }
      const relevant = item.domain !== "work" || !!site;
      const entry = {
        id: `eq-${s.year}-${ledger.episodes.length + 1}`,
        year: s.year,
        domain: item.domain,
        flag: item.flag,
        status: relevant ? "active" : "observed-only",
        siteId: item.domain === "work" ? site : null,
        areaKey: s.community?.key || null,
        jobId: item.domain === "work" ? s.job : null,
        endYear: item.years ? s.year + item.years : null,
        eventId: eventId || null,
        basis: "event-outcome"
      };
      ledger.episodes.push(entry);
      ledger.history.push({
        year: s.year,
        domain: item.domain,
        action: relevant ? "observed" : "observation-without-employer",
        id: entry.id,
        flag: item.flag
      });
    } else if (flags[item.flag] === 0) {
      for (const e of ledger.episodes.filter(x => x.status === "active" && x.flag === item.flag)) {
        e.status = "ended";
        e.endedYear = s.year;
        e.endReason = "event-resolved";
        ledger.history.push({ year: s.year, domain: e.domain, action: "resolved", id: e.id });
      }
    }
  }
  ledger.history = ledger.history.slice(-64);
  ledger.episodes = ledger.episodes.slice(-64);
}
const discriminationPressure = s => {
  const current = reconcileEquity(s).episodes.filter(x => x.status === "active");
  return current.some(x => x.domain === "housing" || x.domain === "administration" || x.domain === "work")
    ? Math.min(1, (s.res?.st || 0) * 0.58)
    : 0;
};
const discriminationEncounterRisk = s =>
  (s.r?.dis || 0) * (s.res?.st || 0); /* 遭遇機会のゲーム用代理指標であり被害経験ではない。 */
const employmentDiscriminationPenalty = s => {
  const affected = reconcileEquity(s).episodes.filter(
    x => x.status === "active" && x.domain === "work" && x.siteId === equityWorksite(s) && x.jobId === s.job
  );
  if (!affected.length) return 0;
  /* 同一勤務先の差別事象を重複加算しない。同じ経験が感染・種族の両方に該当しても上限は一つ。 */
  const activeInf = affected.some(x => x.flag === "ed_work_disadvantage" && s.fl?.dg),
    pressure = activeInf ? infectionSocialPressure(s).work * 0.65 : 0;
  return Math.min(
    P("economy.discriminationIncomeCap"),
    Math.max(discriminationPressure(s), pressure) * P("economy.discriminationIncomeScale")
  );
};
function equityCreditPenalty(s) {
  const records = reconcileEquity(s).episodes.filter(x => x.status === "active");
  /* 異議申立てそれ自体、過去の求人辞退、種族名は減点理由にしない。 */
  const job = records.some(x => x.domain === "work")
    ? P("social.raceDiscriminationScale") * discriminationPressure(s)
    : 0;
  const housing = records.some(x => x.domain === "housing")
    ? P("social.undiagnosedDiscriminationPenalty") * (s.res?.st || 0)
    : 0;
  const medical = records.some(x => x.domain === "medical")
    ? P("social.undiagnosedDiscriminationPenalty") * (s.res?.st || 0) * 0.7
    : 0;
  const admin = records.some(x => x.domain === "administration")
    ? P("social.raceDiscriminationScale") * discriminationPressure(s) * 0.55
    : 0;
  return Math.max(job, housing, medical, admin); // 単一年度の目標値で同一体験を重複計上しない
}

const householdStrained = s => {
  const shared = inSharedHousehold(s) && s.house,
    // A transfer between the protagonist and the shared family ledger is
    // an expense in the personal book but not an additional outside cost.
    internalTransfer = shared && s.flow?.year === s.year
      ? Math.max(0, s.flow?.expense?.familyContribution || 0) : 0,
    rawCash = shared ? (s.house.cash || 0) + (s.cash || 0) : s.cash,
    rawDebt = shared ? (s.house.debt || 0) + (s.debt || 0) : s.debt,
    rawExpense = shared
      ? Math.max(0, (s.house.exp || 0) + (s.exp || 0) - internalTransfer)
      : s.exp,
    liquid = Number.isFinite(rawCash) ? rawCash : 0,
    debt = Number.isFinite(rawDebt) ? rawDebt : 0,
    expense = Math.max(
      Number.isFinite(rawExpense) ? rawExpense : 0,
      P("economy.minimumExpenseBase") * s.res.pm
    );
  return (
    expense > 0 &&
    (liquid < expense * P("condition.financialStrainReserveYears") ||
      debt > expense * P("condition.financialStrainDebtYears"))
  );
};
BT.add("感染の疑い・診断未確定");
BT.add("曝露後の診察時期");
BT.add("源石防護対策を実施中");
BT.add("離婚した相手の訃報");
BT.add("きょうだいの訃報");
BT.add("チェルノボーグから避難した");
BT.add("チェルノボーグに留まった");
BT.add("ロンディニウム戦争期の生活を経験");
BT.add("手仕事知識共有の目標を継続中");
