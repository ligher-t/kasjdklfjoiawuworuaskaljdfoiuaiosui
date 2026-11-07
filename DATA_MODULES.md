# イベントデータのモジュール構成

> 現行データの編集案内です。実行順は `index.html` と `events.js`、作業条件は [AGENTS.md](AGENTS.md)、課題一覧は [REMAINING_TASKS.md](REMAINING_TASKS.md)、検査条件は [TEST_POLICY.md](TEST_POLICY.md) を参照してください。

`events.js` は構築の入口です。実データは `data/` の複数の論理段階と構築断片に分かれています。正確な読み込み順は `index.html`、段階の登録順は `events.js` が正本です。公開するフォルダーには `data/` も含めてください。

編集先の役割は下の表と `data/` の実コードを参照してください。イベント本文の索引は [EVENT_CATALOG.md](EVENT_CATALOG.md) に生成されます。カタログの分類や校閲メタデータは `tools/event-catalog-metadata.json`、生成処理は `tools/generate-event-catalog.cjs` にあります。

## 構築と非公開性

1. `rules.js` がイベント定義用の判定サービスを用意します。
2. `events.js` が一時的な `window.TERRA_DATA_BUILD` と非公開の構築領域を作ります。
3. `data/` のファイルは `.run(段階名, 初期化関数)` で段階ごとに登録され、`index.html` のscript順に従って構築されます。順序や登録の正本は `index.html` と `events.js` です。
4. 最後に `data/finalize.js` が `window.GAME_DATA` を公開し、一時的な構築窓口を削除します。構築時に作られたコールバックは必要な非公開データを閉包として保持します。

内部データを一括してグローバル変数へ出す方式ではありません。各ファイル内では `$terraData.名前` が構築済みの依存先を示し、`$define(名前, 値)` が束縛を登録します。第3引数に `true` を渡した束縛は再代入可能です。初期化前の参照や未登録名への代入はエラーになります。

第3引数 `$rules` がイベントから使うエンジンの窓口です。直接のエンジン関数名は参照せず、分野別の窓口をコールバックで利用します。現行の窓口はrules.jsとjs/の実装を参照してください。

`dependsOn` は参照する非公開フィールドの所有ファイルを示し、遅れて実行するコールバックの参照も含みます。依存一覧を並べ直して実行するものではありません。実行順はindex.htmlとevents.jsの段階一覧です。

## 編集と検証

イベントIDと内部フィールドの所有先・参照先はdata/の実コードを検索してください。生成される日常イベントIDはF()の呼び出し順で決まるため、元の順番を保っています。後続ファイルが既存イベントを修正する処理も現在の仕様の一部であり、古い版名だけを理由に取り除かないでください。

新しい論理段階を追加する場合は、`index.html` のscript順と `events.js` の段階一覧を同じ順に更新します。既存段階に構築断片を追加する場合は、その段階の登録方法と配置を確認してください。別の実行順一覧を作らず、HTMLと段階一覧を正本として保ちます。

検査が必要な変更では、[TEST_POLICY.md](TEST_POLICY.md) に従って関連する高評価検査だけを選びます。登録済みの検査は `node tools/check-efficient.cjs list`、明示実行は `node tools/check-efficient.cjs run <検査ファイル名>`、構文確認は `node tools/check-efficient.cjs syntax` です。データだけの変更で版情報を更新するかは、実際の変更内容と現行の版管理方法を確認して判断します。

## 実行順と担当

| 順 | ファイル | 担当 | 定義イベントIDの例 |
|---|---|---|---|
| 1 | [data/model/guide.js](data/model/guide.js) | 段階名・設定方針・抽選表・地域モデル・パラメーター | 設定・登録・調整 |
| 2 | [data/model/sources.js](data/model/sources.js) | 設定資料の出典とメカニクスの参照根拠 | 設定・登録・調整 |
| 3 | [data/model/schema.js](data/model/schema.js) | データセット、地区、イベント効果の項目定義 | 設定・登録・調整 |
| 4 | [data/model/flags.js](data/model/flags.js) | 状態フラグの基本台帳 | 設定・登録・調整 |
| 5 | [data/model/world.js](data/model/world.js) | 地域・種族・家計・職業、イベント生成補助 | 設定・登録・調整 |
| 6 | [data/base/initialize.js](data/base/initialize.js) | 基本イベント配列の初期化 | 設定・登録・調整 |
| 7 | [data/base/childhood-attitudes.js](data/base/childhood-attitudes.js) | 幼少期の出来事と態度形成 | `fever`、`sch`、`pet` |
| 8 | [data/base/career-entry.js](data/base/career-entry.js) | 進路・職場の入口と見直し | `car`、`sargon_market_contract_review`、`ursus_mine_assignment_offer` |
| 9 | [data/base/life-and-health.js](data/base/life-and-health.js) | 人生の節目・病気・災害・移動・老後 | `arts_awake`、`dst`、`dg` |
| 10 | [data/base/family-and-livelihood.js](data/base/family-and-livelihood.js) | 生計、本人の家族、親族ケア | `piano`、`loan_shark`、`inv` |
| 11 | [data/base/daily-childhood.js](data/base/daily-childhood.js) | 乳幼児期・学齢期の日常 | F()による日常イベント 26件 |
| 12 | [data/base/daily-adulthood.js](data/base/daily-adulthood.js) | 成人期を中心とする日常 | `infected_neighbor` |
| 13 | [data/base/daily-family.js](data/base/daily-family.js) | 家庭と成人した子の生活 | `adult_child_contact`、`adult_child_memory` |
| 14 | [data/base/regional-west.js](data/base/regional-west.js) | 地域固有イベントの前半 | `urs_sweep`、`urs_mine`、`urs_conscript` |
| 15 | [data/base/regional-east.js](data/base/regional-east.js) | 地域固有イベントの中盤 | `lat_gun`、`lat_exile`、`lat_priest` |
| 16 | [data/base/regional-conflict.js](data/base/regional-conflict.js) | 地域の生計・紛争・復興 | `rim_debt`、`rim_mine`、`kaz_merc` |
| 17 | [data/base/world-and-contacts.js](data/base/world-and-contacts.js) | 世界事件と身近な相手の消息 | `wld_chernobog`、`wld_rhodes`、`wld_race` |
| 18 | [data/base/daily-regional.js](data/base/daily-regional.js) | 地域の日常・生活環境 | `rainforest_damp`、`rainforest_path`、`sami_forest_tasks` |
| 19 | [data/base/daily-war-and-identity.js](data/base/daily-war-and-identity.js) | 戦乱の背景・文化・身近な排斥 | F()による日常イベント 12件 |
| 20-38 | [data/regional/*.js](data/regional/) | 全19地域の固有日常（各60件）・選択肢（各10件超） | yan, lungmen, higashi, victoria, ursus, laterano, kazimierz, columbia, iberia, siracusa, sargon, kazdel, sami, leithanien, kjerag, rim, bolivar, siesta, minos |
| 39 | [data/base/confinement-and-education.js](data/base/confinement-and-education.js) | 収容・診断開示・教育・後年の出来事 | `confined_care`、`confined_pet_care`、`confinement_wait` |
| 21 | [data/extensions/social-and-care.js](data/extensions/social-and-care.js) | 社会行為・個人の生活経路の追加と既存枝の調整 | `attitude_infected_child`、`attitude_sarkaz_child`、`family_parent_crystal_dust` |
| 22 | [data/model/flag-usage.js](data/model/flag-usage.js) | フラグの参照・別名・生成/消費の台帳 | 設定・登録・調整 |
| 23 | [data/extensions/education-and-later-life.js](data/extensions/education-and-later-life.js) | 学び・職務の継続、アーツ訓練、地域警報・設備・配送・危機契約・研究同意・共同体文化 | `life_night_study`、`life_youth_apprenticeship`、[arts-training.js](data/parts/extensions/arts-and-life/arts-training.js)、[arts-contingencies.js](data/parts/extensions/arts-and-life/arts-contingencies.js) |
| 24 | [data/world/history.js](data/world/history.js) | 年表・歴史事件の範囲・地域圧力・移動経路 | 設定・登録・調整 |
| 25 | [data/extensions/family-and-community.js](data/extensions/family-and-community.js) | 家族・近隣・生活圏の追加経路 | `life_rim_skill_handover_followup`、`life_rim_workmate_followup`、`life_savra_late_craft` |
| 26 | [data/health/mortality.js](data/health/mortality.js) | 病気・危機と人生終盤の選択 | `life_medical_urgent_review`、`life_medical_followup`、`life_mental_crisis_support` |
| 27 | [data/social/organizations-and-infection.js](data/social/organizations-and-infection.js) | 排斥・互助組織、曝露と感染の生活経路 | `ori_work_safety_instruction`、`ori_work_safety_followup`、`ori_industrial_scrap` |
| 28 | [data/routes/rhodes-and-factions.js](data/routes/rhodes-and-factions.js) | ロドス・レユニオンなどの組織所属と継続ルート | `data/parts/routes/rhodes-and-factions/` の各ルート断片 |
| 29 | [data/world/class-and-locality.js](data/world/class-and-locality.js) | 階級・出生地・居住地に関わる世界設定とイベント | 設定・登録・調整 |
| 30 | [data/world/facilities.js](data/world/facilities.js) | 施設モデルと施設利用のイベント | `facility_clinic_constrained`、`facility_clinic_followup`、`facility_school_disruption` |
| 31 | [data/relationships/facility-people.js](data/relationships/facility-people.js) | 施設で知り合う個人、所属先との接触 | `people_clinic_introduction`、`people_school_introduction`、`people_work_introduction` |
| 32 | [data/life/goals-and-family.js](data/life/goals-and-family.js) | 目標・家族の生活記録と後年 | `people_work_life_conversation`、`people_school_life_conversation`、`people_clinic_life_conversation` |
| 33 | [data/work/contracts.js](data/work/contracts.js) | 雇用・契約と職場事情 | `job_contract_review_v76`、`job_contract_negotiation_v76`、`job_contract_family_schedule_v76` |
| 34 | [data/social/learning.js](data/social/learning.js) | 読み書き・学校・社会経験の形成 | `v77_family_rumor`、`v77_child_informal_study`、`v77_written_application` |
| 35 | [data/social/conflict.js](data/social/conflict.js) | 加害・被害・後影響の記録と選択 | `v78_identity_home_language`、`v78_taran_office_language`、`v78_cultural_affiliation_claim` |
| 36 | [data/review/choice-policy.js](data/review/choice-policy.js) | 選択意図の分類と過去版の追加精査 | `v81_job_silence`、`v81_housing_account`、`v81_family_boundary` |
| 37 | [data/relationships/person-ties.js](data/relationships/person-ties.js) | 本人IDに紐づく関係と明示的な行為 | `v82_colleague_exclusion_statement`、`v82_disclose_to_colleague`、`v82_colleague_rejects_patient` |
| 38 | [data/review/historical-reviews.js](data/review/historical-reviews.js) | 現在の分類を構築するv83～v86の監査処理 | `v86_individual_colleague_apology` |
| 39 | [data/information/current-routes.js](data/information/current-routes.js) | 情報伝達・訂正・後年応答などの現行追加経路 | 設定・登録・調整 |
| 40 | [data/relationships/close-disclosure.js](data/relationships/close-disclosure.js) | 家族・近しい個人への診断開示 | `v87_exclusion_organizer_infected`、`life_ursus_zelgrad_recruitment`、`life_ursus_zelgrad_work_review` |
| 41 | [data/review/current-review.js](data/review/current-review.js) | 現行選択肢の精査と最終フラグ集計 | 設定・登録・調整 |
| 42 | [data/finalize.js](data/finalize.js) | 既存の公開API GAME_DATAを組み立て、構築窓口を削除 | 設定・登録・調整 |
