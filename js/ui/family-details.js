function spouseVisitMarkup(s) {
  const visits = Array.isArray(s.sp?.visitHistory) ? s.sp.visitHistory : [];
  if (!visits.length) return "";
  const shown = visits.slice(-5),
    older = visits.length - shown.length;
  return (
    `<details class="family-visit-history"><summary>配偶者との訪問履歴 ${visits.length}回</summary><p>記録上の累計費用 ${m(s.sp.visitTotal || 0)}` +
    `${older ? `・それ以前の記録 ${older}回` : ""}</p><ol>${shown
      .map(
        visit =>
          `<li>${visit.year}年 ${esc(visit.from)} → ${esc(visit.to)}・${m(visit.fare)}（${visit.paidBy === "household" ? "共有家計" : "本人家計"}）</li>`
      )
      .join("")}` +
    `</ol></details>`
  );
}
function spouseHouseholdArrangementMarkup(s) {
  if (!s.sp) return "";
  const arrangement = s.sp.householdArrangement,
    knownJob = Number.isInteger(s.sp.j) && !!J[s.sp.j],
    apart = !spouseLivesWithProtagonist(s),
    value = apart
      ? arrangement === "caregiving"
        ? `${
            s.sp.residenceMoveNotice && !Number.isInteger(s.sp.residenceMoveNotice.deliveredYear)
              ? "転居先の知らせ待ち"
              : spouseResidenceRegion(s).n === s.res.n
                ? "同じ地域の別世帯で暮らし"
                : spouseKnownResidenceRegion(s).n + "で暮らし"
          }` + `、家事・家族のケアを多く担当`
        : arrangement === "shared" || arrangement === "separate"
          ? knownJob
            ? `別居中。${arrangement === "shared" ? "共同家計" : "個別会計"}から年${m(spouseHouseholdIncome(s))}を合意のうえ分担`
            : `別居中。分担方法は記録済みだが、旧記録で職業が不明なため拠出額は計上しない`
          : `別居中。${spouseKnownResidenceRegion(s).n}で暮らしている。${
              s.sp.residenceMoveNotice && !Number.isInteger(s.sp.residenceMoveNotice.deliveredYear)
                ? "転居先の知らせ待ち。"
                : ""
            }` + `家計分担は未相談のため、配偶者の収入は主人公側の家計に計上しない`
      : arrangement === "caregiving"
        ? "現在は家事・家族のケアを多く担当"
        : arrangement === "shared" || arrangement === "separate"
          ? knownJob
            ? `${arrangement === "shared" ? "共同家計へ" : "個別会計から"}年${m(spouseHouseholdIncome(s))}を${arrangement === "shared" ? "拠出" : "分担"}`
            : "分担方法は記録済み。旧記録で職業が不明なため拠出額は計上しない"
          : "分担方法は未相談。旧記録で職業が不明な場合、収入は計上しない";
  return `<dt>配偶者の家計分担</dt><dd>${value}</dd>`;
}
function spouseHouseholdArrangementSummary(s) {
  const arrangement = s.sp?.householdArrangement;
  if (arrangement === "shared" || arrangement === "separate") {
    const label = arrangement === "shared" ? "共同家計" : "個別会計で分担",
      amount = spouseHouseholdIncome(s);
    return `${label}${amount > 0 ? `（年${m(amount)}）` : "（拠出額未記録）"}`;
  }
  if (arrangement === "caregiving") return "家事・家族のケアを多く担当";
  return "未相談（配偶者収入は主人公家計に加算せず）";
}
function spouseSeparateLifeMarkup(s) {
  const spouse = s.sp;
  if (!spouse || spouseLivesWithProtagonist(s)) return "";
  const contact =
      { regular: "定期的に連絡", letters: "便りを中心に連絡", paused: "連絡を控えている" }[
        spouse.separateContact
      ] || "連絡方法は未相談",
    contactCost = spouseSeparateContactAnnualCost(s),
    support =
      {
        none: "定期送金なし",
        living: `生活費を年${m(spouseSeparateSupportCost(s))}支援`,
        medical:
          spouse.inf && spouse.tx
            ? `治療費を年${m(spouseSeparateSupportCost(s))}支援`
            : spouse.careEverStarted === 1
              ? "療養再開時に費用を分担"
              : "療養開始時に費用を分担"
      }[spouse.separateSupportPlan] || "送金方法は未相談",
    total = spouse.separateSupportPaidTotal ? `・支援累計 ${m(spouse.separateSupportPaidTotal)}` : "",
    contactTotal = spouse.separateContactPaidTotal
      ? `・連絡費累計 ${m(spouse.separateContactPaidTotal)}`
      : "";
  return `<dt>別居中の連絡と支援</dt><dd>${contact}${contactCost ? `（年${m(contactCost)}）` : ""}・${support}${total}${contactTotal}</dd>`;
}
function spouseResidenceMarkup(s) {
  if (!s.sp) return "";
  const region = spouseKnownResidenceRegion(s).n || "現在地（記録未設定）",
    pending = s.sp.residenceMoveNotice && !Number.isInteger(s.sp.residenceMoveNotice.deliveredYear),
    knownNotices = s.sp.residenceNoticeHistory || [],
    visible = (s.sp.residenceHistory || []).filter(
      row =>
        row.decision !== "spouse_relocated" ||
        knownNotices.some(notice => notice.moveYear === row.year) ||
        (pending &&
          s.sp.residenceMoveNotice?.deliveredYear <= s.year &&
          s.sp.residenceMoveNotice?.year === row.year)
    ),
    recent = visible.slice(-5),
    last = recent.at(-1),
    movement =
      last?.decision === "spouse_rejoined"
        ? `・${last.year}年に再合流（移動費 ${m(last.fare || 0)}）`
        : last?.decision === "spouse_relocated"
          ? `・${last.year}年に本人が別地域へ転居（移動費 ${m(last.fare || 0)}）`
          : "",
    history = recent.length
      ? `<details><summary>居住変更の記録 ${visible.length}件</summary><ol>${recent
          .map(
            row =>
              `<li>${row.year}年・${esc(row.from)}から${esc(row.to)}・${
                {
                  follow: "同行",
                  stay: "移動元に残る",
                  spouse_rejoined: "再合流",
                  spouse_relocated: "本人の転居"
                }[row.decision] || "居住変更"
              }` + `${Number.isFinite(row.fare) ? `・移動費 ${m(row.fare)}` : ""}</li>`
          )
          .join("")}` + `</ol></details>`
      : "";
  return (
    `<dt>配偶者の居住地</dt><dd>${region}${
      pending
        ? "（転居先の便り待ち）"
        : spouseLivesWithProtagonist(s)
          ? "（同じ世帯）"
          : spouseResidenceRegion(s).n === s.res.n
            ? "（同じ地域・別世帯）"
            : "（別地域で別居）"
    }` + `${movement}${history}</dd>`
  );
}
function spouseHealthMarkup(s) {
  if (!s.sp) return "";
  if (s.sp.d && s.sp.deathNoticePending)
    return `<dt>配偶者の安否</dt><dd>その後の近況は届いていない。</dd>`;
  if (s.sp.d)
    return `<dt>配偶者の安否</dt><dd>${s.sp.deathKnownYear || s.sp.d}年に死亡の知らせが届いた。${esc(s.sp.deathCause || "死因の詳細は届いていない。")}</dd>`;
  if (!Number.isFinite(s.sp.health)) return "";
  const basis =
    s.sp.healthBasis === "legacy-current-baseline" ? "これまでの様子を踏まえた目安" : "日頃の様子から受ける目安";
  return `<dt>配偶者の体調目安</dt><dd>${Math.round(s.sp.health)}/100（${basis}・医師の診断や寿命の予測ではなく、日頃の様子から受ける大まかな印象${s.sp.healthNoticePending ? "・体調について話し合う時期" : ""}）</dd>`;
}
function spouseWorkMarkup(s) {
  if (!s.sp) return "";
  const job = Number.isInteger(s.sp.j) ? J[s.sp.j]?.n || "不明な職業" : "職業未記録",
    status = spouseEmploymentStatus(s.sp) === "unemployed" ? `現在は求職中（直前の仕事: ${job}）` : job,
    history = s.sp.workHistory || [],
    preference = spouseWorkPreferenceLabel(s.sp.workPreference),
    region = spouseKnownResidenceRegion(s).n,
    market = REGIONAL_EMPLOYMENT_PROFILES?.[region],
    timeNote =
      market?.temporalStatus === "unverified"
        ? "適用年代は未確認です。この地域重みは特定年の制度・採用実績を示しません。"
        : "";
  const historyDetails = history.length
    ? `<details><summary>記録された仕事の変化 ${history.length}回</summary><ol>${history
        .slice(-4)
        .map(
          row =>
            `<li>${Number.isFinite(row.year) ? `${row.year}年` : "年不明"}: ${esc(J[row.fromJobId]?.n || "以前の仕事未記録")}から${esc(J[row.toJobId]?.n || "職業未記録")}` +
            `へ。${esc(row.cause || "事情未記録")}</li>`
        )
        .join("")}` +
      `</ol>${
        history.length > 4
          ? `<p class="nt">直近4件を表示。全${history.length}件は保存記録にあります。</p>`
          : ""
      }</details>`
    : "";
  return (
    `<dt>配偶者の仕事</dt><dd>${status}・仕事の希望: ${preference}${historyDetails}${
      market
        ? `<details><summary>${esc(region)}での仕事候補について</summary><p class="nt">${esc(market.evidence)} ${esc(market.scope)}` +
          ` ${esc(timeNote)} 記載の生業は地域で知られる仕事の例であり、すべての採用条件や資格を網羅するものではありません。</p></details>`
        : ""
    }` + `</dd>`
  );
}
function spousePersonalFinanceMarkup(s) {
  const finance = s.sp?.personalFinance;
  if (!s.sp || !finance) return "<dt>配偶者本人の家計</dt><dd>記録なし</dd>";
  const regional = spouseRegionalServiceContext(s),
    balance =
      finance.status === "modeled_balance"
        ? `推定貯蓄 ${m(finance.cash)}・推定借入 ${m(finance.debt)}（${finance.condition === "strained" ? "家計が逼迫" : "記録範囲では安定"}）`
        : `旧記録のため開始残高は不明（収支のみ${finance.startedYear}年以降を記録）`,
    opening =
      finance.status === "modeled_balance"
        ? `・開始時推計: 貯蓄 ${m(finance.openingCash)}／借入 ${m(finance.openingDebt)}`
        : "",
    rows = (finance.history || [])
      .map(
        row =>
          `<li>${row.year}年・収入 ${m(row.income)}・家計拠出 ${m(row.contribution)}・支援受取 ${m(row.support)}${row.housing > 0 ? `・その他の別居生活 ${m(row.living)}` : `・別居生活 ${m(row.living)}`}` +
          `${row.housing > 0 ? `・別居住居維持 ${m(row.housing)}` : ""}` +
          (`・療養費 ${m(row.medical)}${row.coveredLiving ? `・同居生活費 ${m(row.coveredLiving)}（主人公側負担）` : ""}${row.coveredMedical ? `・同居療養費 ${m(row.coveredMedical)}（主人公側負担）` : ""}` +
            `${row.relocation ? `・転居費 ${m(row.relocation)}` : ""}`) +
          (`${row.housingSetup ? `・住居変更費 ${m(row.housingSetup)}` : ""}${row.interest != null ? `・借入利息 ${m(row.interest)}` : ""}` +
            `・収支 ${row.net >= 0 ? "+" : ""}${m(row.net)}${row.cash != null ? `・残高 貯蓄 ${m(row.cash)}/借入 ${m(row.debt)}` : ""}`) +
          `</li>`
      )
      .join(""),
    transfers = (finance.transfers || [])
      .map(
        row =>
          `<li>${row.year}年・${row.cause || row.kind}・${row.amount ? m(row.amount) : "拠出休止"}${row.debtPaid ? `（返済 ${m(row.debtPaid)}）` : ""}` +
          `${row.cashAdded ? `（貯蓄 ${m(row.cashAdded)}）` : ""}</li>`
      )
      .join(""),
    housingHistory = (s.sp.housingPlanHistory || [])
      .map(
        row =>
          `<li>${row.year}年・${spouseHousingPlanLabel(row.from)}から${spouseHousingPlanLabel(row.to)}へ（${row.region}）・年額 ${m(row.annualHousingCost)}` +
          `・変更費 ${m(row.setupCost)}</li>`
      )
      .join(""),
    supportReceipts = (finance.supportReceipts || [])
      .map(
        row =>
          `<li>${row.year}年・${row.plan === "medical" ? "療養費支援" : "生活費支援"}の受取 ${m(row.amount)}（照合ID ${esc(row.transactionId)}）</li>`
      )
      .join("");
  return (
    `<dt>配偶者本人の家計</dt><dd>${balance}${!spouseLivesWithProtagonist(s) ? `・住居モデル ${spouseHousingPlanLabel(spouseHousingPlan(s.sp))}` : ""}` +
    `・追跡開始 ${finance.startedYear}年${opening}${
      finance.netChangeSinceStart
        ? `・追跡開始以降の収支差 ${finance.netChangeSinceStart >= 0 ? "+" : ""}${m(finance.netChangeSinceStart)}`
        : ""
    }` +
    `<details><summary>配偶者の年次収支（${finance.history?.length || 0}年分）</summary><p class="nt">${
      finance.status === "modeled_balance"
        ? "婚姻時の開始残高は、当時の生業や年齢から推定した大まかな金額です。"
        : "当時の詳細な金銭記録は残っていません。"
    }` +
    `別居生活の「住居維持」は、生活費の内訳として扱い、支出へ二重計上しません。相部屋・現状維持・個室の差や住居変更費は生活環境の違いによる概算であり、各地の実勢家賃を一律に表すものではありません。同居中の生活・療養費は主人公側家計が負担した分として分けて整理します。</p>${
      !spouseLivesWithProtagonist(s)
        ? `<p class="nt">配偶者の居住地（把握情報）: ${esc(regional.region)}。${esc(regional.summary)}${regional.sourceRefs.length ? `参考資料ID ${esc(regional.sourceRefs.join("、"))}` : ""}` +
          `</p>`
        : ""
    }` +
    (`<ul>${rows || "<li>年次記録はまだありません。</li>"}</ul><p>別居支援の受取履歴</p><ul>${supportReceipts || "<li>記録なし</li>"}</ul>` +
      `<p>住居形態の相談履歴</p><ul>${housingHistory || "<li>記録なし</li>"}</ul>`) +
    `<p>一時支援・家計変更</p><ul>${transfers || "<li>記録なし</li>"}</ul></details></dd>`
  );
}
