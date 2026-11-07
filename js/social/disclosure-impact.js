// Social injury is separate from diagnosis, knowledge and another person's beliefs.
const DISCLOSURE_IMPACT_RULES=Object.freeze([
  null,
  {label:'特定の相手・家庭内',p:10,rl:12,pGain:0.90,pLoss:1.05,rlGain:0.60,rlLoss:1.05},
  {label:'職場・学校・所属組織内',p:20,rl:25,pGain:0.85,pLoss:1.10,rlGain:0.45,rlLoss:1.10},
  {label:'近隣・居住地域',p:28,rl:32,pGain:0.80,pLoss:1.15,rlGain:0.35,rlLoss:1.15},
  {label:'本人と結び付いた広範な拡散',p:35,rl:40,pGain:0.75,pLoss:1.20,rlGain:0.25,rlLoss:1.20}
]);
const DISCLOSURE_RECOVERY_RULES=Object.freeze({step:0.15,annualCap:0.30,ongoingCap:0.60});
function disclosureImpactContext(s){
  return {region:s.res?.n||null,placeId:s.local?.placeId||null,areaKey:s.community?.key||null,
    worksiteId:s.workContract?.siteId||null,schoolRef:s.educationPath?.stage?educationInstitutionRef(s):null};
}
function disclosureImpactStore(s){
  return s.disclosureImpact ||= {version:1,peakLevel:0,recovery:0,recoveryYear:s.year,
    recoveryThisYear:0,episodes:[],recoveryEvidence:[]};
}
function disclosureEpisodeHere(s,row){
  if(row.resolved)return false;
  if(row.domain==='work')return !!row.recipientRef&&s.workContract?.status==='active'&&s.workContract.siteId===row.recipientRef;
  if(row.domain==='school')return s.educationPath?.status==='enrolled'&&!!row.recipientRef&&educationInstitutionRef(s)===row.recipientRef;
  if(row.domain==='person'){
    const person=row.kind&&closeInfoPerson(s,row.kind);
    if(!person||person.id!==row.recipientId||person.d)return false;
    if(['father','mother'].includes(row.kind))return inSharedHousehold(s)&&!person.separated;
    if(row.kind==='spouse')return spouseLivesWithProtagonist(s);
    return row.region===s.res?.n&&row.placeId===s.local?.placeId&&(!row.areaKey||row.areaKey===s.community?.key);
  }
  return row.region===s.res?.n&&row.placeId===s.local?.placeId&&(!row.areaKey||row.areaKey===s.community?.key);
}
function disclosureImpactState(s){
  const state=s?.disclosureImpact;
  if(!state?.peakLevel)return {level:0,recovery:0,ongoing:false};
  // Past injury remains after moving; people at the new location do not inherit knowledge.
  const ongoing=state.episodes.some(row=>disclosureEpisodeHere(s,row));
  return {level:state.peakLevel,ongoing,recovery:Math.min(state.recovery,ongoing?DISCLOSURE_RECOVERY_RULES.ongoingCap:1)};
}
function wellbeingDelta(s,key,delta){
  if(!['p','rl'].includes(key)||!Number.isFinite(delta)||!delta)return delta;
  const state=disclosureImpactState(s),rule=DISCLOSURE_IMPACT_RULES[state.level];
  if(!rule)return delta;
  const factor=rule[key+(delta>0?'Gain':'Loss')];
  return delta*(1+(factor-1)*(1-state.recovery));
}
function changeWellbeing(s,key,delta){s[key]=clamp(s[key]+wellbeingDelta(s,key,delta),0,100);}
function disclosureImpactHarm(s,input){
  if(!s.inf||!s.fl?.dg||!Number.isInteger(input.level)||!DISCLOSURE_IMPACT_RULES[input.level])return false;
  const state=disclosureImpactStore(s),context=input.context||disclosureImpactContext(s),
    sourceEventId=input.sourceEventId||TRACE_RESOLUTION?.id||'direct-observed-response',
    key=[sourceEventId,s.year,s.mo||0,input.domain,input.recipientId||input.recipientRef||'',context.region,context.placeId,context.areaKey].join('|');
  if(state.episodes.some(row=>row.key===key))return false;
  const previous=DISCLOSURE_IMPACT_RULES[state.peakLevel],rule=DISCLOSURE_IMPACT_RULES[input.level];
  state.episodes.push({...context,key,year:s.year,month:s.mo||null,level:input.level,domain:input.domain,
    recipientRef:input.recipientRef||null,recipientId:input.recipientId||null,kind:input.kind||null,
    sourceEventId,reason:input.reason,resolved:false});
  state.episodes=state.episodes.slice(-80);
  if(input.level>state.peakLevel){
    // Fixed cumulative shock, never amplified by ongoing multipliers or gain taper.
    s.p=clamp(s.p-Math.max(0,rule.p-(previous?.p||0)),0,100);
    s.rl=clamp(s.rl-Math.max(0,rule.rl-(previous?.rl||0)),0,100);
    state.peakLevel=input.level;
  }
  return true;
}
function recordDisclosureAwarenessHarm(s,row){
  if(row.subject!=='protagonist'||row.subjectMatch!=='confirmed'||row.certainty!=='confirmed'||
    row.consent!=='nonconsensual'||!['reported-leak','official-search','official-notice'].includes(row.source))return;
  const level=row.audience==='public'?4:['residents','community','community-meeting'].includes(row.audience)?3:
    ['employer','workplace','school','organization','local-authority'].includes(row.audience)?2:1;
  const domain=['employer','workplace'].includes(row.audience)?'work':row.audience==='school'?'school':row.audience==='housing-management'?'housing':'place';
  disclosureImpactHarm(s,{...row,level,domain,context:{region:row.region,placeId:row.placeId,areaKey:row.areaKey},
    reason:row.source==='reported-leak'?'本人と結び付いた診断の漏洩・拡散を確認した':'診断を確認した当局から捜索・制限を受けた'});
}
function disclosureImpactRecovery(s,kind,evidenceId,{recipientId=null,domain=null}={}){
  const state=s.disclosureImpact;
  if(!state||!['relationship','support','housing'].includes(kind)||!evidenceId)return false;
  const key=kind+'|'+evidenceId;
  if(state.recoveryEvidence.some(row=>row.key===key))return false;
  if(state.recoveryYear!==s.year){state.recoveryYear=s.year;state.recoveryThisYear=0;}
  const amount=Math.max(0,Math.min(DISCLOSURE_RECOVERY_RULES.step,
    DISCLOSURE_RECOVERY_RULES.annualCap-state.recoveryThisYear,1-state.recovery));
  state.recoveryEvidence.push({key,year:s.year,kind,amount});
  state.recoveryEvidence=state.recoveryEvidence.slice(-80);
  state.recovery=Math.round((state.recovery+amount)*100)/100;
  state.recoveryThisYear=Math.round((state.recoveryThisYear+amount)*100)/100;
  for(const row of state.episodes){
    if(recipientId&&row.domain==='person'&&row.recipientId===recipientId)row.resolved=true;
    if(domain&&row.domain===domain&&row.region===s.res?.n&&row.placeId===s.local?.placeId)row.resolved=true;
  }
  return amount>0;
}
function disclosureAdjustedEffect(s,e){
  if(!s.inf||!s.fl?.dg)return e;
  const close=e.closeKnowledgeAction,actions=Array.isArray(e.socialConflictAction)?e.socialConflictAction:[e.socialConflictAction];
  // Replace old disclosure/rejection losses, without adding them a second time.
  if(close?.recipientResponse==='withdrew'||actions.some(a=>a?.target==='infected'&&
    (a.action==='social-rejection'||a.action==='family-distance'&&close?.action==='disclose')))
    return {...e,p:e.p<0?0:e.p,rl:e.rl<0?0:e.rl};
  // Retain independent loss of housing and separation from the family.
  if(close?.action==='disclose'&&actions.some(a=>a?.target==='infected'&&a.action==='family-rejected'))
    return {...e,p:Math.min(0,(e.p||0)+4),rl:Math.min(0,(e.rl||0)+2)};
  return e;
}
function disclosureImpactFromEffect(s,e,origin){
  const close=e.closeKnowledgeAction,person=close?.kind&&closeInfoPerson(s,close.kind),
    actions=Array.isArray(e.socialConflictAction)?e.socialConflictAction:[e.socialConflictAction];
  if(close?.recipientResponse==='withdrew'||actions.some(a=>a?.target==='infected'&&
    ['family-distance','family-rejected','social-rejection'].includes(a.action))){
    const action=actions.find(a=>a?.target==='infected'&&['family-distance','family-rejected','social-rejection'].includes(a.action)),
      parent=action?.personId&&socialConflictPerson(s,action.personId),
      recipientId=person?.id||parent?.id||null,kind=close?.kind||({father:'father',mother:'mother'}[action?.personId])||null;
    disclosureImpactHarm(s,{level:1,domain:recipientId?'person':'place',recipientId,kind,context:origin,
      reason:action?.action==='social-rejection'?'診断を知った身近な相手から拒絶された':'診断を伝えた相手から距離を置かれた'});
  }
  const review=e.infectionWorkplaceAction;
  if(review?.action==='review'&&['leave-approved-again','hours-approved','assignment-approved'].includes(review.outcome))
    disclosureImpactRecovery(s,'support','work|'+s.infectionWorkplace?.siteId+'|'+s.year+'|'+review.outcome);
  if(actions.some(a=>a?.action==='seek-mutual-aid'&&a.target==='infected'&&['alternative-household','mutual-care'].includes(a.context)))
    disclosureImpactRecovery(s,'relationship',(TRACE_RESOLUTION?.id||'mutual-aid')+'|'+s.year);
}
function auditDisclosureImpact(s){
  const m=s.disclosureImpact;if(m==null)return [];
  if(m.version!==1||!Number.isInteger(m.peakLevel)||m.peakLevel<1||m.peakLevel>4||
    !Number.isFinite(m.recovery)||m.recovery<0||m.recovery>1||
    !Number.isInteger(m.recoveryYear)||m.recoveryYear>s.year||
    !Number.isFinite(m.recoveryThisYear)||m.recoveryThisYear<0||m.recoveryThisYear>0.30||
    !Array.isArray(m.episodes)||!m.episodes.length||m.episodes.length>80||!Array.isArray(m.recoveryEvidence)||m.recoveryEvidence.length>80||
    m.episodes.some(r=>!Number.isInteger(r.level)||r.level<1||r.level>m.peakLevel||typeof r.key!=='string'||!r.key||typeof r.reason!=='string'||!r.reason||
      !['work','school','housing','place','person'].includes(r.domain)||!Number.isInteger(r.year)||r.year>s.year||typeof r.resolved!=='boolean')||
    m.recoveryEvidence.some(r=>!r.key||!Number.isInteger(r.year)||r.year>s.year||!Number.isFinite(r.amount)||r.amount<0||r.amount>0.15))
    return ['露見による社会的影響・回復記録が不正'];
  return [];
}
function disclosureLeakEligible(s,domain){
  if(!s.inf||!s.fl?.dg)return false;
  const local=infectionAwarenessEntries(s).filter(row=>row.subject==='protagonist'&&row.region===s.res?.n&&
    row.placeId===s.local?.placeId&&(!row.areaKey||row.areaKey===s.community?.key));
  if(local.some(row=>row.certainty==='confirmed'&&row.subjectMatch==='confirmed'&&
    (row.audience==='public'||row.source==='reported-leak'&&
      (domain==='work'&&row.audience==='workplace'||domain==='school'&&row.audience==='school'||
        domain==='community'&&['community','residents'].includes(row.audience)))))return false;
  if(domain==='community'&&local.some(row=>row.audience==='public'&&row.certainty==='published'))return false;
  return local.some(row=>{
    if(row.year>=s.year)return false;
    if(domain==='public')return row.audience==='public'&&row.certainty==='published'&&row.source==='self-publication';
    if(row.certainty!=='confirmed'||row.subjectMatch!=='confirmed')return false;
    if(domain==='work')return ['employer','workplace'].includes(row.audience)&&row.recipientRef===s.workContract?.siteId&&s.workContract?.status==='active';
    if(domain==='school')return s.educationPath?.status==='enrolled'&&['school','school-contact'].includes(row.audience)&&row.recipientRef===educationInstitutionRef(s);
    return ['family','household','friend'].includes(row.audience);
  });
}
