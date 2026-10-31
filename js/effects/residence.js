function applyResidenceEffects(e, routeReserve, s, fromRegion, fundsBeforeEffects, addMoney) {
  const spouseAtDeparture=spouseLivesWithProtagonist(s);
  const childrenAtDeparture=s.kids.filter(k=>!k.d && (!s.residenceBase || k.residenceBaseId===s.residenceBase.id)).length;
  const returnKey = e.returnToLocality === "previous" ? previousResidenceKey(s) : e.returnToLocality;
  const returnTarget = returnKey ? s.world?.residences?.[returnKey] : null;
  if (e.returnToLocality) {
    if (!returnTarget || returnKey === localityKey(s) || returnTarget.recordedYear > s.year)
      throw new Error("再訪できる居住記録がありません");
    e = { ...e, res: returnTarget.region !== s.res.n ? 1 : 0, home: returnTarget.home, localKind: returnTarget.local.kind };
  }
  if (e.resTo) {
    if (!REG.some(row => row.n === e.resTo)) throw new Error("転居先の地域が不正");
    e = { ...e, res:e.resTo !== s.res.n ? 1 : 0, home:e.home || s.home };
  }
  if (e.res || e.home || e.returnToLocality) {
    s.residenceBase = returnTarget?.base ? { ...returnTarget.base } : null;
  }
  if (e.res) {
    const from = s.res,
      spouseWasCohabiting = spouseAtDeparture,
      routes = moveDestinations(s).filter(row => (!returnTarget || row.n === returnTarget.region) && (!e.resTo || row.n === e.resTo)),
      affordable = routes.filter(x => x.fare * from.pm + routeReserve <= fundsBeforeEffects),
      pool = e.resFareCovered
        ? routes
        : affordable.length
          ? affordable
          : routes.filter(x => x.fare === Math.min(...routes.map(y => y.fare))),
      route = wp(pool.map(x => ({ w: x.w, route: x }))).route,
      to = REG.find(x => x.n === route.n),
      fromHome = s.home;
    const account = inSharedHousehold(s) ? s.house || (s.house = { cash: 0, debt: 0, inc: 0, exp: 0 }) : s;
    if (!e.resFareCovered) addMoney(account, -route.fare * from.pm);
    s.res = to;
    s.home = normalizeHomeForRegion(
      e.home || chooseHomeForRegion(to.n, R(), P("migration.mobileCityArrivalShare")),
      to.n
    );
    s.local = returnTarget ? { ...returnTarget.local } : makeLocality(s.home, to.n, e.localKind);
    if (e.localCity) {
      if (s.home !== "移動都市" || !SIM_TABLES.namedCities[to.n]?.includes(e.localCity))
        throw new Error("転居先の都市名が地域・居住形態と一致しない");
      s.local.city=e.localCity;
    }
    clearLocalContacts(s);
    s.workPayBonus = 0;
    if (from.n === "クルビア" && to.n !== "クルビア") {
      s.fl.insured = 0;
      s.insurancePaidYear = null;
    }
    s.moves || (s.moves = []);
    s.moves.push({
      year: s.year,
      from: from.n,
      to: to.n,
      fromHome,
      toHome: s.home,
      routeFare: route.fare * from.pm,
      fareCovered: !!e.resFareCovered,
      householdSize: 1 + (spouseWasCohabiting ? 1 : 0) + childrenAtDeparture
    });
    if (
      s.sp &&
      spouseWasCohabiting &&
      !(s.sp.residenceMoveNotice && !Number.isInteger(s.sp.residenceMoveNotice.deliveredYear))
    ) {
      const spouse = s.sp,
        spouseFrom = REG.some(region => region.n === spouse.residenceRegion)
          ? spouse.residenceRegion
          : from.n;
      spouse.residenceRegion = to.n;
      spouse.knownResidenceRegion = to.n;
      spouse.residenceKnownYear = s.year;
      spouse.residenceMovePending = {
        year: s.year,
        from: spouseFrom,
        to: to.n,
        moveIndex: s.moves.length - 1
      };
    }
  } else if (e.home) {
    const fromHome = s.home;
    s.home = normalizeHomeForRegion(e.home, s.res.n);
    s.local = returnTarget ? { ...returnTarget.local } : makeLocality(s.home, s.res.n, e.localKind);
    clearLocalContacts(s);
    if (e.localCity) {
      if (s.home !== "移動都市" || !SIM_TABLES.namedCities[s.res.n]?.includes(e.localCity))
        throw new Error("転居先の都市名が地域・居住形態と一致しない");
      s.local.city = e.localCity;
    }
    s.moves || (s.moves = []);
    s.moves.push({
      year: s.year,
      from: s.res.n,
      to: s.res.n,
      fromHome,
      toHome: s.home,
      routeFare: 0,
      local: true,
      householdSize: 1 + (spouseAtDeparture ? 1 : 0) + childrenAtDeparture
    });
  }
  if (["follow", "stay"].includes(e.spouseResidenceAction) && s.sp?.residenceMovePending) {
    const spouse = s.sp,
      pending = spouse.residenceMovePending,
      move = s.moves?.[pending.moveIndex],
      spouseWasCountedInThisMove = pending.from === move?.from;
    spouse.residenceRegion = e.spouseResidenceAction === "stay" ? pending.from : pending.to;
    spouse.knownResidenceRegion = spouse.residenceRegion;
    spouse.residenceKnownYear = s.year;
    spouse.sharesHousehold = e.spouseResidenceAction === "follow";
    spouse.residenceHistory || (spouse.residenceHistory = []);
    spouse.residenceHistory.push({
      year: s.year,
      from: pending.from,
      to: spouse.residenceRegion,
      decision: e.spouseResidenceAction
    });
    spouse.residenceHistory = spouse.residenceHistory.slice(-16);
    if (
      move &&
      e.spouseResidenceAction === "stay" &&
      spouseWasCountedInThisMove &&
      pending.from !== pending.to
    )
      move.householdSize = Math.max(1, move.householdSize - 1);
    if (move && e.spouseResidenceAction === "follow" && !spouseWasCountedInThisMove) move.householdSize += 1;
    if (e.spouseResidenceAction === "stay") spouse.separateLifeReviewYear = s.year + 1;
    else {
      spouse.separateLifeReviewPending = false;
      spouse.separateLifeReviewYear =
        s.year + rnd(P("family.spouseSeparateReviewMinYears"), P("family.spouseSeparateReviewMaxYears"));
    }
    spouse.residenceMovePending = null;
  }
  if (e.fl) {
    const hobbyWasActive = Object.fromEntries(Object.keys(HOBBY_META).map(key => [key, !!s.fl?.[key]]));
    if (e.fl.reduced_work === 1 && !s.fl.reduced_work) s.reducedWorkStartedYear = s.year;
    else if (e.fl.reduced_work === 0) s.reducedWorkStartedYear = null;
    const entering = (e.fl.detained === 1 && !s.fl.detained) || (e.fl.segregated === 1 && !s.fl.segregated);
    for (const key of [
      "hobby_music",
      "hobby_craft",
      "hobby_garden",
      "hobby_sport",
      "hobby_collect",
      "hobby_story"
    ]) {
      if (e.fl[key] === 1 && s.hobbyModes?.[key]) delete s.hobbyModes[key];
      if (e.fl[key] === 0 && s.fl?.[key]) {
        s.hobbyModes || (s.hobbyModes = {});
        delete s.hobbyModes[key];
        s.hobbyModeHistory || (s.hobbyModeHistory = []);
        s.hobbyModeHistory.push({
          year: s.year,
          key,
          mode: "paused",
          eventId: TRACE_RESOLUTION?.id || null,
          choice: TRACE_RESOLUTION?.label || null
        });
        s.hobbyModeHistory = s.hobbyModeHistory.slice(-24);
      }
    }
    if (e.fl.parent_unemployed === 1 && !s.fl.parent_unemployed) {
      const candidates = (s.care?.parentKeys || ["fa", "mo"]).filter(key => s.par?.[key] && !s.par[key].d);
      s.parentUnemploymentTargetKey = candidates.length ? pick(candidates) : null;
    }
    Object.assign(s.fl, e.fl);
    for (const key of Object.keys(HOBBY_META)) {
      if (e.fl[key] === 1 && !hobbyWasActive[key])
        applyHobbyJourney(
          key,
          S.lifeRecord?.hobbies?.some(row => row.id === key) ? "resume" : "start",
          "趣味を始めた、または再開した"
        );
      else if (e.fl[key] === 0 && hobbyWasActive[key])
        applyHobbyJourney(key, "pause", "家計または生活上の事情で休止");
    }
    if (e.fl.parent_unemployed === 0) s.parentUnemploymentTargetKey = null;
    if (e.fl.household_separated === 1) beginSeparatedParentLedger(s);
    if (e.fl.detained === 1) {
      s.fl.segregated = 0;
      s.fl.seg_work = 0;
      if (entering) s.fl.custody_contact = 0;
    } else if (e.fl.segregated === 1) s.fl.detained = 0;
    if (entering) {
      s.job = 0;
      s.workPayBonus = 0;
      s.f = 0;
      if (e.fl.detained === 1 && s.fl.tx) {
        s.fl.tx = 0;
        L('<span class="bad">収容のため、これまで通っていた診療と薬の受け取りを続けられなくなった。</span>');
      }
      if (s.study) {
        s.study.suspended = true;
        s.study.nextDue = Math.max(s.study.nextDue, s.year + 1);
      }
    }
    if (!s.fl.segregated) s.fl.seg_work = 0;
    if (!restricted(s)) s.fl.pet_care_outsourced = 0;
    if (e.fl.seg_work === 1) s.fl.retired = 0;
    if (e.fl.retired === 1) { s.workPayBonus = 0; s.fl.workplace_hazard = 0; }
    if (e.fl.exiled === 1) s.exileFrom = fromRegion;
    if (e.fl.pet_companion === 0) s.pet = null;
    if (e.fl.pet_companion === 0) {
      s.petSinceYear = null;
      s.petCareUntil = null;
      s.fl.pet_care_extended = 0;
    }
    if (e.fl.pet_care_extended === 1) {
      if (!s.pet || !Number.isFinite(s.petCareUntil))
        throw new Error("飼育動物の終末期治療に必要な状態がない");
      s.petCareUntil += P("economy.petLifeReviewExtensionYears");
    }
    if (e.fl.insured === 1) s.insurancePaidYear = s.year;
    if (e.fl.insured === 0) s.insurancePaidYear = null;
  }
  if (e.res || e.home || e.returnToLocality) {
    if (s.fl?.infection_community_rumor_current_area) s.fl.infection_community_rumor_current_area = 0;
    if (s.fl?.infection_housing_rumor_current_home) s.fl.infection_housing_rumor_current_home = 0;
  }
}
