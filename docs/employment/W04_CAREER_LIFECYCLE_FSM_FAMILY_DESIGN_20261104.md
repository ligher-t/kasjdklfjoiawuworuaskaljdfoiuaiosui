# W04 生涯の就労状態機械・家族接続・イベント移行仕様 v1.0

日付: 2026-11-04。設計のみ。照合した現行コード: js/life/annual/personal-amounts.js、js/work/contracts.js、js/core/state.js、js/world/facilities.js。対象は主人公だけでなく家族・NPCの実際の職歴、失業と再雇用、学校・感染・旅行の時系列。

## 1 正本を三つに分離

- workCase: 「採用したい／知った／応募した／辞退した」という案件。personId + openingId または個別依頼ID + 受付時点で一意。成功以前には職業開始・月給・所属を与えない。
- employmentEpisode: 実際に始まった就業・役務の期間記録。episodeId、personId、jobId、employerId、siteId、positionId、kind、startDate、endDate、status、workplaceLocation、workFraction、leaveReason、sourceCaseId、effectiveEvidence、history。家業、氏族の活動、短期請負、強制労働も個別エピソードを持つ。
- occupationWorld と workKnowledge: 職場・職位・求人の存在、人物が知ることの別台帳。将来の採用可否の説明は世界情報を人物の既知情報で絞る。

s.job、s.workContract、workContractHistory、lifeRecord.careerChanges/affiliations、educationPath はレガシー互換の投影または専門正本。ゲーム画面にJ職業が表示されても、その職場・就業エピソードの存在を逆算して作らない。

## 2 workCase状態遷移

| 現状態 | 可能な次状態 | その瞬間に記録するもの |
|---|---|---|
| intent | discovered / abandoned | 志望と情報を知った契機。勤務実績0 |
| discovered | verified / unknown / expired | 募集主体、所在地、期間、情報確度 |
| verified | applied / deferred / withdrawn | 資格、通勤、受付可能性。照会だけなら変化なし |
| applied | screening / rejected / withdrawn / expired | 応募ID、提出物、応募結果の抽選コミット |
| screening | offered / rejected / deferred | 受理した選考結果と証拠。失敗も履歴として残す |
| offered | accepted / declined / expired | 本人受諾と有効期限。給与開始はまだ0 |
| accepted | contracted / revoked / expired | 契約/辞令/家族承認と予備枠の固定 |
| contracted | active / cancelled / unable-to-start | 勤務開始年月、配属地点、必要な住居・通勤 |
| active | suspended / transferred / terminated | 勤務日/月と終了理由。現職権利の変更 |
| suspended | active / terminated | 病気、出張、拘束、解雇・休暇の契約条件 |
| terminated | （同一episodeでは再開不可） | 再応募は新workCase、再雇用は新episode |

家業・氏族奉仕・ギグは対象の現実の引受人・資源・依頼成立を必要とし、正式企業の公募状態を省略しても構わない。徴兵・拘束労働は本人の応募／承諾を捏造せず commandIssued → assigned → active/suspended → released/escaped/ended の別入口とし、離職権と現金・現物・未払を保持。秘密組織参加は通常求人の全知的発見を使わない。

## 3 主職、副業、配属、資格

一人が同一時期に複数の請負や副収入を持つことはあり得るが、s.job は primaryEmploymentEpisodeId による一つの主たる役割の投影とする。副業を選ぶ際は既存契約・体力・時間・保護者/扶養義務・地域アクセスと干渉判定。年次給与の二重加算を禁止。

- 転職: 元episodeを離職日に閉じ、新episodeを実勤務日に開始。旧職場・評判・人脈・技能を消さない。
- 昇進: 同一雇用主/事業所のpositionIdを変更し、役職と賃金の発効日を保存。昇進資格や内定段階でJ値を早まって変更しない。
- 赴任/転属: 同一雇用主なら旧勤務地と新勤務地の時間履歴を切る。新しい給与責任主体へ移るなら旧契約を閉じ、新契約を開始。家族と教育先の住所は個別に扱う。
- 休職: 契約の存続と勤務可能性、賃金支払/補償を別にする。短期旅行は現行travelPresenceと不在月按分の意味を維持し、旅行先で自動再採用しない。
- 解雇、契約満了、退職、疾病による離職、徴用解除、会社閉鎖、死亡: 各々別reasonCode。失業は現時点の仕事の有無、経験の消去や永久不採用を意味しない。
- 学習: 大学入学希望/受験/在籍/修了/資格は教育正本で保持し、仕事の見習い修了を大学学位へ自動転換しない。
- 感染者と差別: 感染の実状態、本人の申告、応募先が知る診断、職場での安全問題、当局の正式認知を個別に扱い、旧職場の診断を新職場へ無断共有しない。

## 4 既存の年次・施設コードからの移行

現在 prepareAnnualPersonalBudget は特定条件で pickStarterJob を実行してその場で careerChanges を記録し、reconcileWorkContract を呼ぶ。移行後は世界側で本人の出発条件から実際の就業エピソードを一度だけ開始できる場合に限り primaryEmploymentEpisodeId を確定。最初の職を得られない人生、未就業で自営準備中の人生も認める。

既存 STANDARD_EMPLOYMENT_JOBS の18職種以外も、生計エピソードを持てる。旧setはレガシー契約の描画・調整のみで段階的に置換する。給与や職業IDの反映はエピソードの開始確定時の一回だけ。reconcileWorkContract を見ただけで新しい職場を作ることは許さない。

旧workContractHistoryは保持し、旧synthetic workplaceに紐づく現職は legacyContractEpisode として一本だけ投影。出典のない企業名・過去の応募結果を後付けしない。データ所有者が不明な既存s.jobの正当性を将来の募集で再審査して既に受け取った給与を取り消さない。転職から通常フローへ合流する。

## 5 家族とNPCの接続

familyPersonEmployment[personId] は主人公と同じ employmentEpisode の型を使い、同一地域・同一事業所の世界IDを参照する。現在の配偶者・成人子・親などの世帯収入の既存関数は、後方互換の集計出力として維持し、個別家族の勤務先の実体がある場合はその証憑から年度集計する。

親の鉱業なら現場の所在・操業・健康・退職を時点ごとに照合。同じ家族が家業収入を共有するとき、本人の給与と家計の売上が二重に加算されないようにする。別居子の転職は親から知らされている範囲だけ表示し、未確認の就職先を確定報告にしない。配偶者の収入変化や養育者の失職が、本人の職業・雇用主の会社状態を直接書き換えない。

既存の抽象的NPCは全員の細かな人生生成を要求しない。fixed aggregate workersと固有人物の稼働を区別し、詳細化した人物は固定集計から一度だけ分離する。

## 6 イベント接続のチェック

W01_A175_CHOICE_SEMANTIC_TRIAGE にある175イベント488枝を作業基準とする。特に car（23択）、各地の仕官、BSW昇進、ライン生命の研究配属、ロドスの治療と職員、雇用主への感染開示について、以下の通り一枝ごとに原文と効果を対応させる。

1. 表示時点に確定している事実と、本人が知り得る事実を分離。
2. 選択が応募、受諾、雇用、研修、単発依頼のどれに当たるかを裁定。
3. 成功／失敗／中断／辞退を別workCaseの効果へ写し、各結果に後続の入口を持たせる。
4. job:0 の効果が退職、休職、病欠、契約期間終了のどれか実際のイベント意味で裁定。
5. 同時に変わるfl、所属、認知、技能、賃金と先行イベントIDを保存。フラグの書込と解除を追跡。
6. 文体は短い散文、目の前の人と実際に得た結果を優先し、内部のJ番号や未受諾の採用確定を排除。改稿が生じたら PLAYER_TEXT_REVIEW に全文を保存。

## 7 冪等性とケース衝突

commitId は eventId + personId + choiceId + outcomeId + effectiveYearMonth + sourceCaseId から生成し、セーブ復元や同年再計算で同一採用・昇進・給与契約を二度作らない。人物が二つのofferを受諾した場合は勤務時間・遠隔地・相互排他を先に検査し、一方が辞退・期限切れになるまで同じ主職スロットを重複獲得させない。時間逆行や無効な事業所・未成年の無承諾を拒否し、結果文は採用が本当に確定したときだけ出す。

## 8 受入 T01〜T12

T01 求人閲覧はフラグなし。T02 不採用でJ・所属・給与が変化しない。T03 offeredだけでは給与0。T04 転職で旧職歴を保持。T05 休職は離職と区別。T06 出張時の契約保持と実勤務月数を分離。T07 既に終了した同一短期ギグは再課金不能。T08 本人と配偶者の別契約を独立計算。T09 失職後にも過去スキルと紹介者が残る。T10 初職に就けない人物でも生活シミュレーションが継続。T11 感染知識が他社へ転写されない。T12 旧セーブの初回ロードで現職と職歴が増殖しない。

本書で定義したworkCase遷移は実装前の設計であり、イベント分岐ごとの手動採否判定とエンジン実行テストは未実施。
