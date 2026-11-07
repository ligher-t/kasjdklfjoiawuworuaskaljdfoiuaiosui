// Player decisions use the same journey, family, service and settlement authorities.
const TRAVEL_PURPOSE_LABELS=[["wandering","放浪・見聞"],["family","親族・知人の訪問"],["work","仕事の用事"],["study","学びのための訪問"],["flight","避難"],["other","私用"]];
let TRAVEL_PANEL_DRAFT={};
function travelPanelCare(s,companionIds=TRAVEL_PANEL_DRAFT.personIds||[]){
  const minors=travelResidentMinorChildren(s).filter(x=>!companionIds.includes(x.id));if(!minors.length)return {ready:true,ref:null,message:"",consult:false};
  const spouse=s.sp;if(!spouse||spouse.d||!spouse.id||companionIds.includes(spouse.id)||!spouseLivesWithProtagonist(s))return {
    ready:false,ref:null,consult:false,message:"留守中の子どもの見守り役が確認されていない。"};
  const ids=minors.map(x=>x.id).sort(),a=Object.values(s.travelState?.familyCareAgreements||{}).find(x=>
    x.year===s.year&&x.caregiverId===spouse.id&&JSON.stringify(x.childIds)===JSON.stringify(ids));
  return {ready:a?.status==="granted",ref:a?.id||null,consult:!a,
    message:a?a.status==="granted"?"配偶者は留守中の子どもの見守りを引き受けた。":"配偶者は今回の見守りを引き受けなかった。":"子どもの見守りについて相談する必要がある。"};
}
function travelPanelReady(s){return !!s&&!s.dead&&!s.ev&&s.age>=6&&!restricted(s)&&Number.isInteger(s.mo)&&s.mo>=1&&s.mo<=12;}
function travelDraftChanged(){
  const dest=document.getElementById("travel-destination")?.value;
  TRAVEL_PANEL_DRAFT={...TRAVEL_PANEL_DRAFT,routeId:dest,purpose:document.getElementById("travel-purpose")?.value,
    durationMonths:Number(document.getElementById("travel-duration")?.value||1),
    personIds:[...document.querySelectorAll("[data-travel-companion]:checked")].map(x=>x.value)};
}
function renderTravelControls(s,services){
  const target=services.document.getElementById("travel-controls");if(!target)return;
  const esc=services.esc,fmt=services.m,j=travelCurrentJourney(s),ready=travelPanelReady(s),disabled=ready?"":" disabled",
    signature=JSON.stringify([s.randomSeed,s.year,s.mo,s.dead,!!s.ev,s.cash,s.house?.cash,s.travelState,s.sp?.id,(s.kids||[]).map(x=>[x.id,x.d])]);
  if(target._travelSignature===signature)return;
  const button=(label,action,enabled=true)=>'<button type="button" onclick="travelControlAction(\''+action+'\')"'+(!ready||!enabled?' disabled':'')+'>'+label+'</button>',lines=[];
  if(s.dead){target.textContent="この人生の旅程は終了した。";return;}
  if(!j){
    const routes=travelCorridors(s),draft=TRAVEL_PANEL_DRAFT,selected=routes.find(x=>x.id===draft.routeId)||routes.find(x=>s.travelState?.intent?.destinationRegion===x.toRegion)||routes[0];
    lines.push('<label for="travel-destination">行き先と行程</label> <select id="travel-destination" onchange="travelDraftChanged()">'+routes.map(x=>
      '<option value="'+esc(x.id)+'"'+(x.id===selected?.id?' selected':'')+'>'+esc(x.name)+'</option>').join("")+'</select>');
    lines.push('<label for="travel-purpose">目的</label> <select id="travel-purpose" onchange="travelDraftChanged()">'+TRAVEL_PURPOSE_LABELS.map(([id,label])=>
      '<option value="'+id+'"'+(id===(draft.purpose||s.travelState?.intent?.purpose||"wandering")?' selected':'')+'>'+label+'</option>').join("")+'</select>');
    lines.push('<label for="travel-duration">移動に要する期間</label> <select id="travel-duration" onchange="travelDraftChanged()">'+[1,2,3].map(n=>
      '<option value="'+n+'"'+(n===(draft.durationMonths||1)?' selected':'')+'>'+n+'か月</option>').join("")+'</select>');
    for(const person of travelCompanionCandidates(s))
      lines.push('<label><input type="checkbox" data-travel-companion value="'+esc(person.id)+'" onchange="travelDraftChanged()"'+
        (draft.personIds?.includes(person.id)?' checked':'')+'>'+esc(person.nm||"家族")+'と同行を相談する</label>');
    if(draft.personIds?.length)lines.push(button("選んだ家族と同行を相談する","consult-party"));
    const care=travelPanelCare(s);if(care.message)lines.push('<p class="nt">'+esc(care.message)+'</p>');
    if(care.consult)lines.push(button("子どもの見守りを相談する","consult"));
    if(s.age<18)lines.push(button("保護者に同行を相談する","consult-guardian"));
    lines.push(button("行程を計画する","plan",!!selected));
    lines.push('<p class="nt">広域移動の期間と料金はゲーム上の見積。登録のない街道や検問所の所在は未確認。</p>');
    lines.push('<p class="nt">帰路が登録された行程では往復分を先払いする。旅先での追加の食宿費は月ごとに掛かる。</p>');
  }else{
    const leg=j.legs[j.activeLegIndex],home=j.status==="arrived"&&leg.returnToBase,
      labels={planned:"出発準備中","en-route":"移動中",arrived:home?"帰還地点に到着":"旅先に到着","at-checkpoint":"検問で待機中",blocked:"滞在先で待機中","at-stop":"停留地で滞在中"};
    lines.push('<p>'+esc(j.originRegion)+'から'+esc(j.destinationRegion)+'への旅程：'+labels[j.status]+'。</p>');
    if(j.companions.length)lines.push('<p>同行者：'+j.companions.map(x=>esc([s.sp,...(s.kids||[])].find(p=>p?.id===x.personId)?.nm||"家族")).join("・")+'</p>');
    if(j.status==="planned"){
      const fare=travelLegFareQuote(s,leg.fromRegion,leg.toRegion).amount+
        (j.returnReservation?travelLegFareQuote(s,j.returnReservation.fromRegion,j.returnReservation.toRegion).amount:0);
      lines.push('<p>出発時の運賃：'+fmt(fare*(1+j.companions.length+(j.guardianEscort?1:0)))+'</p>');
      lines.push(button("出発する","depart"),button("行程を取りやめる","cancel"));
      lines.push(button("留守中の見守りを相談する","consult"));
    }else if(home)lines.push(button("帰還を完了する","finish"));
    else{
      if(["arrived","at-stop","at-checkpoint","blocked"].includes(j.status)){lines.push(button("滞在先で医療の窓口を照会","medical"),button("食宿の支援を相談する","support"));}
      if(["at-checkpoint","blocked"].includes(j.status)){
        lines.push(button("通行条件を照会して待つ","checkpoint:wait",travelCheckpointCan(s,"wait")));
        const permit=s.travelState?.permits?.[j.permitInquiry?.permitId],cp=travelCheckpointDefinition(s);
        if(cp)lines.push('<p>迂回の追加運賃：'+fmt(cp.detourFee)+'</p>');
        if(permit?.status==="offered"&&cp?.active)lines.push(button("通行証を受け取る（"+fmt(permit.fee)+"）","permit",
          (inSharedHousehold(s)?s.house?.cash:s.cash)>=permit.fee));
        lines.push(button("通行条件を満たして先へ進む","checkpoint:pass",travelCheckpointCan(s,"pass")),
          button("登録された迂回路へ進む","checkpoint:detour",travelCheckpointCan(s,"detour")));
      }
      if(j.status==="arrived"){
        lines.push(button("宿泊・住居・短期仕事の条件を照会","stay-inquiry"));
        if(j.workOffer?.status==="offered"&&j.localWork?.status!=="active")lines.push('<p>旅の滞在期間だけの短期仕事：月額 '+fmt(j.workOffer.monthlyPay)+'</p>');
        if(j.workOffer?.status==="offered"&&j.localWork?.status!=="active")lines.push(button("提示された短期仕事を引き受ける","local-work"));
        if(j.localWork?.status==="active")lines.push('<p>旅先の短期仕事：月額 '+fmt(j.localWork.monthlyPay)+'。移動再開、または定住で旅程を終えると終了する。</p>');
        if(j.stayOffer){
          if(s.sp&&!s.sp.d&&spouseLivesWithProtagonist(s)&&!j.companions.some(x=>x.personId===s.sp.id)){
            lines.push(button("旅先で暮らすことと別居について相談する","separation"));
            if(j.separationAgreement?.status==="refused")lines.push(button("反対を受けたうえで、定住の意思を固める","acknowledge-separation"));
          }
          lines.push(button("確認した住まいで定住を始める","settle"));
        }
        if(j.educationRef)lines.push(button("到着した学校で入学試験を受ける","exam",travelEducationCanAttend(s)));
        const next=travelCorridors(s,leg.toRegion);
        lines.push('<label for="travel-next">次の行き先</label> <select id="travel-next">'+next.map(x=>
          '<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join("")+'</select>');
        if(j.companions.length)lines.push(button("次の行先について同行者と相談する","consult-next-party"));
        if(s.age<18)lines.push(button("次の行先について保護者に相談する","consult-next-guardian"));
        lines.push(button("次の行程へ進む","continue",!!next.length&&!j.returning));
      }
      lines.push(button("帰路に就く","return"));
      lines.push(button("不足する運賃を後払いにして帰路に就く","return-credit"));
      lines.push('<p class="nt">後払いでは手持ちの資金を運賃に充て、不足分を運行側への負債として引き受ける。</p>');
    }
    const stay=Object.values(s.travelState.transactions).filter(x=>x.journeyId===j.id&&x.kind==="stay").reduce((a,x)=>a+x.amount,0);
    lines.push('<p>旅先の食宿費：'+fmt(stay)+'（これまでの累計）</p>');
  }
  if(!ready)lines.push('<p class="nt">年月と未解決の選択を確認してから、行程を操作できる。</p>');
  target.innerHTML=lines.join("");target._travelSignature=signature;
}
function travelControlAction(action,request){
  const s=S,box=document.getElementById("travel-message");if(!travelPanelReady(s)){if(box)box.textContent="現在の状態では旅程を操作できない。";return false;}
  try{
    if(typeof play==="function")play(0);
    const before=traceState(s),j=travelCurrentJourney(s),draft=TRAVEL_PANEL_DRAFT,
      selected=travelCorridors(s).find(x=>x.id===(request?.corridorId||document.getElementById("travel-destination")?.value||draft.routeId))||travelCorridors(s)[0];
    let note="",id=j?.id;
    if(action==="consult"){
      const a=travelFamilyCareAgreement(s,j?.companions.map(x=>x.personId)||draft.personIds||[]);if(!a)note="留守中の見守りを必要とする子どもはいない。";
      else{note=a.status==="granted"?"配偶者は留守中の見守りを引き受けた。":"配偶者は今回の見守りを引き受けなかった。";
        if(j?.status==="planned"&&a.status==="granted")travelRefreshFamilyCare(s,a.id);}
    }else if(action==="consult-party"){
      travelDraftChanged();const a=travelCompanionAgreement(s,TRAVEL_PANEL_DRAFT.personIds||[],selected?.toRegion);
      TRAVEL_PANEL_DRAFT.companionAgreementId=a.id;note=a.status==="granted"?"選んだ家族は、この行先への同行に同意した。":"家族は今回の同行に同意しなかった。";
    }else if(action==="consult-guardian"){
      const a=travelGuardianConsult(s,selected?.toRegion);TRAVEL_PANEL_DRAFT.guardianAgreementId=a.id;
      note=a.status==="granted"?"保護者が同行する旅行について了承を得た。":"保護者の了承は得られなかった。";
    }else if(action==="consult-next-party"||action==="consult-next-guardian"){
      const route=travelCorridors(s,travelPresence(s).region).find(x=>x.id===(request?.corridorId||document.getElementById("travel-next")?.value));
      if(!route)throw Error("次の行程が未選択");
      if(action==="consult-next-party"){
        const a=travelCompanionAgreement(s,j.companions.map(x=>x.personId),route.toRegion);
        TRAVEL_PANEL_DRAFT.nextCompanionAgreementId=a.id;note=a.status==="granted"?"同行者と次の行先について了承を確かめた。":"同行者は次の行先への移動を了承しなかった。";
      }else{
        const a=travelGuardianConsult(s,route.toRegion);TRAVEL_PANEL_DRAFT.nextGuardianAgreementId=a.id;
        note=a.status==="granted"?"保護者と次の行先への同行を確かめた。":"次の行先への保護者の了承は得られなかった。";
      }
    }else if(action==="plan"){
      const values=request||{destinationRegion:selected?.toRegion,corridorId:selected?.id,purpose:draft.purpose||s.travelState?.intent?.purpose||"wandering",durationMonths:draft.durationMonths||1};
      const party=travelValidateCompanions(s,values.companionAgreementId||draft.companionAgreementId,values.destinationRegion),care=travelPanelCare(s);
      const trip=travelStart(s,{...values,companionAgreementId:values.companionAgreementId||draft.companionAgreementId,
        guardianAgreementId:values.guardianAgreementId||draft.guardianAgreementId,
        prepayReturn:(MIGRATION_ROUTES[values.destinationRegion]||[]).some(x=>x.n===s.res.n),familyCareAgreementId:care.ref});
      note=trip.destinationRegion+"への行程を計画した。";id=trip.id;
    }else if(action==="depart"){const trip=travelDepart(s);note=trip.originRegion+"を離れ、旅に出発した。";}
    else if(action==="cancel"){travelEnd(s,"abandoned");note="出発前の行程を取りやめた。";}
    else if(action==="return"){travelBeginReturn(s);note="通ってきた道へ引き返し、帰路に就いた。";}
    else if(action==="return-credit"){travelBeginReturn(s,{deferPayment:true});note="運行側の後払い条件を受け入れ、不足する運賃を負債として帰路に就いた。";}
    else if(action==="finish"){travelEnd(s,"returned-home");note="元の暮らしの場所へ戻り、旅程を終えた。";}
    else if(action==="medical"){const a=travelHealthInquiry(s);note=a.status==="contact-confirmed"?"滞在先の診療窓口の連絡先を確認した。診察の予定を別に相談できる。":"この滞在先では診療窓口を確認できなかった。";}
    else if(action==="support"){const a=travelSupportInquiry(s);note=a.status==="approved"?"次の月の食宿費について、個別の減免を受けられると返事があった。":"今回の食宿費の減免は認められなかった。";}
    else if(action==="permit"){travelAcceptPermit(s);note="この検問で提示する通行証を受け取った。";}
    else if(action.startsWith("checkpoint:")){travelCheckpointAction(s,action.split(":")[1]);note="旅程の通行・滞在の判断を記録した。";}
    else if(action==="stay-inquiry"){travelStayInquiry(s);note="到着した土地で、住まいと仕事の条件を確かめた。";}
    else if(action==="local-work"){travelTakeLocalWork(s);note="提示された旅先の短期仕事を引き受けた。";}
    else if(action==="separation"){const a=travelSeparationConsult(s);note=a.status==="granted"?"配偶者と別々の土地で暮らすことについて了承を得た。":"配偶者は別居に反対した。今後の暮らしを改めて考える。";}
    else if(action==="acknowledge-separation"){if(j?.separationAgreement?.status!=="refused")throw Error("定住を再検討する回答がない");j.separationAcknowledged=true;note="反対の返事を受け止めたうえで、この土地で暮らす意思を固めた。";}
    else if(action==="settle"){travelSettle(s);note="確認した住まいで暮らしを始め、旅程を終えた。";}
    else if(action==="exam"){travelEducationAttendance(s);note="到着した学校で入学試験を受けた。結果は後日の知らせを待つ。";}
    else if(action==="continue"){
      const presence=travelPresence(s),route=travelCorridors(s,presence.region).find(x=>x.id===(request?.corridorId||document.getElementById("travel-next")?.value));
      if(!route)throw Error("次の行程が未選択");travelContinue(s,route.toRegion,route.id,{
        companionAgreementId:request?.companionAgreementId||draft.nextCompanionAgreementId,
        guardianAgreementId:request?.guardianAgreementId||draft.nextGuardianAgreementId});note="次の停留地へ向けて出発した。";
    }else throw Error("旅程の操作が不明");
    recordTrace("journey",action,{journeyId:id,note},before);L('<span class="nt">'+esc(note)+'</span>');SV();rd();
    if(box)box.textContent=note;return true;
  }catch(error){if(box)box.textContent=error.message||String(error);return false;}
}
