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


## 扶養対象者ごとの正本と親が知った情報

`educationObservationDependentRows(s,{year,month,personIds})`は**観測監査専用**である。本人の`dependentEducation[personId].enrollments`を実在学籍として読み、別に`knownFacts`・`knownResidence`の根拠付き報告だけを「主人公に知られた情報」として返す。親が認知していない学籍、別居先、報告を受けていない学校を表示へ流用してはならない。

- 同一校の二児も`dependent-enrol:...`の学籍IDを独立させる。主人公の`educationRecord.enrollments`には子の学籍を合算しない。
- 「子どもが遠くで勉強している」という伝聞は`reported-education-unspecified`。校名・学籍番号を推定しない。
- 学校と学籍IDを本人向けに報告する`knownFacts`がある場合は`reported-school`／`reported-enrollment`を区別する。実際の入学、報告内容、報告の確度を三重に保存する。
- 当月の現況だけを返し、過去の年月に現在の学籍や住まいの状態を投影しない。画面表示の際には内部監査用の`actualEnrollmentId`等の真実フィールドを除外する。

`tests/p19-education-dependent-observation.test.cjs`でP15-D10/D11・P18-T49/T53を直接検査する。同一校の二児、異なる入学承諾と学籍、片方の別居情報が親に伝わらない状態、遅れて届く伝聞、同版保存復元、監査の非変更と生涯RNG非消費を確認する。

## P19-S06：成熟8コホートの短い状態別分類

`tests/p19-education-observation.test.cjs`に、正式修了記録2件、資格根拠不足1件、中断・退学2件、在籍・休学・転学による未成熟3件の**8学籍フィクスチャ**を追加する。未成熟の右打切り3件、終了分母4件、資格発行2件、欠測1件を区別し、死亡が発生した別の観測では右打切り3件を死亡競合3件として集計する。学籍や資格の重複投入だけで母数・分子が増えないことを確認する。これは観測分類の短期受入であり、8人の長期人生を自動生成した結果ではない。

## P19-S05：同じ出願案件の短期9段階

`tests/p19-education-nine-stage.test.cjs`で、実際に存在する大学課程を使い、①未探索、②募集先発見、③再照会のみ、④願書提出、⑤正式受入、⑥実請求、⑦正式納付（契約判断保留中）、⑧合格後の未入学確定、⑨同案件の再照会の9観測点を追う。段階ごとの`caseId`は一意で変化せず、`applicationId`・請求IDは増殖しない。納付した事実と在籍した事実は独立しており、⑦では`p_funded.pending`、⑧では`N_funded:true`かつ`N_enrolled:false`となる。同じ結果を再表示しても資産・学籍・資格・RNGに変化はない。受入判断は合格結果を持つ観測フィクスチャであり、実際の入試抽選を繰返した試行ではない。

## 受入テスト

- `tests/p19-education-observation.test.cjs`：19地域×7生活圏×6課程＝798セル（存在率0%は126件・100%は11件）、4特例×6課程＝24セルの範囲、現実の募集先があるが未探索の人物案件、発見後の条件、実際に受け取った合格通知、正式請求と一致した領収・仕訳までを要求する支払、修了資格／中断／未成熟／資格未確認の区分を固定状態で照合。152の固定Seedによる短期世界配置と再訪で学校・抽選・hub IDが安定することも検査。繰り返し観測が`S`と`rngState`を変更しないことを検査。未発見の校地IDをプレイヤー向け進路本文が提示しないことも検査。
- `tests/ui-title-resume.test.cjs`：実際の`makeResumeSnapshot → cont`を介して、教育世界のseed・校地・課程・出願案件・既知募集先・会計見積・RNG状態・観測値を復元照合。既存のI07条件別通知・発行者・援助決定も同版復元後の再通知0件を確認。
- `.github/workflows/p0-education-work.yml`：承認済み小規模テスト`p19-education-observation.test.cjs`を独立のステップとして常時実行する。

## 引き続き必要なI08作業

P19-S03の152世界配置標本、S04の76人物局所遷移、S05の9段階受入追跡、S06の8学籍の成熟状態分類は短期フィクスチャで実施済み。残件はP15の19地域代表人生・32原因別ケースの必要小標本、7分母の地域別出力／UI表示、実画面操作による教育情報の受入監査、I07の条件別通知の自然生成経路とする。未承認の地域固有P17イベント6件は引き続き非発火とする。

## P19-S04：76人物局所遷移の受入

`tests/p19-education-local-transitions.test.cjs`を追加し、19地域×富裕／貧困の2家庭条件×2固定Seedの76ケースを実行する。各地域・Seedで家計だけを変えた二人は同一の教育圏・学校抽選・候補校を参照する。世界存在率を人口就学率とみなさず、固定Seedの短期実状態だけを比較する。

1. 実際の`educationCaseAction`で職業課程への志望を起票し、実在`offeringId`の募集照会を行う。地元に課程がなくても近隣探索を可能にし、正規課程不存在のまま学籍・資格を作成しない。
2. 富裕／貧困では学費見積と受験料の資金判定を分離する。探索時点では本人・家計とも無課金とし、富裕側で出願資格・経路が成立する場合は実際の出願・受験料領収・合否記録を作り、受入後の入学辞退も独立に処理する。貧困側は費用不足のまま勝手に出願・貸付・学籍を作らない。
3. 各ケースで`educationOpenLearningPath`と`educationRecordLearningParticipation`を使って本人の独学実績を記録し、同じ証拠の再投入を1回として扱う。学校外学習の進行で正式学籍・学位を自動生成しない。
4. `educationObservationRows`と人物単位観測橋を同じ保存状態に対して反復し、既存正本および生涯RNGの非変更と、7観測指標・学校外学習の独立表示を検査する。
5. テストは短期の固定条件による論理的受入である。実際の人口構成、生活費分布、長期卒業率、全国の教育普及率を測定した結果として利用しない。

教育CIの`P19 S04 76 local person transitions across regions, households and world seeds`ステップで実行し、対象検査と標準の教育回帰を併用する。プレイヤー向けイベント本文や表示用文言は追加していない。
