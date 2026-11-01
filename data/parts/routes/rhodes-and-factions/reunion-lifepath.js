// routes/rhodes-and-factions/reunion-lifepath: Reunion-specific life route.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/reunion-lifepath"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  const affiliation = (s, id) =>
    s.lifeRecord?.affiliations?.find(row => row.id === id) || null;
  const active = (s, id) => ["active", "crisis"].includes(affiliation(s, id)?.status);
  const role = (s, id) => affiliation(s, id)?.role || "";
  const postAt = (s, id, prefix) => active(s, id) && role(s, id).startsWith(prefix) && $rules.affiliations.canWork(s,id);
  const attachedAfterChernobog = s =>
    ["active", "crisis", "suspended"].includes(affiliation(s, "reunion-1096")?.status);

  const localEntry = $terraData.EV.find(event => event.id === "life_reunion_local_entry");
  if (localEntry) {
    localEntry.need = ["国:ウルサス", "都市:チェルノボーグ"];
    delete localEntry.any;
    localEntry.show = s =>
      !!s.world?.events?.chernobog_incident && !affiliation(s, "reunion-1096");
    localEntry.t =
      "チェルノボーグの街区がレユニオンに占拠され、行き場を失った感染者とその家族が廃倉庫の片隅に身を寄せ合っていた。食料や薬を運ぶ人手が足りないという。力を貸せば助かる人がいる一方で、武器を手にした連中の争いにも巻き込まれかねない。";
    localEntry.c = [
      $terraData.K(
        "感染者の仲間として連絡網に入り、食料や薬を運ぶ",
        { show: s => !!s.inf },
        [
          1,
          "荷運びの仲間に加わり、届いた木箱から食料と薬を仕分けした。倉庫の冷たい床に毛布を敷いて寝起きするようになり、配給を待つ家族と顔を合わせる日が増えた。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              title: "チェルノボーグのレユニオン支援隊",
              kind: "infected-mutual-aid",
              action: "join",
              role: "チェルノボーグ臨時拠点・物資運搬"
            },
            groupStanding: {
              id: "infected-neighbours",
              title: "避難中の感染者と家族",
              delta: 2,
              reason: "食料や薬を届ける当番に加わった"
            },
            regionalImpact: {
              entity: "チェルノボーグの避難者",
              kind: "relief",
              description: "レユニオンが使う臨時拠点から、近隣の避難者へ食料と薬を運んだ"
            },
            lifeGoal: {
              id: "protect-neighbours",
              title: "避難中の感染者と家族を身近な範囲で支える",
              priority: "地域",
              action: "start"
            },
            residenceArrangement: "independent_rental",
            fl: { reunion: 1, household_separated: 1, sch: 0 },
            p: 1
          }
        ]
      ),
      $terraData.K("頼まれた家へ一度だけ荷を届け、組織には加わらない", {}, [
        1,
        "指定された家の戸口で食料を手渡し、次の当番には名前を残さずに倉庫を離れた。帰り道は腕章をつけた集団や検問の列を避け、裏通りを足早に抜けた。",
        {
          regionalImpact: {
            entity: "チェルノボーグの避難者",
            kind: "one-time-relief",
            description: "感染者の家へ物資を一度届け、組織への加入は断った"
          },
          rl: 1,
          p: 1
        }
      ]),
      $terraData.K("誘いを断り、家族と街を出る道を探す", {}, [
        1,
        "きな臭い倉庫には近づかず、家族の手を引いて安全な避難先を探した。あの時声をかけてきた人たちがその後どうなったのかは、知るよしもなかった。",
        { p: 1, fl: { war_displaced: 1 } }
      ])
    ];
  }

  // The shortage dispute and its review happen among people handling local deliveries.
  // A person who kept only a contact role may hear about the network, but is not present
  // for a warehouse inventory dispute or personally suspected over its ledger.
  const reorgTension = $terraData.EV.find(event => event.id === "life_reunion_reorg_tension");
  if (reorgTension)
    reorgTension.show = s => {
      const record = affiliation(s, "reunion-reorg");
      return record?.status === "active" && record.role === "近隣への物資運び";
    };

  const reorgCrisisReview = $terraData.EV.find(event => event.id === "life_reunion_reorg_crisis_review");
  if (reorgCrisisReview)
    reorgCrisisReview.show = s => {
      const record = affiliation(s, "reunion-reorg");
      return record?.status === "crisis" && record.role === "配給記録・照会";
    };

  const neighbourContact = $terraData.EV.find(event => event.id === "sr_reunion_neighbour_contact");
  if (neighbourContact) {
    neighbourContact.show = s =>
      ["ウルサス", "龍門", "ヴィクトリア", "カズデル"].includes(s.res.n) &&
      !["active", "crisis", "suspended"].includes(affiliation(s, "reunion-reorg")?.status) &&
      !attachedAfterChernobog(s) &&
      !s.fl?.detained;
    if (neighbourContact.c?.[1]) neighbourContact.c[1].show = s => !!s.inf;
  }

  const orderConflict = $terraData.EV.find(event => event.id === "life_reunion_order_conflict");
  if (orderConflict) {
    orderConflict.need = [
      "1096年のレユニオン地域網",
      "国:ウルサス",
      "都市:チェルノボーグ"
    ];
    orderConflict.after = { id: "life_reunion_chernobog_base_assignment", min: 0 };
    orderConflict.le = { year: 1097 };
    orderConflict.months = [1, 2];
    orderConflict.t =
      "臨時拠点の配給所で、避難者を守るためにも全員が武器を取るべきだと息巻く声が上がった。周囲の仲間も意見が割れ、重苦しい空気が張りつめている。このまま配給の手伝いを続けるか、武装した隊に入るか、それともここを去るか決めなければならなかった。";
  }

  $terraData.EV.push(
    {
      id: "life_reunion_early_contact",
      conf: "S",
      references: ["SRC_REUNION_TIMELINE", "SRC_REUNION_EARLY_CAMP", "SRC_REUNION_HISTORY"],
      st: ["青年", "壮年"],
      need: ["国:ウルサス"],
      ge: { year: 1090, age: 18 },
      le: { year: 1095 },
      once: true,
      w: 0.18,
      show: s => !!s.inf && !affiliation(s, "reunion-1096"),
      t: "ウルサス北部の凍原を渡り歩く感染者の一団が、追われてきた者に毛布と温かい食事を分け、夜通し見張りの火を焚いていた。まもなく次の集落へ向けて野営を畳むという。彼らと行動をともにするか、焚火のそばで声をかけられた。",
      c: [
        $terraData.K("食事と寝床の世話を引き受け、移動野営地に加わる", {}, [
          1,
          "毛布と乾パンを配る役目を引き受け、一団の列に加わった。夜は焚火が消えないよう交代で薪をくべ、夜明け前には凍えた手で荷車を括り直した。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              title: "レユニオン初期支援隊",
              kind: "infected-mutual-aid",
              action: "join",
              role: "初期移動野営地・食料と寝床の当番"
            },
            lifeGoal: {
              id: "protect-neighbours",
              title: "追われた感染者が休める場所を保つ",
              priority: "互助",
              action: "start"
            },
            groupStanding: {
              id: "reunion-early-companions",
              title: "凍原を移動する感染者の仲間",
              delta: 2,
              reason: "野営地の食料と寝床を担った"
            },
            fl: { reunion: 1 },
            p: 1
          }
        ]),
        $terraData.K("夜の見張りと抜け道の案内を引き受ける", {}, [
          1,
          "吹雪の夜に見張りへ立ち、朝になれば次の集落へ抜ける獣道を確かめた。遠くに監視哨の影を見つけたときは口笛で合図を送り、仲間の列を窪地へ隠した。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              title: "レユニオン初期支援隊",
              kind: "infected-mutual-aid",
              action: "join",
              role: "初期移動野営地・見張りと避難路案内"
            },
            lifeGoal: {
              id: "protect-neighbours",
              title: "追われた感染者が通れる道を探す",
              priority: "互助",
              action: "start"
            },
            groupStanding: {
              id: "reunion-early-companions",
              title: "凍原を移動する感染者の仲間",
              delta: 2,
              reason: "夜間の見張りと避難路案内を担った"
            },
            fl: { reunion: 1 },
            h: -1,
            p: 1
          }
        ]),
        $terraData.K("安全な道順だけ教え、今の集落にとどまる", {}, [
          1,
          "吹雪を避けられる谷筋を地面に描いて教えた。一団が白い闇へ消えていくのを見送り、自分は集落の小屋へ戻っていつもの仕事に就いた。",
          { k: 1, p: 1 }
        ]),
        $terraData.K("関わりを避け、誘いを断る", {}, [
          1,
          "首を振って誘いを断り、足早に自分の家へ戻った。夜風に混じって見張りの呼び声が遠くから聞こえたが、戸の桟を固く閉ざして眠った。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "life_reunion_early_camp_daily",
      conf: "S",
      references: ["SRC_REUNION_EARLY_CAMP", "SRC_SR_REUNION_SPLIT", "SRC_REUNION_HISTORY"],
      st: ["青年", "壮年", "老年"],
      need: ["国:ウルサス"],
      ge: { year: 1090 },
      le: { year: 1095 },
      cd: 2,
      w: 0.43,
      show: s =>
        postAt(s, "reunion-1096", "初期移動野営地・") &&
        s.year >= 1090 && s.year <= 1095,
      t: "凍原の野営地で、雪に湿った薪を焚火のそばへ寄せ、底をつきかけた食料袋を改めた。外の見張りは交代が遅れ、天幕の奥では怪我をした仲間が浅い息をついている。誰も疲れ果てているなか、今夜の手を動かさなければならなかった。",
      c: [
        $terraData.K("残った食料を均等に分け、起きている者から配る", {}, [
          1,
          "鍋のスープを一人分ずつ器へよそい、子どもと怪我人の分を先に確保した。足りない分は次の集落の近くで根菜や乾飯を分けてもらうしかない。",
          {
            lifeSkill: {
              id: "reunion-camp-care",
              title: "移動野営地の物資配分",
              delta: 3,
              context: "食料を小分けして当番へ渡す"
            },
            groupStanding: {
              id: "reunion-early-companions",
              title: "凍原を移動する感染者の仲間",
              delta: 1,
              reason: "限られた食料を当番ごとに配った"
            },
            p: 1
          }
        ]),
        $terraData.K("怪我人の手当てを手伝い、見張りが戻るのを待つ", {}, [
          1,
          "沸かした湯で布を絞って傷口を拭い、冷え切った見張り番が戻ってくるまで火の番を続けた。毛布にくるまったのは夜明け近くで、風の音に何度も目を覚ました。",
          { h: 1, rl: 1 }
        ]),
        $terraData.K("雪原に残った足跡を確かめ、迂回路を提案する", {}, [
          1,
          "新雪に刻まれた軍靴の跡を見極め、大通りを避ける谷あいの道を見張り頭へ進言した。深追いはせず、白い息を吐きながら焚火の輪へ戻った。",
          { k: 1, h: -1 }
        ]),
        $terraData.K("今夜は当番を抜け、火のそばで身体を休める", {}, [
          1,
          "これ以上は動けないと仲間に断り、焚火の近くで毛布を頭までかぶった。外で雪を踏む音がするたびに肩がこわばり、朝まで浅い眠りが続いた。",
          { h: 2, p: 1 }
        ])
      ]
    },
    {
      id: "life_reunion_chernobog_base_assignment",
      conf: "S",
      references: ["SRC_TL_CHERNOB_WINDOW", "SRC_REUNION_HISTORY", "SRC_REUNION_CHERNOB_BASE"],
      st: ["青年", "壮年", "老年"],
      need: ["国:ウルサス", "都市:チェルノボーグ"],
      ge: { year: 1096, age: 18 },
      le: { year: 1097 },
      months: [12, 1],
      once: true,
      w: 0.72,
      show: s => !!s.world?.events?.chernobog_incident && active(s, "reunion-1096") && !!s.inf,
      t: "チェルノボーグの廃倉庫に設けられた臨時拠点は、炊き出しの湯気と人々の熱気でむせ返っていた。薬を待つ家族が長い列を作るすぐ横で、鉄パイプや武器を握った若者たちが出入口を固めている。倉庫の奥では、街に踏みとどまるか脱出路を開くかで怒鳴り合いが続いていた。",
      c: [
        $terraData.K("食料と薬の振り分けを受け持ち、配給の列をさばく", {}, [
          1,
          "殺気立つ列をなだめながら、一家族ずつ食料と薬を手渡した。底をついた鎮痛剤の名を救護班へ伝え、空になった木箱を壁際に積み上げた。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              title: "チェルノボーグのレユニオン支援隊",
              action: "role",
              role: "チェルノボーグ臨時拠点・物資配給"
            },
            lifeSkill: {
              id: "reunion-camp-care",
              title: "移動野営地の物資配分",
              delta: 3,
              context: "チェルノボーグ臨時拠点で配給表を整えた"
            },
            p: 1,
            k: 1
          }
        ]),
        $terraData.K("街を離れる人たちへ抜け道を教え、誘導を引き受ける", {}, [
          1,
          "封鎖されていない路地を教え、はぐれた時の目印と落ち合う場所を決めて送り出した。翌朝、戻らなかった誘導係の分まで新しい地図を描き直した。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              title: "チェルノボーグのレユニオン支援隊",
              action: "role",
              role: "チェルノボーグ臨時拠点・避難誘導"
            },
            lifeSkill: {
              id: "reunion-camp-route",
              title: "避難路と連絡の案内",
              delta: 3,
              context: "臨時拠点から避難する人へ道順を伝えた"
            },
            rl: 1,
            p: 1
          }
        ]),
        $terraData.K("夜間の見張りに立ち、倉庫の出入口を警戒する", {}, [
          1,
          "冷え込む夜更けに倉庫の扉口へ立ち、近づく足音や遠くの怒号に耳を澄ませた。白々と夜が明ける頃、交代の見張りへ夜のあいに起きたことを引き継いだ。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              title: "チェルノボーグのレユニオン支援隊",
              action: "role",
              role: "チェルノボーグ臨時拠点・夜間警戒"
            },
            h: -1,
            p: 1
          }
        ]),
        $terraData.K("武器は持たず、炊き出しの釜場だけを手伝う", {}, [
          1,
          "武装した班への誘いはきっぱり断り、大鍋の前で温かい粥をよそい続けた。見張り役の男が舌打ちして通り過ぎたが、器を受け取る母親たちの手は震えていた。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              title: "チェルノボーグのレユニオン支援隊",
              action: "role",
              role: "チェルノボーグ臨時拠点・非武装の生活支援"
            },
            groupStanding: {
              id: "infected-neighbours",
              title: "避難中の感染者と家族",
              delta: 1,
              reason: "炊き出し当番を続けた"
            },
            p: 1
          }
        ])
      ]
    },
    {
      id: "life_reunion_chernobog_base_daily",
      conf: "S",
      references: ["SRC_REUNION_CHERNOB_BASE", "SRC_SR_REUNION_SPLIT", "SRC_TL_CHERNOB_WINDOW"],
      st: ["青年", "壮年", "老年"],
      need: ["国:ウルサス", "都市:チェルノボーグ"],
      ge: { year: 1096 },
      le: { year: 1097 },
      months: [12, 1],
      cd: 2,
      w: 0.54,
      show: s =>
        !!s.world?.events?.chernobog_incident &&
        active(s, "reunion-1096") &&
        role(s, "reunion-1096").startsWith("チェルノボーグ臨時拠点・"),
      t: "臨時拠点の倉庫では、炊き出しを待つ列と脱出先を尋ねる人々の列が入り乱れていた。奥で残りの食料箱を数える者もいれば、昨夜の見張りから戻らない仲間を入り口で待ち続ける者もいる。今日も自分の持ち場を決めなければならなかった。",
      c: [
        $terraData.K("行き渡らなかった分を確かめ、動けない世帯へ直接届ける", {}, [
          1,
          "列に並べなかった年寄りや病人のいる部屋を回り、残っていた黒パンと包帯を分けて歩いた。空になった木箱には、次に何を優先して集めるかチョークで大きく書き残した。",
          {
            lifeSkill: {
              id: "reunion-camp-care",
              title: "移動野営地の物資配分",
              delta: 2,
              context: "配給不足を書き留め、近隣世帯へ残りを届けた"
            },
            groupStanding: {
              id: "infected-neighbours",
              title: "避難中の感染者と家族",
              delta: 1,
              reason: "不足を記録し、近隣へ物資を届けた"
            },
            p: 1
          }
        ]),
        $terraData.K("塞がれた通りを避け、避難する一団の最後尾まで付き添う", {}, [
          1,
          "瓦礫で塞がれた表通りを避けて裏路地を案内し、足の遅い家族が区画を抜けるまでしんがりを歩いた。途中で別行動をとった人たちの顔ぶれも、戻ってから仲間に伝えた。",
          { rl: 1, h: -1 }
        ]),
        $terraData.K("武装した仲間の見回りに同行し、危うくなれば引き返させる", {}, [
          1,
          "気の立つ仲間たちの後ろについて通りを見回り、住民との小競り合いが始まりそうになると割って入って倉庫へ引き返させた。戻る頃には背中まで冷たい汗がにじんでいた。",
          { h: -2, p: -1 }
        ]),
        $terraData.K("今日は持ち場を外れ、倉庫の隅で泥のように眠る", {}, [
          1,
          "鉛のように重い身体を引きずり、積まれた麻袋の陰で毛布にくるまった。目を覚ましたときには、騒がしかった配給の列もすっかり途絶えていた。",
          { h: 2, p: 1 }
        ])
      ]
    },
    {
      id: "life_reunion_chernobog_aftermath",
      conf: "S",
      references: ["SRC_TL_CHERNOB_WINDOW", "SRC_REUNION_HISTORY", "SRC_SR_REUNION_SPLIT"],
      st: ["青年", "壮年", "老年"],
      need: ["1096年のレユニオン地域網"],
      ge: { year: 1097, age: 18 },
      le: { year: 1098 },
      once: true,
      w: 0.56,
      show: s => active(s, "reunion-1096") && (s.year > 1097 || s.mo >= 2),
      t: "チェルノボーグを離れたあと、同じ拠点にいた仲間は散り散りになった。頼りにしていた連絡網も途絶え、残された小さな一団には次に向かう先を決めるリーダーもいない。このまま避難者の護衛を続けるか、一度身を潜めるか、それとも完全に別れるか、岐路に立たされていた。",
      c: [
        $terraData.K("少人数の隊に残り、見張りと避難者の護衛を続ける", {}, [
          1,
          "顔なじみの仲間数人と行動をともにし、野宿の見張りと避難民の護衛を続けた。立ち寄る町ごとに昔の仲間の消息を尋ね歩いたが、はっきりした行方はなかなかつかめなかった。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              title: "事変後に散ったレユニオン残存隊",
              action: "role",
              role: "事変後の小隊・見張りと避難者護衛"
            },
            lifeGoal: {
              id: "protect-neighbours",
              action: "continue",
              note: "大きな指揮系統を失った後も、近くの人を守る隊に残った"
            },
            h: -2,
            p: 1
          }
        ]),
        $terraData.K("しばらく身を潜め、信頼できる仲間の連絡だけを待つ", {}, [
          1,
          "表立った活動からは手を引き、気心の知れた仲間にだけ今の居場所を伝えておいた。あの倉庫にいた連中が今も無事なのか、どこをさまよっているのかは分からないままだ。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              title: "事変後のレユニオン連絡待ち",
              action: "suspend",
              role: "活動休止・個人連絡のみ",
              note: "再編後の連絡先や方針は定まっていない"
            },
            lifeGoal: {
              id: "protect-neighbours",
              action: "pause",
              note: "活動を休み、消息を確かめる"
            },
            p: 1
          }
        ]),
        $terraData.K("隊を離れ、流れ着いた先で自分の暮らしを立て直す", {}, [
          1,
          "残った仲間に別れを告げ、ひとりで隊を離れた。逃げてきたばかりの土地で仕事も寝床も決まっておらず、かつての仲間とまた会える日があるのかも分からなかった。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              title: "レユニオン初期支援隊",
              action: "leave",
              note: "チェルノボーグ事変後に離脱"
            },
            lifeGoal: {
              id: "protect-neighbours",
              action: "abandon",
              note: "避難先で自分の生活を立て直す"
            },
            fl: { war_displaced: 1, reunion: 0 },
            p: -1
          }
        ])
      ]
    },
    {
      id: "life_reunion_survivor_reconnection",
      conf: "S",
      references: ["SRC_REUNION_HISTORY", "SRC_REUNION_REFORM", "SRC_SR_REUNION_SPLIT", "SRC_REUNION_GAME_MODEL"],
      st: ["青年", "壮年", "老年"],
      after: { id: "life_reunion_chernobog_aftermath", min: 1 },
      ge: { year: 1098, age: 18 },
      le: { year: 1101 },
      once: true,
      w: 0.48,
      show: s => !!s.inf && attachedAfterChernobog(s),
      t: "長く途絶えていた伝手をたどって、ナインたちが散り散りになった仲間を集め直しているという知らせが届いた。生まれ変わったレユニオンは、各地の感染者を支えながら新しい行き先を模索しているらしい。合流するか、今の場所にとどまるか、昔の仲間から返事を求められた。",
      c: [
        $terraData.K("新しい連絡網へ合流し、近隣への薬や食料の配達を担う", {}, [
          1,
          "昔の仲間を通じて新しい連絡網に加わり、近くの感染者世帯へ薬や食料を運ぶ役目を引き受けた。生き別れていた仲間にも、新しいつなぎ先をそっと伝えた。",
          {
            lifeAffiliations: [
              {
                id: "reunion-1096",
                action: "leave",
                note: "事変後、ナインがまとめる再編レユニオンの連絡網へ移った"
              },
              {
                id: "reunion-reorg",
                title: "再編後レユニオンに連なる互助連絡網",
                kind: "local-relief-network",
                action: "join",
                role: "近隣の物資配達",
                note: "本人が地域の支援連絡網へ参加。武装隊の任務は別途選択"
              }
            ],
            lifeGoal: {
              id: "reunion-relief",
              title: "身近な感染者へ薬と食料を届ける",
              priority: "互助",
              action: "start"
            },
            groupStanding: {
              id: "reunion-reorg-volunteers",
              title: "再編後の地域ボランティア",
              delta: 2,
              reason: "新しい連絡網で近隣への配達を引き受けた"
            },
            fl: { reunion: 1 },
            rl: 2,
            p: 1
          }
        ]),
        $terraData.K("合流はせず、今の小さな隊で避難者の護衛を続ける", {}, [
          1,
          "大きな合流話には乗らず、今そばにいる仲間たちと見張りの順番を組み直した。町を離れる感染者の一家が来れば、街道が分かれるところまで静かに付き添った。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              action: "continue",
              role: "事変後の小隊・見張りと避難者護衛"
            },
            lifeGoal: {
              id: "protect-neighbours",
              action: "continue",
              note: "小隊に残り、身近な避難者の護衛を続けた"
            },
            h: -1,
            p: 1
          }
        ]),
        $terraData.K("この機会に隊を離れ、ひとりの生活へ戻る", {}, [
          1,
          "再編の知らせを潮時に、仲間へ別れを告げて町で仕事と部屋を探した。それでも時折、チェルノボーグの倉庫で顔を合わせた家族のことが頭をよぎった。",
          {
            lifeAffiliation: {
              id: "reunion-1096",
              action: "leave",
              note: "チェルノボーグ事変後、隊を離れて暮らしを立て直した"
            },
            lifeGoal: {
              id: "protect-neighbours",
              action: "abandon",
              note: "レユニオンの隊を離れた"
            },
            fl: { war_displaced: 1, reunion: 0 },
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_reunion_movement_join",
      conf: "S",
      references: ["SRC_REUNION_HISTORY", "SRC_REUNION_REFORM", "SRC_REUNION_BORDER_CAMP", "SRC_REUNION_GAME_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["1097年以後の再編レユニオン互助網に連絡中"],
      ge: { year: 1101, age: 18 },
      once: true,
      w: 0.5,
      show: s => !!s.inf && active(s, "reunion-reorg"),
      t: "ウルサスとカジミエーシュの国境に近い辺境の村から、野営地の人手を募る知らせが届いた。チェルノボーグから逃れてきた者たちが荒れ地を耕し、薬を分け合って暮らしているという。野営地へ赴いて当番を担うか、今の町から中継を手伝うか考えた。",
      c: [
        $terraData.K("国境の野営地へ移り、食料と薬の配給を受け持つ", {}, [
          1,
          "荷物をまとめて国境の村へ移り、薬箱と食料庫の管理を引き受けた。誰の家に何が足りないかを聞き取り、遅れている荷があれば次の運び手へ伝言を託した。",
          {
            resTo: "ウルサス",
            home: "固定集落",
            localKind: "小規模な定住地",
            lifeAffiliation: {
              id: "reunion-reorg",
              title: "再編レユニオンの国境野営地",
              kind: "reorganized-infected-movement",
              action: "role",
              role: "国境野営地・食料と医薬品の配給",
              bindAt: "destination",
              rebindPosting: true,
              note: "本人が野営地の配給当番を選択"
            },
            lifeGoal: {
              id: "reunion-relief",
              title: "国境野営地で感染者の生活を支える",
              priority: "互助",
              action: "start"
            },
            groupStanding: {
              id: "reunion-reorg-volunteers",
              title: "再編レユニオンの野営地仲間",
              delta: 2,
              reason: "食料と医薬品の配給当番に加わった"
            },
            p: 1,
            rl: 1
          }
        ]),
        $terraData.K("国境の野営地へ移り、畑仕事と小屋の修繕に加わる", {}, [
          1,
          "国境の村へ移り住み、石ころだらけの畑を耕して隙間風の吹く寝小屋の板壁を打ち直した。仲間と一緒に収穫した麦の一部を来年の種籾に残し、厳しい冬への備えを進めた。",
          {
            resTo: "ウルサス",
            home: "固定集落",
            localKind: "小規模な定住地",
            lifeAffiliation: {
              id: "reunion-reorg",
              title: "再編レユニオンの国境野営地",
              kind: "reorganized-infected-movement",
              action: "role",
              role: "国境野営地・農作業と住居の手入れ",
              bindAt: "destination",
              rebindPosting: true,
              note: "本人が野営地の農作業と生活再建の当番を選択"
            },
            lifeGoal: {
              id: "reunion-relief",
              title: "国境野営地で感染者の生活を支える",
              priority: "互助",
              action: "start"
            },
            lifeSkill: {
              id: "reunion-camp-care",
              title: "野営地の農作業と生活再建",
              delta: 3,
              context: "共同の畑と寝床の修繕に加わった"
            },
            groupStanding: {
              id: "reunion-reorg-volunteers",
              title: "再編レユニオンの野営地仲間",
              delta: 2,
              reason: "畑と寝床の手入れを担った"
            },
            p: 1
          }
        ]),
        $terraData.K("今の町に暮らしを残し、荷の中継と連絡だけを手伝う", {}, [
          1,
          "住まいは今の町に残したまま、国境へ向かう荷の中継だけを引き受けた。馴染みの運び手に包みと伝言を託し、無事に届いた知らせが戻ると胸をなでおろした。",
          {
            lifeAffiliation: {
              id: "reunion-reorg",
              title: "再編レユニオンに連なる地域連絡網",
              action: "role",
              role: "遠隔連絡・臨時の物資便",
              note: "野営地には移らず、居住地から不定期の連絡を担当"
            },
            lifeGoal: {
              id: "reunion-relief",
              title: "今の地域から感染者への支援を続ける",
              priority: "地域",
              action: "continue"
            },
            p: 1
          }
        ]),
        $terraData.K("連絡網から手を引き、今の仕事と家族の暮らしを守る", {}, [
          1,
          "これ以上は関われないと仲間に伝え、連絡網から抜けた。国境の村へは向かわず、今の町で仕事と家族との穏やかな毎日を守ることにした。",
          {
            lifeAffiliation: {
              id: "reunion-reorg",
              title: "再編レユニオンに連なる地域連絡網",
              action: "leave",
              note: "移動野営地への加入を見送り、連絡網を離脱"
            },
            lifeGoal: { id: "reunion-relief", action: "abandon", note: "地域の連絡網を離れた" },
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_reunion_border_camp_daily",
      conf: "S",
      references: ["SRC_REUNION_BORDER_CAMP", "SRC_REUNION_HISTORY", "SRC_REUNION_GAME_MODEL"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.56,
      show: s =>
        s.year >= 1101 &&
        postAt(s, "reunion-reorg", "国境野営地・") &&
        !!s.inf,
      t: "国境の村では、刈り取り前の畑から来季の種麦をより分けていた。待ちわびていた抑制剤の木箱はどうにか届いたものの、天災トランスポーターも旅の商隊もこの辺境を避けて通るため、次の便がいつになるか見当もつかない。",
      c: [
        $terraData.K("畑の畝を整え、冬を越すための穀物を仕分ける", {}, [
          1,
          "冷たい土を掘り起こして畝を整え、収穫した麦を種籾と冬場の食料にきっちり分けた。その日の夕餉の鍋に回せたのは、ほんのひと握りの雑穀だけだった。",
          {
            lifeSkill: {
              id: "reunion-camp-care",
              title: "野営地の農作業と生活再建",
              delta: 3,
              context: "畑を手入れし、食料を種と備蓄に分けた"
            },
            groupStanding: {
              id: "reunion-reorg-volunteers",
              title: "再編レユニオンの野営地仲間",
              delta: 1,
              reason: "食料を分けて冬の備えをした"
            },
            p: 1
          }
        ]),
        $terraData.K("届いた抑制剤を数え、症状の重い人から優先して回す", {}, [
          1,
          "木箱の中の薬瓶を一つずつ確かめ、救護班と一緒に症状の重い順から手渡していった。今回行き渡らなかった人の名は、次の便が着き次第すぐ渡せるよう別に控えておいた。",
          {
            lifeSkill: {
              id: "reunion-camp-care",
              title: "野営地の物資配分",
              delta: 3,
              context: "抑制剤の受け取りと申告数を照合した"
            },
            groupStanding: {
              id: "infected-neighbours",
              title: "野営地で暮らす感染者と家族",
              delta: 1,
              reason: "薬の受け渡しを記録した"
            },
            k: 1,
            p: 1
          }
        ]),
        $terraData.K("見張り台に登り、雲行きと街道のぬかるみを確かめる", {}, [
          1,
          "風の強い見張り台から地平線の黒い雲と街道のぬかるみを見極め、リーダーへ報告した。荷車をいつ出すかは、村の年長者たちと相談して決めることになった。",
          { k: 1, h: -1 }
        ]),
        $terraData.K("今日は当番を代わってもらい、同じ小屋の仲間と温かい粥を食べる", {}, [
          1,
          "仲間に持ち場を頼み、小屋の囲炉裏を囲んで熱い粥をすすった。外ではまだ畑仕事や薬の仕分けが続いていたが、今日ばかりは泥のついた足を伸ばして休んだ。",
          { h: 2, p: 1 }
        ])
      ]
    },
    {
      id: "sr_reunion_border_refugees",
      conf: "S",
      references: ["SRC_REUNION_BORDER_CAMP", "SRC_REUNION_HISTORY", "SRC_REUNION_GAME_MODEL"],
      st: ["青年", "壮年", "老年"],
      ge: { year: 1101 },
      once: true,
      w: 0.36,
      show: s => postAt(s, "reunion-reorg", "国境野営地・"),
      t: "北方の鉱区から逃げてきたという感染者の一団が、村の入り口で立ち尽くしていると見張りから知らせが入った。誰も武器は持っておらず、足をひきずって仲間に肩を借りている者もいるという。彼らを迎え入れるため、急いで村外れへ向かった。",
      c: [
        $terraData.K("温かい水と乾いた毛布を運び、まず休める場所を作る", {}, [
          1,
          "白湯を配り、泥と雪で濡れた外套を焚火のそばに干せるよう縄を張った。ようやく人心地ついた人たちがぽつりぽつりと身の上を話し始めると、黙って火の周りに丸太の椅子を足した。",
          {
            groupStanding: {
              id: "reunion-reorg-volunteers",
              title: "再編レユニオンの野営地仲間",
              delta: 1,
              reason: "到着した避難者の休む場所を整えた"
            },
            regionalImpact: {
              entity: "北方から逃れた感染者の一団",
              kind: "refugee-welcome",
              description: "水と寝具を届け、話を聞くのは相手の休息後にした"
            },
            rl: 1,
            p: 1
          }
        ]),
        $terraData.K("必要な薬と怪我の具合を聞き取り、救護所へ案内する", {}, [
          1,
          "すぐに手当てが必要な者と手持ちの薬の残りを聞き取り、救護小屋へ連れて行った。戸口の前では、誰から先に診てもらうかで疲れた声が飛び交っていた。",
          { k: 1, rl: 1 }
        ]),
        $terraData.K("周囲の警戒を続け、事情を聞くのは一晩休ませてからにするよう進言する", {}, [
          1,
          "追っ手がないか村の入り口を見張りながら、詳しい話を聞くのは彼らが眠ってからにしようとリーダーに進言した。一団のなかには、警戒して外套の襟を固く握りしめたままの者もいた。",
          { h: -1, p: 1 }
        ])
      ]
    },
    {
      id: "sr_reunion_border_relocation",
      conf: "S",
      references: ["SRC_REUNION_BORDER_CAMP", "SRC_REUNION_HISTORY", "SRC_REUNION_GAME_MODEL"],
      st: ["青年", "壮年", "老年"],
      ge: { year: 1101 },
      once: true,
      w: 0.42,
      show: s => postAt(s, "reunion-reorg", "国境野営地・"),
      t: "国境の村を畳み、サンクト・グリファーブルクの方面へ向かう移動隊の支度が始まった。荷車を引いて旅立つ者もいれば、せっかく耕した畑と小屋を守るため村に残る者もいる。どちらの道で仲間を支えるか、決断のときが来ていた。",
      c: [
        $terraData.K("移動隊の列に加わり、道中の連絡と荷運びを担う", {}, [
          1,
          "移動隊に名を連ね、道中の伝令と物資の積み下ろしを引き受けた。出発の朝、村に残る人たちと固い握手を交わし、薬の届け先や連絡の目印を何度も確かめ合った。",
          {
            lifeAffiliation: {
              id: "reunion-reorg",
              title: "再編レユニオンの移動隊",
              action: "role",
              role: "移動隊・サンクト・グリファーブルクへの連絡と補給",
              note: "野営地から移動する本人の選択を記録"
            },
            lifeGoal: {
              id: "reunion-relief",
              action: "continue",
              note: "移動隊の連絡と物資の仕事へ役割を移した"
            },
            h: -1,
            p: 1
          }
        ]),
        $terraData.K("村に残って畑と薬の受け渡しを守り、中継地を保つ", {}, [
          1,
          "旅立つ仲間の背中を見送り、村に残って麦の取り入れと薬の受け渡しを続けた。移動隊の全員が今どこにいるかは分からないが、時折届く無事を知らせる便りを集会所の壁に貼り出した。",
          {
            lifeAffiliation: {
              id: "reunion-reorg",
              title: "再編レユニオンの国境野営地",
              action: "role",
              role: "国境野営地・農作業と医薬品の受け渡し",
              note: "移動隊には加わらず、集落に残る選択"
            },
            lifeGoal: { id: "reunion-relief", action: "continue" },
            p: 1
          }
        ]),
        $terraData.K("レユニオンから離れ、村の外で自分の暮らしを立て直す", {}, [
          1,
          "受け持っていた仕事を仲間に引き継ぎ、この機会にレユニオンを離れた。国境の村を背に歩き出し、これからどこで働き、どこに根を下ろすかをひとりで考えた。",
          {
            lifeAffiliation: {
              id: "reunion-reorg",
              title: "再編レユニオンの国境野営地",
              action: "leave",
              note: "移動にも残留にも加わらず、野営地を離れた"
            },
            lifeGoal: { id: "reunion-relief", action: "abandon", note: "野営地での役割を終えた" },
          fl: { war_displaced: 1, reunion: 0 },
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_reunion_moving_column_daily",
      conf: "S",
      references: ["SRC_REUNION_BORDER_CAMP", "SRC_REUNION_HISTORY", "SRC_REUNION_GAME_MODEL"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.36,
      show: s => postAt(s, "reunion-reorg", "移動隊・サンクト・グリファーブルクへの"),
      t: "荒涼とした大地を進む移動隊は、次の水場と風を避けられる野営地を探していた。地平線の彼方には不気味な天災雲が垂れ込め、ぬかるみに足を取られた荷車の列が遅れはじめるなか、先頭の見張りが前方の崖崩れを知らせてきた。",
      c: [
        $terraData.K("積み荷の残りを改め、先回りする連絡員に伝言を託す", {}, [
          1,
          "揺れる荷台の上で木箱の数を確かめ、次の合流地点で待つ仲間へ遅れの伝言を走らせた。水場でひと息つく間もなく、再び重い車輪が動き出した。",
          { k: 1, p: 1 }
        ]),
        $terraData.K("足の止まりかけた仲間に歩調を合わせ、風よけのある窪地を探す", {}, [
          1,
          "列の最後尾で息を切らす仲間に肩を貸し、岩陰の風よけを見つけて小休止を申し出た。地面に腰を下ろした人たちに、残り少ない水筒を順番に回した。",
          { h: 1, rl: 1 }
        ]),
        $terraData.K("高台に登って崩れた道と雲行きを見極め、迂回路を探す", {}, [
          1,
          "岩場を登って崖崩れの規模と黒雲の流れる向きを確かめ、リーダーのもとへ走った。見張りと荷車引きの意見を合わせ、遠回りでも足場の固い尾根道へ進路を変えた。",
          { k: 1, h: -1 }
        ])
      ]
    },
    {
      id: "sr_reunion_departure_legacy",
      conf: "S",
      references: ["SRC_REUNION_HISTORY", "SRC_REUNION_REFORM", "SRC_REUNION_GAME_MODEL"],
      st: ["青年", "壮年", "老年"],
      ge: { year: 1099, age: 18 },
      cd: 4,
      w: 0.22,
      show: s =>
        ["reunion-1096", "reunion-reorg"].some(id => {
          const record = affiliation(s, id);
          return (
            record?.status === "left" &&
            Number.isInteger(record.endedYear) &&
            record.endedYear <= s.year - 2 &&
            (record.episodes?.some(episode =>
              /^(初期移動野営地・|チェルノボーグ臨時拠点・|事変後の小隊・|国境野営地・)/.test(
                episode.roleAtStart || ""
              )
            ) ||
              record.history?.some(entry =>
                /^(国境野営地・|移動隊・サンクト・グリファーブルクへの)/.test(entry.role || "")
              ))
          );
        }),
      t: "レユニオンの隊を離れてから数年が過ぎたある日、古い背嚢の底から木の配給札が転がり出た。裏側には、かつて薬を届けた一家が引っ越し先の番地を鉛筆で書き残している。あの頃に出会った人たちのことを、ふと誰かに伝えておきたくなった。",
      once: true,
      c: [
        $terraData.K("昔の仲間へ手紙を書き、今の暮らしと無事を知らせる", {}, [
          1,
          "今の仕事や暮らしぶりとともに、自分がいつ荷運びの列を離れたかを便箋に綴った。返事が来るかは分からないまま、木の配給札は机の引き出しにそっと戻した。",
          {
            regionalImpact: {
              entity: "レユニオンを離れた元配達員と旧知の仲間",
              kind: "former-member-letter",
              description: "元配達員が以前の仲間へ近況を送り、古い連絡先を手元に残した"
            },
            rl: 1,
            p: 1
          }
        ]),
        $terraData.K("札に書かれた番地を訪ね、薬を届けた一家のその後を聞く", {}, [
          1,
          "書き残された番地を訪ねてみると、出てきた家人は寒い夜に薬箱を受け取った日のことをはっきり覚えていた。今は別の若い運び手が薬を届けてくれていると聞き、温かい茶をごちそうになって帰った。",
          {
            groupStanding: {
              id: "infected-neighbours",
              title: "以前の配達先で暮らす感染者と家族",
              delta: 1,
              reason: "移転した家を訪ね、今の配達先を聞いた"
            },
            regionalImpact: {
              entity: "再編レユニオンの旧配達先",
              kind: "former-recipient-visit",
              description: "元配達員が移転先を訪ね、現在の配達を担う人を聞いた"
            },
            rl: 1,
            p: 1
          }
        ]),
        $terraData.K("札をそっとしまい込み、今の暮らしへ戻る", {}, [
          1,
          "誰にも手紙は出さず、擦り切れた木の札を小箱の奥へしまった。翌朝、いつもの仕事場へ向かう道すがら、廃倉庫で焚火を囲んだ遠い夜の匂いをふと思い出した。",
          { p: 1 }
        ])
      ]
    }
  );
});
