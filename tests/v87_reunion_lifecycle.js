'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const document={currentScript:null,getElementById(){return {hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const ctx={window:{},document,console,Date,setTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),ctx,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],ctx,{timeout:15000});
ctx.rd=()=>{};
const D=ctx.window.GAME_DATA,event=id=>D.EV.find(row=>row.id===id);
const early=event('life_reunion_early_contact');
const earlyDaily=event('life_reunion_early_camp_daily');
const localEntry=event('life_reunion_local_entry');
const baseAssign=event('life_reunion_chernobog_base_assignment');
const baseDaily=event('life_reunion_chernobog_base_daily');
const oldConflict=event('life_reunion_order_conflict');
const aftermath=event('life_reunion_chernobog_aftermath');
const reconnection=event('life_reunion_survivor_reconnection');
const contact=event('sr_reunion_neighbour_contact');
const reorgTension=event('life_reunion_reorg_tension');
const reorgCrisisReview=event('life_reunion_reorg_crisis_review');
const reorgPauseReview=event('life_reunion_reorg_pause_review');
const movementJoin=event('sr_reunion_movement_join');
const campDaily=event('sr_reunion_border_camp_daily');
const refugees=event('sr_reunion_border_refugees');
const relocation=event('sr_reunion_border_relocation');
const movingDaily=event('sr_reunion_moving_column_daily');
const departureLegacy=event('sr_reunion_departure_legacy');
const required=[early,earlyDaily,localEntry,baseAssign,baseDaily,oldConflict,aftermath,reconnection,contact,reorgTension,reorgCrisisReview,reorgPauseReview,movementJoin,campDaily,refugees,relocation,movingDaily,departureLegacy];
assert(required.every(Boolean),'all Reunion route stages are registered');
const equalShape=(actual,expected,message)=>assert.equal(JSON.stringify(actual),JSON.stringify(expected),message);

function state({year=1094,age=18,inf=true,region='ウルサス',city='無名の町',affiliations=[]}={}){
 return {year,age,by:year-age,inf,res:{r:region,n:city},lifeRecord:{version:4,goals:[],skills:[],affiliations:[]}};
}
function addAffiliation(s,id,role,status='active'){
 s.lifeRecord.affiliations.push({id,title:id,kind:'test',status,role,startedYear:s.year,endedYear:null,lastChangedYear:s.year,episodes:[{startedYear:s.year,endedYear:null,roleAtStart:role,returning:false,basis:'recorded'}],history:[]});
 return s;
}
function eligibilityState(status){
 const s=vm.runInNewContext(`(()=>{born({seed:871903,by:1076,region:'ウルサス'});S.year=1099;S.age=23;S.mo=3;S.inf=1;S.res=REG.find(row=>row.n==='ウルサス');return S})()`,ctx,{timeout:30000});
 addAffiliation(s,'reunion-1096','活動休止・個人連絡のみ',status);
 s.sn.life_reunion_chernobog_aftermath=1098;
 return s;
}
function eligible(row,s){ctx.__event=row;ctx.__state=s;return vm.runInNewContext('elig(__event,__state,tags(__state))',ctx,{timeout:30000});}
function applyAffiliation(s,effect){
 ctx.__state=s;ctx.__action=effect;
 vm.runInNewContext('S=__state; if (__action.lifeAffiliation) applyLifeAffiliation(__action.lifeAffiliation); else if (__action.id && __action.action) applyLifeAffiliation(__action); for (const input of (__action.lifeAffiliations || [])) applyLifeAffiliation(input)',ctx);
}

equalShape(early.ge,{year:1090,age:18});
equalShape(early.le,{year:1095});
assert.equal(early.show(state({year:1092,age:19,inf:true})),true,'the early mutual-aid route is limited to an Infected character');
assert.equal(early.show(state({year:1092,age:19,inf:false})),false,'a non-Infected person cannot enter Reunion as a member');
assert.equal(early.show(addAffiliation(state({year:1092}), 'reunion-1096','初期移動野営地・食料と寝床の当番')),false,'the early invitation cannot create duplicate membership');
assert(early.references.includes('SRC_REUNION_TIMELINE'));
assert(early.references.includes('SRC_REUNION_EARLY_CAMP'));

const earlyMember=state({year:1094,age:19,inf:true});
applyAffiliation(earlyMember,early.c[0].o[0][2].lifeAffiliation);
assert.equal(earlyMember.lifeRecord.affiliations[0].status,'active');
assert.equal(earlyDaily.show(earlyMember),true,'early members receive routines at the moving tundra camp');
assert(earlyDaily.t.includes('野営地'));
earlyMember.year=1096;earlyMember.age=21;earlyMember.res={r:'ウルサス',n:'チェルノボーグ'};
assert.equal(localEntry.show(earlyMember),false,'an existing member cannot be recruited a second time');
assert.equal(baseAssign.show(earlyMember),false,'a local role cannot precede the Chernobog incident');
earlyMember.world={events:{chernobog_incident:1096}};
assert.equal(baseAssign.show(earlyMember),true,'an early member who reaches Chernobog can take a local base role');
equalShape(baseAssign.need,['国:ウルサス','都市:チェルノボーグ']);
equalShape(oldConflict.need,['1096年のレユニオン地域網','国:ウルサス','都市:チェルノボーグ']);
equalShape(oldConflict.after,{id:'life_reunion_chernobog_base_assignment',min:0});
applyAffiliation(earlyMember,baseAssign.c[0].o[0][2].lifeAffiliation);
assert.equal(baseDaily.show(earlyMember),true,'the Chernobog outpost routines follow the assigned role');
assert.equal(earlyMember.lifeRecord.affiliations[0].role,'チェルノボーグ臨時拠点・物資配給');
earlyMember.year=1097;earlyMember.age=22;delete earlyMember.mo;
assert.equal(aftermath.show(earlyMember),false,'a monthless legacy membership record does not imply the post-crisis date');
assert.equal(earlyMember.lifeRecord.affiliations[0].status,'active','the dated gate preserves the existing Reunion affiliation');
earlyMember.mo=1;
assert.equal(aftermath.show(earlyMember),false,'the post-crisis split decision does not appear during January 1097');
earlyMember.mo=2;
assert.equal(aftermath.show(earlyMember),true,'members receive the post-crisis split decision from February 1097');
earlyMember.year=1098;earlyMember.mo=1;
assert.equal(aftermath.show(earlyMember),true,'the route remains available in January 1098');
earlyMember.year=1097;earlyMember.mo=2;
applyAffiliation(earlyMember,aftermath.c[2].o[0][2].lifeAffiliation);
assert.equal(earlyMember.lifeRecord.affiliations[0].status,'left');
assert.equal(baseDaily.show(earlyMember),false,'left members no longer receive Chernobog base routines');
earlyMember.year=1099;
assert.equal(departureLegacy.show(earlyMember),true,'the early camp and Chernobog route can leave a later-life memory after departure');

const returningMember=state({year:1098,age:22,inf:true});
addAffiliation(returningMember,'reunion-1096','事変後の小隊・見張りと避難者護衛');
assert.equal(reconnection.show(returningMember),true,'survivors can meet the reorganized movement after the Chernobog route');
applyAffiliation(returningMember,reconnection.c[0].o[0][2]);
equalShape(returningMember.lifeRecord.affiliations.map(row=>[row.id,row.status]),[['reunion-1096','left'],['reunion-reorg','active']],'joining the new network closes the previous unit before starting the new affiliation');
assert.equal(movementJoin.show({...returningMember,year:1101}),true,'the new base route accepts both local-contact and survivor-reconnection entrants');
const pausedMember=addAffiliation(state({year:1098,age:22,inf:true}),'reunion-1096','活動休止・個人連絡のみ','suspended');
assert.equal(reconnection.show(pausedMember),true,'a survivor who paused armed work can still choose the reorganized aid network');
assert.equal(reconnection.need,undefined,'the generic active-member tag must not exclude a paused old-unit member');
assert.equal(eligible(reconnection,eligibilityState('active')),true,'an active survivor can reach reconnection after the split decision');
assert.equal(eligible(reconnection,eligibilityState('suspended')),true,'a paused survivor can reach reconnection after the split decision');
assert.equal(eligible(reconnection,eligibilityState('left')),false,'a former member cannot be asked to leave the old unit again');
applyAffiliation(pausedMember,reconnection.c[0].o[0][2]);
equalShape(pausedMember.lifeRecord.affiliations.map(row=>[row.id,row.status]),[['reunion-1096','left'],['reunion-reorg','active']],'the paused affiliation closes cleanly when the survivor joins the new network');

equalShape(localEntry.need,['国:ウルサス','都市:チェルノボーグ']);
assert.equal(localEntry.any,undefined,'the Chernobog route no longer opens across the entire Ursus or Lungmen region');
const localRecruitment=state({year:1096,age:19,region:'ウルサス',city:'チェルノボーグ'});
assert.equal(localEntry.show(localRecruitment),false,'the Chernobog local route waits for the actual incident');
localRecruitment.world={events:{chernobog_incident:1096}};
assert.equal(localEntry.show(localRecruitment),true,'the local recruitment route opens after the incident without personal news knowledge');
assert.equal(localEntry.c[0].show(state({inf:true})),true);
assert.equal(localEntry.c[0].show(state({inf:false})),false,'non-Infected people may help once but cannot join');
assert(localEntry.c[1].o[0][2].regionalImpact,'non-member local aid remains available');
assert.equal(contact.c[1].show(state({inf:false})),false,'non-Infected people can offer one-time help but cannot join the later Reunion network');
const oldMember=addAffiliation(state({year:1098,age:22,region:'ウルサス'}),'reunion-1096','事変後の小隊・見張りと避難者護衛');
assert.equal(contact.show(oldMember),false,'an active old unit uses the explicit reconnection decision instead of overlapping membership');

const reorgContact=addAffiliation(state({year:1101,age:23,region:'ウルサス'}),'reunion-reorg','受け渡し先の連絡係');
assert.equal(contact.show(reorgContact),false,'a reorg contact is not redundantly introduced');
assert.equal(movementJoin.show(reorgContact),true,'an Infected contact can choose to join the later movement');
assert.equal(movementJoin.show({...reorgContact,inf:false}),false,'later formal membership remains Infected-only');
assert.equal(movementJoin.after,undefined,'the later base route is available to any active reorganization member, not only the generic contact path');
assert(movementJoin.t.includes('野営地へ赴いて当番を担う'),'the route describes a posting without claiming a residential move');
assert(!movementJoin.t.includes('野営地へ移る'),'the route does not claim an unrecorded change of residence');
assert.equal(reorgTension.show(reorgContact),false,'a person with only a remote contact role is not placed in a local warehouse dispute');
const localDelivery=addAffiliation(state({year:1098,age:20}),'reunion-reorg','近隣への物資運び');
assert.equal(reorgTension.show(localDelivery),true,'the shortage dispute reaches an active local delivery role');
const crisisLedger=addAffiliation(state({year:1099,age:21}),'reunion-reorg','配給記録・照会','crisis');
assert.equal(reorgCrisisReview.show(crisisLedger),true,'the ledger review follows the recorded internal crisis role');
crisisLedger.lifeRecord.affiliations[0].role='臨時連絡先';
assert.equal(reorgCrisisReview.show(crisisLedger),false,'a crisis state without the ledger-review role cannot imply personal suspicion');
for(const [index,expected] of ['active','suspended','left'].entries()){
 const member=vm.runInNewContext(`(()=>{born({seed:871904,by:1078,region:'ウルサス'});S.year=1099;S.age=21;S.mo=3;S.res=REG.find(row=>row.n==='ウルサス');return S})()`,ctx,{timeout:30000});
 addAffiliation(member,'reunion-reorg','配給記録・照会','crisis');
 applyAffiliation(member,reorgCrisisReview.c[index].o[0][2].lifeAffiliation);
 const affiliation=member.lifeRecord.affiliations[0];
 assert.equal(affiliation.status,expected,'crisis review choice '+index+' must resolve the affiliation to its chosen state');
 assert.equal(eligible(reorgCrisisReview,member),false,'resolved crisis state must not re-open the crisis review');
 if(expected==='left')assert.equal(affiliation.episodes[0].endedYear,member.year,'leaving ends the active episode at the decision year');
 else assert.equal(affiliation.episodes[0].endedYear,null,'returning or suspending retains the current affiliation period');
}
equalShape([reorgPauseReview.after.id,reorgPauseReview.after.min],['life_reunion_reorg_crisis_review',3]);
assert.deepEqual(Array.from(reorgPauseReview.c,choice=>choice.ethics?.intent),['organization-participation','defer','withdrawal']);
const makePausedReorg=()=>vm.runInNewContext(`(()=>{born({seed:871905,by:1078,region:'ウルサス'});S.year=1099;S.age=21;S.mo=3;S.res=REG.find(row=>row.n==='ウルサス');applyLifeAffiliation({id:'reunion-reorg',title:'再編後レユニオンに連なる互助連絡網',action:'join',role:'配給記録・照会'});applyLifeAffiliation({id:'reunion-reorg',action:'crisis'});applyLifeGoal({id:'reunion-relief',title:'近隣の感染者世帯へ物資を届ける',priority:'互助',action:'start'});applyLifeGoal({id:'reunion-relief',action:'pause'});applyLifeAffiliation({id:'reunion-reorg',action:'suspend',note:'内部対立の間は定期当番を休止'});S.sn.life_reunion_reorg_crisis_review=1099;return S})()`,ctx,{timeout:30000});
const pausedReorg=makePausedReorg();pausedReorg.year=1101;pausedReorg.age=23;assert.equal(eligible(reorgPauseReview,pausedReorg),false,'a paused member cannot review before three years');pausedReorg.year=1102;pausedReorg.age=24;assert.equal(eligible(reorgPauseReview,pausedReorg),true,'a paused member can review after three years');
for(const [index,expected] of ['active','suspended','left'].entries()){
 const member=JSON.parse(JSON.stringify(pausedReorg));ctx.__state=member;ctx.__effect=reorgPauseReview.c[index].o[0][2];vm.runInNewContext('S=__state;ap(__effect)',ctx,{timeout:30000});const affiliation=member.lifeRecord.affiliations.find(row=>row.id==='reunion-reorg');assert.equal(affiliation.status,expected,'paused-member review choice '+index+' must reach the selected state');assert.equal(member.lifeRecord.goals.find(row=>row.id==='reunion-relief').status,['active','paused','abandoned'][index]);assert.deepEqual(Array.from(vm.runInNewContext('auditLifeState(__state)',Object.assign(ctx,{__state:member}))),[]);if(expected==='suspended'){member.sn.life_reunion_reorg_pause_review=member.year;member.year+=3;member.age+=3;assert.equal(eligible(reorgPauseReview,member),true,'continuing the pause can be reviewed again after three years');}else assert.equal(eligible(reorgPauseReview,member),false,'resolved membership cannot see another pause review');
}
equalShape(movementJoin.ge,{year:1101,age:18});
assert(movementJoin.references.includes('SRC_REUNION_REFORM'));
assert(movementJoin.references.includes('SRC_REUNION_BORDER_CAMP'));
const originalResidence=reorgContact.res;
applyAffiliation(reorgContact,movementJoin.c[0].o[0][2].lifeAffiliation);
assert.equal(reorgContact.lifeRecord.affiliations[0].role,'国境野営地・食料と医薬品の配給');
assert.equal(reorgContact.res,originalResidence,'temporary camp assignment is stored as an affiliation, not a fabricated city residence');
assert.equal(campDaily.show(reorgContact),true,'border settlement members receive farm and medicine routines');
assert.equal(refugees.show(reorgContact),true,'the far-north refugee arrival reaches the camp');
assert.equal(relocation.show(reorgContact),true,'camp members can choose whether to move toward St. Grypherburg');
assert(campDaily.t.includes('畑'));
assert(campDaily.t.includes('抑制剤'));
assert(refugees.t.includes('北方の鉱区'));

applyAffiliation(reorgContact,relocation.c[0].o[0][2].lifeAffiliation);
assert.equal(campDaily.show(reorgContact),false,'the moving column no longer receives the farm settlement routine');
assert.equal(movingDaily.show(reorgContact),true,'the moved member receives route and supply events');
assert.equal(reorgContact.lifeRecord.affiliations[0].role,'移動隊・サンクト・グリファーブルクへの連絡と補給');

const staying=addAffiliation(state({year:1101,age:26}), 'reunion-reorg','国境野営地・食料と医薬品の配給');
applyAffiliation(staying,relocation.c[1].o[0][2].lifeAffiliation);
assert.equal(campDaily.show(staying),true,'staying retains the local settlement life');
assert.equal(movingDaily.show(staying),false);
const leaving=addAffiliation(state({year:1101,age:26}), 'reunion-reorg','受け渡し先の連絡係');
applyAffiliation(leaving,movementJoin.c[0].o[0][2].lifeAffiliation);
applyAffiliation(leaving,relocation.c[2].o[0][2].lifeAffiliation);
assert.equal(leaving.lifeRecord.affiliations[0].status,'left');
assert.equal(campDaily.show(leaving),false,'leaving closes the camp route');
leaving.year=1103;
assert.equal(departureLegacy.show(leaving),true,'a later camp assignment remains eligible for afterlife followup when it was not the original affiliation role');

console.log(JSON.stringify({passed:true,earlyMutualAid:true,infectedMembershipGate:true,chernobogBaseAndSplit:true,reunionReformAndCamp:true,reorgPauseReview:true,refugeeAndRelocationBranches:true,residencePreserved:true},null,2));
