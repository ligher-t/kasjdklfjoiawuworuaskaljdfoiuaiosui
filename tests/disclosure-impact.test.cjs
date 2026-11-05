'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
const {ctx}=require('./support/annual-cases.cjs').context(path.resolve(__dirname,'..'));
const run=body=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+body+'})())',ctx,{timeout:15000}));
function fresh(){run(`born({seed:882211,by:1077,region:'クルビア'});S.age=20;S.year=S.by+S.age;S.mo=3;
 S.inf=1;S.fl.dg=1;S.ob=20;S.infection={year:S.year,diagnosedYear:S.year,cause:'fixture',basis:'event-unclassified'};
 S.p=80;S.rl=80;S.par.fa.d=0;S.par.fa.lifeStatus='alive';S.par.fa.knownLifeStatus='alive';
 S.par.fa.region=S.res.n;S.par.fa.knownRegion=S.res.n;S.par.fa.separated=false;S.cash=10000000;
 TRACE_RESOLUTION={kind:'choice',id:'impact-probe',label:'確認'};return true;`);}
vm.runInContext(`function hireWorkplaceForDisclosure(s, jobId) {
  const area=occupationAreaSnapshot(s), work=s.world.occupationWorld,
    siteId='disclosure-worksite-'+jobId, employerId='disclosure-employer-'+jobId,
    positionId=siteId+':position', openingId=siteId+':opening';
  work.employers[employerId]={employerId,organizationKey:null};
  work.sites[siteId]={siteId,employerId,areaId:area.areaId,status:'open',positionIds:[positionId]};
  work.positions[positionId]={positionId,siteId,jobId,capacity:1,aggregateOccupiedSlots:0,
    identifiedOccupiedSlots:0,vacancyCount:1,openingIds:[openingId]};
  const opening=work.openings[openingId]={openingId,siteId,employerId,positionId,status:'open',slots:1};
  commitEmploymentOpening(s,{opening,request:{jobId,positionId,siteId}}, {transition:true});
}`,ctx);
const near=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} != ${b}`);
// Four real audience records: strongest scope only, cumulative fixed shock once.
fresh();
const levels=run(`const rows=[];
 for(const [audience,ref] of [['housing-management','manager'],['school','school-1'],['community','area'],['public','market']]){
  recordInfectionAwareness(S,{subject:'protagonist',audience,recipientRef:ref,certainty:'confirmed',subjectMatch:'confirmed',
   source:'reported-leak',consent:'nonconsensual'});
  rows.push({p:S.p,rl:S.rl,level:S.disclosureImpact.peakLevel,pGain:wellbeingDelta(S,'p',10),pLoss:wellbeingDelta(S,'p',-10),
   rlGain:wellbeingDelta(S,'rl',10),rlLoss:wellbeingDelta(S,'rl',-10)});
 }
 const before=JSON.stringify(S.disclosureImpact),p=S.p,rl=S.rl;
 recordInfectionAwareness(S,{subject:'protagonist',audience:'public',recipientRef:'market',certainty:'confirmed',subjectMatch:'confirmed',source:'reported-leak',consent:'nonconsensual'});
 return {rows,duplicate:before===JSON.stringify(S.disclosureImpact)&&p===S.p&&rl===S.rl,issues:auditDisclosureImpact(S)};`);
assert.deepEqual(levels.rows.map(x=>[x.p,x.rl,x.level]),[[70,68,1],[60,55,2],[52,48,3],[45,40,4]]);
for(const [i,row] of levels.rows.entries()){
 near(row.pGain,[9,8.5,8,7.5][i]);near(row.pLoss,[-10.5,-11,-11.5,-12][i]);
 near(row.rlGain,[6,4.5,3.5,2.5][i]);near(row.rlLoss,[-10.5,-11,-11.5,-12][i]);
}
assert(levels.duplicate);assert.deepEqual(levels.issues,[]);
fresh();
assert.deepEqual(run(`S.p=5;S.rl=3;disclosureImpactHarm(S,{level:1,domain:'place',reason:'確認した拒絶'});
 const bottom=[S.p,S.rl];applyStatEffects({p:10,rl:10},S);const gain=[S.p,S.rl];
 S.disclosureImpact.recovery=2;return {bottom,gain,invalid:auditDisclosureImpact(S).length===1};`),
 {bottom:[0,0],gain:[9,6],invalid:true});
fresh();
assert.deepEqual(run(`for(const [audience,certainty,source,match] of [
 ['medical-service','confirmed','medical-consultation','confirmed'],['family','confirmed','self-disclosure','confirmed'],
 ['residents','unverified','unattributed-rumor','unclear'],['public','published','self-publication','unclear']])
 recordInfectionAwareness(S,{subject:'protagonist',audience,certainty,source,subjectMatch:match,consent:source==='unattributed-rumor'?'nonconsensual':'voluntary'});
 recordInfectionAwareness(S,{subject:'relative',subjectId:S.par.fa.id,audience:'community',certainty:'confirmed',subjectMatch:'confirmed',source:'reported-leak',consent:'nonconsensual'});
 return {impact:!!S.disclosureImpact,p:S.p,rl:S.rl,publicConfirmed:infectionAwarenessHas(S,'public')};`),
 {impact:false,p:80,rl:80,publicConfirmed:false});
// A real observed rejection replaces its old stat shock; it does not penalize a promise or diagnosis question.
fresh();
assert.deepEqual(run(`const e=EV.find(e=>e.id==='hid_exposed');ap(e.c[0].o.find(o=>o[2].closeKnowledgeAction?.recipientResponse==='withdrew')[2]);
 return {p:S.p,rl:S.rl,level:S.disclosureImpact.peakLevel,known:!!S.closeKnowledge.links[S.par.fa.id].knownFacts.playerDiagnosis,
 reason:S.disclosureImpact.episodes.at(-1).reason};`),
 {p:70,rl:68,level:1,known:true,reason:'診断を伝えた相手から距離を置かれた'});
fresh();
assert.equal(run(`ap({closeKnowledgeAction:{kind:'father',action:'disclose',recipientResponse:'questioned-diagnosis'},p:-4,rl:-2});return !!S.disclosureImpact;`),false);
// Actual fulfilled help, not the privacy statement or appointment promise, gives recovery.
fresh();
assert.deepEqual(run(`ap({closeKnowledgeAction:{kind:'father',action:'disclose',recipientResponse:'withdrew'}});
 ap({closeKnowledgeAction:{kind:'father',action:'privacy-accepted'}});
 ap({closeKnowledgeAction:{kind:'father',action:'help-accepted',commitmentKind:'next-appointment'}});
 const promised=S.disclosureImpact.recovery;S.year++;S.age++;
 ap({closeKnowledgeAction:{kind:'father',action:'help-execution',outcome:'fulfilled'}});
 return {promised,fulfilled:S.disclosureImpact.recovery,personResolved:S.disclosureImpact.episodes[0].resolved,
 stillKnown:!!S.closeKnowledge.links[S.par.fa.id].knownFacts.playerDiagnosis};`),
 {promised:0,fulfilled:0.15,personResolved:true,stillKnown:true});
// New confirmed public spread follows publication, without treating publication as confirmed reception.
fresh();
assert.deepEqual(run(`const publication=EV.find(e=>e.id==='infection_diagnosis_disclosure_scope');ap(publication.c[1].o[0][2]);
 const before=!!S.disclosureImpact;S.year++;S.age++;
 const e=EV.find(e=>e.id==='infection_publication_confirmed_spread'),eligible=elig(e,S,tags(S));ap(e.fx);
 return {before,eligible,level:S.disclosureImpact.peakLevel,ref:infectionAwarenessEntries(S).at(-1).recipientRef};`),
 {before:false,eligible:true,level:4,ref:'current-market-notices'});
// Support is evidence-driven, capped yearly, and does not silently notify a new community.
fresh();
assert.deepEqual(run(`hireWorkplaceForDisclosure(S,7);const original=S.workContract.siteId;
 applyInfectionWorkplaceAction(S,{action:'disclose',response:'leave-approved-once'},{});
 const initial=!!S.disclosureImpact;S.year++;S.age++;
 const e=EV.find(e=>e.id==='infection_workplace_confirmed_leak'),eligible=elig(e,S,tags(S));ap(e.fx);
 const known=infectionAwarenessEntries(S).at(-1).recipientRef===original;
 hireWorkplaceForDisclosure(S,8);return {initial,eligible,known,level:S.disclosureImpact.peakLevel,
 repeated:disclosureLeakEligible(S,'work'),here:disclosureImpactState(S).ongoing,
 inherited:infectionAwarenessEntries(S).some(r=>r.recipientRef===S.workContract.siteId)};`),
 {initial:false,eligible:true,known:true,level:2,repeated:false,here:false,inherited:false});
fresh();
assert.deepEqual(run(`const area=ensureEducationWorldForResidence(S),w=S.world.educationWorld,
 inst=educationRegisterInstitution(w,area,'impact-school','fixture',['university'],S.year),o=w.offerings[inst.offeringIds[0]];
 educationStart(S,'university',1,'verified-enrollment');Object.assign(S.educationPath,{institutionId:inst.id,campusId:o.campusId,offeringId:o.id});
 educationBindFormalEnrollment(S,S.educationRecord.enrollments.at(-1).id);
 recordInfectionAwarenessAction(S,{subject:'self',audience:'school',certainty:'confirmed',source:'self-disclosure',consent:'voluntary',recipientRef:'current-school'});
 const initial=!!S.disclosureImpact;S.year++;S.age++;
 const e=EV.find(e=>e.id==='infection_school_confirmed_leak'),eligible=elig(e,S,tags(S));ap(e.fx);
 const same=infectionAwarenessEntries(S).at(-1).recipientRef===inst.id;
 S.educationPath.institutionId='other-school';return {initial,eligible,same,level:S.disclosureImpact.peakLevel,
 here:disclosureImpactState(S).ongoing,inherited:infectionAwarenessEntries(S).some(r=>r.recipientRef==='other-school')};`),
 {initial:false,eligible:true,same:true,level:2,here:false,inherited:false});
fresh();
assert.deepEqual(run(`const origin=disclosureImpactContext(S);
 ap({home:'移動都市',localKind:'移動都市の周縁区',infectionAwarenessAction:{subject:'self',audience:'local-authority',
 certainty:'confirmed',source:'official-notice',consent:'nonconsensual',recipientRef:'old-office'}});
 const row=infectionAwarenessEntries(S).at(-1);return {moved:origin.placeId!==S.local.placeId,
 origin:row.region===origin.region&&row.placeId===origin.placeId&&row.areaKey===origin.areaKey,
 here:disclosureImpactState(S).ongoing,known:infectionAwarenessHas(S,'local-authority',{currentPlace:true})};`),
 {moved:true,origin:true,here:false,known:false});
fresh();
assert.deepEqual(run(`recordInfectionAwareness(S,{subject:'protagonist',audience:'community',certainty:'confirmed',subjectMatch:'confirmed',source:'reported-leak',consent:'nonconsensual'});
 for(let year=0;year<4;year++){
  for(let i=0;i<3;i++)disclosureImpactRecovery(S,'support','support-'+year+'-'+i);
  if(year<3){S.year++;S.age++;}
 }
 const same=disclosureImpactState(S),recovery=S.disclosureImpact.recovery,prior=wellbeingDelta(S,'rl',10),rng=RANDOM_STATE;
 S.year++;S.age++;const withoutTime=S.disclosureImpact.recovery===recovery;
 S.local={...S.local,placeId:'new-home'};S.community={...S.community,key:'new-area'};
 const moved=disclosureImpactState(S);
 return {stored:recovery,active:same.recovery,ongoing:same.ongoing,prior,withoutTime,
 moved:moved.recovery,movedOngoing:moved.ongoing,known:infectionAwarenessHas(S,'community',{currentPlace:true}),
 delta:wellbeingDelta(S,'rl',10),pure:rng===RANDOM_STATE,issues:auditDisclosureImpact(S)};`),
 {stored:1,active:0.6,ongoing:true,prior:7.4,withoutTime:true,moved:1,movedOngoing:false,known:false,delta:10,pure:true,issues:[]});
// Housing safety is a real local followup and cannot close a different area's episode.
fresh();
assert.deepEqual(run(`S.residenceArrangement='independent_rental';
 recordInfectionAwareness(S,{subject:'protagonist',audience:'housing-management',certainty:'confirmed',subjectMatch:'confirmed',source:'reported-leak',consent:'nonconsensual'});
 registerSocialHarm(S,{domain:'housing',eventId:'housing-probe'});S.year++;S.age++;
 const e=EV.find(e=>e.id==='infection_social_housing_secured'),eligible=elig(e,S,tags(S));ap(e.fx);
 return {eligible,status:S.socialAftermath.episodes[0].status,recovery:S.disclosureImpact.recovery,
 resolved:S.disclosureImpact.episodes[0].resolved};`),{eligible:true,status:'ended',recovery:0.15,resolved:true});
// Event gains retain their taper, negative relationship losses do not inherit gain taper.
fresh();
assert.deepEqual(run(`S.rl=95;applyStatEffects({rl:-10},S);return S.rl;`),85);
fresh();
const taper=run(`disclosureImpactHarm(S,{level:4,domain:'place',reason:'確認した露見'});S.rl=80;S.p=50;
 const expected=10*Math.max(0.08,1-Math.pow(80/111,1.6))*0.25;
 applyStatEffects({p:10,rl:10},S);return {p:S.p,rl:S.rl,expected};`);
near(taper.p,57.5);near(taper.rl,80+taper.expected);
// The annual phase adjusts signed contributions separately: +5 reversion and -5 trait do not cancel before scaling.
fresh();
near(run(`disclosureImpactHarm(S,{level:4,domain:'place',reason:'確認した露見'});S.p=50;S.rl=60;S.h=100;S.care.support=0.5;S.care.stability=0.5;
 const values={'mood.equilibrium':100,'mood.reversion':0.1,'traits.moodScale':1,'mood.infectionThreshold':100,'mood.isolationThreshold':0,'life.workStartAge':100};
 const services={...ANNUAL_SERVICES,P:key=>values[key]??0,R:()=>0.5,advanceIllnessState(){},advanceSocialLearning(){},annualEducationAndRelationships(){},hobbyCount:()=>0};
 advanceAnnualWellbeing(S,services,20,{p:-5},0,1);return S.p;`),47.75);
fresh();
const loss=run(`S.rl=95;S.age=30;S.job=0;S.fl.sch=0;const old=DEBUG_RANDOM;DEBUG_RANDOM=()=>0;
 try{annualEducationAndRelationships(S,0,{rl:0});}finally{DEBUG_RANDOM=old;}
 return S.rl;`);
assert(loss<94.5,'annual relationship loss must not be reduced by high-value gain taper');
// The same-version save preserves actual injury, recovery evidence and multipliers.
fresh();
assert.deepEqual(run(`recordInfectionAwareness(S,{subject:'protagonist',audience:'community',certainty:'confirmed',subjectMatch:'confirmed',source:'reported-leak',consent:'nonconsensual'});
 disclosureImpactRecovery(S,'support','verified-support');const before=JSON.stringify(S.disclosureImpact),save=makeResumeSnapshot();
 HL=0;play=()=>{};rd=()=>{};tab=()=>{};restorePendingChoice=()=>false;
 return {loaded:cont(save),same:JSON.stringify(S.disclosureImpact)===before,issues:auditDisclosureImpact(S)};`),{loaded:true,same:true,issues:[]});
console.log('PASS disclosure scope shocks, signed stat/annual changes, actual recovery, locality and save boundaries');
