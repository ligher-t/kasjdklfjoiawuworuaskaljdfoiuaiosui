// routes/rhodes-and-factions/arena-work: construction fragment; evaluation order is declared by data/routes/rhodes-and-factions.js.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/arena-work"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $define("SR_ARENA_JOB", $terraData.J.length, false);

  $terraData.J.push({ n: "カジミエーシュの競技会場運営職員", pay: 1380000, ex: 1.06 });

  $terraData.EV.push(
    {
      id: "sr_kazimierz_arena_backstage",
      conf: "S",
      references: ["SRC_KAZIMIERZ_COMPETITION", "SRC_SR_GAME_MODEL"],
      st: ["青年", "壮年"],
      ge: { age: 18 },
      le: { age: 58 },
      once: true,
      w: 0.2,
      show: s => s.res.n === "カジミエーシュ" && !s.fl?.detained && !$terraData.srArenaEmployee(s),
      t: "試合のない日でも、競技場の裏手では荷運びや客席の補修、備品の点検が絶え間なく続いていた。表の看板には華やかな騎士たちの名が並び、裏方の名前は詰め所の勤務表にしか残らない。その片隅に、人手を募る貼り紙が出ていた。",
      c: [
        $terraData.K(
          "会場の整備・運営職へ応募する",
          {},
          [
            0.49,
            "安全手順やこれまでの作業経験を尋ねられ、競技場の運営職員として雇われることになった。華やかな舞台に立つわけではなく、傷んだ客席の修繕や照明・備品の管理が毎日の仕事になった。",
            {
              job: $terraData.SR_ARENA_JOB,
              lifeAffiliation: {
                id: "kazimierz-arena-staff",
                title: "競技会場の運営職",
                kind: "employer",
                action: "join",
                role: "施設運営・整備"
              },
              lifeGoal: {
                id: "kazimierz-arena-work",
                title: "会場の仕事で生活を立てる",
                priority: "生業",
                action: "start"
              },
              lifeSkill: {
                id: "arena-operations",
                title: "施設運営と備品管理",
                delta: 3,
                context: "会場業務の初期研修"
              },
              p: 1
            }
          ],
          [
            1,
            "今回はすでに枠が埋まったと断られた。今の仕事を辞める前でよかったと思い直し、また別の働き口を探すことにした。",
            { p: -1, k: 1 }
          ]
        ),
        $terraData.K("試合のある日だけ日雇いで手伝う", {}, [
          1,
          "興行の当日だけ詰め所に入り、入場口の誘導と試合後の客席片付けを手伝った。本業を変えるほどではなかったが、大歓声の裏側でどれだけ人が動いているかを肌で知った。",
          {
            lifeSkill: {
              id: "arena-operations",
              title: "施設運営と備品管理",
              delta: 1,
              context: "試合日の短期手伝い"
            },
            p: 1
          }
        ]),
        $terraData.K("応募はせず、今の仕事と暮らしを守る", {}, [
          1,
          "練習試合の歓声を背中に聞きながら、いつもの仕事場へ引き返した。夕暮れの街角で振り返ると、競技場の高い照明塔が遠くに光っていた。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "sr_kazimierz_arena_shift",
      conf: "S",
      references: ["SRC_KAZIMIERZ_COMPETITION", "SRC_SR_GAME_MODEL"],
      st: ["青年", "壮年", "老年"],
      cd: 5,
      w: 0.54,
      show: s => $terraData.srArenaEmployee(s),
      t: "興行の時間が急に繰り上がり、資材の搬入と客席の清掃が同じ時間帯に重なってしまった。外には開場を待つ観客の列が伸び、裏口には重い機材を積んだ荷車が連なっている。",
      c: [
        $terraData.K("荷車の通り道を先に空け、作業の手順を振り分ける", {}, [
          1,
          "搬入の順番をその場で仕切り直し、機材車が通り抜けた区画から順に清掃班を入れた。入口の列は長くなったが、接触事故も出さずに開場時刻へ間に合わせた。",
          {
            lifeSkill: {
              id: "arena-operations",
              title: "施設運営と備品管理",
              delta: 4,
              context: "混雑する会場の搬入・客席管理"
            },
            k: 1,
            p: 1
          }
        ]),
        $terraData.K("同僚に持ち場を代わってもらい、少し息を入れる", {}, [
          1,
          "無理をせず同僚に声をかけ、詰め所の奥で冷たい水を飲んだ。息を整えて通路へ戻ると、騎士の入場を待つ観客のざわめきが壁越しに響いてきた。",
          { h: 2, rl: 1 }
        ]),
        $terraData.K("この仕事を辞め、別の働き口を探す", {}, [
          1,
          "鍵束と備品台帳を次の担当者へ引き継ぎ、競技場の裏門を出た。背後のスタンドからは、まだお気に入りの騎士の名を叫ぶ歓声が風にのって聞こえていた。",
          {
            job: 0,
            lifeAffiliation: {
              id: "kazimierz-arena-staff",
              title: "競技会場の運営職",
              action: "leave",
              note: "退職し地域で再就職先を探す"
            },
            lifeGoal: { id: "kazimierz-arena-work", action: "abandon", note: "会場の雇用を終了" },
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_siracusa_independent_business",
      conf: "S",
      references: ["SRC_SIRACUSA_CROSSROADS_ST2", "SRC_SIRACUSA_CROSSROADS_ST4", "SRC_SIRACUSA_MARKET_MODEL"],
      st: ["青年", "壮年"],
      ge: { age: 18 },
      once: true,
      w: 0.17,
      show: s =>
        s.res.n === "シラクーザ" &&
        s.local?.kind === "固定都市の街区" &&
        !s.fl?.detained &&
        !$terraData.srAffiliationStatus(s, "siracusa-independent-trade"),
      t: "帳場の手伝いをしている街角の小売店に、大手の飲料会社から専売契約の申し出が持ち込まれた。まとまった奨励金が出る代わりに、よその飲み物をすべて棚から外せという条件だった。店主は古くから付き合いのある地元ワイナリーの瓶を見つめ、腕を組んで黙り込んでいる。",
      c: [
        $terraData.K("棚から外れる品と契約期間を洗い出し、店主と一緒に確かめる", {}, [
          1,
          "専売の対象になる品目と縛りの期間を書き出し、店主の前に広げた。もしサインすればどの常連客が困るか、棚の瓶を一つずつ指さしながら二人で数えた。",
          {
            lifeAffiliation: {
              id: "siracusa-independent-trade",
              title: "地区市場の仕入れ・帳簿手伝い",
              kind: "local-business-network",
              action: "join",
              bindToLocality: true,
              role: "一社専売案の対象と期限を帳簿に整理"
            },
            lifeGoal: {
              id: "siracusa-independent-livelihood",
              title: "契約の条件を確かめて商売を続ける",
              priority: "仕事",
              action: "start"
            },
            lifeSkill: {
              id: "market-ledger",
              title: "仕入れ契約と帳簿",
              delta: 2,
              context: "対象商品と期間を記録"
            },
            k: 2
          }
        ]),
        $terraData.K("地元ワイナリーや他の卸し先の仕入れ値を並べて比べる", {}, [
          1,
          "地元のワイナリーや別の卸商から届く瓶の仕入れ値と売れ行きを並べ、奨励金に頼らなくても店が回るか計算した。数字がそろうにつれ、店主の表情も少しずつ落ち着きを取り戻した。",
          {
            lifeAffiliation: {
              id: "siracusa-independent-trade",
              title: "地区市場の仕入れ・帳簿手伝い",
              kind: "local-business-network",
              action: "join",
              bindToLocality: true,
              role: "仕入れ先ごとの商品と値段を比較"
            },
            lifeGoal: {
              id: "siracusa-independent-livelihood",
              title: "地元の商品と複数の仕入れ先を記録する",
              priority: "仕事",
              action: "start"
            },
            lifeSkill: {
              id: "market-ledger",
              title: "市場の仕入れと帳簿",
              delta: 2,
              context: "複数の仕入れ先の商品と価格を照合"
            },
            k: 2
          }
        ]),
        $terraData.K("疑問点を店主に伝え、返事は急がないよう進言する", {}, [
          1,
          "気になるところを店主に伝え、先方の説明がそろうまでは判を押さない方がいいと進言した。契約書は帳場の引き出しにしまわれ、店先には今日も地元ワイナリーの瓶が並んでいる。",
          {
            lifeAffiliation: {
              id: "siracusa-independent-trade",
              title: "地区市場の仕入れ・帳簿手伝い",
              kind: "local-business-network",
              action: "join",
              bindToLocality: true,
              role: "専売案の説明を待ちながら帳簿を担当"
            },
            lifeGoal: {
              id: "siracusa-independent-livelihood",
              title: "仕入れ契約の条件を確かめて働く",
              priority: "仕事",
              action: "start"
            },
            lifeSkill: {
              id: "market-ledger",
              title: "市場の仕入れと帳簿",
              delta: 1,
              context: "専売契約案の対象と期限を確認待ち"
            },
            k: 1
          }
        ])
      ]
    },
    {
      id: "sr_siracusa_trade_followup",
      conf: "S",
      references: ["SRC_SIRACUSA_CROSSROADS_ST2", "SRC_SIRACUSA_CROSSROADS_ST4", "SRC_SIRACUSA_MARKET_MODEL"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.42,
      show: s => {
        const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "siracusa-independent-trade"),
          currentEpisode = affiliation?.episodes?.at(-1),
          startedYear = Number.isInteger(currentEpisode?.startedYear)
            ? currentEpisode.startedYear
            : affiliation?.startedYear;
        return (
          s.res.n === "シラクーザ" &&
          s.local?.kind === "固定都市の街区" &&
          $rules.affiliations.atRecordedLocality(s, "siracusa-independent-trade") &&
          ["active", "crisis"].includes($terraData.srAffiliationStatus(s, "siracusa-independent-trade")) &&
          Number.isInteger(startedYear) &&
          s.year - startedYear >= 1
        );
      },
      t: s => {
        const role =
          s.lifeRecord?.affiliations?.find(row => row.id === "siracusa-independent-trade")?.role || "";
        if (role.includes("一社専売案"))
          return "専売案の対象品と期限を書き込んだ帳簿をめぐって、再び営業担当が店に顔を出した。店を休んだ日の違約金や他の仕入れ先との兼ね合いをどうするか、店主と奥の机で額を寄せた。";
        if (role.includes("仕入れ先ごと"))
          return "仕入れ先ごとの商品と値段を並べた帳簿を頼りに、店主がこれからの取引先を絞り込もうとしていた。不意の休業や値上げがあった時に店を守れるか、一つずつ条件を見直した。";
        return "帳簿へ保留と記した契約案が、また店の帳場に持ち込まれた。休業した時の扱いや地元卸しとの関係がどうなるか、店主と一緒に細かい文言を読み直した。";
      },
      c: [
        $terraData.K("店主に代わって掛け合い、無理な条件を削るよう求める", {}, [
          1,
          "店主と相談し、地元の品を一部残すことや休業時の免責を先方へ申し入れた。言い値のまま呑まれないよう、譲れない一線をはっきり伝えた。",
          {
            lifeSkill: {
              id: "market-ledger",
              title: "仕入れ契約と帳簿",
              delta: 2,
              context: "契約対象・期間・休業条件を分けて確認"
            },
            lifeGoal: {
              id: "siracusa-independent-livelihood",
              action: "continue",
              note: "仕入れ契約の条件を見直すよう申し入れた"
            },
            k: 1,
            p: 1
          }
        ]),
        $terraData.K("店主が決めた方針に従い、日々の仕入れ計算を続ける", {}, [
          1,
          "交渉は店主に任せ、こちらは毎日の納品数と支払いの計算を狂いなく続けた。まだ話のついていない項目には付箋を貼り、いつでも見返せるようにしておいた。",
          {
            lifeSkill: {
              id: "market-ledger",
              title: "市場の仕入れと帳簿",
              delta: 1,
              context: "確認できた取引条件を記録"
            },
            k: 1
          }
        ]),
        $terraData.K("店の帳場手伝いに区切りをつける", {}, [
          1,
          "これまでの仕入れ値をまとめた帳面を店主に引き継ぎ、手伝いを辞めた。店先を出ると、木箱を満載した荷車が石畳を鳴らして通り過ぎていった。",
          {
            lifeAffiliation: {
              id: "siracusa-independent-trade",
              title: "地区市場の取引手伝い",
              action: "leave",
              note: "帳簿の引継ぎ後、手伝いを終了"
            },
            lifeGoal: {
              id: "siracusa-independent-livelihood",
              action: "compromise",
              note: "市場取引への関与を終了"
            },
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_siracusa_trade_relocation",
      conf: "S",
      references: ["SRC_SIRACUSA_CROSSROADS_ST2", "SRC_SIRACUSA_CROSSROADS_ST4", "SRC_SIRACUSA_MARKET_MODEL"],
      st: ["青年", "壮年", "老年"],
      after: { id: "sr_siracusa_independent_business", min: 0 },
      cd: 3,
      w: 0.12,
      show: s => {
        const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "siracusa-independent-trade");
        return affiliation?.status === "active" && $rules.affiliations.awayFromRecordedLocality(s, "siracusa-independent-trade");
      },
      t: "引っ越しをしてから、かつて帳場を手伝っていた小売店のある街区とは足が遠のいている。離れたままでは日々の納品も見られないため、店主に連絡を入れて身の振り方を決めることにした。",
      c: [
        $terraData.K("預かっていた控えを返し、店の仕事から完全に退く", {}, [
          1,
          "手元にあった仕入れの控えを店主へ送り、これまでのお礼を添えて手伝いを終えた。新しい街の市場を歩き、これからの暮らしで使う馴染みの店を探し始めた。",
          {
            lifeAffiliation: {
              id: "siracusa-independent-trade",
              action: "leave",
              note: "転居に伴い地区市場の帳簿手伝いを終了"
            },
            lifeGoal: { id: "siracusa-independent-livelihood", action: "compromise", note: "転居後、地区市場の仕事を終えた" },
            p: 0
          }
        ]),
        $terraData.K("しばらく手伝いを休み、元の街区へ戻れたらまた顔を出すと伝える", {}, [
          1,
          "新しい土地での暮らしが落ち着くまで手伝いを休ませてほしいと店主に伝えた。またあの街区へ戻ることがあれば、真っ先に店へ顔を出すつもりだ。",
          {
            lifeAffiliation: {
              id: "siracusa-independent-trade",
              action: "suspend",
              note: "転居後の生活を整える間、取引の帳簿手伝いを休止"
            },
            lifeGoal: { id: "siracusa-independent-livelihood", action: "pause", note: "転居後に帳簿仕事を休止" },
            p: 0
          }
        ])
      ]
    },
    {
      id: "sr_siracusa_trade_pause_review",
      conf: "S",
      references: ["SRC_SIRACUSA_CROSSROADS_ST2", "SRC_SIRACUSA_CROSSROADS_ST4", "SRC_SIRACUSA_MARKET_MODEL"],
      st: ["青年", "壮年", "老年"],
      after: { id: "sr_siracusa_independent_business", min: 3 },
      cd: 3,
      w: 0.1,
      show: s => {
        const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "siracusa-independent-trade");
        return (
          affiliation?.status === "suspended" &&
          $rules.affiliations.atRecordedLocality(s, "siracusa-independent-trade") &&
          s.year - (affiliation.lastChangedYear ?? s.year) >= 3
        );
      },
      t: "久しぶりに元の街区へ戻ると、かつて手伝っていた小売店の馴染みの看板が目に入った。あの時の専売契約の話はどう落ち着いたのか、のれんをくぐって店主の顔を見に行くことにした。",
      c: [
        $terraData.K("店主に挨拶し、また帳場の手伝いへ戻る", {}, [
          1,
          "懐かしい店主に迎えられ、今の仕入れ状況を聞きながら再び帳場の椅子に座った。棚には見慣れない新しい卸し先の瓶も並び、街の商いが続いてきたことを感じた。",
          {
            lifeAffiliation: {
              id: "siracusa-independent-trade",
              action: "return",
              role: "復帰後の仕入れ条件確認"
            },
            lifeGoal: {
              id: "siracusa-independent-livelihood",
              action: "continue",
              note: "元の街区へ戻り、店主と条件を確かめて再開"
            },
            p: 1
          }
        ]),
        $terraData.K("立ち話だけ交わし、手伝いはまだ休ませておく", {}, [
          1,
          "店主と近況を語り合い、今はまだ自分の仕事で手一杯だと伝えた。次にまたゆっくり立ち寄る約束をして、ワインを一本買って店を出た。",
          {
            lifeAffiliation: {
              id: "siracusa-independent-trade",
              action: "review",
              note: "元の街区へ戻ったが、帳簿手伝いの休止を継続"
            },
            lifeGoal: {
              id: "siracusa-independent-livelihood",
              action: "pause",
              note: "帳簿手伝いの休止を続けた"
            },
            p: 0
          }
        ]),
        $terraData.K("この機会に挨拶をし、手伝いに区切りをつける", {}, [
          1,
          "店主にお礼を言い、これからは客として店に通うと伝えて手伝いに区切りをつけた。肩の荷がひとつ下り、馴染みの通りをゆっくり歩いて帰った。",
          {
            lifeAffiliation: {
              id: "siracusa-independent-trade",
              action: "leave",
              note: "休止後に地区市場の手伝いを終了"
            },
            lifeGoal: {
              id: "siracusa-independent-livelihood",
              action: "compromise",
              note: "帳簿手伝いを終えた"
            },
            p: 0
          }
        ])
      ]
    }
  );
});
