// routes/rhodes-and-factions/staff-routes-events-01: construction fragment; evaluation order is declared by data/routes/rhodes-and-factions.js.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/staff-routes-events-01"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  const events = [
    {
      id: "sr_rhodes_recruitment_contact",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年"],
      ge: { age: 18 },
      le: { age: 56 },
      once: true,
      w: 0.13,
      show: s =>
        s.local?.access >= 0.52 &&
        !s.fl?.detained &&
        !s.fl?.segregated &&
        !$terraData.srOnStaff(s) &&
        !$terraData.srAffiliationStatus(s, "rhodes-employment"),
      t: "街を回っていたロドスの巡回医療班に同行していた職員が、荷の仕分けや設備の保守、事務手伝いの募集案内を配っていた。短期の募集で、配属先もまだ決まっていないという。家の暮らしや今後の働き方を思い浮かべ、すぐには返事ができなかった。",
      c: [
        $terraData.K("仕事の内容を詳しく聞き、これまでの経験を添えて申し込む", {}, [
          1,
          "これまで経験した作業や、扱える道具を書き添えて応募した。返事が来るまでは今の暮らしを続けた。",
          {
            lifeAffiliation: {
              id: "rhodes-employment",
              title: "ロドスへの雇用照会",
              kind: "employment-application",
              action: "contact",
              role: "職務・勤務地の確認待ち"
            },
            p: 1,
            k: 1
          }
        ]),
        $terraData.K("今は応募せず、次の募集案内だけ届くように頼む", {}, [
          1,
          "次に人手が必要になったら知らせてもらえるよう連絡先を伝え、その日は案内を持って家へ戻った。",
          { k: 1 }
        ]),
        $terraData.K("家の都合と今の暮らしを優先し、今回は見送る", {}, [
          1,
          "家の段取りや今後の働き方を考え合わせると、すぐには動けそうになかった。案内状をそっと返し、今回は見送った。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_hiring_review",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      need: ["ロドスの採用照会中"],
      pri: true,
      w: 2.5,
      cd: 1,
      show: s =>
        s.age >= 18 &&
        s.year >
          (s.lifeRecord?.affiliations?.find(a => a.id === "rhodes-employment")?.lastContactYear ?? s.year),
      t: "ロドスから届いた返事には、物資管理や設備整備、医療補助、連絡便、行動予備隊などいくつもの部署が並んでいた。外勤を希望するなら、採用の前に適性検査と実地訓練があるという。これまで自分がやってきた仕事を思い返し、どの部署の面接を受けるか考えた。",
      c: [
        $terraData.K(
          "物資管理や宿舎の生活支援を希望する",
          {},
          [
            0.62,
            "物資の仕分けと宿舎の世話を担う職員として迎え入れられた。朝一番に薬箱の荷札を改め、出発する班へ必要な物資を手渡す日々が始まった。",
            $terraData.srStaff("service", "物資・生活支援職員", "rhodes-supply", "物資と生活支援の実務")
          ],
          [
            1,
            "生活支援枠の応募はすでに満員で、今回は見送りとなった。肩を落として宿舎を出たが、人事の職員が「人手が必要になればまた声をかける」と短く書き添えてくれた。",
            {
              lifeAffiliation: {
                id: "rhodes-employment",
                title: "ロドスへの雇用照会",
                action: "decline",
                note: "定員充足のため今回の応募は見送り"
              },
              p: 1
            }
          ]
        ),
        $terraData.K(
          "機械・動力設備の点検職を希望する",
          { show: { ge: { k: 20 } } },
          [
            0.44,
            "設備整備の職員として採用が決まった。初日は先輩の後ろについて通路の配管や換気扇を回り、勝手に触れてはいけない動力盤の位置を頭に叩き込んだ。",
            $terraData.srStaff(
              "maintenance",
              "設備整備職員",
              "rhodes-maintenance",
              "動力設備と生活機器の点検"
            )
          ],
          [
            1,
            "高圧設備を扱う資格は満たせなかったが、熱意と道具の手入れの丁寧さを買われ、施設保全部門の道具管理・補修補助（生活支援枠）として採用された。「現場で経験を積みながら整備士を目指すといい」と先輩が励ましてくれた。",
            $terraData.srStaff("service", "整備部・資材管理補助", "rhodes-supply", "機材・物資の整理と整備補助", 2)
          ]
        ),
        $terraData.K(
          "診療記録や鉱石病研究の補助職を希望する",
          { show: { ge: { k: 48 } } },
          [
            0.37,
            "カルテの整理や研究資料の下調べを手伝う補助職として採用された。患者本人がどこまで記録の共有を許しているか、一文字ずつ目を凝らして確かめる仕事だった。",
            $terraData.srStaff(
              "research",
              "医療・研究補助職員",
              "clinical-records",
              "医療記録の整理と取り扱い"
            )
          ],
          [
            1,
            "研究本隊の指導枠は満員だったが、診療所の薬品搬送や受診受付など、医療支援の現場スタッフとして拾い上げられた。白衣を着ることはできなくても、医療の最前線を支える一員になれた。",
            $terraData.srStaff("service", "医務部・物資補給員", "rhodes-supply", "医療物資の運搬と受付補助", 2)
          ]
        ),
        $terraData.K(
          "支部間の連絡便を担うトランスポーターを希望する",
          { show: { ge: { k: 15 } } },
          [
            0.38,
            "まずは先輩の車に同乗し、決められた街道の連絡便から仕事を覚えることになった。荷箱の封を確かめ、天災警報の向きが変わればすぐに無線で知らせた。",
            $terraData.srStaff(
              "transporter",
              "トランスポーター候補",
              "rhodes-transport",
              "連絡便の経路・荷札・受領記録"
            )
          ],
          [
            1,
            "長距離トランスポーター枠には届かなかったが、艦内や拠点周辺の物資集積所を結ぶ構内連絡・搬送係として迎え入れられた。「近場から道を覚えていけばいい」と配属通知を受け取った。",
            $terraData.srStaff("service", "構内運搬・連絡支援員", "rhodes-supply", "拠点内物流と連絡便補助", 2)
          ]
        ),
        $terraData.K(
          "行動予備隊の事務と基礎訓練を希望する",
          { show: { ge: { k: 18 } } },
          [
            0.3,
            "行動予備隊の補助枠で採用され、日中の事務仕事と夕方の自衛訓練からスタートした。訓練が終わったあと、汗だくで防具の泥を拭き取る毎日が始まった。",
            $terraData.srStaff(
              "reserve",
              "行動予備隊員",
              "rhodes-reserve",
              "隊内連絡・事務手順・基礎訓練",
              2
            )
          ],
          [
            1,
            "行動予備隊の正隊員枠には届かなかったが、訓練施設管理と装備整備を担当する後方支援員として採用された。隊員たちと共に走り、いつか隊員に加わることを目指して汗を流す日々が始まった。",
            $terraData.srStaff("service", "予備隊支援員・装備整備補", "rhodes-supply", "訓練資材の管理と後方支援", 2)
          ]
        ),
        $terraData.K(
          "外勤の選考と訓練を受けたいと申し出る",
          { show: { ge: { h: 72, k: 25 } } },
          [
            0.13,
            "体力測定と実技訓練をくぐり抜け、外勤オペレーター候補に選ばれた。初めての任務では輸送班の護衛につき、緊張で乾いた喉で隊長の指示を復唱した。",
            $terraData.srStaff("field", "外勤オペレーター候補", "rhodes-field", "外勤の装備確認と行動訓練", 2)
          ],
          [
            1,
            "実技選考の基準は厳しく実戦オペレーター採用は見送られたが、教官から「基礎体力と気概は十分だ」と行動予備隊の見習い枠（予備隊員）への推薦を受けた。まずは予備隊でじっくり実戦力を磨くことになった。",
            $terraData.srStaff("reserve", "行動予備隊員（見習い）", "rhodes-reserve", "隊内連絡・事務手順・基礎訓練", 2)
          ]
        ),
        $terraData.K("選考は辞退し、今の暮らしを続ける", {}, [
          1,
          "今回は選考を辞退すると連絡を入れた。肩の力を抜き、見慣れた自分の職場と家の暮らしへ戻った。",
          {
            lifeAffiliation: {
              id: "rhodes-employment",
              title: "ロドスへの雇用照会",
              action: "decline",
              note: "本人が応募を取り下げた"
            },
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_rhodes_service_daily",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.6,
      show: s => $terraData.srOnStaff(s) && s.job === $terraData.SR_JOBS.service,
      t: "ロドスの物資保管庫に、食料や毛布、医療消耗品の木箱が山のように運び込まれた。次の巡回班が出るまでにゴム手袋と携帯食料が足りなくなりそうで、どこへ何を優先して回すか頭を悩ませた。",
      c: [
        $terraData.K("生活区画で暮らす人たちの分を先に確保する", {}, [
          1,
          "療養中の人たちや宿舎で使う分を先に棚へ分け、外勤班に回す不足分は急ぎの追加発注に載せた。",
          {
            lifeSkill: {
              id: "rhodes-supply",
              title: "物資と生活支援の実務",
              delta: 5,
              context: "不足した生活物資の受け渡しを記録"
            },
            p: 1,
            k: 1
          }
        ]),
        $terraData.K("体調を崩した同僚の分まで居残りで仕分け切る", {}, [
          1,
          "休んだ同僚の持ち場も引き受け、夜遅くまで木箱を開けて棚へ収めきった。翌朝は腰から背中まで鉛のように重かったが、同僚からは何度も礼を言われた。",
          { h: -2, rl: 2 }
        ]),
        $terraData.K("今日は定時で切り上げ、残りは明日の早番と分担する", {}, [
          1,
          "無理な残業はせず、まだ開けていない木箱に目印の札を貼って翌朝の当番へ託した。",
          { h: 1, p: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_maintenance_daily",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.56,
      show: s => $terraData.srOnStaff(s) && s.job === $terraData.SR_JOBS.maintenance,
      t: "宿舎区画へ湯を送る太い配管から、金属が擦れるような嫌な異音が響いていた。もうすぐ夕方の入浴が始まる時間だが、ボイラーを一度止めなければ奥の継ぎ目までは手が届かない。",
      c: [
        $terraData.K("苦情が出るのを覚悟でボイラーを止め、安全手順通りに調べる", {}, [
          1,
          "宿舎に断りを入れて湯を止め、熱気のこもる点検口へ潜り込んで緩んだ継ぎ目を締め直した。入浴の時間は遅れたが、夜中の水漏れは未然に防げた。",
          {
            lifeSkill: {
              id: "rhodes-maintenance",
              title: "動力設備と生活機器の点検",
              delta: 5,
              context: "停止確認と温水設備の点検"
            },
            k: 1,
            p: 1
          }
        ]),
        $terraData.K("古株の技師を呼び、湯を通したまま二人で応急処置をする", {}, [
          1,
          "ベテランの先輩と二人がかりで予備管へ湯を逃がし、ひびの入ったパッキンを金具で仮止めした。入浴時間にはなんとか間に合わせ、交換部品の手配を翌朝へ回した。",
          {
            lifeSkill: {
              id: "rhodes-maintenance",
              title: "動力設備と生活機器の点検",
              delta: 3,
              context: "応急修理と未交換部品の確認"
            },
            rl: 1
          }
        ]),
        $terraData.K("熱気でめまいがする前に交代を頼み、詰め所で休む", {}, [
          1,
          "狭い機械室の熱気に当てられ、無理をせず交代要員を呼んで部屋へ戻った。横になりながらも、無事に湯が出ているか壁の向こうの水音に耳を澄ませた。",
          { h: 2, p: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_research_daily",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.5,
      show: s => $terraData.srOnStaff(s) && s.job === $terraData.SR_JOBS.research,
      t: "鉱石病の経過記録を整理していると、同じくらいの症状でも定期検診の間隔が人によってばらばらなことに気づいた。ある患者の欄には、日雇いの仕事を休めず受診が何ヶ月も遅れたと走り書きがあった。",
      c: [
        $terraData.K("仕事や暮らしの事情で通院が途切れた例を別枠でまとめる", {}, [
          1,
          "薬の効き目だけでなく、仕事を休めずに通院が途切れた事情も読み取れるように分類し直した。数字の並びの奥にある一人ひとりの暮らしが、少しだけ浮かび上がった。",
          {
            lifeSkill: {
              id: "clinical-records",
              title: "医療記録の整理と取り扱い",
              delta: 5,
              context: "通院できなかった記録の注記"
            },
            k: 2,
            p: 1
          }
        ]),
        $terraData.K("聞き取りが曖昧なカルテを選び出し、主治医へ差し戻す", {}, [
          1,
          "空白や食い違いのある箇所に付箋を貼り、担当医の机へ戻して確認を頼んだ。自分が帰る時間になっても、まだ診察室からは声が出ていた。",
          { k: 1, rl: 1 }
        ]),
        $terraData.K("今日頼まれた分だけを正確に片づけ、目を休める", {}, [
          1,
          "深追いはせず、今日のうちに集計する分だけをきっちり仕上げてバインダーを閉じた。細かい文字を追い続けた目をこすりながら部屋を出た。",
          { h: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_field_qualification",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年"],
      once: true,
      w: 0.44,
      show: s => $terraData.srOnStaff(s) && s.job === $terraData.SR_JOBS.field,
      t: "訓練場で負傷者の搬送と撤退合図の反復訓練が続いた。次の実地派遣を前に、教官から「お前なら現場でどの役回りを続けられそうだ」と率直に問われた。",
      c: [
        $terraData.K("物資の補給と、負傷者を後ろへ運ぶ役目を担う", {}, [
          1,
          "重い補給嚢を背負って走る訓練を重ね、救護班との連携を身体に覚え込ませた。現場では怪我人を担架へ乗せて引き渡し、しんがりで撤退の信号弾を打ち上げた。",
          {
            lifeAffiliation: {
              id: "rhodes-staff",
              title: "ロドス・アイランド",
              action: "role",
              role: "外勤オペレーター（補給・救護支援）",
              preserveRhodesPost: true
            },
            lifeSkill: {
              id: "rhodes-field",
              title: "外勤の装備確認と行動訓練",
              delta: 7,
              context: "救援経路と撤退訓練"
            },
            h: -2,
            k: 2
          }
        ]),
        $terraData.K(
          "先頭を行く偵察と、輸送隊の護衛に挑む",
          { show: s => s.h >= 68 && (s.lifeRecord?.skills || []).some(row =>
            row.id === "rhodes-field" && row.level >= 2) },
          [
            0.7,
            "先輩の斥候と地図を突き合わせ、危険地帯のすぐ手前で本隊を止める合図を叩き込まれた。本番の派遣では先頭を歩き、風の匂いと足場の崩れを後ろの班へ伝え続けた。",
            {
              lifeAffiliation: {
                id: "rhodes-staff",
                title: "ロドス・アイランド",
                action: "role",
                role: "外勤オペレーター（護衛・偵察）",
                preserveRhodesPost: true
              },
              lifeSkill: {
                id: "rhodes-field",
                title: "外勤の装備確認と行動訓練",
                delta: 7,
                context: "護衛と偵察の訓練"
              },
              h: -3,
              cr: 1
            }
          ],
          [
            1,
            "模擬戦で判断が一歩遅れ、前衛の偵察班へ入るのはまだ早いと告げられた。悔しさを噛みしめながら、後方での連絡と補給路の維持に回ることにした。",
            {
              lifeAffiliation: {
                id: "rhodes-staff",
                title: "ロドス・アイランド",
                action: "role",
                role: "外勤オペレーター（連絡・補給）",
                preserveRhodesPost: true
              },
              lifeSkill: {
                id: "rhodes-field",
                title: "外勤の装備確認と行動訓練",
                delta: 3,
                context: "前衛配置は見送り"
              },
              p: -1
            }
          ]
        ),
        $terraData.K("外勤は自分の手に余ると認め、設備整備への配置換えを願い出る", {}, [
          1,
          "教官に正直な気持ちを打ち明け、内勤の整備班へ移らせてもらった。外勤の訓練で泥まみれにした装具や通信機の構造を知っていたおかげで、修理の仕事にはすぐ馴染めた。",
          {
            job: $terraData.SR_JOBS.maintenance,
            lifeAffiliation: {
              id: "rhodes-staff",
              title: "ロドス・アイランド",
              action: "role",
              role: "設備整備職員",
              preserveRhodesPost: true
            },
            lifeSkill: {
              id: "rhodes-maintenance",
              title: "動力設備と生活機器の点検",
              delta: 2,
              context: "外勤から設備の点検へ配置換え"
            },
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_rhodes_work_review",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 6,
      w: 0.32,
      show: s => {
        const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-staff"),
          currentEpisode = affiliation?.episodes?.at(-1),
          startedYear = Number.isInteger(currentEpisode?.startedYear)
            ? currentEpisode.startedYear
            : affiliation?.startedYear;
        return (
          $terraData.srOnStaff(s) &&
          s.age >= 22 &&
          Number.isInteger(startedYear) &&
          s.year - startedYear >= 2
        );
      },
      t: "ロドスで働きはじめてから何年かが過ぎた。節目の面談で、上司が来季の人員配置案を机に広げた。このまま今の持ち場を続けるか、少し出勤を減らすか、それとも船を降りて別の土地で暮らすか、率直に尋ねられた。",
      c: [
        $terraData.K("これからも今の持ち場で働き続ける", {}, [
          1,
          "迷わず来季も残ると答え、馴染んだ持ち場の予定表に自分の名を入れた。廊下へ出ると、いつもの機械音と仲間の話し声が聞こえてきた。",
          { p: 1, cr: 1 }
        ]),
        $terraData.K("無理のない日数に減らし、新人の指導や引き継ぎに回る", {}, [
          1,
          "体力や暮らしと相談して出勤日を減らしてもらい、若い職員に仕事の手順を教える役目を引き受けた。空いた休日にゆっくりお茶を飲むゆとりができた。",
          {
            fl: { reduced_work: 1 },
            lifeAffiliation: {
              id: "rhodes-staff",
              title: "ロドス・アイランド",
              action: "role",
              role: "短時間勤務・引継ぎ",
              preserveRhodesPost: true
            },
            p: 2,
            h: 1
          }
        ]),
        $terraData.K("ロドスを退職し、別の土地で新しい働き口を探す", {}, [
          1,
          "後任に仕事のコツをすべて伝え、支給されていた制服と身分証を返した。見送りに来てくれた同僚と握手を交わし、タラップを下りて次の街へ向かった。",
          {
            job: 0,
            lifeAffiliation: {
              id: "rhodes-staff",
              title: "ロドス・アイランド",
              action: "leave",
              note: "勤務終了、職場を移る"
            },
            lifeGoal: { id: "rhodes-work", action: "abandon", note: "別の仕事へ進むため退職" },
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_rhodes_former_worker",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      need: ["ロドスでの勤務経験あり"],
      cd: 10,
      w: 0.17,
      t: "今の職場で、ロドスにいた頃に扱っていたのとよく似た型の機械や薬品箱を見かけた。隣で困っていた同僚から使い方を尋ねられ、昔の記憶をたぐり寄せた。",
      c: [
        $terraData.K("自分が昔扱っていた範囲だけ教え、無理には手を出さない", {}, [
          1,
          "覚えている安全弁の位置だけを指さして教え、型番が違う部分には触れず専門の技師を呼んでもらった。昔の勘がまだ指先に残っていた。",
          { k: 1, rl: 1 }
        ]),
        $terraData.K("同僚と一緒に蓋を開け、昔のやり方と何が違うか確かめる", {}, [
          1,
          "二人で工具を手に取り、ロドスでのやり方と今の現場の手順を比べながら無事に動かしてみせた。仕事帰りに同僚から熱い飲み物をおごられた。",
          { k: 1, p: 1 }
        ]),
        $terraData.K("昔の職場のことは持ち出さず、今の持ち場に専念する", {}, [
          1,
          "詳しい先輩を取り次ぐだけにして、自分は今の作業へ戻った。過去の肩書きに頼らず、今の現場のやり方に馴染もうと思った。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "sr_reunion_neighbour_contact",
      conf: "S",
      references: ["SRC_SR_REUNION_SPLIT", "SRC_SR_REUNION_LATER", "SRC_SR_GAME_MODEL"],
      st: ["青年", "壮年", "老年"],
      ge: { year: 1097, age: 18 },
      le: { year: 1105 },
      w: 0.14,
      once: true,
      show: s =>
        ["ウルサス", "龍門", "ヴィクトリア", "カズデル"].includes(s.res.n) &&
        !["active", "crisis"].includes($terraData.srAffiliationStatus(s, "reunion-reorg")) &&
        !s.fl?.detained,
      t: "旅先で立ち寄った宿の裏手で、レユニオンの事情に通じた人物から声をかけられた。近くの路地で暮らす感染者の一家に薬包を届けてほしいという。渡された紙切れの番地は少し古いらしく、相手もまだそこに住んでいるか確信がないようだった。",
      c: [
        $terraData.K("一度きりという約束で、その家へ薬包を届ける", {}, [
          1,
          "教えられた路地裏の戸を叩き、出てきた家人に薬包を手渡した。相手は中身を確かめると、警戒を解いて深く頭を下げた。名前は名乗らず、そのまま元の通りへ引き返した。",
          {
            regionalImpact: {
              entity: "近隣の感染者世帯",
              kind: "one-time-local-aid",
              description: "紹介を通じて感染者世帯へ物資を一度だけ届けた。"
            },
            p: 1,
            rl: 1
          }
        ]),
        $terraData.K(
          "連絡網をまとめている人物に会い、どういう集まりなのか確かめる",
          {},
          [
            0.28,
            "紹介された世話役に会うと、ナインたちの再編レユニオンと連絡を取り合いながら各地の感染者へ薬を回していると打ち明けられた。その場で頼まれ、まずは近隣の届け先を確かめる手伝いから加わることになった。",
            {
              lifeAffiliation: {
                id: "reunion-reorg",
                title: "再編後レユニオンに連なる互助連絡網",
                kind: "local-relief-network",
                action: "join",
                role: "受け渡し先の連絡係",
                note: "現地連絡者の紹介で地域の支援連絡網に参加"
              },
              p: 1,
              rl: 2
            }
          ],
          [
            1,
            "教えられた場所を訪ねたが、すでに世話役は立ち去ったあとで誰にも会えなかった。代わりに、感染者も診てくれる町の小さな施療院の場所を聞き出して帰った。",
            { p: -1, k: 1 }
          ]
        ),
        $terraData.K("深入りはせず、自分の仕事と暮らしを優先する", {}, [
          1,
          "見知らぬ運び仕事には手を出さず、丁重に断ってその場を離れた。夜は自分の部屋へ戻り、明日の仕事の支度をして眠った。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "sr_reunion_ordinary_followup",
      conf: "S",
      references: ["SRC_SR_REUNION_SPLIT", "SRC_REUNION_HISTORY", "SRC_SR_GAME_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["1097年以後の再編レユニオン互助網に連絡中"],
      cd: 5,
      w: 0.3,
      t: "薬の配給を心待ちにしている家族から、次の便はいつ届くのかと尋ねる伝言が回ってきた。しかし以前使っていた連絡場所はすでに畳まれ、荷を取りまとめる世話役も別の人に替わっていた。",
      c: [
        $terraData.K("引っ越した世帯や新しい中継先を回り、連絡網をつなぎ直す", {}, [
          1,
          "自分の足で路地を回って空き家になった届け先を消し、今すぐ薬が要る世帯だけを新しい世話役へつないだ。留守だった家には、隣人に頼んで言伝を残した。",
          {
            lifeAffiliation: {
              id: "reunion-reorg",
              title: "再編後レユニオンに連なる互助連絡網",
              action: "role",
              role: "連絡先・配達記録"
            },
            k: 1,
            rl: 1
          }
        ]),
        $terraData.K("武装した一団とは距離を置き、ご近所の薬配りだけを続ける", {}, [
          1,
          "外から来る武装部隊とのやり取りはきっぱり断り、町の世話役と一緒に近所の病人へ薬を分ける仕事だけを守った。",
          {
            lifeAffiliation: {
              id: "reunion-reorg",
              title: "再編後レユニオンに連なる互助連絡網",
              action: "role",
              role: "地域の非武装支援"
            },
            p: 1
          }
        ]),
        $terraData.K("運び手の役目を次の人へ引き継ぎ、連絡網から退く", {}, [
          1,
          "これまで回っていた家の道順を後任の若者へ教え、連絡網の手伝いを終えた。最後の薬包を届け終えた帰り道、夕暮れの風が少しだけ軽く感じられた。",
          {
            lifeAffiliation: {
              id: "reunion-reorg",
              title: "再編後レユニオンに連なる互助連絡網",
              action: "leave",
              note: "地域の仕事へ戻る"
            },
            lifeGoal: {
              id: "reunion-relief", title: "身近な感染者へ薬と食料を届ける",
              action: "abandon", note: "配達の道順を後任へ引き継ぎ、連絡網の役目を終えた"
            },
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_chernobog_distant_news",
      conf: "S",
      references: ["SRC_TL_MIDDLE", "SRC_SR_GAME_MODEL"],
      st: ["少年", "青年", "壮年", "老年"],
      need: ["国:ウルサス", "事件:chernobog_incident"],
      ban: ["都市:チェルノボーグ"],
      ge: { year: 1096 },
      le: { year: 1100 },
      once: true,
      w: 0.32,
      t: "遠く離れたチェルノボーグで大きな暴動と天災が起きたという知らせが、街じゅうを駆け巡った。その日を境に定期便の荷が滞り、街道の検問も厳しくなって、職場の段取りまで狂いはじめた。",
      c: [
        $terraData.K("荷の遅れを見越して取引先に頭を下げ、手元の在庫でやりくりする", {}, [
          1,
          "届かない資材の代わりに手元の在庫をかき集め、納期の遅れを取引先へ詫びて回った。しばらくは気の休まらない日々が続いた。",
          { k: 1, p: -1 }
        ]),
        $terraData.K("チェルノボーグ方面にいる知人や親戚の安否を尋ね歩く", {}, [
          1,
          "あちらの街へ行ったきり連絡のない知人の消息を、避難民や運び屋の集まる酒場で尋ねて回った。確かなことは分からず、無事を祈って伝言だけを託した。",
          { rl: 1, p: -1 }
        ]),
        $terraData.K("検問の立つ大通りを避け、自分の生活圏を守ることに集中する", {}, [
          1,
          "兵士の増えた表通りや噂話の飛び交う広場には近づかず、開いている市場と仕事場だけを往復して静かに暮らした。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_posting_review",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      need: ["ロドス職員として活動中"],
      pri: true,
      after: { id: "sr_rhodes_hiring_review", min: 1, max: 2 },
      cd: 1,
      w: 2.0,
      show: s =>
        $terraData.srOnStaff(s) &&
        !$terraData.srRhodesPost(s, "本艦") &&
        !$terraData.srRhodesPost(s, "地域支部"),
      t: "ロドスに入って最初の配属面談が呼ばれた。移動し続ける本艦の船内宿舎に部屋をもらうか、それとも今暮らしている国の地上支部へ通うかを選べるという。どちらにするかで、これからの暮らしぶりは大きく変わる。",
      c: [
        $terraData.K("本艦の船内宿舎に入り、船の上を生活の拠点にする", {}, [
          1,
          "荷物をまとめて本艦の船室へ移り住んだ。食堂も職場も同じ鉄の廊下でつながり、地上に残してきた家族や友人とは通信や手紙で近況を伝え合う暮らしが始まった。",
          {
            residenceArrangement: "independent_rental",
            lifeAffiliation: {
              id: "rhodes-staff",
              action: "role",
              role: "本艦・船内居住"
            },
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 1,
              reason: "船内勤務を生活の拠点に選んだ"
            },
            fl: { rhodes_landship: 1, rhodes: 1, household_separated: 1, sch: 0 },
            p: 1
          }
        ]),
        $terraData.K(
          "今暮らしている国の地域支部で働きたいと希望する",
          {
            show: s =>
              [
                "クルビア",
                "ヴィクトリア",
                "ウルサス",
                "龍門",
                "リターニア",
                "サルゴン",
                "イベリア",
                "ボリバル"
              ].includes(s.res?.n)
          },
          [
            0.56,
            "ちょうど現地の地上支部に空きがあり、希望通りに配属が決まった。馴染みのある街の空気を吸いながら、支部の診療所や倉庫へ通う毎日が始まった。",
            {
              lifeAffiliation: {
                id: "rhodes-staff",
                action: "role",
                role: "地域支部・地上拠点勤務"
              },
              groupStanding: {
                id: "rhodes-colleagues",
                title: "ロドスの同僚",
                delta: 1,
                reason: "地域支部での勤務を始めた"
              },
              p: 1
            }
          ],
          [
            1,
            "希望した地上支部は今期の定員が埋まっていた。次の異動時期までは本艦で働くことになり、荷物を抱えて船内の宿舎へ入った。",
            {
              lifeAffiliation: {
                id: "rhodes-staff",
                action: "role",
                role: "本艦・支部希望待ち"
              },
              p: -1
            }
          ]
        ),
        $terraData.K("家の都合がはっきりするまで、ひとまず本艦の仮部屋で様子を見る", {}, [
          1,
          "結論を急がず、当面は本艦の仮宿舎から持ち場へ通うことにした。船内の暮らしに馴染めるか確かめてから、次の面談で正式に決めるつもりだ。",
          {
            lifeAffiliation: {
              id: "rhodes-staff",
              action: "role",
              role: "本艦・配属保留"
            },
            p: 1
          }
        ])
      ]
    },
    {
      id: "sr_rhodes_posting_transfer",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 6,
      w: 0.26,
      show: s => {
        const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-staff"),
          lastPostingChange = affiliation?.lastChangedYear ?? affiliation?.startedYear ?? s.year;
        return (
          $terraData.srOnStaff(s) &&
          $terraData.srRhodesPost(s, "本艦") &&
          s.year - lastPostingChange >= 3 &&
          ["クルビア", "ヴィクトリア", "ウルサス", "龍門", "リターニア", "サルゴン", "イベリア", "ボリバル"].includes(
            s.res?.n
          )
        );
      },
      t: "本艦での船内生活にもすっかり慣れた頃、今航行している国の地上支部に欠員が出たという話が回ってきた。手を挙げれば地上の街で暮らせるようになるが、本艦で気心の知れた仲間たちとは離れることになる。",
      c: [
        $terraData.K("地上支部への異動を願い出て、街での暮らしへ移る", {}, [
          0.56,
          "異動願が通り、本艦を降りて地域支部の勤務へ移った。久しぶりに土の匂いがする街角で借り部屋を探し、現地の診療所や倉庫を支える新しい毎日が始まった。",
          {
            lifeAffiliation: {
              id: "rhodes-staff",
              action: "role",
              role: "地域支部・地上拠点勤務"
            },
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 1,
              reason: "本艦から地域支部へ異動した"
            },
            p: 1
          }
        ], [
          1,
          "タッチの差で支部の欠員は埋まってしまい、異動は見送りになった。また次の機会を待つことにして、見慣れた本艦の廊下へ戻った。",
          {
            lifeAffiliation: {
              id: "rhodes-staff",
              action: "role",
              role: "本艦・支部希望待ち"
            },
            p: -1
          }
        ]),
        $terraData.K("異動は望まず、住み慣れた本艦での仕事を続ける", {}, [
          1,
          "異動願は出さず、エンジン音の響く本艦の居室と今の持ち場にそのまま残ることにした。",
          { p: 1 }
        ]),
        $terraData.K("地上の部屋探しや家の都合を考えて、今回は見送る", {}, [
          1,
          "今すぐ地上へ引っ越すのは負担が大きいと考え、今回の募集は見送った。次の機会が来るまでは本艦で働き続けることにした。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_branch_transfer",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 6,
      w: 0.24,
      show: s => {
        const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-staff"),
          lastPostingChange = affiliation?.lastChangedYear ?? affiliation?.startedYear ?? s.year;
        return (
          $terraData.srOnStaff(s) &&
          $terraData.srRhodesPost(s, "地域支部") &&
          s.year - lastPostingChange >= 3
        );
      },
      t: "地域の地上支部で働き続けるうち、本艦へ移るスタッフを募る通達が届いた。本艦へ乗り込めば設備の整った環境で働けるが、この街で築いた馴染みの暮らしからは離れることになる。",
      c: [
        $terraData.K("本艦への異動を希望し、船内での暮らしへ移る", {}, [
          0.48,
          "異動が認められ、街の部屋を引き払って本艦の船室へ移ることになった。支部の仲間に別れを告げ、大きな荷鞄を提げて連絡艇に乗り込んだ。",
          {
            lifeAffiliation: {
              id: "rhodes-staff",
              action: "role",
              role: "本艦・船内居住"
            },
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 1,
              reason: "地域支部から本艦へ異動した"
            },
            p: 1
          }
        ], [
          1,
          "今回の本艦枠はすでに埋まり、異動は叶わなかった。落胆はあったものの、翌朝にはまた馴染みの支部の扉を開けた。",
          { p: -1 }
        ]),
        $terraData.K("異動はせず、今の街と支部での仕事を続ける", {}, [
          1,
          "通達には手を挙げず、顔なじみの患者やスタッフがいる今の地上支部で働き続けることにした。",
          { p: 1 }
        ]),
        $terraData.K("仕事の引き継ぎや家の都合を考え、次の機会まで見送る", {}, [
          1,
          "今はまだ抱えている仕事や家の用事が離れがたく、今回の異動は見送ることにした。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_ship_routine",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.52,
      show: s => $terraData.srOnStaff(s) && $terraData.srRhodesPost(s, "本艦"),
      t: "天災を避けるため本艦の進路が急に変更され、船内の食堂が開く時間も勤務の交代もすべて組み替わった。揺れの強い下部区画では、棚の木箱をベルトで縛り直す音が夜遅くまで響いていた。",
      c: [
        $terraData.K("同僚と声をかけ合い、ずれた交代時間を調整する", {}, [
          1,
          "船酔いで辛そうな同僚の分まで前半の番を引き受け、翌日のシフトを組み直した。遅い夕食を食堂でかき込み、心地よい疲労とともにベッドへ潜り込んだ。",
          {
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 1,
              reason: "航路変更後の勤務表を同僚と調整"
            },
            p: 1
          }
        ]),
        $terraData.K("自室の荷物をしっかり固定し、揺れが収まるまで横になる", {}, [
          1,
          "机の上のコップや本が落ちないよう片づけ、毛布にくるまって目を閉じた。次の当番が来る頃には船体のきしみも収まり、すっきりした頭で廊下へ出られた。",
          { h: 2, p: 1 }
        ]),
        $terraData.K("地上にいる家族へ無事を知らせる短い通信を送る", {}, [
          1,
          "通信室が空く時間を待って、航路が変わったことと自分の無事を知らせる短い電文を打った。",
          { p: 1, rl: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_branch_routine",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.44,
      show: s => $terraData.srOnStaff(s) && $terraData.srRhodesPost(s, "地域支部"),
      t: "地域の地上支部に、定期便の医療物資がまとめて運び込まれた。ところが待合室の予約数と倉庫の在庫が食い違っており、それぞれの持ち場で急いで中身を確かめることになった。",
      c: [
        $terraData.K(
          "届いた木箱を開け、診療室と倉庫へ振り分ける",
          { show: s => s.job === $terraData.SR_JOBS.service },
          [
            1,
            "今日すぐ使う薬を先に診療室へ運び込み、残りを倉庫の棚へ収めた。数が足りなかった包帯と消毒薬は、次の定期便で多めに送るよう手配した。",
            {
              lifeSkill: {
                id: "rhodes-supply",
                title: "物資と生活支援の実務",
                delta: 3,
                context: "地域支部への納品と受領記録"
              },
              k: 1
            }
          ]
        ),
        $terraData.K(
          "薬品を冷やす保冷庫の温度と電源を点検する",
          { show: s => s.job === $terraData.SR_JOBS.maintenance },
          [
            1,
            "長旅で揺られてきた保冷箱の電源と冷却器を一つずつ調べ、冷えの甘い一箱を見つけて医療班へ知らせた。大事な薬が駄目になる前に手を打ててほっとした。",
            {
              lifeSkill: {
                id: "rhodes-maintenance",
                title: "動力設備と生活機器の点検",
                delta: 3,
                context: "医療品保管箱の温度・電源点検"
              },
              k: 1
            }
          ]
        ),
        $terraData.K(
          "患者のカルテと処方予定を突き合わせ、抜けを確かめる",
          { show: s => s.job === $terraData.SR_JOBS.research },
          [
            1,
            "今週診察に来る患者のカルテをめくり、必要な薬の量に間違いがないか医師と一緒に確かめた。研究用の集計は後回しにして、目の前の診療を支えた。",
            {
              lifeSkill: {
                id: "clinical-records",
                title: "医療記録の整理と取り扱い",
                delta: 3,
                context: "支部での診療記録確認"
              },
              k: 1
            }
          ]
        ),
        $terraData.K(
          "遅れている残りの荷がどこを走っているか突き止める",
          { show: s => s.job === $terraData.SR_JOBS.transporter },
          [
            1,
            "中継地の連絡員と無線をつなぎ、検問で足止めされていた後続便の到着時刻を割り出した。待っていた診療所へすぐに知らせを走らせた。",
            {
              lifeSkill: {
                id: "rhodes-transport",
                title: "連絡便の経路・荷札・受領記録",
                delta: 3,
                context: "地域支部へ届く連絡便の調整"
              },
              k: 1
            }
          ]
        ),
        $terraData.K(
          "搬入口の混雑をさばき、受診に来た患者の通り道を空ける",
          { show: s => s.job === $terraData.SR_JOBS.field },
          [
            1,
            "木箱を担いだ運び手と杖をついた患者がぶつからないよう、入り口に立って誘導した。小さな気配りだったが、受付の職員から助かったと声をかけられた。",
            { rl: 1, p: 1 }
          ]
        ),
        $terraData.K(
          "混乱する受付を手伝い、順番待ちの患者を案内する",
          { show: s => s.job === $terraData.SR_JOBS.reserve },
          [
            1,
            "重なってしまった受付番号を整理し、待合室のベンチで不安そうにしていた患者へ順番を説明して回った。ざわついていたロビーが少しずつ落ち着きを取り戻した。",
            {
              lifeSkill: {
                id: "rhodes-reserve",
                title: "隊内連絡・事務手順・基礎訓練",
                delta: 3,
                context: "地域支部の受付・案内資料整理"
              },
              k: 1
            }
          ]
        )
      ]
    },
    {
      id: "sr_rhodes_field_assignment",
      conf: "S",
      references: [...$terraData.SR_SRC, "SRC_SR_RHODES_FIELD"],
      st: ["青年", "壮年"],
      cd: 5,
      w: 0.38,
      show: s => $terraData.srOnStaff(s) && s.job === $terraData.SR_JOBS.field,
      t: "僻地の臨時診療所へ医療物資を届ける外勤班に組み込まれた。出発前のブリーフィングで、隊長が撤退の合図と行動範囲を厳しく確認する。現地周辺では住民の避難も始まっており、道中がどうなるかは誰にも読めなかった。",
      c: [
        $terraData.K("通信兵と息を合わせ、安全が確かめられたルートで荷を運び切る", {}, [
          0.82,
          "通信兵と絶えず連絡を取り合いながら、瓦礫の少ないルートを選んで薬箱を運び切った。診療所の医師に荷を引き渡し、泥だらけのブーツで帰還の輸送車へ乗り込んだ。",
          {
            lifeSkill: {
              id: "rhodes-field",
              title: "外勤の装備確認と行動訓練",
              delta: 4,
              context: "連絡担当と行う現地物資搬送"
            },
            h: -2,
            k: 1
          }
        ], [
          1,
          "前方の橋が崩れて道が塞がり、隊長の判断でやむなく引き返した。届けられなかった薬箱を荷台から下ろしながら、悔しさが胸に残った。",
          { h: 1, p: -1 }
        ]),
        $terraData.K("荷運びは後続の車に任せ、立ち往生していた住民の誘導に回る", {}, [
          1,
          "道端で途方に暮れていた家族連れに手を貸し、安全な避難所まで付き添った。物資の到着は少し遅れたが、現地の医療班もその判断を支持してくれた。",
          { rl: 2, h: -1 }
        ]),
        $terraData.K("天候と足場の悪化をいち早く見抜き、隊長へ撤収を進言する", {}, [
          1,
          "嫌な風向きと足元の崩れに気づき、深入りする前に隊長へ撤収を具申した。無理をせず引き返したおかげで、班から一人の怪我人も出さずに済んだ。",
          { p: 1, h: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_transport_dispatch",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.52,
      show: s => $terraData.srOnStaff(s) && s.job === $terraData.SR_JOBS.transporter,
      t: "連絡便のエンジンをかける直前、最新の天災警報が入って予定していた幹線道路が封鎖された。届け先の支部と連絡を取ろうにも通信が混線しており、すぐに出発すべきか判断を迫られた。",
      c: [
        $terraData.K("運行管理室へ駆け込み、通れる迂回路を割り出してもらう", {}, [
          1,
          "運行管理室の地図を広げて安全な脇道を確かめ、許可が下りるまで荷台の積み荷に防水シートをかけ直した。焦らず手順を踏んだことで、結果的に無駄足を踏まずに済んだ。",
          {
            lifeSkill: {
              id: "rhodes-transport",
              title: "連絡便の経路・荷札・受領記録",
              delta: 4,
              context: "天災予報の更新後に経路を照会"
            },
            k: 1
          }
        ]),
        $terraData.K("届け先の支部に遅れの一報を入れ、受け取りの時間をずらしてもらう", {}, [
          1,
          "雑音だらけの無線で先方の担当者とつながり、到着が夜になることを伝えて受け取りの手配を頼んだ。先方も事情をわかってくれ、落ち着いてハンドルを握ることができた。",
          { rl: 1, p: 1 }
        ]),
        $terraData.K("無理な運行は控え、空模様が落ち着くまで待機する", {}, [
          1,
          "天災の端にかかる危険を冒さず、今日の出発を見合わせる決断を下した。急ぎの薬ではなかったものの、倉庫に積まれたままの荷箱を見ると少し気が重かった。",
          { p: -1, h: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_reserve_drill",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.56,
      show: s => $terraData.srOnStaff(s) && s.job === $terraData.SR_JOBS.reserve,
      t: "昼間の事務作業を終えると、行動予備隊の訓練時間がやってきた。今日の教練場は、非常時の避難誘導と護身術の反復練習で熱気に満ちている。",
      c: [
        $terraData.K("教官の号令に食らいつき、避難誘導と護身の動きを身体に染み込ませる", {}, [
          1,
          "笛の合図に合わせて声を張り上げ、パニックを想定した訓練生たちを出口へ誘導した。汗びっしょりになって防具を外すと、心地よい達成感があった。",
          {
            lifeSkill: {
              id: "rhodes-reserve",
              title: "隊内連絡・事務手順・基礎訓練",
              delta: 4,
              context: "避難誘導と基礎的な自衛訓練"
            },
            h: -1,
            k: 1
          }
        ]),
        $terraData.K("今日は裏方に回り、訓練用具の整備とタイム計測を受け持つ", {}, [
          1,
          "少し疲れがたまっていたため実技は控え、コートの脇で防具の点検と計測を手伝った。外から仲間の動きを見ることで、自分の癖にも気づくことができた。",
          { k: 1, p: 1 }
        ]),
        $terraData.K("訓練の後、外勤オペレーターへ進むには何が要るか教官に尋ねる", {}, [
          1,
          "片付けを手伝いながら、外勤の本選考へ進むための基準を教官に詳しく聞いた。今の自分にあと何が足りないのか、具体的な目標が見えてきた。",
          { k: 2 }
        ])
      ]
    },
    {
      id: "sr_rhodes_colleague_introduction",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.5,
      show: s =>
        $terraData.srOnStaff(s) &&
        !(s.personTies?.rhodesColleagues ||
          (s.personTies?.rhodesColleague ? [s.personTies.rhodesColleague] : [])).some(
          person => person.actualStatus === "working"
        ) &&
        ["active", "crisis"].includes($terraData.srAffiliationStatus(s, "rhodes-staff")),
      t: "同じ部署で何度か顔を合わせていた同僚と、食堂の休憩時間が一緒になった。コーヒーを片手に声をかけてみるか、それとも今日はひとりで静かに休むか考えた。",
      c: [
        $terraData.K("同じテーブルに座り、次のシフトの段取りや出身地の話をする", {}, [
          0.84,
          "向かいの席に腰を下ろし、次の当番で気をつけることや前の職場の話を交わした。笑うツボが似ていることが分かり、廊下ですれ違うときも自然と声が出る仲になった。",
          {
            personTieAction: { kind: "rhodes", action: "introduced" },
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 1,
              reason: "同僚と当番の手順を確かめた"
            },
            rl: 1
          }
        ], [
          1,
          "声をかけようとした矢先、相手の呼び出しベルが鳴って慌ただしく席を立っていった。軽く会釈を交わし、また次の機会に話すことにした。",
          { k: 1 }
        ]),
        $terraData.K("軽い会釈だけ交わし、壁の連絡ボードで午後の予定を確かめる", {}, [
          1,
          "無理に話しかけず、カップを片手に壁の連絡ボードを眺めた。打ち解けるのは、もう少し仕事に慣れてからでも遅くはない。",
          { k: 1 }
        ]),
        $terraData.K("食堂の隅の席で、ひとりの時間をゆっくり過ごす", {}, [
          1,
          "窓際の静かな席を選び、温かい飲み物を飲みながら凝った肩を回した。ひとりで息を抜いたおかげで、午後の仕事にも集中できた。",
          { h: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_colleague_followup",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.62,
      show: s =>
        $terraData.srOnStaff(s) &&
        !!s.personTies?.rhodesColleague &&
        s.personTies.rhodesColleague.actualStatus === "working",
      t: "前に休憩室で話し込んだ同僚と、また同じシフトに入ることになった。山積みの作業を前に、どうやって片づけていくか目を合わせた。",
      c: [
        $terraData.K("得意な作業を分け合い、終わった分から声を掛け合って進める", {}, [
          1,
          "「そっちは任せた」と手分けして取りかかり、倍の速さで山積みの仕事を片づけた。引き継ぎまで綺麗に終わり、帰りに食堂で乾杯した。",
          {
            personTieAction: { kind: "rhodes", action: "shared-work" },
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 1,
              reason: "同僚と作業を分担し、引継ぎを確認"
            },
            rl: 1,
            p: 1
          }
        ]),
        $terraData.K("おしゃべりは控えめにし、仕事に必要な連絡だけをきびきび交わす", {}, [
          1,
          "馴れ合いにならないよう必要な確認だけを短く交わし、それぞれの持ち場を黙々とこなした。程よい距離感がかえって心地よかった。",
          { personTieAction: { kind: "rhodes", action: "respect-boundary" } }
        ]),
        $terraData.K("今日は自分のペースで受け持ち分を先に片づける", {}, [
          1,
          "自分の受け持ち分を集中して先に終わらせ、道具を片づけてから同僚に声をかけて上がった。",
          { p: 0 }
        ])
      ]
    },
    {
      id: "sr_rhodes_promotion_review",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.45,
      ge: { year: 1095, age: 20 },
      show: s => $terraData.srOnStaff(s) && (s.workPayBonus || 0) < 0.25,
      t: "ロドスでの勤務実績が評価され、人事担当者と所属部門の責任者から面談に呼ばれた。これまでの働きぶりが認められ、責任ある上位役職や指導的立場への昇格を打診された。",
      c: [
        $terraData.K("推薦を受け入れ、現場主任・リーダー職への昇進を引き受ける", {}, [
          1,
          "責任の重さに身の引き締まる思いを抱きながら、昇進の内示書に署名した。手当が増額され、後輩たちの指導や業務の総括を任されることになった。",
          {
            payBonus: 0.25,
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 2,
              reason: "現場主任・リーダー職へ昇進した"
            },
            lifeAffiliation: {
              id: "rhodes-staff",
              title: "ロドス・アイランド",
              action: "role",
              role: "現場主任・業務統括",
              preserveRhodesPost: true
            },
            p: 2,
            k: 2
          }
        ]),
        $terraData.K(
          "行動予備隊での訓練と実績を活かし、正規外勤オペレーターへの昇格を志願する",
          { show: s => s.job === $terraData.SR_JOBS.reserve || (s.h >= 60 && s.k >= 22) },
          [
            1,
            "実技試験と教官陣の推薦をクリアし、晴れて正規の外勤オペレーターとして辞令を受けた。過酷な前線への出撃が待っているが、確かな誇りと高待遇を手に入れた。",
            {
              job: $terraData.SR_JOBS.field,
              payBonus: 0.2,
              groupStanding: {
                id: "rhodes-colleagues",
                title: "ロドスの同僚",
                delta: 2,
                reason: "正規外勤オペレーターへ昇格した"
              },
              lifeAffiliation: {
                id: "rhodes-staff",
                title: "ロドス・アイランド",
                action: "role",
                role: "正規外勤オペレーター",
                preserveRhodesPost: true
              },
              p: 2,
              cr: 1
            }
          ]
        ),
        $terraData.K("管理職よりも実務を極めたいと伝え、専門スペシャリストとしての待遇向上を望む", {}, [
          1,
          "「現場の第一線で腕を振るいたい」という希望を伝え、役職名ではなく技術・実務の専任手当を支給されることになった。同僚たちも自分のこだわりを温かく支持してくれた。",
          {
            payBonus: 0.2,
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 1,
              reason: "職人気質の働きぶりが認められた"
            },
            lifeAffiliation: {
              id: "rhodes-staff",
              title: "ロドス・アイランド",
              action: "role",
              role: "専門技能指導員",
              preserveRhodesPost: true
            },
            k: 3,
            p: 1
          }
        ]),
        $terraData.K("今は現在の担当範囲を無理なく維持したいと伝え、現状維持を願い出る", {}, [
          1,
          "責任の重い役職は固辞し、慣れ親しんだ今の持ち場をマイペースに続けることを選んだ。上司も納得し、変わらぬ笑顔で送り出してくれた。",
          { p: 1, h: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_cafeteria_flavors",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.4,
      ge: { year: 1095 },
      show: s => $terraData.srOnStaff(s),
      t: "昼休みのロドス食堂は、テラ各地の文化が入り混じった独特の熱気に包まれていた。日替わりの郷土料理カウンターには長蛇の列ができ、隣の医務カウンターでは医療部推奨の栄養補助ドリンクが配られている。",
      c: [
        $terraData.K("各国のオペレーターが腕を振るう日替わり郷土料理の列に並ぶ", {}, [
          1,
          "ヒガシの温かい麺類や炎国の激辛鍋、カジミエーシュの菓子パンが並ぶテーブルで同僚たちと舌鼓を打った。故郷の味や異国の話で盛り上がり、午後の活力となった。",
          { p: 2, rl: 1 }
        ]),
        $terraData.K("医療部が配給する「免疫強化・滋養強壮特製野菜ジュース（激苦）」を一気に飲み干す", {}, [
          1,
          "顔が歪むほどの凄まじい苦味と独特の漢方臭に思わず悶絶したが、胃の腑の底から力が湧いてくるのを感じた。当番の医師が満足そうに頷いていた。",
          { h: 2, p: -1, k: 1 }
        ]),
        $terraData.K("艦内購買部に顔を出し、クロージャが仕入れた珍しい携帯食料や日用品を物色する", {}, [
          1,
          "「毎度あり！いい出物が入ってるよ！」という店主の元気な声に迎えられ、遠征用の便利ツールや珍しい菓子を買い込んだ。艦内生活のいい気晴らしになった。",
          { cash: -2000, p: 2 }
        ])
      ]
    },
    {
      id: "sr_rhodes_greenhouse_rest",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.4,
      ge: { year: 1095 },
      show: s => $terraData.srOnStaff(s),
      t: "非番の午後、本艦の居住区上層にある温室・植物園へ足を運んだ。乾いた荒野の風から遮断されたガラスドームの中には豊かな緑と花々が咲き誇り、土の優しい匂いが漂っている。",
      c: [
        $terraData.K("木陰のベンチで花の香りに包まれながら静かにまどろむ", {}, [
          1,
          "柔らかな光とハーブの香りに包まれ、日頃の緊張が解けて深い眠りに落ちた。目が覚めると驚くほど頭がすっきりと冴え渡っていた。",
          { h: 2, p: 2 }
        ]),
        $terraData.K("園芸の手入れをしている職員を手伝い、薬草や花の手入れを手伝う", {}, [
          1,
          "剪定ばさみを手に苗木の手入れや水やりを手伝った。「植物は手をかけた分だけ素直に応えてくれます」と穏やかな笑顔で教わり、心温まる時間を過ごした。",
          {
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 1,
              reason: "温室の手入れを手伝った"
            },
            k: 2,
            p: 1
          }
        ]),
        $terraData.K("展望デッキへ進み、移動都市の彼方に広がる雄大な大地と夕日を眺める", {}, [
          1,
          "沈みゆく夕日に照らされる広大な荒野と、その上を静かに進むロドスの巨大な艦影を見つめた。過酷な世界でこの船が目指す希望の意味を、静かに噛み締めた。",
          { p: 2 }
        ])
      ]
    },
    {
      id: "sr_rhodes_internal_bias_conflict",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.5,
      ge: { year: 1095 },
      show: s => $terraData.srOnStaff(s) && !s.inf && (s.biasInfected || 0) >= 35,
      t: "生活のためにロドスで働き始めたものの、船内で当たり前のように感染者と非感染者が肩を並べて笑い合い、同じ食器を使い、素手で触れ合う光景に強い違和感と恐怖が拭えない。自分自身の中に染みついた「感染者への嫌悪と警戒」が、ふとした瞬間に頭をもたげてしまう。",
      c: [
        $terraData.K("恐怖を隠せず、感染者の同僚が触れた機材をアルコールで入念に消毒して距離を置く", {}, [
          1,
          "同僚が席を外した瞬間に念入りに拭き清める姿を見咎められ、気まずい沈黙が流れた。相手は傷ついたように目を伏せて去っていき、胸に苦い後味だけが残った。",
          {
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: -1,
              reason: "感染者への露骨な警戒態度"
            },
            p: -1
          }
        ]),
        $terraData.K("違和感を押し殺しながら、彼らがどのように生き、何を考えているのか静かに観察する", {}, [
          1,
          "鉱石病の痛みに耐えながら懸命に働き、誰かのために命を削る同僚たちの日常を静かに見つめた。ただの「危険な病原体」ではなく、自分と同じ生身の人間なのだと少しずつ気づかされた。",
          { biasInf: -25, p: 0, k: 1 }
        ]),
        $terraData.K("医療部が開いている「鉱石病基礎衛生講習」に参加し、感染のメカニズムを正しく学ぶ", {}, [
          1,
          "「通常の接触や会話、汗や涙で感染することはありません」という医師の論理的な講義を受け、迷信や恐怖心に惑わされていた自分を恥じた。正しい知識が、無知から来る恐怖を打ち消してくれた。",
          { biasInf: -40, k: 2, p: 1 }
        ])
      ]
    },
    {
      id: "sr_rhodes_bias_rescue_reconciliation",
      conf: "S",
      references: $terraData.SR_SRC,
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.45,
      ge: { year: 1095 },
      show: s => $terraData.srOnStaff(s) && !s.inf && (s.biasInfected || 0) >= 30,
      t: "格納庫での資材搬入中、天災の余波による突風で高段の重量コンテナが崩落した。退路を塞がれ、巨大な鉄骨の下敷きになりかけたその瞬間、黒い結晶が肌に浮き出た感染者の同僚が迷わず飛び込んできた。",
      c: [
        $terraData.K("身を挺して鉄骨を押し上げ救い出してくれた同僚の手を握り締め、心から感謝と謝罪を伝える", {}, [
          1,
          "崩れ落ちるコンテナを源石アーツと全身の力で受け止め、自分を瓦礫の外へと突き飛ばしてくれた。擦り傷を負いながら「怪我はありませんか？」と気遣う同僚の手には、黒く輝く源石結晶があった。これまでの愚かな偏見を心から詫び、涙とともにその手を固く握りしめた。",
          {
            biasInf: -100,
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 3,
              reason: "命を救われ、偏見を乗り越えて真の仲間となった"
            },
            p: 3,
            rl: 2
          }
        ]),
        $terraData.K("救助された後、医務室へ付き添って手当てを手伝い、温かい茶を淹れて語り合う", {}, [
          1,
          "咄嗟の救助で負傷した同僚に付き添い、医務室で包帯を巻く手伝いをした。湯気の立つお茶を差し出しながらこれまでの生い立ちを語り合い、互いにかけがえのない戦友として認め合った。",
          {
            biasInf: -80,
            groupStanding: {
              id: "rhodes-colleagues",
              title: "ロドスの同僚",
              delta: 2,
              reason: "危難を共に乗り越え、深い信頼関係を築いた"
            },
            p: 2,
            k: 1
          }
        ]),
        $terraData.K("命を救われた衝撃に震えながら、自分の命の恩人が「最も忌み嫌っていた存在」だった事実を深く噛み締める", {}, [
          1,
          "「なぜ自分のような者を助けたのか」という問いに、同僚は「ロドスの仲間だからです」と事も無げに答えた。自分の狭量さと世界の深さに打ちのめされ、内なる偏見は音を立てて崩れ去った。",
          { biasInf: -80, p: 2 }
        ])
      ]
    }
  ];
  for (const event of events) for (const choice of event.c || []) for (const outcome of choice.o || []) {
    const a=outcome[2]?.lifeAffiliation;
    if (a?.id === "rhodes-staff" && /^(本艦|地域支部)/.test(a.role || "")) {
      a.bindAt="destination";
      a.rebindPosting=true;
    }
  }
  return events;
});
