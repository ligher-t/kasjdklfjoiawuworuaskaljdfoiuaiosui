'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),nodes=new Map(),storage=new Map();
function node(id=''){if(!nodes.has(id))nodes.set(id,{id,hidden:false,value:'',textContent:'',innerHTML:'',dataset:{},style:{},children:[],classList:{toggle(){},add(){},remove(){}},setAttribute(){},append(){},appendChild(){},replaceChildren(){this.children=[]},querySelectorAll(){return[]},addEventListener(){},click(){}});return nodes.get(id)}
const document={currentScript:null,getElementById:id=>node(id),querySelectorAll(){return[]},createElement:tag=>node('created-'+tag),createTextNode:text=>({textContent:text}),addEventListener(){},activeElement:{tagName:'BODY'},documentElement:{style:{setProperty(){}},removeAttribute(){},setAttribute(){}},head:{appendChild(){}}};
const ctx={window:{},document,console,Date,setTimeout(){},setInterval(){},alert(){},confirm(){return true},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),ctx,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root),ctx,{timeout:15000});
const result=vm.runInNewContext(String.raw`(()=>{
 HL=1;AU='r';STAT.ev={};STAT.op={};STAT.currentLife=0;STAT.choiceMonths=new Set();
 born({seed:871260,by:1060,region:'龍門'});S.age=24;S.year=1084;S.res=REG.find(x=>x.n==='龍門');
 repairParentRecords(S);assignRelativeIds(S);const fatherId=S.par?.fa?.id;if(!fatherId||S.par.fa.d)throw Error('the standard birth record must supply a living father');S.par.fa.nm='父の個人記録';
 S.inf=1;S.fl.dg=1;S.infection={year:S.year,cause:'known-condition',basis:'test-setup'};S.socialLearning.familyNorms.infected=45;
 const rejection=EV.find(row=>row.id==='v78_parent_rejection_diagnosis');if(!rejection.show(S))throw Error('diagnosed survivor with a reachable parent should receive the family event');
 ap(rejection.c[0].o[1][2]);
 const breach=S.socialConflict.familyBreach,initialAudit=auditLifeState(S);if(breach.personId!==fatherId||breach.personName!==S.par.fa.nm||breach.personRelation!=='父'||initialAudit.length)throw Error('explicit rejection should preserve the father identity and audit cleanly: '+JSON.stringify({breach,parent:S.par.fa,initialAudit}));
 S.year+=2;S.age+=2;const recovery=EV.find(row=>row.id==='v78_family_breach_recovery');if(!recovery.show(S)||!recovery.c[0].show(S))throw Error('the same father should remain the only individually eligible contact');
 ap(recovery.c[0].o[0][2]);
 const before=JSON.stringify(S.socialConflict.familyBreach),snapshot=makeResumeSnapshot();writeResumeSlot(0,{savedAt:snapshot.savedAt,snapshot});
 const saved=readResumeSlots().slots[0].snapshot,loaded=cont(normalizeResumeImport(JSON.parse(JSON.stringify(saved))));if(!loaded)throw Error('current parent-rejection history could not be restored');
 const restored=JSON.stringify(S.socialConflict.familyBreach);HL=0;rd();const display=$('social-learning-note').textContent;
 if(restored!==before||!display.includes('父の個人記録')||!display.includes('返事があった')||!display.includes('関係が戻ったかは未確認'))throw Error('save restoration or visible summary merged a reply into reconciliation: '+display);
 const future=JSON.parse(JSON.stringify(S));future.socialConflict.familyBreach.year=S.year+1;
 const malformedPerson=JSON.parse(JSON.stringify(S));malformedPerson.socialConflict.familyBreach.personId=malformedPerson.par.mo.id;
 const malformedReply=JSON.parse(JSON.stringify(S));malformedReply.socialConflict.familyBreach.contactHistory[0].outcome='reconciled';
 const malformedReplyRecipient=JSON.parse(JSON.stringify(S));malformedReplyRecipient.socialConflict.familyBreach.contactHistory[0].personId=malformedReplyRecipient.par.mo.id;
 const futureContact=JSON.parse(JSON.stringify(S));futureContact.socialConflict.familyBreach.contactHistory[0].year=S.year+1;
 const corruptedStates=[future,malformedPerson,malformedReply,malformedReplyRecipient,futureContact],corruptRejected=corruptedStates.every(state=>auditLifeState(state).length>0);
 const incompleteSnapshot=JSON.parse(JSON.stringify(saved)),incompleteBreach=incompleteSnapshot.S.socialConflict.familyBreach;delete incompleteBreach.personId;delete incompleteBreach.personName;delete incompleteBreach.personRelation;delete incompleteBreach.contactHistory;delete incompleteBreach.lastContactYear;
 let incompleteRejected=false;try{normalizeResumeImport(incompleteSnapshot)}catch{incompleteRejected=true}
 if(!incompleteRejected)throw Error('an incomplete current-format save bypassed state audit');
 HL=1;born({seed:871261,by:1060,region:'龍門'});S.age=24;S.year=1084;S.res=REG.find(x=>x.n==='龍門');S.fl.household_separated=1;S.residenceArrangement='independent_rental';S.inf=1;S.fl.dg=1;S.infection={year:S.year,cause:'known-condition',basis:'test-setup'};S.socialLearning.familyNorms.infected=45;const contact=EV.find(row=>row.id==='v87_family_contact_boundary_diagnosis');if(!contact.show(S))throw Error('an independent household did not receive its separate contact-boundary event');const contactFatherId=S.par.fa.id;ap(contact.c[0].o[1][2]);const contactHistory=JSON.stringify({experienced:S.socialConflict.experienced,reports:S.socialConflict.reports,familyBreach:S.socialConflict.familyBreach,episodes:S.socialAftermath.episodes});if(S.socialConflict.experienced.at(-1).personId!==contactFatherId||S.socialConflict.familyBreach)throw Error('separate contact refusal lost its parent ID or invented expulsion');const contactSnapshot=makeResumeSnapshot();writeResumeSlot(1,{savedAt:contactSnapshot.savedAt,snapshot:contactSnapshot});const contactSaved=readResumeSlots().slots[1].snapshot;if(!cont(normalizeResumeImport(JSON.parse(JSON.stringify(contactSaved)))))throw Error('separate household contact history could not be restored');HL=0;rd();const restoredContactHistory=JSON.stringify({experienced:S.socialConflict.experienced,reports:S.socialConflict.reports,familyBreach:S.socialConflict.familyBreach,episodes:S.socialAftermath.episodes});if(restoredContactHistory!==contactHistory||auditLifeState(S).length)throw Error('separate contact boundary failed save/resume or state audit');
 return{passed:true,individualActorAndReplyRoundTrip:true,visibleSummaryKeepsReconciliationUnknown:true,invalidFutureActorAndReplyRecordsRejected:corruptRejected,incompleteCurrentStateRejected:incompleteRejected,separateHouseholdContactIdAndImpactRoundTrip:true,validAuditErrors:0};
})()`,ctx,{timeout:60000});
assert.equal(result.passed,true);assert.equal(result.invalidFutureActorAndReplyRecordsRejected,true);assert.equal(result.incompleteCurrentStateRejected,true);assert.equal(result.validAuditErrors,0);
console.log(JSON.stringify(result,null,2));
