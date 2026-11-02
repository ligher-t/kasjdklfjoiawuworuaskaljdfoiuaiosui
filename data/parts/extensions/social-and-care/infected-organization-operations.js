// extensions/social-and-care/infected-organization-operations: construction fragment; evaluation order is declared by data/extensions/social-and-care.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/infected-organization-operations"
)(function ($terraData, $define, $rules) {
  "use strict";

  const organizationId = "infected-mutual-aid",
    affiliation = s => s.lifeRecord?.affiliations?.find(row => row.id === organizationId),
    organization = s => s.lifeRecord?.organizations?.find(row => row.id === organizationId),
    isActive = s => affiliation(s)?.status === "active" && organization(s)?.status === "active",
    isSuspended = s => affiliation(s)?.status === "suspended" && organization(s)?.status === "active",
    goal = (action, note, onlyIfActive = true) => ({
      lifeGoal: {
        id: organizationId,
        title: "感染者と家族が孤立しない支援網を保つ",
        priority: "互助",
        action,
        onlyIfActive,
        note
      }
    }),
    affiliationRole = role => ({
      id: organizationId,
      title: "感染者と家族の共同購入・診療連絡会",
      action: "role",
      role,
      onlyIfActive: true
    });

  $terraData.EV.push(
    {
      id: "life_infected_org_records",
      conf: "S",
      references: ["SRC_NL_INFECTED_ORGANIZATION_PRECEDENT", "SRC_INFECTED_ORGANIZATION_OPERATIONS_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["感染者互助組織に所属中"],
      after: { id: "life_infected_association_choice", min: 1 },
      cd: 4,
      w: 0.38,
      show: isActive,
      t: "薬や日用品の共同購入と巡回診療の連絡を続けるうち、誰の名前が載った名簿をどこに置くかで集まりのたび揉めるようになった。万が一外へ漏れれば職や部屋を失う人もいる。記録の残し方をどうするか話し合った。",
      c: [
        $terraData.K("個人の名前は一切残さず、必要な人数と金額だけを集計する", {}, [
          1,
          "誰が何を受け取ったかは書かず、全体の人数と金額だけをまとめるやり方に変えた。名前が外へ漏れる心配はなくなり、次の世話役にも安心して引き継げた。",
          {
            lifeOrganization: {
              id: organizationId,
              action: "policy",
              policy: "支援人数と費用のみ匿名で記録"
            },
            lifeSkill: {
              id: "infected-mutual-aid-ledger",
              title: "互助会の会計・記録",
              delta: 1,
              context: "名前を含めず、支援人数と費用を集計した"
            },
            ...goal("continue", "匿名の人数・費用集計を続ける"),
            p: 1
          }
        ]),
        $terraData.K("一人ずつ意思を確かめ、承知した人の連絡先だけを預かる", {}, [
          1,
          "なぜ連絡先が必要かを一人ひとりに説明し、納得してくれた人の分だけを控えた。名前を残したくない人は件数だけで扱うことにし、時間をかけて信頼を守った。",
          {
            lifeOrganization: {
              id: organizationId,
              action: "policy",
              policy: "氏名の記録は本人確認を取り、未回答は匿名集計"
            },
            lifeAffiliation: affiliationRole("記録と本人確認の連絡係"),
            lifeSkill: {
              id: "infected-mutual-aid-ledger",
              title: "互助会の会計・記録",
              delta: 1,
              context: "記録する情報を本人に確認した"
            },
            ...goal("continue", "本人の確認に沿って記録を整える"),
            p: 1
          }
        ]),
        $terraData.K("名簿そのものを作らず、診療日と受け渡しの時刻だけを口頭で回す", {}, [
          1,
          "名簿は一切持たず、集まりの日時と場所だけを伝えることにした。安全にはなったが、急な変更を知らせる術がなく、次の当番が連絡に苦労することになった。",
          {
            lifeOrganization: {
              id: organizationId,
              action: "policy",
              policy: "診療日・受け渡し時刻のみ記録"
            },
            ...goal("continue", "必要最小限の予定だけを残す"),
            p: -1
          }
        ])
      ]
    },
    {
      id: "life_infected_org_rotation",
      conf: "S",
      references: ["SRC_INFECTED_ORGANIZATION_OPERATIONS_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["感染者互助組織に所属中"],
      after: { id: "life_infected_org_records", min: 1 },
      cd: 4,
      w: 0.34,
      show: isActive,
      t: "次の集まりでは、卸売商への買い付け交渉と代金の照合を誰が受け持つか決めることになった。自分の仕事と通院の合間に、どこまで背負えるか考えた。",
      c: [
        $terraData.K("買い付けの連絡と届いた物資の検品を引き受ける", {}, [
          1,
          "卸売商と掛け合って物資を手配し、届いた箱の数と代金を一つずつ突き合わせた。計算の合わない端数は次の集まりで相談することにした。",
          {
            lifeAffiliation: affiliationRole("仕入れ連絡・領収書の確認"),
            lifeOrganization: {
              id: organizationId,
              action: "participation",
              participation: "仕入れ連絡・領収書の確認",
              note: "今期の当番を引き受けた"
            },
            lifeSkill: {
              id: "infected-mutual-aid-ledger",
              title: "互助会の会計・記録",
              delta: 1,
              context: "仕入れと領収書を照合した"
            },
            ...goal("continue", "仕入れと帳簿の当番を担う"),
            p: 1
          }
        ]),
        $terraData.K("手伝える曜日をあらかじめ区切り、無理のない範囲で当番に入る", {}, [
          1,
          "自分が動ける日をあらかじめ伝え、その日だけの買い付けと引き継ぎを受け持った。それ以外の日は自分の仕事と治療を優先した。",
          {
            lifeAffiliation: affiliationRole("時間を区切った仕入れ・記録当番"),
            lifeOrganization: {
              id: organizationId,
              action: "participation",
              participation: "時間を区切った仕入れ・記録当番",
              note: "当番日と引継ぎ範囲を決めた"
            },
            ...goal("continue", "当番の時間と引継ぎ範囲を決める"),
            p: 1
          }
        ]),
        $terraData.K("今期は裏方の当番を休み、一会員として集まりにだけ顔を出す", {}, [
          1,
          "今は自分の仕事と通院で手いっぱいだと打ち明け、当番からは外れて必要な集まりにだけ顔を出すことにした。",
          {
            lifeAffiliation: affiliationRole("一般会員・今期の当番なし"),
            lifeOrganization: {
              id: organizationId,
              action: "participation",
              participation: "一般会員・今期の当番なし",
              note: "会員資格を保ち、当番だけを休んだ"
            },
            ...goal("continue", "当番を減らし、会員としての連絡を保つ"),
            p: 0
          }
        ]),
        $terraData.K("身体と暮らしが落ち着くまで、会の活動そのものをしばらく休む", {}, [
          1,
          "しばらく会合も当番も休ませてほしいと仲間に伝え、預かっていた物を返した。巡回診療の日取りだけは教えてもらうことにした。",
          {
            lifeAffiliation: {
              id: organizationId,
              action: "suspend",
              note: "療養と仕事の都合で会員活動を一時休止"
            },
            lifeOrganization: {
              id: organizationId,
              action: "participation",
              participation: "会員活動を一時休止",
              note: "当番と会合を休み、連絡案内は受け取る"
            },
            ...goal("pause", "療養や仕事の都合で会員活動を休止する"),
            p: 0
          }
        ])
      ]
    },
    {
      id: "life_infected_org_recipients",
      conf: "S",
      references: ["SRC_NL_INFECTED_ORGANIZATION_SCOPE", "SRC_INFECTED_ORGANIZATION_OPERATIONS_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["感染者互助組織に所属中"],
      after: { id: "life_infected_org_records", min: 1 },
      cd: 5,
      w: 0.28,
      show: isActive,
      t: "まだ会に入っていない感染者の家族が、わらにもすがる思いで巡回診療の日取りと共同購入のことを尋ねてきた。限られた物資を会員以外にも分けるのか、それとも集まりの案内をどこまで伝えるか判断を迫られた。",
      c: [
        $terraData.K("巡回診療の日時と場所を教え、まずは本人と医師に相談してもらう", {}, [
          1,
          "次の巡回診療がいつどこで開かれるかを丁寧に教え、まずは本人が診てもらえるよう手引きした。切羽詰まった家族の表情がわずかに和らいだ。",
          {
            lifeOrganization: {
              id: organizationId,
              action: "policy",
              policy: "診療日は案内し、薬は診療所へ相談する"
            },
            groupStanding: {
              id: "infected-families",
              title: "地域の感染者と家族",
              delta: 1,
              reason: "連絡先と診療日を伝えた"
            },
            ...goal("continue", "連絡先の案内と支援範囲を分ける"),
            p: 1
          }
        ]),
        $terraData.K("患者本人の意思を確かめたうえで、家族にも集まりの場所を教える", {}, [
          1,
          "まず患者本人に会い、家族にどこまで話してよいかを確かめてから次の集まりの日時だけを伝えた。誰かの病状が勝手に身内へ漏れないよう気を配った。",
          {
            lifeOrganization: {
              id: organizationId,
              action: "policy",
              policy: "本人が許可した会合情報だけ家族へ共有"
            },
            lifeAffiliation: affiliationRole("本人の同意を確かめて会合を案内"),
            ...goal("continue", "本人が許可した会合情報を案内する"),
            p: 1
          }
        ]),
        $terraData.K("共同購入の物資は会員分しかないと断り、診療日のことだけを教える", {}, [
          1,
          "物資はあらかじめ予約した会員の分だけで手いっぱいだと詫び、巡回診療の日取りだけを伝えた。落胆して帰っていく背中を見送り、どこまで手を広げられるか考えさせられた。",
          {
            lifeOrganization: {
              id: organizationId,
              action: "policy",
              policy: "共同購入は会員分に限り診療日情報は案内"
            },
            groupStanding: {
              id: "infected-families",
              title: "地域の感染者と家族",
              delta: -1,
              reason: "共同購入の対象を会員分に限った"
            },
            ...goal("continue", "共同購入と情報案内の対象を分ける"),
            p: -1
          }
        ])
      ]
    },
    {
      id: "life_infected_org_finance",
      conf: "S",
      references: ["SRC_INFECTED_ORGANIZATION_OPERATIONS_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["感染者互助組織に所属中"],
      after: { id: "life_infected_org_rotation", min: 1 },
      cd: 5,
      w: 0.25,
      show: isActive,
      t: "共同購入した薬箱の数と支払った代金の計算が合わず、受け取った当番同士の説明も食い違った。疑心暗鬼が広がる前にどう収めるか、集まりで話し合った。",
      c: [
        $terraData.K("二人一組で残った物資と受領証を数え直し、卸売商へ問い合わせる", {}, [
          1,
          "誰かを責める前に二人一組で木箱の中身を数え直し、どうしても合わない分を卸売商へ問い合わせることにした。場の空気が落ち着きを取り戻した。",
          {
            lifeOrganization: {
              id: organizationId,
              action: "policy",
              policy: "仕入れと領収書を複数人で照合し未確認差額を記録"
            },
            lifeSkill: {
              id: "infected-mutual-aid-ledger",
              title: "互助会の会計・記録",
              delta: 1,
              context: "複数人で品数と領収書を照合した"
            },
            ...goal("continue", "確認できた差額と未確認の理由を分ける"),
            p: 1
          }
        ]),
        $terraData.K("原因がはっきりするまで次の買い付けを止め、今ある物資だけを分ける", {}, [
          1,
          "うやむやのまま新しい金を動かすのは危険だと、次の注文をいったん止めた。今手元にある物資と巡回診療の知らせだけを会員へ回した。",
          {
            lifeOrganization: {
              id: organizationId,
              action: "policy",
              policy: "仕入れ確認まで追加注文を保留"
            },
            ...goal("continue", "仕入れを確認するまで注文を保留する"),
            p: 0
          }
        ]),
        $terraData.K(
          "物資が滞らないよう、自分の懐から1,500龍門幣を立て替えて急場をしのぐ",
          {
            en: s => $rules.economy.availableFunds(s) >= 1500 + $rules.economy.annualReserve(s),
            why: "生活予備費を守ったうえで追加会費を出せない"
          },
          [
            1,
          "薬を待っている人を困らせたくなくて、自分の財布から1,500龍門幣を出して不足分を埋めた。なぜ数が合わなかったのかは、引き続き卸売商に確かめることにした。",
            {
              cash: -1500,
              lifeOrganization: {
                id: organizationId,
                action: "dues",
                amount: 1500,
                note: "調査を続けながら追加会費を預けた"
              },
              ...goal("continue", "追加会費と未確認の差額を別に記録する"),
              p: 0
            }
          ]
        )
      ]
    },
    {
      id: "life_infected_org_privacy",
      conf: "S",
      references: ["SRC_NL_INFECTED_ORGANIZATION_PRECEDENT", "SRC_INFECTED_ORGANIZATION_OPERATIONS_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["感染者互助組織に所属中"],
      after: { id: "life_infected_org_recipients", min: 1 },
      once: true,
      w: 0.22,
      show: isActive,
      t: "街区の工場主を名乗る人物が集まりに現れ、「雇用の参考にするから、会に出入りしている感染者の名前と通院日を教えろ」と迫ってきた。応じれば誰かが職を追われかねない。どう対応するか話し合った。",
      c: [
        $terraData.K("個人の名前は絶対に渡さず、会の窓口と全体の人数だけを伝える", {}, [
          1,
          "「会員の名前も通院日も外には出せません」ときっぱり断り、会の代表窓口だけを伝えた。仲間たちの暮らしを守る一線だけは譲らなかった。",
          {
            lifeOrganization: {
              id: organizationId,
              action: "policy",
              policy: "外部には本人の同意なく名簿・診療日を渡さない"
            },
            ...goal("continue", "会員の個人情報を同意なく外へ渡さない"),
            p: 1
          }
        ]),
        $terraData.K("そんな照会が来たことを会員全員に知らせ、本人の意思なしには答えないと決める", {}, [
          1,
          "工場主が何を聞き出そうとしたかを包み隠さず仲間たちに伝え、本人が望まない限り誰のことも外へ漏らさないと改めて申し合わせた。",
          {
            lifeOrganization: {
              id: organizationId,
              action: "policy",
              policy: "外部照会は会員へ知らせ個別同意を確認"
            },
            lifeAffiliation: affiliationRole("外部照会の連絡・本人確認"),
            ...goal("continue", "外部照会の内容と本人の返事を分ける"),
            p: 1
          }
        ]),
        $terraData.K("目をつけられるのを防ぐため、しばらく表立った集まりをやめて個別連絡に切り替える", {}, [
          1,
          "集会所を見張られてはたまらないと、しばらく全体の集まりを取りやめ、顔見知り同士でこっそり連絡を回すようにした。安全にはなったが、新しく助けを求める人がたどり着きにくくなった。",
          {
            lifeOrganization: {
              id: organizationId,
              action: "policy",
              policy: "外部圧力の間は公開会合を控え既知の会員へ個別連絡"
            },
            ...goal("compromise", "安全と新しい人の参加しやすさの折り合いを探す"),
            p: -1
          }
        ])
      ]
    },
    {
      id: "life_infected_org_reentry",
      conf: "S",
      references: ["SRC_INFECTED_ORGANIZATION_OPERATIONS_MODEL"],
      st: ["青年", "壮年", "老年"],
      after: { id: "life_infected_org_rotation", min: 1 },
      cd: 4,
      w: 0.14,
      show: s => {
        if (!isSuspended(s)) return false;
        const pauses = affiliation(s)?.history?.filter(row => row.action === "suspend") || [];
        const pausedYear = pauses.at(-1)?.year;
        return Number.isInteger(pausedYear) && s.year - pausedYear >= 1;
      },
      t: "互助会の活動から遠ざかって、いくつか季節が巡った。新しい世話役から「物資の計算や引き継ぎのやり方を教えてほしい」と便りが届いた。丸一日の当番は無理でも、少し顔を出すくらいならできそうだった。",
      c: [
        $terraData.K("短時間の計算・引き継ぎ係として、また集まりに顔を出す", {}, [
          1,
          "「短い時間なら手伝える」と返事をして久しぶりに集会所の扉を開けた。馴染みの顔ぶれに迎えられ、物資の数え方や引き継ぎのコツを一緒に確かめた。",
          {
            lifeAffiliation: {
              id: organizationId,
              action: "return",
              role: "時間を区切った記録係"
            },
            lifeOrganization: {
              id: organizationId,
              action: "review",
              note: "休止後、記録係として活動へ戻る"
            },
            ...goal("continue", "休止後、時間を区切って活動へ戻る", false),
            p: 1
          }
        ]),
        $terraData.K("今はまだ戻れないと伝え、一会員のまま休止を続ける", {}, [
          1,
          "まだ裏方を引き受ける余裕はないと詫びの便りを出し、巡回診療の知らせだけを受け取ることにした。",
          {
            lifeAffiliation: { id: organizationId, action: "review", note: "本人が休止を継続" },
            lifeOrganization: {
              id: organizationId,
              action: "followup",
              note: "休止中の会員から継続連絡を受けた"
            },
            ...goal("pause", "会員資格を保ち、当番は休止する", false),
            p: 0
          }
        ]),
        $terraData.K("これを機に会を退き、互助会の仕事から完全に離れる", {}, [
          1,
          "もう会には戻らないと正式に伝え、世話役たちに別れを告げた。",
          {
            lifeAffiliation: {
              id: organizationId,
              action: "leave",
              note: "休止後、本人が会員を辞めた"
            },
            lifeOrganization: {
              id: organizationId,
              action: "followup",
              note: "休止後に本人が会員を辞めた"
            },
            ...goal("abandon", "互助会の仕事を終え、本人の活動目標を終了した", false),
            p: -1
          }
        ])
      ]
    }
  );
});
