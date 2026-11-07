# 歴史場面・旅程の根拠台帳

対象の基準は `75bf10b`。実行正本は `data/world/history.js`、`data/parts/historical-scene-reviews.js`、`js/information/history-scene.js` と `js/world/travel*.js`。この文書は分類・仮定・採否の根拠であり、課題や進捗の正本ではない。

## 日付・根拠の読み方

B/C/Dは既存HISTの根拠評価を維持する。参照先にはユーザー提供の二次整理資料も含まれ、Bを公式一次資料の保証へ読み替えない。月を独立した史料事実として保持していない場合、`sourceMonth`はnullである。下表の開始・終了月はゲームの表示境界であり、未特定の発生日を確定しない。都市名のない戦争・革命へ架空の確定現場を追加しない。地域生活や個人行動の描写、サービス料金・返答確率はSのゲーム仮定である。

## 37旗の対応

| 旗 | 史料上の年表表記 | 地域 | 都市 | 公知範囲／確度 | ゲーム開始月 | 参照 | 場面 |
|---|---|---|---|---|---|---|---|
| `el_sol_founded` | 1007年 | ボリバル | エル・ソル・エル・ソル | local_news／C | 1月 | `SRC_COMMUNITY_DOSSOLES_HISTORY`、`SRC_BOLIVAR_DOSSOLES_STORY` | `timeline_el_sol_founded` |
| `columbia_independence` | 1019年 | クルビア | 未特定 | local_news／B | 1月 | `SRC_TL_1000_1061`、`SRC_COMMUNITY_COLUMBIA_REVOLUTION` | `timeline_columbia_independence` |
| `four_emperors_war` | 1031年 | ガリア・ヴィクトリア・リターニア・ウルサス | 未特定 | public／B | 12月 | `SRC_TL_1000_1061`、`SRC_COMMUNITY_FOUR_NATIONS_WAR` | `timeline_four_emperors_war` |
| `kazdel_commission_founded` | 1031年 | カズデル | 未特定 | local_news／B | 9月 | `SRC_KAZDEL_BB1` | `timeline_kazdel_commission` |
| `great_silence` | 1038年 | イベリア | 未特定 | local_news／B | 7月 | `SRC_TL_1000_1061`、`SRC_SN_ST1_OLD_WELL`、`SRC_COMMUNITY_PROFOUND_SILENCE` | `timeline_great_silence`、`timeline_daily_great_silence_sea` |
| `siracusa_unification` | 1040年頃 | シラクーザ | 未特定 | local_news／C | 1月 | `SRC_TL_1000_1061` | `timeline_siracusa_unification` |
| `bolivar_civil_war` | 1048年 | ボリバル | 未特定 | local_news／C | 1月 | `SRC_TL_1000_1061` | `timeline_daily_bolivar_barricade` |
| `el_sol_renovation_paused` | 1048年 | ボリバル | エル・ソル・エル・ソル | local_news／C | 1月 | `SRC_TL_1000_1061`、`SRC_COMMUNITY_DOSSOLES_HISTORY`、`SRC_BOLIVAR_DOSSOLES_STORY` | `timeline_el_sol_renovation_paused` |
| `tenth_ursus_kazimierz_war` | 1062年 | ウルサス・カジミエーシュ | 未特定 | local_news／B | 1月 | `SRC_TL_EARLY` | `timeline_tenth_ursus_kazimierz_war` |
| `sarcophagus_discovery` | 1070年頃 | ウルサス | チェルノボーグ・チェルノボーグ | local_rumor／C | 1月 | `SRC_TL_EARLY`、`SRC_COMMUNITY_TERRA_TIMELINE` | `timeline_sarcophagus_discovery` |
| `bloodpeak_and_victorian_crown` | 1072年頃 | ヴィクトリア・ウルサス・カジミエーシュ | 未特定 | local_rumor／B | 1月 | `SRC_TL_EARLY` | `timeline_bloodpeak_and_victorian_crown` |
| `ursus_great_rebellion` | 1074年 | ウルサス | 未特定 | local_news／B | 1月 | `SRC_TL_EARLY`、`SRC_COMMUNITY_TERRA_TIMELINE` | `timeline_ursus_great_rebellion` |
| `rim_billiton_independence` | 1070年代 | レム・ビリトン | 未特定 | local_news／C | 1月 | `SRC_TL_EARLY` | `timeline_rim_billiton_independence` |
| `sandsoldier_incident` | 1075〜1076年頃 | サルゴン | 未特定 | local_rumor／D | 1月 | `SRC_TL_EARLY`、`SRC_COMMUNITY_TERRA_TIMELINE`、`SRC_A_WALK_DUST_TIMELINE`、`SRC_SARGON_WD1_WD5` | `timeline_sandsoldier_incident` |
| `sarcophagus_purge` | 1077年春 | ウルサス | チェルノボーグ・チェルノボーグ | sealed／B | 3月 | `SRC_TL_EARLY`、`SRC_COMMUNITY_TERRA_TIMELINE`、`SRC_URSUS_EP17_1` | `timeline_sarcophagus_purge` |
| `leith_revolution` | 1077年秋頃 | リターニア | 未特定 | public／C | 9月 | `SRC_TL_EARLY` | `timeline_leith_revolution` |
| `tarra_kidnap` | 1077年頃 | ヴィクトリア・龍門 | ロンディニウム・龍門 | local_rumor／C | 1月 | `SRC_TL_EARLY` | `timeline_tarra_kidnap` |
| `vanya_assassination` | 1081年頃 | ウルサス | 未特定 | local_news／C | 1月 | `SRC_TL_EARLY` | `timeline_vanya_assassination` |
| `victoria_leak` | 1084〜1085年頃 | ヴィクトリア | 未特定 | local_rumor／C | 1月 | `SRC_TL_EARLY`、`SRC_WD8_VICTORIA_SECRET_SCOPE` | `timeline_victoria_leak` |
| `el_sol_renamed_dossoles` | 1086年頃 | ボリバル | ドッソレス・ドッソレス | local_news／D | 1月 | `SRC_COMMUNITY_DOSSOLES_HISTORY`、`SRC_BOLIVAR_DOSSOLES_STORY` | `timeline_el_sol_renamed_dossoles` |
| `babel_split` | 1086年夏頃 | カズデル | 未特定 | sealed／B | 6月 | `SRC_TL_EARLY` | `timeline_babel_split` |
| `kazdel_conflict_started` | 1086年 | カズデル | 未特定 | local_news／B | 1月 | `SRC_KAZDEL_BB5` | `timeline_kazdel_conflict_started` |
| `talulah_kills` | 1088年頃 | ウルサス | 未特定 | sealed／B | 1月 | `SRC_TL_EARLY` | `timeline_talulah_kills` |
| `talulah_leave` | 1091年1月頃 | ウルサス | 未特定 | sealed／B | 1月 | `SRC_TL_EARLY` | `timeline_talulah_leave` |
| `kazdel_war_declared` | 1091年冬 | カズデル | 未特定 | local_news／B | 12月 | `SRC_KAZDEL_BB5` | `timeline_kazdel_war_declared` |
| `kazdel_civil_war` | 1092年 | カズデル | 未特定 | public／B | 1月 | `SRC_KAZDEL_BB5`、`SRC_TL_1094` | `timeline_kazdel_civil_war` |
| `kazdel_border_battle` | 1092年冬 | カズデル | 未特定 | local_news／B | 12月 | `SRC_KAZDEL_BB5` | `timeline_kazdel_border_battle` |
| `texas_family_purge` | 1092年頃 | クルビア | 未特定 | sealed／C | 1月 | `SRC_TEXAS_FAMILY_IS7`、`SRC_TL_1094` | `timeline_texas_family_purge` |
| `thelazia_dead` | 1094年 | カズデル・ヴィクトリア | ロンディニウム | public／B | 8月 | `SRC_TL_1094`、`SRC_KAZDEL_BBST1` | `timeline_thelazia_dead_londinium`、`timeline_daily_londinium_martial` |
| `chernobog_incident` | 1096年末〜1097年初頭 | ウルサス | チェルノボーグ | public／B | 12月 | `SRC_TL_CHERNOB_WINDOW`、`SRC_OFFICIAL_EP7_CHERNOB` | `timeline_chernobog_incident_local`、`timeline_daily_chernobog_alarm` |
| `kazimierz_major` | 1097年 | カジミエーシュ | カヴァレリエルキ | public／B | 6月 | `SRC_TL_MIDDLE` | `timeline_kazimierz_major` |
| `siesta_disaster` | 1097年夏 | シエスタ | シエスタ | local_news／C | 7月 | `SRC_SIESTA_TRANSITION`、`SRC_COMMUNITY_SIESTA_VOLCANIC_ACTIVITY` | `timeline_siesta_disaster_local` |
| `londinium_war` | 1098年 | ヴィクトリア | ロンディニウム | public／B | 7月 | `SRC_TL_LONDINIUM_WINDOW`、`SRC_GO8_END_OF_WAR` | `timeline_daily_londinium_siege` |
| `world_1099` | 1099年頃 | サルゴン・イベリア・クルビア・イェラグ・シラクーザ・ラテラーノ | 未特定 | public／D | 1月 | `SRC_TL_LATE` | `timeline_world_1099` |
| `world_1101` | 1101年頃 | イベリア・ウルサス | 未特定 | public／D | 1月 | `SRC_TL_LATE` | `timeline_world_1101` |
| `katorga_incident` | 1101年冬 | ウルサス | サンクト・グリファーブルク | local_news／B | 12月 | `SRC_URSUS_PAA_SYNOPSIS` | `timeline_katorga_incident` |
| `sui_1102` | 1102年頃 | 炎国 | 未特定 | public／D | 1月 | `SRC_TL_LATE` | `timeline_sui_1102` |

## 40場面の採否

情報を読んだことから死亡・負傷・建物焼失・入隊・転居を生成しない。直接場面の場所と時期を確立できない場合は地域・情報の場面へ改稿する。シエスタは旧市街・港への所在証拠がない住民に火砕流死を与えず、地域の避難準備と実旅程を接続する。四皇会戦のガリア首都、石棺の坑道、血峰の王宮、未特定のオアシス・国境戦場を自動生成していない。政治・自治・軍事補給など8経路は本人の加入と目標、2年後からの継続／退出へつながる。

| ID | 主形 | 地理・立場 | ゲーム期間 | 判断 |
|---|---|---|---|---|
| `timeline_el_sol_founded` | 都市・施設の直接場面 | ボリバル／エル・ソル／present-civilian | 1007年1月〜1007年12月 | 本人の実際の都市所在と当月を必須。根拠 C、場面 C |
| `timeline_columbia_independence` | 地域生活への影響 | クルビア／local-civilian | 1019年1月〜1019年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 B、場面 S |
| `timeline_four_emperors_war` | 受信した情報への反応 | informed-listener | 1031年12月〜1031年12月 | 受信済みinfoLogを必須。史実の結果・現場参加を先取りしない。根拠 B、場面 S |
| `timeline_kazdel_commission` | 地域生活への影響 | カズデル／local-civilian | 1031年9月〜1031年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 B、場面 S |
| `timeline_great_silence` | 地域生活への影響 | イベリア／local-civilian | 1038年7月〜1038年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 B、場面 S |
| `timeline_siracusa_unification` | 地域生活への影響 | シラクーザ／local-civilian | 1040年1月〜1040年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 C、場面 S |
| `timeline_el_sol_renovation_paused` | 都市・施設の直接場面 | ボリバル／エル・ソル／present-civilian | 1048年1月〜1048年12月 | 本人の実際の都市所在と当月を必須。根拠 C、場面 C |
| `timeline_tenth_ursus_kazimierz_war` | 受信した情報への反応 | informed-listener | 1062年1月〜1062年12月 | 受信済みinfoLogを必須。史実の結果・現場参加を先取りしない。根拠 B、場面 S |
| `timeline_sarcophagus_discovery` | 受信した情報への反応 | informed-listener | 1070年1月〜1070年12月 | 受信済みinfoLogを必須。史実の結果・現場参加を先取りしない。根拠 C、場面 S |
| `timeline_bloodpeak_and_victorian_crown` | 受信した情報への反応 | informed-listener | 1072年1月〜1072年12月 | 受信済みinfoLogを必須。史実の結果・現場参加を先取りしない。根拠 B、場面 S |
| `timeline_ursus_great_rebellion` | 地域生活への影響 | ウルサス／local-civilian | 1074年1月〜1074年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 B、場面 S |
| `timeline_rim_billiton_independence` | 地域生活への影響 | レム・ビリトン／local-civilian | 1075年1月〜1075年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 C、場面 S |
| `timeline_sandsoldier_incident` | 受信した情報への反応 | informed-listener | 1075年1月〜1075年12月 | 受信済みinfoLogを必須。史実の結果・現場参加を先取りしない。根拠 D、場面 S |
| `timeline_sarcophagus_purge` | 根拠不足の直接場面を休眠 | resident | 1077年3月〜1077年12月 | 封鎖研究施設への当事者の立入証拠が未確立。根拠 B、場面 B |
| `timeline_leith_revolution` | 地域生活への影響 | リターニア／local-civilian | 1077年9月〜1077年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 C、場面 S |
| `timeline_tarra_kidnap` | 受信した情報への反応 | informed-listener | 1077年1月〜1077年12月 | 受信済みinfoLogを必須。史実の結果・現場参加を先取りしない。根拠 C、場面 S |
| `timeline_vanya_assassination` | 受信した情報への反応 | informed-listener | 1081年1月〜1081年12月 | 受信済みinfoLogを必須。史実の結果・現場参加を先取りしない。根拠 C、場面 S |
| `timeline_victoria_leak` | 受信した情報への反応 | informed-listener | 1085年1月〜1085年12月 | 受信済みinfoLogを必須。史実の結果・現場参加を先取りしない。根拠 C、場面 S |
| `timeline_el_sol_renamed_dossoles` | 都市・施設の直接場面 | ボリバル／ドッソレス／present-civilian | 1086年1月〜1086年12月 | 本人の実際の都市所在と当月を必須。根拠 D、場面 C |
| `timeline_babel_split` | 根拠不足の直接場面を休眠 | resident | 1086年6月〜1086年12月 | 陸艦の時点付き所在と本人の関係が未確立。根拠 B、場面 B |
| `timeline_kazdel_conflict_started` | 地域生活への影響 | カズデル／local-civilian | 1086年1月〜1086年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 B、場面 S |
| `timeline_talulah_kills` | 根拠不足の直接場面を休眠 | resident | 1088年1月〜1088年12月 | 邸宅の所在と関係者への直接接触が未確立。根拠 B、場面 C |
| `timeline_talulah_leave` | 根拠不足の直接場面を休眠 | resident | 1091年1月〜1091年12月 | 特定集落への滞在・知己が未確立。根拠 B、場面 B |
| `timeline_kazdel_war_declared` | 地域生活への影響 | カズデル／local-civilian | 1091年12月〜1091年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 B、場面 S |
| `timeline_kazdel_civil_war` | 地域生活への影響 | カズデル／local-civilian | 1092年1月〜1092年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 B、場面 S |
| `timeline_kazdel_border_battle` | 受信した情報への反応 | informed-listener | 1092年12月〜1092年12月 | 受信済みinfoLogを必須。史実の結果・現場参加を先取りしない。根拠 B、場面 S |
| `timeline_texas_family_purge` | 根拠不足の直接場面を休眠 | resident | 1092年1月〜1092年12月 | 事件都市・街区と本人の関与を確定できない。根拠 C、場面 B |
| `timeline_thelazia_dead_londinium` | 都市・施設の直接場面 | ヴィクトリア／ロンディニウム／present-civilian | 1094年8月〜1094年12月 | 本人の実際の都市所在と当月を必須。根拠 B、場面 S |
| `timeline_chernobog_incident_local` | 都市・施設の直接場面 | ウルサス／チェルノボーグ／present-civilian | 1096年12月〜1097年1月 | 本人の実際の都市所在と当月を必須。根拠 B、場面 S |
| `timeline_kazimierz_major` | 都市・施設の直接場面 | カジミエーシュ／カヴァレリエルキ／present-civilian | 1097年6月〜1097年12月 | 本人の実際の都市所在と当月を必須。根拠 B、場面 C |
| `timeline_siesta_disaster_local` | 地域生活への影響 | シエスタ／local-civilian | 1097年7月〜1097年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 C、場面 S |
| `timeline_world_1099` | 実到達した検問区間 | resident | 1099年1月〜1099年12月 | 放浪または原因の記録された避難旅程と、登録検問への実到達を必須。根拠 D、場面 C |
| `timeline_world_1101` | 受信した情報への反応 | informed-listener | 1101年1月〜1101年12月 | 受信済みinfoLogを必須。史実の結果・現場参加を先取りしない。根拠 D、場面 S |
| `timeline_katorga_incident` | 都市・施設の直接場面 | ウルサス／サンクト・グリファーブルク／model:katorga-university-square／present-civilian | 1101年12月〜1101年12月 | 都市だけでなく本人・当月・施設の立入証拠を必須。根拠 B、場面 B |
| `timeline_sui_1102` | 受信した情報への反応 | informed-listener | 1102年1月〜1102年12月 | 受信済みinfoLogを必須。史実の結果・現場参加を先取りしない。根拠 D、場面 S |
| `timeline_daily_londinium_siege` | 都市・施設の直接場面 | ヴィクトリア／ロンディニウム／present-civilian | 1098年7月〜1098年9月 | 本人の実際の都市所在と当月を必須。根拠 B、場面 S |
| `timeline_daily_londinium_martial` | 都市・施設の直接場面 | ヴィクトリア／ロンディニウム／present-civilian | 1094年8月〜1097年12月 | 本人の実際の都市所在と当月を必須。根拠 B、場面 S |
| `timeline_daily_chernobog_alarm` | 都市・施設の直接場面 | ウルサス／チェルノボーグ／present-civilian | 1096年12月〜1097年1月 | 本人の実際の都市所在と当月を必須。根拠 B、場面 S |
| `timeline_daily_bolivar_barricade` | 地域生活への影響 | ボリバル／resident | 1048年1月〜1052年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 C、場面 S |
| `timeline_daily_great_silence_sea` | 地域生活への影響 | イベリア／resident | 1038年7月〜1040年12月 | 実居住／実到達した地域の生活影響。現場目撃へ昇格しない。根拠 B、場面 S |

`vic_war`もロンディニウム1098年7〜9月の直接場面として同じガードを適用する。`bol_war`は1048〜1052年の地域生活の場面へ改稿し、国全体を単一の襲撃現場にしない。直接／旅程だけを年表優先へ入れ、必須就学・期限医療・期限付き選択を維持する。同じ期限・開始年が競合する場合のみ、適格な直接危機を先にし、残りの期限枠を別月へ確保する。

## 元の死亡17件

| 元イベント | 結論 | 原因・所在の根拠 |
|---|---|---|
| `timeline_four_emperors_war` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_great_silence` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_tenth_ursus_kazimierz_war` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_bloodpeak_and_victorian_crown` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_ursus_great_rebellion` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_sandsoldier_incident` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_sarcophagus_purge` | 公開停止 | 封鎖研究施設への当事者の立入証拠が未確立 |
| `timeline_leith_revolution` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_vanya_assassination` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_kazdel_conflict_started` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_kazdel_war_declared` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_kazdel_civil_war` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_kazdel_border_battle` | 現場外の死亡枝を除去 | 特定戦場・施設への本人の曝露を確立できないため、地域生活または受信情報への本人の行動へ変更 |
| `timeline_texas_family_purge` | 公開停止 | 事件都市・街区と本人の関与を確定できない |
| `timeline_chernobog_incident_local` | 当月・現地・選択に限って維持 | チェルノボーグの1096年12月〜1097年1月。駅・シェルター・救護の選択と致死結果を結び、eventId／choiceIndex／outcomeIndex／年月／本人／placeRef／exposureRef／causeを保存 |
| `timeline_siesta_disaster_local` | 現場外の死亡枝を除去 | 旧市街・港への立入が未確立。地域の避難準備へ変更し、船の避難歴は実乗船区間の到着後だけ |
| `timeline_katorga_incident` | 現場外の死亡枝を除去 | 大学前広場の時点付き本人アクセスを必須。即時の拘束と後日の処刑を混同しない |

追加の `vic_war` の致死枝も同じ死亡証拠を要求する。現場外のpending選択は再開と選択確定時に破棄する。秘密事件5件の休眠は、施設・陸艦・邸宅・集落・事件都市を捏造しないための採用判断であり、封印ニュースを一般公開へ変更しない。

## 個別サービスのS仮定

- 広域移動の料金だけをMIGRATION_ROUTESから参照する。そこから道路・国境の存在は導かない。通常の広域行程には検問を付けない。
- 鉱産物輸送（クルビア→レム・ビリトン）、隊商と港便（サルゴン→イベリア）、交易荷との乗継（イェラグ→クルビア）は個別運行のSモデル。1099年の当該運行の審査、運行側の発行者・待機宿・案内人・迂回路を固定IDで持つ。許可証8000、迂回15000龍門幣はこのモデルの料金で、国家の法令・全国一律封鎖ではない。1100年にはこの運行の審査期間が終わり、再開を選べる。
- 地域内移動は20000×物価指数の個別輸送。シエスタ1097年7月以後の避難用連絡船もSの個別運行で、史実の船名・港・全国制度を確定しない。
- 食宿は最低生活費×地域物価×物価指数×0.25÷12を人数分。通常の生活拠点の維持費と別の追加費用で、実所在地が不明な道路では出発地の物価を費用基準にだけ用いる。所在地・戦乱曝露の証拠には流用しない。
- 通行条件の照会は翌月以後の回答と、本人・区間・検問・発行者・期限に一致する通行証を要する。支払と通過・到着は別操作。迂回は追加費用と案内人を記録し、元の検問を通ったことにしない。
- 旅先の仕事は個別の短期提示（確率0.8）。月額は最低生活費×地域物価÷12×0.6。引き受けた翌月以後の実滞在月だけ記帳し、移動再開または旅程終了までという提示済みの期間で終わる。元の正式な勤務・学籍を臨時仕事へ書き換えない。
- 見守り0.7、成人家族同行0.8、保護者同行0.8、別居相談0.7、診療窓口確認0.65、食宿の個別減免0.45はゲームの返答モデル。未成年の子の同行では保護者の許可と本人の未確認の意思を別項目に記録する。拒否を画面の再表示で引き直さない。診療窓口の照会は診断・治療・感染開示を成立させない。
- 帰路の資金不足には、運行側の個別の後払い契約を本人が明示的に選べる。現金を充当し、不足分を本人／共有家計の負債と決済票へ同時に記帳する。無償送還や架空の給付は生成しない。

## 状態と既存機能の境界

現在位置はtravelPresence、生活拠点は従来のres/local、学校交通はeducationMobilityを正本とする。放浪の最終行先は未定でも、実行する次区間を決めてから出発する。毎月の所在は地域不明を許し、移動中を両国の戦場へ同時配置しない。家計の年次表示は実際の決済を投影するだけで再徴収しない。

同行は本人IDごとの合意・保護者権限を出発直前と次の行先で再照合する。旅先の定住では受入先の確認済み住居を既存転居操作へ一度だけ渡し、同行していない配偶者・子の住所や学籍を移さない。配偶者を残す場合は別居相談と、反対時の本人の再判断を必要とする。既存の正式学籍は住居形態の変更だけで終了せず、到達・転学判断へ残す。

留学先の出願は学校・キャンパスと実旅程を結び、試験月にその学校へ到着した場合だけ受験歴を作る。旅程の既払運賃を参照し、受験交通を別請求しない。同行した子だけが旅程による欠席対象で、残った別の子へ波及しない。ゼルグラードの既存の同国内・同月の特定住居への避難／就労は、成立済み転居として専用経路を保持し、抽象的な国外旅程へ置換しない。

旅程を持たない正当な同版セーブの新フィールドは任意。人口や他者の意思・史実を保存補修で捏造せず、旅程・決済・乱数を同版で復元する。旧版移行を追加していない。

## 検証証拠の範囲

`tests/v88-history-roaming-completion.test.cjs`は実エンジンで37旗・40場面の時空間、検問・再開・迂回、帰還・後払い、同行・保護者失効、短期勤務、定住・学籍、越境受験、死亡曝露、保留選択、月別圧力、実保存復元を検査する。従来の学校欠席・勤務不在月・家族見守り・滞在会計・期限優先・地域影響・歴史情報の短期回帰を併用する。構文検査は評価前のデータソースを字句検査し、同じオブジェクトのshow／historicalScene／timelineFlag重複を検出する。

実画面はVivaldiの独立したlocalhost確認用originを使用。クルビア1099年6月→検問7月→照会回答8月→実到着9月→短期勤務翌月計上→定住→翌月の旅程終了を操作し、同originで保存した旅程のページ再読込による復元、提示額と狭い記録欄の収まり、状態監査の正常を確認した。月送りだけは短期fixtureの操作で、ランダムな人生全体を経由した確認ではない。確認用タブ・一時HTML・サーバーは終了・撤去した。全ブラウザー、支援技術、全人口の頻度・収支校正、原作一次資料の全面照合をこの結果で保証しない。

