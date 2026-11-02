// extensions/social-and-care/research-reunion: construction fragment; evaluation order is declared by data/extensions/social-and-care.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/research-reunion"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  // Legacy top-level dates count only when they were saved; missing dates stay unknown.
  const researchEpisode = s => {
      const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-research"),
        episodes = affiliation?.episodes;
      if (Array.isArray(episodes) && episodes.length) return episodes.at(-1);
      return affiliation
        ? {
            startedYear: Number.isInteger(affiliation.startedYear) ? affiliation.startedYear : null,
            endedYear: Number.isInteger(affiliation.endedYear) ? affiliation.endedYear : null
          }
        : null;
    },
    yearsSince = (year, currentYear) =>
      Number.isInteger(year) && Number.isInteger(currentYear) && currentYear - year >= 2;
  $terraData.EV.push({
    id: "life_rhodes_research_offer",
    conf: "S",
    references: ["SRC_RHODES_MEDICAL", "SRC_ORIPATHY_SOCIAL"],
    st: ["青年", "壮年"],
    need: ["ロドス職員として活動中", "実務に熟達"],
    after: { id: "life_rhodes_referral", min: 1 },
    once: true,
    w: 0.32,
    t: "物資記録の短期業務を続けていると、医療担当者から鉱石病の経過記録をまとめる補助に誘われた。検査値のほか、通院や薬の変更も並ぶ。名前を消せば研究に回してよいのか、担当者に確かめた。",
    c: [
      $terraData.K("用途と閲覧者を確かめ、期限付きの記録補助に加わる", {}, [
        1,
        "集計の用途と閲覧できる人を確かめ、期限付きの補助に加わった。患者への説明に同席し、同意を得た記録から名前を外して整理した。",
        {
          lifeAffiliation: {
            id: "rhodes-research",
            title: "ロドスの鉱石病経過研究",
            kind: "medical-research-support",
            action: "join",
            role: "匿名化記録の補助"
          },
          lifeGoal: {
            id: "oripathy-research",
            title: "患者の同意を守りながら、鉱石病の理解に役立つ仕事を続ける",
            priority: "研究",
            action: "start"
          },
          lifeSkill: {
            id: "clinical-records",
            title: "医療記録の整理と匿名化",
            delta: 4,
            context: "期限付きの研究補助を試用"
          },
          groupStanding: {
            id: "rhodes-research-team",
            title: "ロドスの研究・医療担当者",
            delta: 1,
            reason: "患者同意と閲覧範囲を確かめて補助へ加わった"
          },
          p: 1,
          k: 1
        }
      ]),
      $terraData.K("研究には加わらず、物資や患者支援の仕事を続ける", {}, [
        1,
        "研究への参加は断り、物資整理や患者の移動補助を続けた。診療区画の廊下を通るたび、記録の扱いについて聞かれたことを思い返した。",
        {
          lifeGoal: {
            id: "rhodes-service",
            title: "目の前の患者を支える実務を続ける",
            priority: "患者支援",
            action: "start"
          },
          p: 1
        }
      ]),
      $terraData.K("説明が足りないと感じ、資料を持ち帰って考える", {}, [
        1,
        "その場で返事はせず、説明書と相談先を受け取った。返事をする日を決め、持ち帰った資料をじっくり読み込んだ。",
        { k: 1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_rhodes_research_review",
    conf: "S",
    references: ["SRC_RHODES_MEDICAL", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["ロドス研究班に協力中"],
    show: s => {
      const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-research"),
        episode = researchEpisode(s);
      return (
        affiliation?.status === "active" &&
        episode?.endedYear == null &&
        yearsSince(episode?.startedYear, s.year)
      );
    },
    cd: 3,
    w: 0.45,
    t: "研究班で経過記録を整理して数年。症例票は増えたが、治療に結びつく結論は出ていない。作業時間と今後の役割を相談され、勤務を続けるか減らすか、研究から離れるか考えた。",
    c: [
      $terraData.K("勤務日を減らし、同意確認と記録整理を受け持つ", {}, [
        1,
        "担当日を減らし、患者への説明に同席して記録を確かめた。提出前には、症例票を一枚ずつ照合した。",
        {
          lifeAffiliation: {
            id: "rhodes-research",
            title: "ロドスの鉱石病経過研究",
            action: "role",
            role: "同意確認・記録監査"
          },
          lifeGoal: {
            id: "oripathy-research",
            action: "compromise",
            note: "研究時間を減らして患者同意の確認を優先"
          },
          groupStanding: {
            id: "rhodes-research-team",
            title: "ロドスの研究・医療担当者",
            delta: 2,
            reason: "同意確認と閲覧範囲の点検を引き受けた"
          },
          lifeSkill: {
            id: "clinical-records",
            title: "医療記録の整理と匿名化",
            delta: 3,
            context: "記録監査を継続"
          },
          p: 1
        }
      ]),
      $terraData.K("研究班の勤務を保ち、データの整理を続ける", {}, [
        1,
        "同じ研究班で経過記録を整え続けた。集計表は厚くなったが、治療に結びつく結論はまだ出なかった。",
        {
          lifeAffiliation: {
            id: "rhodes-research",
            title: "ロドスの鉱石病経過研究",
            action: "role",
            role: "経過記録・集計補助"
          },
          lifeGoal: { id: "oripathy-research", action: "continue" },
          lifeSkill: {
            id: "clinical-records",
            title: "医療記録の整理と匿名化",
            delta: 2,
            context: "経過記録の集計を継続"
          },
          p: 1,
          k: 1
        }
      ]),
      $terraData.K("暮らしの事情を優先し、研究を一時休止する", {}, [
        1,
        "研究班に休止を申し出、自分の机から資料を片づけた。次の担当日を外してもらい、しばらく研究室へ戻らないことにした。",
        {
          lifeAffiliation: {
            id: "rhodes-research",
            title: "ロドスの鉱石病経過研究",
            action: "suspend",
            note: "療養・家族の事情で一時休止"
          },
          lifeGoal: { id: "oripathy-research", action: "pause", note: "生活を整えるまで研究を休止" },
          p: 2
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_rhodes_research_stall",
    conf: "S",
    references: ["SRC_RHODES_MEDICAL", "SRC_ORIPATHY_SOCIAL"],
    st: ["青年", "壮年", "老年"],
    need: ["ロドス研究班に協力中"],
    after: { id: "life_rhodes_research_review", min: 2 },
    once: true,
    w: 0.3,
    t: "何年分かの記録をまとめても、患者ごとに経過や治療条件が違い、表の数字は揃わなかった。資材や担当者も入れ替わり、研究班では対象を広げるか、答えやすい問いに絞るか話し合った。",
    c: [
      $terraData.K("患者ごとの違いを記録に書き添え、集計を続ける", {}, [
        1,
        "症例票に年齢や療養条件を書き加えた。数字が揃わない箇所は空欄のまま、担当医へ渡す時に事情を伝えた。",
        {
          lifeGoal: {
            id: "oripathy-research",
            action: "continue",
            note: "結論が出ない理由と資料の限界を記録"
          },
          lifeSkill: {
            id: "clinical-records",
            title: "医療記録の整理と匿名化",
            delta: 4,
            context: "研究限界を明記した集計"
          },
          regionalImpact: {
            entity: "ロドス研究班の患者経過記録",
            kind: "research-limitation-record",
            description: "資料の限界と未確定の問いを明記した集計を残した"
          },
          p: 1,
          k: 2
        }
      ]),
      $terraData.K(
        "対象を広げる案に加わる",
        {},
        [
          0.65,
          "新しい症例票の集計に取りかかった。項目を増やすたび、同意書と名前を消す手順も見直すことになった。",
          {
            lifeGoal: {
              id: "oripathy-research",
              action: "compromise",
              note: "研究範囲を広げる一方、手続きの負担が増えた"
            },
            groupStanding: {
              id: "rhodes-research-team",
              title: "ロドスの研究・医療担当者",
              delta: 1,
              reason: "追加集計を引き受けた"
            },
            p: 1,
            k: 1
          }
        ],
        [
          1,
          "同意と治療条件の項目が揃わず、追加の症例票は束ねられないまま棚へ戻った。",
          {
            lifeGoal: {
              id: "oripathy-research",
              action: "pause",
              note: "追加対象と同意手順を決められず保留"
            },
            p: -1
          }
        ]
      ),
      $terraData.K(
        "研究を離れ、患者支援の持ち場を続ける",
        {
          show: s =>
            ["active", "crisis"].includes(
              s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-staff")?.status
            )
        },
        [
          1,
          "研究班を離れ、患者の移動や療養相談の持ち場へ戻った。担当していた記録と、まだ答えの出ていない問いを後任へ渡した。",
          {
            lifeAffiliations: [
              {
                id: "rhodes-research",
                action: "leave",
                note: "患者支援へ役割を移した"
              },
              {
                id: "rhodes-staff",
                action: "role",
                role: "患者支援・物資補助",
                preserveRhodesPost: true
              }
            ],
            lifeGoal: { id: "oripathy-research", action: "abandon", note: "研究班を離れ、患者支援へ移った" },
            regionalImpact: {
              entity: "ロドス研究班の患者経過記録",
              kind: "research-handover",
              description: "未確定の問いと記録の扱いを後任へ引き継いだ"
            },
            job: 28,
            p: 1
          }
        ]
      ),
      $terraData.K(
        "研究を離れ、休止中のロドス勤務も終える",
        {
          show: s =>
            s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-staff")?.status === "suspended"
        },
        [
          1,
          "研究班とロドスでの勤務を終え、担当記録を後任へ渡した。次の働き口はまだ決まっていなかった。",
          {
            lifeAffiliations: [
              {
                id: "rhodes-research",
                action: "leave",
                note: "研究班を離れた"
              },
              {
                id: "rhodes-staff",
                action: "leave",
                note: "休止中のロドス勤務も終了"
              }
            ],
            lifeGoal: { id: "oripathy-research", action: "abandon", note: "研究班と勤務関係を離れた" },
            regionalImpact: {
              entity: "ロドス研究班の患者経過記録",
              kind: "research-handover",
              description: "未確定の問いと記録の扱いを後任へ引き継いだ"
            },
            job: 0,
            p: 1
          }
        ]
      ),
      $terraData.K(
        "研究班を離れ、担当記録を引き継ぐ",
        {
          show: s =>
            ["left", "contacted"].includes(
              s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-staff")?.status
            )
        },
        [
          1,
          "研究班を離れ、担当記録と答えの出ていない問いを後任へ渡した。次の役割が決まるまで、研究室の机は空いたままだった。",
          {
            lifeAffiliation: {
              id: "rhodes-research",
              action: "leave",
              note: "研究班を離れ、記録と課題を引き継いだ"
            },
            lifeGoal: { id: "oripathy-research", action: "abandon", note: "研究班を離れた" },
            regionalImpact: {
              entity: "ロドス研究班の患者経過記録",
              kind: "research-handover",
              description: "未確定の問いと記録の扱いを後任へ引き継いだ"
            },
            p: 1
          }
        ]
      )
    ]
  });

  $terraData.EV.push({
    id: "life_rhodes_research_ethics",
    conf: "S",
    references: ["SRC_RHODES_MEDICAL", "SRC_ORIPATHY_SOCIAL"],
    st: ["青年", "壮年", "老年"],
    need: ["ロドス研究班に協力中"],
    after: { id: "life_rhodes_research_stall", min: 1 },
    once: true,
    w: 0.3,
    t: "診療記録を使う範囲を広げる新しい集計案が回ってきた。名前を消すだけで患者に説明しなくてよいのか。同意を取り消した人の記録をどう扱うのか。期限が迫る中、返事を求められた。",
    c: [
      $terraData.K("同意の確認と撤回手順が整うまで、そのデータは使わない", {}, [
        1,
        "同意と撤回の手順が整うまで、新しい記録は使わないよう申し入れた。集計表には空欄が残り、患者へ説明する文面と撤回の方法を用意する仕事が始まった。",
        {
          groupStanding: {
            id: "rhodes-research-team",
            title: "ロドスの研究・医療担当者",
            delta: -2,
            reason: "手順が整うまでデータ利用を止めた"
          },
          lifeGoal: {
            id: "oripathy-research",
            action: "compromise",
            note: "研究の遅れを受け入れ、同意手順を優先"
          },
          regionalImpact: {
            entity: "ロドス研究班の患者経過記録",
            kind: "consent-safeguard",
            description: "同意と撤回の手順が整うまで新しいデータ利用を止めた"
          },
          p: -1
        }
      ]),
      $terraData.K(
        "匿名化された記録だけ先に集計し、患者への説明は後から行う",
        {},
        [
          0.7,
          "匿名化した記録を先に集計した。表は埋まっていく一方、患者への説明と撤回の手順は後回しになった。",
          {
            groupStanding: {
              id: "rhodes-research-team",
              title: "ロドスの研究・医療担当者",
              delta: 2,
              reason: "集計予定を維持した"
            },
            lifeGoal: {
              id: "oripathy-research",
              action: "continue",
              note: "集計を先行し、説明を後回しにした"
            },
            regionalImpact: {
              entity: "ロドス研究班の患者経過記録",
              kind: "consent-delay",
              description: "匿名化記録の集計を先行し、患者説明と撤回手順が遅れた"
            },
            p: 1
          }
        ],
        [
          1,
          "説明文と撤回の手順がまとまらず、新しい症例票は棚へ戻った。",
          {
            lifeGoal: {
              id: "oripathy-research",
              action: "pause",
              note: "匿名化と説明の手順を決められず保留"
            },
            p: -1
          }
        ]
      ),
      $terraData.K("担当を辞し、患者への通常支援に専念する", {}, [
        1,
        "研究補助を辞し、患者支援の持ち場へ戻った。担当記録は棚に残り、引き継ぐ人はまだ決まっていなかった。",
        {
          lifeAffiliation: {
            id: "rhodes-research",
            title: "ロドスの鉱石病経過研究",
            action: "leave",
            note: "記録利用の方針が合わず退出"
          },
          lifeGoal: { id: "oripathy-research", action: "abandon", note: "倫理手順の不一致で研究を離れた" },
          groupStanding: {
            id: "rhodes-research-team",
            title: "ロドスの研究・医療担当者",
            delta: -3,
            reason: "研究補助を辞して退出"
          },
          p: -2
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_rhodes_research_legacy",
    conf: "S",
    references: ["SRC_RHODES_MEDICAL", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["ロドス研究から離脱済み"],
    once: true,
    show: s => {
      const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-research"),
        episode = researchEpisode(s);
      return affiliation?.status === "left" && yearsSince(episode?.endedYear, s.year);
    },
    cd: 7,
    w: 0.24,
    t: "研究班を離れて数年後、当時まとめた記録が別の担当者に使われたと便りが届いた。自分が残した手順を確かめ、どうするか考えた。",
    c: [
      $terraData.K("残した手順と限界を後任へ伝える", {}, [
        1,
        "治療法はまだ見つからなかった。記録の作り方、同意の範囲、行き詰まった点を後任へ伝え、研究ノートを引き継いだ。",
        {
          regionalImpact: {
            entity: "ロドス研究班の引継ぎ記録",
            kind: "research-legacy",
            description: "研究補助者が手順・同意範囲・未確定事項を後任へ伝えた"
          },
          groupStanding: {
            id: "rhodes-research-team",
            title: "ロドスの研究・医療担当者",
            delta: 1,
            reason: "研究限界と記録手順を後任へ共有"
          },
          lifeGoal: {
            id: "oripathy-research",
            action: "complete",
            note: "根絶の結論ではなく、記録手順と限界を引き継いだ"
          },
          p: 1
        }
      ]),
      $terraData.K("連絡を返さず、研究班とは距離を置く", {}, [
        1,
        "便りには返事をせず、当時の作業から距離を置いた。研究班が記録をどう使ったかは分からないまま、自分の生活へ専念した。",
        { p: 1 }
      ]),
      $terraData.K("成果がないと感じ、記録そのものを忘れる", {}, [
        1,
        "役立つ結果を残せなかったと思い、便りを返さず研究ノートも開かなかった。棚の奥にしまっても、表紙の自分の名だけは目に入った。",
        {
          lifeGoal: {
            id: "oripathy-research",
            action: "abandon",
            note: "成果を感じられず、本人が記録から距離を置いた"
          },
          p: -1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_reunion_reorg_review",
    conf: "S",
    references: ["SRC_REUNION_HISTORY", "SRC_TERRA_SOCIAL_ATTITUDES"],
    st: ["青年", "壮年", "老年"],
    need: ["1097年以後の再編レユニオン互助網に連絡中"],
    after: { id: "kaz_reunion", min: 1 },
    ge: { year: 1097 },
    le: { year: 1106 },
    once: true,
    w: 0.34,
    t: "紹介先から、感染者の家へ食料や薬を届ける当番の連絡が来た。遠くの隊と連絡を取る人もいるが、まずは今いる地域で何を担うか決めた。",
    c: [
      $terraData.K("近隣への物資運びを続け、危険な任務は別に確かめる", {}, [
        1,
        "近くの感染者世帯へ食料や薬を届ける役を続けた。紹介先の人と配達日を決め、頼まれた仕事を帳面に記した。",
        {
          lifeAffiliation: {
            id: "reunion-reorg",
            title: "再編後レユニオンに連なる互助連絡網",
            action: "role",
            role: "近隣への物資運び",
            note: "紹介先を通じて地域の物資連絡に参加"
          },
          groupStanding: {
            id: "infected-neighbours",
            title: "近隣の感染者と家族",
            delta: 3,
            reason: "物資の受け渡しを続けた"
          },
          lifeGoal: { id: "reunion-relief", action: "continue", note: "身近な範囲の互助を継続" },
          regionalImpact: {
            entity: "感染者世帯への生活物資の連絡網",
            kind: "reorg-relief",
            description: "紹介先を通じて近隣へ食料と薬を運ぶ地域連絡を続けた"
          },
          p: 1,
          rl: 1
        }
      ]),
      $terraData.K("連絡だけを残し、定期の当番は引き受けない", {}, [
        1,
        "定期の当番から外れると伝え、連絡先は残した。日々の用事が重なり、集まりへ足を運ぶ回数も減っていた。",
        {
          lifeAffiliation: {
            id: "reunion-reorg",
            title: "再編後レユニオンに連なる互助連絡網",
            action: "role",
            role: "臨時連絡先",
            note: "定期的な当番は辞退"
          },
          lifeGoal: {
            id: "reunion-relief",
            action: "compromise",
            note: "支援を続けたいが定期役は引き受けなかった"
          },
          p: 1
        }
      ]),
      $terraData.K("連絡網から離れ、今の暮らしを優先する", {}, [
        1,
        "当番表から名前を外した。以前届けた感染者世帯のことは気にかかったが、定期の役目は続けられなかった。",
        {
          lifeAffiliation: {
            id: "reunion-reorg",
            title: "再編後レユニオンに連なる互助連絡網",
            action: "leave",
            note: "家族と診療先を優先して離脱"
          },
          lifeGoal: { id: "reunion-relief", action: "abandon", note: "互助網での役割を断念" },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_reunion_reorg_tension",
    conf: "S",
    references: ["SRC_REUNION_HISTORY", "SRC_TL_LONDINIUM_WINDOW"],
    st: ["青年", "壮年", "老年"],
    need: ["1097年以後の再編レユニオン互助網に連絡中"],
    after: { id: "life_reunion_reorg_review", min: 1 },
    ge: { year: 1098 },
    le: { year: 1106 },
    once: true,
    w: 0.28,
    t: "届いた物資が足りず、連絡網の一部は倉庫から勝手に運び出すようになった。戦争難民へ急いで届けるためだと説明する人もいれば、感染者世帯の分まで失われたと訴える人もいる。あなたの役割をどうするか問われた。",
    c: [
      $terraData.K("配給先と受取量を記録し、横流しの疑いを責任者へ伝える", {}, [
        1,
        "配給先と残量を帳面に記し、説明のつかない不足を担当者へ伝えた。翌週の当番表から自分の名が消え、帳面には不足の数だけが残った。",
        {
          lifeAffiliation: {
            id: "reunion-reorg",
            title: "再編後レユニオンに連なる互助連絡網",
            action: "crisis",
            role: "配給記録・照会",
            note: "不明な不足を報告し、連絡網との関係が内部危機に入った"
          },
          groupStandings: [
            {
              id: "infected-neighbours",
              title: "近隣の感染者と家族",
              delta: 2,
              reason: "配給量の説明を求めた"
            },
            {
              id: "reunion-reorg-volunteers",
              title: "再編後の地域ボランティア",
              delta: -2,
              reason: "物資不足を責任者へ伝えた"
            }
          ],
          regionalImpact: {
            entity: "避難民と感染者世帯の支援物資",
            kind: "distribution-audit",
            description: "配給先と残量を記録し、説明のつかない不足を照会した"
          },
          p: -1,
          cr: 1
        }
      ]),
      $terraData.K("不足の事情を知るまでは、仲間の判断に任せる", {}, [
        1,
        "仲間の搬出を止めず、帳面にも書かなかった。倉庫から出た物資の行き先は残らず、近隣の感染者世帯へ回った量も確かめられなかった。",
        {
          groupStanding: {
            id: "reunion-reorg-volunteers",
            title: "再編後の地域ボランティア",
            delta: 2,
            reason: "緊急配給を妨げなかった"
          },
          regionalImpact: {
            entity: "避難民と感染者世帯の支援物資",
            kind: "unrecorded-shortage",
            description: "緊急配給を続けたが、残量不足と届け先を記録しなかった"
          },
          p: 1
        }
      ]),
      $terraData.K("疑いを晴らせないまま運搬役を辞め、互助網から離れる", {}, [
        1,
        "「不足の説明がつくまで運ばない」と伝え、当番表から名前を外した。倉庫の不足はそのまま残った。",
        {
          lifeAffiliation: {
            id: "reunion-reorg",
            title: "再編後レユニオンに連なる互助連絡網",
            action: "leave",
            note: "配給不足の照会を巡る対立で離脱"
          },
          lifeGoal: { id: "reunion-relief", action: "abandon", note: "運搬役と互助網を離れた" },
          p: -2
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_reunion_reorg_crisis_review",
    conf: "S",
    references: ["SRC_REUNION_HISTORY", "SRC_TL_LONDINIUM_WINDOW"],
    st: ["青年", "壮年", "老年"],
    need: ["再編レユニオン連絡網の内部危機"],
    after: { id: "life_reunion_reorg_tension", min: 1 },
    ge: { year: 1098 },
    le: { year: 1106 },
    once: true,
    w: 0.38,
      t: "帳面と倉庫の数が食い違い、仲間の中にはこちらを疑う者もいた。仲介役に記録を見せるか、定期の当番を休むか、連絡網を離れるか考えた。",
    c: [
      $terraData.K("配給の記録を第三者にも見せ、受け渡し役へ戻る", {}, [
        1,
        "仲介役に帳面を見せ、次の受け渡しに立ち会ってもらった。荷札と帳面の数をその場で照らし合わせ、運搬を再開した。",
        {
          lifeAffiliation: {
            id: "reunion-reorg",
            title: "再編後レユニオンに連なる互助連絡網",
            action: "return",
            role: "配給記録と受け渡し",
            note: "仲介役の同席で活動へ復帰"
          },
          groupStanding: {
            id: "infected-neighbours",
            title: "近隣の感染者と家族",
            delta: 2,
            reason: "配給記録を開き、受け渡しの確認を提案"
          },
          regionalImpact: {
            entity: "再編期の互助連絡網",
            kind: "distribution-record-repair",
            description: "第三者の同席で配給帳面を確かめ、複数人で受け渡しを記録する手順を提案"
          },
          p: 1
        }
      ]),
      $terraData.K("定期の当番を休み、連絡先だけを残す", {}, [
        1,
        "しばらく定期当番に入らないと伝えた。相談先の連絡は残し、配給を追う役目から離れて、自分の用事に使う時間を取り戻した。",
        {
          lifeAffiliation: {
            id: "reunion-reorg",
            title: "再編後レユニオンに連なる互助連絡網",
            action: "suspend",
            note: "内部対立の間は定期当番を休止"
          },
          groupStanding: {
            id: "infected-neighbours",
            title: "近隣の感染者と家族",
            delta: 0,
            reason: "連絡先を維持しつつ定期当番を休止"
          },
          p: 1
        }
      ]),
      $terraData.K("関係を終え、連絡網から離れる", {}, [
        1,
        "帳面をめぐる対立から手を引き、連絡先を返した。配給帳には不足を訴える声が残っていた。",
        {
          lifeAffiliation: {
            id: "reunion-reorg",
            title: "再編後レユニオンに連なる互助連絡網",
            action: "leave",
            note: "配給の対立後、連絡網から離脱"
          },
          lifeGoal: {
            id: "reunion-relief",
            title: "近隣の感染者世帯へ物資を届ける",
            priority: "互助",
            action: "abandon",
            note: "内部危機の後に役割を終えた"
          },
          regionalImpact: {
            entity: "再編期の互助連絡網",
            kind: "crisis-exit",
            description: "配給不足の説明をめぐる対立の後、運搬役が離脱した"
          },
          p: -1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_reunion_reorg_pause_review",
    conf: "S",
    references: ["SRC_REUNION_HISTORY", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    after: { id: "life_reunion_reorg_crisis_review", min: 3 },
    ge: { year: 1098 },
    cd: 3,
    w: 0.18,
    show: s => {
      const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "reunion-reorg");
      return affiliation?.status === "suspended" && s.year - (affiliation.lastChangedYear ?? s.year) >= 3;
    },
      t: "定期の配給当番を休んで数年。以前の連絡先から、受け渡しを手伝えるか便りが届いた。古い帳面の数字が頭をよぎる。今の暮らしに合わせ、返事を考えた。",
    c: [
      $terraData.K("当番を限って再開し、受け渡しを手伝う", {}, [
        1,
        "定期の当番には戻らず、次の受け渡しを一度手伝うと返事した。別の人と荷札と帳面を照らし合わせ、受け渡しを終えた。",
        {
          lifeAffiliation: {
            id: "reunion-reorg",
            action: "return",
            role: "限定的な配給受け渡し",
            note: "休止後、本人が可能な範囲で当番へ復帰"
          },
          lifeGoal: { id: "reunion-relief", action: "continue", note: "限られた配給当番を再開" },
          p: 1
        }
      ]),
      $terraData.K("今回は戻らず、また数年後に考える", {}, [
        1,
        "今回は戻らないと返事し、連絡先は手元に残した。定期当番の休止を続けた。",
        {
          lifeAffiliation: {
            id: "reunion-reorg",
            action: "review",
            note: "本人が休止を続け、数年後に再確認する"
          },
          lifeGoal: { id: "reunion-relief", action: "pause", note: "配給当番の休止を続けた" },
          p: 0
        }
      ]),
      $terraData.K("連絡網を離れ、今後の当番は引き受けない", {}, [
        1,
        "連絡網を離れると伝え、手元の連絡先を返した。それ以降、配給の当番は引き受けなかった。",
        {
          lifeAffiliation: {
            id: "reunion-reorg",
            action: "leave",
            note: "休止後、本人が連絡網を離れた"
          },
          lifeGoal: { id: "reunion-relief", action: "abandon", note: "配給当番と連絡網を離れた" },
          p: 0
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_reunion_reorg_exit_legacy",
    conf: "S",
    references: ["SRC_REUNION_HISTORY", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["再編レユニオン互助網から離脱済み"],
    after: { id: "life_reunion_reorg_tension", min: 1 },
    once: true,
    cd: 6,
    w: 0.2,
    show: s => {
      const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "reunion-reorg");
      return affiliation?.status === "left" &&
        Number.isInteger(affiliation.endedYear) && s.year - affiliation.endedYear >= 2;
    },
      t: "互助網を離れてから、以前の連絡先が別の場所へ移ったと聞いた。後任から、配給が乱れた頃のことを尋ねる便りが届いた。覚えていることをどこまで伝えるか考えた。",
    c: [
      $terraData.K("覚えている配給の記録を書き、確かめられない箇所も添えて返す", {}, [
        1,
        "覚えている配給量と、確かめられなかった部分を便りに書いて後任へ送った。物資が足りなかった日のことは、数字だけでは埋まらなかった。",
        {
          regionalImpact: {
            entity: "再編期の互助連絡網",
            kind: "former-member-handover",
            description: "退会者が配給帳面と未確認事項を後任へ渡した"
          },
          groupStanding: {
            id: "reunion-reorg-volunteers",
            title: "再編後の地域ボランティア",
            delta: 1,
            reason: "配給記録を引き継いだ"
          },
          p: 1
        }
      ]),
      $terraData.K("便りに答えず、過去の役割から距離を置く", {}, [
        1,
        "便りに返事はせず、紙をしまった。倉庫の空き棚と配給の列の記憶を振り切り、今の自分の暮らしを静かに守った。",
        { p: 1, h: 1 }
      ]),
      $terraData.K("当時困った世帯へ直接連絡し、受け渡しの行方を聞く", {}, [
        1,
        "当時の支援先へ個別に便りを出した。届いた返事には、物資を覚えている人の名も、連絡が途絶えたままの家の名もあった。",
        {
          groupStanding: {
            id: "infected-neighbours",
            title: "近隣の感染者と家族",
            delta: 1,
            reason: "当時の支援先へ配給の行方を尋ねた"
          },
          regionalImpact: {
            entity: "再編期に支援を受けた地域世帯",
            kind: "recipient-followup",
            description: "元運搬役が以前の配給先へ連絡し、受け渡しの行方を確認した"
          },
          p: 1,
          rl: 1
        }
      ])
    ]
  });
});
