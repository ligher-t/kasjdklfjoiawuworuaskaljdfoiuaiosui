const assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
const {ctx,storage,nodes}=require('./support/annual-cases.cjs').context(path.resolve(__dirname,'..'));
const run=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx,{timeout:20000}));
function fresh(stage='primary',age=8){ctx.STAGE=stage;ctx.AGE=age;return run(`born({seed:882001,by:1077,region:'クルビア'});
 S.year=1095;S.age=AGE;S.by=S.year-AGE;S.mo=1;S.cash=10000000;S.house.cash=10000000;
 S.playSettings={...PLAY_SETTINGS_DEFAULTS};S.educationPath=null;S.educationDecision=null;S.study=null;S.fl.sch=0;
 S.k=95;S.ar=95;S.socialLearning.literacy=95;S.educationCases=null;S.educationAccess=null;
 const area=ensureEducationWorldForResidence(S),w=S.world.educationWorld;
 const inst=educationRegisterInstitution(w,area,'advanced-school','fixture',[STAGE],S.year),o=w.offerings[inst.offeringIds[0]];
 o.admissionTier=1;globalThis.F={w,inst,o,area};return true;`);}
assert.deepEqual(run('return normalizePlaySettings({});'),{version:1,compulsoryEducation:true,higherEducation:false,eventFrequency:2,choiceRatio:2});
fresh();
assert.deepEqual(run(`const rng=RANDOM_STATE;setPlaySetting('eventFrequency',0);setPlaySetting('higherEducation',true);
 const stored=JSON.parse(localStorage.getItem(PLAY_SETTINGS_KEY));
 return {life:S.playSettings.eventFrequency,stored:stored.eventFrequency,higher:S.playSettings.higherEducation,
 pure:rng===RANDOM_STATE,invalid:setPlaySetting('choiceRatio',8),issues:auditPlaySettings(S)};`),
 {life:0,stored:0,higher:true,pure:true,invalid:false,issues:[]});
fresh();
assert.deepEqual(run(`S.playSettings.eventFrequency=0;S.playSettings.choiceRatio=4;sched();
 const current=S.eventSchedule.choiceRatio,rng=RANDOM_STATE;setPlaySetting('choiceRatio',0);
 const same=playChoiceChance(S);S.year++;sched();return {current,same,next:S.eventSchedule.choiceRatio,issues:auditPlaySettings(S)};`),
 {current:4,same:0.64,next:0,issues:[]});
for(let level=0;level<5;level++){
 ctx.LEVEL=level;fresh();
 const row=run(`S.age=32;S.playSettings.eventFrequency=LEVEL;S.playSettings.choiceRatio=LEVEL;
 const old=DEBUG_RANDOM;DEBUG_RANDOM=()=>0.99;try{sched();}finally{DEBUG_RANDOM=old;}
 return {normal:S.q.length-S.eventSchedule.servicePositions.length,all:S.q.length,chance:playChoiceChance(S),issues:auditPlaySettings(S)};`);
 assert.equal(row.all,12);assert.equal(row.normal,[2,4,6,9,12][level]);assert.equal(row.chance,[0.04,0.08,0.16,0.32,0.64][level]);assert.deepEqual(row.issues,[]);
}
// With no normal draw this month, a priority choice still gets its monthly opportunity.
fresh();
assert.deepEqual(run(`S.playSettings.eventFrequency=0;const oldR=DEBUG_RANDOM;DEBUG_RANDOM=()=>0.01;sched();DEBUG_RANDOM=oldR;
 const original=EV.slice(),oldFire=fire,seen=[];
 try{EV.splice(0,EV.length,{id:'advanced-priority-probe',st:['児童'],pri:true,show:s=>s.mo===2,
 c:[{l:'確認',o:[[1,'確認した',{}]]}]});fire=e=>seen.push(e.id);
 slot(S.eventSchedule.servicePositions.find(x=>Math.floor(x*12)+1===1));
 slot(S.eventSchedule.servicePositions.find(x=>Math.floor(x*12)+1===2));return seen;
 }finally{fire=oldFire;EV.splice(0,EV.length,...original);}`),['advanced-priority-probe']);

// Native admission, guardian, finance and formal school records, without extra choice sheets.
fresh();
assert.deepEqual(run(`educationCaseAction(S,'case:begin:primary:primary:1');const item=educationActiveCase(S);
 const before=S.educationRecord.enrollments.length;advanceAutomaticEducation(S);
 const cash=S.cash,house=S.house.cash;advanceAutomaticEducation(S);
 return {reason:item.reason,records:S.educationRecord.enrollments.length-before,
 repeated:cash===S.cash&&house===S.house.cash,decision:S.educationDecision,
 noChoice:!S.ev,issues:auditPlaySettings(S)};`),
 {reason:'admitted',records:1,repeated:true,decision:null,noChoice:true,issues:[]});
fresh();
assert.deepEqual(run(`S.playSettings.compulsoryEducation=false;educationCaseAction(S,'case:begin:primary:primary:1');
 advanceAutomaticEducation(S);return {phase:educationActiveCase(S).phase,review:educationCaseNeedsReview(S),records:S.educationRecord.enrollments.length};`),
 {phase:'planning',review:true,records:0});
fresh();
assert.deepEqual(run(`educationCaseAction(S,'case:decline:primary');advanceAutomaticEducation(S);
 return {reason:S.educationCases.history.at(-1).reason,records:S.educationRecord.enrollments.length};`),{reason:'declined',records:0});
fresh('university',22);
assert.deepEqual(run(`S.educationPath={version:1,status:'outside',completed:[],history:[],equivalency:['upper']};
 educationCaseAction(S,'case:begin:higher-path:university:1');advanceAutomaticEducation(S);
 const manual=educationActiveCase(S).phase;S.playSettings.higherEducation=true;advanceAutomaticEducation(S);
 const item=S.educationCases.items[S.educationCases.history.at(-1)?.id||S.educationCases.activeCaseId];
 return {manual,acted:!!item.automation,noChoice:!S.ev,noLoans:(S.loanContracts||[]).length===0};`),
 {manual:'planning',acted:true,noChoice:true,noLoans:true});
// A nearby campus still requires the dated exam visit and a later actual answer.
fresh('university',22);
assert.deepEqual(run(`const original=S.local.educationAreaId,proxy={...S,local:{kind:'固定都市の街区',
 city:null,placeId:'exam-district',educationAreaAnchor:'exam-district',districtId:'exam-district'}},
 far=ensureEducationWorldForResidence(proxy);
 F.w.campuses[F.o.campusId].educationAreaId=far;
 F.w.transportLinks.exam={id:'exam',endpointAreaIds:[original,far],travelMinutesAB:20,travelMinutesBA:20,
 riskScore:0.05,directionalAccess:{[original]:true,[far]:true},statusHistory:[]};
 S.educationPath={version:1,status:'outside',completed:[],history:[],equivalency:['upper']};
 educationCaseAction(S,'case:begin:higher-path:university:1');const item=educationActiveCase(S);
 item.evidence.knownCandidateIds=[F.o.id];educationCaseSelect(S,0);S.playSettings.higherEducation=true;
 advanceAutomaticEducation(S);const early=!item.examAttendedAt&&item.phase==='application';
 S.mo=2;educationServiceTick(S);advanceAutomaticEducation(S);const visited=item.examAttendedAt?.month===2;
 const paid=S.cash;advanceAutomaticEducation(S);const once=paid===S.cash;
 const waiting=item.phase==='application'&&!S.educationRecord.enrollments.length&&!educationP17ExtraEligible(S,'E25');
 S.mo=3;educationServiceTick(S);advanceAutomaticEducation(S);
 return {early,visited,once,waiting,finished:item.status==='resolved',reason:item.reason,noChoice:!S.ev};`),
 {early:true,visited:true,once:true,waiting:true,finished:true,reason:'admitted',noChoice:true});

// Fees cannot silently become borrowing or a relocation when money is exhausted.
fresh();
assert.deepEqual(run(`S.cash=0;S.house.cash=0;const home=S.res.n,moves=S.moves.length;
 educationCaseAction(S,'case:begin:primary:primary:1');advanceAutomaticEducation(S);
 const item=Object.values(S.educationCases.items)[0];return {finished:item.status,noLoan:(S.loanContracts||[]).length===0,
 noMove:home===S.res.n&&moves===S.moves.length,nonnegative:S.cash>=0&&S.house.cash>=0,noChoice:!S.ev};`),
 {finished:'resolved',noLoan:true,noMove:true,nonnegative:true,noChoice:true});

fresh();
assert.deepEqual(run(`S.care.parentKeys=[];educationCreateMobilityState(S);S.educationMobility.guardianAuthorities=[];
 educationCaseAction(S,'case:begin:primary:primary:1');advanceAutomaticEducation(S);
 const item=Object.values(S.educationCases.items)[0];return {finished:item.status,reason:item.reason,records:S.educationRecord.enrollments.length};`),
 {finished:'resolved',reason:'no-guardian',records:0});
fresh();
assert.deepEqual(run(`educationCaseAction(S,'case:begin:primary:primary:1');advanceAutomaticEducation(S);
 const m=S.educationPath,original=m.duration;m.yearsCompleted=0;S.educationDecision={kind:'graduation',year:S.year};
 advanceAutomaticEducation(S);const repeated=m.duration===original+1;
 m.duration=EDUCATION_PROGRAMS.primary.years+2;S.educationDecision={kind:'graduation',year:S.year};
 advanceAutomaticEducation(S);return {repeated,status:m.status,noChoice:!S.ev};`),
 {repeated:true,status:'withdrawn',noChoice:true});
fresh();
assert.deepEqual(run(`educationCaseAction(S,'case:begin:primary:primary:1');advanceAutomaticEducation(S);
 S.year++;S.age++;S.cash=0;S.house.cash=0;S.educationPath.fundedYear=null;
 S.educationDecision={kind:'graduation',year:S.year};advanceAutomaticEducation(S);
 return {handled:!S.educationDecision,noLoan:(S.loanContracts||[]).length===0,noChoice:!S.ev,
 settledOrPaused:S.educationPath.fundedYear===S.year||S.educationPath.status==='paused'};`),
 {handled:true,noLoan:true,noChoice:true,settledOrPaused:true});
// Setting changes preserve an already displayed choice and RNG; reset is scoped.
fresh();
assert.deepEqual(run(`const rng=RANDOM_STATE;S.ev={id:'sch'};UI_PREFERENCES.theme='dark';UI_PREFERENCES.pauseImportant=true;
 setPlaySetting('compulsoryEducation',false);const pending=S.ev.id;resetAdvancedSettings();
 return {pending,theme:UI_PREFERENCES.theme,important:UI_PREFERENCES.pauseImportant,
 settings:S.playSettings,pure:RANDOM_STATE===rng};`),
 {pending:'sch',theme:'dark',important:false,settings:{version:1,compulsoryEducation:true,higherEducation:false,eventFrequency:2,choiceRatio:2},pure:true});
fresh();
assert.deepEqual(run(`HL=0;UI_PREFERENCES.pauseImportant=false;play(3);importantLifeNotification(S,'parent-death');const unaffected=sp;
 UI_PREFERENCES.pauseImportant=true;importantLifeNotification(S,'diagnosis');const stopped=sp,kind=S.importantNotificationPause.kind;
 play(2);const cleared=!S.importantNotificationPause;HL=1;UI_PREFERENCES.pauseImportant=false;
 return {unaffected,stopped,kind,cleared};`),{unaffected:3,stopped:0,kind:'diagnosis',cleared:true});
fresh();
assert.deepEqual(run(`S.playSettings.choiceRatio=4;S.playSettings.higherEducation=true;sched();
 const settings=JSON.stringify(S.playSettings),schedule=JSON.stringify(S.eventSchedule),saved=makeResumeSnapshot();
 HL=0;play=()=>{};rd=()=>{};tab=()=>{};restorePendingChoice=()=>false;
 const loaded=cont(saved);return {loaded,settings:settings===JSON.stringify(S.playSettings),schedule:schedule===JSON.stringify(S.eventSchedule)};`),
 {loaded:true,settings:true,schedule:true});

fresh('university',22);
assert.deepEqual(run(`S.playSettings.eventFrequency=0;S.playSettings.choiceRatio=0;
 S.educationPath={version:1,status:'completed',stage:'upper',completed:['primary','lower','upper'],
   history:[],equivalency:[],yearsCompleted:3,duration:3};S.educationDecision=null;S.study=null;S.fl.sch=0;
 const original=EV.slice(),oldFire=fire,seen=[];
 try{
   const higher=original.find(e=>e.id==='higher_ed');EV.splice(0,EV.length,higher);
   const oldRandom=DEBUG_RANDOM;DEBUG_RANDOM=()=>0.99;try{sched();}finally{DEBUG_RANDOM=oldRandom;}
   fire=e=>seen.push(e.id);
   const slots=S.eventSchedule.servicePositions.slice(0,2);
   slot(slots[0]);const optional=seen.slice();seen.length=0;
   S.educationDecision={kind:'higher-path',year:S.year};slot(slots[1]);
   return {optional,required:seen.slice()};
 }finally{fire=oldFire;EV.splice(0,EV.length,...original);}`),
 {optional:[],required:['higher_ed']});

fresh();
assert.deepEqual(run(`activeFacility(S,'clinic');
 const originalFacility=S.siteAffiliations.clinic.facilityId;
 const view=parentHouseholdView(S,{
   res:REG.find(r=>r.n==='カズデル'),home:'固定集落',
   local:{...S.local,kind:'小規模な定住地',placeId:'parent-projection-test',
     districtId:'parent-projection-test',identitySignature:'parent-projection-test'},priceIndex:1
 },S.par.fa);
 view.siteAffiliations.clinic={facilityId:'projection-only'};
 view.siteAffiliationHistory.push({probe:true});
 view.world.localityArchive.projectionOnly={};
 return {
   protagonistFacility:S.siteAffiliations.clinic.facilityId===originalFacility,
   protagonistHistory:!S.siteAffiliationHistory.some(x=>x.probe),
   protagonistArchive:!S.world.localityArchive.projectionOnly,
   detachedWorld:view.world!==S.world,detachedCommunity:view.community!==S.community
 };`),
 {protagonistFacility:true,protagonistHistory:true,protagonistArchive:true,
  detachedWorld:true,detachedCommunity:true});

fresh('university',22);
const completedSchoolLabel=run(`S.educationPath={version:1,status:'completed',stage:'upper',
 completed:['primary','lower','upper'],history:[],equivalency:[],yearsCompleted:3,duration:3};
 return educationStandingLabel(S);`);
assert.match(completedSchoolLabel,/後期中等課程修了/);

fresh();
assert.deepEqual(run(`const insurance=EV.find(e=>e.id==='asset_choice_catastrophe_insurance');
 const oldRegion=S.res;S.res=REG.find(r=>r.n==='イベリア');const outside=insurance.show(S);
 S.res=REG.find(r=>r.n==='クルビア');const inside=insurance.show(S);
 return {outside,inside,catastropheClaim:EV.some(e=>e.id==='asset_catastrophe_insurance_claim')};`),
 {outside:false,inside:true,catastropheClaim:false});

fresh();
assert.deepEqual(run(`S.local={...S.local,educationAreaId:'empty-area'};
 S.educationAccess={version:1,knownOfferings:{},searches:[{
   caseId:'old-search',stage:'primary',scope:'local',areaIds:['empty-area'],
   checkedAt:{year:S.year-1,month:1},foundIds:[],basis:'locality-inquiry'
 }],applications:{},notices:{}};
 const event=EV.find(e=>e.id==='education_return_path');
 const sameArea={allowed:educationReturnPathSearchAllowed(S,'primary'),
   eventShown:event.show(S)};
 S.local={...S.local,educationAreaId:'moved-area'};
 const afterMove={allowed:educationReturnPathSearchAllowed(S,'primary'),
   eventShown:event.show(S)};
 return {sameArea,afterMove};`),
 {sameArea:{allowed:false,eventShown:false},afterMove:{allowed:true,eventShown:true}});

fresh();
assert.deepEqual(run(`S.age=32;S.job=0;S.playSettings.eventFrequency=0;S.playSettings.choiceRatio=0;
 S.educationPath={version:1,status:'completed',stage:'upper',completed:['primary','lower','upper'],history:[],equivalency:[]};
 S.educationDecision=null;S.study=null;const original=EV.slice(),oldFire=fire,seen=[];
 try{
   const work=original.find(e=>e.id==='work_unemployed_reentry');EV.splice(0,EV.length,work);
   const oldRandom=DEBUG_RANDOM;DEBUG_RANDOM=()=>0.99;try{sched();}finally{DEBUG_RANDOM=oldRandom;}
   fire=e=>seen.push(e.id);const service=S.eventSchedule.servicePositions[0];slot(service);return seen;
 }finally{fire=oldFire;EV.splice(0,EV.length,...original);}`),['work_unemployed_reentry']);

fresh();
assert.deepEqual(run(`S.age=32;S.job=1;
 applyLifeGoal({id:'craft',title:'今の仕事の腕を磨く',action:'start'});
 S.job=0;reconcileGenericWorkGoal(S);const paused=S.lifeRecord.goals.find(g=>g.id==='craft').status;
 S.job=1;reconcileGenericWorkGoal(S);const resumed=S.lifeRecord.goals.find(g=>g.id==='craft').status;
 return {paused,resumed};`),{paused:'paused',resumed:'active'});

fresh();
assert.deepEqual(run(`S.res=REG.find(r=>r.n==='イベリア');S.age=79;S.h=13;
 const press=EV.find(e=>e.id==='choice_iberia_06').c[1];
 const weak=ok(press.en,S,tags(S));S.h=30;const able=ok(press.en,S,tags(S));
 const coast=EV.find(e=>e.id==='seaborn_coastal_whisper_daily');
 S.r=RACE.find(r=>r.n==='エーギル');S.local={...S.local,kind:'小規模な定住地'};
 const inland=coast.show(S);S.local={...S.local,kind:'漁村・沿岸集落'};const coastal=coast.show(S);
 return {weak,able,inland,coastal,once:coast.once};`),
 {weak:false,able:true,inland:false,coastal:true,once:true});

fresh();
assert.deepEqual(run(`S.age=32;mortalityState(S).crisis={status:'active',years:3,lastDecisionYear:null,
 consultCount:0,supportedUntilYear:null};
 const initial=EV.find(e=>e.id==='life_mental_crisis_support'),
   recurrence=EV.find(e=>e.id==='life_mental_crisis_recurrence');
 const first={initial:initial.show(S),recurrence:recurrence.show(S),priority:initial.pri===true,
   recurrencePriority:recurrence.pri===true};
 S.mortality.crisis.consultCount=1;S.mortality.crisis.lastAction='rest';
 const later={initial:initial.show(S),recurrence:recurrence.show(S)};
 return {first,later};`),{
 first:{initial:true,recurrence:false,priority:true,recurrencePriority:false},
 later:{initial:false,recurrence:true}
});

fresh();
assert.deepEqual(run(`S.res=REG.find(r=>r.n==='イベリア');S.age=30;S.priceIndex=1.4;
 const discovery=EV.find(e=>e.id==='choice_iberia_09'),
   follow=EV.find(e=>e.id==='choice_iberia_telescope_observation_followup');
 const before=(S.cash||0)+(S.house?.cash||0);ap(discovery.c[0].o[0][2]);
 const after=(S.cash||0)+(S.house?.cash||0);
 return {once:discovery.once,repaired:S.fl.iberia_telescope_repaired,
   paid:Math.round((before-after)*10)/10,followShown:follow.show(S)};`),
 {once:true,repaired:1,paid:28000,followShown:true});

console.log('PASS advanced settings, preserved priority slots, native automatic admission and life-specific resume');
