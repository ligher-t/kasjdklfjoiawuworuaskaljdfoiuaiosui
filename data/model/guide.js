// model/guide: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("model/guide", function ($terraData, $define, $rules) {
  "use strict";
  $define("STG_NAMES", ["乳児", "幼児", "児童", "少年", "青年", "壮年", "老年"], false);

  $define("EL_NAMES", ["未就学", "初等教育", "中等教育", "高等教育", "専門・研究"], false);

  $define(
    "FC_NAMES",
    ["のんびり", "勉学", "労働", "交友", "休養", "アーツ修練", "節約", "家庭", "危険労働"],
    false
  );

  $define("RM_NAMES", ["Ⅰ", "Ⅱ", "Ⅲ"], false);

  $define("EXP_VALUES", [35e4, 7e5, 13e5, 22e5, 36e5], false);

  $define(
    "DATA_GUIDE",
    {
      confidence: {
        A: "公式・作中で年月または事実が明示",
        B: "複数の本文・相対日付が整合",
        C: "所在・季節・前後関係からの推定（頃と表記）",
        D: "資料矛盾・複数説・仮説段階（確定年に固定しない）",
        S: "ゲーム上の仮定",
        "?": "未確認"
      },
      confidenceNote:
        "conf は設定上の出来事または年代の根拠区分を示す。ゲーム内効果・確率・数値バランスの根拠にはならない。旧イベントの conf は資料ごとに基準が混在するため個別再確認が必要。",
      careerTerms: {
        transporter:
          "一般のトランスポーターは荷物や書状を運ぶ職として扱う。契約範囲や護衛の有無は会社・依頼・地域で異なる個別事例で、統一された各国制度として扱わない。",
        catastropheTransporter:
          "天災トランスポーターは公式インタビューに基づき、天災の早期警戒、環境の観察・計測、近隣都市への警報を担う専門職とする。一般のトランスポーターとは別に記録し、助手や同行者を予報の判断者として扱わない。資格・賃金・標準訓練課程は未確認。",
        kjeragLogistics:
          "クーリエの回想秘録にある物流構想は、周辺村の基盤整備や受け入れの判断が一様でない例として扱う。ゲーム内経路は一人の配達仕事であり、全村の参加・地域網の完成・既存運行の実現を示さない。"
      },
      modelPolicy: {
        status:
          "REG/RACE/RACE_AFF/WEALTH/TR/J の数値はすべてシミュレーション用パラメータ。設定資料の確度を表さない。",
        country:
          "REG.w は出生抽選重み、war/inf/pm/st 等はゲーム内リスク・価格・制度モデルの係数。実人口や公式統計ではない。",
        species:
          "RACE.lm/dis/ob/w はゲーム内寿命・差別遭遇・感染影響・出生抽選の係数。種族全体の性質や公式の平均値を表さない。",
        general:
          "WEALTH/TR/J/EXP_VALUES、教育・家計・医療の価格、イベント重みと効果もすべてシミュレーション用仮定。",
        individualContext:
          "居住環境・情報網・養育形態の分布と影響係数もゲーム上の仮定。公式の地域人口や家族構成統計ではない。",
        worldPressure:
          "年代別の戦乱圧力はゲーム用の近似。都市を指定した圧力はその都市の居住者に限り、都市指定のない圧力は記載地域の広い背景を表す。どちらも個人の現地経験や実際の死傷率を表す公式値ではない。",
        oripathyPressure:
          "地域別の鉱石病に関する世間・雇用・住居・医療差別圧力の係数は生活上の差を試すゲーム用仮定。法令・実人口・住民全体の態度を表す公式値ではなく、同じ地域でも地区・所属・個人で変わる。診療所への地理的な到達しやすさは別指標で、居住地の access と危険・戦乱状況から仮定している。資料は係数や各人の医療網を定めていない。",
        eventEffects:
          "イベントの結果値 e/fx と発生率 w/cd はゲーム演出・進行用の仮定。conf から正当化しない。"
      },
      mechanics: {
        countryWeights: "国の出生重みはテラの人口比ではない",
        raceWeights: "種族の出現重みはテラの人口比ではない",
        lifespan: "種族別の寿命係数と死亡モデルはゲーム上の仮定",
        economy: "所得・物価・家計の数値はゲーム上の仮定",
        disease: "鉱石病の発生・進行率はゲーム上の仮定"
      },
      startYearNote: "出生年の既定値は1077年。選択範囲はテラ暦1000〜1100年で、いずれもゲーム上の開始設定。"
    },
    false
  );

  $define(
    "SIM_TABLES",
    {
      care: [
        {
          n: "両親と暮らす",
          w: 48,
          support: 0.58,
          caregivers: "親2人",
          parentShare: 1,
          network: 0,
          networkType: null,
          networkLabel: null,
          networkRoles: []
        },
        {
          n: "片親と暮らす",
          w: 18,
          support: 0.42,
          caregivers: "親1人",
          parentShare: 1,
          network: 0,
          networkType: null,
          networkLabel: null,
          networkRoles: []
        },
        {
          n: "親族の支援を受ける",
          w: 15,
          support: 0.72,
          caregivers: "親と親族",
          parentShare: 0.8,
          network: 5e5,
          networkType: "kin_household",
          networkLabel: "親族の支援世帯",
          networkRoles: ["養育補助", "家計支援"]
        },
        {
          n: "後見人・養育者と暮らす",
          w: 7,
          support: 0.48,
          caregivers: "後見人・養育者",
          parentShare: 0,
          network: 9e5,
          networkType: "guardian_household",
          networkLabel: "後見人・養育者",
          networkRoles: ["日々の養育", "家計支援"]
        },
        {
          n: "氏族・共同体で育つ",
          w: 7,
          support: 0.68,
          caregivers: "氏族・共同体",
          parentShare: 0.25,
          network: 7e5,
          networkType: "clan_community",
          networkLabel: "氏族・共同体",
          networkRoles: ["日々の養育", "共同体内の調整", "家計支援"]
        },
        {
          n: "避難・離散した世帯で育つ",
          w: 5,
          support: 0.28,
          caregivers: "離散した家族・周囲の人",
          parentShare: 0.35,
          network: 3e5,
          networkType: "displacement_network",
          networkLabel: "避難先の親族・相互扶助",
          networkRoles: ["臨時の養育", "避難生活の支援", "家計支援"]
        }
      ],
      locality: {
        mobile: [
          { n: "移動都市の居住区", w: 46, access: 0.82, hazard: 0.48, info: 0.84 },
          { n: "移動都市の周縁区", w: 34, access: 0.58, hazard: 0.72, info: 0.68 },
          { n: "移動都市の避難・労働区画", w: 20, access: 0.43, hazard: 0.88, info: 0.62 }
        ],
        fixed: [
          { n: "固定都市の街区", w: 30, access: 0.76, hazard: 0.55, info: 0.7 },
          { n: "工業・採掘地域", w: 20, access: 0.48, hazard: 0.86, info: 0.56 },
          { n: "小規模な定住地", w: 28, access: 0.46, hazard: 0.52, info: 0.42 },
          { n: "辺境・移動の多い居住地", w: 22, access: 0.3, hazard: 0.78, info: 0.34 }
        ]
      },
      /* 世間・雇用・住居・医療差別圧力を分けるゲーム用の初期仮説。国民全体の態度や公式法令を表さない。診療所への到達しやすさは locality.access から別に導く。 */
      oripathyPressure: {
        "炎国": { public: 0.42, work: 0.36, housing: 0.34, medical: 0.32, disclosure: 0.4 },
        "龍門": { public: 0.55, work: 0.58, housing: 0.66, medical: 0.48, disclosure: 0.64 },
        "ヴィクトリア": { public: 0.62, work: 0.62, housing: 0.58, medical: 0.5, disclosure: 0.64 },
        "ウルサス": { public: 0.82, work: 0.88, housing: 0.82, medical: 0.78, disclosure: 0.9 },
        "ラテラーノ": { public: 0.28, work: 0.3, housing: 0.32, medical: 0.24, disclosure: 0.38 },
        "カジミエーシュ": { public: 0.5, work: 0.6, housing: 0.48, medical: 0.48, disclosure: 0.58 },
        "クルビア": { public: 0.48, work: 0.66, housing: 0.54, medical: 0.42, disclosure: 0.62 },
        "極東": { public: 0.44, work: 0.44, housing: 0.42, medical: 0.38, disclosure: 0.44 },
        "イベリア": { public: 0.72, work: 0.68, housing: 0.65, medical: 0.74, disclosure: 0.82 },
        "シラクーザ": { public: 0.55, work: 0.58, housing: 0.52, medical: 0.5, disclosure: 0.62 },
        "サルゴン": { public: 0.48, work: 0.46, housing: 0.43, medical: 0.52, disclosure: 0.52 },
        "カズデル": { public: 0.52, work: 0.48, housing: 0.4, medical: 0.66, disclosure: 0.6 },
        "サーミ": { public: 0.38, work: 0.38, housing: 0.34, medical: 0.62, disclosure: 0.42 },
        "リターニア": { public: 0.52, work: 0.54, housing: 0.46, medical: 0.45, disclosure: 0.56 },
        "イェラグ": { public: 0.38, work: 0.36, housing: 0.32, medical: 0.46, disclosure: 0.4 },
        "レム・ビリトン": { public: 0.48, work: 0.62, housing: 0.5, medical: 0.46, disclosure: 0.6 },
        "ボリバル": { public: 0.52, work: 0.54, housing: 0.5, medical: 0.54, disclosure: 0.58 },
        "シエスタ": { public: 0.34, work: 0.42, housing: 0.35, medical: 0.36, disclosure: 0.38 },
        "ミノス": { public: 0.28, work: 0.3, housing: 0.3, medical: 0.28, disclosure: 0.32 },
        default: { public: 0.48, work: 0.48, housing: 0.46, medical: 0.46, disclosure: 0.5 }
      },
      environments: {
        "サルゴン": [
          { n: "乾燥地・オアシス", w: 45 },
          { n: "熱帯雨林", w: 35 },
          { n: "高地・その他", w: 20 }
        ],
        "サーミ": [
          { n: "森林", w: 45 },
          { n: "湿地", w: 30 },
          { n: "雪原・北方山地", w: 25 }
        ]
      },
      namedCities: {
        "クルビア": ["トリマウンツ"],
        "炎国": ["玉門", "尚蜀"],
        "龍門": ["龍門"],
        "ヴィクトリア": ["ロンディニウム"],
        "ウルサス": ["チェルノボーグ", "ゼルグラード", "サンクト・グリファーブルク"],
        "ボリバル": ["エル・ソル", "ドッソレス"],
        "シエスタ": ["シエスタ"],
        "シラクーザ": ["ウォルシーニ"],
        "カジミエーシュ": ["カヴァレリエルキ"]
      },
      parentJobs: [
        { n: "日雇い・農作業", w: 2, jobId: 1 },
        { n: "工場労働者", w: 2, jobId: 2 },
        { n: "鉱夫", w: 1, jobId: 3 },
        { n: "傭兵・護衛", w: 1, jobId: 4 },
        { n: "商人", w: 1, jobId: 5 },
        { n: "官吏", w: 1, jobId: 6 },
        { n: "技師", w: 1, jobId: 7 },
        { n: "医師・研究者", w: 0.8, jobId: 8 }
      ]
    },
    false
  );

  $define(
    "REGIONAL_LIFE_PROFILES",
    {
      "ラテラーノ": {
        sourceRefs: ["SRC_LATERANO_CIVIC", "SRC_LATERANO_ARENE", "SRC_LATERANO_FAMILY_LAW"],
        evidence:
          "アレーンのオペレーター記録は、感染者市民が市民権を保つ一方、少数の特別な場合を除いて領内に留まれず、アレーン自身も感染後に追放されたと記す。公的医療・教育・保険、追放後の手当・薬に関する広い説明は二次整理に依拠する。",
        scope:
          "ゲームは通常の追放規則を表すが、アレーンの記録にある例外の種類・判定や個別の市民資格、適用年代をモデル化していない。追放後給付は二次資料のみで独立確認できず、実装していない。",
        implementedPaths: ["lat_exile", "post_exile_citizenship_display", "family_spouse_death"]
      },
      "ウルサス": {
        sourceRefs: [
          "SRC_URSUS_INFECTED",
          "SRC_URSUS_EP16",
          "SRC_URSUS_EP17",
          "SRC_URSUS_EP17_TIMELINE",
          "SRC_URSUS_ZELGRAD_CITY",
          "SRC_URSUS_MINE_LIFE",
          "SRC_INDUSTRIAL_LIFE"
        ],
        evidence:
          "軍事・鉱業と、感染者への強制労働・捜索の事例が記述される。第16章の監視付き坑夫はクライニ・セーヴェル中央鉱区に限る作中事例。第17章はゼルグラードの特定危機と人物による証言・推測を描く。",
        scope:
          "全国一律の送致制度、感染者の捜索・拘束や求人の発生率、年代を通じた標準運用とは確認できない。居住環境タグによる捜索イベント範囲は行政機関の公式管轄でなく、都市・工業区画への接触可能性を表すゲーム上の代理条件。主人公の強制配属・医療支援・結果は個別のゲーム仮定。",
        implementedPaths: [
          "car",
          "ursus_mine_assignment_review (個別の強制配属後に限る後年経路)",
          "life_ursus_zelgrad_recruitment (1102年の局地的な求人伝聞から応募・採用後の継続/離職), life_ursus_zelgrad_evacuation (1102年の危機における一人の退避/残留と後年の帰還), life_ursus_zelgrad_displaced_work (旧工場との在職終了、避難後の技能転用/求職), life_ursus_zelgrad_displaced_work_review (避難先の修理工房での継続/離職)",
          "urs_sweep (居住環境を代理条件にした局地的捜索)"
        ]
      },
      "ヴィクトリア": {
        sourceRefs: ["SRC_VICTORIA_INFECTED", "SRC_TERRA_INDUSTRY_POLICY"],
        evidence:
          "ユーザー提供の二次整理は、ヴィクトリアの重工業・貴族政治と、感染者が工業汚染・隔離政策の双方に直面する記述をまとめる。",
        scope:
          "全地域・全時代に一律の隔離法が適用されるとは確認できない。地域別の圧力補正は工業・採掘居住地に限定したゲーム仮定で、特定の企業・雇用主・公的機関による措置や個人の実体験を示さない。適用年代と個人資格は未確認。",
        implementedPaths: ["感染者圧力: ヴィクトリアの工業・採掘居住地に限定した雇用・住居・開示補正"]
      },
      "クルビア": {
        sourceRefs: ["SRC_COLUMBIA_INSURANCE", "SRC_COLUMBIA_DV5", "SRC_TERRA_INDUSTRY_POLICY"],
        evidence:
          "二次整理は感染者の保険負担、隔離地域や辺境開拓契約への経済的圧力を記述する。サイドストーリー『翠玉の夢』DV-5の転載本文では、保険料を払えば通常の生活ができるという人物の発言がある。別資料は研究・技術・企業活動を産業の柱としてまとめる。",
        scope:
          "保険料・給付率・失効条件・強制移送率の公式共通値は未確認。DV-5の台詞は一人物の説明で、全国一律制度や加入者の実際の診療を受けることを証明しない。産業資料は個別求人・資格・採用率・賃金を示さない。応募費・知識条件・採用結果はゲーム仮定。",
        implementedPaths: ["col_insure", "col_coverage_gap", "col_frontier", "car: 研究企業の技師職応募"]
      },
      "龍門": {
        sourceRefs: ["SRC_LUNGMEN_AUTONOMY", "SRC_LUNGMEN_SLUM", "SRC_LUNGMEN_SECURITY"],
        evidence:
          "二次整理資料は龍門を炎国の自治地域、経済特区に近い高度な移動都市として記述し、都市内部の市民区域・周縁地区と感染者の居住格差を扱う。近衛局は複数部隊からなる治安組織として整理される。",
        scope:
          "自治関係・経済特区の説明は二次整理の記述で、個人の市民資格・権利・炎国法の適用範囲や都市内の現在の区画状態は個別に未確認。ゲームは炎国の制度・物価・圧力を龍門へ自動継承しない。18歳以降の巡回要員応募は近衛局の存在に基づくゲーム上の機会であり、採用資格・選考・応募費・採用率を公式設定として示さない。",
        implementedPaths: [
          "龍門固有の社会圧力・物価・移動先モデル",
          "lon_guard: 近衛局の巡回要員応募（条件・費用・選考率はゲーム仮定）"
        ]
      },
      "シエスタ": {
        sourceRefs: ["SRC_SIESTA_LOCALITY"],
        evidence:
          "二次整理は火山・海岸の景観、観光資源、災害曝露、都市移動と観光労働の季節性を扱う。独立都市国家の形成史は同資料が二次Wikiに基づき紹介する。",
        scope:
          "シエスタの政治的帰属・個別の居住資格・現在の統治関係は本資料だけでは確定しない。季節求人の発生頻度・採用条件・賃金は資料にないため、個別の任意イベントとしてゲーム仮定で表す。",
        implementedPaths: ["地域・移動先としての登録", "sie_seasonal_work（成人向け任意の短期観光雇用）"]
      },
      "ボリバル": {
        sourceRefs: ["SRC_BOLIVAR_CIVIL_WAR", "SRC_BOLIVAR_ECONOMY"],
        evidence:
          "二次整理資料は多民族・移住者社会と、農業・採鉱・傭兵産業が紛争経済に結びつくことを扱い、内戦下の地域・都市・軍閥間に差があると留保する。",
        scope:
          "全国一律の雇用・徴用制度、個人の職業選択、採用率、資格、賃金、各地の安全性は確定しない。イベントと候補職重みは出典の方向性を用いたゲーム上の仮定。",
        implementedPaths: [
          "bol_war",
          "bol_tourist",
          "bol_local_contract（任意の短期仕事。賃金・求人・安全はゲーム仮定）"
        ]
      },
      "レム・ビリトン": {
        sourceRefs: ["SRC_RIM_WORK", "SRC_LEONHARDT_ARCHIVE", "SRC_CATASTROPHE_TRANSPORTER_OFFICIAL"],
        evidence:
          "ユーザー提供の整理資料は鉱区・鉱山・工場と採掘労働の危険を扱う。レオンハルトの人物資料は、エウレカ自治州で天災トランスポーターとして鉱山隊に同行し、天災後の坑内で鉱床を調べる個人経歴を記す。公式インタビューは専門職の早期警戒、環境観測・計測、近隣都市への警報を説明する。",
        scope:
          "人物資料の個別経歴であり、全鉱区の職制・助手の雇用・採用率・賃金・安全手順を示さない。調査助手の応募と二年後の選択、観測補助の担当はゲーム上の仮定で、独立した予報業務や資格取得を意味しない。",
        implementedPaths: [
          "car: 鉱区の採掘班",
          "car: 天災トランスポーターに同行する鉱区調査助手への応募",
          "rim_catastrophe_transporter_review: 鉱山記録の継続、観測補助への役割変更、一般のトランスポーターへの転向"
        ]
      },
      "ミノス": {
        sourceRefs: ["SRC_MINOS_HERO_CULTURE", "SRC_MINOS_INFECTION_STORY"],
        evidence:
          "『Medjehtiqedti Bound』の一場面では、アテヌスで感染者向けの診療体制を整える動きと、鉱石病が英雄の精神を損なうという見方が併存する。患者の一人は未登録のまま薬を受け取り、周囲の評価を恐れて病気を伏せていた。",
        scope:
          "これはイベント中の特定都市・個人・進行中の制度整備を扱う作中事例で、ミノス全域・全時代の制度や住民態度を示さない。個人の資格、医療機関の容量、診療費、制度の適用期間は不明。地域圧力係数はこの質的差を表現するゲーム仮定であり、正史統計ではない。",
        implementedPaths: [
          "minos_hero_spirit_stigma（感染家族の診療経験がある子ども向け。個別の偏見経験）",
          "regionalServiceContext（1100年アテヌスの整備事例を情報注記として表示。個人アクセス経路なし）"
        ]
      }
    },
    false
  );

  $define(
    "REGIONAL_RESIDENCE_PROFILES",
    {
      "サーミ": {
        basis: "game-assumption",
        evidence: "利用者指定の居住形態の生成率。原作の人口統計を示すものではない。",
        sourceRefs: [],
        allowedHomes: ["移動都市", "固定集落"],
        mobileCityShare: 0.03,
        scope: "利用者指定のゲーム設定。出生・転居先の自動選択に適用し、公式の人口統計とは扱わない。"
      },
      "サルゴン": {
        basis: "game-assumption",
        evidence: "利用者指定の居住形態の生成率。原作の人口統計を示すものではない。",
        sourceRefs: [],
        allowedHomes: ["移動都市", "固定集落"],
        mobileCityShare: 0.04,
        scope: "利用者指定のゲーム設定。出生・転居先の自動選択に適用し、公式の人口統計とは扱わない。"
      },
      "イベリア": {
        basis: "game-assumption",
        evidence: "利用者指定の居住形態の生成率。原作の人口統計を示すものではない。",
        sourceRefs: [],
        allowedHomes: ["固定集落"],
        scope: "利用者指定のゲーム設定として移動都市を生成しない。"
      },
      "イェラグ": {
        allowedHomes: ["固定集落"],
        sourceRefs: ["SRC_KJERAG_LIFE"],
        evidence: "公式世界紹介はイェラグを雪深い山岳地形で天災の影響がほぼない宗教国家として説明する。",
        scope: "移動都市が存在しないことを示す資料ではない。ゲームでは山岳生活圏を移動都市として生成しない。"
      }
    },
    false
  );

  $define(
    "REGIONAL_EMPLOYMENT_PROFILES",
    {
      "クルビア": {
        sourceRefs: ["SRC_TERRA_INDUSTRY_POLICY"],
        evidence: "研究・技術・企業活動が経済の柱として整理される。",
        scope:
          "地域内の雇用統計や採用資格・賃金を示すものではない。配偶者候補には弱い仕事重み、本人の進路には知識条件付きの技師見習い応募を接続するが、雇用統計や実際の就業を断定しない。",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        weights: { 2: 1.15, 5: 1.1, 7: 1.35, 8: 1.3 }
      },
      "ヴィクトリア": {
        sourceRefs: ["SRC_TERRA_INDUSTRY_POLICY"],
        evidence:
          "重工業・機械・兵器・金融や保険仲介が発展したとの記述がある一方、身分・教育・地縁が機会を左右する。",
        scope:
          "全国一律の求人・採用資格・賃金差は未確認。職種重みは配偶者候補に限る弱いゲーム仮定。本人の進路には知識条件付きの帳簿係応募を加えるが、制度的な階層差や地縁は網羅せず、公式採用条件の再現を主張しない。",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        weights: { 2: 1.3, 3: 1.1, 5: 1.12, 6: 1.08, 7: 1.2 },
        eventIds: [
          "car",
          "vic_clerk_contract_review",
          "vic_clerk_role_review",
          "vic_clerk_later_years",
          "vic_clerk_after_departure"
        ],
        implementedPaths: [
          "car: 紹介先を通じた保険仲介所の帳簿係応募（応募の条件は掲示にある範囲しか分からない）",
          "vic_clerk_contract_review: 契約書類の照合補助と窓口権限の限界（個別職場の仮想事例）"
        ]
      },
      "龍門": {
        sourceRefs: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_LUNGMEN_AUTONOMY"],
        evidence: "商業・金融・物流と開放的な移動都市経済が整理される。都市内部には生活圏の階層差がある。",
        scope:
          "個人の市民資格・就労許可・応募条件・賃金・区画別求人は確認できない。候補の弱いゲーム用重み付けに限り、資格判定や候補除外には使わない。",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        weights: { 5: 1.3, 6: 1.12, 7: 1.12, 8: 1.08 }
      },
      "シエスタ": {
        sourceRefs: ["SRC_SIESTA_LOCALITY"],
        evidence: "観光資源と季節雇用が二次整理資料に記載される。",
        scope:
          "賃金・職種別求人・採用資格を示す資料はない。配偶者の仕事候補に弱い重みを付けるだけで、候補を除外しない。",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        weights: { 1: 1.12, 5: 1.12 }
      },
      "ボリバル": {
        sourceRefs: ["SRC_BOLIVAR_ECONOMY"],
        evidence: "農業・採鉱・傭兵産業が紛争経済と結びつくとの二次整理がある。",
        scope:
          "地域内雇用統計、募集、採用資格、職種別賃金を示す資料ではない。配偶者候補に対する弱い重みだけに用い、候補を除外しない。",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        weights: { 1: 1.12, 3: 1.1, 4: 1.08 }
      }
    },
    false
  );

  $define(
    "REGIONAL_SERVICE_PROFILES",
    {
      "クルビア": {
        sourceRefs: ["SRC_COLUMBIA_INSURANCE", "SRC_COLUMBIA_DV1", "SRC_COLUMBIA_DV5"],
        evidence:
          "二次整理は保険負担と経済的圧力を整理する。『翠玉の夢』DV-1/DV-5の会話記録では、保険料を負担できない感染者が隔離区画での治療へ向かう場合や、保険料と実際の治療の釣り合いに対する人物の不満が語られる。",
        scope:
          "会話は作中の人物・状況の説明で、全国一律の強制隔離、窓口の実在、給付条件、適用年代を証明しない。隔離区画への案内と選択後の生活はゲーム上の一経路で、診療効果や無料治療を保証しない。保険料・給付率もゲーム仮定。",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        path: "col_insure → col_coverage_gap → col_quarantine_offer（保険空白後の一度限りの選択式案内）",
        eventIds: ["col_insure", "col_coverage_gap", "col_quarantine_offer"],
        kind: "有料保険と、保険空白後に選べる隔離区画の診療経路"
      },
      "ラテラーノ": {
        sourceRefs: ["SRC_LATERANO_CIVIC", "SRC_LATERANO_ARENE"],
        evidence:
          "二次整理は公的サービス・追放後の条件付き支援を記し、アレーンのオペレーター記録は感染者市民の権利と、少数の特別な場合以外の領外退去を説明する。",
        scope:
          "Areneの個別例と記述された通常規則を参照する。例外の判定基準・制度の有効年代・個人資格は未確認。追放後給付の資格・額・継続条件は二次資料のみで、給付は未実装。",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        path: "lat_exile（通常の追放規則を表すゲーム用モデル。例外審査・追放後給付は未実装）",
        eventIds: ["lat_exile"],
        kind: "市民資格に関わる公的支援"
      },
      "龍門": {
        sourceRefs: ["SRC_LUNGMEN_SLUM", "SRC_LUNGMEN_AUTONOMY"],
        evidence:
          "二次資料は商業拠点の繁栄とスラムの貧困・感染者を含む階層差を記述する。食料配分や診療所への同行は、それを手がかりにしたゲーム上の単発の出会いとして表現する。",
        scope:
          "地区互助の制度化・頻度、公的な受給権・施設容量・診療受入れ、自治関係の適用年代は未確認。互助の出会いは移動都市の周縁/避難労働区画を生活環境のゲーム用代理条件とする。選択履歴はその場で道順を聞いた経験だけを記録し、受診成功や広く利用できる制度知識を意味しない。",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        path: "龍門・移動都市の周縁/避難労働区画: lon_slum → infected_neighbor",
        eventIds: ["lon_slum", "infected_neighbor"],
        kind: "遭遇時の地区互助"
      },
      "ミノス": {
        sourceRefs: ["SRC_MINOS_INFECTION_STORY"],
        evidence:
          "『Medjehtiqedti Bound』は1100年のアテヌスで、ロドスのレナが感染者向け診療体制を整え始めた一場面を描く。",
        scope:
          "アテヌスの特定時点の整備事例だけを記録する。プレイヤーの居住地がアテヌスか、制度の完成時期、個人資格、窓口、受入れ容量、診療費、利用結果は不明。ミノス全域の常設制度や本人の受診経路としては実装しない。",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        path: "1100年・アテヌスの作中整備事例（制度情報のみ。個人アクセス経路なし）",
        eventIds: [],
        informationalOnly: true,
        anchorYear: 1100,
        kind: "特定都市の診療体制整備に関する作中事例"
      }
    },
    false
  );

  $define(
    "REGIONAL_ENTITY_CONTEXT",
    {
      "龍門": {
        unitType: "都市を中心とする自治地域",
        parentRegion: "炎国",
        parentRelation: "自治地域とする二次資料の記述",
        parentRelationStatus: "secondary_report",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        sourceRefs: ["SRC_LUNGMEN_AUTONOMY"],
        policyInheritance: "none",
        note: "炎国との政治関係を要約に示す。個人の市民資格と法適用は別記録で、炎国の係数・制度は自動継承しない。"
      },
      "シエスタ": {
        unitType: "都市・生活圏",
        parentRegion: null,
        parentRelation: "政治的帰属は未確認",
        parentRelationStatus: "unverified",
        temporalStatus: "unverified",
        validFromYear: null,
        validToYear: null,
        sourceRefs: ["SRC_SIESTA_LOCALITY"],
        policyInheritance: "none",
        note: "都市・生活圏として追跡する。独立都市国家の形成史を紹介する二次Wiki記述は、現在の主権・居住資格の確定根拠として扱わない。"
      }
    },
    false
  );

  $define(
    "REGIONAL_HISTORICAL_LOCALITIES",
    {
      "ヴィクトリア": [
        {
          name: "ヒロック郡",
          kind: "歴史的地方",
          personalAssignment: "unassigned",
          transitions: [
            {
              relationship: "ターラーの一部として記述",
              status: "secondary_report",
              validFromYear: null,
              validToYear: null
            },
            {
              relationship: "紛争・条約後にヴィクトリアへ編入したとの記述",
              status: "secondary_report",
              validFromYear: null,
              validToYear: null
            }
          ],
          sourceRefs: ["SRC_VICTORIA_HILLOCK_HISTORY"],
          note: "二次整理資料は編入後に移動都市が建設され、地域の繁栄と外部支配の象徴性、駐屯・文化抑圧、農業・軽工業を記述する。個人の出身地・居住歴は記録していない。"
        }
      ]
    },
    false
  );

  $define(
    "SIM_PARAMS",
    [
      {
        id: "clock.yearMs",
        label: "1年の実時間",
        value: 50000,
        unit: "ms/年",
        status: "S",
        scope: "進行",
        description: "ゲーム内1年の進行時間。",
        source: "ゲーム用仮定",
        usedBy: ["タイマー"]
      },
      {
        id: "clock.startYear",
        label: "開始年",
        value: 1077,
        unit: "年",
        status: "S",
        scope: "出生",
        description: "シミュレーション開始年。作中の確定年ではない。",
        source: "ゲーム用設定",
        usedBy: ["新規出生", "年表アンカー"]
      },
      {
        id: "clock.minimumBirthYear",
        label: "選択可能な最初の出生年",
        value: 1000,
        unit: "年",
        status: "S",
        scope: "出生",
        description: "開始画面で指定できる最も早い出生年。年表がこの年から連続していることを意味しない。",
        source: "ゲーム用設定",
        usedBy: ["新規出生", "年表監査"]
      },
      {
        id: "clock.maximumBirthYear",
        label: "選択可能な最後の出生年",
        value: 1100,
        unit: "年",
        status: "S",
        scope: "出生",
        description: "開始画面で指定できる最も遅い出生年。以後の年表未収録期間も進行可能。",
        source: "ゲーム用設定",
        usedBy: ["新規出生"]
      },
      {
        id: "events.majorChancePerSlot",
        label: "分岐イベント基準率",
        value: 0.16,
        unit: "確率/抽選枠",
        status: "S",
        scope: "イベント",
        description: "抽選枠ごとの分岐イベント基準率。年間発生率ではない。",
        source: "ゲーム用仮定",
        usedBy: ["イベント抽選"]
      },
      {
        id: "events.dailyNeutralToneShare",
        label: "日常イベント中立判定率",
        value: 0.6,
        unit: "累積確率",
        status: "S",
        scope: "イベント",
        description: "日常イベント抽選で最初に中立結果群を選ぶ境界。",
        source: "ゲーム用仮定",
        usedBy: ["日常イベント選択"]
      },
      {
        id: "events.dailyPositiveToneShare",
        label: "日常イベント良結果判定率",
        value: 0.2,
        unit: "確率",
        status: "S",
        scope: "イベント",
        description: "日常イベント抽選で中立群の後に良結果群へ割り当てる幅。残りを悪結果群とする。",
        source: "ゲーム用仮定",
        usedBy: ["日常イベント選択"]
      },
      {
        id: "events.slotPlacementCeiling",
        label: "年間抽選枠の月内配置上限",
        value: 0.98,
        unit: "年内比率",
        status: "S",
        scope: "イベント",
        description: "各イベント抽選枠を年の最後の月より前に配置する乱数上限。",
        source: "ゲーム用仮定",
        usedBy: ["イベント予定"]
      },
      {
        id: "events.childSlots",
        label: "3歳未満の年間抽選枠",
        value: [1, 2],
        unit: "枠/年",
        status: "S",
        scope: "イベント",
        description: "幼児期の年間イベント抽選枠の最小・最大。",
        source: "ゲーム用仮定",
        usedBy: ["イベント予定"]
      },
      {
        id: "events.adultSlots",
        label: "3歳以上の年間抽選枠",
        value: [3, 6],
        unit: "枠/年",
        status: "S",
        scope: "イベント",
        description: "3歳以上の年間イベント抽選枠の最小・最大。",
        source: "ゲーム用仮定",
        usedBy: ["イベント予定"]
      },
      {
        id: "birth.mobileCityShare",
        label: "移動都市出生抽選率",
        value: 0.7,
        unit: "確率",
        status: "S",
        scope: "居住",
        description: "移動都市を出生時に選ぶ抽選率。人口比ではない。",
        source: "ゲーム用仮定",
        usedBy: ["出生"]
      },
      {
        id: "birth.lowAccessThreshold",
        label: "出生時の進路機会が限られる値",
        value: 0.35,
        unit: "地域アクセス値",
        status: "S",
        scope: "出生・教育",
        description:
          "出生地区のアクセス値がこの目安を下回る場合、初期就業候補から長期教育や高い参入条件を要する職を除くゲーム用仮定。地域の実測値や職業資格の普遍基準ではない。",
        source: "ゲーム用仮定",
        usedBy: ["初期就業候補"]
      },
      {
        id: "migration.mobileCityArrivalShare",
        label: "移住後に移動都市へ住む抽選率",
        value: 0.55,
        unit: "確率",
        status: "S",
        scope: "居住",
        description:
          "イベントで到着後の居住形態が指定されない場合、移動都市を選ぶ抽選率。人口比・移住先の都市構成を表す公式資料はなく、ゲーム上の仮定。",
        source: "ゲーム用仮定",
        usedBy: ["地域間移住"]
      },
      {
        id: "migration.recentArrivalYears",
        label: "転居直後とみなす期間",
        value: 3,
        unit: "年",
        status: "S",
        scope: "居住",
        description:
          "近所・地区への順応を描写する転居後の期間。文化への適応速度や移住経験の公式設定ではなく、ゲーム上の仮定。",
        source: "ゲーム用仮定",
        usedBy: ["転居直後タグ", "地域順応日常イベント"]
      },
      {
        id: "birth.parentRaceShare",
        label: "親の種族継承抽選率",
        value: 0.7,
        unit: "確率",
        status: "S",
        scope: "家族",
        description: "出生時に父の種族を選ぶ抽選率。遺伝法則の設定ではない。",
        source: "ゲーム用仮定",
        usedBy: ["出生"]
      },
      {
        id: "birth.parentAgeAtBirthMin",
        label: "親の出生時最低年齢",
        value: 18,
        unit: "歳",
        status: "S",
        scope: "家族",
        description: "出生時の親年齢を生成する下限。家族形態や出産年齢のテラ全域共通統計を示さない。",
        source: "ゲーム用仮定",
        usedBy: ["親族の年齢記録"]
      },
      {
        id: "birth.parentAgeAtBirthMax",
        label: "親の出生時最高年齢",
        value: 42,
        unit: "歳",
        status: "S",
        scope: "家族",
        description: "出生時の親年齢を生成する上限。設定資料にない範囲を可視化したゲーム用の仮定。",
        source: "ゲーム用仮定",
        usedBy: ["親族の年齢記録"]
      },
      {
        id: "family.deathNoticeDelayMaxYears",
        label: "親しい関係者の訃報通知遅延上限",
        value: 3,
        unit: "年",
        status: "S",
        scope: "家族・情報",
        description:
          "親・きょうだい・配偶者・成人した子・友人・顔なじみの隣人について、本人が知らせを受けるまでに経過した年数の上限。死亡年は出生年や親しい関係が始まった年より前にしない。同居・扶養中の子は知らせの遅延を置かない。遅延の頻度や上限は表現上のゲーム仮定であり、テラの通信事情や平均遅延を示す統計ではない。",
        source: "ゲーム用仮定",
        usedBy: ["親族・近しい人物の死別イベント", "家族・関係者の状態監査"]
      },
      {
        id: "birth.childRaceInheritanceShare",
        label: "子の種族継承抽選率",
        value: 0.7,
        unit: "確率",
        status: "S",
        scope: "家族",
        description: "子の種族を両親のどちらから選ぶかのゲーム内抽選率。生物学的遺伝の公式設定ではない。",
        source: "ゲーム用仮定",
        usedBy: ["子の記録"]
      },
      {
        id: "birth.femaleShare",
        label: "女性として生まれる抽選率",
        value: 0.5,
        unit: "確率",
        status: "S",
        scope: "出生",
        description: "人物の性別を抽選するモデル上の比率。テラの人口統計ではない。",
        source: "ゲーム用仮定",
        usedBy: ["出生", "子の記録"]
      },
      {
        id: "birth.monthCount",
        label: "誕生日の月数",
        value: 12,
        valueType: "positiveInteger",
        unit: "月/年",
        status: "S",
        scope: "暦",
        description: "誕生日生成と月進行に共通で使うゲーム内の月数。作中暦の確定設定ではない。",
        source: "ゲーム用仮定",
        usedBy: ["出生", "イベント予定", "月表示"]
      },
      {
        id: "birth.daysPerMonth",
        label: "誕生日の月内日数上限",
        value: 28,
        valueType: "positiveInteger",
        unit: "日/月",
        status: "S",
        scope: "暦",
        description: "各月を同じ日数として扱うゲーム内簡略化。作中暦の確定設定ではない。",
        source: "ゲーム用仮定",
        usedBy: ["出生"]
      },
      {
        id: "birth.initialHouseholdReserveYears",
        label: "家計の初期準備金（旧セーブ用）",
        value: 2,
        unit: "年分の生活費",
        status: "S",
        scope: "家計",
        description: "家計口座のない旧セーブを補完する準備金。新規出生では資産階層と養育環境から別途決める。",
        source: "ゲーム用仮定",
        usedBy: ["旧セーブ補完"]
      },
      {
        id: "life.mortalityAgeScale",
        label: "強制老衰判定係数",
        value: 105,
        unit: "寿命係数倍・年齢",
        status: "S",
        scope: "死亡",
        description: "到達時に老衰死とするゲーム上の上限。平均寿命ではない。",
        source: "ゲーム用仮定",
        usedBy: ["死亡判定"]
      },
      {
        id: "life.oldAgeMortalityStart",
        label: "老衰確率の開始年齢係数",
        value: 68,
        unit: "寿命係数倍・年齢",
        status: "S",
        scope: "死亡",
        description: "老衰死の年次確率が増え始める境界。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "life.oldAgeMortalitySlope",
        label: "老衰確率の増加幅",
        value: 0.012,
        unit: "確率/係数年",
        status: "S",
        scope: "死亡",
        description: "境界を超えた後の老衰確率の増加係数。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "life.generalMortalityBase",
        label: "一般病死の基礎確率",
        value: 0.0006,
        unit: "確率/年",
        status: "S",
        scope: "死亡",
        description: "健康状態補正前の一般病死率。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "life.generalMortalityHealthScale",
        label: "健康状態による病死補正",
        value: 0.01,
        unit: "確率係数",
        status: "S",
        scope: "死亡",
        description: "健康不良度の二乗へ掛ける一般病死補正。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "life.underageMortalityScale",
        label: "20歳未満の一般病死補正",
        value: 0.25,
        unit: "倍率",
        status: "S",
        scope: "死亡",
        description: "一般病死にかかる年齢補正。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "life.accidentMortalityBase",
        label: "事故死の基礎確率",
        value: 0.0012,
        unit: "確率/年",
        status: "S",
        scope: "死亡",
        description: "事故補正前の基準値。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "life.disasterMortalityBase",
        label: "天災死の基礎確率",
        value: 0.0012,
        unit: "確率/年",
        status: "S",
        scope: "死亡",
        description: "天災補正前の基準値。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "life.warMortalityBase",
        label: "戦争被害の基礎確率",
        value: 0.002,
        unit: "確率/年",
        status: "S",
        scope: "死亡",
        description: "戦争圧力などの補正前の基準値。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "life.homicideMortalityBase",
        label: "他殺の基礎確率",
        value: 0.0005,
        unit: "確率/年",
        status: "S",
        scope: "死亡",
        description: "社会・貧困・属性補正前の基準値。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "life.suicideMortalityScale",
        label: "幸福低下による自殺補正",
        value: 0.012,
        unit: "確率係数",
        status: "S",
        scope: "死亡",
        description: "幸福が50を下回る場合に適用する係数。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "life.recoveryAgeScale",
        label: "健康回復の年齢係数",
        value: 40,
        unit: "寿命係数倍・年齢",
        status: "S",
        scope: "健康",
        description: "健康回復から加齢による低下へ移る計算上の境界。",
        source: "ゲーム用仮定",
        usedBy: ["年次更新"]
      },
      {
        id: "infection.regionRateScale",
        label: "地域別曝露機会の換算係数",
        value: 0.01,
        unit: "倍率",
        status: "S",
        scope: "鉱石病",
        description:
          "地域値を年次の抽象的な源石曝露・発症機会へ換算する係数。人口感染率や個人の具体的接触を示さないゲーム用仮定。",
        source: "ゲーム用仮定",
        usedBy: ["年次感染判定"]
      },
      {
        id: "infection.annualProgressBase",
        label: "感染度の年次進行基準",
        value: 1.6,
        unit: "感染度/年",
        status: "S",
        scope: "鉱石病",
        description: "未補正の年次感染度進行幅。",
        source: "ゲーム用仮定",
        usedBy: ["感染度更新"]
      },
      {
        id: "economy.debtInterest",
        label: "負債の年利",
        value: 0.04,
        unit: "確率/年",
        status: "S",
        scope: "家計",
        description:
          "通常債務に毎年加算する基準利率。闇金融の契約条件は個別イベントで別に扱う。公式の金融統計ではない。",
        source: "ゲーム用仮定",
        usedBy: ["家計更新"]
      },
      {
        id: "economy.expenseIncomeCap",
        label: "収入に対する支出上限（旧・互換）",
        value: 1,
        unit: "比率",
        status: "S",
        scope: "家計",
        description: "互換用。家計支出は年収比で打ち切らず、世帯規模・地域物価・実際の必要費用から算出する。",
        source: "ゲーム用仮定",
        usedBy: ["旧セーブ互換"]
      },
      {
        id: "information.personalRecallMinimumAge",
        label: "個人への事件伝達を記録する最低年齢",
        value: 6,
        valueType: "positiveInteger",
        unit: "歳",
        status: "S",
        scope: "情報",
        description:
          "本人が身近な事件の知らせを受け取った記録を残し始める年齢。出生時の世界年表登録とは分ける。発達上の公式基準ではない。",
        source: "ゲーム用仮定",
        usedBy: ["情報伝達", "出生直後の状態検査"]
      },
      {
        id: "information.historyWindow",
        label: "事件伝達の有効期間",
        value: 7,
        unit: "年",
        status: "S",
        scope: "情報",
        description: "発生からこの年数を超えた年表事件は新規伝達判定しない。",
        source: "ゲーム用仮定",
        usedBy: ["情報伝達"]
      },
      {
        id: "information.baseNearbyChance",
        label: "近隣事件の基準伝達率",
        value: 0.78,
        unit: "確率",
        status: "S",
        scope: "情報",
        description: "居住地域と事件地域が一致する場合の基準値。公式通信統計ではない。",
        source: "ゲーム用仮定",
        references: ["SRC_INFO_ACCESS"],
        usedBy: ["情報伝達"]
      },
      {
        id: "information.globalChance",
        label: "広域事件の基準伝達率",
        value: 0.98,
        unit: "確率",
        status: "S",
        scope: "情報",
        description: "広く流れる事件情報の基準値。公式の報道普及率ではない。",
        source: "ゲーム用仮定",
        references: ["SRC_INFO_ACCESS"],
        usedBy: ["情報伝達"]
      },
      {
        id: "information.distantChance",
        label: "遠隔事件の基準伝達率",
        value: 0.09,
        unit: "確率",
        status: "S",
        scope: "情報",
        description: "居住地域外の事件情報の基準値。公式の通信統計ではない。",
        source: "ゲーム用仮定",
        references: ["SRC_INFO_ACCESS"],
        usedBy: ["情報伝達"]
      },
      {
        id: "information.accessBase",
        label: "情報アクセスの基礎値",
        value: 0.55,
        unit: "倍率",
        status: "S",
        scope: "情報",
        description: "地域の情報網係数に加える基礎値。",
        source: "ゲーム用仮定",
        references: ["SRC_INFO_ACCESS"],
        usedBy: ["情報伝達"]
      },
      {
        id: "information.accessScale",
        label: "情報網による伝達補正",
        value: 0.45,
        unit: "倍率",
        status: "S",
        scope: "情報",
        description: "地域の情報網係数に掛ける伝達補正。",
        source: "ゲーム用仮定",
        references: ["SRC_INFO_ACCESS"],
        usedBy: ["情報伝達"]
      },
      {
        id: "information.mobileMobilityScale",
        label: "移動都市の情報移動補正",
        value: 1.08,
        unit: "倍率",
        status: "S",
        scope: "情報",
        description: "移動都市に暮らす場合の情報伝達補正。",
        source: "ゲーム用仮定",
        references: ["SRC_INFO_ACCESS"],
        usedBy: ["情報伝達"]
      },
      {
        id: "information.fixedMobilityScale",
        label: "固定居住地の情報移動補正",
        value: 0.84,
        unit: "倍率",
        status: "S",
        scope: "情報",
        description: "固定居住地に暮らす場合の情報伝達補正。",
        source: "ゲーム用仮定",
        references: ["SRC_INFO_ACCESS"],
        usedBy: ["情報伝達"]
      },
      {
        id: "information.delayFloor",
        label: "情報遅延補正の下限",
        value: 0.25,
        unit: "倍率",
        status: "S",
        scope: "情報",
        description: "時間経過による伝達率低下の下限。",
        source: "ゲーム用仮定",
        usedBy: ["情報伝達"]
      },
      {
        id: "information.delayPerYear",
        label: "情報遅延の年次低下",
        value: 0.1,
        unit: "倍率/年",
        status: "S",
        scope: "情報",
        description: "発生からの経過年による伝達率低下。",
        source: "ゲーム用仮定",
        usedBy: ["情報伝達"]
      },
      {
        id: "information.chanceCap",
        label: "情報伝達率の上限",
        value: 0.96,
        unit: "確率",
        status: "S",
        scope: "情報",
        description: "係数合成後に適用する伝達率の上限。",
        source: "ゲーム用仮定",
        usedBy: ["情報伝達"]
      },
      {
        id: "world.maxLifeEvents",
        label: "比較人物の件数",
        value: 3,
        unit: "人",
        status: "S",
        scope: "結果画面",
        description: "死亡後に表示する比較人生の人数。",
        source: "ゲーム用設定",
        usedBy: ["死亡結果UI"]
      },
      // LIFE / MORTALITY V2. Values are game assumptions, never Terra epidemiology.
      {
        id: "mortality.chronicOnset",
        label: "長期疾患の年次発生基準",
        value: 0.008,
        unit: "確率/年",
        status: "S",
        scope: "健康",
        description: "非感染性疾患のゲーム上の発生抽選。公式疾病統計ではない。",
        source: "ゲーム用仮定",
        usedBy: ["疾病エピソード"]
      },
      {
        id: "mortality.injuryOnset",
        label: "非致死的負傷の年次発生基準",
        value: 0.011,
        unit: "確率/年",
        status: "S",
        scope: "健康",
        description: "職業・危険地区による負傷エピソードを作る抽選。",
        source: "ゲーム用仮定",
        usedBy: ["負傷エピソード"]
      },
      {
        id: "mortality.episodeWorsening",
        label: "未治療時の悪化基準",
        value: 0.32,
        unit: "確率/年",
        status: "S",
        scope: "健康",
        description: "重症化を一度に確定させず、年ごとの病状に反映。",
        source: "ゲーム用仮定",
        usedBy: ["症状進行"]
      },
      {
        id: "mortality.episodeRecovery",
        label: "軽症の回復基準",
        value: 0.28,
        unit: "確率/年",
        status: "S",
        scope: "健康",
        description: "一般疾患・負傷が落ち着く年次確率。鉱石病そのものは完治しない。",
        source: "ゲーム用仮定",
        usedBy: ["回復・後遺症"]
      },
      {
        id: "mortality.episodeCareReduction",
        label: "受診による重症化軽減係数",
        value: 0.38,
        unit: "倍率",
        status: "S",
        scope: "健康",
        description: "受診行動のリスク調整。治癒を保証しない。",
        source: "ゲーム用仮定",
        usedBy: ["疾病・死亡判定"]
      },
      {
        id: "mortality.episodeCareYears",
        label: "診療の効果を見直す年数",
        value: 2,
        unit: "年",
        status: "S",
        scope: "健康",
        description: "毎年の受診や生活調整を自動で永続させない期間。",
        source: "ゲーム用仮定",
        usedBy: ["診療の継続"]
      },
      {
        id: "mortality.suddenAcuteBase",
        label: "前兆の乏しい急病の基準",
        value: 0.00055,
        unit: "確率/年",
        status: "S",
        scope: "死亡",
        description: "全年齢に均等ではなく年齢・健康で補正。",
        source: "ゲーム用仮定",
        usedBy: ["急病"]
      },
      {
        id: "mortality.suicideCrisisBase",
        label: "深刻な心理的危機の自死危険基準",
        value: 0.009,
        unit: "確率/年",
        status: "S",
        scope: "死亡",
        description: "二年以上続く危機のときにのみ候補。深刻な孤立・絶望の継続を反映。支援時は大幅軽減。",
        source: "ゲーム用仮定",
        usedBy: ["自死の判定"]
      },
      {
        id: "mortality.violentThreatBase",
        label: "特定の脅迫からの致死危険基準",
        value: 0.0018,
        unit: "確率/年",
        status: "S",
        scope: "死亡",
        description: "記録された脅迫・暴力の継続状態がある場合にのみ候補。",
        source: "ゲーム用仮定",
        usedBy: ["他殺"]
      },
      {
        id: "mortality.precarityBase",
        label: "衰弱と生活困窮の致死危険基準",
        value: 0.0025,
        unit: "確率/年",
        status: "S",
        scope: "死亡",
        description: "負債の額ではなく健康悪化と栄養・住まいの不足が重なった場合に限定。",
        source: "ゲーム用仮定",
        usedBy: ["衰弱死"]
      },
      {
        id: "world.farEastWarReliefUntil",
        label: "極東の戦争補正終了年",
        value: 1092,
        unit: "年",
        status: "S",
        scope: "戦争",
        description: "極東で戦争リスク補正を適用する年の上限アンカー。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "world.farEastWarReliefScale",
        label: "極東の戦争リスク補正",
        value: 0.2,
        unit: "倍率",
        status: "S",
        scope: "戦争",
        description: "補正終了年より前に極東で適用する戦争リスク倍率。",
        source: "ゲーム用仮定",
        usedBy: ["年次死亡判定"]
      },
      {
        id: "infection.protectionMultiplier",
        label: "曝露防護を選んだ期間の年次感染判定倍率",
        value: 0.38,
        unit: "倍率",
        status: "S",
        scope: "鉱石病・曝露",
        description: "防護研修・安全装備の実施期間に使う仮定。防護しても安全が保証されるものではない。",
        source: "ゲーム上の仮定",
        references: ["SRC_ORI_HUMUS_RECORD", "SRC_ORI_CATHERINE_RECORD"],
        usedBy: ["年次曝露判定"]
      },
      {
        id: "infection.protectionYears",
        label: "防護対策の有効期間",
        value: 4,
        unit: "年",
        status: "S",
        scope: "鉱石病・曝露",
        description: "職場・居住地を見直すためのゲーム上の期間設定。",
        source: "ゲーム上の仮定",
        usedBy: ["安全対策イベント"]
      },
      {
        id: "infection.diagnosticReviewYears",
        label: "未診断感染の診察再検討期間",
        value: 2,
        unit: "年",
        status: "S",
        scope: "鉱石病・診療",
        description: "診断に届くまでの遅れの仮定。臨床的な潜伏期間ではない。",
        source: "ゲーム上の仮定",
        usedBy: ["診断確認イベント"]
      },
      {
        id: "infection.uncertainExposureReviewYears",
        label: "感染不明の曝露相談の再検討期間",
        value: 1,
        unit: "年",
        status: "S",
        scope: "鉱石病・曝露",
        description: "源石曝露の心配が続いた場合の連絡期間。",
        source: "ゲーム上の仮定",
        usedBy: ["曝露相談イベント"]
      },
      {
        id: "infection.worksiteFactor",
        label: "工業・採掘地区の追加曝露機会",
        value: 1.28,
        unit: "倍率",
        status: "S",
        scope: "鉱石病・曝露",
        description: "特定地区で汚染資材に接触しやすいというゲーム上の仮定。全工場・住民の発症率ではない。",
        source: "ゲーム上の仮定",
        references: ["SRC_ORI_CATHERINE_RECORD"],
        usedBy: ["年次曝露判定"]
      },
      {
        id: "infection.warDisplacementFactor",
        label: "戦乱・災害後の曝露機会補正",
        value: 1.3,
        unit: "倍率",
        status: "S",
        scope: "鉱石病・曝露",
        description: "瓦礫や廃棄物の処理に関わる可能性をまとめたゲーム上の仮定。難民の感染率の実測ではない。",
        source: "ゲーム上の仮定",
        usedBy: ["年次曝露判定"]
      },
      {
        id: "infection.screeningChance",
        label: "未診断感染が定期検査等で判明する年次モデルの機会",
        value: 0.22,
        unit: "確率/年",
        status: "S",
        scope: "鉱石病・診療",
        description: "発症・検査機会・診断が判明する時間差を表すゲーム用仮定。",
        source: "ゲーム上の仮定",
        usedBy: ["未診断感染の年次診断"]
      }
    ],
    false
  );

  $terraData.SIM_PARAMS.push(
    {
      id: "social.facilityPersonExitChance",
      label: "身近な施設職員の職務離脱基準",
      value: 0.025,
      unit: "確率/年",
      status: "S",
      scope: "周辺人物",
      description: "別の仕事や地区へ移ったことを抽象化。実際の転職率ではない。",
      source: "ゲーム用仮定",
      usedBy: ["施設関係者の独立更新"]
    },
    {
      id: "social.facilityPersonLateCareerAge",
      label: "施設関係者の後年の仕事見直し年齢",
      value: 62,
      unit: "歳",
      status: "S",
      scope: "周辺人物",
      description: "一律の定年を意味しない。",
      source: "ゲーム用仮定",
      usedBy: ["施設関係者の独立更新"]
    },
    {
      id: "social.facilityPersonLateCareerExit",
      label: "施設関係者の後年の離職機会",
      value: 0.1,
      unit: "確率/年",
      status: "S",
      scope: "周辺人物",
      description: "年齢による離職は仮定であり法的定年とは異なる。",
      source: "ゲーム用仮定",
      usedBy: ["施設関係者の独立更新"]
    },
    {
      id: "social.facilityPersonTemporaryLeave",
      label: "施設制限時の持ち場離脱機会",
      value: 0.12,
      unit: "確率/年",
      status: "S",
      scope: "周辺人物",
      description: "本人の勤務事情を推定するゲーム内処理。",
      source: "ゲーム用仮定",
      usedBy: ["施設関係者の独立更新"]
    },
    {
      id: "social.facilityPersonReturnChance",
      label: "一時離脱から戻る機会",
      value: 0.48,
      unit: "確率/年",
      status: "S",
      scope: "周辺人物",
      description: "復帰を保証しない。",
      source: "ゲーム用仮定",
      usedBy: ["施設関係者の独立更新"]
    },
    {
      id: "social.facilityPersonPermanentLeaveThreshold",
      label: "一時離脱後の職務離脱境界",
      value: 0.94,
      unit: "乱数境界",
      status: "S",
      scope: "周辺人物",
      description: "離職を表す抽象的判定境界。",
      source: "ゲーム用仮定",
      usedBy: ["施設関係者の独立更新"]
    }
  );
});
