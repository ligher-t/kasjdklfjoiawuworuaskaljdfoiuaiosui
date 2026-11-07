function finalizeLifeLedgerAtDeath(s) {
  if(typeof finalizeLoanContractsAtDeath==="function")finalizeLoanContractsAtDeath(s);
  if(typeof finalizePersonalWishesAtDeath==="function")finalizePersonalWishesAtDeath(s);
}
function ap(e, routeReserve = 0) {
  if (!e) return;
  if (e.violenceAction) {
    const assessment = violenceActionAssessment(S, e.violenceAction, TRACE_RESOLUTION, TRACE_RESOLUTION?.id);
    if (!assessment.ok) throw Error(`暴力イベントの条件が変わったため適用できない: ${assessment.reason}`);
  }
  if (e.employmentAction && e.employmentAction.action !== "site-incident" && e.job != null)
    throw Error("採用案件と旧職業IDの直接付与を同時に処理できない");
  if (e.employmentAction?.action === "complete-gig" &&
      (!Number.isSafeInteger(e.cash) || e.cash !== e.employmentAction.nominalCash))
    throw Error("短期業務に記録された対価と実際の金銭効果が一致しない");
  const original = e;
  e = normalizeEmploymentAffiliationEffects(e);
  const employmentAssessment = employmentEffectAssessment(S, original);
  assertPlayerEmploymentEffectAllowed(e);
  if (!employmentAssessment.canStart) throw Error("勤務開始の条件が変わったため、この仕事は成立しない");
  settleEmploymentThrough(S, S.year, Math.max(0, (S.mo || 1) - 1));
  const disclosureOrigin=disclosureImpactContext(S);
  e=disclosureAdjustedEffect(S,e);
  const cashAlreadyScaled = typeof e.cash === "function";
  if (cashAlreadyScaled) e = { ...e, cash: e.cash(S) };
  if (e.returnToLocality && !canReturnToResidence(S,e.returnToLocality==="previous"?previousResidenceKey(S):e.returnToLocality))
    throw new Error("再訪できる居住記録がありません");
  if (e.resTo && !REG.some(row=>row.n===e.resTo)) throw new Error("転居先の地域が不正");
  if(e.travelResidenceRef)travelResidenceOffer(S,e.travelResidenceRef);
  if (e.resTo && !e.travelResidenceRef && e.resTo !== S.res.n && !moveDestinations(S).some(row=>row.n===e.resTo)) throw new Error("指定された地域へ移動できる経路がありません");
  const s = S,
    fromRegion = s.res.n,
    fundsBeforeEffects = moveFunds(s),
    jobBefore = s.job;
  if(e.travelAction){
    if(e.travelAction.startsWith("checkpoint:"))travelCheckpointAction(s,e.travelAction.split(":")[1]);
    else if(e.travelAction==="intent:flight")travelIntent(s,"flight");
    else if(e.travelAction==="intent:local-flight")travelIntent(s,"flight",s.res.n);
    else throw Error("不明な旅程操作");
  }
  applyLifeRecordEffects(e, s);
  if (e.raceProfileAction) applyRaceProfileAction(s, e.raceProfileAction, TRACE_RESOLUTION?.id || null);
  if (e.artsAction) applyArtsAction(s, e.artsAction);
  if (e.employmentAction && e.employmentAction.action !== "site-incident")
    applyPlayerEmploymentAction(s, e.employmentAction);
  const assetsBefore = (s.cash || 0) + (s.house?.cash || 0) + (s.investment || 0),
    debtBefore = (s.debt || 0) + (s.house?.debt || 0),
    investmentBefore = s.investment || 0,
    cashBefore = s.cash || 0;
  if (e.lifeSystemAction) applyLifeSystemAction(s, e.lifeSystemAction, TRACE_RESOLUTION?.id || null);
  applyStatEffects(e, s);
  applyParentMedicalEffects(e, s);
  applyInfectionAndContactEffects(e, s);
  educationEnforceAccess(s);
  applyHouseholdHealthEffects(e, s);
  let violenceResult = null;
  if (e.violenceAction) {
    violenceResult = ["adjudicate-case", "complete-sentence"].includes(e.violenceAction.action)
      ? applyViolenceLegalAction(s, e.violenceAction, TRACE_RESOLUTION, TRACE_RESOLUTION?.id)
      : applyViolenceAction(s, e.violenceAction, TRACE_RESOLUTION, TRACE_RESOLUTION?.id);
    if (violenceResult.cashDelta)
      e = { ...e, cash: (Number(e.cash) || 0) + violenceResult.cashDelta };
  }
  const cashScale = (e.med ? s.res.md : e.sc ? s.res.sc : e.pm ? s.res.pm : 1) * (s.priceIndex || 1);
  const addMoney = (target, amount) => {
    target.cash += amount;
    if (target.cash < 0) {
      target.debt -= target.cash;
      target.cash = 0;
    }
  };
  applyMoneyEffects(e, s, cashScale, addMoney, cashAlreadyScaled);
  if (e.employmentAction?.action === "complete-gig")
    recordEmploymentGigPayment(s, e.employmentAction, e.cash * cashScale, inSharedHousehold(s) ? "household" : "personal");
  applyWorkAndCareEffects(e, s, fromRegion);
  applyRelationshipAndSiblingHealthEffects(e, s);
  applySiblingSupportEffects(e, s);
  applySpouseEffects(e, s);
  applyChildEffects(e, s, addMoney);
  applyResidenceEffects(e, routeReserve, s, fromRegion, fundsBeforeEffects, addMoney);
  finishAffiliationPlaces(e, s);
  const resolvedId = TRACE_RESOLUTION?.id;
  applyNeighbourAndWorkplaceEffects(e, s, resolvedId,disclosureOrigin);
  commitEmploymentEffect(s, e, employmentAssessment);
  if (e.employmentAction?.action === "site-incident") applyPlayerEmploymentAction(s, e.employmentAction);
  reconcileEmploymentPosting(s);
  if (currentPlayerEmployment(s)) reconcileWorkContract(s);
  reconcileRelationshipStatusFlags(s);
  recordEffectConsequences(e, s, jobBefore, assetsBefore, debtBefore, investmentBefore, cashBefore);
  reconcileSocialAndInformationEffects(e, s);
  disclosureImpactFromEffect(s,e,disclosureOrigin);
  if (e.d) {
    finalizeLifeLedgerAtDeath(s);
    die(e.d[0], e.d[1]);
  }
}
