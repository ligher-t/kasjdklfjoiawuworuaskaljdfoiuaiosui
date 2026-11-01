// extensions/education-and-later-life/relationships-events-02: construction fragment; evaluation order is declared by data/extensions/education-and-later-life.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/education-and-later-life",
  "extensions/education-and-later-life/relationships-events-02"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  return [
    {
      id: "family_care_network_member_move_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS", "SRC_MOBILE_CITY_MOBILITY"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["養育者個人の転居を知る"],
      cd: 1,
      w: 0.65,
      t: "昔世話になった{careMemberName}から手紙が届いた。住み慣れた{careMemberMoveFrom}を離れ、{careMemberMoveTo}で新しい暮らしを始めたという。知らせは{careMemberMoveChannel}を通じて届いた。向こうでの暮らしぶりをどこまで尋ねるか、ペンを持って考えた。",
      c: [
        $terraData.K("引っ越した訳や新しい街での暮らしぶりを尋ねる", {}, [
          1,
          "{careMemberName}へ、なぜ移ることになったのかや向こうでの暮らしを気遣う手紙を書き、昔面倒を見てくれたお礼を改めて伝えた。",
          { careNetworkMemberMoveNotice: 1, rl: 3, p: 1 }
        ]),
        $terraData.K("新しい宛先だけ書き留め、自分の元気な様子だけ伝える", {}, [
          1,
          "{careMemberName}が{careMemberMoveTo}へ移ったことだけ心に留め、立ち入った事情は聞かずにこちらの元気な様子だけ書いて返した。",
          { careNetworkMemberMoveNotice: 1, rl: 1 }
        ]),
        $terraData.K("手紙を受け取ったお礼だけ返し、ほどよい距離を保つ", {}, [
          1,
          "知らせてくれたお礼だけを短く書き送り、自分の近況やこれからの約束には触れずにおいた。",
          { careNetworkMemberMoveNotice: 1 }
        ])
      ]
    },
    {
      id: "family_care_network_member_death_notice",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE", "SRC_TERRA_INFO_NETWORKS"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["養育者個人の訃報を知る"],
      cd: 1,
      w: 1,
      t: "昔世話になった{careMemberName}が{careMemberDeathYear}年に亡くなったと、{careMemberDeathChannel}知らされた。死因は{careMemberDeathCause}だったという。幼い頃に頭を撫でられた手の感触や、最後に別れた時の横顔がふいに蘇った。",
      c: [
        $terraData.K("同じように世話になった人たちと、生前の思い出を語り合う", {}, [
          1,
          "{careMemberName}をよく知る人へ手紙を書き、幼い頃にしてもらった忘れられない出来事を綴った。文面を書きながら、懐かしい声まで耳の奥に蘇った。",
          { careNetworkMemberDeathNotice: 1, rl: 2, p: -1 }
        ]),
        $terraData.K("どんな最期だったのか尋ね、その人柄を胸に刻む", {}, [
          1,
          "知らせを届けてくれた人に、{careMemberName}の最期の様子や見送りのことを詳しく尋ねた。聞いた話を噛みしめながら、あの日交わした言葉を静かに思い返した。",
          { careNetworkMemberDeathNotice: 1, k: 1, p: 0 }
        ]),
        $terraData.K("短く悔やみの言葉を返し、ひとりで静かに悼む", {}, [
          1,
          "知らせてくれたお礼と短い弔意だけを返した。{careMemberName}との思い出は誰にも話さず、自分の胸の奥にそっとしまっておいた。",
          { careNetworkMemberDeathNotice: 1, p: -1 }
        ])
      ]
    },
    {
      id: "family_care_network_member_missing_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS", "SRC_REGIONAL_ENVIRONMENT"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["養育者個人の消息不明を知る"],
      cd: 1,
      w: 1,
      t: "昔世話になった{careMemberName}が{careMemberMissingYear}年、{careMemberMissingRegion}で戦乱に巻き込まれたきり行方が知れなくなったという。{careMemberMissingChannel}届いた知らせには、生きているのかどうかも分からないとあった。",
      c: [
        $terraData.K("伝手をたどって、避難先の手がかりだけでも探してみる", {}, [
          1,
          "親族やその土地を知る人を訪ね歩き、逃げ延びた先の手がかりを探した。足代と通信費を使ったが、やはりどこにいるかは掴めなかった。",
          { careNetworkMemberMissingNotice: 1, careNetworkSearch: 1, cash: -10000, rl: 1, p: -1 }
        ]),
        $terraData.K("無事を祈りながら、いつか風の便りが届くのを待つ", {}, [
          1,
          "遠く離れた場所からでは確かめる術もなかった。どこかで生き延びてくれていることを祈りながら、手紙が届くのを待つことにした。",
          { careNetworkMemberMissingNotice: 1, p: -1 }
        ]),
        $terraData.K("どうにもならない現実を受け止め、目の前の暮らしに戻る", {}, [
          1,
          "むやみに探し回るのはやめ、自分の今日の一日を生きることにした。ただ、いつでも手紙を受け取れるよう今の住まいは変えずにいた。",
          { careNetworkMemberMissingNotice: 1, p: 1 }
        ])
      ]
    },
    {
      id: "family_care_network_member_found_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      need: ["消息不明だった養育者の安否を知る"],
      cd: 1,
      w: 1,
      t: "行方が分からなくなっていた{careMemberName}が、{careMemberFoundYear}年にどこかで生きていると{careMemberFoundChannel}知らされた。ただ、今の居場所や手紙の送り先までは分からないという。",
      c: [
        $terraData.K("無事を喜び、どうにか伝言を託せないか尋ねる", {}, [
          1,
          "知らせを運んできてくれた人に、もしまた繋がることがあればこちらが探していると伝えてほしいと頼み込んだ。",
          { careNetworkMemberFoundNotice: 1, rl: 3, p: 1 }
        ]),
        $terraData.K("焦らず、本人から手紙を出せる日が来るのを待つ", {}, [
          1,
          "無理に居場所を詮索するのはやめ、{careMemberName}が落ち着いて手紙をくれる日を気長に待つことにした。",
          { careNetworkMemberFoundNotice: 1, rl: 1 }
        ]),
        $terraData.K("生きていると分かっただけで十分だと胸をなで下ろす", {}, [
          1,
          "生きていてくれただけで本当によかったと、伝言を運んでくれた人に深く頭を下げた。",
          { careNetworkMemberFoundNotice: 1, p: 1 }
        ])
      ]
    },
    {
      id: "family_care_network_reconnect",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      st: ["青年", "壮年", "老年"],
      need: ["養育ネットワークから再接触の知らせ"],
      cd: 1,
      w: 0.3,
      t: "久しく便りが途絶えていた{careNetwork}の人たちから、ふいに短い手紙が届いた。また昔のように文通を始めるか、受け取ったお礼だけ返すか迷った。",
      c: [
        $terraData.K("懐かしさに筆を執り、少しずつやり取りを再開する", {}, [
          1,
          "手紙の返事に今の自分の暮らしぶりを書き、昔世話になったお礼を改めて伝えた。また季節が変わる頃に便りを出すと添えた。",
          { careNetworkContact: "reopen", rl: 2, p: 1 }
        ]),
        $terraData.K("元気でいることだけ伝え、深入りはしない", {}, [
          1,
          "手紙のお礼と無事だけを短く返し、今はお互いの暮らしを優先しようとやんわり伝えた。",
          { careNetworkContact: "decline", p: 0 }
        ]),
        $terraData.K("返事は書かず、昔の縁はそっと閉じたままにする", {}, [
          1,
          "手紙には目を通したが、返事は書かなかった。封筒を古い小箱の底にしまい、今の生活へ戻った。",
          { careNetworkContact: "decline", p: -1 }
        ])
      ]
    },
    {
      id: "family_sibling_independence",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      st: ["少年", "青年", "壮年"],
      need: ["存命のきょうだいがいる"],
      ge: { age: 16 },
      cd: 5,
      w: 0.38,
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      t: [
        {
          when: s => !!s.fl?.household_separated || (s.residenceArrangement && !s.residenceArrangement.startsWith("family_home_")),
          t: "よその地区へ出て働き口を探すか、このまま実家に残るか。実家にいる{sibling}から、先に独立して暮らすあなたへ相談が持ちかけられた。向こうでの稼ぎや部屋代、残る親の世話のことまで話は広がったが、本人もまだ決めきれないでいる。"
        },
        {
          t: "よその地区へ出て働き口を探すか、このまま家に残るか。{sibling}が食卓で家族に相談を持ちかけた。向こうでの稼ぎや部屋代、家に残る親の世話のことまで話は広がったが、本人もまだ決めきれないでいる。"
        }
      ],
      c: [
        $terraData.K(
          "外へ出て挑戦したいなら、支度金を出すと背中を押す",
          {
            en: { affordableCashAfterReserve: 4e4 },
            why: "引っ越しと当面の生活費4万龍門幣を出すと、家の暮らしが回らなくなる"
          },
          [
            0.7,
            "家族から4万龍門幣の支度金を受け取った{sibling}は、荷物をまとめて別の地区へ旅立っていった。新しい土地で無事にやっていけるよう皆で見送った。",
            {
              sibIndependent: 1,
              sibIndependenceReason: "本人の希望に沿い、家族の支援を受けて転居",
              cash: -4e4,
              pm: 1,
              rl: 3
            }
          ],
          [
            1,
            "支度金を出すと申し出たが、{sibling}は「もう少し向こうの仕事と部屋をちゃんと調べてからにする」と慎重だった。お金は懐に戻し、本人の気持ちが固まるのを待つことにした。",
            { sibIndependenceDiscussed: 1, rl: 1 }
          ]
        ),
        $terraData.K("焦って決めず、向こうの働き口や家賃をもう少し調べる", {}, [
          1,
          "ツテを頼ってよその家賃や求人を探ってみたが、今すぐ飛び出すほどの当てはなかった。{sibling}は荷物をほどき、しばらく近場の仕事も探してみることにした。",
          { sibIndependenceDiscussed: 1, rl: 2, p: 1 }
        ]),
        $terraData.K(
          "無理に家を出ていかず、ここで一緒に暮らす道を話し合う",
          {},
          [
            0.7,
            "{sibling}はしばらくこの家に残ることに決めた。お互い気持ちよく暮らせるよう、家の仕事や生活費の出し方をみんなで話し合った。",
            { sibIndependenceDiscussed: 1, rl: 1, p: 1 }
          ],
          [
            1,
            "{sibling}はやはり外へ出て働きたい気持ちが消えないらしく、引っ越し代を貯めながら次の機会を待つと言った。",
            { sibIndependenceDiscussed: 1, rl: 1, p: 1 }
          ]
        )
      ]
    },
    {
      id: "family_sibling_parent_support_news",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      need: ["対象きょうだいの親世帯支援知らせ"],
      cd: 1,
      w: 0.9,
      t: "{sibling}から、親への仕送りを{siblingParentSupportStatus}と手紙が来た。これまで年に{siblingParentSupportAmount}ほど送っていたという。向こうの暮らしがどれほど苦しくなっているのか、どう返事を書くか考えた。",
      c: [
        $terraData.K("向こうの暮らしぶりを気遣い、無理をしていないか尋ねる", {}, [
          1,
          "自分の生活を削りすぎていないか心配だと手紙を書き、親のことは一人で抱え込まないよう伝えた。",
          { sibContact: "regular", sibParentSupportNotice: 1, rl: 3, p: 1 }
        ]),
        $terraData.K("お金のことは細かく聞かず、困った時はいつでも言ってくれと返す", {}, [
          1,
          "いくら送っているかなどの立ち入った話は避け、本当に苦しい時は遠慮なく頼ってほしいと返事を出した。",
          { sibParentSupportNotice: 1, rl: 1, p: 1 }
        ]),
        $terraData.K(
          "ほかのきょうだいにも手紙を回し、親の支え方を相談する",
          { show: { need: ["ほかの存命きょうだいがいる", "親世帯の家計を追跡中"] } },
          [
            0.65,
            "ほかのきょうだいにも親の暮らしぶりを知らせ、みんなで少しずつ支えられないか手紙を送った。",
            { sibContact: "regular", sibParentSupportNotice: 1, sibParentSupportConference: 1, rl: 2, p: 1 }
          ],
          [
            1,
            "ほかのきょうだいにも手紙を出してみたが、それぞれの暮らしで手いっぱいなのか返事はなかった。今度直接、親に何が要るか聞くことにした。",
            { sibContact: "regular", sibParentSupportNotice: 1, rl: 1 }
          ]
        )
      ]
    },
    {
      id: "family_sibling_parent_support_conference",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE", "SRC_TERRA_INFO_NETWORKS"],
      st: ["青年", "壮年", "老年"],
      need: ["きょうだいの親世帯支援相談時期"],
      cd: 2,
      w: 1,
      t: s => {
        const year=s.siblingParentSupportConference?.requestedYear,
          elapsed=Number.isInteger(year) && year<=s.year ? s.year-year : null;
        return (elapsed===null ? "きょうだいたちへ親の暮らしについて手紙を出した。" :
          elapsed===0 ? "今年、きょうだいたちへ親の支え方について手紙を出した。" :
          `きょうだいたちへ親の支え方を相談してから${elapsed}年が経った。`)+
          "まとまった金を送るか、買い出しや雑用を手伝いに行くか、それともまず親の口から何が要るか聞くか考えた。";
      },
      c: [
        $terraData.K(
          "親のもとへ、当面の足しとして{parentHouseholdGiftAmount}を送る",
          {
            en: { affordableParentHouseholdCash: 25000 },
            why: "親へ送る一時金と、自分の当面の生活費を同時に用意できない"
          },
          [
            1,
            "親のもとへ{parentHouseholdGiftAmount}を送った。必要な薬や食べ物に使ってほしいと手紙を添えた。",
            { parentHouseholdGift: 25000, sibParentSupportOutcome: "一時送金", rl: 3, p: 1 }
          ]
        ),
        $terraData.K("お金は出せない分、買い出しや力仕事を手伝いに行くと伝える", {}, [
          1,
          "まとまったお金は送れないが、休みの日に買い出しや家の手入れを手伝いに行くと親へ手紙を出した。",
          { sibParentSupportOutcome: "手伝いを申し出た", rl: 3, p: 1 }
        ]),
        $terraData.K("まずは親に直接連絡し、今いちばん困っていることを聞く", {}, [
          1,
          "勝手にお金を送る前に、今いちばん何に困っているか親へ直接尋ねた。返事を聞いてから自分にできることを考えることにした。",
          { sibParentSupportOutcome: "親へ個別に確認", rl: 1, p: 1 }
        ])
      ]
    },
    {
      id: "family_sibling_contact",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      need: ["別居きょうだいと連絡を取る時期"],
      cd: 1,
      w: 0.32,
      t: [
        {
          when: { need: ["対象きょうだいの体調に注意", "対象きょうだいの家計を案じる知らせ"] },
          t: "{sibling}から届いた手紙には、体の痛みと疲れが抜けないまま働き、それでも家賃と食費に追われた日々が滲むような字で綴られていた。医者にかかる金も惜しんでいるらしく、どう返事を書くか胸が痛んだ。"
        },
        {
          when: "対象きょうだいの家計を案じる知らせ",
          t: "いくら働いても家賃と食費で消えてしまうと、前に{sibling}がこぼしていたのを思い出した。今は少しは息をつけているのか気にかかった。"
        },
        {
          when: "対象きょうだいの体調に注意",
          t: "{sibling}からの手紙はいつもより短かった。体の痛みやだるさが抜けないのに、診療所へ行く車代すらためらっているという。何か手を貸せないか考えた。"
        },
        {
          when: "対象きょうだいに家族の変化あり",
          t: "{siblings}の家で暮らしの変化があったと手紙が届いた。{siblingFamilyNews}新しい暮らしで困っていることはないか、便箋を広げた。"
        },
        {
          when: "対象きょうだいとの連絡終了",
          t: "手紙のやり取りを絶った{sibling}へ、療養費の仕送りだけは続けていた。礼の便りも来ないまま、財布の中身を見つめてこれからも送り続けるか考えた。"
        },
        {
          when: "対象の別居きょうだいに転居知らせあり",
          t: "{siblings}から、{siblingRegion}へ引っ越して{siblingWork}を始めたと知らせが届いた。見知らぬ土地でうまくやっているのか、手紙を書こうと思った。"
        },
        {
          when: "対象の別居きょうだいに仕事変更あり",
          t: "{siblings}から、前の仕事を辞めて{siblingWork}に就いたと手紙が来た。新しい職場の水は合うのか、次の便りで聞いてみようと思った。"
        },
        {
          when: "別居きょうだいとの連絡休止中",
          t: "しばらく連絡が途絶えていた{siblings}から、久しぶりに短い手紙が届いた。懐かしさと少しの戸惑いの中で、どんな返事を書くか考えた。"
        },
        {
          t: "離れて暮らす{siblings}が今どうしているか、ふと気にかかった。手紙を出すか、休みを取って顔を見に行くか考えた。"
        }
      ],
      c: [
        $terraData.K(
          "手紙や通話を続け、お互いの近況を伝え合う",
          {
            show: { ban: ["対象きょうだいとの連絡終了"] },
            en: { affordableCash: 5000 },
            why: "手紙や通話の費用を今の懐具合では出せない"
          },
          [
            1,
            "通信費を払い、{siblings}へ最近の暮らしぶりを綴った手紙を送った。",
            { sibContact: "regular", cash: -5000, pm: 1, rl: 2, p: 1 }
          ]
        ),
        $terraData.K(
          "休みを取って、{siblingVisitFare}で会いに行く",
          {
            show: s =>
              !!$rules.family.siblingVisitRoute(s) &&
              s.siblings?.find(person => person.id === s.eventRelativeId)?.contactState !== "ended",
            en: s => $rules.family.siblingVisitAffordable(s),
            why: "向こうへ行く足がないか、旅費を出すと自分の生活が立ち行かなくなる"
          },
          [
            1,
            "旅費{siblingVisitFare}を払って{siblings}の暮らす{siblingRegion}を訪ね、久しぶりに顔を見て仕事や暮らしの話を聞いた。帰りの乗り物を待つ間、一緒に育った頃の記憶が胸をよぎった。",
            { sibContact: "visit", sibVisit: 1, rl: 4, p: 2 }
          ]
        ),
        $terraData.K(
          "まとまった金を一度送り、急場をしのいでもらう",
          {
            show: { ban: ["対象きょうだいとの連絡終了"] },
            en: { affordableCash: 1e5 },
            why: "10万龍門幣相当の仕送りを出すと、自分の生活費が足りなくなる"
          },
          [
            1,
            "{siblings}へ10万龍門幣相当を送り、当面の暮らしの足しにしてくれと手紙を添えた。",
            { sibContact: "aid", cash: -1e5, pm: 1, rl: 3, p: 1 }
          ]
        ),
        $terraData.K(
          "医者へ行くための足代を一度だけ送る（{siblingHealthAidAmount}）",
          {
            show: { need: ["対象きょうだいの体調に注意"], ban: ["対象きょうだいとの連絡終了"] },
            en: { affordableCash: 50000 },
            why: "交通費を送ると自分の生活費が足りなくなる"
          },
          [
            1,
            "診療所へ行く足代にと{siblingHealthAidAmount}相当を送り、我慢せず医者に診てもらうよう手紙に書き添えた。",
            { sibHealthAid: 1, sibContact: "regular", cash: -5e4, pm: 1, p: 1, rl: 2 }
          ]
        ),
        $terraData.K(
          "今は返事を急かさず、向こうから連絡が来るのを待つ",
          { show: { ban: ["対象きょうだいとの連絡終了"] } },
          [
            1,
            "気が向いた時にまた手紙をくれればいいと伝え、こちらからはしばらく連絡を控えることにした。",
            { sibContact: "pause", p: -1 }
          ]
        ),
        $terraData.K(
          "毎年の薬代・療養費を仕送りする（年額{siblingCareSupportAmount}）",
          {
            show: {
              need: ["対象の感染した別居きょうだい"],
              ban: ["対象の別居きょうだい療養費支援中", "対象きょうだいとの連絡終了"]
            },
            en: { affordableSiblingCareSupport: true },
            why: "毎年の療養費を送ると、自分の生活費が立ち行かなくなる"
          },
          [
            1,
            "年に{siblingCareSupportAmount}ずつ治療費を送ると{siblings}に伝え、最初の仕送りを済ませた。少しでも安心して医者にかかれるよう祈った。",
            { sibCareSupport: "start", sibContact: "regular", rl: 3, p: 1 }
          ]
        ),
        $terraData.K("毎年の療養費の仕送りをここで終える", { show: { need: ["対象の別居きょうだい療養費支援中"] } }, [
          1,
          "これ以上は毎年送り続けられないと{siblings}に詫び、定期的な仕送りを終えた。",
          { sibCareSupport: "stop", rl: 1 }
        ]),
        $terraData.K("これきり自分からは手紙を出さないと決める", { show: { ban: ["対象きょうだいとの連絡終了"] } }, [
          1,
          "やり取りを重ねるたびに互いの古傷がうずいた。もうこちらからは便りを出さないと書き送り、引き出しの奥に手紙の束をしまった。",
          { sibContact: "end", p: -3, rl: -2 }
        ])
      ]
    },
    {
      id: "family_sibling_reconnect",
      conf: "S",
      references: ["SRC_TERRA_FAMILY"],
      st: ["青年", "壮年", "老年"],
      need: ["対象きょうだいから再接触の便り"],
      cd: 1,
      w: 0.28,
      t: "長く音信不通になっていた{sibling}から、短い手紙が届いた。不器用に近況をひとつふたつ綴っただけの文面を見つめながら、どんな言葉を返せるか考えた。",
      c: [
        $terraData.K("返事を書き、少しずつまた手紙を交わす", {}, [
          1,
          "短い返事を書いてこちらの近況をひとつ添え、また手紙を待つことにした。",
          { sibContact: "reopen", rl: 2, p: 1 }
        ]),
        $terraData.K("無事を知ったとだけ短く返し、急には距離を詰めない", {}, [
          1,
          "手紙を受け取ったことだけ短く返し、しばらくは様子を見ることにした。",
          { sibContact: "pause", rl: 1, p: 0 }
        ]),
        $terraData.K("返事は書かず、今の距離をそのまま保つ", {}, [
          1,
          "手紙は最後まで読んだが、どうしてもペンを取る気になれず、静かに引き出しへしまった。",
          { sibContact: "decline", p: -1 }
        ])
      ]
    }
  ];
});
