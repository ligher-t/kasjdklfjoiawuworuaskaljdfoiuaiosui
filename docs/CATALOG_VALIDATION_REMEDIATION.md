# 歴史イベント・カタログ検証の整合性（2026-11-02）

## 修正内容

総合CIの `audit-diagnostics.test.cjs` が検出した実装と診断台帳の不一致を修正した。年表イベントの `timelineFlag` は実際のイベント優先表示・直接遭遇履歴処理に使われているため、`HIST.flag` との対応を必須とする。シラクーザの `siracusaFamilyAction` は `active/distant/left/declined` の文字列、または `{action, onlyIfMember}` の構造を許容し、未知のアクションや属性を拒否する。

年表の主人公個人の選択フラグ6件（`columbia_pioneer`, `silence_survivor`, `omerta_sworn`, `babel_affiliate`, `chernobog_refugee`, `volcano_evacuee`）を個別経験の記録として登録した。

## 過去の未登録出典IDと対応する既存登録資料

| 旧ID（カタログ未登録） | 既存の登録済み出典 |
|---|---|
| `SRC_SIRACUSA_HISTORY` | `SRC_TL_1000_1061` |
| `SRC_HIST_WAR_1062` | `SRC_TL_EARLY` |
| `SRC_URSUS_SARCOPHAGUS` | `SRC_TL_EARLY` |
| `SRC_HIST_BLOODPEAK` | `SRC_TL_EARLY` |
| `SRC_HIST_URSUS_REBELLION` | `SRC_TL_EARLY` |
| `SRC_HIST_SARGON_SANDSOLDIER` | `SRC_A_WALK_DUST_TIMELINE` |
| `SRC_LEITH_HISTORY` | `SRC_TL_EARLY` |
| `SRC_URSUS_HISTORY` | `SRC_TL_MIDDLE` |
| `SRC_VIC_LEAK` | `SRC_TL_MIDDLE` |
| `SRC_BABEL_HISTORY` | `SRC_KAZDEL_BB5` |
| `SRC_KAZDEL_CIVIL_WAR` | `SRC_KAZDEL_BB5` |
| `SRC_KAZIMIERZ_MAJOR` | `SRC_KAZIMIERZ_COMPETITION` |
| `SRC_SIESTA_STORY` | `SRC_SIESTA_TRANSITION` |
| `SRC_WORLD_1099` | `SRC_TL_LATE` |
| `SRC_WORLD_1101` | `SRC_TL_LATE` |
| `SRC_URSUS_KATORGA` | `SRC_URSUS_PAA_SYNOPSIS` |
| `SRC_SUI_HISTORY` | `SRC_TL_LATE` |

**汎用年表や歴史の二次資料が、架空の主人公が目撃した固有場面の全描写まで裏付けるとは扱わない。** 参照の名寄せによりカタログの参照整合性を回復し、年・地域・出来事の照合を継続する。特にサルゴン、シラクーザ統一、ウルサスの棺関連、カズデル戦争、歳、1099/1101年の出来事は原作本文との逐次照合が残る。出典の名称は日本語版への一次資料照合を継続する。

## 地名・職業・年齢条件

`カヴァレリエルキ` をカジミエーシュの実行時の都市候補へ登録した。7地域の日常イベントの条件内にある `職:イベリア審問所・見習い審問官` は現行の職業台帳の `職:イベリア裁判所・見習い審問官` と統一。年表戦時日常5件に少年～老年の対象年齢段階を設定し、乳幼児段階からのイベント発生を防いだ。

## プレイヤー向け文章

**本文、選択肢、結果文の改稿・追加なし。** 今回の対象は出典キー、状態フラグ、メタデータ、イベント適格条件である。既存の直接体験文章が史料と一致するかについては別件の横断校閲が必要であり、`REMAINING_TASKS.md` U-01に継続記録した。

## ロンディニウム1094年の直接遭遇条件

年表 `thelazia_dead` は `localCities: [ロンディニウム]` と `localRegions: [カズデル]` が不整合で、当該都市在住の主人公が現地イベントを実際に体験しても、直接目撃履歴に接続できなかった。現地範囲にヴィクトリアを加え、**同じ地域にいるだけでは地域ニュース**、日時・都市が一致した**実イベントの表示後に初めて直接遭遇**として記録する境界をテストした。本文の変更なし。
