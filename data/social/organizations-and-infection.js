// social/organizations-and-infection: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("social/organizations-and-infection", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "oldDiscriminationFollowup",
    $terraData.EV.find(e => e.id === "earth_discr_work_years"),
    false
  );

  if ($terraData.oldDiscriminationFollowup?.c?.[0]?.o?.[1])
    $terraData.oldDiscriminationFollowup.c[0].o[1][0] = 1;

  if ($terraData.oldDiscriminationFollowup)
    $terraData.oldDiscriminationFollowup.show = s =>
      !!s.workContract &&
      !!s.equityLedger?.episodes?.some(
        x =>
          x.status === "active" &&
          x.flag === "ed_work_disadvantage" &&
          x.siteId === s.workContract.siteId &&
          x.jobId === s.job
      );

  $terraData.EV.push(
    {
      id: "ori_work_safety_instruction",
      conf: "S",
      references: ["SRC_ORI_HUMUS_RECORD", "SRC_ORI_CATHERINE_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["少年", "青年", "壮年", "老年"],
      ge: { age: 15 },
      w: 0.75,
      cd: 8,
      show: s => s.job > 0 && ($terraData.J[s.job]?.ex || 1) >= 1.2 && !s.fl?.detained && !s.fl?.segregated,
      t: "粉塵の舞う工程へ入る前、使い回しの手袋に黒っぽい粉がこびりついているのに気づいた。頭上の換気扇からは乾いた異音が響いている。",
      c: [
        $terraData.K("防護具の替えと安全な手順を確かめる", {}, [
          1,
          "手袋の裂け目と工具の汚れを班長に突きつけ、新しい防護具を出させた。異音が強まったらすぐ作業を止めるよう周囲にも声をかけた。",
          { exposureAction: "protect", k: 2, cr: 1 }
        ]),
        $terraData.K("責任者に換気扇の点検を求める", {}, [
          1,
          "換気扇の調子がおかしいと責任者に掛け合ったが、返事は生返事のまま後回しにされた。せめて次の番の者が気づくよう、作業台の隅に大きく注意書きを残した。",
          { exposureAction: "inspect", cr: 1, p: -1 }
        ]),
        $terraData.K("気にせずいつもの手順で作業に入る", {}, [
          1,
          "そのまま手袋をはめて作業を終え、帰りがけにパンパンと粉を払った。縫い目に潜り込んだ黒い粉が落ちきったかは分からなかった。",
          { exposureAction: "unsafe", p: 1, h: -1 }
        ])
      ]
    },
    {
      id: "ori_work_safety_followup",
      conf: "S",
      references: ["SRC_ORI_CATHERINE_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["青年", "壮年", "老年"],
      w: 0.6,
      once: true,
      after: { id: "ori_work_safety_instruction", min: 2 },
      show: s => s.job > 0,
      t: "新しく入れ替わった作業台の端に、何年も前の煤けた注意書きが貼りっぱなしになっていた。扱う機械はとっくに変わっているのに、文字も擦り切れて読めない。隣に入ったばかりの新人が、不安そうに手元を覗き込んできた。",
      c: [
        $terraData.K("新人にも一目で分かるよう手順を教え直す", {}, [
          1,
          "粉塵が舞う箇所と、異変が起きた時に駆け込む先を新しい紙に大きく書いて作業台に貼った。文字が苦手な新人には、実際に工具を握らせて手つきを見せた。",
          { exposureAction: "protect", k: 2, rl: 2 }
        ]),
        $terraData.K("足りない防護具を掛け合い、補充を求める", {}, [
          1,
          "穴のあいた手袋と止まりかけた換気口を数え上げ、責任者に改善を迫った。補充の約束は曖昧なまま、翌朝もいつも通りの作業割りが貼り出された。",
          { exposureAction: "inspect", cr: 2 }
        ]),
        $terraData.K("まずは自分の持ち場の安全だけを固める", {}, [
          1,
          "始業前に自分の工具と防塵マスクだけを念入りに点検した。隣のラインから応援を呼ばれても、安全が確かめられるまでは軽々しく踏み込まないようにした。",
          { exposureAction: "avoid", p: 1 }
        ])
      ]
    },
    {
      id: "ori_industrial_scrap",
      conf: "S",
      references: ["SRC_ORI_HUMUS_RECORD", "SRC_ORI_CATHERINE_RECORD"],
      st: ["青年", "壮年"],
      ge: { age: 16 },
      w: 0.55,
      once: true,
      show: s => s.local?.kind === "工業・採掘地域" && !s.fl?.detained,
      t: "工業区の空き地に、黒く煤けた鉄板の山がどこからか運び込まれた。近くの町工場が「まだ使えるから引き取りたい」と目を輝かせているが、出どころも何を浴びた鉄板なのかも分からない。片づけの手伝いを頼まれ、足が止まった。",
      c: [
        $terraData.K("素性が分かるまで鉄板を隔離しておく", {}, [
          1,
          "「源石絡みの廃材だったら取り返しがつかない」と周りを説得し、鉄板をシートで覆って縄を張った。町工場への引き渡しは、出どころが知れるまで待ってもらうことにした。",
          { exposureAction: "avoid", p: -1, cr: 1 }
        ]),
        $terraData.K("防護具を揃えてから慎重に調べる", {}, [
          1,
          "素手では触らないよう厚手の手袋とマスクを揃え、表面の黒い付着物が何なのか詳しい職人に診てもらう手配をした。",
          { exposureAction: "inspect", k: 1 }
        ]),
        $terraData.K("遠巻きに見るだけにして、別の仕事へ戻る", {}, [
          1,
          "黒くざらついた表面を遠目に眺めただけで、片づけには加わらずその場を離れた。鉄板の山は夕暮れの空き地にそのまま残された。",
          { exposureAction: "document", p: 0 }
        ])
      ]
    },
    {
      id: "ori_post_catastrophe_ground",
      conf: "S",
      references: ["SRC_ORI_JP_OVERVIEW_2026", "SRC_ORI_MINT_RECORD"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      w: 0.48,
      cd: 10,
      show: s => !!(s.fl?.disaster_displaced || s.fl?.war_displaced || s.local?.hazard > 0.77),
      t: "崩れた通りを歩いていると、ぬかるんだ土の中に黒く光る欠片がいくつも混じっているのが目に入った。ただの石炭か、それとも活性を持った源石の欠片か、遠目には見分けがつかない。",
      c: [
        $terraData.K("近寄らず、すれ違う人にも回り道を勧める", {}, [
          1,
          "後から歩いてきた人たちに足元の欠片を指さして教え、一緒に風上の路地へと大きく迂回した。家に着くころにはすっかり日が暮れていた。",
          { exposureAction: "avoid", rl: 1 }
        ]),
        $terraData.K("現場の扱いに慣れた人を呼びに行く", {}, [
          1,
          "黒い欠片が散らばっている場所を覚え、復旧作業の詰め所へ走って様子を見てもらうよう頼んだ。帰りは別の道を選んだ。",
          { exposureAction: "inspect", k: 1 }
        ]),
        $terraData.K("足元を避けて急いで通り抜ける", {}, [
          1,
          "欠片を踏まないよう息を詰めて駆け抜けた。通りを出てから近くの人に場所だけ伝えたが、あれが何だったのかは確かめないままだった。",
          { exposureAction: "document", p: -1 }
        ])
      ]
    },
    {
      id: "ori_transport_dust",
      conf: "S",
      references: ["SRC_ORI_TUYE_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["青年", "壮年"],
      w: 0.4,
      cd: 12,
      show: s => s.job > 0 && /運送|輸送|行商|護衛|傭兵|荷|商人|運搬/.test($terraData.J[s.job]?.n || ""),
      t: "積み荷の木箱の隙間に、きめの細かい黒い粉がうっすら積もっているのに同僚が気づいた。道中の砂埃か、それとも中身の源石製品が漏れているのか見当がつかない。倉庫の奥からは「早く荷を下ろせ」と急かす怒鳴り声が飛んでくる。",
      c: [
        $terraData.K("手を止め、荷主と中身を確かめるまで隔離する", {}, [
          1,
            "急かす声を撥ねつけて作業を止め、荷札と木箱の割れ目を確かめた。荷主の返事が来るまでシートを被せ、誰にも触れさせないようにした。",
          { exposureAction: "inspect", cr: 1, p: -1 }
        ]),
        $terraData.K("素手で触れずに済む運び方を工夫する", {}, [
          1,
            "布で口元を覆い、鉤棒と荷車を使って体に粉がつかないよう慎重に荷を動かした。受け取り先の倉庫番には、木箱の様子をきっちり伝えておいた。",
          { exposureAction: "protect", rl: 1 }
        ]),
        $terraData.K("異常があったことだけ責任者に告げ、別の荷を運ぶ", {}, [
          1,
            "黒い粉が吹いている箱の番号だけを監督に伝え、返事を待つ間は離れた場所で別の荷下ろしを続けた。",
          { exposureAction: "document", k: 1 }
        ])
      ]
    },
    {
      id: "ori_school_fragment",
      conf: "S",
      references: ["SRC_ORI_MINT_PROFILE", "SRC_ORI_GAME_MODEL_V3"],
      st: ["児童", "少年"],
      ge: { age: 7 },
      le: { age: 16 },
      w: 0.42,
      once: true,
      t: "遊びからの帰り道、前を歩いていた友だちが道端に落ちていた黒く光る石ころに手を伸ばした。ただのガラス片か源石の欠片か咄嗟には分からず、胸がひやりとした。",
      c: [
        $terraData.K("手を止めさせ、近くの大人を呼びに行く", {}, [
          1,
          "「触るな」と声を上げて友だちの手を引っこめさせ、通りがかった大人に場所を知らせた。それっきり、その石がどうなったかは分からなかった。",
          { exposureAction: "avoid", rl: 2, k: 1 }
        ]),
        $terraData.K("触らずに帰り、翌日学校の先生に話す", { show: { need: ["就学中"] } }, [
          1,
          "その場では石に触れさせず、引っ張るようにして一緒に帰った。翌朝、先生に道端の黒い石のことを話した。",
          { exposureAction: "document", k: 2, rl: 1 }
        ]),
        $terraData.K("遠巻きに見ただけで、黙って家へ帰る", {}, [
          1,
          "気味が悪くなって友だちを急かし、石には指一本触れずにそのまま家へ駆け戻った。",
          { p: -1 }
        ])
      ]
    },
    {
      id: "ori_diagnosis_decision",
      conf: "S",
      references: ["SRC_ORI_PURESTREAM_RECORD", "SRC_ORI_MINT_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["乳児", "幼児", "児童", "少年", "青年", "壮年", "老年"],
      w: 2,
      pri: true,
      cd: 1,
      show: s =>
        s.inf &&
        !s.fl?.dg &&
        !Number.isInteger(s.oripathyExposure?.screeningRequestedYear),
      t: s => {
        const clinic = $rules.facilities.activeFacility(s, "clinic");
        if (!clinic)
          return "いつまでも抜けない微熱とだるさに、もしやという嫌な予感がよぎる。だが近くに診てくれる医者はなく、よその町の診療所へ行く運賃まで含めて算段しなければならなかった。";
        if (clinic.status === "limited")
          return "いつまでも抜けない微熱とだるさに嫌な予感がよぎるが、近くの診療所は設備や資材が足りず、鉱石病の検査を受け付けていないという。遠くの病院へ足を運ぶか、別の手立てを考えるか迷った。";
        return "いつまでも抜けない微熱とだるさに、もしやという嫌な予感がよぎる。近くの診療所で思い切って検査を受けるか、費用の工面がつくまで様子を見るか迷った。";
      },
      c: [
        $terraData.K(
          "検査を受け、結果と今後の療養について説明を聞く",
          {
            en: { affordableMedicalCash: 3e4 },
            why: "検査代と行き帰りの運賃を合わせると、手元の金では足りない",
            show: s => {
              const clinic = $rules.facilities.activeFacility(s, "clinic");
              return !!clinic && clinic.status !== "limited";
            }
          },
          [
            1,
            "なけなしの金を払って検査を受けた。告げられた病名は、やはり鉱石病だった。帰り道、ポケットの中の薬袋がひどく重く感じられた。",
            { cash: -3e4, med: 1, exposureAction: "screen", fl: { dg: 1 }, p: -4, k: 1 }
          ]
        ),
        $terraData.K(
          "診療所で検査枠と費用を尋ねる",
          { show: s => !!$rules.facilities.activeFacility(s, "clinic") },
          [
            1,
            "今日は検査まで踏み切れず、受付でかかる費用と予約の空きだけを尋ねた。財布の中身と相談しながら、いつ受けるか心を決めるしかなかった。",
            {
              exposureAction: "defer-screening",
              facilityAction: {
                kind: "clinic",
                action: "referral",
                description: "鉱石病の検査枠・費用・別の受診先を調べた"
              },
              rl: 1
            }
          ]
        ),
        $terraData.K(
          "通える病院と、そこまでの運賃を調べる",
          { show: s => !$rules.facilities.activeFacility(s, "clinic") },
          [
            1,
            "どの町の病院なら検査を受けられるか、乗り合い馬車や列車の運賃も含めて聞いて回った。すぐには踏み切れず、もう少し金を貯めてから出直すことにした。",
            { exposureAction: "defer-screening", p: -1, rl: 1 }
          ]
        ),
        $terraData.K("今は医者にかからず、布団にくるまって休む", {}, [
          1,
          "恐ろしい病名を宣告されるのが怖くもあり、また金も惜しくて、今日は早く寝床に入った。熱っぽい息を吐きながら天井を見つめた。",
          { exposureAction: "defer-screening", p: -2 }
        ])
      ]
    },
    {
      id: "ori_followup_access",
      conf: "S",
      references: ["SRC_ORI_PURESTREAM_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      w: 0.9,
      cd: 2,
      show: s =>
        s.inf &&
        !s.fl?.dg &&
        Number.isFinite(s.oripathyExposure?.reviewDueYear) &&
        s.oripathyExposure.reviewDueYear <= s.year,
      t: s => {
        const clinic = $rules.facilities.activeFacility(s, "clinic");
        if (!clinic)
          return "前に先送りにした検査のことを思うと、胸の奥が重くなる。相変わらず近くに診療所はなく、遠くの病院へ行く足代と時間をもう一度計算し直した。";
        if (clinic.status === "limited")
          return "先送りにした検査を受けようと思い立ったが、近くの診療所はまだ窓口を絞ったままだった。遠くの受診先を探すか、もう少し待つか迷った。";
        return "先送りにしていた検査から、ずいぶん日が経ってしまった。ごまかしきれない体の重さを抱えながら、診療所の暖簾をくぐるか考えた。";
      },
      c: [
        $terraData.K(
          "これ以上先延ばしにせず、検査を受ける",
          {
            en: { affordableMedicalCash: 3e4 },
            why: "検査代と行き帰りの運賃を合わせると、手元の金では足りない",
            show: s => {
              const clinic = $rules.facilities.activeFacility(s, "clinic");
              return !!clinic && clinic.status !== "limited";
            }
          },
          [
          1,
            "貯めておいた金を握りしめて検査を受け、鉱石病だと告げられた。覚悟はしていたつもりでも、医師から薬の飲み方を聞く声は遠くに響いた。",
            { cash: -3e4, med: 1, exposureAction: "followup", fl: { dg: 1 }, p: -3, k: 1 }
          ]
        ),
        $terraData.K(
          "診療所で別の受付先と費用を確かめる",
          { show: s => !!$rules.facilities.activeFacility(s, "clinic") },
          [
            1,
            "受付でよその検査機関や費用の目安を尋ねた。今日も結局検査は受けられず、次に動ける日を指折り数えた。",
            {
              exposureAction: "followup",
              facilityAction: {
                kind: "clinic",
                action: "referral",
                description: "再相談の時期に診療所の受付と別の受診先を確かめた"
              },
              p: -1
            }
          ]
        ),
        $terraData.K(
          "よその病院までの足代と日程を調べ直す",
          { show: s => !$rules.facilities.activeFacility(s, "clinic") },
          [
            1,
            "遠くの診療所へ通うための運賃と日数をもう一度洗い出した。まだ踏み切るだけの余裕はなく、唇を噛んだ。",
            { exposureAction: "followup", p: -1 }
          ]
        )
      ]
    },
    {
      id: "ori_diagnosed_workplace",
      conf: "S",
      references: ["SRC_ORI_CATHERINE_RECORD", "SRC_ORI_FIELD_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["青年", "壮年", "老年"],
      w: 0.52,
      cd: 7,
      show: s => s.fl?.dg && s.job > 0 && ($terraData.J[s.job]?.ex || 1) > 1.1,
      t: "鉱石病と診断されたあとも、源石の粉塵が舞う現場での仕事は続いていた。体をいたわれば稼ぎが減り、無理をすれば病が進む。毎月の暮らしと自分の体のどこで折り合いをつけるか迫られていた。",
      c: [
        $terraData.K("粉塵の少ない持ち場へ回してもらえないか掛け合う", {}, [
          1,
          "責任者に体調を打ち明け、少しでも粉塵の少ない工程へ移れないか頼み込んだ。返事が出るまでは、マスクを二重にして今の持ち場をしのいだ。",
          { exposureAction: "inspect", rl: 1, k: 1 }
        ]),
        $terraData.K("防護具を念入りに整え、今の持ち場で踏ん張る", {}, [
          1,
          "マスクの隙間や手袋の傷みを毎日自分で確かめ、危ない工程では替えを要求した。定期検診の日だけは休むと決め、現場に立ち続けた。",
          { exposureAction: "protect", p: 1 }
        ]),
        $terraData.K("稼ぎを減らさないため、黙って今の工程を続ける", {}, [
          1,
          "手当てが減るのを恐れて配置換えは言い出さず、粉塵の中へ入っていった。給金袋は守れたが、夜になると咳と鉛のようなだるさが重くのしかかった。",
          { exposureAction: "unsafe", p: 1, h: -2 }
        ])
      ]
    },
    {
      id: "ori_rhodes_examination_contact",
      conf: "S",
      references: ["SRC_ORI_FIELD_RECORD", "SRC_ORI_PURESTREAM_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["青年", "壮年", "老年"],
      w: 0.4,
      once: true,
      show: s => s.fl?.dg && !s.fl?.tx,
      t: "鉱石病の診断は出たものの、通院のたびに飛んでいく薬代と、仕事を抜ける穴埋めが重くのしかかる。近くの診療所で様子を見てもらうか、専門の療養先を探し回るか迷った。",
      c: [
          $terraData.K("近くの診療所で無理のない通院ペースを相談する", {
            show: s => {
              const clinic = $rules.facilities.activeFacility(s, "clinic");
              return !!clinic && clinic.status !== "limited";
            }
          }, [
          1,
          "今の懐事情と体の具合を医師に正直に話し、仕事を休まずに通える診察日を決めた。帰り道、抜けた分の仕事をどう取り返すか頭の中で段取りを組んだ。",
          { exposureAction: "followup", k: 1, rl: 1 }
        ]),
        $terraData.K("鉱石病を専門に診る機関のツテを探す", {}, [
          1,
          "より詳しい検査や治療を受けられる場所がないか、紹介状の手順や連絡先を聞いて回った。",
          { k: 1 }
        ]),
        $terraData.K("まずは今月のやりくりを立て直し、通院は少し待つ", {}, [
          1,
          "食費や家賃の支払いを先に済ませ、財布に少し余裕ができるまで次の受診は先延ばしにすることにした。",
          { p: -1 }
        ])
      ]
    },
    {
      id: "ori_everyday_contact_myth",
      conf: "S",
      references: ["SRC_ORI_JP_OVERVIEW_2026", "SRC_ORIPATHY_SOCIAL"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      w: [0.6, { when: "地域の感染者圧力が強い", x: 1.35 }, { when: "地域の感染者圧力が比較的弱い", x: 0.65 }],
      cd: 9,
      t: "共同の休憩所で、感染者が腰かけていた木の椅子を「うつるから触るな」と避ける連中が出てきた。座面を見ても、源石の粉も血の跡も何ひとつついていない。",
      c: [
        $terraData.K("座面を拭いて見せ、ただの椅子だと周りに言う", {}, [
          1,
          "みんなの前で座面に手を当てて拭いて見せ、「粉も破片もないのに何がうつるんだ」と堂々と腰掛けた。騒いでいた連中は気圧されて口をつぐみ、陰で小さくなっていた感染者の同僚が深く頭を下げてきた。",
          {
            exposureAction: "share",
            socialConflictAction: {
              action: "help",
              target: "infected",
              context: "everyday-contact-rumor-clarification"
            },
            fl: { ed_relief_neighbors: 1 },
            biasInf: -5,
            rl: 4,
            p: 2,
            k: 1,
            equityGain: 6
          }
        ]),
        $terraData.K("医者から聞いた感染の仕組みを伝えてたしなめる", {}, [
          1,
          "診療所で聞いた感染経路の話を一つ一つ挙げ、触れただけで発症するような病ではないと筋道を立てて説明した。騒ぎ立てていた男は顔を真っ赤にして黙り込み、周囲からは感心の声が漏れた。",
          {
            exposureAction: "share",
            socialConflictAction: {
              action: "help",
              target: "infected",
              context: "everyday-contact-rumor-objection"
            },
            k: 4,
            cr: 2,
            biasInf: -3,
            rl: 1,
            equityGain: 5
          }
        ]),
        $terraData.K("くだらない噂には関わらず、休憩所を出る", {}, [
          1,
          "無用な諍いや身元への追及を恐れ、荷物を抱えて早々に部屋を出た。背後で椅子の押し付け合いと嘲笑が続くのを聞きながら、何も言えなかった不甲斐なさと冷たい悔しさを噛み締めた。",
          { p: -2 }
        ]),
        $terraData.K(
          "感染者が使った椅子だけ隅へ退けるよう管理人に頼む",
          {
            show: s =>
              !s.inf &&
              !s.par?.fa?.inf &&
              !s.par?.mo?.inf &&
              s.age >= 14 &&
              (s.biasInfected || 0) >= 35 &&
              (s.biasInfected || 0) < 75,
            pw: [1, { when: "地域の感染者圧力が強い", x: 1.3 }, { when: "地域の感染者圧力が比較的弱い", x: 0.65 }]
          },
          [
            0.65,
            "管理人は面倒そうにその椅子を壁際へ引きずっていった。誰も座らない椅子が一つ、部屋の隅にぽつんと残った。",
            {
              socialConflictAction: {
                action: "exclude",
                target: "infected",
                context: "everyday-contact-rumor-seat-separation"
              },
              biasInf: 3,
              cr: -1
            }
          ],
          [
            1,
            "管理人は「そんなことをしていたらキリがない」と取り合わなかった。居合わせた何人かが、冷ややかな目でこちらを見た。",
            {
              socialConflictAction: {
                action: "exclude",
                target: "infected",
                context: "everyday-contact-rumor-seat-separation"
              },
              biasInf: 2,
              p: -1
            }
          ]
        ),
        $terraData.K(
          "感染者が触れたか確かめず、すべての席を分けるよう管理人に迫る",
          {
            show: s =>
              !s.inf &&
              !s.par?.fa?.inf &&
              !s.par?.mo?.inf &&
              s.age >= 14 &&
              (s.biasInfected || 0) >= 75
          },
          [
            0.65,
            "管理人は根負けして椅子に「使用禁止」の札を貼った。後から入ってきた診療所帰りの住民が、入り口で立ち尽くして空いた席を探していた。",
            {
              socialConflictAction: {
                action: "exclude",
                target: "infected",
                context: "everyday-contact-rumor"
              },
              biasInf: 6,
              rl: -4,
              p: -2
            }
          ],
          [
            1,
            "管理人は要求を突っぱねたが、あなたの声に煽られた何人かが、診療所帰りの住民から露骨に席を離した。",
            {
              socialConflictAction: {
                action: "exclude",
                target: "infected",
                context: "everyday-contact-rumor"
              },
              biasInf: 4,
              p: -2
            }
          ]
        )
      ]
    },
    {
      id: "ori_waterway_cleaning",
      conf: "S",
      references: ["SRC_ORI_PURESTREAM_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["青年", "壮年"],
      w: 0.37,
      once: true,
      show: s =>
        ["炎国", "龍門", "ボリバル", "サルゴン"].includes(s.res.n) && s.local?.kind !== "工業・採掘地域",
      t: "水路の泥さらいの人手が足りないと声がかかった。岸辺の澱みには、腐った布切れに混じって黒く光る粒が溜まっている。どこまで素手で踏み込んでいいものかためらわれた。",
      c: [
        $terraData.K("厚手の手袋と網を借り、怪しいごみを分けて集める", {}, [
          1,
          "肘まであるゴム手袋をはめ、長い網で岸辺のごみを引き上げた。黒い粒が混じる泥だけは別の桶に取り分け、処理係へ引き渡した。",
          { exposureAction: "protect", rl: 2 }
        ]),
        $terraData.K("黒い粒の正体が分かるまで作業を止める", {}, [
          1,
          "水底の黒い粒を指さし、汚水処理の担当者を呼んでくるよう求めた。安全が確かめられるまで、水路へ入るのを控えさせた。",
          { exposureAction: "inspect", k: 1 }
        ]),
        $terraData.K("危険な場所だけ伝え、今日の泥さらいは見送る", {}, [
          1,
          "黒い粒が溜まっている箇所だけを次の当番に詳しく伝え、装備が揃うまでは近づかないよう言い置いて引き上げた。",
          { exposureAction: "avoid", p: 1 }
        ])
      ]
    },
    {
      id: "ori_sarkaz_noncausal",
      conf: "S",
      references: ["SRC_ORI_JP_OVERVIEW_2026", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年", "老年"],
      w: 0.4,
      cd: 11,
      show: s =>
        !!s.job && (s.r?.n === "サルカズ" || s.res.n === "カズデル"),
      t: "仕事場の休憩中、誰かが「サルカズは生まれつき鉱石病になりやすい血なんだろう」と知った風な口をきいた。周りに感染した仲間が多いのは確かだが、みんながどれだけ劣悪な現場で源石の粉を浴びてきたかは棚に上げられている。",
      c: [
        $terraData.K("血筋ではなく、どんな現場で働かされてきたかを問い返す", {}, [
          1,
          "防塵マスクもなしに源石を扱わせる現場の話を突きつけ、「生まれのせいにするな」と声を返した。場の空気は引き締まった。",
          { exposureAction: "share", k: 2, rl: 1 }
        ]),
        $terraData.K("噂には取り合わず、自分の防護具を点検する", {}, [
          1,
          "無知な噂話は無視して手袋の縫い目とマスクを確かめ、風が通る場所で息をついた。",
          { exposureAction: "protect", k: 1 }
        ]),
        $terraData.K("「そんな話の根拠は知らない」とだけ言って聞き流す", {}, [
          1,
          "短く突き放して作業へ戻ったが、血筋のせいにする無責任な声はしばらく耳の奥でざらついていた。",
          { p: 0 }
        ])
      ]
    },
    {
      id: "ori_medical_record_followup",
      conf: "S",
      references: ["SRC_ORI_CATHERINE_RECORD", "SRC_ORI_PURESTREAM_RECORD"],
      st: ["青年", "壮年", "老年"],
      w: 0.44,
      cd: 7,
      show: s => s.fl?.dg,
      t: "定期の診察で、医師から「これまでどんな現場で働き、どんな土地で暮らしてきたか」を詳しく聞かれた。どの年のどの仕事で源石を吸い込んだのか、遠い記憶をたぐり寄せた。",
      c: [
        $terraData.K("これまで経てきた仕事場と暮らしぶりを詳しく話す", {}, [
          1,
          "昔いた土地や現場の環境、防護具があったかどうかを思い出す限り医師に伝え、カルテに書き添えてもらった。",
          { exposureAction: "document", k: 1 }
        ]),
        $terraData.K("今の体調の波と、次の検査日だけを確かめる", {}, [
          1,
          "過ぎたことよりこれからの養生に話を絞り、体調が崩れやすい季節と次の検査日を医師とすり合わせた。",
          { exposureAction: "followup", p: 1 }
        ]),
        $terraData.K(
          "診察で聞いた病状を、家族に正直に打ち明ける",
          { show: { any: ["親存命", "既婚", "子あり", "兄弟あり"] } },
          [
            1,
            "家へ帰ったあと、医師から言われた今の病状とこれからの通院について、飾らない言葉で家族に打ち明けた。",
            {
              infectionAwarenessAction: {
                subject: "self",
                audience: "family",
                certainty: "confirmed",
                source: "self-disclosure",
                consent: "voluntary"
              },
              rl: 2
            }
          ]
        )
      ]
    },
    {
      id: "ori_protection_after_displacement",
      conf: "S",
      references: ["SRC_ORI_JP_OVERVIEW_2026", "SRC_LIFE_ENDING_CANON"],
      st: ["少年", "青年", "壮年", "老年"],
      w: 0.58,
      once: true,
      show: s => !!(s.fl?.disaster_displaced || s.fl?.war_displaced || s.fl?.kazdel_displaced),
      t: "避難先の仮宿でやっと荷をほどいたとき、家から持ち出した商売道具の隙間に、黒く光る破片が食い込んでいるのに気づいた。削り落として使い続けるか、泣く泣く捨てるか迷った。",
      c: [
        $terraData.K("危ない道具を別にして、避難所の係員に処理を頼む", {}, [
          1,
          "無事な荷物と分けて包み、係員に診てもらった。処分が決まるまでのあいだ、手元の道具が一つ足りないまま不自由な暮らしをしのいだ。",
          { exposureAction: "inspect", rl: 1 }
        ]),
        $terraData.K("怪しい道具には手を触れず、安全な荷だけで寝床を作る", {}, [
          1,
          "黒い破片がついた道具は箱の奥に封じ込め、汚れのない毛布と鍋釜だけで今夜の寝床を整えた。",
          { exposureAction: "avoid", p: -1 }
        ]),
        $terraData.K("誰のどの荷物に破片がついていたか確かめ合う", {}, [
          1,
          "一緒に逃げてきた周囲の人たちと荷物を改め、どの通りを抜けたときに破片を浴びたのか確かめ合った。",
          { exposureAction: "document", rl: 1 }
        ])
      ]
    },
    {
      id: "ori_prevention_peer_teaching",
      conf: "S",
      references: ["SRC_ORI_WINDSCOOT_RECORD", "SRC_ORI_HUMUS_RECORD"],
      st: ["青年", "壮年", "老年"],
      w: 0.48,
      once: true,
      show: s =>
        (s.oripathyExposure?.history || []).some(x => ["protect", "inspect", "avoid"].includes(x.kind)) &&
        s.age >= 18,
      t: "危険な現場へ新しく入るという知人から、「どんな防塵マスクや手袋を選べば身を守れるのか」と相談された。自分とは違う職場らしく、まずは相手が何を扱う現場なのかを聞き出した。",
      c: [
        $terraData.K("自分の知る鉄則を教え、現場の安全係にも聞くよう勧める", {}, [
          1,
          "粉塵の粒の細かさや手袋の選び方を教えたうえで、現場ごとの決まりは必ず古株や安全係に確かめるよう念を押した。",
          { exposureAction: "share", rl: 2, k: 1 }
        ]),
        $terraData.K("知人が持ち込む装備を一緒に点検してやる", {}, [
          1,
          "知人が買ってきた中古のマスクと手袋を光に透かし、ゴムの劣化や縫い目のほつれを一緒に見分けた。",
          { exposureAction: "protect", rl: 1 }
        ]),
        $terraData.K("よその現場のことは請け合えないと断り、自分の経験だけ話す", {}, [
          1,
          "生半可なことを言って怪我をさせてはならないと前置きし、自分がこれまで見てきた事故の例だけを話して聞かせた。",
          { exposureAction: "document", p: 1 }
        ])
      ]
    }
  );

  $terraData.EV.push(
    {
      id: "ori_victoria_factory_shift",
      conf: "S",
      references: ["SRC_ORI_CATHERINE_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["青年", "壮年"],
      w: 0.47,
      once: true,
      show: s => s.res.n === "ヴィクトリア" && s.local?.kind === "工業・採掘地域" && s.job > 0,
      t: "ヴィクトリアの工場で長い交代番を終えたとき、作業着の袖口にきらりと黒く光る粉が付いているのに気づいた。班長に問い質しても、どのラインから漏れたのか分からないと首をかしげるばかりだった。",
      c: [
        $terraData.K("どの工程で浴びたか洗い出し、清掃とマスクの交換を迫る", {}, [
          1,
          "今日回った持ち場を一つずつ辿り、粉が漏れている箇所を突き止めて責任者に掃除と予備のマスクを出させた。",
          { exposureAction: "inspect", k: 1, cr: 1 }
        ]),
        $terraData.K("作業着を袋に封じ、検査係の判定を待つ", {}, [
          1,
          "汚れた作業着を家へ持ち帰らないよう別の袋に封じ込め、工場の検査係を捕まえて源石粉かどうか調べるよう頼み込んだ。",
          { exposureAction: "protect", k: 1 }
        ]),
        $terraData.K("その日は作業着をロッカーに隔離し、次の番で掛け合う", {}, [
          1,
          "素手で触れないよう作業着をロッカーの隅に押し込み、次の交代番が入る前に誰が現場を点検するのか班長に食い下がった。",
          { exposureAction: "avoid", p: -1 }
        ])
      ]
    },
    {
      id: "ori_columbia_insurance_records",
      conf: "S",
      references: ["SRC_COLUMBIA_INSURANCE", "SRC_COLUMBIA_DV5", "SRC_ORI_GAME_MODEL_V3"],
      st: ["青年", "壮年", "老年"],
      w: 0.48,
      once: true,
      show: s => s.res.n === "クルビア" && s.fl?.dg,
      t: "鉱石病の診断が出たあと、クルビアの保険窓口へ治療費の補助が出るか掛け合いに行った。担当者が広げた約款には小さな文字で除外条項が並び、結局いくらの薬代が下りるのか一目ではまるで分からなかった。",
      c: [
        $terraData.K("窓口で食い下がり、どの薬や検査に補助が出るのか詰め寄る", {}, [
          1,
          "専門用語を並べる担当者に一つずつ噛み砕いて説明させ、自分の自己負担額がいくらになるのかをはっきり計算してから帰った。",
          { exposureAction: "document", k: 2, cr: 1 }
        ]),
        $terraData.K("保険が効かなくても通える、安い診療所を探す", {}, [
          1,
          "当てにならない保険に見切りをつけ、少し遠くても安く薬を出してくれる診療所や互助の窓口を探し回った。",
          { exposureAction: "document", k: 1, p: -1 }
        ]),
        $terraData.K("契約書に詳しい知人に頼み、約款の抜け道を探る", {}, [
          1,
          "書類仕事に強い知人と頭を突き合わせて約款を読み解き、窓口に突っぱねられないための申請の書き方を練り直した。",
          { exposureAction: "share", rl: 2 }
        ])
      ]
    },
    {
      id: "ori_laterano_citizenship_record",
      conf: "S",
      references: ["SRC_LATERANO_ARENE", "SRC_LATERANO_CIVIC", "SRC_ORI_GAME_MODEL_V3"],
      st: ["青年", "壮年", "老年"],
      w: 0.34,
      once: true,
      show: s =>
        s.res.n === "ラテラーノ" &&
        s.fl?.dg &&
        s.legal?.citizenshipCountry === "ラテラーノ" &&
        s.legal?.status === "recorded",
      t: "鉱石病の診断が下りたあと、ラテラーノの市民窓口でこのまま街に暮らせるのか尋ねた。正規の市民登録があっても、感染者がいつまで留まれるのか、係員は歯切れの悪い返事を繰り返すばかりだった。",
      c: [
        $terraData.K("街に残れる特例や申し立ての手順を食い下がって尋ねる", {}, [
          1,
          "特例審査の仕組みがないか窓口で粘ったが、はっきりした基準も日数も明かされないまま、冷たい大理石の廊下へ押し出された。",
          { exposureAction: "document", k: 2, p: -2 }
        ]),
        $terraData.K("外の土地にいる身内に連絡し、身を寄せられるか相談する", {}, [
          1,
          "もし退去を命じられた時に備え、外の街で暮らす親族に手紙を出した。まだ返事はなく、自分がどこへ行くことになるのかも見えない。",
          { exposureAction: "share", rl: 2, p: -2 }
        ]),
        $terraData.K("いざという時のために、自分の診断記録の写しを取っておく", {}, [
          1,
          "どの街へ移ることになっても治療を続けられるよう、診療所からこれまでの検査結果の写しだけを受け取って懐に収めた。",
          { exposureAction: "document", k: 1 }
        ])
      ]
    },
    {
      id: "ori_ursus_mine_request",
      conf: "S",
      references: ["SRC_URSUS_INFECTED", "SRC_ORI_GAME_MODEL_V3"],
      st: ["青年", "壮年"],
      w: 0.36,
      once: true,
      show: s => s.res.n === "ウルサス" && s.local?.kind === "工業・採掘地域" && s.job > 0,
      t: "交代の鐘が鳴るまであと一時間というところで、修理に出した防塵マスクがまだ戻ってこないと言われた。予備の装備も底をついているが、ここで持ち場を離れれば今日の日当を削られると仲間たちが暗い顔で囁き合っていた。",
      c: [
        $terraData.K("仲間と声を揃え、マスクが揃うまで坑道に入らないと掛け合う", {}, [
          1,
          "作業仲間と肩を並べて監督に詰め寄り、壊れた装備の山を突きつけた。日当は渋られたが、その日は外の荷運びへ回されることになった。",
          { exposureAction: "inspect", rl: 2, p: -2 }
        ]),
        $terraData.K("日当が減るのを飲んででも、粉塵の少ない外の作業へ回る", {}, [
          1,
          "命には代えられないと割り切り、その日は粉塵の少ない表の雑用へ回してもらった。帰り際、削られた日当の額を聞いてため息が出た。",
          { exposureAction: "protect", p: -1 }
        ]),
        $terraData.K("こんな現場には見切りをつけ、よその働き口を探し始める", {}, [
          1,
          "防護具すらまともに配られない現場に愛想が尽き、その日の仕事が終わるなり、よその工場の募集を探して通りを歩いた。",
          { exposureAction: "document", k: 1, p: -2 }
        ])
      ]
    },
    {
      id: "ori_rim_mine_inspection",
      conf: "S",
      references: ["SRC_RIM_WORK", "SRC_ORI_HUMUS_RECORD"],
      st: ["青年", "壮年", "老年"],
      w: 0.43,
      once: true,
      show: s =>
        s.res.n === "レム・ビリトン" &&
        s.job > 0 &&
        (s.local?.kind === "工業・採掘地域" || $terraData.J[s.job]?.ex > 1.3),
      t: "レム・ビリトンの古い採掘跡へ調査に入るチームから、閉鎖された坑道の様子を聞かれた。当時の図面を広げてみたものの、崩落や源石粉塵の溜まり具合は昔とはまるで変わっているはずだった。",
      c: [
        $terraData.K("天災予報と坑内の換気記録を突き合わせ、退避ルートを決める", {}, [
          1,
          "最近の天災の動きと通気孔の図面を照らし合わせ、万が一のときに逃げ込める縦坑と必要な防塵装備を叩き込んだ。",
          { exposureAction: "protect", k: 2 }
        ]),
        $terraData.K("古株の坑夫を伴い、安全な手前の区画だけに調査を絞る", {}, [
          1,
          "昔の坑道を知るベテランと一緒に足元を確かめ、風が淀んでいる奥の区画には決して踏み込まないよう縄を張った。",
          { exposureAction: "avoid", rl: 2 }
        ]),
        $terraData.K("図面に危険な崩落箇所だけを示し、無理な進入を止めさせる", {}, [
          1,
          "源石の粉が吹き溜まりやすい窪地を図面に赤く塗りつぶし、今日は手前の標本だけを採って引き返すよう調査班を説得した。",
          { exposureAction: "document", k: 1 }
        ])
      ]
    },
    {
      id: "ori_sargon_sandstorm_check",
      conf: "S",
      references: ["SRC_ORI_TUYE_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["青年", "壮年"],
      w: 0.32,
      once: true,
      show: s => s.res.n === "サルゴン" && s.local?.ecology === "乾燥地・オアシス",
      t: "サルゴンの乾いた風がうなりを上げ、砂嵐の気配が濃くなってきた。出発の時刻は迫り、同行者は目と口を幾重にも布で覆っている。このまま荷を出せば、風に混じる源石の砂塵をまともに浴びかねない。",
      c: [
        $terraData.K("積荷の覆いを二重にし、風よけの岩陰を繋ぐ道を選ぶ", {}, [
          1,
          "荷崩れしないようロープを締め直し、砂塵をやり過ごせる岩陰や中継地を同行者と確かめ合ってから踏み出した。",
          { exposureAction: "protect", k: 1 }
        ]),
        $terraData.K("納期が遅れても、砂嵐が通り過ぎるまで出発を待つ", {}, [
          1,
          "同行者と頷き合い、無茶な出発を取りやめて宿場に留まった。荷の到着は遅れたが、黒い砂塵に巻かれずに済んだ。",
          { exposureAction: "avoid", p: -1 }
        ]),
        $terraData.K("砂溜まりの危険な箇所を確かめ、後から来る隊に知らせる", {}, [
          1,
          "風向きで砂が深く溜まる谷筋を確かめ、後から出発するキャラバンの連中にそこを避けるよう声をかけて回った。",
          { exposureAction: "document", rl: 1 }
        ])
      ]
    },
    {
      id: "ori_iberia_origin_doubt",
      conf: "S",
      references: ["SRC_ORI_JP_OVERVIEW_2026", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      w: 0.32,
      once: true,
      show: s => s.res.n === "イベリア",
      t: "イベリアの港で、「よそから来た荷役夫が鉱石病を持ち込んだ」と根も葉もない噂が立った。現場監督はそいつを次の番から外そうとしているが、実際にどの船の積荷から源石の粉が漏れていたかは誰も調べていなかった。",
      c: [
        $terraData.K("人を外す前に、まず船倉と資材を点検しろと声を上げる", {}, [
          1,
          "「犯人探しより先に荷を調べろ」と監督に食い下がり、荷役の割り振りをいったん止めさせて倉庫の点検に回らせた。",
          { exposureAction: "inspect", k: 2 }
        ]),
        $terraData.K("よそ者への疑いを遮り、どの船荷が破れていたか荷札を辿る", {}, [
          1,
          "根拠のない噂話を制し、監督と一緒に積荷の台帳をめくって、源石資材を積んでいた船の荷口を突き止めた。",
          { exposureAction: "share", biasInf: -2, rl: 1 }
        ]),
        $terraData.K("騒ぎに巻き込まれる前に、自分の持ち場の安全を確かめる", {}, [
          1,
          "噂話からは距離を置き、自分の扱う木箱と手袋に怪しい粉がついていないか念入りに確かめた。",
          { exposureAction: "protect", k: 1 }
        ])
      ]
    },
    {
      id: "ori_crystal_wound_accident",
      conf: "S",
      references: ["SRC_ORI_MINT_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["少年", "青年", "壮年"],
      w: 0.24,
      once: true,
      show: s => !s.inf && s.age >= 12 && (s.local?.kind === "工業・採掘地域" || s.local?.hazard > 0.75),
      t: "作業場の腐った床板が踏み抜かれ、床下に溜まっていた黒い結晶片が辺りに散らばった。片づけを命じられた作業員が素手に近い格好でしゃがみ込もうとしている。すぐそばにいたあなたは、どう動くか迷った。",
      c: [
        $terraData.K("「素手で触るな」と制し、専門の清掃班を呼ぶ", {}, [
          1,
          "作業員の肩を掴んで引き戻し、防護具を持った処理係を大声で呼んだ。道具が届くまで誰も近づけないよう見張った。",
          { exposureAction: "avoid", rl: 1 }
        ]),
        $terraData.K("長い柄のシャベルと箒を渡し、離れた場所から手伝う", {}, [
          1,
          "直接手を伸ばさないよう長柄の道具を差し出し、周囲の人間を遠ざけて風の通る道を開けた。",
          { exposureAction: "avoid", rl: 2 }
        ]),
        $terraData.K(
          "手元の作業手袋のまま、一緒にかき集めようとする",
          {},
          [
            0.16,
            "布の手袋が鋭い断面で裂け、指先に走った浅い傷口へ黒い源石片が食い込んだ。数週間後、消えない熱とともに鉱石病の診断が下った。",
            { inf: 1, infCause: "破損した手袋越しに源石片で皮膚を損傷", infectionRoute: "wound", fl: { dg: 1 }, h: -5, p: -6 }
          ],
          [
            1,
            "破片を掴んだ拍子に手袋の表面がスッと裂けた。背筋が凍りついて即座に手を引っ込め、間一髪で傷を負わずに済んだ。",
            { exposureAction: "document", p: -1 }
          ]
        )
      ]
    },
    {
      id: "ori_dust_broken_ppe",
      conf: "S",
      references: ["SRC_ORI_HUMUS_RECORD", "SRC_ORI_GAME_MODEL_V3"],
      st: ["青年", "壮年"],
      w: 0.22,
      once: true,
      show: s => !s.inf && s.job > 0 && ($terraData.J[s.job]?.ex || 1) > 1.25,
      t: "運び終えたばかりの機械部品に、源石の粉がべっとり付着していたことが分かり、現場が騒然となった。慌てて自分の防護服を見ると、脇の縫い目がほつれて口を開けている。いつから破れていたのか見当もつかない。",
      c: [
        $terraData.K("直ちに手を止め、無傷の防護具と取り替えさせる", {}, [
          1,
          "ほつれた防護服をその場で脱ぎ捨て、新しい装備が届くまで作業を拒んだ。工程は遅れたが、自分の肺を黒い粉から守った。",
          { exposureAction: "protect", p: -1 }
        ]),
        $terraData.K("同じ装備を使った仲間を洗い出し、一緒に診療所へ走る", {}, [
          1,
          "破れた防護具を着回していた仲間の名を確かめ合い、その足で診療所へ駆け込んで検査の相談をした。帰ってからも作業着は別にして洗った。",
          { exposureAction: "inspect", k: 1 }
        ]),
        $terraData.K(
          "ほつれを指で押さえながら、残りの片づけを終わらせる",
          {},
          [
            0.12,
            "わずかな隙間から黒い粉塵を吸い込んでいたらしく、数日後から咳が止まらなくなった。診療所で告げられたのは、鉱石病への感染だった。",
            {
              inf: 1,
              infCause: "源石粉塵で汚染された部品を不十分な装備で取り扱った", infectionRoute: "dust",
              fl: { dg: 1 },
              h: -3,
              p: -4
            }
          ],
          [
            1,
            "どうにか片づけは終えたものの、喉の奥のざらつきが怖くなって診療所へ駆け込んだ。幸い感染はしていなかったが、二度とあんな無茶はしないと心に誓った。",
            { exposureAction: "document", p: -2 }
          ]
        )
      ]
    }
  );
});
