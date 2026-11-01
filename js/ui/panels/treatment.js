function formatInfectionAwarenessSummary(s) {
  if (!s.fl?.dg && !s.inf) {
    return "<p>鉱石病の診断記録はありません（周囲への露見なし）。</p>";
  }
  const entries = (s.infectionAwareness?.entries || []).filter(e => e.subject === "protagonist");
  const hasFamily = entries.some(e => ["family", "household"].includes(e.audience)) || !!s.fl?.infection_family_disclosed;
  const hasWorkSchool = entries.some(e => ["workplace", "employer", "school", "housing-management"].includes(e.audience));
  const hasPublic = entries.some(e => ["residents", "community", "public", "local-authority"].includes(e.audience));

  let badge = "完全秘匿";
  let summaryText = "診断や病気の事実は周囲に知られておらず、秘密が保たれています。";
  let badgeColor = "#2e7d32";

  if (hasPublic) {
    badge = "地域社会に露見";
    summaryText = "近隣住民や世間一般に病気のことや噂が知れ渡っています。露店や水場での接触を避けられたり、偏見の目に晒されやすい状態です。";
    badgeColor = "#c62828";
  } else if (hasWorkSchool) {
    badge = "関係先に露見";
    summaryText = "職場、学校、または住居の管理人に診断や疑いが伝わっています。手当や持ち場の変更、退去要求などの影響が出やすい状態です。";
    badgeColor = "#ef6c00";
  } else if (hasFamily) {
    badge = "身内のみ把握";
    summaryText = "家族や同居人には事情を伝えていますが、外部（職場・近隣住民）には知られていません。家庭外では普段通りの振る舞いが保たれています。";
    badgeColor = "#1565c0";
  }

  const audienceLabel = {
    family: "家族・親族",
    household: "同居世帯",
    workplace: "職場・同僚",
    employer: "雇い主・責任者",
    school: "学校・教員",
    "housing-management": "家主・管理人",
    residents: "近隣住民",
    community: "地域社会",
    public: "公衆・社会",
    "local-authority": "役所・警備隊",
    "medical-service": "診療所・医療機関"
  };

  const certaintyLabel = {
    confirmed: "確定",
    suspected: "疑い",
    unverified: "噂あり",
    published: "公知"
  };

  let rowsHtml = "";
  if (entries.length > 0) {
    rowsHtml = '<ul style="margin: 6px 0; padding-left: 18px; font-size: 0.82rem; line-height: 1.5;">' +
      entries.slice(-8).reverse().map(e => {
        const aud = audienceLabel[e.audience] || e.audience;
        const cert = certaintyLabel[e.certainty] || e.certainty;
        const src = e.source === "self-disclosure" ? "本人開示" :
                    e.source === "workplace-disclosure" ? "職場開示" :
                    e.source === "unattributed-rumor" ? "出所不明の噂" :
                    e.source === "direct-question" ? "直接の問い詰め" : "出来事から";
        return `<li><strong>${e.year}年・${aud}</strong>: ${cert}（${src}）</li>`;
      }).join("") +
      '</ul>';
  } else if (hasFamily) {
    rowsHtml = '<p style="font-size: 0.82rem; margin: 4px 0;">家族・家庭への開示記録あり（外部への伝達なし）</p>';
  } else {
    rowsHtml = '<p style="font-size: 0.82rem; margin: 4px 0; color: var(--ui-muted, #888);">外部の誰にも知られていません（秘密保持中）</p>';
  }

  return `
    <div style="margin-bottom: 8px;">
      <span style="display: inline-block; padding: 2px 7px; font-size: 0.78rem; font-weight: bold; border-radius: 3px; background: ${badgeColor}; color: #fff; margin-bottom: 4px;">${badge}</span>
      <p style="margin: 4px 0 6px; font-size: 0.84rem;">${summaryText}</p>
      <div style="border-top: 1px dashed var(--ui-border, #444); padding-top: 6px;">
        <span style="font-size: 0.78rem; color: var(--ui-muted, #888); font-weight: bold;">直近の認知・露見記録:</span>
        ${rowsHtml}
      </div>
    </div>
  `;
}

function renderTreatmentPanel(s, services) {
  const oriHistory = (s.oripathyExposure?.history || []).filter(row =>
    row.kind !== "model-infection" && (row.kind !== "diagnosis" || s.fl?.dg)
  );
  const oriBox = services.document.getElementById("ori-history");
  if (oriBox) {
    oriBox.textContent = oriHistory.length
      ? oriHistory
          .slice(-8)
          .map(
            x =>
              `${x.year}年：${x.note}（${
                x.kind === "model-infection"
                  ? "感染機会の推定"
                  : x.kind === "diagnosis"
                    ? "診断記録"
                    : "対応の記録"
              }` + `）`
          )
          .join("／")
      : "曝露・診療の経過は未記録。";
  }
  const awarenessBox = services.document.getElementById("infection-awareness-status");
  if (awarenessBox) {
    awarenessBox.innerHTML = formatInfectionAwarenessSummary(s);
  }
  services.$("txw").hidden = !s.fl.dg || s.dead;
  services.$("tx").checked = !!s.fl.tx;
  services.$("tx").disabled = !!s.fl.detained && !s.fl.tx;
  services.$("tx").title = services.$("tx").disabled ? "収容中は医療担当への相談が必要" : "継続治療の有無";
}
