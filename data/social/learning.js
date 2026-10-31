// social/learning: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("social/learning", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "v77refs",
    ["SRC_V77_SOCIAL_MODEL", "SRC_V77_ORIPATHY_ROUTES", "SRC_V76_ENFORCER", "SRC_V76_TARA"],
    false
  );

  $terraData.EV.push(
    {
      id: "v77_family_rumor",
      conf: "S",
      references: $terraData.v77refs,
      st: ["児童", "少年"],
      ge: { age: 8 },
      le: { age: 17 },
      cd: 7,
      w: 0.75,
      show: s =>
        s.r?.n !== "サルカズ" &&
        s.par?.fa?.r?.n !== "サルカズ" &&
        s.par?.mo?.r?.n !== "サルカズ" &&
        !s.inf &&
        !s.par?.fa?.inf &&
        !s.par?.mo?.inf,
      t: "家の大人たちが食卓で、感染者やサルカズをひとくくりにして悪しざまに喋っていた。昼間に通りで見かけたあの人の横顔を思い出すと、大人の言うことをそのまま鵜呑みにはできなかった。",
      c: [
        $terraData.K(
          "どうしてそう思うのか聞いてみる",
          {
            en: { ge: { literacy: 14 } },
            why: "自分の言葉で問い返すだけの自信がまだない。黙って聞いていることしかできない。"
          },
          [
            1,
            "大人は少し言葉を濁しながら、昔聞いた噂話を繰り返した。納得はできなかったが、人の言葉を鵜呑みにせず理由を確かめる癖がついた。",
            { biasInf: -3, biasSar: -3, k: 2 }
          ]
        ),
        $terraData.K("何も言わず、黙って聞いている", {}, [
          1,
          "言い返すことも頷くこともせず、黙って皿の上を見つめた。その夜に聞いた棘のある言葉は、大人になってからもふとした拍子に蘇ることがあった。",
          { p: -1, biasInf: 1 }
        ]),
        $terraData.K(
          "大人の口調を真似て、一緒に悪口を言う",
          {
            en: { ge: { biasInfected: 26 } },
            why: "自分の目で見たものと違いすぎて、その言い方に調子を合わせる気にはなれない。"
          },
          [
            1,
            "食卓の空気に合わせて、大人と同じ決めつけを口にした。なぜあんなことを言ったのか、寝床に入ってから少しだけ胸が苦しくなった。",
            { biasInf: 5, biasSar: 3 }
          ]
        )
      ]
    },
    {
      id: "v77_family_solidarity_and_caution",
      conf: "S",
      references: ["SRC_V77_SOCIAL_MODEL", "SRC_KAZDEL_LIFE", "SRC_ORIPATHY_SOCIAL"],
      st: ["児童", "少年"],
      ge: { age: 8 },
      le: { age: 17 },
      cd: 7,
      w: 0.75,
      show: s =>
        s.r?.n === "サルカズ" ||
        s.par?.fa?.r?.n === "サルカズ" ||
        s.par?.mo?.r?.n === "サルカズ" ||
        !!s.inf ||
        !!s.par?.fa?.inf ||
        !!s.par?.mo?.inf,
      t: s => {
        const isSarkaz = s.r?.n === "サルカズ" || s.par?.fa?.r?.n === "サルカズ" || s.par?.mo?.r?.n === "サルカズ";
        const hasInf = !!s.inf || !!s.par?.fa?.inf || !!s.par?.mo?.inf;
        if (isSarkaz && hasInf) {
          return "食卓を囲みながら、家の大人たちが静かに語りかけてきた。街でのサルカズや感染者に対する風当たりの強さを伝え、外では軽率に身元や病のことを口にせず、互いに支え合って生きるよう諭された。";
        } else if (isSarkaz) {
          return "夕餉のあと、家の大人から外での振る舞いについて注意を促された。サルカズに向けられる言われなき偏見や恐れを教えられ、挑発に乗らず誇りと用心を忘れないよう言われた。";
        } else {
          return "夜、家の大人たちが身を寄せ合って、近所の感染者への厳しい視線や取り締まりの噂を話していた。外で病のことを軽々しく口にすればどうなるかを説かれ、家族を守るための用心を言い含められた。";
        }
      },
      c: [
        $terraData.K(
          "大人の忠告を胸に刻み、用心深く過ごす",
          {},
          [
            1,
            "外の冷たい視線から身を守る術を心に留め、無用なトラブルを避ける分別を身につけた。大人の苦労が少しだけ理解できた気がした。",
            { k: 2, p: 1, equityGain: 5 }
          ]
        ),
        $terraData.K(
          "理不尽な差別に負けないよう、自分を鍛える",
          {
            en: { ge: { rl: 14 } },
            why: "まだ気後れしてしまい、外の偏見に立ち向かう気迫が湧かない。"
          },
          [
            1,
            "理不尽な偏見に屈せず生きていくため、学びや鍛錬に励むことを誓った。家族の温かい視線が背中を押してくれた。",
            { rl: 2, cr: 1, equityGain: 6 }
          ]
        ),
        $terraData.K(
          "家族の負担を減らすため、家事を進んで手伝う",
          {},
          [
            1,
            "心配をかける代わりに、水汲みや片付けを進んで引き受けた。親は疲れた顔をほころばせ、頭を優しく撫でてくれた。",
            { rl: 3, p: 2 }
          ]
        )
      ]
    },
    {
      id: "v77_child_informal_study",
      conf: "S",
      references: ["SRC_V77_SOCIAL_MODEL", "SRC_V77_FROSTLEAF"],
      st: ["児童", "少年"],
      ge: { age: 9 },
      le: { age: 17 },
      cd: 5,
      w: 0.8,
      show: s => !s.fl?.sch,
      t: "家に届いた書き付けや店の帳面の字が読めず、周りの大人に読み上げてもらうしかなかった。学校という場所には、もうしばらく通っていない。",
      c: [
        $terraData.K(
          "近所の読み書き教室へ顔を出す",
          {
            en: { ge: { socialAccess: 52, cash: 25000 } },
            why: "教えてくれる人へのツテか、月謝に回す金が足りない。"
          },
          [
            1,
            "顔なじみの年長者に文字の拾い方を教わり、帰り道、店先にぶら下がった値札を自分の声で読み上げてみた。",
            { k: 3, literacyGain: 8, cash: -25000, rl: 2 }
          ]
        ),
        $terraData.K("通りの看板や包み紙の字を見様見真似で写す", {}, [
          1,
          "道端の看板や荷物の包み紙にある文字を、切れ端に何度も書き写した。指先が黒く汚れるころ、読める字がほんの少しだけ増えた。",
          { k: 1, p: 1 }
        ]),
        $terraData.K("今は家の手伝いや日銭稼ぎを優先する", {}, [
          1,
          "書き付けを折りたたんで脇へ置き、いつもの用事へ戻った。文字は覚えられなかったが、今日の手伝いで少しばかりの小遣いと家族の笑顔を得た。",
          { cash: 20000, rl: 1 }
        ])
      ]
    },
    {
      id: "v77_written_application",
      conf: "S",
      references: ["SRC_V77_SOCIAL_MODEL", "SRC_V76_EMPLOYMENT"],
      st: ["青年", "壮年"],
      cd: 6,
      w: 0.75,
      show: s => s.age >= 16 && s.job !== 0,
      t: "今の仕事を続けながら、もう少し条件のいい働き口の募集を見つけた。だが応募用紙の職歴欄や保証人の欄を前にして、何と書けばいいのかペンが止まった。",
      c: [
        $terraData.K(
          "見様見真似でも自分の手で書き上げる",
          {
            en: { ge: { literacy: 48, k: 24 } },
            why: "応募書類を一人で書き切るだけの読み書きの力が、まだ足りない。"
          },
          [0.7, "窓口で受領の判が押された控えを受け取り、大事に懐へしまった。帰り道、自分がこれまでやってきた仕事の重みを改めて思い返した。", { k: 1, cr: 1 }],
          [1, "書き方の不備を窓口で指摘され、突き返されてしまった。締め切りにはもう間に合わず、今回は唇を噛んであきらめた。", { p: -1 }]
        ),
        $terraData.K(
          "字の読み書きに慣れた知人に頭を下げる",
          { en: { ge: { rl: 26 } }, why: "込み入った書類仕事を頼めるような相手が、まだ身近にいない。" },
          [
            0.75,
            "知人は嫌な顔一つせず横に座り、職歴の書き方を一から教えてくれた。自分の手で最後の一字を書き終えると、温かい礼を言って別れた。",
            { k: 1, rl: 2, equityGain: 7 }
          ],
          [
            1,
            "頼みの知人も今は仕事に追われていて手が離せないと言う。書けない欄が空いたままの用紙を前に、ため息をついた。",
            { k: 1, p: -1 }
          ]
        ),
        $terraData.K("今回は背伸びせず、今の仕事場に留まる", {}, [
          1,
          "募集の紙を四つに折って鞄の奥へ押し込み、いつもの持ち場へ戻った。転職の冒険はせず、慣れた持ち場で今月の給金を堅実に稼いだ。",
          { cash: 30000, p: 1 }
        ])
      ]
    },
    {
      id: "v77_prejudice_infected_workplace",
      conf: "S",
      references: $terraData.v77refs,
      st: ["青年", "壮年", "老年"],
      cd: 6,
      w: 0.68,
      show: s => s.job > 0 && (s.biasInfected || 0) >= 35,
      t: "鉱石病と診断されたばかりの働き手が、同じ現場に入ることになった。休憩室では「源石の粉とあいつ、どっちが危ないんだ」と心ない冗談が飛び交い、同僚たちがあなたの顔色をうかがった。",
      c: [
        $terraData.K(
          "病名で決めつけず、本人の仕事ぶりを見る",
          {
            en: { le: { biasInfected: 66 } },
            why: "長年染みついた警戒心が邪魔をして、同じ現場で肩を並べる気になれない。"
          },
          [
            1,
            "実際に並んで荷を動かしてみると、手際の良さと丁寧な仕事ぶりがすぐに分かった。噂話よりも自分の目を信じることにした。",
            { biasInf: -12, rl: 2, socialContact: "infected", equityGain: 6 }
          ]
        ),
        $terraData.K("人の噂より、源石資材の防護具を確かめる", {}, [
          1,
            "「人より先に防塵マスクと手袋の破れを気にしろ」とだけ言って作業場へ戻った。誰かを爪弾きにする話には加わらなかった。",
          { biasInf: -3 }
        ]),
        $terraData.K(
          "「感染者とは一緒に働けない」と声を上げる",
          { en: { ge: { biasInfected: 58 } }, why: "さすがにそこまで理不尽な言い分を口にする気にはなれない。" },
          [
            1,
            "現場の空気が凍りつき、責任者にもたしなめられた。自分の言葉で誰かの食い扶持を奪いかけた後味の悪さだけが残った。",
            { cr: -4, biasInf: 5 }
          ]
        )
      ]
    },
    {
      id: "v77_sarkaz_historical_tension",
      conf: "S",
      references: ["SRC_V76_ENFORCER", "SRC_V76_SANKTA_SARKAZ", "SRC_V77_SOCIAL_MODEL"],
      st: ["青年", "壮年", "老年"],
      cd: 7,
      w: 0.65,
      show: s => s.res.n === "ラテラーノ" || s.r.n === "サルカズ" || s.r.n === "サンクタ",
      t: "寄り合いの席で、サンクタとサルカズの古い戦いの話に火がついた。親から聞いた恨み言や昔の記録が次々に持ち出され、酒場の空気が一気に重くなる。",
      c: [
        $terraData.K(
          "双方の当事者から直接話を聞いてみる",
          {
            en: { le: { biasSarkaz: 68 }, ge: { rl: 22 } },
            why: "今の偏見や人脈の狭さでは、双方の懐に入って話を聞くことができない。"
          },
          [
            1,
            "サンクタとサルカズ、双方の年長者からじっくり話を聞いた。片方は戦火で亡くした身内の話をし、もう片方は焼かれた故郷の話をした。どちらの痛みも嘘ではなかった。",
            { biasSar: -9, k: 1, rl: 2, socialContact: "sarkaz", equityGain: 5 }
          ]
        ),
        $terraData.K(
          "残された古い記録を自分の目で辿る",
          {
            en: { ge: { literacy: 35 } },
            why: "古い文書を一人で読み解くだけの読み書きの力が、まだ足りない。"
          },
          [1, "古い年代記を開き、戦いの年号とそこに記された人々の名を一つずつ追った。ページの角が擦り切れるほど読み返すうち、単純な善悪では語れない重みが見えてきた。", { biasSar: -5, k: 2 }]
        ),
        $terraData.K("どちらの肩も持たず、席を立つ", {}, [
          1,
          "熱を帯びる極端な議論に頷くことはせず、黙って帽子を取って表へ出た。夜風を吸い込み、酒場の熱狂に流されず冷静さを保てたことに安堵した。",
          { p: 1, biasSar: -1 }
        ]),
        $terraData.K(
          "「サルカズは信用できない」と吐き捨てる",
          {
            show: s => s.r?.n !== "サルカズ",
            en: { ge: { biasSarkaz: 60 } },
            why: "そこまで頭ごなしに決めつけるほどの敵意は持っていない。"
          },
          [1, "「結局サルカズなんて信用できるもんか」と口にした途端、グラスを置く音が止まり、周囲の話し声がぷつりと途切れた。", { cr: -3, biasSar: 3 }]
        ),
        $terraData.K(
          "同胞への言われなき敵意に反論し、理不尽な決めつけを拒む",
          {
            show: s => s.r?.n === "サルカズ",
            en: { ge: { rl: 15 } },
            why: "酒場の険悪な空気の中、一人で立ち向かうだけの気迫が湧かない。"
          },
          [
            1,
            "「サルカズを一括りにして語るな」と静かに告げると、相手は気圧されたように口をつぐんだ。居合わせた同胞が小さく頷きかけてきた。",
            { p: 2, cr: 1, equityGain: 5 }
          ]
        )
      ]
    },
    {
      id: "v77_exclusion_review",
      conf: "S",
      references: ["SRC_V77_SOCIAL_MODEL", "SRC_V76_TARA", "SRC_V76_IBERIA_AEGIR"],
      st: ["少年", "青年", "壮年", "老年"],
      cd: 5,
      w: 0.8,
      show: s =>
        !!s.socialLearning?.exclusionHistory?.some(
          x => x.year >= s.year - 3 && x.consequence === "unresolved"
        ),
      t: "以前、出自や境遇を理由に門前払いされた一件が、いまだに尾を引いている。あのとき曖昧に濁された理由が、今の暮らしの手続きにも暗い影を落としていた。",
      c: [
        $terraData.K(
          "当時の経緯をまとめ、窓口へ掛け合う",
          {
            en: { ge: { literacy: 40, rl: 24 } },
            why: "書類を読み解く力や、一緒に掛け合ってくれる仲間の支えがまだ足りない。"
          },
          [
            1,
            "当時の理不尽な扱いを正面から問い質し、納得のいく説明を求めた。簡単には覆らないとしても、泣き寝入りしない姿勢だけは示した。",
            { k: 1, rl: 2 }
          ]
        ),
        $terraData.K(
          "事情の分かる知人に相談し、知恵を借りる",
          { en: { ge: { rl: 20 } }, why: "こうした込み入った事情を打ち明けられる相手が、まだ身近にいない。" },
          [1, "親身になって話を聞いてくれた知人が、同じような境遇の人を助けている相談先を教えてくれた。", { p: 2, rl: 2 }]
        ),
        $terraData.K("今は蒸し返さず、やり過ごす", {}, [
          1,
          "これ以上神経をすり減らすのはやめにして、古い書類を箱の奥へ押し込んだ。無理に波風を立てず、まずは日々の休息を優先して体を休めた。",
          { p: 1, h: 1 }
        ])
      ]
    },
    {
      id: "v77_social_stigma_family",
      conf: "S",
      references: $terraData.v77refs,
      st: ["幼児", "児童", "少年"],
      ge: { age: 6 },
      le: { age: 16 },
      cd: 7,
      w: 0.66,
      t: "町の食堂に入ると、感染者の隣人が隅の卓で一人黙々と匙を動かしていた。あからさまに席を立つ客もいれば、小さく会釈して通り過ぎる人もいる。家の大人の目があるなかで、声をかけるか迷った。",
      c: [
        $terraData.K(
          "歩み寄って、いつものように挨拶する",
          { en: { le: { biasInfected: 62 } }, why: "周囲の冷たい視線や恐れに足がすくみ、とても声をかけられない。" },
          [1, "隣人の卓のそばで立ち止まり、短く挨拶を交わした。食堂の中の視線が一斉にこちらへ刺さるのを感じたが、隣人は小さく目元を緩めた。", { biasInf: -5, rl: 1, equityGain: 4 }]
        ),
        $terraData.K("関わらないよう距離を取り、店を出る", {}, [
          1,
          "目を合わせないまま食堂を出た。あのまま通り過ぎてよかったのか、帰り道もずっと胸の奥がざわついていた。",
          {
            p: 0,
            socialConflictAction: {
              action: "avoid",
              target: "infected",
              context: "uncertain-contact-avoidance"
            }
          }
        ]),
        $terraData.K(
          "家の大人の顔色を見て、あからさまに避ける",
          {
            en: { ge: { biasInfected: 38 } },
            why: "理由もなく人を避けるやり方に馴染めず、大人の真似はできない。"
          },
          [
            1,
            "親の袖を引く手に従い、隣人からぷいと目をそらした。帰り道も、一度も後ろを振り返らなかった。",
            {
              biasInf: 4,
              socialConflictAction: {
                action: "avoid",
                target: "infected",
                context: "family-conformity-avoidance"
              }
            }
          ]
        )
      ]
    },
    {
      id: "v77_adult_literacy_path",
      conf: "S",
      references: ["SRC_V77_SOCIAL_MODEL", "SRC_V77_FROSTLEAF"],
      st: ["青年", "壮年", "老年"],
      cd: 7,
      w: 0.64,
      show: s => s.age >= 18 && $rules.social.literacyValue(s) < 45,
      t: "役所の申請書を前に、自分の読める字だけを指先で拾った。通りの掲示板に夜間教室の案内が貼られていたのを思い出す。仕事帰りのクタクタな体で通えるか、月謝を捻出できるか思案した。",
      c: [
        $terraData.K(
          "仕事帰りに夜間教室へ通い始める",
          { en: { ge: { cash: 55000, socialAccess: 45 } }, why: "月謝に回す金か、夜間に通うだけの余裕がまだない。" },
          [
            1,
            "泥のように疲れた体を引きずって夜の教室へ通い、鉛筆の握り方から教わった。書類に並んだ黒い文字が、少しずつ意味のある言葉に変わっていった。",
            { k: 3, literacyGain: 8, cash: -55000, p: 1 }
          ]
        ),
        $terraData.K(
          "身近な人に文書を読んでもらえるか頼む",
          { en: { ge: { rl: 30 } }, why: "文字が読めないことを打ち明けて頼れる相手が、まだいない。" },
          [
            0.8,
            "知人は茶を淹れて横に座り、難しい言い回しを噛み砕いて教えてくれた。帰り際には、自分で読める文字がいくつか増えていた。",
            { k: 2, rl: 1, literacyGain: 4 }
          ],
          [
            1,
            "頼んだ相手もその日は忙しく、後でまたにしてくれと断られた。読めない文字が並んだ紙をたたみ、ため息とともに懐へしまった。",
            { p: -1 }
          ]
        ),
        $terraData.K("今は読み書きより、明日の稼ぎを優先する", {}, [
          1,
          "学びたい気持ちは胸の奥にしまい込み、今は目の前の仕事と家事に時間を使うことにした。今日の日当をきっちり受け取り、家族のために夕飯の買い出しをした。",
          { cash: 25000, rl: 1 }
        ])
      ]
    }
  );

  $terraData.EV.push({
    id: "v77_bystander_response",
    conf: "S",
    references: $terraData.v77refs,
    st: ["少年", "青年", "壮年", "老年"],
    cd: 6,
    w: 0.61,
    t: "役所の窓口で、係員が前の住民の身分証を見るなり説明を打ち切った。住民は書類を握りしめたまま、肩を落として列を離れていく。すぐ後ろに並んでいたあなたは、声を上げるか迷った。",
    c: [
      $terraData.K(
        "係員に今の扱いはおかしいと食い下がる",
        {
          en: { ge: { equity: 25, literacy: 30 } },
          why: "役人を相手に筋を通して言い返すだけの度胸や知識が、まだ足りない。"
        },
        [
          1,
        "「なぜ説明を途中でやめたのか」と係員に詰め寄った。渋々口にした言い訳と担当者の名前に目を通し、勝手に追い返せないよう釘を刺した。",
          { equityGain: 9, k: 1 }
        ]
      ),
      $terraData.K(
        "列を離れた住民を追いかけ、声をかける",
        { en: { ge: { rl: 22 } }, why: "他人の事情に踏み込むだけの心の余裕が、いまはない。" },
        [
          1,
          "廊下の隅で立ち尽くしていた本人に歩み寄り、力になれることがないか尋ねた。自分の知る限りの相談先を伝えると、相手はかすかに頷いた。",
          { equityGain: 5, rl: 1 }
        ]
      ),
      $terraData.K("その場では口を出さず、様子を見守る", {}, [
        1,
        "結局その場では声を上げられず、自分の順番が呼ばれるのを待った。追い返された人の寂しげな背中が瞼の裏に残り、何もできなかった胸の痛みが消えなかった。",
        { p: -2, equityGain: -2 }
      ])
    ]
  });

  $terraData.EV.push(
    {
      id: "v77_accidental_originium_cleanup",
      conf: "S",
      references: ["SRC_V77_ORIPATHY_ROUTES", "SRC_V77_TRANSPORT_INFECTION"],
      st: ["青年", "壮年"],
      once: true,
      w: 0.075,
      show: s =>
        !s.inf &&
        !$rules.conditions.restricted(s) &&
        !!(s.fl?.disaster_displaced || s.fl?.war_displaced || s.local?.kind === "工業・採掘地域") &&
        (s.oripathyExposure?.protectionUntilYear ?? -1) < s.year,
      t: "復旧現場の瓦礫を運んでいたとき、割れた源石片で手を切った。傷は塞がったが、しばらくして指先に黒い結晶が浮かび、熱とだるさが抜けなくなった。",
      fx: { inf: 1, h: -5, p: -3, infCause: "瓦礫整理中に源石の結晶片で負傷した事故", infectionRoute: "wound" }
    },
    {
      id: "v77_accidental_transport_originium",
      conf: "S",
      references: ["SRC_V77_TRANSPORT_INFECTION", "SRC_V77_WATER_WORK"],
      st: ["青年", "壮年"],
      once: true,
      w: 0.075,
      show: s =>
        !s.inf &&
        !$rules.conditions.restricted(s) &&
        s.job > 0 &&
        /トランスポーター|運送|伝令|復旧|鉱夫|工場|整備|兵站/.test($terraData.J[s.job]?.n || "") &&
        (s.oripathyExposure?.protectionUntilYear ?? -1) < s.year,
      t: "職場の運搬車が損傷して積み荷の袋が破れ、黒い粉が舞った。近くにいたとき粉を吸い込み、その後から咳とだるさが続いた。",
      fx: { inf: 1, h: -4, p: -3, infCause: "輸送事故で源石を含む粉塵に曝露した", infectionRoute: "dust" }
    },
    {
      id: "v77_accidental_originium_uncertain",
      conf: "S",
      references: ["SRC_V77_ORIPATHY_ROUTES", "SRC_V77_WATER_WORK"],
      st: ["少年", "青年", "壮年"],
      once: true,
      w: 0.16,
      show: s =>
        !s.inf &&
        !$rules.conditions.restricted(s) &&
        !!(s.local?.kind === "工業・採掘地域" || s.fl?.disaster_displaced),
      t: "廃材置き場の脇を通ったとき、破れた麻袋から黒っぽい粉がこぼれ、乾いた風に舞い上がっていた。ただの煤か源石の粉か見分けがつかず、慌てて口元を覆って袖を払い、風上の道へと回り込んだ。",
      fx: { p: -1, exposureAction: "document" }
    }
  );

  $terraData.SETTING_SOURCES.SRC_V78_TARA_IDENTITY = {
    title: "この炎が照らす先 FC-8『彼女の影』",
    url: "https://shimadouma.github.io/astrhtml/events/act22side/stories/FC-8.html",
    kind: "日本語版ゲーム本文の非公式閲覧",
    note: "ターラー人の言語・故郷・職業・階級と自己認識の複雑さ。ターラーという帰属はドラコを含む種族名と同義ではない。作中の人物の政治的主張と確定制度を区別。"
  };

  $terraData.SETTING_SOURCES.SRC_V78_SAN_SAR = {
    title: "エンフォーサー第四資料（セシリア）",
    url: "https://arknights.wiki.gg/wiki/Enforcer/File",
    kind: "人物資料の英語版二次転載、日本語版表記は別途照合",
    note: "サンクタとサルカズの歴史的な対立と、それを越える個人関係。本人の種族・市民資格・家庭言語は別の事項。"
  };

  $terraData.SETTING_SOURCES.SRC_V78_REUNION = {
    title: "公式世界観・感染者とレユニオン・ムーブメント",
    url: "https://amiyaapprentice.arknights.jp/",
    kind: "公式設定紹介",
    note: "鉱石病の社会的排斥と、排斥への応答が一様ではないこと。加害者の心理統計を示すものではない。"
  };

  $terraData.SETTING_SOURCES.SRC_V78_SOCIAL_DESIGN = {
    title: "加害・被害・内面化された偏見の人生モデル",
    kind: "ゲーム上の設計仮定",
    note: "周囲の言説、憎悪の強化、感染後の自己認識、家族からの拒絶、仲間内の互助を描く創作モデル。人物の行動を種族固有の性質や公式確率としては扱わない。"
  };

  $terraData.EVENT_EFFECT_TYPES.object.push("identityAction", "socialConflictAction");

  $terraData.EVENT_FIELD_META.identityAction = {
    valueType: "object",
    unit: "本人の文化と言語に関する行動",
    status: "S",
    meaning: "民族文化・母語・法的資格を種族と区別した記録。制度の認定や市民権の獲得を勝手に確定しない"
  };

  $terraData.EVENT_FIELD_META.socialConflictAction = {
    valueType: "objectOrArray",
    unit: "加害・被害の行動履歴",
    status: "S",
    meaning:
      "差別への加担、暴言、自己反省、相談、家族の拒絶をそれぞれ別に記録する。個々の行為は直近40件を保持し、累計は対象/行為別の集計で人生を通じて維持する"
  };

  for (const [id, label, value, unit, description] of [
    [
      "culture.v78VictoriaTaranFamilyShare",
      "ヴィクトリア出生世帯のターラー系文化記録割合",
      0.16,
      "抽選比率",
      "原作の人口比率ではない。家の伝承と本人の種族を別個に抽選する"
    ],
    [
      "social.v78EntrenchedBiasThreshold",
      "強固な排斥思想の境界",
      75,
      "態度点",
      "本人が自発的な救済を選びにくい制約を設ける。普遍的な心理閾値ではない"
    ],
    [
      "social.v78AnnualDiscriminatoryActChance",
      "無選択の日常排斥行動",
      0.105,
      "年当たり抽選機会",
      "強い偏見が行動になるゲーム用仮定。感染者/サルカズへの排斥を選択なしで記録しうる。原作本文はサルカズへの複数領域の不当扱いを描くが、率や頻度は定めない",
      ["SRC_V78_SOCIAL_DESIGN", "SRC_V87_SARKAZ_HARDSHIP"]
    ],
    [
      "social.v78CaregiverRejectionWindow",
      "診断後の家族関係見直し期間",
      6,
      "年",
      "家族が必ず拒絶するわけではない。本人の感染を親へ必ず公開したとも仮定しない"
    ]
  ])
    $terraData.SIM_PARAMS.push({
      id,
      label,
      value,
      unit,
      status: "S",
      scope: "人物の文化・差別・内面化",
      description,
      source: "ゲーム用仮定",
      references: ["SRC_V78_SOCIAL_DESIGN"],
      usedBy: ["社会化", "選択条件", "新規差別イベント"]
    });
});
