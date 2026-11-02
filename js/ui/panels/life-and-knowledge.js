function renderLifeAndKnowledgePanel(s, services) {
  const recordMarkup = services
    .lifeRows(s)
    .map(([k, v]) => `<dt>${services.esc(k)}</dt><dd>${services.esc(v)}</dd>`)
    .join("");
  if (typeof services.recordTableMarkup === "function" && typeof services.setRecordMarkup === "function") {
    services.setRecordMarkup(services.$("life"), services.recordTableMarkup(recordMarkup, "place"));
    services.setRecordMarkup(services.$("trajectory"), services.lifeRecordMarkup(s));
  } else {
    if (services.$("life")) services.$("life").innerHTML = recordMarkup;
    if (services.$("trajectory")) services.$("trajectory").innerHTML = services.lifeRecordMarkup ? services.lifeRecordMarkup(s) : "";
  }
  services.$("basis").innerHTML = services.basisMarkup();
  const knownEvents = services.HIST.filter(h => h.flag && s.known?.[h.flag]);
  services.$("known").innerHTML = knownEvents.length
    ? knownEvents
        .slice()
        .reverse()
        .map(h => {
          const contact = (s.infoLog || []).filter(x => x.id === h.flag).slice(-1)[0],
            encounter = s.historicalDirectEncounters?.[h.flag],
            refs = (h.references || [])
              .map(id => services.SETTING_SOURCES[id])
              .filter(Boolean)
              .map(x => `${x.file || x.url || "資料記載なし"} p.${x.pages}・${x.kind}`)
              .join("、");
          return (
            `<div class="ledger"><b>${services.esc(h.displayDate || `${h.y}年`)}</b> ${services.esc(h.t)} <small class="nt">${
              contact
                ? `本人が知った時期: ${contact.heardYear}年${contact.heardMonth ? contact.heardMonth + "月" : ""}／経路: ${services.esc(contact.route)}／情報の根拠: ${services.esc(contact.textBasis || "未記録")}。` 
                : "伝達経路の記録なし（旧セーブ）。"
            }` +
            `${encounter ? `現地遭遇: ${services.esc(encounter.year)}年・${services.esc(encounter.city)}（${services.esc(encounter.eventId || "出来事")}）。` : ""}設定根拠区分: ${services.esc(h.conf || "未分類")}。${refs ? `参照資料: ${services.esc(refs)}。` : ""}</small></div>`
          );
        })
        .join("")
    : `<p class="nt">まだ本人が把握した年表事件はありません。事件の発生記録と本人が知る情報は別に管理されます。</p>`;
  if ((s.informationClaims || []).length) {
    services.$("known").innerHTML +=
      `<h4>本人が受け取った主張（事件の事実とは別）</h4>` +
      (s.informationClaims || [])
        .map(claim => {
          const assessment = claim.assessments?.at(-1)?.value,
            receipt = claim.receiptContext,
            transmissions = (claim.transmissions || [])
              .map(
                row =>
                  `${services.esc(row.year)}年: ${services.esc(row.receiverGroup)}へ${services.esc(row.channel)}で伝達${row.correction ? `／${services.esc(row.correction.year)}年、根拠を添えて訂正（受け止め・行動は未記録）` : ""}` +
                  `${
                    row.directResponse
                      ? `／${services.esc(row.directResponse.year)}年の会話で「${services.esc(row.directResponse.text)}」`
                      : `／返答未確認`
                  }` +
                  `${services.informationClaimLaterReportMarkup(row)}`
              )
              .join("／"),
            history = (claim.history || [])
              .map(row => `${services.esc(row.year)}年: ${services.esc(row.detail)}`)
              .join("／"),
            evidence = (claim.evidence || [])
              .map(
                row =>
                  `${services.esc(row.year)}年: ${services.esc(row.result)}（${services.esc(row.scope)}）`
              )
              .join("／"),
            related = claim.relation
              ? s.informationClaims.find(row => row.id === claim.relation.claimId)
              : null;
          return (
            `<div class="ledger"><b>${services.esc(claim.recordedYear)}年・未確認の主張</b> ${services.esc(claim.text)}<small class="nt"><br>発言者: ${services.esc(claim.claimant)}` +
            `／経路: ${services.esc(claim.channel)}${
              claim.receiptMode
                ? `／受領形態: ${
                    claim.receiptMode === "printed-purchase"
                      ? `購入した紙面（${claim.receiptCost}龍門幣）`
                      : "売り子の口頭要約（無料）"
                  }`
                : ""
            }` +
            (`／範囲: ${services.esc(claim.scope)}。${receipt ? `受領時: ${services.esc(receipt.region)}・${services.esc(receipt.home)}・${services.esc(receipt.month)}月。` : ""}` +
              `本人の記録: ${history || "履歴なし"}。限定的な確認: ${evidence || "なし"}。伝達: ${
                [
                  transmissions,
                  ...(claim.groupTransmissions || []).map(
                    row =>
                      `${services.esc(row.year)}年: ${services.esc(row.receiverGroup)}へ${row.workplaceId ? "勤務中に" : "会合で"}発言（${services.esc(row.scope)}）${
                        row.correction
                          ? `／${services.esc(row.correction.year)}年、同じ職場の会話で訂正: ${services.esc(row.correction.text)}。${services.esc(row.correction.scope)}。${services.esc(row.correction.uptake)}`
                          : ""
                      }`
                  )
                ]
                  .filter(Boolean)
                  .join("／") || "なし"
              }`) +
            (`。本人の現在の受け止め: ${services.esc(assessment || "未記録")}。${related ? `関連する主張として記録: 「${services.esc(related.text)}」。双方とも未確認で、主張間の関係は未確定。` : ""}` +
              `返答や後年申告は各会話時点の記録であり、継続する信念・行動や主張の真偽は確定しない。</small></div>`)
          );
        })
        .join("");
  }
}
