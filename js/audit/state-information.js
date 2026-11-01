function auditInformationState(s, problems, services = STATE_AUDIT_SERVICES) {
  const contacts = s.infoLog || [],
    contactIds = contacts.map(x => x?.id).filter(Boolean);
  for (const [id, year] of Object.entries(s.world?.events || {})) {
    const history = services.HIST.find(row => row.flag === id);
    if (!history) continue;
    const available =
      history.y < s.year ||
      (history.y === s.year &&
        (!Number.isInteger(history.availableFromMonth) ||
          (Number.isInteger(s.mo) && s.mo >= history.availableFromMonth)));
    if (year !== history.y || !available) problems.push("年表事件旗が公開時点より前に有効化されている");
  }
  if (s.age < services.P("information.personalRecallMinimumAge") && contacts.length)
    problems.push("本人への年表通知が最低年齢より前に記録されている");
  if (new Set(contactIds).size !== contactIds.length) problems.push("同じ世界事件の本人への伝達記録が重複");
  contacts.forEach(x => {
    const history = services.HIST.find(h => h.flag === x?.id);
    if (!history) {
      problems.push("年表にない世界事件が情報接触記録にある");
      return;
    }
    if (x.eventYear !== history.y) problems.push("情報接触記録の事件年が年表と一致しない");
    if (!Number.isInteger(x.heardYear) || x.heardYear < history.y || x.heardYear > s.year)
      problems.push("情報接触記録の伝達年が不正");
    const monthCount = services.P("birth.monthCount"),
      validMonth = month =>
        month == null || (Number.isInteger(month) && month >= 1 && month <= monthCount);
    if (!validMonth(x.heardMonth) || !validMonth(x.eventAvailableFromMonth))
      problems.push("情報接触記録の伝達月・公開月が不正");
    if (
      Number.isInteger(history.availableFromMonth) &&
      x.heardYear === history.y &&
      Number.isInteger(x.heardMonth) &&
      x.heardMonth < history.availableFromMonth
    )
      problems.push("史実イベントの公開月より前に本人へ伝わっている");
    if (
      x.heardYear === s.year &&
      Number.isInteger(x.heardMonth) &&
      Number.isInteger(s.mo) &&
      s.mo >= 1 &&
      s.mo <= monthCount &&
      x.heardMonth > s.mo
    )
      problems.push("現在より後の月に届いた年表情報が記録されている");
    if (!s.known?.[x.id] || !s.hd?.[x.id] || s.world?.events?.[x.id] !== history.y)
      problems.push("情報接触記録と本人認知・年表状態が一致しない");
  });
  const claims = Array.isArray(s.informationClaims) ? s.informationClaims : [],
    claimIds = claims.map(row => row?.id);
  if (
    s.informationClaims != null &&
    (!Array.isArray(s.informationClaims) || claims.length > 24 || new Set(claimIds).size !== claimIds.length)
  )
    problems.push("情報主張台帳の配列・上限・重複が不正");
  else
    for (const claim of claims) {
      const definition = services.INFORMATION_CLAIM_DEFINITIONS[claim?.id],
        related = definition?.relation ? claims.find(row => row.id === definition.relation.claimId) : null,
        localEncounter = definition?.basis === "situated-encounter";
      const validHistory =
        Array.isArray(claim.history) &&
        claim.history.length <= 24 &&
        claim.history.every(
          row =>
            Number.isInteger(row.year) &&
            row.year <= s.year &&
            [
              "received-unverified",
              "observe-one-stall",
              "share-unverified-household",
              "share-unverified-close-person",
              "assess-plausible",
              "assess-undetermined",
              "assess-doubtful",
              "stop-pursuit",
              "recipient-direct-response",
              "recipient-correction-response",
              "recipient-later-report",
              "verify-emergency-entry-rule",
              "correct-prior-recipient",
              "correct-prior-workplace",
              "present-unverified-to-organization",
              "present-conflicting-claims-to-organization",
              "present-unverified-to-workplace",
              "share-conflicting-claims-close-person"
            ].includes(row.action) &&
            services.EV.some(event => event.id === row.eventId)
        );
      const validEvidence =
        Array.isArray(claim.evidence) &&
        claim.evidence.length <= 12 &&
        claim.evidence.every(
          row =>
            Number.isInteger(row.year) &&
            row.year <= s.year &&
            ((row.type === "single-stall-price-observation" &&
              row.scope === "一店舗・一時点" &&
              row.source === "本人が見た値札" &&
              row.result === definition?.evidenceResult) ||
              (claim.id === "kazimierz-campaign-knight-panic" &&
                row.type === "official-emergency-entry-rule" &&
                row.scope === "非常時における征戦騎士の大騎士領入城の可否" &&
                row.source === "国民評議会の緊急規則に関する市内掲示（掲示を見つける経路はゲーム上の仮定）" &&
                row.result ===
                  "非常時の入城は認められるとの説明を確認。無断入城との主張を限定する根拠だが、停電の継続時間、市民生活への影響、混乱の程度や原因は判定しない"))
        );
      const validTransmissions =
        Array.isArray(claim.transmissions) &&
        claim.transmissions.length <= 12 &&
        new Set(claim.transmissions.map(row => row.receiverPersonId)).size === claim.transmissions.length &&
        claim.transmissions.every(row => {
          const kind = row.receiverKind,
            label = services.INFORMATION_CLAIM_RECIPIENTS[kind],
            reply = row.directResponse,
            corr = row.correction,
            correctionReply = corr?.response,
            later = row.laterReport,
            laterRows = row.laterReports ?? [],
            validReply =
              reply == null ||
              (Number.isInteger(reply.year) &&
                reply.year > row.year &&
                reply.year <= s.year &&
                Number.isInteger(reply.age) &&
                reply.age <= s.age &&
                reply.eventId === services.informationClaimResponseEventId(claim.id) &&
                reply.personId === row.receiverPersonId &&
                Object.hasOwn(services.INFORMATION_CLAIM_DIRECT_RESPONSES, reply.kind) &&
                reply.text === services.INFORMATION_CLAIM_DIRECT_RESPONSES[reply.kind] &&
                reply.scope === "その会話での発言のみ。継続する信念・行動は未記録"),
            validCorrection =
              corr == null ||
              (claim.id === "kazimierz-campaign-knight-panic" &&
                Number.isInteger(corr.year) &&
                corr.year > row.year &&
                corr.year <= s.year &&
                Number.isInteger(corr.age) &&
                corr.age <= s.age &&
                corr.eventId === "sr_kazimierz_claim_correction" &&
                corr.personId === row.receiverPersonId &&
                corr.kind === "narrowed-correction" &&
                corr.sourceEvidenceType === "official-emergency-entry-rule" &&
                (claim.evidence || []).some(e => e.type === corr.sourceEvidenceType) &&
                corr.text ===
                  "緊急規則では非常時の入城が認められるという別の説明も見つかった。『無断入城』との非難は未確認のままだが、この点は訂正して伝える" &&
                corr.scope === "入城可否について以前の伝達を限定。停電被害・市民の反応・因果関係は未確認" &&
                corr.uptake === "相手の受け止め・信念・行動は未記録"),
            validCorrectionResponse =
              correctionReply == null ||
              (!!corr &&
                Number.isInteger(correctionReply.year) &&
                correctionReply.year > corr.year &&
                correctionReply.year <= s.year &&
                Number.isInteger(correctionReply.age) &&
                correctionReply.age <= s.age &&
                correctionReply.eventId === "sr_kazimierz_correction_response" &&
                correctionReply.personId === row.receiverPersonId &&
                Object.hasOwn(services.INFORMATION_CLAIM_CORRECTION_RESPONSES, correctionReply.kind) &&
                correctionReply.text ===
                  services.INFORMATION_CLAIM_CORRECTION_RESPONSES[correctionReply.kind] &&
                correctionReply.scope ===
                  "この会話での訂正への返答のみ。訂正の受け止め・行動・主張の真偽は確定しない"),
            validLater =
              later == null || (!!reply && services.validInformationClaimLaterReport(later, null, row, s)),
            validLaterHistory =
              row.laterReports == null ||
              (Array.isArray(row.laterReports) &&
                row.laterReports.length <= 5 &&
                !!later &&
                row.laterReports.every((item, index, rows) =>
                  services.validInformationClaimLaterReport(
                    item,
                    index === 0 ? later : rows[index - 1],
                    row,
                    s
                  )
                ));
          return (
            Number.isInteger(row.year) &&
            row.year <= s.year &&
            row.sender === "protagonist" &&
            !!label &&
            row.receiverGroup === label &&
            typeof row.receiverPersonId === "string" &&
            row.channel === "口頭" &&
            row.reach === `${row.receiverGroup}との会話` &&
            (row.alteration === "未確認の可能性として伝えた" ||
              row.alteration === "異なる二つの未確認情報を、食い違う見通しとして伝えた") &&
            row.uptake === "個人の受け止め・信念は未記録" &&
            validReply &&
            validCorrection &&
            validCorrectionResponse &&
            validLater &&
            validLaterHistory &&
            services.validInformationClaimConflictTransmission(s, claim, row)
          );
        });
      const groupRows = claim.groupTransmissions,
        validGroupTransmissions =
          groupRows == null ||
          (Array.isArray(groupRows) &&
            groupRows.length <= 12 &&
            new Set(
              groupRows.map(row =>
                row.workplaceId ? `workplace:${row.workplaceId}` : `organization:${row.organizationId}`
              )
            ).size === groupRows.length &&
            groupRows.every(row => services.informationClaimGroupTransmissionValid(s, claim, row)));
      const validAssessments =
        claim.assessments == null ||
        (Array.isArray(claim.assessments) &&
          claim.assessments.length <= 12 &&
          claim.assessments.every(
            (row, index, rows) =>
              Number.isInteger(row.year) &&
              row.year <= s.year &&
              Number.isInteger(row.age) &&
              row.age <= s.age &&
              row.eventId === definition?.followupEvent &&
              Number.isInteger(row.evidenceCount) &&
              row.evidenceCount >= 0 &&
              row.evidenceCount <= (claim.evidence?.length || 0) &&
              (index === 0 || row.evidenceCount > rows[index - 1].evidenceCount) &&
              ["assess-plausible", "assess-undetermined", "assess-doubtful"].includes(row.action) &&
              row.value ===
                {
                  "assess-plausible": "可能性を警戒する",
                  "assess-undetermined": "判断を保留する",
                  "assess-doubtful": "根拠が乏しいと考える"
                }[row.action]
          ));
      const validRelation = definition?.relation
        ? !!related &&
          claim.relation?.claimId === definition.relation.claimId &&
          claim.relation?.type === definition.relation.type &&
          claim.relation?.status === "unresolved"
        : claim.relation == null;
      const receipt = claim.receiptContext,
        context = definition?.context,
        validReceipt = context
          ? receipt?.region === context.region &&
            (context.home == null || receipt.home === context.home) &&
            (context.months == null || context.months.includes(receipt.month)) &&
            (context.from == null || claim.recordedYear >= context.from) &&
            (context.to == null || claim.recordedYear <= context.to)
          : receipt == null;
      const receiptModeValid =
        claim.id === "kazimierz-grid-restoration"
          ? claim.receiptMode == null
            ? claim.receiptCost == null && claim.channel === definition.channel
            : (claim.receiptMode === "printed-purchase" &&
                claim.receiptCost === 1200 &&
                claim.channel === "街頭で購入したローズ新聞") ||
              (claim.receiptMode === "vendor-summary" &&
                claim.receiptCost === 0 &&
                claim.channel === "売り場で売り子から聞いた新聞の要点")
          : claim.receiptMode == null && claim.receiptCost == null && claim.channel === definition?.channel;
      if (
        !definition ||
        claim.eventId !== (localEncounter ? definition.receiveEvent : definition.historyFlag) ||
        claim.text !== definition.text ||
        claim.scope !== definition.scope ||
        claim.status !== "unverified" ||
        !Number.isInteger(claim.recordedYear) ||
        claim.recordedYear > s.year ||
        claim.claimant !== definition.claimant ||
        !receiptModeValid ||
        !validRelation ||
        !validReceipt ||
        !validHistory ||
        !validEvidence ||
        !validTransmissions ||
        !validGroupTransmissions ||
        !validAssessments ||
        !(claim.pursuitStopped == null || typeof claim.pursuitStopped === "boolean") ||
        (!localEncounter && !s.known?.[definition.historyFlag])
      )
        problems.push("情報主張の出所・未確認状態・伝播履歴が不正");
    }
  const responses = Array.isArray(s.informationResponses) ? s.informationResponses : [],
    responseIds = responses.map(row => `${row.eventId}:${row.factId}`);
  if (
    (s.informationResponses != null && !Array.isArray(s.informationResponses)) ||
    responses.length > 40 ||
    new Set(responseIds).size !== responseIds.length
  )
    problems.push("年表情報への応答記録の配列・上限・重複が不正");
  else
    for (const row of responses) {
      const history = services.HIST.find(item => item.flag === row.factId),
        contact = contacts.find(item => item.id === row.factId);
      if (
        !Number.isInteger(row.year) ||
        row.year > s.year ||
        !Number.isInteger(row.age) ||
        row.age > s.age ||
        !services.EV.some(item => item.id === row.eventId) ||
        !history ||
        !s.known?.[row.factId] ||
        s.world?.events?.[row.factId] !== history.y ||
        !["household-preparation", "look-up-relief", "withhold-unverified-report"].includes(row.response)
      )
        problems.push("年表情報への応答と本人の事件知識・選択が一致しない");
      if (row.sourceRecord === "recorded-route") {
        if (
          !contact ||
          row.heardYear !== contact.heardYear ||
          (row.heardMonth ?? null) !== (contact.heardMonth ?? null) ||
          row.route !== contact.route
        )
          problems.push("年表情報への応答が保存済みの伝達経路と一致しない");
      } else problems.push("年表情報への応答に保存済みの伝達経路がない");
    }
}
