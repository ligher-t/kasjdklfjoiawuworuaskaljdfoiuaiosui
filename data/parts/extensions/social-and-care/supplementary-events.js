// extensions/social-and-care/supplementary-events: reviewed additions from the 140-event balance draft.
// Drafts are translated into bounded personal scenes; unverified population-wide claims and future outcomes are not asserted.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/supplementary-events"
)(function ($terraData, $define, $rules) {
  "use strict";

  const makeEvent = row => ({
    id: row.id,
    conf: "S",
    references: row.references || ["SRC_TERRA_LIFECOURSE"],
    st: row.st || ["青年", "壮年", "老年"],
    ...(row.need ? { need: row.need } : {}),
    ...(row.ge ? { ge: row.ge } : {}),
    ...(row.le ? { le: row.le } : {}),
    ...(row.once ? { once: true } : {}),
    ...(row.cd != null ? { cd: row.cd } : {}),
    w: row.w == null ? 0.35 : row.w,
    ...(row.show ? { show: row.show } : {}),
    t: row.t,
    ...(row.c ? {
      c: row.c.map(choice => $terraData.K(choice[0], choice[3] || {}, [
        1,
        choice[1],
        choice[2] || {}
      ]))
    } : { fx: row.fx || {} })
  });

  const pushRows = rows => {
    for (const row of rows) $terraData.EV.push(makeEvent(row));
  };
  const careerRows = [];
  const career = (id, key, region, t, c, opts = {}) => careerRows.push({
    id,
    references: ["SRC_REGIONAL_CAREERS"],
    st: opts.st || ["青年", "壮年"],
    need: ["国:" + region],
    ge: opts.ge || { age: 20 },
    le: opts.le,
    once: opts.once !== false,
    cd: opts.cd,
    w: opts.w == null ? 0.35 : opts.w,
    show: s => $terraData.regionalCareerOnDuty(s, key),
    t,
    c
  });
  const normalOutcome = (label, text, fx) => [label, text, fx || {}];

  // RC-01..39: candidate careers and local work. Results remain personal and do not create unmodeled titles.
  career("car_yan_tianshi_daily_01", "yan_tianshi", "炎国",
    "観測楼の机に、移動都市の進路と水路の古い記録を並べた。計算を終えたあと、現場へ向かう若い天師たちに図面の読み違えやすい箇所を書き添えた。",
    [normalOutcome("記録を整えて書庫へ納める", "数字の根拠と測定時刻をそろえて記録を返した。帰り道、頭の中に残っていた計算をようやく手放した。", { k: 2, p: 1 })],
    { once: false, cd: 3 });
  career("car_yan_tianshi_choice_flood_catastrophe", "yan_tianshi", "炎国",
    "雨が続き、下流の水位を示す標識が一日ごとに上がっていた。天師府からは堤の補修計画と、低地の住民へ避難を知らせる手順の確認を頼まれた。",
    [
      normalOutcome("現地の測量を優先し、危険区画を早めに知らせる", "水位と堤の傷みを確かめ、危険が高い区画から順に知らせを回した。全員がすぐ避難したかまでは分からないが、判断材料を現場へ渡せた。", { k: 3, p: 1, h: -1 }),
      normalOutcome("後方で水門と避難路の記録を照合する", "水門の操作記録と避難路の図を突き合わせ、現地班が迷わないよう書き直した。雨音は夜まで窓を叩いていた。", { k: 2, p: 1 })
    ]);
  career("car_yan_tianshi_choice_feranmut_vein", "yan_tianshi", "炎国",
    "山地の源石調査で、既存の地図にない波形が記録された。原因は分からず、司歳台へ判断を仰ぐまで現場の採掘を止めておく必要があった。",
    [
      normalOutcome("測定器と採取記録を保全し、司歳台へ正式に照会する", "測定の手順と採取地点を記録し、未確認の原因を断定せず報告に添えた。回答が来るまで現場は立入を絞ることになった。", { k: 3, p: 1 }),
      normalOutcome("危険の可能性を伝え、調査班を安全な位置まで戻す", "判断を急がず、調査班と周辺の作業員に退避を伝えた。記録は残ったが、波形の正体はまだ分からない。", { p: 2, h: 1 })
    ]);
  career("car_yan_tianshi_promo_grand_mentor", "yan_tianshi", "炎国",
    "若い天師から、観測記録の読み方を教えてほしいと頼まれた。大きな肩書きが変わる知らせではないが、長年の手順を次へ渡す機会になりそうだった。",
    [
      normalOutcome("後進の実地研修を引き受ける", "誤差の見つけ方や現場で確認すべき点を、実際の記録を使って伝えた。人に教えることで、自分の手順も見直せた。", { k: 3, cr: 2, p: 2 }),
      normalOutcome("まずは記録と手順書を整えて渡す", "口伝だけに頼らないよう、測定例と注意点を手順書へまとめて渡した。", { k: 2, p: 1 })
    ], { st: ["壮年"], ge: { age: 30 } });
  career("car_urs_academy_daily_01", "urs_academy", "ウルサス",
    "科学院の製図室で、寒冷地の設備図面に修正を入れた。作業台の端には、試験条件と耐久記録が別々の束になっている。午後はその照合に追われた。",
    [normalOutcome("試験条件をそろえて記録する", "一つずつ条件をそろえて記録し、前回と違う箇所に印を付けた。地味な確認だったが、次の試験の手戻りを減らせそうだった。", { k: 2, p: 1 })],
    { once: false, cd: 3 });
  career("car_urs_academy_choice_artillery_boiler", "urs_academy", "ウルサス",
    "試験用ボイラーの圧力が予定より速く上がり、安全弁の音が変わった。責任者は試験継続を求めたが、計器の値には見逃せないずれがある。",
    [
      normalOutcome("試験を止め、計器と安全弁を点検する", "試験は中断され、原因が分かるまで装置は封印された。予定は遅れたが、異常を記録に残せた。", { k: 2, p: 1 }),
      normalOutcome("負荷を落とし、監督者立ち会いで記録を取り直す", "出力を下げて短い試験だけ行い、異常が再現するか確認した。原因の確定には追加の点検が必要だった。", { k: 3, h: -1 })
    ]);
  career("car_urs_academy_choice_sarcophagus_blueprint", "urs_academy", "ウルサス",
    "出所が明かされない施設の送電計算を補助するよう命じられた。担当範囲の図面は渡されたが、計画全体の説明はなく、資料の扱いにも細かな制限が付いていた。",
    [
      normalOutcome("割り当てられた計算だけを行い、手順を記録する", "担当範囲を越えて資料を持ち出さず、計算の前提と提出先を記録した。施設の目的は分からないままだった。", { k: 2, p: 1 }),
      normalOutcome("不明点を上司に書面で確認し、回答が来るまで保留する", "不明な条件を列挙して確認を求めた。返答を待つあいだ、別の業務へ回された。", { k: 1, p: 2 })
    ]);
  career("car_urs_academy_promo_chief_architect", "urs_academy", "ウルサス",
    "後輩の設計確認を任されることが増えた。役職の辞令ではないが、図面の読み方を教え、見落としを一緒に探す役割が少しずつ広がっている。",
    [
      normalOutcome("若手の確認時間を設ける", "週に一度、提出前の図面を持ち寄る時間を作った。小さな誤記を早めに見つけられるようになった。", { k: 3, cr: 2, p: 2 }),
      normalOutcome("自分の設計作業を優先し、必要な時だけ助言する", "相談があった時に判断根拠を説明する形にした。無理に指導役を引き受けず、自分の担当を守った。", { k: 2, p: 1 })
    ], { st: ["壮年"], ge: { age: 30 }, show: s => $terraData.regionalCareerOnDuty(s, "urs_academy") && (s.k || 0) >= 50 });
  career("car_vic_scribe_daily_01", "vic_scribe", "ヴィクトリア",
    "議会事務局で、会議記録の固有名詞と提出時刻を照合した。机の脇には差し替えられた草稿が積まれ、書記たちは訂正箇所を一つずつ確かめていた。",
    [normalOutcome("訂正履歴を残して記録を確定する", "訂正前の記述も消さず、誰がいつ直したかを余白に記した。記録の整合が取れたころには、廊下の灯りが落とされていた。", { k: 2, p: 1 })],
    { once: false, cd: 3 });
  career("car_vic_scribe_choice_duke_bribe_ledger", "vic_scribe", "ヴィクトリア",
    "予算表の数字と添付資料が一致していない。閲覧者を限られた文書であり、確認を続ければ、誰かの利害に触れるかもしれなかった。",
    [
      normalOutcome("不一致だけを記録し、監査手続きへ回す", "見た事実と推測を分けて不一致を記録し、所定の監査先へ提出した。何が起きるかは、手続きの先に委ねるしかなかった。", { k: 3, p: 1 }),
      normalOutcome("閲覧権限を確認し、担当範囲を越える調査はしない", "文書の取扱規則を確かめ、権限外の資料には触れずに上司へ確認を求めた。自分の身を守りつつ、記録の欠落は報告した。", { k: 2, p: 1 })
    ]);
  career("car_vic_scribe_choice_1098_londinium_archives", "vic_scribe", "ヴィクトリア",
    "ロンディニウムで行政機関の移転が続き、保管庫の台帳と実物の置き場所が合わなくなっていた。あなたの担当する書類にも、住民の権利や支援に関わる記録が含まれている。",
    [
      normalOutcome("台帳を更新し、移転先と所在不明の束を分けて記録する", "運び出した記録と所在不明の束を別々に台帳へ残した。後任は保管先を照合できるようになり、再調査を続けることになった。", { k: 3, p: 1 }),
      normalOutcome("保管担当へ引き継ぎ、住民窓口の書類を優先する", "保管担当に未照合の束を引き継ぎ、窓口で必要な書類が参照できるか確かめた。", { k: 2, rl: 1 })
    ], { ge: { year: 1098 }, le: { year: 1099 } });
  career("car_vic_scribe_promo_cabinet_secretary", "vic_scribe", "ヴィクトリア",
    "長く続けてきた議事記録の整理が評価され、後輩の作業確認も任されるようになった。人事上の肩書きは変わらないが、記録の責任は重くなっている。",
    [
      normalOutcome("確認手順を文書にし、担当者間で共有する", "判断を一人の記憶に頼らないよう、よくある訂正例と照合の順をまとめた。", { k: 3, cr: 2, p: 2 }),
      normalOutcome("現行の担当範囲を守り、依頼された分だけ助言する", "追加の役割を抱え込みすぎず、依頼があった案件の確認に限って助言することにした。", { k: 2, p: 1 })
    ], { st: ["壮年"], ge: { age: 30 }, show: s => $terraData.regionalCareerOnDuty(s, "vic_scribe") && (s.k || 0) >= 50 });
  career("car_vic_works_daily_01", "vic_works", "ヴィクトリア",
    "鉄道工廠で、車軸の摩耗記録と交換部品の帳面を照らし合わせた。次の検査まで持つかどうかは、部品の履歴を追わなければ判断できない。",
    [normalOutcome("古い部品の履歴を追加で確認する", "帳面の抜けを見つけ、保管庫に残っていた記録と合わせて書き直した。手間はかかったが、次の検査担当へ渡せる記録になった。", { k: 2, p: 1 })],
    { once: false, cd: 3 });
  career("car_vic_works_choice_steam_armor_reactor", "vic_works", "ヴィクトリア",
    "整備中の蒸気配管から異音が続いた。監督は作業を急がせているが、計器の針が予定の範囲からわずかに外れていた。",
    [
      normalOutcome("作業を止め、圧力を抜いて配管を点検する", "点検のため工程は遅れた。継ぎ目の摩耗が見つかり、交換後に安全確認をやり直すことになった。", { k: 2, p: 1 }),
      normalOutcome("監督者へ異常値を報告し、周囲を退避させて判断を待つ", "作業員を離れた位置へ移し、異常値と発生時刻を報告した。原因が確定するまで、試運転は再開されなかった。", { k: 2, h: -1 })
    ]);
  career("car_vic_works_choice_worker_strike_mediation", "vic_works", "ヴィクトリア",
    "工廠の作業者たちが、防護具の不足と長時間勤務について話し合いを求めてきた。経営側は納期を理由に応じず、現場の声は休憩室にも届いている。",
    [
      normalOutcome("事故記録と必要な装備をまとめ、双方の席に持ち込む", "現場で記録された事故と不足品を一覧にし、話し合いの席へ提出した。すぐに結論は出なかったが、要求を曖昧な不満として片づけさせなかった。", { k: 2, p: 2, rl: 1 }),
      normalOutcome("一方の代理人にはならず、作業再開の条件を確認する", "誰かの主張を代弁するのではなく、再開に必要な安全条件と責任者を確認した。", { k: 1, p: 1 })
    ]);
  career("car_vic_works_promo_chief_engineer", "vic_works", "ヴィクトリア",
    "若い技師から、圧力試験の記録を見てほしいと頼まれた。現場で覚えた確認の順番を伝えると、後輩は自分で見落としを見つけた。",
    [
      normalOutcome("検査の手順を次の班にも共有する", "使い回せる確認表を作り、交代班にも渡した。現場の記録に同じ観点が残るようになった。", { k: 3, cr: 2, p: 2 }),
      normalOutcome("後輩と一緒に一件ずつ確認する", "急いで答えを渡さず、図面と実物を並べて本人に判断してもらった。", { k: 2, rl: 1 })
    ], { st: ["壮年"], ge: { age: 30 } });
  career("car_lei_court_daily_01", "lei_court", "リターニア",
    "演奏会の前、譜面台に置かれた版が練習用のものと違うことに気づいた。奏者たちは音を確かめながら、どの版で本番に臨むか話し合っていた。",
    [normalOutcome("違いを一つずつ確かめて、合意した版で合わせる", "作曲者名や譜面の由来を決めつけず、全員が同じ版を見ているか確かめた。短い確認の後、練習が再開された。", { k: 2, p: 1 })],
    { once: false, cd: 3 });
  career("car_lei_court_choice_forbidden_score", "lei_court", "リターニア",
    "依頼主から、由来の確認できない古い楽譜を演奏会へ出せないかと相談された。記譜には読み取れない箇所があり、通常の譜面とは違う印も残っている。",
    [
      normalOutcome("出典と演奏上の危険を確認できるまで採用を保留する", "楽譜の来歴と演奏上の注意を確認できるまで、演目には加えないと伝えた。代わりの曲を選び直すことになった。", { k: 2, p: 1 }),
      normalOutcome("安全な箇所だけを採譜し、監督者の立ち会いで試奏する", "読める箇所だけを写し、試奏の条件を記録した。正体の分からない記号は解釈せず、専門家の確認へ回した。", { k: 3, h: -1 })
    ]);
  career("car_lei_court_choice_infected_virtuoso_student", "lei_court", "リターニア",
    "街角で、ひとりの若い奏者が人通りの少ない時間に練習していた。演奏会へ出たいが、感染を理由に会場から断られるのではないかと話している。",
    [
      normalOutcome("本人の希望を聞き、公開募集の条件を一緒に確かめる", "本人の同意を得て、募集要項に感染を理由とする制限があるか確認した。受け入れられるかは主催者の判断に残されたが、応募の手順を伝えられた。", { k: 1, p: 2, rl: 1 }),
      normalOutcome("自分の練習時間と譜面を分け、応募するかは本人に任せる", "譜面と練習場所を共有したが、舞台に出るかどうかは本人に決めてもらった。", { p: 2, k: 1 })
    ], { show: s => $terraData.regionalCareerOnDuty(s, "lei_court") && !!s.fl?.dg });
  career("car_lei_court_promo_imperial_kapellmeister", "lei_court", "リターニア",
    "合奏の練習で、経験の浅い奏者から拍の取り方を尋ねられた。何度も演奏して身につけた呼吸を、相手の速度に合わせて説明した。",
    [
      normalOutcome("練習の進行役を引き受ける", "全員の意見を聞きながら、無理のないテンポで練習を組み直した。", { k: 2, cr: 2, p: 2 }),
      normalOutcome("自分の担当を続け、必要な時に助言する", "指揮役を引き受けず、自分の譜面を仕上げながら質問に答えた。", { k: 2, p: 1 })
    ], { st: ["壮年"], ge: { age: 30 } });
  career("car_lat_landen_daily_01", "lat_landen", "ラテラーノ",
    "修道院の朝の作業が終わると、長銃の点検表が机に戻ってきた。手入れの順序と保管場所を確かめたあと、食堂の片づけにも加わった。",
    [normalOutcome("点検表を更新して次の当番へ渡す", "使った道具と確認した箇所を記録し、次の当番へ手渡した。食卓の片づけを終えるころ、庭には鐘の音が残っていた。", { k: 1, p: 1 })],
    { once: false, cd: 3 });
  career("car_lat_landen_choice_cardinal_convoy_siege", "lat_landen", "ラテラーノ",
    "巡礼路の護衛予定が変更され、連絡の取れない区間が生じた。同行者は先へ進むべきか、予定を切り上げるべきか決めかねている。",
    [
      normalOutcome("安全な中継地点まで戻り、連絡を取り直す", "道の様子が分からないまま進まず、全員で中継地点へ戻った。護衛の予定は遅れたが、行き先の確認を済ませてから再出発することになった。", { p: 1, k: 1 }),
      normalOutcome("現地の案内を受け、短い区間ずつ進む", "現地の案内人と見通しの利く区間を確かめながら進んだ。護衛対象が無事に着いたかは、到着後の報告を待つことになった。", { k: 2, h: -1 })
    ]);
  career("car_lat_landen_choice_financial_brewery", "lat_landen", "ラテラーノ",
    "修道院の帳簿に、屋根の修繕費と日々の支出が並んでいた。補助が続く保証はなく、共同生活を守るためにできることを皆で相談した。",
    [
      normalOutcome("収支を見直し、無理のない寄付や販売を試す", "費用のかかる項目を一つずつ確認し、修道院の品を小さく販売する案を試すことになった。収益はまだ分からない。", { k: 2, p: 1 }),
      normalOutcome("護衛や地域の手伝いを増やし、支出は変えない", "自分にできる範囲で地域の仕事を引き受けた。疲れは増えたが、帳簿に載る金額は少し補えた。", { h: -1, p: 1 })
    ]);
  career("car_lat_landen_promo_grand_master", "lat_landen", "ラテラーノ",
    "新人の当番表や装備点検の相談が、あなたのところへ集まるようになった。経験を尋ねられる場面が増え、周囲の仕事を支える機会ができている。",
    [
      normalOutcome("当番の調整と点検の確認を引き受ける", "負担が一人に偏らないよう当番表を見直し、点検手順も共有した。", { p: 2, cr: 2, k: 1 }),
      normalOutcome("担当を増やさず、自分の勤務と祈りを続ける", "今の役割を越えて抱え込まず、必要な時に相談へ応じることにした。", { p: 1, h: 1 })
    ], { st: ["壮年"], ge: { age: 30 } });

  career("car_hig_shinto_choice_corrupted_shrine", "hig_shinto", "極東",
    "山の古社で、参道の立入止めが新しく設けられていた。地元の人から、夜に異音が聞こえたと相談されたが、原因はまだ確かめられていない。",
    [
      normalOutcome("社務所から関係者へ連絡し、立入止めを保つ", "異変の正体を語り広めず、確認できる担当者へ連絡した。立入止めは点検が済むまで続くことになった。", { k: 1, p: 1 }),
      normalOutcome("参道の安全を確かめ、住民に迂回路を案内する", "足元と建物の傷みを確かめ、危険がありそうな区間を避ける道を案内した。原因は専門の点検を待つ。", { p: 1, h: -1 })
    ]);
  career("car_hig_shinto_choice_war_refugee_sanctuary", "hig_shinto", "極東",
    "寺社の境内に、行き場を探す避難者が訪れた。受け入れられる人数や食料の残りは限られており、追い返すかどうかだけでは決められない。",
    [
      normalOutcome("今夜休める場所と、翌朝に相談できる窓口を案内する", "安全に休める場所を確認し、翌朝の支援窓口と連絡方法を伝えた。長く滞在できるかは別の担当者と相談することになった。", { rl: 2, p: 1 }),
      normalOutcome("境内の備蓄を確認し、近隣の世話役と受入れ人数を決める", "食料と寝具の残りを確かめてから、近隣の世話役と受入れ人数を話し合った。希望者全員を受け入れることはできなかった。", { k: 1, p: 1 })
    ]);
  career("car_hig_touhou_choice_prototype_katana_reactor", "hig_touhou", "極東",
    "試験設備の冷却管から液が漏れ、出力計が落ち着かなくなった。試作機の損失を恐れる声がある一方、試験区域には作業員も残っていた。",
    [
      normalOutcome("試験を中断し、区域を空けて装置を冷却する", "作業員を退避させ、試作機の電源を落として冷却を待った。原因調査が終わるまで試験は延期された。", { k: 2, p: 1 }),
      normalOutcome("監督者の指示で負荷を下げ、離れた位置から計測する", "負荷を落とし、危険域へ入らずに計器を記録した。作業員の安全を確認してから、次の手順を検討した。", { k: 2, h: -1 })
    ]);
  career("car_hig_touhou_choice_arms_merchant_ethics", "hig_touhou", "極東",
    "自分が関わった部品の出荷先が、当初の説明と違うと知った。最終用途は確認できず、現場の担当だけで流通を止める権限もない。",
    [
      normalOutcome("確認できた経緯を記録し、上司へ正式に照会する", "分かった範囲を上司へ報告し、出荷担当へ確認する照会を登録した。あなたの手元にも、問い合わせの記録が残った。", { k: 2, p: 1 }),
      normalOutcome("今後は民生用途の設計へ移る希望を出す", "民生設備の設計へ移りたいと希望を伝えた。配置の返答があるまでは、現在の担当を続けることになった。", { p: 2, k: 1 })
    ]);
  career("car_hig_shinto_promo_high_priest", "hig_shinto", "極東",
    "地域の祭事や相談の場で、若い神職から進行の手順を尋ねられることが増えた。大きな位階が決まったわけではなく、日々の役目をどう分けるかが話題になっている。",
    [
      normalOutcome("地域の当番と相談窓口の引継ぎを手伝う", "決まった手順と担当先を一緒に整理した。次の行事を無理なく続けるための引継ぎができた。", { p: 2, cr: 1 }),
      normalOutcome("個人の務めを続け、必要な時だけ助言する", "役割を広げすぎず、自分の担当を守りながら相談に答えることにした。", { p: 1, k: 1 })
    ], { st: ["壮年"], ge: { age: 30 }, show: s => $terraData.regionalCareerOnDuty(s, "hig_shinto") && (s.p || 0) >= 35 });
  career("car_hig_touhou_promo_chief_developer", "hig_touhou", "極東",
    "若い技師が、試験結果の整理を任せたいと申し出た。ひとりで設計を抱えるより、確認の観点を共有できる機会になりそうだった。",
    [
      normalOutcome("試験記録の確認を一緒に行う", "数値の前提をそろえ、再現できる試験条件を表にまとめた。", { k: 2, cr: 2, p: 1 }),
      normalOutcome("自分の設計を優先し、手順書だけ渡す", "作業を止めずに済むよう、使っている手順書と注意点を渡した。", { k: 2, p: 1 })
    ], { st: ["壮年"], ge: { age: 30 } });
  career("car_kaz_armorless_choice_infected_knight_target", "kaz_armorless", "カジミエーシュ",
    "無冑盟から、感染者騎士に関する依頼が届いた。依頼の根拠と対象の状況は十分に示されていない。あなたは依頼を受ける前に、どこまで確認するか決めなければならない。",
    [
      normalOutcome("根拠と指揮系統を照会し、回答がない間は実行しない", "標的の正当性を確かめられないまま動くことは断った。組織との関係がどう変わるかはまだ分からない。", { p: 1, k: 2 }),
      normalOutcome("依頼を断り、仕事の継続と安全について相談する", "依頼を受けないと伝え、今後の身の安全や契約を誰に相談できるか確かめた。すぐに組織を離れられる保証はない。", { p: 2, h: -1 })
    ], { ge: { age: 21 } });
  career("car_kaz_armorless_choice_1097_major_blackout", "kaz_armorless", "カジミエーシュ",
    "大騎士領で通信と照明が不安定になり、担当区域の連絡が途切れた。上層から追加の指示はなく、暗がりの中で無理に動く危険もあった。",
    [
      normalOutcome("独断で進まず、最後に確認できた地点へ戻る", "連絡が戻るまで安全な位置にとどまり、確認できた情報だけを報告した。現場の混乱は続いていた。", { k: 2, p: 1 }),
      normalOutcome("身を隠し、通信が復旧するまで待つ", "不要な接触を避けて、最後に安全だった場所で待った。復旧後に状況の報告を求められた。", { h: 1, p: 1 })
    ], { ge: { year: 1097 }, le: { year: 1098 } });
  career("car_sir_police_choice_mafia_witness_protection", "sir_police", "シラクーザ",
    "裁判所へ出頭する証人の移動を頼まれた。予定していた経路で見慣れない車が何度も停まり、護衛の人員も限られている。",
    [
      normalOutcome("裁判所へ連絡し、経路と到着時刻を変更する", "独断で追跡を断定せず、裁判所と連絡を取りながら経路を変えた。証人は別の入口から入った。", { k: 2, p: 1 }),
      normalOutcome("人通りのある経路を選び、追加の護衛を要請する", "単独で抜けようとせず、通行人の多い場所を通ることにした。証人の到着を確認してから報告書を作った。", { h: -1, p: 1 })
    ]);
  career("car_sir_police_choice_nuova_volsinii_independence", "sir_police", "シラクーザ",
    "ヌオバ・ウォルシーニの行政窓口で、古い書類と新しい担当区域の記録が食い違っていた。住民はどの窓口へ行けばよいか分からず、列が伸びている。",
    [
      normalOutcome("確認できた担当先を掲示し、未決定の案件は保留する", "未確定の制度を言い切らず、決まっている窓口と連絡先を掲示した。住民は少なくとも、次に誰へ尋ねればよいか分かった。", { k: 2, rl: 1 }),
      normalOutcome("旧記録を保全し、住民の申立てを新旧両方へ送る", "食い違いのある書類を残し、申立てが失われないよう双方の担当へ写しを送った。", { k: 2, p: 1 })
    ], { ge: { year: 1099 }, le: { year: 1100 } });
  career("car_sie_obs_choice_1097_volcano_anomaly", "sie_obs", "シエスタ",
    "観測所の計器がいつもと違う揺れを示した。噴火と断定できる資料はないが、周辺の住民へどの時点で知らせるか、所内で意見が分かれた。",
    [
      normalOutcome("計器の異常と未確認点を区別して自治窓口へ報告する", "観測値、測定条件、まだ分からないことを分けて報告した。住民への知らせ方は自治窓口が検討することになった。", { k: 3, p: 1 }),
      normalOutcome("別の計器でも測定し、短時間の再観測を行う", "別の地点でも測り直し、同じ変化が出るか記録した。結論を出すにはさらに観測が必要だった。", { k: 2, h: -1 })
    ], { ge: { year: 1097 }, le: { year: 1098 } });
  career("car_sie_obs_choice_new_siesta_relocation", "sie_obs", "シエスタ",
    "移転後の観測所と旧市街の監視設備について、担当者から希望を聞かれた。どちらの配置にも必要な仕事があり、旧市街へ戻れる時期はまだ決まっていない。",
    [
      normalOutcome("新しい観測所の運用計画に加わる", "新設備の測定手順と記録方法を整えることにした。旧市街へ戻れる時期は決めず、状況を見ながら見直す。", { k: 2, p: 1 }),
      normalOutcome("旧火山の監視記録を引き継ぐ", "これまでの記録を整理し、無人観測設備の点検計画を提案した。危険が解消したとは扱わない。", { k: 3, p: 1 })
    ], { ge: { year: 1097 }, le: { year: 1100 } });
  career("car_lmd_guard_choice_1097_slum_defense", "lmd_guard", "龍門",
    "街区の封鎖線で、感染者家族の身元照会と立入記録が混乱していた。近衛局の指示は限定的で、住民の状況も一人ずつ異なる。",
    [
      normalOutcome("本人たちの申立てを記録し、担当部署へ照会する", "確認できた身元と本人の申立てを分けて記録し、担当部署へ送った。現場の判断は担当部署へ移り、家族は照会先からの返答を待つことになった。", { k: 2, p: 1 }),
      normalOutcome("封鎖線の安全を保ち、家族が相談先へ連絡できる時間を確保する", "その場の安全と規則を守りながら、家族が相談窓口へ連絡する時間を作った。", { p: 1, h: -1 })
    ], { ge: { year: 1096 }, le: { year: 1097 } });
  career("car_ibe_tuner_choice_1101_stultifera_resonance", "ibe_tuner", "イベリア",
    "沿岸設備の点検に、審問所の担当者と灯台守が集まった。沖合からの報告には聞き慣れない音が記されているが、現地の機器に異常があるかはまだ確認されていない。",
    [
      normalOutcome("装置の点検だけを行い、異音の原因は断定しない", "電源と接続部を調べ、確認できた不具合を記録した。沖合の報告は審問所へ引き継ぎ、点検班は安全な範囲にとどまった。", { k: 2, p: 1 }),
      normalOutcome("作業班を戻し、沿岸の状況が分かるまで再配置を待つ", "退路と連絡手段を確かめてから、作業班を戻した。現地の異変が収まったかどうかは分からない。", { p: 2, h: 1 })
    ], { ge: { year: 1101 }, le: { year: 1102 } });
  career("car_kje_karlan_choice_1099_trilock_snowstorm", "kje_karlan", "イェラグ",
    "雪崩で山道が塞がれ、線路の点検班から応援を求める連絡が届いた。対立する陣営の作業者も近くにいるらしいが、全員の所在は分かっていない。",
    [
      normalOutcome("連絡を取り、救助と退避の担当を分ける", "雪崩の斜面へ無理に入らず、連絡が取れた作業者から安全な場所へ誘導した。全員の安否は確認できず、捜索班へ情報を渡した。", { p: 2, h: -1 }),
      normalOutcome("線路の再開より、周辺の集落への物資運搬を優先する", "線路の復旧を急がず、迂回できる範囲で必要物資を運んだ。積雪が続く間は運行再開を見送ることになった。", { k: 1, rl: 1 })
    ], { ge: { year: 1098 }, le: { year: 1100 } });

  const civilianJobs = ["yan_court", "yan_tianshi", "hig_shinto", "hig_touhou", "urs_academy",
    "vic_scribe", "vic_works", "lei_court", "col_pioneer", "sam_priest", "kje_monk",
    "kazdel_bone", "ibe_tuner", "rim_eng", "min_orator"];
  const serviceJobs = ["yan_suis", "lmd_guard", "hig_samurai", "hig_ninja", "hig_cyber",
    "urs_officer", "urs_guard", "vic_infantry", "vic_royal", "lei_golden", "lat_executor",
    "lat_landen", "kaz_comp_knight", "kaz_armorless", "sir_soldier", "sir_police",
    "sar_guard", "sar_warrior", "sam_warrior", "kje_karlan", "kazdel_mil", "ibe_inq",
    "bol_soldier", "bol_dossoles", "min_champ"];
  const shadowJobs = ["lmd_black", "hig_ninja", "kaz_armorless", "sir_soldier"];
  careerRows.push({
    id: "car_regional_retire_civil_state_service",
    references: ["SRC_REGIONAL_CAREERS"],
    st: ["壮年", "老年"], ge: { age: 45 }, once: true, w: 0.32,
    t: "長く続けてきた専門職で、次の働き方を考える時期が来た。手元にはまだ任せられない仕事もあり、家計や体調も人それぞれだ。",
    show: s => civilianJobs.some(key => $terraData.regionalCareerOnDuty(s, key)),
    c: [
      normalOutcome("退職の手続きを進める", "職場へ区切りを申し出た。手当や退職後の収入は契約と制度の確認が必要で、すぐに受け取れる金額を決めつけなかった。", { job: 0, fl: { retired: 1 }, p: 2 }),
      normalOutcome("勤務日を減らせないか相談する", "現場の責任者に勤務日数の見直しを相談した。返事が出るまでは、今の契約の範囲で働くことにした。", { p: 1, h: 1 })
    ]
  });
  careerRows.push({
    id: "car_regional_retire_military_martial_service",
    references: ["SRC_REGIONAL_CAREERS"],
    st: ["壮年", "老年"], ge: { age: 40 }, once: true, w: 0.32,
    t: "勤め続けてきた治安・軍務・武門の現場で、今後の勤務について面談があった。退く時期や受け取れる給付は、所属先と本人の経歴によって違う。",
    show: s => serviceJobs.some(key => $terraData.regionalCareerOnDuty(s, key)),
    c: [
      normalOutcome("退役・退職の条件を書面で確かめる", "規則と自分の勤務記録を照らし、退役の条件を確認する手続きを始めた。承認前の給付は見込まず、返答を待つことにした。", { k: 2, p: 1 }),
      normalOutcome("訓練や後方業務への配置変更を相談する", "危険な現場から退く場合に、訓練や記録業務へ移れるか尋ねた。配置が決まるまでは現職の指示に従う。", { p: 1, h: 1 })
    ]
  });
  careerRows.push({
    id: "car_regional_retire_shadow_underworld_wash_hands",
    references: ["SRC_REGIONAL_CAREERS"],
    st: ["壮年", "老年"], ge: { age: 38 }, once: true, w: 0.28,
    t: "今の稼業を続けることに、以前より強い疲れを感じるようになった。ここを離れれば安全だという保証も、すぐに別の仕事が見つかる保証もない。",
    show: s => shadowJobs.some(key => $terraData.regionalCareerOnDuty(s, key)),
    c: [
      normalOutcome("危険な依頼を断り、正規の仕事を探す", "次の依頼は受けないと伝えた。住まいと生活費を確かめながら、安全に働ける求人を探すことにした。", { p: 2, k: 1 }),
      normalOutcome("今の契約の終了条件を確かめる", "一方的に姿を消すのでなく、契約の終了条件と未払いの記録を確かめた。しばらくは身辺に気を配る必要がある。", { k: 2, p: 1 })
    ]
  });
  careerRows.push({
    id: "car_regional_legacy_state_medal_ceremony",
    references: ["SRC_REGIONAL_CAREERS"],
    st: ["壮年", "老年"], ge: { age: 48 }, once: true, w: 0.28,
    t: "以前の仕事で使っていた記録帳を整理していると、地域の広報に経験者への聞き取り募集が載っていた。職務の記録が残っている範囲で協力できそうだった。",
    show: s => s.job === 0 && (s.lifeRecord?.careerChanges || []).some(change =>
      change.fromJobId >= 41 && change.fromJobId <= 82),
    c: [
      normalOutcome("自分が経験した範囲だけを話す", "見たことと、後から聞いたことを分けて話した。知らない制度や別の現場については、答えを作らずに残した。", { p: 2, k: 1 }),
      normalOutcome("資料を探してから返事をする", "記録帳と当時の書類を確かめ、曖昧な記憶をそのまま公表しないことにした。", { k: 2, p: 1 })
    ]
  });
  careerRows.push({
    id: "car_regional_legacy_apprentice_succeeds",
    references: ["SRC_REGIONAL_CAREERS"],
    st: ["壮年", "老年"], ge: { age: 45 }, once: true, w: 0.28,
    t: "以前の仕事で身につけた技術について、地域の講習会から話をしてほしいと依頼が来た。今の仕事や体調との両立を考え、どこまで引き受けるか決めることにした。",
    show: s => (s.lifeRecord?.skills || []).length >= 2,
    c: [
      normalOutcome("一度だけ講習を開き、現場の手順を伝える", "自分が経験した作業に範囲を絞って話し、うまくいかなかった例も伝えた。参加者が同じ技能を身につけたかどうかは、後のことになる。", { k: 2, rl: 1, p: 1 }),
      normalOutcome("資料を渡し、継続講習は引き受けない", "残っていた手順書を確認して渡した。毎週教える約束はせず、自分の予定を守った。", { k: 1, p: 1 })
    ]
  });
  careerRows.push({
    id: "car_regional_legacy_write_guild_chronicle",
    references: ["SRC_REGIONAL_CAREERS"],
    st: ["老年"], ge: { age: 52 }, once: true, w: 0.25,
    t: "長く使ってきた道具と記録帳を並べ、これまでの専門職の経験を書き留めた。職場で確かめた手順と、噂で聞いた話を同じ頁に混ぜないよう気をつけた。",
    show: s => (s.k || 0) >= 35 && (s.cr || 0) >= 8 &&
      ((s.lifeRecord?.careerChanges || []).some(change => change.fromJobId >= 41 && change.fromJobId <= 82) ||
        (s.job >= 41 && s.job <= 82)),
    c: [
      normalOutcome("確認できた手順を記録にして地域の資料室へ預ける", "個人的な記憶には注記を付け、後から照合できる資料だけを渡した。", { k: 2, p: 1 }),
      normalOutcome("家族や親しい人に読んでもらい、手元に残す", "記録を身近な人と読み返し、誤りに気づいた箇所を直してから保管した。", { k: 1, rl: 1 })
    ]
  });
  pushRows(careerRows);

  const factionActive = (s, ids) => (s.lifeRecord?.affiliations || []).some(row =>
    ids.includes(row.id) && ["active", "crisis"].includes(row.status));
  const crossRows = [];
  const cross = (id, show, t, c, opts = {}) => crossRows.push({
    id, references: opts.references || ["SRC_TERRA_LIFECOURSE"],
    st: opts.st || ["青年", "壮年"], once: true, ge: opts.ge || { age: 18 },
    le: opts.le, need: opts.need, w: 0.28, show, t, c
  });
  const activeRegional = key => s => $terraData.regionalCareerOnDuty(s, key);
  const factionJob = (s, jobs, orgId) => jobs.includes(s.job) &&
    (!orgId || $rules.affiliations.canWork(s, orgId));
  // CF-01..25: cross-organization contact and cooperation; no unearned transfer or secret clearance is granted.
  cross("sr_intersect_rhine_bsw_expedition_escort",
    s => factionJob(s, [35, 36, 37], "bsw-contract") && factionActive(s, ["rhine-lab"]),
    "調査班の移動計画と護衛側の安全条件が食い違った。採取を急ぐより、両方の責任者が同じ撤退条件を確認する必要がある。",
    [normalOutcome("作業範囲と中止条件を文書でそろえる", "測定できる範囲を区切り、異常が出た時の中止手順も共有した。計画の一部は延期になった。", { k: 2, p: 1 }),
      normalOutcome("護衛側の判断に合わせて調査を切り上げる", "安全条件がそろわないため、採取を見送って帰路についた。調査班には別日程を検討するよう伝えた。", { p: 1, h: 1 })],
    { references: ["SRC_BSW_PMC", "SRC_RHINE_LAB"] });
  cross("sr_intersect_bsw_to_rhine_defense_section",
    s => factionJob(s, [35, 36, 37], "bsw-contract"),
    "ライン生命の施設警備について、民間委託の照会が回ってきた。契約内容や常駐先は決まっておらず、まず業務範囲を確認する必要がある。",
    [normalOutcome("条件を聞き、正式な募集があれば応募する", "現行契約を確かめ、応募資格と募集状況を窓口へ照会した。雇用契約はそのまま、返答を待つことになった。", { k: 1, p: 1 }),
      normalOutcome("今の現場を優先し、照会だけ返す", "契約の都合で今回の照会は見送った。次の機会があるかは分からない。", { p: 1 })],
    { references: ["SRC_BSW_PMC", "SRC_RHINE_LAB"] });
  cross("sr_intersect_rhine_to_bsw_bprs_specialist",
    s => factionJob(s, [38, 39, 40], "rhine-lab"),
    "BSWから、研究施設の危機対応について技術者の意見を求められた。現場へ出るのか、資料だけを渡すのか、所属先と調整が必要だった。",
    [normalOutcome("公開可能な安全資料だけを提供する", "機密や個人情報を含まない範囲で、機器の停止手順と注意点を伝えた。出向や採用の話には進まなかった。", { k: 2, p: 1 }),
      normalOutcome("所属先へ確認し、日程が合う範囲で説明会に出る", "上司の承認を得たうえで説明会に参加した。技術上の質問には答えたが、契約条件は別途の話になった。", { k: 2, rl: 1 })],
    { references: ["SRC_BSW_PMC", "SRC_RHINE_LAB"] });
  cross("sr_intersect_rhodes_rhine_ifrit_case_seminar",
    s => factionJob(s, [30, 31, 32, 33, 34], "rhodes-staff") && factionActive(s, ["rhine-lab"]),
    "診療記録をめぐる合同検討会で、研究側が求める情報と、患者本人が共有に同意した範囲を照合する役目を頼まれた。",
    [normalOutcome("本人の同意と匿名化を確認してから議題を出す", "必要な範囲の記録だけが扱われ、同意のない情報は資料から外された。結論は診療担当へ戻された。", { k: 2, p: 1 }),
      normalOutcome("今回は資料を持ち込まず、論点だけを共有する", "個別情報の持ち出しを避け、検討したい課題だけを一般化して説明した。", { p: 1, k: 1 })],
    { references: ["SRC_RHINE_LAB"] });
  cross("sr_intersect_bsw_reunion_convoy_standoff",
    s => factionJob(s, [35, 36, 37], "bsw-contract") &&
      factionActive(s, ["reunion-1096", "reunion-reorg", "reunion-relief"]),
    "輸送路で、互いの所属が異なる一団と同じ検問所を使うことになった。依頼主からは荷の受渡しだけが指定され、相手の意図は分からない。",
    [normalOutcome("書面にある品目と受渡し場所だけを確認する", "荷札と数量を照らし合わせ、契約外の情報を求めないまま作業を終えた。", { k: 1, p: 1 }),
      normalOutcome("危険を感じ、依頼主へ報告して現場を離れる", "接触を広げず、見たことだけを報告して現場を離れた。輸送は別の手段で続けると連絡があった。", { p: 1, h: 1 })],
    { references: ["SRC_BSW_PMC", "SRC_REUNION_HISTORY"] });
  cross("sr_intersect_rhodes_bsw_franka_liskarm_training",
    s => factionJob(s, [30, 31, 32, 33, 34], "rhodes-staff"),
    "訓練施設の予定表に、外部警備担当との合同練習が加わった。相手の装備や経験は異なるため、実戦を模した勝敗より連絡手順の確認が中心だった。",
    [normalOutcome("合図と退避経路を確かめる訓練に参加する", "互いの合図を確認し、停止の声が聞こえたら全員が動きを止める手順を練習した。", { k: 1, h: -1 }),
      normalOutcome("見学者として記録を取り、改善点を渡す", "安全係の位置や連絡の遅れを記録し、終わってから担当者へ共有した。", { k: 2 })],
    { references: ["SRC_BSW_PMC"] });
  cross("sr_intersect_lgd_to_rhodes_liaison", activeRegional("lmd_guard"),
    "龍門近衛局とロドスの連絡担当が、感染者支援をめぐる窓口の違いを確認していた。現場で見た制度の差を、どこまで共有するか尋ねられた。",
    [normalOutcome("個人が特定されない形で手続きの違いを伝える", "住民の名前を伏せ、窓口や必要書類の違いだけを説明した。協力関係が続くかは今後の判断に委ねられた。", { k: 2, p: 1 }),
      normalOutcome("正式な照会が来るまで回答を控える", "記録の持ち出しを避け、正式な照会手続きを案内した。", { p: 1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_laterano_executor_rhodes_mission",
    activeRegional("lat_executor"),
    "公証人役場の任務で、医療品の引渡し記録をロドス側と照合することになった。受領者の名前を含む書類が混在している。",
    [normalOutcome("受領の事実だけを照合し、個人情報は封じる", "数量と受領時刻だけを確認し、個人情報を含む書類は担当者へ戻した。", { k: 2, p: 1 }),
      normalOutcome("書類の分類が終わるまで引渡しを待つ", "誤配を避けるため、帳票が整理されるまで署名を保留した。", { k: 1, p: 1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_kazimierz_knight_to_rhodes_or_bsw",
    activeRegional("kaz_comp_knight"),
    "競技の警備と医療支援で、ロドスの担当者から業務経験を尋ねられた。雇用の勧誘ではなく、過去の契約と現在の希望を確かめる面談だった。",
    [normalOutcome("契約を続けながら、短期協力の条件を確認する", "本業の雇用主へ確認が必要だと伝え、日程と責任範囲を持ち帰った。", { k: 1, p: 1 }),
      normalOutcome("長期の転職を考え、募集条件だけ聞く", "今の契約を終える意思はまだ示さず、応募資格と待遇を尋ねた。", { k: 1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_sami_warrior_rhine_expedition",
    activeRegional("sam_warrior"),
    "雪原の調査隊が、道を見失った作業班の所在を尋ねてきた。位置情報は古く、現在の天候も急に変わり始めている。",
    [normalOutcome("最後に確認できた道筋と天候を伝える", "自分が確認した範囲だけを伝え、確かめていない地点を安全だとは言わなかった。調査隊は進むか引くかを改めて決めることになった。", { k: 1, h: -1 }),
      normalOutcome("現地案内の範囲を区切り、引返し時刻を決める", "案内できる地点と戻る時刻を決めた。無理に奥へ入らず、連絡が途切れた時の集合場所も共有した。", { p: 1, h: -1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_iberia_inquisitor_rhodes_abysmal",
    activeRegional("ibe_inq"),
    "ロドスの医療担当が、沿岸で見つかった負傷者の搬送先を相談してきた。審問所の確認が必要な物品もあり、治療と調査の手順が交差している。",
    [normalOutcome("治療の同意を確認し、必要な引継ぎだけ行う", "本人の治療意思を確かめ、調査対象の物品とは分けて医療担当へ引き継いだ。", { p: 2, k: 1 }),
      normalOutcome("審問所内の担当部署へ照会してから返答する", "現場で権限を越えず、担当部署の回答を待つことにした。搬送先は医療側が別に確保した。", { k: 1, p: 1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_kazdel_commission_to_reunion_or_rhodes",
    activeRegional("kazdel_mil"),
    "カズデルの戦闘が続く中、別の生き方を探す人から相談を受けた。ロドスやレユニオンの受入れ条件は時期と本人の経歴によって異なり、すぐに答えられるものではない。",
    [normalOutcome("安全な連絡先と、正式な募集・相談窓口を確かめる", "具体的な加入を約束せず、本人が安全に相談できる連絡方法を一緒に確認した。", { k: 1, p: 1 }),
      normalOutcome("自分の所属先へ相談し、本人の意思を確認する", "本人の同意なしに名前を渡さず、まず自分の所属先へ相談の可否を確かめた。", { p: 1 })],
    { references: ["SRC_REGIONAL_CAREERS", "SRC_REUNION_HISTORY"] });
  cross("sr_intersect_rim_engineer_to_rhine_or_rhodes",
    activeRegional("rim_eng"),
    "設備の修理記録を見たロドスの担当者から、部品の耐久性について質問が届いた。作業場所や所有者が異なるため、図面の共有範囲を決める必要がある。",
    [normalOutcome("一般化した測定値と交換手順を共有する", "顧客情報と未公開図面は外し、交換周期の測定方法だけを伝えた。", { k: 2, p: 1 }),
      normalOutcome("所有者の許可を得てから詳細を返す", "記録を持つ相手の許可が必要だと説明し、返答を保留した。", { k: 1, p: 1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_bolivar_dossoles_bsw_holiday",
    activeRegional("bol_dossoles"),
    "市街の催しに合わせた警備計画で、外部の請負人と配置図を照らし合わせることになった。担当区域と緊急時の連絡先が一致しているか確認が必要だった。",
    [normalOutcome("配置の重複と連絡先だけを確認する", "互いの持ち場と連絡先を確かめ、一般客の導線に重なる箇所を修正した。", { k: 1, p: 1 }),
      normalOutcome("変更点を書面にして責任者の承認を待つ", "現場の判断で配置を変えず、修正案を責任者へ提出した。", { k: 2 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_yan_suis_rhodes_feranmut_file",
    activeRegional("yan_suis"),
    "ロドスの調査担当から、古い記録にある地鳴りの記述について照会が届いた。作中で確かめられた記録と伝承を分けて返答する必要がある。",
    [normalOutcome("記録の出典と伝聞の区別を付けて返す", "原資料にある記述だけを引用し、解釈や伝承は別欄に分けた。未確認の原因は断定しなかった。", { k: 2, p: 1 }),
      normalOutcome("機密に触れる可能性があるため、照会先を紹介する", "自分の権限で答えられない部分を説明し、正式な照会先へ案内した。", { k: 1, p: 1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_higashi_cyber_rhine_ai_firewall",
    activeRegional("hig_cyber"),
    "研究所の端末記録に、不審な接続が残っていると連絡が来た。侵入や攻撃と断定できる証拠はなく、まず保全と切り分けを行う必要がある。",
    [normalOutcome("通信記録を複製し、端末を隔離して調査に回す", "記録を保全して端末をネットワークから外した。原因を確かめるまでは、攻撃者や目的を決めつけない。", { k: 2, p: 1 }),
      normalOutcome("担当者へ通知し、追加の権限を使わず待機する", "権限を越えた操作を避け、責任者が来るまで接続状況を記録した。", { k: 1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_ursus_guard_secret_reunion_pass",
    activeRegional("urs_guard"),
    "検問所で、拘束中の感染者が医療相談を求めた。規則、本人の安全、負傷の有無を確かめ、誰に連絡するか判断しなければならない。",
    [normalOutcome("医療担当を呼び、本人の申立てを記録する", "規定の連絡先へ医療担当を要請し、本人が話した内容をそのまま記録した。身柄の扱いは担当部署の判断に残された。", { p: 1, k: 1 }),
      normalOutcome("引継ぎ時刻と担当者を記録して、独断の移送を避ける", "個人で拘束を解いたり移送したりせず、引継ぎの記録を残した。", { k: 1, p: -1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_kazdel_bonesmith_rhodes_prosthetics",
    activeRegional("kazdel_bone"),
    "ロドスの技師から、装具の修理について相談された。患者の身体寸法や診療情報は本人の許可なしに受け取れず、まず必要な仕様だけを確認した。",
    [normalOutcome("患者の同意を得た寸法と、装具の接続条件だけを見る", "必要な測定範囲を本人へ説明し、同意を得た情報だけを確認した。修理後の使い心地は本人に確かめてもらうことにした。", { k: 2, p: 1 }),
      normalOutcome("一般的な修理手順を伝え、個別情報は受け取らない", "機密性のある記録を受け取らず、一般的な接合方法と注意点だけを伝えた。", { k: 1, p: 1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_minos_orator_infected_amnesty_bill",
    activeRegional("min_orator"),
    "感染者支援の請願について、ロドスの担当者が制度上の困りごとを聞き取りたいと申し出た。個別の体験をどう扱うか、相談者の同意を確かめる必要がある。",
    [normalOutcome("公開してよい論点だけを匿名でまとめる", "本人が公開に同意した範囲だけを匿名で整理した。政策が変わるとは約束せず、請願の手続きへ引き継いだ。", { k: 2, p: 1 }),
      normalOutcome("本人が望まない情報は共有しない", "困りごとの概要だけを伝え、個人の記録は持ち出さないことにした。", { p: 1, rl: 1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_sargon_padishah_guard_rhine_relics",
    activeRegional("sar_guard"),
    "調査隊が遺跡とされる場所への通行許可を求めてきた。土地の管理者が誰か、何を持ち出す予定かは申請書だけでは分からなかった。",
    [normalOutcome("土地の権利者と許可範囲を確認してから返答する", "案内できる範囲と許可の必要な場所を分けて伝えた。調査隊は書類が整うまで現地へ入らなかった。", { k: 1, p: 1 }),
      normalOutcome("安全な既知の道だけ案内する", "正確に知っている道順だけを伝え、遺物や資源の採取には関わらなかった。", { p: 1 })],
    { references: ["SRC_REGIONAL_CAREERS"] });
  cross("sr_intersect_general_transporter_to_rhodes_or_bsw",
    s => s.job === 16,
    "輸送の仕事を終えたあと、ロドスとBSWの担当者から募集資料を渡された。移籍を決めるには、現在の契約を確認しなければならない。",
    [normalOutcome("募集条件を持ち帰り、契約の満了時期を確認する", "募集資料を受け取ったが、その場で応募は決めなかった。現在の契約と必要な資格を確認することにした。", { k: 1 }),
      normalOutcome("今の取引先を優先し、今回は見送る", "現行の輸送契約を続けるため、今回は応募しないと伝えた。", { p: 1 })]);
  cross("sr_intersect_civilian_doctor_to_rhodes_or_rhine",
    s => [4, 10].includes(s.job),
    "医療職向けの説明会で、ロドスとライン生命の担当者がそれぞれ異なる募集条件を紹介した。患者情報の持ち出しは認められず、転職の判断も本人に委ねられている。",
    [normalOutcome("条件を比べ、患者情報を含まない経歴書を用意する", "担当した仕事と資格だけを記し、患者の個人情報は応募資料から外した。応募先は後日決めることにした。", { k: 1, p: 1 }),
      normalOutcome("現在の職場に残り、研修資料だけ受け取る", "すぐの転職は選ばず、公開されている研修情報だけを受け取った。", { k: 1 })]);
  cross("sr_intersect_kazimierz_arena_staff_to_knight_manager",
    s => s.job === 32 && factionActive(s, ["kazimierz-arena-staff"]),
    "競技場の運営と競技者の契約条件について、複数の担当者が同じ会議に集まった。記録の食い違いが一つあり、本人の確認なしに補うことはできない。",
    [normalOutcome("契約当事者に確認し、食い違いを議事録へ残す", "競技者本人と契約担当へ確認を求め、未確定の項目は空欄のまま残した。", { k: 2, p: 1 }),
      normalOutcome("会場の安全運営に議題を絞る", "契約上の判断は担当部署へ戻し、会場の導線と救護手順の確認に集中した。", { k: 1, p: 1 })]);
  cross("sr_intersect_ursus_zelgrad_worker_to_reunion_1101",
    s => s.res?.n === "ウルサス" && s.local?.city === "ゼルグラード" &&
      factionActive(s, ["ursus-zelgrad-factory"]),
    "1101年、工場の休憩所で、再編レユニオンに連なる人たちが仕事や住まいの相談先を案内していた。今後の活動や受入れ条件を一人で決めつけず、公開されている情報だけを確かめることにした。",
    [normalOutcome("相談先と公開された条件だけを確かめる", "窓口と手続きの情報を持ち帰った。加入や移転を決めたわけではなく、家族とも話し合うことにした。", { k: 1, p: 1 }),
      normalOutcome("案内だけ受け取り、今の仕事を続ける", "情報を受け取ったうえで、今回は面談を申し込まなかった。", { p: 1 })],
    { ge: { year: 1101 }, le: { year: 1101 }, references: ["SRC_REUNION_HISTORY", "SRC_TERRA_LIFECOURSE"] });
  cross("sr_intersect_four_factions_catastrophe_summit",
    s => factionJob(s, [30, 31, 32, 33, 34], "rhodes-staff") ||
      factionJob(s, [35, 36, 37], "bsw-contract") ||
      factionJob(s, [38, 39, 40], "rhine-lab") ||
      factionActive(s, ["reunion-1096", "reunion-reorg", "reunion-relief"]),
    "天災への備えを話し合う会合で、異なる組織の担当者が避難路や物資の受渡しを確認した。議事録には組織ごとの懸念と保留事項が残った。",
    [normalOutcome("自分の担当範囲と連絡先を記録する", "決まった事項と保留された事項を分けて記録し、自分の組織へ持ち帰った。", { k: 2, p: 1 }),
      normalOutcome("実施できる小さな協力だけを提案する", "輸送時刻や救護所の場所など、合意しやすい項目に限って提案した。", { k: 1, rl: 1 })]);
  pushRows(crossRows);

  const historicalRows = [];
  const history = (id, flag, year, le, regions, t, c, opts = {}) => historicalRows.push({
    id, references: opts.references || ["SRC_TL_LATE"],
    st: ["児童", "少年", "青年", "壮年", "老年"],
    ge: { year }, le: { year: le || year }, once: true, w: 0.32,
    need: opts.need,
    show: s => (!regions || regions.includes(s.res?.n)) &&
      (!opts.city || s.local?.city === opts.city) &&
      (opts.job == null || s.job === opts.job) &&
      (!flag || !!s.world?.events?.[flag]),
    t, c
  });
  // HE-01..25: use public history flags where available; source-backed local notes stay bounded by year, region, and personal eligibility.
  history("hist_exp_1019_columbia_independence_dawn", "columbia_independence", 1019, 1021, ["クルビア"],
    "クルビアの広場に、新しい自治を知らせる布告が貼られた。周囲では期待と不安の声が入り混じり、役所の窓口にも土地や仕事の相談が集まっている。",
    [normalOutcome("急いで決めず、必要な登録条件を調べる", "書類と費用を確認してから、登録するか決めることにした。街の先行きはまだ見えなかった。", { k: 1, p: 1 }),
      normalOutcome("使える資材を修理し、近所の仕事を手伝う", "制度の行方を待つ間、壊れた道具や建材を直す仕事を引き受けた。", { cr: 1, p: 1 })],
    { references: ["SRC_TL_1000_1061"] });
  history("hist_exp_1031_four_emperors_war_gaul_refugees", "four_emperors_war", 1031, 1033, ["ヴィクトリア", "リターニア", "ウルサス"],
    "街の宿や工房に、国境を越えてきた人たちが身を寄せていた。どこから来たかを尋ねる声もあれば、仕事を分け合えないと不満を言う人もいる。",
    [normalOutcome("近隣の支援窓口と仕事の掲示を案内する", "自分が知っている範囲の連絡先を伝えた。住まいや雇用が見つかったかは、その後の話である。", { p: 1, rl: 1 }),
      normalOutcome("今の仕事を続け、余分な食料だけ分ける", "大きな約束はできないため、余裕のある分だけ食料を渡した。", { p: 1 })],
    { references: ["SRC_TL_1000_1061"] });
  history("hist_exp_1031_kazdel_commission_birth", "kazdel_commission_founded", 1031, 1032, ["カズデル"],
    "広場に新しい軍の登録所が設けられ、再建のための人手も募られていた。家族の備えを優先したい人と、共同作業に加わりたい人の声が並んでいる。",
    [normalOutcome("必要な労役と契約条件を確かめる", "責任者に期間と危険の範囲を尋ね、返事を聞いてから加わるか決めた。", { k: 1, p: 1 }),
      normalOutcome("家族と食料や連絡手段を確認する", "すぐに登録所へ行かず、家族と備蓄や避難先を話し合った。", { k: 1, p: 1 })],
    { references: ["SRC_TL_1000_1061"] });
  history("hist_exp_1038_iberia_great_silence", "great_silence", 1038, 1039, ["イベリア"],
    "港からの便が減り、沿岸の店では仕入れ先を確かめる張り紙が増えた。異変の原因について様々な話が流れていたが、街の人々に分かることは限られていた。",
    [normalOutcome("荷を内陸へ移す支援に加わる", "確かな行先のある荷だけを運び、帳面に宛先を残した。海の異変が収まったかは分からない。", { h: -1, p: 1 }),
      normalOutcome("店の在庫を数え、近所と分け方を決める", "仕入れの見通しがない品を一人で抱えず、近所の店主と在庫を確かめた。", { k: 1, rl: 1 })],
    { references: ["SRC_TL_1000_1061"] });
  history("hist_exp_1040_siracusa_sicilia_unification", "siracusa_unification", 1040, 1042, ["シラクーザ"],
    "街の通りで、商売のやり方が変わるという話が聞こえてきた。新しい境界や取り決めは人づてに伝わることも多く、誰の説明が正しいか見極める必要があった。",
    [normalOutcome("複数の店主に話を聞き、契約を急がない", "確かな条件が分かるまで、新しい相手との契約を保留した。店の帳面はいつも通り付け続けた。", { k: 1, p: 1 }),
      normalOutcome("自分の商売に関係する規則だけ確認する", "聞きかじった噂に頼らず、自分の許可と仕入れに関わる窓口へ尋ねた。", { k: 2 })],
    { references: ["SRC_TL_1000_1061"] });
  history("hist_exp_1048_bolivar_civil_war_outbreak", "bolivar_civil_war", 1048, 1050, ["ボリバル"],
    "移動の検問が増え、仕事先の連絡も予定どおり届かなくなった。どの陣営が優勢かより、家族が今夜どこで休めるかが差し迫った問題になっている。",
    [normalOutcome("家族の連絡先と退避先を確かめる", "連絡が途切れた時の集合場所を決め、必要な薬や書類を一つの袋にまとめた。", { k: 1, p: 1 }),
      normalOutcome("救護や運搬の募集元を確かめてから参加する", "身元と仕事内容を確認できた募集だけを選び、危険な場所へ単独で入らないことにした。", { k: 1, p: 1 })],
    { references: ["SRC_TL_1000_1061"] });
  history("hist_exp_1062_tenth_ursus_kazimierz_war", "tenth_ursus_kazimierz_war", 1062, 1063, ["ウルサス", "カジミエーシュ"],
    "駅に軍用列車が入り、街の掲示板には物資の供出や臨時の仕事が並んだ。戦況の詳細は分からなくても、運賃や食料の値が動き始めている。",
    [normalOutcome("救護所の募集を確かめ、できる時間だけ手伝う", "必要な持ち物と担当者を確認し、短い時間だけ荷運びを手伝った。", { p: 1, h: -1 }),
      normalOutcome("家計を見直し、仕事の追加は引き受けない", "先の収入が読めないため、必要な出費を記録して無理な勤務を避けた。", { k: 1, p: 1 })],
    { references: ["SRC_TL_1000_1061"] });
  history("hist_exp_1072_bloodpeak_victorian_crown", "bloodpeak_and_victorian_crown", 1072, 1073, ["ヴィクトリア", "カジミエーシュ", "ウルサス"],
    "遠くの戦いと王家をめぐる知らせが、新聞や駅の掲示で繰り返し伝えられた。内容には食い違いもあり、交易の予定や通行の安全に影響が出ている。",
    [normalOutcome("確かな通行情報が出るまで、出張を延期する", "噂だけで危険な道へ向かわず、運行と通行の公式連絡を待った。", { k: 1, p: 1 }),
      normalOutcome("食料や燃料の在庫を確認する", "次の便がいつ届くか分からないため、買い占めはせず、家で必要な分を数え直した。", { k: 1 })],
    { references: ["SRC_TL_1000_1061"] });
  history("hist_exp_1074_ursus_great_rebellion", "ursus_great_rebellion", 1074, 1075, ["ウルサス"],
    "街の検問が増え、夜には遠くで銃声が聞こえることがあった。誰が何を始めたのか、近所の人にも確かなことは分からない。",
    [normalOutcome("家族と近隣で連絡方法を確認する", "灯りを消す時間と、離ればなれになった時の集合先を決めた。外へ出る用事は明るいうちに済ませた。", { p: 1, rl: 1 }),
      normalOutcome("怪我人を見つけた時の連絡先だけ調べる", "独断で匿う約束はせず、近くの診療所や救護先を確かめた。", { k: 1, p: 1 })],
    { references: ["SRC_TL_1000_1061"] });
  history("hist_exp_1075_rim_billiton_independence_jubilee", "rim_billiton_independence", 1075, 1077, ["レム・ビリトン"],
    "職場の掲示板に、自治や鉱業の運営に関する新しい説明会の日程が貼られた。制度の変更が実際の賃金や安全にどう影響するかは、まだ分からない。",
    [normalOutcome("説明会に参加して、雇用と安全の条件を聞く", "自分の職場に関わる条件を質問し、分かったことだけを同僚へ伝えた。", { k: 2, p: 1 }),
      normalOutcome("組合や仲間の記録を読み、判断を急がない", "説明会を見送り、契約書と職場の規則を読み直した。", { k: 1, p: 1 })],
    { references: ["SRC_TL_1000_1061"] });
  history("hist_exp_1077_chernobog_research_incident_rumor", "sarcophagus_purge", 1077, 1077, ["ウルサス"],
    "チェルノボーグの研究施設で血なまぐさい事件があったらしいと、小声の噂が街に広がっていた。詳しいことを尋ねても、住民は口を閉ざすばかりだった。",
    [normalOutcome("戸締まりを確かめ、家族と室内で過ごす", "外の情報を確かめようとせず、戸締まりをして家族のそばにいた。夜の間、通りの足音は途切れなかった。", { p: 1, rl: 1 }),
      normalOutcome("噂を広めず、知っている窓口の案内だけ確かめる", "何が起きたかを推測で補わず、普段利用している窓口の開設状況だけを確認した。", { k: 1, p: 1 })],
    { city: "チェルノボーグ", references: ["SRC_TL_EARLY", "SRC_URSUS_EP17_1"] });
  history("hist_exp_1077_leithanien_twin_empresses_bells", "leith_revolution", 1077, 1078, ["リターニア"],
    "街の政変を知らせる鐘が鳴ったあと、店や公共施設では営業時間の変更が貼り出された。誰が新しい規則を担うのか、窓口の案内も追いついていない。",
    [normalOutcome("変更された手続きだけを窓口で確認する", "噂に頼らず、自分の仕事や通行に関わる変更点を担当窓口で確かめた。", { k: 1, p: 1 }),
      normalOutcome("家族と帰宅経路を決め、夜の外出を控える", "行き先を増やさず、混乱が落ち着くまで家族と過ごした。", { p: 1, rl: 1 })],
    { references: ["SRC_TL_EARLY"] });
  history("hist_exp_1081_vanya_grand_duke_assassination", "vanya_assassination", 1081, 1082, ["ウルサス"],
    "大公暗殺の知らせの後、街頭で身分証の提示を求められる回数が増えた。何が原因かは説明されず、長く屋外で待たされる人もいる。",
    [normalOutcome("用件を済ませたら、帰宅して近隣の様子を伝える", "必要な書類を見せて用件を終え、帰り道に見た混雑だけを家族へ知らせた。", { p: 1, k: 1 }),
      normalOutcome("食料と防寒具を持ち、待ち時間に備える", "呼び出しが長引いても体を冷やさないよう、食料と上着を用意した。", { h: 1, k: 1 })],
    { references: ["SRC_TL_EARLY"] });
  history("hist_exp_1086_dossoles_neon_reopening", "el_sol_renamed_dossoles", 1086, 1088, ["ボリバル"],
    "エル・ソルと呼ばれていた街の名前が変わり、商店街に新しい看板が増えた。観光客向けの商売が目立つ一方、古い区画の修繕は遅れている。",
    [normalOutcome("新しい仕事の条件を確かめてから応募する", "求人票の賃金と期間を確かめ、応募書類を窓口へ渡した。返事は後日受け取ることになった。", { k: 1, p: 1 }),
      normalOutcome("住民向けの修繕仕事を引き受ける", "通りの修理を手伝い、近所の店が営業を続けられるよう資材を運んだ。", { cr: 1, rl: 1 })],
    { city: "ドッソレス", references: ["SRC_TL_EARLY", "SRC_COMMUNITY_DOSSOLES_HISTORY", "SRC_BOLIVAR_DOSSOLES_STORY"] });
  history("hist_exp_1086_kazdel_local_conflict_choices", "kazdel_conflict_started", 1086, 1087, ["カズデル"],
    "カズデルで衝突が広がり、知人たちの間でもこれからの暮らしをどうするか意見が分かれていた。行き先や陣営を決めつけず、家族と連絡方法を確かめることにした。",
    [normalOutcome("旗色を決める前に、家族と安全な連絡先を確認する", "誰の考えも代わりに決めず、離れて暮らす家族と連絡を取る方法を決めた。", { p: 1, k: 1 }),
      normalOutcome("負傷者が来た時の水と寝床を用意する", "政治的な立場を問わず、近所でできる範囲の応急支援を整えた。", { p: 1, rl: 1 })],
    { references: ["SRC_TL_EARLY", "SRC_KAZDEL_BB5"] });
  history("hist_exp_1088_higashi_sakusagawa_cyber_blackout", null, 1088, 1089, ["極東"],
    "鎖川の一部で通信と配電が不安定になり、手動の案内板が駅や市場に置かれた。原因については複数の説明が流れているが、住民が確かめられる情報は少ない。",
    [normalOutcome("紙の掲示と現地係員の案内に従う", "自動表示を鵜呑みにせず、係員へ行き先を確認してから移動した。", { k: 1, p: 1 }),
      normalOutcome("家族への連絡を優先し、移動を控える", "連絡が戻るまで遠出を避け、今いる場所と帰宅予定を家族へ知らせた。", { p: 1, rl: 1 })],
    { references: ["SRC_HIGASHI_CAREERS"] });
  history("hist_exp_1092_columbia_courier_contract_change", null, 1092, 1093, ["クルビア"],
    "運送の依頼書に、いつもと違う荷受人と経由地が記されていた。事情を尋ねても返事は曖昧で、まず契約と届け先の確かさを確かめることにした。",
    [normalOutcome("依頼元に変更を正式確認してから受ける", "確認できた依頼内容を記録し、荷を指定先へ運んだ。契約が今後どう続くかは、相手との話し合いに残された。", { k: 1, p: 1 }),
      normalOutcome("名義が一致しないので、荷渡しを保留する", "説明が一致しないまま運ばず、契約書にある受取人へ照会した。配送は遅れたが、確認できるまで荷は手元に置いた。", { p: 1, cr: 1 })],
    { references: ["SRC_REGIONAL_CAREERS", "SRC_TERRA_LIFECOURSE"], job: 16 });
  history("hist_exp_1094_kazdel_theresia_fall_mourning", "thelazia_dead", 1094, 1095, ["カズデル", "ヴィクトリア"],
    "テレジアの死と軍の移動を知らせる声が、各地から届き始めた。何を信じるべきか分からず、街では夜間の往来を控える人が増えている。",
    [normalOutcome("家族と移動先を相談し、決定は保留する", "移動の必要性を急いで決めず、連絡先と持ち出す書類だけを確認した。", { k: 1, p: 1 }),
      normalOutcome("身近な人の消息を確かめる", "知らせが届いた範囲だけを頼りに、知人の無事を問い合わせた。返事がない人の状況は分からないままにした。", { rl: 1, p: 1 })],
    { references: ["SRC_TL_EARLY"] });
  history("hist_exp_1097_kazimierz_24th_major_fever", "kazimierz_major", 1097, 1097, ["カジミエーシュ"],
    "大騎士競技の会期が近づき、宿や食堂の営業時間が延びていた。競技の勝敗だけでなく、感染者騎士の参加をめぐる議論も街の掲示板に並んでいる。",
    [normalOutcome("会場の案内や救護の仕事を手伝う", "来場者の案内を手伝い、体調の悪い人がいれば救護所へつないだ。大会の規則が変わったかどうかは分からない。", { p: 1, rl: 1 }),
      normalOutcome("屋台の臨時仕事を受ける", "勤務時間と支払いを確認してから臨時の仕事を引き受けた。", { p: 1, h: -1 })],
    { references: ["SRC_TL_MIDDLE"] });
  history("hist_exp_1097_siesta_volcano_evacuation", "siesta_disaster", 1097, 1098, ["シエスタ"],
    "シエスタの移転計画が掲示され、住民は家財の運び方や新しい通勤先を尋ねていた。旧市街をいつまで使えるかは、案内ごとに説明が異なる。",
    [normalOutcome("補償や荷物運搬の条件を窓口で確認する", "移転先を決める前に、運搬費用と申し込み期限を確認した。すぐに契約を結ぶことはしなかった。", { k: 1, p: 1 }),
      normalOutcome("近隣の高齢者へ、荷造りを手伝える日を尋ねる", "本人の希望と運べる量を確かめてから、荷造りを手伝った。移転を決めたかどうかはそれぞれに任せた。", { h: -1, rl: 1 })],
    { references: ["SRC_TL_MIDDLE"] });
  history("hist_exp_1099_laterano_travelers_rumor", "world_1099", 1099, 1099, ["ラテラーノ"],
    "旅商人が、遠い国境や開拓地、海辺の町で不穏な騒ぎが続いていると話していた。宿場ごとに地名や時期が食い違い、どこまで本当かは確かめられない。",
    [normalOutcome("自分の用事に関わる通行情報だけ確かめる", "使う道について、係員に現在の案内を尋ねた。聞いた噂を確かな情報として広めることはしなかった。", { k: 1, p: 1 }),
      normalOutcome("話を持ち帰り、家族と備えを相談する", "出どころの曖昧な話は伝聞と分かるようにして、備蓄や連絡先を家族と確かめた。", { p: 1, rl: 1 })],
    { references: ["SRC_TL_LATE"] });
  history("hist_exp_1099_kjerag_travelers_rumor", "world_1099", 1099, 1100, ["イェラグ"],
    "行商人が、遠い国境や開拓地、海辺の町で検問や通行が変わったらしいと話していた。話す人ごとに時期や場所は違い、イェラグの外のことを確かめる手段はなかった。",
    [normalOutcome("聞いた範囲と確かめた情報を分けて記録する", "行商人の話は伝聞として書き留め、暮らしに必要な連絡先は別に確認した。", { k: 1, p: 1 }),
      normalOutcome("噂を広めず、身近な人の予定だけ確かめる", "他国の事情は断定せず、家族や近所の人と今日の用事を確かめた。", { p: 1, rl: 1 })],
    { references: ["SRC_TL_LATE"] });
  history("hist_exp_1101_sankt_griffaburg_student_katorga", "katorga_incident", 1101, 1102, ["ウルサス"],
    "大学周辺で抗議の声が上がり、憲兵の車両が通りを塞いだ。誰が連れて行かれたか、住民には確かめられない。窓口も問い合わせに答えていなかった。",
    [normalOutcome("見た時刻と場所だけ記録し、家族の問い合わせ先を探す", "名簿に名前を推測で書かず、実際に見たことと時刻だけを残した。後から問い合わせる窓口を探した。", { k: 2, p: 1 }),
      normalOutcome("外出を控え、家族の所在を確かめる", "自宅の戸締まりを確かめ、連絡が取れる家族と今いる場所を確認した。", { p: 1, rl: 1 })],
    { city: "サンクト・グリファーブルク", references: ["SRC_TL_LATE", "SRC_URSUS_PAA_SYNOPSIS"] });
  history("hist_exp_1101_iberia_distant_sea_rumor", "world_1101", 1101, 1102, ["イベリア"],
    "旅人から、近海の黒い潮や北方の防壁で異変があったらしいと聞いた。話す人ごとに時期や場所が違い、海の向こうのことを確かめる術はなかった。",
    [normalOutcome("聞いた内容を伝聞として残し、出どころを確かめる", "確かめられた連絡だけを頼りにし、噂の部分は聞いた相手と一緒に記録した。", { k: 1, p: 1 }),
      normalOutcome("夜の海岸へ近づかず、必要な用事を昼に済ませる", "何が起きたかは分からないまま、念のため日中に用事を済ませて帰った。", { p: 1, h: 1 })],
    { references: ["SRC_TL_LATE"] });
  history("hist_exp_1102_yan_sui_awakening_tremor", "sui_1102", 1102, 1102, ["炎国", "龍門"],
    "大きな揺れのあと、街区の水路と建物の点検が続いていた。原因について様々な話が流れているが、作業員たちは目の前の損傷を一つずつ調べている。",
    [normalOutcome("水路や住居の点検記録を集めて届ける", "住民から聞いた損傷の場所を、見た事実と伝聞に分けて担当窓口へ届けた。", { k: 1, p: 1 }),
      normalOutcome("家族や隣人と、使える水と避難先を確認する", "水道が戻るまでの分を確かめ、近隣の避難先の開設状況を見に行った。", { rl: 1, h: -1 })],
    { references: ["SRC_TL_LATE"] });
  pushRows(historicalRows);

  const youthRows = [];
  const youth = (id, st, ge, show, t, c, opts = {}) => youthRows.push({
    id, references: opts.references || ["SRC_TERRA_LIFECOURSE"],
    st, ge, le: opts.le, need: opts.need, once: true, w: 0.3, show, t, c
  });
  const child = ["児童", "少年"];
  // YC-01..20: race-related drafts are reframed as observed body, household, school, and locality experiences.
  youth("child_race_sankta_first_halo_empathy", ["幼児", "児童"],
    { age: 4 }, s => s.r?.n === "サンクタ",
    "鏡の前で髪を結んでいた時、頭上の光輪がいつもより少し傾いて見えた。家族に尋ねると、光輪の見え方や感じ方には人それぞれ差があると教えられた。",
    [normalOutcome("家族に気になる点を聞いてみる", "誰かの気分を読み取れると決めつけず、自分に見えたことだけを伝えた。家族は一緒に様子を確かめてくれた。", { p: 1, rl: 1 }),
      normalOutcome("いつも通り過ごし、必要ならまた相談する", "すぐに意味を決めず、普段の遊びに戻った。", { p: 1 })],
    { references: ["SRC_TERRA_SPECIES_ATLAS"] });
  youth("child_race_sankta_patron_firearm_rite", ["少年"],
    { age: 12 }, s => s.r?.n === "サンクタ" && s.res?.n === "ラテラーノ",
    "学校の掲示板に、成人向けの銃器安全講習が案内されていた。まだ受講できる年齢ではなく、家では道具に触れない決まりを改めて確かめた。",
    [normalOutcome("家族と保管場所や安全規則を確認する", "講習に出るのは先のこととして、今は保管場所に近づかない約束を確認した。", { k: 1, p: 1 }),
      normalOutcome("講習の対象年齢と内容だけ読み、参加は見送る", "掲示を読み、対象外であることを確かめて帰った。", { k: 1 })],
    { references: ["SRC_TERRA_SPECIES_ATLAS"] });
  youth("child_race_sarkaz_blood_memory_dream", ["少年"],
    { age: 10 }, s => s.r?.n === "サルカズ",
    "家族の古い荷物から、手入れの仕方が分からない飾りを見つけた。由来を尋ねると、覚えていることと、伝聞でしかないことを分けて話してくれた。",
    [normalOutcome("覚えている範囲を聞き、日付と話者を書き留める", "家族が自分で見たことと、誰かから聞いたことを分けて記した。分からない由来は空欄にした。", { k: 1, rl: 1 }),
      normalOutcome("今日はしまい、家族が話したくなるまで待つ", "無理に話を聞き出さず、飾りを傷めないよう布に包んで戻した。", { p: 1 })],
    { references: ["SRC_TERRA_SPECIES_ATLAS"] });
  youth("child_race_kuranta_steppe_wind_run", ["児童", "少年"],
    { age: 8 }, s => s.r?.n === "クランタ",
    "学校の運動会で、草原の走路を使う短距離競走があった。走る速さは一人ずつ違い、今日は転ばずに走り切ることを目標にした。",
    [normalOutcome("友人とペースを合わせて走る", "競走の後も友人と一緒に歩いて戻った。勝ち負けより、最後まで走れたことが嬉しかった。", { h: 1, p: 1 }),
      normalOutcome("自分のペースで走り、途中で休む", "息が苦しくなったところで歩きに切り替え、体調を見ながらゴールした。", { h: 1 })],
    { references: ["SRC_TERRA_SPECIES_ATLAS"] });
  youth("child_race_lupo_pack_instinct", ["児童", "少年"],
    { age: 9 }, s => ["ループス", "ペッロー", "フェリーン"].includes(s.r?.n),
    "遊び場で、尻尾や耳の動きをからかわれた子が黙り込んでいた。どんな気持ちなのかは本人に聞くまで分からず、周りの子も返事を待っていた。",
    [normalOutcome("本人に、遊びを続けたいか尋ねる", "本人が望む遊び方を聞き、答えを待った。話したくない時は、別の遊びへ移ることにした。", { rl: 1, p: 1 }),
      normalOutcome("からかいをやめるよう伝え、先生を呼ぶ", "身体の特徴を笑いの種にしないよう伝え、遊び場の大人に状況を知らせた。", { p: 1, k: 1 })],
    { references: ["SRC_TERRA_SPECIES_ATLAS"] });
  youth("child_race_vouivre_archosauria_horn_tail_strength", ["児童", "少年"],
    { age: 9 }, s => ["ヴイーヴル", "アダクリス"].includes(s.r?.n),
    "狭い教室で、鞄を置く場所が通路をふさいでいた。自分や周りの身体の動きに合わせて、皆が通りやすい並べ方を相談した。",
    [normalOutcome("机の間隔を少し空け、通路を確保する", "誰かの力に頼らず、家具の位置を変えて通路を広げた。", { k: 1, p: 1 }),
      normalOutcome("自分の荷物を先に片づけ、周りにも声をかける", "鞄を壁際へ移し、皆で通り道をふさがないようにした。", { p: 1, rl: 1 })],
    { references: ["SRC_TERRA_SPECIES_ATLAS"] });
  youth("child_arts_aptitude_first_test", child, { age: 11 },
    s => s.educationPath?.status === "enrolled" || !!s.fl?.sch,
    "学校で、希望者向けの源石アーツ検査の案内が配られた。受検しても習得や進路が約束されるわけではなく、保護者の同意と説明が必要だった。",
    [normalOutcome("説明を聞いてから、受けるか家族と決める", "費用や結果の扱いを確認し、家族と相談することにした。検査を受けたかどうかは今日は決めなかった。", { k: 1, p: 1 }),
      normalOutcome("今回は申し込まず、授業に戻る", "まだ必要だと思えず、申し込みはしないと伝えた。", { p: 1 })]);
  youth("child_arts_accidental_spark_at_home", child, { age: 12 },
    s => ["upper", "exceptional"].includes(s.artsProfile?.innateBand) ||
      (s.artsProfile?.knownTechniques || []).length > 0,
    "家で練習していると、道具の表面に小さな光が走った。驚いて手を止め、周囲に燃えたり壊れたりした物がないか確かめた。",
    [normalOutcome("練習を中止し、家族と教師へ相談する", "光の原因を決めつけず、使った道具と手順を伝えて大人に相談した。", { k: 1, p: 1 }),
      normalOutcome("道具を片づけ、次の練習は監督者のいる場所にする", "自己流で続けず、次の練習は指導者に見てもらえる時間に移すことにした。", { p: 1 })],
    { references: ["SRC_TERRA_LIFECOURSE"] });
  youth("child_oripathy_secret_friend_beyond_fence", child, { age: 12 },
    s => !!s.fl?.dg || (s.inf > 0 && s.known?.inf),
    "学校の連絡板に、鉱石病の診療時間と相談窓口が掲示された。病名を知った子どもの中には、家族にも話せず一人で紙を見つめている人がいた。",
    [normalOutcome("相談窓口の場所を伝え、本人が行くか決めてもらう", "本人の許可なく名前を先生へ伝えず、公開されている相談先を知らせた。", { p: 1, rl: 1 }),
      normalOutcome("教師に、誰でも相談できる時間を作れないか尋ねる", "特定の子を示さず、全員が利用できる相談時間を設けられないか尋ねた。", { k: 1, p: 1 })],
    { references: ["SRC_TERRA_LIFECOURSE"] });
  youth("child_oripathy_early_onset_school_crisis", child, { age: 12 },
    s => s.inf > 0 && !!s.fl?.dg,
    "診断後、通学や治療の予定を調整する話し合いが始まった。何を誰に伝えるかは、本人と家族が決める必要がある。",
    [normalOutcome("学校へ必要な配慮だけを家族と伝える", "本人の同意を得て、通学や通院に必要な範囲だけを伝えた。病気について周囲に話すかは別に考えることにした。", { p: 1, k: 1 }),
      normalOutcome("まず医療担当者に、学校で気をつける点を尋ねる", "学校への説明を急がず、医療担当者から生活上の注意を聞いた。", { k: 1 })],
    { references: ["SRC_TERRA_LIFECOURSE"] });
  youth("child_mobile_city_plate_docking_festival", child, { age: 8 },
    s => s.home === "移動都市",
    "移動都市の区画が連結される日、通路の一部が閉じられた。大人たちは荷物の受渡しを急ぎ、子どもたちは窓から隣の街区を眺めていた。",
    [normalOutcome("家族と決めた集合場所で待つ", "家族が仕事を終えるまで、決めてあった集合場所で待った。新しい街区の様子は帰り道に見ることにした。", { p: 1, k: 1 }),
      normalOutcome("荷物運びを手伝い、通路を空ける", "小さな荷物だけを運び、作業員の通り道をふさがないよう気をつけた。", { h: 1, rl: 1 })]);
  youth("child_catastrophe_shelter_lullaby", child, { age: 9 },
    s => !!s.world?.events?.chernobog_incident || !!s.world?.events?.bolivar_civil_war ||
      !!s.world?.events?.siesta_disaster,
    "外の警報が続き、家族と一緒に近くの避難場所へ移った。毛布の端を握りながら、周囲の大人たちが誰の所在を確かめているか聞いていた。",
    [normalOutcome("家族のそばで、知っている歌を小さく歌う", "声を出せる子どもたちと短い歌を繰り返した。警報はすぐには止まなかったが、待っている間に少し落ち着けた。", { p: 1, rl: 1 }),
      normalOutcome("避難場所の掲示と大人の案内を確かめる", "どこへ行けばよいか分からなくならないよう、集合場所と家族の連絡先を覚えた。", { k: 1, p: 1 })]);
  youth("child_originium_slug_race_alley", child, { age: 9 },
    s => s.home === "移動都市" || s.res?.n === "クルビア",
    "路地の子どもたちが、紙片で作った小さな車を床の溝に走らせていた。通行人が増えると、誰かが遊びを止めて道を空けた。",
    [normalOutcome("競走を続ける前に、通路をふさがない場所へ移る", "道具を拾い、店先の許可をもらってから遊ぶ場所を移した。", { k: 1, p: 1 }),
      normalOutcome("車の作り方を工夫し、短い距離で遊ぶ", "小さな段差を越える車を作り、通行人が来たらすぐ片づけた。", { k: 1, p: 1 })]);
  youth("child_fin_burden_bean_counting", child, { age: 9 },
    s => !!s.house?.parentLedger || !!s.care?.supportNetwork,
    "家の手伝いで、食料の袋と使った分を帳面に記した。忙しい家族が困らないよう、数を間違えないことが大事だった。",
    [normalOutcome("一緒に数え直し、残りを記録する", "家族と数を照合し、足りない物を帳面に書いた。", { k: 1, p: 1 }),
      normalOutcome("自分で数え、分からない分は大人に聞く", "確かな数だけ記録し、袋の重さから推測して書くのはやめた。", { k: 1 })]);
  youth("child_messenger_letter_delivery_pride", ["少年"], { age: 13 },
    s => s.res?.n != null,
    "近所の人から、宛先の分かる封書を一通届けてほしいと頼まれた。住所を何度も読み返し、途中で迷ったら戻る場所も確かめた。",
    [normalOutcome("受取人を確かめて手渡す", "封書を別の人に預けず、宛名の本人へ渡した。帰りに頼んだ人へ受取の報告をした。", { k: 1, p: 1 }),
      normalOutcome("知らない道には入らず、家族と一緒に届ける", "道に迷わないよう家族に付き添ってもらい、次に一人で行く時の道順を覚えた。", { p: 1, rl: 1 })]);
  youth("child_polyglot_border_market_ear", ["児童", "少年"], { age: 11 },
    s => ["クルビア", "カジミエーシュ", "ボリバル", "サルゴン", "イベリア"].includes(s.res?.n),
    "市場の店先で、同じ品に違う呼び名が使われていた。値札や身振りを手がかりに、売り手と買い手が何を確かめているのか考えた。",
    [normalOutcome("分からない言葉は、指差しや書き付けで確かめる", "聞き違えたまま買わず、品物と数を見せて確かめた。", { k: 1, rl: 1 }),
      normalOutcome("家へ戻ってから、聞いた言葉を家族に尋ねる", "その場では買い物だけ済ませ、耳に残った言い回しを家族に聞いた。", { k: 1 })]);
  youth("child_scrap_radio_assembly", ["少年"], { age: 13 },
    s => s.home === "移動都市" || s.res?.n === "クルビア",
    "壊れた通信機の部品が作業台に置かれていた。大人の許可を得て、電源を外した状態でネジと配線を分類した。",
    [normalOutcome("危険な部品は触らず、使えそうな物を分ける", "電源と源石ユニットには触れず、再利用できる外装だけを分けた。", { k: 1 }),
      normalOutcome("修理を知る大人に手順を尋ねる", "見よう見まねで配線をつなぐことはせず、修理担当者に安全な扱い方を聞いた。", { k: 1, p: 1 })]);
  youth("child_winter_coal_sharing_ethics", child, { age: 10 },
    s => ["ウルサス", "サーミ", "イェラグ"].includes(s.res?.n),
    "寒さが続き、近所の燃料置き場の残りが少なくなっていた。家族は自分たちの分を確保しながら、何を分けられるか相談していた。",
    [normalOutcome("家の残りを確かめ、少しだけ隣家へ届ける", "全部を渡す約束はせず、家族が使える分を残してから少量を届けた。", { p: 1, rl: 1 }),
      normalOutcome("共同の配給窓口へ不足を伝える", "個人同士だけで解決しようとせず、配給の担当者へ残量と不足を知らせた。", { k: 1, p: 1 })]);
  youth("child_first_independent_journey_ticket", ["少年"], { age: 14 },
    s => s.home === "移動都市" || s.res?.n != null,
    "初めて一人で街区の外へ行く日、家族から交通費と帰る時刻を書いた紙を渡された。行き先の変更は先に連絡する約束だった。",
    [normalOutcome("決めた経路を使い、到着を連絡する", "寄り道をせず目的地へ着き、帰りの時刻も家族へ知らせた。次は別の道も覚えたいと思った。", { k: 1, p: 1 }),
      normalOutcome("不安を伝えて、途中まで付き添ってもらう", "一人で行くのは次の機会にし、駅まで家族に同行してもらった。", { p: 1, rl: 1 })]);
  youth("child_coming_of_age_keepsake", ["少年"], { age: 15 },
    s => true,
    "誕生日の朝、家族から使い古した小さな道具を手渡された。立派な成人のしるしというより、これからも必要な時に相談してよいという言葉が添えられていた。",
    [normalOutcome("道具を受け取り、使い方を教わる", "自分で扱えるよう手入れの仕方を聞いた。頼られたことが嬉しく、教わった手順を何度も確かめた。", { k: 1, p: 1 }),
      normalOutcome("今は使わず、大事に保管する", "道具を包んでしまい、必要になった時に改めて使い方を聞くことにした。", { p: 1, rl: 1 })]);
  pushRows(youthRows);

  const elderRows = [];
  const elder = (id, ge, show, t, c, opts = {}) => elderRows.push({
    id, references: opts.references || ["SRC_TERRA_LIFECOURSE"],
    st: ["壮年", "老年"], ge, le: opts.le, need: opts.need,
    once: opts.once !== false, cd: opts.cd, w: 0.26, show, t, c, fx: opts.fx
  });
  const hobbyPractice = key => s => {
    const hobby = (s.lifeRecord?.hobbies || []).find(row => row.id === key);
    return !!s.fl?.[key] && (hobby?.practiceYears || 0) >= 3 &&
      (s.lifeRecord?.artifacts || []).some(item => item.hobbyId === key);
  };
  // EL-01..25: connect achievements and later-life scenes to recorded hobbies, diagnoses, relationships, or actual history.
  elder("life_hobby_music_artifact_showcase", { age: 25 }, hobbyPractice("hobby_music"),
    "長く書き溜めた譜面が、手元に残る一冊になった。行きつけの店で一曲弾いてみないかと声をかけられたが、客の前で演奏するのは初めてだった。",
    [normalOutcome("自分の曲を一曲だけ演奏する", "食器の音が少し遠のき、最後の音のあとに小さな拍手が起きた。曲を人前で弾き終えた。", { p: 2, rl: 1 }),
      normalOutcome("慣れた曲を選び、短く演奏する", "聞き慣れた曲を一つ弾き、店主の礼を受け取った。無理に続けず、いつもの席へ戻った。", { p: 1 })],
    { references: ["SRC_TERRA_LIFECOURSE"] });
  elder("life_hobby_craft_artifact_showcase", { age: 25 }, hobbyPractice("hobby_craft"),
    "何年も作り続けた手仕事の品が、使う人に合わせて少しずつ形を変えていた。近所の雑貨商が、棚の端で一つだけ扱ってみないかと尋ねてきた。",
    [normalOutcome("納得した品だけ、条件を決めて預ける", "売値と返却の条件を確認してから、一つだけ預けた。評判や売上はこれから分かる。", { k: 1, p: 1 }),
      normalOutcome("家族や友人に贈るため、手元に置く", "品を磨き直し、贈りたい相手に使い道を尋ねた。", { p: 1, rl: 1 })],
    { references: ["SRC_TERRA_LIFECOURSE"] });
  elder("life_hobby_garden_artifact_showcase", { age: 25 }, hobbyPractice("hobby_garden"),
    "何年も手入れしてきた鉢植えが、今年はよく育った。水や日照の記録も残っており、近所の人から株分けを頼まれた。",
    [normalOutcome("育った苗を、希望する人へ分ける", "育て方と水やりの目安を添えて、苗を手渡した。", { p: 2, rl: 1 }),
      normalOutcome("日照と水やりの記録を整理する", "育った年の条件を書き足し、次の季節にも見比べられるようにした。", { k: 1, p: 1 })],
    { references: ["SRC_TERRA_LIFECOURSE"] });
  elder("life_hobby_sport_artifact_showcase", { age: 25 }, hobbyPractice("hobby_sport"),
    "長く続けてきた稽古の記録を見た仲間から、地域の走り比べで若い人たちと一緒に走ってほしいと頼まれた。",
    [normalOutcome("無理のない距離を選び、若い参加者と走る", "自分の体調に合わせた距離を選び、途中で休みながら最後まで走った。", { h: 1, p: 1, rl: 1 }),
      normalOutcome("走る人の準備や記録を手伝う", "給水場所と記録係を担当し、走る人たちを見送った。", { p: 1, k: 1 })],
    { references: ["SRC_TERRA_LIFECOURSE"] });
  elder("life_hobby_collect_artifact_showcase", { age: 25 }, hobbyPractice("hobby_collect"),
    "整理してきた古い切符や荷札を、学校の教師が授業で見せたいと相談してきた。持ち主や由来の確かな品と、そうでない品が混じっている。",
    [normalOutcome("出所の分かる品だけを貸し出す", "確認できた品の説明だけ添え、期間を決めて貸し出した。分からない由来は説明札に書かなかった。", { k: 2, p: 1 }),
      normalOutcome("同好の人と交換会を開く", "値打ちを決めつけず、持ち主同士が納得できる範囲で交換した。", { rl: 1, p: 1 })],
    { references: ["SRC_TERRA_LIFECOURSE"] });
  elder("life_hobby_story_artifact_showcase", { age: 25 }, hobbyPractice("hobby_story"),
    "書き続けてきた物語を、町の小さな印刷所へ持っていく機会があった。誤字を直す時間も、何冊刷るか決める余裕も限られている。",
    [normalOutcome("短い冊子にして、少部数だけ刷る", "校正できた範囲を小冊子にした。感想が届くかは分からないが、誰かに読まれる形になった。", { k: 1, p: 1 }),
      normalOutcome("家族や友人に読んでもらい、次の版を考える", "まず身近な人に読んでもらい、直すところを聞いてから印刷することにした。", { p: 1, rl: 1 })],
    { references: ["SRC_TERRA_LIFECOURSE"] });
  elder("life_hobby_artifact_handover", { age: 50 }, s =>
    (s.lifeRecord?.artifacts || []).length >= 2,
    "手入れしてきた道具や記録を見た若い人から、使い方を教えてほしいと頼まれた。何を譲るか、どこまで教えるかは自分で決められる。",
    [normalOutcome("一緒に作業し、扱い方を伝える", "道具の使い方と、壊れた時に確認する箇所を一緒に確かめた。譲渡はせず、また会う時に続きを教えることにした。", { k: 1, p: 1, rl: 1 }),
      normalOutcome("記録だけを渡し、道具は手元に残す", "手順をまとめた記録を渡した。道具は引き続き自分で使うことにした。", { k: 1, p: 1 })],
    { references: ["SRC_TERRA_LIFECOURSE"] });
  elder("life_hobby_artifact_recollection", { age: 45 }, s =>
    (s.lifeRecord?.artifacts || []).length >= 3,
    "棚に並ぶ道具や記録を、一つずつ手に取って眺めた。移動や暮らしの変化で失った物もあるが、残った品には使った時の記憶が結びついている。",
    null,
    { fx: { p: 1, k: 1 }, references: ["SRC_TERRA_LIFECOURSE"] });
  elder("life_infected_long_term_routine", { age: 45 }, s =>
    s.inf > 0 && !!s.fl?.dg && (s.inf_s == null || s.inf_s <= 3),
    "朝の支度の中に、結晶の周囲を清潔に保つことや通院の予定を確かめる時間がある。体調を見て、今日できる手当てと用事を組み立てた。",
    [normalOutcome("体調を確かめ、必要なことを診療記録に残す", "痛みや疲れを記録して、次の診察で相談する項目をまとめた。", { h: 1, p: 1 }),
      normalOutcome("いつもの支度を続け、予定を詰めすぎない", "薬や手当ての予定を確認してから、無理のない範囲で一日を始めた。", { p: 1 })]);
  elder("life_infected_youth_support", { age: 40 }, s =>
    s.inf > 0 && !!s.fl?.dg && (s.lifeRecord?.affiliations || []).some(a =>
      a.id === "infected-mutual-aid" && ["active", "crisis"].includes(a.status)),
    "互助の集まりで、診断を受けたばかりの人が質問をためらっていた。あなたの経験を誰かの未来へ当てはめることはできないが、知っている相談先なら伝えられる。",
    [normalOutcome("自分の経験と、制度上の相談先を分けて話す", "自分の経験を一つの例として話し、診療や支援の窓口を案内した。", { p: 1, rl: 1 }),
      normalOutcome("今は話を聞き、必要なら担当者を呼ぶ", "助言を急がず、相手が話すのを待った。本人が望んだので、担当者にも同席してもらった。", { p: 1 })]);
  elder("life_infected_family_letter_review", { age: 35 }, s =>
    s.inf > 0 && !!s.fl?.dg && s.sp?.id && s.kids?.length > 0,
    "家族から便りが届き、今の暮らしを尋ねられた。過去に距離ができた時期もあるが、その理由や相手の気持ちはまだ確かめられていない。",
    [normalOutcome("今の生活と、話せる範囲を返事に書く", "病状の細部を一方的に知らせず、自分が話してよいと思う範囲で近況を返した。相手の返事を待つことにした。", { p: 1, rl: 1 }),
      normalOutcome("返事は急がず、今の家族との予定を優先する", "便りは大切にしまい、まず今の家族と落ち着いて相談することにした。", { p: 1 })]);
  elder("life_infected_mutual_aid_weather", { age: 30 }, s =>
    s.inf > 0 && !!s.fl?.dg && factionActive(s, ["infected-mutual-aid"]),
    "気圧が下がる夜、体の重さがいつもより気になった。集まりの部屋には、似た不調を抱える人がいるが、同じ原因だとは限らない。",
    [normalOutcome("体調の変化を共有し、無理をしない方法を聞く", "自分の症状を伝え、他の人の経験を聞いた。続く痛みは医療担当にも相談することにした。", { h: 1, p: 1, rl: 1 }),
      normalOutcome("今夜は休み、次の集まりで様子を伝える", "集まりには出ず、横になって休んだ。連絡だけを担当者へ送った。", { p: 1 })]);
  elder("life_infected_workplace_continuity", { age: 35 }, s =>
    s.inf > 0 && !!s.fl?.dg && s.job > 0 && (s.cr || 0) >= 10,
    "長く働いてきた職場で、診療と勤務の予定を調整する必要が出た。体調の情報をどこまで職場へ伝えるかは、本人が決めたいと考えている。",
    [normalOutcome("必要な勤務上の配慮だけを相談する", "診断の詳細ではなく、通院時間や安全上必要な配慮だけを相談した。", { p: 1, k: 1 }),
      normalOutcome("医療担当へ相談し、職場への連絡を保留する", "職場へ何を伝えるか、医療担当と相談してから決めることにした。", { p: 1 })]);
  elder("life_infected_medical_record_consent", { age: 50 }, s =>
    s.inf > 0 && !!s.fl?.dg,
    "診療担当から、治療経過を匿名化して教材に使えないか相談された。本人の同意がない記録は使わないと説明されている。",
    [normalOutcome("利用する記録と期間を確認して、限定的に同意する", "使う項目と保管期間を確かめ、同意した範囲だけ提供した。後から撤回できる窓口も聞いた。", { k: 1, p: 1 }),
      normalOutcome("今回は提供せず、通常の診療を続ける", "断っても診療に影響しないことを確認し、記録提供は見送った。", { p: 1 })]);
  elder("life_infected_partner_future_talk", { age: 40 }, s =>
    s.inf > 0 && !!s.fl?.dg && s.sp?.id && s.sp.inf === 0,
    "これからの治療や暮らしについて、配偶者と落ち着いて話す時間を取った。相手も同じ考えだろうと決めつけず、希望を一つずつ確かめた。",
    [normalOutcome("通院や家事の助け方を一緒に決める", "相手の負担も聞き、必要な支えと本人だけで担いたいことを分けて決めた。", { p: 1, rl: 1 }),
      normalOutcome("今は結論を出さず、また話す日を決める", "今日は結論を急がず、次に話す日だけ決めた。", { p: 1 })]);
  elder("life_infected_later_years_reflection", { age: 60 }, s =>
    s.inf > 0 && !!s.fl?.dg,
    "長い時間をかけて、治療や仕事、住まいの都合を何度も調整してきた。病気が軽くなったわけではないが、今の生活に合わせた相談先や手順は少しずつ増えている。",
    null,
    { fx: { p: 1, h: 1 } });
  elder("life_later_revisit_recorded_displacement", { age: 60 }, s =>
    !!s.displacement?.origin || !!s.fl?.disaster_displaced || !!s.fl?.war_displaced,
    "以前に離れた地域から、復旧の便りが届いた。戻れるかどうかは住まいや仕事、家族の都合にも左右される。",
    [normalOutcome("便りの送り主へ、今の様子を尋ねる", "相手が知っている範囲を尋ね、確認できない消息は推測しないよう頼んだ。", { p: 1, rl: 1 }),
      normalOutcome("今の暮らしを守り、すぐの帰還は考えない", "懐かしさはあったが、移動を急がず今の住まいと仕事を続けた。", { p: 1 })]);
  elder("life_later_friend_news", { age: 60 }, s =>
    !!s.friendContact?.id && s.friendContact.lifeStatus === "alive",
    "長く連絡を取り合ってきた友人から、最近の暮らしについて便りが届いた。返事を急ぐ必要はないが、相手の都合も確かめておきたい。",
    [normalOutcome("返事を書き、会える時期を尋ねる", "会う約束を決めつけず、互いの都合が合う時期があるか尋ねた。", { rl: 1, p: 1 }),
      normalOutcome("短い近況だけ送り、連絡を続ける", "長い返事は書かず、無事に暮らしていることだけ伝えた。", { p: 1, rl: 1 })]);
  elder("life_later_write_personal_chronicle", { age: 62 }, s => (s.k || 0) >= 40,
    "書きためた帳面を読み返すと、同じ出来事でも、その時に知っていたことと後から聞いたことが混ざっていた。自分の生活史を残すなら、確かめられる範囲を整理したい。",
    [normalOutcome("当時の手紙や記録と照らして書き直す", "日付や出典が確かな範囲を書き、分からない箇所にはそのまま注記した。", { k: 1, p: 1 }),
      normalOutcome("家族に読み聞かせ、口述の形で残す", "記憶違いを指摘してもらいながら、家族と一緒に書き留めた。", { p: 1, rl: 1 })]);
  elder("life_later_spouse_evening_walk", { age: 65 }, s =>
    !!s.sp?.id && !s.sp?.d && (s.rl || 0) >= 45,
    "夕方、配偶者と近所を歩いた。歩く速さや寄り道したい場所はその日によって違い、言わなくても分かると思わず確かめ合った。",
    [normalOutcome("相手の歩幅に合わせて、短い道を歩く", "疲れたら休める道を選び、帰りに温かい飲み物を買った。", { p: 1, rl: 1 }),
      normalOutcome("今日は無理せず、家で一緒に過ごす", "外へ出るのはやめ、窓辺で今日の出来事を話した。", { p: 1 })]);
  elder("life_later_neighbor_children_story", { age: 63 }, s => true,
    "近所の子どもが、昔の街や移動都市の暮らしについて尋ねてきた。覚えている景色と、後から聞いた話を分けて話すことにした。",
    [normalOutcome("自分が見た暮らしのことを話す", "当時の怖さだけでなく、食卓や仕事の様子も交えて話した。分からないことは知らないと伝えた。", { k: 1, p: 1, rl: 1 }),
      normalOutcome("古い道具や記録を見せ、質問に答える", "品の出所が分かるものだけを見せ、子どもたちの質問に答えた。", { k: 1, p: 1 })]);
  elder("life_later_personal_belongings_plan", { age: 68 }, s => true,
    "部屋の荷物を整理していると、誰に渡したいか決めていない品がいくつも出てきた。今すぐ結論を出す必要はないが、後で迷わないよう自分の希望を残しておくことにした。",
    [normalOutcome("残したい品と譲りたい品を記録する", "渡す相手を決められる品と、まだ手元に置きたい品を分けて記録した。", { p: 1, rl: 1 }),
      normalOutcome("使わない品を整理し、必要な物を残す", "使っていない品を必要な人へ譲り、手元には今使う物を残した。", { p: 1 })]);
  elder("life_later_health_review", { age: 70 }, s =>
    !!s.siteAffiliations?.clinic || !!s.fl?.dg || (s.h || 0) < 55,
    "診察の帰り、医療担当者と今後の通院や日々の動き方を話した。年齢だけで体の状態を決めず、本人が感じる変化を記録に残した。",
    [normalOutcome("変化があった動作を具体的に伝える", "いつ、どの動きで困るかを話し、次の診察で確かめる点を記録した。", { h: 1, p: 1 }),
      normalOutcome("今の生活を続けながら、次回に再確認する", "すぐに変えることはせず、様子を見て次の診察で相談することにした。", { p: 1 })]);
  elder("life_later_window_tea", { age: 65 }, s => (s.p || 0) >= 35,
    "朝の湯気が窓の近くに流れ、いつもの茶碗が手になじんだ。街の蒸気機関が動き出す音を聞きながら、予定のない朝をゆっくり過ごした。",
    null, { fx: { p: 1, h: 1 }, once: false, cd: 8 });
  elder("life_later_life_review", { age: 72 }, s =>
    !!s.fl?.retired || (s.lifeRecord?.artifacts || []).length >= 1 ||
      (s.lifeRecord?.careerChanges || []).length >= 2,
    "棚の記録や古い仕事道具を見ながら、何を覚えていて、何を忘れてしまったか考えた。家族や友人と過ごした日々を、一つずつたどった。",
    [normalOutcome("残したい記録を家族や地域の資料室へ託す", "本人が確かめられる記録だけを整理し、誰に見せるか自分で決めた。", { k: 1, p: 1 }),
      normalOutcome("記録は手元に置き、身近な人と読み返す", "大切な物を無理に手放さず、家族や友人と過去の話をした。", { p: 1, rl: 1 })]);
  pushRows(elderRows);
});
