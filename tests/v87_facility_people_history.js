'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const document={currentScript:null,getElementById(){return {hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const context={window:{},document,console,localStorage:{getItem(){return null},setItem(){}},Date,setTimeout(){},setInterval(){}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),context,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],context,{timeout:15000});
context.rd=()=>{};
const data=context.window.GAME_DATA,event=id=>data.EV.find(row=>row.id===id);
const expected={
 people_clinic_introduction:['information','information'],people_school_introduction:['information','self-or-family-care'],people_work_introduction:['information','procedure'],
 people_clinic_followup:['information','defer'],people_school_followup:['information','self-or-family-care'],people_work_followup:['information','withdrawal'],
 people_clinic_small_help:['voluntary-aid','information'],people_school_small_help:['voluntary-aid','withdrawal'],people_work_small_help:['voluntary-aid','withdrawal'],
 people_work_life_conversation:['information','procedure'],people_school_life_conversation:['information','procedure'],people_clinic_life_conversation:['information','procedure'],
 people_work_care_schedule:['voluntary-aid','procedure'],people_school_housing_concern:['voluntary-aid','information'],people_clinic_skill_continuity:['voluntary-aid','procedure']
};
for(const [id,intents] of Object.entries(expected)){
 const row=event(id);assert(row,id+' event exists');assert.equal(row.c.length,intents.length,id+' choice count');
 assert.deepEqual(Array.from(row.c,choice=>choice.ethics?.intent),intents,id+' intent classification');
 assert(row.c.every(choice=>choice.ethics?.reviewed&&choice.ethics.policyVersion===87),id+' choices have current review');
 assert(row.c.every(choice=>choice.o?.length&&choice.o.at(-1)[0]===1),id+' all displayed results are complete');
}
const feedback=event('people_clinic_skill_continuity'),feedbackAction=feedback.c[0].o[0][2].facilityPersonAction;
assert.deepEqual({...feedbackAction},{kind:'clinic',action:'feedback'});
assert(feedback.c[0].o[0][1].includes('個人の意見が施設の手順を変えたことにはならない'));
for(const id of ['people_clinic_life_conversation','people_school_life_conversation','people_work_life_conversation'])assert.equal(event(id).c[0].o[0][2].facilityPersonAction.action,'talk');
for(const id of ['people_clinic_small_help','people_school_small_help','people_work_small_help','people_work_care_schedule','people_school_housing_concern'])assert.equal(event(id).c[0].o[0][2].facilityPersonAction.action,'help');
const runtime=vm.runInNewContext(String.raw`(()=>{
 HL=1;AU='r';born({seed:862004,by:1077,region:'クルビア'});S.job=2;S.age=30;S.year=1107;
 const facility=activeFacility(S,'clinic');if(!facility)throw Error('clinic facility missing');
 applyFacilityPersonAction(S,{kind:'clinic',action:'meet'});const person=facilityPersonFor(S,'clinic');
 person.contactState='familiar';person.life.goal='learn';
 if(!window.GAME_DATA.EV.find(row=>row.id==='people_clinic_skill_continuity').show(S))throw Error('the feedback event should be reachable for a known clinic contact learning new procedures');
 const tie=S.personTies.links[person.id],before=tie.standing;
 applyFacilityPersonAction(S,{kind:'clinic',action:'feedback',description:'利用者として分かりにくい掲示を伝えた'});
 const feedbackStanding=tie.standing,feedbackRecord=tie.history.at(-1),contactRecord=person.contacts.at(-1);
 applyFacilityPersonAction(S,{kind:'clinic',action:'help',description:'窓口の掲示を一緒に読み合わせた'});
 return {before,feedbackStanding,feedbackAction:feedbackRecord.action,feedbackDelta:feedbackRecord.delta,feedbackContact:contactRecord.action,followupHelpStanding:tie.standing,followupHelpAction:tie.history.at(-1).action,facilityLog:S.facilityPeopleContacts.at(-2).action,auditErrors:auditLifeState(S)};
})()`,context,{timeout:30000});
assert.equal(runtime.feedbackStanding,runtime.before,'giving service feedback must not raise personal closeness');
assert.equal(runtime.feedbackAction,'service-feedback');assert.equal(runtime.feedbackDelta,0);assert.equal(runtime.feedbackContact,'feedback');
assert.equal(runtime.followupHelpStanding,runtime.before+4,'actual shared help keeps its existing relationship effect');
assert.equal(runtime.followupHelpAction,'shared-work');assert.equal(runtime.facilityLog,'feedback');assert.deepEqual(Array.from(runtime.auditErrors),[]);
console.log(JSON.stringify({passed:true,reviewedEvents:Object.keys(expected).length,reviewedChoices:Object.values(expected).flat().length,serviceFeedbackSeparateFromSharedWork:true,sharedHelpEffectPreserved:true,personSpecificHistoryRecorded:true,auditErrors:runtime.auditErrors},null,2));
