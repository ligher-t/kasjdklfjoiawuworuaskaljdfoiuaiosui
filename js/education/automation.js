// Explicit school wishes authorize routine procedures, never loans or relocation.
function educationAutoCase(s,item=educationActiveCase(s)){
  return !!item&&educationAutoStage(s,item.stage||s.educationPath?.stage)&&
    (item.stepsUsed>0||item.phase==='continuity'||item.mode==='continuity');
}
function educationAutoMessage(s,text,important=false){
  if(typeof L==='function'&&s===S)L(esc(text),{automationSummary:true});
  if(important)importantLifeNotification(s,'school-interruption');
}
function educationAutoClose(s,item,reason){
  item=s.educationCases?.items?.[item.id]||item;
  educationCaseFinish(s,item,EDUCATION_CASE_TERMINALS.has(reason)?reason:'precommit-stale');
  educationAutoMessage(s,(EDUCATION_CASE_STAGES[item.stage]||'進学')+'：'+educationAutomaticReason(reason),true);
}
function educationAutomaticReason(reason){
  return ({'no-candidate':'通える範囲の募集先を確認できなかった。','no-funds':'借入をせずに必要な費用を用意できなかった。',
    'no-guardian':'保護者の了承と通学条件が整わなかった。','guardian-refused':'保護者の了承が得られなかった。',
    'school-closed':'学校の受入れが停止している。','exam-failed':'入学試験は不合格だった。',
    'institution-refused':'学校から今回は受け入れられないと返事が届いた。',
    'no-reachable-route':'現在の住まいから通学できる経路を確認できなかった。',
    'documents-missing':'応募に必要な書類が確認できなかった。',
    'not-eligible':'この課程への進学資格が整っていなかった。',
    'year-expired':'年度内に必要な手続を終えられず、今回の出願を終えた。','exam-cancelled':'学校から試験中止の知らせが届いた。','precommit-stale':'入学に必要な条件が整わず、今回は手続を終えた。'})[reason]||'入学に必要な条件が整わず、今回は手続を終えた。';
}
function advanceAutomaticEducation(s){
  if(!s||s.dead||s.ev||!Number.isInteger(s.mo)||s.mo<1||s.mo>12||s.educationAutoRunning)return;
  s.educationAutoRunning=true;
  try{
    // Formal advancement, credits and tuition remain owned by the school lifecycle.
    for(let step=0;step<3;step++){
      const decision=s.educationDecision,model=s.educationPath;
      if(model&&educationAutoStage(s,model.stage)&&['funding','resume','graduation','transfer'].includes(decision?.kind)){
        if(decision.kind==='graduation'){
          const e=EV.find(e=>e.id==='education_graduation_review'),repeat=e?.c.find(c=>c.o?.some(o=>o[2]?.educationAction==='repeat'));
          if(repeat&&ok(repeat.en,s,tags(s)))educationApplyAction(s,'repeat');
          else educationApplyAction(s,'withdraw');
          educationAutoMessage(s,model.status==='enrolled'?'修了に必要な履修を補うため、もう一年学ぶことになった。':'在学できる期間に達し、修了せずに学校を離れた。',true);
        }else if(decision.kind==='funding'){
          // This is the existing individual annual relief application, sampled once.
          const id=model.currentEnrollmentId||model.offeringId;
          s.educationAutoAid ||= {};
          const key=id+':'+s.year;
          if(!Object.hasOwn(s.educationAutoAid,key))s.educationAutoAid[key]=
            EDUCATION_INSTITUTIONAL_REGIONS.includes(s.res.n)&&
            educationDraw(s.world.educationWorld,key,'automatic-annual-relief-v1','response').value<0.32;
          if(s.educationAutoAid[key])educationApplyAction(s,'funding-grant');
          if(s.educationDecision?.kind==='funding'){
            educationApplyAction(s,'funding-pause');educationAutoMessage(s,'学費を用意できず、借入をせずに休学することになった。',true);
          }else educationAutoMessage(s,'学校の減免を受け、今年度の学費を納めた。');
        }else if(decision.kind==='resume'){
          const fee=educationFunds(s,model.stage,model.tier,model.offeringId||null);
          if(educationBarrier(s,model.stage,model.tier).allowed&&educationPaymentPlan(s,fee).allowed){
            educationApplyAction(s,'funding-resume');educationAutoMessage(s,'復学の条件と納付を整え、通学を再開した。');
          }else {educationApplyAction(s,'funding-defer');educationAutoMessage(s,'復学の条件が整わず、今年も休学を続ける。',true);}
        }else{
          // No invented transfer: preserve the enrollment while formal transfer is examined.
          const item=educationActiveCase(s)||educationCaseBegin(s,'transfer',model.stage,model.tier,'continuity');
          if(item){educationCaseAction(s,'case:pause');educationAutoMessage(s,'通学先の条件が変わり、学籍を残していったん休むことになった。',true);}
          s.educationDecision=null;
        }
      }
      if(s.educationDecision===decision)break;
    }
    for(let count=0;count<4;count++){
      const item=educationActiveCase(s);if(!educationAutoCase(s,item))break;
      item.automation ||= {policy:'local-no-debt',history:[]};
      const at={year:s.year,month:s.mo},phase=item.phase;
      if(phase==='planning'){
        if(!item.automation.searched){
          educationCaseDiscover(s,'local');educationCaseDiscover(s,'adjacent');item.automation.searched=at;
        }
        const candidates=educationCaseCandidates(s).map((row,index)=>({row,index,check:educationCasePreflight(s,row)}))
          .filter(x=>s.world.educationWorld.areas[x.row.areaId]?.regionKey===s.res.n);
        const own=s.local.educationAreaId;
        const valid=candidates.filter(x=>x.check.allowed).sort((a,b)=>(a.row.areaId===own?0:1)-(b.row.areaId===own?0:1)||
          (a.row.tuitionEstimate+(a.check.fee||0))-(b.row.tuitionEstimate+(b.check.fee||0))||
          ((a.check.route?.outboundMinutes||0)+(a.check.route?.returnMinutes||0))-((b.check.route?.outboundMinutes||0)+(b.check.route?.returnMinutes||0))||a.row.offeringId.localeCompare(b.row.offeringId));
        if(!valid.length){educationAutoClose(s,item,candidates[0]?.check.reasonCodes[0]||'no-candidate');break;}
        item.automation.history.push({action:'select',offeringId:valid[0].row.offeringId,at});
        educationCaseSelect(s,valid[0].index);
      }else if(phase==='application'){
        if(item.examAttendedAt||item.examAt&&s.year*12+s.mo<item.examAt.year*12+item.examAt.month)break;
        const o=s.world.educationWorld.offerings[item.offeringId];
        if(educationServicePayMobility(s,{offering:o,item},'entrance-trip')){
          item.examAttendedAt ||= at;
          item.automation.history.push({action:'exam-attended',at});break;
        }
        educationAutoClose(s,item,'no-reachable-route');break;
      }else if(phase==='contract'){
        let check=educationCaseCommitEligibility(s,'cash'),mode='cash';
        if(!check.allowed&&check.reason==='no-funds'){
          educationCaseFinanceInquiry(s);check=educationCaseCommitEligibility(s,'grant');mode='grant';
        }
        if(check.allowed&&educationCaseCommit(s,mode))educationAutoMessage(s,(EDUCATION_CASE_STAGES[item.stage]||'学校')+'への入学が決まり、必要な費用を納めた。');
        else educationAutoClose(s,item,check.reason?.includes('grant')?'no-funds':check.reason||'precommit-stale');
        break;
      }else if(phase==='continuity'){
        educationCaseAction(s,'case:keep-current');break;
      }else break;
      if(item.status==='resolved'){
        if(item.reason!=='admitted')educationAutoMessage(s,(EDUCATION_CASE_STAGES[item.stage]||'進学')+'：'+educationAutomaticReason(item.reason),true);
        break;
      }
      if(item.phase===phase)break;
    }
  }finally{delete s.educationAutoRunning;}
}
