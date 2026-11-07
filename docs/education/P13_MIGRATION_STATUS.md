# P13 学校イベント移行実績台帳（全178件）

- 根拠：`terra_education_P13_event_migration_178_contract_20261103(1).json`（2026-11-03）
- 対象：既存 **178件**。P13のファイル・対象・提案を保持し、実装進捗を個別に追跡する。
- この表の「接続済」「ガード」は当該行の**記載された範囲のみ**を表す。178件の本文・効果の移植完了宣言ではない。
- 新規P17草案80件の本文正本は `data/education/p17-reviewed-prose.js`、実際の接続方法は `js/education/migration.js` を参照。

## 現況

- I07:I03–I06入口の最終監査済：6件
- I07:学籍・授業・施設別発火ガード：38件
- I07:P13維持確認済（改修対象外）：78件
- I07:個別効果・本文移行済：49件（既存11件＋今回の個別確認・改修38件）
- I07:個別改修待ち：0件（既存I03–I06の部分接続6件は独立して継続監査）
- I07:今回の38件のうち現行効果を維持と確認：8件、個別改修・接続：30件
- I07:正規学籍への旧経路の二重適用を除外：3件
- 既存休止（show:false）：4件

I03–I06からの6入口（`sch`、`education_paused_life`、`higher_ed`、`education_upper_path`、`education_funding_review`、`education_graduation_review`）は、希望・募集検索と学籍登録、休学中の自習と正式履修、支援の申請と実納付、修了判断と認定資格の所有権を分離している。`p18-education-event-migration.test.cjs`で全6入口のイベント効果と初等学校検索の実呼出しを確認し、既存のI03〜I06専門テストで進路案件・納付・出席・履修・資格の正本を検証した。

## 既存イベント別の移行判定

| 優先度 | イベントID | 元ファイル | P13の変更 | I07の現況 | P13で要確認の内容 |
|---|---|---|---|---|---|
| P0 | `sch` | `data/base/childhood-attitudes.js` | 接続変更 | I07:I03–I06入口の最終監査済 | 6〜9歳の初等入学希望、入学不能でも本人の希望・家族判断を保持 |
| P1 | `bias_peer_mockery` | `data/base/childhood-attitudes.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 教室で感染者を嘲る同級生、実際の授業参加が前提 |
| P1 | `bias_teacher_lesson` | `data/base/childhood-attitudes.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 教員の偏見ある発言、当該学校の授業・担当教員を特定 |
| P2 | `attitude_counterexample` | `data/base/childhood-attitudes.js` | 維持 | I07:P13維持確認済（改修対象外） | 感染者との接触によって過去の偏見を見直す場面、本人の就学状況は無関係 |
| P2 | `car` | `data/base/career-entry.js` | 維持 | I07:P13維持確認済（改修対象外） | 就職応募であり学校の入学試験に変換しない |
| P2 | `life_victoria_failed_application_followup` | `data/base/career-entry.js` | 維持 | I07:P13維持確認済（改修対象外） | 事務職応募に失敗した後日談、過去の応募記録を参照 |
| P2 | `vic_clerk_later_years` | `data/base/career-entry.js` | 維持 | I07:P13維持確認済（改修対象外） | 事務職で後輩を指導する場面、雇用先の職務に限定 |
| P1 | `ksc` | `data/base/life-and-health.js` | 接続変更 | I07:改修・接続済み | 子の入学準備資金、子本人の学校・居住地と親負担を照合 |
| P2 | `elder_work_opportunity` | `data/base/life-and-health.js` | 維持 | I07:P13維持確認済（改修対象外） | 高齢者の店番・読み書き指導求人、教える相手と学籍は別 |
| P2 | `hobby_strain` | `data/base/family-and-livelihood.js` | 維持 | I07:P13維持確認済（改修対象外） | 趣味の月謝と家計の悩み、正式学費の請求に混ぜない |
| P0 | `race_identity` | `data/base/family-and-livelihood.js` | 本文分岐 | I07:個別改修・接続済 | 教室の名簿と家庭・近隣の出自経験の本文変種が混在 |
| P2 | `family_launch` | `data/base/family-and-livelihood.js` | 維持 | I07:P13維持確認済（改修対象外） | 家計への労働拠出相談、現行の教育必須判断と競合させない |
| P2 | `family_separation` | `data/base/family-and-livelihood.js` | 維持 | I07:P13維持確認済（改修対象外） | 家計分離と転居、現行の学籍や通学路はP08で別判定 |
| P1 | `fam_unemploy` | `data/base/family-and-livelihood.js` | 本文分岐 | I07:改修・接続済み | 失業した親と児童の就労・就学希望、学校がない場合の文を用意 |
| P2 | `fam_infected` | `data/base/family-and-livelihood.js` | 維持 | I07:P13維持確認済（改修対象外） | 親の感染を知った家庭内相談、学校への自動通知は禁止 |
| P2 | `fam_tribetree` | `data/base/family-and-livelihood.js` | 維持 | I07:P13維持確認済（改修対象外） | サーミの氏族養育と移住、口承の学びを学位に変換しない |
| P1 | `fam_inherit` | `data/base/family-and-livelihood.js` | 本文分岐 | I07:改修・接続済み | 親の店の継承と学業継続の選択、本人の在籍の有無で文を変える |
| P2 | `f14` | `data/base/daily-childhood.js` | 維持 | I07:P13維持確認済（改修対象外） | 生成型幼少期日常イベント、学校制度変更の直接根拠を未特定 |
| P2 | `f17` | `data/base/daily-childhood.js` | 維持 | I07:P13維持確認済（改修対象外） | 生成型幼少期の日常学校場面、実在校・授業参加を要件へ |
| P2 | `f18` | `data/base/daily-childhood.js` | 維持 | I07:P13維持確認済（改修対象外） | 生成型幼少期の日常学校場面、実在校・授業参加を要件へ |
| P2 | `f42` | `data/base/daily-adulthood.js` | 維持 | I07:P13維持確認済（改修対象外） | 生成型成人日常イベント、就学中条件は語彙だけで追加しない |
| P2 | `vic_patron` | `data/base/regional-west.js` | 維持 | I07:P13維持確認済（改修対象外） | 貴族の就職斡旋、学校の奨学金とは別の後援 |
| P2 | `col_hire` | `data/base/regional-west.js` | 維持 | I07:P13維持確認済（改修対象外） | クルビア企業の求人、採用試験は大学受験ではない |
| P1 | `lei_arts` | `data/base/regional-west.js` | 条件追加 | I07:個別改修・接続済 | 児童向けアーツ選抜、一般学校から専門授業へ進む選考 |
| P2 | `lei_witchking` | `data/base/regional-west.js` | 維持 | I07:P13維持確認済（改修対象外） | 旧体制資料の整理、教育施設の一般閉鎖を導かない |
| P2 | `sam_migrate` | `data/base/regional-east.js` | 維持 | I07:P13維持確認済（改修対象外） | サーミ氏族の野営地移動、巡回師・通信教育と連動し得る |
| P2 | `sam_ritual` | `data/base/regional-east.js` | 維持 | I07:P13維持確認済（改修対象外） | 雪祭司の儀礼、氏族教育としての知識を記録し得る |
| P2 | `yan_exam` | `data/base/regional-east.js` | 維持 | I07:P13維持確認済（改修対象外） | 官吏の採用試験、学校入試と誤分類しない |
| P2 | `lon_guard` | `data/base/regional-east.js` | 維持 | I07:P13維持確認済（改修対象外） | 近衛局への採用試験、学校の入学条件を追加しない |
| P2 | `timeline_katorga_incident` | `data/base/regional-conflict.js` | 維持 | I07:P13維持確認済（改修対象外） | 1101〜1102年の学生弾圧を目撃する地域歴史イベント、当事者の学籍と分離 |
| P2 | `f83` | `data/base/daily-regional.js` | 維持 | I07:P13維持確認済（改修対象外） | 生成型地域日常イベント、文脈の語彙一致段階 |
| P2 | `f91` | `data/base/daily-regional.js` | 維持 | I07:P13維持確認済（改修対象外） | 生成型地域日常イベント、文脈の語彙一致段階 |
| P1 | `daily_yan_53` | `data/regional/yan.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 炎国の書院で古典講読、書院課程と参加を要求 |
| P1 | `daily_yan_54` | `data/regional/yan.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 官吏登用試験の模擬答案、受験準備講座の参加を要求 |
| P1 | `daily_yan_55` | `data/regional/yan.js` | 本文分岐 | I07:改修・接続済み | 灯火の下での長時間読書、正規学生と独学の双方で成立 |
| P1 | `daily_yan_56` | `data/regional/yan.js` | 本文分岐 | I07:学籍・授業・施設別発火ガード | 天師府術師の特別講義、所属学生か公開聴講者かを分岐 |
| P1 | `daily_lungmen_58` | `data/regional/lungmen.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 情報端末室で国際金融・情報処理、教室設備と高等課程 |
| P1 | `daily_lungmen_59` | `data/regional/lungmen.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 下校後の級友との寄り道、同じ生活圏と通学帰路 |
| P1 | `daily_lungmen_60` | `data/regional/lungmen.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 高額な進学塾の月謝請求書、入塾と実際の請求を区別 |
| P1 | `daily_higashi_51` | `data/regional/higashi.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 下校後に川原で友人と会話、現実の登下校路 |
| P1 | `daily_ursus_47` | `data/regional/ursus.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 学校での愛国朝礼、施設の授業運営と参加 |
| P1 | `daily_ursus_57` | `data/regional/ursus.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 学校体育館の器械体操、設備・課程・健康条件 |
| P1 | `daily_ursus_58` | `data/regional/ursus.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 放課後の級友との読書、閉鎖期間の不自然な教室を排除 |
| P1 | `daily_ursus_59` | `data/regional/ursus.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 冬季の雪道通学、実在する帰路と冬季交通状態 |
| P1 | `daily_ursus_60` | `data/regional/ursus.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 源石燃料と蒸気圧の理科実験、上級課程と実験設備 |
| P2 | `choice_ursus_03` | `data/regional/ursus.js` | 維持 | I07:P13維持確認済（改修対象外） | ウルサスで隣人の教師による秘密印刷を目撃、教師との関係は就学条件ではない |
| P1 | `daily_victoria_57` | `data/regional/victoria.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 古典朗読の授業、正式な履修または対象講座 |
| P1 | `daily_victoria_58` | `data/regional/victoria.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 蒸気ピストンの工学実習、上位課程と工学実習室 |
| P1 | `daily_victoria_59` | `data/regional/victoria.js` | 本文分岐 | I07:改修・接続済み | 運河沿いで他の学生の漕艇練習を目撃、自分の在籍とは独立 |
| P1 | `daily_victoria_60` | `data/regional/victoria.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 学校の弁論部、課外活動と所属・稼働条件 |
| P2 | `daily_leithanien_13` | `data/regional/leithanien.js` | 維持 | I07:P13維持確認済（改修対象外） | 番号生成型の街路日常、抽出語だけでは学校体験と確定しない |
| P2 | `daily_leithanien_29` | `data/regional/leithanien.js` | 維持 | I07:P13維持確認済（改修対象外） | 番号生成型の日常、学校以外の場面を消さない |
| P2 | `daily_leithanien_32` | `data/regional/leithanien.js` | 維持 | I07:P13維持確認済（改修対象外） | 番号生成型の日常、学校以外の場面を消さない |
| P1 | `daily_leithanien_57` | `data/regional/leithanien.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 音楽院の防音レッスン室、音楽専門課程と受講者 |
| P1 | `daily_leithanien_58` | `data/regional/leithanien.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 古いアーツ記譜法と合奏理論、音楽・アーツ授業の履修 |
| P1 | `daily_leithanien_59` | `data/regional/leithanien.js` | 本文分岐 | I07:個別改修・接続済 | 学内コンクールを聴講、参加学生と公開観客の本文を分離 |
| P1 | `daily_leithanien_60` | `data/regional/leithanien.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 実技試験前夜の不安、登録済みの実際の試験に限定 |
| P1 | `choice_leithanien_03` | `data/regional/leithanien.js` | 接続変更 | I07:個別改修・接続済 | 才能ある孤児への音楽院制服・教材の支援、他者の実際の受入先 |
| P2 | `daily_laterano_18` | `data/regional/laterano.js` | 維持 | I07:P13維持確認済（改修対象外） | 番号生成型のラテラーノ日常、学籍要求の根拠未特定 |
| P1 | `daily_laterano_48` | `data/regional/laterano.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 修道院付属学校の聖歌練習、宗教課程か公開活動を判定 |
| P1 | `daily_laterano_49` | `data/regional/laterano.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 教皇教書・ラテラーノ法の神学授業、専門教育段階 |
| P1 | `daily_laterano_52` | `data/regional/laterano.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 学校射撃大会の代表、参加資格・規則・設備を確認 |
| P2 | `daily_columbia_39` | `data/regional/columbia.js` | 維持 | I07:P13維持確認済（改修対象外） | ライン生命研究室の勤務観測、大学受講者ではなく職員 |
| P2 | `daily_columbia_52` | `data/regional/columbia.js` | 維持 | I07:P13維持確認済（改修対象外） | 開拓地の学校への寄付窓口を目撃、本人学籍不要 |
| P1 | `daily_columbia_57` | `data/regional/columbia.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 論理演算回路の演習、上位課程と機材 |
| P1 | `daily_columbia_58` | `data/regional/columbia.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 学内技術コンテストの掲示、実際の学校行事と本人の参加 |
| P1 | `daily_columbia_59` | `data/regional/columbia.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 学内球技大会の声援、在校生と校外観客の境界 |
| P1 | `daily_columbia_60` | `data/regional/columbia.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 講義料納付の掲示、案内と本人の請求・納付を分離 |
| P1 | `daily_kazimierz_57` | `data/regional/kazimierz.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 騎士学校でランス突撃訓練、騎士専門課程 |
| P1 | `daily_kazimierz_58` | `data/regional/kazimierz.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | クラスメイトと競技騎士カード交換、放課後参加 |
| P1 | `daily_kazimierz_59` | `data/regional/kazimierz.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | スポンサー契約・八百長対策の商業法規講義、専門履修 |
| P1 | `daily_kazimierz_60` | `data/regional/kazimierz.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 騎士学校の学費・武具維持費、保護者への請求はP07の請求ID |
| P2 | `daily_siracusa_51` | `data/regional/siracusa.js` | 維持 | I07:P13維持確認済（改修対象外） | 法学生の屋外討論を目撃、観客の学籍は不要 |
| P0 | `daily_kazdel_56` | `data/regional/kazdel.js` | 本文分岐 | I07:改修・接続済み | 戦災地区の青空教室、正規学籍ゼロでも非正規学習なら参加可能 |
| P1 | `choice_kazdel_05` | `data/regional/kazdel.js` | 接続変更 | I07:個別改修・接続済 | 戦災孤児向け天幕寺子屋の開設、学校資格の自動付与なし |
| P2 | `choice_iberia_09` | `data/regional/iberia.js` | 維持 | I07:P13維持確認済（改修対象外） | 古い望遠鏡の修復と観測、学校の授業とは別 |
| P1 | `choice_bolivar_07` | `data/regional/bolivar.js` | 接続変更 | I07:個別改修・接続済 | 戦災で破損した村の小学校校舎の再建支援、開校は別確認 |
| P2 | `choice_rim_08` | `data/regional/rim-billiton.js` | 維持 | I07:P13維持確認済（改修対象外） | 鉱区住宅の換気設備支援、学校外の公共衛生活動 |
| P2 | `detain_life` | `data/base/confinement-and-education.js` | 維持 | I07:P13維持確認済（改修対象外） | 収容中の相談・書類と審査、学校に在籍している前提なし |
| P2 | `veteran` | `data/base/confinement-and-education.js` | 維持 | I07:P13維持確認済（改修対象外） | 傭兵の退職・若手指導、職場での技能伝承 |
| P0 | `education_return_path` | `data/base/confinement-and-education.js` | 別イベント化 | I07:再入学経路を案件へ接続済み | 学齢後の再入学・正式準備課程・仕事／氏族師弟の非正規教育が混在 |
| P1 | `education_paused_life` | `data/base/confinement-and-education.js` | 接続変更 | I07:I03–I06入口の最終監査済 | 休学中の暮らし、在籍先の再開と自習を分離 |
| P1 | `education_school_classroom` | `data/base/confinement-and-education.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 放課後の復習と級友の手伝い、実際の授業実施日 |
| P1 | `education_school_family_pressure` | `data/base/confinement-and-education.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 保護者失業などで通学継続困難、学校の在籍と家計の現況 |
| P1 | `education_school_prejudice` | `data/base/confinement-and-education.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 教室内で出自をめぐるいじめ、学校・同級生・教員の主体 |
| P1 | `education_school_disclosure_review` | `data/base/confinement-and-education.js` | 接続変更 | I07:正規学籍への旧経路の二重適用を除外 | 感染診断を学校へ公式申告する判断、旧校への通知と分離 |
| P0 | `education_transfer_review` | `data/base/confinement-and-education.js` | 接続変更 | I07:改修・接続済み | 学校による受入拒否・閉鎖に伴う転学選択、入学先のID |
| P0 | `higher_ed` | `data/base/confinement-and-education.js` | 接続変更 | I07:I03–I06入口の最終監査済 | 大学・職業校・アーツ学院の7系統出願、学校種別の実在・受験先ID |
| P0 | `education_upper_path` | `data/base/confinement-and-education.js` | 接続変更 | I07:I03–I06入口の最終監査済 | 前期中等修了後の後期中等への進学、別校・通学条件 |
| P0 | `education_funding_review` | `data/base/confinement-and-education.js` | 接続変更 | I07:I03–I06入口の最終監査済 | 学費納付・奨学・貸付・休学、学校側の制度と請求ID |
| P0 | `education_graduation_review` | `data/base/confinement-and-education.js` | 接続変更 | I07:I03–I06入口の最終監査済 | 修了判定と留年の選択、認定履修実績 |
| P1 | `uni_fee` | `data/base/confinement-and-education.js` | 除外 | 既存休止（show:false） | 旧大学通常年度学費イベント、show:falseの休眠処理 |
| P1 | `uni_final_fee` | `data/base/confinement-and-education.js` | 除外 | 既存休止（show:false） | 旧大学最終年度学費イベント、show:falseの休眠処理 |
| P1 | `voc_fee` | `data/base/confinement-and-education.js` | 除外 | 既存休止（show:false） | 旧職業課程通常年度学費イベント、show:falseの休眠処理 |
| P1 | `voc_final_fee` | `data/base/confinement-and-education.js` | 除外 | 既存休止（show:false） | 旧職業課程最終年度学費イベント、show:falseの休眠処理 |
| P2 | `study_to_work` | `data/base/confinement-and-education.js` | 維持 | I07:P13維持確認済（改修対象外） | 大学・職業課程修了後の就職探し、職種応募と学位授与を分離 |
| P1 | `arts_academy_completion` | `data/base/confinement-and-education.js` | 接続変更 | I07:個別改修・接続済 | アーツ学院修了と就職応募の経路、修了証拠を参照 |
| P2 | `teacher_path` | `data/base/confinement-and-education.js` | 維持 | I07:P13維持確認済（改修対象外） | 講師への就職応募、現在生徒である必要なし |
| P2 | `family_child_exposure_followup` | `data/parts/extensions/social-and-care/attitudes-family-knights.js` | 維持 | I07:P13維持確認済（改修対象外） | 子どもの感染曝露の再検査、学校への通知とは別 |
| P2 | `family_divorce_parenting_review` | `data/parts/extensions/social-and-care/attitudes-family-knights.js` | 維持 | I07:P13維持確認済（改修対象外） | 離婚後の子の居所・養育相談、就学は本人別 |
| P2 | `kaz_knight_injury_job_transition` | `data/parts/extensions/social-and-care/attitudes-family-knights.js` | 維持 | I07:P13維持確認済（改修対象外） | 負傷した騎士の事務職転向、学校入試と分離 |
| P1 | `life_chernobog_neighbourhood_reopening` | `data/parts/extensions/social-and-care/local-support-referrals.js` | 接続変更 | I07:個別改修・接続済 | チェルノボーグで中学校の再開告知を目撃、主人公の在籍は問わない |
| P0 | `life_ursus_school_aid` | `data/parts/extensions/social-and-care/local-support-referrals.js` | 本文分岐 | I07:個別改修・接続済 | チェルノボーグ事変の教室で同級生と避難する場面、非在籍者の視点も必要 |
| P1 | `life_ursus_school_aid_followup` | `data/parts/extensions/social-and-care/local-support-referrals.js` | 接続変更 | I07:個別改修・接続済 | 学校避難支援の直後、以前知った同級生へ連絡を取る後日談 |
| P1 | `life_ursus_school_aid_adult_followup` | `data/parts/extensions/social-and-care/local-support-referrals.js` | 接続変更 | I07:個別改修・接続済 | 成人後にチェルノボーグの古い同級生の連絡先を見返す後日談 |
| P2 | `life_kazdel_displaced_daily` | `data/parts/extensions/social-and-care/kazdel-displaced-life.js` | 維持 | I07:P13維持確認済（改修対象外） | カズデル避難民の日常と仕事の手順、技能訓練は限定 |
| P2 | `life_rhodes_research_review` | `data/parts/extensions/social-and-care/research-reunion.js` | 維持 | I07:P13維持確認済（改修対象外） | ロドス研究班の勤務配分見直し、教育課程とは別 |
| P2 | `life_rhodes_research_stall` | `data/parts/extensions/social-and-care/research-reunion.js` | 維持 | I07:P13維持確認済（改修対象外） | ロドスの研究停滞・職務判断、大学の修了とは別 |
| P2 | `earth_discr_school_guardian` | `data/parts/extensions/social-and-care/local-discrimination.js` | 維持 | I07:P13維持確認済（改修対象外） | 学校での差別・保護者の申し立て、被害児童と対象校 |
| P2 | `earth_discr_school_later` | `data/parts/extensions/social-and-care/local-discrimination.js` | 維持 | I07:P13維持確認済（改修対象外） | 過去の学校差別の後日談、先行した申し立て記録 |
| P2 | `earth_persecution_columbia_clinical_trap` | `data/parts/extensions/social-and-care/local-discrimination.js` | 維持 | I07:P13維持確認済（改修対象外） | クルビアの臨床排除、医療制度の話で大学入試ではない |
| P1 | `life_night_study` | `data/parts/extensions/education-and-later-life/training.js` | 接続変更 | I07:既存の学校外効果を確認済 | 就労しながらの夜学と職場の先輩による学習、学費・技能・時間を分離 |
| P1 | `life_youth_apprenticeship` | `data/parts/extensions/education-and-later-life/training.js` | 接続変更 | I07:既存の学校外効果を確認済 | 14歳の工房見習いと正規学習の選択、技能と学籍を分離 |
| P2 | `romance_cohabitation_review` | `data/parts/extensions/education-and-later-life/relationships-events-01.js` | 維持 | I07:P13維持確認済（改修対象外） | 恋人との同居・家計の判断、学資へ直接接続しない |
| P1 | `family_sibling_birth` | `data/parts/extensions/education-and-later-life/relationships-events-01.js` | 本文分岐 | I07:個別改修・接続済 | きょうだいの出生と学校や家事の日課の相談、学籍のない子にも生活選択を残す |
| P1 | `infection_school_disclosure` | `data/parts/extensions/education-and-later-life/relationships-events-03.js` | 接続変更 | I07:正規学籍への旧経路の二重適用を除外 | 鉱石病診断後の担任個人への相談と欠席届、学校全体への公式通知は別 |
| P1 | `family_child_future` | `data/parts/extensions/education-and-later-life/family-care.js` | 接続変更 | I07:既存の学校外効果を確認済 | 成人に近づいた子の進学・就職・独立の支援、本人の意思・学籍を親と分ける |
| P0 | `life_ursus_student_assembly_contact` | `data/parts/extensions/education-and-later-life/ursus-student-life.js` | 本文分岐 | I07:改修・接続済み | 1101年の学生集会の噂、非在学でも見聞きできるが学校へ戻る文がある |
| P1 | `life_ursus_student_assembly_meeting` | `data/parts/extensions/education-and-later-life/ursus-student-life.js` | 接続変更 | I07:改修・接続済み | 学生集会参加後の会合、初回参加と当時の場所を参照 |
| P1 | `life_ursus_student_assembly_protest` | `data/parts/extensions/education-and-later-life/ursus-student-life.js` | 接続変更 | I07:既存の学校外効果を確認済 | サンクト・グリファーブルクでの抗議参加、当時の参加フラグ |
| P2 | `life_ursus_katorga_life` | `data/parts/extensions/education-and-later-life/ursus-student-life.js` | 維持 | I07:P13維持確認済（改修対象外） | カトルガ収容区画の生存経験、現学籍を要求しない |
| P1 | `life_ursus_student_assembly_release` | `data/parts/extensions/education-and-later-life/ursus-student-life.js` | 接続変更 | I07:既存の学校外効果を確認済 | 収容からの釈放と旧友への連絡、当時の経験 |
| P1 | `life_ursus_student_assembly_later` | `data/parts/extensions/education-and-later-life/ursus-student-life.js` | 接続変更 | I07:個別改修・接続済 | 何年も後の学生連合時代の知人との連絡、後年の所属自由 |
| P1 | `life_ursus_student_assembly_pause_review` | `data/parts/extensions/education-and-later-life/ursus-student-life.js` | 接続変更 | I07:既存の学校外効果を確認済 | 学生連合から距離を置いた後の再連絡、連絡フラグ |
| P1 | `elder_daily_grandchild_letter` | `data/parts/extensions/education-and-later-life/elder-life.js` | 接続変更 | I07:個別改修・接続済 | 子や孫の学校・遊びについて便りを読む場面、本人から聞いた範囲のみ |
| P1 | `elder_choice_grandchild_gift` | `data/parts/extensions/education-and-later-life/elder-life.js` | 接続変更 | I07:個別改修・接続済 | 学校へ上がる孫への祝いの金品、実学校入学や学費納付を自動成立させない |
| P2 | `family_spouse_unemployment_support` | `data/extensions/family-and-community.js` | 維持 | I07:P13維持確認済（改修対象外） | 配偶者の技能講習費支援、配偶者本人の意思と費用 |
| P1 | `life_ursus_school_habit` | `data/extensions/family-and-community.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | ウルサスで実際に登校していた児童が授業と家の手伝いを考える |
| P1 | `life_ursus_classmate_contact` | `data/extensions/family-and-community.js` | 条件追加 | I07:個別改修・接続済 | 以前の学校生活後、同級生にノートを貸す場面、本人の過去の就学経験が必要 |
| P1 | `life_ursus_school_aid_later` | `data/extensions/family-and-community.js` | 接続変更 | I07:個別改修・接続済 | チェルノボーグ避難後の旧友との文通、現学籍や現住所を要件にしない |
| P1 | `ori_school_fragment` | `data/social/organizations-and-infection.js` | 本文分岐 | I07:個別改修・接続済 | 路上の不明な結晶の児童への対応、教師に報告する選択を非在籍者へ調整 |
| P2 | `ori_iberia_origin_doubt` | `data/social/organizations-and-infection.js` | 維持 | I07:P13維持確認済（改修対象外） | イベリア港湾の感染疑惑と安全点検、学校生活とは別 |
| P2 | `sr_rhodes_work_review` | `data/parts/routes/rhodes-and-factions/staff-routes-events-01.js` | 維持 | I07:P13維持確認済（改修対象外） | ロドス勤務の配置替え・新人指導、学内教育とは別 |
| P2 | `sr_rhodes_internal_bias_conflict` | `data/parts/routes/rhodes-and-factions/staff-routes-events-01.js` | 維持 | I07:P13維持確認済（改修対象外） | ロドス医療部の基礎衛生講習、正式学位ではない |
| P2 | `daily_rhodes_04` | `data/parts/routes/rhodes-and-factions/rhodes-landship-daily.js` | 維持 | I07:P13維持確認済（改修対象外） | ロドス艦内洗濯施設の日常、学校不存在でも成立 |
| P2 | `sr_rhodes_to_reunion_turning_point` | `data/parts/routes/rhodes-and-factions/cross-faction-routes.js` | 維持 | I07:P13維持確認済（改修対象外） | ロドスの中立と救援葛藤、学籍と無関係 |
| P2 | `sr_bsw_recruitment_assessment` | `data/parts/routes/rhodes-and-factions/bsw-routes.js` | 維持 | I07:P13維持確認済（改修対象外） | BSWの銃器適性・体力の採用審査、学校受験ではない |
| P2 | `sr_rhine_recruitment_exam` | `data/parts/routes/rhodes-and-factions/rhine-routes.js` | 維持 | I07:P13維持確認済（改修対象外） | ライン生命研究実習生の採用選考、学位試験ではない |
| P2 | `sr_rhine_section_assignment` | `data/parts/routes/rhodes-and-factions/rhine-routes.js` | 維持 | I07:P13維持確認済（改修対象外） | ライン生命の職場配属面談、学校の進級ではない |
| P2 | `sr_rhine_patent_breakthrough` | `data/parts/routes/rhodes-and-factions/rhine-routes.js` | 維持 | I07:P13維持確認済（改修対象外） | 特許申請・研究成果の評価、学籍不要 |
| P2 | `sr_rhine_promotion_chief` | `data/parts/routes/rhodes-and-factions/rhine-routes.js` | 維持 | I07:P13維持確認済（改修対象外） | 研究所主任への昇進、大学院進学ではない |
| P2 | `sr_rhine_diabolic_ethical_crossroad` | `data/parts/routes/rhodes-and-factions/rhine-routes.js` | 維持 | I07:P13維持確認済（改修対象外） | 研究所の倫理問題、学校に入学する機会とは別 |
| P2 | `sr_rhine_post_lone_trail_career_review` | `data/parts/routes/rhodes-and-factions/rhine-routes.js` | 維持 | I07:P13維持確認済（改修対象外） | ライン生命事件後の進退相談、職歴の連続 |
| P2 | `sr_rhine_whistleblower_return_review` | `data/parts/routes/rhodes-and-factions/rhine-routes.js` | 維持 | I07:P13維持確認済（改修対象外） | 内部告発後の再雇用審査、大学入学審査とは別 |
| P2 | `car_lmd_guard_entry` | `data/parts/routes/regional-careers/entry-east.js` | 維持 | I07:P13維持確認済（改修対象外） | 龍門近衛局の採用・体力審査、学校制度の外 |
| P1 | `car_vic_royal_entry` | `data/parts/routes/regional-careers/entry-west.js` | 接続変更 | I07:個別改修・接続済 | ヴィクトリアの「王立前衛学校」を名乗る士官採用、P14で名称と学制要確認 |
| P2 | `car_lei_golden_entry` | `data/parts/routes/regional-careers/entry-west.js` | 維持 | I07:P13維持確認済（改修対象外） | リターニア法衛の採用試験、学院の卒業と別 |
| P2 | `car_ibe_inq_entry` | `data/parts/routes/regional-careers/entry-frontier.js` | 維持 | I07:P13維持確認済（改修対象外） | イベリア裁判所への採用試問、身分記録と求人審査 |
| P2 | `car_vic_royal_daily_01` | `data/parts/routes/regional-careers/events-west.js` | 維持 | I07:P13維持確認済（改修対象外） | ヴィクトリアの将校クラブ職務、大学学籍を要求しない |
| P2 | `car_min_orator_daily_01` | `data/parts/routes/regional-careers/events-frontier.js` | 維持 | I07:P13維持確認済（改修対象外） | ミノス弁論官による公衆講義、教員職としての職務 |
| P1 | `cl_child_school_supplies` | `data/world/class-and-locality.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 在籍児童の文具格差、授業参加と支援範囲 |
| P1 | `cl_household_work_entry` | `data/world/class-and-locality.js` | 本文分岐 | I07:個別改修・接続済 | 家業の手伝いと学業の葛藤、未就学者には選択文を変更 |
| P2 | `cl_urban_rent_pressure` | `data/world/class-and-locality.js` | 維持 | I07:P13維持確認済（改修対象外） | 家賃と転居の圧力、寄宿費とは別勘定 |
| P1 | `cl_ursus_school_divide` | `data/world/class-and-locality.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | ウルサス学校内での身分・家柄の差別、学校の当事者 |
| P1 | `cl_columbia_school_fee` | `data/world/class-and-locality.js` | 接続変更 | I07:既存の学校外効果を確認済 | クルビア工房の機械講習、正規学費と区別 |
| P1 | `cl_training_long_term` | `data/world/class-and-locality.js` | 接続変更 | I07:既存の学校外効果を確認済 | クルビアの中長期技能講習、学習履歴へ |
| P1 | `facility_school_disruption` | `data/world/facilities.js` | 接続変更 | I07:個別改修・接続済 | 休校・教室不足・仮教室、実在在籍校の運営月 |
| P1 | `facility_school_reopen` | `data/world/facilities.js` | 接続変更 | I07:個別改修・接続済 | 再開した校舎での補習、復旧した学校ID |
| P1 | `people_school_introduction` | `data/relationships/facility-people.js` | 接続変更 | I07:個別改修・接続済 | 授業を担当する先生との出会い、本人在籍校を参照 |
| P1 | `people_school_followup` | `data/relationships/facility-people.js` | 接続変更 | I07:個別改修・接続済 | 以前に出会った先生の近況、卒業後の関係を継続 |
| P1 | `people_school_small_help` | `data/relationships/facility-people.js` | 条件追加 | I07:個別改修・接続済 | 学校の先生への教材運搬支援、かつての知人なら未在籍でも成立 |
| P0 | `site_school_transfer` | `data/relationships/facility-people.js` | 接続変更 | I07:正規学籍への旧経路の二重適用を除外 | 別教室への転入提案と施設接点更新、正式な学籍転籍が未接続 |
| P1 | `people_school_life_conversation` | `data/life/goals-and-family.js` | 接続変更 | I07:個別改修・接続済 | 顔なじみの教え手との近況、人物IDの継続 |
| P1 | `people_school_housing_concern` | `data/life/goals-and-family.js` | 接続変更 | I07:個別改修・接続済 | 教員の住居・教材の相談、学校への参加とは独立 |
| P2 | `inter_ursus_minority_work_v76` | `data/work/contracts.js` | 維持 | I07:P13維持確認済（改修対象外） | 兵営での出自照会、学校出願とは別 |
| P1 | `v77_child_informal_study` | `data/social/learning.js` | 条件追加 | I07:改修・接続済み | 9〜17歳の非在籍児童の近隣識字教室または独学 |
| P2 | `v77_written_application` | `data/social/learning.js` | 維持 | I07:P13維持確認済（改修対象外） | 求人への応募書類を自書するか相談する、学校入試ではない |
| P2 | `v77_sarkaz_historical_tension` | `data/social/learning.js` | 維持 | I07:P13維持確認済（改修対象外） | サンクタとサルカズの歴史話、学校課程を前提としない |
| P0 | `v77_adult_literacy_path` | `data/social/learning.js` | 接続変更 | I07:個別改修・接続済 | 成人識字教室の言語ID未指定と講座の費用・期間 |
| P2 | `v78_identity_home_language` | `data/social/conflict.js` | 維持 | I07:P13維持確認済（改修対象外） | 家庭言語と役所文書の隔たり、在籍の必要なし |
| P2 | `v81_housing_account` | `data/review/choice-policy.js` | 維持 | I07:P13維持確認済（改修対象外） | 住居申請の書類整理、教育制度の出願ではない |
| P1 | `v82_teacher_continuity` | `data/relationships/person-ties.js` | 接続変更 | I07:個別改修・接続済 | 知り合いの教師と授業内容の相談、当該学校・在職を参照 |
| P0 | `daily_siracusa_50` | `data/regional/siracusa.js` | 条件追加 | I07:学籍・授業・施設別発火ガード | 放課後に教会回廊で宿題、現行に就学条件なし |
| P2 | `daily_leithanien_10` | `data/regional/leithanien.js` | 維持 | I07:P13維持確認済（改修対象外） | 公園で音楽院生を見かける日常、本人の音楽院在籍不要 |
| P2 | `daily_leithanien_12` | `data/regional/leithanien.js` | 維持 | I07:P13維持確認済（改修対象外） | 街路で音楽院生を見かける日常、本人の音楽院在籍不要 |
| P1 | `daily_leithanien_54` | `data/regional/leithanien.js` | 接続変更 | I07:個別改修・接続済 | 音楽院オーディション時の診断非開示、応募先・感染認知を具体化 |
| P2 | `choice_yan_06` | `data/regional/yan.js` | 維持 | I07:P13維持確認済（改修対象外） | 官吏登用試験へ向かう学友の旅費・受験料を支援、本人の受験とは別 |
| P2 | `daily_yan_42` | `data/regional/yan.js` | 維持 | I07:P13維持確認済（改修対象外） | 村の年長者から伝統農具の修理を教わる学校外の学習 |


### I07 個別移行判定（2026-11-04）

残38件を全件判定し、30件は学校別の運営・学籍・教員ID・通学実態・本人の経験・分岐文面を再接続した。8件は既存の学校外学習・人間関係・進路支援と正式学籍の区分が維持されていることを個別に確認し、学校の授業・学費・修了資格を追加することなく移行判定を終了した。P13の個別分類と、P17の条件別通知・案件FSM・個別結果の受入証拠を分ける。後者は下節のサービス接続とP15/P19受入資料を参照する。

正規学校の出席・転学・卒業は実際の学籍・認定済み運営履歴・教員IDを参照する。既存の家族・氏族・工房・夜学は本人の学習や職業・生活選択であり、観察・寄付・相談だけから学籍と資格を作成しない。後年の文通も、返事の受領や転居が未記録の場合はその事実を自動確定させない。

## 移行の境界

P13で「維持」とした78件は、就職・親族・目撃・一般の学習を正規学籍へ誤統合しないため現状維持を確定した。新しい学籍・学校課程を発行する効果を持たず、この教育改修ではコード変更を要求しない。


正規学籍がある学校の担任・学校内差別・個別事件と、P17の旧草案が同一案件を二重に更新しないことを、P13の`doubleEffectGuard`と現行ソース効果で照合した。地域特有の実習・施設、目撃と本人の在籍が混同される日常文は、在籍先の科目／機材／実体IDが確認されるまで発火を抑止する。


## I07：条件別通知の独立した発行根拠

P17の本文80件・選択159件・条件別通知46通は`data/education/p17-reviewed-prose.js`を正本とし、結果未確定のE17だけ、入寮完了を先取りしない申込みの文面へ是正した（全文はプレイヤー表示文面台帳）。保留6件のうち2通は引き続き非発火。結果通知は`educationMigration.records[].notice`に選択と発行根拠を一度だけ記録する。

| P17 | 発火時の独立した確認 | 通知成立に必要な後日の証拠 | 起きないこと |
| --- | --- | --- | --- |
| E20 国境書類 | 実際に知った他国の募集校・当該区間の交通リンク・個別文書要件・担当窓口 | 申請IDと一致する担当窓口の交付または不許可の正式回答 | 全国一律の出入境規則や自由な越境を生成しない |
| E27 雇用主援助 | 現役雇用主のID・同社の実在講習提供者・本人に適用する支援規約・既知の募集課程 | 同じ雇用主の書面による可否、承認なら規約上限内の負担額 | 支援の約束を授業料納付や即時入学へ変換しない |
| E42 中止試験 | 実際の本人学籍・開催校・個別試験ID・中止通知 | 試験IDに紐付いた学校の振替登録と新日程、または明示された未定通知 | 試験中止を不合格・卒業・振替合格へ変換しない |
| E79 設備の配慮 | 本人ごとの確認済みの支援需要・在籍校ID・現実の利用障壁 | 学校が確認した実設備調整と対応できる需要、または根拠ある不承認 | 感染・病名から一律に障害や進学禁止を推定しない |

`educationP17RecordExternalDecision`は申請ID、発行主体、回答証拠、状態を一致させて確定する。証拠がない回答や別の雇用先・別の学校からの回答は拒否し、同じ申請IDの異なる再回答も拒否する。正式な回答がない間は条件別通知を保留する。`js/education/services.js`を月次配信前へ接続した。明示的な学校窓口照会から実経路の書類要件、現役雇用先の個別支援、本人の支援需要と当該校の設備状況を記録し、在籍校の6月試験が実休校なら中止記録を作る。申請後の月に独立回答を記録し、回答待ちの間は通知しない。

**対象検査**：`tests/p18-education-event-migration.test.cjs`でE20不許可、E27承認と金銭未決済、E42実振替日、E79実設備・支援需要の適合を個別再現。生の状態JSONに加え、`tests/ui-title-resume.test.cjs`で`makeResumeSnapshot → cont`を使った通知・発行記録の同版復元、復元後の再配信0件を確認。追加の通常生成・移動・寮・転学・表示・実保存復元は`p20-education-completion.test.cjs`、P15の対応は`P15_REPRESENTATIVE_ACCEPTANCE_20261104.md`に記録する。

## 窓口サービスのモデル根拠

個別生成校のサービス規約は学校・課程IDから固定し、初回照会で保存する。段差対応0.65、寮0.45、図書室の一般公開0.50、時間調整0.50、異議照会0.50、設備確保0.65、通学援助0.32はゲーム上の個別提供者の仮定であり、全国制度・原作設定・人口統計ではない。通学見積はP07の年12,000例を使用、寮の部屋月3,000・食費月2,000は今回明示した仮定を物価係数で調整する。国外の720分便と運賃は地域間移動のゲーム見積であり、毎日通学には使えない。

照会は申請・支払・入学・資格・診断の共有を確定しない。学校固有の文書、実欠便、危険度の回答は実際に確認した案件の証拠に限定する。工房弟子入りと氏族の学習は実際の既存イベントの指導結果から提供者・関係を記録し、元イベントで付与した能力を二度加算しない。史料保留6件と、実在施設・教員・通信教材等の独立証拠を持たない場面は、その証拠がない保存状態では表示しない。
