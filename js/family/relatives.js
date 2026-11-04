function repairParentRecords(s) {
  const region = s.res || s.g || REG[0];
  s.par || (s.par = {});
  if (!Array.isArray(s.familyCareHistory)) s.familyCareHistory = [];
  for (const [key, sex] of [
    ["fa", "男"],
    ["mo", "女"]
  ]) {
    const x = s.par[key] && typeof s.par[key] === "object" ? s.par[key] : (s.par[key] = {}),
      repaired = [];
    if (x.sx !== "女" && x.sx !== "男") {
      x.sx = sex;
      repaired.push("性別");
    }
    if (!x.nm && !x.name) repaired.push("名前");
    x.nm = String(x.nm || x.name || nm_(x.sx, region));
    const raceName = typeof x.r === "string" ? x.r : x.r?.n,
      validRace = RACE.find(r => r.n === raceName);
    if (!validRace) repaired.push("種族");
    x.r = validRace || RACE.find(r => r.n === s.r?.n) || pickRaceFor(region);
    const validJob =
      Number.isInteger(x.j) && J[x.j] ? x.j : Number.isInteger(x.jobId) && J[x.jobId] ? x.jobId : null;
    if (validJob == null) repaired.push("生業");
    x.j = validJob ?? 0;
    const birth = Number.isFinite(x.by) ? x.by : Number.isFinite(x.birthYear) ? x.birthYear : null;
    if (birth == null) repaired.push("出生年");
    x.by = birth ?? (s.by || START) - 28;
    if (x.inf == null && x.infected == null) repaired.push("感染記録");
    x.inf = Number(x.inf ?? x.infected ?? 0) ? 1 : 0;
    x.tx = Number(x.tx ?? 0) && x.inf && !x.d ? 1 : 0;
    if (!Array.isArray(x.treatmentHistory)) x.treatmentHistory = [];
    if (!Number.isFinite(x.treatmentPriority)) {
      x.treatmentPriority = 0.5;
      repaired.push("本人の療養継続傾向（旧記録は中立値）");
    }
    x.treatmentPriority = clamp(x.treatmentPriority, 0, 1);
    if (!Array.isArray(x.jobHistory)) x.jobHistory = [];
    if (!Number.isInteger(x.knownJobId) || !J[x.knownJobId]) {
      x.knownJobId = x.j;
      x.knownJobChangeCount = x.jobHistory.length;
      x.jobKnownYear = s.year || START;
      repaired.push("親の職業を本人が把握した状態（旧記録の現在職を基準に補完）");
    }
    if (
      !Number.isInteger(x.knownJobChangeCount) ||
      x.knownJobChangeCount < 0 ||
      x.knownJobChangeCount > x.jobHistory.length
    )
      x.knownJobChangeCount = x.jobHistory.length;
    if (!Number.isFinite(x.jobKnownYear)) x.jobKnownYear = s.year || START;
    if (!Number.isFinite(x.workReviewYear))
      x.workReviewYear =
        (s.year || START) + rnd(P("family.parentWorkReviewMinYears"), P("family.parentWorkReviewMaxYears"));
    if (!Number.isFinite(x.health)) {
      x.health = rnd(P("family.parentHealthInitialMin"), P("family.parentHealthInitialMax"));
      repaired.push("親の健康記録（旧記録の補完）");
    }
    x.health = clamp(x.health, 0, 100);
    if (!Number.isFinite(x.workShare)) {
      x.workShare = 1;
      repaired.push("親の就労可能度（旧記録の補完）");
    }
    x.workShare = clamp(x.workShare, 0, 1);
    if (!Number.isFinite(x.healthUpdatedYear)) {
      x.healthUpdatedYear = s.year || START;
      repaired.push("親の健康更新年");
    }
    const death = Number(x.d ?? x.deathYear ?? 0);
    x.d = death > 0 ? death : x.d === true || x.dead === true ? s.year || START : 0;
    if (x.d && !x.deathNoticePending && !Number.isFinite(x.deathKnownYear)) {
      x.deathKnownYear = x.d;
      repaired.push("死亡認知年（旧記録では死亡年と同年扱い）");
    }
    if (
      x.deathNoticePending &&
      (!x.d ||
        !Number.isFinite(x.deathNoticeAvailableYear) ||
        x.deathNoticeAvailableYear < x.d ||
        x.deathNoticeAvailableYear > s.year + 2)
    ) {
      x.deathNoticePending = false;
      x.deathKnownYear = x.d || s.year;
      x.deathNoticeAvailableYear = null;
      repaired.push("不正な親の訃報待ちを修復");
    }
    if (!Array.isArray(x.deathNoticeHistory)) x.deathNoticeHistory = [];
    x.legacyRepair = [...new Set([...(x.legacyRepair || []), ...repaired])];
  }
  if (s.fl?.parent_unemployed && !s.parentUnemploymentTargetKey) {
    const caregivers = (s.care?.parentKeys || ["fa", "mo"]).filter(key => s.par[key] && !s.par[key].d);
    if (caregivers.length) {
      s.parentUnemploymentTargetKey = caregivers.sort(
        (a, b) => (J[s.par[a].j]?.pay || 0) - (J[s.par[b].j]?.pay || 0)
      )[0];
      s.par[s.parentUnemploymentTargetKey].legacyRepair = [
        ...new Set([
          ...(s.par[s.parentUnemploymentTargetKey].legacyRepair || []),
          "失業対象は旧記録から低賃金の養育者と仮定"
        ])
      ];
    } else s.fl.parent_unemployed = 0;
  }
  if (s.familyCare && s.familyCare.treatmentSupport == null) s.familyCare.treatmentSupport = false;
  if (s.fl?.household_separated && !s.house?.parentLedger)
    s.house.parentLedger = {
      status: "legacy_unknown",
      sinceYear: null,
      lastUpdatedYear: null,
      history: [],
      legacyRepair: ["旧記録には家計分離後の親の家計推移がない"]
    };
  const parentLedger = s.house?.parentLedger;
  if (parentLedger?.status === "tracked") {
    if (!Array.isArray(parentLedger.moveHistory)) parentLedger.moveHistory = [];
    if (
      !Number.isInteger(parentLedger.knownMoveCount) ||
      parentLedger.knownMoveCount < 0 ||
      parentLedger.knownMoveCount > parentLedger.moveHistory.length
    )
      parentLedger.knownMoveCount = parentLedger.moveHistory.length;
    if (!parentLedger.knownRegion) parentLedger.knownRegion = parentLedger.region;
    if (!Number.isFinite(parentLedger.moveKnownYear)) parentLedger.moveKnownYear = s.year || START;
    if (!Number.isFinite(parentLedger.moveReviewYear))
      parentLedger.moveReviewYear =
        (s.year || START) + rnd(P("family.parentMoveReviewMinYears"), P("family.parentMoveReviewMaxYears"));
    if (!Array.isArray(parentLedger.householdSiblingIds))
      parentLedger.householdSiblingIds = (s.siblings || [])
        .filter(person => !person.d && !person.independentSinceYear)
        .map(person => person.id)
        .filter(Boolean);
    if (!Array.isArray(parentLedger.pendingSiblingContributions))
      parentLedger.pendingSiblingContributions = [];
    if (!Array.isArray(parentLedger.siblingContributionHistory)) parentLedger.siblingContributionHistory = [];
    if (!Array.isArray(parentLedger.parentGiftHistory)) parentLedger.parentGiftHistory = [];
  }
  if (
    s.fl?.parent_infected &&
    ![s.par.fa, s.par.mo].some(parent => Object.prototype.hasOwnProperty.call(parent, "infectionKnown"))
  ) {
    const target = (s.care?.parentKeys || ["fa", "mo"])
      .map(key => s.par[key])
      .find(parent => parent && !parent.d && parent.inf);
    if (target) {
      target.infectionKnown = 1;
      target.legacyRepair = [
        ...new Set([...(target.legacyRepair || []), "旧記録の親感染把握先は当時の対象選択規則で補完"])
      ];
    }
  }
  return s;
}
function setParentTreatment(s, parent, value, cause = "家族の判断") {
  if (!parent || parent.d || !parent.inf) return false;
  const next = value ? 1 : 0,
    previous = parent.tx ? 1 : 0;
  if (previous === next) return false;
  parent.tx = next;
  if (next) parent.treatmentStartedYear = s.year;
  else parent.treatmentEndedYear = s.year;
  const ledger = s.house?.parentLedger;
  if (ledger?.treatmentLapseDue?.parentId === parent.id) ledger.treatmentLapseDue = null;
  if (!next && ledger?.treatmentReviewDue?.parentId === parent.id) ledger.treatmentReviewDue = null;
  parent.treatmentHistory || (parent.treatmentHistory = []);
  parent.treatmentHistory.push({ year: s.year, state: next ? "started" : "stopped", cause });
  parent.treatmentHistory = parent.treatmentHistory.slice(-12);
  return true;
}
function recordFamilyCareHistory(s, type, details = {}) {
  s.familyCareHistory || (s.familyCareHistory = []);
  const key = details.target || s.familyCare?.target,
    parent = s.par?.[key];
  s.familyCareHistory.push({
    year: s.year,
    type,
    targetId: parent?.id || details.targetId || null,
    targetName: parent?.nm || details.targetName || "親",
    plan: details.plan || s.familyCare?.plan || "direct",
    fromPlan: details.fromPlan || null,
    treatmentSupport: details.treatmentSupport ?? !!s.familyCare?.treatmentSupport,
    treatmentStillActive: details.treatmentStillActive ?? !!parent?.tx,
    treatmentPaidTotal: details.treatmentPaidTotal ?? s.familyCare?.treatmentPaidTotal ?? 0,
    contributorSiblingId: details.contributorSiblingId || null,
    contributorSiblingName: details.contributorSiblingName || null,
    amount: details.amount ?? 0,
    reason: details.reason || null,
    sourceEventId: TRACE_RESOLUTION?.id || null,
    choice: TRACE_RESOLUTION?.label || null
  });
  s.familyCareHistory = s.familyCareHistory.slice(-16);
}
function repairSiblingRecords(s) {
  if (s.siblingParentSupportConference == null) s.siblingParentSupportConference = null;
  else if (
    !["scheduled", "completed", "cancelled"].includes(s.siblingParentSupportConference.status) ||
    !Array.isArray(s.siblingParentSupportConference.participantIds) ||
    !Array.isArray(s.siblingParentSupportConference.history)
  ) {
    s.siblingParentSupportConference = null;
  }
  if (!Array.isArray(s.siblings)) return s;
  const region = s.res || s.g || REG[0];
  s.siblings = s.siblings.map((raw, index) => {
    const x = raw && typeof raw === "object" ? raw : {};
    const repaired = [];
    if (x.sx !== "女" && x.sx !== "男") {
      x.sx = x.sex === "女" || x.sex === "男" ? x.sex : R() < P("birth.femaleShare") ? "女" : "男";
      repaired.push("性別");
    }
    if (!x.nm && !x.name) repaired.push("名前");
    x.nm = String(x.nm || x.name || nm_(x.sx, region));
    const raceName = typeof x.r === "string" ? x.r : x.r?.n;
    const validRace = RACE.find(r => r.n === raceName);
    if (!validRace) repaired.push("種族");
    x.r = validRace || RACE.find(r => r.n === s.r?.n) || pickRaceFor(region);
    const validJob =
      Number.isInteger(x.j) && J[x.j] ? x.j : Number.isInteger(x.jobId) && J[x.jobId] ? x.jobId : null;
    if (x.independentSinceYear) {
      if (validJob == null) repaired.push("別居きょうだいの生業");
      x.j = validJob ?? 0;
    } else {
      if (x.j != null || x.jobId != null) repaired.push("未追跡だった同居きょうだいの生業を未記録化");
      x.j = null;
      if (Object.prototype.hasOwnProperty.call(x, "jobId")) delete x.jobId;
      if (x.knownJobId != null) {
        x.knownJobId = null;
        repaired.push("未追跡だった同居きょうだいの本人把握生業を未記録化");
      }
      x.jobKnownYear = null;
      x.workReviewYear = null;
    }
    const birth = Number.isFinite(x.by) ? x.by : Number.isFinite(x.birthYear) ? x.birthYear : null;
    if (birth == null) repaired.push("出生年");
    x.by = birth ?? (s.by || START) - index - 1;
    const hasDeath =
      Object.prototype.hasOwnProperty.call(x, "d") ||
      Object.prototype.hasOwnProperty.call(x, "deathYear") ||
      Object.prototype.hasOwnProperty.call(x, "dead");
    if (!hasDeath) repaired.push("生死記録");
    const death = Number(x.d ?? x.deathYear ?? 0);
    x.d = death > 0 ? death : x.d === true || x.dead === true ? s.year : 0;
    if (x.d && !x.deathNoticePending && !Number.isFinite(x.deathKnownYear)) {
      x.deathKnownYear = x.d;
      repaired.push("死亡認知年（旧記録では死亡年と同年扱い）");
    }
    if (
      x.deathNoticePending &&
      (!x.d ||
        !Number.isFinite(x.deathNoticeAvailableYear) ||
        x.deathNoticeAvailableYear < x.d ||
        x.deathNoticeAvailableYear > s.year + 2)
    ) {
      x.deathNoticePending = false;
      x.deathKnownYear = x.d || s.year;
      x.deathNoticeAvailableYear = null;
      repaired.push("不正なきょうだい訃報待ちを修復");
    }
    if (!Array.isArray(x.deathNoticeHistory)) x.deathNoticeHistory = [];
    if (x.inf == null && x.infected == null) repaired.push("感染記録");
    x.inf = Number(x.inf ?? x.infected ?? 0) ? 1 : 0;
    if (x.infKnown == null) {
      x.infKnown = x.inf ? 1 : 0;
      if (x.inf) repaired.push("旧記録の診断告知時に本人が認知した鉱石病");
    }
    x.infKnown = Number(x.infKnown) ? 1 : 0;
    if (!x.inf) x.infKnown = 0;
    if (
      x.infectionDiscussedYear != null &&
      (!Number.isInteger(x.infectionDiscussedYear) || x.infectionDiscussedYear > (s.year || START) || !x.inf)
    ) {
      delete x.infectionDiscussedYear;
      repaired.push("不正な感染きょうだい家族相談年を修復");
    }
    if (x.inf && !x.infCause && !x.infectionCause) repaired.push("感染経路");
    x.infCause = x.inf ? x.infCause || x.infectionCause || "旧記録に曝露経路なし" : null;
    if (x.independentSinceYear) {
      if (!Number.isFinite(x.health)) {
        x.health = P("family.siblingHealthInitial");
        repaired.push("別居きょうだいの健康値（初期仮定）");
      }
      if (!Number.isFinite(x.healthUpdatedYear)) {
        x.healthUpdatedYear = s.year;
        repaired.push("別居きょうだいの健康更新年");
      }
      if (!Number.isFinite(x.knownHealth)) {
        x.knownHealth = x.health;
        repaired.push("別居きょうだいの本人把握健康値");
      }
      if (!Number.isFinite(x.healthKnownYear)) {
        x.healthKnownYear = s.year;
        repaired.push("別居きょうだいの健康確認年");
      }
      if (!Array.isArray(x.healthHistory)) x.healthHistory = [];
    }
    if (x.independentSinceYear) {
      if (!x.familyHousehold || typeof x.familyHousehold !== "object") {
        x.familyHousehold = { partner: null, children: [], history: [] };
        repaired.push("別居きょうだいの家族記録（移行年から開始）");
      }
      if (!Array.isArray(x.familyHousehold.children)) x.familyHousehold.children = [];
      if (!Array.isArray(x.familyHousehold.history)) x.familyHousehold.history = [];
      if (!Number.isFinite(x.familyHousehold.reviewYear))
        x.familyHousehold.reviewYear =
          s.year + rnd(P("family.siblingFamilyReviewMinYears"), P("family.siblingFamilyReviewMaxYears"));
      if (x.knownFamilyPartner == null) x.knownFamilyPartner = null;
      if (!Number.isInteger(x.knownFamilyChildren) || x.knownFamilyChildren < 0) x.knownFamilyChildren = null;
    }
    if (x.independentSinceYear) {
      if (!Number.isFinite(x.financialCash)) {
        x.financialCash = 0;
        repaired.push("別居きょうだいの旧家計残高（移行後の初期仮定）");
      }
      if (!Number.isFinite(x.financialDebt)) {
        x.financialDebt = 0;
        repaired.push("別居きょうだいの旧家計負債（移行後の初期仮定）");
      }
      if (
        !Number.isInteger(x.financialExpenseTier) ||
        x.financialExpenseTier < 0 ||
        x.financialExpenseTier >= EXP.length
      ) {
        x.financialExpenseTier = Math.max(0, Math.min(EXP.length - 1, s.w?.i ?? 2));
        repaired.push("別居きょうだいの旧生活費階層（親世帯記録から仮補完）");
      }
      if (!Number.isFinite(x.financialPriceIndex)) {
        x.financialPriceIndex = s.priceIndex || 1;
        repaired.push("別居きょうだいの旧物価指数");
      }
      if (!Number.isFinite(x.financialUpdatedYear)) {
        x.financialUpdatedYear = s.year;
        repaired.push("別居きょうだいの家計更新年");
      }
      if (!["stable", "strained", "unknown"].includes(x.financialStatus)) x.financialStatus = "unknown";
      if (x.knownFinancialStatus != null && !["stable", "strained"].includes(x.knownFinancialStatus)) {
        x.knownFinancialStatus = null;
        repaired.push("本人が把握する別居きょうだいの家計状態");
      }
      if (x.financialKnownYear != null && !Number.isFinite(x.financialKnownYear)) {
        x.financialKnownYear = null;
        repaired.push("別居きょうだいの家計確認年");
      }
      if (!Array.isArray(x.financialHistory)) x.financialHistory = [];
      if (!Array.isArray(x.financialTransfers)) x.financialTransfers = [];
      if (x.d && x.familyHousehold && !x.postDeathFamilyFinance) {
        x.postDeathFamilyFinance = {
          status: "survivor_economy_untracked",
          deathYear: x.d,
          lastKnownYear: null
        };
        repaired.push("旧記録の遺族世帯家計は未追跡として明示");
      }
    }
    if (x.independentSinceYear && !Number.isFinite(x.workReviewYear)) {
      x.knownJobId = x.j;
      x.jobKnownYear = x.independentSinceYear;
      x.knownJobChangeCount = 0;
      x.jobHistory = [];
      x.workReviewYear =
        s.year + rnd(P("family.siblingWorkReviewMinYears"), P("family.siblingWorkReviewMaxYears"));
      repaired.push("別居きょうだいの仕事再確認時期");
    }
    if (x.independentSinceYear) {
      if (!["none", "active", "ended"].includes(x.parentSupportStatus)) x.parentSupportStatus = "none";
      if (!Number.isFinite(x.parentSupportDisposition)) x.parentSupportDisposition = 0.5;
      if (!Number.isFinite(x.parentSupportReviewYear))
        x.parentSupportReviewYear =
          s.year +
          rnd(P("family.siblingParentSupportReviewMinYears"), P("family.siblingParentSupportReviewMaxYears"));
      if (!Number.isFinite(x.parentSupportPaidTotal)) x.parentSupportPaidTotal = 0;
      if (!Number.isInteger(x.parentSupportChangeCount) || x.parentSupportChangeCount < 0)
        x.parentSupportChangeCount = 0;
      if (!Array.isArray(x.parentSupportHistory)) x.parentSupportHistory = [];
      if (
        !Number.isInteger(x.knownParentSupportChangeCount) ||
        x.knownParentSupportChangeCount < 0 ||
        x.knownParentSupportChangeCount > x.parentSupportChangeCount
      )
        x.knownParentSupportChangeCount = x.parentSupportChangeCount;
      if (!["none", "active", "ended"].includes(x.knownParentSupportStatus))
        x.knownParentSupportStatus = x.parentSupportStatus;
      if (!Number.isFinite(x.knownParentSupportPaidTotal))
        x.knownParentSupportPaidTotal = x.parentSupportPaidTotal;
      if (!Number.isFinite(x.parentSupportKnownYear)) x.parentSupportKnownYear = s.year;
    }
    if (x.independentSinceYear) {
      if (!["unknown", "strained", "stable"].includes(x.parentNeedKnownStatus)) {
        x.parentNeedKnownStatus = "unknown";
        repaired.push("きょうだいが知る親世帯の家計状況を不明として移行");
      }
      if (!Number.isFinite(x.parentNeedReviewYear))
        x.parentNeedReviewYear =
          s.year +
          rnd(P("family.siblingParentNeedReviewMinYears"), P("family.siblingParentNeedReviewMaxYears"));
      if (
        !Number.isFinite(x.parentNeedKnownYear) ||
        x.parentNeedKnownYear < x.independentSinceYear ||
        x.parentNeedKnownYear > s.year
      )
        x.parentNeedKnownYear = null;
      if (!Array.isArray(x.parentNeedHistory)) x.parentNeedHistory = [];
      if (
        x.parentNeedPending &&
        (!["strained", "stable"].includes(x.parentNeedPending.status) ||
          !Number.isFinite(x.parentNeedPending.sentYear) ||
          !Number.isFinite(x.parentNeedPending.deliveryYear) ||
          x.parentNeedPending.deliveryYear < s.year ||
          !x.parentNeedPending.sourceId)
      ) {
        x.parentNeedPending = null;
        repaired.push("不正な親世帯近況の伝達記録を破棄");
      }
      if (x.parentNeedPending == null && !Object.prototype.hasOwnProperty.call(x, "parentNeedPending"))
        x.parentNeedPending = null;
    }
    if (x.exposurePending) {
      if (!Number.isFinite(x.exposureYear)) {
        x.exposureYear = s.year;
        repaired.push("きょうだいの曝露年を補完");
      }
      if (!Number.isFinite(x.exposureKnownYear)) {
        x.exposureKnownYear = s.year;
        repaired.push("きょうだいの曝露認知年を補完");
      }
      if (!Number.isFinite(x.exposureReviewYear)) {
        x.exposureReviewYear = s.year + 1;
        repaired.push("きょうだいの再診予定年を補完");
      }
      if (!x.exposureCause) {
        x.exposureCause = "源石片による皮膚損傷（旧記録の補完）";
        repaired.push("きょうだいの曝露経路を補完");
      }
    }
    if (x.independentSinceYear) {
      if (!x.region) {
        x.region = s.res.n;
        repaired.push("別居きょうだいの居住地域を補完");
      }
      if (!x.knownRegion) {
        x.knownRegion = x.region;
        repaired.push("別居きょうだいの既知の居住地域を補完");
      }
      if (!Number.isFinite(x.regionKnownYear)) {
        x.regionKnownYear = x.independentSinceYear;
        repaired.push("別居きょうだいの居住確認年を補完");
      }
      if (!Number.isInteger(x.knownMoveCount)) {
        x.knownMoveCount = 0;
        repaired.push("別居きょうだいの既知転居数を補完");
      }
      if (!Array.isArray(x.moveHistory)) {
        x.moveHistory = [];
        repaired.push("別居きょうだいの転居履歴を補完");
      }
      if (!Number.isFinite(x.moveReviewYear)) {
        x.moveReviewYear =
          s.year + rnd(P("family.siblingMoveReviewMinYears"), P("family.siblingMoveReviewMaxYears"));
        repaired.push("別居きょうだいの転居見直し時期");
      }
    }
    if (!Array.isArray(x.contactHistory)) {
      x.contactHistory =
        x.contactState === "ended"
          ? [{ year: x.contactEndedYear || x.independentSinceYear || s.year, state: "ended" }]
          : [];
      if (x.contactState === "ended") repaired.push("きょうだいとの連絡履歴");
    }
    if (x.contactState === "ended" && x.independentSinceYear && !Number.isFinite(x.reconnectReviewYear)) {
      x.reconnectReviewYear =
        s.year + rnd(P("family.siblingRecontactReviewMinYears"), P("family.siblingRecontactReviewMaxYears"));
      repaired.push("きょうだいとの再接触確認時期");
    }
    if (x.d) {
      x.workReviewYear = null;
      x.parentNeedReviewYear = null;
      x.parentSupportReviewYear = null;
      x.moveReviewYear = null;
      x.contactReviewYear = null;
      x.reconnectReviewYear = null;
      if (x.familyHousehold) x.familyHousehold.reviewYear = null;
    }
    x.legacyRepair = [...new Set([...(x.legacyRepair || []), ...repaired])];
    return x;
  });
  return s;
}
function repairRelationshipDeathRecords(s) {
  s.relationshipHistory = Array.isArray(s.relationshipHistory) ? s.relationshipHistory : [];
  for (const x of s.relationshipHistory) {
    if (x.ending !== "死別") continue;
    const repaired = [];
    if (!Number.isFinite(x.deathYear)) {
      x.deathYear = Number.isFinite(x.endedYear) ? x.endedYear : s.year;
      repaired.push("死亡年（旧記録の関係終了年を採用）");
    }
    if (!Number.isFinite(x.deathKnownYear)) {
      x.deathKnownYear = x.deathYear;
      repaired.push("死亡認知年（旧記録では死亡年と同年扱い）");
    }
    if (!Number.isFinite(x.endedYear)) x.endedYear = x.deathYear;
    if (repaired.length) x.legacyRepair = [...new Set([...(x.legacyRepair || []), ...repaired])];
  }
  return s;
}
function assignRelativeIds(s) {
  if (!Array.isArray(s.relationshipHistory)) s.relationshipHistory = [];
  let next = Number.isInteger(s.nextRelativeId) && s.nextRelativeId > 0 ? s.nextRelativeId : 1;
  const people = [
    s.par?.fa,
    s.par?.mo,
    ...siblingsOf(s),
    ...siblingsOf(s).flatMap(x => [x.familyHousehold?.partner, ...(x.familyHousehold?.children || [])]),
    ...(s.care?.supportNetwork?.members || []),
    s.sp,
    ...(s.kids || []),
    s.romance,
    s.friendContact,
    s.neighborContact,
    ...(s.relationshipHistory || []),
    ...(s.lifeRecord?.workRelationships || []).map(row => row.person)
  ].filter(Boolean);
  for (const person of people) {
    const n = Number(String(person.id).match(/^relative-(\d+)$/)?.[1] || 0);
    next = Math.max(next, n + 1);
  }
  const seen = new Set(),
    assign = person => {
      if (!person) return;
      if (!/^relative-\d+$/.test(String(person.id || "")) || seen.has(person.id)) {
        while (seen.has("relative-" + next)) next++;
        person.id = "relative-" + next++;
      }
      seen.add(person.id);
    };
  assign(s.par?.fa);
  assign(s.par?.mo);
  siblingsOf(s).forEach(x => {
    assign(x);
    assign(x.familyHousehold?.partner);
    (x.familyHousehold?.children || []).forEach(assign);
  });
  (s.care?.supportNetwork?.members || []).forEach(assign);
  assign(s.sp);
  (s.kids || []).forEach(assign);
  assign(s.romance);
  assign(s.friendContact);
  assign(s.neighborContact);
  (s.relationshipHistory || []).forEach(assign);
  (s.lifeRecord?.workRelationships || []).forEach(row => assign(row.person));
  for (const person of people) {
    const n = Number(String(person.id).match(/^relative-(\d+)$/)?.[1] || 0);
    next = Math.max(next, n + 1);
  }
  s.nextRelativeId = next;
  return s;
}
const newRelativeId = s => "relative-" + s.nextRelativeId++;
function initializeCareNetworkPeople(s) {
  const network = s.care?.supportNetwork;
  if (!network || Array.isArray(network.members)) return;
  const roles = network.roles || [],
    region = s.res || s.g || REG[0],
    memberCount = rnd(1, Math.min(3, Math.max(1, roles.length)));
  const usedNames = knownPersonNames(s);
  network.members = Array.from({ length: memberCount }, () => {
    const sx = R() < P("birth.femaleShare") ? "女" : "男",
      race = pickRaceFor(region),
      name = nmUnique_(s, sx, region, usedNames);
    usedNames.push(name);
    return {
      id: newRelativeId(s),
      nm: name,
      sx,
      r: race,
      by: s.by - rnd(20, 45),
      j: wp(SIM_TABLES.parentJobs).jobId,
      roles: [],
      roleHistory: [],
      careStatus: "active",
      careStatusKnownYear: s.by,
      region: network.region || region.n,
      knownRegion: network.region || region.n,
      regionKnownYear: s.by,
      moveCount: 0,
      moveHistory: [],
      knownMoveCount: 0,
      knownMoveHistory: [],
      pendingMoveNotices: [],
      moveReviewYear: null,
      lifeStatus: "alive",
      knownLifeStatus: "alive",
      knownLifeStatusYear: s.by,
      lifeHistory: [{ year: s.by, status: "alive" }],
      knownLifeHistory: [{ year: s.by, status: "alive" }],
      pendingDeathNotices: [],
      pendingMissingNotices: [],
      pendingFoundNotices: [],
      missingSinceYear: null,
      missingFromRegion: null,
      searchEffort: 0,
      missingReviewYear: null,
      deathYear: null,
      deathCause: null,
      deathKnownYear: null
    };
  });
  roles.forEach((role, index) => network.members[index % memberCount].roles.push(role));
  for (const person of network.members) {
    person.roleHistory.push({ year: s.by, state: "active", roles: [...person.roles] });
  }
}
function endCareNetworkPeopleRoles(network, year) {
  for (const person of network?.members || [])
    if (person.careStatus === "active") {
      person.careStatus = "former";
      person.careStatusKnownYear = year;
      person.roleHistory || (person.roleHistory = []);
      person.roleHistory.push({ year, state: "ended", roles: [...(person.roles || [])] });
      person.roleHistory = person.roleHistory.slice(-12);
    }
}
function ensureSocialContact(s, kind) {
  const key = kind === "friend" ? "friendContact" : "neighborContact";
  let person = s[key];
  const ended =
    kind === "friend"
      ? ["severed", "deceased"].includes(person?.status)
      : ["moved", "deceased", "以前の近所の人"].includes(person?.status);
  if (ended) {
    s.relationshipHistory || (s.relationshipHistory = []);
    s.relationshipHistory.push({
      ...person,
      endedYear: person.endedYear || s.year,
      ending:
        person.ending || (person.lifeStatus === "dead" ? "死別" : kind === "friend" ? "疎遠" : "転居で離れた")
    });
    person = null;
    s[key] = null;
  }
  if (!person) {
    const sex = R() < P("birth.femaleShare") ? "女" : "男";
    person = {
      id: newRelativeId(s),
      kind,
      nm: nmUnique_(s, sex, s.res),
      sx: sex,
      r: pickRaceFor(s.res),
      by: s.year - rnd(18, 48),
      j: wp(SIM_TABLES.parentJobs).jobId,
      region: s.res.n,
      home: s.home,
      localKind: s.local?.kind || null,
      metYear: s.year,
      metAreaKey: s.res && s.local ? localityKey(s) : null,
      metPlaceId: s.local?.placeId || null,
      metResidenceBaseId: s.residenceBase?.id || null,
      status: kind === "friend" ? "知人" : "新しい隣人",
      lifeStatus: "alive",
      knownLifeStatus: "alive",
      knownLifeStatusYear: s.year,
      missingSinceYear: null,
      missingFromRegion: null,
      knownMissingSinceYear: null,
      knownMissingLastRegion: null,
      missingReviewYear: null,
      searchEffort: 0,
      pendingMissingNotices: [],
      pendingFoundNotices: [],
      pendingRecontactNotices: [],
      recontactIntent: "none",
      knownRecontactStatus: "none",
      recontactReviewYear: null,
      recontactAttemptCount: 0,
      lifeHistory: [{ year: s.year, status: "alive" }],
      knownLifeHistory: [{ year: s.year, status: "alive" }]
    };
    s[key] = person;
  }
  return person;
}
function advanceRelativeMilestones(s) {
  const people = [
    s.par?.fa,
    s.par?.mo,
    ...siblingsOf(s),
    ...siblingsOf(s).flatMap(x => [x.familyHousehold?.partner, ...(x.familyHousehold?.children || [])]),
    ...(s.kids || []),
    s.sp,
    s.romance,
    s.friendContact,
    s.neighborContact
  ].filter(Boolean);
  for (const child of s.kids || [])
    if (
      !child.d &&
      child.householdStatus === "study" &&
      Number.isFinite(child.studyEndYear) &&
      s.year >= child.studyEndYear
    ) {
      child.householdStatus = "supported";
      child.studyCompletedYear = child.studyEndYear;
      child.trainingCompletedYear = child.studyEndYear;
      child.studyEndYear = null;
      child.futurePlanReviewYear = s.year;
      if (child.remittanceAnnual > 0) {
        child.remittanceAnnual = 0;
        child.remittanceEndedYear = s.year;
      }
    }
  for (const person of people) {
    const birth = Number.isFinite(person.by) ? person.by : person.metYear;
    if (!Number.isFinite(birth)) continue;
    const next =
      person.d || person.lifeStatus === "dead"
        ? "死亡"
        : STG[stg({ age: Math.max(0, s.year - birth), r: person.r || s.r })];
    if (person.lifeStage !== next) {
      person.lifeStage = next;
      person.lifeStageSinceYear = s.year;
    }
  }
}
function advanceParentWorkLives(s) {
  for (const [key, parent] of Object.entries(s.par || {})) {
    if (!parent || parent.d || parent.healthUpdatedYear >= s.year) continue;
    const age = Math.max(0, s.year - parent.by),
      hazard = [2, 3, 4].includes(parent.j) ? 1 : 0;
    const ageLoad = Math.max(0, age - P("family.parentHealthAgeStart")) * P("family.parentHealthAgeDrift"),
      infectionLoad = parent.inf ? P("family.parentHealthInfectionDrift") : 0,
      workLoad = hazard ? P("family.parentHealthHazardDrift") : 0;
    parent.health = clamp(
      parent.health - ageLoad - infectionLoad - workLoad + (R() - 0.5) * P("family.parentHealthRandomDrift"),
      0,
      100
    );
    const mortality = spouseMortalityRisk(s, parent);
    parent.mortalityCheckedYear = s.year;
    if (
      mortality &&
      (mortality.risk >= 1 ||
        keyedRoll(`${parent.id || key}|${parent.nm}|${parent.by}|${s.year}|parent-death`) < mortality.risk)
    ) {
      parent.d = s.year;
      parent.dead = true;
      parent.deathCause = mortality.cause;
      parent.deathKnownYear = s.year;
      parent.tx = 0;
      parent.workShare = 0;
      parent.healthUpdatedYear = s.year;
      notifyParentOripathyDeath(s,parent,key);
      importantLifeNotification(s,"parent-death");
      continue;
    }
    const floor = P("family.parentWorkShareFloor"),
      threshold = P("family.parentWorkShareHealthThreshold");
    parent.workShare = clamp(
      floor +
        (1 - floor) * Math.max(0, Math.min(1, (parent.health - floor * 100) / (threshold - floor * 100))),
      floor,
      1
    );
    parent.healthUpdatedYear = s.year;
    if (parent.workShare < 1 && parent.lastWorkCapacityNoticeYear !== s.year) {
      parent.lastWorkCapacityNoticeYear = s.year;
      parent.workCapacityHistory || (parent.workCapacityHistory = []);
      parent.workCapacityHistory.push({
        year: s.year,
        health: Math.round(parent.health),
        workShare: Math.round(parent.workShare * 100) / 100
      });
      parent.workCapacityHistory = parent.workCapacityHistory.slice(-8);
    }
  }
}
function notifyParentOripathyDeath(s,parent,key){
  if(!parent?.d||!parent.inf||!String(parent.deathCause).includes('鉱石病')||parent.oripathyDeathNotice)return false;
  const variant=travelPresence(s).mode!=='residence'||parent.separated?4:Math.min(4,Math.floor(R()*5)),id='parent_oripathy_death_'+(variant+1),
    event=EV.find(e=>e.id===id);
  if(!event)return false;
  parent.oripathyDeathNotice={eventId:id,personId:parent.id||key,deathYear:parent.d,
    notifiedYear:s.year,notifiedMonth:s.mo||null};
  fire({...event,t:event.t.replaceAll('{親の名}',parent.nm||'親')},s,tags(s));
  // Only the scene with actual dust inhalation can establish this new exposure.
  // It never automatically diagnoses the child or infects the whole household.
  if(variant===2&&s===S&&!s.inf&&R()<0.15)
    applyInfectionAndContactEffects({inf:1,infectionRoute:'dust',infCause:'鉱石病で亡くなった親の遺体から舞った源石粉塵を吸い込んだ'},s);
  return true;
}
