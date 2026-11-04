# EDU I08：P18保存復元・P19分布観測の部分受入

**対象**：Draft PR #2／2026-11-04。P19資料の7指標の分母・確度・欠測区分をゲームの既存正本へ写像する。

## 実装した観測面

`js/education/observation.js`の`educationObservationRows(s, options)`は読み取り専用の導出値を返す。`s.world.educationWorld`、`s.educationCases`、`s.educationAccess`、`s.educationFinance`、`s.educationRecord`を参照し、新たな学校・出願・結果・費用・学籍・修了資格を生成しない。観測結果は`S`に再保存しない。対象年月、対象設置単位、課程月、案件ID、出願ID、学籍IDを明示的に指定可能。

| 指標 | 分母を固定する実レコード | 分子の判断 | 除外・留保 |
|---|---|---|---|
| `p_exists` | 明示した`scopeId × stage`のうち保存済み存在抽選がある単位 | `generationDecisions.present[stage]` | 未生成単位は`excludedUnknown`。不在抽選は0として数える |
| `p_open` | 明示した実在`offeringId × year × month` | 同月の講義量または募集可能状態 | 未登録ID・未来は`excludedUnknown` |
| `p_discovered` | 指定した進路案件のうち校地・課程・募集に該当する候補が現実にある案件 | その案件の正式に確認された既知候補 | 未探索は分母に含め`notSearched`にも記録。候補不存在の案件は本指標の対象外 |
| `p_reachable` | 実際に発見した募集中候補を持つ案件 | 現行の本人住所・本人事情で`educationCanReach`が許容した場合 | 旧住所の案件など検証できないものは`excludedUnknown` |
| `p_accepted` | 出願案件IDと正式な結果通知IDが一致する判定済出願 | 正式結果が`accepted` | 未通知・異なる案件への流用は留保 |
| `p_funded` | 受入後、資金決定期限に到達したoffer | 当該案件の授業料請求の正式な納付、遠隔地の場合は必要な追加移動費の納付 | 契約継続中は`pending`、遠隔の移動費根拠未把握は`excludedUnknown` |
| `p_completed` | 記録済み学籍コホートのうち、追跡終了状態と終了年が確定した学籍 | 同じ`enrollmentId`を参照する正式資格または学校修了証 | 在籍中は`censored`、学籍不明瞭は`excludedUnknown`、在籍中死亡は`competingDeath` |

各行は`metricId/numerator/denominator/unit/period/observationWindow/evidenceClass/sampleScope`を持ち、ゼロ分母時の`rate`は`null`、理由は`no_observations`。7率を積算して卒業率とすることは認めない。

**標本の範囲**：これは保存された生活世界・明示した課程・既存進路案件の観測であり、テラ全住民の進学率や19地域の人口加重率を意味しない。選択された進路案件は本人が進学を検討した集合に偏る。未観測の人口母集団を生成・推定しない。

## 人物×進路案件の11段階

`educationObservationCaseBridgeRows(s, {year,month,caseIds})`は既存の主人公の進路案件を1つの観測窓として、`N_eligible/N_any_present/N_any_open/N_known/N_route/N_applied/N_accepted/N_funded/N_enrolled/N_completed/N_nonformal_gain`の11項目を真偽または`null`で返す。存在→発見→通学→受験→授業料→在籍→卒業のうち、出願していない段階や未審査の判断を後年の資格から埋めない。正式学籍・認定は固有IDを辿って確かめる。学外の学習実績は正規資格から独立して算定する。対象は保存済みの主人公の案件だけで、扶養対象や調べたことのない住民を暗黙に追加しない。

## 受入テスト

- `tests/p19-education-observation.test.cjs`：19地域×7生活圏×6課程＝798セル（存在率0%は126件・100%は11件）、4特例×6課程＝24セルの範囲、現実の募集先があるが未探索の人物案件、発見後の条件、実際に受け取った合格通知、正式請求の支払、修了資格／中断／未成熟／資格未確認の区分を固定状態で照合。繰り返し観測が`S`と`rngState`を変更しないことを検査。未発見の校地IDをプレイヤー向け進路本文が提示しないことも検査。
- `tests/ui-title-resume.test.cjs`：実際の`makeResumeSnapshot → cont`を介して、教育世界のseed・校地・課程・出願案件・既知募集先・会計見積・RNG状態・観測値を復元照合。既存のI07条件別通知・発行者・援助決定も同版復元後の再通知0件を確認。
- `.github/workflows/p0-education-work.yml`：承認済み小規模テスト`p19-education-observation.test.cjs`を独立のステップとして常時実行する。

## 引き続き必要なI08作業

P19の152世界配置標本、76人物短期遷移、9段階受入追跡、8件の成熟コホート小標本を設計に沿って必要分だけ実行する。11段階観測橋の扶養対象への拡張、家族本人別の未確認情報管理、7分母の地域別出力／UI表示、画面操作による実動作照合は独立の受入事項として残す。未承認の地域固有P17イベント6件は引き続き非発火とする。
