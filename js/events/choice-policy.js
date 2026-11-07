const SC = e =>
  e
    ? (e.d ? P("outcome.scoreDeathPenalty") : 0) +
      (e.h || 0) * P("outcome.scoreHealthScale") +
      (e.p || 0) +
      (e.rl || 0) * P("outcome.scoreRelationScale") +
      (e.k || 0) * P("outcome.scoreKnowledgeScale") +
      (e.ar || 0) * P("outcome.scoreArtsScale") +
      (e.cr || 0) * P("outcome.scoreCreditScale") +
      (e.ob || 0) * P("outcome.scoreInfectionLoadScale") +
      (e.inf ? P("outcome.scoreInfectionPenalty") : 0) +
      (((typeof e.cash === "function" && typeof S !== "undefined" ? e.cash(S) : e.cash || 0) +
        (e.investment || 0) -
        (e.debt || 0) -
        (e.medicalDebt || 0)) /
        P("outcome.scoreCashScale")) *
        P("outcome.scoreCashFactor") +
      (e.childReturnRoomSetup &&
      typeof adultChildReturnRoomSetupCost === "function" &&
      typeof S !== "undefined"
        ? (-adultChildReturnRoomSetupCost(S) / P("outcome.scoreCashScale")) * P("outcome.scoreCashFactor")
        : 0) +
      (e.childContact === "return" &&
      typeof adultChildReturnAnnualCost === "function" &&
      typeof S !== "undefined"
        ? (-adultChildReturnAnnualCost(
            S,
            (S.kids || []).find(k => k.id === S.eventRelativeId && !k.d)
          ) /
            P("outcome.scoreCashScale")) *
          P("outcome.scoreCashFactor")
        : 0) +
      (e.w || 0) * P("outcome.scoreWealthScale") +
      (e.payBonus || 0) * P("outcome.scorePayBonusScale")
    : 0;
const attitudeConsistencyScore = e => {
  if (!e || typeof S === "undefined") return 0;
  const adult = S.age >= P("life.adultStartAge"),
    scale = P("outcome.scoreAttitudeConsistencyScale");
  let score = 0;
  for (const [key, requested] of [
    ["biasInfected", e.biasInf || 0],
    ["biasSarkaz", e.biasSar || 0]
  ]) {
    if (!requested) continue;
    const before = S[key] || 0,
      change = adult && requested < 0 ? requested * 0.18 : requested,
      after = clamp(before + change, 0, 100),
      effectiveDelta = after - before;
    score += effectiveDelta * ((before - 50) / 50) * scale;
  }
  return score;
};
const autoChoiceScore = (choice, mode) => {
  let previous = 0,
    mean = 0,
    second = 0;
  for (const outcome of choice.o) {
    const probability = outcome[0] - previous,
      value = SC(outcome[2]) + attitudeConsistencyScore(outcome[2]);
    mean += probability * value;
    second += probability * value * value;
    previous = outcome[0];
  }
  const risk = Math.sqrt(Math.max(0, second - mean * mean));
  return mode === "c"
    ? mean - P("outcome.choiceRiskWeight") * risk
    : mean + P("outcome.choiceRiskWeight") * risk;
};
const selectAutomaticChoice = (choices, mode) => {
  if (!choices.length) return null;
  if (mode === "c" || mode === "b") {
    const scored = choices.map(choice => ({ choice, score: autoChoiceScore(choice, mode) })),
      bestScore = Math.max(...scored.map(item => item.score));
    const tied = scored
      .filter(item => Math.abs(item.score - bestScore) < 1e-9)
      .map(item => item.choice)
      .sort((left, right) => {
        const key = choice => `${choice?.id ?? ""}|${choice?.l ?? ""}|${JSON.stringify(choice?.o ?? choice)}`;
        const a = key(left),
          b = key(right);
        return a < b ? -1 : a > b ? 1 : 0;
      });
    return tied[Math.floor(R() * tied.length)];
  }
  return choices[Math.floor(R() * choices.length)];
};
const tn = v => (v >= P("outcome.goodThreshold") ? "gd" : v <= P("outcome.badThreshold") ? "bad" : "");
const tone = (e, displayTone) =>
  displayTone === "good" ? "gd" : displayTone === "bad" ? "bad" : tn(SC(e));
const evt = c => {
  const explicitTone = c.o[0]?.[3];
  if (explicitTone && c.o.every(outcome => outcome[3] === explicitTone))
    return explicitTone === "good" ? "gd" : "bad";
  let previous = 0,
    v = 0;
  for (const o of c.o) {
    const p = o[0] - previous;
    v += p * SC(o[2]);
    previous = o[0];
  }
  return tn(v);
};
