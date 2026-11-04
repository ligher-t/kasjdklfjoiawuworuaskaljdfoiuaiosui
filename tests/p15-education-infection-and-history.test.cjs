'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const run=fn=>JSON.parse(vm.runInContext(
  'JSON.stringify(('+fn.toString()+')())',ctx,{timeout:20000}));
function enrolled(id,region,stage,seed){
  setup(ctx,{id:'p15-'+id,region,seed,age:17});
  ctx.P15_DISCLOSE={id,region,stage};
  return run(function(){
    const s=S,f=P15_DISCLOSE;
    s.age=17;s.year=1094;s.by=1077;s.mo=4;
    s.res=REG.find(x=>x.n===f.region);
    s.home='固定集落';
    s.local={kind:'固定都市の街区',city:null,
      placeId:'p15-'+f.id+'-fixed-city',districtId:'p15-'+f.id,
      access:0.95,hazard:0};
    s.cash=1500000;
    ensureResidenceIdentity(s);
    const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld,
      inst=educationRegisterInstitution(w,area,'p15-'+f.id+'-school',
        'general_'+f.stage,[f.stage],s.year),
      offer=w.offerings[inst.offeringIds[0]];
    educationStart(s,f.stage,1,'signed-verified-enrollment-'+f.id);
    s.educationPath.institutionId=inst.id;
    s.educationPath.campusId=offer.campusId;
    s.educationPath.offeringId=offer.id;
    const enrollment=s.educationRecord.enrollments.at(-1);
    educationBindFormalEnrollment(s,enrollment.id);
    const people=educationEnsureEnrolledSchoolPeople(s,enrollment.id);
    s.inf=1;s.fl.dg=1;
    return {institutionId:inst.id,offeringId:offer.id,
      enrollmentId:enrollment.id,people};
  });
}

// D15: a diagnosis is a private fact until a recipient-specific receipt exists.
const d15school=enrolled('D15','ウルサス','lower',150115);
const d15=run(function(){
  const s=S,id=s.educationPath.institutionId,
    people=educationEnsureEnrolledSchoolPeople(s,s.educationPath.currentEnrollmentId);
  const before=educationRecipientInfectionKnowledge(s,{
    institutionId:id,recipientKind:'institution'}).status;
  const teacher=educationRecipientInfectionKnowledge(s,{
    institutionId:id,recipientKind:'teacher',personId:people.teacherPersonId}).status;
  const known=educationSchoolKnowsInfection(s,'lower');
  const barrier=educationBarrier(s,'lower');
  educationEnforceAccess(s);
  return {before,teacher,known,allowed:barrier.allowed,
    status:s.educationPath.status,
    diagnosis:s.inf===1&&s.fl.dg===1,
    notices:Object.keys(s.educationDisclosureReceipts?.items||{}).length,
    issues:educationAccessIdentityInvariants(s)};
});
assert.equal(d15.before,'unaware');
assert.equal(d15.teacher,'unaware');
assert.equal(d15.known,false);
assert.equal(d15.allowed,true);
assert.equal(d15.status,'enrolled');
assert.equal(d15.diagnosis,true);
assert.equal(d15.notices,0);
assert.deepEqual(d15.issues,[]);

// D16: disclosure to one teacher does not become institutional or peer knowledge.
const d16school=enrolled('D16','ヴィクトリア','upper',150116);
const d16=run(function(){
  const s=S,id=s.educationPath.institutionId,
    people=educationEnsureEnrolledSchoolPeople(s,s.educationPath.currentEnrollmentId);
  const args={institutionId:id,recipientKind:'teacher',
    personId:people.teacherPersonId,certainty:'confirmed',
    source:'self-disclosure',consent:'voluntary',
    evidenceRef:'p15-D16-private-teacher-consultation'};
  const first=educationRecordSchoolDisclosure(s,args);
  const again=educationRecordSchoolDisclosure(s,args);
  const teacher=educationRecipientInfectionKnowledge(s,{
    institutionId:id,recipientKind:'teacher',personId:people.teacherPersonId}).status;
  const office=educationRecipientInfectionKnowledge(s,{
    institutionId:id,recipientKind:'institution'}).status;
  const peer=educationRecipientInfectionKnowledge(s,{
    institutionId:id,recipientKind:'peer',personId:people.peerPersonIds[0]}).status;
  educationEnforceAccess(s);
  return {teacher,office,peer,duplicate:first.sourceEventId===again.sourceEventId,
    recordCount:Object.keys(s.educationDisclosureReceipts?.items||{}).length,
    knownBySchool:educationSchoolKnowsInfection(s,'upper'),
    stillEnrolled:s.educationPath.status==='enrolled',
    issues:educationAccessIdentityInvariants(s)};
});
assert.equal(d16.teacher,'individual-confirmed');
assert.equal(d16.office,'unaware');
assert.equal(d16.peer,'unaware');
assert.equal(d16.duplicate,true);
assert.equal(d16.recordCount,1);
assert.equal(d16.knownBySchool,false);
assert.equal(d16.stillEnrolled,true);
assert.deepEqual(d16.issues,[]);

// D21-D23: dates and location keys scope a crisis to named schools.
// A modeled direct/indirect incident has a persistent campus-specific identity.
function makeHistoryState(region,city,year,seed,kind='移動都市の居住区'){
  return {randomSeed:seed,world:{events:{}},year,mo:11,age:18,
    res:{n:region},home:'移動都市',
    local:{kind,city,placeId:'city:'+region+':'+city,
      districtId:'p15-historic:'+city}};
}
setup(ctx,{id:'p15-history-runtime',region:'ウルサス',seed:150121,age:18});
const history=JSON.parse(vm.runInContext('JSON.stringify((()=>{'+makeHistoryState.toString()+';return ('+(function(){
  const outcomes={};
  // D21: civil-war metadata by itself cannot destroy every school in Kazdel.
  {
    const s=makeHistoryState('カズデル','カズデル辺境',1093,150121,
      '辺境・移動の多い居住地');
    const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld,
      ins=educationRegisterInstitution(w,area,'p15-D21-school','general_primary',
        ['primary'],1085),off=w.offerings[ins.offeringIds[0]];
    s.mo=12;
    educationReconcileWorldAt(s,1093,12);
    const before=educationSchoolStatusAt(s,off.id,1093,12);
    const withoutEvidence=w.operationalHistory.filter(x=>
      x.campusId===off.campusId && x.eventRef==='kazdel_civil_war');
    w.campuses[off.campusId].exposureTags=[
      ...(w.campuses[off.campusId].exposureTags||[]),
      'kazdel_civil_war:confirmed-exposure'
    ];
    educationReconcileWorldAt(s,1093,12);
    const withEvidence=w.operationalHistory.filter(x=>
      x.campusId===off.campusId && x.eventRef==='kazdel_civil_war');
    const repeated=educationReconcileWorldAt(s,1093,12);
    outcomes.d21={area,wasUnverified:withoutEvidence.length===0,
      gainedEvidence:withEvidence.length===1,repeat:repeated===0,
      beforeWasNotAutomaticallyDestroyed:before.campusStatus!=='destroyed',
      evidenceCampusId:withEvidence[0]?.campusId===off.campusId,
      worldAlive:!!w.offerings[off.id]};
  }
  // D22/D23: explicit city direct windows, other city indirect, no all-region blast.
  const assess=(region,targetCity,otherCity,year,month,tag,seed,win,indirectRef)=>{
    const s=makeHistoryState(region,targetCity,year,seed);
    s.mo=month-1;
    let targetArea=ensureEducationWorldForResidence(s),w=s.world.educationWorld;
    const target=educationRegisterInstitution(w,targetArea,'p15-'+tag+'-target',
      'general_lower',['lower'],year),
      targetOff=w.offerings[target.offeringIds[0]];
    s.local={kind:'移動都市の居住区',city:otherCity,
      placeId:'city:'+region+':'+otherCity,districtId:'p15-'+tag+'-other'};
    const otherArea=ensureEducationWorldForResidence(s),
      other=educationRegisterInstitution(w,otherArea,'p15-'+tag+'-other',
        'general_lower',['lower'],year),
      otherOff=w.offerings[other.offeringIds[0]];
    s.mo=month;
    const newRecords=educationReconcileWorldAt(s,year,month);
    const again=educationReconcileWorldAt(s,year,month);
    const direct=w.operationalHistory.filter(x=>
      x.eventRef===win+'-direct'&&x.campusId===targetOff.campusId),
      wronglyDirect=w.operationalHistory.filter(x=>
      x.eventRef===win+'-direct'&&x.campusId===otherOff.campusId);
    const indirect=w.operationalHistory.filter(x=>
      x.eventRef===indirectRef&&x.campusId===otherOff.campusId);
    const historySnapshot=JSON.stringify(w.operationalHistory);
    const next=educationSchoolStatusAt(s,targetOff.id,year,month);
    const otherStatus=educationSchoolStatusAt(s,otherOff.id,year,month);
    educationReconcileWorldAt(s,year+(month>10?1:0),month>10?2:month+2);
    const persisted=historySnapshot===JSON.stringify(w.operationalHistory);
    return {newRecords,again,directCount:direct.length,
      otherDirectCount:wronglyDirect.length,indirectCount:indirect.length,
      persisted,unchangedIDs:!!w.offerings[targetOff.id]&&!!w.offerings[otherOff.id],
      directSchool:next.campusId===targetOff.campusId,
      otherSchool:otherStatus.campusId===otherOff.campusId,
      otherNeverDestroyed:otherStatus.campusStatus!=='destroyed'};
  };
  outcomes.d22=assess('ウルサス','チェルノボーグ','別のウルサス都市',
    1096,12,'D22',150122,'chernobog','chernobog-indirect');
  outcomes.d23=assess('ヴィクトリア','ロンディニウム','ヴィクトリア別都市',
    1098,7,'D23',150123,'londinium','victoria-indirect');
  // D24: Siesta volcanic exposure requires site evidence; platform choice
  // does not transplant a school or reenroll a student automatically.
  {
    const s=makeHistoryState('シエスタ','シエスタ',1097,150124,'固定都市の街区');
    s.mo=6;
    const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld,
      inst=educationRegisterInstitution(w,area,'p15-D24-old-fixed',
        'general_upper',['upper'],s.year),
      off=w.offerings[inst.offeringIds[0]];
    const june=educationSchoolStatusAt(s,off.id,1097,6);
    s.mo=7;
    educationReconcileWorldAt(s,1097,7);
    const volcanic=w.operationalHistory.filter(x=>
      x.campusId===off.campusId&&x.eventRef==='siesta_disaster');
    s.mo=8;
    s.local={kind:'移動都市の居住区',city:'シエスタ',
      placeId:'city:シエスタ:シエスタ',districtId:'p15-D24-mobile'};
    ensureEducationWorldForResidence(s);
    educationReconcileWorldAt(s,1097,8);
    const oldPresent=!!w.offerings[off.id]&&
      w.campuses[off.campusId].educationAreaId===area;
    const noForcedTransfer=!w.operationalHistory.some(x=>
      x.campusId===off.campusId && x.eventRef==='siesta-transition');
    outcomes.d24={june:june.teachingStatus,
      volcanicRecords:volcanic.length,oldPresent,noForcedTransfer};
  }
  return outcomes;
}).toString()+')();})())',ctx,{timeout:25000}));
assert.equal(history.d21.wasUnverified,true);
assert.equal(history.d21.gainedEvidence,true);
assert.equal(history.d21.repeat,true);
assert.equal(history.d21.evidenceCampusId,true);
assert.equal(history.d21.worldAlive,true);
for(const id of ['d22','d23']){
  const row=history[id];
  assert(row.newRecords>=1,id);
  assert.equal(row.again,0,id);
  assert.equal(row.directCount,1,id);
  assert.equal(row.otherDirectCount,0,id);
  assert.equal(row.indirectCount,1,id);
  assert.equal(row.persisted,true,id);
  assert.equal(row.unchangedIDs,true,id);
  assert.equal(row.directSchool,true,id);
  assert.equal(row.otherSchool,true,id);
  assert.equal(row.otherNeverDestroyed,true,id);
}
assert.equal(history.d24.june,'teaching');
assert.equal(history.d24.volcanicRecords,0);
assert.equal(history.d24.oldPresent,true);
assert.equal(history.d24.noForcedTransfer,true);
console.log('PASS P15 D15/D16/D21/D22/D23/D24: infection knowledge isolation and evidence-scoped campus history');
