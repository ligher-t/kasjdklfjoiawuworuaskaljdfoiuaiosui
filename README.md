# テラに生まれて (Terra Life)

アークナイツの世界観を土台に、テラの大地に生きる一人の生涯を追う日本語の人生シミュレーションです。通常の実行は静的なHTML・JavaScriptで行い、ビルドや外部npmパッケージを必要としません。
アークナイツのメインストーリーやサイドストーリーの要約、簡単な年表や用語解説、オペレーターやモジュールのテキストから推察されるものなど、アークナイツの世界観を補完する資料が `siryou` フォルダに入っています。開発時にはこれを参照し、足りない情報は適宜一次資料や二次資料、ユーザーの考察やwikiなどを含む外部サイトで調査を行ってください。

---

## 起動と公開

開発時は `index.html` をブラウザーで開きます。公開時は次のファイルとフォルダーを、相対配置を保って静的Webサーバーから配信してください。

- `index.html`、`rules.js`、`events.js`、`debug.js`
- `css/`、`js/`、`data/`

`index.html` が画面とスクリプトの読み込み順を定義します。`debug.js` と `js/debug/` は開発者向け画面の実装を含みます。`tests/`、`tools/`、Markdown資料はゲーム実行に必要ありません。

---

## 雇用・職業・生計モデル（実装前統合設計）

- **[統合設計書 v3.0](docs/employment/TERRA_EMPLOYMENT_INTEGRATED_DESIGN_V3_20261105.md)**：W00〜W12と会話ログの雇用設計を統合した今後の実装入口。19地域、職場生成、83職業、採用・職歴・家計、イベント・UX、移行・受入を規定。
- [66組織のプレイヤー採用可否](docs/employment/EMPLOYER_PLAYER_ACCESS_POLICY_66_20261105.json)：ペンギン急便・リー探偵事務所等の新規雇用規約。
- [v3追加受入28ケース](docs/employment/V3_EMPLOYMENT_ACCESS_UX_ACCEPTANCE_20261105.json)／[既存107ケース](docs/employment/W10_INTEGRATION_ACCEPTANCE_107_CASES_20261104.json)：採用禁止、選択負荷、家計、移動、旧セーブの設計上の完了基準。現行ゲームコードへの適用は未着手。

## 実装の見取り図

| 場所 | 役割 |
|---|---|
| [index.html](index.html) | 画面の骨格、スタイル、実行スクリプトの順序 |
| [rules.js](rules.js) | イベントデータが使う判定サービスの公開窓口 |
| [events.js](events.js) と [data/](data/) | データ構築の順序、地域・人物・イベント・効果などの定義。最後に `data/finalize.js` が `GAME_DATA` を公開 |
| [data/regional/](data/regional/) | 全19地域の固有日常イベント（1,157件）および選択肢イベント群 |
| [data/routes/](data/routes/) | ロドス本艦生活、レユニオン、BSW、ライン生命等の所属組織ルート |
| [js/](js/) | 人生の状態、年ごとの進行、イベント抽選、家族・仕事・健康・所属・保存などの実行処理 |
| [js/education/](js/education/) | 学校教育ライフサイクル（初等・中等・大学・高等職業・アーツ学院）と学生管理 |
| [js/ui/](js/ui/) | 端末UI、ステータス、世帯系図、家計簿・資産ポートフォリオ、エンディング画面 |
| [css/style.css](css/style.css) | ゲーム画面と開発者画面の表示スタイル |
| [debug.js](debug.js) と [js/debug/](js/debug/) | 開発者向け診断・シミュレーション画面 |

人生の初期状態は `js/life/birth.js`、年ごとの進行は `js/life/annual.js`、イベントの適用は `js/events/dispatch.js` が中心です。死亡判定・終幕・生涯要約はそれぞれ `js/health/death-risk.js`、`js/ui/ending.js`、`js/ui/life-summary.js` に分かれています。正確な読み込み順と実際の挙動は常に現行コードを確認してください。

---

## 現行版 (v88) の主要システム

- **国家間言語・文化・相互理解システム**:
  - 国家言語、部族言語、古代言語など21言語体系と19地域の言語プロファイルをモデル化。聞く・話す・読む・書くの4技能および公的敬語、現場符牒（ウルサススラング等）による意思疎通判定を実装。
  - 自然習得（家庭・地域居住）、学校教育、成人後学習による多言語習得と、メインUI左枠の「現在地」表示および台帳画面の習得言語一覧を完備。
- **全年表出来事（HIST全37件）の現地直接体験化と最優先発火機構**:
  - 全37件の歴史的事件において、当事地に居住している場合は遠隔地の伝聞ではなく「現地直面の体験から」として直接目撃文面（`localText`）および直接目撃ルートで記録。
  - 歴史的事件の該当年において、当事地にいるプレイヤーは一般のランダム選択肢に先立って年表選択肢イベント（`localTimelineChoice`）を最優先で引く機構を導入。
  - 砲撃戦（ロンディニウム戦争）や戒厳令、天災等の危機期間中（`isLocationInCrisis`）は、バラ園散歩やサロン夜会などの平時レジャー日常を完全に遮断し、緊迫した戦時日常を優先。
  - 市街戦被災（ロンディニウム攻城砲）、天災被災（チェルノボーグ天災嵐/シエスタ火砕流）、怪異被災（大いなる静謐）、粛清被災、戦死等の固有死因（11種）を増設。
- **全19地域の高解像度な日常イベント**:
  - 炎国、龍門、ヴィクトリア、ウルサス、ラテラーノ、カジミエーシュ、クルビア、極東、イベリア、シラクーザ、サルゴン、カズデル、サーミ、リターニア、イェラグ、レム・ビリトン、ボリバル、シエスタ、ミノスの全地域について、1,157件の日常イベントおよび選択肢イベント群を収録。地域・年齢・就学・職務・居住条件を実行処理へ接続しています。
- **学校教育ライフサイクルと「学生」職業表記**:
  - 初等・前期中等・後期中等・大学・高等職業・アーツ専門学院の多段階就学システムを実装。就学中はプロフィール・要約・世帯系図・エンディング画面において、従来の「無職」表記ではなく「**学生**」として一貫して表示。
- **ロドス・ルートと本艦生活**:
  - 通常1〜2年の選考フロー、本艦専用の日常イベントへのスイッチ、高規格医療・バイオセーフティによる感染防御、本艦内での天災死の排除、職種・任務に応じた殉職・病死体系。
- **経済モデル健全化と中長期資産形成**:
  - 職種別の基礎給料倍増と生活費・物価の適正化による貧困層の生存率改善および富裕層インフレの抑制。
  - 投資、貯蓄、不動産、事業、家計簿UI、資産ポートフォリオ表示の完備。
- **老年期体験の深化と地域互助**:
  - 高齢期の退職後生活、健康リスク、孤立防止、世代間支援、地域互助メカニクス。
- **死因体系と差別8段階モデル**:
  - 地域・生活階層・年齢・職業に即した多面的な死因体系と、地域社会における差別・制度的排除の精緻化。

---

## 変更する場所

- **世界設定・開始年・地域モデル**: `data/model/guide.js`、`data/model/world.js`、`data/world/`。歴史イベントや地域圧力、現地体験文面は `data/world/history.js` を確認します。
- **言語体系・地域言語プロファイル**: `data/model/languages.js`、`js/social/languages.js`。
- **イベント本文・選択肢・結果**: `data/` の該当する段階を編集します。ファイルの実行順は [DATA_MODULES.md](DATA_MODULES.md)、登録順の正本は `index.html` と `events.js` です。
- **地域固有日常イベント**: `data/regional/` 配下の各地域ファイル（例: `yan.js`, `columbia.js`, `victoria.js` など）を編集します。
- **状態遷移や計算規則**: `js/` の実行処理を編集し、イベント定義との接点は `rules.js` のサービス契約を使います。
- **設定根拠・確度**: [data/model/sources.js](data/model/sources.js) を参照・更新します。正史の記述、資料からの解釈、ゲーム上の仮定、未確認事項を区別してください。
- **所属ルートの条件と継続**: `js/life/affiliations.js` の `AFFILIATION_RULES` と、対応する `data/routes/` のイベント群を合わせて確認します。

---

## 文書案内

| 文書 | 使い方 |
|---|---|
| [AGENTS.md](AGENTS.md) | 作業・変更保護・検証・記録の共通指示 |
| [REMAINING_TASKS.md](REMAINING_TASKS.md) | 現在の残課題・実装完了実績を管理する唯一の正本 |
| [SPEC.md](SPEC.md) | ゲームシステムおよびUIの設計仕様書（最新v88対応） |
| [DATA_MODULES.md](DATA_MODULES.md) | イベントデータの構築順と編集先モジュール一覧 |
| [ALL_EVENTS_COMPREHENSIVE_DIRECTORY.md](ALL_EVENTS_COMPREHENSIVE_DIRECTORY.md) | 全2,398件の全イベント総合台帳（発火条件・分岐・結果文章・効果fx・フラグ接続網羅） |
| [EVENT_CATALOG.md](EVENT_CATALOG.md) | 旧版イベントカタログ |
| [tools/event-catalog-metadata.json](tools/event-catalog-metadata.json) と [tools/generate-event-catalog.cjs](tools/generate-event-catalog.cjs) | カタログの分類・校閲メタデータと生成処理 |
| [data/model/sources.js](data/model/sources.js) | 設定・メカニクスの出典と根拠の台帳 |
| [TEST_POLICY.md](TEST_POLICY.md) | 検査の評価・実行条件と容量管理の方針 |
| [SIMULATION_ANALYSIS.md](SIMULATION_ANALYSIS.md) | 1,000人シミュレーションの観測・分析記録 |

---

## 検査

検査は変更した処理に関係するものを選びます。[TEST_POLICY.md](TEST_POLICY.md) に従い、登録済みの高評価検査だけを明示して実行してください。

```text
node tools/check-efficient.cjs list
node tools/check-efficient.cjs run <登録済みの検査ファイル名>
node tools/check-efficient.cjs syntax
```

`tests/` の高評価検査を、変更した動作に合わせて選定します。全件検査や長期シミュレーションを毎回の終了条件にはしません。
