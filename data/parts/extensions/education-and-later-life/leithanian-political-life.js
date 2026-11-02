// extensions/education-and-later-life/leithanian-political-life: construction fragment; evaluation order is declared by data/extensions/education-and-later-life.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/education-and-later-life",
  "extensions/education-and-later-life/leithanian-political-life"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  const affiliationId = "leithanian-district-petition",
    goalId = "leithanian-district-petition",
    affiliation = s => s.lifeRecord?.affiliations?.find(row => row.id === affiliationId),
    isActive = s => affiliation(s)?.status === "active",
    isActiveHere = s => isActive(s) && $rules.affiliations.atRecordedLocality(s, affiliationId),
    isAway = s => $rules.affiliations.awayFromRecordedLocality(s, affiliationId),
    isSuspended = s => affiliation(s)?.status === "suspended",
    hasLeft = s => affiliation(s)?.status === "left";

  $terraData.EV.push(
    {
      id: "life_leithanian_civic_entry",
      conf: "B",
      references: ["SRC_LEITHANIEN_HISTORY", "SRC_LEITHANIEN_ZT10_STORY", "SRC_LEITHANIEN_LOCAL_POLITICAL_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      ge: { year: 1078, age: 18 },
      show: s => !!s.world?.events?.leith_revolution,
      once: true,
      w: 0.24,
      t: "川にかかる橋の踏み板が抜けてから、荷車は毎日ぐるりと遠回りを強いられていた。街角の集会所では、住民たちの声を集めて領主側の役人へ修繕を掛け合おうという話が持ち上がっている。仕事帰りに通りかかると、次の集まりの案内が目に入った。",
      c: [
        $terraData.K("近所の職人たちから困っている話を聞き集め、陳情の文面を整える", {}, [
          1,
          "工房の仲間たちから、荷運びでどれだけ難儀しているか具体的な話を聞いて回った。皆の声を文面にまとめ、次の集まりにも顔を出すと約束した。",
          {
            lifeAffiliation: {
              id: affiliationId,
              title: "リターニアの地区要望書づくり",
              kind: "community",
              action: "join",
              bindToLocality: true,
              role: "地区の話を聞き、要望書の写しを取る"
            },
            lifeGoal: {
              id: goalId,
              title: "地区の要望を自分の言葉で届ける",
              priority: "地域の暮らしと仕事",
              action: "start",
              note: "近所の声を聞き集めて陳情の文面を整える"
            },
            lifeSkill: {
              id: "leith-civic-records",
              title: "地区の要望を聞き取り、記録する",
              delta: 1,
              context: "職人たちから苦労話を聞き集め、陳情の文面にまとめた"
            },
            p: 1
          }
        ]),
        $terraData.K("集まりに顔を出し、遠回りでどれだけ仕事に障るか自分の口で話す", {}, [
          1,
          "集まった住民たちの前で、荷車の遠回りで毎日どれだけ時間を食われているか打ち明けた。帰り道、暗い川べりでやはり橋を避けて回る荷車の轍が目についた。",
          {
            lifeAffiliation: {
              id: affiliationId,
              title: "リターニアの地区要望書づくり",
              kind: "community",
              action: "join",
              bindToLocality: true,
              role: "地区会合で自分の暮らしへの影響を話す"
            },
            lifeGoal: {
              id: goalId,
              title: "地区の要望を自分の言葉で届ける",
              priority: "地域の暮らしと仕事",
              action: "start",
              note: "集まりで暮らしや仕事への支障を訴えた"
            },
            lifeSkill: {
              id: "leith-civic-speech",
              title: "地区会合で暮らしの事情を伝える",
              delta: 1,
              context: "荷車の遠回りが仕事に及ぼす影響を語った"
            },
            p: 1
          }
        ]),
        $terraData.K("集まりには関わらず、仕事を終えてまっすぐ帰る", {}, [
          1,
          "集会所の灯りを横目に、その夜はまっすぐ家へ帰った。無用な諍いを避けて体を休めたが、翌朝も橋には縄が張られたままで、荷車は重い音を立てて遠回りしていった。",
          { h: 1, p: -1 }
        ])
      ]
    },
    {
      id: "life_leithanian_civic_routine",
      conf: "B",
      references: ["SRC_LEITHANIEN_LOCAL_POLITICAL_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      after: { id: "life_leithanian_civic_entry", min: 1 },
      cd: 4,
      w: 0.38,
      show: isActiveHere,
      t: "街角の集まりに顔を出すようになってから、橋だけでなく石畳の陥没や街灯の故障まで様々な苦情が持ち込まれるようになった。今夜も仕事終わりに集会所へ集まる日だった。",
      c: [
        $terraData.K("自分の足で危ない箇所を見て回り、役人へ突きつける材料を揃える", {}, [
          1,
          "夕暮れの橋のたもとや坂道を歩き、荷車が立ち往生する箇所を確かめて回った。集まりでその様子を詳しく伝え、今夜の役目を終えた。",
          {
            lifeAffiliation: { id: affiliationId, action: "continue", onlyIfActive: true },
            lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "通りの危険な箇所を自分の足で確かめた" },
            lifeSkill: {
              id: "leith-civic-records",
              title: "地区の要望を聞き取り、記録する",
              delta: 1,
              context: "橋の前後を歩き、荷車が詰まる場所を確かめた"
            },
            p: 1
          }
        ]),
        $terraData.K("集まりで発言し、現場で働く者たちの生の声を届ける", {}, [
          1,
          "遠回りで配達が遅れ、荷主から小言を言われている実情を皆の前で話した。周りからも「うちも同じだ」と次々に声が上がった。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "role",
              onlyIfActive: true,
              role: "地区会合で暮らしへの影響を伝える"
            },
            lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "集まりで現場の苦労を伝えた" },
            lifeSkill: {
              id: "leith-civic-speech",
              title: "地区会合で暮らしの事情を伝える",
              delta: 1,
              context: "仕事へのしわ寄せを集まりで訴えた"
            },
            p: 1
          }
        ]),
        $terraData.K("今夜は集まりを休み、明日の仕事の段取りを優先する", {}, [
          1,
          "今夜は顔を出せないと仲間に伝言を頼み、明日の仕事道具の手入れをして早めに床についた。",
          {
            lifeAffiliation: { id: affiliationId, action: "continue", onlyIfActive: true },
            lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "無理をせず今夜の集まりは休んだ" },
            p: 0
          }
        ])
      ]
    },
    {
      id: "life_leithanian_civic_activity",
      conf: "B",
      references: ["SRC_LEITHANIEN_LOCAL_POLITICAL_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      after: { id: "life_leithanian_civic_entry", min: 2 },
      once: true,
      w: 0.25,
      show: isActiveHere,
      t: "役人へ陳情を出してから何度も集まりを重ねたが、橋の板は抜けたままで、冬場に凍りつく坂道の話まで重なってきた。なかなか動かない役人を相手にこのまま声を上げ続けるか、自分の仕事と暮らしに戻るか考えた。",
      c: [
        $terraData.K("根気よく声を上げ続けるため、次の集まりにも出る", {}, [
          1,
          "ここで引き下がれば忘れ去られるだけだと思い、次の集まりにも必ず顔を出すと仲間と頷き合った。",
          {
            lifeAffiliation: { id: affiliationId, action: "continue", onlyIfActive: true },
            lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "諦めず地域の陳情を続ける" },
            p: 1
          }
        ]),
        $terraData.K("文面をまとめる役は譲り、住民たちの相談に乗る役へ回る", {}, [
          1,
          "細かい文面づくりの役目は若い仲間に譲り、集まりでは新しく来た住民たちの困りごとに耳を傾ける役回りへ移った。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "role",
              onlyIfActive: true,
              role: "地区会合で要望を聞き、議題を整理する"
            },
            lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "住民の相談を聞く役回りへ移った" },
            lifeSkill: {
              id: "leith-civic-records",
              title: "地区の要望を聞き取り、記録する",
              delta: 1,
              context: "集まりで住民たちの様々な困りごとを聞き取った"
            },
            p: 1
          }
        ]),
        $terraData.K("仕事や家のことが立て込んできたため、しばらく集まりを休む", {}, [
          1,
          "しばらくは顔を出せないと仲間に詫び、溜まっていた仕事と家の用事を片づけることに専念した。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "suspend",
              onlyIfActive: true,
              note: "仕事と家の用事を優先して地区の集まりを休止"
            },
            lifeGoal: { id: goalId, action: "pause", onlyIfActive: true, note: "地区の集まりをいったん休止した" },
            p: 0
          }
        ]),
        $terraData.K("陳情の集まりから完全に手を引く", {}, [
          1,
          "これ以上は付き合えないと仲間に告げ、集まりから手を引いた。帰り道、荷車はやはり壊れた橋の手前で大きく迂回していった。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "leave",
              onlyIfActive: true,
              note: "地区の陳情活動から手を引いた"
            },
            lifeGoal: { id: goalId, action: "compromise", onlyIfActive: true, note: "地区の集まりから離れた" },
            p: -1
          }
        ])
      ]
    },
    {
      id: "life_leithanian_civic_relocation",
      conf: "B",
      references: ["SRC_LEITHANIEN_LOCAL_POLITICAL_MODEL"],
      st: ["青年", "壮年", "老年"],
      after: { id: "life_leithanian_civic_entry", min: 0 },
      cd: 3,
      w: 0.18,
      show: s => isActive(s) && isAway(s),
      t: "かつて橋や坂道の修繕を求めて仲間と駆け回った街を離れ、今は別の土地で暮らしている。もうあの集会所へ通うこともできない中、昔の仲間とのつながりをどうするか考えた。",
      c: [
        $terraData.K("預かっていたものを仲間に送り返し、正式に抜ける", {}, [
          1,
          "手元にあった陳情の束を昔の仲間へ送り返し、新しい街で元気にやっていると手紙を添えた。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "leave",
              note: "転居に伴い、元の地区の集まりから抜けた"
            },
            lifeGoal: { id: goalId, action: "compromise", note: "転居を機に地区活動の役目を終えた" },
            p: 0
          }
        ]),
        $terraData.K("いつかあの街へ戻る日まで、細く縁だけ残しておく", {}, [
          1,
          "新しい土地での暮らしに慣れるまで顔は出せないと手紙を出し、またあの街へ戻ることがあれば声をかけると書き添えた。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "suspend",
              note: "転居先での生活を優先し、元の地区の集まりを休止"
            },
            lifeGoal: { id: goalId, action: "pause", note: "転居後に地区活動を休止" },
            p: 0
          }
        ])
      ]
    },
    {
      id: "life_leithanian_civic_later_active",
      conf: "B",
      references: ["SRC_LEITHANIEN_ZT10_STORY", "SRC_LEITHANIEN_LOCAL_POLITICAL_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      after: { id: "life_leithanian_civic_activity", min: 5 },
      once: true,
      w: 0.15,
      show: isActiveHere,
      t: "街角の集まりに顔を出し始めてから、ずいぶん長い年月が過ぎた。顔ぶれも少しずつ入れ替わり、集会所の壁の貼り紙も幾度となく張り替えられた。これからも世話役を続けるか、そろそろ潮時とするか考えた。",
      c: [
        $terraData.K("これからも街の仲間たちと声を上げ続ける", {}, [
          1,
          "次の集まりにも出ると頷き、まだ手つかずのままになっている通りや水路の問題を仲間と確かめ合った。",
          {
            lifeAffiliation: { id: affiliationId, action: "continue", onlyIfActive: true },
            lifeGoal: { id: goalId, action: "continue", onlyIfActive: true, note: "長年変わらず地域の声を集め続けた" },
            p: 1
          }
        ]),
        $terraData.K("しばらく集まりへの顔出しを休む", {}, [
          1,
          "少し体を休めたいと仲間に伝え、しばらく集まりから遠ざかることにした。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "suspend",
              onlyIfActive: true,
              note: "長年の地区活動をいったん休止"
            },
            lifeGoal: { id: goalId, action: "pause", onlyIfActive: true, note: "地区の集まりを休止した" },
            p: 0
          }
        ]),
        $terraData.K("世話役を若い世代に譲り、集まりから退く", {}, [
          1,
          "自分の役目はここまでだと伝えて若い仲間に後を託した。帰り道、長年見慣れた川べりの道をゆっくりと歩いた。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "leave",
              onlyIfActive: true,
              note: "後進に譲り、地区の集まりから退いた"
            },
            lifeGoal: { id: goalId, action: "compromise", onlyIfActive: true, note: "地区活動に一区切りをつけた" },
            p: -1
          }
        ])
      ]
    },
    {
      id: "life_leithanian_civic_later_suspended",
      conf: "B",
      references: ["SRC_LEITHANIEN_LOCAL_POLITICAL_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      after: { id: "life_leithanian_civic_entry", min: 3 },
      cd: 3,
      w: 0.12,
      show: s => {
        const record = affiliation(s);
        return (
          record?.status === "suspended" &&
          $rules.affiliations.atRecordedLocality(s, affiliationId) &&
          s.year - (record.lastChangedYear ?? s.year) >= 3
        );
      },
      t: "街角の集まりから足が遠のいて数年が経った。かつて修繕を求めた橋のたもとを通りかかると、昔の仲間から「今度また集まるから顔を出さないか」と声をかけられた。",
      c: [
        $terraData.K("昔の仲間に誘われるまま、また集まりへ顔を出す", {}, [
          1,
          "久しぶりに次の集まりへ顔を出すと約束し、最近の街の様子を立ち話で聞いた。",
          {
            lifeAffiliation: { id: affiliationId, action: "return", role: "地区要望の聞き取りと記録" },
            lifeGoal: { id: goalId, action: "continue", note: "休んでいた地区の集まりへ戻った" },
            p: 1
          }
        ]),
        $terraData.K("今は忙しいと断り、しばらく距離を置いたままにする", {}, [
          1,
          "今は仕事や家のことで手いっぱいだと断り、軽く手を振って別れた。",
          {
            lifeAffiliation: { id: affiliationId, action: "review", note: "集まりとは距離を置いたまま暮らす" },
            lifeGoal: { id: goalId, action: "pause", note: "地区活動の休止を続けた" },
            p: 0
          }
        ]),
        $terraData.K("もう集まりには戻らないとはっきり伝える", {}, [
          1,
          "もう集まりには出られないと正直に伝え、これまでの礼を言って別れた。",
          {
            lifeAffiliation: {
              id: affiliationId,
              action: "leave",
              note: "休止していた地区活動から完全に離れた"
            },
            lifeGoal: { id: goalId, action: "compromise", note: "地区活動との関わりを終えた" },
            p: -1
          }
        ])
      ]
    },
    {
      id: "life_leithanian_civic_after_exit",
      conf: "B",
      references: ["SRC_LEITHANIEN_LOCAL_POLITICAL_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:リターニア"],
      after: { id: "life_leithanian_civic_activity", min: 10 },
      once: true,
      w: 0.08,
      show: s => hasLeft(s) &&
        Number.isInteger(affiliation(s)?.lastChangedYear) &&
        s.year - affiliation(s).lastChangedYear >= 10,
      t: "街の陳情の集まりから離れて、ずいぶん長い歳月が流れた。古い木箱の底を整理していると、あの頃仲間たちと頭を突き合わせて書いた橋の修繕嘆願の下書きが出てきた。乾いた紙は折り目からほろりと裂けた。",
      c: [
        $terraData.K("当時の仲間たちの顔を思い出しながら、懐かしい日々を振り返る", {}, [
          1,
          "仕事終わりに暗い集会所で熱い議論を交わした日々や、荷車でぬかるむ迂回路を押した記憶が、昨日のことのように胸に蘇った。",
          {
            lifeSkill: {
              id: "leith-civic-reflection",
              title: "地域活動の経験を記録する",
              delta: 1,
              context: "かつて地域の仲間と奔走した日々を振り返った"
            },
            p: 1
          }
        ]),
        $terraData.K("古い紙をそっと木箱に戻し、今の暮らしへ戻る", {}, [
          1,
          "色褪せた紙をそっと木箱の底へ戻して蓋を閉め、明日の仕事の支度に取りかかって生活の足元を固めた。",
          { p: 1, h: 1 }
        ])
      ]
    }
  );
});
