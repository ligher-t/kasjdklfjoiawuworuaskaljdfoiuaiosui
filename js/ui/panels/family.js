function renderFamilyPanel(s, services) {
  let markup =
    services.fam(s) +
    services.siracusaFamilyDutyMarkup(s) +
    services.recurringHouseholdCostsMarkup(s) +
    ((services.inSharedHousehold(s) ||
      (!s.fl?.household_separated && s.residenceArrangement === "family_home_separate_budget")) && s.house
      ? `<dt>${services.inSharedHousehold(s) ? "家族の共有家計" : "同居する家族の家計（本人とは別会計）"}${s.house.flow?.year ? "（" + s.house.flow.year + "年）" : ""}</dt><dd>貯蓄 ${services.m(s.house.cash)}・負債 ${services.m(s.house.debt)}・収入 ${services.m(s.house.inc)}` +
        `・支出 ${services.m(s.house.exp)}</dd>${
          s.house.flow
            ? `<dt>家計支出内訳（${s.house.flow.year}年）</dt><dd>生活 ${services.m(s.house.flow.expense.living || 0)}・教育 ${services.m(s.house.flow.expense.school || 0)}` +
              `・本人の療養 ${services.m(s.house.flow.expense.treatment || 0)}・親の療養 ${services.m(s.house.flow.expense.parentTreatment || 0)}` +
              (`・きょうだいのケア ${services.m(s.house.flow.expense.siblingCare || 0)}・通院移動 ${services.m(s.house.flow.expense.medicalTravel || 0)}・飼育 ${services.m(s.house.flow.expense.pet || 0)}` +
                `</dd>`)
            : ""
        }`
      : "");
  markup +=
    services.formerSpouseLifeMarkup(s) +
    services.careEngagementMarkup(s) +
    services.spouseHealthMarkup(s) +
    services.spouseWorkMarkup(s) +
    services.spouseResidenceMarkup(s) +
    services.spouseHouseholdArrangementMarkup(s) +
    services.spouseSeparateLifeMarkup(s) +
    services.spouseVisitMarkup(s) +
    services.spousePersonalFinanceMarkup(s);
  const treeHtml = services.generationTreeMarkup ? services.generationTreeMarkup(s) : "";
  const tableHtml = services.recordTableMarkup(markup, "family", true);
  services.setRecordMarkup(services.$("fm"), treeHtml + tableHtml);
}
