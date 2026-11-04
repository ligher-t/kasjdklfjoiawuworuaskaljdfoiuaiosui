function educationObservationMarkup(s) {
  const labels={p_exists:"学校存在",p_open:"開講・募集",p_discovered:"募集情報発見",
    p_reachable:"到達可能",p_accepted:"受入",p_funded:"費用確保",p_completed:"正式修了"};
  const units={p_exists:"教育生活圏・拠点×課程",p_open:"課程×年月",p_discovered:"本人の進路希望期間",
    p_reachable:"既知候補を持つ進路希望期間",p_accepted:"判定済み出願案件",p_funded:"期限に達した受入案件",
    p_completed:"追跡終了した学籍×修了課程"};
  return educationObservationRegionalRows(s).map(row=>`<section><h4>${esc(row.region)}・${row.period.year}年${row.period.month}月</h4>`+
    `<table><caption>保存済み世界と本人の進路案件の限定標本（人口就学率ではありません）</caption>`+
    `<thead><tr><th scope="col">指標</th><th scope="col">分子／分母</th><th scope="col">分母の単位</th><th scope="col">留保</th></tr></thead><tbody>`+
    Object.values(row.metrics).map(x=>`<tr><th scope="row">${labels[x.metricId]}</th><td>${x.denominator?x.numerator+"／"+x.denominator:"未観測"}</td>`+
      `<td>${units[x.metricId]}</td><td>未確認 ${x.excludedUnknown}・審査中 ${x.pending}・未成熟 ${x.censored}・死亡競合 ${x.competingDeath}</td></tr>`).join("")+"</tbody></table></section>").join("")||"観測できる学校世界はまだありません。";
}
function educationDeskClick(action) {
  const s=S;
  if(!s||s.dead||s.ev||s.mo<1||s.mo>12)return false;
  if(typeof play==="function")play(0);
  if(action==="transfer-search"){
    const result=educationServiceTransferInquiry(s);rd();return result;
  }
  if(action==="abroad"){
    if(educationActiveCase(s)?.phase!=="planning")return false;
    educationPrepareStudyDestinations(s);educationCaseDiscover(s,"abroad");
    educationServiceInquiry(s);rd();return true;
  }
  if(action==="inquire"){
    const result=educationServiceInquiry(s);rd();return result;
  }
  if(s.majorEventMonth?.year===s.year&&s.majorEventMonth.month===s.mo)return false;
  if(action.startsWith("apply:")){
    const id=action.slice(6),item=educationActiveCase(s);
    if(item?.phase!=="planning"||!educationCaseCandidates(s).some(x=>x.offeringId===id))return false;
    item.previewOfferingId=id;action="education_case_review";
  }
  const event=EV.find(x=>x.id===action);
  if(!event||!elig(event,s,tags(s)))return false;
  fire(event,s,tags(s));return true;
}
function renderEducationPanel(s) {
  const target=document.getElementById("education-current");if(!target)return;
  target.textContent=educationStandingLabel(s)+educationCasePresentation(s);
  const family=document.getElementById("education-dependents");
  if(family)family.innerHTML=educationDependentKnownView(s).map(x=>
    `<p>${esc(x.name)}：${esc(x.education)}<br>${esc(x.residence)}</p>`).join("");
  const desk=document.getElementById("education-desk");
  if(desk){
    const active=educationActiveCase(s)||educationMigrationCurrent(s),
      disabled=s.dead||!!s.ev||s.mo<1||s.mo>12,
      used=s.majorEventMonth?.year===s.year&&s.majorEventMonth.month===s.mo,
      signature=JSON.stringify([disabled,used,active?.id||active?.enroll?.id,
        s.year,s.mo,s.educationServices?.inquiries,s.educationMigration?.records?.length,
        s.educationPath?.status,s.educationTransferRequests,s.educationAccess?.knownOfferings,
        educationActiveCase(s)?.previewOfferingId]);
    if(desk.dataset.educationSignature!==signature){
      desk.replaceChildren();
      const button=(label,action,blocked)=>{
        const b=document.createElement("button");b.type="button";b.textContent=label;
        b.disabled=blocked;b.addEventListener("click",()=>educationDeskClick(action));desk.appendChild(b);
      };
      if(active)button("募集先・通学・住まいの条件を照会", "inquire",disabled);
      if(educationMigrationCurrent(s))button("転学先の受入れと費用を照会","transfer-search",disabled);
      if(educationActiveCase(s)?.phase==="planning"&&s.age>=15)
        button("国外の募集先を調べる","abroad",disabled);
      if(educationActiveCase(s)?.phase==="planning")for(const [i,row] of educationCaseCandidates(s).entries()){
        const area=s.world.educationWorld.areas[row.areaId],
          label=area.regionKey+"・"+area.kind+"の"+EDUCATION_CASE_STAGES[row.stage]+"（候補"+(i+1)+"）を選ぶ";
        button(label,"apply:"+row.offeringId,disabled||used);
      }
      if(!disabled)for(const entry of window.GAME_DATA.EDUCATION_P17_REVIEWED||[]){
        if(entry.decision==="保留")continue;
        const event=EV.find(x=>x.id===entry.eventId);
        if(event&&educationMigrationEligible(s,event.id))button(entry.title,entry.eventId,used);
      }
      desk.dataset.educationSignature=signature;
    }
  }
  const diagnostic=document.getElementById("education-observation-details");
  if(diagnostic)diagnostic.hidden=!DEBUG_PLAYBACK;
  const liveReport=document.getElementById("education-observations");
  if(liveReport&&DEBUG_PLAYBACK&&s.mo>=1&&s.mo<=12)liveReport.innerHTML=educationObservationMarkup(s);
  const observations=document.getElementById("dev-education-report");
  if(observations&&s.mo>=1&&s.mo<=12)observations.innerHTML=educationObservationMarkup(s);
}
