// routes/regional-careers/entry-west: recruitment and entry events for Ursus, Victoria, Leithania, and Laterano.
window.TERRA_DATA_BUILD.fragment(
  "routes/regional-careers",
  "routes/regional-careers/entry-west"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const E = [
    // -------------------------------------------------------------
    // ウルサス: 帝国軍・近衛将校
    // -------------------------------------------------------------
    {
      id: "car_urs_officer_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "ウルサス" && s.job === 0 && !s.fl?.retired,
      t: "要塞司令部の豪奢な執務室で、貴族将校たちが書類に目を落としていた。ウルサス帝国軍の指揮官枠――それは貴族の血筋と巨額の軍資金を握る選民だけの特権である。平民や感染者を徹底して見下す軍国主義の牙城に、士官候補生としての仕官を願う。",
      c: [
        $terraData.K("家格の推薦状と武芸の証を差し出す", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.35,
          "軍団長は傲慢に頷き、黄金の肩章を手渡した。帝国軍の近衛将校として部隊の指揮権を与えられ、厳格な階級社会の階段を登り始める。",
          $terraData.regionalCareerStaff(
            "urs_officer",
            "ursus-imperial-officer",
            "ウルサス帝国軍",
            "近衛少尉・小隊長",
            "ursus-imperial-command",
            "ウルサス軍の威信を背負い、部隊を指揮する",
            "ursus-tactics",
            "軍団陣形統率・銃剣格闘術",
            { h: 3, p: 2, cr: 3 }
          )
        ], [
          0.75,
          "軍団長は書類を机に投げ捨てた。『家柄が一段劣るな。少尉になりたくば、部隊整備費として三百万龍門幣相当を寄付金として納めろ』。裏金を払うため、高利貸しから莫大な借金を背負う羽目になった。",
          $terraData.regionalCareerStaff(
            "urs_officer",
            "ursus-imperial-officer",
            "ウルサス帝国軍",
            "見習い士官（借金採用）",
            "ursus-imperial-command",
            "莫大な軍資金の借金を背負い、士官席にしがみつく",
            "ursus-tactics",
            "軍団陣形統率・銃剣格闘術",
            { h: 2, p: -2, debt: 3000000 }
          )
        ], [
          1,
          "『平民風情が生意気な面を出すな！』と怒号を浴びせられ、衛兵に棍棒で殴打されて司令部から叩き出された。身の程知らずの代償は重かった。",
          { p: -6, h: -4 }
        ]),
        $terraData.K("傲慢な軍門を避け、民間の暮らしを選ぶ", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "軍閥の冷酷さに背を向け、静かに司令部を去った。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ウルサス: 国境警備兵・炭鉱監視憲兵
    // -------------------------------------------------------------
    {
      id: "car_urs_guard_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "ウルサス" && s.job === 0 && !s.fl?.retired,
      t: "ツンドラの冷風が吹きすさぶ兵舎で、国境警備部隊と感染者鉱山を監視する憲兵の徴募が行われていた。厳しい学歴は問われず、頑丈な体さえあれば誰でも雇われる。だがそれは、極寒と感染者の暴動が渦巻く使い捨ての最前線である。",
      c: [
        $terraData.K("過酷な任務を覚悟し、徴募書に署名する", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.6,
          "粗末な外套と連発銃を支給され、国境哨戒班に配属された。吹雪の中で銃口を構える過酷な兵役が始まった。",
          $terraData.regionalCareerStaff(
            "urs_guard",
            "ursus-border-mine-guard",
            "ウルサス国境警備隊",
            "国境哨戒兵",
            "ursus-border-mine-patrol",
            "極寒の国境線と鉱山監視で生き延びる",
            "ursus-survival",
            "極地露営・暴動鎮圧術",
            { h: 2, p: 1 }
          )
        ], [
          1,
          "体力不足と見做され、最も過酷な『感染者炭鉱の地下最深部・監視兵』へ回された。充満する源石粉塵と脱走者の殺気に晒される死線勤務である。",
          $terraData.regionalCareerStaff(
            "urs_guard",
            "ursus-border-mine-guard",
            "ウルサス炭鉱警備隊",
            "地下坑道・最前線監視兵",
            "ursus-border-mine-patrol",
            "粉塵舞う地下坑道で、暴動と急性感染に怯えながら見張る",
            "ursus-survival",
            "極地露営・暴動鎮圧術",
            { h: 1, p: -3 }
          )
        ]),
        $terraData.K("命を安売りせず、兵舎を離れる", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "肉壁にされる未来を拒み、兵舎の門を出て町へ戻った。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ウルサス: 帝国科学院 重工業技師
    // -------------------------------------------------------------
    {
      id: "car_urs_academy_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "ウルサス" && s.job === 0 && !s.fl?.retired && (s.k || 0) >= 25,
      t: "巨大な軍用装甲列車や重工業都市の設計を手掛けるウルサス帝国科学院。硬質な鉄と源石動力の極致を追求するこの研究機関で、構造工学と動力回路の専門技師が募集されていた。",
      c: [
        $terraData.K("構造力学と蒸気源石機構の試験を受ける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "装甲列車の耐熱限界計算を正確に解き明かし、帝国科学院の正規技師として採用された。重工業の巨艦を動かす設計現場に就く。",
          $terraData.regionalCareerStaff(
            "urs_academy",
            "ursus-imperial-academy-science",
            "ウルサス帝国科学院",
            "重工業設計技師",
            "ursus-science-engineering",
            "装甲列車と軍用移動都市の堅牢な機構を設計する",
            "ursus-engineering",
            "装甲力学・源石機関整備",
            { k: 3, p: 1 }
          )
        ], [
          1,
          "力学計算の狂いを厳しく指摘され、不合格となった。科学院の敷居の高さに肩を落とした。",
          { p: -3, k: 1 }
        ]),
        $terraData.K("学術の門を見送る", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "研究職を諦め、民間の工場や工房を目指すことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ヴィクトリア: 正規軍・平民歩兵
    // -------------------------------------------------------------
    {
      id: "car_vic_infantry_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "ヴィクトリア" && s.job === 0 && !s.fl?.retired,
      t: "ヴィクトリアの各都市で、正規陸軍の平民歩兵の募集が行われていた。伝統と栄光を謳う帝国だが、平民出身の兵士はどれほど戦功を立てても下士官止まりであり、貴族将校の号令一つで砲火の泥沼へ突撃させられるのが現実である。",
      c: [
        $terraData.K("入隊誓詞に署名し、連隊の銃を受け取る", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.6,
          "小銃と背嚢を渡され、前哨歩兵連隊に配属された。泥と雨に濡れながら、行軍と射撃訓練の日々が始まった。",
          $terraData.regionalCareerStaff(
            "vic_infantry",
            "victoria-regular-infantry",
            "ヴィクトリア正規軍",
            "歩兵二等兵",
            "victoria-infantry-service",
            "泥まみれの塹壕で命令に従い生き残る",
            "victoria-musketry",
            "連隊射撃・銃剣格闘",
            { h: 2, p: 1 }
          )
        ], [
          1,
          "体力不足を理由に、最も過酷な弾薬運搬歩兵（砲弾担ぎ）へ回された。重い砲弾箱に腰を痛める過酷な日々が待っていた。",
          $terraData.regionalCareerStaff(
            "vic_infantry",
            "victoria-regular-infantry",
            "ヴィクトリア正規軍",
            "弾薬運搬兵",
            "victoria-infantry-service",
            "砲弾を担ぎ、泥濘の補給路を這いずり回る",
            "victoria-musketry",
            "連隊射撃・銃剣格闘",
            { h: 1, p: -2 }
          )
        ]),
        $terraData.K("徴募を断り、軍隊を避ける", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "貴族の使い捨てにされる道を避け、街へ戻った。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ヴィクトリア: 王立前衛学校卒 エリート将校
    // -------------------------------------------------------------
    {
      id: "car_vic_royal_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20, year: 1092 },
      show: s => s.res?.n === "ヴィクトリア" && s.job === 0 && !s.fl?.retired && (s.cr || 0) >= 25,
      t: "ロンディニウムの王立前衛学校――各大公爵（ウェリントン、カスター、ウィンダミア等）に連なる名門貴族の令息令嬢が集う最高峰の士官養成校。巨額の学資と推薦状を揃えた者だけが、金糸の軍服をまとい将校として軍の頂点へ迎えられる。",
      c: [
        $terraData.K("推薦状と巨額の軍官買い取り金を差し出す", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.35,
          "推薦状の家格と教養を認められ、公爵軍の少尉任官が確定した。サーベルと白手袋を支給され、華麗だが謀略渦巻くエリート将校の世界へ踏み出す。",
          $terraData.regionalCareerStaff(
            "vic_royal",
            "victoria-royal-officer",
            "ヴィクトリア公爵軍",
            "公爵軍近衛少尉",
            "victoria-officer-career",
            "大公爵の派閥抗争の中で軍歴を重ね、権力を掴む",
            "royal-command",
            "貴族戦術学・軍団運用論",
            { cr: 4, k: 3, p: 2 }
          )
        ], [
          0.75,
          "家柄の格がわずかに足りず、公爵家令から『二百五十万龍門幣相当の裏金を用意せねば枠はない』と告げられた。借金を背負い、辛うじて少尉の座を買い取った。",
          $terraData.regionalCareerStaff(
            "vic_royal",
            "victoria-royal-officer",
            "ヴィクトリア公爵軍",
            "下級任官少尉（借金仕官）",
            "victoria-officer-career",
            "莫大な任官借金を抱えながら、公爵の顔色を窺う",
            "royal-command",
            "貴族戦術学・軍団運用論",
            { cr: 2, p: -2, debt: 2500000 }
          )
        ], [
          1,
          "『何処の馬の骨か知れぬ者が士官を望むなど片腹痛い』と公爵家令に冷笑され、追い出された。",
          { p: -5 }
        ]),
        $terraData.K("貴族社会の虚飾を嫌い、身を引く", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "足の引っ張り合いが日常の貴族軍閥を敬遠し、別の道を歩むことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ヴィクトリア: 帝国議会・貴族院書記官
    // -------------------------------------------------------------
    {
      id: "car_vic_scribe_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "ヴィクトリア" && s.job === 0 && !s.fl?.retired && (s.k || 0) >= 25,
      t: "ロンディニウム中央議会や地方市議会の議事堂で、公爵や伯爵たちの議案や法律文書を記録・整理する書記官が募集されていた。貴族の利権調整と汚職の嵐に巻き込まれながらも、帝国の政策を文面から動かす行政エリートの席である。",
      c: [
        $terraData.K("帝国法規と議事速記の試験を受ける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "難解な議会法規の解釈を完璧に論じ、帝国議会の上級書記官補として採用された。重厚な議事堂のデスクで、公爵たちの利権文書を扱う日々が始まる。",
          $terraData.regionalCareerStaff(
            "vic_scribe",
            "victoria-parliament-scribe",
            "ヴィクトリア帝国議会",
            "議会書記官補",
            "victoria-parliament-governance",
            "議会の法律案と利権文書を起草し、行政を補佐する",
            "parliamentary-law",
            "議会法典解釈・議事録速記",
            { k: 3, cr: 3, p: 1 }
          )
        ], [
          1,
          "筆記試験の点数が足りず、不合格となった。貴族の派閥にコネがなければ受からぬ現実を痛感した。",
          { p: -3, k: 1 }
        ]),
        $terraData.K("政治の泥沼を避ける", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "権力闘争に身を擦り減らす官僚の道を敬遠した。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ヴィクトリア: 重工業・鉄道工廠技師
    // -------------------------------------------------------------
    {
      id: "car_vic_works_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "ヴィクトリア" && s.job === 0 && !s.fl?.retired,
      t: "巨大な蒸気機関車と鉄鋼レールが並ぶヴィクトリアの鉄道工廠。産業革命の鼓動が響くこの巨大施設で、高圧蒸気パイプラインや機関車エンジンの整備を担う技術者が募集されていた。",
      c: [
        $terraData.K("蒸気圧制御と機械製図の実技試験を受ける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "弁の調整とパイプの気密テストを手際よく成功させ、工廠の正規技師として採用された。熱気と鉄の匂いの中で、機関車の整備に携わる。",
          $terraData.regionalCareerStaff(
            "vic_works",
            "victoria-locomotive-works",
            "ヴィクトリア鉄道工廠",
            "機関車整備技師",
            "victoria-locomotive-engineering",
            "高圧蒸気機関と鉄道網の安全運行を維持する",
            "steam-locomotion",
            "高圧ボイラー整備・機構製図",
            { k: 2, h: 2 }
          )
        ], [
          1,
          "蒸気圧の開放弁を見誤って火傷を負い、実技失格となった。治療代を払いながら町へ戻った。",
          { p: -3, h: -1, cash: -50000 }
        ]),
        $terraData.K("工廠の重労働を避ける", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "火傷の絶えぬ重工業現場を避け、別の仕事を探すことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // リターニア: 金律法衛
    // -------------------------------------------------------------
    {
      id: "car_lei_golden_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 19, year: 1092 },
      show: s => s.res?.n === "リターニア" && s.job === 0 && !s.fl?.retired && (s.k || 0) >= 30,
      t: "双子女帝の座すツヴィリングトゥルムの回廊で、金律法衛の選考審査が開かれていた。リターニアの調和とアーツ法典を執行する選ばれし魔道士たち。一音の狂いも許さぬ絶対の音律アーツ制御と、巫王の邪説を排する純粋な精神が試される。",
      c: [
        $terraData.K("法典の譜面を構え、厳格な音律アーツを奏でる", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.4,
          "黄金の光芒がアーツユニットから完璧な和音を伴って放たれ、審査官たちを平伏させた。女帝直属の金律法衛として、黄金の制服と法典杖を授与された。",
          $terraData.regionalCareerStaff(
            "lei_golden",
            "leithania-golden-law",
            "リターニア金律法衛",
            "金律法衛・執行官",
            "leithania-golden-law-enforce",
            "女帝の金律を護持し、不協和音を奏でる者を粛清する",
            "golden-arts",
            "金律音律魔道・法典粛清アーツ",
            { k: 4, p: 3, cr: 3 }
          )
        ], [
          0.8,
          "第三楽章の高音部でわずかに指が震え、アーツ波形に不協和音を生じさせてしまった。『耳が腐っている。法衛の品位を汚すな』と冷酷に罵倒され、追放された。",
          { p: -6, k: 1 }
        ], [
          1,
          "アーツの基礎すらなっておらず、審査官から嘲笑されて即座に退出を命じられた。",
          { p: -4 }
        ]),
        $terraData.K("あまりの重圧に辞退を申し出る", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "失敗が許されぬ神聖な審査を避け、静かに回廊を去った。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // リターニア: 宮廷音楽家
    // -------------------------------------------------------------
    {
      id: "car_lei_court_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "リターニア" && s.job === 0 && !s.fl?.retired,
      t: "リターニア各選帝侯の宮殿で、貴族専属の音楽家を募るサロンが開かれていた。チェロやピアノのアーツ演奏で主君を楽しませ、夜会を彩る名誉ある地位。だがそこには貴族への莫大な献金と、派閥の顔色を窺う世渡りが不可欠である。",
      c: [
        $terraData.K("サロンで貴族たちに新作ソナタを披露する", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "貴族たちの心を掴む華麗な旋律を響かせ、選帝侯直属の宮廷楽団員として召抱えられた。サロンで優雅に演奏する日々が始まる。",
          $terraData.regionalCareerStaff(
            "lei_court",
            "leithania-court-musician",
            "選帝侯領宮廷楽団",
            "宮廷演奏家",
            "leithania-court-music",
            "貴族のサロンでアーツ音楽を奏で、庇護を受ける",
            "classical-composition",
            "古典和声学・弦楽アーツ演奏",
            { k: 2, cr: 3, p: 2 }
          )
        ], [
          1,
          "『技術は悪くないが、パトロンへの忠誠心が足りぬ』と見做され、百五十万龍門幣相当の寄付金を要求された。金を出さねば宮廷の敷居は跨げないと突き放された。",
          { p: -3, debt: 1500000 }
        ]),
        $terraData.K("貴族のサロンを辞退する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "貴族の気まぐれに付き合う生活を避け、街角で演奏を続けることにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ラテラーノ: 公証人役場 執行人
    // -------------------------------------------------------------
    {
      id: "car_lat_executor_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 19, year: 1092 },
      show: s => s.res?.n === "ラテラーノ" && s.job === 0 && !s.fl?.retired && s.r?.n === "サンクタ",
      t: "鐘の音が鳴り響くラテラーノ公証人役場。教皇庁の法典を執行し、遺言・契約の履行と国内外の紛争調停を担う『執行人』の審査が行われていた。絶対の信仰と守護銃の扱い、そしてサンクタ族としての頭上の光輪が問われる神聖な試験である。",
      c: [
        $terraData.K("サンクタ法典の解釈と守護銃の射撃試問に挑む", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.4,
          "法典の条文を一言一句違わず諳んじ、守護銃の早撃ちで的の心臓を撃ち抜いた。公証人役場の正式な執行人として、黒衣と役場バッジを授与された。",
          $terraData.regionalCareerStaff(
            "lat_executor",
            "laterano-notarial-executor",
            "ラテラーノ公証人役場",
            "公証人執行人",
            "laterano-notarial-execution",
            "サンクタ法典を厳格に執行し、契約と遺言を守護する",
            "notarial-law",
            "法典解釈・守護銃早撃ち術",
            { k: 3, h: 2, p: 3, cr: 3 }
          )
        ], [
          0.7,
          "法典試問の解釈に迷いが生じて不合格となった。『民間人として平穏に暮らしなさい』と諭され、役場を去った。",
          { p: -3, k: 1 }
        ], [
          1,
          "法典試問の解釈に誤りがあり、射撃試問も基準点に届かず不合格となった。『次回の公証審査まで信仰の研鑽を積み直すように』と告げられ、役場を去った。",
          { p: -4, k: 1 }
        ]),
        $terraData.K("銃を取る役目を避け、菓子職人を目指す", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "厳格な法典の執行官ではなく、甘いスイーツを作る穏やかな暮らしを望んだ。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ラテラーノ: ランデン修道院 修道銃士
    // -------------------------------------------------------------
    {
      id: "car_lat_landen_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "ラテラーノ" && s.job === 0 && !s.fl?.retired,
      t: "ラテラーノの伝統を頑なに守るランデン修道院。祈りとパン作り、そして守護銃の整備に生涯を捧げる修道銃士たちが祈りを捧げていた。世俗の富を捨て、信仰と伝統の銃火器を守る覚悟が問われる。",
      c: [
        $terraData.K("修道院の祭壇で終生誓願を立てる", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.6,
          "静謐な礼拝堂で祈りを捧げ、修道銃士として迎えられた。質素な修道服をまとい、伝統の教理と銃の研鑽に生きる。",
          $terraData.regionalCareerStaff(
            "lat_landen",
            "laterano-landen-monastery",
            "ランデン修道院",
            "修道銃士",
            "laterano-landen-devotion",
            "祈りと守護銃の伝統を守り、修道院に奉仕する",
            "landen-devotion",
            "伝統銃器整備・聖歌祈祷",
            { p: 4, cr: 2 }
          )
        ], [
          1,
          "信仰心が足りぬとされ、門前で見送られた。",
          { p: -2 }
        ]),
        $terraData.K("修道院の門を後にする", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "世俗の自由を愛し、修道院の門を出た。",
          { p: 1 }
        ])
      ]
    }
  ];

  for (const event of E) {
    event.references = [...new Set([...(event.references || []), "SRC_REGIONAL_CAREERS", "SRC_VICTORIA_MILITARY"])];
    $terraData.EV.push(event);
  }
});
