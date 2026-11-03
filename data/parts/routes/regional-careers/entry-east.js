// routes/regional-careers/entry-east: recruitment and entry events for Yan, Lungmen, and Higashi.
window.TERRA_DATA_BUILD.fragment(
  "routes/regional-careers",
  "routes/regional-careers/entry-east"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const E = [
    // -------------------------------------------------------------
    // 炎国: 朝廷文官（科挙会試）
    // -------------------------------------------------------------
    {
      id: "car_yan_court_entry",
      conf: "S",
      st: ["青年", "壮年"],
      months: [3, 4, 5],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "炎国" && s.job === 0 && !s.fl?.retired && (s.k || 0) >= 30,
      t: "炎国の春、都や各州の試験場で科挙の会試が催された。真龍の治める広大な領土に秩序を敷くべく、三省六部の官吏登用を期して天下の士が筆を執る。家柄の推薦状だけでは通らぬ厳格な律令の試練である。",
      c: [
        $terraData.K("科挙の会試に全霊を賭けて臨む", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.4,
          "論策と法典の問答において見事な才を認められ、及第を果たした。三省の審査を経て、地方県令補佐の主簿として朝廷の官吏名簿に名が記された。",
          $terraData.regionalCareerStaff(
            "yan_court",
            "yan-court-bureaucracy",
            "炎国朝廷",
            "地方県令補佐・主簿",
            "yan-governance",
            "科挙に合格し、三省六部の法と典籍を治める",
            "yan-administration",
            "律令行政と文書起草",
            { k: 3, p: 2, cr: 3, standingId: "yan-officials", standingTitle: "朝廷の官吏仲間" }
          )
        ], [
          0.8,
          "筆の運びは悪くなかったものの、殿試の当落線上で落第となった。三年後の再試まで及第者名簿に名は載らず、試験のために背負った宿代と紙墨の借金が重くのしかかった。",
          { p: -4, debt: 300000 }
        ], [
          1,
          "最初の基礎問答すら要領を得ず、試験官から冷淡に失格を言い渡された。会場の門前へ追い出され、学の浅さを思い知らされた。",
          { p: -6, k: 1 }
        ]),
        $terraData.K("朝廷の試験を辞退し、民間の生業を探す", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "官吏への道を見送り、街角路地で別の生き方を探すことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // 炎国: 司歳台・大理寺 監察官公募
    // -------------------------------------------------------------
    {
      id: "car_yan_suis_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.45,
      ge: { age: 19, year: 1092 },
      show: s => s.res?.n === "炎国" && s.job === 0 && !s.fl?.retired && (s.p || 0) >= 30,
      t: "旅籠の奥で、無地の官服をまとった役人が静かに杯を置いていた。巨獣の影を追い、朝廷の内外を巡視して災いを未然に断つ『司歳台』と司法監察の『大理寺』。常人離れした胆力と鋭い洞察を持つ者を人知れず探しているという。",
      c: [
        $terraData.K("監察特務の試問に名乗りを上げる", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.35,
          "役人の放つ威圧に一切たじろがず、投げかけられた巨獣の痕跡と官吏の偽装を見抜いた。無言で手渡された腰牌により、司歳台の監察官補佐としての任が始まった。",
          $terraData.regionalCareerStaff(
            "yan_suis",
            "yan-suis-inquisition",
            "炎国司歳台・大理寺",
            "監察官補佐",
            "yan-suis-investigation",
            "巨獣の動向と官吏の汚職を監察する",
            "yan-inquisition",
            "密偵と審問アーツ",
            { p: 3, h: 2, k: 2 }
          )
        ], [
          0.75,
          "役人の放つ鋭い殺気に息を呑み、試問の途中で精神が竦んでしまった。『気骨が足らぬ。二度と関わるな』と冷淡に突き放され、厳しい挫折感を味わった。",
          { p: -5 }
        ], [
          1,
          "武芸と知恵の双方で基準に達していないと見做され、門前払いを食らった。",
          { p: -3 }
        ]),
        $terraData.K("関わりを恐れて目を逸らし、その場を立ち去る", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "国家の暗部に首を突っ込む危険を避け、静かに旅籠を出た。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // 炎国: 天師府 国家天師試験
    // -------------------------------------------------------------
    {
      id: "car_yan_tianshi_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "炎国" && s.job === 0 && !s.fl?.retired && (s.k || 0) >= 25,
      t: "各地の天師府では、国家の気象観測、治水、城壁防護を司る『天師』の採用試問が開かれている。アーツの心得があれば門戸は開かれているが、国家の資材を委ねるに足る精密な術式制御が求められる。",
      c: [
        $terraData.K("天師府の術式制御試験に挑む", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "試問盤に展開したアーツの波形は見事な安定を示し、天師府の長老たちを頷かせた。国家天師の見習いとして正式に籍を置くことが認められた。",
          $terraData.regionalCareerStaff(
            "yan_tianshi",
            "yan-tianshi-academy",
            "炎国天師府",
            "見習い国家天師",
            "yan-tianshi-arts",
            "天師府で天候・治水・地脈のアーツを修める",
            "yan-tianshi-craft",
            "天師術法と気象観測",
            { k: 3, p: 2 }
          )
        ], [
          1,
          "アーツの励起が不安定で、試問盤の数値を乱してしまった。天師としての適性なしと判定され、不合格となった。",
          { p: -3, k: 1 }
        ]),
        $terraData.K("試験を見送り、民間の道を選ぶ", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "アーツを国家機関に捧げる道を選ばず、自前の生活を続けることにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // 龍門: 近衛局（L.G.D.）警察官公募
    // -------------------------------------------------------------
    {
      id: "car_lmd_guard_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1092 },
      show: s => s.res?.n === "龍門" && s.job === 0 && !s.fl?.retired,
      t: "近衛局ビル前の掲示板に、新任巡査の採用募集が張り出されていた。繁栄する国際貿易都市の治安を維持するため、暴動鎮圧・対テロ・スラム警戒を担う強靭な肉体と規律ある精神が試される。",
      c: [
        $terraData.K("近衛局の体力測定と適性審査を受ける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.4,
          "厳しい実技訓練と口頭試問を突破し、制服と警棒を支給された。龍門近衛局の巡査として、街頭のパトロール任務に就く。",
          $terraData.regionalCareerStaff(
            "lmd_guard",
            "lungmen-guard-bureau",
            "龍門近衛局",
            "巡査（見習い執行官）",
            "lmd-law-enforcement",
            "龍門の治安と秩序を死守する",
            "lmd-patrol",
            "都市近接制圧・治安警備",
            { h: 2, p: 2, cr: 2 }
          )
        ], [
          0.8,
          "正規の巡査基準にはわずかに届かなかったが、試験官から『スラム外縁の下請け臨時警備員なら雇ってやる』と打診された。危険手当はあるものの、装備は自前で殉職の補償も薄い過酷な現場へ回された。",
          $terraData.regionalCareerStaff(
            "lmd_guard",
            "lungmen-guard-bureau",
            "龍門近衛局",
            "スラム外縁・臨時警備員",
            "lmd-law-enforcement",
            "下請け警備員として危険地帯の詰め所に立つ",
            "lmd-patrol",
            "都市近接制圧・治安警備",
            { h: 1, p: -1, debt: 150000 }
          )
        ], [
          1,
          "体力試験で息が切れ、教官から『近衛局を舐めるな』と一喝されて落とされた。",
          { p: -3, h: 1 }
        ]),
        $terraData.K("危険な警察官を避け、民間の商いを志す", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "銃弾や暴徒と向き合う仕事を避け、穏やかな仕事を探すことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // 龍門: 黒市ブローカー接触
    // -------------------------------------------------------------
    {
      id: "car_lmd_black_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.45,
      ge: { age: 18, year: 1092 },
      show: s => s.res?.n === "龍門" && s.job === 0 && !s.fl?.retired,
      t: "近衛局のサイレンが遠ざかるスラムの薄暗い酒場で、怪しげな仲介人が品定めの視線を向けていた。ネオンの届かぬ暗がりで密輸品や身元偽造、裏の噂話を売り捌く『黒市ブローカー』の席が空いているという。",
      c: [
        $terraData.K("裏通りの掟を呑み、ブローカーの手先になる", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          0.5,
          "仲介人との駆け引きで肝の太さを示し、路地の隠れ家と顧客の連絡先を教えられた。龍門黒市の情報ブローカーとして、影の稼業に身を投じる。",
          $terraData.regionalCareerStaff(
            "lmd_black",
            "lungmen-black-market",
            "龍門黒市",
            "情報ブローカー・仲介人",
            "lmd-underground-deals",
            "龍門の影で情報を売り買いし生き残る",
            "lmd-underworld",
            "裏街道の顔利きと交渉",
            { p: 2, k: 2, cr: -2 }
          )
        ], [
          1,
          "気後れした態度を見透かされ、『ただの素人が首を突っ込む場所じゃない』と路地裏から叩き出された。身包みを剥がされなかっただけ幸運だった。",
          { p: -4, cash: -50000 }
        ]),
        $terraData.K("危ない橋を渡らず、表通りへ引き返す", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "犯罪の匂いが漂う酒場を抜け出し、光の差す大通りへ急ぎ足で戻った。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // 極東: 侍（武士階級仕官）
    // -------------------------------------------------------------
    {
      id: "car_hig_samurai_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "極東" && s.job === 0 && !s.fl?.retired,
      t: "極東の城下町で、名門武家が新たな家臣を募っていた。北朝と南朝の対立が続くこの国において、主君に命を預けて刀を振るう『侍』は誉れ高き身分である。だがそれには、家格と武芸、そして主君への絶対の服従が求められる。",
      c: [
        $terraData.K("武家の指南役の前で剣術の型を披露する", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.4,
          "指南役との木刀での立ち会いで鋭い太刀筋を見せ、見事召抱えが決まった。大小二本を腰に差し、武家の正規の侍として主君に仕える日々が始まった。",
          $terraData.regionalCareerStaff(
            "hig_samurai",
            "higashi-samurai-household",
            "極東武家",
            "家臣・侍",
            "higashi-samurai-duty",
            "主君に忠義を尽くし、武士の誉れを守る",
            "higashi-kenjutsu",
            "当流抜刀・甲冑剣術",
            { h: 3, p: 2, cr: 2 }
          )
        ], [
          0.8,
          "筋の良さは認められたものの、家柄の後ろ盾がなく『足軽頭（捨て駒部隊）』としての採用となった。泥水すする前線配属を命じられ、手柄を立てねば侍としての禄は望めない。",
          $terraData.regionalCareerStaff(
            "hig_samurai",
            "higashi-samurai-household",
            "極東武家",
            "前線足軽頭",
            "higashi-samurai-duty",
            "泥にまみれ、最前線で命を懸けて武功を狙う",
            "higashi-kenjutsu",
            "当流抜刀・甲冑剣術",
            { h: 2, p: -1 }
          )
        ], [
          1,
          "太刀筋の甘さを一喝され、指南役から門前払いを食らった。『腕を磨き直して出直せ』と冷ややかに見送られた。",
          { p: -3, h: 1 }
        ]),
        $terraData.K("武士の道を選ばず、町人として生きる", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "命を捨て駒にする武家の掟から距離を置き、民間の生業を探すことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // 極東: 忍者（隠密衆）
    // -------------------------------------------------------------
    {
      id: "car_hig_ninja_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.45,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "極東" && s.job === 0 && !s.fl?.retired && !s.fl?.nukenin,
      t: "夜更けの屋根裏から、音もなく黒装束の密使が姿を現した。大名の影で敵情を探り、暗殺と工作を担う忍び衆。名も捨て、情も捨て、主君の命に従い影に生きる覚悟があるかを試される。失敗すれば自決、逃亡すれば『抜け忍』として追われる修羅の道である。",
      c: [
        $terraData.K("血判を押し、影の掟に従う", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          0.5,
          "無言で手渡された巻物に血判を記し、忍びの道具一式を受け取った。足音を消し、気配を隠し、極東の暗闘に身を投じる。",
          $terraData.regionalCareerStaff(
            "hig_ninja",
            "higashi-ninja-clan",
            "極東隠密衆",
            "忍び・間諜",
            "higashi-ninja-mission",
            "影となりて密命を遂行する",
            "higashi-ninjutsu",
            "隠密潜入・縄術・暗殺術",
            { h: 2, p: 3, cr: -2 }
          )
        ], [
          1,
          "覚悟を試すための拷問めいた試練に耐えきれず、悲鳴を上げて失格となった。『この記憶を漏らせば命はない』と脅され、夜の闇に放り出された。",
          { p: -6, h: -2 }
        ]),
        $terraData.K("首を横に振り、影の誘いを拒む", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "密使は無言で会釈し、闇に溶けるように消え去った。背筋に冷や汗が流れた。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // 極東: サイバーニンジャ【発見イベント】（隠しトリガー）
    // -------------------------------------------------------------
    {
      id: "car_hig_cyber_discovery",
      conf: "S",
      st: ["青年"],
      cd: 5,
      w: 0.4,
      ge: { age: 15, year: 1089 },
      show: s => s.res?.n === "極東" && (s.k || 0) >= 50 && !s.fl?.cyber_trace,
      t: "街のジャンク屋で手に入れた旧式電子端末のログを解析していたところ、奇妙な暗号通信の痕跡に行き当たった。1088年に北朝の本拠『鎖川』を麻痺させた大規模ネットワーク攻撃――その際に使用された未知の電脳プロトコルの断片が、今なお地下回線に潜んでいるようだ。",
      c: [
        $terraData.K("危険を冒して暗号化プロトコルを復元・保存する", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "数日間の徹夜の末、未知の軍事暗号パケットの復元に成功した。画面に『接続待機中』の文字が明滅し、密かにフラッシュメモリへ痕跡を記録した。",
          { k: 3, p: 1, fl: { cyber_trace: 1 } }
        ]),
        $terraData.K("国家反逆の疑いを恐れ、データを完全消去する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "危険すぎるデータに近づくのをやめ、ログを完全に初期化した。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // 極東: サイバーニンジャ【接触・採用判定】（超難関隠しルート）
    // -------------------------------------------------------------
    {
      id: "car_hig_cyber_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1092 },
      show: s => s.res?.n === "極東" && s.job === 0 && s.fl?.cyber_trace === 1 && !s.fl?.retired,
      t: "深夜2時、自室の端末が突如として外部電源なしに起動した。黒い画面に、かつて保存した鎖川の極秘暗号プロトコルが自動展開される。国家中枢の電子防諜を担う『サイバーニンジャ』からの直接介入だ。一般市民は存在すら知らぬこの組織に踏み込むか、それとも退くか。",
      c: [
        $terraData.K("迎撃プロトコルを突破し、自作の復号コードで応答する", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.3,
          "光速で押し寄せる逆探知トラップをすべて躱し、完璧な復号応答を返した。画面に『適性承認・身元抹消手続き開始』と表示され、巨額の暗号資金が振り込まれた。極東の国家電脳防諜部『サイバーニンジャ』として電子の闇に潜む。",
          $terraData.regionalCareerStaff(
            "hig_cyber",
            "higashi-cyber-intelligence",
            "極東国家電脳防諜部",
            "電脳特務エージェント",
            "higashi-cyber-defense",
            "電子の闇に潜み、国家の防諜と破壊工作を担う",
            "cyber-warfare",
            "超高度軍事暗号・電脳迎撃術",
            { k: 6, p: 4, cashDelta: 3000000 }
          )
        ], [
          0.7,
          "応答コードの処理がコンマ数秒遅れた。瞬間、防諜システムによる強烈な逆流サージと迎撃アーツが端末を直撃。アーツユニットが激しくショートして閃光が爆発し、激しい電磁衝撃で頭部と神経に深刻な打撲と火傷を負った。",
          { k: -30, p: -20, h: -10, fl: { cyber_trace: 0 } }
        ], [
          1,
          "逆探知を阻止できず、わずか5分後に武装した治安特務部隊がドアを蹴破って突入してきた。連行され、厳しい尋問の末に全財産を没収された。",
          { p: -30, cash: -2000000, fl: { cyber_trace: 0 } }
        ]),
        $terraData.K("電源コードを引き抜き、端末を金槌で叩き壊す", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "火花を散らして砕けた端末の残骸を見つめながら、荒い息を吐いた。死線を踏み越えずに済んだことを天に感謝した。",
          { p: 2, fl: { cyber_trace: 0 } }
        ])
      ]
    },

    // -------------------------------------------------------------
    // 極東: 神職（神社神官・寺院僧侶）
    // -------------------------------------------------------------
    {
      id: "car_hig_shinto_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "極東" && s.job === 0 && !s.fl?.retired,
      t: "緑深き山あいの神社と古刹の門前で、若き神職や僧侶を志す者が集まっていた。テラでは珍しく神仏が共に息づく極東において、人々の穢れを祓い、病や天災による悲嘆を祈りで鎮める尊い職分である。",
      c: [
        $terraData.K("白装束をまとい、入門の儀礼を受ける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.45,
          "静寂の中で祝詞と読経の儀礼を過ちなく終え、澄み切った精神が認められた。社寺の正式な神職・僧侶として、日々の勤行と地域信徒の相談役を任された。",
          $terraData.regionalCareerStaff(
            "hig_shinto",
            "higashi-shinto-temple",
            "極東社寺",
            "神職・僧侶",
            "higashi-shinto-devotion",
            "神仏を敬い、人々の穢れと苦難を鎮める",
            "higashi-ritual",
            "祓い・祭祀・精神統一",
            { p: 4, cr: 3, k: 1 }
          )
        ], [
          0.85,
          "雑念が多く修行が足りぬと判断され、霊峰の奥にある『荒行場』へ三年間の山籠りを命じられた。真冬の滝に打たれる過酷な日々の始まりである。",
          $terraData.regionalCareerStaff(
            "hig_shinto",
            "higashi-shinto-temple",
            "極東社寺",
            "荒行場・修行僧",
            "higashi-shinto-devotion",
            "霊峰の滝に打たれ、己の雑念を削ぎ落とす",
            "higashi-ritual",
            "祓い・祭祀・精神統一",
            { p: 2, h: 2, cr: 1 }
          )
        ], [
          1,
          "心が浮ついており俗世の欲が抜けきっていないと見抜かれ、入門を断られた。",
          { p: -2 }
        ]),
        $terraData.K("俗世に留まり、別の生業を探す", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "厳しい戒律の生活を敬遠し、街へ戻ることにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // 極東: 東方重工（兵器技師）
    // -------------------------------------------------------------
    {
      id: "car_hig_touhou_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "極東" && s.job === 0 && !s.fl?.retired,
      t: "煙突から黒煙を吐き出す巨大な近代工場群――東方重工。シラユキの手裏剣『シルバーウィンド』をはじめ、伝統的な刀剣や手裏剣を高精度の工業ラインで大量生産する一大軍需企業である。特殊合金の精錬や機構設計を担う技師が募集されていた。",
      c: [
        $terraData.K("金属工学の筆記と治具設計の実技に挑む", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "工学設計の知識と手際の良さを評価され、兵器製造部門の正規技師として採用された。最新の旋盤と炉が並ぶラインで、兵器開発に携わる。",
          $terraData.regionalCareerStaff(
            "hig_touhou",
            "higashi-touhou-heavy",
            "東方重工",
            "兵器製造技師",
            "higashi-touhou-manufacturing",
            "大量生産される刀剣と近代兵器を鍛造する",
            "higashi-metallurgy",
            "特殊合金精錬・機構設計",
            { k: 2, h: 2 }
          )
        ], [
          1,
          "製図の基準寸法を誤り、高熱の溶解炉の前で行う危険な雑用係に回された。火傷の絶えぬ過酷な労働環境である。",
          $terraData.regionalCareerStaff(
            "hig_touhou",
            "higashi-touhou-heavy",
            "東方重工",
            "溶解炉・下級工員",
            "higashi-touhou-manufacturing",
            "高熱の溶解炉で鉄屑を運び、火傷に耐える",
            "higashi-metallurgy",
            "特殊合金精錬・機構設計",
            { h: 1, p: -2, debt: 100000 }
          )
        ]),
        $terraData.K("工場の騒音を避け、別の仕事を探す", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "煙と油の匂いが立ち込める工場を離れ、町へ戻った。",
          { p: 1 }
        ])
      ]
    }
  ];

  for (const event of E) {
    event.references = [...new Set([...(event.references || []), "SRC_REGIONAL_CAREERS", "SRC_HIGASHI_CAREERS"])];
    $terraData.EV.push(event);
  }
});
