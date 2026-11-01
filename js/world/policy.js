function regionalPolicyContext(s) {
  const country = s.res?.n,
    citizenCountry = s.legal?.status === "recorded" ? s.legal?.citizenshipCountry : null,
    profile = REGIONAL_LIFE_PROFILES?.[country],
    entity = REGIONAL_ENTITY_CONTEXT?.[country];
  if (!profile) {
    const historicalLocalities = REGIONAL_HISTORICAL_LOCALITIES?.[country] || [],
      historicalSummary = historicalLocalities.length
        ? `地域史の参考（個人の出身・居住地区は未特定）: ${historicalLocalities
            .map(
              item =>
                `${item.name}は${item.transitions.map(t => t.relationship).join("。その後、")}（いずれも時期未確認）。${item.note}`
            )
            .join(" ")}`
        : "";
    return {
      region: country,
      profileId: null,
      entity: entity || null,
      historicalLocalities,
      sourceRefs: [
        ...new Set([
          ...(entity?.sourceRefs || []),
          ...historicalLocalities.flatMap(item => item.sourceRefs || [])
        ])
      ],
      summary: [
        entity
          ? `${entity.unitType}。${entity.parentRelation}。史料上の適用年代は未確認。${entity.note}`
          : "地域固有の制度プロファイルは未整備",
        historicalSummary
      ]
        .filter(Boolean)
        .join(" ")
    };
  }
  const T = tags(s),
    available = (id, choiceLabel) => {
      const event = EV.find(e => e.id === id);
      if (!event || !elig(event, s, T)) return false;
      return (event.c || [])
        .filter(c => !choiceLabel || c.l.includes(choiceLabel))
        .some(c => ok(c.show, s, T) && ok(c.en, s, T));
    };
  let summary = "";
  if (country === "ラテラーノ") {
    const registered = s.legal?.status === "recorded" && s.legal?.citizenshipCountry === country,
      exileAvailable = available("lat_exile");
    summary = `市民向け公的サービスの記述あり。資格は${registered ? "市民記録あり（個別受給・利用結果は未確認）" : "未確認"}。感染者市民の追放例あり。追放イベント条件 ${exileAvailable ? "成立" : "未成立"}。`;
  } else if (country === "ウルサス") {
    const mineRoute = available("car", "北方の鉱山へ送られる");
    summary = `感染者への強制労働・収容の事例あり。全国一律とは扱わない。進路イベントの北方鉱山ルート ${mineRoute ? "現在の状態で表示可能" : "現在は条件不成立"}。`;
  } else if (country === "クルビア") {
    const insuranceEvent = EV.find(e => e.id === "col_insure"),
      insuranceChoice = insuranceEvent?.c?.find(c => c.l === "保険料を払う"),
      insuranceEligible = !!insuranceEvent && elig(insuranceEvent, s, T),
      affordable = insuranceEligible && !!insuranceChoice && ok(insuranceChoice.en, s, T);
    summary = `感染者の保険負担・隔離/辺境契約への経済的圧力の記述あり。保険契約 ${affordable ? "現在選択可能" : insuranceEligible ? "対象だが初年度費用を用意できない" : "現在は条件不成立"}。`;
  } else if (country === "ヴィクトリア") {
    const industrial = s.local?.kind === "工業・採掘地域",
      pressure = infectionSocialPressure(s);
    summary = `${profile.evidence} ${profile.scope} 現在の居住区画: ${s.local?.kind || "未記録"}。${
      industrial
        ? `工業・採掘居住地向けの雇用 ${pressure.work.toFixed(2)}・住居 ${pressure.housing.toFixed(2)}・開示 ${pressure.disclosure.toFixed(2)} の社会圧力補正を適用中。`
        : `工業・採掘居住地向け補正は現在適用されていない。`
    }`;
  } else if (country === "ミノス") {
    const pressure = infectionSocialPressure(s);
    summary =
      `${profile.evidence} ${profile.scope} 現在の感染者圧力係数: 世間 ${pressure.public.toFixed(2)}・仕事 ${pressure.work.toFixed(2)}` +
      `・住居 ${pressure.housing.toFixed(2)}・医療 ${pressure.medical.toFixed(2)}` +
      `・開示 ${pressure.disclosure.toFixed(2)}。地域別公共サービスの資格・利用経路は未反映。`;
  } else if (country === "龍門" || country === "シエスタ") {
    summary = `${profile.evidence} ${profile.scope}`;
  }
  const postExileCitizen =
    s.fl?.exiled &&
    s.exileFrom === "ラテラーノ" &&
    country !== "ラテラーノ" &&
    citizenCountry === "ラテラーノ";
  if (postExileCitizen)
    summary += ` 追放後もラテラーノ市民権を維持し、条件付きで手当・薬を受けるとの記述あり。具体的な資格・額・受給条件は未確認。`;
  if (entity)
    summary += ` 場所の階層: ${entity.unitType}。${entity.parentRelation}。史料上の適用年代は未確認。${entity.note}`;
  const historicalLocalities = REGIONAL_HISTORICAL_LOCALITIES?.[country] || [];
  if (historicalLocalities.length)
    summary += ` 地域史の参考（個人の出身・居住地区は未特定）: ${historicalLocalities
      .map(
        item =>
          `${item.name}は${item.transitions.map(t => t.relationship).join("。その後、")}（いずれも時期未確認）。${item.note}`
      )
      .join(" ")}`;
  return {
    region: country,
    profileId: country,
    entity: entity || null,
    historicalLocalities,
    sourceRefs: [
      ...new Set([
        ...profile.sourceRefs,
        ...(entity?.sourceRefs || []),
        ...historicalLocalities.flatMap(item => item.sourceRefs || []),
        ...(postExileCitizen ? ["SRC_LATERANO_CIVIC"] : [])
      ])
    ],
    summary
  };
}
function regionalServiceContext(s) {
  const region = s.res?.n,
    profile = REGIONAL_SERVICE_PROFILES?.[region];
  if (!profile)
    return {
      region,
      profileId: null,
      status: "unmodeled",
      sourceRefs: [],
      summary: "地域別の公共サービス経路は未モデル化。資格や利用実績は補っていない。"
    };
  let status = "制度記述あり・個人利用未確認",
    detail = "対象資格や実際の利用結果は記録されていない。";
  if (region === "クルビア") {
    const event = EV.find(item => item.id === "col_insure"),
      choice = event?.c?.find(item => item.l === "保険料を払う"),
      eligible = !!event && elig(event, s, tags(s)),
      affordable = eligible && !!choice && ok(choice.en, s, tags(s));
    const selectedQuarantinePath = !!s.fl?.segregated && s.sn?.col_quarantine_offer != null;
    status = selectedQuarantinePath
      ? "本人が隔離区画の診療経路を選択・現在隔離中"
      : s.fl?.insured
        ? "加入中"
        : affordable
          ? "加入選択が可能"
          : eligible
            ? "対象条件あり・初年度費用不足"
            : "現在は加入条件外";
    detail = selectedQuarantinePath
      ? `${status}。作中会話をもとにした一経路を本人が選択した記録。診療の継続や効果、制度資格を保証しない。`
      : `${status}。${s.fl?.insured ? "加入状態は記録済み。医療機関の受診実績とは別。" : "加入・給付はまだ記録されていない。"}`;
  } else if (region === "ラテラーノ") {
    const citizen = s.legal?.status === "recorded" && s.legal?.citizenshipCountry === region,
      exiled = !!s.fl?.exiled && s.exileFrom === region && s.res.n !== region;
    status = exiled
      ? "追放後の市民権を記録・給付未実装"
      : citizen
        ? "市民記録あり・個別利用未確認"
        : "市民資格未確認";
    detail = `${status}。給付条件・額・受給は記録していない。`;
  } else if (region === "ミノス") {
    const anchor = profile.anchorYear;
    status =
      s.year < anchor
        ? `${anchor}年の事例より前・同時代の制度利用は未確認`
        : s.year === anchor
          ? `${anchor}年・アテヌスで感染者向け診療体制の整備中との作中事例`
          : `${anchor}年・アテヌスの作中事例のみ。以後の制度利用は未確認`;
    detail = `${status}。本人の居住都市・受診資格・窓口・費用・利用結果は記録していない。全ミノスの制度や個人の受診経路を示すものではない。`;
  } else if (region === "龍門") {
    status = s.fl?.lungmen_clinic_route
      ? "地区で道順・診療日を確認した経験あり"
      : "遭遇時の地区互助（資格・利用実績なし）";
    detail = `${status}。診療所の受入れ・受診・治療・公的資格の記録ではない。`;
  }
  const postExileCitizen =
    !!s.fl?.exiled &&
    s.exileFrom === "ラテラーノ" &&
    region !== "ラテラーノ" &&
    s.legal?.status === "recorded" &&
    s.legal?.citizenshipCountry === "ラテラーノ";
  const postExileNote = postExileCitizen
    ? " ラテラーノ市民権と追放後支援に関する資料記述があるが、この地域での受給資格・窓口・額は未確認。"
    : "";
  const periodNote =
    profile.temporalStatus === "unverified"
      ? "適用年代未確認。全時代の常設制度とは確認されていません。"
      : "";
  return {
    region,
    profileId: region,
    status,
    serviceKind: profile.kind,
    path: profile.path,
    evidence: profile.evidence,
    scope: profile.scope,
    temporalStatus: profile.temporalStatus,
    validFromYear: profile.validFromYear,
    validToYear: profile.validToYear,
    detail,
    postExileCitizen,
    sourceRefs: [...new Set([...profile.sourceRefs, ...(postExileCitizen ? ["SRC_LATERANO_CIVIC"] : [])])],
    summary: `${profile.kind}: ${detail} ${profile.evidence} ${profile.scope} ${periodNote}${postExileNote}`
  };
}
function spouseRegionalServiceContext(s) {
  if (!s?.sp) return null;
  const region = spouseKnownResidenceRegion(s).n,
    profile = REGIONAL_SERVICE_PROFILES?.[region];
  if (!profile)
    return {
      region,
      profileId: null,
      status: "unmodeled",
      serviceKind: null,
      path: null,
      temporalStatus: "unverified",
      validFromYear: null,
      validToYear: null,
      sourceRefs: [],
      summary: `${region}で配偶者本人が利用できる地域サービスは未モデル化。資格・受診・制度利用は推定していない。`
    };
  return {
    region,
    profileId: region,
    status: "制度記述あり・配偶者個人の資格/利用未確認",
    serviceKind: profile.kind,
    path: profile.path,
    evidence: profile.evidence,
    scope: profile.scope,
    temporalStatus: profile.temporalStatus,
    validFromYear: profile.validFromYear,
    validToYear: profile.validToYear,
    sourceRefs: [...profile.sourceRefs],
    summary: `${region}: ${profile.kind}。配偶者本人の資格・受診・制度利用は未確認。${profile.evidence} ${profile.scope} 適用年代未確認。`
  };
}
