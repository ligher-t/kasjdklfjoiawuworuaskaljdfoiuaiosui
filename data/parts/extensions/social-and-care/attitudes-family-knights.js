// extensions/social-and-care/attitudes-family-knights: construction fragment; evaluation order is declared by data/extensions/social-and-care.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/attitudes-family-knights"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $terraData.EV.push(
    {
      id: "attitude_infected_child",
      conf: "S",
      references: ["SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["児童", "少年"],
      ge: { age: 7 },
      le: { age: 13 },
      once: true,
      w: [0.4, { when: "感染者への世間圧力が強い", x: 2 }, { when: "地域の感染者圧力が比較的弱い", x: 0.5 }],
      t: "診療所の軒先で、鉱石病の患者が受付の列から外れるよう言い渡されていた。周りの大人たちは理由も言わず、手で追い払うような仕草をして距離を取っている。",
      c: [
        $terraData.K(
          "周りの大人たちに合わせて、その人から離れる",
          { pw: [1, { when: "気質:慎重", x: 1.5 }, { when: "家計逼迫", x: 1.3 }] },
          [
            1,
            "大人たちの背中に隠れるようにして列から離れた。鉱石病の人はぽつんと受付の端に取り残された。帰り道も、あの人のうつむいた横顔が頭から離れなかった。",
            {
              biasInf: 22,
              fl: { bias_inf_formed: 1 },
              p: -2,
              socialConflictAction: {
                action: "avoid",
                target: "infected",
                context: "clinic-queue-avoidance"
              }
            }
          ]
        ),
        $terraData.K(
          "どうして一緒に並んではいけないのか尋ね、その人の隣に立つ",
          { pw: [1, { when: "気質:社交的", x: 1.4 }, { when: "気質:楽天的", x: 1.2 }] },
          [
            1,
            "「どうして順番を譲らないといけないの」と周りの大人に尋ねた。誰もはっきり答えられず、気まずそうな視線のなかでその人の隣に並んで順番を待った。",
            { biasInf: -4, rl: 3, k: 1, p: 2, fl: { bias_inf_formed: 1, hid_helper: 1 } }
          ]
        )
      ]
    },
    {
      id: "attitude_sarkaz_child",
      conf: "S",
      references: ["SRC_TERRA_SOCIAL_ATTITUDES", "SRC_KAZDEL_LIFE"],
      st: ["児童", "少年"],
      ge: { age: 7 },
      le: { age: 13 },
      once: true,
      w: [
        0.35,
        { when: "種族差別", x: 1.8 },
        { when: "制度差別", x: 1.5 },
        { when: "地域で少数派", x: 1.2 },
        { when: "多種族の交流圏", x: 1.2 }
      ],
      t: "賑わう市場の露店の前で、サルカズの荷運び人が売り物に手を触れたと店主から怒鳴られていた。そばで見ていた大人が「これだからサルカズは油断ならない」と吐き捨てた。",
      c: [
        $terraData.K(
          "大人の言葉をそのまま信じ、サルカズから目をそらす",
          { pw: [1, { when: "気質:慎重", x: 1.5 }, { when: "家計逼迫", x: 1.2 }] },
          [
            1,
            "そばの大人の言葉を鵜呑みにし、恐ろしいものを見るように目をそらして通り過ぎた。家に帰ってからも、その人の顔ではなく頭から生えた角ばかりが思い出された。",
            { biasSar: 22, fl: { bias_sar_formed: 1 }, p: -2 }
          ]
        ),
        $terraData.K(
          "荷運び人本人に、本当は何があったのか聞いてみる",
          { pw: [1, { when: "気質:社交的", x: 1.4 }, { when: "気質:楽天的", x: 1.2 }] },
          [
            1,
            "訳を聞いてみると、頼まれた荷の包みと店先の品を見間違えただけだと分かった。店主はぶつぶつ言いながら品を棚に戻したが、サルカズを疑う周りの空気は消えなかった。",
            { biasSar: -4, rl: 3, k: 1, p: 2, fl: { bias_sar_formed: 1 } }
          ]
        )
      ]
    },
    {
      id: "family_parent_crystal_dust",
      conf: "S",
      references: ["SRC_ORIPATHY_EXPOSURE", "SRC_ORIPATHY_OFFICIAL_OVERVIEW", "SRC_RHODES_MEDICAL"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["感染した親の死後"],
      ban: ["parent_dust_contact"],
      once: true,
      w: 0.7,
      t: "鉱石病に苦しみながら息を引き取った親の遺品を片づけていた。着古した服の縫い目や使い込まれた道具には、黒く光る結晶の欠片と細かい粉がこびりついている。このまま処分するにも家に残すにも、手が止まった。",
      c: [
        $terraData.K(
          "素手のまま遺品を布に包み、一気に片づけてしまう",
          { pw: [1, { when: "source_safety_guidance", x: 0.55 }] },
          [
            0.7,
            "古い衣類を持ち上げた拍子に乾いた黒い粉がふわりと舞い上がり、むせ返りながら息を吸い込んでしまった。数日後、指のささくれの周りに見覚えのある黒い斑点が浮き出て、診療所で鉱石病の感染を告げられた。",
            {
              inf: 1,
              infCause: "感染した親の遺品から舞った源石粉塵を吸い込んだ", infectionRoute: "dust",
              fl: { parent_dust_contact: 1, dg: 1 }
            }
          ],
          [
            1,
            "片づけを終えたあと、手のひらのしわに黒い粉がうっすら残っていた。診療所で検査を受ける金もなく、冷たい水で何度も手をこすり洗いしたが、胸のざわつきは消えなかった。",
            { p: -4, fl: { parent_dust_contact: 1 } }
          ]
        ),
        $terraData.K(
          "濡らした布で慎重に覆い、専門の窓口へ引き取りを頼む",
          { pw: [1, { when: "source_safety_guidance", x: 1.35 }] },
          [
            1,
            "粉が舞わないよう濡れ布で遺品を幾重にも包み、支援窓口に処分を頼んだ。引き取りの日まで、封をした袋を誰も触らない棚の奥へ押し込んだ。",
            { cash: -2e4, p: -2, fl: { parent_dust_contact: 1 } }
          ]
        ),
        $terraData.K(
          "教わった防護の手順を守り、手を触れずに専門の担当者を呼ぶ",
          {
            show: { need: ["source_safety_guidance"] },
            en: { affordableCash: 2e4 },
            why: "移動・相談に使う2万龍門幣を生活費後に用意できない"
          },
          [
            1,
            "以前ロドスの担当者から教わった注意を思い出し、遺品には指一本触れずに部屋の窓を閉め切って連絡を入れた。処置の費用は痛かったが、身を危険にさらさずに済んだ。",
            { cash: -2e4, pm: 1, p: -1, fl: { parent_dust_contact: 1 } }
          ]
        ),
        $terraData.K("捨てることができず、親の形見としてそのまま奥へしまう", {}, [
          1,
          "どうしても親の生きた証を捨てる気になれず、結晶の付着した衣類だけを袋に分け、愛用していた道具は箱に納めて押し入れの奥深くへしまった。",
          { p: 2, fl: { parent_dust_contact: 1 } }
        ])
      ]
    },
    {
      id: "family_child_crystal_exposure",
      conf: "S",
      references: ["SRC_ORIPATHY_EXPOSURE", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年", "老年"],
      need: ["扶養中の子"],
      ban: ["扶養中の感染者"],
      once: true,
      w: 0.45,
      t: "外から帰ってきた子どもが、「きれいな石を拾った」と黒く光る欠片を手のひらに乗せて見せてきた。近くの古い採掘跡から風で飛ばされてきた源石片らしい。子どもの指には浅い擦り傷があり、布の上で黒い粉がぽろぽろと崩れていた。",
      c: [
        $terraData.K(
          "すぐに傷口を洗い流させ、診療所へ連れていって検査を受ける",
          { pw: [1, { when: "感染者偏見", x: 0.55 }, { when: "気質:慎重", x: 1.3 }] },
          [
            0.8,
          "石片を布で包んで封をし、子どもの手を水で洗い流してから急いで診療所へ走った。検査の結果は鉱石病だった。帰り道、小さな手を握りしめながら、この子の病気を誰に打ち明け、誰に隠すべきか家族で必死に話し合った。",
            { kidInf: 1, kidInfCause: "遊び場に飛来した源石片でできた手の傷", cash: -3e4, p: -8, rl: 2 }
          ],
          [
            1,
            "急いで診療所へ連れていったが、診察代と交通費を払っただけで肝心の精密検査は予約がいっぱいだと断られた。遠くの病院へ行く金も残らず、指の傷だけが先に塞がっていくのを不安な思いで見守った。",
            { cash: -3e4, p: -5, rl: -2, kidExposurePending: 1, kidExposureReviewDelay: 1 }
          ]
        ),
        $terraData.K(
          "石を取り上げて傷口をよく洗い、しばらく家で様子を見る",
          { pw: [1, { when: "感染者偏見", x: 1.5 }, { when: "家計逼迫", x: 1.4 }] },
          [
            0.25,
            "石片を遠くへ捨て、子どもの手の傷を何度も洗った。だが数週間後に熱を出して診療所へ駆け込むと、すでに鉱石病に感染していると告げられた。あの日の擦り傷が取り返しのつかないものになったことに唇を噛んだ。",
            { kidInf: 1, kidInfCause: "採掘跡から飛来した源石片による皮膚損傷", p: -12, rl: -4 }
          ],
          [
            1,
            "傷はすぐに乾き、熱も痛みも出なかった。ひとまず胸をなでおろしたが、本当に感染していないか確かめるため、金が貯まったら来年にでも検査を受けさせようと心に決めた。",
            { p: 1, kidExposurePending: 1, kidExposureReviewDelay: 1 }
          ]
        ),
        $terraData.K("子どもをきつく叱り、近所の親たちにも危ない石が落ちていると知らせる", {}, [
          1,
          "二度とそんな石に触らないよう子どもをきつく叱りつけ、近所の家々を回って源石片が落ちていたと知らせた。どこから飛んできたのかは分からず、子どもたちの遊び場を変えることになった。",
          { rl: -3, cr: 1, p: -3 }
        ])
      ]
    },
    {
      id: "family_child_exposure_followup",
      conf: "S",
      references: ["SRC_ORIPATHY_EXPOSURE", "SRC_RHODES_MEDICAL", "SRC_TERRA_FAMILY"],
      st: ["青年", "壮年", "老年"],
      cd: 1,
      w: 0.65,
      t: s => {
        const child=(s.kids||[]).find(x=>x.id===s.eventRelativeId),
          year=child?.exposureYear,
          elapsed=Number.isInteger(year) && year<=s.year ? s.year-year : null;
        const time=elapsed===null ? "かつて源石の欠片で負った傷のことが、今も心に引っかかっている。" :
          elapsed===0 ? "源石の欠片で指に傷を負ってから、まだ日が浅い。" :
          `あの源石の欠片で指に傷を負ってから、${elapsed}年がたった。`;
        return time+"ふとした折に{kid}の手を見るたび、やはり診療所できちんと検査を受けさせるべきではないかと考え込んだ。";
      },
      c: [
        $terraData.K(
          "検査費と交通費を工面し、診療所で精密検査を受けさせる",
          {
            en: { affordableCash: 3e4 },
            why: "再検査・移動に使う3万龍門幣を生活費後に用意できない",
            pw: [1, { when: "感染者偏見", x: 0.7 }, { when: "気質:慎重", x: 1.3 }]
          },
          [
            0.4,
            "医師から告げられた検査結果は、鉱石病の陽性だった。青ざめたまま診療所を出て、これからかかる薬代のことや、近所に知られずに通院させる手立てを家族で話し合った。",
            {
              kidInf: 1,
              kidInfCause: "遊び場に飛来した源石片でできた手の傷",
              cash: -3e4,
              pm: 1,
              p: -7,
              rl: 1,
              infectionAwarenessActions: [
                { subject: "child", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "child", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" },
                { subject: "child", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" }
              ]
            }
          ],
          [
            1,
            "検査の結果、血中に鉱石病の兆候は見つからなかった。待合室の椅子でへたり込むほど安堵し、もし体調に異変が出たらすぐにまた診せることにして家路についた。",
            { kidExposureClose: 1, cash: -3e4, pm: 1, p: 1, rl: 1 }
          ]
        ),
        $terraData.K("今は検査代が足りず、来年に回して様子を見る", {}, [
          1,
          "診療所に検査代を尋ねたが、今月の暮らしを考えるとすぐには出せなかった。{kid}の体調に変わりがないのを確かめ、検査は来年まで見送ることにした。",
          { kidExposureReviewDelay: 1, p: -1, rl: 1 }
        ]),
        $terraData.K("何年も症状がないなら大丈夫だと考え、検査は見送る", {}, [
          1,
          "これだけたって元気なのだから心配しすぎだと区切りをつけ、{kid}には「黒く光る石を見かけても絶対に触るな」とだけ言い聞かせた。",
          { kidExposureClose: 1, rl: 2, p: 1 }
        ])
      ]
    },
    {
      id: "family_spouse_oripathy_disclosure",
      conf: "S",
      references: [
        "SRC_ORIPATHY_EXPOSURE",
        "SRC_TERRA_SOCIAL_ATTITUDES",
        "SRC_ORIPATHY_SOCIAL",
        "SRC_RHODES_MEDICAL"
      ],
      st: ["青年", "壮年", "老年"],
      need: ["既婚"],
      ban: ["spouse_disclosure"],
      once: true,
      w: [0.3, { when: "地域の隠蔽圧力が強い", x: 1.7 }, { when: "地域の隠蔽圧力が比較的弱い", x: 0.45 }],
      t: "夜更け、薄暗い灯りの下で配偶者がゆっくりと袖をまくった。肌の下に、小さな黒い結晶が浮き出ている。「一緒になる前から、鉱石病だと診断されていた。打ち明ければ結婚できないと思って、ずっと言えなかった」と震える声で告げられた。病のことも、何年も隠されていたことも、すぐには飲み込めなかった。",
      c: [
        $terraData.K(
          "一緒に診療先を探し、暮らしを支える",
          { pw: [1, { when: "感染者偏見", x: 0.55 }, { when: "気質:社交的", x: 1.3 }] },
          [
            1,
          "どれほど怖い思いで一人で抱えていたのかを聞き、冷えた相手の手を握った。翌日から通えそうな診療所と薬代を調べ、「診察には自分も付き添う」と伝えた。",
            {
              spouseInf: 1,
              spouseDisclose: 1,
              infectionAwarenessAction: { subject: "spouse", audience: "protagonist", certainty: "confirmed", source: "relative-disclosure", consent: "voluntary", recipientRef: "current-household" },
              rl: 7,
              p: -3,
              fl: { spouse_supported: 1, spouse_disclosure: 1 }
            }
          ]
        ),
        $terraData.K("何年も騙されていたことへの怒りをぶつけ、寝室を分ける", {}, [
          1,
          "病気そのものより、同じ屋根の下でずっと隠されていたことが許せなかった。そう言い放ち、その夜から毛布を抱えて別の部屋で寝ることにした。",
          {
            spouseInf: 1,
            spouseDisclose: 1,
            infectionAwarenessAction: { subject: "spouse", audience: "protagonist", certainty: "confirmed", source: "relative-disclosure", consent: "voluntary", recipientRef: "current-household" },
            spouseDisclosureBoundary: "separate_rooms",
            spouseDisclosureReviewDelay: 3,
            rl: -10,
            p: -8,
            fl: { spouse_strained: 1, spouse_disclosure: 1, marriage_strained: 1 }
          }
        ]),
        $terraData.K(
          "これ以上は一緒に暮らせないと告げ、離婚する",
          { pw: [1, { when: "感染者偏見", x: 1.8 }, { when: "気質:短気", x: 1.4 }] },
          [
            1,
            "もう同じ家で暮らすことはできないと告げ、別れる手続きを進めた。荷物をまとめて別れた後も、ふとした拍子に相手の身体のことが頭をよぎった。",
            {
              spouseInf: 1,
              spouseDisclose: 1,
              infectionAwarenessAction: { subject: "spouse", audience: "protagonist", certainty: "confirmed", source: "relative-disclosure", consent: "voluntary", recipientRef: "current-household" },
              divorce: 1,
              rl: -18,
              p: -12,
              fl: { spouse_disclosure: 1, marriage_ended: 1, divorced: 1 }
            }
          ]
        )
      ]
    },
    {
      id: "family_spouse_sarkaz",
      conf: "S",
      references: ["SRC_KAZDEL_LIFE", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年", "老年"],
      need: ["サルカズの配偶者"],
      ban: ["spouse_sarkaz_decided"],
      once: true,
      w: 0.45,
      t: [
        {
          when: "サルカズ偏見",
          t: "配偶者がサルカズだというただそれだけの理由で、親族は二人の結婚を頑なに認めようとしない。幼いころ自分自身もサルカズに向けて口にした心ない言葉が蘇り、すぐには言い返せなかった。"
        },
        {
          t: "配偶者が何気なく故郷の話をすると、周りの空気がすっと冷えて別の話題にすり替えられた。親族の集まりに顔を出すたび、二人の暮らしに向けられる刺すような視線が気になった。"
        }
      ],
      c: [
        $terraData.K(
          "親族にきっぱりと線を引き、配偶者を守る",
          { pw: [1, { when: "サルカズ偏見", x: 0.55 }, { when: "気質:社交的", x: 1.3 }] },
          [
            1,
          "「連れ合いをサルカズだからと閉め出すなら、自分ももうそちらの敷居は跨がない」と親族に言い切った。帰り道、並んで歩きながら二人だけの暮らしを守っていこうと確かめ合った。",
            { rl: 5, p: -2, biasSar: -3, fl: { spouse_sarkaz_decided: 1 } }
          ]
        ),
        $terraData.K(
          "親族や世間の目に屈し、配偶者と別れる",
          { pw: [1, { when: "サルカズ偏見", x: 1.7 }, { when: "気質:慎重", x: 1.3 }] },
          [
            1,
            "身内や周囲から爪弾きにされる怖さに耐えきれず、配偶者と別れる道を選んだ。一人になった部屋の静けさのなかで、自分の弱さを何度も悔やんだ。",
            {
              divorce: 1,
              rl: -15,
              p: -10,
              biasSar: 3,
              fl: { spouse_sarkaz_decided: 1, marriage_ended: 1, divorced: 1 }
            }
          ]
        ),
        $terraData.K("親族とは距離を置き、二人だけで静かに暮らす", {}, [
          1,
          "親族からの小言や手紙はすべて後回しにし、二人だけの静かな暮らしを守ることにした。たまに届く実家からの封書は、何日も封を切れないまま棚に置かれていた。",
          { p: -3, rl: 2, fl: { spouse_sarkaz_decided: 1 } }
        ])
      ]
    },
    {
      id: "family_player_infection_reaction",
      conf: "S",
      references: [
        "SRC_ORIPATHY_EXPOSURE",
        "SRC_TERRA_SOCIAL_ATTITUDES",
        "SRC_RHODES_MEDICAL",
        "SRC_V88_INFO_BOUNDARIES"
      ],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["感染診断済"],
      any: ["親存命", "既婚", "子あり", "兄弟あり"],
      once: true,
      w: 0.6,
      t: [
        {
          when: { need: ["infection_family_disclosed"] },
          t: "あなたが鉱石病だと打ち明けた家族は、黙って通院日や薬代の話に耳を傾けていた。あなたの身を案じているのか、それともこれから降りかかる負担に怯えているのか、その表情からはまだ読み取れなかった。"
        },
        {
          when: "感染者偏見",
          t: "あなたがたびたび病院へ通っていることに気づいた家族が、心配そうに訳を尋ねてきた。鉱石病だと打ち明けるべきか迷うと同時に、かつて自分が感染者に投げつけた冷たい言葉がそのまま自分の胸に突き刺さった。"
        },
        {
          t: "あなたがたびたび病院へ通っていることに家族が気づき、どこか悪いのかと尋ねてきた。鉱石病のことをどこまで打ち明け、誰に頼るかを決めなければならない。"
        }
      ],
      c: [
        $terraData.K(
          "父にだけ病名を打ち明け、これからの通院を相談する",
          {
            show: s =>
              s.inf &&
              !$rules.relationships.closeInfoKnown(s, "father") &&
              !s.fl?.infection_family_recipient_father &&
              $rules.relationships.closeInfoAvailable(s, "father")
          },
          [
            1,
            "父と二人きりの時に鉱石病だと打ち明け、通える診療所や薬代のことを相談した。母や他の家族にはまだ伏せておくことにした。",
            {
              rl: 5,
              p: 1,
              fl: {
                infection_family_disclosed: 1,
                infection_family_recipient_father: 1,
                family_infection_support: 1,
                hid: 1
              },
              closeKnowledgeAction: { kind: "father", action: "disclose" }
            }
          ]
        ),
        $terraData.K(
          "母にだけ病名を打ち明け、これからの通院を相談する",
          {
            show: s =>
              s.inf &&
              !$rules.relationships.closeInfoKnown(s, "mother") &&
              !s.fl?.infection_family_recipient_mother &&
              $rules.relationships.closeInfoAvailable(s, "mother")
          },
          [
            1,
            "母と二人きりの時に鉱石病だと打ち明け、通える診療所や薬代のことを相談した。父や他の家族にはまだ伏せておくことにした。",
            {
              rl: 5,
              p: 1,
              fl: {
                infection_family_disclosed: 1,
                infection_family_recipient_mother: 1,
                family_infection_support: 1,
                hid: 1
              },
              closeKnowledgeAction: { kind: "mother", action: "disclose" }
            }
          ]
        ),
        $terraData.K(
          "一緒に暮らす配偶者にだけ病名を打ち明ける",
          {
            show: s =>
              s.inf &&
              !$rules.relationships.closeInfoKnown(s, "spouse") &&
              !s.fl?.infection_family_recipient_spouse &&
              $rules.relationships.closeInfoAvailable(s, "spouse")
          },
          [
            1,
            "夜、同じ屋根の下で暮らす配偶者にだけ鉱石病だと打ち明け、これからの通院を相談した。親や他の身内にはまだ伏せておくことにした。",
            {
              rl: 5,
              p: 1,
              fl: {
                infection_family_disclosed: 1,
                infection_family_recipient_spouse: 1,
                family_infection_support: 1,
                hid: 1
              },
              closeKnowledgeAction: { kind: "spouse", action: "disclose" }
            }
          ]
        ),
        $terraData.K("家族にも本当の病名は隠し、ひとりで通院を続ける", {
          show: s => !s.fl?.infection_family_disclosed &&
            !$rules.relationships.closeInfoKnown(s, "father") &&
            !$rules.relationships.closeInfoKnown(s, "mother") &&
            !$rules.relationships.closeInfoKnown(s, "spouse")
        }, [
          1,
          "職場や世間だけでなく家族の顔色が変わることさえ怖くて、単なる持病だとごまかした。診察に出かけるたび、嘘を重ねる後ろめたさが胸に澱のように溜まった。",
          { rl: -4, p: -5, fl: { hid: 1 } }
        ]),
        $terraData.K("かつて自分が感染者を蔑んでいたことを、家族の前で悔いる", { show: { need: ["感染者偏見"] } }, [
          1,
          "「昔は自分も感染者を汚いもののように避けていた」と家族の前で打ち明けた。いざ自分がその身になって初めて分かった痛みを噛みしめ、二度と同じ言葉は口にしないと誓った。",
          { biasInf: -14, rl: 2, p: -2, fl: { family_bias_acknowledged: 1, hid: 1 } }
        ]),
        $terraData.K(
          "父と通院日を確かめ、次の診察に付き添ってもらえないか頼む",
          {
            show: s =>
              $rules.relationships.closeInfoKnown(s, "father") &&
              $rules.relationships.closeInfoAvailable(s, "father")
          },
          [
            0.65,
            "父は「次の診察には一緒に行ってやる」と力強くうなずいてくれた。当日の仕事の都合がつけば、心強い味方になってくれそうだ。",
            {
              rl: 4,
              p: 1,
              fl: { family_infection_support: 1 },
              closeKnowledgeAction: { kind: "father", action: "help-accepted", commitmentKind: "next-appointment" }
            }
          ],
          [
            1,
            "父は気まずそうに目をそらし、「その日はどうしても仕事を休めない」と断った。他の日なら来てくれるのか、それ以上は聞けなかった。",
            {
              rl: -1,
              p: -1,
              fl: { family_infection_support: 1 },
              closeKnowledgeAction: { kind: "father", action: "help-declined" }
            }
          ]
        ),
        $terraData.K(
          "母と通院日を確かめ、次の診察に付き添ってもらえないか頼む",
          {
            show: s =>
              $rules.relationships.closeInfoKnown(s, "mother") &&
              $rules.relationships.closeInfoAvailable(s, "mother")
          },
          [
            0.65,
            "母は「次の診察には私も付き添うよ」とうなずいてくれた。当日都合がつけば、待合室で一人きりでいずに済みそうだ。",
            {
              rl: 4,
              p: 1,
              fl: { family_infection_support: 1 },
              closeKnowledgeAction: { kind: "mother", action: "help-accepted", commitmentKind: "next-appointment" }
            }
          ],
          [
            1,
            "母は困ったように眉を下げ、「その日はどうしても手が離せない」と断った。別の日に頼めるかどうかは、曖昧なまま終わった。",
            {
              rl: -1,
              p: -1,
              fl: { family_infection_support: 1 },
              closeKnowledgeAction: { kind: "mother", action: "help-declined" }
            }
          ]
        ),
        $terraData.K(
          "配偶者と通院日を確かめ、次の診察に付き添ってもらえないか頼む",
          {
            show: s =>
              $rules.relationships.closeInfoKnown(s, "spouse") &&
              $rules.relationships.closeInfoAvailable(s, "spouse")
          },
          [
            0.65,
            "配偶者は「次の診察の日は一緒に行く」と約束してくれた。当日の都合がつけば、並んで診療所の門をくぐれそうだ。",
            {
              rl: 4,
              p: 1,
              fl: { family_infection_support: 1 },
              closeKnowledgeAction: { kind: "spouse", action: "help-accepted", commitmentKind: "next-appointment" }
            }
          ],
          [
            1,
            "配偶者は「その日はどうしても仕事を抜けられない」と目を伏せた。次の機会なら来てくれるのかは、言葉を濁されたままだった。",
            {
              rl: -1,
              p: -1,
              fl: { family_infection_support: 1 },
              closeKnowledgeAction: { kind: "spouse", action: "help-declined" }
            }
          ]
        ),
        $terraData.K(
          "これ以上は家族に頼らず、ひとりで通院を続ける",
          {
            show: s =>
              !!s.fl?.infection_family_disclosed &&
              !["father", "mother", "spouse"].some(
                kind =>
                  $rules.relationships.closeInfoKnown(s, kind) &&
                  $rules.relationships.closeInfoAvailable(s, kind)
              )
          },
          [
            1,
            "これ以上家族に心配や負担をかけるのはやめようと決め、ひとりで診療所へ通う支度を整えた。",
            { p: -1 }
          ]
        )
      ]
    },
    {
      id: "family_marital_strain",
      conf: "S",
      references: ["SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年", "老年"],
      need: ["既婚"],
      ban: ["marriage_ended"],
      ge: { age: 25 },
      once: true,
      w: 0.35,
      t: "食卓の上で家計簿をぱたんと閉じる乾いた音が、また言い争いの火種になった。相手が仕事で疲れ果てていることは分かっていたはずなのに、口を開けばトゲのある不満ばかりが先に飛び出した。",
      c: [
        $terraData.K(
          "頭を冷やし、相手が何に一番苦しんでいるのか耳を傾ける",
          { pw: [1, { when: "気質:社交的", x: 1.3 }, { when: "気質:慎重", x: 1.2 }] },
          [
            1,
            "溜まっていた支払いを片づけてから、温かい茶を淹れて向かい合った。お互い何に疲れ、何を我慢していたのかをぽつりぽつりと話し合った。",
            { rl: 3, p: 1, cash: -2e4 }
          ]
        ),
        $terraData.K("顔を合わせれば傷つけ合うだけだと、しばらく別居する", {}, [
          1,
          "このまま同じ部屋にいては息が詰まると、身の回りの荷物だけを持って親族の家に身を寄せた。いつ元の家へ戻るかは決められなかった。",
          { spouseDeath: 0, rl: -6, p: -5, fl: { marriage_strained: 1 } }
        ]),
        $terraData.K(
          "これ以上は続けられないと、離婚を切り出す",
          { pw: [1, { when: "気質:短気", x: 1.4 }, { when: "気質:内向的", x: 1.2 }] },
          [
            1,
            "すり減った気持ちはもう戻らないと認め、婚姻を解く手続きを進めた。二つ並んでいた食器や家財を分ける作業が始まった。",
            { divorce: 1, rl: -12, p: -8, fl: { marriage_ended: 1, divorced: 1 } }
          ]
        )
      ]
    },
    {
      id: "family_spouse_death",
      conf: "S",
      references: ["SRC_TERRA_LIFECOURSE", "SRC_TERRA_SOCIAL_ATTITUDES", "SRC_LATERANO_FAMILY_LAW"],
      st: ["青年", "壮年", "老年"],
      need: ["配偶者の死の知らせ"],
      ban: ["spouse_death", "divorced"],
      once: true,
      pri: true,
      w: 1,
      t: "{spouseDeathTiming}、連れ合いの{sp}が亡くなったという知らせが届いた。食卓には二人で食べようと買っておいた食材がそのまま残り、そこへ葬儀や遺品の問い合わせが容赦なく押し寄せた。立ち尽くしたまま、次に何をすべきか分からなくなった。",
      c: [
        $terraData.K("悲しみをこらえ、葬送の段取りと遺品の整理を進める", {}, [
          1,
          "弔いの手配を一つずつ済ませ、主を失った衣服や日用品を箱に詰めた。黙々と手を動かしている間だけ、ぽっかり空いた胸の穴を見ずに済んだ。",
          { spouseDeath: 1, rl: 3, p: -12, fl: { spouse_death: 1, marriage_ended: 1 } }
        ]),
        $terraData.K("二人でよく並んで歩いた場所へ行き、花を手向ける", {}, [
          1,
          "かつて二人でよく歩いた道へ足を運び、小さな花束をそっと供えた。帰り道、隣から聞こえてくるはずの足音を探している自分に気づいた。",
          { spouseDeath: 1, rl: -2, p: -10, fl: { spouse_death: 1, marriage_ended: 1 } }
        ]),
        $terraData.K(
          "泣く暇も惜しみ、残された子どもの世話と明日の暮らしを守る",
          { show: { any: ["子あり", "扶養中の子"] } },
          [
            1,
            "涙をこぼすのを後回しにして、子どもの温かい食事と明日の支払いを先に整えた。夜更けに子どもが寝息を立て始めてから、主のいない椅子の前でようやく肩を震わせた。",
            { spouseDeath: 1, rl: -5, p: -15, cash: -5e4, fl: { spouse_death: 1, marriage_ended: 1 } }
          ]
        ),
        $terraData.K(
          "ノタリアルホールへ出向き、親権や遺産の手続きを済ませる",
          { show: { need: ["国:ラテラーノ", "ラテラーノ市民"] } },
          [
            1,
            "ノタリアルホールの静かな窓口で、{sp}の逝去に伴う親権や遺産の引き継ぎ手続きを確かめた。事務的な書類のやり取りを終えて外へ出ると、急に強い日差しが目に染みた。",
            {
              spouseDeath: 1,
              lateranoFamilyProcess: "estate_guardianship_inquiry",
              rl: 1,
              p: -10,
              fl: { spouse_death: 1, marriage_ended: 1 }
            }
          ]
        )
      ]
    },
    {
      id: "infection_mine_crystal_contact",
      conf: "S",
      references: ["SRC_ORIPATHY_EXPOSURE", "SRC_RIM_WORK"],
      st: ["青年", "壮年", "老年"],
      need: ["国:レム・ビリトン", "職:鉱夫"],
      ban: ["感染診断済"],
      once: true,
      w: 0.5,
      t: "採掘坑の古い支柱がミシミシと軋んでずれ、崩れた壁面から生々しい源石の結晶がむき出しになった。換気扇は止まり、きらめく粉塵がカンテラの光を濁らせている。作業長は「交代の班が降りてくるまで掘る手を止めるな」と怒鳴った。",
      c: [
        $terraData.K("怒鳴られてもツルハシを置き、防護マスクを取りに戻る", {}, [
          1,
          "作業長の罵声を背中に浴びながら通路を引き返し、防護具をしっかり着け直した。日当は削られたが、粉塵が収まるまで危険な切羽には近づかなかった。",
          { cash: -2e4, p: -2, fl: { mine_exposure_refused: 1 } }
        ]),
        $terraData.K(
          "日当を減らされたくなくて、そのまま結晶の近くで掘り続ける",
          {},
          [
            0.55,
            "むき出しの結晶を避けて鉱石を運び出そうとした瞬間、厚手の手袋が裂けて鋭い角で手のひらをざっくり切った。傷口から熱が広がり、後日の検査で鉱石病を宣告された。",
            {
              inf: 1,
              infCause: "採掘坑内で結晶片と源石粉塵に曝露", infectionRoute: "mixed",
              exposureAction: "screen",
              h: -4,
              fl: { workplace_hazard: 1, dg: 1 }
            }
          ],
          [
            1,
            "よどんだ粉塵を吸い込み、坑道を出たあとも喉の奥が焼けるように痛んで咳が止まらなかった。幸い鉱石病の診断は出なかったが、それ以来、坑内へ降りるたび換気扇の音に耳を澄ますようになった。",
            { exposureAction: "unsafe", h: -5, p: -2, fl: { workplace_hazard: 1 } }
          ]
        )
      ]
    },
    {
      id: "infection_terror_crystal_shrapnel",
      conf: "S",
      references: ["SRC_ORIPATHY_EXPOSURE", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["戦乱地域"],
      ban: ["感染診断済"],
      once: true,
      w: 0.25,
      t: "市場の片隅で耳をつんざく爆発音が轟き、吹き飛んだ荷車の積荷が石畳に散乱した。黒煙のなかに砕けた源石の破片が飛び散り、血を流す負傷者のうめき声と、爆弾を仕掛けた者を呪う怒号が入り乱れた。",
      c: [
        $terraData.K(
          "煙のなかへ飛び込み、瓦礫の下敷きになった人を引きずり出す",
          {},
          [
            0.12,
            "人を引き出そうと瓦礫に手をかけた瞬間、崩れ落ちた柱の間から鋭い源石の結晶が突き出し、脇腹を深く抉った。血まみれで救護所へ担ぎ込まれ、一命は取り留めたものの鉱石病への感染を告げられた。",
            {inf:1,infectionRoute:"deep-wound",infCause:"救助中に源石結晶で深い創傷を負った",h:-22,p:-6,fl:{terror_exposure:1,dg:1}}
          ],
          [
            0.45,
            "負傷者の肩を抱えて引きずり出す途中、飛び散っていた源石の細片が自分の前腕に深く食い込んだ。すぐに水で洗い流したが鈍い熱が引かず、後日の検査で鉱石病と診断された。",
            {
              inf: 1,
              infCause: "爆破で飛散した源石結晶片が腕を傷つけた", infectionRoute: "wound",
              h: -8,
              rl: 4,
              fl: { terror_exposure: 1, dg: 1 }
            }
          ],
          [
            1,
            "むせ返る煙のなかから負傷者を安全な軒下まで運び出した。腕のかすり傷を清潔な水で洗い流し、石畳に散らばった源石片を踏まないよう警備の者に場所を知らせた。",
            { h: -4, rl: 3, fl: { terror_exposure: 1 } }
          ]
        ),
        $terraData.K("崩れた壁の陰に身を伏せ、騒ぎが収まるまで息をひそめる", {}, [
          1,
          "両手で頭を抱えて石壁の陰にうずくまり、爆音と悲鳴が遠のくまで震えながら待った。助けを呼ぶ声が耳に残ったが、足がすくんで一歩も外へ出られなかった。",
          { p: -4, fl: { terror_exposure: 1 } }
        ])
      ]
    },
    {
      id: "family_spouse_infection_care",
      conf: "S",
      references: ["SRC_ORIPATHY_EXPOSURE", "SRC_RHODES_MEDICAL"],
      st: ["青年", "壮年", "老年"],
      need: ["感染した配偶者"],
      ban: ["spouse_supported"],
      once: true,
      w: 0.4,
      t: "配偶者が鉱石病を打ち明けてから日がたったが、まだ本格的な治療には通えていない。かさむ薬代と通院の交通費、それに仕事を休めるかどうかを食卓で突き合わせ、どうやって治療を始めるか話し合った。",
      c: [
        $terraData.K(
          "家計から初回費用（{spouseInitialTreatmentCost}）を捻出し、すぐに診察を受けさせる",
          {
            en: { affordableCash: 1e5 },
            why: "初回の通院費{spouseInitialTreatmentCost}を生活費後に用意できない"
          },
          [
            1,
            "蓄えから初回費用{spouseInitialTreatmentCost}を取り分け、配偶者を診療所へ送り出した。帰ってきた相手の少しほっとした顔を見て、次の診察日も二人で支え合って乗り切ろうと決めた。",
            { spouseTreatment: 1, cash: -1e5, pm: 1, rl: 3, p: 1, fl: { spouse_supported: 1 } }
          ]
        ),
        $terraData.K(
          "地域の診療所や互助先を回り、治療費の補助や分割を相談する",
          {},
          [
            0.7,
            "地域の診療所や互助会に頭を下げて回り、費用を少しずつ払う手立てを相談した。すぐには診察枠が取れなかったが、次の巡回日に診てもらえるよう約束を取りつけた。",
            { rl: 3, p: -1, fl: { spouse_supported: 1 } }
          ],
          [
            1,
            "頼れそうな窓口を回ったが、「どこも感染者の患者で手いっぱいで空きがない」と断られた。配偶者の咳払いを聞きながら、やり場のない焦りだけが残った。",
            { p: -6, rl: -3, fl: { spouse_supported: 1 } }
          ]
        ),
        $terraData.K(
          "ロドスの診療窓口へ照会する",
          { show: { ge: { year: 1095 } } },
          [
            0.7,
            "ロドスの相談窓口へ足を運び、配偶者を診てもらえないか掛け合った。すぐの枠は埋まっていたものの、次の巡回時に優先して連絡をもらえることになった。",
            { rl: 3, p: -1, fl: { spouse_supported: 1, rhodes: 1 } }
          ],
          [
            1,
            "ロドスの窓口も患者が殺到しており、今回は予約が取れなかった。せっかく取り分けておいた通院費の袋を握りしめ、次の巡回が来るまで耐えるしかなかった。",
            { p: -6, rl: -3, fl: { spouse_supported: 1, rhodes: 1 } }
          ]
        ),
        $terraData.K("今月は家賃と食費で手いっぱいのため、受診を先送りする", {}, [
          1,
          "家賃と日々の食い扶持を払えば、手元には小銭しか残らなかった。「来月こそは」と配偶者に詫びながら、診療所へ行く日をまた先へ延ばした。",
          { p: -5, rl: -3, fl: { spouse_supported: 1 } }
        ])
      ]
    },
    {
      id: "family_spouse_treatment_review",
      conf: "S",
      references: ["SRC_ORIPATHY_EXPOSURE", "SRC_RHODES_MEDICAL", "SRC_TERRA_FAMILY"],
      st: ["青年", "壮年", "老年"],
      need: ["感染した配偶者"],
      cd: 3,
      w: 0.24,
      t: [
        {
          when: "配偶者の療養未開始",
          t: "鉱石病のことを聞いてからも、まだ配偶者の通院先は決まっていない。薬代や交通費、仕事を休める日取りを二人で突き合わせ、どうにか受診を始められないか話し合った。"
        },
        {
          when: "配偶者の療養中",
          t: "配偶者の診察日が近づくたび、仕事のやりくりと家計の計算をし直した。かさむ薬代と暮らしの費用を前に、これからの通院をどう続けるか二人で向き合った。"
        },
        {
          when: "配偶者の療養を休止中",
          t: "費用の都合で通院を休んでから、配偶者が発作や痛みに苦しんで寝込む日が増えた。どうにかしてもう一度病院へ通わせる余裕を作れないか考えた。"
        },
        {
          t: "配偶者の病気が分かってから、通院の時間と治療費を二人でやりくりしてきた。次の診察をどうするか、食卓で静かに話し合った。"
        }
      ],
      c: [
        $terraData.K(
          "配偶者の希望を確かめ、初回費用{spouseInitialTreatmentCost}を払って通院を始める",
          {
            show: { need: ["配偶者の療養未開始"] },
            en: { affordableCash: 1e5 },
            why: "初回の通院費{spouseInitialTreatmentCost}を生活費後に用意できない"
          },
          [
            1,
            "「やはり診てもらいたい」という配偶者の言葉にうなずき、初回費用{spouseInitialTreatmentCost}を払って通院を始めた。帰り道、次の診察日も二人で乗り切ろうと話し合った。",
            { spouseTreatment: 1, cash: -1e5, pm: 1, p: 1, rl: 2 }
          ]
        ),
        $terraData.K("これまで通り通院を続ける", { show: { need: ["配偶者の療養中"] } }, [
          1,
          "家賃を払った残りの金から、何より先に次の薬代と交通費を取り分けておいた。苦しくても治療だけは止めないと決めた。",
          { spouseTreatment: 1, rl: 1 }
        ]),
        $terraData.K(
          "診療所の窓口に掛け合い、支払い方や通院間隔を相談する",
          { show: { need: ["配偶者の療養中"] } },
          [
            0.65,
            "診療所の担当者が親身に話を聞いてくれ、薬の出し方や通院の間隔を無理のない形に組み直してくれた。家に帰って配偶者に伝えると、ほっとしたように肩の力を抜いた。",
            { spouseTreatment: 1, rl: 2 }
          ],
          [
            1,
            "窓口が混み合っていて詳しい相談はできなかった。ひとまず次の診察代だけを握りしめ、これまで通り通わせることにした。",
            { spouseTreatment: 1, p: -2 }
          ]
        ),
        $terraData.K("費用が整うまで、通院を一時休止する", { show: { need: ["配偶者の療養中"] } }, [
          1,
          "どうしても今月の薬代が捻出できず、次の予約を取り消して診察券を引き出しの奥にしまった。申し訳なさに目を伏せる配偶者に、かける言葉が見つからなかった。",
          { spouseTreatment: 0, p: -4, rl: -2 }
        ]),
        $terraData.K(
          "初回費用{spouseInitialTreatmentCost}を払い、通院を再開する",
          {
            show: { need: ["配偶者の療養を休止中"] },
            en: { affordableCash: 1e5 },
            why: "通院再開の初回費用{spouseInitialTreatmentCost}を生活費後に用意できない"
          },
          [
            1,
            "ようやくまとまった金{spouseInitialTreatmentCost}を用意し、配偶者を再び診療所へ送り出した。久しぶりに処方された抑制剤を手にして、二人で深く息をついた。",
            { spouseTreatment: 1, cash: -1e5, pm: 1, p: 1 }
          ]
        ),
        $terraData.K("今月も余裕がなく、次の給金が入るまで休止を続ける", { show: { need: ["配偶者の療養を休止中"] } }, [
          1,
          "今月も通院を再開できるだけの金は残らなかった。次の給金が入ったらもう一度考えようと話し合い、痛む身体をさすりながら夜をやり過ごした。",
          { spouseTreatment: 0, p: -1 }
        ])
      ]
    },
    {
      id: "family_daily_small_care",
      conf: "S",
      references: ["SRC_TERRA_SOCIAL_ATTITUDES", "SRC_TERRA_FAMILY"],
      st: ["幼児", "児童", "少年", "青年", "壮年", "老年"],
      any: ["既婚", "子あり", "親存命", "兄弟あり"],
      cd: 4,
      w: 0.45,
      t: [
        {
          when: s => $rules.family.familyDailyTargetById(s)?.kind === "sibling",
          t: [
            "{dailyFamilyName}と帰ると、食卓には冷めかけた汁物があった。今日見たものを話しながら、二人で湯を足した。",
            "{dailyFamilyName}は昔の失敗をまた話した。聞き飽きたはずなのに、三度目だけ違うところで笑ってしまった。",
            "帰りに買ったものを食卓へ並べた。{dailyFamilyName}は値札を見て、安い方を選んだ理由を尋ねた。",
            "戸口の棚が傾き、{dailyFamilyName}と中身を出して直した。しまい終えるころには、どちらが工具を戻すかで笑っていた。",
            "用事の帰りに{dailyFamilyName}と道を歩いた。急ぐ理由もなく、店先の灯りが一つずつ点くのを見ていた。",
            "食器を片づけていると、{dailyFamilyName}が古い傷のついた皿を避けて置いた。理由を尋ねると、昔の話が始まった。"
          ]
        },
        {
          when: s => $rules.family.familyDailyTargetById(s)?.kind === "child",
          t: [
            "{dailyFamilyName}は帰り道のことを話した。夕食の汁が冷めかけていたので、温め直しながら続きを聞いた。",
            "{dailyFamilyName}は同じ話を三度した。最後まで聞くと、三度目だけ違うところで笑った。",
            "雨上がり、{dailyFamilyName}が濡れた靴を玄関に並べた。二人で布を当て、水気を拭き取った。",
            "食卓で{dailyFamilyName}が今日覚えたことを話した。知らない言葉を尋ねると、得意そうに教えてくれた。",
            "買い物袋から品を一つ取り出した{dailyFamilyName}と、どちらが先に使うか話した。結局、半分ずつ分けた。",
            "道具を片づけていると、{dailyFamilyName}が今日できたことを見せた。話す声が弾んでいて、こちらまで笑顔になった。"
          ]
        },
        {
          when: s => $rules.family.familyDailyTargetById(s)?.kind === "spouse",
          t: [
            "{dailyFamilyName}は疲れて帰り、今日あったことを一つだけ話した。返事をするうち、食事の湯気が消えた。",
            "二人で洗濯物を畳んだ。何を話したかは思い出せないが、{dailyFamilyName}が片方の袖を裏返して渡したことは覚えていた。",
            "{dailyFamilyName}がほつれた袖を繕っていた。針を受け取り、続きを少しだけ手伝った。",
            "今月の支払いを確かめ終えると、{dailyFamilyName}は大きく伸びをして、明日の仕事着を椅子の背に掛けた。",
            "夕食の味つけを決めかねて、二人で少しずつ調味料を足した。最後はどちらの案でもない味になった。",
            "通りの屋台で買った温かいものを分け、帰り道に明日の用事を話した。"
          ]
        },
        {
          when: s => $rules.family.familyDailyTargetById(s)?.kind === "parent",
          t: [
            "{dailyFamilyName}は昔の呼び名であなたを呼び、台所の用事を一つ頼んだ。返事をしてから、子どもの頃の夕方を思い出した。",
            "{dailyFamilyName}と短い便りの返事を書いた。昔のあだ名を添え、久しぶりにその呼び名を使った。",
            "親の家を訪ねた日に、昔使っていた道具が棚から出てきた。使い方を聞くと、その頃の暮らしの話になった。",
            "親から届いた便りには、近くで咲いた花のことが書かれていた。返事には、最近の仕事のことも一行添えた。",
            "「そのやり方は前にも教えた」と親は笑いながら言った。今度は手元が覚えるまで、横でやり方を見ていた。",
            "親から受け取った布を、家にあるものへ縫い足した。どこで手に入れたのか尋ねると、古い用事の話になった。"
          ]
        },
        {
          t: [
            "湯を沸かし、窓辺の布を畳んだ。特別なことのない夕方だった。",
            "帰宅して靴をそろえた。向かいの部屋から、誰かが口ずさむ歌が聞こえた。",
            "雨が上がり、窓辺に掛けていた布を取り込んだ。乾いた端から折り畳み、棚へ戻した。",
            "靴についた泥を落として戸口に並べた。用事はそれだけで、あとは灯りを消して休んだ。",
            "帰り道、店先の人が売れ残りの野菜を籠へ移していた。そのまま通り過ぎ、家で夕食の支度をした。",
            "茶を冷ましながら窓の外を眺めた。通りの荷車が遠ざかると、部屋の音も静かになった。",
            "食器を洗い、布巾を掛け直した。水の音が止むまで、急ぐ用事はなかった。"
          ]
        }
      ],
      fx: { p: 1, rl: 1 }
    }
  );

  $terraData.EV.push({
    id: "family_former_spouse_death_notice",
    conf: "S",
    references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["離婚した相手の訃報"],
    ban: ["spouse_death"],
    once: true,
    pri: true,
    w: 1,
    t: "かつて婚姻関係にあった{formerSpouse}が亡くなったという知らせが届いた。食卓に腰を下ろすと、言い争った日も笑い合った日も入り混じって胸に浮かんだ。子どもにどう切り出すべきか、言葉を探した。",
    c: [
      $terraData.K("子どもと向き合い、{formerSpouse}との温かい思い出を一つ語って聞かせる", {}, [
        1,
        "子どもを近くに座らせ、{formerSpouse}が元気だった頃の思い出を一つ静かに話して聞かせた。古い写真を食卓に置き、聞きたいことがあれば何でも聞くといいと伝えた。",
        { formerSpouseDeathNotice: 1, rl: 2, p: -8 }
      ]),
      $terraData.K("気心の知れた身内にそばにいてもらい、子どもに訃報を伝える", {}, [
        1,
        "一人では言葉が詰まりそうで、頼れる身内に同席してもらって子どもに知らせを伝えた。動揺する子どもの背中をさすりながら、分かっていることだけをゆっくり話した。",
        { formerSpouseDeathNotice: 1, rl: 1, p: -6 }
      ]),
      $terraData.K("今日はまだ伏せておき、子どもの普段通りの一日を守る", {}, [
        1,
          "その日はいつも通りの夕飯を作り、明日の支度を済ませて子どもを寝かしつけた。静かになった部屋で、明日どう切り出すかを一人で考え続けた。",
        { formerSpouseDeathNotice: 1, rl: -1, p: -5 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "family_former_spouse_move_notice",
    conf: "S",
    references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["離婚した相手の転居知らせ"],
    pri: true,
    w: 1,
    t: "別れた{formerSpouse}が{formerSpouseMovedRegion}へ移り住んだという知らせが、{formerSpouseMoveChannel}届いた。すでに転居してから{formerSpouseMoveDelay}たっていた。{formerSpouseChildResidenceContext}これからの子どもの行き来や養育費の分担について、どう返事をするか考えた。",
    c: [
      $terraData.K("知らせを受け取ったと返し、これからの面会や費用の相談を送る", {}, [
        1,
        "{formerSpouseReplyRoute}、転居の知らせを受け取ったと返事を出した。距離が離れたぶん、子どもの行き来や養育費をどうするかも具体的な案を添えて送った。",
        { formerSpouseMoveNotice: 1, rl: 2, p: 1, fl: { former_spouse_move_notice: 1 } }
      ]),
      $terraData.K("すぐには返事を書かず、まずは子どもとの暮らしを落ち着かせる", {}, [
        1,
        "慌てて返事を出すのはやめ、まずは目の前の子どもの食事と毎日の暮らしを整えることにした。新しい宛先への手紙は、気持ちが落ち着いてから書くことにする。",
        { formerSpouseMoveNotice: 1, rl: 1, p: 0, fl: { former_spouse_move_notice: 1 } }
      ])
    ]
  });

  $terraData.EV.push({
    id: "family_divorce_parenting_review",
    conf: "S",
    references: ["SRC_TERRA_FAMILY", "SRC_LATERANO_FAMILY_LAW"],
    st: ["青年", "壮年", "老年"],
    need: ["離婚後の養育について話す時期"],
    cd: 3,
    w: 0.48,
    t: "「次の休みはどっちの家で過ごすの？」と子どもに尋ねられた。別れたときに決めた約束を思い返し、{formerSpouse}へどう連絡するか考えた。",
    c: [
      $terraData.K("{formerSpouse}へ手紙を書き、次の休みの予定を相談する", {}, [
        1,
        "{formerSpouse}へ、子どもの休みの予定と迎えの時間を相談する便りを送った。休みに入るまでの間、折り返しの返事を待った。",
        { divorceParentingPlan: "coordinate", rl: 2, p: 1 }
      ]),
      $terraData.K("直接やり取りするのは避け、共通の知人に間へ入ってもらう", {}, [
        1,
        "信頼できる知人に頼み、次の面会日と養育費の連絡を取り次いでもらった。子どもには「日取りが決まったらすぐ教えるよ」と伝えた。",
        { divorceParentingPlan: "mediated", rl: 1, p: 0 }
      ]),
      $terraData.K("こちらからは連絡せず、今の家での暮らしを優先する", {}, [
        1,
        "今は無理に連絡を取らず、子どもとの普段通りの暮らしを崩さないでおくことにした。",
        { divorceParentingPlan: "low_contact", rl: 0, p: 1 }
      ])
    ]
  });

  $terraData.EV.find(item => item.id === "family_divorce_parenting_review").t = [
    {
      when: "離婚後に連絡を提案した",
      t: "前に送った子どもの予定についての便りに、まだ{formerSpouse}から返事がない。休みが近づき、もう一度手紙を出すべきか迷った。"
    },
    {
      when: "離婚後に仲介を頼んだ",
      t: "知人に間へ入ってもらってから月日がたち、また次の面会の時期が近づいてきた。もう一度仲介を頼むか、今度こそ{formerSpouse}へ直接手紙を書くか考えた。"
    },
    {
      when: "離婚後に直接連絡を控えた",
      t: "{formerSpouse}と連絡を取らないまま、子どもの学校の節目の行事が近づいてきた。日取りだけでも知らせる便りを出すべきか迷った。"
    },
    {
      t: "「次の休みはどうするの？」と子どもに尋ねられた。別れたときの取り決めを思い返し、{formerSpouse}へ何を伝えるか考えた。"
    }
  ];

  $terraData.EV.push({
    id: "kaz_knight_injury_adaptation",
    conf: "S",
    references: ["SRC_KAZIMIERZ_COMPETITION", "SRC_KAZIMIERZ_KNIGHT_LIFE_MODEL"],
    st: ["青年", "壮年", "老年"],
    need: ["身体機能の見直し時期"],
    cd: 1,
    w: 1,
    pri: true,
    t: "競技中に深く傷めた肩が、腕を高く上げる作業や重い荷を抱えるたびに鈍く疼く。競技場からは治療費も補償の音沙汰もないまま、この身体でどうやって日々の仕事と暮らしを回していくか考えた。",
    c: [
      $terraData.K("周囲に事情を話し、重い荷や腕を上げる作業を代わってもらう", {}, [
        1,
        "意地を張らずに肩の古傷のことを打ち明け、重い荷を一人で抱える役目を避けさせてもらった。疼きは消えないが、身体を壊さずに働き続けるやり方を探った。",
        {
          bodyChange: {
            id: "kaz-knight-shoulder",
            title: "競技中の肩の重傷",
            action: "adapt",
            accommodation: "重い荷物を分担し、腕を高く上げる作業を交替する",
            note: "仕事と家の役割を周囲と調整。専門医の診断を受けた記録ではない"
          },
          lifeGoal: {
            id: "physical-life-adjustment",
            title: "身体の変化に合わせて暮らしを続ける",
            priority: "生活の維持",
            action: "start"
          },
          p: 1
        }
      ]),
      $terraData.K(
        "地域の診療所で肩を診てもらい、サポーターで固定する（約2万龍門幣）",
        {
          en: { affordableMedicalCash: 2e4 },
          why: "診察と簡単な固定の目安約2万龍門幣に生活予備費を加えた現金が足りない"
        },
        [
          1,
          "診療所で肩の具合を診てもらい、痛みを逃がす腕の動かし方と固定用の装具をあつらえてもらった。2万龍門幣の出費は大きかったが、肩のぐらつきが収まって息がしやすくなった。",
          {
            cash: -2e4,
            bodyChange: {
              id: "kaz-knight-shoulder",
              title: "競技中の肩の重傷",
              action: "adapt",
              accommodation: "診療所で教わった範囲に動作を控え、痛みが続けば再診する",
              note: "診察と簡単な固定に約2万龍門幣。痛みが続けば再診する"
            },
            lifeGoal: {
              id: "physical-life-adjustment",
              title: "身体の変化に合わせて暮らしを続ける",
              priority: "回復と家計",
              action: "start"
            },
            h: 4,
            p: 2
          }
        ]
      ),
      $terraData.K("弱音は吐かず、痛みが強い日だけ騙し騙し腕を休める", {}, [
        1,
        "仕事や家の役目を減らしてほしいとはどうしても言い出せず、疼く日は冷やしながら来月まで様子を見ることにした。",
        {
          bodyChange: {
            id: "kaz-knight-shoulder",
            title: "競技中の肩の重傷",
            action: "review",
            status: "ongoing",
            reviewDelay: 2,
            note: "役割調整や診療を決めず、本人が経過観察を続ける"
          },
          p: -1,
          h: -2
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "kaz_knight_injury_job_transition",
    conf: "S",
    references: ["SRC_KAZIMIERZ_COMPETITION", "SRC_KAZIMIERZ_KNIGHT_LIFE_MODEL"],
    st: ["青年", "壮年", "老年"],
    need: ["身体に合わせた職務変更を考えられる"],
    cd: 5,
    once: true,
    w: 0.65,
      t: "古傷の肩をかばいながら働く要領は覚えたものの、無理が重なる日は夜も眠れないほど疼く。街の求人板で帳簿つけや受付補助の募集を見かけ、力仕事を離れて新しい職へ移るべきか考えた。",
    c: [
      $terraData.K(
        "応募・移動費5,000龍門幣を払い、帳簿や窓口補助の仕事に応募する",
        {
          show: { ge: { literacy: 40 } },
          en: s =>
            $rules.economy.availableFunds(s) >=
            5e3 * s.res.pm * (s.priceIndex || 1) + $rules.economy.annualReserve(s),
          why: "応募・移動費5,000龍門幣と生活予備費を残せない"
        },
        [
          0.45,
          "読み書きと計算の試験をどうにか突破し、事務の補助係として雇われた。剣や工具の代わりにペンを握る暮らしに変わり、肩が悲鳴を上げる日はぐっと減った。",
          {
            job: 21,
            cash: -5e3,
            pm: 1,
            p: -1,
            fl: { knight: 0 },
            lifeAffiliation: {
              id: "kazimierz-competition-career",
              action: "leave",
              onlyIfActive: true,
              note: "肩の負傷後、競技騎士の仕事を離れて事務補助へ移った"
            },
            lifeGoals: [
              {
                id: "kazimierz-competition-career",
                action: "compromise",
                onlyIfActive: true,
                note: "競技から離れ、肩に負担の少ない仕事へ移った"
              },
              {
                id: "physical-life-adjustment",
                title: "身体の変化に合わせて暮らしを続ける",
                priority: "回復と生計",
                action: "continue",
                note: "肩への負担が少ない帳簿・窓口補助の仕事へ移った"
              }
            ],
            lifeSkill: {
              id: "clerical-records",
              title: "帳簿整理と事務",
              delta: 2,
              context: "新しい職場で帳簿の照合と窓口補助を担当"
            },
            bodyChange: {
              id: "kaz-knight-shoulder",
              title: "競技中の肩の重傷",
              action: "adapt",
              accommodation: "帳簿・窓口補助へ移り、重い荷物を持つ作業を減らした"
            }
          }
        ],
        [
          1,
          "面接へ足を運んだが、すでに若い応募者で枠が埋まったあとだった。かかった5,000龍門幣は戻らず、疼く肩をさすりながら今の職場で次の機会を待つことにした。",
          {
            cash: -5e3,
            pm: 1,
            p: -2,
            bodyChange: {
              id: "kaz-knight-shoulder",
              title: "競技中の肩の重傷",
              action: "review",
              status: "adapted",
              reviewDelay: 3,
              accommodation: "現在の仕事で作業分担を続け、別の募集機会を待つ"
            }
          }
        ]
      ),
      $terraData.K("慣れない事務へ移るのはやめ、今の職場で肩をかばいながら働く", {}, [
        1,
        "今さら違う職種へ飛び込むのは控え、重い荷は同僚と二人がかりで持つようにして今の仕事を続けた。",
        {
          bodyChange: {
            id: "kaz-knight-shoulder",
            title: "競技中の肩の重傷",
            action: "adapt",
            accommodation: "現在の職場で重い物を同僚と分担し、痛みが戻れば再相談する"
          },
          lifeGoal: {
            id: "physical-life-adjustment",
            title: "身体の変化に合わせて暮らしを続ける",
            priority: "生活の維持",
            action: "continue"
          },
          p: 1
        }
      ]),
      $terraData.K(
        "今の仕事を続けながら、夜間に帳簿のつけ方を独学する（教本代1万龍門幣）",
        {
          en: s => $rules.economy.availableFunds(s) >= 1e4 + $rules.economy.annualReserve(s),
          why: "教材費1万龍門幣と生活予備費を残せない"
        },
        [
          1,
          "1万龍門幣で教本と練習帳を買い込み、仕事から帰ったあとの机で帳簿の計算を独学し始めた。いつか肩に優しい仕事へ移れるよう、眠い目をこすって数字を追い続けた。",
          {
            cash: -1e4,
            k: 2,
            lifeSkill: {
              id: "clerical-records",
              title: "帳簿整理と事務",
              delta: 3,
              context: "仕事の後に教材で基礎を練習"
            },
            bodyChange: {
              id: "kaz-knight-shoulder",
              title: "競技中の肩の重傷",
              action: "adapt",
              accommodation: "現在の仕事を続けながら帳簿整理を学び、役割変更の機会を待つ"
            },
            lifeGoal: {
              id: "physical-life-adjustment",
              title: "身体の変化に合わせて暮らしを続ける",
              priority: "技能と生計",
              action: "continue"
            }
          }
        ]
      )
    ]
  });

  $terraData.EV.push({
    id: "kaz_knight_later_career_review",
    conf: "S",
    references: ["SRC_KAZIMIERZ_COMPETITION", "SRC_KAZIMIERZ_KNIGHT_LIFE_MODEL"],
    st: ["壮年", "老年"],
    need: ["国:カジミエーシュ", "knight"],
    show: s => {
      const career = s.lifeRecord?.affiliations?.find(row => row.id === "kazimierz-competition-career");
      return (
        s.age >= 50 &&
        career?.status === "active" &&
        Number.isInteger(career.startedYear) &&
        s.year - career.startedYear >= 10
      );
    },
    once: true,
    w: 0.8,
    t: "競技場の砂塵のなかで剣を振るい続けて、もう十年以上が過ぎた。どれだけ試合を重ねても、傷んだ武具の修理代や次の大会の登録料は自分の懐から出ていく。若い選手たちの速さに息が上がるようになった今、このまま現役を続けるか、裏方の仕事へ退くか考えた。",
    c: [
      $terraData.K("武具を磨き直し、次の大会にも選手として出場登録する", {}, [
        1,
        "まだ剣は置けないと腹を決め、次の競技会にも選手として名を連ねた。きしむ身体に鞭打って稽古を続け、傷だらけの装甲に油を塗り直した。",
        {
          lifeAffiliation: {
            id: "kazimierz-competition-career",
            action: "continue",
            role: "競技会に出場する騎士"
          },
          lifeGoal: {
            id: "kazimierz-competition-career",
            action: "continue",
            onlyIfActive: true,
            note: "年齢を重ねても競技出場を続けると決めた"
          },
          lifeSkill: {
            id: "kazimierz-competition",
            title: "競技の訓練と試合準備",
            delta: 1,
            context: "長年の競技経験を振り返り、次の大会へ備えた"
          },
          p: -1
        }
      ]),
      $terraData.K(
        "剣を置き、競技会場の整備や武具管理の裏方へ応募する",
        {
          show: s =>
            !s.lifeRecord?.affiliations?.some(row => row.id === "kazimierz-arena-staff"),
          why: "競技会場の運営職に在籍した記録があり、再雇用は別途の働き口から探す必要がある"
        },
        [
          0.55,
            "長年の経験を買われ、競技会場の運営スタッフとして雇われた。選手登録の札を返上し、観客席の歓声を壁越しに聞きながら試合前の武具点検を受け持った。",
          {
            job: 32,
            fl: { knight: 0 },
            lifeAffiliation: {
              id: "kazimierz-competition-career",
              action: "leave",
              note: "競技出場を終え、会場運営へ移った"
            },
            lifeAffiliations: [
              {
                id: "kazimierz-arena-staff",
                title: "競技会場の運営職",
                kind: "employer",
                action: "join",
                role: "施設運営・整備"
              }
            ],
            lifeGoal: {
              id: "kazimierz-competition-career",
              action: "compromise",
              onlyIfActive: true,
              note: "競技選手から会場運営へ働き方を変えた"
            },
            lifeGoals: [
              {
                id: "kazimierz-arena-work",
                title: "会場の仕事で生活を立てる",
                priority: "生計と技能",
                action: "start"
              }
            ],
            lifeSkill: {
              id: "arena-operations",
              title: "施設運営と備品管理",
              delta: 2,
              context: "競技会場の運営職へ移り、施設と備品を管理"
            },
            p: 1
          }
        ],
        [
          1,
          "会場の裏方職はすでに引退した他の騎士たちで埋まっていた。今はまだ剣を握り続けるしかなく、次の大会に向けて防具の留め具を締め直した。",
          {
            lifeAffiliation: {
              id: "kazimierz-competition-career",
              action: "continue",
              onlyIfActive: true,
              role: "競技会場運営の募集を待つ競技騎士"
            },
            lifeGoal: {
              id: "kazimierz-competition-career",
              action: "continue",
              onlyIfActive: true,
              note: "会場運営の募集がなく、競技を続けながら機会を待つ"
            },
            p: -2
          }
        ]
      ),
      $terraData.K("選手登録を返上して引退し、競技場とは別の働き口を探す", {}, [
        1,
        "長年身につけた選手登録証を窓口へ返し、競技騎士の暮らしに終止符を打った。歓声の聞こえない街へ出て、老いた身体でも雇ってくれる仕事を探し始めた。",
        {
          job: 0,
          fl: { knight: 0 },
          lifeAffiliation: {
            id: "kazimierz-competition-career",
            action: "leave",
            note: "本人が競技騎士の仕事を終えた"
          },
          lifeGoal: {
            id: "kazimierz-competition-career",
            action: "abandon",
            onlyIfActive: true,
            note: "競技騎士の仕事を終え、次の働き口を探す"
          },
          p: -1
        }
      ])
    ]
  });
});
