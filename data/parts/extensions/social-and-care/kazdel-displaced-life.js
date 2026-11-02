// extensions/social-and-care/kazdel-displaced-life: construction fragment; evaluation order is declared by data/extensions/social-and-care.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/kazdel-displaced-life"
)(function ($terraData) {
  "use strict";

  const goalId = "kazdel-displaced-life",
    goal = s => s.lifeRecord?.goals?.find(row => row.id === goalId),
    hasKazdelDisplacement = s =>
      !!(
        s.fl?.kazdel_displaced_life ||
        s.fl?.kazdel_left ||
        s.displacement?.origin === "カズデル" ||
        (s.moves || []).some(move => move.from === "カズデル" && move.to !== "カズデル")
      ),
    isSettledEnoughToReview = s => hasKazdelDisplacement(s) && !s.fl?.kazdel_displaced,
    isActive = s => ["active", "compromised"].includes(goal(s)?.status),
    isPaused = s => goal(s)?.status === "paused",
    isEnded = s => ["achieved", "abandoned"].includes(goal(s)?.status),
    goalEffect = (action, note, onlyIfActive = true) => ({
      id: goalId,
      title: "避難先で暮らしの足場を整える",
      priority: "住まいと日々の仕事",
      action,
      onlyIfActive,
      note
    });

  $terraData.EV.push(
    {
      id: "life_kazdel_displaced_start",
      conf: "S",
      references: ["SRC_TL_1094", "SRC_KAZDEL_LIFE", "SRC_KAZDEL_DISPLACEMENT_MODEL", "SRC_KAZDEL_DISPLACED_LIFE_MODEL"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      ge: { year: 1095 },
      once: true,
      w: 0.46,
      show: s => isSettledEnoughToReview(s),
      t: s =>
        s.res?.n === "カズデル" || s.displacement?.status === "shelter"
          ? "故郷の家を離れてから、いくつか季節が巡った。雨風をしのげる仮住まいは見つかったものの、この先どう食べていくかはまだ定まらない。まずは目の前の暮らしをどう立て直すか考えた。"
          : "カズデルを離れてから、いくつか季節が巡った。見知らぬ土地で人づてに安い部屋や日雇いの仕事を探す日々が続いている。今いる場所で何から足場を作るか考えた。",
      c: [
        $terraData.K("今月の食い扶持と家賃を計算し、出ていく金を絞る", {}, [
          1,
          "手元の硬貨を数え、どうしても削れない食費と部屋代だけを先に取り分けた。しばらくは贅沢を我慢してでも、この土地で生き延びる算段をつけた。",
          {
            lifeGoal: goalEffect("start", "避難先で必要な支出と仕事を確かめる", false),
            lifeSkill: {
              id: "kazdel-displaced-household-budget",
              title: "避難後の支出と暮らしの段取り",
              delta: 1,
              context: "食費と移動費を書き出した"
            },
            p: 1
          }
        ]),
        $terraData.K("近くに移り住んだ同郷のサルカズを訪ね、借家や働き口の情報を聞く", {}, [
          1,
          "同じようにカズデルから流れてきた同郷の人たちを訪ね、サルカズでも嫌がられずに借りられる部屋や仕事場の話を聞いた。自分の足で現場を見て回り、通えそうな場所を探した。",
          {
            lifeGoal: goalEffect("start", "同郷の人から避難先の情報を集める", false),
            groupStanding: {
              id: "kazdel-displaced-residents",
              title: "カズデルから移った住民",
              delta: 1,
              reason: "借家や仕事の情報を持ち寄った"
            },
            lifeSkill: {
              id: "kazdel-displaced-local-information",
              title: "避難先の仕事・住居情報を確かめる",
              delta: 1,
              context: "紹介された条件を自分で確かめた"
            },
            p: 1
          }
        ]),
        $terraData.K("いつか故郷へ帰るかは決めず、まずは今月の食事と寝床を確保する", {}, [
          1,
          "カズデルへ戻るかどうかは今考えず、とにかく温かい食事と安心して眠れる毛布を整えることに集中した。",
          {
            lifeGoal: goalEffect("start", "将来の帰還は保留し、今月の暮らしを整える", false),
            p: 0
          }
        ])
      ]
    },
    {
      id: "life_kazdel_displaced_daily",
      conf: "S",
      references: ["SRC_KAZDEL_LIFE", "SRC_KAZDEL_DISPLACED_LIFE_MODEL"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      after: { id: "life_kazdel_displaced_start", min: 2 },
      cd: 4,
      w: 0.34,
      show: s => isActive(s),
      t: "避難先での暮らしが重なり、路地の抜け道や市場で安く買える時間帯も少しずつ分かってきた。この土地で無理なく暮らし続けるため、次に何を整えるか考えた。",
      c: [
        $terraData.K("身体を壊さずに通える働き口と通勤路を探す", { en: { ge: { age: 15 } }, why: "就労できる年齢に達していない" }, [
          1,
          "行き帰りの遠さや仕事のきつさを考え合わせ、長く続けられそうな働き口の条件を整理した。",
          {
            lifeGoal: goalEffect("continue", "移動の負担も含めて仕事の条件を探す"),
            lifeSkill: {
              id: "kazdel-displaced-work-routine",
              title: "避難先で働く時間と通勤を調整する",
              delta: 1,
              context: "続けられる仕事の時間と移動を記録した"
            },
            p: 1
          }
        ]),
        $terraData.K("役場の窓口や商店で、滞在や買い物に必要な手続きを覚える", {}, [
          1,
          "慣れない土地の役場や店で必要な手続きを一つずつ尋ね、よそ者として足元を見られないよう暮らしの知恵を身につけた。",
          {
            lifeGoal: goalEffect("continue", "避難先の生活手順を一つずつ覚える"),
            lifeSkill: {
              id: "kazdel-displaced-local-information",
              title: "避難先の仕事・住居情報を確かめる",
              delta: 1,
              context: "窓口や店で必要な手順を確かめた"
            },
            k: 1,
            p: 1
          }
        ]),
        $terraData.K("無理な掛け持ちを減らし、しっかり眠れる日を作る", {}, [
          1,
          "頼まれていた雑用を一つ断り、すり減っていた身体を休める時間を作った。久しぶりに深く眠り、朝の重だるさが抜けた。",
          { lifeGoal: goalEffect("continue", "休息の時間を守りながら生活を続ける"), h: 2, p: 1 }
        ])
      ]
    },
    {
      id: "life_kazdel_displaced_contacts",
      conf: "S",
      references: ["SRC_KAZDEL_LIFE", "SRC_KAZDEL_DISPLACED_LIFE_MODEL"],
      st: ["児童", "少年", "青年", "壮年", "老年"],
      after: { id: "life_kazdel_displaced_start", min: 2 },
      cd: 5,
      w: 0.27,
      show: s => isActive(s),
      t: "同じ街区に暮らすサルカズの運び屋が、よその街へ流れた昔の知人からの手紙を届けてくれた。返事に今の自分の居場所を明かすか、それとも用心して安否だけを尋ねるか迷った。",
      c: [
        $terraData.K("今の自分の街と連絡先を書き、運び屋に返事を託す", {}, [
          1,
          "今暮らしている街区と手紙を受け取れる宛先を書き、運び屋に返事を託した。風の便りに返事が戻ってくる日を楽しみに待つことにした。",
          {
            lifeGoal: goalEffect("continue", "現在地を知らせて、知人からの返事を待つ"),
            lifeSkill: {
              id: "kazdel-displaced-correspondence",
              title: "離散した知人と便りを交わす",
              delta: 1,
              context: "現在地を記した便りを託した"
            },
            p: 1
          }
        ]),
        $terraData.K("自分の詳しい居場所は伏せ、相手が無事かどうかだけを尋ねる", {}, [
          1,
          "手紙がどこで誰の目に触れるか分からないため自分の住所は伏せ、相手が息災でいるかだけを尋ねる短い文面を託した。",
          {
            lifeGoal: goalEffect("continue", "居場所を伏せて、知人の消息を尋ねる"),
            lifeSkill: {
              id: "kazdel-displaced-correspondence",
              title: "離散した知人と便りを交わす",
              delta: 1,
              context: "居場所を伏せて消息を尋ねた"
            },
            p: 1
          }
        ]),
        $terraData.K("今は返事を書かず、目の前の暮らしに集中する", {}, [
          1,
          "運び屋には礼だけ言い、返事は託さなかった。見知らぬ土地で今日を生き抜くだけで精一杯だった。",
          { lifeGoal: goalEffect("continue", "連絡を急がず、避難先の用事を優先する"), p: 0 }
        ])
      ]
    },
    {
      id: "life_kazdel_return_appeal",
      conf: "S",
      references: ["SRC_KAZDEL_RETURN_APPEAL", "SRC_KAZDEL_DISPLACED_LIFE_MODEL"],
      st: ["少年", "青年", "壮年", "老年"],
      ge: { year: 1097 },
      after: { id: "life_kazdel_displaced_start", min: 1 },
      once: true,
      w: 0.19,
      show: s => isActive(s),
      t: "サルカズたちが集まる路地の壁に、カズデル軍事委員会の名で故郷への帰還を呼びかけるビラが貼られていた。「同胞よ戻れ」という強い言葉が並ぶばかりで、帰る道中の安全も戻ったあとの住まいの保証も、そこには何ひとつ書かれていなかった。",
      c: [
        $terraData.K("すぐには飛びつかず、実際に戻った人の話が伝わるまで様子を見る", {}, [
          1,
          "ビラの言葉だけでは動けないと冷静に受け止め、本当にカズデルへ戻って暮らせている人の確かな便りが届くまで、今の土地で働き続けることにした。",
          {
            lifeGoal: goalEffect("continue", "帰還の呼びかけを保管し、他の情報を待つ"),
            p: 1
          }
        ]),
        $terraData.K("ビラの前で立ち止まり、自分が本当に故郷へ帰りたいのか胸に問う", {}, [
          1,
          "ざらついた紙の文面を何度も読み返し、自分がカズデルの土をまた踏みたいのか、それともただ落ち着ける場所が欲しいだけなのかを静かに考え込んだ。",
          {
            lifeGoal: goalEffect("continue", "帰還の呼びかけを読み、自分の考えを整理する"),
            p: 1
          }
        ]),
        $terraData.K("呼びかけには背を向け、今いる街での暮らしに戻る", {}, [
          1,
          "遠い故郷の威勢のいい呼びかけより、今夜の夕餉と明日の仕事の方が大事だと背を向け、自分の部屋へ帰った。",
          {
            lifeGoal: goalEffect("continue", "帰還は決めず、避難先で暮らしを続ける"),
            p: 0
          }
        ])
      ]
    },
    {
      id: "life_kazdel_displaced_review",
      conf: "S",
      references: ["SRC_KAZDEL_DIASPORA_STORY", "SRC_KAZDEL_DISPLACED_LIFE_MODEL"],
      st: ["青年", "壮年", "老年"],
      after: { id: "life_kazdel_displaced_start", min: 8 },
      once: true,
      w: 0.17,
      show: s => isActive(s),
      t: "カズデルを離れてこの街で暮らし始めてから、気づけば何年もの歳月が流れた。故郷へ戻る道は今も険しい。このままこの街に骨を埋めるつもりで暮らすか、それでも帰還の道を探し続けるか考えた。",
      c: [
        $terraData.K("この街を自分の居場所と決め、腰を据えて暮らす", {}, [
          1,
          "もう仮住まいではなくこの街で生きていくと腹を決め、いつでも出られるよう束ねたままだった荷物をほどいて部屋の棚に収めた。",
          { lifeGoal: goalEffect("complete", "避難先で暮らしを続ける選択をした", false), p: 1 }
        ]),
        $terraData.K("いつの日か帰る望みは捨てず、故郷への道や現地の様子を聞き続ける", {}, [
          1,
          "すぐには発てなくても故郷へ帰る望みだけは手放さず、旅人や運び屋からカズデルの近況を聞き集め続けることにした。",
          { lifeGoal: goalEffect("continue", "帰還を決めず、確かな情報を集める"), p: 0 }
        ]),
        $terraData.K("帰還のことはしばらく忘れ、今の生活を楽しむことにする", {}, [
          1,
          "帰るか残るか思い悩むのはしばらくやめ、目の前の暮らしと仕事に心を使うことにした。",
          { lifeGoal: goalEffect("pause", "帰還の計画を休み、今の暮らしを優先する"), p: 0 }
        ])
      ]
    },
    {
      id: "life_kazdel_displaced_paused_review",
      conf: "S",
      references: ["SRC_KAZDEL_DISPLACED_LIFE_MODEL"],
      st: ["青年", "壮年", "老年"],
      after: { id: "life_kazdel_displaced_start", min: 5 },
      once: true,
      w: 0.12,
      show: s => isPaused(s) &&
        Number.isInteger(goal(s)?.lastChangedYear) &&
        s.year - goal(s).lastChangedYear >= 3,
      t: "故郷へ帰ることを考えるのをやめてから数年が過ぎ、この街での暮らしもすっかり板についた。そんな折、カズデルの噂を伝える便りが舞い込み、もう一度故郷のことを考えるか迷った。",
      c: [
        $terraData.K("改めてカズデルへの道や現地の暮らしぶりを調べ始める", {}, [
          1,
          "久しぶりに同郷の仲間を訪ね歩き、今のカズデルに仕事や住まいがあるのか確かな話を集め直した。",
          { lifeGoal: goalEffect("continue", "休止後、住まいと帰還情報を再確認する", false), p: 1 }
        ]),
        $terraData.K("今はまだ動かず、このまま今の暮らしを続ける", {}, [
          1,
          "便りだけ読んで引き出しにしまい、これまで通り今の街での穏やかな暮らしを続けた。",
          { lifeGoal: goalEffect("pause", "今は保留を続ける", false), p: 0 }
        ]),
        $terraData.K("カズデルへ帰る考えは完全に手放し、この土地の人として生きる", {}, [
          1,
          "もう故郷へ戻る道を探すのは完全にやめ、今いる街を終の棲家として生きていくと決めた。",
          { lifeGoal: goalEffect("abandon", "帰還先を探す目標を終えた", false), p: 0 }
        ])
      ]
    },
    {
      id: "life_kazdel_displaced_next_generation",
      conf: "S",
      references: ["SRC_KAZDEL_LIFE", "SRC_KAZDEL_DISPLACED_LIFE_MODEL"],
      st: ["壮年", "老年"],
      after: { id: "life_kazdel_displaced_start", min: 7 },
      once: true,
      w: 0.2,
      show: s => isActive(s) && (s.kids || []).some(child => !child.d),
      t: "この土地で育った子どもに、「カズデルってどんな場所だったの？」と尋ねられた。自分が目で見た故郷の風景や、苦しい避難の記憶をどこまで語って聞かせるか考えた。",
      c: [
        $terraData.K("自分がその目で見たカズデルの街並みと、人から聞いた話を分けて語って聞かせる", {}, [
          1,
          "赤茶けた大地や賑やかだった市場の記憶と、後から風の便りで聞いた話をはっきり分けながら、昔の家族の呼び名や故郷の歌を子どもに教えてやった。",
          {
            lifeGoal: goalEffect("continue", "自分の記憶と伝聞を分けて家族に話す"),
            lifeSkill: {
              id: "kazdel-displaced-family-memory",
              title: "家族の記憶と伝聞を分けて伝える",
              delta: 1,
              context: "自分の記憶と人から聞いた話を分けた"
            },
            p: 1
          }
        ]),
        $terraData.K("古い写真や形見を見せ、向こうで暮らしていた親族の話をする", {}, [
          1,
          "大切にしまっていた古い品を取り出し、カズデルで一緒に笑っていた親族や隣人の思い出を話して聞かせた。今も元気でいるかは分からないが、確かにそこに生きた人たちがいたことを伝えた。",
          {
            lifeGoal: goalEffect("continue", "記録を見せ、確かめられることだけ答える"),
            p: 1
          }
        ]),
        $terraData.K("「また今度話すよ」と微笑み、子どもがもっと大きくなってから語ることにする", {}, [
          1,
          "まだ重い話を背負わせたくなくて「また今度ゆっくり話すよ」と頭を撫で、温かい夕餉の支度に戻った。",
          { lifeGoal: goalEffect("continue", "話す時期を急がず、本人の問いを待つ"), p: 0 }
        ])
      ]
    },
    {
      id: "life_kazdel_displaced_legacy",
      conf: "S",
      references: ["SRC_KAZDEL_DIASPORA_STORY", "SRC_KAZDEL_DISPLACED_LIFE_MODEL"],
      st: ["老年"],
      after: { id: "life_kazdel_displaced_review", min: 10 },
      once: true,
      w: 0.12,
      show: s => hasKazdelDisplacement(s) && isEnded(s),
      t: "カズデルを離れてよその土地で重ねた歳月の方が、いつしか故郷で過ごした日々より長くなっていた。これまで移り住んできた街や出会った人々の記憶を振り返り、何を後に残すか考えた。",
      c: [
        $terraData.K("故郷を出てからどんな街を歩き、どう生き抜いてきたかを書き残す", {}, [
          1,
          "カズデルを出た日から今日まで、どんな街でどんな屋根の下に暮らし、誰と出会ったかを一冊の手記に書き残した。流転の人生が確かな生きた証としてそこに並んだ。",
          {
            lifeSkill: {
              id: "kazdel-displaced-family-memory",
              title: "避難後の生活を記録する",
              delta: 1,
              context: "自分の避難後の年月を記録した"
            },
            p: 1
          }
        ]),
        $terraData.K("思い出は胸のなかにだけしまい、普段通りの穏やかな一日に戻る", {}, [
          1,
          "過ぎた歳月を静かに胸の奥へしまい込み、湯を沸かして普段通りの穏やかな一日に戻り、心を休めた。",
          { p: 1, h: 1 }
        ])
      ]
    }
  );
});
