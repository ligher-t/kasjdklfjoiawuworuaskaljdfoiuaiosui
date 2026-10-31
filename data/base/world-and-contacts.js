// base/world-and-contacts: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("base/world-and-contacts", function ($terraData, $define, $rules) {
  "use strict";
  $terraData.EV.push(
    {
      id: "wld_chernobog",
      conf: "A",
      references: ["SRC_TL_CHERNOB_WINDOW", "SRC_REUNION_CHERNOB_BASE"],
      st: ["青年", "壮年"],
      need: ["国:龍門", "都市:龍門"],
      ge: { year: 1096 },
      le: { year: 1097 },
      months: [12, 1, 2, 3, 4],
      show: s => !!s.world?.events?.chernobog_incident,
      once: true,
      w: 1.0,
      t: [
        {
          when: "移動都市",
          t: "区画の掲示板に、チェルノボーグ避難民の臨時配給所が告知された。寝具や鍋を抱えた人々が列を作り、係員に離れた家族の行方を尋ねている。"
        },
        {
          when: { need: ["固定集落"], le: { cash: 1e5 } },
          t: "町外れに荷車の列が着いた。避難民は空いた部屋を探している。家賃の支払いを前に、こちらも手元の食料を数え直した。"
        },
        {
          when: "固定集落",
          t: "町に着いた荷車から避難民が降りた。宿の主人は空いた床を貸すか迷い、通りでは受け入れをめぐる口論が続いた。"
        },
        {
          t: "街角の仮設窓口に、チェルノボーグから来た人々が集まっていた。係員に手続きの順を尋ねる声と、離れた家族を探す声が絶えない。"
        }
      ],
      c: [
        $terraData.K(
          "家計から食料を分ける",
          { en: { ge: { cash: 1e5 } }, why: "食料を分けるための10万龍門幣を家計から出せない" },
          [
            0.8,
            "保存食を袋に分け、仮設の受け渡し場所まで運んだ。受け取った人は礼を言うより先に、離れた家族の名を係員へ尋ねた。帰りに財布を確かめると、次の給金までの食費は心もとなかった。",
            { p: 4, rl: 5, cr: 2, cash: -1e5 }
          ],
          [
            1,
            "列の押し合いで袋が裂け、食料の半分が泥に落ちた。拾うのを手伝った人と一緒に受け渡し場所へ戻ったが、渡せた量はわずかだった。",
            { h: -5, p: -3, rl: 2, cash: -1e5 }
          ]
        ),
        $terraData.K(
          "荷運びと食料の列を手伝う",
          { show: { ban: ["健康不良"] } },
          [
            0.8,
            "水と毛布を運び、食料を受け取る人の列を整えた。日が暮れるころ、同じ列で働いた人と荷車を一台、受け渡し場所まで押した。翌朝もその人を見かけ、二人で荷を運んだ。",
            { p: 4, rl: 6, cr: 2 }
          ],
          [
            1,
            "荷車を押す途中で足を取られ、手首を痛めた。受け渡し場所の人が代わりに荷を運んだが、家に戻ってからも列のざわめきが耳に残った。",
            { h: -12, p: -5 }
          ]
        ),
        $terraData.K(
          "手伝いには加わらず、自分の用事へ向かう",
          {},
          [
            0.8,
            "列の外を通り、自分の用事へ向かった。帰りにも同じ場所を通ったが、誰に何を尋ねればいいのか分からず、足を止めなかった。",
            { p: -2 }
          ],
          [
            1,
            "戻る道で、食料の受け取りをめぐる押し合いに巻き込まれた。助けを呼ぶ声が上がり、近くにいた人たちと一緒に倒れた荷車を起こした。",
            { h: -12, p: -5, cash: -5e4 }
          ]
        )
      ]
    },
    {
      id: "wld_rhodes",
      conf: "B",
      references: ["SRC_RHODES_MEDICAL", "SRC_ORIPATHY_EXPOSURE"],
      st: ["青年", "壮年"],
      need: ["感染診断済"],
      ge: { access: 0.25, year: 1095 },
      w: 0.5,
      cd: 10,
      t: "ロドスの支援隊が通り沿いに診療場所を設けた。受付では順番と薬の在庫を確かめており、診察を待つ人の列ができている。",
      c: [
        $terraData.K(
          "診療を受け、薬代を払う",
          { en: { affordableMedicalCash: 1e5 }, why: "診療・薬代10万龍門幣を地域医療費込みで用意できない" },
          [
            0.8,
            "順番を待ち、診察と薬の説明を受けた。薬を飲むと、結晶の痛みが少し和らいだ。",
            { h: 8, cash: -1e5, med: 1, p: 5, fl: { rhodes: 1 } }
          ],
          [
            1,
            "受付で枠と薬の在庫を確かめているうちに、その日の受け入れが終わった。次の巡回日を教わったが、治療は先になった。",
            { p: -2, fl: { rhodes: 1 } }
          ]
        ),
        $terraData.K(
          "働き口や研修の可能性を尋ねる",
          { en: { ge: { k: 30 } }, why: "募集や研修の説明を理解し、必要な条件を尋ねる知識が足りない" },
          [
            0.45,
            "担当者は必要な資格と研修を説明した。連絡先を預け、次の募集を確認できる窓口を聞いた。",
            { k: 3, cr: 3, p: 4, fl: { rhodes: 1 } }
          ],
          [
            1,
            "担当者は募集枠を確認したが、今すぐ案内できる仕事はなかった。必要な資格や経験を書き留め、次の募集を確認する窓口を聞いた。",
            { k: 1, p: -3, fl: { rhodes: 1 } }
          ]
        ),
        $terraData.K("支援隊の手伝いをする", { show: { need: ["hid_helper"] } }, [
          1,
          "感染者を支えてきた経験を話し、受付の列を整えたり診療所への道を案内したりした。帰り際、次の巡回予定を尋ねると、掲示場所を教わった。",
          {
            socialConflictAction: {
              action: "help",
              target: "infected",
              context: "rhodes-mobile-team-assistance"
            },
            rl: 4,
            p: 3,
            cr: 1,
            fl: { rhodes: 1 }
          }
        ]),
        $terraData.K("源石片や粉塵を見つけた時の注意と相談先を尋ねる", {}, [
          1,
          "診療担当者に、結晶片や粉塵を自分で片づけず、傷があれば診療先へ相談するよう教わった。次に連絡する窓口と、見つけた場所を伝える方法を控えた。",
          { k: 1, rl: 2, fl: { rhodes: 1, source_safety_guidance: 1 } }
        ]),
        $terraData.K("近づかない", {}, [
          1,
          "列の人目と感染者への偏見が怖く、診療を申し出られなかった。支援隊が発つまで、通りの向こうから様子を見ていた。",
          {
            socialConflictAction: {
              action: "avoid",
              target: "infected",
              context: "fear-of-stigma-at-clinic"
            },
            p: -3
          }
        ])
      ]
    },
    {
      id: "wld_race",
      conf: "S",
      st: ["少年", "青年", "壮年"],
      need: ["種族差別"],
      w: 0.6,
      cd: 5,
      t: [
        {
          when: "discrimination_complaint",
          t: "前に異議を申し立てた窓口で、担当者が記録を探す間、あなたは立ったまま待たされた。"
        },
        {
          when: "discrimination_silenced",
          t: "仕事と寝床を失うのが怖くて、また抗議できなかった。前に言葉を飲み込んだ場面がよみがえった。"
        },
        {
          when: { need: ["隠蔽"] },
          t: "採用窓口で書類を確かめられたが、担当者は視線を上げず、説明もないまま受付を打ち切った。病のことは伏せている。それでも拒絶の理由は分からなかった。"
        },
        {
          when: { need: ["感染診断済", "種族:サルカズ"], ban: ["隠蔽"] },
          t: "採用担当は履歴書より先に結晶へ目を留め、あなたの角を見て視線を戻した。「安全上の都合」と言われ、求人票を引き戻された。"
        },
        {
          when: { need: ["感染診断済"], ban: ["隠蔽"] },
          t: "採用担当は履歴書より先に、あなたの結晶へ目を留めた。「安全上の都合」と言われ、求人票を引き戻された。"
        },
        {
          when: "種族:サルカズ",
          t: "店先で、あなたの角を見た店主が棚の奥の品を隠した。理由は口にしない。隣にいた連れは店主の手元を見て、黙ってあなたの横にいた。"
        },
        {
          when: "就労中",
          t: "職場で、種族をからかう呼び名が繰り返された。作業の手は止めなかったが、次の契約書はまだ渡されていない。"
        },
        {
          t: "窓口で順番を何度も後回しにされた。理由を尋ねると、係員は規則だと言ったが、その規則を見せようとはしなかった。"
        }
      ],
      c: [
        $terraData.K(
          "抗議する",
          {},
          [0.4, "係員は申し立てを記録し、規則を確認すると答えた。近くにいた一人が、あなたの話を聞いたと申し出た。", { cr: 4, p: 3, rl: 2, fl: { discrimination_complaint: 1 } }],
          [
            1,
            "係員は申し立てを受け付けたが、列の順は戻らなかった。そばにいた人は目をそらし、あなたは記録の控えを持って窓口を出た。",
            { p: -10, rl: -8, cr: -3, fl: { discrimination_complaint: 1 } }
          ]
        ),
        $terraData.K("耐える", {}, [
          1,
          "返事をせず、頼まれた手続きだけ済ませた。帰り道も、さっきの言葉が耳に残った。",
          { p: -6, fl: { discrimination_silenced: 1 } }
        ]),
        $terraData.K(
          "運賃と住居費を払い、別地域への転居を試みる",
          {
            en: { ge: { fare: 1 }, affordableRoute: 3e5 },
            why: "移動費と新しい住まいの初期費用を用意できない"
          },
          [
            0.6,
            "運賃と新しい住まいの初期費用を払い、引越しを終えた。通い慣れた店や顔見知りから離れ、知らない土地で暮らし始めた。",
            { res: 1, p: -2, cash: -2e5 }
          ],
          [
            1,
            "転居先の部屋を探したが、契約条件を満たせず断られた。手続き代を払った後も、今の場所にとどまるしかなかった。",
            { p: -6, cash: -3e5 }
          ]
        )
      ]
    },
    {
      id: "discrimination_after",
      conf: "S",
      st: ["青年", "壮年", "老年"],
      need: ["discrimination_complaint"],
      ban: ["discrimination_followup"],
      after: { id: "wld_race", min: 1 },
      w: 0.65,
      t: [
        {
          when: "就労中",
          t: "申し立てから数日後、上司は返事を先延ばしにし、同僚は仕事の話しかしなくなった。"
        },
        {
          t: "窓口から返事はなく、顔見知りはその話題になると目をそらした。"
        }
      ],
      c: [
        $terraData.K(
          "同僚に証言を頼み、手続きを続ける",
          { show: { need: ["就労中"] } },
          [
            0.6,
            "同僚の一人が証言に応じた。二人で記録を提出し、職場の調査が始まった。",
            { cr: 4, rl: 3, p: 2, fl: { discrimination_followup: 1 } }
          ],
          [
            1,
            "証言を頼んだ同僚は距離を置き、契約も更新されなかった。申し立てた記録だけが手元に残った。",
            { job: 0, cr: -4, rl: -6, p: -8, fl: { discrimination_followup: 1 } }
          ]
        ),
        $terraData.K(
          "別の職場を探し、今の契約を終える",
          { show: { need: ["就労中"] } },
          [
            0.7,
            "今の契約を終え、別の職場の求人を探し始めた。給金が途切れる不安はあるが、毎日の侮辱から離れた。",
            { job: 0, p: -3, cr: -2, fl: { discrimination_followup: 1 } }
          ],
          [
            1,
            "求人先でも似た扱いを受けた。契約を終えた後も仕事は見つからず、移るための手間と費用だけが残った。",
            { cash: -5e4, p: -6, fl: { discrimination_followup: 1 } }
          ]
        ),
        $terraData.K("記録を残して申し立てをいったん止める", {}, [
          1,
          "日付と発言を書き留め、手続きを止めた。記録を折りたたみ、ほかの書類と一緒にしまった。",
          { k: 1, p: -2, fl: { discrimination_followup: 1 } }
        ])
      ]
    },
    {
      id: "discrimination_work_after",
      conf: "S",
      st: ["青年", "壮年", "老年"],
      need: ["discrimination_complaint"],
      ban: ["discrimination_followup"],
      after: { id: "dis", min: 1 },
      once: true,
      w: 0.65,
      t: "封書には調査中とだけあった。記録は受け取ったが、その先のことは何も書かれていない。",
      c: [
        $terraData.K(
          "同僚に証言を頼み、記録を残す",
          { show: { need: ["就労中"] } },
          [
            0.6,
            "同僚の一人が証言に応じた。調査の記録を受け取り、これ以上ひとりで抱え込まずに済んだ。",
            { cr: 4, rl: 3, p: 2, fl: { discrimination_followup: 1 } }
          ],
          [
            1,
            "証言を頼んだ同僚は距離を置き、契約も更新されなかった。記録だけを手元に残した。",
            { job: 0, cr: -4, rl: -6, p: -8, fl: { discrimination_followup: 1 } }
          ]
        ),
        $terraData.K(
          "別の仕事口を探し始める",
          { show: { need: ["就労中"] } },
          [
            0.7,
            "今の契約を終え、別の仕事口を探し始めた。給金が途切れる不安はあるが、毎日の侮辱から離れた。",
            { job: 0, p: -3, cr: -2, fl: { discrimination_followup: 1 } }
          ],
          [
            1,
            "求人先でも似た扱いを受けた。契約を終えた後も仕事は見つからず、探す手間と費用だけがかさんだ。",
            { cash: -5e4, p: -6, fl: { discrimination_followup: 1 } }
          ]
        ),
        $terraData.K("今は記録だけ残して申し立てを止める", {}, [
          1,
          "日付と発言を書き留め、手続きを止めた。記録を折りたたみ、ほかの書類と一緒にしまった。",
          { k: 1, p: -2, fl: { discrimination_followup: 1 } }
        ])
      ]
    },
    {
      id: "wld_plague",
      conf: "S",
      st: ["少年", "青年", "壮年", "老年"],
      w: 0.3,
      cd: 10,
      t: [
        {
          when: "移動都市",
          t: [
            "都市の別区画で発熱する人が増えたと、配給の列で聞いた。診療所の待ち時間や薬の値段を、近所の人が気にしていた。",
            "乗員区画から感染症への注意が流れた。自分の区画にも患者が出ているのか、仕事を休めるのか、家族と話した。",
            "食堂で、熱を出した人がしばらく姿を見せていないと聞いた。隣の区画では診療所の列が長くなり、薬の値段も上がったという。"
          ]
        },
        {
          when: "固定集落",
          t: [
            "町の診療所が発熱の相談を受けていると、通りの掲示板に案内が出た。仕事を休む余裕がある家は多くない。",
            "近所で熱を出した人が続いていると聞いた。井戸端では薬の値段より、誰が看病に行けるかが話題になった。",
            "役所の掲示に、発熱が続く人は診療所へと短く書かれていた。働き手を休ませられるか、家々で相談が始まった。"
          ]
        },
        {
          when: "職:商人",
          t: [
            "仕入れ先から、向こうの市場で流行り病が出たと便りが来た。人出が減れば商いに響くが、家族を外へ出すのも心配だった。",
            "取引相手が熱を出したと聞き、荷を受け取る日を延ばすか迷った。薬代と売上の両方を考えなければならない。"
          ]
        },
        {
          t: [
            "近くで熱を出す人が増えた。診療所の待ち時間や薬代が気になり、仕事や家の用事を休めるか考えた。",
            "職場の休憩中に流行り病の話が出た。誰が休めるか相談になり、同僚は家族の分の食料も買い足すと言った。",
            "いつも顔を合わせる人が数日見えない。流行り病かもしれないという噂を聞き、薬と食料を買い足すか考えた。"
          ]
        }
      ],
      c: [
        $terraData.K(
          "仕事や外出を休み、家に籠る",
          { en: { ge: { cash: 5e4 } }, why: "仕事や外出を休む間の食費を賄う余裕がない" },
          [0.8, "外出を控えた。手元の金は食料に消えたが、熱は出ずに済んだ。", { p: -3, cash: -5e4 }],
          [1, "用心しても発症した。休んだ日々の焦りに、熱と痛みが重なった。", { h: -20, p: -8 }]
        ),
        $terraData.K(
          "普段通りに過ごす",
          {},
          [0.7, "いつもの仕事や用事を続けた。自分は体調を崩さず、帰宅してからようやく肩の力を抜いた。", { p: 1 }],
          [1, "熱が出て、重い症状で数日寝込んだ。", { h: -25, p: -10 }]
        )
      ]
    },
    {
      id: "wld_tax",
      conf: "S",
      st: ["青年", "壮年"],
      w: 0.5,
      cd: 8,
      t: [
        {
          when: "家計逼迫",
          t: "地区の徴収通知が家に届いた。家賃と食費を先に払ったあとでは、期限までに納付額を用意できるか分からなかった。"
        },
        {
          when: "職:商人",
          t: "市場の営業札を更新する時期が来た。帳場の担当者は、登録の徴収額と支払い期限を紙に書いて渡した。"
        },
        {
          when: "就労中",
          t: "地区の徴収人から、あなた宛ての納付通知を受け取った。給与からの天引きではなく、期限までに自分で手続きするよう伝えられた。"
        },
        {
          t: "地区の徴収人から、あなた宛ての納付通知が届いた。記載された額と期限を確かめ、今月の支出予定を組み直した。"
        }
      ],
      c: [
        $terraData.K(
          "通知額（{taxNoticeAmount}）を納める",
          { en: { affordableCash: 1e5 }, why: "納付額10万龍門幣を地域物価込みで用意できない" },
          [
            1,
            "納付を済ませ、受け取った控えを家計の帳面へ挟んだ。ほかの支払いを少し遅らせる必要があった。",
            { cash: -1e5, pm: 1, p: -1 }
          ]
        ),
        $terraData.K(
          "期限延長・請求見直しを求める（不成立時は{taxArrearsAmount}の負担）",
          {},
          [
            0.7,
            "窓口で事情を説明すると、納付期限を翌月まで延ばしてもらえた。手元の金は残ったが、改めて書類を出しに行くことになった。",
            { p: -2 }
          ],
          [
            1,
            "申請は認められず、延滞分を含む{taxArrearsAmount}を納めるよう告げられた。支払いで貯えが減り、来月の家賃と食費を帳面に書き直した。",
            { cash: -3e5, pm: 1, p: -8 }
          ]
        )
      ]
    },
    {
      id: "wld_friend",
      conf: "S",
      st: ["青年", "壮年", "老年"],
      ban: ["friend_unpaid"],
      w: 0.5,
      cd: 8,
      t: [
        {
          when: "friend_cut_off",
          t: "以前、返済を待てず友人との連絡を断った。その後、別の知人だった{friendName}から急な出費に困っていると便りが来た。"
        },
        {
          t: [
            "{friendName}から、急な出費で困っていると連絡が来た。頼れる相手として、あなたを思い出したらしい。",
            "長く会っていなかった{friendName}が訪ねてきた。話を聞くと、仕事を失って家賃にも困っているという。",
            "{friendName}から短い伝言が届いた。金を貸してほしい、とだけ書かれていた。"
          ]
        }
      ],
      c: [
        $terraData.K(
          "助ける",
          { en: { ge: { cash: 5e4 } }, why: "資金が足りない" },
          [
            0.7,
            "急な出費を援助した。友人は礼を言い、しばらくして便りも届いた。",
            { rl: 8, p: 3, cash: -5e4 }
          ],
          [
            1,
            "貸した金は返ってこなかった。友人からの便りも途絶え、帳簿の金額だけが残った。",
            { cash: -5e4, p: -3, rl: -3, fl: { friend_unpaid: 1 } }
          ]
        ),
        $terraData.K("事情を話して断る", {}, [
          1,
          "今は助けられないと事情を伝えた。断った言葉を帰り道でも思い返したが、連絡先は消さずにおいた。",
          { rl: -1, p: -1 }
        ]),
        $terraData.K("連絡を絶つ", {}, [
          1,
          "返事をせず、連絡先を消した。今後はこの相手と金を貸し借りしないと決めた。",
          { rl: -5, p: -2, fl: { friend_cut_off: 1 } }
        ])
      ]
    },
    {
      id: "wld_friend_repay",
      conf: "S",
      st: ["青年", "壮年", "老年"],
      need: ["friend_unpaid"],
      after: { id: "wld_friend", min: 1 },
      once: true,
      w: 0.8,
      t: "貸した金が返らないまま、{friendName}からもう一度連絡が来た。近況を尋ねる手紙の末尾に、借りた金のことが短く書かれていた。",
      c: [
        $terraData.K(
          "返済を求める",
          {},
          [
            0.55,
            "友人は借りた5万龍門幣を返した。気まずさは残ったが、約束を果たす姿を見て、関係を続けることにした。",
            { cash: 5e4, rl: 2, p: 1, fl: { friend_unpaid: 0 } }
          ],
          [
            1,
            "友人には返す余裕がなかった。あなたは返済を諦め、これ以上の貸し借りをしないと伝えた。",
            { rl: -6, p: -4, fl: { friend_unpaid: 0, friend_cut_off: 1 } }
          ]
        ),
        $terraData.K("返済を求めず、貸した金は贈り物にする", {}, [
          1,
          "返済は求めないと伝えた。その日の帰りに、先延ばしにしていた靴の修理をまた後に回した。",
          { rl: 4, p: 2, fl: { friend_unpaid: 0 } }
        ]),
        $terraData.K("返済を待たず、連絡を断つ", {}, [
          1,
          "返事を出さず、連絡先を消した。貸した金は戻らなかったが、待ち続ける日々には区切りをつけた。",
          { rl: -8, p: -3, fl: { friend_unpaid: 0, friend_cut_off: 1 } }
        ])
      ]
    },
    {
      id: "friend_death_notice",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      need: ["存命の友人"],
      once: true,
      w: 0.09,
      t: "{contactDeathTiming}、{contactName}が亡くなったと、共通の知人から短い便りが届いた。死因は書かれていない。最後に交わした会話を思い出そうとしても、何気ない用事の話しか出てこなかった。",
      c: [
        $terraData.K("共通の知人に返事を書き、覚えていることを伝える", {}, [
          1,
          "返事に、{contactName}と交わした何気ない用事の話を書いた。封をすると、連絡帳の余白にその名を残した。",
          { contactDeath: 1, contactDeathCause: "知らせに死因の記載なし", p: -7, rl: 2 }
        ]),
        $terraData.K("しばらく一人で思い出す", {}, [
          1,
          "便りをしまい、返事は急がないことにした。仕事や家の用事を続けながら、ふとした時に声や癖を思い出した。",
          { contactDeath: 1, contactDeathCause: "知らせに死因の記載なし", p: -8 }
        ]),
        $terraData.K("いつもの暮らしを続け、必要な時に弔意を伝える", {}, [
          1,
          "知らせを受け取った日は、予定を一つだけ取りやめた。後日、共通の知人に短く弔意を伝え、日々の仕事へ戻った。",
          { contactDeath: 1, contactDeathCause: "知らせに死因の記載なし", p: -5 }
        ])
      ]
    },
    {
      id: "neighbor_death_notice",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["存命の顔なじみの隣人"],
      once: true,
      w: 0.08,
      t: "{contactDeathTiming}、{contactName}が亡くなったと同じ区画の人から聞いた。知らせには死因も最期の様子もなかった。玄関先で交わした短い挨拶や、荷物を持ってもらった日のことを思い出した。",
      c: [
        $terraData.K("できる範囲で、花を供えて見送る", {}, [
          1,
          "花を一輪供え、帰る前に{contactName}の名を呼んだ。",
          { contactDeath: 1, contactDeathCause: "知らせに死因の記載なし", p: -6, rl: 2 }
        ]),
        $terraData.K("家の用事を済ませ、後から静かに悼む", {}, [
          1,
          "その日は家の用事を片づけた。夜、帰り道で足を止め、{contactName}と交わした挨拶を思い返した。",
          { contactDeath: 1, contactDeathCause: "知らせに死因の記載なし", p: -5 }
        ]),
        $terraData.K("近所の人に、世話になった時のことを話す", {}, [
          1,
          "荷物を持ってもらった日のことを、同じ区画の人に話した。帰宅してからも、玄関先で聞いた声を思い返した。",
          { contactDeath: 1, contactDeathCause: "知らせに死因の記載なし", p: -7, rl: 3 }
        ])
      ]
    },
    {
      id: "friend_missing_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS", "SRC_REGIONAL_ENVIRONMENT"],
      st: ["青年", "壮年", "老年"],
      need: ["友人の消息不明を知る"],
      w: 0.2,
      t: "{contactName}と連絡が途絶えたのは{contactMissingYear}年ごろ。最後に所在が確かめられたのは{contactMissingRegion}だった。その後は便りがなく、生死も分からない。",
      c: [
        $terraData.K("共通の知人に手がかりを尋ねる", {}, [
          1,
          "共通の知人へ手紙を書き、{contactName}の最後の居場所や移動先を知らないか尋ねた。",
          { contactMissingNotice: 1, contactSearch: 1, p: -3, rl: 1 }
        ]),
        $terraData.K("最後にいた地域を書き留め、知らせを待つ", {}, [
          1,
          "最後に所在が確かめられた{contactMissingRegion}を手帳に書き留めた。便りを受け取れるよう、住所は変わっていないことを共通の知人に伝えた。",
          { contactMissingNotice: 1, p: -2 }
        ]),
        $terraData.K("共通の友人へ自分の連絡先を預ける", {}, [
          1,
          "共通の友人に連絡先を託し、{contactName}から便りが届いたら知らせてもらうことにした。",
          { contactMissingNotice: 1, contactSearch: 1, rl: 2 }
        ])
      ]
    },
    {
      id: "neighbor_missing_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS", "SRC_REGIONAL_ENVIRONMENT"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["隣人の消息不明を知る"],
      w: 0.18,
      t: "{contactName}の姿を見なくなったのは{contactMissingYear}年ごろだという。最後に所在が確かめられたのは{contactMissingRegion}。その後の行き先も生死も分からない。",
      c: [
        $terraData.K("同じ区画の人に、最後に見かけた時のことを尋ねる", {}, [
          1,
          "近隣の人に{contactName}のことを尋ね、また見かけたら知らせてほしいと頼んだ。",
          { contactMissingNotice: 1, contactSearch: 1, p: -3, rl: 2 }
        ]),
        $terraData.K("自分の連絡先を区画の掲示所へ残す", {}, [
          1,
          "{contactName}から便りが届くよう、連絡先を区画の掲示所へ預けた。週に一度、掲示を確かめに行った。",
          { contactMissingNotice: 1, contactSearch: 1, rl: 1 }
        ]),
        $terraData.K("確かでない噂を広めず、日々の務めを続ける", {}, [
          1,
          "同じ区画ではいくつもの噂が行き交った。確かめられない話は口にせず、{contactName}から便りが届くのを待った。",
          { contactMissingNotice: 1, p: 1 }
        ])
      ]
    },
    {
      id: "friend_found_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      st: ["青年", "壮年", "老年"],
      need: ["消息不明だった友人の安否を知る"],
      w: 0.22,
      t: "共通の知人から、{contactName}が{contactFoundYear}年に生きていたと伝言が届いた。今いる場所や、直接便りを出す宛先はまだ分からない。",
      c: [
        $terraData.K("返事を預け、相手の都合を待つ", {}, [
          1,
          "{contactName}が生きていると分かっただけで、胸のつかえが少し下りた。返事を共通の知人に預け、相手から連絡できる時を待つことにした。",
          { contactFoundNotice: 1, contactReconnect: "request", p: 5, rl: 2 }
        ]),
        $terraData.K("自分から会いに行く話は急がない", {}, [
          1,
          "知らせをくれた人に礼を伝え、こちらから便りを出さないことにした。",
          { contactFoundNotice: 1, contactReconnect: "close", p: 3 }
        ]),
        $terraData.K("短い便りだけ送り、返事を求めない", {}, [
          1,
          "近況を短く書いた便りを共通の知人に託した。その晩は、返事が来た時に話したいことを考えた。",
          { contactFoundNotice: 1, contactReconnect: "request", p: 4, rl: 1 }
        ])
      ]
    },
    {
      id: "neighbor_found_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["消息不明だった隣人の安否を知る"],
      w: 0.2,
      t: "地域の人づてに、{contactName}が{contactFoundYear}年に生きていると聞いた。今いる場所も、戻る予定も分からない。",
      c: [
        $terraData.K("区画の人を通じて、挨拶だけ伝える", {}, [
          1,
          "{contactName}が生きていると聞いたことを同じ区画の人に伝え、また会えたら挨拶したいと伝言を頼んだ。",
          { contactFoundNotice: 1, contactReconnect: "request", p: 4, rl: 2 }
        ]),
        $terraData.K("知らせを受け止め、こちらから追いかけない", {}, [
          1,
          "生きていると聞き、胸をなで下ろした。知らせ以上のことは尋ねず、こちらから便りを出さないことにした。",
          { contactFoundNotice: 1, contactReconnect: "close", p: 3 }
        ]),
        $terraData.K("自分の近況を書いた便りを預ける", {}, [
          1,
          "家での近況を伝言役に話し、また顔を合わせたら挨拶したいと伝えてもらった。",
          { contactFoundNotice: 1, contactReconnect: "request", p: 4, rl: 1 }
        ])
      ]
    },
    {
      id: "friend_recontact_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      st: ["青年", "壮年", "老年"],
      need: ["消息不明だった友人から返事が届く"],
      w: 0.24,
      t: "共通の知人を通じ、{contactName}からの返事が{contactReplyYear}年に届いた。伝言を受け取ったことと、便りを続けてもよいという短い言葉があった。今いる場所のことは触れられていない。",
      c: [
        $terraData.K("近況を返し、便りの往復を続ける", {}, [
          1,
          "返事が来たことを喜び、こちらの近況を短く書いた。便りの往復を続けることにした。",
          { contactRecontactNotice: 1, contactReconnect: "continue", p: 5, rl: 3 }
        ]),
        $terraData.K("まずは礼だけ返し、次の便りを待つ", {}, [
          1,
          "返事への礼だけを伝言に託した。机の上には、次に書く便箋を一枚残した。",
          { contactRecontactNotice: 1, contactReconnect: "continue", p: 3, rl: 1 }
        ]),
        $terraData.K("返事をしまい、これ以上の往復は求めない", {}, [
          1,
          "返事を読み終え、便箋を引き出しにしまった。こちらから新たな便りは出さないと決めた。",
          { contactRecontactNotice: 1, contactReconnect: "close", p: 1 }
        ])
      ]
    },
    {
      id: "neighbor_recontact_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["消息不明だった隣人から返事が届く"],
      w: 0.22,
      t: "同じ区画の人から、{contactName}の返事があったと伝えられた。あなたの便りが届いたことだけが書かれていた。",
      c: [
        $terraData.K("挨拶と近況を返し、伝言を頼む", {}, [
          1,
          "伝言役に挨拶と近況を話し、また知らせがあれば教えてほしいと頼んだ。",
          { contactRecontactNotice: 1, contactReconnect: "continue", p: 4, rl: 2 }
        ]),
        $terraData.K("返事を受け取った礼だけを伝える", {}, [
          1,
          "返事を受け取った礼を伝言役に託した。次の便りを急かさず、いつもの暮らしに戻った。",
          { contactRecontactNotice: 1, contactReconnect: "continue", p: 3, rl: 1 }
        ]),
        $terraData.K("ここで伝言を終える", {}, [
          1,
          "伝言役に礼を伝え、手元の便りを封筒に戻した。こちらから次の返事を頼むのはやめた。",
          { contactRecontactNotice: 1, contactReconnect: "close", p: 1 }
        ])
      ]
    }
  );
});
