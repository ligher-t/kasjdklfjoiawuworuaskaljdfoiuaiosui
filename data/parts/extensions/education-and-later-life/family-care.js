// extensions/education-and-later-life/family-care: construction fragment; evaluation order is declared by data/extensions/education-and-later-life.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/education-and-later-life",
  "extensions/education-and-later-life/family-care"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $terraData.EV.push({
    id: "infection_neighborhood_rumor_under_concealment",
    conf: "S",
    references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_SOCIAL_ATTITUDES", "SRC_V88_INFO_BOUNDARIES"],
    st: ["青年", "壮年", "老年"],
    need: ["感染診断済", "隠蔽"],
    ban: ["infection_community_rumor"],
    once: true,
    w: 0.15,
    t: "同じ建物に鉱石病の患者が紛れ込んでいると管理人に告げ口した者がいる、と隣人が耳打ちしてきた。管理人は次の更新で条件を厳しくするつもりだという。誰が誰のことを言いふらしたのかは分からないまま、背筋に冷たいものが走った。",
    c: [
      $terraData.K("管理人のところへ行き、誰が何を言ったのか問いただす", {}, [
        1,
        "管理人は曖昧に目を逸らし、誰から出た話かまでは言えないと口を濁した。もし更新の条件を変えるならちゃんと理由を示してくれと釘を刺したが、煮え切らない返事のまま終わった。",
        {
          rl: -2,
          p: -3,
          fl: {
            infection_community_rumor: 1,
            infection_community_rumor_current_area: 1,
            infection_housing_rumor_current_home: 1
          },
          infectionAwarenessAction: {
            subject: "self",
            audience: "housing-management",
            certainty: "unverified",
            source: "unattributed-rumor",
            consent: "nonconsensual",
            subjectMatch: "unclear",
            recipientRef: "current-building-management"
          }
        }
      ]),
      $terraData.K("隣人に、根も葉もない病気の噂を広げないよう頼む", {}, [
        1,
          "自分のこととは言わず、無責任な病気の噂を言いふらすのはやめてほしいと頼んだ。相手は気まずそうに話を逸らし、誰が言い出したのかは謎のままだった。",
        {
          p: -2,
          cr: 1,
          fl: {
            infection_community_rumor: 1,
            infection_community_rumor_current_area: 1,
            infection_housing_rumor_current_home: 1
          },
          infectionAwarenessAction: {
            subject: "self",
            audience: "residents",
            certainty: "unverified",
            source: "unattributed-rumor",
            consent: "nonconsensual",
            subjectMatch: "unclear",
            recipientRef: "current-residential-area"
          }
        }
      ]),
      $terraData.K("波風を立てず、いざという時の引っ越しに備える", {}, [
        1,
          "下手に騒いで目をつけられないよう口をつぐみ、何食わぬ顔でいつもの通院と買い物を済ませた。帰り道、貸間の張り紙が自然と目に入った。",
        {
          rl: -3,
          p: -4,
          fl: {
            infection_community_rumor: 1,
            infection_community_rumor_current_area: 1,
            infection_housing_rumor_current_home: 1
          },
          infectionAwarenessAction: {
            subject: "self",
            audience: "housing-management",
            certainty: "unverified",
            source: "unattributed-rumor",
            consent: "nonconsensual",
            subjectMatch: "unclear",
            recipientRef: "current-building-management"
          }
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "infection_rumor_public_harassment",
    conf: "S",
    references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_SOCIAL_ATTITUDES"],
    st: ["青年", "壮年", "老年"],
    need: ["infection_community_rumor_current_area", "感染者への世間圧力が強い"],
    once: true,
    w: 0.18,
    t: "診療所の待合室で、近所の顔見知りが「うちの建物に鉱石病の奴がいるらしい」と声を潜めて話していた。すると隣にいた男が「感染者なんか人間じゃねえ。まともな客を待たせるな」と吐き捨て、受付係の手がぴたりと止まった。噂が自分のことなのか確かめる勇気も出ず、息を詰めた。",
    c: [
      $terraData.K("男を睨みつけ、感染者だって医者にかかる権利があると言い返す", {}, [
        1,
        "誰であろうと診察を受ける権利があるはずだと言い返した。男は忌々しそうに黙り込んだが、謝りはしなかった。握りしめた番号札がじっとりと汗で湿っていた。",
        {
          p: -3,
          cr: 1,
          socialConflictAction: {
            action: "help",
            target: "infected",
            context: "clinic-dehumanization-objection"
          },
          infectionAwarenessAction: {
            subject: "self",
            audience: "clinic-waiting-room",
            certainty: "unverified",
            source: "unattributed-rumor",
            consent: "nonconsensual",
            subjectMatch: "unclear",
            recipientRef: "current-clinic-waiting-room"
          }
        }
      ]),
      $terraData.K("聞こえないふりをして番号札を受け取り、順番を待つ", {}, [
        1,
        "男は舌打ちをしたが、受付係は無言で番号札を差し出した。無事に診察は受けられたものの、待合室の自分の両隣は最後まで誰も座らなかった。",
        {
          p: -2,
          infectionAwarenessAction: {
            subject: "self",
            audience: "clinic-waiting-room",
            certainty: "unverified",
            source: "unattributed-rumor",
            consent: "nonconsensual",
            subjectMatch: "unclear",
            recipientRef: "current-clinic-waiting-room"
          }
        }
      ]),
      $terraData.K("人目の少ない時間に診てもらえないか、受付に小声で尋ねる", {}, [
        1,
        "待合室が空いている時間に来られないか受付でこっそり尋ね、次の予約を入れ直した。重い足取りで帰りながら、手元の薬があと何日分あるか数えた。",
        {
          p: -4,
          rl: -1,
          infectionAwarenessAction: {
            subject: "self",
            audience: "clinic-waiting-room",
            certainty: "unverified",
            source: "unattributed-rumor",
            consent: "nonconsensual",
            subjectMatch: "unclear",
            recipientRef: "current-clinic-waiting-room"
          }
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "infection_low_pressure_routine_service",
    conf: "S",
    references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_SOCIAL_ATTITUDES", "SRC_V88_INFO_BOUNDARIES"],
    st: ["青年", "壮年", "老年"],
    need: ["感染診断済", "地域の感染者圧力が比較的弱い"],
    ge: { age: 14 },
    show: s => (s.ob || 0) >= 55 && !s.fl?.hid,
    once: true,
    w: 0.12,
    t: "診療所からの帰り道、立ち寄った食堂で袖口からのぞく黒い結晶に店主が一瞬だけ目を留めた。だが何も聞かず、いつもの調子で注文を尋ねてくれた。ただ、奥にいた客がさりげなく椅子を一つ空けて座り直した。",
    c: [
      $terraData.K("気にとめずいつもの料理を頼み、空いた席に座る", {}, [
        1,
        "湯気の立つ皿が運ばれてきた。店主はいつも通り小銭を受け取り、入ってきた次の客へ声をかけた。",
        { p: 2 }
      ]),
      $terraData.K("持ち帰り用に包んでもらい、店を出る", {}, [
        1,
        "温かい包みを胸に抱え、店の椅子には座らずに外へ出た。",
        { p: -1 }
      ]),
      $terraData.K("急にいたたまれなくなり、何も頼まず店を出る", {}, [
        1,
        "やっぱりいいと断って店を飛び出した。空腹を抱えたまま、足早に家へ帰った。",
        { p: -2 }
      ])
    ]
  });

  $terraData.EV.push(
    {
      id: "family_child_future",
      conf: "S",
      references: ["SRC_TERRA_FAMILY"],
      st: ["青年", "壮年", "老年"],
      need: ["子あり"],
      ge: { age: 16 },
      // Each child has their own futurePlanReviewYear; do not block a sibling's turn for three years.
      cd: 1,
      pri: true,
      w: 0.32,
      t: [
        {
          when: "国:レム・ビリトン",
          t: "大きくなった{kid}のこれからについて、近しい仲間や家族と膝を突き合わせた。鉱山や工場の見習いに入るか、よそへ学びに出るか、それとも独立するか。最終的には本人が決めることだが、親としてどう背中を押すか考えた。"
        },
        {
          when: "国:サーミ",
          t: "{kid}は氏族の年長者たちにも話を聞きながら、自分の行く末を模索していた。集落の務めを引き継ぐか、外で技や仕事を探すか、別の地へ出るか。揺れているわが子に、どんな言葉と支えを渡せるか考えた。"
        },
        {
          when: "国:シラクーザ",
          t: "{kid}がどの道へ進むかは、家の仕事やファミリーとの付き合いとも切り離せない。誰の口利きを受けるか、どこに恩を売るかまで気にかかると{kid}は真剣な目で話した。"
        },
        {
          t: "成長した{kid}と、これからの身の振り方を話し合った。上の学校で学ぶにも、働きに出るにも、部屋を借りて独立するにも先立つものが要る。まだ迷っているわが子に、どんな支えができるか考えた。"
        }
      ],
      c: [
        $terraData.K(
          "専門の勉強をしたいならと、学費の足しに15万龍門幣を渡す",
          {
            en: s => $rules.economy.availableFunds(s) >= 15e4 + $rules.economy.annualReserve(s),
            why: "学費の15万龍門幣を出すと、向こう一年の家の暮らしが立ち行かなくなる"
          },
          [
            1,
            "専門の技術を学ぶ足しにするよう、蓄えから15万龍門幣を{kid}に持たせた。どこで何を学ぶかは、あの子自身の意思に任せることにした。",
            { childFutureSupport: { kind: "study-funds", amount: 15e4 }, cash: () => -15e4, p: 2, rl: 3 }
          ]
        ),
        $terraData.K("見習いとして雇ってくれそうな知り合いに声をかけてみる", {}, [
          1,
          "面倒見のよさそうな知人に手紙を書き、{kid}を見習いとして預かってもらえないか尋ねた。いい返事が来るのを待つことにした。",
          { childFutureSupport: { kind: "work-introduction" }, rl: 2, p: 1 }
        ]),
        $terraData.K("無理に出ていかず、家に残って一緒に暮らしてもいいと伝える", {}, [
          1,
          "急いで家を出なくても、家事や生活費を分け合いながらここで暮らせばいいと伝えた。{kid}は少しほっとした顔を見せた。",
          { childFutureSupport: { kind: "household-open" }, rl: 2, p: 1 }
        ]),
        $terraData.K(
          "一人暮らしを始める時の支度金として、8万龍門幣を持たせる",
          {
            en: s => $rules.economy.availableFunds(s) >= 8e4 + $rules.economy.annualReserve(s),
            why: "支度金の8万龍門幣を出すと、向こう一年の家の暮らしが立ち行かなくなる"
          },
          [
            1,
            "自分の足で暮らし始める時に使いなさいと、8万龍門幣を包んで渡した。いつどの街へ出ていくかは{kid}が決める。",
            { childFutureSupport: { kind: "move-funds", amount: 8e4 }, cash: () => -8e4, rl: -1, p: -1 }
          ]
        ),
        $terraData.K("今は結論を急がず、三年後にまたじっくり話す", {}, [
          1,
          "無理に今すぐ決めなくていいと伝え、お互いもう少し世の中の様子を見てから改めて話すことにした。",
          { childFutureSupport: { kind: "revisit" }, rl: 1 }
        ])
      ]
    },
    {
      id: "family_child_bereavement",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["青年", "壮年", "老年"],
      need: ["子あり"],
      cd: 15,
      w: 0.02,
      t: "{childDeathTiming}、{kid}が亡くなったという知らせが突然届いた。なぜ死ななければならなかったのか、詳しいことさえ分からなかった。食卓の隅には、あの子が使っていた器が伏せられたまま残っていた。",
      c: [
        $terraData.K("親しい人たちにも声をかけ、皆で最期を見送る", {}, [
          1,
          "家族や親しかった人たちに知らせ、{kid}を見送る支度を整えた。食卓の器はどうしても片づけられず、集まった皆でただ黙って座り続けた。",
          { childDeath: 1, childDeathCause: "家族に届いた知らせでは詳しい死因が分からなかった", p: -14, rl: 4 }
        ]),
        $terraData.K("外の人には知らせず、家族だけで静かに見送る", {}, [
          1,
          "人を呼ばず、家族だけで静かに{kid}を見送った。家に帰ってきても、あの子が遺した物にはしばらく指一本触れられなかった。",
          { childDeath: 1, childDeathCause: "家族に届いた知らせでは詳しい死因が分からなかった", p: -15, rl: -1 }
        ]),
        $terraData.K("残された家族が倒れないよう、目の前の暮らしを回す", {}, [
          1,
          "眠れないまま朝を迎え、重い体を引きずって仕事へ行く支度をした。食卓の器には触れないまま、生きている者たちのための食事を作った。",
          { childDeath: 1, childDeathCause: "家族に届いた知らせでは詳しい死因が分からなかった", p: -12, rl: 2 }
        ])
      ]
    }
  );
});
