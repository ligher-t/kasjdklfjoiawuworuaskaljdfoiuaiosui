// health/mortality: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("health/mortality", function ($terraData, $define, $rules) {
  "use strict";
  $define("LIFE_END_REFS", ["SRC_LIFE_ENDING_GAME", "SRC_LIFE_ENDING_LW03", "SRC_LIFE_ENDING_LW02"], false);

  $define(
    "MEO",
    (id, kind, phase, extra = {}) => ({
      id,
      conf: "S",
      references: $terraData.LIFE_END_REFS,
      st: ["幼児", "児童", "少年", "青年", "壮年", "老年"],
      w: 0.7,
      cd: 2,
      show: s =>
        !!s.mortality?.episodes?.some(
          x =>
            x.kind === kind && x.status === "active" && x.severity >= phase && x.lastDecisionYear !== s.year
        ),
      ...extra
    }),
    false,
    true
  );

  $terraData.EV.push(
    {
      ...$terraData.MEO("life_medical_respiratory", "respiratory", 1),
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      t: "浅い息をするたびに胸の奥がヒューヒューと鳴り、熱が幾日も引かない。朝起き上がれずに仕事や外の用事を休んだまま、診療所までの足代と手元の小銭を数えた。",
      c: [
        $terraData.K(
          "金を工面して診療所で診てもらう",
          { en: { affordableMedicalCash: 3e4 }, why: "診療と交通に必要な費用を用意できない" },
          [
            1,
            "胸の音を聴いてもらい、熱と咳を鎮める薬を受け取った。あと数日は無理に動かないよう釘を刺された。",
            { cash: -3e4, med: 1, mortalityCare: { kind: "respiratory", action: "clinic" }, h: 2 }
          ]
        ),
        $terraData.K("家の者に外の用事を頼み、布団で息を整える", {}, [
          1,
          "とても外へ出られる体ではないと伝え、急ぎの買い出しを代わってもらった。湿った毛布にくるまり、荒い息が静まるのを待った。",
          { mortalityCare: { kind: "respiratory", action: "rest" }, rl: 1 }
        ]),
        $terraData.K("熱と咳の様子を見ながら、診てもらえる機会を待つ", {}, [
          1,
          "すぐには金を出せず、白湯をすすって喉を潤しながら、少しでも安く診てもらえる施療の日を調べた。",
          { mortalityCare: { kind: "respiratory", action: "watch" } }
        ])
      ]
    },
    {
      ...$terraData.MEO("life_medical_circulation", "circulatory", 1),
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      t: "階段や坂を上るたびに心臓が早鐘を打ち、胸の奥を掴まれたように足が止まる。腰を下ろして息をついても、鉛のような重苦しさがなかなか消えない。",
      c: [
        $terraData.K(
          "診療所で胸の苦しさを診てもらう",
          { en: { affordableMedicalCash: 4e4 }, why: "診療費と移動費が足りない" },
          [
            1,
            "どんな動きで動悸が跳ね上がるかを医師に伝え、脈と胸を調べてもらった。次の診察日を決めて帰途についた。",
            { cash: -4e4, med: 1, mortalityCare: { kind: "circulatory", action: "clinic" } }
          ]
        ),
        $terraData.K("重い荷や急ぎ足をやめ、体をいたわる", {}, [
          1,
          "無理に荷物を抱えるのをやめ、動悸が鎮まるまで木陰や椅子で休むようにした。胸の奥の違和感は、それでも時折顔を出した。",
          { mortalityCare: { kind: "circulatory", action: "rest" }, p: 1 }
        ])
      ]
    },
    {
      ...$terraData.MEO("life_medical_nerve", "vascular", 1),
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      t: "ふいに視界がぐらりと揺れ、片方の手足からすっと力が抜けた。路地の壁に慌てて手をつき、冷たい石の感触にすがりながらめまいが引くのを待った。",
      c: [
        $terraData.K(
          "すぐに医療者へ連絡して診てもらう",
          { en: { affordableMedicalCash: 5e4 }, why: "搬送や相談の費用を用意できない" },
          [
            1,
            "ただ事ではないと感じ、車を呼んで診療所へ駆け込んだ。手足のしびれが始まった時刻を伝え、そのまま処置を受けた。",
            { cash: -5e4, med: 1, mortalityCare: { kind: "vascular", action: "emergency" } }
          ]
        ),
        $terraData.K("一人で歩くのをやめ、頼れる人に肩を貸してもらう", {}, [
          1,
          "通りがかりや家の者に助けを求め、診療所まで付き添ってもらえるよう頼んだ。壁に背を預けたまま、指先の感覚を確かめた。",
          { mortalityCare: { kind: "vascular", action: "support" }, rl: 2 }
        ])
      ]
    },
    {
      ...$terraData.MEO("life_medical_occupational", "occupational", 1),
      t: "現場に出た日に限って咳と倦怠感がひどくなり、休みの日には少し和らぐ。埃っぽい工程を終えて外へ出ても、喉の奥にざらついた息苦しさが残っていた。うなりを上げる換気扇を見上げながら、どうするか考えた。",
      c: [
        $terraData.K("現場の換気や防塵マスクの支給を掛け合う", {}, [
          1,
          "同じ工程で咳き込んでいる仲間と声を合わせ、換気口の掃除とマスクの交換を責任者に頼み込んだ。",
          {
            mortalityCare: { kind: "occupational", action: "safety" },
            lifeSkill: {
              id: "work-health-observation",
              title: "作業環境と体調の記録",
              delta: 1,
              context: "不調と作業条件を記録した"
            }
          }
        ]),
        $terraData.K(
          "粉塵のきつい仕事を減らし、診療所へ通う",
          { en: { affordableMedicalCash: 3e4 }, why: "診療の費用が足りない" },
          [
            1,
            "稼ぎが減るのは痛いが、肺を潰しては元も子もない。シフトを減らしてもらい、診療所で喉と胸を診てもらった。",
            { cash: -3e4, med: 1, mortalityCare: { kind: "occupational", action: "clinic" }, h: 1 }
          ]
        ),
        $terraData.K("どの工程で咳が出るか確かめながら、だましだまし働く", {}, [
          1,
          "濡らした布で口元を覆い、特に埃の舞う作業のあとは外気を吸うようにした。夜になると、やはり乾いた咳がぶり返した。",
          { mortalityCare: { kind: "occupational", action: "watch" } }
        ])
      ]
    },
    {
      ...$terraData.MEO("life_medical_injury", "injury", 1),
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      t: "表の傷口はふさがったのに、重い物を持ち上げると奥が鋭く疼く。帰り道でも痛みに足を引きずり、何度か立ち止まって息をついた。",
      c: [
        $terraData.K(
          "診療所で傷の奥を診てもらい、体の動かし方を聞く",
          { en: { affordableMedicalCash: 3e4 }, why: "診療費の準備ができない" },
          [
            1,
            "どの角度で力を入れると痛むかを医師に診てもらい、添え木や晒の巻き方、仕事を続ける上での加減を教わった。",
            { cash: -3e4, med: 1, mortalityCare: { kind: "injury", action: "clinic" } }
          ]
        ),
        $terraData.K("痛む側をかばい、荷物を小分けにして運ぶ", {}, [
          1,
          "一度に抱え込むのをやめ、時間をかけて少しずつ運ぶようにした。冷える夜には、まだ古傷が鈍く疼いた。",
          { mortalityCare: { kind: "injury", action: "rest" }, rl: 1 }
        ])
      ]
    },
    {
      ...$terraData.MEO("life_medical_nutrition", "nutrition", 1),
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      t: "一日の食事を一度に減らす日が続き、朝起きても手足に力が入らない。空腹をごまかすために水ばかり飲みながら、戸棚の奥に残ったわずかな乾物を数えた。",
      c: [
        $terraData.K("恥を忍んで、近所の人に食べ物の融通や炊き出しを尋ねる", {}, [
          1,
          "顔なじみの隣人に台所事情を打ち明けると、芋をいくつか分けてくれ、安く屑野菜が手に入る店を教えてくれた。",
          { mortalityCare: { kind: "nutrition", action: "support" }, rl: 2 }
        ]),
        $terraData.K("他の支払いを後回しにしてでも、まず食べる物を買う", {}, [
          1,
          "このままでは倒れて働けなくなる。雑費を極限まで削り、腹にたまる穀物と豆を買い足して熱い粥を煮た。",
          { mortalityCare: { kind: "nutrition", action: "nutrition" }, p: 1 }
        ])
      ]
    },
    {
      ...$terraData.MEO("life_medical_oripathy", "oripathy", 1, {
        show: s =>
          !!s.inf &&
          !!s.mortality?.episodes?.some(
            x => x.kind === "oripathy" && x.status === "active" && x.lastDecisionYear !== s.year
          )
      }),
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      t: "鉱石病の疼きと重だるさが年々深まり、昔なら一気に片づいた仕事にも何度も息継ぎが要るようになった。次の抑制薬を買う金と診察の日取りを思い浮かべ、ため息をついた。",
      c: [
        $terraData.K(
          "苦しい家計をやりくりしてでも、診察と投薬を続ける",
          { en: { affordableMedicalCash: 3e4 }, why: "相談と移動に必要な費用を用意できない" },
          [
            1,
            "診療所で結晶の広がり具合を診てもらい、新しい抑制薬を受け取った。財布は軽くなったが、これでまたしばらくは動ける。",
            { cash: -3e4, med: 1, mortalityCare: { kind: "oripathy", action: "clinic" }, fl: { tx: 1 } }
          ]
        ),
        $terraData.K("体が鉛のように重い日は無理をせず、作業を翌日へ回す", {}, [
          1,
          "発作の前触れのようなだるさを感じ、その日の力仕事を打ち切って横になった。家族や仲間にも、無理のできない日があると伝えた。",
          { mortalityCare: { kind: "oripathy", action: "rest" }, rl: 2 }
        ]),
        $terraData.K("袖口で結晶を隠し、痛みをこらえて普段通りに振る舞う", {}, [
          1,
          "厚手の布で患部をきつく巻き、薬代を惜しんで受診を先送りにした。夜、布を解くと皮膚の下が熱を持ったように疼いていた。",
          { mortalityCare: { kind: "oripathy", action: "watch" }, p: -2 }
        ])
      ]
    },
    {
      id: "life_medical_urgent_review",
      conf: "S",
      references: $terraData.LIFE_END_REFS,
      st: ["幼児", "児童", "少年", "青年", "壮年", "老年"],
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      pri: true,
      cd: 1,
      w: 1.0,
      show: s => $rules.mortality.urgentEpisodes(s).length > 0 || $rules.mortality.healthCriticalNeedsReview(s),
      t: "体を起こすだけでも力が続かず、食事や身の回りのことにも手が要る。診療を急ぐか、看病や休息を頼むか、これからの過ごし方を考えた。",
      c: [
        $terraData.K(
          "診療所へ運び、急な診察と手当を受ける",
          {
            show: s => {
              const clinic = $rules.facilities.activeFacility(s, "clinic");
              return !!clinic && clinic.status !== "limited";
            },
            en: { affordableMedicalCash: 5e4 },
            why: "急な相談・搬送にかかる費用を用意できない"
          },
          [
            1,
            "診療所で状態を伝え、急な診察と手当を受けた。帰りは休みながら移動し、しばらく体を休めることにした。",
            { cash: -5e4, med: 1, mortalityCare: { kind: "urgent", action: "emergency" }, h: 2 }
          ]
        ),
        $terraData.K(
          "身近な人に看病や水・食事の手助けを頼む",
          { show: s => !!(s.sp || s.kids?.length || s.personTies?.length || s.siblings?.length || s.par?.fa || s.par?.mo) },
          [
            1,
            "身近な人へ、水や食事、移動の手助けを頼んだ。できる範囲を相談し、無理な用事はいったん取りやめた。",
            { mortalityCare: { kind: "urgent", action: "support" }, rl: 3 }
          ]
        ),
        $terraData.K("外の用事を止め、寝床で休む", {}, [
          1,
          "急ぎでない用事を断り、水を手元に置いて横になった。先のことは決めず、その日は体を休めた。",
          { mortalityCare: { kind: "urgent", action: "rest" }, p: -1 }
        ]),
        $terraData.K(
          "苦痛を和らげる支援も望むと記録する",
          { show: s => s.age >= $rules.parameters.value("life.adultStartAge") && s.h <= 0 && s.mortality?.healthCritical?.status === "active" && s.mortality.healthCritical.palliativePreferenceYear == null },
          [
            1,
            "痛みや息苦しさを和らげる支援も望んでいると書き残した。病気を治す手立てを相談することと、苦痛を軽くする支援を求めることを、これからの希望として分けて考えた。",
            { mortalityCare: { kind: "urgent", action: "palliative" }, p: 2 }
          ]
        )
      ]
    },
    {
      id: "life_medical_followup",
      conf: "S",
      references: $terraData.LIFE_END_REFS,
      st: ["児童", "少年", "青年", "壮年", "老年"],
      w: 0.85,
      cd: 2,
      show: s =>
        !!s.mortality?.episodes?.some(
          x =>
            x.status === "active" &&
            x.careUntilYear != null &&
            x.careUntilYear <= s.year &&
            x.lastDecisionYear !== s.year
        ),
      t: "前回の診察で言われた再診の時期がやってきた。薬の残りも心もとない。診察代と通院の段取りを、家の者と相談した。",
      c: [
        $terraData.K(
          "診療所へ行き、その後の経過を診てもらう",
          {
            show: s => {
              const clinic = $rules.facilities.activeFacility(s, "clinic");
              return !!clinic && clinic.status !== "limited";
            },
            en: { affordableMedicalCash: 3e4 },
            why: "再診費と交通費が足りない"
          },
          [
            1,
            "医師にこの数か月の体調を話し、薬の量を調整してもらった。まだ油断はできないが、対処の仕方がはっきりした。",
            { cash: -3e4, med: 1, mortalityCare: { kind: "priority", action: "clinic" } }
          ]
        ),
        $terraData.K("身近な人と、通院の付き添いや日々の手助けを相談する", {}, [
          1,
          "具合の悪い日に誰が家事や移動を手伝うかを話し合い、無理なく療養を続けられるよう暮らしの役割を組み直した。",
          { mortalityCare: { kind: "priority", action: "support" }, rl: 1 }
        ])
      ]
    },
    {
      id: "life_mental_crisis_support",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_LIFE_ENDING_LW02"],
      st: ["少年", "青年", "壮年", "老年"],
      cd: 3,
      w: 1.0,
      pri: true,
      show: s =>
        s.age >= 14 &&
        s.mortality?.crisis?.status === "active" &&
        (s.mortality.crisis.consultCount || 0) === 0 &&
        s.mortality.crisis.lastDecisionYear !== s.year,
      t: "幾晩もまともに眠れず、人の声や視線に触れるだけで胸が苦しくなる。食事や用事も手につかない日が続き、このまま一人で抱えるか、誰かに今の状態を伝えるか考えた。",
      c: [
        $terraData.K("心を許せる相手に、今の苦しさを打ち明ける", {
          show: s => !!(s.sp || (s.kids && s.kids.length > 0) || (s.personTies && s.personTies.length > 0) || (s.siblings && s.siblings.length > 0) || (!s.fl?.household_separated && (s.par?.fa || s.par?.mo)))
        }, [
          1,
          "途切れ途切れでも今の状態を伝えた。相手と、苦しくなった時に声をかけることと、一人で抱え込まないことを決めた。",
          { mortalityCare: { kind: "crisis", action: "support" }, rl: 3, p: 2 }
        ]),
        $terraData.K(
          "診療所や相談窓口へ行き、今までの経過を話す",
          { en: { affordableMedicalCash: 2e4 }, why: "移動と相談に必要な費用が足りない" },
          [
            1,
            "窓口で眠れない日や食事が取れない日のことを話し、今後の相談先と、次に苦しくなった時の連絡方法を確かめた。",
            { cash: -2e4, med: 1, mortalityCare: { kind: "crisis", action: "clinic" }, p: 3 }
          ]
        ),
        $terraData.K("今日の予定を止め、食事と休息を優先する", {}, [
          1,
          "急ぎでない用事を断り、水分と食べられる物を少しずつ取りながら横になった。今日は先のことを決めず、身体を休めることにした。",
          { mortalityCare: { kind: "crisis", action: "rest" }, p: 1 }
        ])
      ]
    },
    {
      id: "life_mental_crisis_recurrence",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_LIFE_ENDING_LW02"],
      st: ["少年", "青年", "壮年", "老年"],
      cd: 4,
      w: 0.5,
      show: s =>
        s.age >= 14 &&
        s.mortality?.crisis?.status === "active" &&
        (s.mortality.crisis.consultCount || 0) > 0 &&
        s.mortality.crisis.lastDecisionYear !== s.year,
      t: s => {
        const prior = s.mortality?.crisis?.lastAction;
        if (prior === "clinic")
          return "以前に相談したあとも、しばらくすると眠れない夜や何も手につかない日が戻ってきた。前に確かめた相談先を使うか、暮らしの負担を減らすか考え直した。";
        if (prior === "support")
          return "以前に身近な人へ苦しさを話したあとも、また日々の負担が重くなってきた。前に決めた助けの求め方を使うか、別の支えを探すか考えた。";
        return "前に用事を止めて休んだあとも、不調の波がまた強くなった。休むだけで凌ぐか、今度は誰かに状態を伝えるか考えた。";
      },
      c: [
        $terraData.K("前に頼った相手や身近な人へ、また状態が悪くなったと伝える", {
          show: s => !!(s.sp || (s.kids && s.kids.length > 0) || (s.personTies && s.personTies.length > 0) || (s.siblings && s.siblings.length > 0) || (!s.fl?.household_separated && (s.par?.fa || s.par?.mo)))
        }, [
          1,
          "前に話した時から何が変わったかを伝え、苦しい日に連絡する方法をもう一度確かめた。",
          { mortalityCare: { kind: "crisis", action: "support" }, rl: 2, p: 2 }
        ]),
        $terraData.K(
          "相談窓口へもう一度連絡し、その後の経過を話す",
          { en: { affordableMedicalCash: 2e4 }, why: "移動と相談に必要な費用が足りない" },
          [
            1,
            "前回から眠りや食事、日々の負担がどう変わったかを伝え、次に状態が崩れた時の相談方法を確認した。",
            { cash: -2e4, med: 1, mortalityCare: { kind: "crisis", action: "clinic" }, p: 2 }
          ]
        ),
        $terraData.K("今週の予定を減らし、食事と睡眠を立て直す", {}, [
          1,
          "急ぎでない用事をいくつか後へ回し、食事と眠る時間を確保した。調子が戻らなければ相談することにした。",
          { mortalityCare: { kind: "crisis", action: "rest" }, p: 1 }
        ])
      ]
    },
    {
      id: "life_mental_crisis_recovery",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_LIFE_ENDING_LW02"],
      st: ["少年", "青年", "壮年", "老年"],
      cd: 3,
      w: 0.75,
      show: s =>
        s.mortality?.crisis?.status === "recovering" && s.mortality.crisis.lastDecisionYear !== s.year,
      t: "底のない暗がりの中にいた頃より、外の光を浴びて歩ける日が増えてきた。それでもふとした拍子に胸がざわつく夜はある。自分の心とどう折り合いをつけていくか考えた。",
      c: [
        $terraData.K("気にかけてくれた人との繋がりを絶やさないでおく", {}, [
          1,
          "また波が来た時には話を聞いてほしいと、支えてくれた相手に素直に伝えた。ひとりではないと思えるだけで呼吸が楽になった。",
          { mortalityCare: { kind: "crisis", action: "support" }, rl: 2 }
        ]),
        $terraData.K("予定を詰め込みすぎないよう、意識して息抜きの時間をつくる", {}, [
          1,
          "以前のようには無理をしないと決め、何もしないで茶を飲んだり空を見上げたりする時間を一日のうちに必ず残すようにした。",
          { mortalityCare: { kind: "crisis", action: "rest" }, p: 2 }
        ])
      ]
    },
    {
      id: "life_violence_threat_safety",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_ORIPATHY_SOCIAL"],
      st: ["少年", "青年", "壮年", "老年"],
      cd: 2,
      w: 0.85,
      show: s => s.mortality?.threat?.status === "active" && s.mortality.threat.lastDecisionYear !== s.year,
      t: "帰り道で浴びせられた脅し文句が、扉の鍵を閉めたあとも耳の奥にこびりついている。翌朝、表へ出る前に足がすくんだ。どうやって自分の身を守るか考えなければならなかった。",
      c: [
        $terraData.K("頼れる人と帰りの時間を合わせ、一人歩きを避ける", {}, [
          1,
          "事情を話してなるべく人通りのある道を選び、遅くなる夜は知人と連れ立って帰るようにした。",
          { mortalityCare: { kind: "threat", action: "safety" }, rl: 2 }
        ]),
        $terraData.K("いつどこで誰に脅されたか、証拠を揃えて相談所へ持ち込む", {}, [
          1,
          "泣き寝入りしないため、脅された場所と相手の風体を克明にまとめ、治安や互助の窓口へ駆け込んで助けを求めた。",
          {
            mortalityCare: { kind: "threat", action: "report" },
            lifeSkill: {
              id: "safety-evidence",
              title: "身の安全に関する記録",
              delta: 1,
              context: "脅迫された日時と状況を整理した"
            }
          }
        ]),
        $terraData.K("しばらくは通り慣れた路地を避け、時間をずらして出入りする", {}, [
          1,
          "連中と鉢合わせしないよう、遠回りをして帰る時刻も変えた。家へたどり着く頃にはすっかり夜が更け、神経がすり減った。",
          { mortalityCare: { kind: "threat", action: "escape" }, p: -1 }
        ])
      ]
    },
    {
      id: "life_disaster_recovery_care",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_LIFE_ENDING_CANON"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      w: 0.6,
      cd: 3,
      show: s =>
        !!(s.fl?.disaster_displaced || s.fl?.war_displaced || s.displacement?.status === "shelter") &&
        (s.h < 68 || s.mortality?.episodes?.some(x => x.kind === "nutrition" && x.status === "active")),
      t: "着の身着のままの避難生活が長引き、硬い床と乏しい食事、濁った水がじわじわと体力を奪っていた。配給の列に並ぶか、それとも少しでも風を避けられる隅で泥のように眠るか。",
      c: [
        $terraData.K("配給の列に並び、清潔な水と救護テントの場所を確かめる", {}, [
          1,
          "長い列に並んで煮沸した水と乾パンを受け取り、具合が悪くなった時に診てもらえる救護所の場所を周囲の人と確かめ合った。",
          { mortalityCare: { kind: "nutrition", action: "support" }, h: 1, rl: 1 }
        ]),
        $terraData.K("無駄に動き回らず、隙間風の少ない場所で体を休める", {}, [
          1,
          "寒さと疲れでこれ以上は動けない。荷物を枕にして外套をかぶり、明日の朝の配給まで体力を温存することにした。",
          { mortalityCare: { kind: "priority", action: "rest" }, h: 1 }
        ])
      ]
    },
    {
      id: "life_late_care_planning",
      conf: "S",
      references: $terraData.LIFE_END_REFS,
      st: ["壮年", "老年"],
      cd: 6,
      w: 0.4,
      show: s => s.age >= 55 && s.h < 60 && !s.mortality?.lateCareDiscussionYear,
      t: "買い物袋を提げて帰る途中で、息が切れて立ち止まる日が増えた。昔は何ともなかった段差や水汲みが、今はやけにこたえる。自分が動けなくなった時のことを、そろそろ現実として考えざるを得なかった。",
      c: [
        $terraData.K("家族や親しい隣人と、いざという時の連絡や手助けを話し合う", {}, [
          1,
          "茶を飲みながら、重い物の運搬など手を借りたいことと、まだ自分の手で続けたい家事を正直に伝えてお願いした。",
          { mortalityCare: { kind: "late", action: "plan" }, rl: 2 }
        ]),
        $terraData.K("今の体で無理なく回せるように、日々の暮らしぶりを改める", {}, [
          1,
          "重い薪や水の運び方、長い買い物道を見直し、よく使う道具や連絡先をすぐ手の届く場所へ移した。",
          { mortalityCare: { kind: "late", action: "plan" }, p: 1 }
        ])
      ]
    },
    {
      id: "life_severe_illness_companionship",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_LIFE_ENDING_LW03"],
      st: ["青年", "壮年", "老年"],
      w: 0.4,
      cd: 5,
      show: s =>
        !!s.mortality?.episodes?.some(x => x.status === "active" && x.severity >= 3) &&
        !!(s.sp || s.friendContact || s.care?.supportNetwork) &&
        s.mortality.lastCompanionshipYear !== s.year,
      t: "病が深まり、一日の大半を寝床で過ごすようになった。窓から差す光の傾きを眺めながら、そばにいてくれる人へ何を伝え、残りの時間をどう過ごすか考えた。",
      c: [
        $terraData.K("そばにいてほしい時と、静かに眠りたい時を素直に伝える", {}, [
          1,
          "遠慮して我慢するのをやめ、手を握っていてほしい時と一人で目を閉じたい時を身近な人へ伝えた。枕元の水を一口飲むと、少し心が落ち着いた。",
          { mortalityCare: { kind: "priority", action: "companionship" }, rl: 2, p: 2 }
        ]),
        $terraData.K("長年続けてきた手仕事を、起き上がれる時間だけ少しずつ触る", {}, [
          1,
          "枕元に愛用の道具を寄せてもらい、指先が動くわずかな時間だけ作業を続けた。自分の手がまだ何かを作れることが嬉しかった。",
          { mortalityCare: { kind: "priority", action: "companionship" }, p: 2 }
        ])
      ]
    },
    {
      id: "life_rehabilitation_followup",
      conf: "S",
      references: $terraData.LIFE_END_REFS,
      st: ["児童", "少年", "青年", "壮年", "老年"],
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      w: 0.7,
      cd: 4,
      show: s =>
        !!s.mortality?.episodes?.some(
          x => x.status === "recovering" && x.kind !== "oripathy" && x.lastDecisionYear !== s.year
        ),
      t: "ひどい熱や痛みはどうにか峠を越えたが、少し長く歩いた翌朝は鉛を背負ったように体が重い。焦る気持ちを抑えながら、朝の家事を一つ済ませて体の具合を確かめた。",
      c: [
        $terraData.K("欲張らず、今日できることだけを少しずつ片づける", {}, [
          1,
          "息が上がる前に手を止め、残りの雑用は明日へ回した。自分の体の声を聞きながら暮らしの歩幅を戻していく。",
          { mortalityCare: { kind: "recovering", action: "rest" }, h: 2 }
        ]),
        $terraData.K(
          "診療所で回復の具合を診てもらい、無理のない動かし方を教わる",
          { en: { affordableMedicalCash: 2e4 }, why: "再診費を用意できない" },
          [
            1,
            "まだ残るこわばりや疲れやすさを医師に話し、筋力を戻すための運動と気をつける動作を教わった。帰り道は休み休み歩いた。",
            { cash: -2e4, med: 1, mortalityCare: { kind: "recovering", action: "clinic" }, h: 1 }
          ]
        )
      ]
    },
    {
      id: "life_unexpected_rescue",
      conf: "S",
      references: $terraData.LIFE_END_REFS,
      st: ["青年", "壮年", "老年"],
      cd: 5,
      w: 0.28,
      show: s =>
        (s.job === 3 || s.job === 19 || s.job === 27 || s.f === 8) && s.local?.hazard > 0.65 && s.h < 80,
      t: "現場の足場板が腐って浮き上がり、頭上の荷台で重い資材が嫌な音を立てて傾いていた。このまま作業を続ければ崩れ落ちるかもしれない。",
      c: [
        $terraData.K("大声で周囲を止め、責任者へ知らせて立入を塞ぐ", {}, [
          1,
          "すぐさま作業を中断させ、下を通りかかった仲間を怒鳴って退避させた。責任者が駆けつけるまで、危険な足場の前に立ちはだかった。",
          {
            mortalityCare: { kind: "exposure", action: "safety" },
            lifeSkill: {
              id: "work-safety",
              title: "作業の危険を見つける",
              delta: 1,
              context: "危険な箇所を報告した"
            },
            cr: 1
          }
        ]),
        $terraData.K("巻き込まれないよう、自分だけでも足場から離れる", {}, [
          1,
          "そっと持ち場を離れ、崩れても届かない壁際まで下がった。金属がきしむ嫌な音だけが、しばらく耳の奥に残った。",
          { mortalityCare: { kind: "exposure", action: "escape" } }
        ])
      ]
    }
  );

  $terraData.FLAG_REGISTRY["ed_violent_threat"] = {
    label: "排斥に伴う具体的な脅迫を受けた",
    description:
      "本人が具体的な脅迫を受けた仮想事例。感染者や特定種族が必ず標的になるという確率設定ではない。",
    engine: "死亡危険・身の安全の経過",
    source: "SIM:MortalityPack",
    lifecycle: "危険が解消したと確認できれば解除。"
  };

  $terraData.FLAG_REGISTRY["ed_violent_threat"].type = "boolean";

  $terraData.FLAG_REGISTRY["ed_violent_threat"].valueDomain = "0=解除・なし、1=有効";

  $terraData.FLAG_REGISTRY["ed_violent_threat"].engineClearers = [];

  $terraData.EV.push(
    {
      id: "life_harassment_threat_escalation",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.35,
      show: s =>
        !s.fl?.ed_violent_threat &&
        !!(s.fl?.ed_work_disadvantage || s.fl?.ed_sarkaz_lodging_refused || s.fl?.ed_iberia_port_screen),
      t: "かつて仕事場や宿で締め出されたいきさつを知る連中に、夕暮れの帰り道で取り囲まれ、次に見かけたらただでは置かないと罵声を浴びせられた。部屋へ逃げ帰っても心臓の鼓動が収まらない。",
      c: [
        {
          t: "周りの知人に打ち明け、帰る時間と道順を変える",
          l: "周りの知人に打ち明け、帰る時間と道順を変える",
          o: [
            [
              1,
              "信頼できる隣人や同僚に事情を話し、暗い路地を避けて灯りのある大通りを連れ立って帰るようにした。",
              { fl: { ed_violent_threat: 1 }, mortalityCare: { kind: "threat", action: "safety" }, rl: 1 }
            ]
          ]
        },
        {
          t: "脅された場所と相手の顔ぶれを控え、助けを求められる窓口を探す",
          l: "脅された場所と相手の顔ぶれを控え、助けを求められる窓口を探す",
          o: [
            [
              1,
              "震える手で連中の特徴と浴びせられた言葉を書き留め、駆け込める相談所や警備の詰所を探した。",
              { fl: { ed_violent_threat: 1 }, mortalityCare: { kind: "threat", action: "report" }, k: 1 }
            ]
          ]
        }
      ]
    },
    {
      id: "life_harassment_threat_resolution",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      w: 0.7,
      cd: 3,
      show: s =>
        !!s.fl?.ed_violent_threat &&
        s.mortality?.threat?.status === "active" &&
        s.year - (s.mortality.threat.startedYear || s.year) >= 2,
      t: "帰り道で脅されてから二年の月日が流れた。ずっと遠回りを続けてきたが、街角で似た背格好や乱暴な笑い声を聞くたび、今でも思わず足がすくむ。",
      c: [
        {
          t: "連中の姿が消えたか確かめつつ、知人との連絡を保つ",
          l: "連中の姿が消えたか確かめつつ、知人との連絡を保つ",
          o: [
            [
              1,
              "事情を知る知人と最近の通りの様子を確かめ合った。あの連中はもう界隈から姿を消したらしく、ようやく深く息をつけた。",
              { fl: { ed_violent_threat: 0 }, mortalityCare: { kind: "threat", action: "safety" }, p: 1 }
            ]
          ]
        },
        {
          t: "まだ警戒を解かず、いざという時の相談先を繋いでおく",
          l: "まだ警戒を解かず、いざという時の相談先を繋いでおく",
          o: [
            [
              1,
              "本当に危険が去ったとはまだ言い切れない。頼れる相手との連絡を絶やさず、もうしばらくは夜道を気をつけることにした。",
              { mortalityCare: { kind: "threat", action: "report" }, rl: 1 }
            ]
          ]
        }
      ]
    },
    {
      id: "life_arts_overload_crisis",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      w: 0.45,
      cd: 3,
      show: s =>
        s.inf > 0 &&
        (s.job === 3 || (s.arts || 0) >= 40 || !!s.lifeRecord?.skills?.some(x => x.id?.includes("arts") || x.title?.includes("アーツ"))) &&
        ((s.p || 0) < 20 || (s.ob || 0) >= 65),
      t: "激しい精神の昂ぶりと疲弊のなか、体内の源石結晶が異常励起を起こし、アーツの奔流が意識の制御を離れて逆流し始めた。皮膚下の結晶が赤黒く脈打って熱を帯び、神経を直接焼き焦がすような激痛に視界が白濁する。このままでは体内からアーツが暴発し、肉体ごと吹き飛んでしまう。",
      c: [
        $terraData.K(
          "アーツ触媒を床に投げ捨て、力づくで術式の繋がりを断ち切る",
          {},
          [
            1,
            "咄嗟に手にしていたアーツ触媒を床へ叩きつけ、体内の源石結晶へ流れる神経の繋がりを力づくで断絶した。激しい衝撃とともに血を吐いて倒れ込んだが、どうにかアーツの暴発を食い止め、一命を取り留めた。",
            { h: -15, p: -5, k: -1 }
          ]
        ),
        $terraData.K(
          "精神を集中し、暴走する源石エネルギーを気力で押さえ込もうとする",
          {},
          [
            0.5,
            "歯を食いしばって意識を研ぎ澄まし、暴走する源石エネルギーの奔流を全身の気力でねじ伏せた。冷や汗を流しながら床に膝をついたが、極限の中で術式の核心に触れ、奇跡的に制御を取り戻した。",
            { k: 2, p: 2, h: -10 }
          ],
          [
            1,
            "意識を集中させようとしたが激痛で思考が掻き消され、制御を失ったエネルギーが体内を焼き尽くした。眩い閃光とともに源石結晶が全身へ暴発し、意識は永遠の暗闇へ呑み込まれた。",
            {
              d: [
                "アーツ暴走による自壊",
                "激しい感情の昂ぶりの中でアーツが暴走し、過剰励起した体内結晶により肉体が自壊した。"
              ]
            }
          ]
        )
      ]
    },
    {
      id: "life_columbia_clinical_trap_decision",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_LOCALITY_GAME"],
      st: ["青年", "壮年"],
      w: 0.4,
      cd: 3,
      show: s => (s.res?.n === "クルビア" || s.cash < -30000) && !s.fl?.col_tech_waiver_signed,
      t: "多額の負債と生活苦のなか、製薬企業の代理人を名乗る男から『新薬の短期被験者になるだけで借金を全額肩代わりする』という契約書を差し出された。だが添付された誓約書には、不測の事態における一切の免責条項が冷ややかに並んでいた。",
      c: [
        $terraData.K(
          "怪しげな甘言を拒絶し、契約書を突き返して立ち去る",
          {},
          [
            1,
            "どんなに金に困っていようと命を売る気はないと言い放ち、契約書を突き返した。男は舌打ちしながら去っていったが、借金の督促から逃げ延びる道はまだ残されている。",
            { p: 1, k: 1 }
          ]
        ),
        $terraData.K(
          "背に腹は代えられず、治験契約書に署名して地下施設へ向かう",
          {},
          [
            0.5,
            "隔離室のベッドに拘束され、激痛とともに新薬を投与された。数日間の激しい嘔吐と高熱に耐え抜き、辛うじて一命を取り留めたが、身体機能に重い後遺症が残った。",
            { fl: { col_tech_waiver_signed: 1 }, cash: 30000, h: -30, p: -5 }
          ],
          [
            1,
            "注射針が静脈に刺さった瞬間、全身の血管が焼けるような激痛が走り、体内の源石結晶が急速に肺胞を塞いだ。警告アラームが鳴り響くなか、実験台の上で泡を吹いて絶命した。",
            {
              d: [
                "生体実験・未承認薬投与による死亡",
                "製薬企業の隔離施設で未承認の新薬を投与され、激しい急性拒絶反応により実験台の上で事切れた。"
              ]
            }
          ]
        )
      ]
    },
    {
      id: "life_lynch_mob_siege",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      w: 0.35,
      cd: 3,
      show: s =>
        (s.r?.n === "サルカズ" || s.inf > 0) &&
        ["ウルサス", "ヴィクトリア", "リターニア"].includes(s.res?.n) &&
        (s.fl?.ed_violent_threat || s.fl?.ed_sarkaz_lodging_refused || s.fl?.housing_exclusion),
      t: "夜更け、怒号と松明の火がアパートの窓を赤く照らし出した。棍棒を持った排斥暴徒が『忌み者を焼き出せ』と叫びながら玄関扉を叩き壊そうとしている。廊下にはすでにガソリンの生臭い臭気が充満し始めていた。",
      c: [
        $terraData.K(
          "裏窓から屋根伝いに飛び降り、闇夜の路地へ命からがら脱出する",
          {},
          [
            1,
            "背中に炎の熱気を感じながら裏窓を蹴破り、隣のトタン屋根へ身を投げた。足をくじきながらも夜の闇に紛れて走り続け、住まいと家財をすべて失いながらも生き延びた。",
            { displacement: "displaced", cash: 0, h: -15, p: -5 }
          ]
        ),
        $terraData.K(
          "扉に家具を押し当ててバリケードを築き、夜明けまで持ちこたえようとする",
          {},
          [
            1,
            "必死に扉を押さえたが、暴徒の力に押し破られて炎が部屋へなだれ込んできた。煙に巻かれて意識が混濁するなか、容赦のない集団暴行を受けて石畳の上で息絶えた。",
            {
              d: [
                "私刑による死亡（暴徒のリンチ・放火）",
                "興奮した排斥暴徒にアパートを取り囲まれ、火を放たれるか集団暴行を受けて命を落とした。"
              ]
            }
          ]
        )
      ]
    },
    {
      id: "life_mine_collapse_crisis",
      conf: "S",
      references: ["SRC_INDUSTRIAL_LIFE", "SRC_LIFE_ENDING_GAME"],
      st: ["青年", "壮年"],
      w: 0.35,
      cd: 3,
      show: s => (s.job === 2 || s.f === 8) && ["レム・ビリトン", "ウルサス", "カズデル"].includes(s.res?.n),
      t: "地下深くの坑道で削岩機を動かしていたその時、頭上の岩盤から耳をつんざく地鳴りと共に支柱が砕け散る音が響いた。天井に巨大な亀裂が走り、無数の岩石が雨のように降り注ぎ始めた。",
      c: [
        $terraData.K(
          "削岩機を放り出し、坑口へ向かって全力で走り抜ける",
          {},
          [
            1,
            "背後で大規模な落盤が起きる爆風を背中に受けながら、無我夢中で坑口へ滑り込んだ。坑道は完全に埋没し、道具をすべて失ったが、奇跡的に生き延びて太陽の光を仰いだ。",
            { h: -10, p: -2, k: 1 }
          ]
        ),
        $terraData.K(
          "奥に取り残された新米作業員の叫び声を聞き、助けに戻る",
          {},
          [
            1,
            "踵を返して坑道奥へ駆け戻った瞬間、頭上の巨大な岩盤が一気に崩れ落ちた。逃げ場のない狭い坑道で暗黒の土砂に呑み込まれ、二度と光を見ることはなかった。",
            {
              d: [
                "事故死（落盤・坑道崩落生き埋め）",
                "支柱の破断とともに頭上の岩盤が崩落し、暗黒の地下深くに生き埋めとなった。"
              ]
            }
          ]
        )
      ]
    },
    {
      id: "life_omerta_hitman_confrontation",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_LOCALITY_GAME"],
      st: ["青年", "壮年"],
      w: 0.35,
      cd: 3,
      show: s =>
        s.res?.n === "シラクーザ" &&
        (s.fl?.criminal_yakuza || s.fl?.siracusa_feud || s.fl?.informant) &&
        s.mortality?.threat?.status === "active",
      t: "雨の降りしきるシラクーザの路地裏で、前後の出口に見覚えのない黒塗りのコートを着た男たちが立った。冷たい銃口が向けられ、オメルタを破った裏切り者への『掃除』が宣告された。",
      c: [
        $terraData.K(
          "路地脇の地下水路の鉄格子へ飛び込み、闇に紛れて他都市へ密航する",
          {},
          [
            1,
            "銃撃が石壁を穿つなか、躊躇なく泥水が流れる地下水路へ飛び込んだ。汚水にまみれながら夜を徹して歩き続け、翌朝の貨物列車に潜り込んでシラクーザの大地を後にした。",
            { displacement: "displaced", cash: -20000, h: -15, p: -4 }
          ]
        ),
        $terraData.K(
          "ファミリーへの忠誠を信じ、身の潔白を訴えようと手を挙げる",
          {},
          [
            1,
            "言葉を発するよりも早く、消音銃から冷酷な銃弾が放たれた。胸を撃ち抜かれて冷たい石畳の上に崩れ落ち、雨水に滲む自らの血を見つめながら意識が途切れた。",
            {
              d: [
                "暗殺・粛清（組織の掟・オメルタの執行）",
                "ファミリーの掟に触れたか、対立組織のヒットマンにより夜の路地で銃撃され命を落とした。"
              ]
            }
          ]
        )
      ]
    },
    {
      id: "life_terminal_despair_choice",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      w: 0.45,
      cd: 2,
      show: s =>
        s.age >= 14 && s.p < 15 && s.mortality?.crisis?.status === "active" &&
        s.mortality.crisis.years >= 2 && s.mortality.crisis.lastDecisionYear !== s.year,
      t: "辛さが長く続き、今日をどう過ごせばよいのか考えることさえ苦しくなった。今の気持ちを誰かに伝えるか、用事を止めて休むか、これからどうするかを考えた。",
      c: [
        $terraData.K(
          "今の気持ちを伝え、話を聞いてくれる相手を探す",
          {},
          [
            1,
            "うまく言葉にできないことも含めて、今の辛さを伝えた。すべてが解決したわけではないが、助けを求める連絡を続けることにした。",
            { mortalityCare: { kind: "crisis", action: "support" }, p: 2, rl: 1 }
          ]
        ),
        $terraData.K(
          "自ら人生を終える",
          {},
          [
            1,
            "深刻な苦しさが続く中、自ら命を絶った。そこに至った事情を一つの原因だけで説明することはできない。",
            {
              d: [
                "自死",
                "深刻な苦しさが続く中、自ら命を絶った。そこに至った事情を一つの原因だけで説明することはできない。"
              ]
            }
          ]
        ),
        $terraData.K("結論を急がず、今日は用事を止めて休む", {}, [
          1,
          "先のことを今すぐ決めるのを止め、今日の用事を見送った。辛さは残っているが、休みながら次の時間を過ごすことにした。",
          { mortalityCare: { kind: "crisis", action: "rest" }, p: 1 }
        ])
      ]
    },
    {
      id: "life_honor_martyrdom_decision",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_LOCALITY_GAME"],
      st: ["青年", "壮年"],
      w: 0.45,
      cd: 2,
      show: s =>
        (s.fl?.detained || s.fl?.custody_contact || s.fl?.ursus_katorga_detained) &&
        (s.job === 4 || s.fl?.veteran || s.res?.n === "ラテラーノ"),
      t: "敵陣の地下牢に捕らわれ、尋問官が無言で冷たい拷問器具を机に並べ始めた。『仲間の潜伏先を話せば命だけは助けてやる』と告げられたが、武人・騎士としての誇りと魂が激しく警鐘を鳴らしている。",
      c: [
        $terraData.K(
          "屈辱に耐えて偽の情報を語り、隙を見て脱出の機会を窺う",
          {},
          [
            1,
            "歯を食いしばって偽りの情報を並べ立て、尋問官が気を取られた一瞬の隙を突いて牢番を倒し、夜陰に紛れて脱走に成功した。",
            { fl: { detained: 0, custody_contact: 0, ursus_katorga_detained: 0 }, h: -20, p: -5, k: 2 }
          ]
        ),
        $terraData.K(
          "同胞を売る屈辱を拒み、騎士の誇りを守るため靴底の隠し刃で自決する",
          {},
          [
            1,
            "尋問官を冷ややかに見据え、靴底から抜き取った薄刃で自らの頸動脈を躊躇なく断ち切った。驚愕する敵の顔を見届けながら、武人の矜持を全うして誇り高く散った。",
            {
              d: [
                "名誉の自決（矜持・信仰・拷問拒絶の自裁）",
                "敵の過酷な拷問に耐えかねて同胞を売る屈辱を拒み、あるいは騎士としての矜持を守り通すため、誇り高く自ら命を絶った。"
              ]
            }
          ]
        )
      ]
    },
    {
      id: "life_debt_bankruptcy_crisis",
      conf: "S",
      references: ["SRC_LIFE_ENDING_GAME", "SRC_LOCALITY_GAME", "SRC_INDUSTRIAL_LIFE"],
      st: ["青年", "壮年", "老年"],
      w: 0.6,
      cd: 3,
      show: s => (s.debt || 0) >= 20000000 && (s.cash || 0) < 500000 && !s.fl?.housing_exclusion,
      t: "借金取りが住居の扉を乱暴に叩き、裁判所からの強制差押え令状を突きつけてきた。膨らみきった負債はもはや通常の労働で返済できる額を遥かに超えており、破産宣告か、それとも危険な選択か、決断を迫られている。",
      c: [
        $terraData.K(
          "自己破産を申し立て、全財産を手放してスラム街へ退去する",
          {},
          [
            1,
            "すべての家財と住居を差押え人に明け渡し、自己破産の手続きを完了した。借金の重圧からは解放されたが、身一つでスラム街の粗末な長屋へと移り住むことになった。",
            {
              debt: -1000000000,
              cash: -1000000,
              p: -20,
              k: -2,
              displacement: "displaced",
              fl: { housing_exclusion: 1 }
            }
          ]
        ),
        $terraData.K(
          "親族や古くからの友人に土下座し、緊急の支援金で一部を弁済して猶予を乞う",
          { en: s => (s.rl || 0) >= 40, why: "頭を下げられるほど親しい親族や友人がいない" },
          [
            1,
            "恥も外聞も捨てて親族や旧友の家を回り、涙ながらに頭を下げた。集まった支援金で急場をしのぎ、差押えの執行猶予を勝ち取ったが、人間関係には大きな溝が残った。",
            { debt: -10000000, rl: -25, p: -10 }
          ]
        ),
        $terraData.K(
          "闇金融の裏契約に署名し、危険な組織の汚れ仕事を引き受ける代わりに借換える",
          {},
          [
            1,
            "路地裏の事務所で怪しげな金融業者と新たな証書を交わした。当面の取り立ては止まったが、命を担保にした契約により、裏社会の危険な使役から逃れられなくなった。",
            { p: -15, fl: { debt_yakuza: 1 } }
          ]
        )
      ]
    }
  );
});
