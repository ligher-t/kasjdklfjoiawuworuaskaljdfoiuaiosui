// extensions/family-and-community: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("extensions/family-and-community", function ($terraData, $define, $rules) {
  "use strict";
  $terraData.EV.push({
    id: "life_rim_skill_handover_followup",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["手仕事知識共有の目標を継続中", "国:レム・ビリトン", "整備手順を手帳に記録"],
    after: { id: "life_rim_skill_handover", min: 12 },
    once: true,
    w: 0.32,
    t: "見習いと一緒に機械の点検手順を確かめ合った頃から、ずいぶん年月が経った。ある日、若い作業員が油の染みた古い点検メモを手にやって来た。昔の手帳を開いて順序を教えてやるか、目の前の作業に戻るか、工具を置いて考えた。",
    c: [
      $terraData.K("今も使える手順と、手を出しちゃいけない箇所を教える", {}, [
        1,
        "古い手帳を開き、見落としやすい箇所を一つずつ指でなぞって教えた。聞き慣れない異音がした時は、迷わず担当の技師を呼ぶよう念を押した。",
        {
          lifeSkill: {
            id: "job-18",
            title: "修理・整備工の実務",
            delta: 3,
            context: "後輩の相談にこれまでの経験から答えた"
          },
          lifeGoal: {
            id: "craft-knowledge-sharing",
            action: "continue",
            note: "使える手順と危険な箇所を分けて伝えた"
          },
          groupStanding: {
            id: "rim-billiton-workmates",
            title: "レム・ビリトンで一緒に働く人",
            delta: 1,
            reason: "長年の経験と注意点を惜しまず共有"
          },
          regionalImpact: {
            entity: "レム・ビリトンの整備作業場",
            kind: "later-work-reference",
            description: "古い点検メモを頼りに来た後輩へ、見落としやすい順序と異音の相談先を伝えた"
          },
          p: 1
        }
      ]),
      $terraData.K("自分の持ち場を優先し、今は手が離せないと断る", {}, [
        1,
        "今は手が離せないと断り、自分の持ち場へ戻った。作業台には、今日中に仕上げなければならない部品がまだ積まれていた。",
        {
          lifeGoal: {
            id: "craft-knowledge-sharing",
            action: "compromise",
            note: "自分の持ち場を優先し、後輩への手ほどきは断った"
          },
          p: 1
        }
      ]),
      $terraData.K("手帳を作業場へ預け、これからは若い連中に任せる", {}, [
        1,
        "長年使い込んだ手帳を作業場の棚に置き、気づいたことがあれば余白に書き足してくれと伝えた。人に教える役目は、これで一区切りにすることにした。",
        {
          lifeGoal: {
            id: "craft-knowledge-sharing",
            action: "complete",
            note: "手元の手帳を作業場へ預け、後輩たちに託した"
          },
          regionalImpact: {
            entity: "レム・ビリトンの整備作業場",
            kind: "work-notes-deposited",
            description: "長年書き溜めた点検手帳を作業場の棚に残した"
          },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_rim_workmate_followup",
    conf: "S",
    references: ["SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["国:レム・ビリトン", "受け入れた整備指導相手"],
    after: { id: "life_rim_skill_handover", min: 12 },
    once: true,
    w: 0.36,
    t: "昔、作業の手ほどきを頼んできた{rimWorkmateName}と作業場の外で久しぶりに顔を合わせた。あの頃一緒にやった点検のことで聞きたいことがあるという。今覚えているコツを伝えて手じまいにするか、シフトの合間に一度だけ一緒に手を動かしてやるか考えた。",
    c: [
      $terraData.K("質問にだけ答えて、教える役目はここで終える", {}, [
        1,
        "覚えている限りの勘所を話し、古いメモの当てはまるページを示した。肩の荷を下ろし、教える役目はこれで最後だと笑って別れた。",
        {
          lifeWorkRelationship: {
            id: "rim-craft-mentorship",
            action: "close",
            note: "後年の質問に答え、指導役を気持ちよく終えた"
          },
          lifeGoal: {
            id: "craft-knowledge-sharing",
            onlyIfActive: true,
            action: "complete",
            note: "昔の練習相手からの相談に答え、手ほどきを終えた"
          },
          regionalImpact: {
            entity: "レム・ビリトンの整備作業場",
            kind: "workplace-question-answered",
            description: "かつて手ほどきした同僚の相談に答え、指導役を一区切りとした。"
          },
          p: 1
        }
      ]),
      $terraData.K("作業の合間に、一度だけ一緒に機械を見てやる", {}, [
        1,
        "昼休みの前に一度だけ一緒に機械の前に立ち、ボルトの緩みと音の聞き分けを確かめた。油のついた手を拭い、それぞれの持ち場へ戻った。",
        {
          lifeWorkRelationship: {
            id: "rim-craft-mentorship",
            action: "close",
            note: "一度だけ一緒に点検手順を確かめ、指導役を終えた"
          },
          lifeGoal: {
            id: "craft-knowledge-sharing",
            onlyIfActive: true,
            action: "complete",
            note: "昔の練習相手ともう一度だけ機械を見て手ほどきを終えた"
          },
          regionalImpact: {
            entity: "レム・ビリトンの整備作業場",
            kind: "workplace-question-answered",
            description: "勤務の合間に同僚と機械の前に立ち、手順を確かめ合った。"
          },
          p: 1,
          k: 1
        }
      ]),
      $terraData.K("自分の仕事と体力を考え、もう教えられないと断る", {}, [
        1,
        "自分の仕事と体のことで手いっぱいだと{rimWorkmateName}に伝えた。少し寂しそうな背中を見送り、自分の作業台へ向き直った。",
        {
          lifeWorkRelationship: {
            id: "rim-craft-mentorship",
            action: "close",
            note: "自分の仕事や体調を優先し、相談を断った"
          },
          lifeGoal: {
            id: "craft-knowledge-sharing",
            onlyIfActive: true,
            action: "compromise",
            note: "自分の事情を優先し、指導役を終えた"
          },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_savra_late_craft",
    conf: "S",
    references: ["SRC_TERRA_SPECIES_ATLAS", "SRC_TERRA_LIFECOURSE"],
    st: ["老年"],
    need: ["種族:サヴラ", "レム・ビリトン整備職で技能記録あり"],
    ge: { age: 100 },
    once: true,
    w: 0.38,
    t: "長年続けてきた整備の仕事も、若い頃のように手早くはこなせなくなった。節々が痛む日は重い部品を若手に任せ、代わりに金属の異音や摩耗を見分ける勘所を教えてきた。家の用事も増え、そろそろ働き方を変える潮時かもしれない。",
    c: [
      $terraData.K("出勤日を減らし、点検の相談役として現場に残る", {}, [
        1,
        "現場に出る日数を減らし、若手から異音や摩耗の判断を聞かれた時に顔を出す役回りへ移った。大がかりな分解修理は腕のいい連中に任せることにした。",
        {
          job: 18,
          fl: { retired: 0, reduced_work: 1 },
          bodyChange: {
            id: "savra-long-work-fatigue",
            title: "長年の整備仕事による疲労",
            action: "start",
            cause: "長期間の整備作業に伴う疲れ",
            function: "作業日を減らし、点検の相談役として現場を支える",
            reviewDelay: 2
          },
          lifeGoal: {
            id: "savra-craft-later-life",
            title: "長く身につけた整備の知識を、無理のない形で使い続ける",
            priority: "仕事と健康",
            action: "start"
          },
          lifeSkill: { id: "job-18", title: "修理・整備工の実務", delta: 2, context: "後輩たちの点検の相談役を担った" },
          groupStanding: {
            id: "rim-billiton-workmates",
            title: "レム・ビリトンで一緒に働く人",
            delta: 2,
            reason: "無理のないペースで現場の相談役を続けた"
          },
          p: 1
        }
      ]),
      $terraData.K("体が痛む日は休み、道具の手入れに回る", {}, [
        1,
        "節々が痛む日は無理に現場へ出ず、工具の油引きやこれまでの修理メモの整理に徹した。いつまで現場に立つかは決めず、その日の体調と相談しながら暮らすことにした。",
        {
          bodyChange: {
            id: "savra-long-work-fatigue",
            title: "長年の整備仕事による疲労",
            action: "start",
            cause: "長期間の作業と年齢に伴う疲れ",
            function: "痛む日は作業を休み、道具の手入れや整理を続ける",
            reviewDelay: 3
          },
          lifeGoal: {
            id: "savra-craft-later-life",
            title: "長く身につけた整備の知識を、無理のない形で使い続ける",
            priority: "仕事と健康",
            action: "start"
          },
          lifeSkill: {
            id: "job-18",
            title: "修理・整備工の実務",
            delta: 1,
            context: "工具の手入れと修理メモの整理"
          },
          p: 1,
          h: -1
        }
      ]),
      $terraData.K("現場を退き、馴染んだ道具を後輩に譲る", {}, [
        1,
        "今日で現場を退くと仲間に告げ、手に馴染んだ工具箱を若い作業員に譲った。軽くなった手で家路につきながら、これからは蓄えでどう暮らしていくか静かに考えた。",
        {
          job: 0,
          fl: { retired: 1, reduced_work: 0 },
          bodyChange: {
            id: "savra-long-work-fatigue",
            title: "長年の整備仕事による疲労",
            action: "start",
            cause: "長期間の整備作業に伴う疲れ",
            function: "現場仕事を終え、手元の道具を後輩へ譲る",
            reviewDelay: 2
          },
          lifeGoal: {
            id: "savra-craft-later-life",
            title: "長く身につけた整備の知識を、無理のない形で使い続ける",
            priority: "仕事と健康",
            action: "compromise",
            note: "仕事を退き、長年使った道具を譲った"
          },
          regionalImpact: {
            entity: "レム・ビリトンの整備作業場",
            kind: "personal-tool-transfer",
            description: "長年使い込んだ整備道具を、若い作業員へ譲った。"
          },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_savra_craft_later_years",
    conf: "S",
    references: ["SRC_TERRA_SPECIES_ATLAS", "SRC_TERRA_LIFECOURSE"],
    st: ["老年"],
    need: ["種族:サヴラ"],
    after: { id: "life_savra_late_craft", min: 15 },
    once: true,
    w: 0.3,
    t: "現場の第一線を退いてから、さらに長い歳月が流れた。ある日、昔の作業場の仲間から、あなたが使っていた道具や点検メモのことで手紙が届いた。今もあの手順が役立っているのか、久しぶりに現場の油の匂いを思い出した。",
    c: [
      $terraData.K("久しぶりに作業場へ顔を出し、今の様子を見てくる", {}, [
        1,
        "久しぶりに作業場を訪ねると、新しい機材に混じって昔の手順が今も一部受け継がれていた。今の機械と合わない箇所だけ若い主任に伝え、懐かしさに目を細めて帰途についた。",
        {
          lifeGoal: {
            id: "savra-craft-later-life",
            action: "complete",
            note: "古巣の作業場を訪ね、今の機械に合わせた助言を残した"
          },
          groupStanding: {
            id: "rim-billiton-workmates",
            title: "レム・ビリトンで一緒に働く人",
            delta: 1,
            reason: "古巣を訪ね、今の現場に合わせて助言した"
          },
          regionalImpact: {
            entity: "レム・ビリトンの整備作業場",
            kind: "later-record-review",
            description: "久しぶりに作業場を訪ね、新しい機械と昔の手順の違いを後輩と確かめた"
          },
          bodyChange: {
            id: "savra-long-work-fatigue",
            title: "長年の整備仕事による疲労",
            action: "review",
            status: "ongoing",
            reviewDelay: 3
          },
          p: 1
        }
      ]),
      $terraData.K("手紙で礼を伝え、今の現場のやり方に任せる", {}, [
        1,
        "思い出してくれた礼を書き、道具も手順も今の連中が使いやすいように変えてくれと返事を出した。",
        {
          lifeGoal: {
            id: "savra-craft-later-life",
            action: "complete",
            note: "現場のやり方を今の世代へ気持ちよく委ねた"
          },
          bodyChange: {
            id: "savra-long-work-fatigue",
            title: "長年の整備仕事による疲労",
            action: "review",
            status: "adapted",
            accommodation: "現場の判断は後輩に委ね、便りが来た時だけ応じる",
            reviewDelay: 3
          },
          p: 1
        }
      ]),
      $terraData.K("昔の仕事にはもう触れず、静かな日々に戻る", {}, [
        1,
        "手紙を静かに畳んで引き出しにしまい、作業場へは足を向けなかった。昼下がりの茶を淹れ、今の穏やかな暮らしに戻った。",
        {
          lifeGoal: {
            id: "savra-craft-later-life",
            action: "abandon",
            note: "過去の仕事から離れ、静かな暮らしを選んだ"
          },
          p: 0
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "family_spouse_household_arrangement",
    conf: "S",
    references: ["SRC_TERRA_FAMILY"],
    st: ["青年", "壮年", "老年"],
    need: ["既婚", "配偶者の家計分担が未相談"],
    ge: { age: 18 },
    cd: 2,
    w: 0.42,
    t: "夕食の後、食卓に給金袋と請求書を並べて{sp}と向き合った。稼ぎを一つにまとめるか、別々の財布から生活費を出し合うか、毎日の家事や親族の世話をどう分担するか、腹を割って話し合った。",
    c: [
      $terraData.K(
        "稼ぎを一つにまとめ、二人でやりくりする",
        { show: s => Number.isInteger(s.sp?.j) && !!$terraData.J[s.sp.j] },
        [
          0.7,
          "相手も頷き、同じ財布で家計を回していくことに決まった。毎月の支払いを済ませた後、残った金を何に使うか二人で話し合った。",
          { spouseArrangement: "shared", rl: 2 }
        ],
        [
          1,
          "一つの財布にまとめようと持ちかけたが、相手は少し考え込んですぐには頷かなかった。ひとまず今月の家賃と食費だけ出し合い、また改めて話すことにした。",
          {}
        ]
      ),
      $terraData.K(
        "財布は別にして、決まった生活費だけ出し合う",
        { show: s => Number.isInteger(s.sp?.j) && !!$terraData.J[s.sp.j] },
        [
          0.7,
          "互いの財布は分けたまま、家賃や食費を決められた割合で出し合うことに落ち着いた。残りはそれぞれの裁量で使うことにした。",
          { spouseArrangement: "separate", rl: 1 }
        ],
        [
          1,
          "財布を分ける話を切り出したが、お互いにいくら出すかで折り合いがつかなかった。今月の支払いだけ先に済ませ、続きはまた今度話すことにした。",
          {}
        ]
      ),
      $terraData.K(
        "家のことや親族の世話をどう分担するか話し合う",
        {},
        [
          0.7,
          "相手はしばらく、家の切り盛りや親族の世話を自分が多めに引き受けたいと言った。どちらかの仕事や体調が変わった時は、またその時に分け直そうと約束した。",
          { spouseArrangement: "caregiving", rl: 1 }
        ],
        [
          1,
          "相手も今の仕事と家の用事の板挟みで、どこまで抱えられるかすぐには答えが出なかった。当面はできる方が手を動かすことにして、お茶を淹れ直した。",
          {}
        ]
      )
    ]
  });

  for (const id of ["retired", "reduced_work"]) {
    const meta = $terraData.FLAG_REGISTRY[id];
    if (meta) {
      const values = event => [
        ...$terraData.eventFlagValues(event.fx, id),
        ...(event.c || []).flatMap(choice =>
          (choice.o || []).flatMap(outcome => $terraData.eventFlagValues(outcome[2], id))
        )
      ];
      meta.producers = $terraData.EV.filter(event => values(event).includes(1)).map(event => event.id);
      meta.clearers = $terraData.EV.filter(event => values(event).includes(0)).map(event => event.id);
    }
  }

  $define(
    "spouseArrangementEvent",
    $terraData.EV.find(event => event.id === "family_spouse_household_arrangement"),
    false
  );

  $terraData.spouseArrangementEvent.need = ["既婚"];

  $terraData.spouseArrangementEvent.any = ["配偶者の家計分担が未相談", "配偶者の家計分担を再相談する時期"];

  $terraData.spouseArrangementEvent.t = [
    {
      when: "配偶者の家計分担を再相談する時期",
      t: "前に決めた家計や家事の分担が今の暮らしに合っているか、夜の食卓で改めて話し合った。互いの仕事や家族の事情も変わり、見直す時期が来ていた。"
    },
    {
      t: "夕食の後、食卓に給金袋と請求書を並べて{sp}と向き合った。稼ぎを一つにまとめるか、別々の財布から生活費を出し合うか、毎日の家事や親族の世話をどう分担するか、腹を割って話し合った。"
    }
  ];

  $terraData.EV.push({
    id: "family_spouse_finance_strain",
    conf: "S",
    references: ["SRC_TERRA_FAMILY"],
    st: ["青年", "壮年", "老年"],
    need: ["既婚", "配偶者の家計が逼迫"],
    any: ["配偶者の家計相談時期"],
    cd: 2,
    w: 0.52,
    t: "夜遅く、{sp}が浮かない顔で借金の返済と日々の出費が重なって苦しいと打ち明けた。溜まった請求書を前に、どう乗り切るか二人で頭を寄せた。",
    c: [
      $terraData.K(
        "返済の足しに、手元から{spouseFinanceAidAmount}を出す",
        { en: { affordableCash: 1e5 }, why: "自分たちの生活費を残して{spouseFinanceAidAmount}を出す余裕がない" },
        [
          1,
          "蓄えから{spouseFinanceAidAmount}を渡し、急ぎの返済に充てて残りは手元に置いておくよう伝えた。張り詰めていた相手の肩から、ようやく少し力が抜けた。",
          { cash: -1e5, pm: 1, spouseFinanceTransfer: 1e5, spouseFinanceReview: 1, rl: 2, p: 1 }
        ]
      ),
      $terraData.K(
        "しばらく相手からの生活費入れを止め、立て直しを優先する",
        { show: s => $rules.family.spouseHouseholdIncome(s) > 0 },
        [
          1,
          "向こう一年は家計に金を入れなくていいから、自分の返済と手元の立て直しに回すよう伝えた。その分、家の出費を少し詰めることにした。",
          { spouseContributionPause: 1, spouseFinanceReview: 1, rl: 2, p: 1 }
        ]
      ),
      $terraData.K("金は出せないが、支払いの優先順位を一緒に考える", {}, [
        1,
        "まとまった金は出せなかったが、返済の期日と削れる出費を夜更けまで一緒に洗い出した。まずは急ぎの支払いから片づけていこうと声をかけた。",
        { spouseFinanceReview: 1, rl: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "family_spouse_health_review",
    conf: "S",
    references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE", "SRC_RHODES_MEDICAL"],
    st: ["青年", "壮年", "老年"],
    need: ["既婚", "配偶者の体調について話す時期"],
    w: 0.45,
    cd: 2,
    t: "最近、朝起きても疲れが抜けないと{sp}がこぼした。外での仕事と家の用事が重なり、顔色も優れない日が続いていた。医者に診せるか、家の負担を減らすか、向かい合って話し合った。",
    c: [
      $terraData.K("ここ二年は無理をさせないよう、家の仕事を引き受ける", {}, [
        1,
          "しばらくは自分が家事を多めに引き受け、相手には少しでも早く休んでもらうことにした。月末には、無理をしていないか声をかけるようにした。",
        { spouseHealthReview: "lighter_load", rl: 2, p: 1 }
      ]),
      $terraData.K(
        "費用を出して医者に診てもらう（費用{spouseHealthConsultCost}）",
        {
          en: s =>
            $rules.economy.availableFunds(s) >=
            $rules.family.spouseHealthConsultCost(s) + $rules.economy.annualReserve(s),
          why: "診察費と一年分の生活の備えを同時に残せない"
        },
        [
          1,
          "診察費{spouseHealthConsultCost}を用意し、{sp}の休みに合わせて診療所の予約を取った。当日は待合室まで付き添い、医師にどこまで話すかは本人に任せた。",
          {
            cash: -(
              $terraData.SIM_PARAMS.find(item => item.id === "family.spouseHealthConsultBaseCost")?.value ||
              35000
            ),
            med: 1,
            spouseHealthReview: "consult",
            rl: 1
          }
        ]
      ),
      $terraData.K("今は無理に動かさず、本人が休みたくなった時にまた話す", {}, [
        1,
        "あまり大ごとにせず、{sp}の愚痴にじっくり耳を傾けた。本当に辛くなったら遠慮なく言ってくれと伝え、温かい飲み物を淹れた。",
        { spouseHealthReview: "defer", rl: 0 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "family_spouse_work_preference",
    conf: "S",
    references: ["SRC_TERRA_FAMILY"],
    st: ["青年", "壮年", "老年"],
    need: ["配偶者と仕事の希望を話す時期"],
    w: 0.5,
    t: "{spouseWorkPreferenceContext}、これからの働き方について{sp}と話し合った。稼ぎの良さか、身の安全か、それとも慣れた職場か、本人が何を一番大事にしたいか耳を傾けた。",
    c: [
      $terraData.K(
        "少しでも実入りのいい仕事を一緒に探すか尋ねる",
        {},
        [
          0.7,
          "相手も、もう少し家計にゆとりを作れる仕事を探したいと頷いた。ただ給金が高いだけでなく、体を壊さず続けられる職場かどうかも見極めることにした。",
          { spouseWorkPreference: "income", rl: 1, p: 1 }
        ],
        [
          1,
          "相手は稼ぎも気にしていたが、それだけで飛びつくのは怖いと言った。焦らずいろんな募集を見比べていくことにした。",
          { spouseWorkPreference: "open", rl: 1, p: 1 }
        ]
      ),
      $terraData.K(
        "危ない現場や体を酷使する仕事は避けてほしいと伝える",
        {},
        [
          0.7,
          "相手も、怪我や病気の危険が大きい現場からは離れたいと本音を漏らした。次を探す時は、作業環境を一番に確かめることにした。",
          { spouseWorkPreference: "low_hazard", rl: 2, p: 1 }
        ],
        [
          1,
          "安全はもちろん大事だが、給金や通いやすさも無視できないと相手は言った。条件を一つに決めつけず、広く働き口を探すことにした。",
          { spouseWorkPreference: "open", rl: 1, p: 1 }
        ]
      ),
      $terraData.K(
        "今の職場に愛着があるなら、無理に変えなくていいと話す",
        {},
        [
          0.7,
          "相手は、気心の知れた今の職場でもう少し頑張りたいと笑った。無理に転職は考えず、本当に嫌になった時にまた相談することにした。",
          { spouseWorkPreference: "stay", rl: 2, p: 1 }
        ],
        [
          1,
          "今の仕事には慣れているものの、別の仕事にも少し未練があるようだった。どちらにも転べるよう、外の話も耳に入れておくことにした。",
          { spouseWorkPreference: "open", rl: 1, p: 1 }
        ]
      ),
      $terraData.K("先入観を持たず、本人が納得できる働き口を探す", {}, [
        1,
        "条件を一つに縛らず、相手が一番納得して働ける場所を探すことにした。募集が出るたび、休日の食卓で一緒に見比べることにした。",
        { spouseWorkPreference: "open", rl: 1, p: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "family_spouse_migration_choice",
    conf: "S",
    references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["配偶者の転居を相談する"],
    pri: 1,
    w: 1,
    t: "あなたは新天地の{spouseToRegion}へ移り住んだ。まだ片づかない部屋の荷物を解きながら、{sp}にこちらへ来て一緒に暮らしてほしいと伝え、仕事やこれからの生活をどうするか話し合った。",
    c: [
      $terraData.K("こちらで一緒に暮らしたいと伝え、返事を待つ", {}, [
        0.7,
        "相手も{spouseToRegion}へ来ると決めてくれた。二人で住める部屋と働き口を探し、元の土地の親しい人たちへ知らせの手紙を書いた。",
        { spouseResidenceAction: "follow", rl: 2, p: -1 }
      ], [
        1,
        "相手は今の仕事や暮らしを投げ出せず、しばらくは{spouseFromRegion}に残りたいと答えた。寂しさは残ったが、離れて暮らす間の手紙のやり取りを約束した。",
        { spouseResidenceAction: "stay", rl: -2, p: -3 }
      ]),
      $terraData.K("無理に急かさず、相手の都合と気持ちを先に聞く", {}, [
        0.5,
        "相手は身辺の整理をつけたら{spouseToRegion}へ合流したいと言ってくれた。迎える準備を進めながら、道中の無事を祈った。",
        { spouseResidenceAction: "follow", rl: 2, p: -1 }
      ], [
        1,
        "相手はやはり{spouseFromRegion}を離れられないと打ち明けた。すぐには同じ屋根の下で暮らせないが、互いの生活費や手紙の送り先を確かめ合った。",
        { spouseResidenceAction: "stay", rl: -2, p: -3 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "family_spouse_independent_move_notice",
    conf: "S",
    references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["別居配偶者の転居知らせ"],
    pri: 1,
    w: 0.65,
    t: "離れて暮らす{sp}から、仕事や住まいの都合で{spouseMovedRegion}へ引っ越したと手紙が届いた。旅費も自分で工面したらしく、落ち着いてからようやく知らせてきたらしい。封筒の裏の新しい宛先を見つめながら、どう返事を書くか考えた。",
    c: [
      $terraData.K("すぐに返事を書き、新しい土地での暮らしぶりを尋ねる", {}, [
        1,
        "{sp}へ手紙を書き、新しい部屋や仕事に慣れたか気遣う言葉を綴った。折を見て会いに行けるかも、これからの手紙で相談することにした。",
        { spouseMoveNotice: 1, spouseSeparateContact: "letters", rl: 2, p: 1 }
      ]),
      $terraData.K("向こうの暮らしが落ち着くまで、こちらからは急かさない", {}, [
        1,
        "引っ越したばかりで慌ただしいだろうと思い、まずはゆっくり落ち着いてくれと短い返事だけ出した。会いに行く話は、相手から声がかかるまで待つことにした。",
        { spouseMoveNotice: 1, spouseSeparateContact: "paused", rl: -1, p: -1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "family_spouse_separate_life",
    conf: "S",
    references: ["SRC_TERRA_FAMILY", "SRC_ORIPATHY_SOCIAL", "SRC_RHODES_MEDICAL"],
    st: ["青年", "壮年", "老年"],
    need: ["配偶者と別居生活を相談する時期"],
    w: 0.75,
    t: "別々に暮らすようになってから、手紙や伝言が届くたびに遠くの街にいる{sp}の顔を思い浮かべた。これからどのくらい連絡を取り合い、生活費や薬代をどう支え合うか、無理のない形を話し合った。",
    c: [
      $terraData.K(
        "お金は別々にやりくりし、定期的な連絡だけ欠かさない",
        {
          en: s =>
            $rules.family.spouseSeparateSupportAffordable(
              s,
              $rules.family.spouseSeparateContactAnnualCost(s, "regular")
            ),
          why: "定期的に連絡を取り合う費用を、日々の生活費を残して捻出できない"
        },
        [
          1,
          "財布は別々にしつつ、決まった時期に必ず近況を知らせ合うことにした。返事が届くたび、遠くの空の下でもつながっている実感があった。",
          { spouseSeparateSupportPlan: "none", spouseSeparateContact: "regular", rl: 1 }
        ]
      ),
      $terraData.K(
        "手紙のやり取りを続け、生活費の足しを少し送る",
        {
          en: s =>
            $rules.family.spouseSeparateSupportAffordable(
              s,
              $rules.family.spouseSeparateSupportCost(s, "living") +
                $rules.family.spouseSeparateContactAnnualCost(s, "letters")
            ),
          why: "仕送りと通信費を、自分の生活費を残して捻出できない"
        },
        [
          1,
          "手紙で互いの様子を伝え合いながら、無理のない範囲で生活費を仕送りすることにした。",
          { spouseSeparateSupportPlan: "living", spouseSeparateContact: "letters", rl: 1 }
        ]
      ),
      $terraData.K(
        "相手が続けている治療の費用をこちらでも負担する",
        {
          show: s => !!s.sp?.inf && !s.sp.infHidden && !!s.sp.tx,
          en: s =>
            $rules.family.spouseSeparateSupportAffordable(
              s,
              $rules.family.spouseSeparateSupportCost(s, "medical") +
                $rules.family.spouseSeparateContactAnnualCost(s, "letters")
            ),
          why: "療養費の仕送りと通信費を、自分の生活費を残して捻出できない"
        },
        [
          1,
          "手紙のやり取りに加え、相手の薬代や診察費を毎年分担することにした。体調を気遣う手紙を出し、返事を心待ちにした。",
          { spouseSeparateSupportPlan: "medical", spouseSeparateContact: "letters", rl: 2 }
        ]
      ),
      $terraData.K(
        "休みを取って、{spouseVisitFare}で相手の暮らす街へ会いに行く",
        {
          show: s => !!$rules.family.spouseVisitRoute(s),
          en: s => $rules.family.spouseVisitAffordable(s),
          why: "向こうへ行く足がないか、旅費を出すと自分の生活が立ち行かなくなる"
        },
        [
          1,
          "旅費{spouseVisitFare}を払って{sp}の暮らす{spouseRegion}を訪ね、久しぶりに顔を見て語り合った。別れ際、また必ず手紙を書くと約束して帰路についた。",
          { spouseVisit: 1, rl: 3, p: 1 }
        ]
      ),
      $terraData.K(
        "旅費{spouseRejoinFare}を工面し、もう一度同じ屋根の下で暮らす",
        { show: s => $rules.family.spouseRejoinAffordable(s) },
        [
          1,
          "{spouseRejoinContext}ことになった。引っ越しの費用を払い、長かった別居生活にピリオドを打った。これからはまた同じ食卓を囲み、日々のことを相談できる。",
          { spouseRejoin: 1, rl: 2, p: 1 }
        ]
      ),
      $terraData.K("今は手紙も仕送りも控え、自分の暮らしを立て直す", {}, [
        1,
        "しばらくは連絡も仕送りもできないと正直に伝えた。少し胸が痛んだが、まずは自分の足元を固めることにした。",
        { spouseSeparateSupportPlan: "none", spouseSeparateContact: "paused", rl: -2, p: -1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "family_spouse_unemployment_support",
    conf: "S",
    references: ["SRC_TERRA_FAMILY"],
    st: ["青年", "壮年", "老年"],
    need: ["配偶者の求職相談が必要"],
    w: 0.36,
    t: "配偶者の仕事が途切れ、来月から給金が入らなくなった。手に職をつける講習へ通うか、すぐ日銭になる仕事を探すか、本人も迷っている。財布の中身を確かめながら、どう支えるか話し合った。",
    c: [
      $terraData.K(
        "本人が通いたがっている講習の費用を出す",
        { en: { affordableCash: 5e4 }, why: "講習と教材の5万龍門幣を出すと、当面の生活費が足りなくなる" },
        [
          1,
          "本人が希望していた技能講習と教材の代金に5万龍門幣を出した。新しい技術を身につけて自信を取り戻してくれるよう、背中を押した。",
          { cash: -5e4, pm: 1, spouseEmploymentSupport: "training", rl: 2, p: 1 }
        ]
      ),
      $terraData.K("一緒に求人を見て回り、面接の支度を手伝う", {}, [
        1,
        "どんな仕事なら続けられそうか話を聞き、街の求人票を一緒に見て回った。働き口が決まるまで、少しだけ食費を引き締めることにした。",
        { spouseEmploymentSupport: "search", rl: 2, p: 1 }
      ]),
      $terraData.K("焦らせず、本人の気持ちが固まるまで出費を抑えて待つ", {}, [
        1,
          "無理に急かさず、まずは家の出費を切り詰めてしのぐことにした。気持ちが落ち着いたら、また一緒に仕事を探そうと伝えた。",
        { spouseEmploymentSupport: "wait", rl: 1, p: -1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "family_spouse_infected_housing_pressure",
    conf: "S",
    references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_FAMILY", "SRC_TERRA_HOUSING_CONTEXT"],
    st: ["青年", "壮年", "老年"],
    need: ["別世帯の感染した配偶者", "配偶者の地域で住居圧力が強い"],
    once: true,
    w: 0.42,
    t: [
      {
        when: "感染を伏せた配偶者",
        t: "離れて暮らす{sp}のアパートで、契約更新の紙に健康状態を詳しく書くよう求められたという。病名は伏せていたが、肌の表面の結晶や通院の様子から勘づかれたらしい。更新の日が迫り、どう切り抜けるか相談が来た。"
      },
      {
        when: "感染した配偶者",
        t: "{sp}が鉱石病だと知れてから、建物の管理人が「ほかの住人が不安がっている」と更新の条件を厳しくしてきたという。言われるまま飲むか、不当だと掛け合うか、途方に暮れた便りが届いた。"
      }
    ],
    c: [
      $terraData.K("泣き寝入りせず、どんな根拠で条件を変えるのか管理人に問いただす", {}, [
        1,
        "曖昧な口約束で追い出されないよう、更新を渋る理由をはっきり書面で出せと管理人に掛け合うことにした。いざという時に備え、やり取りの経緯も残しておいた。",
        { rl: 2, p: -1 }
      ]),
      $terraData.K(
        "本人が望むなら、家賃の安い相部屋や間借りへ移る",
        {
          show: s => $rules.family.spouseHousingPlan(s.sp) !== "shared",
          en: s => $rules.family.spouseHousingTransitionAffordable(s, "shared"),
          why: "配偶者の収入と手元資金では、引っ越し代と当面の生活費をまかなえない"
        },
        [
          1,
          "嫌な目にあい続けるよりましだと話し合い、相部屋や間借りの部屋へ移ることにした。同居人に気を使う暮らしにはなるが、まずは雨風をしのげる場所を確保した。",
          { spouseHousingPlan: "shared", rl: 1, p: -2 }
        ]
      ),
      $terraData.K(
        "旅費{spouseVisitFare}を払って{spouseRegion}へ駆けつけ、直接そばで支える",
        {
          show: s => !!$rules.family.spouseVisitRoute(s),
          en: s => $rules.family.spouseVisitAffordable(s),
          why: "向こうへ行く足がないか、旅費を出すと自分の生活が立ち行かなくなる"
        },
        [
          1,
          "旅費{spouseVisitFare}を握りしめて{sp}の暮らす{spouseRegion}へ駆けつけた。不安がる相手の隣に座り、管理人とどう話すか、別の部屋を探すか、本人の気持ちを一番に考えながら一緒に作戦を練った。",
          { spouseVisit: 1, rl: 3, p: 1 }
        ]
      )
    ]
  });

  $terraData.EV.push({
    id: "family_spouse_housing_choice",
    conf: "S",
    references: ["SRC_TERRA_FAMILY", "SRC_TERRA_HOUSING_CONTEXT"],
    st: ["青年", "壮年", "老年"],
    need: ["配偶者と別居生活を相談する時期"],
    w: 0.7,
    t: "離れて暮らす{sp}から、今の部屋の家賃や、もう少し落ち着いて眠れる場所に移りたいという相談が届いた。貸間の案内を見比べながら、相部屋にするか、今のままにするか、それとも静かな個室を借りるか話し合った。",
    c: [
      $terraData.K("引っ越しはせず、今の部屋で暮らし続ける", {}, [
        1,
          "余計な引っ越し代を使わないよう、今の部屋にそのまま住み続けることに決めた。",
        { spouseHousingKeep: 1 }
      ]),
      $terraData.K(
        "家賃を抑えられる相部屋や間借りを探す（年{spouseSharedHousingCost}、転居費{spouseHousingSetupCost}）",
        {
          show: s => $rules.family.spouseHousingPlan(s.sp) !== "shared",
          en: s => $rules.family.spouseHousingTransitionAffordable(s, "shared"),
          why: "配偶者の収入や仕送りでは、引っ越し代とこれからの生活費・療養費が足りない"
        },
        [
          1,
          "出費を抑えるため、相部屋や間借りを探すことにした。寝起きや食事の時間に気を使うことになるが、背に腹は代えられなかった。",
          { spouseHousingPlan: "shared", rl: 1 }
        ]
      ),
      $terraData.K(
        "無理のない普通の貸間を借りる（年{spouseHousingStandardCost}）",
        {
          show: s => $rules.family.spouseHousingPlan(s.sp) !== "standard",
          en: s => $rules.family.spouseHousingTransitionAffordable(s, "standard"),
          why: "配偶者の収入や仕送りでは、引っ越し代とこれからの生活費・療養費が足りない"
        },
        [
          1,
          "標準的な貸間に落ち着くことに決め、毎月の家賃を無理なく払っていけるようやりくりを整えた。",
          { spouseHousingPlan: "standard", rl: 1 }
        ]
      ),
      $terraData.K(
        "周囲に気兼ねせず休める個室を探す（年{spouseHousingPrivateCost}、転居費{spouseHousingSetupCost}）",
        {
          show: s => $rules.family.spouseHousingPlan(s.sp) !== "private",
          en: s => $rules.family.spouseHousingTransitionAffordable(s, "private"),
          why: "配偶者の収入や仕送りでは、引っ越し代とこれからの生活費・療養費が足りない"
        },
        [
          1,
          "誰にも気兼ねせず体を休められる個室を探し始めた。敷金や家賃はかさむが、静かに眠れる部屋を何より優先した。",
          { spouseHousingPlan: "private", rl: 2, p: 1 }
        ]
      )
    ]
  });

  $terraData.EV.find(e => e.id === "family_spouse_infected_housing_pressure").t.push({
    t: "離れて暮らす{sp}のアパートで、部屋の契約更新が難航していると知らせが届いた。大家や管理人の顔色をうかがいながら、このまま住み続けられるのか不安な日々を送っているらしい。"
  });

  const divorceResidenceCoParentDead = s => {
    const child = (s.kids || []).find(item => item.id === s.eventRelativeId),
      parent = (s.relationshipHistory || []).find(
        person => person.id === child?.otherParentId && person.ending === "離婚"
      );
    return formerSpouseDeathKnown(parent);
  };

  $terraData.EV.push({
    id: "family_divorce_child_residence",
    conf: "S",
    references: ["SRC_TERRA_FAMILY"],
    st: ["青年", "壮年", "老年"],
    need: ["離婚後の子の生活先を相談"],
    cd: 2,
    w: 1,
    pri: true,
    t: [
      {
        when: "離婚後の子のもう一方の親の訃報を確認済み",
          t: "別れた相手の訃報が届いた。手紙には、残された子どもが今誰の元で暮らしているのかまでは書かれていなかった。すぐにこちらで引き取ると伝えるか、親族に居場所を尋ねるか、胸がざわついた。"
      },
      {
        when: "扶養中の感染者",
        t: "別れた{formerSpouse}との間に生まれた子が、鉱石病にかかったと知らせてきた。あの子がどこで暮らし、薬代や診察費をどう工面していくか、子どもの気持ちを一番に考えながら元配偶者へ手紙を書いた。"
      },
      {
        t: "別れた{formerSpouse}との子のことで、これからどちらの家で暮らし、養育費をどう出し合うか話し合う時期が来た。子どもの気持ちを確かめながら、自分の稼ぎでどこまで支えられるか考えた。"
      }
    ],
    c: [
      $terraData.K("自分の家で引き取って育てたいと、子どもと元配偶者に伝える", { show: s => !divorceResidenceCoParentDead(s) }, [
        1,
        "子どもと元配偶者へ、これからは自分の手元で暮らさないかと手紙を出した。返事が届くまで、寝床をいつでも使えるよう空けて待った。",
        { childResidenceProposal: { plan: "self" } }
      ]),
      $terraData.K(
        "元配偶者の家で育ててもらい、年に{divorceChildSupportAnnualCost}の養育費を送る",
        {
          show: s => !divorceResidenceCoParentDead(s),
          en: s =>
            $rules.economy.availableFunds(s) >=
            $rules.family.divorceChildSupportAnnualCost(
              s,
              (s.kids || []).find(child => child.id === s.eventRelativeId)
            ) +
              $rules.economy.annualReserve(s),
          why: "向こうの物価に合わせた毎年の養育費と自分の生活費を両立できない"
        },
        [
          1,
          "元配偶者へ、そちらで暮らしを続けてもらい、年に{divorceChildSupportAnnualCost}の養育費を送ると手紙を書いた。",
          { childResidenceProposal: { plan: "former_support" } }
        ]
      ),
      $terraData.K("元配偶者の家に任せ、決まった仕送りは約束しない", { show: s => !divorceResidenceCoParentDead(s) }, [
        1,
        "暮らしは元配偶者の家に任せたいと手紙を出した。余裕がないため定期的な仕送りは約束できず、向こうの返事を待った。",
        { childResidenceProposal: { plan: "former" } }
      ]),
      $terraData.K("二つの家を行き来させ、養育費も半分ずつ出し合う案を伝える", { show: s => !divorceResidenceCoParentDead(s) }, [
        1,
        "子どもが二つの家を行き来できるようにし、費用も分け合おうと提案した。向こうの返事を待つことにした。",
        { childResidenceProposal: { plan: "shared" } }
      ]),
      $terraData.K("今は話を動かさず、これまでのやり方を続ける", { show: s => !divorceResidenceCoParentDead(s) }, [
        1,
        "今は新しい提案をせず、これまで通りのやり方で様子を見ることにした。",
        { childResidenceReview: 1 }
      ]),
      $terraData.K("子ども本人へ、自分の家で一緒に暮らそうと伝える", {
        show: divorceResidenceCoParentDead
      }, [
        1,
        "子ども本人へ、いつでもこちらの家へ来ていいと手紙を書いた。あの子がどうしたいか、返事を待つことにした。",
        { childResidenceProposal: { plan: "self" } }
      ]),
      $terraData.K("親族に手紙を出し、子どもが今どこにいるか尋ねる", {
        show: divorceResidenceCoParentDead
      }, [
        1,
        "心当たりの親族へ急いで手紙を出し、子どもが今どこで誰と暮らしているか教えてほしいと頼んだ。",
        { childResidenceReview: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_school_habit",
    conf: "S",
    references: ["SRC_TL_EARLY", "SRC_TERRA_FAMILY"],
    st: ["児童", "少年"],
    need: ["国:ウルサス", "就学中"],
    ge: { year: 1092, age: 8 },
    le: { year: 1094, age: 14 },
    once: true,
    w: 0.32,
    t: "学校へ通える日は、冷たい空気の教室で授業を受けた。試験が近づくにつれ、放課後に残って勉強するか、まっすぐ帰って家の手伝いをするか迷った。家に帰れば、夕飯の支度や雑用が待っている。",
    c: [
      $terraData.K("放課後に少し教室へ残り、苦手な読み書きを復習する", {}, [
        1,
        "週に何度か居残って、ノートの文字を丁寧に見直した。わからないところを聞き合える友人もでき、自分の言葉で書き留める癖がついた。",
        {
          lifeSkill: {
            id: "ursus-school-study",
            title: "授業の復習と読み書き",
            delta: 1,
            context: "放課後に教室でノートを見直した"
          },
          lifeGoal: {
            id: "ursus-school-learning",
            title: "学びを続け、選べる仕事を増やす",
            priority: "学びと将来",
            action: "start"
          },
          p: 1
        }
      ]),
      $terraData.K("家の買い出しや勘定を手伝い、暮らしの数字を覚える", {}, [
        1,
        "放課後はすぐ家に帰り、買い出しや小銭の計算を手伝った。市場の相場ややりくりを肌で覚え、宿題は夜遅くにランプの下で片づけた。",
        {
          lifeSkill: {
            id: "ursus-household-accounts",
            title: "家計の記録と買い物の勘定",
            delta: 1,
            context: "家の買い出しと勘定を手伝った"
          },
          lifeGoal: {
            id: "ursus-school-learning",
            title: "学びを続け、選べる仕事を増やす",
            priority: "家の手伝いと学び",
            action: "compromise",
            note: "家の手伝いと両立できる範囲で学ぶ"
          },
          p: 1
        }
      ]),
      $terraData.K("今日はまっすぐ帰り、家族と過ごす時間を大事にする", {}, [
        1,
        "居残りはせず、日が暮れる前に家へ帰った。家族と温かいスープを飲み、眠る前に明日の教科書を鞄へ詰めた。",
        {
          lifeGoal: {
            id: "ursus-school-learning",
            title: "学びを続け、選べる仕事を増やす",
            priority: "暮らしの安定",
            action: "pause",
            note: "無理な勉強はせず、日々の暮らしを大事にする"
          },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_classmate_contact",
    conf: "S",
    references: ["SRC_TL_EARLY", "SRC_TERRA_FAMILY"],
    st: ["児童", "少年"],
    need: ["国:ウルサス", "就学中"],
    after: { id: "life_ursus_school_habit", min: 1 },
    ge: { year: 1094, age: 8 },
    le: { year: 1096, age: 16 },
    once: true,
    w: 0.28,
    t: "よく学校を休む同級生が、休み時間に遠慮がちにノートを見せてほしいと声をかけてきた。机を寄せて黒板を写したページを開く。これからも気に留めてやるか、距離を測りかねていた。",
    c: [
      $terraData.K("ノートを貸してやり、返すのはいつでもいいと伝える", {}, [
        1,
        "ノートを手渡すと、相手は試験に出そうな箇所を一心に写し取って返してくれた。それから廊下ですれ違えば、自然と軽く手を振る仲になった。",
        {
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "同級生と無理のない範囲で連絡を保つ",
            priority: "同級生との縁",
            action: "start"
          },
          lifeSkill: {
            id: "ursus-peer-study",
            title: "ノートの共有と説明",
            delta: 1,
            context: "休みがちな同級生へ授業の内容を伝えた"
          },
          groupStanding: {
            id: "ursus-classroom-peers",
            title: "同じ教室の同級生",
            delta: 1,
            reason: "休みがちな同級生に快くノートを見せた"
          },
          p: 1
        }
      ]),
      $terraData.K("根掘り葉掘り聞かず、頼まれた時だけ手を貸す", {}, [
        1,
        "休んだ理由は尋ねず、相手が困って声をかけてきた時だけノートを見せた。互いに踏み込みすぎない、静かな付き合いが続いた。",
        {
          lifeSkill: {
            id: "ursus-peer-study",
            title: "ノートの共有と説明",
            delta: 1,
            context: "相手の距離感を守りながら授業内容を伝えた"
          },
          groupStanding: {
            id: "ursus-classroom-peers",
            title: "同じ教室の同級生",
            delta: 1,
            reason: "相手の事情に踏み込みすぎず手を貸した"
          },
          p: 1
        }
      ]),
      $terraData.K("自分の勉強と家の手伝いで手いっぱいなので、深入りしない", {}, [
        1,
        "自分の復習と家の用事に追われ、それ以上は構ってやれなかった。廊下で目が合えば会釈はしたが、その同級生の席はその後もよく空いていた。",
        {
          lifeGoal: {
            id: "ursus-school-learning",
            action: "continue",
            note: "家の用事と自分の勉強を優先した"
          },
          p: 0
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_school_aid_later",
    conf: "S",
    references: ["SRC_TL_CHERNOB_WINDOW", "SRC_TERRA_FAMILY"],
    st: ["青年", "壮年"],
    need: ["ursus_school_contact_ongoing"],
    after: { id: "life_ursus_school_aid_adult_followup", min: 5 },
    ge: { year: 1105, age: 24 },
    once: true,
    w: 0.2,
    t: "チェルノボーグから散り散りになった昔の同級生から、短い葉書が届いた。あの日から細々と便りを続けてきたが、お互い住む街も仕事もすっかり変わった。これからも年に一度の便りを続けるか、連絡網の世話役を誰かに引き継ぐか、ふと考えた。",
    c: [
      $terraData.K("年に一度だけ近況を送り、返事は相手の気ままに任せる", {}, [
        1,
        "年に一度、季節の変わり目に短い手紙を出すことにした。忘れた頃に返事が届けば、それだけで無事を知ることができた。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "role",
            role: "年に一度の便りを続ける元同級生",
            note: "返事を急かさず、細く長い縁を保つ"
          },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "同級生と無理のない範囲で連絡を保つ",
            priority: "同級生との縁",
            action: "continue"
          },
          groupStanding: {
            id: "chernobog-students",
            title: "近隣の中学生",
            delta: 1,
            reason: "大人になってからも負担にならない便りを続けた"
          },
          p: 1
        }
      ]),
      $terraData.K("構わないと言ってくれた人の宛先だけ、次の世話役へ託す", {}, [
        1,
        "一人ずつ意思を確かめ、連絡先を残してもいいと言ってくれた同級生の分だけ次の世話役に託した。肩の荷がひとつ降りた気がした。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "leave",
            note: "了承を得た同級生の連絡先を次の世話役へ引き継いだ"
          },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "同級生と無理のない範囲で連絡を保つ",
            priority: "同級生との縁",
            action: "complete",
            note: "同級生の連絡網を次の世話役へ託した"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグから避難した元同級生の連絡記録",
            kind: "later-handover",
            description:
              "連絡先を残すことに同意した元同級生たちの宛先を、次の世話役へ引き継いだ。"
          },
          p: 1
        }
      ]),
      $terraData.K("世話役を終え、それぞれの今の暮らしに戻る", {}, [
        1,
        "長く続けた連絡係に区切りをつけ、古い住所録を棚の奥へしまった。その夜はペンを取らず、静かに部屋の灯りを消した。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "leave",
            note: "長年の便りを終え、それぞれの暮らしへ戻った"
          },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "同級生と無理のない範囲で連絡を保つ",
            priority: "同級生との縁",
            action: "abandon",
            note: "生活の変化を受け、連絡係の役目を終えた"
          },
          p: 0
        }
      ])
    ]
  });
});
