// routes/rhodes-and-factions/staff-setup: construction fragment; evaluation order is declared by data/routes/rhodes-and-factions.js.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/staff-setup"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $define("SR_JOBS", {}, false);

  for (const [key, title, pay, ex] of [
    ["service", "ロドスの物資・生活支援職員", 2300000, 1.0],
    ["maintenance", "ロドスの設備整備職員", 3500000, 1.16],
    ["research", "ロドスの医療・研究補助職員", 3000000, 1.02],
    ["field", "ロドスの外勤オペレーター", 3600000, 1.45]
  ]) {
    $terraData.SR_JOBS[key] = $terraData.J.length;
    $terraData.J.push({ n: title, pay, ex });
  }
  // Index 32 is already used by the arena route. The Rhodes transport and
  // reserve roles are appended immediately after that registration.
  $terraData.SR_JOBS.transporter = $terraData.J.length + 1;
  $terraData.SR_JOBS.reserve = $terraData.J.length + 2;
  $define(
    "SR_JOB_CATALOG",
    {
      transporter: { n: "ロドスのトランスポーター", pay: 3200000, ex: 1.12 },
      reserve: { n: "ロドス行動予備隊員", pay: 2600000, ex: 1.0 }
    },
    false
  );

  $define(
    "SR_SRC",
    [
      "SRC_SR_GAME_MODEL",
      "SRC_SR_RHODES_WORK",
      "SRC_SR_RHODES_FIELD",
      "SRC_RHODES_FOUNDATION",
      "SRC_RHODES_BRANCHES",
      "SRC_RHODES_RESERVE",
      "SRC_RHODES_LANDSHIP"
    ],
    false
  );
  $define(
    "srRhodesPost",
    (s, prefix) => {
      const role = s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-staff")?.role || "";
      return typeof role === "string" && role.startsWith(prefix);
    },
    false,
    true
  );
  $define(
    "srStaff",
    (key, role, skillId, skillTitle, skillDelta = 3) => ({
      job: $terraData.SR_JOBS[key],
      lifeAffiliations: [
        {
          id: "rhodes-employment",
          title: "ロドスへの雇用照会",
          action: "decline",
          onlyIfContacted: true,
          note: "選考の返答を受け、照会期間が終了"
        },
        {
          id: "rhodes-staff",
          title: "ロドス・アイランド",
          kind: "employer",
          action: "join",
          role,
          note: "本人の技能と採用枠を照合し、この職務に配属"
        }
      ],
      lifeGoal: {
        id: "rhodes-work",
        title: "ロドスで担当する仕事を無理なく続ける",
        priority: "生業",
        action: "start"
      },
      lifeSkill: {
        id: skillId,
        title: skillTitle,
        delta: skillDelta,
        context: "新しい職場での研修と初日の仕事"
      },
      groupStanding: {
        id: "rhodes-colleagues",
        title: "ロドスの同僚",
        delta: 1,
        reason: "配属先で日々の仕事を始めた"
      },
      fl: { rhodes: 1 },
      p: 1,
      k: 1
    }),
    false,
    true
  );

  // 1094年内の再編完了月は特定できないため、ロドス製薬会社の
  // 公開接触・採用・勤務は、最初の通年候補である1095年から扱う。
  for (const event of $terraData.EV) {
    if (
      event.id === "wld_rhodes" ||
      event.id === "ori_rhodes_examination_contact" ||
      event.id === "life_rhodes_referral" ||
      event.id === "life_rhodes_referral_response" ||
      event.id === "life_rhodes_clinic_visit" ||
      event.id === "life_rhodes_clinic_reschedule" ||
      event.id === "life_rhodes_care_review" ||
      event.id === "life_rhodes_role_review" ||
      event.id.startsWith("life_rhodes_research_") ||
      event.id.startsWith("sr_rhodes_")
    ) {
      event.ge = { ...(event.ge || {}), year: Math.max(event.ge?.year || 0, 1095) };
      event.references = [...new Set([...(event.references || []), "SRC_RHODES_FOUNDATION"])];
    }
  }

  {
    const e = $terraData.EV.find(x => x.id === "life_rhodes_referral");
    const c = e.c[1],
      o = c.o[0];
    o[1] =
      "経歴を渡し、物資の仕分けや記録整理の仕事について照会した。募集枠があるか、続けて働けるかは返答を待たなければならない。";
    o[2] = {
      lifeAffiliation: {
        id: "rhodes-employment",
        title: "ロドスへの雇用照会",
        kind: "employment-application",
        action: "contact",
        role: "事務・物資仕事への応募照会"
      },
      lifeGoal: {
        id: "rhodes-job-search",
        title: "通える場所で働き口を探す",
        priority: "仕事",
        action: "start"
      },
      p: 1,
      k: 1
    };
    c.l = "仕事の経験を伝え、採用の相談をする";
    // Care-only followups must never leave a nonexistent affiliation.
    const r = $terraData.EV.find(x => x.id === "life_rhodes_role_review");
    r.c[2] = {
      l: "療養相談の連絡を終え、地域の診療先に戻る",
      show: { need: ["ロドスと継続連絡中"] },
      o: [
        [
          1,
          "相談先へ連絡を終えると伝え、地域の診療所で引き継ぎを確かめた。ロドスへの紹介と診療所での療養は別の経路として記録された。",
          {
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              action: "leave",
              note: "地域の診療先へ引き継いだ"
            },
            p: 1
          }
        ]
      ]
    };
    r.c[1] = $terraData.K(
      "現在の担当業務を続け、勤務手順を見直す",
      { show: { need: ["ロドス職員として活動中"] } },
      [
        1,
        "担当者と仕事の優先順位を確認した。任された範囲を越える判断はしないよう、引き継ぐ相手と連絡方法を確かめた。",
        { k: 1, p: 1 }
      ]
    );
    r.c.push(
      $terraData.K("勤務を終えて、次の働き口を探す", { show: { need: ["ロドス職員として活動中"] } }, [
        1,
        "引継ぎ先に資料を渡し、雇用契約を終えた。患者としての受診歴や、覚えた手順は退職後も本人の履歴に残る。",
        {
          job: 0,
          lifeAffiliation: {
            id: "rhodes-staff",
            title: "ロドス・アイランド",
            action: "leave",
            note: "勤務を終了し、地域の職を探す"
          },
          lifeGoal: { id: "rhodes-work", action: "compromise", note: "ロドスでの仕事を終了" },
          p: 1
        }
      ])
    );
    // Research may be reached through any legitimate staff job, not only a referral.
    const research = $terraData.EV.find(x => x.id === "life_rhodes_research_offer");
    research.after = null;
    research.need = ["ロドス職員として活動中"];
    research.ge = { age: 18, k: 45, year: 1095 };
    research.w = 0.26;
    research.show = s =>
      $terraData.srOnStaff(s) &&
      !["active", "crisis", "suspended"].includes($terraData.srAffiliationStatus(s, "rhodes-research"));
    // The staff should not have to be a hero or researcher to contribute.
  }
});
