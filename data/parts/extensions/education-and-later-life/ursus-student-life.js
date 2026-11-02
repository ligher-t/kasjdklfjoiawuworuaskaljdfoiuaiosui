// extensions/education-and-later-life/ursus-student-life: construction fragment; evaluation order is declared by data/extensions/education-and-later-life.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/education-and-later-life",
  "extensions/education-and-later-life/ursus-student-life"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $terraData.EV.push({
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
    t: "冬の舞踏会が近づく街で、よその学校の生徒たちがひそかに開く集まりの噂が回ってきた。国家評議会庁舎を傷つけた容疑で、学生連合の生徒がひとり憲兵に連れて行かれたという。家では親が「頼むから余計なことに首を突っ込むな」と眉をひそめていた。",
    c: [
      $terraData.K("家の人には少し遅くなるとだけ言い、集まりへ様子を見に行く", {}, [
        1,
        "親には友人と勉強してくるとだけ告げて集まりへ顔を出した。捕まった生徒を助け出そうと息巻く声と、下手に動けば全員捕まると怯える声が入り乱れていた。帰り道、大通りでは冬の舞踏会に向けた華やかな飾りつけが進んでいた。",
        {
          fl: { ursus_student_assembly_contacted: 1 },
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "contact",
            role: "会合の知らせを受けた学生"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            title: "同じ街の学生たちと連絡を保ち、自分の身を守る",
            priority: "学業と安全",
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
      $terraData.K("危ない誘いには乗らず、学校と家の往復を守る", {}, [
        1,
        "その集まりには足を向けなかった。教室でも捕まった生徒の噂がひそひそと囁かれていたが、放課後は寄り道せず、冷たい風の中をまっすぐ家へ帰った。",
        {
          fl: { ursus_student_assembly_contacted: 0, ursus_student_assembly_active: 0 },
          lifeGoal: {
            id: "ursus-student-assembly",
            title: "同じ街の学生たちと連絡を保ち、自分の身を守る",
            priority: "家と学業",
            action: "abandon",
            note: "連合との接触を選ばず、日々の暮らしを続けた"
          },
          p: 0
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_student_assembly_meeting",
    conf: "B",
    references: ["SRC_URSUS_PAA_SYNOPSIS"],
    st: ["少年", "青年"],
    need: ["ursus_student_assembly_contacted"],
    after: { id: "life_ursus_student_assembly_contact", min: 0 },
    ge: { year: 1101, age: 14 },
    le: { year: 1101, age: 24 },
    months: [10, 11],
    once: true,
    w: 0.22,
    t: "薄暗い空き部屋で開かれた会合では、捕まった仲間を釈放させるため、冬の舞踏会の当日に宮殿の前で抗議の声を上げようという話になった。だが街頭へ出れば憲兵に目を付けられる。親になんと言い訳するか、本当に広場へ立つ覚悟があるか、手のひらが汗ばんだ。",
    c: [
      $terraData.K("当日広場へ出ると腹を括り、プラカードの準備を手伝う", {}, [
        1,
          "自分も広場へ出ると仲間に告げ、はぐれた時の合流場所を親しい友人ひとりとだけ確かめ合った。冷たい床に紙を広げ、掲げる言葉を自分の手で書き上げた。",
        {
          fl: { ursus_student_assembly_active: 1 },
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "join",
            role: "抗議の準備を手伝う学生"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "continue",
            note: "自分の判断で街頭抗議に参加する"
          },
          lifeSkill: {
            id: "ursus-civic-messaging",
            title: "限られた相手への連絡と集合確認",
            delta: 1,
            context: "友人と合流場所を確認した"
          },
          groupStanding: {
            id: "deity-student-assembly",
            title: "学校をまたぐ学生連合の会合参加者",
            delta: 1,
            reason: "自分が担える範囲の準備に加わった"
          },
          p: 1
        }
      ]),
      $terraData.K("広場には出ず、戻らない仲間の家族へ知らせる連絡役に回る", {}, [
        1,
        "自分は表には出ず、もし夜になっても帰らない生徒がいれば家族へ知らせる役目を引き受けた。当日、いつまでも帰還の知らせが来ない名前を見つめる時間はひどく長かった。",
        {
          fl: { ursus_student_assembly_active: 1 },
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "join",
            role: "家族への伝言・帰宅確認"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "compromise",
            note: "街頭参加を避け、帰宅確認と伝言を担う"
          },
          lifeSkill: {
            id: "ursus-civic-messaging",
            title: "限られた相手への連絡と集合確認",
            delta: 1,
            context: "参加者の帰宅確認を家族へ伝える準備をした"
          },
          groupStanding: {
            id: "deity-student-assembly",
            title: "学校をまたぐ学生連合の会合参加者",
            delta: 1,
            reason: "家族への連絡を引き受けた"
          },
          p: 1
        }
      ]),
      $terraData.K("これ以上は危険だと身を引き、集まりから抜ける", {}, [
        1,
        "やはり自分には無理だと伝えて部屋を出た。翌日からはいつも通り授業に出たが、街の空気はどこかピリピリと張り詰めていた。",
        {
          fl: { ursus_student_assembly_contacted: 0, ursus_student_assembly_active: 0 },
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "decline",
            note: "抗議準備への参加を辞退した"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "abandon",
            note: "安全と日々の暮らしを優先した"
          },
          groupStanding: {
            id: "deity-student-assembly",
            title: "学校をまたぐ学生連合の会合参加者",
            delta: 0,
            reason: "抗議準備には加わらず、学業と家の用事を優先した"
          },
          p: 0
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_student_assembly_protest",
    conf: "B",
    references: ["SRC_URSUS_PAA_SYNOPSIS"],
    st: ["少年", "青年"],
    need: ["ursus_student_assembly_active", "国:ウルサス", "都市:サンクト・グリファーブルク"],
    after: { id: "life_ursus_student_assembly_meeting", min: 0 },
    ge: { year: 1101, age: 14 },
    le: { year: 1101, age: 24 },
    months: [12],
    show: s => !!s.world?.events?.katorga_incident,
    once: true,
    w: 0.2,
    t: s => s.eventOutcomes?.life_ursus_student_assembly_meeting?.choiceIndex === 1
      ? "冬の舞踏会の夜、広場から離れた部屋で学生たちの帰りを待った。通りの向こうで鐘が鳴り、騒ぎが始まったという知らせが届く。戻ってこない生徒の家族に、何をどこまで伝えられるのか。机の上には、まだ確かめられていない名前が並んでいた。"
      : "冬の舞踏会の当日、凍てつく宮殿前の広場には大勢の学生が詰めかけた。静かにプラカードを掲げる者もいれば、怒号を上げる者もいて足並みは最初から乱れていた。突然、白煙を噴き上げて催涙弾が転がり込み、帰る道も見失われた。警棒を構えた警備兵が雪煙を蹴立てて突っ込んでくる中、すぐ目の前で友人が足を滑らせて倒れ込んだ。",
    c: [
      $terraData.K("転んだ友人を起こそうとする", { show: s => s.eventOutcomes?.life_ursus_student_assembly_meeting?.choiceIndex === 0 }, [
        1,
        "友人の肩を抱き起こそうとした瞬間、背後から警備兵に取り押さえられた。そのまま窓のない護送車へ押し込まれ、どこへ行くかも知らされないまま、電力も暖房も落とされた極寒のカトルガ区画へ放り込まれた。",
        {
          fl: { ursus_katorga_detained: 1 },
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "crisis",
            note: "抗議後に拘束され、カトルガ区画へ移送された"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "compromise",
            note: "拘束下で連絡と身の安全を探る"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "カトルガ区画へ移送された学生の一人",
            kind: "detention",
            description: "抗議の混乱後に拘束され、カトルガ区画へ移送された",
            basis: "secondary-event-summary; individual-game-branch"
          },
          p: -2,
          k: -2
        }
      ]),
      $terraData.K("パニックの人波から脇道へ抜け、家族への伝言役に徹する", { show: s => s.eventOutcomes?.life_ursus_student_assembly_meeting?.choiceIndex === 0 }, [
        1,
        "むせるような煙の中、友人と引き剥がされるように路地裏へ逃げ込んだ。翌日からは表通りを避け、捕まった仲間たちの親もとへひそかに様子を知らせて回った。",
        {
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "role",
            role: "街頭を離れた家族への伝言係"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "continue",
            note: "街頭参加から離れ、連絡役として安全を優先する"
          },
          groupStanding: {
            id: "deity-student-assembly",
            title: "学校をまたぐ学生連合の会合参加者",
            delta: 1,
            reason: "帰宅確認の伝言を運んだ"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "抗議に関わった学生の家族連絡",
            kind: "family-message",
            description: "帰らない生徒について知っていることを、家族へ伝えた",
            basis: "secondary-event-summary; individual-game-branch"
          },
          p: 1
        }
      ]),
      $terraData.K("命の危険を感じ、そのまま家へ逃げ帰って息を潜める", { show: s => s.eventOutcomes?.life_ursus_student_assembly_meeting?.choiceIndex === 0 }, [
        1,
        "誰にも声をかけず、震える足で家まで走って逃げ帰った。それから数日は恐ろしくて学校へも行けず、誰が連れ去られたという噂ばかりが耳に入った。",
        {
          fl: { ursus_student_assembly_active: 0 },
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "suspend",
            note: "抗議後の危険を避けて活動を一時休止した"
          },
          lifeGoal: { id: "ursus-student-assembly", action: "pause", note: "身の安全と家族との生活を優先" },
          p: 0
        }
      ]),
      $terraData.K("確かめられた帰宅情報だけを、待っている家族へ届ける", { show: s => s.eventOutcomes?.life_ursus_student_assembly_meeting?.choiceIndex === 1 }, [
        1,
        "夜明けまでに戻った人の名前を一つずつ確かめ、その家族へ知らせに歩いた。まだ帰らない人については、知らないことを知らないまま伝えた。戸口が閉まるたび、次の家へ向かう足が重くなった。",
        {
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "role",
            role: "帰宅確認と家族への伝言係",
            note: "広場へは出ず、確かめた安否だけを伝えた"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "continue",
            note: "知らない安否を憶測で埋めず、連絡役を続けた"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "学生の家族への帰宅連絡",
            kind: "family-message",
            description: "帰宅を確認できた学生について、その家族へ伝えた",
            basis: "secondary-event-summary; individual-game-branch"
          },
          p: -2, rl: 2
        }
      ]),
      $terraData.K("いったん連絡を止め、家族と自分の安全を確かめる", { show: s => s.eventOutcomes?.life_ursus_student_assembly_meeting?.choiceIndex === 1 }, [
        1,
        "外では誰が連れて行かれたのか確かな話がなく、伝言を待つ家からも次々に人が訪れた。今夜は答えを出せないと告げ、紙片をしまって戸に鍵を掛けた。",
        {
          fl: { ursus_student_assembly_active: 0 },
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "suspend",
            note: "広場の外での連絡を休止し、身の安全を優先した"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "pause",
            note: "安否不明のまま断定せず、連絡を一時止めた"
          },
          p: -1
        }
      ]),
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_katorga_life",
    conf: "B",
    references: ["SRC_URSUS_PAA_SYNOPSIS"],
    st: ["少年", "青年"],
    need: ["ursus_katorga_detained"],
    after: { id: "life_ursus_student_assembly_protest", min: 1 },
    ge: { year: 1102, age: 14 },
    le: { year: 1102, age: 24 },
    once: true,
    w: 0.22,
      t: "送り込まれたカトルガ区画では、稼働停止とともに照明も暖房も断ち切られ、外の扉には重い鎖がかけられた。叩いても返事のない扉が並び、白い息が凍りつく暗闇の中で、わずかな水と食料をどうつなぐか迫られた。",
    c: [
      $terraData.K("同じ区画に閉じ込められた仲間の名前と、足りない薬や水を書き留める", {}, [
        1,
        "かじかむ指で紙切れに、生きている仲間の名前と怪我の様子を書き留めた。外へ出られた時に家族へ伝えられるよう、ポケットの奥にしまい込んだ。",
        {
          lifeSkill: {
            id: "ursus-civilian-records",
            title: "避難先での安否・物資記録",
            delta: 1,
            context: "同じ区画にいた仲間の名前と怪我の様子を書き留めた"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "continue",
            note: "確かな安否だけを書き留め、外へ伝える準備をする"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "カトルガ区画の避難者間の記録",
            kind: "limited-roll-call",
            description: "同じ区画にいた仲間の名前と必要な手当を紙片に書き留めた",
            basis: "secondary-event-summary; individual-game-branch"
          },
          p: 1
        }
      ]),
      $terraData.K("取り残された現場の作業員に、少しでも暖かい場所と水場を聞く", {}, [
        1,
          "区画に取り残されていた作業員が、まだ余熱の残る配管のそばと、崩落の危険がある立ち入り禁止の通路を教えてくれた。周りの学生たちにも声をかけ、身を寄せ合って寒さをしのいだ。",
        {
          lifeSkill: {
            id: "ursus-civilian-records",
            title: "避難先での安否・物資記録",
            delta: 1,
            context: "現地の作業員に安全な通路と水場を尋ねた"
          },
          groupStanding: {
            id: "katorga-local-workers",
            title: "カトルガ区画で暮らし働く人々",
            delta: 1,
            reason: "現地の注意を聞き、危険な通路を避けた"
          },
          regionalImpact: {
            region: "ウルサス",
            entity: "カトルガ区画の学生と現地住民",
            kind: "local-safety-message",
            description: "現地の作業員から聞いた安全な場所を周りの学生へ伝えた",
            basis: "secondary-event-summary; individual-game-branch"
          },
          p: 1
        }
      ]),
      $terraData.K("無駄に動き回らず、毛布にくるまって体力と食料を温存する", {}, [
        1,
          "体力を消耗しないよう壁際にうずくまり、わずかな乾パンを少しずつかじって耐えた。何日か過ぎた頃、ついに封鎖扉の向こうから閂を外す金属音と人の声が響いた。",
        {
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "pause",
            note: "生き延びるために体力と食料の温存を最優先した"
          },
          p: 0
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_student_assembly_release",
    conf: "B",
    references: ["SRC_URSUS_PAA_SYNOPSIS"],
    st: ["少年", "青年"],
    need: ["ursus_katorga_detained"],
    after: { id: "life_ursus_katorga_life", min: 0 },
    ge: { year: 1102, age: 14 },
    le: { year: 1102, age: 24 },
    once: true,
    w: 0.2,
      t: "やがて封鎖扉が開かれ、外の眩しい光とともに審理や釈放の手続きが始まった。泣きながら親に抱きつく者、戻らない友人の名を呼ぶ者、帰る場所を失った者が入り乱れる中、あなたはよろめく足で外へ出た。",
    c: [
      $terraData.K("迎えに来た家族と帰り、無事だった仲間ひとりに手紙を出す", {}, [
        1,
        "駆けつけた家族の肩に支えられて家へ帰った。温かいスープを飲んだあと、あの日同じ場所にいた仲間へ無事を知らせる短い手紙を書いた。",
        {
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "return",
            role: "解放後の限定的な連絡役"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "continue",
            note: "生活を立て直しながら仲間との細い縁を保つ"
          },
          fl: { ursus_katorga_detained: 0, ursus_student_assembly_active: 1 },
          p: 1
        }
      ]),
      $terraData.K("知っている仲間の安否だけ伝えて、学生連合とは関わりを絶つ", {}, [
        1,
        "自分が見聞きした仲間の安否だけを世話役に伝え、これで学生連合とはきっぱり縁を切ると告げて家へ帰った。",
        {
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "leave",
            note: "家族のもとへ戻り、活動を終えた"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "complete",
            note: "無事に帰宅し、仲間の安否を伝えて区切りをつけた"
          },
          fl: { ursus_katorga_detained: 0, ursus_student_assembly_active: 0 },
          regionalImpact: {
            region: "ウルサス",
            entity: "カトルガ区画から戻った本人の記録",
            kind: "personal-testimony",
            description: "同じ区画にいた仲間の安否を家族や世話役へ伝えた",
            basis: "secondary-event-summary; individual-game-branch"
          },
          p: 1
        }
      ]),
      $terraData.K("誰とも連絡を取らず、冷え切った体を休めて療養に専念する", {}, [
        1,
        "家に帰り着くと、極寒の区画で張り詰めていた糸が切れたように高熱を出して寝込んだ。外の連絡はすべて遮断し、しばらくは診療所と寝床を往復する日々を送った。",
        {
          lifeAffiliation: {
            id: "ursus-student-assembly",
            title: "サンクト・グリファーブルク学生連合とのつながり",
            kind: "community",
            action: "suspend",
            note: "解放後の治療と休息のため一時休止した"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "pause",
            note: "体調と暮らしの立て直しを最優先した"
          },
          fl: { ursus_katorga_detained: 0, ursus_student_assembly_active: 0 },
          h: 2,
          p: 0
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_ursus_student_assembly_later",
    conf: "S",
    references: ["SRC_URSUS_PAA_SYNOPSIS"],
    st: ["青年", "壮年"],
    need: ["ursus_student_assembly_active"],
    after: { id: "life_ursus_student_assembly_protest", min: 6 },
    ge: { year: 1107, age: 18 },
    once: true,
    w: 0.16,
      t: "あの冬の事件から何年もが過ぎ、学校を出て働く場所も住まいも変わった。ある日、当時学生連合で顔を合わせたひとりから短い手紙が届いた。今の仕事や家族との平穏な暮らしを思いながら、返事を書くか迷った。",
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
  });

  $terraData.EV.push({
    id: "life_ursus_student_assembly_pause_review",
    conf: "S",
    references: ["SRC_URSUS_PAA_STORY_ARCHIVE", "SRC_URSUS_PAA_SYNOPSIS"],
    st: ["青年", "壮年"],
    after: { id: "life_ursus_student_assembly_protest", min: 4 },
    ge: { year: 1105, age: 18 },
    le: { year: 1120, age: 60 },
    cd: 3,
    w: 0.28,
    show: s => {
      const a = s.lifeRecord?.affiliations?.find(row => row.id === "ursus-student-assembly");
      return a?.status === "suspended" && s.year - (a.lastChangedYear ?? s.year) >= 3;
    },
    t: "あの冬のあと、学生連合の活動から距離を置いて数年が経った。街でかつての知人の噂を耳にし、無事を確かめたい思いが胸をかすめる。今の平穏な暮らしを守りつつ、連絡を取ってみるべきだろうか。",
    c: [
      $terraData.K("以前の知人一人に短い便りを送ってみる", {}, [
        1,
        "以前の知人一人に短い便りを送った。返事を待ちながら、今の生活を壊さない範囲で細く連絡を保つことにした。",
        {
          lifeAffiliation: {
            id: "ursus-student-assembly",
            action: "return",
            role: "限定的な連絡・近況確認",
            note: "当時の知人一人に便りを送った"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "continue",
            note: "現在の生活と両立できる範囲で一人に便りを送った"
          },
          fl: { ursus_student_assembly_active: 1 },
          p: 1
        }
      ]),
      $terraData.K("便りは出さず、もう少し暮らしが落ち着くまで待つ", {}, [
        1,
        "今は便りを送らず、日々の仕事と暮らしに専念した。引き出しの奥の手紙の束をそっと閉じた。",
        {
          lifeAffiliation: {
            id: "ursus-student-assembly",
            action: "review",
            note: "距離を置いたまま自分の暮らしを優先する"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "pause",
            note: "休止を続け、暮らしの変化後に再検討する"
          },
          fl: { ursus_student_assembly_active: 0 },
          p: 0
        }
      ]),
      $terraData.K("昔の縁にはここで区切りをつけ、今の暮らしに生きる", {}, [
        1,
        "もう昔の集まりには戻らないと短い手紙で伝え、過去との縁にピリオドを打った。",
        {
          lifeAffiliation: {
            id: "ursus-student-assembly",
            action: "leave",
            note: "休止後に本人が役割を終えると伝えた"
          },
          lifeGoal: {
            id: "ursus-student-assembly",
            action: "abandon",
            note: "今後は家族・仕事など別の生活を優先する"
          },
          fl: { ursus_student_assembly_active: 0 },
          p: 0
        }
      ])
    ]
  });
});
