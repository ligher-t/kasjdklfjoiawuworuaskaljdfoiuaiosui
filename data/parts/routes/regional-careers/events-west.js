// routes/regional-careers/events-west: distinct daily, choice, promotion, crisis, and mortality events for Ursus, Victoria, Leithania, and Laterano careers.
window.TERRA_DATA_BUILD.fragment(
  "routes/regional-careers",
  "routes/regional-careers/events-west"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const E = [
    // =============================================================
    // ウルサス: 帝国軍・近衛将校
    // =============================================================
    {
      id: "car_urs_officer_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "ウルサス" && $terraData.regionalCareerOnDuty(s, "urs_officer"),
      t: "要塞前広場で、凍てつく風の中を直立する兵士たちを馬上から閲兵した。毛皮の軍服に積もる雪を払うことも許さぬ絶対の軍規。ウルサスの軍事力は、この無情な服従の上に築かれている。",
      c: [
        $terraData.K("閲兵を終え、幕僚たちとウォッカで体を温める", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "暖炉の前で戦術談義を交わし、将校室へ戻った。",
          { p: 1, h: 1, cash: 200000 }
        ])
      ]
    },
    {
      id: "car_urs_officer_choice_purge",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 23 },
      show: s => s.res?.n === "ウルサス" && $terraData.regionalCareerOnDuty(s, "urs_officer"),
      t: "軍団長から極秘の密命が下された。反皇帝派の疑いがある同僚の貴族将校を、演習中の事故に見せかけて抹殺せよという。従えば軍団長の側近へ引き立てられるが、拒めば自らが反逆者として消される。",
      c: [
        $terraData.K("命令に従い、砲兵の誤爆に見せかけて標的を葬る", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          0.5,
          "事故偽装を完璧にやり遂げ、疑惑を一切持たれずに標的を排除した。軍団長から絶大な信任を得て、近衛少佐への昇進が決定した。",
          { cr: 5, p: -3, cash: 1500000, groupStanding: { id: "ursus-officers", title: "帝国軍将校団", delta: 3 },
            lifeAffiliation: { id: "ursus-imperial-officer", action: "role", role: "近衛少佐",
              onlyIfActiveOrCrisis: true, onlyIfRoleChanged: true } }
        ], [
          1,
          "偽装に綻びが生じ、相手の親族である大貴族に察知された。軍法会議にかけられ、銃殺刑を宣告された。",
          { h: -100, d: ["軍法会議での銃殺刑", "ウルサス帝国軍の軍法会議において、大貴族の謀殺罪により銃殺刑に処された。"] }
        ]),
        $terraData.K("良心に従って命令を拒絶し、将校を辞任する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "軍服を脱ぎ捨てて要塞を脱出した。不名誉除隊とされ全財産を没収されたが、命だけは守った。",
          { job: 0, cash: -2000000, p: 3, cr: -5 ,
            lifeAffiliation: { id: "ursus-imperial-officer", action: "leave",
              note: "命令を拒んで要塞を去り、不名誉除隊として軍籍を終えた" },
            lifeGoals: [
              { id: "ursus-imperial-command", action: "abandon", onlyIfUnresolved: true,
                note: "不名誉除隊により、帝国軍で指揮を続ける目標を終えた" },
              { id: "ursus-dismissed-officer-next-livelihood", title: "不名誉除隊後の暮らしと次の仕事を立て直す",
                priority: "生業", action: "start", preserveAchievement: true }
            ] }
        ])
      ]
    },

    // =============================================================
    // ウルサス: 国境警備兵・炭鉱監視憲兵
    // =============================================================
    {
      id: "car_urs_guard_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 19 },
      show: s => s.res?.n === "ウルサス" && $terraData.regionalCareerOnDuty(s, "urs_guard"),
      t: "鉛色の空の下、雪に埋もれたコンクリートトーチカで銃を抱えて立った。双眼鏡で荒涼たる雪原を監視し、凍えた手足を焚火にかざす。粗末な黒パンを齧りながら、交代のラッパを待つ。",
      c: [
        $terraData.K("交代兵に銃を引き渡し、粗末な兵舎へ戻る", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "藁の敷かれたベッドで泥のように眠った。",
          { h: 1, p: 1, cash: 80000 }
        ])
      ]
    },
    {
      id: "car_urs_guard_choice_riot",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 21 },
      show: s => s.res?.n === "ウルサス" && $terraData.regionalCareerOnDuty(s, "urs_guard"),
      t: "監視する感染者炭鉱の地下最深部で、虐待に耐えかねた囚人たちがツルハシを手に一斉に暴動を起こした。坑道の出入口を塞ぐ鉄扉の前で、援軍が来るまで銃剣で死守するか、扉を捨てて地上へ逃げるか。",
      c: [
        $terraData.K("鉄扉の前に踏みとどまり、銃剣で突撃を迎え撃つ", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.45,
          "猛烈なツルハシの連撃を銃剣で捌き、増援の到着まで扉を死守した。暴動は鎮圧され、勇敢さを称えられて憲兵軍曹へ昇進した。",
          { h: -3, p: 3, cr: 3, cash: 300000,
            lifeAffiliation: { id: "ursus-border-mine-guard", action: "role", role: "憲兵軍曹",
              onlyIfActiveOrCrisis: true, onlyIfRoleChanged: true } }
        ], [
          0.85,
          "重傷を負いながらも気絶するまで戦い抜いた。一命を取り留めたが、源石の破片を浴びて鉱石病を発症した。",
          { h: -10, p: -5, inf: 1, infectionRoute: "wound",
            infCause: "坑道暴動で源石の破片によって負った創傷", fl: { dg: 1 } }
        ], [
          1,
          "狂乱した囚人の群れに押し潰され、ツルハシで胸を刺し貫かれて絶命した。",
          { h: -100, d: ["炭鉱暴動での刺殺殉職", "ウルサスの感染者炭鉱暴動において、暴徒のツルハシに胸を刺し貫かれて絶命した。"] }
        ]),
        $terraData.K("鍵を投げ捨ててエレベーターへ逃げ込む", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "命からがら地上へ脱出したが、職場放棄の重罪で軍務を追放された。",
          { job: 0, p: -5, cr: -3 ,
            lifeAffiliation: { id: "ursus-border-mine-guard", action: "leave",
              note: "坑道から脱出した後、職場放棄を理由に軍務を追放された" },
            lifeGoals: [
              { id: "ursus-border-mine-patrol", action: "abandon", onlyIfUnresolved: true,
                note: "軍務追放によって、国境と鉱山での警備任務を終えた" },
              { id: "ursus-expelled-guard-next-livelihood", title: "軍務追放後の次の働き口を探す",
                priority: "生業", action: "start", preserveAchievement: true }
            ] }
        ])
      ]
    },

    // =============================================================
    // ヴィクトリア: 正規軍・平民歩兵
    // =============================================================
    {
      id: "car_vic_infantry_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 19 },
      show: s => s.res?.n === "ヴィクトリア" && $terraData.regionalCareerOnDuty(s, "vic_infantry"),
      t: "冷たい雨が降り続くヴィクトリア軍の演習陣地。膝まで泥に浸かりながら塹壕の土嚢を積み直し、油布で小銃のボルトを拭った。貴族将校が天幕で温かいスープを飲むのを横目に、冷え切った固パンを齧る。",
      c: [
        $terraData.K("小隊の仲間と煙草を分け合って一息つく", { ethics: { reviewed: true, policyVersion: 87, intent: "self-or-family-care" } }, [
          1,
          "煙草の煙を吐き出しながら、家族への手紙を書いた。",
          { p: 1, h: 1, cash: 90000 }
        ])
      ]
    },
    {
      id: "car_vic_infantry_choice_skirmish",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 21 },
      show: s => s.res?.n === "ヴィクトリア" && $terraData.regionalCareerOnDuty(s, "vic_infantry"),
      t: "行軍中、霧の立ち込める渓谷で待ち伏せしていた凶悪なサルカズ傭兵団の奇襲を受けた。貴族将校は狼狽して逃げ腰になり、歩兵小隊が孤立した。銃剣を構えて突撃するか、土手を盾にして応戦するか。",
      c: [
        $terraData.K("銃剣突撃の号令を自ら叫び、敵の側面を衝く", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.45,
          "怯む仲間を鼓舞して果敢に突撃し、サルカズの指揮官を銃剣で討ち取った。小隊を全滅の危機から救い、平民としては異例の『連隊先任軍曹』へ抜擢された。",
          { h: -2, cr: 4, p: 3, cash: 400000,
            lifeAffiliation: { id: "victoria-regular-infantry", action: "role", role: "連隊先任軍曹",
              onlyIfActiveOrCrisis: true, onlyIfRoleChanged: true } }
        ], [
          0.85,
          "撃退には成功したが、大剣で腕を切り裂かれ重傷を負った。",
          { h: -8, p: 1 }
        ], [
          1,
          "サルカズの黒魔術アーツに焼かれ、煙と共に戦場に倒れた。",
          { h: -100, d: ["前線戦闘でのアーツ戦死", "ヴィクトリアの辺境防衛戦において、敵アーツの猛撃を受け戦死した。"] }
        ]),
        $terraData.K("土手に伏せ、連隊の一斉射撃で足止めする", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "規律正しい斉射で敵を押し返し、本隊の合流を待って無事に撤退した。",
          { p: 1, k: 1 }
        ])
      ]
    },

    // =============================================================
    // ヴィクトリア: 王立前衛学校エリート将校
    // =============================================================
    {
      id: "car_vic_royal_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 21 },
      show: s => s.res?.n === "ヴィクトリア" && $terraData.regionalCareerOnDuty(s, "vic_royal"),
      t: "ロンディニウムの豪壮な将校クラブで、大公爵派閥の貴族たちとワイングラスを傾けた。壁に掛けられた歴代の武勲詩。どの公爵が次の軍需予算を握るか、華やかな制服の下で冷徹な情報戦が繰り広げられる。",
      c: [
        $terraData.K("公爵の副官と親交を深め、派閥の動向を探る", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "有益な人事情報を得て、馬車で自邸へ戻った。",
          { cr: 2, k: 1, cash: 300000 }
        ])
      ]
    },
    {
      id: "car_vic_royal_choice_coup",
      conf: "S",
      st: ["青年", "壮年"],
      once: true,
      cd: 5,
      w: 0.4,
      ge: { age: 22, year: 1094 },
      le: { year: 1094 },
      show: s => s.res?.n === "ヴィクトリア" && $terraData.regionalCareerOnDuty(s, "vic_royal"),
      t: "1094年、ロンディニウムではカズデル軍事委員会の影響が強まり、大公爵たちの利権争いも深まっていた。所属する公爵家の部隊は対立勢力に敗れ、司令部を包囲された。公爵の旗を守って抗戦するか、武器を置いて降伏するか。",
      c: [
        $terraData.K("サーベルを抜き、公爵の旗を守るため最後まで防衛戦を指揮する", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.4,
          "血路を開いて包囲を突破し、公爵家の後継者を連れて地方へ脱出した。忠義の士として称えられ、亡命貴族軍の最高指揮官となった。",
          { cr: 5, p: 4, h: -4, cash: 2000000, job: 55,
            lifeGoals: [
              { id: "victoria-officer-career", action: "compromise", onlyIfUnresolved: true,
                note: "元の公爵軍での任務を終え、後継者と残存部隊の指揮へ移った" },
              { id: "victoria-exiled-command", title: "亡命公爵家の部隊を率いて任務を続ける",
                priority: "生業", action: "start", preserveAchievement: true }
            ],
            lifeAffiliations: [
              { id: "victoria-royal-officer", action: "leave",
                note: "公爵家の敗北により元の指揮系統を離れた" },
              { id: "victoria-exiled-ducal-command", title: "亡命公爵家の残存部隊",
                kind: "employer", action: "join", role: "最高指揮官",
                note: "公爵家の後継者と脱出し、残存部隊の指揮を任された" }
            ] }
        ], [
          1,
          "軍事委員会のサルカズ精鋭に司令部を制圧され、捕縛された。反逆者としてロンディニウムの断頭台へ送られ、処刑された。",
          { h: -100, d: ["ロンディニウム断頭台での処刑", "ヴィクトリアのクーデターにおいて、反逆者としてロンディニウムの断頭台へ送られ処刑された。"] }
        ]),
        $terraData.K("軍刀を床に置き、白旗を掲げて降伏する", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "爵位と財産を剥奪されたが命は助命され、平民として解放された。",
          { job: 0, cash: -3000000, p: -5, cr: -4,
            lifeAffiliation: { id: "victoria-royal-officer", action: "leave",
              note: "降伏により爵位と任官資格を失い、公爵軍を離れた" },
            lifeGoals: [
              { id: "victoria-officer-career", action: "abandon", onlyIfUnresolved: true,
                note: "降伏により公爵軍の軍歴と派閥での権力追求を終えた" }
            ] }
        ])
      ]
    },

    // The refugee command follows one person's survived 1094 coup outcome.
    // No destination country or restoration to power is inferred.
    {
      id: "car_vic_exile_command_review",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.35,
      ge: { age: 24, year: 1096 },
      le: { year: 1098 },
      after: { id: "car_vic_royal_choice_coup", min: 2, choice: 0, outcome: 0 },
      show: s => s.res?.n === "ヴィクトリア" && s.job === 55 &&
        $rules.affiliations.canWork(s, "victoria-exiled-ducal-command"),
      t: "公爵家が都を追われてから幾年かが過ぎた。残った兵の名簿には、二度と戻らない者の名もある。かつての軍旗を守り続けるか、指揮の役目を終えて別の暮らしを探すか、決める時が来た。",
      c: [
        $terraData.K("残った部隊の指揮を続ける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          1,
          "補給と宿営の帳面を開き、残る兵たちの持ち場を確かめた。次の朝も同じ旗の下で点呼を取ることにした。",
          { k: 1, p: -1,
            lifeGoal: { id: "victoria-exiled-command", action: "continue",
              note: "残存部隊の指揮と補給の役目を継続した" } }
        ]),
        $terraData.K("指揮を引き継ぎ、軍務を離れる", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "指揮の引継ぎを終え、使い込んだ軍刀を布に包んだ。部隊の行方を決める席から離れ、当面の暮らしを自分で考えることにした。",
          { job: 0,
            lifeAffiliation: { id: "victoria-exiled-ducal-command", action: "leave",
              note: "残存部隊の指揮を引き継ぎ、軍務を離れた" },
            lifeGoal: { id: "victoria-exiled-command", action: "abandon",
              note: "亡命部隊の指揮を終えた" } }
        ])
      ]
    },

    // The canonical 1098 end of the occupation changes the context of this
    // fictional exile unit. Its survival and dissolution remain personal choices.
    {
      id: "car_vic_exile_postwar_review",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.45,
      ge: { age: 24, year: 1099 },
      after: { id: "car_vic_royal_choice_coup", min: 5, choice: 0, outcome: 0 },
      show: s => s.res?.n === "ヴィクトリア" && s.job === 55 &&
        $rules.affiliations.canWork(s, "victoria-exiled-ducal-command"),
      t: "ロンディニウムの戦いが終わり、カズデル軍事委員会は都を去った。議会では復興のための話し合いが続いているが、敗れた公爵家の残存部隊がこの先どこに属するのかは定まっていない。かつて守った旗を掲げ続けるか、指揮を引き継いで軍務を終えるか。",
      c: [
        $terraData.K("残存部隊の指揮を続け、戦後の情勢を見定める", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          1,
          "占領軍の撤退は、失った部下を連れ戻してはくれなかった。兵の数と補給の残りを確かめ、今はまだ部隊の旗を降ろさないことにした。",
          { k: 1, p: -1,
            lifeGoal: { id: "victoria-exiled-command", action: "continue",
              note: "戦後も残存部隊の指揮と補給を引き受けた" } }
        ]),
        $terraData.K("指揮を引き継ぎ、軍務を終える", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "これまでの命令書と兵の名簿を整理し、指揮の引継ぎを済ませた。戦争は終わった。明日の仕事は、もう軍刀を手に決めるものではない。",
          { job: 0,
            lifeAffiliation: { id: "victoria-exiled-ducal-command", action: "leave",
              note: "戦後、残存部隊の指揮を引き継いで軍務を終えた" },
            lifeGoal: { id: "victoria-exiled-command", action: "abandon",
              note: "戦後の転身を選び、亡命部隊での指揮を終えた" } }
        ])
      ]
    },

    // =============================================================
    // リターニア: 金律法衛
    // =============================================================
    {
      id: "car_lei_golden_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "リターニア" && $terraData.regionalCareerOnDuty(s, "lei_golden"),
      t: "女帝の双塔を結ぶ高架回廊で、音律法典のアーツ発振器を調律した。完璧な純正律の和音を響かせ、都市の精神安定結界を維持する。わずかな不協和音も許さぬ金律法衛の誇りと重責が、全身の神経を研ぎ澄ませる。",
      c: [
        $terraData.K("調律を完了し、女帝の紋章に一礼する", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "静寂が戻った回廊を歩み、法衛本部へ戻った。",
          { k: 2, p: 1, cash: 250000 }
        ])
      ]
    },
    {
      id: "car_lei_golden_choice_witch_remnant",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 22 },
      show: s => s.res?.n === "リターニア" && $terraData.regionalCareerOnDuty(s, "lei_golden"),
      t: "ツヴィリングトゥルムの地下深く、かつて巫王が築いた禁断の音律院で残党たちが狂乱のアーツ演奏を行っていた。歪んだ旋律が精神を蝕む中、法衛として即座に突入しアーツで鎮圧するか。",
      c: [
        $terraData.K("金律の絶対和音を展開し、異端の旋律を粉砕する", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.45,
          "金律杖から放たれた神聖な光の和音が狂気の旋律を完全に打ち消し、残党を一網打尽にした。女帝直属の首席法衛へと抜擢された。",
          { k: 4, p: 4, cr: 5, cash: 1500000,
            lifeAffiliation: { id: "leithania-golden-law", action: "role", role: "首席法衛",
              onlyIfActiveOrCrisis: true, onlyIfRoleChanged: true } }
        ], [
          0.85,
          "残党を制圧したものの、巫王の呪詛アーツを耳にしてしまい、激しい頭痛と幻聴の後遺症を負った。",
          { p: -6, k: 1 }
        ], [
          1,
          "巫王の狂乱旋律に精神を直接破壊され、発狂して絶命した。",
          { h: -100, d: ["巫王残党の狂乱旋律死", "リターニアの残党討伐任務において、巫王の狂乱アーツ旋律に精神を破壊され絶命した。"] }
        ]),
        $terraData.K("退路を封鎖し、法衛本隊の増援を待つ", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "大隊の到着を待って安全に制圧した。堅実な判断を賞賛された。",
          { p: 2, k: 1 }
        ])
      ]
    },

    // =============================================================
    // ラテラーノ: 公証人役場 執行人
    // =============================================================
    {
      id: "car_lat_executor_daily_01",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20 },
      show: s => s.res?.n === "ラテラーノ" && $terraData.regionalCareerOnDuty(s, "lat_executor"),
      t: "公証人役場の執務室で、他国企業とラテラーノ市民の間に結ばれた遺産分割契約書を審査した。午後は射撃場で守護銃の分解清掃と的当て。サンクタ法典の厳格な条文と火薬の匂いが、執行人の日常を満たす。",
      c: [
        $terraData.K("報告書を提出し、名物のアップルパイを食べる", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "カフェで甘いパイを楽しみ、同僚と談笑した。",
          { p: 2, cr: 1, cash: 220000 }
        ])
      ]
    },
    {
      id: "car_lat_executor_choice_dispute",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { age: 22 },
      show: s => s.res?.n === "ラテラーノ" && $terraData.regionalCareerOnDuty(s, "lat_executor"),
      t: "公証人役場の特務指令。国外の無法地帯において、ラテラーノ市民の遺産である聖遺物と守護銃が武装傭兵団に略奪された。法典の履行のため、単身で傭兵アジトへ乗り込み返還調停を行うか。",
      c: [
        $terraData.K("法典を宣告し、守護銃の連射で制圧する", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.45,
          "法典の条文を冷徹に読み上げながら正確無比な早撃ちで敵の武器だけを撃ち落とし、無傷で遺産を奪還した。公証人役場の伝説的執行人として名を馳せた。",
          { cr: 5, p: 3, h: 2, cash: 1200000 }
        ], [
          0.85,
          "奪還には成功したものの、銃撃戦の中で被弾して負傷した。",
          { h: -6, p: 2, cash: 300000 }
        ], [
          1,
          "傭兵団の仕掛けた手榴弾の爆風をまともに浴び、殉職した。",
          { h: -100, d: ["公証執行任務での爆死殉職", "ラテラーノ公証人執行人の国外任務中、手榴弾の爆風を浴びて殉職した。"] }
        ]),
        $terraData.K("教皇庁の外交ルートを通じて返還圧力をかける", { ethics: { reviewed: true, policyVersion: 87, intent: "procedure" } }, [
          1,
          "時間はかかったものの、外交圧力で無血回収に成功した。",
          { k: 2, cr: 2 }
        ])
      ]
    },
    {
      id: "car_urs_officer_after_dismissal",
      conf: "S",
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.3,
      ge: { age: 25 },
      after: { id: "car_urs_officer_choice_purge", min: 2, choice: 1 },
      show: s => true &&
        s.lifeRecord?.affiliations?.some(a => a.id === "ursus-imperial-officer" && a.status === "left") &&
        s.lifeRecord?.goals?.some(g => g.id === "ursus-dismissed-officer-next-livelihood" &&
          ["active", "compromised", "paused"].includes(g.status)),
      t: "軍服を脱いで幾年かが過ぎた。没収された財産や、かつての肩章が戻ってくる気配はない。もう軍の命令が届かない場所にも、食べていくための仕事はあった。",
      c: [
        $terraData.K("働き口の手がかりを探す", {
          show: s => s.job === 0,
          ethics: { reviewed: true, policyVersion: 87, intent: "procedure" }
        }, [1, "店の軒先や仕事を仲介する者を訪ねて歩いた。今日のところ、雇ってくれる者は見つからなかった。",
          { lifeGoal: { id: "ursus-dismissed-officer-next-livelihood", action: "continue",
            note: "除隊後の求職を続けたが、採用はまだ成立していない" } }]),
        $terraData.K("当面は仕事探しを休む", {
          show: s => s.job === 0,
          ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" }
        }, [1, "ひとまず足を止め、手元に残ったものを数えた。次の勤め先を決めるのは、もう少し先に延ばした。",
          { lifeGoal: { id: "ursus-dismissed-officer-next-livelihood", action: "pause",
            note: "除隊後の求職をいったん休んだ" } }]),
        $terraData.K("今の仕事で新たな生活を始めたと認める", {
          show: s => s.job > 0 && s.job !== 51,
          ethics: { reviewed: true, policyVersion: 87, intent: "procedure" }
        }, [1, "かつての階級は今の勤め先では役に立たない。自分の仕事を終え、約束された報酬を受け取った。",
          { lifeGoal: { id: "ursus-dismissed-officer-next-livelihood", action: "complete",
            note: "帝国軍を離れた後、別の実際の職業で新しい生計を得た" } }]),
        $terraData.K("働き始めた後も先行きを考え続ける", {
          show: s => s.job > 0 && s.job !== 51,
          ethics: { reviewed: true, policyVersion: 87, intent: "procedure" }
        }, [1, "新しい勤務は続いている。それでも、この先の暮らしを決めるにはまだ早いと感じた。",
          { lifeGoal: { id: "ursus-dismissed-officer-next-livelihood", action: "continue",
            note: "別の仕事に就いたが、除隊後の生計を引き続き見極める" } }])
      ]
    },
    {
      id: "car_urs_guard_after_expulsion",
      conf: "S",
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.3,
      ge: { age: 23 },
      after: { id: "car_urs_guard_choice_riot", min: 2, choice: 1 },
      show: s => true &&
        s.lifeRecord?.affiliations?.some(a => a.id === "ursus-border-mine-guard" && a.status === "left") &&
        s.lifeRecord?.goals?.some(g => g.id === "ursus-expelled-guard-next-livelihood" &&
          ["active", "compromised", "paused"].includes(g.status)),
      t: "坑道を逃げ出したあの日のことは今も覚えている。軍務を追われてからは、制服のない日々を送っていた。夜になると、地下の鉄扉が軋む音を思い出すことがあった。",
      c: [
        $terraData.K("別の働き口を探して回る", {
          show: s => s.job === 0,
          ethics: { reviewed: true, policyVersion: 87, intent: "procedure" }
        }, [1, "早朝から求人の話を聞いて回った。仕事を頼めそうな相手の名前を覚えたが、採用の約束は得られなかった。",
          { lifeGoal: { id: "ursus-expelled-guard-next-livelihood", action: "continue",
            note: "追放後も求職を続けたが、新たな採用は成立していない" } }]),
        $terraData.K("しばらく身を休める", {
          show: s => s.job === 0,
          ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" }
        }, [1, "人の少ない場所に腰を下ろし、しばらく何もしないことにした。翌日の暮らしは、まだ決めていなかった。",
          { lifeGoal: { id: "ursus-expelled-guard-next-livelihood", action: "pause",
            note: "軍務追放後の求職を一時中断した" } }]),
        $terraData.K("次の職を得たことに一区切りつける", {
          show: s => s.job > 0 && s.job !== 52,
          ethics: { reviewed: true, policyVersion: 87, intent: "procedure" }
        }, [1, "今の仕事を終え、報酬を受け取った。坑道の扉の内側とは違う場所で、一日を終えることができた。",
          { lifeGoal: { id: "ursus-expelled-guard-next-livelihood", action: "complete",
            note: "軍務追放の後、別の実際の職業で生計を得た" } }]),
        $terraData.K("新しい職があっても暮らしを見直し続ける", {
          show: s => s.job > 0 && s.job !== 52,
          ethics: { reviewed: true, policyVersion: 87, intent: "procedure" }
        }, [1, "働き始めてからも、いつまでこの勤めが続くかは分からない。しばらく考え続けることにした。",
          { lifeGoal: { id: "ursus-expelled-guard-next-livelihood", action: "continue",
            note: "別の仕事に就いたが、追放後の暮らしの安定を引き続き見極める" } }])
      ]
    },
  ];

  for (const event of E) {
    event.references = [...new Set([...(event.references || []), "SRC_REGIONAL_CAREERS", "SRC_VICTORIA_MILITARY"])];
    $terraData.EV.push(event);
  }
});
