# W05 労働所得・家計・現物・未払の会計仕様 v1.0

日付: 2026-11-04。設計のみ。コード照合済: js/life/annual/personal-amounts.js、js/work/contracts.js、js/core/state.js。既存のJ.pay、物価pm、教育・扶養・家計・感染医療費を維持しながら、実際の勤務・生産・支払の因果へ移行する。

## 1 現行年次式の確認

prepareAnnualPersonalBudget は初職を自動選択した後、J[s.job].pay × s.res.pm × travelHomeWorkIncomeShare × contractIncomeFactor × personalWorkCapacity × workPayBonus × 知識・アーツ・行動・物価などの倍率を用いて incBase を計算する。拘束・隔離作業、退職の分岐あり。incには childHouseholdIncome、spouseHouseholdContribution、軍人恩給、Rhine Lab所属J38〜40に応じた rhinePatentGrant も加わる。子、配偶者の負担、医療、親の介護、教育、旅費等は別に処理。

契約収入の係数は js/work/contracts.js のcontractIncomeFactorで算出され、現在の勤務先ではなく別のsiteに移った後も、旧契約と混線させてはならない。既存勤務先施設statusに基づく制限と新モデルの休業を二重減額しない。

**要修正の計算上の意味**: 現行ライン生命の特許交付金は職業IDだけで毎年加算され得る。設計上は実際の特許・研究成果・授与決定があったときだけの個別収入にする。退役手当は軍務所属と退役支給根拠、治療費補助は医療・加入制度の実際の状態を参照し、企業名だけで全員一律付与しない。

## 2 支払正本の記録

workEarningsLedger の最小データ: txId, personId, episodeId, siteId?, employerId?, payerId, householdId?, entitlementId?, jobId?, yearMonth, kind, sourceEventId?, sourceWorkCaseId?, unitsWorked, grossAmount, cashReceived, inKindValue, expenses, withheld, receivable, debtCreated, payableDue, status, postedAt, basis。

kindは wages / public-pay / commission / sales / expenses / net-self-profit / family-share / in-kind / stipend / hazard-pay / compensation / grant / pension / coercion / withholding / refund 等。金銭収入・給付・返済・未払請求権・金銭以外の住居/食料の価値を別種別とする。1取引の「賃金の発生」と「現金受領」を同時刻と仮定しない。

- idempotencyKey = recipient personIdまたはhouseholdId + episodeId/entitlementId + payPeriod + payType + sourceEffectId。重複適用すると既存txを返し、収入の再加算をしない。
- 欠勤・勤務時間の係数は該当month勤務分だけ。現在の travelHomeWorkIncomeShare と新workMonthAvailability の**どちらか一方**に適用し、両方を掛けない。
- 給与支払は採用時ではなく、activeかつその月に稼働実績または規約上の有給休暇がある場合。suspendedは無給/有給/補償の契約根拠を見て処理。terminatedの翌月給与は0、未払清算は別取引。
- 同じ成果に対するJ.payとイベントcashは一方を給料・もう一方を別用途（前払金、特別手当、成果報酬）として識別しない限り同時計上しない。

## 3 就労形態ごとの収入算式

| 形態 | 発生条件と計算 | 除外する重複 |
|---|---|---|
| wage-employment | 契約月額 × 実勤務月比 × 承認された勤務率 × 手当。J.payは採用職の基準賃金のゲームパラメータ | 単発イベントの月給二重付与 |
| public-appointment | 在任の事実×予算・公的俸給、役職変更日で分割 | 官職希望だけで俸給を出すこと |
| organization-service | 部署・任務・支払主体の規約に応じ現金／物資／住居を分割 | 医療相談者・紹介者を有給職員に数えること |
| seasonal-contract | 契約期間に含まれる月・仕事日のみ。年内季節終了なら給与停止 | 任務終了後の毎年固定J.pay |
| gig-piecework | 完遂した固有依頼×確認済み成果報酬、前払金は負債・前受金相殺 | 依頼受諾だけで全額を支払うこと |
| self-employment | 確認された売上−仕入・資材・賃借・税等の経費。損失も記録 | 売上をそのまま個人所得とすること |
| family-community | 家業に属する共同収益→家計で一度集計→本人の現金取り分と現物支援 | 同じ分配を配偶者・子・本人に重複付与 |
| faith-service | 奉仕・正式雇用・寄宿・謝礼を契約上で区別 | 礼拝参加や奉納から常勤俸給を作ること |
| coerced-assignment | 強制従事と命令者を記録し、給与支払0・未払・現物配給を分離 | 徴用を任意応募・高収入扱いすること |
| informal-illicit | 個別取引と成功・失敗・損失、現金の危険負担 | 組織への接触だけで年額報酬を得ること |

本設計における賃金・物価・非現金価値はゲーム推計。全地域へ共通の法定最低賃金や実統計を制定しない。

## 4 年次集計と旧式との接続

毎月の台帳を先に確定したあと、年次の本人・配偶者・子・共有家計へ投影する。就労所得grossと手取りcashReceived、現物給付、売上、未払債権、支出、個人から家計への拠出を別欄に持つ。表示は本人が把握できるものと、家族から報告されたものを分離。

(1) 現行prepareAnnualPersonalBudgetの incBase は、移行済みepisodeを持つ職については実績月のwage sumへ置換する。同じ勤務分を基準J.pay式でも再加算しない。(2) 旧セーブで移行前の仕事は当面のlegacy income branchを使い、同一年の途中で移行するときは月の範囲を分離。(3) familyCareEarningsScale、personalWorkEarningsMultiplier等の本人の労働能力への係数は個人の勤務分だけ。配偶者・子の別給与に掛けない。(4) 生活費・学費・治療・旅先食宿は独立負担。現物食料・寮の受取は費用を黙って2回減額せず、補助対象の費目を指定する。(5) 旅中の旧居住職は現行travelPresenceの意味を維持し、出張先で新雇用契約を創出しない。

## 5 会計の典型例

- 鉱山の鉱夫が5か月働き、病気で3か月無給休職、残り4か月は退職: 賃金対象5か月。離職月の未払精算だけ別記。鉱石病の診断で雇用主が自動的に知ることはない。
- 傭兵が1回限りの護衛依頼を受け、前金を受領し任務失敗: 前金は受領済みだが報酬残額は未成立。翌年J4固定給与を発生させない。契約中の装備支出は別。
- 辺境の共同体で羊毛を得て共同の食事を受ける: 現物・共同体分配を記録。現金の勤務先を生成せず、同じ羊毛を共同売上と本人収入に重複計上しない。
- ライン生命の研究実習生が翌年研究職へ昇格: 旧職位給与と新職位給与を発効月で分割。特許交付金は実際のgrant判定がなければ0。
- 地元の会社に勤める配偶者と主人公が同居: 家計拠出は二人分であるが、同一世帯の収入を「二重受け取り」の形で追加しない。別居なら報告の確度、実際の送金と拠出を区別。
- 感染を理由に給与の一部を払わない雇用主: 生活上の受領現金0または減額と、雇用主が支払うべき債務と、当人が請求できる/できない制度上の状況を独立。差別イベントのflだけを給与確定根拠にしない。

## 6 導入順と監査境界

1. 給与正本の型と一意キーを追加し、まず実際に発生する年次行だけ記録。予測は非決済の見積欄で提供。
2. W04 episodeとW03 siteIDから契約現場を特定。月境界/当年の旅行・欠勤を使って一度だけ勤務率を求める。
3. 現行annual incomeへのprojectionを既存パラメータと照合。最低限、J0・通常18契約職・ロドス・BSW・ライン生命・自営・強制・隔離・家族のケースを分ける。
4. イベントcashや一時金にはsourceEffectIdを関連付け、日当・前金・研究助成の反復払いを検出する。
5. 住居費、教育・医療、援助、配偶者子の所得、税・借金など既存予算の他フィールドを維持。給与移行と同時に生活費計算を再設計しない。

## 7 受入 L01〜L12

L01 同一月・同一支給キーは一度。L02 応募段階では給与0。L03 無職かつ副業なしは年職業給与0。L04 5か月勤務は12か月満額にならない。L05 旅行不在は一度だけ按分。L06 単発護衛報酬は翌年に繰り越して自動発生しない。L07 自営は売上−費用。L08 家業・同居世帯は現物を含め一度計上。L09 配偶者・子の賃金へ主人公の勤務係数が掛からない。L10 昇進月は旧新役職の実期間で分割。L11 特許・慰労金・ボーナスは実績支払の根拠を持つ。L12 旧セーブの年間給与は移行月で区分し欠落・二重加算を起こさない。

ここでいう「年次」の精算確定月は既存年次処理に従う。現行コードが参照する前年度の旅行実績を、画面の当年日時へ誤接続しない。数値較正とエンジン実装/試験は別工程。
