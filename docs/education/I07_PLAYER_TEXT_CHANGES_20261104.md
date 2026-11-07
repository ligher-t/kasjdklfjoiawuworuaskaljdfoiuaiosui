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

## data/extensions/family-and-community.js

### `life_ursus_school_aid_later`

~~~js
{
    id: "life_ursus_school_aid_later",
    conf: "S",
    references: ["SRC_TL_CHERNOB_WINDOW", "SRC_TERRA_FAMILY"],
    st: ["青年", "壮年"],
    need: ["ursus_school_contact_ongoing"],
    after: { id: "life_ursus_school_aid_adult_followup", min: 5 },
    ge: { year: 1105, age: 24 },
    once: true,
    w: 0.2,
    t: "チェルノボーグから離れた昔の同級生の宛先を、古い住所録の中に見つけた。あの日から便りを続けようとしてきたが、相手が今も同じ場所に暮らしているかは分からない。これからも年に一度の便りを続けるか、連絡網の世話役を誰かに引き継ぐか、考えた。",
    c: [
      $terraData.K("年に一度だけ近況を送り、返事は相手の気ままに任せる", {}, [
        1,
        "年に一度、季節の変わり目に短い手紙を出すことにした。忘れた頃に返事が届けば、それだけで無事を知ることができた。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "role",
            role: "年に一度の便りを続ける元同級生",
            note: "返事を急かさず、細く長い縁を保つ"
          },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "同級生と無理のない範囲で連絡を保つ",
            priority: "同級生との縁",
            action: "continue"
          },
          groupStanding: {
            id: "chernobog-students",
            title: "近隣の中学生",
            delta: 1,
            reason: "大人になってからも負担にならない便りを続けた"
          },
          p: 1
        }
      ]),
      $terraData.K("構わないと言ってくれた人の宛先だけ、次の世話役へ託す", {}, [
        1,
        "一人ずつ意思を確かめ、連絡先を残してもいいと言ってくれた同級生の分だけ次の世話役に託した。肩の荷がひとつ降りた気がした。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "leave",
            note: "了承を得た同級生の連絡先を次の世話役へ引き継いだ"
          },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "同級生と無理のない範囲で連絡を保つ",
            priority: "同級生との縁",
            action: "complete",
            note: "同級生の連絡網を次の世話役へ託した"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "チェルノボーグから避難した元同級生の連絡記録",
            kind: "later-handover",
            description:
              "連絡先を残すことに同意した元同級生たちの宛先を、次の世話役へ引き継いだ。"
          },
          p: 1
        }
      ]),
      $terraData.K("世話役を終え、それぞれの今の暮らしに戻る", {}, [
        1,
        "長く続けた連絡係に区切りをつけ、古い住所録を棚の奥へしまった。その夜はペンを取らず、静かに部屋の灯りを消した。",
        {
          lifeAffiliation: {
            id: "ursus-school-aid",
            title: "チェルノボーグの同級生避難支援",
            action: "leave",
            note: "長年の便りを終え、それぞれの暮らしへ戻った"
          },
          lifeGoal: {
            id: "ursus-classmate-contact",
            title: "同級生と無理のない範囲で連絡を保つ",
            priority: "同級生との縁",
            action: "abandon",
            note: "生活の変化を受け、連絡係の役目を終えた"
          },
          p: 0
        }
      ])
    ]
  }
~~~

## data/parts/extensions/education-and-later-life/ursus-student-life.js

### `life_ursus_student_assembly_later`

~~~js
{
    id: "life_ursus_student_assembly_later",
    conf: "S",
    references: ["SRC_URSUS_PAA_SYNOPSIS"],
    st: ["青年", "壮年"],
    need: ["ursus_student_assembly_active"],
    after: { id: "life_ursus_student_assembly_protest", min: 6 },
    ge: { year: 1107, age: 18 },
    once: true,
    w: 0.16,
    show: s => s.lifeRecord?.affiliations?.some(row =>
      row.id === "ursus-student-assembly" && ["active", "crisis"].includes(row.status)),
      t: "あの冬の事件から何年もが過ぎた。学びの場や仕事、住まいが以前とは変わった人も多い。ある日、当時学生連合で顔を合わせたひとりから短い手紙が届いた。今の仕事や家族との平穏な暮らしを思いながら、返事を書くか迷った。",
    c: [
      $terraData.K("今の暮らしに障らない範囲で、そのひとりとだけ細く連絡を保つ", {}, [
        1,
        "当時の仲間ひとりとだけ宛先を繋いでおくことにした。もう集会などに顔を出すことはないが、折に触れて無事を確かめ合うだけなら続けられそうだった。",
        {
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "role",
            role: "後年の限定的な連絡役"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "compromise",
            note: "現在の暮らしを優先しながら一人と連絡を保つ"
          },
          p: 1
        }
      ]),
      $terraData.K("知っている昔の仲間の宛先を世話役に託し、自分は手を引く", {}, [
        1,
        "今も連絡がつく仲間と、あれきり消息の知れない仲間の名前を整理して世話役に渡し、自分はこれで役目を降りた。",
        {
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "leave",
            note: "知っている連絡先を引き継いで役目を終えた"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "complete",
            note: "昔の仲間の連絡網を引き継ぎ、役割を終えた"
          },
          fl: { ursus_student_assembly_active: 0 },
          regionalImpact: {
            region: "ウルサス",
            entity: "学生連合の個人連絡帳",
            kind: "limited-handover",
            description: "手元にあった昔の仲間たちの連絡先を世話役へ引き継いだ",
            basis: "game-future-assumption"
          },
          p: 1
        }
      ]),
      $terraData.K("もう昔の集まりとは関わらないと伝え、今の生活へ戻る", {}, [
        1,
        "これからは連絡を取らないと短く書き送り、返事は待たなかった。今の仕事と家族の暮らしを何より守ることにした。",
        {
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "leave",
            note: "後年に本人の意思で連絡を終えた"
          },
          lifeGoal: { id: "ursus-student-assembly", action: "abandon", note: "後年に別の生活を選んだ" },
          fl: { ursus_student_assembly_active: 0 },
          p: 0
        }
      ])
    ]
  }
~~~

## data/parts/routes/regional-careers/entry-west.js

### `car_vic_royal_entry`

~~~js
{
      id: "car_vic_royal_entry",
      conf: "S",
      st: ["青年", "壮年"],
      cd: 3,
      w: 0.5,
      ge: { age: 20, year: 1092 },
      show: s => s.res?.n === "ヴィクトリア" && s.job === 0 && !s.fl?.retired && (s.cr || 0) >= 25 && s.sn?.car_vic_royal_choice_coup == null,
      t: "ヴィクトリアの公爵軍で士官候補の募集があると聞いた。推薦状や軍務経験を求める声もあり、採用の判断が誰に委ねられるのかも分からない。窓口へ出向き、必要な条件を確かめることにした。",
      c: [
        $terraData.K("推薦状と経歴を提出し、採用審査を受ける", { ethics: { reviewed: true, policyVersion: 87, intent: "organization-participation" } }, [
          0.35,
          "これまでの経験を確認され、軍務の仕事に採用された。配属先の規則と装備の扱いを教わり、新しい職場で働き始めた。",
          $terraData.regionalCareerStaff(
            "vic_royal",
            "victoria-royal-officer",
            "ヴィクトリア公爵軍",
            "公爵軍近衛少尉",
            "victoria-officer-career",
            "大公爵の派閥抗争の中で軍歴を重ね、権力を掴む",
            "royal-command",
            "貴族戦術学・軍団運用論",
            { cr: 4, k: 3, p: 2 }
          )
        ], [
          0.75,
          "採用の口利きには多額の金が必要だと告げられた。不透明な借入条件を受け入れ、軍務の職場へ入ったが、重い返済義務が残った。",
          $terraData.regionalCareerStaff(
            "vic_royal",
            "victoria-royal-officer",
            "ヴィクトリア公爵軍",
            "下級任官少尉（借金仕官）",
            "victoria-officer-career",
            "莫大な任官借金を抱えながら、公爵の顔色を窺う",
            "royal-command",
            "貴族戦術学・軍団運用論",
            { cr: 2, p: -2, debt: 2500000 }
          )
        ], [
          1,
          "提出した経歴を見た担当者に冷たく断られた。採用理由は説明されず、持ち帰った書類の角だけが折れていた。",
          { p: -5 }
        ]),
        $terraData.K("採用条件が合わないため、応募を見送る", { ethics: { reviewed: true, policyVersion: 87, intent: "withdrawal" } }, [
          1,
          "募集の条件を控えたうえで応募を見送り、ほかの働き口を探し始めた。",
          { p: 1 }
        ])
      ]
    }
~~~

## data/life/goals-and-family.js

### `people_school_life_conversation`

~~~js
{
      id: "people_school_life_conversation",
      conf: "S",
      references: $terraData.lifeRefs,
      st: ["少年", "青年", "壮年"],
      cd: 6,
      w: 0.42,
      show: s => !!educationLegacyTeacherContact(s,{known:true}),
      t: s => educationLegacySceneGuard(s,"education_school_classroom")
        ? "授業後の教室で、いつも教えてくれる先生がチョークの粉を払いながら机を並べていた。授業以外の話をしたことはまだない。"
        : "夕暮れの道で再会したかつての恩師と、懐かしさに足をとめて言葉を交わした。教わっていた頃を思い出しながら、今の暮らしについて立ち話をする。",
      c: [
        $terraData.K("最近の暮らしぶりや近況を尋ねてみる", {}, [
          1,
          "教壇の向こうでは見えなかった普段の暮らしの話を聞き、帰り道でもその言葉が温かく胸に残った。",
          { educationAction:"legacy:teacher-talk", rl: 1 }
        ]),
        $terraData.K("前に習ったことで気になっていた疑問を一つだけ尋ねる", {}, [
          1,
          "ずっと引っかかっていた問いを一つだけ尋ね、明快な答えに礼を言ってから別れた。",
          { k: 1 }
        ])
      ]
    }
~~~

### `people_school_housing_concern`

~~~js
{
      id: "people_school_housing_concern",
      conf: "S",
      references: $terraData.lifeRefs,
      st: ["少年", "青年", "壮年"],
      cd: 7,
      w: 0.36,
      show: s => !!educationLegacyTeacherContact(s,{known:true}),
      t: "顔なじみの教え手が教材箱の蓋を閉じた。次の授業の支度で忙しそうだ。片づけを手伝うか、次に扱う内容を尋ねるか考えた。",
      c: [
        $terraData.K("教材箱の運搬や黒板消しを手伝う", {}, [
          1,
          "少しでも早く帰れるよう、重い箱を一緒に棚へ運んだ。教え手は礼を言い、机の上の講義ノートを鞄へ収めた。",
          { educationAction:"legacy:teacher-concern", rl: 1 }
        ]),
        $terraData.K("次の授業でどこを扱うかだけ確かめておく", {}, [
          1,
          "次回の範囲を尋ねると、教え手は端に書き込みのある予定表を示しながら、要点を手短に教えてくれた。",
          { k: 1 }
        ])
      ]
    }
~~~

## data/base/life-and-health.js

### `ksc`

~~~js
{
      id: "ksc",
      conf: "S",
      st: ["青年", "壮年"],
      need: ["子あり"],
      after: { id: "chi", min: 6 },
      show: s => s.kids?.some(child =>
        Number.isFinite(child.by) && s.year-child.by>=6 &&
        s.year-child.by<=12),
      t: "子どもが学校へ通う年齢になった。どこで学べるのか、家では話題にするようになったが、受入先も通学の方法もまだ分かっていない。手元に用意できる学用品のことから考え始めた。",
      c: [
        $terraData.K("学校や学用品の費用を調べ、支度の相談をする", {}, [
          1,
          "授業を受けられる場所と、通うために必要な品を一つずつ書き出した。学校に入れるかどうかは、本人の希望と受入先の返事を確かめてから決めることにした。",
          { p: 2 }
        ]),
        $terraData.K("今は生活費を優先し、支度の相談を続ける", {}, [
          1,
          "家計の数字を見直し、今すぐ買う必要のない品を後回しにした。子どもの進路については、本人の考えを聞きながら調べ続けることにした。",
          { p: -1 }
        ])
      ]
    }
~~~

## data/base/family-and-livelihood.js

### `fam_unemploy`

~~~js
{
      id: "fam_unemploy",
      conf: "S",
      st: ["児童", "少年"],
      need: ["貧困", "家計を担う親あり"],
      ban: ["失業中の親"],
      w: 0.6,
      cd: 10,
      t: [
        { when: "家計逼迫", t: "大黒柱だった親が職を失った。ただでさえ苦しかった台所は火の車で、明日のパンや米をどうするかという声が部屋に響いた。" },
        { t: "親が働き口を失い、肩を落として帰ってきた。次の仕事が見つかるまでどうやって食い繋ぐか、家族で額を集めた。" }
      ],
      c: [
        $terraData.K(
          "自分も働きに出る",
          { show: s => s.age >= $rules.parameters.value("life.workStartAge") },
          [
            0.7,
            "学ぶ時間も削り、日雇いの荷運びに出た。泥だらけで持ち帰った小銭で食卓はつないだが、親の働き口はまだ見つからない。",
            { job: 1, educationAction: "leave-school", fl: { parent_unemployed: 1 }, cash: 5e4, p: -5, h: -5 }
          ],
          [
            1,
            "大人の嫌がる危険な現場しか口がなく、無理がたたって体を壊した。親の仕事も決まらず、食費と薬代のどちらを先に出すかで家が暗くなった。",
            { job: 1, educationAction: "leave-school", fl: { workplace_hazard: 1, parent_unemployed: 1 }, cash: 5e4, h: -15, p: -8 }
          ]
        ),
        $terraData.K(
          "勉学を続ける",
          { en: s => !!educationMigrationCurrent(s), why: "現在、実在する学校課程に在籍していない" },
          [
            0.5,
            "「お前は学校へ行け」と親が背中を押してくれた。すり減った靴で通学を続けたが、親は毎日仕事を探し回って疲れ切っていた。",
            { p: 3, rl: 5, fl: { parent_unemployed: 1 } }
          ],
          [
            1,
            "学費どころか日々の食事にも事欠くようになり、学校を辞めざるを得なくなった。親の新しい仕事もまだ見つからない。",
            { educationAction: "leave-school", fl: { parent_unemployed: 1 }, p: -10 }
          ]
        ),
        $terraData.K("家の仕事を手伝って支える", {}, [
          1,
          "水汲みや炊事、細かな繕い物を引き受け、親が仕事探しに回れるよう家を守った。まだ吉報は届かないが、食卓ではなるべく明るい声を出し合った。",
          { p: 2, rl: 8, h: -2, fl: { parent_unemployed: 1 } }
        ])
      ]
    }
~~~

### `race_identity`

~~~js
{
      id: "race_identity",
      conf: "S",
      references: ["SRC_TERRA_SOCIAL_ATTITUDES"],
      st: ["児童", "少年"],
      any: ["地域で少数派", "多種族の交流圏", "異種族の家族"],
      w: 0.7,
      cd: 10,
      t: [
        {
          when: (s,T) => ok({ need: ["地域で少数派", "就学中"] }, s, T) &&
            educationLegacySceneGuard(s,"education_school_classroom"),
          t: "教室で名簿を読み上げた先生が、あなたの種族の欄でつっかえて何度も言い直した。後ろの席からくすくす笑う声が聞こえ、帰り道、家の人に打ち明けるか迷った。"
        },
        {
          when: "地域で少数派",
          t: "近所の集まりで名前を聞かれたとき、あなたの種族を知った大人が珍しそうに何度も聞き返し、そばの子どもが笑った。家の人に話すべきか迷いながら帰った。"
        },
        {
          when: "異種族の家族",
          t: "親戚が集まった席で、角や尾、耳の形が周りと言葉通り違うことをからかわれた。愛想笑いを返したあとも、家族の中で自分だけ姿が違うことが胸に引っかかった。"
        },
        {
          when: "多種族の交流圏",
          t: "市場の手伝いに集まる子どもたちは、種族も生まれ故郷もばらばらだ。荷運びの合間に互いの角や耳、家の習慣を比べ合ううち、自分自身のルーツについても考えさせられた。"
        },
        {
          t: "同じ種族ばかりの土地で育ち、自分の姿を特別だと思ったことは一度もなかった。よその土地から来た子に珍しそうにじろじろ見られ、初めて自分の輪郭を意識した。"
        }
      ],
      c: [
        $terraData.K("信頼できる大人に打ち明ける", {}, [
          1,
          "その人は手を止め、あなたの家族や故郷の話をゆっくり聞いてくれた。すっきりした答えは出なかったが、胸のつかえを言葉にできただけで少し息がしやすくなった。",
          { p: 3, rl: 3 }
        ]),
        $terraData.K("誰にも言わず、自分の中で考える", {}, [
          1,
          "水たまりや鏡に映る自分の顔をじっと見つめ、昼間の言葉と重ね合わせてみた。何がそんなに特別なのか、まだうまく言葉にできなかった。",
          { k: 1, p: 1 }
        ])
      ]
    }
~~~

## data/regional/victoria.js

### `daily_victoria_59`

~~~js
{
    id: "daily_victoria_59", conf: "S", st: ["少年", "青年"], need: ["国:ヴィクトリア"],
    t: "運河沿いの土手を歩いていると、学生たちがボートを漕ぎ進める練習風景に出会った。掛け声に合わせてオールが一斉に水を掻き、夕暮れの水面を滑っていく姿に清々しさを感じた。",
    fx: { p: 2 }
  }
~~~

## data/social/learning.js

### `v77_child_informal_study`

~~~js
{
      id: "v77_child_informal_study",
      conf: "S",
      references: ["SRC_V77_SOCIAL_MODEL", "SRC_V77_FROSTLEAF"],
      st: ["児童", "少年"],
      ge: { age: 9 },
      le: { age: 17 },
      cd: 5,
      w: 0.8,
      show: s => !s.fl?.sch,
      t: "家に届いた書き付けや店の帳面の字が読めず、周りの大人に読み上げてもらうしかなかった。学校という場所には、もうしばらく通っていない。",
      c: [
        $terraData.K(
          "近所の読み書き教室へ顔を出す",
          {
            en: (s,T) => ok({ge:{socialAccess:52,cash:25000}},s,T) &&
              Object.values(s.world?.educationWorld?.informalProviders||{}).some(p=>
                p.kind==="neighborhood-literacy" && p.status==="active" &&
                p.areaId===s.local?.educationAreaId && p.evidenceRef &&
                p.subjectIds?.includes("basic_literacy") &&
                s.year*12+s.mo>=p.activeFrom.year*12+(p.activeFrom.month||0) &&
                (!p.activeTo || s.year*12+s.mo<=p.activeTo.year*12+(p.activeTo.month??12))),
            why: "実在する教室・通学できる講師・月謝の条件が揃っていない。"
          },
          [
            1,
            "顔なじみの年長者に文字の拾い方を教わり、帰り道、店先にぶら下がった値札を自分の声で読み上げてみた。",
            { k: 3, literacyGain: 8, cash: -25000, rl: 2 }
          ]
        ),
        $terraData.K("通りの看板や包み紙の字を見様見真似で写す", {}, [
          1,
          "道端の看板や荷物の包み紙にある文字を、切れ端に何度も書き写した。指先が黒く汚れるころ、読める字がほんの少しだけ増えた。",
          { k: 1, p: 1 }
        ]),
        $terraData.K("今は家の手伝いや日銭稼ぎを優先する", {}, [
          1,
          "書き付けを折りたたんで脇へ置き、いつもの用事へ戻った。文字は覚えられなかったが、今日の手伝いで少しばかりの小遣いと家族の笑顔を得た。",
          { cash: 20000, rl: 1 }
        ])
      ]
    }
~~~

### `v77_adult_literacy_path`

~~~js
{
      id: "v77_adult_literacy_path",
      conf: "S",
      references: ["SRC_V77_SOCIAL_MODEL", "SRC_V77_FROSTLEAF"],
      st: ["青年", "壮年", "老年"],
      cd: 7,
      w: 0.64,
      show: s => s.age >= 18 && $rules.social.literacyValue(s) < 45,
      t: "役所の申請書を前に、自分の読める字だけを指先で拾った。通りの掲示板に夜間教室の案内が貼られていたのを思い出す。仕事帰りのクタクタな体で通えるか、月謝を捻出できるか思案した。",
      c: [
        $terraData.K(
          "仕事帰りに夜間教室へ通い始める",
          { en: { ge: { cash: 55000, socialAccess: 45 } }, why: "月謝に回す金か、夜間に通うだけの余裕がまだない。" },
          [
            1,
            "泥のように疲れた体を引きずって夜の教室へ通い、鉛筆の握り方から教わった。書類に並んだ黒い文字が、少しずつ意味のある言葉に変わっていった。",
            { k: 3, literacyGain: 8, cash: -55000, p: 1 }
          ]
        ),
        $terraData.K(
          "身近な人に文書を読んでもらえるか頼む",
          { en: { ge: { rl: 30 } }, why: "文字が読めないことを打ち明けて頼れる相手が、まだいない。" },
          [
            0.8,
            "知人は茶を淹れて横に座り、難しい言い回しを噛み砕いて教えてくれた。帰り際には、自分で読める文字がいくつか増えていた。",
            { k: 2, rl: 1, literacyGain: 4 }
          ],
          [
            1,
            "頼んだ相手もその日は忙しく、後でまたにしてくれと断られた。読めない文字が並んだ紙をたたみ、ため息とともに懐へしまった。",
            { p: -1 }
          ]
        ),
        $terraData.K("今は読み書きより、明日の稼ぎを優先する", {}, [
          1,
          "学びたい気持ちは胸の奥にしまい込み、今は目の前の仕事と家事に時間を使うことにした。今日の日当をきっちり受け取り、家族のために夕飯の買い出しをした。",
          { cash: 25000, rl: 1 }
        ])
      ]
    }
~~~

## data/base/confinement-and-education.js

### `education_return_path`

~~~js
{
      id:"education_return_path",conf:"S",references:["SRC_EDUCATION_ACCESS"],
      st:["児童","少年","青年","壮年"],cd:3,w:0.65,
      show:s=>s.age>=8 && !educationOccupied(s) &&
        !(educationHas(s,"upper") || s.educationPath?.equivalency?.includes("upper")),
      t:"途中で学び舎を離れたか、そもそも机を並べる機会がないまま歳月が過ぎた。今の読み書きの力と懐具合で、もう一度学べる場所がないか探してみた。",
      c:[
        $terraData.K("初等課程の募集先を探し、遅れて入れるか相談する",{
          show:s=>s.age<=14 && !educationHas(s,"primary"),
          en:s=>!educationActiveCase(s),why:"今年の進路案件がすでにある"
        },[1,"年下の子と同じ教室に通うことも考え、まず受け入れる学校があるか調べることにした。入学はまだ決まっていない。",
           {educationAction:"case:begin:reentry:primary:1"}]),
        $terraData.K("中断した前期中等課程の受入先を探す",{
          show:s=>s.age<=20 && s.educationPath?.stage==="lower" &&
            ["withdrawn","outside"].includes(s.educationPath.status),
          en:s=>!educationActiveCase(s),why:"今年の進路案件がすでにある"
        },[1,"以前の履修記録を確かめ、前期中等の課程を再開できる学校へ相談することにした。",
           {educationAction:"case:begin:reentry:lower:1"}]),
        $terraData.K("中断した後期中等課程の受入先を探す",{
          show:s=>s.age<=20 && s.educationPath?.stage==="upper" &&
            ["withdrawn","outside"].includes(s.educationPath.status),
          en:s=>!educationActiveCase(s),why:"今年の進路案件がすでにある"
        },[1,"以前の履修記録を確かめ、後期中等の課程を再開できる学校へ相談することにした。",
           {educationAction:"case:begin:reentry:upper:1"}]),
        $terraData.K("働きながら学べる正式準備課程を探す",{
          show:s=>s.age>=16,
          en:s=>!educationActiveCase(s),why:"今年の進路案件がすでにある"
        },[1,"働きながら受けられる正式な準備課程があるか、募集期間と通学条件を調べることにした。",
           {educationAction:"case:begin:reentry:preparatory:1"}]),
        $terraData.K("仕事や氏族・師弟のもとで学べる方法を探す",{},
          [1,"仕事場の親方や年長者に、教えてもらえることがあるか尋ねた。実際に学ぶ場と期間は、まだ決まっていない。",
           {p:1}])
      ]
    }
~~~

### `education_transfer_review`

~~~js
{
      id:"education_transfer_review",st:["幼児","児童","少年","青年","壮年","老年"],conf:"S",references:["SRC_EDUCATION_ACCESS"],
      show:s=>s.educationDecision?.kind==="transfer"&&educationLive(s),
      pri:true,who:"self",
      t:"通っていた学び舎から、これ以上は席を置けないと通告された。同じ街に受け入れてくれる別の学校があるか探し、このまま学びを続けるかどうか決断を迫られた。",
      c:[
        $terraData.K("受入が確定した学び舎へ学籍を移す",{
          en:s=>!!educationMigrationTransferOffer(s),
          why:"受入先の正式な承認・単位認定・通学・納付が揃っていない"
        },[1,"学籍と既修得の履修記録を確認し、承認された別の学び舎へ移った。新しい校地で学業を続けることになった。",
          {educationAction:"event:E41:A"}]),
        $terraData.K("通学をやめ、別の学び方を考える",{},[
          1,"学校へ通い続けることを断念し、教本を鞄にしまった。これまで覚えた知識は頭に残るが、卒業の免状は手に入らないまま校門を出た。",
          {educationAction:"transfer-leave"}])
      ]
    }
~~~

## data/parts/extensions/education-and-later-life/ursus-student-life.js

### `life_ursus_student_assembly_contact`

~~~js
{
    id: "life_ursus_student_assembly_contact",
    conf: "B",
    references: ["SRC_URSUS_PAA_OFFICIAL", "SRC_URSUS_PAA_SYNOPSIS"],
    st: ["少年", "青年"],
    need: ["国:ウルサス", "都市:サンクト・グリファーブルク"],
    ge: { year: 1101, age: 14 },
    le: { year: 1101, age: 24 },
    months: [10, 11],
    once: true,
    w: 0.18,
    t: "冬の舞踏会が近づく街で、よその学校の生徒たちがひそかに開く集まりの噂が回ってきた。国家評議会庁舎を傷つけた容疑で、学生連合の生徒がひとり憲兵に連れて行かれたという。家ではこの集まりに近づかないほうがいいと心配する声もあった。",
    c: [
      $terraData.K("身近な人には用事があるとだけ伝え、集まりを見に行く", {}, [
        1,
        "用事があると伝えて集まりへ顔を出した。捕まった生徒を助け出そうと息巻く声と、下手に動けば全員捕まると怯える声が入り乱れていた。帰り道、大通りでは冬の舞踏会に向けた華やかな飾りつけが進んでいた。",
        {
          fl: { ursus_student_assembly_contacted: 1 },
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "contact",
            role: "会合の知らせを受けた参加者"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            title: "同じ街の学生たちと連絡を保ち、自分の身を守る",
            priority: "暮らしと安全",
            action: "start"
          },
          groupStanding: {
            id: "deity-student-assembly",
            title: "学校をまたぐ学生連合の会合参加者",
            delta: 1,
            reason: "会合へ出席し、各校の話を聞いた"
          },
          p: 1
        }
      ]),
      $terraData.K("危ない誘いには乗らず、普段の暮らしを続ける", {}, [
        1,
        "その集まりには足を向けなかった。街では捕まった生徒の噂が囁かれていたが、冷たい風の中をまっすぐ帰った。",
        {
          fl: { ursus_student_assembly_contacted: 0, ursus_student_assembly_active: 0 },
          lifeGoal: {
            id: "ursus-student-assembly",
            title: "同じ街の学生たちと連絡を保ち、自分の身を守る",
            priority: "暮らしと安全",
            action: "abandon",
            note: "連合との接触を選ばず、日々の暮らしを続けた"
          },
          p: 0
        }
      ])
    ]
  }
~~~
