// model/sources/references-entries-02: construction fragment; evaluation order is declared by data/model/sources.js.
window.TERRA_DATA_BUILD.fragment(
  "model/sources",
  "model/sources/references-entries-02"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  {
    return {
      SRC_LUNGMEN_SLUM: {
        title: "国家・地域・勢力総覧 第2巻：北方・東方・中央編",
        file: "other/terra_nations_factions_complete_3volumes.pdf",
        pages: "PDF 15（第2巻 p.4）",
        kind: "ユーザー提供の二次整理資料",
        note: "龍門を経済拠点とし、スラムに貧困層・感染者が暮らす階層差を記述する。地区の相互扶助、炊き出し・配給、診療所の利用条件は示さず、イベント中の具体的な出会いはゲーム用仮定。"
      },
      SRC_URBAN_RENT_MODEL: {
        title: "移動都市の住居費と周縁区転居モデル",
        kind: "ゲーム用仮定",
        note: "家計逼迫時の住居費相談、相部屋情報、準備費2万龍門幣、同一都市の周縁区への転居、近隣互助・申し立ての選択肢は一世帯のゲームモデル。家賃額、転居費、賃貸手続、周縁区への移動が一般的/有利であること、地域の互助制度や公共窓口の実在・利用率を原作や提供資料が定めたものではない。"
      },
      SRC_LUNGMEN_AUTONOMY: {
        title: "テラ世界設定調査",
        file: "other/terra_law_culture_industry_technology_report.pdf",
        pages: "PDF 5, 7",
        kind: "ユーザー提供の二次整理資料",
        note: "龍門を炎国の内側にありながら経済的自立性・独自の治安機構を持つ都市として記述する。行政上の権限・特区の法的定義・適用年代の一次照合は未了。"
      },
      SRC_SIRACUSA_FAMILIA_CONTEXT: {
        title: "テラ世界設定調査：法・文化・産業・技術",
        file: "other/terra_law_culture_industry_technology_report.pdf",
        pages: "PDF 6–7",
        kind: "ユーザー提供の二次整理資料",
        note: "シラクーザでは公的法体系と十二ファミリーの実務的影響が並存し、司法への圧力やファミリーが関係する私立病院が治療機会に関わりうると整理する。一般住民の法的権利・個人の受診結果・制度の適用年代は確定しない。"
      },
      SRC_SIESTA_LOCALITY: {
        title: "テラ設定調査：地理・家族・勢力・地方史",
        file: "other/terra_geography_family_organizations_local_history_report.pdf",
        pages: "PDF 22, source list S30",
        kind: "ユーザー提供の二次整理資料（都市国家史は二次Wiki参照）",
        note: "PDF p.22は火山・海岸観光、災害曝露、都市移動・観光雇用の季節性をシミュレーション上の論点として整理する。独立都市国家の形成史は参考Wikiの記述として紹介されるが、現在の主権・政治的帰属は同ページから確定しない。"
      },
      SRC_VICTORIA_HILLOCK_HISTORY: {
        title: "テラ設定調査：地理・家族・勢力・地方史",
        file: "other/terra_geography_family_organizations_local_history_report.pdf",
        pages: "PDF 19, source list S29",
        kind: "ユーザー提供の二次整理資料（参照先を含む）",
        note: "二次資料はヒロック郡をターラー領から紛争・条約後にヴィクトリアへ編入された地方として紹介し、移動都市建設、繁栄と外部支配の象徴性、駐屯・文化抑圧、農業・軽工業に触れる。編入年・境界の適用期間は示されず、個人のヴィクトリア居住者がヒロック郡出身とは限らない。"
      },
      SRC_HIGASHI_CONFLICT: {
        title: "国家・地域・勢力総覧 第3巻：西方・南方・辺境編",
        file: "terra_nation_and_timeline_glossary.pdf",
        pages: "PDF 52–53（本文の印刷頁6–7）",
        kind: "ユーザー提供の二次整理資料",
        note: "極東の北朝・南朝対立、軍事と経済の政策差、1072年の血峰の戦い前後の一時停戦とその後も続く紛争を整理する。一般住民への徴兵制度・招集率・局地的な募集慣行は示さない。"
      },
      SRC_HIGASHI_SERVICE_MODEL: {
        title: "極東で軍務・兵站を選んだ一人の職業経路",
        kind: "ゲーム用仮定",
        note: "近隣募集の出現、任用の選考率、最低三年の任期見直し、50歳かつ十五年以上勤務した後の継続判断、兵站から民間輸送への移行、昇給・恩給や軍務後の補償は架空の一個人の選択経路を作る設計値。極東の一般住民に対する徴兵・採用・任期・年金制度を示さない。"
      },
      SRC_AKAFUYU_HIGASHI: {
        title: "オペレーター・アカフユの個人記録",
        url: "https://arknights.wiki.gg/wiki/Akafuyu/File",
        kind: "ゲーム内オペレーター記録の二次転記",
        note: "記録はアカフユ個人が南朝側の将軍に従い、その後北朝側の指揮官となり、敗北後に追放された経歴を記す。個人の例であり、一般住民の軍歴・任官・除隊条件を代表しない。"
      },
      SRC_HIGASHI_CULTURE: {
        title: "国家・地域・勢力総覧 第3巻：西方・南方・辺境編",
        file: "terra_nation_and_timeline_glossary.pdf",
        pages: "PDF 52（本文の印刷頁6）",
        kind: "ユーザー提供の二次整理資料",
        note: "極東には古い神社・寺院や神職・修行者と近代都市・農村が共存すると整理する。個々の住民の祭礼参加、地域行事の頻度・費用は示さない。"
      },
      SRC_HIGASHI_POP_CULTURE: {
        title: "テラ世界設定調査",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "PDF 105",
        kind: "ユーザー提供の二次整理資料",
        note: "極東に若者の漫画・ゲーム・アニメ文化があると整理する。個別の流行歌、放送網、各人の音楽嗜好は示されず、具体的な聴取場面はゲーム上の仮定。"
      },
      SRC_COLUMBIA_INSURANCE: {
        title: "テラ世界設定調査",
        file: "other/terra_law_culture_industry_technology_report.pdf",
        pages: "PDF 6, 12, 16",
        kind: "ユーザー提供の二次整理資料（Wiki等の要約を含む）",
        note: "感染者の高額な保険料、保険料を払えない場合の隔離地域・危険なフロンティア開拓への経済的圧力を整理。保険料・給付・加入率・失効条件や強制移送率の公式共通値・適用年代は示さず、地域制度の網羅性にも留保がある。"
      },
      SRC_COLUMBIA_DV1: {
        title: "Arknights: Dorothy's Vision, DV-1 story",
        url: "https://arknights.wiki.gg/wiki/DV-1/Story",
        pages: "DV-1 narrative transcript",
        kind: "ゲーム本文の転載（二次ホスト・ページ本文の直接取得は403、検索結果抜粋で照合）",
        note: "『翠玉の夢』DV-1の英語版転載本文では、開拓チームに異なる出自の人々が参加していることや、高額な保険料を払えず、隔離区画での治療も望まない感染者がいることを登場人物が説明する。この発言だけで全国一律の制度、個人の受診経路、共通の結果を確定できない。"
      },
      SRC_COLUMBIA_DV5: {
        title: "Arknights: Dorothy's Vision, DV-5 story",
        url: "https://arknights.wiki.gg/wiki/DV-5/Story",
        pages: "DV-5 narrative transcript",
        kind: "ゲーム本文の転載（二次ホスト・ページ本文の直接取得は403、検索結果抜粋で照合）",
        note: "『翠玉の夢』DV-5の英語版転載本文では、保険料を支払える感染者なら通常の生活を送れる場合があるという人物の説明と、保険料が治療の内容に見合わないという批判が語られる。これは一場面の証言であり、全国一律の制度、給付条件、加入資格、実際の受診状況は確認できない。"
      },
      SRC_LEITHANIEN_INFECTION: {
        title: "テラ世界制度の整理資料",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "105, 107",
        kind: "ユーザー提供の二次整理資料",
        note: "感染者への隔離・管理や過酷な措置が報告される。国内の全地区・全感染者に一律の収容命令が出るという根拠ではない。"
      },
      SRC_URSUS_INFECTED: {
        title: "テラ世界制度の整理資料",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "PDF 108, 115",
        kind: "ユーザー提供の二次整理資料（同文書がWiki要約等を含み一次資料全件を照合していないと明記）",
        note: "PDF 108は感染者が北方鉱山で強制労働を課されるなどの過酷な迫害例と、感染者の捜索、同国内の地域・階層差を整理する。全国一律制度や全感染者に共通する経路とはしていない。PDF 115は国家別記述が公式資料の全件・逐語照合ではなく、厳密な用途では一次資料へ戻る必要があると留保。個人の適用条件、17〜21歳の進路時期、開示状態による分岐、個別の移送、および本ゲームの居住環境による捜索範囲はゲーム仮定。"
      },
      SRC_URSUS_EP16: {
        title: "Arknights Main Theme Episode 16: Abnormal Spectrum",
        file: "sidestory/arknights_ursus_vol2_ch16_17.pdf",
        pages: "PDF 2–6, 9–10; 公式告知; 16-2検索抜粋; 16-19後日談",
        kind: "ユーザー提供の章別整理資料（二次整理）＋公式告知/ゲーム本文の二次転記",
        note: "ユーザー提供の章別整理資料PDF 4–6, 9–10は、第16章の感染者坑夫の監視・脱走・鉱区での虐殺と、第17章で続く治療センター・政治危機・鉱夫の証言を場面別に要約する。公式告知は第16章の配信を確認するが設定内容は示さない。Wiki.gg 16-2本文は403で取得できず検索結果抜粋のみ参照し、16-19の公開本文記録も二次ホストである。資料・本文が示すのはウルサス北部の特定危機と登場人物の説明であり、全域・全時代の標準制度や発生率ではない。参照URL: https://www.arknights.global/news/2816 ; https://arknights.wiki.gg/wiki/16-2/Story ; https://zeroth-directive.app/arknights/story/main_16_level_st_16-02"
      },
      SRC_URSUS_MINE_LIFE: {
        title: "第16章『背理分光』16-3『抑圧』",
        url: "https://shimadouma.github.io/astrhtml/main/chapter_16/stories/16-3.html",
        kind: "ゲーム本文の非公式ストーリーアーカイブ",
        note: "クライニ・セーヴェル中央鉱区の感染者坑夫に位置特定・爆発機能を持つ体内チップが使われ、坑夫の一部が監視隊から逃れようとする場面。ランキンがロドスのRaidianに摘出支援を求める。個別の鉱区・労働者・危機の描写であり、全国一律制度、一般的な鉱山雇用や発生率を示さない。主人公の配属、医療支援への接触、手術結果はゲーム上の仮定として分離する。"
      },
      SRC_URSUS_CHILDREN: {
        title: "ウルサス編 第1分冊 設定研究資料",
        file: "sidestory/arknights_ursus_vol1_children_wd.pdf",
        pages: "PDF 2–3, 13",
        kind: "ユーザー提供の二次整理資料",
        note: "『ウルサスの子供たち』のペテルヘイム高校生存者の現在と回想を整理する。2026年公開の『People, A People』本編とは別作品。全校生徒の名簿・全員の後日譚は確定しない。"
      },
      SRC_URSUS_PAA_OFFICIAL: {
        title: "Arknights Official Trailer - People, A People",
        pages: "公式イベントPV・2026-09",
        kind: "公式告知・PV",
        url: "https://www.youtube.com/watch?v=JuEijtqHU_o",
        note: "公式のイベント名と開催告知を確認する一次資料。PVだけから本編の詳細な事件順・個別役割を推定しない。"
      },
      SRC_URSUS_PAA_SYNOPSIS: {
        title: "Event synopsis: People, A People",
        pages: "ウェブ要約",
        kind: "コミュニティ編集の二次あらすじ",
        url: "https://arknights.wiki.gg/wiki/People%2C_A_People/Synopsis",
        note: "1101年冬の学生抗議、学生連合の会合、カトルガ区画への拘束・封鎖、1102年の審理と救出、ウルサス学生自治団の後続活動を要約する。ゲーム内本文そのものではなく、個々の場面・年代・人物関係は二次資料として扱う。主人公は既知の自治団メンバーに加えず、周辺の無名学生として仮想化する。"
      },
      SRC_URSUS_PAA_STORY_ARCHIVE: {
        title: "アークナイツ ストーリーアーカイブ『人々、我々』",
        pages: "PA-ST-1（本文・非公式ファンアーカイブ）",
        kind: "ゲーム本文の非公式転載",
        url: "https://shimadouma.github.io/astrhtml/events/act51side/stories/PA-ST-1.html",
        note: "公聴会・街頭での非暴力な連帯・学生団体内の複数路線と対立を確認する本文アーカイブ。主人公の拘束後の再接触や組織の受容を示す資料ではない。"
      },
      SRC_SAMI_CLANS: {
        title: "テラ世界制度の整理資料",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "108–109",
        kind: "ユーザー提供の二次整理資料",
        note: "サーミの部族差、雪祭司、聖樹、移動や共同体記録を整理。全居住者が同じ氏族に所属するとは示していない。"
      },
      SRC_KJERAG_LIFE: {
        title: "イェラグの信仰・交易開放の整理資料",
        file: "terra_nation_and_timeline_glossary.pdf",
        pages: "50",
        kind: "ユーザー提供の二次整理資料",
        note: "山岳地形、信仰、三家とカランド貿易、鉄道・企業開発・外部投資の関係を整理。個人の信仰、巡礼費、採用確率はゲーム仮定。"
      },
      SRC_KJERAG_RAIL: {
        title: "サイドストーリー精査レポート・イェラグ編",
        file: "terra_sidestory.pdf",
        pages: "176, 184",
        kind: "ユーザー提供の二次整理資料",
        note: "銀心湖鉄道を1100年冬と整理し、観光列車と外国使節の往来を記述。正確な開通日や全域への普及年は不明。ゲームでは1100年以降を列車描写の最早アンカーとする。"
      },
      SRC_KJERAG_INN_OFFICIAL: {
        title: "サイドストーリー「風雪一過」公式告知",
        url: "https://arknights.jp/news/254",
        kind: "公式イベント告知",
        note: "公式告知はサイドストーリー「風雪一過」と家具テーマ「イェラグの旅館」の存在を確認できる。鉄道の運行、来訪者の移動や道案内、宿の一般的な利用状況は裏付けない。"
      },
      SRC_REGIONAL_ENVIRONMENT: {
        title: "国家内の地勢・気候差の整理資料",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "87, 92",
        kind: "ユーザー提供の二次整理資料",
        note: "サルゴンの砂漠・オアシスと熱帯雨林、サーミの森林・湿地・北方山地を区別。各環境の人口比、居住抽選率、災害確率を示す資料ではない。"
      },
      SRC_MOBILE_CITY_MOBILITY: {
        title: "テラ世界設定調査：移動都市と交通・災害避難",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "PDF 104, 113",
        kind: "ユーザー提供の二次整理資料",
        note: "移動都市をプレート・区画、ライフライン、移動経路、天災予測・回避と結び付けて整理する。個別都市の経路、地域内地勢の年間変化率、移動周期は示さない。地勢遷移の確率はゲーム上の仮定。"
      },
      SRC_SIESTA_TRANSITION: {
        title: "シエスタの火山災害・都市移動化の整理資料",
        file: "terra_nation_and_timeline_glossary.pdf",
        pages: "50–51",
        kind: "ユーザー提供の二次整理資料",
        note: "1097年ごろの火山活動と都市移転の開始を整理。移住完了年や各世帯の転居日・費用・支援条件までは確定しない。個人の生活再建はゲーム仮定。"
      },
      SRC_COMMUNITY_SIESTA_VOLCANIC_ACTIVITY: {
        title: "Siesta Overview — Arknights Terra Wiki",
        url: "https://arknights.wiki.gg/wiki/Siesta/Overview",
        kind: "コミュニティ編纂の二次資料",
        note: "火山活動は1097年夏以降に再活発化し、オブシディアン・フェスティバル後に移住計画が始まり、移動都市への移行に約2年を要したと整理する。正確な発生日は確定しない。本作では7月を活動報の月次境界、8月を祭典後の移住案内の境界、1098年を生活圏ショックの最初の通年近似とする。"
      },
      SRC_SIESTA_TOURISM: {
        title: "国家・地域・勢力総覧 第3巻：西方・南方・辺境編",
        file: "terra_nation_and_timeline_glossary.pdf",
        pages: "PDF 50–51（本文の印刷頁4–5）",
        kind: "ユーザー提供の二次整理資料",
        note: "シエスタを海岸・火山・観光文化を持つ都市として整理し、オブシディアン・フェスティバルを挙げる。開催日・入場料・臨時雇用条件は示さず、1097年ごろの火山災害後は都市が移動化する。"
      },
      SRC_ELDER_COMMUNITY: {
        title: "老年期の地域参加イベント設計",
        pages: "—",
        kind: "ゲーム上の仮定",
        note: "相談・助言・地域役割の一般的な制度を資料から確認できないため、個人への一度限りの頼みごととして描写。全ての高齢者が相談役になるとは仮定しない。"
      },
      SRC_CRIME_REGIONAL: {
        title: "テラの世論・情報環境と人生の終盤／テラ世界設定調査",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "8, 115",
        kind: "ユーザー提供の二次整理資料・ゲーム仮定",
        note: "龍門では行政・警察・企業・裏社会の利害が近接し、シラクーザではファミリー等の関係網が重要と整理する。各地域の一般住民が遭う強盗・暴行の頻度、犯人像、警備員の応答率は資料から確認できない。都市街区での個別事件と重みはゲーム上の仮定。"
      },
      SRC_SIRACUSA_CROSSROADS_ST2: {
        title: "『十字路』ST-2『営業ノウハウ』",
        url: "https://shimadouma.github.io/astrhtml/events/act20mini/stories/ST-2.html",
        kind: "日本語版ゲーム内シナリオ本文の非公式アーカイブ",
        note: "登場人物が競合商品の取扱制限を設ける契約案を検討し、販売奨励金、現地ブランド、地元ワイナリーの売り込みを話す。契約案の存在と人物の説明を確認する資料であり、成立・適法性・都市全体への適用や経済効果を確定するものではない。"
      },
      SRC_SIRACUSA_CROSSROADS_ST4: {
        title: "『十字路』ST-4『とある事故』",
        url: "https://shimadouma.github.io/astrhtml/events/act20mini/stories/ST-4.html",
        kind: "日本語版ゲーム内シナリオ本文の非公式アーカイブ",
        note: "一人の配達員が発熱・体調不良でも休業違約金を避けるため同僚に配達を代わってもらい、運送管理局長が個別契約の運用を交渉する。特定の職場・契約上の個別事例で、シラクーザ全体の標準労働条件ではない。"
      },
      SRC_SIRACUSA_MARKET_MODEL: {
        title: "シラクーザの一店舗における仕入れ契約と帳簿係のゲーム用経路",
        kind: "ゲーム用仮定",
        note: "『十字路』の個別描写を参照し、シラクーザの固定都市街区にある架空の店・本人の職務選択を設計する。主人公がヌオバ・ウォルシーニに住む、契約が実際に成立した、都市法や市場全体が変化した、一般的な賃金・休業規則があるとは扱わない。"
      },
      SRC_SIRACUSA_POST_FAMILY_WORK_MODEL: {
        title: "ファミリーを離れた後の地域就労と高齢期の仕事見直し",
        kind: "ゲーム用仮定",
        note: "ファミリーとの仕事を終えた一人が近距離配達または露店の手伝いを探し、後年に仕事を続ける・移る・終える経路は創作上の個人例。求人、採用率、賃金、地区での安全、離脱後の周囲の反応をシラクーザ全体の制度や一般的な帰結として示さない。"
      },
      SRC_DEBT_COLLECTION_MODEL: {
        title: "三地域における一人ずつの契約債務と取立て経路",
        kind: "ゲーム用仮定",
        note: "龍門・シラクーザ・クルビアの架空の個人契約から、期限超過、部分返済、帳簿上の残額、取立て時の行動を記録する。一方的な追加請求は契約外の威圧として分離する。設定した貸付人、金額、通貨単位、固定返済総額、期限、取立て分岐は地域ごとの個人例であり、各地の法律、標準利率、一般的な取立て頻度、住民全体の経験を示さない。契約返済は本人または家計の集計負債を同額減らす。"
      },
      SRC_PRIVATE_LOAN_REGION_MODEL: {
        title: "龍門・シラクーザ・クルビアの個人貸付契約",
        kind: "ゲーム用仮定",
        note: "三つの架空の貸付人と借り手について、元本比で書面に記した固定返済総額、期限、部分返済を設定した。シラクーザとクルビアの単位名、共通家計台帳へ保存する数値、地域物価による額の調整はゲーム会計上の表記であり、公式通貨名・為替・国家制度・一般的な貸付慣行を示さない。本文にない利息や遅延料を契約条件へ加えない。"
      },
      SRC_INDUSTRIAL_LIFE: {
        title: "産業と住民生活の整理資料",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "110",
        kind: "ユーザー提供の二次整理資料",
        note: "ウルサスの鉱業・軍需、ヴィクトリアの重工業、クルビアの企業研究と実験倫理等を整理。個別の争議・救助・徴用・契約条件・賃金率はゲーム仮定。"
      },
      SRC_TERRA_INDUSTRY_POLICY: {
        title: "テラ世界設定調査：法・文化・産業・技術",
        file: "other/terra_law_culture_industry_technology_report.pdf",
        pages: "PDF 6–8, 13–14",
        kind: "ユーザー提供の二次整理資料",
        note: "クルビアの研究・技術・企業経済、ヴィクトリアの重工業・金融、龍門の商業・金融・物流と制度格差を要約。賃金・職種別求人・個人資格・採用確率は示さず、実装上の注意として機会と制度アクセスの分離を勧める。"
      },
      SRC_KAZDEL_LIFE: {
        title: "テラ世界設定調査",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "PDF 106",
        kind: "ユーザー提供の二次整理資料",
        note: "カズデル／サルカズについて、国家的統一の弱さ、移住・傭兵・迫害の経験、サウィンにおける祖先や死者の記憶を整理する。特定の部隊・行進・個人の参加時期は確定しない。"
      },
      SRC_KAZDEL_DISPLACEMENT_MODEL: {
        title: "カズデル内戦後の一世帯の避難・再建経路",
        kind: "ゲーム用仮定",
        note: "1092〜1094年の内戦と1094年のカズデル滅亡という年表アンカーを用いた個人シミュレーション。選択肢、運賃、成功率、住居・仕事への影響は原作が典型例や確率として定めたものではなく、住民全体の経験を表さない。"
      },
      SRC_KAZDEL_RETURN_APPEAL: {
        title: "Episode 10『Unsigned Notebook』の帰還呼びかけ",
        url: "https://arknights.wiki.gg/wiki/Episode_10/Unsigned_Notebook",
        kind: "ゲーム本文の二次転記",
        note: "カズデル軍事委員会が各地をさまようサルカズへ呼びかけ、『戦後には戻る場所がある』と述べる告知を確認する。これは委員会が発した言葉であり、帰還の安全、住居、権利、個人が実際に戻ったことを保証しない。"
      },
      SRC_KAZDEL_DIASPORA_STORY: {
        title: "第11章 11-14『対面』のサルカズ離散に関する会話",
        url: "https://arknights.wiki.gg/wiki/11-14/Story",
        kind: "ゲーム本文の二次転記",
        note: "会話の当事者は、サルカズがヴィクトリア、クルビア、リターニアなどに暮らし、帰る土地を失ってきたと語る。特定人物の発言と時代背景であり、全サルカズの移住先や避難後の生活を一律に定めない。"
      },
      SRC_KAZDEL_DISPLACED_LIFE_MODEL: {
        title: "カズデル避難後の個人・世帯の長期生活モデル",
        kind: "ゲーム用仮定",
        note: "1092〜1098年にカズデルを離れた、または仮住まいへ移った個人の、その後の住居・仕事・連絡・家族間の記憶を描く。受入制度、雇用、送金の到達、帰還の可否、同郷者の連絡網は原作の一律制度や典型例ではない。"
      },
      SRC_BOLIVAR_CIVIL_WAR: {
        title: "テラ年表編纂レポート 第I巻",
        file: "terra_nation_and_timeline_glossary.pdf",
        pages: "PDF 5",
        kind: "ユーザー提供の二次整理資料",
        note: "1048年のボリバル連合政府成立と内戦開始を整理し、後年も地域・都市・軍閥の利害が均質でないと留保する。各個人の徴用・避難・観光業への影響は資料では確定せず、ゲーム上の仮定。"
      },
      SRC_BOLIVAR_ECONOMY: {
        title: "テラ世界設定調査",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "PDF 105",
        kind: "ユーザー提供の二次整理資料",
        note: "ボリバルを多民族・移住者社会とし、農業・採鉱・傭兵産業が紛争経済と結びつき、地域や陣営で労働と安全が変わると整理。個別の市場雇用や賃金はゲーム上の仮定。"
      },
      SRC_MINOS_HERO_CULTURE: {
        title: "テラ世界設定調査",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "PDF 104–105",
        kind: "ユーザー提供の二次整理資料",
        note: "ミノスの英雄崇拝・競技祭・舞台芸術と、欠点を抱えながら公共善に寄与する英雄像を整理する。各住民の信仰や祭りへの参加、準備作業の実態は示さない。"
      },
      SRC_MINOS_INFECTION_STORY: {
        title: "ミノス関連物語の要約（コミュニティWiki、原題：Medjehtiqedti Bound）",
        url: "https://arknights.wiki.gg/wiki/Medjehtiqedti_Bound/Synopsis",
        pages: "Athenius clinic and Xanthos/Lykeion scenes",
        kind: "コミュニティWikiによる作中イベント記録（二次転記）",
        note: "Wiki synopsis は物語の時点を1100年と記し、アテヌスでロドスのレナが感染者向け診療体制を整え始めた場面と、重症の未登録患者が弟子を通じて薬を得る経緯を要約する。年と場面の内容はいずれも二次転記に基づく作中アンカーで、一次資料での独立照合は未了。特定の都市・人物の話であり、全ミノスの法、住民態度、医療資格や継続期間を示さない。公式イベント告知（日本版 arknights.jp/news/3712、Global arknights.global/news/3714）は作品名と開催情報の確認に使い、会話内容と分離する。"
      },
      SRC_SR_RHODES_WORK: {
        title: "『我が眼に映るまま』・ロドスの日常業務",
        url: "https://shimadouma.github.io/astrhtml/events/act8mini/stories/ST-2.html",
        kind: "日本語版ゲーム本文の非公式閲覧",
        note: "艦内の人員配置、日報、戦術・業務管理が言及される。採用区分・待遇と選考確率は出ていない。"
      },
      SRC_SR_RHODES_FIELD: {
        title: "『急転直下』4-1『フリーハグ』",
        url: "https://shimadouma.github.io/astrhtml/main/chapter_04/stories/4-1.html",
        kind: "日本語版ゲーム本文の非公式閲覧",
        note: "偵察・救援と撤退の指示、隊員に要求される判断。すべての職員が前線へ出るわけではない。"
      },
      SRC_SR_REUNION_SPLIT: {
        title: "『怒号光明』M8-4『うたかたの「意志」』",
        url: "https://shimadouma.github.io/astrhtml/main/chapter_08/stories/M8-4.html",
        kind: "日本語版ゲーム本文の非公式閲覧",
        note: "遊撃隊は感染者保護と武力行使の優先順位が組織内で一様でないことを示す。"
      }
    };
  }
});
