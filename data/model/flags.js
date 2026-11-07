// model/flags: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("model/flags", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "FLAG_REGISTRY",
    {
      ursus_student_assembly_contacted: {
        label: "首都の学生連合から会合案内を受けた",
        description: "サンクト・グリファーブルクの学生連合と連絡した状態。正式加入を意味しない。",
        engine: "学生連合会合の適格性"
      },
      ursus_student_assembly_active: {
        label: "首都の学生連合で活動中",
        description:
          "学生連合で本人が選んだ役割を継続している状態。ウルサス学生自治団の正式な構成員を意味しない。",
        engine: "拘束後・後年の学生連合イベント"
      },
      ursus_katorga_detained: {
        label: "抗議後にカトルガ区画へ移送された",
        description:
          "抗議の後、本人がカトルガ区画で拘束・封鎖を経験しているゲーム上の状態。全逮捕者の共通経路や法的処分を示さない。",
        engine: "カトルガ区画の生活・解放イベント"
      },
      ursus_school_contact_ongoing: {
        label: "元同級生への便りを継続中",
        description:
          "チェルノボーグから避難した後も、本人が年一度の便りを続けると選んだ状態。全員の消息確認を意味しない。",
        engine: "ウルサス学生経路の後年イベント",
        tags: []
      },
      chernobog_resident_displaced: {
        label: "チェルノボーグ事変の際に居住地を離れた",
        description:
          "1096〜1097年の事件圧力期に、本人が居住地を離れる移動を選んだゲーム上の記録。移動先の安全や家族全員の同行は保証しない。",
        engine: "チェルノボーグ住民の後年経路",
        tags: ["チェルノボーグから避難した"]
      },
      chernobog_resident_stayed: {
        label: "チェルノボーグ事変の際に居住地へ残った",
        description:
          "事件圧力期に、その時点では別地域への移動を選ばなかった本人の判断。安全だったことや事件の直接被害がなかったことを意味しない。",
        engine: "チェルノボーグ住民の後年経路",
        tags: ["チェルノボーグに留まった"]
      },
      londinium_civilian_route: {
        label: "ロンディニウム戦争期の地域生活を経験した",
        description:
          "戦争期のロンディニウムで本人が選んだ仕事・支援・距離の取り方を後年に再確認するための記録。市民全体の経験を代表しない。",
        engine: "ロンディニウム住民の後年経路",
        tags: ["ロンディニウム戦争期の生活を経験"]
      },
      arena: { label: "地下闘技場", description: "地下闘技場で活動した経験。", engine: "経歴表示" },
      arts_gifted: {
        label: "アーツの才",
        description: "旧適性経路で記録されたアーツ評価。現在の技能・資格・勤務能力を示さない。",
        engine: "旧セーブの経歴表示",
        status: "retired",
        retirementSource: "旧適性経路の保存済み履歴のみ。現行ゲームでは新規生成しない。",
        retirementReason: "旧来の適性値による経路を廃止し、学習・実技・資格の個別記録へ置換。"
      },
      teacher_attempted: {
        label: "教職への誘いに返答した",
        description: "地域の学び舎からの教職の誘いに返答した。再提示を抑える。",
        engine: "イベント再発制御"
      },
      arts_grad: {
        label: "アーツ学院修了",
        description: "アーツ教育機関を修了した経験。",
        engine: "経歴表示"
      },
      arts_enrolled: {
        label: "アーツ課程在籍中",
        description: "アーツ課程で学んでいる状態。授業料の継続や修了は別に記録する。",
        engine: "教育・年次学費・修了経路",
        tags: []
      },
      conscripted: {
        label: "徴用",
        description: "労働または軍務へ徴用された状態・経験。",
        engine: "経歴表示"
      },
      military_contract: {
        label: "軍需の勤務契約",
        description: "軍の管理下の工場に勤務契約を結んだ経験。強制徴用とは区別する。",
        engine: "軍需求人の再発制御"
      },
      criminal_yakuza: {
        label: "裏社会との関係",
        description: "犯罪組織・裏社会と関係を持った経験。",
        engine: "他殺リスク"
      },
      kazdel_left: {
        label: "カズデル内戦中の国外脱出",
        description: "内戦中に運賃と移動先を確保し、カズデルを離れた経験。",
        engine: "経歴表示"
      },
      kazdel_stayed: {
        label: "カズデル内戦後も故郷に残った",
        description: "内戦中に国外脱出を選ばず、故郷に残ったため後年の離散・再定住の判断が残っている。",
        engine: "カズデル内戦後の生活選択"
      },
      kazdel_displaced: {
        label: "カズデル内戦による住まいの喪失",
        description:
          "内戦とカズデルの再度の滅亡を受け、元の住まいを離れて暮らしを組み直しているゲーム上の状態。",
        engine: "経歴・後続の生活イベント",
        tags: ["戦乱避難中"]
      },
      kazdel_displaced_life: {
        label: "カズデル内戦後の暮らしの再建",
        description:
          "内戦・滅亡の際に故郷を離れた、または仮住まいへ移った経験。国外脱出と国内避難を区別し、出身地や居住地を変更せず、後年イベントの条件に使う。",
        engine: "カズデル避難後の長期生活イベント",
        tags: ["戦乱避難歴"]
      },
      debt_yakuza: {
        label: "闇金融の負債",
        description:
          "闇金融に関わる債務が残る間、取立てや関連する困窮・暴力リスクへつながる状態。全債務返済後は解除する。",
        engine: "負債完済時の解除・困窮死判定・取立てイベント"
      },
      discrimination_complaint: {
        label: "差別への申し立て",
        description: "種族・感染状態を理由とする扱いに異議を申し立てた経験。",
        engine: "差別イベントの後日談"
      },
      bias_family_model: {
        label: "家庭で感染者への偏見に触れた",
        description: "養育環境で感染者に関する決めつけを聞き、子ども時代に応答した記録。",
        engine: "感染者への個人態度"
      },
      bias_family_support: {
        label: "家族が感染者への決めつけに異を唱えた",
        description:
          "感染者との家族内の接点がある中で、近しい人が感染者への決めつけに異を唱えた言葉を聞いた記録。本人の偏見値が変わったことや家族全員の意見一致は意味しない。",
        engine: "感染者への個人態度・経験履歴"
      },
      minos_hero_stigma: {
        label: "英雄像を通じて感染者への噂に触れた",
        description:
          "ミノスの作中事例を手がかりに、感染者が英雄としての資質を失うという噂を家族の診療経験の中で聞いた記録。住民全体の意見や制度を示さない。",
        engine: "感染者への個人態度・経験履歴"
      },
      bias_family_sarkaz_model: {
        label: "家庭でサルカズへの偏見に触れた",
        description: "養育環境でサルカズに関する決めつけを聞き、子ども時代に応答した記録。",
        engine: "サルカズへの個人態度"
      },
      bias_peer_mockery: {
        label: "同級生の侮辱に加わった",
        description: "仲間外れを避けるため感染者への侮辱に同調した経験。",
        engine: "感染者への個人態度"
      },
      bias_teacher_lesson: {
        label: "授業で偏見を教えられた",
        description: "根拠のない感染者への噂を、教師から事実のように伝えられた経験。",
        engine: "感染者への個人態度"
      },
      reduced_work: {
        label: "勤務を減らした",
        description: "完全には退職せず、働く時間と収入を落として就業を続けている状態。",
        engine: "年収計算"
      },
      household_separated: {
        label: "家計を分けた",
        description: "養育家計との口座・収支を分けた経験。実家からの転居や家族との断絶を意味しない。",
        engine: "家計・養育記録"
      },
      discrimination_followup: {
        label: "差別申し立ての後日談",
        description: "申し立て後の職場・地域での帰結を経験した記録。",
        engine: "差別イベントの再発制御"
      },
      discrimination_silenced: {
        label: "差別を黙って耐えた経験",
        description: "不利益を恐れて、差別的な扱いへの抗議を控えた経験。",
        engine: "差別イベントの再出現文面"
      },
      housing_exclusion: {
        label: "住居条件で不利益を受けた経験",
        description:
          "鉱石病や種族などを理由に住居条件で不利益を受けた個別経験。特定の国の共通制度や退去の確定を意味しない。転居先や後日の生活描写に反映する。",
        engine: "住居・近隣イベントの記憶"
      },
      neighbor_contact: {
        label: "隣人とのつながり",
        description: "引っ越してきた隣人と挨拶や助け合いを始め、後日の関係判断が残っている状態。",
        engine: "隣人の後日談"
      },
      neighbor_welcome: {
        label: "隣人を食事でもてなした",
        description: "新しい隣人を食事でもてなし、後日の文面に反映する一時記録。",
        engine: "隣人の後日談"
      },
      neighbor_familiar: {
        label: "顔なじみの隣人",
        description: "現在の居住先で挨拶や手助けを重ねた相手がいる。転居時に解除する。",
        engine: "近所との日常・転居"
      },
      detained: {
        label: "拘束",
        description: "当局などに拘束され、外の仕事や移動を中断している状態。",
        engine: "収容中のイベント・家計・就労制約",
        tags: ["収容中"]
      },
      custody_contact: {
        label: "収容先からの連絡",
        description: "外の相談先に所在を知らせ、審査を求める手がかりを得た状態。再収容時に取り直す。",
        engine: "収容中の審査相談"
      },
      dg: {
        label: "感染診断済み",
        description: "鉱石病の診断を受けた状態。",
        engine: "感染UI・治療・差別判定"
      },
      exiled: {
        label: "追放",
        description:
          "居住地から追放された経験。追放元を記録し、域外にいる場合だけ亡命の状況タグを使う。帰還の合法性を示す記録ではない。",
        engine: "経歴表示・追放元と現在地の照合",
        tags: ["亡命"]
      },
      family: {
        label: "組織的家族関係",
        description: "ファミリー等の組織的な家族関係を持つ。",
        engine: "状況タグ",
        tags: ["ファミリー"]
      },
      siracusa_feud: {
        label: "シラクーザの抗争に巻き込まれた経験",
        description:
          "抗争に関わる緊張や暴力に遭遇した経験。犯罪被害のトラウマと共に記録された場合に限り、後年の報復による他殺文面を候補にする。",
        engine: "後年の他殺文脈"
      },
      guard: { label: "警備職経験", description: "近衛局などの治安組織で働いた経験。", engine: "経歴表示" },
      gun: { label: "銃の訓練", description: "銃器の訓練を受けた経験。", engine: "経歴表示" },
      hid: {
        label: "感染の隠蔽",
        description: "感染を周囲に隠している状態。",
        engine: "差別・治療・状況タグ"
      },
      hid_helper: { label: "感染者の支援", description: "感染者を匿う・支援した経験。", engine: "経歴表示" },
      informant: { label: "密告者", description: "当局などへ情報提供した経験。", engine: "他殺リスク" },
      insured: {
        label: "保険加入",
        description:
          "クルビアで医療保険を維持し、鉱石病治療費の自己負担を減らす状態。毎年の保険料を払えない場合、または国外移住で失効する。",
        engine: "年次保険料・治療費・医療選択"
      },
      knight: { label: "騎士競技経験", description: "騎士競技への出場経験。", engine: "経歴表示" },
      marked: {
        label: "監視対象",
        description: "当局などから監視対象として記録された状態。",
        engine: "経歴表示"
      },
      noble_patron: { label: "貴族の後援", description: "貴族の後援を得た経験。", engine: "経歴表示" },
      investment_portfolio: {
        label: "地域事業へ出資中",
        description: "本人の現金とは別に、地域の共同事業・小規模事業の持分を保有している状態。",
        engine: "年次評価・売却選択",
        tags: ["投資保有中"]
      },
      iberia_telescope_repaired: {
        label: "イベリアの古い望遠鏡を修理して保管中",
        description: "本人が発見した古い望遠鏡を専門の修理工へ持ち込み、使用できる状態で手元に残している。",
        engine: "望遠鏡の後日談"
      },
      iberia_telescope_inspected: {
        label: "イベリアの古い望遠鏡を点検した",
        description: "発見した古い望遠鏡を修理工へ持ち込んだが、その時点では修理できなかった経験。",
        engine: "経歴表示"
      },
      iberia_telescope_sold: {
        label: "イベリアの古い望遠鏡を売却した",
        description: "発見または修理した古い望遠鏡を古物商へ売却した経験。",
        engine: "望遠鏡の後日談"
      },
      iberia_telescope_scrapped: {
        label: "イベリアの古い望遠鏡を回収業者へ渡した",
        description: "発見した古い望遠鏡を修理せず、金属部品として回収業者へ渡した経験。",
        engine: "経歴表示"
      },
      friend_unpaid: {
        label: "旧友からの未返済",
        description: "旧友への貸付が返済されず、返済を求める・免除する判断が残っている状態。",
        engine: "旧友への貸付後日談"
      },
      friend_cut_off: {
        label: "旧友との連絡を断つ",
        description: "金銭をめぐる関係に区切りをつけ、旧友との連絡を断った経験。",
        engine: "後年の旧友イベント文面"
      },
      frontier_contract: {
        label: "開拓地での勤務経験",
        description: "クルビア国内の開拓契約を結んで転居した経験。再度の初回勧誘を止める。",
        engine: "開拓地勧誘の再発制御"
      },
      parent_infected: {
        label: "親の感染を知る",
        description: "親の感染に関わる出来事を経験した記録。",
        engine: "状況タグ"
      },
      family_clinic_familiarity: {
        label: "家族の通院手順を覚えた",
        description:
          "感染した親に付き添い、受付や診療日の確かめ方を経験した記録。医療資格、診断知識、受診成功を意味しない。",
        engine: "感染者に道案内する判断の選択肢"
      },
      lungmen_clinic_route: {
        label: "龍門の地区で診療日の道順を確かめた",
        description:
          "龍門の地区互助の場で、ある人と診療所への道順・次の診療日を一緒に確かめた経験。施設の受入れ、診察、制度上の権利を意味しない。",
        engine: "感染者に地区で確かめた道順を伝える選択肢"
      },
      bias_inf_formed: {
        label: "感染者への態度が幼少期に形作られた",
        description:
          "幼少期に感染者をめぐる言葉や出来事から、本人の長期的な態度が形成された経験。制度差別とは独立。",
        engine: "個人態度の履歴"
      },
      bias_sar_formed: {
        label: "サルカズへの態度が幼少期に形作られた",
        description:
          "幼少期にサルカズをめぐる言葉や出来事から、本人の長期的な態度が形成された経験。種族属性や制度差別とは独立。",
        engine: "個人態度の履歴"
      },
      spouse_disclosure: {
        label: "配偶者が鉱石病を打ち明けた",
        description: "配偶者が隠していた鉱石病を本人へ開示した経験。",
        engine: "夫婦関係の記録"
      },
      infection_family_disclosed: {
        label: "鉱石病を家族へ打ち明けた",
        description:
          "本人が特定の家族へ診断を伝えた記録。v87より対象者はcloseKnowledgeの個人IDで管理する。旧セーブの対象不明フラグは個人へ割り当てない。",
        engine: "感染者の家族支援・隠蔽状態"
      },
      infection_work_disclosed: {
        label: "鉱石病を雇用先へ伝えた",
        description: "診断を雇用先へ伝え、職場の扱いが変わる可能性を受け入れた経験。",
        engine: "雇用差別・職業履歴"
      },
      infection_community_rumor: {
        label: "近隣で鉱石病の噂を聞いた",
        description:
          "近隣で鉱石病の人がいるという噂を本人が聞いた人生上の記録。噂が本人の診断を指すか、誰が誰から何を聞いたかは不明で、診断の確認・公的記録・職場への開示を意味しない。",
        engine: "地域の噂・住居差別文面・感染者への暴力リスク"
      },
      infection_community_rumor_current_area: {
        label: "現在の生活圏で鉱石病の噂が出ている",
        description:
          "現在の生活圏で鉱石病の人がいるという噂が話題になった個別記録。本人の診断を指すとは限らず、住居変更・転居で解除する。",
        engine: "生活圏内の噂イベントと受診時の周囲の反応"
      },
      infection_housing_rumor_current_home: {
        label: "現在の住居の管理人が鉱石病の噂を聞いた",
        description:
          "未確認の近隣噂を現在の住居の管理人が聞いたという個別記録。本人の診断を確認したことは意味せず、住居変更・転居で解除する。",
        engine: "近隣噂から住居圧力への同一居住地内の後続"
      },
      infection_family_recipient_father: {
        label: "父が本人の診断を知っている",
        description: "本人が父へ直接伝えた記録。",
        engine: "closeKnowledgeの父リンクと照合"
      },
      infection_family_recipient_mother: {
        label: "母が本人の診断を知っている",
        description: "本人が母へ直接伝えた記録。",
        engine: "closeKnowledgeの母リンクと照合"
      },
      infection_family_recipient_spouse: {
        label: "配偶者が本人の診断を知っている",
        description: "本人が同居配偶者へ直接伝えた記録。",
        engine: "closeKnowledgeの配偶者リンクと照合"
      },
      family_bias_acknowledged: {
        label: "家族の前で感染者への過去の偏見を認めた",
        description: "感染診断の開示とは別に、自分の過去の言動について家族の前で話した記録。",
        engine: "家族との対話"
      },
      sibling_born: {
        label: "本人の成長後にきょうだいが生まれた",
        description: "本人の幼少期に親から生まれたきょうだいを記録する。",
        engine: "家族表示・家計"
      },
      sibling_supported: {
        label: "きょうだいの養育を支えた",
        description: "きょうだいの出生後、世話や家事を引き受けた経験。",
        engine: "家族関係"
      },
      sibling_infection_discussed: {
        label: "感染したきょうだいと診断を話した",
        description:
          "感染したきょうだいの診療や開示範囲を家族で話し合った。感染経路は結晶接触として扱い、親からの伝染とはみなさない。",
        engine: "家族支援・再発制御"
      },
      sibling_exposure_seen: {
        label: "きょうだいの源石曝露を知った",
        description: "きょうだいが源石結晶片に接触した出来事を記録する。感染診断の成立とは区別する。",
        engine: "きょうだい曝露イベントの再発制御"
      },
      sibling_bereaved: {
        label: "きょうだいと死別した",
        description: "きょうだいの死亡を知り、葬送や遺された家族を支えた経験。",
        engine: "家族履歴・再発制御"
      },
      romance_started: {
        label: "日々のつながりから相手を知り始めた",
        description: "知り合った相手との関係を続ける選択をした。",
        engine: "恋愛進行"
      },
      romance_dating: {
        label: "相手と交際を始めた",
        description: "何度か会い、互いの生活や考えを知ろうとしている。",
        engine: "恋愛進行"
      },
      romance_committed: {
        label: "結婚を含む将来を話し合った",
        description: "交際相手と今後の生活を具体的に話した。",
        engine: "恋愛進行"
      },
      romance_cohabiting: {
        label: "婚姻せず交際相手と同居した",
        description: "交際相手と婚姻を結ばず同居を始めた経験。",
        engine: "家族・住居表示"
      },
      romance_ended: {
        label: "恋愛関係に区切りをつけた",
        description: "交際相手と別れた、または親しくなる関係を終えた。",
        engine: "恋愛履歴"
      },
      marriage_ended: {
        label: "婚姻関係が終わった",
        description: "離婚または死別により現在の婚姻関係が終わった記録。",
        engine: "家族履歴"
      },
      divorced: { label: "離婚した", description: "配偶者と婚姻関係を解消した経験。", engine: "家族履歴" },
      former_spouse_move_notice: {
        label: "離婚した相手の転居を知った",
        description: "離婚後の転居便りを受け、既知の居住地と子どもの生活先確認予定を更新した記録。",
        engine: "離婚後の家族連絡・費用推計",
        tags: ["離婚した相手の転居知らせ"]
      },
      spouse_death: {
        label: "配偶者と死別した",
        description: "配偶者の死を経験した記録。",
        engine: "家族履歴"
      },
      parent_dust_contact: {
        label: "感染した親の遺品・結晶化物を扱った",
        description: "死亡した感染者の親の遺品や残留結晶を扱った経験。感染成立は物質への接触選択に限る。",
        engine: "鉱石病曝露履歴"
      },
      spouse_supported: {
        label: "感染した配偶者を支える",
        description: "配偶者の感染開示後、診療と暮らしを一緒に支える判断をした。",
        engine: "配偶者の治療費・家族履歴"
      },
      spouse_strained: {
        label: "配偶者の感染開示で関係が揺らぐ",
        description: "感染そのものと隠されていたことへの感情を分けきれず、夫婦の距離が変わった。",
        engine: "家族履歴"
      },
      marriage_strained: {
        label: "婚姻関係の緊張",
        description: "家計や生活上の対立から、一時的に別居するなど関係が揺らいでいる。",
        engine: "状況タグ・後続家族イベント",
        tags: ["婚姻関係が緊張"]
      },
      spouse_sarkaz_decided: {
        label: "サルカズの配偶者をめぐる親族との判断",
        description: "配偶者の出自を理由とする親族の反対にどう応じたかを記録する。",
        engine: "家族履歴"
      },
      family_infection_support: {
        label: "家族と鉱石病の診療を相談した",
        description: "自分または感染した家族の診療・生活について、家族と相談した経験。",
        engine: "家族支援の記録"
      },
      mine_exposure_refused: {
        label: "危険な採掘作業を中断した",
        description: "源石結晶や粉塵が露出した採掘坑で、安全具が整うまで作業を止めた。",
        engine: "経歴表示"
      },
      terror_exposure: {
        label: "爆破で飛散した源石片に接した",
        description: "戦乱地域の爆破現場で源石片への接触が生じた経験。感染の有無とは独立して記録する。",
        engine: "鉱石病曝露履歴"
      },
      parent_unemployed: {
        label: "養育者の失業",
        description: "家計を担う親が職を失い、再就職するまで家計収入が減っている状態。",
        engine: "未成年家計の親収入減・再就職イベント",
        tags: ["失業中の親"]
      },
      pet_companion: {
        label: "飼育動物と暮らす",
        description: "家計の維持費と世話を負担して飼育動物を迎えた状態。",
        engine: "年次飼育費"
      },
      pet_care_extended: {
        label: "飼育動物の治療で時間を得た",
        description:
          "終末期の治療が奏功し、飼育動物との時間が延びたというゲーム上の記録。動物の年齢・寿命の公式設定を意味しない。",
        engine: "終末期相談の再発制御"
      },
      pet_care_outsourced: {
        label: "飼育動物を知人に預ける",
        description:
          "本人が収容・隔離されている間、飼育動物の世話を知人へ頼んでいる状態。飼育費は本人の家計から続けて負担する。",
        engine: "預け先表示・釈放時に解除"
      },
      disaster_displaced: {
        label: "天災で住まいを離れた",
        description: "天災後、元の住まいを離れて避難生活を送っている状態。",
        engine: "避難後イベント",
        tags: ["天災避難中"]
      },
      war_displaced: {
        label: "戦乱で住まいを離れた",
        description:
          "戦闘や占領から逃れ、元の住まいを離れている状態。避難理由別の後日談と健康負担へ接続する。",
        engine: "避難後イベント・年次健康",
        tags: ["戦乱避難中"]
      },
      hobby_music: {
        label: "音楽を続ける",
        description: "道具・稽古・会費を負担しながら音楽を続ける。",
        engine: "年次趣味費"
      },
      hobby_craft: {
        label: "手仕事を続ける",
        description: "材料費をやりくりしながら手仕事を続ける。",
        engine: "年次趣味費"
      },
      hobby_garden: {
        label: "植物を育てる",
        description: "種・土・区画代を負担して植物を育てる。",
        engine: "年次趣味費"
      },
      hobby_sport: {
        label: "運動・武術を続ける",
        description: "稽古場や地域の練習仲間と体を動かす。会費・装備費を負担する。",
        engine: "年次趣味費"
      },
      hobby_collect: {
        label: "古書・地図・小物を集める",
        description: "自分の関心に沿う品を少しずつ集め、保管費や購入費を負担する。",
        engine: "年次趣味費"
      },
      hobby_story: {
        label: "物語・唄・信仰の集まりに通う",
        description: "地域の語り、合唱、祈りや学びの集まりに参加し、会費や移動費を負担する。",
        engine: "年次趣味費"
      },
      patron: { label: "後援者", description: "後援を受けた経験。", engine: "経歴表示" },
      resistance: {
        label: "抵抗運動",
        description: "抵抗運動に参加した経験。",
        engine: "経歴表示",
        tags: ["レジスタンス"]
      },
      reunion: {
        label: "レユニオンとの関係",
        description: "レユニオンへの参加・接触経験。",
        engine: "経歴表示"
      },
      retired: {
        label: "退職後の生活",
        description: "本人が早期退職を選び、通常就労収入を離れた状態。",
        engine: "就労判定・退職後収入",
        tags: ["退職後"]
      },
      rhodes: {
        label: "ロドスとの接触・支援歴",
        description:
          "医療支援を受けた、支援に協力した、または働き口を相談した記録。継続的な所属や職員資格を意味しない。",
        engine: "接触後の日常・経歴表示",
        tags: ["ロドスとの接触歴"]
      },
      rhodes_landship: {
        label: "ロドス・アイランド本艦居住",
        description: "超国家組織ロドス・アイランドの陸上母艦（本艦）内に生活拠点を構えている状態。",
        engine: "本艦内日常・防護・死因モデルの適用",
        tags: ["ロドス本艦居住", "ロドス本艦"]
      },
      rhine_whistleblower: {
        label: "ライン生命の機密告発者",
        description: "ライン生命の非人道実験を内部告発し、追われる身となった経験。",
        engine: "ロドス亡命・隠遁イベントの解放"
      },
      rhine_whistleblower_review_passed: {
        label: "ライン生命の再応募資格審査を通過",
        description:
          "1099年の組織再編後に個別の告発経歴を審査して再応募資格が認められたゲーム上の結果。採用内定や元の階級への復帰を意味しない。",
        engine: "離職した告発者の通常採用経路を再び選択可能にする"
      },
      bsw_infection_disclosed: {
        label: "BSW社内感染開示",
        description: "BSW社内規則に基づき、自身の鉱石病感染を人事部・同僚へ正式に開示した記録。",
        engine: "任務編成制限・配置転換"
      },
      source_safety_guidance: {
        label: "源石片の扱いを医療担当者に相談した",
        description:
          "移動医療支援の担当者から、結晶片・粉塵を見つけた際の注意と相談先を個人として聞いた経験。内容と効果はゲーム上の個別経験で、普遍的な医療制度を意味しない。",
        engine: "感染親の遺品整理で経験に基づく選択肢を提示"
      },
      sch: { label: "就学", description: "学校に在籍している状態。", engine: "就学・教育更新" },
      segregated: {
        label: "隔離",
        description: "隔離区画で暮らし、外の仕事や自由な移動を中断している状態。",
        engine: "区画内のイベント・家計・就労制約",
        tags: ["隔離中"]
      },
      seg_work: {
        label: "隔離区画内の仕事",
        description: "外部職の給金に代わり、区画内の仕事から収入を得る状態。隔離を終えたら解除する。",
        engine: "隔離中の年収・仕事の選択"
      },
      street_fighter: {
        label: "路上で抵抗した経験",
        description:
          "路上で襲われた際、恐怖や負傷を伴いながら抵抗を試みた記録。成功や勝利、本人の責任を意味しない。",
        engine: "経歴表示"
      },
      trauma_crime: {
        label: "犯罪被害のトラウマ",
        description: "犯罪・暴力に関わるトラウマ経験。",
        engine: "死亡リスク"
      },
      trauma_war: {
        label: "戦争被害のトラウマ",
        description: "戦争・徴兵に関わるトラウマ経験。",
        engine: "死亡リスク"
      },
      tx: {
        label: "治療中",
        description: "鉱石病の治療を継続している状態。",
        engine: "感染進行・医療費・治療UI"
      },
      uni: { label: "大学進学", description: "大学へ進学した経験。", engine: "教育段階" },
      uni_enrolled: {
        label: "大学在籍中",
        description: "大学課程に在籍している状態。",
        engine: "教育・収入・年次学費",
        tags: ["大学在籍"]
      },
      veteran: { label: "従軍経験", description: "軍務・従軍の経験。", engine: "戦争被害リスク" },
      higashi_service: {
        label: "極東の軍務・兵站に在職中",
        description:
          "極東で募集を見て任用された個人が、軍務・兵站職を続けているゲーム上の記録。強制動員や住民全体の軍歴を示さない。",
        engine: "任期見直し・職業経路"
      },
      military_pension: {
        label: "従軍後の恩給資格",
        description:
          "戦乱地域の従軍イベントで、帰還後の継続給付を得た記録。全国家共通の制度や実在制度を示さず、該当するゲーム内経路だけで収入へ反映する。",
        engine: "年次収入・家計収支"
      },
      voc: { label: "専門教育", description: "専門学校で学んだ経験。", engine: "教育段階" },
      voc_enrolled: {
        label: "職業課程在籍中",
        description: "職業課程に在籍している状態。",
        engine: "教育・収入・年次学費",
        tags: ["職業課程在籍"]
      },
      workplace_hazard: {
        label: "危険職場",
        description: "現在の職場で危険な作業を担っている状態。転職・退職で解除し、過去の負傷や勤務経験はそれぞれの履歴に残す。",
        engine: "事故死リスク"
      },
      col_tech_employed: {
        label: "クルビア研究企業の技師職",
        description:
          "研究企業に技師として採用され、装置点検・調整に従事した経験。特定企業の正史上の採用条件や待遇を示さない。",
        engine: "技師職の安全・役割イベント",
        tags: ["クルビア企業技術職経験"]
      },
      vic_clerk_employed: {
        label: "ヴィクトリアの保険仲介所で帳簿係として勤務",
        description:
          "一つの保険仲介所で契約書類を扱う補助職に採用された経験。全国共通の制度や公的な保険給付を意味しない。",
        engine: "帳簿係の契約照合イベント"
      },
      col_tech_safety_case: {
        label: "技師職で安全手順の食い違いに遭遇",
        description: "試作装置の点検記録と現場の安全手順に食い違いを見つけ、対応を選んだ未決着の経験。",
        engine: "クルビア技師職の後日談",
        tags: ["技師職の安全案件"]
      },
      col_tech_reported: {
        label: "技師職の安全上の懸念を記録・報告",
        description: "職場の安全手順の食い違いを記録に残し、責任者へ報告した経験。",
        engine: "クルビア技師職の後日談",
        tags: ["技師職で安全懸念を報告"]
      },
      col_tech_kept_note: {
        label: "技師職の安全上の懸念を私的に記録",
        description: "安全上の懸念を公的な申し立てにせず、手元の記録として残した経験。",
        engine: "クルビア技師職の後日談",
        tags: ["技師職の安全メモ"]
      },
      col_tech_silent: {
        label: "技師職の安全上の懸念を保留",
        description: "雇用や生活への影響を考え、安全上の懸念をその場では記録・報告しなかった経験。",
        engine: "クルビア技師職の後日談",
        tags: ["技師職の安全懸念を保留"]
      },
      col_tech_safety_closed: {
        label: "技師職の安全案件を終えた",
        description:
          "安全手順の食い違いについて、相談・担当替え・退職のいずれかを選び、当面の判断を終えた経験。根本解決を意味しない。",
        engine: "クルビア技師職の再発制御",
        tags: ["技師職の安全案件を終えた"]
      },
      col_tech_role_reviewed: {
        label: "技師職で次の役割を選んだ",
        description: "安全案件の後、技師としてどの役割を担うかを選んだ経験。",
        engine: "クルビア技師職の役割移行",
        tags: ["技師職で次の役割を選んだ"]
      },
      col_tech_supervisor: {
        label: "小さな作業班の点検役",
        description: "企業全体を動かす立場ではなく、限られた班や設備の点検を取りまとめた経験。",
        engine: "クルビア技師職の役割",
        tags: ["小さな作業班の点検役"]
      },
      col_tech_mentor: {
        label: "後輩技師を教えた",
        description: "新しく入った技師に、装置の点検や記録の読み方を教えた経験。",
        engine: "クルビア技師職の役割",
        tags: ["後輩技師を教えた"]
      },
      col_tech_shortcut: {
        label: "納期優先の試験調整を担った",
        description: "納期を優先する試験工程の調整役を引き受けた経験。安全上の違反や事故を意味しない。",
        engine: "クルビア技師職の役割",
        tags: ["納期優先の試験調整を担った"]
      },
      col_tech_waiver_pending: {
        label: "仕入れ部品の確認事項が未決着",
        description: "仕入れ部品の書類不足に対する一時判断が、後日の内部確認を待っている状態。",
        engine: "クルビア技師職の内部確認",
        tags: ["技師職の内部確認待ち"]
      },
      col_tech_waiver_signed: {
        label: "書類未確認の部品を例外扱いした",
        description: "一回の納入分について、検査書類を確認できないまま例外扱いの署名をした経験。",
        engine: "クルビア技師職の内部確認",
        tags: ["書類未確認の部品を例外扱いした"]
      },
      col_tech_waiver_refused: {
        label: "書類未確認の部品を保留した",
        description: "検査書類が整うまで一回の納入分を保留するよう求めた経験。",
        engine: "クルビア技師職の内部確認",
        tags: ["書類未確認の部品を保留した"]
      },
      col_tech_waiver_note: {
        label: "書類未確認の部品を仮受けと記録した",
        description: "納入品を区分保管し、記録上の確認待ちとして処理した経験。",
        engine: "クルビア技師職の内部確認",
        tags: ["書類未確認の部品を仮受けとして記録した"]
      },
      col_tech_review_completed: {
        label: "仕入れ記録の内部確認を終えた",
        description:
          "一回の納入記録について内部確認に応じ、当面の判断を終えた経験。会社全体の制度変更を意味しない。",
        engine: "クルビア技師職の状態管理",
        tags: ["仕入れ記録の内部確認を終えた"]
      },
      col_tech_later_years: {
        label: "技師職の後年の働き方を決めた",
        description:
          "過去の職場経験を踏まえ、技師として働き続けるか、役割を軽くするか、職場を離れるかを選んだ経験。",
        engine: "クルビア技師職の後年経路",
        tags: ["技師職の後年の働き方を決めた"]
      },
      columbia_pioneer: {
        label: "クルビア独立期に登記申請を選んだ",
        description: "独立期に登記を申請する選択を記録。土地所有が認可されたという永続的な法的証明ではない。",
        engine: "歴史イベントの個人別選択履歴",
        tags: []
      },
      silence_survivor: {
        label: "大いなる静謐で沿岸から避難した",
        description: "沿岸の危機に遭遇し避難したという個人のゲーム内選択。",
        engine: "歴史イベントの個人別選択履歴",
        tags: []
      },
      omerta_sworn: {
        label: "シラクーザ統一期に沈黙の掟を守った",
        description: "当該時期の本人の選択。全国共通の法令を示さない。",
        engine: "歴史イベントの個人別選択履歴",
        tags: []
      },
      babel_affiliate: {
        label: "バベル離脱時に陸艦へ向かった",
        description: "年表上の危機で主人公が選んだ架空の行動。公式人物との関係を確定しない。",
        engine: "歴史イベントの個人別選択履歴",
        tags: []
      },
      chernobog_refugee: {
        label: "チェルノボーグ事変で避難列車へ向かった",
        description: "事変時に避難したという本人のゲーム内経験。全住民の被災・移動状況を表さない。",
        engine: "歴史イベントの個人別選択履歴",
        tags: []
      },
      volcano_evacuee: {
        label: "シエスタ火山活動で船に避難した",
        description: "火山危機で船を利用した本人の選択。公式の避難制度を確定しない。",
        engine: "歴史イベントの個人別選択履歴",
        tags: []
      },
      cyber_trace: {
        label: "鎖川電脳プロトコルの痕跡",
        description: "1088年鎖川サイバー攻撃の極秘プロトコル断片を発見した記録。",
        engine: "サイバーニンジャ隠しルート解禁",
        tags: []
      },
      nukenin: {
        label: "抜け忍",
        description: "極東の忍び衆の掟を破り、脱走した記録。",
        engine: "抜け忍追撃イベント",
        tags: []
      }
    },
    false
  );
});
