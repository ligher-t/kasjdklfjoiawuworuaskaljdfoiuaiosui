# EDU I07 プレイヤー向け変更文面全文（2026-11-04）

P13既存イベントの改修に伴う表示本文・選択文・結果文の完全なソース範囲を転記する。式の分岐と付随効果は判定に必要なため残す。P17新規80件の全文は [`data/education/p17-reviewed-prose.js`](../../data/education/p17-reviewed-prose.js) に保持し、6件の史料保留は非発火。ここに収録したものの公的制度・歴史の一般化は行わず、実際の学籍と本人の既知情報に従う。

## data/regional/leithanien.js

### `daily_leithanien_59`

~~~js
{
    id: "daily_leithanien_59", conf: "S", st: ["少年", "青年"], need: ["国:リターニア"],
    show: s => s.res?.n==="リターニア",
    t: s => educationLegacySceneGuard(s,"daily_leithanien_57") &&
      educationP17SchoolExperience(s,"music-competition") ?
      "学内コンクールの本選を聴講した。同世代の演奏家が技術を競い合い、講評を聞きながら自分の練習を振り返った。" :
      "公開された演奏会へ足を運んだ。舞台の上で音を重ねる同世代の演奏家を眺め、自分ももう一度楽器に触れてみたくなった。",
    fx: { p: 2, cr: 1 }
  }
~~~

### `choice_leithanien_03`

~~~js
{
      id: "choice_leithanien_03",
      conf: "S",
      references: ["SRC_TERRA_19REGIONS_LIFE_20261030"],
      st: ["青年", "壮年"],
      need: ["国:リターニア"],
      w: 0.85,
      cd: 7,
      t: "スラム出身の孤児の少年が、壊れかけのフルートで驚くべき天賦の才を見せていた。音楽を教わる先を探しているが、教材や身の回りの品を買う金もない。",
      c: [
        K("必要な教材と身支度の費用を渡す", { intent: "voluntary-aid", en: { affordableCash: 40000 }, why: "支援に回す金銭がない。" },
          [1, "少年に教材と身支度の費用を手渡した。教わる場所が見つかるかはまだ分からないが、少年は楽器を胸に抱え、何度も頭を下げた。", { cash: -40000, pm: 1, p: 8, rl: 5, cr: 3 }]),
        K("慈善団体や音楽家仲間に呼びかけ、共同の募金活動を主導する", { intent: "mediate", en: { ge: { rl: 15 } }, why: "人脈や説得力がない。" },
          [1, "町の人々から教材代の寄付が少しずつ集まった。少年とともに受け入れてくれる教え手を探し、募金の使い道を記録した。", { p: 5, rl: 4 }]),
        K("自分の生活を守るため、温かい励ましの言葉だけで見送る", { intent: "self-or-family-care" },
          [1, "ポケットの少額の小銭だけを少年に握らせた。世の不条理にやるせない思いを抱いた。", { cash: -2000, p: -1 }])
      ]
    }
~~~

## data/regional/kazdel.js

### `choice_kazdel_05`

~~~js
{
      id: "choice_kazdel_05",
      conf: "S",
      references: ["SRC_TERRA_19REGIONS_LIFE_20261030"],
      st: ["青年", "壮年", "老年"],
      need: ["国:カズデル"],
      w: 0.85,
      cd: 7,
      t: "戦災で親を失った多くの子供たちが、勉強する場もなく荒野で遊んでいる。大きな天幕を教室に仕立て、子供たちに読み書きや計算を教えるその場でできる読み書きの手伝いを始めようと、近所の人たちが声を掛け合った。",
      c: [
        K("手作りの黒板と木片のチョークを用意し、子供たちに熱心に文字と計算を教える", { intent: "voluntary-aid", en: { ge: { k: 20 } }, why: "初等教育を教える教養がない。" },
          [0.9, "数人の子に文字を教え、名前を一文字ずつ書き直すのを見守った。授業を続けられるかは、これから教え手や場所を確かめる必要がある。", { cr: 8, p: 8 }],
          [1, "子どもたちに何度も同じ字を教えて声を枯らした。今日の授業は終えたが、継続して教える人はまだ決まっていない。", { h: -3, cr: 4, p: 4 }]),
        K("各地の隊商や支援者から、古本やノート、鉛筆などの文具の寄付を募り集める", { intent: "procedure", en: { ge: { cr: 25 } }, why: "物資調達を呼びかける信用がない。" },
          [0.85, "寄付された文具を数え、必要な子どもに行き渡るよう整理した。足りない分は今後も集めることになった。", { cr: 6, p: 6 }],
          [1, "集まった文具はわずかだったが、大切に分け合って使わせた。", { cr: 3, p: 2 }]),
        K("天幕の防風補強や薪ストーブの設置など、教室の環境整備に専念する", { intent: "service" },
          [1, "天幕の裾を補強し、風の入り込む隙間を塞いだ。授業を行える日に備えて、火の元と避難路も確かめた。", { cr: 4, p: 3 }])
      ]
    }
~~~

## data/regional/bolivar.js

### `choice_bolivar_07`

~~~js
{
      id: "choice_bolivar_07",
      conf: "S",
      references: ["SRC_TERRA_19REGIONS_LIFE_20261030"],
      st: ["青年", "壮年", "老年"],
      need: ["国:ボリバル"],
      show: s => Object.values(s.world?.educationWorld?.campuses||{}).some(c=>{
        if(c.educationAreaId!==s.local?.educationAreaId)return false;
        const inst=s.world.educationWorld.institutions[c.institutionId];
        return inst?.offeringIds?.some(id=>
          educationSchoolStatusAt(s,id,s.year,s.mo)?.campusStatus==="destroyed");
      }),
      w: 0.8,
      cd: 9,
      t: "過去の戦闘で屋根が吹き飛び、放置されていた村の小学校の校舎を再建する運動が始まった。「子供たちに銃ではなくペンを持たせたい」という村人たちの願いが込められている。",
      c: [
        K("建築資材を調達し、屋根のトタンを張り直して黒板と机を修復する", { intent: "service", en: { ge: { h: 30 } }, why: "大工仕事と高所作業を行う体力がない。" },
          [0.85, "教室の屋根の一部を張り直し、机と黒板を使える場所へ運んだ。学校の開校日や教員の確保は、今後の運営者の判断を待つことになった。", { cr: 10, p: 8, h: 2 }],
          [1, "釘で指を怪我したが、壊れた屋根の補修を少し進めた。授業を再開できるかは、別に確かめなければならない。", { h: -5, cr: 5, p: 3 }]),
        K("各地の慈善団体に手紙を書き、教科書や筆記用具の寄付を取り付ける", { intent: "procedure", en: { ge: { k: 25 } }, why: "支援を募る文章力がない。" },
          [0.85, "寄付された本と文具を仕分け、乾いた部屋に置いた。図書室として使えるようになるかは、校舎の復旧を待つ必要がある。", { cr: 8, p: 6 }],
          [1, "集まった本は少なかったが、大切に子供たちへ届けた。", { cr: 4, p: 2 }]),
        K("校庭の瓦礫や草を刈り払い、安全に遊べるグラウンドを整備する", { intent: "voluntary-aid" },
          [1, "校庭の瓦礫を片付け、子どもたちが通る場所から危険な物を除いた。授業の再開についてはまだ知らせがない。", { cr: 5, p: 4 }])
      ]
    }
~~~

## data/parts/extensions/social-and-care/local-support-referrals.js

### `life_chernobog_neighbourhood_reopening`

~~~js
{
    id: "life_chernobog_neighbourhood_reopening",
    conf: "S",
    references: ["SRC_TL_MIDDLE", "SRC_URSUS_CHILDREN", "SRC_CHERNOB_AFTERSHOCK_MODEL"],
    st: ["児童", "少年", "青年", "壮年", "老年"],
    need: ["国:ウルサス", "都市:チェルノボーグ"],
    show: s => !!s.world?.events?.chernobog_incident &&
      (s.year>1097 || (s.year===1097 && s.mo>=2)) &&
      Object.values(s.world?.educationWorld?.offerings||{}).some(o=>{
        if(o.stage!=="lower" ||
          s.world.educationWorld.campuses[o.campusId]?.educationAreaId !==
          s.local?.educationAreaId)return false;
        const before=educationSchoolStatusAt(s,o.id,1096,12),
          now=educationSchoolStatusAt(s,o.id,s.year,s.mo??0);
        return !!before && !!now && before.teachingEquivalent===0 &&
          now.teachingEquivalent>0;
      }),
    ge: { year: 1097, age: 6 },
    le: { year: 1098 },
    once: true,
    w: 0.3,
    t: "傷跡の残る中学校の門に、再開した課程の案内が貼り出されていた。近所の大人たちが使える机を運び込んでいたが、割れた窓は板で打ち付けられたままだった。",
    c: [
      $terraData.K("手を貸して、教室まで机を一つ運び込む", {}, [
        1,
        "埃をかぶった机を抱えて階段を上り、教室の列に並べた。ぎしりと鳴る床板の上で、主のいない席が静かに並んでいた。",
        {
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグ近隣の学び舎",
            kind: "one-time-neighborhood-repair",
            description: "授業再開前、教室へ机を一つ運び込むのを手伝った"
          },
          rl: 1,
          p: 1
        }
      ]),
      $terraData.K("学校が始まる日を控え、まだ知らせが届いていない子の家へ教えに行く", {}, [
        1,
        "再開の日取りを確かめ、家に閉じこもりがちだった近所の生徒の戸口まで走って知らせた。",
        { k: 1, rl: 1 }
      ]),
      $terraData.K("貼り紙を一瞥しただけで足を止めず、自分の家の片付けに戻る", {}, [
        1,
        "板張りの窓を見上げただけで通り過ぎ、家の修繕と今日食べる物の算段に戻った。",
        { p: 1 }
      ])
    ]
  }
~~~

### `life_ursus_school_aid`

~~~js
{
    id: "life_ursus_school_aid",
    conf: "S",
    references: ["SRC_TL_MIDDLE", "SRC_URSUS_CHILDREN", "SRC_OFFICIAL_URSUS_CHILDREN"],
    st: ["少年"],
    need: ["国:ウルサス", "都市:チェルノボーグ"],
    ge: { year: 1096, age: 12 },
    le: { year: 1097, age: 17 },
    months: [12, 1],
    show: s => !!s.world?.events?.chernobog_incident &&
      !!s.local?.educationAreaId,
    once: true,
    w: 0.4,
    t: s => {
      const student=educationMigrationCurrent(s),campus=student &&
        s.world?.educationWorld?.campuses?.[student.m.campusId];
      return student && student.enroll.startedYear<=1096 && campus &&
        campus.educationAreaId===s.local?.educationAreaId ?
        "混乱に包まれた教室で、逃げ場所を探す声と親きょうだいを呼ぶ声が飛び交った。何人かの同級生が「はぐれても連絡が取れるようにしよう」と声を張り上げ、手持ちの食料を分け合おうとしている。窓の外では、街を脱出する人々の列が雪煙の中を動いていた。" :
        "チェルノボーグの通りに避難する人々があふれた。学校の方角からも子どもたちが駆けてくる。何が教室で起きたかは分からないまま、近くの大人に逃げ道を尋ねるか考えた。";
    },
    c: [
      $terraData.K(
        "同級生たちの連絡係を引き受け、避難先と食料のありかを伝えて回る",
        { show: s => {
          const student=educationMigrationCurrent(s),campus=student &&
            s.world?.educationWorld?.campuses?.[student.m.campusId];
          return !!student && student.enroll.startedYear<=1096 &&
            campus?.educationAreaId===s.local?.educationAreaId;
        } },
        [
          0.7,
          "震える手で書き留めた仲間の家を駆け回り、炊き出しの場所と合流先を必死に伝えた。息を切らして次の路地へと走った。",
          {
            lifeAffiliation: {
              id: "ursus-school-aid",
              title: "チェルノボーグの同級生避難支援",
              kind: "school-peer-network",
              action: "join",
              role: "避難先の連絡係"
            },
            groupStanding: {
              id: "chernobog-students",
              title: "近隣の中学生",
              delta: 2,
              reason: "避難情報を伝えた"
            },
            regionalImpact: {
              region: "ウルサス",
              entity: "チェルノボーグの中学校周辺",
              kind: "student-relief",
              description: "同級生へ避難先と食料の情報を伝えた"
            },
            p: 1,
            rl: 1
          }
        ],
        [
          1,
          "何人かの家へ辿り着く前に通りが封鎖され、避難の群衆に押し流された。呼びかける声も届かないまま、街を出る列に呑み込まれた。",
          { p: -3, fl: { war_displaced: 1 } }
        ]
      ),
      $terraData.K("生き延びることを最優先し、避難の列に加わる", {}, [
        1,
        "遠くで呼び合う人々の声を聞きながら、避難民の波へ駆け込んだ。誰が無事に逃げ延びたのかも分からないまま街を離れた。",
        { fl: { war_displaced: 1 }, p: 1 }
      ]),
      $terraData.K("パニックにならず、近所の大人に安全な抜け道を聞いてから動く", {}, [
        1,
        "地理に詳しい近所の大人を捕まえて安全な避難路を聞き出し、荷物をしっかり抱えて列の後ろについた。",
        { p: 1 }
      ])
    ]
  }
~~~

### `life_ursus_school_aid_followup`

~~~js
{
    id: "life_ursus_school_aid_followup",
    conf: "S",
    references: ["SRC_TL_MIDDLE", "SRC_TERRA_LIFECOURSE"],
    st: ["少年", "青年", "壮年"],
    need: ["ウルサス学校の避難支援"],
    after: { id: "life_ursus_school_aid", min: 1 },
    ge: { year: 1097 },
    le: { year: 1098 },
    months: [12, 1],
    once: true,
    w: 0.28,
    t: s => {
      const year=s.sn?.life_ursus_school_aid,
        elapsed=Number.isInteger(year) && year<=s.year ? s.year-year : null;
      return (elapsed===null ? "あの冬、学校の教室でちりぢりになった日のことを思い返した。" :
        `学校からちりぢりに避難したあの日から${elapsed}年が過ぎた。`)+
        "手元に残った控えには当時の避難先が走り書きされているが、いくら待っても音沙汰のない同級生もいる。これからも消息を追い続けるか迷った。";
    },
    c: [
      $terraData.K("手がかりのある同級生に手紙を送り、他の仲間の消息も尋ねてみる", {}, [
        1,
        "避難先が分かっている一人に手紙を書き、無事でいるか、他の仲間の噂を聞いていないか尋ねた。いつの日か返事が届くことを祈りながら投函した。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "role",
            role: "同級生一人との便り・避難先の連絡"
          },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "消息の分からない同級生へ、無理のない範囲で連絡を保つ",
            priority: "旧友との縁",
            action: "start"
          },
          groupStanding: {
            id: "chernobog-students",
            title: "近隣の中学生",
            delta: 1,
            reason: "一人の同級生へ便りを出した"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグから離れた同級生の連絡",
            kind: "student-contact",
              description: "同級生へ便りを送り、連絡の再開を試みた"
          },
          p: 1,
          rl: 2
        }
      ]),
      $terraData.K("今後の連絡のため、書き留めた宛先を信頼できる大人に託す", {}, [
        1,
        "もし後から尋ねてくる人がいたら伝えてほしいと、近所の大人に宛先の控えを託した。自分は当面、日々の生活を整えることにした。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "leave",
            note: "家族の転居に合わせ、残った連絡先を近所の大人へ渡した"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグの同級生連絡先",
            kind: "student-handover",
            description: "家族の転居前、同級生の連絡先を近所の大人へ託した"
          },
          p: 1
        }
      ]),
      $terraData.K("返事のない宛先を見るのが辛く、捨てられないまま荷物の底へしまう", {}, [
        1,
        "届かない手紙を書き続ける気力が湧かず、それでも名前を消すことだけはできずに、しわくちゃの紙束を鞄の底へ深くしまい込んだ。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "role",
            role: "返事のない宛先を保管・連絡は休止"
          },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "消息の分からない同級生へ、無理のない範囲で連絡を保つ",
            priority: "旧友との縁",
            action: "pause",
            note: "家族の暮らしを優先し、返事のない宛先への連絡を休止"
          },
          p: -1
        }
      ])
    ]
  }
~~~

### `life_ursus_school_aid_adult_followup`

~~~js
{
    id: "life_ursus_school_aid_adult_followup",
    conf: "S",
    references: ["SRC_TL_MIDDLE", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年"],
    need: ["ウルサス学校の避難支援"],
    after: { id: "life_ursus_school_aid_followup", min: 3 },
    ge: { year: 1100, age: 18 },
    once: true,
    w: 0.2,
    t: "大人になって荷物を整理していた時、チェルノボーグの学校で書き留めた同級生たちの古い連絡先がひょっこり出てきた。あのまま行方が知れない仲間の名を指でなぞり、これからどうするか考えた。",
    c: [
      $terraData.K("生き延びた旧友へ再び筆を執り、年に一度だけでも便りを交わす", {}, [
        1,
        "以前の同級生の宛先へ久しぶりに手紙を書いた。返事が届くかは分からないが、年に一度でも近況を尋ねられるように住所を控え直した。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "role",
            role: "年一度の便りを続ける元同級生"
          },
          fl: { ursus_school_contact_ongoing: 1 },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "消息の分からない同級生へ、無理のない範囲で連絡を保つ",
            priority: "旧友との縁",
            action: "continue"
          },
          groupStanding: {
            id: "chernobog-students",
            title: "近隣の中学生",
            delta: 1,
            reason: "成人後も無理のない便りを続けた"
          },
          p: 1
        }
      ]),
      $terraData.K("離散家族を捜している地域の支援者に名簿を託し、自分の役目に区切りをつける", {}, [
        1,
        "これまで分かった消息とまだ行方知れずの名を整理して支援者に引き渡し、少年時代から背負い続けてきた連絡係の役目を静かに下ろした。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "leave",
            note: "成人後、確認済み/未確認の名簿を地域の支援者へ引継ぎ"
          },
          fl: { ursus_school_contact_ongoing: 0 },
          lifeGoal: {
            id: "ursus-classmate-contact",
            action: "complete",
            note: "確認できる範囲を記録し、後任へ渡した"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "避難した元同級生の連絡記録",
            kind: "adult-handover",
            description: "消息が判明した人と未確認の人を分けた名簿を地域支援者へ引き継いだ"
          },
          p: 1
        }
      ]),
      $terraData.K("もう過去は振り返らず、今の仕事と家族の暮らしに生きる", {}, [
        1,
        "色褪せた紙束をそっと閉じ、もう昔の消息を追うのはやめた。目の前の仕事と家族を守る日々の暮らしへと戻った。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "leave",
            note: "成人後、仕事と家族の生活を優先して連絡を終了"
          },
          fl: { ursus_school_contact_ongoing: 0 },
          lifeGoal: {
            id: "ursus-classmate-contact",
            action: "abandon",
            note: "続けられなくなり、便りの役目を終えた"
          },
          p: 0
        }
      ])
    ]
  }
~~~

## data/parts/extensions/education-and-later-life/relationships-events-01.js

### `family_sibling_birth`

~~~js
{
      id: "family_sibling_birth",
      conf: "S",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      st: ["幼児", "児童", "少年"],
      need: ["親存命", "きょうだいを増やせる"],
      cd: 3,
      w: 0.55,
      t: [
        {
          when: "家計逼迫",
          t: "親から、もうすぐ家に赤ん坊が生まれると聞かされた。嬉しい知らせのはずなのに、狭い部屋のどこに寝かせるか、食費やあなたの家の手伝いがどう増えるか、大人たちの深刻な話し声も聞こえてきた。"
        },
        {
          t: "もうすぐ家に赤ん坊が生まれると聞いた。親が小さな産着や寝床を整えているのを見ながら、自分が頼まれる家の手伝いもこれから増えるのだろうかと思った。"
        }
      ],
      c: [
        $terraData.K("おむつや布運びを手伝い、赤ん坊の名前を一緒に考える", {}, [
          1,
          "元気な産声が響き、家族みんなで名前を考えた。お湯や清潔な布を運んで手伝い、夜泣きの声に目を覚ます慌ただしい日々が始まった。",
          { sibBirth: 1, rl: 3, p: 2, fl: { sibling_born: 1, sibling_supported: 1 } }
        ]),
        $terraData.K("自分の日課をこれまで通り続ける", {}, [
          1,
          "赤ん坊が生まれて家の中は急に賑やかになった。いつもの日課を続けようとしたが、夜中に泣き声で目が覚めることもあった。",
          { sibBirth: 1, p: 1, fl: { sibling_born: 1 } }
        ]),
        $terraData.K("口数が増えることで家の暮らしが苦しくならないか心配する", {}, [
          1,
          "赤ん坊は可愛かったが、家の財布がさらに寂しくなる不安は消えなかった。水汲みや掃除をこなしながら、自分に必要な品を買ってよいかためらった。",
          { sibBirth: 1, cash: -2e4, p: -2, rl: -1, fl: { sibling_born: 1 } }
        ])
      ]
    }
~~~

## data/parts/extensions/education-and-later-life/elder-life.js

### `elder_daily_grandchild_letter`

~~~js
{
        id: "elder_daily_grandchild_letter",
        conf: "S",
        references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
        st: ["老年"],
        ge: { age: 55 },
        cd: 3,
        w: 0.45,
        show: s => (s.ch?.length || 0) > 0,
        t: "子や孫から近況を知らせる便りが届いた。日々の遊びや家の出来事を綴った文字を、眼鏡を掛け直して何度も嬉しそうに読み返した。",
        fx: { p: 2, rl: 1 }
      }
~~~

### `elder_choice_grandchild_gift`

~~~js
{
        id: "elder_choice_grandchild_gift",
        conf: "S",
        references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
        st: ["老年"],
        ge: { age: 54 },
        cd: 4,
        w: 0.4,
        show: s => (s.ch?.length || 0) > 0,
        t: "孫の成長に合わせ、読み書きに使える品やお祝いの小遣いを贈りたいと思った。学校へ通えるかどうかは、本人たちの暮らしと受入先の事情を確かめてからの話だ。",
        c: [
          $terraData.K(
            "奮発してお祝いの小遣いを持たせる（費用 30,000）",
            { en: { ge: { cash: 30000 } }, why: "手元の現金が足りない" },
            [
              1,
              "封筒に小遣いを包んで孫の手の中に握らせた。目を丸くして大喜びする孫と、恐縮しながら頭を下げる子供の姿に顔が綻んだ。",
              { cash: -30000, p: 4, rl: 3 }
            ]
          ),
          $terraData.K(
            "昔自分が大切に使っていた頑丈な万年筆を譲る",
            {},
            [
              1,
              "引き出しの奥から手入れの行き届いた古い万年筆を取り出し、孫に手渡した。祖父母の歴史を受け継いだ孫は、誇らしげに胸ポケットに差し込んだ。",
              { p: 3, rl: 3, k: 1 }
            ]
          )
        ]
      }
~~~
