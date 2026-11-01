function recordEffectConsequences(e, s, jobBefore, assetsBefore, debtBefore, investmentBefore, cashBefore) {
  if (
    e.cash ||
    e.selfCash ||
    e.debt ||
    e.medicalDebt ||
    e.investment ||
    e.investmentCashout ||
    e.familyTransfer ||
    e.parentHouseholdGift ||
    e.spouseRejoin ||
    e.spouseVisit ||
    e.educationAction
  ) {
    const assetsAfter = (s.cash || 0) + (s.house?.cash || 0) + (s.investment || 0),
      debtAfter = (s.debt || 0) + (s.house?.debt || 0);
    s.moneyLog || (s.moneyLog = []);
    s.moneyLog.push({
      year: s.year,
      event: e.id || TRACE_RESOLUTION?.id || "choice",
      label: TRACE_RESOLUTION?.label || e.label || e.id || "選択による収支",
      assetsDelta: assetsAfter - assetsBefore,
      cashDelta: (s.cash || 0) - cashBefore,
      debtDelta: debtAfter - debtBefore,
      investmentDelta: (s.investment || 0) - investmentBefore,
      kind:
        TRACE_RESOLUTION?.id === "life_rim_supply_delay" &&
        TRACE_RESOLUTION?.label?.startsWith("自分の道具と材料を買い足す")
          ? "仕事道具・消耗品"
          : TRACE_RESOLUTION?.id === "sie_seasonal_work"
            ? "地域の季節雇用"
            : e.parentHouseholdGift
              ? "親世帯への送金"
              : e.spouseVisit
                ? "別居配偶者への訪問"
                : e.spouseRejoin
                  ? "配偶者の再合流"
                  : e.educationAction
                    ? "教育・進路"
                  : e.med
                    ? "医療"
                    : e.investment || e.investmentCashout
                      ? "投資"
                      : e.debt
                        ? "借入・返済"
                        : "生活上の選択"
    });
    if (s.moneyLog.length > CHOICE_ECONOMY_HISTORY_LIMIT) s.moneyLog.shift();
  }
  if (s.job !== jobBefore) {
    if (s.fl?.ed_work_disadvantage) s.fl.ed_work_disadvantage = 0;
    recordCareerChange(s, jobBefore, s.job);
  }
  reconcileCareerPlacements(
    s,
    e.job != null && s.job > 0,
    e.job != null
      ? [e.lifeAffiliation, ...(e.lifeAffiliations || [])]
          .filter(row => row && ["join", "return", "continue", "role"].includes(row.action || "join"))
          .map(row => row.id)
      : null
  );
}
