'use strict';
const path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),context=require('./support/annual-cases.cjs').context(root).ctx;
const data=context.window.GAME_DATA,event=id=>data.EV.find(row=>row.id===id);
const expected={
 cl_family_legacy_expectation:['information','information','self-or-family-care'],
 cl_kazimierz_sponsorship:['information','information','procedure'],
 cl_siracusa_market_patron:['procedure','information','withdrawal'],
 cl_yerag_community_vote:['mediate','information','procedure'],
 cl_sargon_trade_water:['information','voluntary-aid','withdrawal'],
 cl_bolivar_crop_labor:['information','self-or-family-care','procedure'],
 cl_legacy_network_followup:['information','withdrawal','information'],
 cl_neighbors_crossclass:['voluntary-aid','information','withdrawal'],
 cl_neighborhood_after:['information','procedure','self-or-family-care']
};
for(const [id,intents] of Object.entries(expected)){
 const row=event(id);assert(row,id+' event exists');assert.equal(row.c.length,intents.length,id+' choice count');
 assert.deepEqual(Array.from(row.c,choice=>choice.ethics?.intent),intents,id+' choice intent review');
 assert(row.c.every(choice=>choice.ethics?.reviewed&&choice.ethics.policyVersion===87),id+' all choices receive current review');
 assert(row.c.every(choice=>choice.c===undefined&&choice.o.length===1&&choice.o[0][2].classAction),id+' every result stays an individual class experience');
}
const modeled=data.SETTING_SOURCES.SRC_CLASS_GENERAL;
assert(modeled?.note?.includes('出生抽選の確率')&&modeled.note.includes('ゲーム用仮定'),'class and regional details remain game assumptions, not population rules');
const localEvents=Object.keys(expected).filter(id=>id!=='cl_family_legacy_expectation'&&id!=='cl_legacy_network_followup');
for(const id of localEvents){
 const row=event(id);assert(row.references?.length,id+' cites a scope source');
 for(const [index,choice] of row.c.entries()){
  const action=choice.o[0][2].localityAction;assert(action?.kind&&action.action&&action.description,id+'@'+index+' retains its local action');
  const region=id==='cl_kazimierz_sponsorship'?'カジミエーシュ':id==='cl_siracusa_market_patron'?'シラクーザ':id==='cl_yerag_community_vote'?'イェラグ':id==='cl_sargon_trade_water'?'サルゴン':id==='cl_bolivar_crop_labor'?'ボリバル':'龍門';
  const city='記録確認用の仮想生活圏',home='移動都市',kind='仮想区画',key=`${region}|${city}|${home}|${kind}`;
  const metrics={food:.5,jobs:.5,housing:.5,medical:.5,transport:.5};
  const state={year:1100,age:30,home,res:{n:region},local:{city,kind,ecology:id==='cl_sargon_trade_water'?'乾燥地・オアシス':'平地'},world:{events:{},localityArchive:{}},community:{version:1,key,region,city,district:kind,metrics:{...metrics},lastYear:1100,history:[],actions:[]}};
  context.ensureLocalityState(state);
  const metricsBeforeAction={...state.community.metrics};
  context.applyLocalityAction(state,action);
  assert.equal(state.community.actions.length,1,id+'@'+index+' action reaches its local history');
  assert.equal(state.community.actions[0].kind,action.kind);assert.equal(state.community.actions[0].action,action.action);
  assert.deepEqual({...state.community.metrics},metricsBeforeAction,id+'@'+index+' does not change region-wide service metrics');
 }
}
const sargon=event('cl_sargon_trade_water');assert.equal(typeof sargon.show,'function');
assert.equal(sargon.show({local:{ecology:'乾燥地'} }),false,'water encounter requires the oasis ecology model');
assert.equal(sargon.show({local:{ecology:'乾燥地・オアシス'} }),true,'water encounter remains localized to an oasis setting');
console.log(JSON.stringify({passed:true,reviewedEvents:Object.keys(expected).length,reviewedChoices:Object.values(expected).flat().length,localizedActionEvents:localEvents.length,localActionsPersist:true,publicMetricsUnaffected:true,sourceAndScopeBoundaryExplicit:true},null,2));
