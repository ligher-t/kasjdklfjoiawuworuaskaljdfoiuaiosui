// relationships/person-ties: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("relationships/person-ties", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "v82src",
    ["SRC_V82_CLOSURE", "SRC_V82_HUMUS", "SRC_V82_SUZURAN_MODULE", "SRC_V82_TW", "SRC_V82_SIM"],
    false
  );

  $define(
    "v82p",
    (s, kind) => {
      const a = s.community?.people || {},
        episode = kind === "workplace" ? currentPlayerEmployment(s) : null,
        site = kind === "workplace"
          ? episode?.kind === "wage-employment" ? { facilityId:episode.siteId } : null
          : s.siteAffiliations?.[kind];
      if (!site) return null;
      return (
        Object.values(a)
          .filter(p => p.facilityId === site.facilityId && p.actualStatus === "working")
          .sort((a, b) => b.metYear - a.metYear)[0] || null
      );
    },
    false,
    true
  );

  $terraData.EV.push(
    {
      id: "v82_colleague_exclusion_statement",
      conf: "S",
      references: $terraData.v82src,
      st: ["青年", "壮年", "老年"],
      cd: 5,
      w: 0.74,
      show: s =>
        s.age >= 18 &&
        !!s.job &&
        !!$terraData.v82p(s, "workplace") &&
        $terraData.v82p(s, "workplace").socialBeliefs?.infected >= 66,
      t: "休憩時間、同じ職場の顔なじみが新しく応募してきた感染者の噂を持ち出し、「ああいう連中は最初から入れない方がいい」と吐き捨てた。相手はこちらの顔を見て、当然うなずくだろうと言わんばかりに相槌を待っている。",
      c: [
        $terraData.K(
          "話に調子を合わせ、噂を別の同僚にも言いふらす",
          {
            en: { ge: { biasInfected: 30 } },
            why: "感染者を排除する主張に自分から賛成するほどの敵意はない。"
          },
          [
            1,
            "「雇わない方が身のためだ」と同調し、休憩室にいた別の同僚にもその噂を言い広めた。応募者がどんな人間か確かめもしないまま、悪評だけが職場に回った。",
            {
              personTieAction: { kind: "workplace", action: "agree-prejudice" },
              biasInf: 4,
              socialConflictAction: { action: "exclude", target: "infected", context: "workplace-gossip" }
            }
          ]
        ),
        $terraData.K("顔も知らない相手を決めつけるのはおかしいと言い返す", {}, [
          1,
          "「会ったこともないのに悪く言うのは筋が違うだろう」と正面から言い返した。気まずい沈黙が落ち、午後は仕事に必要な声かけだけを交わした。",
          {
            personTieAction: { kind: "workplace", action: "challenge-prejudice" },
            equityGain: 3,
            biasInf: -4
          }
        ]),
        $terraData.K("聞こえなかったふりをして、仕事の段取りに話を戻す", {}, [
          1,
          "「そろそろ午後の荷が来る頃だ」と話を逸らして立ち上がった。噂話への賛否は、最後まで口にしなかった。",
          { personTieAction: { kind: "workplace", action: "keep-distance" } }
        ])
      ]
    },
    {
      id: "v82_disclose_to_colleague",
      conf: "S",
      references: $terraData.v82src,
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.78,
      show: s =>
        !!s.inf &&
        !!s.fl?.dg &&
        s.age >= 18 &&
        !!$terraData.v82p(s, "workplace") &&
        !$terraData.v82p(s, "workplace").knowsPlayerInfectionSince,
      t: "通院のたびに早く職場を抜ける言い訳を探すのが苦しくなってきた。隣の持ち場で働く同僚に、自分が鉱石病だと打ち明けるべきか、今日も作業台の前で迷った。",
      c: [
        $terraData.K("病名を打ち明け、通院の日に持ち場を抜けさせてほしいと頼む", {}, [
          1,
          "思い切って鉱石病だと伝え、診察の日に少し早く上がる相談をした。言い終えた瞬間、相手の表情がどう変わるかを見るのが怖くて手元に目を落とした。",
          { personTieAction: { kind: "workplace", action: "disclose-infection" }, p: -1 }
        ]),
        $terraData.K("今は打ち明けず、言い訳をしながら通院を続ける", {}, [
          1,
          "結局今日も本当の病名は喉の奥にしまい込み、家の用事があるとだけ言って診察の時間をやりくりした。",
          { p: -1 }
        ]),
        $terraData.K("病名は伏せたまま、早退や交代の決まりだけを確かめる", {}, [
          1,
          "鉱石病だとは匂わせず、通院でシフトを交代してもらうときの手続きだけをさりげなく尋ねておいた。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "v82_colleague_rejects_patient",
      conf: "S",
      references: $terraData.v82src,
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 1.1,
      show: s =>
        s.job > 0 &&
        !!s.inf &&
        !!s.fl?.dg &&
        !!$terraData.v82p(s, "workplace") &&
        !!$terraData.v82p(s, "workplace").knowsPlayerInfectionSince &&
        $terraData.v82p(s, "workplace").socialBeliefs?.infected >= 66,
      t: "あなたが鉱石病だと知った翌日から、昨日まで隣で笑っていた同僚が露骨に作業台を離した。仕事の引き継ぎさえ直接口をきかず、わざわざ別の人間を通すようになった。",
      fx: { personTieAction: { kind: "workplace", action: "rejection-received" }, p: -5 }
    },
    {
      id: "v82_colleague_stays",
      conf: "S",
      references: $terraData.v82src,
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.82,
      show: s =>
        s.job > 0 &&
        !!s.inf &&
        !!s.fl?.dg &&
        !!$terraData.v82p(s, "workplace") &&
        !!$terraData.v82p(s, "workplace").knowsPlayerInfectionSince &&
        $terraData.v82p(s, "workplace").socialBeliefs?.infected <= 30,
      t: "あなたが鉱石病だと知った同僚は、声をひそめて「重い荷を持つときや通院の日は遠慮なく言えよ」と気遣ってくれた。翌日も、何ひとつ変わらない態度で隣の持ち場に立った。",
      fx: { personTieAction: { kind: "workplace", action: "ordinary-contact" }, p: 2 }
    },
    {
      id: "v82_person_after_rejection",
      conf: "S",
      references: $terraData.v82src,
      st: ["青年", "壮年", "老年"],
      cd: 6,
      w: 0.64,
      show: s =>
        !!$terraData.v82p(s, "workplace") &&
        !!s.personTies?.links?.[$terraData.v82p(s, "workplace").id]?.history?.some(
          x => x.action === "rejection-received"
        ),
      t: "かつて病を知った途端に席を離した同僚と、どうしても二人で工程を引き継がなければならなくなった。張りつめた空気のなか、どう切り出すか迷った。",
      c: [
        $terraData.K("わだかまりは脇に置き、仕事に必要な確認だけを淡々と伝える", {}, [
          1,
          "感情を込めずに作業の進み具合だけを伝えた。相手も一瞬ためらってから引き継ぎに答え、気まずいながらも滞りなく工程を回した。",
          { personTieAction: { kind: "workplace", action: "repair-attempt" }, p: 1 }
        ]),
        $terraData.K("直接顔を合わせずに済むよう、伝言板や別の人を介して連絡する", {}, [
          1,
          "こちらからも無理に歩み寄らず、別の人を通じて必要な引き継ぎだけを済ませ、自分の持ち場の作業に没頭した。",
          { personTieAction: { kind: "workplace", action: "respect-boundary" } }
        ]),
        $terraData.K("あの時あからさまに避けられて傷ついたと、本人の前で口にする", {}, [
          1,
          "「あの時、黙って席を離されたことは忘れていない」と静かに告げた。同僚は気まずそうに唇を噛み、手元の工具から目を上げなかった。",
          { personTieAction: { kind: "workplace", action: "state-harm" }, p: -1 }
        ])
      ]
    },
    {
      id: "v82_known_colleague_support",
      conf: "S",
      references: $terraData.v82src,
      st: ["青年", "壮年", "老年"],
      cd: 6,
      w: 0.68,
      show: s =>
        !!$terraData.v82p(s, "workplace") &&
        !!s.socialAftermath?.episodes?.some(x => x.status === "active" && s.year - x.year <= 3) &&
        !s.personTies?.links?.[$terraData.v82p(s, "workplace").id]?.history?.some(
          x => x.action === "rejection-received"
        ),
      t: "理不尽な仕打ちを受けて心がささくれ立っていた日、いつも気にかけてくれる同僚と休憩所で二人きりになった。胸のうちをこぼすべきか迷った。",
      c: [
        $terraData.K(
          "溜め込んでいた悔しさや心細さを、話せる範囲で打ち明ける",
          {},
          [
            0.6,
            "同僚は余計な説教も口挟みもせず、温かい茶を淹れて休憩の鐘が鳴るまで黙って耳を傾けてくれた。",
            { personTieAction: { kind: "workplace", action: "support-given" }, p: 2 }
          ],
          [
            1,
            "ちょうど急ぎの呼び出しが入り、同僚は申し訳なさそうに現場へ戻っていった。また別の機会に聞いてもらうことにした。",
            { personTieAction: { kind: "workplace", action: "respect-boundary" } }
          ]
        ),
        $terraData.K("愚痴は飲み込み、次の作業の打ち合わせだけして切り上げる", {}, [
          1,
          "弱音を吐けば止まらなくなりそうで、グッと飲み込んで午後の段取りだけを話した。",
          { personTieAction: { kind: "workplace", action: "listen" } }
        ]),
        $terraData.K("職場の人間には見せないでおこうと決め、外の相談相手を探す", {}, [
          1,
          "職場に事情を持ち込むのはやめようと思い直し、帰り道で他に頼れそうな人の顔を思い浮かべた。",
          { personTieAction: { kind: "workplace", action: "respect-boundary" } }
        ])
      ]
    },
    {
      id: "v82_teacher_continuity",
      conf: "S",
      references: $terraData.v82src,
      st: ["児童", "少年", "青年"],
      cd: 8,
      w: 0.54,
      show: s => educationLegacySceneGuard(s,"education_school_classroom") &&
        !!educationLegacyTeacherContact(s,{known:true}),
      t: "授業が終わって席を立とうとしたとき、以前から目をかけてくれている先生が「最近の課題はどうだ」と声をかけてくれた。一人では解けずに行き詰まっていた箇所を見せるか迷った。",
      c: [
        $terraData.K("ノートを開き、どうしても解けなかった箇所を教えてもらう", {}, [
          1,
          "先生は快く隣に腰を下ろし、どこで考え方がつまずいていたのかを順を追って解きほぐしてくれた。頭の中の霧がすっと晴れた。",
          { educationAction:"legacy:teacher-lesson", k: 1 }
        ]),
        $terraData.K("まずは隣の席の友人に聞いてみてから、次の授業で質問する", {}, [
          1,
          "先にクラスメートとノートを見比べて解き方を教わり、それでも残った疑問を次の授業で先生にぶつけることにした。",
          { educationAction:"legacy:teacher-lesson", k: 1 }
        ]),
        $terraData.K("今日は「大丈夫です」と答え、家でもう一度ひとりで考えてみる", {}, [
          1,
          "もう少しだけ自分の力で粘ってみたくて、先生には礼だけ言ってカバンを手に帰路についた。",
          { educationAction:"legacy:teacher-lesson" }
        ])
      ]
    },
    {
      id: "v82_clinic_familiarity",
      conf: "S",
      references: $terraData.v82src,
      st: ["青年", "壮年", "老年"],
      cd: 7,
      w: 0.5,
      show: s => (!!$terraData.v82p(s, "clinic") && !!s.illness) || !!($terraData.v82p(s, "clinic") && s.inf),
      t: "診療所の長い受付列の先に、以前親身に応対してくれた職員の顔が見えた。次々と患者をさばいている相手に、今日の診察の待ち時間を尋ねるか考えた。",
      c: [
        $terraData.K("軽く会釈して、今日中に診てもらえそうか見通しを尋ねる", {}, [
          1,
          "職員はこちらの顔に気づくと、「少し待つけれど今日中に順番が回るよ」と教えてくれた。肩の力を抜いて待合室の椅子に腰を下ろした。",
          { personTieAction: { kind: "clinic", action: "listen" } }
        ]),
        $terraData.K("忙しい手を止めさせないよう、用件だけ手短に済ませる", {}, [
          1,
          "後ろに並ぶ人たちの目もあり、必要な手続きだけを手短に済ませて礼を言い、窓口から一歩退いた。",
          { personTieAction: { kind: "clinic", action: "respect-boundary" } }
        ])
      ]
    }
  );

  $define(
    "V82_CHOICE_MATRIX",
    {
      v82_colleague_exclusion_statement: "h~I,x~I,w~I",
      v82_disclose_to_colleague: "s~I,w~I,p~I",
      v82_person_after_rejection: "p~I,w~I,x~I",
      v82_known_colleague_support: "s~I,p~I,w~I",
      v82_teacher_continuity: "d,p,f",
      v82_clinic_familiarity: "p,p"
    },
    false
  );

  $define("V82_REVIEWED_CHOICES", 0, true);

  for (const [id, str] of Object.entries($terraData.V82_CHOICE_MATRIX)) {
    const e = $terraData.EV.find(x => x.id === id),
      tags = str.split(",");
    if (!e || e.c.length !== tags.length) throw Error("v82監査の選択肢数不一致: " + id);
    tags.forEach((z, i) => {
      const [name, target] = z.split("~");
      e.c[i].ethics = {
        intent: $terraData.V79_INTENTS[name],
        target: $terraData.V79_TARGETS[target] || null,
        reviewed: true,
        policyVersion: 82
      };
      $terraData.V82_REVIEWED_CHOICES++;
    });
  }

  $define(
    "V82_ADDITIONAL_CHOICE_REVIEW",
    {
      dis: "w,x",
      urs_mine: "a,p,w,w",
      urs_conscript: "d,p,w",
      vic_occupy: "d,d,w",
      vic_strike: "d,p,w",
      col_frontier: "d,d,p,w",
      col_research: "p,d,w",
      sir_family_duty: "d,p,h",
      sir_hospital: "s,s,p,s",
      fam_mafia: "d,w",
      fam_conscript: "p,d,d",
      urs_purge: "w,w,p",
      fam_rehire: "p,s,s",
      vic_patron: "d,d,p,w",
      col_insure: "p,p,i",
      col_coverage_gap: "p,s,s,w,s",
      kaz_infknight: "d,d,w",
      ibe_famine: "s,s,a",
      sir_feud: "w,w",
      displacement_after: "s,d,s,w",
      fam_inherit: "d,d,d,f",
      loan_shark_lungmen: "p,w",
      loan_shark_siracusa: "p,h,w",
      loan_shark_columbia: "p,w",
      siracusa_credit_collection: "p,p,w,w",
      columbia_credit_collection: "p,p,w,w",
      vic_clerk_contract_review: "p,p,p",
      col_tech_safety_review: "p,p,d",
      col_tech_supplier_exception: "d,p,p",
      sir_family: "d,w",
      col_tech_workplace_consequence: "d,d,w",
      hobby_strain: "s,w,w,w,w,w,w",
      old_followup: "d,w,d"
    },
    false
  );

  $define("V82_MORE_REVIEWED_CHOICES", 0, true);

  for (const [id, str] of Object.entries($terraData.V82_ADDITIONAL_CHOICE_REVIEW)) {
    const e = $terraData.EV.find(x => x.id === id),
      tags = str.split(",");
    if (!e || e.c.length !== tags.length) throw Error("v82 context review mismatch " + id);
    for (let i = 0; i < tags.length; i++) {
      const intent = $terraData.V79_INTENTS[tags[i]];
      if (!intent) throw Error("bad intent " + id);
      e.c[i].ethics = { intent, target: null, reviewed: true, policyVersion: 82 };
      $terraData.V82_MORE_REVIEWED_CHOICES++;
    }
  }
});
