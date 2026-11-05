// Relatives have their own work periods. Background livelihoods remain a game
// estimate: an occupation never proves a named employer, vacancy, or worksite.
function dependentEmploymentJob(person) {
  return Number.isInteger(person?.jobId) ? person.jobId : person?.j;
}
function dependentEmploymentMonth(s, month) {
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month :
    Number.isInteger(s.mo) && s.mo >= 1 && s.mo <= 12 ? s.mo : 1;
}
function closeDependentEmployment(s, person, reason = "work-ended", date = {}) {
  const state = person?.employmentState,
    current = state?.episodes?.find(row => row.episodeId === state.activeEpisodeId);
  if (!current || current.status === "terminated") return null;
  const year = Number.isInteger(date.year) ? date.year : s.year,
    month = dependentEmploymentMonth(s, date.month);
  if (year < current.startYear || (year === current.startYear && month < current.startMonth))
    throw Error("家族の仕事の終了日が開始日より前です");
  current.endYear = year;
  current.endMonth = month;
  current.status = "terminated";
  current.leaveReason = reason;
  current.history.push({year, month, status: "terminated", reason});
  if (current.occupiesPosition) {
    const position = s.world?.occupationWorld?.positions?.[current.positionId];
    if (position) {
      position.identifiedOccupiedSlots = Math.max(0, (position.identifiedOccupiedSlots || 0) - 1);
      position.vacancyCount = Math.max(0, position.capacity - position.aggregateOccupiedSlots -
        position.identifiedOccupiedSlots - (position.reservedSlots || 0));
    }
    current.occupiesPosition = false;
  }
  state.activeEpisodeId = null;
  return current;
}
function recordDependentEmployment(s, person, input = {}) {
  if (!person?.id || !Number.isInteger(input.jobId) || !J[input.jobId] || !input.source)
    throw Error("家族本人と仕事の根拠が確認できません");
  const year = Number.isInteger(input.year) ? input.year : s.year,
    month = dependentEmploymentMonth(s, input.month),
    region = input.region || person.residenceRegion || person.region || s.res?.n,
    kind = input.kind || "background-livelihood",
    state = person.employmentState || {version: 1, cases: [], episodes: [], activeEpisodeId: null},
    current = state.episodes.find(row => row.episodeId === state.activeEpisodeId);
  if (!REG.some(row => row.n === region)) throw Error("家族の仕事が行われる地域を確認できません");
  if (input.jobId === 0 || person.d || input.unemployed) {
    person.employmentState = state;
    closeDependentEmployment(s, person, person.d ? "death" : "unemployed", {year, month});
    return null;
  }
  // Named employment must refer to the same real world records as the player.
  // Background occupation generation can only establish anonymous livelihood.
  const world = s.world?.occupationWorld,
    site = world?.sites?.[input.siteId],
    employer = site && world.employers?.[site.employerId],
    position = world?.positions?.[input.positionId],
    opening = world?.openings?.[input.openingId];
  if (current && current.jobId === input.jobId && current.region === region &&
      current.siteId === (input.siteId || null) && current.kind === kind) return current;
  if (input.siteId || input.employerId || input.positionId || input.jobId >= 28) {
    if (!site || !employer || position?.siteId !== site.siteId ||
        position.jobId !== input.jobId || input.employerId !== site.employerId)
      throw Error("家族の雇用先と実職位の対応が確認できません");
    const mode = EMPLOYER_PLAYER_ACCESS_MODES[employer.organizationKey];
    if (mode && !["GENERAL", "SPECIAL"].includes(mode))
      throw Error("新規採用の対象外である組織を家族の雇用先にできません");
    const access = assessPlayerEmploymentAccess(s, {
      jobId: input.jobId, organizationKey: employer.organizationKey || undefined,
      siteId: input.siteId, positionId: input.positionId, openingId: input.openingId,
      knownToPerson: input.knownToPerson === true,
      selected: input.selected === true, accepted: input.accepted === true,
      started: input.started === true, specialPath: input.specialPath === true
    });
    if (!access.canStart || !opening || site.region && site.region !== region)
      throw Error("家族本人の募集・承諾・勤務開始を確認できません");
  }
  closeDependentEmployment(s, person, input.reason || "changed-livelihood", {year, month});
  person.employmentState = state;
  const episodeId = "family-work:" + person.id + ":" + (state.episodes.length + 1),
    sourceCaseId = "family-case:" + person.id + ":" + (state.cases.length + 1),
    annualBase = Number.isFinite(input.annualBase) ? Math.max(0, input.annualBase) : Math.max(0, J[input.jobId].pay || 0),
    episode = {
      episodeId, personId: person.id, sourceCaseId, jobId: input.jobId, kind,
      employerId: input.employerId || null, siteId: input.siteId || null,
      positionId: input.positionId || null, region, status: "active",
      occupiesPosition: !!site,
      startYear: year, startMonth: month, endYear: null, endMonth: null,
      annualBase, workFraction: Math.max(0, Math.min(1, input.workFraction ?? 1)),
      basis: site ? "verified-family-work-period" : "background-livelihood-game-model",
      sourceEventId: input.source,
      history: [{year, month, status: "active", source: input.source}]
    };
  state.cases.push({caseId: sourceCaseId, personId: person.id, year, month,
    status: "active", sourceEventId: input.source,
    basis: episode.basis, selectionHistory: site ? "recorded-by-source" : "not-individually-modeled"});
  state.episodes.push(episode);
  state.activeEpisodeId = episodeId;
  if (site) {
    opening.slots--;
    if (opening.slots === 0) opening.status = "filled";
    position.identifiedOccupiedSlots = (position.identifiedOccupiedSlots || 0) + 1;
    position.vacancyCount = Math.max(0, position.capacity - position.aggregateOccupiedSlots -
      position.identifiedOccupiedSlots - (position.reservedSlots || 0));
  }
  return episode;
}
// This is a quote, not a transfer. Read-only UI and annual previews must not
// create work periods, settle a wallet, or consume random numbers.
function dependentEmploymentAnnualIncome(s, person, year = s.year, options = {}) {
  if (!person) return 0;
  const jobId = options.jobId ?? dependentEmploymentJob(person),
    region = REG.find(row => row.n === (options.region || person.residenceRegion || person.region)) || s.res,
    priceIndex = Math.max(0.1, options.priceIndex ?? s.priceIndex ?? 1),
    capacity = Math.max(0, Math.min(1, options.capacity ?? options.workFraction ?? person.workShare ?? 1)),
    episodes = person.employmentState?.episodes;
  let base = 0;
  if (episodes) {
    for (const row of episodes) {
      if (row.personId !== person.id || row.startYear > year ||
          (row.endYear != null && row.endYear < year)) continue;
      if (options.unemployed && row.endYear == null) continue;
      const first = row.startYear === year ? row.startMonth : 1,
        deathYear = Number.isInteger(person.d) && person.d > 0 ? person.d : person.deathYear,
        after = Math.min(row.endYear === year ? row.endMonth : 13,
          deathYear === year ? person.deathMonth || person.actualDeathMonth || 1 :
            Number.isInteger(deathYear) && deathYear < year ? 1 : 13),
        months = Math.max(0, Math.min(13, after) - Math.max(1, first)),
        pm = REG.find(item => item.n === row.region)?.pm || region.pm;
      base += row.annualBase * months / 12 * row.workFraction * pm;
    }
  } else {
    // The background NPC model does not simulate every worker's appointment.
    // Keep its estimate separate from verified employer-linked pay records.
    if (person.d || options.unemployed || !Number.isInteger(jobId) || jobId <= 0 || jobId >= 28 || !J[jobId]) return 0;
    base = Math.max(0, J[jobId].pay || 0) * region.pm;
  }
  return base * (1 + (priceIndex - 1) * 0.65) * capacity;
}
// Call only after the corresponding household/person cash settlement. This
// records its provenance; it never adds money a second time.
function recordDependentEmploymentPayment(s, person, input) {
  if (!person?.id || !Number.isFinite(input?.amount) || input.amount < 0 ||
      !input.recipientId || !input.source) throw Error("家族の就労収支の確定根拠がありません");
  const year = input.year ?? s.year,
    kind = input.kind || "work-income",
    txId = "family-work-payment:" + person.id + ":" + input.recipientId + ":" + year + ":" + kind,
    ledger = person.workEarningsLedger ||= [];
  const prior = ledger.find(row => row.txId === txId);
  if (prior) {
    if (Math.abs(prior.amount - input.amount) > 0.001)
      throw Error("同じ家族の確定収支に異なる金額を二重登録できません");
    return prior;
  }
  const row = {txId, personId: person.id, recipientId: input.recipientId,
    year, kind, amount: input.amount, source: input.source,
    episodeIds: (person.employmentState?.episodes || []).filter(item =>
      item.startYear <= year && (item.endYear == null || item.endYear >= year)).map(item => item.episodeId),
    basis: person.employmentState?.episodes?.length ? "family-work-period-projection" : "background-income-game-model"};
  ledger.push(row);
  if (ledger.length > 48) ledger.shift();
  return row;
}
