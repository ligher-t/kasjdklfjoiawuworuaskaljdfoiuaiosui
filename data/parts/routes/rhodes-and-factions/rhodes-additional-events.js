// rhodes-additional-events: additional scoped events derived from the reviewed event draft.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/rhodes-additional-events"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  const onRhodes = s => $terraData.srOnStaff(s);
  const hasRhodesHistory = s => (s.lifeRecord?.affiliations || []).some(a => a.id === "rhodes-staff" && a.status === "left" && a.episodes?.some(ep => ep.endedYear != null));
  const events = [
  {
    id: "sr_rhodes_service_ration_custom",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.service && (s.age || 0) >= 16,
    t: "多国籍なオペレーターたちが暮らす本艦の食堂では、出身地ごとの調味料や保存食の発注管理だけでも一苦労だ。サルゴン出身の隊員が求める香辛料と、ウルサス出身者が好む黒パンの在庫を合わせながら、翌週の献立表を栄養士とすり合わせた。",
    fx: {}
  },
  {
    id: "sr_rhodes_service_orphan_school",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.service && (s.age || 0) >= 16,
    t: "本艦に保護された感染者の子供たちのための簡易教室に、新しい筆記具と絵本を届けた。かつて鉱山やスラムで文字を習う機会のなかった子供たちが、拙い手つきで自分の名前を書き留める姿に、後方支援の意味を改めて実感した。",
    fx: {}
  },
  {
    id: "sr_rhodes_service_branch_safehouse",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "地域支部") && s.job === $terraData.SR_JOBS.service && (s.age || 0) >= 16,
    t: "都市の表通りでは普通の薬局を装っている地域支部の裏倉庫で、外勤小隊が夜間任務で使う携帯食糧と応急医療キットを梱包した。近隣の憲兵や監視網に怪しまれないよう、納品伝票の名目を日用品に書き換えるのも支部職員の大切な仕事だ。",
    fx: {}
  },
  {
    id: "sr_rhodes_maint_crawler_sand",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.maintenance && (s.age || 0) >= 16,
    t: "荒野を長距離航行した後のロドス本艦の下部クローラーは、結晶化した砂塵と岩片がびっしりと噛み込んでいる。高圧洗浄機とスクレイパーを手に、エンジンの排熱がまだ残る巨大な履帯の隙間を一つずつ清掃し、摩耗したピンを交換した。",
    fx: {}
  },
  {
    id: "sr_rhodes_maint_drone_hangar",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.maintenance && (s.age || 0) >= 16,
    t: "エンジニア部の整備ハンガーで、偵察・医療支援用ドローンのローターと源石バッテリーの定期点検を行った。外勤部隊から「強風下でも姿勢が乱れないようになった」と短い礼のメモが届き、油まみれの作業着の袖で額の汗を拭った。",
    fx: {}
  },
  {
    id: "sr_rhodes_maint_prts_cables",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.maintenance && (s.age || 0) >= 16,
    t: "本艦の隔壁裏を通るPRTS（統合制御システム）の中継光ケーブルの被覆点検に入った。ロドスが発掘されて以来の古い骨格構造と、後から増設された最新設備が入り組むダクトの奥で、微かに脈動する冷却管の音に耳を澄ませながら端子を締め直した。",
    fx: {}
  },
  {
    id: "sr_rhodes_res_blood_crystallization",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.research && (s.age || 0) >= 16,
    t: "医療部の検査室で、各国の支部や外勤小隊から送られてきた血液サンプルの血中源石密度と結晶化進行度の測定を続けた。数値が悪化している患者のカルテには優先処方のタグを付け、担当医の端末へと静かに転送した。",
    fx: {}
  },
  {
    id: "sr_rhodes_res_prosthetic_rehab",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.research && (s.age || 0) >= 16,
    t: "鉱石病の進行や戦闘負傷で四肢を失った患者のリハビリ室で、源石神経接続型の義肢の微調整を手伝った。最初は一歩を踏み出すのにも苦労していた患者が、自分の足で廊下を歩けるようになるまでの記録を丁寧に日誌へ書き留めた。",
    fx: {}
  },
  {
    id: "sr_rhodes_res_herb_compound",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.research && (s.age || 0) >= 16,
    t: "療養庭園から届いた薬草エキスを鎮痛剤に配合する試験を手伝った。源石抑制剤特有の強い吐き気や頭痛を少しでも和らげるため、糖衣の配合比率をコンマ数グラム単位で調整する地道な作業が夜遅くまで続いた。",
    fx: {}
  },
  {
    id: "sr_rhodes_field_briefing_sim",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.field && (s.age || 0) >= 16,
    t: "作戦会議室で、PRTSが投影する立体地形図を囲みながら次期任務のブリーフィングを受けた。感染者武装勢力や現地の私兵との無用な交戦を避け、いかにして救護対象だけを安全に撤退させるか、小隊長と撤退経路を何度も確認した。",
    fx: {}
  },
  {
    id: "sr_rhodes_field_after_action_report",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.field && (s.age || 0) >= 16,
    t: "数日間の荒野任務から帰還し、泥と煤のついた防具を整備班に預けたあと、仮眠を取る前に作戦報告書の作成に取りかかった。消費した弾薬や抑制剤の本数を一行ずつ入力していると、隣席の先輩オペレーターが温かいコーヒーを差し入れてくれた。",
    fx: {}
  },
  {
    id: "sr_rhodes_field_arts_tuning",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.field && (s.age || 0) >= 16,
    t: "訓練場の射撃レーンで、自分のアーツユニットの結晶回路の同調テストを行った。ロドス規格のユニットは身体への逆流負荷を最小限に抑える設計になっており、かつて独学で使っていた頃よりも遥かに安定した出力が出せるようになっていた。",
    fx: {}
  },
  {
    id: "sr_rhodes_transporter_dead_drop",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && s.job === $terraData.SR_JOBS.transporter && (s.age || 0) >= 16,
    t: "移動都市の外縁にある廃駅のロッカーを使い、現地の協力者へ抑制剤のケースと暗号化された通信モジュールを受け渡した。互いの顔も見ず、合言葉の刻印だけを確認して立ち去る緊張感には、何度経験しても独特の冷や汗が伴う。",
    fx: {}
  },
  {
    id: "sr_rhodes_transporter_customs_bribe",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && s.job === $terraData.SR_JOBS.transporter && (s.age || 0) >= 16,
    t: "国境検問所で医療機器の輸送コンテナが足止めされた。外務部が事前に整えた通行書類と積み荷の申告を示し、追加の検査にも立ち会ってようやくゲートを通過した。荷台に積んだ緊急薬は無事だった。",
    fx: {}
  },
  {
    id: "sr_rhodes_transporter_beacon_repair",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 16 },
    show: s => onRhodes(s) && s.job === $terraData.SR_JOBS.transporter && (s.age || 0) >= 16,
    t: "天災が通過した後の荒野に車を走らせ、砂嵐で倒壊していたロドスの長距離通信ビーコンを掘り起こして再起動させた。アンテナの向きを本艦の予想航路に合わせると、受信機から馴染みのある暗号信号のビープ音が返ってきた。",
    fx: {}
  },
  {
    id: "sr_rhodes_reserve_squad_drill",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 15 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.reserve && (s.age || 0) >= 15,
    t: "行動予備隊の同期たちと、本艦の模擬戦闘区画で盾役・狙撃・医療の連携訓練を繰り返した。出身地も種族もバラバラで最初は息が合わなかった小隊も、教官に怒鳴られながら泥臭く訓練を重ねるうちに、目配せだけで動けるようになってきた。",
    fx: {}
  },
  {
    id: "sr_rhodes_reserve_exam_prep",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 15 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.reserve && (s.age || 0) >= 15,
    t: "消灯後の宿舎で、予備隊の仲間たちと基礎戦術学や源石災害防護マニュアルの筆記試験に向けた勉強会を開いた。実技は得意でも座学が苦手な隊員に図解で教え合ううちに、自分自身の理解も深まっていった。",
    fx: {}
  },
  {
    id: "sr_rhodes_reserve_gear_care",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 5,
    w: 0.28,
    ge: { age: 15 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.reserve && (s.age || 0) >= 15,
    t: "支給されたばかりのロドス制式防具と通信機を分解清掃し、自分の体格に合わせてベルトの留め具を調整した。まだ大きな戦場に出たことはないが、いつか誰かの命を守る盾になるための準備だけは怠らないと心に決めた。",
    fx: {}
  },
  {
    id: "sr_rhodes_choice_contraband_painkiller",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && ["service", "research"].some(key => s.job === $terraData.SR_JOBS[key]) && (s.age || 0) >= 18,
    t: "ロドスに収容されたばかりの重度感染者の患者が、闇市で出回っている粗悪だが即効性のある違法鎮痛剤を隠し持っているのを見つけた。患者は「ロドスの処方薬では夜の激痛に耐えられない」と震える声で懇願している。",
    c: [
      $terraData.K("規則通り没収し、医療部に鎮痛処方の見直しを申請する", {}, [1, "患者からは一時的に恨まれたが、担当医に事情を伝えて投与スケジュールを調整してもらい、危険な副作用を未然に防ぐことができた。", {"k":1,"m":1,"groupStanding":{"id":"rhodes-colleagues","delta":2}}]),
      $terraData.K("今夜一錠だけ見逃し、翌朝から減薬プログラムへ誘導する", {}, [1, "規律違反のリスクを背負いつつ患者の信頼を繋ぎ止め、翌日からは自主的に残りの薬を提出させることに成功した。", {"m":-1,"lifeSkill":{"id":"care-aid","level":1},"groupStanding":{"id":"rhodes-colleagues","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_choice_local_police_standoff",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && ($terraData.srRhodesPost(s, "地域支部") || s.job === $terraData.SR_JOBS.transporter) && (s.age || 0) >= 18,
    t: "地域支部の診療所に治安担当者が訪れ、感染者の患者について照会を求めた。患者の個人情報を確認なしに渡すことはできないが、要求にどう応じるか判断しなければならない。",
    c: [
      $terraData.K("照会の根拠と手続を確認し、患者情報の扱いを責任者へ引き継ぐ", {}, [1, "患者情報をその場で渡さず、照会の根拠と書類を確認した。支部の責任者と法務担当へ連絡し、必要な手続を確かめるまで対応を保留した。", {"k":1,"m":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("患者と診療担当者に状況を伝え、落ち着いて待てる場所を整える", {}, [1, "治安担当者の照会を診療担当者へ伝え、患者本人にも分かる範囲を説明した。個人情報を守りながら、支部の責任者が応対できるまで診療を続けた。", {"m":1,"lifeSkill":{"id":"quiet-resolve","level":1}}])
    ]
  },
  {
    id: "sr_rhodes_choice_sweep_suspicion",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 20 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && (s.age || 0) >= 20,
    t: "同室の職員が勤務記録にない通信端末を使っているのを見かけた。翌日、保安担当者からその時間帯の様子を尋ねられたが、通信の内容や相手は分からない。見聞きした範囲をどう伝えるか、判断を求められた。",
    c: [
      $terraData.K("自分が確認した時刻と行動だけを保安担当者へ報告する", {}, [1, "見た事実と分からない点を分けて伝えた。担当者は正式な手順で確認すると告げ、あなたはその後の調査を待つことにした。", {"m":-1,"k":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("先に本人へ、通信の扱いについて確認する", {}, [1, "本人は端末の利用に理由があると話したが、詳しい説明は担当者を交えて行うことになった。あなたは断定を避け、聞いた内容を保安担当者へ伝えた。", {"m":1,"lifeSkill":{"id":"quiet-resolve","level":1}}])
    ]
  },
  {
    id: "sr_rhodes_choice_former_enemy_ward",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && ["research", "field", "reserve"].some(key => s.job === $terraData.SR_JOBS[key]) && (s.age || 0) >= 18,
    t: "先日の作戦でロドス小隊と交戦し、仲間に重傷を負わせた敵対武装勢力の感染者兵士が、捕虜兼患者として医療部の隔離病棟に運び込まれてきた。同僚の中には「なぜ味方を傷つけた連中に貴重な抑制剤を使うのか」と苛立ちを隠せない者もいる。",
    c: [
      $terraData.K("「ベッドの上では敵も味方もない」と割り切り、規定通りの看護・警備にあたる", {}, [1, "感情を押し殺して職務を全うするあなたの姿勢に、荒れていた同僚たちも次第に冷静さを取り戻していった。", {"m":1,"lifeGoal":{"id":"rhodes-work","progress":2},"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("被害に遭った同僚のケアを優先し、隔離病棟の担当から外してもらうよう申請する", {}, [1, "無理に聖人ぶらず、傷ついた仲間のそばに寄り添ったことで、小隊内の結束はかえって強まった。", {"m":2,"groupStanding":{"id":"rhodes-colleagues","delta":2}}])
    ]
  },
  {
    id: "sr_rhodes_choice_sponsor_inspection",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 19 },
    show: s => onRhodes(s) && ["maintenance", "research"].some(key => s.job === $terraData.SR_JOBS[key]) && (s.age || 0) >= 19,
    t: "ロドスに医療機器や資金を提供している外部の提携企業の視察団が来艦し、「感染者スタッフを直接ラインから外せばさらに出資を増やせる」と暗に求めてきた。案内役を任されていたあなたは、返答を求められた。",
    c: [
      $terraData.K("感染者スタッフの高度な技術データと安全実績を示し、偏見を論理的に覆す", {}, [1, "徹底した実測データの前に視察団もぐうの音も出ず、現行体制のままでの契約更新を認めさせることができた。", {"k":2,"m":2,"groupStanding":{"id":"rhodes-colleagues","delta":2}}]),
      $terraData.K("その場は返答を保留し、交渉権限を持つ担当者へ引き継ぐ", {}, [1, "案内役の権限では答えられないと伝えて担当者へ引き継いだ。提携の継続や条件はその後の協議に委ねられた。", {"k":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_choice_catastrophe_orphan_rescue",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 17 },
    show: s => onRhodes(s) && ["field", "transporter", "reserve"].some(key => s.job === $terraData.SR_JOBS[key]) && (s.age || 0) >= 17,
    t: "天災警報が鳴り響く被災村からの撤退中、輸送車の定員と積載重量が限界に達している状態で、瓦礫の下から助けを求める感染者の老夫婦を見つけた。これ以上留まれば源石嵐の前縁に巻き込まれる危険がある。",
    c: [
      $terraData.K("自分の予備装備と私物をすべて投棄して重量を空け、二人を車内に引き上げる", {}, [1, "飛び散る源石粉塵に頬を切られながらも、間一髪で嵐の圏外へ脱出した。老夫婦の震える手から伝わった温もりは一生忘れられないものになった。", {"h":-2,"m":3,"groupStanding":{"id":"rhodes-colleagues","delta":2},"regionalImpact":{"id":"catastrophe-relief","delta":2}}]),
      $terraData.K("応急シェルターへの誘導と通信ビーコンの設置にとどめ、輸送車全体の生還を優先する", {}, [1, "嵐が過ぎ去った翌朝に救助ヘリを手配して二人を収容したが、冷徹な判断を下した瞬間の重압は長く胸に残った。", {"m":-1,"k":1,"regionalImpact":{"id":"catastrophe-relief","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_choice_experimental_inhibitor",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && !!s.inf && (s.age || 0) >= 18,
    t: "医療部の研究チームから、効果や副作用がまだ確定していない治験への協力を打診された。説明文書には、予想される負担と途中で参加を取りやめる手順が記されている。",
    c: [
      $terraData.K("説明を確認し、希望する範囲で治験に協力する", {}, [1, "担当者と参加条件や中止の手順を確認して同意した。体調の変化を記録し、医療部へ報告することになった。効果については、今後の経過を見て判断する。", {"m":1,"rl":-1,"lifeAffiliation":{"id":"rhodes-research","title":"ロドス医療研究の治験協力","kind":"research-participant","role":"治験協力者","action":"join"}}]),
      $terraData.K("現在の業務への支障を考え、実績のある標準処方の継続を希望する", {}, [1, "主治医もあなたの判断を尊重してくれ、無理のないペースで治療と勤務を両立させることになった。", {"m":1,"h":1}])
    ]
  },
  {
    id: "sr_rhodes_choice_originium_slug_colony",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 16 },
    show: s => onRhodes(s) && ["service", "maintenance"].some(key => s.job === $terraData.SR_JOBS[key]) && $terraData.srRhodesPost(s, "本艦") && (s.age || 0) >= 16,
    t: "本艦の最下層にある予備配管区画で、誰かがこっそり餌を与えていたらしいオリジムシの数匹の群れが温水パイプの周りに巣を作っているのを発見した。放置すれば断熱材をかじられる恐れがある。",
    c: [
      $terraData.K("生態飼育区画の担当オペレーターに連絡し、安全に捕獲・移送してもらう", {}, [1, "オリジムシに詳しいオペレーターが嬉しそうに引き取っていき、配管も傷つけずに済んだ。お礼に自家製のクッキーをもらった。", {"m":2,"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("マニュアル通りに害虫駆除用の忌避ガスを撒いて一掃し、防護網を溶接する", {}, [1, "設備の安全は完璧に保たれたが、噂を聞きつけた虫好きのオペレーターからしばらく寂しそうな目で見られた。", {"k":1}])
    ]
  },
  {
    id: "sr_rhodes_choice_deceased_operator_belongings",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 19 },
    show: s => onRhodes(s) && (s.age || 0) >= 19,
    t: "亡くなった同僚の私物を整理することになった。遺品の扱いは本人の希望や遺族への連絡方針を人事と確認する必要がある。書きかけの手紙と業務記録を前に、どこまで誰へ渡すか話し合った。",
    c: [
      $terraData.K("人事に確認し、遺族へ渡せる手紙だけを送る", {}, [1, "人事担当者に遺品の扱いを確認し、手紙を送れる形に整えた。業務記録は閲覧範囲を確認して保管先へ引き継ぎ、遺族への連絡は定められた窓口から行った。", {"m":1,"lifeSkill":{"id":"quiet-resolve","level":1},"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("人事の担当者と相談し、本人の希望が分かる資料を探す", {}, [1, "記録を調べても遺族への共有について明確な希望は見つからなかった。業務記録は保管先へ引き継ぎ、家族には人事の窓口から確認を取ることにした。", {"k":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_choice_encrypted_sarkaz_relic",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 20 },
    show: s => onRhodes(s) && ["maintenance", "research"].some(key => s.job === $terraData.SR_JOBS[key]) && $terraData.srRhodesPost(s, "本艦") && (s.age || 0) >= 20,
    t: "由来のはっきりしない古い記録媒体が、調査中の医療機器から見つかった。媒体の表示には読めない識別情報とアクセス制限があり、保管経緯も確認できていない。",
    c: [
      $terraData.K("記録媒体を開かず、発見場所と状態を記録して封印のまま提出する", {}, [1, "発見した場所と状態を記録し、媒体は封印して担当部門へ引き渡した。由来の調査と閲覧権限の確認は、責任者の判断に委ねた。", {"k":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("端末へ接続せず、表示された識別情報だけを保安担当へ伝える", {}, [1, "識別情報を記録して保安担当へ連絡し、媒体を隔離して保管した。内容を開くことはせず、確認手順の指示を待った。", {"k":2,"m":-1}])
    ]
  },
  {
    id: "sr_rhodes_choice_infected_child_tantrum",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 16 },
    show: s => onRhodes(s) && ["service", "research", "reserve"].some(key => s.job === $terraData.SR_JOBS[key]) && (s.age || 0) >= 16,
    t: "保護されたばかりの感染者の少年が、注射への恐怖と大人への不信感から処置室で暴れ出し、未熟なアーツを暴発させて医療器具を吹き飛ばした。周囲のスタッフが怯むなか、あなたが一番近くにいる。",
    c: [
      $terraData.K("防具も構えずに歩み寄り、飛び散る火花を受け止めながら少年を強く抱きしめて落ち着かせる", {}, [1, "腕に軽い火傷を負ったが、少年は驚いたように力を抜き、やがて声を上げて泣きじゃくりながら大人しく処置を受けた。", {"h":-2,"m":3,"lifeSkill":{"id":"care-aid","level":1},"groupStanding":{"id":"rhodes-colleagues","delta":2}}]),
      $terraData.K("即座にアーツ遮断ブランケットを投げかけ、安全を確保してから穏やかに語りかける", {}, [1, "怪我人を一人も出すことなくアーツの暴走を封じ込め、その後じっくりと時間をかけて少年の警戒を解いた。", {"k":1,"m":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_choice_burned_out_medic",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 19 },
    show: s => onRhodes(s) && s.job === $terraData.SR_JOBS.research && (s.age || 0) >= 19,
    t: "次々と運び込まれる重症患者の看取りが続き、同じ班の先輩医療スタッフが当直室の隅で聴診器を握りしめたまま動けなくなっているのを見つけた。「どれだけ薬を調合しても、誰も完治させられない」と虚ろな目で呟いている。",
    c: [
      $terraData.K("先輩の様子を責任者へ伝え、当直交代と休養を相談する", {}, [1, "責任者に状況を伝え、当直を交代して先輩の休養時間を確保した。落ち着いてから次の勤務を決めることになった。", {"m":1,"groupStanding":{"id":"rhodes-colleagues","delta":2}}]),
      $terraData.K("かつてその先輩が救い、今は元気に働いている予備隊員のところへ一緒に連れていく", {}, [1, "「あなたのおかげで今も生きている」という隊員の笑顔を見て、先輩の目にも少しずつ光が戻ってきた。", {"m":3,"groupStanding":{"id":"rhodes-colleagues","delta":2}}])
    ]
  },
  {
    id: "sr_rhodes_choice_black_market_parts",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && ["maintenance", "transporter"].some(key => s.job === $terraData.SR_JOBS[key]) && (s.age || 0) >= 18,
    t: "正規ルートの部品調達が各国の輸出規制で遅れるなか、出入りの商人から「出所は聞かないでくれが、軍用の最高級源石コンデンサを半値で卸せる」と持ちかけられた。採用すれば整備の遅れは一気に解消する。",
    c: [
      $terraData.K("盗品や追跡ビーコン混入のリスクを警戒し、時間はかかっても既存部品の再生修理で乗り切る", {}, [1, "後日、その商人が扱っていた部品に軍の追跡タグが仕込まれていたことが判明し、あなたの慎重な判断がロドスの位置露見を防いだと称賛された。", {"k":2,"m":1,"groupStanding":{"id":"rhodes-colleagues","delta":2}}]),
      $terraData.K("購入の可否は保留し、検査できる範囲と調達経路を責任者へ確認する", {}, [1, "部品を受け取らず、型番と提示された条件だけを記録して調達担当へ引き継いだ。正規の手続と安全性を確認してから、必要な修理の見通しを立てることになった。", {"k":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_choice_neurological_memory_case",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 20 },
    show: s => onRhodes(s) && ["research", "field"].some(key => s.job === $terraData.SR_JOBS[key]) && (s.age || 0) >= 20,
    t: "本艦の神経系・特殊医療区画で、脳神経に近い部位まで微細結晶が進行し、過去の凄惨な記憶のフラッシュバックに苦しむ患者のケア補助を任された。感情の波がそのままアーツの微弱放電を引き起こしている。",
    c: [
      $terraData.K("投薬量を増やすのではなく、規則正しい生活音と対話で現実感を繋ぎ止める療法を続ける", {}, [1, "何週間もの根気強い対話の末、患者の脳波と源石活性のスパイクが穏やかになり、主治医から専門補助員としての適性を認められた。", {"k":2,"m":2,"lifeSkill":{"id":"care-aid","level":2},"groupStanding":{"id":"rhodes-colleagues","delta":2}}]),
      $terraData.K("精密な神経遮断プログラムの調整に徹し、発作の物理的なダメージを最小限に抑える", {}, [1, "緻密なモニタリングによって重篤な神経損傷を防ぎきり、医療データ解析の分野で大きな信頼を得た。", {"k":3,"m":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_promo_reserve_to_field",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.1,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.reserve && s.k >= 30 && s.h >= 45 && (s.age || 0) >= 18,
    t: "行動予備隊での数年にわたる訓練と後方支援任務の実績が評価され、ついに正規の外勤オペレーターへの昇格審査に呼ばれた。教官との模擬戦と戦術試問を突破すれば、最前線の小隊へ配属されることになる。",
    c: [
      $terraData.K("昇格審査を受け、正規の外勤オペレーターとして前線へ立つ", {}, [1, "審査を通過し、予備隊から外勤部門への配属が決まった。担当する任務と引継ぎ先を確認して、新しい勤務を始めた。", {"job":$terraData.SR_JOBS.field,"m":1,"k":1,"lifeAffiliation":{"id":"rhodes-staff","role":"本艦・正規外勤オペレーター","action":"role"},"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("後輩の予備隊員たちを支えるため、行動予備隊に残る", {}, [1, "昇格を急がず、予備隊の訓練と引継ぎを支える役目を続けることにした。", {"m":1,"lifeAffiliation":{"id":"rhodes-staff","role":"本艦・行動予備隊先任","action":"role"},"groupStanding":{"id":"rhodes-colleagues","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_promo_reserve_to_specialist_dept",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.1,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.reserve && s.k >= 35 && (s.age || 0) >= 18,
    t: "予備隊での基礎訓練中、あなたの高い筆記成績と技術適性に目を留めた医療部とエンジニア部の双方から、「戦闘員としてだけでなく、専門技術スタッフとして本配属にならないか」とスカウトが届いた。",
    c: [
      $terraData.K("医療・研究補助部門へ進み、命を救う知識を磨く", {}, [1, "研修と担当範囲を確認して、医療・研究補助職へ移った。", {"job":$terraData.SR_JOBS.research,"k":2,"m":1,"lifeAffiliation":{"id":"rhodes-staff","role":"本艦・医療研究補助職員","action":"role"}}]),
      $terraData.K("設備・エンジニア部門へ進み、ロドスの装備と巨艦を支える", {}, [1, "整備班の研修を受け、設備整備職員として担当を始めた。", {"job":$terraData.SR_JOBS.maintenance,"k":2,"lifeAffiliation":{"id":"rhodes-staff","role":"本艦・設備整備職員","action":"role"}}]),
      $terraData.K("このまま行動予備隊での訓練を続ける", {}, [1, "小隊の仲間たちと離れることを惜しみ、今の部隊でさらに腕を磨くことにした。", {"m":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_promo_elite_operator_candidate",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.1,
    once: true,
    ge: { age: 25 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.field && s.k >= 65 && (s.age || 0) >= 25,
    t: "現場での経験を踏まえて、特別作戦班の候補者として選考を受けないかと声がかかった。候補への登録は任務配属の決定ではない。",
    c: [
      $terraData.K("候補者として選考を受け、現在の任務を続けながら適性を確かめる", {}, [1, "選考への参加を申し込み、候補者として必要な訓練と適性確認を受けることになった。任務への配置は、別途の判断を待つ。", {"k":1,"lifeAffiliation":{"id":"rhodes-staff","action":"role","role":"本艦・外勤オペレーター／特別作戦班候補"},"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("現担当を続け、今回の選考は見送る", {}, [1, "選考は見送った。今の小隊で担っている仕事を続け、次の機会は改めて考えることにした。", {"m":1}])
    ]
  },
  {
    id: "sr_rhodes_promo_chief_transporter",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.1,
    once: true,
    ge: { age: 23 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.transporter && s.k >= 40 && (s.age || 0) >= 23,
    t: "長距離輸送の経験を踏まえ、運行計画をまとめる主任役を打診された。担当範囲と承認者を確認してから、引き受けるか決める。",
    c: [
      $terraData.K("期間と担当範囲を確認して、運行計画の主任役を引き受ける", {}, [1, "担当する輸送計画と連絡経路を確認し、主任役を引き受けた。判断が必要な案件は、責任者へ引き継ぐ手順も決めた。", {"k":1,"lifeAffiliation":{"id":"rhodes-staff","action":"role","role":"本艦・トランスポーター主任"},"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("現場輸送を続け、計画の決裁は担当者へ戻す", {}, [1, "昇格の打診は保留し、輸送と引継ぎを確実に行う今の役割を続けた。", {"m":1}])
    ]
  },
  {
    id: "sr_rhodes_promo_medical_lead_assistant",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.1,
    once: true,
    ge: { age: 24 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.research && s.k >= 45 && (s.age || 0) >= 24,
    t: "医療・研究補助の経験を踏まえ、記録確認をまとめる役割を打診された。臨床判断や治験計画の決裁権を含む役ではない。",
    c: [
      $terraData.K("責任者の監督下で、記録確認のまとめ役を引き受ける", {}, [1, "記録の確認と引継ぎをまとめる役割を引き受けた。診療方針と治験計画の決定は医師や研究責任者へ確認する。", {"k":1,"lifeAffiliation":{"id":"rhodes-staff","action":"role","role":"本艦・医療研究記録担当主任"},"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("現在の補助業務を続け、まとめ役は見送る", {}, [1, "今の補助業務を続けると伝え、昇格の打診は見送った。", {"m":1}])
    ]
  },
  {
    id: "sr_rhodes_promo_engineering_foreman",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.1,
    once: true,
    ge: { age: 24 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.maintenance && s.k >= 40 && (s.age || 0) >= 24,
    t: "設備整備の経験を踏まえ、点検と作業引継ぎをまとめる班長役を打診された。安全審査と予算の決裁は担当責任者に残る。",
    c: [
      $terraData.K("点検計画と引継ぎをまとめる班長役を引き受ける", {}, [1, "班の点検計画と引継ぎをまとめる役を引き受けた。修理の安全確認と予算承認は、担当責任者へ回すことにした。", {"k":1,"lifeAffiliation":{"id":"rhodes-staff","action":"role","role":"本艦・設備整備班長"},"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("現在の整備担当を続け、班長役は見送る", {}, [1, "昇格の打診は見送り、現在の設備整備を続けた。", {"m":1}])
    ]
  },
  {
    id: "sr_rhodes_promo_logistics_coordinator",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.1,
    once: true,
    ge: { age: 24 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.service && s.k >= 40 && (s.age || 0) >= 24,
    t: "物資・生活支援の経験を踏まえ、配給記録と部門間の引継ぎをまとめる役割を打診された。人員や予算の決裁は、引き続き責任者が担う。",
    c: [
      $terraData.K("物資の記録と部門間の引継ぎをまとめる役を引き受ける", {}, [1, "配給状況と作業の引継ぎをまとめる役を引き受けた。人員配置や予算の判断は責任者へ確認する。", {"k":1,"lifeAffiliation":{"id":"rhodes-staff","action":"role","role":"本艦・後方支援調整主任"},"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("今の生活支援業務を続け、調整役は見送る", {}, [1, "調整役は見送り、生活支援の担当を続けることにした。", {"m":1}])
    ]
  },
  {
    id: "sr_rhodes_transfer_field_to_rear_injury",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.1,
    once: true,
    ge: { age: 20 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.job === $terraData.SR_JOBS.field && s.h <= 45 && (s.age || 0) >= 20,
    t: "定期健康診断の結果、蓄積した古傷と鉱石病の数値から、これ以上の前線勤務や長距離の荒野走行は命に関わると医療部からドクターストップがかかった。人事部から艦内の後方部門への配置転換を打診された。",
    c: [
      $terraData.K("前線の経験を活かせる設備整備部門へ移り、仲間の装備を支える", {}, [1, "現場で使う装備の扱いを知る経験を活かし、設備整備の担当へ移った。修理の優先順位や安全確認は責任者と相談し、勤務量も調整した。", {"job":$terraData.SR_JOBS.maintenance,"h":2,"m":1,"fl":{"reduced_work":true},"lifeAffiliation":{"id":"rhodes-staff","role":"本艦・設備整備職員（元外勤）","action":"role"}}]),
      $terraData.K("物資・生活支援部門へ移り、帰還する隊員を迎える仕事に就く", {}, [1, "物資と生活支援の担当へ移り、帰艦した隊員の受け入れや必要な備品の手配を手伝った。引継ぎ先と勤務量を確認し、無理のない範囲から仕事を始めた。", {"job":$terraData.SR_JOBS.service,"h":2,"m":1,"fl":{"reduced_work":true},"lifeAffiliation":{"id":"rhodes-staff","role":"本艦・生活支援職員（元外勤）","action":"role"}}])
    ]
  },
  {
    id: "sr_rhodes_crisis_1096_chernobog_triage",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 99,
    w: 0.06,
    once: true,
    ge: { year: 1096, age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.year >= 1096 && s.year <= 1097 && !!s.world?.events?.chernobog_incident && (s.age || 0) >= 16,
    t: "1096年末、チェルノボーグ事変と天災の渦中から脱出してきた中枢救出部隊と多数の負傷者が本艦へ雪崩れ込んできた。甲板から医療区画の廊下まで担架で埋め尽くされ、煤と血の匂いが充満するなか、総員配置の非常招集がかかった。",
    c: [
      $terraData.K("不眠不休で重症者のトリアージと手術室の洗浄・物資搬送に奔走する", {}, [1, "帰還できなくなった仲間たちの空席に唇を噛み締めながら、目の前の命を一つでも多く繋ぎ止めるために夜明けまで走り続けた。", {"h":-3,"m":1,"k":2,"groupStanding":{"id":"rhodes-colleagues","delta":2},"regionalImpact":{"id":"catastrophe-relief","delta":2}}]),
      $terraData.K("パニックに陥る避難民や負傷した予備隊員たちの誘導・メンタルケアにあたる", {}, [1, "落ち着き払ったあなたの声かけによって医療区画の混乱が収まり、処置の優先順位が守られたことで多くの命が救われた。", {"h":-1,"m":2,"lifeSkill":{"id":"care-aid","level":1},"groupStanding":{"id":"rhodes-colleagues","delta":2}}])
    ]
  },
  {
    id: "sr_rhodes_crisis_1097_lungmen_slum_aid",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 99,
    w: 0.06,
    once: true,
    ge: { year: 1097, age: 16 },
    show: s => onRhodes(s) && s.year === 1097 && s.res?.n === "龍門" && (s.age || 0) >= 16,
    t: "1097年、龍門の一角で感染者への確認が強化され、ロドスの臨時救護所にも治安担当者から照会が入った。外では不安を感じた患者や家族が、診療を続けられるか尋ねている。現地担当者へ状況を伝え、どう応対するか決めることになった。",
    c: [
      $terraData.K("診療所の安全を保ち、照会は責任者と法務担当へ引き継ぐ", {}, [1, "診療の邪魔にならない場所で患者を待たせ、照会内容を現地責任者へ伝えた。個人情報を渡すかどうかは確認を待ち、その間も必要な診療を続けられるよう支援した。", {"m":1,"k":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("患者に分かる範囲を説明し、希望する人を別の支援先へ案内する", {}, [1, "確認が続いていることを患者へ説明し、移動を希望する人には連絡先と移送の相談先を伝えた。診療記録や個人情報は責任者の確認なしに渡さず、支援先への引継ぎを依頼した。", {"m":1,"regionalImpact":{"id":"infected-rights","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_crisis_1098_londinium_periphery",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.06,
    once: true,
    ge: { year: 1098, age: 18 },
    show: s => onRhodes(s) && s.year === 1098 && s.res?.n === "ヴィクトリア" && s.local?.city === "ロンディニウム" && !!s.world?.events?.londinium_war && (s.age || 0) >= 18,
    t: "1098年、軍事委員会に占拠されたヴィクトリアの首都ロンディニウム周辺で戦火が拡大し、ロドスも極めて危険な後方支援と難民救護に巻き込まれた。都市防衛副砲の轟音が遠くの地平線を揺らすなか、通信中継と医療物資の維持にあたった。",
    fx: {}
  },
  {
    id: "sr_rhodes_crisis_1101_prts_anomaly",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 99,
    w: 0.06,
    once: true,
    ge: { year: 1101, age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.year >= 1101 && (s.age || 0) >= 16,
    t: "旧本艦の制御区画で、運行記録にない信号と表示の乱れが見つかった。原因を断定できないまま、運用班は区画を閉じ、職員とオペレーターへ退避手順を知らせた。あなたも担当区域で、確認できた範囲の作業に加わった。",
    c: [
      $terraData.K("医療部に残された重症患者と臨床データのサーバーを抱え、侵食される隔壁の間を縫って脱出艇へ走る", {}, [1, "背後で慣れ親しんだ廊下が結晶に呑み込まれていく音を聞きながら、仲間と肩を支え合って最後のハッチから荒野へと脱出した。", {"h":-3,"m":2,"k":2,"groupStanding":{"id":"rhodes-colleagues","delta":3},"regionalImpact":{"id":"catastrophe-relief","delta":2}}]),
      $terraData.K("エンジニア部・予備隊と協力し、手動ハッチをこじ開けて後続の非戦闘員たちの退避路を死守する", {}, [1, "暴走する自動防衛機構の火花を浴びながらも、担当区画のスタッフ全員を無事に外へ送り出し、最後に自分もタラップを飛び降りた。", {"h":-4,"m":3,"lifeSkill":{"id":"quiet-resolve","level":2},"groupStanding":{"id":"rhodes-colleagues","delta":3}}])
    ]
  },
  {
    id: "sr_rhodes_crisis_1101_new_ship_reconstruction",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 99,
    w: 0.06,
    once: true,
    ge: { year: 1101, age: 16 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && s.year >= 1101 && (s.age || 0) >= 16,
    after: { id: "sr_rhodes_crisis_1101_prts_anomaly", min: 1 },
    t: "退避の後、職員たちは使える設備と備品を新しい作業区画へ移し始めた。あなたも担当する医療器具や記録を確かめ、運用を再開するために必要なものを整理した。旧区画で起きたことの原因はまだ分からないが、次の持ち場を整えていく。",
    fx: {"groupStanding":{"id":"rhodes-colleagues","delta":1}}
  },
  {
    id: "sr_rhodes_crisis_quarantine_breach",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.06,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && (s.age || 0) >= 18,
    t: "検査室で活性サンプルの容器が破損し、区画の警報が鳴った。原因や曝露範囲を決めつけず、現場のスタッフは入退室を止めて責任者へ報告した。専門の対応班が到着するまで、指示された範囲で区画の安全確認と記録を進めることになった。",
    c: [
      $terraData.K("出入口を管理し、サンプル記録と目撃情報を担当者へ引き継ぐ", {}, [1, "出入口に人が入らないよう案内し、破損時の状況と容器番号を担当者へ伝えた。換気や除染は専門班の指示を待ち、見聞きした事実だけを記録した。", {"k":2,"m":1}]),
      $terraData.K("担当者の指示を受け、隣接区画の職員へ退避手順を知らせる", {}, [1, "指示された範囲で隣接区画の職員を退避させ、点呼と移動先を記録した。自分も安全区域へ移り、曝露の有無は医療担当者に確認することになった。", {"h":-1,"k":1}])
    ]
  },
  {
    id: "sr_rhodes_crisis_convoy_raiders",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.06,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && ["field", "transporter", "reserve"].some(key => s.job === $terraData.SR_JOBS[key]) && (s.age || 0) >= 18,
    t: "高価な源石抑制剤を狙う荒野の武装強盗団が、ロドスのマークを掲げた医療輸送車を包囲した。相手の中にも末期の鉱石病で目が血走った感染者が混じっている。",
    c: [
      $terraData.K("威嚇射撃と閃光弾で指揮系統だけを麻痺させ、負傷した敵に最低限の応急薬を残して突破する", {}, [1, "不必要な殺傷を避けつつ輸送車を守り切る、ロドスらしい戦術で包囲網を抜け出した。", {"h":-2,"k":2,"m":2,"groupStanding":{"id":"rhodes-colleagues","delta":2}}]),
      $terraData.K("装甲車のスモークを展開して全速力で強行突破し、積み荷の100%保全を最優先する", {}, [1, "車体に数発の銃弾を受けながらも、待っている患者たちのための医薬品を無傷で支部へ届けきった。", {"h":-1,"k":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_crisis_branch_arson_threat",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.06,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "地域支部") && (s.age || 0) >= 18,
    t: "地域支部の近くで感染者をめぐる緊張が高まり、抗議する人たちが建物の前に集まった。声が荒くなり、物を投げる人もいたため、支部の職員は来訪者を奥へ案内し、治安担当者へ連絡した。場を落ち着かせるため、あなたも対応を手伝う。",
    c: [
      $terraData.K("来訪者と職員を安全な場所へ移し、責任者の指示を待つ", {}, [1, "支部の入口から人を離し、患者と職員を奥の安全な区画へ案内した。責任者が状況を確認する間、あなたは目撃した事実と破損箇所を記録した。", {"k":1,"m":1,"groupStanding":{"id":"rhodes-colleagues","delta":1}}]),
      $terraData.K("現地の支援先へ連絡し、希望する患者の移動を手伝う", {}, [1, "近隣の支援先へ連絡し、移動を希望する患者の人数と必要な配慮を確認した。個人情報は本人の同意を得た範囲で引き継ぎ、支部の担当者へ戻って報告した。", {"m":1,"regionalImpact":{"id":"infected-rights","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_rare_rooftop_commander_conversation",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.015,
    once: true,
    ge: { age: 22 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && ($terraData.groupStandingLevel?.(s, "rhodes-colleagues") || 0) >= 3 && (s.age || 0) >= 22,
    t: "深夜の当直明け、展望甲板で風に当たっていると、作戦指揮を担う人物と運営に関わる人物が短い打ち合わせを終えたところだった。あなたの現場報告が引継ぎに役立ったと礼を述べ、温かい飲み物を一つ分けてくれた。",
    fx: {}
  },
  {
    id: "sr_rhodes_injury_acute_oripathy_flare",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.02,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && !!s.inf && s.h <= 40 && (s.age || 0) >= 18,
    t: "源石粉塵が残る現場で作業中、防護具の異常に気づいて退避した。医療担当に診てもらい、必要な検査を受けてしばらく勤務を調整した。作業時の状況は安全担当へ報告し、後遺症の有無は経過を見て確認することになった。",
    fx: {"h":-2,"m":-1}
  },
  {
    id: "sr_rhodes_injury_combat_shield_shatter",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["少年","青年","壮年","老年"],
    cd: 99,
    w: 0.02,
    once: true,
    ge: { age: 17 },
    show: s => onRhodes(s) && ["field", "reserve"].some(key => s.job === $terraData.SR_JOBS[key]) && s.h <= 45 && (s.age || 0) >= 17,
    t: "撤退中、飛来物が盾に当たり、近くにいた仲間をかばったあなたは転倒して負傷した。医療部で手当てを受け、しばらくは現場勤務を休むことになった。作戦に参加していた仲間が、交代で様子を見に来た。",
    fx: {"h":-3,"m":1}
  },
  {
    id: "sr_rhodes_death_field_operation",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.003,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && s.job === $terraData.SR_JOBS.field && s.h <= 18 && (s.age || 0) >= 18,
    t: "包囲された感染者避難民の脱出ルートを確保するため、崩れ落ちる廃工場の通路で単独で敵重装部隊の足止めを引き受けた。最後の避難民が輸送艇に乗り込んだという通信を聞き届けた直後、砲撃によって天井が崩落し、握りしめていたロドスの認識票は瓦礫の底へと消えた。",
    fx: {"groupStanding":{"id":"rhodes-colleagues","delta":3},"regionalImpact":{"id":"catastrophe-relief","delta":2},"d":["殉職（ロドス外勤作戦）","ロドス外勤作戦の撤退戦において、避難民と小隊の脱出路を最期まで守り抜いて殉職した"]}
  },
  {
    id: "sr_rhodes_death_catastrophe_transport",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.003,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && s.job === $terraData.SR_JOBS.transporter && s.h <= 18 && (s.age || 0) >= 18,
    t: "天災によって孤立した山間部の診療所へ緊急の源石抑制剤を届けるため、予測よりも早く発達した源石嵐の暴風圏へと輸送車を走らせた。診療所の灯りが見える最後の橋で車体が地滑りに呑まれる瞬間、あなたは防水ケースに入れた医薬品と観測データだけを対岸のスタッフへと投げ渡し、濁流の中へと消えていった。",
    fx: {"groupStanding":{"id":"rhodes-colleagues","delta":3},"regionalImpact":{"id":"catastrophe-relief","delta":3},"d":["殉職（天災観測・救護輸送）","天災下の孤立診療所へ抑制剤と観測データを届ける途中、源石嵐による地滑りに呑まれて殉職した"]}
  },
  {
    id: "sr_rhodes_death_engineering_lab_accident",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.003,
    once: true,
    ge: { age: 18 },
    show: s => onRhodes(s) && ["maintenance", "research"].some(key => s.job === $terraData.SR_JOBS[key]) && s.h <= 15 && (s.age || 0) >= 18,
    t: "高出力の源石ボイラーと活性結晶試験装置の緊急冷却弁が同時に固着し、このままでは隣接する居住区画まで爆発が及ぶ危機に直面した。あなたは若い助手たちを隔壁の外へ押し出し、内側から手動ロックを下ろして最後まで圧力弁を回し続け、区画全体の誘爆を防いで命を落とした。",
    fx: {"groupStanding":{"id":"rhodes-colleagues","delta":3},"d":["事故死（ロドス艦内研究・機関事故）","ロドス艦内の源石機関・試験区画の暴走事故において、居住区への誘爆を防ぐため隔壁を内側から閉鎖して殉職した"]}
  },
  {
    id: "sr_rhodes_death_medical_ward_hospice",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.003,
    once: true,
    ge: { age: 20 },
    show: s => onRhodes(s) && !!s.inf && !!s.fl?.tx && s.rl >= 85 && s.h <= 20 && (s.age || 0) >= 20,
    t: "長年にわたりロドスの仲間たちと共に歩み、治療を続けてきたあなたの鉱石病も、ついに現代の医療技術では抑えきれない終末期を迎えた。療養庭園から運ばれた白い花が飾られた医療部の個室で、かつて共に働いた同僚や主治医たちに手を握られ、苦痛のない穏やかな鎮静処置のなかで静かに眠りについた。",
    fx: {"m":3,"groupStanding":{"id":"rhodes-colleagues","delta":2},"d":["病死（ロドス医療部での看取り）","ロドス医療部の病室にて、かつての同僚と主治医たちに温かく見守られながら穏やかに息を引き取った"]}
  },
  {
    id: "sr_rhodes_retire_honorable_discharge",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.12,
    once: true,
    ge: { age: 38 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && ((s.age || 0) >= 45 || s.h <= 35) && (s.age || 0) >= 38,
    t: "長く担当した仕事を振り返り、勤務の区切りを相談する時期が来た。退職して継続療養の窓口を残すか、負担を調整して艦内の仕事を続けるか、人事と医療部に条件を確かめた。",
    c: [
      $terraData.K("雇用条件を確認して退職し、療養相談の連絡先を残す", {}, [1, "退職日と引継ぎを人事と確認し、ロドスでの勤務を終えた。必要なときに療養相談を申し込める連絡先を受け取り、新しい生活へ移った。", {"job":0,"m":2,"fl":{"retired":true,"rhodes_landship":false},"lifeAffiliation":[{"id":"rhodes-staff","action":"leave"},{"id":"rhodes-care","title":"ロドスへの療養相談","kind":"care-contact","role":"退職後の継続相談","action":"join"}]}]),
      $terraData.K("勤務量を調整し、艦内の後輩を支える仕事を続ける", {}, [1, "勤務時間と引継ぎ先を相談し、担当範囲を調整して艦内に残った。", {"m":1,"k":1,"fl":{"reduced_work":true},"groupStanding":{"id":"rhodes-colleagues","delta":1}}])
    ]
  },
  {
    id: "sr_rhodes_retire_open_local_clinic",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.1,
    once: true,
    ge: { age: 30 },
    show: s => onRhodes(s) && $terraData.srRhodesPost(s, "本艦") && ["service", "research"].some(key => s.job === $terraData.SR_JOBS[key]) && s.k >= 45 && (s.age || 0) >= 30,
    t: "地域の診療所を支えるため、これまでの知識を活かして独立する案を考えた。開業資金や継続できる仕事はまだ決まっていない。ロドスを退職して準備を始めるか、勤務を続けて計画を見直すか選ぶ。",
    c: [
      $terraData.K("雇用契約を終え、地域の互助組織と連携して診療所の準備を始める", {}, [1, "人事へ退職を申し出て、引継ぎを終えた。地域の互助組織に運営協力者として加わり、開業場所と必要な物資を地元の人たちと相談し始めた。", {"job":0,"m":1,"k":1,"fl":{"rhodes_landship":false,"retired":0,"reduced_work":1},"lifeAffiliation":[{"id":"rhodes-staff","action":"leave","note":"地域診療所の準備に移るため退職"},{"id":"local-mutual-aid","role":"地域診療所・運営協力者","action":"join","note":"地域住民と診療所の準備を始めた"}]}]),
      $terraData.K("勤務を続け、費用と研修先を確かめてから計画を考え直す", {}, [1, "独立の時期は保留し、必要な研修や費用を調べることにした。雇用条件を確認して、現在の担当業務を続けた。", {"k":1,"m":1}])
    ]
  },
  {
    id: "sr_rhodes_legacy_former_cadet_visit",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.08,
    once: true,
    ge: { age: 32 },
    show: s => !onRhodes(s) && hasRhodesHistory(s) && (s.age || 0) >= 32,
    t: "ロドスを離れて数年が経ったある日、かつてあなたが行動予備隊や現場で世話を焼いた新米隊員が、立派な正規オペレーターの制服姿であなたの住まいを訪ねてきた。「あの時あなたが教えてくれた基本のおかげで、今も小隊のみんなと生きて帰れています」と誇らしげに敬礼された。",
    fx: {}
  },
  {
    id: "sr_rhodes_legacy_messenger_package",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.08,
    once: true,
    ge: { age: 35 },
    show: s => !onRhodes(s) && hasRhodesHistory(s) && (s.age || 0) >= 35,
    t: "トランスポーターの定期便があなたの街を通りかかり、ロドス本艦の療養庭園で収穫されたハーブティーの缶と、今も現役で働く同期たちからの寄せ書きが届いた。離れていても、あの鋼鉄のクジラの上に自分の居場所が確かにあったのだと胸が温かくなった。",
    fx: {}
  },
  {
    id: "sr_rhodes_legacy_emergency_shelter_help",
    conf: "S",
    references: $terraData.SR_SRC,
    st: ["青年","壮年","老年"],
    cd: 99,
    w: 0.08,
    once: true,
    ge: { age: 30 },
    show: s => !onRhodes(s) && hasRhodesHistory(s) && (s.age || 0) >= 30,
    t: "暮らしている街の近くに小型の天災が接近し、住民たちがパニックに陥った。あなたはかつてロドスで身につけた源石粉塵の防護手順と避難誘導のノウハウを活かして即座に公民館の目張りを指揮し、直後に到着したロドス地域支部の救援隊へと見事に引き継いだ。",
    fx: {}
  },
  ];
  $terraData.EV.push(...events);
});
