// world/history: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("world/history", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "HIST",
    [
      {
        y: 1007,
        r: ["ボリバル"],
        city: "エル・ソル",
        t: "シンガス王朝のもと、移動都市エル・ソルが建設された。荷役と補修の仕事はあっても、観光客を迎える街並みはまだなかった。",
        publicText: "ボリバルに移動都市エル・ソルが築かれた。",
        flag: "el_sol_founded",
        localText: "砂塵の吹き荒れる荒野に巨大な移動プレートが結合され、エル・ソルの基礎が目の前に組み上がる。荷役と補修の槌音が昼夜を問わず響き渡った。",
        localCity: "エル・ソル",
        localRegion: "ボリバル",
        conf: "C",
        infoScope: "local_news",
        references: ["SRC_COMMUNITY_DOSSOLES_HISTORY", "SRC_BOLIVAR_DOSSOLES_STORY"]
      },
      {
        y: 1019,
        r: ["クルビア"],
        t: "1019年、クルビアがヴィクトリアから独立した。新しい国境の内側でも、住む土地や仕事が一度に変わったわけではなかった。",
        publicText: "1019年、クルビアがヴィクトリアから独立した。",
        flag: "columbia_independence",
        localText: "ヴィクトリア総督府の紋章が引き倒され、開拓地の広場に開拓同盟の青い旗が掲げられた。武装した開拓民と新政府の役人が街路を行進した。",
        localRegion: "クルビア",
        conf: "B",
        infoScope: "local_news",
        references: ["SRC_TL_1000_1061", "SRC_COMMUNITY_COLUMBIA_REVOLUTION"]
      },
      {
        y: 1031,
        r: "all",
        t: "1029年から続いた四国戦争は1031年に終わり、ガリアは滅亡した。四皇会戦はその最終局面にあたり、戦後、旧領の分割が進んだ。境が引き直されても、そこに暮らす人々の家や仕事は一度に変わったわけではなかった。",
        publicText: "四国戦争の末、1031年にガリアが滅亡し、旧領の分割が進んだ。",
        flag: "four_emperors_war",
        localText: "空を覆う三国の飛行艦隊から砲弾が雨あられと降り注ぎ、崩れ落ちる首都リンガネスの街路を皇帝近衛兵が血に塗れて敗走していった。",
        localRegions: ["ガリア","ヴィクトリア","リターニア","ウルサス"],
        isCrisis: true,
        availableFromMonth: 12,
        availabilityBasis: "四国戦争と四皇会戦を区別する。決戦月は資料間で揺れるため、結果の知らせを年末に置くゲーム上の保守的な境界。",
        conf: "B",
        references: ["SRC_TL_1000_1061", "SRC_COMMUNITY_FOUR_NATIONS_WAR"]
      },
      {
        y: 1031,
        r: ["カズデル"],
        t: "秋、カズデル軍事委員会が発足した。戦乱の続く土地では、統一軍の旗を見ても、明日の食料や寝床まで決まるわけではなかった。",
        publicText: "秋、カズデル軍事委員会が発足した。",
        flag: "kazdel_commission_founded",
        localText: "傭兵団の頭領たちが城塞へ集結し、軍事委員会の無骨な鉄の印章が市壁に刻まれた。統一軍の旗が掲げられ、集落の若者たちに召集の視線が向けられた。",
        localRegion: "カズデル",
        availableFromMonth: 9,
        availabilityBasis: "BB-1の「Autumn, 1031」を秋の開始へ置くゲーム内月境界。9月は設立日の確定ではない。",
        conf: "B",
        infoScope: "local_news",
        references: ["SRC_KAZDEL_BB1"]
      },
      {
        y: 1038,
        r: ["イベリア"],
        t: "「大いなる静謐」と呼ばれる変化がイベリアの海を襲った。沿岸の暮らしは揺らいだが、何が起きたのかを語る声は一つではなかった。",
        publicText: "イベリアで「大いなる静謐」と呼ばれる海の異変が起きた。",
        flag: "great_silence",
        localText: "突如として黄金の波が漆黒の静寂へと沈み、沿岸の灯台の光が一斉に途絶した。海から異形の影が這い上がり、塩の臭いとともに悲鳴が立ち込めた。",
        localRegion: "イベリア",
        isCrisis: true,
        availableFromMonth: 7,
        availabilityBasis: "SN-ST-1は1038年とするが月は示さない。非公式年表の6月28日を参考に7月からとするゲーム上の近似で、正史の発生日を確定しない。",
        conf: "B",
        infoScope: "local_news",
        references: ["SRC_TL_1000_1061", "SRC_SN_ST1_OLD_WELL", "SRC_COMMUNITY_PROFOUND_SILENCE"]
      },
      {
        y: 1040,
        displayDate: "1040年頃",
        r: ["シラクーザ"],
        t: "この頃、ミズ・シチリアが十二家を束ね、シラクーザの統一を進めた。家門の旗が一つに揃っても、各地の利害や暮らしまで同じにはならなかった。",
        publicText: "この頃、ミズ・シチリアが十二家を束ね、シラクーザを統一した。",
        flag: "siracusa_unification",
        localText: "ミズ・シチリアの密使が各街区のファミリーの館を取り囲み、沈黙の中で新秩序が布告された。灰色の狼たちの視線が交錯し、街の掟が一夜で塗り替えられた。",
        localRegion: "シラクーザ",
        conf: "C",
        infoScope: "local_news"
      },
      {
        y: 1048,
        r: ["ボリバル"],
        t: "ボリバル連合政府が樹立され、内戦が始まった。遠い地域の旗が変わるたび、荷の行き先や雇い主の名も書き換えられた。",
        publicText: "ボリバル連合政府が樹立され、内戦が始まった。",
        flag: "bolivar_civil_war",
        localText: "激しい砲声とともに正規軍と反乱軍の戦線が市街を分断し、通りごとに異なる軍の検問が敷かれた。家々の窓には土嚢が積まれ、銃声が止まなかった。",
        localRegion: "ボリバル",
        isCrisis: true,
        conf: "C",
        infoScope: "local_news"
      },
      {
        y: 1048,
        r: ["ボリバル"],
        city: "エル・ソル",
        t: "ボリバル内戦の報せが届くなか、エル・ソルでは観光都市への改装計画が止まった。建設途中の区画に資材が残り、港では行き先を失った荷を積み替えていた。",
        publicText: "内戦の影響で、エル・ソルの観光都市化計画が中断した。",
        flag: "el_sol_renovation_paused",
        localText: "内戦の激化によりエル・ソルの観光改装計画が凍結された。建設途中の骨組みが放置され、港には行き場を失った大量の建築資材が雨ざらしになった。",
        localCity: "エル・ソル",
        localRegion: "ボリバル",
        conf: "C",
        infoScope: "local_news",
        references: ["SRC_TL_1000_1061", "SRC_COMMUNITY_DOSSOLES_HISTORY", "SRC_BOLIVAR_DOSSOLES_STORY"]
      },
      {
        y: 1062,
        r: ["ウルサス", "カジミエーシュ"],
        t: "第十次ウルサス＝カジミエーシュ戦争があった。後の血峰の戦いとは別の戦争で、前線や勝敗を語る話は土地ごとに食い違った。",
        publicText: "第十次ウルサス＝カジミエーシュ戦争があった。",
        flag: "tenth_ursus_kazimierz_war",
        localText: "国境要塞から轟く巨砲の重低音が空を震わせ、傷病兵を満載した軍用列車が絶え間なく駅へ滑り込んできた。非常戒厳令のもとで青年たちが次々と前線へ送られた。",
        localRegions: ["ウルサス","カジミエーシュ"],
        isCrisis: true,
        conf: "B",
        infoScope: "local_news"
      },
      {
        y: 1070,
        displayDate: "1070年頃",
        r: ["ウルサス"],
        city: "チェルノボーグ",
        t: "1070年頃、チェルノボーグの鉱山に近い区画へ研究施設が設けられた。資材を運ぶ荷車が増えた一方、何を調べているのかは口にする人ごとに違っていた。",
        publicText: "チェルノボーグに研究施設が設けられたという噂が流れた。",
        flag: "sarcophagus_discovery",
        localText: "鉱山奥の封鎖区画に軍の特科装甲車が何台も乗り付け、黒塗りの幌で覆われた巨大な機材が秘密裏に運び込まれた。坑道周辺は立入禁止となり、厳しい箝口令が敷かれた。",
        localCity: "チェルノボーグ",
        localRegion: "ウルサス",
        conf: "C",
        infoScope: "local_rumor",
        references: ["SRC_TL_EARLY", "SRC_COMMUNITY_TERRA_TIMELINE"]
      },
      {
        y: 1072,
        displayDate: "1072年頃",
        r: ["ヴィクトリア", "ウルサス", "カジミエーシュ"],
        t: "血峰の戦いの頃、最後のアスラン王が殺害され、ヴィクトリアの王権が崩れた。王都から遠い町では、誰が次に命令を出すのかを案じる声が広がった。",
        publicText: "血峰の戦いの頃、ヴィクトリアの最後のアスラン王が殺害された。",
        flag: "bloodpeak_and_victorian_crown",
        localText: "王宮から黒煙が立ち上り、アスラン王の近衛兵が門前で斬り伏せられた。諸侯が私兵を率いて市街の主要路を封鎖し、王冠なき乱世の幕が開いた。",
        localRegions: ["ヴィクトリア","ウルサス","カジミエーシュ"],
        isCrisis: true,
        conf: "B",
        infoScope: "local_rumor"
      },
      {
        y: 1074,
        r: ["ウルサス"],
        t: "1074年、ウルサスで大反乱が始まり、戦火は各地へ広がった。首都から届く報せは遅れ、帰還した兵士も軍の行方を同じようには語らなかった。",
        publicText: "1074年、ウルサスで大反乱が始まった。",
        flag: "ursus_great_rebellion",
        localText: "武装した労働者と叛乱部隊が市街の衛戍司令部へ押し寄せ、銃声と怒号の中で皇帝の肖像が広場の雪上に引きずり下ろされた。反逆の炎が夜空を焦がした。",
        localRegion: "ウルサス",
        isCrisis: true,
        conf: "B",
        infoScope: "local_news",
        references: ["SRC_TL_EARLY", "SRC_COMMUNITY_TERRA_TIMELINE"]
      },
      {
        y: 1075,
        displayDate: "1070年代",
        r: ["レム・ビリトン"],
        t: "1070年代、レム・ビリトンがヴィクトリアから独立した。ある鉱区の帳簿に刷られた国名は変わったが、坑道の交替は翌朝も始まった。",
        publicText: "1070年代、レム・ビリトンがヴィクトリアから独立した。",
        flag: "rim_billiton_independence",
        localText: "採掘プラットフォームの尖塔からヴィクトリアの社旗が切り落とされ、全社協議会の祝砲と汽笛が一斉に鳴り響いた。鉱区の労働者たちが抱き合って歓声をあげた。",
        localRegion: "レム・ビリトン",
        conf: "C",
        infoScope: "local_news"
      },
      {
        y: 1075,
        displayDate: "1075〜1076年頃",
        r: ["サルゴン"],
        t: "イバテー地方のレッドホーンで、町の人々が武装衝突に巻き込まれたという。誰が何を巡って争ったのか、宿場ごとに話が食い違っていた。",
        publicText: "イバテー地方のレッドホーンで、町の人々が武装衝突に巻き込まれたという。",
        flag: "sandsoldier_incident",
        localText: "吹き荒れる砂嵐の中、パディシャーの反乱残党と傭兵隊がオアシスの市場で激突した。乾いた砂に血が染み込み、隊商の荷車が次々と炎上した。",
        localRegion: "サルゴン",
        isCrisis: true,
        conf: "D",
        infoScope: "local_rumor",
        availabilityBasis: "WD-1の「22年前」を1097年から換算した近似。提供年表のPV 1076年表示と競合し、絶対年は未確定。",
        references: ["SRC_TL_EARLY", "SRC_COMMUNITY_TERRA_TIMELINE", "SRC_A_WALK_DUST_TIMELINE", "SRC_SARGON_WD1_WD5"]
      },
      {
        y: 1077,
        displayDate: "1077年春",
        r: ["ウルサス"],
        city: "チェルノボーグ",
        t: "1077年春、チェルノボーグの研究所が軍の襲撃を受け、研究者たちが殺された。生き残った者たちの行方は、町ではほとんど語られなかった。",
        publicText: "春、チェルノボーグの研究所で血なまぐさい事件が起きた。",
        flag: "sarcophagus_purge",
        localText: "深夜の研究所街区を帝国憲兵の特科部隊が完全包囲し、激しい銃声のあと、白衣の研究員たちが雪の上に倒れ伏した。機密資料を積んだ軍用車が夜の闇へと疾走していった。",
        localCity: "チェルノボーグ",
        localRegion: "ウルサス",
        isCrisis: true,
        availableFromMonth: 3,
        availabilityBasis: "第17章17-1の場面見出しは「Spring 1077」。3月は春を表す月次ゲーム近似で、正確な月日を示さない。1070年頃の施設設置/石棺再発見とは別段階として扱う。",
        conf: "B",
        infoScope: "sealed",
        references: ["SRC_TL_EARLY", "SRC_COMMUNITY_TERRA_TIMELINE", "SRC_URSUS_EP17_1"]
      },
      {
        y: 1077,
        displayDate: "1077年秋頃",
        r: ["リターニア"],
        t: "1077年秋頃、双子の女帝が巫王を倒し、リターニアは新体制へ移った。尖塔の鐘が鳴り止んだ後も、街角ではしばらくひそひそ話が続いた。",
        e: { p: -2 },
        flag: "leith_revolution",
        localText: "1077年秋、双子の女帝が巫王を倒し、新体制への移行が告げられた。金律の鐘が狂ったように乱打され、巫王の黒い術式を女帝の金光が切り裂いて王城を包むなか、街角では息を潜めた囁きが交わされた。",
        localRegion: "リターニア",
        isCrisis: true,
        availableFromMonth: 9,
        availabilityBasis: "秋頃とする記述を反映したゲーム内の月境界。",
        conf: "C"
      },
      {
        y: 1077,
        displayDate: "1077年頃",
        r: ["ヴィクトリア", "龍門"],
        t: "タルラがコシチェイに連れ去られたという話が、ヴィクトリアや龍門へ伝わった。見た者の話も食い違い、真相を知る者はいなかった。",
        flag: "tarra_kidnap",
        localText: "近衛局と公爵警護隊の激しい銃撃戦が夜の路地を切り裂き、黒塗りの軍用車が幼子の泣き声を乗せて疾走していった。深夜の街に厳戒のサイレンが鳴り響いた。",
        localCities: ["ロンディニウム","龍門"],
        localRegions: ["ヴィクトリア","龍門"],
        conf: "C",
        infoScope: "local_rumor"
      },
      {
        y: 1081,
        displayDate: "1081年頃",
        r: ["ウルサス"],
        t: "1081年頃、ウルサスでワーニャ大公が暗殺された。下手人もその後の政争も、市井の耳には断片しか届かなかった。",
        e: { p: -2 },
        flag: "vanya_assassination",
        localText: "大公の車列が市街の交差点で爆砕され、憲兵隊が通りを完全に封鎖して住民を広場へ駆り集めた。厳冬の広場で容疑者の割り出しと尋問が夜を徹して行われた。",
        localRegion: "ウルサス",
        isCrisis: true,
        conf: "C",
        infoScope: "local_news"
      },
      {
        y: 1085,
        displayDate: "1084〜1085年頃",
        r: ["ヴィクトリア"],
        t: "ヴィクトリアで、土地をめぐる異変があったらしい。詳しい話を知る者はおらず、通りで交わされる噂も食い違っていた。",
        flag: "victoria_leak",
        localText: "採掘区画の地表から紫色の源石ガスが噴き出し、防護服を着た公爵私兵が住民たちを問答無用で追い立てた。汚染された土壌と閉鎖線の前で怒号が飛び交った。",
        localRegion: "ヴィクトリア",
        conf: "C",
        infoScope: "local_rumor",
        availabilityBasis: "PVの1085年表示とWD-8の『13年前』からの逆算（現代年を1097年とする場合は1084年）が競合するため、1085年は年表上の近似。現行文の土地をめぐる噂がWD-8の事件に由来するとは未確認で、域内限定は隠蔽描写を受けた配信範囲のゲーム上の仮定。",
        references: ["SRC_TL_EARLY", "SRC_WD8_VICTORIA_SECRET_SCOPE"]
      },
      {
        y: 1086,
        displayDate: "1086年頃",
        r: ["ボリバル"],
        city: "ドッソレス",
        t: "1086年頃、エル・ソルはドッソレスと呼ばれるようになり、観光都市への改装が再び動き始めた。新しい看板が立つ一方、古い区画では修繕を待つ家もあった。",
        publicText: "エル・ソルがドッソレスと呼ばれ、観光都市化が再開したという知らせが広がった。",
        flag: "el_sol_renamed_dossoles",
        localText: "人工海浜のネオンが一斉に点灯し、カンデラ市長の演説とともに歓楽都市ドッソレスの看板が掲げられた。リゾート音楽が響き渡り、街は享楽の熱狂に包まれた。",
        localCity: "ドッソレス",
        localRegion: "ボリバル",
        conf: "D",
        infoScope: "local_news",
        references: ["SRC_COMMUNITY_DOSSOLES_HISTORY", "SRC_BOLIVAR_DOSSOLES_STORY"]
      },
      {
        y: 1086,
        displayDate: "1086年夏頃",
        r: ["カズデル"],
        t: "1086年夏頃、バベルと軍事委員会が袂を分かった。",
        flag: "babel_split",
        localText: "陸艦バベルが黒煙を吐いて城砦を離脱し、追撃の矢と術式が甲板に降り注ぐ中、サルカズの同胞同士が銃を向け合った。割れた王庭の絆が修復不能な亀裂を刻んだ。",
        localRegion: "カズデル",
        availableFromMonth: 6,
        availabilityBasis: "夏頃の出来事を扱うゲーム内境界。正確な発生日を示すものではない。",
        conf: "B",
        infoScope: "sealed"
      },
      {
        y: 1086,
        r: ["カズデル"],
        t: "1086年、バベルと軍事委員会の衝突が広がり、カズデルの内戦が始まった。街道を行き交う荷馬車が減り、夜は早くから戸を閉ざす家が増えた。",
        flag: "kazdel_conflict_started",
        localText: "見慣れた街角に土嚢と有刺鉄線が張り巡らされ、昨日までの隣人が異なるバッジをつけて対峙した。散発的な銃撃音が路地に響き、内戦の火蓋が切られた。",
        localRegion: "カズデル",
        isCrisis: true,
        conf: "B",
        infoScope: "local_news",
        references: ["SRC_KAZDEL_BB5"]
      },
      {
        y: 1088,
        displayDate: "1088年頃",
        r: ["カズデル"],
        t: "タルラが養父コシチェイを殺害した。",
        flag: "talulah_kills",
        localText: "凍てつく原野の古びた公爵邸から猛火と黒煙が立ち上り、吹雪の中に佇むドラコの少女の姿が目撃された。凍土の集落に不穏なざわめきが広がった。",
        localRegion: "ウルサス",
        conf: "B",
        infoScope: "sealed"
      },
      {
        y: 1091,
        displayDate: "1091年1月頃",
        r: ["カズデル"],
        t: "1091年1月頃、タルラが村を出た。",
        flag: "talulah_leave",
        localText: "雪に閉ざされた感染者集落の粗末な門が開き、長身のリーダーが仲間とともに吹雪の荒野へ踏み出した。見送る感染者たちの瞳に希望と不安が揺らいだ。",
        localRegion: "ウルサス",
        conf: "B",
        infoScope: "sealed",
      },
      {
        y: 1091,
        displayDate: "1091年冬",
        r: ["カズデル"],
        t: "1086年から続く衝突を、バベルと軍事委員会は1091年の冬に正式な戦争として宣言した。凍てつく風の中、町場でも徴発や避難の噂が絶えなくなった。",
        flag: "kazdel_war_declared",
        localText: "軍事委員会の伝令が広場で最後通牒を読み上げ、太鼓の地鳴りとともに全土の戦士たちへ総動員令が下された。武器庫の扉が開かれ、若者たちが武装していった。",
        localRegion: "カズデル",
        isCrisis: true,
        availableFromMonth: 12,
        availabilityBasis: "BB-5の「Winter 1091」を年末のゲーム内月境界に置く近似。正確な月日を示さない。",
        conf: "B",
        infoScope: "local_news",
        references: ["SRC_KAZDEL_BB5"]
      },
      {
        y: 1092,
        displayDate: "1092年",
        r: ["カズデル"],
        t: "カズデルの内戦は年を越しても終わらず、各地で兵と物資がすり潰されていった。",
        e: { p: -3 },
        flag: "kazdel_civil_war",
        localText: "焦土作戦によって畑も集落も焼き払われ、黒焦げの石積みの陰で避難民たちが乾パンを分け合った。頭上を通過する軍事委員会の飛空艇が容赦なく爆撃を繰り返した。",
        localRegion: "カズデル",
        isCrisis: true,
        availabilityBasis: "1091年冬の正式宣戦後も1092年に続く戦況を年単位で記録する。1092年冬の国境戦場は別の旗で扱い、この行は冬の戦場を指さない。",
        conf: "B",
        references: ["SRC_KAZDEL_BB5", "SRC_TL_1094"]
      },
      {
        y: 1092,
        displayDate: "1092年冬",
        r: ["カズデル"],
        t: "1092年の冬、カズデル国境の戦場で補給隊が襲われた。生き残った兵たちは、この先の冬を越す物資を案じていた。",
        flag: "kazdel_border_battle",
        localText: "猛吹雪の国境渓谷で補給船団が炎上し、雪を赤く染めて倒れる兵士たちの傍らで物資を奪い合う乱戦が展開された。極寒の風が悲鳴を掻き消していった。",
        localRegion: "カズデル",
        isCrisis: true,
        availableFromMonth: 12,
        availabilityBasis: "BB-5後半の「Winter 1092」を年末に置くゲーム上の月境界。正確な月日を示さない。",
        conf: "B",
        infoScope: "local_news",
        references: ["SRC_KAZDEL_BB5"]
      },
      {
        y: 1092,
        displayDate: "1092年頃",
        r: ["クルビア"],
        t: "クルビアに身を寄せていたテキサス家が粛清された。",
        flag: "texas_family_purge",
        localText: "土砂降りの雨の夜、テキサス家の豪邸に黒塗りのセダン群が押し寄せ、トンプソン銃の乱射と火炎瓶で名門が灰燼に帰した。街路に薬莢と血糊が散らばった。",
        localRegion: "クルビア",
        isCrisis: true,
        availabilityBasis: "1092年はIS-7の相対年と提供年表の照合による推定で、正確な発生日は未確認。",
        conf: "C",
        infoScope: "sealed",
        references: ["SRC_TEXAS_FAMILY_IS7", "SRC_TL_1094"]
      },
      {
        y: 1094,
        r: ["カズデル", "ヴィクトリア"],
        t: "テレジアが暗殺された。その後、カズデル軍事委員会がロンディニウムへ進駐した。遠く離れた街でも、これから世の中がどう転ぶのかと不安な囁きが広がった。",
        e: { p: -5 },
        flag: "thelazia_dead",
        localText: "軍事委員会の重装甲車列がロンディニウムの市門を突破し、衛戍兵を武装解除して目抜き通りを占拠した。摂政テレシスの威圧的な布告が全街区に響き渡った。",
        localCities: ["ロンディニウム"],
        localRegions: ["カズデル"],
        isCrisis: true,
        availableFromMonth: 8,
        availabilityBasis: "BB-ST-1は暗殺後の場面をSummer 1094とするため、夏の最終月をゲーム内境界とする。秋頃とする二次年表とは競合し、正確な月日は未確定。",
        conf: "B",
        references: ["SRC_TL_1094", "SRC_KAZDEL_BBST1"]
      },
      {
        y: 1096,
        displayDate: "1096年末〜1097年初頭",
        r: ["ウルサス", "龍門"],
        t: "1096年末、チェルノボーグ・龍門事変が起き、レユニオンの大規模な蜂起と衝突が始まった。街道や検問の空気が一変し、避難民の噂が各地を駆け巡った。",
        e: { p: -6 },
        flag: "chernobog_incident",
        localText: "漆黒の積乱雲が空を覆い尽くして天災サイレンが鳴り響く中、レユニオンの旗を掲げた感染者部隊が警備隊拠点を次々と急襲した。市街は炎と源石嵐の地獄と化した。",
        localCity: "チェルノボーグ",
        localRegions: ["ウルサス"],
        isCrisis: true,
        availableFromMonth: 12,
        availabilityBasis: "年末の事変開始に合わせた月境界。終了日・個別戦闘の時期は別途扱う。",
        conf: "B",
        references: ["SRC_TL_CHERNOB_WINDOW", "SRC_OFFICIAL_EP7_CHERNOB"]
      },
      {
        y: 1097,
        r: ["カジミエーシュ"],
        t: "第24回大騎士競技が開催され、ネオンの下で感染者騎士の出場が激しい議論を呼んだ。",
        e: { p: 2 },
        flag: "kazimierz_major",
        localText: "ネオン煌めく巨大アリーナの地鳴りのような大歓声の中、血騎士の長槍が電光を反射し、感染者席が熱狂した。街全体が企業騎士の熱狂と賭博に沸き立った。",
        localCity: "カヴァレリエルキ",
        localRegion: "カジミエーシュ",
        availableFromMonth: 6,
        availabilityBasis: "開催開始の月を反映したゲーム内境界。個別競技の全日程を示さない。",
        conf: "B"
      },
      {
        y: 1097,
        displayDate: "1097年夏",
        r: ["シエスタ"],
        t: "1097年夏、シエスタで火山活動が再び活発になった。祭典の熱気が冷める間もなく、水辺の暮らしを新しい移動都市へ移す計画が動き出した。",
        publicText: "1097年夏、シエスタで火山活動が再び活発になり、祭典後に移住計画が始まった。",
        flag: "siesta_disaster",
        localText: "黒曜石祭の喧騒を切り裂いて火山が噴火し、赤熱した火山弾が湖面に水柱を上げた。火山灰が降り注ぐ中、港のフェリー乗り場に逃げ惑う市民が殺到した。",
        localCity: "シエスタ",
        localRegion: "シエスタ",
        isCrisis: true,
        availableFromMonth: 7,
        availabilityBasis: "コミュニティ編纂資料は火山活動の再活発化を1097年夏以降とする。7月は夏の開始に置くゲーム内境界で、正史の発生日ではない。祭典後の移住案内は8月からとする。",
        conf: "C",
        infoScope: "local_news",
        references: ["SRC_SIESTA_TRANSITION", "SRC_COMMUNITY_SIESTA_VOLCANIC_ACTIVITY"]
      },
      {
        y: 1098,
        r: ["ヴィクトリア"],
        t: "ロンディニウムをめぐり、カズデル軍事委員会とヴィクトリア諸侯の軍勢が激突した。戦火の噂と物価の揺れが、周辺の都市や集落にも重くのしかかった。",
        e: { p: -8 },
        flag: "londinium_war",
        localText: "公爵連合軍の攻城巨砲が頭上を切り裂いて炸裂し、城壁の跳ね橋が爆砕された。軍事委員会の蒸気甲冑と自救軍が路地で血みどろの掃討戦を繰り広げ、街は硝煙に沈んだ。",
        localCity: "ロンディニウム",
        localRegion: "ヴィクトリア",
        isCrisis: true,
        availableFromMonth: 7,
        availabilityBasis: "有志年表の1098年7月開始とGO-8本文転記の10月2日終結を用いた月次近似。日単位の出現を示さない。",
        references: ["SRC_TL_LONDINIUM_WINDOW", "SRC_GO8_END_OF_WAR"],
        conf: "B"
      },
      {
        y: 1099,
        displayDate: "1099年頃",
        r: ["サルゴン", "イベリア", "クルビア", "イェラグ", "シラクーザ", "ラテラーノ"],
        t: "1099年頃、遠い国境や開拓地、海辺の町で不穏な騒ぎが続いていると旅商人が語った。宿場ごとに話の尾ひれは違い、どこまでが本当かは確かめようもなかった。",
        flag: "world_1099",
        localText: "各地の国境検問所が突然封鎖され、武装巡回兵が街道の旅人を一人ひとり銃剣で追い返した。各地の陸艦が航路を変更し、荒野の孤立が深まった。",
        localRegions: ["サルゴン","イベリア","クルビア","イェラグ","シラクーザ","ラテラーノ"],
        conf: "D"
      },
      {
        y: 1101,
        displayDate: "1101年頃",
        r: ["イベリア", "ウルサス"],
        t: "近海や北方の凍土で異変があったと、遠くから来た旅人が酒場で話していた。地名も時期も語る相手によって少しずつ食い違っていた。",
        flag: "world_1101",
        localText: "監視哨の遠見鏡の先、不気味な黒い潮流と北方の凍てつく防壁の影が静まり返っていた。連絡の途絶えた哨所から冷たい風だけが吹き抜けた。",
        localRegions: ["イベリア","ウルサス"],
        conf: "D"
      },
      {
        y: 1101,
        displayDate: "1101年冬",
        r: ["ウルサス"],
        t: "1101年冬、サンクト・グリファーブルクで学生たちの抗議と拘束が起きた。当局の短い発表と、学生たちの口から漏れる話は食い違ったまま冬が深まった。",
        flag: "katorga_incident",
        localText: "大学前広場を取り囲んだ帝国憲兵隊が棍棒と銃剣で抗議学生たちを殴り倒し、無蓋トラックへ次々と放り込んだ。凍てつく石畳に血痕が凍りついていった。",
        localCity: "サンクト・グリファーブルク",
        localRegion: "ウルサス",
        isCrisis: true,
        availableFromMonth: 12,
        availabilityBasis: "正確な会合日を特定せず、冬季の開始を置くゲーム内の月境界。",
        conf: "B",
        infoScope: "local_news",
        references: ["SRC_URSUS_PAA_SYNOPSIS"]
      },
      {
        y: 1102,
        displayDate: "1102年頃",
        r: ["炎国", "龍門"],
        t: "炎国で歳をめぐる騒ぎがあったという話が届いた。どの町に及んだのか、何が起きたのか、話す人の間でも意見が食い違っていた。",
        flag: "sui_1102",
        localText: "司歳台の天師たちが目抜き通りを固め、空を裂く異様な神鳴りとともに古い封印の石碑が真っ二つに割れた。大地を揺るがす神気と緊迫した気配が街を覆った。",
        localCities: ["龍門"],
        localRegions: ["炎国"],
        conf: "D"
      }
    ],
    false
  );

  $define(
    "HIST_SOURCE_RANGES",
    [
      { through: 1061, id: "SRC_TL_1000_1061" },
      { through: 1095, id: "SRC_TL_EARLY" },
      { through: 1097, id: "SRC_TL_MIDDLE" },
      { through: 1102, id: "SRC_TL_LATE" }
    ],
    false
  );

  $terraData.HIST.forEach(h => {
    const ref = $terraData.HIST_SOURCE_RANGES.find(x => h.y <= x.through);
    if (h.conf !== "S" && ref) h.references ||= [ref.id];
  });

  $define(
    "WORLD_PRESSURES",
    [
      {
        id: "kazdel_civil_war",
        from: 1092,
        to: 1094,
        regions: ["カズデル"],
        war: 1.55,
        dateConfidence: "B",
        sourceRefs: ["SRC_KAZDEL_BB5", "SRC_TL_1094"],
        anchor: "BB-5は1086年の内戦開始、1091年冬の正式な宣戦、1092年冬の国境戦場を区別する。1092〜1094年の年次圧力は後半の地域的な戦乱負担を表すゲーム上の近似で、内戦の開始年や全住民の直接曝露を意味しない。",
        scope:
          "1092〜1094年の年次圧力を表すゲーム用の近似。各年を通じた戦闘継続や全住民の直接被害を意味しない。"
      },
      {
        id: "chernobog_incident",
        from: 1096,
        to: 1097,
        fromMonth: 12,
        toMonth: 1,
        regions: ["ウルサス", "龍門"],
        cities: ["チェルノボーグ", "龍門"],
        war: 1.4,
        dateConfidence: "C",
        sourceRefs: ["SRC_TL_CHERNOB_WINDOW"],
        anchor: "年表資料は1096年12月に本編開始、1097年1〜4月に事変の余波を配置する。",
        scope:
          "チェルノボーグ/龍門の居住者に対する市街戦圧力を、1096年12月〜1097年1月の有効月は1.4倍、年次処理では各年の1か月分を1.033倍で近似する。1月は終結日の幅を含むゲーム内月境界。2月以降の救援・避難後の暮らしは別イベントで扱い、市外や都市不明者へ戦場曝露を推定しない。係数はゲーム用仮定。"
      },
      {
        id: "londinium_war",
        from: 1098,
        to: 1098,
        fromMonth: 7,
        toMonth: 9,
        regions: ["カズデル", "ヴィクトリア"],
        cities: ["ロンディニウム"],
        war: 1.6,
        dateConfidence: "C",
        sourceRefs: ["SRC_TL_LONDINIUM_WINDOW", "SRC_GO8_END_OF_WAR"],
        anchor: "年表は1098年7月にロンディニウム危機を置き、GO-8本文転記は10月2日を『戦争が終わった日』と記す。",
        scope:
          "ロンディニウム居住者に対する市街戦圧力を7〜9月の有効月は1.6倍、年次処理では有効月数に応じた比率（1.15倍）で近似する。年次集約は年初の生活・死亡計算に用いるゲーム上の仮定で、7月以前に戦闘情報を公開しない。10月2日の終結日は月次近似から独立表現せず、市外や1099年以後へ戦場曝露を波及させない。"
      }
    ],
    false
  );

  $define(
    "MIGRATION_ROUTES",
    {
      "炎国": [
        { n: "龍門", w: 3, fare: 8e4 },
        { n: "極東", w: 1, fare: 2.5e5 },
        { n: "サルゴン", w: 1, fare: 3.5e5 }
      ],
      "龍門": [
        { n: "炎国", w: 3, fare: 8e4 },
        { n: "極東", w: 1, fare: 2.5e5 },
        { n: "ヴィクトリア", w: 2, fare: 3e5 },
        { n: "シラクーザ", w: 1, fare: 3e5 }
      ],
      "ヴィクトリア": [
        { n: "カズデル", w: 2, fare: 2e5 },
        { n: "カジミエーシュ", w: 2, fare: 2.5e5 },
        { n: "クルビア", w: 2, fare: 3e5 },
        { n: "リターニア", w: 2, fare: 2e5 },
        { n: "ウルサス", w: 1, fare: 3.5e5 }
      ],
      "ウルサス": [
        { n: "サーミ", w: 2, fare: 2.5e5 },
        { n: "ヴィクトリア", w: 1, fare: 3.5e5 },
        { n: "カズデル", w: 1, fare: 3.5e5 },
        { n: "カジミエーシュ", w: 2, fare: 2.5e5 },
        { n: "龍門", w: 1, fare: 3.5e5 }
      ],
      "ラテラーノ": [
        { n: "シラクーザ", w: 2, fare: 2.5e5 },
        { n: "イベリア", w: 2, fare: 2e5 },
        { n: "ミノス", w: 1, fare: 3e5 }
      ],
      "カジミエーシュ": [
        { n: "ヴィクトリア", w: 2, fare: 2.5e5 },
        { n: "ウルサス", w: 2, fare: 2.5e5 },
        { n: "リターニア", w: 1, fare: 2.5e5 },
        { n: "レム・ビリトン", w: 1, fare: 4e5 }
      ],
      "クルビア": [
        { n: "レム・ビリトン", w: 3, fare: 1.5e5 },
        { n: "ヴィクトリア", w: 1, fare: 3e5 },
        { n: "カジミエーシュ", w: 1, fare: 4e5 }
      ],
      "極東": [
        { n: "炎国", w: 2, fare: 2.5e5 },
        { n: "龍門", w: 2, fare: 2.5e5 },
        { n: "サーミ", w: 1, fare: 4e5 }
      ],
      "イベリア": [
        { n: "ラテラーノ", w: 2, fare: 2e5 },
        { n: "シエスタ", w: 2, fare: 2.5e5 },
        { n: "サルゴン", w: 1, fare: 3.5e5 }
      ],
      "シラクーザ": [
        { n: "龍門", w: 1, fare: 3e5 },
        { n: "ラテラーノ", w: 2, fare: 2.5e5 },
        { n: "カズデル", w: 1, fare: 3.5e5 },
        { n: "サルゴン", w: 2, fare: 3e5 },
        { n: "ミノス", w: 1, fare: 3.5e5 }
      ],
      "サルゴン": [
        { n: "イベリア", w: 1, fare: 3.5e5 },
        { n: "シラクーザ", w: 2, fare: 3e5 },
        { n: "ミノス", w: 2, fare: 2.5e5 },
        { n: "炎国", w: 1, fare: 3.5e5 },
        { n: "ボリバル", w: 2, fare: 2e5 }
      ],
      "カズデル": [
        { n: "ヴィクトリア", w: 2, fare: 2e5 },
        { n: "ウルサス", w: 1, fare: 3.5e5 },
        { n: "シラクーザ", w: 1, fare: 3.5e5 }
      ],
      "サーミ": [
        { n: "ウルサス", w: 2, fare: 2.5e5 },
        { n: "極東", w: 1, fare: 4e5 },
        { n: "イェラグ", w: 1, fare: 3.5e5 }
      ],
      "リターニア": [
        { n: "ヴィクトリア", w: 2, fare: 2e5 },
        { n: "ウルサス", w: 1, fare: 3e5 },
        { n: "カジミエーシュ", w: 2, fare: 2.5e5 }
      ],
      "イェラグ": [
        { n: "サーミ", w: 1, fare: 3.5e5 },
        { n: "ウルサス", w: 1, fare: 4e5 },
        { n: "龍門", w: 1, fare: 4e5 }
      ],
      "レム・ビリトン": [
        { n: "クルビア", w: 3, fare: 1.5e5 },
        { n: "カジミエーシュ", w: 1, fare: 4e5 },
        { n: "サルゴン", w: 1, fare: 4e5 }
      ],
      "ボリバル": [
        { n: "サルゴン", w: 2, fare: 2e5 },
        { n: "シラクーザ", w: 1, fare: 3.5e5 },
        { n: "ミノス", w: 2, fare: 2.5e5 }
      ],
      "シエスタ": [
        { n: "イベリア", w: 2, fare: 2.5e5 },
        { n: "ミノス", w: 2, fare: 2.5e5 },
        { n: "サルゴン", w: 1, fare: 3.5e5 }
      ],
      "ミノス": [
        { n: "シエスタ", w: 2, fare: 2.5e5 },
        { n: "サルゴン", w: 2, fare: 2.5e5 },
        { n: "シラクーザ", w: 1, fare: 3.5e5 },
        { n: "ラテラーノ", w: 1, fare: 3e5 },
        { n: "ボリバル", w: 1, fare: 2.5e5 }
      ]
    },
    false
  );
});
