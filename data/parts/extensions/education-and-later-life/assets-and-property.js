// extensions/education-and-later-life/assets-and-property: construction fragment; evaluation order is declared by data/extensions/education-and-later-life.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/education-and-later-life",
  "extensions/education-and-later-life/assets-and-property"
)(function ($terraData, $define, $rules) {
  "use strict";

  $terraData.EV.push(
    // --- 持ち家・定住権の購入 ---
    {
      id: "asset_choice_property_purchase",
      conf: "S",
      references: ["SRC_TERRA_HOUSING_CONTEXT", "SRC_TERRA_LIFECOURSE"],
      st: ["壮年", "老年"],
      once: true,
      cd: 5,
      w: 0.35,
      show: s => (s.cash || 0) >= 2500000 && (s.investment || 0) < 2000000 && !s.fl?.housing_exclusion && s.residenceArrangement !== "independent_owned",
      t: "長年蓄えてきた手元の資金を確かめ、都市の不動産区画で自己所有の居住権（持ち家・アパート）を購入する好機が訪れた。家賃の支払いから解放され、地に足をつけた定住の拠点を手に入れられる。",
      c: [
        $terraData.K(
          "居住区のアパートを購入して持ち家とする（費用 2,500,000）",
          { en: { ge: { cash: 2500000 } }, why: "購入資金が足りない" },
          [
            1,
            "公証役場で契約書に署名し、居住区画の鍵を受け取った。家賃の督促から解放され、自分だけの城を手に入れた満足感が胸を満たした。",
            { cash: -2500000, investment: 2000000, p: 6, rl: 3, residenceArrangement: "independent_owned" }
          ]
        ),
        $terraData.K(
          "手元の現金を温存し、今は賃貸のまま暮らす",
          {},
          [
            1,
            "まとまった現金を使い果たすリスクを避け、賃貸生活を続けることにした。手元に残った蓄えを頼りに、暮らしの安全を優先した。",
            { p: 1 }
          ]
        )
      ]
    },
    {
      id: "asset_daily_property_comfort",
      conf: "S",
      references: ["SRC_TERRA_HOUSING_CONTEXT", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
      st: ["壮年", "老年"],
      cd: 3,
      w: 0.45,
      show: s => (s.investment || 0) >= 2000000,
      t: "自ら買い取った住まいの壁を塗り直し、居心地の良い家具を整えた。毎月の家賃の心配がない生活は、心に大きな余裕と安定をもたらしている。",
      fx: { p: 2, h: 1 }
    },

    // --- 自前工房・店舗の開業 ---
    {
      id: "asset_choice_workshop_open",
      conf: "S",
      references: ["SRC_INDUSTRIAL_LIFE", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      cd: 5,
      w: 0.35,
      show: s => (s.cash || 0) >= 1200000 && (s.k || 0) >= 30,
      t: "これまでに培った技術と知見を活かし、自らの看板を掲げて小さな工房や店舗（仕立て屋、パン屋、修理工房、薬草店）を開業する相談を持ちかけられた。",
      c: [
        $terraData.K(
          "自己資金を投じて店舗・工房を開業する（費用 1,200,000）",
          { en: { ge: { cash: 1200000 } }, why: "開業資金が足りない" },
          [
            1,
            "通り沿いの空き店舗を借りて作業台と看板を据え、念願の独立を果たした。近隣の住人が珍しそうに覗き込み、最初の手仕事の依頼が舞い込んだ。",
            { cash: -1200000, investment: 1200000, p: 5, k: 3 }
          ]
        ),
        $terraData.K(
          "独立のリスクを避け、雇われの身分を維持する",
          {},
          [
            1,
            "事業主となる責任と経営リスクを慎重に測り、今は独立を見送った。堅実な働き方を続け、安定した日々の糧を選んだ。",
            { p: 1 }
          ]
        )
      ]
    },
    {
      id: "asset_daily_workshop_revenue",
      conf: "S",
      references: ["SRC_INDUSTRIAL_LIFE", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
      st: ["青年", "壮年", "老年"],
      cd: 3,
      w: 0.45,
      show: s => (s.investment || 0) >= 1000000,
      t: "工房の店先で注文主と打ち合わせをし、丹精込めて仕上げた品を納品した。手渡された代金を金庫に収め、自らの腕で稼ぎ出す手応えを噛み締めた。",
      fx: { cash: 25000, p: 2, k: 1 }
    },

    // --- クルビア民間医療保険 ---
    {
      id: "asset_choice_catastrophe_insurance",
      conf: "S",
      references: ["SRC_COLUMBIA_INSURANCE", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      cd: 4,
      w: 0.35,
      show: s => s.res?.n === "クルビア" && !s.fl?.insured,
      t: "クルビアの民間保険会社から、治療費の負担を軽くする医療保険の案内が届いた。契約を続けるには、年ごとの更新料を納める必要がある。",
      c: [
        $terraData.K(
          "初年度の保険料を納めて加入する",
          { en: { affordableCash: 150000 }, why: "初年度の保険料を払える現金が足りない" },
          [
            1,
            "窓口で契約内容を確かめて署名し、初年度の保険料を納めた。次の更新までは、契約で定められた範囲の治療費補助を受けられる。",
            { cash: -150000, fl: { insured: 1 }, p: 2 }
          ]
        ),
        $terraData.K(
          "今回は加入を見送る",
          {},
          [
            1,
            "案内を畳んで持ち帰り、今年は保険料を払わずに暮らすことにした。",
            { p: 0 }
          ]
        )
      ]
    }
  );
});
