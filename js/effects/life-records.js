function shouldApplyLifeAffiliation(input) {
  if (!input.onlyIfActive && !input.onlyIfActiveOrCrisis && !input.onlyIfMember && !input.onlyIfContacted) return true;
  const status = S.lifeRecord?.affiliations?.find(item => item.id === input.id)?.status;
  if (input.onlyIfContacted) return status === "contacted";
  if (input.onlyIfMember) return ["active", "crisis", "suspended"].includes(status);
  return input.onlyIfActiveOrCrisis ? ["active", "crisis"].includes(status) : status === "active";
}
function recordPersonalWishes(s,input) {
  const year=s.year, source=TRACE_RESOLUTION?.id || null;
  if(input?.kind!=="written") {
    s.personalWishes={
      version:1,status:"not-written",year,sourceEventId:source,
      recipientId:null,recipientName:null,content:null,afterDeathStatus:null,
      history:[{year,kind:"not-written"}]
    };
    return;
  }
  const child=(s.kids||[]).find(item=>item.id===s.eventRelativeId && !item.d);
  if(!child || s.year-child.by<18)throw new Error("成人した子へ希望を残す対象を確認できません");
  s.personalWishes={
    version:1,status:"written",year,sourceEventId:source,
    recipientId:child.id,recipientName:child.nm||child.name||"名前未記録",
    content:String(input.content||"家族で品の扱いを相談する"),
    afterDeathStatus:null,
    history:[{year,kind:"written",recipientId:child.id}]
  };
}
function finalizePersonalWishesAtDeath(s) {
  const wishes=s.personalWishes;
  if(!wishes || wishes.status!=="written" || wishes.afterDeathStatus)return;
  wishes.afterDeathStatus="unverified";
  wishes.deathYear=s.year;
  wishes.history || (wishes.history=[]);
  wishes.history.push({year:s.year,kind:"death-recorded",execution:"unverified"});
  wishes.history=wishes.history.slice(-12);
}
function applyLifeRecordEffects(e, s) {
  if (e.languageAction) applyLanguageAction(s, e.languageAction);
  if (e.identityAction) identityAction(s, e.identityAction);
  if (e.personalWishes) recordPersonalWishes(s,e.personalWishes);
  if (e.socialConflictAction) socialConflictAction(s, e.socialConflictAction);
  if (e.bodyChange) applyBodyChange(e.bodyChange);
  if (e.bodyChanges) e.bodyChanges.forEach(applyBodyChange);
  if (e.lifeGoal) applyLifeGoal(e.lifeGoal);
  if (e.lifeGoals)
    e.lifeGoals.forEach(input => {
      const goal = S.lifeRecord?.goals?.find(item => item.id === input.id);
      const member = input.onlyIfAffiliation &&
        S.lifeRecord?.affiliations?.find(item => item.id === input.onlyIfAffiliation);
      if (
        (!input.onlyIfAffiliation || ["active", "crisis", "suspended"].includes(member?.status)) &&
        (!input.onlyIfUnresolved || (goal && ["active", "compromised", "paused"].includes(goal.status))) &&
        (!input.onlyIfActive || (goal && ["active", "compromised"].includes(goal.status)))
      )
        applyLifeGoal(input);
    });
  if (e.lifeSkill) applyLifeSkill(e.lifeSkill);
  if (e.lifeWorkRelationship) applyLifeWorkRelationship(e.lifeWorkRelationship);
  if (e.lifeAffiliation && shouldApplyLifeAffiliation(e.lifeAffiliation))
    applyLifeAffiliation(e.lifeAffiliation);
  if (e.lifeAffiliations)
    e.lifeAffiliations.forEach(input => {
      if (shouldApplyLifeAffiliation(input)) applyLifeAffiliation(input);
    });
  if (e.lifeOrganization) applyLifeOrganization(e.lifeOrganization);
  if (e.lifeOrganizations) e.lifeOrganizations.forEach(applyLifeOrganization);
  if (e.groupStanding) applyGroupStanding(e.groupStanding);
  if (e.groupStandings) e.groupStandings.forEach(applyGroupStanding);
  if (e.regionalImpact) applyRegionalImpact(e.regionalImpact);
  if (e.siracusaFamilyAction) {
    const input = e.siracusaFamilyAction;
    const action = typeof input === "string" ? input : input.action;
    const member = s.lifeRecord?.affiliations?.find(item => item.id === "siracusa-familia");
    if (!input.onlyIfMember || ["active", "crisis", "suspended"].includes(member?.status))
      recordSiracusaFamilyAction(
        s,
        action,
        TRACE_RESOLUTION?.id,
        TRACE_RESOLUTION?.label || e.label
      );
  }
  if (e.siracusaFamilyDuty)
    recordSiracusaFamilyDuty(
      s,
      e.siracusaFamilyDuty,
      TRACE_RESOLUTION?.id,
      TRACE_RESOLUTION?.label || e.label
    );
  if (e.hobbyMode) {
    const key = s.eventHobbyKey;
    if (!key || !s.fl?.[key]) throw new Error("趣味の費用形態を変更する対象がありません");
    if (!["reduced", "shared", "paused"].includes(e.hobbyMode)) throw new Error("趣味の費用形態が不正");
    s.hobbyModes || (s.hobbyModes = {});
    if (e.hobbyMode === "paused") {
      s.fl[key] = 0;
      delete s.hobbyModes[key];
      applyHobbyJourney(key, "pause", "費用を抑えるため休止");
    } else s.hobbyModes[key] = e.hobbyMode;
    s.hobbyModeHistory || (s.hobbyModeHistory = []);
    s.hobbyModeHistory.push({
      year: s.year,
      key,
      mode: e.hobbyMode,
      eventId: TRACE_RESOLUTION?.id || null,
      choice: TRACE_RESOLUTION?.label || null
    });
    s.hobbyModeHistory = s.hobbyModeHistory.slice(-24);
  }
  if (e.formerSpouseDeathNotice === 1) recordFormerSpouseDeathNotice(s, s.eventRelativeId);
  if (e.formerSpouseMoveNotice === 1) recordFormerSpouseMoveNotice(s, s.eventRelativeId);
  if (e.sibDeathNotice === 1) confirmSiblingDeathNotice(s, s.eventRelativeId);
}
