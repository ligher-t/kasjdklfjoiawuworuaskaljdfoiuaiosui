const CHOICE_ECONOMY_HISTORY_LIMIT = 600;
const FLOW_INCOME_LABELS = {
  wages: "本人の給金",
  children: "子からの家計拠出",
  spouse: "配偶者からの家計拠出",
  support: "生活支援",
  veteranPension: "従軍後の恩給"
};
const FLOW_EXPENSE_LABELS = {
  living: "生活費",
  spouseLiving: "配偶者の生活費",
  medical: "本人・家族の療養",
  medicalTravel: "通院移動",
  insurance: "保険料",
  debtInterest: "借入利息（負債へ加算）",
  hobby: "趣味",
  pet: "飼育動物",
  children: "子の食費・衣類・療養費",
  childHousing: "同居する成人子の住居・共益費",
  childEducation: "子の学業支援",
  childRemittance: "別居した子への送金",
  divorceChildSupport: "離婚後の子への任意支援",
  spouseCare: "配偶者の療養",
  spouseSeparateSupport: "別居配偶者への支援",
  spouseSeparateContact: "別居配偶者との連絡",
  parentTreatment: "親の療養費支援",
  familyCare: "親族の療養支援",
  familyContribution: "家計への拠出",
  siblingCare: "同居感染きょうだいの療養費",
  siblingCareSupport: "別居きょうだいへの療養支援"
};
function annualEconomyHistoryMarkup(history) {
  const rows = (history || []).slice(-5).reverse();
  if (!rows.length)
    return "<li>年ごとの収支記録はまだありません。旧データに記録されていない過去の金額は表示できません。</li>";
  return rows
    .map(row => {
      const incomes =
          Object.entries(row.income || {})
            .filter(([, value]) => value > 0)
            .map(([key, value]) => `${FLOW_INCOME_LABELS[key] || esc(key)} ${m(value)}`)
            .join("・") || "収入記録なし",
        expenses =
          Object.entries(row.expense || {})
            .filter(([, value]) => value > 0)
            .map(([key, value]) => `${FLOW_EXPENSE_LABELS[key] || esc(key)} ${m(value)}`)
            .join("・") || "支出記録なし",
        net = row.net || 0,
        investmentDelta = row.investmentDelta || 0;
      return (
        `<li><strong>${esc(row.year)}年</strong> 収支 ${net >= 0 ? "+" : "−"}${m(Math.abs(net))}<br><span>収入: ${incomes}` +
        `</span><br><span>支出: ${expenses}</span><br><span>年次更新後の手元資金 ${m(row.afterAnnualUpdate?.cash || 0)}` +
        (`・負債 ${m(row.afterAnnualUpdate?.debt || 0)}</span><br><span>年次更新後の投資持分 ${m(row.afterAnnualUpdate?.investment || 0)}` +
          `（当年変動 ${investmentDelta >= 0 ? "+" : "−"}${m(Math.abs(investmentDelta))}`) +
        `）</span></li>`
      );
    })
    .join("");
}
function choiceEconomyHistoryMarkup(history) {
  const rows = (history || []).slice(-5).reverse();
  if (!rows.length)
    return "<li>選択による収支の履歴はまだありません。古いセーブの未記録分は補っていません。</li>";
  return rows
    .map(
      row =>
        `<li><strong>${esc(row.year)}年・${esc(row.kind || "生活上の選択")}</strong> ${esc(row.label || "選択による収支")}<br>` +
        `<span>資産 ${row.assetsDelta >= 0 ? "+" : "−"}${m(Math.abs(row.assetsDelta || 0))}` +
        (`・負債 ${row.debtDelta >= 0 ? "+" : "−"}${m(Math.abs(row.debtDelta || 0))}・投資持分 ${row.investmentDelta >= 0 ? "+" : "−"}` +
          `${m(Math.abs(row.investmentDelta || 0))}</span></li>`)
    )
    .join("");
}
