// work/contracts: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("work/contracts", function ($terraData, $define, $rules) {
  "use strict";
  $define("v76WorkRefs", ["SRC_V76_EMPLOYMENT", "SRC_MULTISITE_WORK_V75"], false);

  $define(
    "v76FrictionRefs",
    [
      "SRC_V76_LATERANO_SARKAZ",
      "SRC_V76_SANKTA_SARKAZ",
      "SRC_V76_IBERIA_AEGIR",
      "SRC_V76_TARA",
      "SRC_V76_URSUS",
      "SRC_V76_ENFORCER"
    ],
    false
  );

  $terraData.EV.push(
    {
      id: "job_contract_review_v76",
      conf: "S",
      references: $terraData.v76WorkRefs,
      st: ["青年", "壮年", "老年"],
      cd: 5,
      w: 0.54,
      show: s => !!s.workContract && s.workContract.knownConditions !== "reviewed",
      t: "手渡された雇用契約書には、給金や勤務時間だけでなく、怪我や破損の責任まで細かい文字でびっしり並んでいた。何度読み返しても、自分に有利なのか不利なのか判断がつかない文言がある。",
      c: [
        $terraData.K("判を押す前に、曖昧な条項を確かめる", {}, [
          1,
          "帳場の担当者を捕まえて一つずつ問い質した。渋い顔をされたが、手当の条件だけははっきりさせてから持ち場へ入った。",
          { workContractAction: { action: "review" }, k: 1 }
        ]),
        $terraData.K("波風を立てず、言われた手順に従う", {}, [
          1,
          "余計な口出しはせず、まずは現場のやり方に合わせることにした。引っかかる文言は胸の奥にしまっておいた。",
          { workContractAction: { action: "review" }, p: -1, cr: 1 }
        ])
      ]
    },
    {
      id: "job_contract_negotiation_v76",
      conf: "S",
      references: $terraData.v76WorkRefs,
      st: ["青年", "壮年", "老年"],
      cd: 7,
      w: 0.37,
      show: s =>
        !!s.workContract &&
        s.workContract.knownConditions === "reviewed" &&
        s.workContract.wagePremium < 0.1 &&
        s.community?.facilities?.[s.workContract.siteId]?.status !== "limited",
      t: "今の仕事にもだいぶ手が馴染み、周囲より多くの荷や工程を回せるようになってきた。責任者が一人で帳面をつけている隙を見て、給金の色をつけてもらえないか切り出してみた。",
      c: [
        $terraData.K(
          "これまでの働きぶりを示して掛け合う",
          {},
          [
            0.38,
            "「お前に抜けられると困るからな」と責任者が折れ、次の給金日から少しばかり手当が上乗せされることになった。",
            { workContractAction: { action: "negotiate", result: "approved" }, rl: 2 }
          ],
          [
            1,
            "資材の値上がりと予算の厳しさを理由に、今回は見送られた。それでも頭ごなしには撥ねつけられず、次の更新時にまた話すことになった。",
            { workContractAction: { action: "negotiate", result: "declined" }, p: -1 }
          ]
        ),
        $terraData.K("無理には迫らず、今の持ち場の確認にとどめる", {}, [
          1,
          "深追いはせず、いま任されている仕事の段取りだけをすり合わせて引き下がった。",
          { workContractAction: { action: "review" }, k: 1 }
        ])
      ]
    },
    {
      id: "job_contract_family_schedule_v76",
      conf: "S",
      references: $terraData.v76WorkRefs,
      st: ["青年", "壮年", "老年"],
      cd: 7,
      w: 0.36,
      show: s => !!s.workContract && s.workContract.hours !== "short",
      t: "家の用事や暮らしの段取りと、長い勤務時間の折り合いがつかなくなってきた。稼ぎが減るのを覚悟で、少し早く上がれるよう責任者に掛け合うか迷った。",
      c: [
        $terraData.K(
          "勤務時間を短くできないか相談する",
          {},
          [
            0.64,
            "事情を汲んでもらい、次の割り振りから早めに上がれることになった。袋に入る給金は軽くなるが、夕方に息をつく時間は戻ってきた。",
            { workContractAction: { action: "hours", result: "approved" }, p: 3 }
          ],
          [
            1,
            "「今は代わりに入れる人間がいない」と首を横に振られた。重たい足を引きずりながら、家の段取りをもう一度組み直すしかなかった。",
            { workContractAction: { action: "hours", result: "declined" }, p: -1 }
          ]
        ),
        $terraData.K("時間は変えず、身近な人に手助けを頼む", {}, [
          1,
          "稼ぎを減らすわけにはいかず、手が回らない用事を近所や身内に頼めないか相談して回ることにした。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "inter_laterano_sarkaz_opportunity_v76",
      conf: "S",
      references: ["SRC_V76_LATERANO_SARKAZ", "SRC_V76_SANKTA_SARKAZ"],
      st: ["青年", "壮年"],
      cd: 7,
      w: 0.5,
      show: s =>
        s.r.n === "サルカズ" && ["カズデル", "ヴィクトリア", "リターニア", "ウルサス"].includes(s.res.n),
      t: "割のいいラテラーノ方面への荷運びの募集を見つけたが、隅の細則に「サルカズは通行および滞在資格の事前照会を要す」と刷られていた。給金の額を見るより先に、そこで指が止まった。",
      c: [
        $terraData.K("通行許可の条件を問い合わせ、回り道も探る", {}, [
          1,
          "仲介所へ照会の書類を出し、返事を待つ間のつなぎとして、検問を避けられる別ルートや近場の荷運びを探し回った。",
          {
            intergroupAction: {
              context: "border",
              topic: "ラテラーノ方面の通行制限",
              response: "資格を照会し代替経路を検討"
            },
            k: 1
          }
        ]),
        $terraData.K("面倒を被る前にその求人はあきらめる", {}, [
          1,
          "貼り紙から目を離してその場を立ち去った。翌朝、いつもの荷主のところへ顔を出して近場の仕事を分けてもらった。",
          {
            intergroupAction: {
              context: "border",
              topic: "ラテラーノ方面の通行制限",
              response: "制約により応募を見送った"
            },
            p: -2
          }
        ])
      ]
    },
    {
      id: "inter_sankta_sarkaz_work_v76",
      conf: "S",
      references: ["SRC_V76_SANKTA_SARKAZ", "SRC_V76_LATERANO_SARKAZ", "SRC_V76_ENFORCER"],
      st: ["青年", "壮年"],
      cd: 6,
      w: 0.52,
      show: s => ["サルカズ", "サンクタ"].includes(s.r.n) && s.job > 0 && s.res.n !== "ラテラーノ",
      t: "昼休みの控え室で、誰かがサンクタとサルカズの古い因縁を持ち出し、「あいつと組むのは気味が悪い」「手元も怪しいものだ」と露骨に嫌味を言い始めた。持ち場を組み替えろという声まで上がり、空気が張り詰める。",
      c: [
        $terraData.K("種族と仕事の腕は別だと遮り、持ち場を確かめる", {}, [
          1,
          "「昔の話を現場に持ち込むな」と声を張り、互いの受け持ちと段取りをその場で確かめ合った。気まずい沈黙のあと、それぞれ無言で工具を手に取った。",
          {
            intergroupAction: {
              context: "workplace",
              topic: "サンクタとサルカズの歴史認識",
              response: "職務上の協力を確認"
            },
            rl: 1
          }
        ]),
        $terraData.K("口論には取り合わず、午後の段取りを確認する", {}, [
          1,
          "言い争う連中に背を向け、午後に運ぶ資材の数を確かめた。休みが終わる鐘が鳴るまで、棘のある声は部屋の隅でくすぶり続けていた。",
          {
            intergroupAction: {
              context: "workplace",
              topic: "サンクタとサルカズの歴史認識",
              response: "対話を保留し手順を確認"
            },
            p: 0
          }
        ])
      ]
    },
    {
      id: "inter_victoria_taran_speech_v76",
      conf: "S",
      references: ["SRC_V76_TARA"],
      st: ["少年", "青年", "壮年"],
      cd: 7,
      w: 0.52,
      show: s => s.res.n === "ヴィクトリア",
      t: "役所の窓口で、ターラー訛りの抜けない労働者が係員に冷たくあしらわれていた。本人は就労の書類を見てほしいと必死に食い下がっているのに、係員はろくに目も合わせず「あっちの列へ並び直せ」と顎でしゃくっている。",
      c: [
        $terraData.K("横から口を添え、係員に説明を求める", {}, [
          1,
          "二人の間に割り込んで案内書きを指さし、ここで受け付けるはずだと係員に食い下がった。渋々書類を受け取るのを見届けると、相手は深く息を吐いて頭を下げた。",
          {
            intergroupAction: {
              context: "institution",
              topic: "ターラーの言葉と窓口の扱い",
              response: "手続きの説明を支援"
            },
            rl: 2
          }
        ]),
        $terraData.K("本人の気持ちを確かめてから手を貸す", {}, [
          1,
          "列を外れた本人に声をかけると、「一度書類を揃え直してくる」と唇を噛んでいた。次にまた追い返されたら一緒に来ようと約束して別れた。",
          {
            intergroupAction: {
              context: "institution",
              topic: "ターラーの言葉と窓口の扱い",
              response: "当人の意向を確認"
            },
            k: 1
          }
        ])
      ]
    },
    {
      id: "inter_ursus_minority_work_v76",
      conf: "S",
      references: ["SRC_V76_URSUS"],
      st: ["青年", "壮年"],
      cd: 8,
      w: 0.42,
      show: s => s.res.n === "ウルサス" && s.r.n !== "ウルサス" && s.job === 14,
      t: "兵営の点呼で名簿をめくっていた担当官が、あなたの出自欄でぴたりとペンを止めた。隣のウルサス人兵士には一言二言で済ませた身元の確認を、こちらにだけ執拗に繰り返す。なぜそこまで疑うのか、担当官は何一つ説明しなかった。",
      c: [
        $terraData.K(
          "なぜ自分だけ確認が長いのか尋ねる",
          {},
          [
            0.55,
            "担当官は「規則通りの手順だ」と無表情に規定書を叩いた。それ以上は追及できなかったが、名簿が閉じられたあとも周囲の視線が背中に刺さっていた。",
            {
              intergroupAction: {
                context: "workplace",
                topic: "ウルサス軍務中の身元記録",
                response: "共通の規則を確認"
              },
              k: 1
            }
          ],
          [
            1,
            "担当官は不機嫌そうに書類を脇へやり、配属の決定を後回しにした。納得のいかないまま詰め所へ戻ると、どっと冷たい疲れが押し寄せた。",
            {
              intergroupAction: {
                context: "workplace",
                topic: "ウルサス軍務中の身元記録",
                response: "配置確認が遅れた"
              },
              p: -2
            }
          ]
        ),
        $terraData.K("余計なことは言わず、求められた書類だけ出す", {}, [
          1,
          "奥歯を噛み締めて書類を差し出し、次の配属命令を待った。担当官は鼻を鳴らして名簿を閉じ、次の兵士の名を呼んだ。",
          {
            intergroupAction: {
              context: "workplace",
              topic: "ウルサス軍務中の身元記録",
              response: "書類を提出し理由を記録"
            },
            p: 0
          }
        ])
      ]
    },
    {
      id: "inter_laterano_resident_sarkaz_review_v76",
      conf: "S",
      references: ["SRC_V76_LATERANO_SARKAZ"],
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.8,
      show: s => s.res.n === "ラテラーノ" && s.r.n === "サルカズ",
      t: "居住登録の更新で窓口へ書類を出すと、係員は「サルカズ」の欄で目を細め、奥の棚から分厚い別帳面を引っ張り出してきた。「記録を照合するから追って沙汰を待て」と言う。このままいつになるとも知れない返事を待つか、よその土地へ移る算段をつけるか迷った。",
      c: [
        $terraData.K("正規の照会を求め、返答を待つ", {}, [
          1,
          "窓口で正式な照会を申し出て、受付の控えを握りしめて帰った。いつ呼び出しが来るか分からないまま、落ち着かない日々が始まった。",
          {
            intergroupAction: {
              context: "community",
              topic: "ラテラーノでのサルカズ居住登録",
              response: "登録記録の照会を開始"
            },
            p: -1
          }
        ]),
        $terraData.K("よその土地へ移る準備を始めておく", {}, [
          1,
          "いつ居場所を失っても動けるよう、外の地域で働けるツテや安宿を調べ始めた。荷造りしやすいよう、部屋の荷も少しずつ減らしていった。",
          {
            intergroupAction: {
              context: "community",
              topic: "ラテラーノでのサルカズ居住登録",
              response: "移住先を調査"
            },
            k: 1
          }
        ])
      ]
    },
    {
      id: "inter_prior_contact_followup_v76",
      conf: "S",
      references: $terraData.v76FrictionRefs,
      st: ["青年", "壮年", "老年"],
      cd: 8,
      w: 0.48,
      show: s =>
        (s.intergroupHistory || []).some(
          x =>
            (s.year - x.year >= 2 && x.response === "不明瞭な説明による遅れ") ||
            (s.year - x.year >= 2 && x.response === "配置確認が遅れた")
        ),
      t: "数年前に窓口でたらい回しにされ、曖昧な理由で待たされた一件が、新しい手続きの場でふいにぶり返した。当時の控えを突きつけて筋を通すか、蒸し返さずに今日の仕事へ戻るか迷った。",
      c: [
        $terraData.K("当時の控えを出し、今の説明と食い違う点を質す", {}, [
          1,
          "古い控えを机に広げて当時の経緯を説明し、二度と宙ぶらりんにされないよう担当者の言質を取った。",
          {
            intergroupAction: {
              context: "community",
              topic: "以前の窓口での不利益の後日談",
              response: "以前の記録を照合"
            },
            k: 2
          }
        ]),
        $terraData.K("過ぎたこととして飲み込み、今の暮らしを優先する", {}, [
          1,
          "古い書類は鞄の奥へ押し込み、そのまま仕事場へ戻った。ただ、あのとき待合のベンチで味わった惨めさだけは、消えずに胸の底へ沈んでいた。",
          {
            intergroupAction: {
              context: "community",
              topic: "以前の窓口での不利益の後日談",
              response: "再照会を見送り"
            },
            p: 1
          }
        ])
      ]
    }
  );

  $terraData.EV.push({
    id: "inter_laterano_sarkaz_route_review_v87",
    conf: "S",
    references: ["SRC_V76_LATERANO_SARKAZ", "SRC_V87_LATERANO_GATE", "SRC_V76_EMPLOYMENT"],
    st: ["青年", "壮年", "老年"],
    cd: 6,
    w: 0.46,
    show: s =>
      s.r.n === "サルカズ" &&
      s.res.n !== "ラテラーノ" &&
      (s.intergroupHistory || []).some(
        x =>
          x.context === "border" &&
          x.topic === "ラテラーノ方面の通行制限" &&
          x.response === "資格を照会し代替経路を検討" &&
          s.year - x.year >= 2
      ),
    t: "以前、ラテラーノ方面への荷運びについて通行資格を問い合わせてから、もう二年以上が経つ。いまだに色よい返事はなく、返事を待ちながら今の暮らしを続けてきた。もう一度だけ掛け合ってみるか、それとも綺麗さっぱり見切りをつけるか潮時だった。",
    c: [
      $terraData.K("別ルートや受け入れ条件をもう一度だけ掛け合う", {}, [
        1,
        "荷主と仲介所へ改めて書状を送り、サルカズでも通れる迂回路や荷の引き継ぎ場所がないか尋ねた。返事を待つ間、目の前の稼ぎを続けた。",
        {
          intergroupAction: {
            context: "border",
            topic: "ラテラーノ方面の通行条件の後年確認",
            response: "別経路と受入条件を再照会"
          },
          lifeGoal: {
            id: "laterano-border-work",
            title: "サルカズとして希望する仕事の通行条件を確かめる",
            priority: "生業",
            action: "continue",
            note: "募集元へ別経路と受入条件を再照会"
          },
          k: 1
        }
      ]),
      $terraData.K("深追いはやめ、今の仕事を優先する", {}, [
        1,
        "これ以上振り回されるのはやめにして、いま手元にある仕事に精を出すことにした。古い募集の控えだけは、道具箱の底に残しておいた。",
        {
          intergroupAction: {
            context: "border",
            topic: "ラテラーノ方面の通行条件の後年確認",
            response: "照会を保留して現在の仕事を優先"
          },
          lifeGoal: {
            id: "laterano-border-work",
            title: "サルカズとして希望する仕事の通行条件を確かめる",
            priority: "生業",
            action: "pause",
            note: "本人が後年の照会を保留"
          },
          p: 1
        }
      ]),
      $terraData.K("この話には見切りをつけ、別の働き口を探す", {}, [
        1,
        "ラテラーノ方面への未練を断ち切り、自分たちの足で無理なく通える別の商路を探し、別の働き口を探すことにした。",
        {
          intergroupAction: {
            context: "border",
            topic: "ラテラーノ方面の通行条件の後年確認",
            response: "この求人経路を断念"
          },
          lifeGoal: {
            id: "laterano-border-work",
            title: "サルカズとして希望する仕事の通行条件を確かめる",
            priority: "生業",
            action: "abandon",
            note: "本人がこの求人経路の検討を終えた"
          },
          p: -1
        }
      ])
    ]
  });

  $terraData.SETTING_SOURCES.SRC_V77_ORIPATHY_ROUTES = {
    title: "公式サイト『アークナイツ』世界観・源石と感染者",
    url: "https://amiyaapprentice.arknights.jp/",
    kind: "公式世界観記述",
    note: "源石が鉱石病の原因であり、社会的排除が存在すること。年次曝露率の数値根拠ではない。"
  };

  $terraData.SETTING_SOURCES.SRC_V77_TRANSPORT_INFECTION = {
    title: "トゥイエ オペレーター資料",
    url: "https://wiki3.jp/arknightsjp/page/4542",
    kind: "日本語版人物資料の二次掲載",
    note: "砂嵐の輸送事故を経て感染した個人の事例。源石への曝露はプレイヤー選択だけに限られない。"
  };

  $terraData.SETTING_SOURCES.SRC_V77_WATER_WORK = {
    title: "セイリュウ オペレーター資料",
    url: "https://wiki3.jp/arknightsjp/page/4449",
    kind: "日本語版人物資料の二次掲載",
    note: "汚染物を扱う仕事に従事していても非感染と判定された事例。曝露機会と感染成立の区別。"
  };

  $terraData.SETTING_SOURCES.SRC_V77_SOCIAL_MODEL = {
    title: "社会化・識字・排斥経験のゲームモデル",
    kind: "ゲーム上の設計仮定",
    note: "家庭の言説、学校、直接経験、地域圧力は人物ごとに異なる。数値・偏見形成率・読み書き成長量は原作統計ではない。人格や能力を種族から直接決定しない。"
  };

  $terraData.SETTING_SOURCES.SRC_V77_FROSTLEAF = {
    title: "フロストリーフ 人物資料・学習帳に関する記述",
    url: "https://closure.wiki/ja/operators/frostleaf",
    kind: "日本語版人物資料の二次掲載・参照入口",
    note: "少年兵としての過去と、学び直しの生活史を参照。読み書き能力を正規学歴と同一視しない。"
  };

  for (const [id, label, value, unit, note] of [
    [
      "social.v77SchoolLiteracyGain",
      "就学による識字習得（設計基準）",
      5.8,
      "点/年",
      "学校へのアクセスは読み書きの習得機会を与える。施設制限等の影響を受ける"
    ],
    [
      "social.v77InformalLiteracyGain",
      "学校外の読み書き学習",
      1.0,
      "点/年",
      "就学経験がなくても習得できるが、学習環境の差が大きい"
    ],
    [
      "social.v77EverydayKnowledgeGain",
      "就学のない幼少期の知識自然増加",
      0.055,
      "最大点/年",
      "旧版の自動高成長を抑える。日常経験がゼロという意味ではない"
    ],
    [
      "social.v77ExclusionChance",
      "排斥遭遇の基準率",
      0.03,
      "基準確率/年",
      "感染者・社会的不利状況の遭遇を表すゲーム上の値。実際の候補率は仕事/住居/公共圧力または種族・地域リスクを乗じ、原作統計や全住民の確率ではない"
    ],
    [
      "social.v77AttitudeYearlyDrift",
      "家庭・地域の言説による態度更新",
      0.085,
      "重み/年",
      "本人の選択とは無関係に偏見が変わりうるが、固定的ではない"
    ]
  ])
    $terraData.SIM_PARAMS.push({
      id,
      label,
      value,
      unit,
      status: "S",
      scope: "社会化・教育・排斥",
      description: note + "。ゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_V77_SOCIAL_MODEL"],
      usedBy: ["v77年次生活モデル"]
    });

  $terraData.EVENT_EFFECT_TYPES.number.push("literacyGain", "equityGain");

  $terraData.EVENT_FIELD_META.equityGain = {
    valueType: "number",
    unit: "態度形成の点数",
    status: "S",
    meaning: "不当な扱いへの異議や援助を本人が実践する意思の履歴指標"
  };

  $terraData.EVENT_EFFECT_TYPES.text.push("socialContact");

  $terraData.EVENT_FIELD_META.literacyGain = {
    valueType: "number",
    unit: "抽象学習点",
    status: "S",
    meaning: "学校・地域の勉強会による文字の習得経験"
  };

  $terraData.EVENT_FIELD_META.socialContact = {
    valueType: "text",
    unit: "社会接触の対象",
    status: "S",
    meaning: "本人と関わったことで態度形成に影響する記録。個別の相手の生存・感染・種族を推定しない"
  };
});
