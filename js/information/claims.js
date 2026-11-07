const INFORMATION_CLAIM_DEFINITIONS = {
  "ursus-reunion-evacuation-account": {
    basis: "situated-encounter",
    text: "チェルノボーグから逃れる際、レユニオンの一人に導かれた",
    claimant: "避難者一人（氏名・所属不明）",
    channel: "地域の支援所での口頭証言",
    scope: "語り手一人の避難経験。市全体の救出状況、感染者・非感染者の扱い、レユニオン全体の方針は示さない",
    receiveEvent: "sr_ursus_civilian_account",
    followupEvent: "sr_ursus_civilian_account_followup",
    receivedDetail: "本人の避難経験として聞いた一度の口頭証言。独立した確認や他の避難者の経験は未確認",
    context: {
      region: "ウルサス",
      home: "移動都市",
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      from: 1097,
      to: 1098,
      followupRegion: "ウルサス",
      followupFrom: 1098,
      followupTo: 1110
    }
  },
  "londinium-market-price-rise": {
    historyFlag: "londinium_war",
    text: "ロンディニウム戦争の影響で、周辺の物資が値上がりするかもしれない",
    claimant: "市場で話していた人物（個人名・所属不明）",
    channel: "市場での対面の話",
    scope: "本人が訪れた市場の会話",
    receiveEvent: "sr_londinium_distant_news",
    followupEvent: "sr_londinium_price_followup",
    receivedDetail: "発言者・裏付け・戦争との因果関係は未確認",
    evidenceResult: "現在の価格を確認。比較できる過去価格がなく、値上がりも戦争との因果も確認できない"
  },
  "londinium-grain-price-stability": {
    historyFlag: "londinium_war",
    text: "この市場で扱う穀物は、当面値上がりしないだろう",
    claimant: "別の売り手（個人名・所属不明）",
    channel: "市場での対面の話",
    scope: "本人が訪れた市場の穀物取引・短期見通し",
    receiveEvent: "sr_londinium_price_followup",
    followupEvent: "sr_londinium_counterreport_followup",
    receivedDetail: "別の売り手の見通し。市場状況や先の主張との関係は未確認",
    evidenceResult:
      "穀物一店舗の現在価格を確認。比較できる過去価格や取引条件がなく、値上がりしないとの見通しは確認できない",
    relation: {
      claimId: "londinium-market-price-rise",
      type: "different-outlook-unresolved",
      status: "unresolved"
    }
  },
  "iberia-lighthouse-market-warning": {
    basis: "situated-encounter",
    text: "沿岸の灯台網から警戒の知らせが回ったらしい",
    claimant: "市場の品に添えられた短い警戒文（執筆者・対象・発信灯台は不明）",
    channel: "塩魚を包む紙に添えられた注意書き",
    scope: "本人が訪れた市場の品に添えられた一枚の注意書き。対象・発信時刻・灯台・海の状況は示さない",
    receiveEvent: "sr_iberia_lighthouse_warning",
    followupEvent: "sr_iberia_warning_followup",
    receivedDetail: "一枚の注意書きがあったことだけを記録。発信者・対象・信号の意味・海の危険は未確認",
    context: { region: "イベリア", followupRegion: "イベリア" }
  },
  "kazimierz-grid-restoration": {
    basis: "situated-encounter",
    text: "大騎士領の停電では送電網の一部が切り離され、完全復旧まで時間がかかる",
    claimant: "ローズ新聞の記事（取材記者の個人名不明）",
    channel: "街頭で入手した地域紙",
    scope: "大騎士領で発生した停電と復旧状況。主人公の居住区での停電や原因を示さない",
    receiveEvent: "sr_kazimierz_outage_report",
    followupEvent: "sr_kazimierz_outage_followup",
    actionEvents: ["sr_kazimierz_claim_correction"],
    receivedDetail: "紙面の報道として受領。居住区の停電、原因、全街区への到達は未確認",
    context: {
      region: "カジミエーシュ",
      home: "移動都市",
      months: [11],
      from: 1097,
      to: 1097,
      followupRegion: "カジミエーシュ",
      followupFrom: 1098,
      followupTo: 1110
    }
  },
  "kazimierz-campaign-knight-panic": {
    basis: "situated-encounter",
    text: "大騎士領の停電が続くなか、征戦騎士の無断入城が市民の生活を損ね、混乱をあおった",
    claimant: "商業連合会の代弁者マッキー（中央ジャーナル中継記事）",
    channel: "ローズ新聞系ニュース番組の記事転記",
    scope: "停電下の征戦騎士入城と商業連合会の非難。監査会の反論や実際の市民全体の反応は不明",
    receiveEvent: "sr_kazimierz_outage_statement",
    followupEvent: "sr_kazimierz_outage_statement_followup",
    actionEvents: ["sr_kazimierz_claim_correction"],
    receivedDetail: "商業連合会側の公開主張として受領。監査会の返答と、混乱が市民全体に及んだかは未確認",
    relation: {
      claimId: "kazimierz-grid-restoration",
      type: "different-source-and-scope-unresolved",
      status: "unresolved"
    },
    context: {
      region: "カジミエーシュ",
      home: "移動都市",
      months: [12],
      from: 1097,
      to: 1097,
      followupRegion: "カジミエーシュ",
      followupFrom: 1098,
      followupTo: 1110
    }
  },
  "local-infrastructure-bulletin": {
    basis: "situated-encounter",
    text: "同じ地区の設備は修理された",
    claimant: "地域放送の発言者（氏名不明）",
    channel: "本人が実際に聞いた地域放送",
    scope: "一つの地区設備についての放送。設備以外や地区全体の安全は示さない",
    receiveEvent: "life_info_media_claim",
    followupEvent: "life_info_claim_correction",
    receivedDetail: "同じ地区の一設備についての放送を受領。修理結果や他の設備は未確認"
  },
  "arts-family-practice": {
    basis: "situated-encounter",
    text: "練習した小さな術式を家の器具に使った",
    claimant: "主人公",
    channel: "同じ食卓での本人の説明",
    scope: "本人が一度の行使について話したこと。家族の理解、評価、反応、他者への伝達は記録しない",
    receiveEvent: "life_arts_family_glimpse",
    receivedDetail: "本人が一度の行使を家族へ話した。相手の受け止めや行動は記録しない"
  }
};
const INFORMATION_CLAIM_ORGANIZATIONS = {
  "infected-exclusion": "感染者排除を求める住民会",
  "infected-mutual-aid": "感染者と家族の共同購入・診療連絡会"
};
function informationClaimContextValid(s, definition, phase) {
  const c = definition?.context;
  if (!c) return true;
  if (phase === "receive")
    return (
      s.res?.n === c.region &&
      (c.home == null || s.home === c.home) &&
      (c.from == null || s.year >= c.from) &&
      (c.to == null || s.year <= c.to) &&
      (c.months == null || c.months.includes(s.mo))
    );
  return (
    s.res?.n === (c.followupRegion || c.region) &&
    (c.followupFrom == null || s.year >= c.followupFrom) &&
    (c.followupTo == null || s.year <= c.followupTo)
  );
}
function informationClaimOrganizationTarget(s, claimId, organizationId) {
  const claim = s?.informationClaims?.find(row => row.id === claimId),
    org = s?.lifeRecord?.organizations?.find(row => row.id === organizationId),
    formed = INFORMATION_CLAIM_ORGANIZATIONS[organizationId];
  if (
    !claim ||
    !formed ||
    !org ||
    org.status !== "active" ||
    org.startedYear > s.year ||
    org.formedRegion !== s.res?.n ||
    org.formedHome !== s.home ||
    org.formedLocalityKind !== s.local?.kind ||
    org.formedCity !== (s.local?.city || null) ||
    claim.pursuitStopped ||
    claim.recordedYear >= s.year ||
    !("londinium-market-price-rise" === claimId || "londinium-grain-price-stability" === claimId) ||
    (claim.groupTransmissions || []).some(row => row.organizationId === organizationId)
  )
    return null;
  return { claim, org };
}
function informationClaimOrganizationConflictTarget(s, organizationId) {
  const org = s?.lifeRecord?.organizations?.find(row => row.id === organizationId),
    market = s?.informationClaims?.find(row => row.id === "londinium-market-price-rise"),
    grain = s?.informationClaims?.find(row => row.id === "londinium-grain-price-stability");
  if (
    !INFORMATION_CLAIM_ORGANIZATIONS[organizationId] ||
    !org ||
    org.status !== "active" ||
    org.startedYear > s.year ||
    org.formedRegion !== s.res?.n ||
    s.res?.n !== "ヴィクトリア" ||
    s.local?.city === "ロンディニウム" ||
    org.formedHome !== s.home ||
    org.formedLocalityKind !== s.local?.kind ||
    org.formedCity !== (s.local?.city || null) ||
    s.year < 1099 ||
    s.year > 1110 ||
    !market ||
    !grain ||
    market.status !== "unverified" ||
    grain.status !== "unverified" ||
    market.pursuitStopped ||
    grain.pursuitStopped ||
    market.recordedYear >= s.year ||
    grain.recordedYear >= s.year ||
    grain.relation?.claimId !== market.id ||
    grain.relation?.status !== "unresolved" ||
    !market.channel ||
    !grain.channel ||
    (market.groupTransmissions || []).some(row => row.organizationId === organizationId) ||
    (grain.groupTransmissions || []).some(row => row.organizationId === organizationId)
  )
    return null;
  return { org, claims: [market, grain] };
}
function informationClaimOrganizationTargets(s) {
  const out = [];
  for (const claim of s?.informationClaims || [])
    for (const id of Object.keys(INFORMATION_CLAIM_ORGANIZATIONS)) {
      const target = informationClaimOrganizationTarget(s, claim.id, id);
      if (target) out.push({ ...target, organizationId: id });
    }
  return out;
}
function informationClaimWorkplaceTarget(s, claimId) {
  const claim = s?.informationClaims?.find(row => row.id === claimId),
    affiliation = s?.lifeRecord?.affiliations?.find(row => row.id === "kazimierz-arena-staff");
  if (
    !claim ||
    !["kazimierz-grid-restoration", "kazimierz-campaign-knight-panic"].includes(claimId) ||
    claim.pursuitStopped ||
    claim.recordedYear >= s.year ||
    claim.receiptContext?.region !== "カジミエーシュ" ||
    claim.receiptContext?.home !== "移動都市" ||
    !currentCareerPlacement(s, "kazimierz-arena-staff") ||
    !affiliation ||
    !["active", "crisis"].includes(affiliation.status) ||
    (claim.groupTransmissions || []).some(row => row.workplaceId === "kazimierz-arena-staff")
  )
    return null;
  return { claim, affiliation };
}
function informationClaimWorkplaceCorrectionTarget(s) {
  const claim = s?.informationClaims?.find(row => row.id === "kazimierz-campaign-knight-panic"),
    group = (claim?.groupTransmissions || []).find(row => row.workplaceId === "kazimierz-arena-staff"),
    affiliation = s?.lifeRecord?.affiliations?.find(row => row.id === "kazimierz-arena-staff");
  if (
    !claim ||
    !group ||
    group.correction ||
    claim.pursuitStopped ||
    s.res?.n !== "カジミエーシュ" ||
    !currentCareerPlacement(s, "kazimierz-arena-staff") ||
    !affiliation ||
    !["active", "crisis"].includes(affiliation.status) ||
    !(claim.evidence || []).some(row => row.type === "official-emergency-entry-rule") ||
    group.year >= s.year
  )
    return null;
  return { claim, group, affiliation };
}
function informationClaimGroupTransmissionValid(s, claim, row) {
  if (
    !Number.isInteger(row.year) ||
    row.year <= claim.recordedYear ||
    row.year > s.year ||
    !Number.isInteger(row.age) ||
    row.age < 0 ||
    row.age > s.age
  )
    return false;
  if (row.workplaceId) {
    const affiliation = s.lifeRecord?.affiliations?.find(item => item.id === row.workplaceId),
      episode = affiliation?.episodes?.find(
        item =>
          Number.isInteger(item.startedYear) &&
          item.startedYear <= row.year &&
          (!Number.isInteger(item.endedYear) || item.endedYear >= row.year)
      ),
      claimContext = INFORMATION_CLAIM_DEFINITIONS[claim.id]?.context;
    const corr = row.correction,
      validCorrection =
        corr == null ||
        (claim.id === "kazimierz-campaign-knight-panic" &&
          Number.isInteger(corr.year) &&
          corr.year > row.year &&
          corr.year <= s.year &&
          Number.isInteger(corr.age) &&
          corr.age <= s.age &&
          corr.eventId === "sr_kazimierz_claim_correction" &&
          corr.kind === "narrowed-workplace-correction" &&
          corr.sourceEvidenceType === "official-emergency-entry-rule" &&
          (claim.evidence || []).some(e => e.type === corr.sourceEvidenceType) &&
          corr.text ===
            "非常時の入城は認められるとの掲示を確認したため、以前の『無断入城』という非難の範囲を同じ職場の会話で訂正した。非難全体の真偽は未確認" &&
          corr.scope === "訂正は入城可否に限る。停電被害・市民の反応・因果関係は未確認" &&
          corr.uptake ===
            "以前または今回の発言を聞いた人、両方の発言の受領者の重なり、受け止め・信念・行動は未記録");
    return (
      row.workplaceId === "kazimierz-arena-staff" &&
      ["kazimierz-grid-restoration", "kazimierz-campaign-knight-panic"].includes(claim.id) &&
      !!episode &&
      row.workplaceTitle === affiliation.title &&
      row.receiverGroup === "同じ持ち場にいた競技会場職員" &&
      row.region === claimContext?.region &&
      row.home === claimContext?.home &&
      row.eventId === INFORMATION_CLAIM_DEFINITIONS[claim.id]?.followupEvent &&
      row.channel === "休憩中の口頭会話" &&
      row.scope ===
        "主人公が勤務中の休憩に述べた一度の発言。同席者の聴取・理解・同意・行動や勤務先の方針への反映は未確認" &&
      validCorrection
    );
  }
  const org = s.lifeRecord?.organizations?.find(item => item.id === row.organizationId),
    label = INFORMATION_CLAIM_ORGANIZATIONS[row.organizationId];
  const orgRoute =
    !!org &&
    (claim.id === "londinium-market-price-rise" || claim.id === "londinium-grain-price-stability") &&
    label === row.receiverGroup &&
    org.title === row.organizationTitle &&
    org.formedRegion === row.region &&
    org.formedHome === row.home &&
    org.formedLocalityKind === row.localityKind &&
    org.formedCity === (row.city || null) &&
    row.eventId === "sr_information_claim_organization_meeting" &&
    org.startedYear <= row.year &&
    (!Number.isInteger(org.endedYear) || org.endedYear >= row.year) &&
    row.channel === "会合での口頭発言";
  if (!orgRoute) return false;
  if (row.pairedClaimId == null && row.groupConflictId == null)
    return (
      row.scope === "主人公が会合で述べた一度の発言。参加者の聴取・理解・同意・行動や第三者への伝達は未確認"
    );
  if (
    !["londinium-market-price-rise", "londinium-grain-price-stability"].includes(claim.id) ||
    !["londinium-market-price-rise", "londinium-grain-price-stability"].includes(row.pairedClaimId) ||
    row.pairedClaimId === claim.id ||
    row.groupConflictId !== `londinium-market-conflict:${row.year}:${row.organizationId}` ||
    row.scope !==
      "同じ会合で二つの未確認情報を出所別に述べた一度の発言。参加者の聴取・理解・賛否・行動や組織判断への反映は未確認"
  )
    return false;
  const paired = s.informationClaims?.find(item => item.id === row.pairedClaimId),
    counterpart = paired?.groupTransmissions?.find(item => item.groupConflictId === row.groupConflictId);
  return (
    !!paired &&
    (claim.id === "londinium-market-price-rise"
      ? paired.id === "londinium-grain-price-stability" &&
        paired.relation?.claimId === claim.id &&
        paired.relation?.status === "unresolved"
      : claim.relation?.claimId === paired.id && claim.relation?.status === "unresolved") &&
    row.year > Math.max(claim.recordedYear, paired.recordedYear) &&
    counterpart?.pairedClaimId === claim.id &&
    counterpart.organizationId === row.organizationId &&
    counterpart.year === row.year &&
    counterpart.age === row.age &&
    counterpart.eventId === row.eventId &&
    counterpart.groupConflictId === row.groupConflictId
  );
}
function recordInformationClaimAction(s, input, eventId) {
  const definition = INFORMATION_CLAIM_DEFINITIONS[input?.claimId],
    event = EV.find(row => row.id === eventId),
    history = HIST.find(row => row.flag === definition?.historyFlag);
  const localEncounter = definition?.basis === "situated-encounter",
    localEvents = [definition?.receiveEvent, definition?.followupEvent, ...(definition?.actionEvents || [])];
  if (
    !definition ||
    !input ||
    !event ||
    (localEncounter && !localEvents.includes(eventId)) ||
    (!localEncounter &&
      (!history ||
        !s.known?.[definition.historyFlag] ||
        s.world?.events?.[definition.historyFlag] !== history.y))
  )
    throw new Error("本人が受け取っていない主張は記録できません");
  const claimId = input.claimId,
    claims = s.informationClaims || (s.informationClaims = []);
  let claim = claims.find(row => row.id === claimId);
  if (input.action === "receive") {
    if (
      eventId !== definition.receiveEvent ||
      !informationClaimContextValid(s, definition, "receive") ||
      claim ||
      (definition.relation && !hasInformationClaim(s, definition.relation.claimId))
    )
      throw new Error("この主張の受領条件または経路が一致しません");
    const receiptMode = claimId === "kazimierz-grid-restoration" ? input.receiptMode : null;
    if (
      claimId === "kazimierz-grid-restoration" &&
      !(
        (receiptMode === "printed-purchase" && literacyValue(s) >= 40 && moveFunds(s) >= 1200) ||
        receiptMode === "vendor-summary"
      )
    )
      throw new Error("紙面の読解・購入条件、または売り子の要約経路が一致しません");
    const receiptChannel =
      receiptMode === "printed-purchase"
        ? "街頭で購入したローズ新聞"
        : receiptMode === "vendor-summary"
          ? "売り場で売り子から聞いた新聞の要点"
          : definition.channel;
    const receiptDetail =
      receiptMode === "printed-purchase"
        ? "ローズ新聞の紙面を購入して読んだ。購入費1,200龍門幣を支払い、居住区の停電や原因、全街区への到達は未確認"
        : receiptMode === "vendor-summary"
          ? "売り子から記事の要点を口頭で聞いた。紙面全体、居住区の停電、原因、全街区への到達は未確認"
          : definition.receivedDetail || "発言者・裏付け・主張の真偽は未確認";
    claim = {
      id: claimId,
      eventId: localEncounter ? eventId : definition.historyFlag,
      text: definition.text,
      recordedYear: s.year,
      claimant: definition.claimant,
      channel: receiptChannel,
      scope: definition.scope,
      status: "unverified",
      evidence: [],
      transmissions: [],
      assessments: [],
      history: [],
      ...(receiptMode ? { receiptMode, receiptCost: receiptMode === "printed-purchase" ? 1200 : 0 } : {}),
      ...(definition.context
        ? {
            receiptContext: {
              region: s.res.n,
              ...(definition.context.home == null ? {} : { home: s.home }),
              ...(definition.context.months == null ? {} : { month: s.mo })
            }
          }
        : {}),
      ...(definition.relation ? { relation: { ...definition.relation } } : {})
    };
    claims.push(claim);
    if (claims.length > 24) claims.splice(0, claims.length - 24);
    claim.history.push({ year: s.year, action: "received-unverified", eventId, detail: receiptDetail });
    return claim;
  }
  if (!claim) throw new Error("未確認の主張を先に受け取る必要があります");
  if (claim.pursuitStopped) throw new Error("追加確認を終えた主張には応答を記録できません");
  const organizationRoute =
      input.action === "present-unverified-to-organization" &&
      eventId === "sr_information_claim_organization_meeting",
    organizationConflictRoute =
      input.action === "present-conflicting-claims-to-organization" &&
      eventId === "sr_information_claim_organization_meeting",
    workplaceRoute =
      input.action === "present-unverified-to-workplace" &&
      ["sr_kazimierz_outage_followup", "sr_kazimierz_outage_statement_followup"].includes(eventId),
    workplaceCorrectionRoute =
      input.action === "correct-prior-workplace" && eventId === "sr_kazimierz_claim_correction",
    conflictRoute =
      input.action === "share-conflicting-claims-close-person" &&
      eventId === "sr_londinium_claim_conflict_followup";
  if (
    (eventId !== definition.followupEvent &&
      !(input.action === "correct-prior-recipient" && eventId === "sr_kazimierz_claim_correction") &&
      !workplaceCorrectionRoute &&
      !organizationRoute &&
      !organizationConflictRoute &&
      !workplaceRoute &&
      !conflictRoute) ||
    !informationClaimContextValid(s, definition, "followup")
  )
    throw new Error("この主張の追跡経路が一致しません");
  if (input.action === "verify-emergency-entry-rule") {
    if (
      claimId !== "kazimierz-campaign-knight-panic" ||
      eventId !== "sr_kazimierz_outage_statement_followup" ||
      (claim.evidence || []).some(row => row.type === "official-emergency-entry-rule")
    )
      throw new Error("この主張に対応する別系統の公開記録は確認できません");
    claim.evidence.push({
      year: s.year,
      type: "official-emergency-entry-rule",
      scope: "非常時における征戦騎士の大騎士領入城の可否",
      source: "国民評議会の緊急規則に関する市内掲示（掲示を見つける経路はゲーム上の仮定）",
      result:
        "非常時の入城は認められるとの説明を確認。無断入城との主張を限定する根拠だが、停電の継続時間、市民生活への影響、混乱の程度や原因は判定しない"
    });
    claim.evidence = claim.evidence.slice(-12);
  } else if (input.action === "correct-prior-workplace") {
    const target =
      claimId === "kazimierz-campaign-knight-panic" ? informationClaimWorkplaceCorrectionTarget(s) : null;
    if (!target) throw new Error("根拠を得た同じ職場への未完了の訂正経路がありません");
    target.group.correction = {
      year: s.year,
      age: s.age,
      eventId,
      kind: "narrowed-workplace-correction",
      sourceEvidenceType: "official-emergency-entry-rule",
      text: "非常時の入城は認められるとの掲示を確認したため、以前の『無断入城』という非難の範囲を同じ職場の会話で訂正した。非難全体の真偽は未確認",
      scope: "訂正は入城可否に限る。停電被害・市民の反応・因果関係は未確認",
      uptake: "以前または今回の発言を聞いた人、両方の発言の受領者の重なり、受け止め・信念・行動は未記録"
    };
  } else if (input.action === "correct-prior-recipient") {
    const recipientKind = input.recipientKind,
      person = INFORMATION_CLAIM_RECIPIENTS[recipientKind] ? closeInfoPerson(s, recipientKind) : null,
      transmission = [...(claim.transmissions || [])]
        .reverse()
        .find(row => row.receiverKind === recipientKind && row.receiverPersonId === person?.id);
    if (
      claimId !== "kazimierz-campaign-knight-panic" ||
      !(claim.evidence || []).some(row => row.type === "official-emergency-entry-rule") ||
      !person?.id ||
      !closeInfoAvailable(s, recipientKind) ||
      !transmission ||
      transmission.year >= s.year ||
      transmission.correction
    )
      throw new Error("根拠を得た同じ相手への未完了の訂正経路がありません");
    transmission.correction = {
      year: s.year,
      age: s.age,
      eventId,
      personId: person.id,
      kind: "narrowed-correction",
      sourceEvidenceType: "official-emergency-entry-rule",
      text: "緊急規則では非常時の入城が認められるという別の説明も見つかった。『無断入城』との非難は未確認のままだが、この点は訂正して伝える",
      scope: "入城可否について以前の伝達を限定。停電被害・市民の反応・因果関係は未確認",
      uptake: "相手の受け止め・信念・行動は未記録"
    };
  } else if (input.action === "present-unverified-to-organization") {
    const target = organizationRoute
      ? informationClaimOrganizationTarget(s, claimId, input.organizationId)
      : null;
    if (!target) throw new Error("同じ設立地区で運営中の組織、または未共有の主張がありません");
    const groupTransmissions = claim.groupTransmissions || (claim.groupTransmissions = []);
    groupTransmissions.push({
      year: s.year,
      age: s.age,
      eventId,
      organizationId: target.org.id,
      organizationTitle: target.org.title,
      receiverGroup: INFORMATION_CLAIM_ORGANIZATIONS[target.org.id],
      region: target.org.formedRegion,
      home: target.org.formedHome,
      localityKind: target.org.formedLocalityKind,
      city: target.org.formedCity,
      channel: "会合での口頭発言",
      scope: "主人公が会合で述べた一度の発言。参加者の聴取・理解・同意・行動や第三者への伝達は未確認"
    });
    claim.groupTransmissions = groupTransmissions.slice(-12);
  } else if (input.action === "present-conflicting-claims-to-organization") {
    const target = organizationConflictRoute
      ? informationClaimOrganizationConflictTarget(s, input.organizationId)
      : null;
    if (claimId !== "londinium-market-price-rise" || !target)
      throw new Error("同じ設立地区で運営中の組織へ二つの別個の未確認情報を伝える条件がありません");
    const groupConflictId = `londinium-market-conflict:${s.year}:${target.org.id}`;
    for (const pairedClaim of target.claims) {
      const pairedClaimId =
          pairedClaim.id === claim.id ? "londinium-grain-price-stability" : "londinium-market-price-rise",
        groupTransmissions = pairedClaim.groupTransmissions || (pairedClaim.groupTransmissions = []);
      groupTransmissions.push({
        year: s.year,
        age: s.age,
        eventId,
        organizationId: target.org.id,
        organizationTitle: target.org.title,
        receiverGroup: INFORMATION_CLAIM_ORGANIZATIONS[target.org.id],
        region: target.org.formedRegion,
        home: target.org.formedHome,
        localityKind: target.org.formedLocalityKind,
        city: target.org.formedCity,
        channel: "会合での口頭発言",
        scope:
          "同じ会合で二つの未確認情報を出所別に述べた一度の発言。参加者の聴取・理解・賛否・行動や組織判断への反映は未確認",
        pairedClaimId,
        groupConflictId
      });
      pairedClaim.groupTransmissions = groupTransmissions.slice(-12);
      pairedClaim.history.push({
        year: s.year,
        action: input.action,
        eventId,
        detail:
          "食い違う二つの未確認市場情報を、出所別のまま同じ組織の会合で述べた。参加者や組織の反応は未確認"
      });
      pairedClaim.history = pairedClaim.history.slice(-24);
    }
  } else if (input.action === "present-unverified-to-workplace") {
    const target = workplaceRoute ? informationClaimWorkplaceTarget(s, claimId) : null;
    if (!target) throw new Error("この主張を勤務中の競技会場職員へ伝えられる条件がありません");
    const groupTransmissions = claim.groupTransmissions || (claim.groupTransmissions = []);
    groupTransmissions.push({
      year: s.year,
      age: s.age,
      eventId,
      workplaceId: "kazimierz-arena-staff",
      workplaceTitle: target.affiliation.title,
      receiverGroup: "同じ持ち場にいた競技会場職員",
      region: s.res.n,
      home: s.home,
      localityKind: s.local?.kind || null,
      city: s.local?.city || null,
      channel: "休憩中の口頭会話",
      scope:
        "主人公が勤務中の休憩に述べた一度の発言。同席者の聴取・理解・同意・行動や勤務先の方針への反映は未確認"
    });
    claim.groupTransmissions = groupTransmissions.slice(-12);
  } else if (input.action === "observe-one-stall") {
    claim.evidence.push({
      year: s.year,
      type: "single-stall-price-observation",
      scope: "一店舗・一時点",
      source: "本人が見た値札",
      result: definition.evidenceResult
    });
    claim.evidence = claim.evidence.slice(-12);
  } else if (input.action === "share-conflicting-claims-close-person") {
    const target =
      conflictRoute && claimId === "londinium-market-price-rise"
        ? informationClaimConflictRecipientTarget(s, input.recipientKind)
        : null;
    if (!target) throw new Error("同じ相手へ二つの未確認情報を伝えられる条件がありません");
    const conversationId = `londinium-market-conflict:${s.year}:${target.person.id}`;
    for (const pairedClaim of target.claims) {
      const pairedClaimId =
        pairedClaim.id === claim.id ? "londinium-grain-price-stability" : "londinium-market-price-rise";
      pairedClaim.transmissions.push({
        year: s.year,
        age: s.age,
        eventId,
        sender: "protagonist",
        receiverKind: input.recipientKind,
        receiverGroup: target.label,
        receiverPersonId: target.person.id,
        channel: "口頭",
        reach: `${target.label}との会話`,
        alteration: "異なる二つの未確認情報を、食い違う見通しとして伝えた",
        uptake: "個人の受け止め・信念は未記録",
        pairedClaimId,
        conflictConversationId: conversationId
      });
      pairedClaim.transmissions = pairedClaim.transmissions.slice(-12);
      if (pairedClaim !== claim) {
        pairedClaim.history.push({
          year: s.year,
          action: input.action,
          eventId,
          detail: "異なる市場の見通しを同じ相手へ一度の会話で伝達。相手の受け止め・信念は未確認"
        });
        pairedClaim.history = pairedClaim.history.slice(-24);
      }
    }
  } else if (["share-unverified-household", "share-unverified-close-person"].includes(input.action)) {
    const recipientKind = input.action === "share-unverified-household" ? "spouse" : input.recipientKind,
      label = INFORMATION_CLAIM_RECIPIENTS[recipientKind],
      person = label ? closeInfoPerson(s, recipientKind) : null;
    if (!person?.id || !canShareInformationClaim(s, recipientKind, claimId))
      throw new Error("この主張を伝えられる接点のある人物がいません");
    claim.transmissions.push({
      year: s.year,
      sender: "protagonist",
      receiverKind: recipientKind,
      receiverGroup: label,
      receiverPersonId: person.id,
      channel: "口頭",
      reach: `${label}との会話`,
      alteration: "未確認の可能性として伝えた",
      uptake: "個人の受け止め・信念は未記録"
    });
    claim.transmissions = claim.transmissions.slice(-12);
  } else if (["assess-plausible", "assess-undetermined", "assess-doubtful"].includes(input.action)) {
    const previous = (claim.assessments || []).at(-1);
    if (previous && (claim.evidence?.length || 0) <= previous.evidenceCount)
      return;
    const values = {
        "assess-plausible": "可能性を警戒する",
        "assess-undetermined": "判断を保留する",
        "assess-doubtful": "根拠が乏しいと考える"
      },
      assessments = claim.assessments || (claim.assessments = []);
    assessments.push({
      year: s.year,
      age: s.age,
      eventId,
      value: values[input.action],
      action: input.action,
      evidenceCount: claim.evidence?.length || 0
    });
    claim.assessments = assessments.slice(-12);
  } else if (input.action === "stop-pursuit") claim.pursuitStopped = true;
  else throw new Error("主張への応答が不正です");
  const assessmentDetails = {
    "assess-plausible": "本人が可能性を警戒する判断を記録。発言の真偽は未確認",
    "assess-undetermined": "本人は判断を保留。発言の真偽は未確認",
    "assess-doubtful": "本人は根拠が乏しいと考える判断を記録。発言の真偽は未確認"
  };
  if (input.action !== "present-conflicting-claims-to-organization") {
    claim.history.push({
      year: s.year,
      action: input.action,
      eventId,
      detail:
        assessmentDetails[input.action] ||
        (input.action === "stop-pursuit"
          ? "追加確認や伝達はしなかった"
          : input.action === "observe-one-stall"
            ? "限定した現地観察。主張は未確認のまま"
            : input.action === "verify-emergency-entry-rule"
              ? "別系統の公開規則を照合。入城可否についてのみ主張の範囲を限定"
              : input.action === "correct-prior-recipient"
                ? "以前に伝えた同一人物へ、入城可否を限定する根拠を添えて訂正。受け止めや行動は未確認"
                : input.action === "correct-prior-workplace"
                  ? "非常時の入城規則に基づき、以前の職場発言を入城可否の範囲で訂正。誰が聞いたか、両方の発言の受領者が重なるか、受け止めや行動は未確認"
                  : input.action === "present-unverified-to-organization"
                    ? `${claim.groupTransmissions.at(-1)?.receiverGroup || "所属組織"}の会合で未確認の主張に言及。参加者や組織の反応は未確認`
                    : input.action === "present-unverified-to-workplace"
                      ? "勤務先の休憩中に一度発言。誰が聞いたか、職場の方針に反映されたかは未確認"
                      : input.action === "share-conflicting-claims-close-person"
                        ? "食い違う二つの未確認情報を同じ相手へ伝達。個人の受け止めは未確認"
                        : input.action.startsWith("share-unverified-")
                          ? `${claim.transmissions.at(-1)?.receiverGroup || "接点のある個人"}へ可能性として伝達。個人の受け止めは未確認`
                          : "未確認の応答")
    });
    claim.history = claim.history.slice(-24);
  }
  return claim;
}
const INFORMATION_CLAIM_DIRECT_RESPONSES = {
  concerned: "その話を気にしていると言った",
  undetermined: "比べられる情報がなく判断できないと言った",
  doubtful: "根拠が足りず信じるのは難しいと言った",
  withheld: "この話について考えを話さなかった"
};
function informationClaimResponseEventId(claimId) {
  return claimId === "ursus-reunion-evacuation-account"
    ? "sr_ursus_account_recipient_response"
    : "sr_londinium_recipient_response";
}
function informationClaimRecipientTarget(s, eventId = "sr_londinium_recipient_response") {
  for (const claim of s?.informationClaims || [])
    if (!claim.pursuitStopped && informationClaimResponseEventId(claim.id) === eventId)
      for (const transmission of claim.transmissions || []) {
        const kind = transmission.receiverKind,
          person = INFORMATION_CLAIM_RECIPIENTS[kind] ? closeInfoPerson(s, kind) : null;
        if (
          transmission.receiverPersonId === person?.id &&
          closeInfoAvailable(s, kind) &&
          transmission.year < s.year &&
          !transmission.directResponse
        )
          return { claim, transmission, kind, person };
      }
  return null;
}
const INFORMATION_CLAIM_LATER_REPORTS = {
  "current-concern-more-checking": {
    view: "今も気にかけ、追加情報を探していると申告",
    action: "継続確認をしているとの申告",
    text: "その話を今も気にかけていて、別の情報も探していると本人が話した"
  },
  "counter-source-and-hold": {
    view: "別の情報も得て、判断を保留していると申告",
    action: "異なる説明を比べているとの申告",
    text: "その後に別の説明も聞いたので、判断は保留していると本人が話した"
  },
  "no-change-reported": {
    view: "現在の判断は明かさず、生活上の変更はしなかったと申告",
    action: "生活を変えなかったとの申告",
    text: "その後は特に調べず、暮らしも変えなかったと本人が話した"
  },
  "not-recalled-or-withheld": {
    view: "覚えていない、または話したくないとの申告",
    action: "判断・行動とも不明",
    text: "当時の話は覚えていない、または今は話したくないと本人が話した"
  }
};
function informationClaimLaterReportMarkup(transmission) {
  const reports = [
    ...(transmission?.laterReport ? [transmission.laterReport] : []),
    ...(Array.isArray(transmission?.laterReports) ? transmission.laterReports : [])
  ];
  return reports
    .map(
      (report, index) =>
        `／${esc(report.year)}年の後年申告${index ? `（第${index + 1}時点）` : ""}「${esc(report.text)}」（申告間の継続・独立確認なし）`
    )
    .join("");
}
function informationClaimLaterReportTarget(s) {
  const candidates = [];
  for (const claim of s?.informationClaims || [])
    if (!claim.pursuitStopped)
      for (const transmission of claim.transmissions || []) {
        const kind = transmission.receiverKind,
          person = INFORMATION_CLAIM_RECIPIENTS[kind] ? closeInfoPerson(s, kind) : null,
          reply = transmission.directResponse,
          reports = [
            ...(transmission.laterReport ? [transmission.laterReport] : []),
            ...(Array.isArray(transmission.laterReports) ? transmission.laterReports : [])
          ],
          previousReport = reports.at(-1) || null;
        if (
          reply &&
          reply.personId === person?.id &&
          closeInfoAvailable(s, kind) &&
          s.year - (previousReport?.year ?? reply.year) >= 2 &&
          reports.length < 6
        )
          candidates.push({
            claim,
            transmission,
            kind,
            person,
            previousReport,
            sequence: reports.length + 1,
            lastReportYear: previousReport?.year ?? reply.year
          });
      }
  return candidates.sort((a, b) => b.lastReportYear - a.lastReportYear)[0] || null;
}
function recordInformationClaimLaterResponse(s, input, eventId) {
  const target = informationClaimLaterReportTarget(s),
    event = EV.find(row => row.id === eventId),
    report = INFORMATION_CLAIM_LATER_REPORTS[input?.response];
  if (
    !target ||
    !event ||
    eventId !== "sr_information_claim_recipient_later_report" ||
    !report ||
    input.receiverPersonId !== target.transmission.receiverPersonId ||
    input.claimId !== target.claim.id
  )
    throw new Error("時間をおいた同一人物の申告として確認できる記録がありません");
  const entry = {
    year: s.year,
    age: s.age,
    eventId,
    personId: target.person.id,
    kind: input.response,
    view: report.view,
    action: report.action,
    text: report.text,
    scope: target.previousReport
      ? "今回の会話時点での本人申告。前回との間の考え・行動の連続性や第三者による確認は示さない"
      : "後年の一度の会話で本人が申告した現在の見解・過去の行動。期間中の継続や第三者による確認は示さない"
  };
  if (!target.previousReport) target.transmission.laterReport = entry;
  else (target.transmission.laterReports || (target.transmission.laterReports = [])).push(entry);
  target.claim.history.push({
    year: s.year,
    action: "recipient-later-report",
    eventId,
    detail: `${target.transmission.receiverGroup}が時間をおいて述べた見解・行動の申告（第${target.sequence}時点）を記録。申告間の継続や第三者による確認は未確定`
  });
  target.claim.history = target.claim.history.slice(-24);
  return entry;
}
function validInformationClaimLaterReport(report, previous, transmission, state) {
  const kind = report?.kind,
    definition = INFORMATION_CLAIM_LATER_REPORTS[kind],
    minimumYear = previous?.year ?? transmission.directResponse?.year,
    scope = previous
      ? "今回の会話時点での本人申告。前回との間の考え・行動の連続性や第三者による確認は示さない"
      : "後年の一度の会話で本人が申告した現在の見解・過去の行動。期間中の継続や第三者による確認は示さない";
  return (
    !!definition &&
    Number.isInteger(minimumYear) &&
    Number.isInteger(report.year) &&
    report.year >= minimumYear + 2 &&
    report.year <= state.year &&
    Number.isInteger(report.age) &&
    report.age <= state.age &&
    report.eventId === "sr_information_claim_recipient_later_report" &&
    report.personId === transmission.receiverPersonId &&
    report.view === definition.view &&
    report.action === definition.action &&
    report.text === definition.text &&
    report.scope === scope
  );
}
function informationClaimCorrectionTarget(s, kind) {
  const claim = s?.informationClaims?.find(row => row.id === "kazimierz-campaign-knight-panic"),
    person = INFORMATION_CLAIM_RECIPIENTS[kind] ? closeInfoPerson(s, kind) : null,
    transmission = [...(claim?.transmissions || [])]
      .reverse()
      .find(row => row.receiverKind === kind && row.receiverPersonId === person?.id);
  return claim &&
    person?.id &&
    closeInfoAvailable(s, kind) &&
    transmission &&
    transmission.year < s.year &&
    !transmission.correction &&
    (claim.evidence || []).some(row => row.type === "official-emergency-entry-rule")
    ? { claim, person, transmission }
    : null;
}
function canCorrectInformationClaim(s, kind) {
  return !!informationClaimCorrectionTarget(s, kind);
}
const INFORMATION_CLAIM_CORRECTION_RESPONSES = {
  concerned: "その掲示の内容を気にしていると言った",
  undetermined: "規則だけでは判断できないと言った",
  doubtful: "掲示を自分で確かめないと判断できないと言った",
  withheld: "訂正について考えを話さなかった"
};
function informationClaimCorrectionResponseTarget(s) {
  const claim = s?.informationClaims?.find(row => row.id === "kazimierz-campaign-knight-panic");
  for (const transmission of claim?.transmissions || []) {
    const kind = transmission.receiverKind,
      person = INFORMATION_CLAIM_RECIPIENTS[kind] ? closeInfoPerson(s, kind) : null,
      correction = transmission.correction;
    if (
      correction &&
      correction.personId === person?.id &&
      closeInfoAvailable(s, kind) &&
      correction.year < s.year &&
      !correction.response
    )
      return { claim, transmission, correction, kind, person };
  }
  return null;
}
function recordInformationClaimCorrectionResponse(s, input, eventId) {
  const target = informationClaimCorrectionResponseTarget(s),
    event = EV.find(row => row.id === eventId),
    response = INFORMATION_CLAIM_CORRECTION_RESPONSES[input?.response];
  if (
    !target ||
    !event ||
    eventId !== "sr_kazimierz_correction_response" ||
    !response ||
    input.receiverPersonId !== target.transmission.receiverPersonId ||
    input.claimId !== target.claim.id
  )
    throw new Error("訂正後の同じ相手との会話として確認できる返答がありません");
  target.correction.response = {
    year: s.year,
    age: s.age,
    eventId,
    personId: target.person.id,
    kind: input.response,
    text: response,
    scope: "この会話での訂正への返答のみ。訂正の受け止め・行動・主張の真偽は確定しない"
  };
  target.claim.history.push({
    year: s.year,
    action: "recipient-correction-response",
    eventId,
    detail: `${target.transmission.receiverGroup}が訂正を受けて述べた一度の返答「${response}」を記録。継続する信念・行動や主張の真偽は未確認`
  });
  target.claim.history = target.claim.history.slice(-24);
  return target.correction.response;
}
function recordInformationClaimResponse(s, input, eventId) {
  const target = informationClaimRecipientTarget(s, eventId),
    event = EV.find(row => row.id === eventId),
    response = INFORMATION_CLAIM_DIRECT_RESPONSES[input?.response];
  if (
    !target ||
    !event ||
    eventId !== informationClaimResponseEventId(target.claim.id) ||
    !response ||
    input.receiverPersonId !== target.transmission.receiverPersonId ||
    input.claimId !== target.claim.id
  )
    throw new Error("同じ人物との後年の会話として確認できる返答がありません");
  target.transmission.directResponse = {
    year: s.year,
    age: s.age,
    eventId,
    personId: target.person.id,
    kind: input.response,
    text: response,
    scope: "その会話での発言のみ。継続する信念・行動は未記録"
  };
  target.claim.history.push({
    year: s.year,
    action: "recipient-direct-response",
    eventId,
    detail: `${target.transmission.receiverGroup}との会話での返答を記録。継続する信念・行動や主張の真偽は未確認`
  });
  target.claim.history = target.claim.history.slice(-24);
  return target.transmission.directResponse;
}
function hasInformationClaim(s, id) {
  return Array.isArray(s?.informationClaims) && s.informationClaims.some(row => row.id === id);
}
const INFORMATION_CLAIM_RECIPIENTS = { father: "父", mother: "母", spouse: "同居する配偶者", friend: "友人" };
function canShareInformationClaim(s, kind, claimId = "londinium-market-price-rise") {
  const claim = s?.informationClaims?.find(row => row.id === claimId),
    label = INFORMATION_CLAIM_RECIPIENTS[kind],
    person = label ? closeInfoPerson(s, kind) : null;
  return (
    !!claim &&
    !claim.pursuitStopped &&
    !!person?.id &&
    closeInfoAvailable(s, kind) &&
    !(claim.transmissions || []).some(row => row.receiverPersonId === person.id)
  );
}
const LONDINIUM_CONFLICT_CLAIMS = ["londinium-market-price-rise", "londinium-grain-price-stability"];
function informationClaimConflictRecipientTarget(s, kind) {
  const [marketId, grainId] = LONDINIUM_CONFLICT_CLAIMS,
    market = s?.informationClaims?.find(row => row.id === marketId),
    grain = s?.informationClaims?.find(row => row.id === grainId),
    label = INFORMATION_CLAIM_RECIPIENTS[kind],
    person = label ? closeInfoPerson(s, kind) : null;
  if (
    s?.res?.n !== "ヴィクトリア" ||
    s.local?.city === "ロンディニウム" ||
    s.year < 1099 ||
    s.year > 1110 ||
    !market ||
    !grain ||
    grain.relation?.claimId !== marketId ||
    grain.relation?.status !== "unresolved" ||
    !market.channel ||
    !grain.channel ||
    !person?.id ||
    !closeInfoAvailable(s, kind) ||
    [market, grain].some(
      claim =>
        claim.pursuitStopped ||
        claim.recordedYear >= s.year ||
        (claim.transmissions || []).some(row => row.receiverPersonId === person.id)
    )
  )
    return null;
  return { claims: [market, grain], label, person };
}
function informationClaimConflictRecipients(s) {
  const out = [];
  for (const kind of Object.keys(INFORMATION_CLAIM_RECIPIENTS)) {
    const target = informationClaimConflictRecipientTarget(s, kind);
    if (target) out.push({ ...target, kind });
  }
  return out;
}
function validInformationClaimConflictTransmission(s, claim, row) {
  if (row.pairedClaimId == null && row.conflictConversationId == null) return true;
  if (
    !LONDINIUM_CONFLICT_CLAIMS.includes(claim.id) ||
    !LONDINIUM_CONFLICT_CLAIMS.includes(row.pairedClaimId) ||
    row.pairedClaimId === claim.id ||
    !Number.isInteger(row.age) ||
    row.age > s.age ||
    typeof row.conflictConversationId !== "string" ||
    row.conflictConversationId !== `londinium-market-conflict:${row.year}:${row.receiverPersonId}`
  )
    return false;
  const paired = s.informationClaims?.find(item => item.id === row.pairedClaimId),
    counterpart = paired?.transmissions?.find(
      item => item.conflictConversationId === row.conflictConversationId
    );
  const related =
    claim.id === "londinium-market-price-rise"
      ? paired?.relation?.claimId === "londinium-market-price-rise" &&
        paired?.relation?.status === "unresolved"
      : claim.relation?.claimId === "londinium-market-price-rise" && claim.relation?.status === "unresolved";
  return (
    !!paired &&
    related &&
    row.year > Math.max(claim.recordedYear, paired.recordedYear) &&
    counterpart?.pairedClaimId === claim.id &&
    counterpart.receiverPersonId === row.receiverPersonId &&
    counterpart.receiverKind === row.receiverKind &&
    counterpart.year === row.year &&
    counterpart.age === row.age &&
    counterpart.eventId === row.eventId &&
    counterpart.conflictConversationId === row.conflictConversationId &&
    row.eventId === "sr_londinium_claim_conflict_followup" &&
    row.alteration === "異なる二つの未確認情報を、食い違う見通しとして伝えた"
  );
}
