// routes/regional-careers/events-central: distinct daily, choice, promotion, crisis, and mortality events for Columbia, Kazimierz, Siracusa, and Siesta careers.
window.TERRA_DATA_BUILD.fragment(
  "routes/regional-careers",
  "routes/regional-careers/events-central"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const E = [
    // =============================================================
    // クルビア: フロンティア開拓パイオニア
    // =============================================================
    {
      id: "car_col_pioneer_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "クルビア" && s.job === $terraData.REG_JOBS.col_pioneer,
      t: "乾いた土煙が舞う荒野の農場で、地下水汲み上げポンプのモーターを分解修理した。厳しい日差しの中、自らの手で開墾した畑に緑の芽が吹くのを見つめる。すべてが自己責任のフロンティアで、今日も大地と向き合う。",
      c: [
        $terraData.K("トラクターの燃料を補給し、日没を迎える", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "小屋のテラスで冷たい水を飲み、一日の疲れを癒した。",
          { h: 1, p: 1, cash: 100000 }
        ])
      ]
    },
    {
      id: "car_col_pioneer_choice_bandits",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 22 },
      show: s => s.res?.n === "クルビア" && s.job === $terraData.REG_JOBS.col_pioneer,
      t: "収穫を間近に控えた夜、武装した荒野の略奪者集団が農場を取り囲み、全収穫物とトラクターの引き渡しを要求してきた。民兵の応援は間に合わない。猟銃を取ってサイロから撃って撃退するか、要求を呑んで土地を明け渡すか。",
      c: [
        $terraData.K("サイロに籠城し、猟銃で応戦する", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.45,
          "的確な狙撃で略奪団の車両のタイヤを撃ち抜き、頭目を射殺して敗走させた。自力で農場を守り抜いた不屈の開拓者として連邦新聞に報じられた。",
          { cr: 4, h: 2, p: 3, cash: 800000 }
        ], [
          0.85,
          "撃退には成功したものの、サイロに火を放たれて収穫の半分を失った。",
          { h: -4, cash: -300000, p: 1 }
        ], [
          1,
          "略奪団の放った爆弾がサイロを直撃。炎上する建物の中で命を落とした。",
          { h: -100, d: ["開拓地での爆殺", "クルビア開拓地において、略奪団の爆破攻撃に巻き込まれ炎上するサイロの中で命を落とした。"] }
        ]),
        $terraData.K("財産を諦め、夜陰に乗じてトラクターで脱出する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "命からがら移動都市へ逃げ延びた。農場は略奪されたが、命は繋いだ。",
          { job: 0, cash: -500000, p: -5 }
        ])
      ]
    },

    // =============================================================
    // カジミエーシュ: 商業連合会公認 企業騎士
    // =============================================================
    {
      id: "car_kaz_comp_knight_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "カジミエーシュ" && s.job === $terraData.REG_JOBS.kaz_comp_knight,
      t: "照明が眩しいスタジオで、スポンサー企業の栄養ドリンクを掲げてカメラに向かって微笑んだ。午後は数千人の観客が見つめる中、アリーナで公開練習試合。喝采と巨額のギャラが飛び交うが、負ければ即座に契約を切られる過酷な競争の世界である。",
      c: [
        $terraData.K("サイン会をこなし、専属トレーナーのマッサージを受ける", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "ファンの歓声を背に、高級ホテルのスイートへ戻った。",
          { cr: 2, p: 1, cash: 350000 }
        ])
      ]
    },
    {
      id: "car_kaz_comp_knight_choice_match",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 22 },
      show: s => s.res?.n === "カジミエーシュ" && s.job === $terraData.REG_JOBS.kaz_comp_knight,
      t: "メジャー大会の決勝前夜、商業連合会の重鎮プロモーターが部屋を訪れた。『明日の試合で第3ラウンドに派手にKO負けしろ。報酬として五百万龍門幣を約束する』。八百長を呑んで巨額の富を手にするか、騎士の誇りを賭けて真正面から勝利を掴むか。",
      c: [
        $terraData.K("八百長を断固拒絶し、全霊を賭けて決勝戦で打ち倒す", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.45,
          "猛烈な打ち合いを制し、相手騎士をアリーナの壁へ叩き伏せて勝利した。メジャー大会優勝の栄冠と巨額の賞金を掴み、真の英雄騎士として称えられた。",
          { cr: 6, h: -3, p: 4, cash: 6000000 }
        ], [
          0.85,
          "善戦したものの、相手の重打を頭部に受けて惜敗した。重い脳震盪を負い、長期の治療を余儀なくされた。",
          { h: -10, p: -2, cash: 1000000 }
        ], [
          1,
          "相手の必殺の一撃を頚椎にまともに受け、アリーナの砂の上で息絶えた。",
          { h: -100, d: ["騎士競技での致命傷", "カジミエーシュの騎士競技場において、対戦相手の一撃を頚椎に受けて息絶えた。"] }
        ]),
        $terraData.K("裏取引を呑み、第3ラウンドでわざと倒れる", { ethics: { reviewed: true, policyVersion: 87, intent: "self-or-family-care" } }, [
          1,
          "見事な負け芝居を打ち、五百万龍門幣の裏金を受け取った。だがファンからの激しい罵声が耳に焼き付いた。",
          { cash: 5000000, cr: -5, p: -8 }
        ])
      ]
    },

    // =============================================================
    // カジミエーシュ: 無冑盟（暗殺部隊）
    // =============================================================
    {
      id: "car_kaz_armorless_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "カジミエーシュ" && s.job === $terraData.REG_JOBS.kaz_armorless,
      t: "商業連合会の高層ビル街の足元、陽の当たらぬ路地裏で標的の役人の行動パターンを記録した。暗殺弓の弦を張り替え、鏃に塗った遅効性神経毒の鮮度を確かめる。冷酷な数字として命を消去する日常である。",
      c: [
        $terraData.K("気配を消してアジトへ戻る", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "暗殺完了の報酬を現金で受け取り、次の標的を待った。",
          { p: 1, h: 1, cash: 220000 }
        ])
      ]
    },

    // =============================================================
    // シラクーザ: 12ファミリー構成員（マフィア）
    // =============================================================
    {
      id: "car_sir_soldier_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "シラクーザ" && s.job === $terraData.REG_JOBS.sir_soldier,
      t: "石畳の路地に並ぶリストランテや煙草屋から、今月のみかじめ料を回収して回った。遅れを出した店主の胸ぐらを掴み、冷徹にファミリーの掟を言い聞かせる。コートの下の銃の重みが、シラクーザの夜の秩序を担保している。",
      c: [
        $terraData.K("回収金を幹部に納め、酒場でワインを飲む", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "仲間とサイコロ博打に興じ、夜更けに自室へ戻った。",
          { p: 1, cash: 180000 }
        ])
      ]
    },
    {
      id: "car_sir_soldier_choice_turf_war",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 22 },
      show: s => s.res?.n === "シラクーザ" && s.job === $terraData.REG_JOBS.sir_soldier,
      t: "隣接する対立ファミリーが境界のレストランを襲撃し、縄張りを侵犯してきた。ドンから『報復として敵の幹部クラブを一斉掃討せよ』とトンプソン銃が配られた。夜の市街地で血で血を洗う銃撃戦が始まる。",
      c: [
        $terraData.K("先頭を切ってクラブに突入し、サブマシンガンを乱射する", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.45,
          "猛烈な銃撃戦の中で敵幹部を仕留め、クラブを制圧した。ドンからその胆力を絶賛され、若くして小隊を率いる『カポ』へ昇進した。",
          { cr: 4, h: 2, p: 2, cash: 1200000 }
        ], [
          0.85,
          "敵を制圧したものの、太腿に銃弾を受けて流血した。裏医者の元で弾を抜いてもらった。",
          { h: -6, p: 1, cash: 300000 }
        ], [
          1,
          "待ち伏せしていた敵の散弾銃を胸に受け、石畳の上に崩れ落ちて絶命した。",
          { h: -100, d: ["ファミリー抗争での銃殺", "シラクーザの縄張り争いにおいて、敵対ファミリーの散弾銃を胸に受けて絶命した。"] }
        ]),
        $terraData.K("裏口を封鎖し、逃走する敵を待ち伏せする", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "逃げ出してきた敵の運転手を捕縛し、堅実に役目を果たした。",
          { p: 1, k: 1 }
        ])
      ]
    },

    // =============================================================
    // シラクーザ: ヌオバ・ウォルシーニ裁判所警察官
    // =============================================================
    {
      id: "car_sir_police_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "シラクーザ" && s.job === $terraData.REG_JOBS.sir_police,
      t: "ヌオバ・ウォルシーニの広場で、市民からの陳情や交通の整理を行った。マフィアの報復を恐れて声を潜める住民に優しく声をかけ、法による保護を約束する。銃ではなく法典で街を変える、静かで尊い戦いである。",
      c: [
        $terraData.K("詰所で日誌を書き終え、パスタを食べる", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "同僚と正義のあり方を語り合い、宿舎へ戻った。",
          { p: 2, cr: 1, cash: 130000 }
        ])
      ]
    },

    // =============================================================
    // シエスタ: 火山観測所研究員
    // =============================================================
    {
      id: "car_sie_obs_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "シエスタ" && s.job === $terraData.REG_JOBS.sie_obs,
      t: "シエスタ火山の観測ドームで、マグマだまりの圧力と噴気孔の硫黄濃度データを集計した。リゾート地で音楽フェスを楽しむ観光客たちの笑顔を守るため、数値の異常を一つも見落とさぬよう目を光らせる。",
      c: [
        $terraData.K("安全報告書を市長府へ送信する", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "夕暮れの海風を感じながら、ビーチ沿いのカフェで休んだ。",
          { k: 1, p: 1, cash: 150000 }
        ])
      ]
    }
  ];

  for (const event of E) {
    event.references = [...new Set([...(event.references || []), "SRC_REGIONAL_CAREERS"])];
    $terraData.EV.push(event);
  }
});
