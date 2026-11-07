# テラ19地域・就労／企業／生計システム 実装前統合引継ぎ v2.0

> **2026-11-05 統合入口更新**：以後の雇用・生計改修は [v3.0統合設計書](TERRA_EMPLOYMENT_INTEGRATED_DESIGN_V3_20261105.md) を先に参照する。本v2.0はW01〜W11の調査と従来設計の記録として保持。特に組織ごとの新規就職可否は [66組織のプレイヤー採用政策](EMPLOYER_PLAYER_ACCESS_POLICY_66_20261105.json)、選択負荷と受入は [v3追加28ケース](V3_EMPLOYMENT_ACCESS_UX_ACCEPTANCE_20261105.json) を優先し、従来の「求人票があるなら常に応募可能」という説明があればv3規約を適用する。ゲーム本体の実装状況は変わらない。


2026-11-04。**Draft PR #2の設計資料。ゲームの実装コード・既存イベント・ゲーム進行・セーブ形式は本工程では変更していない。** 元の[TERRA_19_REGION_EMPLOYMENT_INTEGRATED_SPEC_20261104.md](TERRA_19_REGION_EMPLOYMENT_INTEGRATED_SPEC_20261104.md) v1.0と先行[W00統合引継ぎ](W00_EMPLOYMENT_PREPARATION_HANDOFF_20261104.md)を保持し、以下のW01〜W11資料と具体的な移行境界・実装時に要する校閲を一つの入口として定める。

## 1 成果物正本一覧

| 準備 | 正本 | 実施・進行状況 |
|---|---|---|
| W01 175イベント | [W01_CODE_BASED_SEMANTIC_FINDINGS_20261104.md](W01_CODE_BASED_SEMANTIC_FINDINGS_20261104.md)、[W01_A175_CHOICE_SEMANTIC_TRIAGE_20261104.json](W01_A175_CHOICE_SEMANTIC_TRIAGE_20261104.json)、[原コード資料 PART01](W01_SOURCE_BRANCH_REVIEW_20261104_PART01.json)～[PART05](W01_SOURCE_BRANCH_REVIEW_20261104_PART05.json) | **175イベント・488選択枝の現コード読取と注意点分類完了**。結果分岐の実行時経路の最終意味裁定は実装時のP0対象 |
| W02 全職業の入職資格 | [W02_POSITION_QUALIFICATION_MASTER_20261104.json](W02_POSITION_QUALIFICATION_MASTER_20261104.json) | 全83職業の職位・資格、活動形態、世界で必要な職場証拠を定義。資格の実在性は会社ごとに検証 |
| W03 職場と求人 | [W03_WORKSITE_AND_VACANCY_DESIGN_20261104.md](W03_WORKSITE_AND_VACANCY_DESIGN_20261104.md) | 固定世界の施設、欠員、募集、休業・移転・企業間関係を確定設計 |
| W04 生涯就労 | [W04_CAREER_LIFECYCLE_FSM_FAMILY_DESIGN_20261104.md](W04_CAREER_LIFECYCLE_FSM_FAMILY_DESIGN_20261104.md) | workCaseと就業episode、初職、失職・転属・家族/旧セーブを確定設計 |
| W05 労働会計 | [W05_WORK_INCOME_HOUSEHOLD_LEDGER_20261104.md](W05_WORK_INCOME_HOUSEHOLD_LEDGER_20261104.md) | 月間給与、請負、自営・現物、未払、特許交付、年次予算の二重計上防止 |
| W06 組織と出典 | [W06_ORGANIZATION_SOURCE_VERIFICATION_QUEUE_20261104.json](W06_ORGANIZATION_SOURCE_VERIFICATION_QUEUE_20261104.json) | **66組織を全件出典・名称・勤務地の活性化ゲートへ割当**。6件は追加の公開物語/史料から具体確認。日本語原文・詳細の未照合を保持 |
| W07 地域分布 | [W07_REGIONAL_DISTRIBUTION_OBSERVATION_20261104.md](W07_REGIONAL_DISTRIBUTION_OBSERVATION_20261104.md) | 全19地域の高存在部門・地理例外・統計分母と仮定の境界を明記 |
| W08 移動 | [W08_WORK_MOBILITY_GUARDIAN_20261104.md](W08_WORK_MOBILITY_GUARDIAN_20261104.md) | 通勤、面接、出張、旅行、転勤、避難・拘束と契約状態の接続 |
| W09 情報UI | [W09_EMPLOYMENT_CHOICE_UI_INFORMATION_20261104.md](W09_EMPLOYMENT_CHOICE_UI_INFORMATION_20261104.md) | 実在求人と本人の認知、不可理由、内定・勤務を分離。照会でRNGを消費しない |
| W10 受入 | [W10_INTEGRATION_ACCEPTANCE_107_CASES_20261104.json](W10_INTEGRATION_ACCEPTANCE_107_CASES_20261104.json) | **107件の具体的な設計上の受入ケース**。19地域+20横断+職場12+FSM12+家計12+移動10+UI10+既存X12。テスト実行結果ではない |
| W11 関連イベント・新規草案 | [W11_BCD862_DEPENDENT_EVENT_QUEUE_20261104.json](W11_BCD862_DEPENDENT_EVENT_QUEUE_20261104.json)、[既存36コンセプト](W11_EVENT_GAP_AND_NEW_CONCEPTS_20261104.json)、[新規10件・全文草案](W11_PROPOSED_10_JOB_EVENTS_PLAYER_FULL_TEXT_20261104.md) | B262+C526+D74の862件を全件読取用候補へ分類。既存36コンセプトに対する新規10場面20選択肢の全文試作。重複を比較するまで46件と合算しない。いずれも実装未済 |

**全イベント共通校閲**：[/docs/EVENT_PROSE_CAUSALITY_AND_REVIEW_STANDARD.md](../EVENT_PROSE_CAUSALITY_AND_REVIEW_STANDARD.md)。既存正規制作経路：[/docs/CONTENT_REVIEW_WORKFLOW.md](../CONTENT_REVIEW_WORKFLOW.md)。イベントの新規・改稿文面をゲームへ採用した際は[/docs/PLAYER_TEXT_REVIEW.md](../PLAYER_TEXT_REVIEW.md)に可視全文を登録する。

## 2 必ず維持する先行設計と対象世界

- 実装中の対象は**19地域**：炎国、龍門、ヴィクトリア、ウルサス、ラテラーノ、カジミエーシュ、クルビア、極東、イベリア、シラクーザ、サルゴン、カズデル、サーミ、リターニア、イェラグ、レム・ビリトン、ボリバル、シエスタ、ミノス。各地域の13産業部門は既存REGIONAL_EMPLOYMENT_MATRIXを正本とする。シエスタは独立国家でなく地域・都市のモデル単位。
- 83職業J0–82は原則既存互換の表示コード。新モデルの実体は所在する事業所・職位・期間・採用・勤務記録。企業・職場がないのにJを割当てれば給与が出るという逆生成を解消する。
- 66登録組織は33件の名前付き二次資料上の組織、26件の汎用雇用主類型、6件の名称検証待ち、1件の歴史的団体。名前があることだけでは場所・求人・雇用を確定しない。
- 教育P01〜P20を資格・学歴・学校側の正本として参照。実在校の課程修了記録、語学・技能・非公式学習、在籍中の働き方、子の教育・介護を一貫させる。
- 歴史の出来事、会社の設立/合併、災害、学校/会社の閉鎖・移転は年月と地点でscopeを限定。源石病の感染確定と企業の診断認知、当局の認知は別情報。

## 3 最小データ境界

| データ責任 | 正本・役割 | 既存との接続 |
|---|---|---|
| 世界 | occupationWorld.areas, organizations, employers, sites, positions, openings, transitions | world/residence identity、facility、history |
| 人物の知識 | workKnowledge[personId] | 訪問・会話・掲示・報道、感染/雇用主の情報認知 |
| 応募 | workCases[caseId] | 日常/選択イベントの実際の承認・審査結果 |
| 就労 | employmentRecords[episodeId] | s.job、workContract、careerChanges、lifeAffiliationsの時間投影 |
| 月収 | workEarningsLedger[txId] | J.pay、契約条件、家庭の就労、年次家計、旅行不在月 |
| 学習 | educationWorld、course、award、socialLearning | 就業資格・研修、元学校の発行資格を照合 |
| 引越し | route/mobility、siteLocationHistory、employmentPosting | 旅程・赴任・休職、住居と子の学校を分離 |

「データがある」と「本人が知る」と「採用先が知る」と「本人が働いている」と「賃金を受け取った」をどの経路でも省略しない。

## 4 実装順序と改修アンカー

**Phase A　世界と既存互換の受け皿。** occupationWorldに年月・地区の恒久IDを導入。js/world/facilities.js の s.job → workplace逆生成を新人生について置換し、過去のlegacySyntheticSiteを残す。企業の親子/所有者は年月履歴にする。検証: S01–S12、R代表の必要箇所、D01/D02/D13、セーブ反復。

**Phase B　実際の採用と職歴。** W02の職位・資格・求人根拠、W04のworkCase FSM・episode、初職の見つからない人生、既存reconcileWorkContractの新規契約自動発行分を置換。現行js/core/state.js careerOpeningAssessment の clinical roleが論理式のため常時不適格になる条件を修正。検証: T01–T12、D03/D04/D05/D10/D11/D12/D14/D17/D19。

**Phase C　賃金・家計・移動。** js/life/annual/personal-amounts.jsのJ.pay年収式を、就労済みepisodeの実勤務月からの投影に限定。旅行の travelHomeWorkIncomeShare 二重按分禁止、他の親・子・配偶者所得の独立、ライン生命の現行自動特許交付金の成果根拠化。共同体現物・自営損益・未払・強制労働を加える。検証: L01–L12、M01–M10、D06–D09/D15/D16/D18。

**Phase D　イベント・文章・UI。** W01のP0→P1→P2の枝ごとに、採用/辞退/失敗・旧フラグ/後続、実勤務地、感情・具体的生活文を裁定。W11のB/C/Dから真正面から職務が前提となる候補だけ追加連結。新規10件は候補の重複を先に判定してから採用。W09の就職画面は照会読み取りのみ、応募結果はトランザクションとして発行。検証: I01–I10、R01–R19の全件、各校閲枝、イベント生成カタログの最小チェック。

**Phase E　受入と整合。** 保存→終了→復元した同一seedの再計算、地域19×13・職業83・組織66・A175のリンク整合、典型人生を少数の固定seedで確認。数千人の長期乱数シミュレーション・全面的な無差別テストは不要。公開前にプレイヤー文面と効果の一致、状態の二重付与、職場倒産後の再雇用、所得、旧セーブを重点確認する。

## 5 この設計段階で解決した事柄と、実装時に実測が必要な事柄

**準備済み**：19地域と13部門、83の職業資格プロフィール、66組織の証拠ゲート、175イベント488選択枝の原コード照会・静的注意点、862件の依存イベント候補、事業所と採用・給与・家族・移動のデータ契約、107件の受入ケース、既存36コンセプトと意味重複を比較する新規イベント草案10件。

**継続する精査**：W01の原コードにある各結果の**実際のランタイム効果**と失敗枝のフラグ・後続を個別承認する。原コード抽出により life_rhodes_role_review は3個の選択肢を持つ一方、旧イベント棚卸しのchoiceCountは4である。この不一致をカタログ抽出規則から実装時に修正する。W11のB/C/D群は出典・フラグ・職場前提を全枝人手で裁定した状態にはない。新規イベントの実装前に原作照合と重複確認を行う。

**史料保留**：名前付き組織の日本語正式名が資料上未確認のもの、地域別の支社・具体的採用枠、正確な創業/独立年、厳密な資格制度は原作未確認と表記し、出典のない「全国の一般法」「全企業で有効な資格」として一括設定しない。追加の史料調査で得たMountaincommの分離経緯、Schwire表記も登録組織台帳へ反映した。

**未実施**：新システムの実装、旧セーブmigration実行、107ケースの実行、人口別の雇用率と賃金の較正。設計の数値はゲームモデル上の仮定。

## 6 導入と校閲の共通完了条件

- プレイヤー表示の新規・改稿文面は、元のイベントの散文的な具体さ・温度差を尊重する。編者の設計説明や内部J番号を本文に混ぜない。
- 本文の「その場の行為」・選択・結果は、実際に操作可能な業務、世界の実在場所、人物が知っている事実、採用/所得/所属の副作用と一致する。先行・後続フラグ、解除、失敗・保留までレビューする。
- 作品世界の歴史と一人の人生の知識境界、個別証拠とゲーム仮定、名前と雇用の関係、日常の穏やかな場面と迫害・災害の厳しい場面を同時に扱う。
- 指定された確定シナリオがすべて成功し、旧セーブと現在の正常な運用が保たれ、コード由来の変更箇所のみを対象とするテストを実行して初めて実装完了と記す。

このv2.0は今後の実装と校閲を始めるための一元的な案内正本。W01〜W11の詳細データと原設計v1.0はそのまま参照し、個別テーブルの複製を避ける。

**受入ケースの版関係**：先行W00の51件（R19/D20/X12）と、拡張版95件（R19/D20/S12/T12/L12/M10/I10）を照合し、重複しないX12を追加した[107件の統合正本](W10_INTEGRATION_ACCEPTANCE_107_CASES_20261104.json)を最終受入リストとする。95件版と先行51件は個別設計資料として保持し、検査予定を二重に実行する必要はない。全107件とも実行前の期待仕様である。
