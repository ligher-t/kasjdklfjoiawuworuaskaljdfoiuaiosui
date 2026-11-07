'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const run=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx));
const cases=run(`
  born({seed:194000,by:1067,region:'龍門'});S.year=1100;S.age=33;
  const a=()=>({romance:S.romance?.stage||null,spouse:!!S.sp,
    dating:S.fl.romance_dating,committed:S.fl.romance_committed,
    cohabiting:S.fl.romance_cohabiting,
    ended:S.fl.romance_ended||0,strained:S.fl.marriage_strained||0});
  ap({romanceStart:1,fl:{romance_started:1}});
  const known=a();
  ap({romanceStage:'dating',fl:{romance_dating:1}});
  const dating=a();
  ap({romanceStage:'committed',fl:{romance_committed:1}});
  const committed=a();
  ap({romanceStage:'dating'});
  const deferred=a();
  ap({romanceStage:'cohabiting',fl:{romance_cohabiting:1}});
  const cohabiting=a();
  ap({romanceEnd:1,fl:{romance_ended:1}});
  const ended=a();
  ap({romanceStart:1});
  ap({romanceStage:'dating'});
  const newPartner=a();
  ap({sp:1});
  const married=a();
  S.fl.marriage_strained=1;
  ap({divorce:1});
  const divorced=a();
  born({seed:194001,by:1067,region:'龍門'});S.year=1100;S.age=33;
  S.fl.marriage_strained=1;S.fl.romance_committed=1;
  ap({p:1});
  const stale=a();
  const annual={year:1100,age:33,romance:{
    id:'r-annual',stage:'dating',metYear:1092,stageSinceYear:1095,
    by:1068},fl:{romance_dating:1,romance_committed:1},
    relationshipHistory:[]};
  advanceRomanceLife(annual);
  return {known,dating,committed,deferred,cohabiting,ended,newPartner,married,divorced,stale,
    annual:{active:!!annual.romance,d:annual.fl.romance_dating,c:annual.fl.romance_committed,
      history:annual.relationshipHistory.length}};
`);
assert.equal(cases.known.dating,0);
assert.deepEqual([cases.dating.dating,cases.dating.committed,cases.dating.cohabiting],[1,0,0]);
assert.deepEqual([cases.committed.dating,cases.committed.committed,cases.committed.cohabiting],[1,1,0]);
assert.deepEqual([cases.deferred.dating,cases.deferred.committed,cases.deferred.cohabiting],[1,0,0]);
assert.deepEqual([cases.cohabiting.dating,cases.cohabiting.cohabiting],[1,1]);
assert.deepEqual([cases.ended.romance,cases.ended.dating,cases.ended.committed,cases.ended.cohabiting,cases.ended.ended],[null,0,0,0,1]);
assert.deepEqual([cases.newPartner.dating,cases.newPartner.ended],[1,1],'past breakup remains history after a new partner');
assert.deepEqual([cases.married.spouse,cases.married.romance,cases.married.dating,cases.married.committed,cases.married.cohabiting],[true,null,0,0,0]);
assert.equal(cases.divorced.strained,0,'marriage strain cannot survive divorce');
assert.deepEqual([cases.stale.dating,cases.stale.committed,cases.stale.strained],[0,0,0],'stale flags are normalized on later events');
assert.deepEqual(cases.annual,{active:false,d:0,c:0,history:1});
console.log('PASS relationship active flags across dating, commitment, breakup, marriage, divorce and annual expiry');
