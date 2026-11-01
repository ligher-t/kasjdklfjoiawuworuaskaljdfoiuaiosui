function repairSiracusaFamilyTie(s) {
  if (!s) return s;
  const tie = s.siracusaFamilyTie;
  if (!tie) {
    if (s.fl?.family) {
      s.siracusaFamilyTie = {
        status: "active",
        startedYear: null,
        startYearBasis: "legacy-unrecorded",
        nextReviewYear: null,
        history: [],
        duty: {
          count: 0,
          lastYear: null,
          nextYear: null,
          outstandingAmount: 0,
          settleByYear: null,
          history: []
        },
        legacyRepair: "旧セーブに組織的ファミリー関係フラグあり。開始年・経緯は不明"
      };
    }
    return s;
  }
  if (!["active", "distant", "left", "declined"].includes(tie.status))
    tie.status = s.fl?.family ? "active" : "declined";
  if (!Number.isInteger(tie.startedYear)) tie.startedYear = null;
  if (!["recorded", "legacy-unrecorded"].includes(tie.startYearBasis))
    tie.startYearBasis = tie.startedYear === null ? "legacy-unrecorded" : "recorded";
  if (!Array.isArray(tie.history)) tie.history = [];
  tie.history = tie.history
    .filter(
      row => row && Number.isInteger(row.year) && ["active", "distant", "left", "declined"].includes(row.to)
    )
    .slice(-16);
  const duty =
    tie.duty ||
    (tie.duty = {
      count: 0,
      lastYear: null,
      nextYear: null,
      outstandingAmount: 0,
      settleByYear: null,
      history: []
    });
  duty.count = Number.isInteger(duty.count) && duty.count >= 0 ? duty.count : 0;
  duty.lastYear = Number.isInteger(duty.lastYear) ? duty.lastYear : null;
  duty.nextYear = Number.isInteger(duty.nextYear) ? duty.nextYear : null;
  duty.outstandingAmount =
    Number.isFinite(duty.outstandingAmount) && duty.outstandingAmount >= 0 ? duty.outstandingAmount : 0;
  duty.settleByYear = Number.isInteger(duty.settleByYear) ? duty.settleByYear : null;
  if (!Array.isArray(duty.history)) duty.history = [];
  duty.history = duty.history
    .filter(
      row =>
        row &&
        Number.isInteger(row.year) &&
        [
          "join",
          "paidErrand",
          "refusedPressure",
          "acceptedPressure",
          "settled",
          "mediated",
          "disputed"
        ].includes(row.action)
    )
    .slice(-20);
  if (tie.status === "active") s.fl.family = 1;
  else s.fl.family = 0;
  return s;
}
function recordSiracusaFamilyAction(s, action, eventId, choice) {
  if (!["active", "distant", "left", "declined"].includes(action)) return;
  const before = s.siracusaFamilyTie?.status || null,
    tie =
      s.siracusaFamilyTie ||
      (s.siracusaFamilyTie = {
        status: null,
        startedYear: null,
        startYearBasis: "recorded",
        nextReviewYear: null,
        history: []
      });
  if (action === "active" && tie.startedYear === null) {
    tie.startedYear = s.year;
    tie.startYearBasis = "recorded";
  }
  tie.status = action;
  if (action === "active" || action === "distant")
    tie.nextReviewYear = s.year + P("family.siracusaFamilyReviewYears");
  else tie.nextReviewYear = null;
  const duty =
    tie.duty ||
    (tie.duty = {
      count: 0,
      lastYear: null,
      nextYear: null,
      outstandingAmount: 0,
      settleByYear: null,
      history: []
    });
  if (action === "active" && !Number.isInteger(duty.nextYear)) duty.nextYear = s.year + 2;
  tie.history || (tie.history = []);
  tie.history.push({
    year: s.year,
    from: before,
    to: action,
    eventId: eventId || null,
    choice: choice || null
  });
  tie.history = tie.history.slice(-16);
  tie.legacyRepair = null;
  s.fl || (s.fl = {});
  s.fl.family = action === "active" ? 1 : 0;
}
function recordSiracusaFamilyDuty(s, input, eventId, choice) {
  if (!input || !s?.siracusaFamilyTie)
    throw new Error("未記録のファミリー関係には仕事・借りを追加できません");
  const d =
      s.siracusaFamilyTie.duty ||
      (s.siracusaFamilyTie.duty = {
        count: 0,
        lastYear: null,
        nextYear: null,
        outstandingAmount: 0,
        settleByYear: null,
        history: []
      }),
    action = input.action;
  if (
    ![
      "join",
      "paidErrand",
      "refusedPressure",
      "acceptedPressure",
      "settled",
      "mediated",
      "disputed"
    ].includes(action)
  )
    throw new Error("ファミリーの仕事・借りの記録形式が不正");
  const amount = Math.max(0, Number(input.amount) || 0);
  if (action === "join") {
    if (!Number.isInteger(d.nextYear)) d.nextYear = s.year + 2;
  } else if (action === "paidErrand" || action === "refusedPressure" || action === "acceptedPressure") {
    d.count++;
    d.lastYear = s.year;
    d.nextYear = s.year + P("family.siracusaFamilyDutyYears");
  }
  if (action === "acceptedPressure") {
    d.outstandingAmount = amount;
    d.settleByYear = s.year + 2;
  } else if (action === "settled") {
    d.outstandingAmount = 0;
    d.settleByYear = null;
  } else if (action === "mediated") {
    d.outstandingAmount = amount;
    d.settleByYear = amount > 0 ? s.year + 2 : null;
  } else if (action === "disputed") {
    d.settleByYear = null;
  }
  d.history.push({
    year: s.year,
    action,
    amount,
    eventId: eventId || null,
    choice: choice || null,
    note: String(input.note || "").slice(0, 180)
  });
  d.history = d.history.slice(-20);
}
function siracusaFamilyDutyMarkup(s) {
  const d = s.siracusaFamilyTie?.duty;
  if (!d) return "";
  const last = d.history?.at(-1),
    owed =
      d.outstandingAmount > 0
        ? `・未清算 ${m(d.outstandingAmount)}・返事の目安 ${d.settleByYear || "未設定"}年`
        : "・未清算の借りなし";
  return (
    `<dt>ファミリーでの用事・借り</dt><dd>記録した用事 ${d.count || 0}件${d.lastYear ? `・直近 ${d.lastYear}年` : ""}${d.nextYear ? `・次の相談目安 ${d.nextYear}年` : ""}` +
    `${owed}${last ? `<br>${last.year}年: ${esc(last.note || last.action)}` : ""}</dd>`
  );
}
