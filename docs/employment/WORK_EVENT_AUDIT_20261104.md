# テラ就労イベント横断棚卸し：GAME_DATA.EV 全量を対象とする機械抽出

- 作成日：2026-11-04
- 対象ブランチ：`fix/historical-event-scope-and-delivery`、`EVENT_CATALOG.md`（現行ゲームの生成物）。プログラム実装変更なし。
- **機械読取可能な正本**：[WORK_EVENT_INVENTORY_20261104.json](WORK_EVENT_INVENTORY_20261104.json)（83職種、全2,566イベントの分類キー、職業関連候補1,037件の出典・国・ジャンル・効果キー・枝数・本文冒頭、除外ID1,529件）。
- 推奨モデル：[TERRA_19_REGION_OCCUPATION_MODEL_20261104.md](TERRA_19_REGION_OCCUPATION_MODEL_20261104.md)。

## 1. 全体の数と分類規則

ゲームが生成したイベント全文カタログを **2,566件すべて走査**した。選択肢は3,267件、結果枝4,125件（`EVENT_CATALOG.md`の生成メタデータ）。抽出上、次の五つの層は重複しない。

| 層 | 件数 | 意味・受入範囲 |
|---|---:|---|
| A：職業に直接関わる効果 | 175 | 結果枝に`job`、`workContractAction`、雇用の`lifeAffiliation`等の実行可能効果が記述されている。**採用・離職・職務変更の優先検査対象** |
| B：職業専用経路・職務語を含むID | 262 | 地域専門職・ロドス/BSW/ライン生命・職業一般の専用実装や職業関連ID。職業変更しない日常・就職検討も含む |
| C：労働・経済ジャンル | 526 | カタログの初期分類が`労働・経済`の周辺イベント。家庭経済・投資・金銭貸借・教育費だけの事象も混ざる |
| D：職務語のみ一致 | 74 | 既存タグから外れた「勤務」「求人」「退職」「同僚」等の文面候補。文脈校閲が必要 |
| N：今回の自動抽出対象外 | 1529 | 職業と無関係と断定したリストではなく、機械抽出に該当しないIDの一覧 |
| **計** | **2566** | すべてのイベントIDをJSONへ保持し、分類の増補・再現が可能 |

**注意**：この分類は**職業関連のレビュー候補を機械的に拾った結果**。Aも教育・死亡・転居などの複合結果が含まれる。B〜Dには誤検出があり、Nにも会話の一部で仕事に触れる行が存在しうる。特に動的JavaScript関数から実行時に返す効果や、コード側で直接書き換える職業は静的なJSON効果だけで網羅できない。

### 直結する効果契約

- `job`：現在の職業ID。失職は`0`、仕事以外の状態を独立保存する必要あり。
- `lifeAffiliation` / `lifeAffiliations`：雇用主、配属、独立契約・組織への参加。所属のみから正規雇用を推定しない。
- `workContractAction`：契約閲覧・賃金交渉・勤務時間・配置調整。採用そのものの正本ではない。
- `lifeGoal` / `lifeSkill` / `groupStanding`：人生目標、技能・地位の変化。実際の収入や採用の証拠と取り違えない。
- `cash` / `payBonus`：一時金と報酬の補正。短期請負の継続雇用を意味しない。
- 勤務先運営は`js/world/facilities.js`、`js/work/contracts.js`、年次給与は`js/life/annual/personal-amounts.js`。その他、地域職の出退勤には`js/life/affiliations.js`と`js/life/records.js`を通す。

## 2. 全83職業IDの採録範囲

`J[0]`は「無職」、`J[1..27]`は汎用生業、`J[28..34]`はロドス・カジミエーシュ会場関係、`J[35..40]`はBSW・ライン生命、`J[41..82]`は19地域42職。全83件の**日本語名とID**はJSONの`jobTypes`が正本。画面の職業IDと兼務・短期仕事・家業は別の履歴を持つ。

## 3. A：職業変更・勤務契約・雇用所属に直接関わる全175イベント

下表は全IDとソースの行番号、`job`を更新する結果値、直接の効果キーの一部、既存本文冒頭を示す。**表の`job`欄は「結果枝の候補値」であり、イベントが発火すれば必ずその職に就くという意味ではない。**

### `data/base/career-entry.js`（15件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `car` | `base/career-entry.js:4` | 14,0,4,2,3,16,17,18,20,21,7,22,23,24,27,1 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeSkill, payBonus | 鉱石病の診断を受けてから、働き口を探すたび通院の日取りと薬代が先に頭をよぎるようになった。街角の求人板の前で足を止め |
| `transporter_contract_review` | `base/career-entry.js:519` | 0 | job, lifeAffiliation, lifeGoal, lifeSkill | トランスポーターとして街を走り始めて二年が経った。靴底の減り方と裏通りの抜け道がすっかり体に染みついたころ、契約の節 |
| `kjerag_transporter_route_review` | `base/career-entry.js:596` | 0 | job, lifeAffiliation, lifeGoal, lifeSkill | 雪の山道を荷を背負って登り始めて二年になる。新しい荷受け場所を設けたいと集落を回ると、温かい茶を出して歓迎してくれる |
| `rim_catastrophe_transporter_review` | `base/career-entry.js:675` | 16 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeGoals, lifeSkill | 天災が爪痕を残した坑道を調べる助手になって二年が過ぎた。崩落した岩肌や黒く光る源石の露出を図面に落とし込む隣で、同行 |
| `sargon_market_contract_review` | `base/career-entry.js:792` | 0,16 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeGoals | 移動バザールの護衛を請けてから二年が経った。砂風が吹く天幕の間を歩いて次の口を探したが、前の雇い主からは音沙汰がない |
| `ursus_mine_assignment_offer` | `base/career-entry.js:898` | 3 | job, lifeAffiliation, lifeGoal | 採掘現場で働いていると、鉱区の監督官に呼び出された。鉱石病の診断記録を理由に、北方の鉱区へ移れという。拒めばどうなる |
| `ursus_mine_assignment_review` | `base/career-entry.js:973` | 0 | job, lifeAffiliation, lifeGoal | 監視付きの採掘班に送り込まれて二年が過ぎた。皮下に埋め込まれた位置特定チップを抜き取ろうと、密かに外の医療班とつなぎ |
| `col_tech_safety_aftermath` | `base/career-entry.js:1286` | 7,0 | job, lifeAffiliation, lifeGoal, lifeSkill | あの試作試験から二年が過ぎた。訂正印が押された点検表は今もロッカーの奥に眠っているが、現場ではまたしても安全手順を省 |
| `col_tech_internal_review` | `base/career-entry.js:1661` | 0 | job, lifeAffiliation, lifeGoal | 検査証のない交換部品を特例で通した件について、監査室の聞き取りに呼ばれた。冷たい蛍光灯の下で、調査員は署名欄を指差し |
| `col_tech_workplace_consequence` | `base/career-entry.js:1759` | 0 | job, lifeAffiliation, lifeGoal, lifeSkill | 監査の一件から三年が経ち、部品受入れの決裁権は上の部署へ吸い上げられた。現場の点検と引き継ぎだけを守る日々が続く中、 |
| `col_tech_later_years` | `base/career-entry.js:1877` | 0 | job, lifeAffiliation, lifeGoal, lifeSkill | 機械油と金属音の中で働き続けて長い年月が過ぎた。夕方には腰や指先の痛みが残るようになり、このまま騒音の激しい現場に立 |
| `vic_clerk_role_review` | `base/career-entry.js:1970` | 0 | job, lifeAffiliation, lifeGoal, lifeSkill, payBonus | 保険仲介所の月末締めを一人で回せるようになったころ、先輩から次の役回りを打診された。照合係の束ね役になればわずかな手 |
| `vic_clerk_later_years` | `base/career-entry.js:2047` | 0 | job, lifeAffiliation, lifeGoal, lifeSkill | 自分が閉じた帳簿が壁の棚を一段埋め尽くすほど、仲介所で長い年月を過ごした。手ほどきをしてくれた先輩はとっくに去り、今 |
| `work_unemployed_reentry` | `base/career-entry.js:2188` | 1,2,24,4 | job | 無職のまま月日が流れ、手元の路銀も心許なくなってきた。街角の求人板や市場の詰め所を回り、今日明日のパンと家賃を稼ぎ出 |
| `work_elder_reentry` | `base/career-entry.js:2246` | 24,1 | job | 仕事を退いてから時間が経ったが、じっとしているのも性に合わず、路銀の減りも気になってきた。年老いた体でも引き受けられ |

### `data/base/regional-west.js`（15件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `urs_mine` | `base/regional-west.js:123` | 0 | job | 地底を揺らす轟音とともに、第3坑道の天井が崩れ落ちた。粉塵にむせながら坑口まで駆け戻ると、「まだ奥に仲間が残ってるぞ |
| `urs_conscript` | `base/regional-west.js:187` | 2,14 | job, payBonus | 街角に貼り出された軍需工場の募集票には、「高給・宿舎完備」と太字で書かれていた。だがよく読めば、配属先も外出の可否も |
| `urs_purge` | `base/regional-west.js:280` | 0 | job | 黒い外套を着た役人たちが通りを回り、一軒ずつ住人の名簿と身元を調べていた。家の大人たちは険しい顔でカーテンを閉め、「 |
| `vic_patron` | `base/regional-west.js:337` | 6,2 | job | 地元の有力な名家の執事から、「旦那様が若い働き手に目をかけておられる。望むなら良い勤め先へ口をきいてやろう」と声がか |
| `vic_strike` | `base/regional-west.js:438` | 0 | job, payBonus | 蒸気機関の煤煙が立ちこめる工場の裏手で、仲間たちが「こんな安い賃金と長時間の立ちっぱなしじゃ体がもたない」とストライ |
| `vic_war` | `base/regional-west.js:485` | 0 | job | ロンディニウムの居住区まで激しい砲撃の音が迫り、窓ガラスがビリビリと震え続けている。昨日まで通れた大通りが今日は瓦礫 |
| `col_quarantine_offer` | `base/regional-west.js:666` | 0 | job | 高い保険料が払えず薬の確保に苦労していると、同じ境遇の仕事仲間が声を潜めて「市の感染者隔離区画へ入れば、公費で最低限 |
| `col_hire` | `base/regional-west.js:690` | 7,2 | job | 新興企業が並ぶオフィス街の求人ボードに、研究所の技師と工場スタッフの募集票が貼り出された。履歴書の健康状態の欄を前に |
| `col_frontier` | `base/regional-west.js:758` | 62,0 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeGoals | 診療所の待合室に、クルビア西部の未開拓地へ向かう労働者を募るポスターが貼られていた。前渡しの支度金が出るうえ感染者も |
| `col_frontier_contract_review` | `base/regional-west.js:932` | 0 | job, lifeAffiliation, lifeGoal, lifeGoals | 開拓キャンプで働き始めてから、いくつも季節が過ぎた。会社から支給された道具と宿舎はあるが、現場の仕事は体にこたえる。 |
| `kaz_rural` | `base/regional-west.js:1062` | 1,2 | job | 農村の知人から、仕事を引き継ぐ人を探していると連絡が来た。道具と住まいの支度には金が要る。都市で別の勤めを探す道もあ |
| `lei_isolation` | `base/regional-west.js:1587` | 0 | job | 地区の役所から、診断記録を根拠に隔離区画へ移るよう通達が届いた。移れば仕事を失うことになり、当面の収入も途絶える。 |
| `sir_family_afterwork` | `base/regional-west.js:2125` | 16,24 | job, lifeAffiliation, lifeGoal, lifeSkill | ファミリーの仕事から手を引いた。帳面に残った立替金はまだ片づかず、別の働き口を探す必要がある。地区の掲示で配達と露店 |
| `sir_family_later_work` | `base/regional-west.js:2255` | 24,0 | job, lifeAffiliation, lifeGoal, lifeSkill | ファミリーを離れてからも、配達や店先の仕事を続けてきた。長い道のりや一日の立ち仕事がこたえるようになり、今の働き方を |
| `sir_feud` | `base/regional-west.js:2441` | 0 | job | 関わりのあるファミリーと対立組織の緊張が高まった。知人は店の裏口を閉め、今夜は誰と帰るかを確かめている。 |

### `data/parts/routes/regional-careers/entry-frontier.js`（15件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `car_sar_guard_entry` | `regional-careers/entry-frontier.js:13` | 68 | job, lifeAffiliation, lifeGoal, lifeSkill | オアシス都市にそびえる豪壮な宮殿。サルゴンの地方領主『パーディシャー』が、自らの身辺を護る屈強な親衛隊を募っていた。 |
| `car_sar_warrior_entry` | `regional-careers/entry-frontier.js:67` | 69 | job, lifeAffiliation, lifeGoal, lifeSkill | ジャングルの熱気と歓声が渦巻くアカフラ。部族の力比べ大祭で、己の肉体一本で戦う『大勇士』の挑戦者を募っていた。難しい |
| `car_sam_priest_entry` | `regional-careers/entry-frontier.js:107` | 70 | job, lifeAffiliation, lifeGoal, lifeSkill | 氷結した古代の巨木がそびえるサーミの深き森。部族を導き、巨獣と森の意志を読み取る『雪祀（雪祭司）』の継承者が選ばれよ |
| `car_sam_warrior_entry` | `regional-careers/entry-frontier.js:151` | 71 | job, lifeAffiliation, lifeGoal, lifeSkill | 北の果てなき氷原から侵食する正体不明の存在――『悪魔』。その脅威を文明圏から隔離するため、木々に傷を刻み境界を守護す |
| `car_kje_karlan_entry` | `regional-careers/entry-frontier.js:191` | 72 | job, lifeAffiliation, lifeGoal, lifeSkill | 雪に閉ざされた聖山イェラグを近代化へ導く、シルバーアッシュ総長率いる『カランド貿易』。伝統に固執する三大家族や曼珠院 |
| `car_kje_monk_entry` | `regional-careers/entry-frontier.js:231` | 73 | job, lifeAffiliation, lifeGoal, lifeSkill | カランドの女神を祀る神聖なる曼珠院。古くからの信仰を守り、聖山への立ち入りを監視する護衛僧の入門式が開かれていた。俗 |
| `car_kazdel_mil_entry` | `regional-careers/entry-frontier.js:271` | 74 | job, lifeAffiliation, lifeGoal, lifeSkill | 瓦礫と怨嗟が渦巻くカズデル。摂政王テレシス率いる軍事委員会が、ロンディニウム遠征とサルカズの復讐を果たすべく兵を集め |
| `car_kazdel_bone_entry` | `regional-careers/entry-frontier.js:325` | 75 | job, lifeAffiliation, lifeGoal, lifeSkill | 巨大な魔獣の頭骨や鉱石病の遺骨から武器や触媒を削り出す、カズデル伝統の『骨鍛冶（ボーンスミス）』。源石アーツの呪術と |
| `car_ibe_inq_entry` | `regional-careers/entry-frontier.js:365` | 76 | job, lifeAffiliation, lifeGoal, lifeSkill | 港町の詰所で、裁判所の人員募集を知らせる紙が風に鳴っていた。海の異変への警戒が続くなか、見習い審問官には身元の照会も |
| `car_ibe_tuner_entry` | `regional-careers/entry-frontier.js:409` | 77 | job, lifeAffiliation, lifeGoal, lifeSkill | 荒れ狂う海を睨む巨大な石造灯台『光の目』。海の怪物を退ける神聖なアーツ光線を放ち続けるため、高所にある巨大アーツラン |
| `car_bol_soldier_entry` | `regional-careers/entry-frontier.js:449` | 78 | job, lifeAffiliation, lifeGoal, lifeSkill | 三つ巴の内戦で国土が焦土と化すボリバル。日当目当ての若者や強制徴募された農民が、泥濘の塹壕へ集められていた。軍靴代や |
| `car_bol_dossoles_entry` | `regional-careers/entry-frontier.js:489` | 79 | job, lifeAffiliation, lifeGoal, lifeSkill | 内戦を他所に、歓楽と巨額の資本が渦巻く人工湖の観光都市ドッソレス。カンディード市長の統治下で、水上リゾートの治安を守 |
| `car_rim_eng_entry` | `regional-careers/entry-frontier.js:529` | 80 | job, lifeAffiliation, lifeGoal, lifeSkill | コータス族が主導する巨大採掘国家レム・ビリトン。地平線を覆う巨大自走採掘プラットフォーム『アイアンキャロット』等の心 |
| `car_min_champ_entry` | `regional-careers/entry-frontier.js:579` | 81 | job, lifeAffiliation, lifeGoal, lifeSkill | 古代ポリスの自由と鍛錬の美を重んじるミノス。神々に捧げるアクロポリスの大競技会で、都市の名誉を背負って戦う『競技勇士 |
| `car_min_orator_entry` | `regional-careers/entry-frontier.js:619` | 82 | job, lifeAffiliation, lifeGoal, lifeSkill | 市民たちが集い、哲学と民主的な議論を交わすミノスのアゴラ（広場）。法廷での弁論や政策の立案を担う『弁論官』が募集され |

### `data/base/regional-east.js`（11件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `lat_exile` | `base/regional-east.js:28` | 0 | job | ラテラーノ市民であっても例外はない。鉱石病にかかったことを理由に、聖都を退去するよう冷たい通達が届いた。甘い菓子の匂 |
| `lat_priest` | `base/regional-east.js:84` | 9 | job | 礼拝堂からの帰り道、穏やかな物腰の聖職者に呼び止められた。教会の奉仕や聖職の道に関心があるなら、一度話を聞きに来ない |
| `ibe_rebuild` | `base/regional-east.js:250` | - | lifeAffiliations, lifeGoal, lifeSkill | 潮風で朽ちた海辺の街区で、崩れた倉庫の床や石畳を直す短期の復旧人足を募っていた。長く続く仕事ではないが、日銭にはなる |
| `ibe_rebuild_contract_review` | `base/regional-east.js:345` | - | lifeAffiliations, lifeGoal, lifeSkill | 海辺の街区で、また別の古い倉庫を直す日雇い募集が出ていた。前に覚えた手順を生かして応募するか、もっと安定した別の職を |
| `kje_open` | `base/regional-east.js:565` | 2,5 | job | 開通したばかりの駅の周りに、新しい工場の求人札と、旅人相手の露店の貸し枠が出ていた。汽車が白い蒸気を吐いて滑り込むた |
| `yan_exam` | `base/regional-east.js:607` | 6 | job | 役所の門前に、下級書記の採用試験を知らせる告示が貼り出された。公文書を読み解く学識と、試験場へ赴く旅費が要る。今の仕 |
| `lon_guard` | `base/regional-east.js:717` | 15 | job | 龍門近衛局が街区を回る巡回要員を募集していた。採用されれば安定した給金が出るが、雑踏の揉め事や荒事に身を晒す仕事でも |
| `lon_merchant` | `base/regional-east.js:901` | 5,0 | job | 龍門の賑やかな商業通りで、空きが出たばかりの小さな露店を引き継がないかと声がかかった。権利金と仕入れで50万龍門幣。 |
| `hig_tension` | `base/regional-east.js:1036` | 14 | job, lifeAffiliation, lifeGoal, lifeSkill | 北院と南院の睨み合いや、海の向こうのウルサスとのいくさ話が、仕事帰りの茶屋でもしきりに囁かれるようになった。辻の掲示 |
| `hig_service_review` | `base/regional-east.js:1117` | 16,0 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeGoals, lifeSkill | 陣屋で兵站と街道警備の務めに就いて三年が経ち、上役から次の任期も残るかと尋ねられた。このまま軍務を続けるか、覚えた荷 |
| `hig_service_later_career_review` | `base/regional-east.js:1220` | 16,0 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeGoals, lifeSkill | 気づけば十五年以上も軍務・兵站の現場に身を置き、急な陣触れと家の暮らしのあいだで折り合いをつけてきた。このまま古参と |

### `data/parts/routes/regional-careers/entry-west.js`（11件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `car_urs_officer_entry` | `regional-careers/entry-west.js:13` | 51 | job, lifeAffiliation, lifeGoal, lifeSkill | 要塞司令部の豪奢な執務室で、貴族将校たちが書類に目を落としていた。ウルサス帝国軍の指揮官枠――それは貴族の血筋と巨額 |
| `car_urs_guard_entry` | `regional-careers/entry-west.js:67` | 52 | job, lifeAffiliation, lifeGoal, lifeSkill | ツンドラの冷風が吹きすさぶ兵舎で、国境警備部隊と感染者鉱山を監視する憲兵の徴募が行われていた。厳しい学歴は問われず、 |
| `car_urs_academy_entry` | `regional-careers/entry-west.js:117` | 53 | job, lifeAffiliation, lifeGoal, lifeSkill | 巨大な軍用装甲列車や重工業都市の設計を手掛けるウルサス帝国科学院。硬質な鉄と源石動力の極致を追求するこの研究機関で、 |
| `car_vic_infantry_entry` | `regional-careers/entry-west.js:157` | 54 | job, lifeAffiliation, lifeGoal, lifeSkill | ヴィクトリアの各都市で、正規陸軍の平民歩兵の募集が行われていた。伝統と栄光を謳う帝国だが、平民出身の兵士はどれほど戦 |
| `car_vic_royal_entry` | `regional-careers/entry-west.js:207` | 55 | job, lifeAffiliation, lifeGoal, lifeSkill | ヴィクトリアの公爵軍で士官候補の募集があると聞いた。推薦状や軍務経験を求める声もあり、採用の判断が誰に委ねられるのか |
| `car_vic_scribe_entry` | `regional-careers/entry-west.js:261` | 56 | job, lifeAffiliation, lifeGoal, lifeSkill | ロンディニウム中央議会や地方市議会の議事堂で、公爵や伯爵たちの議案や法律文書を記録・整理する書記官が募集されていた。 |
| `car_vic_works_entry` | `regional-careers/entry-west.js:301` | 57 | job, lifeAffiliation, lifeGoal, lifeSkill | 巨大な蒸気機関車と鉄鋼レールが並ぶヴィクトリアの鉄道工廠。産業革命の鼓動が響くこの巨大施設で、高圧蒸気パイプラインや |
| `car_lei_golden_entry` | `regional-careers/entry-west.js:341` | 58 | job, lifeAffiliation, lifeGoal, lifeSkill | 双子女帝の座すツヴィリングトゥルムの回廊で、金律法衛の選考審査が開かれていた。リターニアの調和とアーツ法典を執行する |
| `car_lei_court_entry` | `regional-careers/entry-west.js:385` | 59 | job, lifeAffiliation, lifeGoal, lifeSkill | リターニア各選帝侯の宮殿で、貴族専属の音楽家を募るサロンが開かれていた。チェロやピアノのアーツ演奏で主君を楽しませ、 |
| `car_lat_executor_entry` | `regional-careers/entry-west.js:425` | 60 | job, lifeAffiliation, lifeGoal, lifeSkill | 鐘の音が鳴り響くラテラーノ公証人役場。教皇庁の法典を執行し、遺言・契約の履行と国内外の紛争調停を担う『執行人』の審査 |
| `car_lat_landen_entry` | `regional-careers/entry-west.js:469` | 61 | job, lifeAffiliation, lifeGoal, lifeSkill | ラテラーノの伝統を頑なに守るランデン修道院。祈りとパン作り、そして守護銃の整備に生涯を捧げる修道銃士たちが祈りを捧げ |

### `data/parts/routes/regional-careers/entry-east.js`（10件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `car_yan_court_entry` | `regional-careers/entry-east.js:13` | 41 | job, lifeAffiliation, lifeGoal, lifeSkill | 炎国の春、都や各州の試験場で科挙の会試が催された。真龍の治める広大な領土に秩序を敷くべく、三省六部の官吏登用を期して |
| `car_yan_suis_entry` | `regional-careers/entry-east.js:57` | 42 | job, lifeAffiliation, lifeGoal, lifeSkill | 旅籠の奥で、無地の官服をまとった役人が静かに杯を置いていた。巨獣の影を追い、朝廷の内外を巡視して災いを未然に断つ『司 |
| `car_yan_tianshi_entry` | `regional-careers/entry-east.js:101` | 43 | job, lifeAffiliation, lifeGoal, lifeSkill | 各地の天師府では、国家の気象観測、治水、城壁防護を司る『天師』の採用試問が開かれている。アーツの心得があれば門戸は開 |
| `car_lmd_guard_entry` | `regional-careers/entry-east.js:141` | 44 | job, lifeAffiliation, lifeGoal, lifeSkill | 近衛局ビル前の掲示板に、新任巡査の採用募集が張り出されていた。繁栄する国際貿易都市の治安を維持するため、暴動鎮圧・対 |
| `car_lmd_black_entry` | `regional-careers/entry-east.js:195` | 45 | job, lifeAffiliation, lifeGoal, lifeSkill | 近衛局のサイレンが遠ざかるスラムの薄暗い酒場で、怪しげな仲介人が品定めの視線を向けていた。ネオンの届かぬ暗がりで密輸 |
| `car_hig_samurai_entry` | `regional-careers/entry-east.js:235` | 46 | job, lifeAffiliation, lifeGoal, lifeSkill | 極東の城下町で、名門武家が新たな家臣を募っていた。北朝と南朝の対立が続くこの国において、主君に命を預けて刀を振るう『 |
| `car_hig_ninja_entry` | `regional-careers/entry-east.js:289` | 47 | job, lifeAffiliation, lifeGoal, lifeSkill | 夜更けの屋根裏から、音もなく黒装束の密使が姿を現した。大名の影で敵情を探り、暗殺と工作を担う忍び衆。名も捨て、情も捨 |
| `car_hig_cyber_entry` | `regional-careers/entry-east.js:355` | 48 | job, lifeAffiliation, lifeGoal, lifeSkill | 深夜2時、自室の端末が突如として外部電源なしに起動した。黒い画面に、かつて保存した鎖川の極秘暗号プロトコルが自動展開 |
| `car_hig_shinto_entry` | `regional-careers/entry-east.js:399` | 49 | job, lifeAffiliation, lifeGoal, lifeSkill | 緑深き山あいの神社と古刹の門前で、若き神職や僧侶を志す者が集まっていた。テラでは珍しく神仏が共に息づく極東において、 |
| `car_hig_touhou_entry` | `regional-careers/entry-east.js:453` | 50 | job, lifeAffiliation, lifeGoal, lifeSkill | 煙突から黒煙を吐き出す巨大な近代工場群――東方重工。シラユキの手裏剣『シルバーウィンド』をはじめ、伝統的な刀剣や手裏 |

### `data/base/life-and-health.js`（9件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `illness_review` | `base/life-and-health.js:281` | 0 | job | いく晩寝ても体の鉛のような重さが抜けず、歩くだけで息が上がるようになった。病院へ行くには金も時間もかかるが、このまま |
| `illness_followup` | `base/life-and-health.js:321` | 0 | job | 熱と鈍い痛みがいつまでも引かず、朝、布団から体を起こすのさえやっとだった。もう一度金を払って診療所へ行くか、周りの手 |
| `nat` | `base/life-and-health.js:514` | 0 | job |  |
| `displacement_after` | `base/life-and-health.js:612` | 27 | job | 地平線の砲声は遠のいたが、救護所の配給を待つ列は少しも短くならなかった。冷たい粥をすすりながら、帰れる家がまだ残って |
| `war` | `base/life-and-health.js:841` | 0 | job | 遠くで砲撃の閃光が走り、移動都市は黒煙を吐いて緊急針路変更を始めた。機関区へ走る整備班と、避難路へ殺到する住民の怒号 |
| `mv` | `base/life-and-health.js:894` | 0 | job | きな臭い知らせが相次ぎ、この移動都市もいつ戦火に巻き込まれるか分からない。外の定住地へ降りるか、別の移動都市へ乗り継 |
| `old` | `base/life-and-health.js:974` | 0 | job | 若い頃は一晩寝れば抜けた仕事の疲れが、翌朝になっても腰や肩に重く残るようになった。無理を押して同じように働くか、日数 |
| `old_followup` | `base/life-and-health.js:1014` | 0 | job | 仕事の時間を減らしてから何年かが過ぎた。体をいたわる暮らしには慣れたものの、懐具合や体力の衰えは年々変わっていく。職 |
| `elder_work_opportunity` | `base/life-and-health.js:1048` | 24,12 | job | 引退して何年か経ったころ、近所の商店から「昼の間だけ店番を手伝ってくれないか」と声がかかった。近くの学び場でも、子ど |

### `data/relationships/close-disclosure.js`（9件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `life_ursus_zelgrad_recruitment` | `relationships/close-disclosure.js:646` | 2 | job, lifeAffiliation, lifeGoal, lifeSkill | 近くの工場で補助の働き手を探しているらしいと、親戚づてに話が回ってきた。鉱石病の身でも雇ってもらえるのか、詳しい条件 |
| `life_ursus_zelgrad_work_review` | `relationships/close-disclosure.js:736` | 0 | job, lifeAffiliation, lifeGoal, lifeSkill | ゼルグラードの工場で働き始めて二年余りが過ぎ、機械の轟音にも労働区画の冷え込みにもどうにか慣れた。病を抱える身体の重 |
| `life_ursus_zelgrad_recruitment_retry` | `relationships/close-disclosure.js:804` | 2 | job, lifeAffiliation, lifeGoal, lifeSkill | 去年聞いた工場の募集について、親戚にもう一度尋ねてみた。まだ働き手を探しているのか確かめ、今度こそ応募するか、すっぱ |
| `life_ursus_zelgrad_evacuation` | `relationships/close-disclosure.js:888` | 0 | job, lifeAffiliations, lifeGoal, lifeGoals | 広場に集められた住民たちの前で、北原の元坑夫を名乗る男が軍の研究と感染者の非道な扱いを声を限りに告発し、今すぐ街を出 |
| `life_ursus_zelgrad_purge_trap` | `relationships/close-disclosure.js:1046` | 0 | job, lifeAffiliations | 広場の騒乱が遠ざかり冷え込みが厳しさを増すなか、重装憲兵と防護服を着た工廠監理官が労働区画の出口を鉄柵で完全封鎖した |
| `life_ursus_zelgrad_displacement_review` | `relationships/close-disclosure.js:985` | 0 | job, lifeGoal | ゼルグラードを逃げ出してから数年が過ぎた。身を寄せた避難先で日銭を稼ぎながら、あの街へ戻る手立てがあるのか考え続けて |
| `life_ursus_zelgrad_stay_review` | `relationships/close-disclosure.js:1074` | 0 | job, lifeAffiliations, lifeGoal, lifeGoals | あの騒動の日に街へ残ると決めてから、一年余りが過ぎた。空き部屋の増えた労働区画で、今も荷物をまとめて出ていく人の姿を |
| `life_ursus_zelgrad_displaced_work` | `relationships/close-disclosure.js:1204` | 2,0 | job, lifeAffiliations, lifeGoal, lifeGoals, lifeSkill |  |
| `life_ursus_zelgrad_displaced_work_review` | `relationships/close-disclosure.js:1340` | 0 | job, lifeAffiliation, lifeGoal, lifeSkill |  |

### `data/parts/routes/rhodes-and-factions/staff-routes-events-01.js`（8件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `sr_rhodes_recruitment_contact` | `rhodes-and-factions/staff-routes-events-01.js:9` | - | lifeAffiliation | 街を回っていたロドスの巡回医療班に同行していた職員が、荷の仕分けや設備の保守、事務手伝いの募集案内を配っていた。短期 |
| `sr_rhodes_hiring_review` | `rhodes-and-factions/staff-routes-events-01.js:53` | 28,29,30,33,34,31 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeSkill | ロドスから届いた返事には、物資管理や設備整備、医療補助、連絡便、行動予備隊などいくつもの部署が並んでいた。外勤を希望 |
| `sr_rhodes_field_qualification` | `rhodes-and-factions/staff-routes-events-01.js:353` | 29 | job, lifeAffiliation, lifeSkill | 訓練場で負傷者の搬送と撤退合図の反復訓練が続いた。次の実地派遣を前に、教官から「お前なら現場でどの役回りを続けられそ |
| `sr_rhodes_work_review` | `rhodes-and-factions/staff-routes-events-01.js:452` | 0 | job, lifeAffiliation, lifeGoal | ロドスで働きはじめてから何年かが過ぎた。節目の面談で、上司が来季の人員配置案を机に広げた。このまま今の持ち場を続ける |
| `sr_rhodes_posting_review` | `rhodes-and-factions/staff-routes-events-01.js:681` | - | lifeAffiliation | ロドスに入って最初の配属面談が呼ばれた。移動し続ける本艦の船内宿舎に部屋をもらうか、それとも今暮らしている国の地上支 |
| `sr_rhodes_posting_transfer` | `rhodes-and-factions/staff-routes-events-01.js:773` | - | lifeAffiliation | 本艦での船内生活にもすっかり慣れた頃、今航行している国の地上支部に欠員が出たという話が回ってきた。手を挙げれば地上の |
| `sr_rhodes_branch_transfer` | `rhodes-and-factions/staff-routes-events-01.js:835` | - | lifeAffiliation | 地域の地上支部で働き続けるうち、本艦へ移るスタッフを募る通達が届いた。本艦へ乗り込めば設備の整った環境で働けるが、こ |
| `sr_rhodes_promotion_review` | `rhodes-and-factions/staff-routes-events-01.js:1188` | 31 | job, lifeAffiliation, payBonus | ロドスでの勤務実績が評価され、人事担当者と所属部門の責任者から面談に呼ばれた。これまでの働きぶりが認められ、責任ある |

### `data/base/confinement-and-education.js`（7件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `hid_exposed` | `base/confinement-and-education.js:159` | 0 | job | 作業中にめくれた袖口から、黒い結晶を誰かに見られたらしい。翌朝、現場の責任者に声を潜めて呼び止められた。誰が言いふら |
| `veteran` | `base/confinement-and-education.js:401` | 0,12 | job | 新しい遠征任務の召集が舞い込んだ。冷える日に強張る体とこれからの暮らしを思い、武器を置いて若手を教える役に回るか、ま |
| `education_paused_life` | `base/confinement-and-education.js:468` | 1 | job | 家計の都合や暮らしの混乱から、学校の席を休学にしてしばらく経った。同年代の生徒たちが鞄を抱えて通りを行き交う姿を見送 |
| `study_to_work` | `base/confinement-and-education.js:799` | 7,20,18 | job | 実習で扱ったのと同じ機械を使う工房の求人が出た。なけなしの交通費と経歴書を懐に入れ、どの工房から門を叩くか考えた。 |
| `arts_academy_completion` | `base/confinement-and-education.js:867` | 11 | job | アーツ学院の課程を修め、門を出る日が来た。身につけた制御技術を活かして食っていける場所がないか、求人板の貼り紙を見比 |
| `teacher_path` | `base/confinement-and-education.js:901` | 12 | job | 地域の学び舎に、読み書きを教える講師の募集が出ていた。顔見知りの紹介者から「一度教室を見学して、短い模擬授業をやって |
| `artist_path` | `base/confinement-and-education.js:945` | 13,0 | job | あなたが作りためた作品を見た知人が、「今度開かれる町の展示会に出してみないか」と目を輝かせた。ただ、場所代と材料費を |

### `data/base/family-and-livelihood.js`（6件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `dis` | `base/family-and-livelihood.js:408` | 0 | job | 現場の監督から、あなたの種族を理由に条件の悪い持ち場へ移るよう言い渡された。「上の決まりだ」の一点張りで、どんな規則 |
| `fam_unemploy` | `base/family-and-livelihood.js:632` | 1 | job | 大黒柱だった親が職を失った。ただでさえ苦しかった台所は火の車で、明日のパンや米をどうするかという声が部屋に響いた。 |
| `fam_conscript` | `base/family-and-livelihood.js:722` | 14,0 | job | 戦火が迫るなか、きょうだいの一人に部隊への招集状が届いた。泣き崩れる家族のそばで、免除を願い出るか、自分が身代わりに |
| `fam_infected` | `base/family-and-livelihood.js:770` | 0 | job | {parentName}が鉱石病だと分かった。その夜から、家では窓を閉め切ってひそひそ声で話すようになった。よそで絶 |
| `fam_tribetree` | `base/family-and-livelihood.js:957` | 0 | job | 世話になってきた氏族の聖樹の下で、雪祭司が集まりを開いた。大人たちは焚き火を囲み、次の季節の移動にもあなたを連れてい |
| `fam_inherit` | `base/family-and-livelihood.js:1032` | 5 | job | 商いを切り盛りする親から、そろそろ店の仕事を手伝わないかと切り出された。まだ学業を続けたい気持ちもあるが、年々白髪の |

### `data/parts/routes/regional-careers/entry-central.js`（6件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `car_col_pioneer_entry` | `regional-careers/entry-central.js:13` | 62 | job, lifeAffiliation, lifeGoal, lifeSkill | 移動都市の外、荒涼たる大地に広がる未開地。クルビア連邦政府の開拓局で、原野に自らの農場や工房を築く『パイオニア』の入 |
| `car_kaz_comp_knight_entry` | `regional-careers/entry-central.js:67` | 63 | job, lifeAffiliation, lifeGoal, lifeSkill | ネオン輝く大都市カヴァレリエルキ。歓声と巨額の賭け金が飛び交う騎士競技のメジャー大会で、企業スポンサー付きの『競技騎 |
| `car_kaz_armorless_entry` | `regional-careers/entry-central.js:121` | 64 | job, lifeAffiliation, lifeGoal, lifeSkill | 商業連合会の暗部――金で動く騎士たちの背後で、邪魔な感染者騎士や監査会の役人を密かに始末する影の暗殺組織『無冑盟』。 |
| `car_sir_soldier_entry` | `regional-careers/entry-central.js:161` | 65 | job, lifeAffiliation, lifeGoal, lifeSkill | シラクーザを支配する12の巨大マフィア・ファミリー。煙草の煙が立ち込める屋敷の奥で、新たなソルジャーを迎える儀礼が開 |
| `car_sir_police_entry` | `regional-careers/entry-central.js:201` | 66 | job, lifeAffiliation, lifeGoal, lifeSkill | マフィアの支配から脱却し、法と秩序による統治を目指す新移動都市ヌオバ・ウォルシーニ。裁判所直属の都市警察官として、フ |
| `car_sie_obs_entry` | `regional-careers/entry-central.js:241` | 67 | job, lifeAffiliation, lifeGoal, lifeSkill | リゾート都市シエスタの象徴である巨大な黒曜石火山。いつ大規模な噴火を起こすか知れぬこの休火山を昼夜問わず監視する観測 |

### `data/parts/routes/rhodes-and-factions/bsw-routes.js`（6件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `sr_bsw_recruitment_assessment` | `rhodes-and-factions/bsw-routes.js:12` | 35 | job, lifeAffiliation, lifeGoal, lifeSkill | クルビア連邦の移動都市にて、国際民間軍事会社『ブラックスチール・ワールドワイド（BSW）』の警備契約社員の募集告知を |
| `sr_bsw_promotion_tactical` | `rhodes-and-factions/bsw-routes.js:83` | 36 | job, lifeAffiliation, payBonus | 見習い期間中の優れた実績が評価され、BSWクルビア本部から正規戦術オペレーターへの昇格審査に召集された。高難度の実地 |
| `sr_bsw_vip_escort_ambush` | `rhodes-and-factions/bsw-routes.js:123` | 37 | job, lifeAffiliation, payBonus | 移動都市間の首脳会談に向かう多国籍企業の重要役員を警護中、対抗勢力が雇った凄腕の襲撃部隊に包囲された。暗殺部隊の指揮 |
| `sr_bsw_rhodes_secondment` | `rhodes-and-factions/bsw-routes.js:169` | - | lifeAffiliation | BSW本部から、業務提携先である製薬会社『ロドス・アイランド』への出向派遣（secondment）の打診があった。ロ |
| `sr_bsw_infected_squad_policy` | `rhodes-and-factions/bsw-routes.js:250` | - | lifeAffiliation | 定期健診のレントゲン写真に、黒く輝く源石結晶の影が写り込んだ。BSWの社内規則では「感染者の即時解雇」こそないものの |
| `sr_bsw_secondment_posting_review` | `rhodes-and-factions/bsw-routes.js:310` | - | lifeAffiliation | ロドス本艦での出向勤務が一年を越えた。BSWの契約は続いているが、本社からは帰任時期を尋ねる連絡が届いた。医療部門や |

### `data/base/regional-conflict.js`（5件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `rim_mine` | `base/regional-conflict.js:32` | 0,2 | job | 採掘坑の奥で支柱がきしみ、一度作業を止めて点検すべきだという声が上がった。手を止めれば今日の日当が削られるが、このま |
| `kaz_exile` | `base/regional-conflict.js:126` | 0 | job | カズデル全土に内戦の炎が広がり、大人たちは国を捨てるか残るかで夜通し言い争っている。あなたは押し殺した声に耳を澄ませ |
| `kazdel_afterfall` | `base/regional-conflict.js:185` | 0 | job | ようやく砲声が止んだ夜、家の人たちは瓦礫の中から焦げた鍋や毛布を拾い集めた。誰が生き残り、どこへ散ったのかも分からな |
| `bol_war` | `base/regional-conflict.js:358` | 0 | job | 三つ巴の内戦が泥沼化するボリバルで、街道の物流が止まり、近所の商店や仕事場も干上がり始めていた。いつ前線がこの町へ雪 |
| `bol_tourist` | `base/regional-conflict.js:398` | 1 | job | 市場の荷さばき場に、急ぎの積荷を仕分ける数日間の人手募集が貼り出されていた。手っ取り早く日銭を稼ぐには悪くない話だ。 |

### `data/parts/routes/regional-careers/events-west.js`（5件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `car_urs_officer_choice_purge` | `regional-careers/events-west.js:30` | 0 | job, lifeAffiliation, lifeGoals | 軍団長から極秘の密命が下された。反皇帝派の疑いがある同僚の貴族将校を、演習中の事故に見せかけて抹殺せよという。従えば |
| `car_urs_guard_choice_riot` | `regional-careers/events-west.js:77` | 0 | job, lifeAffiliation, lifeGoals | 監視する感染者炭鉱の地下最深部で、虐待に耐えかねた囚人たちがツルハシを手に一斉に暴動を起こした。坑道の出入口を塞ぐ鉄 |
| `car_vic_royal_choice_coup` | `regional-careers/events-west.js:179` | 55,0 | job, lifeAffiliation, lifeAffiliations, lifeGoals | 1094年、ロンディニウムではカズデル軍事委員会の影響が強まり、大公爵たちの利権争いも深まっていた。所属する公爵家の |
| `car_vic_exile_command_review` | `regional-careers/events-west.js:236` | 0 | job, lifeAffiliation, lifeGoal | 公爵家が都を追われてから幾年かが過ぎた。残った兵の名簿には、二度と戻らない者の名もある。かつての軍旗を守り続けるか、 |
| `car_vic_exile_postwar_review` | `regional-careers/events-west.js:270` | 0 | job, lifeAffiliation, lifeGoal | ロンディニウムの戦いが終わり、カズデル軍事委員会は都を去った。議会では復興のための話し合いが続いているが、敗れた公爵 |

### `data/parts/routes/rhodes-and-factions/rhine-routes.js`（5件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `sr_rhine_recruitment_exam` | `rhodes-and-factions/rhine-routes.js:12` | 38 | job, lifeAffiliation, lifeGoal, lifeSkill | クルビア連邦トリマウンツにそびえるライン生命本社ビル。テラ最先端の科学技術と莫大な資本が集うこの学術コンソーシアムで |
| `sr_rhine_section_assignment` | `rhodes-and-factions/rhine-routes.js:35` | 39 | job, lifeAffiliation, payBonus | 実習期間中の優れた分析能力が認められ、専任研究員（J 39）への昇格面談に呼ばれた。ライン生命が誇る専門各科の主任た |
| `sr_rhine_promotion_chief` | `rhodes-and-factions/rhine-routes.js:161` | 40 | job, lifeAffiliation, payBonus | これまでの傑出した学術業績と特許取得がクリステン総括の目に留まり、自らの研究室と莫大な予算枠を持つ主任研究員（J 4 |
| `sr_rhine_rhodes_asylum` | `rhodes-and-factions/rhine-routes.js:240` | 30,20 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeGoals | トリマウンツからの追っ手を逃れ、荒野を彷徨っていたところを、密かに連絡を取っていた『ロドス・アイランド』の救護小隊に |
| `sr_rhine_post_lone_trail_career_review` | `rhodes-and-factions/rhine-routes.js:402` | 0 | job, lifeAffiliation, lifeGoal, lifeGoals | トリマウンツの空にあの光が走ってから、季節が巡った。研究室には残った装置と書類が積まれ、担当者たちは研究を続けている |

### `data/base/world-and-contacts.js`（3件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `wld_race` | `base/world-and-contacts.js:153` | 0 | job | 前に異議を申し立てた窓口で、担当者が記録を探す間、あなたは立ったまま待たされた。 |
| `discrimination_after` | `base/world-and-contacts.js:228` | 0 | job | 申し立てから数日後、上司は返事を先延ばしにし、同僚は仕事の話しかしなくなった。 |
| `discrimination_work_after` | `base/world-and-contacts.js:281` | 0 | job | 封書には調査中とだけあった。記録は受け取ったが、その先のことは何も書かれていない。 |

### `data/parts/routes/regional-careers/events-east.js`（3件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `car_yan_court_choice_bribe` | `regional-careers/events-east.js:30` | 0 | job, lifeAffiliation, lifeGoals | 管轄下の穀倉地帯を巡視中、地方の有力豪族から私邸に招かれた。豪奢な酒宴の席で、豪族は帳簿の免税措置を願い出て、袖の下 |
| `car_lmd_black_choice_big_deal` | `regional-careers/events-east.js:183` | 0 | job, lifeAffiliation, lifeGoals | 見知らぬ大物から、近衛局の極秘警備配置図を買い取りたいと破格の報酬が提示された。成功すれば数千万龍門幣の巨利だが、一 |
| `car_hig_ninja_choice_escape` | `regional-careers/events-east.js:281` | 0 | job, lifeAffiliation, lifeGoals | 頭領から下された新たな指令――それは無実の幼子を抹殺し、自らも証拠隠滅のために毒を仰げという冷酷なものだった。忍びの |

### `data/work/contracts.js`（3件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `job_contract_review_v76` | `work/contracts.js:19` | - | workContractAction | 手渡された雇用契約書には、給金や勤務時間だけでなく、怪我や破損の責任まで細かい文字でびっしり並んでいた。何度読み返し |
| `job_contract_negotiation_v76` | `work/contracts.js:43` | - | workContractAction | 今の仕事にもだいぶ手が馴染み、周囲より多くの荷や工程を回せるようになってきた。責任者が一人で帳面をつけている隙を見て |
| `job_contract_family_schedule_v76` | `work/contracts.js:78` | - | workContractAction | 家の用事や暮らしの段取りと、長い勤務時間の折り合いがつかなくなってきた。稼ぎが減るのを覚悟で、少し早く上がれるよう責 |

### `data/parts/extensions/education-and-later-life/relationships-events-03.js`（2件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `infection_workplace_review` | `education-and-later-life/relationships-events-03.js:253` | 0 | job, workContractAction |  |
| `infection_regional_housing_pressure` | `education-and-later-life/relationships-events-03.js:370` | 0 | job | 建物の管理人がやって来て、「この中に鉱石病の人間がいると苦情が出ている」と切り出した。あなたがそうだとは断言しないま |

### `data/parts/extensions/social-and-care/attitudes-family-knights.js`（2件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `kaz_knight_injury_job_transition` | `social-and-care/attitudes-family-knights.js:1117` | 21 | job, lifeAffiliation, lifeGoal, lifeGoals, lifeSkill | 古傷の肩をかばいながら働く要領は覚えたものの、無理が重なる日は夜も眠れないほど疼く。街の求人板で帳簿つけや受付補助の |
| `kaz_knight_later_career_review` | `social-and-care/attitudes-family-knights.js:1254` | 32,0 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeGoals, lifeSkill | 競技場の砂塵のなかで剣を振るい続けて、もう十年以上が過ぎた。どれだけ試合を重ねても、傷んだ武具の修理代や次の大会の登 |

### `data/parts/extensions/social-and-care/goals-craft-family.js`（2件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `kazimierz_knight_entry` | `social-and-care/goals-craft-family.js:144` | 10,1 | job, lifeAffiliation, lifeGoal, lifeSkill | 仕事帰りに競技会場へ立ち寄り、きらびやかなネオンの奥にある受付で、騎士競技の舞台に立つ手順を尋ねてみた。自前で登録料 |
| `old_reemployment_review` | `social-and-care/goals-craft-family.js:251` | 0 | job | 朝起きて仕事着に袖を通すたび、年々抜けない疲れを実感するようになった。これまでと同じ日数働き続けるか、そろそろ荷を下 |

### `data/parts/extensions/social-and-care/local-discrimination.js`（2件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `earth_persecution_victoria_framed_debt` | `social-and-care/local-discrimination.js:1156` | 0 | job | 朝、工場の門をくぐると警備員に事務所へ連行された。高価な蒸気織機の駆動部が破損した件について、工場主は『お前のような |
| `earth_discr_disclose_employer` | `social-and-care/local-discrimination.js:1623` | 0 | job | 現場の粉塵や激務で病状が悪化するのを防ぐため、事務所で雇い主に診断書を示し、自ら鉱石病であることを申し出るべきか迷っ |

### `data/parts/extensions/social-and-care/local-support-referrals.js`（2件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `life_rhodes_referral` | `social-and-care/local-support-referrals.js:284` | - | lifeAffiliation, lifeGoal | 町の診療所で鉱石病の診断を受けた際、医師が声を潜めて「ロドス・アイランドという組織の巡回医療につなぐ紹介状を書ける」 |
| `life_rhodes_role_review` | `social-and-care/local-support-referrals.js:679` | 0 | job, lifeAffiliation, lifeGoal | ロドスの現地担当者から、今後の関わり方を尋ねる連絡が届いた。自分の体調や仕事の忙しさと照らし合わせ、これからどう付き |

### `data/parts/routes/rhodes-and-factions/arena-work.js`（2件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `sr_kazimierz_arena_backstage` | `rhodes-and-factions/arena-work.js:11` | 32 | job, lifeAffiliation, lifeGoal, lifeSkill | 試合のない日でも、競技場の裏手では荷運びや客席の補修、備品の点検が絶え間なく続いていた。表の看板には華やかな騎士たち |
| `sr_kazimierz_arena_shift` | `rhodes-and-factions/arena-work.js:81` | 0 | job, lifeAffiliation, lifeGoal, lifeSkill | 興行の時間が急に繰り上がり、資材の搬入と客席の清掃が同じ時間帯に重なってしまった。外には開場を待つ観客の列が伸び、裏 |

### `data/parts/routes/rhodes-and-factions/cross-faction-routes.js`（2件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `sr_rhodes_to_reunion_turning_point` | `rhodes-and-factions/cross-faction-routes.js:80` | 0 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeGoals | 移動都市の路地裏で、正規軍と警官隊による感染者強制隔離区画の無差別掃討を目撃した。泣き叫ぶ子供や無抵抗の老人が銃床で |
| `sr_reunion_turncoat_rehabilitation` | `rhodes-and-factions/cross-faction-routes.js:169` | 28,34 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeSkill | ロドス本艦での投薬と療養によって体調が劇的に回復した。過去の経歴審査を終えた人事担当者から「船内で働きながら、新しい |

### `data/extensions/family-and-community.js`（1件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `life_savra_late_craft` | `extensions/family-and-community.js:155` | 18,0 | job, lifeGoal, lifeSkill | 長年続けてきた整備の仕事も、若い頃のように手早くはこなせなくなった。節々が痛む日は重い部品を若手に任せ、代わりに金属 |

### `data/parts/extensions/social-and-care/affiliation-places.js`（1件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `life_work_project_setback` | `social-and-care/affiliation-places.js:68` | - | lifeSkill, workContractAction | 納品目前になって、届いた部品の寸法が仕様書と食い違っていることが発覚した。現場には古い図面と、納期を盾に急かせる発注 |

### `data/parts/extensions/social-and-care/civilian-response.js`（1件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `life_chernobog_resident_response` | `social-and-care/civilian-response.js:17` | 0 | job, lifeAffiliation, lifeGoal | 年末から年明けにかけて、チェルノボーグの通りでは鎧戸を打ちつける音や、はぐれた身内を捜す貼り紙が目につくようになった |

### `data/parts/extensions/social-and-care/research-reunion.js`（1件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `life_rhodes_research_stall` | `social-and-care/research-reunion.js:173` | 28,0 | job, lifeAffiliation, lifeAffiliations, lifeGoal, lifeGoals, lifeSkill | 何年分かの記録をまとめても、患者ごとに経過や治療条件が違い、表の数字は揃わなかった。資材や担当者も入れ替わり、研究班 |

### `data/parts/routes/regional-careers/events-central.js`（1件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `car_col_pioneer_choice_bandits` | `regional-careers/events-central.js:30` | 0 | job, lifeAffiliation, lifeGoals | 収穫を間近に控えた夜、武装した荒野の略奪者集団が農場を取り囲み、全収穫物とトラクターの引き渡しを要求してきた。民兵の |

### `data/parts/routes/rhodes-and-factions/aftercare-and-eligibility.js`（1件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `sr_rhodes_reapplication` | `rhodes-and-factions/aftercare-and-eligibility.js:78` | - | lifeAffiliation | 数年前に応募して縁がなかったロドスから、別の部署で人手を募っているという知らせが届いた。あの頃から新しく覚えた仕事も |

### `data/regional/columbia.js`（1件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `choice_columbia_03` | `regional/columbia.js:294` | 0 | job | 配属先のライン生命のバイオ研究セクションで、感染者の被験者を使い捨てにする非人道的な生体実験の極秘データを目にしてし |

### `data/regional/ursus.js`（1件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `choice_ursus_04` | `regional/ursus.js:290` | 14,0 | job | 帝国陸軍が、辺境防衛部隊の拡充のために破格の支度金を掲げて若者を募っていた。軍歴を積めば下級貴族への道も開かれるが、 |

### `data/regional/victoria.js`（1件）

| イベントID | 定義位置 | job効果の値 | 主な効果キー | 導入文の冒頭 |
|---|---|---|---|---|
| `choice_victoria_01` | `regional/victoria.js:230` | 0 | job | 勤め先の現場で、度重なる賃金カットと安全対策の軽視に反発し、労働組合が一斉ストライキに踏み切った。正門前でピケを張る |


## 4. B：職務専用シナリオ・IDから抽出された全262イベント

Aへ計上されたIDは重複しない。所属・就職を直接生じない勤務中の出来事、求職案内、業務の後年談も含む。全件の効果や地域の列はJSONで参照できる。

- **`data/parts/routes/rhodes-and-factions/rhodes-landship-daily.js`（60件）**：`daily_rhodes_01`、`daily_rhodes_02`、`daily_rhodes_03`、`daily_rhodes_04`、`daily_rhodes_05`、`daily_rhodes_06`、`daily_rhodes_07`、`daily_rhodes_08`、`daily_rhodes_09`、`daily_rhodes_10`、`daily_rhodes_11`、`daily_rhodes_12`、`daily_rhodes_13`、`daily_rhodes_14`、`daily_rhodes_15`、`daily_rhodes_16`、`daily_rhodes_17`、`daily_rhodes_18`、`daily_rhodes_19`、`daily_rhodes_20`、`daily_rhodes_21`、`daily_rhodes_22`、`daily_rhodes_23`、`daily_rhodes_24`、`daily_rhodes_25`、`daily_rhodes_26`、`daily_rhodes_27`、`daily_rhodes_28`、`daily_rhodes_29`、`daily_rhodes_30`、`daily_rhodes_31`、`daily_rhodes_32`、`daily_rhodes_33`、`daily_rhodes_34`、`daily_rhodes_35`、`daily_rhodes_36`、`daily_rhodes_37`、`daily_rhodes_38`、`daily_rhodes_39`、`daily_rhodes_40`、`daily_rhodes_41`、`daily_rhodes_42`、`daily_rhodes_43`、`daily_rhodes_44`、`daily_rhodes_45`、`daily_rhodes_46`、`daily_rhodes_47`、`daily_rhodes_48`、`daily_rhodes_49`、`daily_rhodes_50`、`daily_rhodes_51`、`daily_rhodes_52`、`daily_rhodes_53`、`daily_rhodes_54`、`daily_rhodes_55`、`daily_rhodes_56`、`daily_rhodes_57`、`daily_rhodes_58`、`daily_rhodes_59`、`daily_rhodes_60`

- **`data/parts/routes/regional-careers/events-frontier.js`（30件）**：`car_sar_guard_daily_01`、`car_sar_guard_choice_assassination`、`car_sar_warrior_daily_01`、`car_sar_warrior_choice_beast`、`car_sam_priest_daily_01`、`car_sam_priest_choice_demon_whisper`、`car_sam_warrior_daily_01`、`car_sam_warrior_choice_collapse_beast`、`car_kje_karlan_daily_01`、`car_kje_karlan_choice_ambush`、`car_kje_monk_daily_01`、`car_kje_monk_choice_avalanche`、`car_kazdel_mil_daily_01`、`car_kazdel_mil_choice_major_battle`、`car_kazdel_bone_daily_01`、`car_kazdel_bone_choice_cursed_bone`、`car_ibe_inq_daily_01`、`car_ibe_inq_choice_seaborn_attack`、`car_ibe_tuner_daily_01`、`car_ibe_tuner_choice_fog`、`car_bol_soldier_daily_01`、`car_bol_soldier_choice_counterattack`、`car_bol_dossoles_daily_01`、`car_bol_dossoles_choice_syndicate`、`car_rim_eng_daily_01`、`car_rim_eng_choice_gas_leak`、`car_min_champ_daily_01`、`car_min_champ_choice_grand_games`、`car_min_orator_daily_01`、`car_min_orator_choice_foreign_plot`

- **`data/parts/routes/rhodes-and-factions/staff-routes-events-01.js`（18件）**：`sr_rhodes_service_daily`、`sr_rhodes_maintenance_daily`、`sr_rhodes_research_daily`、`sr_rhodes_former_worker`、`sr_reunion_neighbour_contact`、`sr_reunion_ordinary_followup`、`sr_chernobog_distant_news`、`sr_rhodes_ship_routine`、`sr_rhodes_branch_routine`、`sr_rhodes_field_assignment`、`sr_rhodes_transport_dispatch`、`sr_rhodes_reserve_drill`、`sr_rhodes_colleague_introduction`、`sr_rhodes_colleague_followup`、`sr_rhodes_cafeteria_flavors`、`sr_rhodes_greenhouse_rest`、`sr_rhodes_internal_bias_conflict`、`sr_rhodes_bias_rescue_reconciliation`

- **`data/parts/routes/regional-careers/events-east.js`（16件）**：`car_yan_court_daily_01`、`car_yan_suis_daily_01`、`car_yan_suis_choice_beast_shard`、`car_lmd_guard_daily_01`、`car_lmd_guard_choice_raid`、`car_lmd_black_daily_01`、`car_hig_samurai_daily_01`、`car_hig_samurai_choice_duel`、`car_hig_ninja_daily_01`、`car_hig_cyber_daily_01`、`car_hig_cyber_choice_offensive`、`car_hig_shinto_daily_01`、`car_hig_touhou_daily_01`、`car_hig_ninja_after_escape`、`car_yan_court_after_dismissal`、`car_lmd_black_after_detention`

- **`data/parts/routes/regional-careers/events-west.js`（13件）**：`car_urs_officer_daily_01`、`car_urs_guard_daily_01`、`car_vic_infantry_daily_01`、`car_vic_infantry_choice_skirmish`、`car_vic_royal_daily_01`、`car_lei_golden_daily_01`、`car_lei_golden_choice_witch_remnant`、`car_lat_executor_daily_01`、`car_lat_executor_choice_dispute`、`car_urs_officer_after_dismissal`、`car_urs_guard_after_expulsion`、`car_urs_officer_disciplinary_review`、`car_urs_guard_disciplinary_review`

- **`data/parts/routes/rhodes-and-factions/reunion-lifepath.js`（12件）**：`life_reunion_early_contact`、`life_reunion_early_camp_daily`、`life_reunion_chernobog_base_assignment`、`life_reunion_chernobog_base_daily`、`life_reunion_chernobog_aftermath`、`life_reunion_survivor_reconnection`、`sr_reunion_movement_join`、`sr_reunion_border_camp_daily`、`sr_reunion_border_refugees`、`sr_reunion_border_relocation`、`sr_reunion_moving_column_daily`、`sr_reunion_departure_legacy`

- **`data/parts/routes/regional-careers/events-central.js`（9件）**：`car_col_pioneer_daily_01`、`car_kaz_comp_knight_daily_01`、`car_kaz_comp_knight_choice_match`、`car_kaz_armorless_daily_01`、`car_sir_soldier_daily_01`、`car_sir_soldier_choice_turf_war`、`car_sir_police_daily_01`、`car_sie_obs_daily_01`、`car_col_pioneer_after_dispossession`

- **`data/base/career-entry.js`（8件）**：`life_columbia_failed_application_followup`、`life_victoria_failed_application_followup`、`vic_clerk_contract_review`、`col_tech_safety_review`、`col_tech_role_review`、`col_tech_supplier_exception`、`vic_clerk_after_departure`、`col_tech_after_departure`

- **`data/parts/routes/rhodes-and-factions/staff-routes-events-04.js`（7件）**：`sr_kazimierz_claim_correction`、`sr_kazimierz_correction_response`、`sr_iberia_lighthouse_warning`、`sr_iberia_warning_followup`、`sr_londinium_recipient_response`、`sr_ursus_account_recipient_response`、`sr_information_claim_recipient_later_report`

- **`data/social/organizations-and-infection.js`（7件）**：`earth_discr_work_years`、`ori_work_safety_instruction`、`ori_work_safety_followup`、`ori_transport_dust`、`ori_victoria_factory_shift`、`ori_ursus_mine_request`、`ori_rim_mine_inspection`

- **`data/work/contracts.js`（7件）**：`inter_laterano_sarkaz_opportunity_v76`、`inter_sankta_sarkaz_work_v76`、`inter_victoria_taran_speech_v76`、`inter_ursus_minority_work_v76`、`inter_laterano_resident_sarkaz_review_v76`、`inter_prior_contact_followup_v76`、`inter_laterano_sarkaz_route_review_v87`

- **`data/parts/routes/rhodes-and-factions/rhine-routes.js`（6件）**：`sr_rhine_patent_breakthrough`、`sr_rhine_diabolic_ethical_crossroad`、`sr_rhine_359_transmitter_consent`、`sr_rhine_lone_trail_sky_horizon`、`sr_rhine_after_departure_livelihood`、`sr_rhine_whistleblower_return_review`

- **`data/base/daily-regional.js`（5件）**：`rim_local_mine_slowdown_daily`、`rim_transporter_mine_handoff_daily`、`ursus_factory_skill_handoff_daily`、`victoria_factory_drawing_notes_daily`、`mine_collapse_creaking_beam_daily`

- **`data/parts/extensions/social-and-care/local-discrimination.js`（5件）**：`earth_discr_work_gate`、`earth_discr_work_follow`、`earth_discr_sarkaz_work_later`、`earth_discr_g1_market_coin`、`earth_discr_g2_work_lunch`

- **`data/parts/routes/rhodes-and-factions/staff-routes-events-02.js`（5件）**：`sr_ursus_civilian_account`、`sr_ursus_civilian_account_followup`、`sr_londinium_distant_news`、`sr_londinium_price_followup`、`sr_londinium_claim_conflict_followup`

- **`data/parts/routes/rhodes-and-factions/staff-routes-events-03.js`（5件）**：`sr_londinium_counterreport_followup`、`sr_kazimierz_outage_report`、`sr_kazimierz_outage_followup`、`sr_kazimierz_outage_statement`、`sr_kazimierz_outage_statement_followup`

- **`data/world/class-and-locality.js`（5件）**：`cl_household_work_entry`、`cl_siracusa_market_patron`、`cl_sargon_trade_water`、`cl_bolivar_crop_labor`、`local_transport_pressure`

- **`data/base/regional-west.js`（4件）**：`col_frontier_after_contract_loss`、`kaz_knight`、`kaz_business`、`col_reuse_market`

- **`data/parts/routes/rhodes-and-factions/arena-work.js`（4件）**：`sr_siracusa_independent_business`、`sr_siracusa_trade_followup`、`sr_siracusa_trade_relocation`、`sr_siracusa_trade_pause_review`

- **`data/base/regional-conflict.js`（3件）**：`bol_local_contract`、`sie_seasonal_work`、`bol_dossoles_championship_work`

- **`data/education/p17-reviewed-prose.js`（3件）**：`edu_course_admission_contract`、`edu_employer_sponsored_course`、`edu_study_work_balance`

- **`data/parts/routes/rhodes-and-factions/cross-faction-routes.js`（3件）**：`sr_intersect_battlefield_mercy`、`sr_intersect_hostage_sympathy`、`sr_reunion_to_rhodes_sanctuary`

- **`data/relationships/facility-people.js`（3件）**：`people_work_introduction`、`people_work_followup`、`people_work_small_help`

- **`data/social/conflict.js`（3件）**：`v78_taran_office_language`、`v78_hardline_sarkaz_employer`、`v87_hardline_sarkaz_employer_review`

- **`data/extensions/family-and-community.js`（2件）**：`life_savra_craft_later_years`、`family_spouse_work_preference`

- **`data/life/goals-and-family.js`（2件）**：`people_work_life_conversation`、`people_work_care_schedule`

- **`data/parts/extensions/social-and-care/attitudes-family-knights.js`（2件）**：`infection_mine_crystal_contact`、`kaz_knight_injury_adaptation`

- **`data/parts/routes/rhodes-and-factions/bsw-routes.js`（2件）**：`sr_bsw_convoy_protection`、`sr_bsw_davistown_debt_conflict`

- **`data/relationships/close-disclosure.js`（2件）**：`life_ursus_zelgrad_post_settlement_job_search`、`life_ursus_zelgrad_post_settlement_work_review`

- **`data/world/facilities.js`（2件）**：`facility_work_restricted`、`facility_work_recovery`

- **`data/base/family-and-livelihood.js`（1件）**：`parent_work_news`

- **`data/health/mortality.js`（1件）**：`life_mine_collapse_crisis`

- **`data/parts/extensions/education-and-later-life/elder-life.js`（1件）**：`elder_choice_craft_teaching`

- **`data/parts/extensions/education-and-later-life/relationships-events-01.js`（1件）**：`romance_daily_market_walk`

- **`data/parts/routes/regional-careers/entry-east.js`（1件）**：`car_hig_cyber_discovery`

- **`data/parts/routes/rhodes-and-factions/aftercare-and-eligibility.js`（1件）**：`life_rhodes_research_pause_review`

- **`data/parts/routes/rhodes-and-factions/staff-routes-events-05.js`（1件）**：`sr_information_claim_organization_meeting`

- **`data/review/choice-policy.js`（1件）**：`v81_job_silence`

- **`data/social/learning.js`（1件）**：`v77_accidental_transport_originium`


## 5. C：労働・経済の周辺全526イベント

金融・家計・治療・教育への支払い等は後続の意味校閲で「就労ゲート対象」「本人の勤務履歴の参照対象」「経済だけの対象」に分割する。現段階で機械的に就職可能性を制限しない。

- **`data/base/daily-regional.js`（23件）**：`f73`、`f74`、`f75`、`f77`、`f84`、`f85`、`f86`、`f87`、`f88`、`f89`、`f93`、`f94`、`f95`、`f96`、`f97`、`f98`、`siesta_shop_reopens_after_move`、`kjerag_transporter_village_delivery_daily`、`laterano_household_papers`、`col_pioneer_radio_daily`、`rim_forecast_route_daily`、`siracusa_wine_shop_ledger_daily`、`ursus_zelgrad_chimney_stench_daily`

- **`data/world/class-and-locality.js`（22件）**：`cl_child_school_supplies`、`cl_family_legacy_expectation`、`cl_urban_rent_pressure`、`cl_urban_housing_followup`、`cl_victoria_service_household`、`cl_tara_language_gate`、`cl_kazimierz_sponsorship`、`cl_yerag_community_vote`、`cl_columbia_school_fee`、`life_sargon_water_round`、`life_bolivar_upland_crops`、`cl_kazdel_displacement_history`、`cl_legacy_network_followup`、`cl_training_long_term`、`cl_social_mobility_reflection`、`cl_neighbors_crossclass`、`cl_neighborhood_after`、`local_food_shortage`、`local_medical_capacity`、`local_jobs_pressure`、`local_housing_pressure`、`local_recovery_choices`

- **`data/education/p17-reviewed-prose.js`（20件）**：`edu_higher_search_decision`、`edu_overage_equivalency_review`、`edu_school_relocation_family`、`edu_route_recovered_notice`、`edu_fee_itemization`、`edu_entrance_exam_journey`、`edu_education_credit_terms`、`edu_unpaid_commute_cost_review`、`edu_household_tuition_discussion`、`edu_former_teacher_meeting`、`edu_child_guardian_disagreement`、`edu_sibling_school_cost_conflict`、`edu_apprentice_literacy_exchange`、`edu_adult_evening_literacy`、`edu_informal_skill_assessment`、`edu_dependent_future_school_consult`、`edu_region_kazimierz_sponsor_training`、`edu_region_columbia_corporate_scholarship`、`edu_region_higashi_dojo_learning`、`edu_later_life_retraining_after_displacement`

- **`data/parts/extensions/education-and-later-life/relationships-events-01.js`（19件）**：`romance_followup`、`romance_future_talk`、`romance_marriage_choice`、`romance_cohabitation_review`、`family_sibling_birth`、`family_sibling_exposure`、`family_sibling_exposure_followup`、`family_sibling_bereavement`、`family_sibling_infection`、`family_care_network_contact`、`family_care_network_move_news`、`romance_daily_roof_breeze`、`romance_daily_letter_exchange`、`romance_daily_cohabiting_morning`、`romance_daily_cohabiting_budget_relief`、`family_daily_spouse_cooking`、`family_daily_spouse_health_care`、`family_daily_spouse_shared_quiet`、`family_daily_spouse_mutual_gift`

- **`data/base/confinement-and-education.js`（18件）**：`confined_care`、`confined_pet_care`、`detain_life`、`seg_life`、`education_return_path`、`education_school_family_pressure`、`higher_ed`、`education_upper_path`、`education_funding_review`、`uni_fee`、`uni_final_fee`、`voc_fee`、`voc_final_fee`、`yakuza_collect`、`siracusa_credit_collection`、`columbia_credit_collection`、`education_case_review`、`edu_lower_stage_site_review`

- **`data/base/daily-adulthood.js`（17件）**：`f28`、`f29`、`f31`、`f32`、`f33`、`infected_neighbor`、`f38`、`f40`、`f41`、`f42`、`f45`、`f46`、`f47`、`f48`、`f49`、`f50`、`f52`

- **`data/base/family-and-livelihood.js`（17件）**：`loan_shark_lungmen`、`loan_shark_siracusa`、`loan_shark_columbia`、`inv`、`hobby`、`hobby_strain`、`family_launch`、`family_separation`、`family_allowance_support`、`fam_rehire`、`fam_mafia`、`parent_household_move_news`、`parent_treatment_review`、`fam_care`、`fam_care_followup`、`fam_child_inf`、`fam_child_care`

- **`data/base/regional-west.js`（17件）**：`f72`、`urs_sweep`、`col_insure`、`col_coverage_gap`、`col_research`、`kaz_infknight`、`lei_arts`、`lei_witchking`、`lei_noble`、`lei_noble_after`、`lei_noble_later`、`sir_family`、`sir_family_review`、`sir_family_duty`、`sir_family_obligation`、`sir_hospital`、`col_timecard_dispute`

- **`data/base/regional-conflict.js`（16件）**：`rim_debt`、`kaz_merc`、`kazdel_rebuild`、`sie_tourist`、`minos_competition_skill_later_life`、`rim_shipment_label`、`bol_dossoles_traveler_account`、`timeline_columbia_independence`、`timeline_kazdel_commission`、`timeline_siracusa_unification`、`timeline_el_sol_renovation_paused`、`timeline_sarcophagus_discovery`、`timeline_ursus_great_rebellion`、`timeline_rim_billiton_independence`、`timeline_talulah_leave`、`timeline_katorga_incident`

- **`data/regional/victoria.js`（16件）**：`daily_victoria_18`、`daily_victoria_19`、`daily_victoria_22`、`daily_victoria_31`、`daily_victoria_35`、`daily_victoria_37`、`daily_victoria_39`、`daily_victoria_40`、`daily_victoria_41`、`daily_victoria_42`、`daily_victoria_43`、`daily_victoria_60`、`daily_victoria_62`、`choice_victoria_03`、`choice_victoria_07`、`choice_victoria_09`

- **`data/parts/extensions/social-and-care/local-discrimination.js`（15件）**：`earth_discr_housing_review`、`earth_discr_housing_record_after`、`earth_discr_school_later`、`earth_discr_sarkaz_application`、`earth_discr_iberia_aegir_port`、`earth_discr_iberia_aegir_return`、`earth_discr_tara_language`、`earth_discr_sarkaz_infected_double`、`earth_persecution_ursus_sweep`、`earth_persecution_columbia_clinical_trap`、`earth_persecution_iberia_inquisition_detention`、`earth_persecution_ursus_family_infection_spill`、`earth_discr_leak_cough`、`earth_discr_disclose_friend`、`earth_discr_g1_tailor`

- **`data/extensions/family-and-community.js`（14件）**：`life_rim_skill_handover_followup`、`life_rim_workmate_followup`、`family_spouse_household_arrangement`、`family_spouse_finance_strain`、`family_spouse_health_review`、`family_spouse_migration_choice`、`family_spouse_independent_move_notice`、`family_spouse_separate_life`、`family_spouse_unemployment_support`、`family_spouse_infected_housing_pressure`、`family_spouse_housing_choice`、`family_divorce_child_residence`、`life_ursus_school_habit`、`life_ursus_school_aid_later`

- **`data/regional/columbia.js`（14件）**：`daily_columbia_19`、`daily_columbia_27`、`daily_columbia_41`、`daily_columbia_42`、`daily_columbia_43`、`daily_columbia_44`、`daily_columbia_54`、`daily_columbia_56`、`choice_columbia_01`、`choice_columbia_05`、`choice_columbia_06`、`choice_columbia_07`、`choice_columbia_08`、`choice_columbia_09`

- **`data/regional/rim-billiton.js`（13件）**：`daily_rim_19`、`daily_rim_21`、`daily_rim_23`、`daily_rim_30`、`daily_rim_40`、`daily_rim_42`、`daily_rim_44`、`daily_rim_47`、`daily_rim_48`、`daily_rim_51`、`daily_rim_59`、`choice_rim_02`、`choice_rim_04`

- **`data/regional/siracusa.js`（12件）**：`daily_siracusa_03`、`daily_siracusa_16`、`daily_siracusa_24`、`daily_siracusa_31`、`daily_siracusa_39`、`daily_siracusa_40`、`daily_siracusa_41`、`daily_siracusa_53`、`daily_siracusa_56`、`choice_siracusa_06`、`choice_siracusa_07`、`choice_siracusa_08`

- **`data/regional/ursus.js`（11件）**：`daily_ursus_04`、`daily_ursus_14`、`daily_ursus_20`、`daily_ursus_37`、`daily_ursus_40`、`daily_ursus_41`、`daily_ursus_42`、`daily_ursus_43`、`choice_ursus_01`、`choice_ursus_06`、`choice_ursus_09`

- **`data/regional/higashi.js`（10件）**：`daily_higashi_13`、`daily_higashi_17`、`daily_higashi_22`、`daily_higashi_28`、`daily_higashi_40`、`daily_higashi_49`、`choice_higashi_05`、`choice_higashi_07`、`choice_higashi_08`、`choice_higashi_10`

- **`data/social/organizations-and-infection.js`（10件）**：`ori_industrial_scrap`、`ori_diagnosis_decision`、`ori_followup_access`、`ori_diagnosed_workplace`、`ori_rhodes_examination_contact`、`ori_sarkaz_noncausal`、`ori_prevention_peer_teaching`、`ori_columbia_insurance_records`、`ori_iberia_origin_doubt`、`ori_dust_broken_ppe`

- **`data/base/life-and-health.js`（9件）**：`dst`、`dg`、`lov`、`chi`、`ksc`、`par_death`、`ill`、`disaster_displacement_after`、`alley_attack`

- **`data/health/mortality.js`（9件）**：`life_medical_occupational`、`life_medical_nutrition`、`life_medical_oripathy`、`life_medical_urgent_review`、`life_medical_followup`、`life_late_care_planning`、`life_unexpected_rescue`、`life_columbia_clinical_trap_decision`、`life_debt_bankruptcy_crisis`

- **`data/parts/extensions/education-and-later-life/training.js`（9件）**：`life_night_study`、`life_family_remittance`、`life_youth_apprenticeship`、`life_overtime_offer`、`life_hobby_budget`、`life_pet_vet_cost`、`life_parent_visit`、`life_room_repair`、`life_neighbor_mutual_aid`

- **`data/parts/extensions/social-and-care/local-support-referrals.js`（9件）**：`life_chernobog_worksite_errand`、`life_local_mutual_aid`、`life_rhodes_referral_response`、`life_rhodes_clinic_visit`、`life_rhodes_clinic_reschedule`、`life_rhodes_care_review`、`life_reunion_local_entry`、`life_reunion_order_conflict`、`life_chernobog_neighbourhood_reopening`

- **`data/regional/iberia.js`（9件）**：`daily_iberia_19`、`daily_iberia_34`、`daily_iberia_37`、`daily_iberia_43`、`daily_iberia_44`、`daily_iberia_49`、`daily_iberia_51`、`choice_iberia_04`、`choice_iberia_06`

- **`data/regional/kazimierz.js`（9件）**：`daily_kazimierz_18`、`daily_kazimierz_26`、`daily_kazimierz_34`、`daily_kazimierz_46`、`daily_kazimierz_48`、`daily_kazimierz_54`、`choice_kazimierz_02`、`choice_kazimierz_03`、`choice_kazimierz_08`

- **`data/regional/yan.js`（9件）**：`daily_yan_16`、`daily_yan_50`、`daily_yan_51`、`choice_yan_01`、`choice_yan_02`、`choice_yan_03`、`choice_yan_06`、`choice_yan_08`、`choice_yan_09`

- **`data/base/childhood-attitudes.js`（8件）**：`fever`、`sch`、`pet`、`pet_strain`、`pet_life_turn`、`bias_family_infected_parent_solidarity`、`bias_family_sarkaz_model`、`attitude_counterexample`

- **`data/social/conflict.js`（8件）**：`v87_family_contact_boundary_diagnosis`、`v78_family_breach_recovery`、`v78_opponent_cost`、`v78_sarkaz_self_protection`、`v78_id_document_victoria`、`v79_parent_public_rejection`、`v79_parent_defends_infected`、`v79_parent_views_diverge`

- **`data/base/daily-war-and-identity.js`（7件）**：`f104`、`f105`、`f106`、`f107`、`f109`、`f110`、`f111`

- **`data/base/world-and-contacts.js`（7件）**：`wld_chernobog`、`wld_rhodes`、`wld_plague`、`wld_tax`、`wld_friend`、`wld_friend_repay`、`friend_death_notice`

- **`data/parts/extensions/education-and-later-life/leithanian-political-life.js`（7件）**：`life_leithanian_civic_entry`、`life_leithanian_civic_routine`、`life_leithanian_civic_activity`、`life_leithanian_civic_relocation`、`life_leithanian_civic_later_active`、`life_leithanian_civic_later_suspended`、`life_leithanian_civic_after_exit`

- **`data/parts/extensions/social-and-care/attitudes-family-knights.js`（7件）**：`family_child_exposure_followup`、`family_player_infection_reaction`、`family_marital_strain`、`family_spouse_death`、`family_spouse_infection_care`、`family_spouse_treatment_review`、`family_former_spouse_move_notice`

- **`data/regional/bolivar.js`（7件）**：`daily_bolivar_08`、`daily_bolivar_46`、`daily_bolivar_48`、`daily_bolivar_60`、`choice_bolivar_06`、`choice_bolivar_07`、`choice_bolivar_09`

- **`data/regional/siesta.js`（7件）**：`daily_siesta_32`、`daily_siesta_39`、`daily_siesta_40`、`daily_siesta_52`、`daily_siesta_54`、`daily_siesta_55`、`choice_siesta_05`

- **`data/parts/extensions/education-and-later-life/leithanian-noble-household.js`（6件）**：`life_leithanian_noble_household_entry`、`life_leithanian_noble_household_routine`、`life_leithanian_noble_household_review`、`life_leithanian_noble_household_later_active`、`life_leithanian_noble_household_later_suspended`、`life_leithanian_noble_household_after_exit`

- **`data/parts/extensions/social-and-care/goals-craft-family.js`（6件）**：`family_newlywed_residence`、`life_goal_start`、`life_goal_review`、`life_skill_practice`、`life_rim_supply_delay`、`life_rim_skill_handover`

- **`data/regional/kazdel.js`（6件）**：`daily_kazdel_27`、`daily_kazdel_39`、`daily_kazdel_40`、`daily_kazdel_49`、`choice_kazdel_02`、`choice_kazdel_03`

- **`data/regional/minos.js`（6件）**：`daily_minos_14`、`daily_minos_43`、`daily_minos_44`、`daily_minos_45`、`daily_minos_48`、`choice_minos_04`

- **`data/regional/sargon.js`（6件）**：`daily_sargon_23`、`daily_sargon_52`、`daily_sargon_53`、`daily_sargon_54`、`choice_sargon_03`、`choice_sargon_05`

- **`data/relationships/close-disclosure.js`（6件）**：`v87_diagnosis_to_father`、`v87_diagnosis_to_mother`、`v87_diagnosis_to_spouse`、`v87_diagnosis_to_friend`、`life_ursus_zelgrad_later_unemployment`、`life_ursus_zelgrad_later_unemployment_review`

- **`data/relationships/person-ties.js`（6件）**：`v82_colleague_exclusion_statement`、`v82_disclose_to_colleague`、`v82_colleague_rejects_patient`、`v82_colleague_stays`、`v82_person_after_rejection`、`v82_known_colleague_support`

- **`data/parts/extensions/social-and-care/infected-organization-operations.js`（5件）**：`life_infected_org_records`、`life_infected_org_rotation`、`life_infected_org_finance`、`life_infected_org_privacy`、`life_infected_org_reentry`

- **`data/parts/extensions/social-and-care/research-reunion.js`（5件）**：`life_rhodes_research_offer`、`life_rhodes_research_review`、`life_rhodes_research_ethics`、`life_rhodes_research_legacy`、`life_reunion_reorg_review`

- **`data/regional/kjerag.js`（5件）**：`daily_kjerag_18`、`daily_kjerag_41`、`daily_kjerag_47`、`daily_kjerag_51`、`choice_kjerag_07`

- **`data/regional/laterano.js`（5件）**：`daily_laterano_16`、`daily_laterano_50`、`choice_laterano_01`、`choice_laterano_03`、`choice_laterano_08`

- **`data/regional/sami.js`（5件）**：`daily_sami_48`、`daily_sami_49`、`choice_sami_05`、`choice_sami_07`、`choice_sami_08`

- **`data/base/regional-east.js`（4件）**：`ibe_followup`、`yan_ancestor`、`lon_housing`、`sar_tribe`

- **`data/life/goals-and-family.js`（4件）**：`people_school_life_conversation`、`people_clinic_life_conversation`、`people_school_housing_concern`、`people_clinic_skill_continuity`

- **`data/parts/extensions/education-and-later-life/relationships-events-02.js`（4件）**：`family_care_network_member_move_news`、`family_sibling_independence`、`family_sibling_parent_support_news`、`family_sibling_contact`

- **`data/parts/extensions/social-and-care/affiliation-places.js`（4件）**：`life_leithanian_noble_household_relocation`、`life_leithanian_noble_household_absence_review`、`life_siracusa_familia_relocation`、`life_siracusa_familia_absence_review`

- **`data/regional/lungmen.js`（4件）**：`daily_lungmen_19`、`daily_lungmen_50`、`daily_lungmen_60`、`daily_lungmen_62`

- **`data/review/choice-policy.js`（4件）**：`v81_housing_account`、`v81_aftermath_mutualaid`、`v81_memory_without_penalty`、`v87_medical_access_aftermath`

- **`data/social/learning.js`（4件）**：`v77_written_application`、`v77_prejudice_infected_workplace`、`v77_exclusion_review`、`v77_adult_literacy_path`

- **`data/parts/extensions/education-and-later-life/assets-and-property.js`（3件）**：`asset_choice_property_purchase`、`asset_choice_workshop_open`、`asset_daily_workshop_revenue`

- **`data/parts/extensions/education-and-later-life/relationships-events-03.js`（3件）**：`infection_family_disclosure_choice`、`infection_diagnosis_disclosure_scope`、`infection_workplace_disclosure`

- **`data/parts/extensions/social-and-care/infected-organizations.js`（3件）**：`life_infected_association_choice`、`life_infected_exclusion_consequence`、`life_infected_organization_dues`

- **`data/base/daily-childhood.js`（2件）**：`f20`、`f24`

- **`data/base/daily-family.js`（2件）**：`adult_child_contact`、`life_personal_wishes`

- **`data/parts/extensions/education-and-later-life/family-care.js`（2件）**：`family_child_future`、`family_child_bereavement`

- **`data/parts/extensions/education-and-later-life/ursus-student-life.js`（2件）**：`life_ursus_student_assembly_later`、`life_ursus_student_assembly_pause_review`

- **`data/parts/extensions/social-and-care/kazdel-displaced-life.js`（2件）**：`life_kazdel_displaced_start`、`life_kazdel_displaced_daily`

- **`data/relationships/facility-people.js`（2件）**：`site_workplace_alternative`、`site_workplace_old_contact`

- **`data/world/facilities.js`（2件）**：`facility_school_disruption`、`facility_new_area_orientation`

- **`data/parts/extensions/education-and-later-life/elder-life.js`（1件）**：`elder_choice_grandchild_gift`

- **`data/regional/leithanien.js`（1件）**：`choice_leithanien_06`

- **`data/review/historical-reviews.js`（1件）**：`v86_individual_colleague_apology`


## 6. D：職務語の漏れ検査全74イベント

- **`data/regional/higashi.js`（6件）**：`daily_higashi_42`、`daily_higashi_52`、`daily_higashi_53`、`daily_higashi_54`、`daily_higashi_55`、`daily_higashi_56`

- **`data/regional/lungmen.js`（5件）**：`daily_lungmen_48`、`daily_lungmen_49`、`daily_lungmen_51`、`daily_lungmen_52`、`choice_lungmen_02`

- **`data/regional/iberia.js`（4件）**：`daily_iberia_39`、`daily_iberia_41`、`daily_iberia_45`、`daily_iberia_46`

- **`data/regional/siesta.js`（4件）**：`daily_siesta_41`、`daily_siesta_57`、`choice_siesta_06`、`choice_siesta_09`

- **`data/health/mortality.js`（3件）**：`life_mental_crisis_recovery`、`life_rehabilitation_followup`、`life_harassment_threat_escalation`

- **`data/parts/extensions/social-and-care/local-discrimination.js`（3件）**：`earth_discr_tara_memory`、`earth_discr_leak_wound`、`earth_discr_g3_erased_coworker`

- **`data/regional/columbia.js`（3件）**：`daily_columbia_39`、`daily_columbia_40`、`daily_columbia_53`

- **`data/regional/kjerag.js`（3件）**：`daily_kjerag_40`、`daily_kjerag_53`、`daily_kjerag_54`

- **`data/regional/laterano.js`（3件）**：`daily_laterano_57`、`daily_laterano_58`、`daily_laterano_60`

- **`data/regional/minos.js`（3件）**：`daily_minos_41`、`daily_minos_46`、`daily_minos_50`

- **`data/regional/sargon.js`（3件）**：`daily_sargon_45`、`daily_sargon_47`、`daily_sargon_56`

- **`data/regional/siracusa.js`（3件）**：`daily_siracusa_52`、`daily_siracusa_57`、`daily_siracusa_58`

- **`data/regional/victoria.js`（3件）**：`daily_victoria_44`、`daily_victoria_53`、`daily_victoria_55`

- **`data/base/regional-conflict.js`（2件）**：`timeline_tenth_ursus_kazimierz_war`、`timeline_kazdel_war_declared`

- **`data/education/p17-reviewed-prose.js`（2件）**：`edu_primary_commute_guardian`、`edu_student_public_meeting_distinction`

- **`data/parts/extensions/social-and-care/local-support-referrals.js`（2件）**：`life_ursus_school_aid_followup`、`life_ursus_school_aid_adult_followup`

- **`data/regional/kazdel.js`（2件）**：`daily_kazdel_50`、`daily_kazdel_59`

- **`data/regional/kazimierz.js`（2件）**：`daily_kazimierz_39`、`daily_kazimierz_47`

- **`data/regional/sami.js`（2件）**：`daily_sami_47`、`daily_sami_50`

- **`data/regional/yan.js`（2件）**：`daily_yan_49`、`daily_yan_52`

- **`data/base/confinement-and-education.js`（1件）**：`elder_community`

- **`data/base/daily-childhood.js`（1件）**：`f15`

- **`data/base/daily-regional.js`（1件）**：`f91`

- **`data/base/daily-war-and-identity.js`（1件）**：`f100`

- **`data/base/regional-east.js`（1件）**：`hig_shrine`

- **`data/base/regional-west.js`（1件）**：`vic_occupy`

- **`data/parts/extensions/social-and-care/affiliation-places.js`（1件）**：`life_debt_budget_review`

- **`data/parts/extensions/social-and-care/civilian-response.js`（1件）**：`life_londinium_civilian_response`

- **`data/parts/extensions/social-and-care/kazdel-displaced-life.js`（1件）**：`life_kazdel_return_appeal`

- **`data/regional/bolivar.js`（1件）**：`daily_bolivar_51`

- **`data/regional/leithanien.js`（1件）**：`daily_leithanien_40`

- **`data/regional/rim-billiton.js`（1件）**：`daily_rim_14`

- **`data/regional/ursus.js`（1件）**：`daily_ursus_39`

- **`data/social/organizations-and-infection.js`（1件）**：`ori_everyday_contact_myth`


## 7. 就労統合へ向けた決定的なギャップ

1. **就職前の雇用世界を確定する**：`facilitySpecsFor`は就業中なら職業IDから勤務先施設を追加する。学校と違い、地域の求人が存在し応募した結果として職業IDが与えられることを、一般職全体の標準経路として要求していない。
2. **汎用職の初回就業を移行する**：年次`prepareAnnualPersonalBudget`の初回就職抽選と`car`・`work_unemployed_reentry`を含む再就職経路は、実在する求人・募集条件・労働形態の証拠を要するか分類。
3. **特殊42職の所属を保持する**：地域職は雇用所属・職務・目標・終業処理に強い。職業IDだけの再利用、他地域への自動持ち越し、過去在籍を現在の雇用とみなす誤認を再導入しない。
4. **職業と身分・生計を分離する**：商売の手伝い、家庭内労働、短期の運搬契約、団体への献身、強制労働、露店・自営業は常勤の「雇用契約」に置換しない。
5. **学校と仕事の資格証拠を統合する**：`careerOpeningAssessment`が既に教育記録を参照する経路を、一般職や専門職の資格台帳で再利用する。学力点だけから免許・学位を生成しない。
6. **履歴・給与の参照を統一する**：`workContractHistory`と所属履歴、`lifeRecord.careerChanges`、年次給与を同じ`employmentEpisodeId`へ関連付ける。未来の雇用・死亡後の給料を発生させない。

### 既存実装の参照先

- `data/model/world.js`、`data/parts/routes/regional-careers/setup.js`、`data/parts/routes/rhodes-and-factions/staff-setup.js`、`arena-work.js`、`bsw-and-rhine-setup.js`（職業名・IDの登録）
- `data/base/career-entry.js`（一般職選択）、`data/parts/routes/regional-careers/{entry-*,events-*}.js`（特殊職の就職・職務）、`data/parts/routes/rhodes-and-factions/*.js`（組織職）
- `js/work/contracts.js`、`js/world/facilities.js`、`js/life/annual/personal-amounts.js`（雇用契約・勤務先・収入）
- `tests/p0-career-credential-lifecycle.test.cjs`、`tests/v87_work_contract_history.js`、`tests/v88_regional_career_outcomes.test.cjs`（現在の回帰検査）

本書の分類は事前調査であり、ゲームコード、イベント本文、職業ID、抽選率、保存形式は一切変更していない。
