// world/class-and-locality: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("world/class-and-locality", function ($terraData, $define, $rules) {
  "use strict";
  $define("CLASS_REFS", ["SRC_CLASS_GENERAL", "SRC_TERRA_FAMILY"], false);

  $define("CFX", (kind, note, more = {}) => ({ classAction: { kind, note, ...more } }), false, true);

  $define(
    "classEvents",
    [
      {
        id: "cl_child_school_supplies",
        conf: "S",
        references: $terraData.CLASS_REFS,
        st: ["児童", "少年"],
        ge: { age: 7 },
        le: { age: 15 },
        need: ["就学中"],
        once: true,
        w: 0.32,
        t: "新学期の教室を見渡すと、真新しい文房具を机に並べる子もいれば、ちびた鉛筆や継ぎ接ぎの鞄を使っている子もいた。家の手伝いも抱えるなかで、どうやって勉強に食らいつくか考えた。",
        c: [
          $terraData.K("放課後の教室に残り、備え付けの教材を借りて写す", {}, [
            1,
            "みんなが帰ったあとの教室で備え付けの本をノートに書き写し、薄暗くなってから家へ走った。指先はインクで汚れたが、新しいページが埋まっていくのは嬉しかった。",
            {
              k: 2,
              rl: 1,
              ...$terraData.CFX("education", "共有の教材を使って学んだ", { opportunity: "学習継続" })
            }
          ]),
          $terraData.K("家の手伝いをする日と、机に向かう日を決める", {}, [
            1,
            "家の大人に「この曜日は店や畑を手伝うから、別の日は勉強させてほしい」と掛け合い、自分の時間を守った。",
            {
              k: 1,
              rl: 2,
              ...$terraData.CFX("household_labor", "家事・生業と学びの時間を調整した", {
                view: "家の暮らしと学びを両立させたい"
              })
            }
          ]),
          $terraData.K("裕福な子の道具を借り、使い方を教えてもらう", {}, [
            1,
            "授業のあと、新しい計算具や図鑑を持っている同級生に声をかけ、一緒に覗き込ませてもらった。家の暮らし向きは違っても、机を並べれば同じ生徒だった。",
            {
              k: 2,
              rl: 2,
              ...$terraData.CFX("peer_contact", "学用品の差があるなか同級生と学んだ", {
                view: "家柄だけで人を判断しない"
              })
            }
          ])
        ]
      },
      {
        id: "cl_family_legacy_expectation",
        conf: "S",
        references: $terraData.CLASS_REFS,
        st: ["少年", "青年"],
        ge: { age: 13 },
        le: { age: 23 },
        need: ["旧家・領主層に縁がある生家"],
        once: true,
        w: 0.43,
        t: "押し入れの奥から、古い家系図と封書が出てきた。親戚は昔の格式を今さらのように誇らしげに語るが、記された領地や屋敷にはとっくに見知らぬ他人の名が上書きされている。古い縁故にすがるか、自分の腕で立つかで家の意見は割れた。",
        c: [
          $terraData.K("年長者の昔話を聞き、家の辿った浮き沈みを知る", {}, [
            1,
            "黄ばんだ書状の宛先を今の地図と見比べながら、親戚が語る昔の栄華と没落のいきさつに耳を傾けた。",
            {
              k: 2,
              ...$terraData.CFX("family_heritage", "家の来歴を確かめた", {
                opportunity: "旧家の連絡先を記録"
              })
            }
          ]),
          $terraData.K("昔の縁故を頼り、働き口や学びのツテを探る", {}, [
            1,
            "親戚の口利きで、昔から付き合いのある家へ挨拶の文を出した。数日後、一度顔を見せに来いという返事が届いた。",
            {
              rl: 1,
              k: 1,
              fl: { cl_legacy_contact: 1 },
              ...$terraData.CFX("family_contact", "親族を通じ仕事や学びの相談先を得た", {
                opportunity: "相談先あり"
              })
            }
          ]),
          $terraData.K("カビ臭い家名には頼らず、自分の腕を磨く", {}, [
            1,
            "古い名簿を箱にしまい込み、いま目の前にある勉強や仕事に打ち込むことにした。自分の足で立つ道は自分で切り開くと決めた。",
            {
              k: 1,
              p: 1,
              ...$terraData.CFX("self_direction", "家名にとらわれず進路を考えた", {
                view: "家柄より本人の仕事や行動を見たい"
              })
            }
          ])
        ]
      },
      {
        id: "cl_household_work_entry",
        conf: "S",
        references: $terraData.CLASS_REFS,
        st: ["少年", "青年"],
        ge: { age: 13 },
        le: { age: 20 },
        need: ["労働・生業を中心とする生家"],
        once: true,
        w: 0.58,
        t: "家の稼ぎを支える親から、「猫の手も借りたい時期だけ現場を手伝ってくれないか」と頼まれた。仕事の手順を覚えれば一人前として扱われるが、そのぶん勉強や息抜きの時間は削られる。",
        c: [
          $terraData.K("危なくない手仕事から少しずつ教わる", {}, [
            1,
            "工具の手入れや荷の仕分けを教わり、親の背中を見ながら一日働いた。夕方には手のひらに小さな豆ができていた。",
            {
              k: 1,
              rl: 1,
              lifeSkill: {
                id: "class-household-work",
                title: "家の生業の基礎",
                delta: 2,
                context: "安全にできる作業を教わった"
              },
              ...$terraData.CFX("household_skill", "家の生業を手伝い技能を習った", {
                opportunity: "技能を習う"
              })
            }
          ]),
          $terraData.K("学校の授業だけは休めないと家族に掛け合う", { show: { need: ["就学中"] } }, [
            1,
            "「学校がある日は抜けられない」と正直に話し、休みの日だけ手伝うことで折り合いをつけた。夜はランプの下で遅くまで宿題を広げた。",
            {
              rl: 1,
              k: 2,
              ...$terraData.CFX("education_choice", "家の生業と授業の優先順位を話した", {
                view: "働く時間と学ぶ機会を両方大切にしたい"
              })
            }
          ]),
          $terraData.K("現場に出るより、クタクタな家族のために炊事や洗濯を回る", {}, [
            1,
            "仕事場へは入らず、泥だらけで帰ってくる家族のために温かい飯と洗濯を引き受けた。直接の稼ぎにはならなくても、家の暮らしが回るのを支えた。",
            { rl: 2, p: 1, ...$terraData.CFX("care_work", "生業の外にある家事労働を引き受けた") }
          ])
        ]
      },
      {
        id: "cl_urban_rent_pressure",
        conf: "S",
        references: ["SRC_CLASS_GENERAL", "SRC_LUNGMEN_SLUM", "SRC_URBAN_RENT_MODEL"],
        st: ["少年", "青年", "壮年"],
        ge: { age: 15 },
        need: ["現在の家計に余裕がない"],
        show: s => s.home === "移動都市" && !s.fl?.detained && !s.fl?.segregated,
        once: true,
        w: 0.4,
        t: "移動都市の暮らしは、何をするにもまず部屋代が重くのしかかる。今月も袋の底の硬貨を数えるような有様で、路地裏の安宿や相部屋の貼り紙を見比べてはため息をついた。",
        c: [
          $terraData.K("大家と掛け合い、共益費や支払いの猶予を確かめる", {}, [
            1,
            "大家を訪ねて家賃の内訳を細かく聞き出し、給金日までのつなぎ方を相談した。渋い顔はされたが、いきなり追い出される心配だけは消えた。",
            {
              k: 1,
              rl: 1,
              fl: { cl_rent_recorded: 1 },
              ...$terraData.CFX("housing_contract", "住居費の内訳と期限を確かめた", { neighborhood: true })
            }
          ]),
          $terraData.K("近所の顔なじみに、もっと安い区画や相部屋の空きを聞く", {}, [
            1,
            "市場の行き帰りに近所の人へ声をかけ、口約束で貸し借りされている安い長屋の空きを教えてもらった。",
            {
              rl: 2,
              fl: { cl_housing_search: 1 },
              ...$terraData.CFX("housing_network", "住み替え先の情報を尋ねた", { neighborhood: true })
            }
          ]),
          $terraData.K(
            "家賃を浮かすため、都市の端にある周縁区へ引っ越す（準備費2万龍門幣）",
            {
              show: s => s.local?.kind === "移動都市の居住区" || s.local?.kind === "移動都市の避難・労働区画",
              en: { affordableCash: 20000 },
              why: "引っ越しの荷運び代や敷金を工面できない"
            },
            [
              1,
              "荷車に家財道具を積んで都市の外縁部へ移り住んだ。交通費や修繕費がかさんで住居費が必ず下がるとは限らず、壁は薄く風音も響くが、ひとまず新しい暮らしを始めた。",
              {
                cash: -20000,
                pm: 1,
                rl: 1,
                ...$terraData.CFX("housing_relocation", "家計事情から同一都市内の周縁区へ住まいを移した", {
                  relocateKind: "移動都市の周縁区",
                  neighborhood: true
                })
              }
            ]
          ),
          $terraData.K("引っ越し代も惜しいので、食費を削って今の部屋にしがみつく", {}, [
            1,
              "今は動く金すら惜しく、日々の食事や灯油を詰めて今の部屋に残ることにした。天井の染みを見上げながら、来月のやりくりを考えた。",
            {
              p: -1,
              k: 1,
              ...$terraData.CFX("housing_stay", "家計を見直して現在の住居を維持した", { neighborhood: true })
            }
          ])
        ]
      },
      {
        id: "cl_urban_housing_followup",
        conf: "S",
        references: ["SRC_CLASS_GENERAL", "SRC_LUNGMEN_SLUM", "SRC_URBAN_RENT_MODEL"],
        st: ["青年", "壮年"],
        after: { id: "cl_urban_rent_pressure", min: 2 },
        ge: { age: 18 },
        need: ["都市の周縁部で暮らす"],
        once: true,
        w: 0.45,
        t: "周縁区の集会所に、錆びついた共同水場の修理を求める署名紙が貼り出された。今の長屋は狭くて不便だが、鍋や塩を貸し借りできる隣人もいる。このままこの街角に根を下ろすか、よそへ出る金を貯めるか考えた。",
        c: [
          $terraData.K("この長屋に留まり、隣近所と助け合って暮らす", {}, [
            1,
            "隣の部屋へ借りていた鍋を返しに行きがてら、水場の修理について立ち話をした。多少不便でも、顔が見えるこの路地で暮らしていくことにした。",
            {
              rl: 2,
              fl: { cl_neighborhood_mutual: 1 },
              ...$terraData.CFX("neighborhood_support", "現在地に留まり近所との助け合いを選んだ", {
                neighborhood: true,
                view: "住まいの条件と人とのつながりをともに守りたい"
              })
            }
          ]),
          $terraData.K("いつでも抜け出せるよう、転居の費用を少しずつ積み立てる", {}, [
            1,
            "もう少しマシな区画へ移るのに必要な敷金と、今の仕事場までの足を計算し、月末ごとに小銭を別袋へよけておくことにした。",
            {
              k: 1,
              fl: { cl_housing_search: 1 },
              ...$terraData.CFX("housing_research", "転居に必要な条件を調べた", { neighborhood: true })
            }
          ]),
          $terraData.K("集会所で声を上げ、水場と路地の修繕を求める", {}, [
            1,
            "夜の寄り合いに顔を出し、水場の水漏れと暗い路地の足元の悪さをなんとかしてほしいと管理人に直談判した。",
            {
              rl: 1,
              fl: { cl_local_petition: 1 },
              ...$terraData.CFX("civic_voice", "地区の生活設備について意見を伝えた", {
                view: "暮らしの問題を地域の仕事として考えたい"
              })
            }
          ])
        ]
      },
      {
        id: "cl_ursus_school_divide",
        conf: "S",
        references: ["SRC_CLASS_URSUS"],
        st: ["児童", "少年"],
        ge: { age: 9 },
        le: { age: 17 },
        need: ["国:ウルサス", "就学中"],
        once: true,
        w: 0.4,
        t: "ウルサスの学校の廊下で、親の身分や家の貧しさをあげつらう怒鳴り声が響いた。貴族や役人の家を鼻にかける生徒と、馬鹿にされて拳を握りしめる生徒が睨み合っている。",
        c: [
          $terraData.K("「親の身分で人を馬鹿にするな」と割って入る", {}, [
            1,
            "二人の間に立ちはだかって声を張り上げた。騒ぎを聞きつけた教師が飛んできて場は収まり、昼休みには悔し涙をこらえていた同級生の隣に座った。",
            {
              rl: 1,
              cr: 1,
              ...$terraData.CFX("school_prejudice", "学校で家柄による決めつけに異議を唱えた", {
                view: "出自だけで人を判断しない"
              })
            }
          ]),
          $terraData.K("職員室へ走り、事の次第を教師に伝える", {}, [
            1,
            "誰がどんな言葉で相手を貶めたのか、息を切らして教師に伝えた。教師は眉をひそめ、「明日また話を聞く」と頷いた。",
            {
              k: 1,
              fl: { cl_school_report: 1 },
              ...$terraData.CFX("school_procedure", "学校で出自による対立を相談した")
            }
          ]),
          $terraData.K("その場では巻き込まれないよう引き下がり、後で友人を気遣う", {}, [
            1,
            "険悪な輪からはそっと足を引いた。放課後、一人で靴箱の前にいた友人に声をかけ、雪の舞う帰り道を並んで歩いた。",
            { p: -1, rl: 1, ...$terraData.CFX("peer_listening", "学校での階層対立を後から聞いた") }
          ])
        ]
      },
      {
        id: "cl_victoria_service_household",
        conf: "S",
        references: ["SRC_CLASS_TARA", "SRC_CLASS_GENERAL"],
        st: ["少年", "青年"],
        ge: { age: 14 },
        le: { age: 24 },
        need: ["国:ヴィクトリア"],
        once: true,
        w: 0.4,
        t: "ヴィクトリアの大きな屋敷へ荷を届けに行くと、着飾った客人は正面の鉄門から入り、荷を担ぐ職人や使用人は裏の勝手口へ回された。同じ人間でも通る扉からして違うのだと肌で感じた。",
        c: [
          $terraData.K("執事や帳場係を捕まえ、誰が検品していつ払うのか確かめる", {}, [
            1,
            "屋敷の威光に呑まれず、受け取りの責任者と支払い日をはっきりさせてから荷を下ろした。用が済むと、やはり裏口から出るよう顎で示された。",
            {
              k: 2,
              ...$terraData.CFX("work_contract", "ヴィクトリアの仕事先で指示系統と支払条件を確かめた", {
                view: "働く条件は家柄ではなく契約で確かめたい"
              })
            }
          ]),
          $terraData.K("出入りする古株の職人に、屋敷のしきたりを教わる", {}, [
            1,
            "勝手口で一服していた年配の職人から、荷を置く順番や口うるさい使用人のあしらい方をこっそり教わった。次からはまごつかずに立ち回れそうだ。",
            {
              rl: 2,
              k: 1,
              ...$terraData.CFX("work_mentorship", "雇われた人から仕事の手順を学んだ", {
                opportunity: "現場の知人"
              })
            }
          ]),
          $terraData.K("さっさと荷だけ渡して、居心地の悪い屋敷を後にする", {}, [
            1,
            "受領の判だけもらうと、逃げるように裏門を出た。高い塀の向こうから聞こえる笑い声を背に、いつもの騒がしい下町へと戻った。",
            { p: 1, ...$terraData.CFX("work_distance", "雇用関係への接触を一度で終えた") }
          ])
        ]
      },
      {
        id: "cl_tara_language_gate",
        conf: "S",
        references: ["SRC_CLASS_TARA"],
        st: ["青年", "壮年"],
        ge: { age: 17 },
        need: ["国:ヴィクトリア"],
        once: true,
        w: 0.3,
        t: "ヴィクトリアの窓口で、田舎の訛りが強い住民が係員に鼻で笑われていた。訛り一つで教養も仕事の腕もないと決めつけ、ろくに説明もせず追い返そうとしている。",
        c: [
          $terraData.K("困っている本人の横へ並び、書類の確認を手伝う", {}, [
            1,
            "どの欄でつまずいているのか本人に尋ね、係員の説明を一緒に聞き直した。手続きが終わると、相手はほっとした顔で何度も頭を下げた。",
            {
              rl: 2,
              k: 1,
              ...$terraData.CFX("language_access", "訛りを理由にした軽視に対して書類確認を助けた", {
                view: "言葉の違いと能力を結び付けない"
              })
            }
          ]),
          $terraData.K("係員に「訛りと手続きに何の関係があるのか」と問い質す", {}, [
            1,
            "周囲の視線が集まるなかで真正面から指摘すると、係員はバツが悪そうに規定書をめくり、必要な手続きを渋々案内した。",
            {
              cr: 1,
              fl: { cl_tara_documented: 1 },
              ...$terraData.CFX("administrative_challenge", "出身や訛りと手続きを切り離すよう説明を求めた")
            }
          ]),
          $terraData.K("余計な揉め事には首を突っ込まず、自分の用件を済ませる", {}, [
            1,
            "目を伏せて自分の手続きだけを済ませ、足早に建物を出た。背後の窓口から、次の番号を呼ぶ冷たい声が聞こえた。",
            { p: -1, ...$terraData.CFX("bystander", "差別的な窓口対応を目撃したが介入しなかった") }
          ])
        ]
      },
      {
        id: "cl_kazimierz_sponsorship",
        conf: "S",
        references: ["SRC_CLASS_GENERAL"],
        st: ["青年", "壮年"],
        ge: { age: 18 },
        need: ["国:カジミエーシュ"],
        once: true,
        w: 0.38,
        t: "カジミエーシュの眩い競技場の裏手では、ネオンの影で無数の清掃夫や整備工が油まみれになって働いていた。顔なじみの業者から「競技場の裏方の口があるぞ」と声をかけられたが、華やかな表舞台とは裏腹に現場は荒っぽいという。",
        c: [
          $terraData.K("裏方の仕事の日当と、怪我をした時の補償を確かめる", {}, [
            1,
            "現場の元締めに会い、日当の額や夜間の割り増し、万一機材で怪我をした時に誰が面倒を見るのかをじっくり聞き出した。",
            {
              k: 1,
              fl: { cl_kazimierz_job_contact: 1 },
              ...$terraData.CFX("work_contact", "騎士競技の裏方求人について相談した", {
                opportunity: "募集条件を照会"
              })
            }
          ]),
          $terraData.K("競技場周りの露店や食堂に、興行の日の稼ぎ具合を聞く", {}, [
            1,
            "「大試合の日は財布の紐が緩むが、酔っ払いの喧嘩も絶えない」と露店の親父が笑っていた。歓声の響く街の表と裏を肌で知った。",
            { rl: 1, ...$terraData.CFX("local_economy", "競技興行が周囲の商いに与える影響を聞いた") }
          ]),
          $terraData.K("派手な興行の裏方には関わらず、今の仕事へ戻る", {}, [
            1,
            "うまい話には乗らず、いつもの仕事場へと戻った。競技場の搬入口には、夜遅くまで資材を積んだ荷車が列をなしていた。",
            { p: 1, ...$terraData.CFX("work_declined", "騎士競技の仕事紹介を見送った") }
          ])
        ]
      },
      {
        id: "cl_siracusa_market_patron",
        conf: "S",
        references: ["SRC_CLASS_SIRACUSA"],
        st: ["青年", "壮年"],
        ge: { age: 18 },
        need: ["国:シラクーザ"],
        once: true,
        w: 0.35,
        t: "シラクーザの市場で店の手伝いを頼まれたが、店主は毎月の売り上げとは別に、地元のファミリーへ納める金を裏帳面に書き込んでいた。表の帳面だけをつけるか、それとも店が抱える危うい事情まで踏み込むか迷った。",
        c: [
          $terraData.K("日々の品物と売り上げの計算だけを引き受ける", {}, [
            1,
            "「自分が触るのは表の帳面だけだ」と線を引き、仕入れと売り上げの計算だけをきっちり片づけた。引き出しの奥にある黒い小帳面には指一本触れなかった。",
            {
              k: 2,
              rl: 1,
              ...$terraData.CFX("market_work", "ファミリーの存在する地域で市場の帳簿仕事を手伝った", {
                opportunity: "帳簿仕事"
              })
            }
          ]),
          $terraData.K("店主の愚痴に耳を傾け、支払いのやりくりを一緒に考える", {}, [
            1,
            "閉店後の暗い店内で店主の溜め息を聞き、卸業者への支払いと毎月の取り立てをどうしのぐか一緒に算盤を弾いた。帳面を閉じても、店主の指は小刻みに震えていた。",
            { rl: 2, ...$terraData.CFX("market_support", "店主が置かれた取引関係について話を聞いた") }
          ]),
          $terraData.K("きな臭い商売からは手を引き、別の働き口を探す", {}, [
            1,
            "ファミリーの影がちらつく店には深入りせず、丁重に断って表へ出た。石畳の広場では、黒服の男たちが談笑していた。",
            { p: 1, ...$terraData.CFX("market_distance", "市場仕事を引き受けなかった") }
          ])
        ]
      },
      {
        id: "cl_yerag_community_vote",
        conf: "S",
        references: ["SRC_CLASS_GENERAL"],
        st: ["青年", "壮年"],
        ge: { age: 18 },
        need: ["国:イェラグ"],
        once: true,
        w: 0.3,
        t: "イェラグの春先、雪解けで崩れた山道の普請と荷運びの順番を決める寄り合いが開かれた。古い家柄の年長者ばかりが声を張り上げ、実際に重い荷を背負って峠を越える若い衆は口を挟みにくい空気があった。",
        c: [
          $terraData.K("実際に荷を担ぐ者たちの言い分を集めて代弁する", {}, [
            1,
            "毎日峠を往復している担ぎ手や荷受け人から本音を聞き出し、無理のない普請の順番を寄り合いの席へ突きつけた。",
            {
              rl: 2,
              ...$terraData.CFX("collective_work", "共同作業の負担を確かめて意見を伝えた", {
                view: "働く人の声を意思決定へ反映したい"
              })
            }
          ]),
          $terraData.K("山道に詳しい古株から、雪崩やぬかるみの癖を教わる", {}, [
            1,
            "議論の輪から少し離れ、長年山を歩いてきた老職人に雪解け水の通り道や危ない崖の見分け方をじっくり教わった。",
            {
              k: 2,
              ...$terraData.CFX("local_skill", "山間の輸送に関する知識を教わった", {
                opportunity: "現場の知恵"
              })
            }
          ]),
          $terraData.K("寄り合いの決定には逆らわず、割り当てられた道普請をこなす", {}, [
            1,
            "黙ってツルハシとシャベルを握り、ぬかるんだ山道の石を退けた。帰り道には、ぬかるみにめり込んだ荷車の車輪をみんなで押し上げた。",
            {
              p: 1,
              ...$terraData.CFX("participation_distance", "共同作業には参加し決定過程には立ち入らなかった")
            }
          ])
        ]
      },
      {
        id: "cl_columbia_school_fee",
        conf: "S",
        references: ["SRC_CLASS_GENERAL"],
        st: ["少年", "青年"],
        ge: { age: 14 },
        le: { age: 24 },
        need: ["国:クルビア"],
        once: true,
        w: 0.38,
        t: "クルビアの技術工房に、新しい機械講習の案内が貼り出された。最新の機材を触れるコースは受講料が高く、その横には薄給の見習い募集も並んでいる。財布の厚みと将来の腕前を天秤にかけた。",
        c: [
          $terraData.K("金のかからない古本や端材を探し、独学で手を動かす", {}, [
            1,
            "古本屋で安い図解本を買い求め、廃材をいじりながら基礎の仕組みを頭に入れた。次に職人の手元を見る時は、どこを盗み見ればいいか分かるようになった。",
            {
              k: 2,
              ep: 1,
              ...$terraData.CFX("self_study", "費用を抑えて学びを継続した", { opportunity: "独学" })
            }
          ]),
          $terraData.K("現場の見習い枠に空きがないか、工房へ掛け合う", {}, [
            1,
            "授業料を払う代わりに雑用から働けないか工房の親方に尋ねた。すぐには入れないが、欠員が出たら声をかけてもらえることになった。",
            {
              rl: 1,
              k: 1,
              fl: { cl_apprentice_lead: 1 },
              ...$terraData.CFX("apprenticeship", "技術職の見習い募集について相談した", {
                opportunity: "求人照会"
              })
            }
          ]),
          $terraData.K("今は高い講習には手を出さず、今月の暮らしを守る", {}, [
            1,
            "受講料の額を見てため息をつき、今回は見送ることにした。まずは今月の家賃と食費を滞りなく払うのが先決だった。",
            { p: -1, ...$terraData.CFX("deferred_education", "家計事情から有料講習を見送った") }
          ])
        ]
      },
      {
        id: "cl_sargon_trade_water",
        conf: "S",
        references: ["SRC_SARGON_WATER", "SRC_SARGON_WATER_LIFE_MODEL"],
        st: ["青年", "壮年"],
        ge: { age: 18 },
        need: ["国:サルゴン"],
        show: s => s.local?.ecology === "乾燥地・オアシス",
        once: true,
        w: 0.3,
        t: "乾いた熱風が吹きつける季節が続き、オアシスの水場には水甕を運ぶ家族や畑の乾きを案じる農夫たちが詰めかけていた。乏しい水をどう分け、泥の詰まった水路を誰がさらうかで声が荒くなっている。",
        c: [
          $terraData.K("水場を使う家々を回り、どこがどれだけ困っているか聞き取る", {}, [
            1,
            "飲み水が足りない家と苗が枯れそうな畑をそれぞれ見て回り、声の大きい者だけでなく一軒ずつの事情を聞き取っていった。",
            {
              rl: 2,
              ...$terraData.CFX("water_access", "水場を使う家ごとの要望を記録した", {
                view: "暮らしに必要な資源の分配は、当事者の話を確かめたい"
              }),
              lifeGoal: {
                id: "sargon-oasis-water-claims",
                title: "水場を使う家の声を記録する",
                priority: "地域の暮らし",
                action: "start",
                note: "水場を使う家から、それぞれの要望を聞き取った"
              }
            }
          ]),
          $terraData.K("水桶を担ぎ、水路の泥さらいと貯水槽の手入れに汗を流す", {}, [
            1,
            "照りつける日差しの下で重い水桶を運び、年季の入った職人と一緒に水路の底の泥をかき出した。水の流れを読むコツを一つ体で覚えた。",
            {
              k: 1,
              rl: 1,
              ...$terraData.CFX("water_work", "水場の運搬と設備手入れを手伝った", {
                opportunity: "地域の仕事"
              }),
              lifeGoal: {
                id: "sargon-oasis-water-maintenance",
                title: "経験者から水路と貯水設備の手入れを学ぶ",
                priority: "生業と技能",
                action: "start",
                note: "経験者の水路手入れを手伝い、道具と手順を学んだ"
              },
              lifeSkill: {
                id: "water-channel-maintenance",
                title: "水路と貯水設備の手入れ",
                delta: 1,
                context: "乾燥地の水場で経験者の作業を手伝った"
              }
            }
          ]),
          $terraData.K("揉め事には首を突っ込まず、自分の家の水だけ汲んで仕事へ行く", {}, [
            1,
            "言い争う声を背に自分の家の水甕だけを満たし、日の高くならないうちに仕事場へと急いだ。",
            { p: 1, ...$terraData.CFX("resource_distance", "水場の交渉や手入れには関わらなかった") }
          ])
        ]
      },
      {
        id: "life_sargon_water_round",
        conf: "S",
        references: ["SRC_SARGON_WATER", "SRC_SARGON_WATER_LIFE_MODEL", "SRC_TERRA_LIFECOURSE"],
        st: ["青年", "壮年", "老年"],
        need: ["国:サルゴン"],
        show: s => {
          if (s.local?.ecology !== "乾燥地・オアシス") return false;
          return ["sargon-oasis-water-claims", "sargon-oasis-water-maintenance"].some(id => {
            const g = s.lifeRecord?.goals?.find(row => row.id === id);
            return (
              g &&
              ["active", "paused"].includes(g.status) &&
              Number.isInteger(g.startedYear) &&
              s.year >= g.startedYear + 2
            );
          });
        },
        after: { id: "cl_sargon_trade_water", min: 1 },
        once: true,
        w: 0.42,
        t: "水場の世話に関わってから二年が過ぎた。雨季を二度越え、湧き水の高さも水路に溜まる砂の量もあの頃とは変わっている。今年も家々の言い分を聞いて回るか、溝の泥さらいに出るか、それとも自分の生計を優先するか。",
        c: [
          $terraData.K(
            "今年も水場を使う家々を回り、言い分を聞く",
            {
              show: s =>
                s.lifeRecord?.goals?.some(
                  row => row.id === "sargon-oasis-water-claims" && ["active", "paused"].includes(row.status)
                )
            },
            [
              1,
              "乾いた風が吹く夕暮れ時、一軒ずつ戸口を訪ねて今年の引き水の具合を聞いた。家族が増えた家、畑を縮めた家の事情が少しずつ見えてきた。",
              {
                lifeGoal: {
                  id: "sargon-oasis-water-claims",
                  action: "continue",
                  note: "季節を変えて、水場を使う家の要望を聞き取った"
                },
                ...$terraData.CFX("water_access", "季節を変えて水利用の要望を再度聞き取った")
              }
            ]
          ),
          $terraData.K(
            "水路に詳しい年長者と溝の傷みを確かめる",
            {
              show: s =>
                s.lifeRecord?.goals?.some(
                  row =>
                    row.id === "sargon-oasis-water-maintenance" && ["active", "paused"].includes(row.status)
                )
            },
            [
              1,
              "年長者の後ろについて水路の縁を歩き、石積みが緩んで水が漏れている箇所を確かめた。泥に汚れた手で、次に石を当て直す場所へ目印の杭を打った。",
              {
                lifeGoal: {
                  id: "sargon-oasis-water-maintenance",
                  action: "continue",
                  note: "経験者と水路の一か所を点検した"
                },
                lifeSkill: {
                  id: "water-channel-maintenance",
                  title: "水路と貯水設備の手入れ",
                  delta: 1,
                  context: "経験者と局所の設備を点検した"
                },
                ...$terraData.CFX("water_work", "経験者と局所の水場設備を点検した")
              }
            ]
          ),
          $terraData.K(
            "今年は自分の稼ぎと家の用事を優先し、聞き取りを休む",
            {
              show: s =>
                s.lifeRecord?.goals?.some(
                  row => row.id === "sargon-oasis-water-claims" && ["active", "paused"].includes(row.status)
                )
            },
            [
              1,
              "今年は手が回らないと仲間に断りを入れ、自分の仕事と家の切り盛りに専念した。",
              {
                lifeGoal: {
                  id: "sargon-oasis-water-claims",
                  action: "pause",
                  note: "仕事と家の用事を優先し、聞き取りを一時休止した"
                },
                p: 1
              }
            ]
          ),
          $terraData.K(
            "今年は自分の稼ぎと家の用事を優先し、水路の手入れを休む",
            {
              show: s =>
                s.lifeRecord?.goals?.some(
                  row =>
                    row.id === "sargon-oasis-water-maintenance" && ["active", "paused"].includes(row.status)
                )
            },
            [
              1,
              "今年は泥さらいに出られないと仲間に伝え、自分の仕事場と家の修繕に時間を充てた。",
              {
                lifeGoal: {
                  id: "sargon-oasis-water-maintenance",
                  action: "pause",
                  note: "仕事と家の用事を優先し、設備手入れを一時休止した"
                },
                p: 1
              }
            ]
          )
        ]
      },
      {
        id: "life_bolivar_upland_crops",
        conf: "S",
        references: ["SRC_BOLIVAR_LIFEWAYS_II", "SRC_BOLIVAR_UPLAND_LIFE_MODEL"],
        st: ["青年", "壮年"],
        ge: { age: 18 },
        need: ["国:ボリバル"],
        show: s => s.res?.n === "ボリバル" && s.home === "固定集落" && s.local?.kind === "小規模な定住地",
        once: true,
        w: 0.28,
        t: "ボリバルの高地にある小さな集落で、次の季節に何を蒔くか家族と額を突き合わせた。家の鍋を満たす穀物を守るか、町へ卸して金になる作物を増やすか、それとも畑の隅に彩りの花を残すか。",
        c: [
          $terraData.K("家で食べる穀物を残し、畝の一部で換金作物を試す", {}, [
            1,
            "家族が食べる分の穀物畑は減らさず、日当たりのいい端の畝だけで市場向けの作物を試してみようと提案した。",
            {
              lifeGoal: {
                id: "bolivar-upland-cultivation-review",
                title: "家の作付けについて相談する",
                priority: "家計と日々の暮らし",
                action: "start",
                note: "食べる分の穀物を残し、畑の一部で商品作物を試す案を伝えた"
              },
              lifeSkill: {
                id: "bolivar-crop-planning",
                title: "作付けと収穫の記録",
                delta: 1,
                context: "食料用と販売用の区画の希望を伝えた"
              },
              p: 1
            }
          ]),
          $terraData.K("家の食料と来季の種籾を何より先に取り置く", {}, [
            1,
            "街道の相場がどう転んでも困らないよう、家で食べる分と次に蒔く種を先に倉へ収め、余った分だけを売ろうと話し合った。",
            {
              lifeGoal: {
                id: "bolivar-upland-cultivation-review",
                title: "家の作付けについて相談する",
                priority: "家計と日々の暮らし",
                action: "start",
                note: "家で食べる分と次の種を先に取り置く案を伝えた"
              },
              lifeSkill: {
                id: "bolivar-crop-planning",
                title: "作付けと収穫の記録",
                delta: 1,
                context: "家で使う分と次の種を優先する案を伝えた"
              },
              p: 1
            }
          ]),
          $terraData.K("畑の隅に花を育てる小さな区画を残す", {}, [
            1,
            "食べるためだけの畑では息が詰まるからと、石垣の脇に花の苗を植える場所を残してほしいと頼んだ。",
            {
              lifeGoal: {
                id: "bolivar-upland-cultivation-review",
                title: "家の作付けについて相談する",
                priority: "家計と日々の暮らし",
                action: "start",
                note: "花を暮らしの楽しみとして育てたいと伝えた"
              },
              lifeSkill: {
                id: "bolivar-garden-care",
                title: "花と作物の手入れ",
                delta: 1,
                context: "家庭菜園で花を残す希望を伝えた"
              },
              p: 1
            }
          ])
        ]
      },
      {
        id: "life_bolivar_harvest_review",
        conf: "S",
        references: ["SRC_BOLIVAR_LIFEWAYS_II", "SRC_BOLIVAR_UPLAND_LIFE_MODEL"],
        st: ["青年", "壮年", "老年"],
        need: ["国:ボリバル"],
        after: { id: "life_bolivar_upland_crops", min: 2 },
        once: true,
        w: 0.32,
        show: s =>
          s.res?.n === "ボリバル" &&
          s.home === "固定集落" &&
          s.local?.kind === "小規模な定住地" &&
          s.lifeRecord?.goals?.some(
            g =>
              g.id === "bolivar-upland-cultivation-review" &&
              ["active", "paused"].includes(g.status) &&
              Number.isInteger(g.startedYear) &&
              s.year >= g.startedYear + 2
          ),
        t: "作付けの相談をしてから二年が経った。今年は、隣の家が市場へ荷を出す道中で武装した連中に作物を奪われたという物騒な話が集落を駆け巡っている。次の畑をどうするか、ランプの下で家族と話し合った。",
        c: [
          $terraData.K("どの道が危ないか聞き集め、うちの収穫高と見比べる", {}, [
            1,
            "噂話と実際に荷を奪われた峠の場所を確かめ、うちの畑で採れた袋の数と照らし合わせて出荷を見合わせるか考えた。",
            {
              lifeGoal: {
                id: "bolivar-upland-cultivation-review",
                action: "complete",
                note: "近隣から聞いた話と自分の家の収穫を分けて記録した"
              },
              lifeSkill: {
                id: "bolivar-crop-planning",
                title: "作付けと収穫の記録",
                delta: 1,
                context: "観察と伝聞、家で使った分を区別した"
              },
              k: 1
            }
          ]),
          $terraData.K("遠出の商いは控え、家の食料と種籾を先に守るよう頼む", {}, [
            1,
            "無理に町へ売りに出て荷を奪われるより、家で食べる分と来季の種を確実に手元へ残そうと家族を説得した。",
            {
              lifeGoal: {
                id: "bolivar-upland-cultivation-review",
                action: "complete",
                note: "家で食べる分と次の種を先に取り置くよう、家の人に頼んだ"
              },
              lifeSkill: {
                id: "bolivar-crop-planning",
                title: "作付けと収穫の記録",
                delta: 1,
                context: "家で使う分と次の種を確保してから考える希望を伝えた"
              },
              p: 1
            }
          ]),
          $terraData.K("市場向けの畑は広げず、軒先の花の手入れを続ける", {}, [
            1,
            "危ない時期に売り物の畑を広げるのはやめ、今年も石垣の脇で花を育てながら静かに暮らしたいと話した。",
            {
              lifeGoal: {
                id: "bolivar-upland-cultivation-review",
                action: "complete",
                note: "花を暮らしの楽しみとして残したいと話した"
              },
              lifeSkill: {
                id: "bolivar-garden-care",
                title: "花と作物の手入れ",
                delta: 1,
                context: "家庭で花を育て続ける区画の希望を伝えた"
              },
              p: 1
            }
          ])
        ]
      },
      {
        id: "cl_bolivar_crop_labor",
        conf: "S",
        references: ["SRC_CLASS_GENERAL"],
        st: ["青年", "壮年"],
        ge: { age: 18 },
        need: ["国:ボリバル"],
        once: true,
        w: 0.32,
        t: "刈り入れの手伝いに駆り出され、汗だくになって麻袋を荷車へ積み上げた。作業が終わると、帳面を持った男が取り分を量り始めた。自分の手元に残る袋は驚くほど少ない。",
        c: [
          $terraData.K("地主や仲買に引かれる分を確かめる", {}, [
            1,
            "誰がどれだけ持っていき、なぜこの手間賃になるのかを尋ねた。帰り道、肩に食い込む麻袋の軽さが気になった。",
            {
              k: 2,
              ...$terraData.CFX("harvest_terms", "収穫と徴収・取引の条件を区別して記録した", {
                view: "働いて得た物の行き先を確かめたい"
              })
            }
          ]),
          $terraData.K("まず家族の腹を満たす分を傷む前に手当てする", {}, [
            1,
            "受け取った分を急いで家へ運び、湿気で傷まないよう風通しのいい棚へ広げた。売る余裕はないが、しばらくは家族が食べられる。",
            { rl: 1, p: 1, ...$terraData.CFX("food_security", "収穫物を家庭の食料として確保した") }
          ]),
          $terraData.K("畑仕事に見切りをつけ、別の稼ぎ口を探す", {}, [
            1,
            "泥を洗い落としながら、来季の畑仕事は断ろうと決めた。町場の荷役や工房に空きがないか聞き込みを始めた。",
            { k: 1, ...$terraData.CFX("career_search", "農作業とは別の生業を検討した") }
          ])
        ]
      },
      {
        id: "cl_kazdel_displacement_history",
        conf: "S",
        references: ["SRC_CLASS_KAZDEL", "SRC_TL_DARKNIGHTS"],
        st: ["少年", "青年", "壮年"],
        ge: { age: 13, year: 1090 },
        le: { year: 1090 },
        need: ["国:カズデル"],
        once: true,
        w: 0.32,
        t: "カズデルの市場の軒下で、かつての戦功をまくし立てる男が宿の主人に寝床代を掛け合っていた。すぐ脇では、着の身着のままで逃げてきた家族が荷車から古着を出し、小銭に換えようとしている。",
        c: [
          $terraData.K("避難してきた人たちに声をかけ、日雇いや空き部屋の当てを探す", {}, [
            1,
            "荷車のそばで事情を聞き、人手を募集していた作業場と相部屋の宿を教えた。礼を言われ、乾いたパンを半分分け合った。",
            {
              rl: 2,
              ...$terraData.CFX("displacement_network", "離散した住民の生活上の必要と相談先を確かめた", {
                opportunity: "相談先を調べ、連絡先を伝えた",
                view: "過去の肩書だけで今の暮らしを判断しない"
              })
            }
          ]),
          $terraData.K("男の語る戦場と、今この町で起きている現実を見比べる", {}, [
            1,
            "男が誇る昔の武勇伝と、目の前で古着を売る避難民の姿を静かに見比べた。どちらがカズデルの今なのかは、聞くまでもなかった。",
            {
              k: 2,
              ...$terraData.CFX(
                "memory_record",
                "カズデルの来歴について本人の記憶・伝聞・自分で確認した範囲を区別して記録"
              )
            }
          ]),
          $terraData.K("首を突っ込まず、自分の仕事へ戻る", {}, [
            1,
            "どの顔にも見覚えはない。視線を外し、自分の食い扶持を稼ぐために仕事場へ足を速めた。",
            { p: 1, ...$terraData.CFX("daily_distance", "過去の身分や戦歴の話から距離を置いた") }
          ])
        ]
      },
      {
        id: "cl_legacy_network_followup",
        conf: "S",
        references: $terraData.CLASS_REFS,
        st: ["青年", "壮年"],
        ge: { age: 18 },
        after: { id: "cl_family_legacy_expectation", min: 3 },
        need: ["旧家・領主層に縁がある生家"],
        once: true,
        w: 0.38,
        t: "数年前に話題にのぼった一族の来歴を、久しぶりに集まった親族と振り返った。昔の称号を今なお誇らしげに語る叔父もいれば、土地を追われるたびに職を失ったと苦笑する従兄もいる。それで今の暮らしが楽になるわけではなかった。",
        c: [
          $terraData.K("昔の格式は措いて、今の仕事や家計の助け合いを話し合う", {}, [
            1,
            "見栄を張るのをやめ、互いの懐具合や仕事のつてを率直に打ち明けた。大金は動かせなくても、困った時に頼れる顔ぶれがはっきりした。",
            {
              rl: 2,
              ...$terraData.CFX("legacy_revisit", "旧家の縁を現在の生活に合わせて見直した", {
                opportunity: "相談先を再確認"
              })
            }
          ]),
          $terraData.K("一族の集まりから距離を置き、自分の足で暮らす", {}, [
            1,
            "過ぎた代の栄光を語り合う席を早めに辞した。親族とは季節の便りを交わすだけにして、今の仕事に精を出すことにした。",
            {
              p: 1,
              ...$terraData.CFX("independent_life", "家柄による期待から距離を取った", {
                view: "今の生活は自分で選び直せる"
              })
            }
          ]),
          $terraData.K("散り散りになった一族の足取りを後の世代へ残す", {}, [
            1,
            "古い屋敷の記憶から各地へ流れた親族の消息までを一冊にまとめた。誇張された昔話ではなく、生きた人間の足跡として棚に収めた。",
            { k: 2, ...$terraData.CFX("archive_handover", "家の来歴を記録として残した") }
          ])
        ]
      },
      {
        id: "cl_training_long_term",
        conf: "S",
        references: $terraData.CLASS_REFS,
        st: ["青年", "壮年"],
        ge: { age: 20 },
        after: { id: "cl_columbia_school_fee", min: 3 },
        need: ["国:クルビア"],
        once: true,
        w: 0.36,
        t: "街角で再び技能講習の募集を見かけた。働き始めて数年、泥のように疲れて帰り、机に向かう気力さえない夜も多い。現場で身につけた腕を自分で磨くか、今からでも通える夜間講習を探すか、立ち止まって考えた。",
        c: [
          $terraData.K("これまで現場で体で覚えた段取りを振り返る", {}, [
            1,
            "高い講習料を払わなくても、現場で失敗しながら覚えた勘所がいくつもある。自分の手でできる仕事の範囲を改めて確かめた。",
            {
              k: 2,
              lifeSkill: {
                id: "class-work-skill",
                title: "職場で積んだ技能の整理",
                delta: 2,
                context: "これまでの仕事を記録した"
              },
              ...$terraData.CFX("practical_learning", "実務の中で学んだことを整理した")
            }
          ]),
          $terraData.K("今の稼ぎで無理なく通える講習を探し直す", {}, [
            1,
            "昔は手が届かなかったが、今なら分割で払える短期の講座があるかもしれない。休みの日に通える場所をいくつか当たってみた。",
            {
              k: 1,
              ...$terraData.CFX("second_chance", "数年後に学び直しの条件を確かめた", {
                opportunity: "再検討"
              })
            }
          ]),
          $terraData.K("無理をせず、今の暮らしと体を守る", {}, [
            1,
            "これ以上睡眠を削れば体がもたない。貼り紙の前を離れ、今夜は温かい食事をとって早く眠ることにした。",
            { p: 1, ...$terraData.CFX("deferred_learning", "今は生活の安定を優先した") }
          ])
        ]
      },
      {
        id: "cl_social_mobility_reflection",
        conf: "S",
        references: $terraData.CLASS_REFS,
        st: ["壮年", "老年"],
        ge: { age: 40 },
        need: ["生活階層が変化した経験"],
        once: true,
        w: 0.28,
        t: "ふとした拍子に、昔とは暮らし向きが大きく変わった年月のことを思い返した。小銭を数えて眠れなかった夜や、初めて新しい部屋に荷を入れた日の匂いがよみがえる。",
        c: [
          $terraData.K("若い世代に、暮らしが変わった頃の経験を語る", {}, [
            1,
            "押しつけにならないよう気をつけながら、かつて自分がどうやって食い繋ぎ、何を選んだかを若い仲間に話して聞かせた。",
            {
              rl: 2,
              lifeSkill: {
                id: "class-mentoring",
                title: "生活上の経験を伝える",
                delta: 2,
                context: "若い人と暮らしの変化について話した"
              },
              ...$terraData.CFX("intergenerational_support", "暮らしの変化を若い人へ伝えた", {
                view: "選べる道を次の人へ残したい"
              })
            }
          ]),
          $terraData.K("昔を懐かしみながら、静かに湯を沸かして過ごす", {}, [
            1,
            "湯気の立つ茶をすすりながら、よくここまで生き抜いてきたものだと息をついた。張り詰めていた肩の力がすっと抜けていく。",
            { p: 2, ...$terraData.CFX("life_balance", "暮らしの変化を振り返り休息を優先した") }
          ]),
          $terraData.K("移り変わった家計と暮らしの足取りを振り返る", {}, [
            1,
            "当時の古い領収書や家計の控えをめくり、自分がどんな坂を上り下りしてきたのかを静かに辿り直した。",
            { k: 1, ...$terraData.CFX("mobility_archive", "階層移動の経験と条件を記録した") }
          ])
        ]
      },
      {
        id: "cl_neighbors_crossclass",
        conf: "S",
        references: $terraData.CLASS_REFS,
        st: ["青年", "壮年", "老年"],
        ge: { age: 19 },
        once: true,
        w: 0.24,
        t: "路地の排水溝と石畳が傷み、懐具合も職業もまちまちな近所の連中が顔を揃えた。金を出し合うか、汗を流して自分たちで直すかで、言い合いが堂々巡りになっている。",
        c: [
          $terraData.K("金のない家は手を動かし、余裕のある家は資材を出す案をまとめる", {}, [
            1,
            "自分が使える工具と休日の時間を申し出て、無理のない分担を提案した。話がまとまり、さっそく路地の隅に砂利とシャベルを運び込んだ。",
            {
              rl: 2,
              fl: { cl_neighborhood_mutual: 1 },
              ...$terraData.CFX("crossclass_cooperation", "異なる家計の住民へ修繕の分担を提案した", {
                view: "それぞれの負担を確かめて協力したい"
              })
            }
          ]),
          $terraData.K("そもそも家主や都市の管理部門が直すべき場所ではないか調べる", {}, [
            1,
            "住民同士で揉める前に、区画の管理規約と修繕義務が誰にあるのかを突き止めた。交渉に行くための材料が揃った。",
            { k: 2, ...$terraData.CFX("civic_rights", "共同設備の管理責任を調べた") }
          ]),
          $terraData.K("深入りせず、その場を離れる", {}, [
            1,
            "他人の懐具合が絡む揉め事には首を突っ込まない方がいい。ぬかるみを避けて歩きながら、自分の部屋へ戻った。",
            { p: 1, ...$terraData.CFX("daily_priority", "共同作業への参加を見送った") }
          ])
        ]
      },
      {
        id: "cl_neighborhood_after",
        conf: "S",
        references: $terraData.CLASS_REFS,
        st: ["壮年", "老年"],
        ge: { age: 32 },
        after: { id: "cl_neighbors_crossclass", min: 5 },
        once: true,
        w: 0.25,
        t: "かつて近所の連中と路地の修繕で揉めたり汗を流したりしてから、ずいぶん年月が経った。引っ越して行った顔も多く、石畳の継ぎ目を見るたびにあの頃の声を思い出す。",
        c: [
          $terraData.K("あの頃一緒に動いた旧知へ、久しぶりに便りを出す", {}, [
            1,
            "古い住所録を頼りに手紙を書いた。あの路地が今も残っていることを書き添えると、懐かしい顔が次々に浮かんだ。",
            { rl: 1, ...$terraData.CFX("community_memory", "共同作業の縁を後年に確かめた") }
          ]),
          $terraData.K("新しく越してきた住人に、当時の修繕の経緯を教えておく", {}, [
            1,
            "次にまた排水溝が詰まった時に困らないよう、どこをどう直したか、管理先はどこかを新しい隣人へ伝えておいた。",
            { k: 1, ...$terraData.CFX("community_handover", "住居区画の修繕をめぐる記録を引き継いだ") }
          ]),
          $terraData.K("懐かしい記憶として胸にしまい、日常へ戻る", {}, [
            1,
            "直した石畳の上を一歩踏みしめ、特に誰へ話すでもなく買い物かごを提げて歩き出した。",
            { p: 1, ...$terraData.CFX("memory_private", "近隣の記憶を個人的に残した") }
          ])
        ]
      }
    ],
    false
  );

  $define(
    "CLASS_LOCALITY_ACTIONS",
    {
      cl_kazimierz_sponsorship: [
        ["jobs", "information", "競技会場の裏方求人条件を照会した"],
        ["commerce", "information", "興行が会場周辺の商いに与える影響を聞いた"],
        ["jobs", "defer", "紹介を見送り現在の仕事へ戻った"]
      ],
      cl_siracusa_market_patron: [
        ["market", "work", "市場の帳簿仕事を手伝った"],
        ["market", "information", "店主から仕入れと支払いの事情を聞いた"],
        ["jobs", "withdraw", "市場の手伝いを断り別の仕事を探した"]
      ],
      cl_yerag_community_vote: [
        ["community", "mediate", "共同作業の希望と負担を聞いた"],
        ["transport", "information", "山間の道や荷運びの状態を尋ねた"],
        ["community", "procedure", "割り当てられた当日の作業を終えた"]
      ],
      cl_sargon_trade_water: [
        ["water", "information", "水場を使う家ごとの事情を聞いた"],
        ["water", "aid", "水運びや設備の手入れを手伝った"],
        ["water", "withdraw", "水の利用順をめぐる交渉には加わらなかった"]
      ],
      cl_bolivar_crop_labor: [
        ["agriculture", "information", "収穫物の分け方と取引予定を記録した"],
        ["food", "aid", "収穫物から家の食料を確保した"],
        ["jobs", "information", "農作業以外の求人を探し始めた"]
      ],
      life_bolivar_upland_crops: [
        ["agriculture", "plan", "食料用作物を残して商品作物を小さく試す計画を選んだ"],
        ["food", "plan", "家で使う食料と次の種を先に残す方針を選んだ"],
        ["culture", "practice", "花を個人の楽しみとして育てる区画を残した"]
      ],
      life_bolivar_harvest_review: [
        ["agriculture", "record", "自分の観察と近隣からの伝聞を区別した"],
        ["food", "plan", "食料と種を優先する作付け方針を選んだ"],
        ["culture", "practice", "市場向けの拡大を見送り花の区画を残した"]
      ],
      cl_neighbors_crossclass: [
        ["infrastructure", "aid", "近隣の異なる家計の人々と修繕作業を相談した"],
        ["infrastructure", "information", "共同設備の費用と管理責任を調べた"],
        ["community", "defer", "今回は共同作業を見送った"]
      ],
      cl_neighborhood_after: [
        ["community", "followup", "以前の共同作業に関わった人の近況を尋ねた"],
        ["community", "handover", "以前の共同作業の記録を今の住民へ引き継いだ"],
        ["community", "withdraw", "過去の近隣関係を思い出し今の生活を優先した"]
      ]
    },
    false
  );

  for (const [id, rows] of Object.entries($terraData.CLASS_LOCALITY_ACTIONS)) {
    const event = $terraData.classEvents.find(row => row.id === id);
    if (!event || event.c.length !== rows.length) throw Error("地域行動の記録表が一致しない: " + id);
    for (const [i, [kind, action, description]] of rows.entries()) {
      const choice = event.c[i];
      if (choice.o.length !== 1 || choice.o[0][2].localityAction)
        throw Error("地域行動の結果枝が不正: " + id + "@" + i);
      choice.o[0][2].localityAction = { kind, action, description };
    }
  }

  $terraData.EV.push(...$terraData.classEvents);

  for (const [id, label] of Object.entries({
    cl_legacy_contact: "旧家の縁の連絡先",
    cl_rent_recorded: "住居費の内訳を確認",
    cl_housing_search: "住まいの情報を調査",
    cl_neighborhood_mutual: "近隣と共同作業",
    cl_local_petition: "地区設備の改善について意見を提出",
    cl_school_report: "学校で家柄による扱いを相談",
    cl_tara_documented: "訛りによる窓口での扱いを記録",
    cl_kazimierz_job_contact: "競技会場の仕事紹介先",
    cl_apprentice_lead: "見習い募集の問い合わせ先"
  }))
    $terraData.FLAG_REGISTRY[id] = {
      label,
      description: "出自・階層に関連する本人の経験。社会全体で成立した制度や採用の確定を意味しない。",
      type: "boolean",
      valueDomain: "0/1",
      lifecycle: "本人の生涯に残る個別経験",
      source: "ゲーム用仮定：SRC_CLASS_GENERAL",
      engine: "階級・社会移動イベント",
      tags: [],
      producers: [],
      clearers: [],
      consumers: [],
      engineClearers: []
    };

  $terraData.EV.push(
    {
      id: "local_food_shortage",
      conf: "S",
      references: ["SRC_LOCALITY_TW", "SRC_LOCALITY_GAME"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["地域の供給が不安定"],
      cd: 5,
      w: 0.65,
      t: "市場の棚は歯が抜けたように空いていた。荷馬車や輸送便がいつ着くかは日によってまちまちで、店主も首を振るばかりだ。財布の底の硬貨を指で数えながら、今日何を買って帰るか思案した。",
      c: [
        $terraData.K("店主に代わりの食材や次の荷が着く日を尋ねる", {}, [
          1,
          "いつも買う粉の代わりに日持ちする根菜や乾物を教わり、次の荷が入る曜日を確かめて買い物かごへ入れた。",
          {
            k: 1,
            localityAction: {
              kind: "food",
              action: "information",
              description: "代わりの商品と入荷予定を調べた"
            }
          }
        ]),
        $terraData.K("今月の出費を引き締め、腹にたまる物だけに絞る", {}, [
          1,
          "嗜好品や高い肉には手を伸ばさず、塩と穀物だけを袋に詰めた。しばらくは質素な鍋でしのぐしかない。",
          { p: -1, localityAction: { kind: "food", action: "budget", description: "家計の買い物を調整した" } }
        ]),
        $terraData.K("足の悪い近所の人の分まで買い出しを手伝う", {}, [
          1,
          "ついでだからと隣家の袋も引き受け、石畳の道を両手に荷を提げて帰った。戸口で手渡すと、何度も礼を言われた。",
          {
            rl: 2,
            localityAction: { kind: "food", action: "aid", description: "近所の人の買い物を手伝った" }
          }
        ])
      ]
    },
    {
      id: "local_medical_capacity",
      conf: "S",
      references: ["SRC_LOCALITY_TW_MOURN", "SRC_LIFE_ENDING_LW03", "SRC_LOCALITY_GAME"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["地域の診療が逼迫"],
      cd: 5,
      w: 0.6,
      t: "診療所の戸口に『急患優先のため、通常の診察は別日になる場合があります』と木の札が下がっていた。待合いの長椅子はすでに人で埋まっている。もし夜中に自分や家族が熱を出したら、どこを頼ればいいだろう。",
      c: [
        $terraData.K("夜間や急病の時に診てもらえる窓口を確かめておく", {}, [
          1,
          "手が空いた受付係をつかまえ、急病の時に駆け込める時間と、薬だけ受け取れる曜日を確かめておいた。",
          {
            k: 1,
            localityAction: {
              kind: "medical",
              action: "information",
              description: "受診窓口と緊急時の連絡方法を尋ねた"
            }
          }
        ]),
        $terraData.K("一人では通院しづらい近所の人に声をかけておく", {}, [
          1,
          "足元の覚束ない隣人を訪ね、診療所へ行く日は肩を貸すから遠慮なく言ってほしいと伝えた。",
          {
            rl: 2,
            localityAction: { kind: "medical", action: "aid", description: "通院の付き添いについて相談した" }
          }
        ]),
        $terraData.K("医者にかからずに済むよう、無理な予定を減らして体を休める", {}, [
          1,
          "今ここで寝込むわけにはいかない。急がない外回りを後回しにし、早めに毛布へくるまって体を温めた。",
          {
            h: 1,
            localityAction: { kind: "medical", action: "rest", description: "休息と健康記録を優先した" }
          }
        ])
      ]
    },
    {
      id: "local_jobs_pressure",
      conf: "S",
      references: ["SRC_LOCALITY_GAME", "SRC_LOCALITY_VICTORIA"],
      st: ["青年", "壮年", "老年"],
      need: ["地域の働き口が減少"],
      cd: 6,
      w: 0.55,
      t: "近くの工場も商店も人を減らし、街角の求人板から募集の紙がめっきり減った。剥がされた跡ばかりが目立つ板の前で、数か月先の暮らしをどう繋ぐか立ち尽くした。",
      c: [
        $terraData.K("日雇いや短期でも入れる仕事の条件を洗い出す", {}, [
          1,
          "残っている求人票を隅から隅まで読み、自分の腕で今すぐ潜り込める現場と日当の相場を確かめた。",
          { k: 2, localityAction: { kind: "jobs", action: "information", description: "求人条件を調べた" } }
        ]),
        $terraData.K("出費を詰めながら、条件の合う空きが出るのを待つ", {}, [
          1,
          "焦って無理な現場へ入っても体を壊すだけだ。日々の食事と出費を切り詰め、毎朝求人板を見回ることにした。",
          {
            p: 1,
            localityAction: { kind: "jobs", action: "stay", description: "次の募集を待つことにした" }
          }
        ]),
        $terraData.K(
          "顔なじみに、まだ人を雇っている現場がないか尋ねる",
          {},
          [
            1,
            "近所の仕事仲間や商店の知人を訪ね、人手を探している現場がないか相談した。今すぐ雇える場所はなくとも、互いの顔を見て話すだけで少し肩の力が抜けた。",
            {
              rl: 1,
              localityAction: { kind: "jobs", action: "network", description: "知人と仕事の見通しを話した" }
            }
          ]
        )
      ]
    },
    {
      id: "local_housing_pressure",
      conf: "S",
      references: ["SRC_LOCALITY_TW", "SRC_LOCALITY_GAME"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["地域で住居を確保しにくい"],
      cd: 7,
      w: 0.48,
      t: "界隈では空き部屋が出てもその日のうちに埋まるようになり、家主たちも強気な家賃を吹っかけるようになった。手元の契約書を見返し、次の更新月がいつだったか指を折った。",
      c: [
        $terraData.K("更新時の値上げ幅や、よその家賃相場を調べておく", {}, [
          1,
          "今の部屋を更新するといくら跳ね上がるか、他所へ移るなら敷金がいくら要るかを洗い出し、出ていく金の重さにため息をついた。",
          {
            k: 1,
            localityAction: {
              kind: "housing",
              action: "information",
              description: "契約・家賃・空き部屋を調べた"
            }
          }
        ]),
        $terraData.K("見かけた空き部屋の貼り紙を、宿を探している知人へ教える", {}, [
          1,
          "路地裏でまだ剥がされていない貸間の札を見つけ、部屋を追い出されそうだとこぼしていた知人へ急いで知らせた。",
          { rl: 2, localityAction: { kind: "housing", action: "aid", description: "住居情報を知人へ伝えた" } }
        ]),
        $terraData.K("多少手狭でも、当面は今の部屋にしがみつく", {}, [
          1,
          "壁の隙間風や天井の染みには目をつぶり、しばらくは今の住まいを動かないと決めた。引っ越し荷物をまとめる手間も金も惜しい。",
          {
            p: 1,
            localityAction: { kind: "housing", action: "stay", description: "現住所にとどまる方針を選んだ" }
          }
        ])
      ]
    },
    {
      id: "local_transport_pressure",
      conf: "S",
      references: ["SRC_LOCALITY_TW", "SRC_LOCALITY_OFFICIAL", "SRC_LOCALITY_GAME"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["地域の移動や物流が滞る"],
      cd: 5,
      w: 0.64,
      t: "乗り合い便も荷馬車も遅れが常態化し、停留所の時刻表はあってないようなものになっていた。吹きっさらしの乗り場で足を踏み鳴らしながら、今日の用事をどう回るか頭の中で組み直した。",
      c: [
        $terraData.K("便の遅れを見越して、普段よりずっと早く家を出る", {}, [
          1,
          "停留所の係員に今日の運行具合を聞き、回り道になることも覚悟してまだ薄暗いうちから歩き出した。",
          {
            k: 1,
            localityAction: { kind: "transport", action: "information", description: "運行情報を確かめた" }
          }
        ]),
        $terraData.K("近所の人と声を掛け合い、買い出しや荷受けを一度で済ませる", {}, [
          1,
          "同じ方角へ用事がある隣人と相談し、重たい荷物の受け取りや買い物を手分けして回ることにした。",
          { rl: 2, localityAction: { kind: "transport", action: "aid", description: "近所と用事を調整した" } }
        ]),
        $terraData.K("今日でなくていい外出は諦め、別の日へ回す", {}, [
          1,
          "いつ来るかも分からない便を待つのはやめて、先方に断りを入れて家へ引き返した。浮いた時間で溜まっていた家事を片づけた。",
          {
            p: 1,
            localityAction: { kind: "transport", action: "defer", description: "不要不急の移動を見送った" }
          }
        ])
      ]
    },
    {
      id: "local_recovery_choices",
      conf: "S",
      references: ["SRC_LOCALITY_TW", "SRC_LOCALITY_VICTORIA", "SRC_LOCALITY_GAME"],
      st: ["青年", "壮年", "老年"],
      need: ["地域で復旧作業が続く"],
      cd: 9,
      w: 0.7,
      t: "崩れた外壁や歪んだ配管の応急処置が、通りのあちこちで続いていた。閉まっていた工房も半分だけ戸を開け始めている。近所の瓦礫片づけに手を貸すか、復旧の日雇いを探すか、まず自分の家の修繕を急ぐか。",
      c: [
        $terraData.K("無理のない範囲で、近所の瓦礫片づけに手を貸す", {}, [
          1,
          "軍手をはめて表へ出て、割れた板や曲がった金具を荷車へ運んだ。重すぎる梁には手を出さず、大工の後ろで釘や工具を手渡した。",
          {
            rl: 2,
            h: -1,
            localityAction: { kind: "recovery", action: "aid", description: "復旧作業の一部を手伝った" }
          }
        ]),
        $terraData.K("復旧現場の求人を見て、日当と安全装備を確かめる", {}, [
          1,
          "人手を集めている現場監督に声をかけ、どんな作業で防塵具やヘルメットが支給されるのかを確かめた。",
          {
            k: 2,
            localityAction: {
              kind: "recovery",
              action: "information",
              description: "復旧作業の求人と防護条件を調べた"
            }
          }
        ]),
        $terraData.K("よその手伝いより、まず自分の家と商売道具を立て直す", {}, [
          1,
          "傾いた自宅の棚に添え木を当て、仕事に使う道具の錆を落とした。窓の外では、まだ一日中槌音が響いている。",
          {
            p: 1,
            localityAction: { kind: "recovery", action: "self", description: "家庭と生業の再建を優先した" }
          }
        ])
      ]
    },
    {
      id: "local_support_followup",
      conf: "S",
      references: ["SRC_LOCALITY_GAME", "SRC_LIFE_ENDING_LW02"],
      st: ["青年", "壮年", "老年"],
      need: ["地域で誰かを手伝った"],
      after: { id: "local_food_shortage", min: 2 },
      once: true,
      w: 0.75,
      t: "かつて市場の棚が空っぽだった頃に買い出しを手伝った隣人と、市場の入口でばったり顔を合わせた。今は野菜も穀物も山積みに戻っている。互いに買い物かごを足元に置き、しばし立ち話をした。",
      c: [
        $terraData.K("その後の体調や暮らしぶりを聞き、また何かあれば声をかけてと言う", {}, [
          1,
          "あの時は本当に助かったと笑う相手に、次に重い粉や薪を買う日も遠慮なく呼んでくれと伝えた。",
          {
            rl: 2,
            localityAction: {
              kind: "social",
              action: "followup",
              description: "かつて買い物を手伝った相手と再会した"
            }
          }
        ]),
        $terraData.K("互いの無事を喜び、笑顔で挨拶を交わして別れる", {}, [
          1,
          "『お互い、生き延びてよかったな』と短く言葉を交わし、人混みの中をそれぞれの家路へ戻った。",
          { p: 1, localityAction: { kind: "social", action: "brief", description: "近所の人と再会した" } }
        ])
      ]
    },
    {
      id: "local_medical_followup",
      conf: "S",
      references: ["SRC_LOCALITY_GAME", "SRC_LIFE_ENDING_LW03"],
      st: ["青年", "壮年", "老年"],
      need: ["地域の医療相談を調べた"],
      after: { id: "local_medical_capacity", min: 2 },
      once: true,
      w: 0.78,
      t: "以前、診療所がごった返していた頃に受診の手順を調べておいたことがあった。今日、具合の悪そうな近所の人から『どこへ行けば診てもらえるだろう』と心細そうに尋ねられた。",
      c: [
        $terraData.K("今の診療時間が変わっていないか確かめてから教えてあげる", {}, [
          1,
          "うろ覚えで無駄足を踏ませないよう、いったん診療所の表まで走って今の受付時間を確かめ、相手へ詳しく伝えた。",
          {
            k: 1,
            rl: 1,
            localityAction: { kind: "medical", action: "followup", description: "案内を確認し直して伝えた" }
          }
        ]),
        $terraData.K("自分が知っている頃の場所と時間を伝え、窓口で聞くよう勧める", {}, [
          1,
          "以前聞いた時の曜日と道順を教え、念のため受付で直接確かめてみてほしいと添えた。",
          {
            rl: 1,
            localityAction: { kind: "medical", action: "defer", description: "窓口への直接の確認を勧めた" }
          }
        ])
      ]
    }
  );
});
