'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const document={currentScript:null,getElementById(){return {hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const ctx={window:{},document,console,localStorage:{getItem(){return null},setItem(){}},Date,setTimeout(){},setInterval(){}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),ctx,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],ctx,{timeout:15000});
const event=ctx.window.GAME_DATA.EV.find(row=>row.id==='v87_medical_access_aftermath');
assert(event,'medical access aftermath event is registered');
const state=(year,episodeYear=year-1,status='active')=>({age:42,year,socialAftermath:{version:1,nextId:2,episodes:[{id:'medical-case',year:episodeYear,domain:'medical',status}],actions:[]}});
assert.equal(event.show(state(2062,2061)),true,'recent medical access harm unlocks follow-up');
assert.equal(event.show(state(2062,2062)),false,'same-year harm does not unlock later-life follow-up immediately');
assert.equal(event.show(state(2062,2057)),false,'old or ended medical harm does not reopen');
assert.equal(event.show(state(2062,2061,'ended')),false,'closed medical harm does not reopen');
assert.equal(event.show({...state(2062,2061),socialAftermath:{episodes:[{id:'work-case',year:2061,domain:'work',status:'active'}]}}),false,'unrelated domain does not unlock medical access event');
assert.equal(event.c.length,3);
for(const choice of event.c)for(const outcome of choice.o){
 const action=outcome[2]?.socialAftermathAction;
 assert(action&&action.domain==='medical','all outcomes stay attached to medical access history');
 assert(!('tx' in outcome[2])&&!('inf' in outcome[2]),'medical access follow-up does not invent treatment or diagnosis outcomes');
 assert(!outcome[2]?.fl?.ed_clinic_delayed,'follow-up does not rewrite the original event flag');
}
const withMedical=action=>state(2062,2061);
for(const [choiceIndex,outcomeIndex] of [[0,0],[1,0],[1,1],[2,0]]){
 const patient=withMedical(),action=event.c[choiceIndex].o[outcomeIndex][2].socialAftermathAction;
 ctx.applySocialAftermathAction(patient,action,event.id);
 assert.equal(patient.socialAftermath.actions[0].domain,'medical');
 assert.equal(patient.socialAftermath.episodes[0].status,action.type==='support'?'supported':'active');
}
console.log(JSON.stringify({passed:true,choices:3,followupActions:4,medicalEpisodePreserved:true,diagnosisAndTreatmentNotInferred:true}));
