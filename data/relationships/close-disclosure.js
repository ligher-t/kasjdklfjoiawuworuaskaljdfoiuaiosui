// relationships/close-disclosure: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("relationships/close-disclosure", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "V87_CLOSE_KINDS",
    [
      { kind: "father", label: "父", role: "父親" },
      { kind: "mother", label: "母", role: "母親" },
      { kind: "spouse", label: "配偶者", role: "配偶者" },
      { kind: "friend", label: "友人", role: "友人" }
    ],
    false
  );

  $define(
    "v87relative",
    (s, kind) =>
      kind === "father"
        ? s.par?.fa
        : kind === "mother"
          ? s.par?.mo
          : kind === "spouse"
            ? s.sp
            : s.friendContact,
    false,
    true
  );

  $define(
    "v87reachable",
    (s, kind) => {
      const person = $terraData.v87relative(s, kind);
      if (!person?.id || person.d || person.lifeStatus === "dead" || person.knownLifeStatus === "dead")
        return false;
      if (kind === "spouse")
        return (
          typeof $rules.family.spouseLivesWithProtagonist === "function" &&
          $rules.family.spouseLivesWithProtagonist(s)
        );
      if (kind === "friend")
        return (
          !["severed", "deceased", "missing"].includes(person.status) && person.knownLifeStatus !== "missing"
        );
      return (
        (typeof $rules.family.inSharedHousehold === "function" && $rules.family.inSharedHousehold(s)) ||
        person.knownRegion === s.res?.n
      );
    },
    false,
    true
  );

  $define(
    "v87informed",
    (s, kind) => {
      const person = $terraData.v87relative(s, kind);
      if (s.closeKnowledge?.links?.[person?.id]?.knownFacts?.playerDiagnosis) return true;
      if (s.fl?.[`infection_family_recipient_${kind}`]) return true;
      if (s.fl?.infection_family_disclosed && ["father", "mother", "spouse", "sibling", "child"].includes(kind)) return true;
      if ((s.infectionAwareness?.entries || []).some(e =>
        e.subject === "protagonist" &&
        e.certainty === "confirmed" &&
        (e.recipientId === person?.id ||
         (e.audience === "family" && ["father", "mother", "sibling"].includes(kind)) ||
         (e.audience === "household" && ["father", "mother", "spouse", "child"].includes(kind)))
      )) return true;
      return false;
    },
    false,
    true
  );

  for (const { kind, label, role } of $terraData.V87_CLOSE_KINDS) {
    $terraData.EV.push({
      id: `v87_diagnosis_to_${kind}`,
      conf: "S",
      references: ["SRC_V87_CLOSE_INFO"],
      st: ["青年", "壮年", "老年"],
      cd: 8,
      w: 0.43,
      show: s =>
        s.age >= 18 &&
        !!s.inf &&
        !!s.fl?.dg &&
        $terraData.v87reachable(s, kind) &&
        !$terraData.v87informed(s, kind),
      t: s => {
        const deferred = (s.closeKnowledge?.links?.[$terraData.v87relative(s, kind)?.id]?.history || []).some(h => h.action === "defer");
        return deferred
          ? `鉱石病のことを伏せたまま過ごしてきたが、${role}と顔を合わせるたびに胸が痛んだ。このまま隠し通せるはずもなく、本当のことを打ち明けるべきか再び迷った。`
          : `鉱石病の診断を受けて帰り道を歩きながら、真っ先に${role}の顔が浮かんだ。病名やこれからの暮らしのことを、どこまで打ち明けるべきか足が重くなった。`;
      },
      c: [
        $terraData.K(`${role}にだけ、ありのままを打ち明ける`, {}, [
          1,
          `静かな場所を選び、鉱石病にかかったことを${role}本人にだけ打ち明けた。言い終えたあとの重苦しい沈黙のなか、次の言葉がすぐには出てこなかった。`,
          {
            closeKnowledgeAction: { kind, action: "disclose" },
            fl: ["father", "mother", "spouse", "sibling", "child"].includes(kind)
              ? {
                  infection_family_disclosed: 1,
                  [`infection_family_recipient_${kind}`]: 1
                }
              : {},
            p: -1
          }
        ]),
        $terraData.K(`今は胸にしまい、普段通りに接する`, {}, [
          1,
          `今日は病気のことを口に出さず、${role}と普段通りの他愛ないやり取りを交わした。`,
          { closeKnowledgeAction: { kind, action: "defer" } }
        ]),
        $terraData.K(`病名は伏せたまま、通院や仕事の都合だけ相談する`, {}, [
          1,
          `鉱石病だとは切り出せないまま、体調を崩して病院へ通う日が増えることだけを${role}に伝えた。`,
          { closeKnowledgeAction: { kind, action: "defer" }, rl: 1 }
        ])
      ]
    });
    $terraData.EV.push({
      id: `v87_private_followup_${kind}`,
      conf: "S",
      references: ["SRC_V87_CLOSE_INFO"],
      st: ["青年", "壮年", "老年"],
      cd: 5,
      w: 0.38,
      show: s => {
        const person = $terraData.v87relative(s, kind);
        const sinceYear = s.closeKnowledge?.links?.[person?.id]?.knownFacts?.playerDiagnosis?.sinceYear;
        return (
          s.age >= 18 &&
          $terraData.v87reachable(s, kind) &&
          $terraData.v87informed(s, kind) &&
          sinceYear != null &&
          s.year >= sinceYear + 1
        );
      },
      t: s => {
        const response = s.closeKnowledge?.links?.[$terraData.v87relative(s, kind)?.id]?.latestResponse;
        return response?.state === "withdrew"
          ? `以前、${role}に診断を伝えたあと、相手は距離を置いた。久しぶりに便りを出すか、必要な手助けだけ頼むか迷った。`
          : response?.state === "questioned-diagnosis"
            ? `以前、${role}は検査結果を確かめたいと尋ねた。診療の経過を話し直すか、必要な手助けを頼むか考えた。`
            : response?.state === "heard-undecided"
              ? `以前、${role}は診断を聞き、その場では返事をしなかった。今、連絡や買い物を頼むか迷った。`
              : `以前、${role}に自分の診断を伝えた。今度は、どこまで話し、何を頼むか考えた。`;
      },
      c: [
        $terraData.K(
          `周りには絶対に言わないでほしいと口止めする`,
          {},
          [
            0.65,
            `${role}は小さくうなずき、「誰にも言わない」と静かに約束してくれた。`,
            { closeKnowledgeAction: { kind, action: "privacy-accepted" } }
          ],
          [
            1,
            `${role}は困ったように目を伏せ、はっきりとはうなずかなかった。`,
            { closeKnowledgeAction: { kind, action: "privacy-unconfirmed" } }
          ]
        ),
        $terraData.K(
          `無理のない範囲で、買い物や連絡を手伝ってもらえるか聞く`,
          {},
          [
            0.55,
            `${role}は少し考えてから、「日用品の買い出しや連絡くらいなら手を貸せる」と引き受けてくれた。`,
            { closeKnowledgeAction: { kind, action: "help-accepted" }, rl: 1 }
          ],
          [
            1,
            `${role}は言い淀み、「自分の暮らしもあって、どこまで手伝えるか分からない」と歯切れ悪く答えた。`,
            { closeKnowledgeAction: { kind, action: "help-unconfirmed" } }
          ]
        ),
        $terraData.K(`相手の戸惑いを汲み、しばらくこちらからは連絡を控える`, {}, [
          1,
          `${role}の気持ちが落ち着くまで急かさないことにし、こちらからの便りをしばらく控えた。`,
          { closeKnowledgeAction: { kind, action: "defer" } }
        ])
      ]
    });
    $terraData.EV.push({
      id: `v87_help_commitment_followup_${kind}`,
      conf: "S",
      references: ["SRC_V87_CLOSE_INFO"],
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.55,
      show: s => {
        const person = $terraData.v87relative(s, kind),
          commitment = person?.id && s.closeKnowledge?.links?.[person.id]?.helpCommitment;
        return !!(
          s.age >= 18 &&
          $terraData.v87reachable(s, kind) &&
          commitment?.personId === person.id &&
          commitment.kind === "next-appointment" &&
          commitment.status === "pending" &&
          Number.isInteger(commitment.dueYear) &&
          commitment.dueYear <= s.year
        );
      },
      t: s => {
        const person = $terraData.v87relative(s, kind),
          commitment = s.closeKnowledge?.links?.[person?.id]?.helpCommitment;
        return `${commitment?.agreedYear ?? s.year - 1}年に、${role}は次の診察に付き添うと言った。いよいよ受診の日が近づき、本当に付き添ってもらうか考えた。`;
      },
      c: [
        $terraData.K(
          "約束した通りの時刻に待ち合わせる",
          {},
          [
            0.65,
            `待ち合わせの角に${role}は時間通り現れた。並んで受付を済ませ、診察が終わるまで待合室のベンチで静かに待っていてくれた。`,
            { closeKnowledgeAction: { kind, action: "help-execution", outcome: "fulfilled" } }
          ],
          [
            0.82,
            `受診日の前になって、${role}から「どうしても都合がつかなくなった」と短い断りの連絡が届いた。`,
            { closeKnowledgeAction: { kind, action: "help-execution", outcome: "withdrawn-by-other" } }
          ],
          [
            1,
            `約束の時刻をどれだけ過ぎても、${role}の姿は見えなかった。冷えた空気のなか、ひとりで診療所の扉を開けた。`,
            { closeKnowledgeAction: { kind, action: "help-execution", outcome: "not-realized" } }
          ]
        ),
        $terraData.K("付き添いは断り、ひとりで診療所へ向かう", {}, [
          1,
          `気兼ねが勝り、ひとりで診察を受けに行った。帰り道、「これからはひとりで通えるから大丈夫だ」と${role}に伝えた。`,
          { closeKnowledgeAction: { kind, action: "help-execution", outcome: "cancelled-by-player" } }
        ])
      ]
    });
  }

  $terraData.SETTING_SOURCES.SRC_V87_INFECTED_ORGANIZER = {
    title: "感染者排除団体の設立者が診断された後の選択と休止再検討",
    kind: "ゲーム用仮定",
    note: "資料は排除団体の主催者本人が感染した場合の反応、団体の決定、休止後の所属判断、発生頻度や結果確率を定めない。既存の社会圧力と個人行為の設計に接続した仮想の局所事例であり、結果率は設定上の事実ではない。"
  };

  $terraData.EV.push({
    id: "v87_exclusion_organizer_infected",
    conf: "S",
    references: [
      "SRC_TERRA_SOCIAL_ATTITUDES",
      "SRC_ORIPATHY_SOCIAL",
      "SRC_V78_SOCIAL_DESIGN",
      "SRC_V87_INFECTED_ORGANIZER"
    ],
    st: ["青年", "壮年", "老年"],
    once: true,
    w: 0.72,
    after: { id: "v78_prejudice_to_patient", min: 1 },
    show: s =>
      !!(
        s.inf &&
        s.fl?.dg &&
        s.socialConflict?.infectionShock?.priorActions > 0 &&
        s.lifeRecord?.affiliations?.some(a => a.id === "infected-exclusion" && a.status === "active") &&
        s.lifeRecord?.organizations?.some(o => o.id === "infected-exclusion" && o.status === "active")
      ),
    t: "感染者を街区から締め出す住民会を自ら立ち上げ、商店や下宿にまで排除の申し合わせを広げてきた。その自分が鉱石病と診断された今、会合の扉を開ける前に立ち尽くした。病を隠し通すのか、自分だけを例外にしてくれと頭を下げるのか、それとも自らが作った掟そのものを改めるのか。",
    c: [
      $terraData.K("病をひた隠しにし、これまで通り排除の先頭に立ち続ける", {}, [
        1,
          "自分の身体のことは誰にも明かさず、設立者としての顔を取り繕い続けた。感染者を店や職場から締め出す掟も、そのまま街区に残り続けた。",
        {
          lifeOrganization: {
            id: "infected-exclusion",
            action: "followup",
            note: "設立者は診断を伝えず、既存の規則と役目を継続"
          },
          p: -1
        }
      ]),
      $terraData.K(
        "診断を打ち明け、これまでの貢献に免じて自分だけは例外にしてくれと頼む",
        {},
        [
          0.45,
          "会の幹部たちは気まずそうに顔を見合わせた末、あなた一人だけを暗黙の例外として扱うことにし、設立者の座に残した。だが店先や下宿に配った排除の札は、一枚も外されなかった。",
          {
            lifeOrganization: {
              id: "infected-exclusion",
              action: "followup",
              note: "感染した設立者への個別例外を認めた。会の規則は未変更"
            },
            lifeAffiliation: {
              id: "infected-exclusion",
              action: "crisis",
              note: "個別例外のもとで設立者の役目を継続"
            },
            p: -1
          }
        ],
        [
          1,
          "あなたが作った規則は、そのままあなた自身に跳ね返った。設立者としての役目はその場で解かれ、集会所から追い出された。",
          {
            lifeOrganization: {
              id: "infected-exclusion",
              action: "followup",
              note: "診断後も既存規則を適用し、設立者の役目を停止"
            },
            lifeAffiliation: {
              id: "infected-exclusion",
              action: "suspend",
              note: "診断後、住民会の役目を一時停止"
            },
            lifeGoal: {
              id: "order-through-exclusion",
              action: "pause",
              onlyIfActive: true,
              note: "感染診断後、住民会の役目と排除活動を休止"
            },
            socialConflictAction: {
              action: "social-rejection",
              target: "infected",
              context: "exclusion-organizer-diagnosis-rejection"
            },
            p: -2
          }
        ]
      ),
      $terraData.K(
        "自らの感染を明かし、一律に締め出す掟を改めようと訴える",
        {
          en: { le: { biasInfected: 74 } },
          why: "強い排除思想を保っている間は、自らの規則を見直す提案を選べない"
        },
        [
          0.4,
          "騒然とする会合で頭を下げて訴え続け、協力店が一律に感染者を拒む申し合わせを撤回し、店ごとの判断に委ねるところまでこぎつけた。",
          {
            lifeOrganization: {
              id: "infected-exclusion",
              action: "policy",
              policy: "協力店の一律拒否をやめ、個別に判断"
            },
            lifeAffiliation: {
              id: "infected-exclusion",
              action: "crisis",
              note: "規則改定を提案し、設立者として会に残る"
            },
            lifeGoal: {
              id: "order-through-exclusion",
              action: "compromise",
              onlyIfActive: true,
              note: "診断後、会の一律排除規則を一部改めた"
            },
            socialConflictAction: {
              action: "reconsider",
              target: "infected",
              context: "exclusion-organizer-policy-review"
            },
            p: 1
          }
        ],
        [
          1,
          "昨日の仲間たちは冷ややかな目であなたの訴えを退けた。排除の掟は一字も変わらず、あなたは設立者の座を追われた。",
          {
            lifeOrganization: {
              id: "infected-exclusion",
              action: "followup",
              note: "設立者の規則改定提案を退けた"
            },
            lifeAffiliation: {
              id: "infected-exclusion",
              action: "suspend",
              note: "規則改定を退けられ、設立者の役目を一時停止"
            },
            lifeGoal: {
              id: "order-through-exclusion",
              action: "pause",
              onlyIfActive: true,
              note: "規則改定を拒まれ、本人の住民会活動を休止"
            },
            socialConflictAction: {
              action: "social-rejection",
              target: "infected",
              context: "exclusion-organizer-policy-rejection"
            },
            p: -2
          }
        ]
      )
    ]
  });

  $terraData.EV.push({
    id: "life_infected_exclusion_pause_review",
    conf: "S",
    references: ["SRC_TERRA_SOCIAL_ATTITUDES", "SRC_ORIPATHY_SOCIAL", "SRC_V87_INFECTED_ORGANIZER"],
    st: ["青年", "壮年", "老年"],
    after: { id: "v87_exclusion_organizer_infected", min: 3 },
    cd: 3,
    w: 0.16,
    show: s => {
      const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "infected-exclusion"),
        organization = s.lifeRecord?.organizations?.find(row => row.id === "infected-exclusion");
      return (
        s.age >= 18 &&
        s.inf &&
        s.fl?.dg &&
        affiliation?.status === "suspended" &&
        organization?.status === "active" &&
        s.year - (affiliation.lastChangedYear ?? s.year) >= 3
      );
    },
    t: "鉱石病を明かして住民会の役目を追われてから数年が過ぎた。自分が広めた排除の決まりは今も街区に生きている。そんな折、会から雑務の手伝いを求める便りが届き、どの顔をして向き合うべきか考え込んだ。",
    c: [
      $terraData.K("表舞台には出ず、裏方の雑務だけを手伝う形で戻る", {}, [
        1,
        "設立者の座は求めず、裏方の手伝いとして戻ると返事をした。感染者を締め出す申し合わせが続く会の片隅に、再び自分の居場所を置いた。",
        {
          lifeAffiliation: {
            id: "infected-exclusion",
            action: "return",
            role: "一般会員・運営補助",
            note: "診断後の休止を経て、役目を限り会員活動へ復帰"
          },
          lifeGoal: {
            id: "order-through-exclusion",
            action: "continue",
            note: "役目を限り、住民会の活動を再開"
          },
          p: 0
        }
      ]),
      $terraData.K("返事をせず、自分の治療と暮らしを優先する", {}, [
        1,
        "会へ戻るとは答えず、自分の身体をいたわることと日々の暮らしを優先した。届いた便りは開封したまま棚の隅に押しやった。",
        {
          lifeAffiliation: {
            id: "infected-exclusion",
            action: "review",
            note: "本人が活動休止を続け、三年後に再確認"
          },
          lifeGoal: {
            id: "order-through-exclusion",
            action: "pause",
            note: "住民会で進める活動を休止"
          },
          p: 0
        }
      ]),
      $terraData.K("きっぱりと会を抜け、二度と関わらない", {}, [
        1,
        "もう会には関わらないと伝えて完全に縁を切った。自分がかつて街角に広めた「感染者お断り」の札だけが、今も通りに残っていた。",
        {
          lifeAffiliation: {
            id: "infected-exclusion",
            action: "leave",
            note: "診断後に休止していた住民会の所属を終了"
          },
          lifeGoal: {
            id: "order-through-exclusion",
            action: "abandon",
            note: "住民会から正式に退会し、排除活動の目標を終了"
          },
          p: 0
        }
      ])
    ]
  });

  for (const e of $terraData.EV.filter(
    e => e.id.startsWith("v87_") && e.id !== "v87_exclusion_organizer_infected"
  ))
    for (const [i, c] of e.c.entries())
      c.ethics = {
        intent: e.id.includes("followup")
          ? ["procedure", "voluntary-aid", "withdrawal"][i]
          : ["information", "defer", "procedure"][i],
        target: null,
        reviewed: true,
        policyVersion: 87
      };

  $define(
    "V87_SOCIAL_ACTION_RECORDS",
    [
      {
        id: "dst",
        choice: 0,
        outcomes: [0],
        action: "help",
        target: "infected",
        context: "workplace-solidarity"
      },
      {
        id: "urs_sweep",
        choice: 0,
        outcomes: [0, 1, 2],
        action: "help",
        target: "infected",
        context: "neighbor-shelter"
      },
      {
        id: "urs_sweep",
        choice: 3,
        outcomes: [0, 1],
        action: "exclude",
        target: "infected",
        context: "ideological-informant-report"
      },
      {
        id: "urs_sweep",
        choice: 4,
        outcomes: [0, 1],
        action: "exclude",
        target: "infected",
        context: "coercive-self-protection-report"
      },
      {
        id: "kaz_reunion",
        choice: 0,
        outcomes: [0],
        action: "help",
        target: "infected",
        context: "reunion-local-relief"
      },
      {
        id: "kaz_reunion",
        choice: 1,
        outcomes: [0, 1],
        action: "seek-mutual-aid",
        target: "infected",
        context: "reunion-survivor-listening"
      },
      {
        id: "life_infected_association_choice",
        choice: 1,
        outcomes: [0],
        action: "help",
        target: "infected",
        context: "organized-mutual-aid"
      },
      {
        id: "life_reunion_local_entry",
        choice: 0,
        outcomes: [0],
        action: "help",
        target: "infected",
        context: "reunion-neighbor-relief"
      },
      {
        id: "life_reunion_reorg_review",
        choice: 0,
        outcomes: [0],
        action: "help",
        target: "infected",
        context: "reunion-relief-followup"
      },
      {
        id: "sr_reunion_neighbour_contact",
        choice: 0,
        outcomes: [0],
        action: "help",
        target: "infected",
        context: "one-time-neighbor-relief"
      },
      {
        id: "bias_peer_mockery",
        choice: 1,
        outcomes: [0, 1],
        action: "help",
        target: "infected",
        context: "peer-harassment-objection"
      },
      {
        id: "bias_family_model",
        choice: 1,
        outcomes: [0, 1],
        action: "reconsider",
        target: "infected",
        context: "question-family-prejudice"
      },
      {
        id: "bias_family_sarkaz_model",
        choice: 1,
        outcomes: [0, 1],
        action: "reconsider",
        target: "sarkaz",
        context: "question-family-prejudice"
      },
      {
        id: "bias_teacher_lesson",
        choice: 1,
        outcomes: [0, 1],
        action: "reconsider",
        target: "infected",
        context: "question-teacher-rumor"
      },
      {
        id: "attitude_infected_child",
        choice: 1,
        outcomes: [0],
        action: "help",
        target: "infected",
        context: "clinic-queue-objection"
      },
      {
        id: "attitude_sarkaz_child",
        choice: 1,
        outcomes: [0],
        action: "reconsider",
        target: "sarkaz",
        context: "ask-market-incident"
      },
      {
        id: "v77_family_rumor",
        choice: 2,
        outcomes: [0],
        actions: [
          { action: "endorse", target: "infected", context: "family-rumor-endorsement" },
          { action: "endorse", target: "sarkaz", context: "family-rumor-endorsement" }
        ]
      },
      {
        id: "v77_bystander_response",
        choice: 0,
        outcomes: [0],
        action: "help",
        target: "resident-unspecified-origin",
        context: "reception-treatment-objection"
      },
      {
        id: "v77_bystander_response",
        choice: 1,
        outcomes: [0],
        action: "help",
        target: "resident-unspecified-origin",
        context: "requested-navigation-help"
      },
      {
        id: "v78_ideology_recruitment",
        choice: 2,
        outcomes: [0],
        action: "reconsider",
        target: "infected",
        context: "decline-exclusion-recruitment"
      },
      {
        id: "v79_parent_public_rejection",
        choice: 0,
        outcomes: [0],
        action: "help",
        target: "infected",
        context: "family-public-objection"
      },
      {
        id: "v79_parent_defends_infected",
        choice: 1,
        outcomes: [0],
        action: "endorse",
        target: "infected",
        context: "family-dinner-prejudice"
      }
    ],
    false
  );

  for (const row of $terraData.V87_SOCIAL_ACTION_RECORDS) {
    const event = $terraData.EV.find(item => item.id === row.id),
      choice = event?.c?.[row.choice];
    if (!choice || row.outcomes.some(i => !choice.o[i]?.[2] || choice.o[i][2].socialConflictAction))
      throw Error("差別行為の記録経路が不整合: " + row.id + "@" + row.choice);
    for (const i of row.outcomes)
      choice.o[i][2].socialConflictAction = row.actions || {
        action: row.action,
        target: row.target,
        context: row.context
      };
  }

  $terraData.EV.push(
    {
      id: "life_ursus_zelgrad_recruitment",
      conf: "S",
      references: ["SRC_URSUS_EP17", "SRC_URSUS_EP17_TIMELINE", "SRC_URSUS_ZELGRAD_CITY"],
      st: ["青年", "壮年"],
      ge: { year: 1102, age: 18 },
      le: { year: 1102, age: 60 },
      once: true,
      w: 0.42,
      show: s =>
        s.res.n === "ウルサス" &&
        ["工業・採掘地域", "固定都市の街区", "移動都市の避難・労働区画"].includes(s.local?.kind) &&
        s.inf > 0 &&
        s.fl?.dg === 1 &&
        s.job === 0,
      t: "近くの工場で補助の働き手を探しているらしいと、親戚づてに話が回ってきた。鉱石病の身でも雇ってもらえるのか、詳しい条件までは紹介してくれた親戚も知らないという。直接確かめて応募してみるか、別の仕事口を探すか迷った。",
      c: [
        $terraData.K(
          "工場の選考に応募してみる",
          {},
          [
            0.42,
            "紹介を頼りに選考へ進み、移動都市ゼルグラードの工場補助職に採用された。仕事場へ通うため労働区画の狭い部屋へ荷物を運び込み、油と鉄の匂いがこもる現場で不慣れな作業を覚え始めた。",
            {
              job: 2,
              home: "移動都市",
              localKind: "移動都市の避難・労働区画",
              localCity: "ゼルグラード",
              lifeAffiliation: {
                id: "ursus-zelgrad-factory",
                title: "ゼルグラードの工場補助職",
                kind: "employer",
                action: "join",
                bindAt: "destination",
                role: "製造・設備補助"
              },
              lifeGoal: {
                id: "ursus-zelgrad-work",
                title: "感染後の生活を支える仕事を見つける",
                priority: "生計",
                action: "start",
                note: "紹介を受け、ゼルグラードの工場補助職に就いた"
              },
              lifeSkill: {
                id: "industrial-production",
                title: "工場の製造補助",
                delta: 1,
                context: "工場の研修で製造補助の手順を覚えた"
              },
              p: 2
            }
          ],
          [
            1,
            "選考には通らず、不採用の知らせだけが届いた。骨を折ってくれた親戚に礼を言い、また一から働き口を探して街を歩いた。",
            { p: -2, k: 1 }
          ]
        ),
        $terraData.K("労働時間や住まいの条件が分かるまで応募を見合わせる", {}, [
          1,
          "身体がもつ働き方なのか、住み込みの条件はどうなっているのかを親戚に尋ね直し、返事が来るまでは今の暮らしを続けることにした。",
          {
            lifeGoal: {
              id: "ursus-zelgrad-work",
              title: "感染後の生活を支える仕事を見つける",
              priority: "生計",
              action: "pause",
              note: "紹介者に勤務時間と住まいの条件を尋ねた"
            },
            p: 1
          }
        ]),
        $terraData.K("その話は見送り、近くで別の仕事口を探す", {}, [
          1,
          "遠くの工場へ移る話は見送り、今の土地で続けられそうな働き口を探すことにした。",
          {
            lifeGoal: {
              id: "ursus-zelgrad-work",
              title: "感染後の生活を支える仕事を見つける",
              priority: "生計",
              action: "abandon",
              note: "工場への応募を見送り、ほかの働き口を探す"
            },
            p: 0
          }
        ])
      ]
    },
    {
      id: "life_ursus_zelgrad_work_review",
      conf: "S",
      references: [
        "SRC_URSUS_EP17",
        "SRC_URSUS_EP17_TIMELINE",
        "SRC_URSUS_ZELGRAD_CITY",
        "SRC_INDUSTRIAL_LIFE"
      ],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.34,
      show: s =>
        s.res.n === "ウルサス" &&
        s.local?.city === "ゼルグラード" &&
        s.job === 2 &&
        s.lifeRecord?.affiliations?.some(
          a =>
            a.id === "ursus-zelgrad-factory" &&
            a.status === "active" &&
            s.year - (a.startedYear ?? s.year) >= 2
        ),
      t: "ゼルグラードの工場で働き始めて二年余りが過ぎ、機械の轟音にも労働区画の冷え込みにもどうにか慣れた。病を抱える身体の重さと毎月の稼ぎを天秤にかけ、このまま同じ持ち場で働き続けるか考えた。",
      c: [
        $terraData.K("今の持ち場に残り、身体に馴染んだ手順で働き続ける", {}, [
          1,
          "これからも同じ持ち場で続けると班長に伝えた。手が覚えた段取りのおかげで、以前より無理のない動きで一日の作業を終えられるようになった。",
          {
            lifeAffiliation: {
              id: "ursus-zelgrad-factory",
              action: "continue",
              note: "本人が二年後に担当を続けると決めた"
            },
            lifeGoal: {
              id: "ursus-zelgrad-work",
              action: "continue",
              note: "工場補助職を続け、生活との両立を見直した"
            },
            lifeSkill: {
              id: "industrial-production",
              title: "工場の製造補助",
              delta: 1,
              context: "本人の担当を続ける中で手順を記録"
            },
            p: 1
          }
        ]),
        $terraData.K("工場を辞め、もう少し身体の楽な働き口を探す", {}, [
          1,
          "退職を申し出て工場の門を出た。手元に残ったわずかな給金を確かめながら、次の働き口を求めて街区の貼り紙を見て回った。",
          {
            job: 0,
            lifeAffiliation: {
              id: "ursus-zelgrad-factory",
              action: "leave",
              note: "本人が二年後に工場補助職を離れた"
            },
            lifeGoal: {
              id: "ursus-zelgrad-work",
              action: "compromise",
              note: "工場の仕事を終え、別の働き口を探す"
            },
            p: -1
          }
        ])
      ]
    }
  );

  $terraData.EV.push({
    id: "life_ursus_zelgrad_recruitment_retry",
    conf: "S",
    references: ["SRC_URSUS_EP17", "SRC_URSUS_EP17_TIMELINE", "SRC_URSUS_ZELGRAD_CITY"],
    st: ["青年", "壮年"],
    ge: { year: 1103, age: 18 },
    le: { year: 1103, age: 60 },
    once: true,
    w: 0.32,
    show: s =>
      s.res.n === "ウルサス" &&
      ["工業・採掘地域", "固定都市の街区", "移動都市の避難・労働区画"].includes(s.local?.kind) &&
      s.inf > 0 &&
      s.fl?.dg === 1 &&
      s.job === 0 &&
      s.lifeRecord?.goals?.some(
        g =>
          g.id === "ursus-zelgrad-work" &&
          g.status === "paused" &&
          s.year - (g.lastChangedYear ?? s.year) >= 1
      ),
    t: "去年聞いた工場の募集について、親戚にもう一度尋ねてみた。まだ働き手を探しているのか確かめ、今度こそ応募するか、すっぱり諦めて別の仕事を探すか決めることにした。",
    c: [
      $terraData.K(
        "紹介を頼りに、今度こそ選考を受ける",
        {},
        [
          0.42,
          "親戚に採用係へのつなぎを取ってもらって応募し、無事に採用が決まった。ゼルグラードの労働区画へ荷物を運び込み、機械の熱気と騒音のなかで作業の手順を覚え始めた。",
          {
            job: 2,
            home: "移動都市",
            localKind: "移動都市の避難・労働区画",
            localCity: "ゼルグラード",
            lifeAffiliation: {
              id: "ursus-zelgrad-factory",
              title: "ゼルグラードの工場補助職",
              kind: "employer",
              action: "join",
              bindAt: "destination",
              role: "製造・設備補助"
            },
            lifeGoal: {
              id: "ursus-zelgrad-work",
              action: "continue",
              note: "一年保留した後、一件の募集に応募して採用された"
            },
            lifeSkill: {
              id: "industrial-production",
              title: "工場の製造補助",
              delta: 1,
              context: "工場の研修で機械の音と製造補助の手順を覚えた"
            },
            p: 2
          }
        ],
        [
          1,
          "親戚から、あの募集はもう人が埋まって締め切られたと知らされた。肩を落としながら、街角の求人貼りを探しに出かけた。",
          {
            lifeGoal: {
              id: "ursus-zelgrad-work",
              action: "pause",
              note: "紹介者から募集終了を聞き、次の掲示を待つ"
            },
            p: -1
          }
        ]
      ),
      $terraData.K("工場の話は諦め、別の働き口を探す", {}, [
        1,
        "いつまでもあてにならない話にすがるのはやめ、別の仕事口を探すことにした。",
        {
          lifeGoal: {
            id: "ursus-zelgrad-work",
            action: "abandon",
            note: "この求人の確認を終え、別の仕事を探す"
          },
          p: 0
        }
      ])
    ]
  });

  $terraData.FLAG_REGISTRY["zelgrad_evacuated"] = {
    label: "ゼルグラード危機から市外へ退避した",
    description: "1102年ゼルグラードの燃料枯渇・虐殺危機において、市外へ避難した個別記録。",
    type: "boolean",
    valueDomain: "0/1",
    lifecycle: "生涯記録",
    source: "SRC_URSUS_EP17_EVAC",
    engine: "地域・移動イベント",
    tags: [],
    producers: [],
    clearers: [],
    consumers: [],
    engineClearers: []
  };
  $terraData.FLAG_REGISTRY["zelgrad_stay"] = {
    label: "ゼルグラードの避難集会後も部屋に残った",
    description: "1102年ゼルグラードの避難集会後、市外へ出ずに都市内に留まった個別記録。",
    type: "boolean",
    valueDomain: "0/1",
    lifecycle: "生涯記録",
    source: "SRC_URSUS_EP17_EVAC",
    engine: "地域・移動イベント",
    tags: [],
    producers: [],
    clearers: [],
    consumers: [],
    engineClearers: []
  };

  $terraData.EV.push({
    id: "life_ursus_zelgrad_evacuation",
    conf: "B",
    references: ["SRC_URSUS_EP17_EVAC", "SRC_URSUS_EP17_TIMELINE", "SRC_URSUS_ZELGRAD_CITY"],
    st: ["青年", "壮年"],
    ge: { year: 1102, age: 18 },
    le: { year: 1102, age: 60 },
    once: true,
    w: 0.34,
    show: s => s.res?.n === "ウルサス" && s.local?.city === "ゼルグラード" && s.home === "移動都市",
    t: "広場に集められた住民たちの前で、北原の元坑夫を名乗る男が軍の研究と感染者の非道な扱いを声を限りに告発し、今すぐ街を出るよう叫んだ。ざわめきが広がり、家財道具を抱えた人々が門へ向かって雪崩れ込み始める。自分も荷物を背負って走るか、足元で転んだ人に手を貸すか、それともこの街に残るか。",
    c: [
      $terraData.K("人波に身を投じ、とにかく市外へ逃げる", {}, [
        1,
        "背負えるだけの荷物をひっつかみ、門へ殺到する群衆の列に飛び込んだ。移動都市の外へ吐き出されると、冷たい風のなかで今夜しのげる場所を探して歩き続けた。",
        {
          displacement: "displaced",
          job: 0,
          lifeAffiliations: [
            {
              id: "ursus-zelgrad-factory",
              action: "leave",
              onlyIfActive: true,
              note: "市外へ退避し、ゼルグラードの工場補助職を離れた"
            }
          ],
          lifeGoals: [
            {
              id: "ursus-zelgrad-work",
              action: "compromise",
              onlyIfActive: true,
              note: "退避により工場を離れ、避難先で生計を立て直す"
            }
          ],
          lifeGoal: {
            id: "ursus-zelgrad-after-crisis",
            title: "ゼルグラード危機後の住まいと生計を整える",
            priority: "生計と居場所",
            action: "start",
            note: "市外へ出て、今夜の寝床を探し始めた"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "ゼルグラードを離れた一人",
            kind: "individual-evacuation",
            description: "危機のさなか、市外へ退避した",
            basis: "chapter17-civilian-scene; individual-game-branch"
          },
          fl: { zelgrad_evacuated: 1 },
          p: -2
        }
      ]),
      $terraData.K("押し倒された人を荷台へ引き上げるのを手伝う", {}, [
        1,
        "人波に押されて立ち上がれなくなっていた人を抱え起こし、近くの台車へ乗せるのに手を貸した。台車が門へ向かう列へ飲み込まれるのを見届けてから、荒い息をついて広場の端へ退いた。",
        {
          lifeGoal: {
            id: "ursus-zelgrad-civilian-aid",
            title: "危機のさなかに一人の退避を手伝う",
            priority: "地域",
            action: "complete",
            note: "倒れていた人を台車へ移すのに手を貸した"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "ゼルグラードの退避列にいた一人",
            kind: "individual-evacuation-assistance",
            description: "倒れていた人を台車へ移すのを手伝った",
            basis: "chapter17-civilian-scene; individual-game-branch"
          },
          fl: { zelgrad_evacuated: 1 },
          p: -1,
          rl: 1
        }
      ]),
      $terraData.K("外へ出ても行く当てがなく、部屋にとどまる", {}, [
        1,
        "門へ向かう人々の背中を見送り、自分の部屋へ戻って仕事道具と食料を確かめた。外の怒号が遠のくまで、いつでも飛び出せるよう靴を履いたままベッドの端に腰かけていた。",
        {
          lifeGoal: {
            id: "ursus-zelgrad-after-crisis",
            title: "ゼルグラードでの暮らしを続けながら退路を見直す",
            priority: "生計と居場所",
            action: "start",
            note: "集会では退避せず、身の置き場を再検討する"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "ゼルグラードに残った一人",
            kind: "individual-stay-decision",
            description: "集会の後、退避せずその場に残った",
            basis: "chapter17-civilian-scene; individual-game-branch"
          },
          fl: { zelgrad_stay: 1 },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_zelgrad_purge_trap",
    conf: "B",
    references: ["SRC_URSUS_EP17_EVAC", "SRC_URSUS_EP17_TIMELINE", "SRC_URSUS_ZELGRAD_CITY"],
    st: ["青年", "壮年", "老年"],
    ge: { year: 1102, age: 18 },
    le: { year: 1102, age: 60 },
    once: true,
    w: 0.9,
    show: s =>
      s.res?.n === "ウルサス" &&
      s.local?.city === "ゼルグラード" &&
      s.year === 1102 &&
      s.inf > 0 &&
      !s.fl?.zelgrad_evacuated,
    t: "広場の騒乱が遠ざかり冷え込みが厳しさを増すなか、重装憲兵と防護服を着た工廠監理官が労働区画の出口を鉄柵で完全封鎖した。『都市エンジンの緊急点検のため、感染者全員を中央炉心区画へ集約・保護する』と拡声器が冷ややかに告げ、点検車列への乗車を命じている。だが、同乗を拒んだ作業員が無言で殴り倒されるのを見て、事態が尋常ではないことを悟った。",
    c: [
      $terraData.K(
        "危険を察知し、排気ダクトを破って極寒の外壁から脱出する",
        {},
        [
          0.8,
          "憲兵の監視の目を盗み、工具で排気ダクトの格子を蹴破って外壁のキャットウォークへ飛び出した。吹き荒れる雪嵐の中、身を切るような寒風に煽られながら外壁の梯子を滑り降り、命からがら荒野の雪原へ逃げ延びた。",
          {
            fl: { zelgrad_evacuated: 1 },
            displacement: "displaced",
            job: 0,
            cash: 0,
            h: -15,
            p: -5,
            lifeAffiliations: [
              {
                id: "ursus-zelgrad-factory",
                action: "leave",
                onlyIfActive: true,
                note: "炉心の集約虐殺から脱出し、工場補助職を離れた"
              }
            ]
          }
        ],
        [
          1,
          "排気ダクトを抜けた先で巡回兵に見咎められ、発砲を受けた。肩を撃ち抜かれながらも雪原へ転がり落ち、血を流しながら吹雪の中を這うように逃げ延びた。",
          {
            fl: { zelgrad_evacuated: 1 },
            displacement: "displaced",
            job: 0,
            cash: 0,
            h: -35,
            p: -8
          }
        ]
      ),
      $terraData.K(
        "当局の指示に従い、中央炉心への点検車列に乗り込む",
        {},
        [
          1,
          "拡声器の言葉を信じて幌付きの車列に乗り込んだ。だがトラックが着いた先は保護宿舎ではなく、二重に施錠された巨大な中央炉室の入口だった。後悔の叫びが上がる間もなく、扉は外側から完全に密閉された。",
          {
            d: [
              "迫害死（ゼルグラード燃料化虐殺）",
              "1102年のゼルグラード燃料危機において、当局の欺瞞命令に従った結果、炉心の源石燃料として感染者集約施設で虐殺された。"
            ]
          }
        ]
      )
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_zelgrad_displacement_review",
    conf: "B",
    references: [
      "SRC_URSUS_EP17_EVAC",
      "SRC_URSUS_EP17_TIMELINE",
      "SRC_URSUS_ZELGRAD_CITY",
      "SRC_TERRA_LIFECOURSE"
    ],
    st: ["青年", "壮年", "老年"],
    ge: { year: 1104, age: 18 },
    le: { year: 1110, age: 70 },
    cd: 3,
    w: 0.28,
    show: s =>
      s.res?.n === "ウルサス" &&
      s.displacement?.status === "shelter" &&
      s.lifeRecord?.goals?.some(
        g => g.id === "ursus-zelgrad-after-crisis" && ["active", "paused", "compromised"].includes(g.status)
      ),
    t: "ゼルグラードを逃げ出してから数年が過ぎた。身を寄せた避難先で日銭を稼ぎながら、あの街へ戻る手立てがあるのか考え続けている。懐の金と相談し、帰還を試みるか、今の土地で生きていくか決める時が来た。",
    c: [
      $terraData.K("帰るかどうかは決めず、まずは今の町で働き口を探す", {}, [
        1,
        "いつ戻れるか分からない街のことを考えるのは後回しにし、まずは今日食べていくための仕事を町へ探しに出た。",
        {
          lifeGoal: {
            id: "ursus-zelgrad-after-crisis",
            action: "pause",
            note: "現在地での仕事を探しながら、帰還判断は保留"
          },
          p: 1
        }
      ]),
      $terraData.K(
        "つてを辿り、ひとりでゼルグラードへ戻ってみる",
        {
          en: s => s.job === 0 && !s.lifeRecord?.affiliations?.some(
            a => a.id === "ursus-displaced-repair-workshop" &&
              ["active", "crisis", "suspended"].includes(a.status)
          ),
          why: "避難先での勤務を終え、仕事の引継ぎを済ませる必要がある"
        },
        [
          0.45,
          "行き交う荷馬車や旅人に道を尋ね続け、ようやくゼルグラードの労働区画へたどり着いた。かつての職場は影も形もなく、まずは雨風をしのげる寝床と日雇いの仕事を探して通りを歩いた。",
          {
            displacement: "rebuilt",
            job: 0,
            home: "移動都市",
            localKind: "移動都市の避難・労働区画",
            localCity: "ゼルグラード",
            lifeGoal: {
              id: "ursus-zelgrad-after-crisis",
              action: "compromise",
              note: "労働区画へ戻り、寝床と働き口を探した"
            },
            regionalImpact: {
              region: "ウルサス",
              entity: "ゼルグラードへ戻った一人",
              kind: "individual-return",
              description: "労働区画へ戻り、寝床と働き口を探した",
              basis: "individual-game-branch"
            },
            p: -1
          }
        ],
        [
          1,
          "検問と荒れた道に阻まれて先へ進めず、途中で引き返すしかなかった。減った携帯食料を鞄の底で数えながら、また動ける日を待つことにした。",
          {
            lifeGoal: {
              id: "ursus-zelgrad-after-crisis",
              action: "pause",
              note: "今回の帰還はかなわず、次の確認時期を先へ送った"
            },
            p: -2
          }
        ]
      ),
      $terraData.K("ゼルグラードへ戻ることは諦め、この土地で暮らしを立て直す", {}, [
        1,
        "あの街へ戻る未練を断ち切り、今いる町で腰を落ち着けて暮らせる部屋と仕事を探すことにした。",
        {
          lifeGoal: {
            id: "ursus-zelgrad-after-crisis",
            action: "compromise",
            note: "帰還を優先せず、現在地で暮らしを組み立てる"
          },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_zelgrad_stay_review",
    conf: "B",
    references: [
      "SRC_URSUS_EP17_EVAC",
      "SRC_URSUS_EP17_TIMELINE",
      "SRC_URSUS_ZELGRAD_CITY",
      "SRC_TERRA_LIFECOURSE"
    ],
    st: ["青年", "壮年", "老年"],
    ge: { year: 1103, age: 18 },
    le: { year: 1110, age: 70 },
    once: true,
    w: 0.25,
    show: s =>
      s.res?.n === "ウルサス" &&
      s.local?.city === "ゼルグラード" &&
      !s.displacement &&
      s.lifeRecord?.goals?.some(g => g.id === "ursus-zelgrad-after-crisis" && g.status === "active"),
    t: "あの騒動の日に街へ残ると決めてから、一年余りが過ぎた。空き部屋の増えた労働区画で、今も荷物をまとめて出ていく人の姿を見かける。このまま踏みとどまるか、今からでも街を出るか考えた。",
    c: [
      $terraData.K("これからもこの街で暮らしていくと腹を決める", {}, [
        1,
        "もう迷わないと決め、戸口に積みっぱなしにしていた非常用の荷物をほどいて部屋の棚へ戻した。",
        {
          lifeAffiliations: [
            {
              id: "ursus-zelgrad-factory",
              action: "continue",
              onlyIfActive: true,
              note: "ゼルグラードに残り、工場の担当を続けた"
            }
          ],
          lifeGoals: [
            {
              id: "ursus-zelgrad-work",
              action: "continue",
              onlyIfActive: true,
              note: "危機後も工場補助職へ通い続けた"
            }
          ],
          lifeGoal: {
            id: "ursus-zelgrad-after-crisis",
            action: "complete",
            note: "この町に残り、暮らしを続ける"
          },
          p: 1
        }
      ]),
      $terraData.K("今からでも荷物をまとめ、街を出る列に加わる", {}, [
        1,
        "部屋の荷物を背負える分だけまとめ、市外へ向かう人々の列に加わった。門を抜けた先で一度だけ振り返り、水筒の残りを確かめてから歩き出した。",
        {
          displacement: "displaced",
          job: 0,
          lifeAffiliations: [
            {
              id: "ursus-zelgrad-factory",
              action: "leave",
              onlyIfActive: true,
              note: "後年に市外へ退避し、ゼルグラードの工場補助職を離れた"
            }
          ],
          lifeGoals: [
            {
              id: "ursus-zelgrad-work",
              action: "compromise",
              onlyIfActive: true,
              note: "後年の退避により工場を離れ、避難先で生計を立て直す"
            }
          ],
          lifeGoal: {
            id: "ursus-zelgrad-after-crisis",
            action: "continue",
            note: "後年に荷物をまとめ、市外へ向かう列に加わった"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "ゼルグラードから後年に退避を始めた一人",
            kind: "individual-delayed-evacuation",
            description: "後年に荷物をまとめ、市外へ向かう列に加わった",
            basis: "individual-game-branch"
          },
          p: -2
        }
      ]),
      $terraData.K("すぐには出ないが、いつでも逃げられるよう荷物をまとめておく", {}, [
        1,
        "今日は街を出ず、いつもの寝床へ戻った。ただ、いつでも飛び出せるよう靴と水筒だけは枕元に置き、戸口に荷袋をくくっておいた。",
        {
          lifeAffiliations: [
            {
              id: "ursus-zelgrad-factory",
              action: "continue",
              onlyIfActive: true,
              note: "ゼルグラードに残り、工場の担当を続けた"
            }
          ],
          lifeGoals: [
            {
              id: "ursus-zelgrad-work",
              action: "continue",
              onlyIfActive: true,
              note: "危機後も工場補助職へ通い続けた"
            }
          ],
          lifeGoal: {
            id: "ursus-zelgrad-after-crisis",
            action: "abandon",
            note: "今日は退避せず、荷物をまとめて暮らしを続けた"
          },
          p: 0
        }
      ])
    ]
  });

  const isBackInZelgrad = s =>
      s.local?.city === "ゼルグラード" &&
      !["shelter", "displaced"].includes(s.displacement?.status) &&
      s.lifeRecord?.regionalImpacts?.some(
        impact => impact.region === "ウルサス" && impact.kind === "individual-return"
      ),
    hasZelgradFactoryHistory = s =>
      s.lifeRecord?.affiliations?.some(
        affiliation =>
          affiliation.id === "ursus-zelgrad-factory" &&
          ["active", "left"].includes(affiliation.status)
      ),
    hasDisplacementGoal = s =>
      s.lifeRecord?.goals?.some(
        goal =>
          goal.id === "ursus-zelgrad-after-crisis" &&
          ["active", "paused", "compromised"].includes(goal.status)
      );

  $terraData.EV.push(
    {
      id: "life_ursus_zelgrad_displaced_work",
      conf: "B",
      references: ["SRC_URSUS_EP17_EVAC", "SRC_URSUS_ZELGRAD_CITY", "SRC_ZELGRAD_DISPLACED_WORK_MODEL"],
      st: ["青年", "壮年", "老年"],
      ge: { year: 1103, age: 18 },
      le: { year: 1110, age: 70 },
      once: true,
      w: 0.32,
      show: s =>
        s.job === 0 &&
        ["shelter", "rebuilt"].includes(s.displacement?.status) &&
        hasZelgradFactoryHistory(s) &&
        s.lifeRecord?.skills?.some(skill => skill.id === "industrial-production") &&
        hasDisplacementGoal(s),
      t: s =>
        isBackInZelgrad(s)
          ? "労働区画へ戻ってはきたものの、以前働いていた工場の持ち場には戻れそうになかった。近くの修理工房が部品の仕分けや検品の手伝いを探していると聞き、工場で身につけた腕が通用するか考えてみた。"
          : "避難先で狭い寝床を借り、日銭を稼げる仕事を探して歩き回った。近くの修理工房が部品の仕分けや検品の手伝いを募集していると聞き、ゼルグラードの工場で覚えた仕事を思い起こした。",
      c: [
        $terraData.K(
          "修理工房を訪ね、工場で培った経験を話して雇ってもらえないか頼む",
          {},
          [
            0.38,
            "工場で扱っていた部品や検品のやり方を実演してみせると、親方がうなずいて補助職として雇ってくれた。油の染みた作業台で、部品の仕分けから新しい仕事が始まった。",
            {
              job: 2,
              lifeAffiliations: [
                {
                  id: "ursus-zelgrad-factory",
                  action: "leave",
                  onlyIfActive: true,
                  note: "避難後の仕事探しを始める時点で旧工場との在職を整理"
                },
                {
                  id: "ursus-displaced-repair-workshop",
                  title: "近隣の修理工房",
                  kind: "employer",
                  action: "join",
                  role: "部品の仕分け・製造補助"
                }
              ],
              lifeGoals: [
                {
                  id: "ursus-zelgrad-work",
                  action: "compromise",
                  onlyIfActive: true,
                  note: "避難後に旧工場の在籍を閉じ、就労目標を見直した"
                }
              ],

              lifeGoal: {
                id: "ursus-zelgrad-after-crisis",
                action: "compromise",
                note: "工場経験を使い、現在地の修理工房で補助職を始めた"
              },
              lifeSkill: {
                id: "industrial-production",
                title: "工場の製造補助",
                delta: 1,
                context: "現在地の修理工房で部品を仕分け、工場経験を使った"
              },
              p: 2
            }
          ],
          [
            1,
            "工房の親方にこれまでの経験を話したが、「今は人を増やす余裕がない」と断られた。また空きが出ないか、時折顔を出して確かめることにした。",
            {
              job: 0,
              lifeAffiliations: [
                {
                  id: "ursus-zelgrad-factory",
                  action: "leave",
                  onlyIfActive: true,
                  note: "避難後の求職時に旧工場との在職を整理"
                }
              ],
              lifeGoals: [
                {
                  id: "ursus-zelgrad-work",
                  action: "compromise",
                  onlyIfActive: true,
                  note: "避難後に旧工場の在籍を閉じ、就労目標を見直した"
                }
              ],

              lifeGoal: {
                id: "ursus-zelgrad-after-crisis",
                action: "pause",
                note: "修理工房の選考は不採用となり、次の募集を待つ"
              },
              lifeSkill: {
                id: "industrial-production",
                title: "工場の製造補助",
                delta: 1,
                context: "工場で覚えた手順を避難先で書き留めた"
              },
              p: -1
            }
          ]
        ),
        $terraData.K("手元の工具を手入れしながら、次の求人が出るのを待つ", {}, [
          1,
          "工場で使っていた馴染みの工具の錆を落とし、いつでも働けるよう整えておいた。良い募集が出るまでは、寝床と日々の食事をつなぐことを優先した。",
          {
            job: 0,
            lifeAffiliations: [
              {
                id: "ursus-zelgrad-factory",
                action: "leave",
                onlyIfActive: true,
                note: "避難後の生活を整えるため旧工場との在職を整理"
              }
            ],
            lifeGoals: [
              {
                id: "ursus-zelgrad-work",
                action: "compromise",
                onlyIfActive: true,
                note: "避難後に旧工場の在籍を閉じ、就労目標を見直した"
              }
            ],

            lifeGoal: {
              id: "ursus-zelgrad-after-crisis",
              action: "pause",
              note: "工場経験を書き残し、避難先の暮らしを先に整える"
            },
            lifeSkill: {
              id: "industrial-production",
              title: "工場の製造補助",
              delta: 1,
              context: "部品の名前と検品の順番を避難先で書き残した"
            },
            p: 0
          }
        ]),
        $terraData.K("今は無理に職を探さず、寝床と配給の確保に専念する", {}, [
          1,
          "焦って仕事を探すのはいったんやめ、雨風をしのげる寝床の確保と配給の列に並ぶことを優先した。工場の作業着は荷袋の底にしまい込んだ。",
          {
            job: 0,
            lifeAffiliations: [
              {
                id: "ursus-zelgrad-factory",
                action: "leave",
                onlyIfActive: true,
                note: "避難後の生活を整えるため旧工場との在職を整理"
              }
            ],
            lifeGoals: [
              {
                id: "ursus-zelgrad-work",
                action: "compromise",
                onlyIfActive: true,
                note: "避難後に旧工場の在籍を閉じ、就労目標を見直した"
              }
            ],

            lifeGoal: {
              id: "ursus-zelgrad-after-crisis",
              action: "compromise",
              note: "避難先では就職より寝床と食料の確保を優先"
            },
            p: 1
          }
        ])
      ]
    },
    {
      id: "life_ursus_zelgrad_displaced_work_review",
      conf: "B",
      references: ["SRC_ZELGRAD_DISPLACED_WORK_MODEL", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      ge: { year: 1105, age: 18 },
      le: { year: 1112, age: 80 },
      cd: 3,
      w: 0.29,
      show: s =>
        ["shelter", "rebuilt"].includes(s.displacement?.status) &&
        s.job === 2 &&
        lifeAffiliationAtRecordedLocality(s, "ursus-displaced-repair-workshop") &&
        s.lifeRecord?.affiliations?.some(
          affiliation =>
            affiliation.id === "ursus-displaced-repair-workshop" &&
            affiliation.status === "active" &&
            s.year - (affiliation.startedYear ?? s.year) >= 2
        ),
      t: s =>
        isBackInZelgrad(s)
          ? "労働区画の修理工房で働き始めて二年余りが過ぎた。工具の並びも親方の癖もすっかり覚えた今、このままここで働き続けるか、別の仕事を探すか考えた。"
          : "避難先の修理工房に雇われてから二年余りが過ぎた。仕事の手順もすっかり身体に馴染んだ今、このまま工房で働き続けるか、別の働き口を探すか考えた。",
      c: [
        $terraData.K("このまま工房に残り、新しく入った手伝いにも手順を教える", {}, [
          1,
          "部品の仕分けと検品のコツを若い手伝いにも教えながら、これまで通り工房の作業台に立ち続けた。",
          {
            lifeAffiliation: {
              id: "ursus-displaced-repair-workshop",
              action: "continue",
              note: "本人が工房に残り、補助職を続けた"
            },
            lifeGoal: {
              id: "ursus-zelgrad-after-crisis",
              action: "continue",
              onlyIfActive: true,
              note: "避難先で工場経験を生かす仕事を続けた"
            },
            lifeSkill: {
              id: "industrial-production",
              title: "工場の製造補助",
              delta: 1,
              context: "修理工房の検品手順を手帳にまとめて使った"
            },
            p: 1
          }
        ]),
        $terraData.K(
          "工房の仕事を続け、借りた部屋を暮らしの拠点として整える",
          {
            show: s => !s.lifeRecord?.goals?.some(
              g => g.id === "ursus-zelgrad-after-crisis" && g.status === "achieved"
            )
          },
          [
            1,
            "親方とこれからの勤務を確かめ、部屋の貸主とも賃借の約束を交わした。仕事帰りに戻る寝床が定まり、避難してから続けてきた住まいと生計の立て直しに、ようやく区切りがついた。",
            {
              displacement: "rebuilt",
              lifeAffiliation: {
                id: "ursus-displaced-repair-workshop",
                action: "continue",
                note: "勤務を続け、借りた部屋を生活の拠点とした"
              },
              lifeGoal: {
                id: "ursus-zelgrad-after-crisis",
                action: "complete",
                note: "工房の仕事と部屋の賃借を確かめ、生活再建を完了"
              },
              p: 2
            }
          ]
        ),
        $terraData.K("工房に暇を乞い、より条件の良い働き口を探す", {}, [
          1,
          "世話になった親方に礼を言って工房を離れた。二つの現場で鍛えた腕を頼りに、次の仕事を探して街へ出た。",
          {
            job: 0,
            lifeAffiliation: {
              id: "ursus-displaced-repair-workshop",
              action: "leave",
              note: "本人が別の仕事を探すため、避難先の修理工房を離れた"
            },
            lifeGoal: {
              id: "ursus-zelgrad-after-crisis",
              action: "compromise",
              onlyIfActive: true,
              note: "修理工房を離れ、別の求人を探す"
            },
            p: 0
          }
        ])
      ]
    },
    {
      id: "life_ursus_zelgrad_post_settlement_job_search",
      conf: "B",
      references: ["SRC_ZELGRAD_DISPLACED_WORK_MODEL", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      ge: { year: 1106, age: 18 },
      le: { year: 1135, age: 85 },
      after: { id: "life_ursus_zelgrad_displaced_work_review", min: 1 },
      once: true,
      w: 0.32,
      show: s =>
        s.job === 0 &&
        s.lifeRecord?.affiliations?.some(a =>
          a.id === "ursus-displaced-repair-workshop" && a.status === "left"
        ) &&
        s.lifeRecord?.goals?.some(g =>
          g.id === "ursus-zelgrad-after-crisis" && g.status === "achieved"
        ) &&
        !s.lifeRecord?.goals?.some(g => g.id === "ursus-post-settlement-reemployment"),
      t: "工房での仕事を終え、収入の見通しが立たなくなった。以前に住まいと生計を立て直した日々まで消えたわけではないが、今の暮らしを続けるには別の働き口が要る。職探しを始めるか、しばらく暮らしの立て直しを優先するか考えた。",
      c: [
        $terraData.K("工場と工房で覚えた手順をまとめ、次の働き口を探す", {}, [
          1,
          "使い慣れた工具を手入れし、製造補助と検品で覚えた手順を手帳へ書き出した。求人を出している店や工房を訪ね、これまでの経験を伝えながら、次の仕事を探し始めた。",
          {
            lifeGoal: {
              id: "ursus-post-settlement-reemployment",
              title: "立て直した暮らしを支える次の働き口を見つける",
              priority: "生計",
              action: "start",
              note: "以前の工房を離れ、経験を生かす再就職を目指した"
            },
            p: 1
          }
        ]),
        $terraData.K("当面は食費と住まいの支払いを確かめ、求職を急がない", {}, [
          1,
          "手元の金と次の支払日を確かめ、今すぐ動ける範囲を考えた。道具は捨てずに手元へ残し、身体を休めながら次の募集を待つことにした。",
          {
            lifeGoal: {
              id: "ursus-post-settlement-reemployment",
              title: "立て直した暮らしを支える次の働き口を見つける",
              priority: "生計",
              action: "pause",
              note: "暮らしの支払いを確認し、再就職の判断を保留した"
            },
            p: 0
          }
        ])
      ]
    },
    {
      id: "life_ursus_zelgrad_post_settlement_work_review",
      conf: "B",
      references: ["SRC_ZELGRAD_DISPLACED_WORK_MODEL", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      ge: { year: 1107, age: 18 },
      le: { year: 1140, age: 90 },
      after: { id: "life_ursus_zelgrad_post_settlement_job_search", min: 1 },
      cd: 2,
      w: 0.29,
      show: s =>
        s.lifeRecord?.goals?.some(g =>
          g.id === "ursus-post-settlement-reemployment" &&
          ["active", "paused", "compromised"].includes(g.status)
        ),
      t: s => s.job > 0
        ? "前の工房を離れてから、新しい仕事に就いた。職場が変わっても、かつて取り戻した生活の記憶と、二つの現場で覚えた手順は残っている。今の働き方で暮らしを続けられそうか確かめた。"
        : "次の働き口を探しながら時間が過ぎた。暮らしの用事と求人の条件を見比べ、今できることから動くか、もうしばらく様子を見るか考えた。",
      c: [
        $terraData.K("新しい仕事に就いたことを区切りとして記録する", {
          show: s => s.job > 0
        }, [
          1,
          "新しい職場での仕事を続けることにした。以前の工場や修理工房の経験は、日々の手順を見直すときにも役に立っている。",
          {
            lifeGoal: {
              id: "ursus-post-settlement-reemployment",
              action: "complete",
              note: "新しい仕事に就き、再就職の目標を達成した"
            },
            p: 1
          }
        ]),
        $terraData.K("これまでの経験を生かし、求人を探し続ける", {
          show: s => s.job === 0
        }, [
          1,
          "工場と工房で覚えたことを書き留めた手帳を携え、働き口のある通りを歩いた。条件が合う仕事に出会うまで、また確かめて回るつもりだ。",
          {
            lifeGoal: {
              id: "ursus-post-settlement-reemployment",
              action: "continue",
              note: "前の職場での経験を使い、引き続き求人を探した"
            },
            p: 0
          }
        ]),
        $terraData.K("いったん求職を休み、今の暮らしを優先する", {
          show: s => s.job === 0
        }, [
          1,
          "すぐに次の職場を決めるのはやめた。食費や寝床の見通しを一つずつ確かめ、動ける日まで求人の話を聞く程度にとどめた。",
          {
            lifeGoal: {
              id: "ursus-post-settlement-reemployment",
              action: "pause",
              note: "次の職場を決める前に生活の整理を優先した"
            },
            p: 0
          }
        ])
      ]
    }
  );
});
