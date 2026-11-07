// routes/rhodes-and-factions/cross-faction-routes: Intersecting and defection events between Rhodes Island and Reunion.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/cross-faction-routes"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const events = [
    {
      id: "sr_intersect_battlefield_mercy",
      conf: "S",
      references: ["SRC_RHODES_FOUNDATION"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.45,
      ge: { year: 1096 },
      show: s =>
        $terraData.srOnStaff(s) &&
        (s.job === 31 || s.job === 34) &&
        ["ウルサス", "ヴィクトリア"].includes(s.res?.n),
      t: "硝煙の立ち込める市街戦の廃墟で外勤任務中、倒壊した建物の瓦礫の陰に、深手を負って倒れているレユニオンの感染者戦闘員を見かけた。こちらに気づいた相手は、怯えと憎悪の混ざった目で震える手で刃を握り直そうとしている。",
      c: [
        $terraData.K("敵意がないことを示し、ロドスの応急処置キットを使って止血と創傷処置を行う", {}, [
          1,
          "武器を下ろして身構えを解き、黒い結晶が露出した傷口へ素早く包帯を巻いて鎮痛剤を手渡した。「なぜ敵を助ける」と呆然と呟く相手に「命を救うのがロドスです」と短く告げ、去り際に後方の安全な脱出路を指し示した。",
          {
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 1,
              reason: "戦場で敵味方を問わず人道救命を行った"
            },
            rl: 2,
            p: 2,
            biasInf: -20
          }
        ]),
        $terraData.K("武器だけを速やかに回収して無力化し、深入りせずその場を離脱する", {}, [
          1,
          "落ちていた鉈を足で蹴り飛ばして敵意を削ぎ、援軍が駆けつける前に小隊の合流地点へ足早に戻った。背中に突き刺さる無言の視線を感じながらも、任務の安全を優先した。",
          { p: 1 }
        ]),
        $terraData.K("なぜ命を捨ててまで街を破壊するのか、傷口を押さえながら問いかける", {}, [
          1,
          "「俺たちには選べる道など初めからなかった」と男は吐き捨てるように語った。炭鉱での虐待、家族を焼き殺された記憶……テラの底に沈む救いのない怨嗟の深さに打ちのめされ、言葉を失った。",
          { biasInf: -30, k: 2, p: 0 }
        ])
      ]
    },
    {
      id: "sr_intersect_hostage_sympathy",
      conf: "S",
      references: ["SRC_RHODES_MEDICAL", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.45,
      ge: { year: 1096 },
      show: s =>
        s.lifeRecord?.affiliations?.some(a => ["reunion-1096", "reunion-reorg"].includes(a.id) && ["active", "crisis"].includes(a.status)),
      t: "哨戒任務中、立ち往生していた大型医療装甲車を包囲した。車体にはロドス・アイランドの紋章が刻まれており、白衣を着た医療スタッフたちが、荷台に積まれた感染者のための医薬品と衰弱した避難民を必死に庇い立てしている。",
      c: [
        $terraData.K("彼らが感染者を無償で治療する医師だと知り、仲間に銃口を下げさせる", {}, [
          1,
          "「こいつらは都市の軍警じゃない、病気の仲間を診る医者たちだ」と叫んで仲間の略奪を制止した。ロドスの隊長は深く頷き、感謝の印として予備の抗感染薬を置いて静かに去っていった。",
          { p: 2, rl: 2, biasInf: -20 }
        ]),
        $terraData.K("負傷者のための医薬品のみを最低限徴発し、スタッフの身の安全を保障して解放する", {}, [
          1,
          "前線の野戦病院で必要不可欠な抗生物質と包帯だけを譲り受け、医療スタッフと患者には手を出さずに通過を許可した。厳しい現実の中でのぎりぎりの判断だった。",
          { p: 1, med: 1 }
        ]),
        $terraData.K("移動都市に協力する偽善者とみなし、車両もろとも拿捕して物資を根こそぎ奪う", {}, [
          1,
          "必死に懇願する医師たちを突き飛ばし、すべての医療物資を荷台から奪い去った。物資は確保できたものの、泣き叫ぶ避難民の顔が頭から離れず、胸に重い痛みが残った。",
          { p: -2, biasInf: 10 }
        ])
      ]
    },
    {
      id: "sr_rhodes_to_reunion_turning_point",
      conf: "S",
      references: ["SRC_RHODES_FOUNDATION", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年"],
      cd: 5,
      w: 0.35,
      ge: { year: 1095 },
      show: s =>
        $terraData.srOnStaff(s) &&
        s.year >= 1096 &&
        (s.job === 31 || s.job === 34) &&
        (s.biasInfected || 0) <= 25 &&
        !s.lifeRecord?.affiliations?.some(a => a.id === "reunion-reorg" &&
          ["active", "crisis", "suspended"].includes(a.status)),
      t: "移動都市の路地裏で、正規軍と警官隊による感染者強制隔離区画の無差別掃討を目撃した。泣き叫ぶ子供や無抵抗の老人が銃床で殴り倒されている。しかし通信機からは「ロドスの中立原則を維持せよ。交戦への軍事介入は厳禁」という冷徹な命令が響いていた。",
      c: [
        $terraData.K("中立という名の傍観を捨て、銃を取って虐殺を止め、レユニオンの隊列に加わる", {}, [
          1,
          "通信機を足元で踏み砕き、制服の記章を引きちぎって軍警の列へ銃弾を撃ち込んだ。生き残った感染者たちを連れて包囲を脱出し、雪原のレユニオン合流地へ向かった。二度と合法の世界には戻れないが、魂を裏切らずに済んだ。",
          {
            job: 0,
            lifeAffiliation: {
              id: "rhodes-staff",
              title: "ロドス・アイランド",
              action: "leave",
              note: "感染者虐殺を前に中立を捨てレユニオンへ転向"
            },
            lifeGoals: [{
              id: "rhodes-work",
              action: "abandon",
              onlyIfAffiliation: "rhodes-staff",
              onlyIfUnresolved: true,
              note: "ロドスの勤務を辞し、別の組織へ活動を移した"
            }],
            lifeAffiliations: [
              {
                id: "reunion-reorg",
                title: "レユニオン・ムーブメント",
                kind: "infected-mutual-aid",
                action: "join",
                role: "最前線自衛戦闘班"
              }
            ],
            lifeGoal: {
              id: "reunion-relief",
              title: "所属した隊で感染者の生活と安全を支える",
              priority: "地域と安全",
              action: "start",
              note: "ロドス勤務を辞し、再編後の隊に加わった"
            },
            fl: { reunion: 1 },
            p: 2
          }
        ]),
        $terraData.K("無力感に爪を立てながらも命令に従い、生存者の救護と治療という自らの職責に留まる", {}, [
          1,
          "奥歯が砕けるほど噛み締めながら銃を下ろし、軍警が去った後に散乱する路地で生き残った重傷者の救命に駆け寄った。政治の残酷さと、ロドスが背負う中立の重さに深く苦悩した。",
          { p: -1, k: 2 }
        ])
      ]
    },
    {
      id: "sr_reunion_to_rhodes_sanctuary",
      conf: "S",
      references: ["SRC_RHODES_MEDICAL", "SRC_ORIPATHY_SOCIAL"],
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.45,
      ge: { year: 1097 },
      show: s =>
        s.lifeRecord?.affiliations?.some(a => ["reunion-1096", "reunion-reorg"].includes(a.id) && ["active", "crisis"].includes(a.status)) &&
        !s.lifeRecord?.affiliations?.some(a => a.id === "rhodes-care" &&
          ["active", "crisis", "suspended"].includes(a.status)) &&
        (s.ob >= 40 || s.h <= 45),
      t: "組織の瓦解と激しい内紛の果て、極寒の荒野で吹雪に巻かれて倒れ伏した。全身の源石結晶が激痛を放ち、意識が遠のく中、巨大な陸上移動艦の轟音とともに白い防護服を着た救助隊が駆け寄ってきた。",
      c: [
        $terraData.K("武器を捨て、ロドスの医療保護と隔離治療を受け入れる", {}, [
          1,
          "凍りついた短剣を手放し、担架へと身体を預けた。目を覚ますとそこは暖かな無菌病室で、点滴の管と穏やかな眼差しの医師がいた。「もう戦わなくていい」という言葉に、張り詰めていた糸が解けて涙が零れた。",
          {
            lifeGoals: [
              {
                id: "protect-neighbours",
                action: "abandon",
                onlyIfAffiliation: "reunion-1096",
                onlyIfUnresolved: true,
                note: "所属隊の活動を離れ、治療のために保護を受けた"
              },
              {
                id: "reunion-relief",
                action: "abandon",
                onlyIfAffiliation: "reunion-reorg",
                onlyIfUnresolved: true,
                note: "再編互助網の活動を離れ、治療のために保護を受けた"
              }
            ],
            lifeAffiliations: [
              {
                id: "reunion-1096",
                action: "leave",
                onlyIfActiveOrCrisis: true,
                note: "活動を離れてロドスの医療保護を受けた"
              },
              {
                id: "reunion-reorg",
                action: "leave",
                onlyIfActiveOrCrisis: true,
                note: "活動を離れてロドスの医療保護を受けた"
              },
              {
                id: "rhodes-care",
                title: "ロドスへの療養相談",
                kind: "medical-contact",
                action: "join",
                role: "本艦・保護療養患者（元レユニオン）"
              }
            ],
            fl: { reunion: 0 },
            h: 3,
            p: 2
          }
        ]),
        $terraData.K("捕虜になることを拒絶し、残された力で荒野の奥へと歩き去る", {}, [
          1,
          "差し伸べられた手を振り払い、よろめく足取りで猛吹雪の暗闇へと姿を消した。孤独と病魔に蝕まれながらも、誰にも屈しない野良犬としての生き方を選んだ。",
          { p: -2, h: -3 }
        ])
      ]
    },
    {
      id: "sr_reunion_turncoat_rehabilitation",
      conf: "S",
      references: ["SRC_RHODES_FOUNDATION"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.5,
      ge: { year: 1097 },
      show: s =>
        s.lifeRecord?.affiliations?.some(a => a.id === "rhodes-care" &&
          ["active", "crisis"].includes(a.status) && a.role?.includes?.("元レユニオン")) &&
        !s.lifeRecord?.affiliations?.some(a => a.id === "rhodes-staff" &&
          ["active", "crisis", "suspended"].includes(a.status)),
      t: "ロドス本艦での投薬と療養によって体調が劇的に回復した。過去の経歴審査を終えた人事担当者から「船内で働きながら、新しい人生を歩み直してみないか」と更生雇用の提案を受けた。",
      c: [
        $terraData.K("倉庫の仕分けや宿舎の清掃など、非戦闘の生活支援員として第二の人生を始める", {}, [
          1,
          "人を傷つける仕事から離れ、医薬品の荷役や食堂の配膳を担当する生活支援員（J 28）として正式に雇用された。温かな湯気の中で仲間たちと笑い合う日々に、確かな救いを見出した。",
          $terraData.srStaff("service", "本艦・船内居住／職務:物資支援（元レユニオン）", "rhodes-supply", "物資と生活支援の実務", 2)
        ]),
        $terraData.K("過去の過ちを償うため、行動予備隊に志願して他者を守るための訓練を受ける", {}, [
          1,
          "かつて破壊のために振るった武器を、今度は誰かを守る盾とするため、行動予備隊（J 34）の訓練生となった。教官の厳しい指導と仲間の温かい励ましを受け、まっすぐに前を向いて走り始めた。",
          $terraData.srStaff("reserve", "行動予備隊員（元レユニオン）", "rhodes-reserve", "隊内連絡・事務手順・基礎訓練", 2)
        ]),
        $terraData.K("組織には所属せず、治療薬を携えて静かに船を降りる", {}, [
          1,
          "数か月分の抑制薬を受け取り、港町で船を降りた。名もなき旅人として、平穏な暮らしを求めて見知らぬ大地へと歩き出した。",
          {
            lifeAffiliation: {
              id: "rhodes-care",
              title: "ロドスへの療養相談",
              action: "leave",
              note: "更生治療を終え下船"
            },
            p: 1
          }
        ])
      ]
    }
  ];

  $terraData.EV.push(...events);
});
