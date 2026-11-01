function applyChildEffects(e, s, addMoney) {
  if (e.kid) {
    const fr = s.sx == "男" ? s.r : s.sp.r,
      mr = s.sx == "男" ? s.sp.r : s.r,
      sex = R() < P("birth.femaleShare") ? "女" : "男";
    s.kids.push({
      id: newRelativeId(s),
      nm: nmUnique_(s, sex, s.res),
      r: pickChildRace([fr, mr], s.res),
      by: s.year,
      otherParentId: s.sp?.id || null
    });
  }
  if (e.kidInf === 1) {
    const child =
      (s.kids || []).find(k => k.id === s.eventRelativeId && !k.d && !k.inf) ||
      childForEvent(s, TRACE_RESOLUTION?.id);
    if (child) {
      child.inf = 1;
      child.infCause = e.kidInfCause || "結晶への接触・環境曝露（詳細未記録）";
      child.infYear = s.year;
      child.careSupport = 0;
      child.careSupportUpdatedYear = s.year;
      child.exposurePending = 0;
      child.exposureReviewYear = null;
    }
  }
  if (e.kidExposurePending === 1) {
    const child =
      (s.kids || []).find(k => k.id === s.eventRelativeId && !k.d && !k.inf) ||
      childForEvent(s, TRACE_RESOLUTION?.id);
    if (child) {
      child.exposurePending = 1;
      child.exposureYear = s.year;
      child.exposureReviewYear = s.year + Math.max(1, Math.round(e.kidExposureReviewDelay || 1));
      child.exposureCause = "源石結晶片による皮膚損傷";
      child.exposureClosedYear = null;
    }
  }
  if (e.kidExposureReviewDelay) {
    const child = (s.kids || []).find(k => k.id === s.eventRelativeId && !k.d && k.exposurePending);
    if (child) child.exposureReviewYear = s.year + Math.max(1, Math.round(e.kidExposureReviewDelay));
  }
  if (e.kidExposureClose === 1) {
    const child = (s.kids || []).find(k => k.id === s.eventRelativeId && !k.d && k.exposurePending);
    if (child) {
      child.exposurePending = 0;
      child.exposureClosedYear = s.year;
      child.exposureReviewYear = null;
    }
  }
  if (e.kidCareSupport === 0 || e.kidCareSupport === 1) {
    const child =
      (s.kids || []).find(k => k.id === s.eventRelativeId && !k.d && k.inf) ||
      childForEvent(s, TRACE_RESOLUTION?.id);
    if (child?.inf) {
      child.careSupport = e.kidCareSupport;
      child.careSupportUpdatedYear = s.year;
    }
  }
  if (e.kidTx === 0 || e.kidTx === 1) {
    const child =
      (s.kids || []).find(k => k.id === s.eventRelativeId && !k.d && k.inf) ||
      childForEvent(s, TRACE_RESOLUTION?.id);
    if (child) {
      child.tx = e.kidTx;
      if (e.kidTx === 1) {
        child.careSupport = 1;
        child.careSupportUpdatedYear = s.year;
      }
    }
  }
  if (e.childPlan) {
    const child = (s.kids || []).find(k => k.id === s.eventRelativeId && !k.d);
    if (child) {
      child.futurePlanYear = s.year;
      child.futurePlan = e.childPlan;
      if (e.childPlan !== "independent" && child.remittanceAnnual > 0) {
        child.remittanceAnnual = 0;
        child.remittanceEndedYear = s.year;
      }
      if (e.childPlan === "study") {
        child.householdStatus = "study";
        child.studyEndYear = s.year + rnd(2, 4);
        child.futurePlanReviewYear = child.studyEndYear;
        child.studyCount = (child.studyCount || 0) + 1;
      } else if (e.childPlan === "working") {
        child.householdStatus = "working";
        const wealthIndex = s.w?.i ?? 2,
          pool = SIM_TABLES.parentJobs.map(p => ({
            ...p,
            w: p.w * (p.jobId <= 2 ? [3, 2, 1, 0.5, 0.2][wealthIndex] : [0.2, 0.5, 1, 2, 4][wealthIndex])
          }));
        child.jobId = wp(pool).jobId;
      } else if (e.childPlan === "independent") {
        child.householdStatus = "independent";
        child.independentSinceYear = s.year;
        child.region = s.res.n;
        child.knownRegion = s.res.n;
        child.regionKnownYear = s.year;
        child.knownJobId = child.jobId ?? null;
        child.jobKnownYear = s.year;
        child.knownMoveCount = 0;
        child.moveHistory = [];
        child.moveReviewYear =
          s.year + rnd(P("family.adultChildMoveReviewMinYears"), P("family.adultChildMoveReviewMaxYears"));
        child.futurePlanReviewYear = null;
      } else {
        child.householdStatus = "supported";
        child.futurePlanReviewYear = s.year + 3;
      }
    }
  }
  if (e.childFutureSupport) {
    const child = (s.kids || []).find(k => k.id === s.eventRelativeId && !k.d),
      { kind, amount = 0 } = e.childFutureSupport;
    if (
      !child ||
      !["study-funds", "work-introduction", "household-open", "move-funds", "revisit"].includes(kind) ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      ((kind === "study-funds" || kind === "move-funds") !== (amount > 0)) ||
      (kind === "study-funds" && amount !== 15e4) ||
      (kind === "move-funds" && amount !== 8e4)
    )
      throw new Error("子どもへの進路支援記録が不正");
    child.futurePlanSupportHistory || (child.futurePlanSupportHistory = []);
    child.futurePlanSupportHistory.push({ year: s.year, kind, amount });
    child.futurePlanSupportHistory = child.futurePlanSupportHistory.slice(-12);
    child.futurePlanYear=s.year;
    child.futurePlanReviewContext=childFutureContext(s,child);
    child.futurePlanReviewYear = s.year + 3;
  }
  if (e.childContact) {
    const child = (s.kids || []).find(k => k.id === s.eventRelativeId && !k.d);
    if (child) {
      if ((child.moveHistory?.length || 0) > (child.knownMoveCount || 0)) {
        child.knownMoveCount = child.moveHistory.length;
        child.knownRegion = child.region;
        child.regionKnownYear = s.year;
        child.knownJobId = child.jobId ?? null;
        child.jobKnownYear = s.year;
      }
      if (e.childContact === "visit") {
        const trip = adultChildVisitRoute(s, child);
        if (!trip || !adultChildVisitAffordable(s, child))
          throw new Error("成人した子への訪問費と生活維持額を家計から払えません");
        const wallet = inSharedHousehold(s) ? s.house || (s.house = { cash: 0, debt: 0, inc: 0, exp: 0 }) : s;
        addMoney(wallet, -trip.fare);
        child.visitHistory || (child.visitHistory = []);
        child.visitHistory.push({
          year: s.year,
          from: trip.from,
          to: trip.to,
          kind: trip.kind,
          fare: trip.fare,
          paidBy: inSharedHousehold(s) ? "household" : "personal"
        });
        child.visitHistory = child.visitHistory.slice(-20);
        child.visitTotal = (child.visitTotal || 0) + trip.fare;
        child.visitCount = (child.visitCount || 0) + 1;
      }
      if (e.childContact === "returnOffer" || e.childReturnRoomSetup) {
        const setupCost = adultChildReturnRoomSetupCost(s);
        if (!adultChildReturnRoomSetupAffordable(s, child))
          throw new Error("成人子を迎える準備費と家計の予備を残せません");
        if (!Number.isFinite(child.returnRoomSetupYear)) {
          const setupWallet = inSharedHousehold(s)
            ? s.house || (s.house = { cash: 0, debt: 0, inc: 0, exp: 0 })
            : s;
          addMoney(setupWallet, -setupCost);
          child.returnRoomSetupYear = s.year;
          child.returnRoomSetupCost = setupCost;
        }
      }
      if (e.childContact !== "pause" && child.budgetHistory?.length) {
        const latest = child.budgetHistory.at(-1);
        child.budgetKnownYear = latest.year;
        child.budgetKnownNet = latest.net;
      }
      if (e.childContact === "aid") {
        const amount = adultChildEmergencyAidCost(s);
        child.aidTransfers || (child.aidTransfers = []);
        child.aidTransfers.push({ year: s.year, amount, cause: "収支不足を聞いた後の一時援助" });
        child.aidTransfers = child.aidTransfers.slice(-12);
        child.aidReceivedTotal = (child.aidReceivedTotal || 0) + amount;
        const currentBudget = (child.budgetHistory || []).find(row => row.year === s.year);
        if (currentBudget) {
          currentBudget.support += amount;
          if (Number.isFinite(currentBudget.net)) currentBudget.net += amount;
        }
      }
      child.contactState = e.childContact === "pause" ? "paused" : "regular";
      child.contactReviewYear =
        s.year + (e.childContact === "pause" ? 5 : e.childContact === "returnOffer" ? 1 : 3);
      if (e.childContact !== "pause") child.lastContactYear = s.year;
      if (e.childContact === "regular" && Number.isFinite(child.returnRequestYear))
        child.contactReviewYear = s.year + 1;
      if (e.childContact === "remit") {
        child.remittanceAnnual = P("economy.childRemittanceAnnualCost");
        child.remittanceStartedYear = s.year;
        delete child.remittanceEndedYear;
      } else if (e.childContact === "stopRemit") {
        child.remittanceAnnual = 0;
        child.remittanceEndedYear = s.year;
      } else if (e.childContact === "returnOffer") {
        child.returnOfferYear = s.year;
      } else if (e.childContact === "declineReturn") {
        child.returnOfferYear = null;
        child.returnRequestYear = null;
      } else if (e.childContact === "return") {
        child.returnOfferYear = null;
        child.returnRequestYear = null;
        child.householdStatus = "supported";
        if (child.inf) {
          child.careSupport = 1;
          child.careSupportUpdatedYear = s.year;
        }
        child.returnedHomeYear = s.year;
        child.region = s.res.n;
        child.knownRegion = s.res.n;
        child.regionKnownYear = s.year;
        child.moveReviewYear = null;
        child.remittanceAnnual = 0;
        child.remittanceEndedYear = child.remittanceStartedYear ? s.year : null;
        child.futurePlanReviewYear = s.year + 3;
      }
    }
  }
  if (e.pd) {
    const parentKey = ["fa", "mo"].find(
        key => s.par?.[key] && !s.par[key].d && s.par[key].id === s.eventRelativeId
      ),
      parent = parentKey ? s.par[parentKey] : null;
    if (parent) {
      const delay = Math.min(
        Math.max(0, Number(s.eventRelativeDelayYears) || 0),
        Math.max(0, s.year - parent.by),
        Math.max(0, s.year - s.by)
      );
      parent.d = s.year - delay;
      parent.deathKnownYear = s.year;
      parent.deathCause = "急な病（詳細未記録）";
      if (parent.tx) {
        parent.tx = 0;
        parent.treatmentEndedYear = parent.d;
        parent.treatmentHistory || (parent.treatmentHistory = []);
        parent.treatmentHistory.push({ year: parent.d, state: "stopped", cause: "死亡により療養終了" });
        parent.treatmentHistory = parent.treatmentHistory.slice(-12);
      }
      if (s.parentUnemploymentTargetKey === parentKey) {
        s.parentUnemploymentTargetKey = null;
        s.fl.parent_unemployed = 0;
      }
    }
    if (s.familyCare && s.par?.[s.familyCare.target]?.d) {
      const cared = s.par[s.familyCare.target];
      recordFamilyCareHistory(s, "period_ended", {
        target: s.familyCare.target,
        plan: s.familyCare.plan,
        treatmentSupport: !!s.familyCare.treatmentSupport,
        treatmentStillActive: false,
        treatmentPaidTotal: s.familyCare.treatmentPaidTotal || 0,
        reason: "介護していた親が亡くなり、付き添いと日々の支援期間が終わった"
      });
      s.familyCare = null;
    }
  }
  if (e.contactDeath) {
    const contact = [s.friendContact, s.neighborContact].find(
      x => x && x.id === s.eventRelativeId && x.lifeStatus !== "dead"
    );
    if (contact) {
      const delay = Math.min(
        Math.max(0, Number(s.eventRelativeDelayYears) || 0),
        Math.max(0, s.year - (contact.metYear ?? s.year))
      );
      contact.lifeStatus = "dead";
      contact.status = "deceased";
      contact.deathYear = s.year - delay;
      contact.deathKnownYear = s.year;
      contact.knownLifeStatus = "dead";
      contact.knownLifeStatusYear = s.year;
      contact.deathCause = e.contactDeathCause || "死因は伝わっていない";
      contact.endedYear = contact.deathYear;
      contact.ending = "死別";
      contact.knownLifeHistory || (contact.knownLifeHistory = []);
      contact.knownLifeHistory.push({
        year: s.year,
        status: "dead",
        deathYear: contact.deathYear,
        channel: "共通の知人からの知らせ"
      });
      contact.knownLifeHistory = contact.knownLifeHistory.slice(-12);
    }
  }
  if (e.childDeath) {
    const child = (s.kids || []).find(x => x.id === s.eventRelativeId && !x.d);
    if (child) {
      child.exposurePending = 0;
      child.exposureReviewYear = null;
      const delay = Math.min(
        Math.max(0, Number(s.eventRelativeDelayYears) || 0),
        Math.max(0, s.year - child.by)
      );
      child.d = s.year - delay;
      child.deathKnownYear = s.year;
      child.deathCause = e.childDeathCause || "知らせに死因の記載なし";
      child.tx = 0;
      child.treatmentEndedYear = child.d;
      child.remittanceAnnual = 0;
      child.contactState = null;
      child.contactReviewYear = null;
      child.returnOfferYear = null;
      child.returnRequestYear = null;
      child.moveReviewYear = null;
    }
  }
}
