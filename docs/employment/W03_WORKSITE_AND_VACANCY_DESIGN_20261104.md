# W03 事業所・求人・雇用主の固定生成仕様 v1.0

日付: 2026-11-04。設計のみ。根拠: 既存19地域×13部門、66組織、83職業の設計資料および現行の js/world/facilities.js、js/work/contracts.js。ゲーム人口・実在企業従業員数の実測値ではなくゲーム上の仮説。

## 1 現行の根本的な逆転

現行 facilitySpecsFor(s) は s.job>0 から勤務先を作る。ensureFacilityRecords は地区内に合成siteを2件設け、ensureWorkplaceLedger は職員3〜12枠・募集1〜4枠相当と賃金/勤務条件を生成する。reconcileWorkContract は s.job と施設から契約を自動発行する。これらは就職可能性の世界側証明になっていない。新仕様は **土地→産業→主体→現場→職位→募集→認知→応募→採用→勤務** の順序に確定する。

## 2 IDと正本

| 正本 | 必須要素 | 制約 |
|---|---|---|
| occupationWorld.areas | workAreaId、regionKey、stablePlaceKey、7地区型、地理資源 | 人物の職業・訪問順・画面から独立 |
| organizations | organizationKey、実在根拠と年代、所有/連合の履歴 | 名の存在だけで支店を自動発生させない |
| employers | employerId、種別、資金・所有責任、homeAreaId | 官署・会社・家業・氏族を区別 |
| sites | siteId、employerId、workAreaId、業種、操業区間、実設備、移転履歴 | 主人公J職業から逆生成しない |
| positions | positionId、siteId、業務、J職業候補、定員・資格条件、任命権者 | 全社に全職位を生やさない |
| openings | openingId、positionId、期間、募集方法、枠数、採用予約、募集権限 | 選考・採用・勤務開始を分離 |
| workKnowledge | 人物ID、情報を得た時点・経路・信用度・知った範囲 | 未発見の募集を全知表示しない |
| worldWorkTransitions | 日時・before/after・siteId・原因・根拠・冪等キー | 休業・再開・倒産を重複させない |

組織の存在、法人格、支部の所在、事業所の稼働、求人、雇用主と本人の知識は別々の証拠を持つ。

## 3 19地域×7地区×13部門を職場へ変換する順序

1. 世界seedと恒久地区IDを固定。既存 ensureResidenceIdentity の district 訪問通番は、そのまま世界の永続事業所IDには使わない。匿名集落にも保存可能なstablePlaceKeyを与える。
2. 産業存在は既存0/1/2/3段階の暫定確率0.04/0.20/0.55/0.85と地区型補正を使用。鉱床、交通、耕作適性、港湾、宗教施設、官署、研究機関の成立条件を加える。確率は雇用率・求人率と呼ばない。
3. 採鉱と運輸、科学研究と設備整備、市場と配送などには固定の共通地理因子を用い相関を持たせる。個々のイベント抽選によって土地の産業を事後的に書き換えない。
4. 原作確認済みの組織は固有会社として登録するが、根拠付き地区・年代のサイトだけを具体化。固有名未照合の職種は架空の匿名事業者に置き換えるか当該名称の公開募集を停止する。
5. 施設規模はmicro/small/medium/large/institutional のゲーム用帯。実在職員の詳細NPCはidentifiedOccupiedSlots、未描画の既存就労者はaggregateOccupiedSlotsに記録し、同一人物が重複しないようにする。
6. 欠員は authorizedCapacity - identifiedOccupiedSlots - aggregateOccupiedSlots - reservedSlots とする。募集枠は欠員・予算・募集権限の小さい方で制限。内定者は期限付き予約し、辞退で戻す。採用確定でも勤務開始と給与発生は別。
7. 地区が存在しても地域の全世帯が現金給与を受けるとはしない。家業、氏族内分配、自営・行商、宗教奉仕、一件請負、強制配属を別方式とする。

## 4 経営と年代

site状態: planned → building → open ↔ strained ↔ suspended → closed、再開は reopened と新操業区間を記録。閉鎖は元職員の就労履歴・負債・未払を消さない。移転は旧siteと新siteの関係を保持。移動本艦・隊商は位置履歴を持ち、立寄り先に恒久支社を発生させない。

イベント年月の確定順: 歴史・災害 → 設備と供給 → 操業 → 欠員と公募 → 応募結果 → 月間勤務・債権。地方災害の作用範囲を国全体へ拡げない。人物が職場から引っ越しても、事業所の存続は変えない。

会社所有者も年代履歴で管理。シエスタのMountaincomm TradeはSL-1でMountainDash Logistics子会社とされ、SL-7に独立の決断がある。全時代を同じ子会社関係として持たない。https://arknights.wiki.gg/wiki/SL-1/Story および https://arknights.wiki.gg/wiki/SL-7/Story 。日本語表記と独立の月日は一次日本語版照合待ち。

## 5 乱数と保存

分布乱数は worldSeed、workAreaId、対象site/position、年月、更新種別から安定決定する。問い合わせ、選択肢の表示、ロード、実績集計で状態やRNGを進めない。初期化か年月確定時だけ世界を変更。保存には生成済みの地区、事業所、位置、募集、履歴と冪等キーを含める。複数の同一世界人物が共有施設を見ても同一siteIdを使用する。

## 6 移行と受入

新規人生では s.job に依存する合成勤務先生成と自動契約開始を置換する。旧セーブの現職は legacySyntheticSite として履歴・現契約を保護し、新たな転職以後は新世界IDを用いる。旧人生の過去を無断で書き換えない。

必須判定: S01 同一seedと地区で同じ職場。S02 閲覧反復で生成数不変。S03 未就業でも職場が存在。S04 一枠の二重採用なし。S05 鉱床なし鉱区の鉱業を拒否。S06 会社の製品流通だけで支社は出現しない。S07 過去の閉鎖が復元で取り消されない。S08 家業は求人枠なしで開始可能。S09 災害は対象siteに限定。S10 移動本艦の所在地と企業支社を分離。S11 旧セーブで現職と履歴を損失しない。S12 応募や照会は乱数/時計を消費しない。

この設計はコード変更・較正・テスト実行を含まない。校閲と文体の共通正本は docs/EVENT_PROSE_CAUSALITY_AND_REVIEW_STANDARD.md とする。
