// extensions/social-and-care/local-support-referrals: construction fragment; evaluation order is declared by data/extensions/social-and-care.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/local-support-referrals"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $terraData.EV.push({
    id: "life_chernobog_worksite_errand",
    conf: "S",
    references: ["SRC_TL_EARLY", "SRC_COMMUNITY_TERRA_TIMELINE", "SRC_CHERNOB_WORKSITE_MODEL"],
    st: ["青年", "壮年"],
    need: ["国:ウルサス", "都市:チェルノボーグ"],
    show: s => !!s.world?.events?.sarcophagus_discovery,
    ge: { year: 1070, age: 18 },
    le: { year: 1077 },
    once: true,
    w: 0.32,
    t: "鉱山へ続く道の脇に立ち入り禁止の柵が次々と組まれ、重い幌をかけた荷車がひっきりなしに行き交うようになった。行きつけの食堂の壁に、その柵の手前まで板材を運ぶ日雇い仕事の募集が貼り出されていた。",
    c: [
      $terraData.K("荷の中身と行き先を確かめ、一往復だけ荷車を引く", {}, [
        1,
        "柵の手前まで板材を運び届け、警備兵の冷たい視線を感じながら引き返した。夕暮れに受け取った日当で、久しぶりに温かい夕飯の具材を買って帰った。",
        { cash: 30000, cr: 1 }
      ]),
      $terraData.K("柵の向こうで何をやっているのか尋ね、気味が悪くて断る", {}, [
        1,
        "通行証が要るのかと監督に尋ねたが、歯切れの悪い返事しか返ってこなかった。妙な現場には関わらない方がいいと手を退き、いつもの道を通って帰った。",
        { p: 1 }
      ]),
      $terraData.K("怪しげな高給には目もくれず、近所の店の配達を手伝う", {}, [
        1,
        "鉱山道の仕事は見送り、顔なじみの商店で荷運びを手伝った。稼ぎはわずかだったが、気心の知れた店主に礼を言われて帰る道は気が楽だった。",
        { cash: 10000, rl: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_local_mutual_aid",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE", "SRC_TERRA_SOCIAL_ATTITUDES"],
    st: ["青年", "壮年", "老年"],
    need: ["存命の顔なじみの隣人", "所属なし"],
    once: true,
    w: 0.22,
    t: "路地の給水栓や共同ボイラーの世話が同じ人ばかりに押しつけられ、隣人たちの間で曜日ごとに当番を回そうという話が持ち上がった。道具置き場の鍵を預かり、全体の順番を見る世話役も要るという。",
    c: [
      $terraData.K("無理のない範囲で、水や暖房の当番を引き受ける", {}, [
        1,
        "仕事や家の用事とぶつからない日に、道具置き場とボイラーの火加減を見回る役を引き受けた。路地の暮らしをみんなで支え合う輪に加わった。",
        {
          lifeAffiliation: {
            id: "local-mutual-aid",
            title: "近隣の生活互助",
            kind: "community",
            action: "join",
            bindToLocality: true,
            role: "当番"
          },
          lifeGoal: {
            id: "neighborhood-mutual-aid",
            title: "近所の水や暖房を分け合う仕組みを支える",
            priority: "近隣の暮らし",
            action: "start",
            note: "水や暖房の当番と備品を分担する"
          },
          groupStanding: {
            id: "neighbors",
            title: "近隣の住民",
            delta: 4,
            reason: "共同の当番を引き受けた"
          },
          regionalImpact: {
            entity: "近隣の生活互助",
            kind: "shared-maintenance",
            description: "水や暖房の順番と備品を近隣で分担する仕組みに加わった"
          },
          rl: 2,
          p: 2
        }
      ]),
      $terraData.K("決まった当番には入らず、手が空いた時だけ手伝う", {}, [
        1,
        "毎週の約束はできないが、重い燃料運びなど人手が要る時は声をかけてくれと伝えた。",
        { rl: 1, p: 1 }
      ]),
      $terraData.K("自分の家のことで手一杯だと伝え、今回は断る", {}, [
        1,
        "今の暮らしで精一杯だと正直に断った。隣人たちに少し気まずい顔をされたが、自分の家の用事を優先した。",
        { p: -1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_local_mutual_aid_review",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["地域互助の担い手"],
    cd: 4,
    w: 0.28,
    show: s => {
      const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "local-mutual-aid");
      return affiliation?.status === "active" && $rules.affiliations.atRecordedLocality(s, "local-mutual-aid");
    },
    t: "共同ボイラーの燃料運びや水場の掃除が、いつの間にか真面目な数人ばかりに偏っていた。このままでは立ち行かなくなると、隣人たちを集めてこれからの回し方を話し合うことになった。",
    c: [
      $terraData.K("当番を続けつつ、サボっている世帯にも役目を割り振り直す", {}, [
        1,
        "顔をつき合わせて当番を組み直し、あなた一人に降りかかっていた雑用を分散させた。昼間働いている世帯には夜の見回りを頼むなど、無理なく続く形に改めた。",
        {
          lifeAffiliation: {
            id: "local-mutual-aid",
            title: "近隣の生活互助",
            action: "role",
            role: "当番調整"
          },
          groupStanding: {
            id: "neighbors",
            title: "近隣の住民",
            delta: 3,
            reason: "負担の偏りを話し合いに出した"
          },
          regionalImpact: {
            entity: "近隣の生活互助",
            kind: "shared-maintenance",
            description: "当番を分け直し、一人に偏っていた用事を減らした"
          },
          rl: 1
        }
      ]),
      $terraData.K("次の世話役を見つけ、道具置き場の鍵を引き継いで抜ける", {}, [
        1,
        "新しく越してきた若い住人にボイラーの扱い方を教え、使い込まれた道具置き場の鍵を手渡して肩の荷を下ろした。",
        {
          lifeAffiliation: {
            id: "local-mutual-aid",
            title: "近隣の生活互助",
            action: "leave",
            note: "近所の人へ当番を引継いだ"
          },
          lifeGoal: { id: "neighborhood-mutual-aid", action: "abandon", note: "当番を後任へ引き継ぎ、近隣の役目を終えた" },
          groupStanding: {
            id: "neighbors",
            title: "近隣の住民",
            delta: 1,
            reason: "当番を引き継いで離れた"
          },
          regionalImpact: {
            entity: "近隣の生活互助",
            kind: "succession",
            description: "本人が当番を離れ、後任へ備品管理を引き継いだ"
          },
          p: 1
        }
      ]),
      $terraData.K("疲れが溜まってしまい、しばらく当番を休ませてくれと頼む", {}, [
        1,
        "身体がしんどく家のことも回らないと打ち明け、しばらく当番から外れて息をつかせてもらうことにした。",
        {
          lifeAffiliation: {
            id: "local-mutual-aid",
            title: "近隣の生活互助",
            action: "suspend",
            note: "本人の休養と家の用事"
          },
          lifeGoal: { id: "neighborhood-mutual-aid", action: "pause", note: "家の用事を優先し、当番を一時休止した" },
          h: -1,
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_local_mutual_aid_pause_review",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE", "SRC_TERRA_SOCIAL_ATTITUDES"],
    st: ["青年", "壮年", "老年"],
    after: { id: "life_local_mutual_aid", min: 3 },
    cd: 3,
    w: 0.16,
    show: s => {
      const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "local-mutual-aid");
      return (
        affiliation?.status === "suspended" &&
        $rules.affiliations.atRecordedLocality(s, "local-mutual-aid") &&
        s.year - (affiliation.lastChangedYear ?? s.year) >= 3
      );
    },
    t: "路地の当番を休ませてもらってから数年が過ぎた。昔一緒に水場やボイラーの世話をしていた隣人から「また少しずつでも手を貸してもらえないか」と声をかけられ、引き出しの奥に残っていた合鍵を手に取った。",
    c: [
      $terraData.K("毎週は無理だが、手の空いた日だけ見回りに戻る", {}, [
        1,
        "決まった曜日は引き受けられないが、休みの日に道具の点検や掃除を手伝う形で再び輪に加わった。",
        {
          lifeAffiliation: {
            id: "local-mutual-aid",
            action: "return",
            role: "不定期の備品確認",
            note: "休止後、本人が可能な日の当番へ復帰"
          },
          lifeGoal: { id: "neighborhood-mutual-aid", action: "continue", note: "戻れる日だけ当番を再開した" },
          groupStanding: {
            id: "neighbors",
            title: "近隣の住民",
            delta: 1,
            reason: "可能な日の備品確認へ戻った"
          },
          rl: 1
        }
      ]),
      $terraData.K("まだ余裕がないと伝え、もうしばらく休ませてもらう", {}, [
        1,
        "今はまだ自分の暮らしで手一杯だと謝り、落ち着いたら必ず顔を出すと伝えて猶予をもらった。",
        {
          lifeAffiliation: {
            id: "local-mutual-aid",
            action: "review",
            note: "本人が休止を続け、数年後に再確認する"
          },
          p: 0
        }
      ]),
      $terraData.K("預かっていた合鍵を返し、きっぱり当番から抜ける", {}, [
        1,
        "これ以上名前だけ残して迷惑はかけられないと、預かっていた合鍵を隣人に返して完全に役目を降りた。",
        {
          lifeAffiliation: {
            id: "local-mutual-aid",
            action: "leave",
            note: "本人が近隣互助の当番を終えた"
          },
          lifeGoal: { id: "neighborhood-mutual-aid", action: "abandon", note: "鍵を返し、近隣互助の当番を終えた" },
          p: 0
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_local_mutual_aid_relocation",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE", "SRC_TERRA_SOCIAL_ATTITUDES"],
    st: ["青年", "壮年", "老年"],
    after: { id: "life_local_mutual_aid", min: 0 },
    cd: 3,
    w: 0.12,
    show: s => {
      const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "local-mutual-aid");
      return affiliation?.status === "active" && $rules.affiliations.awayFromRecordedLocality(s, "local-mutual-aid");
    },
    t: "水場や暖房の当番を一緒に回していた街区を離れることになった。荷造りをしながら、預かっていた道具置き場の鍵と自分の役目をどう締めくくるか考えた。",
    c: [
      $terraData.K("隣人たちに挨拶し、鍵を返して気持ちよく役目を終える", {}, [
        1,
        "これまで世話になった礼を言い、ボイラーの癖や道具の場所を次の担当に伝えて鍵を返した。",
        {
          lifeAffiliation: {
            id: "local-mutual-aid",
            action: "leave",
            note: "転居時に備品・当番を近隣へ引き継いだ"
          },
          lifeGoal: {
            id: "neighborhood-mutual-aid",
            action: "abandon",
            note: "転居に伴い、以前の地区の当番を引き継いで終えた"
          },
          p: 1
        }
      ]),
      $terraData.K("いつの日か戻ってくるつもりで、一時休止の形にしておく", {}, [
        1,
        "鍵はいったん預け直し、もしまたこの街区へ戻ってくることがあれば手伝わせてくれと伝えて別れた。",
        {
          lifeAffiliation: {
            id: "local-mutual-aid",
            action: "suspend",
            note: "転居後の生活を整える間、近隣互助を休止"
          },
          lifeGoal: { id: "neighborhood-mutual-aid", action: "pause", note: "転居後に地域互助を休止" },
          p: 0
        }
      ])
    ]
  });
  $terraData.EV.push({
    id: "life_rhodes_referral",
    conf: "S",
    references: ["SRC_RHODES_MEDICAL", "SRC_ORIPATHY_SOCIAL"],
    st: ["青年", "壮年", "老年"],
    need: ["感染診断済"],
    once: true,
    w: 0.24,
    t: "町の診療所で鉱石病の診断を受けた際、医師が声を潜めて「ロドス・アイランドという組織の巡回医療につなぐ紹介状を書ける」と教えてくれた。自分の身体とこれからの働き方を思い、どうするか迷った。",
    c: [
      $terraData.K(
        "紹介状を受け取り、療養の相談を頼む",
        {},
        [
          0.8,
          "医師の紹介状を握りしめて連絡を入れた。返事を待つ間も、高価な抑え薬の代金をどう工面するか頭から離れなかった。",
          {
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              kind: "medical-contact",
              action: "contact",
              role: "紹介状を送り、返答待ち"
            },
            groupStanding: {
              id: "rhodes",
              title: "ロドスの担当者",
              delta: 1,
              reason: "紹介状を持って相談を申し込んだ"
            },
            rl: 1,
            p: -1
          }
        ],
        [
          1,
          "巡回医療班の通常枠は埋まっていたが、現地の深刻さを鑑みた特例の臨時診察枠と応急処置キットが手配された。「いかなる状況でも見捨てることはありません」という添え書きに、救われた思いがした。",
          {
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              kind: "medical-contact",
              action: "contact",
              role: "特例枠で返答受領"
            },
            groupStanding: {
              id: "rhodes",
              title: "ロドスの担当者",
              delta: 1,
              reason: "特例枠で受入が認められた"
            },
            p: 1
          }
        ]
      ),
      $terraData.K(
        "手仕事や帳簿の腕を活かし、ロドスの現地拠点で働けないか尋ねる",
        { show: { need: ["就労中", "実務に熟達"] } },
        [
          0.35,
          "現地事務所の倉庫で、医療物資の仕分けと台帳合わせの手伝いとして雇われることになった。感染者であっても普通に働き手として扱われる空気に、胸のつかえが下りた。",
          {
            lifeAffiliation: {
              id: "rhodes-staff",
              title: "ロドス・アイランド",
              kind: "employer",
              action: "join",
              role: "物資・記録の補助"
            },
            groupStanding: {
              id: "rhodes-workers",
              title: "ロドス職員",
              delta: 2,
              reason: "短期業務の試用に応じた"
            },
            lifeGoal: {
              id: "rhodes-work",
              title: "医療支援の現場で、できる仕事を続ける",
              priority: "仕事",
              action: "start"
            },
            p: 1,
            k: 1
          }
        ],
        [
          1,
          "働ける時間帯が今の本業とどうしても噛み合わず、今回は見送るしかなかった。気持ちを切り替えて今の職場へ戻った。",
          { p: -1 }
        ]
      ),
      $terraData.K("よその組織には頼らず、地元の診療所で治療を続ける道を選ぶ", {}, [
        1,
        "紹介状は丁重に断り、これまで通り地元の診療所へ通うことにした。毎月の薬代を捻出するため、財布の紐をいっそう固く締めた。",
        { p: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_rhodes_referral_response",
    conf: "S",
    references: ["SRC_RHODES_MEDICAL", "SRC_ORIPATHY_SOCIAL"],
    st: ["青年", "壮年", "老年"],
    need: ["ロドスへ療養相談を申し込み中"],
    after: { id: "life_rhodes_referral", min: 1 },
    cd: 4,
    pri: true,
    w: 0.24,
    t: "ロドスの連絡員から便りが届き、近いうちにこの地域へ巡回医療班が立ち寄ると知らされた。仕事を抜ける口実と診察代の工面をどうするか考えた。",
    c: [
      $terraData.K("次の巡回時の相談枠を予約する", {}, [
        1,
        "診察の予約を入れ、その日までに必要な運賃と薬代を封筒に分けて手を付けないようにした。",
        {
          lifeAffiliation: {
            id: "rhodes-care",
            title: "ロドスへの療養相談",
            kind: "medical-contact",
            action: "join",
            role: "巡回診療の予約あり"
          },
          groupStanding: {
            id: "rhodes",
            title: "ロドスの担当者",
            delta: 1,
            reason: "巡回診療の相談枠を予約した"
          },
          lifeGoal: {
            id: "rhodes-care",
            title: "通える診療先と今の暮らしを両立する",
            priority: "療養",
            action: "start"
          },
          p: 1
        }
      ]),
      $terraData.K("通常枠は満員だったが、ロドスの人道優先枠・特設テントでの診療を申し込む", {}, [
        1,
        "「どんな状況であれ、助けを求める感染者を拒むことはありません」と連絡員は臨時枠の整理券を渡してくれた。温かい言葉に目頭が熱くなった。",
        {
          lifeAffiliation: {
            id: "rhodes-care",
            title: "ロドスへの療養相談",
            kind: "medical-contact",
            action: "join",
            role: "巡回診療の優先枠予約あり"
          },
          groupStanding: {
            id: "rhodes",
            title: "ロドスの担当者",
            delta: 1,
            reason: "人道優先枠で予約を受け付けた"
          },
          lifeGoal: {
            id: "rhodes-care",
            title: "ロドスの治療を受けながら日々の生活を支える",
            priority: "療養",
            action: "start"
          },
          p: 1
        }
      ]),
      $terraData.K("今は仕事を休めず、次の巡回が来るまで様子を見る", {}, [
        1,
        "どうしても仕事の都合がつかず、今回の受診は見送って次の巡回を待つことにした。",
        {
          lifeAffiliation: {
            id: "rhodes-care",
            title: "ロドスへの療養相談",
            kind: "medical-contact",
            action: "followup",
            role: "次回巡回の返答待ち"
          },
          p: -1
        }
      ])
    ]
  });

  $terraData.EV.push(
    {
      id: "life_rhodes_clinic_visit",
      conf: "S",
      references: ["SRC_RHODES_MEDICAL", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      need: ["ロドス巡回診療の予約あり"],
      after: { id: "life_rhodes_referral_response", min: 1 },
      cd: 2,
      pri: true,
      w: 0.4,
      t: "待ちわびていたロドスの巡回診療の日がやってきた。天幕の張られた臨時診療所へ向かう前に、懐の金と仕事の段取りをもう一度確かめた。",
      c: [
        $terraData.K(
          "受診し、費用を手元の資金から払う",
          {
            en: { affordableCashAfterReserve: 8e4 },
            why: "地域物価を反映した診療・移動費を払った後、生活予備費を残せない"
          },
          [
            1,
            "偏見のない丁寧な診察を受け、症状を抑える薬と日々の養生法を教わった。財布は軽くなったが、身体の重みが少し和らいだ気がした。",
            {
              cash: -3e4,
              pm: 1,
              lifeAffiliation: {
                id: "rhodes-care",
                title: "ロドスへの療養相談",
                action: "role",
                role: "巡回診療を受診済み"
              },
              groupStanding: {
                id: "rhodes",
                title: "ロドスの担当者",
                delta: 1,
                reason: "予約した巡回診療を受診した"
              },
              p: -1
            }
          ]
        ),
        $terraData.K(
          "受診し、費用を医療費の借入として記録する",
          {},
          [
            1,
            "手持ちの不足を相談すると、ロドスの担当者は快く人道基金の減額と無理のない無利子分割支払いを案内してくれた。「生き延びることが最優先です」という医師の言葉に深く感謝した。",
            {
              medicalDebt: 1e4,
              med: 1,
              lifeAffiliation: {
                id: "rhodes-care",
                title: "ロドスへの療養相談",
                action: "role",
                role: "巡回診療を受診済み"
              },
              groupStanding: {
                id: "rhodes",
                title: "ロドスの担当者",
                delta: 2,
                reason: "人道支援制度を利用して受診"
              },
              p: 1
            }
          ]
        ),
        $terraData.K("仕事や移動の都合で、予約を延期する", {}, [
          1,
          "現場を抜けることができず、診療所が開いている時間に間に合わなかった。次の巡回がいつになるか、連絡員に尋ねるしかなかった。",
          {
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              action: "role",
              role: "巡回受診を延期中"
            },
            p: -2
          }
        ]),
        $terraData.K("紹介先との連絡を終え、地域の診療先を探す", {}, [
          1,
          "予約を取り消し、多少冷たい目で見られても通いやすい近くの診療所で薬をもらう道を選んだ。",
          {
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              action: "leave",
              note: "予約を取り消し、地域の診療先を探す"
            },
            p: -1
          }
        ])
      ]
    },
    {
      id: "life_rhodes_clinic_reschedule",
      conf: "S",
      references: ["SRC_RHODES_MEDICAL", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      need: ["ロドス巡回受診を延期中"],
      after: { id: "life_rhodes_clinic_visit", min: 1 },
      cd: 4,
      w: 0.28,
      t: "前回受け損ねたロドスの巡回診療について、次の訪問日程を知らせる便りが届いた。今度こそ仕事を休んで足を運べるか考えた。",
      c: [
        $terraData.K("次の巡回相談を予約し直す", {}, [
          1,
          "仕事の段取りを前もってつけ、今度こそ診察を受けられるよう予約を入れ直した。",
          {
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              action: "role",
              role: "巡回診療の予約あり"
            },
            p: -1
          }
        ]),
        $terraData.K("まだ金と休みの目処が立たず、もう一回だけ様子を見る", {}, [
          1,
          "すぐには返事をせず、薬代を貯めて休みを取れる日ができるまで連絡先を懐にしまっておいた。",
          {
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              action: "role",
              role: "巡回受診を延期中"
            },
            p: -1
          }
        ]),
        $terraData.K("不定期な巡回を待つのは諦め、地元の診療所に通うことにする", {}, [
          1,
          "ロドスとの連絡はこれで終わりにし、自分の足でいつでも通える地域の診療所へ切り替えようと決めた。",
          {
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              action: "leave",
              note: "巡回受診を延期後、地域の診療先を探す"
            },
            p: 1
          }
        ])
      ]
    },
    {
      id: "life_rhodes_care_review",
      conf: "S",
      references: ["SRC_RHODES_MEDICAL", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      need: ["ロドス巡回診療後の療養確認"],
      after: { id: "life_rhodes_clinic_visit", min: 1 },
      cd: 3,
      w: 0.34,
      t: "ロドスの薬を飲んでいても、肌の表面に浮かぶ黒い結晶が消えるわけではない。それでも進行を抑えるために治療を続けるか、日々の生活費との間で思案した。",
      c: [
        $terraData.K(
          "診療で聞いた方法をもとに、療養を始める",
          { show: { ban: ["治療中"] } },
          [
            1,
            "定期的に薬を受け取り、身体に無理をさせない療養生活を始めた。薬代が重くのしかかり、毎月の食費や燃料代を切り詰めることになった。",
            {
              fl: { tx: 1 },
              lifeAffiliation: {
                id: "rhodes-care",
                title: "ロドスへの療養相談",
                action: "role",
                role: "巡回診療後、療養を選択"
              },
              lifeGoal: {
                id: "rhodes-care",
                title: "通院と今の暮らしを両立しながら療養する",
                priority: "療養",
                action: "start"
              },
              p: 1
            }
          ]
        ),
        $terraData.K(
          "今の治療を粘り強く続け、次の巡回でも経過を診てもらう",
          { show: { need: ["治療中"] } },
          [
            1,
            "決して安くない薬代をなんとか工面し、次の巡回日に体調の変化を相談できるよう治療を続けた。",
            {
              lifeAffiliation: {
                id: "rhodes-care",
                title: "ロドスへの療養相談",
                action: "role",
                role: "巡回診療後、療養を選択"
              },
              p: 1
            }
          ]
        ),
        $terraData.K("費用が重く、療養を一時休止する", { show: { need: ["治療中"] } }, [
          1,
          "このままでは食べていけなくなると、高価な抑え薬を買うのをいったん止めた。財布の息はつけたものの、夜中に疼く身体への不安が募った。",
          {
            fl: { tx: 0 },
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              action: "role",
              role: "巡回診療後、療養を休止"
            },
            p: -4
          }
        ]),
        $terraData.K("本格的な治療に入るかは決めず、まずは仕事と暮らしを立て直す", {}, [
          1,
          "継続治療の返事は保留にし、まずは日々の稼ぎを安定させることに力を注いだ。",
          {
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              action: "role",
              role: "巡回診療を受診済み"
            },
            p: -1
          }
        ]),
        $terraData.K("ロドスの巡回診療からは離れ、地元の診療所へ引き継いでもらう", {}, [
          1,
          "これまでの処方内容を記した紹介状を受け取り、近くの町医者で治療を続けられるよう切り替えた。",
          {
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              action: "leave",
              note: "巡回診療後、地域の診療先へ引継ぎ"
            },
            p: 1
          }
        ])
      ]
    }
  );

  $terraData.EV.push({
    id: "life_rhodes_role_review",
    conf: "S",
    references: ["SRC_RHODES_MEDICAL", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    any: ["ロドスと継続連絡中", "ロドス職員として活動中"],
    show: s => {
      const care = s.lifeRecord?.affiliations?.find(
        x => x.id === "rhodes-care" && ["active", "crisis"].includes(x.status)
      );
      return ![
        "巡回診療の予約あり",
        "巡回受診を延期中",
        "巡回診療を受診済み",
        "巡回診療後、療養を選択",
        "巡回診療後、療養を休止"
      ].includes(care?.role);
    },
    cd: 4,
    w: 0.42,
    t: "ロドスの現地担当者から、今後の関わり方を尋ねる連絡が届いた。自分の体調や仕事の忙しさと照らし合わせ、これからどう付き合っていくか考えた。",
    c: [
      $terraData.K("これからも定期的に連絡を取り、巡回診療に合わせて診てもらう", { show: { need: ["ロドスと継続連絡中"] } }, [
        1,
        "次の巡回時期と仕事を抜けられる日を担当者に伝え、これからも定期的に診てもらえるよう約束を交わした。",
        {
          lifeAffiliation: {
            id: "rhodes-care",
            title: "ロドスへの療養相談",
            action: "role",
            role: "定期相談"
          },
          groupStanding: { id: "rhodes", title: "ロドスの担当者", delta: 1, reason: "通院日程を相談した" },
          p: 1
        }
      ]),
      $terraData.K("倉庫の整理だけでなく、医療物資の積み込みや搬送の手伝いも引き受ける", { show: { need: ["ロドス職員として活動中"] } }, [
        1,
        "医療物資の検品に加え、巡回班へ送り出す荷の積み分けまで任されるようになった。現場のスタッフともすっかり顔なじみになった。",
        {
          lifeAffiliation: {
            id: "rhodes-staff",
            title: "ロドス・アイランド",
            action: "role",
            role: "記録・搬送補助"
          },
          lifeSkill: {
            id: "rhodes-logistics",
            title: "医療物資の記録と仕分け",
            delta: 5,
            context: "非戦闘の短期業務"
          },
          p: 1,
          k: 1
        }
      ]),
      $terraData.K("ロドスとのやり取りは一区切りとし、地元の診療所へ通うことにする", {}, [
        1,
        "これまでの礼を担当者に伝え、今後は身近な町の診療所で手当てを続けていくことにした。",
        {
          lifeAffiliation: {
            id: "rhodes-care",
            title: "ロドスへの療養相談",
            action: "leave",
            note: "地域の仕事と通院を優先"
          },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_reunion_local_entry",
    conf: "S",
    references: ["SRC_TL_MIDDLE", "SRC_REUNION_HISTORY"],
    st: ["青年", "壮年"],
    need: ["事件:chernobog_incident"],
    any: ["国:ウルサス", "国:龍門"],
    ge: { year: 1097, age: 18 },
    le: { year: 1097 },
    months: [1],
    once: true,
    w: 0.24,
    t: "戦火と混乱で行き場を失った感染者たちへ、食料や薬を運ぶのを手伝ってほしいと声をかけられた。頼んできたのはレユニオンの腕章をつけた人物だった。集まりに顔を出すと、飢えた仲間を救う話のすぐ隣で、武器を取って戦う話が熱を帯びて語られていた。",
    c: [
      $terraData.K(
        "武器は持たず、食料や薬を届ける運び手として力を貸す",
        {},
        [
          0.6,
          "物資の運び手として仲間に加わり、路地裏に隠れ住む感染者の家族へ食料と薬を配り歩いた。検問の目をかいくぐる緊張感のなか、集まりでは次第に戦闘任務の話が増えていった。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              title: "1096年の地域レユニオン支援網",
              kind: "local-relief-network",
              action: "join",
              role: "物資運搬"
            },
            groupStanding: {
              id: "infected-neighbours",
              title: "避難中の感染者と家族",
              delta: 3,
              reason: "食料と薬の運搬を引き受けた"
            },
            regionalImpact: {
              entity: "チェルノボーグ周辺の避難者",
              kind: "relief",
              description: "地域の支援網を通じて食料と薬を運んだ"
            },
            lifeGoal: {
              id: "protect-neighbours",
              title: "避難した近隣の人々を当面支える",
              priority: "地域",
              action: "start"
            },
            p: 1,
            fl: { reunion: 1 }
          }
        ],
        [
          1,
          "きな臭い空気に深入りするのをためらい、連絡先だけ聞いて運搬は断った。数日後、通りがかりに見た感染者世帯の閉ざされた戸口が胸に刺さった。",
          { p: -1, rl: 1 }
        ]
      ),
      $terraData.K("戦いに巻き込まれる前に手を切り、荷物をまとめて町を出る", {}, [
        1,
        "武器を取る連中とは関われないと誘いを断り、身の回りの荷物を背負って町を離れた。行く当てもないまま、避難民の長い列に身を投じた。",
        { p: 1, fl: { war_displaced: 1 } }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_reunion_order_conflict",
    conf: "S",
    references: ["SRC_TL_MIDDLE", "SRC_REUNION_HISTORY"],
    st: ["青年", "壮年"],
    need: ["1096年のレユニオン地域網"],
    ge: { year: 1096 },
    le: { year: 1100 },
    cd: 2,
    w: 0.3,
    t: "物資を分け合うはずの集まりで、迫害してきた者たちへの報復を叫ぶ声が日増しに高まっていった。動けない避難者を支えたいというあなたの思いと、武器を取って前線へ出ろという組織の命令が真っ向からぶつかり始めた。",
    c: [
      $terraData.K("どれほど睨まれようと、攻撃には加わらず避難者への食料運びを貫く", {}, [
        1,
        "報復のための襲撃には加わらないと突っぱね、傷ついた民間人へ食料を届ける役目に徹した。周囲の戦闘員からは冷たい視線を浴びせられるようになった。",
        {
          lifeAffiliation: {
            id: "reunion-1096",
            title: "1096年の地域レユニオン支援網",
            action: "role",
            role: "民間人の物資支援",
            note: "攻撃任務を拒否"
          },
          groupStanding: {
            id: "reunion-local",
            title: "地域のレユニオン参加者",
            delta: -2,
            reason: "武装任務への不参加"
          },
          regionalImpact: {
            entity: "避難者の連絡網",
            kind: "civilian-relief",
            description: "民間人向け支援と武装任務の線引きを求めた"
          },
          p: -2
        }
      ]),
      $terraData.K("組織の命令に従い、食料配りをやめて部隊の任務へ移る", {}, [
        1,
        "上からの指示に従って避難民への食料配りを打ち切り、命じられた任務へと移った。かつてパンを届けていた路地の家族がどうなったか、振り返ることはしなかった。",
        {
          lifeAffiliation: {
            id: "reunion-1096",
            title: "1096年の地域レユニオン支援網",
            action: "role",
            role: "命令下の任務"
          },
          groupStanding: {
            id: "reunion-local",
            title: "地域のレユニオン参加者",
            delta: 3,
            reason: "任務への服従"
          },
          regionalImpact: {
            region: "龍門",
            entity: "避難者の連絡網",
            kind: "aid-withdrawal",
            description: "支援担当を離れ、近隣世帯への物資連絡が途切れた"
          },
          p: 1
        }
      ]),
      $terraData.K("暴力へ傾く組織に見切りをつけ、夜陰に紛れて離脱する", {}, [
        1,
        "これ以上はついていけないと支援網を抜け出し、わずかな荷物を抱えて別の避難先へと歩き出した。背後から追手が来ないか怯えながらの旅立ちだった。",
        {
          lifeAffiliation: {
            id: "reunion-1096",
            title: "1096年の地域レユニオン支援網",
            action: "leave",
            note: "武装化と支援の方針が合わず離脱"
          },
          groupStanding: {
            id: "reunion-local",
            title: "地域のレユニオン参加者",
            delta: -3,
            reason: "命令方針を巡る離脱"
          },
          p: -1,
          fl: { reunion: 0 }
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_chernobog_neighbourhood_reopening",
    conf: "S",
    references: ["SRC_TL_MIDDLE", "SRC_URSUS_CHILDREN", "SRC_CHERNOB_AFTERSHOCK_MODEL"],
    st: ["児童", "少年", "青年", "壮年", "老年"],
    need: ["国:ウルサス", "都市:チェルノボーグ"],
    show: s =>
      !!s.world?.events?.chernobog_incident && (s.year > 1097 || (s.year === 1097 && s.mo >= 2)),
    ge: { year: 1097, age: 6 },
    le: { year: 1098 },
    once: true,
    w: 0.3,
    t: "傷跡の残る中学校の門に、ようやく授業を再開する日が貼り出された。近所の大人たちが使える机を運び込んでいたが、割れた窓は板で打ち付けられたままで、廊下には戻ってこない生徒たちの空席がいくつも並んでいた。",
    c: [
      $terraData.K("手を貸して、教室まで机を一つ運び込む", {}, [
        1,
        "埃をかぶった机を抱えて階段を上り、教室の列に並べた。ぎしりと鳴る床板の上で、主のいない席が静かに並んでいた。",
        {
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグ近隣の学び舎",
            kind: "one-time-neighborhood-repair",
            description: "授業再開前、教室へ机を一つ運び込むのを手伝った"
          },
          rl: 1,
          p: 1
        }
      ]),
      $terraData.K("学校が始まる日を控え、まだ知らせが届いていない子の家へ教えに行く", {}, [
        1,
        "再開の日取りを確かめ、家に閉じこもりがちだった近所の生徒の戸口まで走って知らせた。",
        { k: 1, rl: 1 }
      ]),
      $terraData.K("貼り紙を一瞥しただけで足を止めず、自分の家の片付けに戻る", {}, [
        1,
        "板張りの窓を見上げただけで通り過ぎ、家の修繕と今日食べる物の算段に戻った。",
        { p: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_school_aid",
    conf: "S",
    references: ["SRC_TL_MIDDLE", "SRC_URSUS_CHILDREN", "SRC_OFFICIAL_URSUS_CHILDREN"],
    st: ["少年"],
    need: ["国:ウルサス", "都市:チェルノボーグ"],
    ge: { year: 1096, age: 12 },
    le: { year: 1097, age: 17 },
    months: [12, 1],
    show: s => !!s.world?.events?.chernobog_incident,
    once: true,
    w: 0.4,
    t: "混乱に包まれた教室で、逃げ場所を探す声と親きょうだいを呼ぶ声が飛び交った。何人かの同級生が「はぐれても連絡が取れるようにしよう」と声を張り上げ、手持ちの食料を分け合おうとしている。窓の外では、街を脱出する人々の列が雪煙の中を動いていた。",
    c: [
      $terraData.K(
        "同級生たちの連絡係を引き受け、避難先と食料のありかを伝えて回る",
        {},
        [
          0.7,
          "震える手で書き留めた仲間の家を駆け回り、炊き出しの場所と合流先を必死に伝えた。息を切らして次の路地へと走った。",
          {
            lifeAffiliation: {
              id: "ursus-school-aid",
              title: "チェルノボーグの同級生避難支援",
              kind: "school-peer-network",
              action: "join",
              role: "避難先の連絡係"
            },
            groupStanding: {
              id: "chernobog-students",
              title: "近隣の中学生",
              delta: 2,
              reason: "避難情報を伝えた"
            },
            regionalImpact: {
              region: "ウルサス",
              entity: "チェルノボーグの中学校周辺",
              kind: "student-relief",
              description: "同級生へ避難先と食料の情報を伝えた"
            },
            p: 1,
            rl: 1
          }
        ],
        [
          1,
          "何人かの家へ辿り着く前に通りが封鎖され、避難の群衆に押し流された。呼びかける声も届かないまま、街を出る列に呑み込まれた。",
          { p: -3, fl: { war_displaced: 1 } }
        ]
      ),
      $terraData.K("生き延びることを最優先し、学校を出て避難の列に飛び込む", {}, [
        1,
        "ちりぢりになる同級生たちの声を背後に聞きながら、避難民の波へ駆け込んだ。誰が無事に逃げ延びたのかも分からないまま街を離れた。",
        { fl: { war_displaced: 1 }, p: 1 }
      ]),
      $terraData.K("パニックにならず、近所の大人に安全な抜け道を聞いてから動く", {}, [
        1,
        "地理に詳しい近所の大人を捕まえて安全な避難路を聞き出し、荷物をしっかり抱えて列の後ろについた。",
        { p: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_school_aid_followup",
    conf: "S",
    references: ["SRC_TL_MIDDLE", "SRC_TERRA_LIFECOURSE"],
    st: ["少年", "青年", "壮年"],
    need: ["ウルサス学校の避難支援"],
    after: { id: "life_ursus_school_aid", min: 1 },
    ge: { year: 1097 },
    le: { year: 1098 },
    months: [12, 1],
    once: true,
    w: 0.28,
    t: s => {
      const year=s.sn?.life_ursus_school_aid,
        elapsed=Number.isInteger(year) && year<=s.year ? s.year-year : null;
      return (elapsed===null ? "あの冬、学校の教室でちりぢりになった日のことを思い返した。" :
        `学校からちりぢりに避難したあの日から${elapsed}年が過ぎた。`)+
        "手元に残った控えには当時の避難先が走り書きされているが、いくら待っても音沙汰のない同級生もいる。これからも消息を追い続けるか迷った。";
    },
    c: [
      $terraData.K("手がかりのある同級生に手紙を送り、他の仲間の消息も尋ねてみる", {}, [
        1,
        "避難先が分かっている一人に手紙を書き、無事でいるか、他の仲間の噂を聞いていないか尋ねた。いつの日か返事が届くことを祈りながら投函した。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "role",
            role: "同級生一人との便り・避難先の連絡"
          },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "消息の分からない同級生へ、無理のない範囲で連絡を保つ",
            priority: "旧友との縁",
            action: "start"
          },
          groupStanding: {
            id: "chernobog-students",
            title: "近隣の中学生",
            delta: 1,
            reason: "一人の同級生へ便りを出した"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグから離れた同級生の連絡",
            kind: "student-contact",
              description: "同級生へ便りを送り、連絡の再開を試みた"
          },
          p: 1,
          rl: 2
        }
      ]),
      $terraData.K("家族と別の土地へ移るため、書き留めた連絡先を信頼できる大人に託す", {}, [
        1,
        "遠くの街へ移り住むことになり、もし後から尋ねてくる子がいたら渡してほしいと近所の大人に控えを託した。新しい土地で生きるのに必死で、振り返る余裕はなかった。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "leave",
            note: "家族の転居に合わせ、残った連絡先を近所の大人へ渡した"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグの同級生連絡先",
            kind: "student-handover",
            description: "家族の転居前、同級生の連絡先を近所の大人へ託した"
          },
          fl: { war_displaced: 1 },
          p: 1
        }
      ]),
      $terraData.K("返事のない宛先を見るのが辛く、捨てられないまま荷物の底へしまう", {}, [
        1,
        "届かない手紙を書き続ける気力が湧かず、それでも名前を消すことだけはできずに、しわくちゃの紙束を鞄の底へ深くしまい込んだ。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "role",
            role: "返事のない宛先を保管・連絡は休止"
          },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "消息の分からない同級生へ、無理のない範囲で連絡を保つ",
            priority: "旧友との縁",
            action: "pause",
            note: "家族の暮らしを優先し、返事のない宛先への連絡を休止"
          },
          p: -1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_school_aid_adult_followup",
    conf: "S",
    references: ["SRC_TL_MIDDLE", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年"],
    need: ["ウルサス学校の避難支援"],
    after: { id: "life_ursus_school_aid_followup", min: 3 },
    ge: { year: 1100, age: 18 },
    once: true,
    w: 0.2,
    t: "大人になって荷物を整理していた時、チェルノボーグの学校で書き留めた同級生たちの古い連絡先がひょっこり出てきた。あのまま行方が知れない仲間の名を指でなぞり、これからどうするか考えた。",
    c: [
      $terraData.K("生き延びた旧友へ再び筆を執り、年に一度だけでも便りを交わす", {}, [
        1,
        "連絡がつく同級生へ久しぶりに手紙を書き、互いの無事を確かめ合った。年に一度、あの冬を生き延びた証として近況を送り合うことにした。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "role",
            role: "年一度の便りを続ける元同級生"
          },
          fl: { ursus_school_contact_ongoing: 1 },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "消息の分からない同級生へ、無理のない範囲で連絡を保つ",
            priority: "旧友との縁",
            action: "continue"
          },
          groupStanding: {
            id: "chernobog-students",
            title: "近隣の中学生",
            delta: 1,
            reason: "成人後も無理のない便りを続けた"
          },
          p: 1
        }
      ]),
      $terraData.K("離散家族を捜している地域の支援者に名簿を託し、自分の役目に区切りをつける", {}, [
        1,
        "これまで分かった消息とまだ行方知れずの名を整理して支援者に引き渡し、少年時代から背負い続けてきた連絡係の役目を静かに下ろした。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "leave",
            note: "成人後、確認済み/未確認の名簿を地域の支援者へ引継ぎ"
          },
          fl: { ursus_school_contact_ongoing: 0 },
          lifeGoal: {
            id: "ursus-classmate-contact",
            action: "complete",
            note: "確認できる範囲を記録し、後任へ渡した"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "避難した元同級生の連絡記録",
            kind: "adult-handover",
            description: "消息が判明した人と未確認の人を分けた名簿を地域支援者へ引き継いだ"
          },
          p: 1
        }
      ]),
      $terraData.K("もう過去は振り返らず、今の仕事と家族の暮らしに生きる", {}, [
        1,
        "色褪せた紙束をそっと閉じ、もう昔の消息を追うのはやめた。目の前の仕事と家族を守る日々の暮らしへと戻った。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "leave",
            note: "成人後、仕事と家族の生活を優先して連絡を終了"
          },
          fl: { ursus_school_contact_ongoing: 0 },
          lifeGoal: {
            id: "ursus-classmate-contact",
            action: "abandon",
            note: "続けられなくなり、便りの役目を終えた"
          },
          p: 0
        }
      ])
    ]
  });
});
