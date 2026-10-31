'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),document={currentScript:null,getElementById(){return{hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const ctx={window:{},document,console,Date,setTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),ctx,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],ctx,{timeout:15000});ctx.rd=()=>{};
const event=id=>ctx.window.GAME_DATA.EV.find(row=>row.id===id),exposed=event('hid_exposed');assert(exposed);
const disclosure=exposed.c.find(choice=>choice.l.startsWith('友人にだけ'));assert(disclosure);
assert.equal(JSON.stringify(disclosure.o.map(row=>row[2].closeKnowledgeAction.recipientResponse)),JSON.stringify(['heard-undecided','questioned-diagnosis','withdrew']));
for(const kind of ['father','mother','spouse','friend']){
 const choice=event('hid_exposed').c.find(row=>row.l.startsWith(({father:'父にだけ',mother:'母にだけ',spouse:'同居する配偶者にだけ',friend:'友人にだけ'})[kind]));
 assert(choice,`${kind} disclosure choice exists`);
 assert.equal(JSON.stringify(choice.o.map(row=>row[2].closeKnowledgeAction.recipientResponse)),JSON.stringify(['heard-undecided','questioned-diagnosis','withdrew']));
}
const {state,personId}=vm.runInNewContext(String.raw`(()=>{born({seed:871124,by:1077,region:'クルビア'});S.age=30;S.year=1107;S.inf=1;S.fl.dg=1;S.friendContact=ensureSocialContact(S,'friend');const personId=S.friendContact.id;recordCloseKnowledgeAction(S,{...${JSON.stringify(disclosure.o[2][2].closeKnowledgeAction)},personId});S.year++;S.age++;return {state:S,personId}})()`,ctx,{timeout:30000});
const link=state.closeKnowledge.links[personId];assert.equal(link.knownFacts.playerDiagnosis.sinceYear,1107);
assert.deepEqual({...link.latestResponse},{state:'withdrew',sinceYear:1107,basis:'direct-observed-response'});
assert.equal(link.history.at(-1).recipientResponse,'withdrew');
assert(ctx.closeKnowledgeSummary(state).includes('1107年、その場で距離を置く反応があった'));
const followup=event('v87_private_followup_friend');assert(followup.show(state));assert(followup.t(state).includes('相手は距離を置いた')&&followup.t(state).includes('久しぶりに便りを出すか'));
const defer=followup.c[2].o[0][2].closeKnowledgeAction;ctx.recordCloseKnowledgeAction(state,{...defer,personId});
assert.equal(link.latestResponse.state,'withdrew','the later choice must not overwrite the recipient response');
assert(followup.t(state).includes('相手は距離を置いた'));
const before=JSON.stringify(state.closeKnowledge);let rejected=false;try{ctx.recordCloseKnowledgeAction(state,{kind:'friend',action:'defer',personId,recipientResponse:'withdrew'})}catch{rejected=true}
assert(rejected);assert.equal(JSON.stringify(state.closeKnowledge),before,'a reaction cannot be attached to the protagonist deferring');
assert.equal(ctx.auditLifeState(state).length,0);
for(const [response,phrase] of [['heard-undecided','その場では返事が決まらなかった'],['questioned-diagnosis','診断について追加確認を求められた']]){
 const scenario=vm.runInNewContext(String.raw`(()=>{born({seed:871125,by:1077,region:'クルビア'});S.age=30;S.year=1107;S.inf=1;S.fl.dg=1;S.friendContact=ensureSocialContact(S,'friend');recordCloseKnowledgeAction(S,{...${JSON.stringify(disclosure.o[response==='heard-undecided'?0:1][2].closeKnowledgeAction)},personId:S.friendContact.id});return S})()`,ctx,{timeout:30000});
 assert(ctx.closeKnowledgeSummary(scenario).includes(phrase));
 assert.equal(ctx.auditLifeState(scenario).length,0);
}
assert.equal((state.socialConflict?.episodes||[]).some(x=>x.context==='exclusion-organizer-diagnosis-rejection'),false,'questioning or withdrawal must not be converted into discrimination by the protagonist');
console.log(JSON.stringify({passed:true,fourRecipientsHaveThreeDistinctResponses:true,personSpecificDiagnosisKnowledge:true,recipientWithdrawalRecordedSeparately:true,allResponseSummariesVerified:true,withdrawalPersistsAcrossLaterDeferral:true,followupReflectsKnownResponseWithoutAssumingRepair:true,auditErrors:0},null,2));
