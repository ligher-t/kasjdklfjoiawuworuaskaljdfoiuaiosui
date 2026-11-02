// review/historical-reviews: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("review/historical-reviews", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "V83_MANUAL_REVIEW",
    {
      col_tech_safety_aftermath: "p,s,w",
      col_tech_role_review: "d,a,d",
      col_tech_internal_review: "p,p,w",
      col_tech_later_years: "d,s,w",
      vic_clerk_role_review: "d,s,w",
      vic_clerk_later_years: "s,a,w",
      vic_clerk_after_departure: "i,w",
      col_tech_after_departure: "i,w",
      pet_strain: "s,s",
      pet_life_turn: "s,s,s",
      illness_review: "s,s,s",
      illness_followup: "s,s,s",
      par_death: "s,s",
      parent_work_news: "i,w,i",
      parent_household_move_news: "i,w,i",
      fam_care: "s,s,s",
      fam_unemploy: "s,s,s",
      arts_awake: "s,s,w",
      dg: "s,s,s"
    },
    false
  );

  $define("V83_REVIEWED_CHOICES", 0, true);

  for (const [id, sequence] of Object.entries($terraData.V83_MANUAL_REVIEW)) {
    const event = $terraData.EV.find(row => row.id === id),
      tags = sequence.split(",");
    if (!event?.c || tags.length !== event.c.length) throw Error("v83分類の分岐数不一致: " + id);
    for (let i = 0; i < tags.length; i++) {
      const c = event.c[i],
        intent = $terraData.V79_INTENTS[tags[i]];
      if (!intent || c.ethics?.reviewed) throw Error("v83分類の重複または不正: " + id + "@" + i);
      if (
        !c.l ||
        !Array.isArray(c.o) ||
        !c.o.length ||
        c.o.some(out => typeof out[1] !== "string" || !out[2] || typeof out[2] !== "object")
      )
        throw Error("v83の結果枝が未確認: " + id + "@" + i);
      c.ethics = { intent, target: null, reviewed: true, policyVersion: 83 };
      $terraData.V83_REVIEWED_CHOICES++;
    }
  }

  $define(
    "V84_MANUAL_REVIEW",
    {
      life_ursus_student_assembly_contact: "i,w",
      life_ursus_student_assembly_meeting: "d,a,w",
      life_ursus_student_assembly_protest: "a,a,w,i,w",
      life_ursus_katorga_life: "i,i,s",
      life_ursus_student_assembly_release: "d,w,s",
      life_ursus_student_assembly_later: "i,i,w",
      life_chernobog_resident_response: "s,s,f",
      life_londinium_civilian_response: "d,a,w",
      life_londinium_civilian_afterwar: "i,d,w",
      life_londinium_aid_afterwar: "i,d,w",
      sr_rhodes_recruitment_contact: "p,i,w",
      sr_rhodes_service_daily: "p,a,s",
      sr_rhodes_maintenance_daily: "p,a,s",
      life_mental_crisis_support: "s,p,s",
      life_mental_crisis_recovery: "s,s",
      life_late_care_planning: "s,r",
      life_severe_illness_companionship: "s,s",
      life_rehabilitation_followup: "s,p",
      family_care_network_contact: "i,s,i,w",
      family_care_network_move_news: "i,i,i",
      family_care_network_member_move_news: "i,i,i",
      family_care_network_member_death_notice: "s,i,s",
      family_care_network_member_missing_news: "i,f,s",
      family_care_network_member_found_news: "i,f,w",
      family_care_network_reconnect: "i,w,w",
      family_sibling_reconnect: "i,w,w",
      family_spouse_housing_choice: "s,s,s,s",
      family_spouse_work_preference: "s,s,s,s",
      family_spouse_migration_choice: "s,s",
      family_spouse_independent_move_notice: "i,f",
      family_newlywed_residence: "s,s,s,f"
    },
    false
  );

  $define("V84_REVIEWED_CHOICES", 0, true);

  for (const [id, sequence] of Object.entries($terraData.V84_MANUAL_REVIEW)) {
    const event = $terraData.EV.find(row => row.id === id),
      tags = sequence.split(",");
    if (!event?.c || tags.length !== event.c.length) throw Error("v84監査の分岐数不一致: " + id);
    for (let i = 0; i < tags.length; i++) {
      const c = event.c[i],
        intent = $terraData.V79_INTENTS[tags[i]];
      if (!intent || c.ethics?.reviewed) throw Error("v84監査の重複または不正: " + id + "@" + i);
      if (
        typeof c.l !== "string" ||
        !c.l.trim() ||
        !Array.isArray(c.o) ||
        !c.o.length ||
        c.o.some(
          out => !Array.isArray(out) || typeof out[1] !== "string" || !out[2] || typeof out[2] !== "object"
        )
      )
        throw Error("v84結果枝の未確認: " + id + "@" + i);
      c.ethics = { intent, target: null, reviewed: true, policyVersion: 84 };
      $terraData.V84_REVIEWED_CHOICES++;
    }
  }

  $define(
    "V85_MANUAL_REVIEW",
    {
      pet: "s,s,s,s,a,w",
      lov: "s,s,w",
      chi: "s,s,f",
      ksc: "s,s",
      nat: "s,s,s",
      mv: "s,s,s",
      old: "s,s,s",
      elder_work_opportunity: "s,s,a",
      investment_exit: "s,f",
      urs_ice: "s,a,s",
      kaz_knight: "s,s,w",
      rim_mine: "c,s,w",
      life_skill_practice: "s,s,w",
      life_goal_start: "s,s,a,f",
      life_goal_review: "s,s,f,w",
      life_goal_resume: "s,w",
      wld_plague: "c,s",
      wld_friend_repay: "p,a,w",
      friend_found_news: "i,f,i",
      neighbor_found_news: "i,f,i",
      family_former_spouse_death_notice: "s,s,s",
      family_former_spouse_move_notice: "i,f",
      life_night_study: "s,s,f",
      life_youth_apprenticeship: "s,s,f",
      life_overtime_offer: "s,s,p",
      lon_slum: "a,a,s,w"
    },
    false
  );

  $define("V85_REVIEWED_CHOICES", 0, true);

  for (const [id, sequence] of Object.entries($terraData.V85_MANUAL_REVIEW)) {
    const event = $terraData.EV.find(row => row.id === id),
      tags = sequence.split(",");
    if (!event?.c || tags.length !== event.c.length) throw Error("v85分類の選択肢数不一致: " + id);
    for (let i = 0; i < tags.length; i++) {
      const choice = event.c[i],
        intent = $terraData.V79_INTENTS[tags[i]];
      if (!intent || choice.ethics?.reviewed) throw Error("v85分類重複または不正: " + id + "@" + i);
      if (
        !choice.l?.trim() ||
        !choice.o?.length ||
        choice.o.some(
          row =>
            !Array.isArray(row) ||
            !Number.isFinite(row[0]) ||
            typeof row[1] !== "string" ||
            !row[2] ||
            typeof row[2] !== "object"
        )
      )
        throw Error("v85結果枝が未確認: " + id + "@" + i);
      choice.ethics = { intent, target: null, reviewed: true, policyVersion: 85 };
      $terraData.V85_REVIEWED_CHOICES++;
    }
  }

  $terraData.EV.push({
    id: "v86_individual_colleague_apology",
    conf: "S",
    references: ["SRC_V82_SIM"],
    st: ["青年", "壮年", "老年"],
    once: true,
    w: 0.54,
    show: s => {
      const person = $terraData.v82p(s, "workplace"),
        tie = person && s.personTies?.links?.[person.id];
      const rejection = tie?.history?.find(row => row.action === "rejection-received");
      return !!(
        person &&
        rejection &&
        s.year > rejection.year &&
        person.actualStatus === "working" &&
        !Number.isInteger(person.apologyOfferedYear)
      );
    },
    t: "鉱石病の診断を知ってあなたから距離を置いた同僚が、あの時のことを詫びた。謝罪の言葉を聞きながら、何を返せばよいのか考えた。",
    c: [
      $terraData.K("謝罪に礼を言い、今後の話は急がない", {}, [
        1,
        "謝罪を聞き、短く礼を返した。休憩が終わるまで、以前のようには言葉が続かなかった。",
        { personTieAction: { kind: "workplace", action: "apology-heard" }, p: 1 }
      ]),
      $terraData.K("今日は話を続けられないと伝える", {}, [
        1,
        "今日は話せないと伝え、会話を切り上げた。あの時の拒絶と今日の謝罪が、頭の中で並んだ。",
        { personTieAction: { kind: "workplace", action: "apology-deferred" } }
      ]),
      $terraData.K("謝罪と合わせて、仕事上の不利益にも触れる", {}, [
        1,
        "診断を知られた後に任される仕事が減り、外された持ち場があったと話した。同僚は黙って聞き、始業の合図で席を立つとき、担当者に話すと言った。",
        { personTieAction: { kind: "workplace", action: "apology-accountability" }, k: 1 }
      ])
    ]
  });

  $define(
    "V86_MANUAL_REVIEW",
    {
      ill: "s,s,s,s,s,s,s",
      alley_attack: "s,s,s,a",
      fam_gunrite: "s,w",
      fam_tribetree: "s,s",
      col_hire: "s,s,s,w",
      kaz_business: "s,w",
      kaz_rural: "s,s,w",
      lei_arts: "s,s,s",
      lei_witchking: "s,s,w",
      lei_noble: "s,s,w",
      sir_family_review: "d,w,w",
      sir_family_obligation: "p,m,w",
      lat_gun: "s,w",
      lat_priest: "d,i,f",
      sam_migrate: "a,w",
      sam_ritual: "d,a,o",
      kje_pilgrim: "s,a,w",
      kje_open: "s,s,w",
      yan_exam: "s,s,w",
      yan_sui: "i,i,w",
      yan_ancestor: "d,d,a,w"
    },
    false
  );

  $define("V86_REVIEWED_CHOICES", 0, true);

  for (const [id, sequence] of Object.entries($terraData.V86_MANUAL_REVIEW)) {
    const event = $terraData.EV.find(e => e.id === id),
      tags = sequence.split(",");
    if (!event?.c || tags.length !== event.c.length) throw Error("v86選択数の不一致: " + id);
    for (let i = 0; i < tags.length; i++) {
      const choice = event.c[i],
        intent = $terraData.V79_INTENTS[tags[i]];
      if (
        !intent ||
        choice.ethics?.reviewed ||
        !choice.l?.trim() ||
        !choice.o?.length ||
        choice.o.some(
          out =>
            !Array.isArray(out) ||
            typeof out[1] !== "string" ||
            !out[1].trim() ||
            !out[2] ||
            typeof out[2] !== "object"
        )
      )
        throw Error("v86結果枝の不整合: " + id + "@" + i);
      choice.ethics = { intent, target: null, reviewed: true, policyVersion: 86 };
      $terraData.V86_REVIEWED_CHOICES++;
    }
  }

  for (const [i, choice] of $terraData.EV.at(-1).c.entries())
    choice.ethics = {
      intent: ["procedure", "defer", "procedure"][i],
      target: null,
      reviewed: true,
      policyVersion: 86
    };
});
