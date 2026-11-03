function finalizeLifeLedgerAtDeath(s) {
  if(typeof finalizeLoanContractsAtDeath==="function")finalizeLoanContractsAtDeath(s);
  if(typeof finalizePersonalWishesAtDeath==="function")finalizePersonalWishesAtDeath(s);
}
function ap(e, routeReserve = 0) {
  if (!e) return;
  const cashAlreadyScaled = typeof e.cash === "function";
  if (cashAlreadyScaled) e = { ...e, cash: e.cash(S) };
  if (e.returnToLocality && !canReturnToResidence(S,e.returnToLocality==="previous"?previousResidenceKey(S):e.returnToLocality))
    throw new Error("再訪できる居住記録がありません");
  if (e.resTo && !REG.some(row=>row.n===e.resTo)) throw new Error("転居先の地域が不正");
  if (e.resTo && e.resTo !== S.res.n && !moveDestinations(S).some(row=>row.n===e.resTo)) throw new Error("指定された地域へ移動できる経路がありません");
  const s = S,
    fromRegion = s.res.n,
    fundsBeforeEffects = moveFunds(s),
    jobBefore = s.job;
  applyLifeRecordEffects(e, s);
  const assetsBefore = (s.cash || 0) + (s.house?.cash || 0) + (s.investment || 0),
    debtBefore = (s.debt || 0) + (s.house?.debt || 0),
    investmentBefore = s.investment || 0,
    cashBefore = s.cash || 0;
  applyStatEffects(e, s);
  applyParentMedicalEffects(e, s);
  applyInfectionAndContactEffects(e, s);
  educationEnforceAccess(s);
  applyHouseholdHealthEffects(e, s);
  const cashScale = (e.med ? s.res.md : e.sc ? s.res.sc : e.pm ? s.res.pm : 1) * (s.priceIndex || 1);
  const addMoney = (target, amount) => {
    target.cash += amount;
    if (target.cash < 0) {
      target.debt -= target.cash;
      target.cash = 0;
    }
  };
  applyMoneyEffects(e, s, cashScale, addMoney, cashAlreadyScaled);
  applyWorkAndCareEffects(e, s, fromRegion);
  applyRelationshipAndSiblingHealthEffects(e, s);
  applySiblingSupportEffects(e, s);
  applySpouseEffects(e, s);
  applyChildEffects(e, s, addMoney);
  applyResidenceEffects(e, routeReserve, s, fromRegion, fundsBeforeEffects, addMoney);
  finishAffiliationPlaces(e, s);
  const resolvedId = TRACE_RESOLUTION?.id;
  applyNeighbourAndWorkplaceEffects(e, s, resolvedId);
  reconcileRelationshipStatusFlags(s);
  recordEffectConsequences(e, s, jobBefore, assetsBefore, debtBefore, investmentBefore, cashBefore);
  reconcileSocialAndInformationEffects(e, s);
  if (e.d) {
    finalizeLifeLedgerAtDeath(s);
    die(e.d[0], e.d[1]);
  }
}
