// model/sources/references-entries-01: construction fragment; evaluation order is declared by data/model/sources.js.
window.TERRA_DATA_BUILD.fragment(
  "model/sources",
  "model/sources/references-entries-01"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  {
    return {
      SRC_LIFE_ENDING_CANON: {
        title: "『ウォルモンドの薄暮』日本語版 TW-S-1",
        url: "https://shimadouma.github.io/astrhtml/events/act11d0/stories/TW-S-1.html",
        kind: "日本語ゲーム本文を表示する非公式アーカイブ",
        note: "避難、医療の不足、物資欠乏、地域外の支援、感染者難民。個人の死因分布や救命確率の根拠ではない。"
      },
      SRC_LIFE_ENDING_LW03: {
        title: "テラ生活史・社会制度・人生形成 人物資料横断編 第III巻",
        file: "terra_lifeways_volume03.pdf",
        pages: "PDF 4–12",
        kind: "ユーザー提供の二次研究資料",
        note: "ススーロ、フロストリーフ、ジェイ、オーキッドの事例。医療の人手、費用、識字、死別。数値はここから推定しない。"
      },
      SRC_LIFE_ENDING_LW02: {
        title: "テラ生活史・社会制度・人生形成 人物資料横断編 第II巻",
        file: "terra_lifeways_volume02.pdf",
        pages: "PDF 4–9",
        kind: "ユーザー提供の二次研究資料",
        note: "グムの心身の回復、ポデンコの支援、ムースの家族療養と職業復帰。"
      },
      SRC_BOLIVAR_LIFEWAYS_II: {
        title: "テラ生活史・社会制度・人生形成 人物資料横断編 第II巻",
        file: "terra_lifeways_volume02.pdf",
        pages: "PDF 5–6",
        kind: "ユーザー提供の二次研究資料",
        note: "ポデンコ個人の証言・経歴として、ボリバル辺境の高原集落、作物転換と収穫の不確実性、花を育てること、植物を扱う技能が記録される。ロドス療養庭園の職務は個別事例で、ボリバル農村全体の標準的な農法・市場・雇用を示さない。"
      },
      SRC_BOLIVAR_UPLAND_LIFE_MODEL: {
        title: "ボリバル小規模定住地の作付けと家計をめぐる架空の個人経路",
        kind: "ゲーム用仮定",
        note: "主人公・家族の畑・作付け判断・後年の聞き取りは架空の個別事例。作物別収量、価格、農地権利、徴収主体、地域全体の慣習、就労・移動の成功は確定しない。食料確保、販売目的の試行、花を育てる個人的な価値を別々に選べるようにする。"
      },
      SRC_LIFE_ENDING_GAME: {
        title: "死亡・救急・回復システム v2",
        kind: "ゲーム設計上の仮説",
        note: "疾病分類・発生率・危機の段階・救命・職場危険を実装するための仮定。正史や医学的診断基準ではない。"
      },
      SRC_TERRA_FAUNA: {
        title: "テラ生物・世界観用語集",
        file: "other/arknights_terra_fauna_glossary.pdf",
        pages: "PDF 3–5",
        kind: "ユーザー提供の整理資料",
        note: "PDF p.3–5は雲獣（炎国でペットとして言及）、鼷獣（小型・夜行性でペットから野生化する例）、オリジムシ（身近でペット飼育例がある一方、野生個体は汚染地等に生息し忌避もされる）を区別する。価格、飼育方法、流通、飼育場や馴化個体の存在、個々の販売個体の感染状態までは確定しない。"
      },
      SRC_VANILLA_PET_SLUG: {
        title: "Vanilla: Originium Slugs and Hops",
        url: "https://arknights.wiki.gg/wiki/Vanilla/Operator_Record",
        pages: "Vanillaのオペレーター記録（作中会話）",
        kind: "コミュニティWiki上の作中記録転記（二次掲載）",
        note: "Vanillaが飼育中のKuroを家庭で世話する描写と、通常のオリジムシは殻に源石を含むが自然に鉱石病へ感染した例は知られていないという人物の説明がある。同じ記録では、源石廃棄物が放置された洞窟の個体が変異・大型化した事例も描かれる。特定の作中説明であり、全個体・全環境の安全性、一般家庭での流通や譲渡慣行は確定しない。"
      },
      SRC_ORI_JP_OVERVIEW_2026: {
        title: "アークナイツ日本語公式：源石・感染者",
        url: "https://amiyaapprentice.arknights.jp/",
        kind: "日本語公式サイト／世界観",
        note: "源石が鉱石病の原因であり、天災が源石を残すこと、感染者が死亡した際の感染リスクを記述。生存感染者との通常の接触だけで感染するとの説明ではない。"
      },
      SRC_ORI_MINT_RECORD: {
        title: "ミント：プロフィール・第四資料",
        url: "https://closure.wiki/ja/operators/mint",
        kind: "日本語版ゲームテキストの非公式転載",
        note: "天災後の地質調査中に足元が崩れ、事故によって感染。準備していても事故による曝露はあり得る。"
      },
      SRC_ORI_HUMUS_RECORD: {
        title: "ヒューマス：オペレーター記録",
        url: "https://closure.wiki/ja/operators/humus",
        kind: "日本語版ゲームテキストの非公式転載",
        note: "源石粉塵で汚染された鋼材の回収作業で感染し、廃棄材料を利用した防護装備を制作。感染者を採用したことではなく汚染資材への曝露が経路。"
      },
      SRC_ORI_CATHERINE_RECORD: {
        title: "キャサリン：健康診断・工場労働",
        url: "https://closure.wiki/ja/operators/catherine",
        kind: "日本語版ゲームテキストの非公式転載",
        note: "本人はロンディニウム事件で感染。指導した工場は相対的に感染率が低く、安全管理による差が示唆される。特定工場の調査で全国の発生率ではない。"
      },
      SRC_ORI_PURESTREAM_RECORD: {
        title: "セイリュウ：健康診断",
        url: "https://closure.wiki/ja/operators/purestream",
        kind: "日本語版ゲームテキストの非公式転載",
        note: "河道清掃に伴う汚染物への接触があるが非感染者。保護と定期検査が推奨される。エーギル全員が耐性を持つ根拠にはならない。"
      },
      SRC_ORI_MINT_PROFILE: {
        title: "ミント：フィールドワークと検査",
        url: "https://closure.wiki/ja/operators/mint",
        kind: "日本語版ゲームテキストの非公式転載",
        note: "地質調査と防護措置、定期検査の必要性を示す。"
      },
      SRC_ORI_TUYE_RECORD: {
        title: "トゥイエ：砂嵐による輸送事故",
        url: "https://wiki3.jp/arknightsjp/page/4542",
        kind: "日本語版ゲームテキストの非公式転載",
        note: "砂嵐事故で感染。大量の源石成分への短時間接触と早期治療による状態安定が記される。"
      },
      SRC_ORI_SIESTA_RECORD: {
        title: "ブライオファイタ：シエスタ火山噴火後の診療",
        url: "https://closure.wiki/ja/operators/bryophyta",
        kind: "日本語版ゲームテキストの非公式転載",
        note: "シエスタ火山噴火後、セイロンの紹介でロドスの治療へ。噴火が源石粉塵を必ず出すとは断定しない。"
      },
      SRC_ORI_FIELD_RECORD: {
        title: "タラクサカム・ウィンドスクート：防護と検査",
        url: "https://closure.wiki/ja/operators/taraxacum",
        kind: "日本語版ゲームテキストの非公式転載",
        note: "業務上危険区域へ赴き、防護意識があっても定期検査が必要な例。ウィンドスクートの記録には源石防護研修の描写あり。"
      },
      SRC_ORI_WINDSCOOT_RECORD: {
        title: "ウィンドスクート：源石防護研修",
        url: "https://closure.wiki/ja/operators/windscoot",
        kind: "日本語版ゲームテキストの非公式転載",
        note: "防護研修への参加と、同僚へ知識を伝えたいとの本人の意向を記載。研修による全国共通の感染率低下を裏付けない。"
      },
      SRC_ORI_GAME_MODEL_V3: {
        title: "鉱石病曝露・診断分離モデル v3",
        kind: "ゲーム設計上の仮説",
        note: "年間曝露機会、状況別の感染抽選、曝露経路推定、検査への到達、予防の効果はすべてゲーム仮定。種族の固定的な生物学的感染率を設定しない。"
      },
      SRC_ORIPATHY_EXPOSURE: {
        title: "アークナイツ設定研究資料：サルカズ編・第二巻",
        file: "sidestory/arknights_sarkaz_dossier_vol2.pdf",
        pages: "PDF 9",
        kind: "ユーザー提供のシナリオ調査資料（二次整理）",
        note: "BB-6本文の記録として、源石粉塵の吸入、源石に富む環境への曝露、活性源石による皮膚損傷が感染可能性の調査対象として列挙される。個別住民の自然発症率や親からの感染は示さない。家族の遺体・結晶化物への接触は、源石物質への接触として扱うゲーム上の仮定。"
      },
      SRC_ORIPATHY_OFFICIAL_OVERVIEW: {
        title: "Arknights Official World Overview",
        url: "https://arknights.yo-star.com/",
        pages: "Infected",
        kind: "公式サイトの世界設定概要",
        note: "感染者の鉱石病は理論上致死率100%で、感染者の死亡後にも感染の危険が残ると説明する。死後に危険が残ることの根拠として用いる。具体的な粉塵・遺体の処理手順や二次感染の経路は説明していない。"
      },
      SRC_TERRA_SOCIAL_ATTITUDES: {
        title: "テラの世論・情報環境と人生の終盤",
        file: "other/terra_public_opinion_end_of_life_detailed_report.pdf",
        pages: "PDF 3–8",
        kind: "ユーザー提供の整理資料",
        note: "情報・世論への接触と行動は、地域、立場、経験、制度、資源によって異なると整理する。サルカズに関する歴史的記憶・流浪・迫害を個人の性格や全住民の一律な態度へ還元しない。"
      },
      SRC_FINAL_WISHES_MODEL: {
        title: "成人した子へ残す一人の希望メモ",
        kind: "ゲーム用仮定",
        note: "高齢者が成人した子へ仕事道具と帳面の扱いを家族で相談するよう手紙に残す個人例。これは本人の希望を記録する機能であり、法的な遺言、相続権、財産移転、死後の実施を認定しない。テラ共通の相続制度は想定しない。"
      },
      SRC_TERRA_FAMILY: {
        title: "テラ設定調査：地理・家族・勢力・地方史",
        file: "other/terra_geography_family_organizations_local_history_report.pdf",
        pages: "PDF 14–15, 18",
        kind: "ユーザー提供の二次整理資料",
        note: "テラ全体に共通する婚姻法・養子制度・相続法は確認できず、親族・氏族・ファミリー・共同体や避難によって関係と家族機能が異なると整理する。レム・ビリトンの家族共同体、サーミの氏族、シラクーザのファミリーは異なる形の例。独立年齢や扶養期限の共通値・各個人の婚姻制度・縁談慣行・きょうだい出生率は示さない。"
      },
      SRC_TERRA_HOUSING_CONTEXT: {
        title: "テラ設定調査：地理・家族・勢力・地方史",
        file: "other/terra_geography_family_organizations_local_history_report.pdf",
        pages: "PDF 8",
        kind: "ユーザー提供の二次整理資料",
        note: "龍門では市民区域と周縁地区で住宅密度や治安等の生活条件が異なり、感染者のスラム集住に触れる。世界共通の賃貸契約・家賃・住居費水準は示さない。住居費の帳簿区分は資料記述の指標化ではなく、別世帯の支出可視化に使うゲーム仮定。"
      },
      SRC_ORIPATHY_SOCIAL: {
        title: "テラの世論・情報環境と人生の終盤",
        file: "other/terra_public_opinion_end_of_life_detailed_report.pdf",
        pages: "PDF 7–10, 21",
        kind: "ユーザー提供の整理資料",
        note: "鉱石病の医学的状態と社会的分類、制度・地域・情報アクセスの差を区別する。社会圧力の数値や国全体の一律な寛容度は資料の確定値ではなく、個人の暮らしへ接続する値はゲーム上の仮定。"
      },
      SRC_VICTORIA_INFECTED: {
        title: "テラの世論・情報環境と人生の終盤",
        file: "other/terra_public_opinion_end_of_life_detailed_report.pdf",
        pages: "PDF 5, references PDF 19 [10], [16]",
        kind: "ユーザー提供の二次整理資料（有志Wikiを参照）",
        note: "資料はヴィクトリアの感染者が工業汚染と隔離政策の二重負担を負うと要約し、[10] Infected と [16] Victoria を参照する。ページ19にはこれらの参照先を有志Wikiとして記載。公式法令・適用年代・地域別実施・個人への適用は独立確認されていない。"
      },
      SRC_TERRA_LIFECOURSE: {
        title: "テラの世論・情報環境と人生の終盤",
        file: "other/terra_public_opinion_end_of_life_detailed_report.pdf",
        pages: "PDF 11–12",
        kind: "ユーザー提供の整理資料",
        note: "PDF p.11–12は一般住民・種族ごとの確定平均寿命や老化曲線が確認できないこと、種族差・個体差を一律化しないことを整理する。動物の種別寿命・飼育動物の寿命は扱っていない。"
      },
      SRC_TERRA_SPECIES_ATLAS: {
        title: "テラ種族設定・長命個体の注意事項",
        file: "other/arknights_terra_species_report.pdf",
        pages: "PDF 7, 22, 27",
        kind: "ユーザー提供の二次整理資料",
        note: "サヴラに長命の個体例がある一方、種族全体の寿命を固定しないと明記。資料はWiki.gg等を再整理した二次資料であり、個体の逸話を全員の標準寿命へ一般化しない。"
      },
      SRC_TERRA_INFO_NETWORKS: {
        title: "アークナイツ世界観調査：ストーリー横断索引・世論／情報環境",
        file: "other/arknights_story_cross_index_public_opinion_report.pdf",
        pages: "PDF 12–15",
        kind: "ユーザー提供の二次整理資料",
        note: "情報経路の例として家族・親族の伝聞、訪問、移動経路、ラジオ、口承、組織内連絡を挙げ、距離・通信設備・費用・身分・検閲で到達時期や信頼性が変わると分析する。全地域共通の通信網や普及率を示す公式統計ではない。"
      },
      SRC_SARGON_ECOLOGY: {
        title: "テラ種族・地理・文化・人口等の整理資料",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "56, 75",
        kind: "ユーザー提供の二次整理資料",
        note: "サルゴンの地域生業に狩猟・採集・運搬・牧畜等が関わる整理。砂獣の種特性そのものの出典ではない。"
      },
      SRC_SARGON_WATER: {
        title: "テラ設定調査：地理・家族・勢力・地方史",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "PDF 75",
        kind: "ユーザー提供の二次整理資料",
        note: "サルゴン西部の水源・灌漑権、部族や領主による地域支配を扱う。個別の水配分協議、盟約の儀礼、証人慣行や参加条件は示さない。"
      },
      SRC_SARGON_WATER_LIFE_MODEL: {
        title: "乾燥地の水利用記録・設備手入れをめぐる個人生活経路",
        kind: "ゲーム用仮定",
        note: "資料は西サルゴンの河川流域・季節水量・オアシス・灌漑権・部族と領主の支配を要点として挙げるが、特定集落の水量・配分・会合・修理役・参加資格は定めない。個人が家ごとの要望を記録し、後年に聞き取り/手入れを再検討する経路は仮想事例。水利権を付与したり地域の配分や合意を変えたとは扱わない。"
      },
      SRC_SARGON_WD1_WD5: {
        title: "ボリバル・サルゴン編ストーリー精査レポート",
        file: "sidestory/arknights_bolivar_sargon_dossier.pdf",
        pages: "PDF 3, 5–6; 補遺A PDF 6–7",
        url: "https://shimadouma.github.io/astrhtml/events/act18d0/stories/WD-1.html",
        kind: "ユーザー提供の二次整理資料（正史本文シーン索引付き）",
        note: "『遺塵の道を』WD-1のイバト地区で複数の傭兵隊・企業/軍部の利害・パーディシャーの影響が絡む個別事件、WD-5の移動バザールタウンと沁礁闇市につながるトランスポーター等を整理。サルゴン全域の標準雇用制度、一般的な契約条件・報酬・採用機会は示さない。"
      },
      SRC_SARGON_CONTRACT_LIFE_MODEL: {
        title: "サルゴン中部の短期警護請負から後年の仕事選択へ至る個人経路",
        kind: "ゲーム用仮定",
        note: "WD-1/WD-5の限定された場面をもとにした架空の個人経路。移動バザール周辺で仕事を探すこと、契約成立率、費用/報酬、負担、別の短期契約やトランスポーターの仕事を後年に選べることはすべて仮定。固有の傭兵団への加入、安定収入、次の仕事の保証、地域全体の労働制度を意味しない。"
      },
      SRC_SAND_BEAST: {
        title: "Arknights Terra Wiki: Mutant Sand Beast",
        url: "https://arknights.wiki.gg/wiki/Mutant_Sand_Beast",
        pages: "Sand Beast の説明",
        kind: "コミュニティWiki（二次資料）",
        note: "砂獣は砂漠・ハマダに住む小型雑食性・夜行性の生物で、サルゴンの人々が狩猟獣として馴らすことがあると整理。家庭での伴侶飼育、価格、維持費は確認できず、ゲーム上の仮定として扱う。"
      },
      SRC_INFO_ACCESS: {
        title: "テラ種族・地理・文化・人口等の整理資料",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "4–5",
        kind: "ユーザー提供の二次整理資料",
        note: "情報接触を地域・立場・費用・人間関係・危険で分ける設計上の参考。通信率の数値根拠ではない。公式一次資料として扱わない。"
      },
      SRC_LEITHANIEN_ARTS: {
        title: "テラ種族・地理・文化・人口等の整理資料",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "110",
        kind: "ユーザー提供の二次整理資料",
        note: "産業比較表がリターニアのアーツ機器・音楽技術に、アーツ適性・専門教育・貴族による知識独占が関係すると整理。個別のピアノ、価格、サロンの慣行は確認できず、イベントの具体的な購入費・後援結果はゲーム用仮定。"
      },
      SRC_LEITHANIEN_STORY_ARCHIVE: {
        title: "『ツヴィリングトゥルムの黄金』ZT-ST-1 前奏",
        url: "https://shimadouma.github.io/astrhtml/events/act29side/stories/ZT-ST-1.html",
        kind: "日本語版シナリオ本文の非公式転載",
        note: "特定の選帝侯の高塔、貴族の音楽会・侍従、地域の雑貨店、天災と地方の停滞を描く。一般的な貴族家の雇用や音楽会の招待条件を示さない。"
      },
      SRC_LEITHANIEN_ARTS_ARCHIVE: {
        title: "Leizi operator file: Originium Arts Overview",
        url: "https://closure.wiki/operators/leizi",
        kind: "公式ゲーム内人物資料の転載（二次ホスト）",
        note: "人物資料はリターニアの一部のアーツ流派で動きを使い、理論と実践の継承を図ると説明する。全住民の教育機会や音楽会への参加、雇用・賃金・後援慣行を定めない。"
      },
      SRC_LEITHANIEN_LOCAL_WORK_MODEL: {
        title: "リターニアの音楽会・文化労働への個人アクセス",
        kind: "ゲーム用仮定",
        note: "提供資料はアーツ機器・音楽技術の利用が適性・教育・購買力で分かれると整理する。ZT-ST-1はホッホベルク家の高塔、侍従、貴族の音楽会、地域の雑貨店と天災の影響を描き、Leizi資料は一部アーツの伝承方法に触れるが、一般的な招待・雇用慣行、賃金、継続後援を定めない。本経路の特定の招待、連絡、日雇い、条件確認、継続・退出は局所的なゲーム仮定であり、既存資料にある人物・家・制度と同一視しない。"
      },
      SRC_LEITHANIEN_ZT6_STORY: {
        title: "サイドストーリー『ツヴィリングトゥルムの黄金』ZT-6 本文",
        url: "https://www.gacha.gg/arknights/story/act29side-zt-6",
        kind: "ゲーム内シナリオの英語転載（二次ホスト）",
        note: "劇場の一つの合奏への参加を貴族に限る発言を確認できる。リターニアの全ての催しや教育・家督・就労条件を示すものではない。"
      },
      SRC_LEITHANIEN_ZT10_STORY: {
        title: "サイドストーリー『ツヴィリングトゥルムの黄金』ZT-10 本文",
        url: "https://www.gacha.gg/arknights/story/act29side-zt-10",
        kind: "ゲーム内シナリオの英語転載（二次ホスト）",
        note: "称号を持ちながら憲兵隊へ加わり、貴族に逆らって市民を守ったロリス・ボルディンの回想、双子の女帝と旧貴族の緊張を確認できる。特定人物と事件の描写であり、一般的な政治参加資格・行政制度・貴族家の役割は定めない。"
      },
      SRC_LEITHANIEN_LOCAL_POLITICAL_MODEL: {
        title: "リターニアの地区政治参加・陳情準備",
        kind: "ゲーム用仮定",
        note: "1077年の巫王失脚後を舞台に、地区の要望を記録して領主側の役人へ届けようとする無名住民の小さな活動を描く。ZT-10の政治的緊張と称号を持つ一人物の市民保護を参照するが、会合・要望書・役人への接触・参加資格・返答・制度への影響は個別の創作であり、選挙権や全国的な自治制度を設定しない。"
      },
      SRC_LEITHANIEN_NOBLE_HOUSEHOLD_MODEL: {
        title: "リターニア貴族・アーツ名家の家内役割",
        kind: "ゲーム用仮定",
        note: "ユーザー提供の産業比較資料とZT-6・ZT-10本文にある限定的な貴族・アーツ・称号の描写を参照する。特定の貴族・アーツ名家に生まれた主人公が帳簿・書簡または楽譜・器具の目録を手伝う生活経路は創作であり、資産、アーツ適性、家督・相続資格、政治権限、家族全員の同意を自動付与しない。"
      },
      SRC_LATERANO_CIVIC: {
        title: "テラ住民生活・世界制度の整理資料",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "7, 16, 27, 31, 106",
        kind: "ユーザー提供の二次整理資料",
        note: "市民向け医療・教育・保険、感染した市民の追放後も市民権を保持し条件付きで手当・薬を受けるとの整理、銃器の登録・訓練・取得儀礼を記載。個人の資格判定、域外給付の条件・額、個別の通達や例外は未確認。給付の独立した作中根拠は未照合。"
      },
      SRC_LATERANO_ARENE: {
        title: "アレーンのオペレーター資料（原語版・資料1）",
        url: "https://closure.wiki/operators/arene",
        pages: "Operator Profile; Archive File 1",
        kind: "公式ゲーム内人物資料の転載（二次ホスト）",
        note: "オペレーター記録は、感染したラテラーノ市民が市民権上の権利を保つ一方、少数の特別な場合を除き通常は領内に留まれず、アレーン自身も感染後に追放されたと記す。原ゲーム内資料の転載を確認。例外基準、全時代への適用、移送過程・手段は示さない。"
      },
      SRC_LATERANO_FAMILY_LAW: {
        title: "テラ設定調査：地理・家族・勢力・地方史",
        file: "other/terra_geography_family_organizations_local_history_report.pdf",
        pages: "PDF 14–15, 16–18, 28",
        kind: "ユーザー提供の二次整理資料",
        note: "テラ共通の婚姻・親権・相続制度は確認できず、ラテラーノ固有のノタリアルホールが契約・資産管理・親権・死亡後の遺品手続きに関わると整理。個人の資格・申請要件・手数料・結果は確定できない。"
      },
      SRC_LATERANO_NOTARIAL_HALL_OFFICIAL: {
        title: "サイドストーリー「吾れ先導者たらん」公式告知",
        url: "https://arknights.jp/news/272",
        kind: "公式イベント告知",
        note: "公式告知はサイドストーリーと家具テーマ「公証人役場休憩室」の存在を確認できる。窓口の実務、必要書類、一般的な利用頻度を裏付けない。"
      },
      SRC_LATERANO_RELIGION: {
        title: "国家・地域・勢力総覧 第2巻：北方・東方・中央編",
        file: "terra_nation_and_timeline_glossary.pdf",
        pages: "PDF 44",
        kind: "ユーザー提供の二次整理資料",
        note: "ラテラーノ教会を中心とする宗教政治体で、教皇庁や修道院などの宗教機関が教育・福祉等にも関わると整理する。個人への聖職勧誘、聖職者の採用条件・教育期間・報酬は示さない。"
      },
      SRC_IBERIA_INFORMATION: {
        title: "国家・地域・勢力総覧 第3巻：西方・南方・辺境編",
        file: "terra_nation_and_timeline_glossary.pdf",
        pages: "PDF 49–50（本文の印刷頁3–4）",
        kind: "ユーザー提供の二次整理資料",
        note: "大いなる静謐で海港・沿岸地域・国家機能に被害が出た後、異端審問と灯台網が防衛・秩序維持を担う。海の情報には分散・秘匿があり、住民ごとの伝達経路や理解の程度は一様でない。各個人が得る知らせ・市場の品・頻度はゲーム上の仮定。"
      },
      SRC_IBERIA_RECOVERY: {
        title: "テラの世論・情報環境と人生の終盤",
        file: "terra_species_geography_cluture_population_etc.pdf",
        pages: "PDF 16",
        kind: "ユーザー提供の二次整理資料",
        note: "大いなる静謐後のイベリアで難民・飢饉・インフラ喪失・宗教的統制を整理する。個人の被災、配給量、復旧工事の賃金や時期は示さず、イベント内の具体的な生活条件はゲーム上の仮定。"
      },
      SRC_LEITHANIEN_HISTORY: {
        title: "国家・地域・勢力総覧 第3巻：西方・南方・辺境編",
        file: "terra_nation_and_timeline_glossary.pdf",
        pages: "PDF 49（本文の印刷頁3）",
        kind: "ユーザー提供の二次整理資料",
        note: "リターニアでは音楽・アーツ・古典研究が高度で、アーツへの適性・教育が社会的地位に結びつきやすい。巫王期には検閲・実験・アーツ能力を理由とする差別があった。個人の教育歴、練習機会、現代の地域差は資料だけでは確定しない。"
      },
      SRC_YAN_GOVERNMENT: {
        title: "国家・地域・勢力総覧 第2巻：北方・東方・中央編",
        file: "terra_nation_and_timeline_glossary.pdf",
        pages: "PDF 40（本文の印刷頁4）",
        kind: "ユーザー提供の二次整理資料",
        note: "炎国の真龍皇帝・中央官僚制・機関と地域差、礼部等の国家儀礼、および歳／歳獣の国史上の位置を整理する。個人の祖先祭礼、官吏採用試験、歳の力を目撃する頻度は記載されていない。"
      },
      SRC_LUNGMEN_SECURITY: {
        title: "国家・地域・勢力総覧 第2巻：北方・東方・中央編",
        file: "terra_nation_and_timeline_glossary.pdf",
        pages: "PDF 40（本文の印刷頁4）",
        kind: "ユーザー提供の二次整理資料",
        note: "龍門近衛局を警察・軍に似た複数部隊を持つ組織と整理する。一般採用試験、応募条件、給与、合格率は記載されていない。"
      }
    };
  }
});
