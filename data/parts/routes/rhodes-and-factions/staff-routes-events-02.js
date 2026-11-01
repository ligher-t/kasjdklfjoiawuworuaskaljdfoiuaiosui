// routes/rhodes-and-factions/staff-routes-events-02: construction fragment; evaluation order is declared by data/routes/rhodes-and-factions.js.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/staff-routes-events-02"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  return [
    {
      id: "sr_ursus_civilian_account",
      conf: "S",
      references: ["SRC_SR_CHERNOB_CIVILIAN", "SRC_SR_GAME_MODEL", "SRC_V88_INFO_BOUNDARIES"],
      st: ["青年", "壮年", "老年"],
      need: ["国:ウルサス"],
      ge: { year: 1097 },
      le: { year: 1098 },
      once: true,
      w: 0.2,
      show: s =>
        !!s.world?.events?.chernobog_incident &&
        s.home === "移動都市" &&
        s.res?.n === "ウルサス",
      t: "支援所の片隅で、チェルノボーグから来た人が声を落とした。「レユニオンの人が、街を出る道を教えてくれた」と言う。手にした金属の器は冷えきっていた。",
      c: [
        $terraData.K("その人の話を手帳に書き留める", {}, [
          1,
          "「レユニオンの人に道を教えられた」と手帳に書いた。語り終えた人は、冷えた器を両手で包んだ。",
          { informationClaimAction: { claimId: "ursus-reunion-evacuation-account", action: "receive" } }
        ]),
        $terraData.K("話を聞き、手帳には書かずに別れる", {}, [
          1,
          "話は聞いたが、手帳には書き留めなかった。支援所を出ても、声の震えが耳に残っていた。",
          {}
        ])
      ]
    },
    {
      id: "sr_ursus_civilian_account_followup",
      conf: "S",
      references: ["SRC_SR_CHERNOB_CIVILIAN", "SRC_SR_GAME_MODEL", "SRC_V88_INFO_BOUNDARIES"],
      st: ["青年", "壮年", "老年"],
      need: ["国:ウルサス"],
      once: true,
      ge: { year: 1098 },
      le: { year: 1110 },
      cd: 2,
      w: 0.18,
      show: s =>
        !!s.world?.events?.chernobog_incident &&
        s.home === "移動都市" &&
        s.res?.n === "ウルサス" &&
        s.informationClaims?.some(
          row =>
            row.id === "ursus-reunion-evacuation-account" &&
            !row.pursuitStopped &&
            row.recordedYear < s.year &&
            (!row.assessments ||
              row.assessments.length === 0 ||
              (row.evidence?.length || 0) > (row.assessments.at(-1)?.evidenceCount || 0))
        ),
      t: "支援所で聞いた避難者の話を、手帳に書いたままにしていた。レユニオンの人が逃げ道を示したという。友人や家族に話すなら、誰から聞いた話かも伝えようと思った。",
      c: [
        $terraData.K("あの人自身の経験として受け止める", {}, [
          1,
          "話していた人の様子を思い返した。あの人にとっては、チェルノボーグを出る手がかりになったのだろう。",
          {
            informationClaimAction: {
              claimId: "ursus-reunion-evacuation-account",
              action: "assess-plausible"
            }
          }
        ]),
        $terraData.K("真偽は決めず、聞いた話だけ手帳に残す", {}, [
          1,
          "語った人の言葉を手帳に残し、話が本当かどうかは決めずにしまった。",
          {
            informationClaimAction: {
              claimId: "ursus-reunion-evacuation-account",
              action: "assess-undetermined"
            }
          }
        ]),
        $terraData.K("話の真偽を疑い、周りには伝えない", {}, [
          1,
          "手帳の言葉を読み返したが、街を確かめる手がかりはなかった。友人には話さず、手帳をしまった。",
          {
            informationClaimAction: {
              claimId: "ursus-reunion-evacuation-account",
              action: "assess-doubtful"
            }
          }
        ]),
        $terraData.K(
          "一人から聞いた話として、友人へ伝える",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "friend", "ursus-reunion-evacuation-account")
          },
          [
            1,
            "支援所で会った避難者の話として、レユニオンの人が道を教えたと友人に伝えた。",
            {
              informationClaimAction: {
                claimId: "ursus-reunion-evacuation-account",
                action: "share-unverified-close-person",
                recipientKind: "friend"
              }
            }
          ]
        ),
        $terraData.K(
          "一人から聞いた話として、父へ伝える",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "father", "ursus-reunion-evacuation-account")
          },
          [
            1,
            "支援所で聞いた避難者の話として、レユニオンの人が街を出る道を教えたと父に伝えた。",
            {
              informationClaimAction: {
                claimId: "ursus-reunion-evacuation-account",
                action: "share-unverified-close-person",
                recipientKind: "father"
              }
            }
          ]
        ),
        $terraData.K(
          "一人から聞いた話として、母へ伝える",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "mother", "ursus-reunion-evacuation-account")
          },
          [
            1,
            "支援所で聞いた避難者の話として、レユニオンの人が街を出る道を教えたと母に伝えた。",
            {
              informationClaimAction: {
                claimId: "ursus-reunion-evacuation-account",
                action: "share-unverified-close-person",
                recipientKind: "mother"
              }
            }
          ]
        ),
        $terraData.K("この証言を広めず、追跡を終える", {}, [
          1,
          "名前を書いたページを閉じ、手帳を引き出しにしまった。",
          {
            informationClaimAction: { claimId: "ursus-reunion-evacuation-account", action: "stop-pursuit" }
          }
        ])
      ]
    },
    {
      id: "sr_londinium_distant_news",
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
      ge: { year: 1098 },
      le: { year: 1098 },
      months: [7, 8, 9],
      once: true,
      w: 0.28,
      t: "ロンディニウムで戦闘が続いていると受信機が伝えた。市場では穀物が値上がりするという話が立ち、店先の値札を確かめる人が増えた。",
      c: [
        $terraData.K("必要な品を買い足し、市場で聞いた話を手帳に残す", {}, [
          1,
          "必要なものを買い足し、売り手の言葉を手帳に書き留めた。買い物袋はいつもより少し重くなった。",
          {
            p: 1,
            k: 1,
            informationResponseAction: { factId: "londinium_war", response: "household-preparation" },
            informationClaimAction: { claimId: "londinium-market-price-rise", action: "receive" }
          }
        ]),
        $terraData.K("地域の受入窓口で配給や相談の予定を尋ねる", {}, [
          1,
          "近くの窓口で、配給の予定を尋ねた。返事を待つ列の向こうで、係員が次の紙を壁に貼った。",
          {
            rl: 1,
            k: 1,
            informationResponseAction: { factId: "londinium_war", response: "look-up-relief" },
            informationClaimAction: { claimId: "londinium-market-price-rise", action: "receive" }
          }
        ]),
        $terraData.K("市場の話を人に伝えず、普段の仕事へ戻る", {}, [
          1,
          "市場の話は口にせず、いつもの荷運びに戻った。帰り道は、昨日と同じ通りを歩いた。",
          {
            p: 1,
            informationResponseAction: { factId: "londinium_war", response: "withhold-unverified-report" },
            informationClaimAction: { claimId: "londinium-market-price-rise", action: "receive" }
          }
        ])
      ]
    },
    {
      id: "sr_londinium_price_followup",
      conf: "S",
      references: ["SRC_TL_LONDINIUM_WINDOW", "SRC_SR_LONDINIUM_SIGNAL", "SRC_V88_INFO_BOUNDARIES"],
      st: ["青年", "壮年", "老年"],
      need: ["国:ヴィクトリア", "事件:londinium_war"],
      ban: ["都市:ロンディニウム"],
      ge: { year: 1099 },
      le: { year: 1110 },
      cd: 2,
      w: 0.26,
      show: s => {
        const claim = s.informationClaims?.find(row => row.id === "londinium-market-price-rise");
        return !!claim && !claim.pursuitStopped && claim.recordedYear < s.year;
      },
      t: "市場へ行くたび、穀物の札を見てしまう。戦争の話を聞いた頃より高くなった気がするが、覚えている値段は店ごとに違った。",
      c: [
        $terraData.K("店の値札を帳面に控える", {}, [
          1,
          "一軒の値札を帳面に控えた。買う分を決めるまで、かごを持ったまま少し迷った。",
          {
            informationClaimAction: { claimId: "londinium-market-price-rise", action: "observe-one-stall" }
          }
        ]),
        $terraData.K(
          "値上がりの可能性として、同居する配偶者へ伝える",
          { show: s => $rules.information.canShareInformationClaim(s, "spouse") },
          [
            1,
            "市場で聞いた値上がりの話を、同居する配偶者にそのまま伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "share-unverified-household"
              }
            }
          ]
        ),
        $terraData.K(
          "父へ、市場で聞いた値上がりの話を伝える",
          { show: s => $rules.information.canShareInformationClaim(s, "father") },
          [
            1,
            "市場で聞いた値上がりの話を、父にそのまま伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "share-unverified-close-person",
                recipientKind: "father"
              }
            }
          ]
        ),
        $terraData.K(
          "母へ、市場で聞いた値上がりの話を伝える",
          { show: s => $rules.information.canShareInformationClaim(s, "mother") },
          [
            1,
            "市場で聞いた値上がりの話を、母にそのまま伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "share-unverified-close-person",
                recipientKind: "mother"
              }
            }
          ]
        ),
        $terraData.K(
          "友人へ、市場で聞いた値上がりの話を伝える",
          { show: s => $rules.information.canShareInformationClaim(s, "friend") },
          [
            1,
            "市場で聞いた値上がりの話を、友人にそのまま伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "share-unverified-close-person",
                recipientKind: "friend"
              }
            }
          ]
        ),
        $terraData.K("確認を続けず、話を広めない", {}, [
          1,
          "手帳を閉じ、いつもの量を買って市場を出た。",
          { informationClaimAction: { claimId: "londinium-market-price-rise", action: "stop-pursuit" } }
        ]),
        $terraData.K(
          "値上がりの話を信じ、次の買い物も値札を確かめる",
          {
            show: s => {
              const q = s.informationClaims?.find(row => row.id === "londinium-market-price-rise"),
                last = q?.assessments?.at(-1);
              return !!q && (!last || (q.evidence?.length || 0) > last.evidenceCount);
            }
          },
          [
            1,
            "値上がりの話が気にかかり、買い物のたびに値札を確かめることにした。",
            {
              informationClaimAction: { claimId: "londinium-market-price-rise", action: "assess-plausible" }
            }
          ]
        ),
        $terraData.K(
          "まだ決めず、次に市場へ行った時も値札を見る",
          {
            show: s => {
              const q = s.informationClaims?.find(row => row.id === "londinium-market-price-rise"),
                last = q?.assessments?.at(-1);
              return !!q && (!last || (q.evidence?.length || 0) > last.evidenceCount);
            }
          },
          [
            1,
            "前に見た値段を思い出そうとしたが、はっきりしなかった。次の市でも値札を確かめることにした。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "assess-undetermined"
              }
            }
          ]
        ),
        $terraData.K(
          "値上がりの話を疑い、買い置きを控える",
          {
            show: s => {
              const q = s.informationClaims?.find(row => row.id === "londinium-market-price-rise"),
                last = q?.assessments?.at(-1);
              return !!q && (!last || (q.evidence?.length || 0) > last.evidenceCount);
            }
          },
          [
            1,
            "値上がりの話を疑い、買い置きはせず今日の分だけ買った。",
            {
              informationClaimAction: { claimId: "londinium-market-price-rise", action: "assess-doubtful" }
            }
          ]
        ),
        $terraData.K(
          "別の売り手の話も帳面に控える",
          { show: s => !s.informationClaims?.some(row => row.id === "londinium-grain-price-stability") },
          [
            1,
            "別の店の売り手は、穀物の値は当面変わらないと言った。先に聞いた話と食い違い、帳面の同じ欄に二つの話を書いた。",
            { informationClaimAction: { claimId: "londinium-grain-price-stability", action: "receive" } }
          ]
        )
      ]
    },
    {
      id: "sr_londinium_claim_conflict_followup",
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
      cd: 1,
      w: 0.2,
      show: s => $rules.information.informationClaimConflictRecipients(s).length > 0,
      t: "値上がりするという噂と、穀物の値は変わらないという売り手の話を両方聞いた。家の帳面を見ながら、買い置きするか、いつも通りにするか迷った。",
      c: [
        $terraData.K(
          "同居する配偶者に、市場で聞いた二つの話を伝える",
          { show: s => !!$rules.information.informationClaimConflictRecipientTarget(s, "spouse") },
          [
            1,
            "市場で聞いた二つの話を、同居する配偶者に伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "share-conflicting-claims-close-person",
                recipientKind: "spouse"
              }
            }
          ]
        ),
        $terraData.K(
          "父に、市場で聞いた二つの話を伝える",
          { show: s => !!$rules.information.informationClaimConflictRecipientTarget(s, "father") },
          [
            1,
            "市場で聞いた二つの話を父に伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "share-conflicting-claims-close-person",
                recipientKind: "father"
              }
            }
          ]
        ),
        $terraData.K(
          "母に、市場で聞いた二つの話を伝える",
          { show: s => !!$rules.information.informationClaimConflictRecipientTarget(s, "mother") },
          [
            1,
            "市場で聞いた二つの話を母に伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "share-conflicting-claims-close-person",
                recipientKind: "mother"
              }
            }
          ]
        ),
        $terraData.K(
          "友人に、市場で聞いた二つの話を伝える",
          { show: s => !!$rules.information.informationClaimConflictRecipientTarget(s, "friend") },
          [
            1,
            "市場で聞いた二つの話を友人に伝えた。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "share-conflicting-claims-close-person",
                recipientKind: "friend"
              }
            }
          ]
        ),
        $terraData.K("話を広めず、買い物を続ける", {}, [
          1,
          "市場の話は誰にも伝えず、必要な食料を買って帰った。",
          { informationClaimAction: { claimId: "londinium-market-price-rise", action: "stop-pursuit" } }
        ])
      ]
    }
  ];
});
