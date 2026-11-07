// extensions/social-and-care/infected-organizations: construction fragment; evaluation order is declared by data/extensions/social-and-care.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/infected-organizations"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $terraData.EV.push({
    id: "life_infected_association_choice",
    conf: "S",
    references: ["SRC_TERRA_SOCIAL_ATTITUDES", "SRC_ORIPATHY_SOCIAL"],
    st: ["青年", "壮年"],
    need: ["成人", "感染者への世間圧力が強い"],
    once: true,
    w: 0.18,
    t: "通りの商店の軒先に「感染者入店お断り」の木札が掲げられるようになり、町内の寄り合いでも感染者を職場や借家から締め出そうという声が勢いを増していた。会場を借りて本格的な会を立ち上げる話が持ち上がり、どう振る舞うか問われた。",
    c: [
      $terraData.K(
        "感染者を街区から締め出す住民会を立ち上げる（会場・連絡費5,000龍門幣）",
        {
          en: s => $rules.economy.availableFunds(s) >= 5000 + $rules.economy.annualReserve(s),
          why: "会場・連絡費を支払い、生活予備費を残せない"
        },
        [
          0.55,
          "集会を主催し、感染者の立ち入りと雇用を拒む申し合わせを街区中に広めた。通りの店には次々と断り札が貼られ、感染者の求職者を門前払いする工場も増えた。",
          {
            lifeAffiliation: {
              id: "infected-exclusion",
              title: "感染者排除を求める住民会",
              kind: "political-local-group",
              action: "join",
              role: "立上げ人"
            },
            lifeOrganization: {
              id: "infected-exclusion",
              title: "感染者排除を求める住民会",
              kind: "political-local-group",
              action: "found",
              amount: 5000,
              policy: "感染者の立入・雇用制限",
              participation: "設立者"
            },
            groupStandings: [
              {
                id: "noninfected-residents",
                title: "非感染者の住民",
                delta: 5,
                reason: "感染者排除の申し合わせを主導"
              },
              {
                id: "infected-families",
                title: "地域の感染者と家族",
                delta: -8,
                reason: "立入・雇用制限を求めた"
              }
            ],
            regionalImpact: {
              entity: "地域の商店と居住区",
              kind: "exclusion-policy",
              description: "感染者の立入・雇用を制限する申し合わせが広がった"
            },
            lifeGoal: {
              id: "order-through-exclusion",
              title: "感染者を遠ざけて地域の秩序を守る",
              priority: "秩序",
              action: "start"
            },
            socialConflictAction: {
              action: "exclude",
              target: "infected",
              context: "founded-exclusion-association"
            },
            cash: -5000,
            p: 2
          }
        ],
        [
          1,
          "寄り合いで感染者締め出しの申し合わせを提案したが、商店主たちの間で意見が割れ、その場ではまとまらなかった。",
          {
            socialConflictAction: {
              action: "exclude",
              target: "infected",
              context: "attempted-exclusion-association"
            },
            p: -1
          }
        ]
      ),
      $terraData.K(
        "孤立する感染者と家族のため、薬の共同購入と診療連絡の会を立ち上げる（会費5,000龍門幣）",
        {
          en: { le: { biasInfected: 74 } },
          why: "感染者を排除する考えが非常に強く、会費を出す共同支援を主導できない"
        },
        [
          1,
          "出し合える人で金を積み立てて薬や食料を共同で買い入れ、巡回診療の日取りを知らせ合う互助会を作った。外に出れば冷たい木札が並ぶ通りで、ここだけは息をつける場所になった。",
          {
            lifeAffiliation: {
              id: "infected-mutual-aid",
              title: "感染者と家族の共同購入・診療連絡会",
              kind: "mutual-aid-group",
              action: "join",
              role: "世話役"
            },
            lifeOrganization: {
              id: "infected-mutual-aid",
              title: "感染者と家族の共同購入・診療連絡会",
              kind: "mutual-aid-group",
              action: "found",
              amount: 5000,
              policy: "共同購入と診療情報の連絡",
              participation: "世話役"
            },
            groupStandings: [
              {
                id: "infected-families",
                title: "地域の感染者と家族",
                delta: 6,
                reason: "共同購入と診療連絡を始めた"
              },
              {
                id: "noninfected-residents",
                title: "非感染者の住民",
                delta: -2,
                reason: "感染者との共同活動を始めた"
              }
            ],
            regionalImpact: {
              entity: "地域の感染者と家族",
              kind: "mutual-aid",
              description: "共同購入と診療日を知らせる連絡会を作った"
            },
            lifeGoal: {
              id: "infected-mutual-aid",
              title: "感染者と家族が孤立しない支援網を保つ",
              priority: "互助",
              action: "start"
            },
            cash: -5000,
            rl: 2,
            p: 1
          }
        ]
      ),
      $terraData.K("どちらの動きにも関わらず、自分の家の暮らしを守る", {}, [
        1,
          "寄り合いの誘いを断って足早に家へ戻り、普段通りの夕餉の支度に取りかかった。",
        { p: -1 }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_infected_association_review",
    conf: "S",
    references: ["SRC_TERRA_SOCIAL_ATTITUDES", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    any: ["感染者排除運動の主催", "感染者互助組織の主催"],
    cd: 4,
    w: 0.22,
    t: "会を続けていくうちに場所代や物資の手配がかさみ、面倒な雑務もいつも同じ顔ぶれにばかり押しつけられるようになっていた。このまま会を引っ張り続けるか、後任に譲るか考えた。",
    c: [
      $terraData.K("会の方針は変えず、費用と裏方の分担をきっちり割り振り直す", {}, [
        1,
        "誰にばかり負担が偏っているかを集まりで示し、当番と会費の分担を改めて決め直した。",
        {
          lifeOrganization: { id: "infected-current", action: "review", note: "会費と役割を分け直した" },
          groupStanding: {
            id: "local-organizers",
            title: "会合の協力者",
            delta: 2,
            reason: "支出と役割を明らかにした"
          },
          p: 1
        }
      ]),
      $terraData.K("次の世話役に運営を引き継ぎ、自分は一線から退く", {}, [
        1,
        "集会所の鍵と連絡網を次の世話役に託し、自分は会の運営から身を引いた。",
        {
          lifeAffiliations: [
            {
              id: "infected-exclusion",
              title: "感染者排除を求める住民会",
              action: "leave",
              note: "運営を引継ぎ、自分は離れた",
              onlyIfActiveOrCrisis: true
            },
            {
              id: "infected-mutual-aid",
              title: "感染者と家族の共同購入・診療連絡会",
              action: "leave",
              note: "運営を引継ぎ、自分は離れた",
              onlyIfActiveOrCrisis: true
            }
          ],
          lifeGoals: [
            { id: "order-through-exclusion", action: "abandon", onlyIfActive: true,
              note: "会の運営から退き、本人が追っていた活動目標を終了" },
            { id: "infected-mutual-aid", action: "abandon", onlyIfActive: true,
              note: "会の運営から退き、本人が追っていた活動目標を終了" }
          ],
          lifeOrganization: {
            id: "infected-current",
            action: "handover",
            note: "帳簿と運営を後任へ引継ぎ"
          },
          regionalImpact: {
            entity: "地域の会合",
            kind: "succession",
            description: "会費帳簿と連絡役を次の運営者へ引き継いだ"
          },
          p: -1
        }
      ]),
      $terraData.K("仲間のあいだの溝が埋まらず、会そのものを解散する", {}, [
        1,
        "掲示や帳面を誰が引き取るかも決まらないまま、これ以上は一つにまとまれないと認めて解散を告げ、借りていた集会所を引き払った。",
        {
          lifeAffiliations: [
            {
              id: "infected-exclusion",
              title: "感染者排除を求める住民会",
              action: "leave",
              note: "内部分裂を受けて解散",
              onlyIfActiveOrCrisis: true
            },
            {
              id: "infected-mutual-aid",
              title: "感染者と家族の共同購入・診療連絡会",
              action: "leave",
              note: "内部分裂を受けて解散",
              onlyIfActiveOrCrisis: true
            }
          ],
          lifeGoals: [
            { id: "order-through-exclusion", action: "abandon", onlyIfActive: true,
              note: "組織を解散し、本人の活動目標を終了" },
            { id: "infected-mutual-aid", action: "abandon", onlyIfActive: true,
              note: "組織を解散し、本人の活動目標を終了" }
          ],
          lifeOrganization: { id: "infected-current", action: "dissolve", note: "内部分裂を受け解散" },
          p: -2
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_infected_exclusion_consequence",
    conf: "S",
    references: ["SRC_TERRA_SOCIAL_ATTITUDES", "SRC_ORIPATHY_SOCIAL"],
    st: ["青年", "壮年", "老年"],
    need: ["感染者排除団体に所属中"],
    after: { id: "life_infected_association_choice", min: 1 },
    once: true,
    w: 0.28,
    t: "商店の軒先や下宿の入口に「感染者お断り」の札がずらりと並ぶようになった。安心したと喜ぶ住民がいる一方で、部屋を追い出された感染者の家族や常連客からは激しい抗議が届き、どこまで締め出すかで会の中も割れた。",
    c: [
      $terraData.K("抗議には耳を貸さず、隣の街区まで協力店を広げる", {}, [
        1,
        "賛同する店の名前をさらに募り、締め出しの網を隣の街区まで広げた。感染者のいる家族が次々と下宿を追われ、職を失って路頭に迷う姿が見られた。",
        {
          lifeOrganization: {
            id: "infected-exclusion",
            action: "policy",
            policy: "対象地区を広げ、協力店名簿を作成"
          },
          socialConflictAction: {
            action: "exclude",
            target: "infected",
            context: "expanded-exclusion-policy"
          },
          groupStandings: [
            {
              id: "noninfected-residents",
              title: "非感染者の住民",
              delta: 4,
              reason: "排除申し合わせを広げた"
            },
            {
              id: "infected-families",
              title: "地域の感染者と家族",
              delta: -6,
              reason: "居住と雇用の排除が強まった"
            }
          ],
          regionalImpact: {
            entity: "地域商店と下宿",
            kind: "exclusion-expansion",
            description: "感染者の立入りや雇用を拒む協力先が地区内で増えた"
          },
          lifeGoal: {
            id: "order-through-exclusion",
            title: "排除の申し合わせを地域の秩序として定着させる",
            priority: "秩序",
            action: "continue"
          },
          p: 3
        }
      ]),
        $terraData.K("行き過ぎた締め出しを改め、感染していない家族や子どもは除外する", {}, [
        1,
        "家族や子どもまで下宿や店から締め出すのはやめようと規則を改めた。強硬派からは不満が出たが、すでに部屋を追われた家族からは切実な相談が寄せられた。",
        {
          lifeOrganization: {
            id: "infected-current",
            action: "policy",
            policy: "本人の一部店舗に限定し家族と子どもは対象外"
          },
          socialConflictAction: {
            action: "reconsider",
            target: "infected",
            context: "narrowed-exclusion-policy"
          },
          groupStandings: [
            { id: "noninfected-residents", title: "非感染者の住民", delta: -2, reason: "排除範囲を狭めた" },
            {
              id: "infected-families",
              title: "地域の感染者と家族",
              delta: 2,
              reason: "家族への一律排除に反対した"
            }
          ],
          regionalImpact: {
            entity: "地域商店と下宿",
            kind: "exclusion-limitation",
            description: "立入り・雇用を拒む申し合わせの対象範囲を狭めた"
          },
          lifeGoal: {
            id: "order-through-exclusion",
            action: "compromise",
            note: "支持を失っても排除範囲を狭めた"
          },
          p: -1
        }
      ]),
      $terraData.K("これ以上協力店を募るのをやめ、拡大を止める", {}, [
        1,
        "新しく協力店を募って回るのはここで止めることにした。ただ、すでに各店の入口に打ちつけられた「感染者お断り」の札はそのまま残った。",
        {
          lifeOrganization: { id: "infected-current", action: "policy", policy: "名簿作成を停止" },
          socialConflictAction: {
            action: "reconsider",
            target: "infected",
            context: "stopped-exclusion-registry"
          },
          groupStandings: [
            { id: "noninfected-residents", title: "非感染者の住民", delta: -1, reason: "名簿作成を止めた" },
            {
              id: "infected-families",
              title: "地域の感染者と家族",
              delta: 1,
              reason: "抗議を受けて拡大を止めた"
            }
          ],
          p: -2
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_infected_mutual_aid_shortage",
    conf: "S",
    references: ["SRC_TERRA_SOCIAL_ATTITUDES", "SRC_ORIPATHY_SOCIAL"],
    st: ["青年", "壮年", "老年"],
    need: ["感染者互助組織に所属中"],
    after: { id: "life_infected_association_choice", min: 1 },
    once: true,
    w: 0.34,
    t: "共同購入している抑制剤と日用品の値が跳ね上がり、会費を払えない世帯も出てきた。そこへ仕入れの遅れも重なり、わずかしか届かなかった薬と物資を誰から先に回すかで集会所が静まり返った。",
    c: [
      $terraData.K("医師の判断を仰ぎ、発作や症状の重い人から優先して回す", {}, [
        1,
        "巡回医と相談し、今すぐ薬がなければ危ない重症の人から優先して配ることにした。なぜその順番になったのかを皆の前で説明したが、後回しになった世帯の不安は消えなかった。",
        {
          lifeOrganization: {
            id: "infected-mutual-aid",
            action: "policy",
            policy: "症状の重い人を優先し配給理由を記録"
          },
          groupStandings: [
            {
              id: "infected-families",
              title: "地域の感染者と家族",
              delta: 3,
              reason: "配給の基準を共有した"
            },
            { id: "local-organizers", title: "互助会の協力者", delta: 1, reason: "優先順と帳簿を説明した" }
          ],
          regionalImpact: {
            entity: "地域の感染者と家族",
            kind: "mutual-aid-rationing",
            description: "不足した薬と生活物資を症状の重い人から配り、順番を記録した"
          },
          lifeSkill: {
            id: "mutual-aid-ledger",
            title: "共同購入の会計と配給記録",
            delta: 4,
            context: "不足した支援物資の順番を記録"
          },
          p: 1
        }
      ]),
      $terraData.K("自分の財布から2,000龍門幣を足し、会費を払えない家にも少しずつ分ける", {}, [
        1,
        "自分の懐から2,000龍門幣を出し、会費が滞っている家も見捨てずに少しずつ物資を分け合った。誰も仲間外れにはしなかったが、一軒あたりの量は心もとないほど減った。",
        {
          groupStandings: [
            {
              id: "infected-families",
              title: "地域の感染者と家族",
              delta: 2,
              reason: "会費を理由に支援対象を外さなかった"
            },
            {
              id: "local-organizers",
              title: "互助会の協力者",
              delta: -2,
              reason: "資金不足の負担が運営へ及んだ"
            }
          ],
          regionalImpact: {
            entity: "地域の感染者と家族",
            kind: "mutual-aid-rationing",
            description: "会費を問わず届いた物資を少量ずつ分けた"
          },
          cash: -2000,
          lifeOrganization: {
            id: "infected-mutual-aid",
            action: "expense",
            amount: 2000,
            funding: "personal",
            note: "個人資金2,000龍門幣を物資購入へ出した"
          },
          p: -1
        }
      ]),
      $terraData.K("物資の共同購入はいったん断念し、診療日や安い仕入れ先の情報だけを回す", {}, [
        1,
        "これ以上は資金が回らないと共同購入を止め、巡回診療の日取りと薬を安く買える店の情報だけを知らせ合うことにした。",
        {
          lifeOrganization: {
            id: "infected-mutual-aid",
            action: "policy",
            policy: "共同購入を停止し診療日と仕入先情報のみ連絡"
          },
          groupStandings: [
            {
              id: "infected-families",
              title: "地域の感染者と家族",
              delta: -2,
              reason: "共同購入を一時停止した"
            }
          ],
          regionalImpact: {
            entity: "地域の感染者と家族",
            kind: "mutual-aid-suspension",
            description: "物資の共同購入を止め、診療日と仕入れ先の情報連絡だけを続けた"
          },
          p: -2
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_infected_organization_dues",
    conf: "S",
    references: ["SRC_TERRA_SOCIAL_ATTITUDES", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    any: ["感染者排除運動の主催", "感染者互助組織の主催"],
    cd: 6,
    w: 0.2,
    t: "集会所の借り賃や荷運びの手間賃が足りなくなり、次の集まりで追加の会費を出すか、体を使って運搬を手伝うか相談された。自分の家のやりくりも楽ではない。",
    c: [
      $terraData.K(
        "無理のない範囲で、1,200龍門幣の会費を納める",
        {
          en: s => $rules.economy.availableFunds(s) >= 1200 + $rules.economy.annualReserve(s),
          why: "生活予備費を守ったうえで会費を出せない"
        },
        [
          1,
          "財布から1,200龍門幣を出して会計に預け、集会所の借り賃に充ててもらった。",
          {
            cash: -1200,
            lifeOrganization: {
              id: "infected-current",
              action: "dues",
              amount: 1200,
              note: "本人が会費を納めた"
            },
            p: 1
          }
        ]
      ),
      $terraData.K("お金を出す代わりに、休日の荷運びや連絡回りを引き受ける", {}, [
        1,
        "会費の代わりに街区を回って知らせを配り、重い木箱を運んだ。家に帰り着くころにはすっかり日が暮れ、泥のように眠った。",
        {
          lifeAffiliations: [
            {
              id: "infected-exclusion",
              title: "感染者排除を求める住民会",
              action: "role",
              role: "連絡・会場の当番",
              onlyIfActive: true
            },
            {
              id: "infected-mutual-aid",
              title: "感染者と家族の共同購入・診療連絡会",
              action: "role",
              role: "連絡・物資運びの当番",
              onlyIfActive: true
            }
          ],
          lifeOrganization: {
            id: "infected-current",
            action: "participation",
            participation: "連絡・物資運びの当番",
            note: "会費の代わりに一度、連絡と物資運びを担当"
          },
          p: -1
        }
      ]),
      $terraData.K("今期は金も手も出せないと断り、会の役目から一歩引く", {}, [
        1,
        "自分の暮らしが苦しくて今回は出せないと断った。それ以来、集まりにも顔を出しづらくなり、会の中心から少しずつ足が遠のいた。",
        {
          lifeAffiliations: [
            {
              id: "infected-exclusion",
              title: "感染者排除を求める住民会",
              action: "role",
              role: "一般会員（当番休止）",
              onlyIfActive: true
            },
            {
              id: "infected-mutual-aid",
              title: "感染者と家族の共同購入・診療連絡会",
              action: "role",
              role: "一般会員（当番休止）",
              onlyIfActive: true
            }
          ],
          lifeOrganization: {
            id: "infected-current",
            action: "participation",
            participation: "一般会員（当番休止）",
            note: "今期の会費・当番負担を断った"
          },
          p: -2
        }
      ])
    ]
  });

  $terraData.EV.push({
    id: "life_infected_organization_exit_legacy",
    conf: "S",
    references: ["SRC_TERRA_SOCIAL_ATTITUDES", "SRC_TERRA_LIFECOURSE"],
    st: ["青年", "壮年", "老年"],
    any: ["感染者排除団体から退出済み", "感染者互助組織から退出済み"],
    cd: 8,
    w: 0.2,
    show: s => (s.lifeRecord?.affiliations || []).some(member =>
      ["infected-exclusion", "infected-mutual-aid"].includes(member.id) &&
      member.status === "left" &&
      Number.isInteger(member.endedYear) && s.year - member.endedYear >= 3 &&
      (s.lifeRecord?.organizations || []).some(org =>
        org.id === member.id && ["active", "handed-over"].includes(org.status))
    ),
    t: "あの会を離れてから何年もの月日が流れた。ある日、今の世話役から「あなたが関わっていた頃のいきさつを教えてほしい」と便りが届いた。過去のことにどう向き合うか考えた。",
    c: [
      $terraData.K("個人の名前は伏せたうえで、当時なぜそう決めたのかを話して伝える", {}, [
        1,
        "誰かの名前が外へ出ないよう配慮しながら、当時どんな事情でその方針を決めたのかを今の世話役にありのまま話した。",
        {
          lifeOrganization: {
            id: "infected-current",
            action: "followup",
            note: "後任へ帳面と判断経緯を渡した"
          },
          regionalImpact: {
            entity: "地域の住民会・互助組織",
            kind: "former-member-record",
            description: "退会者が当時の帳面と判断経緯を後任へ渡した"
          },
          groupStandings: [
            { id: "former-organizers", title: "元の会合の運営者", delta: 1, reason: "後任へ記録を渡した" }
          ],
          p: 1
        }
      ]),
      $terraData.K("もう終わったことだと、返事を書かずに手紙をしまう", {}, [
        1,
        "今さら昔の話を掘り返す気にはなれず、便りには返事を出さないまま引き出しの奥へしまった。",
        {
          lifeOrganization: {
            id: "infected-current",
            action: "followup",
            note: "会から距離を置き、後任の連絡には応じなかった"
          },
          p: 0
        }
      ]),
      $terraData.K("集会所を借り、当時の決定で傷ついた住民の声も聞く場を設ける", {}, [
        1,
        "自ら小さな集会所を借り、当時どんな決定をして街区にどんな影響が出たのかを住民たちと向き合って話す場を開いた。苦い言葉も飛んだが、過去の行いから目をそらさずに耳を傾けた。",
        {
          lifeOrganization: {
            id: "infected-current",
            action: "followup",
            note: "当時の運営と影響を住民と話し合った"
          },
          regionalImpact: {
            entity: "地域の住民会・互助組織",
            kind: "public-accountability",
            description: "元会員が過去の運営と地域への影響を話し合う場を開いた"
          },
          groupStandings: [
            {
              id: "infected-families",
              title: "地域の感染者と家族",
              delta: 2,
              reason: "影響を受けた住民の話を聞く場を開いた"
            },
            {
              id: "former-organizers",
              title: "元の会合の運営者",
              delta: -1,
              reason: "過去の運営を公に見直した"
            }
          ],
          p: 2
        }
      ])
    ]
  });
});
