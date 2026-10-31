function createCatalogCashChecks(W_) {
  const usesAffordableCash = c =>
    !!(
      c &&
      typeof c === "object" &&
      (c.affordableCash != null ||
        c.affordableCashAfterReserve != null ||
        (c.or || []).some(usesAffordableCash))
    );
  const checkAffordableCashEffect = (condition, effect, where) => {
    if (
      usesAffordableCash(condition) &&
      effect?.pm !== 1 &&
      ["cash", "selfCash"].some(key => typeof effect?.[key] === "number" && effect[key] < 0)
    )
      W_.push(`${where}: affordableCash条件と龍門幣支出の地域物価係数が一致しない`);
  };
  const checkCashGateEffect = (conditions, effect, where) => {
    const gates = (Array.isArray(conditions) ? conditions : [conditions])
      .map(c => c?.ge?.cash)
      .filter(Number.isFinite);
    if (!gates.length) return;
    const gate = Math.max(...gates),
      spend = Math.max(0, -(effect?.cash || 0), -(effect?.selfCash || 0));
    if (spend > gate) W_.push(`${where}: ge.cash条件より選択結果の現金支出が大きい`);
    if (spend > 0 && (effect?.pm || effect?.sc || effect?.med))
      W_.push(`${where}: 地域係数付き現金支出にはge.cashでなくaffordableCash条件が必要`);
  };
  return { checkAffordableCashEffect, checkCashGateEffect };
}
