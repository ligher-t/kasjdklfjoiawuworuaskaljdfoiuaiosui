// base/family-and-livelihood: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("base/family-and-livelihood", function ($terraData, $define, $rules) {
  "use strict";
  $terraData.EV.push(
    {
      id: "piano",
      conf: "C",
      references: ["SRC_LEITHANIEN_ARTS"],
      st: ["青年", "壮年"],
      need: ["国:リターニア"],
      ge: { cash: 18e5 },
      w: 0.5,
      cd: 20,
      t: "リターニアの楽器商の広間に、黒く磨かれた高級ピアノが据えられている。着飾った貴族たちが足を止め、試奏の澄んだ響きに耳を傾けていた。",
      c: [
        $terraData.K("購入する", { en: { ge: { cash: 18e5 } }, why: "資金が足りない" }, [
          1,
          "思い切って買い求め、部屋の窓際に据えた。指になじむまで、夜更けまで同じ小節を何度も弾き直した。",
          { cash: -18e5, p: 2 }
        ]),
        $terraData.K(
          "音楽家に試奏を申し出る",
          { show: { ge: { ar: 35 } } },
          [
            0.45,
            "人前で弾くつもりもなかった昔馴染みの曲を奏でた。聴き終えた音楽家は古い譜面を一冊差し出し、次の稽古日に顔を出すよう言った。帰り道、胸に抱えた譜面の重みが心地よかった。",
            { ar: 3, k: 1, p: 2, rl: 1 }
          ],
          [1, "緊張で最初の和音が硬く上ずった。音楽家は短く会釈して次の客へ向き直り、あなたはそっと鍵盤から指を引いた。", { p: -2 }]
        ),
        $terraData.K("見送る", {}, [
          1,
          "買える値段ではなかったが、最後の一音が消えるまで広間の隅で聴き入った。外へ出ても、夕暮れの石畳に余韻が残っていた。",
          { p: 3 }
        ])
      ]
    },
    {
      id: "loan_shark_lungmen",
      conf: "S",
      references: ["SRC_CRIME_REGIONAL", "SRC_PRIVATE_LOAN_REGION_MODEL"],
      st: ["青年", "壮年"],
      any: ["国:龍門"],
      need: ["家計逼迫"],
      ban: ["資金余裕", "投資資産に余裕", "裕福"],
      once: true,
      w: 0.8,
      cd: 10,
      t: "龍門の市場の裏手、油煙と茶の匂いがこもる小部屋で、貸付人が算盤を置いて証文を滑らせた。「用立てるのは百万龍門幣。三年後の年末までに一・五倍にして返せばいい。途中で少しずつ入れても構わんし、それ以上の利子は取らんよ」。男は湯呑み越しにこちらの手元を見つめている。",
      c: [
        $terraData.K("条件を呑んで署名する", {}, [
          1,
          "証文の数字と三年後の期限を確かめ、自分の名を書き入れた。帯封のついた札束を懐へ押し込み、人混みの市場へ戻ると、胸元の重みが妙に冷たかった。",
          { loanContract: {
            contractId: "lungmen-private-credit", borrower: "本人",
            creditor: "龍門の市場金融業者", region: "龍門", currency: "龍門幣",
            account: "personal", principal: 1000000, totalDue: 1500000,
            installmentShare: 0.2, dueInYears: 3, disbursement: "borrower",
            terms: "返済総額は元本の1.5倍。契約年から3年後の年末までに支払う。部分返済可。固定返済総額を超える利息・遅延料は記載なし。"
          }, fl: { debt_yakuza: 1 } }
        ]),
        $terraData.K("手を付けずに市場を離れる", {}, [
          1, "一・五倍という返済額を頭の中で転がし、ペンを置いたまま席を立った。背中に男の視線を感じながら、喧騒の表通りへ足早に抜けた。", { p: 1 }
        ])
      ]
    },
    {
      id: "loan_shark_siracusa",
      conf: "S",
      references: ["SRC_CRIME_REGIONAL", "SRC_PRIVATE_LOAN_REGION_MODEL"],
      st: ["青年", "壮年"],
      any: ["国:シラクーザ"],
      need: ["家計逼迫"],
      ban: ["資金余裕", "投資資産に余裕", "裕福"],
      once: true,
      w: 0.8,
      cd: 10,
      t: "シラクーザの馴染みの食堂の奥席で、ファミリーの会計役が濃い珈琲のカップを置き、折り畳んだ証文を差し出した。「いま困っているなら融通しよう。返すのは二年後の年末までに元本の一・五倍ポッキリだ。分割でも構わないし、余計な色もつけない」。店の外では雨が石畳を濡らしていた。",
      c: [
        $terraData.K("証文を確かめて署名する", {}, [
          1,
          "二年後の期限と一・五倍の返済総額を目で追い、万年筆で署名した。革袋に入った現金を受け取って店を出ると、雨の匂いと一緒に借りの重さが肩にのしかかった。",
          { loanContract: {
            contractId: "siracusa-private-credit", borrower: "本人",
            creditor: "シラクーザのファミリー会計役", region: "シラクーザ",
            currency: "シラクーザ現地通貨（モデル単位）", account: "personal",
            principal: 700000, totalDue: 1050000, installmentShare: 0.2,
            dueInYears: 2, disbursement: "borrower",
            terms: "返済総額は元本の1.5倍。契約年から2年後の年末までに支払う。部分返済可。固定総額以外の利息・遅延料は記載なし。"
          } }
        ]),
        $terraData.K("卓上の現金を奪って逃げる", { show: { any: ["国:シラクーザ"] } },
          [0.3, "会計役が脇を向いた隙に卓上の札束を掴み、椅子を蹴倒して裏路地へ飛び出した。背後で怒号が上がったが、雨の迷路を夢中で走り抜けた。", { cash: 1400000, fl: { criminal_yakuza: 1, trauma_crime: 1 }, p: -5 }],
          [1, "戸口へ駆け出す前に用心棒に腕を捻り上げられ、床に叩きつけられた。手元の金まで抜き取られたうえ、「迷惑料だ」と身に覚えのない借りを帳簿へ書き込まれた。", { h: -30, cash: -350000, debt: 350000, fl: { trauma_crime: 1 }, p: -20 }]
        ),
        $terraData.K("署名せず、食堂を出る", {}, [
          1, "「少し考えさせてくれ」と証文を押し返し、金には触れずに席を立った。会計役は何も言わず、冷めたカップに目を落としていた。", { p: 1 }
        ])
      ]
    },
    {
      id: "loan_shark_columbia",
      conf: "S",
      references: ["SRC_CRIME_REGIONAL", "SRC_PRIVATE_LOAN_REGION_MODEL"],
      st: ["青年", "壮年"],
      any: ["国:クルビア"],
      need: ["家計逼迫"],
      ban: ["資金余裕", "投資資産に余裕", "裕福"],
      once: true,
      w: 0.8,
      cd: 10,
      t: "クルビアの工業区、機械油の匂いが染みついた部品問屋の事務室で、帳簿係が印字された契約書を机に広げた。「うちの融通枠を使えますよ。四年後の年末までに元本の一・二倍を返してくれればいい。途中の分割払いも効きますし、固定額以外の利息は一切つきません」。窓の外では工場の排気音が低く鳴っていた。",
      c: [
        $terraData.K("契約書を確かめて署名する", {}, [
          1,
          "四年後の期限と一・二倍の返済総額を確かめ、署名欄にペンを走らせた。茶封筒に入った現金を受け取ると、当面の支払いをしのげる安堵と、長く続く返済の重みが同時に押し寄せた。",
          { loanContract: {
            contractId: "columbia-private-credit", borrower: "本人",
            creditor: "クルビア工業区の部品問屋", region: "クルビア",
            currency: "クルビア現地通貨（モデル単位）", account: "personal",
            principal: 1200000, totalDue: 1440000, installmentShare: 0.2,
            dueInYears: 4, disbursement: "borrower",
            terms: "返済総額は元本の1.2倍。契約年から4年後の年末までに支払う。部分返済可。固定総額以外の利息・遅延料は記載なし。"
          } }
        ]),
        $terraData.K("条件を確認して断る", {}, [
          1, "四年先までの稼ぎを思い浮かべ、やはり今は借りられないと頭を下げた。事務室の扉を閉め、排気の煙る工業区の通りへ戻った。", { p: 1 }
        ])
      ]
    },
    {
      id: "inv",
      conf: "S",
      st: ["青年", "壮年"],
      need: ["就労中"],
      once: true,
      w: 0.6,
      t: "近所の知人が、{investmentProjectName}に一口乗らないかと声をかけてきた。広げられた収支の見込みを眺めながら、来月の家賃や仕送りの分を差し引いて、手元からいくら出せるか胸算用した。",
      c: [
        $terraData.K(
          "5万龍門幣だけを出し、小口の持分を持つ",
          {
            en: s => $rules.economy.availableFunds(s) >= 5e4 + $rules.economy.annualReserve(s),
            why: "出資後に一年分の生活予備を残せない"
          },
          [
            0.62,
            "5万龍門幣を託し、{investmentProjectName}の小口持分を持った。知人と握手を交わして別れたあとも、家に残した生活費が足りるか気になって財布を確かめた。",
            {
              cash: -5e4,
              investment: 5e4,
              investmentType: "small_local_cooperative",
              fl: { investment_portfolio: 1 }
            }
          ],
          [
            1,
            "商売は軌道に乗らず、出した金は戻ってこなかった。生活費には手をつけていなかったのが救いだが、通りで知人を見かけるたび苦い気持ちになった。",
            { cash: -5e4, p: -2 }
          ]
        ),
        $terraData.K(
          "内訳と取り分を確かめ、15万龍門幣を出す",
          {
            en: s => $rules.economy.availableFunds(s) >= 15e4 + $rules.economy.annualReserve(s),
            why: "出資後に一年分の生活予備を残せない"
          },
          [
            0.42,
            "仕入れ値や取り分の約束を細かく確かめたうえで、15万龍門幣を出した。まとまった金を渡した緊張がしばらく抜けず、次の決算の知らせを心待ちにした。",
            {
              cash: -15e4,
              investment: 15e4,
              investmentType: "regional_small_business",
              fl: { investment_portfolio: 1 }
            }
          ],
          [
            1,
            "客足は伸びず、店はそのまま畳まれた。出資した15万龍門幣は戻らず、知人と顔を合わせるたびに気まずい沈黙が流れた。",
            { cash: -15e4, p: -4 }
          ]
        ),
        $terraData.K("今回は断り、貯えを残す", {}, [
          1,
          "「うちも余裕がなくてね」と断ると、知人は少し残念そうに書類を引っ込めた。家賃や仕送りは無事に払えたが、どこか気まずさが残った。",
          { p: -1, rl: -1 }
        ])
      ]
    },
    {
      id: "investment_exit",
      conf: "S",
      st: ["青年", "壮年", "老年"],
      need: ["investment_portfolio"],
      after: { id: "inv", min: 5 },
      w: 0.7,
      cd: 5,
      t: [
        {
          when: { ge: { investment: 150001 } },
          t: "出資先から精算の知らせが届いた。いま持分を手放せば{investmentCurrentValue}になり、出した元手を上回るという。ここで現金に替えるか、もうしばらく預けておくか思案した。"
        },
        {
          when: { le: { investment: 149999 } },
          t: "出資先から届いた知らせでは、持分の評価は{investmentCurrentValue}に落ち込み、元手を割り込んでいた。いま引けば損が確定するが、このまま待って持ち直す保証もない。"
        },
        {
          t: "出資先から届いた知らせによると、今の持分は{investmentCurrentValue}になるという。ここで現金に引き替えるか、もうしばらく様子を見るか決めどきだった。"
        }
      ],
      c: [
        $terraData.K("持分を売却し、{investmentCurrentValue}を現金で受け取る", {}, [
          1,
          "引き取り手が見つかり、持分を売って{investmentCurrentValue}を受け取った。浮き沈みを気にする日々に区切りがつき、少し肩の荷が下りた。",
          { investmentCashout: 1, fl: { investment_portfolio: 0 }, p: 1 }
        ]),
        $terraData.K("今は売らず、もうしばらく持ち続ける", {}, [
          1,
          "今は手放さないと決め、精算を見送った。次の季節にどう転ぶか、落ち着かない気持ちのまま日常へ戻った。",
          { p: -1 }
        ])
      ]
    },
    {
      id: "hobby",
      conf: "S",
      st: ["青年", "壮年", "老年"],
      w: 0.8,
      cd: 20,
      t: [
        {
          when: { need: ["貧困", "就労中"] },
          t: "長い仕事を終えて帰る道すがら、稽古場から漏れる楽器の音や、手仕事の道具、共同菜園の黒土が目にとまった。どれも心が動くが、今月の食費や家賃を思うと簡単には手が出せない。"
        },
        {
          when: { need: ["貧困", "退職後"] },
          t: "手元に残せる金を数えながら、稽古事や手仕事、菜園のどれかを始められないか考えた。暮らしの張りにはなるだろうが、最初の出費が重くのしかかる。"
        },
        {
          when: "就労中",
          t: "仕事帰りに、{hobbyExamples}を楽しむ人たちの姿を見かけた。仕事と家の往復だけではない時間を持ちたいと思い、懐具合と相談した。"
        },
        {
          when: "退職後",
          t: "勤めを離れてから、一日の時間が急に長くなった。稽古事や手仕事、土いじりを始めれば、暮らしに新しいリズムが生まれるかもしれない。"
        },
        {
          when: "貧困",
          t: "切り詰めた暮らしのなかでも、何かひとつ息を抜ける時間がほしかった。稽古事や手仕事、菜園にかかる費用を頭の中で何度も数えた。"
        },
        {
          t: "一日の用事を片づけたあと、以前から気になっていたことを始めてみようかと思い立った。稽古事、手仕事、それとも菜園か。自分の時間と財布に合うものを探した。"
        }
      ],
      c: [
        $terraData.K(
          "楽器を借りて稽古に通う（初期費用 {hobbyMusicStartCost}・以後年額 {hobbyAnnualCost}）",
          {
            show: { ban: ["hobby_music"] },
            en: { affordableCash: 1e5 },
            why: "初期費用{hobbyMusicStartCost}と以後の年額{hobbyAnnualCost}を地域物価込みで見込めない"
          },
          [
            1,
            "年季の入った楽器を借り、週に一度の稽古へ通い始めた。帰り道、まだぎこちない指使いを思い出しながら習った節を口ずさんだ。",
            { cash: -1e5, pm: 1, fl: { hobby_music: 1 }, p: 5 }
          ]
        ),
        $terraData.K(
          "手仕事の材料を買う（初期費用 {hobbyCraftStartCost}・以後年額 {hobbyAnnualCost}）",
          {
            show: { ban: ["hobby_craft"] },
            en: { affordableCash: 8e4 },
            why: "初期費用{hobbyCraftStartCost}と以後の年額{hobbyAnnualCost}を地域物価込みで見込めない"
          },
          [
            1,
            "端切れや小刀を買い揃え、夜なべして小さな品を仕上げた。無心で手を動かしているあいだは、昼間の疲れも忘れられた。",
            { cash: -8e4, pm: 1, fl: { hobby_craft: 1 }, p: 4 }
          ]
        ),
        $terraData.K(
          "共同の菜園区画を借りる（初期費用 {hobbyGardenStartCost}・以後年額 {hobbyAnnualCost}）",
          {
            show: { ban: ["hobby_garden"] },
            en: { affordableCash: 6e4 },
            why: "初期費用{hobbyGardenStartCost}と以後の年額{hobbyAnnualCost}を地域物価込みで見込めない"
          },
          [
            1,
            "日当たりのよい一画を借りて種を蒔いた。双葉が顔を出すまで毎朝土の湿りを確かめ、最初の収穫は隣の区画の人と分け合った。",
            { cash: -6e4, pm: 1, fl: { hobby_garden: 1 }, p: 5, rl: 2 }
          ]
        ),
        $terraData.K(
          "地域の練習場で運動や武術を習う（初期費用 4万龍門幣）",
          {
            show: { ban: ["hobby_sport"] },
            en: { affordableCash: 4e4 },
            why: "道具と会費4万龍門幣を払うと生活費の予備を残せない"
          },
          [
            1,
            "地域の練習場へ顔を出し、汗を流すようになった。職場や家のしがらみとは関係なく、気楽に言葉を交わせる仲間ができた。",
            { cash: -4e4, pm: 1, fl: { hobby_sport: 1 }, p: 4, rl: 2 }
          ]
        ),
        $terraData.K(
          "古書・地図・土地の小物を集める（初期費用 3万龍門幣）",
          {
            show: { ban: ["hobby_collect"] },
            en: { affordableCash: 3e4 },
            why: "最初の品と保管に3万龍門幣を出せない"
          },
          [
            1,
            "露店を巡り、古い地図や土地のガラクタを少しずつ集め始めた。棚に並んだ品々を眺めていると、まだ見ぬ街や昔の暮らしが目に浮かんだ。",
            { cash: -3e4, pm: 1, fl: { hobby_collect: 1 }, p: 3, k: 1 }
          ]
        ),
        $terraData.K(
          "物語・唄・信仰の集まりに顔を出す（初期費用 1万龍門幣）",
          {
            show: { ban: ["hobby_story"] },
            en: { affordableCash: 1e4 },
            why: "移動費や会費1万龍門幣を用意できない"
          },
          [
            1,
            "近所の集まりに足を運び、古い唄や昔語りに耳を傾けた。温かい茶をすすりながら人の話を聞くうちに、次は自分の思い出も話してみたくなった。",
            { cash: -1e4, pm: 1, fl: { hobby_story: 1 }, p: 4, rl: 2 }
          ]
        ),
        $terraData.K("今は貯えを優先する", {}, [
          1,
          "財布の紐を締め、今月は見送ることにした。支払いは滞りなく済んだものの、練習場や菜園のそばを通るたび少し足が緩んだ。",
          { p: -1 }
        ])
      ]
    },
    {
      id: "hobby_strain",
      conf: "S",
      st: ["青年", "壮年", "老年"],
      need: ["家計逼迫"],
      any: ["hobby_music", "hobby_craft", "hobby_garden", "hobby_sport", "hobby_collect", "hobby_story"],
      ban: ["収容中", "隔離中"],
      after: { id: "hobby", min: 1 },
      w: 0.7,
      cd: 5,
      t: [
        {
          when: "hobby_music",
          t: "稽古の月謝を出せば、今週の食卓がさらに寂しくなる。借りている楽器を返せば楽になるのは分かっているが、週に一度の息抜きの場まで失うのが惜しかった。"
        },
        {
          when: "hobby_craft",
          t: "手仕事の材料を買った週は、食事のおかずを一品減らした。無心で手を動かす時間は心の支えだが、じわじわと減っていく蓄えから目を逸らせなくなってきた。"
        },
        {
          when: "hobby_garden",
          t: "菜園の区画代と種代を払うと、手元の小銭が心細くなった。収穫まではまだ間があり、今月の食費をどうつなぐか頭が痛い。"
        },
        {
          t: "楽しみにしていた趣味の出費が、家賃や食費に食い込み始めた。やめれば暮らしは少し楽になるが、ここまで続けてきた時間を手放す決心がつかない。"
        }
      ],
      c: [
        $terraData.K("今期も続ける", {}, [
          1,
          "自分の買い物をひとつ我慢して、趣味の時間を守った。台所のやりくりは苦しいままだが、気持ちまで擦り切れるのは防げた気がした。",
          { p: 2 }
        ]),
        $terraData.K("音楽を休み、楽器を返す", { show: { need: ["hobby_music"] } }, [
          1,
          "借りていた楽器を布で拭き、師匠に礼を言って返した。浮いた月謝で食料を買い、帰り道は指の代わりに口笛で習った節を吹いた。",
          { fl: { hobby_music: 0 }, p: -3 }
        ]),
        $terraData.K("手仕事の道具をしまう", { show: { need: ["hobby_craft"] } }, [
          1,
          "材料を買い足すのをやめ、使い慣れた道具に油を塗って箱へしまった。棚に残った自作の品を撫で、また暮らしが落ち着いたら再開しようと心に決めた。",
          { fl: { hobby_craft: 0 }, p: -2 }
        ]),
        $terraData.K("菜園区画を返す", { show: { need: ["hobby_garden"] } }, [
          1,
          "借りていた区画を返し、余った種は隣の畑の人に譲った。出費は軽くなったが、雨上がりの土の匂いを思い出すと少し寂しかった。",
          { fl: { hobby_garden: 0 }, p: -3, rl: -1 }
        ]),
        $terraData.K("運動や武術の稽古を休む", { show: { need: ["hobby_sport"] } }, [
          1,
          "練習場の仲間に事情を話し、会費のかかる稽古をいったん休むことにした。朝晩の軽い運動だけは、家の前でひとりで続けている。",
          { fl: { hobby_sport: 0 }, p: -2 }
        ]),
        $terraData.K("集めた品をしまい、買い足しをやめる", { show: { need: ["hobby_collect"] } }, [
          1,
          "露店巡りを控え、新しい品を買うのをやめた。懐に余裕が戻るまでは、今ある品を時おり手にとって眺めるだけにしておく。",
          { fl: { hobby_collect: 0 }, p: -1 }
        ]),
        $terraData.K("集まりへの参加をいったん休む", { show: { need: ["hobby_story"] } }, [
          1,
          "顔なじみにしばらく休むと伝え、会費と足代を浮かせた。集まりのある日の夕方は、部屋の窓から外のざわめきを遠くに聞いた。",
          { fl: { hobby_story: 0 }, p: -2 }
        ])
      ]
    },
    {
      id: "dis",
      conf: "S",
      st: ["青年", "壮年"],
      need: ["就労中"],
      any: ["種族差別", "制度差別"],
      cd: 5,
      w: 0.8,
      t: [
        {
          when: { need: ["隠蔽", "種族差別"] },
          t: "現場の監督から、あなたの種族を理由に条件の悪い持ち場へ移るよう言い渡された。「上の決まりだ」の一点張りで、どんな規則なのか尋ねても取り合わなかった。"
        },
        {
          when: "隠蔽",
          t: "「地域の決まりだから」と曖昧な理由をつけられ、職場での昇給や配置の手続きを止められた。根拠を尋ねても、担当者は目を合わせようともしない。"
        },
        {
          when: { need: ["種族差別", "感染診断済"] },
          t: "種族と鉱石病の両方を挙げつらわれ、人目につかない裏方の持ち場へ外された。「規則通りだ」と言うばかりで、抗弁を聞く気配はなかった。"
        },
        {
          when: "種族差別",
          t: "種族を理由に、割のいい仕事から急に外された。なぜ自分だけなのか問い詰めても、監督は「決まりだ」と繰り返すばかりだった。"
        },
        {
          when: "感染診断済",
          t: "鉱石病の診断が職場に伝わると、翌週から急に持ち場を変えられた。「安全上の規則だ」と言われたが、体のいい厄介払いであることは誰の目にも明らかだった。"
        },
        {
          t: "職場で自分だけ扱いが変わり、手当の薄い仕事へ回された。「規則だから」と突き放されたが、その規則とやらを誰も見せてはくれなかった。"
        }
      ],
      c: [
        $terraData.K("その場では唇を噛んで従う", {}, [
          1,
          "ここで逆らえば明日の食い扶持まで失いかねない。奥歯を噛み締めて引き下がったが、帰り道も屈辱が胸の奥でくすぶり続けた。",
          { p: -8, cr: -3, fl: { discrimination_silenced: 1 } }
        ]),
        $terraData.K(
          "不当だと声を上げる",
          {},
          [
            0.4,
            "見ていた同僚の一人が「そんな決まりは聞いたことがない」と口を添えてくれた。監督は舌打ちして引き下がり、翌週の勤務表には元の持ち場が戻っていた。",
            { cr: 5, rl: 3, fl: { discrimination_complaint: 1 } }
          ],
          [
            1,
            "食い下がったその日のうちに契約を打ち切られた。私物を詰めた袋を肩にかけ、冷たい風の吹く通りへ次の働き口を探しに出た。",
            { job: 0, p: -10, rl: -8, fl: { discrimination_complaint: 1 } }
          ]
        )
      ]
    },
    {
      id: "race_identity",
      conf: "S",
      references: ["SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["児童", "少年"],
      any: ["地域で少数派", "多種族の交流圏", "異種族の家族"],
      w: 0.7,
      cd: 10,
      t: [
        {
          when: { need: ["地域で少数派", "就学中"] },
          t: "教室で名簿を読み上げた先生が、あなたの種族の欄でつっかえて何度も言い直した。後ろの席からくすくす笑う声が聞こえ、帰り道、家の人に打ち明けるか迷った。"
        },
        {
          when: "地域で少数派",
          t: "近所の集まりで名前を聞かれたとき、あなたの種族を知った大人が珍しそうに何度も聞き返し、そばの子どもが笑った。家の人に話すべきか迷いながら帰った。"
        },
        {
          when: "異種族の家族",
          t: "親戚が集まった席で、角や尾、耳の形が周りと言葉通り違うことをからかわれた。愛想笑いを返したあとも、家族の中で自分だけ姿が違うことが胸に引っかかった。"
        },
        {
          when: "多種族の交流圏",
          t: "市場の手伝いに集まる子どもたちは、種族も生まれ故郷もばらばらだ。荷運びの合間に互いの角や耳、家の習慣を比べ合ううち、自分自身のルーツについても考えさせられた。"
        },
        {
          t: "同じ種族ばかりの土地で育ち、自分の姿を特別だと思ったことは一度もなかった。よその土地から来た子に珍しそうにじろじろ見られ、初めて自分の輪郭を意識した。"
        }
      ],
      c: [
        $terraData.K("信頼できる大人に打ち明ける", {}, [
          1,
          "その人は手を止め、あなたの家族や故郷の話をゆっくり聞いてくれた。すっきりした答えは出なかったが、胸のつかえを言葉にできただけで少し息がしやすくなった。",
          { p: 3, rl: 3 }
        ]),
        $terraData.K("誰にも言わず、自分の中で考える", {}, [
          1,
          "水たまりや鏡に映る自分の顔をじっと見つめ、昼間の言葉と重ね合わせてみた。何がそんなに特別なのか、まだうまく言葉にできなかった。",
          { k: 1, p: 1 }
        ])
      ]
    },
    {
      id: "family_launch",
      show: s => !educationSchoolOrDecision(s),
      conf: "S",
      references: ["SRC_TERRA_FAMILY"],
      st: ["少年", "青年"],
      ge: { age: 13 },
      le: { age: 20 },
      need: ["家計相談の時期"],
      once: true,
      pri: true,
      w: 1,
      t: [
        {
          when: "家計負債",
          t: "家の借金の返済が毎月重くのしかかっている。夕食のあと、家の人は来月のやりくりを前にため息をつき、あなたにもこれからどう家を支えるか相談を持ちかけた。"
        },
        {
          when: "就学中",
          t: "学業を続けるための出費と、家の毎月の暮らし向きを突き合わせた。通学の費用をどう捻出するか、家で手伝う役割も含めて食卓で話し合った。"
        },
        {
          when: "就労中",
          t: "自分の手で給金を稼ぐようになり、家の人と食費や光熱費の分担を話し合った。家にいくら入れ、自分の手元にいくら残すか、大人としての相談が始まった。"
        },
        {
          t: "今は学校にも勤め先にも通っていない。食卓を囲みながら毎月の暮らし向きを確かめ、家の仕事をどう引き受けるか、これからどう働くかを話し合った。"
        }
      ],
      c: [
        $terraData.K("給金の30%を家の生活費に入れる", { show: { need: ["就労中"] } }, [
          1,
          "これからは給金の三割を家の食費や燃料代に入れると決めた。自分の稼ぎが家の食卓を支えていると思うと、少し背筋が伸びた。",
          { familyContribution: 0.3, residenceArrangement: "family_home_shared_budget", p: 1, rl: 2 }
        ]),
        $terraData.K("家族と同居しつつ、自分の財布は別にする", { show: { need: ["就労中"] } }, [
          1,
          "屋根の下には一緒に暮らしながら、給金の15%を部屋代として渡し、残りは自分でやりくりすることにした。",
          { familyContribution: 0.15, residenceArrangement: "family_home_separate_budget", p: 1, rl: 1 }
        ]),
        $terraData.K("当面は給金を家に入れず、今の暮らしを続ける", { show: { need: ["就労中"] } }, [
          1,
          "家族と話し合い、自分の稼ぎが安定するまでは家にお金を入れず、これまで通り一緒に暮らすことにした。余裕ができたらまた相談する。",
          { familyContribution: 0, residenceArrangement: "family_home_shared_budget", p: 1 }
        ]),
        $terraData.K("家事や雑用を引き受け、今の暮らしを続ける", { show: s => !s.job }, [
          1,
          "現金を入れられない代わりに、炊事や洗濯、細かな雑用を一手に引き受けることにした。家の人も助かると頷いてくれた。",
          { familyContribution: 0, residenceArrangement: "family_home_shared_budget", p: 1, rl: 2 }
        ]),
        $terraData.K("これからの働き口や学び方を家族と相談する", { show: s => !s.job }, [
          1,
          "家の台所事情を確かめたあと、どんな働き口や学びの場があるか知恵を出し合った。まだ行き先は決まらないが、焦らず探すことになった。",
          { familyContribution: 0, residenceArrangement: "family_home_shared_budget", k: 1, rl: 1 }
        ])
      ]
    },
    {
      id: "family_separation",
      show: s => !educationFullTime(s) && (s.residenceArrangement == null || s.residenceArrangement.startsWith("family_home_")) && !s.fl?.frontier_contract && !s.fl?.rhodes_landship,
      conf: "S",
      references: ["SRC_TERRA_FAMILY"],
      st: ["少年", "青年"],
      need: ["家計分離の時期"],
      once: true,
      pri: true,
      w: 1,
      t: [
        {
          when: "就労中",
          t: "自分の稼ぎを家に入れるようになってしばらく経った。このまま家族と同じ財布で暮らすか、自分の所帯や収支を分けるか、身の振り方を話し合った。"
        },
        {
          when: "家計負債",
          t: "家の借金はまだ残り、親やきょうだいの食い扶持も要る。実家に残って一緒に返すか、それとも部屋を借りて所帯を分けるか、夜遅くまで膝を突き合わせて話し合った。"
        },
        {
          when: "家計逼迫",
          t: "そろそろ家族と財布を分けるかという話が出た。カツカツの暮らしのなかで独立の支度金が出せるのか、家の蓄えを数えながら相談した。"
        },
        {
          t: "学校を出てからの身の振り方について、家族とじっくり話し合った。このまま実家で助け合って暮らすか、自立して部屋を借りるか、将来の計画を突き合わせた。"
        }
      ],
      c: [
        $terraData.K(
          "独立資金を相談し、別の部屋を借りて出る",
          {
            en: { ge: { householdCash: 300000 }, le: { householdDebt: 0 } },
            why: "家計の貯え30万龍門幣以上・負債なしの条件を満たしていない"
          },
          [
            0.75,
            "家族は快く支度金を分けてくれた。小さな部屋を借りて荷物を運び込み、自分の稼ぎで家賃と食費を払う暮らしが始まった。休みの日には実家へ顔を出している。",
            {
              familyTransfer: 0.2,
              fl: { household_separated: 1 },
              residenceArrangement: "independent_rental",
              careNetworkContact: "start",
              p: 2,
              rl: 2
            }
          ],
          [
            1,
            "今の家の蓄えから支度金を出すのは心もとないと親に言われた。無理に部屋を借りるのはやめ、もう少しお金が貯まるまで実家に残ることにした。",
            { residenceArrangement: "family_home_shared_budget", p: -1 }
          ]
        ),
        $terraData.K("同じ家に残り、財布だけを分ける", {}, [
          0.75,
          "住まいはそのままに、食費と光熱費の分担だけを決めて互いの財布を分けることにした。家族は独立の小遣いとして蓄えの一部を分けてくれ、ほどよい距離感ができてかえって家の空気が穏やかになった。",
          {
            familyTransfer: 0.15,
            fl: { household_separated: 1 },
            residenceArrangement: "family_home_separate_budget",
            careNetworkContact: "start",
            p: 1,
            rl: 2
          }
        ], [
          1,
          "「今はまだ一つの財布でやりくりした方が安心だ」と家の人に言われ、これまで通りの暮らしを続けることにした。",
          { residenceArrangement: "family_home_shared_budget", p: -1 }
        ]),
        $terraData.K("すぐには分けず、家族と同じ財布で暮らす", {}, [
          1,
          "無理に財布を分けず、稼ぎも出費も家族と一つにして暮らすことにした。独立の話は、もう少し暮らしが落ち着いてからでも遅くない。",
          { residenceArrangement: "family_home_shared_budget", p: 1, rl: 2 }
        ])
      ]
    },
    {
      id: "family_allowance_support",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年"],
      ge: { age: 18 },
      le: { age: 40 },
      show: s =>
        (s.fl?.household_separated || s.residenceArrangement !== "family_home_shared_budget") &&
        (s.house?.cash || 0) > 300000 &&
        (s.house?.debt || 0) <= 0 &&
        (s.care?.parentKeys || ["fa", "mo"]).some(k => s.par?.[k] && !s.par[k].d),
      w: 0.7,
      cd: 5,
      t: [
        {
          when: "裕福",
          t: "実家の親から定期の便りと小包が届いた。手紙には近況を気遣う言葉とともに、何かと物入りの多い時期だろうからと、日々の暮らしを支えるための仕送りの為替が同封されていた。"
        },
        {
          t: "離れて暮らす家族から、手紙と一緒に小包が届いた。手紙には体調を気遣う言葉と、少しばかりだが日々の足しにしてほしいと仕送りの為替が添えられている。"
        }
      ],
      c: [
        $terraData.K("ありがたく仕送りを受け取る", {}, [
          1,
          "家族からの温かい支援をありがたく受け取った。離れて暮らしていても、実家が見守ってくれている安心感に胸が温かくなった。",
          { familyTransfer: 0.1, p: 1, rl: 2 }
        ]),
        $terraData.K("自分の稼ぎでやっていけると丁重に辞退する", {}, [
          1,
          "手紙を返し、自分の力で生活できていると伝えて為替は辞退した。親からも「頼もしくなった」と誇らしげな返信が届いた。",
          { p: 2, rl: 1 }
        ]),
        $terraData.K(
          "仕送りは辞退し、逆に実家へ支援金を送る",
          {
            show: s => (s.cash || 0) >= 200000 && ((s.job || 0) > 0 || (s.inc || 0) > 0)
          },
          [
            1,
            "仕送りは丁重に断り、むしろ日頃の感謝を込めて実家の家計へまとまった支援金を包んで送った。家族から感謝と労りの便りが届いた。",
            { selfCash: -150000, p: 3, rl: 3 }
          ]
        )
      ]
    },
    {
      id: "fam_unemploy",
      conf: "S",
      st: ["児童", "少年"],
      need: ["貧困", "家計を担う親あり"],
      ban: ["失業中の親"],
      w: 0.6,
      cd: 10,
      t: [
        { when: "家計逼迫", t: "大黒柱だった親が職を失った。ただでさえ苦しかった台所は火の車で、明日のパンや米をどうするかという声が部屋に響いた。" },
        { t: "親が働き口を失い、肩を落として帰ってきた。次の仕事が見つかるまでどうやって食い繋ぐか、家族で額を集めた。" }
      ],
      c: [
        $terraData.K(
          "自分も働きに出る",
          { show: s => s.age >= $rules.parameters.value("life.workStartAge") },
          [
            0.7,
            "学校へ通うのを諦め、日雇いの荷運びに出た。泥だらけで持ち帰った小銭で食卓はつないだが、親の働き口はまだ見つからない。",
            { job: 1, fl: { sch: 0, parent_unemployed: 1 }, cash: 5e4, p: -5, h: -5 }
          ],
          [
            1,
            "大人の嫌がる危険な現場しか口がなく、無理がたたって体を壊した。親の仕事も決まらず、食費と薬代のどちらを先に出すかで家が暗くなった。",
            { job: 1, fl: { sch: 0, workplace_hazard: 1, parent_unemployed: 1 }, cash: 5e4, h: -15, p: -8 }
          ]
        ),
        $terraData.K(
          "勉学を続ける",
          { en: { ge: { sch: 1 } }, why: "学校に通っていない" },
          [
            0.5,
            "「お前は学校へ行け」と親が背中を押してくれた。すり減った靴で通学を続けたが、親は毎日仕事を探し回って疲れ切っていた。",
            { p: 3, rl: 5, fl: { parent_unemployed: 1 } }
          ],
          [
            1,
            "学費どころか日々の食事にも事欠くようになり、学校を辞めざるを得なくなった。親の新しい仕事もまだ見つからない。",
            { fl: { sch: 0, parent_unemployed: 1 }, p: -10 }
          ]
        ),
        $terraData.K("家の仕事を手伝って支える", {}, [
          1,
          "水汲みや炊事、細かな繕い物を引き受け、親が仕事探しに回れるよう家を守った。まだ吉報は届かないが、食卓ではなるべく明るい声を出し合った。",
          { p: 2, rl: 8, h: -2, fl: { parent_unemployed: 1 } }
        ])
      ]
    },
    {
      id: "fam_rehire",
      conf: "S",
      st: ["児童", "少年"],
      need: ["失業中の親"],
      w: 0.8,
      cd: 8,
      t: "職を探していた親に、ようやく一件の口利きがあった。ただ、日当は安く、仕事に使う道具も自前で揃えなければならないらしい。夕食の席で親の迷う顔を見て、自分にできることを考えた。",
      c: [
        $terraData.K(
          "条件を確かめに、紹介先へ一緒について行く",
          {},
          [
            0.7,
            "親に付き添って現場へ行き、日当や労働時間を一緒に聞いた。すぐには飛びつかず、家に帰ってから本当にやっていけるか話し合った。",
            { rl: 2, p: 1 }
          ],
          [
            1,
            "訪ねてみると、すでに別の人が雇われた後だった。肩を落とす親と並んで帰りながら、なけなしの金で道具を先に買わなくてよかったと思うしかなかった。",
            { p: -1 }
          ]
        ),
        $terraData.K(
          "交通費や道具代の足しを渡す（2万龍門幣）",
          {
            en: s => $rules.economy.availableFunds(s) >= 2e4 + $rules.economy.annualReserve(s),
            why: "生活費の予備を残したうえで、交通費と道具代2万龍門幣を出せない"
          },
          [
            1,
            "貯めていた2万龍門幣をそっと親の手に握らせた。親は何度も礼を言い、必要な道具を見繕うため急いで表へ出ていった。",
            { cash: -2e4, p: 1, rl: 2 }
          ]
        ),
        $terraData.K("家の雑事を引き受け、親を送り出す", {}, [
          1,
          "買い出しや夕飯の支度を引き受け、親が身軽に面談へ行けるようにした。夕方、くたびれて帰ってきた親に温かい茶を出した。",
          { p: 1, rl: 3 }
        ])
      ]
    },
    {
      id: "fam_conscript",
      conf: "S",
      st: ["少年"],
      need: ["兄弟あり", "戦乱地域"],
      any: ["国:ウルサス", "国:ヴィクトリア", "国:カズデル"],
      ge: { age: 15 },
      le: { age: 17 },
      w: 0.5,
      cd: 15,
      t: "戦火が迫るなか、きょうだいの一人に部隊への招集状が届いた。泣き崩れる家族のそばで、免除を願い出るか、自分が身代わりに出るか、重苦しい相談が続いた。",
      c: [
        $terraData.K(
          "家族で役所へ掛け合い、免除を願い出る",
          {},
          [
            0.6,
            "家族総出で窓口へ頭を下げ、家の窮状を必死に訴えた。係官は渋い顔で書類を預かり、徴集はひとまず先送りになった。きょうだいと肩を抱き合って家へ帰った。",
            { rl: 5, cr: -2, p: 2 }
          ],
          [
            1,
            "どれほど食い下がっても免除は認められず、きょうだいは兵舎へ連れて行かれた。「いつ帰れるのか」と叫ぶ声に、係官は振り返りもしなかった。",
            { rl: -10, p: -8 }
          ]
        ),
        $terraData.K(
          "きょうだいと語り合い、集合場所まで見送る",
          {},
          [0.7, "きょうだいは覚悟を決め、ぶかぶかの軍服に袖を通した。門の向こうへ消える寸前、こちらを振り返って短く手を振った。", { rl: 3, p: -2 }],
          [1, "数ヶ月後、きょうだいが前線で行方知れずになったという冷たい通知だけが届いた。", { rl: -15, p: -12, fl: { trauma_war: 1 } }]
        ),
        $terraData.K(
          "自分が身代わりになって出頭する",
          { show: { ban: ["健康不良"] } },
          [
            0.5,
            "きょうだいを家に残し、自分が徴集の列に入った。泥にまみれる訓練と行軍の日々が始まり、故郷からの便りは次第に途絶えていった。",
            { job: 14, fl: { conscripted: 1, veteran: 1 }, cr: 5, h: -10 }
          ],
          [
            1,
            "過酷な訓練のさなかに大怪我を負い、使い物にならないと部隊を追い出された。足を引きずりながら、長い道のりをかけて家へ戻った。",
            { job: 0, h: -30, p: -10, fl: { conscripted: 1, veteran: 1 } }
          ]
        )
      ]
    },
    {
      id: "fam_infected",
      conf: "S",
      references: [
        "SRC_ORIPATHY_SOCIAL",
        "SRC_TERRA_FAMILY",
        "SRC_URSUS_INFECTED",
        "SRC_LEITHANIEN_INFECTION",
        "SRC_LATERANO_CIVIC"
      ],
      st: ["児童", "少年"],
      need: ["未把握の親感染"],
      cd: 1,
      w: 0.4,
      t: [
        {
          when: "地域の感染者圧力が強い",
          t: "{parentName}が鉱石病だと分かった。その夜から、家では窓を閉め切ってひそひそ声で話すようになった。よそで絶対に口にするなと言い含められたが、職場や大家にバレたらどうなるかという怯えが食卓に張りついていた。"
        },
        {
          when: "地域の感染者圧力が比較的弱い",
          t: "{parentName}が鉱石病の診断を受けた。通いやすい診療所を探し、口の堅い親戚にも打ち明けたが、外で感染者の悪い噂を耳にするたび、親は仕事場の目を気にして肩を落とした。"
        },
        {
          t: "{parentName}の肌に黒い結晶が見つかり、鉱石病だと告げられた。誰に打ち明け、どうやって薬代と仕事を守るか、家の空気が一変した。"
        }
      ],
      c: [
        $terraData.K(
          "近所には伏せ、家族で通院を支える",
          { pw: [1, { when: "地域の感染者圧力が強い", x: 1.5 }, { when: "感染者偏見", x: 1.3 }] },
          [
            0.6,
            "周りに気づかれないよう、親は人目を避けてこれまでの診療所へ通い続けた。体がつらい日でも、家の前では何事もない顔で振る舞っていた。",
            {
              rl: 8,
              p: 2,
              parentTreatment: 1,
              fl: { parent_infected: 1 },
              infectionAwarenessActions: [
                { subject: "parent", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "parent", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" },
                { subject: "parent", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" }
              ]
            }
          ],
          [
            1,
            "隠し通せず近所に知れ渡り、道ですれ違っても挨拶を返されなくなった。親をかばったあなたまで学校で遠巻きにされ、家族は誰にも頼れないまま肩を寄せ合った。",
            {
              rl: -20,
              p: -15,
              cash: -2e5,
              parentTreatment: 1,
              fl: { parent_infected: 1 },
              infectionAwarenessActions: [
                { subject: "parent", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "parent", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" },
                { subject: "parent", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "parent", audience: "community", certainty: "confirmed", source: "reported-leak", consent: "nonconsensual", recipientRef: "current-residential-area" }
              ]
            }
          ]
        ),
        $terraData.K(
          "医師に今後の治療の続け方を相談する",
          { pw: [1, { when: "感染者への偏見に疑問", x: 1.3 }, { when: "感染者偏見", x: 0.7 }] },
          [
            0.5,
            "医師は声を潜め、無理なく薬を続ける方法を教えてくれた。帰り道、親はほっとしたようにあなたの手を強く握り、次の診察日まで二人で秘密を守ることにした。",
            {
              cr: 3,
              p: -5,
              rl: -5,
              parentTreatment: 1,
              fl: { parent_infected: 1 },
              infectionAwarenessActions: [
                { subject: "parent", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "parent", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" },
                { subject: "parent", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" }
              ]
            }
          ],
          [
            1,
            "診察室でもはっきりした見通しは立たず、次の診察まで様子を見ることになった。家の大人たちの会話がふいに途切れるたび、親の仕事やこの家がどうなるのかと胸が冷えた。",
            {
              rl: -12,
              p: -10,
              fl: { parent_infected: 1 },
              infectionAwarenessActions: [
                { subject: "parent", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "parent", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" },
                { subject: "parent", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" }
              ]
            }
          ]
        ),
        $terraData.K("近くの診療所へ親と一緒に通う", { show: "診療先へ通いやすい", pw: [1, { when: "感染者への偏見に疑問", x: 1.2 }, { when: "感染者偏見", x: 0.8 }] }, [
          1,
          "親の荷物を持って診療所へついて行った。消毒液の匂いがする待合室のベンチで順番を待ち、薬の袋を受け取る親の横顔をじっと見守った。",
          {
            k: 2,
            rl: 2,
            parentTreatment: 1,
            fl: { parent_infected: 1, family_clinic_familiarity: 1 },
            infectionAwarenessActions: [
              { subject: "parent", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
              { subject: "parent", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" },
              { subject: "parent", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" }
            ]
          }
        ]),
        $terraData.K("巡回診療が来る日を確かめ、付き添う人を決める", { show: "診療先が遠い", pw: [1, { when: "感染者への偏見に疑問", x: 1.2 }, { when: "感染者偏見", x: 0.8 }] }, [
          1,
          "町に診療所はなく、巡回の医療車が来る日も月にわずかしかない。親が倒れる前に誰が仕事を休んで付き添うか、家族で足代をかき集めながら話し合った。",
          {
            k: 2,
            p: -2,
            fl: { parent_infected: 1, family_clinic_familiarity: 1 },
            infectionAwarenessActions: [
              { subject: "parent", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-mobile-clinic" },
              { subject: "parent", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" },
              { subject: "parent", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-mobile-clinic" }
            ]
          }
        ]),
        $terraData.K(
          "いっそ別の土地へ移ろうと家族に話す",
          { en: { affordableRoute: 3e5 }, why: "運賃と家族の当面の費用を用意できない" },
          [
            0.4,
            "後ろ指をさされる前に、家族で運賃を払って街を出た。背負えるだけの荷物を抱え、誰も自分たちを知らない土地へ向かった。",
            {
              res: 1,
              job: 0,
              p: -8,
              cash: -3e5,
              rl: 5,
              parentTreatment: 1,
              fl: { parent_infected: 1, sch: 0 },
              infectionAwarenessActions: [
                { subject: "parent", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "parent", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" }
              ]
            }
          ],
          [
            1,
            "旅の途中で宿が取れず、冷たい風に吹かれて親の熱が上がってしまった。あなたも疲れ果てて動けなくなり、旅を諦めて元の街へ引き返した。",
            {
              h: -20,
              p: -10,
              fl: { parent_infected: 1 },
              infectionAwarenessActions: [
                { subject: "parent", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "parent", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" }
              ]
            }
          ]
        )
      ]
    },
    {
      id: "fam_gunrite",
      conf: "S",
      references: ["SRC_LATERANO_CIVIC"],
      st: ["少年"],
      need: ["国:ラテラーノ", "種族:サンクタ"],
      ge: { age: 12 },
      le: { age: 13 },
      w: 0.5,
      cd: 20,
      t: "教会から、守護銃の授与と訓練の知らせが届いた。家の人たちは晴れがましい顔で、あなたが一丁の銃を受け取る日を心待ちにしている。",
      c: [
        $terraData.K("守護銃を受け取り、扱いを学ぶ", {}, [
          1,
          "ずっしりと重い守護銃を手にし、射撃と手入れの訓練へ通い始めた。硝煙の匂いとともに、サンクタの一員になった実感が湧いた。",
          { fl: { gun: 1 }, cr: 5, k: 3, p: 3 }
        ]),
        $terraData.K(
          "家族に、銃を持たない道を打ち明ける",
          {},
          [0.7, "銃は受け取らないと打ち明けた。家族は戸惑っていたが、最後にはあなたの気持ちを汲んで教会へ話を通してくれた。", { p: 3, cr: -2 }],
          [1, "「サンクタでありながら何ということを」と親に深く失望され、しばらく食卓の空気が重かった。", { rl: -5, p: -3 }]
        )
      ]
    },
    {
      id: "fam_tribetree",
      conf: "S",
      references: ["SRC_SAMI_CLANS"],
      st: ["少年"],
      need: ["国:サーミ", "氏族養育"],
      w: 0.8,
      once: true,
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      t: "世話になってきた氏族の聖樹の下で、雪祭司が集まりを開いた。大人たちは焚き火を囲み、次の季節の移動にもあなたを連れていくか話し合っている。",
      c: [
        $terraData.K("これからも氏族と歩き続けたいと伝える", {}, [
          1,
          "次の移動から一人前の手伝いを任されることになった。吹雪の避け方や獣道の名前を教わるたび、この氏族の中に自分の居場所が根づいていくのを感じた。",
          { rl: 8, p: 4, k: 2 }
        ]),
        $terraData.K(
          "よその土地の親類を頼りたいと話す",
          {
            en: { ge: { routes: 1 }, affordableRoute: 1e5 },
            why: "移動先への運賃と当面の寝床代を用意できない"
          },
          [
            0.5,
            "紹介状を懐にしまい、運賃を払って南へ続く荷車に乗った。揺れる荷台の上で、聞き慣れた氏族の唄が白樺の森の向こうへ遠ざかっていった。",
            { res: 1, job: 0, rl: -10, p: 1, cash: -1e5, fl: { sch: 0 } }
          ],
          [
            1,
            "旅立つ支度までしたが、頼るはずの親類から迎えの返事が来なかった。気まずさを抱えたまま幕舎へ戻り、また氏族と冬を越すことになった。",
            { p: -4 }
          ]
        )
      ]
    },
    {
      id: "fam_mafia",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_CRIME_REGIONAL"],
      st: ["少年"],
      need: ["国:シラクーザ", "family"],
      once: true,
      w: 0.7,
      t: "ファミリーの下働きで最初の夜を終えると、奥の部屋で年長者が革張りの帳簿をパタンと閉じた。「いいか、表で喋っていいことと、墓まで持っていくことがある」。煙草の煙の向こうから、値踏みするような目がこちらを見ていた。",
      c: [
        $terraData.K(
          "黙って頷き、次の仕事も引き受ける",
          {},
          [
            0.7,
            "言われた通りに口をつぐみ、夜陰に紛れて荷を運んだ。渡された封筒の金で家の台所は潤ったが、家の人にも言えない秘密がひとつ増えた。",
            { cr: 2, rl: 2, cash: 2e5 }
          ],
          [
            1,
            "運んでいた荷が途中で消え、下っぱのあなたに全ての咎が押しつけられた。路地裏で蹴り倒され、腫れ上がった肩を押さえて帰っても、親には転んだとしか言えなかった。",
            { h: -10, p: -6, cash: -1e5, fl: { trauma_crime: 1 } }
          ]
        ),
        $terraData.K(
          "深入りする前に足を洗う",
          {},
          [
            0.5,
            "これ以上は関われないと頭を下げ、ファミリーの溜まり場から足を遠ざけた。昔の仲間と目が合わないよう裏通りを避け、昼間の仕事を探し始めた。",
            { siracusaFamilyAction: "distant", fl: { family: 0 }, p: 3, rl: -5 }
          ],
          [
            1,
            "抜けると言い出した途端、裏切り者扱いされた。手切れ金を絞り取られたうえに痛めつけられ、家に帰ってからも階段を上がる足音にビクつくようになった。",
            { h: -20, p: -10, cash: -2e5, fl: { trauma_crime: 1 } }
          ]
        )
      ]
    },
    {
      id: "fam_inherit",
      conf: "S",
      st: ["青年"],
      need: ["存命の商人親"],
      ge: { age: 18 },
      le: { age: 25 },
      w: 0.5,
      cd: 15,
      t: [
        {
          when: "就学中",
          t: "商いを切り盛りする親から、そろそろ店の仕事を手伝わないかと切り出された。まだ学業を続けたい気持ちもあるが、年々白髪の増える親の横顔を見ると簡単には断れなかった。"
        },
        {
          t: "商いを続ける親から、店の帳場や仕入れを一緒に回さないかと声がかかった。親の背中を追って店を継ぐ道と、よそで自分の腕を試す道の間で心が揺れた。"
        }
      ],
      c: [
        $terraData.K("親の店に入り、商いを覚える", { show: { ban: ["就学中"] } }, [
          1,
          "前掛けを締め、親の隣で仕入れ先との駆け引きや算盤を覚え始めた。看板を継ぐのはまだ先だが、常連客に顔を覚えてもらうのが嬉しかった。",
          { job: 5, cr: 2, rl: 6, p: 3 }
        ]),
        $terraData.K("今は学業を続けたいと伝える", { show: { need: ["就学中"] } }, [
          1,
          "「もう少しだけ勉強を続けさせてほしい」と頭を下げた。親は少し寂しそうに頷き、店の話は卒業まで待ってくれることになった。",
          { ep: 5, k: 2, rl: 2, p: 2 }
        ]),
        $terraData.K("店は継がず、よそで働き口を探す", { show: { ban: ["就学中"] } }, [
          1,
          "自分の力で外の世界を見てみたいと伝え、店の話を断った。夕食の席で商売の話題が出るたび、気まずくて茶碗に目を落とした。",
          { p: 3, rl: -5 }
        ]),
        $terraData.K("すぐには決めず、もう少し考えさせてほしいと言う", {}, [
          1,
          "まだ心の整理がつかないと正直に伝えた。夜、店を閉めるシャッターの音を聞きながら、自分が帳場に立つ姿を思い描いてみた。",
          { p: -1, rl: 2 }
        ])
      ]
    },
    {
      id: "parent_work_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      need: ["親の仕事変更を知らせる"],
      w: 0.42,
      cd: 1,
      t: "{parentName}から封書が届き、長く続けた{parentOldWork}を辞めて{parentWork}に移ったと知らされた。少し震えた文字の行間から、そちらの暮らし向きが気にかかった。",
      c: [
        $terraData.K("新しい仕事の具合を尋ねる返事を書く", {}, [
          1,
          "体に無理はないかと案じる手紙を送った。折り返し届いた便りには、慣れない仕事への愚痴と、元気でやっているという言葉が綴られていた。",
          { parentJobNotice: 1, rl: 3, p: 1 }
        ]),
        $terraData.K("深入りはせず、短い挨拶だけ返す", {}, [
          1,
          "あれこれ詮索するのは控え、「体に気をつけて」とだけ添えて返事を出した。お互いの暮らしに踏み込みすぎない距離を保った。",
          { parentJobNotice: 1, rl: 0, p: 0 }
        ]),
        $terraData.K(
          "きょうだいにも知らせて、親の様子を話し合う",
          { show: { need: ["存命のきょうだいがいる"] } },
          [
            1,
            "きょうだいにも手紙の内容を伝え、それぞれが聞いていた親の近況を持ち寄った。今度誰が様子を見に行くか相談がまとまった。",
            { parentJobNotice: 1, rl: 2, p: 1 }
          ]
        )
      ]
    },
    {
      id: "parent_household_move_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_MOBILE_CITY_MOBILITY"],
      st: ["青年", "壮年", "老年"],
      need: ["親世帯の転居知らせ"],
      w: 0.38,
      cd: 1,
      t: "親から転居の便りが届いた。住み慣れた{parentHouseholdFrom}を引き払い、きょうだいと一緒に{parentHouseholdTo}へ移ったという。見慣れない新しい宛先を指でなぞりながら、向こうでの暮らしを思いやった。",
      c: [
        $terraData.K("新しい土地での暮らしや病院のことを尋ねる", {}, [
          1,
          "{parentHouseholdTo}での住み心地や、通える診療所が見つかったかを尋ねる手紙を出した。新しい街の風の匂いが伝わるような返事が届き、ひとまず胸をなで下ろした。",
          { parentMoveNotice: 1, rl: 3, p: 1 }
        ]),
        $terraData.K("無事を祝う短い返事だけ送る", {}, [
          1,
          "落ち着いたらまた知らせてほしいとだけ書いて返事を出した。新しい住所を古いメモ帳の端に書き写し、静かにしまった。",
          { parentMoveNotice: 1, rl: 0, p: 1 }
        ]),
        $terraData.K("きょうだいと連絡を取り、向こうの様子を聞く", { show: { need: ["存命のきょうだいがいる"] } }, [
          1,
          "一緒に越したきょうだいへ連絡を入れ、荷解きや親の体調がどうだったかを聞いた。次に会える日を楽しみに言葉を交わした。",
          { parentMoveNotice: 1, rl: 2, p: 1 }
        ])
      ]
    },
    {
      id: "parent_treatment_review",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      need: ["親が療養費の判断を迫られている"],
      once: true,
      w: 1,
      who: "parent",
      t: [
        {
          when: s => $rules.family.inSharedHousehold(s),
          t: "実家の台所事情がいよいよ苦しくなり、{parentName}の療養費を出し続けるのが限界に近づいていた。病院の窓口で支払いの見通しを問われ、親は重い足取りで帰ってきた。"
        },
        {
          t: "実家の台所事情がいよいよ苦しくなり、{parentName}の療養費を出し続けるのが限界に近づいていた。様子を見に実家へ立ち寄ると、病院の窓口で支払いの見通しを問われて親が重い足取りで戻ってきたところだった。"
        }
      ],
      c: [
        $terraData.K("日々の食事や修繕を削ってでも、通院を続ける", {}, [
          1,
          "食事のおかずを減らし、雨漏りの修繕も後回しにして薬代を捻出した。親は薄くなった薬袋を大事そうに抱え、次の診察日も通うことにした。",
          { parentTreatmentReview: 1 }
        ]),
        $terraData.K("いったん通院を諦め、家で様子を見る", {}, [
          1,
          "{parentName}は医師に頭を下げ、しばらく通院を休むと告げた。痛みをこらえる親の背中を見ながら、少しでもお金が貯まったら必ずまた診せに行こうと誓った。",
          { parentTreatmentReview: 0 }
        ])
      ]
    },
    {
      id: "fam_care",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE", "SRC_MOBILE_CITY_MOBILITY"],
      need: ["親存命", "親の継続的な手助けが必要"],
      ban: ["親族ケアの再相談が必要"],
      ge: { age: 35 },
      cd: 10,
      w: 0.5,
      t: "{parentName}の足腰と体調が目に見えて弱り、通院や日々の炊事・買い出しを一人でこなすのが難しくなってきた。自分の仕事や暮らしもあるなか、誰とどう手分けして親を支えるか考えなければならなかった。{parentTreatmentNote}",
      c: [
        $terraData.K(
          "自分が中心になって親の世話を引き受ける",
          {
            en: { ge: { h: 25 } },
            why: "二年間、付き添いや日々の用事を主に担う体調の目安に届いていない。きょうだいや親族へ頼る選択は残る",
            pw: [1, { when: "家族ケアへの関与経験が多い", x: 1.35 }]
          },
          [
            1,
            "{parentCareWorkAction}、病院の付き添いや日々の買い出しを背負った。{parentCareCostAction}自分の時間を削る二年間だったが、親の穏やかな顔を見ると悔いはなかった。",
            {
              p: 5,
              rl: 10,
              h: -5,
              familyCare: "parent",
              familyCarePlan: "direct",
              familyCareTreatmentSupport: 1,
              careInclination: 6
            }
          ]
        ),
        $terraData.K(
          "成人したきょうだいに、手分けできないか持ちかける",
          {
            show: { need: ["連絡を保っている成人きょうだいがいる"] },
            pw: [1, { when: "家族ケアへの関与経験が多い", x: 1.3 }]
          },
          [
            0.7,
            "きょうだいに事情を話すと、病院の付き添いと普段の買い出しを交代で受け持ってくれることになった。お金の分担はこれからだが、一人で抱え込まずに済むだけで随分と気が楽になった。",
            {
              p: 3,
              rl: 8,
              familyCare: "parent",
              familyCarePlan: "shared",
              familyCareTreatmentSupport: 0,
              careInclination: 5
            }
          ],
          [
            1,
            "きょうだいも自分の仕事や所帯で手一杯らしく、決まった日の付き添いは難しいと断られた。結局、自分が動ける日に実家へ通うしかなかった。",
            {
              p: -2,
              rl: 1,
              familyCare: "parent",
              familyCarePlan: "direct",
              familyCareTreatmentSupport: 0,
              careInclination: 3
            }
          ]
        ),
        $terraData.K(
          "親戚にも頭を下げ、できる範囲で手を借りる",
          {},
          [
            0.65,
            "近くの親戚が顔出しを、もう一人が重い物の買い出しを手伝ってくれることになった。それぞれの都合を擦り合わせ、みんなで少しずつ親を見守る態勢ができた。",
            {
              p: -2,
              rl: 3,
              familyCare: "parent",
              familyCarePlan: "network",
              familyCareTreatmentSupport: 0,
              careInclination: 2
            }
          ],
          [
            1,
            "どの親戚も余裕がなく、代わりに動いてくれる人は見つからなかった。無理のない日だけ自分が顔を出し、どうしても手が回らない時はまた相談することにした。",
            {
              p: -4,
              rl: 1,
              familyCare: "parent",
              familyCarePlan: "direct",
              familyCareTreatmentSupport: 0,
              careInclination: 1
            }
          ]
        )
      ]
    },
    {
      id: "fam_care_followup",
      conf: "S",
      references: [
        "SRC_TERRA_FAMILY",
        "SRC_TERRA_LIFECOURSE",
        "SRC_ORIPATHY_SOCIAL",
        "SRC_MOBILE_CITY_MOBILITY"
      ],
      need: ["親族ケアの再相談が必要"],
      st: ["青年", "壮年", "老年"],
      ge: { age: 35 },
      w: 1.1,
      t: "親の世話を始めてから二年が過ぎた。{parentName}の通院や身の回りの手伝いはまだ終わらず、こちらの体や暮らしの予定にも疲れが溜まってきている。この先、誰がどこまで背負うかを改めて話し合った。{parentTreatmentNote}",
      c: [
        $terraData.K(
          "これからも自分が中心になり、療養費も背負う",
          {
            en: { ge: { h: 25 } },
            why: "二年間、付き添いや日々の用事を主に担う体調の目安に届いていない。きょうだいや親族へ頼る選択は残る",
            pw: [1, { when: "家族ケアへの関与経験が多い", x: 1.35 }]
          },
          [
            1,
            "{parentCareWorkAction}、病院の送り迎えと買い出しを続けた。{parentCareCostAction}もう二年間、自分の暮らしを詰めながら親のそばに立つ腹を決めた。",
            {
              p: 3,
              rl: 5,
              h: -2,
              familyCare: "parent",
              familyCarePlan: "direct",
              familyCareTreatmentSupport: 1,
              familyCareReview: 1,
              careInclination: 6
            }
          ]
        ),
        $terraData.K(
          "{careSiblingName}に、手伝いと療養費の分担を頼む",
          {
            show: { need: ["家計の余力を最近確認した別居きょうだいがいる", "親が感染症の治療中"] },
            pw: [1, { when: "家族ケアへの関与経験が多い", x: 1.3 }]
          },
          [
            0.7,
            "{careSiblingName}は懐具合を確かめたうえで、通院の手伝いだけでなく薬代の一部も出すと引き受けてくれた。肩の荷が半分になり、思わず深い息が出た。",
            {
              p: 3,
              rl: 6,
              familyCare: "parent",
              familyCarePlan: "shared",
              familyCareTreatmentSupport: 1,
              familyCareSiblingContribution: 1,
              familyCareReview: 1,
              careInclination: 5
            }
          ],
          [
            1,
            "{careSiblingName}も台所事情が苦しく、お金までは出せないと頭を下げられた。仕方なく自分が付き添いを続け、家計から捻出できるギリギリの額を工面した。",
            {
              p: -2,
              rl: 1,
              familyCare: "parent",
              familyCarePlan: "direct",
              familyCareTreatmentSupport: 1,
              familyCareReview: 1,
              careInclination: 4
            }
          ]
        ),
        $terraData.K("親族や近所に頭を下げ、お金の負担は抱え込まない", {}, [
          1,
          "親族や近所の顔なじみに、買い出しや声かけを手伝ってもらえないか頼んで回った。療養費まではこちらの財布から出せないと正直に打ち明け、できる範囲で支えることにした。",
          {
            p: -1,
            rl: 3,
            familyCare: "parent",
            familyCarePlan: "network",
            familyCareTreatmentSupport: 0,
            familyCareReview: 1,
            careInclination: 1
          }
        ]),
        $terraData.K("これ以上は抱えきれないと手を引く", {}, [
          1,
          "自分の暮らしまで共倒れになってしまうと伝え、手助けから退いた。次の診察日に誰が親を連れて行くのか、誰も言い出せないまま重い沈黙が残った。",
          { p: -3, rl: -3, familyCareReview: 1 }
        ])
      ]
    },
    {
      id: "fam_care_capacity_review",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE", "SRC_ORIPATHY_SOCIAL"],
      need: ["親族ケアの負担見直しが必要"],
      st: ["青年", "壮年", "老年"],
      ge: { age: 35 },
      w: 1.2,
      cd: 1,
      t: "{parentName}の介護を続けるうちに、あなた自身の体が悲鳴を上げた。病院の付き添いや重い荷物の買い出しに出るだけで息が切れ、このままでは自分が先に倒れてしまいそうだった。",
      c: [
        $terraData.K("休める日に体を休めながら、自分で付き添いを続ける", {}, [
          1,
          "合間に横になって息を整えながら、なんとか親の付き添いを続けた。来年も同じように動けるか、不安を抱えたまま日々をつないだ。",
          { h: -2, p: 1, familyCareCapacityPlan: "direct" }
        ]),
        $terraData.K("親族や近所に頼み、用事を代わってもらう", {}, [
          0.7,
          "体調を正直に打ち明け、親族や近所の人に買い出しや付き添いを何日か代わってもらった。少しだけ自分の布団でゆっくり眠れる日が戻った。",
          { p: 1, rl: 2, familyCareCapacityPlan: "network" }
        ], [
          1,
          "頼んでみたものの、みんな自分の暮らしで手一杯だった。痛む体をさすりながら、できる範囲で親の元へ通い続けた。",
          { p: -1, familyCareCapacityPlan: "direct" }
        ]),
        $terraData.K("直接の付き添いから退き、家族に別の手立てを頼む", {}, [
          1,
          "「もう体が持たない」と家族に打ち明け、直接の付き添いから外れてもらった。後ろめたさは残ったが、まずは自分の体を治すことに専念した。",
          { p: -2, familyCareCapacityPlan: "end" }
        ])
      ]
    },
    {
      id: "fam_child_inf",
      conf: "S",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_FAMILY"],
      st: ["青年", "壮年", "老年"],
      need: ["扶養中の子"],
      ban: ["扶養中の感染者"],
      once: true,
      w: 0.4,
      t: "診察室で、{kid}が鉱石病にかかっていると告げられた。熱が引いたあとの細い腕に、小さな黒い結晶が浮いている。帰り道、子どもの手を握りしめながら、これからの薬代と世間の目をどうしのぐか必死に考えた。",
      c: [
        $terraData.K(
          "家族で通院と暮らしを支える（初回費用 {childInfectionInitialSupportCost}）",
          {
            en: s =>
              $rules.economy.availableFunds(s) >=
              $rules.family.childInfectionInitialSupportCost(s) + $rules.economy.annualReserve(s),
            why: "初回の受診・移動費と生活予備費を両方残せない"
          },
          [
            0.8,
            "初回の受診費と足代を払い、家族みんなで{kid}を守る約束をした。外で誰にどこまで話すか口裏を合わせ、まずは家で温かい食事を食べさせた。",
            {
              p: 5,
              rl: 10,
              cash: s => -$rules.family.childInfectionInitialSupportCost(s),
              kidInf: 1,
              kidTx: 0,
              kidCareSupport: 1,
              fl: { family_infection_support: 1 },
              infectionAwarenessActions: [
                { subject: "child", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "child", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" },
                { subject: "child", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" }
              ]
            }
          ],
          [
            1,
            "頼れるあてはどこにもなく、初回の診察代と交通費だけで財布がすっかり軽くなった。次の薬代をどうやって工面するか、眠る子どもの横で頭を抱えた。",
            {
              p: -10,
              rl: -8,
              cash: s => -$rules.family.childInfectionInitialSupportCost(s),
              kidInf: 1,
              kidTx: 0,
              kidCareSupport: 1,
              fl: { family_infection_support: 1 },
              infectionAwarenessActions: [
                { subject: "child", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "child", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" },
                { subject: "child", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" }
              ]
            }
          ]
        ),
        $terraData.K(
          "専門の診療を始める（初回費用 {childInfectionSpecialistStartCost}、以後の年額目安 {childCareAnnualCost}）",
          {
            en: s =>
              $rules.economy.availableFunds(s) >=
              $rules.family.childInfectionSpecialistStartCost(s) + $rules.economy.annualReserve(s),
            why: "初回の専門診療費と生活予備費を両方残せない"
          },
          [
            0.8,
            "{kid}を専門の医師に診せ、初回費用{childInfectionSpecialistStartCost}を支払った。これから毎年{childCareAnnualCost}ほどの薬代がかかるが、処置を受けて痛みが和らいだ子どもの寝顔を見て胸をなで下ろした。",
            {
              cash: s => -$rules.family.childInfectionSpecialistStartCost(s),
              p: 3,
              rl: 3,
              kidInf: 1,
              kidTx: 1,
              fl: { family_infection_support: 1 },
              infectionAwarenessActions: [
                { subject: "child", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "child", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" },
                { subject: "child", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" }
              ]
            }
          ],
          [
            1,
            "初回費用{childInfectionSpecialistStartCost}を払って専門の治療を始めたものの、子どもの熱やだるさはなかなか引かなかった。薬が合うまでどう乗り切るか、医師と相談を重ねた。",
            {
              cash: s => -$rules.family.childInfectionSpecialistStartCost(s),
              p: -5,
              rl: -2,
              kidInf: 1,
              kidTx: 1,
              fl: { family_infection_support: 1 },
              infectionAwarenessActions: [
                { subject: "child", audience: "subject", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" },
                { subject: "child", audience: "household", certainty: "confirmed", source: "family-disclosure", consent: "unclear", recipientRef: "current-household" },
                { subject: "child", audience: "medical-service", certainty: "confirmed", source: "medical-consultation", consent: "unclear", recipientRef: "current-clinic" }
              ]
            }
          ]
        ),
        $terraData.K("すぐには治療費を出せず、親族の助けを探す", {}, [
          1,
          "まとまった診察代をすぐには用意できず、まずは親族に少しでも手を借りられないか相談した。次の給金が入る日まで、子どもの腕の結晶が広がらないことを祈った。",
          {
            p: -2,
            rl: 2,
            kidInf: 1,
            kidTx: 0,
            kidCareSupport: 0,
            fl: { family_infection_support: 1 },
            infectionAwarenessAction: {
              subject: "child",
              audience: "subject",
              certainty: "confirmed",
              source: "medical-consultation",
              consent: "unclear",
              recipientRef: "current-clinic"
            },
            infectionAwarenessActions: [
              {
                subject: "child",
                audience: "household",
                certainty: "confirmed",
                source: "family-disclosure",
                consent: "unclear",
                recipientRef: "current-household"
              }
            ]
          }
        ])
      ]
    },
    {
      id: "fam_child_care",
      conf: "S",
      st: ["青年", "壮年", "老年"],
      need: ["扶養中の感染者"],
      show: s =>
        [s.sn?.fam_child_inf, s.sn?.family_child_exposure_followup].some(
          year => Number.isFinite(year) && s.year - year >= 1
        ),
      w: 0.6,
      cd: 5,
      t: "診療所からの帰り道、{infectedKid}の薬袋を提げて歩いた。子どもの体を守るための出費と、家の毎月の暮らし向きをどう両立させるか、いつも頭から離れない。",
      c: [
        $terraData.K(
          "今の専門診療を続ける（年額目安 {childCareAnnualCost}）",
          { show: { need: ["対象の子が治療中"] } },
          [
            1,
            "新しい薬を受け取り、{infectedKid}の手を引いて帰った。治療を切らさないよう、大人の買い物をまたひとつ我慢することにした。",
            { kidTx: 1, p: -1 }
          ]
        ),
        $terraData.K(
          "専門診療を再開する（初回費用 {childInfectionTreatmentRestartCost}）",
          {
            show: { ban: ["対象の子が治療中"] },
            en: s =>
              $rules.economy.availableFunds(s) >=
              $rules.family.childInfectionTreatmentRestartCost(s) + $rules.economy.annualReserve(s),
            why: "再開費用と生活予備費を両方残せない"
          },
          [
            1,
            "ようやく工面した費用を払い、{infectedKid}をもう一度専門の診察室へ連れて行った。久しぶりの薬を受け取り、ほっと息をついた。",
            {
              cash: s => -$rules.family.childInfectionTreatmentRestartCost(s),
              kidTx: 1,
              p: 1,
              fl: { family_infection_support: 1 }
            }
          ]
        ),
        $terraData.K(
          "専門診療をいったん休み、家庭での手当に切り替える（年額目安 {childBasicCareAnnualCost}）",
          { show: { need: ["対象の子が治療中"] } },
          [
            1,
            "医師に台所事情を打ち明け、高価な専門治療をしばらく休むことにした。家でできる保温や手当の仕方を教わり、またお金が貯まったら戻ってこようと心に決めた。",
            { kidTx: 0, p: -2 }
          ]
        ),
        $terraData.K(
          "地域の支援窓口へ相談し、家庭で見守る（初回交通費のほか年額目安 {childBasicCareAnnualCost}）",
          {
            show: { ban: ["対象の子が治療中"] },
            en: s =>
              $rules.economy.availableFunds(s) >=
              $rules.family.childInfectionConsultTravelCost(s) + $rules.economy.annualReserve(s),
            why: "相談窓口までの交通費と生活予備費を両方残せない"
          },
          [
            1,
            "足代を払って地域の相談所を訪ね、家で子どもの体調を見守るコツを教わった。毎晩寝る前に熱や結晶の様子を確かめ、家族で支え合うことにした。",
            {
              kidTx: 0,
              kidCareSupport: 1,
              cash: s => -$rules.family.childInfectionConsultTravelCost(s),
              rl: 3,
              p: -2,
              fl: { family_infection_support: 1 }
            }
          ]
        ),
        $terraData.K(
          "今は受診を見送り、次の収入を待つ",
          { show: { ban: ["対象の子が治療中"] } },
          [
            1,
            "今は病院へ連れて行く余裕がなく、家で安静にさせるしかなかった。次の給金が入ったら一番に診せに行こうと家族で話し合った。",
            { kidTx: 0, p: -1, rl: 1, fl: { family_infection_support: 1 } }
          ]
        )
      ]
    }
  );
});
