// Person-scoped job knowledge and choice load. Reading this module's projections
// never discovers an opening, changes the clock, or consumes random numbers.
const EMPLOYMENT_DECISION_META = (() => {
  const result = {};
  const add = (kind, ids) => ids.forEach(id => { result[id] = Object.freeze({ kind, topicKey: id }); });
  add("routine", [
    "car", "work_unemployed_reentry", "work_elder_reentry", "elder_work_opportunity",
    "v77_written_application", "job_contract_review_v76", "job_contract_negotiation_v76", "work_known_opening_review",
    "teacher_path", "artist_path", "study_to_work", "education_paused_life",
    "sr_rhodes_recruitment_contact", "sr_rhodes_reapplication", "sr_bsw_recruitment_assessment",
    "sr_rhine_recruitment_exam", "sr_kazimierz_arena_backstage", "life_ursus_zelgrad_recruitment",
    "life_ursus_zelgrad_recruitment_retry", "life_ursus_zelgrad_displaced_work",
    "car_yan_court_entry", "car_yan_suis_entry", "car_yan_tianshi_entry", "car_lmd_guard_entry",
    "car_lmd_black_entry", "car_hig_samurai_entry", "car_hig_ninja_entry", "car_hig_cyber_entry",
    "car_hig_shinto_entry", "car_hig_touhou_entry", "car_urs_officer_entry", "car_urs_guard_entry",
    "car_urs_academy_entry", "car_vic_infantry_entry", "car_vic_royal_entry", "car_vic_scribe_entry",
    "car_vic_works_entry", "car_lei_golden_entry", "car_lei_court_entry", "car_lat_executor_entry",
    "car_lat_landen_entry", "car_col_pioneer_entry", "car_kaz_comp_knight_entry", "car_kaz_armorless_entry",
    "car_sir_soldier_entry", "car_sir_police_entry", "car_sie_obs_entry", "car_sar_guard_entry",
    "car_sar_warrior_entry", "car_sam_priest_entry", "car_sam_warrior_entry", "car_kje_karlan_entry",
    "car_kje_monk_entry", "car_kazdel_mil_entry", "car_kazdel_bone_entry", "car_ibe_inq_entry",
    "car_ibe_tuner_entry", "car_bol_soldier_entry", "car_bol_dossoles_entry", "car_rim_eng_entry",
    "car_min_champ_entry", "car_min_orator_entry"
  ]);
  add("material", [
    "transporter_contract_review", "kjerag_transporter_route_review", "rim_catastrophe_transporter_review",
    "sargon_market_contract_review", "col_tech_internal_review", "col_tech_later_years",
    "vic_clerk_role_review", "vic_clerk_later_years", "old", "old_followup", "old_reemployment_review",
    "fam_inherit", "col_hire", "col_frontier", "col_frontier_contract_review", "kaz_rural",
    "sir_family_afterwork", "sir_family_later_work", "lat_priest", "ibe_rebuild", "ibe_rebuild_contract_review",
    "kje_open", "yan_exam", "lon_guard", "lon_merchant", "hig_service_review", "hig_service_later_career_review",
    "rim_mine", "bol_tourist", "veteran", "arts_academy_completion", "kaz_knight_later_career_review",
    "kazimierz_knight_entry", "life_rhodes_role_review", "life_work_project_setback", "life_savra_late_craft",
    "sr_rhodes_hiring_review", "sr_rhodes_field_qualification", "sr_rhodes_work_review",
    "sr_rhodes_posting_review", "sr_rhodes_posting_transfer", "sr_rhodes_branch_transfer",
    "sr_rhodes_promotion_review", "sr_kazimierz_arena_shift", "sr_bsw_promotion_tactical",
    "sr_bsw_rhodes_secondment", "sr_bsw_secondment_posting_review", "sr_rhine_section_assignment",
    "sr_rhine_promotion_chief", "sr_rhine_post_lone_trail_career_review",
    "car_vic_exile_command_review", "car_vic_exile_postwar_review", "job_contract_family_schedule_v76",
    "life_ursus_zelgrad_work_review", "life_ursus_zelgrad_stay_review", "life_ursus_zelgrad_displaced_work_review"
  ]);
  add("critical", [
    "ursus_mine_assignment_offer", "ursus_mine_assignment_review", "col_tech_safety_aftermath",
    "col_tech_workplace_consequence", "illness_review", "illness_followup", "nat", "displacement_after",
    "war", "mv", "dis", "fam_unemploy", "fam_conscript", "fam_infected", "fam_tribetree",
    "urs_mine", "urs_conscript", "urs_purge", "vic_patron", "vic_strike", "vic_war",
    "col_quarantine_offer", "lei_isolation", "sir_feud", "lat_exile", "hig_tension", "kaz_exile",
    "kazdel_afterfall", "bol_war", "wld_race", "discrimination_after", "discrimination_work_after",
    "choice_ursus_04", "choice_victoria_01", "choice_columbia_03", "hid_exposed",
    "kaz_knight_injury_job_transition", "life_rhodes_referral", "life_rhodes_research_stall",
    "life_chernobog_resident_response", "earth_persecution_victoria_framed_debt",
    "earth_discr_disclose_employer", "infection_workplace_review", "infection_regional_housing_pressure",
    "sr_rhodes_to_reunion_turning_point", "sr_reunion_turncoat_rehabilitation",
    "sr_bsw_vip_escort_ambush", "sr_bsw_infected_squad_policy", "sr_rhine_rhodes_asylum",
    "car_yan_court_choice_bribe", "car_lmd_black_choice_big_deal", "car_hig_ninja_choice_escape",
    "car_urs_officer_choice_purge", "car_urs_guard_choice_riot", "car_vic_royal_choice_coup",
    "car_col_pioneer_choice_bandits", "life_ursus_zelgrad_evacuation", "life_ursus_zelgrad_purge_trap",
    "life_ursus_zelgrad_displacement_review"
  ]);
  return Object.freeze(result);
})();
function employmentDecisionMeta(event) {
  // The explicit event contract can override the centrally reviewed inventory.
  return event?.employmentDecisionKind
    ? { kind: event.employmentDecisionKind, topicKey: event.workTopicKey || event.id }
    : EMPLOYMENT_DECISION_META[event?.id] || { kind: "none", topicKey: null };
}
function employmentUxFor(s, create = false) {
  const personId = s?.personId || s?.identity?.id || "protagonist";
  if (create) {
    s.employmentUx ||= {};
    s.employmentUx[personId] ||= { topics: {}, presented: [], search: null, pendingOpeningId: null };
  }
  return s?.employmentUx?.[personId] || null;
}
function employmentTopicRevision(event, s) {
  if (typeof event?.workTopicRevision === "function") return String(event.workTopicRevision(s));
  const current = typeof currentPlayerEmployment === "function" ? currentPlayerEmployment(s) : null;
  const publicOpenings = employmentKnownOpenings(s).map(row => [row.openingId, row.observedStatus]);
  return JSON.stringify([
    occupationWorkAreaKey(s), s.job, current?.episodeId || null, s.workContract?.knownConditions,
    s.workContract?.wagePremium, s.workContract?.hours, s.fl?.retired || 0,
    s.educationPath?.status, s.educationPath?.completed, s.socialLearning?.literacy >= 30,
    s.socialLearning?.literacy >= 35, s.k >= 20, s.k >= 25, s.k >= 50,
    (s.lifeRecord?.skills || []).map(row => [row.id, Math.floor((row.level || 0) / 12)]),
    s.residenceArrangement, s.sp?.id || null, (s.kids || []).filter(row => !row.d).length,
    publicOpenings, employmentUxFor(s)?.search?.revision || null,
    employmentUxFor(s)?.pendingOpeningId || null
  ]);
}
function employmentRoutineAvailable(event, s, options = {}) {
  const meta = employmentDecisionMeta(event);
  if (!["routine", "material"].includes(meta.kind) || options.userInitiated || options.protected) return true;
  const ux = employmentUxFor(s), shown = ux?.presented || [];
  const prior = ux?.topics?.[meta.topicKey];
  if (prior && prior.topicRevision === employmentTopicRevision(event, s)) return false;
  if (meta.kind !== "routine") return true;
  // The next routine choice must fit the most recent five actual major choices.
  if (shown.slice(-4).filter(row => row.kind === "routine").length >= 2) return false;
  if (shown.slice(-2).length === 2 && shown.slice(-2).every(row => row.kind === "routine")) return false;
  return true;
}
function recordEmploymentPrompt(event, s, options = {}) {
  if (!event?.c || options.resumed) return;
  const ux = employmentUxFor(s, true), meta = employmentDecisionMeta(event),
    initiated = options.userInitiated === true;
  if (!initiated) {
    const kind = options.protected && meta.kind === "routine" ? "deadline" : meta.kind;
    ux.presented.push({ eventId: event.id, year: s.year, month: s.mo, kind });
    ux.presented = ux.presented.slice(-5);
    ux.metrics ||= {};
    for (const key of ["employmentDecisionsShown", "routineEmploymentDecisionStreakMax",
      "routineEmploymentDecisionsInFive", "routineEmploymentDecisionsInFiveMax",
      "repeatPromptSameTopicWithoutRevision"])
      if (!Number.isFinite(ux.metrics[key])) ux.metrics[key] = 0;
    if (meta.kind !== "none") ux.metrics.employmentDecisionsShown++;
    let streak = 0;
    for (const row of ux.presented.slice().reverse()) { if (row.kind !== "routine") break; streak++; }
    ux.metrics.routineEmploymentDecisionStreakMax = Math.max(ux.metrics.routineEmploymentDecisionStreakMax, streak);
    ux.metrics.routineEmploymentDecisionsInFive = ux.presented.filter(row => row.kind === "routine").length;
    ux.metrics.routineEmploymentDecisionsInFiveMax = Math.max(
      ux.metrics.routineEmploymentDecisionsInFiveMax, ux.metrics.routineEmploymentDecisionsInFive);
  }
  if (meta.topicKey) {
    const revision = employmentTopicRevision(event, s), prior = ux.topics[meta.topicKey];
    if (!initiated && !options.protected && meta.kind === "routine" && prior?.topicRevision === revision)
      ux.metrics.repeatPromptSameTopicWithoutRevision++;
    ux.topics[meta.topicKey] = {
      topicKey: meta.topicKey, topicRevision: revision, decisionAsOf: null,
      lastPrompt: { year: s.year, month: s.mo }, status: "presented",
      deferralUntil: null,
      presentationCount: prior?.topicRevision === revision ? (prior.presentationCount || 0) + 1 : 1
    };
  }
}
function recordEmploymentDecision(event, s, label) {
  const meta = employmentDecisionMeta(event), ux = employmentUxFor(s);
  if (!meta.topicKey || !ux?.topics?.[meta.topicKey]) return;
  Object.assign(ux.topics[meta.topicKey], {
    status: "resolved", decisionAsOf: { year: s.year, month: s.mo },
    choice: String(label).slice(0, 200)
  });
}
function employmentKnownOpenings(s) {
  const seen = new Map();
  for (const row of s?.employmentState?.knowledge || []) {
    if (!row?.openingId || row.learnedYear > s.year ||
        (row.learnedYear === s.year && (row.learnedMonth || 1) > (s.mo || 12))) continue;
    // Employment records from accepted offers are known too; no other person's
    // knowledge or a world's visibleToPlayer bit grants this person knowledge.
    const world = s.world?.occupationWorld, opening = world?.openings?.[row.openingId],
      position = opening ? world.positions?.[opening.positionId] : null,
      employer = opening ? world.employers?.[opening.employerId] : null,
      key = employer?.organizationKey;
    if (key && ["BLOCKED", "CONTACT", "HISTORICAL", "SOURCE_HOLD"].includes(EMPLOYER_PLAYER_ACCESS_MODES[key])) continue;
    const jobId = row.jobId ?? position?.jobId;
    if (!Number.isInteger(jobId) || !J[jobId]) continue;
    seen.set(row.openingId, {
      ...row, jobId, jobLabel: row.jobLabel || J[jobId].n,
      siteLabel: row.siteLabel || "問い合わせた勤務先",
      observedStatus: row.observedStatus || "confirmed",
      isCurrentArea: !row.areaId || row.areaId === occupationWorkAreaKey(s)
    });
  }
  const rows = [...seen.values()], preference = employmentUxFor(s)?.search?.preference;
  if (preference === "income") rows.sort((a, b) => J[b.jobId].pay - J[a.jobId].pay);
  if (preference === "safe") rows.sort((a, b) => (J[a.jobId].ex || 1) - (J[b.jobId].ex || 1));
  return rows;
}
function discoverEmploymentOpenings(s, source = "local-inquiry", preference = "local") {
  if (!s || s.dead || restricted(s) || s.age < 16 || travelPresence(s).mode !== "residence") return [];
  if (!["local", "income", "safe"].includes(preference)) throw Error("求職の希望条件が不正");
  const area = occupationAreaSnapshot(s), work = s.world?.occupationWorld;
  if (!area || !work) return [];
  const ux = employmentUxFor(s, true), state = playerEmploymentState(s), found = [];
  for (const siteId of area.siteIds || []) {
    const site = work.sites[siteId], employer = site && work.employers[site.employerId];
    if (!site || site.status !== "open" || employer?.organizationKey) continue;
    for (const positionId of site.positionIds || []) {
      const position = work.positions[positionId];
      if (!position || !J[position.jobId] || position.vacancyCount < 1) continue;
      for (const openingId of position.openingIds || []) {
        const row = work.openings[openingId];
        if (!row || row.kind !== "general-public" || row.status !== "open" || row.slots < 1 ||
            row.siteId !== siteId || row.positionId !== positionId || row.employerId !== site.employerId ||
            (row.validFromYear != null && row.validFromYear > s.year) ||
            (row.validToYear != null && row.validToYear < s.year)) continue;
        found.push({ openingId, jobId: position.jobId, jobLabel: J[position.jobId].n,
          siteLabel: "地域の" + J[position.jobId].n + "の勤務先", areaId: area.areaId,
          region: s.res.n,
          learnedYear: s.year, learnedMonth: s.mo, source, certainty: "confirmed",
          observedStatus: "open", validToYear: row.validToYear ?? null });
      }
    }
  }
  const ordering = (a, b) => preference === "income" ? J[b.jobId].pay - J[a.jobId].pay :
    preference === "safe" ? (J[a.jobId].ex || 1) - (J[b.jobId].ex || 1) : a.openingId.localeCompare(b.openingId);
  found.sort(ordering);
  // Update one current knowledge record instead of accumulating duplicate reads.
  for (const row of found) {
    const prior = state.knowledge.find(item => item.openingId === row.openingId);
    if (prior) Object.assign(prior, row); else state.knowledge.push(row);
  }
  for (const prior of state.knowledge) if (prior.areaId === area.areaId &&
      !found.some(row => row.openingId === prior.openingId)) prior.observedStatus = "unavailable";
  ux.search = { preference, consentScope: "information-only", status: "inquired",
    year: s.year, month: s.mo, revision: JSON.stringify(found.map(row => row.openingId)) };
  return found;
}
function employmentPendingOpening(s) {
  const id = employmentUxFor(s)?.pendingOpeningId;
  return id ? employmentKnownOpenings(s).find(row => row.openingId === id) || null : null;
}
function resolveKnownEmploymentOpening(s, accepted) {
  const ux = employmentUxFor(s), known = employmentPendingOpening(s);
  if (!known) throw Error("本人が確認した働き口がありません");
  if (!accepted) {
    if (ux.search) ux.search.status = "deferred";
    ux.pendingOpeningId = null; return null;
  }
  if (known.observedStatus === "unavailable" || !known.isCurrentArea)
    throw Error("この働き口には今いる場所から就けません");
  const episode = applyPlayerEmploymentAction(s, { action: "accept-local-opening",
    jobId: known.jobId, openingId: known.openingId, replaceCurrent: true });
  ux.consentScope = { openingId: known.openingId, jobId: known.jobId,
    year: s.year, month: s.mo, kind: "accepted-specific-opening" };
  ux.pendingOpeningId = null;
  if (ux.search) ux.search.status = "employed";
  return episode;
}
function employmentDeskAction(action) {
  const s = S;
  if (!s || s.dead || s.ev || s.mo < 1 || s.mo > 12) return false;
  if (typeof play === "function") play(0);
  if (action.kind === "inquire") {
    const rows = discoverEmploymentOpenings(s, "local-inquiry", action.preference || "local"),
      ux = employmentUxFor(s, true);
    ux.notice = rows.length ? "近くの募集を確かめた。条件を読んでから、引き受けるか決められる。" :
      "近くで募集を尋ねたが、今は案内してもらえる働き口がなかった。";
    SV(); rd(); return true;
  }
  if (action.kind !== "choose" ||
      (s.majorEventMonth?.year === s.year && s.majorEventMonth.month === s.mo)) return false;
  const known = employmentKnownOpenings(s).find(row => row.openingId === action.openingId);
  if (!known || known.observedStatus === "unavailable" || !known.isCurrentArea) return false;
  const ux = employmentUxFor(s, true), event = EV.find(row => row.id === "work_known_opening_review");
  if (!event) return false;
  ux.pendingOpeningId = known.openingId;
  const T = tags(s);
  if (!elig(event, s, T)) { ux.pendingOpeningId = null; return false; }
  s.employmentUserInitiated = event.id;
  fire(event, s, T);
  if (!s.dead) SV();
  return true;
}
function employmentDeskModel(s) {
  const ux = employmentUxFor(s), current = currentPlayerEmployment(s),
    status = { active: "勤務中", suspended: "休職中", terminated: "終了", completed: "完了" };
  const history = (s.employmentState?.episodes || []).slice(-6).map(row => ({
    title: row.jobId != null ? J[row.jobId]?.n || "仕事" : row.kind === "gig" ? "一件の仕事" : "生計の役割",
    status: status[row.status] || "記録あり", startYear: row.startYear, startMonth: row.startMonth,
    endYear: row.endYear, endMonth: row.endMonth
  }));
  return {
    current: current ? `${J[current.jobId]?.n || "仕事"}・${current.onLeave ? "休職中" : status[current.status] || "勤務中"}` :
      s.job > 0 ? occupationLabel(s) : "今は継続して勤める仕事を持っていません。",
    since: current ? `${current.startYear}年${current.startMonth || 1}月から` : "",
    workplace: current ? s.world?.occupationWorld?.sites?.[current.postingSiteId || current.siteId]?.label || "" : "",
    unpaid: (s.employmentState?.finance?.claims || []).filter(row => row.status === "unpaid")
      .reduce((sum, row) => sum + (row.amount || 0), 0),
    lastReceipt: (s.employmentState?.finance?.receipts || []).at(-1) || null,
    preference: ux?.search?.preference || "local", notice: ux?.notice || "",
    known: employmentKnownOpenings(s), history,
    disabled: s.dead || !!s.ev || restricted(s) || s.age < 16 || s.mo < 1 || s.mo > 12,
    inquiryDisabled: travelPresence(s).mode !== "residence",
    choiceUsed: s.majorEventMonth?.year === s.year && s.majorEventMonth.month === s.mo,
    hasWork: s.job > 0 || !!current
  };
}
function renderEmploymentDesk(s) {
  const contents = document.getElementById("detail-work")?.querySelector?.(".ui-ledger-contents");
  if (!contents) return;
  let target = document.getElementById("employment-desk");
  if (!target) {
    target = document.createElement("section"); target.id = "employment-desk"; target.className = "pn";
    contents.prepend(target);
  }
  const model = employmentDeskModel(s), signature = JSON.stringify(model);
  if (target.dataset.employmentSignature === signature) return;
  const focus = target.contains(document.activeElement) ? document.activeElement.id : null;
  target.replaceChildren();
  const element = (tag, text, parent = target) => {
    const node = document.createElement(tag); node.textContent = text; parent.appendChild(node); return node;
  };
  element("h3", "暮らしと仕事");
  element("p", model.current + (model.since ? "（" + model.since + "）" : ""));
  if (model.workplace) element("p", "持ち場：" + model.workplace);
  if (model.unpaid > 0) element("p", "未払の給金：" + Math.round(model.unpaid).toLocaleString("ja-JP") + "龍門幣");
  if (model.lastReceipt) element("p", `${model.lastReceipt.year}年${model.lastReceipt.month}月の受取：` +
    Math.round(model.lastReceipt.amount).toLocaleString("ja-JP") + "龍門幣");
  const search = element("div", ""), label = element("label", "仕事を探すときの希望", search);
  label.htmlFor = "employment-search-preference";
  const select = element("select", "", search); select.id = label.htmlFor;
  for (const [value, title] of [["local", "今の暮らしの近く"], ["income", "給金を重視"], ["safe", "危険の少なさを重視"]]) {
    const option = element("option", title, select); option.value = value; option.selected = value === model.preference;
  }
  select.disabled = model.disabled || model.inquiryDisabled;
  const inquire = element("button", "近くの募集を尋ねる", search);
  inquire.type = "button"; inquire.id = "employment-inquire";
  inquire.disabled = select.disabled;
  inquire.addEventListener("click", () => employmentDeskAction({ kind: "inquire", preference: select.value }));
  const notice = element("p", model.notice); notice.id = "employment-notice"; notice.setAttribute("role", "status");
  element("h4", "聞いた働き口");
  if (!model.known.length) element("p", "まだ募集の案内を受けていません。");
  else {
    const list = element("ul", "");
    model.known.forEach((row, index) => {
      const item = element("li", "", list);
      element("strong", row.jobLabel, item);
      const state = row.observedStatus === "unavailable" ? "問い合わせ時には募集なし" :
        row.learnedYear < s.year ? "現在の募集は未確認" : "募集の案内あり";
      element("p", `${row.region || "滞在先"}・${row.learnedYear}年${row.learnedMonth || 1}月に確認。${state}。`, item);
      if (row.isCurrentArea && row.observedStatus !== "unavailable") {
        const choose = element("button", "この働き口の条件を確かめる", item);
        choose.type = "button"; choose.id = "employment-opening-" + index;
        choose.disabled = model.disabled || model.choiceUsed;
        choose.addEventListener("click", () => employmentDeskAction({ kind: "choose", openingId: row.openingId }));
      }
    });
  }
  if (model.history.length) {
    const details = element("details", ""); element("summary", "仕事の経過", details);
    const list = element("ol", "", details);
    model.history.forEach(row => element("li", `${row.startYear}年${row.startMonth || 1}月・${row.title}：${row.status}` +
      (row.endYear != null ? `（${row.endYear}年${row.endMonth || 1}月まで）` : ""), list));
  }
  target.dataset.employmentSignature = signature;
  if (focus) document.getElementById(focus)?.focus({ preventScroll: true });
}
