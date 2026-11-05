// extensions/education-and-later-life/relationships-events-01: construction fragment; evaluation order is declared by data/extensions/education-and-later-life.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/education-and-later-life",
  "extensions/education-and-later-life/relationships-events-01"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  return [
    {
      id: "romance_followup",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["親しい相手がいる", "知り合って一年以上"],
      ban: ["既婚", "交際中"],
      ge: { age: 20 },
      le: { age: 48 },
      after: { id: "lov", min: 1, max: 6, choice: 0, outcome: 0, subject: "romance" },
      cd: 2,
      w: 1.8,
      t: [
        {
          when: "移動都市",
          t: "{romancePartner}とまた会おうと約束してから、仕事帰りに同じ食堂で何度もテーブルを挟んだ。ある夜は職場の愚痴を聞いて笑い合い、別の夜は相手が大切に思っている家族の話を聞いた。会うたび、別れ際が少し惜しくなる。"
        },
        {
          t: "{romancePartner}と何度か顔を合わせるうちに、仕事の疲れや家での何気ない習慣まで話すようになった。黙っていても居心地が悪くない時間が増えた一方で、ここから先へ踏み出すにはあと少し勇気が要った。"
        }
      ],
      c: [
        $terraData.K(
          "恋人として付き合ってほしいと伝える",
          { pw: [1, { when: "気質:社交的", x: 1.3 }, { when: "気質:慎重", x: 0.9 }] },
          [
            0.75,
            "相手も笑顔で頷いてくれ、次に会う約束を交わした。仕事や家の事情で会えない日があっても、焦らず二人の時間を重ねていこうと話し合った。",
            { romanceStage: "dating", rl: 7, p: 3, fl: { romance_dating: 1 } }
          ],
          [
            1,
            "相手は少し困ったように目を伏せ、そういう関係にはなれないと答えた。気まずい沈黙のあと、これまでのお礼を言って店を出た。夜風に吹かれながら、一緒に笑った時間を思い返した。",
            { romanceEnd: 1, rl: -4, p: -2, fl: { romance_ended: 1 } }
          ]
        ),
        $terraData.K("今はまだ、気の置けない友人として会う", {}, [
          1,
          "踏み込んだ言葉は飲み込み、また暇な時に食事でもしようと軽く手を振った。今の心地よい距離を壊さず、もう少し相手を知っていくことにした。",
          { romanceStage: "known", rl: 2, p: 1 }
        ]),
        $terraData.K("これ以上深入りせず、会うのをやめる", {}, [
          1,
          "お互いにこれ以上は会わない方がいいと伝え、席を立った。ひとりで歩く帰り道、これまで交わした言葉が胸の奥で静かに反響した。",
          { romanceEnd: 1, rl: -3, p: -2, fl: { romance_ended: 1 } }
        ])
      ]
    },
    {
      id: "romance_future_talk",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["交際中", "知り合って一年以上"],
      ban: ["既婚"],
      ge: { age: 20 },
      le: { age: 50 },
      after: { id: "romance_followup", min: 1, max: 6, choice: 0, outcome: 0, subject: "romance" },
      cd: 2,
      w: 1.8,
      t: [
        {
          when: "家計逼迫",
          t: "{romancePartner}とこれからの暮らしを話すたび、部屋の狭さや家賃、もしどちらかが倒れて働けなくなった時の不安が口をついて出た。それでも二人で生きていく道があるのか、会うたびに少しずつ言葉を交わした。"
        },
        {
          t: [
            "付き合いが長くなるにつれ、{romancePartner}と会う時間には、食事や仕事の話だけでなく、この先どこでどう暮らしたいかという話も混じるようになった。二人とも、そろそろ曖昧なままにはしておけないと感じていた。",
            "{romancePartner}と休みの日の予定を立てているうちに、これから先も同じ暮らしの中で会い続けるのかという話になった。仕事や住まいをどうするか、二人で一つずつ考えることにした。",
            "いつもの帰り道で、{romancePartner}と家賃や仕事、家族との付き合い方について話した。今の関係をこの先どうしたいのか、互いの考えを確かめる時期が来ていた。"
          ]
        }
      ],
      c: [
        $terraData.K("結婚も見据えて、一緒に暮らす将来を話し合う", {}, [
          1,
          "どこで暮らし、どう生計を立て、互いの親族にどう切り出すか。一つずつ二人で知恵を出し合い、同じ未来へ歩を進める約束をした。",
          { romanceStage: "committed", rl: 6, p: 2, fl: { romance_committed: 1 } }
        ]),
        $terraData.K("今はまだ結論を急がず、このまま付き合いを続ける", {}, [
          1,
          "今すぐ答えを出すのはやめようと伝え、これまで通り会う時間を大切にした。将来の話は、もう少し状況が落ち着いてからまた向き合うことにした。",
          { romanceStage: "dating", rl: 3, p: 1 }
        ]),
        $terraData.K("これ以上同じ道は歩めないと別れを切り出す", {}, [
          1,
          "この先の暮らしを一緒に描くことはできないと伝え、別れを選んだ。しばらくの間、相手とよく歩いた通りを避けて通った。",
          { romanceEnd: 1, rl: -8, p: -5, fl: { romance_ended: 1 } }
        ])
      ]
    },
    {
      id: "romance_marriage_choice",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["結婚意思確認後一年以上"],
      ban: ["既婚"],
      ge: { age: 20 },
      le: { age: 52 },
      after: { id: "romance_future_talk", min: 1, max: 7, choice: 0, outcome: 0, subject: "romance" },
      cd: 2,
      w: 2.0,
      t: "互いの家族へ挨拶に行く日取りや、ささやかな祝いの席にいくらかかるかを指折り数えた。仕事を休める日も見計らいながら、{romancePartner}とこれからの所帯の持ち方を相談した。",
      c: [
        $terraData.K(
          "親しい人たちを招き、ささやかな式を挙げて結婚する（費用 {romanceCeremonyCost}）",
          {
            en: { affordableCash: 8e4 },
            why: "祝いの席と食事に必要な {romanceCeremonyCost} を今の懐具合では用意できない"
          },
          [
            1,
            "気心の知れた人たちを招き、温かい料理を囲んで祝言を挙げた。帰り道、少し軽くなった財布を確かめ合いながら、二人で新しい家路についた。",
            { sp: 1, cash: -8e4, pm: 1, rl: 14, p: 5 }
          ]
        ),
        $terraData.K("式は挙げず、二人だけで夫婦になる", {}, [
          1,
          "派手な祝いの席は設けず、二人だけで夫婦の契りを交わした。遠くの親族へ知らせる手紙は、言葉を何度も選び直してようやく投函した。",
          { sp: 1, rl: 12, p: 4 }
        ]),
        $terraData.K("届は出さず、まずは同じ屋根の下で暮らし始める", {}, [
          1,
          "世間体や親族への挨拶は後回しにして、二人で一つの部屋に荷物を運び込んだ。世間の目は場所によって様々だったが、まずは毎日の食事と家賃を分け合う暮らしが始まった。",
          { romanceStage: "cohabiting", rl: 9, p: 3, fl: { romance_cohabiting: 1 } }
        ]),
        $terraData.K("結婚はもう少し先にして、今のまま交際を続ける", {}, [
          1,
          "まだ所帯を持つ準備が整わないと話し合い、もうしばらく今の距離で付き合いを続けることにした。",
          { romanceStage: "dating", rl: 2, p: 1 }
        ]),
        $terraData.K("結婚への思いがすれ違い、別れる", {}, [
          1,
          "結婚を望む時期や暮らしのイメージがどうしても重ならず、別れることになった。二人で見に行った家具や部屋の記憶が、しばらく胸に刺さった。",
          { romanceEnd: 1, rl: -10, p: -5, fl: { romance_ended: 1 } }
        ])
      ]
    },
    {
      id: "romance_cohabitation_review",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["同居する恋人"],
      ban: ["既婚"],
      ge: { age: 20 },
      le: { age: 55 },
      after: { id: "romance_marriage_choice", min: 1, max: 4, choice: 2, outcome: 0, subject: "romance" },
      cd: 2,
      w: 0.55,
      t: "同じ部屋で暮らし始めてから、日々の食費や掃除・洗濯の分担がすっかり日常になった。ただ、部屋の契約名義や親族への紹介をどうするか、宙ぶらりんのままになっている。",
      c: [
        $terraData.K("財布は分けつつ、今の気楽な同居を続ける", {}, [
          1,
          "お互いに稼ぎを見せ合い、家賃や食費だけ決まった額を出し合うことにした。今の風通しのいい暮らしを、もうしばらく続けることにした。",
          { cash: -18000, rl: 4, p: 2, romanceStage: "cohabiting" }
        ]),
        $terraData.K("けじめをつけて、正式に夫婦になる", {}, [
          1,
          "曖昧な関係を卒業し、正式に夫婦として届け出た。式は挙げなかったが、その夜は少しだけいい酒を開けて二人で乾杯した。",
          { sp: 1, rl: 8, p: 3 }
        ]),
        $terraData.K("同居を解消し、関係も終える", {}, [
          1,
          "同じ部屋で暮らす息苦しさに耐えきれなくなり、荷物を分けて別れた。合鍵をテーブルに置き、それぞれの新しい住まいを探しに出た。",
          { romanceEnd: 1, rl: -8, p: -4, fl: { romance_ended: 1 } }
        ])
      ]
    },
    {
      id: "romance_resolve_safety",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["交際中"],
      ban: ["既婚"],
      ge: { age: 24 },
      le: { age: 55 },
      show: s => {
        const met = s.romance?.metYear || s.year;
        return (s.year - met >= 4) && (s.romance?.stage === "dating" || s.romance?.stage === "committed" || s.romance?.stage === "cohabiting");
      },
      cd: 2,
      w: 2.2,
      t: "{romancePartner}と付き合い始めてから長い年月が流れた。互いの癖も日々の暮らしも知り尽くした今、このまま曖昧な距離を保ち続けるか、それとも二人で正式な家庭を築くか、これからの生き方に結論を出す時が来ていた。",
      c: [
        $terraData.K(
          "正式に婚姻を結び、夫婦として歩み出す",
          {},
          [
            1,
            "これまでの歳月を振り返りながら、生涯を共に支え合う誓いを交わした。派手な祝いはなくても、二人の歩んできた確かな時間がこれからの暮らしを支えてくれると確信した。",
            { sp: 1, rl: 10, p: 5 }
          ]
        ),
        $terraData.K(
          "夫婦の形にはこだわらず、同じ部屋での同居生活を続ける",
          {},
          [
            1,
            "形式ばった婚姻ではなく、実質的な支え合いとして同じ屋根の下で暮らし続けることを選んだ。肩書きに縛られない二人の距離感を大切にしていくことにした。",
            { romanceStage: "cohabiting", rl: 5, p: 2, fl: { romance_cohabiting: 1 } }
          ]
        ),
        $terraData.K(
          "互いの進む道の違いを受け入れ、穏やかに別れを選ぶ",
          {},
          [
            1,
            "長い付き合いの中で生まれた微細なすれ違いを認め合い、互いの未来を縛らないために別れを告げた。流れた歳月への感謝を伝え、それぞれ別の道へ歩き出した。",
            { romanceEnd: 1, rl: -6, p: -3, fl: { romance_ended: 1 } }
          ]
        )
      ]
    },
    {
      id: "family_sibling_birth",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      st: ["幼児", "児童", "少年"],
      need: ["親存命", "きょうだいを増やせる"],
      cd: 3,
      w: 0.55,
      t: [
        {
          when: "家計逼迫",
          t: "親から、もうすぐ家に赤ん坊が生まれると聞かされた。嬉しい知らせのはずなのに、狭い部屋のどこに寝かせるか、食費やあなたの家の手伝いがどう増えるか、大人たちの深刻な話し声も聞こえてきた。"
        },
        {
          t: "もうすぐ家に赤ん坊が生まれると聞いた。親が小さな産着や寝床を整えているのを見ながら、自分が頼まれる家の手伝いもこれから増えるのだろうかと思った。"
        }
      ],
      c: [
        $terraData.K("おむつや布運びを手伝い、赤ん坊の名前を一緒に考える", {}, [
          1,
          "元気な産声が響き、家族みんなで名前を考えた。お湯や清潔な布を運んで手伝い、夜泣きの声に目を覚ます慌ただしい日々が始まった。",
          { sibBirth: 1, rl: 3, p: 2, fl: { sibling_born: 1, sibling_supported: 1 } }
        ]),
        $terraData.K("自分の日課をこれまで通り続ける", {}, [
          1,
          "赤ん坊が生まれて家の中は急に賑やかになった。いつもの日課を続けようとしたが、夜中に泣き声で目が覚めることもあった。",
          { sibBirth: 1, p: 1, fl: { sibling_born: 1 } }
        ]),
        $terraData.K("口数が増えることで家の暮らしが苦しくならないか心配する", {}, [
          1,
          "赤ん坊は可愛かったが、家の財布がさらに寂しくなる不安は消えなかった。水汲みや掃除をこなしながら、自分に必要な品を買ってよいかためらった。",
          { sibBirth: 1, cash: -2e4, p: -2, rl: -1, fl: { sibling_born: 1 } }
        ])
      ]
    },
    {
      id: "family_sibling_exposure",
      conf: "S",
      references: ["SRC_ORIPATHY_EXPOSURE", "SRC_TERRA_FAMILY"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["存命の成人きょうだいがいる"],
      show: s => !!siblingForEvent(s, "family_sibling_exposure"),
      ge: { age: 14 },
      cd: 1,
      w: 0.3,
      t: [
        {
          when: "対象の別居きょうだい",
          t: "離れて暮らす{sibling}から、源石の破片が混じった廃材で指を深く切ってしまったと震える字の手紙が届いた。医者で検査を受けるか、雇い主に話をつけるか、どう支えてほしいか本人に尋ねた。"
        },
        {
          t: "{sibling}が廃材運びの仕事から帰ってきたあと、指先の深い傷口に黒く光る粒が食い込んでいるのに気づいた。廃材に割れた源石の欠片が混じっていたらしい。医者に診せるか、雇い主に掛け合うか、青い顔をする本人と話し合った。"
        }
      ],
      c: [
        $terraData.K(
          "本人の意思を確かめ、すぐ診療所で検査を受けさせる（費用 {siblingExposureTestCost}）",
          { en: { affordableCash: 3e4 }, why: "検査と交通費の{siblingExposureTestCost}を出すと、日々の生活費が足りなくなる" },
          [
            0.45,
            "本人が希望して検査を受け、検査結果は{sibling}本人から聞いた。費用{siblingExposureTestCost}を払い、これからの暮らしについて本人の希望を尋ねた。",
            {
              sibInf: 1,
              sibInfCause: "廃材に混じった源石結晶片による皮膚損傷",
              cash: -3e4,
              pm: 1,
              p: -7,
              rl: 2,
              fl: { sibling_exposure_seen: 1 },
              infectionAwarenessActions: [
                { subject: "sibling", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "voluntary", recipientRef: "current-clinic" },
                { subject: "sibling", audience: "protagonist", certainty: "confirmed", source: "relative-disclosure", consent: "voluntary", recipientRef: "protagonist" },
                { subject: "sibling", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "voluntary", recipientRef: "current-clinic" }
              ]
            }
          ],
          [
            1,
            "駆け込んだ診療所ではすぐには血液検査ができず、傷口の洗浄と手当だけで帰された。処置費{siblingExposureWoundCareCost}を払い、感染したかどうかも分からない不安を抱えたまま次の診察日を待った。",
            { cash: -1e4, pm: 1, p: -3, sibExposurePending: 1, fl: { sibling_exposure_seen: 1 } }
          ]
        ),
        $terraData.K(
          "本人に頼まれ、仕事先へ労災の掛け合いに行く",
          { en: { affordableCash: 2e4 }, why: "移動や当面の処置に使う{siblingExposureReportReserve}を生活費のほかに用意できない" },
          [
            0.65,
            "{sibling}に付き添って現場の監督へ怪我の経緯を訴えた。渋々ながら事故として認められ、検査費用の一部が出ることになった。",
            {
              cash: -1e4,
              pm: 1,
              rl: 2,
              cr: 1,
              sibExposurePending: 1,
              sibExposureEmployerResponse: "partial-cost",
              fl: { sibling_exposure_seen: 1 }
            }
          ],
          [
            1,
            "仕事先へ怪我の経緯を訴えたが、「うちの現場に源石片などなかった」とシラを切られ、一銭も出してもらえなかった。唇を噛みながら、自腹で診てもらえる診療所を探した。",
            {
              cash: -2e4,
              pm: 1,
              p: -3,
              sibExposurePending: 1,
              sibExposureEmployerResponse: "denied",
              fl: { sibling_exposure_seen: 1 }
            }
          ]
        ),
        $terraData.K("無理に検査を急かさず、本人の気持ちが落ち着くのを待つ", {}, [
          1,
          "怖いなら無理に今すぐ医者へ行かなくていいと伝え、本人の判断に任せた。傷口がどうなるか不安は消えないが、いつでも力になると伝えておいた。",
          { p: -2, rl: 1, sibExposurePending: 1, fl: { sibling_exposure_seen: 1 } }
        ])
      ]
    },
    {
      id: "family_sibling_exposure_followup",
      conf: "S",
      references: ["SRC_ORIPATHY_EXPOSURE", "SRC_TERRA_FAMILY"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["対象きょうだいに再診予定"],
      cd: 1,
      w: 0.8,
      t: [
        {
          when: "対象きょうだいの仕事先が前回の検査費を一部負担",
          t: "前に掛け合った仕事先は最初の検査代を少しだけ出したが、それっきりだった。{sibling}から「そろそろ再検査の時期だけれど、仕事を休むと言い出しづらい」と相談が届いた。"
        },
        {
          when: "対象きょうだいの仕事先が曝露報告を退けた",
          t: "雇い主に労災を突っぱねられたまま、{sibling}の再検査の時期がやって来た。費用も仕事の休みも自分で工面しなければならず、本人もどうするか迷っていた。"
        },
        {
          when: "対象の別居きょうだい",
          t: "前に源石片で指を切った{sibling}から、再検査を受けるべきか迷っていると手紙が来た。仕事を休めば日当が減るし、もし陽性だったらと思うと足がすくむらしい。"
        },
        {
          t: "源石片で傷を負った{sibling}の再検査の日が近づいてきた。検査代や仕事の休みをどうするか、本人の気持ちを確かめた。"
        }
      ],
      c: [
        $terraData.K(
          "本人の背中を押し、費用を出して再検査を受けさせる",
          { en: { affordableCash: 2e4 }, why: "再検査と交通費の{siblingExposureRetestCost}を出すと、生活費が足りなくなる" },
          [
            0.45,
            "覚悟を決めて再検査を受けた{sibling}は、鉱石病にかかっていると診断された。費用{siblingExposureRetestCost}を払い、これからどう薬代や通院を続けていくか一緒に考えた。",
            {
              sibInf: 1,
              sibInfCause: "廃材に混じった源石結晶片による皮膚損傷",
              cash: -2e4,
              pm: 1,
              p: -5,
              rl: 2,
              sibInfectionDiscussed: 1,
              fl: { sibling_infection_discussed: 1 },
              infectionAwarenessActions: [
                { subject: "sibling", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "voluntary", recipientRef: "current-clinic" },
                { subject: "sibling", audience: "protagonist", certainty: "confirmed", source: "relative-disclosure", consent: "voluntary", recipientRef: "protagonist" },
                { subject: "sibling", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "voluntary", recipientRef: "current-clinic" }
              ]
            }
          ],
          [
            1,
            "再検査でも白黒ははっきりつかず、もうしばらく経過を見るよう言われた。費用{siblingExposureRetestCost}を払い、モヤモヤした不安を抱えたまま帰路についた。",
            { cash: -2e4, pm: 1, sibExposureReviewDelay: 1, p: -1 }
          ]
        ),
        $terraData.K("安く診てくれる巡回診療や支援先がないか当たってみる", {}, [
          1,
          "少しでも安く検査を受けられる場所がないか聞き回ったが、すぐには空きが見つからなかった。{sibling}と話し合い、また来年にでも空きを確かめることにした。",
          { sibExposureReviewDelay: 1, rl: 1 }
        ]),
        $terraData.K("周りから受診を急かすのはやめ、本人が決めるまで待つ", {}, [
          1,
          "これ以上こちらから医者へ行けと急かすのはやめ、{sibling}が自分で受けたくなったら教えてくれと伝えた。",
          { sibExposureClose: 1, p: 1, rl: 1 }
        ])
      ]
    },
    {
      id: "family_sibling_bereavement",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["きょうだいの訃報"],
      cd: 1,
      pri: true,
      w: 0.18,
      t: "{siblingDeathTiming}、{sibling}が亡くなったという知らせが届いた。死因は{siblingDeathCause}だという。最後に顔を合わせた時に話したのは、思い返せばどうでもいい日常の雑談だった。葬儀の日取りを聞き、財布の中の小銭と紙幣を数えた。",
      c: [
        $terraData.K(
          "仕事を休んで葬儀へ駆けつける（旅費・休業の備え {siblingBereavementTravelCost}）",
          {
            en: { affordableCash: 2e4 },
            why: "旅費と仕事を休む間の備え{siblingBereavementTravelCost}を用意できない"
          },
          [
            1,
            "{siblingBereavementTravelCost}を工面して葬儀へ駆けつけ、{sibling}の生前を知る人たちと昔話を交わした。帰り道はすっかり夜更けになったが、最後に家族のそばにいられてよかった。",
            { sibDeathNotice: 1, cash: -2e4, pm: 1, p: -10, rl: 3, fl: { sibling_bereaved: 1 } }
          ]
        ),
        $terraData.K("どうしても都合がつかないと詫び、悔やみの手紙を送る", {}, [
          1,
          "仕事や旅費の都合がつかず、行けないことを親族へ詫びた。短い悔やみの手紙を託し、参列した親族にあとで最期の様子だけでも聞かせてほしいと頼んだ。",
          { sibDeathNotice: 1, p: -8, rl: -2, fl: { sibling_bereaved: 1 } }
        ]),
        $terraData.K(
          "行けない代わりに、遺された家族へ{siblingBereavementSupportAmount}を送る",
          {
            en: { affordableCash: 5e4 },
            why: "香典と支援の{siblingBereavementSupportAmount}を出すと、自分の生活費が足りなくなる"
          },
          [
            1,
            "駆けつけられない代わりに、葬儀代や当面の食費の足しにと{siblingBereavementSupportAmount}を送った。送金を済ませても、もうこの世に{sibling}がいないという実感がどうしても湧かなかった。",
            {
              sibDeathNotice: 1,
              sibBereavementSupport: 1,
              cash: -5e4,
              pm: 1,
              p: -9,
              rl: 2,
              fl: { sibling_bereaved: 1 }
            }
          ]
        )
      ]
    },
    {
      id: "family_sibling_infection",
      conf: "S",
      references: ["SRC_ORIPATHY_EXPOSURE", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["感染した同居きょうだいがいる", "対象の同居感染きょうだいと未相談"],
      cd: 1,
      w: 0.45,
      t: "同じ家で暮らす{sibling}が鉱石病にかかっていると分かった。親族のひとりは「世間に知られたら終わりだから絶対に隠せ」と声を潜め、もうひとりは「とにかく診てくれる医者を探そう」と言い張った。どこで移ったのかも分からないまま、家の中に重苦しい空気が立ち込めた。",
      c: [
        $terraData.K(
          "最初の診察代と交通費を出し、これからも通院を支える（年額目安 {siblingCareAnnualCost}）",
          {
            show: s => s.age >= 18,
            en: { affordableCash: 3e4 },
            why: "初回の診察代と交通費を出すと、当面の生活費が足りなくなる",
            pw: [1, { when: "感染者への偏見に疑問", x: 1.3 }, { when: "感染者偏見", x: 0.65 }]
          },
          [
            1,
            "財布から当面の診察代と交通費を出し、これからの薬代も一緒に工面していくから安心しろと{sibling}に伝えた。",
            {
              cash: -3e4,
              pm: 1,
              rl: 5,
              p: 1,
              sibTreatment: 1,
              sibInfectionDiscussed: 1,
              fl: { sibling_infection_discussed: 1, family_infection_support: 1 }
            }
          ]
        ),
        $terraData.K(
          "{sibling}本人に、外の人に相談してもいいかそっと尋ねる",
          { show: s => s.age < 18 },
          [
            0.7,
            "{sibling}は「信頼できる相談先なら話してもいい」と小さく頷いた。その言葉を大人たちに伝え、診てくれる医者や交通費の工面を話し合った。",
            { sibTreatment: 0, sibInfectionDiscussed: 1, fl: { sibling_infection_discussed: 1 }, p: 1 }
          ],
          [
            1,
            "{sibling}は怯えた目で首を振り、家の外には絶対に知られたくないと言った。身内だけで口を固め、こっそり通える診療所を探すことにした。",
            { sibTreatment: 0, sibInfectionDiscussed: 1, fl: { sibling_infection_discussed: 1 }, p: -1 }
          ]
        ),
        $terraData.K(
          "本人の許しを得て、感染者を支援している場所へ相談に行く",
          { show: s => s.age >= 18 },
          [
            0.7,
            "{sibling}の了解を得て支援所を訪ね、嫌な顔をされずに診てもらえる診療所や通い方の知恵を借りた。",
            {
              rl: 4,
              p: 1,
              sibTreatment: 0,
              sibInfectionDiscussed: 1,
              fl: { sibling_infection_discussed: 1, discrimination_complaint: 1 },
              infectionAwarenessAction: { subject: "sibling", audience: "support-service", certainty: "confirmed", source: "support-referral", consent: "voluntary", recipientRef: "current-support-service" }
            }
          ],
          [
            1,
            "頼れそうな支援先は見つからず、{sibling}自身も外で病名を口にすることに怯えていた。結局、家族だけで秘密を抱え込みながら医者を探すことになった。",
            {
              p: -3,
              rl: -1,
              sibTreatment: 0,
              sibInfectionDiscussed: 1,
              fl: { sibling_infection_discussed: 1 }
            }
          ]
        ),
        $terraData.K(
          "近所の目を恐れ、病気のことは徹底して隠す",
          {
            show: s => s.age >= 18,
            pw: [1, { when: "地域の感染者圧力が強い", x: 1.6 }, { when: "感染者偏見", x: 1.4 }]
          },
          [
            1,
            "近所に勘づかれないよう窓を閉め切り、身内の外には一切口外しないことに決めた。高い薬代を払い続ける余裕もなく、人目を忍んで診てもらえる場所を探す暗い日々が続いた。",
            {
              p: -5,
              rl: -3,
              sibTreatment: 0,
              sibInfectionDiscussed: 1,
              fl: { sibling_infection_discussed: 1 }
            }
          ]
        )
      ]
    },
    {
      id: "family_care_network_contact",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["養育ネットワークとの連絡時期"],
      once: true,
      cd: 1,
      w: 0.42,
      t: s => {
        const n=s.care?.supportNetwork,
          last=n?.lastContactYear,
          separated=(n?.contactHistory||[]).find(row=>row.state==="review_scheduled")?.year,
          year=Number.isInteger(last) ? last : separated,
          elapsed=Number.isInteger(year) && year<=s.year ? s.year-year : null;
        const time=elapsed===null ? "ふと昔の縁を思い返す季節になった。" :
          elapsed===0 ? "今年も、昔世話になった人たちの顔が浮かんだ。" :
          (Number.isInteger(last) ? `前に便りを出してから${elapsed}年が経った。` :
            `独り立ちして家計を分けてから${elapsed}年が経った。`);
        return time+"幼い頃に面倒を見てくれた{careNetwork}の人たちへ、これからどう便りを出すか考えた。";
      },
      c: [
        $terraData.K("手紙を書き、今も元気に暮らしていると知らせる", {}, [
          1,
          "昔育ててもらったお礼と、今の仕事や暮らしぶりを手紙に綴った。また数年後に便りを出すと書き添えて封をした。",
          { careNetworkContact: "regular", rl: 2, p: 1 }
        ]),
        $terraData.K(
          "休みを取って、直接顔を見せに行く",
          { en: { affordableCash: 50000 }, why: "往復の旅費と仕事を休む間の5万龍門幣を用意できない" },
          [
            1,
            "5万龍門幣を工面して、{careNetwork}の人たちのもとへ顔を見せに行った。懐かしい食卓で昔話に花を咲かせ、また折を見て連絡すると約束した。",
            { careNetworkContact: "visit", cash: -50000, pm: 1, rl: 4, p: 2 }
          ]
        ),
        $terraData.K("季節の挨拶だけ送り、気楽な距離でつながっておく", {}, [
          1,
          "返事を急かさない短い季節の便りだけ送り、お互い無理のない距離で縁を繋いでおくことにした。",
          { careNetworkContact: "distant", rl: 1 }
        ]),
        $terraData.K("これまでのお礼を伝え、こちらからの連絡はこれで最後にする", {}, [
          1,
          "これまで育ててくれたことへの感謝を丁寧に綴り、これからはそれぞれの暮らしを歩むと伝えて筆を置いた。",
          { careNetworkContact: "end", p: -2, rl: -2 }
        ])
      ]
    },
    {
      id: "family_care_network_move_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS", "SRC_MOBILE_CITY_MOBILITY"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["養育ネットワークの転居を知る"],
      cd: 1,
      w: 0.5,
      t: "幼い頃に世話になった{careNetwork}の人たちが、住み慣れた{careNetworkMoveFrom}を離れて{careNetworkMoveTo}へ移り住んだという。{careNetworkMoveChannel}。新しい土地でどう暮らしているのか、返事を書こうと便箋を広げた。",
      c: [
        $terraData.K("新しい街での暮らしぶりを尋ね、これからも便りを続ける", {}, [
          1,
          "{careNetworkMoveTo}での暮らしはどうかと気遣う言葉と、昔世話になったお礼を添えて手紙を出した。",
          { careNetworkMoveNotice: 1, careNetworkContact: "regular", rl: 3, p: 1 }
        ]),
        $terraData.K("新しい宛先だけ控えておき、立ち入った事情は聞かない", {}, [
          1,
          "引っ越し先の住所だけ書き留め、無事を祈る短い返事を出した。詳しい事情は向こうから話してくれるまで待つことにした。",
          { careNetworkMoveNotice: 1, careNetworkContact: "distant", rl: 1 }
        ]),
        $terraData.K("知らせを受け取ったお礼だけ短く返す", {}, [
          1,
          "転居の知らせを受け取ったことと、道中の無事を喜ぶ一言だけ書いて返した。",
          { careNetworkMoveNotice: 1, careNetworkContact: "distant" }
        ])
      ]
    },
    {
      id: "romance_daily_market_walk",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["交際中"],
      ban: ["既婚"],
      cd: 3,
      w: 0.65,
      t: [
        "移動都市の居住区画の市場で、仕事帰りに{romancePartner}と待ち合わせた。屋台から漂う香辛料の匂いに誘われて串焼きを半分ずつ分け合い、雑踏を並んで歩きながら何気ない世間話に笑い合った。",
        "露店の並ぶ通りを{romancePartner}とそぞろ歩きした。通り抜ける風に混じる揚げ菓子の香りに足を止め、紙包みを分け合ってつまみながら他愛のない話で笑顔を交わした。"
      ],
      fx: { p: 2, rl: 1 }
    },
    {
      id: "romance_daily_roof_breeze",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES", "SRC_MOBILE_CITY_MOBILITY"],
      st: ["青年", "壮年"],
      need: ["交際中"],
      ban: ["既婚"],
      cd: 3,
      w: 0.6,
      t: [
        "区画の端にある連絡通路の手すりに寄りかかり、{romancePartner}と遠くの荒野に沈む夕日を眺めた。都市の低い走行音が足元を揺らすなか、仕事の疲れを静かに分かち合った。",
        "都市の外壁近くの踊り場で、{romancePartner}と並んで夜風に当たった。区画の灯りが遠くまで連なる景色を見下ろしながら、どちらからともなく肩を寄せ合って息をついた。"
      ],
      fx: { p: 3, rl: 1 }
    },
    {
      id: "romance_daily_rain_shelter",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["交際中"],
      ban: ["既婚"],
      cd: 3,
      w: 0.6,
      t: [
        "都市の移動に伴う天候変化で、突然の冷たい通り雨に見舞われた。アーケードの軒下で{romancePartner}と身を寄せ合い、温かい茶の缶を二人で包み込むようにして雨宿りをした。",
        "俄雨に降られ、{romancePartner}と近くの食堂のひさしへ駆け込んだ。濡れた肩をハンカチで拭き合いながら、思いがけない雨宿りに顔を見合わせて笑った。"
      ],
      fx: { p: 2, rl: 2 }
    },
    {
      id: "romance_daily_letter_exchange",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["交際中"],
      ban: ["既婚"],
      cd: 3,
      w: 0.55,
      t: [
        "互いの仕事のシフトがすれ違い、なかなか顔を合わせられない週が続いた。部屋の扉の隙間に{romancePartner}からの短い手紙と好みの乾菓子が挟まれており、離れていても気遣ってくれる温もりに胸がほどけた。",
        "何日も会えない日が続いたある晩、{romancePartner}から便りが届いた。「身体に気をつけて、また次の休みに会おう」という素朴な筆跡を、寝床の灯りの下で何度も読み返した。"
      ],
      fx: { p: 2, rl: 1 }
    },
    {
      id: "romance_daily_modest_gift",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["交際中"],
      ban: ["既婚"],
      cd: 3,
      w: 0.55,
      t: [
        "街角の小間物屋で、{romancePartner}の髪や服に似合いそうなささやかな留め具を見つけて買い求めた。次に会ったときに手渡すと、相手は驚いたあとに破顔し、大切そうに胸に押し当ててくれた。",
        "露店で見かけた実用的な革の小袋を、{romancePartner}への日頃の感謝に添えて贈った。相手は照れくさそうに笑いながら、さっそく腰のベルトに結びつけて見せてくれた。"
      ],
      fx: { p: 3, rl: 2, cash: -2000 }
    },
    {
      id: "romance_daily_shared_meal",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["交際中"],
      ban: ["既婚"],
      cd: 3,
      w: 0.6,
      t: [
        "休日の昼下がり、お互いに持ち寄った食材で簡単な温かいスープを作った。味付けの濃淡を言い合いながら{romancePartner}と鍋を囲む時間は、どんな外食よりも心が満たされた。",
        "手狭な台所で、{romancePartner}と一緒に昼食の支度をした。野菜の皮むきを手伝ってもらいながら他愛のない冗談を言い合い、出来上がった料理を二人で並んで平らげた。"
      ],
      fx: { p: 3, rl: 2 }
    },
    {
      id: "romance_daily_cohabiting_laundry",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["同居する恋人"],
      ban: ["既婚"],
      cd: 3,
      w: 0.65,
      t: [
        "狭い借間の窓辺で、洗い立ての衣服を{romancePartner}と並んで物干し竿にかけた。区画の換気ダクトから流れる乾いた風に揺れる二人の服を見上げ、一つの部屋で暮らしている実感を噛みしめた。",
        "休日の朝、溜まった洗濯物を二人で手分けして洗った。シーツの端と端を持ち合ってパンと張りを確かめながら、共同生活の何気ない手応えに笑みをこぼした。"
      ],
      fx: { p: 2, rl: 2 }
    },
    {
      id: "romance_daily_cohabiting_morning",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["同居する恋人"],
      ban: ["既婚"],
      cd: 3,
      w: 0.65,
      t: [
        "始業ベルの鳴る慌ただしい朝、{romancePartner}とコートの背中の埃を払い合い、部屋の合鍵を確かめて玄関を出た。「気をつけて」と背中にかけられた声が、寒い廊下を歩く足取りを温かくした。",
        "出勤前の短い時間に、二人で温かい茶を一杯ずつ飲み干した。「今日も一日、無事に過ごそう」と{romancePartner}と目礼を交わし、それぞれの仕事場へと向かった。"
      ],
      fx: { p: 2, rl: 1 }
    },
    {
      id: "romance_daily_cohabiting_budget_relief",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年"],
      need: ["同居する恋人"],
      ban: ["既婚"],
      cd: 3,
      w: 0.6,
      t: [
        "月末の夜、テーブルの上に広げた家計簿と封筒を二人で見つめた。家賃と食費を出し合い、今月もなんとかやりくりできたことを確かめ合って、{romancePartner}と安堵の笑みを交わした。",
        "食費の残金を数えながら、今月余った小銭で少しだけ上等な茶葉を買おうと{romancePartner}と相談した。質素ながらも二人で生活を切り盛りする手応えを感じた。"
      ],
      fx: { p: 2, rl: 2 }
    },
    {
      id: "family_daily_spouse_cooking",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年", "老年"],
      need: ["既婚"],
      show: s => $rules.family.spouseLivesWithProtagonist(s),
      cd: 3,
      w: 0.65,
      t: [
        "厳しい冷え込みの夜、仕事から戻ると食卓から湯気が立ち上っていた。{sp}が安い根菜をじっくり煮込んだ熱いスープをよそってくれ、息を吹きかけながら身体の芯を温めた。",
        "仕事帰りの冷えた手で扉を開けると、台所から香ばしい匂いが漂ってきた。{sp}が焼き上げたパンと温かいシチューを囲み、今日一日の出来事を語り合いながら夕餉をとった。"
      ],
      fx: { p: 3, rl: 2 }
    },
    {
      id: "family_daily_spouse_worn_clothes",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年", "老年"],
      need: ["既婚"],
      show: s => $rules.family.spouseLivesWithProtagonist(s),
      cd: 3,
      w: 0.6,
      t: [
        "ランプの灯りの下で、{sp}が作業着の擦り切れた袖口を針と糸で丁寧に繕ってくれた。「新婚のころ、この服を買うのも思い切りが要ったわね」と昔を懐かしみながら、針を進める横顔を眺めた。",
        "ほつれた外套のボタンを{sp}が手際よく縫い止めてくれた。道具を大切に使い回す暮らしのなかで、長年連れ添ってきた伴侶の細やかな気遣いが胸に沁みた。"
      ],
      fx: { p: 3, rl: 2 }
    },
    {
      id: "family_daily_spouse_errand_together",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年", "老年"],
      need: ["既婚"],
      show: s => $rules.family.spouseLivesWithProtagonist(s),
      cd: 3,
      w: 0.6,
      t: [
        "非番の午後、買い物籠を提げて{sp}と二人で市場へ出かけた。日持ちする乾物や穀物の値段を比べ合いながら、帰り道には小さな焼き菓子を一つ買って分け合った。",
        "週末の生活区画を{sp}と並んで歩き、調味料や生活必需品を買い足した。荷物を半分ずつ持ち合い、すれ違う顔見知りの住民に軽く会釈を返しながら家路についた。"
      ],
      fx: { p: 2, rl: 2 }
    },
    {
      id: "family_daily_spouse_health_care",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年", "老年"],
      need: ["既婚"],
      show: s => $rules.family.spouseLivesWithProtagonist(s),
      cd: 3,
      w: 0.55,
      t: [
        "一日中立ち仕事で強張った背中を、{sp}が温かい手でさすってくれた。淹れてくれたハーブの香る茶をすすりながら、明日もまた二人で乗り切ろうと静かに頷き合った。",
        "仕事の疲労で肩が凝っているのを見て、{sp}が手ぬぐいを温めて首筋に当ててくれた。温もりが身体に染み渡るなか、相手の健康も気遣いながら言葉を交わした。"
      ],
      fx: { p: 3, rl: 2, h: 2 }
    },
    {
      id: "family_daily_spouse_holiday_stroll",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES", "SRC_MOBILE_CITY_MOBILITY"],
      st: ["青年", "壮年", "老年"],
      need: ["既婚"],
      show: s => $rules.family.spouseLivesWithProtagonist(s),
      cd: 3,
      w: 0.6,
      t: [
        "風の穏やかな休日に、{sp}と区画の連絡通路を抜けて展望デッキまで散歩した。通り過ぎていく荒野の地平線を並んで眺めながら、二人で歩んできた年月の長さを噛みしめた。",
        "都市の上層デッキにある小さな広場へ、{sp}と散歩に出た。遠くを走る他の移動都市の影を指さしながら、これまでの暮らしや昔暮らした町の話を静かに語り合った。"
      ],
      fx: { p: 3, rl: 2 }
    },
    {
      id: "family_daily_spouse_shared_quiet",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年", "老年"],
      need: ["既婚"],
      show: s => $rules.family.spouseLivesWithProtagonist(s),
      cd: 3,
      w: 0.6,
      t: [
        "夕食を終え、それぞれが本をめくったり手仕事をしたりしながら同じ部屋で過ごした。特別な会話は交わさなくても、すぐ隣に{sp}の息遣いと温もりがあるだけで心が静まり返った。",
        "夜更けの部屋で、{sp}が明日の帳面をつけ、こちらは道具の手入れをして過ごした。時計の針の音だけが響く静けさのなかに、長年積み重ねてきた確かな安らぎがあった。"
      ],
      fx: { p: 3, rl: 1 }
    },
    {
      id: "family_daily_spouse_mutual_gift",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年", "老年"],
      need: ["既婚"],
      show: s => $rules.family.spouseLivesWithProtagonist(s),
      cd: 4,
      w: 0.5,
      t: [
        "給金が入った日の帰り道、{sp}の好物の焼き菓子を包んでもらって帰宅した。扉を開けると、相手もまたこちらの好みの茶葉を買って待っており、思わず顔を見合わせて吹き出した。",
        "日頃の感謝にと、{sp}へささやかな果実の砂糖漬けを買って帰った。相手も仕事帰りに新しい布巾を見繕ってくれており、互いの気遣いに食卓が温かい笑いに包まれた。"
      ],
      fx: { p: 4, rl: 3, cash: -3000 }
    }
  ];
});
