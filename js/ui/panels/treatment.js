function formatDisclosureImpact(s) {
  const m=s.disclosureImpact;
  if(!m)return '<p>拒絶・漏洩による継続補正の記録はありません。</p>';
  const state=disclosureImpactState(s),rule=DISCLOSURE_IMPACT_RULES[state.level],latest=m.episodes.at(-1),
    factor=(key,positive)=>wellbeingDelta(s,key,positive?1:-1)*(positive?1:-1),
    number=n=>Number(n.toFixed(3));
  return '<section><h4>露見後の影響：'+esc(rule.label)+'</h4><p>'+esc(latest.reason)+'</p>'+
    '<p>回復の実績：'+Math.round(m.recovery*100)+'%（現在の有効値 '+Math.round(state.recovery*100)+'%）</p>'+
    '<p>'+(state.ongoing?'現在の生活圏に被害の継続記録があります。':'現在の生活圏で継続中と確認できる被害はありません。')+'</p>'+
    '<details><summary>能力値への補正</summary><table><caption>増加・減少に掛ける倍率</caption>'+
    '<thead><tr><th scope="col">指標</th><th scope="col">増加</th><th scope="col">減少</th></tr></thead><tbody>'+
    ['p','rl'].map(key=>'<tr><th scope="row">'+(key==='p'?'幸福':'身近なつながり')+'</th><td>×'+number(factor(key,true))+'</td><td>×'+number(factor(key,false))+'</td></tr>').join('')+
    '</tbody></table><p>固定減点累計の基準：幸福 −'+rule.p+'／身近なつながり −'+rule.rl+'。下限は0です。同じ範囲の再通知では再減点しません。</p></details></section>';
}
function formatInfectionAwarenessSummary(s) {
  if(!s.fl?.dg&&!s.inf)return '<p>鉱石病の診断記録はありません（周囲への露見なし）。</p>';
  const entries=infectionAwarenessEntries(s).filter(row=>row.subject==='protagonist'),
    confirmed=entries.filter(row=>row.certainty==='confirmed'&&row.subjectMatch==='confirmed'),
    uncertain=entries.filter(row=>['suspected','unverified'].includes(row.certainty)),
    published=entries.filter(row=>row.certainty==='published'),
    here=row=>row.region===s.res?.n&&row.placeId===s.local?.placeId&&(!row.areaKey||row.areaKey===s.community?.key),
    audience={family:'家族・親族',household:'同居世帯',friend:'友人',workplace:'職場・同僚',employer:'雇い主・責任者',
      school:'学校', 'school-contact':'相談した教員','housing-management':'家主・管理人',residents:'近隣住民',community:'地域社会',
      public:'公衆','local-authority':'役所・警備隊','medical-service':'診療所・医療機関','clinic-waiting-room':'診療所の待合室',
      'community-meeting':'参加した集まり','support-service':'支援窓口'},
    certainty={confirmed:'診断の確知',suspected:'疑い',unverified:'未確認の噂',published:'本人が発信（受信・本人との結び付きは未確認）'};
  const rows=entries.slice(-8).reverse().map(row=>'<li>'+esc(row.year+'年・'+(audience[row.audience]||row.audience)+'：'+
    (certainty[row.certainty]||row.certainty)+(here(row)?'':'（過去の所在地の記録）'))+'</li>').join('');
  return '<p>診断の確知 '+confirmed.filter(here).length+'件／疑い・噂 '+uncertain.filter(here).length+'件／本人の発信 '+published.filter(here).length+'件（現在の所在地）</p>'+
    '<p>診療や受容された告白だけでは、拒絶や外部への伝達が起きたことにはなりません。</p>'+
    (rows?'<details><summary>直近の認知・露見記録</summary><ul>'+rows+'</ul></details>':'<p>相手と範囲を確認できる認知記録はありません。</p>')+
    formatDisclosureImpact(s);
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
