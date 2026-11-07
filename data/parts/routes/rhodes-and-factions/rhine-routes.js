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
          "厳格な学術審査と口頭試問をパスし、ライン生命の研究実習生としてIDカードを受領した。最先端の分析機器と膨大な学術アーカイブに囲まれる日々が始まった。",
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
      t: "実習期間中の分析能力が認められ、専任研究員への昇格面談に呼ばれた。希望する専門科と、これから担当したい仕事を尋ねられた。",
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
            employmentAction: { action: "site-incident", kind: "research-access", incident: "assigned-biomedical-records" },
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
          "特許申請が受理され、学会で成果を発表した。会社から五十万龍門幣の発明奨励金を受け取り、次の実験へ戻った。継続的な分配があるかは、別の契約を待つことになった。",
          {
            cash: 500000,
            employmentAction: { action: "site-incident", kind: "research-grant", incident: "patent-award", amount: 500000, sourceEventId: "sr_rhine_patent_breakthrough" },
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
      t: "これまでの研究成果が認められ、主任研究員への昇格面談に呼ばれた。研究室と予算を預かる代わりに、同僚や実験の安全にも責任を持つという。書類の端を押さえ、説明を聞いた。",
      c: [
        $terraData.K("昇進の内示書に署名し、独自ラボを統括する主任研究員へ就任する", {}, [
          1,
          "辞令に署名し、担当する研究室と予算の説明を受けた。主任研究員として同僚の仕事を預かることになり、白衣のポケットに入れた予定表は以前より厚くなった。",
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
        $terraData.K("研究資料を託し、審査と勤務条件を確かめてロドスの研究補助職へ移る", {}, [
          1,
          "機密資料を医療部へ託したあと、人事担当者と経歴や担当業務を確認した。提示された条件に署名し、研究補助の職員証を受け取った。以前の研究室を離れ、船内の机で仕事を始めた。",
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
        $terraData.K("研究職を離れ、組織に属さず次の暮らしを探す", {}, [
          1,
          "研究室へ戻らないと伝え、借りた寝床で荷物をまとめた。診療所の補助仕事なども思い浮かべたが、行き先も働き口もまだ決まっていない。まずは手元の金で暮らしをつなぐことにした。",
          {
            job: 0,
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
      id: "sr_rhine_after_asylum_livelihood",
      conf: "S",
      references: ["SRC_RHINE_LAB", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      after: { id: "sr_rhine_rhodes_asylum", min: 1, choice: 1, outcome: 0 },
      once: true,
      w: 1,
      show: s => !s.job && !s.fl?.detained && !s.fl?.retired,
      t: "研究室を離れてから、細かな出費ばかりが帳面に増えていた。以前の実験ノートをしまい、今の土地でできる仕事を探すことにした。",
      c: [
        $terraData.K("募集のある診療所で、担当できる補助業務を確かめて働く", { show: s => !!employmentOpeningForChoice(s, 20) }, [
          1,
          "診療所を訪ね、読み書きや手順の確認を受けた。専門の診療を任されるわけではないが、器具の準備や記録の整理なら手を貸せる。勤務条件に合意し、新しい持ち場に立った。",
          { employmentAction: { action: "accept-local-opening", jobId: 20 }, p: 2, rl: 1 }
        ]),
        $terraData.K("今は働き口を決めず、節約しながら探し続ける", {}, [
          1,
          "今日の募集には飛びつかず、支出を書き直した。知っている人へ手紙を出し、無理なく続けられる仕事がないか尋ねた。",
          { p: -1, k: 1 }
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
            p: 4
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

  // Additional life at the lab is limited to people whose active affiliation
  // and current post both support the scene. The draft's proposed new military,
  // medical, and whistleblower flags are not introduced here; one-off history
  // is already represented by the event ledger and existing route records.
  const routeStages = ["青年", "壮年", "老年"],
    rhineRole = s => String($terraData.affiliationEntry?.(s, "rhine-lab")?.role || ""),
    rhineDepartment = (s, ...terms) => terms.some(term => rhineRole(s).includes(term)),
    rhineDaily = (id, jobs, text, effect, weight = 0.4) => ({
      id, conf: "S", references: ["SRC_RHINE_LAB"], st: routeStages,
      need: ["国:クルビア"], cd: 3, w: weight,
      show: s => onRhine(s) && s.res?.n === "クルビア" && jobs.includes(s.job),
      t: text, fx: effect || {}
    }),
    rhineDraftChoice = (id, jobs, text, choices, extra = {}) => {
      const { inColumbia = true, show: customShow, extraShow, ...metadata } = extra;
      return {
        id, conf: "S", references: ["SRC_RHINE_LAB"], st: routeStages,
        cd: metadata.cd ?? 5, w: metadata.w ?? 0.35, once: metadata.once ?? true,
        ...metadata,
        show: s => onRhine(s) && jobs.includes(s.job) &&
          (!inColumbia || s.res?.n === "クルビア") &&
          (!customShow || customShow(s)) && (!extraShow || extraShow(s)),
        t: text,
        c: choices.map(([label, outcome, effect, chance = 1]) =>
          $terraData.K(label, {}, ...(Array.isArray(outcome) ? outcome : [[chance, outcome, effect]])))
      };
    };

  const additionalEvents = [
    rhineDaily("sr_rhine_daily_trimounts_monorail", [38, 39, 40], "朝の通勤列車から、トリマウンツの研究区画へ向かう人々の列を眺めた。社員証を確かめ、予定表を開いて今日の仕事を組み立てた。", { k: 1, p: 1 }),
    rhineDaily("sr_rhine_daily_intern_glassware_night", [38], "実習後、器具の洗浄と記録の整理を手伝った。最後に自分の測定値を確かめると、昨日より誤差の理由が見えてきた。", { k: 2, h: -1, lifeSkill: { id: "rhine-academic", delta: 1, context: "実習記録と器具の扱い" } }),
    rhineDaily("sr_rhine_daily_intern_literature_club", [38], "昼休みに同期と論文を読み、分からない数式をノートに書き写した。意見が割れた箇所は、次の実験で確かめることになった。", { k: 2, rl: 1 }),
    rhineDaily("sr_rhine_daily_researcher_grant_defense", [39], "来期の研究費をめぐる面談で、実験の進み具合と残る不確実性を説明した。追加の予算はまだ決まらず、必要な測定を優先して計画を組み直した。", { k: 1, p: -1 }),
    rhineDaily("sr_rhine_daily_chief_peer_review", [40], "研究員から届いた報告書に目を通し、再確認が必要な測定箇所へ付箋を貼った。短いコメントを返すと、午後には修正版が戻ってきた。", { k: 2, rl: 1 }),
    rhineDaily("sr_rhine_daily_energy_waveguide", [38, 39, 40], "導波管の温度記録が前回と少し違っていた。冷却系のログを照合し、条件を変えずにもう一度測ることにした。", { k: 2 }, 0.35),
    rhineDaily("sr_rhine_daily_structural_exoskeleton", [38, 39, 40], "試験架台の固定具を点検し、関節部品の摩耗を記録した。想定外の振動が残ったため、次の試験は安全担当と条件を相談してから行う。", { k: 1, h: -1 }, 0.35),
    rhineDaily("sr_rhine_daily_ecological_biodome", [38, 39, 40], "温室の測定区画で土と水の試料を採った。育成条件が違う鉢を一緒に扱わないよう、札を照合してから記録を閉じた。", { k: 1, p: 1 }, 0.35),
    rhineDaily("sr_rhine_daily_component_control_capsule", [38, 39, 40], "試験用カプセルの温度と粘度を記録した。医療用途に進めるかは、担当部署の評価と安全性の確認を待つことになった。", { k: 1, p: 1 }, 0.35),
    rhineDaily("sr_rhine_daily_arts_application_circuit", [38, 39, 40], "回路基板の試作品を照明の下で確かめ、接点のずれを細い筆で修正した。次の工程へ回せるか、品質担当に測定を頼んだ。", { k: 2 }, 0.35),
    rhineDaily("sr_rhine_daily_scientific_investigation_geology", [38, 39, 40], "持ち込まれた地質試料の採取場所と保管記録を照らし合わせた。測定値だけで年代を断定できず、追加の比較資料を求めることにした。", { k: 2 }, 0.35),
    rhineDaily("sr_rhine_daily_engineering_nasti_scaffold", [38, 39, 40], "設計図の寸法と現場から届いた摩耗記録を照合した。机上の計算だけでは分からない箇所に印をつけ、試験担当へ確認を返した。", { k: 2, rl: 1 }, 0.35),
    rhineDaily("sr_rhine_daily_defense_mech_calibration", [38, 39, 40], "防衛設備の定期点検に立ち会い、警報と停止装置が手順通りに動くかを確かめた。異常は見つからなかったが、記録は保全担当へ渡した。", { k: 1, p: 1 }, 0.35),
    rhineDaily("sr_rhine_daily_business_military_dinner", [39, 40], "部門の説明会に同席し、研究の用途について質問を受けた。約束できる成果と未確定の部分を分けて答え、議事録の確認を引き受けた。", { k: 1, p: -1 }, 0.3),
    rhineDaily("sr_rhine_daily_hr_background_audit", [38, 39, 40], "定期的な情報管理面談で、外部との共同研究記録を一つずつ確認した。判断に迷った点はその場で質問し、説明を記録へ残した。", { k: 1, p: -1 }, 0.3),
    rhineDaily("sr_rhine_daily_trimounts_university_lecture", [39, 40], "工科大学の小さな講義室で、測定誤差の扱いを学生に説明した。質問には分かる範囲だけ答え、未発表の研究内容には触れなかった。", { k: 1, rl: 1 }, 0.3),
    rhineDaily("sr_rhine_daily_late_night_coffee_terrace", [38, 39, 40], "遅い時間に休憩室で同僚と飲み物を手にした。別分野の話を聞くうち、翌日の測定で確かめたい点をノートに書き留めた。", { p: 2, rl: 1 }),
    rhineDaily("sr_rhine_daily_supercomputer_queue", [38, 39, 40], "演算設備の順番を待つ間、入力条件と使うデータの範囲を再確認した。計算結果は翌朝に届き、すぐ結論を出さず再現条件を記録した。", { k: 2 }, 0.35),
    rhineDaily("sr_rhine_daily_archive_redacted_files", [38, 39, 40], "閲覧権限のない資料が検索結果に混じった。内容を開こうとはせず、番号と表示を担当窓口へ伝えて検索を終えた。", { k: 1, p: -1 }, 0.3),
    rhineDaily("sr_rhine_daily_equipment_calibration_dispute", [38, 39, 40], "共用機器の予約が重なり、隣のチームと予定を調整した。試料の安定時間を確認して測定順を入れ替えると、双方の待ち時間を減らせた。", { k: 1, rl: 1 }),
    rhineDaily("sr_rhine_daily_cleanroom_decontamination", [38, 39, 40], "クリーン区画へ入る前に防護具と退出手順を確かめた。作業後、測定器のログに異常がないことを確認して記録を提出した。", { k: 1, h: -1 }, 0.35),
    rhineDaily("sr_rhine_daily_patent_royalty_bonus", [39, 40], "共同研究の知財処理について通知が届いた。分配の条件を契約書と照らし、金額が確定するまでは家計に見込まず保留した。", { k: 1, p: 1 }, 0.3),
    rhineDaily("sr_rhine_daily_cross_section_seminar", [38, 39, 40], "課をまたぐ報告会で、別部署の測定手順を聞いた。自分の計画と重なる点を確かめ、共同で試せる範囲を後日相談することにした。", { k: 2, rl: 1 }, 0.35),
    rhineDaily("sr_rhine_daily_lab_intern_mentoring", [39, 40], "測定に失敗して落ち込む実習生と記録を見直した。原因を一つずつ切り分け、次に試せる条件を一緒に書き出した。", { k: 1, rl: 2 }, 0.35),

    rhineDraftChoice("sr_rhine_choice_ten_sections_specialization", [38, 39, 40], "基礎ローテーションの記録がまとまり、次に希望する専門分野を人事へ提出することになった。今の部署を続けるか、別の課の仕事を知る機会を求めるか、担当者に尋ねられた。", [
      ["生物・医療分野の担当へ希望を出す", "希望先で受け入れ可能な業務を確認し、担当範囲を調整した。異動が確定した仕事から順に引き継ぐことになった。", { lifeAffiliation: { id: "rhine-lab", action: "role", role: "成分制御課・研究員" }, k: 2 }],
      ["工学・科学考察の担当へ希望を出す", "面談で経験と必要な研修を確かめ、受入先と開始時期を相談した。すぐに成果を約束せず、まず共同の測定計画を作った。", { lifeAffiliation: { id: "rhine-lab", action: "role", role: "工学・科学考察課・研究員" }, k: 2 }],
      ["今の所属課で研究を続ける", "異動希望は出さず、現在の担当課で次の試験を続けると伝えた。指導担当は計画を確認し、記録の整理を手伝った。", { k: 1, rl: 1 }]
    ], { after: { id: "sr_rhine_section_assignment", min: 1 } }),
    rhineDraftChoice("sr_rhine_choice_authorship_theft", [38, 39], "共同論文の著者順を決める段階で、実験記録と投稿案の名前が食い違っていた。誰がどの作業を担ったか、ログを確認して話し合うことになった。", [
      ["実験記録を示し、貢献に沿った著者順を求める", "記録を添えて編集担当へ相談し、関係者の確認が終わるまで投稿を止めた。結論には時間がかかったが、自分の担当範囲は文書に残った。", { k: 2, p: -1 }],
      ["共同著者間で作業を整理し、全員が合意できる表記を探す", "一人ずつ担当作業を確認して、著者順と謝辞の案を作り直した。全員の同意を得るまで、成果の発表は延期することにした。", { k: 1, rl: 1 }]
    ], { ge: { age: 19 } }),
    rhineDraftChoice("sr_rhine_choice_military_funding_trap", [39, 40], "クルビアの委託窓口から、研究費と引き換えに成果を非公開で納める相談が届いた。用途の説明は限られ、通常の審査手順もまだ示されていない。", [
      ["用途と審査条件が分かるまで契約を保留する", "研究内容の共有範囲と安全審査を文書で求めた。回答が揃わないため、今回は契約を進めず通常の研究計画を続けた。", { k: 1, p: 1 }],
      ["社内の契約・倫理担当へ照会し、受けられる範囲を確かめる", "関係部署へ相談し、軍事利用を含む契約条件の審査を依頼した。許可が出るまではデータを渡さず、計画は保留になった。", { k: 1, p: -1 }]
    ], { ge: { age: 21 } }),
    rhineDraftChoice("sr_rhine_choice_infected_assistant_exposure", [38, 39, 40], "同じ区画で働く助手が、過去の調査後に受けた検査について相談してきた。本人の同意なしに情報を広げることはできないが、職場の危険と診療の必要性を一緒に確かめたいという。", [
      ["本人の同意を得て医療窓口と安全担当へつなぐ", "本人が選んだ範囲だけを医療担当へ伝え、配置上の注意と受診方法を相談した。診断や雇用上の判断は、担当者と本人の確認に委ねた。", { rl: 1, p: 1 }],
      ["まず本人と、話せる相手や受診先を一緒に探す", "相談先の候補と費用を調べ、本人が情報を渡す相手を選べるよう整理した。職場へ伝える内容は、本人の返事を待つことにした。", { k: 1, rl: 1 }]
    ], { ge: { age: 20 } }),
    rhineDraftChoice("sr_rhine_choice_industrial_spy_bribe", [38, 39, 40], "仕事帰り、研究内容を知りたがる見知らぬ人物から面会を求められた。相手は所属と用件をはっきり示さず、未公開データを見せてほしいと言う。", [
      ["応じず、接触の内容を情報管理窓口へ報告する", "名刺と会話の記録を窓口へ渡し、担当者の指示に従ってアクセス権を確認した。調査の結果が出るまでは、相手へ連絡しないことにした。", { k: 1, p: 1 }],
      ["公開できる資料だけを示し、正式な照会先を案内する", "未公開データには触れず、公開済みの資料と問い合わせ窓口を伝えた。面会の記録を上司へ共有し、以後の連絡は正式な手続きに任せた。", { k: 1 }]
    ], { ge: { age: 20 } }),
    rhineDraftChoice("sr_rhine_choice_toxic_solvent_leak", [39, 40], "委託先の試験設備で、排水記録の値が前回より高くなっていた。実際に外へ漏れたかはまだ確認できず、現地責任者は稼働を続けながら測定し直したいと言っている。", [
      ["排水を止め、検体を採り直すよう安全担当へ連絡する", "稼働を一時止めて排水と周辺の検体を採取した。原因が分かるまで結果を公表せず、確認できた範囲を関係者へ報告した。", { k: 1, p: -1 }],
      ["設備を隔離して監視しながら、再測定と修理を進める", "流路を切り替えて検体を採り直し、保全担当にフィルターを点検してもらった。異常値の原因は断定せず、経過を記録に残した。", { h: -1, k: 1 }]
    ], { ge: { age: 20 } }),
    rhineDraftChoice("sr_rhine_choice_ai_ethics_boundary", [39, 40], "神経信号を演算機へ送る試験で、出力を上げれば測定精度が増す一方、被験者への負荷も上がると分かった。安全担当は追加試験の条件を見直すよう求めている。", [
      ["負荷の上限を下げ、独立した安全審査を待つ", "試験を止めて条件を記録し、被験者と安全担当に再評価を依頼した。再開時期は決めず、審査結果を待つことになった。", { k: 1, p: 1 }],
      ["自分を被験者にせず、非接続の模擬系で検証する", "実際の神経へ接続する案は退け、模擬信号を使う試験へ切り替えた。得られる結果は限定されるが、危険な条件を避けられた。", { k: 2 }]
    ], { ge: { age: 21 } }),
    rhineDraftChoice("sr_rhine_choice_orphan_clinical_trial_audit", [39, 40], "関連財団が支援する医療計画の資料に、治験と生活支援の条件が並んでいた。対象となる子どもや保護者が内容を理解して選べるのか、説明文書だけでは判断できない。", [
      ["独立した倫理審査と、参加しない場合の支援継続を求める", "審査担当へ懸念を伝え、治験への参加と生活支援を別々に選べるよう説明文書の見直しを求めた。実施の可否は審査結果に委ねた。", { k: 2, p: 1 }],
      ["医療担当と連携し、本人・保護者向けの説明を確認する", "安全性と不明点を医療担当に確認し、保護者が質問できる場を設けるよう提案した。薬剤の切替は担当医と本人側の判断を待った。", { k: 1, rl: 1 }]
    ], { ge: { age: 21 } }),
    rhineDraftChoice("sr_rhine_choice_failed_prototype_coverup", [38, 39, 40], "公開予定の試作品に、運転中の振動が基準を超える記録が見つかった。原因が特定できないまま出資者向けの説明会が迫り、担当部署は判断を求めている。", [
      ["説明会を延期し、分かっている不具合と対策を伝える", "責任者へ記録を示して説明会を延期した。計画の遅れは残ったが、危険性が分からないまま実演することは避けられた。", { k: 1, p: 1 }],
      ["出力を落とした検証に切り替え、再現できる範囲だけ示す", "実演を中止し、試験条件と安全限界を明示した模擬運転に変更した。原因の特定までは、性能の説明を控えることになった。", { k: 1, h: -1 }]
    ], { ge: { age: 19 } }),
    rhineDraftChoice("sr_rhine_choice_colleague_burnout_stimulants", [38, 39, 40], "隣の席の研究員は、眠れていないと話しながら薬の小瓶を机に置いた。何の薬か、医師の指示があるかは分からない。本人は作業を止めたくないという。", [
      ["本人の意思を確かめ、医療室への相談を提案する", "薬を勝手に取り上げず、体調の相談先を一緒に確認した。作業の一部を引き継げるか上司へ尋ね、本人が休む時間を取れるよう調整した。", { rl: 1, h: 1 }],
      ["納期と作業量を上司へ伝え、計画の見直しを求める", "本人の了承を得たうえで、作業負荷と納期の問題を責任者へ伝えた。医療相談は本人の選択として残し、当面の担当分を組み直した。", { k: 1, p: 1 }]
    ], { ge: { age: 20 } }),
    rhineDraftChoice("sr_rhine_choice_sami_expedition_volunteer", [38, 39, 40], "北方の観測計画で、測定班と本社の解析班の募集があった。現地の天候や移動条件はまだ固まっておらず、説明会では必要な装備と日程を確認できるという。", [
      ["現地班に応募し、健康・装備・退避条件を確認する", "説明を受けたうえで応募書類を出した。参加が決まるまでは通常業務を続け、必要な訓練や装備の準備を待つことになった。", { k: 1, p: 1 }],
      ["本社の解析班を希望し、現地から届く記録を扱う", "移動を伴わない解析班へ希望を出した。観測方法とデータの限界を確かめ、現地班との連絡手順を確認した。", { k: 2 }]
    ], { ge: { age: 20 }, inColumbia: false }),
    rhineDraftChoice("sr_rhine_choice_patent_open_source_medical", [39, 40], "試験用の測定法を社外でも使える形にできないか、知財担当から相談が来た。患者への利用可能性はまだ検証中で、費用や認証の条件も決まっていない。", [
      ["安全性と利用条件を先に確かめ、公開可能な部分を整理する", "検証状況と知財の範囲を分けて資料にまとめた。医療用途として使えるとの案内は出さず、追加審査を依頼した。", { k: 1, p: 1 }],
      ["会社の審査へ回し、契約と共同開発の条件を確認する", "知財担当へ開発経緯と確認が必要な点を提出した。公開時期や収益条件は契約案を確かめてから決めることになり、研究は続いた。", { k: 1 }]
    ], { ge: { age: 22 } }),
    rhineDraftChoice("sr_rhine_choice_kristen_secret_corridor", [39, 40], "総轄室から、通常の申請書にない高高度観測データの検算を頼まれた。解析を進めても観測条件の一部は開示されず、担当者は閲覧範囲を改めて確認するよう求めている。", [
      ["閲覧権限と解析範囲を文書で確認してから着手する", "手元にある記録で再現できる計算をまとめ、追加資料が届くまで結論を保留すると報告した。", { k: 1, p: 1 }],
      ["公開可能な範囲で検算し、推測と測定結果を分けて報告する", "再現できる計算と仮定を分けて提出した。閲覧範囲は変わらず、総轄室の返答を待つことになった。", { k: 2 }]
    ], { ge: { age: 23, year: 1090 }, le: { year: 1099 } }),
    rhineDraftChoice("sr_rhine_choice_parvis_old_specimen_disposal", [39, 40], "保管庫の整理中、古い被験者記録と試料が未処理のまま残っていることに気づいた。誰の承認で保管されているか、資料だけでは確かめられない。", [
      ["保全記録を作り、倫理・情報管理担当へ報告する", "資料を動かさずに所在と状態を記録し、関係部署へ引継ぎを依頼した。調査や遺族への連絡は、権限のある担当者の確認を待つことになった。", { k: 1, p: 1 }],
      ["閲覧範囲を閉じ、上司へ保管責任者の確認を求める", "不用意に複製せず、保管庫の鍵と閲覧履歴を確認した。記録の扱いが決まるまで、試料には触れないことにした。", { p: -1, k: 1 }]
    ], { ge: { age: 22 } }),
    rhineDraftChoice("sr_rhine_choice_mansfield_prison_research_offer", [39, 40], "外部施設での研究補助について、通常とは異なる審査手順の相談が届いた。対象者への説明や同意の方法が資料に見当たらず、出向先の実態も確認できていない。", [
      ["出向を保留し、審査手順と参加者の保護を確認する", "人事と倫理担当へ文書を戻し、必要な審査と本人への説明を求めた。条件が整うまでは出向を受けないことになった。", { k: 1, p: 1 }],
      ["許可された設備監査だけを引き受け、実験担当から距離を置く", "監査範囲を限定した案を提出した。責任者の承認と現地の安全条件が揃うまで、出発は保留された。", { k: 1, h: -1 }]
    ], { ge: { age: 21, year: 1090 }, le: { year: 1099 }, inColumbia: false }),
    rhineDraftChoice("sr_rhine_choice_ecology_mutation_containment", [38, 39, 40], "飼育区画の小動物に、記録と異なる行動が見られた。原因は環境変化か体調不良か分からず、担当者は隔離と獣医的な確認を検討している。", [
      ["環境を分けて観察し、担当者に健康状態の確認を頼む", "刺激を減らせる区画へ移し、記録を取りながら専門担当へ確認を依頼した。異常の原因や生態上の意味は、まだ決めつけないことにした。", { k: 1, p: 1 }],
      ["通常手順に従って作業を止め、責任者へ引き継ぐ", "観察を中断し、責任者の指示があるまで他の個体と分けて管理した。研究よりも安全確認を先に進めることになった。", { k: 1 }]
    ], { ge: { age: 19 } }),

    rhineDraftChoice("sr_rhine_promo_intern_to_researcher_fast", [38], "実習期間の評価面談で、担当した測定と学習記録を確認された。専任研究員への応募資格は得られたが、採用と配属は別の審査になるという。", [
      ["正式な採用選考へ応募する", "面談と課題審査を受け、専任研究員として採用された。新しい職務と報酬条件を確認してから辞令に署名した。", { job: 39, lifeAffiliation: { id: "rhine-lab", action: "role", role: "ライン生命専任研究員" }, lifeGoal: { id: "rhine-research", action: "continue", note: "実習を経て専任研究員として採用された" }, k: 1 }],
      ["実習を続け、応募時期を改める", "不足している研修内容を確認し、現職の実習を続けることにした。昇格の内示や採用はまだない。", { k: 1, p: 1 }]
    ], { ge: { age: 20 }, after: { id: "sr_rhine_section_assignment", min: 1 }, extraShow: s => s.k >= 45 }),
    rhineDraftChoice("sr_rhine_promo_deputy_section_head", [40], "欠員の間、課内の予定と安全確認を取りまとめる補佐役を打診された。権限と責任の範囲はまだ調整中で、正式な任命ではない。", [
      ["期間と決裁範囲を確認して、補佐役を引き受ける", "期間限定の担当として書類を受け取り、研究計画と安全記録を整理した。最終決裁は引き続き課長へ確認する。", { lifeAffiliation: { id: "rhine-lab", action: "role", role: "主任研究員・課内運営補佐" }, k: 1, rl: 1 }],
      ["研究の責任を優先し、今回は役割を断る", "現在の研究を続けたいと伝え、担当範囲を戻した。課内の調整役は別の職員が引き継ぐことになった。", { k: 1 }]
    ], { ge: { age: 26 }, after: { id: "sr_rhine_promotion_chief", min: 1 } }),
    rhineDraftChoice("sr_rhine_promo_trimounts_endowed_chair", [39, 40], "大学から講義と共同研究の相談が届いた。常勤職への移籍条件、研究設備、知財の扱いはまだ書面で確認できていない。", [
      ["条件を確かめて正式な採用選考へ進む", "研究所と大学の双方に条件を照会し、採用選考を受けた。結果が出るまでは現在の職務を続けることになった。", { k: 1, p: 1 }],
      ["非常勤の講義だけを引き受ける", "本務と利益相反がない範囲を確認し、単発の講義を担当した。大学の常勤職への移籍は決まっていない。", { lifeAffiliation: { id: "rhine-lab", action: "role", role: "研究員・学外講義担当" }, rl: 1 }]
    ], { ge: { age: 32 }, extraShow: s => s.k >= 60 }),
    rhineDraftChoice("sr_rhine_promo_ethics_committee_after_1099", [39, 40], "孤星の後、研究手順や情報管理を見直す会議が開かれた。委員会への参加は任意で、組織の方針がすぐ変わるとの説明はない。", [
      ["委員として、同意と安全確認の手順を検討する", "議事録に懸念と改善案を書き、現場で実行できる確認手順を提案した。採否は委員会の次回審議に持ち越された。", { k: 1, p: 1, rl: 1 }],
      ["研究担当として、現場で守れる手順を提出する", "委員会への常時参加はせず、自分の部署で起きた課題を整理して提出した。制度改定の決定は待つことになった。", { k: 1 }]
    ], { ge: { year: 1099 }, after: { id: "sr_rhine_lone_trail_sky_horizon", min: 0 } }),
    rhineDraftChoice("sr_rhine_promo_joint_rhodes_liaison", [39, 40], "ロドスとの共同研究で、連絡と成果物の受け渡しを担う担当者が必要になった。相手側の受入れと情報共有範囲は、まだ双方の確認待ちだ。", [
      ["担当に応募し、双方の窓口と共有範囲を文書化する", "連絡担当として候補に挙がり、守秘条件と受入れ手順を人事へ確認した。共同任務の開始は合意が整ってからとなった。", { lifeAffiliation: { id: "rhine-lab", action: "role", role: "研究員・ロドス連携窓口" }, k: 1, rl: 1 }],
      ["現在の担当を続け、共同研究の技術照会に協力する", "連絡窓口は別の職員に任せ、必要な技術資料だけを承認された範囲で準備した。", { k: 1 }]
    ], { ge: { age: 22 } }),
    rhineDraftChoice("sr_rhine_promo_project_lead_autonomous", [39, 40], "部門横断の研究計画で、実務のまとめ役を担わないかと相談された。予算や人事を独断で決める権限はなく、成果の責任分担も明確にする必要がある。", [
      ["担当範囲を限定して、プロジェクト調整を引き受ける", "参加者と作業範囲を一覧にし、未確定の予算は別途承認を求めた。進捗会議を開き、判断の記録を共有した。", { lifeAffiliation: { id: "rhine-lab", action: "role", role: "主任研究員・プロジェクト調整" }, k: 1, rl: 1 }],
      ["専門作業に集中するため、調整役は辞退する", "今の研究を優先すると伝え、会議には技術担当として参加することにした。", { k: 1 }]
    ], { ge: { age: 24 } }),
    rhineDraftChoice("sr_rhine_transfer_field_to_hq_injury", [38, 39, 40], "出張後、痛みと疲労が残っていることに気づいた。移動や作業を続けるかは診療担当の評価が必要で、本人の申告だけで勤務可否は決められない。", [
      ["受診して、現地作業を再開できるか確認する", "診療担当へ症状と作業内容を伝え、必要な休養と復帰条件を相談した。現地復帰は評価が出るまで見合わせた。", { h: 1, p: 1 }],
      ["出張を切り上げ、職場でできる作業へ切り替える", "上司に状況を伝えて移動を終え、無理のない範囲で記録整理を続けた。休養の必要性は医療担当にも相談することになった。", { h: 1, k: 1 }]
    ], { inColumbia: false, ge: { age: 18 } }),
    rhineDraftChoice("sr_rhine_promo_columbia_science_award", [39, 40], "研究成果の発表後、学会の候補者として名前を挙げられた。受賞はまだ決まっておらず、共同研究者の貢献も含めて申請内容を確認する必要がある。", [
      ["共同研究者と成果の範囲を確認し、推薦を受ける", "共著者の確認を得て候補者資料を提出した。選考結果は後日通知されるため、発表では確定前の受賞として扱わなかった。", { k: 1, rl: 1 }],
      ["今回は辞退し、共同成果の整理を優先する", "推薦者へ辞退を伝え、共同研究者と記録・公開範囲を整理した。", { k: 1 }]
    ], { ge: { age: 24 } }),

    rhineDraftChoice("sr_rhine_crisis_diabolic_lab_fire_echo", [38, 39, 40], "過去の実験区画で警報が鳴った。原因は設備の誤作動か残留熱か分からず、現場責任者は立入を止めて記録を確認している。", [
      ["退避手順に従い、警報と区域の状態を報告する", "区画を離れて人員確認を手伝い、設備担当へ記録を渡した。火災や被害の有無は調査が終わるまで断定されなかった。", { h: -1, p: -1 }],
      ["承認を得て、外側の計器と停止状態を確認する", "許可された位置から計器を確認し、設備担当へ数値を伝えた。原因の特定は専門班へ引き継がれた。", { k: 1 }]
    ], { after: { id: "sr_rhine_diabolic_ethical_crossroad", min: 1 } }),
    rhineDraftChoice("sr_rhine_crisis_saria_resignation_shock", [38, 39, 40], "上層部の人事に関する短い通知が届き、研究員の間に憶測が広がった。公表されたのは担当窓口の変更だけで、個人の判断や退職理由までは示されていない。", [
      ["確認できる業務連絡だけを読み、未確認の話を広めない", "通知にある窓口と引継ぎ先を確認した。人事の噂には加わらず、必要な問い合わせを正式な窓口へ送った。", { k: 1 }],
      ["研究室内の不安を聞き、担当業務の引継ぎを手伝う", "同僚が困っている手続きや承認先を一緒に確認した。人事の背景は分からないままでも、作業の停滞は少し和らいだ。", { rl: 1, p: 1 }]
    ], { ge: { year: 1098 }, after: { id: "sr_rhine_lone_trail_sky_horizon", min: 0 } }),
    rhineDraftChoice("sr_rhine_crisis_1099_site359_roanoke_silver", [38, 39, 40], "359号基地の記録整理で、調査対象者の識別情報と試験データが同じ保管箱に入っていた。作業記録の誤りか、権限外の持ち出しかは判別できない。", [
      ["識別情報を隔離し、権限者立会いで保管記録を確認する", "閲覧を止めて箱の状態を記録し、個人情報を扱う担当者に引き継いだ。対象者や資料の行方について推測はしなかった。", { k: 1, p: 1 }],
      ["自分の担当分だけ照合し、記録の不一致を報告する", "許可範囲のログを確認して不一致を報告した。資料全体へのアクセスは止め、調査担当の返答を待った。", { k: 1 }]
    ], { ge: { year: 1098 }, le: { year: 1099 }, after: { id: "sr_rhine_359_transmitter_consent", min: 1 } }),
    rhineDraftChoice("sr_rhine_crisis_1099_ferdinand_particles_panic", [39, 40], "観測設備の数値が急に跳ね、原因をめぐる説明が部署ごとに食い違った。現場の安全担当は、データを確かめるまで装置の再起動を止めている。", [
      ["ログと校正記録を照合し、再起動を待つ", "複数の計器と校正履歴を比較した。原因はその場では分からず、再起動は責任者の承認後に持ち越された。", { k: 1, p: 1 }],
      ["異常値の発生時刻と作業者の記録を保全する", "作業者の記録を集め、異常が起きた時刻と周辺の作業を整理した。装置の状態は変えず、専門担当へ渡した。", { k: 1, rl: 1 }]
    ], { ge: { year: 1099 }, le: { year: 1099 }, after: { id: "sr_rhine_lone_trail_sky_horizon", min: 0 } }),
    rhineDraftChoice("sr_rhine_crisis_1099_trimounts_martial_law", [38, 39, 40], "トリマウンツの施設警備が強化され、入構時の確認に時間がかかるようになった。街全体の法令や外出制限を示す通知はなく、研究所の構内手順だけが更新されている。", [
      ["新しい入構手順を読み、通勤時間を調整する", "確認項目を読み直し、必要な許可証を人事に照会した。根拠の分からない噂は同僚へ転送しなかった。", { k: 1 }],
      ["不便の記録をまとめ、警備担当へ改善を申し入れる", "待ち時間と手続き上の問題を記録して窓口へ送った。改善の返事はまだないが、通勤経路を同僚と相談した。", { rl: 1, p: -1 }]
    ], { ge: { year: 1099 }, le: { year: 1099 }, after: { id: "sr_rhine_lone_trail_sky_horizon", min: 0 } }),
    rhineDraftChoice("sr_rhine_crisis_1100_post_kristen_reorganization", [38, 39, 40], "大きな計画の後、研究区画の承認者と保管先が順に見直された。組織の将来像はまだ決まらず、現場には未整理の装置と引継ぎ書類が残っている。", [
      ["担当設備と試料の状態を棚卸しし、引継ぎ表を作る", "状態を確かめた範囲で一覧を作り、未確認の項目には印をつけた。次の承認者が決まるまで、装置の用途を変更しないことにした。", { k: 1, rl: 1 }],
      ["自分の研究を続けられる条件を上司へ確認する", "利用できる設備と保留中の計画を上司に尋ねた。確答はまだなく、進められる作業だけを選んで記録した。", { k: 1, p: 1 }]
    ], { ge: { year: 1100 }, after: { id: "sr_rhine_lone_trail_sky_horizon", min: 1 } }),
    rhineDraftChoice("sr_rhine_crisis_1101_nasti_propeller_paradise", [38, 39, 40], "研究所の計画表に、翌年度へ持ち越す設備案件が並んでいた。設計担当の説明はまだ社内向けで、完成時期や外部への影響は決まっていない。", [
      ["現場の設計条件を確かめ、未確定の予定を分けて整理する", "図面と安全条件を照合し、未承認の部分を保留欄へ移した。次年度の実施計画は担当部署の確認を待つことになった。", { k: 1 }],
      ["自分の担当作業だけを引き継ぎ、計画の公表を待つ", "担当記録を次の職員へ渡し、計画全体については正式な説明が出るまで判断を控えた。", { k: 1, p: 1 }]
    ], { ge: { year: 1100 }, after: { id: "sr_rhine_lone_trail_sky_horizon", min: 1 } }),
    rhineDraftChoice("sr_rhine_incident_sub_lab_radiation_lockdown", [38, 39, 40], "測定室の警報が作動し、入室許可が一時停止された。被曝があったかどうかは測定結果を待つ必要があり、現場では退出記録を確認している。", [
      ["区域へ戻らず、退避と個人線量の確認に協力する", "管理区域の外で待機し、線量計と作業記録を担当者へ渡した。診断や健康影響は専門機関の確認を待つことになった。", { h: -1, p: -1 }],
      ["装置の停止状態を遠隔表示で確認し、記録を渡す", "立入許可が戻るまで遠隔表示を記録し、担当者へ引き継いだ。警報の原因は保全班が調査している。", { k: 1 }]
    ], { ge: { age: 18 } }),
    rhineDraftChoice("sr_rhine_incident_academic_fraud_scandal", [38, 39, 40], "学会発表の測定値に誤記があるとの問い合わせが届いた。故意か転記ミスかは分からず、共著者と記録を確認する必要がある。", [
      ["原データを保全し、共著者と訂正手続きを進める", "実験ノートと出力を照合し、確認できた誤記を編集部へ報告した。責任の所在は調査を待ち、訂正文の準備を始めた。", { k: 1, p: -1 }],
      ["問い合わせを受け付け、研究公正の担当者へ引き継ぐ", "資料を複製せず、問い合わせと保管場所を研究公正窓口へ連絡した。調査中の内容は外部へ話さないことにした。", { k: 1 }]
    ], { ge: { age: 18 } }),
    rhineDraftChoice("sr_rhine_rare_muelsyse_umbrella_walk", [38, 39, 40], "雨宿りの場所で、研究所の共同研究者と短い世間話をした。相手の冗談に少し笑い、傘を借りるかどうかを尋ねられた。", [
      ["傘を借り、返す方法を決める", "借用の記録を残して傘を受け取った。翌日、乾かしてから返すと約束した。", { rl: 1, p: 1 }],
      ["礼を言い、自分の上着で雨をしのぐ", "相手の申し出に礼を言って断り、濡れた袖を絞って駅まで歩いた。", { p: 1 }]
    ], { w: 0.12 }),
    rhineDraftChoice("sr_rhine_rare_saria_elevator_advice", [38, 39, 40], "設備点検の帰り、上司と同じエレベーターに乗り合わせた。作業の遅れを気にしていると、手順を確認して無理をしないよう短く助言された。", [
      ["助言を受け、未確認の作業を翌日に回す", "残っていた確認事項を記録し、交代担当へ引き継いだ。急いで作業を続ける必要はなくなった。", { h: 1, p: 1 }],
      ["作業状況を説明し、安全な範囲で今日の分を終える", "点検を一つずつ確かめ、残りは時間内に終わる範囲だけ進めた。", { k: 1 }]
    ], { w: 0.12 }),
    rhineDraftChoice("sr_rhine_rare_dorothy_dream_questionnaire", [38, 39, 40], "共同研究の説明会で、研究が暮らしにどう役立つかを問われた。回答欄には理想と現状を分けて書くよう注意書きがある。", [
      ["期待できる用途と、まだ分からない点を分けて答える", "今の成果と将来の可能性を区別して記入した。実用化や治療効果を保証する表現は避けた。", { k: 1, p: 1 }],
      ["回答を保留し、公開できる研究範囲を確認する", "質問を持ち帰り、共同研究の公開条件を担当窓口へ照会した。", { k: 1 }]
    ], { after: { id: "sr_rhine_359_transmitter_consent", min: 1 }, w: 0.12 }),

    rhineDraftChoice("sr_rhine_injury_lab_crystal_burn", [38, 39, 40], "防護具を外す前、袖口に小さな裂け目が見つかった。肌に異常はないが、作業中に源石試料を扱っていたため、手順に沿った確認が必要になった。", [
      ["作業を止め、洗浄と検査を受ける", "担当者へ状況を伝えて洗浄し、検査結果が出るまで試料室へ戻らないことにした。異常の有無は医療担当の確認を待った。", { h: -1, p: -1 }],
      ["記録を残して、指示された範囲で手順を続ける", "作業記録と防護具の状態を提出し、担当者の確認を受けた。必要な追加検査があれば受けることにした。", { k: 1 }]
    ]),
    rhineDraftChoice("sr_rhine_injury_neural_feedback_migraine", [39, 40], "接続試験の後、頭痛と吐き気が続いた。作業との関係はまだ分からず、医療担当は症状を記録して負荷の高い試験を休むよう勧めている。", [
      ["受診し、回復するまで試験から外れる", "症状と作業記録を医療担当へ伝え、負荷試験を休止した。復帰は診療結果と本人の状態を見て決めることになった。", { h: 1, p: 1 }],
      ["模擬信号を使う作業へ切り替える", "実際の神経接続を避け、模擬系のデータ整理へ移った。頭痛が続く場合は受診するよう記録に残した。", { k: 1, h: -1 }]
    ]),
    rhineDraftChoice("sr_rhine_injury_chronic_overwork_collapse", [38, 39, 40], "長時間の作業が続いた日の帰り、足元がふらついて椅子に座り込んだ。原因を疲労だけと決めつけず、同僚が医療室へ連絡した。", [
      ["医療室で状態を確認し、勤務予定を調整する", "体調を確かめてもらい、必要な休養を取った。次の勤務は回復状態と担当者の助言を踏まえて決めることになった。", { h: 1, p: 1 }],
      ["上司へ状況を伝え、残りの作業を引き継ぐ", "作業記録を同僚へ渡し、その日は帰宅した。続く症状があれば受診するよう、本人にも伝えた。", { h: 1, rl: 1 }]
    ]),
    rhineDraftChoice("sr_rhine_death_originium_reactor_explosion", [39, 40], "試験設備の圧力値が安全範囲を外れた。警報の原因が分からないまま、責任者は停止を指示し、作業員は退避を始めている。", [
      ["手順通りに停止し、退避と点呼を優先する", "停止操作と退避を完了し、点呼で全員の無事を確認した。設備の損傷は調査班へ引き継がれた。", { h: -1, p: -1 }],
      ["退避を続けながら、遠隔停止の確認を補助する", [
        [0.96, "退避区画から遠隔表示を確認し、停止信号が届いたことを担当者へ伝えた。全員が建物の外で点呼を受けた。", { p: -1, h: -1 }],
        [1, "退避経路の設備が破損し、爆発の衝撃に巻き込まれた。医療班の到着は間に合わず、その場で命を落とした。", { d: ["研究設備の爆発事故", "停止対応中に設備が破損し、爆発の衝撃による致命傷を負った。"] }]
      ]]
    ], { ge: { age: 18 } }),
    rhineDraftChoice("sr_rhine_death_unapproved_bio_trial", [39, 40], "臨床試験の現場で、予期しない症状を訴える参加者が出た。試験責任者は新規投与を止め、医療班と連絡を取っている。", [
      ["試験を中断し、参加者の救護を手伝う", "追加投与を止め、担当医の指示に従って救護と記録の保全を行った。原因と経過は医療班が調べている。", { p: -1, k: 1 }],
      ["担当医へ連絡し、承認済みの手順だけを支援する", [
        [0.97, "担当医が到着し、参加者は処置を受けた。試験は中断され、同意と安全性を見直すことになった。", { k: 1, p: -1 }],
        [1, "救護が続くなか、別の区画で装置が暴走した。退避中に重傷を負い、その後死亡した。原因は調査中として記録された。", { d: ["臨床試験施設での事故", "試験中断後の退避時に重傷を負い、医療処置を受けたが死亡した。"] }]
      ]]
    ], { ge: { age: 18 } }),
    rhineDraftChoice("sr_rhine_death_black_ops_silenced", [38, 39, 40], "機密情報を持ち出したと疑われ、警備担当から事情聴取を受けた。証拠の所在は明かされず、法務と人事が記録の確認を始めている。", [
      ["弁護士または正式な社内窓口の同席を求める", "聴取を中断して手続きの根拠を確認した。記録を保全し、関係者への接触は法務の指示を待つことになった。", { p: -1, k: 1 }],
      ["質問に答え、当時の作業記録を提出する", [
        [0.99, "作業記録を提出し、確認が続く間は機密区画への立入を控えた。処分の有無はまだ決まっていない。", { p: -1 }],
        [1, "事情聴取の場を離れた直後、身元不明の襲撃に遭った。救助が間に合わず命を落とし、事件は調査中として残された。", { d: ["身元不明者による襲撃", "聴取後の移動中に身元不明者の襲撃を受け、致命傷を負った。"] }]
      ]]
    ], { ge: { age: 18 } }),
    rhineDraftChoice("sr_rhine_death_sami_collapsal_expedition", [38, 39, 40], "北方の観測隊から、予定外の異常現象が記録されたと連絡が入った。詳細は未確認で、責任者は隊員に接近を避けて待機するよう指示した。", [
      ["安全地点を保ち、通信と位置記録を送る", "観測地点へ近づかず、通信を維持して位置と計器の記録を送った。帰路は責任者の判断を待った。", { k: 1, h: -1 }],
      ["異常域の外縁で追加測定を試みる", [
        [0.97, "外縁で短時間の測定を行い、異常が強まる前に退いた。試料は持ち帰らず、記録だけを解析班へ送った。", { k: 2, h: -1 }],
        [1, "観測機材の故障で帰路が塞がれ、吹雪の中で救助を待つことになった。救助隊が到着する前に力尽きた。", { d: ["北方調査中の遭難", "異常現象の観測中に起きた機材故障と悪天候により、救助を待つ間に死亡した。"] }]
      ]]
    ], { ge: { age: 18 }, inColumbia: false }),
    rhineDraftChoice("sr_rhine_death_arts_transmitter_burnout", [39, 40], "伝達装置の出力が予定値を超え、被験者から強い不快感の申告があった。担当医は即時停止を求め、技術班は電源を切り離している。", [
      ["電源を切り離し、被験者の状態確認を優先する", "試験を止めて医療班へ引き継いだ。記録は封印し、再開判断は安全審査を待つことになった。", { p: -1, k: 1 }],
      ["遠隔の非常遮断を行い、装置から離れる", [
        [0.98, "遮断装置が作動し、被験者と作業員は医療確認を受けた。事故報告書には、停止手順の見直しが記された。", { h: -1, k: 1 }],
        [1, "装置の放電が遮断操作の直前に広がり、退避中に致命傷を負った。記録には原因未確定の事故として残った。", { d: ["伝達装置の放電事故", "出力異常を起こした装置の放電に巻き込まれ、退避中に致命傷を負った。"] }]
      ]]
    ], { ge: { age: 18 } }),
    rhineDraftChoice("sr_rhine_death_karoshi_at_desk", [38, 39, 40], "帰宅時間を過ぎても席に残っていた同僚が、返事をしなくなった。呼吸は確認できるが、意識がはっきりせず、近くの職員が医療室へ連絡した。", [
      ["救急連絡を行い、責任者へ作業記録を渡す", "医療班が到着し、同僚は診察を受けた。残りの作業は中断し、勤務時間の記録も提出された。", { p: -1, rl: 1 }],
      ["周囲の人と応急対応を続け、救助を待つ", [
        [0.99, "医療班が到着するまで応急対応を続けた。同僚はその後も経過観察を受け、部署は勤務の組み方を見直した。", { p: -1, h: -1 }],
        [1, "同僚は搬送先で亡くなった。長時間勤務との因果は調査中で、職場は記録の提出を求められた。", { d: ["勤務中の急病", "勤務中に意識を失い、搬送先で死亡した。原因と勤務との関係は調査中。"] }]
      ]]
    ], { ge: { age: 18 } }),
    // RL-70: the asylum move is already implemented by sr_rhine_rhodes_asylum.
    {
      id: "sr_rhine_retire_university_professor", conf: "S", references: ["SRC_RHINE_LAB"],
      st: routeStages, ge: { age: 35 }, once: true, cd: 8, w: 0.3,
      show: s => onRhine(s) && [39, 40].includes(s.job) && s.k >= 60,
      t: "工科大学から、講義と技術研究職の求人案内が届いた。研究所を離れるなら、採用条件と今の担当の引継ぎを先に確かめる必要がある。",
      c: [
        $terraData.K("技術研究職の求人へ応募し、採用後に研究所を退職する", { show: s => !!employmentOpeningForChoice(s, 7) }, [
          1, "選考を受け、大学の技術研究職に採用された。契約条件を確認して勤務を始め、研究所の職員証を返した。",
          { job: 7, employmentAction: { action: "accept-local-opening", jobId: 7 }, lifeAffiliation: { id: "rhine-lab", action: "leave", note: "大学の技術研究職へ採用されたため退職" }, lifeGoal: { id: "rhine-research", action: "abandon", note: "研究所を退職し技術職へ移った" }, k: 1, rl: 1 }
        ]),
        $terraData.K("応募は見送り、現在の研究を続ける", {}, [1, "常勤職への応募は見送り、講義の条件だけを大学へ尋ねた。現在の研究と利益相反がないか、担当者へ確認することになった。", { k: 1 }])
      ]
    },
    {
      id: "sr_rhine_retire_independent_patent_office", conf: "S", references: ["SRC_RHINE_LAB"],
      st: routeStages, ge: { age: 32 }, once: true, cd: 8, w: 0.25,
      show: s => onRhine(s) && [39, 40].includes(s.job) && s.k >= 50,
      t: "研究所で培った知識を別の仕事に生かす道を考え始めた。地域の求人と契約条件を調べ、独立事務所に必要な費用も見積もる必要がある。",
      c: [
        $terraData.K("地域の技術職に応募し、採用条件を確認してから移る", { show: s => !!employmentOpeningForChoice(s, 7) }, [
          1, "地域の技術職に採用された。引継ぎと開始日を確かめてから研究所を退職し、新しい職場へ移った。",
          { job: 7, employmentAction: { action: "accept-local-opening", jobId: 7 }, lifeAffiliation: { id: "rhine-lab", action: "leave", note: "地域の技術職へ採用されたため退職" }, lifeGoal: { id: "rhine-research", action: "abandon", note: "研究所を退職して技術職へ移った" }, k: 1 }
        ]),
        $terraData.K("条件が整うまで、今の職場で働き続ける", {}, [1, "求人の条件を調べたが、移る決断は急がなかった。現在の研究を続けながら、次の機会を待つことにした。", { k: 1, p: 1 }])
      ]
    },
    rhineDraftChoice("sr_rhine_retire_pension_and_royalties", [38, 39, 40], "年齢や体調を考え、今の勤務を続けるか相談する時期になった。退職後の年金や特許収入が保証されるとは限らず、契約と家計を自分で確かめる必要がある。", [
      ["退職条件を確認し、仕事を終える", "人事から退職日と精算内容の説明を受け、引継ぎを終えた。退職後の収入は契約で確認できた分だけを家計に見込むことにした。", { job: 0, fl: { retired: 1 }, lifeAffiliation: { id: "rhine-lab", action: "leave", note: "本人の判断で退職" }, lifeGoal: { id: "rhine-research", action: "abandon", note: "研究所を退職した" }, p: 1 }],
      ["勤務を続け、負担を軽くする条件を相談する", "勤務時間と担当の見直しを申し出た。継続の可否は医療面の確認と職場の合意を待つことになった。", { h: 1, p: 1 }]
    ], { ge: { age: 45 }, extraShow: s => s.age >= 50 || s.h <= 35 }),
    rhineFormerChoice("sr_rhine_legacy_textbook_citation", "書店で手に取った技術書に、研究所時代の共同研究が参考文献として載っていた。自分の名前は共著者の一人として記されている。", [
      ["記載を確かめ、当時の共著者へ知らせる", "掲載内容と著者表記を確認してから、当時の共同研究者へ知らせた。過去の仕事が資料に残っていることを静かに喜んだ。", { k: 1, p: 1 }],
      ["本を買い、研究ノートと並べて保管する", "本を持ち帰り、関連するノートの横へ置いた。何年も前の測定の手触りを思い出した。", { k: 1 }]
    ], { ge: { age: 32 } }),
    rhineFormerChoice("sr_rhine_legacy_former_intern_becomes_chief", "工科大学の公開講演で、若い研究者が実験の失敗記録を残す大切さを話していた。質疑のあと、研究所時代に同じ部署で働いたことがあると挨拶を受けた。", [
      ["当時の記録の取り方を一緒に振り返る", "互いに覚えている範囲を話し、古い記録の保管先を伝えた。今の役職や成果については、本人の話した範囲で聞いた。", { rl: 1, k: 1 }],
      ["講演の感想を伝え、連絡方法を交換する", "研究の話を少し交わし、連絡先を交換した。次に会う約束は決めず、講演会場を後にした。", { rl: 1 }]
    ], { ge: { age: 35 } }),
    rhineFormerChoice("sr_rhine_legacy_trimounts_sky_gazing", "晴れた日の午後、空を見上げると高い雲がゆっくり流れていた。かつて研究所で観測記録を追っていた時間を思い出し、今の仕事へ戻る前に少し立ち止まった。", [
      ["当時の記録を読み返し、変わったことを書き留める", "手元に残した記録を開き、当時の仮説と今分かることを分けてメモした。空の向こうについて、まだ知らないことは多い。", { k: 1, p: 1 }],
      ["空を眺めたあと、今日の用事へ戻る", "しばらく風に当たり、日が傾く前に帰路へ戻った。記憶は胸に残ったが、答えは出さなかった。", { p: 1 }]
    ], { ge: { age: 30, year: 1100 }, after: { id: "sr_rhine_lone_trail_sky_horizon", min: 1 } }),
    rhineFormerChoice("sr_rhine_legacy_expert_witness_court", "鉱山排水の記録をめぐる照会が届き、以前の測定方法について説明できるか尋ねられた。現地の被害や訴訟の結論は、依頼文からは分からない。", [
      ["記録の範囲と限界を説明し、証言依頼を受ける", "確認できる資料と測定条件を整理し、専門家として説明できる範囲を伝えた。被害認定や裁判の判断は関係機関に委ねた。", { k: 1, p: 1 }],
      ["利益相反や資料の不足を伝え、今回は辞退する", "記録の限界と利害関係を先に伝え、必要なら別の専門家を探すよう依頼者へ返答した。", { k: 1 }]
    ], { ge: { age: 33 } }),
    rhineFormerChoice("sr_rhine_legacy_royalty_dividend_arrival", "知財管理部から、以前の共同研究に関する著者記録を確認したいと連絡があった。ライセンス収入の分配があるかは契約書を見なければ分からない。", [
      ["契約書と分配条件を照合し、確認できた内容だけ返す", "過去の契約と共同研究者の記録を照らし合わせた。追加支払いがあるかは、法務の回答を待つことになった。", { k: 1 }],
      ["担当窓口へ確認を任せ、記録の所在を伝える", "保存していた書類の所在を伝え、内容の確認は知財担当へ任せた。通知があるまでは収入を見込まないことにした。", { p: 1 }]
    ], { ge: { age: 35 }, show: s => s.lifeRecord?.skills?.["rhine-academic"]?.level >= 1 }),
    rhineFormerChoice("sr_rhine_legacy_memoir_of_trimounts", "研究所時代の記録を整理していると、測定結果と会議のメモが別々の箱から見つかった。後から読む人が誤解しないよう、当時の事実と記憶を分けて残すことにした。", [
      ["公開できる資料だけを選び、短い回想をまとめる", "個人情報と機密資料を除き、確認できる出来事と自分の受け止めを分けて書いた。公開前に関係者へ確認することにした。", { k: 1, p: 1 }],
      ["回想は出さず、資料の整理と保管にとどめる", "未整理の資料を分類し、保存条件を記した。世に出す文章は作らず、必要な人が確認できるようにした。", { k: 1 }]
    ], { ge: { age: 40 } }),
    rhineFormerChoice("sr_rhine_legacy_donate_lab_notes_to_students", "地域の工科学校から、古い研究ノートを教材として使えないか相談があった。ノートには未公開の情報や他人の名前が残っているかもしれない。", [
      ["権利と個人情報を確かめ、公開できる部分を寄贈する", "機密や個人情報がないか確認し、公開できる資料だけを選んで寄贈した。余白の失敗記録も、学ぶ材料になればと願った。", { k: 1, rl: 1 }],
      ["寄贈は保留し、資料の目録を作る", "資料の扱いを急がず、目録を作って保管した。寄贈するなら関係者への確認を先に行うことにした。", { k: 1 }]
    ], { ge: { age: 45 } })
  ];

  function rhineFormerChoice(id, text, choices, extra = {}) {
    const { show: customShow, ...metadata } = extra;
    return {
      id, conf: "S", references: ["SRC_RHINE_LAB"], st: routeStages,
      cd: 7, w: 0.2, once: true, ...metadata,
      show: s => ![38, 39, 40].includes(s.job) &&
        (s.lifeRecord?.affiliations?.some(a => a.id === "rhine-lab" && a.status === "left") ||
          (s.lifeRecord?.skills?.["rhine-academic"]?.level || 0) >= 1) &&
        (!customShow || customShow(s)),
      t: text,
      c: choices.map(([label, outcome, effect]) => $terraData.K(label, {}, [1, outcome, effect]))
    };
  }

  $terraData.EV.push(...events, ...additionalEvents);
});
