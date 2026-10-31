// routes/rhodes-and-factions/rhodes-landship-daily: distinct daily routine events for Rhodes Island landship residents.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/rhodes-landship-daily"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const rhodesDaily = [];
  const SR_SRC = $terraData.SR_SRC || ["SRC_RHODES_LANDSHIP", "SRC_SR_RHODES_WORK", "SRC_RHODES_FOUNDATION"];

  // =========================================================================
  // 1. 普遍日常（本艦施設・生活・同僚交流 36件: 良12, 並16, 悪8）
  // =========================================================================
  const universalRoutines = [
    // --- 良 (Good 1-12) ---
    {
      id: "daily_rhodes_01",
      t: "本艦の食堂で、他国のオペレーターが持ち寄った故郷のスパイス料理を囲んだ。辛さに咽せながらも笑い声が響き、旅路の疲れがほどけていった。",
      fx: { p: 2 }
    },
    {
      id: "daily_rhodes_02",
      t: "パフューマーの管理する温室の一角で、土の匂いとハーブの香りに包まれて深呼吸した。鉄の艦内であることを忘れさせる穏やかな時間が流れた。",
      fx: { p: 2, h: 1 }
    },
    {
      id: "daily_rhodes_03",
      t: s => (s && s.year >= 1097)
        ? "艦橋へ向かう通路でドクターとアーミヤにすれ違い、「今日も無理をせず、自分のペースで」と温かい労いの言葉をかけられた。"
        : "艦橋へ向かう通路でアーミヤとすれ違い、「今日も無理をせず、自分のペースでいきましょう」と温かい労いの言葉をかけられた。",
      fx: { p: 2, cr: 1 }
    },
    {
      id: "daily_rhodes_04",
      t: "集中ランドリーで洗い立ての制服を受け取った。清潔な洗剤の香りとパリッと張った布地に袖を通し、背筋がすっと伸びた。",
      fx: { p: 2 }
    },
    {
      id: "daily_rhodes_05",
      t: "図書室でテラ各地の風土や移動都市の構造に関する古い記録を読んだ。静まり返った書架の間で知的好奇心が満たされた。",
      fx: { k: 2, p: 1 }
    },
    {
      id: "daily_rhodes_06",
      t: "作業の合間に甲板へ出て、どこまでも広がる荒野の夜空を見上げた。大気汚染のない大地を渡る満天の星々に息を呑んだ。",
      fx: { p: 3 }
    },
    {
      id: "daily_rhodes_07",
      t: s => (s && (s.infected || (s.tags && s.tags.includes("感染者"))))
        ? "医務室で受診した定期バイタル検査の結果が安定していた。処方された抑制剤を受け取り、医療班の手厚い管理に感謝した。"
        : "医務室で受診した定期バイタル検査の結果は良好だった。医療班から日頃の健康維持を褒められ、手厚いサポートに感謝した。",
      fx: { h: 2, p: 1 }
    },
    {
      id: "daily_rhodes_08",
      t: "休憩室のソファで、ループスやフェリーンの居住者たちと他愛ないカードゲームに興じた。出身国の違いを越えて打ち解け合った。",
      fx: { p: 2, rl: 2 }
    },
    {
      id: "daily_rhodes_09",
      t: "エンジニア部に修理を出していた小型端末が、クロージャの手で新品同様に整備されて戻ってきた。使い勝手が格段に良くなった。",
      fx: { k: 1, p: 1 }
    },
    {
      id: "daily_rhodes_10",
      t: "第1訓練場の見学席から、行動予備隊の熱気あふれる模擬戦を眺めた。仲間を守るために必死に盾を構える姿に胸を打たれた。",
      fx: { h: 1, p: 2 }
    },
    {
      id: "daily_rhodes_11",
      t: "今日の食堂はマッターホルンが腕を振るった山岳地方の温かいシチューだった。濃厚なミルクと肉の旨味に胃袋が満たされた。",
      fx: { h: 2, p: 2 }
    },
    {
      id: "daily_rhodes_12",
      t: "地上を走る連絡便のトランスポーターから、故郷の近況を伝える手紙が届いた。懐かしい筆跡を何度も撫でて安堵した。",
      fx: { p: 3 }
    },

    // --- 並 (Neutral 13-28) ---
    {
      id: "daily_rhodes_13",
      t: "朝一番、艦内放送からPRTSの落ち着いた定時アナウンスが流れ、本日の航路状況と各セクターの点検予定が共有された。",
      fx: {}
    },
    {
      id: "daily_rhodes_14",
      t: "通路の点検ハッチをくぐると、大型循環ダクトから規則正しい送風の音が響いていた。空調の微かな風を感じながら持ち場へ向かった。",
      fx: {}
    },
    {
      id: "daily_rhodes_15",
      t: "宿舎の自室の机で、作業着の袖口のほつれを針と糸で繕った。自分の部屋がある落ち着きを静かに味わった。",
      fx: {}
    },
    {
      id: "daily_rhodes_16",
      t: "共同給湯室で熱い湯を沸かし、マグカップに茶を淹れた。居合わせた人と言葉少なに挨拶を交わし、温かい湯気にひと息ついた。",
      fx: {}
    },
    {
      id: "daily_rhodes_17",
      t: "艦内掲示板に掲示された各国の天災予測マップを眺めた。航行ルート上に大きな障害はなく、本艦は順調に進んでいる。",
      fx: {}
    },
    {
      id: "daily_rhodes_18",
      t: "物資搬入口から、地上拠点で調達された食料や資材のパレットがフォークリフトで整然と運び込まれるのを見守った。",
      fx: {}
    },
    {
      id: "daily_rhodes_19",
      t: "医務区画の廊下を通りかかると、特有の清潔な消毒液とハーブの香りが漂っていた。白衣の医師たちが足早に行き交っていた。",
      fx: {}
    },
    {
      id: "daily_rhodes_20",
      t: "通路で、任務を終えて戻ってきた防護服姿のオペレーターとすれ違い、静かに会釈を交わした。日夜を問わず艦は動いている。",
      fx: {}
    },
    {
      id: "daily_rhodes_21",
      t: "食堂の注文口に「辛味抜き希望」「ヴィクトリア風ロースト希望」といった各国のリクエスト札が並んでいるのを眺めた。",
      fx: {}
    },
    {
      id: "daily_rhodes_22",
      t: "深部区画の床下から、巨大な本艦の推進機関が発する重く低いハミング音が伝わってきた。大地を踏みしめる頼もしさを感じた。",
      fx: {}
    },
    {
      id: "daily_rhodes_23",
      t: "艦内購買部で日用の石鹸と替えの替え芯を買い足した。必要な生活物資が艦内で揃う便利さを実感した。",
      fx: {}
    },
    {
      id: "daily_rhodes_24",
      t: "業務用エレベーターで、巨大な合金製シールドを担いだ重装オペレーターと同乗した。武具のずっしりとした重みが伝わってきた。",
      fx: {}
    },
    {
      id: "daily_rhodes_25",
      t: "通信室の前を通り過ぎると、各国の周波数に合わせた無線のビープ音とモールス信号が途切れ途切れに漏れ聞こえていた。",
      fx: {}
    },
    {
      id: "daily_rhodes_26",
      t: "夜間の消灯時間を迎え、通路の照明が柔らかいブルーの保安灯に切り替わった。静けさに包まれた宿舎へ足を運んだ。",
      fx: {}
    },
    {
      id: "daily_rhodes_27",
      t: "展望区画の分厚い耐圧ガラス越しに、本艦の巨大な履帯が荒野の土煙を巻き上げながら進む勇姿を見下ろした。",
      fx: {}
    },
    {
      id: "daily_rhodes_28",
      t: "共用シャワー室で一日の作業の汗を洗い流した。熱い湯をたっぷり浴びて身体を温め、すっきりとした心地で寝台に入った。",
      fx: {}
    },

    // --- 悪 (Bad 29-36) ---
    {
      id: "daily_rhodes_29",
      t: "医務室の待合室の片隅で、連直の合間に仮眠を取る医療スタッフの疲れた横顔を見かけた。誰かが静かに肩へ毛布を掛けていった。",
      fx: { p: -2 }
    },
    {
      id: "daily_rhodes_30",
      t: "艦内掲示板に、遠方で活動中だった外勤チームの救難報告と負傷者一覧が張り出された。重苦しい沈黙が居住区に広がった。",
      fx: { p: -2 }
    },
    {
      id: "daily_rhodes_31",
      t: "医務室の前を通りかかると、緊急搬送された重症患者のストレッチャーが駆け抜けた。緊迫した怒号に胸が締め付けられた。",
      fx: { p: -2 }
    },
    {
      id: "daily_rhodes_32",
      t: "空調循環器のフィルター清掃作業で、細かい粉塵を吸い込んでしまい激しく咳き込んだ。うがいを繰り返して喉を潤した。",
      fx: { h: -1, p: -1 }
    },
    {
      id: "daily_rhodes_33",
      t: "通路の隅で、新参の非感染者スタッフと感染者オペレーターの間で配慮を欠いた言葉の衝突があり、後味の悪さが残った。",
      fx: { p: -2 }
    },
    {
      id: "daily_rhodes_34",
      t: "荒野の悪天候により地上の補給便が遅れ、食堂の生鮮野菜が一時的に不足した。乾パンと保存食ばかりの食事にため息が出た。",
      fx: { p: -1 }
    },
    {
      id: "daily_rhodes_35",
      t: "本艦が岩場を踏み越えた際、激しい揺れに見舞われて机の上の書類とコップが床に散らばった。ため息をついて片付けた。",
      fx: { p: -1 }
    },
    {
      id: "daily_rhodes_36",
      t: "通信端末に他国の都市で感染者排斥の暴動が起きたニュースが流れた。自分たちの手が届かない遠くの現実に無力感を覚えた。",
      fx: { p: -2 }
    }
  ];

  for (const item of universalRoutines) {
    rhodesDaily.push({
      id: item.id,
      conf: "S",
      references: SR_SRC,
      st: ["児童", "少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      t: item.t,
      fx: item.fx
    });
  }

  // =========================================================================
  // 2. 職種別日常イベント（全6部門 各4件 ＝ 24件: 37〜60）
  // =========================================================================

  // --- A. 物資・生活支援職員 (37-40) ---
  rhodesDaily.push(
    {
      id: "daily_rhodes_37",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.service,
      t: "物資保管庫で医療用手袋、ガーゼ、滅菌シリンジの棚卸しを行った。出撃を控えた医療班のために箱数を正確に揃え、帳簿を更新した。",
      fx: { k: 1, cr: 1 }
    },
    {
      id: "daily_rhodes_38",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.service,
      t: "宿舎区画のシーツと毛布を一括回収し、大型洗濯機と乾燥機をフル稼働させた。清潔なリネンを各部屋の棚へ整然と届け終えた。",
      fx: { h: 1, p: 1 }
    },
    {
      id: "daily_rhodes_39",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.service,
      t: "早朝の食材荷降ろし場で、近隣都市から運ばれた小麦粉と乾燥肉の品質を検品した。傷んだ袋を丁寧に取り除き、食堂へ引き渡した。",
      fx: { cr: 1, p: 1 }
    },
    {
      id: "daily_rhodes_40",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.service,
      t: "災害被災地への緊急支援コンテナに、毛布と携帯保存食をぎっしり詰め込んだ。少しでも多くの人を温められるよう、隙間なく梱包した。",
      fx: { h: -1, cr: 2, rl: 1 }
    }
  );

  // --- B. 設備整備職員 (41-44) ---
  rhodesDaily.push(
    {
      id: "daily_rhodes_41",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.maintenance,
      t: "居住セクターの給気ダクトの点検口を開け、高圧エアーでフィルターの目詰まりを吹き飛ばした。清浄な風が勢いよく吹き出し、達成感を得た。",
      fx: { k: 1, h: 1 }
    },
    {
      id: "daily_rhodes_42",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.maintenance,
      t: "ボイラー室の計器盤で蒸気圧の数値をチェックした。わずかに振れていた安全弁のバネを調整し、機関への負荷を正常域に戻した。",
      fx: { k: 1, cr: 1 }
    },
    {
      id: "daily_rhodes_43",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.maintenance,
      t: "居住室から通報があった照明の接触不良を調査した。配線テスターで断線箇所を素早く特定し、絶縁テープとコネクタで綺麗に補修した。",
      fx: { k: 1, p: 1 }
    },
    {
      id: "daily_rhodes_44",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.maintenance,
      t: "推進区画の巨大な冷却水ポンプのシールリングを交換した。熱気と機械油の匂いの中、重いスパナを握り締めて規定トルクでボルトを締めた。",
      fx: { h: -1, k: 2 }
    }
  );

  // --- C. 医療・研究補助職員 (45-48) ---
  rhodesDaily.push(
    {
      id: "daily_rhodes_45",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.research,
      t: "臨床試験データのカルテを整理し、血中源石密度の推移グラフを作成した。投薬による抑制効果の傾向が明確になり、医師から感謝された。",
      fx: { k: 1, cr: 1 }
    },
    {
      id: "daily_rhodes_46",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.research,
      t: "診察室の高圧滅菌器を回し、メスやピンセットの滅菌パックを日付順に整理した。感染を防ぐための基本手順を怠りなくこなした。",
      fx: { cr: 1, p: 1 }
    },
    {
      id: "daily_rhodes_47",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.research,
      t: "調剤室で処方箋に従い、源石病抑制シロップを正確にシリンジで量り取った。患者の手元に渡る薬の品質を守る責任を噛み締めた。",
      fx: { k: 1, cr: 1 }
    },
    {
      id: "daily_rhodes_48",
      conf: "S",
      references: SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.research,
      t: "血液バンクの冷凍保存キャビネットの温度記録を確認した。バックアップ電源のテスト運転も正常で、貴重な検体の安全を確保した。",
      fx: { cr: 1, k: 1 }
    }
  );

  // --- D. トランスポーター (49-52) ---
  rhodesDaily.push(
    {
      id: "daily_rhodes_49",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.transporter,
      t: "耐塵バギーの足回りにこびりついた荒野の赤土を高圧水で洗い流し、各部にグリスを充填した。次の出動に向けて車両の整備を完璧に仕上げた。",
      fx: { k: 1, p: 1 }
    },
    {
      id: "daily_rhodes_50",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.transporter,
      t: "長距離無線アンテナの周波数を合わせ、各国の天災トランスポーター網が発信する最新の気象警報を受信した。荒野の動向を航路図に反映させた。",
      fx: { k: 1, cr: 1 }
    },
    {
      id: "daily_rhodes_51",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.transporter,
      t: "近隣都市の連絡所へ運ぶ機密封筒と医薬品コンテナの封印シールを照合した。送り先と受取人の署名欄を確認し、出発準備を整えた。",
      fx: { cr: 1, p: 1 }
    },
    {
      id: "daily_rhodes_52",
      conf: "S",
      references: SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.transporter,
      t: "荒野の迂回路マップに、最近目撃された源石獣の群れの移動痕跡を書き加えた。同僚のトランスポーターと危険個所の情報を共有した。",
      fx: { k: 1, rl: 1 }
    }
  );

  // --- E. 行動予備隊員 (53-56) ---
  rhodesDaily.push(
    {
      id: "daily_rhodes_53",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.reserve,
      t: "第2訓練場で重装用の大型シールドを構え、ドーベルマン教官の鋭い号令に従って姿勢を保ち続けた。腕が痺れながらも仲間の盾となる覚悟を固めた。",
      fx: { h: 2, k: 1 }
    },
    {
      id: "daily_rhodes_54",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.reserve,
      t: "射撃シミュレータ室で、動く仮想標的に対する射撃・アーツ発射訓練を繰り返した。着弾精度のデータを分析し、フォームを修正した。",
      fx: { k: 1, p: 1 }
    },
    {
      id: "daily_rhodes_55",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.reserve,
      t: "予備隊のミーティングルームで、前回の演習映像を見直しながら反省会を開いた。お互いの死角をどうカバーし合うか真剣に意見を交わした。",
      fx: { rl: 2, cr: 1 }
    },
    {
      id: "daily_rhodes_56",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.reserve,
      t: "訓練で泥だらけになった防護アーマーを分解し、油布で丁寧に磨き上げた。小さな傷を点検し、いつでも実戦に出られるよう手入れを終えた。",
      fx: { h: 1, p: 1 }
    }
  );

  // --- F. 外勤オペレーター (57-60) ---
  rhodesDaily.push(
    {
      id: "daily_rhodes_57",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.field,
      t: "本艦の前進索敵哨戒に出動し、周囲十キロメートルの荒野を偵察した。略奪者や異常な源石反応がないことを確認し、艦橋へクリア報告を送った。",
      fx: { h: 1, cr: 1 }
    },
    {
      id: "daily_rhodes_58",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.field,
      t: "荒野で立ち往生していた感染者避難民の幌馬車を発見し、本艦の安全区画まで護衛した。怯えていた子どもたちから小さな木彫りの花をもらった。",
      fx: { cr: 2, rl: 1, p: 1 }
    },
    {
      id: "daily_rhodes_59",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.field,
      t: "接近してきた武装暴徒集団に対し、威嚇射撃と迅速な牽制行動で戦闘を未然に回避させた。防護ベストの擦り傷を拭い、無傷で帰還した。",
      fx: { h: -1, cr: 2, k: 1 }
    },
    {
      id: "daily_rhodes_60",
      conf: "S",
      references: SR_SRC,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 1,
      need: ["ロドス本艦居住"],
      show: s => s.job === $terraData.SR_JOBS.field,
      t: s => (s && s.year >= 1097)
        ? "作戦報告書を提出した際、ドクターから「迅速かつ的確な状況判断だった」と短く肩を叩かれた。自分の務めを果たした充実感が胸を満たした。"
        : "作戦報告書を提出した際、作戦司令室の指揮官から「迅速かつ的確な状況判断だった」と労いの言葉をかけられた。自分の務めを果たした充実感が胸を満たした。",
      fx: { p: 3, cr: 1 }
    }
  );

  // Register all events into game EV
  for (const ev of rhodesDaily) {
    $terraData.EV.push(ev);
  }
});
