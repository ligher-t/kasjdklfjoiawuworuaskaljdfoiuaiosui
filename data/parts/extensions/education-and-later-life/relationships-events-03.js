// extensions/education-and-later-life/relationships-events-03: construction fragment; evaluation order is declared by data/extensions/education-and-later-life.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/education-and-later-life",
  "extensions/education-and-later-life/relationships-events-03"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  const familyRecipientAvailable = (s, kind) =>
    $rules.relationships.closeInfoAvailable(s, kind) && !$rules.relationships.closeInfoKnown(s, kind);
  const familyDisclosureAvailable = s =>
    !!s.fl?.dg &&
    (familyRecipientAvailable(s, "father") ||
      familyRecipientAvailable(s, "mother") ||
      familyRecipientAvailable(s, "spouse") ||
      familyRecipientAvailable(s, "friend"));
  const workplaceDisclosureAvailable = s => !!s.fl?.dg && s.job > 0 && !s.fl?.infection_work_disclosed;
  return [
    {
      id: "infection_family_disclosure_choice",
      conf: "S",
      references: [
        "SRC_ORIPATHY_SOCIAL",
        "SRC_ORIPATHY_EXPOSURE",
        "SRC_TERRA_FAMILY",
        "SRC_V88_INFO_BOUNDARIES"
      ],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["感染診断済"],
      show: familyDisclosureAvailable,
      once: true,
      w: 0.325,
      t: [
        {
          when: "地域の感染者圧力が強い",
          t: "鉱石病の診断書を、人目につかないよう鞄の底へ押し込んだ。近所では病気がバレて下宿を追い出された人もいる。これから通院を続けるのに、誰かひとりでも打ち明けて頼れる相手がいるか唇を噛んだ。"
        },
        {
          when: "地域の感染者圧力が比較的弱い",
          t: "医師から診断書を受け取り、次の診察日を胸に刻んだ。誰にこの病のことを打ち明けるか、一番信頼できる人の顔を思い浮かべた。"
        },
        { t: "鉱石病と記された紙を見つめながら、診療所を出た。身近な人たちにどう切り出せばいいのか、言葉が見つからないまま家路を歩いた。" }
      ],
      c: [
        $terraData.K(
          "父にだけ診断を伝え、通院の相談をする",
          { show: s => familyRecipientAvailable(s, "father"), pw: [1, { when: "感染者への偏見に疑問", x: 1.25 }, { when: "感染者偏見", x: 0.65 }, { when: "地域の感染者圧力が強い", x: 0.8 }] },
          [
            1,
            "二人きりの時に父へ病名を打ち明け、検査の結果を見せた。父はしばらく黙り込んだあと、次の診察日に付き添えるか都合を見てくれた。",
            {
              rl: 4,
              p: 2,
              fl: { infection_family_disclosed: 1, infection_family_recipient_father: 1, hid: 1 },
              closeKnowledgeAction: { kind: "father", action: "disclose" }
            }
          ]
        ),
        $terraData.K(
          "母にだけ診断を伝え、通院の相談をする",
          { show: s => familyRecipientAvailable(s, "mother"), pw: [1, { when: "感染者への偏見に疑問", x: 1.25 }, { when: "感染者偏見", x: 0.65 }, { when: "地域の感染者圧力が強い", x: 0.8 }] },
          [
            1,
            "二人きりの時に母へ病名を打ち明け、検査の結果を見せた。母は息を呑んだあと、次の診察日に一緒に行けないか考えてくれた。",
            {
              rl: 4,
              p: 2,
              fl: { infection_family_disclosed: 1, infection_family_recipient_mother: 1, hid: 1 },
              closeKnowledgeAction: { kind: "mother", action: "disclose" }
            }
          ]
        ),
        $terraData.K(
          "一緒に暮らす配偶者にだけ本当のことを打ち明ける",
          { show: s => familyRecipientAvailable(s, "spouse"), pw: [1, { when: "感染者への偏見に疑問", x: 1.25 }, { when: "感染者偏見", x: 0.65 }, { when: "地域の感染者圧力が強い", x: 0.8 }] },
          [
            1,
            "夜、同居する配偶者に診断のことを打ち明け、これからの通院や暮らしをどうしていくか静かに話し合った。",
            {
              rl: 4,
              p: 2,
              fl: { infection_family_disclosed: 1, infection_family_recipient_spouse: 1, hid: 1 },
              closeKnowledgeAction: { kind: "spouse", action: "disclose" }
            }
          ]
        ),
        $terraData.K(
          "親しい友人にだけ診断を伝え、相談する",
          { show: s => familyRecipientAvailable(s, "friend"), pw: [1, { when: "感染者への偏見に疑問", x: 1.25 }, { when: "感染者偏見", x: 0.65 }] },
          [
            1,
            "親しい友人を呼び出して病気のことを打ち明けた。誰にも言わずに聞いてくれた友人の存在が、張り詰めた心を少しだけほどいてくれた。",
            { rl: 4, p: 2, fl: { hid: 1 }, closeKnowledgeAction: { kind: "friend", action: "disclose" } }
          ]
        ),
        $terraData.K(
          "家族にも友人にも黙ったまま、ひとりで通院を続ける",
          { pw: [1, { when: "地域の感染者圧力が強い", x: 1.6 }, { when: "感染者偏見", x: 1.3 }] },
          [
            1,
            "身近な人にも病名は伏せておくことに決めた。診察の日が近づくたび、どうやって外出の口実を作るか頭を悩ませた。",
            { fl: { hid: 1 }, p: -2 }
          ]
        )
      ]
    },
    {
      id: "infection_school_disclosure",
      conf: "S",
      show: s => !s.educationPath?.offeringId,
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_SOCIAL_ATTITUDES", "SRC_V88_INFO_BOUNDARIES"],
      st: ["児童", "少年"],
      need: ["感染診断済", "就学中"],
      ge: { age: 10 },
      once: true,
      w: 0.2,
          t: "鉱石病の検査結果が出た。次の診察日は学校の授業を休まなければならない。担任の教師に本当のことを話すか、体調不良とだけ言ってごまかすか迷った。",
      c: [
        $terraData.K("担任の教師にだけ病名を打ち明け、通院で休むことを相談する", { pw: [1, { when: "感染者への偏見に疑問", x: 1.3 }, { when: "感染者偏見", x: 0.65 }, { when: "地域の感染者圧力が強い", x: 0.75 }] }, [
          1,
          "放課後に担任の教師へ鉱石病のことを打ち明け、診察の日は授業を休むと伝えた。",
          { infectionAwarenessAction: { subject: "self", audience: "school-contact", certainty: "confirmed", source: "self-disclosure", consent: "voluntary", recipientRef: "current-teacher" }, fl: { hid: 1 }, p: -1 }
        ]),
        $terraData.K("病名は口にせず、病院へ行くから休むとだけ伝える", { pw: [1, { when: "感染者偏見", x: 1.2 }, { when: "地域の感染者圧力が強い", x: 1.2 }] }, [
          1,
          "何の病気かは伏せたまま、通院で休むとだけ教師に伝えた。それ以上突っ込まれないよう、すぐに職員室を出た。",
          { fl: { hid: 1 }, p: -1 }
        ]),
        $terraData.K("親から学校へ休む連絡だけ入れてもらい、自分からは何も言わない", { pw: [1, { when: "感染者偏見", x: 1.25 }, { when: "地域の感染者圧力が強い", x: 1.25 }] }, [
          1,
          "家の人に頼んで、学校へは当たり障りのない理由で欠席を伝えてもらった。休んだ日の遅れは、あとで黒板の写しを見せてもらって埋めた。",
          { fl: { hid: 1 }, p: -2 }
        ])
      ]
    },
    {
      id: "infection_visible_crystal_question",
      conf: "S",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_SOCIAL_ATTITUDES", "SRC_V88_INFO_BOUNDARIES"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["感染診断済"],
      ge: { age: 14 },
      show: s => (s.ob || 0) >= 55,
      once: true,
      w: [
        0.2,
        { when: "地域の感染者圧力が強い", x: 1.8 },
        { when: "地域の感染者圧力が比較的弱い", x: 0.75 },
        { when: "感染者への偏見に疑問", x: 0.75 }
      ],
      t: [
        {
          when: "地域の感染者圧力が強い",
          t: "診療所の待合室で、ふとした拍子に袖口から黒い結晶がのぞいた。向かいに座っていた客がぎょっとして、部屋中に響く声で「おい、鉱石病じゃないのか」と声を上げた。後ろに並んでいた客がさっと離れ、受付係も固まってこちらを見ている。"
        },
        {
          when: "地域の感染者圧力が比較的弱い",
          t: "診療所の待合室で、袖口からのぞいた結晶に気づいた隣の人から、小声で「鉱石病なのかい」と尋ねられた。受付係は特に顔色も変えず、順番通りに番号札を差し出している。"
        },
        {
          t: "診療所の待合室で、袖口からのぞいた結晶を見た客に、周りにも聞こえる声で「鉱石病か」と尋ねられた。待合室の視線が一斉に集まる中、どう応じるか迷った。"
        }
      ],
      c: [
        $terraData.K("隠さずにそうだと認め、受付でこれからの通院を相談する", { pw: [1, { when: "感染者への偏見に疑問", x: 1.35 }, { when: "感染者偏見", x: 0.6 }] }, [
          1,
          "鉱石病だと堂々と認め、周囲の視線を振り切って受付で次の診察の予約を取った。",
          { infectionAwarenessAction: { subject: "self", audience: "clinic-waiting-room", certainty: "confirmed", source: "self-disclosure", consent: "voluntary", recipientRef: "current-clinic-waiting-room" }, p: -1 }
        ]),
        $terraData.K("袖口を引き下ろし、無言のまま自分の順番を待つ", { pw: [1, { when: "感染者偏見", x: 1.25 }, { when: "地域の感染者圧力が強い", x: 1.2 }] }, [
          1,
          "問いかけには答えず、黙って袖口を隠したまま名前が呼ばれるのを待った。",
          { infectionAwarenessAction: { subject: "self", audience: "clinic-waiting-room", certainty: "suspected", source: "direct-question", consent: "nonconsensual", subjectMatch: "unclear", recipientRef: "current-clinic-waiting-room" }, fl: { hid: 1 }, p: -2 }
        ]),
        $terraData.K("いたたまれずに待合室を出て、別の時間に来られないか尋ねる", { pw: [1, { when: "地域の感染者圧力が強い", x: 1.35 }, { when: "感染者偏見", x: 1.2 }] }, [
          1,
          "突き刺さるような視線から逃れるように待合室を出て、人気のない時間に診てもらえないか受付に頼み込んだ。",
          { infectionAwarenessAction: { subject: "self", audience: "clinic-waiting-room", certainty: "suspected", source: "direct-question", consent: "nonconsensual", subjectMatch: "unclear", recipientRef: "current-clinic-waiting-room" }, fl: { hid: 1 }, p: -3 }
        ])
      ]
    },
    {
      id: "infection_diagnosis_disclosure_scope",
      conf: "S",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_SOCIAL_ATTITUDES", "SRC_V88_INFO_BOUNDARIES"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["感染診断済", "診療先へ通いやすい"],
      ge: { age: 14 },
      once: true,
      w: 0.18,
      t: "通っている診療所の片隅で、感染者とその家族が集まる互助の集まりの案内を見かけた。同じ病を抱える人たちに混じって助けを求めるか、病名は伏せたまま薬代や通院の相談だけするか考えた。",
      c: [
        $terraData.K("互助の集まりに顔を出し、自分も感染者だと打ち明ける", { pw: [1, { when: "感染者への偏見に疑問", x: 1.35 }, { when: "感染者偏見", x: 0.55 }, { when: "地域の感染者圧力が強い", x: 0.75 }] }, [
          1,
          "集まりの輪に入り、自分も鉱石病だと打ち明けて悩みを語り合った。ここから外へ話が漏れないか一抹の不安はあったが、ひとりではないと思えた。",
          { infectionAwarenessAction: { subject: "self", audience: "community-meeting", certainty: "confirmed", source: "self-disclosure", consent: "voluntary", recipientRef: "current-clinic-meeting" }, fl: { hid: 1 }, p: 1 }
        ]),
        $terraData.K("診療所の助け合い掲示板に名前を出して支援を募る", { pw: [1, { when: "感染者への偏見に疑問", x: 1.4 }, { when: "感染者偏見", x: 0.35 }, { when: "地域の感染者圧力が強い", x: 0.6 }] }, [
          1,
          "もう隠すまいと腹を括り、診療所の掲示板に名前と病状を書いて助けを募った。誰の目に触れるかは分からない。",
          { infectionAwarenessAction: { subject: "self", audience: "public", certainty: "published", source: "self-publication", consent: "voluntary", subjectMatch: "unclear", recipientRef: "current-clinic-notice-board" }, fl: { hid: 0 }, p: -1 }
        ]),
        $terraData.K("集まりには入らず、窓口で薬代や足代の相談だけする", { pw: [1, { when: "感染者偏見", x: 1.25 }, { when: "地域の感染者圧力が強い", x: 1.2 }] }, [
          1,
          "人前では病名を伏せたまま、どうすれば安く通院を続けられるかだけ相談して帰った。",
          { fl: { hid: 1 }, p: -1 }
        ])
      ]
    },
    {
      id: "infection_workplace_disclosure",
      conf: "S",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_ORI_FIELD_RECORD", "SRC_ORI_GAME_MODEL_V3", "SRC_V88_INFO_BOUNDARIES"],
      st: ["青年", "壮年", "老年"],
      need: ["感染診断済"],
      show: workplaceDisclosureAvailable,
      once: true,
      w: 0.325,
      t: [
        {
          when: s => !!s.fl?.infection_family_disclosed,
          t: "家では病気のことを知っている者がいるが、平日に通院を続けるには職場にも理由を話して休みをもらわなければならない。ただ、上司に話せば職場中に広まるかもしれないと思うと足が重かった。"
        },
        {
          t: "治療を続けるには、どうしても平日に仕事を抜けて診療所へ通わなければならない。職場に鉱石病だと打ち明ければどんな扱いを受けるか分からず、扉の前で深呼吸をした。"
        }
      ],
      c: [
        $terraData.K(
          "雇用先へ診断を伝え、通院日の休みを相談する",
          {},
          [
            0.55,
            "上司は顔を曇らせながらも事情を聞き入れ、まずはその日の休みは認められた。これからもシフトの都合をつけながら通院を続けられそうだ。",
            {
              fl: { hid: 1, infection_work_disclosed: 1 },
              infectionWorkplaceAction: { action: "disclose", response: "leave-approved-once" },
              rl: 1,
              p: -2
            }
          ],
          [
            1,
            "上司は渋い顔で話を聞いただけで、通院の休みを認めるかどうかすら曖昧に濁された。誰にまで話が回るのかも分からず、胃のあたりが重くなった。",
            {
              fl: { hid: 1, infection_work_disclosed: 1 },
              infectionWorkplaceAction: { action: "disclose", response: "unresolved" },
              p: -4,
              rl: -2
            }
          ]
        )
      ]
    },
    {
      id: "infection_workplace_review",
      conf: "S",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_ORI_FIELD_RECORD", "SRC_ORI_GAME_MODEL_V3", "SRC_V88_INFO_BOUNDARIES"],
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.72,
      show: s =>
        s.infectionWorkplace?.status === "awaiting-review" &&
        Number.isInteger(s.infectionWorkplace.reviewDueYear) &&
        s.infectionWorkplace.reviewDueYear <= s.year,
      t: s => {
        const record = s.infectionWorkplace,
          elapsed=Number.isInteger(record?.disclosedYear) && record.disclosedYear<=s.year ?
            s.year-record.disclosedYear : null,
          time=elapsed===null ? "職場に病名を打ち明けたあと、" :
            elapsed===0 ? "今年、職場に病名を打ち明けた。その後、" :
            `職場に病名を打ち明けてから${elapsed}年が経った。`;
        if (s.job === record.disclosedJobId)
          return time+"これからも通院と仕事をどう両立していくか、職場と改めて掛け合う時期が来た。";
        if (s.job > 0)
          return time+"今は別の職場に移り、体調や診察日に合わせてなんとか働く時間をやりくりしている。";
          return time+"今はあの職場を離れている。通院を続けながら、無理なく働ける次の仕事を探すか迷っていた。";
      },
      c: [
        $terraData.K(
          "今の持ち場のまま、診察の日だけ休みを願い出る",
          {
            show: s =>
              s.job > 0 &&
              s.job === s.infectionWorkplace?.disclosedJobId &&
              (!s.infectionWorkplace?.siteId || s.workContract?.siteId === s.infectionWorkplace.siteId)
          },
          [
            0.55,
            "次の診察日を伝えると、嫌な顔もされずに休みが通った。ほっと息をつき、自分の持ち場へ戻った。",
            { infectionWorkplaceAction: { action: "review", outcome: "leave-approved-again" }, rl: 1 }
          ],
          [
            1,
            "休みの申し出はいい顔をされず、返事を濁された。シフト表とにらめっこしながら、なんとか医者へ行ける隙間を探した。",
            { infectionWorkplaceAction: { action: "review", outcome: "leave-unresolved" }, p: -2 }
          ]
        ),
        $terraData.K(
          "負担の大きい工程から外れる配置を相談する",
          {
            show: s =>
              s.job > 0 &&
              s.job === s.infectionWorkplace?.disclosedJobId &&
              ($terraData.J[s.job]?.ex || 1) > 1.1 &&
              !!s.workContract &&
              s.workContract.status === "active" &&
              s.workContract.siteId === s.infectionWorkplace?.siteId &&
              s.workContract.assignment === "usual"
          },
          [
            0.5,
            "掛け合った末に配置換えが通り、粉塵や力仕事の少ない持ち場へ移ることができた。",
            {
              workContractAction: { action: "assignment", result: "approved" },
              infectionWorkplaceAction: { action: "review", outcome: "assignment-approved" },
              exposureAction: "adjust-assignment",
              rl: 1
            }
          ],
          [
            1,
            "特別扱いはできないと配置換えを断られた。痛む体をだましだまし動かしながら、通院できる日を探した。",
            {
              workContractAction: { action: "assignment", result: "declined" },
              infectionWorkplaceAction: { action: "review", outcome: "assignment-declined" },
              p: -2
            }
          ]
        ),
        $terraData.K(
          "勤務時間を短くしてもらえないか相談する",
          {
            show: s =>
              s.job > 0 &&
              s.job === s.infectionWorkplace?.disclosedJobId &&
              !!s.workContract &&
              s.workContract.status === "active" &&
              s.workContract.siteId === s.infectionWorkplace?.siteId
          },
          [
            0.45,
            "毎日の勤務時間を短くしてもらえた。その分給金は減るが、体を壊さずに通院を続けられる道を選んだ。",
            {
              workContractAction: { action: "hours", result: "approved" },
              infectionWorkplaceAction: { action: "review", outcome: "hours-approved" },
              rl: 1,
              p: 1
            }
          ],
          [
            1,
            "決まった時間通り働けないなら困ると突き返された。これ以上ここで働き続けられるか、よその求人も気にかかり始めた。",
            {
              workContractAction: { action: "hours", result: "declined" },
              infectionWorkplaceAction: { action: "review", outcome: "hours-declined" },
              p: -2
            }
          ]
        ),
        $terraData.K(
          "仕事を辞め、受診時間を確保する",
          {
            show: s =>
              s.job > 0 &&
              s.job === s.infectionWorkplace?.disclosedJobId &&
              (!s.infectionWorkplace?.siteId || s.workContract?.siteId === s.infectionWorkplace.siteId)
          },
          [
            1,
            "これ以上無理を重ねられないと退職を申し出た。誰に気兼ねすることなく通院できるが、来月からは稼ぎが途絶える。",
            { job: 0, infectionWorkplaceAction: { action: "review", outcome: "left-by-player" }, p: -4 }
          ]
        )
      ]
    },
    {
      id: "infection_regional_housing_pressure",
      conf: "S",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_SOCIAL_ATTITUDES", "SRC_V88_INFO_BOUNDARIES"],
      st: ["青年", "壮年", "老年"],
      need: ["感染診断済", "住居で感染者圧力が強い", "infection_housing_rumor_current_home"],
      show: s => infectionAwarenessHas(s, "housing-management", { currentPlace: true, includeUnverified: true }),
      after: { id: "infection_neighborhood_rumor_under_concealment", min: 1, max: 10 },
      ban: ["housing_exclusion"],
      once: true,
      w: 0.45,
      t: "建物の管理人がやって来て、「この中に鉱石病の人間がいると苦情が出ている」と切り出した。あなたがそうだとは断言しないまま、露骨に契約更新の条件をつり上げて追い出しにかかってきた。",
      c: [
        $terraData.K(
          "不当な追い出しだと地域の支援所へ駆け込み、間に入ってもらう",
          {},
          [
            0.6,
            "支援所の担当者に事情を話し、大家への申し入れを手伝ってもらった。万が一追い出された時のために、よその空き部屋も目星をつけておいた。",
            { cash: -1e4, rl: 2, cr: 1, fl: { housing_exclusion: 1, discrimination_complaint: 1 } }
          ],
          [
            1,
            "支援所もすぐには動いてくれず、更新の日までにどうなるか分からないままだった。いつ追い出されても困らないよう、別の貸間を探し始めた。",
            { p: -3, fl: { housing_exclusion: 1 } }
          ]
        ),
        $terraData.K(
          "色をつけた保証金を積み増しして、今の部屋に居座る",
          { en: { affordableCash: 1.2e5 }, why: "上乗せされた保証金12万龍門幣を出すと、生活費が足りなくなる" },
          [
            1,
            "12万龍門幣の追加保証金を叩きつけ、管理人を黙らせて部屋に残った。薬代の蓄えは大きく減ったが、通い慣れた職場と診療所を手放さずに済んだ。",
            { cash: -1.2e5, pm: 1, fl: { housing_exclusion: 1 }, p: -2 }
          ]
        ),
        $terraData.K("こんな場所は見限り、別の地域へ引っ越す", { en: { affordableRoute: true }, why: "移動先への運賃を用意できない" }, [
          1,
          "荷物をまとめて旅費を払い、別の地域へ移り住んだ。見知らぬ街で一から部屋と診療所を探し直し、新しい通院路を歩いた。",
          { job: 0, res: 1, fl: { housing_exclusion: 1, sch: 0 }, rl: -2, p: -2 }
        ])
      ]
    }
  ];
});
