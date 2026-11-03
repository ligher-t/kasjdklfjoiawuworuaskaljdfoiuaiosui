'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
setup(ctx,{id:'education-operations-mobility',seed:20261104,region:'龍門',age:15});
const run=fn=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+synthetic.toString()+';return ('+fn.toString()+')();})())',ctx,{timeout:20000}));
function synthetic(region,city,year,month,seed,age=15) {
  return {randomSeed:seed,world:{events:{}},year,mo:month,age,
    care:{parentKeys:["fa"]},par:{fa:{d:0,separated:false}},
    res:{n:region},local:{city,kind:"移動都市の居住区",
      placeId:"city:"+region+":"+city,districtId:"district:1"}};
}
const campus=run(function(){
  const s=synthetic("ウルサス","チェルノボーグ",1096,11,761188);
  const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld;
  const off=Object.values(w.offerings).find(x=>x.stage==="primary");
  const before=educationSchoolStatusAt(s,off.id,1096,11);
  const early=educationReconcileWorldAt(s,1096,11);
  const applied=educationReconcileWorldAt(s,1096,12);
  const again=educationReconcileWorldAt(s,1096,12);
  const record=w.operationalHistory.find(x=>x.campusId===off.campusId&&x.eventRef==="chernobog-direct");
  s.res={n:"ヴィクトリア"};
  s.local={city:"ロンディニウム",kind:"移動都市の居住区",
    placeId:"city:ヴィクトリア:ロンディニウム",districtId:"district:2"};
  s.year=1098;s.mo=6;ensureEducationWorldForResidence(s);
  const london=Object.values(w.offerings).find(x=>x.stage==="primary" &&
    w.areas[w.campuses[x.campusId].educationAreaId]?.regionKey==="ヴィクトリア");
  const londonBefore=educationSchoolStatusAt(s,london.id,1098,6);
  const londonEarly=educationReconcileWorldAt(s,1098,6);
  const londonImpact=educationReconcileWorldAt(s,1098,7);
  return {area,early,applied,again,record,before,londonBefore,londonEarly,londonImpact,
    londonRecords:w.operationalHistory.filter(x=>x.eventRef==="londinium-direct").length};
});
assert.equal(campus.before.teachingStatus,"teaching");
assert.equal(campus.early,0);
assert(campus.applied>=1);
assert.equal(campus.again,0);
assert.equal(campus.record.effectiveFrom.year,1096);
assert.equal(campus.record.effectiveFrom.month,12);
assert.equal(campus.record.effectiveTo.year,1097);
assert.equal(campus.record.effectiveTo.month,1);
assert.equal(campus.record.basis,"simulation-school-impact");
assert.equal(campus.londonBefore.teachingStatus,"teaching");
assert(campus.londonImpact>=1);
assert(campus.londonRecords>=1);

const history=run(function(){
  const s=synthetic("ウルサス","チェルノボーグ",1100,5,998818);
  ensureEducationWorldForResidence(s);
  const w=s.world.educationWorld;
  educationReconcileWorldAt(s,1100,5);
  const old=w.operationalHistory.some(x=>x.eventRef==="chernobog-direct");
  s.res={n:"シエスタ"};
  s.local={city:"シエスタ",kind:"移動都市の居住区",
    placeId:"city:シエスタ:シエスタ",districtId:"district:4"};
  s.year=1097;s.mo=6;ensureEducationWorldForResidence(s);
  const ids=Object.values(w.campuses).filter(x=>w.areas[x.educationAreaId].regionKey==="シエスタ").map(x=>x.id);
  const prior=ids.map(id=>JSON.stringify(w.campuses[id]));
  const before=educationReconcileWorldAt(s,1097,6);
  const eruption=educationReconcileWorldAt(s,1097,7);
  const mobile=educationReconcileWorldAt(s,1097,8);
  return {old,before,eruption,mobile,same:prior.every((x,i)=>x===JSON.stringify(w.campuses[ids[i]]))};
});
assert.equal(history.old,false);
assert.equal(history.before,0);
assert.equal(history.eruption,0);
assert.equal(history.mobile,0);
assert.equal(history.same,true);

const independent=run(function(){
  const s=synthetic("龍門","龍門",1101,4,771233,24);
  const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld;
  const off=Object.values(w.offerings).find(x=>x.stage==="primary"&&
    w.campuses[x.campusId].educationAreaId===area);
  const action={effectId:"edu-action:selective-admission-1",
    campusId:off.campusId,institutionId:off.institutionId,offeringId:off.id,
    effectiveFrom:{year:1101,month:4},basis:"explicit-simulation-site-action",
    sourceRef:"test-authorized-action",approved:true,next:{admission:"suspended"}};
  const recorded=educationRecordSchoolAction(s,action);
  const repeat=educationRecordSchoolAction(s,action);
  const current=educationSchoolStatusAt(s,off.id,1101,4);
  const earlier=educationSchoolStatusAt(s,off.id,1101,3);
  const other=Object.values(w.offerings).find(x=>x.institutionId===off.institutionId&&x.id!==off.id);
  return {same:recorded.effectId===repeat.effectId,current,earlier,
    sibling:other?educationSchoolStatusAt(s,other.id,1101,4):null,records:w.operationalHistory.length};
});
assert.equal(independent.current.admissionStatus,"suspended");
assert.equal(independent.current.teachingStatus,"teaching");
assert.equal(independent.earlier.admissionStatus,"open");
if(independent.sibling)assert.equal(independent.sibling.admissionStatus,"open");
assert.equal(independent.same,true);
assert.equal(independent.records,1);

const routes=run(function(){
  const s=synthetic("龍門","龍門",1101,3,421210,8);
  const here=ensureEducationWorldForResidence(s);
  educationCreateMobilityState(s);
  const w=s.world.educationWorld;
  const off=Object.values(w.offerings).find(x=>x.stage==="primary" &&
    w.campuses[x.campusId].educationAreaId===here);
  const params={personId:"protagonist",institutionId:off.institutionId,
    campusId:off.campusId,offeringId:off.id,year:1101,month:3,purpose:"daily-commute"};
  const before=educationCanReach(s,params);
  const unchangedBefore=JSON.stringify(s);
  const repeated=educationCanReach(s,params);
  const pure=unchangedBefore===JSON.stringify(s);
  s.educationMobility.escortRecords["escort-fa"]={personId:"protagonist",
    institutionId:off.institutionId,purpose:"daily-commute",
    escortPersonId:"fa",evidenceRef:"escort-confirmed",status:"verified",
    validFrom:{year:1101,month:1},validThrough:{year:1101,month:12}};
  const escorted=educationCanReach(s,params);
  const adjacent=w.hubs[w.areas[here].educationHubId].areaIds.find(x=>x!==here);
  s.local.educationAreaId=adjacent;
  for(const id of Object.keys(w.transportLinks))delete w.transportLinks[id];
  const missing=educationCanReach(s,params);
  const id=educationLinkId(adjacent,here,"urban-transit");
  const [a,b]=[adjacent,here].sort();
  w.transportLinks[id]={id,endpointAreaIds:[a,b],routeKind:"urban-transit",
    travelMinutesAB:64,travelMinutesBA:65,transferWaitMinutes:2,
    riskScore:0.05,accessibility:["step-free"],accessibilityKnown:true,
    directionalAccess:{[a]:true,[b]:true},statusHistory:[]};
  s.age=20;
  const daily=educationCanReach(s,params);
  const exam=educationCanReach(s,{...params,purpose:"exam-visit"});
  const boarding=educationCanReach(s,{...params,purpose:"boarding-move"});
  w.transportLinks[id].directionalAccess[here]=false;
  const returnBlocked=educationCanReach(s,{...params,purpose:"exam-visit"});
  const unknown=educationCanReach(s,{...params,personId:"unknown-child"});
  return {before,repeated,pure,escorted,missing,daily,exam,boarding,returnBlocked,unknown};
});
assert(routes.before.reasonCodes.includes("escort-required"));
assert.equal(routes.pure,true);
assert.deepEqual(routes.before,routes.repeated);
assert.equal(routes.escorted.status,"feasible");
assert(routes.missing.reasonCodes.includes("no-active-link"));
assert(routes.daily.reasonCodes.includes("time-limit-exceeded"));
assert.equal(routes.exam.status,"feasible");
assert(routes.boarding.reasonCodes.includes("residence-offer-unconfirmed"));
assert(routes.returnBlocked.reasonCodes.includes("no-return-service"));
assert(routes.unknown.reasonCodes.includes("unknown-person"));

const guardians=run(function(){
  const s=synthetic("龍門","龍門",1101,4,99110,15);
  const area=ensureEducationWorldForResidence(s);
  educationCreateMobilityState(s);
  const w=s.world.educationWorld;
  const off=Object.values(w.offerings).find(x=>x.stage==="primary" &&
    w.campuses[x.campusId].educationAreaId===area);
  const params={personId:"protagonist",institutionId:off.institutionId,
    campusId:off.campusId,offeringId:off.id,year:1101,month:4,
    purpose:"boarding-move",residenceOfferId:"dorm-1"};
  s.educationMobility.residenceOffers["dorm-1"]={
    id:"dorm-1",approved:true,evidenceRef:"dorm-acceptance",
    campusId:off.campusId,areaId:area,capacityRemaining:1};
  const pending=educationCanReach(s,params);
  s.educationMobility.consentRecords["parent-yes"]={
    personId:"protagonist",purpose:"boarding-move",institutionId:off.institutionId,
    consenterPersonId:"fa",evidenceRef:"signed-school-consent",consentState:"granted",
    validFrom:{year:1101,month:1},validThrough:{year:1101,month:12}};
  const accepted=educationCanReach(s,params);
  s.educationMobility.consentRecords["parent-yes"].consentState="refused";
  const refused=educationCanReach(s,params);
  return {pending,accepted,refused,contracts:Object.keys(s.educationMobility.residenceContracts).length};
});
assert(guardians.pending.reasonCodes.includes("guardian-consent-pending"));
assert.equal(guardians.accepted.status,"feasible");
assert(guardians.refused.reasonCodes.includes("guardian-consent-refused"));
assert.equal(guardians.contracts,0);
console.log("PASS P05/P08 education campus chronology, routing and guardians");
