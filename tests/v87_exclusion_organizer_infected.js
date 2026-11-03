'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),document={currentScript:null,getElementById(){return{hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const ctx={window:{},document,console,Date,setTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),ctx,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],ctx,{timeout:15000});
ctx.rd=()=>{};
const event=ctx.window.GAME_DATA.EV.find(row=>row.id==='v87_exclusion_organizer_infected');assert(event);
assert.deepEqual(Array.from(event.c,choice=>choice.ethics.intent),['self-or-family-care','self-or-family-care','oppose-exclusion']);
assert(event.c.every(choice=>choice.ethics.target==='infected'&&choice.ethics.reviewed&&choice.ethics.policyVersion===87));
assert.equal(event.c[2].en.le.biasInfected,74);
function actor(){
 return vm.runInNewContext(String.raw`(()=>{born({seed:870023,by:1050,region:'龍門'});S.age=35;S.year=1085;S.res={n:'龍門'};
 applyLifeAffiliation({id:'infected-exclusion',title:'感染者排除を求める住民会',kind:'political-local-group',action:'join',role:'立上げ人'});
 applyLifeOrganization({id:'infected-exclusion',title:'感染者排除を求める住民会',kind:'political-local-group',action:'found',amount:5000,policy:'感染者の立入・雇用制限',participation:'設立者'});
 applyLifeGoal({id:'order-through-exclusion',title:'感染者を遠ざけて地域の秩序を守る',priority:'秩序',action:'start'});
 socialConflictAction(S,{action:'exclude',target:'infected',context:'founded-exclusion-association'});recordInfectionPrior(S,'test-diagnosis');S.inf=1;S.fl.dg=1;S.year=1086;S.age=36;return S})()`,ctx,{timeout:30000});
}
const state=actor();assert(event.show(state),'diagnosed founder with recorded exclusion must unlock the scenario');
assert.equal(event.after.id,'v78_prejudice_to_patient');assert.equal(event.after.min,1);
const noGroup=actor();noGroup.lifeRecord.affiliations[0].status='left';assert.equal(event.show(noGroup),false,'a former member is not treated as a current organizer');
const noDiagnosis=actor();noDiagnosis.inf=0;assert.equal(event.show(noDiagnosis),false);
const noRecordedAct=actor();noRecordedAct.socialConflict.infectionShock.priorActions=0;assert.equal(event.show(noRecordedAct),false,'bias or presence alone is not direct exclusion');
function apply(fx){for(const [name,value] of Object.entries(fx)){if(name==='lifeAffiliations'){for(const row of value)vm.runInNewContext(`applyLifeAffiliation(${JSON.stringify(row)})`,ctx)}else if(name==='lifeAffiliation')vm.runInNewContext(`applyLifeAffiliation(${JSON.stringify(value)})`,ctx);else if(name==='lifeOrganization')vm.runInNewContext(`applyLifeOrganization(${JSON.stringify(value)})`,ctx);else if(name==='lifeGoal')vm.runInNewContext(`applyLifeGoal(${JSON.stringify(value)})`,ctx);else if(name==='socialConflictAction')vm.runInNewContext(`socialConflictAction(S,${JSON.stringify(value)})`,ctx)}}
const policy='感染者の立入・雇用制限';
let s=actor();apply(event.c[0].o[0][2]);assert.equal(s.lifeRecord.organizations[0].policy,policy);assert.equal(s.lifeRecord.organizations[0].lastFollowupYear,s.year);assert.equal(s.lifeRecord.affiliations[0].status,'active');assert.equal(Object.keys(s.closeKnowledge.links).length,0,'withholding diagnosis from the group does not create a named disclosure record');
s=actor();apply(event.c[1].o[0][2]);assert.equal(s.lifeRecord.organizations[0].policy,policy,'personal exception leaves the discriminatory rule unchanged');assert.equal(s.lifeRecord.affiliations[0].status,'crisis');assert(s.lifeRecord.organizations[0].history.at(-1).note.includes('個別例外'));
s=actor();apply(event.c[1].o[1][2]);assert.equal(s.lifeRecord.organizations[0].policy,policy);assert.equal(s.lifeRecord.affiliations[0].status,'suspended');assert(s.socialConflict.experienced.some(row=>row.action==='social-rejection'&&row.target==='infected'));assert(s.socialAftermath.episodes.some(row=>row.domain==='community'&&row.status==='active'));assert.equal(s.lifeRecord.goals.find(row=>row.id==='order-through-exclusion').status,'paused');
s=actor();apply(event.c[2].o[0][2]);assert.notEqual(s.lifeRecord.organizations[0].policy,policy);assert.equal(s.lifeRecord.affiliations[0].status,'crisis');assert(s.socialConflict.acts.some(row=>row.action==='reconsider'));assert.equal(s.lifeRecord.regionalImpacts.length,0,'a local organization rule change does not imply region-wide uptake');assert.equal(s.lifeRecord.goals.find(row=>row.id==='order-through-exclusion').status,'compromised');
s=actor();apply(event.c[2].o[1][2]);assert.equal(s.lifeRecord.organizations[0].policy,policy);assert.equal(s.lifeRecord.affiliations[0].status,'suspended');assert(s.socialConflict.experienced.some(row=>row.action==='social-rejection'));assert.equal(s.lifeRecord.goals.find(row=>row.id==='order-through-exclusion').status,'paused','rejected proposal suspends the founder’s practical activity while historical exclusion persists');
const followup=ctx.window.GAME_DATA.EV.find(row=>row.id==='life_infected_exclusion_pause_review');
assert(followup);
for(const choice of [0,1,2]){
 s=actor();apply(event.c[1].o[1][2]);
 vm.runInNewContext('S.sn.v87_exclusion_organizer_infected=S.year;S.year+=3;S.age+=3',ctx);
 assert(followup.show(s),'suspended founder receives a follow-up after three years');
 apply(followup.c[choice].o[0][2]);
 const expected=choice===0?['active','active']:choice===1?['suspended','paused']:['left','abandoned'];
 assert.deepEqual([s.lifeRecord.affiliations.find(a=>a.id==='infected-exclusion').status,
  s.lifeRecord.goals.find(g=>g.id==='order-through-exclusion').status],expected);
 assert.equal(followup.show(s),false,'resolved or recently reviewed decision cannot immediately recur');
 assert.equal(vm.runInNewContext('auditLifeState(S).length',ctx),0);
}
// A new suspension after rejoining must use its own start year.
s=actor();apply(event.c[1].o[1][2]);
vm.runInNewContext('S.sn.v87_exclusion_organizer_infected=S.year;S.year+=3;S.age+=3',ctx);
apply(followup.c[0].o[0][2]);
assert.equal(s.lifeRecord.affiliations[0].status,'active');
vm.runInNewContext('S.sn.life_infected_exclusion_pause_review=S.year;S.year+=5;S.age+=5',ctx);
vm.runInNewContext(`ap({lifeAffiliation:{id:'infected-exclusion',action:'suspend',
 note:'復帰後に活動を再び休止'},lifeGoal:{id:'order-through-exclusion',action:'pause'}})`,ctx);
const newestSuspension=s.year,history=s.lifeRecord.affiliations[0].history;
assert.equal(history.filter(h=>h.action==='suspend').at(-1).year,newestSuspension);
vm.runInNewContext('S.year+=2;S.age+=2',ctx);
assert.equal(followup.show(s),false,'rejoining must not reuse the first suspension clock');
vm.runInNewContext('S.year++;S.age++',ctx);
assert.equal(followup.show(s),true,'the latest suspension becomes eligible after three years');
apply(followup.c[1].o[0][2]);
assert.equal(s.lifeRecord.affiliations[0].status,'suspended');
const reviewYear=s.year;
vm.runInNewContext('S.year+=2;S.age+=2',ctx);
assert.equal(followup.show(s),false,'a reviewed deferral must honor a new three-year interval');
vm.runInNewContext('S.year++;S.age++',ctx);
assert.equal(followup.show(s),true);
apply(followup.c[2].o[0][2]);
assert.equal(s.lifeRecord.affiliations[0].status,'left');
assert.equal(s.lifeRecord.goals[0].status,'abandoned');
vm.runInNewContext('S.year+=10;S.age+=10',ctx);
assert.equal(followup.show(s),false,'a former organizer cannot receive new suspension letters');
assert.equal(vm.runInNewContext('auditLifeState(S).length',ctx),0);
console.log(JSON.stringify({passed:true,conditionedOnDiagnosisAndRecordedExclusion:true,hardlineCannotRequestPolicyReform:true,personalExceptionLeavesRuleUnchanged:true,localPolicyRevisionAndRejectionBothRecorded:true,communityRejectionRemainsUnresolved:true},null,2));
