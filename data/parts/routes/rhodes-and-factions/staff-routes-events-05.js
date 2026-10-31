// routes/rhodes-and-factions/staff-routes-events-05: construction fragment; evaluation order is declared by data/routes/rhodes-and-factions.js.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/staff-routes-events-05"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  return [
    {
      id: "sr_information_claim_organization_meeting",
      conf: "S",
      references: ["SRC_INFORMATION_CLAIM_ORGANIZATION_ROUTE", "SRC_V88_INFO_BOUNDARIES"],
      st: ["青年", "壮年", "老年"],
      need: ["国:ヴィクトリア", "事件:londinium_war"],
      ban: ["都市:ロンディニウム"],
      ge: { year: 1099 },
      le: { year: 1110 },
      cd: 1,
      once: true,
      w: 0.18,
      show: s => $rules.information.informationClaimOrganizationTargets(s).length > 0,
      t: "運営に加わっている地域の会合で、家計や物資の話題が出た。市場で聞いた値上がりの噂と、別の店で聞いた穀物の話を持ち出すか、黙っておくか考えた。",
      c: [
        $terraData.K(
          "住民会で、市場の値上がりの噂を話す",
          {
            show: s =>
              !!$rules.information.informationClaimOrganizationTarget(
                s,
                "londinium-market-price-rise",
                "infected-exclusion"
              )
          },
          [
            1,
            "会合の席で、市場で聞いた値上がりの噂を話した。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "present-unverified-to-organization",
                organizationId: "infected-exclusion"
              }
            }
          ]
        ),
        $terraData.K(
          "互助組織で、市場の値上がりの噂を話す",
          {
            show: s =>
              !!$rules.information.informationClaimOrganizationTarget(
                s,
                "londinium-market-price-rise",
                "infected-mutual-aid"
              )
          },
          [
            1,
            "互助組織の会合で、市場で聞いた値上がりの噂を話した。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "present-unverified-to-organization",
                organizationId: "infected-mutual-aid"
              }
            }
          ]
        ),
        $terraData.K(
          "住民会で、別の店の穀物の話を伝える",
          {
            show: s =>
              !!$rules.information.informationClaimOrganizationTarget(
                s,
                "londinium-grain-price-stability",
                "infected-exclusion"
              )
          },
          [
            1,
            "会合の席で、別の店の売り手から聞いた穀物の値段の話をした。",
            {
              informationClaimAction: {
                claimId: "londinium-grain-price-stability",
                action: "present-unverified-to-organization",
                organizationId: "infected-exclusion"
              }
            }
          ]
        ),
        $terraData.K(
          "互助組織で、別の店の穀物の話を伝える",
          {
            show: s =>
              !!$rules.information.informationClaimOrganizationTarget(
                s,
                "londinium-grain-price-stability",
                "infected-mutual-aid"
              )
          },
          [
            1,
            "互助組織の会合で、別の店の売り手から聞いた穀物の値段の話をした。",
            {
              informationClaimAction: {
                claimId: "londinium-grain-price-stability",
                action: "present-unverified-to-organization",
                organizationId: "infected-mutual-aid"
              }
            }
          ]
        ),
        $terraData.K(
          "住民会で、二つの店の値段の話を伝える",
          {
            show: s =>
              !!$rules.information.informationClaimOrganizationConflictTarget(s, "infected-exclusion")
          },
          [
            1,
            "市場で聞いた値上がりの噂と、別の店の売り手の話を続けて紹介した。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "present-conflicting-claims-to-organization",
                organizationId: "infected-exclusion"
              }
            }
          ]
        ),
        $terraData.K(
          "互助組織で、二つの店の値段の話を伝える",
          {
            show: s =>
              !!$rules.information.informationClaimOrganizationConflictTarget(s, "infected-mutual-aid")
          },
          [
            1,
            "市場で聞いた値上がりの噂と、別の店の売り手の話を続けて紹介した。",
            {
              informationClaimAction: {
                claimId: "londinium-market-price-rise",
                action: "present-conflicting-claims-to-organization",
                organizationId: "infected-mutual-aid"
              }
            }
          ]
        ),
        $terraData.K("今回は会合でこの話を出さない", {}, [
          1,
            "会合では市場の話を出さず、ほかの人の意見を聞いていた。",
          {}
        ])
      ]
    }
  ];
});
