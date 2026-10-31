// routes/rhodes-and-factions/aftercare-and-eligibility: construction fragment; evaluation order is declared by data/routes/rhodes-and-factions.js.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/aftercare-and-eligibility"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $terraData.EV.push({
    id: "life_rhodes_research_pause_review",
    conf: "S",
    references: ["SRC_RHODES_MEDICAL", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    cd: 5,
    w: 0.34,
    show: s => {
      const a = s.lifeRecord?.affiliations?.find(x => x.id === "rhodes-research");
      return s.age >= 18 && a?.status === "suspended" && s.year - (a.lastChangedYear ?? s.year) >= 5;
    },
    t: "療養や家の暮らしに追われ、ロドスの経過研究から離れて数年が過ぎた。ある日、研究班からこれからどうするか尋ねる便りが届いた。引き出しの奥にしまっていた資料の束を取り出し、ページをめくりながら今の体調と暮らしを思い返した。",
    c: [
      $terraData.K("無理のない日数だけ研究班へ戻る", {}, [
        1,
        "週に一度だけ顔を出す約束で、同意書の確認や記録の整理から手伝いを再開した。帰り際、次の出勤日を卓上の暦に書き込んだ。",
        {
          lifeAffiliation: {
            id: "rhodes-research",
            title: "ロドスの鉱石病経過研究",
            action: "return",
            role: "短時間の同意確認・記録補助",
            note: "勤務日を限って研究協力を再開"
          },
          lifeGoal: {
            id: "oripathy-research",
            action: "continue",
            note: "生活に合わせた短時間勤務で研究協力へ復帰"
          },
          p: 1
        }
      ]),
      $terraData.K("今はまだ休止を続け、数年後にまた考える", {}, [
        1,
        "まだしばらくは療養と家の暮らしを優先したいと返事を書いた。資料の束を元の引き出しへ戻すと、部屋に静かな夕方の光が差していた。",
        {
          lifeAffiliation: {
            id: "rhodes-research",
            title: "ロドスの鉱石病経過研究",
            action: "review",
            note: "療養・家族の時間を優先し、五年後に再確認"
          },
          lifeGoal: {
            id: "oripathy-research",
            action: "pause",
            note: "研究から離れた状態を続け、再確認時期を記録"
          },
          p: 1
        }
      ]),
      $terraData.K("研究協力をここで終え、資料を後任へ託す", {}, [
        1,
        "手元にあった記録をまとめて後任の担当者へ引き継ぎ、研究班を離れた。机の上がすっかり片づいたあとも、ふとした折に当時の症例や仲間の顔が浮かんだ。",
        {
          lifeAffiliation: {
            id: "rhodes-research",
            title: "ロドスの鉱石病経過研究",
            action: "leave",
            note: "研究協力を終了し、記録の引継ぎを依頼"
          },
          lifeGoal: {
            id: "oripathy-research",
            action: "compromise",
            note: "研究協力を終え、生活上の別の優先事項へ移る"
          },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "sr_rhodes_reapplication",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年", "壮年"],
    ge: { age: 18 },
    le: { age: 58 },
    cd: 6,
    w: 0.24,
    show: s => {
      const a = s.lifeRecord?.affiliations?.find(x => x.id === "rhodes-employment");
      return (
        a?.status === "outside" &&
        s.year - (a.lastChangedYear ?? s.year) >= 3 &&
        !$terraData.srOnStaff(s) &&
        !s.fl?.detained &&
        !s.fl?.segregated
      );
    },
    t: "数年前に応募して縁がなかったロドスから、別の部署で人手を募っているという知らせが届いた。あの頃から新しく覚えた仕事もいくつかある。もう一度だけ挑んでみるか、夜の机で封筒を見つめた。",
    c: [
      $terraData.K("この数年で身につけた仕事を書き添えて再応募する", {}, [
        1,
        "以前の控えを引っ張り出し、今の職場で覚えた手順や扱える道具を書き足して投函した。返事を待つあいだも、翌朝になればいつも通り仕事場へ向かった。",
        {
          lifeAffiliation: {
            id: "rhodes-employment",
            title: "ロドスへの雇用照会",
            kind: "employment-application",
            action: "contact",
            role: "再応募・職務条件を確認中"
          },
          k: 1,
          p: 1
        }
      ]),
      $terraData.K("今の仕事や家族との暮らしを大切にする", {}, [
        1,
        "案内状を封筒へ戻し、今回は見送ることにした。あのとき不採用になった悔しさも、その後に今の場所で積み重ねてきた日々も、どちらも自分の暮らしの一部になっていた。",
        { p: 1 }
      ])
    ]
  });

  for (const id of [
    "life_reunion_reorg_review",
    "life_reunion_reorg_tension",
    "life_reunion_reorg_crisis_review",
    "life_reunion_reorg_exit_legacy"
  ]) {
    const e = $terraData.EV.find(row => row.id === id);
    if (id === "life_reunion_reorg_review" || id === "life_reunion_reorg_exit_legacy") e.after = null;
    if (id === "life_reunion_reorg_tension") e.after = { id: "life_reunion_reorg_review", min: 1 };
    // An internal conflict must actually be recorded before a resolution can appear.
  }

  $define(
    "srAfterwar",
    $terraData.EV.find(e => e.id === "life_londinium_aid_afterwar"),
    false
  );

  if ($terraData.srAfterwar) $terraData.srAfterwar.after = null;

  $define(
    "srReunionImpact",
    $terraData.EV.find(e => e.id === "life_reunion_order_conflict")?.c?.[1]?.o?.[0]?.[2]?.regionalImpact,
    false
  );

  if ($terraData.srReunionImpact) delete $terraData.srReunionImpact.region;

  $define(
    "srStudent",
    $terraData.EV.find(e => e.id === "life_ursus_school_aid"),
    false
  );

  if ($terraData.srStudent && !$terraData.srStudent.need.includes("都市:チェルノボーグ"))
    $terraData.srStudent.need.push("都市:チェルノボーグ");

  $define(
    "srReunion",
    $terraData.EV.find(e => e.id === "life_reunion_local_entry"),
    false
  );

  $define("srLocalAid", $terraData.srReunion.c[0].o[0][2].regionalImpact, false);

  if ($terraData.srLocalAid) $terraData.srLocalAid.entity = "地域の感染者と避難家族";

  $terraData.srReunion.t =
    "チェルノボーグの騒乱と龍門への影響が伝わり、感染者支援を求める連絡網ができた。レユニオンと関わりのある相手から物資運びを頼まれ、その後、武装した活動への参加も持ちかけられた。";
});
