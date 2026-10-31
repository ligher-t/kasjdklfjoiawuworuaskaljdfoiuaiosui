'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const doc={currentScript:null,getElementById(){return {hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const ctx={window:{},document:doc,console,localStorage:{getItem(){return null},setItem(){}},Date,setTimeout(){},setInterval(){}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),ctx,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],ctx,{timeout:15000});
const result=vm.runInNewContext(String.raw`(()=>{
 HL=1;AU='r';born({seed:862004,by:1077,region:'クルビア'});
 S.job=2;S.age=25;S.year=1102;S.inf=1;S.fl.dg=1;S.fl.tx=0;
 const site=activeFacility(S,'workplace');if(!site)throw Error('site not created');
 // Two distinct acquainted colleagues in a single site, deliberately giving
 // the more recent encounter to the *other* person.
 const mk=(id,metYear)=>({id,kind:'workplace',facilityId:site.id,by:1070,metYear,lastUpdatedYear:S.year,lastKnownYear:S.year,actualStatus:'working',knownStatus:'working',history:[],contacts:[],socialBeliefs:{infected:80,sarkaz:20,basis:'model'},nm:id});
 const A=mk('colleague-A',1100),B=mk('colleague-B',1102);
 S.community.people[A.id]=A;S.community.people[B.id]=B;
 const snap=()=>({links:JSON.stringify(S.personTies||null),after:JSON.stringify(S.socialAftermath||null),conflict:JSON.stringify(S.socialConflict||null)});
 const doAction=(id,action)=>recordPersonTieAction(S,{kind:'workplace',personId:id,action});
 const before=snap();
 let refusedUnknown=false;
 try{doAction(A.id,'rejection-received')}catch(e){refusedUnknown=true}
 if(!refusedUnknown||JSON.stringify(before)!==JSON.stringify(snap()))throw Error('Undisclosed rejection changed state');
 doAction(A.id,'disclose-infection');
 if(!Number.isInteger(A.knowsPlayerInfectionSince)||B.knowsPlayerInfectionSince!=null)throw Error('Infection disclosure leaked to colleague B');
 doAction(A.id,'rejection-received');
 const tiedA=S.personTies.links[A.id],rejectedScore=tiedA.standing;
 if(S.personTies.links[B.id])throw Error('A rejection was applied to B');
 doAction(A.id,'repair-attempt');
 if(tiedA.standing!==rejectedScore||tiedA.relationship==='trusted')throw Error('Repair attempt invented forgiveness');
 const harms=S.socialAftermath.episodes.length;
 doAction(B.id,'ordinary-contact');
 if(S.socialAftermath.episodes.length!==harms||S.socialAftermath.actions.some(x=>x.personId===B.id))throw Error('ordinary contact recorded as support');
 const beforeInvalid=snap();
 let mismatch=false;
 try{doAction('nonexistent','apology-heard')}catch(e){mismatch=true}
 if(!mismatch||JSON.stringify(beforeInvalid)!==JSON.stringify(snap()))throw Error('Invalid target mutated relationships');
 doAction(A.id,'apology-deferred');
 if(tiedA.standing!==rejectedScore||!tiedA.history.some(x=>x.action==='rejection-received')||!A.apologyOfferedYear||S.socialAftermath.episodes.length!==harms)throw Error('Apology unexpectedly cured harm');
 const beforeRepeat=snap();let duplicate=false;
 try{doAction(A.id,'apology-heard')}catch(e){duplicate=true}
 if(!duplicate||JSON.stringify(beforeRepeat)!==JSON.stringify(snap()))throw Error('Repeated apology mutated history');
 const errors=auditLifeState(S);
 if(errors.length)throw Error('state audit errors: '+errors.slice(0,8).join(' / '));
 return {passed:true,year:S.year,siteId:site.id,identifiedContacts:Object.keys(S.personTies.links).length,A:{disclosureYear:A.knowsPlayerInfectionSince,standing:tiedA.standing,relationship:tiedA.relationship,apologyResponse:A.apologyResponse},B:{disclosureYear:B.knowsPlayerInfectionSince??null,standing:S.personTies.links[B.id].standing},harmEpisodes:harms,auditErrors:errors.length};
})()`,ctx,{timeout:30000});
assert(result.passed);
console.log(JSON.stringify(result,null,2));
