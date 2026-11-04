// The journey panel exposes temporary travel without changing a person's home.
const TRAVEL_PURPOSE_LABELS = [
  ["wandering","放浪・見聞"],["family","親族・知人の訪問"],
  ["work","仕事の用事"],["study","学びのための訪問"],["other","私用"]
];
function travelPanelCare(s) {
  const minors=travelResidentMinorChildren(s);
  if(!minors.length)return {ready:true,ref:null,message:"",consult:false};
  const spouse=s.sp;
  if(!spouse || spouse.d || !spouse.id || !spouseLivesWithProtagonist(s))
    return {ready:false,ref:null,consult:false,
      message:"同居する未成年の子どもの見守りを引き受ける大人が確認されていない。"};
  const ids=minors.map(c=>c.id).sort();
  const agreement=Object.values(s.travelState?.familyCareAgreements||{}).find(a=>
    a.year===s.year && a.caregiverId===spouse.id &&
    a.childIds?.length===ids.length && a.childIds.every((id,i)=>id===ids[i]));
  if(!agreement)return {ready:false,ref:null,consult:true,
    message:"留守中の子どもの見守りについて、配偶者と相談する必要がある。"};
  return {ready:agreement.status==="granted",ref:agreement.id,consult:false,
    message:agreement.status==="granted"
      ?"配偶者は留守中の子どもの見守りを引き受けた。住所と学籍は従来のまま残る。"
      :"配偶者は今回の見守りを引き受けなかった。同じ年の再相談はできない。"};
}
function travelPanelReady(s) {
  return !!s && !s.dead && !s.ev && s.age>=18 && !restricted(s) &&
    Number.isInteger(s.mo) && s.mo>=1 && s.mo<=12;
}
function renderTravelControls(s,services) {
  const target=services.document.getElementById("travel-controls");
  if(!target)return;
  const esc=services.esc,fmt=services.m,active=travelCurrentJourney(s);
  if(s.dead){target.textContent="この人生の旅程は終了した。";return;}
  const ready=travelPanelReady(s),disabled=ready?"":" disabled";
  const care=travelPanelCare(s),lines=[];
  if(!active){
    lines.push("<p>短期の単身旅行を計画できる。旅先への到着で住所や学籍は移らない。</p>");
    if(care.message)lines.push('<p class="nt">'+esc(care.message)+'</p>');
    if(care.consult)lines.push('<button type="button" onclick="travelControlAction(\'consult\')"'+disabled+'>子どもの見守りを相談する</button>');
    const routes=moveDestinations(s).filter(r=>(MIGRATION_ROUTES[r.n]||[]).some(x=>x.n===s.res.n));
    if(routes.length){
      lines.push('<label for="travel-destination">行き先</label> <select id="travel-destination">'+routes.map(r=>
        '<option value="'+esc(r.n)+'">'+esc(r.n)+'</option>').join("")+'</select>');
      lines.push('<label for="travel-purpose">目的</label> <select id="travel-purpose">'+TRAVEL_PURPOSE_LABELS.map(([id,label])=>
        '<option value="'+id+'">'+esc(label)+'</option>').join("")+'</select>');
      lines.push('<label for="travel-duration">移動に要する期間</label> <select id="travel-duration"><option value="1">1か月</option><option value="2">2か月</option><option value="3">3か月</option></select>');
      lines.push('<button type="button" onclick="travelControlAction(\'plan\')"'+
        (!ready||!care.ready?' disabled':'')+'>往復の行程を計画する</button>');
    }else lines.push("<p>往復可能な広域経路の登録がない。</p>");
    lines.push('<p class="nt">運賃はゲーム用の広域移動費。出発時に往復分を先払いし、払い戻しは行わない。個々の街道や検問所の実在は示さない。</p>');
  }else{
    const leg=active.legs[active.activeLegIndex],mode=active.status;
    const arrivedHome=mode==="arrived"&&leg.toRegion===active.originRegion;
    const status=mode==="planned"?"出発準備中":arrivedHome?"帰還地点に到着":
      mode==="arrived"?"旅先に到着":mode==="en-route"?"移動中":"旅先で待機中";
    lines.push("<p>"+esc(active.originRegion)+"から"+esc(active.destinationRegion)+
      "への旅程："+status+"。</p>");
    if(mode==="planned"){
      if(care.message)lines.push('<p class="nt">'+esc(care.message)+'</p>');
      if(care.consult)lines.push('<button type="button" onclick="travelControlAction(\'consult\')"'+disabled+'>留守中の見守りを相談する</button>');
      const fare=travelLegFareQuote(s,active.originRegion,active.destinationRegion).amount+
        (active.returnReservation?travelLegFareQuote(s,active.destinationRegion,active.originRegion).amount:0);
      const wallet=inSharedHousehold(s)?s.house:s;
      lines.push('<p>出発時の運賃：'+fmt(fare)+'（'+(inSharedHousehold(s)?"共有家計":"本人会計")+'）</p>');
      lines.push('<button type="button" onclick="travelControlAction(\'depart\')"'+
        (!ready||!care.ready||!wallet||wallet.cash<fare?' disabled':'')+'>出発する</button>');
      lines.push('<button type="button" onclick="travelControlAction(\'cancel\')"'+disabled+'>行程を取りやめる</button>');
    }else if(arrivedHome){
      lines.push('<button type="button" onclick="travelControlAction(\'finish\')"'+disabled+'>帰還を完了する</button>');
    }else if(mode==="arrived"){
      const fare=travelLegFareQuote(s,active.destinationRegion,active.originRegion).amount;
      const wallet=inSharedHousehold(s)?s.house:s;
      lines.push('<button type="button" onclick="travelControlAction(\'return\')"'+
        (!ready||!active.returnReservation&&(!wallet||wallet.cash<fare)?' disabled':'')+'>帰路に就く</button>');
    }else lines.push('<p class="nt">暦月が進むと移動が進行する。到着後に帰路を選べる。</p>');
    lines.push('<p class="nt">一時的な旅行の間も、以前の住居と家族の居住地は維持される。</p>');
  }
  if(!ready)lines.push('<p class="nt">操作には成人・年月の確定・未解決の選択がない状態が必要となる。</p>');
  target.innerHTML=lines.join("\n");
}
function travelControlAction(action,request) {
  const s=S,messageBox=document.getElementById("travel-message");
  if(!travelPanelReady(s)){
    if(messageBox)messageBox.textContent="現在の状態では旅程を操作できない。";
    return false;
  }
  try{
    const before=traceState(s);
    let note="",id=null;
    const journey=travelCurrentJourney(s);
    if(action==="consult"){
      const response=travelFamilyCareAgreement(s);
      note=response.status==="granted"
        ?"同居の配偶者と留守中の見守りについて話し合い、了承を得た。"
        :"同居の配偶者と留守中の見守りについて話し合ったが、了承は得られなかった。";
      if(journey?.status==="planned"&&response.status==="granted")
        travelRefreshFamilyCare(s,response.id);
      id=response.id;
    }else if(action==="plan"){
      if(journey)throw Error("既に進行中の旅程がある");
      const values=request||{
        destinationRegion:document.getElementById("travel-destination")?.value,
        purpose:document.getElementById("travel-purpose")?.value,
        durationMonths:Number(document.getElementById("travel-duration")?.value)
      };
      const care=travelPanelCare(s);
      if(!care.ready)throw Error(care.message);
      const plan=travelStart(s,{...values,prepayReturn:true,familyCareAgreementId:care.ref});
      note=plan.destinationRegion+"への往復を計画した。";id=plan.id;
    }else if(action==="depart"){
      const trip=travelDepart(s);
      note=trip.originRegion+"を離れ、"+trip.destinationRegion+"へ向けて出発した。往復の運賃を支払った。";id=trip.id;
    }else if(action==="cancel"){
      const trip=travelEnd(s,"abandoned");
      if(!trip)throw Error("取りやめられる旅程がない");
      note="出発前の行程を取りやめた。";id=trip.id;
    }else if(action==="return"){
      const trip=travelBeginReturn(s);
      note=trip.destinationRegion+"から帰路に就いた。";id=trip.id;
    }else if(action==="finish"){
      const trip=travelEnd(s,"returned-home");
      if(!trip)throw Error("帰還完了に必要な到着記録がない");
      note="元の暮らしの場所へ戻り、旅程を終えた。";id=trip.id;
    }else throw Error("旅程の操作が不明");
    recordTrace("journey",action,{journeyId:id,note},before);
    L('<span class="nt">'+esc(note)+'</span>');
    SV();
    rd();
    const updated=document.getElementById("travel-message");
    if(updated)updated.textContent=note;
    return true;
  }catch(error){
    if(messageBox)messageBox.textContent=error.message||String(error);
    return false;
  }
}
