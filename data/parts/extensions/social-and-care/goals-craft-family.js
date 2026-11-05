// extensions/social-and-care/goals-craft-family: construction fragment; evaluation order is declared by data/extensions/social-and-care.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/goals-craft-family"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $define(
    "FLAG_STATE_KEYS",
    new Set([
      "dg",
      "sch",
      "tx",
      "hid",
      "insured",
      "segregated",
      "detained",
      "marked",
      "family",
      "debt_yakuza",
      "pet_companion",
      "pet_care_extended",
      "pet_care_outsourced",
      "disaster_displaced",
      "war_displaced",
      "kazdel_stayed",
      "kazdel_displaced",
      "hobby_music",
      "hobby_craft",
      "hobby_garden",
      "parent_unemployed",
      "uni_enrolled",
      "voc_enrolled",
      "investment_portfolio",
      "friend_unpaid",
      "neighbor_contact",
      "neighbor_welcome",
      "teacher_attempted",
      "retired",
      "col_tech_safety_case",
      "col_tech_waiver_pending",
      "higashi_service",
      "infection_community_rumor_current_area",
      "infection_housing_rumor_current_home"
    ]),
    false
  );

  $terraData.EV.push({
    id: "family_spouse_disclosure_followup",
    conf: "S",
    references: ["SRC_TERRA_FAMILY", "SRC_ORIPATHY_SOCIAL"],
    st: ["青年", "壮年", "老年"],
    need: ["配偶者の関係を話し合う時期"],
    w: 0.55,
    cd: 2,
    t: "鉱石病を打ち明けられた夜から、二人は同じ家の別々の部屋で眠るようになった。次の通院のことも、ずっと隠されていた年月のことも、食卓では互いに口に出せないまま気まずい季節が過ぎた。",
    c: [
      $terraData.K("意地を張るのをやめ、寝具を元の部屋へ戻して自分から話しかける", {}, [
        1,
        "別室から毛布と枕を運び戻し、食卓に椅子を二つ並べた。次の診察とこれからの暮らしについて、ようやく自分から口を開いた。",
        { spouseDisclosureBoundary: "repaired", rl: 3, p: 1, fl: { marriage_strained: 0 } }
      ]),
      $terraData.K("まだ気持ちの整理がつかず、このまま別室で過ごす", {}, [
        1,
        "まだすぐには元に戻れないと伝え、別室の寝床を整えた。時間を置いてまた話し合うことにして、今夜も扉を閉めた。",
        {
          spouseDisclosureBoundary: "separate_rooms",
          spouseDisclosureReviewDelay: 3,
          p: -1,
          fl: { marriage_strained: 1 }
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "family_newlywed_residence",
    conf: "S",
    references: ["SRC_TERRA_FAMILY", "SRC_TERRA_HOUSING_CONTEXT"],
    st: ["青年", "壮年", "老年"],
    need: ["新婚の住まい相談"],
    pri: true,
    w: 1,
    t: "結婚が決まってから、二人でどこに新居を構えるかの話し合いが続いた。借家の敷金や親の面倒、互いの職場までの道のりを考え合わせると、簡単には決められなかった。",
    c: [
      $terraData.K("親と同じ家に同居し、生活費も一緒にやりくりする", { show: { need: ["同居家族あり"] } }, [
        1,
        "食費や光熱費の分担を親と話し合い、二人の荷物を空き部屋へ運び込んだ。翌朝からは家族の出勤時間に合わせて賑やかな台所に立った。",
        {
          residenceArrangement: "family_home_shared_budget",
          fl: { household_separated: 0 },
          spouseArrangement: "shared"
        }
      ]),
      $terraData.K(
        "二人だけの部屋を新しく借りる（初期費用目安 {newHouseholdSetupCost}）",
        {
          en: { affordableCash: 120000 },
          why: "転居・寝具・保証の準備に必要な地域物価込み費用 {newHouseholdSetupCost} を支払う余裕がない"
        },
        [
          1,
          "二人で暮らせる借家を見つけ、敷金や家財道具の買い揃えに{newHouseholdSetupCost}を払った。真新しい寝具や鍋を運び込み、二人だけの暮らしが始まった。",
          {
            residenceArrangement: "independent_rental",
            fl: { household_separated: 1 },
            cash: -120000,
            pm: 1,
            spouseArrangement: "shared"
          }
        ]
      ),
      $terraData.K(
        "相手の親族の家にしばらく間借りさせてもらう（支度費目安 {newHouseholdKinSetupCost}）",
        {
          en: { affordableCash: 40000 },
          why: "移動と身の回りの支度に必要な地域物価込み費用 {newHouseholdKinSetupCost} を用意できない"
        },
        [
          0.7,
          "相手の親族が空き部屋を貸してくれることになり、引っ越しと身の回りの支度に{newHouseholdKinSetupCost}を払って荷物を運び入れた。遠慮がちに台所の使い方や家の決まりを教わった。",
          {
            residenceArrangement: "spouse_parent_home",
            fl: { household_separated: 1 },
            cash: -40000,
            pm: 1,
            spouseArrangement: "shared"
          }
        ],
        [
          1,
          "相手の親族に間借りを頼んでみたが、今は空いている部屋がないと断られた。もう一度、二人で借りられそうな安い部屋を探し直すことにした。",
          { p: -1 }
        ]
      ),
      $terraData.K("すぐには引っ越さず、しばらく今のまま別々に暮らす", {}, [
        1,
        "仕事の都合や貯金が整うまで無理に引っ越さず、しばらくは今の部屋のまま行き来することにした。",
        { spouseArrangement: "separate" }
      ])
    ]
  });

  $terraData.EV.push({
    id: "kazimierz_knight_entry",
    conf: "S",
    references: ["SRC_KAZIMIERZ_COMPETITION", "SRC_KAZIMIERZ_KNIGHT_LIFE_MODEL"],
    st: ["青年", "壮年"],
    need: ["国:カジミエーシュ", "就労中"],
    ban: ["隔離中", "収容中"],
    ge: { age: 18 },
    le: { age: 38 },
    once: true,
    w: 0.24,
    t: "仕事帰りに競技会場へ立ち寄り、きらびやかなネオンの奥にある受付で、騎士競技の舞台に立つ手順を尋ねてみた。自前で登録料と武具を揃えて予選に挑むか、有力な後援者の紹介状をもらうか、道は二つあるという。",
    c: [
      $terraData.K(
        "自分の腕と体力を信じ、登録料と武具代5万龍門幣を払って予選に挑む",
        {
          show: { ge: { h: 45, k: 20, cr: 30 } },
          en: { affordableCash: 50000 },
          why: "登録と用具に5万龍門幣が必要。体調・基礎技量・信用の目安も満たしていない"
        },
        [
          0.12,
          "荒くれ者たちがひしめく予選を勝ち抜き、競技騎士の訓練生として出場登録を勝ち取った。昼の仕事が終わると、そのまま競技場の訓練所で剣を振るう日々が始まった。",
          {
            job: 10,
            cash: -50000,
            pm: 1,
            cr: 8,
            h: -2,
            fl: { knight: 1 },
            lifeAffiliation: {
              id: "kazimierz-competition-career",
              title: "カジミエーシュの競技騎士としての職業",
              kind: "individual-career",
              action: "join",
              role: "競技訓練生"
            },
            lifeGoal: {
              id: "kazimierz-competition-career",
              title: "競技騎士として働き、暮らしを立てる",
              priority: "仕事と身体",
              action: "start"
            },
            lifeSkill: {
              id: "kazimierz-competition",
              title: "競技の訓練と試合準備",
              delta: 1,
              context: "競技騎士の訓練生として登録"
            }
          }
        ],
        [
          1,
          "予選の途中で叩きのめされ、なけなしの5万龍門幣で買った武具には深い傷だけが残った。痛む身体を引きずりながら、今の働き口を続けながら出直すことにした。",
          { cash: -50000, pm: 1, p: -4, cr: -2 }
        ]
      ),
      $terraData.K(
        "つてを頼り、企業や有力者に競技団体への紹介状を書いてもらう",
        {
          show: s => /騎士団|企業|有力/.test(s.socialPosition || "") || !!s.fl.patron,
          en: { ge: { cr: 40 } },
          why: "身元を示す信用や後援先がなく、紹介状を頼めない"
        },
        [
          0.45,
          "頭を下げて回った後援者が競技団体に口を利いてくれ、訓練生の選考を受けられることになった。ここからは自分の腕ひとつで生き残る番だ。",
          {
            job: 10,
            cr: 6,
            rl: -1,
            fl: { knight: 1 },
            lifeAffiliation: {
              id: "kazimierz-competition-career",
              title: "カジミエーシュの競技騎士としての職業",
              kind: "individual-career",
              action: "join",
              role: "競技訓練生"
            },
            lifeGoal: {
              id: "kazimierz-competition-career",
              title: "競技騎士として働き、暮らしを立てる",
              priority: "仕事と身体",
              action: "start"
            },
            lifeSkill: {
              id: "kazimierz-competition",
              title: "競技の訓練と試合準備",
              delta: 1,
              context: "紹介を受けて競技訓練生として登録"
            }
          }
        ],
        [
          1,
          "後援者の紹介は選考会の席を用意するにとどまった。審査の場では技能と体力が足りず、選手としての登録は見送られた。肩を落として会場を後にした。",
          { job: 1, cr: -2, p: -2 }
        ]
      ),
      $terraData.K("華やかな舞台は諦め、今の仕事を続けながら趣味で剣を習う", {}, [
        1,
        "競技騎士の世界へ飛び込むのはやめ、今の堅実な働き口を守った。休みの日に訓練場の外から稽古を眺め、見様見真似で木剣を振って汗を流した。",
        { cr: 1, k: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "old_reemployment_review",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE", "SRC_TERRA_FAMILY"],
    st: ["老年"],
    ge: { age: 60 },
    need: ["就労中"],
    ban: ["勤務縮小済み", "収容中", "隔離中"],
    any: ["高齢期の再就職後", "勤務再開後の見直し時期"],
    cd: 7,
    w: 0.62,
    t: "朝起きて仕事着に袖を通すたび、年々抜けない疲れを実感するようになった。これまでと同じ日数働き続けるか、そろそろ荷を下ろすか考える時期が来た。",
    c: [
      $terraData.K("まだ現役でいられると職場に伝え、今のまま働き続ける", {}, [
        1,
        "まだ若い者には負けないと職場に伝え、これまで通りのシフトで働き続けることにした。身体と相談しながら、あと数年は頑張ってみるつもりだ。",
        { p: 1, rl: 1 }
      ]),
      $terraData.K("出勤日を減らしてもらい、若い働き手の指導や手伝いに回る", {}, [
        1,
        "週に出る日数を減らしてもらい、新しく入った若い衆に仕事のコツを教える役に回った。給金は減ったが、朝ゆっくり湯を沸かせる日が増えた。",
        { fl: { reduced_work: 1 }, p: 2, rl: 2 }
      ]),
      $terraData.K("きっぱりと職を辞し、穏やかな隠居暮らしに入る", {}, [
        1,
        "長年世話になった職場に別れを告げ、仕事道具を置いた。毎月の給金はなくなるが、時間に追われない静かな朝が戻ってきた。",
        { job: 0, fl: { retired: 1, reduced_work: 0 }, p: 2 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_goal_start",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年"],
    ge: { age: 18 },
    need: ["就労中"],
    once: true,
    pri: true,
    w: 1.25,
    t: "仕事を終えて家路につく途中、今日の失敗やうまくいった手順を思い返した。ただ一日を回すだけで過ぎていく暮らしのなかで、これから先、自分が何を支えに生きていきたいか考えた。",
    c: [
      $terraData.K("今の仕事でできることを増やし、腕を磨いていく", {}, [
        1,
        "今の仕事で迷う手順や判断を一つずつ身につけ、任される仕事を増やしていこうと心に決めた。",
        {
          lifeGoal: { id: "craft", title: "今の仕事の腕を磨く", priority: "技能", action: "start" },
          p: 2,
          k: 1
        }
      ]),
      $terraData.K("家族がいつ帰ってきても安心できる、温かい家を守る", {}, [
        1,
        "外でどんなことがあっても家族が羽を休められるよう、この住まいと食卓を守り抜こうと心に決めた。",
        {
          lifeGoal: {
            id: "family-place",
            title: "家族が困った時に戻れる場所を保つ",
            priority: "家族",
            action: "start"
          },
          rl: 2,
          p: 2
        }
      ]),
      $terraData.K("隣近所と助け合い、困った時に頼り合える居場所を作る", {}, [
        1,
        "日頃から近所の人たちと声をかけ合い、いざという時に支え合えるつながりを育てていこうと決めた。",
        {
          lifeGoal: {
            id: "neighbors",
            title: "近所で助けを求められる関係を作る",
            priority: "地域",
            action: "start"
          },
          rl: 2,
          p: 1
        }
      ]),
      $terraData.K("今は大それたことは考えず、目の前の一日を無事に過ごす", {}, [
        1,
        "難しいことは考えず、温かい夕餉を食べて明日の仕事に備えることにした。先のことはまた余裕ができてから考えればいい。",
        { p: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_goal_review",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["継続中の人生目標"],
    cd: 4,
    w: 0.8,
    t: "かつて心に決めた目標を、日々の忙しさのなかでふと思い返した。仕事や家の事情もあの頃とは変わり、これからどう向き合っていくか考え直した。",
    c: [
      $terraData.K("時間がかかっても、変わらず追い続ける", {}, [
        1,
        "すぐに目に見える形にならなくても、自分が決めたことだけは手放さずに続けようと気持ちを新たにした。",
        { lifeGoal: { id: "current", action: "continue", note: "暮らしの中で継続を選んだ" }, p: 1 }
      ]),
      $terraData.K("今の暮らしの身の丈に合わせ、無理のない形に改める", {}, [
        1,
        "すべてを投げ出すのではなく、今の体力や暮らしで手が届く範囲へと目標を縮めた。一番大事にしたい芯だけは胸に残しておいた。",
        {
          lifeGoal: { id: "current", action: "compromise", note: "生活上の事情に合わせて規模を縮小" },
          p: 1
        }
      ]),
      $terraData.K("いったん脇に置き、目の前の暮らしを乗り切ることに集中する", {}, [
        1,
        "今はまず日々の暮らしを立て直すのが先決だと割り切り、目標はしばらく胸の奥にしまっておくことにした。",
        { lifeGoal: { id: "current", action: "pause", note: "他の生活上の用事を優先" }, p: -1 }
      ]),
      $terraData.K("その目標には区切りをつけ、別の生き方を探す", {}, [
        1,
        "昔のこだわりはすっぱり手放し、今の自分に合った別の道を探すことにした。",
        { lifeGoal: { id: "current", action: "abandon", note: "本人が目標を断念" }, p: -1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_skill_practice",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    ge: { age: 18 },
    need: ["就労中"],
    ban: ["勤務縮小済み", "収容中"],
    cd: 3,
    w: 0.72,
      t: "普段こなしている仕事でも、現場が慌ただしくなると判断や手順が乱れそうになる。終業後に苦手な流れを確かめるか、自分で必要な教材や道具を用意して経験の長い同僚に教わるか考えた。",
    c: [
      $terraData.K("仕事の合間や終業後に、苦手な手順を反復して確かめる", {}, [
        1,
        "迷いやすい手順を何度も確かめ、翌日の仕事で試してみた。慌ただしい時にも順序を崩さず進められる場面が少し増えた。",
        {
          lifeSkill: { id: "current-job", title: "current_job", delta: 3, context: "勤務の中で反復練習" },
          k: 1,
          h: -1
        }
      ]),
      $terraData.K(
        "必要な教材や道具を自分で用意し、経験の長い同僚に教えを請う",
        {
          en: s => $rules.economy.availableFunds(s) >= 20000 + $rules.economy.annualReserve(s),
          why: "家計の予備費を残すと、練習に必要な教材や道具を用意できない"
        },
        [
          0.8,
          "用意した教材や道具を持って相談すると、経験の長い同僚が休憩時間を割き、判断の順序や仕事の勘所を実際の作業に沿って教えてくれた。",
          {
            cash: -20000,
            pm: 1,
            lifeSkill: {
              id: "current-job",
              title: "current_job",
              delta: 8,
              context: "道具を揃え、経験者に教わった"
            },
            k: 2,
            cr: 1
          }
        ],
        [
          1,
          "教えを頼んだ同僚は急ぎの仕事で手が離せなかった。用意した教材や道具を使い、自分で手順を確かめながら練習を重ねた。",
          {
            cash: -20000,
            pm: 1,
            lifeSkill: {
              id: "current-job",
              title: "current_job",
              delta: 3,
              context: "道具を揃え、自分で反復練習"
            },
            k: 1
          }
        ]
      ),
      $terraData.K("無理な練習はせず、家に帰って身体を休める", {}, [
        1,
            "疲れを翌日に残さないのが一番だと、定時で真っ直ぐ帰宅して足を伸ばした。",
        { h: 1, p: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_rim_supply_delay",
    conf: "S",
    references: ["SRC_RIM_WORK", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    ge: { age: 20 },
    need: ["国:レム・ビリトン", "職:修理・整備工", "就労中", "技能を練習した経験"],
    ban: ["勤務縮小済み", "収容中"],
    after: { id: "life_skill_practice", min: 2 },
    once: true,
    w: 0.34,
    t: "鉱区へ届くはずの交換部品の輸送便が遅れ、急ぎの修理に必要な部材が底をついた。止まった重機の警報音が作業場中に鳴り響いている。自腹で消耗品を買い足してでも応急修理するか、別の点検に回るか判断を迫られた。",
    c: [
      $terraData.K(
        "工具店で自腹で消耗品を買い足し（{rimSupplyKitCost}）、応急修理を済ませる",
        {
          en: { affordableCashAfterReserve: 12000 },
          why: "道具と材料に{rimSupplyKitCost}を払うと、家計の生活予備費を残せない"
        },
        [
          1,
          "近くの工具店へ走って{rimSupplyKitCost}で代替の金具と消耗品を買い足し、止まっていた設備を一台動かした。油まみれの手を拭うと、同じ班の仲間たちから労いの声がかかった。",
          {
            cash: -12000,
            pm: 1,
            lifeSkill: {
              id: "job-18",
              title: "修理・整備工の実務",
              delta: 5,
              context: "交換部品の到着が遅れ、手持ち材料で修理を進めた"
            },
            groupStanding: {
              id: "rim-billiton-workmates",
              title: "同じ持ち場で働く人",
              delta: 1,
              reason: "急ぎの修理を手持ちの材料で一件進めた"
            },
            p: 1
          }
        ]
      ),
      $terraData.K("隣の班の同僚から予備の部材を融通してもらい、急場をしのぐ", {}, [
        1,
        "隣の持ち場の同僚に頭を下げ、次の便が来たら必ず返すと約束して予備の部材を分けてもらった。一番急ぎの重機だけはどうにか再稼働させることができた。",
        {
          lifeSkill: {
            id: "job-18",
            title: "修理・整備工の実務",
            delta: 3,
            context: "同僚から借りた部材で急ぎの修理を進めた"
          },
          groupStanding: {
            id: "rim-billiton-workmates",
            title: "同じ持ち場で働く人",
            delta: 2,
            reason: "借りた部材の返却時期を同僚と決めた"
          },
          p: 1
        }
      ]),
      $terraData.K("部品がない以上は無理をせず、現場監督に報告して稼働中の機械の点検に回る", {}, [
        1,
        "部品が届かないうちは手を出せないと監督に報告し、まだ動いている他の機械の定期点検を先に片づけた。",
        {
          lifeSkill: {
            id: "job-18",
            title: "修理・整備工の実務",
            delta: 2,
            context: "部品の未着を伝え、点検順を組み替えた"
          },
          p: 1,
          h: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_rim_skill_handover",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["国:レム・ビリトン", "就労中", "実務に熟達", "レム・ビリトン整備職で技能記録あり"],
    once: true,
    w: 0.28,
    t: "整備の現場にもすっかり慣れ、機械の異音を聞き分けるのも早くなった。最近入ってきた新人が、外した部品の戻し方や異音の見極め方で立ち往生し、休憩時間に心細そうに相談してきた。",
    c: [
      $terraData.K(
        "休憩のあとに少し時間を合わせ、一緒に機械を見ながらコツを教える",
        {},
        [
          0.72,
          "新人はぱっと顔を明るくしてうなずいた。班長に断って少しだけ作業時間をずらし、実際のエンジン音を聞かせながら点検の勘所を一緒にたどった。",
          {
            lifeWorkRelationship: {
              id: "rim-craft-mentorship",
              action: "offer",
              response: "accepted",
              title: "整備作業の同僚"
            },
            lifeSkill: {
              id: "job-18",
              title: "修理・整備工の実務",
              delta: 3,
              context: "同僚本人の同意を得て点検の順序を共有"
            },
            lifeGoal: {
              id: "craft-knowledge-sharing",
              title: "手仕事の知識を次に働く人へ渡す",
              priority: "仕事と技術の継承",
              action: "start"
            },
            groupStanding: {
              id: "rim-billiton-workmates",
              title: "レム・ビリトンで一緒に働く人",
              delta: 1,
              reason: "同意を確かめて持ち場の点検順を共有"
            },
            regionalImpact: {
              entity: "レム・ビリトンの整備作業場",
              kind: "workplace-training-attempt",
              description:
                "同僚本人の同意を得て、本人が受け持つ点検順を一緒に確かめた。作業場全体への定着は未確認。"
            },
            p: 1,
            k: 1
          }
        ],
        [
          1,
          "新人は自分の遅れを取り戻すのに必死で、「今は自分のノルマで手いっぱいです」と遠慮した。無理には押しつけず、自分の持ち場へ戻った。",
          {
            lifeWorkRelationship: {
              id: "rim-craft-mentorship",
              action: "offer",
              response: "declined",
              title: "整備作業の同僚"
            },
            p: 1
          }
        ]
      ),
      $terraData.K("言葉で説明する代わりに、自分が身につけた点検の勘所を図に描いてまとめる", {}, [
        1,
        "つまずきやすい部品の組み順や異音の見分け方を、油の染みた手控えに図解してまとめた。自分が迷ったときにも見返せる確かな財産になった。",
        {
          lifeSkill: {
            id: "job-18",
            title: "修理・整備工の実務",
            delta: 3,
            context: "迷いやすい確認順を個人の手帳に記録"
          },
          lifeGoal: {
            id: "craft-knowledge-sharing",
            title: "手仕事の知識を次に働く人へ渡す",
            priority: "仕事と技術の継承",
            action: "continue",
            note: "個人の手帳に自分用の確認順を残した"
          },
          regionalImpact: {
            entity: "レム・ビリトンの整備作業場",
            kind: "personal-work-notes",
            description: "本人の手帳に確認順を記した。職場共有や継承の成立は未確認。"
          },
          p: 1
        }
      ]),
      $terraData.K("人の世話まで焼く余裕はなく、自分の受け持ちを終えて帰る", {}, [
        1,
        "手短に口頭でアドバイスだけして、自分の受け持ちの修理を片づけて帰路についた。",
        { p: 1, h: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_goal_resume",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["保留中の人生目標"],
    cd: 5,
    w: 0.32,
    t: "しばらく胸の奥にしまい込んでいたかつての目標を、ふとした折に思い出した。日々の暮らしが少し落ち着いた今、もう一度手をつけてみるか考えた。",
    c: [
      $terraData.K("まずは無理のないところから再開してみる", {}, [
        1,
        "久しぶりに最初の一歩を踏み出してみた。焦らず、今の暮らしのリズムを壊さない範囲で続けていくことにした。",
        { lifeGoal: { id: "current", action: "continue", note: "暮らしの変化を受けて再開" }, p: 1 }
      ]),
      $terraData.K("もう過去の夢だと割り切り、今の暮らしに専念する", {}, [
        1,
        "あの頃の目標にはきっぱりと区切りをつけ、今の生活で大切なことに時間と力を使うと決めた。",
        { lifeGoal: { id: "current", action: "abandon", note: "保留の後、本人が目標を断念" }, p: 1 }
      ])
    ]
  });
});
