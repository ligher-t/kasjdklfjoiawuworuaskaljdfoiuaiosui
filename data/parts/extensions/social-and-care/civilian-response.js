// extensions/social-and-care/civilian-response: construction fragment; evaluation order is declared by data/extensions/social-and-care.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/civilian-response"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  const londiniumAidId = "londinium-mutual-aid",
    londiniumAid = s => s.lifeRecord?.affiliations?.find(row => row.id === londiniumAidId),
    londiniumAidAtOrigin = s =>
      londiniumAid(s)?.status === "active" && $rules.affiliations.atRecordedLocality(s, londiniumAidId),
    londiniumAidAway = s =>
      londiniumAid(s)?.status === "active" && $rules.affiliations.awayFromRecordedLocality(s, londiniumAidId),
    londiniumAidPauseAtOrigin = s =>
      londiniumAid(s)?.status === "suspended" &&
      $rules.affiliations.atRecordedLocality(s, londiniumAidId) &&
      s.year - (londiniumAid(s)?.lastChangedYear ?? s.year) >= 3;
  $terraData.EV.push({
    id: "life_chernobog_resident_response",
    conf: "S",
    references: ["SRC_TL_CHERNOB_WINDOW", "SRC_TERRA_FAMILY"],
    st: ["青年", "壮年", "老年"],
    need: ["国:ウルサス", "都市:チェルノボーグ"],
    ge: { year: 1096, age: 18 },
    le: { year: 1097 },
    show: s =>
      !!s.world?.events?.chernobog_incident &&
      (s.year > 1096 || (s.year === 1096 && s.mo >= 12)),
    months: [12, 1, 2],
    once: true,
    w: 0.35,
    t: "年末から年明けにかけて、チェルノボーグの通りでは鎧戸を打ちつける音や、はぐれた身内を捜す貼り紙が目につくようになった。外の区画からの便りも途絶えがちになり、このまま部屋に残るか、伝手を頼ってよその土地へ逃れるか考えた。",
    c: [
      $terraData.K("今の街区にとどまり、近所の人たちと連絡先を確かめ合う", {}, [
        1,
        "万が一の時に避難場所や働き口の知らせが届くよう、近所の世話役と連絡の取り方を決めておいた。冷たい風が吹く通りでは、まだ窓に板を打ちつける槌音が響いていた。",
        {
          fl: { chernobog_resident_stayed: 1, chernobog_resident_displaced: 0 },
          lifeAffiliation: {
            id: "chernobog-neighbourhood",
            title: "チェルノボーグの近隣連絡先",
            kind: "neighbourhood-network",
            action: "join",
            role: "近隣との避難・仕事の連絡を保つ"
          },
          lifeGoal: {
            id: "chernobog-household-continuity",
            title: "近所の連絡を保ち、暮らしをつなぐ",
            priority: "住まいと生計",
            action: "start"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグの近隣連絡",
            kind: "household-stay-decision",
            description:
                "事件圧力期に区画へ残り、避難所や働き口の知らせを受け取れる宛先を確かめた。"
          },
          groupStanding: {
            id: "chernobog-neighbours",
            title: "近隣住民",
            delta: 1,
            reason: "連絡先の確認を引き受けた"
          },
          p: -1
        }
      ]),
      $terraData.K(
        "荷物をまとめ、つてを頼ってよその地域へ避難する",
        { en: { affordableRoute: true }, why: "移動費と生活予備費を確保できない" },
        [
          1,
        "紹介してもらった移動先へ逃れ、避難所で毛布と場所を割り当ててもらった。はぐれた知人たちの連絡先を胸ポケットにしまい、見知らぬ土地で今夜眠る場所を整えた。",
          {
            res: 1,
            fl: { chernobog_resident_displaced: 1, chernobog_resident_stayed: 0 },
            lifeAffiliation: {
              id: "chernobog-neighbourhood",
              title: "チェルノボーグの近隣連絡先",
              kind: "neighbourhood-network",
              action: "join",
              role: "避難先から便りを待つ"
            },
            lifeGoal: {
              id: "chernobog-household-continuity",
            title: "離れた知人や近所の消息を確かめながら新しい暮らしを組み立てる",
              priority: "住まいと生計",
              action: "start"
            },
            regionalImpact: {
              region: "ウルサス",
              entity: "チェルノボーグの近隣連絡",
              kind: "household-displacement",
              description:
                "紹介された移動先へ移り、避難所の帳面に名前を書いた。"
            },
            p: -2,
            rl: -2
          }
        ]
      ),
        $terraData.K("すぐには動かず、手元の金と保存食を確かめて様子を見る", {}, [
        1,
          "戸棚の食料と財布の中身を数え直した。街の外がどうなっているのか確かな噂も入らず、まずは自宅で嵐が過ぎるのを待つことにした。",
        {
          fl: { chernobog_resident_stayed: 1, chernobog_resident_displaced: 0 },
          lifeGoal: {
            id: "chernobog-household-continuity",
            title: "手元の暮らしを確かめながら次の住まいを決める",
            priority: "手元の暮らし",
            action: "start"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグの住居・仕事",
            kind: "household-move-deferred",
            description: "移動を決めず、手元の金と食料を確かめて保留した。"
          },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_chernobog_resident_later",
    conf: "S",
    references: ["SRC_TL_CHERNOB_WINDOW", "SRC_TERRA_FAMILY"],
    st: ["青年", "壮年", "老年"],
    any: ["チェルノボーグから避難した", "チェルノボーグに留まった"],
    after: { id: "life_chernobog_resident_response", min: 1 },
    ge: { year: 1098 },
    le: { year: 1105 },
    once: true,
    w: 0.22,
    t: [
      {
        when: "チェルノボーグから避難した",
        t: "避難先での新しい道順がようやく足に馴染んできた頃、チェルノボーグの元の街区にいた人たちからぽつりぽつりと便りが届き始めた。無事が分かった人もいれば、あの冬以来ぷっつりと音信が途絶えたままの顔もあった。"
      },
      {
        t: "あの混乱のあともチェルノボーグに残り続けたが、行きつけだった店も隣近所の顔ぶれもすっかり変わってしまった。よその街へ逃れた人から思い出したように便りが届く月もあれば、誰の消息も聞かないまま過ぎる月もあった。"
      }
    ],
    c: [
      $terraData.K("近所の世話役と連絡を保ち、無事が分かった人たちの近況をつなぐ", {}, [
        1,
        "昔の世話役と手紙のやり取りを続け、確かな近況が分かった人たちの無事を他の顔なじみにも伝えて回った。行方の知れない人たちの名前だけは、胸のつかえとともに残った。",
        {
          lifeAffiliation: {
            id: "chernobog-neighbourhood",
            title: "チェルノボーグの近隣連絡先",
            action: "continue",
            role: "確認できた近況を便りでつなぐ",
            onlyIfActive: true
          },
          lifeGoal: {
            id: "chernobog-household-continuity",
            title: "近所の連絡を保ち、暮らしをつなぐ",
            priority: "人との縁",
            action: "continue",
            note: "消息が確認できた範囲だけ便りを続けた"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグの近隣連絡",
            kind: "later-contact",
            description: "移動後または現地に残った後も、確認できた知らせと未確認の消息を分けて記録した。"
          },
          p: 1
        }
      ]),
      $terraData.K("集まった連絡先を次の世話役に託し、取りまとめの役目を降りる", {}, [
        1,
        "連絡がついた相手と、まだ行方が分からない相手を整理して次の世話役に託した。重たい役目にひと区切りをつけ、自分の暮らしへ戻った。",
        {
          lifeAffiliation: {
            id: "chernobog-neighbourhood",
            title: "チェルノボーグの近隣連絡先",
            action: "leave",
            note: "確認済み・未確認を分けて次の世話役へ渡した",
            onlyIfActive: true
          },
          lifeGoal: {
            id: "chernobog-household-continuity",
            title: "近所の連絡を保ち、暮らしをつなぐ",
            priority: "人との縁",
            action: "complete",
            note: "確認できた連絡先を引き継いだ。未確認の消息は残った"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグの近隣連絡",
            kind: "later-handover",
            description: "確認済みと未確認を分け、地域の世話役へ連絡先を引き継いだ。"
          },
          p: 1
        }
      ]),
      $terraData.K("これ以上昔の消息を追うのはやめ、今の自分の暮らしに専念する", {}, [
        1,
        "いつまでもあの冬の記憶を引きずるのはやめようと、連絡の取りまとめから離れた。返事のない人たちの行方は、もうそれ以上追わなかった。",
        {
          lifeAffiliation: {
            id: "chernobog-neighbourhood",
            title: "チェルノボーグの近隣連絡先",
            action: "leave",
            note: "自分の暮らしを優先して連絡役を終えた",
            onlyIfActive: true
          },
          lifeGoal: {
            id: "chernobog-household-continuity",
            title: "近所との連絡を保ちながら自分の暮らしを続ける",
            priority: "自分の暮らし",
            action: "abandon",
            note: "連絡役を終え、未確認の消息を残した"
          },
          p: 0
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_londinium_civilian_response",
    conf: "S",
    references: ["SRC_TL_LONDINIUM_WINDOW", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["国:ヴィクトリア", "都市:ロンディニウム"],
    ge: { year: 1098, age: 18 },
    le: { year: 1098 },
    months: [7, 8, 9],
    show: s => !londiniumAid(s) && !!s.world?.events?.londinium_war,
    once: true,
    w: 0.34,
    t: "ロンディニウムの街区で戦闘と夜間外出禁止令が続き、通い慣れた道も封鎖されて店も閉まった。近所の集まりでは、焼け出された人たちのために炊き出しと空き部屋の融通を始めるという。だが表立って名を連ねれば、占領軍の巡찰に目をつけられる恐れもあった。",
    c: [
      $terraData.K("近所の炊き出しと寝床の案内に加わる", {}, [
        1,
        "路地裏の炊き出しで大鍋の汁物をよそい、家を失った人たちに空き部屋を案内して回った。日が暮れても列は途切れず、次に手伝える日を世話役と約束して夜道を帰った。",
        {
          lifeAffiliation: {
            id: "londinium-mutual-aid",
            title: "ロンディニウムの地域民間支援",
            kind: "civilian-relief",
            action: "join",
            bindToLocality: true,
            role: "炊き出し・寝床案内",
            note: "住民の支援活動。レユニオン所属や指揮関係は確認していない"
          },
          lifeGoal: {
            id: "londinium-civilian-continuity",
            title: "戦時下でも近所の暮らしと仕事のつながりを保つ",
            priority: "地域と生計",
            action: "start"
          },
          groupStanding: {
            id: "londinium-displaced",
            title: "ロンディニウムの避難者",
            delta: 2,
            reason: "住民の炊き出しと寝床案内を手伝った"
          },
          regionalImpact: {
            region: "ヴィクトリア",
            entity: "ロンディニウムの住民支援",
            kind: "resident-relief-entry",
            description: "現地住民の支援へ参加した。外部組織との所属・指揮関係は未確認。"
          },
          fl: { londinium_civilian_route: 1 },
          p: -1,
          rl: 1
        }
      ]),
      $terraData.K("余っている食料や毛布を一度だけ届け、名前は残さない", {}, [
        1,
        "家から持ち出した食料と毛布を一度だけ集積場所へ届け、当番には加わらずにその場を離れた。帰り道、重い鎧戸を下ろした店ばかりの通りを足早に抜けた。",
        {
          lifeGoal: {
            id: "londinium-civilian-continuity",
            title: "近所の知らせを確かめながら暮らしを続ける",
            priority: "地域と暮らし",
            action: "start"
          },
          regionalImpact: {
            region: "ヴィクトリア",
            entity: "ロンディニウムの住民支援",
            kind: "one-time-resident-relief",
            description: "避難者へ物資を一度だけ届け、地域組織には加入しなかった。"
          },
          fl: { londinium_civilian_route: 1 },
          p: 1
        }
      ]),
      $terraData.K("関わり合いになるのを避け、自分の寝床と通行証を守る", {}, [
        1,
        "住民の集まりには近づかず、懐の通行証を確かめて自分の部屋へ急いだ。路地の奥で湯気を立てる炊き出しの列を横目に、扉の鍵を二重にかけた。",
        {
          lifeGoal: {
            id: "londinium-civilian-continuity",
            title: "戦時下でも自分の暮らしを保つ",
            priority: "安全と暮らし",
            action: "start"
          },
          regionalImpact: {
            region: "ヴィクトリア",
            entity: "ロンディニウムの住民生活",
            kind: "resident-kept-distance",
            description: "地域支援組織には加わらず、身近な人との連絡と自分の暮らしを優先した。"
          },
          fl: { londinium_civilian_route: 1 },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_reunion_londinium_local_aid",
    conf: "S",
    references: ["SRC_TL_LONDINIUM_WINDOW", "SRC_REUNION_HISTORY"],
    st: ["青年", "壮年"],
    need: [
      "国:ヴィクトリア",
      "都市:ロンディニウム",
      "1097年以後の再編レユニオン互助網に連絡中"
    ],
    ge: { year: 1098, age: 18 },
    le: { year: 1101 },
    show: s =>
      !londiniumAid(s) &&
      !!s.world?.events?.londinium_war &&
      (s.year > 1098 || (s.year === 1098 && s.mo >= 7)),
    once: true,
    w: 0.3,
    t: "再編された互助網の連絡役から、近所の街区で続けている炊き出しの手伝いを頼まれた。配給場所の前には、戦火で家や仕事を失った人々が長蛇の列を作っている。重い鍋を運ぶ人手も、今夜雨露をしのぐ寝床もまったく足りていなかった。",
    c: [
      $terraData.K("炊き出しと空き部屋の案内に加わり、現場を手伝う", {}, [
        1,
        "湯気の立つ鍋から食事を配り、行き場のない家族に空いている建物の場所を案内して回った。世話役と次の手伝いの日を決め、紹介してくれた連絡役にも現場に入ったことを伝えた。",
        {
          lifeAffiliation: {
            id: "londinium-mutual-aid",
            title: "ロンディニウムの地域民間支援",
            kind: "civilian-relief",
            action: "join",
            bindToLocality: true,
            role: "炊き出し・寝床案内",
            note: "再編レユニオンとの指揮関係は未確認"
          },
          lifeGoal: {
            id: "londinium-civilian-continuity",
            title: "戦時下でも近所の暮らしと仕事のつながりを保つ",
            priority: "地域と生計",
            action: "start"
          },
          groupStanding: {
            id: "londinium-displaced",
            title: "ロンディニウムの避難者",
            delta: 2,
            reason: "食事と寝床の案内を手伝った"
          },
          regionalImpact: {
            region: "ヴィクトリア",
            entity: "ロンディニウムの地域民間支援",
            kind: "wartime-relief",
            description: "炊き出しと一時的な寝床案内を行う地域活動に加わった"
          },
          p: 1,
          rl: 1
        }
      ]),
      $terraData.K("食料の包みを一度だけ運び込み、決まった当番には入らない", {}, [
        1,
        "頼まれた食料の箱を指定の倉庫まで一度だけ運び込んだ。継続的な当番には入れないと世話役と連絡役に断り、日の落ちる前に通りを抜けた。",
        {
          groupStanding: {
            id: "londinium-displaced",
            title: "ロンディニウムの避難者",
            delta: 1,
            reason: "食料を一度だけ届けた"
          },
          regionalImpact: {
            region: "ヴィクトリア",
            entity: "ロンディニウムの地域民間支援",
            kind: "one-time-relief",
            description: "避難者向けの食料を一度だけ指定場所へ届けた"
          },
          p: 1
        }
      ]),
      $terraData.K("巡察の目を警戒し、紹介された場所へは近づかない", {}, [
        1,
        "衛兵に怪しまれるのを恐れ、紹介された場所へは足を向けずに部屋へ戻った。窓の外では、配給を待つ人々のざわめきが夜更けまで続いていた。",
        { p: -1, rl: -1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_londinium_civilian_afterwar",
    conf: "S",
    references: ["SRC_TL_LONDINIUM_WINDOW", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["国:ヴィクトリア", "都市:ロンディニウム", "ロンディニウム戦争期の生活を経験", "ロンディニウムの地域互助に協力中"],
    after: { id: "life_londinium_civilian_response", min: 1 },
    show: londiniumAidAtOrigin,
    ge: { year: 1100 },
    le: { year: 1105 },
    once: true,
    w: 0.22,
    t: "ロンディニウムから砲声が遠のいたあとも、工場の再開はまちまちで、避難していた人々が戻ってくる気配も揃わなかった。戦時中から一緒に炊き出しを続けてきた仲間と、これからの手伝いをどうするか話し合った。",
    c: [
      $terraData.K("連絡がついた家と音信不通の家を整理して次の世話役に託し、役目を終える", {}, [
        1,
        "これまで配給を届けていた家々のうち、無事が分かった所と空き家のままの所を整理して次の世話役に引き継いだ。長かった戦時中の手助けに、ようやく一区切りをつけた。",
        {
          lifeAffiliation: {
            id: "londinium-mutual-aid",
            title: "ロンディニウムの地域民間支援",
            action: "leave",
            note: "避難者の名簿を確認済み・未確認に分けて引継ぎ"
          },
          lifeGoal: {
            id: "londinium-civilian-continuity",
            title: "戦時下でも近所の暮らしと仕事のつながりを保つ",
            priority: "地域支援",
            action: "complete",
            note: "支援の帳面を次の世話役へ渡した"
          },
          regionalImpact: {
            region: "ヴィクトリア",
            entity: "ロンディニウムの住民支援",
            kind: "resident-relief-handover",
            description: "帰還を推測せず、確認済みと未確認の届け先を分けて帳面を引き継いだ。"
          },
          p: 1
        }
      ]),
      $terraData.K("仕事の合間に手伝いを続け、戻ってきた人たちの安否を確かめて回る", {}, [
        1,
        "自分の仕事の合間を縫って手伝いを続け、街へ戻ってきた人たちから新しい住まいや働き口の話を聞いて回った。扉が閉ざされたままの家もまだ少なくなかった。",
        {
          lifeAffiliation: {
            id: "londinium-mutual-aid",
            title: "ロンディニウムの地域民間支援",
            action: "role",
            role: "転居先の連絡を確認"
          },
          lifeGoal: {
            id: "londinium-civilian-continuity",
            title: "戦時下でも近所の暮らしと仕事のつながりを保つ",
            priority: "地域支援",
            action: "continue",
            note: "連絡のつく世帯から転居先を確かめる"
          },
          regionalImpact: {
            region: "ヴィクトリア",
            entity: "ロンディニウムの住民支援",
            kind: "resident-relief-followup",
            description: "転居先の分かる世帯から連絡を続け、返事のない人は未確認のまま残した。"
          },
          p: -1,
          rl: 1
        }
      ]),
      $terraData.K("自分の生活を立て直すため、手伝いから手を引く", {}, [
        1,
        "まずは自分の暮らしを立て直すのが先決だと伝え、手伝いの輪から抜けた。",
        {
          lifeAffiliation: {
            id: "londinium-mutual-aid",
            title: "ロンディニウムの地域民間支援",
            action: "leave",
            note: "自分の暮らしを優先"
          },
          lifeGoal: {
            id: "londinium-civilian-continuity",
            title: "戦時下でも近所の暮らしと仕事のつながりを保つ",
            priority: "生活再建",
            action: "abandon",
            note: "当番を終え、生活の立て直しを優先"
          },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_londinium_aid_afterwar",
    conf: "S",
    references: ["SRC_TL_LONDINIUM_WINDOW", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    need: ["国:ヴィクトリア", "都市:ロンディニウム", "ロンディニウムの地域互助に協力中"],
    after: { id: "life_reunion_londinium_local_aid", min: 1 },
    show: londiniumAidAtOrigin,
    ge: { year: 1100 },
    le: { year: 1105 },
    once: true,
    w: 0.25,
      t: "戦火が収まったあとも、配給所の周りには行き場を失った人々や、どこへ頼ればいいか分からない新参者が集まっていた。人手が足りないなか、このまま手伝いを続けるか、後任に引き継ぐか考えた。",
    c: [
      $terraData.K("配給の手順と連絡先を次の世話役に引き継ぎ、役目を終える", {}, [
        1,
        "これまでの配給先や残った物資の扱いを新しい世話役に丁寧に引き継ぎ、現場を離れた。",
        {
          lifeAffiliation: {
            id: "londinium-mutual-aid",
            title: "ロンディニウムの地域民間支援",
            action: "leave",
            note: "配給帳面を地域の世話役へ引継ぎ"
          },
          lifeGoal: {
            id: "londinium-civilian-continuity",
            action: "complete",
            note: "支援の帳面と連絡先を次の世話役へ渡した"
          },
          regionalImpact: {
            region: "ヴィクトリア",
            entity: "ロンディニウムの地域民間支援",
            kind: "postwar-handover",
            description: "避難先未確認の記録を含め、地域の次の世話役へ帳面を引き継いだ"
          },
          groupStanding: {
            id: "londinium-displaced",
            title: "ロンディニウムの避難者",
            delta: 1,
            reason: "支援記録と未確認先を引き継いだ"
          },
          p: 1
        }
      ]),
      $terraData.K("人手が足りない配給所に残り、避難者の安否と届け先を確かめ続ける", {}, [
        1,
        "まだ誰も代わりがいない現場に残り、届く食料を分けながら避難者たちの今の居場所を確かめて回った。",
        {
          lifeAffiliation: {
            id: "londinium-mutual-aid",
            title: "ロンディニウムの地域民間支援",
            action: "role",
            role: "避難者の所在確認"
          },
          lifeGoal: {
            id: "londinium-civilian-continuity",
            title: "避難者が次の暮らしへ移るまで連絡を保つ",
            priority: "地域支援",
            action: "continue"
          },
          regionalImpact: {
            region: "ヴィクトリア",
            entity: "ロンディニウムの地域民間支援",
            kind: "postwar-followup",
            description: "配給を受けた避難者の所在を確認し、連絡がつかない人を別記した"
          },
          p: -1,
          rl: 1
        }
      ]),
      $terraData.K("自分の暮らしを立て直すため、配給所の手伝いを辞める", {}, [
        1,
        "自分の生活を立て直すのが精一杯だと世話役に詫びて、配給所の手伝いを離れた。帰り道、夕闇のなかにまだ配給所の灯りがぽつんと見えていた。",
        {
          lifeAffiliation: {
            id: "londinium-mutual-aid",
            title: "ロンディニウムの地域民間支援",
            action: "leave",
            note: "生活再建を優先して退いた"
          },
          lifeGoal: {
            id: "londinium-civilian-continuity",
            action: "abandon",
            note: "地域支援の当番を終え、自分の暮らしの立て直しを優先"
          },
          p: 1
        }
      ])
    ]
  });

  $terraData.EV.push(
    {
      id: "life_londinium_mutual_aid_relocation",
      conf: "S",
      references: ["SRC_TL_LONDINIUM_WINDOW", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.12,
      show: londiniumAidAway,
      t: "炊き出しや寝床の案内を手伝っていたロンディニウムの街区を離れ、新しい土地へ移り住んだ。遠く離れた今、あちらの仲間との関わりをどうするか考えた。",
      c: [
        $terraData.K("現地の世話役にすべて託し、手伝いの役目を終える", {}, [
          1,
          "自分が受け持っていた分を現地の世話役へ引き継ぎ、新しい土地での暮らしに区切りをつけた。",
          {
            lifeAffiliation: {
              id: londiniumAidId,
              action: "leave",
              note: "転居に伴いロンディニウムの地域支援を引き継いだ"
            },
            lifeGoal: {
              id: "londinium-civilian-continuity",
              action: "complete",
              onlyIfActive: true,
              note: "転居後、現地の世話役へ地域支援を引き継いだ"
            },
            p: 0
          }
        ]),
        $terraData.K("しばらく手伝いを休み、元の街区へ戻ることがあれば考え直す", {}, [
          1,
          "新しい土地での生活が落ち着くまで手伝いを休むと便りを出した。いつかあの街区へ戻ることがあれば、また顔を出すつもりでいた。",
          {
            lifeAffiliation: {
              id: londiniumAidId,
              action: "suspend",
              note: "転居先の生活を整える間、現地支援の当番を休止"
            },
            lifeGoal: {
              id: "londinium-civilian-continuity",
              action: "pause",
              onlyIfActive: true,
              note: "転居後にロンディニウムの地域支援を休止"
            },
            p: 0
          }
        ])
      ]
    },
    {
      id: "life_londinium_mutual_aid_pause_review",
      conf: "S",
      references: ["SRC_TL_LONDINIUM_WINDOW", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      need: ["国:ヴィクトリア", "都市:ロンディニウム"],
      after: { id: "life_londinium_mutual_aid_relocation", min: 0 },
      cd: 3,
      w: 0.12,
      show: londiniumAidPauseAtOrigin,
      t: "久しぶりに、かつて手伝っていた街区の配給所をのぞいてみた。新しい世話役が人手の足りない日を指折り数えており、また手を貸すべきか考えた。",
      c: [
        $terraData.K("世話役に声をかけ、また配給の手伝いに戻る", {}, [
          1,
          "今の配給所の様子を聞いて、空いている日の手伝いを引き受けた。久しぶりにエプロンを締め、配給を待つ人たちの列に向き合った。",
          {
            lifeAffiliation: { id: londiniumAidId, action: "return", role: "配給先の確認・当番" },
            lifeGoal: {
              id: "londinium-civilian-continuity",
              action: "continue",
              note: "ロンディニウムへ戻り、現地の当番を再開"
            },
            p: 1
          }
        ]),
        $terraData.K("まだ自分の生活で手いっぱいだと伝え、休止を続ける", {}, [
          1,
          "まだ自分の暮らしが落ち着かず手伝いには戻れないと詫び、また余裕ができた頃に顔を出すことにした。",
          {
            lifeAffiliation: { id: londiniumAidId, action: "review", note: "ロンディニウムへ戻ったが当番休止を継続" },
            lifeGoal: {
              id: "londinium-civilian-continuity",
              action: "pause",
              note: "現地へ戻った後も地域支援を休止"
            },
            p: 0
          }
        ]),
        $terraData.K("きっぱりと手伝いから退き、自分の暮らしに専念する", {}, [
          1,
          "これからはもう手伝いには加われないと世話役に告げ、配給所をあとにした。",
          {
            lifeAffiliation: { id: londiniumAidId, action: "leave", note: "帰還後に地域支援の当番を終了" },
            lifeGoal: {
              id: "londinium-civilian-continuity",
              action: "abandon",
              note: "ロンディニウムの地域支援から退いた"
            },
            p: 0
          }
        ])
      ]
    }
  );
});
