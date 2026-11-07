function renderEconomyPanel(s, services) {
  const flow = s.flow || {},
    annualDeathEstimate = !!s.dead && flow.year === s.year,
    flowNames = {
      living: "生活費",
      travelFare: "旅程の交通費",
      travelStay: "旅先で追加した食宿費",
      spouseLiving: "配偶者の生活費",
      medical: "本人・家族の療養費（通院移動分を除く）",
      medicalTravel: "療養に伴う通院移動",
      insurance: "保険料",
      hobby: "趣味",
      pet: "飼育動物",
      children: "子の食費・衣類・療養費",
      childHousing: "同居する成人子の住居・共益費",
      childEducation: "子の学業支援",
      childRemittance: "別居した子への送金",
      divorceChildSupport: "離婚後の子への任意支援",
      spouseCare: "配偶者の療養",
      spouseSeparateSupport: "別居配偶者への支援",
      spouseSeparateContact: "別居配偶者との連絡",
      parentTreatment: "親の療養費支援",
      familyCare: "親族の療養支援",
      familyContribution: "家計への拠出",
      education: "本人が納付した教育費（返金分控除後）",
      siblingCare: "同居感染きょうだいの療養費",
      siblingCareSupport: "別居きょうだいへの療養支援"
    };
  const flowRows = Object.entries(flow.expense || {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => [flowNames[k] || k, services.m(v)]);
  // Render from already settled entries only; the panel never issues bills,
  // migrates a save, or evaluates a candidate school's hidden prices.
  const finance=s.educationFinance,
    ledger=finance && !Array.isArray(finance.receipts) ? finance : null,
    studentReceipts=Object.values(ledger?.receipts||{}).filter(x=>
      x.status==="settled" && x.paidAt?.year===s.year),
    thisYearRefunds=Object.values(ledger?.refunds||{}).filter(x=>
      x.status==="settled" && x.refundedAt?.year===s.year),
    paidBy=source=>studentReceipts.filter(x=>x.source===source)
      .reduce((n,x)=>n+x.amount,0)-
      thisYearRefunds.flatMap(x=>x.allocation||[]).filter(x=>x.source===source)
        .reduce((n,x)=>n+x.amount,0),
    personalEducation=ledger?paidBy("personal"):
      s.educationAnnualFee?.year===s.year?(s.educationAnnualFee.paidByPersonal||0):0,
    householdEducation=ledger?paidBy("household"):
      s.educationAnnualFee?.year===s.year?(s.educationAnnualFee.paidByHousehold||0):0,
    tuitionOutstanding=Object.values(ledger?.invoices||{}).filter(x=>
      x.kind==="tuition" && x.status!=="void")
      .reduce((n,x)=>n+x.outstanding,0),
    studentCreditBalance=(s.loanContracts||[]).filter(x=>
      x.kind==="education-credit" && x.balance>0)
      .reduce((n,x)=>n+x.balance,0);
  services.$("fn").innerHTML = [
    ["家計状態", services.householdStrained(s) ? "逼迫" : "逼迫判定なし"],
    ["現在の経済階層", s.w.n],
    ["出生時の家計階層", (s.originWealth || s.w).n],
    ["本人の貯蓄", services.m(s.cash)],
    [
      "投資持分（換金前）",
      s.investment > 0
        ? services.m(s.investment) +
          "（" +
          (s.investmentType || "出資先未記録") +
          "・直近年 " +
          (s.investmentDelta > 0 ? "+" : "") +
          services.m(s.investmentDelta || 0) +
          "）"
        : services.m(0)
    ],
    ["負債", services.m(s.debt)],
    ["うち学生貸付の未返済契約残高", services.m(studentCreditBalance)],
    ["現在の教育機関への授業料未納額（別建て）", services.m(tuitionOutstanding)],
    ["当年教育費：本人財布からの実支払", services.m(personalEducation)],
    ["当年教育費：家計財布からの実支払", services.m(householdEducation)],
    ["本人の純資産", services.m(s.cash + (s.investment || 0) - s.debt)],
    [
      "固定資産・事業持分",
      (s.investment || 0) >= 2000000
        ? `持ち家・居住権所有（評価額 ${services.m(s.investment)}・家賃免除）`
        : (s.investment || 0) >= 1000000
          ? `自営工房・事業持分（出資額 ${services.m(s.investment)}）`
          : (s.investment || 0) > 0
            ? `共同事業持分（${services.m(s.investment)}）`
            : "なし（賃貸・一般住居）"
    ],
    [
      "天災総合保険",
      s.fl?.insured ? "加入中（天災被災時の生活再建補償あり）" : "未加入"
    ],
    [annualDeathEstimate ? "死亡年の年収（12か月換算）" : "年収", services.m(s.inc)],
    [annualDeathEstimate ? "死亡年の支出（12か月換算）" : "年間支出", services.m(s.exp)],
    [annualDeathEstimate ? "死亡年の収支（12か月換算）" : "年間収支", services.m(s.inc - s.exp)],
    ...(annualDeathEstimate
      ? [["死亡年の収支の扱い", "年次モデルによる12か月分の推計です。死亡時点までに受け取った実収入・実支出ではありません。"]]
      : []),
    ["生活費上昇指数", `${(s.priceIndex || 1).toFixed(2)}（給金は値上がりの一部を追随）`],
    [
      "直近年の収入内訳",
      `本人 ${services.m(flow.income?.wages || 0)}・配偶者 ${services.m(flow.income?.spouse || 0)}・子 ${services.m(flow.income?.children || 0)}・支援 ${services.m(flow.income?.support || 0)}・旅先の仕事 ${services.m(flow.income?.travelWork || 0)}`
    ],
    [
      "支出内訳",
      flowRows.length ? flowRows.map(([k, v]) => `${k} ${v}`).join("・") : "内訳は次の年次更新後に表示"
    ]
  ]
    .map(([label, value]) => `<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`)
    .join("");
  services.$("fh").innerHTML = services.annualEconomyHistoryMarkup(s.flowHistory);
  services.$("ch").innerHTML = services.choiceEconomyHistoryMarkup(s.moneyLog);
}
