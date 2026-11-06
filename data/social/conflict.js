// social/conflict: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("social/conflict", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "v78refs",
    ["SRC_V78_TARA_IDENTITY", "SRC_V78_SAN_SAR", "SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
    false
  );

  $terraData.EV.push(
    {
      id: "v78_identity_home_language",
      conf: "S",
      references: ["SRC_V78_TARA_IDENTITY", "SRC_V78_SOCIAL_DESIGN"],
      st: ["少年", "青年", "壮年"],
      once: true,
      w: 0.77,
      show: s => !!s.culturalIdentity?.homeLanguage,
      t: "家の中では親から教わった昔ながらの言葉で喋っていたが、一歩外へ出て役所の書類を開くと、よそ行きの硬い言い回しばかりが並んでいた。窓口で一行ずつ指で追いながら、二つの言葉の隔たりを感じた。",
      c: [
        $terraData.K(
          "家の言葉を文字でも残せるよう教わる",
          {
            en: { ge: { literacy: 20 } },
            why: "文字に起こすには、もう少し読み書きに慣れておく必要がある。"
          },
          [
            1,
            "親の横に座り、家でしか使わない言い回しをどう綴るのか教わった。古い呼び名のわきに、馴染みのある意味を書き添えていく。",
            {
              identityAction: { type: "learn-language", note: "家庭言語の表記を学ぶ" },
              languageAction: { type: "learn", languageId: "taran_heritage", mode: "write", amount: 12 },
              literacyGain: 2,
              k: 1
            }
          ]
        ),
        $terraData.K("耳で聞いたまま、食卓の言葉を覚える", {}, [
          1,
          "夕飯の席で年寄りが口にする古い言い回しに耳を傾け、その意味を尋ねた。返ってきた言葉には、今の地図には載っていない村の名が混じっていた。",
          {
            identityAction: { type: "practice", note: "言葉を口承として覚える" },
            languageAction: { type: "learn", languageId: "taran_heritage", mode: "listen", amount: 8 },
            p: 1
          }
        ]),
        $terraData.K("今は目の前の手続きを済ませる", {}, [1, "難しい書類仕事だけをどうにか片づけて家へ戻った。湯気の立つ食卓では、今日もいつもの言葉が飛び交っていた。", {}])
      ]
    },
    {
      id: "v78_taran_office_language",
      conf: "S",
      references: ["SRC_V78_TARA_IDENTITY", "SRC_V78_SOCIAL_DESIGN"],
      st: ["少年", "青年", "壮年"],
      cd: 9,
      w: 0.67,
      show: s => s.res.n === "ヴィクトリア" && s.culturalIdentity?.affiliation === "ターラー系",
      t: "窓口の職員は、あなたの口から出たターラーの訛りに気づいた途端、露骨に態度を硬化させた。後ろの列から「その訛りじゃ書類も読めまい」と忍び笑いが漏れる。申請書を差し出しても、用件より先に出自を答えろと突き返された。",
      c: [
        $terraData.K(
          "規定の書式を示し、不当な扱いを問い質す",
          {
            en: {
              lang: {
                language: "victorian",
                mode: "read",
                threshold: 35,
                register: "administrative",
                alternatives: ["interpreter", "helper"]
              }
            },
            why: "窓口の行政文書と書式を正確に読み解く力がまだ足りない。"
          },
          [
            0.45,
            "職員は舌打ちしながらも書類を受け取った。背後の嘲笑は止まなかったが、窓口から追い返されることだけは免れた。",
            {
              identityAction: { type: "ask-records", note: "手続きの違いを照会" },
              languageAction: {
                encounter: { context: "administrative-office", outcome: "questioned-with-accent", accentNoticed: true }
              },
              p: -2,
              k: 1
            }
          ],
          [
            1,
            "「出直してこい」とつっけんどんに突き返され、次の番号が呼ばれた。半日分の稼ぎを棒に振り、握りしめた申請書には深い皺が寄った。",
            {
              socialConflictAction: { action: "report-harm", target: "taran", context: "language-office" },
              languageAction: {
                encounter: { context: "administrative-office", outcome: "rejected-with-accent", accentNoticed: true }
              },
              p: -5,
              cr: -2
            }
          ]
        ),
        $terraData.K("訛りを押し殺し、おとなしく従う", {}, [
          1,
          "喉の奥でいつものイントネーションを押し殺し、標準の言い回しで書類を出し直した。手続きは通ったものの、帰り道は誰とすれ違っても口を開く気になれなかった。",
          {
            identityAction: { type: "conceal", note: "窓口では言葉遣いを隠した" },
            languageAction: {
              type: "learn",
              languageId: "victorian",
              mode: "speak",
              amount: 3,
              encounter: { context: "administrative-office", outcome: "code-switched", accentNoticed: false }
            },
            p: -3
          }
        ]),
        $terraData.K("今日は引き返し、別の日に出直す", {}, [
          1,
          "これ以上晒し者にされる前に踵を返し、次の休みにまた来ることにした。重い足取りで役所を出ると、湿った風が頬に当たった。",
          {
            languageAction: {
              encounter: { context: "administrative-office", outcome: "postponed", accentNoticed: true }
            },
            p: -4
          }
        ])
      ]
    },
    {
      id: "v78_cultural_affiliation_claim",
      conf: "S",
      references: $terraData.v78refs,
      st: ["少年", "青年", "壮年", "老年"],
      once: true,
      w: 0.66,
      show: s => !!s.culturalIdentity?.affiliation && !s.culturalIdentity?.selfIdentification,
      t: "親戚が集まった席で、自分たちは何者として生きるのかという話になった。血筋の呼び名、生まれ育った土地、家で交わす言葉。どれも少しずつ食い違うなかで、お前はどこに根を置くのかと問われた。",
      c: [
        $terraData.K("親から受け継いだ呼び名を自分のものとして名乗る", {}, [
          1,
          "家で受け継いできた名と言葉を、自分の根っこだと口にした。役所の帳面がどうあれ、自分の立ち位置だけは定まった気がした。",
          { identityAction: { type: "affirm", note: "本人の自己認識を記録" }, p: 2 }
        ]),
        $terraData.K("どれか一つの呼び名には縛られないと答える", {}, [
          1,
          "家の記憶も今の暮らしも、どちらか片方は捨てられないと答えた。一つの看板に収まらない自分をそのまま引き受けることにした。",
          { identityAction: { type: "decline-label", note: "複数の帰属を選ぶ" }, p: 1 }
        ]),
        $terraData.K("外では自分の来歴を語らないことにする", {}, [
          1,
          "曖昧に笑って話を逸らし、大皿の料理へ手を伸ばした。帰り道、自分の生まれを打ち明ける相手は慎重に選ぼうと心に決めた。",
          { identityAction: { type: "conceal", note: "本人の意図による非開示" }, p: -1 }
        ])
      ]
    },
    {
      id: "v78_laterano_documents",
      conf: "S",
      references: ["SRC_V78_SAN_SAR", "SRC_V78_SOCIAL_DESIGN"],
      st: ["青年", "壮年", "老年"],
      cd: 9,
      w: 0.54,
      show: s => s.res.n === "ラテラーノ" && s.r.n === "サルカズ",
      t: "ラテラーノの役所で身分証を出すと、係員はあなたの角と書類を交互に見て「なぜこの街に居座っている」と冷たく問うた。市民登録の番号を出せと迫られ、後ろの列からは「サルカズは出て行け」と罵声が飛んだ。",
      c: [
        $terraData.K("手元の証明書で通る範囲を確かめる", {}, [
          1,
          "係員は無言で番号札を投げるように渡し、奥の別窓口へ行けと顎で示した。移動する背中に「余所者を入れるな」という声が容赦なく浴びせられた。",
          { identityAction: { type: "ask-records", note: "滞在根拠の照会" }, p: -2 }
        ]),
        $terraData.K("この列を離れ、話の通じる相談先を探す", {}, [
          1,
          "別の窓口の札を受け取ってその場を離れた。長い廊下へ出ても、「帰れ」という甲高い声は耳の奥にこびりついて離れなかった。",
          {
            socialConflictAction: {
              action: "report-harm",
              target: "sarkaz",
              context: "laterano-registration"
            },
            p: -4
          }
        ]),
        $terraData.K("書類を引っこめ、その場から立ち去る", {}, [
          1,
          "書類を受け取ってもらえないまま、逃げるように建物を出た。白い石畳の道を歩きながら、すれ違う人の視線がやけに恐ろしかった。",
          { p: -5 }
        ])
      ]
    },
    {
      id: "v78_hardline_infected_neighbor",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["青年", "壮年", "老年"],
      cd: 7,
      w: 0.78,
      show: s =>
        !s.inf && s.age >= 17 && s.biasInfected >= 75 && (s.socialLearning?.equityCommitment || 0) < 35,
      t: "感染者の隣人が、食料品店の前で足を止めていた。「あいつを中に入れるな！」と誰かが怒鳴り、通りの連中があなたの出方をうかがう。日頃から感染者を追い出せと息巻いてきた手前、ここで黙っていれば仲間内から白い目で見られる。",
      c: [
        $terraData.K(
          "店主に「感染者に物を売るな」と迫る",
          {},
          [
            0.75,
            "「感染者は客じゃないだろう」と声を荒らげた。店主は気まずそうに隣人の選んだ品を棚へ戻し、隣人は何も買えないまま空の袋を提げて去っていった。",
            {
              biasInf: 4,
              socialConflictAction: { action: "exclude", target: "infected", context: "shop-denial" },
              cr: 1
            }
          ],
          [
            1,
            "店主は首を横に振り、隣人に品物を渡した。店先にいた客たちが一斉にこちらを振り返り、ばつの悪い沈黙が落ちた。",
            {
              biasInf: 2,
              socialConflictAction: { action: "exclude", target: "infected", context: "shop-denial" },
              p: -3
            }
          ]
        ),
        $terraData.K("仲間と肩を並べて店の入口を塞ぐ", {}, [
          1,
          "入り口の前に立ちはだかり、隣人を睨みつけて追い返した。連中は囃し立てたが、翌日から通りの何人かはあなたと目を合わせなくなった。",
          {
            socialConflictAction: { action: "exclude", target: "infected", context: "coercive-boycott" },
            biasInf: 6,
            rl: -5
          }
        ]),
        $terraData.K("何も言わず、その場から立ち去る", {}, [
          1,
          "舌打ち一つ残して背を向け、足早に通りを離れた。背後の店先から、硬貨を数える小さな音と安堵の息が聞こえた。",
          { p: -1 }
        ])
      ]
    },
    {
      id: "v78_hardline_sarkaz_employer",
      conf: "S",
      references: ["SRC_V87_SARKAZ_HARDSHIP", "SRC_SR_REUNION_LATER", "SRC_V78_SOCIAL_DESIGN"],
      st: ["青年", "壮年"],
      cd: 8,
      w: 0.64,
      show: s =>
        s.r?.n !== "サルカズ" &&
        s.res?.n === "ヴィクトリア" &&
        s.job > 0 &&
        !!currentPlayerEmployment(s) &&
        s.biasSarkaz >= 75 &&
        (s.socialLearning?.equityCommitment || 0) < 35 &&
        s.lifeRecord?.affiliations?.some(
          a => a.kind === "employer" && ["active", "crisis"].includes(a.status)
        ) &&
        !s.lifeRecord?.workRelationships?.some(r => r.id === "victoria-sarkaz-interview"),
      t: "ヴィクトリアの仕事場に、サルカズの求職者が面接にやってきた。角と名前を見た瞬間、どんな腕前かも確かめないうちに「こいつは危ない」と決めつけていた。採用担当から、現場で一緒に働く身としてどう思うかと耳打ちされる。",
      c: [
        $terraData.K(
          "ろくな噂がないと吹き込み、採用に反対する",
          {},
          [
            0.65,
            "担当者はあなたの言葉を鵜呑みにし、その場で面接を打ち切った。求職者は無言で履歴書を折り畳み、踵を返して出ていった。",
            {
              socialConflictAction: { action: "exclude", target: "sarkaz", context: "employment" },
              lifeWorkRelationship: {
                id: "victoria-sarkaz-interview",
                action: "record-employment-exclusion",
                employerId: "current",
                decision: "excluded",
                applicantResponse: "left-after-exclusion"
              },
              fl: { ed_sarkaz_work_bias: 1 },
              biasSar: 5,
              cr: 1
            }
          ],
          [
            1,
            "採用担当は根拠のない噂話を退け、実務の基準だけで話を進めた。求職者が勤務時間や持ち場を熱心に尋ねる声が、仕切りの向こうから聞こえてきた。",
            {
              socialConflictAction: { action: "exclude", target: "sarkaz", context: "employment" },
              lifeWorkRelationship: {
                id: "victoria-sarkaz-interview",
                action: "record-employment-exclusion",
                employerId: "current",
                decision: "manager-overruled",
                applicantResponse: "asked-for-criteria"
              },
              rl: -4,
              cr: -2
            }
          ]
        ),
        $terraData.K("口出しはせず、控え室から席を外す", {}, [
          1,
          "余計な口は挟まずその場を離れた。仕切りの向こうで続くやり取りを聞きながら、角を見るだけで身構える自分の癖に苦いものを感じた。",
          {}
        ])
      ]
    },
    {
      id: "v87_hardline_sarkaz_employer_review",
      conf: "S",
      references: ["SRC_V87_SARKAZ_HARDSHIP", "SRC_SR_REUNION_LATER", "SRC_V78_SOCIAL_DESIGN"],
      st: ["青年", "壮年"],
      cd: 8,
      once: true,
      w: 0.38,
      show: s =>
        s.lifeRecord?.workRelationships?.some(
          r =>
            r.id === "victoria-sarkaz-interview" &&
            r.kind === "workplace-exclusion-case" &&
            !r.review &&
            s.year >= r.followupYear &&
            s.res?.n === r.region &&
            s.lifeRecord?.affiliations?.some(
              a => a.id === r.employer.id && a.kind === "employer" && ["active", "crisis"].includes(a.status)
            )
        ),
      t: s => {
        const row = s.lifeRecord.workRelationships.find(r => r.id === "victoria-sarkaz-interview");
        return `二年以上前、${row.person.nm}というサルカズの求職者が面接に来た日のことが、人手不足の現場で蒸し返された。あの人は当時、${row.applicantResponse === "left-after-exclusion" ? "噂話を理由に門前払いされた" : "採用基準を淡々と尋ねて帰った"}。採用担当は古い控えを机に広げ、今後もサルカズの応募者を同じように扱うつもりか、あなたの考えを聞いてきた。`;
      },
      c: [
        $terraData.K("当時の考えは変えず、同じ扱いを続ける", {}, [
          1,
          "「あの時の判断は間違っていない」と言い切った。担当者がめくった次の履歴書にも、またサルカズの名前があった。",
          {
            lifeWorkRelationship: {
              id: "victoria-sarkaz-interview",
              action: "review-employment-exclusion",
              employerId: "case-current",
              decision: "maintain"
            },
            socialConflictAction: {
              action: "exclude",
              target: "sarkaz",
              context: "employment-review-maintain"
            },
            biasSar: 2
          }
        ]),
        $terraData.K("あの時の話は一人限りのことだと線を引く", {}, [
          1,
          "あの場で口にした噂を、これから来る別のサルカズにまで当てはめるつもりはないと伝えた。担当者は頷き、新しい履歴書を机に並べた。",
          {
            lifeWorkRelationship: {
              id: "victoria-sarkaz-interview",
              action: "review-employment-exclusion",
              employerId: "case-current",
              decision: "narrow"
            },
            biasSar: -1
          }
        ]),
        $terraData.K("噂話で人を撥ねつけた当時の非を認める", {}, [
          1,
          "根も葉もない噂で人の働き口を奪おうとしたのは間違いだったと、遅ればせながら口にした。当時の苦い記憶が胸の奥で疼いた。",
          {
            lifeWorkRelationship: {
              id: "victoria-sarkaz-interview",
              action: "review-employment-exclusion",
              employerId: "case-current",
              decision: "contest"
            },
            biasSar: -2,
            cr: -1
          }
        ])
      ]
    },
    {
      id: "v78_prejudice_to_patient",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 1.1,
      show: s => {
        const shock = s.socialConflict?.infectionShock;
        return (
          !!s.inf &&
          !!s.fl?.dg &&
          !!shock &&
          (shock.priorBias >= 55 ||
            shock.priorActions > 0 ||
            shock.priorAvoids > 0 ||
            shock.priorPresence > 0 ||
            shock.priorEndorsement > 0) &&
          s.year - shock.year <= 9
        );
      },
      t: s => $rules.social.infectionPriorSummary(s.socialConflict?.infectionShock),
      c: [
        $terraData.K("「自分だけはあいつらとは違う」と言い張る", {}, [
          1,
          "「自分はそこらの感染者とは違う」と心に言い聞かせ、診断のことは誰にも漏らさなかった。袖口を深く引き下げ、次の診察日だけを頭に入れた。",
          {
            biasInf: 8,
            p: -7,
            socialConflictAction: { action: "betray", target: "infected", context: "internalized-stigma" }
          }
        ]),
        $terraData.K(
          "これまでの言動を恥じ、感染者を締め出す輪から抜ける",
          {
            en: { le: { biasInfected: 74 } },
              why: "長年染みついた感染者への嫌悪が抜けず、すぐには考えを改められない。"
          },
          [
            1,
            "これまでのように感染者を追い立てる話には、もう二度と加わらないと決めた。かつて自分が投げつけた言葉が、今になって自分の胸を刺していた。",
            {
              biasInf: -11,
              socialConflictAction: { action: "reconsider", target: "infected", context: "past-attitude" },
              lifeGoal: {
                id: "order-through-exclusion",
                action: "compromise",
                onlyIfActive: true,
                note: "診断後、排除によって秩序を守る目標を見直した"
              },
              p: -3,
              equityGain: 9
            }
          ]
        ),
        $terraData.K("余計なことは考えず、治療の段取りだけを進める", {}, [
          1,
          "受付で次の診察日だけを確かめて外へ出た。冷たい風の中を歩きながら、自分が昔、集まりで口にした罵り言葉を思い出していた。",
          { p: -3 }
        ])
      ]
    },
    {
      id: "v78_parent_rejection_diagnosis",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["少年", "青年", "壮年"],
      once: true,
      w: 0.8,
      show: s =>
        !!s.inf &&
        !!s.fl?.dg &&
        s.age >= 13 &&
        s.age <= 45 &&
        $rules.family.inSharedHousehold(s) &&
        [s.par?.fa, s.par?.mo].some(p => p && !p.d) &&
        !s.socialConflict?.familyBreach &&
        !!s.socialLearning?.familyNorms &&
        Number.isFinite(s.socialLearning.familyNorms.infected) &&
        s.socialLearning.familyNorms.infected >= 28,
      t: "鉱石病の診断が出たことを、同じ屋根の下で暮らす親に打ち明けるべきか迷っていた。薬代や通院のことを思えば隠し通すのも難しく、かといって追い出されるのも怖くて、玄関の前で何度も足が止まった。",
      c: [
        $terraData.K(
          "父と、住む家やこれからの通院について相談する",
          { show: s => !!s.par?.fa && !s.par.fa.d },
          [
            0.45,
            "父に通院先の診療所と診断の内容をその場で伝えた。父は顔を歪めて小さく頷いたが、このまま家に置いてくれるかどうかは最後まで口にしなかった。",
            {
              infectionAwarenessAction: { subject: "self", audience: "family", certainty: "confirmed", source: "self-disclosure", consent: "voluntary", recipientRef: "current-household-father" },
              closeKnowledgeAction: { kind: "father", action: "disclose" },
              fl: {
                infection_family_disclosed: 1,
                infection_family_recipient_father: 1
              },
              p: -4,
              socialConflictAction: [
                {
                  action: "family-distance",
                  target: "infected",
                  context: "diagnosis-related-family-distance",
                  personId: "father"
                },
                { action: "report-harm", target: "infected", context: "family-distance" }
              ]
            }
          ],
          [
            1,
            "父から「近所に知られたら終わりだ、出ていってくれ」と低い声で告げられた。身の回りの物だけを袋に詰め、逃げるように家を出た。",
            {
              infectionAwarenessAction: { subject: "self", audience: "family", certainty: "confirmed", source: "self-disclosure", consent: "voluntary", recipientRef: "current-household-father" },
              closeKnowledgeAction: { kind: "father", action: "disclose" },
              residenceArrangement: "independent_rental",
              fl: {
                infection_family_disclosed: 1,
                infection_family_recipient_father: 1,
                household_separated: 1
              },
              p: -12,
              rl: -5,
              socialConflictAction: {
                action: "family-rejected",
                target: "infected",
                context: "household",
                personId: "father"
              }
            }
          ]
        ),
        $terraData.K(
          "母と、住む家やこれからの通院について相談する",
          { show: s => !!s.par?.mo && !s.par.mo.d },
          [
            0.45,
            "母に通院先の診療所と診断の内容をその場で伝えた。母は顔を歪めて小さく頷いたが、このまま家に置いてくれるかどうかは最後まで口にしなかった。",
            {
              infectionAwarenessAction: { subject: "self", audience: "family", certainty: "confirmed", source: "self-disclosure", consent: "voluntary", recipientRef: "current-household-mother" },
              closeKnowledgeAction: { kind: "mother", action: "disclose" },
              fl: {
                infection_family_disclosed: 1,
                infection_family_recipient_mother: 1
              },
              p: -4,
              socialConflictAction: [
                {
                  action: "family-distance",
                  target: "infected",
                  context: "diagnosis-related-family-distance",
                  personId: "mother"
                },
                { action: "report-harm", target: "infected", context: "family-distance" }
              ]
            }
          ],
          [
            1,
            "母から「近所に知られたら終わりだ、出ていってくれ」と震える声で告げられた。身の回りの物だけを袋に詰め、逃げるように家を出た。",
            {
              infectionAwarenessAction: { subject: "self", audience: "family", certainty: "confirmed", source: "self-disclosure", consent: "voluntary", recipientRef: "current-household-mother" },
              closeKnowledgeAction: { kind: "mother", action: "disclose" },
              residenceArrangement: "independent_rental",
              fl: {
                infection_family_disclosed: 1,
                infection_family_recipient_mother: 1,
                household_separated: 1
              },
              p: -12,
              rl: -5,
              socialConflictAction: {
                action: "family-rejected",
                target: "infected",
                context: "household",
                personId: "mother"
              }
            }
          ]
        ),
        $terraData.K("今夜は家へ戻らず、一人で泊まれる場所を探す", {}, [
          1,
          "家の敷居を跨ぐことができず、今夜しのげる軒下や安宿を探して暗い通りを歩いた。窓の明かりを見上げるたび、親の顔が浮かんで足が重くなった。",
          {
            residenceArrangement: "independent_rental",
            fl: { household_separated: 1 },
            p: -9,
            rl: -3,
            socialConflictAction: [
              { action: "family-distance", target: "infected", context: "diagnosis-related-family-distance" },
              { action: "report-harm", target: "infected", context: "family-distance" }
            ]
          }
        ])
      ]
    },
    {
      id: "v87_family_contact_boundary_diagnosis",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["少年", "青年", "壮年"],
      once: true,
      w: 0.8,
      show: s =>
        !!s.inf &&
        !!s.fl?.dg &&
        s.age >= 13 &&
        s.age <= 45 &&
        !$rules.family.inSharedHousehold(s) &&
        [s.par?.fa, s.par?.mo].some(p => p && !p.d) &&
        !s.socialConflict?.familyBreach &&
        !!s.socialLearning?.familyNorms &&
        Number.isFinite(s.socialLearning.familyNorms.infected) &&
        s.socialLearning.familyNorms.infected >= 28,
      t: "離れて暮らす親に、鉱石病にかかったと知らせるべきか迷った。せめて診療所からの緊急連絡だけでも受け取ってもらえるよう頼むか、連絡先を書いた紙を開いては閉じた。",
      c: [
        $terraData.K(
          "父に、通院先からの連絡だけでも受けてくれと頼む",
          { show: s => !!s.par?.fa && !s.par.fa.d },
          [
            0.45,
            "父はしばらく黙り込んだあと、通院先からの連絡なら受け取ってもよいと答えた。直接会うことや付き添いについては、また別の機会に話すことになった。",
            { p: 1, rl: 1 }
          ],
          [
            1,
            "病名を口にした途端、父は「しばらく連絡はよこすな」と声を落とした。やり取りを終えたあとの静けさの中で、次の通院日を一人で確かめた。",
            {
              p: -5,
              rl: -2,
              socialConflictAction: [
                {
                  action: "family-distance",
                  target: "infected",
                  context: "diagnosis-related-family-contact-distance",
                  personId: "father"
                },
                { action: "report-harm", target: "infected", context: "family-contact-boundary" }
              ]
            }
          ]
        ),
        $terraData.K(
          "母に、通院先からの連絡だけでも受けてくれと頼む",
          { show: s => !!s.par?.mo && !s.par.mo.d },
          [
            0.45,
            "母はしばらく黙り込んだあと、通院先からの連絡なら受け取ってもよいと答えた。直接会うことや付き添いについては、また別の機会に話すことになった。",
            { p: 1, rl: 1 }
          ],
          [
            1,
            "病名を口にした途端、母は「しばらく連絡はよこすな」と声を落とした。やり取りを終えたあとの静けさの中で、次の通院日を一人で確かめた。",
            {
              p: -5,
              rl: -2,
              socialConflictAction: [
                {
                  action: "family-distance",
                  target: "infected",
                  context: "diagnosis-related-family-contact-distance",
                  personId: "mother"
                },
                { action: "report-harm", target: "infected", context: "family-contact-boundary" }
              ]
            }
          ]
        ),
        $terraData.K("親への連絡は保留し、通院のことは自分一人で抱える", {}, [
          1,
          "親には何も知らせないまま、自分の連絡先だけを診療所に届け出た。帰り道、ポケットの中の診察券を指先で強く握りしめた。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "v78_family_breach_recovery",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["青年", "壮年", "老年"],
      cd: 8,
      w: 0.7,
      show: s =>
        (!!s.socialConflict?.familyBreach && s.year - s.socialConflict.familyBreach.year >= 2) ||
        $rules.social.relevantSocialEpisodes(s).some(x => x.domain === "family" && x.status === "active"),
      t: s =>
        s.socialConflict?.familyBreach
          ? `${
              s.socialConflict.familyBreach.personRelation && s.socialConflict.familyBreach.personName
                ? `${s.socialConflict.familyBreach.personRelation}の${s.socialConflict.familyBreach.personName}から`
                : "家の人から"
            }鉱石病を理由に家を追い出されてから、ずいぶん月日が経った。${
              s.socialConflict.familyBreach.contactHistory?.length
                ? s.socialConflict.familyBreach.contactHistory.at(-1).outcome === "replied"
                  ? "前に送った便りには短い返事があったものの、当たり障りのない挨拶から先へは話が続かなかった。"
                  : "前に送った便りには、とうとう返事が来なかった。"
                : "実家の連絡先は知っていても、あれ以来こちらから便りを出す気にはなれなかった。"
            }ふとした拍子に二人分の食器を並べかけて、我に返って手を止める夜がまだあった。`
          : s.socialConflict?.experienced?.some(
                x => x.context === "diagnosis-related-family-contact-distance"
              )
            ? "別居中の親から「鉱石病の話はしばらく持ち出さないでくれ」と釘を刺されて以来、便りを書きかけては丸めて捨てる日が続いていた。"
            : "「お前がいると家族まで白い目で見られる」と部屋の鍵を変えられた日から、一度も実家の敷居を跨いでいない。ポストには診療所からの知らせだけが届いていた。",
      c: [
        $terraData.K(
          "父へ、近況と必要な用件だけ連絡してみる",
          {
            show: s =>
              !!s.socialConflict?.familyBreach?.personId &&
              s.socialConflict.familyBreach.personId === s.par?.fa?.id
          },
          [
            0.6,
            "父から短い返事が届いた。体の具合を気遣う一文はあったが、家を追い出した日のことには一言も触れていなかった。",
            {
              socialConflictAction: {
                action: "make-contact",
                target: "family",
                context: "after-rejection",
                personId: "father",
                contactOutcome: "replied"
              },
              p: 2
            }
          ],
          [
            1,
            "父へ便りを送ったが、何日待っても返事は来なかった。郵便受けを覗くのをやめ、冷めた湯を飲み干した。",
            {
              socialConflictAction: {
                action: "make-contact",
                target: "family",
                context: "after-rejection",
                personId: "father",
                contactOutcome: "no-reply"
              },
              p: -3
            }
          ]
        ),
        $terraData.K(
          "母へ、近況と必要な用件だけ連絡してみる",
          {
            show: s =>
              !!s.socialConflict?.familyBreach?.personId &&
              s.socialConflict.familyBreach.personId === s.par?.mo?.id
          },
          [
            0.6,
            "母から短い返事が届いた。体の具合を気遣う一文はあったが、家を追い出した日のことには一言も触れていなかった。",
            {
              socialConflictAction: {
                action: "make-contact",
                target: "family",
                context: "after-rejection",
                personId: "mother",
                contactOutcome: "replied"
              },
              p: 2
            }
          ],
          [
            1,
            "母へ便りを送ったが、何日待っても返事は来なかった。郵便受けを覗くのをやめ、冷めた湯を飲み干した。",
            {
              socialConflictAction: {
                action: "make-contact",
                target: "family",
                context: "after-rejection",
                personId: "mother",
                contactOutcome: "no-reply"
              },
              p: -3
            }
          ]
        ),
        $terraData.K(
          "実家へ、必要な用件だけ連絡してみる",
          { show: s => !s.socialConflict?.familyBreach?.personId },
          [
            0.6,
            "家の人から短い返事が届いた。体の具合を気遣う一文はあったが、あの日のことには一言も触れていなかった。",
            {
              socialConflictAction: { action: "make-contact", target: "family", context: "after-rejection" },
              p: 2
            }
          ],
          [
            1,
            "実家へ便りを送ったが、何日待っても返事は来なかった。郵便受けを覗くのをやめ、冷めた湯を飲み干した。",
            {
              socialConflictAction: { action: "make-contact", target: "family", context: "after-rejection" },
              p: -3
            }
          ]
        ),
        $terraData.K("血縁には頼らず、同じ境遇の仲間と支え合う", {}, [
          1,
          "似通った境遇の仲間たちと、薬の融通や仕事探しを手伝い合うようになった。それでも街角で怒鳴り声を聞くと、家を追い出された日の記憶がふいに蘇った。",
          {
            socialConflictAction: {
              action: "seek-mutual-aid",
              target: "infected",
              context: "alternative-household"
            },
            rl: 3,
            p: 2
          }
        ]),
        $terraData.K("今はまだ連絡せず、静かに暮らす", {}, [
          1,
          "書きかけの便りをたたんでしまい、窓の外の生活音に耳を澄ませた。今はまだ、このままの距離でいいと思った。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "v78_mutual_aid_conflict",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["青年", "壮年", "老年"],
      cd: 7,
      w: 0.82,
      show: s => {
        const connected =
          (s.socialConflict?.reports || []).some(
            row =>
              row.action === "seek-mutual-aid" && row.target === "infected" && row.context === "mutual-care"
          ) ||
          s.lifeRecord?.affiliations?.some(
            row => row.id === "infected-mutual-aid" && row.status === "active"
          );
        return !!s.inf && !!s.fl?.dg && $rules.social.hasRecordedExclusionExperience(s) && !!connected;
      },
      t: "感染者同士で物資を分け合う集まりに、かつて感染者を店や通りから追い立てていた男が顔を出し、手伝わせてくれと申し出た。「もう謝ったんだから水に流せよ」と悪びれずに言う男に、隣の仲間は「顔を見るだけで息が詰まる」と声を震わせた。",
      c: [
        $terraData.K("言葉だけでなく、過去の行いにどう向き合うのか問う", {}, [
          1,
          "「謝れば済むと思っているのか」と真っ直ぐ問い質した。男が言葉を詰まらせるのを見て、手伝いの話は預かりにし、配給の列へ戻った。",
          {
            socialConflictAction: { action: "report-harm", target: "infected", context: "mutual-aid-memory" },
            p: 1
          }
        ]),
        $terraData.K(
          "必要な物資だけ受け取り、男とは距離を置く",
          {
            en: { le: { biasInfected: 70 } },
            why: "感染者を避けたい気持ちが強く、今は一緒に作業できない。"
          },
          [
            1,
            "自分の分の物資だけを袋に詰め、男には背中を向けたまま帰りの支度を整えた。",
            {
              socialConflictAction: { action: "help", target: "infected", context: "guarded-solidarity" },
              rl: 2
            }
          ]
        ),
        $terraData.K("その場を離れ、別の配給先を探す", {}, [
          1,
          "男の顔を見るだけで当時の屈辱が蘇り、何も受け取らずに集まりを出た。冷たい風の中を歩きながら、別に行ける配給所を探した。",
          { p: -2 }
        ])
      ]
    },
    {
      id: "v78_ideology_recruitment",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["少年", "青年", "壮年"],
      cd: 6,
      w: 0.82,
      show: s =>
        !s.inf &&
        !s.par?.fa?.inf &&
        !s.par?.mo?.inf &&
        s.age >= 14 &&
        s.biasInfected >= 42 &&
        s.biasInfected < 75,
      t: "感染者を通りから締め出そうと息巻く連中から、次の集まりへ顔を出さないかと誘われた。「あいつらが俺たちの食い扶持を奪っている」と誰かが吐き捨てる。同じ声で頷いていれば、自分もこの街の「まともな側」にいられる気がした。",
      c: [
        $terraData.K("先頭に立って感染者を追い立てる", {}, [
          1,
          "店の入り口に立ち、通りがかった感染者に罵声を浴びせて追い返した。荷物を抱えて逃げていく背中を見ながら、奇妙な高揚感に包まれた。",
          {
            biasInf: 30,
            biasSar: 2,
            rl: 2,
            socialConflictAction: { action: "exclude", target: "infected", context: "organized-exclusion" }
          }
        ]),
        $terraData.K("輪には残るが、直接手を下すのは避ける", {}, [
          1,
          "連中の顔色をうかがって曖昧に頷き、集まりの後ろに身を置いた。追い立てられる人の姿を見ても、止める言葉は喉から出てこなかった。",
          {
            biasInf: 9,
            p: -1,
            socialConflictAction: {
              action: "remain",
              target: "infected",
              context: "organized-exclusion-presence"
            }
          }
        ]),
        $terraData.K("誘いを断り、その噂に根拠があるのか尋ねる", {}, [
          1,
          "「本当にあいつらのせいなのか」と問い返し、白けた空気の輪から抜けた。帰り道、街灯の下を一人で歩いた。",
          { biasInf: -7, rl: -2, equityGain: 4 }
        ])
      ]
    },
    {
      id: "v78_opponent_cost",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["青年", "壮年", "老年"],
      cd: 7,
      w: 0.62,
      show: s => s.socialLearning?.equityCommitment >= 40 && s.biasInfected < 42 && s.job > 0,
      t: "雇い主が「今後、感染者は一切雇わない」と書いた紙を休憩室の壁に貼り出した。同僚たちは気まずそうに目を伏せ、黙って持ち場へ散っていく。ここで異を唱えれば、明日から自分の仕事まで減らされかねない。",
      c: [
        $terraData.K(
          "不当な貼り紙だと雇い主に掛け合う",
          {},
          [
            0.45,
            "雇い主は言い分を聞くだけ聞いて、あとは無視を決め込んだ。数日後から、休憩室であなたの隣に座る同僚がいなくなった。",
            {
              socialConflictAction: { action: "help", target: "infected", context: "workplace-objection" },
              equityGain: 6,
              rl: -2
            }
          ],
          [
            1,
            "翌週の勤務表から、あなたのシフトが目に見えて削られていた。薄くなった給金袋を前に、今月のやりくりを頭の中で組み直した。",
            {
              socialConflictAction: {
                action: "help",
                target: "infected",
                context: "retaliation-for-objection"
              },
              p: -5,
              cr: -3,
              rl: -3
            }
          ]
        ),
        $terraData.K("締め出された当人に、よその求人を手渡す", {}, [
          1,
          "人目のない路地裏で、別の仕事場の募集要項をそっと相手に握らせた。",
          { socialConflictAction: { action: "help", target: "infected", context: "job-navigation" }, p: 1 }
        ]),
        $terraData.K("自分の暮らしを守るため、口をつぐむ", {}, [
          1,
          "結局、一言も声を上げられないままその日の作業を終えた。帰り道、壁に貼られた紙の文句が何度も頭の中を巡った。",
          { p: -2 }
        ])
      ]
    },
    {
      id: "v78_discriminated_victim_grief",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["少年", "青年", "壮年", "老年"],
      cd: 6,
      w: 0.62,
      show: s =>
        !!s.inf &&
        !!s.fl?.dg &&
        ($rules.social.hasRecordedExclusionExperience(s) ||
          $rules.social.relevantSocialEpisodes(s).length > 0),
      t: "昔から顔を合わせれば挨拶していた近所の人が、あなたの鉱石病を知って以来、プイと横を向くようになった。夕暮れの店先でその背中を見かけ、声をかけるべきか足が止まった。",
      c: [
        $terraData.K(
          "歩み寄って、なぜ避けるのか尋ねる",
          {},
          [
            0.45,
            "「俺だって感染するのは怖いんだ」と目を泳がせながら言われた。言い返す言葉も見つからず、その震える声だけが帰り道まで耳に残った。",
            {
              p: -4,
              rl: -2,
              socialConflictAction: {
                action: "social-rejection",
                target: "infected",
                context: "diagnosis-related-neighbor-withdrawal"
              }
            }
          ],
          [
            1,
            "相手は気まずそうに口をつぐみ、足早に立ち去った。取り残された店先に、冷たい沈黙だけが落ちた。",
            {
              p: -6,
              rl: -3,
              socialConflictAction: {
                action: "social-rejection",
                target: "infected",
                context: "diagnosis-related-neighbor-withdrawal"
              }
            }
          ]
        ),
        $terraData.K(
          "同じ痛みを抱える仲間と連絡を取り合う",
          { en: { ge: { rl: 15 } }, why: "胸の内を打ち明けられる相手が、まだ身近にいない。" },
          [
            1,
            "似通った目に遭った仲間と会い、互いの悔しさを吐き出した。帰り際、ようやく詰まっていた息が抜けた気がした。",
            {
              socialConflictAction: [
                {
                  action: "social-rejection",
                  target: "infected",
                  context: "diagnosis-related-neighbor-withdrawal"
                },
                { action: "seek-mutual-aid", target: "infected", context: "mutual-care" }
              ],
              rl: 3,
              p: 2
            }
          ]
        ),
        $terraData.K("こちらから目を伏せ、通り過ぎる", {}, [
          1,
          "店先にその姿を見つけると、視線を落として足早に通り過ぎた。買い物を済ませ、わざと遠回りして家へ帰った。",
          {
            p: -3,
            socialConflictAction: {
              action: "social-rejection",
              target: "infected",
              context: "diagnosis-related-neighbor-withdrawal"
            }
          }
        ])
      ]
    },
    {
      id: "v78_sarkaz_self_protection",
      conf: "S",
      references: ["SRC_V78_SAN_SAR", "SRC_V78_SOCIAL_DESIGN"],
      st: ["少年", "青年", "壮年"],
      cd: 9,
      w: 0.59,
      show: s =>
        s.r.n === "サルカズ" &&
        s.res.n !== "カズデル" &&
        (s.socialLearning?.exclusionHistory || []).some(
          x => x.context === "sarkaz-minority" || x.context === "laterano-sarkaz"
        ),
      t: "新しい仕事場の面接で、担当者はあなたの角を一瞥するなり履歴書を脇へ押しやった。「お前たちサルカズが何をしてきたか、知らないとは言わせないぞ」。これまでの働きぶりを口にする前に、頭ごなしに扉を閉ざされた。",
      c: [
        $terraData.K(
          "種族ではなく、これまでの仕事の腕を見てくれと食い下がる",
          {},
          [
            0.4,
            "担当者は渋々といった様子で履歴書を引き寄せ、これまでの現場経験を尋ねてきた。採否の返事は後日になった。",
            {
              socialConflictAction: { action: "report-harm", target: "sarkaz", context: "job-interview" },
              k: 1
            }
          ],
          [
            1,
            "「見るまでもない」と鼻で笑われ、その場で追い返された。どれほど真面目に働いてきても、角一つで撥ねつけられる現実が重くのしかかった。",
            {
              socialConflictAction: { action: "report-harm", target: "sarkaz", context: "job-interview" },
              p: -6
            }
          ]
        ),
        $terraData.K("それ以上は何も言わず、席を立つ", {}, [
          1,
          "無言で椅子を引き、履歴書を懐にしまって部屋を出た。表の通りへ出てからも、担当者の冷たい声が耳の奥で響いていた。",
          { p: -4 }
        ])
      ]
    },
    {
      id: "v78_id_document_victoria",
      conf: "S",
      references: ["SRC_V78_TARA_IDENTITY", "SRC_V78_SOCIAL_DESIGN"],
      st: ["青年", "壮年"],
      once: true,
      w: 0.53,
      show: s =>
        s.res.n === "ヴィクトリア" &&
        s.culturalIdentity?.affiliation === "ターラー系" &&
        s.culturalIdentity?.documentationStatus !== "照会中",
      t: "仕事の応募書類を出したところ、家で呼ばれているターラーの名と、役所の台帳にあるヴィクトリア風の綴りが違うと突き返された。窓口の係員は「どっちが本当の名前なんだ」と苛立たしげにペン先で紙を叩いている。",
      c: [
        $terraData.K("古い台帳の記録を照会してもらうよう頼む", {}, [
          1,
          "昔の登録記録を調べるよう正式に申し出て、控えの紙を受け取った。手続きが通るまで、しばらく宙ぶらりんの日々が続く。",
          { identityAction: { type: "ask-records", note: "出自と職業登録の相違を照会" }, k: 1 }
        ]),
        $terraData.K("親族に昔の登録がどうなっていたか聞いて回る", {}, [
          1,
            "年長の親戚を訪ねて昔の登録について聞いて回ったが、移り住んだ町ごとに違う呼び名が出てきて、かえって時代の混乱が浮き彫りになった。",
          { identityAction: { type: "practice", note: "家の登録に関する口承" }, p: 1 }
        ]),
        $terraData.K("今日は書類を引き下げ、後日に回す", {}, [1, "名前を書く欄を空白にしたまま書類を鞄にしまい、今日の現場へと向かった。", { p: -1 }])
      ]
    }
  );

  $terraData.EV.push(
    {
      id: "v79_parent_public_rejection",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["少年", "青年"],
      once: true,
      w: 0.69,
      who: "self",
      show: s =>
        s.age >= 14 &&
        s.age <= 26 &&
        !s.inf &&
        [s.par?.fa, s.par?.mo].some(p => p && !p.d && p.beliefs?.infected >= 75),
      t: [
        {
          when: s => $rules.family.inSharedHousehold(s),
          t: "店先で感染者の客が診療所への道を尋ねた。そばにいた親は露骨に顔をしかめ、『ここに病人を集めるな、よそで聞け』と吐き捨てた。客は言い返さずに踵を返そうとする。今夜も帰れば、この親と同じ食卓を囲むことになる。"
        },
        {
          t: "店先で感染者の客が診療所への道を尋ねた。そばにいた親は露骨に顔をしかめ、『ここに病人を集めるな、よそで聞け』と吐き捨てた。客は言い返さずに踵を返そうとする。顔を合わせるたびに繰り返される親の頑なさに、胸の奥が重くなった。"
        }
      ],
      c: [
        $terraData.K("道を教えるくらい何がいけないのかと親に食い下がる", {}, [
          1,
          "『余計な口を挟むな』と強い声で睨み返された。家の中で逆らえない息苦しさと、去っていく客の背中のあいだで立ち尽くした。",
          { biasInf: -4, equityGain: 2, p: -2 }
        ]),
        $terraData.K("親の顔色をうかがい、一緒になって客を追い払う", {}, [
          1,
          "立ち去る背中に向かって、あなたも『早く出て行け』と声を荒らげた。親は満足げに頷いたが、店先には客が買おうとしていた日用品がぽつんと残った。",
          {
            biasInf: 8,
            rl: 1,
            socialConflictAction: {
              action: "exclude",
              target: "infected",
              context: "family-public-rejection"
            }
          }
        ]),
        $terraData.K("気まずさに耐えきれず、店先からすっと離れる", {}, [
          1,
          "何も言えないまま裏口へ回った。路地を歩いている間も、親の怒鳴り声が耳の奥にこびりついて離れなかった。",
          { p: -1 }
        ])
      ]
    },
    {
      id: "v79_parent_defends_infected",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["少年", "青年"],
      once: true,
      w: 0.66,
      who: "self",
      show: s =>
        s.age >= 14 &&
        s.age <= 26 &&
        !s.inf &&
        (s.biasInfected || 0) >= 40 &&
        [s.par?.fa, s.par?.mo].some(p => p && !p.d && p.beliefs && p.beliefs.infected <= 18),
      t: "夕暮れの帰り道、近所の男が感染者の隣人に『病気をうつすな、この通りから出て行け』と怒鳴りつけていた。今まで感染者を警戒していたあなたをよそに、親が一歩前に出てその男をたしなめた。『石を背負っているからって、あの人の仕事も部屋も奪っていいはずがない』",
      c: [
        $terraData.K("どうしてあんな危ない相手をかばうのかと親に尋ねる", {}, [
          1,
          "親は静かに、かつて家が苦しかった頃にその隣人が黙って手を貸してくれた日のことを話した。自分の知らなかったやり取りに言葉が詰まった。",
          { biasInf: -4, k: 1 }
        ]),
        $terraData.K("近づけばうつるかもしれないと、自分の警戒心をぶつける", {}, [
          1,
          "親と言い争いになり、あなたが口にした棘のある言葉が路地に響いた。少し離れた戸口で、隣人が黙ってこちらを見ているのに気づいた。",
          { biasInf: 5, p: -2 }
        ]),
        $terraData.K("言い返せないまま、黙って考え込む", {}, [
          1,
          "親はそれ以上何も言わず、夕餉の皿を下げた。さっきまで当たり前だと思っていた決めつけが、急に喉に引っかかって出てこなくなった。",
          {}
        ])
      ]
    },
    {
      id: "v79_parent_views_diverge",
      conf: "S",
      references: ["SRC_V78_REUNION", "SRC_V78_SOCIAL_DESIGN"],
      st: ["少年", "青年"],
      cd: 9,
      w: 0.51,
      who: "self",
      show: s =>
        s.age >= 13 &&
        s.age <= 24 &&
        s.par?.fa &&
        !s.par.fa.d &&
        s.par?.mo &&
        !s.par.mo.d &&
        s.par.fa.beliefs &&
        s.par.mo.beliefs &&
        Math.abs(s.par.fa.beliefs.infected - s.par.mo.beliefs.infected) >= 37,
      t: [
        {
          when: s => $rules.family.inSharedHousehold(s),
          t: "夕餉の食卓で、職場の感染者をめぐって両親が激しい口論になった。片方は『同じ屋根の下で働くのもごめんだ』と吐き捨て、もう片方は『同じ町で暮らす人間じゃないか』と譲らない。二人のあいだで、あなたの手の箸が止まった。"
        },
        {
          t: "実家へ顔を出した際、職場の感染者をめぐって両親が激しい口論を始めた。片方は『同じ屋根の下で働くのもごめんだ』と吐き捨て、もう片方は『同じ町で暮らす人間じゃないか』と譲らない。二人の激しい言い争いに、その場に居合わせたあなたも居心地の悪さを覚えた。"
        }
      ],
      c: [
        $terraData.K("なぜそこまで意見が食い違うのか、双方の言い分を聞く", {}, [
          1,
          "現場で見た事故の怖さを語る声と、長年知る仲間の暮らしを案じる声。どちらにも理由があることを知るうちに、皿の上のスープはすっかり冷めていった。",
          { k: 1, biasInf: -3 }
        ]),
        $terraData.K("危ない者は遠ざけるべきだと、排斥する側へ加勢する", {}, [
          1,
          "あなたが頷くと、片方は我が意を得たりと声を強め、もう片方は黙って目を伏せた。気まずい沈黙が食卓に降りた。",
          {
            biasInf: 7,
            p: -2,
            socialConflictAction: {
              action: "endorse",
              target: "infected",
              context: "family-dinner-endorsement"
            }
          }
        ]),
        $terraData.K("口を挟まず、黙って自分の皿を空にする", {}, [
          1,
          "頭の上を飛び交う言い争いを聞き流しながら、味もしない食事を急いで喉へ流し込んだ。",
          { p: -1 }
        ])
      ]
    }
  );

  $terraData.SETTING_SOURCES.SRC_V81_WOLMONDE = {
    title: "ウォルモンドの薄暮・三体の巨像（TW-S-1）",
    kind: "日本語版本文",
    url: "https://shimadouma.github.io/astrhtml/events/act11d0/stories/TW-S-1.html",
    note: "難民の仮設住居と正規住民優先の配給判断。資料が示すのは社会的処遇の相違でありゲームの住民全員への一定のペナルティではない。"
  };

  $terraData.SETTING_SOURCES.SRC_V81_FIRELIGHT = {
    title: "この炎が照らす先・彼女の影（FC-8）",
    kind: "日本語版本文",
    url: "https://shimadouma.github.io/astrhtml/events/act22side/stories/FC-8.html",
    note: "ターラー人の教育・労働・文化抑圧と、同じ集団内にも存在する利害対立。"
  };

  $terraData.SETTING_SOURCES.SRC_V81_AFTERMATH = {
    title: "社会的排斥の帰結と回復（v81）",
    kind: "ゲーム設計仮定",
    note: "実際に記録された事件ごとに一時的な交流機会と後日談を紐付ける。被害の精神的経過や回復期間を原作統計と称さない。"
  };

  $terraData.EVENT_FIELD_META.socialAftermathAction = {
    unit: "個別経験の後日談",
    meaning:
      "不利益の発生とは別に、支援・照会・記録・現在への直接的影響の終了を明示する。過去の被害そのものは抹消しない",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_FIELD_META.informationResponseAction = {
    unit: "本人が知った年表事件への応答",
    meaning:
      "既知の世界事件に対して本人が選んだ生活上の応答と、既存の情報接触記録にある伝達経路を結ぶ。主張への信頼や事件の真偽は推定しない",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_FIELD_META.informationClaimAction = {
    unit: "個人が受け取った主張への応答",
    meaning:
      "事件の発生事実と発信者の主張を分け、本人が実際に受け取った未確認の主張、範囲を限った別系統の根拠、個人/組織への伝達と訂正を記録する。根拠の及ばない事実や真偽、受け手や組織の反応・信念・行動を推定しない",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_FIELD_META.informationClaimResponseAction = {
    unit: "特定の相手が一度の会話で述べた返答",
    meaning:
      "実際に伝達済みで、現在も接触可能な同一人物IDとの後年の会話だけを記録する。継続する信念・行動・主張の真偽は推定しない",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_FIELD_META.informationClaimCorrectionResponseAction = {
    unit: "根拠を添えた訂正を受けた同一人物の返答",
    meaning:
      "訂正の伝達後に同じ人物が一度の会話で述べた返答を記録する。訂正の受容、継続する信念・行動、主張の真偽は推定しない",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_FIELD_META.informationClaimLaterResponseAction = {
    unit: "特定の相手が後年の会話で述べた見解・行動の自己申告",
    meaning:
      "受け手本人による別時点の申告を記録する。会話間の信念の継続、行動の独立確認、第三者への伝播は推定しない",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_EFFECT_TYPES.object.push(
    "socialAftermathAction",
    "informationResponseAction",
    "informationClaimAction",
    "informationClaimResponseAction",
    "informationClaimCorrectionResponseAction",
    "informationClaimLaterResponseAction"
  );
});
