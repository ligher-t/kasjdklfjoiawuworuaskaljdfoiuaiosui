// routes/regional-careers/events-east: distinct daily, choice, promotion, crisis, and mortality events for Yan, Lungmen, and Higashi careers.
window.TERRA_DATA_BUILD.fragment(
  "routes/regional-careers",
  "routes/regional-careers/events-east"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const E = [
    // =============================================================
    // 炎国: 朝廷文官（科挙登用）
    // =============================================================
    {
      id: "car_yan_court_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "炎国" && $terraData.regionalCareerOnDuty(s, "yan_court"),
      t: "州府の公堂で、山積みになった治水工事の進捗報告と戸籍の改定記録に朱筆を走らせた。数字のわずかな不整合を洗い出し、下級書吏に再調査を命じる。平穏な民の暮らしは、こうした地道な墨の跡によって保たれている。",
      c: [
        $terraData.K("淡々と公務をこなし、定刻に退庁する", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "公文書を整理し終え、官舎への帰路で夕涼みをした。",
          { k: 1, p: 1, cash: 150000 }
        ])
      ]
    },
    {
      id: "car_yan_court_choice_bribe",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 22 },
      show: s => s.res?.n === "炎国" && $terraData.regionalCareerOnDuty(s, "yan_court"),
      t: "管轄下の穀倉地帯を巡視中、地方の有力豪族から私邸に招かれた。豪奢な酒宴の席で、豪族は帳簿の免税措置を願い出て、袖の下から眩い金の延べ棒を差し出してきた。三省の監査が入れば一族巻き添えの重罪になりかねないが、目の前の富はあまりに甘い。",
      c: [
        $terraData.K("賄賂を突き返し、即座に大理寺へ告発状を送る", { ethics: { reviewed: true, policyVersion: 87, intent: "whistleblowing" } }, [
          0.6,
          "豪族の脱税証拠を完璧に保全し、中央へ急使を飛ばした。豪族は失脚し、剛直な官吏として朝廷内での名声が高まった。",
          { cr: 5, p: 3, groupStanding: { id: "yan-officials", title: "朝廷の官吏仲間", delta: 2 } }
        ], [
          1,
          "告発には成功したものの、豪族の縁戚である上級官吏に恨まれ、閑職へ回される嫌がらせを受けた。",
          { cr: 2, p: -3 }
        ]),
        $terraData.K("延べ棒を受け取り、帳簿の数字を少し書き換える", { ethics: { reviewed: true, policyVersion: 87, intent: "self-or-family-care" } }, [
          0.5,
          "細工を悟られぬよう完璧に帳簿を偽装し、巨額の賄賂を手中に収めた。だが、夜中に大理寺の足音が聞こえるたびに心臓が凍りつく日々が始まった。",
          { cash: 3000000, p: -5, cr: -4 }
        ], [
          1,
          "偽装が拙く、三ヶ月後に御史台の監察官が踏み込んだ。官位を剥奪され、財貨を差し押さえられた。",
          { job: 0, p: -20, cash: -1000000,
            lifeAffiliation: { id: "yan-court-bureaucracy", action: "leave",
              note: "収賄の発覚で官位を剥奪され、朝廷の職を失った" },
            lifeGoals: [
              { id: "yan-governance", action: "abandon", onlyIfUnresolved: true,
                note: "収賄による罷免で官吏の仕事を終えた" },
              { id: "yan-dismissed-clerk-livelihood",
                title: "罷免された後の生計を立て直す",
                priority: "生業", action: "start", preserveAchievement: true }
            ] }
        ])
      ]
    },

    // =============================================================
    // 炎国: 司歳台・大理寺 監察官
    // =============================================================
    {
      id: "car_yan_suis_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "炎国" && $terraData.regionalCareerOnDuty(s, "yan_suis"),
      t: "人里離れた山頂の観測所で、司歳台の特殊計器が刻む地脈の波形を点検した。千年前の巨獣狩り以来、眠りにつく『歳』の気配に異常はないか。冷たい山風の中で杯の湯気を眺めながら、国家の安寧を確かめる。",
      c: [
        $terraData.K("観測記録に封印を施し、本府へ転送する", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "異常なしとの電文を打ち、宿直の任務を終えた。",
          { p: 1, k: 1, cash: 200000 }
        ])
      ]
    },
    {
      id: "car_yan_suis_choice_beast_shard",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 23 },
      show: s => s.res?.n === "炎国" && $terraData.regionalCareerOnDuty(s, "yan_suis"),
      t: "辺境の荒野で、歳獣の微細な破片が活性化し、周囲の天候を歪めながら暴走していた。近隣の集落が呑み込まれる寸前である。司歳台の監察官として、自らの命を削って封印術式を発動するか、本隊の増援を待つか。",
      c: [
        $terraData.K("単身で封印陣を展開し、巨獣の影を鎮める", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "猛烈な重圧に耐え抜き、腰牌の封印術を完璧に叩き込んだ。巨獣の影は霧散し、集落を無傷で守り抜いた。朝廷から功三等の勲章を授与された。",
          { p: 4, h: -2, cr: 4, cash: 1000000 }
        ], [
          0.85,
          "封印には成功したものの、巨獣の放った衝撃波をまともに受け、重傷を負った。長期の療養を余儀なくされた。",
          { h: -10, p: 2, cash: 300000 }
        ], [
          1,
          "巨獣の圧倒的な力の前に術式が逆流し、肉体と精神を砕かれた。殉職の報告が朝廷に届けられた。",
          { h: -100, d: ["司歳台任務での殉職", "炎国における巨獣破片の鎮圧任務中、術式の逆流により肉体と精神を砕かれ殉職した。"] }
        ]),
        $terraData.K("住民を避難させ、本隊の天師部隊の到着を待つ", { ethics: { reviewed: true, policyVersion: 87, intent: "defer" } }, [
          1,
          "冷静に被害を最小限に抑え、到着した天師たちと共に安全に影を掃討した。",
          { p: 1, k: 2 }
        ])
      ]
    },

    // =============================================================
    // 龍門: 近衛局（L.G.D.）警官
    // =============================================================
    {
      id: "car_lmd_guard_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "龍門" && $terraData.regionalCareerOnDuty(s, "lmd_guard"),
      t: "ネオン瞬く龍門の中央通りから、薄暗い下層水路へと巡回車を走らせた。違法な源石製品の密輸取引現場を押さえ、抵抗するチンピラを警棒で制圧する。近衛局のバッジを磨き直し、夜警の詰め所へ戻った。",
      c: [
        $terraData.K("日報を提出し、夜食のワンタン麺をすする", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "熱いスープで冷えた体を温め、明日の当番に備えた。",
          { h: 1, p: 1, cash: 120000 }
        ])
      ]
    },
    {
      id: "car_lmd_guard_choice_raid",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 21 },
      show: s => s.res?.n === "龍門" && $terraData.regionalCareerOnDuty(s, "lmd_guard"),
      t: "近衛局通信から緊急入電。スラム街の廃ビルに武装組織の潜伏拠点が特定された。銃火器で武装した敵に対し、先頭を切って突入するか、催涙弾を撃ち込んで持久戦に持ち込むか。",
      c: [
        $terraData.K("防弾盾を構え、先頭でドアを蹴破る", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "飛び交う銃弾を盾で弾き、瞬く間に主犯を床にねじ伏せた。見事な突入指揮により、近衛局長から特別表彰と昇進が告げられた。",
          { cr: 4, h: 2, p: 2, cash: 500000 }
        ], [
          0.85,
          "突入には成功したものの、跳弾を肩に受けて負傷した。病院へ搬送され、一ヶ月の治療を受けた。",
          { h: -6, p: 1, cash: 200000 }
        ], [
          1,
          "ドアの背後に仕掛けられていた即席爆弾が炸裂。爆風に吹き飛ばされ、殉職した。",
          { h: -100, d: ["近衛局任務での爆殺殉職", "龍門近衛局の強制捜査中、トラップ爆弾の直撃を受けて殉職した。"] }
        ]),
        $terraData.K("催涙ガスを装填し、包囲して投降を呼びかける", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "煙に巻かれた容疑者たちが次々に手を上げて出てきた。安全確実に任務を完了させた。",
          { p: 2, cr: 1 }
        ])
      ]
    },

    // =============================================================
    // 龍門: 黒市ブローカー
    // =============================================================
    {
      id: "car_lmd_black_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "龍門" && $terraData.regionalCareerOnDuty(s, "lmd_black"),
      t: "近衛局の目が届かぬ高架下の暗がりで、客と無言の取引を交わした。偽造身分証の引き渡し、出入国コードの売買。手渡された札束の厚みを指先で確かめ、路地の影へと溶け込む。",
      c: [
        $terraData.K("稼ぎの一部を隠し金庫に収める", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "足がつかぬよう複数の口座へ資金を分散させた。",
          { cash: 250000, p: 1 }
        ])
      ]
    },
    {
      id: "car_lmd_black_choice_big_deal",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 22 },
      show: s => s.res?.n === "龍門" && $terraData.regionalCareerOnDuty(s, "lmd_black"),
      t: "見知らぬ大物から、近衛局の極秘警備配置図を買い取りたいと破格の報酬が提示された。成功すれば数千万龍門幣の巨利だが、一歩間違えれば近衛局の特捜に踏み込まれるか、裏社会の消去対象にされる。",
      c: [
        $terraData.K("危険を冒して配置図を入手し、取引現場へ運ぶ", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          0.5,
          "近衛局の監視を欺き、見事に取引を成立させた。アタッシュケースいっぱいの現金を手に入れ、裏通りの大物として顔が利くようになった。",
          { cash: 5000000, p: 2, k: 3 }
        ], [
          1,
          "取引現場は近衛局の仕組んだ罠だった。射撃を受けながらも逃げ道を探したが、手錠をかけられ、留置施設へ連行された。",
          { job: 0, p: -20, cash: -2000000, fl: { detained: 1 },
            lifeAffiliation: { id: "lungmen-black-market", action: "leave",
              note: "近衛局に拘束され、黒市の仲介業から離れた" },
            lifeGoals: [
              { id: "lmd-underground-deals", action: "abandon", onlyIfUnresolved: true,
                note: "摘発によって黒市での仲介を続けられなくなった" },
              { id: "lungmen-post-custody-livelihood",
                title: "拘束が解けた後に新しい生計を探す",
                priority: "生業", action: "start", preserveAchievement: true }
            ] }
        ]),
        $terraData.K("怪しすぎて手を出せないと断る", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "深追いを避け、平穏な小商いに戻った。数日後、その大物が埠頭で水死体で見つかったと聞き、冷や汗を流した。",
          { p: 2 }
        ])
      ]
    },

    // =============================================================
    // 極東: 侍（武家仕官）
    // =============================================================
    {
      id: "car_hig_samurai_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "極東" && $terraData.regionalCareerOnDuty(s, "hig_samurai"),
      t: "朝靄の立ち込める道場で、息を整えながら居合の抜き付けを繰り返した。白鞘から放たれる鋼の冷たい光。稽古の後、丁字油で刀身を拭い、主君の警固当番へ向かう。武士としての節度と誇りが身に沁みつく。",
      c: [
        $terraData.K("背筋を伸ばし、御殿の門番を務める", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "何事もなく当番を終え、長屋で質素な夕餉を取った。",
          { p: 1, h: 1, cash: 140000 }
        ])
      ]
    },
    {
      id: "car_hig_samurai_choice_duel",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 22 },
      show: s => s.res?.n === "極東" && $terraData.regionalCareerOnDuty(s, "hig_samurai"),
      t: "北朝と南朝の軍勢が川を挟んで対峙する合戦場。敵陣から名うての剛の者が馬を進め、大音声で一騎打ちを呼びかけてきた。主君の御前で名乗りを上げ、武士の誉れを懸けて立ち会うか。",
      c: [
        $terraData.K("太刀を抜き、名乗りを上げて一騎打ちに応じる", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.45,
          "電光石火の抜刀で敵将の甲冑を両断し、討ち取った。両軍から轟く歓声の中、主君より感状と名刀を賜り、旗本頭へ昇進した。",
          { h: 3, cr: 5, p: 3, cash: 800000,
            lifeAffiliation: { id: "higashi-samurai-household", action: "role", role: "旗本頭",
              onlyIfActiveOrCrisis: true, onlyIfRoleChanged: true } }
        ], [
          0.85,
          "激闘の末に敵を退けたものの、深手を負って落馬した。味方に救出され、療養所へ運ばれた。",
          { h: -8, p: 2, cr: 2 }
        ], [
          1,
          "敵の剛剣に太刀をへし折られ、眉間を割られて討死した。武士としての人生が幕を閉じた。",
          { h: -100, d: ["合戦一騎打ちでの討死", "極東の南北朝の合戦において、敵将との一騎打ちの末に眉間を割られて討死した。"] }
        ]),
        $terraData.K("自重して陣形を維持し、鉄砲隊に射撃を命じる", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "敵将は鉄砲の一斉射撃で討ち取られた。派手さはないが、確実な用兵を評価された。",
          { p: 1, k: 2 }
        ])
      ]
    },

    // =============================================================
    // 極東: 忍者（隠密・抜け忍分岐）
    // =============================================================
    {
      id: "car_hig_ninja_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "極東" && $terraData.regionalCareerOnDuty(s, "hig_ninja"),
      t: "敵城の梁の上に息を潜め、数刻にわたり身じろぎ一つせず下の密談を聞き耳を立てた。手裏剣の刃に塗り直した痺れ薬の匂い。夜明け前に城壁を縄で滑り降り、頭領への報告書を暗号で認める。",
      c: [
        $terraData.K("気配を消して路地裏の隠れ処へ潜む", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "無事に任務を終え、握り飯をかじって睡眠を取った。",
          { p: 1, h: 1, cash: 130000 }
        ])
      ]
    },
    {
      id: "car_hig_ninja_choice_escape",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 5,
      w: 0.4,
      ge: { age: 22 },
      show: s => s.res?.n === "極東" && $terraData.regionalCareerOnDuty(s, "hig_ninja") && !s.fl?.nukenin,
      t: "頭領から下された新たな指令――それは無実の幼子を抹殺し、自らも証拠隠滅のために毒を仰げという冷酷なものだった。忍びの掟に従い命を捨てるか、それとも里を裏切り、生涯追手と戦い続ける『抜け忍』となるか。",
      c: [
        $terraData.K("巻物を焼き捨て、里から脱走して『抜け忍』となる", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          0.5,
          "追跡してきた刺客二人を返り討ちにし、極東の山中へ逃げ延びた。忍び衆の掟を破った『抜け忍』として、生涯追手から命を狙われ続ける修羅の人生が始まった。",
          { job: 0, fl: { nukenin: 1 }, p: 3, h: 2, cr: -5 ,
            lifeAffiliation: { id: "higashi-ninja-clan", action: "leave",
              note: "忍び衆から脱走し、抜け忍として追われる身となった" },
            lifeGoals: [
              { id: "higashi-ninja-mission", action: "abandon", onlyIfUnresolved: true,
                note: "忍び衆の密命を離れ、元の任務を終えた" },
              { id: "higashi-nukenin-next-livelihood", title: "追跡を警戒しながら次の生計を見つける",
                priority: "生業", action: "start", preserveAchievement: true }
            ] }
        ], [
          1,
          "逃走の途中で追手の毒矢に射抜かれた。血を吐きながら川へ飛び込み、瀕死の重傷を負いながら街へ流れ着いた。",
          { job: 0, fl: { nukenin: 1 }, h: -20, p: -10 ,
            lifeAffiliation: { id: "higashi-ninja-clan", action: "leave",
              note: "逃走中に重傷を負い、忍び衆の任務から離脱した" },
            lifeGoals: [
              { id: "higashi-ninja-mission", action: "abandon", onlyIfUnresolved: true,
                note: "忍び衆の密命を離れ、元の任務を終えた" },
              { id: "higashi-nukenin-next-livelihood", title: "追跡を警戒しながら次の生計を見つける",
                priority: "生業", action: "start", preserveAchievement: true }
            ] }
        ]),
        $terraData.K("感情を殺し、掟に従って密命を完遂する", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "感情を完全に凍りつかせ、血塗られた命令を果たした。人間性を失い、ただの冷徹な道具となった。",
          { p: -8, cr: -3, cash: 500000 }
        ])
      ]
    },

    // =============================================================
    // 極東: サイバーニンジャ（電脳特務）
    // =============================================================
    {
      id: "car_hig_cyber_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "極東" && $terraData.regionalCareerOnDuty(s, "hig_cyber"),
      t: "防音シェルターの暗室で、頭部インターフェースを通じて極東全土の光ファイバー網へ意識を接続した。他国の情報機関が仕掛けてくるクラッキングパケットをミリ秒単位で相殺し、国家基幹システムを防衛する。電脳空間の闇で息づく日常である。",
      c: [
        $terraData.K("ログを消去し、神経接続を解除する", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "冷却水を飲み、疲弊した脳を休めた。高額の裏報酬が着金した。",
          { k: 2, p: 1, cash: 400000 }
        ])
      ]
    },
    {
      id: "car_hig_cyber_choice_offensive",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 22 },
      show: s => s.res?.n === "極東" && $terraData.regionalCareerOnDuty(s, "hig_cyber"),
      t: "国家上層部から最重要指令。クルビアの巨大企業が極東の軍事通信を盗聴している疑いがある。その中枢サーバーへ電子侵入し、盗聴プログラムを無力化せよ。失敗すれば相手の防諜迎撃により端末のアーツユニットが暴走臨界を起こす極限の情報戦である。",
      c: [
        $terraData.K("最高強度の自作ウイルスを展開し、中枢へ突入する", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.4,
          "クルビアのファイアウォールを瞬時に粉砕し、盗聴データを完全消去して無傷で離脱した。国家電脳防諜部の『電脳首席執行官』へと登り詰め、国家の影の覇権を握った。",
          { k: 8, p: 5, cash: 5000000, cr: 5,
            lifeAffiliation: { id: "higashi-cyber-intelligence", action: "role", role: "電脳首席執行官",
              onlyIfActiveOrCrisis: true, onlyIfRoleChanged: true } }
        ], [
          0.85,
          "作戦には成功したものの、相手の防諜パルスを浴びて一時的な記憶障害と頭痛の後遺症を負った。",
          { k: -5, p: -5, cash: 1500000 }
        ], [
          1,
          "相手の防諜迎撃により端末のオリジニウム回路が過負荷を起こし臨界爆破。至近距離で激しい爆炎とアーツ衝撃波を浴び、即死した。",
          { h: -100, d: ["電脳情報戦での臨界爆死", "極東の軍事電脳防諜任務において、迎撃アーツによる端末の臨界爆発を浴びて即死した。"] }
        ]),
        $terraData.K("リスクが高すぎると判断し、侵入経路を変更する", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "安全策を取り、外縁サーバーの撹乱に留めて無難に任務を終えた。",
          { k: 2, p: 1 }
        ])
      ]
    },

    // =============================================================
    // 極東: 神職（神社神官・寺院僧侶）
    // =============================================================
    {
      id: "car_hig_shinto_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "極東" && $terraData.regionalCareerOnDuty(s, "hig_shinto"),
      t: "朝露の残る神社の石段を竹箒で掃き清め、本堂の蝋燭に火を灯した。病や天災に怯える信徒たちが訪れ、鉱石病の平癒を祈願する。鈴の音を響かせ、真摯に祓いの詞を奏上する。人々の安寧を祈る静かな一日である。",
      c: [
        $terraData.K("信徒たちに供物の茶を振る舞う", { ethics: { reviewed: true, policyVersion: 87, intent: "self-or-family-care" } }, [
          1,
          "温かい茶を飲み交わし、人々の表情に安らぎが戻った。",
          { p: 2, cr: 1, cash: 80000 }
        ])
      ]
    },

    // =============================================================
    // 極東: 東方重工（兵器技師）
    // =============================================================
    {
      id: "car_hig_touhou_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "極東" && $terraData.regionalCareerOnDuty(s, "hig_touhou"),
      t: "東方重工の工場内で、最新鋭の旋盤から削り出された手裏剣『シルバーウィンド』同型刃の寸法と硬度を測定した。特殊合金の焼き入れムラがないか、顕微鏡で結晶構造を検査する。大量生産であっても、一撃の切れ味に一切の妥協は許されない。",
      c: [
        $terraData.K("検査合格印を押し、梱包ラインへ送る", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "工場のチャイムを聞き、作業着の煤を払って帰宅した。",
          { k: 1, h: 1, cash: 180000 }
        ])
      ]
    },
    {
      id: "car_hig_ninja_after_escape",
      conf: "S",
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.3,
      ge: { age: 24 },
      after: { id: "car_hig_ninja_choice_escape", min: 2, choice: 0 },
      show: s => !!s.fl?.nukenin &&
        s.lifeRecord?.affiliations?.some(a => a.id === "higashi-ninja-clan" && a.status === "left") &&
        s.lifeRecord?.goals?.some(g => g.id === "higashi-nukenin-next-livelihood" &&
          ["active", "compromised", "paused"].includes(g.status)),
      t: "里を離れた後も、戸口の物音には耳が向いた。かつての名前を知る者がいつ現れるかは分からない。それでも、寝床と食い扶持は今日も必要だった。",
      c: [
        $terraData.K("足取りを隠しながら働き口を探す", {
          show: s => s.job === 0,
          ethics: { reviewed: true, policyVersion: 87, intent: "procedure" }
        }, [1, "市場に立ち寄り、誰も昔のことを尋ねない仕事がないか聞いて回った。働き口の約束は得られなかった。",
          { lifeGoal: { id: "higashi-nukenin-next-livelihood", action: "continue",
            note: "身元と追跡を気にかけつつ、次の仕事を探し続けた" } }]),
        $terraData.K("いまは身を隠し、求職を休む", {
          show: s => s.job === 0,
          ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" }
        }, [1, "外へ出るのを控え、手元の食べ物を少しずつ使った。先の見通しは立たなかった。",
          { lifeGoal: { id: "higashi-nukenin-next-livelihood", action: "pause",
            note: "身を隠すことを優先し、仕事探しをいったん休んだ" } }]),
        $terraData.K("新しい仕事を得たことに一区切りつける", {
          show: s => s.job > 0 && s.job !== 47,
          ethics: { reviewed: true, policyVersion: 87, intent: "procedure" }
        }, [1, "今の勤め先で働いた分の報酬を受け取った。追われる記憶は残るが、自分の働きで暮らしを支える道が一つできた。",
          { lifeGoal: { id: "higashi-nukenin-next-livelihood", action: "complete",
            note: "忍び衆を離れた後、別の実際の職業で生計を得た" } }]),
        $terraData.K("新しい勤め先があっても警戒を続ける", {
          show: s => s.job > 0 && s.job !== 47,
          ethics: { reviewed: true, policyVersion: 87, intent: "procedure" }
        }, [1, "仕事には通い続けたが、帰り道では何度も背後を確かめた。暮らしを立て直せたかどうか、結論を急がなかった。",
          { lifeGoal: { id: "higashi-nukenin-next-livelihood", action: "continue",
            note: "別の職業に就いたが、追跡下での生計の安定を引き続き見極める" } }])
      ]
    },
  ];

  for (const event of E) {
    event.references = [...new Set([...(event.references || []), "SRC_REGIONAL_CAREERS", "SRC_HIGASHI_CAREERS"])];
    $terraData.EV.push(event);
  }
});
