'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),document={currentScript:null,getElementById(){return{hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const context={window:{},document,console,localStorage:{getItem(){return null},setItem(){}},Date,setTimeout(){},setInterval(){}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),context,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],context,{timeout:15000});
const event=id=>context.window.GAME_DATA.EV.find(row=>row.id===id);
const expected={facility_work_restricted:['procedure','voluntary-aid','procedure'],facility_work_recovery:['procedure','self-or-family-care'],site_workplace_alternative:['procedure','information'],site_workplace_old_contact:['procedure','procedure'],job_contract_review_v76:['procedure','defer'],job_contract_negotiation_v76:['procedure','procedure'],job_contract_family_schedule_v76:['procedure','self-or-family-care']};
for(const [id,intents] of Object.entries(expected)){
 const row=event(id);assert(row,id+' event missing');assert.equal(row.c.length,intents.length,id+' choice count');
 assert.deepEqual(Array.from(row.c,choice=>choice.ethics?.intent),intents,id+' intent classification');
 assert(row.c.every(choice=>choice.ethics?.reviewed&&choice.ethics.policyVersion===87),id+' review version');
}
for(const [id,action] of [['job_contract_negotiation_v76','negotiate'],['job_contract_family_schedule_v76','hours']]){
 const choice=event(id).c[0];
 assert.deepEqual(Array.from(choice.o,row=>row[2].workContractAction?.result),['approved','declined'],id+' must keep the same attempt on both outcomes');
 assert(choice.o.every(outcome=>outcome[2].workContractAction?.action===action),id+' action must be recorded on every result');
}
const runtime=vm.runInNewContext(String.raw`(()=>{
 HL=1;AU='r';born({seed:870023,by:1077,region:'クルビア'});S.job=2;S.age=30;S.year=1107;
 const contract=reconcileWorkContract(S);if(!contract)throw Error('active work contract missing');
 contract.wagePremium=0;contract.hours='regular';contract.knownConditions='reviewed';
 const originalPremium=contract.wagePremium,originalHours=contract.hours;
 applyWorkContractAction(S,{action:'negotiate',result:'declined'});const declinedNegotiation=S.workContractHistory.at(-1);
 const premiumAfterDecline=contract.wagePremium;
 applyWorkContractAction(S,{action:'negotiate',result:'approved'});const approvedNegotiation=S.workContractHistory.at(-1);
 contract.hours=originalHours;
 applyWorkContractAction(S,{action:'hours',result:'declined'});const declinedHours=S.workContractHistory.at(-1),hoursAfterDecline=contract.hours;
 applyWorkContractAction(S,{action:'hours',result:'approved'});const approvedHours=S.workContractHistory.at(-1);
 return {originalPremium,premiumAfterDecline,premiumAfterApproval:contract.wagePremium,originalHours,hoursAfterDecline,hoursAfterApproval:contract.hours,history:[declinedNegotiation,approvedNegotiation,declinedHours,approvedHours],audit:auditLifeState(S)};
})()`,context,{timeout:30000});
assert.equal(runtime.premiumAfterDecline,runtime.originalPremium,'declined negotiation must not change pay');
assert(runtime.premiumAfterApproval>runtime.originalPremium,'approved negotiation must change individual pay');
assert.equal(runtime.hoursAfterDecline,runtime.originalHours,'declined schedule change must preserve hours');
assert.equal(runtime.hoursAfterApproval,'short','approved schedule change must shorten hours');
assert.deepEqual(Array.from(runtime.history,row=>row.outcome),['declined','approved','declined','approved']);
assert.deepEqual(Array.from(runtime.audit),[]);
console.log(JSON.stringify({passed:true,reviewedEvents:Object.keys(expected).length,reviewedChoices:Object.values(expected).flat().length,attemptAndOutcomeHistorySeparate:true,declinedTermsStayUnchanged:true,approvedTermsUpdateIndividually:true},null,2));
