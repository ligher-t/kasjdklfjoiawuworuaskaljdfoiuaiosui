// base/confinement-and-education: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("base/confinement-and-education", function ($terraData, $define, $rules) {
  "use strict";
  $terraData.EV.push(
    {
      id: "confined_care",
      conf: "S",
      st: ["少年", "青年", "壮年", "老年"],
      need: ["感染診断済"],
      any: ["収容中", "隔離中"],
      ban: ["治療中"],
      inConfinement: true,
      w: 1.4,
      cd: 1,
      t: "皮膚の下の結晶が疼き、夜中に目を覚ます日が増えた。外の街の診療所へは足を運べず、閉ざされた区画の中で順番が回ってくるのをじっと待っている。",
      c: [
        $terraData.K(
          "医療担当に診療を頼む",
          {},
          [
            0.55,
            "巡回の医療担当に患部を診てもらい、抑えの薬を出してもらう手はずがついた。先々の支払いの不安は消えないが、ひとまず次の診察日が決まった。",
            { fl: { tx: 1 }, p: 2 }
          ],
          [1, "今日は人数がいっぱいだと追い返され、次の診察日だけ告げられた。鈍い痛みを抱えたまま冷たい寝床へ戻った。", { h: -3, p: -4 }]
        ),
        $terraData.K(
          "支援窓口への連絡を頼む",
          {},
          [
            0.6,
            "外の支援団体へ窮状を知らせる手紙を託すことができた。返事を待つ列の中で、隣に並んでいた同病の人から薬を分けてもらうつてを教わった。",
            { rl: 4, k: 1 }
          ],
          [1, "手紙は検閲で撥ねられ、封を切られたまま手元へ突き返された。言葉を選び直し、次に外へ出せる機会を待つしかなかった。", { p: -4 }]
        ),
        $terraData.K("今日は申し出ず、休む", {}, [
          1,
          "列に並ぶ気力もなく、毛布にくるまって横になった。寝返りを打って結晶が布に擦れるたび、鋭い痛みで目が覚めた。",
          { h: -2, p: -2 }
        ])
      ]
    },
    {
      id: "confined_pet_care",
      conf: "S",
      st: ["少年", "青年", "壮年", "老年"],
      need: ["pet_companion"],
      any: ["収容中", "隔離中"],
      ban: ["pet_care_outsourced"],
      inConfinement: true,
      w: 0.8,
      cd: 4,
      t: "隔離された生活が長引き、ずっと家を空けたままになっている。部屋に残してきた生き物の水や餌を誰に頼むか、そして預けたあとの餌代をどう送り続けるかで頭がいっぱいだった。",
      c: [
        $terraData.K(
          "家族や近所の知人へ世話を頼む",
          { show: { any: ["親存命", "既婚", "子あり", "neighbor_contact", "neighbor_familiar"] } },
          [
            0.8,
            "頼み込んだ身内や隣人が、快く世話を引き受けてくれた。自分が戻れる日まで、少ない手元資金から餌代を送り続けることにした。",
            { fl: { pet_care_outsourced: 1 }, p: 2, rl: 2 }
          ],
          [
            1,
            "ようやく連絡はついたものの、向こうの暮らしも苦しく長くは預かれないと断られた。焦りを抑えながら別の預け先を探し直した。",
            { p: -3, rl: -2 }
          ]
        ),
        $terraData.K(
          "相談窓口を通じて預け先を探す",
          {},
          [
            0.6,
            "互助の相談所を通じて、一時的に預かってくれる家が見つかった。毎日の世話は任せられたが、餌代や敷材の費用は自分が払い続ける。",
            { fl: { pet_care_outsourced: 1 }, p: 1, k: 1 }
          ],
          [
            1,
            "すぐには引き受け手が見つからなかった。係の人に伝言を残し、自分が戻れないあいだだけでも水と餌を替えてくれる人必死で探した。",
            { p: -3 }
          ]
        ),
        $terraData.K("飼育を続けられる家へ譲る", {}, [
          1,
          "いつ出られるか分からない身では飼い切れないと諦め、かわいがってくれるよその家へ譲り渡した。餌代の工面はなくなったが、夜になるとあの小さな温もりが恋しくてたまらなかった。",
          { fl: { pet_companion: 0 }, p: -7, rl: -2 }
        ])
      ]
    },
    {
      id: "confinement_wait",
      conf: "S",
      st: ["少年", "青年", "壮年", "老年"],
      any: ["収容中", "隔離中"],
      inConfinement: true,
      cd: 2,
      w: 0.8,
      t: [
        {
          when: "収容中",
          t: [
            "朝の点呼が終わると、灰色の壁に背を預けて次の合図を待った。今日が何月何日なのか思い出すのに、ずいぶん時間がかかった。",
            "隣の寝床の住人と、外にいたころによく食べた料理の話をした。途中から二人とも言葉を失い、鉄扉の向こうを過ぎる見回りの足音だけを聞いていた。"
          ]
        },
        {
          t: [
            "区画の出入口で、外へ出る許可が下りた人たちの名が読み上げられた。自分の名は最後まで呼ばれず、無言で冷えきった洗濯物を取り込んだ。",
            "区画の壁に新しい通達が貼り出された。隣の人と文字を追い、明日の配給が配られる時刻だけを頭に刻んだ。"
          ]
        }
      ],
      fx: {}
    },
    {
      id: "confinement_letter",
      conf: "S",
      st: ["少年", "青年", "壮年", "老年"],
      any: ["収容中", "隔離中"],
      inConfinement: true,
      cd: 4,
      w: 0.6,
      t: [
        "外にいる人へ宛てて、今の居場所と無事だけを知らせる手紙を書いた。ほんとうは書きたいことが山ほどあったのに、検閲を通るよう短い文面に押し込めた。",
        "外からの手紙が配られる窓口の列に並んだ。今日も自分の名前は呼ばれず、空っぽの手のまま薄暗い部屋へ引き返した。"
      ],
      fx: { rl: 1, p: -1 }
    },
    {
      id: "confinement_learning",
      conf: "S",
      st: ["少年", "青年", "壮年", "老年"],
      any: ["収容中", "隔離中"],
      inConfinement: true,
      cd: 4,
      w: 0.5,
      t: [
        "同じ部屋で暮らす年長者から、これまで読めなかった難しい字を一つ教わった。翌日はお礼代わりに、自分が仕事で覚えた暗算のコツを教えた。",
        "包み紙の白い裏側に、これまで歩いたことのある町や通りの名を書き並べてみた。鉛筆を動かすうちに、忘れかけていた故郷の路地の匂いがふと蘇った。"
      ],
      fx: { k: 2, rl: 2 }
    },
    {
      id: "confinement_illness",
      conf: "S",
      st: ["少年", "青年", "壮年", "老年"],
      any: ["収容中", "隔離中"],
      inConfinement: true,
      cd: 3,
      w: 0.6,
      t: [
        "風通しの悪い部屋で、夜通し咳き込む人が増えた。なけなしの飲み水を少しずつ喉に湿らせ、濡らした手ぬぐいで熱い額を拭った。",
        "鉛のように体が重く、配給の列に立っているだけで眩暈がした。同室の人に点呼で呼ばれたら起こしてくれと頼み、毛布に潜り込んだ。"
      ],
      fx: { h: -3, p: -2 }
    },
    {
      id: "hid_exposed",
      conf: "S",
      st: ["少年", "青年", "壮年", "老年"],
      need: ["隠蔽"],
      w: 1.5,
      cd: 4,
      once: true,
      who: s => (s.age < $rules.parameters.value("life.adultStartAge") ? "parent" : "self"),
      t: [
        {
          when: "就労中",
          t: "作業中にめくれた袖口から、黒い結晶を誰かに見られたらしい。翌朝、現場の責任者に声を潜めて呼び止められた。誰が言いふらし、どこまで知られているのか見当もつかない。"
        },
        {
          t: "通りすがりに、近所の住人がこちらの袖口へじっと目を留めた。隠し続けてきた鉱石病を勘づかれたのか、ただの気のせいなのか分からないまま、心臓の音を聞きながら足早にその場を離れた。"
        }
      ],
      c: [
        $terraData.K(
          "父にだけ診断を伝える",
          {
            show: s =>
              s.inf &&
              s.fl?.dg &&
              $rules.relationships.closeInfoAvailable(s, "father") &&
              !$rules.relationships.closeInfoKnown(s, "father")
          },
          [
            0.45,
            "思い切って父に感染を打ち明けたが、父は何も言えないまま深く俯いた。頼れる当てはなく、診療所は自分の足で探すことになった。",
            $terraData.hidDisclosureOutcome("father", "heard-undecided")
          ],
          [
            0.7,
            "父はすぐには信じようとせず、何かの間違いではないかと検査結果を繰り返し見つめた。病院への付き添いを頼んでも、うなずいてはくれなかった。",
            $terraData.hidDisclosureOutcome("father", "questioned-diagnosis")
          ],
          [
            1,
            "診断を聞いた父の顔から血の気が引き、その日を境に露骨に目を合わさなくなった。もう家の中でも病をなかったことにはできなくなった。",
            $terraData.hidDisclosureOutcome("father", "withdrew")
          ]
        ),
        $terraData.K(
          "母にだけ診断を伝える",
          {
            show: s =>
              s.inf &&
              s.fl?.dg &&
              $rules.relationships.closeInfoAvailable(s, "mother") &&
              !$rules.relationships.closeInfoKnown(s, "mother")
          },
          [
            0.45,
            "思い切って母に感染を打ち明けたが、母は唇を震わせたまま言葉を失っていた。診療所は自分の足で探すしかなかった。",
            $terraData.hidDisclosureOutcome("mother", "heard-undecided")
          ],
          [
            0.7,
            "母は信じられないという顔で、検査の紙を何度も見返した。一緒に医者へ行ってほしいと頼んでも、返事は返ってこなかった。",
            $terraData.hidDisclosureOutcome("mother", "questioned-diagnosis")
          ],
          [
            1,
            "診断を聞いた母は怯えたように一歩退き、それきりよそよそしく距離を置くようになった。これまでのように隠し通すことはもうできなくなった。",
            $terraData.hidDisclosureOutcome("mother", "withdrew")
          ]
        ),
        $terraData.K(
          "同居する配偶者にだけ診断を伝える",
          {
            show: s =>
              s.inf &&
              s.fl?.dg &&
              $rules.relationships.closeInfoAvailable(s, "spouse") &&
              !$rules.relationships.closeInfoKnown(s, "spouse")
          },
          [
            0.45,
            "夜、同じ屋根の下で暮らす伴侶に感染を打ち明けた。相手はすぐには言葉を見つけられず、重苦しい沈黙が落ちた。診療先は自分で探すことになった。",
            $terraData.hidDisclosureOutcome("spouse", "heard-undecided")
          ],
          [
            0.7,
            "伴侶はにわかには信じられない様子で、本当に鉱石病なのかと何度も問い返した。通院の付き添いを頼んでも、曖昧に目を伏せるばかりだった。",
            $terraData.hidDisclosureOutcome("spouse", "questioned-diagnosis")
          ],
          [
            1,
            "打ち明けた途端、伴侶の表情が凍りつき、同じ部屋にいても距離を置かれるようになった。秘密は壊れ、ひとりきりで治療先を探すことになった。",
            $terraData.hidDisclosureOutcome("spouse", "withdrew")
          ]
        ),
        $terraData.K(
          "友人にだけ診断を伝える",
          {
            show: s =>
              s.inf &&
              s.fl?.dg &&
              $rules.relationships.closeInfoAvailable(s, "friend") &&
              !$rules.relationships.closeInfoKnown(s, "friend")
          },
          [
            0.45,
            "信頼していた友人にだけ感染を打ち明けた。友人はなんと声をかければよいか分からず、ただ黙り込んでいた。診療先は自分で探すことになった。",
            $terraData.hidDisclosureOutcome("friend", "heard-undecided")
          ],
          [
            0.7,
            "友人は何かの見間違いではないかと食い下がり、検査の結果を見せてくれと言った。一緒に診療所を探してほしいと頼んでも、生返事しか返ってこなかった。",
            $terraData.hidDisclosureOutcome("friend", "questioned-diagnosis")
          ],
          [
            1,
            "診断を打ち明けた日を境に、友人からの連絡はぱったりと途絶えた。頼れる人を失ったまま、自分で治療の手立てを探さなければならなくなった。",
            $terraData.hidDisclosureOutcome("friend", "withdrew")
          ]
        ),
        $terraData.K("雇用先へ診断を伝え、今の職を離れる", { show: { need: ["就労中"] } }, [
          1,
          "後ろ指をさされる前に監督へ感染を告げ、その日のうちに職場を去った。噂がどこまで広まったかは分からない。袖口を気にする息苦しさは消えたが、明日からの稼ぎも一緒に失った。",
          { job: 0, fl: { hid: 0, infection_work_disclosed: 1 }, p: -5, cr: -2 }
        ]),
        $terraData.K("今は何も言わず、暮らしを保つ", {}, [
          1,
          "探るような問いかけを曖昧な笑みでかわし、逃げるようにその場を離れた。どこまでバレているのか分からないまま、袖口を深く引き下げていつもの帰り道を歩いた。",
          { p: -6, fl: { hid: 1 } }
        ])
      ]
    },
    {
      id: "detain_life",
      conf: "S",
      st: ["少年", "青年", "壮年", "老年"],
      need: ["収容中"],
      w: 1.2,
      cd: 3,
      t: [
        {
          when: "custody_contact",
          t: "外の相談所へ自分が収容されている場所を知らせると、異議申立ての用紙が差し入れられた。だが、それをどの役人へ出せばいいのかは誰にも教えてもらえなかった。"
        },
        {
          t: "朝の点呼と冷めた配膳の順番だけはすっかり体に染みついた。いつここを出られるのかは誰にも知らされず、外の世界へ自分の居場所を伝えるつてを必死に探している。"
        }
      ],
      c: [
        $terraData.K("身の回りを整えて待つ", {}, [
          1,
          "手元の布切れを水でゆすぎ、硬い寝床の皺を伸ばした。壁の傷に爪を立てて今日の日付を一つ増やし、ただ体力を落とさないよう息を潜めた。",
          { p: 1, h: 1 }
        ]),
        $terraData.K(
          "外へ所在を伝える",
          { show: { ban: ["custody_contact"] } },
          [
            0.6,
            "見回りの隙を突いて外の相談所へ便りを託し、自分の居場所を知らせることができた。届いた短い励ましの紙片を何度も読み返し、胸の奥深くに隠し持った。",
            { rl: 4, p: 2, fl: { custody_contact: 1 } }
          ],
          [1, "託した手紙は受付で突き返された。宛先を書き直す紙すらすぐには手に入らず、次の面会日まで歯を食いしばって待つしかなかった。", { p: -4 }]
        ),
        $terraData.K(
          "審査のやり直しを求める",
          { show: { need: ["custody_contact"] } },
          [
            0.25,
            "再審査の末にようやく収容が解かれ、重い鉄扉の外へ出された。外の空気を深く吸い込み、今夜の寝床と明日からの食い扶持を探しに街へ歩き出した。",
            { fl: { detained: 0 }, p: 6, cr: 2 }
          ],
          [
            1,
            "再審査の申し立ては受理されたものの、いつ結果が出るとも知らされなかった。冷たい廊下を歩き、また元の薄暗い寝床へと戻った。",
            { p: -3 }
          ]
        ),
        $terraData.K(
          "脱走を図る",
          { show: { ban: ["健康不良"] } },
          [
            0.3,
            "荷運びの混乱に紛れて柵を抜け、収容施設から一目散に逃げ出した。自由な外の空気は吸えたが、それ以来、制服姿の巡回を見かけるたびに路地裏へ身を隠すようになった。",
            { p: 5, fl: { detained: 0, marked: 1 }
          }
          ],
          [1, "柵を越える寸前で見張りに取り押さえられ、棍棒で散々に打ち据えられて元の房へ引きずり戻された。", { h: -20, p: -15 }]
        )
      ]
    },
    {
      id: "seg_life",
      conf: "S",
      references: ["SRC_LEITHANIEN_INFECTION", "SRC_COLUMBIA_INSURANCE"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["隔離中"],
      w: 1.0,
      cd: 3,
      t: [
        {
          when: "seg_work",
          t: "隔離区画の中の雑用を終えて顔を上げると、柵の向こうの大通りに華やかな夕明かりが灯っていた。手にした賃金はわずかだが、数日分のパンと芋を買うにはどうにか足りる。"
        },
        {
          t: "隔離区画の壁に、溝さらえや荷運びの日雇い募集が貼り出された。外の仕事場へは出られない身のまま、この狭い区画の中で食い扶持と生き延びる道を探している。"
        }
      ],
      c: [
        $terraData.K(
          "区画内の仕事を引き受ける",
          { show: { ban: ["seg_work"] }, en: { ge: { age: 15 } }, why: "この仕事の募集年齢に達していない" },
          [
            1,
            "区画内の泥かきと荷運びを引き受けた。わずかな手間賃で当座の食料は買えるようになったが、柵の外の工場や市場へ通う道は閉ざされたままだった。",
            { p: 1, fl: { seg_work: 1 } }
          ]
        ),
        $terraData.K(
          "区画外へ移る許可を相談する",
          {},
          [
            0.25,
            "身元引受人と受け入れ先の証明がようやく揃い、隔離区画の門を出る許可が下りた。外の街で一から働き口を探し直すことになる。",
            { p: 5, rl: 2, fl: { segregated: 0 } }
          ],
          [1, "通行許可の話は窓口で門前払いされた。足りない保証人の条件だけを聞き取り、また次の機会を窺うことにした。", { p: -4, k: 1 }]
        ),
        $terraData.K(
          "近くの住民へ食料を運ぶ",
          {},
          [
            0.8,
            "足が悪くて配給所まで歩けない隣人の部屋へ、代わりに食料の袋を届けた。扉の隙間から何度も礼を言われ、次に配給が出る日も自分が運ぶと約束した。",
            { rl: 6, p: 3 }
          ],
          [
            1,
            "自分の手元の食料すら心許なく、どれほど分けてやれるか決めきれなかった。結局そのまま袋を持ち帰り、翌日もその部屋の前を通るたび足がすくんだ。",
            { rl: -4, p: -3 }
          ]
        )
      ]
    },
    {
      id: "veteran",
      conf: "S",
      st: ["壮年", "老年"],
      need: ["就労中"],
      any: ["職:傭兵・護衛", "職:軍務・兵站"],
      ge: { age: 45 },
      w: 0.5,
      cd: 10,
      t: "新しい遠征任務の召集が舞い込んだ。冷える日に強張る体とこれからの暮らしを思い、武器を置いて若手を教える役に回るか、まだ現場に出て日当を稼ぐか迷った。",
      c: [
        $terraData.K("今の軍務・護衛の仕事を離れる", {}, [
          1,
          "長年馴染んだ制服と武具を返納し、血なまぐさい現場から足を洗った。来月からの実入りは減るが、物音に怯えずに眠れる夜が久しぶりに戻ってきた。",
          { job: 0, p: 3, h: 2, cr: -2, fl: { retired: 1, higashi_service: 0 } }
        ]),
        $terraData.K("若手を教える仕事へ移る", {}, [
          1,
          "訓練場に立ち、まだ肩の細い新兵たちに生き残るための足運びと荷の扱いを叩き込んだ。前線の手当はなくなったが、泥の中で夜を明かす日はなくなった。",
          { job: 12, cr: 3, p: 4, h: 1, fl: { higashi_service: 0 } }
        ]),
        $terraData.K(
          "短期の任務を続ける",
          { show: { ban: ["健康不良"] } },
          [
            0.7,
            "老骨に鞭打って短期の護衛任務をやり遂げ、危険手当を受け取った。家に帰り着くと、軋む腰と古傷を湯で温めて泥のように眠った。",
            { h: -5, cash: 3e5 }
          ],
          [
            1,
            "行軍の途中で膝と腰が悲鳴を上げ、背嚢すら担げなくなった。半ばで隊から外され、これからどうやって食いつなぐか途方に暮れた。",
            { h: -20, p: -8 }
          ]
        )
      ]
    },
    {
      id:"education_return_path",conf:"S",references:["SRC_EDUCATION_ACCESS"],
      st:["児童","少年","青年","壮年"],cd:3,w:0.65,
      show:s=>s.age>=8 && !educationOccupied(s) &&
        !(educationHas(s,"upper") || s.educationPath?.equivalency?.includes("upper")),
      t:"途中で学び舎を離れたか、そもそも机を並べる機会がないまま歳月が過ぎた。今の読み書きの力と懐具合で、もう一度学べる場所がないか探してみた。",
      c:[
        $terraData.K("初等課程へ遅れて入学を申し込む",{
          show:s=>s.age<=14 && !educationHas(s,"primary"),
          en:s=>educationCanEnter(s,"primary").allowed,why:"学校の受入枠や入学費用を確保できない"
        },[1,"年下の子たちに混じる覚悟を決め、遅ればせながら初等学校への入学を申し込んだ。",
           {educationAction:"primary"}]),
        $terraData.K("中断した中等課程へ再入学を申し込む",{
          show:s=>s.age<=20 && ["lower","upper"].includes(s.educationPath?.stage) &&
            ["withdrawn","outside"].includes(s.educationPath.status),
          en:s=>educationCanEnter(s,s.educationPath.stage).allowed,
          why:"学校の受入枠や再入学の学費を確保できない"
        },[1,"かつて諦めた中等学校の門をもう一度叩いた。残りの学費を工面し、止まっていた学びをやり直すことにした。",
          {educationAction:"reenter-secondary"}]),
        $terraData.K("働きながら三年の基礎準備課程に進む",{
          show:s=>s.age>=16,
          en:s=>educationPaymentPlan(s,educationFunds(s,"preparatory")).allowed,why:"準備課程の費用を確保できない"
        },[1,"昼間の仕事と掛け持ちで、夜間や休日に学ぶ三年間の基礎準備課程へ入った。眠い目をこすりながら修了試験を目指す日々が始まった。",
           {educationAction:"start-preparatory"}]),
        $terraData.K("仕事・氏族や師弟のもとで学ぶ",{},
          [1,"学校の免状にはこだわらず、現場の親方や年長者の手元を見て実地の技術と知恵を身につけた。",
           {k:3,ep:3,p:2}])
      ]
    },
    {
      id: "education_paused_life",
      conf: "S",
      references: ["SRC_EDUCATION_ACCESS", "SRC_TERRA_LIFECOURSE"],
      st: ["児童", "少年", "青年"],
      cd: 1,
      w: 1.2,
      show: s => s.educationPath?.status === "paused",
      t: "家計の都合や暮らしの混乱から、学校の席を休学にしてしばらく経った。同年代の生徒たちが鞄を抱えて通りを行き交う姿を見送りながら、この休みをどう過ごして食いつなぐか考えた。",
      c: [
        $terraData.K("復学の学費を貯めるため、日雇いや配達の手伝いで小銭を稼ぐ", {}, [
          1,
          "早朝の市場や倉庫で小荷物の配達を手伝い、その日暮らしの日当を受け取った。泥に汚れた硬貨を数えながら、いつか机に戻れる日を胸に刻んだ。",
          { cash: 60000, h: -2, p: 1, k: 1 }
        ]),
        $terraData.K("学校へ戻るのは諦め、現場の親方に頼んで本格的な働き手になる", { show: s => s.age >= 15 }, [
          1,
          "休学届を取り下げて退学の手続きを取り、仕事場の門を叩いた。学業の未練を振り切った顔つきを親方は認め、見習いとして仲間に入れてくれた。",
          { job: 1, cash: 100000, educationAction: "withdraw", p: 1, k: 2, rl: 2 }
        ]),
        $terraData.K("古本をめくりながら自習を続け、学んだことを忘れないようにする", {}, [
          1,
          "仕事の合間に使い古した教科書を開き、薄暗いランプの下で計算と書き取りを繰り返した。学校へ通えない日々の中でも、文字を追う時間だけは心を落ち着かせてくれた。",
          { k: 3, ep: 4, p: 2 }
        ]),
        $terraData.K("家の家事や家族の看病に専念し、生活の足元を支える", {}, [
          1,
          "水汲みや食事の支度、家族の身の回りの世話を率先して引き受けた。疲れて帰ってきた家族が湯気の立つ茶を啜り、感謝の言葉をかけてくれた。",
          { rl: 4, p: 1, h: 1 }
        ])
      ]
    },
    {
      id:"education_school_classroom",conf:"S",references:["SRC_EDUCATION_ACCESS"],
      st:["児童","少年","青年"],cd:3,w:0.65,
      show:s=>educationLive(s)&&["primary","lower","upper"].includes(s.educationPath.stage),
      t:"放課後の教室で、黒板の脇に補習と共同課題の予定が書き出された。夕日が差し込むなか、同じ組の仲間と机を並べて片づけた。",
      c:[
        $terraData.K("残って苦手な内容を復習する",{},
          [1,"居残りで先生に質問し、つまずいていた箇所を教本で解き直した。家に帰ってからも、忘れないうちにノートへ書き写した。",{ep:4,k:2,p:1}]),
        $terraData.K("級友と手分けして課題を終える",{},
          [1,"仲間と得意な分野を持ち寄って課題を終えた。ノートを閉じたあとも、窓辺が暗くなるまで他愛ないおしゃべりが続いた。",{ep:2,rl:3}])
      ]
    },
    {
      id:"education_school_family_pressure",conf:"S",references:["SRC_EDUCATION_ACCESS"],
      st:["児童","少年","青年"],cd:4,w:0.45,
      show:s=>educationLive(s)&&["primary","lower","upper"].includes(s.educationPath.stage)&&
        (s.fl?.parent_unemployed || s.house?.debt>500000 ||
         [s.par?.fa,s.par?.mo].some(p=>p&&p.inf&&p.infectionKnown) ||
         siblingsOf(s).some(p=>p&&p.inf&&p.infKnown)),
      t:"家の台所事情が苦しくなり、学校へ通う時間と働きに出る時間の板挟みになった。家族の失業や治療費も重くのしかかり、このまま机に向かい続けられるか夜の食卓で話し合った。",
      c:[
        $terraData.K("学業を続けられる方法を家族と探す",{},
          [1,"日々の買い物を切り詰め、学校のある日は朝晩の家事を分担してどうにか通学を続けた。それでも家の苦しさは変わらなかった。",{rl:2,p:-2}]),
        $terraData.K("今は学校を離れ、家の仕事を手伝う",{},
          [1,"先生に退学を告げ、慣れ親しんだ教室に別れを告げた。今日からは家の暮らしを支えるために働くが、いつか戻れる日が来るかは分からなかった。",
           {educationAction:"leave-school",k:2,p:-4}])
      ]
    },
    {
      id:"education_school_prejudice",conf:"S",references:["SRC_EDUCATION_ACCESS"],
      st:["児童","少年","青年"],cd:5,w:0.3,
      show:s=>educationLive(s)&&["primary","lower","upper"].includes(s.educationPath.stage)&&
        (s.r?.n==="サルカズ"||
         (s.res?.n==="ヴィクトリア"&&s.culturalIdentity?.affiliation==="ターラー系")),
      t:"教室であなたの生まれや血筋を知った生徒が、露骨に顔をしかめて同じ教本に触れようとしなくなった。教壇の先生もその空気には気づいていた。",
      c:[
        $terraData.K("教員へ扱いの違いを伝える",{},
          [1,"放課後に先生へ訴え出た。先生はうなずいて聞いてくれたものの、翌日から教室の冷たい空気が急に変わるわけではなかった。",{rl:-2,p:-2}]),
        $terraData.K("その場を離れ、学び続ける",{},
          [1,"悔しさを奥歯で噛み殺し、ひとりで黙々と自分の課題だけを終わらせた。明日、自分の机がどこに追いやられているかは分からなかった。",{p:-3,ep:1}])
      ]
    },
    {
      id:"education_school_disclosure_review",conf:"S",references:["SRC_EDUCATION_ACCESS"],
      st:["児童","少年","青年","壮年","老年"],cd:3,w:0.55,
      show:s=>educationLive(s)&&!!s.inf&&!!s.fl?.dg&&!educationSchoolKnowsInfection(s),
      t:"鉱石病の診断を受けた。通院で休む日や体育・実習の配慮を頼むため、学校へ正直に病名を打ち明けるべきか迷った。",
      c:[
        $terraData.K("学校に診断結果を伝え、配慮を相談する",{},[
          1,"職員室で鉱石病の診断を打ち明け、通院日と授業の配慮を頭を下げて頼んだ。学校側がどう出るか不安を抱えながら通学を続けた。",
          {infectionAwarenessAction:{subject:"self",audience:"school",certainty:"confirmed",
            source:"self-disclosure",consent:"voluntary",recipientRef:"current-school"}}
        ]),
        $terraData.K("今は学校に伝えず、通学を続ける",{},[
          1,"病のことは誰にも伏せたまま、袖口を気にして教室へ通い続けた。",
          {p:-1}
        ])
      ]
    },
    {
      id:"education_transfer_review",st:["幼児","児童","少年","青年","壮年","老年"],conf:"S",references:["SRC_EDUCATION_ACCESS"],
      show:s=>s.educationDecision?.kind==="transfer"&&educationLive(s),
      pri:true,who:"self",
      t:"通っていた学び舎から、これ以上は席を置けないと通告された。同じ街に受け入れてくれる別の学校があるか探し、このまま学びを続けるかどうか決断を迫られた。",
      c:[
        $terraData.K("別の学び舎へ転学して履修を続ける",{
          en:s=>!!alternativeFacility(s,"school"),
          why:"同じ生活圏に受入れ可能な別の学び舎がない"
        },[1,"受け入れてくれる別の学び舎へ籍を移した。見知らぬ教室で一から机を並べ直し、途切れかけた学びを繋いだ。",
          {educationAction:"transfer-school"}]),
        $terraData.K("通学をやめ、別の学び方を考える",{},[
          1,"学校へ通い続けることを断念し、教本を鞄にしまった。これまで覚えた知識は頭に残るが、卒業の免状は手に入らないまま校門を出た。",
          {educationAction:"transfer-leave"}])
      ]
    },
    {
      id: "higher_ed",
      conf: "S",
      references: ["SRC_EDUCATION_ACCESS"],
      st: ["青年", "壮年"],
      show: s => s.educationDecision?.kind === "higher-path" || (
        (educationHas(s, "upper") || !!s.educationPath?.equivalency?.includes("upper")) &&
        !educationLive(s) && !s.study && s.age >= 18 && !s.educationDecision
      ),
      pri: true,
      w: 1,
      cd:1,
      t: [
        {
          when: s => s.educationDecision?.kind === "higher-path",
          t: "後期中等課程を修了し、ひとつの区切りを迎えた。このまま大学や高等専門校へ進んで学びを深めるか、それとも学校生活に区切りをつけて社会へ出て自立するか、食卓で家族と財布の中身を確かめながら話し合った。"
        },
        {
          t: "中等までの課程をすべて修めた。さらに上の大学や専門校へ進むなら、高い学費と厳しい選抜試験の壁が立ちはだかる。手元の蓄えと自分の力を測りながら進路を考えた。"
        }
      ],
      c: [
        $terraData.K("地域大学の募集先を探す",
          {en:s=>!educationActiveCase(s),
           why:"後期中等修了・入学資金・学校の受入要件が必要"},
          [1,"地域の大学へ進みたいと考え、実際に募集している課程と通学方法を調べ始めた。",
            {educationAction:"case:begin:higher-path:university:1"}]),
        $terraData.K("選抜大学の募集先を調べる",
          {en:s=>!educationActiveCase(s),
           why:"進学資格・受験費用・学校の受入要件が必要"},
          [1,"選抜の厳しい大学について、募集先と出願資格を調べた。試験を受けるかは、確かめた条件を見て決める。",
            {educationAction:"case:begin:higher-path:university:2"}]),
        $terraData.K("高度な大学課程の募集を調べる",
          {en:s=>!educationActiveCase(s),
           why:"進学資格・高額な学費・学校の受入要件が必要"},
          [1,"高度な大学課程への進学を望み、出願先と試験の条件を調べた。実際に受験できる場所はまだ決まっていない。",
            {educationAction:"case:begin:higher-path:university:3"}]),
        $terraData.K("技術専門課程の募集を調べる",
          {en:s=>!educationActiveCase(s),
           why:"中等課程修了か同等資格と実習・授業料が必要"},
          [1,"手仕事を学べる技術専門課程を探すことにした。実習設備と受入条件を調べ、通える学校を選ぼうと考えた。",
            {educationAction:"case:begin:higher-path:vocational:1"}]),
        $terraData.K("高度な技術専門課程を探す",
          {en:s=>!educationActiveCase(s),
           why:"中等課程修了か同等資格と実習・授業料が必要"},
          [1,"高度な実習を行う学校について、募集課程と受入条件を調べた。まだ試験の結果は出ていない。",
            {educationAction:"case:begin:higher-path:vocational:2"}]),
        $terraData.K("アーツ専門学院の募集を調べる",
          {en:s=>!educationActiveCase(s),
           why:"中等修了・学費・学校の受入要件が必要"},
          [1,"アーツの制御や器具を扱う学院で学びたいと考え、募集案内を探した。",
            {educationAction:"case:begin:higher-path:arts:1"}]),
        $terraData.K("高度なアーツ学院の募集を調べる",
          {en:s=>!educationActiveCase(s),
           why:"中等修了・相当の学費・学院の受入要件が必要"},
          [1,"高度なアーツ課程への進学を望み、実際の募集先と出願資格を確かめることにした。",
            {educationAction:"case:begin:higher-path:arts:3"}]),
        $terraData.K("進学はせず、働き口を探して自立する",
          { show: s => s.educationDecision?.kind === "higher-path" },
          [1,"学生生活にきっぱりと区切りをつけ、社会に出て働き口を探すことにした。これからは自分の手で暮らしを立てていく。",
            {educationAction:"case:decline:higher-path", p: 1}]),
        $terraData.K("今回は出願を見送り、学習や仕事を続ける",
          { show: s => s.educationDecision?.kind !== "higher-path" },
          [1,"願書を引き出しの奥へしまい、今年の受験は見送った。このまま働き続けるか、蓄えを作って来年挑むかはまだ決めなかった。",{p:1}])
      ]
    },
    {
      id:"education_upper_path",st:["幼児","児童","少年","青年","壮年","老年"],conf:"S",references:["SRC_EDUCATION_ACCESS"],
      show:s=>s.educationDecision?.kind==="upper-path",pri:true,who:"self",
      t:"前期中等課程を修了し、ひとつの区切りを迎えた。このまま上の学校へ進むか、それとも働きに出て暮らしを支えるか、食卓で家族と財布の中身を確かめながら話し合った。",
      c:[
        $terraData.K("高等学校相当の課程に進む",
          {en:s=>!educationActiveCase(s),
           why:"先に今年の進路案件を整理する必要がある"},
          [1,"上の課程で学びたいと家族に話した。どの学校で募集があるか、通い道と費用を一つずつ調べ始めた。",
           {educationAction:"case:begin:upper-path:upper:1"}]),
        $terraData.K("就職や家業の手伝いへ進む",{},
          [1,"家族と話し合い、今期の進学は見送り、仕事や見習いの口を探すことにした。",
           {educationAction:"case:decline:upper-path"}]),
        $terraData.K("今は進学を見送り、学び直しの道を残す",{},
          [1,"今期の進学は見送り、余裕ができれば学び直す道を残すことにした。",
           {educationAction:"case:decline:upper-path"}])
      ]
    },
    {
      id:"education_funding_review",st:["幼児","児童","少年","青年","壮年","老年"],conf:"S",references:["SRC_EDUCATION_ACCESS","SRC_EDUCATION_CREDIT_MODEL"],
      show:s=>["funding","resume"].includes(s.educationDecision?.kind),
      pri:true,who:"self",
      t:"次の期の学費納付書が届き、家族と頭を突き合わせて蓄えを数えた。このまま通い続けられるか、いったん休学して働くか、苦しい選択を迫られた。",
      c:[
        $terraData.K("制度のある学校に休学を願い出る",
          {show:s=>EDUCATION_INSTITUTIONAL_REGIONS.includes(s.res?.n) &&
            s.educationDecision?.kind==="funding"},
          [1,"窓口に休学届を出し、しばらく教室を離れることにした。決められた年数のうちに学費を作れなければ、そのまま除籍になる。",{educationAction:"funding-pause"}]),
        $terraData.K("資金を確保し復学する",
          {show:s=>s.educationPath?.status==="paused",
           why:"復学先の受入条件か今年度の費用を満たせない",en:s=>{const fee=educationFunds(s,s.educationPath.stage,s.educationPath.tier);
             return educationBarrier(s,s.educationPath.stage,s.educationPath.tier).allowed && educationPaymentPlan(s,fee).allowed;}},
          [1,"ようやく掻き集めた学費を窓口へ納め、懐かしい教室へと戻った。",{educationAction:"funding-resume"}]),
        $terraData.K("今年も休学を続ける",
          {show:s=>s.educationPath?.status==="paused"},
          [1,"まだ学費が足らず、今年も休学を延ばす届けを出した。籍を残しておける期限がじりじりと迫っていた。",{educationAction:"funding-defer"}]),
        $terraData.K("成人向け学費貸付を申し込み、返済条件に同意する",{
          show:s=>s.educationDecision?.kind==="funding"&&s.age>=18&&s.res?.n==="クルビア",
          en:s=>{const m=s.educationPath,fee=m?educationFunds(s,m.stage,m.tier):0,plan=educationPaymentPlan(s,fee);
            return !!m&&m.status==="enrolled"&&plan.personal+plan.household<fee;},
          why:"クルビアの成人学生向け貸付対象か、当期の学費不足を確認できない"
        },[
          1,"学生ローンの窓口で利息と返済期限が並ぶ契約書に署名し、借り入れた金で今期の学費を納めた。卒業後に背負う重みを思うと背筋が冷えた。",
          {educationAction:"funding-loan"}
        ]),
        $terraData.K("学費の減免・支援を申請する",{
          show:s=>s.educationDecision?.kind==="funding"&&
            EDUCATION_INSTITUTIONAL_REGIONS.includes(s.res?.n),
          en:s=>!!s.educationPath&&
            !educationPaymentPlan(s,educationFunds(s,s.educationPath.stage,s.educationPath.tier)).allowed,
          why:"今期の学費の不足がないため、減免の対象にならない"
        },[
          0.32,"苦しい家計が認められ、学校から一時的な学費減免が下りた。手元の蓄えをはたいて残りを納め、どうにか机を失わずに済んだ。",
          {educationAction:"funding-grant"}
        ],[
          1,"減免の枠からは漏れ、申請は通らなかった。籍だけでも残すため、涙をのんでいったん休学を申し出た。",
          {educationAction:"funding-pause"}
        ]),
        $terraData.K("退学して働き方を考える",{},
          [1,"どうしても学費の当てがつかず、退学届を出して学校を去った。これまで学んだことは胸に残るが、卒業証書は手に入らない。",
            {educationAction:"funding-leave"}])
      ]
    },
    {
      id:"education_graduation_review",st:["幼児","児童","少年","青年","壮年","老年"],conf:"S",references:["SRC_EDUCATION_ACCESS"],
      show:s=>s.educationDecision?.kind==="graduation",
      pri:true,who:"self",
      t:"卒業に必要な単位と実技の評価がわずかに足りなかった。先生を前にして、もう一年残って学び直すか、このまま学校を去るか問われた。",
      c:[
        $terraData.K("不足分を補うため留年する",
          {why:"留年できる追加年度の上限に達している",en:s=>s.educationPath &&
            s.educationPath.duration-
              (s.educationPath.stage==="university" && s.educationPath.tier===1
                ? 3 : EDUCATION_PROGRAMS[s.educationPath.stage].years)<2},
          [1,"卒業証書を諦めきれず、もう一年教室に残って不足した科目をやり直すことにした。",
            {educationAction:"repeat"}]),
        $terraData.K("修了せず、退学する",{},
          [1,"これ以上は残れないと見切りをつけ、卒業目前で学校を離れた。身についた知識だけを頼りに外の世界へ出る。",
            {educationAction:"withdraw"}])
      ]
    },
    {
      id: "uni_fee",
      conf: "S",
      show: s => false, // replaced by mandatory annual education lifecycle
      references: ["SRC_EDUCATION_ACCESS"],
      st: ["青年", "壮年"],
      need: ["uni_enrolled", "学費期"],
      ban: ["修了年度"],
      who: "self",
      cd: 1,
      t: "新年度の登録が始まり、学費の納付期限が迫ってきた。講義へ出る時間と日雇いで働く日数をどうやりくりするか頭を悩ませた。",
      c: [
        $terraData.K(
          "貯金から学費を払う",
          { en: { ge: { cash: 200000 } }, why: "学費を払う現金が足りない" },
          [
            1,
            "参考書を何冊か諦め、貯金をはたいて学費を納めた。働く日数を減らした分、日々の食事をいっそう切り詰めた。",
            { cash: -200000, ep: 7, k: 3, p: -2, fl: { uni_enrolled: 1 }, study: "uni_advance" }
          ]
        ),
        $terraData.K("借りて在籍を続ける", {}, [
          1,
          "借用書に名を書き、借りた金でどうにか学費を納めた。教室には戻れたが、膨らんだ返済額が重くのしかかった。",
          { debt: 200000, ep: 7, k: 3, p: -5, fl: { uni_enrolled: 1 }, study: "uni_advance" }
        ]),
        $terraData.K("課程を離れ、働き方を考え直す", {}, [
          1,
          "納付を諦め、大学を去る届けを出した。入学金は戻らず卒業証書も手に入らないまま、これまで学んだ知識で食いつなげる仕事を探し始めた。",
          { p: -5, fl: { uni_enrolled: 0 }, study: "uni_stop" }
        ])
      ]
    },
    {
      id: "uni_final_fee",
      conf: "S",
      show: s => false, // replaced by mandatory annual education lifecycle
      references: ["SRC_EDUCATION_ACCESS"],
      st: ["青年", "壮年"],
      need: ["uni_enrolled", "学費期", "修了年度"],
      who: "self",
      cd: 1,
      t: "最終年度の学費と部屋代の支払いが同じ月に重なった。卒業証書を手にするには、この最後の支払いだけはなんとしても乗り切らなければならない。",
      c: [
        $terraData.K(
          "払って修了を目指す",
          { en: { ge: { cash: 200000 } }, why: "最終年度の学費を払う現金が足りない" },
          [
            1,
            "財布の底をはたいて最後の学費を納めきった。仕事と卒業課題に追われて眠れない日々を抜け、ついに修了証書を手にした。",
            { cash: -200000, ep: 10, k: 5, fl: { uni_enrolled: 0, uni: 1 }, study: "uni_finish" }
          ]
        ),
        $terraData.K("借りて最後まで通う", {}, [
          1,
          "頭を下げて最後の学費を借り入れ、教室に踏みとどまった。背負う借金は増えたが、最後までやり抜いて修了証書を受け取った。",
          { debt: 200000, ep: 10, k: 5, fl: { uni_enrolled: 0, uni: 1 }, study: "uni_finish" }
        ]),
        $terraData.K("修了前に課程を離れる", {}, [
          1,
          "最後の学費がどうしても工面できず、卒業目前で大学を離れた。免状は手に入らないまま、明日の暮らしを立てるため求人板の前へ立った。",
          { p: -8, fl: { uni_enrolled: 0 }, study: "uni_stop" }
        ])
      ]
    },
    {
      id: "voc_fee",
      conf: "S",
      show: s => false, // replaced by mandatory annual education lifecycle
      references: ["SRC_EDUCATION_ACCESS"],
      st: ["青年", "壮年"],
      need: ["voc_enrolled", "学費期"],
      ban: ["修了年度"],
      who: "self",
      cd: 1,
      t: "専門課程の次年度登録が近づいてきた。授業料と日々の食い扶持に加え、実習の日に仕事を休めるかどうかが悩みの種だった。",
      c: [
        $terraData.K("授業料を払う", { en: { ge: { cash: 120000 } }, why: "授業料を払う現金が足りない" }, [
          1,
          "授業料を納めて実習場へ戻った。稼ぎを減らさないよう、休日も油まみれになって課題を仕上げた。",
          { cash: -120000, ep: 6, k: 2, p: -1, fl: { voc_enrolled: 1 }, study: "voc_advance" }
        ]),
        $terraData.K("借りて続ける", {}, [
          1,
          "工具の買い足しも重なり、金を借りて授業料を納めた。少しでも早く元が取れるよう、実習場へ通う日を増やして腕を磨いた。",
          { debt: 120000, ep: 6, k: 2, p: -4, fl: { voc_enrolled: 1 }, study: "voc_advance" }
        ]),
        $terraData.K("課程を離れ、働き方を立て直す", {}, [
          1,
          "実習先と学校に退学を告げた。途中まで覚えた手仕事を活かせる働き口を探し、まずは暮らしを立て直すことにした。",
          { p: -4, fl: { voc_enrolled: 0, arts_enrolled: 0 }, study: "voc_stop" }
        ])
      ]
    },
    {
      id: "voc_final_fee",
      conf: "S",
      show: s => false, // replaced by mandatory annual education lifecycle
      references: ["SRC_EDUCATION_ACCESS"],
      st: ["青年", "壮年"],
      need: ["voc_enrolled", "学費期", "修了年度"],
      who: "self",
      cd: 1,
      t: "卒業前の実技試験が目前に迫った。最後の授業料を納め、試験当日に仕事を休めるよう段取りをつけなければならない。",
      c: [
        $terraData.K(
          "納付して修了試験を受ける",
          { en: { ge: { cash: 120000 } }, why: "最終の授業料を払う現金が足りない" },
          [
            1,
            "最後の授業料を納めて実技試験に挑んだ。張り詰めた空気のなかで課題をやり遂げ、職業課程の修了を認められた。",
            { cash: -120000, ep: 8, k: 3, fl: { voc_enrolled: 0, voc: 1 }, study: "voc_finish" }
          ]
        ),
        $terraData.K("借りて試験を受ける", {}, [
          1,
          "最後の授業料を借り入れて試験場に立った。返済の重みは残ったが、実技を通過してついに修了証を手にした。",
          { debt: 120000, ep: 8, k: 3, fl: { voc_enrolled: 0, voc: 1 }, study: "voc_finish" }
        ]),
        $terraData.K("修了前に課程を離れ、次の仕事を探す", {}, [
          1,
          "最後の納付を諦め、試験を受ける前に学校を去った。修了証書はないが、この手が覚えた技術だけを頼りに次の働き口を探し始めた。",
          { p: -6, fl: { voc_enrolled: 0, arts_enrolled: 0 }, study: "voc_stop" }
        ])
      ]
    },
    {
      id: "study_to_work",
      conf: "S",
      references: ["SRC_EDUCATION_ACCESS"],
      st: ["青年", "壮年"],
      any: ["uni", "voc"],
      ge: { age: 20 },
      once: true,
      w: 0.7,
      t: [
        {
          when: "職業課程在籍",
          t: "実習で扱ったのと同じ機械を使う工房の求人が出た。なけなしの交通費と経歴書を懐に入れ、どの工房から門を叩くか考えた。"
        },
        {
          t: "街の掲示板に技術部門と研究補助の求人が貼り出された。修めた資格の欄を埋め、限られた足代でどこから回るか順序を決めた。"
        }
      ],
      c: [
        $terraData.K(
          "技術職の採用試験を受ける",
          { show: { need: ["uni"], ge: { literacy: 35 } } },
          [
            0.65,
            "筆記と面接をくぐり抜け、技術部門の補助として働き始めた。教本で覚えた数式より、現場の油と熱の中で確かめることの方がずっと多かった。",
            { job: 7, cr: 3, p: 4 }
          ],
          [
            1,
            "筆記試験は通ったものの、面接で落とされた。修了証を鞄の奥へしまい直し、また別の募集を探して歩き出した。",
            { p: -3 }
          ]
        ),
        $terraData.K(
          "診療・研究機関の補助職へ応募する",
          { show: { need: ["uni"], ge: { literacy: 40 } } },
          [
            0.55,
            "消毒液の匂う施設で、検査記録の整理と器具の支度を任された。病棟と研究室のどちらへ届ける品か、最初のうちは何度も指差しで確かめた。",
            { job: 20, cr: 2, p: 3 }
          ],
          [
            1,
            "紹介状を握りしめて訪ねたが、募集枠は昨日のうちに埋まっていた。帰りの運賃だけを失い、夕暮れの街で別の求人を探した。",
            { cash: -2e4, p: -2 }
          ]
        ),
        $terraData.K(
          "修理・医療補助・職人仕事の募集を訪ねる",
          { show: { need: ["voc"] } },
          [
            0.72,
            "作業台の前で実技を見定められ、修理と整備の仕事を任された。無口な先輩職人の手元を目で追いながら、現場ならではの道具の呼び名を覚え直した。",
            { job: 18, cr: 2, p: 3 }
          ],
          [
            1,
            "実技の腕は認められたが、今は空きがないと言われ日雇いの手伝いだけを請けた。次の本採用の口がないか耳をそばだてながら働いた。",
            { p: -2 }
          ]
        ),
        $terraData.K("募集を見送り、次の機会に備える", {}, [
          1,
          "条件が折り合わず、今回の応募は見送った。いつでも動けるよう道具と身支度を整えながら、古い教本を開いて手順をさらった。",
          { p: 2, rl: 2 }
        ])
      ]
    },
    {
      id: "arts_academy_completion",
      conf: "S",
      references: ["SRC_EDUCATION_ACCESS"],
      st: ["青年", "壮年"],
      need: ["arts_enrolled", "voc"],
      ban: ["arts_grad"],
      ge: { age: 18 },
      once: true,
      who: "self",
      w: 0.8,
      t: "アーツ学院の課程を修め、門を出る日が来た。身につけた制御技術を活かして食っていける場所がないか、求人板の貼り紙を見比べた。",
      c: [
        $terraData.K(
          "アーツ器具の整備職へ応募する",
          { show: { ge: { literacy: 40 } } },
          [
            0.55,
            "実技と面接を通過し、アーツユニットの点検と整備を任された。学院の綺麗な実験室とは勝手が違う現場で、油にまみれながら調整の勘所を掴んでいった。",
            { job: 11, fl: { arts_grad: 1, arts_enrolled: 0 }, cr: 3, p: 2 }
          ],
          [
            1,
            "実技試験まで進んだが、経験者には及ばず不採用となった。修了証を懐にしまい、自分の術を活かせる別の働き口を探した。",
            { fl: { arts_grad: 1, arts_enrolled: 0 }, p: -2 }
          ]
        ),
        $terraData.K("修了証を携え、習った技術を使える募集を探す", {}, [
          1,
          "真新しい修了証を懐に携え、アーツの心得を求める工房や商会の募集を一つずつ回り始めた。",
          { fl: { arts_grad: 1, arts_enrolled: 0 }, p: 1 }
        ])
      ]
    },
    {
      id: "teacher_path",
      conf: "S",
      st: ["青年", "壮年"],
      // This particular learning centre reviews education or actual teaching experience.
      // A score-only "高等以上" tag is not a graduation certificate.
      show: s => careerOpeningAssessment(s, { role: "teacher" }).canApply,
      ban: ["teacher_attempted", "職:教師"],
      ge: { age: 20, access: 0.45 },
      w: 0.4,
      once: true,
      who: "self",
      t: "地域の学び舎に、読み書きを教える講師の募集が出ていた。顔見知りの紹介者から「一度教室を見学して、短い模擬授業をやってみないか」と誘われ、教本代と往復の足代を工面できるか考えた。",
      c: [
        $terraData.K(
          "教材と交通費を用意し、模擬授業に臨む",
          {
            show: { ge: { literacy: 40 } },
            en: { affordableCash: 5e4 },
            why: "教材や交通費に5万龍門幣を用意できない"
          },
          [
            0.55,
            "借りた教本を手に教壇へ立った。途中で言葉に詰まりながらも、身近な買い物の例えに変えて説明し直すと、子どもたちの目が輝いた。帰り際、来週からの授業を正式に任された。",
            { cash: -5e4, pm: 1, job: 12, k: 5, cr: 3, fl: { teacher_attempted: 1 } }
          ],
          [
            1,
            "緊張で喉を詰まらせながら模擬授業を終えたが、後日届いたのは不採用の知らせだった。足代と教本代だけが消え、夜更けに借りた本を返しに行った。",
            { cash: -5e4, pm: 1, p: -3, fl: { teacher_attempted: 1 } }
          ]
        ),
        $terraData.K("教員には応募せず、無償の読み聞かせを手伝う", {}, [
          1,
          "正式な講師の口は見送り、休みの日に近所の子どもたちを集めて本を読んでやった。「もう一回読んで」と袖を引く小さな手の感触が心に残った。",
          { rl: 3, p: 2, fl: { teacher_attempted: 1 } }
        ]),
        $terraData.K("今回は見送る", {}, [
          1,
          "今の暮らしのペースを崩せそうになく、今回の話は丁重に断った。チョークの匂いが残る学び舎を後にし、いつもの仕事へ戻った。",
          { p: 1, fl: { teacher_attempted: 1 } }
        ])
      ]
    },
    {
      id: "artist_path",
      conf: "S",
      st: ["青年", "壮年"],
      ban: ["職:芸術家"],
      ge: { age: 18 },
      any: ["国:リターニア", "国:ミノス", "国:ヴィクトリア"],
      w: 0.4,
      cd: 15,
      t: "あなたが作りためた作品を見た知人が、「今度開かれる町の展示会に出してみないか」と目を輝かせた。ただ、場所代と材料費を払えば今月の食費にも食い込みそうだった。",
      c: [
        $terraData.K(
          "出品料と材料費を払い、制作一本で暮らす道へ進む",
          { en: { affordableCash: 2e5 }, why: "出品料・材料費の20万龍門幣を地域物価込みで用意できない" },
          [
            0.35,
            "展示会の隅に並べた作品が旅の蒐集家の目に留まって売れ、次の催しにも声がかかった。明日の保証もない不安定な身だが、表現で食っていく道へ踏み出した。",
            { cash: -2e5, pm: 1, job: 13, cr: 4, p: 6 }
          ],
          [
            1,
            "会期が終わるまで足を運んだが、作品は一つも売れず場所代と材料費だけが消えた。これ一本では到底暮らせないと悟り、日銭を稼ぐ仕事を探し始めた。",
            { cash: -2e5, pm: 1, job: 0, p: -5 }
          ]
        ),
        $terraData.K(
          "仕事は続け、趣味の時間を守る",
          { show: { any: ["hobby_music", "hobby_craft", "hobby_garden"] } },
          [
            1,
            "昼間の仕事は手放さず、休日の窓辺で制作を続ける道を選んだ。展示会には出さなかったが、いつでも手を動かせるよう道具は机の上に並べておいた。",
            { p: 3 }
          ]
        ),
        $terraData.K("今回は出品せず、今の暮らしを続ける", {}, [
          1,
          "知人の誘いに礼を言って断り、日々の仕事と家の用事を優先した。作りかけの作品に布をかけ、余裕のある週末にまた続きを作ることにした。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "elder_community",
      conf: "S",
      references: ["SRC_ELDER_COMMUNITY"],
      st: ["老年"],
      ge: { age: 65 },
      w: 0.5,
      once: true,
      t: [
        {
          when: "就労中",
          t: "仕事帰りの夕暮れ、近所の若者に古い道具の手入れの仕方を尋ねられた。提げていた買い物袋を足元に置き、どこから教えてやろうかと考えた。"
        },
        {
          when: "孤立",
          t: "久しく誰も訪ねてこなかった戸口が叩かれ、隣の部屋の若者が遠慮がちに顔を出した。何か困りごとがあるらしく、扉に手をかけたまま話を聞くことにした。"
        },
        {
          t: "近所の若者が、この町が昔どんな様子だったか聞かせてほしいと訪ねてきた。お茶を淹れながら、遠い記憶の糸をどこから手繰ろうかと考えた。"
        }
      ],
      c: [
        $terraData.K("覚えていることを話し、相手の問いに答える", {}, [
          1,
          "昔の通りの姿や今は亡き人たちのことをぽつりぽつりと語り、若者の問いに答えた。久しぶりに誰かと長く話し込み、温かな気持ちで背中を見送った。",
          { rl: 4, k: 1, p: 2 }
        ]),
        $terraData.K("手の届く範囲で、短い手伝いをする", { show: { ban: ["健康不良"] } }, [
          1,
          "年寄りの知恵で片づく用事を一つだけ手伝ってやり、礼を言われて自分の部屋へ戻った。",
          { rl: 3, cr: 1, p: 2 }
        ]),
        $terraData.K("今は休息を優先すると伝える", {}, [
          1,
          "今日は少し体が重いと詫びて戸を閉めた。静かな部屋で白湯を沸かし、冷えた指先を温めながらゆっくりとすすった。",
          { p: 2 }
        ])
      ]
    },
    {
      id: "yakuza_collect",
      conf: "S",
      references: ["SRC_CRIME_REGIONAL", "SRC_DEBT_COLLECTION_MODEL"],
      st: ["青年", "壮年", "老年"],
      show: s => s.res?.n === "龍門" && loanContract(s,"lungmen-private-credit")?.status === "overdue",
      w: 2.0,
      cd: 3,
      t: "龍門の裏通りを仕切る金融業者が、手下を連れて戸口に立ちはだかった。返済の期限はすでに過ぎている。突きつけられた借用書の数字を前に、今どう出るか迫られた。",
      c: [
        $terraData.K("契約書の一部返済額を払う", {
          show: s => loanContractBalance(s,"lungmen-private-credit") > loanContract(s,"lungmen-private-credit").installment,
          en: s => loanContractPaymentAffordable(s,"lungmen-private-credit","installment"),
          why: "一部返済分の現金が手元にない"
        }, [
          0.8, "震える手で一回分の返済金を渡した。取立人は札束を数えて懐に収め、残りの額を冷たく告げて引き揚げた。",
          { loanPayment:{contractId:"lungmen-private-credit",amount:"installment"}, p:-3 }
        ], [
          1, "金を渡した直後、取立人は「遅延の手数料だ」と証文にない同額をふっかけてきた。食い下がった瞬間、手下の男たちに容赦なく殴り倒された。",
          { loanPayment:{contractId:"lungmen-private-credit",amount:"installment"},
            loanCharge:{contractId:"lungmen-private-credit",amount:"installment",reason:"契約書にない追加請求",disputed:true},
            p:-8,fl:{trauma_crime:1} }
        ]),
        $terraData.K("残額が一部返済額以下なら全額を払う", {
          show: s => loanContractBalance(s,"lungmen-private-credit") > 0 &&
            loanContractBalance(s,"lungmen-private-credit") <= loanContract(s,"lungmen-private-credit").installment,
          en: s => loanContractPaymentAffordable(s,"lungmen-private-credit","balance"),
          why: "残額を払い切るだけの現金が手元にない"
        }, [
          1, "残っていた借金をその場で全額叩きつけた。取立人は借用書に完済の印を押し、ようやく戸口から消えた。",
          { loanPayment:{contractId:"lungmen-private-credit",amount:"balance"},p:-1 }
        ]),
        $terraData.K("今回は払わない", {}, [1,"「今は払えない」と突っぱねた。取立人は不気味な笑みを残し、延滞の印をつけて立ち去った。",{p:-2}]),
        $terraData.K("逃げる", {}, [
          0.5,"隙を突いて裏口から飛び出し、入り組んだ路地を抜けて追っ手を振り切った。息は上がったが、借金そのものが消えたわけではない。",{p:-5,fl:{trauma_crime:1}}
        ], [1,"路地の袋小路で追い詰められ、泥水に顔を押しつけられて何度も蹴り上げられた。借金は一銭も減らなかった。",{h:-30,p:-15,fl:{trauma_crime:1}}]),
        $terraData.K("抵抗する", {show:{ban:["健康不良"]}}, [
          0.3,"胸倉を掴んできた男たちを力ずくで突き飛ばして追い返したが、揉み合いの最中に腕を強く捻った。借金はそのまま残っている。",{h:-10,cr:5,p:5}
        ], [1,"拳を振り上げたところを大勢で取り押さえられ、袋叩きにされた挙句、懐の有り金まで根こそぎ奪われた。",{h:-40,cash:-500000,p:-15,fl:{trauma_crime:1}}])
      ]
    },
    {
      id: "siracusa_credit_collection",
      conf: "S",
      references: ["SRC_PRIVATE_LOAN_REGION_MODEL","SRC_DEBT_COLLECTION_MODEL"],
      st: ["青年","壮年","老年"],
      show: s => s.res?.n === "シラクーザ" && loanContract(s,"siracusa-private-credit")?.status === "overdue",
      w: 1.4, cd: 3,
      t: "シラクーザのファミリーに雇われた会計役が、黒服の男を連れて食堂の席へ割り込んできた。返済期限はすでに過ぎている。静かな声で突きつけられた残額を前に、どう凌ぐか迫られた。",
      c: [
        $terraData.K("契約書の一部返済額を払う", {
          show:s=>loanContractBalance(s,"siracusa-private-credit")>loanContract(s,"siracusa-private-credit").installment,
          en:s=>loanContractPaymentAffordable(s,"siracusa-private-credit","installment"),
          why:"一部返済分の現金が手元にない"
        }, [
          0.8,"約束していた一回分の金を卓の上に置いた。会計役は丁寧に礼を言って金を収め、次の期日を告げて去っていった。",
          {loanPayment:{contractId:"siracusa-private-credit",amount:"installment"},p:-3}
        ], [
          1,"金を納めた直後、会計役は眼鏡の奥の目を細め、「迷惑料が抜けていますよ」と同じ額を上乗せしてきた。抗議しようとした瞬間、後ろの黒服にみぞおちを殴られた。",
          {loanPayment:{contractId:"siracusa-private-credit",amount:"installment"},
           loanCharge:{contractId:"siracusa-private-credit",amount:"installment",reason:"契約書にない追加請求",disputed:true},
           p:-8,fl:{trauma_crime:1}}
        ]),
        $terraData.K("残額が一部返済額以下なら全額を払う",{
          show:s=>loanContractBalance(s,"siracusa-private-credit")>0&&
            loanContractBalance(s,"siracusa-private-credit")<=loanContract(s,"siracusa-private-credit").installment,
          en:s=>loanContractPaymentAffordable(s,"siracusa-private-credit","balance"),
          why:"残額を払い切るだけの現金が手元にない"
        },[1,"残っていた借金を端数まで綺麗に揃えて払いきった。会計役は万年筆で帳面を消し、帽子に手を添えて店を出ていった。",{loanPayment:{contractId:"siracusa-private-credit",amount:"balance"},p:-1}]),
        $terraData.K("今回は払わず、帳面を閉じる",{},[1,"今日は手元に金がないと頭を振った。会計役は無言で帳面に印をつけ、冷ややかな視線を残して席を立った。",{p:-2}]),
        $terraData.K("席を立って店を出る",{},[0.5,"人目の多い店内を盾に、素早く席を立って表の通りへ紛れ込んだ。",{p:-3}],[1,"店の戸口で黒服の男に肩を掴まれ、裏路地へ引きずり込まれて散々に殴られた。借金は一銭も減らなかった。",{h:-25,p:-12,fl:{trauma_crime:1}}])
      ]
    },
    {
      id: "columbia_credit_collection",
      conf: "S",
      references: ["SRC_PRIVATE_LOAN_REGION_MODEL","SRC_DEBT_COLLECTION_MODEL"],
      st: ["青年","壮年","老年"],
      show: s => s.res?.n === "クルビア" && loanContract(s,"columbia-private-credit")?.status === "overdue",
      w: 1.2, cd: 4,
      t: "工業区の部品問屋から来た取立人が、用心棒を伴ってアパートの扉を叩いた。期限を過ぎたツケと借金の残額を突きつけられ、今払えるのかと詰め寄られた。",
      c: [
        $terraData.K("契約書の一部返済額を払う",{
          show:s=>loanContractBalance(s,"columbia-private-credit")>loanContract(s,"columbia-private-credit").installment,
          en:s=>loanContractPaymentAffordable(s,"columbia-private-credit","installment"),
          why:"一部返済分の現金が手元にない"
        },[
          0.8,"かき集めた一回分の返済金を渡した。取立人は指を舐めて札を数え、受領証を置いて帰っていった。",
          {loanPayment:{contractId:"columbia-private-credit",amount:"installment"},p:-2}
        ],[
          1,"金を受け取った取立人は、「延滞の手数料ももらうぞ」と証文にない額まで要求してきた。言い返した途端、後ろの用心棒に壁際へ殴りつけられた。",
          {loanPayment:{contractId:"columbia-private-credit",amount:"installment"},
           loanCharge:{contractId:"columbia-private-credit",amount:"installment",reason:"契約書にない追加請求",disputed:true},
           p:-7,fl:{trauma_crime:1}}
        ]),
        $terraData.K("残額が一部返済額以下なら全額を払う",{
          show:s=>loanContractBalance(s,"columbia-private-credit")>0&&
            loanContractBalance(s,"columbia-private-credit")<=loanContract(s,"columbia-private-credit").installment,
          en:s=>loanContractPaymentAffordable(s,"columbia-private-credit","balance"),
          why:"残額を払い切るだけの現金が手元にない"
        },[1,"残っていた額をすべて支払い、借用書をその場で返してもらった。ようやく重苦しい足音に怯えずに済むようになった。",{loanPayment:{contractId:"columbia-private-credit",amount:"balance"},p:-1}]),
        $terraData.K("今回は払わない",{},[1,"給料日前で払えないと突っぱねた。取立人は舌打ちをして扉を蹴り、延滞の記録を残して去った。",{p:-2}]),
        $terraData.K("外へ出て距離を取る",{},[0.6,"話がこじれる前に部屋を出て、人通りの多い工業区の大通りへ逃れた。",{p:-1}],[1,"階段の踊り場で用心棒に行く手を塞がれ、容赦なく殴り倒された。借金はそのまま残った。",{h:-25,p:-10,fl:{trauma_crime:1}}])
      ]
    },
    {
      id: "neighbor_followup",
      conf: "S",
      st: ["幼児", "児童", "少年", "青年", "壮年", "老年"],
      need: ["neighbor_contact"],
      after: { id: "neighbor_move", min: 1 },
      once: true,
      w: 0.6,
      t: [
        {
          when: "neighbor_welcome",
          t: "隣の{neighborName}が、湯気の立つ鉢を持って戸口を訪ねてきた。引っ越してきた日にこちらが差し入れた食べ物を覚えていて、「今日はお裾分けだよ」と笑った。"
        },
        {
          t: "通りで{neighborName}とばったり顔を合わせた。引っ越しの日に荷物を運んだ礼を改めて言われ、「何か手伝えることはないかい」と気さくに声をかけられた。"
        }
      ],
      c: [
        $terraData.K(
          "無理のない用事を手伝い合う",
          {},
          [
            0.8,
            "重たい水汲みや買い出しを一緒に片づけ、行き来のたびに名前で呼び合える気兼ねない仲になった。",
            { rl: 4, p: 2, fl: { neighbor_contact: 0, neighbor_welcome: 0, neighbor_familiar: 1 } }
          ],
          [
            1,
            "ちょうど急ぎの用事があり、笑顔で礼だけ言ってそれぞれの道へ分かれた。",
            { rl: 1, fl: { neighbor_contact: 0, neighbor_welcome: 0, neighbor_familiar: 1 } }
          ]
        ),
        $terraData.K("無理のない距離を保つ", {}, [
          1,
          "好意に礼を言いつつも深入りはせず、程よいご近所づきあいの距離を保って部屋へ戻った。",
          { p: 2, fl: { neighbor_contact: 0, neighbor_welcome: 0, neighbor_familiar: 1 } }
        ])
      ]
    }
  );
  // P06/P16: dated case follow-up and post-primary progression.
  $terraData.EV.push({
    id:"education_case_review",conf:"S",references:["SRC_EDUCATION_ACCESS"],
    cd:0,pri:true,who:"self",inConfinement:true,
    show:s=>educationCaseNeedsReview(s),
    t:"学校の案内と家の事情を確かめながら、今年の進路についてもう一度考えた。募集先の知らせが届いても、通い続ける算段と入学の手続は別に残っている。",
    c:[
      $terraData.K("確認した第一候補へ申し込む",{
        show:s=>educationActiveCase(s)?.phase==="planning" && !!educationCaseCandidate(s,0),
        en:s=>educationCasePreflight(s,educationCaseCandidate(s,0)).allowed,
        why:"この募集先の応募資格、交通、保護者または受験費用の条件が整っていない"
      },[1,"確認した募集先に、進学の意思を伝えて選考を申し込んだ。学校からの返事を待つことになった。",
        {educationAction:"case:select:0"}]),
      $terraData.K("確認した第二候補へ申し込む",{
        show:s=>educationActiveCase(s)?.phase==="planning" && !!educationCaseCandidate(s,1),
        en:s=>educationCasePreflight(s,educationCaseCandidate(s,1)).allowed,
        why:"この募集先の応募資格、交通、保護者または受験費用の条件が整っていない"
      },[1,"別の地区で確認した募集先へ願書を出した。どこで学ぶかは、まだ受入れの返事によって変わりうる。",
        {educationAction:"case:select:1"}]),
      $terraData.K("確認した第三候補へ申し込む",{
        show:s=>educationActiveCase(s)?.phase==="planning" && !!educationCaseCandidate(s,2),
        en:s=>educationCasePreflight(s,educationCaseCandidate(s,2)).allowed,
        why:"この募集先の応募資格、交通、保護者または受験費用の条件が整っていない"
      },[1,"調べた中のもう一つの募集先を選び、申込みの手続を始めた。",
        {educationAction:"case:select:2"}]),
      $terraData.K("隣の地区の募集先も調べる",{
        show:s=>educationActiveCase(s)?.phase==="planning" &&
          educationActiveCase(s).stepsUsed<2 &&
          educationNeighborAreaIds(s,s.local?.educationAreaId).length>0
      },[1,"近くの地区まで足を延ばし、募集案内のある学校を一つずつ訪ねて回った。探した範囲と時期を記録した。",
        {educationAction:"case:search-adjacent"}]),
      $terraData.K("学校外で読み書きや手仕事を学ぶ",{
        show:s=>educationActiveCase(s)?.phase==="planning"
      },[1,"今年は学校へ通う手続を置き、家や仕事場で学べることから始めると決めた。学校の免状を得たことにはならない。",
        {educationAction:"case:nonformal",k:2}]),
      $terraData.K("今年の進学は見送る",{
        show:s=>educationActiveCase(s)?.phase==="planning"
      },[1,"調べた学校の案内を手元に残し、今年は申込みをしないことにした。また考える余地は残してある。",
        {educationAction:"case:defer"}]),
      $terraData.K("入学の条件を確かめて正式に手続する",{
        show:s=>educationActiveCase(s)?.phase==="contract",
        en:s=>educationCaseCommitEligibility(s).allowed,
        why:"受入通知、校地、通学手段または入学時の費用を整えられていない"
      },[1,"合格の知らせを受けて、学費と通学の手続きをそろえた。入学の届けを出し、学校で学ぶ暮らしが始まる。",
        {educationAction:"case:commit"}]),
      $terraData.K("合格・受入後の入学を辞退する",{
        show:s=>educationActiveCase(s)?.phase==="contract"
      },[1,"受け入れるという学校の返事を手元に残し、今回は入学を見送った。受験をした事実は消えない。",
        {educationAction:"case:decline-offer"}]),
      $terraData.K("元の学籍の継続について相談する",{
        show:s=>educationActiveCase(s)?.phase==="continuity",
        en:s=>educationOccupied(s),
        why:"継続できる学籍が残っていない"
      },[1,"学校の窓口に現在の学籍を照会し、今年の扱いを確認した。",
        {educationAction:"case:keep-current"}]),
      $terraData.K("在籍中の課程をいったん休む",{
        show:s=>educationActiveCase(s)?.phase==="continuity"&&educationLive(s)
      },[1,"学びを続けるための時間を得ようと、学校に休学の意思を伝えた。",
        {educationAction:"case:pause"}]),
      $terraData.K("いったん退学して別の学び方を考える",{
        show:s=>educationActiveCase(s)?.phase==="continuity"
      },[1,"これまでの履修記録を残し、今の学校を離れる判断を下した。",
        {educationAction:"case:withdraw"}])
    ]
  }, {
    id:"edu_lower_stage_site_review",conf:"S",references:["SRC_EDUCATION_ACCESS"],
    st:["児童","少年","青年","壮年"],pri:true,who:"self",cd:0,
    show:s=>s.educationDecision?.kind==="lower-path" &&
      !educationActiveCase(s),
    t:"初等課程で過ごした日々が終わった。次の課程を学べる場所は、この地区にもあるのだろうか。手元の修了記録を見ながら、家の人とこれからの通い先を考えた。",
    c:[
      $terraData.K("前期中等課程の募集先を調べる",{},[
        1,"次の課程で学びたいと伝え、通える範囲にある学校の案内を確かめ始めた。",
        {educationAction:"case:begin:lower-path:lower:1"}]),
      $terraData.K("今年は別の学び方を探す",{},[
        1,"初等の修了記録は手元に残した。今すぐ次の学校へは進まず、家や仕事場で学ぶ道を考えた。",
        {educationAction:"case:decline:lower-path"}])
    ]
  });
});
