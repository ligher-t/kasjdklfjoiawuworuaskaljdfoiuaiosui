// routes/regional-careers/entry-frontier: recruitment and entry events for Sargon, Sami, Kjerag, Kazdel, Iberia, Bolivar, RIM Billiton, and Minos.
window.TERRA_DATA_BUILD.fragment(
  "routes/regional-careers",
  "routes/regional-careers/entry-frontier"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const E = [
    // -------------------------------------------------------------
    // サルゴン: パーディシャー宮廷親衛隊
    // -------------------------------------------------------------
    {
      id: "car_sar_guard_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "サルゴン" && s.job === 0 && !s.fl?.retired,
      t: "オアシス都市にそびえる豪壮な宮殿。サルゴンの地方領主『パーディシャー』が、自らの身辺を護る屈強な親衛隊を募っていた。主君への絶対の服従と、灼熱の砂漠で敵を薙ぎ倒す無慈悲な武勇が求められる。",
      c: [
        $terraData.K("曲刀を抜き、宮廷闘技で力を見せつける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.35,
          "猛獣や敵対部族の戦士を一人で叩き伏せ、パーディシャーの前に跪いた。金糸の外套と曲刀を賜り、領主直属の親衛隊員として登用された。",
          $terraData.regionalCareerStaff(
            "sar_guard",
            "sargon-padishah-guard",
            "パーディシャー宮廷親衛隊",
            "領主親衛隊員",
            "sargon-padishah-service",
            "パーディシャーに忠誠を捧げ、砂漠の権力抗争で生き抜く",
            "scimitar-mastery",
            "砂漠曲刀術・宮廷警衛格闘",
            { h: 3, p: 2, cr: 2 }
          )
        ], [
          0.75,
          "実力は認めたものの宮廷宦官から『親衛隊に入りたくば、百五十万龍門幣相当の金品をパーディシャーへの貢ぎ物として積め』と要求された。借金を背負い、辛うじて末席を確保した。",
          $terraData.regionalCareerStaff(
            "sar_guard",
            "sargon-padishah-guard",
            "パーディシャー宮廷親衛隊",
            "末席親衛兵（貢ぎ物仕官）",
            "sargon-padishah-service",
            "貢ぎ物の借金を抱えながら、領主の護衛を務める",
            "scimitar-mastery",
            "砂漠曲刀術・宮廷警衛格闘",
            { h: 2, p: -2, debt: 1500000 }
          )
        ], [
          1,
          "力及ばず闘技場で叩き出され、宮殿の門から放り出された。",
          { p: -4, h: -2 }
        ]),
        $terraData.K("専制君主への仕官を辞退する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "いつ粛清されるか知れぬ宮廷を避け、隊商の仕事を探すことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // サルゴン: アカフラ部族大勇士
    // -------------------------------------------------------------
    {
      id: "car_sar_warrior_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "サルゴン" && s.job === 0 && !s.fl?.retired,
      t: "ジャングルの熱気と歓声が渦巻くアカフラ。部族の力比べ大祭で、己の肉体一本で戦う『大勇士』の挑戦者を募っていた。難しい理屈は一切不要、ただ目の前の猛者を素手でねじ伏せた者だけが部族の英雄として認められる。",
      c: [
        $terraData.K("雄叫びを上げ、土俵の殴り合いに飛び込む", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.45,
          "巨大な鰐や屈強な戦士たちを次々に投げ飛ばし、土俵の頂点に立った。部族長から羽飾りを掲げられ、アカフラの大勇士として称えられた。",
          $terraData.regionalCareerStaff(
            "sar_warrior",
            "sargon-acahualla-warrior",
            "アカフラ部族連合",
            "雨林の大勇士",
            "sargon-acahualla-might",
            "雨林の力比べで部族の誇りを守り、仲間を導く",
            "acahualla-brawl",
            "素手格闘・密林生存術",
            { h: 4, p: 3, cr: 3 }
          )
        ], [
          1,
          "頑丈なワニ頭の戦士に力負けし、泥の中に叩きつけられた。全身打撲の痛みに唸りながら土俵を降りた。",
          { p: -3, h: -3 }
        ]),
        $terraData.K("殴り合いを辞退し、観客席で囃し立てる", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "骨を折る危険を避け、祭りの酒を楽しむことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // サーミ: 雪祀（自然呪術者）
    // -------------------------------------------------------------
    {
      id: "car_sam_priest_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.45,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "サーミ" && s.job === 0 && !s.fl?.retired && (s.p || 0) >= 30,
      t: "氷結した古代の巨木がそびえるサーミの深き森。部族を導き、巨獣と森の意志を読み取る『雪祀（雪祭司）』の継承者が選ばれようとしていた。文明の機械を排し、極寒の氷湖で自然の幻視を受け止める、精神を削る過酷な試練である。",
      c: [
        $terraData.K("氷湖の祭壇に座し、巨木の声を聞く", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.35,
          "吹きすさぶ吹雪の中で精神を澄まし、森の微かな脈動を感じ取った。老いた雪祀から骨の杖を授かり、部族の行く末を占う雪祀として認められた。",
          $terraData.regionalCareerStaff(
            "sam_priest",
            "sami-snow-priest",
            "サーミ雪祀の輪",
            "見習い雪祀",
            "sami-nature-communion",
            "森と巨獣の神託を読み、部族の生存を守る",
            "sami-divination",
            "骨占い・自然交信呪術",
            { p: 5, k: 3, cr: 3 }
          )
        ], [
          0.75,
          "氷湖の寒気と森のざわめきに精神を乱され、幻視に耐えきれず失神した。雪祀にはなれず、命だけ助けられて部族の天幕へ運ばれた。",
          { p: -6, h: -3 }
        ], [
          1,
          "森の深奥から届く異質な悪意に当てられ、精神が崩壊しかけた。叫び声を上げて逃げ出し、長い後遺症に苦しむこととなった。",
          { p: -15, h: -5 }
        ]),
        $terraData.K("神秘の森に立ち入らず、狩人として生きる", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "人知を越えた儀礼を避け、平穏な生活を選ぶことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // サーミ: 氷原境界哨戒戦士（樹痕の戦士）
    // -------------------------------------------------------------
    {
      id: "car_sam_warrior_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "サーミ" && s.job === 0 && !s.fl?.retired,
      t: "北の果てなき氷原から侵食する正体不明の存在――『悪魔』。その脅威を文明圏から隔離するため、木々に傷を刻み境界を守護する『樹痕の戦士』。命の保証はなく、認識汚染により自己を失えば同胞に討たれる死線の任務である。",
      c: [
        $terraData.K("樹痕の刻印を腕に刻み、氷原哨戒隊に加わる", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "凍てつく刃を握り、自らの血で木に境界印を刻んだ。北方悪魔の侵食を押し留める樹痕の戦士として、永久凍土の境界に立つ。",
          $terraData.regionalCareerStaff(
            "sam_warrior",
            "sami-scar-warrior",
            "サーミ樹痕哨戒隊",
            "境界哨戒戦士",
            "sami-scar-demon-defense",
            "北方の悪魔を氷原に押し留め、テラの大地を守護する",
            "demon-warding",
            "対悪魔戦闘術・極地追跡",
            { h: 3, p: 3, war: 1.5 }
          )
        ], [
          1,
          "氷原の異様な気配に怯え、哨戒隊長から『恐怖に負けた者は悪魔の餌食になるだけだ』と追い返された。",
          { p: -5, h: -2 }
        ]),
        $terraData.K("死地を避け、南部の村へ引き返す", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "悪魔の這い回る北方を避け、比較的穏やかな南の集落へ戻った。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // イェラグ: カランド貿易 武装社員
    // -------------------------------------------------------------
    {
      id: "car_kje_karlan_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1092 },
      show: s => s.res?.n === "イェラグ" && s.job === 0 && !s.fl?.retired,
      t: "雪に閉ざされた聖山イェラグを近代化へ導く、シルバーアッシュ総長率いる『カランド貿易』。伝統に固執する三大家族や曼珠院の保守派と対峙しながら、最新式の重火器と近代流通網を駆使して国を開く武装社員が募集されていた。",
      c: [
        $terraData.K("近代火器の取扱と帳簿管理の試験を受ける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "シルバーアッシュ総長の理念に賛同し、見事採用を勝ち取った。厚手のコートと近代小銃を支給され、カランド貿易の武装社員として雪山を越える任務に就く。",
          $terraData.regionalCareerStaff(
            "kje_karlan",
            "kjerag-karlan-commercial",
            "カランド貿易",
            "武装社員・流通護衛",
            "kjerag-karlan-trade",
            "最新の銃火器と近代流通網でイェラグの変革を支える",
            "karlan-tactics",
            "雪中護送戦術・近代貿易実務",
            { k: 2, h: 2, cr: 2 }
          )
        ], [
          1,
          "火器の分解整備で不手際があり不採用となった。伝統的な山道へ戻った。",
          { p: -2, k: 1 }
        ]),
        $terraData.K("曼珠院の伝統を重んじ、辞退する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "急激な近代化を敬遠し、伝統的な暮らしを続けることにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // イェラグ: 曼珠院 聖山護衛僧
    // -------------------------------------------------------------
    {
      id: "car_kje_monk_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "イェラグ" && s.job === 0 && !s.fl?.retired && (s.p || 0) >= 25,
      t: "カランドの女神を祀る神聖なる曼珠院。古くからの信仰を守り、聖山への立ち入りを監視する護衛僧の入門式が開かれていた。俗世の銃器を退け、杖と信仰の祈りで山を守護する伝統の職分である。",
      c: [
        $terraData.K("女神の祭壇に額づき、僧兵の誓いを立てる", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "純粋な信仰と節度ある振る舞いが長老たちに認められ、聖山護衛僧として迎えられた。清貧の僧衣をまとい、神聖なる山の静寂を守る。",
          $terraData.regionalCareerStaff(
            "kje_monk",
            "kjerag-vine-court-monk",
            "イェラグ曼珠院",
            "聖山護衛僧",
            "kjerag-vine-guard",
            "カランドの女神の神聖を守り、聖山への侵入者を防ぐ",
            "vine-devotion",
            "聖山杖術・女神祈祷礼式",
            { p: 4, cr: 3 }
          )
        ], [
          1,
          "世俗の迷いが見えるとされ、入門を認められなかった。",
          { p: -2 }
        ]),
        $terraData.K("厳しい戒律を避け、山を下りる", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "静かに寺院を離れ、麓の村へ戻った。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // カズデル: 軍事委員会 サルカズ正規兵
    // -------------------------------------------------------------
    {
      id: "car_kazdel_mil_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1092 },
      show: s => s.res?.n === "カズデル" && s.job === 0 && !s.fl?.retired,
      t: "瓦礫と怨嗟が渦巻くカズデル。摂政王テレシス率いる軍事委員会が、ロンディニウム遠征とサルカズの復讐を果たすべく兵を集めていた。何千年も虐げられてきたサルカズ同胞の血と憎悪が渦巻く、冷酷な軍勢である。",
      c: [
        $terraData.K("復讐の旗の下に加わり、大剣を取る", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.4,
          "軍事委員会の将校から黒鉄の鎧と大剣を叩きつけられ、正規兵として登録された。他国への復讐とロンディニウム遠征の部隊に配属される。",
          $terraData.regionalCareerStaff(
            "kazdel_mil",
            "kazdel-military-commission",
            "カズデル軍事委員会",
            "軍事委員会正規歩兵",
            "kazdel-commission-conquest",
            "サルカズの怨念を晴らし、軍事委員会の覇業に身を投じる",
            "sarkaz-warfare",
            "源石刀身格闘・軍事遠征戦術",
            { h: 3, p: 2, war: 2.0 }
          )
        ], [
          0.75,
          "体力が劣ると見做され、前線の『突撃肉壁部隊』へ回された。生き残る確率が極めて低い過酷な消耗品兵士である。",
          $terraData.regionalCareerStaff(
            "kazdel_mil",
            "kazdel-military-commission",
            "カズデル軍事委員会",
            "前線突撃歩兵（肉壁）",
            "kazdel-commission-conquest",
            "最前線の盾として突撃させられる過酷な兵役",
            "sarkaz-warfare",
            "源石刀身格闘・軍事遠征戦術",
            { h: 1, p: -3, war: 2.5 }
          )
        ], [
          1,
          "サルカズ以外の異族が生意気に軍門へ近寄ったことを見咎められ、袋叩きにされて陣地から放り出された。",
          { p: -8, h: -6 }
        ]),
        $terraData.K("復讐の狂気を恐れ、軍営を離れる", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "血で血を洗う戦いを避け、荒野の廃墟へ身を隠した。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // カズデル: 伝統骨鍛冶（ボーンスミス）
    // -------------------------------------------------------------
    {
      id: "car_kazdel_bone_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "カズデル" && s.job === 0 && !s.fl?.retired,
      t: "巨大な魔獣の頭骨や鉱石病の遺骨から武器や触媒を削り出す、カズデル伝統の『骨鍛冶（ボーンスミス）』。源石アーツの呪術と繊細な彫刻工芸を組み合わせる、サルカズ古来の秘術である。",
      c: [
        $terraData.K("骨彫刻刀を握り、源石呪術の加工実技に挑む", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "骨の中に眠るアーツの導線を寸分狂わず彫り抜き、老鍛冶を唸らせた。伝統の骨鍛冶見習いとして工房に迎えられる。",
          $terraData.regionalCareerStaff(
            "kazdel_bone",
            "kazdel-bone-smith",
            "カズデル骨鍛冶工房",
            "骨鍛冶職人見習い",
            "kazdel-bonesmith-craft",
            "魔獣の骨と源石を刻み、呪術兵器を鍛え上げる",
            "bonesmith-sorcery",
            "骨器彫刻・源石呪術加工",
            { k: 3, p: 3 }
          )
        ], [
          1,
          "呪術の反動で手を滑らせ、高価な骨材を割ってしまった。工房から追い出された。",
          { p: -3, cash: -50000 }
        ]),
        $terraData.K("不気味な骨の工房を敬遠する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "死者の骨を扱う仕事を避け、工房を後にした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // イベリア: 審問所見習い審問官
    // -------------------------------------------------------------
    {
      id: "car_ibe_inq_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 19, year: 1092 },
      show: s => s.res?.n === "イベリア" && s.job === 0 && !s.fl?.retired,
      t: "港町の詰所で、裁判所の人員募集を知らせる紙が風に鳴っていた。海の異変への警戒が続くなか、見習い審問官には身元の照会もあるという。列に並ぶ人々のなかには、書類の出自欄を見つめたまま引き返す者もいた。",
      c: [
        $terraData.K("裁判所の採用試問を受ける", { show: { ban: ["種族:エーギル"] }, ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.4,
          "口頭試問を終えると、制服と灯りが渡された。見習い審問官として沿岸の警戒に加わることになり、詰所の当番表に自分の名が書き込まれた。",
          $terraData.regionalCareerStaff(
            "ibe_inq",
            "iberia-inquisition-officer",
            "イベリア裁判所",
            "見習い審問官",
            "iberia-inquisition-crusade",
            "海の怪物の侵食を阻み、深海教会の異端を根絶やしにする",
            "inquisition-doctrine",
            "異端審問尋問術・ランタン剣闘",
            { h: 2, p: 3, cr: 3 }
          )
        ], [
          0.7,
          "失踪した船員の記録について問われたとき、答えが詰まった。担当者は筆を置き、次の応募者の名を呼んだ。",
          { p: -4 }
        ], [
          1,
          "身元の証明書類に不備があると告げられた。窓口で申し立てても試問に戻る許可は下りず、長く並んだ列を逆に辿った。",
          { p: -5 }
        ]),
        $terraData.K("出自を申告し、試問を求める", { show: { need: ["種族:エーギル"] }, ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.75,
          "出自を告げると、審問官は帳面を閉じた。『今は採用できない』とだけ答え、理由を尋ねても次の列を指した。",
          { p: -6, cr: -1 }
        ], [
          1,
          "問答の途中、係官が沿岸の不審な往来について問い始めた。裏付けとなる証言も示されぬまま、衛兵に腕をつかまれ、裁判所の留置室へ連れていかれた。",
          { fl: { detained: 1 }, p: -12, h: -3 }
        ]),
        $terraData.K("審問官への応募を見送る", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "応募用紙を折りたたんで詰所を離れ、港の人足が集まる通りへ足を向けた。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // イベリア: 沿岸灯台調律師
    // -------------------------------------------------------------
    {
      id: "car_ibe_tuner_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "イベリア" && s.job === 0 && !s.fl?.retired && (s.k || 0) >= 25,
      t: "荒れ狂う海を睨む巨大な石造灯台『光の目』。海の怪物を退ける神聖なアーツ光線を放ち続けるため、高所にある巨大アーツランタンの波長を調整する調律師が募集されていた。",
      c: [
        $terraData.K("アーツレンズの偏光調整試験を受ける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "巨大レンズの焦点を正確に合わせ、眩い光条を海へと放った。沿岸灯台の正規調律師として採用され、波音を聞く高塔での勤務が始まる。",
          $terraData.regionalCareerStaff(
            "ibe_tuner",
            "iberia-lantern-tuner",
            "イベリア灯台庁",
            "灯台調律技術員",
            "iberia-lantern-tuning",
            "光の目を維持し、大静謐の暗闇からイベリアの沿岸を守る",
            "optics-tuning",
            "光学アーツ調律・高塔保全",
            { k: 3, p: 2 }
          )
        ], [
          1,
          "レンズの波長を狂わせてしまい、試験失格となった。",
          { p: -2, k: 1 }
        ]),
        $terraData.K("高塔の勤務を辞退する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "海風の吹きすさぶ灯台を離れ、塩田や漁村の仕事を探すことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ボリバル: 正規・真正連合軍兵士
    // -------------------------------------------------------------
    {
      id: "car_bol_soldier_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "ボリバル" && s.job === 0 && !s.fl?.retired,
      t: "三つ巴の内戦で国土が焦土と化すボリバル。日当目当ての若者や強制徴募された農民が、泥濘の塹壕へ集められていた。軍靴代や弾薬代すら給料から天引きされる、過酷極まりない泥沼の戦場である。",
      c: [
        $terraData.K("前金を受け取り、泥だらけの銃を受け取る", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.6,
          "錆びたライフルを手渡され、連合軍の前線小隊に放り込まれた。敵がシンガス王朝軍か真正軍かも定かでない混沌の塹壕戦が始まる。",
          $terraData.regionalCareerStaff(
            "bol_soldier",
            "bolivar-coalition-soldier",
            "ボリバル連合軍",
            "前線塹壕歩兵",
            "bolivar-coalition-war",
            "泥沼の内戦で一日でも長く生き延び、家族への仕送りを稼ぐ",
            "trench-warfare",
            "塹壕戦術・泥濘地持久",
            { h: 2, p: -1, debt: 200000 }
          )
        ], [
          1,
          "病弱な体を見咎められ、徴募官から『お前のような病人は弾除けにもならん』と蹴り出された。",
          { p: -3, h: -1 }
        ]),
        $terraData.K("内戦から逃れ、物陰に隠れる", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "徴募隊の目を盗んで逃げ出し、コーヒー農園の物陰に身を潜めた。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ボリバル: ドッソレス特区市警
    // -------------------------------------------------------------
    {
      id: "car_bol_dossoles_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1092 },
      show: s => s.res?.n === "ボリバル" && s.job === 0 && !s.fl?.retired,
      t: "内戦を他所に、歓楽と巨額の資本が渦巻く人工湖の観光都市ドッソレス。カンディード市長の統治下で、水上リゾートの治安を守る特区市警が募集されていた。華やかなネオンの裏で、密輸船や裏社会の揉め事を取り締まる。",
      c: [
        $terraData.K("水上艇の操縦と制圧射撃の試験を受ける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "高速ボートを見事に操り、特区市警のバッジを受け取った。ドッソレスの観光客とリゾート施設を守る警備任務に就く。",
          $terraData.regionalCareerStaff(
            "bol_dossoles",
            "bolivar-dossoles-police",
            "ドッソレス特区市警",
            "水上市警巡査",
            "bolivar-dossoles-security",
            "リゾート都市ドッソレスの華やかな治安を死守する",
            "dossoles-patrol",
            "高速艇操縦・水上制圧射撃",
            { h: 2, cr: 2, p: 2 }
          )
        ], [
          1,
          "操縦ミスで桟橋にボートを激突させ、失格となった。弁償代を取られなかっただけ幸いだった。",
          { p: -3, h: -1 }
        ]),
        $terraData.K("歓楽街の求人を避ける", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "警察の職を辞退し、ホテルのボーイなどを目指すことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // レム・ビリトン: 採掘重機主任技師
    // -------------------------------------------------------------
    {
      id: "car_rim_eng_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "レム・ビリトン" && s.job === 0 && !s.fl?.retired,
      t: "コータス族が主導する巨大採掘国家レム・ビリトン。地平線を覆う巨大自走採掘プラットフォーム『アイアンキャロット』等の心臓部を担う重機主任技師の選考が行われていた。巨大油圧ドリルと天災退避機構の運用を指揮する重責である。",
      c: [
        $terraData.K("巨大採掘ドリルの油圧系統と地盤診断の試験に挑む", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "重機の異常振動を一瞬で聞き分け、安全弁を操作した。大手鉱業会社の正規重機主任技師として、採掘プラットフォームの運用を任される。",
          $terraData.regionalCareerStaff(
            "rim_eng",
            "rim-mining-lead-engineer",
            "レム・ビリトン鉱山会社",
            "採掘プラットフォーム主任技師",
            "rim-mining-platform-engineering",
            "巨大採掘機を運用し、源石鉱脈から巨額の富を掘り出す",
            "mining-heavy-machinery",
            "重機油圧保全・地質破砕工学",
            { h: 2, k: 3, p: 2 }
          )
        ], [
          1,
          "技師枠には届かず、現場監督から『ツルハシの手元掘りなら人手が欲しい』と打診された。粉塵舞う地下最深部へ送られ、源石被曝のリスクを背負うこととなった。",
          $terraData.regionalCareerStaff(
            "rim_eng",
            "rim-mining-lead-engineer",
            "レム・ビリトン鉱山会社",
            "坑内ツルハシ採掘夫",
            "rim-mining-platform-engineering",
            "手作業で源石鉱脈を砕き、粉塵に咽びながら働く",
            "mining-heavy-machinery",
            "重機油圧保全・地質破砕工学",
            { h: 2, p: -2, debt: 100000 }
          )
        ]),
        $terraData.K("鉱山を離れ、トランスポーターを目指す", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "危険な採掘現場を避け、トラックの輸送仕事を探すことにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ミノス: 英雄神殿競技勇士
    // -------------------------------------------------------------
    {
      id: "car_min_champ_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "ミノス" && s.job === 0 && !s.fl?.retired,
      t: "古代ポリスの自由と鍛錬の美を重んじるミノス。神々に捧げるアクロポリスの大競技会で、都市の名誉を背負って戦う『競技勇士』の選抜会が開かれていた。鋼の筋肉と不屈の精神を持つ者だけが、市民たちの喝采を浴びる。",
      c: [
        $terraData.K("円盾と槍を取り、神前試合に挑む", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "力強い槍捌きで対戦相手を圧倒し、オリーブの冠を授けられた。アテヌス神殿の競技勇士として、都市の英雄の一人に名を連ねる。",
          $terraData.regionalCareerStaff(
            "min_champ",
            "minos-temple-champion",
            "ミノス英雄神殿",
            "神殿競技勇士",
            "minos-temple-glory",
            "肉体を極限まで鍛え、ポリスの自由と名誉のために戦う",
            "pankration-spear",
            "パンクラチオン格闘・神殿重装槍術",
            { h: 4, p: 3, cr: 3 }
          )
        ], [
          1,
          "予選で屈強な牛角の勇士に突き飛ばされ、敗退した。市民たちの声援に応えられず肩を落とした。",
          { p: -3, h: -1 }
        ]),
        $terraData.K("競技会への出場を見送る", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "怪我のリスクを避け、観客席で応援することにした。",
          { p: 1 }
        ])
      ]
    },

    // -------------------------------------------------------------
    // ミノス: 市民集会・法廷弁論官
    // -------------------------------------------------------------
    {
      id: "car_min_orator_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 18, year: 1090 },
      show: s => s.res?.n === "ミノス" && s.job === 0 && !s.fl?.retired && (s.k || 0) >= 25,
      t: "市民たちが集い、哲学と民主的な議論を交わすミノスのアゴラ（広場）。法廷での弁論や政策の立案を担う『弁論官』が募集されていた。雄弁な論理、確固たる正義感、そして市民たちの信用が求められる。",
      c: [
        $terraData.K("市民集会の演壇に立ち、法と倫理の演説を行う", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.5,
          "理路整然とした弁論で聴衆の拍手喝采を浴び、市民投票で弁論官に選出された。アゴラの演壇で、都市の法と正義を追究する。",
          $terraData.regionalCareerStaff(
            "min_orator",
            "minos-agora-orator",
            "ミノス市民集会",
            "法廷弁論官",
            "minos-agora-debates",
            "アゴラで市民の自由と正義を論じ、公正な裁判を行う",
            "philosophical-oratory",
            "古典哲学修辞学・ポリス法廷弁論",
            { k: 3, cr: 3, p: 2 }
          )
        ], [
          1,
          "演説の途中で言葉に詰まり、市民たちから野次を飛ばされた。弁論官の座を逃した。",
          { p: -3, k: 1 }
        ]),
        $terraData.K("演壇に上がるのを遠慮する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "大衆の前で話す重圧を避け、書記の仕事を探すことにした。",
          { p: 1 }
        ])
      ]
    }
  ];

  for (const event of E) {
    event.references = [...new Set([...(event.references || []), "SRC_REGIONAL_CAREERS"])];
    $terraData.EV.push(event);
  }
});
