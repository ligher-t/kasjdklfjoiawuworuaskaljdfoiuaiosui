// routes/rhodes-and-factions/staff-routes-events-03: construction fragment; evaluation order is declared by data/routes/rhodes-and-factions.js.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/staff-routes-events-03"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  return [
    {
      id: "sr_londinium_counterreport_followup",
      conf: "S",
      references: [
        "SRC_TL_LONDINIUM_WINDOW",
        "SRC_SR_LONDINIUM_SIGNAL",
        "SRC_SR_GAME_MODEL",
        "SRC_V88_INFO_BOUNDARIES"
      ],
      st: ["青年", "壮年", "老年"],
      need: ["国:ヴィクトリア", "事件:londinium_war"],
      ban: ["都市:ロンディニウム"],
      ge: { year: 1099 },
      le: { year: 1110 },
      cd: 2,
      w: 0.22,
      show: s => {
        const claim = s.informationClaims?.find(row => row.id === "londinium-grain-price-stability");
        return !!claim && !claim.pursuitStopped && claim.recordedYear < s.year;
      },
      t: "別の店では、穀物の値はしばらく変わらないと売り手が話した。前に聞いた値上がりの噂と食い違い、棚の前で買う量を決めかねた。",
      c: [
        $terraData.K("店先の穀物の値札を確かめる", {}, [
          1,
          "値札を確かめ、今日の数字を帳面に記した。前に見た値段は思い出せなかった。",
          {
            informationClaimAction: {
              claimId: "londinium-grain-price-stability",
              action: "observe-one-stall"
            }
          }
        ]),
        $terraData.K(
          "別の店で聞いた話を、同居する配偶者へ伝える",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "spouse", "londinium-grain-price-stability")
          },
          [
            1,
            "別の店で聞いた話を、食卓で同居する配偶者に伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-grain-price-stability",
                action: "share-unverified-household"
              }
            }
          ]
        ),
        $terraData.K(
          "別の店で聞いた話を、父へ伝える",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "father", "londinium-grain-price-stability")
          },
          [
            1,
            "別の店で聞いた話を父に伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-grain-price-stability",
                action: "share-unverified-close-person",
                recipientKind: "father"
              }
            }
          ]
        ),
        $terraData.K(
          "別の店で聞いた話を、母へ伝える",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "mother", "londinium-grain-price-stability")
          },
          [
            1,
            "別の店で聞いた話を母に伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-grain-price-stability",
                action: "share-unverified-close-person",
                recipientKind: "mother"
              }
            }
          ]
        ),
        $terraData.K(
          "別の店で聞いた話を、友人へ伝える",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "friend", "londinium-grain-price-stability")
          },
          [
            1,
            "別の店で聞いた話を友人に伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-grain-price-stability",
                action: "share-unverified-close-person",
                recipientKind: "friend"
              }
            }
          ]
        ),
        $terraData.K("話を広げず、店を出る", {}, [
          1,
          "いつもの量をかごへ入れ、手帳を閉じて店を出た。",
          { informationClaimAction: { claimId: "londinium-grain-price-stability", action: "stop-pursuit" } }
        ]),
        $terraData.K(
          "値上がりしないという話を頼りに、今日の買い物を決める",
          {
            show: s => {
              const q = s.informationClaims?.find(row => row.id === "londinium-grain-price-stability"),
                last = q?.assessments?.at(-1);
              return !!q && (!last || (q.evidence?.length || 0) > last.evidenceCount);
            }
          },
          [
            1,
            "その話を頼りに、今日はいつもの分だけをかごへ入れた。",
            {
              informationClaimAction: {
                claimId: "londinium-grain-price-stability",
                action: "assess-plausible"
              }
            }
          ]
        ),
        $terraData.K(
          "まだ決めず、今日はいつもの量を買う",
          {
            show: s => {
              const q = s.informationClaims?.find(row => row.id === "londinium-grain-price-stability"),
                last = q?.assessments?.at(-1);
              return !!q && (!last || (q.evidence?.length || 0) > last.evidenceCount);
            }
          },
          [
            1,
            "いつもの量をかごに入れ、見た値段を手帳に控えた。",
            {
              informationClaimAction: {
                claimId: "londinium-grain-price-stability",
                action: "assess-undetermined"
              }
            }
          ]
        ),
        $terraData.K(
          "別の店の値札も見てから決める",
          {
            show: s => {
              const q = s.informationClaims?.find(row => row.id === "londinium-grain-price-stability"),
                last = q?.assessments?.at(-1);
              return !!q && (!last || (q.evidence?.length || 0) > last.evidenceCount);
            }
          },
          [
            1,
            "隣の店にも足を運び、同じ穀物の値札を見比べた。",
            {
              informationClaimAction: {
                claimId: "londinium-grain-price-stability",
                action: "assess-doubtful"
              }
            }
          ]
        )
      ]
    },
    {
      id: "sr_kazimierz_outage_report",
      conf: "S",
      references: [
        "SRC_NL_SLEEPING_CITY",
        "SRC_NL_VOICE_OF_ROSEBUD",
        "SRC_TL_NEAR_LIGHT_WINDOW",
        "SRC_COMMUNITY_NEAR_LIGHT_DAILY_TIMELINE",
        "SRC_KAZIMIERZ_INFO_ROUTE_MODEL",
        "SRC_V88_INFO_BOUNDARIES"
      ],
      st: ["青年", "壮年", "老年"],
      need: ["国:カジミエーシュ"],
      months: [11],
      ge: { year: 1097 },
      le: { year: 1097 },
      once: true,
      w: 0.24,
      show: s => s.home === "移動都市",
      t: "10月31日の停電を伝えるローズ新聞が、街頭の売り場に並んだ。大騎士領の一部区画では復旧作業が進み、原因調査はこれからだという。",
      c: [
        $terraData.K(
          "ローズ新聞を買って読む（1,200龍門幣）",
          {
            show: s => $rules.social.literacyValue(s) >= 40,
            en: s => $rules.economy.availableFunds(s) >= 1200,
            why: "紙面を読む力か、購入費1,200龍門幣が足りない"
          },
          [
            1,
            "ローズ新聞を1,200龍門幣で買い、一部区画の停電と復旧について読んだ。原因調査はまだ続いているという。",
            {
              cash: -1200,
              informationClaimAction: {
                claimId: "kazimierz-grid-restoration",
                action: "receive",
                receiptMode: "printed-purchase"
              }
            }
          ]
        ),
        $terraData.K("売り子から記事の要点を聞く（無料）", {}, [
          1,
          "売り子から、新聞が伝えた停電と復旧の記事の要点を聞いた。原因調査はこれからだという。",
          {
            informationClaimAction: {
              claimId: "kazimierz-grid-restoration",
              action: "receive",
              receiptMode: "vendor-summary"
            }
          }
        ]),
        $terraData.K("記事を受け取らず、仕事や家の用事へ戻る", {}, [
          1,
          "値札を見て新聞は買わず、仕事へ戻った。売り子の呼び声が背後に遠のいた。",
          {}
        ])
      ]
    },
    {
      id: "sr_kazimierz_outage_followup",
      conf: "S",
      references: [
        "SRC_NL_SLEEPING_CITY",
        "SRC_TL_NEAR_LIGHT_WINDOW",
        "SRC_KAZIMIERZ_INFO_ROUTE_MODEL",
        "SRC_V88_INFO_BOUNDARIES"
      ],
      st: ["青年", "壮年", "老年"],
      need: ["国:カジミエーシュ"],
      ge: { year: 1098 },
      le: { year: 1110 },
      cd: 2,
      w: 0.22,
      show: s => {
        const claim = s.informationClaims?.find(row => row.id === "kazimierz-grid-restoration");
        return !!claim && !claim.pursuitStopped && claim.recordedYear < s.year;
      },
      t: "大騎士領の停電を伝える記事を手にしてから、しばらくたった。切り抜きを見返し、配偶者や親、友人に話すか、ここでしまっておくか考えた。",
      c: [
        $terraData.K(
          "同居する配偶者へ、紙面にあったことを伝える",
          {
            show: s => $rules.information.canShareInformationClaim(s, "spouse", "kazimierz-grid-restoration")
          },
          [
            1,
            "停電の記事を配偶者に話し、大騎士領の一部区画について書かれていたと伝えた。",
            {
              informationClaimAction: {
                claimId: "kazimierz-grid-restoration",
                action: "share-unverified-household"
              }
            }
          ]
        ),
        $terraData.K(
          "父へ、紙面にあったことを伝える",
          {
            show: s => $rules.information.canShareInformationClaim(s, "father", "kazimierz-grid-restoration")
          },
          [
            1,
            "停電の記事を父に話し、大騎士領の一部区画について書かれていたと伝えた。",
            {
              informationClaimAction: {
                claimId: "kazimierz-grid-restoration",
                action: "share-unverified-close-person",
                recipientKind: "father"
              }
            }
          ]
        ),
        $terraData.K(
          "母へ、紙面にあったことを伝える",
          {
            show: s => $rules.information.canShareInformationClaim(s, "mother", "kazimierz-grid-restoration")
          },
          [
            1,
            "停電の記事を母に話し、大騎士領の一部区画について書かれていたと伝えた。",
            {
              informationClaimAction: {
                claimId: "kazimierz-grid-restoration",
                action: "share-unverified-close-person",
                recipientKind: "mother"
              }
            }
          ]
        ),
        $terraData.K(
          "友人へ、紙面にあったことを伝える",
          {
            show: s => $rules.information.canShareInformationClaim(s, "friend", "kazimierz-grid-restoration")
          },
          [
            1,
            "停電の記事を友人に話し、大騎士領の一部区画について書かれていたと伝えた。",
            {
              informationClaimAction: {
                claimId: "kazimierz-grid-restoration",
                action: "share-unverified-close-person",
                recipientKind: "friend"
              }
            }
          ]
        ),
        $terraData.K(
          "競技会場の仕事中、休憩時に同じ持ち場の人へ伝える",
          {
            show: s => !!$rules.information.informationClaimWorkplaceTarget(s, "kazimierz-grid-restoration")
          },
          [
            1,
            "休憩中、同じ持ち場で停電の記事を話題にした。",
            {
              informationClaimAction: {
                claimId: "kazimierz-grid-restoration",
                action: "present-unverified-to-workplace"
              }
            }
          ]
        ),
        $terraData.K("報道の確認や伝達をここで止める", {}, [
          1,
          "切り抜きを机にしまい、誰かに話すのもやめた。",
          { informationClaimAction: { claimId: "kazimierz-grid-restoration", action: "stop-pursuit" } }
        ])
      ]
    },
    {
      id: "sr_kazimierz_outage_statement",
      conf: "S",
      references: [
        "SRC_NL_VOICE_OF_ROSEBUD",
        "SRC_NL_SLEEPING_CITY",
        "SRC_TL_NEAR_LIGHT_WINDOW",
        "SRC_COMMUNITY_NEAR_LIGHT_DAILY_TIMELINE",
        "SRC_KAZIMIERZ_INFO_ROUTE_MODEL",
        "SRC_V88_INFO_BOUNDARIES"
      ],
      st: ["青年", "壮年", "老年"],
      need: ["国:カジミエーシュ"],
      months: [12],
      ge: { year: 1097 },
      le: { year: 1097 },
      once: true,
      w: 0.18,
      show: s => {
        const claim = s.informationClaims?.find(row => row.id === "kazimierz-grid-restoration");
        return s.home === "移動都市" && claim?.recordedYear === 1097 && claim?.receiptContext?.month === 11;
      },
      t: "翌月のローズ新聞には、マッキーが監査会を批判する記事が載った。非常時に征戦騎士を入城させたこと、停電中の進軍が住民の暮らしを乱したことを、商業連合会は問題にしていた。監査会の返答はまだない。",
      c: [
        $terraData.K("記事を受け取り、マッキーの非難を書き留める", {}, [
          1,
          "記事を読み、商業連合会がマッキーの名で伝えた非難を切り抜きに書き留めた。",
          { informationClaimAction: { claimId: "kazimierz-campaign-knight-panic", action: "receive" } }
        ]),
        $terraData.K("記事を追わず、二つ目の主張は受け取らない", {}, [
          1,
          "記事は受け取らず、売り子に礼を言って立ち去った。",
          {}
        ])
      ]
    },
    {
      id: "sr_kazimierz_outage_statement_followup",
      conf: "S",
      references: ["SRC_NL_VOICE_OF_ROSEBUD", "SRC_KAZIMIERZ_INFO_ROUTE_MODEL", "SRC_V88_INFO_BOUNDARIES"],
      st: ["青年", "壮年", "老年"],
      need: ["国:カジミエーシュ"],
      ge: { year: 1098 },
      le: { year: 1110 },
      cd: 2,
      w: 0.18,
      show: s => {
        const claim = s.informationClaims?.find(row => row.id === "kazimierz-campaign-knight-panic");
        return !!claim && !claim.pursuitStopped && claim.recordedYear < s.year;
      },
      t: "二つの記事を机に並べた。第9号には停電した区画の復旧、第10号にはマッキーの監査会批判が載っている。誰かに話すか、掲示の規則を見に行くか、切り抜きをしまうか考えた。",
      c: [
        $terraData.K(
          "商業連合会側の非難を、同居する配偶者へ伝える",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "spouse", "kazimierz-campaign-knight-panic")
          },
          [
            1,
            "マッキーの非難を、商業連合会側の言い分として配偶者へ伝えた。",
            {
              informationClaimAction: {
                claimId: "kazimierz-campaign-knight-panic",
                action: "share-unverified-household"
              }
            }
          ]
        ),
        $terraData.K(
          "商業連合会側の非難を、父へ伝える",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "father", "kazimierz-campaign-knight-panic")
          },
          [
            1,
            "マッキーの非難を、商業連合会側の言い分として父に話した。",
            {
              informationClaimAction: {
                claimId: "kazimierz-campaign-knight-panic",
                action: "share-unverified-close-person",
                recipientKind: "father"
              }
            }
          ]
        ),
        $terraData.K(
          "商業連合会側の非難を、母へ伝える",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "mother", "kazimierz-campaign-knight-panic")
          },
          [
            1,
            "マッキーの非難を、商業連合会側の言い分として母に話した。",
            {
              informationClaimAction: {
                claimId: "kazimierz-campaign-knight-panic",
                action: "share-unverified-close-person",
                recipientKind: "mother"
              }
            }
          ]
        ),
        $terraData.K(
          "商業連合会側の非難を、友人へ伝える",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "friend", "kazimierz-campaign-knight-panic")
          },
          [
            1,
            "マッキーの非難を、商業連合会側の言い分として友人に話した。",
            {
              informationClaimAction: {
                claimId: "kazimierz-campaign-knight-panic",
                action: "share-unverified-close-person",
                recipientKind: "friend"
              }
            }
          ]
        ),
        $terraData.K(
          "競技会場の仕事中、休憩時に同じ持ち場の人へ伝える",
          {
            show: s =>
              !!$rules.information.informationClaimWorkplaceTarget(s, "kazimierz-campaign-knight-panic")
          },
          [
            1,
            "休憩中、同じ持ち場でマッキーの監査会批判を話題にした。",
            {
              informationClaimAction: {
                claimId: "kazimierz-campaign-knight-panic",
                action: "present-unverified-to-workplace"
              }
            }
          ]
        ),
        $terraData.K("国民評議会の非常時入城規則を掲示で照合する", {}, [
          1,
          "市内掲示を見に行くと、非常時の征戦騎士入城は認められるとあった。掲示の文を切り抜きの余白に書き留めた。",
          {
            informationClaimAction: {
              claimId: "kazimierz-campaign-knight-panic",
              action: "verify-emergency-entry-rule"
            }
          }
        ]),
        $terraData.K("この主張は伝えず、ここで追跡を終える", {}, [
          1,
          "記事を誰にも話さず、切り抜きを机へ戻した。",
          { informationClaimAction: { claimId: "kazimierz-campaign-knight-panic", action: "stop-pursuit" } }
        ])
      ]
    }
  ];
});
