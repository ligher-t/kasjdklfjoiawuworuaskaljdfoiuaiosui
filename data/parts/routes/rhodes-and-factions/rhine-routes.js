// routes/rhodes-and-factions/rhine-routes: Rhine Lab scientific research and ethical crisis events.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/rhine-routes"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const onRhine = s => [38, 39, 40].includes(s.job) &&
    $rules.affiliations.canWork(s, "rhine-lab");

  const events = [
    {
      id: "sr_rhine_recruitment_exam",
      conf: "S",
      references: ["SRC_RHINE_LAB"],
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.45,
      ge: { year: 1093, age: 18 },
      show: s => s.res?.n === "クルビア" && s.k >= 45 && !s.fl?.detained && !s.job &&
        (!s.fl?.rhine_whistleblower || !!s.fl?.rhine_whistleblower_review_passed),
      t: "クルビア連邦トリマウンツにそびえるライン生命本社ビル。テラ最先端の科学技術と莫大な資本が集うこの学術コンソーシアムで、研究実習生の公募選考が行われている。",
      c: [
        $terraData.K("研究計画書と理論論文を提出し、ライン生命研究実習生として入職する", {}, [
          1,
          "厳格な学術審査と口頭試問をパスし、ライン生命の研究実習生（J 38）としてIDカードを受領した。最先端の分析機器と膨大な学術アーカイブに囲まれる日々が始まった。",
          $terraData.rhineStaff("intern", "ライン生命研究実習生", 3)
        ]),
        $terraData.K("過酷な学術競争から距離を置き、一般の技術工房や町工場を選ぶ", {}, [
          1,
          "巨大企業の研究開発競争には加わらず、身近な機械修理や一般産業の道へ進むことにした。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "sr_rhine_section_assignment",
      conf: "S",
      references: ["SRC_RHINE_LAB"],
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { year: 1094 },
      show: s => onRhine(s) && s.job === 38 && s.k >= 55,
      t: "実習期間中の優れた分析能力が認められ、専任研究員（J 39）への昇格面談に呼ばれた。ライン生命が誇る専門各科の主任たちが、新たな頭脳を自らの研究室へ迎え入れようとしている。",
      c: [
        $terraData.K("生態科（ミュルジス主任）を志望し、水循環・環境工学の研究に就く", {}, [
          1,
          "生態科の研究員として配属された。過酷な荒野環境を改善するバイオテラフォーミングや水質浄化の実験を進め、主任のミュルジスからも気さくな歓迎を受けた。",
          {
            job: 39,
            payBonus: 0.15,
            lifeAffiliation: {
              id: "rhine-lab",
              title: "ライン生命医科学研究所",
              action: "role",
              role: "ライン生命専任研究員（生態科）"
            },
            k: 3,
            p: 2
          }
        ]),
        $terraData.K("エネルギー科（フェルディナンド主任）を志望し、源石動力の革新に挑む", {}, [
          1,
          "エネルギー科の配属となった。国家規模の巨大プロジェクトと巨額の研究費が動く現場で、次世代源石リアクターの高効率化設計に没頭した。",
          {
            job: 39,
            cash: 200000,
            payBonus: 0.2,
            lifeAffiliation: {
              id: "rhine-lab",
              title: "ライン生命医科学研究所",
              action: "role",
              role: "ライン生命専任研究員（エネルギー科）"
            },
            k: 4,
            p: 2
          }
        ]),
        $terraData.K("生物科・医術科（サイレンス主任補佐）を志望し、鉱石病の生体適合性を追う", {}, [
          1,
          "生物・医術科の研究員となった。鉱石病患者の病理組織と向き合い、細胞の結晶化を抑制する画期的な薬剤カプセルの研究に情熱を注いだ。",
          {
            job: 39,
            payBonus: 0.15,
            lifeAffiliation: {
              id: "rhine-lab",
              title: "ライン生命医科学研究所",
              action: "role",
              role: "ライン生命専任研究員（生物・医術科）"
            },
            k: 3,
            rl: 2,
            p: 2
          }
        ]),
        $terraData.K("構造・防衛科（サリア主任）を志望し、施設安全と先端材料開発を担う", {}, [
          1,
          "防衛科の専任研究員となった。天災や過酷な実験事故に耐えうる高強度複合外骨格と防護シールドの素材開発を担当し、サリア主任の厳格な指導を受けた。",
          {
            job: 39,
            payBonus: 0.15,
            lifeAffiliation: {
              id: "rhine-lab",
              title: "ライン生命医科学研究所",
              action: "role",
              role: "ライン生命専任研究員（防衛・材料科）"
            },
            k: 3,
            h: 1,
            p: 2
          }
        ])
      ]
    },
    {
      id: "sr_rhine_patent_breakthrough",
      conf: "S",
      references: ["SRC_RHINE_LAB"],
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.45,
      ge: { year: 1094 },
      show: s => onRhine(s) && s.job >= 39 && s.job <= 40,
      t: "数か月に及ぶ実験の末、世界初となる新素材の合成と高効率反応モデルの構築に成功した。学会での注目と特許申請の手続きが目の前に控えている。",
      c: [
        $terraData.K("特許を会社名義で登録し、巨額のロイヤリティ報酬と昇給を獲得する", {}, [
          1,
          "特許庁に受理され、学会での発表は大反響を呼んだ。会社から莫大な発明奨励金と継続的なロイヤリティ支給が認められ、学術界にその名が轟いた。",
          {
            cash: 500000,
            payBonus: 0.2,
            k: 4,
            p: 3
          }
        ]),
        $terraData.K("オープンソースとして学術界に無償公開し、テラ全体の科学発展に捧げる", {}, [
          1,
          "独占利益を放棄し、全データを学術誌へ無償公開した。巨大企業の経営陣からは苦言を呈されたが、世界中の研究者や貧しい地域の医療者から深い感謝を受けた。",
          {
            rl: 3,
            k: 5,
            p: 2
          }
        ]),
        $terraData.K("共同研究にあたった若手研究者たちの連名を筆頭にし、成果を分かち合う", {}, [
          1,
          "チーム全員の連名で発表した。若い研究員たちは涙を流して感謝し、研究室には揺るぎない結束と信頼関係が築かれた。",
          {
            groupStanding: {
              id: "rhine-colleagues",
              title: "ライン生命の研究仲間",
              delta: 2,
              reason: "研究成果の栄誉を研究チーム全員で分かち合った"
            },
            k: 3,
            p: 2
          }
        ])
      ]
    },
    {
      id: "sr_rhine_promotion_chief",
      conf: "S",
      references: ["SRC_RHINE_LAB"],
      st: ["壮年", "老年"],
      cd: 4,
      w: 0.45,
      ge: { year: 1095, age: 26 },
      show: s => onRhine(s) && s.job === 39 && s.k >= 75,
      t: "これまでの傑出した学術業績と特許取得がクリステン総括の目に留まり、自らの研究室と莫大な予算枠を持つ主任研究員（J 40）への昇格面談に呼ばれた。",
      c: [
        $terraData.K("昇進の内示書に署名し、独自ラボを統括する主任研究員へ就任する", {}, [
          1,
          "専用の研究フロアと数十人の助手、そして巨額の自由予算を手に入れた。テラ科学の最先端を牽引する主任研究員（J 40）として、誰も到達したことのない真理への扉を開く日々が始まった。",
          {
            job: 40,
            payBonus: 0.25,
            groupStanding: {
              id: "rhine-colleagues",
              title: "ライン生命の研究仲間",
              delta: 2,
              reason: "主任研究員へ昇格した"
            },
            lifeAffiliation: {
              id: "rhine-lab",
              title: "ライン生命医科学研究所",
              action: "role",
              role: "ライン生命主任研究員"
            },
            p: 3,
            cr: 2
          }
        ]),
        $terraData.K("組織管理の重責を固辞し、現場の専任研究員として純粋な実験を続ける", {}, [
          1,
          "出世や社内政治には背を向け、白衣を着て試験管を振る現場の専任研究員として留まる道を選んだ。自分のペースで探求を深める日々に満足した。",
          { p: 1, k: 2 }
        ])
      ]
    },
    {
      id: "sr_rhine_diabolic_ethical_crossroad",
      conf: "S",
      references: ["SRC_RHINE_LAB"],
      st: ["青年", "壮年", "老年"],
      once: true,
      cd: 5,
      w: 0.4,
      ge: { year: 1094 },
      show: s => onRhine(s) && (s.job === 39 || s.job === 40),
      t: "深夜、立ち入り制限区画の地下ラボで『炎魔計画』の機密ファイルを目撃してしまった。そこには、幼い感染児の体内に活性源石を強制作動させ、生体兵器へと造り変える狂気的人体実験の記録が記されていた。",
      c: [
        $terraData.K("良心に従い、実験データを密かに複製して外部や防衛科へ告発する", {}, [
          1,
          "震える手で暗号化ドライブに全データをコピーし、防衛科のサリアや外部の支援者へ密かに託した。研究所の警備システムが警報を発する中、告発者として追われる身となった。",
          {
            fl: { rhine_whistleblower: 1 },
            p: 2,
            k: 2
          }
        ]),
        $terraData.K("科学の進歩には尊い犠牲が不可欠だと自分に言い聞かせ、記録を破棄する", {}, [
          1,
          "罪悪感を心の奥底に押し殺し、閲覧ログを消去して研究室を出た。会社からは「沈黙の忠誠」への見返りとして巨額の研究助成金が振り込まれたが、鏡の中の自分を直視できなくなった。",
          {
            cash: 800000,
            biasInf: 10,
            p: -3
          }
        ]),
        $terraData.K("被験者の子供たちを見過ごせず、深夜の搬送路から脱出させる手はずを整える", {}, [
          1,
          "停電事故を装って隔壁のロックを解除し、泣きじゃくる子供たちをトリマウンツの安全な孤児院へと脱出させた。命を救えた安堵が胸を満たした。",
          {
            p: 3,
            rl: 2
          }
        ])
      ]
    },
    {
      id: "sr_rhine_rhodes_asylum",
      conf: "S",
      references: ["SRC_RHINE_LAB", "SRC_RHODES_FOUNDATION"],
      st: ["青年", "壮年", "老年"],
      once: true,
      cd: 3,
      w: 0.5,
      ge: { year: 1095 },
      show: s =>
        !!s.fl?.rhine_whistleblower &&
        !s.fl?.rhine_whistleblower_review_passed &&
        onRhine(s),
      t: "トリマウンツからの追っ手を逃れ、荒野を彷徨っていたところを、密かに連絡を取っていた『ロドス・アイランド』の救護小隊に保護された。巨大な陸上移動艦の格納庫で、白衣を着た医療スタッフたちが出迎えてくれた。",
      c: [
        $terraData.K("持ち出した研究資料をロドスへ託し、医療・研究補助職員（J 30）として身を寄せる", {}, [
          1,
          "機密データをロドスの医療部へ引き渡し、正式に医療・研究補助職員（J 30）として迎え入れられた。過去の実験への贖罪を胸に、今度は誰かを傷つけるためではなく、感染者の命を救うための研究にその頭脳を捧げる道を選んだ。",
          {
            job: 30,
            lifeAffiliation: {
              id: "rhine-lab",
              title: "ライン生命医科学研究所",
              action: "leave",
              note: "非人道実験を告発しロドスへ亡命"
            },
            lifeGoal: {
              id: "rhine-research",
              title: "ライン生命で最先端科学の真理を開拓する",
              action: "abandon",
              note: "非人道実験を告発しロドスへ亡命"
            },
            lifeGoals: [
              { id: "rhodes-work", title: "ロドスで担当する仕事を無理なく続ける",
                priority: "生業", action: "start", preserveAchievement: true }
            ],
            lifeAffiliations: [
              {
                id: "rhodes-staff",
                title: "ロドス・アイランド",
                kind: "employer",
                action: "join",
                role: "本艦・医療研究部／元ライン生命研究員"
              }
            ],
            p: 3,
            k: 3
          }
        ]),
        $terraData.K("ロドスには留まらず、地方の町で名もなき薬局手伝いとしてひっそり暮らす", {}, [
          1,
          "巨大組織の争いに疲れ果て、旅の途中で船を降りた。地方都市の静かな薬局で、処方箋を調合しながら平穏な余生を過ごすことにした。",
          {
            job: 20,
            lifeAffiliation: {
              id: "rhine-lab",
              title: "ライン生命医科学研究所",
              action: "leave",
              note: "研究界を離脱し隠遁"
            },
            lifeGoal: {
              id: "rhine-research",
              title: "ライン生命で最先端科学の真理を開拓する",
              action: "abandon",
              note: "研究界を離脱し隠遁"
            },
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_rhine_359_transmitter_consent",
      conf: "S",
      once: true,
      months: [10],
      references: ["SRC_RHINE_LAB"],
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.45,
      ge: { year: 1099 },
      le: { year: 1099 },
      show: s => onRhine(s) && (s.job === 39 || s.job === 40),
      t: "トリマウンツ郊外の359号基地にて、アーツ応用課のドロシー主任が進める「伝達物質」の大規模治験に立ち会った。神経信号を結合して人々の意識を共有し、能力差や苦しみを克服するという崇高な構想だが、実験に参加している被験者の多くは、生活に困窮して日銭のために集まった不安定な開拓民たちだった。",
      c: [
        $terraData.K("「生活困窮につけ込んだ同意は真の同意ではない」と異議を唱え、治験の倫理審査やり直しを要求する", {}, [
          1,
          "実験の強行に待ったをかけた。ドロシー主任は悲痛な眼差しで自らの理想を語ったが、被験者たちの安全と自主性を守るための監査手続きが開始された。",
          {
            p: 2,
            rl: 2,
            k: 2
          }
        ]),
        $terraData.K("軍部（フェルディナンド）の意図を警戒しつつ、データ収集と装置のフェイルセーフ監視に専念する", {}, [
          1,
          "技術の暴走や軍事転用を防ぐため、通信遮断装置と緊急停止シーケンスを裏で準備した。冷静な危機管理により、最悪の神経崩壊事故を未然に防ぐ手筈を整えた。",
          {
            k: 3,
            p: 1
          }
        ]),
        $terraData.K("過酷な環境に置かれた被験者家族へ個別に食料や医薬品を差し入れ、生活の支援を行う", {}, [
          1,
          "実験の合間に開拓民の仮設住宅を回り、手持ちの薬と栄養剤を手渡した。一人の人間としての温もりに、不安に怯えていた家族たちから心からの感謝を受けた。",
          {
            cash: -20000,
            p: 3,
            rl: 2
          }
        ])
      ]
    },
    {
      id: "sr_rhine_lone_trail_sky_horizon",
      conf: "S",
      once: true,
      months: [11],
      references: ["SRC_RHINE_LAB"],
      st: ["青年", "壮年", "老年"],
      cd: 5,
      w: 0.45,
      ge: { year: 1099 },
      le: { year: 1099 },
      show: s => onRhine(s) && (s.job === 39 || s.job === 40),
      t: "1099年晩秋、トリマウンツ上空。クリステン統括が主導した『ホライズンアーク計画』が極大の光を放ち、フォーカスジェネレーターが天空を穿った。何千年もテラを覆い続けてきた偽りの天球「星のさや」に巨大な風穴が開き、その向こう側に真の静寂と星空が姿を現した。世界が震天動地の衝撃に包まれる中、地上のライン生命は大きな変革の時を迎えていた。",
      c: [
        $terraData.K("天空を見上げ、クリステンが遺した未知の宇宙と科学の極致に魂を震わせる", {}, [
          1,
          "人類の限界が打ち破られた瞬間をその瞳に焼き付けた。文明の新たな夜明けを前に、科学者としての熱い探求心が魂の底から燃え上がった。",
          {
            k: 6,
            p: 4,
            ar: 2
          }
        ]),
        $terraData.K("統括代行として復帰したサリアを支え、軍部や国防部との混乱した事後収拾と組織再建に奔走する", {}, [
          1,
          "混乱に陥るトリマウンツで施設警備と残された機密の保全を指揮した。サリアと共にライン生命の瓦解を防ぎ、新生ライン生命の中核幹部としての地位を確立した。",
          {
            payBonus: 0.25,
            groupStanding: {
              id: "rhine-colleagues",
              title: "ライン生命の研究仲間",
              delta: 3,
              reason: "孤星事件後の組織再建に尽力した"
            },
            p: 3
          }
        ]),
        $terraData.K("サイレンス（淬羽サイレンス）の呼びかけに賛同し、科学の暴走を防ぐ独立研究倫理委員会の設立に参画する", {}, [
          1,
          "「科学の進歩が二度と人を踏みにじらないために」。成果主義に縛られない倫理監視機構の立ち上げに署名し、テラ全土に向けた技術開示と被験者保護のルール作りに身を捧げた。",
          {
            rl: 4,
            k: 3,
            p: 3
          }
        ])
      ]
    },
    {
      id: "sr_rhine_post_lone_trail_career_review",
      conf: "S",
      references: ["SRC_RHINE_LAB"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.4,
      ge: { year: 1100 },
      after: { id: "sr_rhine_lone_trail_sky_horizon", min: 1 },
      show: s => onRhine(s),
      t: "トリマウンツの空にあの光が走ってから、季節が巡った。研究室には残った装置と書類が積まれ、担当者たちは研究を続けている。ここで仕事を続けるか、職員証を返して別の暮らしを探すか、考える時が来た。",
      c: [
        $terraData.K("今の研究室に残り、仕事を引き継ぐ", {}, [
          1,
          "使える装置と残された試料を確認し、明日の実験の準備をした。研究室での仕事は、まだ自分の手の届くところにあった。",
          { k: 2, p: 1,
            lifeGoal: { id: "rhine-research", action: "continue",
              note: "孤星事件後もライン生命での研究を継続した" } }
        ]),
        $terraData.K("職員証を返し、別の働き口を探す", {}, [
          1,
          "資料の引継ぎを済ませ、職員証を机に置いた。次にどこで働くかは決まっていない。研究室の扉を閉め、ひとまず自分の暮らしを考えることにした。",
          {
            job: 0,
            lifeAffiliation: { id: "rhine-lab", action: "leave",
              note: "孤星事件後、研究所を正式に退職して次の職を探した" },
            lifeGoals: [
              { id: "rhine-research", action: "abandon", onlyIfUnresolved: true,
                note: "ライン生命での研究雇用を終了した" },
              { id: "rhine-after-departure-livelihood",
                title: "ライン生命を離れた後の働き口を探す",
                priority: "生業", action: "start", preserveAchievement: true }
            ],
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_rhine_after_departure_livelihood",
      conf: "S",
      references: ["SRC_RHINE_LAB"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.3,
      ge: { year: 1102 },
      after: { id: "sr_rhine_post_lone_trail_career_review", min: 2, choice: 1, outcome: 0 },
      show: s => s.lifeRecord?.affiliations?.some(a => a.id === "rhine-lab" && a.status === "left") &&
        s.lifeRecord?.goals?.some(g => g.id === "rhine-after-departure-livelihood" &&
          ["active", "compromised", "paused"].includes(g.status)),
      t: "研究所を離れたとき、次の仕事は決まっていなかった。あれからいくつかの季節が過ぎた。白衣のままでは入れない職場もあれば、実験室で覚えた手順を役立てられる場所もあった。",
      c: [
        $terraData.K("もう少し働き口を探す", {
          show: s => s.job === 0,
          ethics: { reviewed: true, policyVersion: 87, intent: "livelihood-planning" }
        }, [
          1,
          "求人の話を聞き、履歴書に書ける仕事を一つずつ確かめた。採用の返事は、今日もまだ届いていない。",
          { lifeGoal: { id: "rhine-after-departure-livelihood", action: "continue",
            note: "退職後の求職を続けたが、採用は成立していない" } }
        ]),
        $terraData.K("しばらく求職を休む", {
          show: s => s.job === 0,
          ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" }
        }, [
          1,
          "研究所を出た理由を何度も考えた。次の勤務先を急いで決めるのはやめ、今ある暮らしを整えることにした。",
          { lifeGoal: { id: "rhine-after-departure-livelihood", action: "pause",
            note: "次の仕事探しを一時中断した" } }
        ]),
        $terraData.K("今の職場で生活を立て直したと認める", {
          show: s => s.job > 0 && ![38, 39, 40].includes(s.job),
          ethics: { reviewed: true, policyVersion: 87, intent: "livelihood-planning" }
        }, [
          1,
          "今の勤め先で一日の仕事を終えた。研究所の名札はもう使っていないが、以前に覚えたことも、今の仕事に役立っていた。",
          { lifeGoal: { id: "rhine-after-departure-livelihood", action: "complete",
            note: "研究所退職後、別の実際の職業で働き始めた" } }
        ]),
        $terraData.K("新しい仕事を続けながら先行きを見直す", {
          show: s => s.job > 0 && ![38, 39, 40].includes(s.job),
          ethics: { reviewed: true, policyVersion: 87, intent: "livelihood-planning" }
        }, [
          1,
          "新しい職場にも慣れないことはある。それでも、次の仕事を探していたころより日々の手順は増えた。今はもう少し様子を見ることにした。",
          { lifeGoal: { id: "rhine-after-departure-livelihood", action: "continue",
            note: "再就職後も暮らしの安定を見極める" } }
        ])
      ]
    },
    {
      id: "sr_rhine_whistleblower_return_review",
      conf: "S",
      references: ["SRC_RHINE_LAB"],
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.35,
      ge: { year: 1100, age: 18 },
      show: s => s.res?.n === "クルビア" && s.job === 0 &&
        !!s.fl?.rhine_whistleblower &&
        !s.fl?.rhine_whistleblower_review_passed &&
        s.lifeRecord?.affiliations?.some(a => a.id === "rhine-lab" &&
          a.status === "left" && a.episodes?.some(ep => ep.endedYear != null)) &&
        !s.lifeRecord?.affiliations?.some(a => a.id === "rhodes-staff" &&
          ["active", "crisis", "suspended"].includes(a.status)),
      t: "ライン生命では、あの事件の後に役員と研究倫理の審査体制が変わった。以前の告発について、人事部に記録が残っている。研究所で再び働くことを考えるなら、退職と告発の経緯を示して、改めて応募資格の審査を受ける必要があるという。",
      c: [
        $terraData.K("退職の経緯と証言を提出し、再応募資格の審査を求める", {}, [
          0.4,
          "提出した記録について照会が続いた末、再応募の選考を受けてよいとの通知が届いた。採用の内定ではない。次に必要なのは、研究所の募集に自分で応募することだった。",
          { fl: { rhine_whistleblower_review_passed: 1 }, p: 1 }
        ], [
          1,
          "証言や退職の扱いをめぐって意見がまとまらず、今回の再応募資格の審査は見送られた。旧職場の席は戻らない。別の働き口を選ぶ自由は残されている。",
          { p: -1 }
        ]),
        $terraData.K("以前の職場へ戻る判断を保留する", {}, [
          1,
          "資料を封筒に戻し、今は申請をやめることにした。研究室で過ごした時間も、そこを離れた理由も消えない。",
          { p: 1 }
        ])
      ]
    },
  ];

  $terraData.EV.push(...events);
});
