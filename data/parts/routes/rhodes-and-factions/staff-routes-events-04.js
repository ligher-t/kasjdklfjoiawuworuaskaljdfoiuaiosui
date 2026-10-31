// routes/rhodes-and-factions/staff-routes-events-04: construction fragment; evaluation order is declared by data/routes/rhodes-and-factions.js.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/staff-routes-events-04"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  return [
    {
      id: "sr_kazimierz_claim_correction",
      conf: "S",
      references: [
        "SRC_NL_EMERGENCY_ENTRY_RULE",
        "SRC_KAZIMIERZ_INFO_ROUTE_MODEL",
        "SRC_V88_INFO_BOUNDARIES"
      ],
      st: ["青年", "壮年", "老年"],
      need: ["国:カジミエーシュ", "事件:kazimierz_major"],
      ge: { year: 1098 },
      le: { year: 1110 },
      cd: 1,
      w: 0.18,
      show: s =>
        s.res?.n === "カジミエーシュ" &&
        (["spouse", "father", "mother", "friend"].some(kind =>
          $rules.information.canCorrectInformationClaim(s, kind)
        ) ||
          !!$rules.information.informationClaimWorkplaceCorrectionTarget(s)),
      t: "街角の掲示で、非常時には征戦騎士の入城が認められるという国民評議会の規則を読んだ。前にマッキーの監査会批判を話した相手へ、この規則も伝えるか、同じ持ち場で話すか考えた。",
      c: [
        $terraData.K(
          "掲示の入城規則を、同居する配偶者へ伝える",
          { show: s => $rules.information.canCorrectInformationClaim(s, "spouse") },
          [
            1,
            "同居する配偶者に掲示を見せ、非常時の征戦騎士入城は規則で認められると伝えた。前に話した記事の切り抜きにも、その文を書き添えた。",
            {
              informationClaimAction: {
                claimId: "kazimierz-campaign-knight-panic",
                action: "correct-prior-recipient",
                recipientKind: "spouse"
              }
            }
          ]
        ),
        $terraData.K(
          "掲示の入城規則を、父へ伝える",
          { show: s => $rules.information.canCorrectInformationClaim(s, "father") },
          [
            1,
            "父に掲示を見せ、非常時の征戦騎士入城は規則で認められると伝えた。前に話した記事の切り抜きにも、その文を書き添えた。",
            {
              informationClaimAction: {
                claimId: "kazimierz-campaign-knight-panic",
                action: "correct-prior-recipient",
                recipientKind: "father"
              }
            }
          ]
        ),
        $terraData.K(
          "掲示の入城規則を、母へ伝える",
          { show: s => $rules.information.canCorrectInformationClaim(s, "mother") },
          [
            1,
            "母に掲示を見せ、非常時の征戦騎士入城は規則で認められると伝えた。前に話した記事の切り抜きにも、その文を書き添えた。",
            {
              informationClaimAction: {
                claimId: "kazimierz-campaign-knight-panic",
                action: "correct-prior-recipient",
                recipientKind: "mother"
              }
            }
          ]
        ),
        $terraData.K(
          "掲示の入城規則を、友人へ伝える",
          { show: s => $rules.information.canCorrectInformationClaim(s, "friend") },
          [
            1,
            "友人に掲示を見せ、非常時の征戦騎士入城は規則で認められると伝えた。前に話した記事の切り抜きにも、その文を書き添えた。",
            {
              informationClaimAction: {
                claimId: "kazimierz-campaign-knight-panic",
                action: "correct-prior-recipient",
                recipientKind: "friend"
              }
            }
          ]
        ),
        $terraData.K(
          "掲示の入城規則を、同じ競技会場の持ち場で伝える",
          { show: s => !!$rules.information.informationClaimWorkplaceCorrectionTarget(s) },
          [
            1,
            "競技会場の休憩中、非常時の征戦騎士入城を認める掲示の文面を同僚に伝えた。",
            {
              informationClaimAction: {
                claimId: "kazimierz-campaign-knight-panic",
                action: "correct-prior-workplace"
              }
            }
          ]
        ),
        $terraData.K("掲示の内容を誰にも伝えない", {}, [
          1,
          "掲示の写しを畳み、鞄にしまった。",
          {}
        ])
      ]
    },
    {
      id: "sr_kazimierz_correction_response",
      conf: "S",
      references: ["SRC_SR_GAME_MODEL", "SRC_V88_INFO_BOUNDARIES", "SRC_KAZIMIERZ_INFO_ROUTE_MODEL"],
      st: ["青年", "壮年", "老年"],
      need: ["国:カジミエーシュ", "事件:kazimierz_major"],
      ge: { year: 1099 },
      le: { year: 1110 },
      cd: 2,
      w: 0.22,
      show: s => !!$rules.information.informationClaimCorrectionResponseTarget(s),
      t: "掲示のそばで、以前に入城規則の話をした相手とまた会った。今なら、あの訂正をどう受け取ったか尋ねられそうだった。",
      c: [
        $terraData.K(
          "同じ相手に、訂正をどう受け取ったか尋ねる",
          { show: s => !!$rules.information.informationClaimCorrectionResponseTarget(s) },
          [
            0.3,
            "相手は掲示に目を戻し、もう少し読みたいと言った。",
            { informationClaimCorrectionResponseAction: { response: "concerned" } }
          ],
          [
            0.5,
            "相手は、規則を読んでもまだ決められないと答えた。",
            { informationClaimCorrectionResponseAction: { response: "undetermined" } }
          ],
          [
            0.7,
            "相手は、自分でも掲示を読み直すと言った。",
            { informationClaimCorrectionResponseAction: { response: "doubtful" } }
          ],
          [
            1,
            "相手は口を閉じ、返事をしなかった。",
            { informationClaimCorrectionResponseAction: { response: "withheld" } }
          ]
        ),
        $terraData.K("今回は訂正の受け止めを尋ねない", {}, [
          1,
          "訂正の話は切り出さず、挨拶だけ交わして別れた。",
          {}
        ])
      ]
    },
    {
      id: "sr_iberia_lighthouse_warning",
      conf: "S",
      references: [
        "SRC_SR_STULTIFERA_NAVIS",
        "SRC_IBERIA_INFORMATION",
        "SRC_IBERIA_MARKET_WARNING_MODEL",
        "SRC_V88_INFO_BOUNDARIES"
      ],
      st: ["青年", "壮年", "老年"],
      need: ["国:イベリア"],
      once: true,
      w: 0.2,
      show: s => s.res?.n === "イベリア",
      t: "イベリアの魚市場で買った塩魚を開くと、包み紙に短い海上警戒の文があった。売り手は誰が書いたか知らないという。何の警戒なのか分からず、手帳に移すか紙ごと捨てるか迷った。",
      c: [
        $terraData.K("文面と見つけた日だけ手帳に写す", {}, [
          1,
          "包み紙の文面と買った日を手帳に書き、紙を畳んだ。",
          { informationClaimAction: { claimId: "iberia-lighthouse-market-warning", action: "receive" } }
        ]),
        $terraData.K("紙のことは書かず、買い物を続ける", {}, [
          1,
          "塩魚を袋に入れ、包み紙を畳んで買い物の続きをした。",
          {}
        ])
      ]
    },
    {
      id: "sr_iberia_warning_followup",
      conf: "S",
      references: [
        "SRC_SR_STULTIFERA_NAVIS",
        "SRC_IBERIA_INFORMATION",
        "SRC_IBERIA_MARKET_WARNING_MODEL",
        "SRC_V88_INFO_BOUNDARIES"
      ],
      st: ["青年", "壮年", "老年"],
      need: ["国:イベリア"],
      once: true,
      cd: 1,
      w: 0.22,
      show: s => {
        const q = s.informationClaims?.find(row => row.id === "iberia-lighthouse-market-warning");
        return (
          s.res?.n === "イベリア" &&
          !!q &&
          !q.pursuitStopped &&
          q.recordedYear < s.year &&
          (!q.assessments ||
            q.assessments.length === 0 ||
            (q.evidence?.length || 0) > (q.assessments.at(-1)?.evidenceCount || 0))
        );
      },
      t: "何日かたっても、包み紙の文が気にかかった。海へ出る人への警告のようにも読めた。手帳に書くか、身近な人へ話すか迷った。",
      c: [
        $terraData.K("海へ出る人への警告かもしれないと手帳に書く", {}, [
          1,
          "海へ出る人への警告かもしれないと書き留めた。その後、塩魚を買うたび包み紙を探した。",
          {
            informationClaimAction: {
              claimId: "iberia-lighthouse-market-warning",
              action: "assess-plausible"
            }
          }
        ]),
        $terraData.K("文面だけ手帳に残し、まだ人には話さない", {}, [
          1,
          "包み紙の文を手帳の隅に写した。場所も理由も分からず、頁を閉じた。",
          {
            informationClaimAction: {
              claimId: "iberia-lighthouse-market-warning",
              action: "assess-undetermined"
            }
          }
        ]),
        $terraData.K("一枚の包み紙のことは気にしすぎない", {}, [
          1,
          "手帳を閉じ、あの文のことは考えないことにした。",
          {
            informationClaimAction: {
              claimId: "iberia-lighthouse-market-warning",
              action: "assess-doubtful"
            }
          }
        ]),
        $terraData.K(
          "父へ包み紙のことを話す",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "father", "iberia-lighthouse-market-warning")
          },
          [
            1,
            "市場で買った塩魚の包み紙に、海上警戒の文があったと父に話した。",
            {
              informationClaimAction: {
                claimId: "iberia-lighthouse-market-warning",
                action: "share-unverified-close-person",
                recipientKind: "father"
              }
            }
          ]
        ),
        $terraData.K(
          "母へ包み紙のことを話す",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "mother", "iberia-lighthouse-market-warning")
          },
          [
            1,
            "市場で買った塩魚の包み紙に、海上警戒の文があったと母に話した。",
            {
              informationClaimAction: {
                claimId: "iberia-lighthouse-market-warning",
                action: "share-unverified-close-person",
                recipientKind: "mother"
              }
            }
          ]
        ),
        $terraData.K(
          "友人へ包み紙のことを話す",
          {
            show: s =>
              $rules.information.canShareInformationClaim(s, "friend", "iberia-lighthouse-market-warning")
          },
          [
            1,
            "市場で買った塩魚の包み紙に、海上警戒の文があったと友人に話した。",
            {
              informationClaimAction: {
                claimId: "iberia-lighthouse-market-warning",
                action: "share-unverified-close-person",
                recipientKind: "friend"
              }
            }
          ]
        ),
        $terraData.K("もう調べず、誰にも話さない", {}, [
          1,
          "包み紙のことは誰にも話さず、売り手にも尋ねなかった。次に同じ店へ行った時も、声をかけずに通り過ぎた。",
          {
            informationClaimAction: { claimId: "iberia-lighthouse-market-warning", action: "stop-pursuit" }
          }
        ])
      ]
    },
    {
      id: "sr_londinium_recipient_response",
      conf: "S",
      references: ["SRC_SR_GAME_MODEL", "SRC_V88_INFO_BOUNDARIES", "SRC_KAZIMIERZ_INFO_ROUTE_MODEL"],
      st: ["青年", "壮年", "老年"],
      cd: 1,
      w: 0.3,
      show: s => !!$rules.information.informationClaimRecipientTarget(s),
      t: "以前、市場の話を伝えた相手と、また顔を合わせた。あの話を今も気にしているだろうか。尋ねるかどうか迷った。",
      c: [
        $terraData.K(
          "同じ相手に、あの市場の話をどう思ったか尋ねる",
          { show: s => !!$rules.information.informationClaimRecipientTarget(s) },
          [
            0.3,
            "「まだ気になっている」と相手は言った。",
            { informationClaimResponseAction: { response: "concerned" } }
          ],
          [
            0.4,
            "「別の話も聞くまでは、何とも言えない」と相手は言った。",
            { informationClaimResponseAction: { response: "undetermined" } }
          ],
          [
            0.6,
            "「ひとつの店の話だけじゃ信じられない」と相手は首を振った。",
            { informationClaimResponseAction: { response: "doubtful" } }
          ],
          [
            1,
            "相手は答えず、目をそらした。",
            { informationClaimResponseAction: { response: "withheld" } }
          ]
        ),
        $terraData.K("今はこの話を尋ねない", {}, [
          1,
          "話題を変え、そのまま別れた。",
          {}
        ])
      ]
    },
    {
      id: "sr_ursus_account_recipient_response",
      conf: "S",
      references: ["SRC_SR_CHERNOB_CIVILIAN", "SRC_SR_GAME_MODEL", "SRC_V88_INFO_BOUNDARIES"],
      st: ["青年", "壮年", "老年"],
      need: ["国:ウルサス"],
      ge: { year: 1098 },
      le: { year: 1110 },
      cd: 1,
      w: 0.22,
      show: s =>
        !!s.world?.events?.chernobog_incident &&
        !!$rules.information.informationClaimRecipientTarget(s, "sr_ursus_account_recipient_response"),
      t: "避難者の話を伝えた相手と、また顔を合わせた。あの人は、あの時の話をどう受け取ったのだろう。",
      c: [
        $terraData.K(
          "同じ相手に、避難者の話をどう思ったか尋ねる",
          {
            show: s =>
              !!$rules.information.informationClaimRecipientTarget(s, "sr_ursus_account_recipient_response")
          },
          [
            0.3,
            "「あの話は気になっている」と相手は言った。",
            { informationClaimResponseAction: { response: "concerned" } }
          ],
          [
            0.4,
            "「あの人の話しか聞いていないから、まだ何とも言えない」と相手は言った。",
            { informationClaimResponseAction: { response: "undetermined" } }
          ],
          [
            0.6,
            "「話だけでは信じきれない」と相手は答えた。",
            { informationClaimResponseAction: { response: "doubtful" } }
          ],
          [
            1,
            "相手は避難者の話には触れず、別の話題を続けた。",
            { informationClaimResponseAction: { response: "withheld" } }
          ]
        ),
        $terraData.K("今回はこの証言について尋ねない", {}, [
          1,
          "今は尋ねず、別れ際に短く手を振った。",
          {}
        ])
      ]
    },
    {
      id: "sr_information_claim_recipient_later_report",
      conf: "S",
      references: ["SRC_INFORMATION_CLAIM_LATER_REPORT", "SRC_V88_INFO_BOUNDARIES"],
      st: ["青年", "壮年", "老年"],
      cd: 1,
      w: 0.24,
      show: s => !!$rules.information.informationClaimLaterReportTarget(s),
      t: "久しぶりに顔を合わせた。あの話を今も覚えているだろうか。聞いてみたいことが、いくつかあった。",
      c: [
        $terraData.K(
          "あの話のことを、今どう思っているか尋ねる",
          { show: s => !!$rules.information.informationClaimLaterReportTarget(s) },
          [
            0.25,
            "「まだ気になって、同じ話を別の人にも聞いている」と相手は言った。",
            { informationClaimLaterResponseAction: { response: "current-concern-more-checking" } }
          ],
          [
            0.5,
            "「別の話も聞いたけれど、まだ決められない」と相手は言った。",
            { informationClaimLaterResponseAction: { response: "counter-source-and-hold" } }
          ],
          [
            0.75,
            "「聞いたけれど、その後は特に何もしなかった」と相手は話した。",
            { informationClaimLaterResponseAction: { response: "no-change-reported" } }
          ],
          [
            1,
            "相手は少し考え込み、やがて別の話題に移った。",
            { informationClaimLaterResponseAction: { response: "not-recalled-or-withheld" } }
          ]
        ),
        $terraData.K("今回はその話を尋ねない", {}, [
          1,
          "今は尋ねず、そのまま別の話を続けた。",
          {}
        ])
      ]
    }
  ];
});
