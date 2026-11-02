function applySiblingSupportEffects(e, s) {
  if (e.sibParentSupportNotice === 1) {
    const sibling = siblingsOf(s).find(person => person.id === s.eventRelativeId && !person.d);
    if (!sibling || sibling.parentSupportChangeCount <= (sibling.knownParentSupportChangeCount || 0))
      throw new Error("知らせのない親世帯支援情報を既知にできません");
    sibling.knownParentSupportChangeCount = sibling.parentSupportChangeCount;
    sibling.knownParentSupportStatus = sibling.parentSupportStatus || "none";
    sibling.knownParentSupportPaidTotal = sibling.parentSupportPaidTotal || 0;
    sibling.parentSupportKnownYear = s.year;
    sibling.parentSupportNoticeYear = null;
  }
  if (e.sibParentSupportConference === 1) {
    const initiator = siblingsOf(s).find(person => person.id === s.eventRelativeId && !person.d),
      ledger = s.house?.parentLedger,
      participants = siblingsOf(s)
        .filter(person => !person.d && person.id !== initiator?.id && person.contactState !== "ended")
        .map(person => person.id);
    if (initiator && ledger?.status === "tracked" && participants.length) {
      s.siblingParentSupportConference = {
        status: "scheduled",
        initiatorSiblingId: initiator.id,
        participantIds: participants,
        requestedYear: s.year,
        dueYear: s.year + 1,
        outcome: null,
        history: [
          {
            year: s.year,
            state: "scheduled",
            initiatorSiblingId: initiator.id,
            participantIds: participants.slice()
          }
        ]
      };
      L(
        `<span class="nt">ほかのきょうだいに状況を知らせ、${s.year + 1}年に相談する段取りをつけた。実際に集まれるかはまだ分からない。</span>`
      );
    } else throw new Error("きょうだいの親世帯支援相談を予定する条件が揃っていません");
  }
  if (e.sibParentSupportOutcome) {
    const conference = s.siblingParentSupportConference;
    if (
      !conference ||
      conference.status !== "scheduled" ||
      conference.initiatorSiblingId !== s.eventRelativeId
    )
      throw new Error("親世帯支援相談の予定がありません");
    conference.status = "completed";
    conference.outcome = e.sibParentSupportOutcome;
    conference.heldYear = s.year;
    conference.history || (conference.history = []);
    conference.history.push({
      year: s.year,
      state: "completed",
      outcome: e.sibParentSupportOutcome,
      attendeesUnknown: true
    });
    conference.history = conference.history.slice(-12);
  }
  if (e.parentHouseholdGift) {
    const ledger = s.house?.parentLedger,
      house = s.house;
    if (!ledger || ledger.status !== "tracked" || e.parentHouseholdGift < 0)
      throw new Error("親世帯への一時送金に必要な家計記録がありません");
    const amount = Math.max(0, Math.round(
      e.parentHouseholdGift * (ledger.res?.pm || s.res.pm) * (ledger.priceIndex || s.priceIndex || 1)
    ));
    if (amount <= 0 || (s.cash || 0) < amount)
      throw new Error("親世帯へ送る約束の金額を本人資金から用意できません");
    s.cash -= amount;
    const debtPaid = Math.min(Math.max(0, house.debt || 0), amount),
      cashAdded = amount - debtPaid;
    house.debt = Math.max(0, (house.debt || 0) - debtPaid);
    house.cash = (house.cash || 0) + cashAdded;
    house.inc = (house.inc || 0) + amount;
    house.flow || (house.flow = { year: s.year, income: {}, expense: {}, net: 0 });
    house.flow.income || (house.flow.income = {});
    house.flow.income.familyGifts = (house.flow.income.familyGifts || 0) + amount;
    house.flow.net = (house.flow.net || 0) + amount;
    ledger.parentGiftHistory || (ledger.parentGiftHistory = []);
    ledger.parentGiftHistory.push({
      year: s.year,
      amount,
      debtPaid,
      cashAdded,
      source: "主人公",
      eventId: TRACE_RESOLUTION?.id || null
    });
    ledger.parentGiftHistory = ledger.parentGiftHistory.slice(-16);
    const latest = ledger.history?.at(-1);
    if (latest?.year === s.year) {
      latest.income += amount;
      latest.net += amount;
      latest.cash = house.cash;
      latest.debt = house.debt;
      latest.familyGifts = (latest.familyGifts || 0) + amount;
    }
    L(
      `<span class="nt">親世帯へ${m(amount)}を送り、負債 ${m(debtPaid)}・手元資金 ${m(cashAdded)}に反映した。</span>`
    );
  }
  if (e.sibIndependent) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (sibling) {
      sibling.independentSinceYear = s.year;
      sibling.independenceReason = e.sibIndependenceReason || "家族との相談を経て別居";
      sibling.contactState = "regular";
      sibling.lastContactYear = s.year;
      sibling.contactReviewYear = s.year + P("family.siblingContactReviewYears");
      sibling.region = s.res.n;
      sibling.knownRegion = s.res.n;
      sibling.regionKnownYear = s.year;
      sibling.knownMoveCount = 0;
      sibling.moveHistory = [];
      sibling.moveReviewYear =
        s.year + rnd(P("family.siblingMoveReviewMinYears"), P("family.siblingMoveReviewMaxYears"));
      const pool = SIM_TABLES.parentJobs;
      sibling.j = wp(pool).jobId;
      sibling.knownJobId = sibling.j;
      sibling.jobKnownYear = s.year;
      sibling.knownJobChangeCount = 0;
      sibling.jobHistory = [];
      sibling.workReviewYear =
        s.year + rnd(P("family.siblingWorkReviewMinYears"), P("family.siblingWorkReviewMaxYears"));
      sibling.familyHousehold = {
        partner: null,
        children: [],
        history: [],
        reviewYear:
          s.year + rnd(P("family.siblingFamilyReviewMinYears"), P("family.siblingFamilyReviewMaxYears"))
      };
      sibling.knownFamilyPartner = null;
      sibling.knownFamilyChildren = null;
      sibling.knownFamilyYear = null;
      sibling.familyNoticeYear = null;
      sibling.financialCash = 0;
      sibling.financialDebt = 0;
      sibling.financialExpenseTier = Math.max(0, Math.min(EXP.length - 1, s.w?.i ?? 2));
      sibling.financialPriceIndex = s.priceIndex || 1;
      sibling.financialUpdatedYear = s.year;
      sibling.financialAnnualIncome = 0;
      sibling.financialAnnualExpense = 0;
      sibling.financialStatus = "unknown";
      sibling.financialHistory = [];
      sibling.financialTransfers = [];
      const openingReserve = clamp(P("family.siblingIndependenceOpeningReserve"), 0, 4e4);
      sibling.independenceOpeningReserve = openingReserve;
      sibling.independenceOpeningReserveYear = s.year;
      if (openingReserve > 0) {
        sibling.financialCash = openingReserve;
        sibling.financialTransfers.push({
          year: s.year,
          amount: openingReserve,
          cause: "家族からの独立準備資金",
          debtPayment: 0,
          cashAdded: openingReserve
        });
      }
      sibling.knownFinancialStatus = null;
      sibling.financialKnownYear = null;
      sibling.parentNeedKnownStatus = "unknown";
      sibling.parentNeedKnownYear = null;
      sibling.parentNeedReviewYear =
        s.year +
        rnd(P("family.siblingParentNeedReviewMinYears"), P("family.siblingParentNeedReviewMaxYears"));
      sibling.parentNeedHistory = [];
      sibling.parentNeedPending = null;
      sibling.parentSupportStatus = "none";
      sibling.parentSupportDisposition = 0.15 + R() * 0.7;
      sibling.parentSupportReviewYear =
        s.year +
        rnd(P("family.siblingParentSupportReviewMinYears"), P("family.siblingParentSupportReviewMaxYears"));
      sibling.parentSupportPaidTotal = 0;
      sibling.parentSupportChangeCount = 0;
      sibling.parentSupportHistory = [];
      sibling.knownParentSupportChangeCount = 0;
      sibling.knownParentSupportStatus = "none";
      sibling.knownParentSupportPaidTotal = 0;
      sibling.parentSupportKnownYear = null;
      sibling.parentSupportPaidYear = null;
      sibling.parentSupportPaidAmount = 0;
      sibling.parentSupportNoticeYear = null;
    }
  }
  if (e.sibIndependenceDiscussed) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (sibling) sibling.independenceDiscussedYear = s.year;
  }
  if (e.sibIndependent) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (sibling) {
      sibling.health = P("family.siblingHealthInitial");
      sibling.healthUpdatedYear = s.year;
      sibling.knownHealth = sibling.health;
      sibling.healthKnownYear = s.year;
      sibling.healthHistory = [];
    }
  }
  if (e.sibContact) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (sibling) {
      sibling.knownHealth = sibling.health;
      sibling.healthKnownYear = s.year;
      if (sibling.independentSinceYear) {
        sibling.knownFinancialStatus = sibling.financialStatus === "strained" ? "strained" : "stable";
        sibling.financialKnownYear = s.year;
      }
    }
  }
  if (e.sibHealthAid) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (sibling) {
      const before = sibling.health,
        aidAmount = siblingHealthAidCost(s);
      sibling.knownHealth = sibling.health;
      sibling.healthKnownYear = s.year;
      sibling.healthNoticeYear = sibling.healthNoticeYear || s.year;
      sibling.healthHistory || (sibling.healthHistory = []);
      sibling.lastHealthAidYear = s.year;
      sibling.lastHealthAidAmount = aidAmount;
      creditSiblingFinance(sibling, aidAmount, s.year, "一時的な診療・移動援助");
      sibling.aidReceivedTotal = (sibling.aidReceivedTotal || 0) + aidAmount;
      sibling.healthHistory.push({
        year: s.year,
        from: before,
        to: sibling.health,
        amount: aidAmount,
        cause: "診療先への移動費を家族が一時支援（治療結果は未確認）"
      });
      sibling.healthHistory = sibling.healthHistory.slice(-12);
    }
  }
  if (e.sibCareSupport) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (sibling) {
      if (
        e.sibCareSupport === "start" &&
        sibling.independentSinceYear &&
        sibling.inf &&
        !sibling.careSupportAnnual
      ) {
        sibling.careSupportAnnual = P("economy.siblingInfectionSupportAnnualCost");
        sibling.careSupportStartedYear = s.year;
        delete sibling.careSupportEndedYear;
        L(`<span class="nt">${sibling.nm}への年次療養支援を始めた。毎年の支出と家計の余力を見直す。</span>`);
      } else if (e.sibCareSupport === "stop" && sibling.careSupportAnnual > 0) {
        sibling.careSupportAnnual = 0;
        sibling.careSupportEndedYear = s.year;
        L(`<span class="nt">${sibling.nm}への年次療養支援を${s.year}年に終えた。</span>`);
      }
    }
  }
  if (e.sibContact) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (sibling) {
      if ((sibling.jobHistory?.length || 0) > (sibling.knownJobChangeCount || 0)) {
        sibling.knownJobChangeCount = sibling.jobHistory.length;
        sibling.knownJobId = sibling.j;
        sibling.jobKnownYear = s.year;
      }
      if ((sibling.moveHistory?.length || 0) > (sibling.knownMoveCount || 0)) {
        sibling.knownMoveCount = sibling.moveHistory.length;
        sibling.knownRegion = sibling.region;
        sibling.regionKnownYear = s.year;
      }
      if (e.sibContact === "end") {
        sibling.contactState = "ended";
        sibling.contactEndedYear = s.year;
        sibling.contactReopenedYear = null;
        sibling.contactReviewYear = null;
        sibling.reconnectInviteYear = null;
        sibling.reconnectReviewYear =
          s.year +
          rnd(P("family.siblingRecontactReviewMinYears"), P("family.siblingRecontactReviewMaxYears"));
        sibling.contactHistory || (sibling.contactHistory = []);
        sibling.contactHistory.push({ year: s.year, state: "ended" });
      } else if (e.sibContact === "decline") {
        sibling.contactState = "ended";
        sibling.contactEndedYear = s.year;
        sibling.contactReopenedYear = null;
        sibling.contactReviewYear = null;
        sibling.reconnectInviteYear = null;
        sibling.reconnectReviewYear =
          s.year +
          rnd(P("family.siblingRecontactReviewMinYears"), P("family.siblingRecontactReviewMaxYears"));
        sibling.contactHistory || (sibling.contactHistory = []);
        sibling.contactHistory.push({ year: s.year, state: "declined" });
      } else {
        const reopening =
          sibling.contactState === "ended" && (e.sibContact === "reopen" || e.sibContact === "pause");
        sibling.contactState = e.sibContact === "pause" ? "paused" : "regular";
        if (reopening) {
          sibling.contactEndedYear = null;
          sibling.contactReopenedYear = s.year;
          sibling.reconnectInviteYear = null;
          sibling.reconnectReviewYear = null;
          sibling.contactHistory || (sibling.contactHistory = []);
          sibling.contactHistory.push({ year: s.year, state: "reopened" });
        } else if (sibling.reconnectInviteYear) sibling.reconnectInviteYear = null;
        sibling.contactReviewYear =
          s.year + (e.sibContact === "pause" ? 6 : P("family.siblingContactReviewYears"));
        if (e.sibContact !== "pause" || reopening) sibling.lastContactYear = s.year;
      }
      if (e.sibContact === "aid") {
        sibling.lastAidYear = s.year;
        sibling.lastAidAmount = 100000 * s.res.pm * s.priceIndex;
        sibling.aidReceivedTotal = (sibling.aidReceivedTotal || 0) + sibling.lastAidAmount;
        creditSiblingFinance(sibling, sibling.lastAidAmount, s.year, "一時生活援助");
      }
    }
  }
  if (e.sibContact) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d),
      latest = sibling?.contactHistory?.at(-1);
    if (latest?.year === s.year && ["ended", "declined", "reopened"].includes(latest.state))
      latest.initiatedBy = "protagonist";
  }
  if (e.sibContact) {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && !x.d);
    if (sibling) {
      sibling.knownFamilyPartner = !!sibling.familyHousehold?.partner && !sibling.familyHousehold.partner.d;
      sibling.knownFamilyChildren = (sibling.familyHousehold?.children || []).filter(
        child => !child.d
      ).length;
      sibling.knownFamilyYear = s.year;
      sibling.familyNoticeYear = null;
    }
  }
}
