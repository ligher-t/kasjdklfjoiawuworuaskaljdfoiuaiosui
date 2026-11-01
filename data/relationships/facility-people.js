// relationships/facility-people: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("relationships/facility-people", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "peopleRefs",
    ["SRC_PEOPLE_GAME", "SRC_PEOPLE_MOUSSE", "SRC_PEOPLE_PODENCO", "SRC_PEOPLE_SUSSURRO"],
    false
  );

  $terraData.EV.push(
    {
      id: "people_clinic_introduction",
      conf: "S",
      references: $terraData.peopleRefs,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 6,
      w: 0.47,
      show: s =>
        !!$rules.facilities.activeFacility(s, "clinic") && !$rules.facilities.facilityPersonFor(s, "clinic"),
      t: "消毒液の匂いが漂う診療所の窓口で、職員が忙しそうにカルテの束を仕分けていた。壁には診察日と受付時間の案内が貼られている。",
      c: [
        $terraData.K("窓口の職員に声をかけ、受診の段取りを聞いておく", {}, [
          1,
          "名前を名乗って声をかけると、職員は手を止めて混み合う時間帯や受診の流れを丁寧に教えてくれた。顔と名前を覚えてもらい、次から足を運びやすくなった。",
          { facilityPersonAction: { kind: "clinic", action: "meet" }, rl: 1 }
        ]),
        $terraData.K("壁の案内だけ確かめて帰る", {}, [
          1,
          "壁の貼り紙で診察日と受付時間だけを確かめ、忙しそうな職員には軽く会釈して診療所をあとにした。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "people_school_introduction",
      conf: "S",
      references: $terraData.peopleRefs,
      st: ["児童", "少年", "青年"],
      cd: 6,
      w: 0.65,
      show: s =>
        !!s.fl?.sch && !$rules.facilities.facilityPersonFor(s, "school") && !$rules.conditions.restricted(s),
      t: "放課後の教室で、授業を受け持つ先生が教卓の上のプリントを揃えていた。手元のノートには、授業中に聞きそびれた疑問がいくつも残っている。",
      c: [
        $terraData.K("教卓へ歩み寄り、分からなかった箇所を尋ねる", {}, [
          1,
          "思い切って名前を名乗り、つまずいていた箇所を尋ねた。先生は黒板の隅を使ってかみ砕いて教えてくれ、次の授業からも質問しやすくなった。",
          { facilityPersonAction: { kind: "school", action: "meet" }, k: 1 }
        ]),
        $terraData.K("ひとりで教科書とノートを見直す", {}, [
          1,
          "自分の席でノートを広げ、分からなかった問題の解き方を教科書の例題から探し出した。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "people_work_introduction",
      conf: "S",
      references: $terraData.peopleRefs,
      st: ["青年", "壮年", "老年"],
      cd: 6,
      w: 0.6,
      show: s =>
        !!$rules.facilities.activeFacility(s, "workplace") &&
        !$rules.facilities.facilityPersonFor(s, "workplace"),
      t: "次の持ち場へ荷や伝票を引き継ぐタイミングが噛み合わず、手元の作業がたびたび止まった。隣の工程を受け持つ働き手と、一度きちんと話をしておいた方がよさそうだ。",
      c: [
        $terraData.K("自分から名乗り、引き継ぎの合図や段取りをすり合わせる", {}, [
          1,
          "作業の合間に声をかけて名乗り、お互いの手が空きやすいタイミングを確かめ合った。翌朝からは顔を見れば自然と声が出るようになった。",
          { facilityPersonAction: { kind: "workplace", action: "meet" }, k: 1, rl: 1 }
        ]),
        $terraData.K("余計な口は挟まず、自分の受け持ち分だけをこなす", {}, [
          1,
          "自分の持ち場の仕事だけを黙々と片づけ、決まった置き場へ伝票と荷を回した。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "people_clinic_followup",
      conf: "S",
      references: $terraData.peopleRefs,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 4,
      w: 0.55,
      show: s => {
        const p = $rules.facilities.facilityPersonFor(s, "clinic");
        return !!p && s.year - p.metYear >= 2 && s.year - (p.contacts.at(-1)?.year ?? p.metYear) >= 2;
      },
      t: "しばらく足が遠のいていた診療所の近くを通りかかり、以前親切に応対してくれた職員の顔を思い出した。今もあの窓口にいるだろうか。",
      c: [
        $terraData.K("立ち寄って顔を見せ、最近の診察時間を聞いておく", {}, [
          1,
          "窓口をのぞいて声をかけると、相手もこちらを覚えていてくれた。最近の混み具合や薬の受け取り方を教えてもらい、いざという時の安心が増した。",
          { facilityPersonAction: { kind: "clinic", action: "ask" }, k: 1 }
        ]),
        $terraData.K("用もないのに立ち寄るのは控え、そのまま通り過ぎる", {}, [
          1,
          "具合が悪くなってから行けばいいと思い直し、診療所の前をそのまま通り過ぎて家路を急いだ。",
          { h: 1 }
        ])
      ]
    },
    {
      id: "people_school_followup",
      conf: "S",
      references: $terraData.peopleRefs,
      st: ["児童", "少年", "青年", "壮年"],
      cd: 5,
      w: 0.54,
      show: s => {
        const p = $rules.facilities.facilityPersonFor(s, "school");
        return !!p && s.year - p.metYear >= 2 && s.year - (p.contacts.at(-1)?.year ?? p.metYear) >= 2;
      },
      t: "ふとした拍子に、以前わかりやすく勉強を教えてくれた先生のことを思い出した。あの学び舎では今も変わらず授業が続いているだろうか。",
      c: [
        $terraData.K("学び舎を訪ね、先生の近況を聞いてみる", {}, [
          1,
          "授業の合間を見計らって顔を出すと、最近の教室の様子や生徒たちの話を温かく聞かせてくれた。",
          { facilityPersonAction: { kind: "school", action: "ask" }, p: 1 }
        ]),
        $terraData.K("訪ねるのはやめ、当時のノートを引っ張り出して読み返す", {}, [
          1,
          "棚の奥から古いノートを取り出し、かつて教わった解き方やページの隅の走り書きを懐かしく読み返した。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "people_work_followup",
      conf: "S",
      references: $terraData.peopleRefs,
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.58,
      show: s => {
        const p = $rules.facilities.facilityPersonFor(s, "workplace");
        return !!p && s.year - p.metYear >= 2 && s.year - (p.contacts.at(-1)?.year ?? p.metYear) >= 2;
      },
      t: "久しぶりに、かつて作業の手順を教え合った顔なじみと同じ現場に入った。相手の胸元の名札には、以前とは違う部署名が記されている。",
      c: [
        $terraData.K("休憩時間に声をかけ、今の持ち場の話を聞く", {}, [
          1,
          "お茶を飲みながら新しい部署の苦労話を聞き、現場ごとの段取りの違いを教えてもらった。かつて並んで働いた頃の感覚が自然と戻ってきた。",
          { facilityPersonAction: { kind: "workplace", action: "ask" }, rl: 1 }
        ]),
        $terraData.K("遠くから会釈だけして、自分の作業に集中する", {}, [
          1,
          "軽く目礼だけ交わして自分の持ち場を片づけ、段取りの手際を確かめながら終業まで作業に専念した。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "people_clinic_small_help",
      conf: "S",
      references: $terraData.peopleRefs,
      st: ["青年", "壮年", "老年"],
      cd: 6,
      w: 0.3,
      show: s => {
        const p = $rules.facilities.facilityPersonFor(s, "clinic");
        return (
          !!p && p.actualStatus === "working" && p.knownStatus === "working" && p.contactState !== "distant"
        );
      },
      t: "診療所の待合室で、初めて来たらしい患者がどの列に並べばいいのか分からず立ち尽くしていた。顔なじみの職員は、別の患者を支えて診察室へ入っていくところだった。",
      c: [
        $terraData.K("声をかけ、症状に合う受付窓口まで案内する", {}, [
          1,
          "困っている患者に声をかけ、初診の窓口と番号札の取り方を一緒に確かめてあげた。戻ってきた職員からも目で礼を言われた。",
          { facilityPersonAction: { kind: "clinic", action: "help" }, rl: 1 }
        ]),
        $terraData.K("壁の案内板だけ教え、詳しいことは職員を待つよう伝える", {}, [
          1,
          "受付の案内板を指し示し、少し待てば担当の職員が戻ってくるからと伝えて席を譲った。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "people_school_small_help",
      conf: "S",
      references: $terraData.peopleRefs,
      st: ["児童", "少年", "青年", "壮年"],
      cd: 7,
      w: 0.3,
      show: s => {
        const p = $rules.facilities.facilityPersonFor(s, "school");
        return !!p && p.actualStatus === "working" && p.knownStatus === "working";
      },
      t: "学び舎の前を通りかかると、顔なじみの先生が重そうな教材の箱を一人で運んでいた。次の授業が始まるまでに教室へ並べたいらしい。",
      c: [
        $terraData.K("箱を半分持ち、教室の棚へ並べるのを手伝う", {}, [
          1,
          "教材の箱を一緒に教室まで運び、授業の鐘が鳴る前に棚へきれいに並べ終えた。",
          { facilityPersonAction: { kind: "school", action: "help" }, rl: 1 }
        ]),
        $terraData.K("今は先を急いでいると詫びて通り過ぎる", {}, [
          1,
          "これから外せない用事があると断り、会釈をして自分の道へ戻って用事を手早く済ませた。",
          { h: 1 }
        ])
      ]
    },
    {
      id: "people_work_small_help",
      conf: "S",
      references: $terraData.peopleRefs,
      st: ["青年", "壮年", "老年"],
      cd: 5,
      w: 0.32,
      show: s => {
        const p = $rules.facilities.facilityPersonFor(s, "workplace");
        return !!p && p.actualStatus === "working" && p.knownStatus === "working";
      },
      t: "作業が長引き、外がすっかり暗くなった現場で、顔なじみの同僚がまだ一人で散らかった工具や端材を片づけていた。",
      c: [
        $terraData.K("「手伝おうか」と声をかけ、残りの後片付けを分担する", {}, [
          1,
          "二人で手分けして工具を拭き上げ、端材を片づけた。一人ならまだかかっていたはずの作業がすぐに終わり、並んで職場を出た。",
          { facilityPersonAction: { kind: "workplace", action: "help" }, rl: 1 }
        ]),
        $terraData.K("自分の持ち場だけ片づけ、「お先」と声をかけて帰る", {}, [
          1,
          "自分の受け持ち分だけをきっちり片づけ、残る同僚に労いの声をかけて早く家へ戻り、体を休めた。",
          { h: 1, p: 1 }
        ])
      ]
    }
  );

  $terraData.SETTING_SOURCES.SRC_PEOPLE_LIFE_V74 = {
    title: "施設で出会った人の独立した生活モデル v74",
    kind: "ゲーム上の設計仮説",
    note: "住居・家族の用事・家計の余裕・将来の希望を、個別NPCごとに保持する。生活史資料II/III巻の具体例を参照するが、氏名や各種確率は架空。"
  };

  for (const [id, label, value, description] of [
    [
      "social.npcHousingDisruption",
      "NPC住居不安定化",
      0.035,
      "同じ地区で住まいの落ち着きが変わる場合を抽象化"
    ],
    ["social.npcHousingRecovery", "NPC住居回復", 0.25, "住居事情が落ち着く可能性"],
    ["social.npcSharedHousingChange", "NPC共同生活の見直し", 0.05, "同居形態が変わる可能性"],
    ["social.npcCareStart", "NPC家族の用事発生", 0.045, "親族・家族の世話が増える可能性"],
    ["social.npcCareEase", "NPC家族の用事緩和", 0.18, "家族の用事が軽くなる可能性"],
    ["social.npcGoalReview", "NPC生活目標見直し", 0.06, "本人が今後の働き方を考え直す可能性"],
    ["social.npcCareGoalShift", "NPC家族時間の優先", 0.075, "家族の用事と仕事の両立を優先する可能性"],
    ["social.npcFinancialPressure", "NPC家計逼迫", 0.07, "暮らしのやりくりが難しくなる可能性"],
    ["social.npcFinancialRecovery", "NPC家計の立て直し", 0.25, "暮らしの立て直しが進む可能性"],
    ["social.npcFinancialStabilize", "NPC家計の安定", 0.32, "やりくりが落ち着く可能性"],
    [
      "social.npcLeftWorkFinancialPressure",
      "NPC離職後の家計負担",
      0.3,
      "働き口を離れた年に家計が圧迫される可能性"
    ],
    [
      "social.npcCareLeaveWorkChance",
      "NPC家族事情による仕事の中断",
      0.025,
      "家族の用事がある人が一時的に仕事を中断する可能性"
    ]
  ])
    $terraData.SIM_PARAMS.push({
      id,
      label,
      value,
      unit: "抽象年次機会率",
      status: "S",
      scope: "周辺人物の独立生活",
      description: `${description}。各値は正史・人口統計ではない。`,
      source: "ゲーム用仮定",
      references: ["SRC_PEOPLE_LIFE_V74"],
      usedBy: ["施設関係者の年次更新"]
    });

  $terraData.SETTING_SOURCES.SRC_MULTISITE_V75 = {
    title: "ウォルモンドの薄暮 TW-S-1『三体の巨像』",
    url: "https://shimadouma.github.io/astrhtml/events/act11d0/stories/TW-S-1.html",
    kind: "日本語版ストーリー閲覧",
    note: "臨時診療所を設けるために協力者を募る描写。地域の医療を単一の常設施設とみなさない設計上の参照であり、モデルの施設数を規定しない。"
  };

  $terraData.SETTING_SOURCES.SRC_MULTISITE_WORK_V75 = {
    title: "アークナイツ オペレーター・ナスティの基地スキル",
    url: "https://terra-archive.net/ja/operators/char_4212_nasti",
    kind: "日本語版ゲーム記述（二次掲載）",
    note: "製造所、ライン生命、職務配置の記述から勤務機能の多様性を参照。ゲーム内基地を一般社会の雇用制度と同一視しない。"
  };

  $terraData.SIM_PARAMS.push({
    id: "social.siteIndividualVariation",
    label: "同地区にある個別施設の利用条件差",
    value: 0.2,
    unit: "状態係数幅",
    status: "S",
    scope: "複数施設",
    description: "同じ地域でも施設ごとの稼働状況が異なるためのゲーム用仮定。原作の施設数・統計とは無関係。",
    source: "ゲーム用仮定",
    references: ["SRC_MULTISITE_V75"],
    usedBy: ["facilityStatus"]
  });

  $terraData.EVENT_EFFECT_TYPES.object.push("siteAction");

  $terraData.EVENT_FIELD_META.siteAction = {
    status: "S",
    valueType: "object",
    unit: "施設の利用先・勤務先の変更",
    meaning: "成功分岐だけで同種の別施設に接点を変更し、旧施設の人物・相談記録を移動させない",
    assumption: "S"
  };

  $define("siteRefs", ["SRC_MULTISITE_V75", "SRC_MULTISITE_WORK_V75"], false);

  $define(
    "siteEvents",
    [
      {
        id: "site_workplace_alternative",
        conf: "S",
        references: $terraData.siteRefs,
        st: ["青年", "壮年", "老年"],
        cd: 6,
        w: 0.48,
        show: s => !!$rules.facilities.alternativeFacility(s, "workplace"),
        t: "同じ街区の別の仕事場でも、自分と同じ職種の働き手を募集しているのを見かけた。始業時刻や仕事の回し方は今の職場とだいぶ違うらしい。移ってみるべきか迷った。",
        c: [
          $terraData.K(
            "働きやすさを確かめて応募する",
            {},
            [
              0.48,
              "面接に通って新しい仕事場へ移った。工具の置き場所も休憩の空気も前とは違い、まずは周りの顔と名前を覚えるところから始まった。",
              { siteAction: { kind: "workplace", action: "switch" }, rl: 1 }
            ],
            [
              1,
              "色よい返事はもらえず、話は立ち消えになった。気持ちを切り替えて、いつもの仕事場へ足を向けた。",
              { p: -1 }
            ]
          ),
          $terraData.K("すぐには動かず、今の職場と賃金や時間を比べておく", {}, [
            1,
            "今回は応募を見送り、今の職場で働き続けた。いざという時のために、向こうの賃金や勤務時間だけを頭に入れておいた。",
            { k: 1 }
          ])
        ]
      },
      {
        id: "site_clinic_contact_change",
        conf: "S",
        references: $terraData.siteRefs,
        st: ["少年", "青年", "壮年", "老年"],
        cd: 5,
        w: 0.45,
        show: s => !!$rules.facilities.alternativeFacility(s, "clinic"),
        t: "いつも歩いている通りの一本裏に、別の小さな診療所があるのを見つけた。今の通院先とは開いている時間帯も診てくれる科目も少しずつ違うようだ。",
        c: [
          $terraData.K("これからは新しい方の診療所へ通うことにする", {}, [
            1,
            "仕事の帰りにも立ち寄りやすい新しい診療所へ通院先を切り替えた。次に具合が悪くなったときは、こちらの扉を叩くことにする。",
            { siteAction: { kind: "clinic", action: "switch" }, k: 1 }
          ],
          ),
          $terraData.K("慣れた今の診療所を変えない", {}, [
            1,
            "もう一つ診てもらえる場所があると知っただけで安心し、普段の通院先はこれまでの場所を変えないでおいた。",
            { p: 1 }
          ])
        ]
      },
      {
        id: "site_school_transfer",
        conf: "S",
        references: $terraData.siteRefs,
        st: ["児童", "少年", "青年"],
        cd: 7,
        w: 0.4,
        show: s =>
          !!s.fl?.sch &&
          !$rules.conditions.restricted(s) &&
          !!$rules.facilities.alternativeFacility(s, "school"),
        t: "今通っている学び舎とは別の教室が、年度の途中からでも生徒を受け入れると案内を出していた。通いやすさや授業の進み具合を家の人と話し合った。",
        c: [
          $terraData.K(
            "新しい学び舎へ転入を申し込む",
            {},
            [
              0.55,
              "受け入れが決まり、新しい学び舎へ机を移した。使っている教材も先生の教え方も違い、最初のひと月は放課後に残って追いつくのに必死だった。",
              { siteAction: { kind: "school", action: "switch" }, k: 1 }
            ],
            [
              1,
              "今は席に空きがないと断られた。これまで通りの学び舎へ通い続けながら、次の機会を待つことにした。",
              { p: -1 }
            ]
          ),
          $terraData.K("馴染んだ今の学び舎に通い続ける", {}, [
            1,
            "せっかく慣れた友人や先生と離れるのはやめ、今の教室で勉強を続けることにした。",
            { rl: 1 }
          ])
        ]
      },
      {
        id: "site_workplace_old_contact",
        conf: "S",
        references: $terraData.siteRefs,
        st: ["青年", "壮年", "老年"],
        cd: 7,
        w: 0.36,
        show: s =>
          (s.siteAffiliationHistory || []).some(
            x => x.kind === "workplace" && x.action === "ended" && x.reason === "chosen-transfer"
          ),
        t: "新しい職場で手を動かしている最中、ふと前の現場で教わった工具の並べ方や段取りが頭をよぎった。今の職場とはやり方がだいぶ違う。",
        c: [
          $terraData.K("前の職場で身につけた工夫を、今の作業にも取り入れてみる", {}, [
            1,
            "以前の現場でやっていた工具の置き方を自分の手元で試してみた。手探りで道具を探す無駄が減り、夕方の疲れがいくらか軽くなった。",
            { k: 2 }
          ]),
          $terraData.K("前のやり方は忘れ、今の職場の流儀に合わせる", {}, [
            1,
            "郷に入れば郷に従えと割り切り、今の職場のやり方と安全確認を優先して手を動かした。",
            { p: 1 }
          ])
        ]
      },
      {
        id: "site_clinic_different_conditions",
        conf: "S",
        references: $terraData.siteRefs,
        st: ["少年", "青年", "壮年", "老年"],
        cd: 7,
        w: 0.42,
        show: s => {
          const current = $rules.facilities.activeFacility(s, "clinic"),
            other = $rules.facilities.localSites(s.community, "clinic").find(x => x.id !== current?.id);
          return !!current && !!other && current.status !== other.status;
        },
        t: "同じ地区にある二つの診療所で、待合室の混み具合も薬の在庫もまるで違っていた。いざという時どちらへ駆け込むべきか見比べた。",
        c: [
          $terraData.K("それぞれの診察時間や得意な処置を確かめておく", {}, [
            1,
            "急な発熱のときと定期の薬をもらうときで、どちらの診療所へ行くのがよいか頭の中で整理しておいた。",
            {
              k: 1,
              facilityAction: {
                kind: "clinic",
                action: "compare",
                description: "二つの診療窓口の利用条件を確認した"
              }
            }
          ]),
          $terraData.K("迷わずいつもの診療所へ通い続ける", {}, [
            1,
            "勝手のわかっているいつもの診療所へ通い続けることにし、もう一軒は本当に困ったときの控えとして覚えておいた。",
            { p: 1 }
          ])
        ]
      }
    ],
    false
  );

  $terraData.EV.push(...$terraData.siteEvents);
});
