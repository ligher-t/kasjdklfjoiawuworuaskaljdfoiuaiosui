// routes/regional-careers/entry-central: recruitment and entry events for Columbia, Kazimierz, Siracusa, and Siesta.
window.TERRA_DATA_BUILD.fragment(
  "routes/regional-careers",
  "routes/regional-careers/entry-central"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const E = [
    // -------------------------------------------------------------
    // クルビア: フロンティア開拓パイオニア
    // -------------------------------------------------------------
    {
      id: "car_col_pioneer_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "クルビア" && s.job === 0 && !s.fl?.retired,
      t: "移動都市の外、荒涼たる大地に広がる未開地。クルビア連邦政府の開拓局で、原野に自らの農場や工房を築く『パイオニア』の入植登記が行われていた。資本主義のフロンティア精神と、失敗すれば野垂れ死ぬだけの過酷な自己責任の世界である。",
      c: [
        $terraData.K("開拓地登記書に署名し、荒野の区画へ乗り込む", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.45,
          "手元資金でトラクターと掘削具を揃え、荒野の未開地に入植した。フロンティア開拓パイオニアとして、厳しい自然と戦いながら自前の農場を開墾する。",
          $terraData.regionalCareerStaff(
            "col_pioneer",
            "columbia-frontier-pioneer",
            "クルビア開拓連盟",
            "開拓農場主",
            "columbia-frontier-survival",
            "荒野で農場を開墾し、自らの手でアメリカン・ドリームを掴む",
            "frontier-survival",
            "荒野開墾・掘削重機運用",
            { h: 3, p: 2, cashDelta: -500000 }
          )
        ], [
          0.85,
          "手元資金が足りず、連邦銀行から『年利35%の開拓ローン』を組まされた。収穫が出せねば土地を奪われて債務奴隷に転落する、背水の陣での開拓が始まった。",
          $terraData.regionalCareerStaff(
            "col_pioneer",
            "columbia-frontier-pioneer",
            "クルビア開拓連盟",
            "借金入植者",
            "columbia-frontier-survival",
            "高利貸しの返済期日に追われながら、荒野にしがみつく",
            "frontier-survival",
            "荒野開墾・掘削重機運用",
            { h: 2, p: -2, debt: 1500000 }
          )
        ], [
          1,
          "体力も資金もまったく足りず、開拓局員から『荒野で死にたいなら止めんが、登記料の無駄だ』と突き放された。",
          { p: -3 }
        ]),
        $terraData.K("都市の雑踏に留まる", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "過酷な荒野を避け、移動都市内で日雇いの仕事を探すことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // カジミエーシュ: 商業連合会公認 企業騎士
    // -------------------------------------------------------------
    {
      id: "car_kaz_comp_knight_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "カジミエーシュ" && s.job === 0 && !s.fl?.retired,
      t: "ネオン輝く大都市カヴァレリエルキ。歓声と巨額の賭け金が飛び交う騎士競技のメジャー大会で、企業スポンサー付きの『競技騎士』になるための公開トライアウトが開かれていた。血と汗、そして商業的価値が全てを決めるエンターテインメントの戦場である。",
      c: [
        $terraData.K("アリーナで模擬戦に挑み、企業プロモーターにアピールする", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.4,
          "華麗な剣技と観客を沸かせるパフォーマンスを見せ、大手飲料メーカーの専属騎士契約を勝ち取った。企業ロゴの入った甲冑をまとい、メジャーの舞台に立つ。",
          $terraData.regionalCareerStaff(
            "kaz_comp_knight",
            "kazimierz-competition-knight",
            "商業連合会騎士競技",
            "公認・企業騎士",
            "kazimierz-arena-glory",
            "アリーナの歓声を浴び、スポンサーの契約金を稼ぎ出す",
            "arena-combat",
            "魅せる剣技・アリーナ格闘術",
            { h: 3, cr: 3, p: 2 }
          )
        ], [
          0.8,
          "実力は悪くないもののスポンサーがつかず、プロモーターから『八百長試合で派手に吹っ飛ぶ負け役（咬ませ犬）なら契約してやる』と屈辱的な条件を出された。受諾し、泥を塗る契約を結んだ。",
          $terraData.regionalCareerStaff(
            "kaz_comp_knight",
            "kazimierz-competition-knight",
            "商業連合会騎士競技",
            "アリーナ負け役騎士",
            "kazimierz-arena-glory",
            "八百長の殴られ役としてアリーナの砂を噛む",
            "arena-combat",
            "魅せる剣技・アリーナ格闘術",
            { h: 1, p: -3, debt: 800000 }
          )
        ], [
          1,
          "模擬戦で現役の騎士に一撃で叩きのめされ、アリーナの砂を舐めさせられた。観客のブーイングの中で退場した。",
          { p: -5, h: -3 }
        ]),
        $terraData.K("血生臭いショービジネスを避ける", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "虚飾にまみれた競技アリーナに背を向け、静かに去った。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // カジミエーシュ: 無冑盟（暗殺部隊）
    // -------------------------------------------------------------
    {
      id: "car_kaz_armorless_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.45,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "カジミエーシュ" && s.job === 0 && !s.fl?.retired,
      t: "商業連合会の暗部――金で動く騎士たちの背後で、邪魔な感染者騎士や監査会の役人を密かに始末する影の暗殺組織『無冑盟』。一度足を踏み入れれば抜け出すことは許されず、逃亡者には同僚の玄鉄から矢が放たれる。",
      c: [
        $terraData.K("無冑盟の暗殺弓を受け取り、組織の鎖に繋がれる", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          0.5,
          "黒い弓と暗殺毒矢を渡され、商業連合会の裏の掃除人として登録された。夜の路地で、標的を無音で消し去る過酷な任務が始まる。",
          $terraData.regionalCareerStaff(
            "kaz_armorless",
            "kazimierz-armorless-union",
            "カジミエーシュ無冑盟",
            "暗殺部隊員",
            "kazimierz-armorless-elimination",
            "商業連合会の影で標的を暗殺し、組織の掟に縛られる",
            "armorless-assassination",
            "無音狙撃・追跡暗殺術",
            { h: 3, p: 3, cr: -3 }
          )
        ], [
          1,
          "試練の的撃ちで手が震え、無冑盟の指揮官から『秘密を知った以上、生かして帰すわけにはいかんな』と矢を向けられた。命からがら逃げ延びたものの、重傷を負った。",
          { p: -8, h: -10, cash: -100000 }
        ]),
        $terraData.K("恐怖で身を翻し、暗がりから逃げ出す", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "闇の誘いを振り切り、人通りの多い大通りへと必死で走った。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // シラクーザ: 12ファミリー構成員（マフィア）
    // -------------------------------------------------------------
    {
      id: "car_sir_soldier_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "シラクーザ" && s.job === 0 && !s.fl?.retired,
      t: "シラクーザを支配する12の巨大マフィア・ファミリー。煙草の煙が立ち込める屋敷の奥で、新たなソルジャーを迎える儀礼が開かれていた。『沈黙の掟（オメルタ）』に血で署名し、ファミリーに命を捧げるかどうかが問われる。",
      c: [
        $terraData.K("聖人のカードに血を垂らし、オメルタを誓う", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "炎でカードを焼き、幹部と抱擁を交わした。ファミリーの正規構成員としてピストルを渡され、縄張りのみかじめ料徴収と抗争の最前線に立つ。",
          $terraData.regionalCareerStaff(
            "sir_soldier",
            "siracusa-mafia-soldier",
            "シラクーザ・ファミリー",
            "構成員（ソルジャー）",
            "siracusa-mafia-loyalty",
            "ファミリーの掟に従い、縄張りを守り血の抗争を生き延びる",
            "mafia-omerta",
            "裏街銃撃戦・みかじめ徴収術",
            { h: 2, p: 2, cr: -2 }
          )
        ], [
          1,
          "覚悟を疑われ、忠誠の証として『対立ファミリーの幹部を今すぐ撃ってこい』と無謀な鉄砲玉役を命じられた。受諾できず、屋敷から殴り飛ばされた。",
          { p: -5, h: -3 }
        ]),
        $terraData.K("マフィアの血の掟を恐れ、辞退する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "裏社会に足を踏み入れるのを思いとどまり、屋敷を去った。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // シラクーザ: ヌオバ・ウォルシーニ裁判所警察官
    // -------------------------------------------------------------
    {
      id: "car_sir_police_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1092 },
      show: s => s.res?.n === "シラクーザ" && s.job === 0 && !s.fl?.retired,
      t: "マフィアの支配から脱却し、法と秩序による統治を目指す新移動都市ヌオバ・ウォルシーニ。裁判所直属の都市警察官として、ファミリーからの脅迫や買収に屈せず、市民の日常を守る意志を持つ者が求められていた。",
      c: [
        $terraData.K("法典の試験と身辺調査を受け、宣誓する", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "裁判所長官の前で法規を宣誓し、バッジを胸につけた。ファミリーの暗殺の影に怯えぬ気丈な警察官として、新都市の街頭に立つ。",
          $terraData.regionalCareerStaff(
            "sir_police",
            "siracusa-court-police",
            "ウォルシーニ都市裁判所",
            "都市警察巡官",
            "siracusa-court-justice",
            "マフィアの暴力に屈せず、法と市民の正義を守る",
            "court-enforcement",
            "都市法規執行・対マフィア捜査",
            { k: 2, cr: 3, p: 2 }
          )
        ], [
          1,
          "面接でマフィアへの恐怖を隠しきれず、不合格となった。『その気弱さでは初日に撃たれて終わりだ』と諭された。",
          { p: -3, k: 1 }
        ]),
        $terraData.K("危険な警察官を辞退する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "ファミリーに狙われる職を避け、伝統料理店の厨房などで働くことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // シエスタ: 火山観測所研究員
    // -------------------------------------------------------------
    {
      id: "car_sie_obs_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "シエスタ" && s.job === 0 && !s.fl?.retired,
      t: "リゾート都市シエスタの象徴である巨大な黒曜石火山。いつ大規模な噴火を起こすか知れぬこの休火山を昼夜問わず監視する観測所で、熱量分析と地殻振動を解析する技師が募集されていた。",
      c: [
        $terraData.K("地質熱学と振動波形の解析試験を受ける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "地下マグマの圧力変化を的確に予測し、観測所の正規研究員として採用された。観光都市の安全を裏から支える観測業務に就く。",
          $terraData.regionalCareerStaff(
            "sie_obs",
            "siesta-observatory-research",
            "シエスタ火山観測所",
            "火山観測研究員",
            "siesta-volcano-monitoring",
            "黒曜石火山の地殻変動を観測し、都市の命綱を守る",
            "volcanology",
            "地熱解析・火山性微動観測",
            { k: 3, p: 2 }
          )
        ], [
          1,
          "観測データの誤差を見逃し、試験不合格となった。",
          { p: -2, k: 1 }
        ]),
        $terraData.K("ビーチのリゾート業を目指す", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "観測所を離れ、ホテルの接客やビーチの仕事を探すことにした。",
          { p: 1 }
        ])
      ]
    }
  ];

  for (const event of E) {
    event.references = [...new Set([...(event.references || []), "SRC_REGIONAL_CAREERS"])];
    $terraData.EV.push(event);
  }
});
