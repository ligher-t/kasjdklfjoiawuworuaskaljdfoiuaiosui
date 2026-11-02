// extensions/education-and-later-life/leithanian-noble-household: construction fragment; evaluation order is declared by data/extensions/education-and-later-life.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/education-and-later-life",
  "extensions/education-and-later-life/leithanian-noble-household"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const affiliationId = "leithanian-noble-household",
    goalId = "leithanian-noble-household",
    affiliation = s => s.lifeRecord?.affiliations?.find(row => row.id === affiliationId),
    isActive = s => affiliation(s)?.status === "active",
    isSuspended = s => affiliation(s)?.status === "suspended",
    hasLeft = s => affiliation(s)?.status === "left",
    isNobleOrigin = s =>
      (s.socialClass?.origin || s.socialPosition) === "貴族・アーツ名家" &&
      (s.socialClass?.originRegion || s.g?.n) === "リターニア";

  $terraData.EV.push(
    {
      id: "life_leithanian_noble_household_entry",
      conf: "B",
      references: ["SRC_LEITHANIEN_ARTS", "SRC_LEITHANIEN_ZT6_STORY", "SRC_LEITHANIEN_ZT10_STORY", "SRC_LEITHANIEN_NOBLE_HOUSEHOLD_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      ge: { age: 18 },
      once: true,
      w: 0.32,
      show: isNobleOrigin,
      t: "一族の年長者から、屋敷の経理か、書庫の楽譜とアーツ器具の管理を手伝うよう声がかかった。街では家名を出すだけで相手の態度が変わることもあるが、屋敷の雑務に縛られれば自分の稽古や外の仕事の時間は削られる。どう返事をするか思案した。",
      c: [
        $terraData.K("屋敷の出納と、届く書簡の仕分けを引き受ける", {}, [
          1,
          "出納の数字をまとめ、日々届く封書を仕分けて親族のもとへ運んだ。ただ、家の金や人事を動かす肝心の話し合いには、まだ声がかからなかった。",
          {
            lifeAffiliation: {
              id: affiliationId,
              title: "リターニア貴族家の家内役割",
              kind: "family-duty",
              action: "join",
              role: "家計の帳簿と書簡の整理"
            },
            lifeGoal: {
              id: goalId,
              title: "家の役目と自分の暮らしを両立する",
              priority: "家と自立",
              action: "start",
              note: "屋敷の出納と書簡の仕分けを担当"
            },
            lifeSkill: {
              id: "leith-household-organization",
              title: "帳簿・書簡・目録の整理",
              delta: 1,
              context: "屋敷の出納を整え、届いた書簡を仕分けた"
            },
            p: 1
          }
        ]),
        $terraData.K("書庫の楽譜とアーツ器具を管理し、自分の稽古時間も確保する", {}, [
          1,
          "書庫に眠る古い楽譜とアーツ器具の手入れを引き受け、誰も来ない空き時間に自分の稽古を重ねた。弓や杖を置く頃には、高い窓の外がすっかり暮れていた。",
          {
            lifeAffiliation: {
              id: affiliationId,
              title: "リターニア貴族家の家内役割",
              kind: "family-duty",
              action: "join",
              role: "楽譜・アーツ器具の目録と稽古"
            },
            lifeGoal: {
              id: goalId,
              title: "家の役目と自分の暮らしを両立する",
              priority: "家と自立",
              action: "start",
              note: "楽譜とアーツ器具の管理をしながら稽古を続ける"
            },
            lifeSkill: {
              id: "leith-household-organization",
              title: "帳簿・書簡・目録の整理",
              delta: 1,
              context: "書庫の楽譜とアーツ器具を整えた"
            },
            p: 1
          }
        ]),
        $terraData.K("屋敷の務めは断り、外で自分の仕事を探す", {}, [
          1,
          "屋敷の務めは丁重に辞退し、自分の力で外に働き口を探すと告げた。冷ややかな視線を背に受けながら、自立への一歩を踏み出した。",
          { p: 2, cr: -2, k: 1 }
        ])
      ]
    },
    {
      id: "life_leithanian_noble_household_routine",
      conf: "B",
      references: ["SRC_LEITHANIEN_ARTS", "SRC_LEITHANIEN_NOBLE_HOUSEHOLD_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      after: { id: "life_leithanian_noble_household_entry", min: 1 },
      cd: 4,
      w: 0.32,
      show: isActive,
      t: "屋敷の雑務は出納や手紙の仕分けにとどまらず、サロンで使う楽譜やアーツ器具の手入れまで次々に回ってくるようになった。言われるまま引き受ければ、自分の稽古や外の付き合いがどんどん削られていく。",
      c: [
        $terraData.K(
          "屋敷の出納と書簡の仕分けを黙々とこなす",
          { show: s => /帳簿|書簡|時間を区切って/.test(affiliation(s)?.role || "") },
          [
            1,
            "屋敷の入出金を整理し、蝋封された手紙を差出人ごとに分けて年長の親族へ届けた。",
            {
              lifeAffiliation: { id: affiliationId, action: "role", onlyIfActive: true, role: "家計の帳簿と書簡の整理" },
              lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "出納と書簡の仕分けを続けた" },
              lifeSkill: {
                id: "leith-household-organization",
                title: "帳簿・書簡・目録の整理",
                delta: 1,
                context: "屋敷の出納を整理し、届いた書簡を仕分けた"
              },
              p: 1
            }
          ]
        ),
        $terraData.K(
          "楽譜とアーツ器具を手入れし、合間に自分の稽古をする",
          { show: s => /楽譜|稽古|目録|時間を区切って/.test(affiliation(s)?.role || "") },
          [
            1,
            "書庫の楽譜と器具の調子を確かめ、静かな部屋でアーツと演奏の稽古に打ち込んだ。次の雑用を言いつけられる前に、きりのいいところで切り上げた。",
            {
              lifeAffiliation: { id: affiliationId, action: "role", onlyIfActive: true, role: "楽譜・アーツ器具の目録と稽古" },
              lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "器具の管理と稽古の時間を両立した" },
              lifeSkill: {
                id: "leith-household-organization",
                title: "帳簿・書簡・目録の整理",
                delta: 1,
                context: "楽譜とアーツ器具の手入れを続けた"
              },
              p: 1
            }
          ]
        ),
        $terraData.K("今日言いつけられた雑用は明日へ回し、外の約束へ出かける", {}, [
          1,
          "追加の用件は明日にしてほしいと断り、外套を羽織って外で待っている知人のもとへ出かけた。",
          {
            lifeAffiliation: { id: affiliationId, action: "continue", onlyIfActive: true },
            lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "外の約束を優先し、自分の時間を守った" },
            p: 0
          }
        ])
      ]
    },
    {
      id: "life_leithanian_noble_household_review",
      conf: "B",
      references: ["SRC_LEITHANIEN_NOBLE_HOUSEHOLD_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      after: { id: "life_leithanian_noble_household_entry", min: 2 },
      once: true,
      w: 0.24,
      show: isActive,
      t: "屋敷の実務を手伝い始めてから、親族は当たり前のように細かい用件を押しつけてくるようになった。自分の稽古や外の暮らしを守りながら、どこまで家に付き合うか考え直す時期に来ていた。",
      c: [
        $terraData.K("文句を言わず、今の務めをそのまま続ける", {}, [
          1,
          "これまで通り引き受けると答え、山積みの書類と楽譜を片づけた。サロンから漏れる親族たちの談笑を遠くに聞きながら、ペンを走らせ続けた。",
          {
            lifeAffiliation: { id: affiliationId, action: "continue", onlyIfActive: true },
            lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "屋敷の務めをそのまま続けた" },
            p: 1
          }
        ]),
        $terraData.K("手伝う時間と量をはっきり区切って続ける", {}, [
          1,
          "屋敷に詰められる時間と引き受けられる仕事の範囲を親族に言い渡し、目の前の仕事だけ片づけて席を立った。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "role",
              onlyIfActive: true,
              role: "時間を区切って帳簿・書簡・目録を整理"
            },
            lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "屋敷で働く時間と量を区切った" },
            p: 1
          }
        ]),
        $terraData.K("しばらく屋敷の務めを休み、外の仕事や学びに専念する", {}, [
          1,
          "しばらく屋敷の手伝いは休むと告げ、外の仕事や勉強に時間を使うことにした。重苦しい廊下を抜け、街の空気を深く吸い込んだ。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "suspend",
              onlyIfActive: true,
              note: "外の仕事や学びを探すため屋敷の務めを休止"
            },
            lifeGoal: { id: goalId, action: "pause", onlyIfActive: true, note: "家の役目をいったん休止した" },
            p: 0
          }
        ]),
        $terraData.K("屋敷の務めから完全に手を引く", {}, [
          1,
          "これきり屋敷の実務からは手を引くと伝え、後任が困らないよう鍵と控えを置いて出た。冠婚葬祭にだけ顔を出すことにして、自分の仕事を探し始めた。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "leave",
              onlyIfActive: true,
              note: "屋敷での実務から手を引いた"
            },
            lifeGoal: { id: goalId, action: "abandon", onlyIfActive: true, note: "屋敷での務めを終えた" },
            p: -1
          }
        ])
      ]
    },
    {
      id: "life_leithanian_noble_household_later_active",
      conf: "B",
      references: ["SRC_LEITHANIEN_ZT6_STORY", "SRC_LEITHANIEN_NOBLE_HOUSEHOLD_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      after: { id: "life_leithanian_noble_household_review", min: 5 },
      once: true,
      w: 0.14,
      show: isActive,
      t: "屋敷の務めを続けて、さらに何年もの歳月が流れた。どれだけ実務を回しても一族の重要な決定の場には呼ばれず、回ってくるのは面倒な後始末ばかりだった。このまま屋敷に縛られ続けるか、潮時とするか考えた。",
      c: [
        $terraData.K("これからも屋敷の実務を支え続ける", {}, [
          1,
          "変わらず屋敷の務めを続けることにした。翌朝も机には決済待ちの束が積まれ、扉の向こうからは親族たちの優雅な話し声が聞こえていた。",
          {
            lifeAffiliation: { id: affiliationId, action: "continue", onlyIfActive: true },
            lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "その後も屋敷の実務を続けた" },
            p: 1
          }
        ]),
        $terraData.K("外の仕事を軸にし、屋敷には顔を出す程度に変える", {}, [
          1,
          "外の仕事や自分の暮らしを優先すると伝え、屋敷で受け持つ分を大幅に減らした。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "role",
              onlyIfActive: true,
              role: "外の仕事・学びと両立する範囲の家内担当"
            },
            lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "外の暮らしを軸に据え直した" },
            p: 1
          }
        ]),
        $terraData.K("屋敷の務めを辞め、自分の人生を歩む", {}, [
          1,
          "長年続けた屋敷の務めを辞めると告げた。書庫の鍵を返して屋敷の門を出ると、尖塔の上の空がいつもより広く見えた。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "leave",
              onlyIfActive: true,
              note: "長年の屋敷の務めにピリオドを打った"
            },
            lifeGoal: { id: goalId, action: "abandon", onlyIfActive: true, note: "屋敷の役目を終え、自分の道を選んだ" },
            p: -1
          }
        ])
      ]
    },
    {
      id: "life_leithanian_noble_household_later_suspended",
      conf: "B",
      references: ["SRC_LEITHANIEN_NOBLE_HOUSEHOLD_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      after: { id: "life_leithanian_noble_household_review", min: 5 },
      cd: 3,
      w: 0.1,
      show: s => {
        const record = affiliation(s);
        return record?.status === "suspended" && s.year - (record.lastChangedYear ?? s.year) >= 3;
      },
      t: "屋敷の務めから距離を置いて数年が経った。親族から新たに呼び戻されることもなく、静かな日々が続いている。このまま自分の暮らしを続けるか、少しだけ屋敷に顔を出すか考えた。",
      c: [
        $terraData.K("親族に連絡を入れ、無理のない範囲で手伝いに戻る", {}, [
          1,
          "親族に手紙を出し、以前のように抱え込まない条件で少しだけ実務を手伝うことにした。",
          {
            lifeAffiliation: { id: affiliationId, action: "return", role: "時間を区切った家内担当" },
            lifeGoal: { id: goalId, action: "continue", note: "無理のない範囲で屋敷の手伝いに戻った" },
            p: 1
          }
        ]),
        $terraData.K("今は戻らず、今の暮らしをそのまま続ける", {}, [
          1,
          "こちらからは声をかけず、今のまま距離を置くことにした。時折、書庫の古い楽譜の匂いを思い出しながらも、自分の暮らしを守った。",
          {
            lifeAffiliation: { id: affiliationId, action: "review", note: "屋敷と距離を置いた暮らしを継続" },
            lifeGoal: { id: goalId, action: "pause", note: "家の役目から離れたまま暮らす" },
            p: 0
          }
        ]),
        $terraData.K("名ばかりの役目も返上し、きっぱり区切りをつける", {}, [
          1,
          "中途半端に残していた屋敷の役目を正式に返上した。翌日からは後ろを振り返らず、自分の稽古と仕事に打ち込んだ。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "leave",
              note: "休止していた屋敷の務めを正式に返上"
            },
            lifeGoal: { id: goalId, action: "abandon", note: "屋敷での役目に区切りをつけた" },
            p: -1
          }
        ])
      ]
    },
    {
      id: "life_leithanian_noble_household_after_exit",
      conf: "B",
      references: ["SRC_LEITHANIEN_NOBLE_HOUSEHOLD_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      after: { id: "life_leithanian_noble_household_review", min: 10 },
      once: true,
      w: 0.07,
      show: s => hasLeft(s) &&
        Number.isInteger(affiliation(s)?.endedYear) &&
        s.year - affiliation(s).endedYear >= 10,
      t: "屋敷の務めを離れてから、ずいぶん長い年月が経った。それでも、複雑な出納や古い目録をさばいた手際は、今の仕事や暮らしの中でもふとした拍子に顔を出す。あの頃の経験をどう受け止めるか、ふと振り返った。",
      c: [
        $terraData.K("屋敷で身につけた実務の勘所を、今の仕事に活かす", {}, [
          1,
          "屋敷で培った交渉や管理の勘所は、外の世界で生きていく上でも確かな武器になっていた。",
          {
            lifeSkill: {
              id: "leith-household-organization",
              title: "帳簿・書簡・目録の整理",
              delta: 1,
              context: "屋敷で培った実務の手際を今の暮らしに活かした"
            },
            p: 1
          }
        ]),
        $terraData.K("過ぎた日々のことは忘れ、目の前の暮らしに戻る", {}, [
          1,
          "昔のことは胸の奥にしまい、今日の仕事と生活へ意識を戻して気持ちを切り替えた。",
          { p: 1, h: 1 }
        ])
      ]
    }
  );
});
