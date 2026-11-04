// life/goals-and-family: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("life/goals-and-family", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "lifeRefs",
    ["SRC_PEOPLE_LIFE_V74", "SRC_PEOPLE_MOUSSE", "SRC_PEOPLE_PODENCO", "SRC_PEOPLE_SUSSURRO"],
    false
  );

  $terraData.EV.push(
    {
      id: "people_work_life_conversation",
      conf: "S",
      references: $terraData.lifeRefs,
      st: ["青年", "壮年", "老年"],
      cd: 5,
      w: 0.42,
      show: s => {
        const p = $rules.facilities.facilityPersonFor(s, "workplace");
        return (
          !!p &&
          p.actualStatus === "working" &&
          p.contactState !== "distant" &&
          s.year - p.metYear >= 1 &&
          (!p.knownLife || s.year - p.knownLife.heardYear >= 3)
        );
      },
      t: "昼休みの片隅で、顔なじみの同僚が冷めた茶を飲みながら勤務表を眺めていた。次の作業の打ち合わせが終わり、ふっと言葉が途切れる。",
      c: [
        $terraData.K("仕事から離れて、最近の暮らしぶりを尋ねる", {}, [
          1,
          "家のことや休みの日の過ごし方をぽつりぽつりと語り合った。始業のベルが鳴り、また後でと笑って持ち場へ戻った。",
          { facilityPersonAction: { kind: "workplace", action: "talk" }, rl: 1 }
        ]),
        $terraData.K("午後の段取りだけ確かめて切り上げる", {}, [
          1,
          "午後の手順をもう一度すり合わせ、短い休憩の残りを黙って過ごしてから持ち場へ戻った。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "people_school_life_conversation",
      conf: "S",
      references: $terraData.lifeRefs,
      st: ["少年", "青年", "壮年"],
      cd: 6,
      w: 0.42,
      show: s => !!educationLegacyTeacherContact(s,{known:true}),
      t: s => educationLegacySceneGuard(s,"education_school_classroom")
        ? "授業後の教室で、いつも教えてくれる先生がチョークの粉を払いながら机を並べていた。授業以外の話をしたことはまだない。"
        : "夕暮れの道で再会したかつての恩師と、懐かしさに足をとめて言葉を交わした。教わっていた頃を思い出しながら、今の暮らしについて立ち話をする。",
      c: [
        $terraData.K("最近の暮らしぶりや近況を尋ねてみる", {}, [
          1,
          "教壇の向こうでは見えなかった普段の暮らしの話を聞き、帰り道でもその言葉が温かく胸に残った。",
          { educationAction:"legacy:teacher-talk", rl: 1 }
        ]),
        $terraData.K("前に習ったことで気になっていた疑問を一つだけ尋ねる", {}, [
          1,
          "ずっと引っかかっていた問いを一つだけ尋ね、明快な答えに礼を言ってから別れた。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "people_clinic_life_conversation",
      conf: "S",
      references: $terraData.lifeRefs,
      st: ["青年", "壮年", "老年"],
      cd: 6,
      w: 0.39,
      show: s => {
        const p = $rules.facilities.facilityPersonFor(s, "clinic");
        return (
          !!p &&
          p.actualStatus === "working" &&
          p.contactState !== "distant" &&
          s.year - p.metYear >= 1 &&
          (!p.knownLife || s.year - p.knownLife.heardYear >= 3)
        );
      },
      t: "待合いの人波がようやく引いた頃、見慣れた受付の担当者が肩を回しながら伝票の束を揃えていた。もうすぐ交代の時間らしい。",
      c: [
        $terraData.K("手が空いた合間に、最近の調子を尋ねる", {}, [
          1,
          "忙しさが落ち着いた窓口で、最近の暮らしぶりを少しだけ交わした。次の急患が飛び込んできて、会話はそこで途切れた。",
          { facilityPersonAction: { kind: "clinic", action: "talk" }, rl: 1 }
        ]),
        $terraData.K("用件だけ手短に済ませて帰る", {}, [
          1,
          "疲れている相手を引き止めないよう、次の予約と会計だけを済ませて消毒薬の匂いが残る戸口を出た。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "people_work_care_schedule",
      conf: "S",
      references: $terraData.lifeRefs,
      st: ["青年", "壮年", "老年"],
      cd: 7,
      w: 0.5,
      show: s => {
        const p = $rules.facilities.facilityPersonFor(s, "workplace");
        return (
          !!p &&
          p.actualStatus === "working" &&
          p.life &&
          ["relative", "household"].includes(p.life.care) &&
          p.contactState === "familiar"
        );
      },
      t: "顔なじみの同僚から、家族の看病でどうしても手が離せず、来週のシフトを少し代わってもらえないかと小声で頼まれた。こちらにも自分の持ち場がある。",
      c: [
        $terraData.K("自分の手が空く時間帯だけ作業を肩代わりする", {}, [
          1,
          "丸一日は無理だがこの工程なら引き受けられると伝え、来週の段取りを二人で組み直した。同僚はほっとしたように頭を下げた。",
          { facilityPersonAction: { kind: "workplace", action: "help" }, rl: 2 }
        ]),
        $terraData.K("こちらの手も回らないと伝え、責任者へ掛け合うよう勧める", {}, [
          1,
          "個人同士で穴埋めするには無理があると伝え、正式に人手を割り振ってもらうよう責任者へ相談させた。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "people_school_housing_concern",
      conf: "S",
      references: $terraData.lifeRefs,
      st: ["少年", "青年", "壮年"],
      cd: 7,
      w: 0.36,
      show: s => !!educationLegacyTeacherContact(s,{known:true}),
      t: "顔なじみの教え手が教材箱の蓋を閉じた。次の授業の支度で忙しそうだ。片づけを手伝うか、次に扱う内容を尋ねるか考えた。",
      c: [
        $terraData.K("教材箱の運搬や黒板消しを手伝う", {}, [
          1,
          "少しでも早く帰れるよう、重い箱を一緒に棚へ運んだ。教え手は礼を言い、机の上の講義ノートを鞄へ収めた。",
          { educationAction:"legacy:teacher-concern", rl: 1 }
        ]),
        $terraData.K("次の授業でどこを扱うかだけ確かめておく", {}, [
          1,
          "次回の範囲を尋ねると、教え手は端に書き込みのある予定表を示しながら、要点を手短に教えてくれた。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "people_clinic_skill_continuity",
      conf: "S",
      references: $terraData.lifeRefs,
      st: ["青年", "壮年", "老年"],
      cd: 8,
      w: 0.34,
      show: s => {
        const p = $rules.facilities.facilityPersonFor(s, "clinic");
        return (
          !!p && p.actualStatus === "working" && p.life?.goal === "learn" && p.contactState === "familiar"
        );
      },
      t: "顔なじみの受付係が、新しく書き直した案内札を前に首をひねっていた。声をかけると、初めて来る患者にもすぐ伝わる言い回しを考えているところだと言う。",
      c: [
        $terraData.K("患者の目線から、少し迷いそうな箇所を伝える", {}, [
          1,
          "年寄りや急患がパッと見て迷いそうな一行を指さした。係はなるほどと頷き、すぐさま筆を取り直した。個人の意見が施設の手順を変えたことにはならないが、その場で少し役には立ったようだ。",
          { facilityPersonAction: { kind: "clinic", action: "feedback" }, k: 1 }
        ]),
        $terraData.K("邪魔をしないよう、自分の受付だけ済ませる", {}, [
          1,
          "必要な窓口だけを確かめて待合いへ回った。机の上では、まだ新しい案内札の試行錯誤が続いていた。",
          { p: 1 }
        ])
      ]
    }
  );

  $terraData.SETTING_SOURCES.SRC_V76_EMPLOYMENT = {
    title: "闇夜に生きる DM-5『軍旗』",
    url: "https://shimadouma.github.io/astrhtml/events/act9d0/stories/DM-5.html",
    kind: "日本語版ゲーム内シナリオ本文の閲覧",
    note: "サルカズの傭兵らが部隊への参加と離脱について個別の事情で判断する。雇用主・職務・所属を分ける設計上の参考。一般企業の給与・労働契約の数値は未記載。"
  };

  $terraData.SETTING_SOURCES.SRC_V76_LATERANO_SARKAZ = {
    title: "ラテラーノ・サルカズの歴史と居住をめぐる問題",
    url: "https://arknights.wiki.gg/wiki/Laterano",
    kind: "英語版ファンWiki二次整理（一次本文との照合が必要）",
    note: "ラテラーノとサルカズの歴史的対立や入境制限、信教・市民資格の違いを記す。年代・例外・滞在者の資格は公式全時代の統一法令として扱わない。"
  };

  $terraData.SETTING_SOURCES.SRC_V87_LATERANO_GATE = {
    title: "空想の花庭 HE-2「いのちの水の河」行動前",
    url: "https://smartgamecap.net/?p=43773",
    kind: "日本語版イベント本文の翻訳転載",
    note: "フェデリコはこの時点でラテラーノがサルカズを門から通さないと説明し、修道院の住民移住案からサルカズが除かれる。個人の求人・照会・別経路・例外許可や全時代の一律法を定めない。"
  };

  $terraData.SETTING_SOURCES.SRC_V76_SANKTA_SARKAZ = {
    title: "サンクタとサルカズの共通の歴史",
    url: "https://arknights.wiki.gg/wiki/Sankta",
    kind: "英語版ファンWiki二次整理",
    note: "サンクタとサルカズの対立を歴史的に整理。特定個人の性格や行動を種族から確定できない。"
  };

  $terraData.SETTING_SOURCES.SRC_V76_ENFORCER = {
    title: "エンフォーサー第四資料（セシリアについて）",
    url: "https://dataknights.pages.dev/ja/operators/enforcer",
    kind: "日本語版ゲーム内人物資料の転載",
    note: "セシリアがサンクタとサルカズの混血児であり、長年の両者の確執を越えた具体例として記録されている。混血児の性質や血統の一般則をゲームの単純な交配表で確定しない。"
  };

  $terraData.SETTING_SOURCES.SRC_V76_IBERIA_AEGIR = {
    title: "狂人号 SN-8『観測所』",
    url: "https://shimadouma.github.io/astrhtml/events/act17side/stories/SN-8.html",
    kind: "日本語版シナリオ本文の非公式転載",
    note: "グランファーロのエーギル人が連行され、関係者とそうでない者の区別や審問に疑義が示される。イベリア全土のすべての役所に同じ規則があるとは示さない。"
  };

  $terraData.SETTING_SOURCES.SRC_V76_TARA = {
    title: "この炎が照らす先 FC-8『彼女の影』",
    url: "https://shimadouma.github.io/astrhtml/events/act22side/stories/FC-8.html",
    kind: "日本語版シナリオ本文の非公式転載",
    note: "ターラーの訛りと社会階層・仕事・教育・制度的な不平等、同郷内部の利害の違いが語られる。語り手の主張を全ヴィクトリアの全国一律な客観規則としない。"
  };

  $terraData.SETTING_SOURCES.SRC_V76_URSUS = {
    title: "相変臨界 17-4『沈黙する生命たち』",
    url: "https://shimadouma.github.io/astrhtml/main/chapter_17/stories/17-4.html",
    kind: "日本語版シナリオ本文の非公式転載",
    note: "ウルサス軍務内の異種族兵士の視認性や感染者の扱いを描く特定の軍・時期の場面。名簿・配置手順や、軍務外の一般職場・全時代の制度は示さない。"
  };

  $terraData.SETTING_SOURCES.SRC_URSUS_EP17 = {
    title: "相変臨界 17-4『沈黙する生命たち』・17-5『抜け殻に過ぎず』",
    url: "https://shimadouma.github.io/astrhtml/main/chapter_17/stories/17-4.html",
    kind: "日本語版シナリオ本文の非公式転載",
    note: "17-4で一人の坑夫が、親戚から工場の求人を聞き、感染者も街に入れるのかと話す。人物の伝聞と推測であり、採用実績・感染者向け制度・求人条件は確認されない。17-5にも感染者の入市をめぐる噂と待機列が描かれる。主人公の居住・応募・採用・職務・後年結果はゲーム上の仮定で、特定危機を全国制度や常設方針へ広げない。種族/出自、感染状態、軍務は別の属性・経験として扱う。"
  };

  $terraData.SETTING_SOURCES.SRC_URSUS_EP17_EVAC = {
    title: "相変臨界 17-16『前進あるのみ』・17-18『静寂な魂』",
    url: "https://shimadouma.github.io/astrhtml/main/chapter_17/stories/17-16.html",
    kind: "日本語版シナリオ本文の非公式転載",
    note: "住民の集会でトゥーリンが軍研究と感染者の扱いを告発し、退避を呼びかける。17-18では年寄りと子どもを優先する誘導、避難者を見守る人々、意識不明者を台車へ乗せる行為、避難に応じない住民も描かれる。特定の危機における複数の個別場面であり、全住民の避難、経路の安全、全員の同意、恒久的な住居・雇用を保証しない。主人公の集会参加・退避・支援・帰還はゲーム上の仮定とする。"
  };

  $terraData.SETTING_SOURCES.SRC_URSUS_EP17_TIMELINE = {
    title: "Arknights Timeline (community-maintained)",
    url: "https://arknights.wiki.gg/wiki/Arknights_Timeline",
    kind: "ファンWikiの二次年表",
    note: "ゼルグラード危機を1102年1月19–22日として配置する二次年表を、イベントを1102年に限定するため参照。一次本文が日付を明示する根拠とは扱わず、年次は低確度の実装上の時期指定。都市抽選率・人口比・感染者採用制度の根拠ではない。"
  };

  $terraData.SETTING_SOURCES.SRC_URSUS_ZELGRAD_CITY = {
    title: "Zelgrad - Arknights Terra Wiki",
    url: "https://arknights.wiki.gg/wiki/Zelgrad",
    kind: "ファンWikiの二次整理（項目は執筆途上）",
    note: "第17章の作中報告は、石棺が1100年初頭にウルサス中南部の大都市へ移され、機密保持のため近隣の中小衛星都市に置かれた可能性を述べる。移送先衛星都市を後続章に登場するゼルグラードと結ぶのは二次資料との照合で、報告自体は正式名称・一般居住開始年を示さない。1100年を最初の出生地候補とするのは稼働済みの衛星都市があった可能性を表すゲーム近似で、創設年の確定ではない。移動都市区分も二次資料に依存し暫定。人口比・移動経路・居住者の代表性は未確認で、抽選率はゲーム仮定。"
  };

  $terraData.SETTING_SOURCES.SRC_URSUS_EP17_ZELGRAD_TRANSFER = {
    title: "相変臨界 17-15後の報告資料C-3",
    url: "https://arknights.wiki.gg/wiki/17-15/Story",
    kind: "ゲーム内シナリオのコミュニティ転記（翻訳）",
    note: "報告は石棺が1100年初頭にウルサス中南部の大きな移動都市へ移され、機密上、その都市圏の中小衛星都市に置かれた可能性が高いと情報提供者が推測する。移送先の衛星都市名や一般居住の開始は確定しない。後続の第17章情報からゼルグラードと同定する判断、1100年の出生地候補化、抽選率はゲーム上の推定である。"
  };

  $terraData.SETTING_SOURCES.SRC_ZELGRAD_DISPLACED_WORK_MODEL = {
    title: "ゼルグラード勤務者一人の避難後の職歴",
    kind: "ゲーム用仮定",
    note: "第17章本文はゼルグラードの求人の噂と市民の退避を描くが、個々の工員の再就職、修理工房、契約期間、技能移転、旧勤務先への帰還は定めない。本イベントの求職・採用・退職は一人の架空の選択肢で、避難者全体の就労状況や工場の再開を示さない。"
  };

  for (const [id, label, value, detail] of [
    ["social.employerMinimumPayScale", "雇用先の賃金係数下限", 0.93, "勤務先ごとの契約賃金の初期差"],
    ["social.employerMaximumPayScale", "雇用先の賃金係数上限", 1.07, "勤務先ごとの契約賃金の初期差"],
    ["social.employerPayNegotiationStep", "雇用契約交渉の増額幅", 0.035, "交渉成功時の個人契約賃金上乗せ"],
    ["social.employerShortHoursIncomeFactor", "短時間契約の年間賃金比率", 0.78, "短時間勤務の年間給与比率"],
    [
      "social.employerLongHoursIncomeFactor",
      "長時間契約の年間賃金比率",
      1.06,
      "労働時間が長い契約の年間給与比率"
    ],
    [
      "social.npcSiteTransferChance",
      "施設関係NPCの同地区異動機会",
      0.016,
      "既知と実際の勤務地を区別した異動"
    ],
    [
      "social.intergroupEventNoInevitableOutcome",
      "地域・種族間の不利益が必ず起きるわけではない基準",
      1,
      "条件を満たす場合にもイベント抽選と分岐を通し、実際の不利益と遭遇機会を区別する"
    ]
  ])
    $terraData.SIM_PARAMS.push({
      id,
      label,
      value,
      unit: id.includes("PayScale") ? "倍率" : "ゲーム用係数",
      status: "S",
      scope: "雇用契約と確執",
      description: `${detail}。原作の実測値ではない。`,
      source: "ゲーム用仮定",
      references: ["SRC_V76_EMPLOYMENT"],
      usedBy: ["職場台帳", "NPC異動", "地域間の生活事件"]
    });

  $terraData.EVENT_EFFECT_TYPES.object.push("workContractAction", "intergroupAction");

  $terraData.EVENT_FIELD_META.workContractAction = {
    status: "S",
    valueType: "object",
    unit: "個人の契約行動",
    meaning: "実際の契約を持つ勤務先に限り、契約確認・給金交渉・勤務時間・担当工程の調整を記録する"
  };

  $terraData.EVENT_FIELD_META.intergroupAction = {
    status: "S",
    valueType: "object",
    unit: "地域・種族間の生活上の接点",
    meaning: "個人が経験または目撃した制度・職場・地域の接点。属性のみで不利益を自動確定しない"
  };
});
