// routes/rhodes-and-factions/bsw-routes: Blacksteel Worldwide (BSW) career and tactical events.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/bsw-routes"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const onBsw = s => [35, 36, 37].includes(s.job) &&
    $rules.affiliations.canWork(s, "bsw-contract") &&
    s.residenceBase?.id !== "rhodes-landship";

  const events = [
    {
      id: "sr_bsw_recruitment_assessment",
      conf: "S",
      references: ["SRC_BSW_PMC"],
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.45,
      ge: { year: 1090, age: 18 },
      le: { age: 48 },
      show: s => s.res?.n === "クルビア" && s.h >= 55 && !s.fl?.detained && !s.job,
      t: "クルビア連邦の移動都市にて、国際民間軍事会社『ブラックスチール・ワールドワイド（BSW）』の警備契約社員の募集告知を見かけた。適性試験会場では、最新鋭の射撃シミュレータと過酷な障害物走が受験者に課されている。",
      c: [
        $terraData.K("銃器適性と体力審査に挑み、BSW契約警備員として署名する", {}, [
          1,
          "合格基準をクリアし、防護ベストとクルビア製タクティカル装備を受領した。厳しい規律とプロフェッショナリズムを重んじる国際PMCでのキャリアが始まった。",
          $terraData.bswStaff("junior", "BSW契約警備員・見習い", 3)
        ]),
        $terraData.K("民間軍事会社の危険な契約は見送り、他の職を探す", {}, [
          1,
          "銃火器の硝煙と危険手当の誘惑を振り切り、安全な一般市民としての暮らしを求めて募集所を後にした。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "sr_bsw_convoy_protection",
      conf: "S",
      references: ["SRC_BSW_PMC"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.5,
      ge: { year: 1090 },
      show: s => onBsw(s) && s.job === 35,
      t: "荒野を渡る鉱石採掘企業の大型輸送コンボイの護衛任務中、突如として砂塵の向こうから武装した略奪者集団が急襲してきた。先頭の車両が被弾し、激しい銃撃戦が始まった。",
      c: [
        $terraData.K("防護シールドを展開して射撃線を確保し、契約に基づき敵を撃退する", {}, [
          1,
          "先輩隊員と呼吸を合わせ、激しい弾幕を浴びせかけて敵部隊を完全に撃退した。車列の安全を守り切り、会社から高額の危険手当と技能評価が支給された。",
          {
            cash: 150000,
            lifeSkill: {
              id: "bsw-tactics",
              title: "戦術機動・防護火器運用",
              delta: 4,
              context: "コンボイ護衛戦闘での防衛成功"
            },
            p: 2,
            h: -1
          }
        ]),
        $terraData.K("先行車の炎上現場へ駆けつけ、被弾した民間人ドライバーを牽引救出する", {}, [
          1,
          "銃弾が飛び交う中、炎上するキャブから意識を失った運転手を引きずり出して装甲車の陰へ運び込んだ。小隊長から「いい度胸だ」と肩を叩かれた。",
          {
            groupStanding: {
              id: "bsw-colleagues",
              title: "BSWの同僚・小隊員",
              delta: 2,
              reason: "戦火の中で民間人を救出した"
            },
            rl: 2,
            p: 2
          }
        ]),
        $terraData.K("無理な前進は控え、装甲の陰に身を隠して主力の反撃を待つ", {}, [
          1,
          "冷静に身の安全を保ちながら牽制射撃を行い、後続の重装支援部隊が到着して敵が撤退するまで持ち場を死守した。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "sr_bsw_promotion_tactical",
      conf: "S",
      references: ["SRC_BSW_PMC"],
      st: ["青年", "壮年"],
      cd: 4,
      w: 0.45,
      ge: { year: 1091, age: 20 },
      show: s => s.job === 35,
      t: "見習い期間中の優れた実績が評価され、BSWクルビア本部から正規戦術オペレーターへの昇格審査に召集された。高難度の実地想定演習と銃器ライセンス更新が課される。",
      c: [
        $terraData.K("実技審査と戦術筆記試験を突破し、正規戦術オペレーターへ昇格する", {}, [
          1,
          "社内ライセンス審査を堂々の成績で突破し、BSWの正規戦術オペレーター（J 36）として辞令を受けた。国際任務への派遣権限と大幅な昇給が認められた。",
          {
            job: 36,
            payBonus: 0.2,
            groupStanding: {
              id: "bsw-colleagues",
              title: "BSWの同僚・小隊員",
              delta: 2,
              reason: "正規戦術オペレーターへ昇格した"
            },
            lifeAffiliation: {
              id: "bsw-contract",
              title: "ブラックスチール・ワールドワイド",
              action: "role",
              role: "BSW正規戦術オペレーター"
            },
            p: 2,
            cr: 1
          }
        ]),
        $terraData.K("現場の専任警備員として留まり、過酷な海外派遣を見送る", {}, [
          1,
          "国際紛争地帯への出動を伴う正規職は辞退し、国内施設での見習い・契約警備員の枠を更新した。命の危険を避けてマイペースに勤務を続けた。",
          { p: 1, h: 1 }
        ])
      ]
    },
    {
      id: "sr_bsw_vip_escort_ambush",
      conf: "S",
      references: ["SRC_BSW_PMC"],
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.45,
      ge: { year: 1092 },
      show: s => onBsw(s) && (s.job === 36 || s.job === 37),
      t: "移動都市間の首脳会談に向かう多国籍企業の重要役員を警護中、対抗勢力が雇った凄腕の襲撃部隊に包囲された。暗殺部隊の指揮官から「要人を引き渡せば、巨額の口止め料と安全を約束する」と極秘通信が入った。",
      c: [
        $terraData.K("「BSWの契約は金では買えない」と通信を叩き切り、要人を死守する", {}, [
          1,
          "通信を即座に遮断し、閃光弾と精密射撃で敵の包囲網を粉砕した。無傷で要人を目的地へ送り届け、依頼主の企業とBSW本社から破格の報奨金と特務スペシャリスト（J 37）への昇格内定が贈られた。",
          {
            job: 37,
            cash: 300000,
            payBonus: 0.25,
            groupStanding: {
              id: "bsw-colleagues",
              title: "BSWの同僚・小隊員",
              delta: 3,
              reason: "要人警護で買収を跳ね除け完璧に任務を遂行した"
            },
            lifeAffiliation: {
              id: "bsw-contract",
              title: "ブラックスチール・ワールドワイド",
              action: "role",
              role: "BSW特務スペシャリスト・要人警護主任"
            },
            p: 3,
            cr: 2
          }
        ]),
        $terraData.K("要人を連れて裏口から脱出し、民間人の犠牲を出さずに安全地帯へ退避する", {}, [
          1,
          "敵の意表を突く煙幕を展開し、地下搬送路を伝って安全に警護対象を避難させた。堅実な判断力が高く評価された。",
          { cash: 100000, p: 2, k: 2 }
        ]),
        $terraData.K("圧倒的な敵の包囲を前に、要人と共に投降して人質交渉を図る", {}, [
          1,
          "部隊の全滅を避けるためやむなく交渉に応じた。命は助かったものの、警備任務の失敗として社内査問を受け、減俸処分が下された。",
          { p: -2, cash: -50000 }
        ])
      ]
    },
    {
      id: "sr_bsw_rhodes_secondment",
      conf: "S",
      references: ["SRC_BSW_PMC", "SRC_RHODES_FOUNDATION"],
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.45,
      ge: { year: 1095 },
      show: s => onBsw(s) && (s.job === 36 || s.job === 37),
      t: "BSW本部から、業務提携先である製薬会社『ロドス・アイランド』への出向派遣（secondment）の打診があった。ロドス本艦にて外勤部隊の戦術教官や重要任務の護衛にあたり、同時にロドスの手厚い医療ケアを受けられる契約だという。",
      c: [
        $terraData.K("出向協定に合意し、BSW籍を保持したままロドス本艦へ派遣される", {}, [
          1,
          "BSWの給与と身分を保持したまま、ロドス本艦へ戦術顧問として着任した。ロドスの医療福利厚生（鉱石病治療費無料）の対象となり、フランカやリスカー厶のように両組織の架け橋として活躍する日々が始まった。",
          {
            residenceArrangement: "independent_rental",
            fl: { rhodes_landship: 1, household_separated: 1, sch: 0 },
            lifeAffiliation: {
              id: "rhodes-staff",
              title: "ロドス・アイランド",
              action: "join",
              role: "本艦・BSW出向／戦術顧問オペレーター",
              note: "BSW籍を保持したままロドスへ出向"
            },
            p: 2,
            k: 2,
            rl: 1
          }
        ]),
        $terraData.K("出向は辞退し、クルビア国内での民間警備契約に専念する", {}, [
          1,
          "見知らぬ製薬会社の船に乗ることは辞退し、慣れ親しんだクルビアの各都市での警備任務を継続することにした。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "sr_bsw_davistown_debt_conflict",
      conf: "S",
      references: ["SRC_BSW_PMC"],
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.45,
      ge: { year: 1096 },
      show: s => onBsw(s) && (s.job === 35 || s.job === 36),
      t: "衰退した鉱業移動区画ダヴィスタウンへの派遣任務。契約主である開拓銀行の要請は、債務超過に陥った住民たちの住宅を差し押さえ、開拓地への強制移送を支援するための夜間警備だった。街路には荷物をまとめる気力も失った老人や職人たちの絶望的な視線が満ちている。",
      c: [
        $terraData.K("「契約は絶対だ」と感情を排し、銀行の指示通りに差し押さえ区画の厳重封鎖を行う", {}, [
          1,
          "規則通りにバリケードを敷き、住民の立ち入りを阻止した。銀行役員からは手厚い報奨金を渡されたが、立ち退かされた家族の啜り泣きが耳の奥に残り続けた。",
          {
            cash: 100000,
            p: -2,
            biasInf: 5
          }
        ]),
        $terraData.K("住民たちの退去猶予を勝ち取るため、契約違反のリスクを冒して上司と銀行へ異議を申し立てる", {}, [
          1,
          "『ダーティマネー』のジェシカのように、理不尽な収奪に対して毅然と抗議の声を上げた。社内査問で処分を受けたものの、住民たちからは「命の恩人」として涙ながらに感謝された。",
          {
            groupStanding: {
              id: "bsw-colleagues",
              title: "BSWの同僚・小隊員",
              delta: -1,
              reason: "契約主への異議申し立て"
            },
            rl: 3,
            p: 3
          }
        ]),
        $terraData.K("地元の元兵士（ウッドロウ）や商店主らと接触し、衝突を避けるための自主避難ルートを模索する", {}, [
          1,
          "住民側の顔役と水面下で連絡を取り、暴力的な衝突を起こさずに荷物を運び出せる裏道を案内した。民間軍事の枠組みの中で、ぎりぎりの良心を守り抜いた。",
          {
            k: 2,
            p: 2,
            rl: 1
          }
        ])
      ]
    },
    {
      id: "sr_bsw_infected_squad_policy",
      conf: "S",
      references: ["SRC_BSW_PMC"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.5,
      ge: { year: 1090 },
      show: s => onBsw(s) && !!s.inf && !s.fl?.bsw_infection_disclosed,
      t: "定期健診のレントゲン写真に、黒く輝く源石結晶の影が写り込んだ。BSWの社内規則では「感染者の即時解雇」こそないものの、高危険度任務での非感染者との混成編成には厳格な制限があり、相棒や同僚の同意、あるいは後方・対源石専門部隊への配置転換が求められる。",
      c: [
        $terraData.K("規定に従い人事部へ正式申告し、同僚たちの同意を得て前線任務の継続を申請する", {}, [
          1,
          "小隊長と相棒に事実を打ち明けた。一瞬の動揺の後、相棒は「お前の背中はこれまで通り俺が守る」と同意書にサインしてくれた。厳格な社内審査を経て、条件付きの前線任務継続が認められた。",
          {
            fl: { bsw_infection_disclosed: 1 },
            groupStanding: {
              id: "bsw-colleagues",
              title: "BSWの同僚・小隊員",
              delta: 1,
              reason: "感染を隠さず同僚の信頼を得た"
            },
            p: 1
          }
        ]),
        $terraData.K("ジャネット・ロングフェロー率いる対源石・生物災害対処部門（BPRS）への異動を願い出る", {}, [
          1,
          "危険源石環境の防護・除染を担う専門部隊へ転属した。防護スーツに身を包み、同じ境遇の感染者隊員たちと共に、過酷だが差別のない現場で専門技術を磨く道を選んだ。",
          {
            fl: { bsw_infection_disclosed: 1 },
            lifeAffiliation: {
              id: "bsw-contract",
              title: "ブラックスチール・ワールドワイド",
              action: "role",
              role: "BSW・BPRS対源石防護隊員"
            },
            k: 2,
            p: 2
          }
        ]),
        $terraData.K("フランカの前例にならい、治療と任務継続を両立できるロドスへの交換派遣を会社へ要請する", {}, [
          1,
          "人事部と相談し、業務提携先であるロドス・アイランドへの出向派遣（secondment）の手続きを進めてもらった。BSWの身分を残しながら本艦で最先端の抑制治療を受ける切符を手に入れた。",
          {
            residenceArrangement: "independent_rental",
            fl: { bsw_infection_disclosed: 1, rhodes_landship: 1, household_separated: 1, sch: 0 },
            lifeAffiliation: {
              id: "rhodes-staff",
              title: "ロドス・アイランド",
              action: "join",
              role: "本艦・BSW出向／療養兼任オペレーター"
            },
            p: 2,
            h: 2
          }
        ])
      ]
    },
    {
      id: "sr_bsw_secondment_posting_review",
      conf: "S",
      references: ["SRC_BSW_PMC", "SRC_RHODES_FOUNDATION"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.4,
      ge: { year: 1096, age: 19 },
      show: s => [35, 36, 37].includes(s.job) &&
        $rules.affiliations.canWork(s, "bsw-contract") &&
        $rules.affiliations.canWork(s, "rhodes-staff") &&
        s.residenceBase?.id === "rhodes-landship" &&
        s.lifeRecord?.affiliations?.some(a => a.id === "rhodes-staff" &&
          a.role?.startsWith("本艦・BSW出向") && s.year > a.startedYear),
      t: "ロドス本艦での出向勤務が一年を越えた。BSWの契約は続いているが、本社からは帰任時期を尋ねる連絡が届いた。医療部門や外勤班で覚えた手順をこのまま生かすか、出向の任務を終えて元の会社の仕事へ戻るか。",
      c: [
        $terraData.K("本艦での出向勤務を続け、次の任務の準備をする", {}, [
          1,
          "本社へ勤務継続を伝えた。防護装備の点検を終えると、明日の仕事で必要になる訓練記録を整理した。",
          { k: 1, p: 1 }
        ]),
        $terraData.K("出向を終え、BSWの契約警備任務へ帰任する", {}, [
          1,
          "本艦での引継ぎを済ませ、使い慣れた装備と派遣記録を持って船を降りた。BSWとの雇用契約は残り、次の配置先について本社と連絡を取ることになった。",
          {
            lifeAffiliation: {
              id: "rhodes-staff",
              action: "leave",
              note: "BSWとの契約を保持したままロドス本艦への出向を終えた"
            },
            p: 1
          }
        ])
      ]
  ];

  $terraData.EV.push(...events);
});
