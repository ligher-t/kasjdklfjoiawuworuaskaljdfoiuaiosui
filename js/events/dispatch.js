function isLocationInCrisis(state = S) {
  if (!state || !state.world?.events || typeof HIST === "undefined") return false;
  return HIST.some(h => {
    if (!h.isCrisis || !state.world.events[h.flag]) return false;
    const activeYear = state.world.events[h.flag];
    if (h.flag === "londinium_war") {
      if (state.year !== 1098) return false;
    } else if (h.flag === "chernobog_incident") {
      if (state.year < 1096 || state.year > 1097) return false;
    } else if (h.flag === "bolivar_civil_war") {
      if (state.year < 1048 || state.year > 1052) return false;
    } else if (h.flag === "kazdel_civil_war") {
      if (state.year < 1086 || state.year > 1094) return false;
    } else if (h.flag === "thelazia_dead") {
      if (state.year < 1094 || state.year > 1097) return false;
    } else {
      if (state.year !== activeYear) return false;
    }
    // A regional disruption may shape everyday life even when the resident
    // did not witness the event at its specific battlefield or institution.
    return historicalPlaceScope(h, state).affected;
  });
}
function isPeacefulLeisureEvent(event) {
  // The event's meaning is explicit: a report mentioning tourism or a
  // battlefield relief meal must not be rejected by matching prose fragments.
  return event?.crisisPolicy === "nonessential-leisure";
}
// Dates only: never relax eligibility, select random relatives, or mutate state here.
function scheduledFollowupDueYear(event,s) {
  let due=null;
  if(event.id==="family_child_exposure_followup")
    due=childForEvent(s,event.id)?.exposureReviewYear;
  else if(event.id==="family_care_network_contact")
    due=s.care?.supportNetwork?.contactReviewYear;
  else if(event.id==="family_sibling_parent_support_conference")
    due=s.siblingParentSupportConference?.dueYear;
  else if(event.id==="infection_workplace_review")
    due=s.infectionWorkplace?.reviewDueYear;
  else if(event.id==="sr_rhodes_hiring_review") {
    const contact = s.lifeRecord?.affiliations?.find(a => a.id === "rhodes-employment");
    const previous = contact?.lastContactYear ?? s.sn?.sr_rhodes_recruitment_contact;
    if(Number.isInteger(previous)) due = previous + 1;
  } else if(event.id==="sr_rhodes_base_assignment" || event.id==="sr_rhodes_posting_review") {
    const staff = s.lifeRecord?.affiliations?.find(a => a.id === "rhodes-staff");
    const previous = staff?.episodes?.at(-1)?.startedYear ?? s.sn?.sr_rhodes_hiring_review;
    if(Number.isInteger(previous)) due = previous + 1;
  } else if (event.id === "romance_followup") {
    const previous = s.sn?.lov;
    if (Number.isInteger(previous) && s.romance?.stage === "known") due = previous + 1;
  } else if (event.id === "romance_future_talk") {
    const previous = s.sn?.romance_followup;
    if (Number.isInteger(previous) && (s.romance?.stage === "dating" || s.romance?.stage === "committed")) due = previous + 1;
  } else if (event.id === "romance_marriage_choice") {
    const previous = s.sn?.romance_future_talk;
    if (Number.isInteger(previous) && s.romance?.stage === "committed") due = previous + 1;
  } else if (event.id === "romance_cohabitation_review") {
    const previous = s.sn?.romance_marriage_choice;
    if (Number.isInteger(previous) && s.romance?.stage === "cohabiting") due = previous + 1;
  } else if(["earth_discr_school_later","life_ursus_school_aid_followup",
           "life_ursus_school_aid_adult_followup","life_ursus_school_aid_later"].includes(event.id)) {
    const previous=s.sn?.[event.after?.id];
    if(Number.isInteger(previous))due=previous+(event.after.min||0);
  }
  return Number.isInteger(due) && due<=s.year ? due : null;
}
function nextScheduledFollowup(events,s) {
  return events.map(event=>({event,due:scheduledFollowupDueYear(event,s)}))
    .filter(row=>row.due!==null)
    .sort((a,b)=>a.due-b.due)[0]?.event || null;
}
// Eligible choices can cease to exist after an after.max window, age cap,
// or calendar-year cap. Protect their final year without bypassing eligibility
// or reserving a slot for a choice the player cannot actually select.
function nextExpiringFollowup(events,s) {
  return events.map(event => {
    const prior=s.sn?.[event.after?.id], max=event.after?.max,
      ageMax=event.le?.age, yearMax=event.le?.year,
      deadlines=[];
    if(Number.isInteger(prior) && Number.isInteger(max) && max>=0)
      deadlines.push(prior+max);
    if(Number.isFinite(ageMax) && Number.isFinite(s.age))
      deadlines.push(s.year+Math.floor(ageMax-s.age));
    if(Number.isInteger(yearMax)) deadlines.push(yearMax);
    if(!deadlines.length || Math.min(...deadlines)!==s.year) return null;
    return {event,due:Number.isInteger(prior) ? prior+(event.after.min||0) : s.year};
  }).filter(Boolean)
    .sort((a,b)=>a.due-b.due || a.event.id.localeCompare(b.event.id))[0]?.event || null;
}
function sched() {
  const range = S.age < P("events.childSlotAgeLimit") ? P("events.childSlots") : P("events.adultSlots"),
    n = rnd(range[0], range[1]),
    ceiling = P("events.slotPlacementCeiling"),
    months = Array.from({length: Math.ceil(ceiling * CALENDAR_MONTHS)}, (_, i) => i);
  // A second draw in the same calendar month cannot offer another major
  // choice. Preserve the annual slot count, but give each slot its own month.
  S.q = Array.from({length: Math.min(n, months.length)}, () => {
    const index = Math.floor(R() * months.length),
      month = months.splice(index, 1)[0],
      upper = Math.min(ceiling * CALENDAR_MONTHS, month + 1);
    return (month + R() * (upper - month)) / CALENDAR_MONTHS;
  }).sort((a, b) => a - b);
}
// Add only the missing opportunities for choices which will permanently
// expire this year. Never exceed the last available calendar month or change
// the number of regular life events in an otherwise unpressured year.
function reserveExpiringSlots(s, expiringChoices) {
  if (!Array.isArray(s.q) || !expiringChoices.length) return;
  const future = new Set(s.q.map(q => Math.floor(q * CALENDAR_MONTHS) + 1).filter(month => month > s.mo)),
    ceiling = P("events.slotPlacementCeiling");
  let missing = expiringChoices.length - 1 - future.size;
  if (missing <= 0) return;
  for (let month = s.mo + 1; month <= CALENDAR_MONTHS && missing > 0; month++) {
    const position = (month - 0.5) / CALENDAR_MONTHS;
    if (future.has(month) || position >= ceiling) continue;
    s.q.push(position);
    future.add(month);
    missing--;
  }
  s.q.sort((a,b) => a-b);
}
const SIMULATION_ELIGIBILITY_OPTIONS = { onReject: (...args) => recordSimulationEligibilityRejection(...args) };
function simulationChoiceStates(event, s, T) {
  const who = typeof event.who === "function" ? event.who(s) : event.who || (stg(s) <= 1 ? "parent" : "self");
  return event.c.map((choice, index) => {
    const shown = ok(choice.show, s, T),
      gateEnabled = shown && ok(choice.en, s, T),
      ethicalBlocked = gateEnabled && ethicalLock(event, choice, s, who);
    return { c: choice, index, shown, gateEnabled, enabled: gateEnabled && !ethicalBlocked, ethicalBlocked };
  });
}
function slot(x) {
  const s = S;
  if (!s || s.dead) {
    if (HL) STAT.postDeathSlotAttempts++;
    return;
  }
  s.mo = Math.floor(x * CALENDAR_MONTHS) + 1;
  ensureLocalityState(s);
  educationReconcileWorldAt(s,s.year,s.mo);
  activateHistoricalWorldEvents(s);
  releasePendingHistoricalNews(s);
  reconcileCareerPlacements(s);
  const T = tags(s),
    choiceAlreadyUsed = s.majorEventMonth?.year === s.year && s.majorEventMonth?.month === s.mo,
    eligible = EV.filter(e => HL ? elig(e, s, T, SIMULATION_ELIGIBILITY_OPTIONS) : elig(e, s, T)),
    choiceStates = new Map();
  if (HL) for (const event of eligible) if (event.c) {
    const states = simulationChoiceStates(event, s, T);
    choiceStates.set(event, states);
    recordSimulationChoiceAvailability(event, states);
  }
  const hasActionableChoice = event =>
    (choiceStates.get(event) || simulationChoiceStates(event, s, T)).some(row => row.enabled);
  if (HL && choiceAlreadyUsed) for (const event of eligible) if (event.c) {
    const row = STAT.eventCoverage[event.id];
    if (row) row.monthlyChoiceBlocked++;
  }
  const el = eligible.filter(e => (!e.c || hasActionableChoice(e)) && !(choiceAlreadyUsed && e.c)),
    mj = el.filter(e => e.c);
  if (HL) {
    recordSimulationSlot(STG[stg(s)] || "不明", eligible, el);
    for (const candidate of el) STAT.op[candidate.id] = (STAT.op[candidate.id] || 0) + 1;
  }
  // Unresolved schooling decisions outrank optional random events.
  const requiredSchool = s.educationDecision?.kind === "primary" ? "sch" :
    s.educationDecision?.kind === "upper-path" ? "education_upper_path" :
    s.educationDecision?.kind === "higher-path" ? "higher_ed" :
    s.educationDecision?.kind === "transfer" ? "education_transfer_review" :
    ["funding","resume"].includes(s.educationDecision?.kind) ? "education_funding_review" :
    s.educationDecision?.kind === "graduation" ? "education_graduation_review" : null;
  const institutional=!!institutionalInfectionAudience(s) &&
    mj.find(event=>event.id==='urs_sweep' || event.id==='lei_isolation');
  // An already-due diagnosis or exposure review must not disappear behind a
  // newly active historical choice in the same month's event slots.
  const medicalReview = nextScheduledFollowup(
    mj.filter(event => ["infection_workplace_review", "family_child_exposure_followup"].includes(event.id)), s
  );
  const expiringChoices = mj.filter(event => nextExpiringFollowup([event],s) === event);
  const expiringFollowup = nextExpiringFollowup(expiringChoices,s);
  const schoolReview = requiredSchool ? mj.find(event => event.id === requiredSchool) : null;
  // Schooling and due medical reviews also consume the year's major-choice
  // capacity. Count them once if they are themselves expiring.
  const protectedChoices = [...new Set([
    ...expiringChoices, ...(medicalReview ? [medicalReview] : []),
    ...(schoolReview ? [schoolReview] : [])
  ])];
  reserveExpiringSlots(s, protectedChoices);
  if (HL) recordSimulationExpiringChoices(s, expiringChoices);
  const localTimelineChoice = mj.find(event =>
    event.timelineFlag &&
    s.world?.events?.[event.timelineFlag] &&
    !s.sn?.[event.id] &&
    hasActionableChoice(event)
  );
  let e = schoolReview ||
    medicalReview ||
    expiringFollowup ||
    localTimelineChoice ||
    nextScheduledFollowup(mj,s) || wpk(mj.filter(event => event.pri), s, T) || institutional || (R() < MAJ_PER_SLOT ? wpk(mj, s, T) : null);
  if (!e) {
    const inCrisis = isLocationInCrisis(s);
    const r = R(),
      neutral = P("events.dailyNeutralToneShare"),
      g = r < neutral ? "" : r < neutral + P("events.dailyPositiveToneShare") ? "gd" : "bad",
      fl = el.filter(e => !e.c && (!inCrisis || !isPeacefulLeisureEvent(e))),
      pl = fl.filter(e => tone(e.fx) === g);
    const timelineDailies = inCrisis ? fl.filter(event => event.timelineFlag && s.world?.events?.[event.timelineFlag]) : [];
    const pool = (timelineDailies.length && R() < 0.6) ? timelineDailies : (pl.length ? pl : fl),
      contextual = pool.filter(event => contextualDailyEvent(event, s, T)),
      contextualTone = contextual.filter(event => tone(event.fx) === g);
    e = wpk(contextual.length && R() < 0.7 ? (contextualTone.length ? contextualTone : contextual) : pool, s, T);
  }
  if (e) fire(e, s, T);
}
function fire(e, s, T) {
  if (!s || s.dead) {
    if (HL) STAT.postDeathFireAttempts++;
    return;
  }
  if (HL) STAT.currentEventId = e?.id || null;
  // A dated scene records a witnessed encounter only when it actually
  // appears in the city to which the historical scene is grounded.
  if (e?.timelineFlag) {
    const historicalEntry = HIST.find(row => row.flag === e.timelineFlag);
    if (historicalEntry) recordHistoricalDirectEncounter(historicalEntry, s, e.id);
  }
  recordSimulationEvent(e, s);
  s.eventCareNetworkMemberId = null;
  s.eventCareSiblingId = null;
  if (e.id === "wld_friend" || e.id === "wld_friend_repay") ensureSocialContact(s, "friend");
  if (["neighbor_move", "neighbor_followup", "life_neighbor_mutual_aid"].includes(e.id))
    ensureSocialContact(s, "neighbor");
  s.eventRelativeId = e.id?.startsWith("family_sibling_")
    ? siblingForEvent(s, e.id)?.id || null
    : e.id === "family_spouse_death" ||
        e.id === "family_spouse_migration_choice" ||
        e.id === "family_spouse_separate_life" ||
        e.id === "family_spouse_independent_move_notice"
      ? s.sp?.id || null
      : null;
  if (e.id === "family_daily_small_care") s.eventRelativeId = familyDailyTarget(s)?.person?.id || null;
  if (e.id === "life_hobby_budget")
    s.eventHobbyKey =
      ["hobby_music", "hobby_garden", "hobby_craft", "hobby_sport", "hobby_collect", "hobby_story"].find(
        key => s.fl?.[key]
      ) || null;
  if (e.id === "family_divorce_parenting_review")
    s.eventRelativeId = formerSpouseParentingTarget(s)?.id || null;
  if (e.id === "family_divorce_child_residence") s.eventRelativeId = childResidencePlanTarget(s)?.id || null;
  if (e.id === "family_former_spouse_death_notice")
    s.eventRelativeId = formerSpouseDeathNoticeTarget(s)?.id || null;
  if (e.id === "family_former_spouse_move_notice")
    s.eventRelativeId = formerSpouseMoveNoticeTarget(s)?.id || null;
  if (e.id === "fam_care") {
    const parent = [s.par.fa, s.par.mo]
      .filter(
        p =>
          p &&
          !p.d &&
          (p.health <= P("family.parentCareNeedThreshold") ||
            (p.inf && p.health <= P("family.parentCareNeedInfectedThreshold")))
      )
      .sort((a, b) => a.health - b.health)[0];
    s.eventRelativeId = parent?.id || null;
  }
  if (e.id === "fam_care_capacity_review") s.eventRelativeId = s.par?.[s.familyCare?.target]?.id || null;
  if (e.id === "fam_care_followup") {
    const ended = (s.familyCareHistory || [])
        .slice()
        .reverse()
        .find(row => row.type === "period_ended"),
      parent = [s.par?.fa, s.par?.mo].find(person => person && !person.d && person.id === ended?.targetId);
    s.eventRelativeId = parent?.id || null;
    s.eventCareSiblingId =
      familyCareCostShareSiblingCandidates(s)
        .slice()
        .sort(
          (a, b) =>
            (b.financialKnownYear || 0) - (a.financialKnownYear || 0) ||
            String(a.id).localeCompare(String(b.id))
        )[0]?.id || null;
  }
  if (e.id === "parent_treatment_review") {
    const parent = [s.par?.fa, s.par?.mo].find(
      person => person && !person.d && person.id === s.house?.parentLedger?.treatmentReviewDue?.parentId
    );
    s.eventRelativeId = parent?.id || null;
  }
  if (e.id === "parent_work_news") s.eventRelativeId = parentJobNewsTarget(s)?.id || null;
  if (e.id === "fam_infected") {
    const parent = (s.care.parentKeys || ["fa", "mo"])
      .map(key => s.par?.[key])
      .find(p => p && !p.d && p.inf && !p.infectionKnown);
    s.eventRelativeId = parent?.id || null;
  }
  if (
    [
      "fam_child_inf",
      "fam_child_care",
      "family_child_crystal_exposure",
      "family_child_exposure_followup",
      "family_child_bereavement",
      "family_child_future",
      "adult_child_contact",
      "adult_child_memory",
      "life_personal_wishes"
    ].includes(e.id)
  )
    s.eventRelativeId = childForEvent(s, e.id)?.id || null;
  if (
    e.id === "friend_death_notice" ||
    e.id.startsWith("friend_missing_") ||
    e.id.startsWith("friend_found_") ||
    e.id.startsWith("friend_recontact_")
  )
    s.eventRelativeId = s.friendContact?.id || null;
  else if (
    e.id === "neighbor_death_notice" ||
    e.id.startsWith("neighbor_missing_") ||
    e.id.startsWith("neighbor_found_") ||
    e.id.startsWith("neighbor_recontact_")
  )
    s.eventRelativeId = s.neighborContact?.id || null;
  if (
    ["friend_missing_news", "friend_found_news", "neighbor_missing_news", "neighbor_found_news"].includes(
      e.id
    )
  ) {
    const person = e.id.startsWith("friend_") ? s.friendContact : s.neighborContact,
      key = e.id.includes("missing") ? "pendingMissingNotices" : "pendingFoundNotices";
    s.eventRelativeId = person?.id || null;
  }
  if (e.id === "family_sibling_bereavement") {
    const sibling = siblingsOf(s).find(x => x.id === s.eventRelativeId && x.d && x.deathNoticePending);
    s.eventRelativeDelayYears = sibling ? Math.max(0, s.year - sibling.d) : 0;
  }
  if (e.id === "family_spouse_death" && s.sp?.id === s.eventRelativeId) {
    s.eventRelativeDelayYears = Math.max(0, s.year - (s.sp?.deathYear || s.year));
  }
  if (["friend_death_notice", "neighbor_death_notice"].includes(e.id)) {
    const contact = e.id === "friend_death_notice" ? s.friendContact : s.neighborContact;
    if (contact?.id === s.eventRelativeId)
      s.eventRelativeDelayYears = rnd(
        0,
        Math.min(P("family.deathNoticeDelayMaxYears"), Math.max(0, s.year - (contact.metYear ?? s.year)))
      );
  }
  if (e.id === "family_child_bereavement") {
    const child = s.kids.find(x => x.id === s.eventRelativeId);
    s.eventRelativeDelayYears =
      child && !childIsSupported(s, child) && s.year - child.by >= 18
        ? rnd(0, Math.min(P("family.deathNoticeDelayMaxYears"), s.year - child.by))
        : 0;
  }
  if (
    [
      "family_care_network_member_move_news",
      "family_care_network_member_death_notice",
      "family_care_network_member_missing_news",
      "family_care_network_member_found_news"
    ].includes(e.id)
  ) {
    const noticeKey = {
        family_care_network_member_move_news: "pendingMoveNotices",
        family_care_network_member_death_notice: "pendingDeathNotices",
        family_care_network_member_missing_news: "pendingMissingNotices",
        family_care_network_member_found_news: "pendingFoundNotices"
      }[e.id],
      eligibleMembers = (s.care?.supportNetwork?.members || [])
        .filter(person =>
          (person[noticeKey] || []).some(
            message => Number.isFinite(message.availableYear) && message.availableYear <= s.year
          )
        )
        .sort(
          (a, b) =>
            a[noticeKey].find(message => message.availableYear <= s.year).availableYear -
              b[noticeKey].find(message => message.availableYear <= s.year).availableYear ||
            a.id.localeCompare(b.id)
        );
    s.eventCareNetworkMemberId = eligibleMembers[0]?.id || null;
  }
  if (e.id === "par_death") {
    const parent = pick([s.par.fa, s.par.mo].filter(x => x && !x.d));
    s.eventRelativeId = parent?.id || null;
    if (parent) {
      const age = Math.max(0, s.year - parent.by),
        livedSinceBirth = Math.max(0, s.year - s.by);
      s.eventRelativeDelayYears = rnd(
        0,
        Math.min(P("family.deathNoticeDelayMaxYears"), age, livedSinceBirth)
      );
    }
  }
  const relativeId = s.eventRelativeId;
  const t = txt(e, s, T);
  const before = HL && !CAPTURE_TRACE ? null : traceState(s);
  if (e.c) return ask(e, T, t, before);
  s.sn[e.id] = s.year;
  if (HL) {
    const k = STG[stg(s)],
      d = STAT.ev[e.id] || (STAT.ev[e.id] = {});
    d[k] = (d[k] || 0) + 1;
  }
  L(`<span class="${tone(e.fx)}">${t}</span>`);
  cnt(tone(e.fx));
  const previousResolution = TRACE_RESOLUTION;
  TRACE_RESOLUTION = { kind: "daily", id: e.id };
  try {
    ap(e.fx);
  } finally {
    TRACE_RESOLUTION = previousResolution;
    s.eventRelativeId = null;
    s.eventRelativeDelayYears = null;
    s.eventCareNetworkMemberId = null;
  }
  recordTrace("daily", e.id, { text: t, relativeId }, before);
  flushPendingDeathTrace();
  if (!s.dead) rd();
}
function ask(e, T, t, before, resumed = false) {
  const s = S;
  const relativeId = s.eventRelativeId || null;
  const who = typeof e.who == "function" ? e.who(s) : e.who || (stg(s) <= 1 ? "parent" : "self");
  const choiceStates = simulationChoiceStates(e, s, T);
  const cs = choiceStates.filter(row => row.shown).map(row => row.c),
    ab = choiceStates.filter(row => row.enabled).map(row => row.c);
  if (!ab.length) {
    if (HL) STAT.choiceBlocked++;
    console.warn(`選択肢の条件を満たせないため保留: ${e.id}`);
    recordTrace("choice-blocked", e.id, { text: t, reason: "no-available-choice" }, before);
    return;
  }
  if (HL) {
    const key = `${STAT.currentLife}:${s.year}:${s.mo}`;
    if (STAT.choiceMonths.has(key)) STAT.duplicateChoiceMonths++;
    else STAT.choiceMonths.add(key);
  }
  s.sn[e.id] = s.year;
  s.majorEventMonth = { year: s.year, month: s.mo };
  if (HL) {
    const k = STG[stg(s)],
      d = STAT.ev[e.id] || (STAT.ev[e.id] = {});
    d[k] = (d[k] || 0) + 1;
  }
  if (!resumed) L(t);
  const pk = (c, by) => {
    if (s.ev !== e) return;
    const resolutionBefore = s.evBefore || before;
    const roll = R(),
      outcomeIndex = c.o.findIndex(x => roll < x[0]),
      o = c.o[outcomeIndex],
      choiceIndex = e.c.indexOf(c);
    recordSimulationOutcome(e, choiceIndex, outcomeIndex);
    const result = tpl(o[1], s);
    const choiceLabel = tpl(c.l, s);
    L(
      `<span class="${evt(c)}">${by ? (e.id === "parent_treatment_review" ? "親の判断:" : "養育者の判断:") : ""}「${choiceLabel}` +
        `」</span><span class="${tone(o[2])}">${result}</span>`
    );
    const routeReserve = typeof c.en?.affordableRoute === "number" ? c.en.affordableRoute : 0;
    const choiceReturnSpeed = Number.isInteger(s.choiceReturnSpeed) ? s.choiceReturnSpeed : null;
    delete s.choiceReturnSpeed;
    delete s.evBefore;
    s.ev = null;
    $("md").hidden = 1;
    $("resumeChoice").hidden = 1;
    syncUIDialogs();
    UI_FOCUS_RETURNS.delete("md");
    cnt(tone(o[2]));
    const previousResolution = TRACE_RESOLUTION;
    // This outcome belongs to the partner at the time of the choice, even if
    // the choice ends the relationship. The first meeting can create the ID.
    const romanceIdAtChoice = s.romance?.id || null;
    TRACE_RESOLUTION = { kind: "choice", id: e.id, label: choiceLabel };
    try {
      ap(o[2], routeReserve);
      // Record the actual outcome and the relationship's stable participant.
      s.eventOutcomes || (s.eventOutcomes = {});
      const romanceId = romanceIdAtChoice || s.romance?.id || null;
      s.eventOutcomes[e.id] = {
        year: s.year, choiceIndex, outcomeIndex,
        ...((e.id === "lov" || e.id.startsWith("romance_")) && romanceId
          ? { romanceId } : {})
      };
      recordEventReview(e,s,choiceLabel);
    } finally {
      TRACE_RESOLUTION = previousResolution;
      s.eventRelativeId = null;
      s.eventRelativeDelayYears = null;
      s.eventCareNetworkMemberId = null;
      s.eventCareSiblingId = null;
      s.eventHobbyKey = null;
    }
    const choiceMode = by ? "parent" : AU || HL ? "auto" : "self";
    recordTrace(
      "choice",
      e.id,
      {
        text: t,
        choice: choiceLabel,
        choiceIndex,
        result,
        relativeId,
        by: choiceMode,
        autoMode: choiceMode === "auto" ? AU || "random" : null,
        randomSeed: s.randomSeed ?? null,
        randomAlgorithm: s.randomAlgorithm || null,
        rngBefore: resolutionBefore?.rngState ?? null,
        rngAfter: s.rngState ?? null
      },
      resolutionBefore
    );
    flushPendingDeathTrace();
    if (!s.dead) {
      rd();
      if (choiceReturnSpeed !== null) play(choiceReturnSpeed);
      $("stt").focus();
    }
  };
  s.ev = e;
  if (who == "parent") {
    const target = [s.par?.fa, s.par?.mo].find(parent => parent?.id === s.eventRelativeId),
      options = ab.map((c, index) => ({
        c,
        w:
          e.id === "parent_treatment_review" && target
            ? Math.max(0.1, index === 0 ? target.treatmentPriority : 1 - target.treatmentPriority)
            : c.pw == null
              ? 1
              : c.pw
      }));
    return pk(wpk(options, s, T).c, 1);
  }
  if (AU || HL) {
    return pk(selectAutomaticChoice(ab, AU == "c" || AU == "b" ? AU : "r"));
  }
  s.evBefore = before || s.evBefore || null;
  rd();
  $("mt").textContent = t;
  $("mc").innerHTML = "";
  cs.forEach((c, i) => {
    const b = document.createElement("button"),
      k = ab.includes(c);
    const label = i + 1 + ". " + tpl(c.l, s);
    // Keep the spoken label whole, while separating shortcut and action visually.
    b.setAttribute("aria-label", label);
    const number = document.createElement("span"), action = document.createElement("span");
    number.className = "choice-number";
    number.textContent = `${i + 1}. `;
    number.setAttribute("aria-hidden", "true");
    action.className = "choice-label";
    action.textContent = tpl(c.l, s);
    b.append(number);
    b.append(action);
    if (!k) {
      const reason = tpl(ethicalLock(e, c, s, who) || c.why || "条件を満たしていない", s),
        description = document.createElement("span");
      description.className = "choice-reason";
      description.id = `choice-reason-${i + 1}`;
      description.textContent = "選択できない理由: " + reason;
      b.setAttribute("aria-disabled", "true");
      b.setAttribute("aria-label", label + "（選択できません）");
      b.setAttribute("aria-describedby", description.id);
      b.title = reason;
      b.append(description);
    }
    b.onclick = () => {
      if (k) pk(c);
    };
    $("mc").append(b);
  });
  $("choice-date").textContent = `${s.age}歳・テラ暦${s.year}年${s.mo ? ` ${s.mo}月` : ""}`;
  showChoiceSheet();
}
function restorePendingChoice() {
  if (!S?.ev?.id) return false;
  const event = EV.find(candidate => candidate.id === S.ev.id && candidate.c);
  if (!event) {
    S.ev = null;
    delete S.evBefore;
    L("以前の形式で保留されていた選択肢を現在の内容から復元できなかったため、進行を再開しました。");
    return false;
  }
  const T = tags(S),
    before = S.evBefore || traceState(S);
  if (
    !elig(event, S, T, { ignoreOccurrence: true }) ||
    !event.c.some(
      choice =>
        ok(choice.show, S, T) &&
        ok(choice.en, S, T) &&
        !ethicalLock(
          event,
          choice,
          S,
          (typeof event.who === "function" ? event.who(S) : event.who) || (stg(S) <= 1 ? "parent" : "self")
        )
    )
  ) {
    S.ev = null;
    delete S.evBefore;
    L("保存時から生活条件が変わり、保留されていた選択肢を続けられなかったため、進行を再開しました。");
    return false;
  }
  S.evBefore = before;
  ask(event, T, txt(event, S, T), before, true);
  return true;
}
function fin() {
  const s = S,
    o = D(s),
    T = o.reduce((a, x) => a + x.p, 0);
  if (s.inf && s.ob >= P("infection.terminalThreshold")) {
    finalizeLifeLedgerAtDeath(s);
    return die(
      "病死（鉱石病）",
      pick([
        "鉱石病の進行が生命を維持できない段階に達し、亡くなった。",
        "鉱石病に伴う全身状態の悪化から回復できず、亡くなった。"
      ])
    );
  }
  if (R() < T) {
    const d = wp(o);
    const text = pick(d.l),
      deathMonth = worldPressureDeathMonth(s, d.c);
    if (deathMonth) {
      s.mo = deathMonth;
      finalizeLifeLedgerAtDeath(s);
      return die(d.c, text, "pressure-window-sample", d.episodeId);
    }
    finalizeLifeLedgerAtDeath(s);
    return die(d.c, text, null, d.episodeId);
  }
  if (s.age >= P("life.mortalityAgeScale") * s.r.lm) {
    finalizeLifeLedgerAtDeath(s);
    return die("老衰", "老衰で息を引き取った");
  }
  rd();
}
