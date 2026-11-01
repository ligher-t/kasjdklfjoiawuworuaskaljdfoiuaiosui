'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),document={currentScript:null,getElementById(){return{hidden:false,textContent:'',value:'',dataset:{},innerHTML:'',insertAdjacentHTML(){}}},querySelectorAll(){return[]}};
const context={window:{},document,console,localStorage:{getItem(){return null},setItem(){}},Date,setTimeout(){},setInterval(){}};
vm.runInNewContext(require('../tools/runtime.cjs').readData(root),context,{timeout:15000});
vm.runInNewContext(require('../tools/runtime.cjs').readEngine(root).split('/* ===== UI ===== */')[0],context,{timeout:15000});context.rd=()=>{};
const event=id=>context.window.GAME_DATA.EV.find(row=>row.id===id),review=event('life_ursus_student_assembly_pause_review'),later=event('life_ursus_student_assembly_later');
assert(review,'student reentry review event missing');assert.equal(review.c.length,3);assert.equal(review.once,undefined,'continued suspension can be reviewed again');assert.equal(review.cd,3);assert.equal(review.after.id,'life_ursus_student_assembly_protest');assert.equal(review.after.min,4);
assert.deepEqual(Array.from(review.c,choice=>choice.ethics?.intent),['organization-participation','defer','withdrawal']);assert(review.c.every(choice=>choice.ethics?.reviewed&&choice.ethics.policyVersion===87));
assert.match(review.c[0].o[0][1],/以前の知人一人に短い便りを送った。返事を待ちながら/,'the protagonist sends a letter and waits for a reply');
assert.doesNotMatch(review.c[0].o[0][1],/返事が届いた|返事をした/,'the event must not invent a reply from the former student');
const expectedAffiliation=['active','suspended','left'],expectedGoal=['active','paused','abandoned'],results=[];
for(let index=0;index<review.c.length;index++){
 const outcome=review.c[index].o[0][2];
 const state=vm.runInNewContext(String.raw`(()=>{
  born({seed:870088,by:1082,region:'ウルサス'});S.age=20;S.year=1102;
  const id='ursus-student-assembly',title='サンクト・グリファーブルク学生連合とのつながり';
  applyLifeAffiliation({id,title,kind:'community',action:'join',role:'抗議の準備を手伝う学生'});
  applyLifeAffiliation({id,action:'suspend',note:'拘束後の治療と休息'});
  applyLifeGoal({id,title,action:'start'});applyLifeGoal({id,action:'pause',note:'拘束後の治療と休息'});
  const row=EV.find(item=>item.id==='life_ursus_student_assembly_pause_review');S.year=1105;S.age=23;const savedAffiliations=S.lifeRecord.affiliations,affiliationRow=savedAffiliations.find(item=>item.id===id);S.lifeRecord.affiliations=[];const noAffiliationHidden=!row.show(S);S.lifeRecord.affiliations=savedAffiliations;affiliationRow.status='active';const activeHidden=!row.show(S);affiliationRow.status='suspended';
  S.year=1104;S.age=22;const tooEarly=!row.show(S);S.year=1105;S.age=23;const available=row.show(S);
  const fx=${JSON.stringify(outcome)};applyLifeAffiliation(fx.lifeAffiliation);applyLifeGoal(fx.lifeGoal);S.fl={...S.fl,...fx.fl};
  const affiliation=S.lifeRecord.affiliations.find(item=>item.id===id),goal=S.lifeRecord.goals.find(item=>item.id===id),next=EV.find(item=>item.id==='life_ursus_student_assembly_later');
  const at1107=(S.year=1107,S.age=25,row.show(S));const afterReview=(S.year=1108,S.age=26,row.show(S));
  return {noAffiliationHidden,activeHidden,tooEarly,available,affiliation,goal,flag:S.fl.ursus_student_assembly_active??0,laterGate:next.need.includes('ursus_student_assembly_active'),at1107,afterReview,audit:auditLifeState(S)};
 })()`,context,{timeout:30000});
 assert(state.noAffiliationHidden&&state.activeHidden,'only a currently suspended participant may review reentry');assert(state.tooEarly,'reentry must wait at least three years');assert(state.available,'a suspended participant can reconsider after the waiting period');
 assert.equal(state.affiliation.status,expectedAffiliation[index]);assert.equal(state.goal.status,expectedGoal[index]);assert.deepEqual(Array.from(state.audit),[]);
 if(index===0){assert.equal(state.flag,1);assert.equal(state.laterGate,true);assert.equal(state.affiliation.episodes.at(-1).endedYear,null);assert.equal(state.afterReview,false,'return hides the suspension review');}
 if(index===1){assert.equal(state.flag,0);assert.equal(state.at1107,false,'repeat review observes the new three-year interval');assert.equal(state.afterReview,true,'continued suspension can be reviewed again after three years');assert.equal(state.affiliation.episodes.at(-1).endedYear,null);}
 if(index===2){assert.equal(state.flag,0);assert.equal(state.affiliation.episodes.at(-1).endedYear,1105);assert.equal(state.afterReview,false,'leaving removes eligibility for another review');}
 results.push({status:state.affiliation.status,goal:state.goal.status,activeFlag:state.flag});
}
const release=event('life_ursus_student_assembly_release'),protest=event('life_ursus_student_assembly_protest');
assert.equal(release.c[0].o[0][2].lifeAffiliation.action,'return','release with ongoing contact must resolve the prior crisis status');
assert.equal(later.after.id,'life_ursus_student_assembly_protest','the long-term review must include participants who were not detained');assert.equal(later.after.min,6);
const releasedState=vm.runInNewContext(String.raw`(()=>{
 born({seed:870089,by:1084,region:'ウルサス'});S.year=1101;S.age=17;
 const id='ursus-student-assembly',title='サンクト・グリファーブルク学生連合とのつながり';
 applyLifeAffiliation({id,title,kind:'community',action:'join',role:'抗議の準備を手伝う学生'});
 applyLifeGoal({id,title,action:'start'});
 const protest=EV.find(item=>item.id==='life_ursus_student_assembly_protest').c[0].o[0][2];
 applyLifeAffiliation(protest.lifeAffiliation);applyLifeGoal(protest.lifeGoal);S.fl={...S.fl,...protest.fl};S.sn.life_ursus_student_assembly_protest=1101;
 const detention=EV.find(item=>item.id==='life_ursus_katorga_life');S.year=1102;S.age=18;S.sn[detention.id]=1102;
 const release=EV.find(item=>item.id==='life_ursus_student_assembly_release').c[0].o[0][2];
 applyLifeAffiliation(release.lifeAffiliation);applyLifeGoal(release.lifeGoal);S.fl={...S.fl,...release.fl};S.sn.life_ursus_student_assembly_release=1102;
 const affiliation=S.lifeRecord.affiliations.find(item=>item.id===id);S.year=1107;S.age=23;
 return {affiliation,activeFlag:S.fl.ursus_student_assembly_active,laterEligible:elig(EV.find(item=>item.id==='life_ursus_student_assembly_later'),S,tags(S)),audit:auditLifeState(S)};
})()`,context,{timeout:30000});
assert.equal(releasedState.affiliation.status,'active','continued post-release contact must no longer be recorded as an unresolved crisis');
assert.equal(releasedState.affiliation.role,'解放後の限定的な連絡役');
assert.equal(releasedState.affiliation.episodes.length,1,'return resumes the same affiliation period without fabricating a second membership');
assert.equal(releasedState.affiliation.episodes[0].endedYear,null);
assert.equal(releasedState.activeFlag,1);
assert.equal(releasedState.laterEligible,true,'the released participant can reach the later-life continuation event after its five-year gate');
assert.deepEqual(Array.from(releasedState.audit),[]);
const nonDetainedState=vm.runInNewContext(String.raw`(()=>{
 born({seed:870090,by:1084,region:'ウルサス'});S.year=1101;S.age=17;
 const id='ursus-student-assembly',title='サンクト・グリファーブルク学生連合とのつながり';
 applyLifeAffiliation({id,title,kind:'community',action:'join',role:'抗議の準備を手伝う学生'});applyLifeGoal({id,title,action:'start'});
 const protest=EV.find(item=>item.id==='life_ursus_student_assembly_protest'),pause=protest.c[2].o[0][2];
 applyLifeAffiliation(pause.lifeAffiliation);applyLifeGoal(pause.lifeGoal);S.fl={...S.fl,...pause.fl};S.sn[protest.id]=1101;
 const release=EV.find(item=>item.id==='life_ursus_student_assembly_release');S.year=1104;S.age=20;
 const noDetentionRelease=!elig(release,S,tags(S)),beforeReview=!elig(EV.find(item=>item.id==='life_ursus_student_assembly_pause_review'),S,tags(S));
 S.year=1105;S.age=21;const review=EV.find(item=>item.id==='life_ursus_student_assembly_pause_review');
 const reviewAvailable=elig(review,S,tags(S)),resume=review.c[0].o[0][2];
 applyLifeAffiliation(resume.lifeAffiliation);applyLifeGoal(resume.lifeGoal);S.fl={...S.fl,...resume.fl};
 S.year=1107;S.age=23;
 return {noDetentionRelease,beforeReview,reviewAvailable,affiliation:S.lifeRecord.affiliations.find(item=>item.id===id),laterEligible:elig(EV.find(item=>item.id==='life_ursus_student_assembly_later'),S,tags(S)),hasKatorgaRecord:Number.isInteger(S.sn.life_ursus_student_assembly_release),audit:auditLifeState(S)};
})()`,context,{timeout:30000});
assert(nonDetainedState.noDetentionRelease,'a participant who avoided detention cannot receive the Katorga release event');
assert(nonDetainedState.beforeReview,'the suspended participant cannot review the route before the four-year gate');
assert(nonDetainedState.reviewAvailable,'the suspended participant can review after the protest anniversary without a detention/release record');
assert.equal(nonDetainedState.affiliation.status,'active','choosing to return reopens the suspended affiliation');
assert.equal(nonDetainedState.laterEligible,true,'a non-detained participant can reach the six-year later-life review after returning');
assert.equal(nonDetainedState.hasKatorgaRecord,false,'the non-detained route does not fabricate a Katorga release event');
assert.deepEqual(Array.from(nonDetainedState.audit),[]);
console.log(JSON.stringify({passed:true,reviewedChoices:review.c.length,reviewAfterThreeYears:true,resumePauseAndExitConsistent:true,releaseResolvesCrisis:true,nonDetainedSuspensionCanResume:true,laterLifeGateCoversBothBranches:true,returnReachesExistingLaterGate:true,results},null,2));
