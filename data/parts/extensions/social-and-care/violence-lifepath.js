// V01-V05: violence is recorded only after a specific statement or a lived scene.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/violence-lifepath"
)(function ($terraData) {
  "use strict";
  const formationRefs = ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_SOCIAL_ATTITUDES"],
    sceneRefs = [...formationRefs, "SRC_TERRA_FAMILY", "SRC_VIOLENCE_LIFEPATH_MODEL"],
    action = (fields) => ({ violenceAction: fields }),
    choice = (label, result, effects = {}) => $terraData.K(label, {}, [1, result, effects]),
    hasEndorsement = (s, sourceEventId) => (s.violenceState?.formationHistory || [])
      .find(row => row.sourceEventId === sourceEventId && row.targetGroup === "infected" && row.behavior === "endorse"),
    homicideDue = s => violenceNextSceneAt(s, "infected-market-assault"),
    caseDue = (s, type) => violenceNextLegalReview(s, type),
    releaseDue = (s, type) => violenceNextSentenceRelease(s, type),
    caseReadyHere = (s, type, status, dateKey) => (s.violenceState?.proceedings || []).some(row => {
      const due = row?.[dateKey];
      return row.caseType === type && row.status === status && row.jurisdiction === s.res?.n &&
        Number.isInteger(due?.year) && Number.isInteger(due?.month) &&
        due.year * 12 + due.month <= s.year * 12 + s.mo;
    });

  $terraData.EV.push(
    {
      id: "violence_infected_expulsion_speech",
      conf: "S", references: formationRefs, once: true, cd: 99, w: 0.055,
      st: ["青年", "壮年"], ge: { age: 18 },
      show: s => s.res?.n === "クルビア" && !(s.violenceState?.formationHistory || []).some(row => row.sourceEventId === "violence_infected_expulsion_speech"),
      t: "市場の掲示板に、感染者を街から追い出せと訴える集会の案内が貼られていた。演説者は「抵抗する者は力ずくで追い出せ」と声を張り、集まった人々へ賛同を求めた。",
      c: [
        choice("演説に賛同し、感染者を追い出せと声を上げる", "演説者の隣に立ち、感染者を追い出せと声を張った。", action({
          action: "record-belief", targetGroup: "infected", behavior: "endorse", delta: 30,
          evidenceId: "public-expulsion-endorsement", basis: "本人が集会で排除を公言した", audience: "public"
        })),
        choice("その言い分に反対し、集会を離れる", "感染者を追い出せという声に反対し、集会の輪から離れた。", action({
          action: "record-belief", targetGroup: "infected", behavior: "reject", delta: 0,
          evidenceId: "public-expulsion-rejection", basis: "本人が集会で排除の主張を拒んだ", audience: "public"
        })),
        choice("話を聞くだけにして、何も言わず帰る", "演説を聞いたが、賛否を口にせず市場へ戻った。", action({
          action: "record-belief", targetGroup: "infected", behavior: "hear", delta: 0,
          evidenceId: "public-expulsion-heard", basis: "演説をその場で聞いた", audience: "present"
        }))
      ]
    },
    {
      id: "violence_infected_expulsion_meeting",
      conf: "S", references: formationRefs, once: true, cd: 99, w: 0.035,
      st: ["青年", "壮年"], ge: { age: 18 },
      after: { id: "violence_infected_expulsion_speech", min: 1, choice: 0, outcome: 0 },
      show: s => s.res?.n === "クルビア" && hasEndorsement(s, "violence_infected_expulsion_speech")?.region === s.res?.n &&
        !(s.violenceState?.formationHistory || []).some(row => row.sourceEventId === "violence_infected_expulsion_meeting"),
      t: "翌年、また同じ街角に人が集まった。演説者は「抵抗する感染者は力ずくで追い出せ」と声を張り、周囲へ唱和を促している。",
      c: [
        choice("集会に加わり、感染者を追い出せと唱和する", "集会の列に加わり、感染者を街から追い出せと繰り返した。", action({
          action: "record-belief", targetGroup: "infected", behavior: "endorse", delta: 30,
          evidenceId: "second-expulsion-endorsement", basis: "二度目の集会で排除を支持した", audience: "public"
        })),
        choice("演説に加わらず、帰路につく", "演説を聞き流し、唱和には加わらず帰った。", action({
          action: "record-belief", targetGroup: "infected", behavior: "leave-group", delta: 0,
          evidenceId: "second-expulsion-departure", basis: "二度目の集会を離れた", audience: "present"
        }))
      ]
    },
    {
      id: "violence_infected_market_assault",
      conf: "S", references: sceneRefs, once: true, cd: 99, w: 0.035,
      st: ["青年", "壮年"], ge: { age: 18 },
      after: { id: "violence_infected_expulsion_meeting", min: 1, choice: 0, outcome: 0 },
      show: s => s.res?.n === "クルビア" && hasEndorsement(s, "violence_infected_expulsion_meeting")?.region === s.res?.n &&
        !!s.sp?.id && spouseLivesWithProtagonist(s) && !violenceLatestIncidentForEvent(s, "violence_infected_market_assault"),
      t: "市場の路地で、腕に結晶の見える感染者が人垣に囲まれていた。一緒に買い物へ出た配偶者が隣にいる。衛士は路地の入口で人々を止めていたが、男は壁際へ押しやられている。",
      c: [
        choice("人垣に加わり、感染者の肩を殴る", "男の肩を殴ると、そばにいた人々が二人を引き離した。男は肩を痛め、救護員に付き添われて診療所へ向かった。配偶者は声もかけず、路地の外へ出た。", action({
          action: "resolve-scene", scenarioId: "infected-market-assault", kind: "assault", context: "civilian",
          decision: "joined-expulsion-assault", outcome: "injured", targetGroup: "infected",
          victimRef: { kind: "anonymous-person", localOrdinal: 1 },
          witnesses: [{ kind: "family-role", role: "spouse" }],
          evidenceIds: ["visible-oripathy-signs", "direct-assault", "scene-observed-injury", "medical-help-arrived"],
          followupAfterMonths: 1
        })),
        choice("衛士に声をかけ、男を路地から連れ出す", "衛士へ声をかけて人垣を割り、男を診療所へ連れていくのを手伝った。", action({
          action: "resolve-scene", scenarioId: "infected-market-rescue", kind: "rescue", context: "civilian",
          decision: "helped-target-leave", outcome: "escaped", targetGroup: "infected",
          victimRef: { kind: "anonymous-person", localOrdinal: 1 },
          witnesses: [{ kind: "family-role", role: "spouse" }],
          evidenceIds: ["visible-oripathy-signs", "direct-rescue"]
        })),
        choice("配偶者と路地を離れる", "配偶者と人垣を避け、衛士が男を連れ出すのを見届けずに市場を離れた。", action({
          action: "resolve-scene", scenarioId: "infected-market-withdrawal", kind: "refusal", context: "civilian",
          decision: "withdrew-with-spouse", outcome: "unresolved", targetGroup: "infected",
          victimRef: { kind: "anonymous-person", localOrdinal: 1 },
          witnesses: [{ kind: "family-role", role: "spouse" }],
          evidenceIds: ["visible-oripathy-signs", "withdrew-before-contact"]
        }))
      ]
    },
    {
      id: "violence_infected_market_homicide_followup",
      conf: "S", references: sceneRefs, once: true, cd: 99,
      interactionScope: "scheduled", scheduledAt: homicideDue,
      st: ["青年", "壮年"], ge: { age: 18 },
      show: s => s.res?.n === "クルビア" && violenceCivilianHomicideEligible(s, "infected") &&
        !!s.sp?.id && spouseLivesWithProtagonist(s) && !!homicideDue(s) &&
        violenceLatestIncidentForEvent(s, "violence_infected_market_assault")?.region === s.res?.n &&
        s.year * 12 + s.mo - (homicideDue(s).year * 12 + homicideDue(s).month) <= 2,
      t: "数週間後、診療所を出た男は、まだ包帯を巻いた腕をかばいながら市場を歩いていた。あなたと配偶者が路地口へ差しかかると、同じ一団が男を取り囲んだ。巡回衛士が人垣へ駆け寄る。",
      c: [
        choice("衛士に声をかけ、男を人垣から連れ出す", "衛士とともに人垣を割り、男を路地から連れ出した。配偶者は男を診療所まで送るのを手伝った。", action({
          action: "resolve-scene", scenarioId: "infected-market-assault", kind: "rescue", context: "civilian",
          decision: "intervened-and-rescued", outcome: "escaped", targetGroup: "infected",
          victimRef: { kind: "incident-victim", sourceEventId: "violence_infected_market_assault", localOrdinal: 1 },
          witnesses: [{ kind: "family-role", role: "spouse" }],
          evidenceIds: ["repeat-targeting", "direct-rescue"]
        })),
        choice("配偶者とその場を離れる", "衛士が人垣を止める声を背に、配偶者と市場の出口へ向かった。男のその後は見届けなかった。", action({
          action: "resolve-scene", scenarioId: "infected-market-assault", kind: "refusal", context: "civilian",
          decision: "withdrew-from-repeat-assault", outcome: "unresolved", targetGroup: "infected",
          victimRef: { kind: "incident-victim", sourceEventId: "violence_infected_market_assault", localOrdinal: 1 },
          witnesses: [{ kind: "family-role", role: "spouse" }],
          evidenceIds: ["repeat-targeting", "withdrew-before-contact"]
        })),
        $terraData.K("石を拾い、男の頭を狙って振り下ろす", {},
          [0.25, "石が男の頭に当たった。駆けつけた救護員は男の死亡を確認し、衛士はその場であなたを押さえた。配偶者はあなたに近づかず、衛士と詰所へ向かった。", action({
            action: "resolve-scene", scenarioId: "infected-market-homicide", kind: "intentional-killing", context: "civilian",
            decision: "struck-to-kill", outcome: "confirmed-death", targetGroup: "infected",
            victimRef: { kind: "incident-victim", sourceEventId: "violence_infected_market_assault", localOrdinal: 1 },
            witnesses: [{ kind: "family-role", role: "spouse" }], deathEvidence: "confirmed",
            deathEvidenceId: "medical-death-confirmation",
            authorityAction: "detain-and-investigate", witnessNorm: "ordinary-civilian-taboo",
            evidenceIds: ["repeat-targeting", "direct-lethal-act", "medical-death-confirmation", "authority-witness"]
          })],
          [0.72, "石は男の頭を割ったが、救護員は命を取り留めたと告げた。衛士はあなたを押さえ、配偶者は詰所で見たことを話した。", action({
            action: "resolve-scene", scenarioId: "infected-market-homicide", kind: "intentional-killing", context: "civilian",
            decision: "struck-to-kill", outcome: "injured", targetGroup: "infected",
            victimRef: { kind: "incident-victim", sourceEventId: "violence_infected_market_assault", localOrdinal: 1 },
            witnesses: [{ kind: "family-role", role: "spouse" }],
            authorityAction: "detain-and-investigate", witnessNorm: "ordinary-civilian-taboo",
            evidenceIds: ["repeat-targeting", "direct-lethal-act", "medical-survival-confirmation", "authority-witness"]
          })],
            [1, "衛士があなたの腕を押さえ、石は地面に落ちた。男は身をかわし、配偶者は衛士の後ろへ下がった。衛士はあなたを詰所へ連れて行った。", action({
            action: "resolve-scene", scenarioId: "infected-market-homicide", kind: "intentional-killing", context: "civilian",
            decision: "struck-to-kill", outcome: "prevented", targetGroup: "infected",
            victimRef: { kind: "incident-victim", sourceEventId: "violence_infected_market_assault", localOrdinal: 1 },
            witnesses: [{ kind: "family-role", role: "spouse" }],
            authorityAction: "detain-and-investigate", witnessNorm: "ordinary-civilian-taboo",
            evidenceIds: ["repeat-targeting", "attack-prevented", "authority-witness"]
          })]
        )
      ]
    },
    {
      id: "violence_civilian_homicide_adjudication",
      conf: "S", references: sceneRefs, cd: 0, interactionScope: "scheduled", inConfinement: true,
      scheduledAt: s => caseDue(s, "civilian-homicide"),
      show: s => !!s.fl?.detained && caseReadyHere(s, "civilian-homicide", "investigation-open", "reviewAt"),
      st: ["青年", "壮年", "老年"], ge: { age: 18 }, w: 1,
      t: "詰所に留め置かれて三か月。衛士と配偶者の証言、救護員の死亡確認が法廷に提出され、裁判官が処分を言い渡した。",
      c: [choice("判決を聞き、処分を受ける", "裁判所は殺人罪を認定し、三年間の収容と8万龍門幣の罰金を言い渡した。勤め先を失い、出所の日が決まった。", {
        violenceAction: { action: "adjudicate-case", incidentId: "$due-violence-case", caseType: "civilian-homicide" }
      })]
    },
    {
      id: "violence_civilian_attempted_homicide_adjudication",
      conf: "S", references: sceneRefs, cd: 0, interactionScope: "scheduled", inConfinement: true,
      scheduledAt: s => caseDue(s, "attempted-civilian-homicide"),
      show: s => !!s.fl?.detained && caseReadyHere(s, "attempted-civilian-homicide", "investigation-open", "reviewAt"),
      st: ["青年", "壮年", "老年"], ge: { age: 18 }, w: 1,
      t: "取り押さえられて三か月。衛士と配偶者の証言が法廷に提出され、石を振り下ろした行為への判決が告げられる。",
      c: [choice("判決を聞き、処分を受ける", "裁判所は殺人未遂罪を認定し、二年間の収容と5万龍門幣の罰金を言い渡した。{violenceSentenceEmployment}出所の日が決まった。", {
        violenceAction: { action: "adjudicate-case", incidentId: "$due-violence-case", caseType: "attempted-civilian-homicide" }
      })]
    },
    {
      id: "violence_civilian_assault_adjudication",
      conf: "S", references: sceneRefs, cd: 0, interactionScope: "scheduled", inConfinement: true,
      scheduledAt: s => caseDue(s, "serious-civilian-assault"),
      show: s => !!s.fl?.detained && caseReadyHere(s, "serious-civilian-assault", "investigation-open", "reviewAt"),
      st: ["青年", "壮年", "老年"], ge: { age: 18 }, w: 1,
      t: "詰所に留め置かれて三か月。衛士と配偶者の証言、治療を受けた男の記録が法廷に提出され、裁判官が処分を言い渡した。",
      c: [choice("判決を聞き、処分を受ける", "裁判所は傷害罪を認定し、一年間の収容と2万龍門幣の罰金を言い渡した。勤め先を失った。", {
        violenceAction: { action: "adjudicate-case", incidentId: "$due-violence-case", caseType: "serious-civilian-assault" }
      })]
    },
    {
      id: "violence_civilian_homicide_release",
      conf: "S", references: sceneRefs, cd: 0, interactionScope: "scheduled", inConfinement: true,
      scheduledAt: s => releaseDue(s, "civilian-homicide"),
      show: s => !!s.fl?.detained && caseReadyHere(s, "civilian-homicide", "convicted", "releaseAt"),
      st: ["青年", "壮年", "老年"], ge: { age: 18 }, w: 1,
      t: "三年間の収容を終え、門の外へ出た。手元の金と戻れる場所を確かめ、翌日からの暮らしを考え始めた。",
      c: [choice("街へ戻り、暮らしを立て直す", "出所の手続きを終え、住まいと仕事を探し始めた。", {
        violenceAction: { action: "complete-sentence", incidentId: "$due-violence-release", caseType: "civilian-homicide" }
      })]
    },
    {
      id: "violence_civilian_attempted_homicide_release",
      conf: "S", references: sceneRefs, cd: 0, interactionScope: "scheduled", inConfinement: true,
      scheduledAt: s => releaseDue(s, "attempted-civilian-homicide"),
      show: s => !!s.fl?.detained && caseReadyHere(s, "attempted-civilian-homicide", "convicted", "releaseAt"),
      st: ["青年", "壮年", "老年"], ge: { age: 18 }, w: 1,
      t: "二年の収容を終え、門の外へ出た。石を振り下ろした相手は死ななかった。目撃した配偶者との日常も戻らず、これからの暮らしを考えることになった。",
      c: [choice("街へ戻り、暮らしを立て直す", "出所の手続きを終えた。手元に残った金を確かめ、次の仕事を探し始めた。", {
        violenceAction: { action: "complete-sentence", incidentId: "$due-violence-release", caseType: "attempted-civilian-homicide" }
      })]
    },
    {
      id: "violence_civilian_assault_release",
      conf: "S", references: sceneRefs, cd: 0, interactionScope: "scheduled", inConfinement: true,
      scheduledAt: s => releaseDue(s, "serious-civilian-assault"),
      show: s => !!s.fl?.detained && caseReadyHere(s, "serious-civilian-assault", "convicted", "releaseAt"),
      st: ["青年", "壮年", "老年"], ge: { age: 18 }, w: 1,
      t: "一年の収容を終え、門の外へ出た。石を振り下ろした相手は生きていた。配偶者との関係も、あの日から止まったままだった。",
      c: [choice("街へ戻り、仕事を探す", "出所の手続きを終えた。新しい仕事を探しながら、配偶者との関係にも自分で向き合うことになった。", {
        violenceAction: { action: "complete-sentence", incidentId: "$due-violence-release", caseType: "serious-civilian-assault" }
      })]
    }
  );
});
