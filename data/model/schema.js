// model/schema: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("model/schema", function ($terraData, $define, $rules) {
  "use strict";
  $define("START_YEAR", $terraData.SIM_PARAMS.find(p => p.id === "clock.startYear").value, false);
  $define("BIRTH_YEAR_MIN", $terraData.SIM_PARAMS.find(p => p.id === "clock.minimumBirthYear").value, false);
  $define("BIRTH_YEAR_MAX", $terraData.SIM_PARAMS.find(p => p.id === "clock.maximumBirthYear").value, false);

  $define(
    "DATASET_META",
    {
      REG: {
        status: "S",
        source: "ゲーム用仮定",
        fields: {
          w: ["出生抽選重み", "相対重み"],
          war: ["地域戦争係数", "倍率"],
          inf: ["感染発生係数", "倍率"],
          pm: ["物価係数", "倍率"],
          st: ["制度・差別状況係数", "倍率"],
          sc: ["生活費係数", "倍率"],
          md: ["医療費係数", "倍率"],
          dm: ["死因別補正", "倍率"],
          e: ["出生地種別", "真偽値"]
        }
      },
      RX: {
        status: "S",
        source: "ゲーム用仮定",
        fields: {
          sc: ["地域生活費補正", "倍率"],
          md: ["地域医療費補正", "倍率"],
          dm: ["地域死因補正", "倍率"],
          fa: ["信仰表示", "文字列"]
        }
      },
      RACE: {
        status: "S",
        source: "ゲーム用仮定",
        fields: {
          lm: ["寿命モデル係数", "倍率"],
          dis: ["差別遭遇モデル係数", "倍率"],
          ob: ["感染影響係数", "倍率"],
          w: ["種族抽選重み", "相対重み"]
        }
      },
      RACE_AFF: { status: "S", source: "ゲーム用仮定", fields: { "*": ["地域別種族抽選補正", "倍率"] } },
      WEALTH: { status: "S", source: "ゲーム用仮定", fields: { w: ["家庭経済抽選重み", "相対重み"] } },
      TR: {
        status: "S",
        source: "ゲーム用仮定",
        fields: {
          w: ["気質抽選重み", "相対重み"],
          inc: ["収入傾向", "倍率"],
          acc: ["事故傾向", "倍率"],
          rl: ["人間関係傾向", "ステータス補正"],
          vio: ["暴力遭遇傾向", "倍率"],
          p: ["幸福傾向", "ステータス補正"]
        }
      },
      J: {
        status: "S",
        source: "ゲーム用仮定",
        fields: {
          pay: ["基準収入", "龍門幣/年"],
          war: ["戦争リスク補正", "倍率"],
          ex: ["危険・感染曝露補正", "倍率"]
        }
      },
      EXP_VALUES: {
        status: "S",
        source: "ゲーム用仮定",
        fields: { value: ["経済区分別基準生活費", "龍門幣/年"] }
      },
      WORLD_PRESSURES: {
        status: "S",
        source: "ゲーム用仮定",
        fields: {
          from: ["圧力窓の開始年", "年"],
          to: ["圧力窓の終了年", "年"],
          fromMonth: ["圧力窓の開始月", "任意の月"],
          toMonth: ["圧力窓の終了月", "任意の月"],
          war: ["有効期間中の戦乱圧力", "倍率"],
          cities: ["圧力を受ける居住都市", "任意の都市名配列"],
          dateConfidence: ["年表上の年代確度", "A/B/C/D/?"],
          sourceRefs: ["根拠資料ID", "配列"],
          anchor: ["年代アンカーの要約", "文字列"],
          scope: ["圧力窓の適用範囲と留保", "文字列"]
        }
      },
      MIGRATION_ROUTES: {
        status: "S",
        source: "ゲーム用仮定。地理資料を参考にした広域の行先候補であり、公式の街道・鉄道路線図ではない。",
        fields: { w: ["経路の相対重み", "相対重み"], fare: ["移動に必要な目安", "龍門幣"] }
      }
    },
    false
  );

  $terraData.SETTING_SOURCES.SRC_CLASS_URSUS = {
    title: "ウルサスの子供たち・デタラメ冒険譚",
    file: "https://shimadouma.github.io/astrhtml/events/act10d5/stories/ST-5.html",
    kind: "日本語版シナリオ本文の非公式転載",
    note: "貴族学校と平民側の確執を描く特定の危機時。平時の全国制度へ一般化しない。"
  };

  $terraData.SETTING_SOURCES.SRC_CLASS_TARA = {
    title: "この炎が照らす先 FC-8",
    file: "https://shimadouma.github.io/astrhtml/events/act22side/stories/FC-8.html",
    kind: "日本語版シナリオ本文の非公式転載",
    note: "ヴィクトリアによるターラー人の身分・言語・教育への抑圧を当事者が語る。民族的出自は種族ではなく別に扱う。"
  };

  $terraData.SETTING_SOURCES.SRC_CLASS_KAZDEL = {
    title: "闇夜に生きる DM-5",
    file: "https://shimadouma.github.io/astrhtml/events/act9d0/stories/DM-5.html",
    kind: "日本語版シナリオ本文の非公式転載",
    note: "難民によるカズデルのスラム拡大と叙爵の話。特定人物の回想である。"
  };

  $terraData.SETTING_SOURCES.SRC_V87_SARKAZ_HARDSHIP = {
    title: "慈悲光塔 14-21「それぞれの願う明日」",
    file: "https://shimadouma.github.io/astrhtml/main/chapter_14/stories/14-21.html",
    kind: "日本語版シナリオ本文の非公式転載",
    note: "テレジアはサルカズが生活の複数領域で不当な扱いを受ける歴史を語る。個別場面の頻度・地域別率・発生確率は示さない。"
  };

  $terraData.SETTING_SOURCES.SRC_TL_DARKNIGHTS = {
    title: "テラ年表編纂レポート 第I巻",
    file: "other/terra_timeline_complete_3volumes.pdf",
    pages: "PDF 7",
    kind: "ユーザー提供の二次整理資料",
    note: "DM-1〜DM-5を1090年夏頃に置く年次整理（確度B-C）。物語本文に明記された日付ではなく、相対関係の調査結果。"
  };

  $terraData.SETTING_SOURCES.SRC_CLASS_SIRACUSA = {
    title: "シラクザーノ IS-2",
    file: "https://shimadouma.github.io/astrhtml/events/act21side/stories/IS-2.html",
    kind: "日本語版シナリオ本文の非公式転載",
    note: "ファミリーと司法・市民の生活との緊張。個別地域の場面。"
  };

  $terraData.SETTING_SOURCES.SRC_CLASS_GENERAL = {
    title: "テラ生活史・社会制度・人生形成 横断史料",
    file: "terra_cross_sourcebook_20261021.md",
    kind: "既存編纂資料",
    note: "国家別の階層・就労・住居・教育の断片を収録。出生抽選の確率や全地域の階級比率はゲーム用仮定。"
  };

  $terraData.SETTING_SOURCES.SRC_LOCALITY_TW = {
    title: "『ウォルモンドの薄暮』TW-S-1 日本語版",
    url: "https://shimadouma.github.io/astrhtml/events/act11d0/stories/TW-S-1.html",
    kind: "非公式アーカイブに表示された日本語ゲーム本文",
    note: "災害による移動経路、商業、テントの仮住まい、正規住民優先の食料配給に関する個別の言及。絶対年代や食料不足率を証明しない。"
  };

  $terraData.SETTING_SOURCES.SRC_LOCALITY_TW_MOURN = {
    title: "『ウォルモンドの薄暮』TW-ST-1 日本語版",
    url: "https://shimadouma.github.io/astrhtml/events/act11d0/stories/TW-ST-1.html",
    kind: "非公式アーカイブに表示された日本語ゲーム本文",
    note: "天災による救援遅延、葬送の対立などを描写。地域医療容量の数値や年代は示さない。"
  };

  $terraData.SETTING_SOURCES.SRC_LOCALITY_VICTORIA = {
    title: "『驚靂蕭然』12-3 日本語版",
    url: "https://shimadouma.github.io/astrhtml/main/chapter_12/stories/12-3.html",
    kind: "非公式アーカイブに表示された日本語ゲーム本文",
    note: "ロンディニウムにおける市民自救軍と戦争の混乱。全ヴィクトリアの戦時所得や都市運行を定めるものではない。"
  };

  $terraData.SETTING_SOURCES.SRC_LOCALITY_OFFICIAL = {
    title: "日本版アークナイツ公式 世界観：移動都市と源石",
    url: "https://amiyaapprentice.arknights.jp/",
    kind: "日本語公式サイト",
    note: "天災への対応として生まれた移動都市と、源石が産業に使われることを明示。都市ごとの食料・雇用・医療指数や架空の災害は説明していない。"
  };

  $terraData.SETTING_SOURCES.SRC_LOCALITY_GAME = {
    title: "生活圏状態モデル 第I段階",
    kind: "シミュレーション専用の設計仮説",
    note: "食料・雇用・住居・医療・交通の容量、年次回復、架空の変動、家計補正および所在地別の事件影響はすべてゲーム用の仮定。"
  };

  $define(
    "LOCALITY_MODEL",
    {
      version: 1,
      axes: {
        food: "食料・日用品の供給",
        jobs: "仕事の見つかりやすさ",
        housing: "居住先の確保",
        medical: "診療を受けられる余地",
        transport: "移動・物流の通りやすさ"
      },
      sourceRefs: [
        "SRC_LOCALITY_OFFICIAL",
        "SRC_LOCALITY_TW",
        "SRC_LOCALITY_TW_MOURN",
        "SRC_LOCALITY_VICTORIA",
        "SRC_LOCALITY_GAME"
      ],
      shocks: [
        {
          id: "chernobog-direct",
          region: "ウルサス",
          city: "チェルノボーグ",
          from: 1096,
          fromMonth: 12,
          to: 1097,
          impact: { food: 0.17, jobs: 0.22, housing: 0.16, medical: 0.18, transport: 0.26 },
          sourceRefs: ["SRC_TL_CHERNOB_WINDOW"],
          scope: "1096年12月の事変開始後、チェルノボーグに居住する場合だけの仮想的な生活圧力。12月は年表の開始日に沿う月次近似で、実測の被害割合ではない。"
        },
        {
          id: "chernobog-indirect",
          region: "ウルサス",
          excludeCity: "チェルノボーグ",
          from: 1096,
          fromMonth: 12,
          to: 1097,
          impact: { food: 0.035, jobs: 0.035, housing: 0.015, medical: 0.015, transport: 0.04 },
          sourceRefs: ["SRC_TL_CHERNOB_WINDOW"],
          scope: "1096年12月以降のウルサス他都市への間接的な物流影響の仮定。戦闘や避難の直接経験ではない。12月は年表開始に合わせた月次近似。"
        },
        {
          id: "lungmen-indirect",
          region: "龍門",
          from: 1096,
          fromMonth: 12,
          to: 1097,
          impact: { food: 0.055, jobs: 0.045, housing: 0.045, medical: 0.045, transport: 0.07 },
          sourceRefs: ["SRC_TL_CHERNOB_WINDOW"],
          scope: "1096年12月以降の龍門における事変期の生活の揺れを抽象化。市内での直接遭遇は別の個別イベントで扱い、12月は年表開始に合わせた月次近似とする。"
        },
        {
          id: "londinium-direct",
          region: "ヴィクトリア",
          city: "ロンディニウム",
          from: 1098,
          fromMonth: 7,
          to: 1100,
          impact: { food: 0.16, jobs: 0.17, housing: 0.2, medical: 0.2, transport: 0.23 },
          sourceRefs: ["SRC_TL_LONDINIUM_WINDOW", "SRC_LOCALITY_VICTORIA"],
          scope: "1098年7月以降のロンディニウムに限る、ゲーム上の戦時生活圧力。7月は危機開始に合わせた月次近似で、公式の戦争終結年を定めない。"
        },
        {
          id: "victoria-indirect",
          region: "ヴィクトリア",
          excludeCity: "ロンディニウム",
          from: 1098,
          fromMonth: 7,
          to: 1100,
          impact: { food: 0.02, jobs: 0.03, housing: 0.01, medical: 0.015, transport: 0.025 },
          sourceRefs: ["SRC_TL_LONDINIUM_WINDOW"],
          scope: "1098年7月以降のその他のヴィクトリア地域への間接的影響の仮説。7月は危機開始に合わせた月次近似で、占領を意味しない。"
        },
        {
          id: "kazdel-war",
          region: "カズデル",
          from: 1092,
          to: 1094,
          impact: { food: 0.065, jobs: 0.075, housing: 0.085, medical: 0.09, transport: 0.1 },
          sourceRefs: ["SRC_TL_1094"],
          scope: "当該時期の広い戦乱背景の影響を抽象化。個人が戦場にいたという根拠ではない。"
        },
        {
          id: "siesta-transition",
          region: "シエスタ",
          from: 1098,
          to: 1098,
          impact: { food: 0.065, jobs: 0.06, housing: 0.08, medical: 0.055, transport: 0.09 },
          sourceRefs: ["SRC_TL_LATE", "SRC_COMMUNITY_SIESTA_VOLCANIC_ACTIVITY"],
          scope: "移住計画は1097年夏以降に始まるため、年次モデルでは翌1098年を最初の通年負荷として置く。生活指標の幅と移住期間はゲーム上の近似で、個々の居住者の被災を示さない。"
        }
      ]
    },
    false
  );

  for (const [id, label, value, unit, description] of [
    [
      "local.lifeRecovery",
      "地域の年次回復速度",
      0.24,
      "割合/年",
      "周辺環境の容量が基準へ戻ろうとするゲーム上の速度"
    ],
    [
      "local.foodCostScale",
      "供給不安の生活費への反映幅",
      0.22,
      "上乗せ倍率",
      "食料・住居の圧迫を抽象的に生活費へ反映する。価格統計ではない"
    ],
    [
      "local.jobIncomeScale",
      "雇用状況の賃金収入への反映幅",
      0.16,
      "減少倍率",
      "仕事の不足を不安定な所得の代理指標とする。実際の賃金カットを断定しない"
    ],
    [
      "local.medicalAccessScale",
      "医療容量の通院到達への反映幅",
      0.24,
      "到達率補正",
      "実在の診療予約・待ち時間の統計ではない"
    ],
    [
      "local.transportCostScale",
      "交通停滞の自発移住費への反映幅",
      0.38,
      "費用上乗せ倍率",
      "抽象的移住経路への支払能力判定に同じ倍率を用いる"
    ],
    [
      "local.interruptionShare",
      "平時の局所的な供給変動の年次機会",
      0.085,
      "機会/年",
      "公式事件とは別のゲーム内背景変動。被害事件とは断定しない"
    ]
  ])
    $terraData.SIM_PARAMS.push({
      id,
      label,
      value,
      unit,
      status: "S",
      scope: "地域生活",
      description,
      source: "ゲーム用仮定",
      references: ["SRC_LOCALITY_GAME"],
      usedBy: ["生活圏更新", "家計・医療・交通"]
    });

  $define(
    "EVENT_FIELD_META",
    {
      mortalityCare: {
        unit: "健康エピソードへの対応コード",
        meaning: "診療、休息、避難、相談、安全確保、緩和ケアなどを状態履歴へ記録する",
        status: "S",
        valueType: "object"
      },
      w: { unit: "相対重み", meaning: "候補イベントの抽選重み", status: "S" },
      cd: { unit: "年", meaning: "再発までの待機期間", status: "S" },
      pet: {
        unit: "ゲーム用の飼育動物ラベル",
        meaning: "迎えた動物の表示名。種の確定資料ではない",
        status: "S"
      },
      home: {
        unit: "居住形態",
        meaning: "res併用時は地域間移住後、単独時は同地域内の転居後の移動都市・固定集落の別",
        status: "S"
      },
      study: { unit: "課程管理コード", meaning: "在籍開始・進級・修了・中退の状態更新", status: "S" },
      h: { unit: "健康点", meaning: "選択結果による健康変化", status: "S" },
      p: { unit: "幸福点", meaning: "選択結果による幸福変化", status: "S" },
      k: { unit: "知識点", meaning: "選択結果による知識変化", status: "S" },
      rl: { unit: "関係点", meaning: "選択結果による関係変化", status: "S" },
      ar: { unit: "適性点", meaning: "選択結果による適性変化", status: "S" },
      cr: { unit: "信用点", meaning: "選択結果による信用変化", status: "S" },
      ep: { unit: "教育点", meaning: "選択結果による教育進捗", status: "S" },
      ob: { unit: "感染度", meaning: "感染進行の変化", status: "S" },
      inf: { unit: "真偽値", meaning: "感染状態の変更", status: "S" },
      cash: { unit: "龍門幣", meaning: "家計または本人資金の変化", status: "S" },
      selfCash: { unit: "龍門幣", meaning: "本人資金の変化", status: "S" },
      familyTransfer: { unit: "比率", meaning: "養育家計の現金から本人資産へ移す比率", status: "S" },
      investment: { unit: "龍門幣", meaning: "換金前の地域共同事業持分評価額の増減", status: "S" },
      investmentCashout: { unit: "0/1マーカー", meaning: "投資持分を売却して本人の現金へ移す", status: "S" },
      debt: { unit: "龍門幣", meaning: "負債の変化", status: "S" },
      medicalDebt: {
        unit: "龍門幣",
        meaning: "地域医療費と物価係数を掛けて本人または養育家計に加える未払医療費",
        status: "S"
      },
      med: { unit: "倍率", meaning: "cash/selfCash/medicalDebtに地域医療費係数を掛ける指定", status: "S" },
      sc: { unit: "倍率", meaning: "cash/selfCashに地域生活費係数を掛ける指定", status: "S" },
      pm: { unit: "倍率", meaning: "cash/selfCashに地域物価係数を掛ける指定", status: "S" },
      job: { unit: "職業ID", meaning: "職業の変更", status: "S" },
      res: { unit: "地域ID", meaning: "居住地域の変更", status: "S" },
      fl: { unit: "0/1状態", meaning: "宣言済みフラグの付与・解除", status: "S" },
      d: { unit: "死因", meaning: "死亡結果の指定", status: "S" },
      sp: { unit: "真偽値", meaning: "配偶者関係の作成", status: "S" },
      kid: { unit: "真偽値", meaning: "子の記録", status: "S" },
      pd: { unit: "真偽値", meaning: "親の死亡記録", status: "S" },
      pet: { unit: "表示名", meaning: "迎えた動物のゲーム内表示名。公式の種分類を示さない。", status: "S" }
    },
    false
  );

  $terraData.EVENT_FIELD_META.kidInf = {
    unit: "0/1マーカー",
    meaning: "イベント対象IDで指定された扶養中の子に鉱石病状態を記録",
    status: "S"
  };

  $terraData.EVENT_FIELD_META.hobbyMode = {
    unit: "趣味費用形態",
    meaning: "家計相談で選んだ継続頻度・共同負担の費用形態を、対象の趣味と年次支出へ反映",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.kidInfCause = {
    unit: "曝露経路の説明",
    meaning: "感染したイベント対象の扶養中の子に記録する結晶曝露経路",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.kidExposurePending = {
    unit: "0/1マーカー",
    meaning: "イベント対象の子に源石曝露後の未確定状態と再診予定を記録",
    status: "S"
  };

  $terraData.EVENT_FIELD_META.kidExposureReviewDelay = {
    unit: "年",
    meaning: "対象の子の次回曝露後確認までの年数",
    status: "S"
  };

  $terraData.EVENT_FIELD_META.kidExposureClose = {
    unit: "0/1マーカー",
    meaning: "対象の子の今回の曝露に対する特別な検査待ちを閉じる",
    status: "S"
  };

  $terraData.EVENT_FIELD_META.kidTx = {
    unit: "0/1マーカー",
    meaning: "イベント対象IDで指定された感染児の継続治療状態を変更",
    status: "S"
  };

  $terraData.EVENT_FIELD_META.kidCareSupport = {
    unit: "0/1マーカー",
    meaning: "対象の感染した子について家計負担を伴う継続的な療養支援を選んだか記録",
    status: "S"
  };

  $terraData.EVENT_FIELD_META.childPlan = {
    unit: "生活上の進路コード",
    meaning: "イベント対象の子の学業・就労・家族支援・別居の状態と再相談時期を記録",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.childFutureSupport = {
    unit: "子どもへの進路支援記録",
    meaning: "親が行った費用支援・紹介の手伝い・再相談の記録。子どもの進学・就労・転居の実施は変更しない",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_FIELD_META.childContact = {
    unit: "親子間の接触・支援コード",
    meaning: "イベント対象の成人した子との連絡、訪問、送金、再同居、連絡休止を記録",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.sibHealthAid = {
    unit: "一時的な診療・移動援助",
    meaning: "別居きょうだいへ一度だけ診療・移動費を支出し、健康値の履歴へ記録",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.sibContact = {
    unit: "別居きょうだいとの接触・支援コード",
    meaning: "イベント対象の別居きょうだいとの連絡、訪問、一時援助、一時休止、関係終了後の再接触を記録",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.sibVisit = {
    unit: "0/1マーカー",
    meaning: "把握している居住地域への経路・家計条件を満たし、別居きょうだいへの訪問運賃を支払って履歴に記録",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.spouseMoveNotice = {
    unit: "0/1マーカー",
    meaning: "遅れて届いた別居配偶者の転居知らせを確認し、相手の既知の居住地を更新",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.formerSpouseMoveNotice = {
    unit: "0/1マーカー",
    meaning: "離婚した相手の転居知らせを確認して既知の居住地を更新し、子どもの生活先を再相談する",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.spouseVisit = {
    unit: "0/1マーカー",
    meaning: "別居配偶者への訪問運賃を個人または共有家計から支払い、訪問履歴へ記録",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.careNetworkContact = {
    unit: "養育ネットワークとの関係コード",
    meaning: "家計分離後の連絡、訪問、距離、関係終了、再接触への応答を記録。家計拠出とは独立",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.careNetworkMoveNotice = {
    unit: "0/1マーカー",
    meaning: "届いた養育ネットワークの転居情報を本人が確認し、既知の居住地を更新",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.careNetworkMemberMoveNotice = {
    unit: "0/1マーカー",
    meaning: "届いた養育者個人の転居情報を確認し、その人の既知の居住地と履歴だけを更新",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.careNetworkMemberDeathNotice = {
    unit: "0/1マーカー",
    meaning: "届いた養育者個人の訃報を確認し、その人の既知の安否と認知履歴だけを更新",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.careNetworkMemberMissingNotice = {
    unit: "0/1マーカー",
    meaning: "届いた養育者個人の消息不明を確認し、死亡とは区別した既知状態を更新",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.careNetworkMemberFoundNotice = {
    unit: "0/1マーカー",
    meaning: "消息不明だった養育者の生存が判明した知らせを確認。所在地不明のまま安否のみ更新",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.careNetworkSearch = {
    unit: "0/1マーカー",
    meaning: "消息不明の養育者を探すため、地域・親族への照会を続ける選択を記録",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.contactMissingNotice = {
    unit: "0/1マーカー",
    meaning: "友人または隣人の消息不明を本人が知り、死亡と区別した状態を更新",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.contactFoundNotice = {
    unit: "0/1マーカー",
    meaning: "消息不明だった友人または隣人の生存を知る。所在地は不明のまま更新",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.contactSearch = {
    unit: "0/1マーカー",
    meaning: "知人・地域へ手がかりを尋ね、後の安否確認判定を少し補助するゲーム内行動",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.contactRecontactNotice = {
    unit: "0/1マーカー",
    meaning: "消息不明後に届いた返事を確認し、本人の既知の再連絡状態だけを更新",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.contactReconnect = {
    unit: "連絡の意向・状態",
    meaning: "消息不明後に伝言を頼む、便りを再開する、またはこれ以上の往復を求めない意向を記録",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.sibParentSupportConference = {
    unit: "0/1マーカー",
    meaning: "ほかのきょうだいとの親世帯支援相談を翌年に予定する",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.sibParentSupportNotice = {
    unit: "0/1マーカー",
    meaning: "きょうだいから届いた親世帯支援の変更を本人が知ったと記録する。連絡頻度や関係状態は変えない",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.sibParentSupportOutcome = {
    unit: "支援相談の選択結果",
    meaning: "きょうだい間で決めた一時送金・非金銭支援・個別判断を記録する",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.parentHouseholdGift = {
    unit: "龍門幣",
    meaning: "本人から追跡中の親世帯へ行う一時送金",
    status: "S",
    valueType: "number"
  };

  $terraData.EVENT_FIELD_META.sibCareSupport = {
    unit: "別居きょうだいへの年次支援状態",
    meaning: "対象となる感染した別居きょうだいへ任意の継続支援を開始・終了する",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.sibInfectionDiscussed = {
    unit: "年",
    meaning:
      "感染した同居きょうだいについて診療と家族の対応を話し合った年。話し合い済みでも別のきょうだいの相談を妨げない",
    status: "S",
    valueType: "number"
  };

  $terraData.EVENT_FIELD_META.sibTreatment = {
    unit: "0/1マーカー",
    meaning: "対象の感染きょうだいについて、家族が継続診療費を負担する計画を始める/終える",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.lateranoFamilyProcess = {
    unit: "法務・家族手続きコード",
    meaning:
      "ラテラーノ市民が配偶者死別後、ノタリアルホールへ親権・遺品の扱いを照会した記録。法的結果の確定とは区別する",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.sibExposurePending = {
    unit: "状態マーカー",
    meaning: "きょうだいの源石曝露後に感染診断が未確定で再診予定がある",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.sibExposureReviewDelay = {
    unit: "年",
    meaning: "曝露後の次回診療相談までの年数",
    status: "S",
    valueType: "number"
  };

  $terraData.EVENT_FIELD_META.sibExposureClose = {
    unit: "状態マーカー",
    meaning: "きょうだい本人の希望を受け、感染未確定のまま再診を保留する",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.sibExposureEmployerResponse = {
    unit: "勤務先の事故報告への対応",
    meaning:
      "源石片による負傷を報告したきょうだいに対する勤務先の個別回答。費用一部負担または報告否認を記録し、職場一般の慣行とはしない",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.infectionWorkplaceAction = {
    unit: "勤務先への診断開示・再相談行動",
    meaning:
      "本人が診断を伝えた後の勤務先の個別回答と、後年の勤務継続・時間変更・本人の退職を記録する。職場一般の対応とはしない",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_FIELD_META.contactDeath = {
    unit: "関係者死亡マーカー",
    meaning: "対象IDの友人または顔なじみの隣人について、死亡年と本人の訃報認知年を別々に記録",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.contactDeathCause = {
    unit: "死因説明",
    meaning: "本人に届いた知らせに含まれる死因情報。情報がない場合は不明と記録",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.childDeath = {
    unit: "子の死亡マーカー",
    meaning: "対象IDの子について、死亡年と保護者が知らせを受けた年を記録",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.childDeathCause = {
    unit: "死因説明",
    meaning: "家族に届いた説明の範囲で子の死因情報を記録し、分からない点は不明とする",
    status: "S",
    valueType: "text"
  };

  for (const [key, meaning] of Object.entries({
    romanceStart: "知り合った相手との関係記録を始める",
    romanceContext: "出会いの経路",
    romanceStage: "交際の段階を更新する",
    romanceEnd: "交際の記録を終了する",
    arrangedMarriage: "縁談を経て配偶者関係を始める",
    sibBirth: "出生後のきょうだいを記録する",
    sibInf: "きょうだいの感染状態を記録する",
    sibInfCause: "きょうだいの結晶曝露経路",
    sibDeath: "きょうだいの死亡年を記録する",
    sibDeathCause: "きょうだいの死因説明",
    sibIndependent: "きょうだいの別居開始年を記録する",
    sibIndependenceDiscussed: "きょうだいとの独立相談年を記録する",
    sibIndependenceReason: "別居を決めた事情"
  }))
    $terraData.EVENT_FIELD_META[key] = {
      unit: "状態・説明",
      meaning,
      status: "S",
      valueType:
        key.endsWith("Context") || key.endsWith("Cause") || key.endsWith("Reason")
          ? "text"
          : [
                "sibInf",
                "sibDeath",
                "sibBirth",
                "sibIndependent",
                "sibIndependenceDiscussed",
                "romanceStart",
                "romanceEnd",
                "arrangedMarriage"
              ].includes(key)
            ? "marker"
            : "text"
    };

  for (const [key, meaning] of Object.entries({
    infCause: "本人の結晶曝露経路",
    biasInf: "感染者に対する長期的な個人態度の変化",
    biasSar: "サルカズに対する長期的な個人態度の変化",
    spouseInf: "配偶者の感染状態",
    spouseDisclose: "配偶者の感染開示",
    spouseTreatment: "配偶者の治療継続",
    divorce: "婚姻関係の解消",
    spouseDeath: "配偶者の死別記録"
  }))
    $terraData.EVENT_FIELD_META[key] = {
      unit: key.startsWith("bias") ? "態度点" : "状態・説明",
      meaning,
      status: "S",
      valueType: ["infCause"].includes(key)
        ? "text"
        : ["divorce", "spouseDeath", "spouseDisclose", "spouseInf", "spouseTreatment"].includes(key)
          ? "marker"
          : "number"
    };

  $terraData.EVENT_FIELD_META.careInclination = {
    unit: "ケア関与傾向点",
    meaning:
      "家族ケアの分担を引き受けた具体的経験に応じた、後年の支援選択傾向。ケアを断った理由、資金・健康・安全上の制約、愛情の有無は推定しない",
    status: "S",
    valueType: "number"
  };

  $terraData.EVENT_FIELD_META.spouseArrangement = {
    unit: "家計分担コード",
    meaning:
      "配偶者との相談で記録した共同家計・個別会計・家事やケア中心の分担。職業別賃金から家計へ入る額はゲーム用仮定で計算",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.spouseDisclosureBoundary = {
    unit: "告白後の居室の境界",
    meaning:
      "配偶者の鉱石病告白後、本人が選んだ別室での生活継続または話し合いの再開を記録する。家計分離や別居とは区別する",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.spouseDisclosureReviewDelay = {
    unit: "年",
    meaning: "告白後の関係について、次に話し合うまでの期間",
    status: "S",
    valueType: "number"
  };

  $terraData.EVENT_FIELD_META.spouseFinanceTransfer = {
    unit: "龍門幣",
    meaning: "主人公から配偶者本人へ渡す一時支援。配偶者の記録済み借入の返済を優先し、余りを貯蓄へ加える",
    status: "S",
    valueType: "number"
  };

  $terraData.EVENT_FIELD_META.spouseFinanceReview = {
    unit: "0/1マーカー",
    meaning: "配偶者本人の家計を再相談する年を設定する",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.spouseHealthReview = {
    unit: "体調相談の選択コード",
    meaning:
      "配偶者本人の希望を聞き、一般相談・負担軽減・保留の選択と見直し時期を記録する。病名や治療効果は推定しない",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.divorceParentingPlan = {
    unit: "離婚後の養育連絡方針",
    meaning:
      "離婚した相手との連絡・調整について本人が選んだ意向を保存する。親権・居住・相手の同意は確定しない",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.childResidencePlan = {
    unit: "離婚後の子の主な生活先",
    meaning: "日々の生活費をどの家計で見込むかを本人が記録する。法的親権・面会・相手の合意は確定しない",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.childResidenceProposal = {
    unit: "離婚後の子の生活先の提案",
    meaning: "元配偶者へ伝えた生活先・任意支援の案。返答や合意、実際の居住先・費用負担は変更しない",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_FIELD_META.childResidenceReview = {
    unit: "操作",
    meaning: "離婚後の子の生活先を決めず、次の確認時期だけを設定する",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.spouseContributionPause = {
    unit: "年",
    meaning: "夫婦で相談し、配偶者の家計拠出を一時休止する年数",
    status: "S",
    valueType: "number"
  };

  $terraData.EVENT_FIELD_META.spouseEmploymentSupport = {
    unit: "求職支援方法",
    meaning: "配偶者が希望する講習・求人探し・待機に対する支援。次の再就職判定にだけゲーム用補正を加える",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.spouseWorkPreference = {
    unit: "仕事探しの希望",
    meaning:
      "配偶者本人との話し合いで記録した収入重視・危険負担軽減・現職継続・幅広い選択の希望。後年の求人抽選に限って反映するゲーム用モデル",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.spouseResidenceAction = {
    unit: "配偶者の転居判断",
    meaning: "主人公の地域移動後、配偶者本人が同行するか現在の地域に残るかを選んだ記録",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.spouseSeparateSupportPlan = {
    unit: "別居中の支援方法",
    meaning:
      "別居中の配偶者へ生活費を送る、療養費を支援する、定期支援をしないという家族判断。金額と周期はゲーム用仮定",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.spouseSeparateContact = {
    unit: "別居中の連絡意向",
    meaning: "別居中に定期連絡を続ける、便り中心にする、連絡を控えるという関係の状態",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.spouseHousingPlan = {
    unit: "別居中の住居形態",
    meaning:
      "配偶者が選んだ相部屋・標準的な居室・個室の家計モデル。実在するテラの賃貸契約や住居価格は示さない",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.spouseHousingKeep = {
    unit: "1回限りの住居相談見送り",
    meaning: "今回の住居相談では変更せず、次の相談時期を設定する",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.familyContribution = {
    unit: "比率",
    meaning: "養育家計の管理中に本人の給金から家計へ渡す割合",
    status: "S",
    valueType: "number"
  };

  $terraData.EVENT_FIELD_META.resFareCovered = {
    unit: "0/1マーカー",
    meaning: "地域間移動の運賃を移送側が負担し、本人の現金からは引かない",
    status: "S"
  };

  $terraData.EVENT_FIELD_META.payBonus = {
    unit: "基準給金への加算率",
    meaning: "現在の勤め先の賃金改善率を増減する。職業変更で解除",
    status: "S"
  };

  $terraData.EVENT_FIELD_META.localKind = {
    unit: "居住環境の名称",
    meaning: "homeと併用し、転居後の地区を抽選でなく指定する",
    status: "S"
  };

  $terraData.EVENT_FIELD_META.familyCare = {
    unit: "家族介護の継続状態",
    meaning: "親族の療養を支える期間・対象・年次負担を記録する",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.familyCarePlan = {
    unit: "ケア分担方式",
    meaning: "本人の直接ケア、きょうだいとの分担、親族・近隣との予定調整を選ぶ",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.familyCareReview = {
    unit: "0/1マーカー",
    meaning: "終了した親族ケアの再相談を記録し、同じ期間の重複表示を防ぐ",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.familyCareCapacityPlan = {
    unit: "直接ケアの見直し方式",
    meaning:
      "支援期間の途中で本人の体調が下がった際、直接ケアの継続・親族や近隣との分担・本人の担当終了を記録する。親の治療状態は変更しない",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.familyCareTreatmentSupport = {
    unit: "0/1マーカー",
    meaning: "新しいケア期間に親の継続療養費を本人が分担するか指定する",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.familyCareSiblingContribution = {
    unit: "0/1マーカー",
    meaning:
      "ケア期間中に、本人が家計を把握している別居きょうだいへ親の療養費を相談し、実際の支払額を追跡する",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.formerSpouseDeathNotice = {
    unit: "0/1マーカー",
    meaning: "離婚後、存命の子どもを通じて届いた元配偶者の訃報を本人が確認した記録",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.sibDeathNotice = {
    unit: "0/1マーカー",
    meaning: "実際の死亡後、きょうだい本人への訃報を受け取り、本人が知る死亡年・死因を確定する",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.sibBereavementSupport = {
    unit: "0/1マーカー",
    meaning:
      "きょうだいの訃報後に送る一時支援を支出として記録し、個別追跡中の遺族か親族・共同体向けかを記録する",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.siracusaFamilyAction = {
    unit: "シラクーザの組織的ファミリーとの関係",
    meaning:
      "加入の受諾・辞退、関係継続、距離を置くこと、離脱を区別して履歴へ記録する。血縁家族とは別の社会・仕事上の関係。条件付き変更ではactionとonlyIfMemberを使う",
    status: "S",
    valueType: "textOrObject"
  };

  $terraData.EVENT_FIELD_META.siracusaFamilyDuty = {
    unit: "シラクーザのファミリーで引き受けた仕事・借り",
    meaning:
      "個人の手伝い、危険な依頼の拒否、未清算の借りと離脱後の後始末を追跡する。地域全体の犯罪・制度を表さない",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_FIELD_META.parentTreatment = {
    unit: "0/1マーカー",
    meaning: "イベント対象の感染した親について、家族が継続療養を開始または中断する",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.parentTreatmentReview = {
    unit: "0/1マーカー",
    meaning: "家計難に直面した親本人が療養継続または一時中断を選び、判断履歴と次回相談時期を記録",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.parentJobNotice = {
    unit: "0/1マーカー",
    meaning: "対象の親の仕事の変化を本人が知り、把握する職業履歴を更新",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.parentMoveNotice = {
    unit: "0/1マーカー",
    meaning: "親世帯の転居を本人が知り、把握する居住地域履歴を更新",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.childReturnRoomSetup = {
    unit: "0/1マーカー",
    meaning: "別居した成人子の帰宅に向けて、寝床・部屋の準備費を支払う",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.spouseRejoin = {
    unit: "別居配偶者の再合流",
    meaning: "配偶者本人の移動を希望し、主人公側の地域へ向かう。既存の広域経路・目安運賃・世帯資金を使う",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.displacement = {
    unit: "避難後の生活再建状態",
    meaning: "避難後の仮住まい・再建経路・解決年を追跡する",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.illnessStart = {
    unit: "病状分類",
    meaning: "予兆と経過を追跡する一般疾患の発症状態を記録",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.illnessReviewed = {
    unit: "0/1マーカー",
    meaning: "今回の病状悪化に対する選択を記録",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.illnessTreated = {
    unit: "0/1マーカー",
    meaning: "今回の病状に受診・療養を行った状態を記録",
    status: "S",
    valueType: "marker"
  };

  $terraData.EVENT_FIELD_META.investmentType = {
    unit: "出資先分類",
    meaning: "投資持分の地域事業タイプを追跡",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.residenceArrangement = {
    unit: "世帯形態",
    meaning: "住居の同居関係と家計の管理形態を記録",
    status: "S",
    valueType: "text"
  };

  for (const [key, meaning] of Object.entries({
    lifeGoal: "本人が選んだ目標の継続・妥協・達成・断念を記録する",
    lifeSkill: "反復した練習と熟達を能力の履歴として記録する",
    lifeAffiliation: "団体・職場・共同体への最初の接触、加入、役割変更、休止、離脱を記録する。活動範囲はAFFILIATION_RULESで定義し、既定は出発前の場所、bindAt:destinationは転居後の場所へ結ぶ。onlyIfActiveは活動中、onlyIfActiveOrCrisisは活動中または危機、onlyIfMemberは活動中・危機・休止中に限る",
    resTo: "居住先の国を明示する転居。通常の移動経路・運賃を用い、localKind等で新しい生活圏を設定する",
    returnToLocality: "記録済みの生活圏キーへ帰還する。previousは直前に暮らした別の生活圏。都市属性を再抽選せず、元の場所・施設台帳へ戻る",
    lifeOrganization: "組織の設立、方針、会費、運営費、引継ぎ・解散を追跡する",
    groupStanding: "所属集団ごとに本人への評価変化を記録する。集団内全員の意見を意味しない",
    regionalImpact: "本人の関与が残した局所的な結果を記録する。国家全体の変化を意味しない",
    bodyChange:
      "負傷・身体変化の経過、機能への影響、生活上の調整と見直し時期を個人経歴として記録する。障害を不幸や死の代理値にしない",
    lifeWorkRelationship:
      "同僚個人との接触、本人の同意、申し出の受諾または辞退、後年の関係終了を個人ID付きで記録する"
  }))
    $terraData.EVENT_FIELD_META[key] = {
      unit: "構造化された人生経歴記録",
      meaning,
      status: "S",
      valueType: "object"
    };

  $terraData.EVENT_FIELD_META.lifeGoals = {
    unit: "人生目標の状態変化配列",
    meaning: "一つの選択で複数の個人目標を条件に応じて継続・保留・妥協・達成・断念へ更新する",
    status: "S",
    valueType: "objectArray"
  };

  $terraData.EVENT_FIELD_META.lifeAffiliations = {
    unit: "所属記録の配列",
    meaning: "一つの選択で複数の所属を個別に変更する",
    status: "S",
    valueType: "objectArray"
  };

  $terraData.EVENT_FIELD_META.groupStandings = {
    unit: "集団評価記録の配列",
    meaning: "一つの選択で複数集団からの評価を個別に変更する",
    status: "S",
    valueType: "objectArray"
  };

  $terraData.EVENT_FIELD_META.localityAction = {
    unit: "地域生活への個人的な働きかけ",
    meaning: "地域全体の容量を一人で解決したとみなさず、本人の行動・相談・近隣支援を記録する",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_FIELD_META.classAction = {
    unit: "個人史に記録する階層経験",
    meaning: "仕事・住居・学び・信条の形成をイベント単位で追跡。身分や資産の公定等級を直接決めない",
    status: "S",
    valueType: "object"
  };

  $define(
    "EVENT_EFFECT_TYPES",
    {
      number: [
        "w",
        "cd",
        "h",
        "p",
        "k",
        "rl",
        "ar",
        "cr",
        "ep",
        "ob",
        "selfCash",
        "familyTransfer",
        "familyContribution",
        "parentHouseholdGift",
        "investment",
        "debt",
        "medicalDebt",
        "med",
        "sc",
        "pm",
        "job",
        "res",
        "payBonus",
        "biasInf",
        "biasSar",
        "careInclination",
        "sibExposureReviewDelay",
        "kidExposureReviewDelay",
        "spouseDisclosureReviewDelay"
      ],
      numberOrFunction: ["cash"],
      marker: [
        "inf",
        "sp",
        "kid",
        "pd",
        "investmentCashout",
        "illnessReviewed",
        "illnessTreated",
        "kidInf",
        "kidTx",
        "kidCareSupport",
        "kidExposurePending",
        "kidExposureClose",
        "childResidenceReview",
        "childDeath",
        "resFareCovered",
        "spouseInf",
        "spouseDisclose",
        "spouseTreatment",
        "spouseRejoin",
        "parentTreatment",
        "parentTreatmentReview",
        "parentJobNotice",
        "parentMoveNotice",
        "childReturnRoomSetup",
        "careNetworkMoveNotice",
        "careNetworkMemberMoveNotice",
        "careNetworkMemberDeathNotice",
        "careNetworkMemberMissingNotice",
        "careNetworkMemberFoundNotice",
        "careNetworkSearch",
        "contactMissingNotice",
        "contactFoundNotice",
        "contactSearch",
        "contactRecontactNotice",
        "familyCareReview",
        "familyCareTreatmentSupport",
        "familyCareSiblingContribution",
        "divorce",
        "spouseDeath",
        "formerSpouseDeathNotice",
        "formerSpouseMoveNotice",
        "sibDeathNotice",
        "sibBereavementSupport",
        "contactDeath",
        "romanceStart",
        "romanceEnd",
        "arrangedMarriage",
        "sibBirth",
        "sibInf",
        "sibExposurePending",
        "sibExposureClose",
        "sibDeath",
        "sibIndependent",
        "sibIndependenceDiscussed",
        "sibParentSupportConference",
        "sibParentSupportNotice",
        "sibVisit",
        "spouseVisit",
        "spouseMoveNotice",
        "spouseHousingKeep"
      ],
      flagMap: ["fl"],
      deathResult: ["d"],
      object: [
        "lifeGoal",
        "lifeSkill",
        "lifeAffiliation",
        "lifeOrganization",
        "groupStanding",
        "regionalImpact",
        "lifeWorkRelationship",
        "siracusaFamilyDuty"
      ],
      objectArray: ["lifeGoals", "lifeAffiliations", "groupStandings"],
      text: [
        "illnessStart",
        "investmentType",
        "residenceArrangement",
        "pet",
        "home",
        "localKind",
        "localCity",
        "resTo",
        "returnToLocality",
        "study",
        "familyCare",
        "familyCareCapacityPlan",
        "sibCareSupport",
        "sibParentSupportOutcome",
        "careNetworkContact",
        "lateranoFamilyProcess",
        "displacement",
        "infCause",
        "kidInfCause",
        "childDeathCause",
        "childPlan",
        "childContact",
        "childResidencePlan",
        "romanceContext",
        "romanceStage",
        "sibInfCause",
        "sibExposureEmployerResponse",
        "sibDeathCause",
        "sibIndependenceReason",
        "contactDeathCause",
        "contactReconnect",
        "spouseWorkPreference",
        "spouseResidenceAction",
        "spouseSeparateSupportPlan",
        "spouseSeparateContact",
        "spouseHousingPlan",
        "spouseDisclosureBoundary",
        "divorceParentingPlan"
      ],
      textOrObject: ["siracusaFamilyAction"]
    },
    false
  );

  $terraData.EVENT_EFFECT_TYPES.object.push("classAction");

  $terraData.EVENT_EFFECT_TYPES.object.push("localityAction");

  $terraData.EVENT_EFFECT_TYPES.object.push("bodyChange");

  $terraData.EVENT_EFFECT_TYPES.object.push("childFutureSupport", "childResidenceProposal");

  $terraData.EVENT_EFFECT_TYPES.object.push("infectionWorkplaceAction");
  $terraData.EVENT_EFFECT_TYPES.object.push("employmentResourceIncident");
  $terraData.EVENT_EFFECT_TYPES.object.push("languageAction");

  $terraData.EVENT_EFFECT_TYPES.objectArray.push("bodyChanges", "infectionAwarenessActions");

  Object.entries($terraData.EVENT_EFFECT_TYPES).forEach(([type, keys]) =>
    keys.forEach(key => {
      if ($terraData.EVENT_FIELD_META[key]) $terraData.EVENT_FIELD_META[key].valueType = type;
    })
  );

  $terraData.EVENT_EFFECT_TYPES.text.push("localCity");

  $terraData.EVENT_FIELD_META.localCity = {
    unit: "都市名",
    meaning: "地域内の居住移動で登録済み都市を指定する。人口比の抽選や到着可能性は別に扱う。",
    status: "S",
    valueType: "text"
  };

  $terraData.EVENT_FIELD_META.exposureAction = {
    unit: "対応の種別",
    meaning: "源石曝露への防護・担当工程の変更・職場の安全確認・検査相談・未受診の再相談時期を区別して記録",
    status: "S",
    valueType: "text"
  };
  Object.assign($terraData.EVENT_FIELD_META, {
    debtPlan:{unit:"家計再建方針",meaning:"生活必需費を保ちつつ支出を調整する本人の選択",status:"S",valueType:"text"},
    educationAction:{unit:"学籍操作",meaning:"教育状態機械へ入学・支払・中断・再開・修了判断を渡す",status:"S",valueType:"text"},
    travelResidenceRef:{unit:"旅先の住居ID",meaning:"実到着と照合した住居の個別受入記録",status:"S",valueType:"text"},
    travelAction:{unit:"旅程操作",meaning:"実在する旅程の検問通過・迂回・待機を確定する",status:"S",valueType:"text"},
    loanContract:{unit:"個人借入契約",meaning:"実際の契約条件と元本・返済総額を登録する",status:"S",valueType:"object"},
    loanPayment:{unit:"契約返済",meaning:"既存契約の残高と実際の支払を同時に減らす",status:"S",valueType:"object"},
    loanCharge:{unit:"契約外追加請求",meaning:"既存契約への追加請求と異議を記録する",status:"S",valueType:"object"},
    personalWishes:{unit:"本人の希望",meaning:"本人が選んだ終盤の希望を記録する",status:"S",valueType:"object"},
    languageAction:{unit:"言語操作",meaning:"言語能力学習・現場符牒獲得・通訳手配・遭遇記録などの言語状態機械操作",status:"S",valueType:"object"},
    employmentResourceIncident:{unit:"生計資源の変化",meaning:"現役の自営生計に対する出典付き資源損失だけを、実際の農地・資源状態へ記録する",status:"S",valueType:"object"},
    infectionRoute:{unit:"源石曝露の経路",meaning:"明示された粉塵・創傷・深い創傷・混合曝露を初期病状へ接続する",status:"S",valueType:"text"}
  });

});
